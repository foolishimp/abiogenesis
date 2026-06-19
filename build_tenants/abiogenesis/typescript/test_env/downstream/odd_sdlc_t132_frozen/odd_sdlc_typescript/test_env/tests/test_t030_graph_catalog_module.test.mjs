// Validates: REQ-F-ODDSDLC-013
// Validates: REQ-F-ODDSDLC-014
// Validates: REQ-F-ODDSDLC-015
// Validates: REQ-F-ODDSDLC-021
// Validates: REQ-F-ODDSDLC-038
// Validates: REQ-F-ODDSDLC-057
// Investigates: T-030

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  admitExecutionBasis,
  admitModule,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  deriveTraversalStructureProbe,
  runEngineIterateAsync,
  constructEnginePluginContract,
  constructFpDispatchOutcome
} from "@abiogenesis/typescript-tenant";

import {
  BOOTSTRAP_RELEASE_FUNCTION_CATALOG,
  BOOTSTRAP_REQUIREMENTS_EXECUTIVE_STEPS,
  OPERATIONAL_FUNCTION_CATALOG,
  OPTIMISING_FUNCTION_CATALOG,
  LITE_FUNCTION_CATALOG,
  SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG,
  SOLUTION_ARCHITECTURE_EXECUTIVE_STEPS,
  TRIAGE_FUNCTION_CATALOG,
  LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE_STEPS,
  OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
  FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
  FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
  FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
  FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE,
  FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
  FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
  FG_SOLUTION_ARCHITECTURE_EXECUTIVE,
  assertSdlcModuleJobsTargetPublishedGraphFunctions,
  constructSdlcGraphFunctionCatalog,
  constructSdlcGtlModule,
  FG_AMBIGUITY_ASSURANCE_LEDGER,
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_CAPABILITY_ASSURANCE_LEDGER,
  FG_CONFORM_PROJECT,
  FG_GRAPH_CODE_BUILDER,
  FG_INGRESS_PROJECT,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  FG_MATERIALIZATION_ASSURANCE_LEDGER,
  FG_OBLIGATION_CARRY_ASSURANCE_LEDGER,
  FG_REQUIREMENT_FULFILLMENT_ASSURANCE_LEDGER,
  FG_SEMANTIC_CONVERGENCE_ASSURANCE_LEDGER,
  FG_SHALLOW_REALIZATION_ASSURANCE_LEDGER,
  FG_SINGLE_TYPED_TRAVERSAL,
  FG_TRAVERSAL_ASSURANCE_FOLD
} from "../../build/semantic/code/src/index.js";

const ASSURANCE_GRAPH_FUNCTION_NAMES = [
  FG_MATERIALIZATION_ASSURANCE_LEDGER,
  FG_SEMANTIC_CONVERGENCE_ASSURANCE_LEDGER,
  FG_OBLIGATION_CARRY_ASSURANCE_LEDGER,
  FG_REQUIREMENT_FULFILLMENT_ASSURANCE_LEDGER,
  FG_AMBIGUITY_ASSURANCE_LEDGER,
  FG_CAPABILITY_ASSURANCE_LEDGER,
  FG_SHALLOW_REALIZATION_ASSURANCE_LEDGER,
  FG_TRAVERSAL_ASSURANCE_FOLD
];

const RETIRED_OPTIMIZED_EXECUTIVE_EDGE_NAMES = Object.freeze([
  "Fg_conform_project_authority",
  "select_implementation_stack_profile",
  "derive_implementation_module_surface",
  "derive_aggregate_domain_model_surface",
  "derive_implementation_component_topology_surface",
  "derive_aggregate_sunny_day_sequence_surface",
  "derive_component_realization_schedule_surface",
  "select_test_stack_profile",
  "derive_test_module_surface",
  "derive_test_component_topology_surface",
  "derive_test_schedule_surface",
  "qualify_testcase_authority"
]);

