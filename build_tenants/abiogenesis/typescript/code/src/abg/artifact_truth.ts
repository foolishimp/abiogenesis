import {
  constructProductSet,
  constructWorkspaceBinding,
  isProductInstallCandidate,
  isResolvedProductLock,
  isWorkspaceAuthorityBasis,
  isWorkspaceBindingCandidate,
  type ProductInstall,
  type ProductInstallCandidate,
  type ResolvedProductLock,
  type WorkspaceAuthorityBasis,
  type WorkspaceBindingCandidate,
} from "../product/index.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  type RuntimeEventCalculusEffectRow,
} from "./event_calculus.js";
import {
  DurablePrefixReadError,
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";

export type ArtifactTruthConflictField =
  | "operationId"
  | "memberKey"
  | "definitionDigest"
  | "invocationRef"
  | "invocationPayloadDigest"
  | "invocationDigest"
  | "authorityScopeRef"
  | "authorityScopeDigest"
  | "artifactRef"
  | "artifactDigest";

export interface ArtifactTruthRow {
  readonly operationId: string;
  readonly memberKey: string;
  readonly definitionDigest: string;
  readonly invocationRef: string;
  readonly invocationPayloadDigest: string;
  readonly invocationDigest: string;
  readonly authorityScopeRef: string;
  readonly authorityScopeDigest: string;
  readonly artifactRef: string;
  readonly artifactDigest: string;
  readonly artifact: JsonValue | null;
  readonly resolvedLock: JsonValue | null;
  readonly workspaceAuthorityBasis: JsonValue | null;
  readonly admissionEventRef: string;
  readonly admissionOrdinal: number;
  readonly causationEventRefs: readonly string[];
}

interface FoldedArtifactTruthRow extends ArtifactTruthRow {
  readonly ownerAdmittedDisposition: "admitted";
}

export interface ArtifactTruthProjection {
  readonly kind: "artifact_truth_projection";
  readonly artifacts: readonly FoldedArtifactTruthRow[];
}

export interface ExactPrefixArtifactTruthProjection {
  readonly kind: "exact_prefix_artifact_truth_projection";
  readonly schemaVersion: "5.0.0";
  readonly prefix: DurablePrefixCoordinate;
  readonly prefixEventCount: number;
  readonly lastAdmissionOrdinal: number;
  readonly rows: readonly ArtifactTruthRow[];
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
}

export type ExactPrefixArtifactTruthProjectionRefusalCode =
  | "file_identity_mismatch"
  | "prefix_length_mismatch"
  | "prefix_digest_mismatch"
  | "event_contract_digest_mismatch"
  | "event_envelope_invalid"
  | "admission_ordinal_invalid"
  | "artifact_truth_history_conflict"
  | "duplicate_artifact_admission";

export interface ExactPrefixArtifactTruthProjectionRefusal {
  readonly kind: "exact_prefix_artifact_truth_projection_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ExactPrefixArtifactTruthProjectionRefusalCode;
  readonly prefix: DurablePrefixCoordinate;
  readonly eventRefs: readonly string[];
  readonly authorityScopeRef: string | null;
  readonly conflictingFields: readonly ArtifactTruthConflictField[];
}

export type ExactPrefixArtifactTruthProjectionResult =
  | ExactPrefixArtifactTruthProjection
  | ExactPrefixArtifactTruthProjectionRefusal;

export type AdmittedArtifactTruth = ArtifactTruthRow;

class ArtifactTruthHistoryError extends TypeError {
  constructor(
    readonly code:
      | "artifact_truth_history_conflict"
      | "duplicate_artifact_admission",
    readonly eventRefs: readonly string[],
    readonly authorityScopeRef: string,
    readonly conflictingFields: readonly ArtifactTruthConflictField[],
  ) {
    super(code);
  }
}

function recordPayload(
  row: RuntimeEventCalculusEffectRow,
): Readonly<Record<string, JsonValue>> {
  const payload = row.sourceEvent.payload;
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new TypeError("artifact admission requires one closed object payload");
  }
  return payload as Readonly<Record<string, JsonValue>>;
}

function requiredString(
  payload: Readonly<Record<string, JsonValue>>,
  field: string,
): string {
  const value = payload[field];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`artifact admission requires non-empty ${field}`);
  }
  return value;
}

function isDigest(value: string): value is Sha256Digest {
  return /^sha256:[a-f0-9]{64}$/u.test(value);
}

