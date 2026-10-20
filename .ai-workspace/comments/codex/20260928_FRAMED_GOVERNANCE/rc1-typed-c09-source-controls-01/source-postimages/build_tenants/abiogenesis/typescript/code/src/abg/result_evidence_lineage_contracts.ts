import type { Sha256Digest } from "../shared/digests.js";

/** REQ-P-QUAL-064A; T287 carrier Design 5.1. Presence is checked locally;
 * actual ownership and equality remain ABG admission/lineage obligations. */
export type ResultEvidenceClass =
  | "deterministic"
  | "interaction_request"
  | "probabilistic_transport"
  | "undispatched_owner_refusal"
  | "worksite_file_replace"
  | "sub_traversal";

export interface ProbabilisticResultLineageMetadata {
  readonly actorInvocationRef: string;
  readonly actorRef: string;
  readonly workerBindingRef: string;
  readonly transportBindingRef: string;
  readonly transportBindingDigest: Sha256Digest;
  readonly requestDigest: Sha256Digest;
  readonly promptDigest: Sha256Digest;
  readonly transportDisposition: "failure" | "success";
  readonly transportFailureClass: string | null;
}

type ProbabilisticResultEvidenceBranch = Readonly<{
  evidenceClass: "probabilistic_transport";
} & ProbabilisticResultLineageMetadata>;
type OtherResultEvidenceBranch = Readonly<{
  evidenceClass: Exclude<ResultEvidenceClass, "probabilistic_transport">;
} & Partial<ProbabilisticResultLineageMetadata>>;

/** The evidence producer checks this discriminated source at minting. */
export type ResultEvidenceLineageSource = Readonly<{
  cCallRef: string;
  inputDigest: Sha256Digest;
  outputDigest: Sha256Digest;
  transportDigest?: Sha256Digest;
}> & (ProbabilisticResultEvidenceBranch & Readonly<{ transportDigest: Sha256Digest }>
  | OtherResultEvidenceBranch);

/** The same destination contract crosses the actual result callback, leaf
 * bridge and both Product hooks. Nonprobabilistic actor data stays optional. */
export type ResultEvidenceLineage = Readonly<{
  cCallRef: string;
  cCallAttempt: number;
  evidenceRef: string;
  evidenceDigest: Sha256Digest;
  inputDigest: Sha256Digest;
  outputDigest: Sha256Digest;
  transportDigest: Sha256Digest | null;
}> & (ProbabilisticResultEvidenceBranch | OtherResultEvidenceBranch);
