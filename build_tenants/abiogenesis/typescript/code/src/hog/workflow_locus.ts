import {
  deriveGraphFunctionActionEvaluationBasis,
  openWorkflowCCall,
  rehydrateConstructionIntentForCursor,
} from "../abg/index.js";
import type { CCall } from "../abg/index.js";
import type { FanOutApplication } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import * as Effect from "effect/Effect";
import {
  isChildTraversalPreparationPort,
  type PreparedChildTraversal,
} from "./child_traversal.js";
import {
  completeWorkflowPreparationRefusal,
  completeWorkflowTraversal,
  suspendHeldWorkflowTraversal,
  type ExecutableTraversalCompletion,
} from "./execute.js";
import type { ExecuteGraphTraversalCommonInput } from "./graph_execute.js";
import {
  terminalLocusEvaluation,
  type TraversalLocusEvaluation,
  type TraversalLocusFailure,
} from "./locus_evaluation.js";
import { resolveTraversalTerm, type TraversalCursor } from "./traversal.js";

export interface EvaluateWorkflowLocusInput {
  readonly runtime: ExecuteGraphTraversalCommonInput;
  readonly cursor: TraversalCursor;
  readonly value: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly ordinal: number;
  readonly fail: TraversalLocusFailure;
}

type WorkflowTerm = Extract<
  ReturnType<typeof resolveTraversalTerm>,
  Readonly<{ kind: "c_workflow" }>
>;

export interface WorkflowChildFoldFrame {
  readonly kind: "workflow_child_fold_frame";
  readonly runtime: ExecuteGraphTraversalCommonInput;
  readonly cursor: TraversalCursor;
  readonly value: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly ordinal: number;
  readonly workflowTerm: WorkflowTerm;
  readonly parentCCall: CCall;
  readonly application: Readonly<FanOutApplication> | null;
  readonly childExecutionBasis: PreparedChildTraversal["executionBasis"];
  readonly childTraversalScope: PreparedChildTraversal["openedTraversalScope"];
  readonly childInput: PreparedChildTraversal["input"];
  readonly childInputDigest: PreparedChildTraversal["inputDigest"];
  readonly foldbackCorrelationId: string;
}

export type WorkflowLocusStep =
  | Readonly<{
      kind: "locus_evaluation";
      evaluation: TraversalLocusEvaluation;
    }>
  | Readonly<{
      kind: "workflow_child_request";
      frame: WorkflowChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
      deferFailedRunStop: boolean;
    }>;

function fanOutApplication(
  runtime: ExecuteGraphTraversalCommonInput,
  batchRef: string | null,
): Readonly<FanOutApplication> | null {
  if (batchRef === null) return null;
  const selected = runtime.graph.template.applications.find((candidate) =>
    candidate.relationKind === "fan_out" && candidate.batchRef === batchRef
  );
  return selected?.relationKind === "fan_out" ? selected : null;
}