function basisFor(module, handle) {
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/odd-sdlc-typescript-gtl-module",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle
      },
      until: "converged"
    }),
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/typescript",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t030/F_P",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t030",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t030",
    workKey: "wk://odd-sdlc/t030",
    frameId: null,
    frameLineageId: null
  });
}

test("T-030 publishes machine-readable function and executive catalogs", () => {
  const catalog = constructSdlcGraphFunctionCatalog();

  assert.equal(catalog.kind, "sdlc_graph_function_catalog");
  assert.equal(
    catalog.functions.length,
    OPTIMISING_FUNCTION_CATALOG.length +
      BOOTSTRAP_RELEASE_FUNCTION_CATALOG.length +
      LITE_FUNCTION_CATALOG.length +
      OPERATIONAL_FUNCTION_CATALOG.length +
      TRIAGE_FUNCTION_CATALOG.length
  );
  assert.deepStrictEqual(
    catalog.libraryFunctions.map((entry) => entry.name),
    [
      FG_SINGLE_TYPED_TRAVERSAL,
      FG_INGRESS_PROJECT,
      FG_CONFORM_PROJECT,
      FG_CONFORM_PROJECT_AUTHORITY,
      FG_GRAPH_CODE_BUILDER,
      FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
      FG_MATERIALIZATION_ASSURANCE_LEDGER,
      FG_SEMANTIC_CONVERGENCE_ASSURANCE_LEDGER,
      FG_OBLIGATION_CARRY_ASSURANCE_LEDGER,
      FG_REQUIREMENT_FULFILLMENT_ASSURANCE_LEDGER,
      FG_AMBIGUITY_ASSURANCE_LEDGER,
      FG_CAPABILITY_ASSURANCE_LEDGER,
      FG_SHALLOW_REALIZATION_ASSURANCE_LEDGER,
      FG_TRAVERSAL_ASSURANCE_FOLD
    ]
  );
  assert(
    catalog.functions.every((entry) =>
      entry.specializesGraphFunction === FG_SINGLE_TYPED_TRAVERSAL ||
      entry.specializesGraphFunction === FG_GRAPH_CODE_BUILDER
    )
  );
  assert.equal(
    catalog.functions.find((entry) => entry.name === "derive_component_code_surface")
      ?.specializesGraphFunction,
    FG_GRAPH_CODE_BUILDER
  );
  assert.equal(
    catalog.functions.find((entry) => entry.name === "derive_component_test_surface")
      ?.specializesGraphFunction,
    FG_GRAPH_CODE_BUILDER
  );
  assert.deepStrictEqual(
    catalog.functions.find((entry) => entry.name === "derive_component_test_surface")
      ?.inputs,
    [
      "requirement_surface",
      "testcase_authority_surface",
      "selected_tenant_surface",
      "test_design_surface",
      "implementation_design_surface"
    ]
  );
  assert(catalog.functions.some((entry) => entry.name === "observe_gap_pressure"));
  assert(catalog.functions.some((entry) => entry.name === "retire_gap_after_loopback"));
  assert.deepStrictEqual(
    catalog.executives.map((entry) => entry.name),
    [
      "bootstrap_release_self_test",
      "release_operational_cycle",
      FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE,
      FG_SOLUTION_ARCHITECTURE_EXECUTIVE,
      FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
      FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE
    ]
  );
  assert.deepStrictEqual(
    catalog.executives[0].steps,
    [...OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS]
  );
  assert.deepStrictEqual(
    catalog.executives[1].steps,
    OPERATIONAL_FUNCTION_CATALOG.map((entry) => entry.name)
  );
  assert.deepStrictEqual(
    catalog.executives[2].steps,
    [...BOOTSTRAP_REQUIREMENTS_EXECUTIVE_STEPS]
  );
  assert.deepStrictEqual(
    catalog.executives[3].steps,
    [...SOLUTION_ARCHITECTURE_EXECUTIVE_STEPS]
  );
  assert.deepStrictEqual(
    catalog.executives[4].steps,
    [...LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE_STEPS]
  );
  assert.equal(
    catalog.functions.find((entry) => entry.name === "derive_test_design_surface")?.outputs[0],
    "test_design_surface"
  );
});

