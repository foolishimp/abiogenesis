import type { RuntimeEventPrefix } from "./event_prefix.js";
import { onlyExactMatch } from "../shared/select/index.js";
import type { RuntimeEventScan } from "./runtime_history.js";
import { isConstructionContinuationKind, projectSelectedActionOperation, projectPendingExecutionOperation, continuationOperationWorkspaceCorresponds } from "./construction_continuation.js";
import { isRecord } from "../shared/admission_predicates.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  projectArtifactTruth,
  projectOwnedPrefixArtifactTruth,
  runtimePrefixFromOwnedArtifactTruth,
  type ExactPrefixArtifactTruthProjectionRefusalCode,
} from "./artifact_truth.js";
import {
  type DurablePrefixCoordinate,
  type RuntimeEvent,
} from "./event_store.js";
import {
  indexedRuntimeEvents,
  projectOwnedRuntimeEventPrefixAtDurablePrefix,
  runtimeEventBodiesAtPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  projectFhEffectfulPublicInvocationFacts,
} from "./fh_continuation_projection.js";
import {
  projectExactRunInvocationFactsAtPrefix,
  projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix,
} from "./invocation_execution_truth.js";

type ExplicitInvocationTruthPrefix =
  | DurablePrefixCoordinate
  | ValidatedRuntimeEventPrefix;

export type EffectfulPublicInvocationPriorAdmission = {
  readonly operationId:
    | "abg.operation.release.snapshot"
    | "abg.operation.product.install"
    | "abg.operation.product.materialize"
    | "abg.operation.workspace.bind"
    | "abg.operation.run.invoke"
    | "abg.operation.interaction.respond"
    | "abg.operation.run.continue";
  readonly publicInvocationRef: string;
  readonly ownerInvocationRef: string;
  readonly ownerInvocationDigest: Sha256Digest;
  readonly publicOperationEventRef: string;
  readonly admissionEventRef: string;
};

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

/** @internal The owned input is distinct from a Public full-prefix output. */
type OwnedExplicitInvocationTruthPrefix = DurablePrefixCoordinate | RuntimeEventPrefix;
/** @internal */
export type OwnedEffectfulPublicInvocationTruth = EffectfulPublicInvocationTruth extends infer T ? T extends { prefix: unknown }
  ? Omit<T, "prefix"> & { readonly prefix: OwnedExplicitInvocationTruthPrefix } : never : never;

