// Private P2 handler bindings for the first installed public-operation thread.
// The P1 definition family remains the sole request/result/refusal shape source;
// these bindings only adapt admitted values to their existing semantic owners.

import * as v from "valibot";
import { join } from "node:path";

import {
  assertPublicOperationArtifactAvailableInReplay,
  deriveReplayAdmittedRuntimeResultRelation,
  deriveResultAssessmentRuntimeSubjectRelation,
  deriveRegistrySessionView,
  type AdmittedRuntimeCatalogBasis,
  type CanonicalRuntimeEvent
} from "../../../abg/m03/index.js";
import {
  assertPrivatePublicOperationAdmissionReceipt,
  emitPrivatePublicOperationArtifactBoundary,
  emitPrivatePublicOperationOwnerEvents,
  type PublicOperationAdmissionReceipt
} from "../../../abg/m03/runner/public_operation_admission.js";
import {
  admitWorkspaceRuntimeEventBytes,
  projectRunStatusForPublicRead,
  projectRunReplayForPublicRead,
  projectRunResultForPublicRead,
  projectRuntimeResultEvidenceForPublicRead,
  RuntimeProjectionPublicReadError
} from "../../../abg/m03/runner/public_runtime_projections.js";
import {
  CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES
} from "../../../abg/m03/contracts/catalog_operation_contracts.js";
import {
  applyResolvedOwnerProjectionRelation
} from "../../../shared/validation/canonical_native_schema_projector.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  resultAssessmentFromReplayEvidenceWithEventWriter,
  type CanonicalAssessedRuntimeEvent
} from "../result_assessment/assessment.js";
import {
  bindReplayBoundPublicResultAssessmentRequest,
  resultAssessmentRef
} from "../result_assessment/constructors.js";
import {
  admitReplayResultAssessmentEvidenceAuthority,
  type ReplayAdmittedResultAssessmentEvidenceAuthority
} from "../result_assessment/evidence_authority.js";
import {
  RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES
} from "../result_assessment/operation_contracts.js";
import {
  catalogBind,
  type CatalogBindOutcome
} from "../toolchain_binding/bind.js";
import type { CatalogBindAttribution } from "../toolchain_binding/v3_carriers.js";
import {
  TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES
} from "../toolchain_binding/operation_contracts.js";
import type {
  BoundWorkspaceContext,
  CatalogBindRequest,
  WorkspaceBindingContext
} from "../public_sdk/carriers.js";
import {
  inspectPrivatePublicOperationDefinitionFamily,
  type PrivatePublicOperationDefinitionFamily
} from "./public_operation_definition_family.js";
import {
  projectPublishedPublicOperationDefinitionFromPrivate
} from "./operation_publication.js";
import {
  assertAdmittedPrivateP1PublicOperationPacket,
  type AdmittedPrivateP1PublicOperationPacket,
  type PrivateP1Definition
} from "./private_public_operation_ingress.js";
import {
  reconstructBoundRuntimeExecutionBasis
} from "./private_runtime_catalog_authority.js";
import {
  PROJECT_READ_CASE_FAMILY,
  type ProjectReadResult
} from "./project_read_case_family.js";
import {
  PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES,
  type ProjectReadRefusal,
  type ProjectReadRequest
} from "./project_read_operation_contracts.js";
import {
  projectWorkspaceStatusFromReplay
} from "../workspace/status_projection.js";
import {
  WORKSPACE_MANIFEST_RELATIVE_PATH
} from "../workspace/operations.js";
import {
  admitCatalogOverlayDeclaration,
  catalogOverlayApplicationCoordinate,
  catalogOverlayApplicationArtifactRelativePath,
  catalogOverlayApplicationArtifactValue,
  deriveCatalogOverlayApplicationAuthority,
  type CatalogBaseProgramAuthority
} from "./catalog_application_authority.js";

type WorkspaceBindDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.workspace.bind"]["bind"];
type ResultAssessDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.result.assess"]["assess"];
type AssessmentEvidenceDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.project.read"]["assessment_evidence"];
type TicketConsensusDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.project.read"]["ticket_consensus"];

export const RUNTIME_PROJECTION_PUBLIC_READ_CASES = Object.freeze([
  "run_status",
  "run_result",
  "result_evidence",
  "run_replay"
] as const);
export type RuntimeProjectionPublicReadCase =
  (typeof RUNTIME_PROJECTION_PUBLIC_READ_CASES)[number];
type RuntimeProjectionPublicReadDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.project.read"][RuntimeProjectionPublicReadCase];
type RuntimeProjectionPublicReadRequest =
  ProjectReadRequest<RuntimeProjectionPublicReadCase>;
type RuntimeProjectionPublicReadResult =
  ProjectReadResult<RuntimeProjectionPublicReadCase>;
type RuntimeProjectionPublicReadRefusal =
  ProjectReadRefusal<RuntimeProjectionPublicReadCase>;

type SourceOutput<S extends { readonly schema: v.GenericSchema }> =
  v.InferOutput<S["schema"]>;

type WorkspaceBindSources =
  typeof TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES.workspace_bind.bind;
type WorkspaceBindRequest = SourceOutput<WorkspaceBindSources["request"]>;
type WorkspaceBindResult = SourceOutput<WorkspaceBindSources["result"]>;
type WorkspaceBindRefusal = SourceOutput<WorkspaceBindSources["refusal"]>;

type CatalogViewSources =
  typeof CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_view.allowlist;
type CatalogViewResult = SourceOutput<CatalogViewSources["result"]>;
type CatalogViewRefusal = SourceOutput<CatalogViewSources["refusal"]>;
type CatalogApplyOverlaySources =
  typeof CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_apply.overlay;
type CatalogApplyOverlayResult =
  SourceOutput<CatalogApplyOverlaySources["result"]>;
type CatalogApplyOverlayRefusal =
  SourceOutput<CatalogApplyOverlaySources["refusal"]>;
type CatalogApplyNodeTypeSources =
  typeof CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_apply.node_type;
type CatalogApplyNodeTypeRefusal =
  SourceOutput<CatalogApplyNodeTypeSources["refusal"]>;

type ResultAssessSources =
  typeof RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.result_assess.assess;
type ResultAssessResult = SourceOutput<ResultAssessSources["result"]>;
type ResultAssessRefusal = SourceOutput<ResultAssessSources["refusal"]>;
type ResultAssessNonterminal = SourceOutput<ResultAssessSources["nonterminal"]>;

