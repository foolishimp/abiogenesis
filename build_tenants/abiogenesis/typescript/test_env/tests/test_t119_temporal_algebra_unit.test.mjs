// Validates: T-119
// Validates: T-120
// Validates: REQ-L-GTL3-GRAPHVECTOR-011
// Validates: REQ-R-ABG3-EVENTS-019
// Validates: REQ-R-ABG3-PROJECTION-014
// Validates: REQ-R-ABG3-PROJECTION-015

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructNotBeforeConstraint,
  constructSchedulePolicy,
  constructScheduledContinuation,
  constructScheduledContinuationReopenedEvent,
  constructTimerIntent,
  constructTimerIntentAdmittedEvent,
  constructTimerOutcome,
  constructTimerOutcomeAdmittedEvent,
  deriveRuntimeAggregateProjection,
  deriveTemporalHomeostaticProjection,
  deriveTemporalProjection,
  temporalProjectionHoldsEligibility
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function temporalFixture() {
  const basis = buildThreeStageBasis();
  const policy = constructSchedulePolicy({
    schedulePolicyRef: "schedule-policy://t119/not-before",
    timerProviderRef: "timer-provider://stub"
  });
  const constraint = constructNotBeforeConstraint({
    basis,
    vectorIndex: 0,
    constraintRef: "temporal-constraint://t119/not-before/0",
    notBeforeRef: "instant://2026-05-06T12:00:00Z",
    schedulePolicyRef: policy.schedulePolicyRef
  });
  const intent = constructTimerIntent({ basis, constraint, policy });
  return Object.freeze({ basis, policy, constraint, intent });
}

test("T-119 not_before blocks eligibility until an admitted timer_fired outcome", () => {
  const { basis, policy, constraint, intent } = temporalFixture();
  const intentEvent = constructTimerIntentAdmittedEvent({ basis, timerIntent: intent });
  assert.doesNotThrow(() => assertRuntimeEvent(intentEvent));

  const pendingProjection = deriveTemporalProjection({
    basis,
    events: [intentEvent]
  });
  assert.deepEqual(pendingProjection.pendingTimerIntentRefs, [
    intent.timerIntentRef
  ]);
  assert.deepEqual(pendingProjection.eligibleVectorIndexes, []);

  const outcome = constructTimerOutcome({
    timerIntent: intent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://t119/fired"
  });
  const outcomeEvent = constructTimerOutcomeAdmittedEvent({
    basis,
    timerIntent: intent,
    timerOutcome: outcome
  });
  assert.doesNotThrow(() => assertRuntimeEvent(outcomeEvent));
  assert.equal(outcomeEvent.schedulePolicyRef, policy.schedulePolicyRef);
  assert.equal(outcomeEvent.providerRef, intent.providerRef);

  const firedProjection = deriveTemporalProjection({
    basis,
    events: [intentEvent, outcomeEvent]
  });
  assert.deepEqual(firedProjection.pendingTimerIntentRefs, []);
  assert.deepEqual(firedProjection.firedTimerOutcomeRefs, [outcome.timerOutcomeRef]);
  assert.equal(
    temporalProjectionHoldsEligibility({
      projection: firedProjection,
      basis,
      vectorIndex: 0,
      constraintRef: constraint.constraintRef,
      timerIntentRef: intent.timerIntentRef,
      schedulePolicyRef: policy.schedulePolicyRef
    }),
    true
  );
});

test("T-119 provider payloads do not authorize eligibility without ABG admission", () => {
  const { basis, intent } = temporalFixture();
  const providerLocalOutcome = constructTimerOutcome({
    timerIntent: intent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://local-only"
  });
  assert.equal(providerLocalOutcome.outcome, "timer_fired");

  const projection = deriveTemporalProjection({
    basis,
    events: [constructTimerIntentAdmittedEvent({ basis, timerIntent: intent })]
  });
  assert.deepEqual(projection.eligibleVectorIndexes, []);
});

