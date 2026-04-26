// Validates: REQ-L-GTL3-GRAPH
// Validates: REQ-L-GTL3-GRAPHFUNCTION
// Validates: REQ-R-ABG3-GRAPHCALL
// Validates: REQ-R-ABG3-RUN
// Investigates: T-069

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructGraphCallOpenedEvent,
  constructFrameOpenedEvent
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

test("T-069 instance semantics: graph program identity is stable while run instances differ", () => {
  const first = buildThreeStageBasis({
    runId: "run://t069/first",
    workKey: "wk://t069/project-a"
  });
  const second = buildThreeStageBasis({
    runId: "run://t069/second",
    workKey: "wk://t069/project-a"
  });
  const firstReplay = buildThreeStageBasis({
    runId: "run://t069/first",
    workKey: "wk://t069/project-a"
  });

  assert.equal(first.graphFunction.id, second.graphFunction.id);
  assert.equal(first.graph.id, second.graph.id);
  assert.equal(first.job.id, second.job.id);

  assert.notEqual(first.id, second.id);
  assert.equal(first.id, firstReplay.id);

  const firstCall = constructGraphCallOpenedEvent(first);
  const secondCall = constructGraphCallOpenedEvent(second);
  const firstReplayCall = constructGraphCallOpenedEvent(firstReplay);

  assert.notEqual(firstCall.graphCallId, secondCall.graphCallId);
  assert.equal(firstCall.graphCallId, firstReplayCall.graphCallId);
  assert.equal(firstCall.graphFunctionId, first.graphFunction.id);

  const firstFrame = constructFrameOpenedEvent(first);
  const secondFrame = constructFrameOpenedEvent(second);

  assert.notEqual(firstFrame.frameId, secondFrame.frameId);
  assert.equal(firstFrame.vectorCount, secondFrame.vectorCount);
});