test("T-030 optimized release executive rejects stale split-edge graph names", () => {
  const catalog = constructSdlcGraphFunctionCatalog();
  const optimizedExecutive = catalog.executives.find(
    (entry) => entry.name === "bootstrap_release_self_test"
  );
  assert(optimizedExecutive);
  const optimizedSteps = [...optimizedExecutive.steps];
  const productFunctionNames = new Set(
    BOOTSTRAP_RELEASE_FUNCTION_CATALOG.map((entry) => entry.name)
  );

  assert.deepStrictEqual(optimizedSteps, [
    ...OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS
  ]);
  for (const edgeName of RETIRED_OPTIMIZED_EXECUTIVE_EDGE_NAMES) {
    assert.equal(
      optimizedSteps.includes(edgeName),
      false,
      `optimized release executive must not require stale edge: ${edgeName}`
    );
  }
  for (const edgeName of optimizedSteps) {
    assert.equal(
      productFunctionNames.has(edgeName),
      true,
      `optimized release executive step lacks a product catalog row: ${edgeName}`
    );
  }
});

test("T-030 reusable graph functions preserve catalog input and output signatures", () => {
  const module = constructSdlcGtlModule();
  for (const entry of SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG) {
    const graphFunction = module.graphFunctions.find(
      (candidate) => candidate.name === entry.name
    );
    assert(graphFunction, entry.name);
    assert.deepStrictEqual(
      graphFunction.inputs.map((node) => node.name),
      entry.inputs,
      entry.name
    );
    assert.deepStrictEqual(
      graphFunction.outputs.map((node) => node.name),
      entry.outputs,
      entry.name
    );
  }
});

