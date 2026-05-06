// Implements: T-119
// Implements: REQ-L-GTL3-GRAPHVECTOR-011
// Implements: REQ-R-ABG3-EVENTS-019
// Implements: REQ-R-ABG3-PROJECTION-014
// Implements: REQ-R-ABG3-PROJECTION-015

import type {
  DeadlineBreachAdmittedEvent,
  ExecutionBasis,
  RuntimeEvent,
  ScheduledContinuationReopenedEvent,
  TimerIntentAdmittedEvent,
  TimerOutcomeAdmittedEvent,
  TimerOutcomeKind
} from "./carriers.js";
import type {
  GraphVector,
  HookRef,
  SerializedAttrs,
  SerializedAttrValue
} from "../../../gtl/m01/contracts/carriers.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  type RuntimeEventCalculusProjection
} from "./event_calculus.js";
import {
  assertNonEmptyString,
  assertBasisEvent,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

export type TemporalConstraintAttachment =
  | "graph_vector"
  | "graph_function"
  | "job";

export type TemporalConstraintOperator = "not_before";

export const TEMPORAL_CONSTRAINT_VECTOR_ATTR_KEYS = Object.freeze([
  "abg.temporal_constraint"
] as const);

export const TEMPORAL_CONSTRAINT_CONFIG_KEY_VALUES = Object.freeze([
  "constraint_ref",
  "operator",
  "not_before_ref",
  "deadline_ref",
  "schedule_policy_ref",
  "timer_provider_ref",
  "deadline_breach_action"
] as const);

export type TemporalConstraintGtlSource = "graph_vector";

export interface TemporalContext {
  readonly kind: "temporal_context";
  readonly contextRef: string;
  readonly clockRef: string;
  readonly calendarRef: string;
  readonly timezoneId: string;
}

export interface TemporalConstraint {
  readonly kind: "temporal_constraint";
  readonly constraintRef: string;
  readonly operator: TemporalConstraintOperator;
  readonly attachment: TemporalConstraintAttachment;
  readonly graphFunctionId: string;
  readonly vectorIndex: number | null;
  readonly edge: string | null;
  readonly notBeforeRef: string;
  readonly deadlineRef: string | null;
  readonly schedulePolicyRef: string;
}

export interface SchedulePolicy {
  readonly kind: "schedule_policy";
  readonly schedulePolicyRef: string;
  readonly deadlineBreachAction:
    | "observe_drift"
    | "block"
    | "retry"
    | "human_gate"
    | "reprice";
  readonly timerProviderRef: string;
}

export interface TimerIntent {
  readonly kind: "timer_intent";
  readonly timerIntentRef: string;
  readonly constraintRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly providerRef: string;
  readonly notBeforeRef: string;
  readonly schedulePolicyRef: string;
}

export interface TimerOutcome {
  readonly kind: "timer_outcome";
  readonly timerOutcomeRef: string;
  readonly timerIntentRef: string;
  readonly constraintRef: string;
  readonly schedulePolicyRef: string;
  readonly outcome: TimerOutcomeKind;
  readonly providerRef: string;
  readonly providerReceiptRef: string;
}

export interface DeadlineBreach {
  readonly kind: "deadline_breach";
  readonly deadlineBreachRef: string;
  readonly constraintRef: string;
  readonly schedulePolicyRef: string;
  readonly deadlineRef: string;
  readonly deadlineBreachAction: SchedulePolicy["deadlineBreachAction"];
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly providerRef: string;
  readonly providerReceiptRef: string;
}

export interface ScheduledContinuation {
  readonly kind: "scheduled_continuation";
  readonly scheduledContinuationRef: string;
  readonly constraintRef: string;
  readonly timerIntentRef: string;
  readonly timerOutcomeRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly schedulePolicyRef: string;
  readonly providerRef: string;
}

export interface TemporalProjection {
  readonly kind: "temporal_projection";
  readonly basisId: string;
  readonly eligibleRows: readonly TemporalEligibilityProjectionRow[];
  readonly eligibleVectorIndexes: readonly number[];
  readonly pendingTimerIntentRefs: readonly string[];
  readonly firedTimerOutcomeRefs: readonly string[];
  readonly deadlineBreachRows: readonly DeadlineBreachProjectionRow[];
  readonly deadlineBreachedVectorIndexes: readonly number[];
  readonly deadlineBreachRefs: readonly string[];
  readonly scheduledContinuationRefs: readonly string[];
  readonly eventCalculus: RuntimeEventCalculusProjection;
}

export interface TemporalEligibilityProjectionRow {
  readonly kind: "temporal_eligibility_projection_row";
  readonly vectorIndex: number;
  readonly edge: string;
  readonly constraintRef: string;
  readonly timerIntentRef: string;
  readonly schedulePolicyRef: string;
}

export interface DeadlineBreachProjectionRow {
  readonly kind: "deadline_breach_projection_row";
  readonly vectorIndex: number;
  readonly edge: string;
  readonly deadlineBreachRef: string;
  readonly constraintRef: string;
  readonly schedulePolicyRef: string;
  readonly deadlineRef: string;
  readonly deadlineBreachAction: SchedulePolicy["deadlineBreachAction"];
  readonly providerRef: string;
  readonly providerReceiptRef: string;
}

export interface TemporalDriftObservation {
  readonly kind: "temporal_drift_observation";
  readonly observationRef: string;
  readonly schedulePolicyRef: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly reason: "eligible_not_closed" | "deadline_breached";
  readonly deadlineBreachAction: SchedulePolicy["deadlineBreachAction"] | null;
  readonly requiredRegime: "F_H";
}

export interface TemporalHomeostaticProjection {
  readonly kind: "temporal_homeostatic_projection";
  readonly basisId: string;
  readonly traversalComplete: boolean;
  readonly observations: readonly TemporalDriftObservation[];
}

export interface TemporalConstraintGtlResolution {
  readonly kind: "temporal_constraint_gtl_resolution";
  readonly source: TemporalConstraintGtlSource;
  readonly sourceRef: string;
  readonly attrKey: string;
  readonly hookRef: string;
  readonly constraint: TemporalConstraint;
  readonly policy: SchedulePolicy;
}

interface TemporalConstraintHookMatch {
  readonly source: TemporalConstraintGtlSource;
  readonly sourceRef: string;
  readonly attrKey: string;
  readonly hookRef: HookRef;
}

function assertAllowed<T extends string>(
  value: T,
  allowedValues: readonly T[],
  label: string
): void {
  if (!allowedValues.includes(value)) {
    throw new TypeError(`Unsupported ${label} ${JSON.stringify(value)}`);
  }
}

function sortNumbers(values: Iterable<number>): readonly number[] {
  return Object.freeze([...values].sort((left, right) => left - right));
}

function sortStrings(values: Iterable<string>): readonly string[] {
  return freezeStringArray([...values].sort());
}

function sortEligibilityRows(
  rows: Iterable<TemporalEligibilityProjectionRow>
): readonly TemporalEligibilityProjectionRow[] {
  return Object.freeze(
    [...rows].sort((left, right) =>
      [
        left.vectorIndex,
        left.constraintRef,
        left.timerIntentRef,
        left.schedulePolicyRef
      ].join("\u0000").localeCompare(
        [
          right.vectorIndex,
          right.constraintRef,
          right.timerIntentRef,
          right.schedulePolicyRef
        ].join("\u0000")
      )
    )
  );
}

function sortDeadlineBreachRows(
  rows: Iterable<DeadlineBreachProjectionRow>
): readonly DeadlineBreachProjectionRow[] {
  return Object.freeze(
    [...rows].sort((left, right) =>
      [
        left.vectorIndex,
        left.deadlineBreachRef,
        left.constraintRef,
        left.schedulePolicyRef,
        left.deadlineRef
      ].join("\u0000").localeCompare(
        [
          right.vectorIndex,
          right.deadlineBreachRef,
          right.constraintRef,
          right.schedulePolicyRef,
          right.deadlineRef
        ].join("\u0000")
      )
    )
  );
}

function attrValueForKey(
  attrs: SerializedAttrs,
  key: string
): SerializedAttrValue | null {
  const matching = attrs.entries.filter((entry) => entry.key === key);
  if (matching.length > 1) {
    throw new TypeError(`Duplicate GTL attr ${JSON.stringify(key)}`);
  }
  const entry = matching[0];
  return entry?.value ?? null;
}

function configScalarString(
  attrs: SerializedAttrs,
  key: string,
  label: string
): string {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    throw new TypeError(`${label} requires ${key}`);
  }
  if (value.kind !== "scalar" || typeof value.value !== "string") {
    throw new TypeError(`${label}.${key} must be a scalar string`);
  }
  assertNonEmptyString(value.value, `${label}.${key}`);
  return value.value;
}

