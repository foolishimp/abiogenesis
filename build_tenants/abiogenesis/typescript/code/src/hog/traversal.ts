import { isExecutionBasis, type ExecutionBasis } from "../abg/execution_basis.js";
import {
  constructCCallLocusCandidate,
  type CCallLocusCandidate,
} from "../abg/c_call.js";
import {
  isOpenedTraversalScope,
  type OpenedTraversalScope,
} from "../abg/open_call.js";
import {
  isAdmittedRoute,
  type AdmittedRoute,
} from "../abg/traversal_route.js";
import {
  constructTraversalCursorCandidate,
  hasAdmittedTraversalCursorAtPrefix,
  isTraversalCursorCandidate,
  type TraversalCursorCandidate,
} from "../abg/traversal_cursor.js";
import type { AbgEventStore } from "../abg/event_store.js";
import type { ValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import type {
  GraphFunction,
  GtlGraph,
  GtlProgram,
  ReenterApplication,
  RecurseApplication,
} from "../gtl/contracts.js";
import { isInteractionCLeaf } from "../gtl/c_algebra.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import {
  deriveCContinuationTarget,
  deriveCRetryTarget,
  deriveCStructuralTarget,
  rootCSourcePath,
  resolveCProgramLocus,
  resolveCProgramTermAtSourcePath,
  resolveEnclosingCBatchRef,
} from "../gtl/source_path.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isGraphValidation, type GraphValidation } from "../validator/graph.js";

export type TraversalCursor = TraversalCursorCandidate;

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
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
}

export type TraverseResult =
  | TraversalCursor
  | CCallLocusCandidate
  | TraversalRefusal;

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

interface TraversalCoordinate {
  readonly nodeRef: string;
  readonly termPath: readonly string[];
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly retryPath: readonly number[];
}

export interface TraversalInputBasis {
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
}

function createCursor(
  lineage: CursorLineage,
  coordinate: TraversalCoordinate,
  position: TraversalCursor["position"],
  input: TraversalInputBasis,
): TraversalCursor {
  return constructTraversalCursorCandidate({
    ...lineage,
    inputRef: input.inputRef,
    inputDigest: input.inputDigest,
    currentNodeRef: coordinate.nodeRef,
    position,
    termPath: [...coordinate.termPath],
    taskOrdinal: coordinate.taskOrdinal,
    attempt: coordinate.attempt,
    retryPath: [...coordinate.retryPath],
  });
}

export function rehydrateHeldInteractionCursor(
  prefix: ValidatedRuntimeEventPrefix,
  candidate: TraversalCursorCandidate,
): TraversalCursor | null {
  const cursor = constructTraversalCursorCandidate({
    programRef: candidate.programRef,
    executionBasisRef: candidate.executionBasisRef,
    traversalScopeRef: candidate.traversalScopeRef,
    runId: candidate.runId,
    graphCallId: candidate.graphCallId,
    frameId: candidate.frameId,
    graphRef: candidate.graphRef,
    inputRef: candidate.inputRef,
    inputDigest: candidate.inputDigest,
    currentNodeRef: candidate.currentNodeRef,
    position: candidate.position,
    termPath: [...candidate.termPath],
    taskOrdinal: candidate.taskOrdinal,
    attempt: candidate.attempt,
    retryPath: [...candidate.retryPath],
  });
  if (
    !hasAdmittedTraversalCursorAtPrefix(prefix, candidate) ||
    !isTraversalCursorCandidate(candidate) ||
    sha256Canonical(cursor as unknown as JsonValue) !==
      sha256Canonical(candidate as unknown as JsonValue) ||
    candidate.position !== "at_term" ||
    candidate.programRef.length === 0 ||
    candidate.executionBasisRef.length === 0 ||
    candidate.traversalScopeRef.length === 0 ||
    candidate.runId.length === 0 ||
    candidate.graphCallId.length === 0 ||
    candidate.frameId.length === 0 ||
    candidate.graphRef.length === 0 ||
    candidate.inputRef.length === 0 ||
    !candidate.inputDigest.startsWith("sha256:") ||
    candidate.currentNodeRef.length === 0 ||
    !candidate.termPath.every(
      (segment) => typeof segment === "string" && segment.length > 0,
    ) ||
    (
      candidate.taskOrdinal !== null &&
      (!Number.isInteger(candidate.taskOrdinal) || candidate.taskOrdinal < 0)
    ) ||
    !Number.isInteger(candidate.attempt) ||
    candidate.attempt < 0 ||
    !candidate.retryPath.every(
      (ordinal) => Number.isInteger(ordinal) && ordinal >= 0,
    )
  ) {
    return null;
  }
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

function cursorCoordinate(cursor: TraversalCursor): TraversalCoordinate {
  return {
    nodeRef: cursor.currentNodeRef,
    termPath: cursor.termPath,
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
  };
}

export function resolveTraversalTerm(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursor,
): CProgramNode | TraversalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(cursor) ||
    cursor.graphRef !== graph.materializationRef ||
    cursor.position !== "at_term"
  ) {
    return refusal(
      "traversal_cursor_mismatch",
      "HoG resolves only an exact materialized Graph cursor",
    );
  }
  const term = resolveCProgramTermAtSourcePath(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  return term.kind === "c_source_path_refusal"
    ? refusal("locus_missing", term.message)
    : term;
}

