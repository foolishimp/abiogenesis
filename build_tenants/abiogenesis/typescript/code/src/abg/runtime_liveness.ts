import type { RuntimeEventPrefix } from "./event_prefix.js";
import { extendRuntimeEventPrefixForValidation, indexedRuntimeEvents, runtimeEventPrefixDigest, runtimeEventPrefixIsExactExtension,
  runtimeEventPrefixExtent, selectOwnedRuntimeEventPrefix, selectRuntimeEventPrefixFromStore } from "./event_prefix.js";
import { readFileSync, lstatSync, realpathSync, type BigIntStats } from "node:fs";
import { dirname } from "node:path";
import { performance } from "node:perf_hooks";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { runtimeEventEnvelopesAtPrefix, runtimeEventProfileScheduleFromValidatedPrefix, unscopedRuntimeEventPrefix, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { constructRuntimeFluent, runtimeFluentHoldsAtPrefix } from "./event_calculus.js";
import {
  admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  assertHeldEventStoreAtDurablePrefix, admitNativeRuntimeLivenessEvent,
  admitRuntimeEventTransactionAtDurablePrefix, selectActiveRuntimeTransactionHistoryAtDurablePrefix, ROOT_EVENT_CONTRACT_DIGEST,
  assertRuntimeEventTransactionActive,
  type AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent, type RuntimeEventCandidate,
} from "./event_store.js";
import { hasStructuralIdentityCompletedRouteCausation } from "./retry_progress.js";
import {
  runtimeLivenessDigest as digest,
  type RuntimeLivenessObserverProjection, type RuntimeLivenessBudgetFacts,
  type RuntimeLivenessContext, type RuntimeLivenessSample,
  type RuntimeProbeObservation, type RuntimeProbeSource,
  type RuntimeThresholdObservation,
  type RuntimeLivenessReadProjection,
} from "./runtime_liveness_contracts.js";
import {
  FRAME_PRODUCERS, livenessReconstruction, probeObservationMatches, nativeLivenessRelationHolds,
  decideRuntimeLivenessEvent, deriveRuntimeLivenessProjection,
  type NativeLivenessRouteObligation, type ProcessLiveRead,
} from "./calculus/liveness.js";
export type { RuntimeLivenessContext, RuntimeLivenessSample } from "./runtime_liveness_contracts.js";
export type { RuntimeLivenessBudgetFacts } from "./runtime_liveness_contracts.js";
import { canonicalEquals } from "../shared/value/index.js";
import { resolveExactMatch, type ExactMatch } from "../shared/select/index.js";

function record(value: unknown): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** File revision identifies the producer observation; these timestamps are
 * never an elapsed clock or an inference of liveness/termination. */
export function runtimeAssetRevisionDigest(stat: Pick<BigIntStats, "dev" | "ino" | "size" | "mtimeNs" | "ctimeNs">): Sha256Digest {
  return digest({ device: String(stat.dev), inode: String(stat.ino), size: String(stat.size),
    modifiedRevision: String(stat.mtimeNs), changedRevision: String(stat.ctimeNs) });
}
/** Owner boundary: `absent` and `many` map to `null`. */
const exactOrNull = <T>(match: ExactMatch<T>): T | null => match.kind === "one" ? match.value : null;

/** The owner's read of process liveness: the exact fluent at the relation's cut. */
const ownerProcessLive: ProcessLiveRead = (processRef, cut) =>
  runtimeFluentHoldsAtPrefix(cut(), constructRuntimeFluent({ name: "actor_process_live", identity: processRef }));
/** M5, the structural-identity route join: the owner's domain check on the
 * relation's route obligations. Admission is the relation composed with it. */
function structuralRoutesHold(obligations: readonly NativeLivenessRouteObligation[]): boolean {
  return obligations.every(({ cut, underlying, source }) => hasStructuralIdentityCompletedRouteCausation(cut, underlying, source));
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
  const context = projectFrameLivenessContext(selectRuntimeEventPrefixFromStore(store), opening.frameId!);
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
  const prefix = selectRuntimeEventPrefixFromStore(store);
  if (!indexedRuntimeEvents(prefix, "id:" + underlying.eventId).some(e => canonicalEquals(e, underlying))) throw new TypeError("frame sample needs its admitted producer");
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
    payload: { probeContract: probe, observation } });
  if (openingOrigin === sample) physical.openingRef = underlying.eventId;
  else frameSamples.delete(sample);
}

