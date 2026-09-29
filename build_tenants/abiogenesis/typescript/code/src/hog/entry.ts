import {
  admitInitialTraversalCursor,
  hasAdmittedTraversalCursorAtPrefix,
  isExecutionBasis,
  isTraversalCursorCandidate,
  projectOpenedTraversalScopeClassAtDurablePrefix,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type AdmittedImplementationSet,
  type AdmittedInteractionSet,
  type ContinuationProductBasis,
  type ExecutionBasis,
  type OpenedTraversalScope,
} from "../abg/index.js";
import {
  assertHeldEventStoreAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import * as AbgRetry from "../abg/retry.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  ClosureContract,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import { validateGraph } from "../validator/graph.js";
import type { ChildTraversalBasis } from "./child_traversal.js";
import { isAdmittedLeafInvocationPort } from
  "../implementation/leaf_invocation_port.js";
import type {
  ExecuteGraphTraversalCommonInput,
  ExecuteGraphTraversalInput,
  InitialOrNonRetryExecuteGraphTraversalInput,
  GraphTraversalEntryRefusal,
  InteractionResumeTraversalEntryInput,
} from "./traversal_contract.js";
import type { MachineEvaluationFrame } from "./evaluation_frame.js";
import {
  canonicalDigest,
  materializedInputAtCursor,
  runtimePrefixAtDurable,
  sameCanonical,
  traversalBasis,
} from "./operator_support.js";
import {
  resolveTraversalTerm,
  traverse,
  traverseFromCursor,
  type TraversalCursor,
  type TraverseResult,
} from "./traversal.js";
import {
  failTraversal,
  refuseTraversalEntry,
} from "./traversal_failure.js";

export function prepareInteractionResumeTraversalEntry(
  input: InteractionResumeTraversalEntryInput,
): InitialOrNonRetryExecuteGraphTraversalInput | GraphTraversalEntryRefusal {
  const graphFunction = input.leafPort.graphFunctionByRef(
    input.graph.graphFunctionRef,
  );
  if (graphFunction === null) {
    return refuseTraversalEntry({
      code: "owner_refusal",
      message:
        "continued run could not reproduce an admitted Graph boundary",
      diagnosticRef:
        "diagnostic://abiogenesis/hog/resume-entry-graph-function@5",
      candidate: { graphFunctionRef: input.graph.graphFunctionRef },
    });
  }
  const graphValidation = validateGraph(
    input.graph,
    input.programValidation,
    graphFunction,
    {
      invocationAdmissionRef: input.graph.invocationAdmissionRef,
      admittedInputRef: input.graph.admittedInputRef,
      admittedInputDigest: input.graph.admittedInputDigest,
      admittedInput: input.graphInput,
    },
  );
  if (
    graphValidation.kind !== "graph_validation" ||
    graphValidation.validationRef !== input.executionBasis.graphValidationRef ||
    input.executionBasis.graphRef !== input.graph.materializationRef ||
    input.executionBasis.graphDigest !== input.graph.materializationDigest ||
    input.executionBasis.closureContractRef !==
      input.closureContract.closureContractRef ||
    sha256Canonical(input.graphInput as JsonValue) !==
      input.graph.admittedInputDigest
  ) {
    return refuseTraversalEntry({
      code: "owner_refusal",
      message:
        "continued run could not reproduce an admitted Graph boundary",
      diagnosticRef:
        "diagnostic://abiogenesis/hog/resume-entry-graph-mismatch@5",
      candidate: { graphRef: input.graph.materializationRef },
    });
  }
  return deepFreeze({
    store: input.store,
    predecessorPrefix: input.predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    program: input.program,
    ...(input.programPublication === undefined ? {} : { programPublication: input.programPublication }),
    graphFunction,
    graph: input.graph,
    graphValidation,
    programValidation: input.programValidation,
    implementationSet: input.implementationSet,
    interactionSet: input.interactionSet,
    continuationProductBasis: {
      ...input.continuationProductBasis,
      programValidation: input.programValidation,
      graphValidation,
    },
    leafPort: input.leafPort,
    closureContract: input.closureContract,
    actorRuntimeBinding: input.actorRuntimeBinding,
    input: input.graphInput,
    inputDigest: input.graph.admittedInputDigest,
    eventTime: input.eventTime,
    correlationId: input.correlationId,
  });
}

function failEntry(
  input: ExecuteGraphTraversalCommonInput,
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
    eventTime: input.eventTime,
    correlationId: input.correlationId,
    stage,
    diagnosticRef,
    candidate,
  });
}

