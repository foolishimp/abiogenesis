import * as Effect from "effect/Effect";

import { isInteractionCLeaf } from "../gtl/c_algebra.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import {
  deriveCContinuationTarget,
  deriveCRetryTarget,
  deriveCStructuralTarget,
  resolveCProgramTermAtSourcePath,
  resolveEnclosingCRetryContexts,
  type CContinuationTarget,
  type CTraversalSource,
  type CTraversalTarget,
} from "../gtl/source_path.js";
import type { Sha256Digest } from "../shared/digests.js";
import type {
  ChildFoldbackAdmissionPort,
  ChildFrameAdmissionPort,
  DeterministicInvocationPort,
  DeterministicResultAdmissionPort,
  ExecutableOccurrenceAdmissionPort,
  HogAdmittedDisposition,
  HogAdmittedJudgment,
  HogAdmittedResult,
  HogChildRequest,
  HogFrame,
  HogLeafOccurrence,
  HogOpenedOccurrence,
  HogPreparedChild,
  HogStructuralOccurrence,
  HogTransitionProposal,
  HogValue,
  HogWorkflowOccurrence,
  InteractionInvocationPort,
  InteractionOccurrenceAdmissionPort,
  InteractionResultAdmissionPort,
  JudgmentAdmissionPort,
  JudgmentEvaluationPort,
  ProbabilisticInvocationPort,
  ProbabilisticResultAdmissionPort,
  StructuralAdmissionPort,
  TerminalAdmissionPort,
  TransitionAdmissionPort,
} from "./ports.js";

export interface HogReturnFrame<Prefix, Value> {
  readonly kind: "hog_return_frame";
  readonly parent: HogFrame<Value>;
  readonly child: HogPreparedChild<Prefix, Value>;
}

export interface HogEvaluationInput<Prefix, Value> {
  readonly frame: HogFrame<Value>;
  readonly predecessorPrefix: Readonly<Prefix>;
  readonly returns?: readonly HogReturnFrame<Prefix, Value>[];
}

interface HogTraversalReceiptBase<Prefix, Value> {
  readonly kind: "hog_traversal_receipt";
  readonly frame: HogFrame<Value>;
  readonly predecessorPrefix: Readonly<Prefix>;
  readonly returns: readonly HogReturnFrame<Prefix, Value>[];
}

export type HogTraversalReceipt<Prefix, Value> =
  | (HogTraversalReceiptBase<Prefix, Value> & Readonly<{
      disposition: "complete" | "hold";
      dispositionRef: string;
      dispositionDigest: Sha256Digest;
      value: HogValue<Value>;
    }>)
  | (HogTraversalReceiptBase<Prefix, Value> & Readonly<{
      disposition: "fail" | "refuse";
      dispositionRef: string;
      dispositionDigest: Sha256Digest;
      diagnosticRef: string;
      value: HogValue<Value>;
    }>)
  | (HogTraversalReceiptBase<Prefix, Value> & Readonly<{
      disposition: "out_of_frame";
      diagnosticRef: string;
      message: string;
      value: HogValue<Value>;
    }>);

interface EvaluateState<Prefix, Value> {
  readonly stateKind: "evaluate";
  readonly frame: HogFrame<Value>;
  readonly predecessorPrefix: Readonly<Prefix>;
  readonly returns: readonly HogReturnFrame<Prefix, Value>[];
}

interface PrepareChildState<Prefix, Value> {
  readonly stateKind: "prepare_child";
  readonly parent: HogFrame<Value>;
  readonly request: HogWorkflowOccurrence<Value> | HogChildRequest<Value>;
  readonly predecessorPrefix: Readonly<Prefix>;
  readonly returns: readonly HogReturnFrame<Prefix, Value>[];
}

type ChildTerminalDisposition<Prefix, Value> = Extract<
  HogAdmittedDisposition<Prefix, Value>,
  Readonly<{ disposition: "complete" | "fail" | "refuse" }>
>;

interface FoldbackState<Prefix, Value> {
  readonly stateKind: "foldback";
  readonly parentReturn: HogReturnFrame<Prefix, Value>;
  readonly childDisposition: ChildTerminalDisposition<Prefix, Value>;
  readonly returns: readonly HogReturnFrame<Prefix, Value>[];
}

interface DoneState<Prefix, Value> {
  readonly stateKind: "done";
  readonly receipt: HogTraversalReceipt<Prefix, Value>;
}

