import type { PreparedChildTraversal } from "./child_traversal.js";
import { isChildTraversalPreparationPort } from "./child_traversal.js";
import {
  advanceDeferredRecursion,
  blockDeferredRecursion,
  blockDeferredRecursionPreparation,
  completeDeferredApplicationTerminal,
  restoreDeferredRecursion,
  suspendHeldRecursionTraversal,
  type CompleteExecutableTraversalInput,
  type ExecutableTraversalCompletion,
  type RestoreDeferredRecursionInput,
} from "./execute.js";
import type { ExecuteGraphTraversalCommonInput } from "./graph_execute.js";
import type { RecurseApplication } from "../gtl/contracts.js";
import { recursionTerminationDecision } from "../gtl/graph_applications.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import * as Effect from "effect/Effect";

export interface CompleteRecursionApplicationInput {
  readonly parent: ExecuteGraphTraversalCommonInput;
  readonly traversalInput: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>;
  readonly application: Readonly<RecurseApplication>;
  readonly completion: ExecutableTraversalCompletion;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly leafOrdinal: number;
  readonly fail: (
    stage: string,
    diagnosticRef: string,
    candidate: JsonValue,
  ) => never;
}

export interface RecursionChildFoldFrame {
  readonly kind: "recursion_child_fold_frame";
  readonly parent: ExecuteGraphTraversalCommonInput;
  readonly traversalInput: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>;
  readonly application: Readonly<RecurseApplication>;
  readonly restored: ExecutableTraversalCompletion;
  readonly restoration: RestoreDeferredRecursionInput;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly leafOrdinal: number;
  readonly childExecutionBasis: PreparedChildTraversal["executionBasis"];
  readonly childTraversalScope: PreparedChildTraversal["openedTraversalScope"];
  readonly childInput: PreparedChildTraversal["input"];
  readonly childInputDigest: PreparedChildTraversal["inputDigest"];
}

export type RecursionApplicationStep =
  | Readonly<{
      kind: "recursion_completion";
      completion: ExecutableTraversalCompletion;
    }>
  | Readonly<{
      kind: "recursion_child_request";
      frame: RecursionChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
    }>;

export function beginRecursionApplication(
  input: CompleteRecursionApplicationInput,
): Effect.Effect<RecursionApplicationStep> {
  return Effect.gen(function* () {
    const { parent, application, traversalInput, leafOrdinal } = input;
    const completion = input.completion;
    if (
      completion.cCallRef === null ||
      completion.resultRef === null ||
      completion.judgmentRef === null
    ) {
      return input.fail(
        `recursion-restoration-coordinates-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-restoration-coordinates-absent@5",
        completion as unknown as JsonValue,
      );
    }
    const restoration: RestoreDeferredRecursionInput = {
      traversalInput,
      application,
      cCallRef: completion.cCallRef,
      resultRef: completion.resultRef,
      judgmentRef: completion.judgmentRef,
    };
    const restored = restoreDeferredRecursion(restoration);
    if (
      restored === null ||
      sha256Canonical(restored as unknown as JsonValue) !==
        sha256Canonical(completion as unknown as JsonValue)
    ) {
      return input.fail(
        `recursion-restoration-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-restoration-mismatch@5",
        completion as unknown as JsonValue,
      );
    }
    const termination = restored.resultValue === null
      ? null
      : recursionTerminationDecision(application, restored.resultValue);
    if (termination === null) {
      return input.fail(
        `recursion-termination-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-termination-value-invalid@5",
        { applicationRef: application.applicationRef, resultRef: restored.resultRef },
      );
    }
    const clock = (stage: string) => ({
      eventTime: parent.eventTime,
      correlationId: `${parent.correlationId}/recursion/${leafOrdinal}/${stage}`,
    });
    if (termination) {
      return {
        kind: "recursion_completion" as const,
        completion: completeDeferredApplicationTerminal({
          completion: restored,
          restoration,
          application,
          clock: clock("terminal"),
        }),
      };
    }
    if (traversalInput.traversalStop.cursor.attempt >= application.bound) {
      return {
        kind: "recursion_completion" as const,
        completion: blockDeferredRecursion({
          completion: restored,
          restoration,
          application,
          clock: clock("bound"),
        }),
      };
    }
    if (
      parent.childTraversalPreparationPort === undefined ||
      !isChildTraversalPreparationPort(parent.childTraversalPreparationPort) ||
      restored.cCallRef === null ||
      restored.resultRef === null ||
      typeof restored.resultValue !== "object" ||
      restored.resultValue === null ||
      Array.isArray(restored.resultValue)
    ) {
      return input.fail(
        `recursion-child-port-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-child-preparation-absent@5",
        { applicationRef: application.applicationRef },
      );
    }
    const childInput = restored.resultValue as Readonly<Record<string, JsonValue>>;
    const childInputDigest = sha256Canonical(childInput);
    const prepared = yield* Effect.promise(() => Promise.resolve(
      parent.childTraversalPreparationPort!.prepare({
        parentExecutionBasis: parent.executionBasis,
        parentTraversalScope: parent.openedTraversalScope,
        parentCCallRef: restored.cCallRef!,
        childGraphFunctionRef: application.graphFunctionRef,
        inputRef: restored.resultRef!,
        inputDigest: childInputDigest,
        input: childInput,
        eventTime: parent.eventTime,
        correlationId: clock("prepare").correlationId,
      }),
    ));
    if (prepared.kind !== "prepared_child_traversal") {
      return {
        kind: "recursion_completion" as const,
        completion: blockDeferredRecursionPreparation({
          completion: restored,
          restoration,
          application,
          preparationRefusal: prepared,
          clock: clock("prepare-refusal"),
        }),
      };
    }
    return {
      kind: "recursion_child_request" as const,
      frame: {
        kind: "recursion_child_fold_frame" as const,
        parent,
        traversalInput,
        application,
        restored,
        restoration,
        graphEntryInput: input.graphEntryInput,
        graphEntryInputDigest: input.graphEntryInputDigest,
        leafOrdinal,
        childExecutionBasis: prepared.executionBasis,
        childTraversalScope: prepared.openedTraversalScope,
        childInput: prepared.input,
        childInputDigest: prepared.inputDigest,
      },
      prepared,
      correlationId: clock("child").correlationId,
    };
  });
}

export function completeRecursionChild(
  frame: RecursionChildFoldFrame,
  childCompletion: ExecutableTraversalCompletion,
): ExecutableTraversalCompletion {
    const {
      parent,
      application,
      restored,
      restoration,
      graphEntryInput,
      graphEntryInputDigest,
      leafOrdinal,
      childExecutionBasis,
      childTraversalScope,
      childInput,
      childInputDigest,
    } = frame;
    const clock = (stage: string) => ({
      eventTime: parent.eventTime,
      correlationId: `${parent.correlationId}/recursion/${leafOrdinal}/${stage}`,
    });
    if (childCompletion.disposition === "held") {
      return suspendHeldRecursionTraversal({
        parentGraphInput: graphEntryInput,
        parentGraphInputDigest: graphEntryInputDigest,
        application,
        deferredCompletion: restored,
        restoration,
        childExecutionBasis,
        childTraversalScope,
        childInput,
        childInputDigest,
        childCompletion,
        terminalMode: parent.terminalMode ?? "close_run",
      });
    }
    if (
      childCompletion.disposition === "failed" &&
      childCompletion.replayState.runtimeStatus === "failed"
    ) return childCompletion;
    return advanceDeferredRecursion({
      completion: restored,
      restoration,
      application,
      childExecutionBasis,
      childTraversalScope,
      childCompletion,
      clock: clock("foldback"),
    });
}
