import { extendRuntimeEventPrefixForValidation, indexedRuntimeEvents, runtimeEventPrefixDigest } from "./event_prefix.js";
import { readFileSync, lstatSync, realpathSync, type BigIntStats } from "node:fs";
import { dirname } from "node:path";
import { performance } from "node:perf_hooks";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { runtimePrefixComputation, runtimeEventsFromValidatedPrefix, runtimeEventProfileScheduleFromValidatedPrefix, unscopedRuntimeEventPrefix, selectValidatedRuntimeEventPrefix, validatedRuntimeEventPrefixThroughEvent, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import {
  admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  assertHeldEventStoreAtDurablePrefix, admitNativeRuntimeLivenessEvent,
  admitRuntimeEventTransactionAtDurablePrefix, readActiveRuntimeTransactionAtDurablePrefix, ROOT_EVENT_CONTRACT_DIGEST,
  assertRuntimeEventTransactionActive,
  projectRuntimeEventFromValidatedHistory,
  type AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent, type RuntimeEventCandidate,
} from "./event_store.js";
import { rehydrateExecutionBasisAtPrefix } from "./execution_basis.js";
import { projectRuntimeRetryBudgetFacts, hasStructuralIdentityCompletedRouteCausation } from "./retry.js";
import {
  constructRuntimeSystemProbeContract, isRuntimeLivenessBinding, isRuntimeProbeObservation,
  isRuntimeInvocationScope, actorRuntimeProbeSources,
  isRuntimeSystemProbeContract, isRuntimeThresholdObservation,
  runtimeLivenessDigest as digest,
  type RuntimeInvocationScope, type RuntimeLivenessBinding, type RuntimeLivenessObserverProjection,
  type RuntimeProbeObservation, type RuntimeProbeSource, type RuntimeSystemProbeContract,
  type RuntimeThresholdObservation, type RuntimeWatchdogPolicy,
  type RuntimeLivenessReadProjection,
} from "./runtime_liveness_contracts.js";

function record(value: unknown): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function same(a: unknown, b: unknown): boolean { return digest(a) === digest(b); }
/** File revision identifies the producer observation; these timestamps are
 * never an elapsed clock or an inference of liveness/termination. */
export function runtimeAssetRevisionDigest(stat: Pick<BigIntStats, "dev" | "ino" | "size" | "mtimeNs" | "ctimeNs">): Sha256Digest {
  return digest({ device: String(stat.dev), inode: String(stat.ino), size: String(stat.size),
    modifiedRevision: String(stat.mtimeNs), changedRevision: String(stat.ctimeNs) });
}
function one(events: readonly RuntimeEvent[], predicate: (event: RuntimeEvent) => boolean): RuntimeEvent | null {
  const rows = events.filter(predicate); return rows.length === 1 ? rows[0]! : null;
}
export interface RuntimeLivenessContext {
  readonly scope: RuntimeInvocationScope;
  readonly binding: RuntimeLivenessBinding;
  readonly probes: readonly RuntimeSystemProbeContract[];
  readonly declarationEventRef: string;
}

/** Reconstruct predeclared actor probes from admitted owner coordinates, never from observed paths. */
function deriveActorLivenessContext(prefix: ValidatedRuntimeEventPrefix, actorInvocationRef: string): RuntimeLivenessContext | null {
  try {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const started = one(indexedRuntimeEvents(prefix, "kind:actor_invocation_started"), e => e.kind === "actor_invocation_started" && e.aggregateId === actorInvocationRef);
    if (started === null || !record(started.payload)) return null;
    const p = started.payload;
    const bindingEvent = one(indexedRuntimeEvents(prefix, "kind:actor_transport_binding_admitted"), e => e.kind === "actor_transport_binding_admitted" &&
      e.aggregateId === p.transportBindingRef && e.admissionOrdinal < started.admissionOrdinal);
    const b = bindingEvent?.payload;
    if (bindingEvent === null || !record(b) || !isRuntimeLivenessBinding(b.livenessBinding) ||
        bindingEvent.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST || b.livenessBinding.policy === null ||
        !started.causationEventRefs.includes(bindingEvent.eventId) ||
        b.cCallRef !== p.cCallRef || b.actorRef !== p.actorRef || b.workerBindingRef !== p.workerBindingRef ||
        b.transportBindingDigest !== p.transportBindingDigest || b.implementationRef !== p.implementationRef ||
        b.inputDigest !== p.inputDigest || b.dispatchOrdinal !== p.dispatchOrdinal ||
        started.runId !== bindingEvent.runId || started.graphCallId !== bindingEvent.graphCallId ||
        started.frameId !== bindingEvent.frameId || started.basisId !== bindingEvent.basisId) return null;
    const { transportBindingRef: _ref, transportBindingDigest: _digest, ...bindingBody } = b;
    if (digest(bindingBody) !== b.transportBindingDigest ||
        b.transportBindingRef !== `transport-binding://abiogenesis/${String(b.transportBindingDigest).slice(7)}`) return null;
    const basis = rehydrateExecutionBasisAtPrefix(prefix, started.basisId);
    const opened = one(indexedRuntimeEvents(prefix, "kind:c_call_opened"), e => e.kind === "c_call_opened" && e.aggregateId === p.cCallRef);
    const fibre = one(indexedRuntimeEvents(prefix, "kind:c_call_fibre_selected"), e => e.kind === "c_call_fibre_selected" && e.aggregateId === p.cCallRef);
    if (basis === null || opened === null || fibre === null || !record(opened.payload) || !record(fibre.payload) ||
        opened.basisId !== basis.basisRef || fibre.payload.regime !== "F_P" || fibre.payload.callClass !== "leaf" ||
        fibre.payload.implementationRef !== b.implementationRef ||
        fibre.payload.implementationBindingRef !== b.implementationBindingRef ||
        !bindingEvent.causationEventRefs.includes(fibre.eventId) ||
        basis.graphFunctionRef !== started.graphFunctionRef || opened.runId !== started.runId ||
        opened.graphCallId !== started.graphCallId || opened.frameId !== started.frameId) return null;
    const op = opened.payload;
    const attemptDigest = digest({ basisRef: basis.basisRef, cCallRef: p.cCallRef, attempt: op.attempt,
      dispatchOrdinal: p.dispatchOrdinal, actorRef: p.actorRef, workerBindingRef: p.workerBindingRef,
      implementationBindingRef: b.implementationBindingRef, implementationRef: p.implementationRef,
      inputDigest: p.inputDigest, promptDigest: p.promptDigest });
    const actorDigest = digest({ attemptDigest, transportBindingRef: b.transportBindingRef, transportBindingDigest: b.transportBindingDigest });
    if (actorInvocationRef !== `actor-invocation://abiogenesis/${actorDigest.slice(7)}` ||
        b.livenessBinding.clockOriginRef !== `runtime-clock://abiogenesis/${digest({ attemptDigest, transportPlanDigest: b.transportPlanDigest }).slice(7)}` ||
        b.livenessBinding.policy.startupMs !== b.timeoutMs || b.livenessBinding.policy.inactivityMs !== b.timeoutMs ||
        b.livenessBinding.policy.hardCapMs !== b.absoluteTimeoutMs || b.livenessBinding.policy.terminationGraceMs !== b.terminationGraceMs ||
        !same(b.livenessBinding.sources, actorRuntimeProbeSources(b.parser as "claude_stream_json" | "plain_text"))) return null;
    const scope: RuntimeInvocationScope = {
      basisRef: basis.basisRef, programRef: basis.programRef, runId: started.runId!,
      graphFunctionRef: basis.graphFunctionRef, graphCallId: started.graphCallId!, frameId: started.frameId!,
      cCallRef: String(p.cCallRef), programLocusRef: String(op.programLocusRef),
      taskOrdinal: op.taskOrdinal as number | null, vectorIndex: op.vectorIndex as number | null,
      edgeRef: op.edgeRef === null ? null : String(op.edgeRef), attempt: Number(op.attempt),
      actorInvocationRef, actorRef: String(p.actorRef), workerBindingRef: String(p.workerBindingRef),
      backendRef: String(b.agentKey),
    };
    if (!isRuntimeInvocationScope(scope)) return null;
    const liveness = b.livenessBinding;
    const paths = record(b.paths) ? b.paths : {};
    const probes = liveness.sources.map(source => constructRuntimeSystemProbeContract({
      scope, clockOriginRef: liveness.clockOriginRef, source,
      sourceRef: source === "result_artifact" ? String(paths.output) :
        source === "archive" ? String(paths.transport) : `${actorInvocationRef}/${source}`,
      declarationEventRef: bindingEvent.eventId, required: true,
    }));
    return deepFreeze({ scope, binding: liveness, probes, declarationEventRef: bindingEvent.eventId });
  } catch { return null; }
}

export interface RuntimeLivenessBudgetFacts {
  readonly remaining: number | null;
  readonly retryEligible: boolean;
  readonly continuationRef: string | null;
  readonly terminalPolicy: "block" | "escalate" | "reprice_policy";
  /** Existing CCall owner failure signal, not a worker-authored rejection. */
  readonly resultRejectionRef?: string | null;
}

const NON_ACTOR_SOURCES = Object.freeze([
  "graph_progress", "frame_progress", "evaluator_progress", "event_log", "ledger",
  "manifest", "projection", "report", "dossier", "archive", "result_artifact",
] as const satisfies readonly RuntimeProbeSource[]);

/** Existing CCall declarations own non-actor occurrences; observations cannot
 * register a source, borrow an actor clock, or supply an undeclared timeout. */
function deriveCCallLivenessContext(prefix: ValidatedRuntimeEventPrefix, cCallRef: string): RuntimeLivenessContext | null {
  try {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const opened = one(indexedRuntimeEvents(prefix, "kind:c_call_opened"), e => e.kind === "c_call_opened" && e.aggregateId === cCallRef);
    const selected = one(indexedRuntimeEvents(prefix, "kind:c_call_fibre_selected"), e => e.kind === "c_call_fibre_selected" && e.aggregateId === cCallRef);
    if (opened === null || selected === null || !record(opened.payload) || !record(selected.payload) ||
        selected.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST || selected.payload.regime === "F_P" ||
        selected.admissionOrdinal <= opened.admissionOrdinal || !selected.causationEventRefs.includes(opened.eventId) ||
        opened.basisId !== selected.basisId || opened.runId !== selected.runId ||
        opened.graphCallId !== selected.graphCallId || opened.frameId !== selected.frameId ||
        opened.payload.cCallRef !== cCallRef || selected.payload.cCallRef !== cCallRef) return null;
    const basis = rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
    if (basis === null || basis.graphFunctionRef !== opened.graphFunctionRef) return null;
    const p = opened.payload;
    const scope: RuntimeInvocationScope = {
      basisRef: basis.basisRef, programRef: basis.programRef, runId: opened.runId!,
      graphFunctionRef: basis.graphFunctionRef, graphCallId: opened.graphCallId!, frameId: opened.frameId!,
      cCallRef, programLocusRef: String(p.programLocusRef), taskOrdinal: p.taskOrdinal as number | null,
      vectorIndex: p.vectorIndex as number | null, edgeRef: p.edgeRef as string | null, attempt: Number(p.attempt),
      actorInvocationRef: null, actorRef: null, workerBindingRef: null, backendRef: null,
    };
    if (!isRuntimeInvocationScope(scope)) return null;
    const clockOriginRef = `runtime-clock://abiogenesis/${digest({ cCallRef, declarationEventRef: selected.eventId }).slice(7)}`;
    const binding: RuntimeLivenessBinding = { kind: "runtime_liveness_binding", schemaVersion: "5.0.0",
      clockOriginRef, clockKind: "native_monotonic_elapsed", policy: null, sources: NON_ACTOR_SOURCES };
    const probes = binding.sources.map(source => constructRuntimeSystemProbeContract({
      scope, clockOriginRef, source, sourceRef: `${cCallRef}/${source}`, declarationEventRef: selected.eventId, required: true,
    }));
    return deepFreeze({ scope, binding, probes, declarationEventRef: selected.eventId });
  } catch { return null; }
}
const FRAME_PRODUCERS = new Set([
  "frame_opened", "actor_invocation_closed", "actor_invocation_failed", "c_call_evidenced",
  "c_call_result_admitted", "c_call_judged", "traversal_route_admitted", "c_call_fibre_selected", "frame_closed",
]);

/** The opening fact declares the occurrence; a probe never registers it. */
function deriveFrameLivenessContext(prefix: ValidatedRuntimeEventPrefix, frameId: string): RuntimeLivenessContext | null {
  try {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const opened = one(indexedRuntimeEvents(prefix, "kind:frame_opened"), e => e.kind === "frame_opened" && e.aggregateId === frameId);
    if (opened === null || !record(opened.payload) || opened.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST) return null;
    const p = opened.payload;
    const graph = one(indexedRuntimeEvents(prefix, "kind:graph_call_opened"), e => e.kind === "graph_call_opened" && e.aggregateId === opened.graphCallId);
    const basis = rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
    if (graph === null || !record(graph.payload) || basis === null || !opened.causationEventRefs.includes(graph.eventId) ||
        graph.admissionOrdinal >= opened.admissionOrdinal || graph.runId !== opened.runId || graph.basisId !== opened.basisId ||
        graph.graphFunctionRef !== opened.graphFunctionRef || basis.graphFunctionRef !== opened.graphFunctionRef ||
        p.frameId !== frameId || opened.frameId !== frameId || p.graphCallId !== graph.aggregateId || p.runId !== opened.runId ||
        p.executionBasisRef !== basis.basisRef || p.invocationRef !== basis.invocationRef ||
        p.parentFrameId !== (graph.payload.parentFrameId ?? null)) return null;
    const { frameId: _id, frameDigest, ...body } = p;
    if (digest(body) !== frameDigest || frameId !== `frame://abiogenesis/${String(frameDigest).slice(7)}`) return null;
    if (p.parentFrameId !== null && !indexedRuntimeEvents(prefix, "kind:frame_opened").some(e => e.kind === "frame_opened" && e.frameId === p.parentFrameId &&
        e.runId === opened.runId && e.admissionOrdinal < graph.admissionOrdinal && graph.causationEventRefs.includes(e.eventId))) return null;
    const scope: RuntimeInvocationScope = {
      basisRef: basis.basisRef, programRef: basis.programRef, runId: opened.runId!, graphFunctionRef: basis.graphFunctionRef,
      graphCallId: graph.aggregateId, frameId, attempt: Number(p.attempt), cCallRef: null, programLocusRef: null,
      taskOrdinal: null, vectorIndex: null, edgeRef: null, actorInvocationRef: null, actorRef: null, workerBindingRef: null, backendRef: null,
    };
    if (!isRuntimeInvocationScope(scope)) return null;
    const clockOriginRef = `runtime-clock://abiogenesis/${digest({ frameId, declarationEventRef: opened.eventId, attempt: scope.attempt }).slice(7)}`;
    const binding: RuntimeLivenessBinding = { kind: "runtime_liveness_binding", schemaVersion: "5.0.0", clockOriginRef,
      clockKind: "native_monotonic_elapsed", policy: null, sources: ["frame_progress"] };
    const probes = [constructRuntimeSystemProbeContract({ scope, clockOriginRef, source: "frame_progress",
      sourceRef: `${frameId}/frame_progress`, declarationEventRef: opened.eventId, required: true })];
    return deepFreeze({ scope, binding, probes, declarationEventRef: opened.eventId });
  } catch { return null; }
}
function contextForOccurrence(prefix: ValidatedRuntimeEventPrefix, occurrenceRef: string): RuntimeLivenessContext | null {
  return deriveActorLivenessContext(prefix, occurrenceRef) ?? deriveCCallLivenessContext(prefix, occurrenceRef) ?? deriveFrameLivenessContext(prefix, occurrenceRef);
}

function frameFailureApplies(event: RuntimeEvent, scope: RuntimeInvocationScope): boolean {
  return event.kind === "runtime_failure_observed" && event.runId === scope.runId &&
    (event.aggregateType === "run" || event.frameId === scope.frameId && event.basisId === scope.basisRef &&
      event.graphCallId === scope.graphCallId && event.graphFunctionRef === scope.graphFunctionRef);
}

const frameClocks = new WeakMap<AbgEventStore, Map<string, Readonly<{ declarationEventRef: string; startedAt: number }>>>();
export interface NativeFrameBoundarySample { readonly kind: "native_frame_boundary_sample" }
const frameSamples = new WeakMap<NativeFrameBoundarySample, { store: AbgEventStore; capturedAt: number; openingRef?: string }>();
export function captureNativeFrameBoundary(store: AbgEventStore): NativeFrameBoundarySample {
  const sample = Object.freeze({ kind: "native_frame_boundary_sample" as const });
  frameSamples.set(sample, { store, capturedAt: performance.now() });
  return sample;
}
/** Captured by the opening owner before admission, retained only after commit. */
export function retainNativeFrameClock(store: AbgEventStore, opening: RuntimeEvent, sample: NativeFrameBoundarySample): void {
  if (opening.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST) return;
  const physical = frameSamples.get(sample);
  if (physical?.store !== store || physical.openingRef !== opening.eventId) throw new TypeError("frame clock requires its original opening capability");
  const context = projectFrameLivenessContext(selectValidatedRuntimeEventPrefix(store.readAll()), opening.frameId!);
  if (context?.declarationEventRef !== opening.eventId) throw new TypeError("frame clock needs its exact committed opening");
  let clocks = frameClocks.get(store); if (clocks === undefined) { clocks = new Map(); frameClocks.set(store, clocks); }
  if (clocks.has(context.scope.frameId)) throw new TypeError("frame clock cannot restart");
  clocks.set(context.scope.frameId, { declarationEventRef: opening.eventId, startedAt: physical.capturedAt });
  frameSamples.delete(sample);
}
export function discardNativeFrameClock(store: AbgEventStore, frameId: string): void { frameClocks.get(store)?.delete(frameId); }

/** Actual owner boundary. Missing original physical capability means no fresh sample. */
export function observeNativeFrameLiveness(store: AbgEventStore, underlying: RuntimeEvent,
  sample = captureNativeFrameBoundary(store), openingOrigin?: NativeFrameBoundarySample): void {
  assertRuntimeEventTransactionActive(store);
  if (!FRAME_PRODUCERS.has(underlying.kind) || underlying.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST) return;
  const physical = frameSamples.get(sample);
  if (physical?.store !== store) throw new TypeError("foreign frame clock sample");
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll());
  if (!indexedRuntimeEvents(prefix, "id:" + underlying.eventId).some(e => same(e, underlying))) throw new TypeError("frame sample needs its admitted producer");
  const context = projectFrameLivenessContext(prefix, underlying.frameId!);
  if (context === null) throw new TypeError("frame sample lacks its native opening");
  if (openingOrigin !== undefined && (underlying.kind !== "frame_opened" || openingOrigin !== sample || physical.openingRef !== undefined))
    throw new TypeError("frame origin belongs only to its first opening sample");
  const clock = underlying.kind === "frame_opened" && openingOrigin === sample
    ? { declarationEventRef: underlying.eventId, startedAt: physical.capturedAt } : frameClocks.get(store)?.get(context.scope.frameId);
  if (clock?.declarationEventRef !== context.declarationEventRef) return;
  const elapsedMs = underlying.kind === "frame_opened" ? 0 : physical.capturedAt - clock.startedAt;
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new TypeError("frame clock regressed");
  const probe = context.probes[0]!;
  const observation: RuntimeProbeObservation = { kind: "runtime_probe_observation", schemaVersion: "5.0.0",
    probeRef: probe.probeRef, scopeDigest: digest(context.scope), clockOriginRef: context.binding.clockOriginRef, elapsedMs,
    underlyingObservationRef: underlying.eventId, underlyingEventRef: underlying.eventId, sourceDigest: underlying.payloadDigest,
    sourceRevisionDigest: null, evidenceRefs: [underlying.eventId], coverage: "observed", signal: "activity" };
  admitNativeRuntimeLivenessEvent(store, { kind: "runtime_activity_probe_observed", eventTime: underlying.eventTime,
    aggregateType: "graph_call", aggregateId: context.scope.graphCallId, parentAggregateId: context.scope.runId,
    causationEventRefs: [...new Set([context.declarationEventRef, underlying.eventId])], correlationId: underlying.correlationId,
    workflowVersion: "5.0.0", scopeClass: "run", basisId: context.scope.basisRef, runId: context.scope.runId,
    graphFunctionRef: context.scope.graphFunctionRef, graphCallId: context.scope.graphCallId, frameId: context.scope.frameId,
    payload: { probeContract: probe, observation } as unknown as JsonValue });
  if (openingOrigin === sample) physical.openingRef = underlying.eventId;
  else frameSamples.delete(sample);
}

