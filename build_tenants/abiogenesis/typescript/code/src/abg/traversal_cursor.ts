import type { GtlGraph } from "../gtl/contracts.js";
import { continuationCBatchContext, deriveCContinuationTarget, deriveCEnclosingRetryTopology, deriveCRetryTarget,
  deriveCStructuralTarget, resolveCProgramLocus, resolveCProgramTermAtSourcePath } from "../gtl/source_path.js";
import { projectRetainedWorksiteInputAtPrefix } from "./worksite_input_provenance.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isGraphValidation, type GraphValidation } from "../validator/graph.js";
import { sampleNativeEventTime } from "./native_event_time.js";
import {
  hasAdmittedExecutionBasisAtPrefix,
  rehydrateExecutionBasisAtPrefix,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  constructRunActiveFluent,
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
} from "./event_calculus.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventTransactionAtDurablePrefix,
  readActiveRuntimeTransactionAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  indexedRuntimeEvents,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  hasOpenedTraversalScopeAtPrefix,
  type OpenedTraversalScope,
} from "./open_call.js";
import type { RuntimeEvent } from "./event_store.js";

export interface TraversalCursorCandidate {
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

export type TraversalCursorBody = Omit<
  TraversalCursorCandidate,
  "kind" | "schemaVersion" | "cursorRef" | "cursorDigest"
>;

export interface TraversalCursorAdmission {
  readonly kind: "traversal_cursor_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly cursorRef: string;
  readonly cursorDigest: Sha256Digest;
  readonly traversalScopeRef: string;
  readonly executionBasisRef: string;
  readonly admissionEventRef: string;
  readonly successorPrefix: DurablePrefixCoordinate;
}

export interface TraversalCursorAdmissionRefusal {
  readonly kind: "traversal_cursor_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "basis_mismatch"
    | "cursor_mismatch"
    | "cursor_not_initial"
    | "cursor_repeated"
    | "graph_mismatch"
    | "scope_mismatch";
  readonly message: string;
}

export type TraversalCursorAdmissionResult =
  | TraversalCursorAdmission
  | TraversalCursorAdmissionRefusal;

const cursorAdmissions = new WeakSet<object>();

function isJsonRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function refusal(
  code: TraversalCursorAdmissionRefusal["code"],
  message: string,
): TraversalCursorAdmissionRefusal {
  return {
    kind: "traversal_cursor_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function cursorBody(cursor: TraversalCursorBody): JsonValue {
  return {
    programRef: cursor.programRef,
    executionBasisRef: cursor.executionBasisRef,
    traversalScopeRef: cursor.traversalScopeRef,
    runId: cursor.runId,
    graphCallId: cursor.graphCallId,
    frameId: cursor.frameId,
    graphRef: cursor.graphRef,
    inputRef: cursor.inputRef,
    inputDigest: cursor.inputDigest,
    currentNodeRef: cursor.currentNodeRef,
    position: cursor.position,
    termPath: cursor.termPath,
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
  };
}

export function constructTraversalCursorCandidate(
  body: TraversalCursorBody,
): TraversalCursorCandidate {
  const cursorDigest = sha256Canonical(cursorBody(body));
  return deepFreeze({
    kind: "traversal_cursor" as const,
    schemaVersion: "5.0.0" as const,
    cursorRef:
      `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...body,
    termPath: [...body.termPath],
    retryPath: [...body.retryPath],
  });
}

/** The three existing cursor origins share one identity and scope relation.
 * A route carries its target identity, not a duplicate cursor/input body. */
export function traversalCursorAdmissionEventsAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  cursor: Readonly<{
    cursorRef: string; runId: string; graphCallId: string; frameId: string;
    executionBasisRef: string;
  }>,
): readonly RuntimeEvent[] {
  return indexedRuntimeEvents(prefix, "cursor-origin:" + cursor.cursorRef).filter((candidate) =>
    candidate.runId === cursor.runId && candidate.graphCallId === cursor.graphCallId &&
    candidate.frameId === cursor.frameId &&
    isJsonRecord(candidate.payload) &&
    (candidate.kind === "fh_interaction_resume_admitted"
      ? candidate.payload.successorCursor !== undefined && isJsonRecord(candidate.payload.successorCursor) &&
        candidate.payload.successorCursor.executionBasisRef === cursor.executionBasisRef
      : candidate.basisId === cursor.executionBasisRef) &&
    (
      (
        candidate.aggregateType === "frame" &&
        candidate.aggregateId === cursor.frameId &&
        candidate.kind === "traversal_cursor_entered" &&
        candidate.payload.cursorRef === cursor.cursorRef
      ) ||
      (
        candidate.aggregateType === "frame" &&
        candidate.aggregateId === cursor.frameId &&
        candidate.kind === "traversal_route_admitted" &&
        candidate.payload.targetCursorRef === cursor.cursorRef
      ) ||
      (
        candidate.aggregateType === "continuation" &&
        candidate.kind === "fh_interaction_resume_admitted" &&
        candidate.frameId === cursor.frameId &&
        candidate.payload.successorCursorRef === cursor.cursorRef
      )
    )
  );
}

export function traversalCursorAdmissionDigest(event: RuntimeEvent): JsonValue | undefined {
  if (!isJsonRecord(event.payload)) return undefined;
  return event.kind === "traversal_cursor_entered" ? event.payload.cursorDigest
    : event.kind === "traversal_route_admitted" ? event.payload.targetCursorDigest
    : event.kind === "fh_interaction_resume_admitted" ? event.payload.successorCursorDigest : undefined;
}

export function traversalCursorAdmissionEventRefAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  cursor: TraversalCursorCandidate,
): string | null {
  if (!isTraversalCursorCandidate(cursor)) return null;
  const event = traversalCursorAdmissionEventsAtPrefix(prefix, cursor)
    .find(candidate => traversalCursorAdmissionDigest(candidate) === cursor.cursorDigest);
  return event?.eventId ?? null;
}

export function isTraversalCursorCandidate(
  cursor: TraversalCursorCandidate,
): boolean {
  const expectedDigest = sha256Canonical(cursorBody(cursor));
  return cursor.kind === "traversal_cursor" &&
    cursor.schemaVersion === "5.0.0" &&
    cursor.cursorDigest === expectedDigest &&
    cursor.cursorRef ===
      `traversal-cursor://abiogenesis/${expectedDigest.slice("sha256:".length)}`;
}

export function hasAdmittedTraversalCursorAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  cursor: TraversalCursorCandidate,
): boolean {
  return traversalCursorAdmissionEventRefAtPrefix(prefix, cursor) !== null;
}

interface TraversalInputOrigin {
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly value: JsonValue;
  readonly event: RuntimeEvent | null;
  readonly retained?: true;
}

/** Select the admitted origin by reference through the existing prefix index.
 * Retry references may repeat an earlier origin; equal values never select one. */
function* selectedTraversalInputOrigins(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>,
  execution: ExecutionBasis, inputRef: string): Generator<TraversalInputOrigin> {
  if (execution.rawInputAdmissionRef === inputRef)
    yield { inputRef, inputDigest: execution.rawInputDigest, value: execution.rawInputValue, event: null };
  for (const materialization of graph.fanOutMaterializations) {
    const member = materialization.members.find(candidate => candidate.memberRef === inputRef);
    if (member !== undefined) yield { inputRef, inputDigest: member.memberDigest, value: member.value, event: null };
  }
  for (const event of indexedRuntimeEvents(prefix, "input-origin:" + inputRef)) {
    if (!isJsonRecord(event.payload)) continue;
    const p = event.payload;
    const origin = event.kind === "c_call_result_admitted" ? [p.resultRef, p.valueDigest, p.value]
      : event.kind === "fh_interaction_resume_admitted" ? [p.successorInputRef, p.successorInputDigest, p.successorInputValue]
      : event.kind === "fan_out_completion_admitted" ? [p.outputVectorRef, p.outputVectorDigest, p.outputVector]
      : event.kind === "retry_attempt_opened" ? [p.inputRef, p.inputDigest, p.inputValue]
      : event.kind === "traversal_route_admitted" && isJsonRecord(p.boundInput)
        ? [p.boundInput.admissionRef, p.boundInput.subjectDigest, p.boundInput.value]
      : event.kind === "traversal_route_admitted" && isJsonRecord(p.graphSpanReentryProjection)
        ? [p.graphSpanReentryProjection.targetInputRef, p.graphSpanReentryProjection.targetInputDigest, p.graphSpanReentryProjection.targetInput]
      : null;
    if (origin !== null && typeof origin[0] === "string" && typeof origin[1] === "string" && origin[2] !== undefined)
      yield { inputRef: origin[0], inputDigest: origin[1] as Sha256Digest, value: origin[2], event,
        ...(event.kind === "traversal_route_admitted" && isJsonRecord(p.boundInput) ? { retained: true as const } : {}) };
  }
}

/** A current input is one admitted cursor's exact reference, value and origin.
 * Both execution and historical recovery consume this read-only relation. */
export function projectTraversalInputAtPrefix(prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>, execution: ExecutionBasis, cursor: TraversalCursorCandidate): TraversalInputOrigin | null {
  if (cursor.executionBasisRef !== execution.basisRef || cursor.graphRef !== graph.materializationRef ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, cursor)) return null;
  for (const origin of selectedTraversalInputOrigins(prefix, graph, execution, cursor.inputRef)) {
    if (origin.inputRef !== cursor.inputRef || origin.inputDigest !== cursor.inputDigest) continue;
    if (sha256Canonical(origin.value) !== cursor.inputDigest) return null;
    if (origin.retained) {
      const retained = projectRetainedWorksiteInputAtPrefix(prefix, origin.event!);
      if (retained === null || retained.entryBasis.basisRef !== execution.basisRef ||
        retained.input.admissionRef !== cursor.inputRef || retained.input.subjectDigest !== cursor.inputDigest) return null;
    }
    return origin;
  }
  return null;
}

type CursorIdentity = Pick<TraversalCursorCandidate,
  "cursorRef" | "cursorDigest" | "runId" | "graphCallId" | "frameId" | "executionBasisRef">;
type InputCoordinate = Readonly<{ inputRef: string; inputDigest: Sha256Digest }>;

function cursorCoordinate(source: TraversalCursorCandidate) {
  return { nodeRef: source.currentNodeRef, termPath: source.termPath, taskOrdinal: source.taskOrdinal,
    attempt: source.attempt, retryPath: source.retryPath, inputRef: source.inputRef, inputDigest: source.inputDigest };
}

function inputCoordinate(ref: JsonValue | undefined, digest: JsonValue | undefined): InputCoordinate | null {
  return typeof ref === "string" && typeof digest === "string" && digest.startsWith("sha256:")
    ? { inputRef: ref, inputDigest: digest as Sha256Digest } : null;
}

function eventById(prefix: ValidatedRuntimeEventPrefix, ref: JsonValue | undefined): RuntimeEvent | null {
  if (typeof ref !== "string") return null;
  const events = indexedRuntimeEvents(prefix, "id:" + ref);
  return events.length === 1 ? events[0]! : null;
}

function sameCoordinates(a: readonly string[] | readonly number[], b: readonly string[] | readonly number[]): boolean {
  return a.length === b.length && a.every((part, index) => part === b[index]);
}

/** Select a batch entry from this cursor's actual ancestry, including its outer
 * task and retry coordinates. This is a local projection, not retained state. */
function enclosingBatchEntry(graph: Readonly<GtlGraph>, source: TraversalCursorCandidate,
  ancestry: readonly TraversalCursorCandidate[]): TraversalCursorCandidate | undefined {
  const batch = continuationCBatchContext(graph.template, source.currentNodeRef, source.termPath);
  if (batch === null || "kind" in batch) return undefined;
  const topology = deriveCEnclosingRetryTopology(graph, { nodeRef: source.currentNodeRef, termPath: batch.batchTermPath });
  if (topology.kind === "c_source_path_refusal") return undefined;
  const retryPath = source.retryPath.slice(0, topology.entries.length);
  const taskIndex = batch.batchTermPath.lastIndexOf("tasks");
  const taskOrdinal = taskIndex < 0 ? null : Number(batch.batchTermPath[taskIndex + 1]);
  const attempt = retryPath.at(-1) ?? (source.retryPath.length === 0 ? source.attempt : 1);
  for (let i = ancestry.length - 1; i >= 0; i--) {
    const entry = ancestry[i]!;
    if (entry.currentNodeRef === source.currentNodeRef && sameCoordinates(entry.termPath, batch.batchTermPath) &&
      entry.taskOrdinal === taskOrdinal && entry.attempt === attempt && sameCoordinates(entry.retryPath, retryPath)) return entry;
  }
  return undefined;
}

/** Completed retry progress names its exact completion witness. Follow that
 * named dependency only; fan-out and F_H completion retain their own inputs. */
function routeCompletedInput(prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent,
  source: TraversalCursorCandidate): InputCoordinate | null {
  if (!isJsonRecord(route.payload)) return null;
  const p = route.payload;
  if (isJsonRecord(p.boundInput)) return inputCoordinate(p.boundInput.admissionRef, p.boundInput.subjectDigest);
  let witness = eventById(prefix, route.causationEventRefs[0]);
  let before = route.admissionOrdinal;
  while (witness !== null && witness.kind === "retry_progress_recorded" && isJsonRecord(witness.payload) &&
    witness.payload.progressClass === "completed") {
    if (witness.admissionOrdinal >= before) return null;
    before = witness.admissionOrdinal;
    witness = eventById(prefix, witness.payload.completionWitnessEventRef);
  }
  if (witness === null || witness.admissionOrdinal >= before || !isJsonRecord(witness.payload)) return null;
  if (witness.kind === "fan_out_completion_admitted")
    return inputCoordinate(witness.payload.outputVectorRef, witness.payload.outputVectorDigest);
  if (witness.kind === "fh_interaction_resume_admitted")
    return inputCoordinate(witness.payload.successorInputRef, witness.payload.successorInputDigest);
  if (p.cCallRef === null) return source;
  if (typeof p.cCallRef !== "string") return null;
  const results = indexedRuntimeEvents(prefix, "aggregate:c_call:" + p.cCallRef).filter(event =>
    event.kind === "c_call_result_admitted" && event.admissionOrdinal < route.admissionOrdinal &&
    event.runId === source.runId && event.graphCallId === source.graphCallId && event.frameId === source.frameId);
  return results.length === 1 && isJsonRecord(results[0]!.payload)
    ? inputCoordinate(results[0]!.payload.resultRef, results[0]!.payload.valueDigest) : null;
}

/** Reconstruct only the selected admitted cursor chain. Each actual transition
 * has one GTL target and one cursor hash; unrelated input origins are never
 * enumerated or proposed as cursor bodies. Raw admission remains independent. */
function projectCursorAncestry(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>,
  selected: CursorIdentity): readonly TraversalCursorCandidate[] | null {
  const origins: RuntimeEvent[] = [];
  let ref = selected.cursorRef, digest = selected.cursorDigest, before = Infinity;
  while (true) {
    const matches = traversalCursorAdmissionEventsAtPrefix(prefix, { ...selected, cursorRef: ref });
    const event = matches.length === 1 ? matches[0]! : null;
    if (event === null || event.admissionOrdinal >= before || traversalCursorAdmissionDigest(event) !== digest ||
      !isJsonRecord(event.payload)) return null;
    origins.push(event);
    before = event.admissionOrdinal;
    if (event.kind === "traversal_cursor_entered") break;
    let payload = event.payload;
    if (event.kind === "fh_interaction_resume_admitted") {
      const opened = eventById(prefix, payload.openedEventRef);
      if (opened?.kind !== "fh_interaction_opened" || opened.admissionOrdinal >= before ||
        opened.runId !== selected.runId || opened.graphCallId !== selected.graphCallId || opened.frameId !== selected.frameId ||
        !isJsonRecord(opened.payload)) return null;
      payload = { sourceCursorRef: opened.payload.heldCursorRef!, sourceCursorDigest: opened.payload.heldCursorDigest! };
    }
    if (typeof payload.sourceCursorRef !== "string" || typeof payload.sourceCursorDigest !== "string") return null;
    ref = payload.sourceCursorRef; digest = payload.sourceCursorDigest as Sha256Digest;
  }
  const initial = origins.pop()!;
  const p = initial.payload as Readonly<Record<string, JsonValue>>;
  const input = inputCoordinate(p.inputRef, p.inputDigest);
  if (input === null || typeof p.programRef !== "string" || typeof p.traversalScopeRef !== "string" ||
    p.executionBasisRef !== selected.executionBasisRef || p.materializationRef !== graph.materializationRef ||
    !Array.isArray(p.termPath) || !p.termPath.every(part => typeof part === "string") ||
    !sameCoordinates(p.termPath as string[], ["node", graph.template.startNodeRef, "c"]) ||
    p.taskOrdinal !== null || p.attempt !== 1 || !Array.isArray(p.retryPath) || p.retryPath.length !== 0) return null;
  let current = constructTraversalCursorCandidate({
    programRef: p.programRef, executionBasisRef: selected.executionBasisRef, traversalScopeRef: p.traversalScopeRef,
    runId: selected.runId, graphCallId: selected.graphCallId, frameId: selected.frameId, graphRef: graph.materializationRef,
    currentNodeRef: graph.template.startNodeRef, position: "at_term", termPath: p.termPath as string[],
    taskOrdinal: null, attempt: 1, retryPath: [], ...input,
  });
  if (current.cursorRef !== p.cursorRef || current.cursorDigest !== p.cursorDigest) return null;
  const ancestry = [current];
  for (const event of origins.reverse()) {
    const payload = event.payload as Readonly<Record<string, JsonValue>>;
    let next: TraversalCursorCandidate;
    if (event.kind === "fh_interaction_resume_admitted") {
      if (!isJsonRecord(payload.successorCursor)) return null;
      next = payload.successorCursor as unknown as TraversalCursorCandidate;
      const resumedInput = inputCoordinate(payload.successorInputRef, payload.successorInputDigest);
      if (resumedInput === null || !isInteractionResumeCursorSuccessorAtPrefix(prefix, current, resumedInput, next)) return null;
    } else {
      const coordinate = cursorCoordinate(current);
      const term = resolveCProgramTermAtSourcePath(graph.template, current.currentNodeRef, current.termPath);
      if (term.kind === "c_source_path_refusal") return null;
      let target;
      if (payload.routeKind === "re_enter" && isJsonRecord(payload.graphSpanReentryProjection)) {
        const projection = payload.graphSpanReentryProjection;
        if (typeof projection.targetProgramLocusRef !== "string") return null;
        const locus = resolveCProgramLocus(graph.template, projection.targetProgramLocusRef);
        const reentryInput = inputCoordinate(projection.targetInputRef, projection.targetInputDigest);
        if (locus.kind === "c_source_path_refusal" || reentryInput === null) return null;
        target = { kind: "c_traversal_target" as const, nodeRef: locus.nodeRef, termPath: locus.termPath,
          taskOrdinal: null, attempt: current.attempt + 1, retryPath: [], ...reentryInput };
      } else if (payload.routeKind === "retry" && payload.cCallRef !== null) {
        const progress = eventById(prefix, event.causationEventRefs[0]);
        if (progress?.kind !== "retry_progress_recorded" || progress.admissionOrdinal >= event.admissionOrdinal ||
          !isJsonRecord(progress.payload) || progress.payload.progressClass !== "retry") return null;
        const retryInput = inputCoordinate(progress.payload.inputRef, progress.payload.inputDigest);
        if (retryInput === null) return null;
        target = deriveCRetryTarget(graph, coordinate, retryInput);
      } else if (payload.cCallRef === null && (payload.routeKind === "advance" || payload.routeKind === "retry")) {
        target = deriveCStructuralTarget(graph, coordinate, payload.routeKind, enclosingBatchEntry(graph, current, ancestry));
      } else if (payload.routeKind === "advance") {
        const completed = routeCompletedInput(prefix, event, current);
        if (completed === null) return null;
        target = deriveCContinuationTarget(graph, coordinate, completed, enclosingBatchEntry(graph, current, ancestry));
      } else return null;
      if (target === null || target.kind === "c_source_path_refusal" || target.nodeRef === null ||
        target.termPath === null || target.attempt === null || target.inputRef === null || target.inputDigest === null) return null;
      const { kind: _kind, schemaVersion: _version, cursorRef: _ref, cursorDigest: _digest, ...body } = current;
      next = constructTraversalCursorCandidate({ ...body, currentNodeRef: target.nodeRef, termPath: target.termPath,
        taskOrdinal: target.taskOrdinal, attempt: target.attempt, retryPath: target.retryPath,
        inputRef: target.inputRef, inputDigest: target.inputDigest });
    }
    const expectedRef = event.kind === "fh_interaction_resume_admitted" ? payload.successorCursorRef : payload.targetCursorRef;
    if (next.cursorRef !== expectedRef || next.cursorDigest !== traversalCursorAdmissionDigest(event)) return null;
    ancestry.push(next); current = next;
  }
  return current.cursorRef === selected.cursorRef && current.cursorDigest === selected.cursorDigest ? ancestry : null;
}

/** Historical calls retain their opened cursor even after failure/closure. */
export function projectOpenedCCallTraversalInputAtPrefix(prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>, cCallRef: string) {
  const openedRows = indexedRuntimeEvents(prefix, "aggregate:c_call:" + cCallRef).filter(e => e.kind === "c_call_opened");
  const opened = openedRows.length === 1 ? openedRows[0] : undefined;
  if (opened === undefined || !isJsonRecord(opened.payload) || opened.payload.callClass !== "leaf" ||
    typeof opened.basisId !== "string" || typeof opened.payload.programLocusRef !== "string" ||
    typeof opened.payload.cursorRef !== "string" || typeof opened.payload.cursorDigest !== "string") return null;
  const execution = rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
  const locus = resolveCProgramLocus(graph.template, opened.payload.programLocusRef);
  if (execution === null || locus.kind === "c_source_path_refusal" || typeof opened.runId !== "string" ||
    typeof opened.graphCallId !== "string" || typeof opened.frameId !== "string" || !Array.isArray(opened.payload.retryPath)) return null;
  const ancestry = projectCursorAncestry(prefix, graph, { cursorRef: opened.payload.cursorRef,
    cursorDigest: opened.payload.cursorDigest as Sha256Digest, executionBasisRef: execution.basisRef,
    runId: opened.runId, graphCallId: opened.graphCallId, frameId: opened.frameId });
  const cursor = ancestry?.at(-1);
  if (cursor === undefined || cursor.programRef !== execution.programRef || cursor.currentNodeRef !== locus.nodeRef ||
    !sameCoordinates(cursor.termPath, locus.termPath) || cursor.taskOrdinal !== opened.payload.taskOrdinal ||
    cursor.attempt !== opened.payload.attempt || !sameCoordinates(cursor.retryPath, opened.payload.retryPath.map(Number))) return null;
  const origin = traversalCursorAdmissionEventsAtPrefix(prefix, cursor);
  if (origin.length !== 1 || origin[0]!.admissionOrdinal >= opened.admissionOrdinal ||
    opened.causationEventRefs[0] !== origin[0]!.eventId) return null;
  const input = projectTraversalInputAtPrefix(prefix, graph, execution, cursor);
  return input === null ? null : { cursor, input, execution };
}

/** Select the actual enclosing batch entry on this cursor's admitted ancestry.
 * No invocation-entry fallback, new state ledger or stored cursor copy. */
export function deriveAdmittedCContinuationTarget(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate, completed: Readonly<{ inputRef: string; inputDigest: Sha256Digest }>) {
  const coordinate = cursorCoordinate(source);
  const batch = continuationCBatchContext(graph.template, source.currentNodeRef, source.termPath);
  if (batch === null || "kind" in batch || graph.fanOutMaterializations.some(m => m.batchRef === batch.batchRef))
    return deriveCContinuationTarget(graph, coordinate, completed);
  const ancestry = projectCursorAncestry(prefix, graph, source);
  const entry = ancestry === null ? undefined : enclosingBatchEntry(graph, source, ancestry);
  if (entry === undefined) return { kind: "c_source_path_refusal" as const, schemaVersion: "5.0.0" as const,
    code: "invalid_source_path" as const, message: "C.batch continuation lacks its admitted enclosing entry" };
  return deriveCContinuationTarget(graph, coordinate, completed, entry);
}

/** Identity completion has the same batch-entry transfer as a completed leaf. */
export function deriveAdmittedCStructuralTarget(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate, routeKind: "advance" | "retry") {
  const coordinate = { nodeRef: source.currentNodeRef, termPath: source.termPath, taskOrdinal: source.taskOrdinal,
    attempt: source.attempt, retryPath: source.retryPath, inputRef: source.inputRef, inputDigest: source.inputDigest };
  const term = resolveCProgramTermAtSourcePath(graph.template, source.currentNodeRef, source.termPath);
  if (term.kind !== "c_identity" || routeKind !== "advance") return deriveCStructuralTarget(graph, coordinate, routeKind);
  const next = deriveAdmittedCContinuationTarget(prefix, graph, source, source);
  if (next.kind === "c_source_path_refusal") return next;
  return deriveCStructuralTarget(graph, coordinate, routeKind,
    next.inputRef === null || next.inputDigest === null ? undefined : { inputRef: next.inputRef, inputDigest: next.inputDigest });
}

export function isInteractionResumeCursorSuccessorAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  heldCursor: TraversalCursorCandidate,
  successorInput: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
  }>,
  successorCursor: TraversalCursorCandidate,
): boolean {
  try {
    return hasAdmittedTraversalCursorAtPrefix(prefix, heldCursor) &&
      isTraversalCursorCandidate(heldCursor) &&
      isTraversalCursorCandidate(successorCursor) &&
      heldCursor.position === "at_term" &&
      successorInput.inputRef.length > 0 &&
      successorInput.inputDigest.startsWith("sha256:") &&
      successorCursor.programRef === heldCursor.programRef &&
      successorCursor.executionBasisRef === heldCursor.executionBasisRef &&
      successorCursor.traversalScopeRef === heldCursor.traversalScopeRef &&
      successorCursor.runId === heldCursor.runId &&
      successorCursor.graphCallId === heldCursor.graphCallId &&
      successorCursor.frameId === heldCursor.frameId &&
      successorCursor.graphRef === heldCursor.graphRef &&
      successorCursor.inputRef === successorInput.inputRef &&
      successorCursor.inputDigest === successorInput.inputDigest &&
      successorCursor.currentNodeRef === heldCursor.currentNodeRef &&
      successorCursor.position === heldCursor.position &&
      sha256Canonical(successorCursor.termPath as unknown as JsonValue) ===
        sha256Canonical(heldCursor.termPath as unknown as JsonValue) &&
      successorCursor.taskOrdinal === heldCursor.taskOrdinal &&
      successorCursor.attempt === heldCursor.attempt &&
      sha256Canonical(successorCursor.retryPath as unknown as JsonValue) ===
        sha256Canonical(heldCursor.retryPath as unknown as JsonValue);
  } catch {
    return false;
  }
}

