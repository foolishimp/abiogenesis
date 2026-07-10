// Live-style local graph-function zoom proof for T-155.
// Validates: REQ-L-GTL3-GRAPHFUNCTION
// Validates: REQ-L-GTL3-SUBSTITUTE
// Validates: REQ-R-ABG3-INTERPRET

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { buildT155ZoomedBasis } from "../tests/support/t155-graph-function-zoom-fixtures.mjs";

function fdEvaluatorContract(ref) {
  return constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref,
    pluginKind: "fd_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FdEvaluationOutcome"
  });
}

test("T-155 live-style engine run traverses the zoomed graph-function vectors", () => {
  const { basis, first } = buildT155ZoomedBasis();
  const evaluatedEdges = [];
  const emittedEvents = [];

  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t155/live/fd"),
        evaluate: (input) => {
          evaluatedEdges.push(input.edge);
          return constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      })
    }
  });

  assert.equal(basis.graphFunction.id, first.graphFunction.id);
  assert.deepEqual(evaluatedEdges, ["requirements→design", "design→code"]);
  assert.equal(evaluatedEdges.includes("requirements→code"), false);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(
    emittedEvents.filter((event) => event.kind === "vector_closed").length,
    2
  );
  assert.deepEqual(
    emittedEvents
      .filter((event) => event.kind === "vector_traversal_planned")
      .map((event) => event.edge),
    ["requirements→design", "design→code"]
  );
});