function optionalConfigScalarString(
  attrs: SerializedAttrs,
  key: string,
  label: string
): string | null {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    return null;
  }
  if (value.kind !== "scalar" || typeof value.value !== "string") {
    throw new TypeError(`${label}.${key} must be a scalar string`);
  }
  assertNonEmptyString(value.value, `${label}.${key}`);
  return value.value;
}

function parseTemporalOperator(value: string): TemporalConstraintOperator {
  if (value !== "not_before") {
    throw new TypeError(`Unsupported temporal constraint operator ${JSON.stringify(value)}`);
  }
  return value;
}

function parseDeadlineBreachAction(
  value: string
): SchedulePolicy["deadlineBreachAction"] {
  switch (value) {
    case "observe_drift":
    case "block":
    case "retry":
    case "human_gate":
    case "reprice":
      return value;
    default:
      throw new TypeError(`Unsupported deadline breach action ${JSON.stringify(value)}`);
  }
}

function temporalConstraintHookMatch(input: {
  readonly vector: GraphVector;
}): TemporalConstraintHookMatch | null {
  const matches = input.vector.declarations.entries.filter((entry) =>
    TEMPORAL_CONSTRAINT_VECTOR_ATTR_KEYS.some((key) => key === entry.key)
  );
  if (matches.length > 1) {
    throw new TypeError("Duplicate temporal constraint qualifier at graph_vector");
  }
  const match = matches[0];
  if (match === undefined) {
    return null;
  }
  if (match.value.kind !== "hook_ref") {
    throw new TypeError("Temporal constraint qualifier must be a hook_ref");
  }
  assertNonEmptyString(match.value.value.ref, "TemporalConstraint HookRef.ref");
  return Object.freeze({
    source: "graph_vector",
    sourceRef: input.vector.id,
    attrKey: match.key,
    hookRef: match.value.value
  } satisfies TemporalConstraintHookMatch);
}