export function isTraversalCursorAdmission(value: object): boolean {
  return cursorAdmissions.has(value);
}

export function admitInitialTraversalCursor(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  graph: Readonly<GtlGraph>,
  graphValidation: GraphValidation,
  cursor: TraversalCursorCandidate,
  basis: RuntimeAdmissionBasis,
): TraversalCursorAdmissionResult {
  const transaction = admitRuntimeEventTransactionAtDurablePrefix(
    store,
    predecessorPrefix,
    () => {
  const durableEvents = readActiveRuntimeTransactionAtDurablePrefix(
    store, predecessorPrefix, { durableOnly: true },
  );
  const authorityPrefix = selectValidatedRuntimeEventPrefix(durableEvents);
  if (!hasAdmittedExecutionBasisAtPrefix(authorityPrefix, executionBasis)) {
    return refusal("basis_mismatch", "cursor admission requires the exact admitted ExecutionBasis");
  }
  if (
    !hasOpenedTraversalScopeAtPrefix(authorityPrefix, scope) ||
    scope.executionBasisRef !== executionBasis.basisRef ||
    scope.executionBasisDigest !== executionBasis.basisDigest
  ) {
    return refusal("scope_mismatch", "cursor admission requires this basis's opened traversal scope");
  }
  if (
    !isGraphValidation(graphValidation) ||
    graph.materializationRef !== executionBasis.graphRef ||
    graph.materializationDigest !== executionBasis.graphDigest ||
    graphValidation.validationRef !== executionBasis.graphValidationRef ||
    graphValidation.graphRef !== graph.materializationRef ||
    graphValidation.graphDigest !== graph.materializationDigest
  ) {
    return refusal("graph_mismatch", "cursor admission requires the exact validated original GTL Graph");
  }
  const expectedDigest = sha256Canonical(cursorBody(cursor));
  if (
    cursor.kind !== "traversal_cursor" ||
    cursor.schemaVersion !== "5.0.0" ||
    cursor.cursorDigest !== expectedDigest ||
    cursor.cursorRef !==
      `traversal-cursor://abiogenesis/${expectedDigest.slice("sha256:".length)}` ||
    cursor.programRef !== executionBasis.programRef ||
    cursor.executionBasisRef !== executionBasis.basisRef ||
    cursor.traversalScopeRef !== scope.scopeRef ||
    cursor.runId !== scope.runId ||
    cursor.graphCallId !== scope.graphCallId ||
    cursor.frameId !== scope.frameId ||
    cursor.graphRef !== graph.materializationRef ||
    cursor.inputRef !== executionBasis.rawInputAdmissionRef ||
    cursor.inputDigest !== executionBasis.rawInputDigest
  ) {
    return refusal("cursor_mismatch", "cursor identity or opened lineage differs from the admitted basis");
  }
  if (
    cursor.position !== "at_term" ||
    cursor.currentNodeRef !== graph.template.startNodeRef ||
    cursor.termPath.join("\0") !==
      ["node", graph.template.startNodeRef, "c"].join("\0") ||
    cursor.taskOrdinal !== null ||
    cursor.attempt !== 1 ||
    cursor.retryPath.length !== 0
  ) {
    return refusal("cursor_not_initial", "initial cursor must name the exact root C term and initial coordinates");
  }
  if (
    traversalCursorAdmissionEventRefAtPrefix(authorityPrefix, cursor) !== null ||
    durableEvents.some((event) =>
      event.kind === "traversal_cursor_entered" && event.aggregateId === scope.frameId)
  ) {
    return refusal("cursor_repeated", "one frame cannot admit a second initial traversal cursor");
  }
  const runPrefix = selectValidatedRuntimeEventPrefix(durableEvents, {
    runId: scope.runId,
  });
  const currentRunTruth = deriveRuntimeEventCalculusProjection(runPrefix);
  if (
    !holdsAt(currentRunTruth, constructRunActiveFluent(scope.runId)) ||
    !holdsAt(
      currentRunTruth,
      constructRuntimeFluent({
        name: "graph_call_active",
        identity: scope.graphCallId,
      }),
    ) ||
    !holdsAt(
      currentRunTruth,
      constructRuntimeFluent({
        name: "frame_active",
        identity: scope.frameId,
      }),
    )
  ) {
    return refusal("scope_mismatch", "initial cursor must immediately extend the opened frame truth");
  }

  const event = admitRuntimeEvent(store, {
    kind: "traversal_cursor_entered",
    eventTime: sampleNativeEventTime(),
    aggregateType: "frame",
    aggregateId: scope.frameId,
    parentAggregateId: scope.graphCallId,
    causationEventRefs: [scope.frameOpenEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    frameLineageId: scope.frameLineageId,
    payload: {
      cursorRef: cursor.cursorRef,
      cursorDigest: cursor.cursorDigest,
      programRef: executionBasis.programRef,
      programDigest: executionBasis.programDigest,
      graphFunctionRef: executionBasis.graphFunctionRef,
      graphFunctionDigest: executionBasis.graphFunctionDigest,
      materializationRef: graph.materializationRef,
      materializationDigest: graph.materializationDigest,
      termPath: cursor.termPath,
      taskOrdinal: cursor.taskOrdinal,
      attempt: cursor.attempt,
      retryPath: cursor.retryPath,
      inputRef: cursor.inputRef,
      inputDigest: cursor.inputDigest,
      traversalScopeRef: scope.scopeRef,
      traversalScopeDigest: scope.scopeDigest,
      executionBasisRef: executionBasis.basisRef,
      executionBasisDigest: executionBasis.basisDigest,
    },
  });
  return deepFreeze({
    kind: "traversal_cursor_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    cursorRef: cursor.cursorRef,
    cursorDigest: cursor.cursorDigest,
    traversalScopeRef: scope.scopeRef,
    executionBasisRef: executionBasis.basisRef,
    admissionEventRef: event.eventId,
  });
    },
  );
  if (transaction.value.kind !== "traversal_cursor_admission") {
    return transaction.value;
  }
  if (transaction.successorPrefix === null) {
    throw new TypeError(
      "initial traversal cursor admission did not produce a durable successor",
    );
  }
  const admission = deepFreeze({
    ...transaction.value,
    successorPrefix: transaction.successorPrefix,
  }) as TraversalCursorAdmission;
  cursorAdmissions.add(admission);
  return admission;
}