function invalidHistory(
  prefix: OwnedExplicitInvocationTruthPrefix,
  invocationRef: string,
  code: Extract<
    EffectfulPublicInvocationTruth,
    { readonly disposition: "invalid_history" }
  >["code"],
  eventRefs: readonly string[] = [],
  artifactTruthCode: ExactPrefixArtifactTruthProjectionRefusalCode | null = null,
): OwnedEffectfulPublicInvocationTruth {
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
): EffectfulPublicInvocationTruth;
/** @internal */
export function projectEffectfulPublicInvocationTruthAtPrefix(
  prefix: OwnedExplicitInvocationTruthPrefix,
  invocationRef: string,
): OwnedEffectfulPublicInvocationTruth;
export function projectEffectfulPublicInvocationTruthAtPrefix(
  prefix: OwnedExplicitInvocationTruthPrefix,
  invocationRef: string,
): OwnedEffectfulPublicInvocationTruth {
  let events: RuntimeEventScan;
  let artifactRows: readonly Readonly<{
    operationId: string;
    invocationRef: string;
    invocationDigest: string;
    admissionEventRef: string;
  }>[];
  if (prefix.kind === "runtime_validation_event_prefix") return invalidHistory(prefix, invocationRef, "prefix_invalid");
  if (prefix.kind === "validated_runtime_event_prefix" || prefix.kind === "owned_runtime_event_prefix") {
    try {
      events = runtimeEventBodiesAtPrefix(prefix);
      artifactRows = projectArtifactTruth(prefix).artifacts;
    } catch {
      return invalidHistory(
        prefix,
        invocationRef,
        "artifact_truth_invalid",
      );
    }
  } else {
    // One owned acquisition: an established coordinate borrows its receipt;
    // a raw or copied coordinate authenticates its bytes cold. The artifact
    // derivation then reads the same owned prefix.
    try {
      projectOwnedRuntimeEventPrefixAtDurablePrefix(prefix);
    } catch {
      return invalidHistory(prefix, invocationRef, "prefix_invalid");
    }
    const artifactTruth = projectOwnedPrefixArtifactTruth(prefix);
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
    const artifactPrefix = runtimePrefixFromOwnedArtifactTruth(artifactTruth);
    if (artifactPrefix === null) return invalidHistory(prefix, invocationRef, "prefix_invalid");
    events = runtimeEventBodiesAtPrefix(artifactPrefix);
    artifactRows = artifactTruth.rows;
  }
  const facts: EffectfulPublicInvocationPriorAdmission[] =
    artifactRows.map((row) => deepFreeze({
      operationId: row.operationId as
        | "abg.operation.release.snapshot"
        | "abg.operation.product.install"
        | "abg.operation.product.materialize"
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
  // F_H claims every other run.continue operation; the construction-continuation
  // owner validates each of its closed kinds. A kind-crossed (mixed-arm) payload
  // fails its owner's projection and refuses the whole history.
  const constructionIntentFact = (operation: RuntimeEvent): EffectfulPublicInvocationPriorAdmission | null => {
    const p = operation.payload;
    const bases = indexedRuntimeEvents(validatedPrefix, "construction-operation:" + operation.eventId).filter(e => e.kind === "basis_admitted" &&
      isRecord(e.payload) && isRecord(e.payload.constructionContinuationUse) &&
      e.payload.constructionContinuationUse.operationAdmissionEventRef === operation.eventId);
    const basisMatch = onlyExactMatch(bases);
    const basis = basisMatch.kind === "one" ? projectExactExecutionBasisAtPrefix(validatedPrefix, basisMatch.value.basisId!) : null;
    const use = basis?.constructionContinuationUse;
    const original = use === undefined ? null : projectExactExecutionBasisAtPrefix(validatedPrefix, use.sourceExecutionBasisRef);
    const invocation = original === null ? null : projectExactInvocationAdmissionAtPrefix(validatedPrefix, original.invocationAdmissionRef);
    if (!isRecord(p) || basis === null || use === undefined || original === null || invocation === null ||
      !continuationOperationWorkspaceCorresponds(operation, invocation) ||
      basis.invocationAdmissionRef !== original.invocationAdmissionRef || p.operationId !== "abg.operation.run.continue" ||
      p.memberKey !== "current_intent" || p.continuationRef !== use.continuationRef || p.continuationDigest !== use.continuationDigest ||
      p.currentIntentRef !== use.constructionIntentRef || p.currentIntentDigest !== use.constructionIntentDigest ||
      p.authorityRef !== invocation.authorityRef || p.authorityDigest !== invocation.authorityDigest ||
      typeof p.invocationRef !== "string" || typeof p.invocationDigest !== "string") return null;
    return { operationId: "abg.operation.run.continue", publicInvocationRef: p.invocationRef,
      ownerInvocationRef: p.invocationRef, ownerInvocationDigest: p.invocationDigest as Sha256Digest,
      publicOperationEventRef: operation.eventId, admissionEventRef: basis.admissionEventRef };
  };
  const constructionOperations = (["construction_intent", "selected_action", "pending_execution"] as const)
    .flatMap(kind => indexedRuntimeEvents(validatedPrefix, "public-continuation:" + kind))
    .sort((left, right) => left.admissionOrdinal - right.admissionOrdinal);
  for (const operation of constructionOperations.filter(e => e.kind === "public_operation_admitted" &&
    isRecord(e.payload) && isConstructionContinuationKind(e.payload.continuationKind))) {
    const kind = (operation.payload as Record<string, unknown>).continuationKind;
    const fact = kind === "construction_intent" ? constructionIntentFact(operation)
      : kind === "selected_action" ? projectSelectedActionOperation(validatedPrefix, operation)
      : projectPendingExecutionOperation(validatedPrefix, operation);
    if (fact === null) return invalidHistory(prefix, invocationRef, "invocation_pair_invalid", [operation.eventId]);
    facts.push(fact);
  }
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
