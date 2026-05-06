// Validates: T-122
// Validates: REQ-L-GTL3-GRAPHVECTOR-011
// Validates: REQ-R-ABG3-EVENTS-019
// Validates: REQ-R-ABG3-PROJECTION-014
// Validates: REQ-R-ABG3-PROJECTION-015

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructDeadlineBreach,
  constructDeadlineBreachAdmittedEvent,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructNotBeforeConstraint,
  constructSchedulePolicy,
  deriveRuntimeAggregateProjection,
  deriveTemporalConstraintFromGtl,
  deriveTemporalHomeostaticProjection,
  deriveTemporalProjection
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

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
        ref: "temporal-constraint://t122/deadline/edge0",
        config: attrs([
          scalarEntry(
            "constraint_ref",
            "temporal-constraint://t122/deadline/edge0"
          ),
          scalarEntry("operator", "not_before"),
          scalarEntry("not_before_ref", "instant://2026-05-07T01:00:00Z"),
          scalarEntry("deadline_ref", "instant://2026-05-07T02:00:00Z"),
          scalarEntry(
            "schedule_policy_ref",
            "schedule-policy://t122/deadline"
          ),
          scalarEntry("timer_provider_ref", "timer-provider://t122/stub"),
          scalarEntry("deadline_breach_action", "human_gate")
        ])
      })
    })
  });
}

function vectorWithDeadlineDeclaration(basis) {
  const vector = basis.graph.vectors[0];
  assert.notEqual(vector, undefined);
  return Object.freeze({
    ...vector,
    declarations: attrs([temporalHookEntry()])
  });
}

function deadlineFixture() {
  const basis = buildThreeStageBasis();
  const resolution = deriveTemporalConstraintFromGtl({
    basis,
    vectorIndex: 0,
    vector: vectorWithDeadlineDeclaration(basis)
  });
  const deadlineBreach = constructDeadlineBreach({
    basis,
    constraint: resolution.constraint,
    policy: resolution.policy,
    providerReceiptRef: "provider-receipt://t122/deadline/breached"
  });
  return Object.freeze({ basis, resolution, deadlineBreach });
}

test("T-122 GTL deadline syntax derives schedule-policy consequence truth", () => {
  const { resolution } = deadlineFixture();

  assert.equal(resolution.attrKey, "abg.temporal_constraint");
  assert.equal(resolution.constraint.deadlineRef, "instant://2026-05-07T02:00:00Z");
  assert.equal(resolution.policy.deadlineBreachAction, "human_gate");
  assert.equal(resolution.policy.timerProviderRef, "timer-provider://t122/stub");
});

test("T-122 admitted deadline breach projects homeostatic pressure without graph closure", () => {
  const { basis, resolution, deadlineBreach } = deadlineFixture();
  const breachEvent = constructDeadlineBreachAdmittedEvent({
    basis,
    deadlineBreach
  });
  assert.doesNotThrow(() => assertRuntimeEvent(breachEvent));

  const beforeAdmission = deriveTemporalProjection({ basis, events: [] });
  assert.deepEqual(beforeAdmission.deadlineBreachRefs, []);
  assert.deepEqual(beforeAdmission.deadlineBreachedVectorIndexes, []);

  const temporalProjection = deriveTemporalProjection({
    basis,
    events: [breachEvent]
  });
  const aggregateProjection = deriveRuntimeAggregateProjection(basis, [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    breachEvent
  ]);
  const homeostatic = deriveTemporalHomeostaticProjection({
    basis,
    temporalProjection,
    closedVectorIndexes: aggregateProjection.closedVectorIndexes,
    schedulePolicyRef: resolution.policy.schedulePolicyRef,
    schedulePolicy: resolution.policy
  });

  assert.deepEqual(temporalProjection.deadlineBreachRefs, [
    deadlineBreach.deadlineBreachRef
  ]);
  assert.deepEqual(temporalProjection.deadlineBreachedVectorIndexes, [0]);
  assert.deepEqual(temporalProjection.deadlineBreachRows, [
    {
      kind: "deadline_breach_projection_row",
      vectorIndex: 0,
      edge: deadlineBreach.edge,
      deadlineBreachRef: deadlineBreach.deadlineBreachRef,
      constraintRef: deadlineBreach.constraintRef,
      schedulePolicyRef: resolution.policy.schedulePolicyRef,
      deadlineRef: deadlineBreach.deadlineRef,
      deadlineBreachAction: "human_gate",
      providerRef: deadlineBreach.providerRef,
      providerReceiptRef: deadlineBreach.providerReceiptRef
    }
  ]);
  assert.deepEqual(aggregateProjection.closedVectorIndexes, []);
  assert.equal(aggregateProjection.nextVectorIndex, 0);
  assert.equal(homeostatic.traversalComplete, false);
  assert.equal(homeostatic.observations[0].reason, "deadline_breached");
  assert.equal(homeostatic.observations[0].deadlineBreachAction, "human_gate");
  assert.equal(homeostatic.observations[0].requiredRegime, "F_H");
});

