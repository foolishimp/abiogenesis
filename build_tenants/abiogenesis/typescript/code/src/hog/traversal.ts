import { isExecutionBasis, type ExecutionBasis } from "../abg/execution_basis.js";
import {
  isOpenedTraversalScope,
  type OpenedTraversalScope,
} from "../abg/open_call.js";
import {
  isAdmittedRoute,
  type AdmittedRoute,
} from "../abg/traversal_route.js";
import type {
  ComputeRegime,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import { isExecutableCLeaf } from "../gtl/c_algebra.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import { resolveEnclosingCBatchRef } from "../gtl/source_path.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isGraphValidation, type GraphValidation } from "../validator/graph.js";
import {
  deriveDirectCContinuationStepFromGraph,
  deriveDirectCRetryStepFromGraph,
  deriveDirectCStepFromGraph,
  resolveCProgramTermAtPath,
  rootCTraversalCoordinate,
  type CTraversalCoordinate,
  type DirectCTraversalStep,
} from "./direct_fold.js";

export interface TraversalCursor {
  readonly kind: "traversal_cursor";
  readonly schemaVersion: "5.0.0";
  readonly cursorRef: string;
  readonly cursorDigest: Sha256Digest;
  readonly programRef: string;
  readonly executionBasisRef: string;
  readonly traversalScopeRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly graphRef: string;
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly currentNodeRef: string;
  readonly position: "at_compute_locus" | "at_term";
  readonly termPath: readonly string[];
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly retryPath: readonly number[];
}

export interface TraversalStep {
  readonly kind: "traversal_step";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "derived";
  readonly stepRef: string;
  readonly stepDigest: Sha256Digest;
  readonly sourceCursor: TraversalCursor;
  readonly targetCursor: TraversalCursor | null;
  readonly directStep: DirectCTraversalStep;
}

export interface TraversalStopRef {
  readonly kind: "traversal_stop_ref";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "at_compute_locus";
  readonly stopRef: string;
  readonly stopDigest: Sha256Digest;
  readonly stopKind: "compute_locus";
  readonly cursor: TraversalCursor;
  readonly traversalScopeRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly nodeRef: string;
  readonly programLocusRef: string;
  readonly edgeRef: string;
  readonly vectorIndex: number;
  readonly judgmentPredicateRef: string;
  readonly stageRole: string;
  readonly batchRef: string | null;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly retryPath: readonly number[];
  readonly computeRegime: ComputeRegime;
  readonly armId: string;
  readonly compositionRef: string | null;
  readonly implementationBindingRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly evidenceContractRef: string;
  readonly failureContractRef: string;
  readonly refusalContractRef: string;
  readonly judgmentContractRef: string;
}

export interface TraversalRefusal {
  readonly kind: "traversal_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "execution_basis_mismatch"
    | "graph_mismatch"
    | "locus_missing"
    | "program_mismatch"
    | "route_mismatch"
    | "scope_not_admitted"
    | "traversal_cursor_mismatch";
  readonly message: string;
}

export interface TraverseInput {
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
}

export type TraverseResult = TraversalStep | TraversalStopRef | TraversalRefusal;

const traversalStops = new WeakSet<object>();
const traversalCursors = new WeakSet<object>();
const traversalSteps = new WeakSet<object>();

export function isTraversalStopRef(value: object): boolean {
  return traversalStops.has(value);
}

export function isTraversalStep(value: object): boolean {
  return traversalSteps.has(value);
}

