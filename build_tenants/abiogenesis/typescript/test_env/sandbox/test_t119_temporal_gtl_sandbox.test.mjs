// Validates: T-119
// Validates: T-124
// Validates: REQ-L-GTL3-GRAPHVECTOR-011
// Validates: REQ-R-ABG3-EVENTS-019
// Validates: REQ-R-ABG3-PROJECTION-014
// Validates: REQ-R-ABG3-PROJECTION-015

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructScheduledContinuation,
  constructScheduledContinuationReopenedEvent,
  constructTimerIntent,
  constructTimerIntentAdmittedEvent,
  constructTimerOutcome,
  constructTimerOutcomeAdmittedEvent,
  deriveRuntimeAggregateProjection,
  deriveTemporalConstraintFromGtl,
  deriveTemporalHomeostaticProjection,
  deriveTemporalProjection,
  emit,
  temporalProjectionHoldsEligibility
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "../tests/support/m03-iteration-fixtures.mjs";

function attrs(entries = []) {
  return Object.freeze({ entries: Object.freeze(entries) });
}

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar",
      value
    })
  });
}

function temporalHookEntry() {
  return Object.freeze({
    key: "abg.temporal_constraint",
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: "temporal-constraint://t119/sandbox/not-before-edge0",
        config: attrs([
          scalarEntry(
            "constraint_ref",
            "temporal-constraint://t119/sandbox/not-before-edge0"
          ),
          scalarEntry("operator", "not_before"),
          scalarEntry("not_before_ref", "instant://2026-05-06T12:00:00Z"),
          scalarEntry(
            "schedule_policy_ref",
            "schedule-policy://t119/sandbox/not-before"
          ),
          scalarEntry("timer_provider_ref", "timer-provider://t119/sandbox"),
          scalarEntry("deadline_breach_action", "observe_drift")
        ])
      })
    })
  });
}

function vectorWithTemporalDeclaration(basis) {
  const vector = basis.graph.vectors[0];
  assert.notEqual(vector, undefined);
  return Object.freeze({
    ...vector,
    declarations: attrs([temporalHookEntry()])
  });
}

test("T-119 sandbox: GTL not_before declaration becomes admitted replay-visible eligibility", () => {
  const basis = buildThreeStageBasis();
  const resolution = deriveTemporalConstraintFromGtl({
    basis,
    vectorIndex: 0,
    vector: vectorWithTemporalDeclaration(basis)
  });
  const timerIntent = constructTimerIntent({
    basis,
    constraint: resolution.constraint,
    policy: resolution.policy
  });
  const intentEvent = constructTimerIntentAdmittedEvent({ basis, timerIntent });
  const firedOutcome = constructTimerOutcome({
    timerIntent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://t119/sandbox/fired"
  });
  const outcomeEvent = constructTimerOutcomeAdmittedEvent({
    basis,
    timerIntent,
    timerOutcome: firedOutcome
  });
  const continuation = constructScheduledContinuation({
    basis,
    timerIntent,
    timerOutcome: firedOutcome
  });
  const continuationEvent = constructScheduledContinuationReopenedEvent({
    basis,
    scheduledContinuation: continuation
  });
  const emittedEvents = [];
  emit(
    [
      constructGraphCallOpenedEvent(basis),
      constructFrameOpenedEvent(basis),
      intentEvent,
      outcomeEvent,
      continuationEvent
    ],
    (event) => emittedEvents.push(event)
  );

  const temporalProjection = deriveTemporalProjection({
    basis,
    events: emittedEvents
  });
  const aggregateProjection = deriveRuntimeAggregateProjection(
    basis,
    emittedEvents
  );
  const homeostatic = deriveTemporalHomeostaticProjection({
    basis,
    temporalProjection,
    closedVectorIndexes: aggregateProjection.closedVectorIndexes,
    schedulePolicyRef: resolution.policy.schedulePolicyRef
  });

  assert.equal(resolution.attrKey, "abg.temporal_constraint");
  assert.equal(timerIntent.providerRef, resolution.policy.timerProviderRef);
  assert.deepEqual(temporalProjection.eligibleVectorIndexes, [0]);
  assert.deepEqual(temporalProjection.scheduledContinuationRefs, [
    continuation.scheduledContinuationRef
  ]);
  assert.equal(
    temporalProjectionHoldsEligibility({
      projection: temporalProjection,
      basis,
      vectorIndex: 0,
      constraintRef: resolution.constraint.constraintRef,
      timerIntentRef: timerIntent.timerIntentRef,
      schedulePolicyRef: resolution.policy.schedulePolicyRef
    }),
    true
  );
  assert.deepEqual(aggregateProjection.closedVectorIndexes, []);
  assert.equal(aggregateProjection.nextVectorIndex, 0);
  assert.equal(homeostatic.traversalComplete, false);
  assert.equal(homeostatic.observations[0].reason, "eligible_not_closed");
});
