// Implements: T-141
// Implements: REQ-R-ABG3-SAGA-FRONTIER
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-WORKER

import type {
  BranchExecutionDisposition,
  BranchFanInProjectedEvent,
  BranchLeaseAcquiredEvent,
  BranchLeaseReleasedEvent,
  BranchLeaseSupersededEvent,
  BranchPayloadAdmittedEvent,
  BranchTaskFailedEvent,
  ExecutionBasis,
  RuntimeEvent,
  RuntimeFailureClass
} from "./carriers.js";
import { BRANCH_EXECUTION_DISPOSITION_VALUES } from "./carriers.js";
import type { RuntimeWatchdogPolicy } from "./runtime_liveness.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  assertRuntimeFailureClass,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis
} from "./runtime_support.js";
import { stableSha256HexDigest } from "../../../shared/runtime_identity.js";

export type DependencyFrontierRowState =
  | "blocked_by_parents"
  | "ready"
  | "leased"
  | "failed"
  | "stale_observed_state"
  | "underdeclared_safety"
  | "idempotency_admitted"
  | "closed";

export type BranchSelectionDecision =
  | "selected"
  | "deferred_cap"
  | "deferred_conflict"
  | "not_ready";

export type BranchLeaseState =
  | "active"
  | "released"
  | "expired"
  | "superseded";

export type PublicConstructionProgressState =
  | "blocked_by_parents"
  | "ready"
  | "leased"
  | "dispatched"
  | "awaiting_evidence"
  | "awaiting_human"
  | "retry_pending"
  | "compensated"
  | "closed"
  | "blocked"
  | "escalated";

export type BranchQueueDiscipline = "priority_then_identity";

export type BranchCancellationSignalKind =
  | "abort_signal"
  | "process_signal"
  | "none";

export type BranchPreemptionPolicy =
  | "none"
  | "cooperative_cancel_low_priority";

export type BranchResourceLimitKind =
  | "worker"
  | "transport"
  | "cpu"
  | "memory"
  | "io";

export interface BranchResourceLimit {
  readonly kind: "branch_resource_limit";
  readonly resourceKind: BranchResourceLimitKind;
  readonly resourceRef: string;
  readonly maxConcurrent: number;
  readonly resolvedSystemPolicyRefs: readonly string[];
}

export const DEFAULT_BRANCH_RETRY_FAILURE_CLASSES = Object.freeze([
  "transport_failure",
  "no_output",
  "contract_failure"
] as const satisfies readonly RuntimeFailureClass[]);

const BRANCH_CANCELLATION_SIGNAL_KIND_VALUES = Object.freeze([
  "abort_signal",
  "process_signal",
  "none"
] as const satisfies readonly BranchCancellationSignalKind[]);

const BRANCH_PREEMPTION_POLICY_VALUES = Object.freeze([
  "none",
  "cooperative_cancel_low_priority"
] as const satisfies readonly BranchPreemptionPolicy[]);

const BRANCH_RESOURCE_LIMIT_KIND_VALUES = Object.freeze([
  "worker",
  "transport",
  "cpu",
  "memory",
  "io"
] as const satisfies readonly BranchResourceLimitKind[]);

export interface BranchRef {
  readonly kind: "branch_ref";
  readonly branchRef: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number | null;
  readonly actionRef: string | null;
  readonly branchKey: string;
  readonly fanInScopeRef: string;
  readonly workKey: string | null;
  readonly basisId: string | null;
  readonly graphFunctionId: string | null;
  readonly frameLineageId: string | null;
  readonly frameAttemptId: string | null;
  readonly frontierRef: string | null;
  readonly frontierDigest: string | null;
}

export interface BranchAttemptRef {
  readonly kind: "branch_attempt_ref";
  readonly branchAttemptRef: string;
  readonly branchRef: string;
  readonly attemptOrdinal: number;
  readonly retryAttemptRef: string | null;
  readonly actorInvocationRef: string | null;
}

export interface BranchIdempotencyKey {
  readonly kind: "branch_idempotency_key";
  readonly idempotencyKey: string;
  readonly commandKind: string;
  readonly branchRef: string;
  readonly branchAttemptRef: string | null;
  readonly payloadScopeRef: string | null;
  readonly observedStateSetDigest: string | null;
  readonly outputAllocationSetDigest: string | null;
  readonly writeTerritorySetDigest: string | null;
}

export interface BranchPayloadAdmissionRecord {
  readonly kind: "branch_payload_admission_record";
  readonly admissionRef: string;
  readonly idempotencyKey: string;
  readonly branchRef: string;
  readonly branchAttemptRef: string | null;
  readonly payloadDigest: string;
  readonly sourceEventRef: string | null;
}

export interface BranchPayloadAdmissionDecision {
  readonly kind: "branch_payload_admission_decision";
  readonly decision: "admitted" | "duplicate" | "conflict";
  readonly idempotencyKey: string;
  readonly branchRef: string;
  readonly branchAttemptRef: string | null;
  readonly payloadDigest: string;
  readonly admittedRecord: BranchPayloadAdmissionRecord | null;
  readonly diagnosticRefs: readonly string[];
}

export interface DependencyFrontierDeclaration {
  readonly kind: "dependency_frontier_declaration";
  readonly branchRef: BranchRef;
  readonly parentBranchRefs: readonly string[];
  readonly observedStateRefs: readonly string[];
  readonly readRefs: readonly string[];
  readonly writeTerritoryRefs: readonly string[];
  readonly outputAllocationRefs: readonly string[];
  readonly fanInScopeRef: string;
  readonly idempotencyKey: string | null;
  readonly declaredPriority: number;
  readonly criticalPathCost: number;
}

export interface DependencyFrontierRow {
  readonly kind: "dependency_frontier_row";
  readonly branchRef: BranchRef;
  readonly rowState: DependencyFrontierRowState;
  readonly parentBranchRefs: readonly string[];
  readonly blockingParentRefs: readonly string[];
  readonly observedStateRefs: readonly string[];
  readonly staleObservedStateRefs: readonly string[];
  readonly missingSafetyProofRefs: readonly string[];
  readonly readRefs: readonly string[];
  readonly writeTerritoryRefs: readonly string[];
  readonly outputAllocationRefs: readonly string[];
  readonly fanInScopeRef: string;
  readonly idempotencyKey: string | null;
  readonly declaredPriority: number;
  readonly criticalPathCost: number;
}

export interface DependencyFrontierProjection {
  readonly kind: "dependency_frontier_projection";
  readonly frontierRef: string;
  readonly frontierDigest: string;
  readonly basisRef: string | null;
  readonly rows: readonly DependencyFrontierRow[];
  readonly readyBranchRefs: readonly string[];
  readonly blockedBranchRefs: readonly string[];
  readonly failedBranchRefs: readonly string[];
  readonly leasedBranchRefs: readonly string[];
  readonly closedBranchRefs: readonly string[];
}

export interface BranchExecutionPolicy {
  readonly kind: "branch_execution_policy";
  readonly policyRef: string;
  readonly maxConcurrency: number;
  readonly queueDiscipline: BranchQueueDiscipline;
  readonly retryableFailureClasses: readonly RuntimeFailureClass[];
  readonly maxRetryAttempts: number | null;
  readonly retryBudgetExhaustedDisposition: BranchExecutionDisposition;
  readonly noOutputTimeoutMs: number | null;
  readonly inactivityTimeoutMs: number | null;
  readonly hardSafetyCapMs: number | null;
  readonly humanWaitTimeoutMs: number | null;
  readonly cancellationSignalKind: BranchCancellationSignalKind;
  readonly cancellationGraceMs: number | null;
  readonly preserveEvidenceOnCancellation: boolean;
  readonly leaseTtlMs: number | null;
  readonly leaseRenewalMs: number | null;
  readonly resourceLimits: readonly BranchResourceLimit[];
  readonly workerLimitRefs: readonly string[];
  readonly transportLimitRefs: readonly string[];
  readonly preemptionPolicy: BranchPreemptionPolicy;
  readonly watchdogPolicy: RuntimeWatchdogPolicy | null;
  readonly resolvedSystemPolicyRefs: readonly string[];
}

export interface BranchSelectionRow {
  readonly kind: "branch_selection_row";
  readonly branchRef: string;
  readonly decision: BranchSelectionDecision;
  readonly reason: string;
}

export interface BranchSelectionProjection {
  readonly kind: "branch_selection_projection";
  readonly selectionRef: string;
  readonly frontierRef: string;
  readonly policyRef: string;
  readonly maxConcurrency: number;
  readonly selectedBranchRefs: readonly string[];
  readonly deferredReadyBranchRefs: readonly string[];
  readonly conflictBranchRefs: readonly string[];
  readonly activeWriteTerritoryRefs: readonly string[];
  readonly activeOutputAllocationRefs: readonly string[];
  readonly activeDispatchConflictRefs: readonly string[];
  readonly rows: readonly BranchSelectionRow[];
}

export interface BranchLeaseRecord {
  readonly kind: "branch_lease_record";
  readonly leaseRef: string;
  readonly branchRef: string;
  readonly branchAttemptRef: string;
  readonly leasedWriteTerritoryRefs: readonly string[];
  readonly leasedOutputAllocationRefs: readonly string[];
  readonly leasedDispatchConflictRefs: readonly string[];
  readonly leasedAtMs: number;
  readonly expiresAtMs: number | null;
  readonly releasedAtMs: number | null;
  readonly supersededByLeaseRef: string | null;
}

export interface BranchLeaseProjectionRow {
  readonly kind: "branch_lease_projection_row";
  readonly leaseRef: string;
  readonly branchRef: string;
  readonly branchAttemptRef: string;
  readonly leaseState: BranchLeaseState;
  readonly leasedWriteTerritoryRefs: readonly string[];
  readonly leasedOutputAllocationRefs: readonly string[];
  readonly leasedDispatchConflictRefs: readonly string[];
}

export interface BranchLeaseProjection {
  readonly kind: "branch_lease_projection";
  readonly projectionRef: string;
  readonly nowMs: number;
  readonly rows: readonly BranchLeaseProjectionRow[];
  readonly activeLeaseRefs: readonly string[];
  readonly activeBranchRefs: readonly string[];
  readonly activeWriteTerritoryRefs: readonly string[];
  readonly activeOutputAllocationRefs: readonly string[];
  readonly activeDispatchConflictRefs: readonly string[];
  readonly expiredLeaseRefs: readonly string[];
  readonly releasedLeaseRefs: readonly string[];
  readonly supersededLeaseRefs: readonly string[];
}

