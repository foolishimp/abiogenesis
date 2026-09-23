import { isDeepStrictEqual } from "node:util";
import { projectReacquiredNativeWorkCommandSourceAtPrefix } from "./native_work_reacquisition.js";
/** Native-work source alternative at the existing C2 admission boundary. */
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { isNativeWorksiteCommandExecutionTask, type NativeWorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import { NATIVE_WORKSPACE_WORK_IDS as native, isNativeWorkspaceWorkObservation, isNativeWorkspaceWorkFailure, nativeWorkspacePathWithin } from "../product/native_workspace_work.js";
import { WORKSITE_COMMAND_EXECUTION_IDS as c2 } from "../product/worksite_command_execution_identity.js";
import { isWorksiteFileReplaceRequest } from "../product/worksite_effect.js";
import { runtimeEventsFromValidatedPrefix, runtimePrefixComputation, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import type { ExecutionBasis } from "./execution_basis.js";
import type { DurablePrefixCoordinate, RuntimeEvent } from "./event_store.js";
const record = (v: unknown): v is Readonly<Record<string, JsonValue>> => typeof v === "object" && v !== null && !Array.isArray(v);
const same = (a: unknown, b: unknown) => a === b || isDeepStrictEqual(a, b) || canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);
const one = (events: readonly RuntimeEvent[], predicate: (e: RuntimeEvent) => boolean) => {
  const rows = events.filter(predicate); return rows.length === 1 ? rows[0]! : null;
};

const NATIVE_TASK_PROOF = Symbol("native_command_task_proof");
const NATIVE_SOURCE_PROOF = Symbol("native_command_source_proof");
type NativeSource = Readonly<{ sourceBasis: ExecutionBasis; sourceResult: RuntimeEvent;
  sourceJudgment: RuntimeEvent; sourceClosedEvent: RuntimeEvent }>;
type NativeSourceFact = { source: NativeWorksiteCommandExecutionTask["sourceNativeWork"]; workspaceId: string;
  rows: readonly RuntimeEvent[]; value: NativeSource };
/** @internal Product validation is retained once for the owned immutable task. Copies
 * must match the whole established value, never merely its claimed digest. */
export function admittedNativeTask(prefix: ValidatedRuntimeEventPrefix, task: unknown): NativeWorksiteCommandExecutionTask | null {
  const tasks = runtimePrefixComputation(prefix, NATIVE_TASK_PROOF, () => new Map<string, NativeWorksiteCommandExecutionTask>());
  const known = record(task) && typeof task.taskRef === "string" ? tasks.get(task.taskRef) : undefined;
  if (known !== undefined && same(known, task)) return known;
  const owned = runtimeEventsFromValidatedPrefix(prefix).flatMap(e => record(e.payload) ?
    [e.payload.rawInputValue, e.payload.value] : []).find(v => record(v) && record(task) && v.taskRef === task.taskRef && same(v, task));
  const selected = owned ?? task;
  if (!isNativeWorksiteCommandExecutionTask(selected)) return null;
  // Retain only the actual event-owned immutable input/Result, never a
  // caller's shallow freeze or equal-looking digest. Raw copies still validate.
  if (owned !== undefined) tasks.set(selected.taskRef, selected);
  return selected;
}
/** Pure projection. No caller-created file observation or result gains admission. */
export function projectNativeWorkCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, task: NativeWorksiteCommandExecutionTask): Readonly<{
  sourceBasis: ExecutionBasis; sourceResult: RuntimeEvent; sourceJudgment: RuntimeEvent; sourceClosedEvent: RuntimeEvent;
}> | null {
  const admittedTask = admittedNativeTask(prefix, task);
  if (admittedTask === null) return null;
  task = admittedTask;
  const events = runtimeEventsFromValidatedPrefix(prefix), source = admittedTask.sourceNativeWork;
  const result = one(events, e => e.kind === "c_call_result_admitted" && e.aggregateId === source.provenance.cCallRef);
  if (result === null || typeof result.basisId !== "string" || !record(result.payload) ||
    result.graphFunctionRef !== native.graphFunctionRef || result.payload.contractRef !== native.observationContractRef ||
    result.payload.resultClass !== "success" || !same(result.payload.value, source) ||
    result.payload.valueDigest !== sha256Canonical(source as unknown as JsonValue) || !Array.isArray(result.payload.evidenceRefs)) return null;
  const facts = runtimePrefixComputation(prefix, NATIVE_SOURCE_PROOF, () => new Map<string, NativeSourceFact>());
  // Immutable producer facts may survive unrelated append activity. Any change
  // in this producer's admitted evidence/closure membership forces derivation.
  const rows = events.filter(e => e.aggregateId === result.aggregateId || e.basisId === result.basisId);
  const known = facts.get(result.eventId);
  if (known !== undefined && known.workspaceId === task.workspaceAuthorityBasis.workspaceId && same(known.source, source) &&
      rows.length === known.rows.length && rows.every((e, i) => e === known.rows[i]))
    return worksiteCommandSourcesInvalidatedAfter(prefix, result.admissionOrdinal, task.workspaceAuthorityBasis.canonicalRoot,
      task.protectedObservations.map(row => row.subject.relativePath), task.sourceReacquisition?.request.currentContext.readRoots) ? null : known.value;
  const payload = result.payload;
  const basis = projectExactExecutionBasisAtPrefix(prefix, result.basisId);
  if (basis === null || basis.graphFunctionRef !== native.graphFunctionRef || !same(basis.rawInputValue, source.task) ||
    basis.workspaceBindingId !== source.task.workspaceBinding.bindingId || basis.workspaceBindingDigest !== source.task.workspaceBinding.bindingDigest) return null;
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, basis.invocationAdmissionRef);
  if (invocation === null || invocation.workspaceBindingId !== source.task.workspaceBinding.bindingId ||
    invocation.workspaceBindingDigest !== source.task.workspaceBinding.bindingDigest || invocation.workspaceId !== task.workspaceAuthorityBasis.workspaceId) return null;
  const fibre = one(events, e => e.kind === "c_call_fibre_selected" && e.aggregateId === result.aggregateId &&
    e.basisId === result.basisId && e.runId === result.runId && e.graphCallId === result.graphCallId && record(e.payload) &&
    e.payload.regime === "F_P" && e.payload.implementationRef === native.implementationRef && e.payload.implementationBindingRef === native.implementationBindingRef);
  const evidence = one(events, e => e.kind === "c_call_evidenced" && e.aggregateId === result.aggregateId &&
    e.basisId === result.basisId && e.runId === result.runId && e.graphCallId === result.graphCallId && record(e.payload) &&
    (payload.evidenceRefs as readonly JsonValue[]).includes(e.payload.evidenceRef!) && e.payload.evidenceClass === "probabilistic_transport" &&
    e.payload.implementationRef === native.implementationRef && e.payload.transportDigest === source.provenance.transportDigest &&
    e.payload.outputDigest === payload.valueDigest);
  const judgment = one(events, e => e.kind === "c_call_judged" && e.aggregateId === result.aggregateId &&
    e.basisId === result.basisId && e.runId === result.runId && e.graphCallId === result.graphCallId && record(e.payload) &&
    e.payload.resultRef === payload.resultRef && e.payload.resultDigest === payload.resultDigest && e.payload.judgment === "advance" &&
    e.admissionOrdinal > result.admissionOrdinal && e.causationEventRefs.includes(result.eventId));
  const closed = one(events, e => e.kind === "graph_call_closed" && e.basisId === result.basisId &&
    e.runId === result.runId && e.graphCallId === result.graphCallId && record(e.payload) &&
    e.payload.closureContractRef === basis.closureContractRef);
  if (fibre === null || evidence === null || judgment === null || closed === null ||
    fibre.admissionOrdinal >= evidence.admissionOrdinal || evidence.admissionOrdinal >= result.admissionOrdinal ||
    closed.admissionOrdinal <= judgment.admissionOrdinal) return null;
  if (worksiteCommandSourcesInvalidatedAfter(prefix, result.admissionOrdinal, task.workspaceAuthorityBasis.canonicalRoot,
    task.protectedObservations.map(row => row.subject.relativePath), task.sourceReacquisition?.request.currentContext.readRoots)) return null;
  const value = Object.freeze({ sourceBasis: basis, sourceResult: result, sourceJudgment: judgment, sourceClosedEvent: closed });
  facts.set(result.eventId, { source: result.payload.value as unknown as NativeWorksiteCommandExecutionTask["sourceNativeWork"], workspaceId: task.workspaceAuthorityBasis.workspaceId, rows, value });
  return value;
}

