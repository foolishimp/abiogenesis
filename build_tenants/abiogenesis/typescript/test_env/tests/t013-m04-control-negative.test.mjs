import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicControlLoopRequest,
  publicControlLoop
} from "../../build/semantic/code/src/app/m04/index.js";
import { emptyModule, resolvedPolicyIdentity, runtimeIdentity } from "./support/m04-fixtures.mjs";

test("T-013 negative proof: control-loop ingress rejects direct prior-outcome injection", () => {
  assert.throws(
    () =>
      admitPublicControlLoopRequest({
        start_request: {
          scope: {
            kind: "workspace",
            workspaceRoot: "/workspace/demo",
            moduleName: "abiogenesis.public_runtime"
          },
          target: {
            kind: "graph_function",
            handle: "public_profile"
          },
          until: "converged"
        },
        prior_outcome: {
          kind: "blocked"
        }
      }),
    /prior_outcome|lawful control-loop authority/i
  );
});

test("T-013 negative proof: control-loop ingress requires nested completed public-start request", () => {
  assert.throws(
    () =>
      admitPublicControlLoopRequest({
        scope: {
          kind: "workspace",
          workspaceRoot: "/workspace/demo",
          moduleName: "abiogenesis.public_runtime"
        }
      }),
    /start_request/i
  );
});

test("T-013 negative proof: control-loop rejects invalid nested public-start target truth", () => {
  assert.throws(
    () =>
      publicControlLoop(
        {
          start_request: {
            scope: {
              kind: "workspace",
              workspaceRoot: "/workspace/demo",
              moduleName: "abiogenesis.public_runtime"
            },
            target: {
              kind: "graph_vector",
              handle: "rogue_vector"
            },
            until: "converged"
          }
        },
        {
          module: emptyModule(),
          runtimeIdentity: runtimeIdentity(),
          resolvedPolicy: resolvedPolicyIdentity()
        },
        () => {}
      ),
    /graph_function/i
  );
});
