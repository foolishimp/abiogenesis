import {
  admitInitialTraversalCursor,
  admitRuntimeFailure,
  deriveGraphFunctionActionEvaluationBasis,
  hasAdmittedTraversalCursor,
  openWorkflowCCall,
  rehydrateConstructionIntentForCursor,
  selectAdmittedInteractionContract,
  selectAdmittedImplementationResolution,
  traversalCursorAdmissionEventRef,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type AdmittedImplementationSet,
  type AdmittedInteractionSet,
  type CCall,
  type ContinuationProductBasis,
  type ExecutionBasis,
  type OpenedTraversalScope,
} from "../abg/index.js";
import type {
  ClosureContract,
  FanOutApplication,
  GraphFunction,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import { recursionTerminationDecision } from "../gtl/graph_applications.js";
import { resolveEnclosingCRetryContexts } from "../gtl/source_path.js";
import { isAdmittedLeafInvocationPort } from "./leaf_invocation_port.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { GraphValidation } from "../validator/graph.js";
import {
  advanceDeferredRecursion,
  blockDeferredRecursion,
  blockDeferredRecursionPreparation,
  completeDeferredApplicationTerminal,
  completeExecutableTraversal,
  completeInteractionTraversal,
  completeWorkflowPreparationRefusal,
  completeWorkflowTraversal,
  restoreDeferredRecursion,
  suspendHeldRecursionTraversal,
  suspendHeldWorkflowTraversal,
  type ExecutableTraversalCompletion,
  type HeldRecursionSuspension,
  type HeldWorkflowSuspension,
  type RetainedRetryInput,
} from "./execute.js";
import {
  isChildTraversalPreparationPort,
  type ChildTraversalPreparationPort,
} from "./child_traversal.js";
import {
  advanceStructuralTraversal,
  type StructuralTraversalResult,
} from "./structural_execute.js";
import {
  traverse,
  traverseFromCursor,
  type TraversalCursor,
} from "./traversal.js";

export interface ExecuteGraphTraversalInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly implementationSet: AdmittedImplementationSet;
  readonly interactionSet: AdmittedInteractionSet;
  readonly continuationProductBasis?: ContinuationProductBasis;
  readonly leafPort: LeafInvocationPort;
  readonly childTraversalPreparationPort?: ChildTraversalPreparationPort;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly terminalMode?: "close_run" | "return_to_parent";
  readonly resume?: {
    readonly cursor: TraversalCursor;
    readonly input: Readonly<Record<string, JsonValue>>;
    readonly inputDigest: `sha256:${string}`;
  };
}

export interface ResumeHeldWorkflowTraversalInput {
  readonly parent: ExecuteGraphTraversalInput;
  readonly suspension: HeldWorkflowSuspension;
  readonly parentCCall: import("../abg/index.js").CCall;
  readonly sourceCursor: TraversalCursor;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childCompletion: ExecutableTraversalCompletion;
}

export interface ResumeHeldRecursionTraversalInput {
  readonly parent: ExecuteGraphTraversalInput;
  readonly suspension: HeldRecursionSuspension;
  readonly evaluatorCCall: CCall;
  readonly evaluatorResult: AdmittedCCallResult;
  readonly evaluatorJudgment: AdmittedCCallJudgment;
  readonly sourceCursor: TraversalCursor;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childCompletion: ExecutableTraversalCompletion;
}

function fail(
  input: ExecuteGraphTraversalInput,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  admitRuntimeFailure(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    "hog_traversal",
    { stage, candidate },
    diagnosticRef,
    {
      eventTime: input.eventTime,
      correlationId: `${input.correlationId}/${stage}`,
      causationEventRefs: [],
    },
  );
  throw new TypeError(diagnosticRef);
}

function advanceStructural(
  input: ExecuteGraphTraversalInput,
  value: StructuralTraversalResult,
  ordinal: number,
): StructuralTraversalResult {
  if (value.kind !== "traversal_step") return value;
  return advanceStructuralTraversal({
    store: input.store,
    program: input.program,
    graph: input.graph,
    graphValidation: input.graphValidation,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    initial: value,
    clock: {
      eventTime: input.eventTime,
      correlationId: `${input.correlationId}/structural/${ordinal}`,
    },
  });
}

function activeCursor(
  value: StructuralTraversalResult,
): TraversalCursor | null {
  if (value.kind === "traversal_stop_ref") return value.cursor;
  return value.kind === "traversal_step" ? value.sourceCursor : null;
}

function retryInputKey(
  nodeRef: string,
  retryTermPath: readonly string[],
): string {
  return JSON.stringify([nodeRef, retryTermPath]);
}

