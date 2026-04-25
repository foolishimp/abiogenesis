// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructVectorClosedEvent,
  deriveRuntimeAggregateProjection
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

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