export interface WriteTerritoryConflictRow {
  readonly kind: "write_territory_conflict_row";
  readonly conflictKind: "static_declared" | "dynamic_lease";
  readonly branchRefs: readonly string[];
  readonly writeTerritoryRefs: readonly string[];
}

export interface WriteTerritoryConflictProjection {
  readonly kind: "write_territory_conflict_projection";
  readonly projectionRef: string;
  readonly frontierRef: string;
  readonly staticConflicts: readonly WriteTerritoryConflictRow[];
  readonly dynamicConflicts: readonly WriteTerritoryConflictRow[];
  readonly conflictingBranchRefs: readonly string[];
}

export interface PublicConstructionProgressRow {
  readonly kind: "public_construction_progress_row";
  readonly branchRef: string;
  readonly state: PublicConstructionProgressState;
  readonly fanInScopeRef: string;
  readonly parentBranchRefs: readonly string[];
  readonly writeTerritoryRefs: readonly string[];
}

export interface PublicConstructionProgressProjection {
  readonly kind: "public_construction_progress_projection";
  readonly projectionRef: string;
  readonly frontierRef: string;
  readonly rows: readonly PublicConstructionProgressRow[];
  readonly aggregateCounts: Readonly<Record<PublicConstructionProgressState, number>>;
}

export interface BranchFanInInputRow {
  readonly kind: "branch_fan_in_input_row";
  readonly branchRef: string;
  readonly payloadDigest: string;
  readonly evidenceRefs: readonly string[];
  readonly declaredOrder: number | null;
}

export interface BranchFanInProjectionRow {
  readonly kind: "branch_fan_in_projection_row";
  readonly branchRef: string;
  readonly payloadDigest: string;
  readonly evidenceRefs: readonly string[];
  readonly orderOrdinal: number;
}

export interface BranchFanInProjection {
  readonly kind: "branch_fan_in_projection";
  readonly fanInRef: string;
  readonly fanInDigest: string;
  readonly orderedBranchRefs: readonly string[];
  readonly payloadDigests: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly rows: readonly BranchFanInProjectionRow[];
}

export interface BranchOutputStageRecord {
  readonly kind: "branch_output_stage_record";
  readonly stageRef: string;
  readonly branchRef: string;
  readonly branchAttemptRef: string;
  readonly outputAllocationRefs: readonly string[];
  readonly stagedArtifactRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface BranchOutputPublicationDecision {
  readonly kind: "branch_output_publication_decision";
  readonly decision: "published" | "blocked_unadmitted" | "rejected_mismatch";
  readonly stageRef: string;
  readonly branchRef: string;
  readonly branchAttemptRef: string;
  readonly visibleArtifactRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
}

const stableDigest = stableSha256HexDigest;
const EMPTY_STRING_ARRAY: readonly string[] = Object.freeze([]);

function optionalString(
  value: string | null | undefined,
  label: string
): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  assertNonEmptyString(value, label);
  return value;
}

function positiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${label} must be a positive integer`);
  }
}

function optionalPositiveInteger(
  value: number | null | undefined,
  label: string
): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  positiveInteger(value, label);
  return value;
}

function optionalNonNegativeInteger(
  value: number | null | undefined,
  label: string
): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  assertNonNegativeInteger(value, label);
  return value;
}

function assertOneOf<T extends string>(
  value: string,
  allowedValues: readonly T[],
  label: string
): asserts value is T {
  if (!allowedValues.some((allowedValue) => allowedValue === value)) {
    throw new TypeError(`${label} is not a supported value: ${JSON.stringify(value)}`);
  }
}

function freezeUniqueStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
    if (seen.has(value)) {
      throw new TypeError(`${label} contains duplicate value ${JSON.stringify(value)}`);
    }
    seen.add(value);
  }
  return freezeStringArray(values);
}

function freezeUniqueSortedStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  return freezeStringArray([...freezeUniqueStrings(values, label)].sort());
}

function setDigest(values: readonly string[], label: string): string | null {
  if (values.length === 0) {
    return null;
  }
  return `set:${stableDigest(freezeUniqueSortedStrings(values, label))}`;
}

function intersects(
  left: readonly string[],
  right: ReadonlySet<string>
): readonly string[] {
  return freezeStringArray(left.filter((value) => right.has(value)).sort());
}

function branchDispatchConflictRefs(row: {
  readonly writeTerritoryRefs: readonly string[];
  readonly outputAllocationRefs: readonly string[];
}): readonly string[] {
  return freezeStringArray([
    ...row.writeTerritoryRefs.map((writeRef) => `write:${writeRef}`),
    ...row.outputAllocationRefs.map((outputRef) => `output:${outputRef}`)
  ].sort());
}

function dispatchConflictRefsForRows(
  rows: readonly {
    readonly writeTerritoryRefs: readonly string[];
    readonly outputAllocationRefs: readonly string[];
  }[]
): readonly string[] {
  return freezeStringArray(
    [...new Set(rows.flatMap((row) => branchDispatchConflictRefs(row)))].sort()
  );
}

function rowPriorityCompare(
  left: DependencyFrontierRow,
  right: DependencyFrontierRow
): number {
  const priority = right.declaredPriority - left.declaredPriority;
  if (priority !== 0) {
    return priority;
  }
  const criticalPath = right.criticalPathCost - left.criticalPathCost;
  if (criticalPath !== 0) {
    return criticalPath;
  }
  return left.branchRef.branchRef.localeCompare(right.branchRef.branchRef);
}

function progressStateForRow(
  row: DependencyFrontierRow,
  overrides: {
    readonly dispatchedBranchRefs: ReadonlySet<string>;
    readonly awaitingEvidenceBranchRefs: ReadonlySet<string>;
    readonly awaitingHumanBranchRefs: ReadonlySet<string>;
    readonly retryPendingBranchRefs: ReadonlySet<string>;
    readonly compensatedBranchRefs: ReadonlySet<string>;
    readonly blockedBranchRefs: ReadonlySet<string>;
    readonly escalatedBranchRefs: ReadonlySet<string>;
  }
): PublicConstructionProgressState {
  const branchRef = row.branchRef.branchRef;
  if (overrides.escalatedBranchRefs.has(branchRef)) {
    return "escalated";
  }
  if (overrides.blockedBranchRefs.has(branchRef)) {
    return "blocked";
  }
  if (overrides.compensatedBranchRefs.has(branchRef)) {
    return "compensated";
  }
  if (overrides.retryPendingBranchRefs.has(branchRef)) {
    return "retry_pending";
  }
  if (overrides.awaitingHumanBranchRefs.has(branchRef)) {
    return "awaiting_human";
  }
  if (overrides.awaitingEvidenceBranchRefs.has(branchRef)) {
    return "awaiting_evidence";
  }
  if (overrides.dispatchedBranchRefs.has(branchRef)) {
    return "dispatched";
  }
  if (row.rowState === "blocked_by_parents") {
    return "blocked_by_parents";
  }
  if (row.rowState === "ready") {
    return "ready";
  }
  if (row.rowState === "leased") {
    return "leased";
  }
  if (row.rowState === "closed" || row.rowState === "idempotency_admitted") {
    return "closed";
  }
  return "blocked";
}

function missingSafetyProofRefsFor(
  declaration: DependencyFrontierDeclaration
): readonly string[] {
  const missing: string[] = [];
  if (declaration.observedStateRefs.length === 0) {
    missing.push("missing_observed_state_refs");
  }
  if (
    declaration.writeTerritoryRefs.length === 0 &&
    declaration.outputAllocationRefs.length === 0
  ) {
    missing.push("missing_write_territory_or_output_allocation_refs");
  }
  if (declaration.idempotencyKey === null) {
    missing.push("missing_idempotency_key");
  }
  return freezeStringArray(missing);
}

function progressCounts(
  rows: readonly PublicConstructionProgressRow[]
): Readonly<Record<PublicConstructionProgressState, number>> {
  const counts: Record<PublicConstructionProgressState, number> = {
    blocked_by_parents: 0,
    ready: 0,
    leased: 0,
    dispatched: 0,
    awaiting_evidence: 0,
    awaiting_human: 0,
    retry_pending: 0,
    compensated: 0,
    closed: 0,
    blocked: 0,
    escalated: 0
  };
  for (const row of rows) {
    counts[row.state] += 1;
  }
  return Object.freeze(counts);
}

function freezeRuntimeFailureClasses(
  values: readonly RuntimeFailureClass[]
): readonly RuntimeFailureClass[] {
  const sorted = [...new Set(values)].sort();
  for (const failureClass of sorted) {
    assertRuntimeFailureClass(failureClass);
  }
  return Object.freeze(sorted);
}

function freezeBranchResourceLimits(
  values: readonly Omit<BranchResourceLimit, "kind">[]
): readonly BranchResourceLimit[] {
  const seen = new Set<string>();
  const limits = values.map((value, index) => {
    assertOneOf(
      value.resourceKind,
      BRANCH_RESOURCE_LIMIT_KIND_VALUES,
      `BranchExecutionPolicy.resourceLimits[${index}].resourceKind`
    );
    assertNonEmptyString(
      value.resourceRef,
      `BranchExecutionPolicy.resourceLimits[${index}].resourceRef`
    );
    positiveInteger(
      value.maxConcurrent,
      `BranchExecutionPolicy.resourceLimits[${index}].maxConcurrent`
    );
    const identity = `${value.resourceKind}:${value.resourceRef}`;
    if (seen.has(identity)) {
      throw new TypeError(
        `BranchExecutionPolicy.resourceLimits contains duplicate ${JSON.stringify(identity)}`
      );
    }
    seen.add(identity);
    return Object.freeze({
      kind: "branch_resource_limit",
      resourceKind: value.resourceKind,
      resourceRef: value.resourceRef,
      maxConcurrent: value.maxConcurrent,
      resolvedSystemPolicyRefs: freezeUniqueStrings(
        value.resolvedSystemPolicyRefs,
        `BranchExecutionPolicy.resourceLimits[${index}].resolvedSystemPolicyRefs`
      )
    } satisfies BranchResourceLimit);
  });
  return Object.freeze(limits);
}

function leaseStateFor(record: BranchLeaseRecord, nowMs: number): BranchLeaseState {
  if (record.supersededByLeaseRef !== null) {
    return "superseded";
  }
  if (record.releasedAtMs !== null) {
    return "released";
  }
  if (record.expiresAtMs !== null && record.expiresAtMs <= nowMs) {
    return "expired";
  }
  return "active";
}

function branchRefValue(branchRef: BranchRef | string, label: string): string {
  const value = typeof branchRef === "string" ? branchRef : branchRef.branchRef;
  assertNonEmptyString(value, label);
  return value;
}

function branchAttemptRefValue(
  branchAttemptRef: BranchAttemptRef | string,
  label: string
): string {
  const value =
    typeof branchAttemptRef === "string"
      ? branchAttemptRef
      : branchAttemptRef.branchAttemptRef;
  assertNonEmptyString(value, label);
  return value;
}

function fanInRowCompare(
  orderByBranchRef: ReadonlyMap<string, number>,
  left: BranchFanInInputRow,
  right: BranchFanInInputRow
): number {
  const leftDeclaredOrder =
    orderByBranchRef.get(left.branchRef) ?? left.declaredOrder ?? Number.MAX_SAFE_INTEGER;
  const rightDeclaredOrder =
    orderByBranchRef.get(right.branchRef) ?? right.declaredOrder ?? Number.MAX_SAFE_INTEGER;
  const declaredOrder = leftDeclaredOrder - rightDeclaredOrder;
  if (declaredOrder !== 0) {
    return declaredOrder;
  }
  return left.branchRef.localeCompare(right.branchRef);
}

export function constructBranchRef(input: {
  readonly branchRef?: string | undefined;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex?: number | null | undefined;
  readonly actionRef?: string | null | undefined;
  readonly branchKey: string;
  readonly fanInScopeRef: string;
  readonly workKey?: string | null | undefined;
  readonly basisId?: string | null | undefined;
  readonly graphFunctionId?: string | null | undefined;
  readonly frameLineageId?: string | null | undefined;
  readonly frameAttemptId?: string | null | undefined;
  readonly frontierRef?: string | null | undefined;
  readonly frontierDigest?: string | null | undefined;
}): BranchRef {
  assertNonEmptyString(input.graphCallId, "BranchRef.graphCallId");
  assertNonEmptyString(input.frameId, "BranchRef.frameId");
  assertNonEmptyString(input.branchKey, "BranchRef.branchKey");
  assertNonEmptyString(input.fanInScopeRef, "BranchRef.fanInScopeRef");
  const vectorIndex = input.vectorIndex ?? null;
  if (vectorIndex !== null) {
    assertNonNegativeInteger(vectorIndex, "BranchRef.vectorIndex");
  }
  const actionRef = optionalString(input.actionRef, "BranchRef.actionRef");
  if ((vectorIndex === null && actionRef === null) || (vectorIndex !== null && actionRef !== null)) {
    throw new TypeError("BranchRef requires exactly one of vectorIndex or actionRef");
  }
  const branchRef =
    input.branchRef ??
    `branch:${stableDigest({
      graphCallId: input.graphCallId,
      frameId: input.frameId,
      vectorIndex,
      actionRef,
      branchKey: input.branchKey,
      fanInScopeRef: input.fanInScopeRef
    })}`;
  assertNonEmptyString(branchRef, "BranchRef.branchRef");
  return Object.freeze({
    kind: "branch_ref",
    branchRef,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    vectorIndex,
    actionRef,
    branchKey: input.branchKey,
    fanInScopeRef: input.fanInScopeRef,
    workKey: optionalString(input.workKey, "BranchRef.workKey"),
    basisId: optionalString(input.basisId, "BranchRef.basisId"),
    graphFunctionId: optionalString(input.graphFunctionId, "BranchRef.graphFunctionId"),
    frameLineageId: optionalString(input.frameLineageId, "BranchRef.frameLineageId"),
    frameAttemptId: optionalString(input.frameAttemptId, "BranchRef.frameAttemptId"),
    frontierRef: optionalString(input.frontierRef, "BranchRef.frontierRef"),
    frontierDigest: optionalString(input.frontierDigest, "BranchRef.frontierDigest")
  });
}

export function constructBranchAttemptRef(input: {
  readonly branchRef: BranchRef | string;
  readonly branchAttemptRef?: string | undefined;
  readonly attemptOrdinal: number;
  readonly retryAttemptRef?: string | null | undefined;
  readonly actorInvocationRef?: string | null | undefined;
}): BranchAttemptRef {
  assertNonNegativeInteger(input.attemptOrdinal, "BranchAttemptRef.attemptOrdinal");
  const branchRef =
    typeof input.branchRef === "string" ? input.branchRef : input.branchRef.branchRef;
  assertNonEmptyString(branchRef, "BranchAttemptRef.branchRef");
  const retryAttemptRef = optionalString(
    input.retryAttemptRef,
    "BranchAttemptRef.retryAttemptRef"
  );
  const actorInvocationRef = optionalString(
    input.actorInvocationRef,
    "BranchAttemptRef.actorInvocationRef"
  );
  const branchAttemptRef =
    input.branchAttemptRef ??
    `branch-attempt:${stableDigest({
      branchRef,
      attemptOrdinal: input.attemptOrdinal,
      retryAttemptRef,
      actorInvocationRef
    })}`;
  assertNonEmptyString(branchAttemptRef, "BranchAttemptRef.branchAttemptRef");
  return Object.freeze({
    kind: "branch_attempt_ref",
    branchAttemptRef,
    branchRef,
    attemptOrdinal: input.attemptOrdinal,
    retryAttemptRef,
    actorInvocationRef
  });
}

export function deriveBranchIdempotencyKey(input: {
  readonly commandKind: string;
  readonly branchRef: BranchRef | string;
  readonly branchAttemptRef?: BranchAttemptRef | string | null | undefined;
  readonly payloadScopeRef?: string | null | undefined;
  readonly observedStateRefs?: readonly string[] | undefined;
  readonly outputAllocationRefs?: readonly string[] | undefined;
  readonly writeTerritoryRefs?: readonly string[] | undefined;
}): BranchIdempotencyKey {
  assertNonEmptyString(input.commandKind, "BranchIdempotencyKey.commandKind");
  const branchRef =
    typeof input.branchRef === "string" ? input.branchRef : input.branchRef.branchRef;
  assertNonEmptyString(branchRef, "BranchIdempotencyKey.branchRef");
  const branchAttemptRef =
    input.branchAttemptRef === null || input.branchAttemptRef === undefined
      ? null
      : typeof input.branchAttemptRef === "string"
        ? input.branchAttemptRef
        : input.branchAttemptRef.branchAttemptRef;
  if (branchAttemptRef !== null) {
    assertNonEmptyString(branchAttemptRef, "BranchIdempotencyKey.branchAttemptRef");
  }
  const payloadScopeRef = optionalString(
    input.payloadScopeRef,
    "BranchIdempotencyKey.payloadScopeRef"
  );
  const observedStateSetDigest = setDigest(
    input.observedStateRefs ?? EMPTY_STRING_ARRAY,
    "BranchIdempotencyKey.observedStateRefs"
  );
  const outputAllocationSetDigest = setDigest(
    input.outputAllocationRefs ?? EMPTY_STRING_ARRAY,
    "BranchIdempotencyKey.outputAllocationRefs"
  );
  const writeTerritorySetDigest = setDigest(
    input.writeTerritoryRefs ?? EMPTY_STRING_ARRAY,
    "BranchIdempotencyKey.writeTerritoryRefs"
  );
  const idempotencyKey = `idempotency:${stableDigest({
    commandKind: input.commandKind,
    branchRef,
    branchAttemptRef,
    payloadScopeRef,
    observedStateSetDigest,
    outputAllocationSetDigest,
    writeTerritorySetDigest
  })}`;
  return Object.freeze({
    kind: "branch_idempotency_key",
    idempotencyKey,
    commandKind: input.commandKind,
    branchRef,
    branchAttemptRef,
    payloadScopeRef,
    observedStateSetDigest,
    outputAllocationSetDigest,
    writeTerritorySetDigest
  });
}

export function admitBranchPayloadResult(input: {
  readonly existingRecords?: readonly BranchPayloadAdmissionRecord[] | undefined;
  readonly key: BranchIdempotencyKey;
  readonly payloadDigest: string;
  readonly admissionRef?: string | undefined;
  readonly sourceEventRef?: string | null | undefined;
  readonly diagnosticRefs?: readonly string[] | undefined;
}): BranchPayloadAdmissionDecision {
  assertNonEmptyString(input.payloadDigest, "BranchPayloadAdmissionDecision.payloadDigest");
  const existing = (input.existingRecords ?? Object.freeze([])).find(
    (record) => record.idempotencyKey === input.key.idempotencyKey
  );
  if (existing !== undefined) {
    if (existing.payloadDigest === input.payloadDigest) {
      return Object.freeze({
        kind: "branch_payload_admission_decision",
        decision: "duplicate",
        idempotencyKey: input.key.idempotencyKey,
        branchRef: input.key.branchRef,
        branchAttemptRef: input.key.branchAttemptRef,
        payloadDigest: input.payloadDigest,
        admittedRecord: existing,
        diagnosticRefs: freezeStringArray(input.diagnosticRefs ?? EMPTY_STRING_ARRAY)
      });
    }
    return Object.freeze({
      kind: "branch_payload_admission_decision",
      decision: "conflict",
      idempotencyKey: input.key.idempotencyKey,
      branchRef: input.key.branchRef,
      branchAttemptRef: input.key.branchAttemptRef,
      payloadDigest: input.payloadDigest,
      admittedRecord: null,
      diagnosticRefs: freezeStringArray([
        ...freezeUniqueStrings(input.diagnosticRefs ?? EMPTY_STRING_ARRAY, "BranchPayloadAdmissionDecision.diagnosticRefs"),
        `idempotency-conflict:${input.key.idempotencyKey}`
      ])
    });
  }
  const record: BranchPayloadAdmissionRecord = Object.freeze({
    kind: "branch_payload_admission_record",
    admissionRef:
      input.admissionRef ??
      `branch-admission:${stableDigest({
        idempotencyKey: input.key.idempotencyKey,
        payloadDigest: input.payloadDigest
      })}`,
    idempotencyKey: input.key.idempotencyKey,
    branchRef: input.key.branchRef,
    branchAttemptRef: input.key.branchAttemptRef,
    payloadDigest: input.payloadDigest,
    sourceEventRef: optionalString(
      input.sourceEventRef,
      "BranchPayloadAdmissionDecision.sourceEventRef"
    )
  });
  return Object.freeze({
    kind: "branch_payload_admission_decision",
    decision: "admitted",
    idempotencyKey: input.key.idempotencyKey,
    branchRef: input.key.branchRef,
    branchAttemptRef: input.key.branchAttemptRef,
    payloadDigest: input.payloadDigest,
    admittedRecord: record,
    diagnosticRefs: freezeStringArray(input.diagnosticRefs ?? EMPTY_STRING_ARRAY)
  });
}

export function constructBranchPayloadAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly fanInScopeRef: string;
  readonly key: BranchIdempotencyKey;
  readonly payloadDigest: string;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly sourceEventRef?: string | null | undefined;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId: string;
}): BranchPayloadAdmittedEvent {
  assertNonEmptyString(input.frontierRef, "BranchPayloadAdmittedEvent.frontierRef");
  assertNonEmptyString(
    input.fanInScopeRef,
    "BranchPayloadAdmittedEvent.fanInScopeRef"
  );
  if (input.key.branchAttemptRef === null) {
    throw new TypeError("BranchPayloadAdmittedEvent requires attempt-scoped key");
  }
  assertNonEmptyString(
    input.payloadDigest,
    "BranchPayloadAdmittedEvent.payloadDigest"
  );
  assertNonEmptyString(input.correlationId, "BranchPayloadAdmittedEvent.correlationId");
  return Object.freeze({
    kind: "branch_payload_admitted",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    frontierRef: input.frontierRef,
    branchRef: input.key.branchRef,
    branchAttemptRef: input.key.branchAttemptRef,
    fanInScopeRef: input.fanInScopeRef,
    idempotencyKey: input.key.idempotencyKey,
    payloadDigest: input.payloadDigest,
    evidenceRefs: freezeUniqueStrings(
      input.evidenceRefs ?? EMPTY_STRING_ARRAY,
      "BranchPayloadAdmittedEvent.evidenceRefs"
    ),
    sourceEventRef: optionalString(
      input.sourceEventRef,
      "BranchPayloadAdmittedEvent.sourceEventRef"
    ),
    causationEventRefs: freezeUniqueStrings(
      input.causationEventRefs ?? EMPTY_STRING_ARRAY,
      "BranchPayloadAdmittedEvent.causationEventRefs"
    ),
    correlationId: input.correlationId
  });
}

export function constructDependencyFrontierDeclaration(input: {
  readonly branchRef: BranchRef;
  readonly parentBranchRefs?: readonly string[] | undefined;
  readonly observedStateRefs?: readonly string[] | undefined;
  readonly readRefs?: readonly string[] | undefined;
  readonly writeTerritoryRefs?: readonly string[] | undefined;
  readonly outputAllocationRefs?: readonly string[] | undefined;
  readonly fanInScopeRef?: string | undefined;
  readonly idempotencyKey?: BranchIdempotencyKey | string | null | undefined;
  readonly declaredPriority?: number | undefined;
  readonly criticalPathCost?: number | undefined;
}): DependencyFrontierDeclaration {
  const fanInScopeRef = input.fanInScopeRef ?? input.branchRef.fanInScopeRef;
  assertNonEmptyString(fanInScopeRef, "DependencyFrontierDeclaration.fanInScopeRef");
  const declaredPriority = input.declaredPriority ?? 0;
  const criticalPathCost = input.criticalPathCost ?? 0;
  assertNonNegativeInteger(
    declaredPriority,
    "DependencyFrontierDeclaration.declaredPriority"
  );
  assertNonNegativeInteger(
    criticalPathCost,
    "DependencyFrontierDeclaration.criticalPathCost"
  );
  const idempotencyKey =
    input.idempotencyKey === undefined || input.idempotencyKey === null
      ? null
      : typeof input.idempotencyKey === "string"
        ? input.idempotencyKey
        : input.idempotencyKey.idempotencyKey;
  if (idempotencyKey !== null) {
    assertNonEmptyString(
      idempotencyKey,
      "DependencyFrontierDeclaration.idempotencyKey"
    );
  }
  return Object.freeze({
    kind: "dependency_frontier_declaration",
    branchRef: input.branchRef,
    parentBranchRefs: freezeUniqueStrings(
      input.parentBranchRefs ?? EMPTY_STRING_ARRAY,
      "DependencyFrontierDeclaration.parentBranchRefs"
    ),
    observedStateRefs: freezeUniqueStrings(
      input.observedStateRefs ?? EMPTY_STRING_ARRAY,
      "DependencyFrontierDeclaration.observedStateRefs"
    ),
    readRefs: freezeUniqueStrings(
      input.readRefs ?? EMPTY_STRING_ARRAY,
      "DependencyFrontierDeclaration.readRefs"
    ),
    writeTerritoryRefs: freezeUniqueStrings(
      input.writeTerritoryRefs ?? EMPTY_STRING_ARRAY,
      "DependencyFrontierDeclaration.writeTerritoryRefs"
    ),
    outputAllocationRefs: freezeUniqueStrings(
      input.outputAllocationRefs ?? EMPTY_STRING_ARRAY,
      "DependencyFrontierDeclaration.outputAllocationRefs"
    ),
    fanInScopeRef,
    idempotencyKey,
    declaredPriority,
    criticalPathCost
  });
}

export function deriveDependencyFrontierProjection(input: {
  readonly frontierRef: string;
  readonly basisRef?: string | null | undefined;
  readonly declarations: readonly DependencyFrontierDeclaration[];
  readonly closedBranchRefs?: readonly string[] | undefined;
  readonly failedBranchRefs?: readonly string[] | undefined;
  readonly staleObservedStateRefs?: readonly string[] | undefined;
  readonly admittedIdempotencyKeys?: readonly string[] | undefined;
  readonly activeLeaseBranchRefs?: readonly string[] | undefined;
}): DependencyFrontierProjection {
  assertNonEmptyString(input.frontierRef, "DependencyFrontierProjection.frontierRef");
  const basisRef = optionalString(input.basisRef, "DependencyFrontierProjection.basisRef");
  const closedBranchRefs = freezeUniqueSortedStrings(
    input.closedBranchRefs ?? EMPTY_STRING_ARRAY,
    "DependencyFrontierProjection.closedBranchRefs"
  );
  const closed = new Set(closedBranchRefs);
  const failed = new Set(
    freezeUniqueSortedStrings(
      input.failedBranchRefs ?? EMPTY_STRING_ARRAY,
      "DependencyFrontierProjection.failedBranchRefs"
    )
  );
  const staleObserved = new Set(
    freezeUniqueSortedStrings(
      input.staleObservedStateRefs ?? EMPTY_STRING_ARRAY,
      "DependencyFrontierProjection.staleObservedStateRefs"
    )
  );
  const admittedIdempotency = new Set(
    freezeUniqueSortedStrings(
      input.admittedIdempotencyKeys ?? EMPTY_STRING_ARRAY,
      "DependencyFrontierProjection.admittedIdempotencyKeys"
    )
  );
  const activeLeases = new Set(
    freezeUniqueSortedStrings(
      input.activeLeaseBranchRefs ?? EMPTY_STRING_ARRAY,
      "DependencyFrontierProjection.activeLeaseBranchRefs"
    )
  );
  const rows = Object.freeze(
    input.declarations.map((declaration) => {
      const branchRef = declaration.branchRef.branchRef;
      const blockingParentRefs = freezeStringArray(
        declaration.parentBranchRefs.filter((parentRef) => !closed.has(parentRef))
      );
      const staleObservedStateRefs = freezeStringArray(
        declaration.observedStateRefs.filter((observedRef) =>
          staleObserved.has(observedRef)
        )
      );
      const missingSafetyProofRefs = missingSafetyProofRefsFor(declaration);
      let rowState: DependencyFrontierRowState = "ready";
      if (closed.has(branchRef)) {
        rowState = "closed";
      } else if (failed.has(branchRef)) {
        rowState = "failed";
      } else if (blockingParentRefs.length > 0) {
        rowState = "blocked_by_parents";
      } else if (missingSafetyProofRefs.length > 0) {
        rowState = "underdeclared_safety";
      } else if (staleObservedStateRefs.length > 0) {
        rowState = "stale_observed_state";
      } else if (
        declaration.idempotencyKey !== null &&
        admittedIdempotency.has(declaration.idempotencyKey)
      ) {
        rowState = "idempotency_admitted";
      } else if (activeLeases.has(branchRef)) {
        rowState = "leased";
      }
      return Object.freeze({
        kind: "dependency_frontier_row",
        branchRef: declaration.branchRef,
        rowState,
        parentBranchRefs: declaration.parentBranchRefs,
        blockingParentRefs,
        observedStateRefs: declaration.observedStateRefs,
        staleObservedStateRefs,
        missingSafetyProofRefs,
        readRefs: declaration.readRefs,
        writeTerritoryRefs: declaration.writeTerritoryRefs,
        outputAllocationRefs: declaration.outputAllocationRefs,
        fanInScopeRef: declaration.fanInScopeRef,
        idempotencyKey: declaration.idempotencyKey,
        declaredPriority: declaration.declaredPriority,
        criticalPathCost: declaration.criticalPathCost
      } satisfies DependencyFrontierRow);
    })
  );
  const readyBranchRefs = freezeStringArray(
    rows
      .filter((row) => row.rowState === "ready")
      .map((row) => row.branchRef.branchRef)
      .sort()
  );
  const blockedBranchRefs = freezeStringArray(
    rows
      .filter(
        (row) =>
          row.rowState === "blocked_by_parents" ||
          row.rowState === "failed" ||
          row.rowState === "underdeclared_safety" ||
          row.rowState === "stale_observed_state"
      )
      .map((row) => row.branchRef.branchRef)
      .sort()
  );
  const leasedBranchRefs = freezeStringArray(
    rows
      .filter((row) => row.rowState === "leased")
      .map((row) => row.branchRef.branchRef)
      .sort()
  );
  const failedBranchRefs = freezeStringArray(
    rows
      .filter((row) => row.rowState === "failed")
      .map((row) => row.branchRef.branchRef)
      .sort()
  );
  const frontierDigest = `frontier:${stableDigest({
    frontierRef: input.frontierRef,
    basisRef,
    rows
  })}`;
  return Object.freeze({
    kind: "dependency_frontier_projection",
    frontierRef: input.frontierRef,
    frontierDigest,
    basisRef,
    rows,
    readyBranchRefs,
    blockedBranchRefs,
    failedBranchRefs,
    leasedBranchRefs,
    closedBranchRefs
  });
}

export function constructBranchExecutionPolicy(input: {
  readonly policyRef: string;
  readonly maxConcurrency: number;
  readonly queueDiscipline?: BranchQueueDiscipline | undefined;
  readonly retryableFailureClasses?: readonly RuntimeFailureClass[] | undefined;
  readonly maxRetryAttempts?: number | null | undefined;
  readonly retryBudgetExhaustedDisposition?: BranchExecutionDisposition | undefined;
  readonly noOutputTimeoutMs?: number | null | undefined;
  readonly inactivityTimeoutMs?: number | null | undefined;
  readonly hardSafetyCapMs?: number | null | undefined;
  readonly humanWaitTimeoutMs?: number | null | undefined;
  readonly cancellationSignalKind?: BranchCancellationSignalKind | undefined;
  readonly cancellationGraceMs?: number | null | undefined;
  readonly preserveEvidenceOnCancellation?: boolean | undefined;
  readonly leaseTtlMs?: number | null | undefined;
  readonly leaseRenewalMs?: number | null | undefined;
  readonly resourceLimits?: readonly Omit<BranchResourceLimit, "kind">[] | undefined;
  readonly workerLimitRefs?: readonly string[] | undefined;
  readonly transportLimitRefs?: readonly string[] | undefined;
  readonly preemptionPolicy?: BranchPreemptionPolicy | undefined;
  readonly watchdogPolicy?: RuntimeWatchdogPolicy | null | undefined;
  readonly resolvedSystemPolicyRefs?: readonly string[] | undefined;
}): BranchExecutionPolicy {
  assertNonEmptyString(input.policyRef, "BranchExecutionPolicy.policyRef");
  positiveInteger(input.maxConcurrency, "BranchExecutionPolicy.maxConcurrency");
  const queueDiscipline = input.queueDiscipline ?? "priority_then_identity";
  assertOneOf(
    queueDiscipline,
    Object.freeze(["priority_then_identity"] as const),
    "BranchExecutionPolicy.queueDiscipline"
  );
  const retryableFailureClasses = freezeRuntimeFailureClasses(
    input.retryableFailureClasses ?? DEFAULT_BRANCH_RETRY_FAILURE_CLASSES
  );
  const retryBudgetExhaustedDisposition =
    input.retryBudgetExhaustedDisposition ?? "block";
  assertOneOf(
    retryBudgetExhaustedDisposition,
    BRANCH_EXECUTION_DISPOSITION_VALUES,
    "BranchExecutionPolicy.retryBudgetExhaustedDisposition"
  );
  const cancellationSignalKind = input.cancellationSignalKind ?? "abort_signal";
  assertOneOf(
    cancellationSignalKind,
    BRANCH_CANCELLATION_SIGNAL_KIND_VALUES,
    "BranchExecutionPolicy.cancellationSignalKind"
  );
  const preemptionPolicy = input.preemptionPolicy ?? "none";
  assertOneOf(
    preemptionPolicy,
    BRANCH_PREEMPTION_POLICY_VALUES,
    "BranchExecutionPolicy.preemptionPolicy"
  );
  return Object.freeze({
    kind: "branch_execution_policy",
    policyRef: input.policyRef,
    maxConcurrency: input.maxConcurrency,
    queueDiscipline,
    retryableFailureClasses,
    maxRetryAttempts: optionalNonNegativeInteger(
      input.maxRetryAttempts,
      "BranchExecutionPolicy.maxRetryAttempts"
    ),
    retryBudgetExhaustedDisposition,
    noOutputTimeoutMs: optionalPositiveInteger(
      input.noOutputTimeoutMs,
      "BranchExecutionPolicy.noOutputTimeoutMs"
    ),
    inactivityTimeoutMs: optionalPositiveInteger(
      input.inactivityTimeoutMs,
      "BranchExecutionPolicy.inactivityTimeoutMs"
    ),
    hardSafetyCapMs: optionalPositiveInteger(
      input.hardSafetyCapMs,
      "BranchExecutionPolicy.hardSafetyCapMs"
    ),
    humanWaitTimeoutMs: optionalPositiveInteger(
      input.humanWaitTimeoutMs,
      "BranchExecutionPolicy.humanWaitTimeoutMs"
    ),
    cancellationSignalKind,
    cancellationGraceMs: optionalPositiveInteger(
      input.cancellationGraceMs,
      "BranchExecutionPolicy.cancellationGraceMs"
    ),
    preserveEvidenceOnCancellation: input.preserveEvidenceOnCancellation ?? true,
    leaseTtlMs: optionalPositiveInteger(
      input.leaseTtlMs,
      "BranchExecutionPolicy.leaseTtlMs"
    ),
    leaseRenewalMs: optionalPositiveInteger(
      input.leaseRenewalMs,
      "BranchExecutionPolicy.leaseRenewalMs"
    ),
    resourceLimits: freezeBranchResourceLimits(input.resourceLimits ?? Object.freeze([])),
    workerLimitRefs: freezeUniqueStrings(
      input.workerLimitRefs ?? EMPTY_STRING_ARRAY,
      "BranchExecutionPolicy.workerLimitRefs"
    ),
    transportLimitRefs: freezeUniqueStrings(
      input.transportLimitRefs ?? EMPTY_STRING_ARRAY,
      "BranchExecutionPolicy.transportLimitRefs"
    ),
    preemptionPolicy,
    watchdogPolicy: input.watchdogPolicy ?? null,
    resolvedSystemPolicyRefs: freezeUniqueStrings(
      input.resolvedSystemPolicyRefs ?? EMPTY_STRING_ARRAY,
      "BranchExecutionPolicy.resolvedSystemPolicyRefs"
    )
  });
}

export function selectDisjointReadyBranches(input: {
  readonly selectionRef: string;
  readonly frontier: DependencyFrontierProjection;
  readonly policy: BranchExecutionPolicy;
  readonly activeWriteTerritoryRefs?: readonly string[] | undefined;
  readonly activeOutputAllocationRefs?: readonly string[] | undefined;
  readonly activeDispatchConflictRefs?: readonly string[] | undefined;
}): BranchSelectionProjection {
  assertNonEmptyString(input.selectionRef, "BranchSelectionProjection.selectionRef");
  const activeWriteTerritoryRefs = freezeUniqueSortedStrings(
    [
      ...(input.activeWriteTerritoryRefs ?? EMPTY_STRING_ARRAY),
      ...input.frontier.rows
        .filter((row) => row.rowState === "leased")
        .flatMap((row) => row.writeTerritoryRefs)
    ],
    "BranchSelectionProjection.activeWriteTerritoryRefs"
  );
  const activeOutputAllocationRefs = freezeUniqueSortedStrings(
    input.activeOutputAllocationRefs ?? EMPTY_STRING_ARRAY,
    "BranchSelectionProjection.activeOutputAllocationRefs"
  );
  const activeDispatchConflictRefs = freezeUniqueSortedStrings(
    [
      ...(input.activeDispatchConflictRefs ?? EMPTY_STRING_ARRAY),
      ...activeWriteTerritoryRefs.map((writeRef) => `write:${writeRef}`),
      ...activeOutputAllocationRefs.map((outputRef) => `output:${outputRef}`),
      ...dispatchConflictRefsForRows(
        input.frontier.rows.filter((row) => row.rowState === "leased")
      )
    ],
    "BranchSelectionProjection.activeDispatchConflictRefs"
  );
  const claimedConflictRefs = new Set(
    activeDispatchConflictRefs
  );
  const readyRows = [...input.frontier.rows]
    .filter((row) => row.rowState === "ready")
    .sort(rowPriorityCompare);
  const selectedBranchRefs: string[] = [];
  const conflictBranchRefs: string[] = [];
  const decisionByBranchRef = new Map<
    string,
    { readonly decision: BranchSelectionDecision; readonly reason: string }
  >();
  for (const row of readyRows) {
    const branchRef = row.branchRef.branchRef;
    if (selectedBranchRefs.length >= input.policy.maxConcurrency) {
      decisionByBranchRef.set(branchRef, {
        decision: "deferred_cap",
        reason: "resource_cap_reached"
      });
      continue;
    }
    const conflictingRefs = intersects(
      branchDispatchConflictRefs(row),
      claimedConflictRefs
    );
    if (conflictingRefs.length > 0) {
      conflictBranchRefs.push(branchRef);
      decisionByBranchRef.set(branchRef, {
        decision: "deferred_conflict",
        reason: `dispatch_conflict:${conflictingRefs.join(",")}`
      });
      continue;
    }
    selectedBranchRefs.push(branchRef);
    for (const conflictRef of branchDispatchConflictRefs(row)) {
      claimedConflictRefs.add(conflictRef);
    }
    decisionByBranchRef.set(branchRef, {
      decision: "selected",
      reason: "ready_disjoint_under_policy"
    });
  }
  const rows = Object.freeze(
    input.frontier.rows.map((row) => {
      const branchRef = row.branchRef.branchRef;
      const decision = decisionByBranchRef.get(branchRef) ?? {
        decision: "not_ready" as const,
        reason: row.rowState
      };
      return Object.freeze({
        kind: "branch_selection_row",
        branchRef,
        decision: decision.decision,
        reason: decision.reason
      } satisfies BranchSelectionRow);
    })
  );
  const deferredReadyBranchRefs = freezeStringArray(
    rows
      .filter(
        (row) =>
          row.decision === "deferred_cap" || row.decision === "deferred_conflict"
      )
      .map((row) => row.branchRef)
      .sort()
  );
  return Object.freeze({
    kind: "branch_selection_projection",
    selectionRef: input.selectionRef,
    frontierRef: input.frontier.frontierRef,
    policyRef: input.policy.policyRef,
    maxConcurrency: input.policy.maxConcurrency,
    selectedBranchRefs: freezeStringArray(selectedBranchRefs),
    deferredReadyBranchRefs,
    conflictBranchRefs: freezeStringArray(conflictBranchRefs.sort()),
    activeWriteTerritoryRefs,
    activeOutputAllocationRefs,
    activeDispatchConflictRefs,
    rows
  });
}

export function constructBranchLeaseRecord(input: {
  readonly leaseRef?: string | undefined;
  readonly branchRef: BranchRef | string;
  readonly branchAttemptRef: BranchAttemptRef | string;
  readonly leasedWriteTerritoryRefs: readonly string[];
  readonly leasedOutputAllocationRefs?: readonly string[] | undefined;
  readonly leasedAtMs: number;
  readonly expiresAtMs?: number | null | undefined;
  readonly releasedAtMs?: number | null | undefined;
  readonly supersededByLeaseRef?: string | null | undefined;
}): BranchLeaseRecord {
  const branchRef =
    typeof input.branchRef === "string" ? input.branchRef : input.branchRef.branchRef;
  const branchAttemptRef =
    typeof input.branchAttemptRef === "string"
      ? input.branchAttemptRef
      : input.branchAttemptRef.branchAttemptRef;
  assertNonEmptyString(branchRef, "BranchLeaseRecord.branchRef");
  assertNonEmptyString(branchAttemptRef, "BranchLeaseRecord.branchAttemptRef");
  assertNonNegativeInteger(input.leasedAtMs, "BranchLeaseRecord.leasedAtMs");
  const expiresAtMs = input.expiresAtMs ?? null;
  if (expiresAtMs !== null) {
    assertNonNegativeInteger(expiresAtMs, "BranchLeaseRecord.expiresAtMs");
    if (expiresAtMs <= input.leasedAtMs) {
      throw new TypeError("BranchLeaseRecord.expiresAtMs must be after leasedAtMs");
    }
  }
  const releasedAtMs = input.releasedAtMs ?? null;
  if (releasedAtMs !== null) {
    assertNonNegativeInteger(releasedAtMs, "BranchLeaseRecord.releasedAtMs");
    if (releasedAtMs < input.leasedAtMs) {
      throw new TypeError("BranchLeaseRecord.releasedAtMs must be after leasedAtMs");
    }
  }
  const supersededByLeaseRef = optionalString(
    input.supersededByLeaseRef,
    "BranchLeaseRecord.supersededByLeaseRef"
  );
  const leasedWriteTerritoryRefs = freezeUniqueStrings(
    input.leasedWriteTerritoryRefs,
    "BranchLeaseRecord.leasedWriteTerritoryRefs"
  );
  const leasedOutputAllocationRefs = freezeUniqueStrings(
    input.leasedOutputAllocationRefs ?? EMPTY_STRING_ARRAY,
    "BranchLeaseRecord.leasedOutputAllocationRefs"
  );
  const leasedDispatchConflictRefs = branchDispatchConflictRefs({
    writeTerritoryRefs: leasedWriteTerritoryRefs,
    outputAllocationRefs: leasedOutputAllocationRefs
  });
  const leaseRef =
    input.leaseRef ??
    `branch-lease:${stableDigest({
      branchRef,
      branchAttemptRef,
      leasedWriteTerritoryRefs,
      leasedOutputAllocationRefs,
      leasedAtMs: input.leasedAtMs,
      expiresAtMs
    })}`;
  assertNonEmptyString(leaseRef, "BranchLeaseRecord.leaseRef");
  return Object.freeze({
    kind: "branch_lease_record",
    leaseRef,
    branchRef,
    branchAttemptRef,
    leasedWriteTerritoryRefs,
    leasedOutputAllocationRefs,
    leasedDispatchConflictRefs,
    leasedAtMs: input.leasedAtMs,
    expiresAtMs,
    releasedAtMs,
    supersededByLeaseRef
  });
}

export function constructBranchLeaseAcquiredEvent(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly branchRef: BranchRef | string;
  readonly branchAttemptRef: BranchAttemptRef | string;
  readonly leaseRef?: string | undefined;
  readonly leasedWriteTerritoryRefs: readonly string[];
  readonly leasedOutputAllocationRefs?: readonly string[] | undefined;
  readonly leasedAtMs: number;
  readonly expiresAtMs?: number | null | undefined;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId: string;
}): BranchLeaseAcquiredEvent {
  const branchRef = branchRefValue(
    input.branchRef,
    "BranchLeaseAcquiredEvent.branchRef"
  );
  const branchAttemptRef = branchAttemptRefValue(
    input.branchAttemptRef,
    "BranchLeaseAcquiredEvent.branchAttemptRef"
  );
  const record = constructBranchLeaseRecord({
    branchRef,
    branchAttemptRef,
    leaseRef: input.leaseRef,
    leasedWriteTerritoryRefs: input.leasedWriteTerritoryRefs,
    leasedOutputAllocationRefs: input.leasedOutputAllocationRefs,
    leasedAtMs: input.leasedAtMs,
    expiresAtMs: input.expiresAtMs ?? null
  });
  assertNonEmptyString(input.frontierRef, "BranchLeaseAcquiredEvent.frontierRef");
  assertNonEmptyString(input.correlationId, "BranchLeaseAcquiredEvent.correlationId");
  return Object.freeze({
    kind: "branch_lease_acquired",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    frontierRef: input.frontierRef,
    branchRef,
    branchAttemptRef,
    leaseRef: record.leaseRef,
    leasedWriteTerritoryRefs: record.leasedWriteTerritoryRefs,
    leasedOutputAllocationRefs: record.leasedOutputAllocationRefs,
    leasedAtMs: record.leasedAtMs,
    expiresAtMs: record.expiresAtMs,
    causationEventRefs: freezeUniqueStrings(
      input.causationEventRefs ?? EMPTY_STRING_ARRAY,
      "BranchLeaseAcquiredEvent.causationEventRefs"
    ),
    correlationId: input.correlationId
  });
}

export function constructBranchLeaseReleasedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly branchRef: BranchRef | string;
  readonly branchAttemptRef: BranchAttemptRef | string;
  readonly leaseRef: string;
  readonly releasedAtMs: number;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId: string;
}): BranchLeaseReleasedEvent {
  const branchRef = branchRefValue(
    input.branchRef,
    "BranchLeaseReleasedEvent.branchRef"
  );
  const branchAttemptRef = branchAttemptRefValue(
    input.branchAttemptRef,
    "BranchLeaseReleasedEvent.branchAttemptRef"
  );
  assertNonEmptyString(input.frontierRef, "BranchLeaseReleasedEvent.frontierRef");
  assertNonEmptyString(input.leaseRef, "BranchLeaseReleasedEvent.leaseRef");
  assertNonNegativeInteger(
    input.releasedAtMs,
    "BranchLeaseReleasedEvent.releasedAtMs"
  );
  assertNonEmptyString(input.correlationId, "BranchLeaseReleasedEvent.correlationId");
  return Object.freeze({
    kind: "branch_lease_released",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    frontierRef: input.frontierRef,
    branchRef,
    branchAttemptRef,
    leaseRef: input.leaseRef,
    releasedAtMs: input.releasedAtMs,
    causationEventRefs: freezeUniqueStrings(
      input.causationEventRefs ?? EMPTY_STRING_ARRAY,
      "BranchLeaseReleasedEvent.causationEventRefs"
    ),
    correlationId: input.correlationId
  });
}

export function constructBranchLeaseSupersededEvent(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly branchRef: BranchRef | string;
  readonly branchAttemptRef: BranchAttemptRef | string;
  readonly leaseRef: string;
  readonly supersededByLeaseRef: string;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId: string;
}): BranchLeaseSupersededEvent {
  const branchRef = branchRefValue(
    input.branchRef,
    "BranchLeaseSupersededEvent.branchRef"
  );
  const branchAttemptRef = branchAttemptRefValue(
    input.branchAttemptRef,
    "BranchLeaseSupersededEvent.branchAttemptRef"
  );
  assertNonEmptyString(input.frontierRef, "BranchLeaseSupersededEvent.frontierRef");
  assertNonEmptyString(input.leaseRef, "BranchLeaseSupersededEvent.leaseRef");
  assertNonEmptyString(
    input.supersededByLeaseRef,
    "BranchLeaseSupersededEvent.supersededByLeaseRef"
  );
  assertNonEmptyString(input.correlationId, "BranchLeaseSupersededEvent.correlationId");
  return Object.freeze({
    kind: "branch_lease_superseded",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    frontierRef: input.frontierRef,
    branchRef,
    branchAttemptRef,
    leaseRef: input.leaseRef,
    supersededByLeaseRef: input.supersededByLeaseRef,
    causationEventRefs: freezeUniqueStrings(
      input.causationEventRefs ?? EMPTY_STRING_ARRAY,
      "BranchLeaseSupersededEvent.causationEventRefs"
    ),
    correlationId: input.correlationId
  });
}

export function constructBranchTaskFailedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly branchRef: BranchRef | string;
  readonly branchAttemptRef: BranchAttemptRef | string;
  readonly leaseRef: string;
  readonly failureRef?: string | undefined;
  readonly failureClass: RuntimeFailureClass;
  readonly failureDigest?: string | undefined;
  readonly disposition?: BranchExecutionDisposition | undefined;
  readonly preserveEvidence?: boolean | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId: string;
}): BranchTaskFailedEvent {
  const branchRef = branchRefValue(
    input.branchRef,
    "BranchTaskFailedEvent.branchRef"
  );
  const branchAttemptRef = branchAttemptRefValue(
    input.branchAttemptRef,
    "BranchTaskFailedEvent.branchAttemptRef"
  );
  assertNonEmptyString(input.frontierRef, "BranchTaskFailedEvent.frontierRef");
  assertNonEmptyString(input.leaseRef, "BranchTaskFailedEvent.leaseRef");
  assertRuntimeFailureClass(input.failureClass);
  const disposition = input.disposition ?? "block";
  assertOneOf(
    disposition,
    BRANCH_EXECUTION_DISPOSITION_VALUES,
    "BranchTaskFailedEvent.disposition"
  );
  const evidenceRefs = freezeUniqueSortedStrings(
    input.evidenceRefs ?? EMPTY_STRING_ARRAY,
    "BranchTaskFailedEvent.evidenceRefs"
  );
  const failureDigest =
    input.failureDigest ??
    `branch-failure:${stableDigest({
      branchRef,
      branchAttemptRef,
      leaseRef: input.leaseRef,
      failureClass: input.failureClass,
      disposition,
      evidenceRefs
    })}`;
  assertNonEmptyString(failureDigest, "BranchTaskFailedEvent.failureDigest");
  const failureRef =
    input.failureRef ??
    `branch-failure:${branchAttemptRef}:${failureDigest}`;
  assertNonEmptyString(failureRef, "BranchTaskFailedEvent.failureRef");
  assertNonEmptyString(input.correlationId, "BranchTaskFailedEvent.correlationId");
  return Object.freeze({
    kind: "branch_task_failed",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    frontierRef: input.frontierRef,
    branchRef,
    branchAttemptRef,
    leaseRef: input.leaseRef,
    failureRef,
    failureClass: input.failureClass,
    failureDigest,
    disposition,
    preserveEvidence: input.preserveEvidence ?? true,
    evidenceRefs,
    causationEventRefs: freezeUniqueStrings(
      input.causationEventRefs ?? EMPTY_STRING_ARRAY,
      "BranchTaskFailedEvent.causationEventRefs"
    ),
    correlationId: input.correlationId
  });
}

export function deriveBranchLeaseProjection(input: {
  readonly projectionRef: string;
  readonly nowMs: number;
  readonly leases: readonly BranchLeaseRecord[];
}): BranchLeaseProjection {
  assertNonEmptyString(input.projectionRef, "BranchLeaseProjection.projectionRef");
  assertNonNegativeInteger(input.nowMs, "BranchLeaseProjection.nowMs");
  const rows = Object.freeze(
    input.leases.map((lease) => Object.freeze({
      kind: "branch_lease_projection_row",
      leaseRef: lease.leaseRef,
      branchRef: lease.branchRef,
      branchAttemptRef: lease.branchAttemptRef,
      leaseState: leaseStateFor(lease, input.nowMs),
      leasedWriteTerritoryRefs: lease.leasedWriteTerritoryRefs,
      leasedOutputAllocationRefs: lease.leasedOutputAllocationRefs,
      leasedDispatchConflictRefs: lease.leasedDispatchConflictRefs
    } satisfies BranchLeaseProjectionRow))
  );
  const activeRows = rows.filter((row) => row.leaseState === "active");
  return Object.freeze({
    kind: "branch_lease_projection",
    projectionRef: input.projectionRef,
    nowMs: input.nowMs,
    rows,
    activeLeaseRefs: freezeStringArray(activeRows.map((row) => row.leaseRef).sort()),
    activeBranchRefs: freezeStringArray(
      [...new Set(activeRows.map((row) => row.branchRef))].sort()
    ),
    activeWriteTerritoryRefs: freezeStringArray(
      [...new Set(activeRows.flatMap((row) => row.leasedWriteTerritoryRefs))].sort()
    ),
    activeOutputAllocationRefs: freezeStringArray(
      [...new Set(activeRows.flatMap((row) => row.leasedOutputAllocationRefs))].sort()
    ),
    activeDispatchConflictRefs: freezeStringArray(
      [...new Set(activeRows.flatMap((row) => row.leasedDispatchConflictRefs))].sort()
    ),
    expiredLeaseRefs: freezeStringArray(
      rows
        .filter((row) => row.leaseState === "expired")
        .map((row) => row.leaseRef)
        .sort()
    ),
    releasedLeaseRefs: freezeStringArray(
      rows
        .filter((row) => row.leaseState === "released")
        .map((row) => row.leaseRef)
        .sort()
    ),
    supersededLeaseRefs: freezeStringArray(
      rows
        .filter((row) => row.leaseState === "superseded")
        .map((row) => row.leaseRef)
        .sort()
    )
  });
}

export function deriveBranchLeaseProjectionFromEvents(input: {
  readonly projectionRef: string;
  readonly nowMs: number;
  readonly events: readonly RuntimeEvent[];
}): BranchLeaseProjection {
  const acquiredByLeaseRef = new Map<string, BranchLeaseAcquiredEvent>();
  const releasedAtByLeaseRef = new Map<string, number>();
  const supersededByLeaseRef = new Map<string, string>();
  for (const event of input.events) {
    if (event.kind === "branch_lease_acquired") {
      if (acquiredByLeaseRef.has(event.leaseRef)) {
        throw new TypeError(
          `BranchLeaseProjection rejects duplicate lease ${JSON.stringify(event.leaseRef)}`
        );
      }
      acquiredByLeaseRef.set(event.leaseRef, event);
    } else if (event.kind === "branch_lease_released") {
      if (!acquiredByLeaseRef.has(event.leaseRef)) {
        throw new TypeError(
          `BranchLeaseProjection rejects release for unknown lease ${JSON.stringify(event.leaseRef)}`
        );
      }
      releasedAtByLeaseRef.set(event.leaseRef, event.releasedAtMs);
    } else if (event.kind === "branch_lease_superseded") {
      if (!acquiredByLeaseRef.has(event.leaseRef)) {
        throw new TypeError(
          `BranchLeaseProjection rejects supersession for unknown lease ${JSON.stringify(event.leaseRef)}`
        );
      }
      supersededByLeaseRef.set(event.leaseRef, event.supersededByLeaseRef);
    }
  }
  const leases = Object.freeze(
    [...acquiredByLeaseRef.values()].map((event) =>
      constructBranchLeaseRecord({
        leaseRef: event.leaseRef,
        branchRef: event.branchRef,
        branchAttemptRef: event.branchAttemptRef,
        leasedWriteTerritoryRefs: event.leasedWriteTerritoryRefs,
        leasedOutputAllocationRefs: event.leasedOutputAllocationRefs,
        leasedAtMs: event.leasedAtMs,
        expiresAtMs: event.expiresAtMs,
        releasedAtMs: releasedAtByLeaseRef.get(event.leaseRef) ?? null,
        supersededByLeaseRef: supersededByLeaseRef.get(event.leaseRef) ?? null
      })
    )
  );
  return deriveBranchLeaseProjection({
    projectionRef: input.projectionRef,
    nowMs: input.nowMs,
    leases
  });
}

export function deriveWriteTerritoryConflictProjection(input: {
  readonly projectionRef: string;
  readonly frontier: DependencyFrontierProjection;
  readonly activeWriteTerritoryRefs?: readonly string[] | undefined;
  readonly activeOutputAllocationRefs?: readonly string[] | undefined;
  readonly activeDispatchConflictRefs?: readonly string[] | undefined;
}): WriteTerritoryConflictProjection {
  assertNonEmptyString(
    input.projectionRef,
    "WriteTerritoryConflictProjection.projectionRef"
  );
  const staticConflicts: WriteTerritoryConflictRow[] = [];
  for (const [leftIndex, left] of input.frontier.rows.entries()) {
    for (const right of input.frontier.rows.slice(leftIndex + 1)) {
      const rightConflictRefs = new Set(branchDispatchConflictRefs(right));
      const conflictRefs = intersects(
        branchDispatchConflictRefs(left),
        rightConflictRefs
      );
      if (conflictRefs.length > 0) {
        staticConflicts.push(Object.freeze({
          kind: "write_territory_conflict_row",
          conflictKind: "static_declared",
          branchRefs: freezeStringArray([
            left.branchRef.branchRef,
            right.branchRef.branchRef
          ].sort()),
          writeTerritoryRefs: conflictRefs
        }));
      }
    }
  }
  const activeConflictRefs = new Set([
    ...freezeUniqueSortedStrings(
      input.activeDispatchConflictRefs ?? EMPTY_STRING_ARRAY,
      "WriteTerritoryConflictProjection.activeDispatchConflictRefs"
    ),
    ...freezeUniqueSortedStrings(
      input.activeWriteTerritoryRefs ?? EMPTY_STRING_ARRAY,
      "WriteTerritoryConflictProjection.activeWriteTerritoryRefs"
    ).map((writeRef) => `write:${writeRef}`),
    ...freezeUniqueSortedStrings(
      input.activeOutputAllocationRefs ?? EMPTY_STRING_ARRAY,
      "WriteTerritoryConflictProjection.activeOutputAllocationRefs"
    ).map((outputRef) => `output:${outputRef}`),
    ...dispatchConflictRefsForRows(
      input.frontier.rows.filter((row) => row.rowState === "leased")
    )
  ]);
  const dynamicConflicts = Object.freeze(
    input.frontier.rows.flatMap((row) => {
      const conflictRefs = intersects(
        branchDispatchConflictRefs(row),
        activeConflictRefs
      );
      if (conflictRefs.length === 0) {
        return [];
      }
      return [
        Object.freeze({
          kind: "write_territory_conflict_row",
          conflictKind: "dynamic_lease",
          branchRefs: freezeStringArray([row.branchRef.branchRef]),
          writeTerritoryRefs: conflictRefs
        } satisfies WriteTerritoryConflictRow)
      ];
    })
  );
  const conflictingBranchRefs = freezeStringArray(
    [
      ...staticConflicts.flatMap((row) => row.branchRefs),
      ...dynamicConflicts.flatMap((row) => row.branchRefs)
    ]
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort()
  );
  return Object.freeze({
    kind: "write_territory_conflict_projection",
    projectionRef: input.projectionRef,
    frontierRef: input.frontier.frontierRef,
    staticConflicts: Object.freeze(staticConflicts),
    dynamicConflicts,
    conflictingBranchRefs
  });
}

export function constructBranchFanInInputRow(input: {
  readonly branchRef: BranchRef | string;
  readonly payloadDigest: string;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly declaredOrder?: number | null | undefined;
}): BranchFanInInputRow {
  const branchRef =
    typeof input.branchRef === "string" ? input.branchRef : input.branchRef.branchRef;
  assertNonEmptyString(branchRef, "BranchFanInInputRow.branchRef");
  assertNonEmptyString(input.payloadDigest, "BranchFanInInputRow.payloadDigest");
  const declaredOrder = input.declaredOrder ?? null;
  if (declaredOrder !== null) {
    assertNonNegativeInteger(declaredOrder, "BranchFanInInputRow.declaredOrder");
  }
  return Object.freeze({
    kind: "branch_fan_in_input_row",
    branchRef,
    payloadDigest: input.payloadDigest,
    evidenceRefs: freezeUniqueStrings(
      input.evidenceRefs ?? EMPTY_STRING_ARRAY,
      "BranchFanInInputRow.evidenceRefs"
    ),
    declaredOrder
  });
}

export function deriveBranchFanInProjection(input: {
  readonly fanInRef: string;
  readonly rows: readonly BranchFanInInputRow[];
  readonly declaredOrderBranchRefs?: readonly string[] | undefined;
}): BranchFanInProjection {
  assertNonEmptyString(input.fanInRef, "BranchFanInProjection.fanInRef");
  const declaredOrderBranchRefs = freezeUniqueStrings(
    input.declaredOrderBranchRefs ?? EMPTY_STRING_ARRAY,
    "BranchFanInProjection.declaredOrderBranchRefs"
  );
  const orderByBranchRef = new Map<string, number>();
  declaredOrderBranchRefs.forEach((branchRef, index) => {
    orderByBranchRef.set(branchRef, index);
  });
  const seenBranches = new Set<string>();
  for (const row of input.rows) {
    if (seenBranches.has(row.branchRef)) {
      throw new TypeError(
        `BranchFanInProjection contains duplicate branch ${JSON.stringify(row.branchRef)}`
      );
    }
    seenBranches.add(row.branchRef);
  }
  const orderedRows = Object.freeze(
    [...input.rows]
      .sort((left, right) => fanInRowCompare(orderByBranchRef, left, right))
      .map((row, orderOrdinal) => Object.freeze({
        kind: "branch_fan_in_projection_row",
        branchRef: row.branchRef,
        payloadDigest: row.payloadDigest,
        evidenceRefs: row.evidenceRefs,
        orderOrdinal
      } satisfies BranchFanInProjectionRow))
  );
  const evidenceRefs = freezeUniqueSortedStrings(
    orderedRows.flatMap((row) => row.evidenceRefs),
    "BranchFanInProjection.evidenceRefs"
  );
  const payloadDigests = freezeStringArray(
    orderedRows.map((row) => row.payloadDigest)
  );
  const orderedBranchRefs = freezeStringArray(
    orderedRows.map((row) => row.branchRef)
  );
  const fanInDigest = `fan-in:${stableDigest({
    fanInRef: input.fanInRef,
    orderedBranchRefs,
    payloadDigests,
    evidenceRefs
  })}`;
  return Object.freeze({
    kind: "branch_fan_in_projection",
    fanInRef: input.fanInRef,
    fanInDigest,
    orderedBranchRefs,
    payloadDigests,
    evidenceRefs,
    rows: orderedRows
  });
}

export function deriveBranchFanInProjectionFromEvents(input: {
  readonly fanInRef: string;
  readonly events: readonly RuntimeEvent[];
  readonly declaredOrderBranchRefs?: readonly string[] | undefined;
}): BranchFanInProjection {
  const admittedByIdempotencyKey = new Map<string, BranchPayloadAdmittedEvent>();
  for (const event of input.events) {
    if (
      event.kind !== "branch_payload_admitted" ||
      event.fanInScopeRef !== input.fanInRef
    ) {
      continue;
    }
    const existing = admittedByIdempotencyKey.get(event.idempotencyKey);
    if (existing === undefined) {
      admittedByIdempotencyKey.set(event.idempotencyKey, event);
      continue;
    }
    if (
      existing.branchRef !== event.branchRef ||
      existing.branchAttemptRef !== event.branchAttemptRef ||
      existing.payloadDigest !== event.payloadDigest
    ) {
      throw new TypeError(
        `BranchFanInProjection rejects conflicting duplicate idempotency key ${JSON.stringify(event.idempotencyKey)}`
      );
    }
  }
  return deriveBranchFanInProjection({
    fanInRef: input.fanInRef,
    rows: Object.freeze(
      [...admittedByIdempotencyKey.values()].map((event) =>
        constructBranchFanInInputRow({
          branchRef: event.branchRef,
          payloadDigest: event.payloadDigest,
          evidenceRefs: event.evidenceRefs
        })
      )
    ),
    declaredOrderBranchRefs: input.declaredOrderBranchRefs
  });
}

export function constructBranchFanInProjectedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly fanIn: BranchFanInProjection;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId: string;
}): BranchFanInProjectedEvent {
  assertNonEmptyString(input.frontierRef, "BranchFanInProjectedEvent.frontierRef");
  assertNonEmptyString(input.correlationId, "BranchFanInProjectedEvent.correlationId");
  return Object.freeze({
    kind: "branch_fan_in_projected",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    frontierRef: input.frontierRef,
    fanInRef: input.fanIn.fanInRef,
    fanInDigest: input.fanIn.fanInDigest,
    orderedBranchRefs: input.fanIn.orderedBranchRefs,
    payloadDigests: input.fanIn.payloadDigests,
    evidenceRefs: input.fanIn.evidenceRefs,
    causationEventRefs: freezeUniqueStrings(
      input.causationEventRefs ?? EMPTY_STRING_ARRAY,
      "BranchFanInProjectedEvent.causationEventRefs"
    ),
    correlationId: input.correlationId
  });
}

export function constructBranchOutputStageRecord(input: {
  readonly stageRef?: string | undefined;
  readonly branchRef: BranchRef | string;
  readonly branchAttemptRef: BranchAttemptRef | string;
  readonly outputAllocationRefs: readonly string[];
  readonly stagedArtifactRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}): BranchOutputStageRecord {
  const branchRef = branchRefValue(input.branchRef, "BranchOutputStageRecord.branchRef");
  const branchAttemptRef = branchAttemptRefValue(
    input.branchAttemptRef,
    "BranchOutputStageRecord.branchAttemptRef"
  );
  const outputAllocationRefs = freezeUniqueStrings(
    input.outputAllocationRefs,
    "BranchOutputStageRecord.outputAllocationRefs"
  );
  const stagedArtifactRefs = freezeUniqueStrings(
    input.stagedArtifactRefs,
    "BranchOutputStageRecord.stagedArtifactRefs"
  );
  const evidenceRefs = freezeUniqueStrings(
    input.evidenceRefs ?? EMPTY_STRING_ARRAY,
    "BranchOutputStageRecord.evidenceRefs"
  );
  const stageRef =
    input.stageRef ??
    `branch-stage:${stableDigest({
      branchRef,
      branchAttemptRef,
      outputAllocationRefs,
      stagedArtifactRefs
    })}`;
  assertNonEmptyString(stageRef, "BranchOutputStageRecord.stageRef");
  return Object.freeze({
    kind: "branch_output_stage_record",
    stageRef,
    branchRef,
    branchAttemptRef,
    outputAllocationRefs,
    stagedArtifactRefs,
    evidenceRefs
  });
}

export function admitBranchOutputPublication(input: {
  readonly stage: BranchOutputStageRecord;
  readonly admittedPayloadEvent?: BranchPayloadAdmittedEvent | null | undefined;
  readonly diagnosticRefs?: readonly string[] | undefined;
}): BranchOutputPublicationDecision {
  if (input.admittedPayloadEvent === null || input.admittedPayloadEvent === undefined) {
    return Object.freeze({
      kind: "branch_output_publication_decision",
      decision: "blocked_unadmitted",
      stageRef: input.stage.stageRef,
      branchRef: input.stage.branchRef,
      branchAttemptRef: input.stage.branchAttemptRef,
      visibleArtifactRefs: Object.freeze([]),
      evidenceRefs: input.stage.evidenceRefs,
      diagnosticRefs: freezeStringArray([
        ...freezeUniqueStrings(input.diagnosticRefs ?? EMPTY_STRING_ARRAY, "BranchOutputPublicationDecision.diagnosticRefs"),
        "missing_admitted_branch_payload"
      ])
    });
  }
  if (
    input.admittedPayloadEvent.branchRef !== input.stage.branchRef ||
    input.admittedPayloadEvent.branchAttemptRef !== input.stage.branchAttemptRef
  ) {
    return Object.freeze({
      kind: "branch_output_publication_decision",
      decision: "rejected_mismatch",
      stageRef: input.stage.stageRef,
      branchRef: input.stage.branchRef,
      branchAttemptRef: input.stage.branchAttemptRef,
      visibleArtifactRefs: Object.freeze([]),
      evidenceRefs: input.stage.evidenceRefs,
      diagnosticRefs: freezeStringArray([
        ...freezeUniqueStrings(input.diagnosticRefs ?? EMPTY_STRING_ARRAY, "BranchOutputPublicationDecision.diagnosticRefs"),
        "branch_payload_does_not_match_stage"
      ])
    });
  }
  return Object.freeze({
    kind: "branch_output_publication_decision",
    decision: "published",
    stageRef: input.stage.stageRef,
    branchRef: input.stage.branchRef,
    branchAttemptRef: input.stage.branchAttemptRef,
    visibleArtifactRefs: input.stage.stagedArtifactRefs,
    evidenceRefs: freezeUniqueSortedStrings(
      [
        ...input.stage.evidenceRefs,
        ...input.admittedPayloadEvent.evidenceRefs
      ],
      "BranchOutputPublicationDecision.evidenceRefs"
    ),
    diagnosticRefs: freezeStringArray(input.diagnosticRefs ?? EMPTY_STRING_ARRAY)
  });
}

export function derivePublicConstructionProgressProjection(input: {
  readonly projectionRef: string;
  readonly frontier: DependencyFrontierProjection;
  readonly dispatchedBranchRefs?: readonly string[] | undefined;
  readonly awaitingEvidenceBranchRefs?: readonly string[] | undefined;
  readonly awaitingHumanBranchRefs?: readonly string[] | undefined;
  readonly retryPendingBranchRefs?: readonly string[] | undefined;
  readonly compensatedBranchRefs?: readonly string[] | undefined;
  readonly blockedBranchRefs?: readonly string[] | undefined;
  readonly escalatedBranchRefs?: readonly string[] | undefined;
}): PublicConstructionProgressProjection {
  assertNonEmptyString(
    input.projectionRef,
    "PublicConstructionProgressProjection.projectionRef"
  );
  const overrides = {
    dispatchedBranchRefs: new Set(
      freezeUniqueSortedStrings(
        input.dispatchedBranchRefs ?? EMPTY_STRING_ARRAY,
        "PublicConstructionProgressProjection.dispatchedBranchRefs"
      )
    ),
    awaitingEvidenceBranchRefs: new Set(
      freezeUniqueSortedStrings(
        input.awaitingEvidenceBranchRefs ?? EMPTY_STRING_ARRAY,
        "PublicConstructionProgressProjection.awaitingEvidenceBranchRefs"
      )
    ),
    awaitingHumanBranchRefs: new Set(
      freezeUniqueSortedStrings(
        input.awaitingHumanBranchRefs ?? EMPTY_STRING_ARRAY,
        "PublicConstructionProgressProjection.awaitingHumanBranchRefs"
      )
    ),
    retryPendingBranchRefs: new Set(
      freezeUniqueSortedStrings(
        input.retryPendingBranchRefs ?? EMPTY_STRING_ARRAY,
        "PublicConstructionProgressProjection.retryPendingBranchRefs"
      )
    ),
    compensatedBranchRefs: new Set(
      freezeUniqueSortedStrings(
        input.compensatedBranchRefs ?? EMPTY_STRING_ARRAY,
        "PublicConstructionProgressProjection.compensatedBranchRefs"
      )
    ),
    blockedBranchRefs: new Set(
      freezeUniqueSortedStrings(
        input.blockedBranchRefs ?? EMPTY_STRING_ARRAY,
        "PublicConstructionProgressProjection.blockedBranchRefs"
      )
    ),
    escalatedBranchRefs: new Set(
      freezeUniqueSortedStrings(
        input.escalatedBranchRefs ?? EMPTY_STRING_ARRAY,
        "PublicConstructionProgressProjection.escalatedBranchRefs"
      )
    )
  };
  const rows = Object.freeze(
    input.frontier.rows.map((row) => {
      const branchRef = row.branchRef.branchRef;
      return Object.freeze({
        kind: "public_construction_progress_row",
        branchRef,
        state: progressStateForRow(row, overrides),
        fanInScopeRef: row.fanInScopeRef,
        parentBranchRefs: row.parentBranchRefs,
        writeTerritoryRefs: row.writeTerritoryRefs
      } satisfies PublicConstructionProgressRow);
    })
  );
  return Object.freeze({
    kind: "public_construction_progress_projection",
    projectionRef: input.projectionRef,
    frontierRef: input.frontier.frontierRef,
    rows,
    aggregateCounts: progressCounts(rows)
  });
}