export function enterTraversal(
  input: ExecuteGraphTraversalInput,
): MachineEvaluationFrame {
  let projectedRetryResume: AbgRetry.ProjectedRetryResumeSuccess | null = null;
  if (Object.hasOwn(input, "projectedRetryResume")) {
    const candidate = (input as unknown as Readonly<Record<string, unknown>>)
      .projectedRetryResume;
    if (
      Object.hasOwn(input, "input") ||
      Object.hasOwn(input, "inputDigest") ||
      Object.hasOwn(input, "resume") ||
      !AbgRetry.isProjectedRetryResumeCarrier(candidate)
    ) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
      );
    }
    if (!sameCanonical(input.predecessorPrefix, candidate.successorPrefix)) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-prefix-mismatch@5",
      );
    }
    projectedRetryResume = candidate;
  }
  const scopeClass = projectOpenedTraversalScopeClassAtDurablePrefix(
    input.predecessorPrefix,
    input.openedTraversalScope,
  );
  if (scopeClass === null) {
    return failEntry(
      input,
      input.predecessorPrefix,
      "scope-class",
      "diagnostic://abiogenesis/hog/scope-class-absent@5",
      { scopeRef: input.openedTraversalScope.scopeRef },
    );
  }
  const projectedBranch = projectedRetryResume !== null;
  const initialInput = projectedBranch
    ? null
    : input as InitialOrNonRetryExecuteGraphTraversalInput;
  if (
    initialInput !== null &&
    (
      !isExecutionBasis(input.executionBasis) ||
      input.graph.admittedInputRef !==
        input.executionBasis.rawInputAdmissionRef ||
      input.graph.admittedInputDigest !== input.executionBasis.rawInputDigest ||
      input.graphValidation.admittedInputRef !==
        input.executionBasis.rawInputAdmissionRef ||
      input.graphValidation.admittedInputDigest !==
        input.executionBasis.rawInputDigest ||
      initialInput.inputDigest !== input.executionBasis.rawInputDigest ||
      canonicalDigest(initialInput.input) !== initialInput.inputDigest ||
      canonicalDigest(input.executionBasis.rawInputValue) !==
        input.executionBasis.rawInputDigest ||
      !sameCanonical(initialInput.input, input.executionBasis.rawInputValue)
    )
  ) {
    throw new TypeError(
      "diagnostic://abiogenesis/hog/execution-basis-input-mismatch@5",
    );
  }
  let projectedStop: TraverseResult | null = null;
  let projectedInput: Readonly<Record<string, JsonValue>> | null = null;
  let projectedCursor: TraversalCursor | null = null;
  let projectedExecutionBasis: ExecutionBasis | null = null;
  if (projectedRetryResume !== null) {
    const candidate = projectedRetryResume;
    try {
      assertHeldEventStoreAtDurablePrefix(input.store, candidate.successorPrefix);
    } catch {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-prefix-mismatch@5",
      );
    }
    const reprojected = AbgRetry.projectRetryResumeAtDurablePrefix(
      candidate,
      input.executionBasis,
      input.graph,
      input.graphFunction,
    );
    if (reprojected === null) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-projection-mismatch@5",
      );
    }
    let traversal;
    let targetTerm;
    let materializedTargetInput;
    try {
      traversal = traverseFromCursor(traversalBasis(input), candidate.nextCursor);
      targetTerm = resolveTraversalTerm(input.graph, candidate.nextCursor);
      materializedTargetInput = materializedInputAtCursor(
        input.graph,
        candidate.nextCursor,
      );
    } catch {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-traversal-mismatch@5",
      );
    }
    const traversalCursor = traversal.kind === "traversal_cursor"
      ? traversal
      : traversal.kind === "traversal_stop_ref"
        ? traversal.cursor
        : null;
    if (
      traversalCursor === null ||
      targetTerm.kind === "traversal_refusal" ||
      !sameCanonical(traversalCursor, candidate.nextCursor) ||
      !sameCanonical(reprojected.cursor, candidate.nextCursor) ||
      traversalCursor.inputRef !== candidate.inputRef ||
      traversalCursor.inputDigest !== candidate.inputDigest ||
      targetTerm.inputCarrierRef !== candidate.inputContractRef ||
      sha256Canonical(candidate.inputValue as unknown as JsonValue) !==
        candidate.inputDigest ||
      (
        materializedTargetInput !== null &&
        !sameCanonical(materializedTargetInput.value, candidate.inputValue)
      )
    ) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-traversal-mismatch@5",
      );
    }
    projectedStop = traversal;
    projectedInput = candidate.inputValue;
    projectedCursor = candidate.nextCursor;
    projectedExecutionBasis = reprojected.executionBasis;
  }
  if (
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !==
      input.implementationSet.implementationSetRef ||
    input.leafPort.implementationSetDigest !==
      input.implementationSet.implementationSetDigest
  ) {
    return failEntry(
      input,
      input.predecessorPrefix,
      "leaf-port",
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5",
      { implementationSetRef: input.implementationSet.implementationSetRef },
    );
  }
  let stop: TraverseResult;
  let resumedCursor: TraversalCursor | undefined = projectedCursor ?? undefined;
  let fallbackInput: Readonly<Record<string, JsonValue>>;
  if (projectedStop !== null && projectedInput !== null) {
    stop = projectedStop;
    fallbackInput = projectedInput;
  } else if (initialInput?.resume !== undefined) {
    resumedCursor = initialInput.resume.cursor;
    if (
      !hasAdmittedTraversalCursorAtPrefix(
        runtimePrefixAtDurable(
          input.predecessorPrefix,
          initialInput.resume.cursor.runId,
        ),
        initialInput.resume.cursor,
      ) ||
      initialInput.resume.cursor.executionBasisRef !== input.executionBasis.basisRef ||
      initialInput.resume.cursor.traversalScopeRef !==
        input.openedTraversalScope.scopeRef ||
      initialInput.resume.cursor.graphRef !== input.graph.materializationRef ||
      initialInput.resume.cursor.inputDigest !== initialInput.resume.inputDigest ||
      initialInput.resume.cursor.retryPath.length !== 0 ||
      sha256Canonical(initialInput.resume.input as unknown as JsonValue) !==
        initialInput.resume.inputDigest
    ) {
      return failEntry(
        input,
        input.predecessorPrefix,
        "resume-basis",
        "diagnostic://abiogenesis/hog/resume-basis-mismatch@5",
        {
          cursorRef: initialInput.resume.cursor.cursorRef,
          inputDigest: initialInput.resume.inputDigest,
        },
      );
    }
    stop = traverseFromCursor(traversalBasis(input), initialInput.resume.cursor);
    fallbackInput = initialInput.resume.input;
  } else {
    if (initialInput === null) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
      );
    }
    try {
      stop = traverse(traversalBasis(input));
    } catch {
      return failEntry(
        input,
        input.predecessorPrefix,
        "initial-traversal",
        "diagnostic://abiogenesis/hog/traversal-exception@5",
        { errorClass: "traversal_exception" },
      );
    }
    fallbackInput = initialInput.input;
  }
  const active = stop.kind === "traversal_stop_ref"
    ? stop.cursor
    : stop.kind === "traversal_cursor" && isTraversalCursorCandidate(stop)
      ? stop
      : null;
  const currentInput = materializedInputAtCursor(input.graph, active)?.value ??
    fallbackInput;
  const graphEntryBasis = projectedExecutionBasis ?? input.executionBasis;
  const graphEntryInput = graphEntryBasis.rawInputValue;
  const graphEntryInputDigest = graphEntryBasis.rawInputDigest;
  if (stop.kind === "traversal_refusal") {
    return failEntry(
      input,
      input.predecessorPrefix,
      "initial-traversal-refusal",
      `diagnostic://abiogenesis/hog/${stop.code}@5`,
      stop as unknown as JsonValue,
    );
  }
  const initialCursor = stop.kind === "traversal_stop_ref" ? stop.cursor : stop;
  const commonRuntime: ExecuteGraphTraversalCommonInput = Object.freeze({
    store: input.store,
    predecessorPrefix: input.predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    program: input.program,
    ...(input.programPublication === undefined ? {} : { programPublication: input.programPublication }),
    graphFunction: input.graphFunction,
    graph: input.graph,
    graphValidation: input.graphValidation,
    programValidation: input.programValidation,
    implementationSet: input.implementationSet,
    interactionSet: input.interactionSet,
    ...(input.continuationProductBasis === undefined
      ? {}
      : { continuationProductBasis: input.continuationProductBasis }),
    leafPort: input.leafPort,
    closureContract: input.closureContract,
    actorRuntimeBinding: input.actorRuntimeBinding,
    ...(input.deferFailedRunStop === undefined
      ? {}
      : { deferFailedRunStop: input.deferFailedRunStop }),
    eventTime: input.eventTime,
    correlationId: input.correlationId,
  });
  let activeRuntime = commonRuntime;
  if (resumedCursor === undefined) {
    const cursorAdmission = admitInitialTraversalCursor(
      input.store,
      input.predecessorPrefix,
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
      return failEntry(
        input,
        input.predecessorPrefix,
        "cursor-refusal",
        `diagnostic://abiogenesis/hog/${cursorAdmission.code}@5`,
        cursorAdmission as unknown as JsonValue,
      );
    }
    activeRuntime = Object.freeze({
      ...commonRuntime,
      predecessorPrefix: cursorAdmission.successorPrefix,
    });
  }
  return {
    runtime: activeRuntime,
    scopeClass,
    graphEntryInput,
    graphEntryInputDigest,
    cursor: initialCursor,
    input: currentInput,
    ordinal: 0,
    structuralOrdinal: 0,
  };
}

