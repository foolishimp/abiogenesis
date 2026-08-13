import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  projectArtifactTruth,
  projectExactPrefixArtifactTruth,
  type ExactPrefixArtifactTruthProjectionRefusalCode,
} from "./artifact_truth.js";
import {
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  projectFhEffectfulPublicInvocationFacts,
} from "./fh_continuation_projection.js";
import {
  projectExactRunInvocationFactsAtPrefix,
} from "./invocation_execution_truth.js";

type ExplicitInvocationTruthPrefix =
  | DurablePrefixCoordinate
  | ValidatedRuntimeEventPrefix;

export interface EffectfulPublicInvocationPriorAdmission {
  readonly operationId:
    | "abg.operation.product.install"
    | "abg.operation.workspace.bind"
    | "abg.operation.run.invoke"
    | "abg.operation.interaction.respond"
    | "abg.operation.run.continue";
  readonly publicInvocationRef: string;
  readonly ownerInvocationRef: string;
  readonly ownerInvocationDigest: Sha256Digest;
  readonly publicOperationEventRef: string;
  readonly admissionEventRef: string;
}

export type EffectfulPublicInvocationTruth =
  | Readonly<{
      kind: "effectful_public_invocation_truth";
      schemaVersion: "5.0.0";
      disposition: "available";
      invocationRef: string;
      prefix: ExplicitInvocationTruthPrefix;
    }>
  | Readonly<{
      kind: "effectful_public_invocation_truth";
      schemaVersion: "5.0.0";
      disposition: "duplicate";
      invocationRef: string;
      prefix: ExplicitInvocationTruthPrefix;
      priorAdmission: EffectfulPublicInvocationPriorAdmission;
    }>
  | Readonly<{
      kind: "effectful_public_invocation_truth_invalid_history";
      schemaVersion: "5.0.0";
      disposition: "invalid_history";
      code:
        | "artifact_truth_invalid"
        | "duplicate_outer_invocation"
        | "invocation_pair_invalid"
        | "prefix_invalid";
      invocationRef: string;
      prefix: ExplicitInvocationTruthPrefix;
      eventRefs: readonly string[];
      artifactTruthCode: ExactPrefixArtifactTruthProjectionRefusalCode | null;
    }>;

function invalidHistory(
  prefix: ExplicitInvocationTruthPrefix,
  invocationRef: string,
  code: Extract<
    EffectfulPublicInvocationTruth,
    { readonly disposition: "invalid_history" }
  >["code"],
  eventRefs: readonly string[] = [],
  artifactTruthCode: ExactPrefixArtifactTruthProjectionRefusalCode | null = null,
): EffectfulPublicInvocationTruth {
  return deepFreeze({
    kind: "effectful_public_invocation_truth_invalid_history" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "invalid_history" as const,
    code,
    invocationRef,
    prefix,
    eventRefs: [...new Set(eventRefs)].sort(),
    artifactTruthCode,
  });
}

export function projectEffectfulPublicInvocationTruthAtPrefix(
  prefix: ExplicitInvocationTruthPrefix,
  invocationRef: string,
): EffectfulPublicInvocationTruth {
  let events: readonly RuntimeEvent[];
  let artifactRows: readonly Readonly<{
    operationId: string;
    invocationRef: string;
    invocationDigest: string;
    admissionEventRef: string;
  }>[];
  if (prefix.kind === "validated_runtime_event_prefix") {
    try {
      events = runtimeEventsFromValidatedPrefix(prefix);
      artifactRows = projectArtifactTruth(prefix).artifacts;
    } catch {
      return invalidHistory(
        prefix,
        invocationRef,
        "artifact_truth_invalid",
      );
    }
  } else {
    try {
      events = runtimeEventsFromValidatedPrefix(
        selectValidatedRuntimeEventPrefix(
          readRuntimeEventsAtDurablePrefix(prefix),
        ),
      );
    } catch {
      return invalidHistory(prefix, invocationRef, "prefix_invalid");
    }
    const artifactTruth = projectExactPrefixArtifactTruth(prefix);
    if (
      artifactTruth.kind ===
        "exact_prefix_artifact_truth_projection_refusal"
    ) {
      return invalidHistory(
        prefix,
        invocationRef,
        "artifact_truth_invalid",
        artifactTruth.eventRefs,
        artifactTruth.code,
      );
    }
    artifactRows = artifactTruth.rows;
  }
  const facts: EffectfulPublicInvocationPriorAdmission[] =
    artifactRows.map((row) => deepFreeze({
      operationId: row.operationId as
        | "abg.operation.product.install"
        | "abg.operation.workspace.bind",
      publicInvocationRef: row.invocationRef,
      ownerInvocationRef: row.invocationRef,
      ownerInvocationDigest: row.invocationDigest as Sha256Digest,
      publicOperationEventRef: row.admissionEventRef,
      admissionEventRef: row.admissionEventRef,
    }));
  const validatedPrefix = prefix.kind === "validated_runtime_event_prefix"
    ? prefix
    : selectValidatedRuntimeEventPrefix(events);
  const runFacts = projectExactRunInvocationFactsAtPrefix(
    validatedPrefix,
  );
  if (runFacts.disposition === "invalid_history") {
    return invalidHistory(
      prefix,
      invocationRef,
      "invocation_pair_invalid",
      runFacts.eventRefs,
    );
  }
  facts.push(...runFacts.facts);
  const continuationFacts = projectFhEffectfulPublicInvocationFacts(
    validatedPrefix,
  );
  if (continuationFacts.disposition === "invalid_history") {
    return invalidHistory(
      prefix,
      invocationRef,
      "invocation_pair_invalid",
      continuationFacts.eventRefs,
    );
  }
  facts.push(...continuationFacts.facts);
  const byPublicRef = new Map<string, EffectfulPublicInvocationPriorAdmission[]>();
  for (const fact of facts) {
    const held = byPublicRef.get(fact.publicInvocationRef) ?? [];
    held.push(fact);
    byPublicRef.set(fact.publicInvocationRef, held);
  }
  const ambiguous = [...byPublicRef.entries()].find(([, held]) => held.length !== 1);
  if (ambiguous !== undefined) {
    return invalidHistory(
      prefix,
      invocationRef,
      "duplicate_outer_invocation",
      ambiguous[1].flatMap((fact) => [
        fact.publicOperationEventRef,
        fact.admissionEventRef,
      ]),
    );
  }
  const prior = byPublicRef.get(invocationRef)?.[0];
  return prior === undefined
    ? deepFreeze({
        kind: "effectful_public_invocation_truth" as const,
        schemaVersion: "5.0.0" as const,
        disposition: "available" as const,
        invocationRef,
        prefix,
      })
    : deepFreeze({
        kind: "effectful_public_invocation_truth" as const,
        schemaVersion: "5.0.0" as const,
        disposition: "duplicate" as const,
        invocationRef,
        prefix,
        priorAdmission: prior,
      });
}