function assertsArtifactAvailabilityEffect(
  row: RuntimeEventCalculusEffectRow,
  authorityScopeRef: string,
): void {
  if (
    row.initiates.length !== 1 ||
    row.initiates[0]?.name !== "public_operation_artifact_available" ||
    row.initiates[0]?.identity !== authorityScopeRef
  ) {
    throw new TypeError(
      "artifact admission lacks its authority-scoped Event Calculus availability effect",
    );
  }
}

/**
 * The sole low-level Event Calculus fold. It is intentionally not installed as
 * an authority surface; callers use projectExactPrefixArtifactTruth.
 */
export function projectArtifactTruth(
  prefix: ValidatedRuntimeEventPrefix,
): ArtifactTruthProjection {
  const calculus = deriveRuntimeEventCalculusProjection(prefix);
  const artifactRows = calculus.effectRows.filter(
    (row) => row.eventKind === "public_operation_artifact_admitted",
  );

  const artifacts: FoldedArtifactTruthRow[] = [];
  const admittedInstalls = new Map<string, Readonly<{
    install: ProductInstall;
    resolvedLock: ResolvedProductLock;
  }>>();
  for (const row of [...artifactRows].sort((left, right) =>
    left.sourceEvent.admissionOrdinal - right.sourceEvent.admissionOrdinal
  )) {
    const payload = recordPayload(row);
    const authorityScopeRef = requiredString(payload, "authorityScopeRef");
    assertsArtifactAvailabilityEffect(row, authorityScopeRef);
    const availability = constructRuntimeFluent({
      name: "public_operation_artifact_available",
      identity: authorityScopeRef,
    });
    if (!holdsAt(calculus, availability)) {
      throw new TypeError(
        "artifact admission history disagrees with scoped Event Calculus availability",
      );
    }
    const operationId = requiredString(payload, "operationId");
    const ownerAdmittedDisposition = requiredString(
      payload,
      "ownerAdmittedDisposition",
    );
    if (
      (operationId !== "abg.operation.product.install" &&
        operationId !== "abg.operation.workspace.bind") ||
      ownerAdmittedDisposition !== "admitted"
    ) {
      throw new TypeError(
        "artifact admission is outside the admitted install/workspace relation",
      );
    }
    const memberKey = requiredString(payload, "memberKey");
    const definitionDigest = requiredString(payload, "definitionDigest");
    const invocationRef = requiredString(payload, "invocationRef");
    const invocationPayloadDigest = requiredString(
      payload,
      "invocationPayloadDigest",
    );
    const invocationDigest = requiredString(payload, "invocationDigest");
    const authorityScopeDigest = requiredString(
      payload,
      "authorityScopeDigest",
    );
    const artifactRef = requiredString(payload, "artifactRef");
    const artifactDigest = requiredString(payload, "artifactDigest");
    const event = row.sourceEvent;
    if (
      memberKey !== (operationId === "abg.operation.product.install"
        ? "install"
        : "bind") ||
      !isExactOperationInvocationCoordinate({
        operationId,
        memberKey,
        definitionDigest,
        invocationRef,
        invocationPayloadDigest,
        invocationDigest,
      }) ||
      !isDigest(invocationPayloadDigest) ||
      !isDigest(authorityScopeDigest) ||
      !isDigest(artifactDigest) ||
      event.aggregateType !== "workspace" ||
      event.aggregateId !== authorityScopeRef ||
      event.parentAggregateId !== null ||
      event.workflowVersion !== "5.0.0" ||
      event.scopeClass !== "workspace" ||
      event.basisId !== authorityScopeRef ||
      payload.correlationId !== event.correlationId ||
      !Array.isArray(payload.causationEventRefs) ||
      canonicalJson(payload.causationEventRefs) !==
        canonicalJson(event.causationEventRefs)
    ) {
      throw new TypeError(
        "artifact admission differs from its exact Public operation and event basis",
      );
    }
    if (operationId === "abg.operation.product.install") {
      if (
        event.causationEventRefs.length !== 0 ||
        !isResolvedProductLock(payload.resolvedLock) ||
        !isProductInstallCandidate(payload.artifact, payload.resolvedLock) ||
        payload.workspaceAuthorityBasis !== undefined
      ) {
        throw new TypeError(
          "Product install artifact truth requires one complete candidate and resolved lock",
        );
      }
      const candidate = payload.artifact as unknown as ProductInstallCandidate;
      const resolvedLock = payload.resolvedLock as unknown as ResolvedProductLock;
      if (
        authorityScopeRef !== candidate.installId ||
        authorityScopeDigest !== candidate.productContentDigest ||
        artifactRef !== candidate.installId ||
        artifactDigest !== sha256Canonical(candidate as unknown as JsonValue)
      ) {
        throw new TypeError(
          "Product install artifact truth differs from its exact candidate scope",
        );
      }
      const { kind: _kind, disposition: _disposition, ...body } = candidate;
      admittedInstalls.set(event.eventId, deepFreeze({
        install: {
          kind: "product_install" as const,
          disposition: "admitted" as const,
          ...body,
          admissionEventRef: event.eventId,
        },
        resolvedLock,
      }));
    } else {
      if (
        new Set(event.causationEventRefs).size !==
          event.causationEventRefs.length
      ) {
        throw new TypeError(
          "workspace binding artifact truth requires each causal install exactly once",
        );
      }
      const causalInstalls = event.causationEventRefs.map((eventRef) =>
        admittedInstalls.get(eventRef)
      );
      const resolvedLock = causalInstalls[0]?.resolvedLock;
      const productSet = resolvedLock === undefined ||
          causalInstalls.length === 0 ||
          causalInstalls.some((basis) =>
            basis === undefined ||
            canonicalJson(basis.resolvedLock as unknown as JsonValue) !==
              canonicalJson(resolvedLock as unknown as JsonValue)
          )
        ? null
        : constructProductSet(
            causalInstalls.map((basis) => basis!.install),
            resolvedLock,
          );
      const authority = isWorkspaceAuthorityBasis(
          payload.workspaceAuthorityBasis,
        )
        ? payload.workspaceAuthorityBasis as WorkspaceAuthorityBasis
        : null;
      if (
        productSet === null ||
        productSet.kind !== "product_set" ||
        authority === null ||
        !isWorkspaceBindingCandidate(
          payload.artifact,
          resolvedLock!,
          productSet,
          authority,
        ) ||
        payload.resolvedLock !== undefined
      ) {
        throw new TypeError(
          "workspace binding artifact truth requires its exact causal Product set",
        );
      }
      const candidate =
        payload.artifact as unknown as WorkspaceBindingCandidate;
      const reconstructed = constructWorkspaceBinding(
        authority,
        productSet,
        resolvedLock!,
        candidate.roots,
      );
      if (
        reconstructed.kind !== "workspace_binding_candidate" ||
        canonicalJson(reconstructed as unknown as JsonValue) !==
          canonicalJson(candidate as unknown as JsonValue) ||
        authorityScopeRef !== candidate.bindingId ||
        authorityScopeDigest !== candidate.bindingDigest ||
        artifactRef !== candidate.bindingId ||
        artifactDigest !== candidate.bindingDigest
      ) {
        throw new TypeError(
          "workspace binding artifact truth differs from its exact candidate scope",
        );
      }
    }
    artifacts.push(deepFreeze({
      operationId,
      memberKey,
      definitionDigest,
      invocationRef,
      invocationPayloadDigest,
      invocationDigest,
      authorityScopeRef,
      authorityScopeDigest,
      artifactRef,
      artifactDigest,
      artifact: payload.artifact ?? null,
      resolvedLock: payload.resolvedLock ?? null,
      workspaceAuthorityBasis: payload.workspaceAuthorityBasis ?? null,
      admissionEventRef: event.eventId,
      admissionOrdinal: event.admissionOrdinal,
      causationEventRefs: [...event.causationEventRefs],
      ownerAdmittedDisposition: "admitted" as const,
    }));
  }

  artifacts.sort((left, right) =>
    left.authorityScopeRef < right.authorityScopeRef
      ? -1
      : left.authorityScopeRef > right.authorityScopeRef
      ? 1
      : left.admissionOrdinal - right.admissionOrdinal
  );
  const factFields: readonly ArtifactTruthConflictField[] = [
    "operationId",
    "memberKey",
    "definitionDigest",
    "invocationRef",
    "invocationPayloadDigest",
    "invocationDigest",
    "authorityScopeRef",
    "authorityScopeDigest",
    "artifactRef",
    "artifactDigest",
  ];
  const assertUniqueFact = (
    previous: FoldedArtifactTruthRow,
    current: FoldedArtifactTruthRow,
  ): never => {
    const conflictingFields = factFields
      .filter((field) => previous[field] !== current[field])
      .sort();
    const eventRefs = [
      ...new Set([
        previous.admissionEventRef,
        current.admissionEventRef,
      ]),
    ].sort();
    throw new ArtifactTruthHistoryError(
      conflictingFields.length === 0
        ? "duplicate_artifact_admission"
        : "artifact_truth_history_conflict",
      eventRefs,
      current.authorityScopeRef,
      conflictingFields,
    );
  };
  const heldByScope = new Map<string, FoldedArtifactTruthRow>();
  const heldByInvocation = new Map<string, FoldedArtifactTruthRow>();
  for (const current of artifacts) {
    const previousAtScope = heldByScope.get(current.authorityScopeRef);
    if (previousAtScope === undefined) {
      heldByScope.set(current.authorityScopeRef, current);
    } else {
      assertUniqueFact(previousAtScope, current);
    }
    const previousAtInvocation = heldByInvocation.get(current.invocationRef);
    if (previousAtInvocation === undefined) {
      heldByInvocation.set(current.invocationRef, current);
    } else {
      assertUniqueFact(previousAtInvocation, current);
    }
  }

  return deepFreeze({
    kind: "artifact_truth_projection" as const,
    artifacts,
  });
}

