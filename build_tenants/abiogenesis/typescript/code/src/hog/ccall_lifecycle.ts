import * as Effect from "effect/Effect";

import * as Abg from "../abg/index.js";
import type {
  AbgEventStore,
  ActorRuntimeBinding,
  AdmittedImplementationSet,
  BlockedCCallOutcomeReceipt,
  ExecutableCCallLocusCandidate,
  ExecutionBasis,
  JudgedCCallOutcomeReceipt,
  OpenedTraversalScope,
  RetryCCallOutcomeReceipt,
} from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type {
  ClosureContract,
  GraphFunction,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type {
  ClosedLeafOwnerReceipt,
  LeafInvocationPort,
} from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { proposeJudgmentCandidate } from "./judgment.js";
import {
  admissionBasis,
  runtimePrefixAtDurable,
  type ExecutionClock,
} from "./operator_support.js";
import * as Routes from "./route_proposal.js";
import { planSuccessfulRetryExit } from "./retry_lifecycle.js";
import {
  applyAdmittedRoute,
  deriveCompletedTraversalCursor,
  type TraversalCursor,
} from "./traversal.js";
import { failTraversal } from "./traversal_failure.js";
import {
  projectExecutableTraversalCompletion,
  type ExecutableTraversalCompletion,
} from "./traversal_completion.js";

export interface ExecutableCCallContext {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly stop: ExecutableCCallLocusCandidate;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly scopeClass: "root" | "child";
  readonly deferToApplication?: true;
  readonly clock: ExecutionClock;
  readonly ordinal: number;
}

export interface CCallLifecycleEvaluation {
  readonly kind: "c_call_evaluation";
  readonly completion: ExecutableTraversalCompletion;
  readonly outputValueKind: string;
  readonly outputContractRef: string;
}

export interface CCallRetryRequest {
  readonly kind: "c_call_retry";
  readonly context: ExecutableCCallContext;
  readonly outcome: RetryCCallOutcomeReceipt;
  readonly outputValueKind: string;
  readonly outputContractRef: string;
}

export type CCallLifecycleStep =
  | CCallLifecycleEvaluation
  | CCallRetryRequest;

function failCCall(
  input: ExecutableCCallContext,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  return failTraversal({
    store: input.store,
    predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    eventTime: input.clock.eventTime,
    correlationId: input.clock.correlationId,
    stage,
    diagnosticRef,
    candidate,
  });
}

function projectBlockedCCallCompletion(
  replayState: Abg.ReplayState,
  successorPrefix: DurablePrefixCoordinate,
  cCall: Abg.CCall,
  resultRef: string,
  judgmentRef: string,
  reasonRef: string,
  resultValue: JsonValue,
): ExecutableTraversalCompletion {
  return projectExecutableTraversalCompletion(
    "blocked",
    replayState,
    successorPrefix,
    {
      cCallRef: cCall.cCallRef,
      resultRef,
      judgmentRef,
      resultValue,
      diagnosticRef: reasonRef,
    },
  );
}

export function projectCCallCompletion(
  source: TraversalCursor,
  admitted: Abg.CCallCompletionAdmission,
  target: TraversalCursor | null,
): ExecutableTraversalCompletion {
  if (admitted.disposition === "blocked") {
    const outcome = admitted.outcome;
    const cCall = outcome.disposition === "blocked"
      ? outcome.cCall
      : outcome.admitted.cCall;
    const result = outcome.disposition === "blocked"
      ? outcome.result
      : outcome.admitted.result;
    return projectBlockedCCallCompletion(
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      cCall,
      result.resultRef,
      outcome.disposition === "blocked"
        ? outcome.completion.rejectionJudgmentRef
        : outcome.admitted.judgment.judgmentRef,
      outcome.disposition === "blocked"
        ? outcome.diagnosticRef
        : outcome.admitted.judgment.reasonRef,
      result.value,
    );
  }
  const { cCall, result, judgment } = admitted.outcome.admitted;
  if (admitted.disposition === "failed") {
    return projectExecutableTraversalCompletion(
      "failed",
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        resultValue: result.value,
        diagnosticRef: judgment.reasonRef,
      },
    );
  }
  if (admitted.disposition === "application_ready") {
    return projectExecutableTraversalCompletion(
      "application_ready",
      admitted.replayState,
      admitted.outcome.successorPrefix,
      {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        resultValue: result.value,
      },
    );
  }
  if (admitted.disposition === "advanced") {
    if (target === null) {
      return projectExecutableTraversalCompletion(
        "refused",
        admitted.transition.replayState,
        admitted.transition.successorPrefix,
        {
          cCallRef: cCall.cCallRef,
          resultRef: result.resultRef,
          judgmentRef: judgment.judgmentRef,
          resultValue: result.value,
          diagnosticRef:
            "diagnostic://abiogenesis/hog/advanced-target-absent@5",
        },
      );
    }
    const nextCursor = applyAdmittedRoute(
      runtimePrefixAtDurable(admitted.transition.successorPrefix, source.runId),
      source,
      target,
      "advance",
      admitted.transition.route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      return projectExecutableTraversalCompletion(
        "refused",
        admitted.transition.replayState,
        admitted.transition.successorPrefix,
        {
          cCallRef: cCall.cCallRef,
          resultRef: result.resultRef,
          judgmentRef: judgment.judgmentRef,
          resultValue: result.value,
          diagnosticRef: `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        },
      );
    }
    return projectExecutableTraversalCompletion(
      "advanced",
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        nextCursor,
        resultValue: result.value,
        continuationKind: "advance",
        nextInputContractRef: cCall.outputContractRef,
      },
    );
  }
  return projectExecutableTraversalCompletion(
    "closed",
    admitted.closure.replayState,
    admitted.transition.successorPrefix,
    {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      closureRef: admitted.closure.closureRef,
      resultValue: result.value,
    },
  );
}

export function evaluateExecutableCCall(
  input: ExecutableCCallContext,
): Effect.Effect<CCallLifecycleStep> {
  return Effect.gen(function* () {
    const resolution = Abg.selectAdmittedImplementationResolution(
      input.implementationSet,
      {
        graphFunctionRef: input.graph.graphFunctionRef,
        nodeRef: input.stop.nodeRef,
        programLocusRef: input.stop.programLocusRef,
        implementationBindingRef: input.stop.implementationBindingRef,
      },
    );
    const outputValueKind = input.leafPort.contractValueKind(
      input.stop.outputContractRef,
      "output",
    );
    const failureValueKind = input.leafPort.contractValueKind(
      input.stop.failureContractRef,
      "failure",
    );
    if (
      resolution === null || outputValueKind === null ||
      failureValueKind === null
    ) {
      return failCCall(
        input,
        input.predecessorPrefix,
        `leaf-resolution-${input.ordinal}`,
        "diagnostic://abiogenesis/implementation/admitted-row-absent@5",
        input.stop as unknown as JsonValue,
      );
    }
    const opened = Abg.openCCall({
      locusClass: "implementation",
      store: input.store,
      predecessorPrefix: input.predecessorPrefix,
      executionBasis: input.executionBasis,
      scope: input.openedTraversalScope,
      program: input.program,
      graphFunction: input.graphFunction,
      graph: input.graph,
      stop: input.stop,
      implementationSet: input.implementationSet,
      resolution,
      basis: admissionBasis(input.clock, "open"),
    });
    if (opened.kind !== "c_call_admission") {
      return failCCall(
        input,
        input.predecessorPrefix,
        `leaf-open-${input.ordinal}`,
        `diagnostic://abiogenesis/c-call/${opened.code}@5`,
        opened as unknown as JsonValue,
      );
    }
    const occurrence = Object.freeze({
      cCallRef: opened.cCall.cCallRef,
      runId: opened.cCall.runId,
      graphCallId: opened.cCall.graphCallId,
      frameId: opened.cCall.frameId,
      programLocusRef: opened.cCall.programLocusRef,
      taskOrdinal: opened.cCall.taskOrdinal,
      attempt: opened.cCall.attempt,
    });
    const invocation = yield* Effect.promise(() =>
      input.leafPort.invoke({
        resolution,
        input: input.input,
        inputDigest: input.stop.cursor.inputDigest,
        failureContractRef: input.stop.failureContractRef,
        occurrence,
      }));
    if (invocation.kind === "leaf_invocation_owner_refusal") {
      return failCCall(
        input,
        opened.successorPrefix,
        `leaf-owner-${input.ordinal}`,
        invocation.diagnosticRef,
        invocation as unknown as JsonValue,
      );
    }
    let completedOwner: Readonly<ClosedLeafOwnerReceipt>;
    let outcomePredecessor = opened.successorPrefix;
    if (invocation.kind === "prepared_probabilistic_leaf_owner_invocation") {
      const effectResult = yield* Effect.promise(() =>
        Abg.invokeActorProcess({
          store: input.store,
          predecessorPrefix: opened.successorPrefix,
          executionBasis: input.executionBasis,
          scope: input.openedTraversalScope,
          cCall: opened.cCall,
          expectedInputDigest: input.stop.cursor.inputDigest,
          occurrence,
          workerContracts: invocation.workerContracts,
          runtime: input.actorRuntimeBinding,
          request: invocation.workerRequest,
          dispatchOrdinal: 1,
          basis: admissionBasis(input.clock, "actor-process"),
        }));
      if (effectResult.kind === "actor_process_effect_refusal") {
        return failCCall(
          input,
          effectResult.successorPrefix,
          `leaf-effect-${input.ordinal}`,
          effectResult.diagnosticRef,
          effectResult as unknown as JsonValue,
        );
      }
      const effectReceipt = effectResult;
      try {
        completedOwner = invocation.complete(effectReceipt.exchange);
      } catch {
        return failCCall(
          input,
          effectReceipt.successorPrefix,
          `leaf-completion-${input.ordinal}`,
          "diagnostic://abiogenesis/implementation/owner-boundary-exception@5",
          effectReceipt as unknown as JsonValue,
        );
      }
      outcomePredecessor = effectReceipt.successorPrefix;
    } else {
      completedOwner = invocation;
    }
    const outcomeInput = {
      outcomeClass: "leaf",
      store: input.store,
      predecessorPrefix: outcomePredecessor,
      executionBasis: input.executionBasis,
      implementationSet: input.implementationSet,
      graph: input.graph,
      graphFunction: input.graphFunction,
      cursor: input.stop.cursor,
      cCall: opened.cCall,
      resolution,
      leafPort: input.leafPort,
      input: input.input,
      inputDigest: input.stop.cursor.inputDigest,
      ownerReceipt: completedOwner,
      outputValueKind,
      failureValueKind,
      basis: admissionBasis(input.clock, "outcome"),
    } as const;
    const resultOutcome = input.stop.computeRegime === "F_P"
      ? Abg.admitCCallResult({
          ...outcomeInput,
          regime: "F_P",
          actorRuntimeBinding: input.actorRuntimeBinding,
        })
      : Abg.admitCCallResult({ ...outcomeInput, regime: "F_D" });
    const admitted = resultOutcome.disposition !== "result"
      ? resultOutcome
      : (() => {
          const relation = input.leafPort.resolveJudgmentRelation(
            resultOutcome.cCall.judgmentPredicateRef,
          );
          if (relation === null) {
            return failCCall(
              input,
              resultOutcome.successorPrefix,
              `leaf-judgment-relation-${input.ordinal}`,
              "diagnostic://abiogenesis/hog/judgment-relation-absent@5",
              resultOutcome.cCall as unknown as JsonValue,
            );
          }
          const candidate = proposeJudgmentCandidate({
            cCall: resultOutcome.cCall,
            result: resultOutcome.result,
            replayState: resultOutcome.replayState,
            contractRef: resultOutcome.cCall.judgmentContractRef,
            decision: completedOwner.candidate.disposition === "success"
              ? { decisionClass: "evaluate", input: input.input, relation }
              : {
                  decisionClass: "refuse",
                  predicateRef: resultOutcome.cCall.judgmentPredicateRef,
                  reasonRef: completedOwner.candidate.diagnosticRef,
                },
          });
          return Abg.admitCCallJudgment({
            store: input.store,
            graph: input.graph,
            graphFunction: input.graphFunction,
            cursor: input.stop.cursor,
            outcome: resultOutcome,
            candidate,
            basis: admissionBasis(input.clock, "judgment"),
          });
        })();
    if (admitted.disposition === "retry") {
      return {
        kind: "c_call_retry" as const,
        context: input,
        outcome: admitted,
        outputValueKind,
        outputContractRef: input.stop.outputContractRef,
      };
    }
    let target: TraversalCursor | null = null;
    if (
      admitted.disposition === "judged" &&
      admitted.admitted.result.resultClass === "success" &&
      admitted.admitted.judgment.judgment === "advance" &&
      input.deferToApplication !== true
    ) {
      const derived = deriveCompletedTraversalCursor(
        input.graph,
        input.stop.cursor,
        {
          inputRef: admitted.admitted.result.resultRef,
          inputDigest: admitted.admitted.result.valueDigest,
        },
      );
      if (derived?.kind === "traversal_refusal") {
        return failCCall(
          input,
          admitted.successorPrefix,
          `leaf-continuation-${input.ordinal}`,
          `diagnostic://abiogenesis/hog/${derived.code}@5`,
          derived as unknown as JsonValue,
        );
      }
      target = derived;
    }
    const applicationReady = admitted.disposition === "judged" &&
      input.deferToApplication === true &&
      admitted.admitted.result.resultClass === "success" &&
      admitted.admitted.judgment.judgment === "advance";
    const retryProgressBasis = admissionBasis(input.clock, "retry-progress");
    const retryExit = admitted.disposition === "judged" &&
        !applicationReady &&
        admitted.admitted.result.resultClass === "success" &&
        admitted.admitted.judgment.judgment === "advance"
      ? planSuccessfulRetryExit({
          predecessorPrefix: admitted.successorPrefix,
          graph: input.graph,
          graphFunction: input.graphFunction,
          source: input.stop.cursor,
          target,
          completion: {
            completionClass: "judged_success",
            cCall: admitted.admitted.cCall,
            result: admitted.admitted.result,
            judgment: admitted.admitted.judgment,
          },
          basis: retryProgressBasis,
        })
      : null;
    if (retryExit?.kind === "successful_retry_exit_plan_refusal") {
      return failCCall(
        input,
        admitted.successorPrefix,
        `leaf-retry-progress-${input.ordinal}`,
        `diagnostic://abiogenesis/hog/${retryExit.code}@5`,
        retryExit as unknown as JsonValue,
      );
    }
    const proposedTransition = applicationReady
      ? null
      : Routes.proposeCCallOutcomeTransition({
          graph: input.graph,
          graphFunction: input.graphFunction,
          sourceCursor: input.stop.cursor,
          targetCursor: admitted.disposition === "blocked" ? null : target,
          outcome: admitted,
          ...(retryExit?.kind === "successful_retry_exit_plan"
            ? { completedRetryProgress: retryExit.plan }
            : {}),
          terminalizeNonAdvance: input.scopeClass === "root",
        });
    if (
      proposedTransition !== null &&
      proposedTransition.kind !== "traversal_transition_candidate"
    ) {
      return failCCall(
        input,
        admitted.successorPrefix,
        `leaf-route-${input.ordinal}`,
        `diagnostic://abiogenesis/hog/${proposedTransition.code}@5`,
        proposedTransition as unknown as JsonValue,
      );
    }
    const completionAdmission = Abg.admitCCallCompletion({
      store: input.store,
      predecessorPrefix: admitted.successorPrefix,
      executionBasis: input.executionBasis,
      graph: input.graph,
      graphFunction: input.graphFunction,
      source: input.stop.cursor,
      target: admitted.disposition === "blocked" ? null : target,
      outcome: admitted as JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt,
      candidate: proposedTransition,
      openedTraversalScope: input.openedTraversalScope,
      closureContract: input.closureContract,
      basis: admissionBasis(input.clock, "completion"),
      ...(retryExit?.kind === "successful_retry_exit_plan"
        ? { completedRetryProgress: retryExit }
        : {}),
      ...(input.deferToApplication === true
        ? { deferToApplication: true as const }
        : {}),
    });
    if (completionAdmission.kind !== "c_call_completion_admission") {
      return failCCall(
        input,
        admitted.successorPrefix,
        `leaf-completion-${input.ordinal}`,
        `diagnostic://abiogenesis/hog/${completionAdmission.code}@5`,
        completionAdmission as unknown as JsonValue,
      );
    }
    return {
      kind: "c_call_evaluation" as const,
      completion: projectCCallCompletion(
        input.stop.cursor,
        completionAdmission,
        target,
      ),
      outputValueKind,
      outputContractRef: input.stop.outputContractRef,
    };
  });
}
