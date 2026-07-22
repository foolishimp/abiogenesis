import type { GtlGraph } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasOpenedCCall,
  isAdmittedCCallJudgment,
  type AdmittedCCallJudgment,
  type CCall,
} from "./c_call.js";
import type { RuntimeAdmissionBasis } from "./execution_basis.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";
import { replay, type ReplayState } from "./replay.js";
import {
  hasAdmittedTraversalCursor,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export type TraversalRouteKind =
  | "advance"
  | "retry"
  | "hold"
  | "blocked"
  | "failed"
  | "terminal";

export interface RouteCandidate {
  readonly kind: "traversal_route_candidate";
  readonly schemaVersion: "5.0.0";
  readonly candidateRef: string;
  readonly candidateDigest: Sha256Digest;
  readonly routeKind: TraversalRouteKind;
  readonly declarationRef: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: Sha256Digest | null;
  readonly cCallRef: string | null;
  readonly judgmentRef: string | null;
  readonly consumedAvailabilityRefs: readonly string[];
  readonly contractRef: string;
  readonly replayStateDigest: Sha256Digest;
}

export interface AdmittedRoute {
  readonly kind: "admitted_traversal_route";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly routeRef: string;
  readonly routeDigest: Sha256Digest;
  readonly routeKind: TraversalRouteKind;
  readonly declarationRef: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: Sha256Digest | null;
  readonly cCallRef: string | null;
  readonly judgmentRef: string | null;
  readonly consumedAvailabilityRefs: readonly string[];
  readonly contractRef: string;
  readonly replayStateDigest: Sha256Digest;
  readonly admissionEventRef: string;
}

export interface RouteAdmissionRefusal {
  readonly kind: "traversal_route_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "candidate_mismatch"
    | "cursor_mismatch"
    | "judgment_mismatch"
    | "replay_mismatch"
    | "route_already_admitted"
    | "route_kind_not_supported"
    | "terminal_not_declared";
  readonly message: string;
}

export type RouteAdmissionResult = AdmittedRoute | RouteAdmissionRefusal;

const admittedRoutes = new WeakSet<object>();

export function isAdmittedRoute(value: object): boolean {
  return admittedRoutes.has(value);
}

function refusal(
  code: RouteAdmissionRefusal["code"],
  message: string,
): RouteAdmissionRefusal {
  return {
    kind: "traversal_route_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function candidateBody(
  candidate: RouteCandidate,
): Readonly<Record<string, JsonValue>> {
  return {
    routeKind: candidate.routeKind,
    declarationRef: candidate.declarationRef,
    declarationDigest: candidate.declarationDigest,
    sourceCursorRef: candidate.sourceCursorRef,
    sourceCursorDigest: candidate.sourceCursorDigest,
    targetCursorRef: candidate.targetCursorRef,
    targetCursorDigest: candidate.targetCursorDigest,
    cCallRef: candidate.cCallRef,
    judgmentRef: candidate.judgmentRef,
    consumedAvailabilityRefs: candidate.consumedAvailabilityRefs,
    contractRef: candidate.contractRef,
    replayStateDigest: candidate.replayStateDigest,
  };
}

export function admitRoute(
  store: AbgEventStore,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  cCall: CCall,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  candidate: RouteCandidate,
  basis: RuntimeAdmissionBasis,
): RouteAdmissionResult {
  if (candidate.routeKind !== "terminal") {
    return refusal(
      "route_kind_not_supported",
      "this realization cut admits only the terminal member of the declared route family",
    );
  }
  if (
    !hasOpenedCCall(store, cCall) ||
    !isAdmittedCCallJudgment(judgment) ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.judgment !== "advance" ||
    candidate.cCallRef !== cCall.cCallRef ||
    candidate.judgmentRef !== judgment.judgmentRef
  ) {
    return refusal(
      "judgment_mismatch",
      "terminal route requires this CCall's admitted advance judgment",
    );
  }
  if (
    !hasAdmittedTraversalCursor(store, sourceCursor) ||
    sourceCursor.cursorRef !== candidate.sourceCursorRef ||
    sourceCursor.cursorDigest !== candidate.sourceCursorDigest ||
    sourceCursor.frameId !== cCall.frameId ||
    sourceCursor.currentNodeRef !== cCall.programLocusRef
  ) {
    return refusal(
      "cursor_mismatch",
      "route source is not the admitted current cursor for this CCall",
    );
  }
  const currentReplay = replay(store, { runId: cCall.runId });
  if (
    currentReplay.replayDigest !== replayState.replayDigest ||
    candidate.replayStateDigest !== replayState.replayDigest
  ) {
    return refusal(
      "replay_mismatch",
      "route candidate is not based on current replay truth",
    );
  }
  if (
    candidate.declarationRef !== graph.materializationRef ||
    candidate.declarationDigest !== graph.materializationDigest ||
    candidate.targetCursorRef !== null ||
    candidate.targetCursorDigest !== null ||
    candidate.consumedAvailabilityRefs.length !== 1 ||
    candidate.consumedAvailabilityRefs[0] !== judgment.judgmentRef ||
    !graph.template.terminalNodeRefs.includes(sourceCursor.currentNodeRef)
  ) {
    return refusal(
      "terminal_not_declared",
      "terminal route differs from the exact GTL declaration or carries a target cursor",
    );
  }
  const body = candidateBody(candidate);
  const expectedDigest = sha256Canonical(body);
  if (
    candidate.kind !== "traversal_route_candidate" ||
    candidate.schemaVersion !== "5.0.0" ||
    candidate.contractRef !== cCall.transitionContractRef ||
    candidate.candidateDigest !== expectedDigest ||
    candidate.candidateRef !==
      `route-candidate://abiogenesis/${expectedDigest.slice("sha256:".length)}`
  ) {
    return refusal(
      "candidate_mismatch",
      "route candidate identity or transition contract differs from admitted truth",
    );
  }
  if (
    store.readAll().some(
      (event) =>
        event.kind === "traversal_route_admitted" &&
        event.aggregateId === cCall.frameId,
    )
  ) {
    return refusal(
      "route_already_admitted",
      "one frame cannot admit a second terminal route",
    );
  }

  const routeDigest = sha256Canonical(body);
  const routeRef =
    `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`;
  const event = admitRuntimeEvent(store, {
    kind: "traversal_route_admitted",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: cCall.frameId,
    parentAggregateId: cCall.graphCallId,
    causationEventRefs: [judgment.admissionEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { routeRef, routeDigest, ...body },
  });
  const admitted = deepFreeze({
    kind: "admitted_traversal_route" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    routeRef,
    routeDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as AdmittedRoute;
  admittedRoutes.add(admitted);
  return admitted;
}
