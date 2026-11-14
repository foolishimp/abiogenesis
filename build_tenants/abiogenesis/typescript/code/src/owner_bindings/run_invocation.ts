import { isRecord } from "../shared/admission_predicates.js";
import { prepareRunQualificationResources } from "../product/run_invocation_operation.js";
import { projectGovernanceCoveredSourceUse } from "../abg/invocation_execution_truth.js";
import { projectOwnedRuntimeEventPrefixAtDurablePrefix, readOwnedRuntimeEventPrefixAtDurablePrefix, retainExecutionBasisLifetime, type RuntimeEventPrefix } from "../abg/event_prefix.js";
import { QUALIFICATION_RESOURCE_ASSERTION_SCHEMA } from "../validator/qualification_contracts.js";
import { ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA } from "../abg/terminal_result_contracts.js";
import { isSemanticStageDeclaration } from "../gtl/semantic_stage.js";
import {
  GRAPH_FUNCTION_SCHEMA,
  MODULE_PUBLICATION_SCHEMA,
  nativeStructuralSchema,
} from "../gtl/serialization_contracts.js";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as v from "valibot";

import { sampleNativeEventTime } from "../abg/native_event_time.js";
import { renderDiagnosticText } from "../shared/diagnostic_text.js";
import {
  CAPABILITY_DEFINITION_GRAPH_ID,
  CAPABILITY_DEFINITION_GRAPH_VERSION,
  capabilityDefinitionGraphSchema,
  type CapabilityDefinitionGraph,
} from "../shared/capability_contracts.js";

import {
  projectOwnedPrefixArtifactTruth,
  type ExactPrefixArtifactTruthProjection,
} from "../abg/artifact_truth.js";
import {
  acquireAbgEventResource,
  abandonAbgEventResource,
  completeAbgEventResource,
  validateAbgEventResourceInput,
  validateAbgEventResourceOutcome,
  type AbgEventResourceInput,
  type AbgEventResourceOutcome,
  type AcquiredAbgEventResource,
} from "../abg/definition_event_resource.js";
import {
  hasAdmittedProductInstall,
  projectAdmittedProductInstall,
  projectAdmittedWorkspaceBinding,
  boundWorkspaceMatchesExecutingToolchain,
  type PublicOperationAdmissionBasis,
} from "../abg/environment_admission.js";
import {
  admitExecutionBasis,
  admitInvocationRefusal,
} from "../abg/execution_basis.js";
import {
  admitRuntimeFailure,
  constructRuntimeFailureDiagnosticRef,
} from "../abg/runtime_failure.js";
import {
  type DurablePrefixCoordinate,
  selectHeldEventStoreDurablePrefix,
} from "../abg/event_store.js";
import {
  admitExactInvocation,
  rehydrateInvocationSourceResultBasisAtDurablePrefix,
  type InvocationAdmission,
} from "../abg/invocation_admission.js";
import { openTraversalScope } from "../abg/open_call.js";
import {
  projectRunTruthAtDurablePrefix,
  type AbgRunTruthCoordinate,
  type AbgRunTruthProjection,
} from "../abg/project_read_ports.js";
import { materializeGraph } from "../gtl/materialize.js";
import type {
  GraphFunction,
  ModulePublication,
} from "../gtl/contracts.js";
import { executeOwnedGraphTraversalEffect as executeGraphTraversalEffect } from "../hog/graph_execute.js";
import { constructAdmittedLeafInvocationPort } from
  "../implementation/leaf_invocation_port.js";
import {
  isAdmittedGraphFunctionCatalogView,
  isAdmittedReadyGraphFunctionCatalog,
  type DeclarationApplication,
  type GraphFunctionCatalogView,
  type ReadyGraphFunctionCatalog,
} from "../product/catalog.js";
import {
  type ProductInstall,
  type ResolvedProductLock,
  type WorkspaceBinding,
  type WorkspaceBindingCandidate,
} from "../product/environment.js";
import type {
  ProductInstallCandidate,
  VerifiedProductArtifact,
} from "../product/contracts.js";
import {
  ProductRunInvocationPort,
  type PreparedProductRunInvocation,
  type ProductRunInvocationResourceAssertion,
  type ProductRunInvocationSourceAssertion,
  type RunInvocationMemberKey,
} from "../product/run_invocation_operation.js";
import { RUN_OPERATION_CONTRACTS } from
  "../product/run_operation_contracts.js";
import {
  projectInstalledLeafSemantics,
} from "../product/semantics.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { bindExactPrefixTransition } from
  "../abg/exact_prefix_bindings.js";
import {
  type DefinitionCall,
  type DefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from
  "../shared/operation_definition_coordinate.js";
import {
  absolutePathSchema,
  digestSchema,
  jsonValueSchema,
  nonblankSchema,
  recordSchema,
  refDigestSchema,
  type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import { validateGraph } from "../validator/graph.js";
import { RUN_ENVIRONMENT_RESOURCES_SCHEMA } from "../product/stdo_environment.js";
import { canonicalEquals } from "../shared/value/index.js";

type InvokePacket = typeof RUN_OPERATION_CONTRACTS.invoke.invoke;
type StartPacket = typeof RUN_OPERATION_CONTRACTS.invoke.start;
type InvocationPacket = InvokePacket | StartPacket;
type ContinuePacket = typeof RUN_OPERATION_CONTRACTS.continue.current_intent;
type RunPacket = InvocationPacket | ContinuePacket;

export interface RunInvocationResourceAssertion
  extends ProductRunInvocationResourceAssertion {
  readonly kind: "run_invocation_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceInput;
  readonly applicationResources?: readonly CatalogApplicationResources[];
}

export interface RunInvocationResourceReceipt {
  readonly kind: "run_invocation_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceOutcome;
  readonly productExecutionResolution: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }> | null;
  readonly invocationAdmission: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }> | null;
  readonly run: AbgRunTruthCoordinate | null;
  readonly replay: AbgRunTruthCoordinate | null;
}

type RunCallable<TPacket extends RunPacket> = ExactDefinitionCallable<
  TPacket,
  RunInvocationResourceAssertion,
  RunInvocationResourceReceipt
>;

interface AdmittedSetupTruth {
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
  readonly admittedInstalls: readonly ProductInstall[];
  readonly workspaceBinding: WorkspaceBinding;
}

// Run exception evidence is diagnostic text: each thrown value's own text and
// each Effect cause renders a lone surrogate as its escape. Concatenating
// rendered text keeps it well formed.
function exceptionDiagnostic(error: unknown, seen = new Set<unknown>()): string {
  if (!(error instanceof Error)) return renderDiagnosticText(String(error));
  if (seen.has(error)) return "[circular Error cause]";
  seen.add(error);
  const own = renderDiagnosticText(String(error.stack ?? `${error.name}: ${error.message}`));
  const cause = error.cause === undefined ? "" : `\nCaused by: ${exceptionDiagnostic(error.cause, seen)}`;
  const members = error instanceof AggregateError
    ? error.errors.map(member => `\nAggregate cause: ${exceptionDiagnostic(member, seen)}`).join("")
    : "";
  return own + cause + members;
}

function causeDiagnostic(cause: Cause.Cause<unknown>): string {
  const defects = Array.from(Cause.defects(cause));
  return defects.length === 0 ? renderDiagnosticText(Cause.pretty(cause))
    : defects.length === 1 ? exceptionDiagnostic(defects[0])
    : `${renderDiagnosticText(Cause.pretty(cause))}\n${defects.map(error => exceptionDiagnostic(error)).join("\n")}`;
}

function fault<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  stage: string,
  code: string,
  message: string,
  evidence: Readonly<Record<string, JsonValue>> = {},
): DefinitionExecutionFault<TPacket["definitionKey"]> {
  return deepFreeze({
    kind: "definition_execution_fault" as const,
    schemaVersion: "5.0.0" as const,
    definitionKey: call.invocation.definitionKey,
    stage,
    code,
    message: renderDiagnosticText(message),
    evidence,
  });
}

function syncStage<TPacket extends RunPacket, A>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  stage: string,
  action: () => A,
): Effect.Effect<A, DefinitionExecutionFault<TPacket["definitionKey"]>> {
  return Effect.try({
    try: action,
    catch: (cause) => fault(
      call,
      stage,
      `${stage}_failure`,
      cause instanceof Error ? cause.message : String(cause),
      { cause: exceptionDiagnostic(cause) },
    ),
  });
}

function asyncStage<TPacket extends RunPacket, A>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  stage: string,
  action: () => Promise<A>,
): Effect.Effect<A, DefinitionExecutionFault<TPacket["definitionKey"]>> {
  return Effect.tryPromise({
    try: action,
    catch: (cause) => fault(
      call,
      stage,
      `${stage}_failure`,
      cause instanceof Error ? cause.message : String(cause),
      { cause: exceptionDiagnostic(cause) },
    ),
  });
}

const REF_ARRAY_SCHEMA = v.array(nonblankSchema);

// TD-34: GTL owns the graph function and module publication schemas
// (`gtl/serialization_contracts.ts`); this door imports them. In three places
// this door is stricter than the owner. Each is one named check applied on top
// of the owner's schema: the owner admits the value and this door refuses it.
// Whether the owner adopts each check is recorded under TD-34 in the technical
// debt register.

