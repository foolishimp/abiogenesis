// The native liveness relation (T-290 C-12b): the function deriving the
// liveness relation from admitted events belongs to the calculus, and the
// liveness owner consumes it. The relation decides a native probe,
// interruption or timeout against the source cut before it, with the
// occurrence's declarations, the execution basis from its `basis_admitted`
// event and the retry budget facts from the retry records, and reads process
// liveness through the caller's read of `actor_process_live` before the event
// (the fold reads its own state). The structural-identity route join (M5) is
// the owner's: the relation returns it as an obligation and never decides it.
import { isRecord } from "../../shared/admit/index.js";
import type { JsonValue } from "../../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, type Sha256Digest } from "../../shared/digests.js";
import { deepFreeze } from "../../shared/immutable.js";
import { ok, type Outcome, type StructuralRefusal } from "../../shared/refusal.js";
import { checkExactRecord, resolveExactMatch, type ExactMatch, type RecordCheck } from "../../shared/select/index.js";
import { canonicalEquals } from "../../shared/value/index.js";
import type { RuntimeEventPrefix, ValidatedRuntimeEventPrefix } from "../event_prefix.js";
import { indexedRuntimeEvents, runtimeEventPrefixDigest, runtimeEventEnvelopesAtPrefix, runtimeEventPrefixExtent,
  runtimeEventAtPrefix, indexedRuntimeEventEnvelopes, runtimePrefixComputation, runtimeEventBodiesAtPrefix, unscopedRuntimeEventPrefix,
  runtimeEventValidationBase, selectValidatedRuntimeEventPrefix, validatedRuntimeEventPrefixThroughEvent,
  validatedRuntimeEventPrefixBeforeEvent } from "../event_prefix.js";
import { runtimeEventProfile, type RuntimeEvent } from "../event_store.js";
import {
  constructRuntimeSystemProbeContract, isRuntimeLivenessBinding, isRuntimeProbeObservation,
  isRuntimeInvocationScope, actorRuntimeProbeSources,
  isRuntimeSystemProbeContract, isRuntimeThresholdObservation,
  runtimeLivenessDigest as digest,
  type RuntimeInvocationScope, type RuntimeLivenessBinding, type RuntimeLivenessObserverProjection,
  type RuntimeProbeObservation, type RuntimeProbeSource, type RuntimeSystemProbeContract,
  type RuntimeLivenessBudgetFacts, type RuntimeLivenessContext, type RuntimeLivenessSample,
} from "../runtime_liveness_contracts.js";
import { projectExactExecutionBasisRecordAtPrefix } from "./execution_basis_record.js";

/** The basis the contexts read: the exact `basis_admitted` record. */
const rehydrateExecutionBasisAtPrefix = projectExactExecutionBasisRecordAtPrefix;

function record(value: unknown): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Owner boundary: `absent` and `many` map to `null`. */
const exactOrNull = <T>(match: ExactMatch<T>): T | null => match.kind === "one" ? match.value : null;

/** @internal */
export interface RuntimeLivenessContextFacts {
  readonly context: RuntimeLivenessContext;
  readonly scopeDigest: Sha256Digest;
}

/** Declaration-owned facts live with the existing reconstruction and its
 * declaration stamp. A copied/raw context still establishes these premises. */
function livenessContextFacts(context: RuntimeLivenessContext | null): RuntimeLivenessContextFacts | null {
  if (context === null || !isRuntimeLivenessBinding(context.binding) || context.probes.length === 0 ||
      new Set(context.probes.map(p => p.probeRef)).size !== context.probes.length) return null;
  const scopeDigest = digest(context.scope);
  if (context.probes.some(p => !isRuntimeSystemProbeContract(p) || digest(p.scope) !== scopeDigest)) return null;
  return { context, scopeDigest };
}
/** Reconstruct predeclared actor probes from admitted owner coordinates, never from observed paths. */
// Each declaration lookup reads the `related:` bucket of the aggregate it
// compares: a superset of its exact matches in the same ordinal order.
function deriveActorLivenessContext(prefix: RuntimeEventPrefix, actorInvocationRef: string): RuntimeLivenessContext | null {
  try {
    const started = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + actorInvocationRef), e => e.kind === "actor_invocation_started" && e.aggregateId === actorInvocationRef));
    if (started === null || !record(started.payload)) return null;
    const p = started.payload;
    const bindingEvent = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + String(p.transportBindingRef)), e => e.kind === "actor_transport_binding_admitted" &&
      e.aggregateId === p.transportBindingRef && e.admissionOrdinal < started.admissionOrdinal));
    const b = bindingEvent?.payload;
    if (bindingEvent === null || !record(b) || !isRuntimeLivenessBinding(b.livenessBinding) ||
        runtimeEventProfile(bindingEvent)?.nativeLiveness !== true || b.livenessBinding.policy === null ||
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
    const opened = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + String(p.cCallRef)), e => e.kind === "c_call_opened" && e.aggregateId === p.cCallRef));
    const fibre = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + String(p.cCallRef)), e => e.kind === "c_call_fibre_selected" && e.aggregateId === p.cCallRef));
    if (basis === null || opened === null || fibre === null || !record(opened.payload) || !record(fibre.payload) ||
        opened.basisId !== basis.basisRef || fibre.payload.regime !== "F_P" || fibre.payload.callClass !== "leaf" ||
        fibre.payload.implementationRef !== b.implementationRef ||
        fibre.payload.implementationBindingRef !== b.implementationBindingRef ||
        !bindingEvent.causationEventRefs.includes(fibre.eventId) ||
        basis.graphFunctionRef !== started.graphFunctionRef || opened.runId !== started.runId ||
        opened.graphCallId !== started.graphCallId || opened.frameId !== started.frameId) return null;
    const op = opened.payload;
    // An absent attempt member is no attempt: the digest is not taken over it.
    if (p.cCallRef === undefined || op.attempt === undefined || p.dispatchOrdinal === undefined || p.actorRef === undefined ||
        p.workerBindingRef === undefined || b.implementationBindingRef === undefined || p.implementationRef === undefined ||
        p.inputDigest === undefined || p.promptDigest === undefined || b.transportPlanDigest === undefined) return null;
    const attemptDigest = digest({ basisRef: basis.basisRef, cCallRef: p.cCallRef, attempt: op.attempt,
      dispatchOrdinal: p.dispatchOrdinal, actorRef: p.actorRef, workerBindingRef: p.workerBindingRef,
      implementationBindingRef: b.implementationBindingRef, implementationRef: p.implementationRef,
      inputDigest: p.inputDigest, promptDigest: p.promptDigest });
    const actorDigest = digest({ attemptDigest, transportBindingRef: b.transportBindingRef, transportBindingDigest: b.transportBindingDigest });
    if (actorInvocationRef !== `actor-invocation://abiogenesis/${actorDigest.slice(7)}` ||
        b.livenessBinding.clockOriginRef !== `runtime-clock://abiogenesis/${digest({ attemptDigest, transportPlanDigest: b.transportPlanDigest }).slice(7)}` ||
        b.livenessBinding.policy.startupMs !== b.timeoutMs || b.livenessBinding.policy.inactivityMs !== b.timeoutMs ||
        b.livenessBinding.policy.hardCapMs !== b.absoluteTimeoutMs || b.livenessBinding.policy.terminationGraceMs !== b.terminationGraceMs ||
        !canonicalEquals(b.livenessBinding.sources, actorRuntimeProbeSources(b.parser as "claude_stream_json" | "plain_text"))) return null;
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
const NON_ACTOR_SOURCES = Object.freeze([
  "graph_progress", "frame_progress", "evaluator_progress", "event_log", "ledger",
  "manifest", "projection", "report", "dossier", "archive", "result_artifact",
] as const satisfies readonly RuntimeProbeSource[]);

