import type * as Effect from "effect/Effect";

import type {
  CBatchNode,
  CComposeNode,
  CEdgeNode,
  CIdentityNode,
  COfNode,
  CRetryNode,
  CWorkflowNode,
} from "../gtl/c_algebra.js";
import type { GtlGraph } from "../gtl/contracts.js";
import type {
  CContinuationTarget,
  CTraversalSource,
  CTraversalTarget,
} from "../gtl/source_path.js";
import type { Sha256Digest } from "../shared/digests.js";

export interface HogValue<Value> {
  readonly kind: "hog_value";
  readonly valueRef: string;
  readonly valueDigest: Sha256Digest;
  readonly value: Readonly<Value>;
}

export interface HogFrameIdentity {
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly executionBasisRef: string;
  readonly executionBasisDigest: Sha256Digest;
  readonly traversalScopeRef: string;
  readonly traversalScopeDigest: Sha256Digest;
  readonly runId: string;
  readonly runDigest: Sha256Digest;
  readonly graphCallId: string;
  readonly graphCallDigest: Sha256Digest;
  readonly frameId: string;
  readonly frameDigest: Sha256Digest;
}

export interface HogFrame<Value> {
  readonly graph: Readonly<GtlGraph>;
  readonly identity: HogFrameIdentity;
  readonly cursor: CTraversalSource;
  readonly value: HogValue<Value>;
}

export type HogStructuralTerm =
  | CIdentityNode
  | CComposeNode
  | CEdgeNode
  | CBatchNode
  | CRetryNode;

export interface HogStructuralOccurrence<Value> {
  readonly kind: "hog_structural_occurrence";
  readonly frame: HogFrame<Value>;
  readonly term: Readonly<HogStructuralTerm>;
  readonly target: CTraversalTarget | CContinuationTarget;
}

export interface HogLeafOccurrence<Value> {
  readonly kind: "hog_leaf_occurrence";
  readonly frame: HogFrame<Value>;
  readonly term: Readonly<COfNode>;
}

export interface HogWorkflowOccurrence<Value> {
  readonly kind: "hog_workflow_occurrence";
  readonly frame: HogFrame<Value>;
  readonly term: Readonly<CWorkflowNode>;
}

export interface HogOpenedOccurrence<Prefix> {
  readonly kind: "hog_opened_occurrence";
  readonly occurrenceRef: string;
  readonly occurrenceDigest: Sha256Digest;
  readonly successorPrefix: Readonly<Prefix>;
}

export interface HogDeterministicCandidate<Candidate> {
  readonly kind: "hog_deterministic_candidate";
  readonly candidate: Readonly<Candidate>;
}

export interface HogProbabilisticCandidate<Candidate> {
  readonly kind: "hog_probabilistic_candidate";
  readonly candidate: Readonly<Candidate>;
}

export interface HogInteractionCandidate<Candidate> {
  readonly kind: "hog_interaction_candidate";
  readonly candidate: Readonly<Candidate>;
}

export interface HogAdmittedResult<Prefix, Value> {
  readonly kind: "hog_admitted_result";
  readonly resultRef: string;
  readonly resultDigest: Sha256Digest;
  readonly value: HogValue<Value>;
  readonly successorPrefix: Readonly<Prefix>;
}

export interface HogJudgmentDecision {
  readonly kind: "hog_judgment_decision";
  readonly decision: "advance" | "blocked";
  readonly predicateRef: string;
  readonly reasonRef: string;
}

export interface HogAdmittedJudgment<Prefix> {
  readonly kind: "hog_admitted_judgment";
  readonly judgmentRef: string;
  readonly judgmentDigest: Sha256Digest;
  readonly decision: HogJudgmentDecision["decision"];
  readonly successorPrefix: Readonly<Prefix>;
}

export interface HogChildRequest<Value> {
  readonly kind: "hog_child_request";
  readonly relation: "workflow" | "recursion";
  readonly declarationRef: string;
  readonly graphFunctionRef: string;
  readonly input: HogValue<Value>;
}

interface HogAdmittedDispositionBase<Prefix> {
  readonly kind: "hog_admitted_disposition";
  readonly dispositionRef: string;
  readonly dispositionDigest: Sha256Digest;
  readonly successorPrefix: Readonly<Prefix>;
}

