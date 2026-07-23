import {
  admitInitialTraversalCursor,
  admitRuntimeFailure,
  openWorkflowCCall,
  selectAdmittedImplementationResolution,
  traversalCursorAdmissionEventRef,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type AdmittedImplementationSet,
  type AdmittedInteractionSet,
  type ExecutionBasis,
  type OpenedTraversalScope,
} from "../abg/index.js";
import type {
  ClosureContract,
  GraphFunction,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import { isAdmittedLeafInvocationPort } from "../implementation/invocation_port.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { GraphValidation } from "../validator/graph.js";
import {
  completeExecutableTraversal,
  completeWorkflowPreparationRefusal,
  completeWorkflowTraversal,
  type ExecutableTraversalCompletion,
} from "./execute.js";
import {
  isChildTraversalPreparationPort,
  type ChildTraversalPreparationPort,
} from "./child_traversal.js";
import {
  advanceStructuralTraversal,
  type StructuralTraversalResult,
} from "./structural_execute.js";
import { traverse, traverseFromCursor } from "./traversal.js";

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
  readonly leafPort: LeafInvocationPort;
  readonly childTraversalPreparationPort?: ChildTraversalPreparationPort;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly terminalMode?: "close_run" | "return_to_parent";
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
  if (stop.kind === "traversal_refusal") {
    return fail(
      input,
      "initial-traversal-refusal",
      `diagnostic://abiogenesis/hog/${stop.code}@5`,
      stop as unknown as JsonValue,
    );
  }
  const initialCursor = stop.kind === "traversal_stop_ref" ? stop.cursor : stop.sourceCursor;
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

  let currentInput = input.input;
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
      const openedParent = openWorkflowCCall(
        input.store,
        input.executionBasis,
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
      const prepared = await input.childTraversalPreparationPort.prepare({
        parentExecutionBasis: input.executionBasis,
        parentTraversalScope: input.openedTraversalScope,
        parentCCallRef: openedParent.cCall.cCallRef,
        childGraphFunctionRef: directStep.graphFunctionRef,
        inputRef: workflowStep.sourceCursor.inputRef,
        inputDigest: workflowStep.sourceCursor.inputDigest,
        input: currentInput,
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
        const outputValueKind = input.leafPort.contractValueKind(
          directStep.outputCarrierRef,
          "output",
        );
        const judgmentRelation = input.leafPort.resolveJudgmentRelation(
          openedParent.cCall.judgmentPredicateRef,
        );
        if (outputValueKind === null || judgmentRelation === null) {
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
          failureValueKind: input.executionBasis.refusalValueKind,
          validateSuccessResult: (value): value is Readonly<Record<string, JsonValue>> =>
            input.leafPort.validateContractValue(
              directStep.outputCarrierRef,
              "output",
              value,
            ) && judgmentRelation.evaluate(currentInput, value),
          closureContract: input.closureContract,
          judgmentRelation,
          clock: {
            eventTime: input.eventTime,
            correlationId: `${input.correlationId}/workflow/${leafOrdinal}/foldback`,
          },
        });
      }
    } else {
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
        closureContract: input.closureContract,
        actorRuntimeBinding: input.actorRuntimeBinding,
        terminalMode: input.terminalMode ?? "close_run",
        clock: {
          eventTime: input.eventTime,
          correlationId: `${input.correlationId}/leaf/${leafOrdinal}`,
        },
      });
    }
    if (completion.disposition !== "advanced") break;
    if (
      completion.nextCursor === null ||
      completionValueKind === null ||
      completionContractRef === null ||
      !input.leafPort.validateContractValue(
        completionContractRef,
        "output",
        completion.resultValue,
      )
    ) {
      return fail(
        input,
        `advanced-result-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5",
        { leafOrdinal, completionDisposition: completion.disposition },
      );
    }
    currentInput = completion.resultValue;
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