/** All native readers consume the same affected-declaration relation as replay. */
export function projectActorLivenessContext(prefix: ValidatedRuntimeEventPrefix, actorInvocationRef: string): RuntimeLivenessContext | null {
  try { const context = livenessReconstruction(prefix).context(runtimeEventsFromValidatedPrefix(prefix).at(-1)?.admissionOrdinal ?? 0, actorInvocationRef);
    return context?.scope.actorInvocationRef === actorInvocationRef ? context : null; } catch { return null; }
}
export function projectCCallLivenessContext(prefix: ValidatedRuntimeEventPrefix, cCallRef: string): RuntimeLivenessContext | null {
  try { const context = livenessReconstruction(prefix).context(runtimeEventsFromValidatedPrefix(prefix).at(-1)?.admissionOrdinal ?? 0, cCallRef);
    return context?.scope.cCallRef === cCallRef && context.scope.actorInvocationRef === null ? context : null; } catch { return null; }
}
export function projectFrameLivenessContext(prefix: ValidatedRuntimeEventPrefix, frameId: string): RuntimeLivenessContext | null {
  try { const context = livenessReconstruction(prefix).context(runtimeEventsFromValidatedPrefix(prefix).at(-1)?.admissionOrdinal ?? 0, frameId);
    return context?.scope.frameId === frameId && context.scope.actorInvocationRef === null && context.scope.cCallRef === null ? context : null; } catch { return null; }
}

