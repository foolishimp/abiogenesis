// Implements: REQ-R-ABG3-RETRY
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-PAYLOAD
// Implements: REQ-R-ABG3-ASSURANCE

import type {
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "./carriers.js";
import { RUNTIME_EVENT_KIND_VALUES } from "./carriers.js";
import {
  assertProjectionBasis,
  assertVectorIndexInRange,
  freezeStringArray,
  vectorEdge
} from "./runtime_support.js";

export const RETRY_FRONTIER_REASON_CLASS_VALUES = Object.freeze([
  "retry_planned",
  "progress_signal",
  "blocking_reason",
  "fulfillment_status",
  "runtime_failure",
  "payload_rejected",
  "ambiguity_observed",
  "actor_blocked",
  "retry_stopped",
  "retry_escalated",
  "continuation_repaired"
] as const);

export type RetryFrontierReasonClass =
  (typeof RETRY_FRONTIER_REASON_CLASS_VALUES)[number];

export type RetryFrontierOwnerSurface =
  | "abg_retry"
  | "abg_payload"
  | "abg_actor"
  | "abg_continuation";

const RETRY_FRONTIER_OWNER_SURFACE_VALUES = Object.freeze([
  "abg_retry",
  "abg_payload",
  "abg_actor",
  "abg_continuation"
] as const satisfies readonly RetryFrontierOwnerSurface[]);

export interface RetryFrontierRow {
  readonly kind: "retry_frontier_row";
  readonly rowId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly attemptIndex: number | null;
  readonly retryRunId: string | null;
  readonly manifestId: string | null;
  readonly priorManifestId: string | null;
  readonly reasonClass: RetryFrontierReasonClass;
  readonly ownerSurface: RetryFrontierOwnerSurface;
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
  readonly sourceEventKind: RuntimeEvent["kind"];
  readonly clearedByClosure: boolean;
}

export interface RetryFrontierProjection {
  readonly kind: "retry_frontier_projection";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly frontierRef: string;
  readonly isFullFrontier: true;
  readonly rows: readonly RetryFrontierRow[];
  readonly reasonClasses: readonly RetryFrontierReasonClass[];
  readonly attemptCount: number;
  readonly latestAttemptIndex: number | null;
}

export type RetryContextFreshnessStatus =
  | "fresh"
  | "stale_supplied_projection"
  | "invalid_supplied_projection";

export interface FreshRetryContextProjection {
  readonly kind: "fresh_retry_context_projection";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly status: RetryContextFreshnessStatus;
  readonly reason: string | null;
  readonly replayFrontierRef: string;
  readonly suppliedFrontierRef: string | null;
  readonly frontier: RetryFrontierProjection;
  readonly selectedRows: readonly RetryFrontierRow[];
  readonly selectedEvidenceRefs: readonly string[];
}

function rowId(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly ordinal: number;
  readonly reasonClass: RetryFrontierReasonClass;
  readonly detail: string;
}): string {
  return `retry-frontier-row:${JSON.stringify({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    ordinal: input.ordinal,
    reasonClass: input.reasonClass,
    detail: input.detail
  })}`;
}

function reasonClassForProgressRef(ref: string): RetryFrontierReasonClass {
  if (ref.startsWith("runtime_failure:")) {
    return "runtime_failure";
  }
  if (ref.startsWith("blocking_reason:")) {
    return "blocking_reason";
  }
  if (ref.startsWith("fulfillment_status:")) {
    return "fulfillment_status";
  }
  return "progress_signal";
}

function attemptIndexForRetryRun(
  projection: RuntimeAggregateProjection,
  retryRunId: string
): number | null {
  const attempt = projection.retryAttemptRefs.find(
    (entry) => entry.retryRunId === retryRunId
  );
  return attempt?.attemptIndex ?? null;
}

function manifestIdForRetryRun(
  projection: RuntimeAggregateProjection,
  retryRunId: string
): string | null {
  const attempt = projection.retryAttemptRefs.find(
    (entry) => entry.retryRunId === retryRunId
  );
  return attempt?.manifestId ?? null;
}

function priorManifestIdForRetryRun(
  projection: RuntimeAggregateProjection,
  retryRunId: string
): string | null {
  const attempt = projection.retryAttemptRefs.find(
    (entry) => entry.retryRunId === retryRunId
  );
  return attempt?.priorManifestId ?? null;
}