test("T-122 homeostatic deadline observations cannot be attributed to caller policy", () => {
  const { basis, resolution, deadlineBreach } = deadlineFixture();
  const breachEvent = constructDeadlineBreachAdmittedEvent({
    basis,
    deadlineBreach
  });
  const temporalProjection = deriveTemporalProjection({
    basis,
    events: [breachEvent]
  });
  const callerPolicy = constructSchedulePolicy({
    schedulePolicyRef: resolution.policy.schedulePolicyRef,
    deadlineBreachAction: "reprice",
    timerProviderRef: "timer-provider://t122/caller"
  });
  const otherPolicy = constructSchedulePolicy({
    schedulePolicyRef: "schedule-policy://t122/other",
    deadlineBreachAction: "reprice",
    timerProviderRef: "timer-provider://t122/other"
  });

  const matchingScope = deriveTemporalHomeostaticProjection({
    basis,
    temporalProjection,
    closedVectorIndexes: [],
    schedulePolicyRef: resolution.policy.schedulePolicyRef,
    schedulePolicy: callerPolicy
  });
  const otherScope = deriveTemporalHomeostaticProjection({
    basis,
    temporalProjection,
    closedVectorIndexes: [],
    schedulePolicyRef: otherPolicy.schedulePolicyRef,
    schedulePolicy: otherPolicy
  });

  assert.equal(matchingScope.observations[0].schedulePolicyRef, resolution.policy.schedulePolicyRef);
  assert.equal(matchingScope.observations[0].deadlineBreachAction, "human_gate");
  assert.deepEqual(otherScope.observations, []);
  assert.throws(
    () =>
      deriveTemporalHomeostaticProjection({
        basis,
        temporalProjection,
        closedVectorIndexes: [],
        schedulePolicyRef: resolution.policy.schedulePolicyRef,
        schedulePolicy: otherPolicy
      }),
    /matching schedule policy/
  );
});

test("T-122 provider-local deadline payload has no authority without ABG admission", () => {
  const { basis, deadlineBreach } = deadlineFixture();
  assert.equal(
    deadlineBreach.providerReceiptRef,
    "provider-receipt://t122/deadline/breached"
  );

  const projection = deriveTemporalProjection({ basis, events: [] });
  assert.deepEqual(projection.deadlineBreachRefs, []);
  assert.deepEqual(projection.deadlineBreachedVectorIndexes, []);
});

test("T-122 deadline breach fails closed without deadline and policy action truth", () => {
  const basis = buildThreeStageBasis();
  const policy = constructSchedulePolicy({
    schedulePolicyRef: "schedule-policy://t122/no-deadline",
    timerProviderRef: "timer-provider://t122/stub"
  });
  const constraint = constructNotBeforeConstraint({
    basis,
    vectorIndex: 0,
    constraintRef: "temporal-constraint://t122/no-deadline",
    notBeforeRef: "instant://2026-05-07T01:00:00Z",
    schedulePolicyRef: policy.schedulePolicyRef
  });
  assert.throws(
    () =>
      constructDeadlineBreach({
        basis,
        constraint,
        policy,
        providerReceiptRef: "provider-receipt://t122/no-deadline"
      }),
    /DeadlineBreach requires TemporalConstraint\.deadlineRef/
  );

  const { basis: deadlineBasis, deadlineBreach } = deadlineFixture();
  const event = constructDeadlineBreachAdmittedEvent({
    basis: deadlineBasis,
    deadlineBreach
  });
  const { deadlineBreachAction: _action, ...withoutAction } = event;
  assert.throws(
    () => assertRuntimeEvent(Object.freeze(withoutAction)),
    /DeadlineBreachAdmittedEvent\.deadlineBreachAction/
  );
});
