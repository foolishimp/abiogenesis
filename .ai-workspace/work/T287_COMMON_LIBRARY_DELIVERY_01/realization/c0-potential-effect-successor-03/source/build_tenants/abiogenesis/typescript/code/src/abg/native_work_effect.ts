import { isDeepStrictEqual } from "node:util";
import { isJsonRecord as isRecord } from "../shared/admission_predicates.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { NATIVE_WORKSPACE_WORK_IDS as nativeIds, isNativeWorkspaceWorkTask,
  nativeWorkspaceWorkGraphFunctionRef, type NativeWorkspaceWorkTask } from "../product/native_workspace_work.js";
import { indexedRuntimeEvents, runtimeEventAtPrefix, runtimeEventPrefixExtent,
  selectValidatedRuntimeEventPrefix, validatedRuntimeEventPrefixBeforeEvent,
  type RuntimeEventPrefix } from "./event_prefix.js";
import type { RuntimeEvent } from "./event_store.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { rehydrateAdmittedImplementationSetAtPrefix } from "./execution_basis.js";

function causeActor(event: RuntimeEvent): string | null {
  if (!isRecord(event.payload) || typeof event.payload.actorInvocationRef !== "string" ||
    typeof event.payload.processRef !== "string") return null;
  if (event.kind === "actor_process_termination_unconfirmed") return event.aggregateType === "process" &&
    event.aggregateId === event.payload.processRef && event.parentAggregateId === event.payload.actorInvocationRef
    ? event.payload.actorInvocationRef : null;
  return event.kind === "actor_invocation_failed" && event.aggregateType === "actor_invocation" &&
    event.payload.failureClass === "transport_exception" && event.payload.disposition === "failure" &&
    event.payload.actorInvocationRef === event.aggregateId && event.payload.cCallRef === event.parentAggregateId
    ? event.aggregateId : null;
}

/** @internal Select causal support only for the actual cause at this cut. Keys
 * narrow acquisition; the task projector below owns authentication. */
export function nativeWorkUnknownEffectDependencies(prefix: RuntimeEventPrefix, event: RuntimeEvent): readonly RuntimeEvent[] {
  const actorRef = causeActor(event);
  if (actorRef === null || !isDeepStrictEqual(runtimeEventAtPrefix(prefix, event.eventId), event)) return [];
  const before = validatedRuntimeEventPrefixBeforeEvent(prefix, event.eventId);
  const selected = new Map<string, RuntimeEvent>();
  const add = (key: string) => { for (const row of indexedRuntimeEvents(before, key)) selected.set(row.eventId, row); };
  add("related:" + actorRef);
  for (const row of [...selected.values()]) if (row.kind === "actor_invocation_started" && isRecord(row.payload)) {
    if (typeof row.payload.cCallRef === "string") add("aggregate:c_call:" + row.payload.cCallRef);
    if (typeof row.payload.transportBindingRef === "string") add("aggregate:transport_binding:" + row.payload.transportBindingRef);
  }
  if (typeof event.basisId === "string") add("basis:" + event.basisId);
  for (const row of [...selected.values()]) if (row.kind === "basis_admitted" && isRecord(row.payload)) {
    if (typeof row.payload.invocationAdmissionRef === "string") add("payload:invocationAdmissionRef:" + row.payload.invocationAdmissionRef);
    if (typeof row.payload.implementationSetRef === "string") add("payload:implementationSetRef:" + row.payload.implementationSetRef);
  }
  for (const row of [...selected.values()]) if (row.kind === "invocation_admitted")
    for (const ref of row.causationEventRefs) add("id:" + ref);
  return [...selected.values()].sort((a, b) => a.admissionOrdinal - b.admissionOrdinal);
}

/** @internal An admitted native task establishes possible writable scope only.
 * The optional prefix is strictly BEFORE the cause; currentness callers first
 * select the actual cause from their admitted cut. Without a prefix this is a
 * pure candidate-effect calculation, not event admission. */