function assertVectorMatchesBasis(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly vector: GraphVector;
}): void {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const basisVector = input.basis.graph.vectors[input.vectorIndex];
  if (basisVector === undefined || basisVector.id !== input.vector.id) {
    throw new TypeError("Temporal GTL constraint vector must match ExecutionBasis vector");
  }
}

function assertTemporalConstraint(
  basis: ExecutionBasis,
  constraint: TemporalConstraint
): void {
  assertNonEmptyString(constraint.constraintRef, "TemporalConstraint.constraintRef");
  assertAllowed(
    constraint.operator,
    Object.freeze(["not_before"] as const),
    "temporal constraint operator"
  );
  assertAllowed(
    constraint.attachment,
    Object.freeze(["graph_vector", "graph_function", "job"] as const),
    "temporal constraint attachment"
  );
  assertNonEmptyString(constraint.graphFunctionId, "TemporalConstraint.graphFunctionId");
  assertNonEmptyString(constraint.notBeforeRef, "TemporalConstraint.notBeforeRef");
  if (constraint.deadlineRef !== null) {
    assertNonEmptyString(constraint.deadlineRef, "TemporalConstraint.deadlineRef");
  }
  assertNonEmptyString(
    constraint.schedulePolicyRef,
    "TemporalConstraint.schedulePolicyRef"
  );
  if (constraint.graphFunctionId !== basis.graphFunction.id) {
    throw new TypeError("TemporalConstraint must belong to the graph function");
  }
  if (constraint.attachment === "graph_vector") {
    if (constraint.vectorIndex === null) {
      throw new TypeError("Graph-vector temporal constraint requires vectorIndex");
    }
    assertVectorIndexInRange(basis, constraint.vectorIndex);
    if (constraint.edge !== vectorEdge(basis, constraint.vectorIndex)) {
      throw new TypeError("Graph-vector temporal constraint edge must match vector");
    }
  }
}

export function constructTemporalContext(input: {
  readonly contextRef: string;
  readonly clockRef: string;
  readonly calendarRef: string;
  readonly timezoneId: string;
}): TemporalContext {
  assertNonEmptyString(input.contextRef, "TemporalContext.contextRef");
  assertNonEmptyString(input.clockRef, "TemporalContext.clockRef");
  assertNonEmptyString(input.calendarRef, "TemporalContext.calendarRef");
  assertNonEmptyString(input.timezoneId, "TemporalContext.timezoneId");
  return Object.freeze({
    kind: "temporal_context",
    contextRef: input.contextRef,
    clockRef: input.clockRef,
    calendarRef: input.calendarRef,
    timezoneId: input.timezoneId
  } satisfies TemporalContext);
}