export function beginWorkflowLocus(
  input: EvaluateWorkflowLocusInput,
): Effect.Effect<WorkflowLocusStep> {
  return Effect.gen(function* () {
    const { runtime, cursor, ordinal } = input;
    const term = resolveTraversalTerm(runtime.graph, cursor);
    if (term.kind !== "c_workflow") {
      return input.fail(`workflow-step-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
        term as unknown as JsonValue);
    }
    const childPort = runtime.childTraversalPreparationPort;
    if (childPort === undefined || !isChildTraversalPreparationPort(childPort)) {
      return input.fail(`child-port-${ordinal}`,
        "diagnostic://abiogenesis/hog/child-preparation-port-absent@5",
        term as unknown as JsonValue);
    }
    const failureContracts = new Set(runtime.implementationSet.rows
      .filter((row) => row.graphFunctionRef === term.graphFunctionRef)
      .map((row) => row.failureContractRef));
    const failureContractRef = [...failureContracts][0];
    if (failureContracts.size !== 1 || failureContractRef === undefined) {
      return input.fail(`workflow-failure-contract-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-failure-contract-ambiguous@5", {
          childGraphFunctionRef: term.graphFunctionRef,
          failureContractRefs: [...failureContracts].sort(),
        });
    }
    const opened = openWorkflowCCall(runtime.store, runtime.executionBasis,
      runtime.implementationSet, runtime.openedTraversalScope, runtime.program,
      runtime.graphFunction, runtime.graph, {
        kind: "workflow_c_call_proposal", schemaVersion: "5.0.0", cursor,
        traversalScopeRef: runtime.openedTraversalScope.scopeRef,
        runId: runtime.openedTraversalScope.runId,
        graphCallId: runtime.openedTraversalScope.graphCallId,
        frameId: runtime.openedTraversalScope.frameId,
        childGraphFunctionRef: term.graphFunctionRef,
        inputContractRef: term.inputCarrierRef,
        outputContractRef: term.outputCarrierRef,
        failureContractRef,
        judgmentPredicateRef:
          runtime.graphFunction.declarations["abg.judgment_predicate"] ?? "",
      }, {
        eventTime: runtime.eventTime,
        correlationId: `${runtime.correlationId}/workflow/${ordinal}/parent`,
        causationEventRefs: [],
      });
    if (opened.kind !== "c_call_admission") {
      return input.fail(`workflow-parent-${ordinal}`,
        `diagnostic://abiogenesis/hog/${opened.code}@5`,
        opened as unknown as JsonValue);
    }
    const application = fanOutApplication(runtime, opened.cCall.batchRef);
    const intent = rehydrateConstructionIntentForCursor(runtime.store, cursor);
    const selectedInput = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInput : input.value;
    const selectedInputRef = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInputRef : cursor.inputRef;
    const selectedInputDigest = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInputDigest : cursor.inputDigest;
    if (selectedInput === null || selectedInputRef === null ||
        selectedInputDigest === null ||
        (intent?.actionKind === "invoke_graph_function" &&
          (intent.selectedGraphFunctionRef !== term.graphFunctionRef ||
            intent.targetProgramLocusRef !== term.graphFunctionRef ||
            sha256Canonical(selectedInput) !== selectedInputDigest))) {
      return input.fail(`workflow-selected-input-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-selected-input-mismatch@5",
        term as unknown as JsonValue);
    }
    const prepared = yield* Effect.promise(() => Promise.resolve(childPort.prepare({
      parentExecutionBasis: runtime.executionBasis,
      parentTraversalScope: runtime.openedTraversalScope,
      parentCCallRef: opened.cCall.cCallRef,
      childGraphFunctionRef: term.graphFunctionRef,
      inputRef: selectedInputRef,
      inputDigest: selectedInputDigest,
      input: selectedInput,
      eventTime: runtime.eventTime,
      correlationId: `${runtime.correlationId}/workflow/${ordinal}/prepare`,
    })));
    if (prepared.kind !== "prepared_child_traversal") {
      return {
        kind: "locus_evaluation" as const,
        evaluation: terminalLocusEvaluation(completeWorkflowPreparationRefusal({
        store: runtime.store, executionBasis: runtime.executionBasis,
        openedTraversalScope: runtime.openedTraversalScope,
        graphFunction: runtime.graphFunction, graph: runtime.graph,
        workflowCursor: cursor, workflowTerm: term,
        parentCCall: opened.cCall, preparationRefusal: prepared,
        clock: { eventTime: runtime.eventTime,
          correlationId: `${runtime.correlationId}/workflow/${ordinal}/prepare-refusal` },
        })),
      };
    }
    return {
      kind: "workflow_child_request" as const,
      frame: {
        kind: "workflow_child_fold_frame" as const,
        runtime,
        cursor,
        value: input.value,
        graphEntryInput: input.graphEntryInput,
        graphEntryInputDigest: input.graphEntryInputDigest,
        ordinal,
        workflowTerm: term,
        parentCCall: opened.cCall,
        application,
        childExecutionBasis: prepared.executionBasis,
        childTraversalScope: prepared.openedTraversalScope,
        childInput: prepared.input,
        childInputDigest: prepared.inputDigest,
        foldbackCorrelationId:
          `${runtime.correlationId}/workflow/${ordinal}/foldback`,
      },
      prepared,
      correlationId: `${runtime.correlationId}/workflow/${ordinal}/child`,
      deferFailedRunStop: runtime.deferFailedRunStop === true ||
        application?.elementGraphFunctionRef === term.graphFunctionRef,
    };
  });
}

export function completeWorkflowLocus(
  frame: WorkflowChildFoldFrame,
  child: ExecutableTraversalCompletion,
  fail: TraversalLocusFailure,
): TraversalLocusEvaluation {
    const {
      runtime,
      cursor,
      value,
      graphEntryInput,
      graphEntryInputDigest,
      ordinal,
      workflowTerm: term,
      parentCCall,
      application,
      childExecutionBasis,
      childTraversalScope,
      childInput,
      childInputDigest,
      foldbackCorrelationId,
    } = frame;
    if (child.disposition === "held") {
      return terminalLocusEvaluation(suspendHeldWorkflowTraversal({
        parentExecutionBasis: runtime.executionBasis,
        parentTraversalScope: runtime.openedTraversalScope,
        parentGraph: runtime.graph, parentClosureContract: runtime.closureContract,
        parentCCall, sourceCursor: cursor,
        parentGraphInput: graphEntryInput,
        parentGraphInputDigest: graphEntryInputDigest,
        parentInput: value, parentInputDigest: cursor.inputDigest,
        childExecutionBasis,
        childTraversalScope,
        childInput, childInputDigest,
        childCompletion: child,
        terminalMode: runtime.terminalMode ?? "close_run",
      }));
    }
    if (child.disposition === "failed" && child.replayState.runtimeStatus === "failed") {
      return terminalLocusEvaluation(child);
    }
    const intent = rehydrateConstructionIntentForCursor(runtime.store, cursor);
    const actionBasis = intent?.actionKind === "invoke_graph_function" &&
        child.disposition === "closed" && child.resultRef !== null &&
        child.judgmentRef !== null && child.closureRef !== null &&
        typeof child.resultValue === "object" && child.resultValue !== null &&
        !Array.isArray(child.resultValue)
      ? deriveGraphFunctionActionEvaluationBasis(runtime.store,
          runtime.executionBasis, cursor, {
            childGraphFunctionRef: term.graphFunctionRef,
            childResultRef: child.resultRef,
            childResultValue: child.resultValue as Readonly<Record<string, JsonValue>>,
            childJudgmentRef: child.judgmentRef, childClosureRef: child.closureRef,
          }) : null;
    if (intent?.actionKind === "invoke_graph_function" &&
        child.disposition === "closed" && actionBasis === null) {
      return fail(`workflow-action-evaluation-basis-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-action-evaluation-basis-absent@5",
        term as unknown as JsonValue);
    }
    const outputKind = runtime.leafPort.contractValueKind(term.outputCarrierRef, "output");
    const failureKind = runtime.leafPort.contractValueKind(
      parentCCall.failureContractRef, "failure");
    const judgment = runtime.leafPort.resolveJudgmentRelation(
      parentCCall.judgmentPredicateRef);
    if (outputKind === null || failureKind === null || judgment === null) {
      return fail(`workflow-contract-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-result-contract-absent@5", {
          outputContractRef: term.outputCarrierRef,
          predicateRef: parentCCall.judgmentPredicateRef,
        });
    }
    const completion = completeWorkflowTraversal({
      store: runtime.store, executionBasis: runtime.executionBasis,
      openedTraversalScope: runtime.openedTraversalScope, program: runtime.program,
      graphFunction: runtime.graphFunction, graph: runtime.graph,
      workflowCursor: cursor, workflowTerm: term, parentCCall,
      childExecutionBasis,
      childTraversalScope, childCompletion: child,
      input: value, inputDigest: cursor.inputDigest,
      resultValueKind: outputKind, failureValueKind: failureKind,
      validateSuccessResult: (value): value is Readonly<Record<string, JsonValue>> =>
        runtime.leafPort.validateContractValue(term.outputCarrierRef, "output", value) &&
        judgment.evaluate(frame.value, value),
      ...(actionBasis === null ? {} : { successResultValue: actionBasis }),
      closureContract: runtime.closureContract,
      ...(runtime.terminalMode === undefined ? {} : { terminalMode: runtime.terminalMode }),
      judgmentRelation: judgment,
      ...(application === null ? {} : { fanOutApplication: application,
        validateFanOutVector: (value: unknown): value is Readonly<Record<string, JsonValue>> =>
          runtime.leafPort.validateContractValue(
            application.outputVectorRef, "output", value) }),
      clock: { eventTime: runtime.eventTime,
        correlationId: foldbackCorrelationId },
    });
    return { completion, outputValueKind: outputKind,
      outputContractRef: term.outputCarrierRef };
}
