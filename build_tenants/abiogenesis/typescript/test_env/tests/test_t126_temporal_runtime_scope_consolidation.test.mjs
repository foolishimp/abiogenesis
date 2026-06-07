// Validates: T-126
// Validates: REQ-R-ABG3-PROJECTION-014
// Validates: REQ-R-ABG3-PROJECTION-015

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  constructDeadlineBreach,
  constructDeadlineBreachAdmittedEvent,
  constructNotBeforeConstraint,
  constructSchedulePolicy,
  constructScheduledContinuation,
  constructScheduledContinuationReopenedEvent,
  constructTimerIntent,
  constructTimerIntentAdmittedEvent,
  constructTimerOutcome,
  constructTimerOutcomeAdmittedEvent,
  deriveTemporalHomeostaticProjection,
  deriveTemporalProjection
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function vectorEdge(basis, vectorIndex) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.notEqual(vector, undefined);
  return vector.name;
}

function runtimeScope(basis, vectorIndex) {
  return Object.freeze({
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    graphCallId: `graph-call:${basis.id}`,
    frameId: basis.frameId ?? `frame:${basis.id}:root`,
    runId: basis.runId,
    workKey: basis.workKey,
    vectorIndex,
    edge: vectorEdge(basis, vectorIndex)
  });
}

function eventScope(basis, vectorIndex) {
  return Object.freeze({
    ...runtimeScope(basis, vectorIndex),
    frameLineageId: basis.frameLineageId
  });
}

function temporalFixture() {
  const basis = buildThreeStageBasis();
  const policy = constructSchedulePolicy({
    schedulePolicyRef: "schedule-policy://t126/scope",
    deadlineBreachAction: "human_gate",
    timerProviderRef: "timer-provider://t126/stub"
  });
  const constraint = constructNotBeforeConstraint({
    basis,
    vectorIndex: 0,
    constraintRef: "temporal-constraint://t126/scope/0",
    notBeforeRef: "instant://2026-06-07T00:00:00Z",
    deadlineRef: "instant://2026-06-07T01:00:00Z",
    schedulePolicyRef: policy.schedulePolicyRef
  });
  const intent = constructTimerIntent({ basis, constraint, policy });
  const outcome = constructTimerOutcome({
    timerIntent: intent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://t126/fired"
  });
  const deadlineBreach = constructDeadlineBreach({
    basis,
    constraint,
    policy,
    providerReceiptRef: "provider-receipt://t126/deadline"
  });
  const scheduledContinuation = constructScheduledContinuation({
    basis,
    timerIntent: intent,
    timerOutcome: outcome
  });
  return Object.freeze({
    basis,
    policy,
    constraint,
    intent,
    outcome,
    deadlineBreach,
    scheduledContinuation
  });
}

function tamper(carrier, changes) {
  return Object.freeze({
    ...carrier,
    ...changes
  });
}