export function constructSchedulePolicy(input: {
  readonly schedulePolicyRef: string;
  readonly deadlineBreachAction?: SchedulePolicy["deadlineBreachAction"] | undefined;
  readonly timerProviderRef: string;
}): SchedulePolicy {
  assertNonEmptyString(input.schedulePolicyRef, "SchedulePolicy.schedulePolicyRef");
  assertNonEmptyString(input.timerProviderRef, "SchedulePolicy.timerProviderRef");
  const deadlineBreachAction = input.deadlineBreachAction ?? "observe_drift";
  assertAllowed(
    deadlineBreachAction,
    Object.freeze(["observe_drift", "block", "retry", "human_gate", "reprice"] as const),
    "deadline breach action"
  );
  return Object.freeze({
    kind: "schedule_policy",
    schedulePolicyRef: input.schedulePolicyRef,
    deadlineBreachAction,
    timerProviderRef: input.timerProviderRef
  } satisfies SchedulePolicy);
}

export function constructNotBeforeConstraint(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly constraintRef: string;
  readonly notBeforeRef: string;
  readonly deadlineRef?: string | null | undefined;
  readonly schedulePolicyRef: string;
}): TemporalConstraint {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const constraint = Object.freeze({
    kind: "temporal_constraint",
    constraintRef: input.constraintRef,
    operator: "not_before",
    attachment: "graph_vector",
    graphFunctionId: input.basis.graphFunction.id,
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    notBeforeRef: input.notBeforeRef,
    deadlineRef: input.deadlineRef ?? null,
    schedulePolicyRef: input.schedulePolicyRef
  } satisfies TemporalConstraint);
  assertTemporalConstraint(input.basis, constraint);
  return constraint;
}

export function tryDeriveTemporalConstraintFromGtl(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly vector: GraphVector;
}): TemporalConstraintGtlResolution | null {
  assertVectorMatchesBasis(input);
  const match = temporalConstraintHookMatch({ vector: input.vector });
  if (match === null) {
    return null;
  }
  const config = match.hookRef.config;
  const operator = parseTemporalOperator(
    configScalarString(config, "operator", "TemporalConstraintGtl")
  );
  const constraint = constructNotBeforeConstraint({
    basis: input.basis,
    vectorIndex: input.vectorIndex,
    constraintRef: configScalarString(
      config,
      "constraint_ref",
      "TemporalConstraintGtl"
    ),
    notBeforeRef: configScalarString(
      config,
      "not_before_ref",
      "TemporalConstraintGtl"
    ),
    deadlineRef: optionalConfigScalarString(
      config,
      "deadline_ref",
      "TemporalConstraintGtl"
    ),
    schedulePolicyRef: configScalarString(
      config,
      "schedule_policy_ref",
      "TemporalConstraintGtl"
    )
  });
  const policy = constructSchedulePolicy({
    schedulePolicyRef: constraint.schedulePolicyRef,
    deadlineBreachAction: parseDeadlineBreachAction(
      configScalarString(
        config,
        "deadline_breach_action",
        "TemporalConstraintGtl"
      )
    ),
    timerProviderRef: configScalarString(
      config,
      "timer_provider_ref",
      "TemporalConstraintGtl"
    )
  });
  return Object.freeze({
    kind: "temporal_constraint_gtl_resolution",
    source: match.source,
    sourceRef: match.sourceRef,
    attrKey: match.attrKey,
    hookRef: match.hookRef.ref,
    constraint: Object.freeze({ ...constraint, operator }),
    policy
  } satisfies TemporalConstraintGtlResolution);
}

export function deriveTemporalConstraintFromGtl(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly vector: GraphVector;
}): TemporalConstraintGtlResolution {
  const resolution = tryDeriveTemporalConstraintFromGtl(input);
  if (resolution === null) {
    throw new TypeError(
      "Temporal constraint requires a GTL temporal constraint qualifier"
    );
  }
  return resolution;
}

export function constructTimerIntent(input: {
  readonly basis: ExecutionBasis;
  readonly constraint: TemporalConstraint;
  readonly policy: SchedulePolicy;
  readonly timerIntentRef?: string | undefined;
}): TimerIntent {
  assertTemporalConstraint(input.basis, input.constraint);
  if (input.constraint.attachment !== "graph_vector" || input.constraint.vectorIndex === null) {
    throw new TypeError("TimerIntent first slice requires graph-vector constraint");
  }
  if (input.constraint.schedulePolicyRef !== input.policy.schedulePolicyRef) {
    throw new TypeError("TimerIntent requires matching schedule policy");
  }
  return Object.freeze({
    kind: "timer_intent",
    timerIntentRef:
      input.timerIntentRef ??
      [
        "timer_intent",
        input.basis.id,
        input.constraint.constraintRef,
        input.constraint.notBeforeRef
      ].join(":"),
    constraintRef: input.constraint.constraintRef,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.constraint.vectorIndex,
    edge: vectorEdge(input.basis, input.constraint.vectorIndex),
    providerRef: input.policy.timerProviderRef,
    notBeforeRef: input.constraint.notBeforeRef,
    schedulePolicyRef: input.policy.schedulePolicyRef
  } satisfies TimerIntent);
}

