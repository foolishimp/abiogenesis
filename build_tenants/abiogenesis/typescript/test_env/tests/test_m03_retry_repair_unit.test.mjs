// Validates: REQ-R-ABG3-RETRY
// Validates: REQ-R-ABG3-CONTINUATION
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructRetryProgressRecordedEvent,
  constructVectorClosedEvent,
  deriveRetryRepairDecision,
  deriveRuntimeAggregateProjection,
  runtimeEventsForRetryRepairDecision
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

test("M03 retry repair unit: retry decision mints fresh attempt identity from current projection", () => {
  const basis = buildThreeStageBasis();
  const projection = deriveRuntimeAggregateProjection(basis, [
    constructVectorClosedEvent({
      basis,
      vectorIndex: 0,
      closureKind: "assessed"
    })
  ]);

  const decision = deriveRetryRepairDecision({
    basis,
    projection,
    failedVectorIndex: 1,
    priorManifestId: "manifest://attempt-0",
    candidateManifestId: "manifest://attempt-1",
    maxAttempts: 3,
    stationary: false,
    continuationRepair: {
      terminatedContinuationId: "continuation://old",
      reopenedContinuationId: "continuation://new"
    }
  });

  assert.equal(decision.kind, "retry_planned");
  assert.equal(decision.attempt.attemptIndex, 1);
  assert.equal(decision.attempt.manifestId, "manifest://attempt-1");
  assert.equal(decision.manifestRegeneration.priorManifestId, "manifest://attempt-0");
  assert.match(decision.attempt.runId, /:retry:1$/);
  assert.match(decision.attempt.callId, /:retry:1$/);
  assert.equal(decision.promptRegeneration.vectorIndex, 1);
  assert.equal(decision.promptRegeneration.edge, "requirements→design");

  const events = runtimeEventsForRetryRepairDecision(decision);
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "retry_repair_planned",
      "retry_attempt_opened",
      "continuation_terminated",
      "continuation_reopened"
    ]
  );

  const retryProjection = deriveRuntimeAggregateProjection(basis, events);
  assert.deepStrictEqual(retryProjection.retryAttemptRunIds, [
    decision.attempt.runId
  ]);
  assert.deepStrictEqual(retryProjection.retryAttemptManifestIds, [
    decision.attempt.manifestId
  ]);

  const progressEvent = constructRetryProgressRecordedEvent({
    decision,
    progressSignalRefs: ["asset://requirements-gap-reduced"],
    stationary: false
  });
  const progressProjection = deriveRuntimeAggregateProjection(basis, [
    ...events,
    progressEvent
  ]);
  assert.deepStrictEqual(progressProjection.retryAttemptRunIds, [
    decision.attempt.runId
  ]);
});

test("M03 retry repair unit: exhausted and stationary attempts stop or escalate through runtime truth", () => {
  const basis = buildThreeStageBasis();
  const projection = deriveRuntimeAggregateProjection(basis, []);

  const first = deriveRetryRepairDecision({
    basis,
    projection,
    failedVectorIndex: 0,
    priorManifestId: "manifest://attempt-0",
    candidateManifestId: "manifest://attempt-1",
    maxAttempts: 3,
    stationary: false
  });
  assert.equal(first.kind, "retry_planned");
  const projectionAfterFirst = deriveRuntimeAggregateProjection(
    basis,
    runtimeEventsForRetryRepairDecision(first)
  );

  const second = deriveRetryRepairDecision({
    basis,
    projection: projectionAfterFirst,
    failedVectorIndex: 0,
    priorManifestId: "manifest://attempt-1",
    candidateManifestId: "manifest://attempt-2",
    maxAttempts: 3,
    stationary: false
  });
  assert.equal(second.kind, "retry_planned");
  const projectionAfterSecond = deriveRuntimeAggregateProjection(basis, [
    ...runtimeEventsForRetryRepairDecision(first),
    ...runtimeEventsForRetryRepairDecision(second)
  ]);

  const stopped = deriveRetryRepairDecision({
    basis,
    projection: projectionAfterSecond,
    failedVectorIndex: 0,
    priorManifestId: "manifest://attempt-2",
    candidateManifestId: "manifest://attempt-3",
    maxAttempts: 2,
    stationary: false
  });
  assert.equal(stopped.kind, "retry_stopped");
  assert.equal(stopped.reason, "retry_budget_exhausted");

  const escalated = deriveRetryRepairDecision({
    basis,
    projection: projectionAfterFirst,
    failedVectorIndex: 0,
    priorManifestId: "manifest://attempt-1",
    candidateManifestId: "manifest://attempt-4",
    maxAttempts: 3,
    stationary: true,
    escalationSubjectRef: "approval://retry-stationary"
  });
  assert.equal(escalated.kind, "retry_escalated");
  assert.equal(escalated.gateReason, "stationary_retry");
  assert.deepStrictEqual(
    runtimeEventsForRetryRepairDecision(escalated).map((event) => event.kind),
    ["retry_attempt_escalated"]
  );
});
