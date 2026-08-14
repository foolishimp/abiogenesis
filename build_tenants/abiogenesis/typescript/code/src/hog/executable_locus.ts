import { selectAdmittedImplementationResolution } from "../abg/index.js";
import { projectExecutableRetryInput } from "../abg/retry.js";
import type { RecurseApplication } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import * as Effect from "effect/Effect";
import type { PreparedChildTraversal } from "./child_traversal.js";
import type {
  CompleteExecutableTraversalInput,
  ExecutableTraversalCompletion,
} from "./execute.js";
import type {
  ExecuteGraphTraversalCommonInput,
  ProjectedRetryResumeSuccess,
} from "./graph_execute.js";
import { executeLeafAtLocus } from "./leaf_execute.js";
import type {
  TraversalLocusEvaluation,
  TraversalLocusFailure,
} from "./locus_evaluation.js";
import { completeRecursionApplication } from "./recursion_execute.js";
import { admitProjectedRetryResume } from "./retry_resume_admission.js";
import type { ExecutableTraversalStopRef } from "./traversal.js";

export interface EvaluateExecutableLocusInput {
  readonly runtime: ExecuteGraphTraversalCommonInput;
  readonly stop: ExecutableTraversalStopRef;
  readonly value: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly ordinal: number;
  readonly evaluateRetry: (
    resume: ProjectedRetryResumeSuccess,
    correlationId: string,
  ) => Effect.Effect<ExecutableTraversalCompletion>;
  readonly evaluateChild: (
    prepared: PreparedChildTraversal,
    correlationId: string,
  ) => Effect.Effect<ExecutableTraversalCompletion>;
  readonly fail: TraversalLocusFailure;
}

function recursionApplication(
  runtime: ExecuteGraphTraversalCommonInput,
  compositionRef: string | null,
): Readonly<RecurseApplication> | null {
  if (compositionRef === null) return null;
  const selected = runtime.graph.template.applications.find(
    (candidate) => candidate.applicationRef === compositionRef,
  );
  return selected?.relationKind === "recurse" ? selected : null;
}

export function evaluateExecutableLocus(
  input: EvaluateExecutableLocusInput,
): Effect.Effect<TraversalLocusEvaluation> {
  return Effect.gen(function* () {
    const { runtime, stop, ordinal } = input;
    const resolution = selectAdmittedImplementationResolution(
      runtime.implementationSet,
      {
        graphFunctionRef: runtime.graph.graphFunctionRef,
        nodeRef: stop.nodeRef,
        programLocusRef: stop.programLocusRef,
        implementationBindingRef: stop.implementationBindingRef,
      },
    );
    if (resolution === null) {
      return input.fail(`resolution-${ordinal}`,
        "diagnostic://abiogenesis/implementation-resolution/admitted-row-absent@5",
        stop as unknown as JsonValue);
    }
    const outputKind = runtime.leafPort.contractValueKind(
      stop.outputContractRef, "output");
    if (outputKind === null) {
      return input.fail(`contract-${ordinal}`,
        "diagnostic://abiogenesis/implementation/result-contract-absent@5",
        stop as unknown as JsonValue);
    }
    const application = recursionApplication(runtime, stop.compositionRef);
    const traversalInput: CompleteExecutableTraversalInput<
      Readonly<Record<string, JsonValue>>
    > = {
      store: runtime.store,
      executionBasis: runtime.executionBasis,
      openedTraversalScope: runtime.openedTraversalScope,
      program: runtime.program,
      graphFunction: runtime.graphFunction,
      graph: runtime.graph,
      traversalStop: stop,
      implementationSet: runtime.implementationSet,
      implementationResolution: resolution,
      leafPort: runtime.leafPort,
      input: input.value,
      inputDigest: stop.cursor.inputDigest,
      closureContract: runtime.closureContract,
      actorRuntimeBinding: runtime.actorRuntimeBinding,
      ...(runtime.deferFailedRunStop === true
        ? { deferFailedRunStop: true }
        : {}),
      terminalMode: application === null
        ? runtime.terminalMode ?? "close_run"
        : "return_to_application",
      ...(application === null
        ? {}
        : { applicationCompletionMode: runtime.terminalMode ?? "close_run" }),
      clock: {
        eventTime: runtime.eventTime,
        correlationId: `${runtime.correlationId}/leaf/${ordinal}`,
      },
    };
    const leafResult = yield* Effect.promise(() =>
      executeLeafAtLocus(traversalInput)
    );
    if (leafResult.kind === "retry_runtime_failure_transition_admission") {
      const retry = projectExecutableRetryInput({
        prefix: leafResult.successorPrefix,
        selector: {
          kind: "retry_frontier_selector",
          schemaVersion: "5.0.0",
          runId: runtime.openedTraversalScope.runId,
          graphCallId: runtime.openedTraversalScope.graphCallId,
          frameId: runtime.openedTraversalScope.frameId,
          retryBoundaryRef: leafResult.progress.retryBoundaryRef,
          retryProgressRef: leafResult.progress.progressRef,
        },
        program: runtime.program,
        graphFunction: runtime.graphFunction,
        graph: runtime.graph,
      });
      if (retry.kind !== "executable_retry_input") {
        throw new TypeError(`projected retry input refused: ${retry.code}`);
      }
      const resumed = admitProjectedRetryResume({
        store: runtime.store,
        predecessorPrefix: leafResult.successorPrefix,
        retry,
        runtime: {
          executionBasis: runtime.executionBasis,
          openedTraversalScope: runtime.openedTraversalScope,
          program: runtime.program,
          graphFunction: runtime.graphFunction,
          graph: runtime.graph,
          graphValidation: runtime.graphValidation,
          eventTime: runtime.eventTime,
          correlationId: `${runtime.correlationId}/retry/${retry.nextAttempt}`,
        },
      });
      return {
        completion: yield* input.evaluateRetry(
          resumed,
          `${runtime.correlationId}/retry/${retry.nextAttempt}/execute`,
        ),
        outputValueKind: null,
        outputContractRef: null,
      };
    }
    let completion = leafResult;
    if (application !== null && completion.disposition === "application_ready") {
      completion = yield* completeRecursionApplication({
        parent: runtime,
        traversalInput,
        application,
        completion,
        graphEntryInput: input.graphEntryInput,
        graphEntryInputDigest: input.graphEntryInputDigest,
        leafOrdinal: ordinal,
        evaluateChild: input.evaluateChild,
        fail: input.fail,
      });
    }
    return {
      completion,
      outputValueKind: outputKind,
      outputContractRef: stop.outputContractRef,
    };
  });
}