test("T-030 materializes executive graph functions through ABIogenesis GTL carriers", () => {
  const module = constructSdlcGtlModule();
  const graphFunctionNames = module.graphFunctions.map((graphFunction) => graphFunction.name);

  assert(graphFunctionNames.includes(FG_SINGLE_TYPED_TRAVERSAL));
  assert(graphFunctionNames.includes(FG_INGRESS_PROJECT));
  assert(graphFunctionNames.includes(FG_CONFORM_PROJECT));
  assert(graphFunctionNames.includes(FG_MATERIALIZE_DECLARED_PRODUCT_ASSET));
  for (const graphFunctionName of ASSURANCE_GRAPH_FUNCTION_NAMES) {
    assert(graphFunctionNames.includes(graphFunctionName), graphFunctionName);
  }
  assert(graphFunctionNames.includes(FG_CONFORM_PROJECT_AUTHORITY));
  assert(graphFunctionNames.includes("bootstrap_release_self_test"));
  assert(graphFunctionNames.includes("release_operational_cycle"));
  assert(graphFunctionNames.includes(FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE));
  assert(graphFunctionNames.includes(FG_SOLUTION_ARCHITECTURE_EXECUTIVE));
  assert(graphFunctionNames.includes(FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE));
  for (const liteGraphFunctionName of [
    FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
    FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
    FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE
  ]) {
    const liteGraphFunction = module.graphFunctions.find(
      (graphFunction) => graphFunction.name === liteGraphFunctionName
    );
    assert(liteGraphFunction, liteGraphFunctionName);
    assert(liteGraphFunction.tags.includes("overlay_only_leaf"));
    assert.equal(liteGraphFunction.tags.includes("published_leaf"), false);
  }
  assert.equal(module.jobs.length, module.graphFunctions.length);
  assert(module.jobs.some((job) => job.name === `${FG_CONFORM_PROJECT}_job`));
  assert(module.jobs.some((job) => job.name === `${FG_CONFORM_PROJECT_AUTHORITY}_job`));
  assertSdlcModuleJobsTargetPublishedGraphFunctions(module);
  assert.deepStrictEqual(
    BOOTSTRAP_RELEASE_FUNCTION_CATALOG
      .filter((entry) =>
        [
          "derive_component_code_surface",
          "qualify_component_realization_surface",
          "derive_component_test_surface",
          "qualify_component_test_execution_surface",
          "derive_component_repair_schedule_surface",
          "derive_release_depth_parity_surface"
        ].includes(entry.name)
      )
      .map((entry) => entry.name),
    [
      "derive_component_code_surface",
      "qualify_component_realization_surface",
      "derive_component_test_surface",
      "qualify_component_test_execution_surface",
      "derive_component_repair_schedule_surface",
      "derive_release_depth_parity_surface"
    ]
  );

  const bootstrapBasis = basisFor(module, "bootstrap_release_self_test");
  const authorityConformanceBasis = basisFor(module, FG_CONFORM_PROJECT_AUTHORITY);
  const operationalBasis = basisFor(module, "release_operational_cycle");
  const bootstrapProbe = deriveTraversalStructureProbe(bootstrapBasis);
  const authorityConformanceProbe = deriveTraversalStructureProbe(authorityConformanceBasis);
  const operationalProbe = deriveTraversalStructureProbe(operationalBasis);

  assert.equal(bootstrapBasis.graph.vectors.length, 23);
  assert.equal(authorityConformanceBasis.graph.vectors.length, 6);
  assert.deepStrictEqual(
    authorityConformanceBasis.graph.vectors.map((vector) => vector.target.name),
    [
      "project_bootstrap_surface",
      "intent_surface",
      "product_surface",
      "goal_surface",
      "project_authority_conformance_projection",
      "project_authority_next_action_projection"
    ]
  );
  assert.equal(operationalBasis.graph.vectors.length, 7);
  assert.equal(bootstrapProbe.edge, "derive_intent_surface");
  assert.equal(authorityConformanceProbe.edge, FG_CONFORM_PROJECT_AUTHORITY);
  assert.equal(operationalProbe.edge, "prepare_build_execution_surface");
  assert.equal(bootstrapProbe.transitionKind, "fp_dispatch");
  assert.equal(authorityConformanceProbe.transitionKind, "fp_dispatch");
  assert.equal(operationalProbe.transitionKind, "fp_dispatch");
});

test("T-107 SDLC vectors declare ABG traversal strategy and runner passes an attempt envelope", async () => {
  const module = constructSdlcGtlModule();
  const basis = basisFor(module, "bootstrap_release_self_test");
  const firstVector = basis.graph.vectors[0];
  assert(firstVector);
  const qualifier = firstVector.declarations.entries.find(
    (entry) => entry.key === "abg.traversal_strategy"
  );
  assert(qualifier);
  assert.equal(qualifier.value.kind, "hook_ref");
  assert.equal(
    qualifier.value.value.ref,
    "strategy://odd_sdlc/derive_intent_surface/full_breadth"
  );

  const pluginInputs = [];
  await runEngineIterateAsync({
    basis,
    plugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://odd-sdlc/test/t107/fp-dispatch",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch: async (input) => {
          pluginInputs.push(input);
          return constructFpDispatchOutcome({
            status: "blocked",
            resultRef: "result://odd-sdlc/test/t107/no-output",
            reason: "test stops after envelope capture"
          });
        }
      })
    },
    maxAttachedFpAttempts: 1,
    eventSink: () => undefined
  });

  assert.equal(pluginInputs.length, 1);
  assert(pluginInputs[0].traversalAttemptEnvelope);
  assert.equal(
    pluginInputs[0].traversalAttemptEnvelope.strategyDirectiveRef,
    "strategy://odd_sdlc/derive_intent_surface/full_breadth"
  );
  assert.deepStrictEqual(
    pluginInputs[0].traversalAttemptEnvelope.selectedScheduleItemRefs,
    ["schedule://odd_sdlc/derive_intent_surface/primary"]
  );
});

