// Implements the singular ABIogenesis 5.0 public SDK invocation boundary.

import { join } from "node:path";

import type { CanonicalRuntimeEvent } from "../../../abg/m03/contracts/carriers.js";
import {
  constructConstructionPriorityScheme
} from "../../../abg/m03/contracts/construction_priority.js";
import {
  constructOneSurfaceProgramMemberProjection
} from "../../../abg/m03/contracts/one_surface_authority.js";
import {
  assertPublicOperationArtifactAvailableInReplay
} from "../../../abg/m03/contracts/public_operation_artifact_boundary.js";
import {
  bindOneSurfaceAuthorityProgramToAppliedProgram,
  constructOneSurfaceAppliedProgramAdmission
} from "../../../abg/m03/contracts/one_surface_program_compiler.js";
import {
  RUN_INVOKE_NATIVE_CONTRACT_SOURCES
} from "../../../abg/m03/contracts/one_surface_operation_contracts.js";
import {
  admitBoundWorkspaceCatalog,
  type AdmittedRuntimeCatalogBasis,
  type CatalogAdmissionResult
} from "../../../abg/m03/contracts/runtime_catalog.js";
import type { RuntimeEventSink } from "../../../abg/m03/events/index.js";
import type * as v from "valibot";
import {
  admitPrivatePublicOperationEvent
} from "../../../abg/m03/runner/public_operation_admission.js";
import {
  selectCanonicalRunReplayEvents
} from "../../../abg/m03/runner/public_runtime_projections.js";
import {
  compileSelectedCatalogDirectProgram,
  executeSelectedCatalogDirectProgram,
  type T270CompileInvocationAuthority,
  type T270LiveCapabilityJoin
} from "../../../abg/m03/runner/one_surface_execution.js";
import {
  LIVE_FP_DISPATCH_PLUGIN_REF,
  LIVE_FP_EVALUATOR_PLUGIN_REF
} from "../../../abg/m03/runner/standard_live_plugins.js";
import type {
  AdmittedRunInvokeExecutionIngress
} from "../../../abg/m03/contracts/one_surface_execution_ingress.js";
import {
  createOneSurfaceRuntimeEmitter
} from "../../../abg/m03/runner/one_surface_program_runtime.js";
import {
  admitIJsonValue,
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import {
  admitP1OwnerValue,
  bindPrivateAssessmentEvidenceProjectReadHandler,
  bindPrivateCatalogApplyHandler,
  bindPrivateCatalogViewHandler,
  bindPrivateResultAssessHandler,
  bindPrivateRuntimeProjectionProjectReadHandler,
  bindPrivateWorkspaceBindHandler,
  bindPrivateWorkspaceStatusProjectReadHandler,
  exactCatalogOverlayAssetPath,
  privateOwnerRefusal,
  privateOwnerResult,
  RUNTIME_PROJECTION_PUBLIC_READ_CASES,
  type RuntimeProjectionPublicReadCase,
  type PrivateOwnerHandlerNonterminal,
  type PrivateOwnerHandlerOutcome
} from "../public_contracts/private_public_operation_handler_bindings.js";
import {
  CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES
} from "../../../abg/m03/contracts/catalog_operation_contracts.js";
import {
  admitPrivateP1PublicOperationPacket,
  bindPreparedRunInvokeAuthorityProgram,
  finalizePrivateRunInvokeExecutionIngress,
  preparePrivateRunInvokeConstraintFromPacket,
  resolvePreparedRunInvokeConstrainedExecution,
  type AdmittedPrivateP1PublicOperationPacket,
  type PreparedRunInvokeConstraintExecution,
  type PreparedRunInvokeExecution,
  type PrivateP1Definition
} from "../public_contracts/private_public_operation_ingress.js";
import {
  admitPublicContractCoordinate,
  constructPublicOutcome,
  definitionKeySchema,
  definitionKeySchemaFor,
  admitNative,
  admitPublicOutcome
} from "../public_contracts/native_contract_phase_a.js";
import {
  buildPrivatePublicOperationDefinitionFamily,
  type PrivatePublicOperationDefinitionFamily
} from "../public_contracts/public_operation_definition_family.js";
import {
  projectPublishedPublicOperationDefinitionFromPrivate
} from "../public_contracts/operation_publication.js";
import {
  bindPrivateWorkspaceCreateHandler
} from "../workspace/prebinding_public_operation_handlers.js";
import {
  bindPrivateProductInstallHandler,
  bindPrivateProductResolveHandler,
  bindPrivateProductVerifyHandler
} from "../product_intake/prebinding_public_operation_handlers.js";
import {
  prepareBoundRuntimeCatalogAdmission,
  rehydrateBoundRuntimeCatalogBasis
} from "../public_contracts/private_runtime_catalog_authority.js";
import {
  catalogOverlayApplicationArtifactCatalogRowRef,
  catalogOverlayApplicationArtifactRelativePath,
  readmitCatalogOverlayApplicationAuthority,
  type CatalogBaseProgramAuthority
} from "../public_contracts/catalog_application_authority.js";
import {
  executeInstalledAbgSystemOneSurfaceDeterministicPostAction,
  executeInstalledAbgSystemOneSurfaceSelection,
  projectInstalledAbgSystemOneSurfaceAuthority
} from "../public_contracts/abg_system_one_surface_program.js";
import {
  ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
  buildAbgSystemSunnyFdImplementation
} from "../public_contracts/abg_system_sunny_graph_function.js";
import {
  bindM04RuntimeSchemaNativeDefinition
} from "../public_contracts/runtime_schema_admission.js";
import type {
  NativeContractDefinition
} from "../public_contracts/native_contract_phase_a.js";
import {
  WORKSPACE_NATIVE_CONTRACT_SOURCES
} from "../workspace/operation_contracts.js";
import {
  admitTenantConformanceManifest,
  TENANT_CONFORMANCE_MANIFEST_RELATIVE_PATH
} from "../product_intake/tenant_conformance_manifest.js";
import type {
  BoundWorkspaceContext,
  CatalogBindRequest,
  CatalogResolveRequest,
  CatalogVerifyRequest,
  InstallProductRequest,
  ProductIntakeContext,
  PublicContractCatalog,
  WorkspaceBindingContext,
  WorkspacePathContext
} from "./carriers.js";

export type PublicSdkOwnerExecutionContext =
  | Readonly<{
      kind: "product_resolve";
      context: ProductIntakeContext;
      ownerRequest: CatalogResolveRequest;
      priorEvents: readonly CanonicalRuntimeEvent[];
    }>
  | Readonly<{
      kind: "product_verify";
      context: ProductIntakeContext;
      ownerRequest: CatalogVerifyRequest;
      priorEvents: readonly CanonicalRuntimeEvent[];
    }>
  | Readonly<{
      kind: "product_install";
      context: ProductIntakeContext;
      ownerRequest: InstallProductRequest;
      priorEvents: readonly CanonicalRuntimeEvent[];
      eventSink: RuntimeEventSink;
    }>
  | Readonly<{
      kind: "workspace_path";
      context: WorkspacePathContext;
      priorEvents: readonly CanonicalRuntimeEvent[];
      eventSink: RuntimeEventSink;
      importAuthorityBytes?: Uint8Array;
    }>
  | Readonly<{
      kind: "workspace_binding";
      context: WorkspaceBindingContext;
      ownerRequest: CatalogBindRequest;
      priorEvents: readonly CanonicalRuntimeEvent[];
      eventSink: RuntimeEventSink;
    }>
  | Readonly<{
      kind: "bound_workspace";
      context: BoundWorkspaceContext;
      priorEvents: readonly CanonicalRuntimeEvent[];
    }>
  | Readonly<{
      kind: "bound_workspace_write";
      context: BoundWorkspaceContext;
      priorEvents: readonly CanonicalRuntimeEvent[];
      eventSink: RuntimeEventSink;
    }>;

export interface AbiogenesisPublicSdkInvocation {
  readonly rawInvocation: unknown;
  readonly causationEventRefs?: readonly string[];
  readonly execution: PublicSdkOwnerExecutionContext;
}

export interface AbiogenesisPublicSdkOutcome {
  readonly kind: "public_outcome";
  readonly outcomeRef: string;
  readonly outcomeDigest: string;
  readonly invocationRef: string;
  readonly invocationDigest: string;
  readonly definitionKey:
    | Readonly<{
        operationId: string;
        memberKind: "variant";
        variant: string;
      }>
    | Readonly<{
        operationId: "abg.operation.project.read";
        memberKind: "project_read_case";
        caseKey: string;
      }>;
  readonly definitionDigest: string;
  readonly payloadRef: string;
  readonly payloadDigest: string;
  readonly evidenceRefs: readonly string[];
  readonly correlationRef: string;
  readonly provenanceRefs: readonly string[];
  readonly outcomeKind: "result" | "refusal" | "nonterminal";
  readonly payloadContract: IJsonValue;
  readonly value: IJsonValue;
}

type PublicSdkOutcome = AbiogenesisPublicSdkOutcome;

export interface AbiogenesisPublicSdk5 {
  readonly invoke: (
    input: AbiogenesisPublicSdkInvocation
  ) => Promise<PublicSdkOutcome>;
}

let exactFamilyPromise: Promise<PrivatePublicOperationDefinitionFamily> | null = null;

const T270_LIVE_PLUGIN_REFS = Object.freeze([
  LIVE_FP_DISPATCH_PLUGIN_REF,
  LIVE_FP_EVALUATOR_PLUGIN_REF
]);

const T270_LIVE_CAPABILITY_GRANTS = Object.freeze([
  "abg.capability.catalog.invoke-graph-function@5",
  "abg.capability.runtime.execute-seven-term-c@5"
]);

function exactSha256(value: string, label: string): `sha256:${string}` {
  if (!/^sha256:[0-9a-f]{64}$/u.test(value)) {
    throw new TypeError(`${label} must be a sha256 digest`);
  }
  return value as `sha256:${string}`;
}

/** @internal */
export function resolveT270LiveCapabilityJoin(input: {
  readonly context: BoundWorkspaceContext;
  readonly ingress: AdmittedRunInvokeExecutionIngress;
} | {
  readonly context: BoundWorkspaceContext;
  readonly invocationAuthority: T270CompileInvocationAuthority;
  readonly runtimeProfile: AdmittedRunInvokeExecutionIngress["runtimeProfile"];
}): T270LiveCapabilityJoin | undefined {
  const invocationAuthority = "ingress" in input
    ? input.ingress.invocationAuthority
    : input.invocationAuthority;
  const runtimeProfile = "ingress" in input
    ? input.ingress.runtimeProfile
    : input.runtimeProfile;
  const steering = invocationAuthority.transportSteering;
  const factory =
    input.context.effects.operatorCapabilityFactoriesBySteeringRef?.[
      steering.steeringRef
    ];
  if (factory === undefined) {
    return undefined;
  }

  const binding = factory({
    workspaceRoot: input.context.workspaceManifest.root,
    archiveRoot: input.context.binding.mutableStateRoots.archiveRoot,
    steeringRef: steering.steeringRef,
    steeringDigest: exactSha256(
      steering.steeringDigest,
      "run.invoke admitted transport steering digest"
    )
  });
  const projection = binding.projection;
  const availableRefs = Object.freeze([
    ...projection.availableLivePluginRefs
  ]);
  const grantedCapabilities = new Set(
    invocationAuthority.capabilityGrants.map(
      (grant) => grant.capabilityId
    )
  );
  const runtimePluginRefs = new Set(
    runtimeProfile.standardPluginRefs
  );
  const steeringProvenanceRefs = new Set(steering.provenanceRefs);
  if (
    binding.kind !== "live_capability_binding" ||
    projection.kind !== "live_capability_projection" ||
    !stableJsonEquals(availableRefs, T270_LIVE_PLUGIN_REFS) ||
    binding.pluginCapabilities.liveFpDispatch === undefined ||
    binding.pluginCapabilities.liveFpEvaluator === undefined ||
    !T270_LIVE_PLUGIN_REFS.every((ref) => runtimePluginRefs.has(ref)) ||
    !T270_LIVE_CAPABILITY_GRANTS.every((capabilityId) =>
      grantedCapabilities.has(capabilityId)
    ) ||
    !steeringProvenanceRefs.has(projection.capabilityRef) ||
    !steeringProvenanceRefs.has(projection.capabilityDigest) ||
    !steeringProvenanceRefs.has(projection.executionContractDigest)
  ) {
    throw new TypeError(
      "run.invoke process-local capability body differs from admitted steering authority"
    );
  }

  return Object.freeze({
    kind: "t270_live_capability_join",
    steeringRef: steering.steeringRef,
    steeringDigest: exactSha256(
      steering.steeringDigest,
      "run.invoke admitted transport steering digest"
    ),
    workerProfile: Object.freeze({
      selectionRef: projection.capabilityRef,
      selectionDigest: exactSha256(
        projection.capabilityDigest,
        "run.invoke admitted worker/profile selection digest"
      ),
      configurationDigest: exactSha256(
        projection.executionContractDigest,
        "run.invoke admitted worker/profile configuration digest"
      )
    }),
    availableLivePluginRefs: availableRefs,
    pluginCapabilities: binding.pluginCapabilities
  });
}

function exactFamily(): Promise<PrivatePublicOperationDefinitionFamily> {
  exactFamilyPromise ??= buildPrivatePublicOperationDefinitionFamily().then(
    (admission) => {
      if (admission.kind !== "exact_family_admitted") {
        throw new TypeError(
          `public SDK requires the exact 5.0 operation family: ${admission.gaps
            .map((gap) => `${gap.fieldPath}:${gap.reason}`)
            .join(",")}`
        );
      }
      return admission.family;
    }
  );
  return exactFamilyPromise;
}

function ownValue(input: unknown, key: PropertyKey): unknown {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  return descriptor !== undefined && "value" in descriptor
    ? descriptor.value
    : undefined;
}

/** @internal */
export function assertAbiogenesisPublicInvocationCatalogBinding(input: {
  readonly rawInvocation: unknown;
  readonly catalog: PublicContractCatalog;
}): void {
  const expected = Object.freeze({
    kind: "public_contract_catalog_coordinate",
    catalogId: input.catalog.catalogId,
    catalogVersion: input.catalog.catalogVersion,
    catalogDigest: input.catalog.catalogDigest
  });
  if (
    !stableJsonEquals(
      ownValue(input.rawInvocation, "contractCatalog"),
      expected
    )
  ) {
    throw new TypeError(
      "public invocation contract catalog differs from the installed catalog"
    );
  }
}

function resolveDefinitionKey(
  rawInvocation: unknown
): ReturnType<typeof admitNative<typeof definitionKeySchema>> {
  return admitNative(
    definitionKeySchema,
    ownValue(rawInvocation, "definitionKey")
  );
}

function actorAttribution(packet: AdmittedPrivateP1PublicOperationPacket) {
  const actor = packet.invocation.authority.actor;
  if (actor.state !== "admitted_actor") {
    throw new TypeError(
      "public SDK effect execution requires actor attribution from the admitted invocation"
    );
  }
  return Object.freeze({
    actorRef: actor.actorRef,
    provenanceRefs: packet.invocation.provenanceRefs
  });
}

function admissionFor(
  packet: AdmittedPrivateP1PublicOperationPacket,
  execution: Extract<
    PublicSdkOwnerExecutionContext,
    {
      readonly kind:
        | "product_install"
        | "workspace_path"
        | "workspace_binding"
        | "bound_workspace_write";
    }
  >
) {
  return admitPrivatePublicOperationEvent({
    witness: packet.witness,
    priorEvents: execution.priorEvents,
    eventSink: execution.eventSink
  });
}

function exactStringSet(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return stableJsonEquals([...left].sort(), [...right].sort());
}

async function projectCatalogApplicationBaseProgram(
  catalogBasis: AdmittedRuntimeCatalogBasis
): Promise<CatalogBaseProgramAuthority> {
  const installedOneSurface =
    await projectInstalledAbgSystemOneSurfaceAuthority({ catalogBasis });
  const baseMembers = catalogBasis.executionBindings.filter((binding) =>
    binding.entryRef === installedOneSurface.catalogEntryRef
  );
  const baseMember = baseMembers[0];
  if (baseMembers.length !== 1 || baseMember === undefined) {
    throw new TypeError(
      "catalog application base control-program member is absent or ambiguous"
    );
  }
  return Object.freeze({
    ref: installedOneSurface.authorityProgram.admittedProgramRef,
    digest: exactSha256(
      installedOneSurface.authorityProgram.admittedProgramDigest,
      "catalog application base program digest"
    ),
    memberEntryRefs: Object.freeze([baseMember.entryRef])
  });
}

async function replayAppliedOneSurfaceProgram(input: {
  readonly context: BoundWorkspaceContext;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly baseProgram: CatalogBaseProgramAuthority;
  readonly catalogViewRef: string;
  readonly catalogViewDigest: `sha256:${string}`;
  readonly targetProgramRef: string;
  readonly targetProgramDigest: `sha256:${string}`;
}) {
  const boundaries = input.priorEvents.filter(
    (event): event is Extract<
      CanonicalRuntimeEvent,
      { readonly kind: "public_operation_artifact_admitted" }
    > =>
      event.kind === "public_operation_artifact_admitted" &&
      event.operationId === "abg.operation.catalog.apply" &&
      event.definitionKey.memberKind === "variant" &&
      event.definitionKey.variant === "overlay" &&
      event.disposition === "applied" &&
      event.scopeRef === input.targetProgramRef &&
      event.scopeDigest === input.targetProgramDigest
  );
  const coordinates = new Set(boundaries.map((event) =>
    `${event.artifactRef}\u0000${event.artifactDigest}`
  ));
  const boundary = boundaries.at(-1);
  if (coordinates.size !== 1 || boundary === undefined) {
    throw new TypeError(
      "run.invoke applied program requires one exact catalog.apply artifact authority"
    );
  }
  assertPublicOperationArtifactAvailableInReplay({
    events: input.priorEvents,
    operationId: "abg.operation.catalog.apply",
    scopeRef: input.targetProgramRef,
    scopeDigest: input.targetProgramDigest,
    artifactRef: boundary.artifactRef,
    artifactDigest: boundary.artifactDigest
  });
  const rawArtifact = await input.context.effects.readRecord(join(
    input.context.binding.mutableStateRoots.runtimeRoot,
    catalogOverlayApplicationArtifactRelativePath(boundary.artifactRef)
  ));
  if (
    rawArtifact === null ||
    stableSha256Digest(rawArtifact) !== boundary.artifactDigest
  ) {
    throw new TypeError(
      "run.invoke catalog.apply artifact differs from admitted replay"
    );
  }
  const catalogRowRef = catalogOverlayApplicationArtifactCatalogRowRef(
    rawArtifact
  );
  const overlayPath = exactCatalogOverlayAssetPath({
    context: input.context,
    catalogBasis: input.catalogBasis,
    catalogRowRef
  });
  const overlayAsset = overlayPath === null
    ? null
    : await input.context.effects.readRecord(overlayPath);
  if (overlayAsset === null) {
    throw new TypeError(
      "run.invoke catalog.apply overlay authority is unavailable"
    );
  }
  const application = readmitCatalogOverlayApplicationAuthority({
    catalogBasis: input.catalogBasis,
    baseProgram: input.baseProgram,
    rawArtifact,
    overlayAsset
  });
  if (
    application.applicationRef !== boundary.artifactRef ||
    application.target.ref !== input.targetProgramRef ||
    application.target.digest !== input.targetProgramDigest ||
    application.baseProgram.ref !== input.baseProgram.ref ||
    application.baseProgram.digest !== input.baseProgram.digest ||
    application.catalogView.ref !== input.catalogViewRef ||
    application.catalogView.digest !== input.catalogViewDigest
  ) {
    throw new TypeError(
      "run.invoke applied program differs from its admitted AF-10 authority"
    );
  }
  return Object.freeze({
    application,
    boundary
  });
}

function isRuntimeProjectionPublicReadCase(
  value: string
): value is RuntimeProjectionPublicReadCase {
  return RUNTIME_PROJECTION_PUBLIC_READ_CASES.some(
    (caseKey) => caseKey === value
  );
}

function catalogAdmissionRefusalCode(
  result: CatalogAdmissionResult
): "descriptor_invalid" | "contribution_invalid" | "conflict" |
  "incompatible" | "unready" | "unresolved" {
  const reasons = result.rowDispositions.flatMap((row) =>
    row.rejectionReason === null ? [] : [row.rejectionReason]
  );
  if (reasons.some((reason) => /readiness|unready/u.test(reason))) {
    return "unready";
  }
  if (reasons.some((reason) => /compatib|scope_mismatch/u.test(reason))) {
    return "incompatible";
  }
  if (reasons.some((reason) => /conflict|duplicate/u.test(reason))) {
    return "conflict";
  }
  return "unresolved";
}

function assertBoundWorkspaceAuthority(
  packet: AdmittedPrivateP1PublicOperationPacket,
  context: BoundWorkspaceContext
): void {
  const authority = packet.invocation.authority;
  const binding = context.binding;
  if (
    authority.workspace.state !== "admitted_workspace" ||
    authority.productSet.state !== "admitted_product_set" ||
    authority.dependencyLock.state !== "admitted_dependency_lock" ||
    authority.workspace.bindingRef !== binding.bindingId ||
    authority.workspace.bindingDigest !== binding.bindingDigest ||
    authority.productSet.productSetDigest !== binding.productSetDigest ||
    authority.dependencyLock.lockRef !== binding.resolvedLockId ||
    authority.dependencyLock.lockDigest !== binding.resolvedLockDigest ||
    context.workspaceManifest.workspaceId !== binding.workspaceId ||
    stableSha256Digest(context.workspaceManifest) !==
      binding.workspaceManifestDigest
  ) {
    throw new TypeError(
      "public SDK invocation authority differs from its bound workspace"
    );
  }
}

function publicOutcome<const D extends PrivateP1Definition>(input: {
  readonly definition: D;
  readonly packet: AdmittedPrivateP1PublicOperationPacket<D>;
  readonly owner: PrivateOwnerHandlerOutcome<unknown, unknown, unknown>;
}): PublicSdkOutcome {
  const definition = input.definition;
  const packet = input.packet;
  const keySchema = definitionKeySchemaFor(definition.definitionKey);
  const outcomeKind = input.owner.kind === "owner_handler_result"
    ? "result"
    : input.owner.kind === "owner_handler_refusal"
      ? "refusal"
      : "nonterminal";
  const nonterminalBinding = ownValue(definition, "nonTerminalContract");
  const nonterminalContract = ownValue(nonterminalBinding, "contract");
  const nonterminalSchemaCoordinate = ownValue(
    nonterminalContract,
    "schemaCoordinate"
  );
  const nonterminalSchema = ownValue(nonterminalContract, "schema");
  const payloadContract = outcomeKind === "result"
    ? definition.resultContract.contract.schemaCoordinate
    : outcomeKind === "refusal"
      ? definition.refusalContract.contract.schemaCoordinate
      : nonterminalSchemaCoordinate;
  if (typeof payloadContract !== "object" || payloadContract === null) {
    throw new TypeError(
      "public SDK owner returned nonterminal truth for a terminal-only definition"
    );
  }
  const value = admitIJsonValue(input.owner.value, "public SDK owner value");
  const payloadDigest = stableSha256Digest(value);
  const publishedDefinitionDigest =
    projectPublishedPublicOperationDefinitionFromPrivate(definition)
      .definitionDigest;
  const candidate = constructPublicOutcome({
    definitionKeySchema: keySchema,
    outcomeKind,
    outcomeRef: `public-outcome:${packet.invocation.invocationRef}:${payloadDigest}`,
    invocationRef: packet.invocation.invocationRef,
    invocationDigest: packet.invocation.invocationDigest,
    definitionKey: definition.definitionKey,
    definitionDigest: publishedDefinitionDigest,
    payloadRef: `public-operation-payload:${payloadDigest}`,
    payloadContract: admitPublicContractCoordinate(payloadContract),
    value,
    evidenceRefs: input.owner.emittedEvents.map((event) => event.eventId),
    correlationRef: packet.invocation.correlationRef,
    provenanceRefs: packet.invocation.provenanceRefs
  });
  const resultBinding: unknown =
    definition.definitionKey.operationId === "abg.operation.project.read"
    ? {
        kind: "request_related_projection",
        relation: ownValue(definition.resultContract, "projectionRelation")
      }
    : { kind: "schema_only" };
  // The family is a runtime-admitted heterogeneous tuple; this one adapter
  // preserves its correlation while admitPublicOutcome rechecks every value.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const admitDynamic = admitPublicOutcome as unknown as (input: {
    readonly definitionKeySchema: v.GenericSchema;
    readonly resultSchema: unknown;
    readonly refusalSchema: unknown;
    readonly nonTerminalSchema: unknown;
    readonly resultBinding: unknown;
    readonly invocation: unknown;
    readonly contracts: unknown;
    readonly raw: unknown;
  }) => PublicSdkOutcome | Readonly<{
    kind: "outcome_admission_failure";
    failureClass: string;
    issuePaths: readonly string[];
  }>;
  const admitted = admitDynamic({
    definitionKeySchema: keySchema,
    resultSchema: definition.resultContract.contract.schema,
    refusalSchema: definition.refusalContract.contract.schema,
    nonTerminalSchema: nonterminalSchema,
    resultBinding,
    invocation: packet.invocation,
    contracts: {
      result: definition.resultContract.contract.schemaCoordinate,
      refusal: definition.refusalContract.contract.schemaCoordinate,
      nonTerminal: nonterminalSchemaCoordinate ?? null
    },
    raw: candidate
  });
  if (admitted.kind === "outcome_admission_failure") {
    throw new TypeError(
      `public SDK owner outcome failed admission: ${admitted.failureClass} ` +
        admitted.issuePaths.join(",")
    );
  }
  return admitted;
}

