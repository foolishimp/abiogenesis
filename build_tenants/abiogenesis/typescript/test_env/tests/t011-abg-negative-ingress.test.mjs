import test from "node:test";
import assert from "node:assert/strict";

import {
  admitStartIntent,
  dispatch,
  emit
} from "../../build/semantic/code/src/abg/m03/index.js";

test("T-011 negative proof: public runtime ingress rejects non-graph_function targets", () => {
  assert.throws(
    () =>
      admitStartIntent({
        scope: {
          kind: "workspace",
          workspaceRoot: "/workspace/demo",
          moduleName: "abiogenesis.runtime_library"
        },
        target: {
          kind: "graph_vector",
          handle: "design→code"
        },
        until: "converged"
      }),
    /graph_function/i
  );
});

test("T-011 negative proof: canonical event shell rejects open-object runtime event bypass", () => {
  assert.throws(
    () =>
      emit(
        [
          {
            kind: "rogue_event",
            data: {
              bypass: true
            }
          }
        ],
        () => {}
      ),
    /RuntimeEvent\.kind|supported closed variant/i
  );
});

test("T-011 negative proof: canonical dispatch edge rejects open-object request bypass", () => {
  assert.throws(
    () =>
      dispatch(
        [
          {
            kind: "dispatch_request",
            graphFunctionId: "graph-function-bypass"
          }
        ],
        () => {}
      ),
    /fp_dispatch_request|dispatch request/i
  );
});