/** Stricter than the owner, which admits any string: every declaration value is nonblank. */
function hasNonblankDeclarationValues(graphFunction: Readonly<GraphFunction>): boolean {
  return Object.values(graphFunction.declarations).every((value) => v.is(nonblankSchema, value));
}

/** Stricter than the owner, which admits any string: every Program policy value is nonblank. */
function hasNonblankPolicyValues(publication: Readonly<ModulePublication>): boolean {
  return publication.programs.every((program) =>
    Object.values(program.policies).every((value) => v.is(nonblankSchema, value)));
}

/** Stricter than the owner, which checks each stage's structure alone: every
 * semantic job stage also meets the stage invariants. */
function hasSemanticJobStageInvariants(publication: Readonly<ModulePublication>): boolean {
  return publication.semanticJobLifecycle === undefined ||
    publication.semanticJobLifecycle.stages.every((stage) => isSemanticStageDeclaration(stage));
}

const RUN_INVOCATION_GRAPH_FUNCTION_SCHEMA = v.pipe(
  nativeStructuralSchema(GRAPH_FUNCTION_SCHEMA),
  v.check(hasNonblankDeclarationValues, "nonblank_declaration_value"),
) as unknown as v.GenericSchema<GraphFunction, GraphFunction>;

const RUN_INVOCATION_MODULE_PUBLICATION_SCHEMA = v.pipe(
  nativeStructuralSchema(MODULE_PUBLICATION_SCHEMA),
  v.check((publication) => publication.graphFunctions.every(hasNonblankDeclarationValues), "nonblank_declaration_value"),
  v.check(hasNonblankPolicyValues, "nonblank_policy_value"),
  v.check(hasSemanticJobStageInvariants, "semantic_job_stage_invariants"),
) as unknown as v.GenericSchema<ModulePublication, ModulePublication>;

const PRODUCT_DECLARED_DEPENDENCY_SCHEMA = v.strictObject({
  kind: v.literal("requires"),
  productId: nonblankSchema,
  packageVersion: nonblankSchema,
  compatibilityRef: nonblankSchema,
  requiredContractRefs: REF_ARRAY_SCHEMA,
  requiredCapabilityRefs: REF_ARRAY_SCHEMA,
});

const CAPABILITY_DEFINITION_GRAPH_COORDINATE_SCHEMA = v.strictObject({
  graphId: v.literal(CAPABILITY_DEFINITION_GRAPH_ID),
  graphVersion: v.literal(CAPABILITY_DEFINITION_GRAPH_VERSION),
  graphDigest: digestSchema,
});

const CAPABILITY_DEFINITION_GRAPH_SCHEMA =
  capabilityDefinitionGraphSchema as unknown as v.GenericSchema<
    CapabilityDefinitionGraph,
    CapabilityDefinitionGraph
  >;

const PRODUCT_CONTRIBUTION_MANIFEST_SCHEMA = v.strictObject({
  kind: v.literal("product_contribution_manifest"),
  schemaVersion: v.literal("5.0.0"),
  contributionManifestRef: nonblankSchema,
  productId: nonblankSchema,
  productVersion: nonblankSchema,
  descriptorRef: nonblankSchema,
  productContentDigest: digestSchema,
  publicContractCatalogId: nonblankSchema,
  publicContractCatalogDigest: digestSchema,
  capabilityDefinitionGraph: CAPABILITY_DEFINITION_GRAPH_COORDINATE_SCHEMA,
  publicationBindings: v.array(v.strictObject({
    moduleRef: nonblankSchema,
    publicationDigest: digestSchema,
  })),
  rows: v.array(v.strictObject({
    moduleRef: nonblankSchema,
    handle: nonblankSchema,
    kind: v.picklist(["graph_function", "node_type", "overlay"]),
    declarationOrContractRef: nonblankSchema,
    owningProductId: nonblankSchema,
    programMembershipRefs: REF_ARRAY_SCHEMA,
    compatibilityRefs: REF_ARRAY_SCHEMA,
    provenanceRef: nonblankSchema,
    readinessPrerequisiteRefs: REF_ARRAY_SCHEMA,
  })),
});

const PRODUCT_NATIVE_TYPED_LOCATOR_SCHEMA = v.strictObject({
  packageName: nonblankSchema,
  packageExportPath: nonblankSchema,
  namedSymbol: nonblankSchema,
  declarationPath: nonblankSchema,
  declarationInventory: v.array(v.strictObject({
    packageExportPath: nonblankSchema,
    declarationPath: nonblankSchema,
    declarationDigest: digestSchema,
  })),
});

const PRODUCT_ASSET_LOCATOR_SCHEMA = v.strictObject({
  path: nonblankSchema,
  mediaType: nonblankSchema,
  schemaVersion: nonblankSchema,
  contentDigest: digestSchema,
  definitionRef: v.optional(nonblankSchema),
});

const PRODUCT_PUBLIC_CONTRACT_SCHEMA = v.strictObject({
  contractId: nonblankSchema,
  contractVersion: v.literal("5.0.0"),
  contractDigest: digestSchema,
  contractKind: v.picklist([
    "native_typed_group",
    "schema_asset",
    "serialized_native_contract",
    "vocabulary_asset",
  ]),
  owningProduct: nonblankSchema,
  requirementAuthorityRefs: REF_ARRAY_SCHEMA,
  capabilityIdentities: REF_ARRAY_SCHEMA,
  nativeTypedLocator: v.optional(PRODUCT_NATIVE_TYPED_LOCATOR_SCHEMA),
  assetLocator: v.optional(PRODUCT_ASSET_LOCATOR_SCHEMA),
});

const RESOLVED_PRODUCT_LOCK_ROW_SCHEMA = v.strictObject({
  productId: nonblankSchema,
  packageName: nonblankSchema,
  packageVersion: nonblankSchema,
  artifactDigest: digestSchema,
  productContentDigest: digestSchema,
  manifestDigest: digestSchema,
  descriptorRef: nonblankSchema,
  publisherNamespace: nonblankSchema,
  catalogId: nonblankSchema,
  catalogDigest: digestSchema,
  capabilityDefinitionGraph: CAPABILITY_DEFINITION_GRAPH_SCHEMA,
  capabilityDefinitionGraphAsset: PRODUCT_ASSET_LOCATOR_SCHEMA,
  contributionManifestRef: nonblankSchema,
  contributionManifestDigest: digestSchema,
  contributionManifest: PRODUCT_CONTRIBUTION_MANIFEST_SCHEMA,
  compatibilityRefs: REF_ARRAY_SCHEMA,
  declaredDependencies: v.array(PRODUCT_DECLARED_DEPENDENCY_SCHEMA),
  provenanceRef: nonblankSchema,
  declaredCapabilityRefs: REF_ARRAY_SCHEMA,
  publicContracts: v.array(PRODUCT_PUBLIC_CONTRACT_SCHEMA),
  publicContractRefs: REF_ARRAY_SCHEMA,
  publicCapabilityRefs: REF_ARRAY_SCHEMA,
});

const RESOLVED_PRODUCT_LOCK_SCHEMA = v.strictObject({
  kind: v.literal("resolved_product_lock"),
  schemaVersion: v.literal("5.0.0"),
  lockId: nonblankSchema,
  lockDigest: digestSchema,
  nativeContractClosureDigest: digestSchema,
  rows: v.array(RESOLVED_PRODUCT_LOCK_ROW_SCHEMA),
  dependencyEdges: v.array(v.strictObject({
    kind: v.literal("requires"),
    fromProductId: nonblankSchema,
    toProductId: nonblankSchema,
    packageVersion: nonblankSchema,
    compatibilityRef: nonblankSchema,
    compatibilityDisposition: v.literal("compatible"),
    requiredContractRefs: REF_ARRAY_SCHEMA,
    requiredCapabilityRefs: REF_ARRAY_SCHEMA,
  })),
}) as v.GenericSchema<ResolvedProductLock, ResolvedProductLock>;

const VERIFIED_PRODUCT_SCHEMA = v.strictObject({
  kind: v.literal("verified_product_artifact"),
  schemaVersion: v.literal("5.0.0"),
  disposition: v.literal("verified"),
  verificationRef: nonblankSchema,
  verificationDigest: digestSchema,
  artifactRef: nonblankSchema,
  artifactDigest: digestSchema,
  artifactByteLength: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  productId: nonblankSchema,
  packageName: nonblankSchema,
  packageVersion: nonblankSchema,
  productContentDigest: digestSchema,
  manifestDigest: digestSchema,
  descriptorRef: nonblankSchema,
  publisherNamespace: nonblankSchema,
  contributionManifestRef: nonblankSchema,
  contributionManifestDigest: digestSchema,
  contributionManifest: PRODUCT_CONTRIBUTION_MANIFEST_SCHEMA,
  compatibilityRefs: REF_ARRAY_SCHEMA,
  declaredDependencies: v.array(PRODUCT_DECLARED_DEPENDENCY_SCHEMA),
  provenanceRef: nonblankSchema,
  declaredCapabilityRefs: REF_ARRAY_SCHEMA,
  catalogId: nonblankSchema,
  catalogDigest: digestSchema,
  capabilityDefinitionGraph: CAPABILITY_DEFINITION_GRAPH_SCHEMA,
  capabilityDefinitionGraphAsset: PRODUCT_ASSET_LOCATOR_SCHEMA,
  publicContracts: v.array(PRODUCT_PUBLIC_CONTRACT_SCHEMA),
  publicContractRefs: REF_ARRAY_SCHEMA,
  publicCapabilityRefs: REF_ARRAY_SCHEMA,
  definitionContractCoordinates: v.nullable(
    recordSchema(v.string(), jsonValueSchema),
  ),
  checkedPayloadFiles: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  nativeDeclarationEvidence: recordSchema(v.string(), jsonValueSchema),
}) as unknown as v.GenericSchema<
  VerifiedProductArtifact,
  VerifiedProductArtifact
