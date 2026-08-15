import * as Abg from "../abg/index.js";
import type {
  AbgEventStore,
  AdmittedImplementationSet,
  CCall,
  ExecutionBasis,
  OpenedTraversalScope,
  RuntimeAdmissionBasis,
} from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type {
  ClosureContract,
  FanOutApplication,
  GraphFunction,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  prepareChildTraversal,
  type ChildTraversalBasis,
  type PreparedChildTraversal,
} from "./child_traversal.js";
import { proposeJudgmentCandidate } from "./judgment.js";
import {
  admissionBasis,
  runtimePrefixAtDurable,
  type ExecutionClock,
} from "./operator_support.js";
import * as Routes from "./route_proposal.js";
import {
  applyAdmittedRoute,
  deriveCompletedTraversalCursor,
  resolveTraversalTerm,
  type TraversalCursor,
} from "./traversal.js";
import {
  projectCCallCompletion,
} from "./ccall_lifecycle.js";
import {
  projectExecutableTraversalCompletion as completion,
  type ExecutableTraversalCompletion,
  type HeldWorkflowSuspension,
} from "./traversal_completion.js";
import { failTraversal } from "./traversal_failure.js";
import {
  deriveGraphFunctionActionEvaluationBasis,
  rehydrateConstructionIntentForCursorAtDurablePrefix,
} from "../abg/index.js";
import { deriveCSourceContinuation } from "../gtl/source_path.js";

export interface WorkflowLocusAuthority {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly childTraversalBasis: ChildTraversalBasis;
  readonly closureContract: Readonly<ClosureContract>;
  readonly deferFailedRunStop?: boolean;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly scopeClass: "root" | "child";
}

export interface TraversalLocusEvaluation {
  readonly completion: ExecutableTraversalCompletion;
  readonly outputValueKind: string | null;
  readonly outputContractRef: string | null;
}

export type WorkflowTerm = Extract<
  ReturnType<typeof resolveTraversalTerm>,
  Readonly<{ kind: "c_workflow" }>
>;