/** All native readers consume the same affected-declaration relation as replay. */
export function projectActorLivenessContext(prefix: ValidatedRuntimeEventPrefix, actorInvocationRef: string): RuntimeLivenessContext | null;
/** @internal */
export function projectActorLivenessContext(prefix: RuntimeEventPrefix, actorInvocationRef: string): RuntimeLivenessContext | null;
export function projectActorLivenessContext(prefix: RuntimeEventPrefix, actorInvocationRef: string): RuntimeLivenessContext | null {
  try { const context = livenessReconstruction(prefix).context(runtimeEventPrefixExtent(prefix).lastOrdinal, actorInvocationRef);
    return context?.scope.actorInvocationRef === actorInvocationRef ? context : null; } catch { return null; }
}
export function projectCCallLivenessContext(prefix: ValidatedRuntimeEventPrefix, cCallRef: string): RuntimeLivenessContext | null;
/** @internal */
export function projectCCallLivenessContext(prefix: RuntimeEventPrefix, cCallRef: string): RuntimeLivenessContext | null;
export function projectCCallLivenessContext(prefix: RuntimeEventPrefix, cCallRef: string): RuntimeLivenessContext | null {
  try { const context = livenessReconstruction(prefix).context(runtimeEventPrefixExtent(prefix).lastOrdinal, cCallRef);
    return context?.scope.cCallRef === cCallRef && context.scope.actorInvocationRef === null ? context : null; } catch { return null; }
}
export function projectFrameLivenessContext(prefix: ValidatedRuntimeEventPrefix, frameId: string): RuntimeLivenessContext | null;
/** @internal */
export function projectFrameLivenessContext(prefix: RuntimeEventPrefix, frameId: string): RuntimeLivenessContext | null;
export function projectFrameLivenessContext(prefix: RuntimeEventPrefix, frameId: string): RuntimeLivenessContext | null {
  try { const context = livenessReconstruction(prefix).context(runtimeEventPrefixExtent(prefix).lastOrdinal, frameId);
    return context?.scope.frameId === frameId && context.scope.actorInvocationRef === null && context.scope.cCallRef === null ? context : null; } catch { return null; }
}

// Physical clock adapter only. Replay never reads this cache. An acquisition
// without the original owner clock leaves fresh elapsed coverage unknown.
const cCallClocks = new WeakMap<AbgEventStore, Map<string, Readonly<{ declarationEventRef: string; startedAt: number }>>>();
export function observeNativeCCallLiveness(store: AbgEventStore, underlying: RuntimeEvent): void {
  assertRuntimeEventTransactionActive(store);
  if (underlying.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST) return;
  const prefix = selectRuntimeEventPrefixFromStore(store);
  if (!indexedRuntimeEvents(prefix, "id:" + underlying.eventId).some(e => canonicalEquals(e, underlying))) throw new TypeError("CCall progress needs its admitted native producer");
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
      payload: { probeContract: probe, observation },
    });
  }
  if (underlying.kind === "c_call_judged") clocks.delete(context.scope.cCallRef!);
}

export function validateRuntimeLivenessEventAtPrefix(prefix: ValidatedRuntimeEventPrefix, event: RuntimeEvent,
  admittedAfter?: ValidatedRuntimeEventPrefix): boolean;
/** @internal */
export function validateRuntimeLivenessEventAtPrefix(prefix: RuntimeEventPrefix, event: RuntimeEvent,
  admittedAfter?: RuntimeEventPrefix): boolean;
export function validateRuntimeLivenessEventAtPrefix(prefix: RuntimeEventPrefix, event: RuntimeEvent,
  admittedAfter?: RuntimeEventPrefix): boolean {
  try {
    if (event.admissionOrdinal !== runtimeEventPrefixExtent(prefix).count + 1) return false;
    const after = admittedAfter ?? extendRuntimeEventPrefixForValidation(prefix, event);
    if (!runtimeEventPrefixIsExactExtension(prefix, after, event)) return false;
    const obligations: NativeLivenessRouteObligation[] = [];
    return decideRuntimeLivenessEvent(after, event, livenessReconstruction(after), ownerProcessLive, obligations) &&
      structuralRoutesHold(obligations);
  } catch { return false; }
}