function packetFor<const D extends PrivateP1Definition>(input: {
  readonly family: PrivatePublicOperationDefinitionFamily;
  readonly definition: D;
  readonly rawInvocation: unknown;
  readonly causationEventRefs: readonly string[];
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
}): AdmittedPrivateP1PublicOperationPacket<D> {
  return admitPrivateP1PublicOperationPacket({
    family: input.family,
    definition: input.definition,
    rawInvocation: input.rawInvocation,
    causationEventRefs: input.causationEventRefs,
    priorEvents: input.priorEvents
  });
}

function privateOwnerNonterminal<T>(
  value: T,
  emittedEvents: readonly CanonicalRuntimeEvent[]
): PrivateOwnerHandlerNonterminal<T> {
  return Object.freeze({
    kind: "owner_handler_nonterminal" as const,
    value,
    emittedEvents: Object.freeze([...emittedEvents])
  });
}

function bindSunnyNativeDefinition(
  definition: NativeContractDefinition<v.GenericSchema>
) {
  // The admitted public family is heterogeneous and erases this exact schema
  // parameter. The relation binder rechecks source lineage and identity.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const exactDefinition = definition as NativeContractDefinition<
    typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.request.schema
  >;
  return bindM04RuntimeSchemaNativeDefinition({
    source: WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.request,
    symbolicSchemaRef: ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
    definition: exactDefinition
  });
}

