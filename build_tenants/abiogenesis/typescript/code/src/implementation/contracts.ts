import type { HelloWorldInput, HelloWorldOutput } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";

export interface DeterministicEvidenceCandidate {
  readonly kind: "deterministic_evidence_candidate";
  readonly schemaVersion: "5.0.0";
  readonly implementationRef: string;
  readonly inputDigest: Sha256Digest;
  readonly outputDigest: Sha256Digest;
}

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

export interface ProbabilisticLeafEffectPort {
  readonly invokeWorker: (
    request: Readonly<ProbabilisticWorkerRequest>,
  ) => Promise<Readonly<ProbabilisticWorkerObservation>>;
}

export interface LeafInvocationResolution {
  readonly computeRegime: "F_D" | "F_P";
  readonly implementationRef: string;
  readonly modulePath: string;
  readonly namedSymbol: string;
}

export interface ProductSemanticsProvider {
  readonly kind: "product_semantics_provider";
  readonly schemaVersion: "5.0.0";
  readonly bindingRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly admitInput: (
    contractRef: string,
    value: unknown,
  ) => Readonly<Record<string, JsonValue>> | null;
  readonly validateContractValue: (
    valueKind: string,
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
}

export interface LeafInvocationPort {
  readonly kind: "admitted_leaf_invocation_port";
  readonly installId: string;
  readonly implementationSetRef: string;
  readonly implementationSetDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
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
  readonly invoke: (
    resolution: Readonly<LeafInvocationResolution>,
    input: Readonly<Record<string, JsonValue>>,
    effects: ProbabilisticLeafEffectPort | null,
  ) => Promise<unknown>;
}
