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
  readonly implementationRef: string;
  readonly inputDigest: Sha256Digest;
  readonly materializationPlanRef: string;
  readonly rendererRef: string;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly prompt: string;
  readonly responseJsonSchema: Readonly<Record<string, JsonValue>>;
}

export interface ProbabilisticWorkerObservation {
  readonly actorInvocationRef: string;
  readonly disposition: "failure" | "success";
  readonly failureClass: string | null;
  readonly finalOutput: string;
  readonly promptDigest: Sha256Digest;
  readonly transportDigest: Sha256Digest;
  readonly transportLane: "closed_prompt_proof" | "worker_executes";
  readonly processStatus: number | null;
  readonly processSignal: string | null;
  readonly timedOut: boolean;
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

export interface LeafInvocationPort {
  readonly invoke: (
    resolution: Readonly<LeafInvocationResolution>,
    input: Readonly<Record<string, JsonValue>>,
    effects: ProbabilisticLeafEffectPort | null,
  ) => Promise<unknown>;
}