export function constructTimerIntentAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly timerIntent: TimerIntent;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): TimerIntentAdmittedEvent {
  assertVectorIndexInRange(input.basis, input.timerIntent.vectorIndex);
  return Object.freeze({
    kind: "timer_intent_admitted",
    basisId: input.basis.id,
    graphCallId: input.timerIntent.graphCallId,
    frameId: input.timerIntent.frameId,
    frameLineageId: input.basis.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.timerIntent.vectorIndex,
    edge: input.timerIntent.edge,
    constraintRef: input.timerIntent.constraintRef,
    timerIntentRef: input.timerIntent.timerIntentRef,
    providerRef: input.timerIntent.providerRef,
    notBeforeRef: input.timerIntent.notBeforeRef,
    schedulePolicyRef: input.timerIntent.schedulePolicyRef,
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId ?? input.timerIntent.timerIntentRef
  } satisfies TimerIntentAdmittedEvent);
}

export function constructTimerOutcome(input: {
  readonly timerIntent: TimerIntent;
  readonly outcome: TimerOutcomeKind;
  readonly timerOutcomeRef?: string | undefined;
  readonly providerReceiptRef: string;
}): TimerOutcome {
  assertAllowed(
    input.outcome,
    Object.freeze(["timer_fired", "timer_cancelled", "timer_missed"] as const),
    "timer outcome"
  );
  assertNonEmptyString(input.providerReceiptRef, "TimerOutcome.providerReceiptRef");
  return Object.freeze({
    kind: "timer_outcome",
    timerOutcomeRef:
      input.timerOutcomeRef ??
      [
        "timer_outcome",
        input.timerIntent.timerIntentRef,
        input.outcome,
        input.providerReceiptRef
      ].join(":"),
    timerIntentRef: input.timerIntent.timerIntentRef,
    constraintRef: input.timerIntent.constraintRef,
    schedulePolicyRef: input.timerIntent.schedulePolicyRef,
    outcome: input.outcome,
    providerRef: input.timerIntent.providerRef,
    providerReceiptRef: input.providerReceiptRef
  } satisfies TimerOutcome);
}

export function constructDeadlineBreach(input: {
  readonly basis: ExecutionBasis;
  readonly constraint: TemporalConstraint;
  readonly policy: SchedulePolicy;
  readonly deadlineBreachRef?: string | undefined;
  readonly providerReceiptRef: string;
}): DeadlineBreach {
  assertTemporalConstraint(input.basis, input.constraint);
  if (input.constraint.attachment !== "graph_vector" || input.constraint.vectorIndex === null) {
    throw new TypeError("DeadlineBreach first slice requires graph-vector constraint");
  }
  if (input.constraint.deadlineRef === null) {
    throw new TypeError("DeadlineBreach requires TemporalConstraint.deadlineRef");
  }
  if (input.constraint.schedulePolicyRef !== input.policy.schedulePolicyRef) {
    throw new TypeError("DeadlineBreach requires matching schedule policy");
  }
  assertNonEmptyString(
    input.providerReceiptRef,
    "DeadlineBreach.providerReceiptRef"
  );
  return Object.freeze({
    kind: "deadline_breach",
    deadlineBreachRef:
      input.deadlineBreachRef ??
      [
        "deadline_breach",
        input.basis.id,
        input.constraint.constraintRef,
        input.constraint.deadlineRef
      ].join(":"),
    constraintRef: input.constraint.constraintRef,
    schedulePolicyRef: input.policy.schedulePolicyRef,
    deadlineRef: input.constraint.deadlineRef,
    deadlineBreachAction: input.policy.deadlineBreachAction,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.constraint.vectorIndex,
    edge: vectorEdge(input.basis, input.constraint.vectorIndex),
    providerRef: input.policy.timerProviderRef,
    providerReceiptRef: input.providerReceiptRef
  } satisfies DeadlineBreach);
}

