import type {
  HelloWorldInput,
  HelloWorldOutput,
  ModulePublication,
} from "../gtl/contracts.js";
import type {
  ActorProcessCarrierValidation,
} from "../abg/actor_process.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";

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
  readonly cCallRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly programLocusRef: string;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
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
  ) => Candidate;
}

export type ProbabilisticLeafImplementation<Candidate> = (
  input: Readonly<Record<string, JsonValue>>,
  occurrence: Readonly<LeafExecutionOccurrence>,
) => Readonly<PreparedProbabilisticLeafInvocation<Candidate>>;

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
  readonly schemaVersion: "5.0.0";
  readonly workerRequest: Readonly<ProbabilisticWorkerRequest>;
  readonly workerContracts: Readonly<ProbabilisticWorkerContracts>;
  readonly complete: (
    exchange: Readonly<ActorProcessCarrierValidation>,
  ) => Readonly<ClosedProbabilisticLeafOwnerReceipt>;
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
  readonly installId: string;
  readonly implementationSetRef: string;
  readonly implementationSetDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly publication: Readonly<ModulePublication>;
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
    readonly evaluate: (input: unknown, output: unknown) => boolean;
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
    }>,
  ) => Promise<Readonly<LeafInvocationOwnerResult>>;
}