// Physical clock adapter only. Replay never reads this cache. An acquisition
// without the original owner clock leaves fresh elapsed coverage unknown.
const cCallClocks = new WeakMap<AbgEventStore, Map<string, Readonly<{ declarationEventRef: string; startedAt: number }>>>();
export function observeNativeCCallLiveness(store: AbgEventStore, underlying: RuntimeEvent): void {
  assertRuntimeEventTransactionActive(store);
  if (underlying.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST) return;
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll());
  if (!indexedRuntimeEvents(prefix, "id:" + underlying.eventId).some(e => same(e, underlying))) throw new TypeError("CCall progress needs its admitted native producer");
  const context = projectCCallLivenessContext(prefix, underlying.aggregateId);
  if (context === null) return;
  let clocks = cCallClocks.get(store);
  if (clocks === undefined) { clocks = new Map(); cCallClocks.set(store, clocks); }
  if (underlying.kind === "c_call_fibre_selected") {
    clocks.set(context.scope.cCallRef!, { declarationEventRef: context.declarationEventRef, startedAt: performance.now() });
  }
  const clock = clocks.get(context.scope.cCallRef!);
  if (clock?.declarationEventRef !== context.declarationEventRef) return;
  const elapsedMs = underlying.kind === "c_call_fibre_selected" ? 0 : Math.max(0, performance.now() - clock.startedAt);
  const sources: readonly RuntimeProbeSource[] = underlying.kind === "c_call_fibre_selected" ? ["frame_progress", "event_log"] :
    underlying.kind === "c_call_result_admitted" ? ["event_log", "result_artifact"] :
    underlying.kind === "c_call_judged" ? ["graph_progress", "evaluator_progress"] : [];
  for (const source of sources) {
    const probe = context.probes.find(p => p.source === source)!;
    const observation: RuntimeProbeObservation = {
      kind: "runtime_probe_observation", schemaVersion: "5.0.0", probeRef: probe.probeRef,
      scopeDigest: digest(context.scope), clockOriginRef: context.binding.clockOriginRef, elapsedMs,
      underlyingObservationRef: underlying.eventId, underlyingEventRef: underlying.eventId,
      sourceDigest: underlying.payloadDigest, sourceRevisionDigest: null, evidenceRefs: [underlying.eventId], coverage: "observed",
      signal: source === "result_artifact" ? record(underlying.payload) && underlying.payload.resultClass === "success"
        ? "artifact_admitted" : "artifact_rejected" : "activity",
    };
    admitNativeRuntimeLivenessEvent(store, {
      kind: "runtime_activity_probe_observed", eventTime: underlying.eventTime,
      aggregateType: "graph_call", aggregateId: context.scope.graphCallId, parentAggregateId: context.scope.runId,
      causationEventRefs: [...new Set([context.declarationEventRef, underlying.eventId])],
      correlationId: underlying.correlationId, workflowVersion: "5.0.0", scopeClass: "run",
      basisId: context.scope.basisRef, runId: context.scope.runId, graphFunctionRef: context.scope.graphFunctionRef,
      graphCallId: context.scope.graphCallId, frameId: context.scope.frameId,
      payload: { probeContract: probe, observation } as unknown as JsonValue,
    });
  }
  if (underlying.kind === "c_call_judged") clocks.delete(context.scope.cCallRef!);
}
export interface RuntimeLivenessSample {
  readonly clockOriginRef: string;
  readonly elapsedMs: number;
  readonly eventRef: string | null;
}
function probeObservationMatches(prefix: ValidatedRuntimeEventPrefix, context: RuntimeLivenessContext,
  contract: RuntimeSystemProbeContract, observation: RuntimeProbeObservation, ordinal: number,
  reconstruction?: RuntimeLivenessReconstruction, cutOrdinal = ordinal - 1): boolean {
  const events = reconstruction?.facts(cutOrdinal) ?? runtimeEventsFromValidatedPrefix(prefix);
  const findEvent = (ref: string) => reconstruction === undefined ? events.find(e => e.eventId === ref) : reconstruction.event(ref, cutOrdinal);
  if (!isRuntimeSystemProbeContract(contract) || !isRuntimeProbeObservation(observation) ||
      context.probes.filter(p => p.probeRef === contract.probeRef && same(p, contract)).length !== 1 ||
      observation.probeRef !== contract.probeRef || observation.scopeDigest !== digest(context.scope) ||
      observation.clockOriginRef !== context.binding.clockOriginRef) return false;
  const declaration = findEvent(contract.declarationEventRef);
  if (declaration === undefined || declaration.admissionOrdinal >= ordinal) return false;
  if (observation.evidenceRefs.some(ref => { const event = findEvent(ref); return event === undefined || event.admissionOrdinal >= ordinal; })) return false;
  const underlying = observation.underlyingEventRef === null ? null : findEvent(observation.underlyingEventRef);
  if (underlying !== null && underlying !== undefined) {
    if (observation.sourceRevisionDigest !== null) return false;
    if (underlying.admissionOrdinal >= ordinal || underlying.runId !== context.scope.runId ||
        underlying.graphCallId !== context.scope.graphCallId || underlying.frameId !== context.scope.frameId ||
        underlying.basisId !== context.scope.basisRef || !observation.evidenceRefs.includes(underlying.eventId) ||
        underlying.kind === "runtime_activity_probe_observed" || underlying.kind === "runtime_external_interruption_observed") return false;
    const p = underlying.payload;
    if (!record(p)) return false;
    if (context.scope.actorInvocationRef !== null && p.actorInvocationRef !== context.scope.actorInvocationRef &&
        underlying.aggregateId !== context.scope.actorInvocationRef) return false;
    const allowed: Readonly<Partial<Record<RuntimeProbeSource, readonly string[]>>> = {
      stdout: ["actor_process_stdout_observed", "actor_process_started"],
      stderr: ["actor_process_stderr_observed", "actor_process_started"],
      process_lifecycle: ["actor_process_started", "actor_process_exited", "actor_process_spawn_failed", "actor_process_timeout_observed"],
      result_artifact: ["actor_result_artifact_observed", "actor_process_started", "c_call_result_admitted"],
      archive: ["actor_result_artifact_observed", "actor_process_started"],
      structured_output: ["actor_process_stdout_observed", "actor_process_started"],
      tool_progress: ["actor_process_stdout_observed", "actor_process_started"],
      api_progress: ["actor_process_stdout_observed", "actor_process_started"],
      graph_progress: ["graph_call_opened", "c_call_judged", "traversal_route_admitted"],
      frame_progress: ["frame_opened", "traversal_cursor_entered", "c_call_fibre_selected"],
      evaluator_progress: ["assessed", "c_call_judged"],
      event_log: ["c_call_opened", "c_call_fibre_selected", "c_call_result_admitted", "traversal_route_admitted"],
    };
    const frameOccurrence = context.scope.actorInvocationRef === null && context.scope.cCallRef === null;
    if (frameOccurrence) {
      if (contract.source !== "frame_progress" || !FRAME_PRODUCERS.has(underlying.kind) || observation.signal !== "activity" ||
          observation.coverage !== "observed" || underlying.graphFunctionRef !== context.scope.graphFunctionRef) return false;
      if (underlying.kind === "frame_opened") {
        if (underlying.eventId !== context.declarationEventRef || observation.elapsedMs !== 0) return false;
      } else if (underlying.kind === "frame_closed") {
        if (underlying.aggregateId !== context.scope.frameId) return false;
      } else {
        const cCallRef = p.cCallRef;
        if (underlying.kind === "traversal_route_admitted" && cCallRef === null) {
          const source = events.find(e => e.admissionOrdinal < underlying.admissionOrdinal && e.runId === context.scope.runId &&
            e.frameId === context.scope.frameId && e.graphCallId === context.scope.graphCallId && e.basisId === context.scope.basisRef &&
            e.graphFunctionRef === context.scope.graphFunctionRef && record(e.payload) &&
            (e.kind === "traversal_cursor_entered" && e.payload.cursorRef === p.sourceCursorRef ||
              e.kind === "traversal_route_admitted" && e.payload.targetCursorRef === p.sourceCursorRef));
          if (source === undefined ||
              (!(Array.isArray(p.consumedAvailabilityRefs) && p.consumedAvailabilityRefs.length === 0 &&
                  underlying.causationEventRefs.includes(source.eventId)) &&
                !hasStructuralIdentityCompletedRouteCausation(
                  reconstruction?.cut(cutOrdinal) ?? prefix, underlying, source,
                ))) return false;
          return observation.underlyingObservationRef === underlying.eventId && observation.sourceDigest === underlying.payloadDigest;
        }
        const call = one(reconstruction?.declarationsByIdentity.get(String(cCallRef)) ?? events, e => e.kind === "c_call_opened" && e.aggregateId === cCallRef && e.admissionOrdinal < underlying.admissionOrdinal);
        if (call === null || !record(call.payload) || call.frameId !== context.scope.frameId || call.runId !== context.scope.runId ||
            call.graphCallId !== context.scope.graphCallId || call.basisId !== context.scope.basisRef || call.graphFunctionRef !== context.scope.graphFunctionRef ||
            !Number.isSafeInteger(call.payload.attempt)) return false;
        if (underlying.kind.startsWith("actor_invocation_")) {
          const actor = reconstruction === undefined ? projectActorLivenessContext(prefix, underlying.aggregateId) : reconstruction.context(cutOrdinal, underlying.aggregateId);
          if (actor === null || actor.scope.cCallRef !== cCallRef || actor.scope.frameId !== context.scope.frameId || actor.scope.attempt !== call.payload.attempt) return false;
        } else if (underlying.kind !== "traversal_route_admitted" && underlying.aggregateId !== cCallRef) return false;
      }
    } else {
      if (allowed[contract.source]?.includes(underlying.kind) !== true) return false;
      if (context.scope.actorInvocationRef === null && underlying.aggregateId !== context.scope.cCallRef) return false;
    }
    if (observation.signal === "coverage" && underlying.kind !== "actor_process_started") return false;
    if (observation.coverage === "unavailable" && observation.signal !== "coverage") return false;
    if (observation.signal === "external_interruption" && (underlying.kind !== "actor_process_timeout_observed" || p.timeoutClass !== "absolute")) return false;
    if (observation.signal === "artifact_admitted" || observation.signal === "artifact_rejected") {
      if (underlying.kind === "c_call_result_admitted" && context.scope.actorInvocationRef === null) {
        if ((observation.signal === "artifact_admitted") !== (p.resultClass === "success")) return false;
      } else if (underlying.kind !== "actor_result_artifact_observed" ||
        !record(p.nativeResultAssessment) ||
        (observation.signal === "artifact_admitted") !== (p.nativeResultAssessment.disposition === "admitted")) return false;
    }
    return observation.underlyingObservationRef === underlying.eventId &&
      observation.sourceDigest === underlying.payloadDigest;
  }
  // Physical result observations enter only the bound native result adapter.
  // Pure replay consumes the admitted observation, never rereads today's file.
  return underlying === null && (contract.source === "result_artifact" || contract.source === "archive") &&
    observation.underlyingObservationRef === `runtime-asset-observation://abiogenesis/${digest({
      probeRef: contract.probeRef, sourceDigest: observation.sourceDigest,
      sourceRevisionDigest: observation.sourceRevisionDigest,
    }).slice(7)}` && ["artifact_pending", "coverage"].includes(observation.signal);
}