function refusal(
  code: TraversalRefusal["code"],
  message: string,
): TraversalRefusal {
  return {
    kind: "traversal_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

interface CursorLineage {
  readonly programRef: string;
  readonly executionBasisRef: string;
  readonly traversalScopeRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly graphRef: string;
}

export interface TraversalInputBasis {
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
}

function createCursor(
  lineage: CursorLineage,
  coordinate: CTraversalCoordinate,
  position: TraversalCursor["position"],
  input: TraversalInputBasis,
): TraversalCursor {
  const cursorBody = {
    ...lineage,
    inputRef: input.inputRef,
    inputDigest: input.inputDigest,
    currentNodeRef: coordinate.nodeRef,
    position,
    termPath: [...coordinate.termPath],
    taskOrdinal: coordinate.taskOrdinal,
    attempt: coordinate.attempt,
    retryPath: [...coordinate.retryPath],
  };
  const cursorDigest = sha256Canonical(cursorBody as unknown as JsonValue);
  const cursor = deepFreeze({
    kind: "traversal_cursor" as const,
    schemaVersion: "5.0.0" as const,
    cursorRef: `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...cursorBody,
  }) as TraversalCursor;
  traversalCursors.add(cursor);
  return cursor;
}

function cursorLineage(cursor: TraversalCursor): CursorLineage {
  return {
    programRef: cursor.programRef,
    executionBasisRef: cursor.executionBasisRef,
    traversalScopeRef: cursor.traversalScopeRef,
    runId: cursor.runId,
    graphCallId: cursor.graphCallId,
    frameId: cursor.frameId,
    graphRef: cursor.graphRef,
  };
}

function targetCoordinate(
  step: DirectCTraversalStep,
): CTraversalCoordinate | null {
  switch (step.stepKind) {
    case "continue_term":
    case "enter_term":
    case "retry":
    case "start_task":
      return step.target;
    case "complete_term":
    case "enter_child":
    case "open_leaf":
    case "pass_identity":
      return null;
  }
}

function createTraversalStep(
  sourceCursor: TraversalCursor,
  directStep: DirectCTraversalStep,
  targetInput: TraversalInputBasis = sourceCursor,
): TraversalStep {
  const target = targetCoordinate(directStep);
  const targetCursor = target === null
    ? null
    : createCursor(cursorLineage(sourceCursor), target, "at_term", targetInput);
  const stepBody = {
    sourceCursor,
    targetCursor,
    directStep,
  };
  const stepDigest = sha256Canonical(stepBody as unknown as JsonValue);
  const step = deepFreeze({
    kind: "traversal_step" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "derived" as const,
    stepRef: `traversal-step://abiogenesis/${stepDigest.slice("sha256:".length)}`,
    stepDigest,
    ...stepBody,
  }) as TraversalStep;
  traversalSteps.add(step);
  return step;
}

export function deriveTraversalStep(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
): TraversalStep | TraversalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    !traversalCursors.has(sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    sourceCursor.position !== "at_term"
  ) {
    return refusal(
      "traversal_cursor_mismatch",
      "HoG derives a step only from its exact materialized Graph and owner-issued term cursor",
    );
  }
  const directStep = deriveDirectCStepFromGraph(graph.template, {
    nodeRef: sourceCursor.currentNodeRef,
    termPath: sourceCursor.termPath,
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    retryPath: sourceCursor.retryPath,
  });
  if (directStep.kind === "direct_c_traversal_refusal") {
    return refusal("locus_missing", directStep.message);
  }
  return createTraversalStep(sourceCursor, directStep);
}

export function deriveCompletedTraversalStep(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  completedInput: TraversalInputBasis,
): TraversalStep | TraversalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    !traversalCursors.has(sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    sourceCursor.position !== "at_term"
  ) {
    return refusal(
      "traversal_cursor_mismatch",
      "HoG derives continuation only from its exact original GTL cursor",
    );
  }
  const directStep = deriveDirectCContinuationStepFromGraph(graph.template, {
    nodeRef: sourceCursor.currentNodeRef,
    termPath: sourceCursor.termPath,
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    retryPath: sourceCursor.retryPath,
  });
  if (directStep.kind === "direct_c_traversal_refusal") {
    return refusal("locus_missing", directStep.message);
  }
  const targetInput = directStep.stepKind === "continue_term" &&
      directStep.relation === "batch_next"
    ? sourceCursor
    : completedInput;
  return createTraversalStep(sourceCursor, directStep, targetInput);
}