export function constructDeadlineBreachAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly deadlineBreach: DeadlineBreach;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): DeadlineBreachAdmittedEvent {
  assertVectorIndexInRange(input.basis, input.deadlineBreach.vectorIndex);
  return Object.freeze({
    kind: "deadline_breach_admitted",
    basisId: input.basis.id,
    graphCallId: input.deadlineBreach.graphCallId,
    frameId: input.deadlineBreach.frameId,
    frameLineageId: input.basis.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.deadlineBreach.vectorIndex,
    edge: input.deadlineBreach.edge,
    deadlineBreachRef: input.deadlineBreach.deadlineBreachRef,
    constraintRef: input.deadlineBreach.constraintRef,
    schedulePolicyRef: input.deadlineBreach.schedulePolicyRef,
    deadlineRef: input.deadlineBreach.deadlineRef,
    deadlineBreachAction: input.deadlineBreach.deadlineBreachAction,
    providerRef: input.deadlineBreach.providerRef,
    providerReceiptRef: input.deadlineBreach.providerReceiptRef,
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId ?? input.deadlineBreach.deadlineBreachRef
  } satisfies DeadlineBreachAdmittedEvent);
}

export function constructTimerOutcomeAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly timerIntent: TimerIntent;
  readonly timerOutcome: TimerOutcome;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): TimerOutcomeAdmittedEvent {
  assertVectorIndexInRange(input.basis, input.timerIntent.vectorIndex);
  return Object.freeze({
    kind: "timer_outcome_admitted",
    basisId: input.basis.id,
    graphCallId: input.timerIntent.graphCallId,
    frameId: input.timerIntent.frameId,
    frameLineageId: input.basis.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.timerIntent.vectorIndex,
    edge: input.timerIntent.edge,
    constraintRef: input.timerOutcome.constraintRef,
    schedulePolicyRef: input.timerOutcome.schedulePolicyRef,
    timerIntentRef: input.timerOutcome.timerIntentRef,
    timerOutcomeRef: input.timerOutcome.timerOutcomeRef,
    outcome: input.timerOutcome.outcome,
    providerRef: input.timerOutcome.providerRef,
    providerReceiptRef: input.timerOutcome.providerReceiptRef,
    causationEventRefs: freezeStringArray(
      input.causationEventRefs ?? [input.timerIntent.timerIntentRef]
    ),
    correlationId: input.correlationId ?? input.timerOutcome.timerOutcomeRef
  } satisfies TimerOutcomeAdmittedEvent);
}

export function constructScheduledContinuation(input: {
  readonly basis: ExecutionBasis;
  readonly timerIntent: TimerIntent;
  readonly timerOutcome: TimerOutcome;
  readonly scheduledContinuationRef?: string | undefined;
}): ScheduledContinuation {
  if (input.timerOutcome.outcome !== "timer_fired") {
    throw new TypeError("ScheduledContinuation requires timer_fired outcome");
  }
  return Object.freeze({
    kind: "scheduled_continuation",
    scheduledContinuationRef:
      input.scheduledContinuationRef ??
      [
        "scheduled_continuation",
        input.timerIntent.timerIntentRef,
        input.timerOutcome.timerOutcomeRef
      ].join(":"),
    constraintRef: input.timerIntent.constraintRef,
    timerIntentRef: input.timerIntent.timerIntentRef,
    timerOutcomeRef: input.timerOutcome.timerOutcomeRef,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId: input.timerIntent.graphCallId,
    frameId: input.timerIntent.frameId,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.timerIntent.vectorIndex,
    edge: input.timerIntent.edge,
    schedulePolicyRef: input.timerIntent.schedulePolicyRef,
    providerRef: input.timerIntent.providerRef
  } satisfies ScheduledContinuation);
}

export function constructScheduledContinuationReopenedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly scheduledContinuation: ScheduledContinuation;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): ScheduledContinuationReopenedEvent {
  assertVectorIndexInRange(input.basis, input.scheduledContinuation.vectorIndex);
  return Object.freeze({
    kind: "scheduled_continuation_reopened",
    basisId: input.basis.id,
    graphCallId: input.scheduledContinuation.graphCallId,
    frameId: input.scheduledContinuation.frameId,
    frameLineageId: input.basis.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.scheduledContinuation.vectorIndex,
    edge: input.scheduledContinuation.edge,
    scheduledContinuationRef: input.scheduledContinuation.scheduledContinuationRef,
    constraintRef: input.scheduledContinuation.constraintRef,
    schedulePolicyRef: input.scheduledContinuation.schedulePolicyRef,
    timerIntentRef: input.scheduledContinuation.timerIntentRef,
    timerOutcomeRef: input.scheduledContinuation.timerOutcomeRef,
    providerRef: input.scheduledContinuation.providerRef,
    causationEventRefs: freezeStringArray(
      input.causationEventRefs ?? [input.scheduledContinuation.timerOutcomeRef]
    ),
    correlationId:
      input.correlationId ?? input.scheduledContinuation.scheduledContinuationRef
  } satisfies ScheduledContinuationReopenedEvent);
}

