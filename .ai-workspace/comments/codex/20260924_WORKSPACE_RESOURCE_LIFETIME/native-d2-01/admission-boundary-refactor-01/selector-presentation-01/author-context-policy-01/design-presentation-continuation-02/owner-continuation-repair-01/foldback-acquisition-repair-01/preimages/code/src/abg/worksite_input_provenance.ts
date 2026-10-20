import { RETAINED_GRAPH_INPUT_CONTRACT, isRetainedGraphInput, constructRetainedGraphInput } from "../product/worksite_preparation_contracts.js";
import { WORKSITE_REVISION_IDS, isWorksiteExecutionTask, type WorksiteExecutionTask } from "../product/worksite_revision.js";
import { worksiteRevisionRetentionBinding } from "../product/worksite_preparation_contracts.js";
import { SEMANTIC_REVISION_IDS } from "../gtl/semantic_revision_identity.js";
import { SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import { semanticJobReadDependenciesAtPrefix } from "./semantic_job.js";
import { worksiteExecutionSourcesCurrent } from "./worksite_revision.js";
import { deriveRuntimeEventCalculusProjection, holdsAt, constructWorksiteObservationCurrentFluent } from "./event_calculus.js";
/** Pure, prefix-owned provenance for the bounded worksite retention relation. */
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { rawAdmitValue, type RawAdmittedValue } from "../validator/raw_admission.js";
import { isWorksitePreparationBoundInput, isWorksitePreparationInput, constructRetainedWorksiteInput,
  worksiteRetentionBinding, prepareWorksiteCommandTask, preparationConstructionTasks, WORKSITE_PREPARATION_IDS } from "../product/worksite_preparation.js";
import { WORKSITE_CONSTRUCTION_IDS, isWorksiteConstructionResult } from "../product/worksite_construction.js";
import { nativeWorksiteRecoverySourceAtPrefix } from "./worksite_construction_recovery.js";
import { WORKSITE_BRANCH_CONSTRUCTION_IDS, isWorksiteBranchConstructionOutputVector,
  reduceWorksiteBranchConstructionResults } from "../product/worksite_branch_construction.js";
import { isNativeWorksiteCommandExecutionTask, isObservedWorksiteCommandExecutionTask, isWorksiteCommandExecutionTask, type WorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import { indexedRuntimeEvents, runtimeEventsFromValidatedPrefix, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { projectExactFanOutCompletion } from "./fan_out_projection.js";
import { traversalCursorAdmissionEventsAtPrefix, traversalCursorAdmissionDigest } from "./traversal_cursor.js";
import { projectWorkflowCCallInputDigestAtPrefix } from "./c_call.js";
import type { ExecutionBasis } from "./execution_basis.js";
import type { RuntimeEvent } from "./event_store.js";

function record(value: unknown): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function same(a: unknown, b: unknown): boolean {
  return canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);
}
function one(events: readonly RuntimeEvent[], predicate: (event: RuntimeEvent) => boolean): RuntimeEvent | null {
  const matches = events.filter(predicate);
  return matches.length === 1 ? matches[0]! : null;
}
function sameScope(a: RuntimeEvent, b: RuntimeEvent): boolean {
  return a.runId === b.runId && a.basisId === b.basisId && a.graphCallId === b.graphCallId && a.frameId === b.frameId;
}
function sameInvocation(a: ExecutionBasis, b: ExecutionBasis): boolean {
  return a.invocationAdmissionRef === b.invocationAdmissionRef && a.invocationRef === b.invocationRef &&
    a.invocationDigest === b.invocationDigest && a.programRef === b.programRef && a.programDigest === b.programDigest &&
    a.programValidationRef === b.programValidationRef && a.workspaceBindingId === b.workspaceBindingId &&
    a.workspaceBindingDigest === b.workspaceBindingDigest && a.catalogBasisRef === b.catalogBasisRef &&
    a.catalogBasisDigest === b.catalogBasisDigest && a.catalogViewId === b.catalogViewId &&
    a.catalogViewDigest === b.catalogViewDigest && a.actorRef === b.actorRef &&
    a.rootImplementationSetRef === b.rootImplementationSetRef && a.rootImplementationSetDigest === b.rootImplementationSetDigest;
}
function successfulResult(events: readonly RuntimeEvent[], resultRef: string, scope: RuntimeEvent): Readonly<{
  result: RuntimeEvent; judgment: RuntimeEvent; value: Readonly<Record<string, JsonValue>>;
}> | null {
  const result = one(events, (event) => event.kind === "c_call_result_admitted" && sameScope(event, scope) &&
    record(event.payload) && event.payload.resultRef === resultRef && event.payload.resultClass === "success");
  if (result === null || !record(result.payload) || !record(result.payload.value) ||
    sha256Canonical(result.payload.value) !== result.payload.valueDigest) return null;
  const resultPayload = result.payload;
  const judgment = one(events, (event) => event.kind === "c_call_judged" && sameScope(event, result) &&
    event.aggregateId === result.aggregateId && record(event.payload) && event.payload.resultRef === resultRef &&
    event.payload.resultDigest === resultPayload.resultDigest && event.payload.judgment === "advance" &&
    event.admissionOrdinal > result.admissionOrdinal && event.causationEventRefs.includes(result.eventId));
  return judgment === null ? null : { result, judgment, value: result.payload.value };
}

/** Follows one declared C3 workflow child from its parent's terminal result. */
function completedC3Child(prefix: ValidatedRuntimeEventPrefix, parent: ExecutionBasis,
  parentResult: RuntimeEvent, graphFunctionRef: string, closureContractRef: string): Readonly<{
    basis: ExecutionBasis; result: RuntimeEvent; judgment: RuntimeEvent; foldback: RuntimeEvent;
  }> | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const call = one(events, (event) => event.kind === "c_call_opened" && sameScope(event, parentResult) &&
    event.aggregateId === parentResult.aggregateId && record(event.payload) &&
    event.payload.callClass === "workflow" && event.payload.childGraphFunctionRef === graphFunctionRef);
  if (call === null || call.basisId !== parent.basisRef || !record(parentResult.payload)) return null;
  const fibre = one(events, (event) => event.kind === "c_call_fibre_selected" && sameScope(event, call) &&
    event.aggregateId === call.aggregateId && record(event.payload) && event.payload.childGraphFunctionRef === graphFunctionRef);
  const foldback = one(events, (event) => event.kind === "child_foldback_admitted" && sameScope(event, call) &&
    record(event.payload) && event.payload.parentCCallRef === call.aggregateId && event.payload.childDisposition === "closed");
  if (fibre === null || foldback === null || !record(foldback.payload) ||
    typeof foldback.payload.childExecutionBasisRef !== "string" || typeof foldback.payload.childResultRef !== "string" ||
    !foldback.causationEventRefs.includes(fibre.eventId) || foldback.admissionOrdinal >= parentResult.admissionOrdinal) return null;
  const payload = foldback.payload;
  const basis = projectExactExecutionBasisAtPrefix(prefix, foldback.payload.childExecutionBasisRef);
  if (basis === null || !sameInvocation(basis, parent) ||
    basis.graphFunctionRef !== graphFunctionRef || basis.closureContractRef !== closureContractRef ||
    basis.parentExecutionBasisRef !== parent.basisRef || basis.parentCCallRef !== call.aggregateId ||
    basis.basisDigest !== payload.childExecutionBasisDigest) return null;
  const admission = one(events, (event) => event.eventId === basis.admissionEventRef && event.kind === "basis_admitted");
  const closed = one(events, (event) => event.kind === "graph_call_closed" && event.runId === call.runId &&
    event.basisId === basis.basisRef && event.graphCallId === payload.childGraphCallId);
  if (admission === null || admission.runId !== call.runId || !admission.causationEventRefs.includes(fibre.eventId) ||
    closed === null || !record(closed.payload) || closed.payload.closureContractRef !== closureContractRef ||
    payload.childTerminalEventRef !== closed.eventId || !foldback.causationEventRefs.includes(closed.eventId) ||
    closed.admissionOrdinal >= foldback.admissionOrdinal) return null;
  const completed = successfulResult(events, foldback.payload.childResultRef, closed);
  if (completed === null || !record(completed.judgment.payload) || !record(completed.result.payload) ||
    completed.result.payload.resultDigest !== payload.childResultDigest ||
    completed.judgment.payload.judgmentRef !== payload.childJudgmentRef ||
    !same(completed.value, parentResult.payload.value) || payload.outputDigest !== sha256Canonical(completed.value)) return null;
  const terminal = one(events, (event) => event.kind === "terminal_reached" && sameScope(event, closed) &&
    record(event.payload) && event.payload.closureRef === payload.childClosureRef &&
    event.payload.closureContractRef === closureContractRef && event.payload.resultRef === payload.childResultRef &&
    event.payload.judgmentRef === payload.childJudgmentRef && event.admissionOrdinal > completed.judgment.admissionOrdinal &&
    event.admissionOrdinal < closed.admissionOrdinal);
  return terminal === null ? null : { basis, result: completed.result, judgment: completed.judgment, foldback };
}

export interface RetainedWorksiteInputProjection {
  readonly input: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
  readonly entryBasis: ExecutionBasis;
  readonly sourceBasis: ExecutionBasis;
  readonly sourceResult: RuntimeEvent;
  readonly sourceJudgment: RuntimeEvent;
  readonly foldback: RuntimeEvent;
  /** Present only after the exact same-Run preparation owner has joined it. */
  readonly preparationResult?: RuntimeEvent;
  readonly preparationJudgment?: RuntimeEvent;
}

/** Version the relations read by retained-input provenance, including new
 * matches that can invalidate cardinality. This selects no runtime truth: the
 * unchanged projector below still authenticates every changed relation. */
export function retainedWorksiteInputRelationVersion(prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent): string {
  const stamps: string[] = [];
  const rows = (key: string, predicate: (event: RuntimeEvent) => boolean): readonly RuntimeEvent[] => {
    const selected = indexedRuntimeEvents(prefix, key).filter(predicate);
    stamps.push(`${key}:${selected.length}:${selected.at(-1)?.admissionOrdinal ?? 0}`);
    return selected;
  };
  const basis = (ref: string) => rows("basis:" + ref, e => e.kind === "basis_admitted" &&
    record(e.payload) && e.payload.basisRef === ref);
  const successful = (ref: string, scope: RuntimeEvent): void => {
    const results = rows("payload:resultRef:" + ref, e => e.kind === "c_call_result_admitted" &&
      sameScope(e, scope) && record(e.payload) && e.payload.resultClass === "success");
    const result = results[0];
    if (result === undefined || !record(result.payload)) return;
    const digest = result.payload.resultDigest;
    rows("payload:resultRef:" + ref, e => e.kind === "c_call_judged" && sameScope(e, result) &&
      e.aggregateId === result.aggregateId && record(e.payload) && e.payload.resultDigest === digest &&
      e.payload.judgment === "advance" && e.admissionOrdinal > result.admissionOrdinal && e.causationEventRefs.includes(result.eventId));
  };
  rows("id:" + route.eventId, e => same(e, route));
  if (!record(route.payload) || typeof route.basisId !== "string") return stamps.join("|");
  const payload = route.payload;
  basis(route.basisId);
  const opens = rows("related:" + payload.cCallRef, e => e.kind === "c_call_opened" && sameScope(e, route) &&
    e.aggregateId === payload.cCallRef && record(e.payload) && e.payload.callClass === "workflow" &&
    e.payload.cursorRef === payload.sourceCursorRef && e.payload.cursorDigest === payload.sourceCursorDigest);
  const opened = opens[0];
  if (opened === undefined) return stamps.join("|");
  const results = rows("related:" + opened.aggregateId, e => e.kind === "c_call_result_admitted" && sameScope(e, route) &&
    e.aggregateId === opened.aggregateId && record(e.payload) && e.payload.resultClass === "success");
  const cursorOrigins = (ref: JsonValue | undefined): readonly RuntimeEvent[] => typeof ref !== "string" ||
    typeof route.runId !== "string" || typeof route.graphCallId !== "string" || typeof route.frameId !== "string"
    ? [] : traversalCursorAdmissionEventsAtPrefix(prefix, { cursorRef: ref, executionBasisRef: route.basisId!,
      runId: route.runId, graphCallId: route.graphCallId, frameId: route.frameId });
  const sourceOrigins = cursorOrigins(payload.sourceCursorRef);
  stamps.push("source-cursor:" + sourceOrigins.map(event => event.eventId).join(","));
  rows("related:" + opened.aggregateId, e => e.kind === "c_call_evidenced" && sameScope(e, route));
  const result = results[0];
  if (record(result?.payload) && typeof result.payload.resultRef === "string") successful(result.payload.resultRef, opened);
  const foldbacks = rows("payload:parentCCallRef:" + opened.aggregateId, e => e.kind === "child_foldback_admitted" &&
    sameScope(e, route) && record(e.payload) && e.payload.childDisposition === "closed");
  const foldback = foldbacks[0];
  if (foldback === undefined || !record(foldback.payload)) return stamps.join("|");
  const fold = foldback.payload;
  if (typeof fold.childExecutionBasisRef !== "string") return stamps.join("|");
  const sources = basis(fold.childExecutionBasisRef);
  const source = sources[0];
  const bound = payload.boundInput;
  const expectedGraph = record(bound) && isRetainedGraphInput(bound.value) && record(opened.payload) ? opened.payload.childGraphFunctionRef : record(bound) && isWorksitePreparationBoundInput(bound.value) &&
    bound.value.entry.kind === "worksite_branch_command_preparation_input"
    ? WORKSITE_BRANCH_CONSTRUCTION_IDS.graphFunctionRef : WORKSITE_CONSTRUCTION_IDS.graphFunctionRef;
  if (record(source?.payload) && source.payload.graphFunctionRef !== expectedGraph) {
    // Recovery's admittedLeaf re-enters execution/implementation and CCall
    // admission owners. Until those dependencies are represented here, retain
    // complete authority sensitivity for this optional branch, never trust a
    // previously authenticated leaf merely because its result is unchanged.
    stamps.push("recovered-source:" + (runtimeEventsFromValidatedPrefix(prefix).at(-1)?.admissionOrdinal ?? 0));
  }
  const closed = rows("graph-call:" + fold.childGraphCallId, e => e.kind === "graph_call_closed" && e.runId === route.runId &&
    e.basisId === fold.childExecutionBasisRef && e.admissionOrdinal < foldback.admissionOrdinal)[0];
  if (closed !== undefined) {
    rows("graph-call:" + closed.graphCallId, e => e.kind === "terminal_reached" && sameScope(e, closed) && record(e.payload) &&
      e.payload.closureRef === fold.childClosureRef && e.payload.resultRef === fold.childResultRef &&
      e.payload.judgmentRef === fold.childJudgmentRef && e.admissionOrdinal < closed.admissionOrdinal);
    if (typeof fold.childResultRef === "string") successful(fold.childResultRef, closed);
  }
  stamps.push("target-cursor:" + cursorOrigins(payload.targetCursorRef).map(event => event.eventId).join(","));
  return stamps.join("|");
}

/** Revalidates admitted route provenance, without loading an install or executing replay. */
export function projectRetainedWorksiteInputAtPrefix(
  prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent,
): RetainedWorksiteInputProjection | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  if (route.kind !== "traversal_route_admitted" || !indexedRuntimeEvents(prefix, "id:" + route.eventId).some((event) => same(event, route)) ||
    !record(route.payload) || route.payload.routeKind !== "advance" || !record(route.payload.boundInput)) return null;
  const routePayload = route.payload;
  const asserted = route.payload.boundInput;
  const generic = isRetainedGraphInput(asserted.value);
  if (generic ? asserted.contractRef !== RETAINED_GRAPH_INPUT_CONTRACT.contractRef : !isWorksitePreparationBoundInput(asserted.value)) return null;
  if (typeof route.basisId !== "string") return null;
  const value = asserted.value as unknown as import("../product/worksite_preparation_contracts.js").WorksitePreparationBoundInput;
  const entryBasis = projectExactExecutionBasisAtPrefix(prefix, route.basisId);
  if (entryBasis === null || (!generic && !isWorksitePreparationInput(entryBasis.rawInputValue)) ||
    !same(entryBasis.rawInputValue, value.entry) || entryBasis.graphRef !== route.payload.declarationRef ||
    entryBasis.graphDigest !== route.payload.declarationDigest || entryBasis.graphFunctionRef !== route.graphFunctionRef ||
    entryBasis.graphRef !== route.materializationRef) return null;
  const sourceOpen = one(events, (event) => event.kind === "c_call_opened" && sameScope(event, route) &&
    event.aggregateId === routePayload.cCallRef && record(event.payload) && event.payload.callClass === "workflow" &&
    event.payload.cursorRef === routePayload.sourceCursorRef && event.payload.cursorDigest === routePayload.sourceCursorDigest);
  if (sourceOpen === null) return null;

  const resultEvent = one(events, (event) => event.kind === "c_call_result_admitted" && sameScope(event, route) &&
    event.aggregateId === sourceOpen.aggregateId && record(event.payload) && event.payload.resultClass === "success");
  if (resultEvent === null || !record(resultEvent.payload) || typeof resultEvent.payload.resultRef !== "string") return null;
  const source = successfulResult(events, resultEvent.payload.resultRef, sourceOpen);
  if (source === null || !same(source.value, value.source) || !record(source.judgment.payload) ||
    source.judgment.payload.judgmentRef !== route.payload.judgmentRef ||
    source.judgment.admissionOrdinal >= route.admissionOrdinal ||
    ![entryBasis.admissionEventRef, source.result.eventId, source.judgment.eventId].every((ref) => route.causationEventRefs.includes(ref))) return null;
  const foldback = one(events, (event) => event.kind === "child_foldback_admitted" && sameScope(event, route) &&
    record(event.payload) && event.payload.parentCCallRef === sourceOpen.aggregateId && event.payload.childDisposition === "closed");
  if (foldback === null || !record(foldback.payload) || typeof foldback.payload.childExecutionBasisRef !== "string" ||
    typeof foldback.payload.childResultRef !== "string" || typeof foldback.payload.childClosureRef !== "string" ||
    !route.causationEventRefs.includes(foldback.eventId) || foldback.admissionOrdinal >= source.result.admissionOrdinal ||
    foldback.payload.outputDigest !== sha256Canonical(source.value)) return null;
  const foldPayload = foldback.payload;
  const sourceBasis = projectExactExecutionBasisAtPrefix(prefix, foldback.payload.childExecutionBasisRef);
  const sourceGraph = generic && record(sourceOpen.payload) ? sourceOpen.payload.childGraphFunctionRef : value.entry.kind === "worksite_branch_command_preparation_input"
    ? WORKSITE_BRANCH_CONSTRUCTION_IDS.graphFunctionRef : WORKSITE_CONSTRUCTION_IDS.graphFunctionRef;
  const sourceInputDigest = !generic ? null : projectWorkflowCCallInputDigestAtPrefix(prefix, sourceOpen, foldback, source.result);
  if (sourceBasis === null || (sourceBasis.graphFunctionRef !== sourceGraph &&
      (generic || value.entry.kind === "worksite_branch_command_preparation_input" || !nativeWorksiteRecoverySourceAtPrefix(prefix, sourceBasis))) || !sameInvocation(entryBasis, sourceBasis) ||
    sourceBasis.parentExecutionBasisRef !== entryBasis.basisRef || sourceBasis.parentCCallRef !== sourceOpen.aggregateId ||
    (!generic ? !same(sourceBasis.rawInputValue, value.entry.constructionTask) :
      typeof sourceBasis.resultContractRef !== "string" ||
      sourceInputDigest === null || sourceInputDigest !== sourceBasis.rawInputDigest) || sourceBasis.basisDigest !== foldback.payload.childExecutionBasisDigest) return null;
  const closed = one(events, (event) => event.kind === "graph_call_closed" && event.runId === route.runId &&
    event.graphCallId === foldPayload.childGraphCallId && event.basisId === sourceBasis.basisRef &&
    event.admissionOrdinal < foldback.admissionOrdinal);
  const terminal = one(events, (event) => event.kind === "terminal_reached" && closed !== null && sameScope(event, closed) && record(event.payload) &&
    event.payload.closureRef === foldPayload.childClosureRef && event.payload.resultRef === foldPayload.childResultRef &&
    event.payload.judgmentRef === foldPayload.childJudgmentRef && event.admissionOrdinal < closed.admissionOrdinal);
  if (closed === null || terminal === null || foldPayload.childTerminalEventRef !== closed.eventId ||
    !record(closed.payload) || closed.payload.closureContractRef !== sourceBasis.closureContractRef) return null;
  const completed = successfulResult(events, foldback.payload.childResultRef, closed);
  if (completed === null || !same(completed.value, source.value) || !record(completed.judgment.payload) ||
    completed.judgment.payload.judgmentRef !== foldback.payload.childJudgmentRef) return null;
  const binding = (value.entry.kind === "worksite_revision_command_preparation_input" ? worksiteRevisionRetentionBinding()
    : worksiteRetentionBinding(value.entry.kind === "worksite_branch_command_preparation_input"));
  let input: ReturnType<typeof rawAdmitValue<Readonly<Record<string, JsonValue>>>>;
  try { input = rawAdmitValue(generic ? constructRetainedGraphInput(entryBasis.rawInputValue, source.value) :
    constructRetainedWorksiteInput(binding, entryBasis.rawInputValue, source.value), "invocation_input",
    generic ? RETAINED_GRAPH_INPUT_CONTRACT.contractRef : binding.targetContractRef); }
  catch { return null; }
  if (input.kind !== "raw_admitted_value" || !same(input, asserted)) return null;
  if (typeof routePayload.targetCursorRef !== "string" || typeof route.runId !== "string" ||
    typeof route.graphCallId !== "string" || typeof route.frameId !== "string") return null;
  const targetCursors = traversalCursorAdmissionEventsAtPrefix(prefix, { cursorRef: routePayload.targetCursorRef,
    executionBasisRef: route.basisId, runId: route.runId, graphCallId: route.graphCallId, frameId: route.frameId });
  if (targetCursors.length !== 1 || targetCursors[0]!.eventId !== route.eventId ||
    traversalCursorAdmissionDigest(targetCursors[0]!) !== routePayload.targetCursorDigest) return null;
  return { input, entryBasis, sourceBasis, sourceResult: completed.result, sourceJudgment: completed.judgment, foldback };
}