/** @internal */
export type PrivateOwnerHandlerResult<Result> = Readonly<{
  kind: "owner_handler_result";
  value: Result;
  emittedEvents: readonly CanonicalRuntimeEvent[];
}>;
/** @internal */
export type PrivateOwnerHandlerRefusal<Refusal> = Readonly<{
  kind: "owner_handler_refusal";
  value: Refusal;
  emittedEvents: readonly CanonicalRuntimeEvent[];
}>;
/** @internal */
export type PrivateOwnerHandlerNonterminal<Nonterminal> = Readonly<{
  kind: "owner_handler_nonterminal";
  value: Nonterminal;
  emittedEvents: readonly CanonicalRuntimeEvent[];
}>;
/** @internal */
export type PrivateOwnerHandlerOutcome<Result, Refusal, Nonterminal = never> =
  | PrivateOwnerHandlerResult<Result>
  | PrivateOwnerHandlerRefusal<Refusal>
  | PrivateOwnerHandlerNonterminal<Nonterminal>;

/** @internal */
export interface PrivateProjectReadHandlerGap {
  readonly kind: "handler_semantic_not_realized";
  readonly gapCode: "ticket_consensus_handler_pending_t275";
  readonly coordinate: {
    readonly definitionKey: TicketConsensusDefinition["definitionKey"];
    readonly slot: "result";
  };
  readonly ownerTicket: "T-275";
  readonly evidenceRefs: readonly [
    ".ai-workspace/tickets/active/T-275-realize-consensus-profile-and-ticket-result-contracts.md"
  ];
}

/** @internal */
export function assertExactPrivateOperationFamily(
  family: PrivatePublicOperationDefinitionFamily
): void {
  const admission = inspectPrivatePublicOperationDefinitionFamily(family);
  if (admission.kind !== "exact_family_admitted") {
    throw new TypeError("private owner handler binding requires the exact P1 family");
  }
}

function assertExactOwnKeys(
  input: object,
  expected: readonly string[],
  label: string
): void {
  const actual = Reflect.ownKeys(input);
  if (
    actual.length !== expected.length ||
    !expected.every((key) => actual.includes(key))
  ) {
    throw new TypeError(`${label}: expected exact keys ${expected.join(",")}`);
  }
}

/** @internal */
export function admitP1OwnerValue<const S extends v.GenericSchema>(
  p1Schema: v.GenericSchema,
  ownerSchema: S,
  raw: unknown
): v.InferOutput<S> {
  return v.parse(ownerSchema, v.parse(p1Schema, raw));
}

/** @internal */
export function privateOwnerResult<Result>(
  value: Result,
  emittedEvents: readonly CanonicalRuntimeEvent[] = Object.freeze([])
): PrivateOwnerHandlerResult<Result> {
  return Object.freeze({
    kind: "owner_handler_result",
    value,
    emittedEvents: Object.freeze([...emittedEvents])
  });
}

/** @internal */
export function privateOwnerRefusal<Refusal>(
  value: Refusal,
  emittedEvents: readonly CanonicalRuntimeEvent[] = Object.freeze([])
): PrivateOwnerHandlerRefusal<Refusal> {
  return Object.freeze({
    kind: "owner_handler_refusal",
    value,
    emittedEvents: Object.freeze([...emittedEvents])
  });
}

/** @internal */
export interface PrivateOwnerArtifactBoundaryContext {
  readonly admission: PublicOperationAdmissionReceipt;
}

/** @internal */
export function assertPrivateOwnerEventAdmission<
  const D extends PrivateP1Definition
>(input: {
  readonly definition: D;
  readonly packet: AdmittedPrivateP1PublicOperationPacket<D>;
  readonly admission: PublicOperationAdmissionReceipt;
}): void {
  assertAdmittedPrivateP1PublicOperationPacket(
    input.packet,
    input.definition
  );
  assertPrivatePublicOperationAdmissionReceipt(input.admission);
  const event = input.admission.event;
  const invocation = input.packet.invocation;
  const publishedDefinitionDigest =
    projectPublishedPublicOperationDefinitionFromPrivate(input.definition)
      .definitionDigest;
  if (
    event.definitionDigest !== publishedDefinitionDigest ||
    !stableJsonEquals(event.definitionKey, input.definition.definitionKey) ||
    event.invocationRef !== invocation.invocationRef ||
    event.invocationDigest !== invocation.invocationDigest
  ) {
    throw new TypeError(
      "private owner event admission differs from its admitted P1 packet"
    );
  }
}

/** @internal */
export function emitPrivateOwnerArtifactBoundary<
  const D extends PrivateP1Definition
>(input: {
  readonly definition: D;
  readonly packet: AdmittedPrivateP1PublicOperationPacket<D>;
  readonly boundary: PrivateOwnerArtifactBoundaryContext;
  readonly scopeRef: string;
  readonly scopeDigest: string;
  readonly disposition: string;
  readonly artifactRef: string;
  readonly artifactDigest: string;
}): readonly CanonicalRuntimeEvent[] {
  assertPrivateOwnerEventAdmission({
    definition: input.definition,
    packet: input.packet,
    admission: input.boundary.admission
  });
  return Object.freeze([emitPrivatePublicOperationArtifactBoundary({
    admission: input.boundary.admission,
    scopeRef: input.scopeRef,
    scopeDigest: input.scopeDigest,
    disposition: input.disposition,
    artifactRef: input.artifactRef,
    artifactDigest: input.artifactDigest
  })]);
}

function exactStringSet(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return stableJsonEquals([...left].sort(), [...right].sort());
}

function bindingDeclaredRoots(
  request: CatalogBindRequest
): readonly string[] | null {
  const roots = request.mutableStateRoots;
  if (roots === null) {
    return null;
  }
  return Object.freeze([...new Set([
    roots.observedWorkspaceRoot,
    roots.observerStateRoot,
    roots.executorStateRoot,
    roots.eventRoot,
    roots.runtimeRoot,
    roots.projectionRoot,
    roots.archiveRoot
  ])]);
}