export function temporalEligibleRuntimeFluent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly constraintRef: string;
  readonly timerIntentRef: string;
  readonly schedulePolicyRef: string;
}): ReturnType<typeof constructRuntimeFluent> {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  return constructRuntimeFluent({
    name: "temporal_eligible",
    scope: "vector",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    constraintRef: input.constraintRef,
    timerIntentRef: input.timerIntentRef,
    schedulePolicyRef: input.schedulePolicyRef
  });
}

export function deriveTemporalProjection(input: {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
}): TemporalProjection {
  const eventCalculus = deriveRuntimeEventCalculusProjection({
    basis: input.basis,
    events: input.events,
    undeclaredEventBehavior: "ignore"
  });
  const eligibleRows = new Map<string, TemporalEligibilityProjectionRow>();
  const deadlineBreachRows = new Map<string, DeadlineBreachProjectionRow>();
  const eligibleVectorIndexes = new Set<number>();
  const deadlineBreachedVectorIndexes = new Set<number>();
  const pendingTimerIntentRefs = new Set<string>();
  const firedTimerOutcomeRefs = new Set<string>();
  const deadlineBreachRefs = new Set<string>();
  const scheduledContinuationRefs = new Set<string>();
  for (const fluent of eventCalculus.holds) {
    if (fluent.name === "temporal_eligible" && fluent.vectorIndex !== null) {
      eligibleVectorIndexes.add(fluent.vectorIndex);
      if (
        fluent.edge !== null &&
        fluent.constraintRef !== null &&
        fluent.timerIntentRef !== null &&
        fluent.schedulePolicyRef !== null
      ) {
        const row = Object.freeze({
          kind: "temporal_eligibility_projection_row",
          vectorIndex: fluent.vectorIndex,
          edge: fluent.edge,
          constraintRef: fluent.constraintRef,
          timerIntentRef: fluent.timerIntentRef,
          schedulePolicyRef: fluent.schedulePolicyRef
        } satisfies TemporalEligibilityProjectionRow);
        eligibleRows.set(
          [
            row.vectorIndex,
            row.constraintRef,
            row.timerIntentRef,
            row.schedulePolicyRef
          ].join("\u0000"),
          row
        );
      }
    }
    if (
      fluent.name === "temporal_timer_pending" &&
      fluent.timerIntentRef !== null
    ) {
      pendingTimerIntentRefs.add(fluent.timerIntentRef);
    }
    if (fluent.name === "temporal_timer_fired" && fluent.timerOutcomeRef !== null) {
      firedTimerOutcomeRefs.add(fluent.timerOutcomeRef);
    }
    if (
      fluent.name === "temporal_deadline_breached" &&
      fluent.vectorIndex !== null
    ) {
      deadlineBreachedVectorIndexes.add(fluent.vectorIndex);
      if (fluent.ref !== null) {
        deadlineBreachRefs.add(fluent.ref);
      }
    }
    if (fluent.name === "scheduled_continuation_open" && fluent.ref !== null) {
      scheduledContinuationRefs.add(fluent.ref);
    }
  }
  for (const event of input.events) {
    if (event.kind !== "deadline_breach_admitted") {
      continue;
    }
    assertBasisEvent(input.basis, event);
    assertVectorIndexInRange(input.basis, event.vectorIndex);
    if (event.edge !== vectorEdge(input.basis, event.vectorIndex)) {
      throw new TypeError("Temporal projection rejects deadline breach edge outside basis vector");
    }
    if (!deadlineBreachRefs.has(event.deadlineBreachRef)) {
      continue;
    }
    if (deadlineBreachRows.has(event.deadlineBreachRef)) {
      throw new TypeError(
        `Temporal projection rejects duplicate deadline breach ref ${JSON.stringify(event.deadlineBreachRef)}`
      );
    }
    deadlineBreachRows.set(
      event.deadlineBreachRef,
      Object.freeze({
        kind: "deadline_breach_projection_row",
        vectorIndex: event.vectorIndex,
        edge: event.edge,
        deadlineBreachRef: event.deadlineBreachRef,
        constraintRef: event.constraintRef,
        schedulePolicyRef: event.schedulePolicyRef,
        deadlineRef: event.deadlineRef,
        deadlineBreachAction: event.deadlineBreachAction,
        providerRef: event.providerRef,
        providerReceiptRef: event.providerReceiptRef
      } satisfies DeadlineBreachProjectionRow)
    );
  }
  return Object.freeze({
    kind: "temporal_projection",
    basisId: input.basis.id,
    eligibleRows: sortEligibilityRows(eligibleRows.values()),
    eligibleVectorIndexes: sortNumbers(eligibleVectorIndexes),
    pendingTimerIntentRefs: sortStrings(pendingTimerIntentRefs),
    firedTimerOutcomeRefs: sortStrings(firedTimerOutcomeRefs),
    deadlineBreachRows: sortDeadlineBreachRows(deadlineBreachRows.values()),
    deadlineBreachedVectorIndexes: sortNumbers(deadlineBreachedVectorIndexes),
    deadlineBreachRefs: sortStrings(deadlineBreachRefs),
    scheduledContinuationRefs: sortStrings(scheduledContinuationRefs),
    eventCalculus
  } satisfies TemporalProjection);
}

