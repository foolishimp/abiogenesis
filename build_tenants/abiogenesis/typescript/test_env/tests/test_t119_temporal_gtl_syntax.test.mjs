// Validates: T-119
// Validates: T-124
// Validates: REQ-L-GTL3-GRAPHVECTOR-011
// Validates: REQ-R-ABG3-EVENTS-019
// Validates: REQ-R-ABG3-PROJECTION-014

import test from "node:test";
import assert from "node:assert/strict";

import {
  TEMPORAL_CONSTRAINT_CONFIG_KEY_VALUES,
  TEMPORAL_CONSTRAINT_VECTOR_ATTR_KEYS,
  assertRuntimeEvent,
  constructTimerIntent,
  constructTimerIntentAdmittedEvent,
  constructTimerOutcome,
  constructTimerOutcomeAdmittedEvent,
  deriveTemporalConstraintFromGtl,
  deriveTemporalProjection,
  temporalProjectionHoldsEligibility,
  tryDeriveTemporalConstraintFromGtl
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

function hookEntry(key, input = {}) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: input.ref ?? "temporal-constraint://t119/edge0",
        config: attrs([
          scalarEntry(
            "constraint_ref",
            input.constraintRef ?? "temporal-constraint://t119/edge0"
          ),
          scalarEntry("operator", input.operator ?? "not_before"),
          scalarEntry(
            "not_before_ref",
            input.notBeforeRef ?? "instant://2026-05-06T12:00:00Z"
          ),
          scalarEntry(
            "schedule_policy_ref",
            input.schedulePolicyRef ?? "schedule-policy://t119/not-before"
          ),
          scalarEntry(
            "timer_provider_ref",
            input.timerProviderRef ?? "timer-provider://t119/stub"
          ),
          scalarEntry(
            "deadline_breach_action",
            input.deadlineBreachAction ?? "observe_drift"
          ),
          ...(input.extraConfigEntries ?? [])
        ])
      })
    })
  });
}

function vectorWithDeclarations(basis, declarations, vectorIndex = 0) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.notEqual(vector, undefined);
  return Object.freeze({
    ...vector,
    declarations
  });
}

test("T-119 exposes one canonical temporal GTL declaration surface", () => {
  assert.deepEqual(TEMPORAL_CONSTRAINT_VECTOR_ATTR_KEYS, [
    "abg.temporal_constraint"
  ]);
  assert.deepEqual(TEMPORAL_CONSTRAINT_CONFIG_KEY_VALUES, [
    "constraint_ref",
    "operator",
    "not_before_ref",
    "deadline_ref",
    "schedule_policy_ref",
    "timer_provider_ref",
    "deadline_breach_action"
  ]);
});

test("T-119 derives not_before temporal law from GraphVector.declarations and replays eligibility", () => {
  const basis = buildThreeStageBasis();
  const vector = vectorWithDeclarations(
    basis,
    attrs([hookEntry("abg.temporal_constraint")])
  );
  const resolution = deriveTemporalConstraintFromGtl({
    basis,
    vectorIndex: 0,
    vector
  });
  const intent = constructTimerIntent({
    basis,
    constraint: resolution.constraint,
    policy: resolution.policy
  });
  const intentEvent = constructTimerIntentAdmittedEvent({ basis, timerIntent: intent });
  const outcome = constructTimerOutcome({
    timerIntent: intent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://t119/gtl-fired"
  });
  const outcomeEvent = constructTimerOutcomeAdmittedEvent({
    basis,
    timerIntent: intent,
    timerOutcome: outcome
  });

  assert.equal(resolution.kind, "temporal_constraint_gtl_resolution");
  assert.equal(resolution.source, "graph_vector");
  assert.equal(resolution.attrKey, "abg.temporal_constraint");
  assert.equal(resolution.hookRef, "temporal-constraint://t119/edge0");
  assert.equal(resolution.constraint.operator, "not_before");
  assert.equal(resolution.constraint.vectorIndex, 0);
  assert.equal(resolution.policy.schedulePolicyRef, resolution.constraint.schedulePolicyRef);
  assert.equal(resolution.policy.timerProviderRef, "timer-provider://t119/stub");
  assert.doesNotThrow(() => assertRuntimeEvent(intentEvent));
  assert.doesNotThrow(() => assertRuntimeEvent(outcomeEvent));

  const projection = deriveTemporalProjection({
    basis,
    events: [intentEvent, outcomeEvent]
  });
  assert.deepEqual(projection.pendingTimerIntentRefs, []);
  assert.deepEqual(projection.eligibleVectorIndexes, [0]);
  assert.equal(
    temporalProjectionHoldsEligibility({
      projection,
      basis,
      vectorIndex: 0,
      constraintRef: resolution.constraint.constraintRef,
      timerIntentRef: intent.timerIntentRef,
      schedulePolicyRef: resolution.policy.schedulePolicyRef
    }),
    true
  );
});

