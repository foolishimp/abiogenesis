import type {
  AdmittedCCallResult,
  CCall,
  JudgmentCandidate,
} from "../abg/c_call.js";
import type { ReplayState } from "../abg/replay.js";
import type { JsonValue } from "../product/index.js";
import { sha256Canonical } from "../product/digests.js";
import { deepFreeze } from "../product/immutable.js";

export interface DeclaredJudgmentRelation<Input, Output> {
  readonly predicateRef: string;
  readonly advanceReasonRef: string;
  readonly rejectionReasonRef: string;
  readonly evaluate: (input: Readonly<Input>, output: Readonly<Output>) => boolean;
}

export function proposeJudgment<Input, Output>(
  cCall: CCall,
  result: AdmittedCCallResult,
  replayState: ReplayState,
  input: Readonly<Input>,
  relation: DeclaredJudgmentRelation<Input, Output>,
  contractRef: string,
): JudgmentCandidate {
  let accepted = false;
  let reasonRef = relation.rejectionReasonRef;
  try {
    accepted = relation.evaluate(input, result.value as unknown as Readonly<Output>);
    reasonRef = accepted ? relation.advanceReasonRef : relation.rejectionReasonRef;
  } catch {
    reasonRef = "diagnostic://abiogenesis/hog/judgment-evaluation-exception@5";
  }
  const body = {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    resultDigest: result.resultDigest,
    judgment: accepted ? "advance" as const : "blocked" as const,
    reasonRef,
    contractRef,
    predicateRef: relation.predicateRef,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "judgment_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef: `judgment-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  }) as JudgmentCandidate;
}

export function proposeFailureJudgment(
  cCall: CCall,
  result: AdmittedCCallResult,
  replayState: ReplayState,
  reasonRef: string,
  contractRef: string,
): JudgmentCandidate {
  const body = {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    resultDigest: result.resultDigest,
    judgment: "blocked" as const,
    reasonRef,
    contractRef,
    predicateRef: cCall.judgmentPredicateRef,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "judgment_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef: `judgment-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  }) as JudgmentCandidate;
}