>;

const PRODUCT_INSTALL_CANDIDATE_SCHEMA = v.strictObject({
  kind: v.literal("product_install_candidate"),
  schemaVersion: v.literal("5.0.0"),
  disposition: v.literal("materialized"),
  installId: nonblankSchema,
  installedRoot: absolutePathSchema,
  productId: nonblankSchema,
  packageName: nonblankSchema,
  packageVersion: nonblankSchema,
  artifactDigest: digestSchema,
  productContentDigest: digestSchema,
  manifestDigest: digestSchema,
  descriptorRef: nonblankSchema,
  publisherNamespace: nonblankSchema,
  contributionManifestRef: nonblankSchema,
  contributionManifestDigest: digestSchema,
  contributionManifest: PRODUCT_CONTRIBUTION_MANIFEST_SCHEMA,
  compatibilityRefs: REF_ARRAY_SCHEMA,
  declaredDependencies: v.array(PRODUCT_DECLARED_DEPENDENCY_SCHEMA),
  provenanceRef: nonblankSchema,
  declaredCapabilityRefs: REF_ARRAY_SCHEMA,
  catalogId: nonblankSchema,
  catalogDigest: digestSchema,
  capabilityDefinitionGraph: CAPABILITY_DEFINITION_GRAPH_SCHEMA,
  capabilityDefinitionGraphAsset: PRODUCT_ASSET_LOCATOR_SCHEMA,
  publicContracts: v.array(PRODUCT_PUBLIC_CONTRACT_SCHEMA),
  publicContractRefs: REF_ARRAY_SCHEMA,
  publicCapabilityRefs: REF_ARRAY_SCHEMA,
  resolvedLockId: nonblankSchema,
  resolvedLockDigest: digestSchema,
}) as v.GenericSchema<ProductInstallCandidate, ProductInstallCandidate>;

const GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA = v.strictObject({
  kind: v.literal("graph_function_catalog_entry"),
  handle: nonblankSchema,
  definitionRef: nonblankSchema,
  definitionDigest: digestSchema,
  definition: RUN_INVOCATION_GRAPH_FUNCTION_SCHEMA,
  owningProductId: nonblankSchema,
  moduleRef: nonblankSchema,
  publicationDigest: digestSchema,
  programMembershipRefs: v.array(nonblankSchema),
  compatibilityRefs: v.array(nonblankSchema),
  provenanceRefs: v.array(nonblankSchema),
  entryDigest: digestSchema,
});

const DECLARATION_CATALOG_ENTRY_SCHEMA = v.strictObject({
  kind: v.literal("declaration_catalog_entry"),
  handle: nonblankSchema,
  declarationKind: v.union([v.literal("node_type"), v.literal("overlay")]),
  declarationOrContractRef: nonblankSchema,
  owningProductId: nonblankSchema,
  moduleRef: nonblankSchema,
  publicationDigest: digestSchema,
  programMembershipRefs: v.array(nonblankSchema),
  compatibilityRefs: v.array(nonblankSchema),
  provenanceRefs: v.array(nonblankSchema),
  entryDigest: digestSchema,
});

const WORKSPACE_BINDING_CANDIDATE_SCHEMA = v.strictObject({
  kind: v.literal("workspace_binding_candidate"),
  schemaVersion: v.literal("5.0.0"),
  bindingId: nonblankSchema,
  bindingDigest: digestSchema,
  workspaceId: nonblankSchema,
  authorityBasisId: nonblankSchema,
  authorityBasisDigest: digestSchema,
  authorizedActorRef: nonblankSchema,
  productSetId: nonblankSchema,
  productSetDigest: digestSchema,
  lockId: nonblankSchema,
  lockDigest: digestSchema,
  roots: v.strictObject({
    toolchainRoot: absolutePathSchema,
    productRoot: absolutePathSchema,
    eventLogRoot: absolutePathSchema,
    runtimeStateRoot: absolutePathSchema,
    projectionRoot: absolutePathSchema,
    archiveRoot: absolutePathSchema,
  }),
}) as v.GenericSchema<WorkspaceBindingCandidate, WorkspaceBindingCandidate>;

const CATALOG_READINESS_ROW_SCHEMA = v.strictObject({
  handle: nonblankSchema,
  owningProductId: nonblankSchema,
  moduleRef: nonblankSchema,
  disposition: v.picklist([
    "admitted",
    "rejected",
    "incompatible",
    "conflicting",
    "unready",
    "unresolved",
  ]),
  readiness: v.picklist(["ready", "not_ready"]),
  reason: v.nullable(v.string()),
  readinessPrerequisiteRefs: v.array(nonblankSchema),
  rowDigest: digestSchema,
});