test("T-126 temporal carriers and admitted events preserve exact runtime-scope output", () => {
  const {
    basis,
    policy,
    constraint,
    intent,
    outcome,
    deadlineBreach,
    scheduledContinuation
  } = temporalFixture();
  const scope = runtimeScope(basis, 0);
  const admittedIntent = constructTimerIntentAdmittedEvent({
    basis,
    timerIntent: intent
  });
  const admittedOutcome = constructTimerOutcomeAdmittedEvent({
    basis,
    timerIntent: intent,
    timerOutcome: outcome
  });
  const admittedDeadline = constructDeadlineBreachAdmittedEvent({
    basis,
    deadlineBreach
  });
  const reopened = constructScheduledContinuationReopenedEvent({
    basis,
    scheduledContinuation
  });

  assert.deepEqual(intent, {
    kind: "timer_intent",
    timerIntentRef: [
      "timer_intent",
      basis.id,
      constraint.constraintRef,
      constraint.notBeforeRef
    ].join(":"),
    constraintRef: constraint.constraintRef,
    ...scope,
    providerRef: policy.timerProviderRef,
    notBeforeRef: constraint.notBeforeRef,
    schedulePolicyRef: policy.schedulePolicyRef
  });
  assert.deepEqual(deadlineBreach, {
    kind: "deadline_breach",
    deadlineBreachRef: [
      "deadline_breach",
      basis.id,
      constraint.constraintRef,
      constraint.deadlineRef
    ].join(":"),
    constraintRef: constraint.constraintRef,
    schedulePolicyRef: policy.schedulePolicyRef,
    deadlineRef: constraint.deadlineRef,
    deadlineBreachAction: "human_gate",
    ...scope,
    providerRef: policy.timerProviderRef,
    providerReceiptRef: "provider-receipt://t126/deadline"
  });
  assert.deepEqual(scheduledContinuation, {
    kind: "scheduled_continuation",
    scheduledContinuationRef: [
      "scheduled_continuation",
      intent.timerIntentRef,
      outcome.timerOutcomeRef
    ].join(":"),
    constraintRef: constraint.constraintRef,
    timerIntentRef: intent.timerIntentRef,
    timerOutcomeRef: outcome.timerOutcomeRef,
    ...scope,
    schedulePolicyRef: policy.schedulePolicyRef,
    providerRef: policy.timerProviderRef
  });
  assert.deepEqual(admittedIntent, {
    kind: "timer_intent_admitted",
    ...eventScope(basis, 0),
    constraintRef: constraint.constraintRef,
    timerIntentRef: intent.timerIntentRef,
    providerRef: policy.timerProviderRef,
    notBeforeRef: constraint.notBeforeRef,
    schedulePolicyRef: policy.schedulePolicyRef,
    causationEventRefs: [],
    correlationId: intent.timerIntentRef
  });
  assert.deepEqual(admittedOutcome, {
    kind: "timer_outcome_admitted",
    ...eventScope(basis, 0),
    constraintRef: constraint.constraintRef,
    schedulePolicyRef: policy.schedulePolicyRef,
    timerIntentRef: intent.timerIntentRef,
    timerOutcomeRef: outcome.timerOutcomeRef,
    outcome: "timer_fired",
    providerRef: policy.timerProviderRef,
    providerReceiptRef: "provider-receipt://t126/fired",
    causationEventRefs: [intent.timerIntentRef],
    correlationId: outcome.timerOutcomeRef
  });
  assert.deepEqual(admittedDeadline, {
    kind: "deadline_breach_admitted",
    ...eventScope(basis, 0),
    deadlineBreachRef: deadlineBreach.deadlineBreachRef,
    constraintRef: constraint.constraintRef,
    schedulePolicyRef: policy.schedulePolicyRef,
    deadlineRef: constraint.deadlineRef,
    deadlineBreachAction: "human_gate",
    providerRef: policy.timerProviderRef,
    providerReceiptRef: "provider-receipt://t126/deadline",
    causationEventRefs: [],
    correlationId: deadlineBreach.deadlineBreachRef
  });
  assert.deepEqual(reopened, {
    kind: "scheduled_continuation_reopened",
    ...eventScope(basis, 0),
    scheduledContinuationRef: scheduledContinuation.scheduledContinuationRef,
    constraintRef: constraint.constraintRef,
    schedulePolicyRef: policy.schedulePolicyRef,
    timerIntentRef: intent.timerIntentRef,
    timerOutcomeRef: outcome.timerOutcomeRef,
    providerRef: policy.timerProviderRef,
    causationEventRefs: [scheduledContinuation.timerOutcomeRef],
    correlationId: scheduledContinuation.scheduledContinuationRef
  });
});

test("T-126 temporal constructors reject contradictory runtime-scope carriers", () => {
  const {
    basis,
    intent,
    outcome,
    deadlineBreach,
    scheduledContinuation
  } = temporalFixture();

  assert.throws(
    () =>
      constructTimerIntentAdmittedEvent({
        basis,
        timerIntent: tamper(intent, { graphCallId: "graph-call://wrong" })
      }),
    /graphCallId contradicts temporal runtime scope/u
  );

  assert.throws(
    () =>
      constructTimerOutcomeAdmittedEvent({
        basis,
        timerIntent: tamper(intent, { frameId: "frame://wrong" }),
        timerOutcome: outcome
      }),
    /frameId contradicts temporal runtime scope/u
  );

  assert.throws(
    () =>
      constructDeadlineBreachAdmittedEvent({
        basis,
        deadlineBreach: tamper(deadlineBreach, { edge: "wrong_source->wrong_target" })
      }),
    /edge contradicts temporal runtime scope/u
  );

  assert.throws(
    () =>
      constructScheduledContinuation({
        basis,
        timerIntent: tamper(intent, { vectorIndex: 1 }),
        timerOutcome: outcome
      }),
    /edge contradicts temporal runtime scope/u
  );

  assert.throws(
    () =>
      constructScheduledContinuationReopenedEvent({
        basis,
        scheduledContinuation: tamper(scheduledContinuation, { runId: "run://wrong" })
      }),
    /runId contradicts temporal runtime scope/u
  );
});