export function deriveRetryTraversalStep(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  retryInput: TraversalInputBasis,
): TraversalStep | TraversalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    !traversalCursors.has(sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    sourceCursor.position !== "at_term" ||
    retryInput.inputRef.length === 0 ||
    !retryInput.inputDigest.startsWith("sha256:")
  ) {
    return refusal(
      "traversal_cursor_mismatch",
      "HoG derives retry only from its exact original GTL cursor and retained input basis",
    );
  }
  const directStep = deriveDirectCRetryStepFromGraph(graph.template, {
    nodeRef: sourceCursor.currentNodeRef,
    termPath: sourceCursor.termPath,
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    retryPath: sourceCursor.retryPath,
  });
  if (directStep.kind === "direct_c_traversal_refusal") {
    return refusal("locus_missing", directStep.message);
  }
  return createTraversalStep(sourceCursor, directStep, retryInput);
}

export function deriveRecursionReentryCursor(
  graph: Readonly<GtlGraph>,
  application: Readonly<RecurseApplication>,
  sourceCursor: TraversalCursor,
  foldedInput: TraversalInputBasis,
): TraversalCursor | TraversalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    !traversalCursors.has(sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    sourceCursor.position !== "at_term" ||
    graph.template.applications.find(
      (candidate) => candidate.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "recurse" ||
    sourceCursor.attempt >= application.bound ||
    foldedInput.inputRef.length === 0 ||
    !foldedInput.inputDigest.startsWith("sha256:")
  ) {
    return refusal(
      "traversal_cursor_mismatch",
      "HoG derives recursive re-entry only from the exact bounded application cursor and admitted foldback",
    );
  }
  return createCursor(
    cursorLineage(sourceCursor),
    {
      nodeRef: sourceCursor.currentNodeRef,
      termPath: sourceCursor.termPath,
      taskOrdinal: sourceCursor.taskOrdinal,
      attempt: sourceCursor.attempt + 1,
      retryPath: sourceCursor.retryPath,
    },
    "at_term",
    foldedInput,
  );
}

export function applyRecursionRoute(
  sourceCursor: TraversalCursor,
  targetCursor: TraversalCursor,
  route: AdmittedRoute,
): TraversalCursor | TraversalRefusal {
  if (
    !traversalCursors.has(sourceCursor) ||
    !traversalCursors.has(targetCursor) ||
    !isAdmittedRoute(route) ||
    route.routeKind !== "advance" ||
    route.sourceCursorRef !== sourceCursor.cursorRef ||
    route.sourceCursorDigest !== sourceCursor.cursorDigest ||
    route.targetCursorRef !== targetCursor.cursorRef ||
    route.targetCursorDigest !== targetCursor.cursorDigest
  ) {
    return refusal(
      "route_mismatch",
      "HoG applies only the exact ABG-admitted recursive re-entry route",
    );
  }
  return targetCursor;
}

