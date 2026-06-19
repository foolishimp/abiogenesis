import {
  ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY,
  type AllowedConsequenceTraversalActionKind,
  type AllowedConsequenceTraversalFamily,
  admitEvaluator,
  admitGraphFunction,
  admitModule,
  admitNode,
  admitOperator,
  constructDefaultAbgFnCompositionDeclarations,
  edge,
  graphFunctionForVector,
  materializeGraphFunction,
  type Evaluator,
  type Graph,
  type GraphFunction,
  type GraphVector,
  type Module,
  type Node,
  type SerializedAttrEntry,
  type SerializedJsonValue,
  type SerializedAttrValue,
  type SerializedAttrs
} from "@abiogenesis/typescript-tenant";
import {
  BOOTSTRAP_RELEASE_FUNCTION_CATALOG,
  BOOTSTRAP_REQUIREMENTS_EXECUTIVE_STEPS,
  FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
  FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
  FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
  FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
  FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE,
  FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
  FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE,
  FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
  FG_PREPARE_TEST_EXECUTION_SURFACE,
  FG_SOLUTION_ARCHITECTURE_EXECUTIVE,
  FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE_STEPS,
  LITE_FUNCTION_CATALOG,
  LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE_STEPS,
  OPERATIONAL_FUNCTION_CATALOG,
  OPTIMISING_FUNCTION_CATALOG,
  OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS,
  SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG,
  SDLC_FUNCTION_CATALOG,
  SOLUTION_ARCHITECTURE_EXECUTIVE_STEPS,
  TRIAGE_FUNCTION_CATALOG,
  type SdlcExecutiveProgramEntry,
  type SdlcFunctionCatalogEntry,
  type SdlcGraphFunctionCatalog
} from "./catalog.js";
import {
  FG_CONFORM_PROJECT,
  type SdlcReusableGraphFunctionCatalogEntry
} from "./library.js";
import { sdlcTargetCarrierDeclarationForTarget } from "./target_carrier_contracts.js";
import {
  sdlcGraphFunctionBoundaryRef,
  sdlcGraphVectorBoundaryRef,
  sdlcPublishedTraversalTargetRef
} from "./boundary_refs.js";
import {
  activeOddSdlcTraversalStrategyPlan,
  defaultSdlcTraversalContinuationConfigForName,
  defaultSdlcTraversalScopeRefsForName,
  defaultSdlcTraversalStrategyForName,
  type OddSdlcTraversalStrategyPlanConfig,
  type OddSdlcDefaultTraversalStrategy
} from "../shared/traversal_strategy_plan.js";

const BUILDER_OPERATOR = admitOperator({
  name: "odd_sdlc_typescript_builder",
  regime: "F_P",
  binding: "agent://odd_sdlc/typescript-builder",
  tags: ["odd_sdlc", "builder"]
});

function scalarValue(value: string | boolean | number): SerializedAttrValue {
  return Object.freeze({
    kind: "scalar",
    value
  });
}

function stringListValue(value: readonly string[]): SerializedAttrValue {
  return Object.freeze({
    kind: "string_list",
    value: Object.freeze([...value])
  });
}

function jsonValue(value: unknown): SerializedJsonValue {
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
      kind: "array" as const,
      items: Object.freeze(value.map(jsonValue))
    });
  }
  if (value !== null && typeof value === "object") {
    const entries: [string, unknown][] = [];
    for (const key of Object.keys(value)) {
      entries.push([key, Reflect.get(value, key)]);
    }
    return Object.freeze({
      kind: "object" as const,
      entries: Object.freeze(
        entries
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, entryValue]) =>
            Object.freeze({ key, value: jsonValue(entryValue) })
          )
      )
    });
  }
  throw new TypeError("Serialized JSON attribute value must be JSON-compatible");
}

function jsonBlobValue(value: unknown): SerializedAttrValue {
  return Object.freeze({
    kind: "json_blob" as const,
    value: jsonValue(value)
  });
}

function hookRefValue(
  ref: string,
  configEntries: readonly SerializedAttrEntry[]
): SerializedAttrValue {
  return Object.freeze({
    kind: "hook_ref",
    value: Object.freeze({
      ref,
      config: attrs(configEntries)
    })
  });
}

function attr(
  key: string,
  value: SerializedAttrValue
): SerializedAttrEntry {
  return Object.freeze({ key, value });
}

function attrs(entries: readonly SerializedAttrEntry[]): SerializedAttrs {
  return Object.freeze({
    entries: Object.freeze([...entries])
  });
}

function firstOutput(entry: {
  readonly name: string;
  readonly outputs: readonly string[];
}): string {
  const output = entry.outputs[0];
  if (output === undefined) {
    throw new TypeError(`${entry.name}: expected one output`);
  }
  return output;
}

function firstVector(graph: Graph, name: string): GraphVector {
  const vector = graph.vectors[0];
  if (vector === undefined) {
    throw new TypeError(`${name}: expected one graph vector`);
  }
  return vector;
}

