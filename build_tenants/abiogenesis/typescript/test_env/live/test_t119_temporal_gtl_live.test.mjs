// Validates: T-119
// Validates: T-124
// Validates: REQ-L-GTL3-GRAPHVECTOR-011
// Validates: REQ-R-ABG3-EVENTS-019
// Validates: REQ-R-ABG3-PROJECTION-014
//
// Live temporal proof: the provider receipt is archived as observed external
// payload, but only ABG admission through emit() changes replay-derived
// temporal truth.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructTimerIntent,
  constructTimerIntentAdmittedEvent,
  constructTimerOutcome,
  constructTimerOutcomeAdmittedEvent,
  deriveTemporalConstraintFromGtl,
  deriveTemporalProjection,
  emit,
  temporalProjectionHoldsEligibility
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "../tests/support/m03-iteration-fixtures.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t119_temporal_gtl_live"
);

function timestampId() {
  return new Date().toISOString().replaceAll(/[-:.]/gu, "");
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

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
        ref: "temporal-constraint://t119/live/not-before-edge0",
        config: attrs([
          scalarEntry(
            "constraint_ref",
            "temporal-constraint://t119/live/not-before-edge0"
          ),
          scalarEntry("operator", "not_before"),
          scalarEntry("not_before_ref", "instant://2026-05-06T12:00:00Z"),
          scalarEntry(
            "schedule_policy_ref",
            "schedule-policy://t119/live/not-before"
          ),
          scalarEntry("timer_provider_ref", "timer-provider://t119/live-stub"),
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

test("T-119 live: provider receipt does not authorize temporal eligibility before ABG admission", async () => {
  const archiveRoot = path.join(TEST_RUNS_ROOT, timestampId());
  await mkdir(archiveRoot, { recursive: true });
  const basis = buildThreeStageBasis({
    runId: `run://t119/live/${timestampId()}`,
    workKey: "wk://t119/live"
  });
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
  const providerOutcome = constructTimerOutcome({
    timerIntent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://t119/live/fired"
  });
  await writeJson(path.join(archiveRoot, "provider_receipt.json"), {
    providerRef: providerOutcome.providerRef,
    providerReceiptRef: providerOutcome.providerReceiptRef,
    outcome: providerOutcome.outcome,
    note: "archived provider payload only; not ABG runtime truth until admitted"
  });

  const emittedEvents = [];
  emit(
    [
      constructGraphCallOpenedEvent(basis),
      constructFrameOpenedEvent(basis),
      intentEvent
    ],
    (event) => emittedEvents.push(event)
  );
  const beforeAdmission = deriveTemporalProjection({
    basis,
    events: emittedEvents
  });
  await writeJson(path.join(archiveRoot, "projection_before_admission.json"), {
    emittedEventKinds: emittedEvents.map((event) => event.kind),
    beforeAdmission
  });
  assert.deepEqual(beforeAdmission.eligibleVectorIndexes, []);
  assert.deepEqual(beforeAdmission.pendingTimerIntentRefs, [
    timerIntent.timerIntentRef
  ]);

  const admittedOutcomeEvent = constructTimerOutcomeAdmittedEvent({
    basis,
    timerIntent,
    timerOutcome: providerOutcome
  });
  emit(admittedOutcomeEvent, (event) => emittedEvents.push(event));
  const afterAdmission = deriveTemporalProjection({
    basis,
    events: emittedEvents
  });
  await writeJson(path.join(archiveRoot, "projection_after_admission.json"), {
    emittedEventKinds: emittedEvents.map((event) => event.kind),
    afterAdmission
  });

  assert.deepEqual(afterAdmission.pendingTimerIntentRefs, []);
  assert.deepEqual(afterAdmission.eligibleVectorIndexes, [0]);
  assert.equal(
    temporalProjectionHoldsEligibility({
      projection: afterAdmission,
      basis,
      vectorIndex: 0,
      constraintRef: resolution.constraint.constraintRef,
      timerIntentRef: timerIntent.timerIntentRef,
      schedulePolicyRef: resolution.policy.schedulePolicyRef
    }),
    true
  );
});
