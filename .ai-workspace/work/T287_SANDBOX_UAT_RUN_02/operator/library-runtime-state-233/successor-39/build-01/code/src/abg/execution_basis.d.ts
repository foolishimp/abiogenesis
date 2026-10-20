import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { ClosureContract, GraphFunction, GtlActionCatalogRow, GtlConstructionComposition, GtlGraph, GtlProgram, ModulePublication } from "../gtl/contracts.js";
import { type ProductExecutionResolution } from "../product/execution_resolution.js";
import { type ImplementationResolutionCandidate, type ImplementationResolutionSetCandidate, type LeafImplementationResolutionCandidate } from "../product/index.js";
import type { ProductInstall } from "../product/environment.js";
import { type JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { type GraphValidation } from "../validator/graph.js";
import { type ImplementationResolutionValidation, type ImplementationResolutionSetValidation } from "../validator/implementation_resolution.js";
import { type ProgramValidation, type ValidatedInteractionLeaf } from "../validator/validation.js";
import { type InvocationAdmission } from "./invocation_admission.js";
import { type ExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { type CCall } from "./c_call.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
import { AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type OpenedTraversalScope } from "./open_call.js";
export interface RuntimeAdmissionBasis {
    readonly eventTime: string;
    readonly correlationId: string;
    readonly causationEventRefs: readonly string[];
}
/** Subordinate dispatch coordinates, authenticated against the existing event
 * prefix and implementation owners. This value grants no execution authority. */
export interface NativeInstructionAssemblyBasis {
    readonly assessmentPublication?: Readonly<ModulePublication>;
    readonly publication: Readonly<ModulePublication>;
    readonly graph: Readonly<GtlGraph>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly declarationGraphFunctions: readonly Readonly<GraphFunction>[];
    readonly executionBasis: Readonly<ExecutionBasis>;
    readonly cCall: Readonly<CCall>;
    readonly cursor: Readonly<TraversalCursorCandidate>;
    readonly predecessorPrefix: Readonly<DurablePrefixCoordinate>;
}
/** Pure helpers consume the constructed immutable basis. Raw/copy inputs retain
 * fresh durable acquisition; this value never grants an effect or current worksite. */
export declare function authenticateNativeInstructionAssemblyBasis(basis: NativeInstructionAssemblyBasis): {
    events: readonly RuntimeEvent[];
    prefix: ValidatedRuntimeEventPrefix;
    execution: ExecutionBasis;
    graph: Readonly<GtlGraph>;
    call: CCall;
    resolution: AdmittedImplementationResolutionRow;
    program: {
        readonly kind: "gtl_program";
        readonly programRef: string;
        readonly version: "5.0.0";
        readonly moduleRef: string;
        readonly starts: readonly {
            readonly startRef: string;
            readonly graphFunctionRef: string;
        }[];
        readonly callableMembership: readonly string[];
        readonly closureContractRef: string;
        readonly policies: {
            readonly [x: string]: string;
        };
        readonly publicAssetTargets?: readonly {
            readonly kind: "program_public_asset_target";
            readonly handle: string;
            readonly assetRef: string;
            readonly startRef: string;
        }[];
        readonly actionCatalog?: {
            readonly kind: "action_catalog";
            readonly schemaVersion: "5.0.0";
            readonly catalogRef: string;
            readonly catalogDigest: `sha256:${string}`;
            readonly rows: readonly {
                readonly kind: "action_catalog_row";
                readonly actionRef: string;
                readonly actionKind: string;
                readonly programRef: string;
                readonly graphFunctionRef: string;
                readonly targetProgramLocusRef: string;
                readonly targetObligationRefs: readonly string[];
                readonly inputAssetRefs: readonly string[];
                readonly outputAssetRefs: readonly string[];
                readonly expectedDeltaRef: string;
                readonly progressConditionRef: string;
                readonly stopConditionRef: string;
            }[];
        };
        readonly constructionComposition?: {
            readonly kind: "construction_composition";
            readonly schemaVersion: "5.0.0";
            readonly compositionRef: string;
            readonly compositionDigest: `sha256:${string}`;
            readonly graphFunctionRef: string;
            readonly authorities: readonly [{
                readonly kind: "construction_authority_binding";
                readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                readonly authorityRef: string;
                readonly initialProgramLocusRef: string;
                readonly refreshProgramLocusRef: string | null;
            }, {
                readonly kind: "construction_authority_binding";
                readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                readonly authorityRef: string;
                readonly initialProgramLocusRef: string;
                readonly refreshProgramLocusRef: string | null;
            }, {
                readonly kind: "construction_authority_binding";
                readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                readonly authorityRef: string;
                readonly initialProgramLocusRef: string;
                readonly refreshProgramLocusRef: string | null;
            }, {
                readonly kind: "construction_authority_binding";
                readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                readonly authorityRef: string;
                readonly initialProgramLocusRef: string;
                readonly refreshProgramLocusRef: string | null;
            }];
            readonly interactionProgramLocusRef: string;
            readonly closurePolicy: {
                readonly kind: "construction_policy";
                readonly policyRef: string;
                readonly requireCompleteEvidence: boolean;
                readonly requirePostEvidenceRefresh: boolean;
            };
        };
    };
    environment: import("./environment_admission.js").ExactPrefixWorkspaceEnvironmentProjectionResult;
    inputRef: string;
    inputDigest: `sha256:${string}`;
    inputValue: JsonValue;
    inputOrigin: import("./traversal_cursor.js").TraversalInputOrigin;
} | null;
export declare function constructNativeInstructionAssemblyBasis<T extends NativeInstructionAssemblyBasis>(basis: T): Readonly<T> | null;
export interface InvocationRefusalAdmission {
    readonly kind: "invocation_refusal_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly refusalRef: string;
    readonly refusalDigest: Sha256Digest;
    readonly invocationAdmissionRef: string;
    readonly stage: "execution_basis" | "graph_validation" | "implementation_resolution" | "open_call";
    readonly subjectDigest: Sha256Digest;
    readonly contractOrDiagnosticRefs: readonly string[];
    readonly admissionEventRef: string;
}
export interface InvocationRefusalAdmissionReceipt {
    readonly kind: "invocation_refusal_admission_receipt";
    readonly schemaVersion: "5.0.0";
    readonly admission: InvocationRefusalAdmission;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface AdmittedImplementationResolutionRow extends Omit<LeafImplementationResolutionCandidate, "disposition" | "kind" | "schemaVersion"> {
    readonly kind: "admitted_implementation_resolution_row";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
}
export interface AdmittedInteractionContractRow extends Omit<ValidatedInteractionLeaf, "kind"> {
    readonly kind: "admitted_interaction_contract_row";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
}
export interface AdmittedImplementationSet {
    readonly kind: "admitted_implementation_set";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly implementationSetRef: string;
    readonly implementationSetDigest: Sha256Digest;
    readonly invocationAdmissionRef: string;
    readonly invocationRef: string;
    readonly resolutionSetCandidateRef: string;
    readonly resolutionSetCandidateDigest: Sha256Digest;
    readonly resolutionSetValidationRef: string;
    readonly resolutionSetValidationDigest: Sha256Digest;
    readonly catalogViewId: string;
    readonly catalogViewDigest: Sha256Digest;
    readonly publicationDigest: Sha256Digest;
    readonly programValidationRef: string;
    readonly executableLeafKeys: readonly string[];
    readonly rows: readonly AdmittedImplementationResolutionRow[];
    readonly admissionEventRef: string;
}
export interface AdmittedInteractionSet {
    readonly kind: "admitted_interaction_set";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly interactionSetRef: string;
    readonly interactionSetDigest: Sha256Digest;
    readonly invocationAdmissionRef: string;
    readonly invocationRef: string;
    readonly programValidationRef: string;
    readonly programValidationSourceDigest: Sha256Digest;
    readonly interactionLeafKeys: readonly string[];
    readonly rows: readonly AdmittedInteractionContractRow[];
    readonly admissionEventRef: string;
}
export interface AdmittedImplementationResolution {
    readonly kind: "admitted_implementation_resolution";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly resolutionRef: string;
    readonly resolutionDigest: Sha256Digest;
    readonly resolutionCandidateRef: string;
    readonly resolutionCandidateDigest: Sha256Digest;
    readonly resolutionValidationRef: string;
    readonly resolutionValidationDigest: Sha256Digest;
    readonly catalogViewId: string;
    readonly catalogViewDigest: Sha256Digest;
    readonly publicationDigest: Sha256Digest;
    readonly programValidationRef: string;
    readonly graphValidationRef: string;
    readonly graphValidationDigest: Sha256Digest;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly nodeRef: string;
    readonly implementationBindingRef: string;
    readonly implementationRef: string;
    readonly implementationBindingDigest: Sha256Digest;
    readonly implementationDescriptorDigest: Sha256Digest;
    readonly packageName: string;
    readonly packageVersion: string;
    readonly modulePath: string;
    readonly namedSymbol: string;
    readonly computeRegime: "F_D" | "F_P";
    readonly inputContractRef: string;
    readonly outputContractRef: string;
    readonly failureContractRef: string;
    readonly refusalContractRef: string;
    readonly admissionEventRef: string;
}
export interface ExecutionBasis {
    readonly constructionContinuationUse?: Readonly<{
        continuationRef: string;
        continuationDigest: Sha256Digest;
        sourceRunId: string;
        sourceExecutionBasisRef: string;
        pendingExecutionBasisRef: string;
        pendingCursorRef: string;
        pendingCursorDigest: Sha256Digest;
        constructionIntentRef: string;
        constructionIntentDigest: Sha256Digest;
        operationAdmissionEventRef: string;
    }>;
    readonly registeredSelectionDefinitionDigests?: Readonly<Record<string, Sha256Digest>>;
    readonly kind: "execution_basis";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly basisClass: "child" | "root";
    readonly basisRef: string;
    readonly basisDigest: Sha256Digest;
    readonly invocationAdmissionRef: string;
    readonly invocationRef: string;
    readonly invocationDigest: Sha256Digest;
    readonly rawInputAdmissionRef: string;
    readonly rawInputDigest: Sha256Digest;
    readonly rawInputValue: Readonly<Record<string, JsonValue>>;
    readonly workspaceBindingId: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly catalogBasisRef: string;
    readonly catalogBasisDigest: Sha256Digest;
    readonly catalogViewId: string;
    readonly catalogViewDigest: Sha256Digest;
    readonly actionCatalogRef: string | null;
    readonly actionCatalogDigest: Sha256Digest | null;
    readonly actionCatalogRows: readonly GtlActionCatalogRow[];
    readonly constructionCompositionRef: string | null;
    readonly constructionCompositionDigest: Sha256Digest | null;
    readonly constructionComposition: Readonly<GtlConstructionComposition> | null;
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly actorRef: string;
    readonly parentExecutionBasisRef: string | null;
    readonly parentTraversalScopeRef: string | null;
    readonly parentCCallRef: string | null;
    readonly entryRef: string;
    readonly programValidationRef: string;
    readonly graphValidationRef: string;
    readonly graphRef: string;
    readonly graphDigest: Sha256Digest;
    readonly implementationSetRef: string;
    readonly implementationSetDigest: Sha256Digest;
    readonly interactionSetRef: string;
    readonly interactionSetDigest: Sha256Digest;
    readonly rootImplementationSetRef: string;
    readonly rootImplementationSetDigest: Sha256Digest;
    readonly rootInteractionSetRef: string;
    readonly rootInteractionSetDigest: Sha256Digest;
    readonly localExecutableLeafKeys: readonly string[];
    readonly localImplementationSubsetDigest: Sha256Digest;
    readonly localInteractionLeafKeys: readonly string[];
    readonly localInteractionSubsetDigest: Sha256Digest;
    readonly implementationResolutionRef: string | null;
    readonly closureContractRef: string;
    readonly closureContractDigest: Sha256Digest;
    readonly terminalPredicateRef: string;
    readonly evidenceContractRef: string;
    readonly resultContractRef: string;
    readonly refusalContractRef: string;
    readonly refusalValueKind: string;
    readonly judgmentContractRef: string;
    readonly rejectionContractRef: string;
    readonly transitionContractRef: string;
    readonly replayProjectionRef: string;
    readonly terminalKind: "completed";
    readonly admissionEventRef: string;
}
export interface ExecutionBasisAdmission {
    readonly kind: "execution_basis_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly implementationSet: AdmittedImplementationSet;
    readonly interactionSet: AdmittedInteractionSet;
    readonly implementationResolution: AdmittedImplementationResolution | null;
    readonly executionBasis: ExecutionBasis;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface ExecutionBasisInput {
    readonly invocationAdmission: InvocationAdmission;
    readonly executionResolution: ProductExecutionResolution;
    readonly rawInputValue: Readonly<Record<string, JsonValue>>;
    readonly program: Readonly<GtlProgram>;
    readonly programPublication?: Readonly<ModulePublication>;
    readonly programValidation: ProgramValidation;
    readonly graph: Readonly<GtlGraph>;
    readonly graphValidation: GraphValidation;
    readonly resolutionSetCandidate: ImplementationResolutionSetCandidate;
    readonly resolutionSetValidation: ImplementationResolutionSetValidation;
    readonly resolutionCandidate?: ImplementationResolutionCandidate;
    readonly resolutionValidation?: ImplementationResolutionValidation;
    readonly closureContract: Readonly<ClosureContract>;
}
export type ExecutionBasisAdmissionResult = ExecutionBasisAdmission | InvocationRefusalAdmissionReceipt;
export interface ChildExecutionBasisInput {
    readonly parentExecutionBasis: ExecutionBasis;
    readonly parentTraversalScope: OpenedTraversalScope;
    readonly parentCCallRef: string;
    readonly program: Readonly<GtlProgram>;
    readonly programPublication?: Readonly<ModulePublication>;
    readonly programValidation: ProgramValidation;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly graph: Readonly<GtlGraph>;
    readonly graphValidation: GraphValidation;
    readonly rootImplementationSet: AdmittedImplementationSet;
    readonly rootInteractionSet: AdmittedInteractionSet;
    readonly closureContract: Readonly<ClosureContract>;
    readonly admittedInputRef: string;
    readonly admittedInputDigest: Sha256Digest;
    readonly rawInputValue: Readonly<Record<string, JsonValue>>;
}
export interface ChildExecutionBasisAdmission {
    readonly kind: "child_execution_basis_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly executionBasis: ExecutionBasis;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface ChildExecutionBasisRefusal {
    readonly kind: "child_execution_basis_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "basis_fork_detected" | "child_graph_mismatch" | "child_input_mismatch" | "child_membership_mismatch" | "child_subset_mismatch" | "child_basis_already_admitted" | "parent_basis_mismatch";
    readonly message: string;
}
export type ChildExecutionBasisResult = ChildExecutionBasisAdmission | ChildExecutionBasisRefusal;
export declare function exactProgramOwnerInstall(environment: ExactPrefixWorkspaceEnvironment, rows: readonly Readonly<{
    graphFunctionRef: string;
    graphFunctionOwnerProductId: string;
    graphFunctionPublicationDigest: Sha256Digest;
    implementationOwnerProductId: string;
    implementationPublicationDigest: Sha256Digest;
    packageName: string;
    packageVersion: string;
    publicationDigest: Sha256Digest;
}>[], graphFunctionRef: string, moduleRef: string, programRef: string, programPublicationDigest: Sha256Digest, programDigest: Sha256Digest, programPublication: Readonly<ModulePublication> | undefined): ProductInstall | null;
/** Re-enters the current physical prefix before C2 creates any launch or observation artifact. */
export declare function hasExactWorksiteCommandLeafSourceAtDurablePrefix(predecessor: DurablePrefixCoordinate, cCallRef: string, value: unknown): boolean;
export declare function hasExactInvocationObservationBasis(value: Readonly<Record<string, JsonValue>>, workspaceBindingId: string, workspaceBindingDigest: Sha256Digest, program: Readonly<GtlProgram>): boolean;
export declare function isExecutionBasis(value: object): boolean;
export declare function isAdmittedImplementationResolution(value: object): boolean;
export declare function isAdmittedImplementationSet(value: object): boolean;
export declare function isAdmittedInteractionSet(value: object): boolean;
export declare function admittedConstructionComposition(basis: ExecutionBasis): Readonly<GtlConstructionComposition> | null;
export declare function selectAdmittedConstructionAuthority(basis: ExecutionBasis, semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction"): {
    readonly kind: "construction_authority_binding";
    readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
    readonly authorityRef: string;
    readonly initialProgramLocusRef: string;
    readonly refreshProgramLocusRef: string | null;
} | null;
export declare function isAdmittedConstructionInteractionLocus(basis: ExecutionBasis, programLocusRef: string, compositionRef: string | null): boolean;
export declare function hasAdmittedImplementationSet(store: AbgEventStore, set: AdmittedImplementationSet): boolean;
export declare function hasAdmittedImplementationSetAtPrefix(prefix: ValidatedRuntimeEventPrefix, set: AdmittedImplementationSet): boolean;
export interface ImplementationResolutionSelection {
    readonly graphFunctionRef: string;
    readonly nodeRef: string;
    readonly programLocusRef: string;
    readonly implementationBindingRef: string;
}
export interface InteractionContractSelection {
    readonly graphFunctionRef: string;
    readonly nodeRef: string;
    readonly programLocusRef: string;
    readonly interactionKind: string;
    readonly actorCapabilityRef: string;
    readonly requestContractRef: string;
    readonly responseContractRef: string;
    readonly continuationContractRef: string;
}
export declare function selectAdmittedImplementationResolution(set: AdmittedImplementationSet, selection: ImplementationResolutionSelection): AdmittedImplementationResolutionRow | null;
export declare function selectAdmittedInteractionContract(set: AdmittedInteractionSet, selection: InteractionContractSelection): AdmittedInteractionContractRow | null;
export declare function hasAdmittedInteractionSetAtPrefix(prefix: ValidatedRuntimeEventPrefix, set: AdmittedInteractionSet): boolean;
export declare function rehydrateAdmittedImplementationSet(store: AbgEventStore, implementationSetRef: string): AdmittedImplementationSet | null;
export declare function rehydrateAdmittedImplementationSetAtPrefix(prefix: ValidatedRuntimeEventPrefix, implementationSetRef: string): AdmittedImplementationSet | null;
export declare function rehydrateAdmittedInteractionSet(store: AbgEventStore, interactionSetRef: string): AdmittedInteractionSet | null;
export declare function rehydrateAdmittedInteractionSetAtPrefix(prefix: ValidatedRuntimeEventPrefix, interactionSetRef: string): AdmittedInteractionSet | null;
export declare function hasAdmittedImplementationResolution(store: AbgEventStore, resolution: AdmittedImplementationResolution): boolean;
export declare function hasAdmittedExecutionBasisAtPrefix(prefix: ValidatedRuntimeEventPrefix, basis: ExecutionBasis): boolean;
export declare function rehydrateExecutionBasis(store: AbgEventStore, basisRef: string): ExecutionBasis | null;
export declare function rehydrateExecutionBasisAtPrefix(prefix: ValidatedRuntimeEventPrefix, basisRef: string): ExecutionBasis | null;
export declare function admitInvocationRefusal(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, invocationAdmission: InvocationAdmission, stage: InvocationRefusalAdmission["stage"], subjectDigest: Sha256Digest, contractOrDiagnosticRefs: readonly string[], basis: RuntimeAdmissionBasis): InvocationRefusalAdmissionReceipt;
export declare function admitExecutionBasis(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, input: ExecutionBasisInput, basis: RuntimeAdmissionBasis): ExecutionBasisAdmissionResult;
export declare function admitChildExecutionBasis(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, input: ChildExecutionBasisInput, basis: RuntimeAdmissionBasis): ChildExecutionBasisResult;
/** One workflow preparation owns the first raw acquisition and its intent.
 * Only the native owner's exact immutable lookup pair permits pure staging. */
export declare function prepareWorkflowChildExecutionBasis(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, cursor: TraversalCursorCandidate, lookups: Pick<LeafInvocationPort, "graphFunctionByRef" | "closureContractByRef">): Readonly<{
    intent: import("./traversal_route.js").ConstructionIntentAdmission | null;
    admit(input: ChildExecutionBasisInput, basis: RuntimeAdmissionBasis): ChildExecutionBasisResult;
}>;
/** A new Run-local basis uses the same admitted invocation/work authority.
 * The continuation owner supplies the separately admitted operation and exact
 * pending-source relation; no invocation or ConstructionIntent is reminted. */
import { type PreparedConstructionContinuationOperation } from "./construction_continuation.js";
export declare function admitConstructionContinuationExecutionBasis(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, plan: PreparedConstructionContinuationOperation, basis: RuntimeAdmissionBasis): Readonly<{
    executionBasis: ExecutionBasis;
    successorPrefix: DurablePrefixCoordinate;
    operation: RuntimeEvent;
}>;
