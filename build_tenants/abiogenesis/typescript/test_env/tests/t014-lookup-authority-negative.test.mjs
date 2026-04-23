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
    id: "node-t014-design",
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
    id: "node-t014-code",
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
    id: "role-reviewer-t014",
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
                      value: "lookup_review"
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

function publishedProfile({ id, name }) {
  const design = admitNode(designNode());
  const code = admitNode(codeNode());
  return graphFunctionForVector(
    edge([design], code, {
      id: `graph-${id}`,
      name: `design→code:${name}`,
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
    workerId: "worker://typescript-t014",
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
      workspaceRoot: "/workspace/t014",
      moduleName
    },
    target: {
      kind: "graph_function",
      handle
    },
    until: "converged"
  });
}

test("T-014 negative proof: ambiguous published callable handle still fails closed", () => {
  const byId = publishedProfile({
    id: "graph-function-ambiguous-by-id",
    name: "profile_by_id"
  });
  const byName = publishedProfile({
    id: "graph-function-profile-by-name",
    name: byId.id
  });
  const module = admitModule(
    modulePayload({
      moduleName: "abiogenesis.lookup_ambiguous",
      graphFunctions: [byId, byName],
      jobs: [
        jobPayload({
          id: "job-shared-by-id",
          name: "job_shared_by_id",
          graphFunctionId: byId.id
        }),
        jobPayload({
          id: "job-shared-by-name",
          name: "job_shared_by_name",
          graphFunctionId: byName.id
        })
      ]
    })
  );

  assert.throws(
    () =>
      admitExecutionBasis({
        startIntent: startIntent(byId.id, module.name),
        module,
        runtimeIdentity: runtimeIdentity(),
        resolvedPolicy: resolvedPolicy()
      }),
    /multiple graph functions/i
  );
});

test("T-014 negative proof: missing semantic job binding still fails closed through lookup authority", () => {
  const profile = publishedProfile({
    id: "graph-function-without-job",
    name: "without_job"
  });
  const module = admitModule(
    modulePayload({
      moduleName: "abiogenesis.lookup_missing_job",
      graphFunctions: [profile],
      jobs: []
    })
  );

  assert.throws(
    () =>
      admitExecutionBasis({
        startIntent: startIntent(profile.name, module.name),
        module,
        runtimeIdentity: runtimeIdentity(),
        resolvedPolicy: resolvedPolicy()
      }),
    /no semantic job/i
  );
});

test("T-014 negative proof: mismatched lookup authority is rejected before execution-basis construction", () => {
  const primary = publishedProfile({
    id: "graph-function-primary",
    name: "primary"
  });
  const secondary = publishedProfile({
    id: "graph-function-secondary",
    name: "secondary"
  });
  const primaryModule = admitModule(
    modulePayload({
      moduleName: "abiogenesis.lookup_primary",
      graphFunctions: [primary],
      jobs: [
        jobPayload({
          id: "job-primary",
          name: "job_primary",
          graphFunctionId: primary.id
        })
      ]
    })
  );
  const secondaryModule = admitModule(
    modulePayload({
      moduleName: "abiogenesis.lookup_secondary",
      graphFunctions: [secondary],
      jobs: [
        jobPayload({
          id: "job-secondary",
          name: "job_secondary",
          graphFunctionId: secondary.id
        })
      ]
    })
  );

  assert.throws(
    () =>
      admitExecutionBasis({
        startIntent: startIntent(primary.name, primaryModule.name),
        module: primaryModule,
        lookupAuthority: constructModuleLookupAuthority(secondaryModule),
        runtimeIdentity: runtimeIdentity(),
        resolvedPolicy: resolvedPolicy()
      }),
    /lookupAuthority\.moduleName/i
  );
});