export type HogAdmittedDisposition<Prefix, Value> =
  | (HogAdmittedDispositionBase<Prefix> & Readonly<{
      disposition: "advance";
      target: CTraversalSource;
      value: HogValue<Value>;
    }>)
  | (HogAdmittedDispositionBase<Prefix> & Readonly<{
      disposition: "retry";
      target: CTraversalSource;
      value: HogValue<Value>;
    }>)
  | (HogAdmittedDispositionBase<Prefix> & Readonly<{
      disposition: "enter_child";
      child: HogChildRequest<Value>;
    }>)
  | (HogAdmittedDispositionBase<Prefix> & Readonly<{
      disposition: "hold";
      value: HogValue<Value>;
    }>)
  | (HogAdmittedDispositionBase<Prefix> & Readonly<{
      disposition: "complete";
      value: HogValue<Value>;
    }>)
  | (HogAdmittedDispositionBase<Prefix> & Readonly<{
      disposition: "fail";
      diagnosticRef: string;
      value: HogValue<Value>;
    }>)
  | (HogAdmittedDispositionBase<Prefix> & Readonly<{
      disposition: "refuse";
      diagnosticRef: string;
      value: HogValue<Value>;
    }>);

export interface HogPreparedChild<Prefix, Value> {
  readonly kind: "hog_prepared_child";
  readonly preparationRef: string;
  readonly preparationDigest: Sha256Digest;
  readonly child: HogFrame<Value>;
  readonly successorPrefix: Readonly<Prefix>;
}

export type HogTransitionProposal =
  | Readonly<{
      kind: "hog_transition_proposal";
      disposition: "advance";
      relation: CContinuationTarget["relation"];
      target: CContinuationTarget & Readonly<{ disposition: "advance" }>;
    }>
  | Readonly<{
      kind: "hog_transition_proposal";
      disposition: "retry";
      relation: "retry_same_edge";
      target: CTraversalTarget;
    }>
  | Readonly<{
      kind: "hog_transition_proposal";
      disposition: "hold";
      relation: "interaction_hold" | "judgment_blocked";
      declarationRef: string;
      source: CTraversalSource;
    }>
  | Readonly<{
      kind: "hog_transition_proposal";
      disposition: "terminal";
      relation: "root_complete";
      source: CTraversalSource;
    }>;

export interface StructuralAdmissionPort<Prefix, Value, Error> {
  readonly admitStructural: (
    occurrence: HogStructuralOccurrence<Value>,
    predecessorPrefix: Readonly<Prefix>,
  ) => Effect.Effect<HogAdmittedDisposition<Prefix, Value>, Error>;
}

export interface ExecutableOccurrenceAdmissionPort<Prefix, Value, Error> {
  readonly openExecutable: (
    occurrence: HogLeafOccurrence<Value>,
    predecessorPrefix: Readonly<Prefix>,
  ) => Effect.Effect<HogOpenedOccurrence<Prefix>, Error>;
}

export interface InteractionOccurrenceAdmissionPort<Prefix, Value, Error> {
  readonly openInteraction: (
    occurrence: HogLeafOccurrence<Value>,
    predecessorPrefix: Readonly<Prefix>,
  ) => Effect.Effect<HogOpenedOccurrence<Prefix>, Error>;
}

export interface DeterministicInvocationPort<Prefix, Value, Candidate, Error> {
  readonly invokeDeterministic: (
    opened: HogOpenedOccurrence<Prefix>,
    value: HogValue<Value>,
  ) => Effect.Effect<HogDeterministicCandidate<Candidate>, Error>;
}

export interface ProbabilisticInvocationPort<Prefix, Value, Candidate, Error> {
  readonly invokeProbabilistic: (
    opened: HogOpenedOccurrence<Prefix>,
    value: HogValue<Value>,
  ) => Effect.Effect<HogProbabilisticCandidate<Candidate>, Error>;
}

export interface InteractionInvocationPort<Prefix, Value, Candidate, Error> {
  readonly invokeInteraction: (
    opened: HogOpenedOccurrence<Prefix>,
    value: HogValue<Value>,
  ) => Effect.Effect<HogInteractionCandidate<Candidate>, Error>;
}