/** The owner's admission validator: the calculus relation composed with M5. */
export function createRuntimeLivenessEventValidator(prefix: ValidatedRuntimeEventPrefix): (event: RuntimeEvent) => boolean;
/** @internal */
export function createRuntimeLivenessEventValidator(prefix: RuntimeEventPrefix): (event: RuntimeEvent) => boolean;
export function createRuntimeLivenessEventValidator(prefix: RuntimeEventPrefix): (event: RuntimeEvent) => boolean {
  return event => {
    const obligations: NativeLivenessRouteObligation[] = [];
    if (!nativeLivenessRelationHolds(prefix, ownerProcessLive, event, obligations)) return false;
    try { return structuralRoutesHold(obligations); } catch { return false; }
  };
}


/** One IO-free native relation. Candidate elapsed/budget inputs are not admission authority. */
export function deriveRuntimeLiveness(
  prefix: ValidatedRuntimeEventPrefix,
  context: RuntimeLivenessContext,
  sample: RuntimeLivenessSample,
  selectedBudget?: RuntimeLivenessBudgetFacts,
): RuntimeLivenessObserverProjection | null;
/** @internal */
export function deriveRuntimeLiveness(
  prefix: RuntimeEventPrefix,
  context: RuntimeLivenessContext,
  sample: RuntimeLivenessSample,
  selectedBudget?: RuntimeLivenessBudgetFacts,
): RuntimeLivenessObserverProjection | null;
export function deriveRuntimeLiveness(
  prefix: RuntimeEventPrefix,
  context: RuntimeLivenessContext,
  sample: RuntimeLivenessSample,
  selectedBudget?: RuntimeLivenessBudgetFacts,
): RuntimeLivenessObserverProjection | null {
  return deriveRuntimeLivenessWithPrefixDigest(prefix, context, sample, selectedBudget,
    () => runtimeEventPrefixDigest(prefix));
}

/** Private calculation reuse only; every call still derives its complete semantics. */
function deriveRuntimeLivenessWithPrefixDigest(
  prefix: RuntimeEventPrefix,
  context: RuntimeLivenessContext,
  sample: RuntimeLivenessSample,
  selectedBudget: RuntimeLivenessBudgetFacts | undefined,
  prefixDigest: () => Sha256Digest,
): RuntimeLivenessObserverProjection | null {
  try {
    const obligations: NativeLivenessRouteObligation[] = [];
    const projection = deriveRuntimeLivenessProjection(prefix, context, sample, selectedBudget, prefixDigest,
      processRef => ownerProcessLive(processRef, () => prefix), obligations);
    return projection !== null && structuralRoutesHold(obligations) ? projection : null;
  } catch { return null; }
}

/** Replay/read is as-of admitted facts and never samples a host clock or filesystem. */
export function projectRuntimeLivenessAtPrefix(prefix: ValidatedRuntimeEventPrefix, occurrenceRef: string,
  budget?: RuntimeLivenessBudgetFacts): RuntimeLivenessObserverProjection | null;
/** @internal */
export function projectRuntimeLivenessAtPrefix(prefix: RuntimeEventPrefix, occurrenceRef: string,
  budget?: RuntimeLivenessBudgetFacts): RuntimeLivenessObserverProjection | null;
export function projectRuntimeLivenessAtPrefix(prefix: RuntimeEventPrefix, occurrenceRef: string,
  budget?: RuntimeLivenessBudgetFacts): RuntimeLivenessObserverProjection | null {
  return projectRuntimeLivenessAtPrefixWithDigest(prefix, occurrenceRef, budget,
    () => runtimeEventPrefixDigest(prefix));
}