function workspaceBindRequestMatchesOwnerFacts(input: {
  readonly request: WorkspaceBindRequest;
  readonly ownerRequest: CatalogBindRequest;
  readonly context: WorkspaceBindingContext;
}): boolean {
  const declaredRoots = bindingDeclaredRoots(input.ownerRequest);
  const installedSet = input.ownerRequest.installedProductRecords.map(
    (record) => Object.freeze({
      ref: record.installedProductId,
      digest: stableSha256Digest(record)
    })
  );
  return (
    declaredRoots !== null &&
    input.request.workspaceAuthorityRef ===
      input.context.workspaceManifest.workspaceId &&
    input.request.workspaceAuthorityDigest ===
      stableSha256Digest(input.context.workspaceManifest) &&
    input.ownerRequest.workspaceId === input.context.workspaceManifest.workspaceId &&
    input.ownerRequest.workspaceManifestDigest ===
      input.request.workspaceAuthorityDigest &&
    input.request.resolvedLockRef === input.ownerRequest.resolvedLock.lockId &&
    input.request.resolvedLockDigest ===
      input.ownerRequest.resolvedLock.lockDigest &&
    stableJsonEquals(input.request.installedSet, installedSet) &&
    exactStringSet(input.request.declaredRoots, declaredRoots)
  );
}

function workspaceBindRefusal(
  definition: WorkspaceBindDefinition,
  code: WorkspaceBindRefusal["code"],
  message: string,
  residualRefs: readonly string[] = Object.freeze([])
): WorkspaceBindRefusal {
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES.workspace_bind.bind.refusal.schema,
    {
    code,
    message,
    residualRefs
    }
  );
}

function mapCatalogBindRefusal(
  definition: WorkspaceBindDefinition,
  outcome: Extract<CatalogBindOutcome, { readonly kind: "refused" }>
): WorkspaceBindRefusal {
  return workspaceBindRefusal(
    definition,
    outcome.code,
    outcome.message,
    outcome.residualRefs
  );
}

/** @internal */
export interface WorkspaceBindArtifactAdmissionContext {
  readonly admission: PublicOperationAdmissionReceipt;
}

/** @internal */
export function bindPrivateWorkspaceBindHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.workspace.bind"].bind;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        WorkspaceBindDefinition
      >;
      readonly ownerRequest: CatalogBindRequest;
      readonly context: WorkspaceBindingContext;
      readonly priorEvents: readonly CanonicalRuntimeEvent[];
      readonly attribution: CatalogBindAttribution;
      readonly artifactBoundary: WorkspaceBindArtifactAdmissionContext;
    }): Promise<PrivateOwnerHandlerOutcome<WorkspaceBindResult, WorkspaceBindRefusal>> {
      assertPrivateOwnerEventAdmission({
        definition,
        packet: input.packet,
        admission: input.artifactBoundary.admission
      });
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES.workspace_bind.bind.request.schema,
        input.packet.invocation.request
      );
      if (!workspaceBindRequestMatchesOwnerFacts({
        request,
        ownerRequest: input.ownerRequest,
        context: input.context
      })) {
        return privateOwnerRefusal(
          workspaceBindRefusal(
            definition,
            "lock_mismatch",
            "workspace.bind request differs from its admitted owner facts"
          )
        );
      }
      const manifest = input.context.workspaceManifest;
      const manifestDigest = stableSha256Digest(manifest);
      assertPublicOperationArtifactAvailableInReplay({
        events: input.priorEvents,
        operationId: "abg.operation.workspace.create",
        scopeRef: manifest.workspaceId,
        scopeDigest: manifestDigest,
        artifactRef: join(manifest.root, WORKSPACE_MANIFEST_RELATIVE_PATH),
        artifactDigest: manifestDigest
      });
      for (const record of input.ownerRequest.installedProductRecords) {
        const recordDigest = stableSha256Digest(record);
        assertPublicOperationArtifactAvailableInReplay({
          events: input.priorEvents,
          operationId: "abg.operation.product.install",
          scopeRef: record.installedProductId,
          scopeDigest: recordDigest,
          artifactRef: record.installedProductId,
          artifactDigest: recordDigest
        });
      }
      const ownerOutcome = await catalogBind(
        input.ownerRequest,
        input.context,
        input.attribution
      );
      if (ownerOutcome.kind === "refused") {
        return privateOwnerRefusal(mapCatalogBindRefusal(definition, ownerOutcome));
      }
      const binding = ownerOutcome.value;
      const result = admitP1OwnerValue(
        definition.resultContract.contract.schema,
        TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES.workspace_bind.bind.result.schema,
        {
        workspaceBindingRef: binding.bindingId,
        workspaceBindingDigest: binding.bindingDigest,
        bindingManifestRef: binding.bindingId,
        bindingManifestDigest: binding.bindingDigest
        }
      );
      const boundaryEvents = emitPrivateOwnerArtifactBoundary({
        definition,
        packet: input.packet,
        boundary: input.artifactBoundary,
        scopeRef: request.workspaceAuthorityRef,
        scopeDigest: request.workspaceAuthorityDigest,
        disposition: ownerOutcome.disposition,
        artifactRef: binding.bindingId,
        artifactDigest: binding.bindingDigest
      });
      return privateOwnerResult(result, boundaryEvents);
    }
  });
}

function catalogViewRefusalCode(
  reason: string
): CatalogViewRefusal["code"] {
  switch (reason) {
    case "duplicate_handle":
      return "duplicate";
    case "unknown_handle":
      return "unknown";
    case "inadmissible":
      return "inadmissible";
    case "unready":
      return "not_ready";
    default:
      return "inadmissible";
  }
}

function assertCatalogViewAuthorityJoin(input: {
  readonly packet: AdmittedPrivateP1PublicOperationPacket;
  readonly context: BoundWorkspaceContext;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
}): void {
  const authority = input.packet.invocation.authority;
  const binding = input.context.binding;
  const manifest = input.context.workspaceManifest;
  if (
    authority.workspace.state !== "admitted_workspace" ||
    authority.productSet.state !== "admitted_product_set" ||
    authority.dependencyLock.state !== "admitted_dependency_lock" ||
    authority.workspace.bindingRef !== binding.bindingId ||
    authority.workspace.bindingDigest !== binding.bindingDigest ||
    authority.productSet.productSetDigest !== binding.productSetDigest ||
    authority.dependencyLock.lockRef !== binding.resolvedLockId ||
    authority.dependencyLock.lockDigest !== binding.resolvedLockDigest ||
    manifest.workspaceId !== binding.workspaceId ||
    stableSha256Digest(manifest) !== binding.workspaceManifestDigest ||
    input.catalogBasis.workspaceId !== binding.workspaceId ||
    input.catalogBasis.bindingId !== binding.bindingId ||
    input.catalogBasis.resolvedLockRef !== binding.resolvedLockId
  ) {
    throw new TypeError(
      "catalog.view authority differs from its bound workspace and runtime catalog"
    );
  }
}

