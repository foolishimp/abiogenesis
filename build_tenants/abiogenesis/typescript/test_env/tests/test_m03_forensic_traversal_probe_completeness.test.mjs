// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-PROJECTION
// Investigates: T-065

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent,
  deriveIterationAdvanceDecision,
  deriveRuntimeAggregateProjection,
  deriveTraversalStructureProbe,
  runtimeEventsForIterationDecision
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

test("T-065 forensic probe exposes replay identity without becoming runtime authority", () => {
  const basis = buildThreeStageBasis();
  const runtimeEvents = [];

  const initialProbe = deriveTraversalStructureProbe(basis, runtimeEvents);
  assert.equal(initialProbe.graphCallId, null);
  assert.equal(initialProbe.frameId, null);
  assert.equal(initialProbe.currentVectorIndex, 0);
  assert.equal(initialProbe.currentVectorEvidence.edge, "input_set→requirements");
  assert.equal(initialProbe.diagnosticAuthority.emitsEvents, false);
  assert.equal(initialProbe.diagnosticAuthority.choosesNextWork, false);

  const initialDecision = deriveIterationAdvanceDecision(
    basis,
    deriveRuntimeAggregateProjection(basis, runtimeEvents)
  );
  const planningEvents = runtimeEventsForIterationDecision(initialDecision);
  runtimeEvents.push(...planningEvents);

  const plannedProbe = deriveTraversalStructureProbe(basis, runtimeEvents);
  assert.equal(plannedProbe.graphCallId, planningEvents[0].graphCallId);
  assert.equal(plannedProbe.frameId, planningEvents[1].frameId);
  assert.equal(plannedProbe.frameLineageId, null);
  assert.deepStrictEqual(plannedProbe.projection.plannedVectorIndexes, [0]);
  assert.equal(plannedProbe.currentVectorEvidence.vectorIndex, 0);
  assert.equal(plannedProbe.runtimeIdentity.workerId, "worker://m03-iteration");

  runtimeEvents.push(
    constructVectorEvaluatedEvent({
      basis,
      vectorIndex: 0,
      status: "accepted"
    }),
    constructVectorClosedEvent({
      basis,
      vectorIndex: 0,
      closureKind: "assessed"
    })
  );

  const afterFirstClosureProbe = deriveTraversalStructureProbe(basis, runtimeEvents);
  assert.deepStrictEqual(afterFirstClosureProbe.projection.closedVectorIndexes, [0]);
  assert.equal(afterFirstClosureProbe.currentVectorIndex, 1);
  assert.equal(afterFirstClosureProbe.currentVectorEvidence.edge, "requirements→design");
  assert(afterFirstClosureProbe.sourceProjectionRef.includes("closed=0"));
});