function projectRuntimeLivenessAtPrefixWithDigest(prefix: RuntimeEventPrefix, occurrenceRef: string,
  budget: RuntimeLivenessBudgetFacts | undefined, prefixDigest: () => Sha256Digest): RuntimeLivenessObserverProjection | null {
  const reconstruction = livenessReconstruction(prefix);
  const ordinal = runtimeEventPrefixExtent(prefix).lastOrdinal;
  const context = reconstruction.context(ordinal, occurrenceRef);
  if (context === null) return null;
  const sample = reconstruction.sample(ordinal, digest(context.scope));
  return sample === null ? null : deriveRuntimeLivenessWithPrefixDigest(prefix, context, sample, budget, prefixDigest);
}
export function projectRuntimeLivenessForScope(prefix: ValidatedRuntimeEventPrefix, runId: string | null, graphCallId?: string): readonly RuntimeLivenessObserverProjection[];
/** @internal */
export function projectRuntimeLivenessForScope(prefix: RuntimeEventPrefix, runId: string | null, graphCallId?: string): readonly RuntimeLivenessObserverProjection[];
export function projectRuntimeLivenessForScope(prefix: RuntimeEventPrefix, runId: string | null, graphCallId?: string): readonly RuntimeLivenessObserverProjection[] {
  // Materialize one exact prefix digest for the batch. No caller supplies it.
  let selectedPrefixDigest: Sha256Digest | undefined;
  const prefixDigest = () => selectedPrefixDigest ??= runtimeEventPrefixDigest(prefix);
  // Occurrence selection reads envelope fields only; projection acquires its own bodies.
  const actors = [...runtimeEventEnvelopesAtPrefix(prefix)].filter(e => (e.kind === "actor_invocation_started" || e.kind === "c_call_fibre_selected" || e.kind === "frame_opened") &&
    (runId === null || e.runId === runId) && (graphCallId === undefined || e.graphCallId === graphCallId));
  return Object.freeze(actors.flatMap(e => {
    const projection = projectRuntimeLivenessAtPrefixWithDigest(prefix, e.aggregateId, undefined, prefixDigest);
    return projection === null ? [] : [projection];
  }));
}

export function projectNativeLivenessRead(prefix: ValidatedRuntimeEventPrefix, runId: string | null, graphCallId?: string): RuntimeLivenessReadProjection | null;
/** @internal */
export function projectNativeLivenessRead(prefix: RuntimeEventPrefix, runId: string | null, graphCallId?: string): RuntimeLivenessReadProjection | null;
export function projectNativeLivenessRead(prefix: RuntimeEventPrefix, runId: string | null, graphCallId?: string): RuntimeLivenessReadProjection | null {
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
    const prefix = selectOwnedRuntimeEventPrefix(selectActiveRuntimeTransactionHistoryAtDurablePrefix(input.store, input.predecessorPrefix, { durableOnly: true })),
      extent = runtimeEventPrefixExtent(prefix);
    if ((input.actorInvocationRef === undefined) === (input.cCallRef === undefined)) throw new TypeError("one native occurrence is required");
    const reconstruction = livenessReconstruction(prefix);
    const context = reconstruction.context(extent.lastOrdinal, input.actorInvocationRef ?? input.cCallRef!);
    const probe = context?.probes.find(p => p.source === input.source);
    const obligations: NativeLivenessRouteObligation[] = [];
    if (context === null || probe === undefined ||
        !probeObservationMatches(context, probe, input.observation, extent.count + 1, obligations, reconstruction) ||
        !structuralRoutesHold(obligations)) throw new TypeError("probe source differs from the native declared occurrence");
    if (indexedRuntimeEvents(prefix, "related:" + input.actorInvocationRef).some(e => (e.kind === "actor_invocation_closed" || e.kind === "actor_invocation_failed") &&
        e.aggregateId === input.actorInvocationRef)) throw new TypeError("terminal invocation cannot be revived by a probe");
    if (context.scope.actorInvocationRef === null && indexedRuntimeEvents(prefix, "related:" + context.scope.cCallRef).some(e => e.kind === "c_call_judged" &&
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
        probeContract: probe, observation: input.observation },
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
    const prefix = selectOwnedRuntimeEventPrefix(selectActiveRuntimeTransactionHistoryAtDurablePrefix(input.store, input.predecessorPrefix, { durableOnly: true }));
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
      scopeDigest: digest(context.scope), evaluatedPrefixDigest: runtimeEventPrefixDigest(prefix), projectionDigest: projection.projectionDigest,
    };
    const started = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + input.processRef), e => e.kind === "actor_process_started" && e.aggregateId === input.processRef &&
      record(e.payload) && e.payload.actorInvocationRef === input.actorInvocationRef));
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
      },
    });
    return { kind: "runtime_threshold_staged" as const, event, timeoutClass };
  });
  if (committed.value.kind === "runtime_threshold_not_reached") return committed.value;
  if (committed.successorPrefix === null) throw new TypeError("admitted threshold has no durable successor");
  const admitted = projectRuntimeLivenessAtPrefix(selectRuntimeEventPrefixFromStore(input.store), input.actorInvocationRef);
  if (admitted?.disposition.disposition !== "controlled_terminate") throw new TypeError("admitted threshold no longer derives containment");
  return { kind: "runtime_threshold_admitted" as const, value: committed.value.event, successorPrefix: committed.successorPrefix, projection: admitted, timeoutClass: committed.value.timeoutClass };
}