export interface WorkflowChildFoldFrame {
  readonly kind: "workflow_child_fold_frame";
  readonly authority: WorkflowLocusAuthority;
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

type WorkflowParentContext = Omit<
  WorkflowChildFoldFrame,
  | "childExecutionBasis"
  | "childTraversalScope"
  | "childInput"
  | "childInputDigest"
  | "foldbackCorrelationId"
>;

export type WorkflowLocusStep =
  | Readonly<{ kind: "locus_evaluation"; evaluation: TraversalLocusEvaluation }>
  | Readonly<{
      kind: "workflow_child_request";
      frame: WorkflowChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
      deferFailedRunStop: boolean;
    }>;

function isJsonRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function failWorkflow(
  context: Readonly<{
    authority: WorkflowLocusAuthority;
    ordinal: number;
  }>,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  const runtime = context.authority;
  return failTraversal({
    store: runtime.store,
    predecessorPrefix,
    executionBasis: runtime.executionBasis,
    openedTraversalScope: runtime.openedTraversalScope,
    eventTime: runtime.eventTime,
    correlationId: runtime.correlationId,
    stage,
    diagnosticRef,
    candidate,
  });
}

function workflowBasis(
  context: WorkflowParentContext,
  stage: string,
): RuntimeAdmissionBasis {
  return admissionBasis(
    {
      eventTime: context.authority.eventTime,
      correlationId:
        `${context.authority.correlationId}/workflow/${context.ordinal}`,
    },
    stage,
  );
}

function workflowFailure(
  context: WorkflowParentContext,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  const { authority: runtime } = context;
  const admitted = Abg.admitRuntimeFailure({
    store: runtime.store,
    predecessorPrefix,
    executionBasis: runtime.executionBasis,
    scope: runtime.openedTraversalScope,
    stage: "hog_traversal",
    subject: { stage, candidate },
    diagnosticRef,
    basis: workflowBasis(context, stage),
  });
  return completion(
    "failed",
    admitted.replayState,
    admitted.successorPrefix,
    { cCallRef: context.parentCCall.cCallRef, diagnosticRef },
  );
}

function completeBlockedWorkflowOutcome(
  context: WorkflowParentContext,
  outcome: Abg.BlockedCCallOutcomeReceipt,
  stage: string,
): ExecutableTraversalCompletion {
  const { authority: runtime } = context;
  const candidate = Routes.proposeCCallOutcomeTransition({
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    sourceCursor: context.cursor,
    targetCursor: null,
    outcome,
    terminalizeNonAdvance: runtime.scopeClass === "root",
  });
  if (candidate.kind !== "traversal_transition_candidate") {
    return workflowFailure(
      context,
      outcome.successorPrefix,
      `${stage}-route-proposal`,
      `diagnostic://abiogenesis/hog/${candidate.code}@5`,
      candidate as unknown as JsonValue,
    );
  }
  const admitted = Abg.admitCCallCompletion({
    store: runtime.store,
    predecessorPrefix: outcome.successorPrefix,
    executionBasis: runtime.executionBasis,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    source: context.cursor,
    target: null,
    outcome,
    candidate,
    openedTraversalScope: runtime.openedTraversalScope,
    closureContract: runtime.closureContract,
    basis: workflowBasis(context, `${stage}-completion`),
  });
  return admitted.kind === "c_call_completion_admission"
    ? projectCCallCompletion(
        context.cursor,
        admitted,
        null,
      )
    : workflowFailure(
        context,
        outcome.successorPrefix,
        `${stage}-completion`,
        `diagnostic://abiogenesis/hog/${admitted.code}@5`,
        admitted as unknown as JsonValue,
      );
}

function rejectWorkflowAdmission(
  context: WorkflowParentContext,
  rejection: Abg.CCallAdmissionRejection,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
): ExecutableTraversalCompletion {
  const { authority: runtime } = context;
  return completeBlockedWorkflowOutcome(
    context,
    Abg.admitCCallRejection({
      store: runtime.store,
      predecessorPrefix,
      graph: runtime.graph,
      graphFunction: runtime.graphFunction,
      cursor: context.cursor,
      cCall: context.parentCCall,
      rejection,
      basis: workflowBasis(context, `${stage}-rejection`),
    }),
    stage,
  );
}

export function beginWorkflowLocus(input: Readonly<{
  authority: WorkflowLocusAuthority;
  cursor: TraversalCursor;
  value: Readonly<Record<string, JsonValue>>;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  ordinal: number;
}>): WorkflowLocusStep {
    const { authority: runtime, cursor, ordinal } = input;
    const term = resolveTraversalTerm(runtime.graph, cursor);
    if (term.kind !== "c_workflow") {
      return failWorkflow(input,
        runtime.predecessorPrefix,
        `workflow-step-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
        term as unknown as JsonValue,
      );
    }
    const failureContracts = [
      ...new Set(runtime.implementationSet.rows
        .filter((row) => row.graphFunctionRef === term.graphFunctionRef)
        .map((row) => row.failureContractRef)),
    ];
    if (failureContracts.length !== 1) {
      return failWorkflow(input,
        runtime.predecessorPrefix,
        `workflow-contract-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-failure-contract-ambiguous@5",
        failureContracts as unknown as JsonValue,
      );
    }
    const opened = Abg.openCCall({
      locusClass: "workflow",
      store: runtime.store,
      predecessorPrefix: runtime.predecessorPrefix,
      executionBasis: runtime.executionBasis,
      implementationSet: runtime.implementationSet,
      scope: runtime.openedTraversalScope,
      program: runtime.program,
      graphFunction: runtime.graphFunction,
      graph: runtime.graph,
      proposal: {
        kind: "workflow_c_call_proposal",
        schemaVersion: "5.0.0",
        cursor,
        traversalScopeRef: runtime.openedTraversalScope.scopeRef,
        runId: runtime.openedTraversalScope.runId,
        graphCallId: runtime.openedTraversalScope.graphCallId,
        frameId: runtime.openedTraversalScope.frameId,
        childGraphFunctionRef: term.graphFunctionRef,
        inputContractRef: term.inputCarrierRef,
        outputContractRef: term.outputCarrierRef,
        failureContractRef: failureContracts[0]!,
        judgmentPredicateRef:
          runtime.graphFunction.declarations["abg.judgment_predicate"] ?? "",
      },
      basis: admissionBasis(
        {
          eventTime: runtime.eventTime,
          correlationId: `${runtime.correlationId}/workflow/${ordinal}`,
        },
        "parent",
      ),
    });
    if (opened.kind !== "c_call_admission") {
      return failWorkflow(input,
        runtime.predecessorPrefix,
        `workflow-parent-${ordinal}`,
        `diagnostic://abiogenesis/hog/${opened.code}@5`,
        opened as unknown as JsonValue,
      );
    }
    const context: WorkflowParentContext = {
      kind: "workflow_child_fold_frame",
      authority: runtime,
      cursor,
      value: input.value,
      graphEntryInput: input.graphEntryInput,
      graphEntryInputDigest: input.graphEntryInputDigest,
      ordinal,
      workflowTerm: term,
      parentCCall: opened.cCall,
      application: fanOutApplicationForBatch(runtime.graph, opened.cCall.batchRef),
    };
    const intent = rehydrateConstructionIntentForCursorAtDurablePrefix(
      opened.successorPrefix,
      cursor,
    );
    const selectedValue = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInput
      : input.value;
    const selectedRef = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInputRef
      : cursor.inputRef;
    const selectedDigest = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInputDigest
      : cursor.inputDigest;
    if (
      selectedValue === null || selectedRef === null || selectedDigest === null ||
      sha256Canonical(selectedValue) !== selectedDigest ||
      (intent?.actionKind === "invoke_graph_function" &&
        (intent.selectedGraphFunctionRef !== term.graphFunctionRef ||
          intent.targetProgramLocusRef !== term.graphFunctionRef))
    ) {
      return failWorkflow(input,
        opened.successorPrefix,
        `workflow-input-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-selected-input-mismatch@5",
        term as unknown as JsonValue,
      );
    }
    const prepared = prepareChildTraversal(
      runtime.store,
      runtime.childTraversalBasis,
      {
      predecessorPrefix: opened.successorPrefix,
      parentExecutionBasis: runtime.executionBasis,
      parentTraversalScope: runtime.openedTraversalScope,
      parentCCallRef: opened.cCall.cCallRef,
      childGraphFunctionRef: term.graphFunctionRef,
      inputRef: selectedRef,
      inputDigest: selectedDigest,
      input: selectedValue,
      eventTime: runtime.eventTime,
      correlationId: `${runtime.correlationId}/workflow/${ordinal}/prepare`,
      },
    );
    if (prepared.kind !== "prepared_child_traversal") {
      const admission = Abg.admitChildPreparationRefusal({
        relationClass: "workflow",
        store: runtime.store,
        predecessorPrefix: prepared.successorPrefix,
        graph: runtime.graph,
        graphFunction: runtime.graphFunction,
        cursor,
        parentCCall: opened.cCall,
        candidate: {
          kind: "child_preparation_refusal_candidate",
          schemaVersion: "5.0.0",
          childGraphFunctionRef: term.graphFunctionRef,
          inputRef: selectedRef,
          inputDigest: selectedDigest,
          stage: prepared.stage,
          diagnosticRef: prepared.diagnosticRef,
          message: prepared.message,
        },
        basis: workflowBasis(context, "preparation-refusal"),
      });
      return {
        kind: "locus_evaluation",
        evaluation: {
          completion: admission.kind === "child_preparation_refusal_admission"
            ? rejectWorkflowAdmission(
                context,
                admission.admissionRejection,
                admission.successorPrefix,
                "preparation",
              )
            : workflowFailure(
                context,
                prepared.successorPrefix,
                "preparation-refusal-admission",
                `diagnostic://abiogenesis/hog/${admission.code}@5`,
                admission as unknown as JsonValue,
              ),
          outputValueKind: null,
          outputContractRef: null,
        },
      };
    }
    return {
      kind: "workflow_child_request",
      frame: {
        ...context,
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
        context.application?.elementGraphFunctionRef === term.graphFunctionRef,
    };
}