function nodeFor(name: string): Node {
  return admitNode({
    id: `node:odd_sdlc:${name}`,
    name,
    schema: { kind: "symbolic", ref: `schema://odd_sdlc/${name}` },
    markov: [],
    assetSurface: {
      kind: name,
      requiredContexts: [],
      standardsRefs: [],
      outputContractRefs: [`${name}_present`]
    },
    tags: ["odd_sdlc", "asset_node", `asset:${name}`]
  });
}

function fdEvaluator(entry: SdlcFunctionCatalogEntry): Evaluator {
  return admitEvaluator({
    name: `${entry.name}_core_fd`,
    regime: "F_D",
    description: `Core deterministic validation for ${entry.name}.`,
    binding: `fd://odd_sdlc/${entry.name}/core`,
    tags: ["core_fd", entry.name]
  });
}

function fpEvaluator(entry: SdlcFunctionCatalogEntry): Evaluator {
  return admitEvaluator({
    name: `${entry.name}_semantic_fp`,
    regime: "F_P",
    description: entry.intent,
    binding: `fp://odd_sdlc/${entry.name}/construct`,
    tags: ["configured_fp", entry.name]
  });
}

function enforcementPrimitivesForStrategy(
  strategy: OddSdlcDefaultTraversalStrategy
): readonly string[] {
  if (strategy === "full_breadth") {
    return Object.freeze(["atomic_attempt", "bounded_batch"]);
  }
  if (strategy === "targeted_repair") {
    return Object.freeze(["atomic_attempt", "gap_repair_slice"]);
  }
  return Object.freeze(["atomic_attempt", "single_vertical_slice"]);
}

function continuationEntriesForStrategy(input: {
  readonly name: string;
  readonly strategy: OddSdlcDefaultTraversalStrategy;
  readonly traversalStrategyPlan: OddSdlcTraversalStrategyPlanConfig;
}): readonly SerializedAttrEntry[] {
  if (
    input.strategy !== "full_breadth" &&
    input.name !== "derive_lite_component_code_surface"
  ) {
    return Object.freeze([]);
  }
  const config = defaultSdlcTraversalContinuationConfigForName(
    input.name,
    input.traversalStrategyPlan
  );
  if (config === null) {
    return Object.freeze([]);
  }
  return Object.freeze([
    attr("same_edge_until", scalarValue(config.sameEdgeUntil)),
    attr(
      "max_attempts_without_new_signal",
      scalarValue(config.maxAttemptsWithoutNewSignal)
    ),
    attr("max_total_attempts", scalarValue(config.maxTotalAttempts))
  ]);
}

function traversalModulationDeclaration(
  name: string,
  traversalStrategyPlan: OddSdlcTraversalStrategyPlanConfig
): SerializedAttrEntry {
  const strategy = defaultSdlcTraversalStrategyForName(
    name,
    traversalStrategyPlan
  );
  const continuationEntries = continuationEntriesForStrategy({
    name,
    strategy,
    traversalStrategyPlan
  });
  return attr(
    "abg.traversal_strategy",
    hookRefValue(`strategy://odd_sdlc/${name}/${strategy}`, [
      attr("strategy_owner_ref", scalarValue("product://odd_sdlc")),
      attr("strategy_label", scalarValue(strategy)),
      attr(
        "enforcement_primitives",
        stringListValue(enforcementPrimitivesForStrategy(strategy))
      ),
      attr(
        "obligation_schedule_refs",
        stringListValue(
          defaultSdlcTraversalScopeRefsForName(name, traversalStrategyPlan)
        )
      ),
      ...continuationEntries
    ])
  );
}

function abgFnCompositionDeclaration(input: {
  readonly name: string;
  readonly target: Node;
}): SerializedAttrEntry {
  const declarations = constructDefaultAbgFnCompositionDeclarations({
    scopeRef: `odd-sdlc/${input.name}`,
    hostGraphVectorRef: `vector:odd_sdlc:${input.name}`,
    hostTargetNodeRef: input.target.id,
    hostTargetSchemaRef: input.target.schema.ref,
    standardsContextRefs: Object.freeze(["REQ-L-GTL3-COMPUTE-NOTATION"]),
    policyContextRefs: Object.freeze([
      "policy://odd-sdlc/staged-compute"
    ]),
    carrierContextRefs: Object.freeze([
      "carrier://odd-sdlc/transform-evaluate-consequence"
    ]),
    assuranceContextRefs: Object.freeze([
      "assurance://odd-sdlc/edge-closure"
    ])
  });
  const declaration = declarations.entries[0];
  if (declaration === undefined) {
    throw new TypeError(`${input.name}: ABG fn composition declaration missing`);
  }
  return declaration;
}

function graphFunctionDeclarations(): SerializedAttrs {
  return attrs([
    attr("function_kind", scalarValue("odd_asset_function")),
    attr("default_regime", scalarValue("F_P")),
    attr("graph_function_proof_obligations", stringListValue([
      "work_report_contract",
      "core_fd_preflight",
      "configured_fp_result",
      "postflight_fd_closure"
    ])),
    attr("requirement_refs", stringListValue([
      "REQ-F-ODDSDLC-013",
      "REQ-F-ODDSDLC-014",
      "REQ-F-ODDSDLC-015"
    ]))
  ]);
}