/** @internal */
export function bindPrivateCatalogViewHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.catalog.view"].allowlist;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        typeof definition
      >;
      readonly context: BoundWorkspaceContext;
      readonly catalogBasis: AdmittedRuntimeCatalogBasis;
      readonly baseProgram: CatalogBaseProgramAuthority;
    }): Promise<PrivateOwnerHandlerOutcome<CatalogViewResult, CatalogViewRefusal>> {
      assertAdmittedPrivateP1PublicOperationPacket(input.packet, definition);
      assertCatalogViewAuthorityJoin(input);
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_view.allowlist.request.schema,
        input.packet.invocation.request
      );
      const derived = deriveRegistrySessionView({
        basis: input.catalogBasis,
        allowedEntryRefs: request.allowlist
      });
      if (!derived.accepted || derived.view === null) {
        const first = derived.residuals[0];
        const code = catalogViewRefusalCode(
          first?.reason ?? "inadmissible"
        );
        return privateOwnerRefusal(admitP1OwnerValue(
          definition.refusalContract.contract.schema,
          CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_view.allowlist.refusal.schema,
          {
          code,
          message: first === undefined
            ? "catalog view could not be derived"
            : `${first.reason}: ${first.entryRef}`,
          residualRefs: derived.residuals.map(
            (residual) => residual.entryRef
          )
          }
        ));
      }
      const view = derived.view;
      const applicationCandidates: Array<
        ReturnType<typeof catalogOverlayApplicationCoordinate>
      > = [];
      const applicationResiduals: Array<{
        readonly handle: string;
        readonly code: "inadmissible";
      }> = [];
      for (const entry of view.entries) {
        if (entry.entryKind !== "overlay") continue;
        const assetPath = exactCatalogOverlayAssetPath({
          context: input.context,
          catalogBasis: input.catalogBasis,
          catalogRowRef: entry.entryRef
        });
        const overlayAsset = assetPath === null
          ? null
          : await input.context.effects.readRecord(assetPath);
        if (overlayAsset === null) {
          applicationResiduals.push(Object.freeze({
            handle: entry.entryRef,
            code: "inadmissible" as const
          }));
          continue;
        }
        try {
          const overlayDeclaration = admitCatalogOverlayDeclaration(overlayAsset);
          if (overlayDeclaration.graphFunctionRefs.length !== 1) {
            throw new TypeError(
              "catalog.view candidate requires exactly one target GraphFunction"
            );
          }
          const authority = deriveCatalogOverlayApplicationAuthority({
            catalogBasis: input.catalogBasis,
            catalogRowRef: entry.entryRef,
            overlayAsset: overlayDeclaration,
            baseProgram: input.baseProgram
          });
          if (
            authority.catalogView.ref !== view.sessionViewRef ||
            authority.catalogView.digest !== stableSha256Digest(view)
          ) {
            throw new TypeError(
              "catalog.view allowlist differs from the exact application view"
            );
          }
          applicationCandidates.push(
            catalogOverlayApplicationCoordinate(authority)
          );
        } catch {
          applicationResiduals.push(Object.freeze({
            handle: entry.entryRef,
            code: "inadmissible" as const
          }));
        }
      }
      return privateOwnerResult(admitP1OwnerValue(
        definition.resultContract.contract.schema,
        CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_view.allowlist.result.schema,
        {
        catalogViewRef: view.sessionViewRef,
        catalogViewDigest: stableSha256Digest(view),
        effectiveHandles: view.allowedEntryRefs,
        residuals: applicationResiduals,
        applicationCandidates
        }
      ));
    }
  });
}

function catalogApplyRefusal(
  definition:
    | PrivatePublicOperationDefinitionFamily["abg.operation.catalog.apply"]["overlay"]
    | PrivatePublicOperationDefinitionFamily["abg.operation.catalog.apply"]["node_type"],
  source:
    | CatalogApplyOverlaySources
    | CatalogApplyNodeTypeSources,
  code: CatalogApplyOverlayRefusal["code"],
  message: string,
  residualRefs: readonly string[] = Object.freeze([])
): CatalogApplyOverlayRefusal | CatalogApplyNodeTypeRefusal {
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    source.refusal.schema,
    { code, message, residualRefs }
  );
}

/** @internal */
export function exactCatalogOverlayAssetPath(input: {
  readonly context: BoundWorkspaceContext;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly catalogRowRef: string;
}): string | null {
  const rows = input.catalogBasis.projection.opaqueAssetEntries.filter(
    (row) =>
      row.entryRef === input.catalogRowRef && row.assetKind === "overlay"
  );
  const row = rows[0];
  if (rows.length !== 1 || row === undefined) return null;
  const products = input.context.binding.products.filter((product) =>
    product.productId === row.namespace &&
    product.publisher === row.ownerRef &&
    product.version === row.version &&
    product.descriptorId === row.descriptorRef &&
    product.contributionId === row.contributionManifestRef &&
    input.context.binding.resolvedLockId === row.resolvedLockRef
  );
  const product = products[0];
  if (products.length !== 1 || product === undefined) return null;
  return join(product.productRoot, row.assetPath);
}

/** @internal */
export function bindPrivateCatalogApplyHandler<
  const Kind extends "node_type" | "overlay"