/** Existing CCall declarations own non-actor occurrences; observations cannot
 * register a source, borrow an actor clock, or supply an undeclared timeout. */
function deriveCCallLivenessContext(prefix: RuntimeEventPrefix, cCallRef: string): RuntimeLivenessContext | null {
  try {
    const opened = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + cCallRef), e => e.kind === "c_call_opened" && e.aggregateId === cCallRef));
    const selected = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + cCallRef), e => e.kind === "c_call_fibre_selected" && e.aggregateId === cCallRef));
    if (opened === null || selected === null || !record(opened.payload) || !record(selected.payload) ||
        runtimeEventProfile(selected)?.nativeLiveness !== true || selected.payload.regime === "F_P" ||
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
/** @internal */
export const FRAME_PRODUCERS: ReadonlySet<string> = new Set([
  "frame_opened", "actor_invocation_closed", "actor_invocation_failed", "c_call_evidenced",
  "c_call_result_admitted", "c_call_judged", "traversal_route_admitted", "c_call_fibre_selected", "frame_closed",
]);

/** The opening fact declares the occurrence; a probe never registers it. */
function deriveFrameLivenessContext(prefix: RuntimeEventPrefix, frameId: string): RuntimeLivenessContext | null {
  try {
    const opened = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + frameId), e => e.kind === "frame_opened" && e.aggregateId === frameId));
    if (opened === null || !record(opened.payload) || runtimeEventProfile(opened)?.nativeLiveness !== true) return null;
    const p = opened.payload;
    const graph = exactOrNull(resolveExactMatch(indexedRuntimeEvents(prefix, "related:" + String(opened.graphCallId)), e => e.kind === "graph_call_opened" && e.aggregateId === opened.graphCallId));
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
function contextForOccurrence(prefix: RuntimeEventPrefix, occurrenceRef: string): RuntimeLivenessContext | null {
  return deriveActorLivenessContext(prefix, occurrenceRef) ?? deriveCCallLivenessContext(prefix, occurrenceRef) ?? deriveFrameLivenessContext(prefix, occurrenceRef);
}

function frameFailureApplies(event: RuntimeEvent, scope: RuntimeInvocationScope): boolean {
  return event.kind === "runtime_failure_observed" && event.runId === scope.runId &&
    (event.aggregateType === "run" || event.frameId === scope.frameId && event.basisId === scope.basisRef &&
      event.graphCallId === scope.graphCallId && event.graphFunctionRef === scope.graphFunctionRef);
}

/** M5: a frame observation whose route has no CCall and no empty consumption
 * caused by its cursor-origin source holds only if the owner's
 * structural-identity join authenticates the route at `cut`. The relation
 * records the obligation; the liveness owner decides it at admission. */
/** @internal */
export interface NativeLivenessRouteObligation {
  readonly cut: RuntimeEventPrefix;
  readonly underlying: RuntimeEvent;
  readonly source: RuntimeEvent;
}
/** `actor_process_live(processRef)` at the cut before the event the relation
 * decides (a public projection: at its own prefix). The fold reads its state. */
/** @internal */
export type ProcessLiveRead = (processRef: string, cut: () => RuntimeEventPrefix) => boolean;

