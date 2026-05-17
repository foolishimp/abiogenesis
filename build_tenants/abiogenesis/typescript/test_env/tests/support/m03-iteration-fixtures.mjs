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

function stageGraphFunction(name, source, target, edgeName, evaluatorId, regime) {
  const vector = edge([source], target, {
    id: `graph-${name}`,
    name: edgeName,
    evaluators: [
      {
        name: evaluatorId,
        regime,
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

export function buildThreeStageModule(options = {}) {
  const vectorRegimes = options.vectorRegimes ?? [
    options.defaultRegime ?? "F_P",
    options.defaultRegime ?? "F_P",
    options.defaultRegime ?? "F_P"
  ];
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
      "requirements_ready",
      vectorRegimes[0]
    ),
    stageGraphFunction(
      "synthesize_design",
      requirements,
      design,
      "requirements→design",
      "design_ready",
      vectorRegimes[1]
    ),
    stageGraphFunction(
      "implement_code",
      design,
      code,
      "design→code",
      "code_ready",
      vectorRegimes[2]
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

  return Object.freeze({ module, executive });
}

export function buildThreeStageBasis(options = {}) {
  const defaultRegime = options.defaultRegime ?? "F_P";
  const { module, executive } = buildThreeStageModule({
    defaultRegime,
    vectorRegimes: options.vectorRegimes
  });
  const dispatchRef =
    Object.hasOwn(options, "dispatchRef")
      ? options.dispatchRef
      : defaultRegime === "F_P"
        ? "dispatch://m03-iteration"
        : null;
  const approvalSubjectRef =
    Object.hasOwn(options, "approvalSubjectRef")
      ? options.approvalSubjectRef
      : defaultRegime === "F_H"
        ? "approval://m03-iteration"
        : null;

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
      defaultRegime,
      dispatchRef,
      approvalSubjectRef
    }),
    runId: options.runId ?? "run://m03-iteration",
    workKey: options.workKey ?? "wk://m03-iteration",
    frameId: options.frameId ?? null,
    frameLineageId: options.frameLineageId ?? null
  });
}

export function buildThreeStageStartContext(options = {}) {
  const defaultRegime = options.defaultRegime ?? "F_D";
  const { module, executive } = buildThreeStageModule({
    defaultRegime,
    vectorRegimes: options.vectorRegimes
  });
  const dispatchRef =
    Object.hasOwn(options, "dispatchRef")
      ? options.dispatchRef
      : defaultRegime === "F_P"
        ? "dispatch://m03-iteration"
        : null;
  const approvalSubjectRef =
    Object.hasOwn(options, "approvalSubjectRef")
      ? options.approvalSubjectRef
      : defaultRegime === "F_H"
        ? "approval://m03-iteration"
        : null;
  const input = Object.freeze({
    scope: {
      kind: "workspace",
      workspaceRoot: "/workspace/m03-iteration",
      moduleName: module.name
    },
    target: {
      kind: "graph_function",
      handle: executive.name
    },
    until: options.until ?? "converged"
  });
  const context = Object.freeze({
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://m03-iteration",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://m03-iteration",
      defaultRegime,
      dispatchRef,
      approvalSubjectRef
    }),
    runId: options.runId ?? "run://m03-iteration",
    workKey: options.workKey ?? "wk://m03-iteration",
    frameId: options.frameId ?? null,
    frameLineageId: options.frameLineageId ?? null
  });

  return Object.freeze({ input, context, module, executive });
}
