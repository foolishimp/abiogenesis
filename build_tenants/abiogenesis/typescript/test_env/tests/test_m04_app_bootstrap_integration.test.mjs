// Validates: REQ-P-POLICY
// Validates: REQ-P-POLICY-004
// Validates: REQ-P-POLICY-008
// Validates: REQ-P-POLICY-009
// Validates: REQ-P-POLICY-011
// Validates: REQ-P-POLICY-012
// Validates: REQ-P-POLICY-013
// Validates: REQ-R-ABG3-BINDING
// Validates: REQ-R-ABG3-BINDING-002
// Validates: REQ-R-ABG3-BINDING-003
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-EVENTS-001

import test from "node:test";
import assert from "node:assert/strict";

import { edge, graphFunctionForVector } from "../../build/semantic/code/src/gtl/m01/algebra/core.js";
import { admitNode } from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import { admitModule } from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import {
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity
} from "../../build/semantic/code/src/abg/m03/index.js";
import { publicStart } from "../../build/semantic/code/src/app/m04/index.js";

function designNode(overrides = {}) {
  return {
    id: "node-m04-int-design",
    name: "Design",
    schema: { kind: "symbolic", ref: "Vector[design]" },
    markov: ["derived"],
    assetSurface: {
      kind: "design",
      requiredContexts: ["workspace"],
      standardsRefs: ["design-standard"],
      outputContractRefs: ["design-contract"]
    },
    tags: ["input"],
    ...overrides
  };
}

function codeNode(overrides = {}) {
  return {
    id: "node-m04-int-code",
    name: "Code",
    schema: { kind: "symbolic", ref: "Vector[code]" },
    markov: ["implemented"],
    assetSurface: {
      kind: "code",
      requiredContexts: ["workspace"],
      standardsRefs: ["code-standard"],
      outputContractRefs: ["code-contract"]
    },
    tags: ["output"],
    ...overrides
  };
}

function reviewerRolePayload(overrides = {}) {
  return {
    id: "role-reviewer-m04-int",
    name: "reviewer",
    tags: ["approval"],
    policyHooks: {
      entries: [
        {
          key: "authority",
          value: {
            kind: "hook_ref",
            value: {
              ref: "hook://authority/reviewer",
              config: {
                entries: [
                  {
                    key: "scope",
                    value: {
                      kind: "scalar",
                      value: "public_start_runtime"
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    },
    ...overrides
  };
}

function publishedProfile({ id, name, graphId, graphName }) {
  const design = admitNode(designNode());
  const code = admitNode(codeNode());
  return graphFunctionForVector(
    edge([design], code, {
      id: graphId,
      name: graphName,
      declarations: { entries: [] }
    }).vectors[0],
    {
      id,
      name,
      declarations: { entries: [] }
    }
  );
}

function modulePayload({ moduleName, graphFunctions, jobs }) {
  const graphs = graphFunctions.map((graphFunction) => graphFunction.template.graph);
  return {
    name: moduleName,
    graphs,
    graphFunctions,
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs,
    roles: [reviewerRolePayload()],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  };
}

function jobPayload({ id, name, graphFunctionId }) {
  return {
    id,
    name,
    contracts: [
      {
        kind: "graph_function",
        targetId: graphFunctionId
      }
    ],
    roles: [reviewerRolePayload()],
    tags: ["semantic_work"]
  };
}

function runtimeIdentity() {
  return admitResolvedRuntimeIdentity({
    workerId: "worker://typescript-public-start",
    backendId: "backend://node",
    buildId: "build://typescript-dev",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

function requestPayload(handle, overrides = {}) {
  return {
    scope: {
      kind: "workspace",
      workspaceRoot: "/workspace/demo",
      moduleName: "abiogenesis.public_runtime"
    },
    target: {
      kind: "graph_function",
      handle
    },
    until: "converged",
    ...overrides
  };
}

test("M04 integration: publicStart routes through M03 emit for F_D and stays stable through package exports", async () => {
  const profile = publishedProfile({
    id: "graph-function-m04-int-fd",
    name: "public_profile_fd",
    graphId: "graph-m04-int-fd",
    graphName: "design→code:m04-int-fd"
  });
  const module = admitModule(
    modulePayload({
      moduleName: "abiogenesis.public_runtime",
      graphFunctions: [profile],
      jobs: [
        jobPayload({
          id: "job-m04-int-fd",
          name: "public_profile_fd_job",
          graphFunctionId: profile.id
        })
      ]
    })
  );
  const events = [];
  const outcome = publicStart(
    requestPayload(profile.name),
    {
      module,
      runtimeIdentity: runtimeIdentity(),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://public-fd",
        defaultRegime: "F_D"
      }),
      runId: "run://m04-int-fd",
      workKey: "wk://m04-int-fd"
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "advanced");
  assert.deepStrictEqual(events.map((event) => event.kind), [
    "basis_admitted",
    "fd_advance_ready"
  ]);
  assert.equal(outcome.runtimeIdentity.resolvedRuntimeRef, "runtime://typescript/node");

  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  assert.equal(root.publicStart, publicStart);
  assert.equal(m04.publicStart, publicStart);
});

test("M04 integration: publicStart preserves kernel dispatch truth as a blocked public outcome", () => {
  const profile = publishedProfile({
    id: "graph-function-m04-int-fp",
    name: "public_profile_fp",
    graphId: "graph-m04-int-fp",
    graphName: "design→code:m04-int-fp"
  });
  const module = admitModule(
    modulePayload({
      moduleName: "abiogenesis.public_runtime",
      graphFunctions: [profile],
      jobs: [
        jobPayload({
          id: "job-m04-int-fp",
          name: "public_profile_fp_job",
          graphFunctionId: profile.id
        })
      ]
    })
  );
  const events = [];
  const outcome = publicStart(
    requestPayload(profile.name),
    {
      module,
      runtimeIdentity: runtimeIdentity(),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://public-fp",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://public-fp"
      }),
      runId: "run://m04-int-fp",
      workKey: "wk://m04-int-fp"
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "blocked");
  assert.equal(outcome.stopPredicate, "dispatch_required");
  assert.deepStrictEqual(events.map((event) => event.kind), [
    "basis_admitted",
    "fp_dispatch_requested"
  ]);
  assert.equal(outcome.stopDetail.dispatchRef, "dispatch://public-fp");
});

test("M04 integration: explicit runtime selector mismatch rejects before kernel routing", () => {
  const profile = publishedProfile({
    id: "graph-function-m04-int-mismatch",
    name: "public_profile_mismatch",
    graphId: "graph-m04-int-mismatch",
    graphName: "design→code:m04-int-mismatch"
  });
  const module = admitModule(
    modulePayload({
      moduleName: "abiogenesis.public_runtime",
      graphFunctions: [profile],
      jobs: [
        jobPayload({
          id: "job-m04-int-mismatch",
          name: "public_profile_mismatch_job",
          graphFunctionId: profile.id
        })
      ]
    })
  );
  const events = [];
  const outcome = publicStart(
    requestPayload(profile.name, {
      runtime_selector: {
        worker_ref: "worker://different-runtime"
      }
    }),
    {
      module,
      runtimeIdentity: runtimeIdentity(),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://public-fd",
        defaultRegime: "F_D"
      })
    },
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "rejected");
  assert.match(outcome.reason, /configured worker selector/i);
  assert.equal(events.length, 0);
  assert.equal(
    outcome.runtimeIdentity?.resolvedRuntimeRef,
    "runtime://typescript/node"
  );
});