function observedRetryAttemptCoverageIndex(
  observedAttemptCount: number
): number | null {
  return observedAttemptCount > 0 ? observedAttemptCount : null;
}

function makeRow(input: {
  readonly basis: ExecutionBasis;
  readonly ordinal: number;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly attemptIndex: number | null;
  readonly retryRunId: string | null;
  readonly manifestId: string | null;
  readonly priorManifestId: string | null;
  readonly reasonClass: RetryFrontierReasonClass;
  readonly ownerSurface: RetryFrontierOwnerSurface;
  readonly detail: string;
  readonly evidenceRefs?: readonly string[];
  readonly sourceEventKind: RuntimeEvent["kind"];
  readonly clearedByClosure: boolean;
}): RetryFrontierRow {
  return Object.freeze({
    kind: "retry_frontier_row",
    rowId: rowId({
      basis: input.basis,
      vectorIndex: input.vectorIndex,
      ordinal: input.ordinal,
      reasonClass: input.reasonClass,
      detail: input.detail
    }),
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    attemptIndex: input.attemptIndex,
    retryRunId: input.retryRunId,
    manifestId: input.manifestId,
    priorManifestId: input.priorManifestId,
    reasonClass: input.reasonClass,
    ownerSurface: input.ownerSurface,
    detail: input.detail,
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    sourceEventKind: input.sourceEventKind,
    clearedByClosure: input.clearedByClosure
  });
}

function frontierRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly rows: readonly RetryFrontierRow[];
}): string {
  return `retry-frontier:${JSON.stringify({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    rows: input.rows.map((row) => row.rowId)
  })}`;
}

function frontierRefForProjection(input: RetryFrontierProjection): string {
  return `retry-frontier:${JSON.stringify({
    basisId: input.basisId,
    vectorIndex: input.vectorIndex,
    rows: input.rows.map((row) => row.rowId)
  })}`;
}

function sortedReasonClasses(
  rows: readonly RetryFrontierRow[]
): readonly RetryFrontierReasonClass[] {
  const seen = new Set<RetryFrontierReasonClass>();
  for (const row of rows) {
    seen.add(row.reasonClass);
  }
  return Object.freeze(
    [...seen].sort((left, right) => left.localeCompare(right))
  );
}

function uniqueStringArray(input: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(input)]);
}

function isRetryFrontierReasonClass(
  input: string
): input is RetryFrontierReasonClass {
  return RETRY_FRONTIER_REASON_CLASS_VALUES.some((value) => value === input);
}

function isRetryFrontierOwnerSurface(
  input: string
): input is RetryFrontierOwnerSurface {
  return RETRY_FRONTIER_OWNER_SURFACE_VALUES.some((value) => value === input);
}

function isRuntimeEventKind(input: string): input is RuntimeEvent["kind"] {
  return RUNTIME_EVENT_KIND_VALUES.some((value) => value === input);
}

function assertNonEmptyString(input: unknown, label: string): string {
  if (typeof input !== "string" || input.length === 0) {
    throw new TypeError(`${label}: expected non-empty string`);
  }
  return input;
}

function assertNullableString(input: unknown, label: string): string | null {
  if (input === null) {
    return null;
  }
  return assertNonEmptyString(input, label);
}

function assertNullableNonNegativeInteger(
  input: unknown,
  label: string
): number | null {
  if (input === null) {
    return null;
  }
  if (typeof input !== "number" || !Number.isInteger(input) || input < 0) {
    throw new TypeError(`${label}: expected non-negative integer or null`);
  }
  return input;
}

