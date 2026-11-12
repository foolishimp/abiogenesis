import { join } from "node:path";

import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { isReleaseOperationArtifact, projectReleaseQualification, projectReleaseAcceptance } from "../implementation/release_publication.js";
import { releaseArtifactCoordinate } from "../product/release_snapshot_operations.js";
import {
  constructProductSet,
  isWorkspaceAuthorityBasis,
  type ProductInstall,
  type ProductInstallCandidate,
  type ResolvedProductLock,
  type WorkspaceAuthorityBasis,
  type WorkspaceBindingCandidate,
} from "../product/index.js";
import {
  constructWorkspaceBindingInResolvedLock,
  isProductInstallCandidateInResolvedLock,
  isProductLockFor,
  isWorkspaceBindingCandidateInResolvedLock,
  productInstallCoordinate,
} from "../product/environment.js";
import type { ProductTruthQuestion } from "../shared/capability_contracts.js";
import { compareUnicodeCodeUnits, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { admitJson, hasExactKeys, isRecord } from "../shared/admit/index.js";
import { isExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import {
  constructRuntimeFluent,
  eventCalculusEffect,
  runtimeEventCalculusEffectsByKind,
  runtimeFluentHoldsAtPrefix,
  type RuntimeEventCalculusEffectRow,
} from "./event_calculus.js";
import {
  DurablePrefixReadError,
  captureDurablePrefixCoordinate,
  assertDurableRuntimePrefixBytes,
  assertDurableRuntimePrefixCurrent,
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
} from "./event_store.js";
import {
  runtimeEventPrefixExtent,
  projectOwnedRuntimeEventPrefixAtDurablePrefix,
  type RuntimeEventPrefix,
  runtimePrefixComputation,
  selectValidatedRuntimeEventPrefix,
  validateRuntimeEventPrefixExtension,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import { canonicalEquals } from "../shared/value/index.js";

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

export type ArtifactTruthRow = {
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
};

interface FoldedArtifactTruthRow extends ArtifactTruthRow {
  readonly ownerAdmittedDisposition: "admitted";
}

export interface ArtifactTruthProjection {
  readonly kind: "artifact_truth_projection";
  readonly artifacts: readonly FoldedArtifactTruthRow[];
}

export type ExactPrefixArtifactTruthProjection = {
  readonly kind: "exact_prefix_artifact_truth_projection";
  readonly schemaVersion: "5.0.0";
  readonly prefix: DurablePrefixCoordinate;
  readonly prefixEventCount: number;
  readonly lastAdmissionOrdinal: number;
  readonly rows: readonly ArtifactTruthRow[];
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
};

export type ExactPrefixArtifactTruthProjectionRefusalCode =
  | "file_identity_mismatch"
  | "prefix_length_mismatch"
  | "prefix_digest_mismatch"
  | "event_contract_digest_mismatch"
  | "event_envelope_invalid"
  | "admission_ordinal_invalid"
  | "artifact_truth_history_conflict"
  | "duplicate_artifact_admission";

export type ExactPrefixArtifactTruthProjectionRefusal = {
  readonly kind: "exact_prefix_artifact_truth_projection_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ExactPrefixArtifactTruthProjectionRefusalCode;
  readonly prefix: DurablePrefixCoordinate;
  readonly eventRefs: readonly string[];
  readonly authorityScopeRef: string | null;
  readonly conflictingFields: readonly ArtifactTruthConflictField[];
};

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
  if (!isRecord(payload)) {
    throw new TypeError("artifact admission requires one closed object payload");
  }
  return payload;
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

const MATERIALIZATION_ARTIFACT_KEYS = [
  "entryPrefix", "invocation", "kind", "memberKey", "request", "result", "schemaVersion", "workspaceBinding",
] as const;

/**
 * product.materialize's artifact: the owner's result and the declared request at
 * the entry coordinate. The fold reconstructs the result from the request and
 * the environment projected at the entry prefix through the binding the event's
 * cause names (the workspace pair is the admitted authority basis, the
 * configuration contract body the installed catalog row); only each row's
 * created/preserved disposition is the owner's filesystem observation. The scope
 * is the manifest pair and the artifact the content pair.
 */
function materializationArtifactCorresponds(
  artifact: JsonValue | null,
  payload: Readonly<Record<string, JsonValue>>,
  event: RuntimeEvent,
  coordinate: Readonly<{
    invocation: Readonly<Record<string, string>>;
    scope: Readonly<{ ref: string; digest: string }>;
    artifact: Readonly<{ ref: string; digest: string }>;
  }>,
): boolean {
  try {
    const memberKey = coordinate.invocation.memberKey;
    if (!isRecord(artifact) || !hasExactKeys(artifact, MATERIALIZATION_ARTIFACT_KEYS) ||
        artifact.kind !== "product_materialization_artifact" || artifact.schemaVersion !== "5.0.0" ||
        artifact.memberKey !== memberKey || (memberKey !== "context_bootstrap" && memberKey !== "configuration") ||
        payload.resolvedLock !== undefined || payload.workspaceAuthorityBasis !== undefined ||
        !canonicalEquals(artifact.invocation ?? null, coordinate.invocation) ||
        !isRecord(artifact.request) || !isRecord(artifact.result) || !Array.isArray(artifact.result.rows) ||
        !isRecord(artifact.workspaceBinding) || typeof artifact.workspaceBinding.ref !== "string" ||
        typeof artifact.workspaceBinding.digest !== "string" || !isDigest(artifact.workspaceBinding.digest)) return false;
    const environment = projectExactPrefixWorkspaceEnvironment(artifact.entryPrefix as unknown as DurablePrefixCoordinate,
      { ref: artifact.workspaceBinding.ref, digest: artifact.workspaceBinding.digest });
    if (environment.kind !== "exact_prefix_workspace_environment" || event.causationEventRefs.length !== 1 ||
        event.causationEventRefs[0] !== environment.workspaceBinding.admissionEventRef) return false;
    const binding = environment.workspaceBinding, basis = environment.workspaceAuthorityBasis;
    const request = artifact.request, observedRows = artifact.result.rows;
    const bindingPair = { ref: binding.bindingId, digest: binding.bindingDigest };
    if (!canonicalEquals(artifact.workspaceBinding, bindingPair) || !canonicalEquals(request.binding ?? null, bindingPair)) return false;
    const hex = (digest: string) => digest.slice("sha256:".length);
    const root = join(binding.roots.projectionRoot, "product-materializations", memberKey);
    const subject = { workspaceRef: basis.workspaceId, workspaceDigest: basis.authorityBasisDigest,
      bindingRef: binding.bindingId, bindingDigest: binding.bindingDigest };
    const disposition = (index: number) => {
      const row = observedRows[index];
      return isRecord(row) && (row.disposition === "created" || row.disposition === "preserved") ? row.disposition : null;
    };
    const provenance = [
      { provenanceRef: subject.workspaceRef, provenanceDigest: subject.workspaceDigest },
      { provenanceRef: subject.bindingRef, provenanceDigest: subject.bindingDigest },
    ];
    let rows: JsonValue[], content: Readonly<{ contentRef: string; contentDigest: Sha256Digest; contentPath: string }>;
    if (memberKey === "context_bootstrap") {
      if (!canonicalEquals(request.workspace ?? null, { ref: subject.workspaceRef, digest: subject.workspaceDigest }) ||
          !Array.isArray(request.contextInputs) || request.contextInputs.length !== observedRows.length) return false;
      const inputs = request.contextInputs.map((input) => {
        if (!isRecord(input) || typeof input.name !== "string" || input.value === undefined) {
          throw new TypeError("materialization context input is malformed");
        }
        const value = admitJson(input.value);
        if (value.kind !== "ok") throw new TypeError("materialization context input is malformed");
        return { inputRef: input.name, inputDigest: sha256Canonical(value.value), content: value.value };
      }).sort((left, right) => compareUnicodeCodeUnits(left.inputRef, right.inputRef));
      rows = inputs.map((input, index) => {
        const assetDigest = sha256Canonical({ kind: "generated_product_asset", schemaVersion: "5.0.0",
          materializationKind: "context_bootstrap", ...subject, ...input });
        return { inputRef: input.inputRef, inputDigest: input.inputDigest,
          assetRef: `generated-product-asset://abiogenesis/${hex(assetDigest)}`, assetDigest,
          assetPath: join(root, "content", `${hex(assetDigest)}.json`), disposition: disposition(index) };
      });
      const contentDigest = sha256Canonical(rows.map((row) => (row as Readonly<{ assetDigest: string }>).assetDigest));
      content = { contentRef: `context-bootstrap-content://abiogenesis/${hex(contentDigest)}`, contentDigest, contentPath: root };
      provenance.push(...inputs.map((input) => ({ provenanceRef: input.inputRef, provenanceDigest: input.inputDigest })));
    } else {
      const selected = request.configurationContract;
      const contracts = isRecord(selected) ? environment.productInstalls.flatMap((install) =>
        install.publicContracts.filter((row) => row.contractId === selected.ref)) : [];
      if (contracts.length !== 1 || !isRecord(selected) || contracts[0]!.contractDigest !== selected.digest ||
          request.inputs === undefined || observedRows.length !== 1) return false;
      const contract = contracts[0]!, inputsDigest = sha256Canonical(request.inputs);
      const contentDigest = sha256Canonical({ kind: "generated_product_asset", schemaVersion: "5.0.0",
        materializationKind: "configuration", ...subject, configurationContract: contract,
        inputsDigest, inputs: request.inputs });
      content = { contentRef: `configuration-content://abiogenesis/${hex(contentDigest)}`, contentDigest,
        contentPath: join(root, "content", `${hex(contentDigest)}.json`) };
      rows = [{ inputRef: contract.contractId, inputDigest: inputsDigest, assetRef: content.contentRef,
        assetDigest: contentDigest, assetPath: content.contentPath, disposition: disposition(0) }];
      provenance.push({ provenanceRef: contract.contractId, provenanceDigest: contract.contractDigest });
    }
    if (rows.some((row) => (row as Readonly<{ disposition: unknown }>).disposition === null)) return false;
    provenance.sort((left, right) => compareUnicodeCodeUnits(left.provenanceRef, right.provenanceRef));
    const manifestBody = { kind: "product_materialization_manifest", schemaVersion: "5.0.0", materializationKind: memberKey,
      workspaceRef: subject.workspaceRef, workspaceDigest: subject.workspaceDigest, bindingRef: subject.bindingRef,
      bindingDigest: subject.bindingDigest, contentRef: content.contentRef, contentDigest: content.contentDigest, rows,
      validationDisposition: "admitted", residuals: [], provenance };
    const manifestDigest = sha256Canonical(manifestBody);
    const manifest = { manifestRef: `product-materialization-manifest://abiogenesis/${hex(manifestDigest)}`, manifestDigest,
      manifestPath: join(root, "manifests", `${hex(manifestDigest)}.json`) };
    return canonicalEquals(artifact.result, { kind: "product_materialization_result", schemaVersion: "5.0.0",
      disposition: "materialized", materializationKind: memberKey, subject, content, manifest, rows,
      validationDisposition: "admitted", residuals: [], provenance }) &&
      coordinate.scope.ref === manifest.manifestRef && coordinate.scope.digest === manifest.manifestDigest &&
      coordinate.artifact.ref === content.contentRef && coordinate.artifact.digest === content.contentDigest;
  } catch {
    return false;
  }
}

/**
 * Ordered artifact relations consume the shared Event Calculus owner facts.
 * The installed authority surface remains projectExactPrefixArtifactTruth.
 */
const ARTIFACT_FACTS = Symbol("ordered_artifact_facts");
interface AdmittedInstallFact {
  readonly install: ProductInstall;
  readonly resolvedLock: ResolvedProductLock;
  readonly embeddedLock: boolean;
  readonly admissionEventDigest: Sha256Digest;
}
class RuntimeArtifactFacts {
  readonly artifacts: FoldedArtifactTruthRow[] = [];
  readonly exactProjections = new Map<string, ExactPrefixArtifactTruthProjection>();
  readonly admittedInstalls = new Map<string, AdmittedInstallFact>();
  advance(artifactRows: readonly RuntimeEventCalculusEffectRow[]): void {
    for (const row of artifactRows.slice(this.artifacts.length)) {
      const prepared = this.prepare(row, "recorded");
      this.accept(prepared);
    }
  }
  accept(prepared: ReturnType<RuntimeArtifactFacts["prepare"]>): void {
    if (prepared.install !== undefined) this.admittedInstalls.set(prepared.artifact.admissionEventRef, prepared.install);
    this.artifacts.push(prepared.artifact);
  }
  /** Shared cold/live relation, with no mutation until the complete row passes.
   * An enclosing install owner may supply its established lock; copied event
   * metadata must still reproduce that complete body. The entry passes the
   * question an inline lock answers: `recorded` when the fold advances over
   * history, `strict` when admission prepares its candidate. */
  prepare(row: RuntimeEventCalculusEffectRow, question: ProductTruthQuestion, establishedLock?: ResolvedProductLock): Readonly<{
    artifact: FoldedArtifactTruthRow;
    install: AdmittedInstallFact | undefined;
  }> {
    let admittedInstall: AdmittedInstallFact | undefined;
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
        operationId !== "abg.operation.workspace.bind" && operationId !== "abg.operation.release.snapshot" &&
        operationId !== "abg.operation.product.materialize") ||
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
      !(operationId === "abg.operation.release.snapshot" && memberKey === "tapped_release") &&
      !(operationId === "abg.operation.product.materialize" && (memberKey === "context_bootstrap" || memberKey === "configuration")) &&
      memberKey !== (operationId === "abg.operation.product.install"
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
      !canonicalEquals(
        payload.causationEventRefs,
        event.causationEventRefs,
      )
    ) {
      throw new TypeError(
        "artifact admission differs from its exact Public operation and event basis",
      );
    }
    let artifact = payload.artifact ?? null;
    let resolvedLockBody = payload.resolvedLock ?? null;
    if (operationId === "abg.operation.product.install") {
      let checkedLock: ResolvedProductLock | undefined;
      const establishInlineLock = (value: unknown): value is ResolvedProductLock => {
        if (establishedLock !== undefined) {
          const admitted = value === establishedLock ? null : admitJson(value);
          if (admitted === null || (admitted.kind === "ok" && canonicalEquals(admitted.value, establishedLock))) {
            checkedLock = establishedLock;
            return true;
          }
        }
        if (!isProductLockFor(value, question)) return false;
        checkedLock = value;
        return true;
      };
      if (isRecord(artifact) && artifact.kind === "product_install_lock_row") {
        if (
          !hasExactKeys(artifact, ["kind", "schemaVersion", "productId", "installId", "installedRoot"]) ||
          artifact.schemaVersion !== "5.0.0"
        ) throw new TypeError("Product install compact body is malformed");
        const reference = payload.resolvedLock;
        const referencesBody = reference !== undefined && isRecord(reference) &&
          reference.kind === "resolved_product_lock_reference";
        if (!referencesBody) {
          if (event.causationEventRefs.length !== 0 || !establishInlineLock(reference)) {
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
          checkedLock = source.resolvedLock;
          resolvedLockBody = source.resolvedLock;
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
        (checkedLock === undefined && !establishInlineLock(resolvedLockBody)) ||
        !isProductInstallCandidateInResolvedLock(artifact, checkedLock!) ||
        payload.workspaceAuthorityBasis !== undefined
      ) {
        throw new TypeError(
          "Product install artifact truth requires one complete candidate and resolved lock",
        );
      }
      const candidate = artifact as unknown as ProductInstallCandidate;
      const resolvedLock = checkedLock!;
      if (
        authorityScopeRef !== candidate.installId ||
        authorityScopeDigest !== candidate.productContentDigest ||
        artifactRef !== candidate.installId ||
        artifactDigest !== sha256Canonical(candidate)
      ) {
        throw new TypeError(
          "Product install artifact truth differs from its exact candidate scope",
        );
      }
      const { kind: _kind, disposition: _disposition, ...body } = candidate;
      admittedInstall = deepFreeze({
        install: {
          kind: "product_install" as const,
          disposition: "admitted" as const,
          ...body,
          admissionEventRef: event.eventId,
        },
        resolvedLock,
        embeddedLock: event.causationEventRefs.length === 0,
        admissionEventDigest: event.payloadDigest,
      });
    } else if (operationId === "abg.operation.release.snapshot") {
      if (!isReleaseOperationArtifact(artifact) || payload.resolvedLock !== undefined || payload.workspaceAuthorityBasis !== undefined ||
          !canonicalEquals(artifact.invocation, {operationId,memberKey,definitionDigest,invocationRef,invocationPayloadDigest,invocationDigest}) ||
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
          !canonicalEquals(artifact.productSet, environment.productInstalls.map(productInstallCoordinate)) ||
          artifact.dependencyLock.ref !== environment.resolvedProductLock.lockId || artifact.dependencyLock.digest !== environment.resolvedProductLock.lockDigest ||
          event.causationEventRefs.length !== 1 || event.causationEventRefs[0] !== environment.workspaceBinding.admissionEventRef) {
        throw new TypeError("release artifact actor/environment differs from its exact admitted predecessor");
      }
    } else if (operationId === "abg.operation.product.materialize") {
      if (!materializationArtifactCorresponds(artifact, payload, event, {
        invocation: { operationId, memberKey, definitionDigest, invocationRef, invocationPayloadDigest, invocationDigest },
        scope: { ref: authorityScopeRef, digest: authorityScopeDigest },
        artifact: { ref: artifactRef, digest: artifactDigest },
      })) {
        throw new TypeError("materialization artifact differs from its closed owner result, request, scope or Definition relation");
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
            (basis.resolvedLock !== resolvedLock &&
              !canonicalEquals(
                basis.resolvedLock,
                resolvedLock,
              ))
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
        !isWorkspaceBindingCandidateInResolvedLock(
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
      const reconstructed = constructWorkspaceBindingInResolvedLock(
        authority,
        productSet,
        resolvedLock!,
        candidate.roots,
      );
      if (
        reconstructed.kind !== "workspace_binding_candidate" ||
        !canonicalEquals(
          reconstructed,
          candidate,
        ) ||
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
    return { install: admittedInstall, artifact: deepFreeze({
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
    }) };
  }
}

export function projectArtifactTruth(prefix: ValidatedRuntimeEventPrefix): ArtifactTruthProjection;
/** @internal */
export function projectArtifactTruth(prefix: RuntimeEventPrefix): ArtifactTruthProjection;
export function projectArtifactTruth(prefix: RuntimeEventPrefix): ArtifactTruthProjection {
  const artifactRows = runtimeEventCalculusEffectsByKind(prefix, "public_operation_artifact_admitted");
  const facts = runtimePrefixComputation(prefix, ARTIFACT_FACTS, () => new RuntimeArtifactFacts());
  facts.advance(artifactRows);
  const artifacts = facts.artifacts.slice(0, artifactRows.length);
  for (const row of artifacts) {
    if (!runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "public_operation_artifact_available", identity: row.authorityScopeRef })))
      throw new TypeError("artifact admission history disagrees with scoped Event Calculus availability");
  }

  assertUniqueArtifactTruth(artifacts);
  return deepFreeze({
    kind: "artifact_truth_projection" as const,
    artifacts,
  });
}

function assertUniqueArtifactTruth(artifacts: FoldedArtifactTruthRow[]): void {
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

}

/** Speculation borrows the actual predecessor's checked facts. It never lends
 * candidate rows to the live prefix or creates another history derivation. */
export function validateArtifactTruthCandidate(
  predecessor: ExactPrefixArtifactTruthProjection,
  event: RuntimeEvent,
): void {
  prepareArtifactTruthCandidate(predecessor, event);
}

/** @internal Prepare against the actual owner without publishing speculative
 * facts. The continuation accepts only the exact checked append, then advances
 * that same owner's derivation. A cold/different owner reconstructs normally. */
export function prepareArtifactTruthCandidate(
  predecessor: ExactPrefixArtifactTruthProjection,
  event: RuntimeEvent,
  establishedLock?: ResolvedProductLock,
): (appended: Readonly<{ event: RuntimeEvent; successorPrefix: DurablePrefixCoordinate }>) => ExactPrefixArtifactTruthProjectionResult {
  const prefix = runtimePrefixFromOwnedArtifactTruth(predecessor);
  if (prefix === null) throw new TypeError("artifact candidate requires its owner-derived predecessor");
  if (event.kind !== "public_operation_artifact_admitted") throw new TypeError("artifact candidate requires an artifact event");
  validateRuntimeEventPrefixExtension(prefix, event);
  const facts = runtimePrefixComputation(prefix, ARTIFACT_FACTS, () => new RuntimeArtifactFacts());
  const prepared = facts.prepare({ kind: "event_calculus_effect_row", eventKind: event.kind,
    sourceEvent: event, ...eventCalculusEffect(event) }, "strict", establishedLock);
  const artifacts = facts.artifacts.filter(row => row.admissionOrdinal <= predecessor.lastAdmissionOrdinal);
  assertUniqueArtifactTruth([...artifacts, prepared.artifact]);
  return (appended) => {
    if (!canonicalEquals(appended.event, event)) {
      throw new TypeError("artifact append differs from its exact pre-effect semantic projection");
    }
    const actualPrefix = projectOwnedRuntimeEventPrefixAtDurablePrefix(appended.successorPrefix);
    const extent = runtimeEventPrefixExtent(actualPrefix);
    const actualFacts = runtimePrefixComputation(actualPrefix, ARTIFACT_FACTS, () => new RuntimeArtifactFacts());
    // The append receipt owns the actual prefix; the prepared row must be its
    // next actual event and have the same complete predecessor derivation.
    if (actualFacts === facts && facts.artifacts.length === artifacts.length &&
      extent.count === predecessor.prefixEventCount + 1 &&
      actualPrefix.selection.row(extent.count - 1)?.envelope.eventId === appended.event.eventId) {
      facts.accept(prepared);
    }
    return projectOwnedPrefixArtifactTruth(appended.successorPrefix);
  };
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

export function projectValidatedPrefixArtifactTruth(prefix: DurablePrefixCoordinate,
  validatedPrefix: ValidatedRuntimeEventPrefix): ExactPrefixArtifactTruthProjection;
/** @internal */
export function projectValidatedPrefixArtifactTruth(prefix: DurablePrefixCoordinate,
  validatedPrefix: RuntimeEventPrefix): ExactPrefixArtifactTruthProjection;
export function projectValidatedPrefixArtifactTruth(prefix: DurablePrefixCoordinate,
  validatedPrefix: RuntimeEventPrefix): ExactPrefixArtifactTruthProjection {
  const extent = runtimeEventPrefixExtent(validatedPrefix);
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
    prefixEventCount: extent.count,
    lastAdmissionOrdinal: extent.lastOrdinal,
    rows,
  };
  const projectionDigest = sha256Canonical(body);
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
  readonly #prefix: RuntimeEventPrefix;
  constructor(key: typeof ARTIFACT_DERIVATION_KEY, projection: ExactPrefixArtifactTruthProjection, prefix: RuntimeEventPrefix) {
    if (key !== ARTIFACT_DERIVATION_KEY) throw new TypeError("artifact truth derivation is owner constructed");
    this.#projection = projection; this.#prefix = prefix;
    Object.freeze(this);
  }
  static isFor(value: unknown): value is ExactPrefixArtifactTruthProjection {
    if (typeof value !== "object" || value === null) return false;
    const proof: unknown = Object.getOwnPropertyDescriptor(value, ARTIFACT_DERIVATION)?.value;
    return typeof proof === "object" && proof !== null && #projection in proof && proof.#projection === value;
  }
  static prefix(value: ExactPrefixArtifactTruthProjection): RuntimeEventPrefix | null {
    if (!this.isFor(value)) return null;
    return (Object.getOwnPropertyDescriptor(value, ARTIFACT_DERIVATION)!.value as ArtifactTruthDerivation).#prefix;
  }
}

/** Pure consumers borrow the exact owner value; copies still reconstruct cold.
 * Explicit fresh validation below remains the acquisition/effect check. */
export function validateArtifactTruthProjectionValue(value: unknown): value is ExactPrefixArtifactTruthProjection {
  return ArtifactTruthDerivation.isFor(value) || validateExactPrefixArtifactTruthProjection(value);
}
/** @internal Borrow the actual owner representation; copies have no binding. */
export function runtimePrefixFromOwnedArtifactTruth(value: ExactPrefixArtifactTruthProjection): RuntimeEventPrefix | null {
  return ArtifactTruthDerivation.prefix(value);
}

export function projectExactPrefixArtifactTruth(
  prefix: DurablePrefixCoordinate,
): ExactPrefixArtifactTruthProjectionResult {
  return deriveExactPrefixArtifactTruth(prefix, coordinate => selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(coordinate)));
}

/** Pure projection from the existing authenticated coordinate receipt. Raw
 * coordinates have no receipt and retain the complete cold acquisition. */
export function projectOwnedPrefixArtifactTruth(
  prefix: DurablePrefixCoordinate,
): ExactPrefixArtifactTruthProjectionResult {
  return deriveExactPrefixArtifactTruth(prefix, projectOwnedRuntimeEventPrefixAtDurablePrefix);
}

function deriveExactPrefixArtifactTruth(
  prefix: DurablePrefixCoordinate,
  prefixAt: (prefix: DurablePrefixCoordinate) => RuntimeEventPrefix,
): ExactPrefixArtifactTruthProjectionResult {
  try {
    // Capture ordinary data once so a mutable/accessor-bearing caller cannot
    // make the validated read and the computation key name different inputs.
    const coordinate = captureDurablePrefixCoordinate(prefix);
    const validatedPrefix = prefixAt(coordinate);
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
  options: Readonly<{ requireCurrent?: boolean }> = {},
): value is ExactPrefixArtifactTruthProjection {
  try {
    if (ArtifactTruthDerivation.isFor(value)) {
      // A live consumer retaining this actual acquisition checks ordinary
      // currentness. Historical byte validation keeps its existing contract.
      if (options.requireCurrent) assertDurableRuntimePrefixCurrent(value.prefix);
      else assertDurableRuntimePrefixBytes(value.prefix);
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
    if (options.requireCurrent && projected.kind === "exact_prefix_artifact_truth_projection")
      assertDurableRuntimePrefixCurrent(projected.prefix);
    if (projected.kind !== "exact_prefix_artifact_truth_projection") return false;
    const admitted = admitJson(value);
    return admitted.kind === "ok" && canonicalEquals(projected, admitted.value);
  } catch {
    return false;
  }
}
