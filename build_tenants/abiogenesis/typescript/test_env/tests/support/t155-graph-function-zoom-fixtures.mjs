import {
  ABG_FN_COMPOSITION_DECLARATION_KEY,
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  compose,
  edge,
  graphFunctionForVector,
  GRAPH_FUNCTION_ZOOM_CANDIDATE_FAMILY_DECLARATION_KEY,
  GRAPH_FUNCTION_ZOOM_REFINEMENT_BOUNDARY_DECLARATION_KEY,
  materializeGraphFunction,
  zoomGraphFunction
} from "../../../build/semantic/code/src/index.js";

export const T155_REFINEMENT_BOUNDARY_REF =
  "refinement-boundary://t155/requirements-code-depth";
export const T155_CANDIDATE_FAMILY_REF =
  "candidate-family://t155/design-code-test-depth";

export function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "scalar", value })
  });
}

export function emptyAttrs() {
  return Object.freeze({ entries: Object.freeze([]) });
}

export function attrs(entries) {
  return Object.freeze({ entries: Object.freeze([...entries]) });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list",
      value: Object.freeze([...value])
    })
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
      bindingRef: "regime-binding://t155/transform/fd",
      stageRole: "transform",
      regime: "F_D",
      role: "construct",
      order: 0,
      authority: "evidence",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["ComposedStageTaskOutcome"],
      evidenceRefs: ["evidence://t155/fd-transform"]
    },
    {
      bindingRef: "regime-binding://t155/evaluate/fd",
      stageRole: "evaluate",
      regime: "F_D",
      role: "validate",
      order: 1,
      authority: "closure",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["FdEvaluationOutcome"],
      evidenceRefs: ["evidence://t155/fd-evaluate"]
    },
    {
      bindingRef: "regime-binding://t155/consequence/fd",
      stageRole: "consequence",
      regime: "F_D",
      role: "observe",
      order: 2,
      authority: "evidence",
      inputCarrierRefs: ["EnginePluginInput"],
      outputCarrierRefs: ["ConsequenceProjectionOutcome"],
      evidenceRefs: ["evidence://t155/consequence"]
    }
  ]);
  return attrs([
    {
      key: ABG_FN_COMPOSITION_DECLARATION_KEY,
      value: Object.freeze({
        kind: "hook_ref",
        value: Object.freeze({
          ref: "hook://t155/abg-fn-composition",
          config: attrs([
            scalarEntry("contract_ref", "abg.fn_composition://t155/default"),
            stringListEntry("standards_context_refs", ["standard://t155"]),
            stringListEntry("policy_context_refs", ["policy://t155"]),
            stringListEntry("carrier_context_refs", ["carrier://t155"]),
            stringListEntry("assurance_context_refs", ["assurance://t155"]),
            scalarEntry(
              "closure_contract_ref",
              "closure://t155/fd-evaluate"
            ),
            jsonEntry("regime_bindings", regimeBindings)
          ])
        })
      })
    }
  ]);
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
      standardsRefs: [`standard://${kind}`],
      outputContractRefs: [`contract://${kind}`]
    },
    tags: ["t155", kind]
  });
}

function vectorFunction(name, source, target, declarations = emptyAttrs()) {
  const vector = edge([source], target, {
    id: `vector://t155/${name}`,
    name,
    evaluators: [
      {
        name: `fd:${name}`,
        regime: "F_D",
        description: `${name} deterministic acceptance`,
        binding: `binding://t155/${name}`,
        consumedFieldRefs: [],
        tags: ["t155", "fd"]
      }
    ],
    declarations,
    tags: ["t155"]
  }).vectors[0];
  return graphFunctionForVector(vector, {
    name: `fn:${name}`,
    declarations: fnCompositionDeclarations(),
    tags: ["t155"]
  });
}

export function buildT155ZoomFixture() {
  const requirements = node(
    "node://t155/requirements",
    "Requirements",
    "requirements",
    "captured"
  );
  const design = node("node://t155/design", "Design", "design", "derived");
  const tests = node("node://t155/tests", "Tests", "tests", "planned");
  const code = node("node://t155/code", "Code", "code", "implemented");

  const coarse = vectorFunction(
    "requirements→code",
    requirements,
    code,
    attrs([
      scalarEntry(
        GRAPH_FUNCTION_ZOOM_REFINEMENT_BOUNDARY_DECLARATION_KEY,
        T155_REFINEMENT_BOUNDARY_REF
      )
    ])
  );
  const requirementsToDesign = vectorFunction(
    "requirements→design",
    requirements,
    design
  );
  const designToCode = vectorFunction(
    "design→code",
    design,
    code,
    attrs([
      scalarEntry(
        GRAPH_FUNCTION_ZOOM_CANDIDATE_FAMILY_DECLARATION_KEY,
        T155_CANDIDATE_FAMILY_REF
      )
    ])
  );
  const designToTests = vectorFunction("design→tests", design, tests);
  const testsToCode = vectorFunction("tests→code", tests, code);

  const refinement = compose(requirementsToDesign, designToCode);
  const recursiveRefinement = compose(designToTests, testsToCode);

  return Object.freeze({
    nodes: Object.freeze({ requirements, design, tests, code }),
    parent: coarse,
    refinement,
    recursiveRefinement
  });
}

export function buildT155ZoomedGraphFunction() {
  const fixture = buildT155ZoomFixture();
  const first = zoomGraphFunction({
    parent: fixture.parent,
    refinement: fixture.refinement,
    refinementBoundaryRef: T155_REFINEMENT_BOUNDARY_REF,
    name: "fn:requirements→code:zoomed",
    tags: ["t155", "zoomed"]
  });
  return Object.freeze({ fixture, first });
}

export function buildT155ZoomedBasis() {
  const { fixture, first } = buildT155ZoomedGraphFunction();
  const zoomed = first.graphFunction;
  const module = admitModule({
    name: "t155_zoom_module",
    graphs: [materializeGraphFunction(zoomed)],
    graphFunctions: [fixture.parent, fixture.refinement, zoomed],
    refinementBoundaries: [
      {
        id: T155_REFINEMENT_BOUNDARY_REF,
        name: "requirements_code_depth",
        inputs: fixture.parent.inputs,
        outputs: fixture.parent.outputs,
        hints: emptyAttrs(),
        tags: ["t155"]
      }
    ],
    candidateFamilies: [],
    jobs: [
      {
        id: "job://t155/zoomed",
        name: "t155_zoomed_job",
        contracts: [{ kind: "graph_function", targetId: zoomed.id }],
        roles: [],
        tags: ["t155"],
        policyHooks: emptyAttrs()
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptyAttrs(),
    metadata: emptyAttrs()
  });

  const basis = admitExecutionBasis({
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t155-zoom",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: zoomed.name
      },
      until: "converged"
    },
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://t155",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t155",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    }),
    runId: "run://t155/zoomed-live",
    workKey: "work-key://t155/zoomed-live",
    frameId: null,
    frameLineageId: null
  });

  return Object.freeze({ fixture, first, zoomed, module, basis });
}
