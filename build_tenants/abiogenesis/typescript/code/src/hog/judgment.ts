import type {
  AdmittedCCallResult,
  CCall,
  JudgmentCandidate,
} from "../abg/c_call.js";
import type { ReplayState } from "../abg/replay.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

export interface DeclaredJudgmentRelation<Input, Output> {
  readonly predicateRef: string;
  readonly advanceReasonRef: string;
  readonly rejectionReasonRef: string;
  readonly evaluate: (input: Readonly<Input>, output: Readonly<Output>) => boolean;
}

export type JudgmentDecision<Input, Output> =
  | Readonly<{
      decisionClass: "evaluate";
      input: Readonly<Input>;
      relation: DeclaredJudgmentRelation<Input, Output>;
    }>
  | Readonly<{
      decisionClass: "refuse";
      predicateRef: string;
      reasonRef: string;
    }>;

export function proposeJudgmentCandidate<Input, Output>(input: Readonly<{
  cCall: CCall;
  result: AdmittedCCallResult;
  replayState: ReplayState;
  contractRef: string;
  decision: JudgmentDecision<Input, Output>;
}>): JudgmentCandidate {
  const { cCall, result, replayState, contractRef, decision } = input;
  let accepted = false;
  let reasonRef = decision.decisionClass === "evaluate"
    ? decision.relation.rejectionReasonRef
    : decision.reasonRef;
  const predicateRef = decision.decisionClass === "evaluate"
    ? decision.relation.predicateRef
    : decision.predicateRef;
  if (decision.decisionClass === "evaluate") {
    reasonRef = decision.relation.rejectionReasonRef;
    try {
      accepted = decision.relation.evaluate(
        decision.input,
        result.value as unknown as Readonly<Output>,
      );
      reasonRef = accepted
        ? decision.relation.advanceReasonRef
        : decision.relation.rejectionReasonRef;
    } catch {
      reasonRef =
        "diagnostic://abiogenesis/hog/judgment-evaluation-exception@5";
    }
  }
  const body = {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    resultDigest: result.resultDigest,
    judgment: accepted ? "advance" as const : "blocked" as const,
    reasonRef,
    contractRef,
    predicateRef,
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