>(
  family: PrivatePublicOperationDefinitionFamily,
  kind: Kind
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.catalog.apply"][kind];
  const sources = CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_apply[kind];
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket;
      readonly context: BoundWorkspaceContext;
      readonly catalogBasis: AdmittedRuntimeCatalogBasis;
      readonly baseProgram: CatalogBaseProgramAuthority;
      readonly artifactBoundary: PrivateOwnerArtifactBoundaryContext;
    }): Promise<PrivateOwnerHandlerOutcome<
      CatalogApplyOverlayResult,
      CatalogApplyOverlayRefusal | CatalogApplyNodeTypeRefusal
    >> {
      assertPrivateOwnerEventAdmission({
        definition,
        packet: input.packet,
        admission: input.artifactBoundary.admission
      });
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        sources.request.schema,
        input.packet.invocation.request
      );
      if (kind === "node_type") {
        return privateOwnerRefusal(catalogApplyRefusal(
          definition,
          sources,
          "application_refused",
          "catalog.apply(node_type) semantic realization is not admitted"
        ));
      }
      const assetPath = exactCatalogOverlayAssetPath({
        context: input.context,
        catalogBasis: input.catalogBasis,
        catalogRowRef: request.catalogRowRef
      });
      if (assetPath === null) {
        return privateOwnerRefusal(catalogApplyRefusal(
          definition,
          sources,
          "kind_mismatch",
          "catalog.apply overlay row is absent or not an admitted overlay",
          [request.catalogRowRef]
        ));
      }
      const overlayAsset = await input.context.effects.readRecord(assetPath);
      if (overlayAsset === null) {
        return privateOwnerRefusal(catalogApplyRefusal(
          definition,
          sources,
          "application_refused",
          "catalog.apply overlay asset is missing",
          [request.declarationRef]
        ));
      }
      let overlayDeclaration;
      try {
        overlayDeclaration = admitCatalogOverlayDeclaration(overlayAsset);
      } catch (error: unknown) {
        return privateOwnerRefusal(catalogApplyRefusal(
          definition,
          sources,
          "application_refused",
          error instanceof Error
            ? error.message
            : "catalog.apply overlay declaration is malformed",
          [request.declarationRef]
        ));
      }
      if (overlayDeclaration.graphFunctionRefs.length !== 1) {
        return privateOwnerRefusal(catalogApplyRefusal(
          definition,
          sources,
          "target_invalid",
          "catalog.apply sunny overlay requires exactly one target GraphFunction",
          [request.declarationRef, request.targetRef]
        ));
      }
      let authority;
      try {
        authority = deriveCatalogOverlayApplicationAuthority({
          catalogBasis: input.catalogBasis,
          catalogRowRef: request.catalogRowRef,
          overlayAsset: overlayDeclaration,
          baseProgram: input.baseProgram
        });
      } catch (error: unknown) {
        return privateOwnerRefusal(catalogApplyRefusal(
          definition,
          sources,
          "application_refused",
          error instanceof Error
            ? error.message
            : "catalog.apply overlay application could not be derived",
          [request.catalogRowRef, request.declarationRef]
        ));
      }
      const requestedCoordinate = Object.freeze({
        catalogRowRef: request.catalogRowRef,
        catalogRowDigest: request.catalogRowDigest,
        catalogViewRef: request.catalogViewRef,
        catalogViewDigest: request.catalogViewDigest,
        declarationRef: request.declarationRef,
        declarationDigest: request.declarationDigest,
        targetRef: request.targetRef,
        targetDigest: request.targetDigest,
        applicationBasisRef: request.applicationBasisRef,
        applicationBasisDigest: request.applicationBasisDigest
      });
      const derivedCoordinate = Object.freeze({
        catalogRowRef: authority.catalogRow.ref,
        catalogRowDigest: authority.catalogRow.digest,
        catalogViewRef: authority.catalogView.ref,
        catalogViewDigest: authority.catalogView.digest,
        declarationRef: authority.declaration.ref,
        declarationDigest: authority.declaration.digest,
        targetRef: authority.applicationTarget.ref,
        targetDigest: authority.applicationTarget.digest,
        applicationBasisRef: authority.applicationBasis.ref,
        applicationBasisDigest: authority.applicationBasis.digest
      });
      if (!stableJsonEquals(requestedCoordinate, derivedCoordinate)) {
        return privateOwnerRefusal(catalogApplyRefusal(
          definition,
          sources,
          "target_invalid",
          "catalog.apply request differs from the derived application coordinate",
          [request.catalogRowRef, request.catalogViewRef, request.targetRef]
        ));
      }
      const artifact = catalogOverlayApplicationArtifactValue(authority);
      const artifactDigest = stableSha256Digest(artifact);
      await input.context.effects.writeImmutableRuntimeRecord(
        catalogOverlayApplicationArtifactRelativePath(
          authority.applicationRef
        ),
        artifact
      );
      const boundaryEvents = emitPrivateOwnerArtifactBoundary({
        definition,
        packet: input.packet,
        boundary: input.artifactBoundary,
        scopeRef: authority.target.ref,
        scopeDigest: authority.target.digest,
        disposition: "applied",
        artifactRef: authority.applicationRef,
        artifactDigest
      });
      const result = admitP1OwnerValue(
        definition.resultContract.contract.schema,
        CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_apply.overlay.result
          .schema,
        {
          applicationRef: authority.applicationRef,
          applicationKind: "overlay",
          declarationRef: authority.declaration.ref,
          targetRef: authority.target.ref,
          targetDigest: authority.target.digest,
          evidenceRefs: boundaryEvents.map((event) => event.eventId),
          provenanceRefs: authority.provenanceRefs
        }
      );
      return privateOwnerResult(result, boundaryEvents);
    }
  });
}

function workspaceStatusRefusal(
  family: PrivatePublicOperationDefinitionFamily,
  request: ProjectReadRequest<"workspace_status">,
  code: ProjectReadRefusal<"workspace_status">["code"],
  residualRefs: readonly string[]
): ProjectReadRefusal<"workspace_status"> {
  const definition = family["abg.operation.project.read"].workspace_status;
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.workspace_status.refusal.schema,
    {
      kind: "project_read_refusal",
      caseKey: "workspace_status",
      source: request.source,
      projectionBasis: request.projectionBasis,
      code,
      residualRefs,
      evidenceRefs: [],
      provenanceRefs: []
    }
  );
}

