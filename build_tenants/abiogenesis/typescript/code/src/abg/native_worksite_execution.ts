import { indexedRuntimeEvents, isOwnedRuntimeEventPrefix, isValidationRuntimeEventPrefix, runtimeEventAtPrefix, runtimeEventSelectorExtent } from "./event_prefix.js";
import type { RuntimeEventPrefix } from "./event_prefix.js";
import { isDeepStrictEqual } from "node:util";
import { projectReacquiredNativeWorkCommandSourceAtPrefix } from "./native_work_reacquisition.js";
/** Native-work source alternative at the existing C2 admission boundary. */
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { isNativeWorksiteCommandExecutionTask, type NativeWorksiteCommandExecutionTask } from "../product/worksite_command_execution.js";
import { NATIVE_WORKSPACE_WORK_IDS as native, isNativeWorkspaceWorkObservation, isNativeWorkspaceWorkFailure, nativeWorkspacePathWithin } from "../product/native_workspace_work.js";
import { WORKSITE_COMMAND_EXECUTION_IDS as c2 } from "../product/worksite_command_execution_identity.js";
import { isWorksiteFileReplaceRequest } from "../product/worksite_effect.js";
import { runtimePrefixComputation, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix, hasAdmittedGovernanceSourceUse } from "./invocation_execution_truth.js";
import type { ExecutionBasis } from "./execution_basis.js";
import type { DurablePrefixCoordinate, RuntimeEvent } from "./event_store.js";
const record = (v: unknown): v is Readonly<Record<string, JsonValue>> => typeof v === "object" && v !== null && !Array.isArray(v);
const same = (a: unknown, b: unknown) => a === b || isDeepStrictEqual(a, b) || canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);
const one = <T>(events: readonly T[], predicate: (e: T) => boolean) => {
  const rows = events.filter(predicate); return rows.length === 1 ? rows[0]! : null;
};
type EventEnvelope = Omit<RuntimeEvent, "payload">;
const envelopes = (prefix: RuntimeEventPrefix, key: string): readonly EventEnvelope[] =>
  isOwnedRuntimeEventPrefix(prefix) || isValidationRuntimeEventPrefix(prefix)
    ? Array.from(prefix.selection.select(key).rows(), row => row.envelope) : indexedRuntimeEvents(prefix, key);
const bodies = (prefix: RuntimeEventPrefix, key: string, kind: string): readonly RuntimeEvent[] =>
  envelopes(prefix, key).filter(row => row.kind === kind).map(row => {
    const value = runtimeEventAtPrefix(prefix, row.eventId);
    if (value === undefined) throw new TypeError("selected native source event is absent");
    return value;
  });

const NATIVE_TASK_PROOF = Symbol("native_command_task_proof");
const NATIVE_SOURCE_PROOF = Symbol("native_command_source_proof");
type NativeSource = Readonly<{ sourceBasis: ExecutionBasis; sourceResult: RuntimeEvent;
  sourceJudgment: RuntimeEvent; sourceClosedEvent: RuntimeEvent }>;
type NativeTaskFact = Readonly<{ eventRef: string; payloadDigest: string; admissionOrdinal: number;
  field: "rawInputValue" | "value"; taskDigest: string }>;
type NativeSourceFact = Readonly<{ workspaceId: string; sourceDigest: string; sourceResultRef: string; sourceBasisRef: string;
  relatedCount: number; relatedLastOrdinal: number; basisCount: number; basisLastOrdinal: number;
  sourceJudgmentRef: string; sourceClosedEventRef: string }>;
/** @internal Product validation is retained once for the owned immutable task. Copies
 * must match the whole established value, never merely its claimed digest. */
