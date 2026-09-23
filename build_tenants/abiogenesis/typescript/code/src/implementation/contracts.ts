import type { QualificationOwnerBasis } from "../validator/self_conformance_basis.js";
import type { RequirementHandoffDeclarationBasis } from "../abg/requirement_handoff.js";
import type { SemanticStageNativeBasis } from "../abg/semantic_stage.js";
import type { WorksitePreservedResultNativeBasis } from "../abg/worksite_construction_recovery.js";
import type {
  ClosureContract,
  GraphFunction,
  HelloWorldInput,
  HelloWorldOutput,
  ModulePublication,
} from "../gtl/contracts.js";
import type {
  ActorProcessCarrierValidation,
} from "../abg/actor_process.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import type { CCall } from "../abg/c_call.js";
import type {
  AdmittedImplementationResolutionRow,
  AdmittedImplementationSet,
  ExecutionBasis,
} from "../abg/execution_basis.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { WorkspaceBinding } from "../product/environment.js";

export interface DeterministicEvidenceCandidate {
  readonly kind: "deterministic_evidence_candidate";
  readonly schemaVersion: "5.0.0";
  readonly implementationRef: string;
  readonly inputDigest: Sha256Digest;
  readonly outputDigest: Sha256Digest;
}

export interface LeafRealizationSuccessCandidate<
  Output extends Readonly<Record<string, JsonValue>> = Readonly<
    Record<string, JsonValue>
  >,
> {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "success";
  readonly evidenceCandidates: readonly DeterministicEvidenceCandidate[];
  readonly resultCandidate: Output;
}

export interface LeafRealizationFailureCandidate {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failure";
  readonly evidenceCandidates: readonly DeterministicEvidenceCandidate[];
  readonly resultCandidate: Readonly<Record<string, JsonValue>>;
  readonly diagnosticRef: string;
}

export type LeafRealizationCandidate<
  Output extends Readonly<Record<string, JsonValue>> = Readonly<
    Record<string, JsonValue>
  >,
> = LeafRealizationSuccessCandidate<Output> | LeafRealizationFailureCandidate;

export interface HelloWorldLeafRealizationCandidate {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "success";
  readonly evidenceCandidates: readonly [DeterministicEvidenceCandidate];
  readonly resultCandidate: HelloWorldOutput;
}

export type HelloWorldLeafImplementation = (
  input: Readonly<HelloWorldInput>,
) => Readonly<HelloWorldLeafRealizationCandidate>;

export interface ProbabilisticWorkerRequest {
  readonly actorRef: string;
  readonly workerBindingRef: string;
  readonly implementationRef: string;
  readonly inputDigest: Sha256Digest;
  readonly materializationPlanRef: string;
  readonly rendererRef: string;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly transportLane: "closed_prompt_proof" | "worker_executes";
  readonly prompt: string;
  readonly responseJsonSchema: Readonly<Record<string, JsonValue>>;
}

export interface ProbabilisticWorkerObservation {
  readonly actorInvocationRef: string;
  readonly transportBindingRef: string;
  readonly transportBindingDigest: Sha256Digest;
  readonly disposition: "failure" | "success";
  readonly failureClass: string | null;
  readonly finalOutput: string;
  readonly promptDigest: Sha256Digest;
  readonly transportDigest: Sha256Digest;
  readonly transportLane: "closed_prompt_proof" | "worker_executes";
  readonly processStatus: number | null;
  readonly processSignal: string | null;
  readonly timeoutClass: "absolute" | "inactivity" | null;
  readonly timedOut: boolean;
  readonly exitObserved: boolean;
  readonly terminationConfirmed: boolean;
  readonly progressEventCount: number;
  readonly toolCallCount: number;
  readonly artifactDigests: Readonly<{
    output: Sha256Digest;
    prompt: Sha256Digest;
    stderr: Sha256Digest;
    stdout: Sha256Digest;
    transport: Sha256Digest;
  }>;
}

export interface LeafExecutionOccurrence {
  readonly nativeWorkReacquisitionBasis?: Readonly<import("../abg/native_work_reacquisition.js").NativeWorkReacquisitionBasis>;
  readonly nativeInstructionAssemblyBasis?: Readonly<import("../abg/execution_basis.js").NativeInstructionAssemblyBasis>;
  readonly worksiteCommandForwardBasis?: Readonly<import("../abg/worksite_command_forward.js").WorksiteCommandForwardNativeBasis>;
  readonly worksitePreservedResultBasis?: Readonly<WorksitePreservedResultNativeBasis>;
  readonly qualificationOwnerBasis?: Readonly<QualificationOwnerBasis>;
  readonly semanticStageBasis?: Readonly<SemanticStageNativeBasis>;
  readonly requirementHandoffBasis?: Readonly<RequirementHandoffDeclarationBasis>;
  readonly cCallRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly programLocusRef: string;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly executionAuthority: Readonly<LeafExecutionAuthority> | null;
}

