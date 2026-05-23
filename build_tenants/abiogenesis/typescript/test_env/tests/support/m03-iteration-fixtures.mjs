import {
  ABG_FN_COMPOSITION_DECLARATION_KEY,
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  compose,
  edge,
  graphFunctionForVector
} from "../../../build/semantic/code/src/index.js";

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "scalar", value })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "string_list", value: Object.freeze([...value]) })
  });
}

function jsonValue(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze({
      kind: "array",
      items: Object.freeze(value.map(jsonValue))
    });
  }
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      Object.entries(value).map(([key, entryValue]) =>
        Object.freeze({ key, value: jsonValue(entryValue) })
      )
    )
  });
}

function jsonEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "json_blob", value: jsonValue(value) })
  });
}

function fnCompositionDeclarations() {
  const regimeBindings = Object.freeze([
    {
      bindingRef: "regime-binding://m03-iteration/transform/fd",
      stageRole: "transform",
      regime: "F_D",
      role: "construct",
      order: 0,
      authority: "evidence",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["ComposedStageTaskOutcome"],
      evidenceRefs: ["evidence://m03-iteration/fd-transform"]
    },
    {
      bindingRef: "regime-binding://m03-iteration/transform/fp",
      stageRole: "transform",
      regime: "F_P",
      role: "construct",
      order: 1,
      authority: "evidence",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["FpDispatchOutcome"],
      evidenceRefs: ["evidence://m03-iteration/fp-transform"]
    },
    {
      bindingRef: "regime-binding://m03-iteration/evaluate/fd",
      stageRole: "evaluate",
      regime: "F_D",
      role: "validate",
      order: 2,
      authority: "closure",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["FdEvaluationOutcome"],
      evidenceRefs: ["evidence://m03-iteration/fd-evaluate"]
    },
    {
      bindingRef: "regime-binding://m03-iteration/evaluate/fp",
      stageRole: "evaluate",
      regime: "F_P",
      role: "validate",
      order: 3,
      authority: "judgment",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["FpEvaluationOutcome"],
      evidenceRefs: ["evidence://m03-iteration/fp-evaluate"]
    },
    {
      bindingRef: "regime-binding://m03-iteration/consequence/fd",
      stageRole: "consequence",
      regime: "F_D",
      role: "observe",
      order: 4,
      authority: "evidence",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["ConsequenceProjectionOutcome"],
      evidenceRefs: ["evidence://m03-iteration/consequence"]
    },
    {
      bindingRef: "regime-binding://m03-iteration/human-callout/fh",
      stageRole: "human_callout",
      regime: "F_H",
      role: "escalate",
      order: 5,
      authority: "judgment",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["FhAdmissionOutcome"],
      evidenceRefs: ["evidence://m03-iteration/fh-callout"]
    }
  ]);
  return Object.freeze({
    entries: Object.freeze([
      Object.freeze({
        key: ABG_FN_COMPOSITION_DECLARATION_KEY,
        value: Object.freeze({
          kind: "hook_ref",
          value: Object.freeze({
            ref: "hook://m03-iteration/abg-fn-composition",
            config: Object.freeze({
              entries: Object.freeze([
                scalarEntry(
                  "contract_ref",
                  "abg.fn_composition://m03-iteration/default"
                ),
                stringListEntry("standards_context_refs", [
                  "standard://m03-iteration"
                ]),
                stringListEntry("policy_context_refs", [
                  "policy://m03-iteration"
                ]),
                stringListEntry("carrier_context_refs", [
                  "carrier://m03-iteration"
                ]),
                stringListEntry("assurance_context_refs", [
                  "assurance://m03-iteration"
                ]),
                scalarEntry(
                  "closure_contract_ref",
                  "closure://m03-iteration/fd-evaluate"
                ),
                jsonEntry("regime_bindings", regimeBindings)
              ])
            })
          })
        })
      })
    ])
  });
}

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

function stageGraphFunction(
  name,
  source,
  target,
  edgeName,
  evaluatorId,
  regime,
  includeComposition
) {
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
    declarations: includeComposition ? fnCompositionDeclarations() : { entries: [] },
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
      vectorRegimes[0],
      options.includeComposition !== false
    ),
    stageGraphFunction(
      "synthesize_design",
      requirements,
      design,
      "requirements→design",
      "design_ready",
      vectorRegimes[1],
      options.includeComposition !== false
    ),
    stageGraphFunction(
      "implement_code",
      design,
      code,
      "design→code",
      "code_ready",
      vectorRegimes[2],
      options.includeComposition !== false
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
    vectorRegimes: options.vectorRegimes,
    includeComposition: options.includeComposition
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
    vectorRegimes: options.vectorRegimes,
    includeComposition: options.includeComposition
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
