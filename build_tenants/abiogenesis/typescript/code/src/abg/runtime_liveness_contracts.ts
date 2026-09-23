import type { JsonValue } from "../shared/canonical_json.js";
import * as v from "valibot";
import { isSha256Digest, sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

/** Fixed native declaration vocabulary, never a runtime registration API. */
export const RUNTIME_PROBE_SOURCE_VALUES = Object.freeze([
  "stdout", "stderr", "pty", "structured_output", "tool_progress", "api_progress",
  "process_lifecycle", "worker_heartbeat", "graph_progress", "frame_progress",
  "evaluator_progress", "event_log", "ledger", "manifest", "projection",
  "report", "dossier", "archive", "result_artifact",
] as const);
export type RuntimeProbeSource = typeof RUNTIME_PROBE_SOURCE_VALUES[number];
export function actorRuntimeProbeSources(parser: "claude_stream_json" | "plain_text"): readonly RuntimeProbeSource[] {
  return Object.freeze(parser === "claude_stream_json"
    ? ["stdout", "stderr", "structured_output", "tool_progress", "api_progress", "process_lifecycle", "archive", "result_artifact"]
    : ["stdout", "stderr", "process_lifecycle", "archive", "result_artifact"]);
}
export const RUNTIME_INVOCATION_DISPOSITION_VALUES = Object.freeze([
  "continue_waiting", "controlled_terminate", "retry", "yield_continuation",
  "block", "inspect_archive", "escalate", "reprice_policy",
] as const);
export type RuntimeInvocationDispositionKind = typeof RUNTIME_INVOCATION_DISPOSITION_VALUES[number];
export interface RuntimeInvocationScope {
  readonly basisRef: string;
  readonly programRef: string;
  readonly runId: string;
  readonly graphFunctionRef: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly cCallRef: string | null;
  readonly programLocusRef: string | null;
  readonly taskOrdinal: number | null;
  readonly vectorIndex: number | null;
  readonly edgeRef: string | null;
  readonly attempt: number;
  readonly actorInvocationRef: string | null;
  readonly actorRef: string | null;
  readonly workerBindingRef: string | null;
  readonly backendRef: string | null;
}
export interface RuntimeWatchdogPolicy {
  readonly kind: "runtime_watchdog_policy";
  readonly schemaVersion: "5.0.0";
  readonly policyRef: string;
  readonly policyDigest: Sha256Digest;
  readonly startupMs: number;
  readonly inactivityMs: number;
  readonly hardCapMs: number;
  readonly terminationGraceMs: number;
}
export interface RuntimeLivenessBinding {
  readonly kind: "runtime_liveness_binding";
  readonly schemaVersion: "5.0.0";
  readonly clockOriginRef: string;
  readonly clockKind: "native_monotonic_elapsed";
  /** Native non-actor occurrences have no implicit numeric watchdog policy. */
  readonly policy: RuntimeWatchdogPolicy | null;
  readonly sources: readonly RuntimeProbeSource[];
}
export interface RuntimeSystemProbeContract {
  readonly kind: "runtime_system_probe_contract";
  readonly schemaVersion: "5.0.0";
  readonly probeRef: string;
  readonly probeDigest: Sha256Digest;
  readonly scope: RuntimeInvocationScope;
  readonly clockOriginRef: string;
  readonly source: RuntimeProbeSource;
  readonly sourceRef: string;
  readonly declarationEventRef: string;
  readonly required: boolean;
}
export interface RuntimeProbeObservation {
  readonly kind: "runtime_probe_observation";
  readonly schemaVersion: "5.0.0";
  readonly probeRef: string;
  readonly scopeDigest: Sha256Digest;
  readonly clockOriginRef: string;
  readonly elapsedMs: number;
  readonly underlyingObservationRef: string;
  readonly underlyingEventRef: string | null;
  readonly sourceDigest: Sha256Digest;
  readonly sourceRevisionDigest: Sha256Digest | null;
  readonly evidenceRefs: readonly string[];
  readonly coverage: "observed" | "unavailable";
  readonly signal: "coverage" | "activity" | "artifact_pending" | "artifact_admitted" | "artifact_rejected" | "external_interruption";
}
export interface RuntimeThresholdObservation {
  readonly kind: "runtime_threshold_observation";
  readonly schemaVersion: "5.0.0";
  readonly clockOriginRef: string;
  readonly elapsedMs: number;
  readonly policyRef: string;
  readonly scopeDigest: Sha256Digest;
  readonly evaluatedPrefixDigest: Sha256Digest;
  readonly projectionDigest: Sha256Digest;
}
export interface RuntimeInvocationDisposition {
  readonly kind: "runtime_invocation_disposition";
  readonly schemaVersion: "5.0.0";
  readonly disposition: RuntimeInvocationDispositionKind;
  readonly reason: string;
}
export interface RuntimeLivenessObserverProjection {
  readonly kind: "runtime_liveness_observer_projection";
  readonly schemaVersion: "5.0.0";
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly scope: RuntimeInvocationScope;
  readonly policyRef: string | null;
  readonly prefixDigest: Sha256Digest;
  readonly retryBudget: Readonly<{ remaining: number | null; retryEligible: boolean; continuationRef: string | null; terminalPolicy: "block" | "escalate" | "reprice_policy"; resultRejectionRef: string | null }>;
  readonly asOf: Readonly<{ clockOriginRef: string; elapsedMs: number; eventRef: string | null }>;
  readonly coverage: readonly Readonly<{ probeRef: string; source: RuntimeProbeSource; state: "observed" | "unknown" }>[];
  readonly activeSystems: readonly string[];
  readonly inactiveSystems: readonly string[];
  readonly interruptedSystems: readonly string[];
  readonly lastArtifactObservationRef: string | null;
  readonly evidenceRefs: readonly string[];
  readonly lastActivityElapsedMs: number | null;
  readonly leaseDeadlineElapsedMs: number | null;
  readonly hardDeadlineElapsedMs: number | null;
  readonly leaseExpired: boolean;
  readonly hardCapReached: boolean;
  readonly externallyInterrupted: boolean;
  readonly artifactState: "absent" | "pending" | "admitted" | "rejected";
  readonly disposition: RuntimeInvocationDisposition;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function exact(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  if (!record(value) || Reflect.ownKeys(value).length !== keys.length) return false;
  return keys.every(key => {
    const d = Object.getOwnPropertyDescriptor(value, key);
    return d !== undefined && "value" in d && d.enumerable === true;
  });
}
function ref(value: unknown): value is string { return typeof value === "string" && value.length > 0; }
function elapsed(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value) && value >= 0; }
export function runtimeLivenessDigest(value: unknown): Sha256Digest {
  return sha256Canonical(value as JsonValue);
}
export function constructRuntimeWatchdogPolicy(input: Readonly<{
  startupMs: number; inactivityMs: number; hardCapMs: number; terminationGraceMs: number;
}>): RuntimeWatchdogPolicy {
  if (!exact(input, ["startupMs", "inactivityMs", "hardCapMs", "terminationGraceMs"]) ||
      Object.values(input).some(n => !Number.isSafeInteger(n) || n <= 0)) throw new TypeError("invalid bound runtime watchdog budgets");
  const body = { kind: "runtime_watchdog_policy" as const, schemaVersion: "5.0.0" as const, ...input };
  const policyDigest = runtimeLivenessDigest(body);
  return deepFreeze({ ...body, policyDigest, policyRef: `runtime-watchdog-policy://abiogenesis/${policyDigest.slice(7)}` });
}
export function isRuntimeWatchdogPolicy(value: unknown): value is RuntimeWatchdogPolicy {
  if (!exact(value, ["kind", "schemaVersion", "startupMs", "inactivityMs", "hardCapMs", "terminationGraceMs", "policyRef", "policyDigest"])) return false;
  try {
    return runtimeLivenessDigest(value) === runtimeLivenessDigest(constructRuntimeWatchdogPolicy({
      startupMs: value.startupMs as number, inactivityMs: value.inactivityMs as number,
      hardCapMs: value.hardCapMs as number, terminationGraceMs: value.terminationGraceMs as number,
    }));
  } catch { return false; }
}
export function isRuntimeInvocationScope(value: unknown): value is RuntimeInvocationScope {
  const required = ["basisRef", "programRef", "runId", "graphFunctionRef", "graphCallId", "frameId"];
  const nullable = ["cCallRef", "programLocusRef", "edgeRef", "actorInvocationRef", "actorRef", "workerBindingRef", "backendRef"];
  if (!exact(value, [...required, ...nullable, "taskOrdinal", "vectorIndex", "attempt"])) return false;
  return required.every(key => ref(value[key])) && nullable.every(key => value[key] === null || ref(value[key])) &&
    ["taskOrdinal", "vectorIndex"].every(key => value[key] === null || Number.isSafeInteger(value[key]) && Number(value[key]) >= 0) &&
    Number.isSafeInteger(value.attempt) && Number(value.attempt) >= 0;
}
export function isRuntimeLivenessBinding(value: unknown): value is RuntimeLivenessBinding {
  return exact(value, ["kind", "schemaVersion", "clockOriginRef", "clockKind", "policy", "sources"]) &&
    value.kind === "runtime_liveness_binding" && value.schemaVersion === "5.0.0" &&
    value.clockKind === "native_monotonic_elapsed" && ref(value.clockOriginRef) &&
    (value.policy === null || isRuntimeWatchdogPolicy(value.policy)) && Array.isArray(value.sources) && value.sources.length > 0 &&
    new Set(value.sources).size === value.sources.length &&
    value.sources.every(source => RUNTIME_PROBE_SOURCE_VALUES.includes(source));
}
export function constructRuntimeSystemProbeContract(input: Omit<RuntimeSystemProbeContract, "kind" | "schemaVersion" | "probeRef" | "probeDigest">): RuntimeSystemProbeContract {
  if (!isRuntimeInvocationScope(input.scope) || !ref(input.clockOriginRef) ||
      !RUNTIME_PROBE_SOURCE_VALUES.includes(input.source) || !ref(input.sourceRef) ||
      !ref(input.declarationEventRef) || typeof input.required !== "boolean") throw new TypeError("invalid runtime probe declaration");
  const body = { kind: "runtime_system_probe_contract" as const, schemaVersion: "5.0.0" as const, ...input };
  const probeDigest = runtimeLivenessDigest(body);
  return deepFreeze({ ...body, probeDigest, probeRef: `runtime-probe://abiogenesis/${probeDigest.slice(7)}` });
}
export function isRuntimeSystemProbeContract(value: unknown): value is RuntimeSystemProbeContract {
  if (!exact(value, ["kind", "schemaVersion", "probeRef", "probeDigest", "scope", "clockOriginRef", "source", "sourceRef", "declarationEventRef", "required"])) return false;
  try {
    const { kind: _kind, schemaVersion: _version, probeRef: _ref, probeDigest: _digest, ...input } = value;
    return runtimeLivenessDigest(value) === runtimeLivenessDigest(constructRuntimeSystemProbeContract(input as never));
  } catch { return false; }
}
export function isRuntimeProbeObservation(value: unknown): value is RuntimeProbeObservation {
  return exact(value, ["kind", "schemaVersion", "probeRef", "scopeDigest", "clockOriginRef", "elapsedMs",
    "underlyingObservationRef", "underlyingEventRef", "sourceDigest", "sourceRevisionDigest", "evidenceRefs", "coverage", "signal"]) &&
    value.kind === "runtime_probe_observation" && value.schemaVersion === "5.0.0" && ref(value.probeRef) &&
    isSha256Digest(value.scopeDigest) && ref(value.clockOriginRef) && elapsed(value.elapsedMs) &&
    ref(value.underlyingObservationRef) && (value.underlyingEventRef === null || ref(value.underlyingEventRef)) &&
    isSha256Digest(value.sourceDigest) && (value.sourceRevisionDigest === null || isSha256Digest(value.sourceRevisionDigest)) &&
    Array.isArray(value.evidenceRefs) && value.evidenceRefs.every(ref) &&
    new Set(value.evidenceRefs).size === value.evidenceRefs.length &&
    ["observed", "unavailable"].includes(String(value.coverage)) &&
    ["coverage", "activity", "artifact_pending", "artifact_admitted", "artifact_rejected", "external_interruption"].includes(String(value.signal));
}
export function isRuntimeThresholdObservation(value: unknown): value is RuntimeThresholdObservation {
  return exact(value, ["kind", "schemaVersion", "clockOriginRef", "elapsedMs", "policyRef", "scopeDigest", "evaluatedPrefixDigest", "projectionDigest"]) &&
    value.kind === "runtime_threshold_observation" && value.schemaVersion === "5.0.0" &&
    ref(value.clockOriginRef) && elapsed(value.elapsedMs) && ref(value.policyRef) &&
    isSha256Digest(value.scopeDigest) && isSha256Digest(value.evaluatedPrefixDigest) && isSha256Digest(value.projectionDigest);
}

/** Closed read carrier; its values are produced by the native prefix relation. */
export function isRuntimeLivenessObserverProjection(value: unknown): value is RuntimeLivenessObserverProjection {
  if (!exact(value, ["kind", "schemaVersion", "projectionRef", "projectionDigest", "scope", "policyRef", "prefixDigest", "retryBudget", "asOf", "coverage", "activeSystems", "inactiveSystems", "interruptedSystems", "lastArtifactObservationRef", "evidenceRefs", "lastActivityElapsedMs", "leaseDeadlineElapsedMs", "hardDeadlineElapsedMs", "leaseExpired", "hardCapReached", "externallyInterrupted", "artifactState", "disposition"]) ||
      value.kind !== "runtime_liveness_observer_projection" || value.schemaVersion !== "5.0.0" ||
      !isRuntimeInvocationScope(value.scope) || !(value.policyRef === null || ref(value.policyRef)) || !isSha256Digest(value.prefixDigest) ||
      !exact(value.retryBudget, ["remaining", "retryEligible", "continuationRef", "terminalPolicy", "resultRejectionRef"]) ||
      !(value.retryBudget.remaining === null || Number.isSafeInteger(value.retryBudget.remaining) && Number(value.retryBudget.remaining) >= 0) ||
      typeof value.retryBudget.retryEligible !== "boolean" || !(value.retryBudget.continuationRef === null || ref(value.retryBudget.continuationRef)) ||
      !(value.retryBudget.resultRejectionRef === null || ref(value.retryBudget.resultRejectionRef)) ||
      !["block", "escalate", "reprice_policy"].includes(String(value.retryBudget.terminalPolicy)) ||
      !exact(value.asOf, ["clockOriginRef", "elapsedMs", "eventRef"]) || !ref(value.asOf.clockOriginRef) ||
      !elapsed(value.asOf.elapsedMs) || !(value.asOf.eventRef === null || ref(value.asOf.eventRef)) ||
      !Array.isArray(value.coverage) || value.coverage.some(row => !exact(row, ["probeRef", "source", "state"]) ||
        !ref(row.probeRef) || !RUNTIME_PROBE_SOURCE_VALUES.includes(row.source as RuntimeProbeSource) || !["observed", "unknown"].includes(String(row.state))) ||
      new Set(value.coverage.map(row => (row as { probeRef: string }).probeRef)).size !== value.coverage.length ||
      [value.activeSystems, value.inactiveSystems, value.interruptedSystems].some(rows => !Array.isArray(rows) || !rows.every(ref) || new Set(rows).size !== rows.length) ||
      !(value.lastArtifactObservationRef === null || ref(value.lastArtifactObservationRef)) ||
      !Array.isArray(value.evidenceRefs) || !value.evidenceRefs.every(ref) || new Set(value.evidenceRefs).size !== value.evidenceRefs.length ||
      !(value.lastActivityElapsedMs === null || elapsed(value.lastActivityElapsedMs)) ||
      !(value.leaseDeadlineElapsedMs === null || elapsed(value.leaseDeadlineElapsedMs)) ||
      !(value.hardDeadlineElapsedMs === null || elapsed(value.hardDeadlineElapsedMs)) ||
      [value.leaseExpired, value.hardCapReached, value.externallyInterrupted].some(flag => typeof flag !== "boolean") ||
      !["absent", "pending", "admitted", "rejected"].includes(String(value.artifactState)) ||
      !exact(value.disposition, ["kind", "schemaVersion", "disposition", "reason"]) ||
      value.disposition.kind !== "runtime_invocation_disposition" || value.disposition.schemaVersion !== "5.0.0" ||
      !RUNTIME_INVOCATION_DISPOSITION_VALUES.includes(value.disposition.disposition as RuntimeInvocationDispositionKind) ||
      !ref(value.disposition.reason)) return false;
  const { projectionRef, projectionDigest, ...body } = value;
  return projectionDigest === runtimeLivenessDigest(body) && projectionRef === `runtime-liveness://abiogenesis/${String(projectionDigest).slice(7)}`;
}
export interface RuntimeLivenessReadProjection {
  readonly kind: "native_liveness_read_projection";
  readonly schemaVersion: "5.0.0";
  readonly profileSchedule: Readonly<{
    kind: "root_event_profile_schedule"; schemaVersion: "5.0.0";
    spans: readonly Readonly<{ eventContractDigest: Sha256Digest; firstOrdinal: number; lastOrdinal: number }>[];
    boundaryEventRef: string | null; currentEventContractDigest: Sha256Digest;
  }>;
  readonly invocations: readonly RuntimeLivenessObserverProjection[];
}
export function isRuntimeLivenessReadProjection(value: unknown): value is RuntimeLivenessReadProjection {
  if (!exact(value, ["kind", "schemaVersion", "profileSchedule", "invocations"]) ||
      value.kind !== "native_liveness_read_projection" || value.schemaVersion !== "5.0.0" ||
      !exact(value.profileSchedule, ["kind", "schemaVersion", "spans", "boundaryEventRef", "currentEventContractDigest"])) return false;
  const s = value.profileSchedule;
  if (s.kind !== "root_event_profile_schedule" || s.schemaVersion !== "5.0.0" ||
      !isSha256Digest(s.currentEventContractDigest) || !(s.boundaryEventRef === null || ref(s.boundaryEventRef)) ||
      !Array.isArray(s.spans) || s.spans.length > 2 || s.spans.some((span, index) => !exact(span, ["eventContractDigest", "firstOrdinal", "lastOrdinal"]) ||
        !isSha256Digest(span.eventContractDigest) || !Number.isSafeInteger(span.firstOrdinal) || !Number.isSafeInteger(span.lastOrdinal) ||
        Number(span.firstOrdinal) < 1 || Number(span.lastOrdinal) < Number(span.firstOrdinal) ||
        (index === 0 ? span.firstOrdinal !== 1 : span.firstOrdinal !== Number((s.spans as Array<{ lastOrdinal: number }>)[index - 1]!.lastOrdinal) + 1))) return false;
  return Array.isArray(value.invocations) && value.invocations.every(isRuntimeLivenessObserverProjection) &&
    new Set(value.invocations.map(row => runtimeLivenessDigest(row.scope))).size === value.invocations.length;
}

// Structural projection participates in the installed Definition digest. The
// native constructor and guard above retain the dependent identity relations.
const readRef = v.pipe(v.string(), v.minLength(1));
const readDigest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/));
const readElapsed = v.pipe(v.number(), v.finite(), v.minValue(0));
const readOrdinal = v.pipe(v.number(), v.integer(), v.minValue(0));
export const RUNTIME_INVOCATION_SCOPE_SCHEMA = v.strictObject({
  basisRef: readRef, programRef: readRef, runId: readRef, graphFunctionRef: readRef, graphCallId: readRef, frameId: readRef,
  cCallRef: v.nullable(readRef), programLocusRef: v.nullable(readRef), taskOrdinal: v.nullable(readOrdinal),
  vectorIndex: v.nullable(readOrdinal), edgeRef: v.nullable(readRef), attempt: readOrdinal,
  actorInvocationRef: v.nullable(readRef), actorRef: v.nullable(readRef), workerBindingRef: v.nullable(readRef), backendRef: v.nullable(readRef),
});
export const RUNTIME_LIVENESS_OBSERVER_PROJECTION_SCHEMA = v.strictObject({
  kind: v.literal("runtime_liveness_observer_projection"), schemaVersion: v.literal("5.0.0"),
  projectionRef: readRef, projectionDigest: readDigest, scope: RUNTIME_INVOCATION_SCOPE_SCHEMA,
  policyRef: v.nullable(readRef), prefixDigest: readDigest,
  retryBudget: v.strictObject({ remaining: v.nullable(readOrdinal), retryEligible: v.boolean(), continuationRef: v.nullable(readRef), terminalPolicy: v.picklist(["block", "escalate", "reprice_policy"]), resultRejectionRef: v.nullable(readRef) }),
  asOf: v.strictObject({ clockOriginRef: readRef, elapsedMs: readElapsed, eventRef: v.nullable(readRef) }),
  coverage: v.array(v.strictObject({ probeRef: readRef, source: v.picklist(RUNTIME_PROBE_SOURCE_VALUES), state: v.picklist(["observed", "unknown"]) })),
  activeSystems: v.array(readRef), inactiveSystems: v.array(readRef), interruptedSystems: v.array(readRef), lastArtifactObservationRef: v.nullable(readRef),
  evidenceRefs: v.array(readRef), lastActivityElapsedMs: v.nullable(readElapsed), leaseDeadlineElapsedMs: v.nullable(readElapsed),
  hardDeadlineElapsedMs: v.nullable(readElapsed), leaseExpired: v.boolean(), hardCapReached: v.boolean(), externallyInterrupted: v.boolean(),
  artifactState: v.picklist(["absent", "pending", "admitted", "rejected"]),
  disposition: v.strictObject({ kind: v.literal("runtime_invocation_disposition"), schemaVersion: v.literal("5.0.0"),
    disposition: v.picklist(RUNTIME_INVOCATION_DISPOSITION_VALUES), reason: readRef }),
});
export const RUNTIME_LIVENESS_READ_PROJECTION_SCHEMA = v.strictObject({
  kind: v.literal("native_liveness_read_projection"), schemaVersion: v.literal("5.0.0"),
  profileSchedule: v.strictObject({ kind: v.literal("root_event_profile_schedule"), schemaVersion: v.literal("5.0.0"),
    spans: v.array(v.strictObject({ eventContractDigest: readDigest, firstOrdinal: readOrdinal, lastOrdinal: readOrdinal })),
    boundaryEventRef: v.nullable(readRef), currentEventContractDigest: readDigest }),
  invocations: v.array(RUNTIME_LIVENESS_OBSERVER_PROJECTION_SCHEMA),
});