type OpenState<Prefix, Value> =
  | EvaluateState<Prefix, Value>
  | PrepareChildState<Prefix, Value>
  | FoldbackState<Prefix, Value>;

type EvaluationState<Prefix, Value> =
  | OpenState<Prefix, Value>
  | DoneState<Prefix, Value>;

function freezeReturns<Prefix, Value>(
  returns: readonly HogReturnFrame<Prefix, Value>[],
): readonly HogReturnFrame<Prefix, Value>[] {
  return Object.freeze([...returns]);
}

function isDigest(value: string): value is Sha256Digest {
  return /^sha256:[a-f0-9]{64}$/u.test(value);
}

function samePath(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length &&
    left.every((segment, index) => segment === right[index]);
}

function sameRetryPath(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length &&
    left.every((attempt, index) => attempt === right[index]);
}

function sameSource(
  left: CTraversalSource,
  right: CTraversalSource,
): boolean {
  return left.nodeRef === right.nodeRef &&
    samePath(left.termPath, right.termPath) &&
    left.taskOrdinal === right.taskOrdinal &&
    left.attempt === right.attempt &&
    sameRetryPath(left.retryPath, right.retryPath) &&
    left.inputRef === right.inputRef &&
    left.inputDigest === right.inputDigest;
}

function targetSource(target: CTraversalTarget): CTraversalSource {
  return Object.freeze({
    nodeRef: target.nodeRef,
    termPath: Object.freeze([...target.termPath]),
    taskOrdinal: target.taskOrdinal,
    attempt: target.attempt,
    retryPath: Object.freeze([...target.retryPath]),
    inputRef: target.inputRef,
    inputDigest: target.inputDigest,
  });
}

function continuationSource(
  target: CContinuationTarget & Readonly<{ disposition: "advance" }>,
): CTraversalSource | null {
  return target.nodeRef === null || target.termPath === null ||
      target.attempt === null || target.inputRef === null ||
      target.inputDigest === null
    ? null
    : Object.freeze({
        nodeRef: target.nodeRef,
        termPath: Object.freeze([...target.termPath]),
        taskOrdinal: target.taskOrdinal,
        attempt: target.attempt,
        retryPath: Object.freeze([...target.retryPath]),
        inputRef: target.inputRef,
        inputDigest: target.inputDigest,
      });
}

function exactFrame<Value>(frame: HogFrame<Value>): boolean {
  const identity = frame.identity;
  return isMaterializedGtlGraph(frame.graph) &&
    frame.graph.materializationRef.length > 0 &&
    isDigest(frame.graph.materializationDigest) &&
    identity.programRef.length > 0 && isDigest(identity.programDigest) &&
    identity.executionBasisRef.length > 0 &&
    isDigest(identity.executionBasisDigest) &&
    identity.traversalScopeRef.length > 0 &&
    isDigest(identity.traversalScopeDigest) &&
    identity.runId.length > 0 && isDigest(identity.runDigest) &&
    identity.graphCallId.length > 0 && isDigest(identity.graphCallDigest) &&
    identity.frameId.length > 0 && isDigest(identity.frameDigest) &&
    frame.cursor.nodeRef.length > 0 &&
    frame.cursor.termPath.length >= 3 &&
    frame.cursor.termPath[0] === "node" &&
    frame.cursor.termPath[1] === frame.cursor.nodeRef &&
    frame.cursor.termPath[2] === "c" &&
    frame.cursor.inputRef === frame.value.valueRef &&
    frame.cursor.inputDigest === frame.value.valueDigest &&
    isDigest(frame.cursor.inputDigest) &&
    frame.cursor.attempt >= 1 && Number.isSafeInteger(frame.cursor.attempt) &&
    frame.cursor.retryPath.every(
      (attempt) => Number.isSafeInteger(attempt) && attempt >= 1,
    );
}

function outOfFrame<Prefix, Value>(
  frame: HogFrame<Value>,
  predecessorPrefix: Readonly<Prefix>,
  returns: readonly HogReturnFrame<Prefix, Value>[],
  diagnosticRef: string,
  message: string,
): DoneState<Prefix, Value> {
  return Object.freeze({
    stateKind: "done" as const,
    receipt: Object.freeze({
      kind: "hog_traversal_receipt" as const,
      disposition: "out_of_frame" as const,
      frame,
      predecessorPrefix,
      returns: freezeReturns(returns),
      diagnosticRef,
      message,
      value: frame.value,
    }),
  });
}