test("T-055 publishes reusable single typed traversal as GTL library function", () => {
  const module = constructSdlcGtlModule();
  const libraryFunction = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === FG_SINGLE_TYPED_TRAVERSAL
  );

  assert(libraryFunction);
  assert.deepStrictEqual(
    libraryFunction.inputs.map((node) => node.name),
    [
      "typed_source_asset",
      "target_type_surface",
      "traversal_transform_contract",
      "traversal_evaluation_contract"
    ]
  );
  assert.deepStrictEqual(
    libraryFunction.outputs.map((node) => node.name),
    ["typed_traversal_closure_surface"]
  );
  assert(libraryFunction.tags.includes("published_library"));
});

test("T-056 publishes ingress project as GTL library function", () => {
  const module = constructSdlcGtlModule();
  const libraryFunction = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === FG_INGRESS_PROJECT
  );

  assert(libraryFunction);
  assert.deepStrictEqual(
    libraryFunction.inputs.map((node) => node.name),
    [
      "ingress_source_set",
      "project_type_surface",
      "project_ingress_contract"
    ]
  );
  assert.deepStrictEqual(
    libraryFunction.outputs.map((node) => node.name),
    [
      "project_surface",
      "source_input_ledger",
      "lineage_map",
      "ambiguity_register",
      "bootstrap_gap_set"
    ]
  );
  assert(libraryFunction.tags.includes("published_library"));
});

test("T-068 publishes conform project as GTL library function", () => {
  const module = constructSdlcGtlModule();
  const libraryFunction = module.graphFunctions.find(
    (graphFunction) => graphFunction.name === FG_CONFORM_PROJECT
  );

  assert(libraryFunction);
  assert.deepStrictEqual(
    libraryFunction.inputs.map((node) => node.name),
    [
      "ingress_source_set",
      "source_input_ledger",
      "project_constraints_source",
      "project_topology_policy"
    ]
  );
  assert.deepStrictEqual(
    libraryFunction.outputs.map((node) => node.name),
    [
      "conform_project_profile",
      "selected_tenant_surface",
      "module_inventory_surface",
      "capability_contract_surface",
      "execution_contract_surface",
      "conformance_gap_set"
    ]
  );
  assert(libraryFunction.tags.includes("published_library"));
});

test("T-030 rejects jobs targeting unpublished graph functions", () => {
  const module = constructSdlcGtlModule();

  assert.throws(
    () =>
      admitModule({
        name: "odd_sdlc_typescript_bad_job",
        graphs: [],
        graphFunctions: module.graphFunctions,
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs: [
          {
            id: "job:bad",
            name: "bad_job",
            contracts: [{ kind: "graph_function", targetId: "missing" }],
            roles: [],
            tags: []
          }
        ],
        roles: [],
        operators: [],
        evaluators: [],
        rules: [],
        imports: [],
        metadata: { entries: [] }
      }),
    /unpublished graph function/
  );
});

test("T-049 publishes reusable graph-function library design guardrails", () => {
  const design = readFileSync(
    new URL(
      "../../design/ODD_SDLC_TYPESCRIPT_REUSABLE_GRAPH_FUNCTION_LIBRARY.md",
      import.meta.url
    ),
    "utf8"
  );

  assert.match(design, /Fg_single_typed_traversal/);
  assert.match(design, /Fg_ingress_project/);
  assert.match(design, /ABG owns graph-call, frames, continuation, iteration, retry/);
  assert.match(design, /tenant-local control loop/);
  assert.match(design, /does not widen the RC claim/);
  assert.match(design, /T-055-realize-typescript-reusable-single-typed-traversal-library-slice/);
  assert.match(design, /T-056-realize-typescript-ingress-project-library-slice/);
});
