import test from "node:test";
import assert from "node:assert/strict";

import { edge, graphFunctionForVector } from "../../build/semantic/code/src/gtl/m01/algebra/core.js";
import { admitNode } from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import { admitModule } from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import { constructModuleLookupAuthority } from "../../build/semantic/code/src/gtl/m02/contracts/lookup.js";
import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent
} from "../../build/semantic/code/src/abg/m03/index.js";

function designNode(overrides = {}) {
  return {
    id: "node-t014-integration-design",
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
    id: "node-t014-integration-code",
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
    id: "role-reviewer-t014-integration",
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
                      value: "lookup_integration"
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

function modulePayload({ moduleName, graphFunctions, jobs }) {
  return {
    name: moduleName,
    graphs: graphFunctions.map((graphFunction) => graphFunction.template.graph),
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

function runtimeIdentity() {
  return admitResolvedRuntimeIdentity({
    workerId: "worker://typescript-t014-integration",
    backendId: "backend://node",
    buildId: "build://typescript-dev",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

function resolvedPolicy() {
  return admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: "policy://fd-default",
    defaultRegime: "F_D"
  });
}

function startIntent(handle, moduleName) {
  return admitStartIntent({
    scope: {
      kind: "workspace",
      workspaceRoot: "/workspace/t014-integration",
      moduleName
    },
    target: {
      kind: "graph_function",
      handle
    },
    until: "converged"
  });
}

test("T-014 integration: execution-basis admission resolves published callable truth through explicit lookup authority", async () => {
  const primary = publishedProfile({
    id: "graph-function-lookup-primary",
    name: "lookup_primary",
    graphId: "graph-t014-primary",
    graphName: "design→code:lookup-primary"
  });
  const alternate = publishedProfile({
    id: "graph-function-lookup-alternate",
    name: "lookup_alternate",
    graphId: "graph-t014-alternate",
    graphName: "design→code:lookup-alternate"
  });
  const module = admitModule(
    modulePayload({
      moduleName: "abiogenesis.lookup_library",
      graphFunctions: [primary, alternate],
      jobs: [
        jobPayload({
          id: "job-lookup-primary",
          name: "job_lookup_primary",
          graphFunctionId: primary.id
        }),
        jobPayload({
          id: "job-lookup-alternate",
          name: "job_lookup_alternate",
          graphFunctionId: alternate.id
        })
      ]
    })
  );
  const lookupAuthority = constructModuleLookupAuthority(module);

  const byName = admitExecutionBasis({
    startIntent: startIntent(primary.name, module.name),
    module,
    lookupAuthority,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: resolvedPolicy(),
    runId: "run://lookup-name",
    workKey: "wk://lookup-name"
  });
  const byId = admitExecutionBasis({
    startIntent: startIntent(alternate.id, module.name),
    module,
    lookupAuthority,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: resolvedPolicy(),
    runId: "run://lookup-id",
    workKey: "wk://lookup-id"
  });

  assert.equal(byName.graphFunction.id, primary.id);
  assert.equal(byName.job.id, "job-lookup-primary");
  assert.equal(byId.graphFunction.id, alternate.id);
  assert.equal(byId.job.id, "job-lookup-alternate");
  assert.equal(lookupAuthority.moduleName, module.name);
  assert.equal(lookupAuthority.graphFunctionHandles.length, 4);
  assert.equal(lookupAuthority.semanticJobs.length, 2);

  const root = await import("@abiogenesis/typescript-tenant");
  const m02 = await import("@abiogenesis/typescript-tenant/gtl/m02");
  const m03 = await import("@abiogenesis/typescript-tenant/abg/m03");

  assert.equal(typeof root.admitModule, "function");
  assert.equal(typeof root.admitExecutionBasis, "function");
  assert.equal(root.admitModule, m02.admitModule);
  assert.equal(root.admitExecutionBasis, m03.admitExecutionBasis);
  assert.equal("constructModuleLookupAuthority" in root, false);
  assert.equal("constructModuleLookupAuthority" in m02, false);
});