function assertStringArray(input: unknown, label: string): readonly string[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label}: expected string list`);
  }
  return Object.freeze(
    input.map((entry, index) => assertNonEmptyString(entry, `${label}[${index}]`))
  );
}

function parseJsonObject(input: string, label: string): Readonly<Record<string, unknown>> {
  const parsed: unknown = JSON.parse(input);
  if (
    parsed === null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new TypeError(`${label}: expected object`);
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed)) {
    out[key] = value;
  }
  return Object.freeze(out);
}

function parseRowId(input: string, label: string): {
  readonly basisId: string;
  readonly vectorIndex: number;
  readonly ordinal: number;
  readonly reasonClass: RetryFrontierReasonClass;
  readonly detail: string;
} {
  const prefix = "retry-frontier-row:";
  if (!input.startsWith(prefix)) {
    throw new TypeError(`${label}: expected retry frontier row id`);
  }
  const parsed = parseJsonObject(input.slice(prefix.length), label);
  const basisId = assertNonEmptyString(parsed["basisId"], `${label}.basisId`);
  const vectorIndex = assertNullableNonNegativeInteger(
    parsed["vectorIndex"],
    `${label}.vectorIndex`
  );
  if (vectorIndex === null) {
    throw new TypeError(`${label}.vectorIndex: expected non-negative integer`);
  }
  const ordinal = assertNullableNonNegativeInteger(
    parsed["ordinal"],
    `${label}.ordinal`
  );
  if (ordinal === null) {
    throw new TypeError(`${label}.ordinal: expected non-negative integer`);
  }
  const reasonClass = assertNonEmptyString(
    parsed["reasonClass"],
    `${label}.reasonClass`
  );
  if (!isRetryFrontierReasonClass(reasonClass)) {
    throw new TypeError(`${label}.reasonClass: unknown retry reason class`);
  }
  return Object.freeze({
    basisId,
    vectorIndex,
    ordinal,
    reasonClass,
    detail: assertNonEmptyString(parsed["detail"], `${label}.detail`)
  });
}

function assertRetryFrontierRow(input: {
  readonly projection: RetryFrontierProjection;
  readonly row: RetryFrontierRow;
  readonly index: number;
}): void {
  if (input.row.kind !== "retry_frontier_row") {
    throw new TypeError(`retry frontier row ${input.index}: invalid kind`);
  }
  if (input.row.vectorIndex !== input.projection.vectorIndex) {
    throw new TypeError(`retry frontier row ${input.index}: vector mismatch`);
  }
  if (input.row.edge !== input.projection.edge) {
    throw new TypeError(`retry frontier row ${input.index}: edge mismatch`);
  }
  if (!isRetryFrontierReasonClass(input.row.reasonClass)) {
    throw new TypeError(`retry frontier row ${input.index}: invalid reason class`);
  }
  if (!isRetryFrontierOwnerSurface(input.row.ownerSurface)) {
    throw new TypeError(`retry frontier row ${input.index}: invalid owner surface`);
  }
  if (!isRuntimeEventKind(input.row.sourceEventKind)) {
    throw new TypeError(`retry frontier row ${input.index}: invalid event kind`);
  }
  assertNullableNonNegativeInteger(
    input.row.attemptIndex,
    `retry frontier row ${input.index}.attemptIndex`
  );
  assertNullableString(
    input.row.retryRunId,
    `retry frontier row ${input.index}.retryRunId`
  );
  assertNullableString(
    input.row.manifestId,
    `retry frontier row ${input.index}.manifestId`
  );
  assertNullableString(
    input.row.priorManifestId,
    `retry frontier row ${input.index}.priorManifestId`
  );
  assertNonEmptyString(input.row.detail, `retry frontier row ${input.index}.detail`);
  assertStringArray(
    input.row.evidenceRefs,
    `retry frontier row ${input.index}.evidenceRefs`
  );
  if (typeof input.row.clearedByClosure !== "boolean") {
    throw new TypeError(`retry frontier row ${input.index}: invalid cleared flag`);
  }
  const parsedRowId = parseRowId(
    input.row.rowId,
    `retry frontier row ${input.index}.rowId`
  );
  if (
    parsedRowId.basisId !== input.projection.basisId ||
    parsedRowId.vectorIndex !== input.projection.vectorIndex ||
    parsedRowId.ordinal !== input.index ||
    parsedRowId.reasonClass !== input.row.reasonClass ||
    parsedRowId.detail !== input.row.detail
  ) {
    throw new TypeError(`retry frontier row ${input.index}: row id mismatch`);
  }
}

export function deriveRetryFrontierProjection(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly events: readonly RuntimeEvent[];
  readonly vectorIndex: number;
}): RetryFrontierProjection {
  assertProjectionBasis(
    input.basis,
    input.runtimeProjection,
    "RetryFrontierProjection"
  );
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const edge = vectorEdge(input.basis, input.vectorIndex);
  const closed = input.runtimeProjection.closedVectorIndexes.includes(
    input.vectorIndex
  );
  const rows: RetryFrontierRow[] = [];

  for (const event of input.events) {
    switch (event.kind) {
      case "retry_repair_planned":
        if (event.vectorIndex === input.vectorIndex) {
          rows.push(
            makeRow({
              basis: input.basis,
              ordinal: rows.length,
              vectorIndex: input.vectorIndex,
              edge,
              attemptIndex: event.attemptIndex,
              retryRunId: event.retryRunId,
              manifestId: event.manifestId,
              priorManifestId: event.priorManifestId,
              reasonClass: "retry_planned",
              ownerSurface: "abg_retry",
              detail: `retry planned with maxAttempts=${event.maxAttempts}`,
              evidenceRefs: [
                event.sourceProjectionRef,
                event.priorManifestId,
                event.manifestId
              ],
              sourceEventKind: event.kind,
              clearedByClosure: closed
            })
          );
        }
        break;
      case "retry_progress_recorded":
        if (event.vectorIndex === input.vectorIndex) {
          for (const signalRef of event.progressSignalRefs) {
            rows.push(
              makeRow({
                basis: input.basis,
                ordinal: rows.length,
                vectorIndex: input.vectorIndex,
                edge,
                attemptIndex: attemptIndexForRetryRun(
                  input.runtimeProjection,
                  event.retryRunId
                ),
                retryRunId: event.retryRunId,
                manifestId: manifestIdForRetryRun(
                  input.runtimeProjection,
                  event.retryRunId
                ),
                priorManifestId: priorManifestIdForRetryRun(
                  input.runtimeProjection,
                  event.retryRunId
                ),
                reasonClass: reasonClassForProgressRef(signalRef),
                ownerSurface: "abg_retry",
                detail: signalRef,
                evidenceRefs: [signalRef],
                sourceEventKind: event.kind,
                clearedByClosure: closed
              })
            );
          }
        }
        break;
      case "retry_attempt_stopped":
        if (event.vectorIndex === input.vectorIndex) {
          rows.push(
            makeRow({
              basis: input.basis,
              ordinal: rows.length,
              vectorIndex: input.vectorIndex,
              edge,
              attemptIndex: observedRetryAttemptCoverageIndex(
                event.observedAttemptCount
              ),
              retryRunId: null,
              manifestId: null,
              priorManifestId: null,
              reasonClass: "retry_stopped",
              ownerSurface: "abg_retry",
              detail: event.reason,
              sourceEventKind: event.kind,
              clearedByClosure: closed
            })
          );
        }
        break;
      case "retry_attempt_escalated":
        if (event.vectorIndex === input.vectorIndex) {
          rows.push(
            makeRow({
              basis: input.basis,
              ordinal: rows.length,
              vectorIndex: input.vectorIndex,
              edge,
              attemptIndex: observedRetryAttemptCoverageIndex(
                event.observedAttemptCount
              ),
              retryRunId: null,
              manifestId: null,
              priorManifestId: null,
              reasonClass: "retry_escalated",
              ownerSurface: "abg_retry",
              detail: event.gateReason,
              evidenceRefs: [event.approvalSubjectRef],
              sourceEventKind: event.kind,
              clearedByClosure: closed
            })
          );
        }
        break;
      case "continuation_terminated":
      case "continuation_reopened":
        if (event.vectorIndex === input.vectorIndex) {
          rows.push(
            makeRow({
              basis: input.basis,
              ordinal: rows.length,
              vectorIndex: input.vectorIndex,
              edge,
              attemptIndex: attemptIndexForRetryRun(
                input.runtimeProjection,
                event.causedByRetryRunId
              ),
              retryRunId: event.causedByRetryRunId,
              manifestId: manifestIdForRetryRun(
                input.runtimeProjection,
                event.causedByRetryRunId
              ),
              priorManifestId: priorManifestIdForRetryRun(
                input.runtimeProjection,
                event.causedByRetryRunId
              ),
              reasonClass: "continuation_repaired",
              ownerSurface: "abg_continuation",
              detail:
                event.kind === "continuation_terminated"
                  ? event.continuationId
                  : event.continuationId,
              evidenceRefs:
                event.kind === "continuation_terminated"
                  ? [event.continuationId]
                  : [event.closedContinuationId, event.continuationId],
              sourceEventKind: event.kind,
              clearedByClosure: closed
            })
          );
        }
        break;
      case "actor_invocation_closed":
        if (
          event.vectorIndex === input.vectorIndex &&
          event.closureStatus !== "completed"
        ) {
          rows.push(
            makeRow({
              basis: input.basis,
              ordinal: rows.length,
              vectorIndex: input.vectorIndex,
              edge,
              attemptIndex: null,
              retryRunId: null,
              manifestId: null,
              priorManifestId: null,
              reasonClass: "actor_blocked",
              ownerSurface: "abg_actor",
              detail: event.detail ?? event.closureStatus,
              evidenceRefs:
                event.resultRef === null
                  ? [event.actorInvocationId]
                  : [event.actorInvocationId, event.resultRef],
              sourceEventKind: event.kind,
              clearedByClosure: closed
            })
          );
        }
        break;
      case "payload_rejected":
        if (event.vectorIndex === input.vectorIndex) {
          rows.push(
            makeRow({
              basis: input.basis,
              ordinal: rows.length,
              vectorIndex: input.vectorIndex,
              edge,
              attemptIndex: null,
              retryRunId: null,
              manifestId: null,
              priorManifestId: null,
              reasonClass: "payload_rejected",
              ownerSurface: "abg_payload",
              detail: `${event.rejectionClass}: ${event.reason}`,
              evidenceRefs: [event.payloadRef],
              sourceEventKind: event.kind,
              clearedByClosure: closed
            })
          );
        }
        break;
      case "ambiguity_observation_admitted":
        if (event.vectorIndex === input.vectorIndex) {
          rows.push(
            makeRow({
              basis: input.basis,
              ordinal: rows.length,
              vectorIndex: input.vectorIndex,
              edge,
              attemptIndex: null,
              retryRunId: null,
              manifestId: null,
              priorManifestId: null,
              reasonClass: "ambiguity_observed",
              ownerSurface: "abg_payload",
              detail: `${event.ambiguityStatus}: ${event.reason}`,
              evidenceRefs: [
                event.ambiguityRef,
                ...(event.payloadRef === null ? [] : [event.payloadRef]),
                ...(event.evidenceRef === null ? [] : [event.evidenceRef])
              ],
              sourceEventKind: event.kind,
              clearedByClosure: closed
            })
          );
        }
        break;
      case "basis_admitted":
      case "fd_advance_ready":
      case "fp_dispatch_requested":
      case "actor_invocation_started":
      case "actor_result_artifact_observed":
      case "actor_process_started":
      case "actor_process_start_failed":
      case "actor_process_stream_observed":
      case "actor_process_heartbeat":
      case "actor_process_timeout":
      case "actor_process_signal_sent":
      case "actor_process_exited":
      case "runtime_activity_probe_observed":
      case "runtime_external_interruption_observed":
      case "plugin_traversal_prompt_materialized":
      case "fh_escalated":
      case "terminal_reached":
      case "graph_call_opened":
      case "frame_opened":
      case "vector_traversal_planned":
      case "vector_evaluated":
      case "vector_closed":
      case "retry_attempt_opened":
      case "leaf_task_opened":
      case "leaf_task_completed":
      case "leaf_task_failed":
      case "approved":
      case "revoked":
      case "reset":
      case "assessed":
      case "payload_observed":
      case "payload_validated":
      case "authority_snapshot_admitted":
      case "evidence_admitted":
      case "closure_input_published":
      case "fd_authority_outcome_admitted":
      case "output_instance_allocated":
      case "output_binding_admitted":
      case "output_materialization_observed":
      case "workspace_obligation_ledger_admitted":
      case "workspace_obligation_schedule_derived":
      case "zoom_frame_opened":
      case "scheduled_slice_dispatched":
      case "scheduled_slice_assessed":
      case "zoom_foldback_evaluated":
      case "traversal_modulation_resolved":
      case "traversal_attempt_envelope_derived":
      case "traversal_attempt_dispatched":
      case "traversal_attempt_progress_observed":
      case "traversal_attempt_non_progress_classified":
      case "traversal_forced_review_projected":
      case "traversal_same_edge_continuation_planned":
      case "traversal_modulation_exhausted":
      case "graph_span_evaluation_scheduled":
      case "graph_span_assessed":
      case "graph_span_foldback_evaluated":
      case "graph_reentry_planned":
      case "graph_reentry_applied":
      case "graph_vector_resume_cursor_applied":
      case "timer_intent_admitted":
      case "timer_outcome_admitted":
      case "deadline_breach_admitted":
      case "scheduled_continuation_reopened":
      case "branch_lease_acquired":
      case "branch_lease_released":
      case "branch_lease_superseded":
      case "branch_task_failed":
      case "branch_payload_admitted":
      case "branch_fan_in_projected":
      case "lever_resolution_admitted":
      case "construction_episode_started":
      case "construction_observation_snapshot_materialized":
      case "construction_action_catalog_projected":
      case "construction_evaluator_invoked":
      case "construction_intent_candidate_returned":
      case "construction_intent_candidate_admitted":
      case "construction_intent_candidate_rejected":
      case "construction_intent_selected":
      case "construction_graph_action_invoked":
      case "construction_pressure_package_materialized":
      case "construction_delta_observed":
      case "construction_terminal_disposition_projected":
      case "requirement_route_fact_projected":
      case "executive_pressure_fact_projected":
      case "workspace_installation_admitted":
      case "observed_state_admitted":
      case "overlay_frame_declared":
      case "overlay_frame_evaluated":
        break;
      default:
        {
          const exhaustive: never = event;
          throw new TypeError(
            `Unsupported retry frontier event ${JSON.stringify(exhaustive)}`
          );
        }
    }
  }

  const frozenRows = Object.freeze([...rows]);
  const attempts = input.runtimeProjection.retryAttemptRefs.filter(
    (attempt) => attempt.vectorIndex === input.vectorIndex
  );
  const latestAttemptIndex =
    attempts.length === 0
      ? null
      : Math.max(...attempts.map((attempt) => attempt.attemptIndex));

  return Object.freeze({
    kind: "retry_frontier_projection",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId: input.runtimeProjection.graphCallId,
    frameId: input.runtimeProjection.frameId,
    vectorIndex: input.vectorIndex,
    edge,
    frontierRef: frontierRef({
      basis: input.basis,
      vectorIndex: input.vectorIndex,
      rows: frozenRows
    }),
    isFullFrontier: true,
    rows: frozenRows,
    reasonClasses: sortedReasonClasses(frozenRows),
    attemptCount: attempts.length,
    latestAttemptIndex
  });
}

function retryFrontierMatchesReplay(input: {
  readonly replay: RetryFrontierProjection;
  readonly supplied: RetryFrontierProjection;
}): boolean {
  return (
    input.replay.basisId === input.supplied.basisId &&
    input.replay.graphFunctionId === input.supplied.graphFunctionId &&
    input.replay.graphCallId === input.supplied.graphCallId &&
    input.replay.frameId === input.supplied.frameId &&
    input.replay.vectorIndex === input.supplied.vectorIndex &&
    input.replay.edge === input.supplied.edge &&
    input.replay.frontierRef === input.supplied.frontierRef
  );
}

function selectedRetryContextRows(
  frontier: RetryFrontierProjection
): readonly RetryFrontierRow[] {
  const unclearedRows = frontier.rows.filter((row) => !row.clearedByClosure);
  return Object.freeze(unclearedRows.length === 0 ? [...frontier.rows] : unclearedRows);
}

export function deriveFreshRetryContextProjection(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly events: readonly RuntimeEvent[];
  readonly vectorIndex: number;
  readonly suppliedProjection?: RetryFrontierProjection | null;
  readonly suppliedFrontierRef?: string | null;
}): FreshRetryContextProjection {
  const replayFrontier = deriveRetryFrontierProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    events: input.events,
    vectorIndex: input.vectorIndex
  });
  assertFullRetryFrontierProjection({ projection: replayFrontier });

  let status: RetryContextFreshnessStatus = "fresh";
  let reason: string | null = null;
  let suppliedFrontierRef: string | null = input.suppliedFrontierRef ?? null;
  const suppliedProjection = input.suppliedProjection ?? null;

  if (suppliedProjection !== null) {
    suppliedFrontierRef = suppliedProjection.frontierRef ?? null;
    try {
      assertFullRetryFrontierProjection({ projection: suppliedProjection });
      if (
        !retryFrontierMatchesReplay({
          replay: replayFrontier,
          supplied: suppliedProjection
        })
      ) {
        status = "stale_supplied_projection";
        reason =
          "supplied retry frontier does not match replay-derived current frontier";
      }
    } catch (error) {
      status = "invalid_supplied_projection";
      reason =
        error instanceof Error
          ? error.message
          : "supplied retry frontier is not a full frontier projection";
    }
  } else if (
    suppliedFrontierRef !== null &&
    suppliedFrontierRef !== replayFrontier.frontierRef
  ) {
    status = "stale_supplied_projection";
    reason =
      "supplied retry frontier ref does not match replay-derived current frontier";
  }

  const selectedRows = selectedRetryContextRows(replayFrontier);
  return Object.freeze({
    kind: "fresh_retry_context_projection",
    basisId: replayFrontier.basisId,
    graphFunctionId: replayFrontier.graphFunctionId,
    graphCallId: replayFrontier.graphCallId,
    frameId: replayFrontier.frameId,
    vectorIndex: replayFrontier.vectorIndex,
    edge: replayFrontier.edge,
    status,
    reason,
    replayFrontierRef: replayFrontier.frontierRef,
    suppliedFrontierRef,
    frontier: replayFrontier,
    selectedRows,
    selectedEvidenceRefs: uniqueStringArray(
      selectedRows.flatMap((row) => row.evidenceRefs)
    )
  });
}

export function assertFullRetryFrontierProjection(input: {
  readonly projection: RetryFrontierProjection;
  readonly requiredReasonClasses?: readonly RetryFrontierReasonClass[];
}): void {
  if (
    input.projection.kind !== "retry_frontier_projection" ||
    input.projection.isFullFrontier !== true
  ) {
    throw new TypeError("Expected full retry frontier projection");
  }
  if (input.projection.frontierRef !== frontierRefForProjection(input.projection)) {
    throw new TypeError("Expected retry frontier ref to match row coverage");
  }
  if (input.projection.edge.length === 0) {
    throw new TypeError("Expected retry frontier edge");
  }
  if (!Number.isInteger(input.projection.vectorIndex) || input.projection.vectorIndex < 0) {
    throw new TypeError("Expected retry frontier vector index");
  }
  if (!Number.isInteger(input.projection.attemptCount) || input.projection.attemptCount < 0) {
    throw new TypeError("Expected retry frontier attempt count");
  }
  if (
    input.projection.latestAttemptIndex !== null &&
    (!Number.isInteger(input.projection.latestAttemptIndex) ||
      input.projection.latestAttemptIndex < 0)
  ) {
    throw new TypeError("Expected retry frontier latest attempt index");
  }
  input.projection.rows.forEach((row, index) =>
    assertRetryFrontierRow({
      projection: input.projection,
      row,
      index
    })
  );
  const rowReasonClasses = sortedReasonClasses(input.projection.rows);
  if (
    JSON.stringify(rowReasonClasses) !==
    JSON.stringify([...input.projection.reasonClasses].sort())
  ) {
    throw new TypeError("Expected retry frontier reason classes to match rows");
  }
  const attemptIndexes = [
    ...new Set(
      input.projection.rows
        .map((row) => row.attemptIndex)
        .filter(
          (attemptIndex): attemptIndex is number =>
            attemptIndex !== null && attemptIndex > 0
        )
    )
  ].sort((left, right) => left - right);
  if (input.projection.attemptCount === 0) {
    if (input.projection.latestAttemptIndex !== null || attemptIndexes.length > 0) {
      throw new TypeError("Expected empty retry frontier attempt coverage");
    }
  } else {
    if (input.projection.latestAttemptIndex !== input.projection.attemptCount) {
      throw new TypeError("Expected retry frontier latest attempt coverage");
    }
    for (let index = 1; index <= input.projection.attemptCount; index += 1) {
      if (!attemptIndexes.includes(index)) {
        throw new TypeError(
          `Expected retry frontier to include attempt ${String(index)}`
        );
      }
    }
  }
  for (const reasonClass of input.requiredReasonClasses ?? Object.freeze([])) {
    if (!input.projection.reasonClasses.includes(reasonClass)) {
      throw new TypeError(
        `Expected full retry frontier projection to include ${reasonClass}`
      );
    }
  }
}