export function validateRuntimeLivenessEventAtPrefix(prefix: ValidatedRuntimeEventPrefix, event: RuntimeEvent,
  admittedAfter?: ValidatedRuntimeEventPrefix): boolean {
  try {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    if (event.admissionOrdinal !== events.length + 1) return false;
    const after = admittedAfter ?? extendRuntimeEventPrefixForValidation(prefix, event);
    const afterEvents = runtimeEventsFromValidatedPrefix(after);
    const afterHistory = runtimeEventsFromValidatedPrefix(unscopedRuntimeEventPrefix(after));
    if (afterEvents.length !== events.length + 1 || afterEvents.at(-1) !== event ||
        events.some((row, index) => afterEvents[index] !== row) ||
        afterHistory.length !== afterEvents.length || afterHistory.some((row, index) => afterEvents[index] !== row)) return false;
    return validateRuntimeLivenessEvent(after, event, livenessReconstruction(after));
  } catch { return false; }
}

/** Disposable indexes subordinate to this exact admitted value. Declarations
 * and retry law cannot change at a stdout/stderr/probe row. Reconstruct their
 * owner facts once per structural cut; look up producers and fold observations
 * directly without constructing a pair of historical prefixes per event. */
class RuntimeLivenessReconstruction {
  events: readonly RuntimeEvent[] = [];
  prefix: ValidatedRuntimeEventPrefix;
  readonly sampleHistory = new Map<string, { ordinal: number; sample: RuntimeLivenessSample }[]>();
  readonly declarations: RuntimeEvent[] = [];
  readonly declarationsByIdentity = new Map<string, RuntimeEvent[]>();
  readonly duplicateDeclarationAt: number[] = [0];
  readonly byId = new Map<string, RuntimeEvent>();
  readonly byOrdinal = new Map<number, RuntimeEvent>();
  readonly byKind = new Map<RuntimeEvent["kind"], RuntimeEvent[]>();
  readonly declarationAt: number[] = [0];
  readonly budgetAt: number[] = [0];
  private readonly structuralCuts = new Map<number, readonly RuntimeEvent[]>();
  readonly observations = new Map<string, RuntimeEvent[]>();
  readonly structural: RuntimeEvent[] = [];
  readonly structuralAt: number[] = [0];
  readonly folds: RuntimeLivenessHistoryFolds = new Map();
  // Earlier reads have their own disposable progress. They cannot rewind or
  // mutate the later-cut fold, but an ordered historical walk need not restart.
  readonly historicalFolds: RuntimeLivenessHistoryFolds = new Map();
  readonly contexts = new Map<string, RuntimeLivenessContext | null>();
  readonly budgets = new Map<string, RuntimeLivenessBudgetFacts>();
  private readonly cuts = new Map<number, ValidatedRuntimeEventPrefix>();