export interface DeterministicResultAdmissionPort<
  Prefix,
  Value,
  Candidate,
  Error,
> {
  readonly admitDeterministicResult: (
    occurrence: HogLeafOccurrence<Value>,
    opened: HogOpenedOccurrence<Prefix>,
    candidate: HogDeterministicCandidate<Candidate>,
  ) => Effect.Effect<HogAdmittedResult<Prefix, Value>, Error>;
}

export interface ProbabilisticResultAdmissionPort<
  Prefix,
  Value,
  Candidate,
  Error,
> {
  readonly admitProbabilisticResult: (
    occurrence: HogLeafOccurrence<Value>,
    opened: HogOpenedOccurrence<Prefix>,
    candidate: HogProbabilisticCandidate<Candidate>,
  ) => Effect.Effect<HogAdmittedResult<Prefix, Value>, Error>;
}

export interface InteractionResultAdmissionPort<
  Prefix,
  Value,
  Candidate,
  Error,
> {
  readonly admitInteractionResult: (
    occurrence: HogLeafOccurrence<Value>,
    opened: HogOpenedOccurrence<Prefix>,
    candidate: HogInteractionCandidate<Candidate>,
  ) => Effect.Effect<HogAdmittedResult<Prefix, Value>, Error>;
}

export interface JudgmentEvaluationPort<Prefix, Value, Error> {
  readonly evaluateJudgment: (
    occurrence: HogLeafOccurrence<Value>,
    opened: HogOpenedOccurrence<Prefix>,
    result: HogAdmittedResult<Prefix, Value>,
  ) => Effect.Effect<HogJudgmentDecision, Error>;
}

export interface JudgmentAdmissionPort<Prefix, Value, Error> {
  readonly admitJudgment: (
    occurrence: HogLeafOccurrence<Value>,
    opened: HogOpenedOccurrence<Prefix>,
    result: HogAdmittedResult<Prefix, Value>,
    decision: HogJudgmentDecision,
  ) => Effect.Effect<HogAdmittedJudgment<Prefix>, Error>;
}

export interface TransitionAdmissionPort<Prefix, Value, Error> {
  readonly admitTransition: (
    occurrence: HogLeafOccurrence<Value>,
    opened: HogOpenedOccurrence<Prefix>,
    result: HogAdmittedResult<Prefix, Value>,
    judgment: HogAdmittedJudgment<Prefix>,
    proposal: Exclude<
      HogTransitionProposal,
      Readonly<{ disposition: "terminal" }>
    >,
  ) => Effect.Effect<HogAdmittedDisposition<Prefix, Value>, Error>;
}

export interface TerminalAdmissionPort<Prefix, Value, Error> {
  /** The owner admits the terminal route and closure in one prefix transaction. */
  readonly admitTerminal: (
    occurrence: HogLeafOccurrence<Value>,
    opened: HogOpenedOccurrence<Prefix>,
    result: HogAdmittedResult<Prefix, Value>,
    judgment: HogAdmittedJudgment<Prefix>,
    proposal: Extract<
      HogTransitionProposal,
      Readonly<{ disposition: "terminal" }>
    >,
  ) => Effect.Effect<
    Extract<
      HogAdmittedDisposition<Prefix, Value>,
      Readonly<{ disposition: "complete" | "fail" | "refuse" }>
    >,
    Error
  >;
}

export interface ChildFrameAdmissionPort<Prefix, Value, Error> {
  readonly prepareChild: (
    occurrence: HogWorkflowOccurrence<Value> | HogChildRequest<Value>,
    parent: HogFrame<Value>,
    predecessorPrefix: Readonly<Prefix>,
  ) => Effect.Effect<
    HogPreparedChild<Prefix, Value> | HogAdmittedDisposition<Prefix, Value>,
    Error
  >;
}

export interface ChildFoldbackAdmissionPort<Prefix, Value, Error> {
  readonly admitChildFoldback: (
    parent: HogFrame<Value>,
    child: HogPreparedChild<Prefix, Value>,
    childDisposition: Extract<
      HogAdmittedDisposition<Prefix, Value>,
      Readonly<{ disposition: "complete" | "fail" | "refuse" }>
    >,
  ) => Effect.Effect<HogAdmittedDisposition<Prefix, Value>, Error>;
}
