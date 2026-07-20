import type { HelloWorldInput, HelloWorldOutput } from "../gtl/contracts.js";
import type { Sha256Digest } from "../product/digests.js";

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