const CONSEQUENCE_CODE_TEST_REVIEW_TARGETS = Object.freeze([
  "derive_component_code_surface",
  "qualify_component_realization_surface",
  "derive_code_surface",
  "derive_test_design_surface",
  "derive_component_test_surface",
  "derive_uat_test_source_surface",
  "prepare_test_execution_surface",
  "derive_test_execution_result_surface",
  "qualify_component_test_execution_surface",
  "derive_component_repair_schedule_surface",
  "derive_test_run_archive_surface"
] as const);

const BASELINE_CONSEQUENCE_TRAVERSAL_FAMILIES = Object.freeze([
  "same_edge_retry",
  "gap_stop",
  "non_admit"
] as const satisfies readonly AllowedConsequenceTraversalFamily[]);

function actionKindsForConsequenceFamily(
  family: AllowedConsequenceTraversalFamily
): readonly AllowedConsequenceTraversalActionKind[] {
  switch (family) {
    case "same_edge_retry":
      return Object.freeze(["repair_same_edge"]);
    case "depth_traversal":
      return Object.freeze(["reenter_graph_span"]);
    case "graph_span_reentry":
      return Object.freeze(["reenter_graph_span"]);
    case "public_start_reentry":
      return Object.freeze(["invoke_graph_function", "continue_graph_call"]);
    case "ticket_traversal":
      return Object.freeze(["invoke_graph_function", "create_ticket"]);
    case "fh_input_required":
      return Object.freeze(["open_fh_gate"]);
    case "escalation_or_reprice":
      return Object.freeze(["propose_reprice"]);
    case "gap_stop":
      return Object.freeze(["block_episode"]);
    case "non_admit":
      return Object.freeze(["non_admit"]);
  }
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function includesString(values: readonly string[], value: string): boolean {
  return values.includes(value);
}

function consequenceTraversalPolicyRowsForVector(input: {
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly graphVectorName: string;
}): readonly {
  readonly overlayRef: string;
  readonly traversalFamily: AllowedConsequenceTraversalFamily;
  readonly allowedTraversalTargetRefs: readonly string[];
  readonly requiredAuthorityRefs: readonly string[];
  readonly proportionalityBasisRefs: readonly string[];
}[] {
  const rows: {
    readonly overlayRef: string;
    readonly traversalFamily: AllowedConsequenceTraversalFamily;
    readonly allowedTraversalTargetRefs: readonly string[];
    readonly requiredAuthorityRefs: readonly string[];
    readonly proportionalityBasisRefs: readonly string[];
  }[] = [];
  const addFamilies = (
    overlayRef: string,
    families: readonly AllowedConsequenceTraversalFamily[],
    options: {
      readonly allowedTraversalTargetRefs?: readonly string[];
      readonly requiredAuthorityRefs?: readonly string[];
      readonly proportionalityBasisRefs?: readonly string[];
    } = {}
  ): void => {
    for (const traversalFamily of families) {
      rows.push({
        overlayRef,
        traversalFamily,
        allowedTraversalTargetRefs: Object.freeze([
          ...(options.allowedTraversalTargetRefs ?? [])
        ]),
        requiredAuthorityRefs: Object.freeze([
          ...(options.requiredAuthorityRefs ?? [])
        ]),
        proportionalityBasisRefs: Object.freeze([
          ...(options.proportionalityBasisRefs ?? [])
        ])
      });
    }
  };
  const currentFullOverlayRef = "overlay://odd-sdlc/current-full-traversal";
  const deepOverlayRef = "overlay://odd-sdlc/deep-sdlc-traversal";
  const ticketWorkflowOverlayRef = "overlay://odd-sdlc/ticket-workflow";
  const liteOverlayRef = "overlay://odd-sdlc/lite-design-module-implementation";
  const frameworkSmokeOverlayRef = "overlay://odd-sdlc/framework-smoke-min-fp";
  const bootstrapOverlayRef = "overlay://odd-sdlc/bootstrap-requirements";
  const solutionOverlayRef = "overlay://odd-sdlc/solution-architecture";
  const publishedTraversalTargetRef = sdlcPublishedTraversalTargetRef({
    graphFunctionRef: input.graphFunctionRef,
    graphVectorRef: input.graphVectorRef
  });
  const depthAuthorityRefs = Object.freeze([
    `${deepOverlayRef}/annotation/deep_sdlc_traversal_candidate`,
    FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
    publishedTraversalTargetRef
  ]);
  addFamilies(currentFullOverlayRef, BASELINE_CONSEQUENCE_TRAVERSAL_FAMILIES);
  addFamilies(deepOverlayRef, BASELINE_CONSEQUENCE_TRAVERSAL_FAMILIES);
  if (includesString(CONSEQUENCE_CODE_TEST_REVIEW_TARGETS, input.graphVectorName)) {
    addFamilies(currentFullOverlayRef, ["ticket_traversal"]);
    addFamilies(
      deepOverlayRef,
      ["depth_traversal"],
      {
        allowedTraversalTargetRefs: [publishedTraversalTargetRef],
        requiredAuthorityRefs: depthAuthorityRefs,
        proportionalityBasisRefs: [
          "proportionality://odd-sdlc/deep-sdlc-traversal/depth"
        ]
      }
    );
    addFamilies(deepOverlayRef, ["ticket_traversal"]);
  }
  if (
    includesString([
      FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
      FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
      FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
      FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
      FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
      FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
      FG_PREPARE_TEST_EXECUTION_SURFACE,
      FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE
    ], input.graphVectorName)
  ) {
    addFamilies(liteOverlayRef, [
      "same_edge_retry",
      "graph_span_reentry",
      "public_start_reentry",
      "ticket_traversal",
      "gap_stop",
      "non_admit"
    ]);
  }
  if (
    includesString([
      FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
      FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
      FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
      FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
      FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
      FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
      FG_PREPARE_TEST_EXECUTION_SURFACE,
      FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE
    ], input.graphVectorName)
  ) {
    addFamilies(frameworkSmokeOverlayRef, [
      "same_edge_retry",
      "graph_span_reentry",
      "gap_stop",
      "non_admit"
    ]);
  }
  if (
    includesString(
      [FG_CONFORM_PROJECT, FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE, ...BOOTSTRAP_REQUIREMENTS_EXECUTIVE_STEPS],
      input.graphVectorName
    )
  ) {
    addFamilies(bootstrapOverlayRef, [
      "same_edge_retry",
      "public_start_reentry",
      "gap_stop",
      "non_admit"
    ]);
  }
  if (
    includesString(
      [FG_SOLUTION_ARCHITECTURE_EXECUTIVE, ...SOLUTION_ARCHITECTURE_EXECUTIVE_STEPS],
      input.graphVectorName
    )
  ) {
    addFamilies(solutionOverlayRef, [
      "same_edge_retry",
      "public_start_reentry",
      "gap_stop",
      "non_admit"
    ]);
  }
  if (input.graphVectorName === "route_ticket_work_item") {
    addFamilies(ticketWorkflowOverlayRef, [
      "same_edge_retry",
      "public_start_reentry",
      "gap_stop",
      "non_admit"
    ]);
  }
  const seen = new Set<string>();
  return Object.freeze(
    rows.filter((row) => {
      const key = `${row.overlayRef}|${row.traversalFamily}|${row.allowedTraversalTargetRefs.join(",")}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
  );
}

function allowedConsequenceTraversalDeclarationsForVector(input: {
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly graphVectorName: string;
}): readonly SerializedAttrEntry[] {
  const policyRows = consequenceTraversalPolicyRowsForVector(input);
  if (policyRows.length === 0) {
    return Object.freeze([]);
  }
  const rows = policyRows.map((row) =>
    Object.freeze({
      rowRef: [
        "allowed-consequence-traversal://odd-sdlc",
        encodeURIComponent(row.overlayRef),
        encodeURIComponent(input.graphFunctionRef),
        encodeURIComponent(input.graphVectorRef),
        row.traversalFamily
      ].join("/"),
      traversalFamily: row.traversalFamily,
      allowedActionKinds: actionKindsForConsequenceFamily(row.traversalFamily),
      allowedTraversalTargetRefs: row.allowedTraversalTargetRefs,
      requiredAuthorityRefs: row.requiredAuthorityRefs,
      proportionalityBasisRefs: uniqueStrings([
        ...row.proportionalityBasisRefs,
        `overlay:${row.overlayRef}`
      ])
    })
  );
  return Object.freeze([
    attr(ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY, jsonBlobValue(rows))
  ]);
}

function attrsWithAdditionalEntries(
  base: SerializedAttrs,
  additional: readonly SerializedAttrEntry[]
): SerializedAttrs {
  if (additional.length === 0) {
    return base;
  }
  return attrs([...base.entries, ...additional]);
}

function publishedLeafTagsForEntry(
  entry: SdlcFunctionCatalogEntry
): readonly string[] {
  if (entry.graphTrackPublication === "overlay_only") {
    return Object.freeze(["odd_sdlc", "overlay_only_leaf"]);
  }
  return Object.freeze(["odd_sdlc", "published_leaf"]);
}

function reusableGraphFunctionDeclarations(
  entry: SdlcReusableGraphFunctionCatalogEntry
): SerializedAttrs {
  return attrs([
    attr("function_kind", scalarValue("odd_reusable_graph_function")),
    attr("graph_function_role", scalarValue(entry.graphFunctionRole)),
    attr("stable_outer_contract", scalarValue(entry.stableOuterContract)),
    attr("compute_order", stringListValue(entry.computeOrder)),
    attr("abg_owned_runtime_truth", stringListValue(entry.abgOwnedRuntimeTruth)),
    attr("sdlc_owned_domain_truth", stringListValue(entry.sdlcOwnedDomainTruth)),
    attr("requirement_refs", stringListValue([
      "REQ-F-GFUNC-003",
      "REQ-F-GFUNC-004",
      "REQ-F-GFUNC-005",
      "REQ-F-ODDSDLC-013",
      "REQ-F-ODDSDLC-014",
      "REQ-F-ODDSDLC-015"
    ]))
  ]);
}

function vectorDeclarations(
  entry: SdlcFunctionCatalogEntry,
  traversalStrategyPlan: OddSdlcTraversalStrategyPlanConfig,
  target: Node
): SerializedAttrs {
  return attrs([
    abgFnCompositionDeclaration({ name: entry.name, target }),
    sdlcTargetCarrierDeclarationForTarget({
      edgeRef: entry.name,
      targetAssetType: firstOutput(entry),
      target
    }),
    traversalModulationDeclaration(entry.name, traversalStrategyPlan),
    attr("intent", scalarValue(entry.intent)),
    attr("backing_graph_function", scalarValue(entry.backingGraphFunction)),
    attr("catalog_role", scalarValue(entry.catalogRole)),
    attr("graph_track_publication", scalarValue(entry.graphTrackPublication)),
    attr("specializes_graph_function", scalarValue(entry.specializesGraphFunction)),
    attr("transform_contract_ref", scalarValue(entry.transformContractRef)),
    attr("evaluation_contract_ref", scalarValue(entry.evaluationContractRef)),
    attr("compute_basis", stringListValue([
      "preflight:F_D",
      "construct:F_P",
      "postflight:F_D"
    ])),
    attr("proof_obligations", stringListValue([
      "target_binding",
      "operation_type",
      "evidence_refs",
      "input_output_identity_or_digest"
    ]))
  ]);
}

function reusableVectorDeclarations(
  entry: SdlcReusableGraphFunctionCatalogEntry,
  traversalStrategyPlan: OddSdlcTraversalStrategyPlanConfig,
  target: Node,
  vectorName: string = entry.name
): SerializedAttrs {
  return attrs([
    abgFnCompositionDeclaration({ name: vectorName, target }),
    sdlcTargetCarrierDeclarationForTarget({
      edgeRef: vectorName,
      targetAssetType: target.name,
      target
    }),
    traversalModulationDeclaration(entry.name, traversalStrategyPlan),
    attr("intent", scalarValue(entry.intent)),
    attr("catalog_role", scalarValue(entry.graphFunctionRole)),
    attr("stable_outer_contract", scalarValue(entry.stableOuterContract)),
    attr("compute_basis", stringListValue(entry.computeOrder)),
    attr("abg_owned_runtime_truth", stringListValue(entry.abgOwnedRuntimeTruth)),
    attr("sdlc_owned_domain_truth", stringListValue(entry.sdlcOwnedDomainTruth))
  ]);
}

function reusableVectorNameForTarget(
  entry: SdlcReusableGraphFunctionCatalogEntry,
  target: Node,
  index: number
): string {
  return index === 0 ? entry.name : `${entry.name}__${target.name}`;
}

function graphFunctionForEntry(
  entry: SdlcFunctionCatalogEntry,
  traversalStrategyPlan: OddSdlcTraversalStrategyPlanConfig
): GraphFunction {
  const sourceNodes = entry.inputs.map(nodeFor);
  const target = nodeFor(firstOutput(entry));
  const graphFunctionTags = publishedLeafTagsForEntry(entry);
  const graph = edge(sourceNodes, target, {
    id: `vector:odd_sdlc:${entry.name}`,
    name: entry.name,
    operators: [BUILDER_OPERATOR],
    evaluators: [fdEvaluator(entry), fpEvaluator(entry)],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: vectorDeclarations(entry, traversalStrategyPlan, target),
    tags: ["odd_sdlc", "leaf_graph_function"]
  });

  const graphFunction = graphFunctionForVector(firstVector(graph, entry.name), {
    name: entry.backingGraphFunction,
    declarations: graphFunctionDeclarations(),
    tags: graphFunctionTags
  });
  return admitGraphFunction({
    name: graphFunction.name,
    environment: graphFunction.environment,
    inputs: graphFunction.inputs,
    outputs: graphFunction.outputs,
    template: graphFunction.template,
    effects: graphFunction.effects,
    declarations: graphFunctionDeclarations(),
    tags: graphFunction.tags,
    id: graphFunction.id
  });
}

function reusableGraphFunctionForEntry(
  entry: SdlcReusableGraphFunctionCatalogEntry,
  traversalStrategyPlan: OddSdlcTraversalStrategyPlanConfig
): GraphFunction {
  const sourceNodes = entry.inputs.map(nodeFor);
  const outputNodes = entry.outputs.map(nodeFor);
  const vectors = Object.freeze(
    outputNodes.map((target, index) => {
      const vectorName = reusableVectorNameForTarget(entry, target, index);
      const primaryGraph = edge(sourceNodes, target, {
        id: `vector:odd_sdlc:${vectorName}`,
        name: vectorName,
        operators: [BUILDER_OPERATOR],
        evaluators: [
          admitEvaluator({
            name: `${vectorName}_contract_fd`,
            regime: "F_D",
            description: `Deterministic contract admission for ${vectorName}.`,
            binding: `fd://odd_sdlc/library/${vectorName}/contract`,
            tags: ["library_fd", entry.name, vectorName]
          }),
          admitEvaluator({
            name: `${vectorName}_configured_fp`,
            regime: "F_P",
            description: entry.intent,
            binding: `fp://odd_sdlc/library/${vectorName}/construct`,
            tags: ["library_fp", entry.name, vectorName]
          })
        ],
        contexts: [],
        rule: null,
        allowsSubwork: false,
        declarations: reusableVectorDeclarations(
          entry,
          traversalStrategyPlan,
          target,
          vectorName
        ),
        tags: ["odd_sdlc", "reusable_graph_function"]
      });
      return firstVector(primaryGraph, vectorName);
    })
  );
  const graph = Object.freeze({
    name: `${entry.name}_workflow`,
    inputs: sourceNodes,
    outputs: outputNodes,
    nodes: uniqueNodes([...sourceNodes, ...outputNodes]),
    vectors,
    contexts: Object.freeze([]),
    rules: Object.freeze([]),
    effects: Object.freeze([]),
    tags: Object.freeze(["odd_sdlc", "published_library"])
  });
  return admitGraphFunction({
    name: entry.name,
    environment: {
      requires: sourceNodes,
      provides: outputNodes,
      carries: graph.nodes
    },
    inputs: sourceNodes,
    outputs: outputNodes,
    template: {
      kind: "inline_graph",
      ref: `inline:${entry.name}`,
      graph,
      version: null
    },
    effects: [],
    declarations: reusableGraphFunctionDeclarations(entry),
    tags: ["odd_sdlc", "published_library"],
    id: `graph-function:odd_sdlc:${entry.name}`
  });
}