export function deriveStructuralTargetCursor(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  term: Readonly<CProgramNode>,
): TraversalCursor | TraversalRefusal | null {
  const source = cursorCoordinate(sourceCursor);
  const declaredTerm = resolveTraversalTerm(graph, sourceCursor);
  if (
    declaredTerm.kind === "traversal_refusal" ||
    sha256Canonical(declaredTerm as unknown as JsonValue) !==
      sha256Canonical(term as unknown as JsonValue)
  ) {
    return refusal(
      "traversal_cursor_mismatch",
      "direct C step differs from its exact traversal cursor",
    );
  }
  if (term.kind === "c_of" || term.kind === "c_workflow") {
    return null;
  }
  const routeKind = term.kind === "c_retry" ? "retry" as const : "advance" as const;
  const target = deriveCStructuralTarget(
    graph,
    {
      ...source,
      inputRef: sourceCursor.inputRef,
      inputDigest: sourceCursor.inputDigest,
    },
    routeKind,
  );
  if (target?.kind === "c_source_path_refusal") {
    return refusal("locus_missing", target.message);
  }
  if (target === null) return null;
  const expectedRelation = term.kind === "c_identity"
    ? "identity_continue"
    : term.kind === "c_compose"
      ? "compose_enter"
      : term.kind === "c_edge"
        ? "edge_enter"
      : term.kind === "c_batch"
        ? "batch_enter"
        : term.kind === "c_retry"
          ? "retry_enter"
          : null;
  if (target.relation !== expectedRelation) {
    return refusal(
      "traversal_cursor_mismatch",
      "active structural traversal step differs from GTL topology",
    );
  }
  return createCursor(
    cursorLineage(sourceCursor),
    target,
    "at_term",
    target,
  );
}

export function deriveCompletedTraversalCursor(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  completedInput: TraversalInputBasis,
): TraversalCursor | TraversalRefusal | null {
  const term = resolveTraversalTerm(graph, sourceCursor);
  if (term.kind === "traversal_refusal") return term;
  const source = cursorCoordinate(sourceCursor);
  const continuation = deriveCContinuationTarget(
    graph,
    { ...source, inputRef: sourceCursor.inputRef, inputDigest: sourceCursor.inputDigest },
    completedInput,
  );
  if (continuation.kind === "c_source_path_refusal") {
    return refusal("locus_missing", continuation.message);
  }
  if (continuation.disposition === "terminal") return null;
  return createCursor(
    cursorLineage(sourceCursor),
    {
      nodeRef: continuation.nodeRef!,
      termPath: continuation.termPath!,
      taskOrdinal: continuation.taskOrdinal,
      attempt: continuation.attempt!,
      retryPath: continuation.retryPath,
    },
    "at_term",
    { inputRef: continuation.inputRef!, inputDigest: continuation.inputDigest! },
  );
}

export function deriveRetryTraversalCursor(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  retryInput: TraversalInputBasis,
): TraversalCursor | TraversalRefusal {
  const source = cursorCoordinate(sourceCursor);
  const target = deriveCRetryTarget(
    graph,
    {
      ...source,
      inputRef: sourceCursor.inputRef,
      inputDigest: sourceCursor.inputDigest,
    },
    retryInput,
  );
  if (target.kind === "c_source_path_refusal") {
    return refusal("traversal_cursor_mismatch", target.message);
  }
  return createCursor(
    cursorLineage(sourceCursor),
    target,
    "at_term",
    target,
  );
}