/** @internal */
export function probeObservationMatches(context: RuntimeLivenessContext,
  contract: RuntimeSystemProbeContract, observation: RuntimeProbeObservation, ordinal: number,
  obligations: NativeLivenessRouteObligation[], reconstruction: RuntimeLivenessReconstruction, cutOrdinal = ordinal - 1): boolean {
  const findEvent = (ref: string) => reconstruction.event(ref, cutOrdinal);
  const declared = context.probes.find(p => p.probeRef === contract?.probeRef);
  if (declared === undefined ||
      (contract !== declared && (!isRuntimeSystemProbeContract(contract) || !canonicalEquals(declared, contract))) ||
      !isRuntimeProbeObservation(observation) ||
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
          const source = indexedRuntimeEvents(reconstruction.cut(cutOrdinal), "cursor-origin:" + p.sourceCursorRef).find(e => e.admissionOrdinal < underlying.admissionOrdinal && e.runId === context.scope.runId &&
            e.frameId === context.scope.frameId && e.graphCallId === context.scope.graphCallId && e.basisId === context.scope.basisRef &&
            e.graphFunctionRef === context.scope.graphFunctionRef && record(e.payload) &&
            (e.kind === "traversal_cursor_entered" && e.payload.cursorRef === p.sourceCursorRef ||
              e.kind === "traversal_route_admitted" && e.payload.targetCursorRef === p.sourceCursorRef));
          if (source === undefined) return false;
          if (!(Array.isArray(p.consumedAvailabilityRefs) && p.consumedAvailabilityRefs.length === 0 &&
              underlying.causationEventRefs.includes(source.eventId)))
            obligations.push({ cut: reconstruction.cut(cutOrdinal), underlying, source });
          return observation.underlyingObservationRef === underlying.eventId && observation.sourceDigest === underlying.payloadDigest;
        }
        const call = exactOrNull(resolveExactMatch(reconstruction.declarationRows(String(cCallRef)), e => e.kind === "c_call_opened" && e.aggregateId === cCallRef && e.admissionOrdinal < underlying.admissionOrdinal));
        if (call === null || !record(call.payload) || call.frameId !== context.scope.frameId || call.runId !== context.scope.runId ||
            call.graphCallId !== context.scope.graphCallId || call.basisId !== context.scope.basisRef || call.graphFunctionRef !== context.scope.graphFunctionRef ||
            !Number.isSafeInteger(call.payload.attempt)) return false;
        if (underlying.kind.startsWith("actor_invocation_")) {
          const actor = reconstruction.context(cutOrdinal, underlying.aggregateId);
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

/** Disposable indexes subordinate to this exact admitted value. Declarations
 * and retry law cannot change at a stdout/stderr/probe row. Reconstruct their
 * owner facts once per structural cut; look up producers and fold observations
 * directly without constructing a pair of historical prefixes per event.
 * A prospective candidate forks its admitted predecessor's reconstruction, as
 * the Event Calculus derivation does: it reads the base through the base cut
 * and advances only its own rows, so the admitted indexes and folds never see
 * a candidate. Values at a cut at or before the base are admitted-history
 * facts, so the fork delegates those cut computations to the base owner. */
type LivenessEnvelope = Omit<RuntimeEvent, "payload">;
/** The one envelope identity each terminal liveness query compares. */
const TERMINAL_IDENTITY: Readonly<Partial<Record<RuntimeEvent["kind"], "aggregateId" | "runId" | "graphCallId" | "frameId">>> = Object.freeze({
  actor_invocation_closed: "aggregateId", actor_invocation_failed: "aggregateId", c_call_judged: "aggregateId",
  run_closed: "runId", run_stopped: "runId", runtime_failure_observed: "runId",
  graph_call_closed: "graphCallId", frame_closed: "frameId",
});
const DECLARATION_KINDS: ReadonlySet<string> = new Set(["actor_invocation_started", "actor_transport_binding_admitted", "c_call_opened",
  "c_call_fibre_selected", "basis_admitted", "frame_opened", "graph_call_opened"]);
const BUDGET_KINDS: ReadonlySet<string> = new Set(["c_call_opened", "retry_attempt_opened", "retry_progress_recorded"]);
const OBSERVED_KINDS: ReadonlySet<string> = new Set(["runtime_activity_probe_observed", "runtime_external_interruption_observed", "actor_process_timeout_observed"]);
function copyFold(fold: RuntimeLivenessHistoryFold): RuntimeLivenessHistoryFold {
  return { ...fold, obligations: [...fold.obligations], seen: new Map(fold.seen), sourceTimes: new Map(fold.sourceTimes),
    coverage: new Set(fold.coverage), evidenceRefs: [...fold.evidenceRefs], systemActivity: new Map(fold.systemActivity) };
}
/** @internal */
export class RuntimeLivenessReconstruction {
  private processed = 0;
  private lastOrdinal = 0;
  private base: RuntimeLivenessReconstruction | undefined;
  private baseOrdinal = 0;
  prefix: RuntimeEventPrefix;
  private readonly sampleHistory = new Map<string, { ordinal: number; sample: RuntimeLivenessSample }[]>();
  private readonly declarationsByIdentity = new Map<string, LivenessEnvelope[]>();
  private readonly duplicateDeclarationAt: number[] = [0];
  private readonly byId = new Map<string, LivenessEnvelope>();
  private readonly byOrdinal = new Map<number, LivenessEnvelope>();
  private readonly byKind = new Map<RuntimeEvent["kind"], LivenessEnvelope[]>();
  // Terminal kinds by their compared envelope identity; process starts by the
  // actor their body names. Rows enter in ordinal order with their kind bucket.
  private readonly byIdentity = new Map<string, LivenessEnvelope[]>();
  private readonly declarationAt: number[] = [0];
  private readonly budgetAt: number[] = [0];
  private readonly observations = new Map<string, LivenessEnvelope[]>();
  readonly folds: RuntimeLivenessHistoryFolds = new Map();
  // Earlier reads have their own disposable progress. They cannot rewind or
  // mutate the later-cut fold, but an ordered historical walk need not restart.
  readonly historicalFolds: RuntimeLivenessHistoryFolds = new Map();
  private readonly contexts = new Map<string, RuntimeLivenessContextFacts | null>();
  private readonly budgets = new Map<string, RuntimeLivenessBudgetFacts>();

  constructor(prefix: RuntimeEventPrefix) { this.prefix = prefix; this.advance(prefix); }
  /** A disposable candidate fork at the exact admitted `cut`. */
  forkAt(cut: RuntimeEventPrefix): RuntimeLivenessReconstruction {
    const extent = runtimeEventPrefixExtent(cut);
    if (extent.count > this.processed) throw new TypeError("a liveness fork requires its advanced admitted base");
    const fork = new RuntimeLivenessReconstruction(selectValidatedRuntimeEventPrefix(Object.freeze([])));
    fork.base = this; fork.baseOrdinal = extent.lastOrdinal;
    fork.processed = extent.count; fork.lastOrdinal = extent.lastOrdinal; fork.prefix = cut;
    return fork;
  }
  private inBase(ordinal: number): boolean { return this.base !== undefined && ordinal <= this.baseOrdinal; }
  private ordinalAt(values: readonly number[], ordinal: number, read: (base: RuntimeLivenessReconstruction) => number): number {
    return this.inBase(ordinal) ? read(this.base!) : values[ordinal] ?? 0;
  }
  declarationOrdinal(ordinal: number): number { return this.ordinalAt(this.declarationAt, ordinal, base => base.declarationOrdinal(ordinal)); }
  budgetOrdinal(ordinal: number): number { return this.ordinalAt(this.budgetAt, ordinal, base => base.budgetOrdinal(ordinal)); }
  duplicateDeclarationOrdinal(ordinal: number): number {
    return this.ordinalAt(this.duplicateDeclarationAt, ordinal, base => base.duplicateDeclarationOrdinal(ordinal));
  }
  private layered(read: (owner: RuntimeLivenessReconstruction) => readonly LivenessEnvelope[] | undefined): readonly LivenessEnvelope[] | undefined {
    const own = read(this);
    if (this.base === undefined) return own;
    const inherited = (this.base.layered(read) ?? []).filter(row => row.admissionOrdinal <= this.baseOrdinal);
    return inherited.length === 0 ? own : own === undefined ? inherited : [...inherited, ...own];
  }
  private declarationsFor(identity: string): readonly LivenessEnvelope[] {
    return this.layered(owner => owner.declarationsByIdentity.get(identity)) ?? [];
  }
  /** The envelope at an exact admitted ordinal of this cut. */
  envelopeAt(ordinal: number): LivenessEnvelope | undefined {
    return this.inBase(ordinal) ? this.base!.envelopeAt(ordinal) : this.byOrdinal.get(ordinal);
  }
  private envelope(ref: string): LivenessEnvelope | undefined {
    const own = this.byId.get(ref);
    if (own !== undefined || this.base === undefined) return own;
    const inherited = this.base.envelope(ref);
    return inherited !== undefined && inherited.admissionOrdinal <= this.baseOrdinal ? inherited : undefined;
  }
  private lastSample(scope: string): RuntimeLivenessSample | undefined {
    return this.sampleHistory.get(scope)?.at(-1)?.sample ?? (this.base === undefined ? undefined : this.base.sample(this.baseOrdinal, scope) ?? undefined);
  }
  advance(prefix: RuntimeEventPrefix): void {
    const extent = runtimeEventPrefixExtent(prefix);
    if (extent.count <= this.processed) return;
    const processed = this.processed;
    let declaration = this.declarationOrdinal(this.lastOrdinal);
    let budget = this.budgetOrdinal(this.lastOrdinal);
    let duplicateDeclaration = this.duplicateDeclarationOrdinal(this.lastOrdinal);
    this.prefix = prefix;
    const add = (target: Map<string, LivenessEnvelope[]>, key: string, event: LivenessEnvelope) => {
      const rows = target.get(key) ?? []; rows.push(event); target.set(key, rows);
    };
    for (const event of runtimeEventEnvelopesAtPrefix(prefix, processed)) {
      this.byId.set(event.eventId, event);
      this.byOrdinal.set(event.admissionOrdinal, event);
      add(this.byKind as Map<string, LivenessEnvelope[]>, event.kind, event);
      const field = TERMINAL_IDENTITY[event.kind];
      const identity = field === undefined ? undefined : event[field];
      if (typeof identity === "string") add(this.byIdentity, event.kind + "\0" + identity, event);
      // Exactly the declarations read by the three context owners and their
      // execution-basis owner. Duplicate declarations change this cut too.
      if (DECLARATION_KINDS.has(event.kind)) { declaration = event.admissionOrdinal;
        const identities = new Set([event.aggregateId]);
        if (event.kind === "frame_opened" && event.frameId !== undefined) identities.add(event.frameId);
        if (event.kind === "basis_admitted" && event.basisId !== undefined) identities.add(event.basisId);
        for (const identity of identities) {
          if (this.declarationsFor(identity).some(row => row.kind === event.kind)) duplicateDeclaration = event.admissionOrdinal;
          add(this.declarationsByIdentity, identity, event);
        } }
      if (BUDGET_KINDS.has(event.kind)) budget = event.admissionOrdinal;
      this.declarationAt[event.admissionOrdinal] = declaration;
      this.duplicateDeclarationAt[event.admissionOrdinal] = duplicateDeclaration;
      this.budgetAt[event.admissionOrdinal] = budget;
      const observed = OBSERVED_KINDS.has(event.kind) || event.kind === "actor_process_started"
        ? runtimeEventAtPrefix(prefix, event.eventId) : undefined;
      const payload = observed?.payload;
      if (event.kind === "actor_process_started") {
        if (record(payload) && typeof payload.actorInvocationRef === "string")
          add(this.byIdentity, event.kind + "\0" + payload.actorInvocationRef, event);
        continue;
      }
      if ((event.kind === "runtime_activity_probe_observed" || event.kind === "runtime_external_interruption_observed") &&
          record(payload) && isRuntimeProbeObservation(payload.observation)) add(this.observations, payload.observation.scopeDigest, event);
      if (record(payload)) {
        const observation = payload.observation, threshold = payload.thresholdObservation;
        const scopes = new Set<string>();
        if (isRuntimeProbeObservation(observation)) scopes.add(observation.scopeDigest);
        if (isRuntimeThresholdObservation(threshold)) scopes.add(threshold.scopeDigest);
        for (const scope of scopes) {
          let sample = this.lastSample(scope);
          if (isRuntimeProbeObservation(observation) && observation.scopeDigest === scope &&
              (sample === undefined || observation.elapsedMs > sample.elapsedMs))
            sample = { clockOriginRef: observation.clockOriginRef, elapsedMs: observation.elapsedMs, eventRef: event.eventId };
          if (isRuntimeThresholdObservation(threshold) && threshold.scopeDigest === scope)
            sample = { clockOriginRef: threshold.clockOriginRef, elapsedMs: threshold.elapsedMs, eventRef: event.eventId };
          if (sample !== undefined) {
            const rows = this.sampleHistory.get(scope) ?? [];
            rows.push({ ordinal: event.admissionOrdinal, sample }); this.sampleHistory.set(scope, rows);
          }
        }
      }
    }
    this.processed = extent.count; this.lastOrdinal = extent.lastOrdinal;
  }
  facts(ordinal: number): ReturnType<typeof runtimeEventBodiesAtPrefix> {
    return runtimeEventBodiesAtPrefix(this.cut(ordinal));
  }
  declarationRows(identity: string): readonly RuntimeEvent[] {
    return this.declarationsFor(identity).map(row => runtimeEventAtPrefix(this.prefix, row.eventId)!);
  }
  /** Observation envelopes of one scope in ordinal order; undefined when none was admitted. */
  observationEnvelopes(scope: string): readonly LivenessEnvelope[] | undefined {
    return this.layered(owner => owner.observations.get(scope));
  }
  observationRows(scope: string, ordinal: number): readonly RuntimeEvent[] {
    return (this.observationEnvelopes(scope) ?? []).filter(row => row.admissionOrdinal <= ordinal).map(row => runtimeEventAtPrefix(this.prefix, row.eventId)!);
  }
  some(ordinal: number, kinds: readonly RuntimeEvent["kind"][], predicate: (event: RuntimeEvent) => boolean): boolean {
    return kinds.some(kind => this.someRows(this.layered(owner => owner.byKind.get(kind)) ?? [], ordinal, predicate));
  }
  /** The same query, selecting each kind's rows by the one envelope (or, for
   * process starts, body) identity its predicate compares before any body
   * read. A non-string identity keeps the complete kind bucket. */
  someIdentified(ordinal: number, selectors: readonly (readonly [RuntimeEvent["kind"], unknown])[],
    predicate: (event: RuntimeEvent) => boolean): boolean {
    return selectors.some(([kind, identity]) => typeof identity === "string" && (TERMINAL_IDENTITY[kind] !== undefined || kind === "actor_process_started")
      ? this.someRows(this.layered(owner => owner.byIdentity.get(kind + "\0" + identity)) ?? [], ordinal, predicate)
      : this.some(ordinal, [kind], predicate));
  }
  private someRows(rows: readonly LivenessEnvelope[], ordinal: number, predicate: (event: RuntimeEvent) => boolean): boolean {
    for (const event of rows) {
      if (event.admissionOrdinal > ordinal) break;
      if (predicate(runtimeEventAtPrefix(this.prefix, event.eventId)!)) return true;
    }
    return false;
  }
  event(ref: string, ordinal: number): RuntimeEvent | undefined {
    const event = this.envelope(ref);
    return event !== undefined && event.admissionOrdinal <= ordinal ? runtimeEventAtPrefix(this.prefix, ref) : undefined;
  }
  cut(ordinal: number): RuntimeEventPrefix {
    if (ordinal === 0) return selectValidatedRuntimeEventPrefix(Object.freeze([]));
    if (this.inBase(ordinal)) return this.base!.cut(ordinal);
    return validatedRuntimeEventPrefixThroughEvent(this.prefix, this.byOrdinal.get(ordinal)!.eventId);
  }
  sample(ordinal: number, scopeDigest: string): RuntimeLivenessSample | null {
    const rows = this.sampleHistory.get(scopeDigest) ?? [];
    let low = 0, high = rows.length;
    while (low < high) { const middle = (low + high) >>> 1; if (rows[middle]!.ordinal <= ordinal) low = middle + 1; else high = middle; }
    return rows[low - 1]?.sample ?? (this.base === undefined ? null : this.base.sample(Math.min(ordinal, this.baseOrdinal), scopeDigest));
  }
  contextStamp(ordinal: number, occurrenceRef: string): string {
    const own = this.declarationsFor(occurrenceRef).filter(e => e.admissionOrdinal <= ordinal);
    const header = own.find(e => ["actor_invocation_started", "c_call_opened", "frame_opened"].includes(e.kind));
    const opened = header === undefined ? undefined : runtimeEventAtPrefix(this.prefix, header.eventId);
    if (opened === undefined || !record(opened.payload)) return occurrenceRef + "/" + own.map(e => e.eventId).join("/");
    const identities = [occurrenceRef, opened.basisId, opened.payload.cCallRef, opened.payload.transportBindingRef];
    if (opened.kind === "frame_opened") identities.push(opened.graphCallId, opened.payload.parentFrameId);
    const rows = [...new Set(identities.flatMap(identity => typeof identity === "string" ? this.declarationsFor(identity) : []))]
      .filter(e => e.admissionOrdinal <= ordinal).sort((a, b) => a.admissionOrdinal - b.admissionOrdinal);
    return occurrenceRef + "/" + rows.map(e => e.eventId).join("/");
  }

  context(ordinal: number, occurrenceRef: string): RuntimeLivenessContext | null {
    return this.contextFacts(ordinal, occurrenceRef)?.context ?? null;
  }
  contextFacts(ordinal: number, occurrenceRef: string): RuntimeLivenessContextFacts | null {
    // No candidate declaration at or before `ordinal`: the base's own cut decides.
    if (this.base !== undefined && this.declarationOrdinal(ordinal) <= this.baseOrdinal)
      return this.base.contextFacts(Math.min(ordinal, this.baseOrdinal), occurrenceRef);
    const key = this.contextStamp(ordinal, occurrenceRef);
    if (!this.contexts.has(key)) this.contexts.set(key,
      livenessContextFacts(contextForOccurrence(this.cut(this.declarationOrdinal(ordinal)), occurrenceRef)));
    return this.contexts.get(key)!;
  }
  budget(ordinal: number, context: RuntimeLivenessContext): RuntimeLivenessBudgetFacts {
    const at = this.budgetOrdinal(ordinal);
    if (this.base !== undefined && at <= this.baseOrdinal) return this.base.budget(Math.min(ordinal, this.baseOrdinal), context);
    const key = at + "/" + digest(context.scope);
    let budget = this.budgets.get(key);
    if (budget === undefined) {
      budget = projectRuntimeRetryBudgetFacts(this.cut(at), context.scope);
      this.budgets.set(key, budget);
    }
    return budget;
  }
  /** A disposable copy of the admitted base fold through the base cut; the
   * base's own lane is never advanced by a candidate. */
  inheritedFold(key: string): RuntimeLivenessHistoryFold | undefined {
    const base = this.base;
    if (base === undefined) return undefined;
    const fold = base.folds.get(key) ?? base.inheritedFold(key);
    if (fold === undefined || fold.rowCount === 0) return undefined;
    const rows = base.observationEnvelopes(key.slice(key.lastIndexOf("/") + 1)) ?? [];
    return rows[fold.rowCount - 1] !== undefined && rows[fold.rowCount - 1]!.admissionOrdinal <= this.baseOrdinal ? copyFold(fold) : undefined;
  }
}

const LIVENESS_DERIVATION = Symbol("ordered_runtime_liveness_derivation");
/** @internal */
export function livenessReconstruction(prefix: RuntimeEventPrefix): RuntimeLivenessReconstruction {
  const reconstruction = runtimePrefixComputation(prefix, LIVENESS_DERIVATION, () => {
    const base = runtimeEventValidationBase(prefix);
    return base === undefined ? new RuntimeLivenessReconstruction(prefix) : livenessReconstruction(base).forkAt(base);
  });
  reconstruction.advance(prefix); return reconstruction;
}

/** The relation: a native liveness event holds against the source it belongs
 * to. Original identity and ordinal membership prevent borrowing another
 * event, computation, or later cut. The structural-identity route join is
 * returned in `obligations` and is not decided here. */
/** @internal */
export function nativeLivenessRelationHolds(source: RuntimeEventPrefix, processLive: ProcessLiveRead, event: RuntimeEvent,
  obligations: NativeLivenessRouteObligation[] = []): boolean {
  const history = unscopedRuntimeEventPrefix(source);
  const reconstruction = livenessReconstruction(history);
  if (event.admissionOrdinal > (runtimeEventBodiesAtPrefix(history).at(-1)?.admissionOrdinal ?? 0)) return false;
  const reconstructed = reconstruction.event(event.eventId, event.admissionOrdinal);
  return reconstructed !== undefined && canonicalEquals(reconstructed, event) &&
    decideRuntimeLivenessEvent(history, event, reconstruction, processLive, obligations);
}

/** @internal */
export function decideRuntimeLivenessEvent(prefix: RuntimeEventPrefix, event: RuntimeEvent,
  reconstruction: RuntimeLivenessReconstruction, processLive: ProcessLiveRead, obligations: NativeLivenessRouteObligation[]): boolean {
  try {
    const p = event.payload, ordinal = event.admissionOrdinal - 1;
    if (!record(p) || runtimeEventProfile(event)?.nativeLiveness !== true ||
        event.admissionOrdinal !== ordinal + 1) return false;
    const actor = typeof p.actorInvocationRef === "string" ? p.actorInvocationRef : null;
    const probe = isRuntimeSystemProbeContract(p.probeContract) ? p.probeContract : null;
    const occurrence = actor ?? (probe === null ? null : probe.scope.cCallRef ?? probe.scope.frameId);
    const context = occurrence === null ? null : reconstruction.context(ordinal, occurrence);
    if (context === null || event.runId !== context.scope.runId || event.basisId !== context.scope.basisRef ||
        event.graphCallId !== context.scope.graphCallId || event.frameId !== context.scope.frameId ||
        event.graphFunctionRef !== context.scope.graphFunctionRef ||
        actor !== null && reconstruction.someIdentified(ordinal, [["actor_invocation_closed", actor], ["actor_invocation_failed", actor]], e => e.aggregateId === actor)) return false;
    if (event.kind === "actor_process_timeout_observed") {
      const t = p.thresholdObservation;
      prefix = reconstruction.cut(ordinal);
      if (context.binding.policy === null || !isRuntimeThresholdObservation(t) || t.evaluatedPrefixDigest !== runtimeEventPrefixDigest(prefix) ||
          t.policyRef !== context.binding.policy.policyRef || t.scopeDigest !== digest(context.scope)) return false;
      const cut = prefix;
      const projection = deriveRuntimeLivenessProjection(cut, context, { clockOriginRef: t.clockOriginRef, elapsedMs: t.elapsedMs, eventRef: null },
        undefined, () => runtimeEventPrefixDigest(cut), processRef => processLive(processRef, () => cut), obligations);
      return projection?.projectionDigest === t.projectionDigest && projection.disposition.disposition === "controlled_terminate" &&
        p.timeoutClass === (projection.hardCapReached ? "absolute" : "inactivity") &&
        p.timeoutMs === (projection.hardCapReached ? context.binding.policy.hardCapMs : context.binding.policy.inactivityMs) &&
        reconstruction.someIdentified(ordinal, [["actor_process_started", actor]], e => e.kind === "actor_process_started" && e.aggregateId === p.processRef && record(e.payload) && e.payload.actorInvocationRef === actor);
    }
    if (probe === null || !isRuntimeProbeObservation(p.observation) ||
        p.observation.scopeDigest !== digest(context.scope) ||
        (actor !== null ? event.aggregateId !== actor || event.aggregateType !== "actor_invocation" || event.parentAggregateId !== context.scope.cCallRef :
          event.aggregateId !== context.scope.graphCallId || event.aggregateType !== "graph_call" || event.parentAggregateId !== context.scope.runId) ||
        !canonicalEquals(event.causationEventRefs, [...new Set([context.declarationEventRef, ...p.observation.evidenceRefs])]) ||
        (p.observation.signal === "external_interruption") !== (event.kind === "runtime_external_interruption_observed")) return false;
    const underlyingEventRef = p.observation.underlyingEventRef;
    const frameOccurrence = context.scope.actorInvocationRef === null && context.scope.cCallRef === null;
    const previousEvent = reconstruction.envelopeAt(ordinal);
    const terminalFrameSample = frameOccurrence && previousEvent?.kind === "frame_closed" &&
      previousEvent?.eventId === underlyingEventRef && previousEvent?.frameId === context.scope.frameId;
    const frameScopeDigest = frameOccurrence ? digest(context.scope) : null;
    if (frameOccurrence && (reconstruction.observationRows(frameScopeDigest!, ordinal)).some(e => e.admissionOrdinal <= ordinal && e.kind === "runtime_activity_probe_observed" && record(e.payload) &&
        isRuntimeProbeObservation(e.payload.observation) && e.payload.observation.scopeDigest === frameScopeDigest &&
        e.payload.observation.underlyingEventRef === underlyingEventRef)) return false;
    // Each kind is selected by the identity its disjunct compares; a kind no
    // disjunct can match for this occurrence is not read.
    if (reconstruction.someIdentified(ordinal, [["run_closed", context.scope.runId], ["run_stopped", context.scope.runId],
        ["graph_call_closed", context.scope.graphCallId], ["frame_closed", context.scope.frameId],
        ...(frameOccurrence ? [["runtime_failure_observed", context.scope.runId] as const] : []),
        ...(context.scope.cCallRef !== null ? [["c_call_judged", context.scope.cCallRef] as const] : [])], e => (e.kind === "run_closed" || e.kind === "run_stopped") && e.runId === context.scope.runId ||
        e.kind === "graph_call_closed" && e.graphCallId === context.scope.graphCallId ||
        e.kind === "frame_closed" && e.frameId === context.scope.frameId && !terminalFrameSample ||
        frameOccurrence && frameFailureApplies(e, context.scope) ||
        e.kind === "c_call_judged" && e.aggregateId === context.scope.cCallRef && e.eventId !== underlyingEventRef)) return false;
    const after = reconstruction.prefix;
    return deriveRuntimeLivenessSemantics(after, context, { clockOriginRef: p.observation.clockOriginRef,
      elapsedMs: p.observation.elapsedMs, eventRef: event.eventId },
      processRef => processLive(processRef, () => validatedRuntimeEventPrefixBeforeEvent(after, event.eventId)),
      obligations, undefined, reconstruction, event.admissionOrdinal) !== null;
  } catch { return false; }
}
type RuntimeLivenessSemantics = Omit<RuntimeLivenessObserverProjection,
  "prefixDigest" | "projectionDigest" | "projectionRef">;

interface RuntimeLivenessHistoryFold {
  readonly rowCount: number;
  readonly obligations: NativeLivenessRouteObligation[];
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
  prefix: RuntimeEventPrefix,
  context: RuntimeLivenessContext,
  sample: RuntimeLivenessSample,
  processLiveAt: (processRef: string) => boolean,
  obligations: NativeLivenessRouteObligation[],
  selectedBudget: RuntimeLivenessBudgetFacts | undefined,
  reconstruction: RuntimeLivenessReconstruction,
  ordinal = runtimeEventBodiesAtPrefix(prefix).at(-1)?.admissionOrdinal ?? 0,
): RuntimeLivenessSemantics | null {
  try {
    let scanned: ReturnType<typeof runtimeEventBodiesAtPrefix> | undefined;
    const events = () => scanned ??= reconstruction.facts(ordinal);
    const occurrence = context.scope.actorInvocationRef ?? context.scope.cCallRef ?? context.scope.frameId;
    const authenticated = reconstruction.contextFacts(ordinal, occurrence);
    if (authenticated === null || context !== authenticated.context &&
        (livenessContextFacts(context) === null || !canonicalEquals(authenticated.context, context))) return null;
    // All later consumers use the established immutable owner value. Object
    // identity is useful only after the exact current declaration lookup above.
    context = authenticated.context;
    const { scopeDigest } = authenticated;
    const budget = { resultRejectionRef: null, ...(selectedBudget ?? reconstruction.budget(ordinal, context)) };
    if (sample.clockOriginRef !== context.binding.clockOriginRef || !Number.isFinite(sample.elapsedMs) || sample.elapsedMs < 0 ||
        typeof budget.retryEligible !== "boolean" ||
        !(budget.resultRejectionRef === null || typeof budget.resultRejectionRef === "string" && budget.resultRejectionRef.length > 0) ||
        !(budget.continuationRef === null || typeof budget.continuationRef === "string" && budget.continuationRef.length > 0) ||
        !["block", "escalate", "reprice_policy"].includes(budget.terminalPolicy) ||
        budget.remaining !== null && (!Number.isSafeInteger(budget.remaining) || budget.remaining < 0)) return null;
    const rows = reconstruction.observationEnvelopes(scopeDigest) ?? events().filter(e =>
      (e.kind === "runtime_activity_probe_observed" || e.kind === "runtime_external_interruption_observed") &&
      record(e.payload) && isRuntimeProbeObservation(e.payload.observation) && e.payload.observation.scopeDigest === scopeDigest);
    const foldKey = (context.scope.actorInvocationRef === null && context.scope.cCallRef === null
      ? reconstruction.contextStamp(ordinal, occurrence) + "/duplicates:" + reconstruction.duplicateDeclarationOrdinal(ordinal)
      : reconstruction.contextStamp(ordinal, occurrence)) + "/" + scopeDigest;
    const later = reconstruction.folds.get(foldKey);
    const historical = later !== undefined && later.rowCount > 0 && rows[later.rowCount - 1]!.admissionOrdinal > ordinal;
    const folds = historical ? reconstruction.historicalFolds : reconstruction.folds;
    const previous = folds.get(foldKey) ?? (historical ? undefined : reconstruction.inheritedFold(foldKey));
    folds.delete(foldKey);
    // The index owns the immutable sequence. A reverse read starts a fresh fold
    // in its selected lane; successful increasing cuts retain that lane's work.
    const reusable = previous !== undefined && (previous.rowCount === 0 || rows[previous.rowCount - 1]!.admissionOrdinal <= ordinal);
    const fold: RuntimeLivenessHistoryFold = reusable ? previous : {
      rowCount: 0, obligations: [], seen: new Map(), sourceTimes: new Map(), coverage: new Set(), evidenceRefs: [], systemActivity: new Map(),
      lastElapsed: 0, maxElapsed: 0, lastActivity: null, interrupted: false, lastArtifactObservationRef: null, artifactState: "absent",
    };
    if (fold.maxElapsed > sample.elapsedMs) return null;
    const { seen, sourceTimes, coverage, evidenceRefs, systemActivity } = fold;
    const rowObligations = [...fold.obligations];
    let { lastElapsed, lastActivity, interrupted, lastArtifactObservationRef, artifactState } = fold;
    let maxElapsed = fold.maxElapsed;
    let rowCount = fold.rowCount;
    for (; rowCount < rows.length && rows[rowCount]!.admissionOrdinal <= ordinal; rowCount++) {
      const selected = rows[rowCount]!;
      const event = runtimeEventAtPrefix(prefix, selected.eventId)!;
      const p = event.payload as unknown as { probeContract: RuntimeSystemProbeContract; observation: RuntimeProbeObservation };
      const o = p.observation;
      if (!probeObservationMatches(context, p.probeContract, o, event.admissionOrdinal, rowObligations, reconstruction, ordinal) ||
          o.elapsedMs > sample.elapsedMs) return null;
      maxElapsed = Math.max(maxElapsed, o.elapsedMs);
      const key = `${o.probeRef}\0${o.underlyingObservationRef}`;
      const priorSource = sourceTimes.get(o.underlyingObservationRef);
      if (priorSource !== undefined && (priorSource.elapsedMs !== o.elapsedMs || priorSource.sourceDigest !== o.sourceDigest)) return null;
      sourceTimes.set(o.underlyingObservationRef, { elapsedMs: o.elapsedMs, sourceDigest: o.sourceDigest });
      const previous = seen.get(key);
      if (previous !== undefined) {
        if (!canonicalEquals(previous, o)) return null; // delayed alias keeps original elapsed
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
    obligations.push(...rowObligations);
    folds.set(foldKey, { rowCount, obligations: rowObligations, seen, sourceTimes, coverage, evidenceRefs, systemActivity,
      lastElapsed, maxElapsed, lastActivity, interrupted, lastArtifactObservationRef, artifactState });
    const any = (selectors: readonly (readonly [RuntimeEvent["kind"], unknown])[], predicate: (event: RuntimeEvent) => boolean) =>
      reconstruction.someIdentified(ordinal, selectors, predicate);
    const policy = context.binding.policy;
    const leaseDeadlineElapsedMs = policy === null ? null : lastActivity === null ? policy.startupMs : lastActivity + policy.inactivityMs;
    const hardCapReached = policy !== null && sample.elapsedMs >= policy.hardCapMs;
    const leaseExpired = leaseDeadlineElapsedMs !== null && sample.elapsedMs >= leaseDeadlineElapsedMs;
    const completeCoverage = context.probes.every(p => !p.required || coverage.has(p.probeRef));
    const actorRef = context.scope.actorInvocationRef;
    const actorDone = actorRef !== null && any([["actor_invocation_closed", actorRef], ["actor_invocation_failed", actorRef]], e => e.aggregateId === actorRef);
    const frameOccurrence = actorRef === null && context.scope.cCallRef === null;
    if (frameOccurrence && any([["run_stopped", context.scope.runId], ["runtime_failure_observed", context.scope.runId]], e => (e.kind === "run_stopped" && e.runId === context.scope.runId) ||
        frameFailureApplies(e, context.scope))) interrupted = true;
    const occurrenceDone = actorDone || actorRef === null && any(frameOccurrence ? [["frame_closed", context.scope.frameId]] : [["c_call_judged", context.scope.cCallRef]], e => frameOccurrence
      ? e.kind === "frame_closed" && e.frameId === context.scope.frameId
      : e.kind === "c_call_judged" && e.aggregateId === context.scope.cCallRef);
    // Process liveness is the fold's actor_process_live, read by the caller:
    // in the relation at the cut before the event at `ordinal` (the fold reads
    // its own state, so the relation never re-enters the fold at its own
    // event); in the public path at the prefix itself. The start event only
    // binds processRef.
    const started = { processRef: null as string | null };
    const processLive = actorRef !== null && any([["actor_process_started", actorRef]], e => {
      if (!record(e.payload) || e.payload.actorInvocationRef !== actorRef) return false;
      started.processRef = e.aggregateId; return true;
    }) && !actorDone && started.processRef !== null && processLiveAt(started.processRef);
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
    // The lease over admitted activity contains a live process whatever the
    // coverage; unknown coverage withholds only the no-progress classification.
    else if (leaseExpired && processLive) { disposition = "controlled_terminate"; reason = lastActivity === null ? "startup_expired" : "inactivity_expired"; }
    else if (leaseExpired && completeCoverage) {
      if (budget.continuationRef !== null) { disposition = "yield_continuation"; reason = "declared_same_edge_continuation"; }
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

/** The projection over the cited budget (absent: derived), with its prefix
 * digest; the route obligations of its rows are appended to `obligations`. */
/** @internal */
export function deriveRuntimeLivenessProjection(
  prefix: RuntimeEventPrefix,
  context: RuntimeLivenessContext,
  sample: RuntimeLivenessSample,
  selectedBudget: RuntimeLivenessBudgetFacts | undefined,
  prefixDigest: () => Sha256Digest,
  processLiveAt: (processRef: string) => boolean,
  obligations: NativeLivenessRouteObligation[],
): RuntimeLivenessObserverProjection | null {
  try {
    const semantics = deriveRuntimeLivenessSemantics(prefix, context, sample, processLiveAt, obligations, selectedBudget, livenessReconstruction(prefix));
    if (semantics === null) return null;
    const { kind, schemaVersion, scope, policyRef, ...derived } = semantics;
    const body = { kind, schemaVersion, scope, policyRef,
      prefixDigest: prefixDigest(), ...derived };
    const projectionDigest = digest(body);
    return deepFreeze({ ...body, projectionDigest, projectionRef: `runtime-liveness://abiogenesis/${projectionDigest.slice(7)}` });
  } catch { return null; }
}

type DigestedRecord = Readonly<{
  ref: JsonValue | undefined;
  digest: Sha256Digest;
  body: Readonly<Record<string, JsonValue>>;
}>;

const DIGESTED_RECORD_REFUSAL: StructuralRefusal = Object.freeze({
  kind: "structural_refusal",
  stage: "validate",
  code: "digested_record_projection",
  path: Object.freeze(["payload"]),
  evidence: Object.freeze({}),
});

/** A CRetry record payload splits into its ref, its digest and its body. */
function digestedRecord(event: RuntimeEvent, refKey: string, digestKey: string): Outcome<DigestedRecord> {
  if (!isRecord(event.payload)) return DIGESTED_RECORD_REFUSAL;
  const { [refKey]: ref, [digestKey]: digest, ...body } = event.payload;
  return isSha256Digest(digest) ? ok({ ref, digest, body }) : DIGESTED_RECORD_REFUSAL;
}
/** The body's canonical digest is the recorded digest (D2). */
const DIGESTED_RECORD_DIGEST = Object.freeze({
  expected: (_event: RuntimeEvent, record: DigestedRecord) => record.digest,
  actual: (record: DigestedRecord) => sha256Canonical(record.body),
});
/** One `retry_attempt_opened` event as a checked record. */
const RETRY_ATTEMPT_RECORD: RecordCheck<RuntimeEvent, DigestedRecord> = Object.freeze({
  project: (event: RuntimeEvent) => digestedRecord(event, "attemptRef", "attemptDigest"),
  digest: DIGESTED_RECORD_DIGEST,
});
/** One `retry_progress_recorded` event as a checked record. */
const RETRY_PROGRESS_RECORD: RecordCheck<RuntimeEvent, DigestedRecord> = Object.freeze({
  project: (event: RuntimeEvent) => digestedRecord(event, "progressRef", "progressDigest"),
  digest: DIGESTED_RECORD_DIGEST,
});

/** Bodies of one kind in the basis bucket whose envelope matches the scope's
 * Run, GraphCall and frame, in ordinal order. Envelope conjuncts are a subset
 * of each caller's predicate, so exact-match outcomes are unchanged; an
 * irregular id that does not read back at its envelope ordinal keeps the
 * original bucket bodies. */
function basisBodiesOfKind(prefix: RuntimeEventPrefix, scope: RuntimeInvocationScope, kind: string): readonly RuntimeEvent[] {
  const key = "basis:" + scope.basisRef;
  const bodies: RuntimeEvent[] = [];
  for (const envelope of indexedRuntimeEventEnvelopes(prefix, key)) {
    if (envelope.kind !== kind || envelope.basisId !== scope.basisRef || envelope.runId !== scope.runId ||
        envelope.graphCallId !== scope.graphCallId || envelope.frameId !== scope.frameId) continue;
    const body = runtimeEventAtPrefix(prefix, envelope.eventId);
    if (body === undefined || body.admissionOrdinal !== envelope.admissionOrdinal) return indexedRuntimeEvents(prefix, key);
    bodies.push(body);
  }
  return bodies;
}
/** Descriptive budget facts from existing native CRetry records. This helper
 * deliberately calls neither replay nor eligibility nor liveness. Actual retry
 * admission still verifies the full declared frontier, cursor and failure.
 * (Moved from the retry owner, T-290 C-12b; its only consumer is liveness.) */
/** @internal */
export function projectRuntimeRetryBudgetFacts(prefix: ValidatedRuntimeEventPrefix, scope: RuntimeInvocationScope): RuntimeLivenessBudgetFacts;
/** @internal */
export function projectRuntimeRetryBudgetFacts(prefix: RuntimeEventPrefix, scope: RuntimeInvocationScope): RuntimeLivenessBudgetFacts;
export function projectRuntimeRetryBudgetFacts(prefix: RuntimeEventPrefix, scope: RuntimeInvocationScope): RuntimeLivenessBudgetFacts {
  const absent: RuntimeLivenessBudgetFacts = { remaining: null, retryEligible: false, continuationRef: null, terminalPolicy: "block" };
  // A frame or actor scope carries no CCall, and no lawful `c_call_opened`
  // has a null aggregate: the null-parent bucket can only yield `absent`.
  // The extent read keeps the prefix's authenticity and generation checks.
  if (scope.cCallRef === null) { runtimeEventPrefixExtent(prefix); return absent; }
  const opened = indexedRuntimeEvents(prefix, "related:" + scope.cCallRef).find(event => event.kind === "c_call_opened" && event.aggregateId === scope.cCallRef &&
    event.basisId === scope.basisRef && event.runId === scope.runId && event.graphCallId === scope.graphCallId && event.frameId === scope.frameId);
  if (opened === undefined || !isRecord(opened.payload) || !Array.isArray(opened.payload.retryPath) || opened.payload.retryPath.length === 0) return absent;
  const retryPath = opened.payload.retryPath;
  const attempt = checkExactRecord(resolveExactMatch(basisBodiesOfKind(prefix, scope, "retry_attempt_opened"), event => event.kind === "retry_attempt_opened" && isRecord(event.payload) &&
    event.basisId === scope.basisRef && event.runId === scope.runId && event.graphCallId === scope.graphCallId &&
    event.frameId === scope.frameId && event.admissionOrdinal < opened.admissionOrdinal &&
    event.payload.attempt === scope.attempt && event.payload.taskOrdinal === scope.taskOrdinal && Array.isArray(event.payload.retryPath) &&
    canonicalEquals(event.payload.retryPath, retryPath)), RETRY_ATTEMPT_RECORD);
  // Owner boundary: `absent`, `many` and `invalid` are the existing `absent` facts.
  if (attempt.kind !== "one") return absent;
  const { ref: attemptRef, digest: attemptDigest, body } = attempt.value;
  if (attemptRef !== `retry-attempt://abiogenesis/${String(attemptDigest).slice(7)}` ||
      !Number.isSafeInteger(body.budget) || Number(body.budget) < scope.attempt) return absent;
  const remaining = Number(body.budget) - scope.attempt;
  const progressRecord = checkExactRecord(resolveExactMatch(basisBodiesOfKind(prefix, scope, "retry_progress_recorded"), event => event.kind === "retry_progress_recorded" && isRecord(event.payload) &&
    event.basisId === scope.basisRef && event.runId === scope.runId && event.graphCallId === scope.graphCallId && event.frameId === scope.frameId &&
    event.payload.attemptRef === attemptRef && event.payload.cCallRef === scope.cCallRef), RETRY_PROGRESS_RECORD);
  let retryEligible = false;
  let resultRejectionRef: string | null = null;
  // Owner boundary: `absent`, `many` and `invalid` leave the progress facts unset.
  if (progressRecord.kind === "one") {
    const { ref: progressRef, digest: progressDigest, body: progress } = progressRecord.value;
    const exactProgress = progress.remainingBudget === remaining &&
      progress.budget === body.budget && progress.retryBoundaryRef === body.retryBoundaryRef &&
      progressRef === `retry-progress://abiogenesis/${String(progressDigest).slice(7)}`;
    retryEligible = exactProgress && remaining > 0 && progress.progressClass === "retry";
    if (exactProgress && progress.failureClass === "contract_failure" && typeof progress.failureSignalRef === "string") resultRejectionRef = progress.failureSignalRef;
  }
  return deepFreeze({ remaining, retryEligible, continuationRef: null, terminalPolicy: "block", resultRejectionRef });
}