import { admitConstructionContinuationExecutionBasis } from "../abg/execution_basis.js";
import { admitContinuedTraversalCursor } from "../abg/traversal_cursor.js";
import { openTraversalScope } from "../abg/open_call.js";
import { openCCall } from "../abg/c_call.js";
import type { PreparedConstructionContinuationOperation } from "../abg/construction_continuation.js";
import { admitConstructionContinuationReentry } from "../abg/construction_continuation.js";
import { constructChildTraversalBasis, prepareWorkflowChildTraversalAtCursor } from "./child_traversal.js";
import type { HeldWorkflowSuspension } from "./traversal_completion.js";

/** Recreate only current owned scopes around the conserved original position.
 * All children still enter through the ordinary fixed-workflow owner. */
export function prepareConstructionContinuationTraversal(input: Readonly<{
  store: AbgEventStore; predecessorPrefix: DurablePrefixCoordinate;
  operation: PreparedConstructionContinuationOperation;
  leafPort: LeafInvocationPort;
  continuationProductBasis: InteractionResumeTraversalEntryInput["continuationProductBasis"];
  actorRuntimeBinding: ActorRuntimeBinding;
  eventTime: string; correlationId: string;
}>) {
  const { prepared: source } = input.operation;
  const admissionBasis = { eventTime: input.eventTime, correlationId: input.correlationId, causationEventRefs: [] };
  const root = admitConstructionContinuationExecutionBasis(input.store, input.predecessorPrefix, input.operation, admissionBasis);
  const opened = openTraversalScope(input.store, root.successorPrefix, { kind: "root", executionBasis: root.executionBasis }, admissionBasis);
  if (opened.kind !== "traversal_scope_open_admission") throw new TypeError(`continued root scope: ${opened.code}`);
  const entered = admitContinuedTraversalCursor(input.store, opened.successorPrefix, root.executionBasis, opened.scope,
    source.rootGraph, source.rootValidation, source.parent.cursor, admissionBasis);
  if (entered.kind === "traversal_cursor_admission_refusal") throw new TypeError(`continued root cursor: ${entered.code}`);
  const term = source.parentTerm;
  if (term.kind !== "c_workflow" || source.parentCall.failureContractRef === null || source.parentCall.judgmentPredicateRef === null)
    throw new TypeError("continued parent requires the original exact fixed workflow contract");
  const childClosure = input.leafPort.closureContractByRef(source.child.closureContractRef);
  if (childClosure === null) throw new TypeError("continued child closure unavailable");
  const parent = openCCall({ locusClass: "workflow", store: input.store, predecessorPrefix: entered.admission.successorPrefix,
    executionBasis: root.executionBasis, implementationSet: source.implementationSet, scope: opened.scope,
    program: source.resolution.program, graphFunction: source.resolution.graphFunction, graph: source.rootGraph,
    childGraphFunction: source.childFunction, childClosureContract: childClosure, programValidation: source.resolution.programValidation,
    proposal: { kind: "workflow_c_call_proposal", schemaVersion: "5.0.0", cursor: entered.cursor,
      traversalScopeRef: opened.scope.scopeRef, runId: opened.scope.runId, graphCallId: opened.scope.graphCallId, frameId: opened.scope.frameId,
      childGraphFunctionRef: term.graphFunctionRef, inputContractRef: term.inputCarrierRef, outputContractRef: term.outputCarrierRef,
      failureContractRef: source.parentCall.failureContractRef, judgmentPredicateRef: source.parentCall.judgmentPredicateRef }, basis: admissionBasis });
  if (parent.kind !== "c_call_admission") throw new TypeError(`continued workflow parent: ${parent.code}`);
  const childBasis = constructChildTraversalBasis({ graphFunctionByRef: input.leafPort.graphFunctionByRef,
    closureContractByRef: input.leafPort.closureContractByRef, program: source.resolution.program,
    programPublication: source.resolution.programPublication, programValidation: source.resolution.programValidation,
    rootImplementationSet: source.implementationSet, rootInteractionSet: source.interactionSet });
  const preparation = prepareWorkflowChildTraversalAtCursor(input.store, childBasis, parent.successorPrefix, entered.cursor);
  if (preparation.intent?.constructionIntentRef !== source.intent.constructionIntentRef ||
    preparation.intent.selectedGraphFunctionRef !== term.graphFunctionRef || source.intent.targetInput === null ||
    source.intent.targetInputRef === null || source.intent.targetInputDigest === null)
    throw new TypeError("continued workflow lost original intent/callee/input");
  const child = preparation.prepare({ predecessorPrefix: parent.successorPrefix, parentExecutionBasis: root.executionBasis,
    parentTraversalScope: opened.scope, parentCCallRef: parent.cCall.cCallRef, childGraphFunctionRef: term.graphFunctionRef,
    inputRef: source.intent.targetInputRef, inputDigest: source.intent.targetInputDigest, input: source.intent.targetInput,
    eventTime: input.eventTime, correlationId: input.correlationId });
  if (child.kind !== "prepared_child_traversal") throw new TypeError(`continued workflow child: ${child.stage}`);
  const pending = admitContinuedTraversalCursor(input.store, child.successorPrefix, child.executionBasis,
    child.openedTraversalScope, child.graph, child.graphValidation, source.pending.cursor, admissionBasis);
  if (pending.kind === "traversal_cursor_admission_refusal") throw new TypeError(`continued child cursor: ${pending.code}`);
  const linked = admitConstructionContinuationReentry(input.store, pending.admission.successorPrefix, input.operation,
    root.executionBasis, opened.scope, child.executionBasis, child.openedTraversalScope, parent.cCall, pending.cursor, admissionBasis);
  const suspension: HeldWorkflowSuspension = Object.freeze({ kind: "held_workflow_suspension", schemaVersion: "5.0.0",
    parentExecutionBasisRef: root.executionBasis.basisRef, parentTraversalScope: opened.scope, parentGraph: source.rootGraph,
    parentClosureContract: source.resolution.closureContract, parentCCall: parent.cCall, application: null,
    sourceCursor: entered.cursor, parentGraphInput: source.root.rawInputValue, parentGraphInputDigest: source.root.rawInputDigest,
    parentInput: source.parentInput, parentInputDigest: source.parent.input.inputDigest,
    childExecutionBasisRef: child.executionBasis.basisRef, childTraversalScopeRef: child.openedTraversalScope.scopeRef,
    childInput: child.input, childInputDigest: child.inputDigest, terminalMode: "close_run" });
  const current: InitialOrNonRetryExecuteGraphTraversalInput = Object.freeze({ store: input.store,
    predecessorPrefix: linked.successorPrefix, executionBasis: child.executionBasis, openedTraversalScope: child.openedTraversalScope,
    program: child.program, programPublication: source.resolution.programPublication, graphFunction: child.graphFunction,
    graph: child.graph, graphValidation: child.graphValidation, programValidation: child.programValidation,
    implementationSet: source.implementationSet, interactionSet: source.interactionSet,
    continuationProductBasis: { ...input.continuationProductBasis, graphValidation: child.graphValidation, programValidation: child.programValidation },
    leafPort: input.leafPort, closureContract: child.closureContract, actorRuntimeBinding: input.actorRuntimeBinding,
    input: child.input, inputDigest: child.inputDigest,
    resume: { cursor: pending.cursor, input: source.pendingInput, inputDigest: source.pending.input.inputDigest },
    eventTime: input.eventTime, correlationId: input.correlationId });
  return Object.freeze({ current, parentSuspensions: Object.freeze([suspension]), constructionResume: true as const,
    rootScope: opened.scope, rootBasis: root.executionBasis, continuation: linked.continuation });
}