function doneFromDisposition<Prefix, Value>(
  frame: HogFrame<Value>,
  disposition: Exclude<
    HogAdmittedDisposition<Prefix, Value>,
    Readonly<{
      disposition: "advance" | "retry" | "enter_child";
    }>
  >,
  returns: readonly HogReturnFrame<Prefix, Value>[],
): DoneState<Prefix, Value> {
  return Object.freeze({
    stateKind: "done" as const,
    receipt: disposition.disposition === "fail" ||
        disposition.disposition === "refuse"
      ? Object.freeze({
          kind: "hog_traversal_receipt" as const,
          disposition: disposition.disposition,
          frame,
          predecessorPrefix: disposition.successorPrefix,
          returns: freezeReturns(returns),
          dispositionRef: disposition.dispositionRef,
          dispositionDigest: disposition.dispositionDigest,
          diagnosticRef: disposition.diagnosticRef,
          value: disposition.value,
        })
      : Object.freeze({
          kind: "hog_traversal_receipt" as const,
          disposition: disposition.disposition,
          frame,
          predecessorPrefix: disposition.successorPrefix,
          returns: freezeReturns(returns),
          dispositionRef: disposition.dispositionRef,
          dispositionDigest: disposition.dispositionDigest,
          value: disposition.value,
        }),
  });
}

function terminalState<Prefix, Value>(
  frame: HogFrame<Value>,
  disposition: ChildTerminalDisposition<Prefix, Value>,
  returns: readonly HogReturnFrame<Prefix, Value>[],
): EvaluationState<Prefix, Value> {
  const parentReturn = returns.at(-1);
  return parentReturn === undefined
    ? doneFromDisposition(frame, disposition, returns)
    : Object.freeze({
        stateKind: "foldback" as const,
        parentReturn,
        childDisposition: disposition,
        returns: freezeReturns(returns.slice(0, -1)),
      });
}

function validateDispositionIdentity<Prefix, Value>(
  disposition: HogAdmittedDisposition<Prefix, Value>,
): boolean {
  return disposition.dispositionRef.length > 0 &&
    isDigest(disposition.dispositionDigest) &&
    (disposition.disposition === "enter_child" ||
      (disposition.value.valueRef.length > 0 &&
        isDigest(disposition.value.valueDigest)));
}