export function projectNativeWorkUnknownEffectTask(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[],
  ownedPrefix?: RuntimeEventPrefix): NativeWorkspaceWorkTask | null {
  const actorRef = causeActor(event);
  if (actorRef === null || !isRecord(event.payload) || typeof event.basisId !== "string" ||
    typeof event.runId !== "string" || typeof event.graphCallId !== "string" || typeof event.frameId !== "string" ||
    typeof event.graphFunctionRef !== "string" || sha256Canonical(event.payload) !== event.payloadDigest) return null;
  try {
    const prefix = ownedPrefix ?? selectValidatedRuntimeEventPrefix(Object.isFrozen(priorEvents) ? priorEvents : Object.freeze([...priorEvents]));
    if (runtimeEventPrefixExtent(prefix).lastOrdinal >= event.admissionOrdinal) return null;
    const one = (kind: RuntimeEvent["kind"], key: string, predicate: (row: RuntimeEvent) => boolean) => {
      const rows = (ownedPrefix === undefined ? priorEvents : indexedRuntimeEvents(prefix, key))
        .filter(row => row.kind === kind && predicate(row));
      return rows.length === 1 && isRecord(rows[0]!.payload) &&
        sha256Canonical(rows[0]!.payload) === rows[0]!.payloadDigest ? rows[0]! : null;
    };
    const actor = one("actor_invocation_started", "aggregate:actor_invocation:" + actorRef, row => row.aggregateId === actorRef);
    if (actor === null) return null;
    const ap = actor.payload as Readonly<Record<string, JsonValue>>;
    if (typeof ap.cCallRef !== "string" || typeof ap.transportBindingRef !== "string") return null;
    const callRef = ap.cCallRef;
    const opened = one("c_call_opened", "aggregate:c_call:" + callRef, row => row.aggregateId === callRef);
    const fibre = one("c_call_fibre_selected", "aggregate:c_call:" + callRef, row => row.aggregateId === callRef);
    const binding = one("actor_transport_binding_admitted", "aggregate:transport_binding:" + ap.transportBindingRef,
      row => row.aggregateId === ap.transportBindingRef);
    const process = one("actor_process_started", "related:" + actorRef, row => row.parentAggregateId === actorRef);
    if (opened === null || fibre === null || binding === null || process === null ||
      [opened, fibre, actor, binding, process].some(row => row.basisId !== event.basisId ||
        row.runId !== event.runId || row.graphCallId !== event.graphCallId || row.frameId !== event.frameId ||
        row.graphFunctionRef !== event.graphFunctionRef) ||
      !(opened.admissionOrdinal < fibre.admissionOrdinal && fibre.admissionOrdinal < binding.admissionOrdinal &&
        binding.admissionOrdinal < actor.admissionOrdinal && actor.admissionOrdinal < process.admissionOrdinal &&
        process.admissionOrdinal < event.admissionOrdinal)) return null;
    const op = opened.payload as Readonly<Record<string, JsonValue>>;
    const fp = fibre.payload as Readonly<Record<string, JsonValue>>;
    const bp = binding.payload as Readonly<Record<string, JsonValue>>;
    const pp = process.payload as Readonly<Record<string, JsonValue>>;
    if (opened.aggregateType !== "c_call" || fibre.aggregateType !== "c_call" || actor.aggregateType !== "actor_invocation" ||
      binding.aggregateType !== "transport_binding" || process.aggregateType !== "process" ||
      actor.parentAggregateId !== callRef || binding.parentAggregateId !== callRef ||
      ap.actorInvocationRef !== actorRef || op.callClass !== "leaf" || fp.callClass !== "leaf" || fp.regime !== "F_P" ||
      fp.implementationRef !== nativeIds.implementationRef || fp.implementationBindingRef !== nativeIds.implementationBindingRef ||
      bp.implementationRef !== fp.implementationRef || bp.implementationBindingRef !== fp.implementationBindingRef ||
      ap.implementationRef !== fp.implementationRef || bp.cCallRef !== callRef || pp.cCallRef !== callRef ||
      pp.actorInvocationRef !== actorRef || pp.processRef !== event.payload.processRef || process.aggregateId !== pp.processRef ||
      !Number.isSafeInteger(pp.processId) || (pp.processId as number) <= 0 ||
      ap.transportBindingDigest !== bp.transportBindingDigest ||
      (event.kind === "actor_invocation_failed" && (event.parentAggregateId !== callRef ||
        event.payload.transportBindingRef !== binding.aggregateId || event.payload.transportBindingDigest !== bp.transportBindingDigest)) ||
      !fibre.causationEventRefs.includes(opened.eventId) || !binding.causationEventRefs.includes(fibre.eventId) ||
      !actor.causationEventRefs.includes(binding.eventId) || !process.causationEventRefs.includes(actor.eventId)) return null;
    const { transportBindingRef, transportBindingDigest, ...bindingBody } = bp;
    if (sha256Canonical(bindingBody) !== transportBindingDigest || transportBindingRef !== binding.aggregateId ||
      transportBindingRef !== `transport-binding://abiogenesis/${String(transportBindingDigest).slice(7)}`) return null;
    const basis = projectExactExecutionBasisAtPrefix(prefix, event.basisId);
    if (basis === null || !isNativeWorkspaceWorkTask(basis.rawInputValue)) return null;
    const task = basis.rawInputValue;
    const invocation = projectExactInvocationAdmissionAtPrefix(prefix, basis.invocationAdmissionRef);
    const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, basis.implementationSetRef);
    const selected = set?.rows.filter(row => row.graphFunctionRef === basis.graphFunctionRef &&
      row.programLocusRef === op.programLocusRef && row.implementationBindingRef === fp.implementationBindingRef);
    if (basis.graphFunctionRef !== nativeWorkspaceWorkGraphFunctionRef(task) || event.graphFunctionRef !== basis.graphFunctionRef ||
      basis.workspaceBindingId !== task.workspaceBinding.bindingId || basis.workspaceBindingDigest !== task.workspaceBinding.bindingDigest ||
      basis.actorRef !== task.capabilityGrant.actorRef || bp.actorRef !== basis.actorRef || ap.actorRef !== basis.actorRef ||
      bp.inputDigest !== basis.rawInputDigest || ap.inputDigest !== basis.rawInputDigest || invocation === null ||
      invocation.workspaceBindingId !== basis.workspaceBindingId || invocation.workspaceBindingDigest !== basis.workspaceBindingDigest ||
      invocation.actorRef !== basis.actorRef || !invocation.capabilityGrants.some(grant =>
        sha256Canonical(grant as unknown as JsonValue) === sha256Canonical(task.capabilityGrant as unknown as JsonValue)) ||
      set?.implementationSetDigest !== basis.implementationSetDigest || selected?.length !== 1 ||
      selected[0]!.implementationRef !== nativeIds.implementationRef || selected[0]!.inputContractRef !== nativeIds.taskContractRef) return null;
    const basisEvent = runtimeEventAtPrefix(prefix, basis.admissionEventRef);
    const invocationEvent = runtimeEventAtPrefix(prefix, invocation.admissionEventRef);
    const setEvent = set === null ? undefined : runtimeEventAtPrefix(prefix, set.admissionEventRef);
    if (basisEvent === undefined || invocationEvent === undefined || setEvent === undefined ||
      !(invocationEvent.admissionOrdinal < basisEvent.admissionOrdinal && setEvent.admissionOrdinal < basisEvent.admissionOrdinal &&
        basisEvent.admissionOrdinal < opened.admissionOrdinal)) return null;
    return task;
  } catch { return null; }
}