/** @internal */
export function bindPrivateWorkspaceStatusProjectReadHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.project.read"].workspace_status;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        typeof definition
      >;
      readonly context: BoundWorkspaceContext;
    }): Promise<PrivateOwnerHandlerOutcome<
      ProjectReadResult<"workspace_status">,
      ProjectReadRefusal<"workspace_status">
    >> {
      assertExactOwnKeys(
        input,
        ["packet", "context"],
        "project.read workspace_status input"
      );
      assertAdmittedPrivateP1PublicOperationPacket(input.packet, definition);
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.workspace_status.request.schema,
        input.packet.invocation.request
      );
      let projection;
      try {
        const replay = admitWorkspaceRuntimeEventBytes(
          await input.context.effects.readRuntimeEventBytes()
        );
        projection = v.parse(
          definition.resultContract.projectionContract.schema,
          projectWorkspaceStatusFromReplay({
            request,
            context: input.context,
            replay
          })
        );
      } catch (error: unknown) {
        const diagnostic =
          error instanceof Error ? error.message : "malformed_projection";
        return privateOwnerRefusal(workspaceStatusRefusal(
          family,
          request,
          "projection_unsupported",
          [
            "projection-refusal:workspace_status:" +
              stableSha256Digest({ diagnostic })
          ]
        ));
      }
      const relation = applyResolvedOwnerProjectionRelation({
        relation: definition.resultContract.projectionRelation,
        definitionKey: definition.definitionKey,
        admittedRequest: request,
        candidateProjection: projection
      });
      if (relation.kind === "projection_relation_mismatch") {
        return privateOwnerRefusal(workspaceStatusRefusal(
          family,
          request,
          "projection_basis_mismatch",
          relation.issuePaths.map(
            (path) =>
              "projection-relation:workspace_status:" +
                stableSha256Digest({ path })
          )
        ));
      }
      return privateOwnerResult(admitP1OwnerValue(
        definition.resultContract.contract.schema,
        PROJECT_READ_CASE_FAMILY.workspace_status.result.source.schema,
        {
          kind: "project_read_result",
          caseKey: "workspace_status",
          projectionBasis: request.projectionBasis,
          projection
        }
      ));
    }
  });
}

function isRuntimeProjectionPublicReadCase(
  value: string
): value is RuntimeProjectionPublicReadCase {
  return RUNTIME_PROJECTION_PUBLIC_READ_CASES.some(
    (caseKey) => caseKey === value
  );
}

function runtimeProjectionPublicReadRefusal(input: {
  readonly definition: RuntimeProjectionPublicReadDefinition;
  readonly request: RuntimeProjectionPublicReadRequest;
  readonly code: RuntimeProjectionPublicReadRefusal["code"];
  readonly residualRefs: readonly string[];
}): RuntimeProjectionPublicReadRefusal {
  const source =
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES[input.request.caseKey];
  return admitP1OwnerValue(
    input.definition.refusalContract.contract.schema,
    source.refusal.schema,
    {
      kind: "project_read_refusal",
      caseKey: input.request.caseKey,
      source: input.request.source,
      projectionBasis: input.request.projectionBasis,
      code: input.code,
      residualRefs: input.residualRefs,
      evidenceRefs: [],
      provenanceRefs: []
    }
  );
}

async function projectRuntimePublicRead(input: {
  readonly request: RuntimeProjectionPublicReadRequest;
  readonly replay: ReturnType<typeof admitWorkspaceRuntimeEventBytes>;
  readonly context: BoundWorkspaceContext;
}) {
  const request = input.request;
  if (!isSha256Digest(request.source.sourceDigest)) {
    throw new RuntimeProjectionPublicReadError(
      "source_digest_mismatch",
      "runtime project.read requires one sha256 source digest"
    );
  }
  switch (request.caseKey) {
    case "run_status": {
      const authority = await reconstructBoundRuntimeExecutionBasis({
        context: input.context,
        priorEvents: input.replay.orderedEvents,
        runRef: request.source.sourceRef
      });
      return projectRunStatusForPublicRead({
        replay: input.replay,
        source: request.source,
        authority
      });
    }
    case "run_result":
      return projectRunResultForPublicRead({
        replay: input.replay,
        source: request.source
      });
    case "result_evidence":
      return projectRuntimeResultEvidenceForPublicRead({
        replay: input.replay,
        source: request.source
      });
    case "run_replay":
      return projectRunReplayForPublicRead({
        replay: input.replay,
        source: request.source,
        fromOrdinal: request.selector.fromOrdinal,
        limit: request.selector.limit
      });
  }
}

/** @internal */
export function bindPrivateRuntimeProjectionProjectReadHandler(
  family: PrivatePublicOperationDefinitionFamily,
  caseKey: RuntimeProjectionPublicReadCase
) {
  assertExactPrivateOperationFamily(family);
  if (!isRuntimeProjectionPublicReadCase(caseKey)) {
    throw new TypeError(
      `runtime project.read binding rejects case ${JSON.stringify(caseKey)}`
    );
  }
  const definition = family["abg.operation.project.read"][caseKey];
  const sources = PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES[caseKey];
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        RuntimeProjectionPublicReadDefinition
      >;
      readonly context: BoundWorkspaceContext;
    }): Promise<PrivateOwnerHandlerOutcome<
      RuntimeProjectionPublicReadResult,
      RuntimeProjectionPublicReadRefusal
    >> {
      assertExactOwnKeys(
        input,
        ["packet", "context"],
        `project.read ${caseKey} input`
      );
      assertAdmittedPrivateP1PublicOperationPacket(input.packet, definition);
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        sources.request.schema,
        input.packet.invocation.request
      );
      let projection;
      try {
        const replay = admitWorkspaceRuntimeEventBytes(
          await input.context.effects.readRuntimeEventBytes()
        );
        projection = v.parse(
          definition.resultContract.projectionContract.schema,
          await projectRuntimePublicRead({
            request,
            replay,
            context: input.context
          })
        );
      } catch (error: unknown) {
        const diagnostic =
          error instanceof Error ? error.message : "malformed_projection";
        const code = error instanceof RuntimeProjectionPublicReadError
          ? error.code
          : "projection_unsupported";
        return privateOwnerRefusal(runtimeProjectionPublicReadRefusal({
          definition,
          request,
          code,
          residualRefs: Object.freeze([
            `projection-refusal:${caseKey}:` +
              stableSha256Digest({ diagnostic })
          ])
        }));
      }
      // The case is runtime-admitted above. This adapter erases only the
      // heterogeneous tuple's static correlation; the relation rechecks the
      // request, key, and projection before accepting the result.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- runtime relation re-admits the discriminated tuple
      const applyDynamicRelation = applyResolvedOwnerProjectionRelation as unknown as (
        relationInput: Readonly<{
          relation: unknown;
          definitionKey: unknown;
          admittedRequest: unknown;
          candidateProjection: unknown;
        }>
      ) => Readonly<
        { kind: "projection_related" } |
        { kind: "projection_relation_mismatch"; issuePaths: readonly string[] }
      >;
      const relation = applyDynamicRelation({
        relation: definition.resultContract.projectionRelation,
        definitionKey: definition.definitionKey,
        admittedRequest: request,
        candidateProjection: projection
      });
      if (relation.kind === "projection_relation_mismatch") {
        return privateOwnerRefusal(runtimeProjectionPublicReadRefusal({
          definition,
          request,
          code: "projection_basis_mismatch",
          residualRefs: relation.issuePaths.map(
            (path) =>
              `projection-relation:${caseKey}:` +
                stableSha256Digest({ path })
          )
        }));
      }
      return privateOwnerResult(admitP1OwnerValue(
        definition.resultContract.contract.schema,
        PROJECT_READ_CASE_FAMILY[caseKey].result.source.schema,
        {
          kind: "project_read_result",
          caseKey,
          projectionBasis: request.projectionBasis,
          projection
        }
      ));
    }
  });
}