test("T-119 scheduled continuation reopens by replay while ABG remains the iterator", () => {
  const { basis, policy, intent } = temporalFixture();
  const intentEvent = constructTimerIntentAdmittedEvent({ basis, timerIntent: intent });
  const outcome = constructTimerOutcome({
    timerIntent: intent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://t119/fired"
  });
  const outcomeEvent = constructTimerOutcomeAdmittedEvent({
    basis,
    timerIntent: intent,
    timerOutcome: outcome
  });
  const continuation = constructScheduledContinuation({
    basis,
    timerIntent: intent,
    timerOutcome: outcome
  });
  const continuationEvent = constructScheduledContinuationReopenedEvent({
    basis,
    scheduledContinuation: continuation
  });
  assert.doesNotThrow(() => assertRuntimeEvent(continuationEvent));
  assert.equal(continuationEvent.schedulePolicyRef, policy.schedulePolicyRef);
  assert.equal(continuationEvent.providerRef, intent.providerRef);

  const temporalProjection = deriveTemporalProjection({
    basis,
    events: [intentEvent, outcomeEvent, continuationEvent]
  });
  const aggregateProjection = deriveRuntimeAggregateProjection(basis, [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    intentEvent,
    outcomeEvent,
    continuationEvent
  ]);

  assert.deepEqual(temporalProjection.eligibleVectorIndexes, [0]);
  assert.deepEqual(temporalProjection.scheduledContinuationRefs, [
    continuation.scheduledContinuationRef
  ]);
  assert.deepEqual(aggregateProjection.closedVectorIndexes, []);
  assert.equal(aggregateProjection.nextVectorIndex, 0);

  const homeostatic = deriveTemporalHomeostaticProjection({
    basis,
    temporalProjection,
    closedVectorIndexes: aggregateProjection.closedVectorIndexes,
    schedulePolicyRef: policy.schedulePolicyRef
  });
  assert.equal(homeostatic.traversalComplete, false);
  assert.equal(homeostatic.observations[0].reason, "eligible_not_closed");
  assert.equal(homeostatic.observations[0].requiredRegime, "F_H");
});

test("T-119 cancelled or missed timer outcomes terminate pending truth without eligibility", () => {
  const { basis, intent } = temporalFixture();
  for (const outcomeKind of ["timer_cancelled", "timer_missed"]) {
    const outcome = constructTimerOutcome({
      timerIntent: intent,
      outcome: outcomeKind,
      providerReceiptRef: `provider-receipt://t119/${outcomeKind}`
    });
    const projection = deriveTemporalProjection({
      basis,
      events: [
        constructTimerIntentAdmittedEvent({ basis, timerIntent: intent }),
        constructTimerOutcomeAdmittedEvent({
          basis,
          timerIntent: intent,
          timerOutcome: outcome
        })
      ]
    });
    assert.deepEqual(projection.pendingTimerIntentRefs, []);
    assert.deepEqual(projection.eligibleVectorIndexes, []);
  }
});

test("T-119 temporal event admission fails closed without policy and provider identity", () => {
  const { basis, policy, intent } = temporalFixture();
  const outcome = constructTimerOutcome({
    timerIntent: intent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://t119/identity"
  });
  const outcomeEvent = constructTimerOutcomeAdmittedEvent({
    basis,
    timerIntent: intent,
    timerOutcome: outcome
  });
  const continuation = constructScheduledContinuation({
    basis,
    timerIntent: intent,
    timerOutcome: outcome
  });
  const continuationEvent = constructScheduledContinuationReopenedEvent({
    basis,
    scheduledContinuation: continuation
  });

  const { schedulePolicyRef: _outcomePolicy, ...outcomeWithoutPolicy } =
    outcomeEvent;
  assert.throws(
    () => assertRuntimeEvent(Object.freeze(outcomeWithoutPolicy)),
    /TimerOutcomeAdmittedEvent\.schedulePolicyRef/
  );
  const { providerRef: _outcomeProvider, ...outcomeWithoutProvider } =
    outcomeEvent;
  assert.throws(
    () => assertRuntimeEvent(Object.freeze(outcomeWithoutProvider)),
    /TimerOutcomeAdmittedEvent\.providerRef/
  );

  const { schedulePolicyRef: _continuationPolicy, ...continuationWithoutPolicy } =
    continuationEvent;
  assert.throws(
    () => assertRuntimeEvent(Object.freeze(continuationWithoutPolicy)),
    /ScheduledContinuationReopenedEvent\.schedulePolicyRef/
  );
  const { providerRef: _continuationProvider, ...continuationWithoutProvider } =
    continuationEvent;
  assert.throws(
    () => assertRuntimeEvent(Object.freeze(continuationWithoutProvider)),
    /ScheduledContinuationReopenedEvent\.providerRef/
  );

  assert.equal(policy.timerProviderRef, intent.providerRef);
});
