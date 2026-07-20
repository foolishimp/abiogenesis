import type { GtlGraph } from "../gtl/contracts.js";
import type { JsonValue, Sha256Digest } from "../product/index.js";
import { sha256Canonical } from "../product/digests.js";
import { deepFreeze } from "../product/immutable.js";
import {
  hasOpenedCCall,
  isAdmittedCCallJudgment,
  type AdmittedCCallJudgment,
  type CCall,
} from "./c_call.js";
import type { RuntimeAdmissionBasis } from "./execution_basis.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";
import { replay, type ReplayState } from "./replay.js";

export interface TransitionCandidate {
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

export interface AdmittedTransition {
  readonly kind: "admitted_transition";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly transitionRef: string;
  readonly transitionDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly judgmentRef: string;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly transitionKind: "terminal";
  readonly contractRef: string;
  readonly replayStateDigest: Sha256Digest;
  readonly admissionEventRef: string;
}

export interface TransitionAdmissionRefusal {
  readonly kind: "transition_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "candidate_mismatch"
    | "judgment_mismatch"
    | "replay_mismatch"
    | "terminal_not_declared";
  readonly message: string;
}

export type TransitionAdmissionResult =
  | AdmittedTransition
  | TransitionAdmissionRefusal;

const admittedTransitions = new WeakSet<object>();

export function isAdmittedTransition(value: object): boolean {
  return admittedTransitions.has(value);
}

function refusal(
  code: TransitionAdmissionRefusal["code"],
  message: string,
): TransitionAdmissionRefusal {
  return {
    kind: "transition_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

export function admitTransition(
  store: AbgEventStore,
  graph: Readonly<GtlGraph>,
  cCall: CCall,
  judgment: AdmittedCCallJudgment,
  replayState: ReplayState,
  candidate: TransitionCandidate,
  basis: RuntimeAdmissionBasis,
): TransitionAdmissionResult {
  if (
    !hasOpenedCCall(store, cCall) ||
    !isAdmittedCCallJudgment(judgment) ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.judgment !== "advance" ||
    candidate.judgmentRef !== judgment.judgmentRef
  ) {
    return refusal("judgment_mismatch", "terminal transition requires this CCall's admitted advance judgment");
  }
  const currentReplay = replay(store, { runId: cCall.runId });
  if (
    currentReplay.replayDigest !== replayState.replayDigest ||
    candidate.replayStateDigest !== replayState.replayDigest
  ) {
    return refusal("replay_mismatch", "transition proposal is not based on current replay truth");
  }
  if (
    candidate.sourceNodeRef !== cCall.programLocusRef ||
    candidate.targetNodeRef !== cCall.programLocusRef ||
    !graph.template.terminalNodeRefs.includes(candidate.targetNodeRef)
  ) {
    return refusal("terminal_not_declared", "transition target is not the declared GTL terminal locus");
  }
  const body = {
    cCallRef: candidate.cCallRef,
    judgmentRef: candidate.judgmentRef,
    sourceNodeRef: candidate.sourceNodeRef,
    targetNodeRef: candidate.targetNodeRef,
    transitionKind: candidate.transitionKind,
    contractRef: candidate.contractRef,
    replayStateDigest: candidate.replayStateDigest,
  };
  if (
    candidate.kind !== "transition_proposal" ||
    candidate.schemaVersion !== "5.0.0" ||
    candidate.cCallRef !== cCall.cCallRef ||
    candidate.transitionKind !== "terminal" ||
    candidate.contractRef !== cCall.transitionContractRef ||
    candidate.proposalDigest !== sha256Canonical(body as unknown as JsonValue) ||
    candidate.proposalRef !==
      `transition-proposal://abiogenesis/${candidate.proposalDigest.slice("sha256:".length)}` ||
    store.readAll().some(
      (event) => event.kind === "fd_advance_ready" && event.aggregateId === cCall.frameId,
    )
  ) {
    return refusal("candidate_mismatch", "transition proposal identity, contract, or uniqueness check failed");
  }
  const transitionDigest = sha256Canonical(body as unknown as JsonValue);
  const transitionRef = `transition://abiogenesis/${transitionDigest.slice("sha256:".length)}`;
  const event = admitRuntimeEvent(store, {
    kind: "fd_advance_ready",
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
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { transitionRef, transitionDigest, ...body },
  });
  const admitted = deepFreeze({
    kind: "admitted_transition" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    transitionRef,
    transitionDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as AdmittedTransition;
  admittedTransitions.add(admitted);
  return admitted;
}