  constructor(prefix: ValidatedRuntimeEventPrefix) { this.prefix = prefix; this.advance(prefix); }
  advance(prefix: ValidatedRuntimeEventPrefix): void {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    if (events.length <= this.events.length) return;
    const processed = this.events.length;
    let declaration = this.declarationAt[this.events.at(-1)?.admissionOrdinal ?? 0] ?? 0;
    let budget = this.budgetAt[this.events.at(-1)?.admissionOrdinal ?? 0] ?? 0;
    let duplicateDeclaration = this.duplicateDeclarationAt[this.events.at(-1)?.admissionOrdinal ?? 0] ?? 0;
    this.events = events; this.prefix = prefix;
    for (const event of events.slice(processed)) {
      this.byId.set(event.eventId, event);
      this.byOrdinal.set(event.admissionOrdinal, event);
      const family = this.byKind.get(event.kind) ?? [];
      family.push(event); this.byKind.set(event.kind, family);
      // Exactly the declarations read by the three context owners and their
      // execution-basis owner. Duplicate declarations change this cut too.
      if (["actor_invocation_started", "actor_transport_binding_admitted", "c_call_opened",
           "c_call_fibre_selected", "basis_admitted", "frame_opened", "graph_call_opened"].includes(event.kind)) { declaration = event.admissionOrdinal; this.declarations.push(event);
        const identities = new Set([event.aggregateId]);
        if (event.kind === "frame_opened" && event.frameId !== undefined) identities.add(event.frameId);
        if (event.kind === "basis_admitted" && record(event.payload) && typeof event.payload.basisRef === "string") identities.add(event.payload.basisRef);
        for (const identity of identities) {
          const rows = this.declarationsByIdentity.get(identity) ?? [];
          if (rows.some(row => row.kind === event.kind)) duplicateDeclaration = event.admissionOrdinal;
          rows.push(event); this.declarationsByIdentity.set(identity, rows);
        } }
      if (["c_call_opened", "retry_attempt_opened", "retry_progress_recorded"].includes(event.kind)) budget = event.admissionOrdinal;
      this.declarationAt[event.admissionOrdinal] = declaration;
      this.duplicateDeclarationAt[event.admissionOrdinal] = duplicateDeclaration;
      this.budgetAt[event.admissionOrdinal] = budget;
      if ((event.kind === "runtime_activity_probe_observed" || event.kind === "runtime_external_interruption_observed") &&
          record(event.payload) && isRuntimeProbeObservation(event.payload.observation)) {
        const key = event.payload.observation.scopeDigest;
        const rows = this.observations.get(key) ?? [];
        rows.push(event); this.observations.set(key, rows);
      }
      if (!["runtime_activity_probe_observed", "runtime_external_interruption_observed",
            "actor_process_stdout_observed", "actor_process_stderr_observed"].includes(event.kind)) this.structural.push(event);
      this.structuralAt[event.admissionOrdinal] = this.structural.length;
      if (record(event.payload)) {
        const observation = event.payload.observation, threshold = event.payload.thresholdObservation;
        const scopes = new Set<string>();
        if (isRuntimeProbeObservation(observation)) scopes.add(observation.scopeDigest);
        if (isRuntimeThresholdObservation(threshold)) scopes.add(threshold.scopeDigest);
        for (const scope of scopes) {
          const rows = this.sampleHistory.get(scope) ?? [];
          let sample = rows.at(-1)?.sample;
          if (isRuntimeProbeObservation(observation) && observation.scopeDigest === scope &&
              (sample === undefined || observation.elapsedMs > sample.elapsedMs))
            sample = { clockOriginRef: observation.clockOriginRef, elapsedMs: observation.elapsedMs, eventRef: event.eventId };
          if (isRuntimeThresholdObservation(threshold) && threshold.scopeDigest === scope)
            sample = { clockOriginRef: threshold.clockOriginRef, elapsedMs: threshold.elapsedMs, eventRef: event.eventId };
          if (sample !== undefined) { rows.push({ ordinal: event.admissionOrdinal, sample }); this.sampleHistory.set(scope, rows); }
        }
      }
    }
  }
  facts(ordinal: number): readonly RuntimeEvent[] {
    const count = this.structuralAt[ordinal] ?? 0;
    let facts = this.structuralCuts.get(count);
    if (facts === undefined) {
      facts = this.structural.slice(0, count);
      this.structuralCuts.set(count, facts);
    }
    return facts;
  }
  some(ordinal: number, kinds: readonly RuntimeEvent["kind"][], predicate: (event: RuntimeEvent) => boolean): boolean {
    return kinds.some(kind => {
      for (const event of this.byKind.get(kind) ?? []) {
        if (event.admissionOrdinal > ordinal) break;
        if (predicate(event)) return true;
      }
      return false;
    });
  }
  event(ref: string, ordinal: number): RuntimeEvent | undefined {
    const event = this.byId.get(ref);
    return event !== undefined && event.admissionOrdinal <= ordinal ? event : undefined;
  }
  cut(ordinal: number): ValidatedRuntimeEventPrefix {
    let cut = this.cuts.get(ordinal);
    if (cut === undefined) {
      cut = ordinal === 0 ? selectValidatedRuntimeEventPrefix(Object.freeze([])) :
        validatedRuntimeEventPrefixThroughEvent(this.prefix, this.byOrdinal.get(ordinal)!.eventId);
      this.cuts.set(ordinal, cut);
    }
    return cut;
  }
  sample(ordinal: number, scopeDigest: string): RuntimeLivenessSample | null {
    const rows = this.sampleHistory.get(scopeDigest) ?? [];
    let low = 0, high = rows.length;
    while (low < high) { const middle = (low + high) >>> 1; if (rows[middle]!.ordinal <= ordinal) low = middle + 1; else high = middle; }
    return rows[low - 1]?.sample ?? null;
  }
  contextStamp(ordinal: number, occurrenceRef: string): string {
    const own = (this.declarationsByIdentity.get(occurrenceRef) ?? []).filter(e => e.admissionOrdinal <= ordinal);
    const opened = own.find(e => ["actor_invocation_started", "c_call_opened", "frame_opened"].includes(e.kind));
    if (opened === undefined || !record(opened.payload)) return occurrenceRef + "/" + own.map(e => e.eventId).join("/");
    const identities = [occurrenceRef, opened.basisId, opened.payload.cCallRef, opened.payload.transportBindingRef];
    if (opened.kind === "frame_opened") identities.push(opened.graphCallId, opened.payload.parentFrameId);
    const rows = [...new Set(identities.flatMap(identity => typeof identity === "string" ? this.declarationsByIdentity.get(identity) ?? [] : []))]
      .filter(e => e.admissionOrdinal <= ordinal).sort((a, b) => a.admissionOrdinal - b.admissionOrdinal);
    return occurrenceRef + "/" + rows.map(e => e.eventId).join("/");
  }

  context(ordinal: number, occurrenceRef: string): RuntimeLivenessContext | null {
    const key = this.contextStamp(ordinal, occurrenceRef);
    if (!this.contexts.has(key)) this.contexts.set(key, contextForOccurrence(this.cut(this.declarationAt[ordinal] ?? 0), occurrenceRef));
    return this.contexts.get(key)!;
  }
  budget(ordinal: number, context: RuntimeLivenessContext): RuntimeLivenessBudgetFacts {
    const at = this.budgetAt[ordinal] ?? 0, key = at + "/" + digest(context.scope);
    let budget = this.budgets.get(key);
    if (budget === undefined) {
      budget = projectRuntimeRetryBudgetFacts(this.cut(at), context.scope);
      this.budgets.set(key, budget);
    }
    return budget;
  }
}

const LIVENESS_DERIVATION = Symbol("ordered_runtime_liveness_derivation");
function livenessReconstruction(prefix: ValidatedRuntimeEventPrefix): RuntimeLivenessReconstruction {
  const reconstruction = runtimePrefixComputation(prefix, LIVENESS_DERIVATION, () => new RuntimeLivenessReconstruction(prefix));
  reconstruction.advance(prefix); return reconstruction;
}

/** Original identity and ordinal membership prevent borrowing another event,
 * computation, or later cut. The derivation is owned by the exact source. */
export function createRuntimeLivenessEventValidator(prefix: ValidatedRuntimeEventPrefix): (event: RuntimeEvent) => boolean {
  const history = unscopedRuntimeEventPrefix(prefix);
  const reconstruction = livenessReconstruction(history);
  return event => event.admissionOrdinal <= (runtimeEventsFromValidatedPrefix(history).at(-1)?.admissionOrdinal ?? 0) &&
    reconstruction.byOrdinal.get(event.admissionOrdinal) === event &&
    validateRuntimeLivenessEvent(history, event, reconstruction);
}