/** Ordinary consumer preparation may use the exported pure constructor. Its
 * selected native producer must have completed in this same admitted Run. */
export function projectSameRunNativeWorkCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
  parentBasis: ExecutionBasis; parentCCallRef: string; runId: string; task: NativeWorksiteCommandExecutionTask;
}>, currentOwnerPrefix?: DurablePrefixCoordinate) {
  if (input.task.sourceReacquisition !== undefined) return projectReacquiredNativeWorkCommandSourceAtPrefix(prefix, input, currentOwnerPrefix);
  const source = projectNativeWorkCommandSourceAtPrefix(prefix, input.task);
  if (source === null || source.sourceResult.runId !== input.runId ||
    source.sourceBasis.invocationAdmissionRef !== input.parentBasis.invocationAdmissionRef ||
    source.sourceBasis.invocationRef !== input.parentBasis.invocationRef ||
    source.sourceBasis.rootImplementationSetRef !== input.parentBasis.rootImplementationSetRef ||
    source.sourceBasis.rootImplementationSetDigest !== input.parentBasis.rootImplementationSetDigest) return null;
  const call = one(runtimeEventsFromValidatedPrefix(prefix), e => e.kind === "c_call_opened" &&
    e.aggregateId === input.parentCCallRef && e.basisId === input.parentBasis.basisRef && e.runId === input.runId &&
    record(e.payload) && e.payload.callClass === "workflow" && e.payload.childGraphFunctionRef === c2.graphFunctionRef);
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, input.parentBasis.invocationAdmissionRef);
  return call !== null && call.admissionOrdinal > source.sourceClosedEvent.admissionOrdinal &&
    invocation !== null && invocation.capabilityGrants.length === 1 && same(invocation.capabilityGrants[0], input.task.capabilityGrant)
    ? source : null;
}