/** Internal operations of the invoking ABG owner, never serialized basis or evidence. */
export interface NativeLeafProofOperations {
  readonly qualificationSelfConformance?: (input: unknown, occurrence: LeafExecutionOccurrence) =>
    ReturnType<typeof import("../validator/self_conformance.js").evaluateSelfConformance> | null;
  readonly qualificationVerdict?: (input: unknown, occurrence: LeafExecutionOccurrence) =>
    ReturnType<typeof import("../abg/qualification_proof.js").projectExactCandidateQualification>;
  readonly qualificationAssessment?: (input: unknown, occurrence: LeafExecutionOccurrence) =>
    ReturnType<typeof import("../abg/qualification_proof.js").projectNativeRuntimeAssessment>;
  readonly nativeWorkReacquisition?: (input: unknown, occurrence: LeafExecutionOccurrence) =>
    ReturnType<typeof import("../abg/native_work_reacquisition.js").authenticateNativeWorkReacquisition>;
}

/** Bound to one declared relation evaluation by its invoking leaf port. */
export interface NativeJudgmentProofOperations {
  readonly qualificationVerdict?: () => ReturnType<typeof import("../abg/qualification_proof.js").projectExactCandidateQualification>;
  readonly qualificationAssessment?: () => ReturnType<typeof import("../abg/qualification_proof.js").projectNativeRuntimeAssessment>;
  readonly nativeWorkReacquisition?: () => boolean;
}

export interface LeafExecutionAuthority {
  readonly kind: "leaf_execution_authority";
  readonly schemaVersion: "5.0.0";
  readonly authorityRef: string;
  readonly authorityDigest: Sha256Digest;
  readonly actorRef: string;
  /** Exact immutable values needed by the selected physical owner. */
  readonly workspaceBinding: Readonly<WorkspaceBinding>;
  readonly workspaceBindingIdentity: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly executionBasis: Readonly<ExecutionBasis>;
  readonly executionBasisRef: string;
  readonly executionBasisDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  /** Full immutable Program publication, bound to the admitted raw digest. */
  readonly programPublication: Readonly<ModulePublication>;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly cCallDigest: Sha256Digest;
  readonly cCall: Readonly<CCall>;
  /** Exact durable ABG prefix at which this C-call is selected for its owner. */
  readonly predecessorPrefix: Readonly<DurablePrefixCoordinate>;
  readonly implementationSet: Readonly<AdmittedImplementationSet>;
  readonly implementationSetRef: string;
  readonly implementationSetDigest: Sha256Digest;
  readonly leafResolutionCandidateRef: string;
  readonly leafResolutionCandidateDigest: Sha256Digest;
  readonly implementationResolutionRef: string;
  readonly implementationResolutionDigest: Sha256Digest;
  readonly implementationResolution:
    Readonly<AdmittedImplementationResolutionRow>;
  readonly implementationBindingRef: string;
  readonly implementationBindingDigest: Sha256Digest;
  readonly implementationRef: string;
  readonly implementationOwnerRef: string;
  readonly effectUri: "effect://abiogenesis/worksite/file.replace/v1" | "effect://abiogenesis/worksite/file.parents/v1" | "effect://abiogenesis/worksite/native-work/v1";
  readonly handlerRef: "handler://abiogenesis/product/worksite/file.replace/v1" | "handler://abiogenesis/product/worksite/file.parents/v1" | "handler://abiogenesis/worksite/native-work/v1";
  readonly handlerDigest: Sha256Digest;
  readonly capabilityGrantRef: string;
  readonly capabilityGrantDigest: Sha256Digest;
}

export interface ProbabilisticWorkerContracts {
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
}

export interface PreparedProbabilisticLeafInvocation<Candidate> {
  readonly kind: "prepared_probabilistic_leaf_invocation";
  readonly schemaVersion: "5.0.0";
  readonly workerRequest: Readonly<ProbabilisticWorkerRequest>;
  readonly complete: (
    exchange: Readonly<ActorProcessCarrierValidation>,
  ) => Candidate | Promise<Candidate>;
}