function runInvokeReplayRef(
  input: Readonly<{
    events: readonly CanonicalRuntimeEvent[];
    runRef: string;
    runDigest: string;
  }>
): string {
  const events = selectCanonicalRunReplayEvents({
    replay: Object.freeze({
      kind: "admitted_workspace_replay" as const,
      orderedEvents: input.events
    }),
    source: Object.freeze({
      kind: "Run" as const,
      sourceRef: input.runRef,
      sourceDigest: input.runDigest
    })
  });
  return `replay://abg/run.invoke/${stableSha256Digest(events).slice("sha256:".length)}`;
}

function exactRunInvokeGraphCall(input: {
  readonly basisId: string;
  readonly events: readonly CanonicalRuntimeEvent[];
}): Extract<CanonicalRuntimeEvent, { readonly kind: "graph_call_opened" }> {
  const matches = input.events.filter(
    (event): event is Extract<
      CanonicalRuntimeEvent,
      { readonly kind: "graph_call_opened" }
    > => event.kind === "graph_call_opened" && event.basisId === input.basisId
  );
  const graphCall = matches[0];
  if (matches.length !== 1 || graphCall === undefined) {
    throw new TypeError(
      "run.invoke AF-15 execution emitted no exact graph-call identity"
    );
  }
  return graphCall;
}

