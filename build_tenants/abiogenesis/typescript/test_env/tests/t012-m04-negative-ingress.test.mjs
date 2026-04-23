import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicStartRequest,
  publicStart
} from "../../build/semantic/code/src/app/m04/index.js";
import { admitModule } from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import {
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity
} from "../../build/semantic/code/src/abg/m03/index.js";

function emptyModule() {
  return admitModule({
    name: "abiogenesis.public_runtime",
    graphs: [],
    graphFunctions: [],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });
}

function runtimeIdentity() {
  return admitResolvedRuntimeIdentity({
    workerId: "worker://typescript-public-start",
    backendId: "backend://node",
    buildId: "build://typescript-dev",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

function resolvedPolicy() {
  return admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: "policy://public-fd",
    defaultRegime: "F_D"
  });
}

test("T-012 negative proof: public-start ingress rejects non-graph_function targets", () => {
  assert.throws(
    () =>
      admitPublicStartRequest({
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
      }),
    /graph_function/i
  );
});

test("T-012 negative proof: public-start ingress rejects open-object runtime selector bypass", () => {
  assert.throws(
    () =>
      admitPublicStartRequest({
        scope: {
          kind: "workspace",
          workspaceRoot: "/workspace/demo",
          moduleName: "abiogenesis.public_runtime"
        },
        target: {
          kind: "graph_function",
          handle: "public_profile"
        },
        until: "converged",
        runtime_selector: {
          worker_ref: {
            rogue: true
          }
        }
      }),
    /worker_ref|validation|non-empty/i
  );
});

test("T-012 negative proof: public-start rejects non-default root_mode outside converged", () => {
  assert.throws(
    () =>
      publicStart(
        {
          scope: {
            kind: "workspace",
            workspaceRoot: "/workspace/demo",
            moduleName: "abiogenesis.public_runtime"
          },
          target: {
            kind: "graph_function",
            handle: "public_profile"
          },
          until: "first_traversal",
          root_mode: "supervised"
        },
        {
          module: emptyModule(),
          runtimeIdentity: runtimeIdentity(),
          resolvedPolicy: resolvedPolicy()
        },
        () => {}
      ),
    /root_mode|until = "converged"/i
  );
});