function validateRuntimeLivenessEvent(prefix: ValidatedRuntimeEventPrefix, event: RuntimeEvent,
  reconstruction: RuntimeLivenessReconstruction): boolean {
  try {
    const p = event.payload, ordinal = event.admissionOrdinal - 1;
    const events = reconstruction.facts(ordinal);
    if (!record(p) || event.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST ||
        event.admissionOrdinal !== ordinal + 1) return false;
    const actor = typeof p.actorInvocationRef === "string" ? p.actorInvocationRef : null;
    const occurrence = actor ?? (isRuntimeSystemProbeContract(p.probeContract) ? p.probeContract.scope.cCallRef ?? p.probeContract.scope.frameId : null);
    const context = occurrence === null ? null : reconstruction.context(ordinal, occurrence);
    if (context === null || event.runId !== context.scope.runId || event.basisId !== context.scope.basisRef ||
        event.graphCallId !== context.scope.graphCallId || event.frameId !== context.scope.frameId ||
        event.graphFunctionRef !== context.scope.graphFunctionRef ||
        actor !== null && reconstruction.some(ordinal, ["actor_invocation_closed", "actor_invocation_failed"], e => e.aggregateId === actor)) return false;
    if (event.kind === "actor_process_timeout_observed") {
      const t = p.thresholdObservation;
      prefix = reconstruction.cut(ordinal);
      if (context.binding.policy === null || !isRuntimeThresholdObservation(t) || t.evaluatedPrefixDigest !== runtimeEventPrefixDigest(prefix) ||
          t.policyRef !== context.binding.policy.policyRef || t.scopeDigest !== digest(context.scope)) return false;
      const projection = deriveRuntimeLiveness(prefix, context, { clockOriginRef: t.clockOriginRef, elapsedMs: t.elapsedMs, eventRef: null });
      return projection?.projectionDigest === t.projectionDigest && projection.disposition.disposition === "controlled_terminate" &&
        p.timeoutClass === (projection.hardCapReached ? "absolute" : "inactivity") &&
        p.timeoutMs === (projection.hardCapReached ? context.binding.policy.hardCapMs : context.binding.policy.inactivityMs) &&
        events.some(e => e.kind === "actor_process_started" && e.aggregateId === p.processRef && record(e.payload) && e.payload.actorInvocationRef === actor);
    }
    if (!isRuntimeSystemProbeContract(p.probeContract) || !isRuntimeProbeObservation(p.observation) ||
        p.observation.scopeDigest !== digest(context.scope) ||
        (actor !== null ? event.aggregateId !== actor || event.aggregateType !== "actor_invocation" || event.parentAggregateId !== context.scope.cCallRef :
          event.aggregateId !== context.scope.graphCallId || event.aggregateType !== "graph_call" || event.parentAggregateId !== context.scope.runId) ||
        !same(event.causationEventRefs, [...new Set([context.declarationEventRef, ...p.observation.evidenceRefs])]) ||
        (p.observation.signal === "external_interruption") !== (event.kind === "runtime_external_interruption_observed")) return false;
    const underlyingEventRef = p.observation.underlyingEventRef;
    const frameOccurrence = context.scope.actorInvocationRef === null && context.scope.cCallRef === null;
    const previousEvent = reconstruction?.byOrdinal.get(ordinal) ?? events.at(-1);
    const terminalFrameSample = frameOccurrence && previousEvent?.kind === "frame_closed" &&
      previousEvent?.eventId === underlyingEventRef && previousEvent?.frameId === context.scope.frameId;
    const frameScopeDigest = frameOccurrence ? digest(context.scope) : null;
    if (frameOccurrence && (reconstruction?.observations.get(frameScopeDigest!) ?? events).some(e => e.admissionOrdinal <= ordinal && e.kind === "runtime_activity_probe_observed" && record(e.payload) &&
        isRuntimeProbeObservation(e.payload.observation) && e.payload.observation.scopeDigest === frameScopeDigest &&
        e.payload.observation.underlyingEventRef === underlyingEventRef)) return false;
    if (reconstruction.some(ordinal, ["run_closed", "run_stopped", "graph_call_closed", "frame_closed", "runtime_failure_observed", "c_call_judged"], e => (e.kind === "run_closed" || e.kind === "run_stopped") && e.runId === context.scope.runId ||
        e.kind === "graph_call_closed" && e.graphCallId === context.scope.graphCallId ||
        e.kind === "frame_closed" && e.frameId === context.scope.frameId && !terminalFrameSample ||
        frameOccurrence && frameFailureApplies(e, context.scope) ||
        e.kind === "c_call_judged" && e.aggregateId === context.scope.cCallRef && e.eventId !== underlyingEventRef)) return false;
    const after = reconstruction.prefix;
    return deriveRuntimeLivenessSemantics(after, context, { clockOriginRef: p.observation.clockOriginRef,
      elapsedMs: p.observation.elapsedMs, eventRef: event.eventId }, undefined, reconstruction, event.admissionOrdinal) !== null;
  } catch { return false; }
}

type RuntimeLivenessSemantics = Omit<RuntimeLivenessObserverProjection,
  "prefixDigest" | "projectionDigest" | "projectionRef">;

interface RuntimeLivenessHistoryFold {
  readonly rowCount: number;
  readonly seen: Map<string, RuntimeProbeObservation>;
  readonly sourceTimes: Map<string, Readonly<{ elapsedMs: number; sourceDigest: string }>>;
  readonly coverage: Set<string>;
  readonly evidenceRefs: string[];
  readonly systemActivity: Map<string, number>;
  lastElapsed: number;
  maxElapsed: number;
  lastActivity: number | null;
  interrupted: boolean;
  lastArtifactObservationRef: string | null;
  artifactState: RuntimeLivenessObserverProjection["artifactState"];
}
type RuntimeLivenessHistoryFolds = Map<string, RuntimeLivenessHistoryFold>;

/** Shared IO-free semantic relation. Ordinary event validation consumes only
 * validity; full projection identity is materialized by the public owner below. */
