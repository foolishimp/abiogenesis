import {
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  compose,
  edge,
  graphFunctionForVector
} from "../../../build/semantic/code/src/index.js";

function node(id, name, kind, markov) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `Vector[${kind}]` },
    markov: [markov],
    assetSurface: {
      kind,
      requiredContexts: ["workspace"],
      standardsRefs: [`${kind}-standard`],
      outputContractRefs: [`${kind}-contract`]
    },
    tags: [kind]
  });
}

function stageGraphFunction(name, source, target, edgeName, evaluatorId) {
  const vector = edge([source], target, {
    id: `graph-${name}`,
    name: edgeName,
    evaluators: [
      {
        name: evaluatorId,
        regime: "F_P",
        description: `${edgeName} accepted`,
        binding: `binding://${name}`,
        tags: ["fulfillment"]
      }
    ],
    declarations: { entries: [] },
    tags: ["m03_iteration"]
  }).vectors[0];

  return graphFunctionForVector(vector, {
    name,
    declarations: { entries: [] },
    tags: ["m03_iteration"]
  });
}

export function buildThreeStageBasis() {
  const inputSet = node("node-m03-input-set", "InputSet", "input_set", "declared");
  const requirements = node(
    "node-m03-requirements",
    "Requirements",
    "requirements",
    "captured"
  );
  const design = node("node-m03-design", "Design", "design", "derived");
  const code = node("node-m03-code", "Code", "code", "implemented");

  const executive = compose(
    stageGraphFunction(
      "capture_requirements",
      inputSet,
      requirements,
      "input_set→requirements",
      "requirements_ready"
    ),
    stageGraphFunction(
      "synthesize_design",
      requirements,
      design,
      "requirements→design",
      "design_ready"
    ),
    stageGraphFunction(
      "implement_code",
      design,
      code,
      "design→code",
      "code_ready"
    )
  );

  const module = admitModule({
    name: "m03_iteration_module",
    graphs: [],
    graphFunctions: [executive],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job-m03-iteration",
        name: "m03_iteration_job",
        contracts: [{ kind: "graph_function", targetId: executive.id }],
        roles: [],
        tags: ["semantic_work"]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });

  return admitExecutionBasis({
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/m03-iteration",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: executive.name
      },
      until: "converged"
    },
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://m03-iteration",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://m03-iteration",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://m03-iteration"
    }),
    runId: "run://m03-iteration",
    workKey: "wk://m03-iteration",
    frameId: null,
    frameLineageId: null
  });
}