const READY_GRAPH_FUNCTION_CATALOG_SCHEMA = v.strictObject({
  kind: v.literal("graph_function_catalog"),
  schemaVersion: v.literal("5.0.0"),
  basisDigest: digestSchema,
  publicationDigests: v.array(digestSchema),
  entries: v.array(GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  byHandle: recordSchema(v.string(), GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  declarationEntries: v.array(DECLARATION_CATALOG_ENTRY_SCHEMA),
  declarationsByHandle: recordSchema(v.string(), DECLARATION_CATALOG_ENTRY_SCHEMA),
  readinessBasisDigest: digestSchema,
  workspaceBindingId: nonblankSchema,
  workspaceBindingDigest: digestSchema,
  lockId: nonblankSchema,
  lockDigest: digestSchema,
  productSetId: nonblankSchema,
  productSetDigest: digestSchema,
  readinessBasis: v.strictObject({
    workspaceBinding: WORKSPACE_BINDING_CANDIDATE_SCHEMA,
    resolvedLock: RESOLVED_PRODUCT_LOCK_SCHEMA,
    verifiedProducts: v.array(VERIFIED_PRODUCT_SCHEMA),
    installedProducts: v.array(PRODUCT_INSTALL_CANDIDATE_SCHEMA),
    publications: v.array(RUN_INVOCATION_MODULE_PUBLICATION_SCHEMA),
  }),
  boundPublications: v.array(RUN_INVOCATION_MODULE_PUBLICATION_SCHEMA),
  rowDispositions: v.array(CATALOG_READINESS_ROW_SCHEMA),
}) as unknown as v.GenericSchema<
  ReadyGraphFunctionCatalog,
  ReadyGraphFunctionCatalog
>;

const GRAPH_FUNCTION_CATALOG_VIEW_SCHEMA = v.strictObject({
  kind: v.literal("graph_function_catalog_view"),
  catalogBasisDigest: digestSchema,
  allowlist: v.array(nonblankSchema),
  entries: v.array(GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  byHandle: recordSchema(v.string(), GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  declarationEntries: v.array(DECLARATION_CATALOG_ENTRY_SCHEMA),
  declarationsByHandle: recordSchema(v.string(), DECLARATION_CATALOG_ENTRY_SCHEMA),
  viewDigest: digestSchema,
}) as unknown as v.GenericSchema<
  GraphFunctionCatalogView,
  GraphFunctionCatalogView
>;

const DECLARATION_APPLICATION_SCHEMA = v.strictObject({
  kind: v.literal("declaration_application"),
  catalogBasisDigest: digestSchema,
  viewDigest: digestSchema,
  declaration: DECLARATION_CATALOG_ENTRY_SCHEMA,
  targetRef: nonblankSchema,
  targetDigest: digestSchema,
  appliedValueRef: nonblankSchema,
  appliedValueDigest: digestSchema,
  applicationRef: nonblankSchema,
  applicationDigest: digestSchema,
}) as v.GenericSchema<DeclarationApplication, DeclarationApplication>;

const EVENT_RESOURCE_ASSERTION_SCHEMA = v.custom<AbgEventResourceInput>(
  validateAbgEventResourceInput, "exact ABG acquisition or acquired native selection");
const EVENT_RESOURCE_RECEIPT_SCHEMA = v.custom<AbgEventResourceOutcome>(
  validateAbgEventResourceOutcome, "owner-issued ABG completion or physical close");

const RUN_TRUTH_COORDINATE_SCHEMA = v.strictObject({
  ref: nonblankSchema,
  digest: digestSchema,
}) as v.GenericSchema<AbgRunTruthCoordinate, AbgRunTruthCoordinate>;

const RUN_INVOCATION_SOURCE_ASSERTION_SCHEMA = v.union([
  v.strictObject({ kind: v.literal("none") }),
  v.strictObject({
    kind: v.literal("admitted_source_result"),
    basis: v.strictObject({
      kind: v.literal("invocation_source_result_basis"),
      schemaVersion: v.literal("5.0.0"),
      basisRef: nonblankSchema,
      basisDigest: digestSchema,
      publicAuthorityDigest: digestSchema,
      sourceInvocationAdmissionRef: nonblankSchema,
      sourceInvocationRef: nonblankSchema,
      sourceRunId: nonblankSchema,
      sourceGraphCallId: nonblankSchema,
      sourceGraphFunctionRef: nonblankSchema,
      sourceCCallRef: nonblankSchema,
      sourceResultAdmissionEventRef: nonblankSchema,
      sourceResultJudgmentEventRef: nonblankSchema,
      sourceResultRef: nonblankSchema,
      sourceResultDigest: digestSchema,
      sourceResultValueDigest: digestSchema,
      sourceResultContractRef: nonblankSchema,
      sourceResultValue: jsonValueSchema,
      sourceReplayRef: nonblankSchema,
      sourceReplayDigest: digestSchema,
      sourceWorkspaceId: nonblankSchema,
      workspaceBindingId: nonblankSchema,
      workspaceBindingDigest: digestSchema,
    }),
  }),
]) as v.GenericSchema<
  ProductRunInvocationSourceAssertion,
  ProductRunInvocationSourceAssertion
>;

const RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA = v.strictObject({
  kind: v.literal("run_invocation_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: EVENT_RESOURCE_ASSERTION_SCHEMA,
  catalog: READY_GRAPH_FUNCTION_CATALOG_SCHEMA,
  catalogView: GRAPH_FUNCTION_CATALOG_VIEW_SCHEMA,
  applications: v.array(DECLARATION_APPLICATION_SCHEMA),
  applicationResources: v.optional(v.array(jsonValueSchema)),
  runEnvironmentResources: v.optional(RUN_ENVIRONMENT_RESOURCES_SCHEMA),
  source: RUN_INVOCATION_SOURCE_ASSERTION_SCHEMA,
  historicalSource: v.optional(ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA),
  qualificationResources: v.optional(QUALIFICATION_RESOURCE_ASSERTION_SCHEMA),
}) as unknown as v.GenericSchema<
  RunInvocationResourceAssertion,
  RunInvocationResourceAssertion
>;

/** Structural validation only; exact owner, prefix and tuple admission remains separate. */
export function isRunInvocationResourceAssertion(
  value: unknown,
): value is RunInvocationResourceAssertion {
  return v.safeParse(RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA, value).success;
}

const RUN_INVOCATION_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("run_invocation_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: EVENT_RESOURCE_RECEIPT_SCHEMA,
  productExecutionResolution: v.nullable(refDigestSchema),
  invocationAdmission: v.nullable(refDigestSchema),
  run: v.nullable(RUN_TRUTH_COORDINATE_SCHEMA),
  replay: v.nullable(RUN_TRUTH_COORDINATE_SCHEMA),
}) as v.GenericSchema<
  RunInvocationResourceReceipt,
  RunInvocationResourceReceipt
>;

function projectSetupTruth(
  prefix: DurablePrefixCoordinate,
  catalog: ReadyGraphFunctionCatalog,
): AdmittedSetupTruth | null {
  try {
    const artifactTruth = projectOwnedPrefixArtifactTruth(prefix);
    if (artifactTruth.kind === "exact_prefix_artifact_truth_projection_refusal") {
      return null;
    }
    const admittedInstalls = catalog.readinessBasis.installedProducts.map(
      (candidate) => projectAdmittedProductInstall(artifactTruth, candidate),
    );
    const workspaceBinding = projectAdmittedWorkspaceBinding(
      artifactTruth,
      catalog.readinessBasis.workspaceBinding,
    );
    return admittedInstalls.some((install) => install === null) ||
        workspaceBinding === null ||
        !boundWorkspaceMatchesExecutingToolchain(prefix, {
          ref: workspaceBinding.bindingId, digest: workspaceBinding.bindingDigest,
        })
      ? null
      : deepFreeze({
          artifactTruth,
          admittedInstalls: admittedInstalls as readonly ProductInstall[],
          workspaceBinding,
        });
  } catch {
    return null;
  }
}

function operationBasis<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  binding: WorkspaceBinding,
): PublicOperationAdmissionBasis {
  const invocationCoordinate = constructExactOperationInvocationCoordinate(
    {
      operationId: call.invocation.definitionKey.operationId,
      memberKey: call.invocation.definitionKey.memberKey,
      definitionDigest: call.invocation.definitionDigest,
    },
    call.invocation.invocationRef,
    call.invocation.requestDigest,
  );
  return deepFreeze({
    ...invocationCoordinate,
    operationId: call.invocation.definitionKey.operationId,
    authorityScopeRef: binding.bindingId,
    authorityScopeDigest: binding.bindingDigest,
    correlationId: call.invocation.correlationRef,
    eventTime: sampleNativeEventTime(),
    causationEventRefs: [],
  });
}

function resourceReceipt(
  eventResource: AbgEventResourceOutcome,
  prepared: PreparedProductRunInvocation<RunInvocationMemberKey> | null,
  admission: InvocationAdmission | null,
  truth: AbgRunTruthProjection | null,
): RunInvocationResourceReceipt {
  return deepFreeze({
    kind: "run_invocation_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    eventResource,
    productExecutionResolution: prepared === null
      ? null
      : {
          ref: prepared.resolution.resolution.resolutionRef,
          digest: prepared.resolution.resolution.resolutionDigest,
        },
    invocationAdmission: admission === null
      ? null
      : {
          ref: admission.invocationAdmissionRef,
          digest: admission.invocationAdmissionDigest,
        },
    run: truth?.run ?? null,
    replay: truth?.replay ?? null,
  });
}

function finish<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  resource: AcquiredAbgEventResource,
  finalPrefix: DurablePrefixCoordinate,
  ownerOutput: OwnerSemanticOutput<TPacket>,
  prepared: PreparedProductRunInvocation<RunInvocationMemberKey> | null,
  admission: InvocationAdmission | null,
  truth: AbgRunTruthProjection | null,
): Effect.Effect<
  DefinitionReturn<TPacket, RunInvocationResourceReceipt>,
  DefinitionExecutionFault<TPacket["definitionKey"]>
> {
  return syncStage(call, "resource_completion", () => {
    const eventResource = completeAbgEventResource(resource, finalPrefix);
    return deepFreeze({
      ownerOutput,
      resources: resourceReceipt(eventResource, prepared, admission, truth),
    });
  });
}

/** §10.12 O1: one disposable basis retention handle of this run operation
 * scope. A start names its admitted execution invocation after invocation
 * admission, never the Public request ref; a continuation names its prepared
 * original invocation, never the public continuation operation's own
 * invocation ref. Release is computational disposal on every exit and declares
 * no semantic closure. */
function retainBasisLifetime(coordinate: DurablePrefixCoordinate, invocationRef: string) {
  return Effect.acquireRelease(
    Effect.sync(() => retainExecutionBasisLifetime(coordinate, invocationRef)),
    (release) => Effect.sync(release),
  );
}

function runInvocationOwner<TPacket extends InvocationPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
): ReturnType<RunCallable<TPacket>> {
  return Effect.scoped(Effect.gen(function* () {
    const resource = yield* Effect.acquireRelease(
      Effect.suspend(() => {
        const acquired = acquireAbgEventResource(call.resources.eventResource);
        return acquired.kind === "acquired_abg_event_resource"
          ? Effect.succeed(acquired.resource)
          : Effect.fail(fault(
              call,
              "resource_acquisition",
              acquired.code,
              acquired.message,
            ));
      }),
      (held) => Effect.sync(() => abandonAbgEventResource(held)),
    );
    const entryPrefix = resource.entryPrefix;
    const setup = yield* syncStage(
      call,
      "setup_truth",
      () => projectSetupTruth(entryPrefix, call.resources.catalog),
    );
    if (setup === null) {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "setup", code: "admitted_setup_absent" },
        ) as OwnerSemanticOutput<TPacket>,
        null,
        null,
        null,
      );
    }
    const source = call.resources.source.kind === "none"
      ? call.resources.source
      : (() => {
          const basis = rehydrateInvocationSourceResultBasisAtDurablePrefix(
            entryPrefix,
            call.resources.source.basis,
          );
          return basis === null
            ? null
            : deepFreeze({
                kind: "admitted_source_result" as const,
                basis,
              });
        })();
    if (source === null) {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "observation", code: "source_result_absent" },
        ) as OwnerSemanticOutput<TPacket>,
        null,
        null,
        null,
      );
    }
    const productResources = deepFreeze({
      catalog: call.resources.catalog,
      catalogView: call.resources.catalogView,
      applications: call.resources.applications,
      source,
      ...(call.resources.historicalSource === undefined ? {} : { historicalSource: call.resources.historicalSource }),
      ...(call.resources.qualificationResources === undefined ? {} : { qualificationResources: call.resources.qualificationResources }),
      ...(call.resources.runEnvironmentResources === undefined ? {} : { runEnvironmentResources: call.resources.runEnvironmentResources }),
    });
    const preparedResult = yield* asyncStage(
      call,
      "product_prepare",
      () => ProductRunInvocationPort.prepare({
        memberKey: call.invocation.definitionKey.memberKey,
        invocation: call.invocation as never,
        resources: productResources,
        admittedInstalls: setup.admittedInstalls,
        workspaceBinding: setup.workspaceBinding,
        verifyInstallAdmission: (install) =>
          hasAdmittedProductInstall(setup.artifactTruth, install),
        transportResourceAssertion:
          call.resources.eventResource,
        deriveCurrentSourceUse: (basis, resolution) => projectGovernanceCoveredSourceUse(
          readOwnedRuntimeEventPrefixAtDurablePrefix(entryPrefix), {
            predecessorPrefix: entryPrefix, source: basis, workspaceBinding: setup.workspaceBinding,
            program: resolution.program, graphFunction: resolution.graphFunction,
            currentDeclaration: { kind: "abg_historical_declaration_proof", schemaVersion: "5.0.0", catalog: call.resources.catalog, catalogView: call.resources.catalogView },
            historicalDeclarations: call.resources.historicalSource === undefined ? [] : [call.resources.historicalSource.declarationProof,
              ...(call.resources.historicalSource.declarationDependencies ?? [])],
          }),
      }),
    );
    if (preparedResult.kind === "product_run_invocation_preparation_refusal") {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        preparedResult.ownerOutput as OwnerSemanticOutput<TPacket>,
        null,
        null,
        null,
      );
    }
    const prepared = preparedResult as PreparedProductRunInvocation<
      RunInvocationMemberKey
    >;
    if (isRecord(prepared.rawInput.value) && prepared.rawInput.value.kind === "observation_snapshot") {
      return yield* finish(call, resource, entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(call.invocation.definitionKey.memberKey,
          { stage: "observation", code: "observation_basis_mismatch" }) as OwnerSemanticOutput<TPacket>,
        null, null, null);
    }
    const admitted = yield* syncStage(call, "invocation_admission", () =>
      admitExactInvocation(
        resource.store,
        {
          invocation: prepared.candidate,
          publicInvocation: prepared.invocation,
          rawInput: prepared.rawInput,
          programPublication: prepared.resolution.programPublication,
          executionResolution: prepared.resolution.resolution,
          program: prepared.resolution.program,
          graphFunction: prepared.resolution.graphFunction,
          programValidation: prepared.resolution.programValidation,
          workspaceBinding: setup.workspaceBinding,
          artifactTruth: setup.artifactTruth,
          catalogView: productResources.catalogView,
          catalogApplications: productResources.applications,
          ...(call.resources.applicationResources === undefined ? {} : {
            catalogApplicationResources: call.resources.applicationResources,
          }),
          policy: prepared.policy,
          capabilityGrants: prepared.grants,
          authority: prepared.authority,
          ...(prepared.runEnvironment === null ? {} : { runEnvironment: prepared.runEnvironment }),
          ...(prepared.sourceResultBasis === null
            ? {}
            : { sourceResultBasis: prepared.sourceResultBasis }),
          ...(prepared.currentSourceUse === undefined ? {} : { currentSourceUse: prepared.currentSourceUse,
            sourceUseDeclarations: { current: { kind: "abg_historical_declaration_proof" as const, schemaVersion: "5.0.0" as const,
              catalog: call.resources.catalog, catalogView: call.resources.catalogView }, historical: call.resources.historicalSource === undefined ? [] :
                [call.resources.historicalSource.declarationProof, ...(call.resources.historicalSource.declarationDependencies ?? [])] } }),
        },
        operationBasis(call, setup.workspaceBinding),
      )
    );
    if (admitted.kind !== "invocation_admission_receipt") {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "invocation_admission",
            code: admitted.code,
            ...(admitted.kind === "invocation_admission_refusal" &&
                "priorAdmission" in admitted && admitted.priorAdmission !== null
              ? { evidenceRefs: [admitted.priorAdmission.admissionEventRef] }
              : {}),
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        null,
        null,
      );
    }
    const admission = admitted.admission;
    // §10.12 O1: this scope alone retains the admitted execution invocation's
    // basis rows and bodies, never the Public request ref, on the returned
    // current successor; the finalizer releases them on every exit, before
    // abandon.
    yield* retainBasisLifetime(admitted.successorPrefix, admission.invocationRef);
    const graph = yield* syncStage(call, "graph_materialization", () =>
      materializeGraph(prepared.resolution.graphFunction, {
        invocationAdmissionRef: admission.invocationAdmissionRef,
        admittedInputRef: prepared.rawInput.admissionRef,
        admittedInputDigest: prepared.rawInput.subjectDigest,
        admittedInput: prepared.rawInput.value,
      })
    );
    const graphValidation = yield* syncStage(call, "graph_validation", () =>
      validateGraph(
        graph,
        prepared.resolution.programValidation,
        prepared.resolution.graphFunction,
        {
          invocationAdmissionRef: admission.invocationAdmissionRef,
          admittedInputRef: prepared.rawInput.admissionRef,
          admittedInputDigest: prepared.rawInput.subjectDigest,
          admittedInput: prepared.rawInput.value,
        },
      )
    );
    if (graphValidation.kind !== "graph_validation") {
      const diagnosticRefs = graphValidation.diagnostics.map((row) =>
        `diagnostic://abiogenesis/validator/${row.code}@5`
      );
      const refused = yield* syncStage(call, "graph_refusal_admission", () =>
        admitInvocationRefusal(
          resource.store,
          admitted.successorPrefix,
          admission,
          "graph_validation",
          graphValidation.subjectDigest,
          diagnosticRefs,
          {
            eventTime: sampleNativeEventTime(),
            correlationId: `${call.invocation.correlationRef}/graph-validation`,
            causationEventRefs: [],
          },
        )
      );
      return yield* finish(
        call,
        resource,
        refused.successorPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "graph_validation",
            code: "validation_refused",
            evidenceRefs: [refused.admission.admissionEventRef],
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const execution = yield* syncStage(call, "execution_basis", () =>
      admitExecutionBasis(
        resource.store,
        admitted.successorPrefix,
        {
          invocationAdmission: admission,
          executionResolution: prepared.resolution.resolution,
          rawInputValue: prepared.admittedInput,
          program: prepared.resolution.program,
          programPublication: prepared.resolution.programPublication,
          programValidation: prepared.resolution.programValidation,
          graph,
          graphValidation,
          resolutionSetCandidate:
            prepared.resolution.implementationSetCandidate,
          resolutionSetValidation:
            prepared.resolution.implementationSetValidation,
          closureContract: prepared.resolution.closureContract,
        },
        {
          eventTime: sampleNativeEventTime(),
          correlationId: `${call.invocation.correlationRef}/execution-basis`,
          causationEventRefs: [],
        },
      )
    );
    if (execution.kind !== "execution_basis_admission") {
      return yield* finish(
        call,
        resource,
        execution.successorPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "execution_basis",
            code: execution.admission.stage,
            evidenceRefs: [
              execution.admission.admissionEventRef,
              ...execution.admission.contractOrDiagnosticRefs,
            ],
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const opened = yield* syncStage(call, "open_call", () =>
      openTraversalScope(
        resource.store,
        execution.successorPrefix,
        { kind: "root", executionBasis: execution.executionBasis },
        {
          eventTime: sampleNativeEventTime(),
          correlationId: `${call.invocation.correlationRef}/open`,
          causationEventRefs: [],
        },
      )
    );
    if (opened.kind !== "traversal_scope_open_admission") {
      const refused = yield* syncStage(call, "open_refusal_admission", () =>
        admitInvocationRefusal(
          resource.store,
          execution.successorPrefix,
          admission,
          "open_call",
          sha256Canonical(opened),
          [`diagnostic://abiogenesis/open-call/${opened.code}@5`],
          {
            eventTime: sampleNativeEventTime(),
            correlationId: `${call.invocation.correlationRef}/open-refusal`,
            causationEventRefs: [],
          },
        )
      );
      return yield* finish(
        call,
        resource,
        refused.successorPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "open_call",
            code: opened.code,
            evidenceRefs: [refused.admission.admissionEventRef],
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const completePostOpen = Effect.gen(function* () {
      const authorityPrefix = yield* syncStage(call, "runtime_truth", () =>
        projectOwnedRuntimeEventPrefixAtDurablePrefix(opened.successorPrefix)
      );
      const leafPort = yield* asyncStage(call, "leaf_port", () =>
        constructAdmittedLeafInvocationPort(Object.freeze({
          prefix: authorityPrefix,
          ...(prepared.qualificationResources === undefined ? {} : { qualificationResources: prepared.qualificationResources }),
          ...(call.resources.historicalSource === undefined ? {} : { historicalSource: call.resources.historicalSource }),
          artifactTruth: setup.artifactTruth,
          implementationSet: execution.implementationSet,
          executionResolution: prepared.resolution,
          semanticsProjection: projectInstalledLeafSemantics(
            prepared.resolution.productSemantics,
          ),
        }))
      );
      const traversal = yield* executeGraphTraversalEffect({
        store: resource.store,
        predecessorPrefix: opened.successorPrefix,
        executionBasis: execution.executionBasis,
        openedTraversalScope: opened.scope,
        program: prepared.resolution.program,
        graphFunction: prepared.resolution.graphFunction,
        programPublication: prepared.resolution.programPublication,
        graph,
        graphValidation,
        programValidation: prepared.resolution.programValidation,
        implementationSet: execution.implementationSet,
        interactionSet: execution.interactionSet,
        continuationProductBasis: {
          install: prepared.resolution.programInstall,
          workspaceBinding: setup.workspaceBinding,
          artifactTruth: setup.artifactTruth,
          catalogView: productResources.catalogView,
          programValidation: prepared.resolution.programValidation,
          graphValidation,
        },
        leafPort,
        closureContract: prepared.resolution.closureContract,
        actorRuntimeBinding: {
          workspaceBinding: setup.workspaceBinding,
          artifactTruth: setup.artifactTruth,
        },
        input: prepared.admittedInput,
        inputDigest: prepared.rawInput.subjectDigest,
        eventTime: sampleNativeEventTime(),
        correlationId: `${call.invocation.correlationRef}/hog`,
      });
      if (traversal.kind === "graph_traversal_entry_refusal") {
        const ownerOutput = yield* syncStage(
          call,
          "output_contract",
          () => ProductRunInvocationPort.projectOwnerRefusal(
            call.invocation.definitionKey.memberKey,
            {
              stage: "traversal",
              code: traversal.code,
              evidenceRefs: [traversal.diagnosticRef],
            },
          ) as OwnerSemanticOutput<TPacket>,
        );
        return yield* finish(
          call,
          resource,
          opened.successorPrefix,
          ownerOutput,
          prepared,
          admission,
          null,
        );
      }
      const finalPrefix = traversal.successorPrefix;
      const truth = yield* syncStage(call, "run_truth", () =>
        projectRunTruthAtDurablePrefix(finalPrefix, opened.scope.runId)
      );
      const ownerOutput = yield* syncStage(
        call,
        "output_contract",
        () => ProductRunInvocationPort.projectOutcome(
          call.invocation.definitionKey.memberKey,
          truth,
        ) as OwnerSemanticOutput<TPacket>,
      );
      return yield* finish(
        call,
        resource,
        finalPrefix,
        ownerOutput,
        prepared,
        admission,
        truth.kind === "abg_run_truth_projection" ? truth : null,
      );
    }).pipe(Effect.catchAllCause((cause) =>
      (() => {
        const failureOption = Cause.failureOption(cause);
        const executionFault = Option.isSome(failureOption)
          ? failureOption.value
          : null;
        const interrupted = Cause.isInterrupted(cause);
        const stage = executionFault?.stage === "leaf_port"
          ? "implementation_load" as const
          : executionFault?.stage === "output_contract"
          ? "output_contract" as const
          : executionFault !== null || interrupted
          ? "operation_application" as const
          : "hog_traversal" as const;
        const diagnosticClassRef = stage === "implementation_load"
          ? "diagnostic://abiogenesis/implementation/admitted-leaf-port-construction-failure@5"
          : stage === "hog_traversal"
          ? "diagnostic://abiogenesis/hog/traversal-defect@5"
          : stage === "output_contract"
          ? "diagnostic://abiogenesis/run/output-contract@5"
          : interrupted
          ? "diagnostic://abiogenesis/run/post-open-interruption@5"
          : "diagnostic://abiogenesis/run/post-open-operation@5";
        const diagnosticSubject = {
          definitionKey: call.invocation.definitionKey,
          diagnosticClassRef,
          stage: executionFault?.stage ?? (interrupted ? "interruption" : "hog_traversal"),
          code: executionFault?.code ?? (interrupted ? "interrupted" : "defect"),
          message: executionFault?.message ?? renderDiagnosticText(Cause.pretty(cause)),
          cause: executionFault?.evidence.cause ?? causeDiagnostic(cause),
        };
        const recoverAndFinish = () =>
          syncStage(call, "post_open_runtime_failure", () => {
            const predecessorPrefix = selectHeldEventStoreDurablePrefix(
              resource.store,
            );
            let finalPrefix = predecessorPrefix;
            let truth = projectRunTruthAtDurablePrefix(
              finalPrefix,
              opened.scope.runId,
            );
            if (
              truth.kind !== "abg_run_truth_projection" ||
              truth.runtimeStatus === "active"
            ) {
              const failureReceipt = admitRuntimeFailure({
                store: resource.store,
                predecessorPrefix,
                executionBasis: execution.executionBasis,
                scope: opened.scope,
                stage,
                subject: diagnosticSubject,
                diagnosticRef: constructRuntimeFailureDiagnosticRef(diagnosticSubject),
                basis: {
                  eventTime: sampleNativeEventTime(),
                  correlationId:
                    `${call.invocation.correlationRef}/post-open-runtime-failure`,
                  causationEventRefs: [],
                },
              });
              finalPrefix = failureReceipt.successorPrefix;
              truth = projectRunTruthAtDurablePrefix(
                finalPrefix,
                opened.scope.runId,
              );
            }
            return {
              finalPrefix,
              ownerOutput: ProductRunInvocationPort.projectOutcome(
                call.invocation.definitionKey.memberKey,
                truth,
              ) as OwnerSemanticOutput<TPacket>,
              truth: truth.kind === "abg_run_truth_projection" ? truth : null,
            };
          }).pipe(Effect.flatMap((recovered) => finish(
            call,
            resource,
            recovered.finalPrefix,
            recovered.ownerOutput,
            prepared,
            admission,
            recovered.truth,
          )));
        return recoverAndFinish().pipe(
          Effect.catchAllCause((recoveryCause) => recoverAndFinish().pipe(
            Effect.catchAllCause((retryCause) => Effect.failCause(
              Cause.sequential(cause, Cause.sequential(recoveryCause, retryCause)),
            )),
          )),
        );
      })()
    ));
    return yield* completePostOpen;
  }));
}

import { selectPendingExecutionUse, preparePendingExecutionContinuation, projectPendingExecutionInputAtPrefix,
  admitPendingExecutionContinuationOperation, type PendingExecutionUseRequest } from "../abg/construction_continuation.js";
import { projectEffectfulPublicInvocationTruthAtPrefix } from "../abg/effectful_invocation_truth.js";
import { ProductExecutionResolutionPort } from "../product/execution_resolution.js";
import { constructCapabilityGrant } from "../product/invocation.js";
import { constructRunOperationPolicy, expectedRunOperationAuthoritySlots, runOperationAuthorityMatches } from "../product/run_invocation_operation.js";
import { projectPendingExecutionContinuations, projectPendingExecutionUseRequest } from "../abg/construction_continuation.js";
import type { LoadedProductExecutionResolution } from "../product/execution_resolution.js";

type ContinuationPrefix = RuntimeEventPrefix;
type ContinuationRefusal<C extends string> = Readonly<{ kind: "refused"; code: C; path: string }>;

/** The fault stages one continuation selection runs under: each owner's own
 * call-bound stages, or plain evaluation for population. */
type ContinuationStages<E> = Readonly<{
  sync: <A>(stage: "runtime_truth", action: () => A) => Effect.Effect<A, E>;
  async: <A>(stage: "product_execution_resolution", action: () => Promise<A>) => Effect.Effect<A, E>;
}>;

function ownerContinuationStages<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
): ContinuationStages<DefinitionExecutionFault<TPacket["definitionKey"]>> {
  return Object.freeze({
    sync: (stage, action) => syncStage(call, stage, action),
    async: (stage, action) => asyncStage(call, stage, action),
  });
}

const POPULATION_CONTINUATION_STAGES: ContinuationStages<never> = Object.freeze({
  sync: (_stage, action) => Effect.sync(action),
  async: (_stage, action) => Effect.promise(action),
});

/** Plain evaluation of a population selection; an owner throw stays the
 * thrown value, as before the selection was shared. */
async function runPopulationSelection<A>(selection: Effect.Effect<A>): Promise<A> {
  const exit = await Effect.runPromiseExit(selection);
  if (exit._tag === "Failure") throw Cause.squash(exit.cause);
  return exit.value;
}

function resolveContinuationBasis<E>(
  stages: ContinuationStages<E>,
  setup: AdmittedSetupTruth,
  resources: Readonly<{ catalog: ReadyGraphFunctionCatalog; catalogView: GraphFunctionCatalogView }>,
  basis: Readonly<{ programRef: string; graphFunctionRef: string }>,
) {
  return stages.async("product_execution_resolution", () => ProductExecutionResolutionPort.resolve({
    catalog: resources.catalog, catalogView: resources.catalogView, admittedInstalls: setup.admittedInstalls,
    verifyInstallAdmission: install => hasAdmittedProductInstall(setup.artifactTruth, install),
    programRef: basis.programRef, selection: { kind: "admitted", graphFunctionRef: basis.graphFunctionRef },
  }));
}

/** Select, resolve and prepare one pending execution use; shared by its owner
 * and population as above. */
function selectPendingExecutionAtPrefix<E>(
  stages: ContinuationStages<E>,
  setup: AdmittedSetupTruth,
  resources: Readonly<{ catalog: ReadyGraphFunctionCatalog; catalogView: GraphFunctionCatalogView }>,
  prefix: ContinuationPrefix,
  request: PendingExecutionUseRequest,
): Effect.Effect<
  | Readonly<{
      kind: "selected";
      use: Extract<ReturnType<typeof selectPendingExecutionUse>, { kind: "pending_execution_use" }>;
      resolution: LoadedProductExecutionResolution;
      prepared: NonNullable<ReturnType<typeof preparePendingExecutionContinuation>>;
    }>
  | ContinuationRefusal<Extract<ReturnType<typeof selectPendingExecutionUse>, { kind: "refused" }>["code"] | "basis_mismatch">,
  E
> {
  return Effect.gen(function* () {
    const use = yield* stages.sync("runtime_truth", () => selectPendingExecutionUse(prefix, request));
    if (use.kind === "refused") return Object.freeze({ kind: "refused" as const, code: use.code, path: use.path });
    const resolution = yield* resolveContinuationBasis(stages, setup, resources, use.rootBasis);
    if (resolution.kind !== "loaded_product_execution_resolution") return Object.freeze({ kind: "refused" as const, code: "basis_mismatch" as const, path: "/program" });
    const prepared = yield* stages.sync("runtime_truth", () => preparePendingExecutionContinuation(prefix, use, resolution));
    if (prepared === null) return Object.freeze({ kind: "refused" as const, code: "basis_mismatch" as const, path: "/continuation" });
    return Object.freeze({ kind: "selected" as const, use, resolution, prepared });
  });
}

/** One continuation outcome over the Run's admitted truth. A Run that stops
 * states its `run_status` stop statement, from the same fold (REQ-P-POLICY-068). */
function continuationOutcome(
  continuationKind: "pending_execution",
  truth: AbgRunTruthProjection,
  successor: Readonly<{ ref: string; digest: Sha256Digest }>,
): OwnerSemanticOutput<ContinuePacket> {
  const stopped = truth.stopStatement === null ? {} : { stopStatement: truth.stopStatement };
  return (truth.runtimeStatus === "held"
    ? { outcomeKind: "nonterminal", value: { continuationKind, disposition: "held",
        run: truth.run, continuation: successor, evidence: [...truth.evidence], replay: truth.replay, ...stopped } }
    : { outcomeKind: "result", value: { continuationKind, run: truth.run, graphCall: truth.graphCall, admittedIntent: null, successor,
        disposition: truth.runtimeStatus === "closed" ? "completed" : truth.runtimeStatus === "blocked" ? "blocked" : "runtime_failed",
        evidence: [...truth.evidence], replay: truth.replay, ...stopped } }) as OwnerSemanticOutput<ContinuePacket>;
}

/** The `pending_execution` alternative of the current-execution member:
 * same-Run resumption of one replay-derived pending execution. The request
 * names the occurrence; ABG selects and consumes it once, HoG restores its
 * returns and cursor from admitted truth. No replacement Run is opened. */
function runPendingExecutionOwner(call: DefinitionCall<ContinuePacket, RunInvocationResourceAssertion>): ReturnType<RunCallable<ContinuePacket>> {
  return Effect.scoped(Effect.gen(function* () {
    const resource = yield* Effect.acquireRelease(Effect.suspend(() => {
      const acquired = acquireAbgEventResource(call.resources.eventResource);
      return acquired.kind === "acquired_abg_event_resource" ? Effect.succeed(acquired.resource)
        : Effect.fail(fault(call, "resource_acquisition", acquired.code, acquired.message));
    }), held => Effect.sync(() => abandonAbgEventResource(held)));
    const entryPrefix = resource.entryPrefix;
    const refuse = (code: "missing_continuation" | "resolved_continuation" | "response_mismatch" | "replay_mismatch" | "basis_mismatch", field: string) =>
      finish(call, resource, entryPrefix, { outcomeKind: "refusal", value: { code, issuePaths: [field], evidenceRefs: [] } } as OwnerSemanticOutput<ContinuePacket>, null, null, null);
    const request = call.invocation.request;
    if (!("pendingCursor" in request) || call.resources.source.kind !== "none") return yield* refuse("response_mismatch", "/request");
    const setup = yield* syncStage(call, "setup_truth", () => projectSetupTruth(entryPrefix, call.resources.catalog));
    if (setup === null) return yield* refuse("basis_mismatch", "/workspace");
    const prefix = yield* syncStage(call, "runtime_truth", () => projectOwnedRuntimeEventPrefixAtDurablePrefix(entryPrefix));
    const duplicate = projectEffectfulPublicInvocationTruthAtPrefix(prefix, call.invocation.invocationRef);
    if (duplicate.disposition !== "available") return yield* refuse(duplicate.disposition === "duplicate" ? "resolved_continuation" : "replay_mismatch", "/invocation");
    const selection = yield* selectPendingExecutionAtPrefix(ownerContinuationStages(call), setup, call.resources, prefix,
      request as PendingExecutionUseRequest);
    if (selection.kind === "refused") return yield* refuse(selection.code, selection.path);
    const { use, resolution, prepared } = selection;
    yield* retainBasisLifetime(entryPrefix, use.invocation.invocationRef);
    const policy = constructRunOperationPolicy(setup.workspaceBinding, resolution, call.resources.applications);
    const packet = RUN_OPERATION_CONTRACTS.continue.current_intent;
    const grant = constructCapabilityGrant(policy, use.invocation.actorRef, "abg.operation.run.continue", packet.metadata.capabilityRefs[0]!,
      { admittedInstalls: setup.admittedInstalls, workspaceBinding: setup.workspaceBinding, fixedPacket: packet });
    // The Run's own graph-entry input selects its qualification resources, as at start.
    let qualificationResources;
    try { qualificationResources = prepareRunQualificationResources(call.resources, prepared.root.rawInputValue); } catch { return yield* refuse("basis_mismatch", "/qualificationResources"); }
    const leafPort = yield* asyncStage(call, "leaf_port", () => constructAdmittedLeafInvocationPort(Object.freeze({
      prefix, ...(qualificationResources === undefined ? {} : { qualificationResources }),
      ...(call.resources.historicalSource === undefined ? {} : { historicalSource: call.resources.historicalSource }),
      artifactTruth: setup.artifactTruth, implementationSet: prepared.implementationSet, executionResolution: resolution,
      semanticsProjection: projectInstalledLeafSemantics(resolution.productSemantics),
    })));
    const pendingInput = projectPendingExecutionInputAtPrefix(prefix, use, ref => leafPort.graphFunctionByRef(ref), resolution.programValidation);
    const slot = call.invocation.invocationAuthority.slots.input_contract;
    const basisSlot = call.invocation.invocationAuthority.slots.execution_basis;
    const inputContracts = pendingInput === null ? [] : resolution.declarationPublications.flatMap(p => p.contracts).filter(c => c.contractRef === pendingInput.inputCarrierRef);
    if (pendingInput === null || policy.policyRef !== use.invocation.policyRef || policy.policyDigest !== use.invocation.policyDigest ||
      !runOperationAuthorityMatches(call.invocation, call.resources, resolution, setup.workspaceBinding, setup.admittedInstalls,
        policy, [grant], use.invocation, call.resources.eventResource) ||
      basisSlot?.ref !== prepared.root.basisRef || basisSlot.digest !== prepared.root.basisDigest || slot === null || inputContracts.length !== 1 ||
      inputContracts[0] === undefined ||
      slot.contract.ref !== pendingInput.inputCarrierRef || slot.contract.digest !== sha256Canonical(inputContracts[0]) ||
      slot.valueRef !== pendingInput.input.inputRef || slot.valueDigest !== pendingInput.input.inputDigest || !canonicalEquals(slot.value, pendingInput.input.value))
      return yield* refuse("basis_mismatch", "/invocationAuthority");
    const admitted = yield* syncStage(call, "open_call", () => admitPendingExecutionContinuationOperation(resource.store, entryPrefix,
      use, grant, operationBasis(call, setup.workspaceBinding)));
    const traversal = yield* executeGraphTraversalEffect({
      pendingExecutionResume: true,
      continuation: { runId: use.source.runId, continuationRef: use.source.continuationRef, continuationDigest: use.source.continuationDigest },
      root: {
        store: resource.store, predecessorPrefix: admitted.successorPrefix!, executionBasis: prepared.root,
        openedTraversalScope: prepared.scope, program: resolution.program, programPublication: resolution.programPublication,
        graphFunction: resolution.graphFunction, graph: prepared.graph, graphValidation: prepared.graphValidation,
        programValidation: resolution.programValidation, implementationSet: prepared.implementationSet, interactionSet: prepared.interactionSet,
        continuationProductBasis: { install: resolution.programInstall, workspaceBinding: setup.workspaceBinding,
          artifactTruth: setup.artifactTruth, catalogView: call.resources.catalogView, programValidation: resolution.programValidation, graphValidation: prepared.graphValidation },
        leafPort, closureContract: resolution.closureContract, actorRuntimeBinding: { workspaceBinding: setup.workspaceBinding, artifactTruth: setup.artifactTruth },
        eventTime: sampleNativeEventTime(), correlationId: `${call.invocation.correlationRef}/pending-execution`,
      },
    });
    const finalPrefix = "successorPrefix" in traversal ? traversal.successorPrefix : admitted.successorPrefix!;
    const truth = yield* syncStage(call, "run_truth", () => projectRunTruthAtDurablePrefix(finalPrefix, prepared.scope.runId));
    if (truth.kind !== "abg_run_truth_projection") return yield* finish(call, resource, finalPrefix,
      { outcomeKind: "refusal", value: { code: "replay_mismatch", issuePaths: ["/run"], evidenceRefs: [] } } as OwnerSemanticOutput<ContinuePacket>, null, use.invocation, null);
    const successor = { ref: use.source.continuationRef, digest: use.source.continuationDigest };
    const ownerOutput = continuationOutcome("pending_execution", truth, successor);
    return yield* finish(call, resource, finalPrefix, ownerOutput, null, use.invocation, truth);
  }));
}

/** The caller's continuation selection: the Run and one replay-derived
 * pending-execution continuation key. */
export type RunContinuationSelectionIntent =
  Readonly<{ kind: "pending_execution"; runRef: string; continuation: Readonly<{ ref: string; digest: Sha256Digest }> }>;

export type RunContinuationPopulationRefusal = Readonly<{
  kind: "run_continuation_population_refusal";
  code: "missing_continuation" | "resolved_continuation" | "response_mismatch" | "replay_mismatch" | "basis_mismatch";
  issuePath: string;
}>;

export type PopulatedRunContinuation = Readonly<{
  kind: "populated_run_continuation";
  memberKey: "current_intent";
  request: Readonly<Record<string, JsonValue>>;
  slots: Readonly<Record<string, JsonValue>>;
  resolution: import("../product/execution_resolution.js").LoadedProductExecutionResolution;
  workspaceBinding: WorkspaceBinding;
  policy: ReturnType<typeof constructRunOperationPolicy>;
  grants: readonly import("../product/invocation.js").CapabilityGrant[];
  authority: Readonly<{ authorityRef: string; authorityDigest: Sha256Digest; actorRef: string }>;
}>;

/**
 * Populate one exact run.continue request and authority slots at the
 * supplied durable prefix through the same owners the pending-execution
 * owner consults: setup truth, the Run's authority prefix, the shared
 * select-resolve-prepare sequence of the pending-execution use, the shared
 * run policy and grant, and the shared expected run-operation slots.
 * Recovery reconstructs from the log; no prior start object supplies
 * authority. Construction admits and appends nothing. A selection of any
 * other kind names no continuation this owner continues.
 */
export async function populateRunContinuationAtDurablePrefix(input: Readonly<{
  selection: RunContinuationSelectionIntent;
  prefix: DurablePrefixCoordinate;
  catalog: ReadyGraphFunctionCatalog;
  catalogView: import("../product/catalog.js").GraphFunctionCatalogView;
  applications: readonly import("../product/catalog.js").DeclarationApplication[];
  /** The exact event-resource assertion the constructed call carries. */
  transportResourceAssertion: JsonValue;
}>): Promise<PopulatedRunContinuation | RunContinuationPopulationRefusal> {
  const refuse = (code: RunContinuationPopulationRefusal["code"], issuePath: string): RunContinuationPopulationRefusal =>
    Object.freeze({ kind: "run_continuation_population_refusal", code, issuePath });
  const coordinate = (ref: string, digest: Sha256Digest) => Object.freeze({ ref, digest });
  const selection = input.selection;
  if ((selection as Readonly<{ kind: unknown }>).kind !== "pending_execution") return refuse("missing_continuation", "/continuation");
  const setup = projectSetupTruth(input.prefix, input.catalog);
  if (setup === null) return refuse("basis_mismatch", "/workspace");
  const runRef = selection.runRef;
  const prefix = projectOwnedRuntimeEventPrefixAtDurablePrefix(input.prefix);
  const resources = Object.freeze({ catalog: input.catalog, catalogView: input.catalogView });
  const inputContract = (resolution: import("../product/execution_resolution.js").LoadedProductExecutionResolution, contractRef: string) => {
    const contracts = resolution.declarationPublications.flatMap(p => p.contracts).filter(c => c.contractRef === contractRef);
    return contracts.length === 1 && contracts[0] !== undefined ? coordinate(contractRef, sha256Canonical(contracts[0] as unknown as JsonValue)) : null;
  };
  const populated = (request: Readonly<Record<string, JsonValue>>,
    resolution: import("../product/execution_resolution.js").LoadedProductExecutionResolution,
    authority: Readonly<{ authorityRef: string; authorityDigest: Sha256Digest; actorRef: string; policyRef: string; policyDigest: Sha256Digest }>,
    contract: Readonly<{ ref: string; digest: Sha256Digest }>, value: Readonly<{ inputRef: string; inputDigest: Sha256Digest; value: JsonValue }>,
    basis: Readonly<{ ref: string; digest: Sha256Digest }>): PopulatedRunContinuation | RunContinuationPopulationRefusal => {
    const policy = constructRunOperationPolicy(setup.workspaceBinding, resolution, input.applications);
    if (policy.policyRef !== authority.policyRef || policy.policyDigest !== authority.policyDigest) return refuse("basis_mismatch", "/invocationAuthority");
    const memberKey = "current_intent" as const;
    const fixedPacket = RUN_OPERATION_CONTRACTS.continue[memberKey];
    const grant = constructCapabilityGrant(policy, authority.actorRef, "abg.operation.run.continue", fixedPacket.metadata.capabilityRefs[0]!,
      { admittedInstalls: setup.admittedInstalls, workspaceBinding: setup.workspaceBinding, fixedPacket });
    const expected = expectedRunOperationAuthoritySlots({ operationId: "abg.operation.run.continue", memberKey }, true,
      { catalog: input.catalog, catalogView: input.catalogView }, resolution, setup.workspaceBinding, setup.admittedInstalls,
      policy, [grant], authority, input.transportResourceAssertion);
    return Object.freeze({
      kind: "populated_run_continuation" as const, memberKey, request, resolution,
      workspaceBinding: setup.workspaceBinding, policy, grants: Object.freeze([grant]),
      authority: Object.freeze({ authorityRef: authority.authorityRef, authorityDigest: authority.authorityDigest, actorRef: authority.actorRef }),
      slots: Object.freeze({ ...expected,
        input_contract: Object.freeze({ contract, valueRef: value.inputRef, valueDigest: value.inputDigest, value: value.value }),
        verification_references: null, execution_basis: basis }) as unknown as Readonly<Record<string, JsonValue>>,
    });
  };
  const pending = projectPendingExecutionContinuations(prefix, runRef).find(c =>
    c.continuationRef === selection.continuation.ref && c.continuationDigest === selection.continuation.digest);
  if (pending === undefined) return refuse("missing_continuation", "/continuation");
  const useRequest = projectPendingExecutionUseRequest(prefix, pending);
  if (useRequest === null) return refuse("basis_mismatch", "/run");
  const shared = await runPopulationSelection(selectPendingExecutionAtPrefix(POPULATION_CONTINUATION_STAGES, setup, resources,
    prefix, useRequest));
  if (shared.kind === "refused") return refuse(shared.code, shared.path);
  const { use, resolution, prepared } = shared;
  const graphFunctions = resolution.declarationPublications.flatMap(p => p.graphFunctions);
  const pendingInput = projectPendingExecutionInputAtPrefix(prefix, use,
    ref => graphFunctions.find(g => g.name === ref) ?? null, resolution.programValidation);
  if (pendingInput === null) return refuse("basis_mismatch", "/invocationAuthority");
  const contract = inputContract(resolution, pendingInput.inputCarrierRef);
  if (contract === null) return refuse("basis_mismatch", "/invocationAuthority");
  return populated(useRequest as unknown as Readonly<Record<string, JsonValue>>, resolution, use.invocation, contract,
    pendingInput.input as unknown as Readonly<{ inputRef: string; inputDigest: Sha256Digest; value: JsonValue }>,
    coordinate(prepared.root.basisRef, prepared.root.basisDigest));
}

// §10.11 X4: the Catalog owner's established ready Catalog and view are the
// canonical values of the structural `catalog` and `catalogView` members.
const RUN_INVOCATION_ESTABLISHED_RESOURCE_MEMBERS = Object.freeze({
  catalog: isAdmittedReadyGraphFunctionCatalog,
  catalogView: isAdmittedGraphFunctionCatalogView,
});

const invoke = bindExactPrefixTransition(
  RUN_OPERATION_CONTRACTS.invoke.invoke,
  runInvocationOwner<InvokePacket>,
  RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA,
  RUN_INVOCATION_RESOURCE_RECEIPT_SCHEMA,
  RUN_INVOCATION_ESTABLISHED_RESOURCE_MEMBERS,
);

const start = bindExactPrefixTransition(
  RUN_OPERATION_CONTRACTS.invoke.start,
  runInvocationOwner<StartPacket>,
  RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA,
  RUN_INVOCATION_RESOURCE_RECEIPT_SCHEMA,
  RUN_INVOCATION_ESTABLISHED_RESOURCE_MEMBERS,
);

const current_intent = bindExactPrefixTransition(RUN_OPERATION_CONTRACTS.continue.current_intent,
  runPendingExecutionOwner, RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA, RUN_INVOCATION_RESOURCE_RECEIPT_SCHEMA,
  RUN_INVOCATION_ESTABLISHED_RESOURCE_MEMBERS);

export const RUN_DEFINITION_BINDINGS = Object.freeze({
  invoke: Object.freeze({ invoke, start }),
  continue: Object.freeze({ current_intent }),
});
import type { CatalogApplicationResources } from "../product/declaration_application.js";
