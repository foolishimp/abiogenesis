// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructVectorClosedEvent,
  deriveRuntimeAggregateProjection
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function assessedEvent(edge, overrides = {}) {
  return {
    kind: "assessed",
    assessmentKind: "fp",
    edge,
    obligationId: "obligation://test",
    publishedLedgerRef: "ledger://test",
    actor: "codex",
    specHash: "spec://test",
    manifestId: "manifest://test",
    workflowVersion: "wf://test",
    runId: "run://m03-iteration",
    workKey: "wk://m03-iteration",
    selectedWorkerId: "worker://m03-iteration",
    selectedBackend: "backend://node",
    roleId: "role://runtime",
    authorityRef: "authority://runtime",
    assignmentSource: "policy_resolution",
    resolvedRuntimeRef: "runtime://typescript/node",
    ...overrides
  };
}

test("T-044 negative proof: projection rejects local-counter vector closure drift", () => {
  const basis = buildThreeStageBasis();

  assert.throws(
    () =>
      deriveRuntimeAggregateProjection(basis, [
        constructVectorClosedEvent({
          basis,
          vectorIndex: 1,
          closureKind: "assessed"
        })
      ]),
    /replay-derived vector closure order/i
  );
});

test("T-044 negative proof: projection rejects assessed edge outside graph truth", () => {
  const basis = buildThreeStageBasis();

  assert.throws(
    () =>
      deriveRuntimeAggregateProjection(basis, [
        assessedEvent("unknown→edge")
      ]),
    /assessed edge.*outside graph vectors/i
  );
});

test("T-044 negative proof: projection rejects out-of-order assessed closure", () => {
  const basis = buildThreeStageBasis();

  assert.throws(
    () =>
      deriveRuntimeAggregateProjection(basis, [
        assessedEvent("requirements→design")
      ]),
    /replay-derived vector closure order/i
  );
});

test("T-044 negative proof: projection rejects assessed truth from a different run", () => {
  const basis = buildThreeStageBasis();

  assert.throws(
    () =>
      deriveRuntimeAggregateProjection(basis, [
        assessedEvent("input_set→requirements", {
          runId: "run://other",
          workKey: "wk://m03-iteration"
        })
      ]),
    /assessed runId.*outside basis run/i
  );
});

test("T-044 negative proof: projection rejects duplicate vector closure facts", () => {
  const basis = buildThreeStageBasis();

  assert.throws(
    () =>
      deriveRuntimeAggregateProjection(basis, [
        constructVectorClosedEvent({
          basis,
          vectorIndex: 0,
          closureKind: "assessed"
        }),
        constructVectorClosedEvent({
          basis,
          vectorIndex: 0,
          closureKind: "assessed"
        })
      ]),
    /duplicate vector closure/i
  );
});