test("T-126 temporal constructors reject timer outcomes outside the supplied timer intent lineage", () => {
  const { basis, intent, outcome } = temporalFixture();
  const wrongIntentOutcome = tamper(outcome, {
    timerIntentRef: "timer_intent://wrong"
  });
  const wrongPolicyOutcome = tamper(outcome, {
    schedulePolicyRef: "schedule-policy://wrong"
  });

  assert.throws(
    () =>
      constructTimerOutcomeAdmittedEvent({
        basis,
        timerIntent: intent,
        timerOutcome: wrongIntentOutcome
      }),
    /timerIntentRef contradicts timer intent/u
  );

  assert.throws(
    () =>
      constructScheduledContinuation({
        basis,
        timerIntent: intent,
        timerOutcome: wrongPolicyOutcome
      }),
    /schedulePolicyRef contradicts timer intent/u
  );
});

test("T-126 temporal projection and homeostatic output remain row-truth derived", () => {
  const { basis, policy, intent, outcome, deadlineBreach } = temporalFixture();
  const temporalProjection = deriveTemporalProjection({
    basis,
    events: [
      constructTimerIntentAdmittedEvent({ basis, timerIntent: intent }),
      constructTimerOutcomeAdmittedEvent({
        basis,
        timerIntent: intent,
        timerOutcome: outcome
      }),
      constructDeadlineBreachAdmittedEvent({ basis, deadlineBreach })
    ]
  });
  const homeostatic = deriveTemporalHomeostaticProjection({
    basis,
    temporalProjection,
    closedVectorIndexes: [],
    schedulePolicyRef: policy.schedulePolicyRef,
    schedulePolicy: policy
  });

  assert.deepEqual(temporalProjection.eligibleRows, [
    {
      kind: "temporal_eligibility_projection_row",
      vectorIndex: 0,
      edge: vectorEdge(basis, 0),
      constraintRef: intent.constraintRef,
      timerIntentRef: intent.timerIntentRef,
      schedulePolicyRef: policy.schedulePolicyRef
    }
  ]);
  assert.deepEqual(temporalProjection.deadlineBreachRows, [
    {
      kind: "deadline_breach_projection_row",
      vectorIndex: 0,
      edge: vectorEdge(basis, 0),
      deadlineBreachRef: deadlineBreach.deadlineBreachRef,
      constraintRef: deadlineBreach.constraintRef,
      schedulePolicyRef: policy.schedulePolicyRef,
      deadlineRef: deadlineBreach.deadlineRef,
      deadlineBreachAction: "human_gate",
      providerRef: policy.timerProviderRef,
      providerReceiptRef: "provider-receipt://t126/deadline"
    }
  ]);
  assert.deepEqual(homeostatic.observations, [
    {
      kind: "temporal_drift_observation",
      observationRef: [
        "temporal_drift",
        basis.id,
        "0",
        policy.schedulePolicyRef
      ].join(":"),
      schedulePolicyRef: policy.schedulePolicyRef,
      vectorIndex: 0,
      edge: vectorEdge(basis, 0),
      reason: "eligible_not_closed",
      deadlineBreachAction: null,
      requiredRegime: "F_H"
    },
    {
      kind: "temporal_drift_observation",
      observationRef: [
        "temporal_deadline_breached",
        basis.id,
        "0",
        policy.schedulePolicyRef,
        deadlineBreach.deadlineBreachRef
      ].join(":"),
      schedulePolicyRef: policy.schedulePolicyRef,
      vectorIndex: 0,
      edge: vectorEdge(basis, 0),
      reason: "deadline_breached",
      deadlineBreachAction: "human_gate",
      requiredRegime: "F_H"
    }
  ]);
});

test("T-126 structural guard: temporal scope has one private owner and no T-149/T-151 authority", () => {
  const source = readFileSync(
    path.join(process.cwd(), "code/src/abg/m03/contracts/temporal_algebra.ts"),
    "utf8"
  );

  assert.match(source, /interface TemporalRuntimeScope/u);
  assert.doesNotMatch(source, /export\s+interface\s+TemporalRuntimeScope/u);
  assert.match(source, /function constructTemporalRuntimeScope\(/u);
  assert.equal(
    [...source.matchAll(/\bgraphCallIdForBasis\(/gu)].length,
    1,
    "temporal runtime-scope graph-call construction must stay centralized"
  );
  assert.equal(
    [...source.matchAll(/\bframeIdForBasis\(/gu)].length,
    1,
    "temporal runtime-scope frame construction must stay centralized"
  );
  assert.doesNotMatch(source, /deriveIterationOutcome/u);
  assert.doesNotMatch(source, /GtlEvaluationScopeRef/u);
  assert.doesNotMatch(source, /targetVectorIndex/u);
  assert.doesNotMatch(source, /evaluationScopeRef/u);
  assert.doesNotMatch(source, /redispatchTarget/u);
});
