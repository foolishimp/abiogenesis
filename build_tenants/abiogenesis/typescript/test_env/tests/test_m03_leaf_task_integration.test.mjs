// Validates: REQ-R-ABG3-LEAFTASK
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitLeafTaskPayload,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructLeafTaskCompletedEvent,
  constructLeafTaskEnvelope,
  constructLeafTaskFailedEvent,
  constructLeafTaskOpenedEvent,
  deriveRuntimeAggregateProjection,
  emit
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

test("M03 leaf task integration: leaf task remains parent-bound and replay-visible", () => {
  const basis = buildThreeStageBasis();
  const parentEvents = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis)
  ];
  const parentProjection = deriveRuntimeAggregateProjection(basis, parentEvents);

  const envelope = constructLeafTaskEnvelope({
    basis,
    projection: parentProjection,
    leafTaskId: "leaf://requirements-gap-scan",
    vectorIndex: 0,
    inputSchemaRef: "schema://leaf/input-gap-scan",
    outputSchemaRef: "schema://leaf/output-gap-scan",
    input: admitLeafTaskPayload({
      schemaRef: "schema://leaf/input-gap-scan",
      value: Object.freeze({ targetAssetRef: "asset://requirements" }),
      requiredKeys: ["targetAssetRef"]
    }),
    workerRef: "worker://leaf-gap-scan"
  });

  assert.equal(envelope.parent.runId, basis.runId);
  assert.equal(envelope.parent.graphCallId, parentProjection.graphCallId);
  assert.equal(envelope.parent.frameId, parentProjection.frameId);
  assert.equal(envelope.parent.edge, "input_set→requirements");

  const opened = constructLeafTaskOpenedEvent(envelope);
  const completed = constructLeafTaskCompletedEvent({
    envelope,
    resultRef: "result://leaf-gap-scan",
    output: admitLeafTaskPayload({
      schemaRef: "schema://leaf/output-gap-scan",
      value: Object.freeze({ unresolvedGapCount: 1 }),
      requiredKeys: ["unresolvedGapCount"]
    })
  });

  const emitted = [];
  emit([opened, completed], (event) => emitted.push(event));
  assert.deepStrictEqual(
    emitted.map((event) => event.kind),
    ["leaf_task_opened", "leaf_task_completed"]
  );

  const projection = deriveRuntimeAggregateProjection(basis, [
    ...parentEvents,
    ...emitted
  ]);
  assert.deepStrictEqual(projection.leafTaskIds, [envelope.leafTaskId]);
  assert.deepStrictEqual(projection.completedLeafTaskIds, [envelope.leafTaskId]);
  assert.deepStrictEqual(projection.failedLeafTaskIds, []);
});

test("M03 leaf task integration: leaf task failure preserves runtime failure class", () => {
  const basis = buildThreeStageBasis();
  const parentEvents = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis)
  ];
  const envelope = constructLeafTaskEnvelope({
    basis,
    projection: deriveRuntimeAggregateProjection(basis, parentEvents),
    leafTaskId: "leaf://capability-check",
    vectorIndex: 1,
    inputSchemaRef: "schema://leaf/input-capability",
    outputSchemaRef: "schema://leaf/output-capability",
    input: admitLeafTaskPayload({
      schemaRef: "schema://leaf/input-capability",
      value: Object.freeze({ capabilityRef: "capability://schema-check" }),
      requiredKeys: ["capabilityRef"]
    }),
    workerRef: "worker://leaf-capability"
  });
  const failed = constructLeafTaskFailedEvent({
    envelope,
    failure: {
      failureClass: "capability_missing",
      detail: "declared worker cannot satisfy schema-check capability",
      evidenceRefs: ["evidence://worker-capability-matrix"]
    }
  });
  const projection = deriveRuntimeAggregateProjection(basis, [
    ...parentEvents,
    constructLeafTaskOpenedEvent(envelope),
    failed
  ]);

  assert.equal(failed.failureClass, "capability_missing");
  assert.deepStrictEqual(projection.failedLeafTaskIds, [envelope.leafTaskId]);
});
