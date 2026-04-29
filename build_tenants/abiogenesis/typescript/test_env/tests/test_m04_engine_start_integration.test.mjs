// Validates: REQ-P-POLICY
// Validates: REQ-R-ABG3-RUN
// Validates: T-072

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  publicStart,
  start
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageStartContext } from "./support/m03-iteration-fixtures.mjs";

function vectorClosedEvent(plannedEvent) {
  return {
    kind: "vector_closed",
    basisId: plannedEvent.basisId,
    graphCallId: plannedEvent.graphCallId,
    frameId: plannedEvent.frameId,
    vectorIndex: plannedEvent.vectorIndex,
    edge: plannedEvent.edge,
    closureKind: "assessed"
  };
}

test("T-072 M04 start: public start delegates to the ABG-owned iterate runner", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const events = [];

  const outcome = start(input, context, (event) => {
    events.push(event);
  });

  assert.equal(outcome.kind, "converged");
  assert.equal(outcome.terminalKind, "converged");
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "basis_admitted",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "vector_evaluated",
      "vector_closed",
      "fd_advance_ready",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "vector_evaluated",
      "vector_closed",
      "fd_advance_ready",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "vector_evaluated",
      "vector_closed",
      "fd_advance_ready",
      "terminal_reached"
    ]
  );
});

test("T-072 M04 start: F_P remains a lawful dispatch stop from the same engine path", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://m03-iteration"
  });
  const events = [];

  const outcome = start(input, context, (event) => {
    events.push(event);
  });

  assert.equal(outcome.kind, "blocked");
  assert.equal(outcome.stopPredicate, "dispatch_required");
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "basis_admitted",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "fp_dispatch_requested",
      "actor_invocation_started",
      "actor_invocation_closed"
    ]
  );
});

test("T-072 M04 start: vector-closed F_P replay advances on re-entry without redispatching the same vector", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://m03-iteration"
  });
  const firstEvents = [];
  const firstOutcome = start(input, context, (event) => {
    firstEvents.push(event);
  });
  const replayEvents = Object.freeze([
    ...firstEvents,
    vectorClosedEvent(
      firstEvents.find(
        (event) =>
          event.kind === "vector_traversal_planned" &&
          event.edge === "input_set→requirements"
      )
    )
  ]);
  const secondEvents = [];
  const dispatchedEdges = [];
  const fpDispatch = Object.freeze({
    contract: constructEnginePluginContract({
      ref: "plugin://test/no-same-edge-fp-dispatch",
      pluginKind: "fp_dispatch",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FpDispatchOutcome"
    }),
    dispatch: (pluginInput) => {
      assert.equal(secondEvents.at(-1)?.kind, "actor_invocation_started");
      dispatchedEdges.push(pluginInput.edge);
      assert.notEqual(pluginInput.edge, "input_set→requirements");
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://test/${pluginInput.edge}`,
        evidenceRefs: [pluginInput.sourceProjectionRef]
      });
    }
  });

  const secondOutcome = start(
    input,
    {
      ...context,
      runtimeEvents: replayEvents
    },
    (event) => {
      secondEvents.push(event);
    },
    { fpDispatch }
  );

  assert.equal(firstOutcome.kind, "blocked");
  assert.equal(firstOutcome.stopPredicate, "dispatch_required");
  assert.equal(secondOutcome.kind, "blocked");
  assert.equal(secondOutcome.stopPredicate, "dispatch_required");
  assert.deepStrictEqual(dispatchedEdges, ["requirements→design"]);
  assert.deepStrictEqual(
    secondEvents.map((event) => event.kind),
    [
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "fp_dispatch_requested",
      "actor_invocation_started",
      "actor_invocation_closed"
    ]
  );
  assert.deepStrictEqual(
    secondEvents
      .filter((event) => event.kind === "vector_traversal_planned")
      .map((event) => event.edge),
    ["requirements→design"]
  );
});

test("B-016 M04 publicStart compatibility: legacy entry delegates to the same engine path", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const startEvents = [];
  const publicEvents = [];

  const startOutcome = start(input, context, (event) => {
    startEvents.push(event);
  });
  const publicOutcome = publicStart(input, context, (event) => {
    publicEvents.push(event);
  });

  assert.deepStrictEqual(publicOutcome, startOutcome);
  assert.deepStrictEqual(
    publicEvents.map((event) => event.kind),
    startEvents.map((event) => event.kind)
  );
  assert.equal(publicOutcome.kind, "converged");
});