export type ProbabilisticLeafImplementation<Candidate> = (
  input: Readonly<Record<string, JsonValue>>,
  occurrence: Readonly<LeafExecutionOccurrence>,
) => Readonly<PreparedProbabilisticLeafInvocation<Candidate>> | Promise<Readonly<PreparedProbabilisticLeafInvocation<Candidate>>>;

export interface DeterministicLeafInvocationReceipt<Candidate> {
  readonly kind: "leaf_invocation_receipt";
  readonly schemaVersion: "5.0.0";
  readonly computeRegime: "F_D";
  readonly candidate: Candidate;
  readonly actorProcessExchange: null;
}

export interface ProbabilisticLeafInvocationReceipt<Candidate> {
  readonly kind: "leaf_invocation_receipt";
  readonly schemaVersion: "5.0.0";
  readonly computeRegime: "F_P";
  readonly candidate: Candidate;
  readonly actorProcessExchange: Readonly<ActorProcessCarrierValidation>;
}

export type LeafInvocationReceipt<Candidate> =
  | DeterministicLeafInvocationReceipt<Candidate>
  | ProbabilisticLeafInvocationReceipt<Candidate>;

export type ClosedLeafInvocationReceipt = LeafInvocationReceipt<
  Readonly<LeafRealizationCandidate>
>;

export interface ClosedDeterministicLeafOwnerReceipt {
  readonly kind: "closed_leaf_owner_receipt";
  readonly schemaVersion: "5.0.0";
  readonly computeRegime: "F_D";
  readonly candidate: Readonly<LeafRealizationCandidate>;
  readonly receipt: Readonly<DeterministicLeafInvocationReceipt<Readonly<LeafRealizationCandidate>>> | null;
  readonly workerContracts: null;
}

export interface ClosedUndispatchedProbabilisticLeafOwnerReceipt {
  readonly kind: "closed_leaf_owner_receipt";
  readonly schemaVersion: "5.0.0";
  readonly computeRegime: "F_P";
  readonly effectDisposition: "not_dispatched";
  readonly ownerObservation: import("../abg/event_contract_profiles.js").UndispatchedOwnerObservation;
  readonly candidate: Readonly<LeafRealizationFailureCandidate>;
  readonly receipt: null;
  readonly workerContracts: null;
}

export interface ClosedProbabilisticLeafOwnerReceipt {
  readonly kind: "closed_leaf_owner_receipt";
  readonly schemaVersion: "5.0.0";
  readonly computeRegime: "F_P";
  readonly effectDisposition: "completed";
  readonly candidate: Readonly<LeafRealizationCandidate>;
  readonly receipt: Readonly<ProbabilisticLeafInvocationReceipt<Readonly<LeafRealizationCandidate>>>;
  readonly workerContracts: Readonly<{
    readonly instructionContractRef: string;
    readonly resultContractRef: string;
  }>;
}

export type ClosedLeafOwnerReceipt =
  | ClosedDeterministicLeafOwnerReceipt
  | ClosedUndispatchedProbabilisticLeafOwnerReceipt
  | ClosedProbabilisticLeafOwnerReceipt;

export interface LeafInvocationOwnerRefusal {
  readonly kind: "leaf_invocation_owner_refusal";
  readonly schemaVersion: "5.0.0";
  readonly code: "failure_contract_absent" | "owner_boundary_exception";
  readonly diagnosticRef: string;
}

export interface PreparedProbabilisticLeafOwnerInvocation {
  readonly kind: "prepared_probabilistic_leaf_owner_invocation";
  readonly invokeActorProcess: typeof import("../abg/actor_process.js").invokeActorProcess;
  readonly schemaVersion: "5.0.0";
  readonly workerRequest: Readonly<ProbabilisticWorkerRequest>;
  readonly workerContracts: Readonly<ProbabilisticWorkerContracts>;
  readonly complete: (
    exchange: Readonly<ActorProcessCarrierValidation>,
  ) => Readonly<ClosedProbabilisticLeafOwnerReceipt> |
    Promise<Readonly<ClosedProbabilisticLeafOwnerReceipt>>;
}

export type LeafInvocationOwnerResult =
  | ClosedLeafOwnerReceipt
  | LeafInvocationOwnerRefusal
  | PreparedProbabilisticLeafOwnerInvocation;

export interface LeafInvocationResolution {
  readonly computeRegime: "F_D" | "F_P";
  readonly implementationRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly modulePath: string;
  readonly namedSymbol: string;
}