function validateTraverseInput(input: TraverseInput): TraversalRefusal | null {
  if (!isExecutionBasis(input.executionBasis)) {
    return refusal("execution_basis_mismatch", "HoG requires the exact ABG-constructed ExecutionBasis");
  }
  if (!isOpenedTraversalScope(input.openedTraversalScope)) {
    return refusal("scope_not_admitted", "HoG requires the exact explicit OpenedTraversalScope");
  }
  if (
    input.openedTraversalScope.executionBasisRef !== input.executionBasis.basisRef ||
    input.openedTraversalScope.executionBasisDigest !== input.executionBasis.basisDigest ||
    input.openedTraversalScope.invocationAdmissionRef !== input.executionBasis.invocationAdmissionRef ||
    input.openedTraversalScope.programRef !== input.executionBasis.programRef ||
    input.openedTraversalScope.graphFunctionRef !== input.executionBasis.graphFunctionRef ||
    input.openedTraversalScope.graphRef !== input.executionBasis.graphRef
  ) {
    return refusal("scope_not_admitted", "OpenedTraversalScope does not carry this execution basis and graph lineage");
  }
  if (
    input.program.programRef !== input.executionBasis.programRef ||
    sha256Canonical(input.program as unknown as JsonValue) !== input.executionBasis.programDigest ||
    !input.program.callableMembership.includes(input.executionBasis.graphFunctionRef)
  ) {
    return refusal("program_mismatch", "HoG Program differs from the admitted execution basis");
  }
  const programStart = input.program.starts.find(
    (start) => start.graphFunctionRef === input.executionBasis.graphFunctionRef,
  );
  if (
    input.executionBasis.basisClass === "root"
      ? programStart === undefined || programStart.startRef !== input.executionBasis.entryRef
      : input.executionBasis.parentExecutionBasisRef === null ||
        input.executionBasis.parentTraversalScopeRef === null ||
        input.executionBasis.entryRef.length === 0
  ) {
    return refusal(
      "program_mismatch",
      "HoG entry differs from the root start or admitted child entry",
    );
  }
  if (
    !isMaterializedGtlGraph(input.graph) ||
    !isGraphValidation(input.graphValidation) ||
    input.graph.materializationRef !== input.executionBasis.graphRef ||
    input.graph.materializationDigest !== input.executionBasis.graphDigest ||
    input.graph.graphFunctionRef !== input.executionBasis.graphFunctionRef ||
    input.graph.graphFunctionDigest !== input.executionBasis.graphFunctionDigest ||
    input.graph.invocationAdmissionRef !== input.executionBasis.invocationAdmissionRef ||
    input.graph.admittedInputRef !== input.executionBasis.rawInputAdmissionRef ||
    input.graph.admittedInputDigest !== input.executionBasis.rawInputDigest ||
    input.graphValidation.validationRef !== input.executionBasis.graphValidationRef ||
    input.graphValidation.graphRef !== input.graph.materializationRef ||
    input.graphValidation.graphDigest !== input.graph.materializationDigest
  ) {
    return refusal("graph_mismatch", "HoG Graph or GraphValidation differs from the admitted execution basis");
  }

  return null;
}