export function admittedNativeTask(prefix: ValidatedRuntimeEventPrefix, task: unknown): NativeWorksiteCommandExecutionTask | null;
/** @internal */
export function admittedNativeTask(prefix: RuntimeEventPrefix, task: unknown): NativeWorksiteCommandExecutionTask | null;
export function admittedNativeTask(prefix: RuntimeEventPrefix, task: unknown): NativeWorksiteCommandExecutionTask | null {
  const tasks = isOwnedRuntimeEventPrefix(prefix)
    ? runtimePrefixComputation(prefix, NATIVE_TASK_PROOF, () => new Map<string, NativeTaskFact>()) : null;
  const owned = record(task) && typeof task.taskRef === "string"
    ? indexedRuntimeEvents(prefix, "native-command-task:" + task.taskRef).flatMap(event => {
      if (!record(event.payload)) return [];
      const payload = event.payload;
      return (["rawInputValue", "value"] as const).map(field => ({ event, field, value: payload[field] }));
    })
      .find(row => record(row.value) && row.value.taskRef === task.taskRef && same(row.value, task)) : undefined;
  const selected = owned?.value ?? task;
  const known = record(selected) && typeof selected.taskRef === "string" ? tasks?.get(selected.taskRef) : undefined;
  if (owned !== undefined && known !== undefined && known.eventRef === owned.event.eventId &&
      known.payloadDigest === owned.event.payloadDigest && known.admissionOrdinal === owned.event.admissionOrdinal &&
      known.field === owned.field && record(selected) && selected.taskDigest === known.taskDigest)
    return selected as unknown as NativeWorksiteCommandExecutionTask;
  if (!isNativeWorksiteCommandExecutionTask(selected)) return null;
  // Only established physical-owner applicability coordinates survive. Raw
  // copies still match the whole selected value and validate without a receipt.
  if (owned !== undefined) tasks?.set(selected.taskRef, { eventRef: owned.event.eventId,
    payloadDigest: owned.event.payloadDigest, admissionOrdinal: owned.event.admissionOrdinal,
    field: owned.field, taskDigest: selected.taskDigest });
  return selected;
}
/** Existing admitted producer relation, shared by C2 and semantic native-source
 * adapters. This authenticates provenance; each consuming owner retains its
 * same-Run, current-subject and effect-scope obligations. */
export function projectNativeWorkspaceWorkSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix,
  source: NativeWorksiteCommandExecutionTask["sourceNativeWork"]): Readonly<NativeSource> | null;
/** @internal */
export function projectNativeWorkspaceWorkSourceAtPrefix(prefix: RuntimeEventPrefix,
  source: NativeWorksiteCommandExecutionTask["sourceNativeWork"]): Readonly<NativeSource> | null;