/** @internal Currentness of selected C2 files, independent of their source arm.
 * This is the same admitted write/failure relation used for native producers. */
export function worksiteCommandSourcesInvalidatedAfter(prefix: ValidatedRuntimeEventPrefix, afterOrdinal: number,
  canonicalRoot: string, selectedPaths: readonly string[], readRoots?: readonly string[]): boolean {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const selected = new Set(selectedPaths);
  const invalidates = (path: string) => readRoots === undefined ? selected.has(path)
    : nativeWorkspacePathWithin(path, readRoots);
  // A later admitted mutation invalidates only the selected files it touches.
  // Physical currentness is additionally checked by the unchanged C2 owner
  // before creating manifests and immediately before helper launch.
  return events.some(e => {
    if (e.admissionOrdinal <= afterOrdinal || !record(e.payload)) return false;
    if (e.kind === "c_call_evidenced" && e.payload.evidenceClass === "worksite_file_replace" &&
      isWorksiteFileReplaceRequest(e.payload.request)) return e.payload.request.workspaceAuthorityBasis.canonicalRoot ===
        canonicalRoot && invalidates(e.payload.request.subject.relativePath);
    const value = e.kind === "c_call_result_admitted" ? e.payload.value : null;
    return (isNativeWorkspaceWorkObservation(value) || isNativeWorkspaceWorkFailure(value)) &&
      e.aggregateId === value.provenance.cCallRef &&
      (e.graphFunctionRef === native.graphFunctionRef || e.graphFunctionRef === native.assessmentGraphFunctionRef) &&
      value.task.workspaceAuthorityBasis.canonicalRoot === canonicalRoot &&
      (value.changedPaths === null ? (readRoots ?? [...selected]).some(path =>
        nativeWorkspacePathWithin(path, value.task.writeRoots) || value.task.writeRoots.some(root => nativeWorkspacePathWithin(root, [path]))) :
        value.changedPaths.some(invalidates));
  });
}