function deriveRuntimeLivenessSemantics(
  prefix: ValidatedRuntimeEventPrefix,
  context: RuntimeLivenessContext,
  sample: RuntimeLivenessSample,
  selectedBudget?: RuntimeLivenessBudgetFacts,
  reconstruction?: RuntimeLivenessReconstruction,
  ordinal = runtimeEventsFromValidatedPrefix(prefix).at(-1)?.admissionOrdinal ?? 0,
): RuntimeLivenessSemantics | null {
  try {
    const events = reconstruction?.facts(ordinal) ?? runtimeEventsFromValidatedPrefix(prefix);
    const budget = { resultRejectionRef: null, ...(selectedBudget ?? (reconstruction?.budget(ordinal, context) ?? projectRuntimeRetryBudgetFacts(prefix, context.scope))) };
    if (!isRuntimeLivenessBinding(context.binding) ||
        sample.clockOriginRef !== context.binding.clockOriginRef || !Number.isFinite(sample.elapsedMs) || sample.elapsedMs < 0 ||
        context.probes.length === 0 || new Set(context.probes.map(p => p.probeRef)).size !== context.probes.length ||
        context.probes.some(p => !isRuntimeSystemProbeContract(p) || !same(p.scope, context.scope)) ||
        typeof budget.retryEligible !== "boolean" ||
        !(budget.resultRejectionRef === null || typeof budget.resultRejectionRef === "string" && budget.resultRejectionRef.length > 0) ||
        !(budget.continuationRef === null || typeof budget.continuationRef === "string" && budget.continuationRef.length > 0) ||
        !["block", "escalate", "reprice_policy"].includes(budget.terminalPolicy) ||
        budget.remaining !== null && (!Number.isSafeInteger(budget.remaining) || budget.remaining < 0)) return null;
    const occurrence = context.scope.actorInvocationRef ?? context.scope.cCallRef ?? context.scope.frameId;
    const authenticatedContext = reconstruction === undefined ? contextForOccurrence(prefix, occurrence) : reconstruction.context(ordinal, occurrence);
    if (authenticatedContext === null || !same(authenticatedContext, context)) return null;
    const scopeDigest = digest(authenticatedContext.scope);
    const rows = reconstruction?.observations.get(scopeDigest) ?? events.filter(e =>
      (e.kind === "runtime_activity_probe_observed" || e.kind === "runtime_external_interruption_observed") &&
      record(e.payload) && isRuntimeProbeObservation(e.payload.observation) && e.payload.observation.scopeDigest === scopeDigest);
    const foldKey = reconstruction === undefined ? null :
      (context.scope.actorInvocationRef === null && context.scope.cCallRef === null
        ? reconstruction.contextStamp(ordinal, occurrence) + "/duplicates:" + (reconstruction.duplicateDeclarationAt[ordinal] ?? 0)
        : reconstruction.contextStamp(ordinal, occurrence)) + "/" + scopeDigest;
    const later = foldKey === null ? undefined : reconstruction?.folds.get(foldKey);
    const historical = later !== undefined && later.rowCount > 0 && rows[later.rowCount - 1]!.admissionOrdinal > ordinal;
    const folds = historical ? reconstruction?.historicalFolds : reconstruction?.folds;
    const previous = foldKey === null ? undefined : folds?.get(foldKey);
    if (foldKey !== null) folds?.delete(foldKey);
    // The index owns the immutable sequence. A reverse read starts a fresh fold
    // in its selected lane; successful increasing cuts retain that lane's work.
    const reusable = previous !== undefined && (previous.rowCount === 0 || rows[previous.rowCount - 1]!.admissionOrdinal <= ordinal);
    const fold: RuntimeLivenessHistoryFold = reusable ? previous : {
      rowCount: 0, seen: new Map(), sourceTimes: new Map(), coverage: new Set(), evidenceRefs: [], systemActivity: new Map(),
      lastElapsed: 0, maxElapsed: 0, lastActivity: null, interrupted: false, lastArtifactObservationRef: null, artifactState: "absent",
    };
    if (fold.maxElapsed > sample.elapsedMs) return null;
    const { seen, sourceTimes, coverage, evidenceRefs, systemActivity } = fold;
    let { lastElapsed, lastActivity, interrupted, lastArtifactObservationRef, artifactState } = fold;
    let maxElapsed = fold.maxElapsed;
    let rowCount = fold.rowCount;
    for (; rowCount < rows.length && rows[rowCount]!.admissionOrdinal <= ordinal; rowCount++) {
      const event = rows[rowCount]!;
      const p = event.payload as unknown as { probeContract: RuntimeSystemProbeContract; observation: RuntimeProbeObservation };
      const o = p.observation;
      if (!probeObservationMatches(prefix, context, p.probeContract, o, event.admissionOrdinal, reconstruction, ordinal) ||
          o.elapsedMs > sample.elapsedMs) return null;
      maxElapsed = Math.max(maxElapsed, o.elapsedMs);
      const key = `${o.probeRef}\0${o.underlyingObservationRef}`;
      const priorSource = sourceTimes.get(o.underlyingObservationRef);
      if (priorSource !== undefined && (priorSource.elapsedMs !== o.elapsedMs || priorSource.sourceDigest !== o.sourceDigest)) return null;
      sourceTimes.set(o.underlyingObservationRef, { elapsedMs: o.elapsedMs, sourceDigest: o.sourceDigest });
      const previous = seen.get(key);
      if (previous !== undefined) {
        if (!same(previous, o)) return null; // delayed alias keeps original elapsed
        continue;
      }
      if (o.elapsedMs < lastElapsed) return null;
      lastElapsed = o.elapsedMs; seen.set(key, o); evidenceRefs.push(event.eventId);
      if (o.coverage === "unavailable") { coverage.delete(o.probeRef); continue; }
      coverage.add(o.probeRef);
      if (o.signal === "external_interruption") interrupted = true;
      else if (o.signal !== "coverage") {
        if (interrupted && !["artifact_admitted", "artifact_rejected"].includes(o.signal)) return null;
        if (!interrupted) { lastActivity = o.elapsedMs; systemActivity.set(o.probeRef, o.elapsedMs); }
      }
      if (["artifact_pending", "artifact_admitted", "artifact_rejected"].includes(o.signal)) lastArtifactObservationRef = event.eventId;
      if (o.signal === "artifact_pending") artifactState = "pending";
      if (o.signal === "artifact_admitted") artifactState = "admitted";
      if (o.signal === "artifact_rejected") artifactState = "rejected";
    }
    // Save only the completed row relation. Any new/duplicate owner declaration
    // invalidates it, including frame rows that join child actor contexts.
    // Closure, retry, policy and disposition still use the exact current cut.
    if (foldKey !== null) folds?.set(foldKey, { rowCount, seen, sourceTimes, coverage, evidenceRefs, systemActivity,
      lastElapsed, maxElapsed, lastActivity, interrupted, lastArtifactObservationRef, artifactState });
    const any = (kinds: readonly RuntimeEvent["kind"][], predicate: (event: RuntimeEvent) => boolean) =>
      reconstruction === undefined ? events.some(e => kinds.includes(e.kind) && predicate(e)) : reconstruction.some(ordinal, kinds, predicate);
    const policy = context.binding.policy;
    const leaseDeadlineElapsedMs = policy === null ? null : lastActivity === null ? policy.startupMs : lastActivity + policy.inactivityMs;
    const hardCapReached = policy !== null && sample.elapsedMs >= policy.hardCapMs;
    const leaseExpired = leaseDeadlineElapsedMs !== null && sample.elapsedMs >= leaseDeadlineElapsedMs;
    const completeCoverage = context.probes.every(p => !p.required || coverage.has(p.probeRef));
    const actorRef = context.scope.actorInvocationRef;
    const actorDone = actorRef !== null && any(["actor_invocation_closed", "actor_invocation_failed"], e => e.aggregateId === actorRef);
    const frameOccurrence = actorRef === null && context.scope.cCallRef === null;
    if (frameOccurrence && any(["run_stopped", "runtime_failure_observed"], e => (e.kind === "run_stopped" && e.runId === context.scope.runId) ||
        frameFailureApplies(e, context.scope))) interrupted = true;
    const occurrenceDone = actorDone || actorRef === null && any(["frame_closed", "c_call_judged"], e => frameOccurrence
      ? e.kind === "frame_closed" && e.frameId === context.scope.frameId
      : e.kind === "c_call_judged" && e.aggregateId === context.scope.cCallRef);
    const processLive = actorRef !== null && any(["actor_process_started"], e =>
      record(e.payload) && e.payload.actorInvocationRef === actorRef) &&
      !any(["actor_process_exited", "actor_process_spawn_failed", "actor_process_termination_unconfirmed"], e =>
        record(e.payload) && e.payload.actorInvocationRef === actorRef);
    let disposition: RuntimeLivenessObserverProjection["disposition"]["disposition"] = "continue_waiting";
    let reason = "within_bound_lease";
    if (hardCapReached && processLive) { disposition = "controlled_terminate"; reason = "absolute_safety_cap"; }
    else if (artifactState === "pending") { disposition = "inspect_archive"; reason = "artifact_requires_native_assessment"; }
    else if (policy === null) { reason = "unknown_watchdog_policy"; }
    else if (interrupted) { disposition = budget.continuationRef !== null ? "yield_continuation" : budget.terminalPolicy; reason = "admitted_external_interruption"; }
    else if (artifactState === "admitted" && budget.resultRejectionRef === null) { reason = "admitted_artifact_preserved"; }
    else if (actorDone) {
      if (budget.continuationRef !== null) { disposition = "yield_continuation"; reason = "declared_same_edge_continuation"; }
      else if (budget.remaining === 0) { disposition = budget.terminalPolicy; reason = "retry_budget_exhausted"; }
      else if (budget.remaining !== null && budget.retryEligible) { disposition = "retry"; reason = "native_frontier_and_budget"; }
      else { disposition = "block"; reason = "closed_attempt_without_admitted_result"; }
    }
    else if (leaseExpired && completeCoverage) {
      if (processLive) { disposition = "controlled_terminate"; reason = lastActivity === null ? "startup_expired" : "inactivity_expired"; }
      else if (budget.continuationRef !== null) { disposition = "yield_continuation"; reason = "declared_same_edge_continuation"; }
      else if (budget.remaining === 0) { disposition = budget.terminalPolicy; reason = "retry_budget_exhausted"; }
      else if (budget.remaining !== null && budget.retryEligible) { disposition = "retry"; reason = "native_frontier_and_budget"; }
      else { disposition = "block"; reason = lastActivity === null ? "no_output" : "progress_without_result"; }
    } else if (!completeCoverage) reason = "unknown_required_coverage";
    const activeSystems: string[] = [], inactiveSystems: string[] = [], interruptedSystems: string[] = [];
    for (const probe of context.probes) {
      if (!coverage.has(probe.probeRef)) continue;
      if (interrupted) { interruptedSystems.push(probe.sourceRef); continue; }
      if (occurrenceDone) { inactiveSystems.push(probe.sourceRef); continue; }
      const activity = systemActivity.get(probe.probeRef);
      if (policy === null) { if (activity === sample.elapsedMs) activeSystems.push(probe.sourceRef); continue; }
      if (activity === undefined ? sample.elapsedMs >= policy.startupMs : sample.elapsedMs >= activity + policy.inactivityMs) inactiveSystems.push(probe.sourceRef);
      else if (activity !== undefined) activeSystems.push(probe.sourceRef);
    }
    const body = {
      kind: "runtime_liveness_observer_projection" as const, schemaVersion: "5.0.0" as const,
      scope: context.scope, policyRef: policy?.policyRef ?? null,
      retryBudget: budget,
      asOf: sample, coverage: context.probes.map(p => ({ probeRef: p.probeRef, source: p.source,
        state: coverage.has(p.probeRef) ? "observed" as const : "unknown" as const })),
      activeSystems, inactiveSystems, interruptedSystems, lastArtifactObservationRef,
      evidenceRefs: [...evidenceRefs], lastActivityElapsedMs: lastActivity, leaseDeadlineElapsedMs, hardDeadlineElapsedMs: policy?.hardCapMs ?? null,
      leaseExpired, hardCapReached, externallyInterrupted: interrupted, artifactState,
      disposition: { kind: "runtime_invocation_disposition" as const, schemaVersion: "5.0.0" as const, disposition, reason },
    };
    return body;
  } catch { return null; }
}

/** One IO-free native relation. Candidate elapsed/budget inputs are not admission authority. */
export function deriveRuntimeLiveness(
  prefix: ValidatedRuntimeEventPrefix,
  context: RuntimeLivenessContext,
  sample: RuntimeLivenessSample,
  selectedBudget?: RuntimeLivenessBudgetFacts,
): RuntimeLivenessObserverProjection | null {
  return deriveRuntimeLivenessWithPrefixDigest(prefix, context, sample, selectedBudget,
    () => runtimeEventPrefixDigest(prefix));
}

/** Private calculation reuse only; every call still derives its complete semantics. */
function deriveRuntimeLivenessWithPrefixDigest(
  prefix: ValidatedRuntimeEventPrefix,
  context: RuntimeLivenessContext,
  sample: RuntimeLivenessSample,
  selectedBudget: RuntimeLivenessBudgetFacts | undefined,
  prefixDigest: () => Sha256Digest,
): RuntimeLivenessObserverProjection | null {
  try {
    const semantics = deriveRuntimeLivenessSemantics(prefix, context, sample, selectedBudget, livenessReconstruction(prefix));
    if (semantics === null) return null;
    const { kind, schemaVersion, scope, policyRef, ...derived } = semantics;
    const body = { kind, schemaVersion, scope, policyRef,
      prefixDigest: prefixDigest(), ...derived };
    const projectionDigest = digest(body);
    return deepFreeze({ ...body, projectionDigest, projectionRef: `runtime-liveness://abiogenesis/${projectionDigest.slice(7)}` });
  } catch { return null; }
}

/** Replay/read is as-of admitted facts and never samples a host clock or filesystem. */
export function projectRuntimeLivenessAtPrefix(prefix: ValidatedRuntimeEventPrefix, occurrenceRef: string,
  budget?: RuntimeLivenessBudgetFacts): RuntimeLivenessObserverProjection | null {
  return projectRuntimeLivenessAtPrefixWithDigest(prefix, occurrenceRef, budget,
    () => runtimeEventPrefixDigest(prefix));
}