export function projectNativeWorkspaceWorkSourceAtPrefix(prefix: RuntimeEventPrefix,
  source: NativeWorksiteCommandExecutionTask["sourceNativeWork"]): Readonly<NativeSource> | null {
  if (!isNativeWorkspaceWorkObservation(source)) return null;
  const graphFunctionRef = source.task.assessment === undefined ? native.graphFunctionRef : native.assessmentGraphFunctionRef;
  const implementationRef = native.implementationRef;
  const implementationBindingRef = native.implementationBindingRef;
  const facts = isOwnedRuntimeEventPrefix(prefix)
    ? runtimePrefixComputation(prefix, NATIVE_SOURCE_PROOF, () => new Map<string, NativeSourceFact>()) : null;
  const known = facts?.get(source.provenance.cCallRef);
  const related = facts === null ? null : runtimeEventSelectorExtent(prefix, "related:" + source.provenance.cCallRef);
  const knownBasis = known === undefined ? null : runtimeEventSelectorExtent(prefix, "basis:" + known.sourceBasisRef);
  // This memo belongs to the authentic physical owner/generation. Exact append
  // bucket versions establish unchanged membership without copying or hashing
  // completed stdout/liveness rows. Changed versions rederive every predicate.
  const unchanged = known !== undefined && related !== null && knownBasis !== null &&
    known.relatedCount === related.count && known.relatedLastOrdinal === related.lastOrdinal &&
    known.basisCount === knownBasis.count && known.basisLastOrdinal === knownBasis.lastOrdinal;
  const result = unchanged ? runtimeEventAtPrefix(prefix, known.sourceResultRef) ?? null :
    one(bodies(prefix, "related:" + source.provenance.cCallRef, "c_call_result_admitted"), e => e.aggregateId === source.provenance.cCallRef);
  if (result === null || typeof result.basisId !== "string" || !record(result.payload) ||
    result.graphFunctionRef !== graphFunctionRef || result.payload.contractRef !== native.observationContractRef ||
    result.payload.resultClass !== "success" || !same(result.payload.value, source) ||
    result.payload.valueDigest !== sha256Canonical(source as unknown as JsonValue) || !Array.isArray(result.payload.evidenceRefs)) return null;
  const payload = result.payload;
  const basis = projectExactExecutionBasisAtPrefix(prefix, result.basisId);
  if (basis === null || basis.graphFunctionRef !== graphFunctionRef || !same(basis.rawInputValue, source.task) ||
    basis.workspaceBindingId !== source.task.workspaceBinding.bindingId || basis.workspaceBindingDigest !== source.task.workspaceBinding.bindingDigest) return null;
  if (unchanged && known.workspaceId === source.task.workspaceAuthorityBasis.workspaceId &&
      known.sourceDigest === payload.valueDigest && known.sourceBasisRef === result.basisId) {
    const judgment = runtimeEventAtPrefix(prefix, known.sourceJudgmentRef), closed = runtimeEventAtPrefix(prefix, known.sourceClosedEventRef);
    if (judgment !== undefined && closed !== undefined)
      return Object.freeze({ sourceBasis: basis, sourceResult: result, sourceJudgment: judgment, sourceClosedEvent: closed });
  }
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, basis.invocationAdmissionRef);
  if (invocation === null || invocation.workspaceBindingId !== source.task.workspaceBinding.bindingId ||
    invocation.workspaceBindingDigest !== source.task.workspaceBinding.bindingDigest || invocation.workspaceId !== source.task.workspaceAuthorityBasis.workspaceId) return null;
  const fibre = one(bodies(prefix, "related:" + result.aggregateId, "c_call_fibre_selected"), e => e.aggregateId === result.aggregateId &&
    e.basisId === result.basisId && e.runId === result.runId && e.graphCallId === result.graphCallId && record(e.payload) &&
    e.payload.regime === "F_P" && e.payload.implementationRef === implementationRef && e.payload.implementationBindingRef === implementationBindingRef);
  const evidence = one(bodies(prefix, "related:" + result.aggregateId, "c_call_evidenced"), e => e.aggregateId === result.aggregateId &&
    e.basisId === result.basisId && e.runId === result.runId && e.graphCallId === result.graphCallId && record(e.payload) &&
    (payload.evidenceRefs as readonly JsonValue[]).includes(e.payload.evidenceRef!) && e.payload.evidenceClass === "probabilistic_transport" &&
    e.payload.implementationRef === implementationRef && e.payload.transportDigest === source.provenance.transportDigest &&
    e.payload.outputDigest === payload.valueDigest);
  const judgment = one(bodies(prefix, "related:" + result.aggregateId, "c_call_judged"), e => e.aggregateId === result.aggregateId &&
    e.basisId === result.basisId && e.runId === result.runId && e.graphCallId === result.graphCallId && record(e.payload) &&
    e.payload.resultRef === payload.resultRef && e.payload.resultDigest === payload.resultDigest && e.payload.judgment === "advance" &&
    e.admissionOrdinal > result.admissionOrdinal && e.causationEventRefs.includes(result.eventId));
  const closed = one(bodies(prefix, "basis:" + result.basisId, "graph_call_closed"), e => e.basisId === result.basisId &&
    e.runId === result.runId && e.graphCallId === result.graphCallId && record(e.payload) &&
    e.payload.closureContractRef === basis.closureContractRef);
  if (fibre === null || evidence === null || judgment === null || closed === null ||
    fibre.admissionOrdinal >= evidence.admissionOrdinal || evidence.admissionOrdinal >= result.admissionOrdinal ||
    closed.admissionOrdinal <= judgment.admissionOrdinal) return null;
  const value = Object.freeze({ sourceBasis: basis, sourceResult: result, sourceJudgment: judgment, sourceClosedEvent: closed });
  if (facts !== null && related !== null) {
    const basisExtent = runtimeEventSelectorExtent(prefix, "basis:" + result.basisId);
    facts.set(source.provenance.cCallRef, { workspaceId: source.task.workspaceAuthorityBasis.workspaceId,
      sourceDigest: payload.valueDigest as string, sourceResultRef: result.eventId, sourceBasisRef: result.basisId,
      relatedCount: related.count, relatedLastOrdinal: related.lastOrdinal,
      basisCount: basisExtent.count, basisLastOrdinal: basisExtent.lastOrdinal,
      sourceJudgmentRef: judgment.eventId, sourceClosedEventRef: closed.eventId });
  }
  return value;
}

/** Pure projection. No caller-created observation or result gains admission. */
export function projectNativeWorkCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix,
  task: NativeWorksiteCommandExecutionTask): Readonly<NativeSource> | null;
/** @internal */
export function projectNativeWorkCommandSourceAtPrefix(prefix: RuntimeEventPrefix,
  task: NativeWorksiteCommandExecutionTask): Readonly<NativeSource> | null;
export function projectNativeWorkCommandSourceAtPrefix(prefix: RuntimeEventPrefix,
  task: NativeWorksiteCommandExecutionTask): Readonly<NativeSource> | null {
  const admittedTask = admittedNativeTask(prefix, task);
  if (admittedTask === null || admittedTask.sourceNativeWork.task.assessment !== undefined) return null;
  const source = projectNativeWorkspaceWorkSourceAtPrefix(prefix, admittedTask.sourceNativeWork);
  return source === null || worksiteCommandSourcesInvalidatedAfter(prefix, source.sourceResult.admissionOrdinal,
    admittedTask.workspaceAuthorityBasis.canonicalRoot, admittedTask.protectedObservations.map(row => row.subject.relativePath),
    admittedTask.sourceReacquisition?.request.currentContext.readRoots) ? null : source;
}

/** Ordinary consumer preparation may use the exported pure constructor. Its
 * selected native producer must have completed in this same admitted Run. */
export function projectSameRunNativeWorkCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
  parentBasis: ExecutionBasis; parentCCallRef: string; runId: string; task: NativeWorksiteCommandExecutionTask;
}>, currentOwnerPrefix?: DurablePrefixCoordinate): Readonly<Readonly<{
    sourceBasis: ExecutionBasis;
    sourceResult: RuntimeEvent;
    sourceJudgment: RuntimeEvent;
    sourceClosedEvent: RuntimeEvent;
}>> | null;
/** @internal */
export function projectSameRunNativeWorkCommandSourceAtPrefix(prefix: RuntimeEventPrefix, input: Readonly<{
  parentBasis: ExecutionBasis; parentCCallRef: string; runId: string; task: NativeWorksiteCommandExecutionTask;
}>, currentOwnerPrefix?: DurablePrefixCoordinate): Readonly<Readonly<{
    sourceBasis: ExecutionBasis;
    sourceResult: RuntimeEvent;
    sourceJudgment: RuntimeEvent;
    sourceClosedEvent: RuntimeEvent;
}>> | null;
export function projectSameRunNativeWorkCommandSourceAtPrefix(prefix: RuntimeEventPrefix, input: Readonly<{
  parentBasis: ExecutionBasis; parentCCallRef: string; runId: string; task: NativeWorksiteCommandExecutionTask;
}>, currentOwnerPrefix?: DurablePrefixCoordinate): Readonly<Readonly<{
    sourceBasis: ExecutionBasis;
    sourceResult: RuntimeEvent;
    sourceJudgment: RuntimeEvent;
    sourceClosedEvent: RuntimeEvent;
}>> | null {
  if (input.task.sourceReacquisition !== undefined) return projectReacquiredNativeWorkCommandSourceAtPrefix(prefix, input, currentOwnerPrefix);
  const source = projectNativeWorkCommandSourceAtPrefix(prefix, input.task);
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, input.parentBasis.invocationAdmissionRef);
  const retained = source !== null && invocation !== null && hasAdmittedGovernanceSourceUse(invocation, source.sourceResult);
  if (source === null || !retained && (source.sourceResult.runId !== input.runId ||
    source.sourceBasis.invocationAdmissionRef !== input.parentBasis.invocationAdmissionRef ||
    source.sourceBasis.invocationRef !== input.parentBasis.invocationRef) ||
    !retained && (source.sourceBasis.rootImplementationSetRef !== input.parentBasis.rootImplementationSetRef ||
    source.sourceBasis.rootImplementationSetDigest !== input.parentBasis.rootImplementationSetDigest) ||
    source.sourceBasis.workspaceBindingId !== input.parentBasis.workspaceBindingId ||
    source.sourceBasis.workspaceBindingDigest !== input.parentBasis.workspaceBindingDigest) return null;
  const call = one(indexedRuntimeEvents(prefix, "related:" + input.parentCCallRef), e => e.kind === "c_call_opened" &&
    e.aggregateId === input.parentCCallRef && e.basisId === input.parentBasis.basisRef && e.runId === input.runId &&
    record(e.payload) && e.payload.callClass === "workflow" && e.payload.childGraphFunctionRef === c2.graphFunctionRef);
  return call !== null && call.admissionOrdinal > source.sourceClosedEvent.admissionOrdinal &&
    invocation !== null && invocation.capabilityGrants.length === 1 && same(invocation.capabilityGrants[0], input.task.capabilityGrant)
    ? source : null;
}

/** @internal Currentness of selected C2 files, independent of their source arm.
 * This is the same admitted write/failure relation used for native producers. */
export function worksiteCommandSourcesInvalidatedAfter(prefix: ValidatedRuntimeEventPrefix, afterOrdinal: number,
  canonicalRoot: string, selectedPaths: readonly string[], readRoots?: readonly string[]): boolean;
/** @internal */
export function worksiteCommandSourcesInvalidatedAfter(prefix: RuntimeEventPrefix, afterOrdinal: number,
  canonicalRoot: string, selectedPaths: readonly string[], readRoots?: readonly string[]): boolean;
export function worksiteCommandSourcesInvalidatedAfter(prefix: RuntimeEventPrefix, afterOrdinal: number,
  canonicalRoot: string, selectedPaths: readonly string[], readRoots?: readonly string[]): boolean {
  const selected = new Set(selectedPaths);
  const invalidates = (path: string) => readRoots === undefined ? selected.has(path)
    : nativeWorkspacePathWithin(path, readRoots);
  // A later admitted mutation invalidates only the selected files it touches.
  // Physical currentness is additionally checked by the unchanged C2 owner
  // before creating manifests and immediately before helper launch.
  return indexedRuntimeEvents(prefix, "worksite-observation-dependency").some(e => {
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