function deriveRunInvokeOneSurfaceSelection(input: {
  readonly prepared: PreparedRunInvokeExecution;
  readonly programMembers: ReturnType<
    typeof constructOneSurfaceProgramMemberProjection
  >;
  readonly publicAdmissionEvent: CanonicalRuntimeEvent & {
    readonly kind: "public_operation_admitted";
  };
}) {
  const prepared = input.prepared;
  const af13Constraint = prepared.af13Constraint;
  if (af13Constraint.kind !== "invoke_exact_member_constraint") {
    throw new TypeError(
      "run.invoke One Surface selection requires one exact invoke member"
    );
  }
  const candidates = prepared.catalogBasis.executionBindings.filter(
    (binding) =>
      binding.entryRef === af13Constraint.candidateEntryRef
  );
  const candidate = candidates[0];
  if (candidates.length !== 1 || candidate === undefined) {
    throw new TypeError(
      "run.invoke One Surface selection candidate is absent or ambiguous"
    );
  }
  const outputContractRefs = Object.freeze([
    ...new Set(candidate.graphFunction.outputs.flatMap(
      (node) => node.assetSurface.outputContractRefs
    ))
  ]);
  const proofObligationRefs = Object.freeze([
    ...new Set(candidate.graphFunction.outputs.flatMap(
      (node) => node.assetSurface.proofObligationRefs
    ))
  ]);
  if (outputContractRefs.length === 0 || proofObligationRefs.length === 0) {
    throw new TypeError(
      "run.invoke One Surface target has no declared contract/proof obligations"
    );
  }
  const packet = prepared.packet;
  const authority = packet.invocation.authority;
  const invocationPolicy = authority.invocationPolicy;
  if (invocationPolicy.state !== "admitted_invocation_policy") {
    throw new TypeError(
      "run.invoke One Surface selection has no admitted invocation policy"
    );
  }
  const coordinate = stableSha256Digest({
    invocationRef: packet.invocation.invocationRef,
    workspaceBindingDigest: prepared.workspaceBinding.bindingDigest,
    catalogBasisRef: prepared.catalogBasis.basisRef,
    candidateEntryRef: candidate.entryRef
  }).slice("sha256:".length);
  const productTruthRefs = Object.freeze([
    ...new Set([
      ...prepared.workspaceBinding.productBindingRefs,
      ...prepared.catalogBasis.admissionEventRefs
    ])
  ]);
  if (productTruthRefs.length === 0) {
    throw new TypeError(
      "run.invoke One Surface selection has no admitted product truth"
    );
  }
  return Object.freeze({
    episodeId: `episode://abg/run.invoke/${coordinate}`,
    intentLineageRef: packet.invocation.requestRef,
    admittedProductTruthRefs: productTruthRefs,
    workspaceBinding: Object.freeze({
      ref: prepared.workspaceBinding.bindingId,
      digest: prepared.workspaceBinding.bindingDigest
    }),
    invocationAuthority: Object.freeze({
      ref: authority.authoritySetRef,
      digest: authority.authoritySetDigest
    }),
    replayCursorRef: input.publicAdmissionEvent.eventId,
    runtimeProjectionRef:
      prepared.catalogBasis.runtimeCatalogProjectionRef,
    programMembers: input.programMembers,
    allowedEntryRefs: af13Constraint.allowedEntryRefs,
    priorityScheme: constructConstructionPriorityScheme({
      schemeRef: `priority-scheme://abg/run.invoke/${coordinate}`,
      sourcePolicyRef: invocationPolicy.policyRef,
      rules: []
    }),
    targetObligationRefs: outputContractRefs,
    targetEvidenceAuthorityRefs: proofObligationRefs,
    gapEvidenceRefs: Object.freeze([
      packet.invocation.requestRef,
      ...prepared.catalogBasis.admissionEventRefs
    ]),
    gapAuthorityRefs: Object.freeze([
      authority.authoritySetRef,
      prepared.catalogBasis.basisRef,
      prepared.authorityProgram.bindingRef
    ]),
    causationRef: input.publicAdmissionEvent.eventId,
    correlationId: packet.invocation.correlationRef,
    inputPayloadRef: af13Constraint.inputPayloadRef,
    inputLineageRef: packet.invocation.requestRef,
    runtimeScope: Object.freeze({
      basisId: `basis://abg/run.invoke/one-surface/${coordinate}`,
      graphCallId: `graph-call://abg/run.invoke/one-surface/${coordinate}`,
      frameId: `frame://abg/run.invoke/one-surface/${coordinate}`
    })
  });
}

