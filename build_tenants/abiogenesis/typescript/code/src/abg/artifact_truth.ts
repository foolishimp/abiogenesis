import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { isReleaseOperationArtifact, projectReleaseQualification, projectReleaseAcceptance } from "../implementation/release_publication.js";
import { releaseArtifactCoordinate } from "../product/release_snapshot_operations.js";
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
  runtimeEventCalculusEffectsByKind,
  runtimeFluentHoldsAtPrefix,
  type RuntimeEventCalculusEffectRow,
} from "./event_calculus.js";
import {
  DurablePrefixReadError,
  captureDurablePrefixCoordinate,
  assertDurableRuntimePrefixBytes,
  readRuntimeEventsAtDurablePrefix,
  projectRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  runtimePrefixComputation,
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
  | "artifactDigest"
  | "admissionEventDigest";

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
  readonly admissionEventDigest: Sha256Digest;
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

function isRecord(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Readonly<Record<string, JsonValue>>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
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
 * Ordered artifact relations consume the shared Event Calculus owner facts.
 * The installed authority surface remains projectExactPrefixArtifactTruth.
 */
const ARTIFACT_FACTS = Symbol("ordered_artifact_facts");
class RuntimeArtifactFacts {
  readonly artifacts: FoldedArtifactTruthRow[] = [];
  readonly exactProjections = new Map<string, ExactPrefixArtifactTruthProjection>();
  readonly admittedInstalls = new Map<string, Readonly<{
    install: ProductInstall;
    resolvedLock: ResolvedProductLock;
    embeddedLock: boolean;
    admissionEventDigest: Sha256Digest;
  }>>();
  advance(artifactRows: readonly RuntimeEventCalculusEffectRow[]): void {
    for (const row of artifactRows.slice(this.artifacts.length)) {
    const payload = recordPayload(row);
    const authorityScopeRef = requiredString(payload, "authorityScopeRef");
    assertsArtifactAvailabilityEffect(row, authorityScopeRef);
    const operationId = requiredString(payload, "operationId");
    const ownerAdmittedDisposition = requiredString(
      payload,
      "ownerAdmittedDisposition",
    );
    if (
      (operationId !== "abg.operation.product.install" &&
        operationId !== "abg.operation.workspace.bind" && operationId !== "abg.operation.release.snapshot") ||
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
      !(operationId === "abg.operation.release.snapshot" && memberKey === "tapped_release") && memberKey !== (operationId === "abg.operation.product.install"
        ? "install"
        : operationId === "abg.operation.release.snapshot" ? "published_rc" : "bind") ||
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
    let artifact = payload.artifact ?? null;
    let resolvedLockBody = payload.resolvedLock ?? null;
    if (operationId === "abg.operation.product.install") {
      if (isRecord(artifact) && artifact.kind === "product_install_lock_row") {
        if (
          !hasExactKeys(artifact, ["kind", "schemaVersion", "productId", "installId", "installedRoot"]) ||
          artifact.schemaVersion !== "5.0.0"
        ) throw new TypeError("Product install compact body is malformed");
        const reference = payload.resolvedLock;
        const referencesBody = reference !== undefined && isRecord(reference) &&
          reference.kind === "resolved_product_lock_reference";
        if (!referencesBody) {
          if (event.causationEventRefs.length !== 0 || !isResolvedProductLock(reference)) {
            throw new TypeError("Product install inline body requires one resolved lock and no body cause");
          }
        } else {
          if (
            !hasExactKeys(reference, ["kind", "schemaVersion", "admissionEventRef", "admissionEventDigest", "lockId", "lockDigest"]) ||
            reference.schemaVersion !== "5.0.0" ||
            typeof reference.admissionEventRef !== "string" ||
            event.causationEventRefs.length !== 1 ||
            event.causationEventRefs[0] !== reference.admissionEventRef
          ) throw new TypeError("Product install lock reference is malformed or differs from its body cause");
          const source = this.admittedInstalls.get(reference.admissionEventRef);
          if (
            source === undefined || !source.embeddedLock ||
            source.admissionEventDigest !== reference.admissionEventDigest ||
            source.resolvedLock.lockId !== reference.lockId ||
            source.resolvedLock.lockDigest !== reference.lockDigest
          ) throw new TypeError("Product install lock reference lacks its exact earlier embedded body");
          resolvedLockBody = source.resolvedLock as unknown as JsonValue;
        }
        const lock = resolvedLockBody as unknown as ResolvedProductLock;
        const productId = artifact.productId;
        const selectedRows = lock.rows.filter((entry) => entry.productId === productId);
        if (selectedRows.length !== 1) throw new TypeError("Product install compact body requires one exact lock row");
        artifact = {
          ...selectedRows[0]!,
          kind: "product_install_candidate",
          schemaVersion: "5.0.0",
          disposition: "materialized",
          installId: artifact.installId,
          installedRoot: artifact.installedRoot,
          resolvedLockId: lock.lockId,
          resolvedLockDigest: lock.lockDigest,
        } as unknown as JsonValue;
      } else if (event.causationEventRefs.length !== 0) {
        throw new TypeError("Historical Product install body requires its embedded lock and no body cause");
      }
      if (
        !isResolvedProductLock(resolvedLockBody) ||
        !isProductInstallCandidate(artifact, resolvedLockBody) ||
        payload.workspaceAuthorityBasis !== undefined
      ) {
        throw new TypeError(
          "Product install artifact truth requires one complete candidate and resolved lock",
        );
      }
      const candidate = artifact as unknown as ProductInstallCandidate;
      const resolvedLock = resolvedLockBody as unknown as ResolvedProductLock;
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
      this.admittedInstalls.set(event.eventId, deepFreeze({
        install: {
          kind: "product_install" as const,
          disposition: "admitted" as const,
          ...body,
          admissionEventRef: event.eventId,
        },
        resolvedLock,
        embeddedLock: event.causationEventRefs.length === 0,
        admissionEventDigest: event.payloadDigest,
      }));
    } else if (operationId === "abg.operation.release.snapshot") {
      if (!isReleaseOperationArtifact(artifact) || payload.resolvedLock !== undefined || payload.workspaceAuthorityBasis !== undefined ||
          canonicalJson(artifact.invocation as unknown as JsonValue) !== canonicalJson({operationId,memberKey,definitionDigest,invocationRef,invocationPayloadDigest,invocationDigest}) ||
          artifact.scope.ref !== authorityScopeRef || artifact.scope.digest !== authorityScopeDigest ||
          releaseArtifactCoordinate(artifact).ref !== artifactRef || releaseArtifactCoordinate(artifact).digest !== artifactDigest ||
          (artifact.memberKey === "published_rc"
            ? projectReleaseQualification(artifact.request,artifact.proof,artifact.selection,artifact.entryPrefix as DurablePrefixCoordinate)
            : projectReleaseAcceptance(artifact.request,artifact.proof,artifact.selection,artifact.publication,artifact.ruling,artifact.effectGrant,artifact.entryPrefix as DurablePrefixCoordinate,this.artifacts)) === null) {
        throw new TypeError("release artifact differs from its closed native qualification/observation/scope/Definition relation");
      }
      const environment = projectExactPrefixWorkspaceEnvironment(artifact.entryPrefix as DurablePrefixCoordinate, artifact.workspaceBinding);
      if (environment.kind !== "exact_prefix_workspace_environment" ||
          environment.workspaceAuthorityBasis.authorizedActorRef !== artifact.actorRef ||
          canonicalJson(artifact.productSet) !== canonicalJson(environment.productInstalls.map(i => ({ref:i.installId,digest:i.productContentDigest}))) ||
          artifact.dependencyLock.ref !== environment.resolvedProductLock.lockId || artifact.dependencyLock.digest !== environment.resolvedProductLock.lockDigest ||
          event.causationEventRefs.length !== 1 || event.causationEventRefs[0] !== environment.workspaceBinding.admissionEventRef) {
        throw new TypeError("release artifact actor/environment differs from its exact admitted predecessor");
      }
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
        this.admittedInstalls.get(eventRef)
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
    this.artifacts.push(deepFreeze({
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
      artifact,
      resolvedLock: resolvedLockBody,
      workspaceAuthorityBasis: payload.workspaceAuthorityBasis ?? null,
      admissionEventRef: event.eventId,
      admissionEventDigest: event.payloadDigest,
      admissionOrdinal: event.admissionOrdinal,
      causationEventRefs: [...event.causationEventRefs],
      ownerAdmittedDisposition: "admitted" as const,
    }));
  }
  }
}

export function projectArtifactTruth(prefix: ValidatedRuntimeEventPrefix): ArtifactTruthProjection {
  const artifactRows = runtimeEventCalculusEffectsByKind(prefix, "public_operation_artifact_admitted");
  const facts = runtimePrefixComputation(prefix, ARTIFACT_FACTS, () => new RuntimeArtifactFacts());
  facts.advance(artifactRows);
  const artifacts = facts.artifacts.slice(0, artifactRows.length);
  for (const row of artifacts) {
    if (!runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "public_operation_artifact_available", identity: row.authorityScopeRef })))
      throw new TypeError("artifact admission history disagrees with scoped Event Calculus availability");
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
    "admissionEventDigest",
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
    admissionEventDigest: row.admissionEventDigest,
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

const ARTIFACT_DERIVATION = Symbol("owner_artifact_truth_derivation");
const ARTIFACT_DERIVATION_KEY = Symbol("owner_artifact_truth_derivation_construction");
class ArtifactTruthDerivation {
  readonly #projection: ExactPrefixArtifactTruthProjection;
  readonly #prefix: ValidatedRuntimeEventPrefix;
  constructor(key: typeof ARTIFACT_DERIVATION_KEY, projection: ExactPrefixArtifactTruthProjection, prefix: ValidatedRuntimeEventPrefix) {
    if (key !== ARTIFACT_DERIVATION_KEY) throw new TypeError("artifact truth derivation is owner constructed");
    this.#projection = projection; this.#prefix = prefix;
    Object.freeze(this);
  }
  static isFor(value: unknown): value is ExactPrefixArtifactTruthProjection {
    if (typeof value !== "object" || value === null) return false;
    const proof: unknown = Object.getOwnPropertyDescriptor(value, ARTIFACT_DERIVATION)?.value;
    return typeof proof === "object" && proof !== null && #projection in proof && proof.#projection === value;
  }
  static prefix(value: ExactPrefixArtifactTruthProjection): ValidatedRuntimeEventPrefix | null {
    if (!this.isFor(value)) return null;
    return (Object.getOwnPropertyDescriptor(value, ARTIFACT_DERIVATION)!.value as ArtifactTruthDerivation).#prefix;
  }
}

/** Pure consumers borrow the exact owner value; copies still reconstruct cold.
 * Explicit fresh validation below remains the acquisition/effect check. */
export function validateArtifactTruthProjectionValue(value: unknown): value is ExactPrefixArtifactTruthProjection {
  return ArtifactTruthDerivation.isFor(value) || validateExactPrefixArtifactTruthProjection(value);
}
export function runtimePrefixFromArtifactTruth(value: ExactPrefixArtifactTruthProjection): ValidatedRuntimeEventPrefix | null {
  return ArtifactTruthDerivation.prefix(value);
}

export function projectExactPrefixArtifactTruth(
  prefix: DurablePrefixCoordinate,
): ExactPrefixArtifactTruthProjectionResult {
  return deriveExactPrefixArtifactTruth(prefix, readRuntimeEventsAtDurablePrefix);
}

/** Pure projection from the existing authenticated coordinate receipt. Raw
 * coordinates have no receipt and retain the complete cold acquisition. */
export function projectOwnedPrefixArtifactTruth(
  prefix: DurablePrefixCoordinate,
): ExactPrefixArtifactTruthProjectionResult {
  return deriveExactPrefixArtifactTruth(prefix, projectRuntimeEventsAtDurablePrefix);
}

function deriveExactPrefixArtifactTruth(
  prefix: DurablePrefixCoordinate,
  eventsAtPrefix: (prefix: DurablePrefixCoordinate) => readonly RuntimeEvent[],
): ExactPrefixArtifactTruthProjectionResult {
  try {
    // Capture ordinary data once so a mutable/accessor-bearing caller cannot
    // make the validated read and the computation key name different inputs.
    const coordinate = captureDurablePrefixCoordinate(prefix);
    const events = eventsAtPrefix(coordinate);
    const validatedPrefix = selectValidatedRuntimeEventPrefix(events);
    const facts = runtimePrefixComputation(validatedPrefix, ARTIFACT_FACTS, () => new RuntimeArtifactFacts());
    const retained = facts.exactProjections.get(coordinate.coordinateDigest);
    if (retained !== undefined) return retained;
    const projection = { ...projectValidatedPrefixArtifactTruth(coordinate, validatedPrefix) };
    Object.defineProperty(projection, ARTIFACT_DERIVATION, {
      value: new ArtifactTruthDerivation(ARTIFACT_DERIVATION_KEY, projection, validatedPrefix),
    });
    const result = deepFreeze(projection);
    facts.exactProjections.set(coordinate.coordinateDigest, result);
    return result;
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
    if (ArtifactTruthDerivation.isFor(value)) {
      // Recheck current physical bytes on every use. The exact frozen result
      // already carries the owner's completed semantic/history validation.
      assertDurableRuntimePrefixBytes(value.prefix);
      return true;
    }
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