export function deriveInteractionSuccessorInputCarrierRef(
  graph: Readonly<GtlGraph>,
  heldCursor: TraversalCursor,
): string | null {
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(heldCursor) ||
    heldCursor.graphRef !== graph.materializationRef ||
    heldCursor.position !== "at_term"
  ) {
    throw new TypeError(
      "F_H successor carrier requires one exact materialized Graph and held cursor",
    );
  }
  const source = resolveCProgramTermAtSourcePath(
    graph.template,
    heldCursor.currentNodeRef,
    heldCursor.termPath,
  );
  if (
    source.kind === "c_source_path_refusal" ||
    source.kind !== "c_of" ||
    source.fibre !== "F_H" ||
    !isInteractionCLeaf(source)
  ) {
    throw new TypeError(
      "F_H successor carrier requires the exact held c_of F_H interaction term",
    );
  }
  const continuation = deriveCContinuationTarget(
    graph,
    {
      nodeRef: heldCursor.currentNodeRef,
      termPath: heldCursor.termPath,
      taskOrdinal: heldCursor.taskOrdinal,
      attempt: heldCursor.attempt,
      retryPath: heldCursor.retryPath,
      inputRef: heldCursor.inputRef,
      inputDigest: heldCursor.inputDigest,
    },
    heldCursor,
  );
  if (continuation.kind === "c_source_path_refusal") {
    throw new TypeError(
      `F_H successor carrier derivation refused: ${continuation.code}: ${continuation.message}`,
    );
  }
  if (continuation.disposition === "terminal") return null;
  const target = resolveCProgramTermAtSourcePath(
    graph.template,
    continuation.nodeRef!,
    continuation.termPath!,
  );
  if (target.kind === "c_source_path_refusal") {
    throw new TypeError(
      `F_H successor carrier target refused: ${target.code}: ${target.message}`,
    );
  }
  return target.inputCarrierRef;
}

export function deriveGraphSpanReentryCursor(
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursor,
  application: Readonly<ReenterApplication>,
  targetInput: TraversalInputBasis,
): TraversalCursor | TraversalRefusal {
  const declaredApplication = graph.template.applications.find(
    (candidate) => candidate.applicationRef === application.applicationRef,
  );
  const sourceTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const target = resolveCProgramLocus(
    graph.template,
    application.targetProgramLocusRef,
  );
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    sourceCursor.position !== "at_term" ||
    declaredApplication !== application ||
    application.relationKind !== "re_enter" ||
    application.graphFunctionRef !== graph.graphFunctionRef ||
    sourceTerm.kind !== "c_of" ||
    sourceTerm.programLocusRef !== application.sourceProgramLocusRef ||
    sourceTerm.outputCarrierRef !== application.inputContractRef ||
    target.kind !== "c_program_locus" ||
    target.nodeRef !== sourceCursor.currentNodeRef ||
    target.leaf.inputCarrierRef !== application.outputContractRef ||
    target.termPath.includes("tasks") ||
    target.termPath.includes("term") ||
    targetInput.inputRef.length === 0 ||
    !targetInput.inputDigest.startsWith("sha256:")
  ) {
    return refusal(
      "traversal_cursor_mismatch",
      "HoG derives graph-span re-entry only from one exact declared application, source cursor, target locus, and Product input",
    );
  }
  return createCursor(
    cursorLineage(sourceCursor),
    {
      nodeRef: target.nodeRef,
      termPath: [...target.termPath],
      taskOrdinal: null,
      attempt: sourceCursor.attempt + 1,
      retryPath: [],
    },
    "at_term",
    targetInput,
  );
}

export function deriveInteractionResumeCursor(
  heldCursor: TraversalCursor,
  responseInput: TraversalInputBasis,
): TraversalCursor | TraversalRefusal {
  if (
    !isTraversalCursorCandidate(heldCursor) ||
    heldCursor.position !== "at_term" ||
    responseInput.inputRef.length === 0 ||
    !responseInput.inputDigest.startsWith("sha256:")
  ) {
    return refusal(
      "traversal_cursor_mismatch",
      "HoG resumes an interaction only from its exact held cursor and admitted response",
    );
  }
  return createCursor(
    cursorLineage(heldCursor),
    {
      nodeRef: heldCursor.currentNodeRef,
      termPath: heldCursor.termPath,
      taskOrdinal: heldCursor.taskOrdinal,
      attempt: heldCursor.attempt,
      retryPath: heldCursor.retryPath,
    },
    "at_term",
    responseInput,
  );
}