function applyDisposition<Prefix, Value>(
  frame: HogFrame<Value>,
  disposition: HogAdmittedDisposition<Prefix, Value>,
  returns: readonly HogReturnFrame<Prefix, Value>[],
  expected: HogTransitionProposal | CTraversalTarget | CContinuationTarget,
): EvaluationState<Prefix, Value> {
  if (!validateDispositionIdentity(disposition)) {
    return outOfFrame(
      frame,
      disposition.successorPrefix,
      returns,
      "diagnostic://abiogenesis/hog/admission-identity-mismatch@5",
      "owner disposition lacks one exact admitted ref and digest",
    );
  }
  if (disposition.disposition === "advance" ||
      disposition.disposition === "retry") {
    const expectedSource = "kind" in expected &&
        expected.kind === "hog_transition_proposal"
      ? expected.disposition === "advance"
        ? continuationSource(expected.target)
        : expected.disposition === "retry"
          ? targetSource(expected.target)
          : null
      : expected.kind === "c_traversal_target"
        ? targetSource(expected)
        : expected.disposition === "advance"
          ? continuationSource(
              expected as CContinuationTarget & Readonly<{
                disposition: "advance";
              }>,
            )
          : null;
    if (
      expectedSource === null ||
      !sameSource(disposition.target, expectedSource) ||
      disposition.target.inputRef !== disposition.value.valueRef ||
      disposition.target.inputDigest !== disposition.value.valueDigest
    ) {
      return outOfFrame(
        frame,
        disposition.successorPrefix,
        returns,
        "diagnostic://abiogenesis/hog/admitted-target-mismatch@5",
        "owner disposition differs from the exact GTL-derived target",
      );
    }
    return Object.freeze({
      stateKind: "evaluate" as const,
      frame: Object.freeze({
        ...frame,
        cursor: disposition.target,
        value: disposition.value,
      }),
      predecessorPrefix: disposition.successorPrefix,
      returns: freezeReturns(returns),
    });
  }
  if (disposition.disposition === "enter_child") {
    const declared = frame.graph.template.applications.filter(
      (application) => application.relationKind === "recurse" &&
        application.applicationRef === disposition.child.declarationRef &&
        application.graphFunctionRef === disposition.child.graphFunctionRef,
    );
    if (
      disposition.child.relation !== "recursion" ||
      declared.length !== 1
    ) {
      return outOfFrame(
        frame,
        disposition.successorPrefix,
        returns,
        "diagnostic://abiogenesis/hog/child-declaration-mismatch@5",
        "admitted child disposition lacks one exact declared recursion",
      );
    }
    return Object.freeze({
      stateKind: "prepare_child" as const,
      parent: frame,
      request: disposition.child,
      predecessorPrefix: disposition.successorPrefix,
      returns: freezeReturns(returns),
    });
  }
  if (disposition.disposition === "hold") {
    return "kind" in expected &&
        expected.kind === "hog_transition_proposal" &&
        expected.disposition === "hold"
      ? doneFromDisposition(frame, disposition, returns)
      : outOfFrame(
          frame,
          disposition.successorPrefix,
          returns,
          "diagnostic://abiogenesis/hog/hold-topology-mismatch@5",
          "owner hold differs from the declared interaction boundary",
        );
  }
  if (disposition.disposition === "complete") {
    const terminal = "kind" in expected &&
      (expected.kind === "c_continuation_target"
        ? expected.disposition === "terminal" && expected.relation === "root_complete"
        : expected.kind === "hog_transition_proposal" &&
          expected.disposition === "terminal");
    return terminal
      ? terminalState(frame, disposition, returns)
      : outOfFrame(
          frame,
          disposition.successorPrefix,
          returns,
          "diagnostic://abiogenesis/hog/terminal-topology-mismatch@5",
          "owner completion differs from GTL root completion",
        );
  }
  return terminalState(frame, disposition, returns);
}

function transitionProposal<Prefix, Value>(
  occurrence: HogLeafOccurrence<Value>,
  result: HogAdmittedResult<Prefix, Value>,
  judgment: HogAdmittedJudgment<Prefix>,
): HogTransitionProposal | Readonly<{ diagnosticRef: string; message: string }> {
  const continuation = deriveCContinuationTarget(
    occurrence.frame.graph,
    occurrence.frame.cursor,
    {
      inputRef: result.value.valueRef,
      inputDigest: result.value.valueDigest,
    },
  );
  if (continuation.kind === "c_source_path_refusal") {
    return Object.freeze({
      diagnosticRef: "diagnostic://abiogenesis/hog/continuation-refused@5",
      message: continuation.message,
    });
  }
  if (judgment.decision === "advance") {
    if (continuation.disposition === "terminal" &&
        continuation.relation === "root_complete") {
      return Object.freeze({
        kind: "hog_transition_proposal" as const,
        disposition: "terminal" as const,
        relation: "root_complete" as const,
        source: occurrence.frame.cursor,
      });
    }
    return continuation.disposition === "advance" &&
          continuation.nodeRef !== null && continuation.termPath !== null &&
          continuation.attempt !== null && continuation.inputRef !== null &&
          continuation.inputDigest !== null
        ? Object.freeze({
            kind: "hog_transition_proposal" as const,
            disposition: "advance" as const,
            relation: continuation.relation,
            target: Object.freeze({
              ...continuation,
              disposition: "advance" as const,
            }),
          })
        : Object.freeze({
            diagnosticRef: "diagnostic://abiogenesis/hog/advance-target-absent@5",
            message: "admitted advance lacks one GTL continuation target",
          });
  }
  if (occurrence.term.fibre === "F_H" && isInteractionCLeaf(occurrence.term)) {
    return Object.freeze({
      kind: "hog_transition_proposal" as const,
      disposition: "hold" as const,
      relation: "interaction_hold" as const,
      declarationRef: occurrence.term.requirement.continuationContractRef,
      source: occurrence.frame.cursor,
    });
  }
  const retryContexts = resolveEnclosingCRetryContexts(
    occurrence.frame.graph.template,
    occurrence.frame.cursor.nodeRef,
    occurrence.frame.cursor.termPath,
  );
  if ("kind" in retryContexts) {
    return Object.freeze({
      diagnosticRef: "diagnostic://abiogenesis/hog/retry-context-refused@5",
      message: retryContexts.message,
    });
  }
  const retryContext = retryContexts.at(-1);
  if (
    retryContext !== undefined &&
    retryContext.retryDepth === occurrence.frame.cursor.retryPath.length &&
    occurrence.frame.cursor.attempt < retryContext.budget
  ) {
      const retry = deriveCRetryTarget(
        occurrence.frame.graph,
        occurrence.frame.cursor,
        occurrence.frame.cursor,
      );
      return retry.kind === "c_source_path_refusal"
        ? Object.freeze({
            diagnosticRef: "diagnostic://abiogenesis/hog/retry-target-refused@5",
            message: retry.message,
          })
        : Object.freeze({
            kind: "hog_transition_proposal" as const,
            disposition: "retry" as const,
            relation: "retry_same_edge" as const,
            target: retry,
          });
  }
  return Object.freeze({
    kind: "hog_transition_proposal" as const,
    disposition: "hold" as const,
    relation: "judgment_blocked" as const,
    declarationRef: occurrence.term.judgmentPredicateRef,
    source: occurrence.frame.cursor,
  });
}