/** Source selection is obtained by following the actual preparation input/result edge. */
export function projectSameRunWorksiteCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
  parentBasis: ExecutionBasis; parentCCallRef: string; runId: string; task: WorksiteExecutionTask;
}>): RetainedWorksiteInputProjection | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  if (!isWorksiteExecutionTask(input.task) || isNativeWorksiteCommandExecutionTask(input.task) || isObservedWorksiteCommandExecutionTask(input.task)) return null;
  const parentCall = one(events, (event) => event.kind === "c_call_opened" && event.aggregateId === input.parentCCallRef &&
    event.runId === input.runId && event.basisId === input.parentBasis.basisRef && record(event.payload) && event.payload.callClass === "workflow");
  if (parentCall === null || !record(parentCall.payload)) return null;
  const parentPayload = parentCall.payload;
  const precedingRoute = one(events, (event) => event.kind === "traversal_route_admitted" && sameScope(event, parentCall) &&
    record(event.payload) && event.payload.targetCursorRef === parentPayload.cursorRef && event.payload.routeKind === "advance");
  if (precedingRoute === null || !record(precedingRoute.payload) || typeof precedingRoute.payload.cCallRef !== "string") return null;
  const precedingPayload = precedingRoute.payload;
  const preparationResult = one(events, (event) => event.kind === "c_call_result_admitted" && sameScope(event, parentCall) &&
    event.aggregateId === precedingPayload.cCallRef && record(event.payload) && event.payload.resultClass === "success");
  if (preparationResult === null || !record(preparationResult.payload) || typeof preparationResult.payload.resultRef !== "string") return null;
  const preparation = successfulResult(events, preparationResult.payload.resultRef, parentCall);
  if (preparation === null || !same(preparation.value, input.task) || !record(preparation.judgment.payload) ||
    preparation.judgment.payload.judgmentRef !== precedingPayload.judgmentRef ||
    !precedingRoute.causationEventRefs.includes(preparation.judgment.eventId) || precedingRoute.admissionOrdinal >= parentCall.admissionOrdinal) return null;
  const preparationOpen = one(events, (event) => event.kind === "c_call_opened" && sameScope(event, parentCall) &&
    event.aggregateId === preparation.result.aggregateId);
  const preparationFibre = one(events, (event) => event.kind === "c_call_fibre_selected" && sameScope(event, parentCall) &&
    event.aggregateId === preparation.result.aggregateId);
  if (preparationOpen === null || !record(preparationOpen.payload) || preparationFibre === null || !record(preparationFibre.payload)) return null;
  const preparationPayload = preparationOpen.payload;
  const route = one(events, (event) => event.kind === "traversal_route_admitted" && sameScope(event, parentCall) &&
    record(event.payload) && record(event.payload.boundInput) &&
    event.payload.targetCursorRef === preparationPayload.cursorRef && event.payload.targetCursorDigest === preparationPayload.cursorDigest);
  if (route === null || route.admissionOrdinal >= preparationOpen.admissionOrdinal) return null;
  const retained = projectRetainedWorksiteInputAtPrefix(prefix, route);
  if (retained === null || !same(retained.entryBasis, input.parentBasis) || !isWorksitePreparationBoundInput(retained.input.value)) return null;
  const value = retained.input.value;
  const branch = value.entry.kind === "worksite_branch_command_preparation_input";
  const revision = value.entry.kind === "worksite_revision_command_preparation_input";
  if (revision && !revisionEntryHasNativeBridge(prefix, retained.entryBasis)) return null;
  if (value.entry.kind === "worksite_command_preparation_input" && value.entry.readDependencyBasis !== undefined &&
    !readDependencyEntryHasNativeBridge(prefix, retained.entryBasis)) return null;
  if (preparationFibre.payload.implementationRef !== (revision ? WORKSITE_REVISION_IDS.prepareImplementationRef : branch ? WORKSITE_PREPARATION_IDS.prepareBranchImplementationRef : WORKSITE_PREPARATION_IDS.prepareImplementationRef) ||
    preparationFibre.payload.implementationBindingRef !== (revision ? WORKSITE_REVISION_IDS.prepareBindingRef : branch ? WORKSITE_PREPARATION_IDS.prepareBranchBindingRef : WORKSITE_PREPARATION_IDS.prepareBindingRef)) return null;
  try { if (!same(prepareWorksiteCommandTask(value), input.task)) return null; } catch { return null; }
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, input.parentBasis.invocationAdmissionRef);
  const tasks = preparationConstructionTasks(value.entry);
  if (invocation === null || invocation.capabilityGrants.length !== 1 || tasks.some((task) =>
    !same(task.workspaceAuthorityBasis, input.task.workspaceAuthorityBasis) || !same(task.workspaceBinding, input.task.workspaceBinding) ||
    !same(task.capabilityGrant, input.task.capabilityGrant) || !same(task.capabilityGrant, invocation.capabilityGrants[0]))) return null;
  if (!isWorksiteConstructionResult(value.source)) return null;
  // The serial C3 form additionally names the completed aggregate's actual reducer,
  // never a partial fan-out member or a child with merely equal bytes.
  let resultProjection = retained;
  const calculus = deriveRuntimeEventCalculusProjection(prefix);
  if (!worksiteExecutionSourcesCurrent(prefix, input.task)) return null;
  if (branch) {
    const c3 = WORKSITE_BRANCH_CONSTRUCTION_IDS;
    const application = completedC3Child(prefix, retained.sourceBasis, retained.sourceResult,
      c3.branchApplicationGraphFunctionRef, c3.branchApplicationChildClosureContractRef);
    if (application === null) return null;
    const reduction = completedC3Child(prefix, application.basis, application.result,
      c3.reducerGraphFunctionRef, c3.reducerChildClosureContractRef);
    if (reduction === null) return null;
    const completionEvent = one(events, (event) => event.kind === "fan_out_completion_admitted" &&
      sameScope(event, application.result) && record(event.payload) && event.payload.applicationRef === c3.fanOutApplicationRef);
    if (completionEvent === null || completionEvent.admissionOrdinal >=
      events.find((event) => event.eventId === reduction.basis.admissionEventRef)!.admissionOrdinal) return null;
    const completion = projectExactFanOutCompletion(prefix, { mode: "event_canonical", admissionEventRef: completionEvent.eventId });
    if (completion === null || completion.kind !== "fan_out_completion_admission" || completion.completionKind !== "complete_vector" ||
      completion.batchRef !== c3.batchRef || completion.inputVectorRef !== c3.vectorContractRef ||
      completion.outputVectorContractRef !== c3.outputVectorContractRef ||
      !same(reduction.basis.rawInputValue, completion.outputVector) || !isWorksiteBranchConstructionOutputVector(completion.outputVector)) return null;
    try { if (!same(reduceWorksiteBranchConstructionResults(completion.outputVector), value.source)) return null; } catch { return null; }
    resultProjection = { ...retained, sourceBasis: reduction.basis, sourceResult: reduction.result,
      sourceJudgment: reduction.judgment, foldback: reduction.foldback };
  }
  return {...resultProjection, preparationResult: preparation.result, preparationJudgment: preparation.judgment};
}