export function temporalProjectionHoldsEligibility(input: {
  readonly projection: TemporalProjection;
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly constraintRef: string;
  readonly timerIntentRef: string;
  readonly schedulePolicyRef: string;
}): boolean {
  return holdsAt(
    input.projection.eventCalculus,
    temporalEligibleRuntimeFluent({
      basis: input.basis,
      vectorIndex: input.vectorIndex,
      constraintRef: input.constraintRef,
      timerIntentRef: input.timerIntentRef,
      schedulePolicyRef: input.schedulePolicyRef
    })
  );
}

export function deriveTemporalHomeostaticProjection(input: {
  readonly basis: ExecutionBasis;
  readonly temporalProjection: TemporalProjection;
  readonly closedVectorIndexes: readonly number[];
  readonly schedulePolicyRef: string;
  readonly schedulePolicy?: SchedulePolicy | undefined;
}): TemporalHomeostaticProjection {
  if (input.temporalProjection.basisId !== input.basis.id) {
    throw new TypeError("Temporal homeostatic projection requires matching basis");
  }
  if (
    input.schedulePolicy !== undefined &&
    input.schedulePolicy.schedulePolicyRef !== input.schedulePolicyRef
  ) {
    throw new TypeError("Temporal homeostatic projection requires matching schedule policy");
  }
  const closed = new Set(input.closedVectorIndexes);
  const observations: TemporalDriftObservation[] = [];
  for (const row of input.temporalProjection.eligibleRows) {
    if (
      row.schedulePolicyRef === input.schedulePolicyRef &&
      !closed.has(row.vectorIndex)
    ) {
      observations.push(
        Object.freeze({
          kind: "temporal_drift_observation",
          observationRef: [
            "temporal_drift",
            input.basis.id,
            String(row.vectorIndex),
            row.schedulePolicyRef
          ].join(":"),
          schedulePolicyRef: row.schedulePolicyRef,
          vectorIndex: row.vectorIndex,
          edge: row.edge,
          reason: "eligible_not_closed",
          deadlineBreachAction: null,
          requiredRegime: "F_H"
        } satisfies TemporalDriftObservation)
      );
    }
  }
  for (const row of input.temporalProjection.deadlineBreachRows) {
    if (
      row.schedulePolicyRef === input.schedulePolicyRef &&
      !closed.has(row.vectorIndex)
    ) {
      observations.push(
        Object.freeze({
          kind: "temporal_drift_observation",
          observationRef: [
            "temporal_deadline_breached",
            input.basis.id,
            String(row.vectorIndex),
            row.schedulePolicyRef,
            row.deadlineBreachRef
          ].join(":"),
          schedulePolicyRef: row.schedulePolicyRef,
          vectorIndex: row.vectorIndex,
          edge: row.edge,
          reason: "deadline_breached",
          deadlineBreachAction: row.deadlineBreachAction,
          requiredRegime: "F_H"
        } satisfies TemporalDriftObservation)
      );
    }
  }
  return Object.freeze({
    kind: "temporal_homeostatic_projection",
    basisId: input.basis.id,
    traversalComplete: input.closedVectorIndexes.length === input.basis.graph.vectors.length,
    observations: Object.freeze(observations)
  } satisfies TemporalHomeostaticProjection);
}