async function loadInstalledAbgTenantConformanceManifest(input: {
  readonly prepared:
    | PreparedRunInvokeConstraintExecution
    | PreparedRunInvokeExecution;
  readonly context: BoundWorkspaceContext;
}) {
  const matches = input.context.binding.products.filter(
    (product) =>
      product.installedProductId === input.prepared.abgInstalledProductId &&
      product.productId === "abiogenesis"
  );
  const product = matches[0];
  if (matches.length !== 1 || product === undefined) {
    throw new TypeError(
      "run.invoke installed ABG product authority is absent or ambiguous"
    );
  }
  const manifest = await input.context.effects.readRecord(join(
    product.productRoot,
    TENANT_CONFORMANCE_MANIFEST_RELATIVE_PATH
  ));
  if (manifest === null) {
    throw new TypeError(
      "run.invoke installed ABG tenant conformance manifest is missing"
    );
  }
  return admitTenantConformanceManifest(
    manifest,
    input.context.publicContractCatalog
  );
}

async function invokeExact(
  family: PrivatePublicOperationDefinitionFamily,
  input: AbiogenesisPublicSdkInvocation
): Promise<PublicSdkOutcome> {
  const selectedKey = resolveDefinitionKey(input.rawInvocation);
  const causationEventRefs = Object.freeze([
    ...(input.causationEventRefs ?? [])
  ]);
  const execution = input.execution;
  assertAbiogenesisPublicInvocationCatalogBinding({
    rawInvocation: input.rawInvocation,
    catalog: execution.context.publicContractCatalog
  });

  if (
    selectedKey.operationId === "abg.operation.product.resolve" &&
    selectedKey.memberKind === "variant" &&
    selectedKey.variant === "resolve"
  ) {
    if (execution.kind !== "product_resolve") {
      throw new TypeError(
        "product.resolve requires a product_resolve execution context"
      );
    }
    const exactDefinition = family["abg.operation.product.resolve"].resolve;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    const owner = bindPrivateProductResolveHandler(family).execute({
      packet,
      ownerRequest: execution.ownerRequest,
      context: execution.context
    });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.product.verify" &&
    selectedKey.memberKind === "variant" &&
    selectedKey.variant === "verify"
  ) {
    if (execution.kind !== "product_verify") {
      throw new TypeError(
        "product.verify requires a product_verify execution context"
      );
    }
    const exactDefinition = family["abg.operation.product.verify"].verify;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    const owner = await bindPrivateProductVerifyHandler(family).execute({
      packet,
      ownerRequest: execution.ownerRequest,
      context: execution.context
    });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.product.install" &&
    selectedKey.memberKind === "variant" &&
    selectedKey.variant === "install"
  ) {
    if (execution.kind !== "product_install") {
      throw new TypeError(
        "product.install requires a product_install execution context"
      );
    }
    const exactDefinition = family["abg.operation.product.install"].install;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    const owner = await bindPrivateProductInstallHandler(family).execute({
      packet,
      ownerRequest: execution.ownerRequest,
      context: execution.context,
      attribution: actorAttribution(packet),
      artifactBoundary: { admission: admissionFor(packet, execution) }
    });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.workspace.create" &&
    selectedKey.memberKind === "variant" &&
    selectedKey.variant === "clean"
  ) {
    if (execution.kind !== "workspace_path") {
      throw new TypeError("workspace.create requires a workspace_path execution context");
    }
    const exactDefinition = family["abg.operation.workspace.create"].clean;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    if (ownValue(packet.invocation.request, "targetRoot") !== execution.context.targetRoot) {
      throw new TypeError(
        "workspace.create target differs from its explicit workspace context"
      );
    }
    const handler = bindPrivateWorkspaceCreateHandler(
      family,
      "clean"
    );
    const owner = await handler.execute({
      packet,
      context: execution.context,
      attribution: actorAttribution(packet),
      artifactBoundary: { admission: admissionFor(packet, execution) },
      ...(execution.importAuthorityBytes === undefined
        ? {}
        : { importAuthorityBytes: execution.importAuthorityBytes })
    });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.workspace.create" &&
    selectedKey.memberKind === "variant" &&
    selectedKey.variant === "imported"
  ) {
    if (execution.kind !== "workspace_path") {
      throw new TypeError("workspace.create requires a workspace_path execution context");
    }
    const exactDefinition = family["abg.operation.workspace.create"].imported;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    if (ownValue(packet.invocation.request, "targetRoot") !== execution.context.targetRoot) {
      throw new TypeError(
        "workspace.create target differs from its explicit workspace context"
      );
    }
    const handler = bindPrivateWorkspaceCreateHandler(
      family,
      "imported"
    );
    const owner = await handler.execute({
      packet,
      context: execution.context,
      attribution: actorAttribution(packet),
      artifactBoundary: { admission: admissionFor(packet, execution) },
      ...(execution.importAuthorityBytes === undefined
        ? {}
        : { importAuthorityBytes: execution.importAuthorityBytes })
    });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.workspace.bind" &&
    selectedKey.memberKind === "variant" &&
    selectedKey.variant === "bind"
  ) {
    if (execution.kind !== "workspace_binding") {
      throw new TypeError("workspace.bind requires a workspace_binding execution context");
    }
    const exactDefinition = family["abg.operation.workspace.bind"].bind;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    const owner = await bindPrivateWorkspaceBindHandler(family).execute({
      packet,
      ownerRequest: execution.ownerRequest,
      context: execution.context,
      priorEvents: execution.priorEvents,
      attribution: actorAttribution(packet),
      artifactBoundary: { admission: admissionFor(packet, execution) }
    });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.catalog.admit" &&
    selectedKey.memberKind === "variant" &&
    selectedKey.variant === "admit"
  ) {
    if (execution.kind !== "bound_workspace_write") {
      throw new TypeError(
        "catalog.admit requires a bound_workspace_write execution context"
      );
    }
    const exactDefinition = family["abg.operation.catalog.admit"].admit;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    assertBoundWorkspaceAuthority(packet, execution.context);
    const request = admitP1OwnerValue(
      exactDefinition.requestContract.contract.schema,
      CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_admit.admit.request.schema,
      packet.invocation.request
    );
    const admission = admissionFor(packet, execution);
    const prepared = await prepareBoundRuntimeCatalogAdmission({
      context: execution.context,
      correlationId: packet.invocation.correlationRef,
      causationEventRefs: Object.freeze([admission.event.eventId])
    });
    const binding = execution.context.binding;
    if (
      request.workspaceBindingRef !== binding.bindingId ||
      request.workspaceBindingDigest !== binding.bindingDigest ||
      request.resolvedLockRef !== binding.resolvedLockId ||
      request.resolvedLockDigest !== binding.resolvedLockDigest ||
      !exactStringSet(request.descriptorRefs, prepared.descriptorRefs) ||
      !exactStringSet(
        request.contributionManifestRefs,
        prepared.contributionManifestRefs
      )
    ) {
      const owner = privateOwnerRefusal(admitP1OwnerValue(
        exactDefinition.refusalContract.contract.schema,
        CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_admit.admit.refusal.schema,
        {
          code: "unresolved",
          message: "catalog.admit request differs from bound installed product truth",
          residualRefs: []
        }
      ));
      return publicOutcome({ definition: exactDefinition, packet, owner });
    }
    const admitted = admitBoundWorkspaceCatalog(
      prepared.batch,
      execution.eventSink,
      Object.freeze([...execution.priorEvents, admission.event])
    );
    if (!admitted.accepted || admitted.basis === null) {
      const owner = privateOwnerRefusal(
        admitP1OwnerValue(
          exactDefinition.refusalContract.contract.schema,
          CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_admit.admit.refusal.schema,
          {
            code: catalogAdmissionRefusalCode(admitted),
            message: "one or more bound catalog declarations were not admitted",
            residualRefs: admitted.rejectedDeclarationRefs
          }
        ),
        admitted.admissionEvents
      );
      return publicOutcome({ definition: exactDefinition, packet, owner });
    }
    const evidenceRefs = admitted.basis.admissionEventRefs;
    const owner = privateOwnerResult(
      admitP1OwnerValue(
        exactDefinition.resultContract.contract.schema,
        CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_admit.admit.result.schema,
        {
          catalogRef: admitted.basis.basisRef,
          catalogDigest: stableSha256Digest(admitted.basis),
          dispositions: admitted.rowDispositions.map((row) => ({
            kind: "catalog_row_disposition",
            entryRef: row.entryRef,
            declarationRef: row.declarationRef,
            entryKind: row.entryKind,
            disposition: "admitted"
          })),
          evidenceRefs
        }
      ),
      admitted.admissionEvents
    );
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.result.assess" &&
    selectedKey.memberKind === "variant" &&
    selectedKey.variant === "assess"
  ) {
    if (execution.kind !== "bound_workspace_write") {
      throw new TypeError(
        "result.assess requires a bound_workspace_write execution context"
      );
    }
    const exactDefinition = family["abg.operation.result.assess"].assess;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    assertBoundWorkspaceAuthority(packet, execution.context);
    const admission = admissionFor(packet, execution);
    const owner = bindPrivateResultAssessHandler(family).execute({
      packet,
      priorEvents: execution.priorEvents,
      admission
    });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.project.read" &&
    selectedKey.memberKind === "project_read_case" &&
    isRuntimeProjectionPublicReadCase(selectedKey.caseKey)
  ) {
    if (execution.kind !== "bound_workspace") {
      throw new TypeError(
        `project.read(${selectedKey.caseKey}) requires a bound_workspace execution context`
      );
    }
    const caseKey = selectedKey.caseKey;
    const exactDefinition = family["abg.operation.project.read"][caseKey];
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    assertBoundWorkspaceAuthority(packet, execution.context);
    const owner =
      await bindPrivateRuntimeProjectionProjectReadHandler(
        family,
        caseKey
      ).execute({
        packet,
        context: execution.context
      });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.project.read" &&
    selectedKey.memberKind === "project_read_case" &&
    selectedKey.caseKey === "workspace_status"
  ) {
    if (execution.kind !== "bound_workspace") {
      throw new TypeError(
        "project.read(workspace_status) requires a bound_workspace execution context"
      );
    }
    const exactDefinition = family["abg.operation.project.read"].workspace_status;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    assertBoundWorkspaceAuthority(packet, execution.context);
    const owner = await bindPrivateWorkspaceStatusProjectReadHandler(family).execute({
      packet,
      context: execution.context
    });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.project.read" &&
    selectedKey.memberKind === "project_read_case" &&
    selectedKey.caseKey === "assessment_evidence"
  ) {
    if (execution.kind !== "bound_workspace") {
      throw new TypeError(
        "project.read(assessment_evidence) requires a bound_workspace execution context"
      );
    }
    const exactDefinition =
      family["abg.operation.project.read"].assessment_evidence;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    assertBoundWorkspaceAuthority(packet, execution.context);
    const owner =
      await bindPrivateAssessmentEvidenceProjectReadHandler(family).execute({
        packet,
        context: execution.context
      });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.catalog.view" &&
    selectedKey.memberKind === "variant" &&
    selectedKey.variant === "allowlist"
  ) {
    if (execution.kind !== "bound_workspace") {
      throw new TypeError(
        "catalog.view requires a bound_workspace execution context"
      );
    }
    const exactDefinition = family["abg.operation.catalog.view"].allowlist;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    const catalogBasis = await rehydrateBoundRuntimeCatalogBasis({
      context: execution.context,
      correlationId: packet.invocation.correlationRef,
      priorEvents: execution.priorEvents
    });
    const baseProgram = await projectCatalogApplicationBaseProgram(catalogBasis);
    const owner = await bindPrivateCatalogViewHandler(family).execute({
      packet,
      context: execution.context,
      catalogBasis,
      baseProgram
    });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.catalog.apply" &&
    selectedKey.memberKind === "variant" &&
    (selectedKey.variant === "node_type" || selectedKey.variant === "overlay")
  ) {
    if (execution.kind !== "bound_workspace_write") {
      throw new TypeError(
        "catalog.apply requires a bound_workspace_write execution context"
      );
    }
    const variant = selectedKey.variant;
    const exactDefinition = family["abg.operation.catalog.apply"][variant];
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    assertBoundWorkspaceAuthority(packet, execution.context);
    const catalogBasis = await rehydrateBoundRuntimeCatalogBasis({
      context: execution.context,
      correlationId: packet.invocation.correlationRef,
      priorEvents: execution.priorEvents
    });
    const baseProgram = await projectCatalogApplicationBaseProgram(catalogBasis);
    const owner = await bindPrivateCatalogApplyHandler(
      family,
      variant
    ).execute({
      packet,
      context: execution.context,
      catalogBasis,
      baseProgram,
      artifactBoundary: { admission: admissionFor(packet, execution) }
    });
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  if (
    selectedKey.operationId === "abg.operation.run.invoke" &&
    selectedKey.memberKind === "variant" &&
    selectedKey.variant === "invoke"
  ) {
    if (execution.kind !== "bound_workspace_write") {
      throw new TypeError(
        "run.invoke requires a bound_workspace_write execution context"
      );
    }
    const exactDefinition = family["abg.operation.run.invoke"].invoke;
    const packet = packetFor({
      family,
      definition: exactDefinition,
      rawInvocation: input.rawInvocation,
      causationEventRefs,
      priorEvents: execution.priorEvents
    });
    assertBoundWorkspaceAuthority(packet, execution.context);
    const catalogBasis = await rehydrateBoundRuntimeCatalogBasis({
      context: execution.context,
      correlationId: packet.invocation.correlationRef,
      priorEvents: execution.priorEvents
    });
    const installedOneSurface =
      await projectInstalledAbgSystemOneSurfaceAuthority({ catalogBasis });
    const baseProgram = await projectCatalogApplicationBaseProgram(catalogBasis);
    const executionProgram = packet.invocation.authority.executionProgram;
    const transportSteering =
      packet.invocation.authority.transportSteering;
    if (
      executionProgram.state !== "admitted_execution_program" ||
      transportSteering.state !== "declared_transport_steering"
    ) {
      throw new TypeError(
        "run.invoke requires admitted applied-program and steering authority"
      );
    }
    const compileInvocationAuthority = Object.freeze({
      capabilityGrants: packet.invocation.authority.capabilityGrants,
      transportSteering: Object.freeze({
        steeringRef: transportSteering.steeringRef,
        steeringDigest: transportSteering.steeringDigest,
        provenanceRefs: Object.freeze([...transportSteering.provenanceRefs])
      })
    });
    const constrainedPreparation =
      await preparePrivateRunInvokeConstraintFromPacket({
        definition: exactDefinition,
        packet,
        context: execution.context,
        runtimeCatalogBasis: catalogBasis
      });
    const applied = await replayAppliedOneSurfaceProgram({
      context: execution.context,
      priorEvents: execution.priorEvents,
      catalogBasis,
      baseProgram,
      catalogViewRef: constrainedPreparation.sessionView.sessionViewRef,
      catalogViewDigest: stableSha256Digest(
        constrainedPreparation.sessionView
      ),
      targetProgramRef: executionProgram.admittedGtlProgramRef,
      targetProgramDigest: exactSha256(
        executionProgram.admittedGtlProgramDigest,
        "run.invoke applied program digest"
      )
    });
    const tenantManifest = await loadInstalledAbgTenantConformanceManifest({
      prepared: constrainedPreparation,
      context: execution.context
    });
    const constrainedExecution =
      resolvePreparedRunInvokeConstrainedExecution(constrainedPreparation);
    const liveCapabilityJoin = resolveT270LiveCapabilityJoin({
      context: execution.context,
      invocationAuthority: compileInvocationAuthority,
      runtimeProfile: constrainedPreparation.runtimeProfile
    });
    const compiledExecution = compileSelectedCatalogDirectProgram({
      invocationAuthority: compileInvocationAuthority,
      runtimeProfile: constrainedPreparation.runtimeProfile,
      catalogBasis,
      selectedExecutionBinding: constrainedExecution,
      admittedTenantConformanceManifest: tenantManifest,
      ...(liveCapabilityJoin === undefined ? {} : { liveCapabilityJoin })
    });
    const applicationAdmission = constructOneSurfaceAppliedProgramAdmission({
      baseAuthorityProgram: installedOneSurface.authorityProgram,
      applicationRef: applied.application.applicationRef,
      applicationArtifact: applied.application as unknown as IJsonValue,
      compositionBasis: applied.application.programBasis,
      targetProgram: applied.application.target,
      selectedExecution: Object.freeze({
        entryRef: constrainedExecution.entryRef,
        executionBindingDigest: exactSha256(
          compiledExecution.selectedExecutionBindingDigest,
          "run.invoke compiled execution-binding digest"
        )
      }),
      compiled: compiledExecution.compiled
    });
    const appliedAuthorityProgram =
      bindOneSurfaceAuthorityProgramToAppliedProgram({
        baseAuthorityProgram: installedOneSurface.authorityProgram,
        applicationAdmission
      });
    const prepared = bindPreparedRunInvokeAuthorityProgram({
      prepared: constrainedPreparation,
      authorityProgram: appliedAuthorityProgram
    });
    const programMembers = constructOneSurfaceProgramMemberProjection({
      admittedProgramRef: appliedAuthorityProgram.admittedProgramRef,
      admittedProgramDigest: appliedAuthorityProgram.admittedProgramDigest,
      graphFunctions: Object.freeze(
        applied.application.programBasis.programMembers.map((member) =>
          Object.freeze({
            graphFunctionRef: member.graphFunctionRef,
            graphFunctionDigest: member.graphFunctionDigest
          })
        )
      )
    });
    const admission = admissionFor(packet, execution);
    const selectionPriorEvents = Object.freeze([
      ...execution.priorEvents,
      admission.event
    ]);
    const selected = await executeInstalledAbgSystemOneSurfaceSelection({
      authority: installedOneSurface,
      application: appliedAuthorityProgram,
      selection: deriveRunInvokeOneSurfaceSelection({
        prepared,
        programMembers,
        publicAdmissionEvent: admission.event
      }),
      catalogBasis,
      emitterContext: createOneSurfaceRuntimeEmitter(selectionPriorEvents),
      eventSink: execution.eventSink
    });
    const directPriorEvents = Object.freeze([
      ...selectionPriorEvents,
      ...selected.runtimeEvents
    ]);
    const finalized = finalizePrivateRunInvokeExecutionIngress({
      prepared,
      nextAction: selected.nextAction,
      intentAdmission: selected.intentAdmission,
      nativeDefinitionRelations: Object.freeze([
        bindSunnyNativeDefinition(
          family["abg.operation.workspace.create"].clean.requestContract
            .contract
        )
      ])
    });
    const direct = await executeSelectedCatalogDirectProgram({
      ingress: finalized.ingress,
      intentAdmission: selected.intentAdmission,
      targetBinding: selected.targetBinding,
      selectedIntentEvent: selected.selectedIntentEvent,
      publicOperationAdmission: admission,
      catalogBasis,
      selectedExecutionBinding: finalized.selectedExecutionBinding,
      compiledExecution,
      schemaAdmissionEngineInput: finalized.schemaAdmissionEngineInput,
      implementations: Object.freeze([
        buildAbgSystemSunnyFdImplementation()
      ]),
      priorEvents: directPriorEvents,
      eventSink: execution.eventSink
    });
    const directEmittedEvents = Object.freeze([
      admission.event,
      ...selected.runtimeEvents,
      ...direct.runtimeEvents
    ]);
    const graphCall = exactRunInvokeGraphCall({
      basisId: direct.executionBasis.id,
      events: direct.runtimeEvents
    });
    const runRef = direct.executionBasis.runId;
    if (runRef === null || graphCall.runId !== runRef) {
      throw new TypeError(
        "run.invoke AF-15 execution emitted no exact run identity"
      );
    }
    const runDigest = packet.invocation.invocationDigest;
    const evidenceRefs = Object.freeze([
      ...new Set([
        ...directEmittedEvents.map((event) => event.eventId),
        ...direct.outcome.evidenceRefs
      ])
    ]);
    const replayRef = runInvokeReplayRef(Object.freeze({
      events: Object.freeze([
        ...execution.priorEvents,
        ...directEmittedEvents
      ]),
      runRef,
      runDigest
    }));
    if (
      direct.outcome.status === "blocked" ||
      direct.outcome.status === "runtime_failed"
    ) {
      const status = direct.outcome.status;
      const owner = privateOwnerResult(
        admitP1OwnerValue(
          exactDefinition.resultContract.contract.schema,
          RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.result.schema,
          {
            kind: "run_invoke_result",
            variant: "invoke",
            disposition: status,
            phase: "post_effect",
            runRef,
            runDigest,
            graphCallRef: graphCall.graphCallId,
            resultRef: null,
            resultDigest: null,
            stopRef: status === "blocked" ? direct.outcome.reasonRef : null,
            failureRef:
              status === "runtime_failed" ? direct.outcome.reasonRef : null,
            evidenceRefs,
            replayRef
          }
        ),
        directEmittedEvents
      );
      return publicOutcome({ definition: exactDefinition, packet, owner });
    }
    if (direct.outcome.status === "completed") {
      if (
        direct.constructionInvokedEvent === null ||
        direct.assuranceProjection === null ||
        direct.admittedOutputAuthority.status !== "admitted" ||
        direct.admittedOutputAuthority.payloadRef !==
          direct.outcome.outputPayloadRef
      ) {
        throw new TypeError(
          "run.invoke completed AF-15 output has no exact AF-16 admission basis"
        );
      }
      const postAction =
        await executeInstalledAbgSystemOneSurfaceDeterministicPostAction({
          authority: installedOneSurface,
          application: appliedAuthorityProgram,
          evaluationInput: Object.freeze({
            intentAdmission: selected.intentAdmission,
            targetBinding: selected.targetBinding,
            invokedEvent: direct.constructionInvokedEvent,
            workspaceBinding: selected.intentAdmission.workspaceBinding,
            admittedEvidence: Object.freeze([
              direct.admittedOutputAuthority
            ]),
            assuranceSelection: direct.deterministicClosurePolicy,
            assuranceProjection: direct.assuranceProjection,
            priorLedger: null
          }),
          catalogBasis,
          inputPayloadRef: direct.outcome.outputPayloadRef,
          inputLineageRef: direct.outcome.outputLineageRef,
          runtimeScope: Object.freeze({
            basisId: direct.executionBasis.id,
            graphCallId: direct.constructionInvokedEvent.graphCallId,
            frameId: direct.constructionInvokedEvent.frameId
          }),
          constructionContext: Object.freeze({
            priorConstructionEvents: Object.freeze([
              ...selected.runtimeEvents,
              ...direct.runtimeEvents
            ].filter((event) => "constructionEventRef" in event)),
            af15RuntimeEvents: direct.runtimeEvents,
            af15RuntimeProjection: direct.runtimeAggregateProjection
          }),
          emitterContext: createOneSurfaceRuntimeEmitter(Object.freeze([
            ...directPriorEvents,
            ...direct.runtimeEvents
          ])),
          eventSink: execution.eventSink
        });
      const emittedEvents = Object.freeze([
        ...directEmittedEvents,
        ...postAction.runtimeEvents
      ]);
      const postEvidenceRefs = Object.freeze([
        ...new Set([
          ...evidenceRefs,
          ...postAction.runtimeEvents.map((event) => event.eventId),
          postAction.authorityResult.resultRef,
          postAction.evaluation.evidenceView.viewRef,
          postAction.evaluation.ledger.ledgerRef,
          postAction.evaluation.decision.decisionRef
        ])
      ]);
      const postReplayRef = runInvokeReplayRef(Object.freeze({
        events: Object.freeze([
          ...execution.priorEvents,
          ...emittedEvents
        ]),
        runRef,
        runDigest
      }));
      if (postAction.evaluation.decision.disposition === "close") {
        const owner = privateOwnerResult(
          admitP1OwnerValue(
            exactDefinition.resultContract.contract.schema,
            RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.result.schema,
            {
              kind: "run_invoke_result",
              variant: "invoke",
              disposition: "completed",
              phase: "post_effect",
              runRef,
              runDigest,
              graphCallRef: graphCall.graphCallId,
              resultRef: direct.admittedOutputAuthority.payloadRef,
              resultDigest: direct.admittedOutputAuthority.payloadDigest,
              stopRef: null,
              failureRef: null,
              evidenceRefs: postEvidenceRefs,
              replayRef: postReplayRef
            }
          ),
          emittedEvents
        );
        return publicOutcome({ definition: exactDefinition, packet, owner });
      }
      if (postAction.evaluation.decision.disposition === "block") {
        const owner = privateOwnerResult(
          admitP1OwnerValue(
            exactDefinition.resultContract.contract.schema,
            RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.result.schema,
            {
              kind: "run_invoke_result",
              variant: "invoke",
              disposition: "blocked",
              phase: "post_effect",
              runRef,
              runDigest,
              graphCallRef: graphCall.graphCallId,
              resultRef: null,
              resultDigest: null,
              stopRef: postAction.evaluation.decision.decisionRef,
              failureRef: null,
              evidenceRefs: postEvidenceRefs,
              replayRef: postReplayRef
            }
          ),
          emittedEvents
        );
        return publicOutcome({ definition: exactDefinition, packet, owner });
      }
      throw new TypeError(
        `run.invoke AF-16 disposition ${JSON.stringify(postAction.evaluation.decision.disposition)} requires continuation routing: ${postAction.evaluation.decision.reasonRefs.join(",")}; assurance=${direct.assuranceProjection.ambiguityRows.map((row) => `${row.status}:${row.reason}`).join(",")}`
      );
    }
    if (exactDefinition.nonTerminalContract === null) {
      throw new TypeError(
        "run.invoke held path has no published nonterminal contract"
      );
    }
    const owner = privateOwnerNonterminal(
      admitP1OwnerValue(
        exactDefinition.nonTerminalContract.contract.schema,
        RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.nonterminal.schema,
        {
          kind: "run_invoke_nonterminal",
          variant: "invoke",
          disposition: "gap_stop",
          phase: "post_effect",
          runRef,
          runDigest,
          graphCallRef: graphCall.graphCallId,
          interactionRef: null,
          gapProjectionRef: direct.outcome.reasonRef,
          evidenceRefs,
          replayRef
        }
      ),
      directEmittedEvents
    );
    return publicOutcome({ definition: exactDefinition, packet, owner });
  }

  throw new TypeError(
    `public SDK owner is not connected for ${selectedKey.operationId}`
  );
}

export function createAbiogenesisPublicSdk(): AbiogenesisPublicSdk5 {
  return Object.freeze({
    async invoke(input: AbiogenesisPublicSdkInvocation) {
      return await invokeExact(await exactFamily(), input);
    }
  });
}

export const abiogenesisPublicSdk = createAbiogenesisPublicSdk();