/** E_D is admitted from the actual D2 bridge edge, not a caller's root input. */
export function revisionEntryHasNativeBridge(prefix: ValidatedRuntimeEventPrefix, entry: ExecutionBasis): boolean {
  if (entry.parentExecutionBasisRef === null || entry.parentCCallRef === null ||
    !isWorksitePreparationInput(entry.rawInputValue) || entry.rawInputValue.kind !== "worksite_revision_command_preparation_input") return false;
  const parent = projectExactExecutionBasisAtPrefix(prefix, entry.parentExecutionBasisRef);
  return parent !== null && sameInvocation(parent, entry) && revisionPreparationHasNativeBridgeSourceAtPrefix(prefix, {
    parentBasis: parent, parentCCallRef: entry.parentCCallRef, entry: entry.rawInputValue });
}
export function revisionPreparationHasNativeBridgeSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
  parentBasis: ExecutionBasis; parentCCallRef: string; entry: unknown;
}>): boolean {
  if (!isWorksitePreparationInput(input.entry) || input.entry.kind !== "worksite_revision_command_preparation_input") return false;
  return nativePreparationBridge(prefix, input, SEMANTIC_REVISION_IDS.bridgeImplementationRef, SEMANTIC_REVISION_IDS.bridgeBindingRef) !== null;
}
export function readDependencyEntryHasNativeBridge(prefix: ValidatedRuntimeEventPrefix, entry: ExecutionBasis): boolean {
  if (entry.parentExecutionBasisRef === null || entry.parentCCallRef === null) return false;
  const parent = projectExactExecutionBasisAtPrefix(prefix, entry.parentExecutionBasisRef);
  return parent !== null && sameInvocation(parent, entry) && readDependencyPreparationHasNativeBridgeSourceAtPrefix(prefix, {
    parentBasis: parent, parentCCallRef: entry.parentCCallRef, entry: entry.rawInputValue });
}
export function readDependencyPreparationHasNativeBridgeSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
  parentBasis: ExecutionBasis; parentCCallRef: string; entry: unknown;
}>): boolean {
  if (!isWorksitePreparationInput(input.entry) || input.entry.kind !== "worksite_command_preparation_input" || input.entry.readDependencyBasis === undefined) return false;
  const bridge = nativePreparationBridge(prefix, input, SEMANTIC_STAGE_IDS.jobBridgeImplementationRef, SEMANTIC_STAGE_IDS.jobBridgeBindingRef);
  const source = semanticJobReadDependenciesAtPrefix(prefix, input.entry.readDependencyBasis);
  return bridge !== null && record(bridge.payload) && source !== null && sameInvocation(source.seed, input.parentBasis) &&
    source.result.resultRef === bridge.payload.resultRef && source.result.resultDigest === bridge.payload.resultDigest &&
    same(source.seed.rawInputValue, projectExactExecutionBasisAtPrefix(prefix, bridge.basisId!)?.rawInputValue);
}
function nativePreparationBridge(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
  parentBasis: ExecutionBasis; parentCCallRef: string; entry: unknown;
}>, implementationRef: string, bindingRef: string): RuntimeEvent | null {
  const events = runtimeEventsFromValidatedPrefix(prefix), parent = input.parentBasis;
  const call = one(events, e => e.kind === "c_call_opened" && e.aggregateId === input.parentCCallRef &&
    e.basisId === parent.basisRef && record(e.payload) && e.payload.callClass === "workflow");
  if (call === null || !record(call.payload)) return null;
  const payload = call.payload;
  const route = one(events, e => e.kind === "traversal_route_admitted" && sameScope(e, call) && record(e.payload) &&
    e.payload.targetCursorRef === payload.cursorRef && e.payload.targetCursorDigest === payload.cursorDigest && e.payload.routeKind === "advance");
  if (route === null || !record(route.payload) || typeof route.payload.cCallRef !== "string") return null;
  const routePayload = route.payload;
  const result = one(events, e => e.kind === "c_call_result_admitted" && e.aggregateId === routePayload.cCallRef && sameScope(e, call));
  if (result === null || !record(result.payload) || typeof result.payload.resultRef !== "string") return null;
  const bridge = successfulResult(events, result.payload.resultRef, call);
  const fibre = one(events, e => e.kind === "c_call_fibre_selected" && e.aggregateId === result.aggregateId && sameScope(e, call) && record(e.payload));
  if (bridge === null || fibre === null || !record(fibre.payload)) return null;
  let nativeResult = result;
  if (fibre.payload.callClass === "workflow") {
    const foldback = one(events, e => e.kind === "child_foldback_admitted" && sameScope(e, call) && record(e.payload) && e.payload.parentCCallRef === result.aggregateId);
    const child = foldback !== null && record(foldback.payload) && typeof foldback.payload.childExecutionBasisRef === "string"
      ? projectExactExecutionBasisAtPrefix(prefix, foldback.payload.childExecutionBasisRef) : null;
    if (child === null || typeof fibre.payload.childGraphFunctionRef !== "string") return null;
    const completed = completedC3Child(prefix, parent, result, fibre.payload.childGraphFunctionRef, child.closureContractRef);
    if (completed === null) return null;
    nativeResult = completed.result;
  }
  const nativeFibre = one(events, e => e.kind === "c_call_fibre_selected" && e.aggregateId === nativeResult.aggregateId && sameScope(e, nativeResult) && record(e.payload) &&
    e.payload.implementationRef === implementationRef && e.payload.implementationBindingRef === bindingRef);
  return nativeFibre !== null && same(bridge.value, input.entry) && record(bridge.judgment.payload) &&
    bridge.judgment.payload.judgmentRef === routePayload.judgmentRef && route.causationEventRefs.includes(bridge.judgment.eventId) &&
    bridge.judgment.admissionOrdinal < route.admissionOrdinal && route.admissionOrdinal < call.admissionOrdinal ? nativeResult : null;
}