function projectRuntimeLivenessAtPrefixWithDigest(prefix: ValidatedRuntimeEventPrefix, occurrenceRef: string,
  budget: RuntimeLivenessBudgetFacts | undefined, prefixDigest: () => Sha256Digest): RuntimeLivenessObserverProjection | null {
  const reconstruction = livenessReconstruction(prefix);
  const ordinal = runtimeEventsFromValidatedPrefix(prefix).at(-1)?.admissionOrdinal ?? 0;
  const context = reconstruction.context(ordinal, occurrenceRef);
  if (context === null) return null;
  const sample = reconstruction.sample(ordinal, digest(context.scope));
  return sample === null ? null : deriveRuntimeLivenessWithPrefixDigest(prefix, context, sample, budget, prefixDigest);
}
export function projectRuntimeLivenessForScope(prefix: ValidatedRuntimeEventPrefix, runId: string | null, graphCallId?: string): readonly RuntimeLivenessObserverProjection[] {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  // Materialize one exact prefix digest for the batch. No caller supplies it.
  let selectedPrefixDigest: Sha256Digest | undefined;
  const prefixDigest = () => selectedPrefixDigest ??= runtimeEventPrefixDigest(prefix);
  const actors = events.filter(e => (e.kind === "actor_invocation_started" || e.kind === "c_call_fibre_selected" || e.kind === "frame_opened") &&
    (runId === null || e.runId === runId) && (graphCallId === undefined || e.graphCallId === graphCallId));
  return Object.freeze(actors.flatMap(e => {
    const projection = projectRuntimeLivenessAtPrefixWithDigest(prefix, e.aggregateId, undefined, prefixDigest);
    return projection === null ? [] : [projection];
  }));
}

export function projectNativeLivenessRead(prefix: ValidatedRuntimeEventPrefix, runId: string | null, graphCallId?: string): RuntimeLivenessReadProjection | null {
  const profileSchedule = runtimeEventProfileScheduleFromValidatedPrefix(prefix);
  if (profileSchedule.currentEventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST) return null;
  return deepFreeze({ kind: "native_liveness_read_projection", schemaVersion: "5.0.0", profileSchedule,
    invocations: projectRuntimeLivenessForScope(unscopedRuntimeEventPrefix(prefix), runId, graphCallId) });
}

/** Owner observes one declared source, joins its actual native producer, and admits at the exact prefix. */
export function admitRuntimeActivityProbe(input: Readonly<{
  store: AbgEventStore; predecessorPrefix: DurablePrefixCoordinate; actorInvocationRef?: string; cCallRef?: string;
  source: RuntimeProbeSource; observation: RuntimeProbeObservation; eventTime: string; correlationId: string;
}>) {
  assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
  return admitNonEmptyRuntimeEventTransactionAtDurablePrefix(input.store, input.predecessorPrefix, () => {
    if (input.predecessorPrefix.storeIdentity.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST) throw new TypeError("P probes cannot append to an L acquisition");
    const prefix = selectValidatedRuntimeEventPrefix(readActiveRuntimeTransactionAtDurablePrefix(input.store, input.predecessorPrefix, { durableOnly: true })), events = runtimeEventsFromValidatedPrefix(prefix);
    if ((input.actorInvocationRef === undefined) === (input.cCallRef === undefined)) throw new TypeError("one native occurrence is required");
    const reconstruction = livenessReconstruction(prefix);
    const context = reconstruction.context(events.at(-1)?.admissionOrdinal ?? 0, input.actorInvocationRef ?? input.cCallRef!);
    const probe = context?.probes.find(p => p.source === input.source);
    if (context === null || probe === undefined ||
        !probeObservationMatches(prefix, context, probe, input.observation, events.length + 1, reconstruction)) throw new TypeError("probe source differs from the native declared occurrence");
    if (events.some(e => (e.kind === "actor_invocation_closed" || e.kind === "actor_invocation_failed") &&
        e.aggregateId === input.actorInvocationRef)) throw new TypeError("terminal invocation cannot be revived by a probe");
    if (context.scope.actorInvocationRef === null && events.some(e => e.kind === "c_call_judged" &&
        e.aggregateId === context.scope.cCallRef && e.eventId !== input.observation.underlyingEventRef)) {
      throw new TypeError("terminal CCall cannot be revived by a probe");
    }
    if (input.observation.underlyingEventRef === null) {
      let bytes: Buffer;
      let sourceRevisionDigest: Sha256Digest | null = null;
      try {
        const node = lstatSync(probe.sourceRef, { bigint: true });
        if (!node.isFile() || node.isSymbolicLink() || node.nlink !== 1n || realpathSync(dirname(probe.sourceRef)) !== dirname(probe.sourceRef)) throw new TypeError("bound native asset is not one canonical file");
        bytes = readFileSync(probe.sourceRef);
        const after = lstatSync(probe.sourceRef, { bigint: true });
        sourceRevisionDigest = runtimeAssetRevisionDigest(node);
        if (runtimeAssetRevisionDigest(after) !== sourceRevisionDigest || after.size !== BigInt(bytes.length)) throw new TypeError("native asset changed while observed");
      }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        bytes = Buffer.alloc(0);
      }
      if (sha256Bytes(bytes) !== input.observation.sourceDigest || sourceRevisionDigest !== input.observation.sourceRevisionDigest ||
          (bytes.length > 0) !== (input.observation.signal === "artifact_pending")) throw new TypeError("asset observation differs from the actual bound source");
    }
    const candidate: RuntimeEventCandidate = {
      kind: input.observation.signal === "external_interruption" ? "runtime_external_interruption_observed" : "runtime_activity_probe_observed",
      eventTime: input.eventTime, aggregateType: context.scope.actorInvocationRef === null ? "graph_call" : "actor_invocation",
      aggregateId: context.scope.actorInvocationRef ?? context.scope.graphCallId,
      parentAggregateId: context.scope.actorInvocationRef === null ? context.scope.runId : context.scope.cCallRef,
      causationEventRefs: [...new Set([context.declarationEventRef, ...input.observation.evidenceRefs])],
      correlationId: input.correlationId, workflowVersion: "5.0.0", scopeClass: "run",
      basisId: context.scope.basisRef, runId: context.scope.runId, graphFunctionRef: context.scope.graphFunctionRef,
      graphCallId: context.scope.graphCallId, frameId: context.scope.frameId,
      payload: { ...(context.scope.actorInvocationRef === null ? {} : { actorInvocationRef: context.scope.actorInvocationRef }),
        probeContract: probe, observation: input.observation } as unknown as JsonValue,
    };
    return admitNativeRuntimeLivenessEvent(input.store, candidate);
  });
}

/** Timers request this relation; only a current native threshold admits containment evidence. */
export function admitRuntimeThreshold(input: Readonly<{
  store: AbgEventStore; predecessorPrefix: DurablePrefixCoordinate; actorInvocationRef: string;
  processRef: string; elapsedMs: number; eventTime: string; correlationId: string;
}>) {
  const committed = admitRuntimeEventTransactionAtDurablePrefix(input.store, input.predecessorPrefix, () => {
    const prefix = selectValidatedRuntimeEventPrefix(readActiveRuntimeTransactionAtDurablePrefix(input.store, input.predecessorPrefix, { durableOnly: true }));
    const context = projectActorLivenessContext(prefix, input.actorInvocationRef);
    if (context === null || context.binding.policy === null) throw new TypeError("threshold has no native declared actor context");
    const policy = context.binding.policy;
    const sample = { clockOriginRef: context.binding.clockOriginRef, elapsedMs: input.elapsedMs, eventRef: null };
    const projection = deriveRuntimeLiveness(prefix, context, sample);
    if (projection === null) throw new TypeError("threshold scope, clock, or source history refused");
    if (projection.disposition.disposition !== "controlled_terminate") return { kind: "runtime_threshold_not_reached" as const, projection };
    const timeoutClass = projection.hardCapReached ? "absolute" as const : "inactivity" as const;
    const observation: RuntimeThresholdObservation = {
      kind: "runtime_threshold_observation", schemaVersion: "5.0.0",
      clockOriginRef: sample.clockOriginRef, elapsedMs: sample.elapsedMs, policyRef: context.binding.policy.policyRef,
      scopeDigest: digest(context.scope), evaluatedPrefixDigest: digest(prefix.events), projectionDigest: projection.projectionDigest,
    };
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const started = one(events, e => e.kind === "actor_process_started" && e.aggregateId === input.processRef &&
      record(e.payload) && e.payload.actorInvocationRef === input.actorInvocationRef);
    if (started === null) throw new TypeError("threshold process is not owned by the declared actor");
    const event = admitNativeRuntimeLivenessEvent(input.store, {
      kind: "actor_process_timeout_observed", eventTime: input.eventTime, aggregateType: "process", aggregateId: input.processRef,
      parentAggregateId: input.actorInvocationRef, causationEventRefs: [started.eventId, ...projection.evidenceRefs],
      correlationId: input.correlationId, workflowVersion: "5.0.0", scopeClass: "run", basisId: context.scope.basisRef,
      runId: context.scope.runId, graphCallId: context.scope.graphCallId, frameId: context.scope.frameId,
      graphFunctionRef: context.scope.graphFunctionRef, payload: {
        actorInvocationRef: input.actorInvocationRef, processRef: input.processRef, timeoutClass,
        timeoutMs: timeoutClass === "absolute" ? policy.hardCapMs : policy.inactivityMs,
        thresholdObservation: observation,
      } as unknown as JsonValue,
    });
    return { kind: "runtime_threshold_staged" as const, event, timeoutClass };
  });
  if (committed.value.kind === "runtime_threshold_not_reached") return committed.value;
  if (committed.successorPrefix === null) throw new TypeError("admitted threshold has no durable successor");
  const admitted = projectRuntimeLivenessAtPrefix(selectValidatedRuntimeEventPrefix(input.store.readAll()), input.actorInvocationRef);
  if (admitted?.disposition.disposition !== "controlled_terminate") throw new TypeError("admitted threshold no longer derives containment");
  return { kind: "runtime_threshold_admitted" as const, value: committed.value.event, successorPrefix: committed.successorPrefix, projection: admitted, timeoutClass: committed.value.timeoutClass };
}