function captureRetryInputs(
  graph: Readonly<GtlGraph>,
  value: StructuralTraversalResult,
  currentInput: Readonly<Record<string, JsonValue>>,
  inputs: Map<string, RetainedRetryInput>,
): boolean {
  const cursor = activeCursor(value);
  if (cursor === null) return true;
  const contexts = resolveEnclosingCRetryContexts(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if ("kind" in contexts || contexts.length !== cursor.retryPath.length) {
    return false;
  }
  for (const context of contexts) {
    const key = retryInputKey(cursor.currentNodeRef, context.retryTermPath);
    if (inputs.has(key)) continue;
    inputs.set(key, {
      value: currentInput,
      inputRef: cursor.inputRef,
      inputDigest: cursor.inputDigest,
      inputContractRef: context.inputCarrierRef,
    });
  }
  return true;
}

function selectRetryInput(
  graph: Readonly<GtlGraph>,
  value: StructuralTraversalResult,
  inputs: ReadonlyMap<string, RetainedRetryInput>,
): RetainedRetryInput | undefined {
  const cursor = activeCursor(value);
  if (cursor === null) return undefined;
  const contexts = resolveEnclosingCRetryContexts(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if ("kind" in contexts) return undefined;
  const context = contexts.at(-1);
  return context === undefined
    ? undefined
    : inputs.get(retryInputKey(cursor.currentNodeRef, context.retryTermPath));
}

function recurseApplicationAtStop(
  graph: Readonly<GtlGraph>,
  compositionRef: string | null,
): Readonly<RecurseApplication> | null {
  if (compositionRef === null) return null;
  const application = graph.template.applications.find(
    (candidate) => candidate.applicationRef === compositionRef,
  );
  return application?.relationKind === "recurse" ? application : null;
}

function fanOutApplicationForBatch(
  graph: Readonly<GtlGraph>,
  batchRef: string | null,
): Readonly<FanOutApplication> | null {
  if (batchRef === null) return null;
  const application = graph.template.applications.find(
    (candidate) =>
      candidate.relationKind === "fan_out" &&
      candidate.batchRef === batchRef,
  );
  return application?.relationKind === "fan_out" ? application : null;
}

function materializedInputAtCursor(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursor | null,
): {
  readonly inputContractRef: string;
  readonly value: Readonly<Record<string, JsonValue>>;
} | null {
  if (cursor === null) return null;
  for (const materialization of graph.fanOutMaterializations) {
    const member = materialization.members.find(
      (candidate) =>
        candidate.ordinal === cursor.taskOrdinal &&
        candidate.memberRef === cursor.inputRef &&
        candidate.memberDigest === cursor.inputDigest,
    );
    if (member !== undefined) {
      return {
        inputContractRef: materialization.inputMemberContractRef,
        value: member.value,
      };
    }
  }
  return null;
}

export async function executeGraphTraversal(
  input: ExecuteGraphTraversalInput,
): Promise<ExecutableTraversalCompletion> {
  if (
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !== input.implementationSet.implementationSetRef ||
    input.leafPort.implementationSetDigest !== input.implementationSet.implementationSetDigest
  ) {
    return fail(
      input,
      "leaf-port",
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5",
      { implementationSetRef: input.implementationSet.implementationSetRef },
    );
  }
  let stop: StructuralTraversalResult;
  const resumedCursor = input.resume?.cursor;
  if (input.resume !== undefined) {
    if (
      !hasAdmittedTraversalCursor(input.store, input.resume.cursor) ||
      input.resume.cursor.executionBasisRef !== input.executionBasis.basisRef ||
      input.resume.cursor.traversalScopeRef !==
        input.openedTraversalScope.scopeRef ||
      input.resume.cursor.graphRef !== input.graph.materializationRef ||
      input.resume.cursor.inputDigest !== input.resume.inputDigest ||
      sha256Canonical(input.resume.input as unknown as JsonValue) !==
        input.resume.inputDigest ||
      input.resume.cursor.retryPath.length !== 0
    ) {
      return fail(
        input,
        "resume-basis",
        "diagnostic://abiogenesis/hog/resume-basis-mismatch@5",
        {
          cursorRef: input.resume.cursor.cursorRef,
          inputDigest: input.resume.inputDigest,
        },
      );
    }
    stop = traverseFromCursor(
      {
        program: input.program,
        graph: input.graph,
        graphValidation: input.graphValidation,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
      },
      input.resume.cursor,
    );
  } else {
    try {
      stop = traverse({
        program: input.program,
        graph: input.graph,
        graphValidation: input.graphValidation,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
      });
    } catch {
      return fail(
        input,
        "initial-traversal",
        "diagnostic://abiogenesis/hog/traversal-exception@5",
        { errorClass: "traversal_exception" },
      );
    }
  }
  if (stop.kind === "traversal_refusal") {
    return fail(
      input,
      "initial-traversal-refusal",
      `diagnostic://abiogenesis/hog/${stop.code}@5`,
      stop as unknown as JsonValue,
    );
  }
  const initialCursor = stop.kind === "traversal_stop_ref" ? stop.cursor : stop.sourceCursor;
  if (resumedCursor === undefined) {
    const cursorAdmission = admitInitialTraversalCursor(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      input.graph,
      input.graphValidation,
      initialCursor,
      {
        eventTime: input.eventTime,
        correlationId: `${input.correlationId}/cursor`,
        causationEventRefs: [],
      },
    );
    if (cursorAdmission.kind !== "traversal_cursor_admission") {
      return fail(
        input,
        "cursor-refusal",
        `diagnostic://abiogenesis/hog/${cursorAdmission.code}@5`,
        cursorAdmission as unknown as JsonValue,
      );
    }
  }

  stop = advanceStructural(input, stop, 0);
  if (
    stop.kind !== "traversal_stop_ref" &&
    !(stop.kind === "traversal_step" && stop.directStep.stepKind === "enter_child")
  ) {
    return fail(
      input,
      "structural-step",
      "diagnostic://abiogenesis/hog/structural-step-not-yet-executable@5",
      stop as unknown as JsonValue,
    );
  }

  let currentInput =
    materializedInputAtCursor(input.graph, activeCursor(stop))?.value ??
      input.resume?.input ??
      input.input;
  const retryInputs = new Map<string, RetainedRetryInput>();
  if (!captureRetryInputs(input.graph, stop, currentInput, retryInputs)) {
    return fail(
      input,
      "retry-input-capture",
      "diagnostic://abiogenesis/hog/retry-input-basis-absent@5",
      stop as unknown as JsonValue,
    );
  }
  let completion: ExecutableTraversalCompletion | null = null;
  let leafOrdinal = 0;
  while (
    stop.kind === "traversal_stop_ref" ||
    (stop.kind === "traversal_step" && stop.directStep.stepKind === "enter_child")
  ) {
    let completionValueKind: string | null = null;
    let completionContractRef: string | null = null;
    if (stop.kind === "traversal_step") {
      const workflowStep = stop;
      const directStep = workflowStep.directStep;
      if (directStep.stepKind !== "enter_child") {
        return fail(
          input,
          `workflow-step-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
          workflowStep as unknown as JsonValue,
        );
      }
      if (
        input.childTraversalPreparationPort === undefined ||
        !isChildTraversalPreparationPort(input.childTraversalPreparationPort)
      ) {
        return fail(
          input,
          `child-port-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/child-preparation-port-absent@5",
          workflowStep as unknown as JsonValue,
        );
      }
      const childFailureContractRefs = new Set(
        input.implementationSet.rows
          .filter((row) => row.graphFunctionRef === directStep.graphFunctionRef)
          .map((row) => row.failureContractRef),
      );
      const childFailureContractRef = [...childFailureContractRefs][0];
      if (
        childFailureContractRefs.size !== 1 ||
        childFailureContractRef === undefined
      ) {
        return fail(
          input,
          `workflow-failure-contract-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/workflow-failure-contract-ambiguous@5",
          {
            childGraphFunctionRef: directStep.graphFunctionRef,
            failureContractRefs: [...childFailureContractRefs].sort(),
          },
        );
      }
      const openedParent = openWorkflowCCall(
        input.store,
        input.executionBasis,
        input.implementationSet,
        input.openedTraversalScope,
        input.program,
        input.graphFunction,
        input.graph,
        {
          kind: "workflow_c_call_proposal",
          schemaVersion: "5.0.0",
          cursor: workflowStep.sourceCursor,
          traversalScopeRef: input.openedTraversalScope.scopeRef,
          runId: input.openedTraversalScope.runId,
          graphCallId: input.openedTraversalScope.graphCallId,
          frameId: input.openedTraversalScope.frameId,
          childGraphFunctionRef: directStep.graphFunctionRef,
          inputContractRef: directStep.inputCarrierRef,
          outputContractRef: directStep.outputCarrierRef,
          failureContractRef: childFailureContractRef,
          judgmentPredicateRef:
            input.graphFunction.declarations["abg.judgment_predicate"] ?? "",
        },
        {
          eventTime: input.eventTime,
          correlationId: `${input.correlationId}/workflow/${leafOrdinal}/parent`,
          causationEventRefs: [],
        },
      );
      if (openedParent.kind !== "c_call_admission") {
        return fail(
          input,
          `workflow-parent-${leafOrdinal}`,
          `diagnostic://abiogenesis/hog/${openedParent.code}@5`,
          openedParent as unknown as JsonValue,
        );
      }
      const fanOutApplication = fanOutApplicationForBatch(
        input.graph,
        openedParent.cCall.batchRef,
      );
      const constructionIntent = rehydrateConstructionIntentForCursor(
        input.store,
        workflowStep.sourceCursor,
      );
      const selectedChildInput =
        constructionIntent?.actionKind === "invoke_graph_function"
          ? constructionIntent.targetInput
          : currentInput;
      const selectedChildInputRef =
        constructionIntent?.actionKind === "invoke_graph_function"
          ? constructionIntent.targetInputRef
          : workflowStep.sourceCursor.inputRef;
      const selectedChildInputDigest =
        constructionIntent?.actionKind === "invoke_graph_function"
          ? constructionIntent.targetInputDigest
          : workflowStep.sourceCursor.inputDigest;
      if (
        selectedChildInput === null ||
        selectedChildInputRef === null ||
        selectedChildInputDigest === null ||
        (
          constructionIntent?.actionKind === "invoke_graph_function" &&
          (
            constructionIntent.selectedGraphFunctionRef !==
              directStep.graphFunctionRef ||
            constructionIntent.targetProgramLocusRef !==
              directStep.graphFunctionRef ||
            sha256Canonical(selectedChildInput) !==
              selectedChildInputDigest
          )
        )
      ) {
        return fail(
          input,
          `workflow-selected-input-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/workflow-selected-input-mismatch@5",
          workflowStep as unknown as JsonValue,
        );
      }
      const prepared = await input.childTraversalPreparationPort.prepare({
        parentExecutionBasis: input.executionBasis,
        parentTraversalScope: input.openedTraversalScope,
        parentCCallRef: openedParent.cCall.cCallRef,
        childGraphFunctionRef: directStep.graphFunctionRef,
        inputRef: selectedChildInputRef,
        inputDigest: selectedChildInputDigest,
        input: selectedChildInput,
        eventTime: input.eventTime,
        correlationId: `${input.correlationId}/workflow/${leafOrdinal}/prepare`,
      });
      if (prepared.kind !== "prepared_child_traversal") {
        completion = completeWorkflowPreparationRefusal({
          store: input.store,
          executionBasis: input.executionBasis,
          openedTraversalScope: input.openedTraversalScope,
          graph: input.graph,
          workflowStep,
          parentCCall: openedParent.cCall,
          preparationRefusal: prepared,
          clock: {
            eventTime: input.eventTime,
            correlationId: `${input.correlationId}/workflow/${leafOrdinal}/prepare-refusal`,
          },
        });
      } else {
        const childCompletion = await executeGraphTraversal({
          store: input.store,
          executionBasis: prepared.executionBasis,
          openedTraversalScope: prepared.openedTraversalScope,
          program: prepared.program,
          graphFunction: prepared.graphFunction,
          graph: prepared.graph,
          graphValidation: prepared.graphValidation,
          implementationSet: prepared.implementationSet,
          interactionSet: prepared.interactionSet,
          ...(input.continuationProductBasis === undefined
            ? {}
            : {
                continuationProductBasis: {
                  ...input.continuationProductBasis,
                  programValidation: prepared.programValidation,
                  graphValidation: prepared.graphValidation,
                },
              }),
          leafPort: input.leafPort,
          childTraversalPreparationPort: input.childTraversalPreparationPort,
          closureContract: prepared.closureContract,
          actorRuntimeBinding: input.actorRuntimeBinding,
          input: prepared.input,
          inputDigest: prepared.inputDigest,
          eventTime: input.eventTime,
          correlationId: `${input.correlationId}/workflow/${leafOrdinal}/child`,
          terminalMode: "return_to_parent",
        });
        if (childCompletion.disposition === "held") {
          return suspendHeldWorkflowTraversal({
            parentExecutionBasis: input.executionBasis,
            parentTraversalScope: input.openedTraversalScope,
            parentGraph: input.graph,
            parentClosureContract: input.closureContract,
            parentCCall: openedParent.cCall,
            sourceCursor: workflowStep.sourceCursor,
            parentGraphInput: input.input,
            parentGraphInputDigest: input.inputDigest,
            parentInput: currentInput,
            parentInputDigest: workflowStep.sourceCursor.inputDigest,
            childExecutionBasis: prepared.executionBasis,
            childTraversalScope: prepared.openedTraversalScope,
            childInput: prepared.input,
            childInputDigest: prepared.inputDigest,
            childCompletion,
            terminalMode: input.terminalMode ?? "close_run",
          });
        }
        const selectedActionEvaluationBasis =
          constructionIntent?.actionKind === "invoke_graph_function" &&
            childCompletion.disposition === "closed" &&
            childCompletion.resultRef !== null &&
            childCompletion.judgmentRef !== null &&
            childCompletion.closureRef !== null &&
            typeof childCompletion.resultValue === "object" &&
            childCompletion.resultValue !== null &&
            !Array.isArray(childCompletion.resultValue)
            ? deriveGraphFunctionActionEvaluationBasis(
                input.store,
                input.executionBasis,
                workflowStep.sourceCursor,
                {
                  childGraphFunctionRef: directStep.graphFunctionRef,
                  childResultRef: childCompletion.resultRef,
                  childResultValue:
                    childCompletion.resultValue as Readonly<
                      Record<string, JsonValue>
                    >,
                  childJudgmentRef: childCompletion.judgmentRef,
                  childClosureRef: childCompletion.closureRef,
                },
              )
            : null;
        if (
          constructionIntent?.actionKind === "invoke_graph_function" &&
          selectedActionEvaluationBasis === null
        ) {
          return fail(
            input,
            `workflow-action-evaluation-basis-${leafOrdinal}`,
            "diagnostic://abiogenesis/hog/workflow-action-evaluation-basis-absent@5",
            workflowStep as unknown as JsonValue,
          );
        }
        const outputValueKind = input.leafPort.contractValueKind(
          directStep.outputCarrierRef,
          "output",
        );
        const failureValueKind = input.leafPort.contractValueKind(
          openedParent.cCall.failureContractRef,
          "failure",
        );
        const judgmentRelation = input.leafPort.resolveJudgmentRelation(
          openedParent.cCall.judgmentPredicateRef,
        );
        if (
          outputValueKind === null ||
          failureValueKind === null ||
          judgmentRelation === null
        ) {
          return fail(
            input,
            `workflow-contract-${leafOrdinal}`,
            "diagnostic://abiogenesis/hog/workflow-result-contract-absent@5",
            {
              outputContractRef: directStep.outputCarrierRef,
              predicateRef: openedParent.cCall.judgmentPredicateRef,
            },
          );
        }
        completionValueKind = outputValueKind;
        completionContractRef = directStep.outputCarrierRef;
        completion = completeWorkflowTraversal({
          store: input.store,
          executionBasis: input.executionBasis,
          openedTraversalScope: input.openedTraversalScope,
          program: input.program,
          graph: input.graph,
          workflowStep,
          parentCCall: openedParent.cCall,
          childExecutionBasis: prepared.executionBasis,
          childTraversalScope: prepared.openedTraversalScope,
          childCompletion,
          input: currentInput,
          inputDigest: workflowStep.sourceCursor.inputDigest,
          resultValueKind: outputValueKind,
          failureValueKind,
          validateSuccessResult: (value): value is Readonly<Record<string, JsonValue>> =>
            input.leafPort.validateContractValue(
              directStep.outputCarrierRef,
              "output",
              value,
            ) && judgmentRelation.evaluate(currentInput, value),
          ...(selectedActionEvaluationBasis === null
            ? {}
            : { successResultValue: selectedActionEvaluationBasis }),
          closureContract: input.closureContract,
          ...(input.terminalMode === undefined
            ? {}
            : { terminalMode: input.terminalMode }),
          judgmentRelation,
          ...(fanOutApplication === null
            ? {}
            : {
                fanOutApplication,
                validateFanOutVector: (
                  value: unknown,
                ): value is Readonly<Record<string, JsonValue>> =>
                  input.leafPort.validateContractValue(
                    fanOutApplication.outputVectorRef,
                    "output",
                    value,
                  ),
              }),
          clock: {
            eventTime: input.eventTime,
            correlationId: `${input.correlationId}/workflow/${leafOrdinal}/foldback`,
          },
        });
      }
    } else {
      if (stop.stopClass === "interaction") {
        if (input.continuationProductBasis === undefined) {
          return fail(
            input,
            `interaction-basis-${leafOrdinal}`,
            "diagnostic://abiogenesis/interaction/product-basis-absent@5",
            stop as unknown as JsonValue,
          );
        }
        const interaction = selectAdmittedInteractionContract(
          input.interactionSet,
          {
            graphFunctionRef: input.graph.graphFunctionRef,
            nodeRef: stop.nodeRef,
            programLocusRef: stop.programLocusRef,
            interactionKind: stop.interactionKind,
            actorCapabilityRef: stop.actorCapabilityRef,
            requestContractRef: stop.requestContractRef,
            responseContractRef: stop.responseContractRef,
            continuationContractRef: stop.continuationContractRef,
          },
        );
        if (interaction === null) {
          return fail(
            input,
            `interaction-${leafOrdinal}`,
            "diagnostic://abiogenesis/interaction/admitted-row-absent@5",
            stop as unknown as JsonValue,
          );
        }
        return completeInteractionTraversal({
          store: input.store,
          executionBasis: input.executionBasis,
          openedTraversalScope: input.openedTraversalScope,
          program: input.program,
          graph: input.graph,
          traversalStop: stop,
          interactionSet: input.interactionSet,
          interaction,
          productBasis: input.continuationProductBasis,
          input: currentInput,
          inputDigest: stop.cursor.inputDigest,
          closureContract: input.closureContract,
          clock: {
            eventTime: input.eventTime,
            correlationId: `${input.correlationId}/interaction/${leafOrdinal}`,
          },
        });
      }
      const exactStop = stop;
      const resolution = selectAdmittedImplementationResolution(
        input.implementationSet,
        {
          graphFunctionRef: input.graph.graphFunctionRef,
          nodeRef: exactStop.nodeRef,
          programLocusRef: exactStop.programLocusRef,
          implementationBindingRef: exactStop.implementationBindingRef,
        },
      );
      if (resolution === null) {
        return fail(
          input,
          `resolution-${leafOrdinal}`,
          "diagnostic://abiogenesis/implementation-resolution/admitted-row-absent@5",
          {
            nodeRef: exactStop.nodeRef,
            programLocusRef: exactStop.programLocusRef,
            implementationBindingRef: exactStop.implementationBindingRef,
          },
        );
      }
      const outputValueKind = input.leafPort.contractValueKind(
        exactStop.outputContractRef,
        "output",
      );
      if (outputValueKind === null) {
        return fail(
          input,
          `contract-${leafOrdinal}`,
          "diagnostic://abiogenesis/implementation/result-contract-absent@5",
          {
            failureContractRef: exactStop.failureContractRef,
            judgmentPredicateRef: exactStop.judgmentPredicateRef,
            outputContractRef: exactStop.outputContractRef,
          },
        );
      }
      completionValueKind = outputValueKind;
      completionContractRef = exactStop.outputContractRef;
      const retryInput = selectRetryInput(input.graph, stop, retryInputs);
      const recursionApplication = recurseApplicationAtStop(
        input.graph,
        exactStop.compositionRef,
      );
      completion = await completeExecutableTraversal({
        store: input.store,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
        program: input.program,
        graph: input.graph,
        traversalStop: exactStop,
        implementationSet: input.implementationSet,
        implementationResolution: resolution,
        leafPort: input.leafPort,
        input: currentInput,
        inputDigest: exactStop.cursor.inputDigest,
        ...(retryInput === undefined ? {} : { retryInput }),
        closureContract: input.closureContract,
        actorRuntimeBinding: input.actorRuntimeBinding,
        terminalMode: recursionApplication === null
          ? input.terminalMode ?? "close_run"
          : "return_to_application",
        ...(recursionApplication === null
          ? {}
          : {
              applicationCompletionMode:
                input.terminalMode ?? "close_run",
            }),
        clock: {
          eventTime: input.eventTime,
          correlationId: `${input.correlationId}/leaf/${leafOrdinal}`,
        },
      });
      if (
        recursionApplication !== null &&
        completion.disposition === "application_ready"
      ) {
        const termination = completion.resultValue === null
          ? null
          : recursionTerminationDecision(
            recursionApplication,
            completion.resultValue,
          );
        if (termination === null) {
          return fail(
            input,
            `recursion-termination-${leafOrdinal}`,
            "diagnostic://abiogenesis/hog/recursion-termination-value-invalid@5",
            {
              applicationRef: recursionApplication.applicationRef,
              resultRef: completion.resultRef,
            },
          );
        }
        if (termination) {
          completion = completeDeferredApplicationTerminal({
            completion,
            application: recursionApplication,
            clock: {
              eventTime: input.eventTime,
              correlationId:
                `${input.correlationId}/recursion/${leafOrdinal}/terminal`,
            },
          });
        } else if (exactStop.cursor.attempt >= recursionApplication.bound) {
          completion = blockDeferredRecursion({
            completion,
            application: recursionApplication,
            clock: {
              eventTime: input.eventTime,
              correlationId:
                `${input.correlationId}/recursion/${leafOrdinal}/bound`,
            },
          });
        } else {
          if (
            input.childTraversalPreparationPort === undefined ||
            !isChildTraversalPreparationPort(input.childTraversalPreparationPort) ||
            completion.cCallRef === null ||
            completion.resultRef === null ||
            typeof completion.resultValue !== "object" ||
            completion.resultValue === null ||
            Array.isArray(completion.resultValue)
          ) {
            return fail(
              input,
              `recursion-child-port-${leafOrdinal}`,
              "diagnostic://abiogenesis/hog/recursion-child-preparation-absent@5",
              { applicationRef: recursionApplication.applicationRef },
            );
          }
          const recursionInput = completion.resultValue as Readonly<
            Record<string, JsonValue>
          >;
          const recursionInputDigest = sha256Canonical(recursionInput);
          const prepared = await input.childTraversalPreparationPort.prepare({
            parentExecutionBasis: input.executionBasis,
            parentTraversalScope: input.openedTraversalScope,
            parentCCallRef: completion.cCallRef,
            childGraphFunctionRef: recursionApplication.graphFunctionRef,
            inputRef: completion.resultRef,
            inputDigest: recursionInputDigest,
            input: recursionInput,
            eventTime: input.eventTime,
            correlationId:
              `${input.correlationId}/recursion/${leafOrdinal}/prepare`,
          });
          if (prepared.kind !== "prepared_child_traversal") {
            completion = blockDeferredRecursionPreparation({
              completion,
              application: recursionApplication,
              preparationRefusal: prepared,
              clock: {
                eventTime: input.eventTime,
                correlationId:
                  `${input.correlationId}/recursion/${leafOrdinal}/prepare-refusal`,
              },
            });
          } else {
            const childCompletion = await executeGraphTraversal({
              store: input.store,
              executionBasis: prepared.executionBasis,
              openedTraversalScope: prepared.openedTraversalScope,
              program: prepared.program,
              graphFunction: prepared.graphFunction,
              graph: prepared.graph,
              graphValidation: prepared.graphValidation,
              implementationSet: prepared.implementationSet,
              interactionSet: prepared.interactionSet,
              ...(input.continuationProductBasis === undefined
                ? {}
                : {
                    continuationProductBasis: {
                      ...input.continuationProductBasis,
                      programValidation: prepared.programValidation,
                      graphValidation: prepared.graphValidation,
                    },
                  }),
              leafPort: input.leafPort,
              childTraversalPreparationPort:
                input.childTraversalPreparationPort,
              closureContract: prepared.closureContract,
              actorRuntimeBinding: input.actorRuntimeBinding,
              input: prepared.input,
              inputDigest: prepared.inputDigest,
              eventTime: input.eventTime,
              correlationId:
                `${input.correlationId}/recursion/${leafOrdinal}/child`,
              terminalMode: "return_to_parent",
            });
            if (childCompletion.disposition === "held") {
              return suspendHeldRecursionTraversal({
                parentGraphInput: input.input,
                parentGraphInputDigest: input.inputDigest,
                application: recursionApplication,
                deferredCompletion: completion,
                childExecutionBasis: prepared.executionBasis,
                childTraversalScope: prepared.openedTraversalScope,
                childInput: prepared.input,
                childInputDigest: prepared.inputDigest,
                childCompletion,
                terminalMode: input.terminalMode ?? "close_run",
              });
            }
            completion = advanceDeferredRecursion({
              completion,
              application: recursionApplication,
              childExecutionBasis: prepared.executionBasis,
              childTraversalScope: prepared.openedTraversalScope,
              childCompletion,
              clock: {
                eventTime: input.eventTime,
                correlationId:
                  `${input.correlationId}/recursion/${leafOrdinal}/foldback`,
              },
            });
          }
        }
      }
    }
    if (completion.disposition !== "advanced") break;
    const nextMaterializedInput = materializedInputAtCursor(
      input.graph,
      completion.nextCursor,
    );
    if (
      completion.nextCursor === null ||
      completion.continuationKind === null ||
      completion.nextInputContractRef === null ||
      completionValueKind === null ||
      completionContractRef === null ||
      (
        nextMaterializedInput === null &&
        (
          typeof completion.resultValue !== "object" ||
          completion.resultValue === null ||
          Array.isArray(completion.resultValue)
        )
      ) ||
      (
        nextMaterializedInput !== null
          ? false
          : completion.continuationKind === "retry"
          ? completion.nextCursor.inputRef.length === 0 ||
            completion.nextCursor.inputDigest !==
              sha256Canonical(completion.resultValue)
          : !input.leafPort.validateContractValue(
            completion.nextInputContractRef,
            "output",
            completion.resultValue,
          )
      )
    ) {
      return fail(
        input,
        `advanced-result-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5",
        { leafOrdinal, completionDisposition: completion.disposition },
      );
    }
    currentInput = nextMaterializedInput?.value ??
      completion.resultValue as Readonly<Record<string, JsonValue>>;
    stop = traverseFromCursor(
      {
        program: input.program,
        graph: input.graph,
        graphValidation: input.graphValidation,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
      },
      completion.nextCursor,
    );
    stop = advanceStructural(input, stop, leafOrdinal + 1);
    if (!captureRetryInputs(input.graph, stop, currentInput, retryInputs)) {
      return fail(
        input,
        `retry-input-capture-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/retry-input-basis-absent@5",
        stop as unknown as JsonValue,
      );
    }
    if (
      stop.kind !== "traversal_stop_ref" &&
      !(stop.kind === "traversal_step" && stop.directStep.stepKind === "enter_child")
    ) {
      return fail(
        input,
        `continuation-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/continuation-not-executable@5",
        stop as unknown as JsonValue,
      );
    }
    leafOrdinal += 1;
  }
  if (completion === null) {
    return fail(
      input,
      "empty-traversal",
      "diagnostic://abiogenesis/hog/no-executable-completion@5",
      { cursorAdmissionEventRef: traversalCursorAdmissionEventRef(input.store, initialCursor) },
    );
  }
  return completion;
}

export async function resumeHeldWorkflowTraversal(
  input: ResumeHeldWorkflowTraversalInput,
): Promise<ExecutableTraversalCompletion> {
  const parent = input.parent;
  if (
    input.suspension.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.suspension.parentTraversalScope.scopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.suspension.parentGraph.materializationRef !==
      parent.graph.materializationRef ||
    input.suspension.parentCCall.cCallRef !==
      input.parentCCall.cCallRef ||
    input.suspension.sourceCursor.cursorRef !==
      input.sourceCursor.cursorRef ||
    input.suspension.childExecutionBasisRef !==
      input.childExecutionBasis.basisRef ||
    input.suspension.childTraversalScopeRef !==
      input.childTraversalScope.scopeRef ||
    input.suspension.terminalMode !==
      (parent.terminalMode ?? "close_run") ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !==
      input.childExecutionBasis.basisRef ||
    sha256Canonical(
      input.suspension.parentGraphInput as unknown as JsonValue,
    ) !== input.suspension.parentGraphInputDigest ||
    sha256Canonical(parent.input as unknown as JsonValue) !==
      parent.inputDigest ||
    parent.inputDigest !== input.suspension.parentGraphInputDigest ||
    sha256Canonical(
      input.suspension.parentInput as unknown as JsonValue,
    ) !== input.suspension.parentInputDigest ||
    sha256Canonical(
      input.suspension.childInput as unknown as JsonValue,
    ) !== input.suspension.childInputDigest
  ) {
    return fail(
      parent,
      "workflow-resume-lineage",
      "diagnostic://abiogenesis/hog/workflow-resume-lineage-mismatch@5",
      input.suspension as unknown as JsonValue,
    );
  }
  const traversal = traverseFromCursor(
    {
      program: parent.program,
      graph: parent.graph,
      graphValidation: parent.graphValidation,
      executionBasis: parent.executionBasis,
      openedTraversalScope: parent.openedTraversalScope,
    },
    input.sourceCursor,
  );
  if (
    traversal.kind !== "traversal_step"
  ) {
    return fail(
      parent,
      "workflow-resume-step",
      "diagnostic://abiogenesis/hog/workflow-resume-step-mismatch@5",
      traversal as unknown as JsonValue,
    );
  }
  const workflowStep = traversal;
  if (
    workflowStep.directStep.stepKind !== "enter_child" ||
    workflowStep.directStep.graphFunctionRef !==
      input.childExecutionBasis.graphFunctionRef
  ) {
    return fail(
      parent,
      "workflow-resume-child",
      "diagnostic://abiogenesis/hog/workflow-resume-child-mismatch@5",
      workflowStep as unknown as JsonValue,
    );
  }
  const directStep = workflowStep.directStep;
  const constructionIntent = rehydrateConstructionIntentForCursor(
    parent.store,
    workflowStep.sourceCursor,
  );
  const selectedActionEvaluationBasis =
    constructionIntent?.actionKind === "invoke_graph_function" &&
      input.childCompletion.disposition === "closed" &&
      input.childCompletion.resultRef !== null &&
      input.childCompletion.judgmentRef !== null &&
      input.childCompletion.closureRef !== null &&
      typeof input.childCompletion.resultValue === "object" &&
      input.childCompletion.resultValue !== null &&
      !Array.isArray(input.childCompletion.resultValue)
      ? deriveGraphFunctionActionEvaluationBasis(
          parent.store,
          parent.executionBasis,
          workflowStep.sourceCursor,
          {
            childGraphFunctionRef: directStep.graphFunctionRef,
            childResultRef: input.childCompletion.resultRef,
            childResultValue:
              input.childCompletion.resultValue as Readonly<
                Record<string, JsonValue>
              >,
            childJudgmentRef: input.childCompletion.judgmentRef,
            childClosureRef: input.childCompletion.closureRef,
          },
        )
      : null;
  if (
    constructionIntent?.actionKind === "invoke_graph_function" &&
    selectedActionEvaluationBasis === null
  ) {
    return fail(
      parent,
      "workflow-resume-action-evaluation",
      "diagnostic://abiogenesis/hog/workflow-action-evaluation-basis-absent@5",
      workflowStep as unknown as JsonValue,
    );
  }
  const outputValueKind = parent.leafPort.contractValueKind(
    directStep.outputCarrierRef,
    "output",
  );
  const failureValueKind = parent.leafPort.contractValueKind(
    input.parentCCall.failureContractRef,
    "failure",
  );
  const judgmentRelation = parent.leafPort.resolveJudgmentRelation(
    input.parentCCall.judgmentPredicateRef,
  );
  if (
    outputValueKind === null ||
    failureValueKind === null ||
    judgmentRelation === null
  ) {
    return fail(
      parent,
      "workflow-resume-contract",
      "diagnostic://abiogenesis/hog/workflow-result-contract-absent@5",
      {
        outputContractRef: directStep.outputCarrierRef,
        failureContractRef: input.parentCCall.failureContractRef,
        predicateRef: input.parentCCall.judgmentPredicateRef,
      },
    );
  }
  const fanOutApplication = fanOutApplicationForBatch(
    parent.graph,
    input.parentCCall.batchRef,
  );
  let completion = completeWorkflowTraversal({
    store: parent.store,
    executionBasis: parent.executionBasis,
    openedTraversalScope: parent.openedTraversalScope,
    program: parent.program,
    graph: parent.graph,
    workflowStep,
    parentCCall: input.parentCCall,
    childExecutionBasis: input.childExecutionBasis,
    childTraversalScope: input.childTraversalScope,
    childCompletion: input.childCompletion,
    input: input.suspension.parentInput,
    inputDigest: input.suspension.parentInputDigest,
    resultValueKind: outputValueKind,
    failureValueKind,
    validateSuccessResult: (
      value,
    ): value is Readonly<Record<string, JsonValue>> =>
      parent.leafPort.validateContractValue(
        directStep.outputCarrierRef,
        "output",
        value,
      ) &&
      judgmentRelation.evaluate(input.suspension.parentInput, value),
    ...(selectedActionEvaluationBasis === null
      ? {}
      : { successResultValue: selectedActionEvaluationBasis }),
    closureContract: parent.closureContract,
    ...(parent.terminalMode === undefined
      ? {}
      : { terminalMode: parent.terminalMode }),
    judgmentRelation,
    ...(fanOutApplication === null
      ? {}
      : {
          fanOutApplication,
          validateFanOutVector: (
            value: unknown,
          ): value is Readonly<Record<string, JsonValue>> =>
            parent.leafPort.validateContractValue(
              fanOutApplication.outputVectorRef,
              "output",
              value,
            ),
        }),
    clock: {
      eventTime: parent.eventTime,
      correlationId: `${parent.correlationId}/workflow/resume-foldback`,
    },
  });
  if (completion.disposition !== "advanced") {
    return completion;
  }
  if (
    completion.nextCursor === null ||
    completion.resultValue === null ||
    typeof completion.resultValue !== "object" ||
    Array.isArray(completion.resultValue)
  ) {
    return fail(
      parent,
      "workflow-resume-advance",
      "diagnostic://abiogenesis/hog/workflow-resume-advance-incomplete@5",
      completion as unknown as JsonValue,
    );
  }
  const nextInput =
    completion.resultValue as Readonly<Record<string, JsonValue>>;
  const nextInputDigest = sha256Canonical(nextInput as unknown as JsonValue);
  if (completion.nextCursor.inputDigest !== nextInputDigest) {
    return fail(
      parent,
      "workflow-resume-advance-digest",
      "diagnostic://abiogenesis/hog/workflow-resume-advance-digest-mismatch@5",
      completion as unknown as JsonValue,
    );
  }
  completion = await executeGraphTraversal({
    ...parent,
    input: input.suspension.parentGraphInput,
    inputDigest: input.suspension.parentGraphInputDigest,
    correlationId: `${parent.correlationId}/parent`,
    resume: {
      cursor: completion.nextCursor,
      input: nextInput,
      inputDigest: nextInputDigest,
    },
  });
  return completion;
}

export async function resumeHeldRecursionTraversal(
  input: ResumeHeldRecursionTraversalInput,
): Promise<ExecutableTraversalCompletion> {
  const parent = input.parent;
  const application = parent.graph.template.applications.find(
    (candidate): candidate is RecurseApplication =>
      candidate.relationKind === "recurse" &&
      candidate.applicationRef === input.suspension.application.applicationRef,
  );
  if (
    application === undefined ||
    sha256Canonical(application as unknown as JsonValue) !==
      sha256Canonical(
        input.suspension.application as unknown as JsonValue,
      ) ||
    input.suspension.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.suspension.parentTraversalScope.scopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.suspension.parentGraph.materializationRef !==
      parent.graph.materializationRef ||
    input.suspension.sourceCursor.cursorRef !==
      input.sourceCursor.cursorRef ||
    input.suspension.evaluatorCCall.cCallRef !==
      input.evaluatorCCall.cCallRef ||
    input.suspension.evaluatorResult.resultRef !==
      input.evaluatorResult.resultRef ||
    input.suspension.evaluatorJudgment.judgmentRef !==
      input.evaluatorJudgment.judgmentRef ||
    input.suspension.childExecutionBasisRef !==
      input.childExecutionBasis.basisRef ||
    input.suspension.childTraversalScopeRef !==
      input.childTraversalScope.scopeRef ||
    input.suspension.terminalMode !==
      (parent.terminalMode ?? "close_run") ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !==
      input.childExecutionBasis.basisRef ||
    sha256Canonical(
      input.suspension.parentGraphInput as unknown as JsonValue,
    ) !== input.suspension.parentGraphInputDigest ||
    parent.inputDigest !== input.suspension.parentGraphInputDigest ||
    sha256Canonical(parent.input as unknown as JsonValue) !==
      parent.inputDigest ||
    sha256Canonical(
      input.suspension.evaluatorInput as unknown as JsonValue,
    ) !== input.suspension.evaluatorInputDigest ||
    sha256Canonical(
      input.suspension.childInput as unknown as JsonValue,
    ) !== input.suspension.childInputDigest
  ) {
    return fail(
      parent,
      "recursion-resume-lineage",
      "diagnostic://abiogenesis/hog/recursion-resume-lineage-mismatch@5",
      input.suspension as unknown as JsonValue,
    );
  }
  const traversalStop = traverseFromCursor(
    {
      program: parent.program,
      graph: parent.graph,
      graphValidation: parent.graphValidation,
      executionBasis: parent.executionBasis,
      openedTraversalScope: parent.openedTraversalScope,
    },
    input.sourceCursor,
  );
  if (
    traversalStop.kind !== "traversal_stop_ref" ||
    traversalStop.stopClass !== "executable"
  ) {
    return fail(
      parent,
      "recursion-resume-stop",
      "diagnostic://abiogenesis/hog/recursion-resume-stop-mismatch@5",
      traversalStop as unknown as JsonValue,
    );
  }
  const resolution = selectAdmittedImplementationResolution(
    parent.implementationSet,
    {
      graphFunctionRef: parent.graph.graphFunctionRef,
      nodeRef: traversalStop.nodeRef,
      programLocusRef: traversalStop.programLocusRef,
      implementationBindingRef: traversalStop.implementationBindingRef,
    },
  );
  if (resolution === null) {
    return fail(
      parent,
      "recursion-resume-resolution",
      "diagnostic://abiogenesis/hog/recursion-resume-resolution-absent@5",
      traversalStop as unknown as JsonValue,
    );
  }
  const deferred = restoreDeferredRecursion({
    traversalInput: {
      store: parent.store,
      executionBasis: parent.executionBasis,
      openedTraversalScope: parent.openedTraversalScope,
      program: parent.program,
      graph: parent.graph,
      traversalStop,
      implementationSet: parent.implementationSet,
      implementationResolution: resolution,
      leafPort: parent.leafPort,
      input: input.suspension.evaluatorInput,
      inputDigest: input.suspension.evaluatorInputDigest,
      closureContract: parent.closureContract,
      actorRuntimeBinding: parent.actorRuntimeBinding,
      terminalMode: "return_to_application",
      applicationCompletionMode: input.suspension.terminalMode,
      clock: {
        eventTime: parent.eventTime,
        correlationId: `${parent.correlationId}/recursion/restore`,
      },
    },
    application,
    cCall: input.evaluatorCCall,
    result: input.evaluatorResult,
    judgment: input.evaluatorJudgment,
  });
  if (deferred === null) {
    return fail(
      parent,
      "recursion-resume-deferred",
      "diagnostic://abiogenesis/hog/recursion-resume-deferred-mismatch@5",
      input.suspension as unknown as JsonValue,
    );
  }
  let completion = advanceDeferredRecursion({
    completion: deferred,
    application,
    childExecutionBasis: input.childExecutionBasis,
    childTraversalScope: input.childTraversalScope,
    childCompletion: input.childCompletion,
    clock: {
      eventTime: parent.eventTime,
      correlationId: `${parent.correlationId}/recursion/foldback`,
    },
  });
  if (completion.disposition !== "advanced") {
    return completion;
  }
  if (
    completion.nextCursor === null ||
    completion.resultValue === null ||
    typeof completion.resultValue !== "object" ||
    Array.isArray(completion.resultValue)
  ) {
    return fail(
      parent,
      "recursion-resume-advance",
      "diagnostic://abiogenesis/hog/recursion-resume-advance-incomplete@5",
      completion as unknown as JsonValue,
    );
  }
  const nextInput =
    completion.resultValue as Readonly<Record<string, JsonValue>>;
  const nextInputDigest = sha256Canonical(nextInput as unknown as JsonValue);
  if (completion.nextCursor.inputDigest !== nextInputDigest) {
    return fail(
      parent,
      "recursion-resume-advance-digest",
      "diagnostic://abiogenesis/hog/recursion-resume-advance-digest-mismatch@5",
      completion as unknown as JsonValue,
    );
  }
  completion = await executeGraphTraversal({
    ...parent,
    input: input.suspension.parentGraphInput,
    inputDigest: input.suspension.parentGraphInputDigest,
    correlationId: `${parent.correlationId}/parent`,
    resume: {
      cursor: completion.nextCursor,
      input: nextInput,
      inputDigest: nextInputDigest,
    },
  });
  return completion;
}
