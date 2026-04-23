import { edge, graphFunctionForVector } from "../../../build/semantic/code/src/gtl/m01/algebra/core.js";
import { admitNode } from "../../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import { admitModule } from "../../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import {
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity
} from "../../../build/semantic/code/src/abg/m03/index.js";

function designNode(overrides = {}) {
  return {
    id: "node-m04-shared-design",
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
    id: "node-m04-shared-code",
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
    id: "role-reviewer-m04-shared",
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
                      value: "public_runtime"
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

export function publishedProfile({ id, name, graphId, graphName }) {
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

export function modulePayload({ moduleName, graphFunctions, jobs }) {
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

export function jobPayload({ id, name, graphFunctionId }) {
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

export function admitRuntimeModule({
  moduleName = "abiogenesis.public_runtime",
  graphFunctions,
  jobs
}) {
  return admitModule(
    modulePayload({
      moduleName,
      graphFunctions,
      jobs
    })
  );
}

export function emptyModule() {
  return admitRuntimeModule({
    graphFunctions: [],
    jobs: []
  });
}

export function runtimeIdentity() {
  return admitResolvedRuntimeIdentity({
    workerId: "worker://typescript-public-start",
    backendId: "backend://node",
    buildId: "build://typescript-dev",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

export function resolvedPolicyIdentity(overrides = {}) {
  return admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: "policy://public-fd",
    defaultRegime: "F_D",
    ...overrides
  });
}

export function requestPayload(handle, overrides = {}) {
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

export function controlLoopPayload(handle, overrides = {}, startOverrides = {}) {
  return {
    start_request: requestPayload(handle, startOverrides),
    ...overrides
  };
}