export function evaluateHog<
  Prefix,
  Value,
  DeterministicCandidate,
  ProbabilisticCandidate,
  InteractionCandidate,
  Error,
>(
  input: HogEvaluationInput<Prefix, Value>,
  structuralPort: StructuralAdmissionPort<Prefix, Value, Error>,
  executableOccurrencePort: ExecutableOccurrenceAdmissionPort<
    Prefix,
    Value,
    Error
  >,
  interactionOccurrencePort: InteractionOccurrenceAdmissionPort<
    Prefix,
    Value,
    Error
  >,
  deterministicPort: DeterministicInvocationPort<
    Prefix,
    Value,
    DeterministicCandidate,
    Error
  >,
  probabilisticPort: ProbabilisticInvocationPort<
    Prefix,
    Value,
    ProbabilisticCandidate,
    Error
  >,
  interactionPort: InteractionInvocationPort<
    Prefix,
    Value,
    InteractionCandidate,
    Error
  >,
  deterministicResultPort: DeterministicResultAdmissionPort<
    Prefix,
    Value,
    DeterministicCandidate,
    Error
  >,
  probabilisticResultPort: ProbabilisticResultAdmissionPort<
    Prefix,
    Value,
    ProbabilisticCandidate,
    Error
  >,
  interactionResultPort: InteractionResultAdmissionPort<
    Prefix,
    Value,
    InteractionCandidate,
    Error
  >,
  judgmentEvaluationPort: JudgmentEvaluationPort<Prefix, Value, Error>,
  judgmentAdmissionPort: JudgmentAdmissionPort<Prefix, Value, Error>,
  transitionAdmissionPort: TransitionAdmissionPort<Prefix, Value, Error>,
  terminalAdmissionPort: TerminalAdmissionPort<Prefix, Value, Error>,
  childFrameAdmissionPort: ChildFrameAdmissionPort<Prefix, Value, Error>,
  childFoldbackAdmissionPort: ChildFoldbackAdmissionPort<Prefix, Value, Error>,
): Effect.Effect<HogTraversalReceipt<Prefix, Value>, Error> {
  type State = EvaluationState<Prefix, Value>;
  type Open = OpenState<Prefix, Value>;

  const initial: Open = Object.freeze({
    stateKind: "evaluate" as const,
    frame: input.frame,
    predecessorPrefix: input.predecessorPrefix,
    returns: freezeReturns(input.returns ?? []),
  });

  const afterResult = (
    state: EvaluateState<Prefix, Value>,
    occurrence: HogLeafOccurrence<Value>,
    opened: HogOpenedOccurrence<Prefix>,
    result: HogAdmittedResult<Prefix, Value>,
  ): Effect.Effect<State, Error> =>
    Effect.flatMap(
      judgmentEvaluationPort.evaluateJudgment(occurrence, opened, result),
      (decision) => Effect.flatMap(
        judgmentAdmissionPort.admitJudgment(
          occurrence,
          opened,
          result,
          decision,
        ),
        (judgment) => {
          const proposal = transitionProposal(
            occurrence,
            result,
            judgment,
          );
          if (!("kind" in proposal)) {
            return Effect.succeed(outOfFrame(
              state.frame,
              judgment.successorPrefix,
              state.returns,
              proposal.diagnosticRef,
              proposal.message,
            ));
          }
          return proposal.disposition === "terminal"
            ? Effect.map(
                terminalAdmissionPort.admitTerminal(
                  occurrence,
                  opened,
                  result,
                  judgment,
                  proposal,
                ),
                (disposition) => applyDisposition(
                  state.frame,
                  disposition,
                  state.returns,
                  proposal,
                ),
              )
            : Effect.map(
                transitionAdmissionPort.admitTransition(
                  occurrence,
                  opened,
                  result,
                  judgment,
                  proposal,
                ),
                (disposition) => applyDisposition(
                  state.frame,
                  disposition,
                  state.returns,
                  proposal,
                ),
              );
        },
      ),
    );

  return Effect.suspend(() =>
    Effect.map(
      Effect.iterate<State, Open, never, Error>(initial, {
        while: (state): state is Open => state.stateKind !== "done",
        body: (state): Effect.Effect<State, Error> => Effect.suspend(() => {
          if (state.stateKind === "prepare_child") {
            return Effect.map(
              childFrameAdmissionPort.prepareChild(
                state.request,
                state.parent,
                state.predecessorPrefix,
              ),
              (prepared) => {
                if (prepared.kind === "hog_admitted_disposition") {
                  return applyDisposition(
                    state.parent,
                    prepared,
                    state.returns,
                    "kind" in state.request &&
                        state.request.kind === "hog_workflow_occurrence"
                      ? Object.freeze({
                          kind: "hog_transition_proposal" as const,
                          disposition: "hold" as const,
                          relation: "interaction_hold" as const,
                          declarationRef: state.request.term.graphFunctionRef,
                          source: state.parent.cursor,
                        })
                      : Object.freeze({
                          kind: "hog_transition_proposal" as const,
                          disposition: "hold" as const,
                          relation: "interaction_hold" as const,
                          declarationRef: state.request.declarationRef,
                          source: state.parent.cursor,
                        }),
                  );
                }
                if (
                  !exactFrame(prepared.child) ||
                  prepared.child.graph.graphFunctionRef !==
                    (state.request.kind === "hog_workflow_occurrence"
                      ? state.request.term.graphFunctionRef
                      : state.request.graphFunctionRef)
                ) {
                  return outOfFrame(
                    state.parent,
                    prepared.successorPrefix,
                    state.returns,
                    "diagnostic://abiogenesis/hog/prepared-child-mismatch@5",
                    "prepared child differs from the exact declared GraphFunction",
                  );
                }
                const parentReturn = Object.freeze({
                  kind: "hog_return_frame" as const,
                  parent: state.parent,
                  child: prepared,
                });
                return Object.freeze({
                  stateKind: "evaluate" as const,
                  frame: prepared.child,
                  predecessorPrefix: prepared.successorPrefix,
                  returns: freezeReturns([...state.returns, parentReturn]),
                });
              },
            );
          }
          if (state.stateKind === "foldback") {
            return Effect.map(
              childFoldbackAdmissionPort.admitChildFoldback(
                state.parentReturn.parent,
                state.parentReturn.child,
                state.childDisposition,
              ),
              (disposition) => applyDisposition(
                state.parentReturn.parent,
                disposition,
                state.returns,
                Object.freeze({
                  kind: "hog_transition_proposal" as const,
                  disposition: "advance" as const,
                  relation: "root_complete" as const,
                  target: Object.freeze({
                    kind: "c_continuation_target" as const,
                    schemaVersion: "5.0.0" as const,
                    disposition: "advance" as const,
                    relation: "root_complete" as const,
                    nodeRef: state.parentReturn.parent.cursor.nodeRef,
                    termPath: state.parentReturn.parent.cursor.termPath,
                    taskOrdinal: state.parentReturn.parent.cursor.taskOrdinal,
                    attempt: state.parentReturn.parent.cursor.attempt,
                    retryPath: state.parentReturn.parent.cursor.retryPath,
                    inputRef: disposition.disposition === "enter_child"
                      ? state.parentReturn.parent.value.valueRef
                      : disposition.value.valueRef,
                    inputDigest: disposition.disposition === "enter_child"
                      ? state.parentReturn.parent.value.valueDigest
                      : disposition.value.valueDigest,
                  }),
                }),
              ),
            );
          }

          if (!exactFrame(state.frame)) {
            return Effect.succeed(outOfFrame(
              state.frame,
              state.predecessorPrefix,
              state.returns,
              "diagnostic://abiogenesis/hog/frame-mismatch@5",
              "HoG requires one exact admitted materialized frame and value",
            ));
          }
          const term = resolveCProgramTermAtSourcePath(
            state.frame.graph.template,
            state.frame.cursor.nodeRef,
            state.frame.cursor.termPath,
          );
          if (term.kind === "c_source_path_refusal") {
            return Effect.succeed(outOfFrame(
              state.frame,
              state.predecessorPrefix,
              state.returns,
              "diagnostic://abiogenesis/hog/source-path-refused@5",
              term.message,
            ));
          }
          if (term.kind === "c_workflow") {
            const occurrence: HogWorkflowOccurrence<Value> = Object.freeze({
              kind: "hog_workflow_occurrence" as const,
              frame: state.frame,
              term,
            });
            return Effect.succeed(Object.freeze({
              stateKind: "prepare_child" as const,
              parent: state.frame,
              request: occurrence,
              predecessorPrefix: state.predecessorPrefix,
              returns: state.returns,
            }));
          }
          if (term.kind !== "c_of") {
            const target = term.kind === "c_identity"
              ? deriveCContinuationTarget(
                  state.frame.graph,
                  state.frame.cursor,
                  state.frame.cursor,
                )
              : deriveCStructuralTarget(
                  state.frame.graph,
                  state.frame.cursor,
                  term.kind === "c_retry" ? "retry" : "advance",
                );
            if (target === null || target.kind === "c_source_path_refusal") {
              return Effect.succeed(outOfFrame(
                state.frame,
                state.predecessorPrefix,
                state.returns,
                "diagnostic://abiogenesis/hog/structural-target-refused@5",
                target === null
                  ? "GTL structural term has no declared target"
                  : target.message,
              ));
            }
            const occurrence: HogStructuralOccurrence<Value> = Object.freeze({
              kind: "hog_structural_occurrence" as const,
              frame: state.frame,
              term,
              target,
            });
            return Effect.map(
              structuralPort.admitStructural(
                occurrence,
                state.predecessorPrefix,
              ),
              (disposition) => applyDisposition(
                state.frame,
                disposition,
                state.returns,
                target,
              ),
            );
          }

          const occurrence: HogLeafOccurrence<Value> = Object.freeze({
            kind: "hog_leaf_occurrence" as const,
            frame: state.frame,
            term,
          });
          if (term.fibre === "F_D") {
            return Effect.flatMap(
              executableOccurrencePort.openExecutable(
                occurrence,
                state.predecessorPrefix,
              ),
              (opened) => Effect.flatMap(
                deterministicPort.invokeDeterministic(opened, state.frame.value),
                (candidate) => Effect.flatMap(
                  deterministicResultPort.admitDeterministicResult(
                    occurrence,
                    opened,
                    candidate,
                  ),
                  (result) => afterResult(state, occurrence, opened, result),
                ),
              ),
            );
          }
          if (term.fibre === "F_P") {
            return Effect.flatMap(
              executableOccurrencePort.openExecutable(
                occurrence,
                state.predecessorPrefix,
              ),
              (opened) => Effect.flatMap(
                probabilisticPort.invokeProbabilistic(opened, state.frame.value),
                (candidate) => Effect.flatMap(
                  probabilisticResultPort.admitProbabilisticResult(
                    occurrence,
                    opened,
                    candidate,
                  ),
                  (result) => afterResult(state, occurrence, opened, result),
                ),
              ),
            );
          }
          return Effect.flatMap(
            interactionOccurrencePort.openInteraction(
              occurrence,
              state.predecessorPrefix,
            ),
            (opened) => Effect.flatMap(
              interactionPort.invokeInteraction(opened, state.frame.value),
              (candidate) => Effect.flatMap(
                interactionResultPort.admitInteractionResult(
                  occurrence,
                  opened,
                  candidate,
                ),
                (result) => afterResult(state, occurrence, opened, result),
              ),
            ),
          );
        }),
      }),
      (state) => (state as DoneState<Prefix, Value>).receipt,
    )
  );
}
