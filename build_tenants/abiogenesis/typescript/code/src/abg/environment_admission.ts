import {
  constructProductSet,
  constructWorkspaceBinding,
  isProductInstallCandidate,
  isResolvedProductLock,
  isWorkspaceAuthorityBasis,
  isWorkspaceBindingCandidate,
  type ProductInstall,
  type ProductInstallCandidate,
  type ProductSet,
  type ResolvedProductLock,
  type WorkspaceAuthorityBasis,
  type WorkspaceBinding,
  type WorkspaceBindingCandidate,
} from "../product/index.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isExactOperationInvocationCoordinate,
  type ExactOperationInvocationCoordinate,
} from "../shared/operation_definition_coordinate.js";
import {
  projectExactPrefixArtifactTruth,
  projectArtifactTruth,
  projectValidatedPrefixArtifactTruth,
  validateExactPrefixArtifactTruthProjection,
  type AdmittedArtifactTruth,
  type ArtifactTruthProjection,
  type ExactPrefixArtifactTruthProjection,
  type ExactPrefixArtifactTruthProjectionRefusal,
  type ExactPrefixArtifactTruthProjectionResult,
} from "./artifact_truth.js";
import {
  projectEffectfulPublicInvocationTruthAtPrefix,
  type EffectfulPublicInvocationPriorAdmission,
  type EffectfulPublicInvocationTruth,
} from "./effectful_invocation_truth.js";
import {
  appendCheckedArtifactEvent,
  assertHeldEventStoreAtDurablePrefix,
  projectRuntimeEventFromValidatedHistory,
  type AbgEventStore,
  type DurablePrefixCoordinate,
  type EventStoreAppendRefusal,
  type RuntimeEventCandidate,
} from "./event_store.js";
import {
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";

export type PublicOperationId =
  | "abg.operation.product.install"
  | "abg.operation.workspace.bind"
  | "abg.operation.catalog.admit"
  | "abg.operation.catalog.apply"
  | "abg.operation.catalog.view"
  | "abg.operation.interaction.respond"
  | "abg.operation.project.read"
  | "abg.operation.result.assess"
  | "abg.operation.run.continue"
  | "abg.operation.run.invoke"
  | "abg.operation.witness.admit";

export interface PublicOperationAdmissionBasis
  extends ExactOperationInvocationCoordinate {
  readonly operationId: PublicOperationId;
  readonly authorityScopeRef: string;
  readonly authorityScopeDigest: Sha256Digest;
  readonly invocationRef: string;
  readonly invocationPayloadDigest: Sha256Digest;
  readonly invocationDigest: Sha256Digest;
  readonly correlationId: string;
  readonly eventTime: string;
  readonly causationEventRefs: readonly string[];
}

export interface ArtifactAdmissionBasis extends PublicOperationAdmissionBasis {
  readonly predecessorPrefix: DurablePrefixCoordinate;
}

export interface ArtifactAdmissionMetadata {
  readonly productSemanticsBasisDigest?: Sha256Digest;
  readonly publicationDigest?: Sha256Digest;
  readonly artifact?: JsonValue;
  readonly resolvedLock?: JsonValue;
  readonly workspaceAuthorityBasis?: JsonValue;
}

interface AbgSemanticAdmissionRefusal {
  readonly kind: "abg_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "artifact_truth_conflict"
    | "operation_mismatch"
    | "scope_mismatch";
  readonly message: string;
}

export interface DuplicateArtifactInvocationRefusal {
  readonly kind: "abg_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "duplicate_invocation";
  readonly message: string;
  readonly priorAdmission: EffectfulPublicInvocationPriorAdmission;
}

export type AbgAdmissionRefusal =
  | AbgSemanticAdmissionRefusal
  | DuplicateArtifactInvocationRefusal;

export type ArtifactOwnerResult<Value> =
  | Readonly<{
      kind: "artifact_owner_result";
      schemaVersion: "5.0.0";
      disposition: "admitted" | "idempotent";
      value: Value;
      admissionEventRef: string;
      successorPrefix: DurablePrefixCoordinate;
      artifactTruth: ExactPrefixArtifactTruthProjection;
    }>
  | Readonly<{
      kind: "artifact_owner_refusal";
      schemaVersion: "5.0.0";
      disposition: "refused";
      successorPrefix: DurablePrefixCoordinate;
      refusal: AbgAdmissionRefusal;
    }>
  | Readonly<{
      kind: "artifact_owner_coordinate_refusal";
      schemaVersion: "5.0.0";
      disposition: "refused";
      successorPrefix: null;
      suppliedPredecessor: DurablePrefixCoordinate;
      refusal:
        | EventStoreAppendRefusal
        | ExactPrefixArtifactTruthProjectionRefusal
        | Extract<EffectfulPublicInvocationTruth, {
            readonly disposition: "invalid_history";
          }>;
    }>;

function refusal(
  code: AbgSemanticAdmissionRefusal["code"],
  message: string,
): AbgSemanticAdmissionRefusal {
  return {
    kind: "abg_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function duplicateInvocationRefusal(
  held: EffectfulPublicInvocationPriorAdmission,
): DuplicateArtifactInvocationRefusal {
  return deepFreeze({
    kind: "abg_admission_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code: "duplicate_invocation" as const,
    message:
      "the effectful invocation identity already has one admitted durable fact",
    priorAdmission: held,
  });
}

function artifactMemberKey(
  operationId: "abg.operation.product.install" | "abg.operation.workspace.bind",
): "install" | "bind" {
  return operationId === "abg.operation.product.install" ? "install" : "bind";
}

function selectArtifactTruthRow(
  rows: readonly AdmittedArtifactTruth[],
  identity: Readonly<{
    operationId: "abg.operation.product.install" | "abg.operation.workspace.bind";
    authorityScopeRef: string;
    authorityScopeDigest: Sha256Digest;
    artifactRef: string;
    artifactDigest: Sha256Digest;
    invocationRef?: string;
    admissionEventRef?: string;
  }>,
): AdmittedArtifactTruth | null {
  const scopeRows = rows.filter((row) =>
    row.operationId === identity.operationId &&
    row.authorityScopeRef === identity.authorityScopeRef
  );
  if (scopeRows.length !== 1) return null;
  const row = scopeRows[0]!;
  const exact = row.memberKey === artifactMemberKey(identity.operationId) &&
    isSha256Digest(row.definitionDigest) &&
    row.authorityScopeDigest === identity.authorityScopeDigest &&
    row.artifactRef === identity.artifactRef &&
    row.artifactDigest === identity.artifactDigest &&
    (identity.invocationRef === undefined ||
      row.invocationRef === identity.invocationRef);
  return exact && (identity.admissionEventRef === undefined ||
      row.admissionEventRef === identity.admissionEventRef
    ) ? row : null;
}

function selectExactArtifactTruthRow(
  projection: ExactPrefixArtifactTruthProjection,
  identity: Readonly<{
    operationId: "abg.operation.product.install" | "abg.operation.workspace.bind";
    authorityScopeRef: string;
    authorityScopeDigest: Sha256Digest;
    artifactRef: string;
    artifactDigest: Sha256Digest;
    invocationRef?: string;
    admissionEventRef?: string;
  }>,
): AdmittedArtifactTruth | null {
  if (!validateExactPrefixArtifactTruthProjection(projection)) return null;
  return selectArtifactTruthRow(projection.rows, identity);
}

function selectExactArtifactTruthRowByInvocation(
  projection: ExactPrefixArtifactTruthProjection,
  operationId:
    | "abg.operation.product.install"
    | "abg.operation.workspace.bind",
  invocationRef: string,
): AdmittedArtifactTruth | null {
  if (
    !validateExactPrefixArtifactTruthProjection(projection) ||
    invocationRef.length === 0
  ) return null;
  const matches = projection.rows.filter((row) =>
    row.operationId === operationId && row.invocationRef === invocationRef
  );
  if (matches.length !== 1) return null;
  const row = matches[0]!;
  return row.memberKey === artifactMemberKey(operationId) &&
      isSha256Digest(row.definitionDigest)
    ? row
    : null;
}

export interface RehydratedProductInstallTruth {
  readonly candidate: ProductInstallCandidate;
  readonly install: ProductInstall;
  readonly resolvedLock: ResolvedProductLock;
  readonly invocationRef: string;
}

export interface RehydratedWorkspaceBindingTruth {
  readonly candidate: WorkspaceBindingCandidate;
  readonly binding: WorkspaceBinding;
  readonly installAdmissionEventRefs: readonly string[];
  readonly invocationRef: string;
}

function rehydrateProductInstallRow(
  projection: ExactPrefixArtifactTruthProjection,
  row: AdmittedArtifactTruth,
): RehydratedProductInstallTruth | null {
  return rehydrateProductInstallRowFromRows(projection.rows, row);
}

function rehydrateProductInstallRowFromRows(
  rows: readonly AdmittedArtifactTruth[],
  row: AdmittedArtifactTruth,
): RehydratedProductInstallTruth | null {
  if (
    row.operationId !== "abg.operation.product.install" ||
    !isResolvedProductLock(row.resolvedLock) ||
    !isProductInstallCandidate(row.artifact, row.resolvedLock)
  ) return null;
  const candidate = row.artifact as ProductInstallCandidate;
  const resolvedLock = row.resolvedLock as ResolvedProductLock;
  if (
    selectArtifactTruthRow(rows, {
      operationId: "abg.operation.product.install",
      authorityScopeRef: candidate.installId,
      authorityScopeDigest: candidate.productContentDigest,
      artifactRef: candidate.installId,
      artifactDigest: sha256Canonical(candidate as unknown as JsonValue),
      invocationRef: row.invocationRef,
      admissionEventRef: row.admissionEventRef,
    }) === null
  ) return null;
  const { kind: _kind, disposition: _disposition, ...body } = candidate;
  return deepFreeze({
    candidate,
    install: {
      kind: "product_install" as const,
      disposition: "admitted" as const,
      ...body,
      admissionEventRef: row.admissionEventRef,
    },
    resolvedLock,
    invocationRef: row.invocationRef,
  });
}

export function projectAdmittedProductInstallByInvocationRef(
  projection: ExactPrefixArtifactTruthProjection,
  invocationRef: string,
): RehydratedProductInstallTruth | null {
  const row = selectExactArtifactTruthRowByInvocation(
    projection,
    "abg.operation.product.install",
    invocationRef,
  );
  return row === null ? null : rehydrateProductInstallRow(projection, row);
}

export function projectAdmittedProductInstallByAdmissionEventRef(
  projection: ExactPrefixArtifactTruthProjection,
  admissionEventRef: string,
): RehydratedProductInstallTruth | null {
  if (
    !validateExactPrefixArtifactTruthProjection(projection) ||
    admissionEventRef.length === 0
  ) return null;
  const matches = projection.rows.filter((row) =>
    row.operationId === "abg.operation.product.install" &&
    row.admissionEventRef === admissionEventRef
  );
  return matches.length === 1
    ? rehydrateProductInstallRow(projection, matches[0]!)
    : null;
}

export function projectAdmittedWorkspaceProductInstall(
  projection: ExactPrefixArtifactTruthProjection,
  workspaceBindingId: string,
  installId: string,
): RehydratedProductInstallTruth | null {
  if (
    !validateExactPrefixArtifactTruthProjection(projection) ||
    workspaceBindingId.length === 0 ||
    installId.length === 0
  ) return null;
  const installRows = projection.rows.filter((row) =>
    row.operationId === "abg.operation.product.install" &&
    row.authorityScopeRef === installId &&
    row.artifactRef === installId
  );
  if (installRows.length !== 1) return null;
  const install = rehydrateProductInstallRow(projection, installRows[0]!);
  if (install === null) return null;
  const workspaceRows = projection.rows.filter((row) =>
    row.operationId === "abg.operation.workspace.bind" &&
    row.authorityScopeRef === workspaceBindingId &&
    row.artifactRef === workspaceBindingId &&
    row.causationEventRefs.includes(install.install.admissionEventRef)
  );
  return workspaceRows.length === 1 ? install : null;
}

export function projectAdmittedWorkspaceBindingByInvocationRef(
  projection: ExactPrefixArtifactTruthProjection,
  invocationRef: string,
  resolvedLock: ResolvedProductLock,
): RehydratedWorkspaceBindingTruth | null {
  const row = selectExactArtifactTruthRowByInvocation(
    projection,
    "abg.operation.workspace.bind",
    invocationRef,
  );
  return row === null
    ? null
    : rehydrateWorkspaceBindingRowFromRows(projection.rows, row, resolvedLock);
}

function rehydrateWorkspaceBindingRowFromRows(
  rows: readonly AdmittedArtifactTruth[],
  row: AdmittedArtifactTruth,
  resolvedLock: ResolvedProductLock,
): RehydratedWorkspaceBindingTruth | null {
  if (
    !isResolvedProductLock(resolvedLock) ||
    !isWorkspaceBindingCandidate(row.artifact, resolvedLock)
  ) return null;
  const candidate = row.artifact as WorkspaceBindingCandidate;
  if (
    selectArtifactTruthRow(rows, {
      operationId: "abg.operation.workspace.bind",
      authorityScopeRef: candidate.bindingId,
      authorityScopeDigest: candidate.bindingDigest,
      artifactRef: candidate.bindingId,
      artifactDigest: candidate.bindingDigest,
      invocationRef: row.invocationRef,
      admissionEventRef: row.admissionEventRef,
    }) === null
  ) return null;
  const { kind: _kind, ...body } = candidate;
  return deepFreeze({
    candidate,
    binding: {
      kind: "workspace_binding" as const,
      ...body,
      admissionEventRef: row.admissionEventRef,
    },
    installAdmissionEventRefs: [...row.causationEventRefs],
    invocationRef: row.invocationRef,
  });
}

export type ExactPrefixWorkspaceEnvironmentRefusalCode =
  | "artifact_truth_invalid"
  | "workspace_binding_coordinate_invalid"
  | "workspace_binding_missing"
  | "workspace_binding_mismatch"
  | "workspace_authority_invalid"
  | "causal_install_missing"
  | "causal_lock_mismatch"
  | "product_set_invalid"
  | "workspace_binding_invalid";

export interface ExactPrefixWorkspaceEnvironment {
  readonly kind: "exact_prefix_workspace_environment";
  readonly schemaVersion: "5.0.0";
  readonly prefix: ValidatedRuntimeEventPrefix;
  readonly artifactTruth: ArtifactTruthProjection;
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBindingCandidate: WorkspaceBindingCandidate;
  readonly workspaceBinding: WorkspaceBinding;
  readonly productInstalls: readonly ProductInstall[];
  readonly resolvedProductLock: ResolvedProductLock;
  readonly productSet: ProductSet;
}

export interface ExactPrefixWorkspaceEnvironmentRefusal {
  readonly kind: "exact_prefix_workspace_environment_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ExactPrefixWorkspaceEnvironmentRefusalCode;
  readonly message: string;
  readonly eventRefs: readonly string[];
}

export type ExactPrefixWorkspaceEnvironmentProjectionResult =
  | ExactPrefixWorkspaceEnvironment
  | ExactPrefixWorkspaceEnvironmentRefusal;

function exactPrefixEnvironmentRefusal(
  code: ExactPrefixWorkspaceEnvironmentRefusalCode,
  message: string,
  eventRefs: readonly string[] = [],
): ExactPrefixWorkspaceEnvironmentRefusal {
  return deepFreeze({
    kind: "exact_prefix_workspace_environment_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
    eventRefs: [...new Set(eventRefs)],
  });
}

/**
 * Pure exact-prefix projection of the one admitted workspace environment.
 * Event meaning remains owned by artifact truth; Product reconstructs the
 * lock-bound ProductSet and revalidates the binding candidate.
 */
export function projectExactPrefixWorkspaceEnvironment(
  prefix: ValidatedRuntimeEventPrefix,
  workspaceBindingCoordinate: ReferenceDigest<WorkspaceBinding>,
): ExactPrefixWorkspaceEnvironmentProjectionResult {
  let artifactTruth: ArtifactTruthProjection;
  try {
    artifactTruth = projectArtifactTruth(prefix);
  } catch {
    return exactPrefixEnvironmentRefusal(
      "artifact_truth_invalid",
      "the validated prefix does not project one lawful artifact history",
    );
  }
  const rows: readonly AdmittedArtifactTruth[] = artifactTruth.artifacts;
  if (
    typeof workspaceBindingCoordinate !== "object" ||
    workspaceBindingCoordinate === null ||
    typeof workspaceBindingCoordinate.ref !== "string" ||
    workspaceBindingCoordinate.ref.length === 0 ||
    !isSha256Digest(workspaceBindingCoordinate.digest)
  ) {
    return exactPrefixEnvironmentRefusal(
      "workspace_binding_coordinate_invalid",
      "workspace environment projection requires one exact WorkspaceBinding ref and digest",
    );
  }
  const bindingRows = rows.filter((row) =>
    row.operationId === "abg.operation.workspace.bind" &&
    row.authorityScopeRef === workspaceBindingCoordinate.ref &&
    row.artifactRef === workspaceBindingCoordinate.ref
  );
  if (bindingRows.length === 0) {
    return exactPrefixEnvironmentRefusal(
      "workspace_binding_missing",
      "the validated prefix contains no admitted WorkspaceBinding at the selected ref",
    );
  }
  if (bindingRows.length !== 1) {
    return exactPrefixEnvironmentRefusal(
      "artifact_truth_invalid",
      "the validated prefix contains conflicting WorkspaceBinding truth at the selected ref",
      bindingRows.map((row) => row.admissionEventRef),
    );
  }
  const bindingRow = bindingRows[0]!;
  if (
    bindingRow.authorityScopeDigest !== workspaceBindingCoordinate.digest ||
    bindingRow.artifactDigest !== workspaceBindingCoordinate.digest
  ) {
    return exactPrefixEnvironmentRefusal(
      "workspace_binding_mismatch",
      "the selected WorkspaceBinding digest differs from admitted artifact truth",
      [bindingRow.admissionEventRef],
    );
  }
  if (!isWorkspaceAuthorityBasis(bindingRow.workspaceAuthorityBasis)) {
    return exactPrefixEnvironmentRefusal(
      "workspace_authority_invalid",
      "the admitted WorkspaceBinding lacks its exact Product-valid authority basis",
      [bindingRow.admissionEventRef],
    );
  }
  const productInstalls: ProductInstall[] = [];
  const resolvedLocks: ResolvedProductLock[] = [];
  for (const eventRef of bindingRow.causationEventRefs) {
    const matches = rows.filter((row) =>
      row.operationId === "abg.operation.product.install" &&
      row.admissionEventRef === eventRef
    );
    const truth = matches.length === 1
      ? rehydrateProductInstallRowFromRows(rows, matches[0]!)
      : null;
    if (truth === null) {
      return exactPrefixEnvironmentRefusal(
        "causal_install_missing",
        "the admitted WorkspaceBinding lacks one exact causal ProductInstall",
        [bindingRow.admissionEventRef, eventRef],
      );
    }
    productInstalls.push(truth.install);
    resolvedLocks.push(truth.resolvedLock);
  }
  const resolvedProductLock = resolvedLocks[0];
  if (
    resolvedProductLock === undefined ||
    resolvedLocks.some((lock) =>
      canonicalJson(lock as unknown as JsonValue) !==
        canonicalJson(resolvedProductLock as unknown as JsonValue)
    )
  ) {
    return exactPrefixEnvironmentRefusal(
      "causal_lock_mismatch",
      "the causal ProductInstall set does not reproduce one exact ResolvedProductLock",
      bindingRow.causationEventRefs,
    );
  }
  const productSet = constructProductSet(productInstalls, resolvedProductLock);
  if (productSet.kind !== "product_set") {
    return exactPrefixEnvironmentRefusal(
      "product_set_invalid",
      "Product refused the exact causal ProductInstall set and resolved lock",
      bindingRow.causationEventRefs,
    );
  }
  const bindingTruth = rehydrateWorkspaceBindingRowFromRows(
    rows,
    bindingRow,
    resolvedProductLock,
  );
  if (
    bindingTruth === null ||
    !isWorkspaceBindingCandidate(
      bindingTruth.candidate,
      resolvedProductLock,
      productSet,
      bindingRow.workspaceAuthorityBasis,
    )
  ) {
    return exactPrefixEnvironmentRefusal(
      "workspace_binding_invalid",
      "the admitted WorkspaceBinding differs from its causal Product environment",
      [bindingRow.admissionEventRef],
    );
  }
  const reconstructed = constructWorkspaceBinding(
    bindingRow.workspaceAuthorityBasis,
    productSet,
    resolvedProductLock,
    bindingTruth.candidate.roots,
  );
  if (
    reconstructed.kind !== "workspace_binding_candidate" ||
    canonicalJson(reconstructed as unknown as JsonValue) !==
      canonicalJson(bindingTruth.candidate as unknown as JsonValue)
  ) {
    return exactPrefixEnvironmentRefusal(
      "workspace_binding_invalid",
      "Product could not reproduce the admitted WorkspaceBinding candidate",
      [bindingRow.admissionEventRef],
    );
  }
  return deepFreeze({
    kind: "exact_prefix_workspace_environment" as const,
    schemaVersion: "5.0.0" as const,
    prefix,
    artifactTruth,
    workspaceAuthorityBasis: bindingRow.workspaceAuthorityBasis,
    workspaceBindingCandidate: bindingTruth.candidate,
    workspaceBinding: bindingTruth.binding,
    productInstalls,
    resolvedProductLock,
    productSet,
  });
}

export function hasAdmittedProductInstall(
  projection: ExactPrefixArtifactTruthProjection,
  install: ProductInstall,
): boolean {
  const {
    kind: _kind,
    disposition: _disposition,
    admissionEventRef: _admissionEventRef,
    ...body
  } = install;
  const candidate = {
    kind: "product_install_candidate" as const,
    disposition: "materialized" as const,
    ...body,
  };
  return selectExactArtifactTruthRow(projection, {
    operationId: "abg.operation.product.install",
    authorityScopeRef: install.installId,
    authorityScopeDigest: install.productContentDigest,
    artifactRef: install.installId,
    artifactDigest: sha256Canonical(candidate as unknown as JsonValue),
    admissionEventRef: install.admissionEventRef,
  }) !== null;
}

export function projectAdmittedProductInstall(
  projection: ExactPrefixArtifactTruthProjection,
  candidate: ProductInstallCandidate,
  invocationRef?: string,
): ProductInstall | null {
  const candidateDigest = sha256Canonical(candidate as unknown as JsonValue);
  const row = selectExactArtifactTruthRow(projection, {
    operationId: "abg.operation.product.install",
    authorityScopeRef: candidate.installId,
    authorityScopeDigest: candidate.productContentDigest,
    artifactRef: candidate.installId,
    artifactDigest: candidateDigest,
    ...(invocationRef === undefined ? {} : { invocationRef }),
  });
  if (row === null) return null;
  const { kind: _kind, disposition: _disposition, ...body } = candidate;
  return deepFreeze({
    kind: "product_install" as const,
    disposition: "admitted" as const,
    ...body,
    admissionEventRef: row.admissionEventRef,
  }) as ProductInstall;
}

export function projectAdmittedWorkspaceBinding(
  projection: ExactPrefixArtifactTruthProjection,
  candidate: WorkspaceBindingCandidate,
  invocationRef?: string,
): WorkspaceBinding | null {
  const row = selectExactArtifactTruthRow(projection, {
    operationId: "abg.operation.workspace.bind",
    authorityScopeRef: candidate.bindingId,
    authorityScopeDigest: candidate.bindingDigest,
    artifactRef: candidate.bindingId,
    artifactDigest: candidate.bindingDigest,
    ...(invocationRef === undefined ? {} : { invocationRef }),
  });
  if (row === null) return null;
  const { kind: _kind, ...body } = candidate;
  return deepFreeze({
    kind: "workspace_binding" as const,
    ...body,
    admissionEventRef: row.admissionEventRef,
  }) as WorkspaceBinding;
}

export function validatePublicOperationBasis(
  basis: PublicOperationAdmissionBasis,
  expectedOperation: PublicOperationId,
  expectedMemberKey: string,
): AbgAdmissionRefusal | null {
  if (
    typeof basis !== "object" ||
    basis === null ||
    basis.operationId !== expectedOperation ||
    basis.memberKey !== expectedMemberKey
  ) {
    return refusal("operation_mismatch", "operation and member identity must match the selected owner definition");
  }
  if (
    !isExactOperationInvocationCoordinate({
      operationId: basis.operationId,
      memberKey: basis.memberKey,
      definitionDigest: basis.definitionDigest,
      invocationRef: basis.invocationRef,
      invocationPayloadDigest: basis.invocationPayloadDigest,
      invocationDigest: basis.invocationDigest,
    }) ||
    typeof basis.authorityScopeRef !== "string" ||
    basis.authorityScopeRef.length === 0 ||
    !isSha256Digest(basis.authorityScopeDigest) ||
    typeof basis.invocationRef !== "string" ||
    basis.invocationRef.length === 0 ||
    !isSha256Digest(basis.invocationPayloadDigest) ||
    !isSha256Digest(basis.invocationDigest) ||
    typeof basis.correlationId !== "string" ||
    basis.correlationId.length === 0 ||
    typeof basis.eventTime !== "string" ||
    Number.isNaN(Date.parse(basis.eventTime)) ||
    !Array.isArray(basis.causationEventRefs) ||
    basis.causationEventRefs.some(
      (eventRef) => typeof eventRef !== "string" || eventRef.length === 0,
    ) ||
    new Set(basis.causationEventRefs).size !== basis.causationEventRefs.length
  ) {
    return refusal("operation_mismatch", "operation definition, invocation, or event-time basis is invalid");
  }
  return null;
}

type ArtifactOperationId =
  | "abg.operation.product.install"
  | "abg.operation.workspace.bind";

type ArtifactAdmissionResult =
  | Readonly<{
      disposition: "admitted" | "idempotent";
      admissionEventRef: string;
      successorPrefix: DurablePrefixCoordinate;
      artifactTruth: ExactPrefixArtifactTruthProjection;
    }>
  | Readonly<{
      disposition: "refused";
      successorPrefix: DurablePrefixCoordinate;
      refusal: AbgAdmissionRefusal;
    }>
  | Readonly<{
      disposition: "coordinate_refused";
      successorPrefix: null;
      refusal:
        | EventStoreAppendRefusal
        | ExactPrefixArtifactTruthProjectionRefusal
        | Extract<EffectfulPublicInvocationTruth, {
            readonly disposition: "invalid_history";
          }>;
    }>;

function projectArtifactTruthAtPrefix(
  prefix: DurablePrefixCoordinate,
): ExactPrefixArtifactTruthProjectionResult {
  return projectExactPrefixArtifactTruth(prefix);
}

function predecessorCoordinateRefusal(error: unknown): EventStoreAppendRefusal {
  return deepFreeze({
    kind: "event_store_append_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code: "prefix_mismatch" as const,
    message: String(error),
  });
}

export function admitArtifact(
  store: AbgEventStore,
  basis: ArtifactAdmissionBasis,
  expectedOperation: ArtifactOperationId,
  artifactRef: string,
  artifactDigest: Sha256Digest,
  metadata: ArtifactAdmissionMetadata = {},
): ArtifactAdmissionResult {
  try {
    assertHeldEventStoreAtDurablePrefix(store, basis.predecessorPrefix);
  } catch (error) {
    return {
      disposition: "coordinate_refused",
      successorPrefix: null,
      refusal: predecessorCoordinateRefusal(error),
    };
  }
  if (
    expectedOperation !== "abg.operation.product.install" &&
    expectedOperation !== "abg.operation.workspace.bind"
  ) {
    return {
      disposition: "refused",
      successorPrefix: basis.predecessorPrefix,
      refusal: refusal(
        "operation_mismatch",
        "artifact admission is closed to Product install and workspace binding",
      ),
    };
  }
  const invalidBasis = validatePublicOperationBasis(
    basis,
    expectedOperation,
    artifactMemberKey(expectedOperation),
  );
  if (invalidBasis !== null) {
    return {
      disposition: "refused",
      successorPrefix: basis.predecessorPrefix,
      refusal: invalidBasis,
    };
  }
  const predecessorProjection = projectArtifactTruthAtPrefix(
    basis.predecessorPrefix,
  );
  if (
    predecessorProjection.kind ===
      "exact_prefix_artifact_truth_projection_refusal"
  ) {
    return {
      disposition: "coordinate_refused",
      successorPrefix: null,
      refusal: predecessorProjection,
    };
  }
  const predecessorTruth = predecessorProjection;
  const invocationTruth = projectEffectfulPublicInvocationTruthAtPrefix(
    basis.predecessorPrefix,
    basis.invocationRef,
  );
  if (invocationTruth.disposition === "invalid_history") {
    return {
      disposition: "coordinate_refused",
      successorPrefix: null,
      refusal: invocationTruth,
    };
  }
  if (invocationTruth.disposition === "duplicate") {
    return {
      disposition: "refused",
      successorPrefix: basis.predecessorPrefix,
      refusal: duplicateInvocationRefusal(invocationTruth.priorAdmission),
    };
  }
  const heldAtScope = predecessorTruth.rows.filter(
    (row) => row.authorityScopeRef === basis.authorityScopeRef,
  );
  if (heldAtScope.length > 1) {
    return {
      disposition: "refused",
      successorPrefix: basis.predecessorPrefix,
      refusal: refusal(
        "artifact_truth_conflict",
        "artifact truth contains an ambiguous authority scope",
      ),
    };
  }
  const held = heldAtScope[0];
  if (held !== undefined) {
    return {
      disposition: "refused",
      successorPrefix: basis.predecessorPrefix,
      refusal: refusal(
        "artifact_truth_conflict",
        "artifact admission conflicts with held scope truth under another invocation",
      ),
    };
  }
  const initiatedEvent: RuntimeEventCandidate & Readonly<{
    kind: "public_operation_artifact_admitted";
  }> = {
    kind: "public_operation_artifact_admitted",
    eventTime: basis.eventTime,
    aggregateType: "workspace",
    aggregateId: basis.authorityScopeRef,
    parentAggregateId: null,
    causationEventRefs: basis.causationEventRefs,
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: basis.authorityScopeRef,
    payload: {
      operationId: basis.operationId,
      memberKey: basis.memberKey,
      definitionDigest: basis.definitionDigest,
      authorityScopeRef: basis.authorityScopeRef,
      authorityScopeDigest: basis.authorityScopeDigest,
      invocationRef: basis.invocationRef,
      invocationPayloadDigest: basis.invocationPayloadDigest,
      invocationDigest: basis.invocationDigest,
      ownerAdmittedDisposition: "admitted",
      artifactRef,
      artifactDigest,
      ...metadata,
      causationEventRefs: basis.causationEventRefs,
      correlationId: basis.correlationId,
    },
  };
  try {
    assertHeldEventStoreAtDurablePrefix(store, basis.predecessorPrefix);
  } catch (error) {
    return {
      disposition: "coordinate_refused",
      successorPrefix: null,
      refusal: predecessorCoordinateRefusal(error),
    };
  }
  const predecessorEvents = store.readAll();
  let preparedEvent: ReturnType<typeof projectRuntimeEventFromValidatedHistory>;
  let preparedPrefix: ReturnType<typeof selectValidatedRuntimeEventPrefix>;
  try {
    preparedEvent = projectRuntimeEventFromValidatedHistory(
      predecessorEvents,
      initiatedEvent,
    );
    preparedPrefix = selectValidatedRuntimeEventPrefix(
      Object.freeze([...predecessorEvents, preparedEvent]),
    );
    projectArtifactTruth(preparedPrefix);
  } catch (error) {
    return {
      disposition: "refused",
      successorPrefix: basis.predecessorPrefix,
      refusal: refusal(
        "artifact_truth_conflict",
        `artifact successor semantics refused before append: ${String(error)}`,
      ),
    };
  }
  const appended = appendCheckedArtifactEvent(
    store,
    basis.predecessorPrefix,
    initiatedEvent,
  );
  if (!("event" in appended)) {
    return {
      disposition: "coordinate_refused",
      successorPrefix: null,
      refusal: appended,
    };
  }
  if (
    sha256Canonical(appended.event as unknown as JsonValue) !==
      sha256Canonical(preparedEvent as unknown as JsonValue)
  ) {
    throw new TypeError(
      "artifact append differs from its exact pre-effect semantic projection",
    );
  }
  const artifactTruth = projectValidatedPrefixArtifactTruth(
    appended.successorPrefix,
    preparedPrefix,
  );
  return {
    disposition: "admitted",
    admissionEventRef: appended.event.eventId,
    successorPrefix: appended.successorPrefix,
    artifactTruth,
  };
}

export function hasAdmittedWorkspaceBinding(
  projection: ExactPrefixArtifactTruthProjection,
  binding: WorkspaceBinding,
): boolean {
  const bindingDigest = sha256Canonical({
    workspaceId: binding.workspaceId,
    authorityBasisId: binding.authorityBasisId,
    authorityBasisDigest: binding.authorityBasisDigest,
    authorizedActorRef: binding.authorizedActorRef,
    productSetId: binding.productSetId,
    productSetDigest: binding.productSetDigest,
    lockId: binding.lockId,
    lockDigest: binding.lockDigest,
    roots: binding.roots,
  } as unknown as JsonValue);
  return (
    bindingDigest === binding.bindingDigest &&
    selectExactArtifactTruthRow(projection, {
      operationId: "abg.operation.workspace.bind",
      authorityScopeRef: binding.bindingId,
      authorityScopeDigest: binding.bindingDigest,
      artifactRef: binding.bindingId,
      artifactDigest: binding.bindingDigest,
      admissionEventRef: binding.admissionEventRef,
    }) !== null
  );
}

export function admitProductInstall(
  store: AbgEventStore,
  candidate: ProductInstallCandidate,
  basis: ArtifactAdmissionBasis,
  resolvedLock: ResolvedProductLock,
): ArtifactOwnerResult<ProductInstall> {
  try {
    assertHeldEventStoreAtDurablePrefix(store, basis.predecessorPrefix);
  } catch (error) {
    return {
      kind: "artifact_owner_coordinate_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: null,
      suppliedPredecessor: basis.predecessorPrefix,
      refusal: predecessorCoordinateRefusal(error),
    };
  }
  const invalidBasis = validatePublicOperationBasis(
    basis,
    "abg.operation.product.install",
    "install",
  );
  if (invalidBasis !== null) {
    return {
      kind: "artifact_owner_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: basis.predecessorPrefix,
      refusal: invalidBasis,
    };
  }
  if (
    !isProductInstallCandidate(candidate, resolvedLock) ||
    basis.authorityScopeRef !== candidate.installId ||
    basis.authorityScopeDigest !== candidate.productContentDigest
  ) {
    return {
      kind: "artifact_owner_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: basis.predecessorPrefix,
      refusal: refusal("scope_mismatch", "install admission scope differs from the candidate"),
    };
  }
  const candidateDigest = sha256Canonical(candidate as unknown as JsonValue);
  const admission = admitArtifact(
    store,
    basis,
    "abg.operation.product.install",
    candidate.installId,
    candidateDigest,
    {
      artifact: candidate as unknown as JsonValue,
      resolvedLock: resolvedLock as unknown as JsonValue,
    },
  );
  if (admission.disposition === "coordinate_refused") {
    return {
      kind: "artifact_owner_coordinate_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: null,
      suppliedPredecessor: basis.predecessorPrefix,
      refusal: admission.refusal,
    };
  }
  if (admission.disposition === "refused") {
    return {
      kind: "artifact_owner_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: admission.successorPrefix,
      refusal: admission.refusal,
    };
  }
  const { kind: _kind, disposition: _disposition, ...body } = candidate;
  const install = deepFreeze({
    kind: "product_install",
    disposition: "admitted",
    ...body,
    admissionEventRef: admission.admissionEventRef,
  }) as ProductInstall;
  return deepFreeze({
    kind: "artifact_owner_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: admission.disposition,
    value: install,
    admissionEventRef: admission.admissionEventRef,
    successorPrefix: admission.successorPrefix,
    artifactTruth: admission.artifactTruth,
  });
}

export function admitWorkspaceBinding(
  store: AbgEventStore,
  candidate: WorkspaceBindingCandidate,
  basis: ArtifactAdmissionBasis,
  authority: WorkspaceAuthorityBasis,
): ArtifactOwnerResult<WorkspaceBinding> {
  try {
    assertHeldEventStoreAtDurablePrefix(store, basis.predecessorPrefix);
  } catch (error) {
    return {
      kind: "artifact_owner_coordinate_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: null,
      suppliedPredecessor: basis.predecessorPrefix,
      refusal: predecessorCoordinateRefusal(error),
    };
  }
  const invalidBasis = validatePublicOperationBasis(
    basis,
    "abg.operation.workspace.bind",
    "bind",
  );
  if (invalidBasis !== null) {
    return {
      kind: "artifact_owner_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: basis.predecessorPrefix,
      refusal: invalidBasis,
    };
  }
  const predecessorProjection = projectExactPrefixArtifactTruth(
    basis.predecessorPrefix,
  );
  if (
    predecessorProjection.kind ===
      "exact_prefix_artifact_truth_projection_refusal"
  ) {
    return {
      kind: "artifact_owner_coordinate_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: null,
      suppliedPredecessor: basis.predecessorPrefix,
      refusal: predecessorProjection,
    };
  }
  const causalInstalls = basis.causationEventRefs.map((eventRef) =>
    projectAdmittedProductInstallByAdmissionEventRef(
      predecessorProjection,
      eventRef,
    )
  );
  const resolvedLock = causalInstalls[0]?.resolvedLock;
  const productSet = resolvedLock === undefined ||
      causalInstalls.length === 0 ||
      causalInstalls.some((row) =>
        row === null ||
        row.resolvedLock.lockId !== resolvedLock.lockId ||
        row.resolvedLock.lockDigest !== resolvedLock.lockDigest
      )
    ? null
    : constructProductSet(
        causalInstalls.map((row) => row!.install),
        resolvedLock,
      );
  const reconstructedCandidate = resolvedLock === undefined ||
      productSet === null || productSet.kind !== "product_set" ||
      !isWorkspaceAuthorityBasis(authority)
    ? null
    : constructWorkspaceBinding(
        authority,
        productSet,
        resolvedLock,
        candidate.roots,
      );
  if (
    resolvedLock === undefined ||
    productSet === null ||
    productSet.kind !== "product_set" ||
    reconstructedCandidate === null ||
    reconstructedCandidate.kind !== "workspace_binding_candidate" ||
    !isWorkspaceBindingCandidate(
      candidate,
      resolvedLock,
      productSet,
      authority,
    ) ||
    sha256Canonical(reconstructedCandidate as unknown as JsonValue) !==
      sha256Canonical(candidate as unknown as JsonValue) ||
    basis.authorityScopeRef !== candidate.bindingId ||
    basis.authorityScopeDigest !== candidate.bindingDigest
  ) {
    return {
      kind: "artifact_owner_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: basis.predecessorPrefix,
      refusal: refusal("scope_mismatch", "workspace admission scope differs from the candidate"),
    };
  }
  const admission = admitArtifact(
    store,
    basis,
    "abg.operation.workspace.bind",
    candidate.bindingId,
    candidate.bindingDigest,
    {
      artifact: candidate as unknown as JsonValue,
      workspaceAuthorityBasis: authority as unknown as JsonValue,
    },
  );
  if (admission.disposition === "coordinate_refused") {
    return {
      kind: "artifact_owner_coordinate_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: null,
      suppliedPredecessor: basis.predecessorPrefix,
      refusal: admission.refusal,
    };
  }
  if (admission.disposition === "refused") {
    return {
      kind: "artifact_owner_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      successorPrefix: admission.successorPrefix,
      refusal: admission.refusal,
    };
  }
  const { kind: _kind, ...body } = candidate;
  const binding = deepFreeze({
    kind: "workspace_binding",
    ...body,
    admissionEventRef: admission.admissionEventRef,
  }) as WorkspaceBinding;
  return deepFreeze({
    kind: "artifact_owner_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: admission.disposition,
    value: binding,
    admissionEventRef: admission.admissionEventRef,
    successorPrefix: admission.successorPrefix,
    artifactTruth: admission.artifactTruth,
  });
}