export function deriveRecursionReentryCursor(
  graph: Readonly<GtlGraph>,
  application: Readonly<RecurseApplication>,
  sourceCursor: TraversalCursor,
  foldedInput: TraversalInputBasis,
): TraversalCursor | TraversalRefusal {
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(sourceCursor) ||
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
  prefix: ValidatedRuntimeEventPrefix,
  sourceCursor: TraversalCursor,
  targetCursor: TraversalCursor,
  route: AdmittedRoute,
): TraversalCursor | TraversalRefusal {
  if (
    !isTraversalCursorCandidate(sourceCursor) ||
    !isTraversalCursorCandidate(targetCursor) ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, sourceCursor) ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, targetCursor) ||
    !isAdmittedRoute(prefix, route) ||
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
  const rootTerm = resolveCProgramTermAtSourcePath(
    input.graph.template,
    input.graph.template.startNodeRef,
    rootCSourcePath(input.graph.template.startNodeRef),
  );
  if (
    input.executionBasis.basisClass === "root"
      ? rootTerm.kind === "c_source_path_refusal" ||
        input.executionBasis.entryRef.length === 0
      : input.executionBasis.parentExecutionBasisRef === null ||
        input.executionBasis.parentTraversalScopeRef === null ||
        input.executionBasis.entryRef.length === 0
  ) {
    return refusal(
      "program_mismatch",
      "HoG entry differs from the exact admitted root C relation or child entry",
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
  suppliedTerm?: Readonly<CProgramNode>,
): TraverseResult {
  if (
    !isTraversalCursorCandidate(cursor) ||
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

  const declaredTerm = resolveTraversalTerm(input.graph, cursor);
  if (declaredTerm.kind === "traversal_refusal") return declaredTerm;
  const term = suppliedTerm ?? declaredTerm;
  if (
    sha256Canonical(term as unknown as JsonValue) !==
      sha256Canonical(declaredTerm as unknown as JsonValue)
  ) {
    return refusal(
      "traversal_cursor_mismatch",
      "direct C step differs from its exact traversal cursor",
    );
  }
  if (term.kind !== "c_of") return cursor;
  const batchRef = resolveEnclosingCBatchRef(
    input.graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if (batchRef !== null && typeof batchRef !== "string") {
    return refusal("locus_missing", batchRef.message);
  }
  const commonStopBody = {
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
  };
  if (
    (term.fibre !== "F_H" &&
      term.requirement.kind !== "executable_leaf_requirement") ||
    (term.fibre === "F_H" &&
      term.requirement.kind !== "interaction_leaf_requirement")
  ) {
    return refusal(
      "locus_missing",
      "direct C leaf kind differs from its admitted leaf requirement",
    );
  }
  const stopBody = term.requirement.kind === "executable_leaf_requirement"
    ? {
        ...commonStopBody,
        stopClass: "executable" as const,
        computeRegime: term.fibre as "F_D" | "F_P",
        implementationBindingRef: term.requirement.implementationBindingRef,
        inputContractRef: term.requirement.inputContractRef,
        outputContractRef: term.requirement.outputContractRef,
        evidenceContractRef: term.requirement.evidenceContractRef,
        failureContractRef: term.requirement.failureContractRef,
        refusalContractRef: term.requirement.refusalContractRef,
        judgmentContractRef: term.requirement.judgmentContractRef,
      }
    : {
        ...commonStopBody,
        stopClass: "interaction" as const,
        computeRegime: "F_H" as const,
        interactionKind: term.requirement.interactionKind,
        actorCapabilityRef: term.requirement.actorCapabilityRef,
        requestContractRef: term.requirement.requestContractRef,
        responseContractRef: term.requirement.responseContractRef,
        continuationContractRef: term.requirement.continuationContractRef,
      };
  return constructCCallLocusCandidate(stopBody);
}

export function traverseFromCursor(
  input: TraverseInput,
  cursor: TraversalCursor,
  term?: Readonly<CProgramNode>,
): TraverseResult {
  const invalid = validateTraverseInput(input);
  return invalid ?? traversalResultAtCursor(input, cursor, term);
}

export function applyAdmittedRoute(
  prefix: ValidatedRuntimeEventPrefix,
  sourceCursor: TraversalCursor,
  targetCursor: TraversalCursor,
  expectedKind: "advance" | "re_enter" | "retry",
  route: AdmittedRoute,
): TraversalCursor | TraversalRefusal {
  if (
    !isAdmittedRoute(prefix, route) ||
    route.routeKind !== expectedKind ||
    route.sourceCursorRef !== sourceCursor.cursorRef ||
    route.sourceCursorDigest !== sourceCursor.cursorDigest ||
    route.targetCursorRef !== targetCursor.cursorRef ||
    route.targetCursorDigest !== targetCursor.cursorDigest
  ) {
    return refusal(
      "route_mismatch",
      "HoG applies only the exact admitted route for its current and target cursors",
    );
  }
  return targetCursor;
}

export function traverse(input: TraverseInput): TraverseResult {
  const invalid = validateTraverseInput(input);
  if (invalid !== null) return invalid;

  const rootCoordinate: TraversalCoordinate = {
    nodeRef: input.graph.template.startNodeRef,
    termPath: rootCSourcePath(input.graph.template.startNodeRef),
    taskOrdinal: null,
    attempt: 1,
    retryPath: [],
  };
  const rootTerm = resolveCProgramTermAtSourcePath(
    input.graph.template,
    input.graph.template.startNodeRef,
    rootCoordinate.termPath,
  );
  if (rootTerm.kind === "c_source_path_refusal") {
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
    rootCoordinate,
    "at_term",
    {
      inputRef: input.executionBasis.rawInputAdmissionRef,
      inputDigest: input.executionBasis.rawInputDigest,
    },
  );
  return traversalResultAtCursor(input, sourceCursor);
}