function refusal(
  prefix: DurablePrefixCoordinate,
  code: ExactPrefixArtifactTruthProjectionRefusalCode,
  input: Readonly<{
    eventRefs?: readonly string[];
    authorityScopeRef?: string;
    conflictingFields?: readonly ArtifactTruthConflictField[];
  }> = {},
): ExactPrefixArtifactTruthProjectionRefusal {
  return deepFreeze({
    kind: "exact_prefix_artifact_truth_projection_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    prefix,
    eventRefs: [...new Set(input.eventRefs ?? [])].sort(),
    authorityScopeRef: input.authorityScopeRef ?? null,
    conflictingFields: [...new Set(input.conflictingFields ?? [])].sort(),
  });
}

export function projectValidatedPrefixArtifactTruth(
  prefix: DurablePrefixCoordinate,
  validatedPrefix: ValidatedRuntimeEventPrefix,
): ExactPrefixArtifactTruthProjection {
  const events = runtimeEventsFromValidatedPrefix(validatedPrefix);
  const folded = projectArtifactTruth(validatedPrefix);
  const rows = folded.artifacts.map((row): ArtifactTruthRow => deepFreeze({
    operationId: row.operationId,
    memberKey: row.memberKey,
    definitionDigest: row.definitionDigest,
    invocationRef: row.invocationRef,
    invocationPayloadDigest: row.invocationPayloadDigest,
    invocationDigest: row.invocationDigest,
    authorityScopeRef: row.authorityScopeRef,
    authorityScopeDigest: row.authorityScopeDigest,
    artifactRef: row.artifactRef,
    artifactDigest: row.artifactDigest,
    artifact: row.artifact,
    resolvedLock: row.resolvedLock,
    workspaceAuthorityBasis: row.workspaceAuthorityBasis,
    admissionEventRef: row.admissionEventRef,
    admissionOrdinal: row.admissionOrdinal,
    causationEventRefs: [...row.causationEventRefs],
  }));
  rows.sort((left, right) =>
    left.authorityScopeRef < right.authorityScopeRef
      ? -1
      : left.authorityScopeRef > right.authorityScopeRef
      ? 1
      : left.admissionOrdinal - right.admissionOrdinal
  );
  const body = {
    kind: "exact_prefix_artifact_truth_projection" as const,
    schemaVersion: "5.0.0" as const,
    prefix,
    prefixEventCount: events.length,
    lastAdmissionOrdinal: events.at(-1)?.admissionOrdinal ?? 0,
    rows,
  };
  const projectionDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    projectionRef:
      `artifact-truth-projection://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
  });
}

export function projectExactPrefixArtifactTruth(
  prefix: DurablePrefixCoordinate,
): ExactPrefixArtifactTruthProjectionResult {
  try {
    const events = readRuntimeEventsAtDurablePrefix(prefix);
    const validatedPrefix = selectValidatedRuntimeEventPrefix(events);
    return projectValidatedPrefixArtifactTruth(prefix, validatedPrefix);
  } catch (error) {
    if (error instanceof ArtifactTruthHistoryError) {
      return refusal(prefix, error.code, {
        eventRefs: error.eventRefs,
        authorityScopeRef: error.authorityScopeRef,
        conflictingFields: error.conflictingFields,
      });
    }
    if (error instanceof DurablePrefixReadError) {
      return refusal(prefix, error.code);
    }
    return refusal(prefix, "event_envelope_invalid");
  }
}

export function validateExactPrefixArtifactTruthProjection(
  value: unknown,
): value is ExactPrefixArtifactTruthProjection {
  try {
    if (
      typeof value !== "object" ||
      value === null ||
      !("prefix" in value)
    ) return false;
    const projected = projectExactPrefixArtifactTruth(
      value.prefix as DurablePrefixCoordinate,
    );
    return projected.kind === "exact_prefix_artifact_truth_projection" &&
      canonicalJson(projected as unknown as JsonValue) ===
        canonicalJson(value as JsonValue);
  } catch {
    return false;
  }
}