function leafFunctions(
  entries: readonly SdlcFunctionCatalogEntry[],
  traversalStrategyPlan: OddSdlcTraversalStrategyPlanConfig
): readonly GraphFunction[] {
  return Object.freeze(
    entries.map((entry) => graphFunctionForEntry(entry, traversalStrategyPlan))
  );
}

function uniqueNodes(nodes: readonly Node[]): readonly Node[] {
  const byName = new Map<string, Node>();
  for (const node of nodes) {
    if (!byName.has(node.name)) {
      byName.set(node.name, node);
    }
  }
  return Object.freeze([...byName.values()]);
}

function constructExecutive(input: {
  readonly name: string;
  readonly intent: string;
  readonly functions: readonly GraphFunction[];
  readonly outputs: readonly string[];
}): GraphFunction {
  if (input.functions.length === 0) {
    throw new TypeError(`${input.name}: expected at least one function`);
  }
  const vectors = Object.freeze(
    input.functions.flatMap((graphFunction) => [
      ...materializeGraphFunction(graphFunction).vectors
    ])
  );
  const lastVector = vectors.at(-1);
  if (lastVector === undefined) {
    throw new TypeError(`${input.name}: expected materialized vectors`);
  }
  const producedTargetNames = new Set(
    vectors.map((vector) => vector.target.name)
  );
  const inputNodes = uniqueNodes(
    vectors.flatMap((vector) =>
      vector.source.filter((node) => !producedTargetNames.has(node.name))
    )
  );
  const graph = Object.freeze({
    name: `${input.name}_graph`,
    inputs: inputNodes,
    outputs: Object.freeze([lastVector.target]),
    nodes: uniqueNodes(vectors.flatMap((vector) => [...vector.source, vector.target])),
    vectors,
    contexts: Object.freeze([]),
    rules: Object.freeze([]),
    effects: Object.freeze([]),
    tags: Object.freeze(["odd_sdlc", "executive"])
  });
  return admitGraphFunction({
    name: input.name,
    environment: {
      requires: inputNodes,
      provides: graph.outputs,
      carries: graph.nodes
    },
    inputs: inputNodes,
    outputs: graph.outputs,
    template: {
      kind: "inline_graph",
      ref: `inline:${input.name}`,
      graph,
      version: null
    },
    effects: [],
    declarations: attrs([
      attr("function_kind", scalarValue("odd_executive_graph_function")),
      attr("intent", scalarValue(input.intent)),
      attr("entrypoint", scalarValue(true)),
      attr("outputs", stringListValue(input.outputs))
    ]),
    tags: ["odd_sdlc", "executive"],
    id: `graph-function:odd_sdlc:${input.name}`
  });
}