function traversalResultAtCursor(
  input: TraverseInput,
  cursor: TraversalCursor,
): TraverseResult {
  if (
    !traversalCursors.has(cursor) ||
    cursor.programRef !== input.executionBasis.programRef ||
    cursor.executionBasisRef !== input.executionBasis.basisRef ||
    cursor.traversalScopeRef !== input.openedTraversalScope.scopeRef ||
    cursor.runId !== input.openedTraversalScope.runId ||
    cursor.graphCallId !== input.openedTraversalScope.graphCallId ||
    cursor.frameId !== input.openedTraversalScope.frameId ||
    cursor.graphRef !== input.graph.materializationRef ||
    cursor.inputRef.length === 0 ||
    !cursor.inputDigest.startsWith("sha256:") ||
    cursor.position !== "at_term"
  ) {
    return refusal(
      "traversal_cursor_mismatch",
      "HoG cursor differs from the admitted Program, Graph, basis, or opened scope",
    );
  }

  const term = resolveCProgramTermAtPath(input.graph.template, {
    nodeRef: cursor.currentNodeRef,
    termPath: cursor.termPath,
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
  });
  if (term.kind === "direct_c_traversal_refusal") {
    return refusal("locus_missing", term.message);
  }
  const batchRef = resolveEnclosingCBatchRef(
    input.graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if (typeof batchRef === "object" && batchRef?.kind === "c_source_path_refusal") {
    return refusal("locus_missing", batchRef.message);
  }
  const derivedStep = deriveTraversalStep(input.graph, cursor);
  if (derivedStep.kind === "traversal_refusal") return derivedStep;
  if (!isExecutableCLeaf(term) || derivedStep.directStep.stepKind !== "open_leaf") {
    return derivedStep;
  }
  const stopBody = {
    stopKind: "compute_locus" as const,
    cursor,
    traversalScopeRef: input.openedTraversalScope.scopeRef,
    runId: input.openedTraversalScope.runId,
    graphCallId: input.openedTraversalScope.graphCallId,
    frameId: input.openedTraversalScope.frameId,
    nodeRef: cursor.currentNodeRef,
    programLocusRef: term.programLocusRef,
    edgeRef: input.executionBasis.entryRef,
    vectorIndex: term.vectorIndex,
    judgmentPredicateRef: term.judgmentPredicateRef,
    stageRole: term.stageRole,
    batchRef,
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    retryPath: [...cursor.retryPath],
    computeRegime: term.fibre,
    armId: term.armId,
    compositionRef: term.compositionRef,
    implementationBindingRef: term.requirement.implementationBindingRef,
    inputContractRef: term.requirement.inputContractRef,
    outputContractRef: term.requirement.outputContractRef,
    evidenceContractRef: term.requirement.evidenceContractRef,
    failureContractRef: term.requirement.failureContractRef,
    refusalContractRef: term.requirement.refusalContractRef,
    judgmentContractRef: term.requirement.judgmentContractRef,
  };
  const stopDigest = sha256Canonical(stopBody as unknown as JsonValue);
  const stop = deepFreeze({
    kind: "traversal_stop_ref" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "at_compute_locus" as const,
    stopRef: `traversal-stop://abiogenesis/${stopDigest.slice("sha256:".length)}`,
    stopDigest,
    ...stopBody,
  }) as TraversalStopRef;
  traversalStops.add(stop);
  return stop;
}

export function traverseFromCursor(
  input: TraverseInput,
  cursor: TraversalCursor,
): TraverseResult {
  const invalid = validateTraverseInput(input);
  return invalid ?? traversalResultAtCursor(input, cursor);
}

export function applyRoute(
  step: TraversalStep,
  route: AdmittedRoute,
): TraversalCursor | TraversalRefusal {
  const targetCursor = step.targetCursor;
  const expectedKind = step.directStep.stepKind === "retry" ||
      (step.directStep.stepKind === "continue_term" &&
        step.directStep.relation === "retry_same_edge")
    ? "retry"
    : step.directStep.stepKind === "continue_term" ||
        step.directStep.stepKind === "enter_term" ||
        step.directStep.stepKind === "start_task"
      ? "advance"
      : null;
  if (
    !traversalSteps.has(step) ||
    !isAdmittedRoute(route) ||
    targetCursor === null ||
    expectedKind === null ||
    route.routeKind !== expectedKind ||
    route.sourceCursorRef !== step.sourceCursor.cursorRef ||
    route.sourceCursorDigest !== step.sourceCursor.cursorDigest ||
    route.targetCursorRef !== targetCursor.cursorRef ||
    route.targetCursorDigest !== targetCursor.cursorDigest
  ) {
    return refusal(
      "route_mismatch",
      "HoG applies only the exact admitted route for its current structural step",
    );
  }
  return targetCursor;
}

export function traverse(input: TraverseInput): TraverseResult {
  const invalid = validateTraverseInput(input);
  if (invalid !== null) return invalid;

  const node = input.graph.template.nodes.find(
    (candidate) => candidate.nodeRef === input.graph.template.startNodeRef,
  );
  if (node === undefined) {
    return refusal("locus_missing", "admitted GTL start node does not resolve to a compute locus");
  }
  const lineage = {
    programRef: input.program.programRef,
    executionBasisRef: input.executionBasis.basisRef,
    traversalScopeRef: input.openedTraversalScope.scopeRef,
    runId: input.openedTraversalScope.runId,
    graphCallId: input.openedTraversalScope.graphCallId,
    frameId: input.openedTraversalScope.frameId,
    graphRef: input.graph.materializationRef,
  };
  const sourceCursor = createCursor(
    lineage,
    rootCTraversalCoordinate(node.nodeRef),
    "at_term",
    {
      inputRef: input.executionBasis.rawInputAdmissionRef,
      inputDigest: input.executionBasis.rawInputDigest,
    },
  );
  return traversalResultAtCursor(input, sourceCursor);
}