function assessmentEvidenceRefusal(
  definition: AssessmentEvidenceDefinition,
  request: ProjectReadRequest<"assessment_evidence">,
  code: ProjectReadRefusal<"assessment_evidence">["code"],
  residualRefs: readonly string[]
): ProjectReadRefusal<"assessment_evidence"> {
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.assessment_evidence.refusal.schema,
    {
      kind: "project_read_refusal",
      caseKey: "assessment_evidence",
      source: request.source,
      projectionBasis: request.projectionBasis,
      code,
      residualRefs,
      evidenceRefs: [],
      provenanceRefs: []
    }
  );
}

function assertAssessmentEvidenceProjectionAuthority(input: {
  readonly request: ProjectReadRequest<"assessment_evidence">;
  readonly events: readonly CanonicalRuntimeEvent[];
}): never {
  const assessedRows = input.events.filter(
    (event) =>
      event.kind === "assessed" &&
      event.assessmentRef === input.request.source.sourceRef
  );
  const assessed = assessedRows[0];
  if (assessed === undefined || assessed.kind !== "assessed") {
    throw new TypeError(
      "assessment evidence projection requires replay-admitted assessment truth"
    );
  }
  const relation = deriveResultAssessmentRuntimeSubjectRelation({
    events: input.events,
    assessmentRef: input.request.source.sourceRef,
    runtimeSubject: {
      basisId: assessed.basisId,
      graphCallId: assessed.graphCallId,
      frameId: assessed.frameId,
      vectorIndex: assessed.vectorIndex,
      runtimeResult: {
        ref: assessed.runtimeResultRef,
        digest: assessed.runtimeResultDigest
      }
    }
  });
  if (relation.assessment.digest !== input.request.source.sourceDigest) {
    throw new TypeError(
      "assessment evidence projection source differs from replay truth"
    );
  }
  throw new TypeError(
    "assessment evidence projection requires admitted evidence-contract and stable-basis digest coordinates"
  );
}

/** @internal */
export function bindPrivateAssessmentEvidenceProjectReadHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.project.read"].assessment_evidence;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        AssessmentEvidenceDefinition
      >;
      readonly context: BoundWorkspaceContext;
    }): Promise<PrivateOwnerHandlerOutcome<
      ProjectReadResult<"assessment_evidence">,
      ProjectReadRefusal<"assessment_evidence">
    >> {
      assertExactOwnKeys(
        input,
        ["packet", "context"],
        "project.read assessment_evidence input"
      );
      assertAdmittedPrivateP1PublicOperationPacket(input.packet, definition);
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.assessment_evidence.request.schema,
        input.packet.invocation.request
      );
      try {
        const replay = admitWorkspaceRuntimeEventBytes(
          await input.context.effects.readRuntimeEventBytes()
        );
        assertAssessmentEvidenceProjectionAuthority({
          request,
          events: replay.orderedEvents
        });
      } catch (error: unknown) {
        const diagnostic =
          error instanceof Error ? error.message : "malformed_projection";
        return privateOwnerRefusal(assessmentEvidenceRefusal(
          definition,
          request,
          "projection_unsupported",
          [
            "projection-refusal:assessment_evidence:" +
              stableSha256Digest({ diagnostic })
          ]
        ));
      }
    }
  });
}

/** @internal */
export function bindPrivateTicketConsensusProjectReadGap(
  family: PrivatePublicOperationDefinitionFamily
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.project.read"].ticket_consensus;
  return Object.freeze({
    kind: "private_public_operation_handler_gap" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    execute(): PrivateProjectReadHandlerGap {
      return freezeNativeValue({
        kind: "handler_semantic_not_realized" as const,
        gapCode: "ticket_consensus_handler_pending_t275" as const,
        coordinate: {
          definitionKey: definition.definitionKey,
          slot: "result" as const
        },
        ownerTicket: "T-275" as const,
        evidenceRefs: [
          ".ai-workspace/tickets/active/T-275-realize-consensus-profile-and-ticket-result-contracts.md"
        ] as const
      });
    }
  });
}

function resultAssessmentRefusal(
  definition: ResultAssessDefinition,
  code: ResultAssessRefusal["code"],
  message: string,
  residualRefs: readonly string[] = Object.freeze([])
): ResultAssessRefusal {
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.result_assess.assess.refusal.schema,
    { code, message, residualRefs }
  );
}

function isSha256Digest(value: string | null): value is `sha256:${string}` {
  return value !== null && /^sha256:[0-9a-f]{64}$/u.test(value);
}

