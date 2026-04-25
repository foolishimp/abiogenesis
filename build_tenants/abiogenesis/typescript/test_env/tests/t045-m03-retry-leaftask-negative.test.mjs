// Validates: REQ-R-ABG3-RETRY
// Validates: REQ-R-ABG3-LEAFTASK

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  admitLeafTaskPayload,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructLeafTaskCompletedEvent,
  constructLeafTaskEnvelope,
  constructLeafTaskFailedEvent,
  deriveRetryRepairDecision,
  deriveRuntimeAggregateProjection,
  runtimeEventsForRetryRepairDecision
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

test("T045 negative: package contract barrel does not promote subordinate payload types", async () => {
  const declaration = await readFile(
    new URL("../../build/semantic/code/src/abg/m03/contracts/index.d.ts", import.meta.url),
    "utf8"
  );

  for (const subordinate of [
    "RetryAttemptIdentity",
    "RetryBudgetState",
    "PromptRegenerationInput",
    "ManifestRegenerationRef",
    "ContinuationRepairLink",
    "ParentRuntimeIdentity",
    "LeafTaskFailure"
  ]) {
    assert.equal(declaration.includes(subordinate), false, subordinate);
  }
});

test("T045 negative: stale manifest redispatch fails closed", () => {
  const basis = buildThreeStageBasis();
  const projection = deriveRuntimeAggregateProjection(basis, []);

  assert.throws(
    () =>
      deriveRetryRepairDecision({
        basis,
        projection,
        failedVectorIndex: 0,
        priorManifestId: "manifest://stale",
        candidateManifestId: "manifest://stale",
        maxAttempts: 2,
        stationary: false
      }),
    /stale manifest/
  );
});

test("T045 negative: retry rejects caller-local attempt count drift", () => {
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
  const replayProjection = deriveRuntimeAggregateProjection(
    basis,
    runtimeEventsForRetryRepairDecision(first)
  );

  assert.throws(
    () =>
      deriveRetryRepairDecision({
        basis,
        projection: replayProjection,
        failedVectorIndex: 0,
        priorManifestId: "manifest://attempt-1",
        candidateManifestId: "manifest://attempt-2",
        observedAttemptCount: 0,
        maxAttempts: 3,
        stationary: false
      }),
    /retry count drift/
  );
});

test("T045 negative: retry rejects any previously used manifest as current truth", () => {
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
  const replayProjection = deriveRuntimeAggregateProjection(
    basis,
    runtimeEventsForRetryRepairDecision(first)
  );

  assert.throws(
    () =>
      deriveRetryRepairDecision({
        basis,
        projection: replayProjection,
        failedVectorIndex: 0,
        priorManifestId: "manifest://attempt-2",
        candidateManifestId: "manifest://attempt-1",
        maxAttempts: 3,
        stationary: false
      }),
    /stale manifest/
  );
});

test("T045 negative: leaf task cannot be admitted without parent runtime projection", () => {
  const basis = buildThreeStageBasis();
  const projection = deriveRuntimeAggregateProjection(basis, []);

  assert.throws(
    () =>
      constructLeafTaskEnvelope({
        basis,
        projection,
        leafTaskId: "leaf://orphan",
        vectorIndex: 0,
        inputSchemaRef: "schema://leaf/input",
        outputSchemaRef: "schema://leaf/output",
        input: admitLeafTaskPayload({
          schemaRef: "schema://leaf/input",
          value: Object.freeze({ target: "asset://requirements" }),
          requiredKeys: ["target"]
        }),
        workerRef: "worker://leaf"
      }),
    /parent graphCallId/
  );
});

test("T045 negative: leaf task output must satisfy explicit payload boundary", () => {
  const basis = buildThreeStageBasis();
  const parentEvents = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis)
  ];
  const envelope = constructLeafTaskEnvelope({
    basis,
    projection: deriveRuntimeAggregateProjection(basis, parentEvents),
    leafTaskId: "leaf://bad-output",
    vectorIndex: 0,
    inputSchemaRef: "schema://leaf/input",
    outputSchemaRef: "schema://leaf/output",
    input: admitLeafTaskPayload({
      schemaRef: "schema://leaf/input",
      value: Object.freeze({ target: "asset://requirements" }),
      requiredKeys: ["target"]
    }),
    workerRef: "worker://leaf"
  });

  assert.throws(
    () =>
      constructLeafTaskCompletedEvent({
        envelope,
        resultRef: "result://bad-output",
        output: []
      }),
    /admitted before leaf-task use/
  );
});

test("T045 negative: leaf task input must satisfy declared schema admission", () => {
  assert.throws(
    () =>
      admitLeafTaskPayload({
        schemaRef: "schema://leaf/input",
        value: Object.freeze({ wrong: "asset://requirements" }),
        requiredKeys: ["target"]
      }),
    /missing schema-required key/
  );
});

test("T045 negative: leaf task failure class is closed over runtime failure taxonomy", () => {
  const basis = buildThreeStageBasis();
  const parentEvents = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis)
  ];
  const envelope = constructLeafTaskEnvelope({
    basis,
    projection: deriveRuntimeAggregateProjection(basis, parentEvents),
    leafTaskId: "leaf://bad-failure",
    vectorIndex: 0,
    inputSchemaRef: "schema://leaf/input",
    outputSchemaRef: "schema://leaf/output",
    input: admitLeafTaskPayload({
      schemaRef: "schema://leaf/input",
      value: Object.freeze({ target: "asset://requirements" }),
      requiredKeys: ["target"]
    }),
    workerRef: "worker://leaf"
  });

  assert.throws(
    () =>
      constructLeafTaskFailedEvent({
        envelope,
        failure: {
          failureClass: "generic_failure",
          detail: "unclassified failure",
          evidenceRefs: ["evidence://failure"]
        }
      }),
    /Unsupported runtime failure class/
  );
});