test("T-119 temporal GTL syntax fails closed for absent, malformed, duplicate, or unsupported declarations", () => {
  const basis = buildThreeStageBasis();
  const emptyVector = vectorWithDeclarations(basis, attrs());
  assert.equal(
    tryDeriveTemporalConstraintFromGtl({ basis, vectorIndex: 0, vector: emptyVector }),
    null
  );
  assert.throws(
    () => deriveTemporalConstraintFromGtl({ basis, vectorIndex: 0, vector: emptyVector }),
    /requires a GTL temporal constraint qualifier/
  );

  assert.throws(
    () =>
      deriveTemporalConstraintFromGtl({
        basis,
        vectorIndex: 0,
        vector: vectorWithDeclarations(
          basis,
          attrs([scalarEntry("abg.temporal_constraint", "not_before")])
        )
      }),
    /hook_ref/
  );

  assert.throws(
    () =>
      deriveTemporalConstraintFromGtl({
        basis,
        vectorIndex: 0,
        vector: vectorWithDeclarations(
          basis,
          attrs([
            hookEntry("abg.temporal_constraint", {
              ref: "temporal-constraint://t119/one"
            }),
            hookEntry("abg.temporal_constraint", {
              ref: "temporal-constraint://t119/two"
            })
          ])
        )
      }),
    /Duplicate temporal constraint qualifier/
  );

  assert.throws(
    () =>
      deriveTemporalConstraintFromGtl({
        basis,
        vectorIndex: 0,
        vector: vectorWithDeclarations(
          basis,
          attrs([
            hookEntry("abg.temporal_constraint", {
              operator: "after"
            })
          ])
        )
      }),
    /Unsupported temporal constraint operator/
  );

  assert.throws(
    () =>
      deriveTemporalConstraintFromGtl({
        basis,
        vectorIndex: 0,
        vector: vectorWithDeclarations(
          basis,
          attrs([
            hookEntry("abg.temporal_constraint", {
              extraConfigEntries: [
                Object.freeze({
                  key: "timer_provider_ref",
                  value: Object.freeze({
                    kind: "string_list",
                    value: Object.freeze(["timer-provider://bad"])
                  })
                })
              ]
            })
          ])
        )
      }),
    /Duplicate GTL attr "timer_provider_ref"/
  );
});

test("T-119 temporal GTL syntax attaches to the basis vector, not a detached declaration copy", () => {
  const basis = buildThreeStageBasis();
  const vector = vectorWithDeclarations(
    basis,
    attrs([hookEntry("abg.temporal_constraint")])
  );
  const detachedVector = Object.freeze({
    ...vector,
    id: "vector://detached"
  });

  assert.throws(
    () =>
      deriveTemporalConstraintFromGtl({
        basis,
        vectorIndex: 0,
        vector: detachedVector
      }),
    /must match ExecutionBasis vector/
  );
});
