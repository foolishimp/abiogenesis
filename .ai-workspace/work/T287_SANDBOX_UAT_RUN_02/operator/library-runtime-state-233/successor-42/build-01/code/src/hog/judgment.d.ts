import type { AdmittedCCallResult, CCall, JudgmentCandidate } from "../abg/c_call.js";
import type { ReplayState } from "../abg/replay.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
export interface DeclaredJudgmentRelation<Input, Output> {
    readonly predicateRef: string;
    readonly advanceReasonRef: string;
    readonly rejectionReasonRef: string;
    readonly evaluate: (input: Readonly<Input>, output: Readonly<Output>, currentOwnerPrefix?: DurablePrefixCoordinate) => boolean;
}
export type JudgmentDecision<Input, Output> = Readonly<{
    decisionClass: "evaluate";
    input: Readonly<Input>;
    relation: DeclaredJudgmentRelation<Input, Output>;
}> | Readonly<{
    decisionClass: "refuse";
    predicateRef: string;
    reasonRef: string;
}>;
export declare function proposeJudgmentCandidate<Input, Output>(input: Readonly<{
    cCall: CCall;
    result: AdmittedCCallResult;
    replayState: ReplayState;
    contractRef: string;
    decision: JudgmentDecision<Input, Output>;
    currentOwnerPrefix?: DurablePrefixCoordinate;
}>): JudgmentCandidate;