export function completeWorkflowLocus(
  frame: WorkflowChildFoldFrame,
  child: ExecutableTraversalCompletion,
): TraversalLocusEvaluation {
  const {
    authority: runtime,
    cursor,
    workflowTerm,
    parentCCall,
    ordinal,
  } = frame;
  if (child.disposition === "held") {
    if (
      child.continuationRef === null || child.heldInteraction === null ||
      child.heldGraph === null || child.heldClosureContract === null ||
      frame.childExecutionBasis.parentExecutionBasisRef !==
        runtime.executionBasis.basisRef ||
      frame.childTraversalScope.executionBasisRef !==
        frame.childExecutionBasis.basisRef ||
      sha256Canonical(frame.childInput) !== frame.childInputDigest
    ) {
      return failWorkflow(frame,
        child.successorPrefix,
        `workflow-hold-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-hold-lineage-mismatch@5",
        child as unknown as JsonValue,
      );
    }
    const suspension: HeldWorkflowSuspension = deepFreeze({
      kind: "held_workflow_suspension",
      schemaVersion: "5.0.0",
      parentExecutionBasisRef: runtime.executionBasis.basisRef,
      parentTraversalScope: runtime.openedTraversalScope,
      parentGraph: runtime.graph,
      parentClosureContract: runtime.closureContract,
      parentCCall,
      application: frame.application,
      sourceCursor: cursor,
      parentGraphInput: frame.graphEntryInput,
      parentGraphInputDigest: frame.graphEntryInputDigest,
      parentInput: frame.value,
      parentInputDigest: cursor.inputDigest,
      childExecutionBasisRef: frame.childExecutionBasis.basisRef,
      childTraversalScopeRef: frame.childTraversalScope.scopeRef,
      childInput: frame.childInput,
      childInputDigest: frame.childInputDigest,
      terminalMode: runtime.scopeClass === "root"
        ? "close_run"
        : "return_to_parent",
    });
    return {
      completion: deepFreeze({
        ...child,
        parentSuspensions: [...child.parentSuspensions, suspension],
      }),
      outputValueKind: null,
      outputContractRef: null,
    };
  }
  if (child.disposition === "failed" && child.replayState.runtimeStatus === "failed") {
    return { completion: child, outputValueKind: null, outputContractRef: null };
  }
  const failedFanOutTask = child.disposition === "failed" && frame.application !== null;
  if (
    child.resultRef === null || child.judgmentRef === null ||
    child.resultValue === null ||
    (!failedFanOutTask && child.disposition !== "closed" &&
      child.disposition !== "blocked")
  ) {
    return {
      completion: workflowFailure(
        frame,
        child.successorPrefix,
        "child-completion",
        "diagnostic://abiogenesis/hog/child-completion-incomplete@5",
        child as unknown as JsonValue,
      ),
      outputValueKind: null,
      outputContractRef: null,
    };
  }
  const outputKind = runtime.leafPort.contractValueKind(
    workflowTerm.outputCarrierRef,
    "output",
  );
  const failureKind = runtime.leafPort.contractValueKind(
    parentCCall.failureContractRef,
    "failure",
  );
  if (outputKind === null || failureKind === null) {
    return failWorkflow(frame,
      child.successorPrefix,
      `workflow-contract-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-result-contract-absent@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  const intent = rehydrateConstructionIntentForCursorAtDurablePrefix(
    child.successorPrefix,
    cursor,
  );
  const actionValue = intent?.actionKind === "invoke_graph_function" &&
      child.disposition === "closed" && child.closureRef !== null &&
      isJsonRecord(child.resultValue)
    ? deriveGraphFunctionActionEvaluationBasis(
        child.successorPrefix,
        runtime.executionBasis,
        cursor,
        {
          childGraphFunctionRef: workflowTerm.graphFunctionRef,
          childResultRef: child.resultRef,
          childResultValue: child.resultValue,
          childJudgmentRef: child.judgmentRef,
          childClosureRef: child.closureRef,
        },
      )
    : null;
  if (intent?.actionKind === "invoke_graph_function" &&
      child.disposition === "closed" && actionValue === null) {
    return failWorkflow(frame,
      child.successorPrefix,
      `workflow-action-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-action-evaluation-basis-absent@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  const foldback = Abg.admitChildFoldback({
    relationClass: "workflow",
    store: runtime.store,
    predecessorPrefix: child.successorPrefix,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    cursor,
    parentCCall,
    childExecutionBasis: frame.childExecutionBasis,
    childScope: frame.childTraversalScope,
    child: {
      childResultRef: child.resultRef,
      childJudgmentRef: child.judgmentRef,
      childClosureRef: child.closureRef,
    },
    basis: workflowBasis(frame, "child-foldback"),
  });
  if (foldback.kind !== "child_foldback_admission") {
    return {
      completion: workflowFailure(
        frame,
        child.successorPrefix,
        "child-foldback",
        `diagnostic://abiogenesis/hog/${foldback.code}@5`,
        foldback as unknown as JsonValue,
      ),
      outputValueKind: null,
      outputContractRef: null,
    };
  }
  const childSucceeded = child.disposition === "closed";
  const childValue = childSucceeded ? actionValue ?? child.resultValue : child.resultValue;
  if (!isJsonRecord(childValue)) {
    return failWorkflow(frame,
      foldback.successorPrefix,
      `workflow-result-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-result-carrier-mismatch@5",
      childValue,
    );
  }
  const failureDiagnosticRef = child.diagnosticRef ??
    "diagnostic://abiogenesis/hog/child-traversal-blocked@5";
  const resultOutcome = Abg.admitCCallResult({
    outcomeClass: "workflow",
    resultDisposition: childSucceeded ? "success" : "failure",
    ...(childSucceeded ? {} : { failureDiagnosticRef }),
    store: runtime.store,
    predecessorPrefix: foldback.successorPrefix,
    executionBasis: runtime.executionBasis,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    cursor,
    cCall: parentCCall,
    leafPort: runtime.leafPort,
    input: frame.value,
    inputDigest: cursor.inputDigest,
    outputValueKind: outputKind,
    failureValueKind: failureKind,
    resultCandidate: childValue,
    foldback,
    basis: workflowBasis(frame, "result"),
  } as Abg.AdmitCCallResultInput);
  if (resultOutcome.disposition === "retry") {
    return failWorkflow(frame,
      resultOutcome.successorPrefix,
      `workflow-outcome-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-retry-outcome-invalid@5",
      resultOutcome as unknown as JsonValue,
    );
  }
  if (resultOutcome.disposition === "blocked") {
    return {
      completion: completeBlockedWorkflowOutcome(
        frame,
        resultOutcome,
        "result-rejection",
      ),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  const judgmentRelation = runtime.leafPort.resolveJudgmentRelation(
    parentCCall.judgmentPredicateRef,
  );
  if (judgmentRelation === null) {
    return failWorkflow(frame,
      resultOutcome.successorPrefix,
      `workflow-judgment-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-judgment-relation-absent@5",
      parentCCall as unknown as JsonValue,
    );
  }
  const judgmentCandidate = proposeJudgmentCandidate({
    cCall: parentCCall,
    result: resultOutcome.result,
    replayState: resultOutcome.replayState,
    contractRef: parentCCall.judgmentContractRef,
    decision: childSucceeded
      ? {
          decisionClass: "evaluate",
          input: frame.value,
          relation: judgmentRelation,
        }
      : {
          decisionClass: "refuse",
          predicateRef: parentCCall.judgmentPredicateRef,
          reasonRef: failureDiagnosticRef,
        },
  });
  const outcome = Abg.admitCCallJudgment({
    store: runtime.store,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    cursor,
    outcome: resultOutcome,
    candidate: judgmentCandidate,
    basis: workflowBasis(frame, "judgment"),
  });
  if (outcome.disposition === "blocked") {
    return {
      completion: completeBlockedWorkflowOutcome(
        frame,
        outcome,
        "judgment-rejection",
      ),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  const { result, judgment } = outcome.admitted;
  const fanOut = frame.application;
  if (fanOut === null) {
    let target: TraversalCursor | null = null;
    if (result.resultClass === "success" && judgment.judgment === "advance") {
      const derived = deriveCompletedTraversalCursor(runtime.graph, cursor, {
        inputRef: result.resultRef,
        inputDigest: result.valueDigest,
      });
      if (derived?.kind === "traversal_refusal") {
        return failWorkflow(frame,
          outcome.successorPrefix,
          `workflow-continuation-${ordinal}`,
          `diagnostic://abiogenesis/hog/${derived.code}@5`,
          derived as unknown as JsonValue,
        );
      }
      target = derived;
    }
    const candidate = Routes.proposeCCallOutcomeTransition({
      graph: runtime.graph,
      graphFunction: runtime.graphFunction,
      sourceCursor: cursor,
      targetCursor: target,
      outcome,
      terminalizeNonAdvance: runtime.scopeClass === "root",
    });
    if (candidate.kind !== "traversal_transition_candidate") {
      return failWorkflow(frame,
        outcome.successorPrefix,
        `workflow-route-${ordinal}`,
        `diagnostic://abiogenesis/hog/${candidate.code}@5`,
        candidate as unknown as JsonValue,
      );
    }
    const admitted = Abg.admitCCallCompletion({
      store: runtime.store,
      predecessorPrefix: outcome.successorPrefix,
      executionBasis: runtime.executionBasis,
      graph: runtime.graph,
      graphFunction: runtime.graphFunction,
      source: cursor,
      target,
      outcome,
      candidate,
      openedTraversalScope: runtime.openedTraversalScope,
      closureContract: runtime.closureContract,
      basis: workflowBasis(frame, "completion"),
    });
    if (admitted.kind !== "c_call_completion_admission") {
      return failWorkflow(frame,
        outcome.successorPrefix,
        `workflow-completion-${ordinal}`,
        `diagnostic://abiogenesis/hog/${admitted.code}@5`,
        admitted as unknown as JsonValue,
      );
    }
    return {
      completion: projectCCallCompletion(
        cursor,
        admitted,
        target,
      ),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  const sourceContinuation = deriveCSourceContinuation(
    runtime.graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  const completeVector = judgment.judgment === "advance" &&
    sourceContinuation.kind === "c_source_continuation" &&
    sourceContinuation.disposition === "advance" &&
    sourceContinuation.relation === "compose_next";
  const fanOutCompletion = Abg.admitFanOutCompletion({
    store: runtime.store,
    predecessorPrefix: outcome.successorPrefix,
    executionBasis: runtime.executionBasis,
    graph: runtime.graph,
    application: fanOut,
    sourceCursor: cursor,
    replayState: outcome.replayState,
    completionKind: completeVector ? "complete_vector" : "partial_stop",
    validateOutputVector: (value): value is Readonly<Record<string, JsonValue>> =>
      runtime.leafPort.validateContractValue(
        fanOut.outputVectorRef,
        "output",
        value,
      ),
    basis: workflowBasis(frame, "fan-out-completion"),
  });
  if (fanOutCompletion.kind !== "fan_out_completion_receipt") {
    return failWorkflow(frame,
      outcome.successorPrefix,
      `fan-out-${ordinal}`,
      `diagnostic://abiogenesis/hog/${fanOutCompletion.code}@5`,
      fanOutCompletion as unknown as JsonValue,
    );
  }
  const fanOutAdmission = fanOutCompletion.admission;
  let target: TraversalCursor | null = null;
  if (fanOutAdmission.completionKind === "complete_vector") {
    const derived = deriveCompletedTraversalCursor(runtime.graph, cursor, {
      inputRef: fanOutAdmission.outputVectorRef,
      inputDigest: fanOutAdmission.outputVectorDigest,
    });
    if (derived?.kind === "traversal_refusal") {
      return failWorkflow(frame,
        fanOutCompletion.successorPrefix,
        `fan-out-continuation-${ordinal}`,
        `diagnostic://abiogenesis/hog/${derived.code}@5`,
        derived as unknown as JsonValue,
      );
    }
    target = derived;
  }
  const fanOutReplay = Abg.projectRuntimeTruthAtDurablePrefix(
    fanOutCompletion.successorPrefix,
    runtime.openedTraversalScope.runId,
  ).replayState;
  const route = Routes.proposeFanOutRoute(
    runtime.graph,
    fanOut,
    cursor,
    target,
    parentCCall,
    fanOutAdmission,
    fanOutReplay,
    parentCCall.transitionContractRef,
  );
  if (route.kind !== "traversal_route_candidate") {
    return failWorkflow(frame,
      fanOutCompletion.successorPrefix,
      `fan-out-route-${ordinal}`,
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  const candidate = Abg.completeTraversalTransitionCandidate({
    kind: "traversal_transition_candidate",
    schemaVersion: "5.0.0",
    transitionClass: "route",
    route,
    evidence: {
      evidenceClass: "fan_out",
      graphFunction: runtime.graphFunction,
      cCall: parentCCall,
      result,
      judgment,
      application: fanOut,
      completion: fanOutAdmission,
      completedProgresses: [],
    },
    terminalizeRun: route.routeKind !== "advance" &&
      runtime.scopeClass === "root",
  });
  const admitted = Abg.admitCCallCompletion({
    store: runtime.store,
    predecessorPrefix: fanOutCompletion.successorPrefix,
    executionBasis: runtime.executionBasis,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    source: cursor,
    target,
    outcome,
    candidate,
    openedTraversalScope: runtime.openedTraversalScope,
    closureContract: runtime.closureContract,
    basis: workflowBasis(frame, "fan-out-completion-route"),
  });
  if (admitted.kind !== "c_call_completion_admission") {
    return failWorkflow(frame,
      fanOutCompletion.successorPrefix,
      `fan-out-route-${ordinal}`,
      `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted as unknown as JsonValue,
    );
  }
  if (admitted.disposition === "advanced") {
    if (fanOutAdmission.completionKind !== "complete_vector" || target === null) {
      return failWorkflow(frame,
        admitted.transition.successorPrefix,
        `fan-out-route-${ordinal}`,
        "diagnostic://abiogenesis/hog/fan-out-advance-without-vector@5",
        admitted as unknown as JsonValue,
      );
    }
    const nextCursor = applyAdmittedRoute(
      runtimePrefixAtDurable(
        admitted.transition.successorPrefix,
        cursor.runId,
      ),
      cursor,
      target,
      "advance",
      admitted.transition.route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      return failWorkflow(frame,
        admitted.transition.successorPrefix,
        `workflow-route-${ordinal}`,
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        nextCursor as unknown as JsonValue,
      );
    }
    return {
      completion: completion(
        "advanced",
        admitted.transition.replayState,
        admitted.transition.successorPrefix,
        {
        cCallRef: parentCCall.cCallRef,
        resultRef: fanOutAdmission.outputVectorRef,
        judgmentRef: judgment.judgmentRef,
        nextCursor,
        resultValue: fanOutAdmission.outputVector,
        continuationKind: "advance",
        nextInputContractRef: fanOutAdmission.outputVectorContractRef,
        },
      ),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  return {
    completion: projectCCallCompletion(
      cursor,
      admitted,
      target,
    ),
    outputValueKind: outputKind,
    outputContractRef: workflowTerm.outputCarrierRef,
  };
}
