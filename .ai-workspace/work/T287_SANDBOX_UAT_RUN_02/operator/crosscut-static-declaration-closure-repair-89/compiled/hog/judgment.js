import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
export function proposeJudgmentCandidate(input) {
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
            accepted = decision.relation.evaluate(decision.input, result.value, input.currentOwnerPrefix);
            reasonRef = accepted
                ? decision.relation.advanceReasonRef
                : decision.relation.rejectionReasonRef;
        }
        catch {
            reasonRef =
                "diagnostic://abiogenesis/hog/judgment-evaluation-exception@5";
        }
    }
    const body = {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        resultDigest: result.resultDigest,
        judgment: accepted ? "advance" : "blocked",
        reasonRef,
        contractRef,
        predicateRef,
        replayStateDigest: replayState.replayDigest,
    };
    const candidateDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "judgment_candidate",
        schemaVersion: "5.0.0",
        candidateRef: `judgment-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
        candidateDigest,
        ...body,
    });
}