export interface VerifiedProbabilisticResultContractPreimage {
  readonly kind: "verified_probabilistic_result_contract_preimage";
  readonly schemaVersion: "5.0.0";
  readonly verificationRef: string;
  readonly verificationDigest: Sha256Digest;
  readonly contractCapabilityBasis: Readonly<{
    readonly installId: string;
    readonly implementationSetRef: string;
    readonly implementationSetDigest: Sha256Digest;
    readonly publicationDigest: Sha256Digest;
  }>;
  readonly implementationResolutionDigest: Sha256Digest;
  readonly implementationRef: string;
  readonly inputContractRef: string;
  readonly targetOutputContractRef: string;
  readonly instructionContractRef: string;
  readonly rawResultContractRef: string;
  readonly inputDigest: Sha256Digest;
  readonly rawResultDigest: Sha256Digest;
}

export interface ProbabilisticResultContractPreimageRefusal {
  readonly kind: "probabilistic_result_contract_preimage_refusal";
  readonly schemaVersion: "5.0.0";
  readonly code:
    | "contract_identity_mismatch"
    | "input_contract_refused"
    | "owner_boundary_exception"
    | "result_contract_refused"
    | "unadmitted_resolution";
  readonly diagnosticRef: string;
}

export type ProbabilisticResultContractPreimageVerification =
  | VerifiedProbabilisticResultContractPreimage
  | ProbabilisticResultContractPreimageRefusal;

export interface LeafInvocationPort {
  readonly kind: "admitted_leaf_invocation_port";
  readonly isExactLoadedCapability: () => boolean;
  readonly ownerInstallIds: readonly string[];
  readonly implementationSetRef: string;
  readonly implementationSetDigest: Sha256Digest;
  readonly publicationDigests: readonly Sha256Digest[];
  readonly hasOwnerCapability: (
    installId: string,
    publicationDigest: Sha256Digest,
  ) => boolean;
  readonly isAdmittedResolution: (
    resolution: Readonly<LeafInvocationResolution>,
  ) => boolean;
  readonly forGraphFunction: (graphFunctionRef: string) => Promise<LeafInvocationPort | null>;
  readonly sourcePublicationByDeclarationRef?: (declarationRef: string) => Readonly<ModulePublication> | null;
  readonly semanticPublicationByDeclarationRef?: (declarationRef: string) => Readonly<ModulePublication> | null;
  readonly declarationGraphFunctions?: () => readonly Readonly<GraphFunction>[];
  readonly graphFunctionByRef: (
    graphFunctionRef: string,
  ) => Readonly<GraphFunction> | null;
  readonly closureContractByRef: (
    closureContractRef: string,
  ) => Readonly<ClosureContract> | null;
  readonly contractValueKindByRef: (
    contractRef: string,
  ) => string | null;
  readonly validateContractValueByRef: (
    contractRef: string,
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
  readonly contractValueKind: (
    contractRef: string,
    contractKind: "failure" | "output",
  ) => string | null;
  readonly validateContractValue: (
    contractRef: string,
    contractKind: "failure" | "output",
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
  readonly resolveJudgmentRelation: (
    predicateRef: string,
  ) => Readonly<{
    readonly predicateRef: string;
    readonly advanceReasonRef: string;
    readonly rejectionReasonRef: string;
    readonly evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations) => boolean;
  }> | null;
  readonly validateResultEvidenceLineage: (
    outputContractRef: string,
    value: Readonly<Record<string, JsonValue>>,
    admittedEvidence: readonly Readonly<Record<string, JsonValue>>[],
  ) => boolean;
  readonly verifyProbabilisticResultContractPreimage: (
    input: Readonly<{
      readonly resolution: Readonly<LeafInvocationResolution>;
      readonly input: Readonly<Record<string, JsonValue>>;
      readonly inputDigest: Sha256Digest;
      readonly instructionContractRef: string;
      readonly rawResultContractRef: string;
      readonly rawResult: Readonly<Record<string, JsonValue>>;
    }>,
  ) => Readonly<ProbabilisticResultContractPreimageVerification>;
  readonly invoke: (
    call: Readonly<{
      resolution: Readonly<LeafInvocationResolution>;
      input: Readonly<Record<string, JsonValue>>;
      inputDigest: Sha256Digest;
      failureContractRef: string;
      occurrence: Readonly<LeafExecutionOccurrence>;
      predecessorPrefix?: DurablePrefixCoordinate;
    }>,
  ) => Promise<Readonly<LeafInvocationOwnerResult>>;
}
