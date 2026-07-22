import type { AdmittedCCallJudgment, CCall } from "../abg/c_call.js";
import type { ReplayState } from "../abg/replay.js";
import type { RouteCandidate } from "../abg/traversal_route.js";
import type { GtlGraph } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { TraversalStopRef } from "./traversal.js";

export interface RouteProposalRefusal {
  readonly kind: "traversal_route_proposal_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "judgment_not_advance" | "terminal_not_declared";
  readonly message: string;
}

export function proposeTerminalRoute(
  graph: Readonly<GtlGraph>,
  stop: TraversalStopRef,
  cCall: CCall,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  contractRef: string,
): RouteCandidate | RouteProposalRefusal {
  if (judgment.judgment !== "advance") {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "judgment_not_advance",
      message: "terminal route requires an admitted advance judgment",
    };
  }
  if (
    stop.nodeRef !== cCall.programLocusRef ||
    !graph.template.terminalNodeRefs.includes(stop.nodeRef)
  ) {
    return {
      kind: "traversal_route_proposal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "terminal_not_declared",
      message: "current GTL locus is not a declared terminal node",
    };
  }
  const body = {
    routeKind: "terminal" as const,
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: stop.cursor.cursorRef,
    sourceCursorDigest: stop.cursor.cursorDigest,
    targetCursorRef: null,
    targetCursorDigest: null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: [judgment.judgmentRef],
    contractRef,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "traversal_route_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef:
      `route-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  }) as RouteCandidate;
}