function graphFunctionWithAllowedConsequenceTraversalDeclarations(
  graphFunction: GraphFunction
): GraphFunction {
  if (graphFunction.template.kind !== "inline_graph") {
    return graphFunction;
  }
  const graph = materializeGraphFunction(graphFunction);
  let changed = false;
  const graphFunctionRef = sdlcGraphFunctionBoundaryRef(graphFunction);
  const vectors = Object.freeze(
    graph.vectors.map((vector) => {
      const graphVectorRef = sdlcGraphVectorBoundaryRef(vector);
      const additionalDeclarations =
        allowedConsequenceTraversalDeclarationsForVector({
          graphFunctionRef,
          graphVectorRef,
          graphVectorName: vector.name
        });
      if (additionalDeclarations.length === 0) {
        return vector;
      }
      changed = true;
      return Object.freeze({
        ...vector,
        declarations: attrsWithAdditionalEntries(
          vector.declarations,
          additionalDeclarations
        )
      });
    })
  );
  if (!changed) {
    return graphFunction;
  }
  const decoratedGraph: Graph = Object.freeze({
    ...graph,
    vectors
  });
  return admitGraphFunction({
    name: graphFunction.name,
    environment: graphFunction.environment,
    inputs: graphFunction.inputs,
    outputs: graphFunction.outputs,
    template: {
      ...graphFunction.template,
      graph: decoratedGraph
    },
    effects: graphFunction.effects,
    declarations: graphFunction.declarations,
    tags: graphFunction.tags,
    id: graphFunction.id
  });
}

