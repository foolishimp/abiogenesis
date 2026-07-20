import type { AdmittedCCallJudgment, CCall } from "../abg/c_call.js";
import type { ReplayState } from "../abg/replay.js";
import type { GtlGraph } from "../gtl/contracts.js";
import type { JsonValue, Sha256Digest } from "../product/index.js";
import { sha256Canonical } from "../product/digests.js";
import { deepFreeze } from "../product/immutable.js";
import type { TraversalStopRef } from "./traversal.js";

export interface TransitionProposal {
  readonly kind: "transition_proposal";
  readonly schemaVersion: "5.0.0";
  readonly proposalRef: string;
  readonly proposalDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly judgmentRef: string;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly transitionKind: "terminal";
  readonly contractRef: string;
  readonly replayStateDigest: Sha256Digest;
}

export interface TransitionProposalRefusal {
  readonly kind: "transition_proposal_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "judgment_not_advance" | "terminal_not_declared";
  readonly message: string;
}

export function proposeTerminalTransition(
  graph: Readonly<GtlGraph>,
  stop: TraversalStopRef,
  cCall: CCall,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  contractRef: string,
): TransitionProposal | TransitionProposalRefusal {
  if (judgment.judgment !== "advance") {
    return {
      kind: "transition_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "judgment_not_advance",
      message: "terminal transition requires an admitted advance judgment",
    };
  }
  if (
    stop.nodeRef !== cCall.programLocusRef ||
    !graph.template.terminalNodeRefs.includes(stop.nodeRef)
  ) {
    return {
      kind: "transition_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "terminal_not_declared",
      message: "current GTL locus is not a declared terminal node",
    };
  }
  const body = {
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    sourceNodeRef: stop.nodeRef,
    targetNodeRef: stop.nodeRef,
    transitionKind: "terminal" as const,
    contractRef,
    replayStateDigest: replayState.replayDigest,
  };
  const proposalDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "transition_proposal" as const,
    schemaVersion: "5.0.0" as const,
    proposalRef: `transition-proposal://abiogenesis/${proposalDigest.slice("sha256:".length)}`,
    proposalDigest,
    ...body,
  }) as TransitionProposal;
}