/** @internal */
export function bindPrivateResultAssessHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.result.assess"].assess;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        ResultAssessDefinition
      >;
      readonly priorEvents: readonly CanonicalRuntimeEvent[];
      readonly admission: PublicOperationAdmissionReceipt;
    }): PrivateOwnerHandlerOutcome<
      ResultAssessResult,
      ResultAssessRefusal,
      ResultAssessNonterminal
    > {
      assertPrivateOwnerEventAdmission({
        definition,
        packet: input.packet,
        admission: input.admission
      });
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.result_assess.assess.request.schema,
        input.packet.invocation.request
      );
      let runtimeResultRelation;
      try {
        runtimeResultRelation = deriveReplayAdmittedRuntimeResultRelation({
          events: input.priorEvents,
          runtimeResultRef: request.runtimeResultRef,
          runtimeResultDigest: request.runtimeResultDigest
        });
      } catch (error: unknown) {
        return privateOwnerRefusal(resultAssessmentRefusal(
          definition,
          "result_missing",
          error instanceof Error
            ? error.message
            : "runtime result is absent from the T-271 replay relation"
        ));
      }
      if (
        !isSha256Digest(request.assessmentContractDigest) ||
        request.assessmentContractRef !== runtimeResultRelation.targetContract.ref ||
        request.assessmentContractDigest !==
          runtimeResultRelation.targetContract.digest
      ) {
        return privateOwnerRefusal(resultAssessmentRefusal(
          definition,
          "assessment_contract_mismatch",
          "result assessment contract is not the exact replay-admitted target-carrier contract"
        ));
      }
      const invocationAuthority = input.packet.invocation.authority;
      if (invocationAuthority.actor.state !== "admitted_actor") {
        return privateOwnerRefusal(resultAssessmentRefusal(
          definition,
          "basis_mismatch",
          "result assessment requires admitted actor attribution"
        ));
      }
      let replayBoundRequest;
      try {
        replayBoundRequest = bindReplayBoundPublicResultAssessmentRequest({
          assessmentValue: request.assessment,
          assessmentContract: Object.freeze({
            ref: request.assessmentContractRef,
            digest: request.assessmentContractDigest
          }),
          runtimeResultRelation,
          invocationAuthority: Object.freeze({
            authoritySetRef: invocationAuthority.authoritySetRef,
            authoritySetDigest: invocationAuthority.authoritySetDigest,
            authorityBasisRef: invocationAuthority.authorityBasisRef,
            authorityBasisDigest: invocationAuthority.authorityBasisDigest,
            actorRef: invocationAuthority.actor.actorRef,
            actorAttributionRef: invocationAuthority.actor.attributionRef,
            actorAttributionDigest:
              invocationAuthority.actor.attributionDigest,
            capabilityGrantRefs: Object.freeze(
              invocationAuthority.capabilityGrants.map((grant) => grant.grantRef)
            )
          })
        });
      } catch (error: unknown) {
        return privateOwnerRefusal(resultAssessmentRefusal(
          definition,
          "basis_mismatch",
          error instanceof Error
            ? error.message
            : "result assessment differs from replay or invocation authority"
        ));
      }
      let evidenceAuthority: ReplayAdmittedResultAssessmentEvidenceAuthority;
      try {
        evidenceAuthority = admitReplayResultAssessmentEvidenceAuthority({
          events: input.priorEvents,
          request: replayBoundRequest,
          declaredEvidenceRefs: request.evidenceRefs
        });
      } catch (error: unknown) {
        return privateOwnerRefusal(resultAssessmentRefusal(
          definition,
          "assessment_invalid",
          error instanceof Error
            ? error.message
          : "result assessment evidence is not replay-admitted"
        ));
      }
      const expectedAssessmentRef = resultAssessmentRef(
        replayBoundRequest,
        evidenceAuthority
      );
      const existingAssessmentRows = input.priorEvents.filter(
        (event) =>
          event.kind === "assessed" &&
          event.assessmentRef === expectedAssessmentRef
      );
      if (existingAssessmentRows.length > 0) {
        try {
          const existingRelation = deriveResultAssessmentRuntimeSubjectRelation({
            events: input.priorEvents,
            assessmentRef: expectedAssessmentRef,
            runtimeSubject: {
              basisId: runtimeResultRelation.subject.basisId,
              graphCallId: runtimeResultRelation.subject.graphCallId,
              frameId: runtimeResultRelation.subject.frameId,
              vectorIndex: runtimeResultRelation.subject.vectorIndex,
              runtimeResult: runtimeResultRelation.subject.runtimeResult
            }
          });
          return privateOwnerResult(admitP1OwnerValue(
            definition.resultContract.contract.schema,
            RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.result_assess.assess.result.schema,
            {
              assessmentRef: existingRelation.assessment.ref,
              admittedDisposition: "assessed",
              residualRefs: [],
              evidenceRefs: [...new Set([
                ...evidenceAuthority.causationEventRefs,
                ...existingRelation.evidenceEventRefs,
                ...existingRelation.assessedEventRefs
              ])]
            }
          ));
        } catch (error: unknown) {
          return privateOwnerRefusal(resultAssessmentRefusal(
            definition,
            "assessment_invalid",
            error instanceof Error
              ? error.message
              : "existing result assessment truth is not replay-valid"
          ));
        }
      }
      const emitted: CanonicalAssessedRuntimeEvent[] = [];
      const ownerOutcome = resultAssessmentFromReplayEvidenceWithEventWriter(
        replayBoundRequest,
        evidenceAuthority,
        (events) => {
          const canonical = emitPrivatePublicOperationOwnerEvents({
            admission: input.admission,
            events
          });
          const assessed = canonical.filter(
            (event): event is CanonicalAssessedRuntimeEvent =>
              event.kind === "assessed"
          );
          if (assessed.length !== canonical.length) {
            throw new TypeError(
              "result assessment owner emitted a non-assessed event"
            );
          }
          emitted.push(...assessed);
          return assessed;
        }
      );
      if (ownerOutcome.kind === "rejected") {
        return privateOwnerRefusal(resultAssessmentRefusal(
          definition,
          ownerOutcome.ingestKind === "runtime_failure"
            ? "result_missing"
            : "assessment_invalid",
          ownerOutcome.reason
        ));
      }
      const assessmentRefs = [
        ...new Set(
          emitted
            .filter((event) => event.kind === "assessed")
            .map((event) => event.assessmentRef)
        )
      ];
      const assessmentRef = assessmentRefs[0];
      if (assessmentRefs.length !== 1 || assessmentRef === undefined) {
        throw new TypeError(
          "result assessment owner events require one stable assessment identity"
        );
      }
      return privateOwnerResult(admitP1OwnerValue(
        definition.resultContract.contract.schema,
        RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.result_assess.assess.result.schema,
        {
        assessmentRef,
        admittedDisposition: "assessed",
        residualRefs: [],
        evidenceRefs: [...new Set([
          ...evidenceAuthority.causationEventRefs,
          ...emitted.map((event) => event.eventId)
        ])]
        }
      ), emitted);
    }
  });
}