function executiveEntry(input: {
  readonly name: string;
  readonly intent: string;
  readonly steps: readonly string[];
  readonly outputs: readonly string[];
}): SdlcExecutiveProgramEntry {
  return Object.freeze({
    kind: "sdlc_executive_program_entry",
    name: input.name,
    intent: input.intent,
    steps: Object.freeze([...input.steps]),
    outputs: Object.freeze([...input.outputs]),
    backingGraphFunction: input.name
  });
}

function functionNames(functions: readonly GraphFunction[]): readonly string[] {
  return Object.freeze(functions.map((graphFunction) => graphFunction.name));
}

function functionsByNames(
  functions: readonly GraphFunction[],
  names: readonly string[],
  executiveName: string
): readonly GraphFunction[] {
  const byName = new Map(
    functions.map((graphFunction) => [graphFunction.name, graphFunction])
  );
  return Object.freeze(
    names.map((name) => {
      const graphFunction = byName.get(name);
      if (graphFunction === undefined) {
        throw new TypeError(`${executiveName}: missing step graph function ${name}`);
      }
      return graphFunction;
    })
  );
}

function jobFor(graphFunction: GraphFunction) {
  return Object.freeze({
    id: `job:odd_sdlc:${graphFunction.name}`,
    name: `${graphFunction.name}_job`,
    contracts: Object.freeze([
      Object.freeze({
        kind: "graph_function",
        targetId: graphFunction.id
      })
    ]),
    roles: [],
    tags: ["odd_sdlc", "semantic_job"]
  });
}

export function constructSdlcGraphFunctionCatalog(): SdlcGraphFunctionCatalog {
  const traversalStrategyPlan = activeOddSdlcTraversalStrategyPlan();
  const operationalFunctions = leafFunctions(
    OPERATIONAL_FUNCTION_CATALOG,
    traversalStrategyPlan
  );
  return Object.freeze({
    kind: "sdlc_graph_function_catalog",
    libraryFunctions: SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG,
    functions: SDLC_FUNCTION_CATALOG,
    executives: Object.freeze([
      executiveEntry({
        name: "bootstrap_release_self_test",
        intent: "Top-level bootstrap-to-release executive over consolidated implementation and test plan carriers.",
        steps: OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS,
        outputs: ["release_surface"]
      }),
      executiveEntry({
        name: "release_operational_cycle",
        intent: "Operational continuation executive from release through runtime return and retrofit planning.",
        steps: functionNames(operationalFunctions),
        outputs: ["retrofit_plan_surface"]
      }),
      executiveEntry({
        name: FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE,
        intent: "Bounded bootstrap traversal from source input through admitted requirements authority.",
        steps: BOOTSTRAP_REQUIREMENTS_EXECUTIVE_STEPS,
        outputs: ["requirement_surface"]
      }),
      executiveEntry({
        name: FG_SOLUTION_ARCHITECTURE_EXECUTIVE,
        intent: "Bounded solution architecture traversal from requirements to implementation design authority.",
        steps: SOLUTION_ARCHITECTURE_EXECUTIVE_STEPS,
        outputs: ["implementation_design_surface"]
      }),
      executiveEntry({
        name: FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
        intent: "Lite traversal from composite implementation design to component implementation and admitted test execution proof.",
        steps: LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE_STEPS,
        outputs: ["test_execution_result_surface"]
      }),
      executiveEntry({
        name: FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
        intent: "Complexity-admitted Min(F_P) framework-smoke traversal for trivial products with preserved execution proof.",
        steps: FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE_STEPS,
        outputs: ["test_execution_result_surface"]
      })
    ])
  });
}

export function constructSdlcGtlModule(input: {
  readonly traversalStrategyPlan?: OddSdlcTraversalStrategyPlanConfig | undefined;
} = {}): Module {
  const traversalStrategyPlan =
    input.traversalStrategyPlan ?? activeOddSdlcTraversalStrategyPlan();
  const libraryFunctions = Object.freeze(
    SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG.map((entry) =>
      reusableGraphFunctionForEntry(entry, traversalStrategyPlan)
    )
  );
  const optimisingFunctions = leafFunctions(
    OPTIMISING_FUNCTION_CATALOG,
    traversalStrategyPlan
  );
  const bootstrapFunctions = leafFunctions(
    BOOTSTRAP_RELEASE_FUNCTION_CATALOG,
    traversalStrategyPlan
  );
  const liteFunctions = leafFunctions(
    LITE_FUNCTION_CATALOG,
    traversalStrategyPlan
  );
  const operationalFunctions = leafFunctions(
    OPERATIONAL_FUNCTION_CATALOG,
    traversalStrategyPlan
  );
  const triageFunctions = leafFunctions(
    TRIAGE_FUNCTION_CATALOG,
    traversalStrategyPlan
  );
  const liteExecutiveFunctions = Object.freeze([
    ...liteFunctions,
    ...bootstrapFunctions
  ]);
  const bootstrapExecutive = constructExecutive({
    name: "bootstrap_release_self_test",
    intent: "Top-level bootstrap-to-release executive over consolidated implementation and test plan carriers.",
    functions: functionsByNames(
      bootstrapFunctions,
      OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS,
      "bootstrap_release_self_test"
    ),
    outputs: ["release_surface"]
  });
  const operationalExecutive = constructExecutive({
    name: "release_operational_cycle",
    intent: "Operational continuation executive from release through runtime return and retrofit planning.",
    functions: operationalFunctions,
    outputs: ["retrofit_plan_surface"]
  });
  const bootstrapRequirementsExecutive = constructExecutive({
    name: FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE,
    intent: "Bounded bootstrap traversal from source input through admitted requirements authority.",
    functions: functionsByNames(
      bootstrapFunctions,
      BOOTSTRAP_REQUIREMENTS_EXECUTIVE_STEPS,
      FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE
    ),
    outputs: ["requirement_surface"]
  });
  const solutionArchitectureExecutive = constructExecutive({
    name: FG_SOLUTION_ARCHITECTURE_EXECUTIVE,
    intent: "Bounded solution architecture traversal from requirements to implementation design authority.",
    functions: functionsByNames(
      bootstrapFunctions,
      SOLUTION_ARCHITECTURE_EXECUTIVE_STEPS,
      FG_SOLUTION_ARCHITECTURE_EXECUTIVE
    ),
    outputs: ["implementation_design_surface"]
  });
  const liteDesignModuleImplementationExecutive = constructExecutive({
    name: FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE,
    intent: "Lite traversal from composite implementation design to component implementation and admitted test execution proof.",
    functions: functionsByNames(
      liteExecutiveFunctions,
      LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE_STEPS,
      FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
    ),
    outputs: ["test_execution_result_surface"]
  });
  const frameworkSmokeMinFpExecutive = constructExecutive({
    name: FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
    intent: "Complexity-admitted Min(F_P) framework-smoke traversal for trivial products with preserved execution proof.",
    functions: functionsByNames(
      liteExecutiveFunctions,
      FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE_STEPS,
      FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE
    ),
    outputs: ["test_execution_result_surface"]
  });
  const graphFunctions = Object.freeze([
    ...libraryFunctions,
    ...optimisingFunctions,
    bootstrapExecutive,
    operationalExecutive,
    bootstrapRequirementsExecutive,
    solutionArchitectureExecutive,
    liteDesignModuleImplementationExecutive,
    frameworkSmokeMinFpExecutive,
    ...bootstrapFunctions,
    ...liteFunctions,
    ...operationalFunctions,
    ...triageFunctions
  ].map(graphFunctionWithAllowedConsequenceTraversalDeclarations));
  const module = admitModule({
    name: "odd_sdlc_typescript",
    graphs: [],
    graphFunctions,
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: graphFunctions.map(jobFor),
    roles: [],
    operators: [BUILDER_OPERATOR],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: attrs([
      attr("domain_package", scalarValue("odd_sdlc")),
      attr("traversal_strategy_plan_ref", scalarValue(traversalStrategyPlan.planRef)),
      attr(
        "reusable_graph_function_catalog_size",
        scalarValue(String(SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG.length))
      ),
      attr("function_catalog_size", scalarValue(String(SDLC_FUNCTION_CATALOG.length))),
      attr("executive_graph_functions", stringListValue([
        bootstrapExecutive.name,
        operationalExecutive.name,
        frameworkSmokeMinFpExecutive.name
      ]))
    ])
  });
  assertSdlcModuleJobsTargetPublishedGraphFunctions(module);
  return module;
}

export function assertSdlcModuleJobsTargetPublishedGraphFunctions(
  module: Module
): void {
  const graphFunctionIds = new Set(
    module.graphFunctions.map((graphFunction) => graphFunction.id)
  );
  for (const job of module.jobs) {
    for (const contract of job.contracts) {
      if (!graphFunctionIds.has(contract.targetId)) {
        throw new TypeError(
          `Job ${JSON.stringify(job.name)} targets unpublished graph function ${JSON.stringify(contract.targetId)}`
        );
      }
    }
  }
}
