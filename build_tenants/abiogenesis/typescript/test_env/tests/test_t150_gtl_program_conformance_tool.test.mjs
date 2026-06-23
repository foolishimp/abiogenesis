// Validates: T-150
// Validates: REQ-L-GTL3-ASSET-SURFACE
// Validates: REQ-R-ABG3-INTERPRET

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY,
  ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY,
  compose,
  constructAssetSurface,
  constructCandidateFamily,
  constructContractRef,
  constructEnginePluginContract,
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructJob,
  constructModule,
  constructNode,
  constructRefinementBoundary,
  constructRole,
  constructTemplateRef,
  edge,
  emptySerializedAttrs,
  fan_in,
  fan_out,
  gate,
  GTL_PROGRAM_BIND_ADMISSION_STRENGTH_COMPATIBILITY_REF,
  GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS,
  GTL_PROGRAM_T153_FEATURE_KINDS,
  identity,
  materializeGraphFunction,
  promote,
  recurse,
  substitute,
  typecheckGtlProgram,
  formatGtlProgramConformanceIssues
} from "../../build/semantic/code/src/index.js";
import {
  runAbiogenesisCli
} from "../../build/semantic/code/src/cli/command.js";

const ABG_VERSION = "4.0.0-rc.3";
const OBLIGATION_DELTA_FAMILIES = Object.freeze([
  "realized",
  "refined",
  "downstream_deferred",
  "blocked",
  "reentered",
  "repriced",
  "no_close_preserved",
  "terminal_projected"
]);

function assetSurface(overrides = {}) {
  return constructAssetSurface({
    kind: "prompt_invocation_asset",
    requiredContexts: ["standards"],
    standardsRefs: ["standard://stdo"],
    outputContractRefs: ["contract://prompt/invocation"],
    constructorRefs: ["constructor://prompt/invocation"],
    constructorInputAssetKinds: ["authority_packet"],
    rendererRefs: ["renderer://markdown"],
    renderedViewDigestPolicyRef: "digest-policy://prompt/rendered-view/sha256",
    sectionKindRefs: ["section-kind://prompt/purpose"],
    clauseKindRefs: ["clause-kind://prompt/declarative"],
    authoritySlots: [
      {
        authorityKindRef: "authority-kind://product",
        disposition: "normal"
      }
    ],
    proofObligationRefs: ["proof://prompt/rendered-view"],
    ...overrides
  });
}

function node(name, surface = assetSurface()) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://${name}` },
    markov: [`${name}:declared`],
    assetSurface: surface,
    tags: ["t150-program-conformance-tool"]
  });
}

function operator(name) {
  return Object.freeze({
    name,
    regime: "F_P",
    binding: `binding://${name}`,
    tags: ["t150-program-conformance-tool"]
  });
}

function evaluator(name) {
  return Object.freeze({
    name,
    regime: "F_D",
    description: "program conformance fixture evaluator",
    binding: `binding://${name}`,
    consumedFieldRefs: [],
    tags: ["t150-program-conformance-tool"]
  });
}

function rule(name) {
  return Object.freeze({
    name,
    kind: "gate",
    config: emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
}

function serializedAttrs(entries) {
  return Object.freeze({
    entries: Object.freeze(entries)
  });
}

function stringListAttr(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list",
      value: Object.freeze([...value])
    })
  });
}

function scalarAttr(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar",
      value
    })
  });
}

function jsonBlobAttr(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "json_blob",
      value
    })
  });
}

function jsonArray(items) {
  return Object.freeze({
    kind: "array",
    items: Object.freeze(items)
  });
}

function jsonObject(entries) {
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      Object.entries(entries).map(([key, value]) =>
        Object.freeze({
          key,
          value
        })
      )
    )
  });
}

function vectorBoundaryNode(name) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `Vector[${name}]` },
    markov: [`${name}:declared`],
    assetSurface: assetSurface(),
    tags: ["t150-program-conformance-tool", "vector-boundary"]
  });
}

function graphFunctionFixture(options = {}) {
  const graphFunctionName = options.graphFunctionName ?? "construct_prompt_invocation";
  const vectorName = options.vectorName ?? graphFunctionName;
  const graphName = options.graphName ?? "PromptConstructionGraph";
  const inputName = options.inputName ?? "PromptAuthorityPacket";
  const outputName = options.outputName ?? "PromptInvocationAsset";
  const input = node(inputName, options.inputSurface ?? assetSurface());
  const output = node(outputName, options.outputSurface ?? assetSurface());
  const vector = constructGraphVector({
    name: vectorName,
    source: [input],
    target: output,
    operators: [operator(vectorName)],
    evaluators: [evaluator(`${vectorName}_shape`)],
    contexts: [
      {
        name: "standards",
        locator: "workspace://docs/stdo.md",
        digest: "sha256:standards"
      }
    ],
    rule: rule(`${vectorName}_rule`),
    allowsSubwork: false,
    declarations: options.vectorDeclarations ?? emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
  const graph = constructGraph({
    name: graphName,
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: ["prompt-construction"],
    tags: ["t150-program-conformance-tool"]
  });
  return constructGraphFunction({
    name: graphFunctionName,
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://prompt-construction",
      graph,
      version: null
    }),
    effects: ["prompt-construction"],
    declarations: options.graphFunctionDeclarations ?? emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
}

function moduleFixture(graphFunction) {
  const suffix = graphFunction.name;
  const role = constructRole({
    name: `${suffix}_prompt_constructor`,
    tags: ["t150-program-conformance-tool"],
    policyHooks: emptySerializedAttrs()
  });
  const job = constructJob({
    name: `${suffix}_prompt_construction_job`,
    contracts: [
      constructContractRef({
        kind: "graph_function",
        targetId: graphFunction.id
      })
    ],
    roles: [role],
    tags: ["t150-program-conformance-tool"],
    policyHooks: emptySerializedAttrs()
  });
  const refinementBoundary = constructRefinementBoundary({
    name: `${suffix}_prompt_refinement_boundary`,
    inputs: graphFunction.inputs,
    outputs: graphFunction.outputs,
    hints: emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
  const candidateFamily = constructCandidateFamily({
    name: `${suffix}_prompt_candidate_family`,
    inputs: graphFunction.inputs,
    outputs: graphFunction.outputs,
    candidates: [graphFunction],
    policyHints: emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
  return constructModule({
    name: `t150-program-conformance-tool-${suffix}`,
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [refinementBoundary],
    candidateFamilies: [candidateFamily],
    jobs: [job],
    roles: [role],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
}

function graphFunctionIdentity(options = {}) {
  const graphFunction = graphFunctionFixture(options);
  const graph = materializeGraphFunction(graphFunction);
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);
  return { graphFunction, graph, vector };
}

function targetCarrierContractRow(input) {
  const edgeRef = input.edgeRef ?? input.vector.name;
  const targetAssetType = input.targetAssetType ?? input.vector.target.name;
  const targetCarrierContractRef =
    input.targetCarrierContractRef ??
    `gtl://target-carrier-contract/t150/${edgeRef}/${targetAssetType}`;
  const outputCarrierKind =
    input.outputCarrierKind ?? `t150_${targetAssetType}_target_carrier`;
  return {
    edgeRef,
    graphVectorRef: input.graphVectorRef ?? input.vector.name,
    graphFunctionId: input.graphFunction.id,
    graphId: input.graph.id,
    graphVectorId: input.vector.id,
    targetAssetType,
    targetCarrierContractRef,
    targetCarrierContractDigest:
      input.targetCarrierContractDigest ?? "sha256:t150-target-carrier",
    targetCarrierTemplateRef:
      input.targetCarrierTemplateRef ??
      `gtl://target-carrier-template/t150/${targetAssetType}`,
    outputSurfaceRef:
      input.outputSurfaceRef ?? `asset-type://t150/${targetAssetType}`,
    outputCarrierFamilyRef:
      input.outputCarrierFamilyRef ??
      "gtl://target-carrier-family/t150/output",
    outputCarrierKind,
    envelopeContractRef:
      input.envelopeContractRef ??
      "gtl://target-carrier-envelope/t150/output-v1",
    nestedPayloadPath: input.nestedPayloadPath ?? "payload",
    requiredFieldRefs: input.requiredFieldRefs ?? [
      "kind",
      "targetAssetType",
      "edgeRef",
      "contractRef",
      "contractDigest",
      "payload"
    ],
    optionalFieldRefs: input.optionalFieldRefs ?? [
      "summary",
      "evidenceRefs"
    ],
    fixedProtocolFieldRefs: input.fixedProtocolFieldRefs ?? [
      "kind",
      "targetAssetType",
      "edgeRef",
      "contractRef",
      "contractDigest"
    ],
    workerFillableFieldRefs: input.workerFillableFieldRefs ?? [
      "payload",
      "summary",
      "evidenceRefs"
    ],
    literalDomainRefs: input.literalDomainRefs ?? [
      `kind:${outputCarrierKind}`,
      `targetAssetType:${targetAssetType}`,
      `edgeRef:${edgeRef}`,
      `contractRef:${targetCarrierContractRef}`
    ],
    enumDomainRefs: input.enumDomainRefs ?? [],
    schemaRef: input.schemaRef ?? input.vector.target.schema.ref,
    admissionRef:
      input.admissionRef ?? `admission://t150/target-carrier/${edgeRef}`,
    payloadLedgerBindingRef:
      input.payloadLedgerBindingRef ??
      `payload-ledger://t150/target-carrier/${edgeRef}`,
    edgeAssuranceBindingRef:
      input.edgeAssuranceBindingRef ??
      `edge-assurance://t150/${edgeRef}/target-carrier`,
    handoffProjectionRef:
      input.handoffProjectionRef ??
      `handoff-projection://t150/target-carrier/${edgeRef}`,
    constructionTemplateRef:
      input.constructionTemplateRef ??
      `construction-template://t150/target-carrier/${targetAssetType}`,
    replayDigestPolicyRef:
      input.replayDigestPolicyRef ??
      `replay-digest://t150/target-carrier/${edgeRef}`,
    materializationPolicyRef:
      input.materializationPolicyRef ??
      `materialization://t150/target-carrier/${targetAssetType}`,
    closurePreconditionRef:
      input.closurePreconditionRef ??
      `closure-precondition://t150/target-carrier-admitted/${edgeRef}`
  };
}

function vectorProgramRef(graphFunction, vector) {
  return vector.name === graphFunction.name
    ? graphFunction.name
    : `${graphFunction.name}/${vector.name}`;
}

function graphVectorIdentityHostRef(graphFunction, graph, vector) {
  return [
    graphFunction.name,
    graph.name,
    vector.name
  ].join("/") + `#${graphFunction.id}:${graph.id}:${vector.id}`;
}

function stageBindingRefsFor(graphFunction, vector) {
  const programRef = vectorProgramRef(graphFunction, vector);
  return [
    `stage-binding://t150/${programRef}/transform.C`,
    `stage-binding://t150/${programRef}/evaluate.C`,
    `stage-binding://t150/${programRef}/consequence.C`
  ];
}

function traversalBindConservationRow(input) {
  const programRef = vectorProgramRef(input.graphFunction, input.vector);
  return {
    conservationRef:
      input.conservationRef ??
      `bind-conservation://t159/${programRef}/intent-lineage`,
    graphFunctionRef: input.graphFunction.name,
    graphRef: input.graph.name,
    graphVectorRef: input.vector.name,
    graphFunctionId: input.graphFunction.id,
    graphId: input.graph.id,
    graphVectorId: input.vector.id,
    intentLineageRefs: input.intentLineageRefs ?? [
      `intent-lineage://t159/${programRef}/input`,
      `lineage://t159/${programRef}/authority`
    ],
    targetCarrierBindingRefs: input.targetCarrierBindingRefs ?? [
      input.targetCarrier.targetCarrierContractRef
    ],
    materializationBindingRefs: input.materializationBindingRefs ?? [
      input.targetCarrier.materializationPolicyRef
    ],
    carriedObligationRefs: input.carriedObligationRefs ?? [
      `obligation://t159/${programRef}/target-contract`
    ],
    residualPressureRefs: input.residualPressureRefs ?? [
      `pressure://t159/${programRef}/open-obligation`
    ],
    stagedAuthorityRefs: input.stagedAuthorityRefs ?? stageBindingRefsFor(
      input.graphFunction,
      input.vector
    ),
    admissionStrengthRefs: input.admissionStrengthRefs ?? [
      GTL_PROGRAM_BIND_ADMISSION_STRENGTH_COMPATIBILITY_REF
    ],
    downstreamTerminalPressureRefs: input.downstreamTerminalPressureRefs ?? [
      `terminal-pressure://t159/${programRef}/terminal`
    ],
    allowedObligationDeltaFamilies:
      input.allowedObligationDeltaFamilies ?? OBLIGATION_DELTA_FAMILIES,
    evidenceRefs: input.evidenceRefs ?? [
      `test://t159/${programRef}/bind-conservation`
    ]
  };
}

function traversalBindConservationRows(input) {
  return input.vectors.map((vector, index) => {
    const targetCarrier = input.targetCarrierContracts[index];
    assert.notEqual(targetCarrier, undefined);
    return traversalBindConservationRow({
      graphFunction: input.graphFunction,
      graph: input.graph,
      vector,
      targetCarrier
    });
  });
}

function runtimeReentryRouteRow(input) {
  const programRef = vectorProgramRef(input.graphFunction, input.vector);
  return {
    routeRef: `runtime-reentry://t150/${programRef}/upstream-reentry`,
    repairSurfaceDisposition: "upstream_reentry",
    selectedActionKind: "reenter_graph_span",
    graphReentryPoint: "realization",
    repairGraphFunctionRef: input.graphFunction.name,
    repairGraphVectorRef: input.vector.name,
    repairGraphFunctionId: input.graphFunction.id,
    repairGraphId: input.graph.id,
    repairGraphVectorId: input.vector.id,
    reentryTargetVectorIndex: input.vectorIndex ?? 0,
    repairAssetRef: `asset://t150/${programRef}/${input.vector.target.name}`,
    targetOutcomeRef: `outcome://t150/${programRef}/repair-target`,
    observationBindingRef: `construction-binding://t150/${programRef}/upstream-reentry`,
    lawfulBasisRefs: [
      "REQ-R-ABG3-ITERATION-009",
      "REQ-R-ABG3-FPC-004B",
      "REQ-R-ABG3-FPC-014"
    ],
    evidenceRefs: ["test://t150/runtime-reentry"]
  };
}

function pluginContract(overrides = {}) {
  return constructEnginePluginContract({
    ref: "plugin://t150/fp-dispatch",
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome",
    ...overrides
  });
}

function expectedCoverage(overrides = {}) {
  return {
    catalogGraphFunctionCount: 1,
    publishedGraphFunctionCount: 1,
    graphVectorCount: 1,
    targetCarrierContractCount: 1,
    edgeClosureContractCount: 1,
    overlayCount: 1,
    publicStartTargetCount: 1,
    promptAssetCount: 1,
    pluginContractCount: 1,
    sourceIdentitySurfaceCount: 1,
    ...overrides
  };
}

const DEFAULT_PRESENT_T153_FEATURES = new Set([
  "graph_structure_interface",
  "graph_algebra_edge",
  "graph_algebra_same_object",
  "operator_declarations",
  "evaluator_declarations",
  "rule_declarations",
  "f_star_compute_composition",
  "hook_boundaries",
  "target_carrier_contract_law",
  "edge_closure_contract_law",
  "prompt_typed_asset_law",
  "selection_refinement_synthesis_subwork",
  "module_publication",
  "public_start_binding",
  "job_binding",
  "role_binding",
  "external_tool_gates",
  "active_source_identity"
]);

function featureRequirementRefs(featureKind) {
  switch (featureKind) {
    case "graph_structure_interface":
      return [
        "REQ-L-GTL3-GRAPH",
        "REQ-L-GTL3-GRAPHVECTOR",
        "REQ-L-GTL3-GRAPHFUNCTION"
      ];
    case "graph_algebra_edge":
    case "graph_algebra_identity":
    case "graph_algebra_same_object":
      return ["REQ-L-GTL3-LAWS"];
    case "graph_algebra_compose":
      return ["REQ-L-GTL3-COMPOSE"];
    case "graph_algebra_substitute":
      return ["REQ-L-GTL3-SUBSTITUTE"];
    case "graph_algebra_recurse":
      return ["REQ-L-GTL3-RECURSE"];
    case "graph_algebra_fan_out":
    case "graph_algebra_fan_in":
    case "graph_algebra_gate":
    case "graph_algebra_promote":
      return ["REQ-L-GTL3-HOF"];
    case "operator_declarations":
      return ["REQ-L-GTL3-OPERATOR"];
    case "evaluator_declarations":
      return ["REQ-L-GTL3-EVALUATOR"];
    case "rule_declarations":
      return ["REQ-L-GTL3-RULE"];
    case "f_star_compute_composition":
      return ["REQ-L-GTL3-COMPUTE-NOTATION", "REQ-R-ABG3-FN-COMPOSITION"];
    case "hook_boundaries":
      return ["REQ-L-GTL3-HOOKS"];
    case "target_carrier_contract_law":
      return ["REQ-L-GTL3-GRAPHVECTOR", "REQ-L-GTL3-CONTRACT-LAW-API"];
    case "edge_closure_contract_law":
      return ["REQ-R-ABG3-ASSURANCE", "REQ-R-ABG3-INTERPRET"];
    case "prompt_typed_asset_law":
      return ["REQ-L-GTL3-ASSET-SURFACE"];
    case "selection_refinement_synthesis_subwork":
      return [
        "REQ-L-GTL3-SELECTION-BOUNDARY",
        "REQ-L-GTL3-SYNTHESIS",
        "REQ-L-GTL3-SUBWORK"
      ];
    case "module_publication":
      return ["REQ-L-GTL3-MODULE"];
    case "public_start_binding":
      return ["REQ-L-GTL3-JOB", "REQ-R-ABG3-RUN"];
    case "job_binding":
      return ["REQ-L-GTL3-JOB"];
    case "role_binding":
      return ["REQ-L-GTL3-ROLE"];
    case "external_tool_gates":
      return ["REQ-L-GTL3-HOOKS", "REQ-R-ABG3-TRANSPORT"];
    case "active_source_identity":
      return ["REQ-L-GTL3-IDENTITY"];
    default:
      throw new TypeError(`unknown T-153 feature ${featureKind}`);
  }
}

function featureOwner(featureKind) {
  return GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS[featureKind];
}

function featureCoverageManifest(options = {}) {
  const dispositions = options.dispositions ?? {};
  const ownerClassifications = options.ownerClassifications ?? {};
  const omit = new Set(options.omit ?? []);
  return {
    kind: "gtl_program_feature_coverage_manifest",
    manifestRef: options.manifestRef ?? "feature-coverage://t150/default",
    t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API",
    rows: GTL_PROGRAM_T153_FEATURE_KINDS
      .filter((featureKind) => !omit.has(featureKind))
      .map((featureKind) => {
        const disposition =
          dispositions[featureKind] ??
          (DEFAULT_PRESENT_T153_FEATURES.has(featureKind)
            ? "present"
            : "not_used");
        return {
          featureKind,
          disposition,
          ownerClassification:
            ownerClassifications[featureKind] ?? featureOwner(featureKind),
          requirementRefs: featureRequirementRefs(featureKind),
          evidenceRefs: disposition === "present"
            ? [`test://t150/feature/${featureKind}`]
            : [],
          reasonRefs: disposition === "not_used"
            ? [`reason://t150/not-used/${featureKind}`]
            : []
        };
      })
  };
}

function completeFeatureRows(input) {
  const { graphFunction, graph, vector, module } = input;
  const programRef = vector.name === graphFunction.name
    ? graphFunction.name
    : `${graphFunction.name}/${vector.name}`;
  const publicStartRef = input.publicStartRef ?? "prompt";
  const operatorEntry = vector.operators[0];
  const evaluatorEntry = vector.evaluators[0];
  const ruleEntry = vector.rule;
  const jobEntry = module.jobs[0];
  const roleEntry = module.roles[0];
  const refinementBoundary = module.refinementBoundaries[0];
  const candidateFamily = module.candidateFamilies[0];
  assert.notEqual(operatorEntry, undefined);
  assert.notEqual(evaluatorEntry, undefined);
  assert.notEqual(ruleEntry, undefined);
  assert.notEqual(jobEntry, undefined);
  assert.notEqual(roleEntry, undefined);
  assert.notEqual(refinementBoundary, undefined);
  assert.notEqual(candidateFamily, undefined);
  const compositionRef = `abg.fn_composition://t150/${programRef}/default`;
  const compositionDigest = "sha256:composition";
  const stageBindingRefs = stageBindingRefsFor(graphFunction, vector);
  const vectorHostRef = graphVectorIdentityHostRef(graphFunction, graph, vector);
  const pluginResultIdentityFieldRefs = [
    "compositionRef",
    "compositionDigest",
    "compositionSelectionRef",
    "stageRole",
    "computeMeans",
    "outputCarrierRefs",
    "evidenceRefs"
  ];
  const stageRegimes = (activeRegime) => [
    {
      regime: "F_D",
      disposition: activeRegime === "F_D" ? "participates" : "not_used",
      selectedRegimeBindingRefs:
        activeRegime === "F_D"
          ? [`regime-binding://t150/${programRef}/F_D/close`]
          : [],
      reasonRefs:
        activeRegime === "F_D"
          ? []
          : [`reason://t150/${programRef}/F_D/not-used`],
      evidenceRefs:
        activeRegime === "F_D"
          ? [`test://t150/${programRef}/F_D/participates`]
          : []
    },
    {
      regime: "F_P",
      disposition: activeRegime === "F_P" ? "participates" : "not_used",
      selectedRegimeBindingRefs:
        activeRegime === "F_P"
          ? [`regime-binding://t150/${programRef}/F_P/construct`]
          : [],
      reasonRefs:
        activeRegime === "F_P"
          ? []
          : [`reason://t150/${programRef}/F_P/not-used`],
      evidenceRefs:
        activeRegime === "F_P"
          ? [`test://t150/${programRef}/F_P/participates`]
          : []
    },
    {
      regime: "F_H",
      disposition: "not_used",
      selectedRegimeBindingRefs: [],
      reasonRefs: [`reason://t150/${programRef}/F_H/not-used`],
      evidenceRefs: []
    }
  ];
  return {
    sameObjectProofs: [
      {
        proofRef: `same-object://t150/${programRef}/graph-function-template`,
        leftRef: graphFunction.id,
        rightRef: graph.id,
        equalityDigest: "sha256:same-object",
        evidenceRefs: ["test://t150/same-object"]
      }
    ],
    operatorDeclarations: [
      {
        operatorRef: `operator://t150/${programRef}/${operatorEntry.name}`,
        name: operatorEntry.name,
        regime: operatorEntry.regime,
        binding: operatorEntry.binding,
        hostKind: "graph_vector",
        hostRef: vectorHostRef,
        tagRefs: operatorEntry.tags,
        evidenceRefs: ["test://t150/operator"]
      }
    ],
    evaluatorDeclarations: [
      {
        evaluatorRef: `evaluator://t150/${programRef}/${evaluatorEntry.name}`,
        name: evaluatorEntry.name,
        regime: evaluatorEntry.regime,
        description: evaluatorEntry.description,
        binding: evaluatorEntry.binding,
        consumedFieldRefs: evaluatorEntry.consumedFieldRefs,
        hostKind: "graph_vector",
        hostRef: vectorHostRef,
        tagRefs: evaluatorEntry.tags,
        evidenceRefs: ["test://t150/evaluator"]
      }
    ],
    ruleDeclarations: [
      {
        ruleRef: `rule://t150/${programRef}/${ruleEntry.name}`,
        name: ruleEntry.name,
        ruleKind: ruleEntry.kind,
        configDigest: "sha256:rule-config",
        hostKind: "graph_vector",
        hostRef: vectorHostRef,
        tagRefs: ruleEntry.tags,
        evidenceRefs: ["test://t150/rule"]
      }
    ],
    computeCompositions: [
      {
        compositionRef,
        compositionDigest,
        hostKind: "graph_vector",
        hostRef: vectorHostRef,
        declarationSourceKind: "visible_defaults",
        declarationSourceRef: `visible-defaults://t150/${programRef}/composition`,
        notationRefs: [
          "fn<PromptAuthorityPacket,PromptInvocationAsset>.C",
          "transform.C",
          "evaluate.C",
          "consequence.C"
        ],
        regimeBindingRefs: [
          `regime-binding://t150/${programRef}/F_P/construct`,
          `regime-binding://t150/${programRef}/F_D/close`
        ],
        stageBindingRefs,
        closureContractRef: `closure-contract://t150/${programRef}/fd-close`,
        evidenceRefs: ["test://t150/composition"]
      }
    ],
    computeStageBindings: [
      {
        stageBindingRef: stageBindingRefs[0],
        compositionRef,
        compositionDigest,
        stageRole: "transform",
        stageNotationRef: "transform.C",
        stagePurpose: "candidate_construction",
        computeMeans: "F_P",
        inputCarrierRefs: ["EnginePluginInput"],
        outputCarrierRefs: ["FpDispatchOutcome"],
        predecessorStageBindingRefs: [],
        pluginContractRefs: ["plugin://t150/fp-dispatch"],
        hookRefs: [`hook://t150/${programRef}/fp-dispatch`],
        regimeDispositions: stageRegimes("F_P"),
        mayWriteLedgers: false,
        mayEmitRuntimeEvents: false,
        maySelectTraversal: false,
        mayCloseTraversal: false,
        mayOwnIterationLoop: false,
        evidenceRefs: ["test://t150/transform-stage"]
      },
      {
        stageBindingRef: stageBindingRefs[1],
        compositionRef,
        compositionDigest,
        stageRole: "evaluate",
        stageNotationRef: "evaluate.C",
        stagePurpose: "candidate_evaluation",
        computeMeans: "F_P",
        inputCarrierRefs: ["EnginePluginInput"],
        outputCarrierRefs: ["FpEvaluationOutcome", "EvaluationRuleOutcome"],
        predecessorStageBindingRefs: [stageBindingRefs[0]],
        pluginContractRefs: [],
        hookRefs: [],
        regimeDispositions: stageRegimes("F_P"),
        mayWriteLedgers: false,
        mayEmitRuntimeEvents: false,
        maySelectTraversal: false,
        mayCloseTraversal: false,
        mayOwnIterationLoop: false,
        evidenceRefs: ["test://t150/evaluate-stage"]
      },
      {
        stageBindingRef: stageBindingRefs[2],
        compositionRef,
        compositionDigest,
        stageRole: "consequence",
        stageNotationRef: "consequence.C",
        stagePurpose: "consequence_projection",
        computeMeans: "F_D",
        inputCarrierRefs: ["EnginePluginInput"],
        outputCarrierRefs: ["ConsequenceProjectionOutcome"],
        predecessorStageBindingRefs: [stageBindingRefs[1]],
        pluginContractRefs: [],
        hookRefs: [],
        regimeDispositions: stageRegimes("F_D"),
        mayWriteLedgers: false,
        mayEmitRuntimeEvents: false,
        maySelectTraversal: false,
        mayCloseTraversal: false,
        mayOwnIterationLoop: false,
        evidenceRefs: ["test://t150/consequence-stage"]
      }
    ],
    pluginResultInterfaces: [
      {
        resultInterfaceRef: `result-interface://t150/${programRef}/transform.C`,
        stageBindingRef: stageBindingRefs[0],
        compositionRef,
        compositionDigest,
        stageRole: "transform",
        computeMeans: "F_P",
        resultEnvelopeContractRef: `result-envelope://t150/${programRef}/transform.C`,
        resultCarrierKind: "FpDispatchOutcome",
        outputCarrierRefs: ["FpDispatchOutcome"],
        producedCarrierRefs: [
          `carrier://t150/${programRef}/transform.C/fp-dispatch-outcome`
        ],
        requiredIdentityFieldRefs: pluginResultIdentityFieldRefs,
        selectorAuthorityRefs: [
          `gtl://plugin-result-interface/t150/${programRef}/transform.C`
        ],
        evidenceRefs: ["test://t150/transform-result-interface"],
        mayWriteLedgers: false,
        mayEmitRuntimeEvents: false,
        maySelectTraversal: false,
        mayCloseTraversal: false,
        mayOwnIterationLoop: false
      },
      {
        resultInterfaceRef: `result-interface://t150/${programRef}/evaluate.C`,
        stageBindingRef: stageBindingRefs[1],
        compositionRef,
        compositionDigest,
        stageRole: "evaluate",
        computeMeans: "F_P",
        resultEnvelopeContractRef: `result-envelope://t150/${programRef}/evaluate.C`,
        resultCarrierKind: "FpEvaluationOutcome",
        outputCarrierRefs: ["FpEvaluationOutcome", "EvaluationRuleOutcome"],
        producedCarrierRefs: [
          `carrier://t150/${programRef}/evaluate.C/fp-evaluation-outcome`,
          `carrier://t150/${programRef}/evaluate.C/evaluation-rule-outcome`
        ],
        requiredIdentityFieldRefs: pluginResultIdentityFieldRefs,
        selectorAuthorityRefs: [
          `gtl://plugin-result-interface/t150/${programRef}/evaluate.C`
        ],
        evidenceRefs: ["test://t150/evaluate-result-interface"],
        mayWriteLedgers: false,
        mayEmitRuntimeEvents: false,
        maySelectTraversal: false,
        mayCloseTraversal: false,
        mayOwnIterationLoop: false
      },
      {
        resultInterfaceRef: `result-interface://t150/${programRef}/consequence.C`,
        stageBindingRef: stageBindingRefs[2],
        compositionRef,
        compositionDigest,
        stageRole: "consequence",
        computeMeans: "F_D",
        resultEnvelopeContractRef: `result-envelope://t150/${programRef}/consequence.C`,
        resultCarrierKind: "ConsequenceProjectionOutcome",
        outputCarrierRefs: ["ConsequenceProjectionOutcome"],
        producedCarrierRefs: [
          `carrier://t150/${programRef}/consequence.C/consequence-projection-outcome`
        ],
        requiredIdentityFieldRefs: pluginResultIdentityFieldRefs,
        selectorAuthorityRefs: [
          `gtl://plugin-result-interface/t150/${programRef}/consequence.C`
        ],
        evidenceRefs: ["test://t150/consequence-result-interface"],
        mayWriteLedgers: false,
        mayEmitRuntimeEvents: false,
        maySelectTraversal: false,
        mayCloseTraversal: false,
        mayOwnIterationLoop: false
      }
    ],
    hookBoundaries: [
      {
        hookRef: `hook://t150/${programRef}/fp-dispatch`,
        hookKey: "abg.fp_consciousness",
        hostKind: "graph_vector",
        hostRef: vectorHostRef,
        declarationSourceKind: "visible_defaults",
        declarationRef: `visible-defaults://t150/${programRef}/hook`,
        precedenceRank: 5,
        concernRefs: ["dispatch", "evaluation", "closure"],
        pluginContractRefs: ["plugin://t150/fp-dispatch"],
        evidenceRefs: ["test://t150/hook"]
      }
    ],
    selectionBoundaries: [
      {
        boundaryRef: refinementBoundary.name,
        boundaryKind: "refinement_boundary",
        hostRef: module.name,
        inputContractRefs: graphFunction.inputs.map((nodeEntry) => nodeEntry.name),
        outputContractRefs: graphFunction.outputs.map((nodeEntry) => nodeEntry.name),
        candidateRefs: [],
        evidenceRefs: ["test://t150/refinement-boundary"]
      },
      {
        boundaryRef: candidateFamily.name,
        boundaryKind: "candidate_family",
        hostRef: module.name,
        inputContractRefs: graphFunction.inputs.map((nodeEntry) => nodeEntry.name),
        outputContractRefs: graphFunction.outputs.map((nodeEntry) => nodeEntry.name),
        candidateRefs: [graphFunction.name],
        evidenceRefs: ["test://t150/candidate-family"]
      }
    ],
    jobBindings: [
      {
        jobRef: jobEntry.name,
        contractTargetRefs: [graphFunction.name],
        roleRefs: [roleEntry.name],
        policyHookRefs: [],
        publicCallableGraphFunctionRefs: [graphFunction.name],
        evidenceRefs: ["test://t150/job-binding"]
      }
    ],
    roleBindings: [
      {
        roleRef: roleEntry.name,
        capabilityRefs: ["capability://t150/prompt-construction"],
        policyHookRefs: [],
        evidenceRefs: ["test://t150/role-binding"]
      }
    ],
    externalToolGates: [
      {
        toolGateRef: `tool-gate://t150/${programRef}/mcp`,
        toolRef: `mcp://t150/${programRef}/tool`,
        boundaryRef: `hook://t150/${programRef}/fp-dispatch`,
        transportRef: "transport://t150/mcp",
        payloadContractRef: "payload-contract://t150/mcp",
        admissionRef: "admission://t150/mcp",
        notLanguageTruthEvidenceRefs: ["REQ-L-GTL3-CONTRACT-LAW-API-014"],
        evidenceRefs: ["test://t150/external-tool-gate"]
      }
    ],
    runtimeBindings: [
      {
        bindingRef: `runtime-binding://t150/${programRef}/abg-cli`,
        runtimeBindingKind: "abg_cli_runtime_binding",
        moduleRef: module.name,
        publicStartRef,
        commandRef: "abiogenesis-ts start",
        pluginContractRefs: ["plugin://t150/fp-dispatch"],
        stageBindingRefs,
        consumesPluginsThroughAbg: true,
        forbidsProductLocalIteration: true,
        evidenceRefs: ["test://t150/runtime-binding"]
      }
    ],
    runtimeReentryRoutes: [
      runtimeReentryRouteRow({
        graphFunction,
        graph,
        vector,
        vectorIndex: input.vectorIndex
      })
    ]
  };
}

function mergeFeatureRows(...rowSets) {
  return {
    sameObjectProofs: rowSets.flatMap((rows) => rows.sameObjectProofs),
    operatorDeclarations: rowSets.flatMap((rows) => rows.operatorDeclarations),
    evaluatorDeclarations: rowSets.flatMap((rows) => rows.evaluatorDeclarations),
    ruleDeclarations: rowSets.flatMap((rows) => rows.ruleDeclarations),
    computeCompositions: rowSets.flatMap((rows) => rows.computeCompositions),
    computeStageBindings: rowSets.flatMap((rows) => rows.computeStageBindings),
    pluginResultInterfaces: rowSets.flatMap((rows) => rows.pluginResultInterfaces),
    hookBoundaries: rowSets.flatMap((rows) => rows.hookBoundaries),
    selectionBoundaries: rowSets.flatMap((rows) => rows.selectionBoundaries),
    jobBindings: rowSets.flatMap((rows) => rows.jobBindings),
    roleBindings: rowSets.flatMap((rows) => rows.roleBindings),
    externalToolGates: rowSets.flatMap((rows) => rows.externalToolGates),
    runtimeBindings: rowSets.flatMap((rows) => rows.runtimeBindings),
    runtimeReentryRoutes: rowSets.flatMap((rows) => rows.runtimeReentryRoutes)
  };
}

function compliantInput(overrides = {}, options = {}) {
  const graphFunctionName = options.graphFunctionName ?? "construct_prompt_invocation";
  const vectorName = options.vectorName ?? graphFunctionName;
  const outputName = options.outputName ?? "PromptInvocationAsset";
  const { graphFunction, graph, vector } = graphFunctionIdentity(options);
  const module = moduleFixture(graphFunction);
  const promptSurface = options.promptSurface ?? options.outputSurface ?? assetSurface();
  const featureRows = completeFeatureRows({
    graphFunction,
    graph,
    vector,
    module
  });
  const targetCarrierContracts = [
    targetCarrierContractRow({
      edgeRef: graphFunctionName,
      graphVectorRef: vectorName,
      graphFunction,
      graph,
      vector,
      targetAssetType: outputName,
      targetCarrierContractRef:
        options.targetCarrierContractRef ??
        "gtl://target-carrier-contract/t150/prompt-invocation"
    })
  ];
  return {
    subjectRef: "workspace://t150/program-conformance-tool",
    abiPackageVersion: ABG_VERSION,
    expectedCoverage: expectedCoverage(),
    featureCoverageManifest: featureCoverageManifest(),
    catalogGraphFunctionRefs: [graphFunctionName],
    modules: [module],
    targetCarrierContracts,
    edgeClosureContracts: [
      {
        edgeRef: graphFunctionName,
        graphFunctionId: graphFunction.id,
        graphId: graph.id,
        graphVectorId: vector.id,
        targetAssetType: outputName
      }
    ],
    overlays: [
      {
        overlayRef: "overlay://t150/default",
        graphFunctionRefs: [graphFunctionName],
        graphVectorRefs: [vectorName],
        publicStartTargets: [graphFunctionName],
        defaultStartTarget: graphFunctionName
      }
    ],
    publicStartTargets: [
      {
        name: "prompt",
        graphFunctionRef: graphFunctionName,
        overlayRefs: ["overlay://t150/default"],
        defaultForOverlayRefs: ["overlay://t150/default"]
      }
    ],
    promptAssets: [
      {
        surfaceRef: "prompt://t150/invocation",
        assetSurface: promptSurface,
        gtlNode: node(outputName, promptSurface),
        renderedViewDigest: "sha256:rendered",
        currentAbgFoldRefs: [
          `package:@abiogenesis/typescript-tenant@${ABG_VERSION}#abg/m03/iteration_state_action/deriveIterationOutcomeFromRows`
        ],
        evidenceRefs: ["test://t150/prompt"]
      }
    ],
    pluginContracts: [pluginContract()],
    traversalBindConservation: traversalBindConservationRows({
      graphFunction,
      graph,
      vectors: [vector],
      targetCarrierContracts
    }),
    sourceIdentitySurfaces: [
      {
        surfaceRef: "workspace://code/current.ts",
        text: "ABG 4.0.0-rc.2 current truth"
      }
    ],
    ...featureRows,
    ...overrides
  };
}

function issueRuleRefs(report) {
  return new Set(report.issues.map((entry) => entry.ruleRef));
}

function assertRule(report, ruleRef) {
  assert(issueRuleRefs(report).has(ruleRef), ruleRef);
}

function assertNoRule(report, ruleRef) {
  assert.equal(issueRuleRefs(report).has(ruleRef), false, ruleRef);
}

function multiVectorGraphFunctionFixture() {
  const authority = node("PipelineAuthorityPacket");
  const design = node("PipelineDesignSurface");
  const prompt = node("PipelinePromptInvocationAsset");
  const deriveDesign = constructGraphVector({
    name: "derive_pipeline_design_surface",
    source: [authority],
    target: design,
    operators: [operator("derive_pipeline_design_surface")],
    evaluators: [evaluator("derive_pipeline_design_surface_shape")],
    contexts: [],
    rule: rule("derive_pipeline_design_surface_rule"),
    allowsSubwork: false,
    declarations: emptySerializedAttrs(),
    tags: ["t159-traversal-unit-boundary"]
  });
  const derivePrompt = constructGraphVector({
    name: "derive_pipeline_prompt_surface",
    source: [design],
    target: prompt,
    operators: [operator("derive_pipeline_prompt_surface")],
    evaluators: [evaluator("derive_pipeline_prompt_surface_shape")],
    contexts: [],
    rule: rule("derive_pipeline_prompt_surface_rule"),
    allowsSubwork: false,
    declarations: emptySerializedAttrs(),
    tags: ["t159-traversal-unit-boundary"]
  });
  const graph = constructGraph({
    name: "PipelinePromptConstructionGraph",
    inputs: [authority],
    outputs: [prompt],
    nodes: [authority, design, prompt],
    vectors: [deriveDesign, derivePrompt],
    contexts: [],
    rules: [],
    effects: ["prompt-construction"],
    tags: ["t159-traversal-unit-boundary"]
  });
  return constructGraphFunction({
    name: "construct_pipeline_prompt_invocation",
    environment: constructEnvRef({
      requires: [authority],
      provides: [prompt],
      carries: [authority, design, prompt]
    }),
    inputs: [authority],
    outputs: [prompt],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://pipeline-prompt-construction",
      graph,
      version: null
    }),
    effects: ["prompt-construction"],
    declarations: emptySerializedAttrs(),
    tags: ["t159-traversal-unit-boundary"]
  });
}

function featureRowsForVectors(input) {
  const rowSets = input.vectors.map((vector, vectorIndex) =>
    completeFeatureRows({
      graphFunction: input.graphFunction,
      graph: input.graph,
      vector,
      module: input.module,
      publicStartRef: input.publicStartRef,
      vectorIndex
    })
  );
  const merged = mergeFeatureRows(...rowSets);
  const firstRows = rowSets[0];
  assert.notEqual(firstRows, undefined);
  return {
    ...merged,
    selectionBoundaries: firstRows.selectionBoundaries,
    jobBindings: firstRows.jobBindings,
    roleBindings: firstRows.roleBindings
  };
}

function multiVectorCompliantInput(overrides = {}) {
  const graphFunction = multiVectorGraphFunctionFixture();
  const graph = materializeGraphFunction(graphFunction);
  const vectors = graph.vectors;
  const module = moduleFixture(graphFunction);
  const featureRows = featureRowsForVectors({
    graphFunction,
    graph,
    vectors,
    module,
    publicStartRef: "pipeline"
  });
  const targetCarrierContracts = vectors.map((vector) =>
    targetCarrierContractRow({
      edgeRef: vector.name,
      graphVectorRef: vector.name,
      graphFunction,
      graph,
      vector,
      targetAssetType: vector.target.name,
      targetCarrierContractRef:
        `gtl://target-carrier-contract/t159/${vector.name}`
    })
  );
  const edgeClosureContracts = vectors.map((vector) => ({
    edgeRef: vector.name,
    graphFunctionId: graphFunction.id,
    graphId: graph.id,
    graphVectorId: vector.id,
    targetAssetType: vector.target.name
  }));
  return compliantInput({
    expectedCoverage: expectedCoverage({
      graphVectorCount: vectors.length,
      targetCarrierContractCount: targetCarrierContracts.length,
      edgeClosureContractCount: edgeClosureContracts.length
    }),
    catalogGraphFunctionRefs: [graphFunction.name],
    modules: [module],
    targetCarrierContracts,
    edgeClosureContracts,
    traversalBindConservation: traversalBindConservationRows({
      graphFunction,
      graph,
      vectors,
      targetCarrierContracts
    }),
    overlays: [
      {
        overlayRef: "overlay://t159/pipeline",
        graphFunctionRefs: [graphFunction.name],
        graphVectorRefs: vectors.map((vector) => vector.name),
        publicStartTargets: [graphFunction.name],
        defaultStartTarget: graphFunction.name
      }
    ],
    publicStartTargets: [
      {
        name: "pipeline",
        graphFunctionRef: graphFunction.name,
        overlayRefs: ["overlay://t159/pipeline"],
        defaultForOverlayRefs: ["overlay://t159/pipeline"]
      }
    ],
    ...featureRows,
    ...overrides
  });
}

function syntheticDownstreamEntryUnitInput() {
  const bootstrap = graphFunctionIdentity({
    graphFunctionName: "traverse_bootstrap_conformant",
    graphName: "SyntheticBootstrapConformanceGraph",
    inputName: "Bootstrap",
    outputName: "Conformant"
  });
  const ticket = graphFunctionIdentity({
    graphFunctionName: "traverse_ticket_triage",
    graphName: "SyntheticTicketTriageGraph",
    inputName: "Ticket",
    outputName: "Triage"
  });
  const bootstrapModule = moduleFixture(bootstrap.graphFunction);
  const ticketModule = moduleFixture(ticket.graphFunction);
  const bootstrapRows = completeFeatureRows({
    graphFunction: bootstrap.graphFunction,
    graph: bootstrap.graph,
    vector: bootstrap.vector,
    module: bootstrapModule,
    publicStartRef: "traverse<bootstrap, conformant>"
  });
  const ticketRows = completeFeatureRows({
    graphFunction: ticket.graphFunction,
    graph: ticket.graph,
    vector: ticket.vector,
    module: ticketModule,
    publicStartRef: "traverse<ticket, triage>"
  });
  const featureRows = mergeFeatureRows(bootstrapRows, ticketRows);
  const targetCarrierContracts = [
    targetCarrierContractRow({
      edgeRef: bootstrap.vector.name,
      graphVectorRef: bootstrap.vector.name,
      graphFunction: bootstrap.graphFunction,
      graph: bootstrap.graph,
      vector: bootstrap.vector,
      targetAssetType: bootstrap.vector.target.name,
      targetCarrierContractRef:
        "gtl://target-carrier-contract/t159/bootstrap-conformant"
    }),
    targetCarrierContractRow({
      edgeRef: ticket.vector.name,
      graphVectorRef: ticket.vector.name,
      graphFunction: ticket.graphFunction,
      graph: ticket.graph,
      vector: ticket.vector,
      targetAssetType: ticket.vector.target.name,
      targetCarrierContractRef:
        "gtl://target-carrier-contract/t159/ticket-triage"
    })
  ];
  const edgeClosureContracts = [
    {
      edgeRef: bootstrap.vector.name,
      graphFunctionId: bootstrap.graphFunction.id,
      graphId: bootstrap.graph.id,
      graphVectorId: bootstrap.vector.id,
      targetAssetType: bootstrap.vector.target.name
    },
    {
      edgeRef: ticket.vector.name,
      graphFunctionId: ticket.graphFunction.id,
      graphId: ticket.graph.id,
      graphVectorId: ticket.vector.id,
      targetAssetType: ticket.vector.target.name
    }
  ];
  return compliantInput({
    expectedCoverage: expectedCoverage({
      catalogGraphFunctionCount: 2,
      publishedGraphFunctionCount: 2,
      graphVectorCount: 2,
      targetCarrierContractCount: 2,
      edgeClosureContractCount: 2,
      overlayCount: 2,
      publicStartTargetCount: 2
    }),
    catalogGraphFunctionRefs: [
      bootstrap.graphFunction.name,
      ticket.graphFunction.name
    ],
    modules: [bootstrapModule, ticketModule],
    targetCarrierContracts,
    edgeClosureContracts,
    traversalBindConservation: traversalBindConservationRows({
      graphFunction: bootstrap.graphFunction,
      graph: bootstrap.graph,
      vectors: [bootstrap.vector],
      targetCarrierContracts: [targetCarrierContracts[0]]
    }).concat(
      traversalBindConservationRows({
        graphFunction: ticket.graphFunction,
        graph: ticket.graph,
        vectors: [ticket.vector],
        targetCarrierContracts: [targetCarrierContracts[1]]
      })
    ),
    overlays: [
      {
        overlayRef: "overlay://t159/bootstrap",
        graphFunctionRefs: [bootstrap.graphFunction.name],
        graphVectorRefs: [bootstrap.vector.name],
        publicStartTargets: [bootstrap.graphFunction.name],
        defaultStartTarget: bootstrap.graphFunction.name
      },
      {
        overlayRef: "overlay://t159/ticket",
        graphFunctionRefs: [ticket.graphFunction.name],
        graphVectorRefs: [ticket.vector.name],
        publicStartTargets: [ticket.graphFunction.name],
        defaultStartTarget: ticket.graphFunction.name
      }
    ],
    publicStartTargets: [
      {
        name: "traverse<bootstrap, conformant>",
        graphFunctionRef: bootstrap.graphFunction.name,
        overlayRefs: ["overlay://t159/bootstrap"],
        defaultForOverlayRefs: ["overlay://t159/bootstrap"]
      },
      {
        name: "traverse<ticket, triage>",
        graphFunctionRef: ticket.graphFunction.name,
        overlayRefs: ["overlay://t159/ticket"],
        defaultForOverlayRefs: ["overlay://t159/ticket"]
      }
    ],
    ...featureRows
  });
}

function unsatisfiedDependencyGraphFunction() {
  const input = node("PromptAuthorityPacket");
  const missing = node("MissingDependency");
  const output = node("PromptInvocationAsset");
  const vector = constructGraphVector({
    name: "construct_prompt_from_missing_dependency",
    source: [missing],
    target: output,
    operators: [operator("construct_prompt_from_missing_dependency")],
    evaluators: [evaluator("construct_prompt_from_missing_dependency_shape")],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
  const graph = constructGraph({
    name: "PromptConstructionWithMissingDependency",
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: ["prompt-construction"],
    tags: ["t150-program-conformance-tool"]
  });
  return constructGraphFunction({
    name: "construct_prompt_from_missing_dependency",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://prompt-construction-missing-dependency",
      graph,
      version: null
    }),
    effects: ["prompt-construction"],
    declarations: emptySerializedAttrs(),
    tags: ["t150-program-conformance-tool"]
  });
}

test("T-150 GTL program typechecker admits a complete graph prompt plugin inventory", () => {
  const report = typecheckGtlProgram(compliantInput());

  assert.equal(report.kind, "gtl_program_conformance_report");
  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assert.equal(report.issueCount, 0);
  assert.equal(report.coverage.publishedGraphFunctionCount, 1);
  assert.equal(report.coverage.graphVectorCount, 1);
  assert.equal(report.coverage.promptAssetCount, 1);
  assert.equal(report.coverage.pluginContractCount, 1);
  assert.match(report.inventoryDigests.pluginResultInterfaces, /^sha256:/u);
  assert.match(report.inventoryDigests.runtimeReentryRoutes, /^sha256:/u);
  assert.match(report.reportRef, /^abg:\/\/gtl-program-conformance-report\/sha256:/u);
});

test("T-156 GTL program typechecker admits allowed consequence traversal declarations", () => {
  const report = typecheckGtlProgram(
    compliantInput(
      {},
      {
        graphFunctionDeclarations: serializedAttrs([
          stringListAttr(
            ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY,
            ["same_edge_retry"]
          )
        ]),
        vectorDeclarations: serializedAttrs([
          jsonBlobAttr(
            ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY,
            jsonArray([
              jsonObject({
                traversalFamily: "ticket_traversal",
                allowedActionKinds: jsonArray(["create_ticket"]),
                allowedTraversalTargetRefs: jsonArray(["asset:ticket/T-156"]),
                requiredAuthorityRefs: jsonArray(["authority://t156/ticket"]),
                proportionalityBasisRefs: jsonArray([
                  "proof://t156/compiler-static-gate"
                ])
              })
            ])
          )
        ])
      }
    )
  );

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assert.equal(report.issueCount, 0);
});

test("T-159 GTL program typechecker projects traversal-unit law", () => {
  const report = typecheckGtlProgram(
    compliantInput(
      {},
      {
        graphFunctionDeclarations: serializedAttrs([
          stringListAttr(
            ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY,
            ["same_edge_retry"]
          )
        ]),
        vectorDeclarations: serializedAttrs([
          jsonBlobAttr(
            ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY,
            jsonArray([
              jsonObject({
                traversalFamily: "ticket_traversal",
                allowedActionKinds: jsonArray(["create_ticket"]),
                allowedTraversalTargetRefs: jsonArray(["asset:ticket/T-159"]),
                requiredAuthorityRefs: jsonArray(["authority://t159/ticket"]),
                proportionalityBasisRefs: jsonArray([
                  "proof://t159/traversal-unit"
                ])
              })
            ])
          )
        ])
      }
    )
  );

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assert.equal(
    report.traversalUnitProjection.kind,
    "gtl_program_traversal_unit_projection"
  );
  assert.equal(report.traversalUnitProjection.units.length, 1);
  const unit = report.traversalUnitProjection.units[0];
  assert.notEqual(unit, undefined);
  assert.match(unit.unitRef, /^abg:\/\/gtl-program\/traversal-unit\/sha256:/u);
  assert.equal(unit.graphFunctionRef, "construct_prompt_invocation");
  assert.equal(unit.graphVectorRef, "construct_prompt_invocation");
  assert.equal(
    unit.targetCarrierContractRef,
    "gtl://target-carrier-contract/t150/prompt-invocation"
  );
  assert.deepEqual(unit.targetCarrierContractRefs, [
    "gtl://target-carrier-contract/t150/prompt-invocation"
  ]);
  assert.deepEqual(unit.materializationPolicyRefs, [
    "materialization://t150/target-carrier/PromptInvocationAsset"
  ]);
  assert.equal(unit.edgeClosureRef, "construct_prompt_invocation");
  assert.deepEqual(unit.edgeClosureRefs, ["construct_prompt_invocation"]);
  assert.equal(unit.computeCompositionRefs.length, 1);
  assert.equal(unit.computeStageBindingRefs.length, 3);
  assert.equal(unit.pluginResultInterfaceRefs.length, 3);
  assert.match(
    unit.conservationBasisRef,
    /^bind-conservation:\/\/t159\/construct_prompt_invocation\/intent-lineage/u
  );
  assert.deepEqual(unit.targetCarrierBindingRefs, [
    "gtl://target-carrier-contract/t150/prompt-invocation"
  ]);
  assert.deepEqual(unit.materializationBindingRefs, [
    "materialization://t150/target-carrier/PromptInvocationAsset"
  ]);
  assert.deepEqual(
    unit.allowedObligationDeltaFamilies,
    [...OBLIGATION_DELTA_FAMILIES].sort()
  );
  assert.equal(unit.intentLineageRefs.length, 2);
  assert.equal(unit.carriedObligationRefs.length, 1);
  assert.equal(unit.residualPressureRefs.length, 1);
  assert.equal(unit.stagedAuthorityRefs.length, 3);
  assert.equal(unit.downstreamTerminalPressureRefs.length, 1);
  assert.match(
    unit.allowedConsequenceTraversalCatalogRef,
    /^allowed-consequence-traversal-catalog:/u
  );
  assert.deepEqual(unit.allowedConsequenceTraversalFamilies, [
    "same_edge_retry",
    "ticket_traversal"
  ]);
  assert.equal(report.traversalUnitProjection.entryUnits.length, 1);
  assert.deepEqual(
    report.traversalUnitProjection.entryUnits[0]?.entryUnitRefs,
    [unit.unitRef]
  );
});

test("T-159 GTL program typechecker admits a JS hello-world materialization unit", () => {
  const outputSurface = assetSurface({
    kind: "javascript_program",
    requiredContexts: ["workspace", "node_runtime"],
    standardsRefs: ["standard://javascript/node/hello-world"],
    outputContractRefs: ["contract://t159/hello-world-js/index-js"],
    constructorRefs: ["constructor://t159/hello-world-js/materializer"],
    constructorInputAssetKinds: ["hello_world_intent"],
    proofObligationRefs: [
      "proof://t159/hello-world-js/file-materialized",
      "proof://t159/hello-world-js/node-stdout"
    ]
  });
  const report = typecheckGtlProgram(
    compliantInput(
      {},
      {
        graphFunctionName: "construct_hello_world_js",
        vectorName: "intent_to_hello_world_js",
        graphName: "HelloWorldJsConstructionGraph",
        inputName: "HelloWorldIntent",
        outputName: "HelloWorldJsProgram",
        inputSurface: assetSurface({
          kind: "hello_world_intent",
          outputContractRefs: ["contract://t159/hello-world-js/intent"]
        }),
        outputSurface,
        promptSurface: outputSurface,
        targetCarrierContractRef:
          "gtl://target-carrier-contract/t159/hello-world-js/index-js"
      }
    )
  );

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assert.equal(report.traversalUnitProjection.units.length, 1);
  const unit = report.traversalUnitProjection.units[0];
  assert.notEqual(unit, undefined);
  assert.equal(unit?.graphFunctionRef, "construct_hello_world_js");
  assert.equal(unit?.graphVectorRef, "intent_to_hello_world_js");
  assert.deepEqual(unit?.sourceAssetTypes, ["HelloWorldIntent"]);
  assert.equal(unit?.targetAssetType, "HelloWorldJsProgram");
  assert.deepEqual(unit?.targetCarrierContractRefs, [
    "gtl://target-carrier-contract/t159/hello-world-js/index-js"
  ]);
  assert.deepEqual(unit?.materializationPolicyRefs, [
    "materialization://t150/target-carrier/HelloWorldJsProgram"
  ]);
  assert.deepEqual(
    unit?.allowedObligationDeltaFamilies,
    [...OBLIGATION_DELTA_FAMILIES].sort()
  );
  assert.equal(report.traversalUnitProjection.entryUnits.length, 1);
  assert.deepEqual(
    report.traversalUnitProjection.entryUnits[0]?.entryUnitRefs,
    [unit?.unitRef]
  );
});

test("T-159 GTL program typechecker projects deterministic units for multi-vector graph functions", () => {
  const first = typecheckGtlProgram(multiVectorCompliantInput());
  const second = typecheckGtlProgram(multiVectorCompliantInput());

  assert.equal(first.passed, true, formatGtlProgramConformanceIssues(first.issues));
  assert.equal(second.passed, true, formatGtlProgramConformanceIssues(second.issues));
  assert.equal(first.traversalUnitProjection.units.length, 2);
  assert.deepEqual(
    first.traversalUnitProjection.units.map((unit) => unit.graphVectorRef),
    [
      "derive_pipeline_design_surface",
      "derive_pipeline_prompt_surface"
    ]
  );
  assert.deepEqual(
    first.traversalUnitProjection.units.map((unit) => unit.unitRef),
    second.traversalUnitProjection.units.map((unit) => unit.unitRef)
  );
  assert.deepEqual(
    first.traversalUnitProjection.entryUnits[0]?.entryUnitRefs,
    [...first.traversalUnitProjection.units.map((unit) => unit.unitRef)].sort()
  );
});

test("T-159 GTL program typechecker resolves public-start entry units by graph-function id", () => {
  const base = multiVectorCompliantInput();
  const graphFunction = base.modules[0]?.graphFunctions[0];
  assert.notEqual(graphFunction, undefined);
  const report = typecheckGtlProgram({
    ...base,
    publicStartTargets: [
      {
        name: "pipeline",
        graphFunctionRef: graphFunction.id,
        overlayRefs: ["overlay://t159/pipeline"],
        defaultForOverlayRefs: ["overlay://t159/pipeline"]
      }
    ]
  });

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assert.equal(report.traversalUnitProjection.entryUnits.length, 1);
  assert.deepEqual(
    report.traversalUnitProjection.entryUnits[0]?.entryUnitRefs,
    [...report.traversalUnitProjection.units.map((unit) => unit.unitRef)].sort()
  );
});

test("T-159 GTL program typechecker keeps overlay rows from creating traversal units outside graph functions", () => {
  const base = compliantInput();
  const report = typecheckGtlProgram({
    ...base,
    expectedCoverage: expectedCoverage({
      overlayCount: 2
    }),
    overlays: [
      ...base.overlays,
      {
        overlayRef: "overlay://t159/stray-vector",
        graphFunctionRefs: ["construct_prompt_invocation"],
        graphVectorRefs: ["stray_overlay_vector"],
        publicStartTargets: ["construct_prompt_invocation"],
        defaultStartTarget: "construct_prompt_invocation"
      }
    ]
  });

  assert.equal(report.passed, false);
  assertRule(report, "abg://gtl-program/overlay/graph-vector-resolves");
  assert.equal(report.traversalUnitProjection.units.length, 1);
  assert.equal(
    report.traversalUnitProjection.units.some((unit) =>
      unit.graphVectorRef === "stray_overlay_vector"
    ),
    false
  );
});

test("T-159 GTL program typechecker accepts overlay entry targets by graph-function id", () => {
  const base = multiVectorCompliantInput();
  const graphFunction = base.modules[0]?.graphFunctions[0];
  const overlay = base.overlays[0];
  const publicStart = base.publicStartTargets[0];
  assert.notEqual(graphFunction, undefined);
  assert.notEqual(overlay, undefined);
  assert.notEqual(publicStart, undefined);

  const report = typecheckGtlProgram({
    ...base,
    overlays: [
      {
        ...overlay,
        graphFunctionRefs: [graphFunction.id],
        publicStartTargets: [graphFunction.id],
        defaultStartTarget: graphFunction.id
      }
    ],
    publicStartTargets: [
      {
        ...publicStart,
        graphFunctionRef: graphFunction.id
      }
    ]
  });

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assertNoRule(report, "abg://gtl-program/overlay/graph-function-resolves");
  assertNoRule(report, "abg://gtl-program/overlay/public-start-target-resolves");
  assertNoRule(report, "abg://gtl-program/overlay/default-start-target-resolves");
  assert.deepEqual(
    report.traversalUnitProjection.entryUnits[0]?.entryUnitRefs,
    [...report.traversalUnitProjection.units.map((unit) => unit.unitRef)].sort()
  );
});

test("T-159 GTL program typechecker accepts direct graph-function start without overlay", () => {
  const base = multiVectorCompliantInput();
  const publicStart = base.publicStartTargets[0];
  assert.notEqual(publicStart, undefined);
  const report = typecheckGtlProgram({
    ...base,
    expectedCoverage: expectedCoverage({
      graphVectorCount: 2,
      targetCarrierContractCount: 2,
      edgeClosureContractCount: 2,
      overlayCount: 0
    }),
    overlays: [],
    publicStartTargets: [
      {
        ...publicStart,
        overlayRefs: [],
        defaultForOverlayRefs: []
      }
    ]
  });

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assert.equal(report.coverage.overlayCount, 0);
  assert.deepEqual(
    report.traversalUnitProjection.entryUnits[0]?.entryUnitRefs,
    [...report.traversalUnitProjection.units.map((unit) => unit.unitRef)].sort()
  );
});

test("T-159 GTL program typechecker scopes candidate entry units by explicit overlay vectors", () => {
  const base = multiVectorCompliantInput();
  const overlay = base.overlays[0];
  assert.notEqual(overlay, undefined);
  const report = typecheckGtlProgram({
    ...base,
    overlays: [
      {
        ...overlay,
        graphVectorRefs: ["derive_pipeline_prompt_surface"]
      }
    ]
  });

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  const scopedUnit = report.traversalUnitProjection.units.find(
    (unit) => unit.graphVectorRef === "derive_pipeline_prompt_surface"
  );
  assert.notEqual(scopedUnit, undefined);
  assert.deepEqual(
    report.traversalUnitProjection.entryUnits[0]?.entryUnitRefs,
    [scopedUnit.unitRef]
  );
});

test("T-159 GTL program typechecker rejects public starts attached to unrelated overlays", () => {
  const base = syntheticDownstreamEntryUnitInput();
  const bootstrapStart = base.publicStartTargets[0];
  const ticketStart = base.publicStartTargets[1];
  assert.notEqual(bootstrapStart, undefined);
  assert.notEqual(ticketStart, undefined);
  const report = typecheckGtlProgram({
    ...base,
    publicStartTargets: [
      {
        ...bootstrapStart,
        overlayRefs: ["overlay://t159/ticket"],
        defaultForOverlayRefs: ["overlay://t159/ticket"]
      },
      ticketStart
    ]
  });

  assert.equal(report.passed, false);
  assertRule(
    report,
    "abg://gtl-program/public-start/overlay-graph-function-compatible"
  );
  assertRule(
    report,
    "abg://gtl-program/public-start/default-overlay-start-compatible"
  );
  assertRule(report, "abg://gtl-program/traversal-unit/public-start-entry");
});

test("T-159 GTL program typechecker rejects overlay public-start target by graph-vector id", () => {
  const base = multiVectorCompliantInput();
  const graphFunction = base.modules[0]?.graphFunctions[0];
  const overlay = base.overlays[0];
  assert.notEqual(graphFunction, undefined);
  assert.notEqual(overlay, undefined);
  const graph = materializeGraphFunction(graphFunction);
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);

  const report = typecheckGtlProgram({
    ...base,
    overlays: [
      {
        ...overlay,
        publicStartTargets: [vector.id]
      }
    ]
  });

  assert.equal(report.passed, false);
  assertRule(report, "abg://gtl-program/overlay/public-start-target-resolves");
  assert.equal(report.traversalUnitProjection.units.length, 2);
});

test("T-159 GTL program typechecker rejects overlay default start by graph-vector id", () => {
  const base = multiVectorCompliantInput();
  const graphFunction = base.modules[0]?.graphFunctions[0];
  const overlay = base.overlays[0];
  assert.notEqual(graphFunction, undefined);
  assert.notEqual(overlay, undefined);
  const graph = materializeGraphFunction(graphFunction);
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);

  const report = typecheckGtlProgram({
    ...base,
    overlays: [
      {
        ...overlay,
        defaultStartTarget: vector.id
      }
    ]
  });

  assert.equal(report.passed, false);
  assertRule(report, "abg://gtl-program/overlay/default-start-target-resolves");
  assert.equal(report.traversalUnitProjection.units.length, 2);
});

test("T-159 GTL program typechecker projects missing consequence catalog declarations as lawful empty no-bind truth", () => {
  const report = typecheckGtlProgram(compliantInput());

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assert.equal(report.traversalUnitProjection.units.length, 1);
  const unit = report.traversalUnitProjection.units[0];
  assert.notEqual(unit, undefined);
  assert.match(
    unit.allowedConsequenceTraversalCatalogRef,
    /^allowed-consequence-traversal-catalog:/u
  );
  assert.deepEqual(unit.allowedConsequenceTraversalFamilies, []);
  assert.deepEqual(unit.allowedConsequenceTraversalRowRefs, []);
});

test("T-159 GTL program typechecker projects explicit empty consequence catalog rows as lawful empty no-bind truth", () => {
  const report = typecheckGtlProgram(
    compliantInput(
      {},
      {
        vectorDeclarations: serializedAttrs([
          jsonBlobAttr(
            ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY,
            jsonArray([])
          )
        ])
      }
    )
  );

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  const unit = report.traversalUnitProjection.units[0];
  assert.notEqual(unit, undefined);
  assert.match(
    unit.allowedConsequenceTraversalCatalogRef,
    /^allowed-consequence-traversal-catalog:/u
  );
  assert.deepEqual(unit.allowedConsequenceTraversalFamilies, []);
  assert.deepEqual(unit.allowedConsequenceTraversalRowRefs, []);
});

test("T-159 GTL program typechecker proves synthetic traverse bootstrap and ticket entry units", () => {
  const report = typecheckGtlProgram(syntheticDownstreamEntryUnitInput());

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  const entryByStart = new Map(
    report.traversalUnitProjection.entryUnits.map((entry) => [
      entry.publicStartRef,
      entry
    ])
  );
  const bootstrapEntry = entryByStart.get("traverse<bootstrap, conformant>");
  const ticketEntry = entryByStart.get("traverse<ticket, triage>");
  assert.notEqual(bootstrapEntry, undefined);
  assert.notEqual(ticketEntry, undefined);
  assert.equal(bootstrapEntry.entryUnitRefs.length, 1);
  assert.equal(ticketEntry.entryUnitRefs.length, 1);
  assert.notEqual(bootstrapEntry.entryUnitRefs[0], ticketEntry.entryUnitRefs[0]);
  const unitByRef = new Map(
    report.traversalUnitProjection.units.map((unit) => [unit.unitRef, unit])
  );
  assert.equal(
    unitByRef.get(bootstrapEntry.entryUnitRefs[0])?.graphFunctionRef,
    "traverse_bootstrap_conformant"
  );
  assert.equal(
    unitByRef.get(ticketEntry.entryUnitRefs[0])?.graphFunctionRef,
    "traverse_ticket_triage"
  );
});

test("T-159 GTL program typechecker rejects public starts with no traversal unit", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      publicStartTargets: [
        {
          name: "missing",
          graphFunctionRef: "missing_graph_function",
          overlayRefs: ["overlay://t150/default"],
          defaultForOverlayRefs: ["overlay://t150/default"]
        }
      ]
    })
  );
  assert.equal(report.passed, false);
  assertRule(report, "abg://gtl-program/traversal-unit/public-start-entry");
});

test("T-159 GTL program typechecker rejects public-start entry by graph-vector id", () => {
  const base = multiVectorCompliantInput();
  const graphFunction = base.modules[0]?.graphFunctions[0];
  assert.notEqual(graphFunction, undefined);
  const graph = materializeGraphFunction(graphFunction);
  const vector = graph.vectors[0];
  const publicStart = base.publicStartTargets[0];
  assert.notEqual(vector, undefined);
  assert.notEqual(publicStart, undefined);

  const report = typecheckGtlProgram({
    ...base,
    publicStartTargets: [
      {
        ...publicStart,
        graphFunctionRef: vector.id
      }
    ]
  });

  assert.equal(report.passed, false);
  assertRule(report, "abg://gtl-program/public-start/graph-function-resolves");
  assertRule(report, "abg://gtl-program/traversal-unit/public-start-entry");
  assert.deepEqual(
    report.traversalUnitProjection.entryUnits[0]?.entryUnitRefs,
    []
  );
});

test("T-159 GTL program typechecker rejects public-start entry by overlay ref", () => {
  const base = multiVectorCompliantInput();
  const publicStart = base.publicStartTargets[0];
  assert.notEqual(publicStart, undefined);

  const report = typecheckGtlProgram({
    ...base,
    publicStartTargets: [
      {
        ...publicStart,
        graphFunctionRef: "overlay://t159/pipeline"
      }
    ]
  });

  assert.equal(report.passed, false);
  assertRule(report, "abg://gtl-program/public-start/graph-function-resolves");
  assertRule(report, "abg://gtl-program/traversal-unit/public-start-entry");
  assert.deepEqual(
    report.traversalUnitProjection.entryUnits[0]?.entryUnitRefs,
    []
  );
});

test("T-159 GTL program typechecker rejects product-local command routers", () => {
  const base = compliantInput();
  const runtimeBinding = base.runtimeBindings[0];
  assert.notEqual(runtimeBinding, undefined);

  const report = typecheckGtlProgram(
    compliantInput({
      runtimeBindings: [
        {
          ...runtimeBinding,
          commandRef:
            "odd-sdlc-ts start --graph-overlay overlay:bootstrap-requirements --replay-next-action"
        }
      ]
    })
  );
  assert.equal(report.passed, false);
  assertRule(
    report,
    "abg://gtl-program/runtime-binding/no-product-local-command-router"
  );
});

test("T-159 GTL program typechecker accepts ABG-owned runtime command refs", () => {
  const base = compliantInput();
  const runtimeBinding = base.runtimeBindings[0];
  assert.notEqual(runtimeBinding, undefined);

  for (const commandRef of [
    "abiogenesis-ts start --target graph_function:prompt --until converged",
    "genesis-ts start --target graph_function:prompt --until converged"
  ]) {
    const report = typecheckGtlProgram(
      compliantInput({
        runtimeBindings: [
          {
            ...runtimeBinding,
            commandRef
          }
        ]
      })
    );
    assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  }
});

test("T-159 GTL program typechecker accepts bare ABG runtime start command", () => {
  const report = typecheckGtlProgram(compliantInput());

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assertNoRule(
    report,
    "abg://gtl-program/runtime-binding/no-product-local-command-router"
  );
});

test("T-159 GTL program typechecker accepts ABG runtime command targeting graph-function id", () => {
  const base = compliantInput();
  const graphFunction = base.modules[0]?.graphFunctions[0];
  const runtimeBinding = base.runtimeBindings[0];
  assert.notEqual(graphFunction, undefined);
  assert.notEqual(runtimeBinding, undefined);

  const report = typecheckGtlProgram(
    compliantInput({
      runtimeBindings: [
        {
          ...runtimeBinding,
          commandRef: `abiogenesis-ts start --target ${graphFunction.id}`
        }
      ]
    })
  );

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assertNoRule(
    report,
    "abg://gtl-program/runtime-binding/no-product-local-command-router"
  );
});

test("T-159 GTL program typechecker accepts ABG runtime command targeting sdlc-named graph-function refs", () => {
  const base = compliantInput();
  const runtimeBinding = base.runtimeBindings[0];
  assert.notEqual(runtimeBinding, undefined);

  for (const commandRef of [
    "abiogenesis-ts start --target graph_function:odd_sdlc_bootstrap",
    "abiogenesis-ts start --target=graph_function:odd-sdlc-bootstrap"
  ]) {
    const report = typecheckGtlProgram(
      compliantInput({
        runtimeBindings: [
          {
            ...runtimeBinding,
            commandRef
          }
        ]
      })
    );
    assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
    assertNoRule(
      report,
      "abg://gtl-program/runtime-binding/no-product-local-command-router"
    );
  }
});

test("T-159 GTL program typechecker rejects product-local command routers by token", () => {
  const base = compliantInput();
  const runtimeBinding = base.runtimeBindings[0];
  assert.notEqual(runtimeBinding, undefined);

  for (const commandRef of [
    "odd-sdlc-ts start --target next",
    "odd_sdlc start --target next",
    "sdlc start --target next",
    "abiogenesis-ts start --graph-overlay overlay:bootstrap-requirements",
    "abiogenesis-ts start --target overlay:lite-design-module-implementation",
    "abiogenesis-ts replay-next-action --target next",
    "abiogenesis-ts StartOutcomeForObservedReplay --target next"
  ]) {
    const report = typecheckGtlProgram(
      compliantInput({
        runtimeBindings: [
          {
            ...runtimeBinding,
            commandRef
          }
        ]
      })
    );
    assert.equal(report.passed, false, commandRef);
    assertRule(
      report,
      "abg://gtl-program/runtime-binding/no-product-local-command-router"
    );
  }
});

test("T-159 GTL program typechecker reports missing target carrier as incomplete traversal unit", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      expectedCoverage: expectedCoverage({
        targetCarrierContractCount: 0
      }),
      targetCarrierContracts: []
    })
  );

  assert.equal(report.passed, false);
  assertRule(report, "abg://gtl-program/traversal-unit/target-carrier-required");
});

test("T-159 GTL program typechecker reports ambiguous target carrier as incomplete traversal unit", () => {
  const base = compliantInput();
  const graphFunction = base.modules[0]?.graphFunctions[0];
  assert.notEqual(graphFunction, undefined);
  const graph = materializeGraphFunction(graphFunction);
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);
  const duplicateTargetCarrier = targetCarrierContractRow({
    edgeRef: "construct_prompt_invocation",
    graphVectorRef: "construct_prompt_invocation",
    graphFunction,
    graph,
    vector,
    targetAssetType: "PromptInvocationAsset",
    targetCarrierContractRef:
      "gtl://target-carrier-contract/t159/ambiguous-prompt-invocation"
  });
  const report = typecheckGtlProgram({
    ...base,
    expectedCoverage: expectedCoverage({
      targetCarrierContractCount: 2
    }),
    targetCarrierContracts: [
      ...base.targetCarrierContracts,
      duplicateTargetCarrier
    ]
  });
  const unit = report.traversalUnitProjection.units[0];

  assert.equal(report.passed, false);
  assert.notEqual(unit, undefined);
  assert.equal(unit.targetCarrierContractRef, null);
  assert.equal(unit.targetCarrierContractRefs.length, 2);
  assertRule(report, "abg://gtl-program/target-carrier/unique-vector-row");
  assertRule(report, "abg://gtl-program/traversal-unit/target-carrier-ambiguous");
  assertNoRule(report, "abg://gtl-program/traversal-unit/target-carrier-required");
});

test("T-159 GTL program typechecker reports missing edge closure as incomplete traversal unit", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      expectedCoverage: expectedCoverage({
        edgeClosureContractCount: 0
      }),
      edgeClosureContracts: []
    })
  );

  assert.equal(report.passed, false);
  assertRule(report, "abg://gtl-program/traversal-unit/edge-closure-required");
});

test("T-159 GTL program typechecker reports ambiguous edge closure as incomplete traversal unit", () => {
  const base = compliantInput();
  const edgeClosure = base.edgeClosureContracts[0];
  assert.notEqual(edgeClosure, undefined);
  const report = typecheckGtlProgram({
    ...base,
    expectedCoverage: expectedCoverage({
      edgeClosureContractCount: 2
    }),
    edgeClosureContracts: [
      ...base.edgeClosureContracts,
      {
        ...edgeClosure,
        edgeRef: "construct_prompt_invocation_duplicate"
      }
    ]
  });
  const unit = report.traversalUnitProjection.units[0];

  assert.equal(report.passed, false);
  assert.notEqual(unit, undefined);
  assert.equal(unit.edgeClosureRef, null);
  assert.equal(unit.edgeClosureRefs.length, 2);
  assertRule(report, "abg://gtl-program/edge-closure/unique-vector-row");
  assertRule(report, "abg://gtl-program/traversal-unit/edge-closure-ambiguous");
  assertNoRule(report, "abg://gtl-program/traversal-unit/edge-closure-required");
});

test("T-159 GTL program typechecker reports missing compute composition as incomplete traversal unit", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      computeCompositions: []
    })
  );

  assert.equal(report.passed, false);
  assertRule(
    report,
    "abg://gtl-program/traversal-unit/compute-composition-required"
  );
});

test("T-159 GTL program typechecker reports missing stage bindings as incomplete traversal unit", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      computeStageBindings: []
    })
  );

  assert.equal(report.passed, false);
  assertRule(report, "abg://gtl-program/traversal-unit/stage-binding-required");
});

test("T-159 GTL program typechecker reports missing plugin result interfaces as incomplete traversal unit", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      pluginResultInterfaces: []
    })
  );

  assert.equal(report.passed, false);
  assertRule(
    report,
    "abg://gtl-program/traversal-unit/plugin-result-interface-required"
  );
  assertRule(
    report,
    "abg://gtl-program/traversal-unit/consequence-result-interface-required"
  );
});

test("T-159 GTL program typechecker rejects consequence bind without consequence result-interface truth", () => {
  const base = compliantInput();
  const report = typecheckGtlProgram({
    ...base,
    pluginResultInterfaces: base.pluginResultInterfaces.filter(
      (row) => row.stageRole !== "consequence"
    )
  });

  assert.equal(report.passed, false);
  assertNoRule(
    report,
    "abg://gtl-program/traversal-unit/plugin-result-interface-required"
  );
  assertRule(
    report,
    "abg://gtl-program/traversal-unit/consequence-result-interface-required"
  );
});

test("T-159 GTL program typechecker report digest changes with traversal-unit inventory", () => {
  const first = typecheckGtlProgram(compliantInput());
  const second = typecheckGtlProgram(multiVectorCompliantInput());

  assert.equal(first.passed, true, formatGtlProgramConformanceIssues(first.issues));
  assert.equal(second.passed, true, formatGtlProgramConformanceIssues(second.issues));
  assert.notEqual(
    first.traversalUnitProjection.units.length,
    second.traversalUnitProjection.units.length
  );
  assert.notEqual(first.reportRef, second.reportRef);
});

test("T-156 GTL program typechecker rejects unknown consequence traversal family declarations", () => {
  const report = typecheckGtlProgram(
    compliantInput(
      {},
      {
        vectorDeclarations: serializedAttrs([
          stringListAttr(
            ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY,
            ["same_edge_retry", "cursor_jump"]
          )
        ])
      }
    )
  );
  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  const messages = report.issues.map((entry) => entry.message).join("\n");

  assert.equal(report.passed, false);
  assert(
    ruleRefs.has(
      "abg://gtl-program/allowed-consequence-traversal/declaration"
    )
  );
  assert.match(messages, /cursor_jump/u);
});

test("T-156 GTL program typechecker rejects malformed allowed traversal row declarations", () => {
  const report = typecheckGtlProgram(
    compliantInput(
      {},
      {
        vectorDeclarations: serializedAttrs([
          scalarAttr(
            ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_ROWS_DECLARATION_KEY,
            "not-json"
          )
        ])
      }
    )
  );
  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  const messages = report.issues.map((entry) => entry.message).join("\n");

  assert.equal(report.passed, false);
  assert(
    ruleRefs.has(
      "abg://gtl-program/allowed-consequence-traversal/declaration"
    )
  );
  assert.match(messages, /must be a json_blob declaration/u);
});

test("T-152 GTL program typechecker requires a complete T-153 feature manifest", () => {
  const missing = typecheckGtlProgram({
    ...compliantInput(),
    featureCoverageManifest: undefined
  });
  const partial = typecheckGtlProgram({
    ...compliantInput(),
    featureCoverageManifest: featureCoverageManifest({
      omit: ["graph_algebra_recurse"]
    })
  });

  const missingRuleRefs = new Set(missing.issues.map((entry) => entry.ruleRef));
  const partialMessages = partial.issues.map((entry) => entry.message).join("\n");
  assert.equal(missing.passed, false);
  assert(missingRuleRefs.has("abg://gtl-program/feature-coverage/manifest-required"));
  assert.equal(partial.passed, false);
  assert.match(partialMessages, /graph_algebra_recurse/u);
  assert.match(partialMessages, /featureCoverageManifest must classify T-153 feature/u);
});

test("T-152 GTL program typechecker rejects contradictory T-153 feature disposition", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      featureCoverageManifest: featureCoverageManifest({
        dispositions: {
          prompt_typed_asset_law: "not_used"
        }
      })
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/feature-coverage/not-used-contradiction"));
  assert.match(messages, /prompt_typed_asset_law/u);
});

test("T-152 GTL program typechecker rejects claimed T-153 features without inventory", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      featureCoverageManifest: featureCoverageManifest({
        dispositions: {
          graph_algebra_recurse: "present"
        }
      })
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/feature-coverage/present-without-inventory"));
  assert.match(messages, /graph_algebra_recurse/u);
});

test("T-152 GTL program typechecker rejects duplicate T-153 feature rows", () => {
  const manifest = featureCoverageManifest();
  const row = manifest.rows.find(
    (entry) => entry.featureKind === "graph_algebra_recurse"
  );
  assert.notEqual(row, undefined);
  const report = typecheckGtlProgram(
    compliantInput({
      featureCoverageManifest: {
        ...manifest,
        rows: [...manifest.rows, row]
      }
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/feature-coverage/unique-feature-row"));
  assert.match(messages, /graph_algebra_recurse/u);
});

test("T-152 GTL program typechecker rejects caller-spoofed feature owner truth", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      featureCoverageManifest: featureCoverageManifest({
        ownerClassifications: {
          graph_structure_interface: "downstream_product_meaning"
        }
      })
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert(
    ruleRefs.has(
      "abg://gtl-program/feature-coverage/owner-classification-truth"
    )
  );
  assert.match(messages, /graph_structure_interface ownerClassification/u);
});

test("T-152 GTL program typechecker does not infer hooks or F-star composition from unrelated rows", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      computeCompositions: [],
      computeStageBindings: [],
      hookBoundaries: [],
      runtimeBindings: [],
      featureCoverageManifest: featureCoverageManifest({
        dispositions: {
          f_star_compute_composition: "not_used",
          hook_boundaries: "not_used"
        }
      })
    })
  );

  const fStarOrHookContradictions = report.issues.filter(
    (entry) =>
      entry.ruleRef ===
        "abg://gtl-program/feature-coverage/not-used-contradiction" &&
      (entry.surfaceRef === "f_star_compute_composition" ||
        entry.surfaceRef === "hook_boundaries")
  );
  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert.equal(
    fStarOrHookContradictions.length,
    0,
    formatGtlProgramConformanceIssues(report.issues)
  );
  assert(
    ruleRefs.has("abg://gtl-program/plugin-contract/stage-binding-required")
  );
});

test("T-152 GTL program typechecker requires selected transform/evaluate/consequence stage rows", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      computeStageBindings: [],
      runtimeBindings: [],
      featureCoverageManifest: featureCoverageManifest({
        dispositions: {
          f_star_compute_composition: "present",
          public_start_binding: "present"
        }
      })
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert(
    ruleRefs.has("abg://gtl-program/compute-composition/required-stage-row")
  );
  assert(
    ruleRefs.has("abg://gtl-program/feature-coverage/present-without-inventory")
  );
  assert.match(messages, /transform\.C/u);
  assert.match(messages, /evaluate\.C/u);
  assert.match(messages, /consequence\.C/u);
});

test("T-152 GTL program typechecker rejects plugin contracts without stage and ABG runtime binding", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      computeStageBindings: [],
      runtimeBindings: []
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(
    ruleRefs.has("abg://gtl-program/plugin-contract/stage-binding-required")
  );
  assert(
    ruleRefs.has("abg://gtl-program/plugin-contract/runtime-binding-required")
  );
});

test("T-152 GTL program typechecker rejects product-local wrapper runtime binding claims", () => {
  const base = compliantInput();
  const runtimeBinding = base.runtimeBindings[0];
  const stageBinding = base.computeStageBindings[0];
  assert.notEqual(runtimeBinding, undefined);
  assert.notEqual(stageBinding, undefined);
  const report = typecheckGtlProgram(
    compliantInput({
      runtimeBindings: [
        {
          ...runtimeBinding,
          consumesPluginsThroughAbg: false,
          forbidsProductLocalIteration: false
        }
      ],
      computeStageBindings: [
        {
          ...stageBinding,
          mayOwnIterationLoop: true
        },
        ...base.computeStageBindings.slice(1)
      ]
    })
  );

  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert.match(messages, /consumesPluginsThroughAbg must be true/u);
  assert.match(messages, /forbidsProductLocalIteration must be true/u);
  assert.match(messages, /mayOwnIterationLoop must be false/u);
});

test("T-152 GTL program typechecker rejects relative cursor offset as re-entry authority", () => {
  const base = compliantInput();
  const route = { ...base.runtimeReentryRoutes[0] };
  delete route.reentryTargetVectorIndex;
  route.relativeCursorOffset = -2;

  const report = typecheckGtlProgram(
    compliantInput({
      runtimeReentryRoutes: [route]
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert(
    ruleRefs.has(
      "abg://gtl-program/runtime-reentry/relative-offset-not-authority"
    )
  );
  assert(
    ruleRefs.has("abg://gtl-program/input/non-negative-integer-field")
  );
  assert.match(messages, /relativeCursorOffset/u);
  assert.match(messages, /reentryTargetVectorIndex/u);
});

test("T-152 GTL program typechecker rejects unbound runtime re-entry vector identity", () => {
  const base = compliantInput();
  const route = base.runtimeReentryRoutes[0];

  const missingIndex = typecheckGtlProgram(
    compliantInput({
      runtimeReentryRoutes: [
        {
          ...route,
          reentryTargetVectorIndex: 3
        }
      ]
    })
  );
  const mismatchedIdentity = typecheckGtlProgram(
    compliantInput({
      runtimeReentryRoutes: [
        {
          ...route,
          repairGraphVectorRef: "other_vector"
        }
      ]
    })
  );

  const missingRuleRefs = new Set(missingIndex.issues.map((entry) => entry.ruleRef));
  const mismatchRuleRefs = new Set(
    mismatchedIdentity.issues.map((entry) => entry.ruleRef)
  );
  assert.equal(missingIndex.passed, false);
  assert.equal(mismatchedIdentity.passed, false);
  assert(
    missingRuleRefs.has(
      "abg://gtl-program/runtime-reentry/target-vector-index-resolves"
    )
  );
  assert(
    mismatchRuleRefs.has(
      "abg://gtl-program/runtime-reentry/absolute-target-identity"
    )
  );
});

test("T-152 GTL program typechecker requires first-class same_object proof rows", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      sameObjectProofs: [],
      featureCoverageManifest: featureCoverageManifest({
        dispositions: {
          graph_algebra_same_object: "present"
        }
      })
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/feature-coverage/present-without-inventory"));
  assert.match(messages, /graph_algebra_same_object/u);
});

const FIRST_CLASS_T153_INVENTORY_CASES = [
  {
    featureKind: "graph_algebra_same_object",
    override: { sameObjectProofs: [] }
  },
  {
    featureKind: "operator_declarations",
    override: { operatorDeclarations: [] }
  },
  {
    featureKind: "evaluator_declarations",
    override: { evaluatorDeclarations: [] }
  },
  {
    featureKind: "rule_declarations",
    override: { ruleDeclarations: [] }
  },
  {
    featureKind: "f_star_compute_composition",
    override: { computeCompositions: [] }
  },
  {
    featureKind: "hook_boundaries",
    override: { hookBoundaries: [] }
  },
  {
    featureKind: "selection_refinement_synthesis_subwork",
    override: { selectionBoundaries: [] }
  },
  {
    featureKind: "job_binding",
    override: { jobBindings: [] }
  },
  {
    featureKind: "role_binding",
    override: { roleBindings: [] }
  },
  {
    featureKind: "external_tool_gates",
    override: { externalToolGates: [] }
  }
];

for (const entry of FIRST_CLASS_T153_INVENTORY_CASES) {
  test(`T-152 GTL program typechecker requires first-class inventory for ${entry.featureKind}`, () => {
    const report = typecheckGtlProgram(
      compliantInput({
        ...entry.override,
        featureCoverageManifest: featureCoverageManifest({
          dispositions: {
            [entry.featureKind]: "present"
          }
        })
      })
    );

    const ruleRefs = new Set(report.issues.map((issueEntry) => issueEntry.ruleRef));
    const messages = report.issues.map((issueEntry) => issueEntry.message).join("\n");
    assert.equal(report.passed, false);
    assert(ruleRefs.has("abg://gtl-program/feature-coverage/present-without-inventory"));
    assert.match(messages, new RegExp(entry.featureKind, "u"));
  });
}

test("T-152 GTL program typechecker rejects malformed first-class T-153 inventory rows", () => {
  const base = compliantInput();
  const sameObjectProof = base.sameObjectProofs[0];
  const operatorDeclaration = base.operatorDeclarations[0];
  const evaluatorDeclaration = base.evaluatorDeclarations[0];
  const ruleDeclaration = base.ruleDeclarations[0];
  const computeComposition = base.computeCompositions[0];
  const computeStageBinding = base.computeStageBindings[0];
  const hookBoundary = base.hookBoundaries[0];
  const selectionBoundary = base.selectionBoundaries.find(
    (row) => row.boundaryKind === "candidate_family"
  );
  const jobBinding = base.jobBindings[0];
  const roleBinding = base.roleBindings[0];
  const externalToolGate = base.externalToolGates[0];
  const runtimeBinding = base.runtimeBindings[0];
  assert.notEqual(sameObjectProof, undefined);
  assert.notEqual(operatorDeclaration, undefined);
  assert.notEqual(evaluatorDeclaration, undefined);
  assert.notEqual(ruleDeclaration, undefined);
  assert.notEqual(computeComposition, undefined);
  assert.notEqual(computeStageBinding, undefined);
  assert.notEqual(hookBoundary, undefined);
  assert.notEqual(selectionBoundary, undefined);
  assert.notEqual(jobBinding, undefined);
  assert.notEqual(roleBinding, undefined);
  assert.notEqual(externalToolGate, undefined);
  assert.notEqual(runtimeBinding, undefined);

  const report = typecheckGtlProgram({
    ...base,
    sameObjectProofs: [
      {
        ...sameObjectProof,
        rightRef: sameObjectProof.leftRef,
        equalityDigest: "not-a-digest"
      }
    ],
    operatorDeclarations: [
      {
        ...operatorDeclaration,
        hostRef: "missing_graph_vector"
      }
    ],
    evaluatorDeclarations: [
      {
        ...evaluatorDeclaration,
        tagRefs: []
      }
    ],
    ruleDeclarations: [
      {
        ...ruleDeclaration,
        configDigest: "not-a-digest"
      }
    ],
    computeCompositions: [
      {
        ...computeComposition,
        compositionDigest: "not-a-digest",
        notationRefs: ["fn<PromptAuthorityPacket,PromptInvocationAsset>.C"],
        regimeBindingRefs: [],
        stageBindingRefs: ["stage-binding://t150/transform.C"]
      }
    ],
    computeStageBindings: [
      {
        ...computeStageBinding,
        compositionRef: "abg.fn_composition://t150/missing",
        stageNotationRef: "dispatch.C",
        inputCarrierRefs: [],
        outputCarrierRefs: [],
        predecessorStageBindingRefs: ["stage-binding://t150/missing"],
        pluginContractRefs: ["plugin://t150/missing"],
        regimeDispositions: [
          {
            regime: "F_P",
            disposition: "participates",
            selectedRegimeBindingRefs: [],
            reasonRefs: [],
            evidenceRefs: []
          }
        ],
        maySelectTraversal: true,
        mayOwnIterationLoop: true
      }
    ],
    hookBoundaries: [
      {
        ...hookBoundary,
        concernRefs: [],
        pluginContractRefs: ["plugin://t150/hook-missing"]
      }
    ],
    selectionBoundaries: [
      {
        ...selectionBoundary,
        candidateRefs: []
      }
    ],
    jobBindings: [
      {
        ...jobBinding,
        roleRefs: ["missing_role"],
        publicCallableGraphFunctionRefs: ["missing_graph_function"]
      }
    ],
    roleBindings: [
      {
        ...roleBinding,
        capabilityRefs: []
      }
    ],
    externalToolGates: [
      {
        ...externalToolGate,
        transportRef: "http://t150/not-transport",
        admissionRef: "gate://t150/not-admission",
        notLanguageTruthEvidenceRefs: []
      }
    ],
    runtimeBindings: [
      {
        ...runtimeBinding,
        moduleRef: "missing_module",
        publicStartRef: "missing_public_start",
        pluginContractRefs: ["plugin://t150/runtime-missing"],
        stageBindingRefs: ["stage-binding://t150/missing"],
        consumesPluginsThroughAbg: false,
        forbidsProductLocalIteration: false
      }
    ]
  });

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  for (const ruleRef of [
    "abg://gtl-program/same-object/equality-digest",
    "abg://gtl-program/same-object/nontrivial-proof",
    "abg://gtl-program/declaration/host-ref-resolves",
    "abg://gtl-program/evaluator-declaration/tag-refs",
    "abg://gtl-program/rule-declaration/config-digest",
    "abg://gtl-program/compute-composition/digest",
    "abg://gtl-program/compute-composition/regime-bindings",
    "abg://gtl-program/compute-composition/notation-ref",
    "abg://gtl-program/compute-composition/stage-binding",
    "abg://gtl-program/compute-stage/composition-resolves",
    "abg://gtl-program/compute-stage/notation-ref",
    "abg://gtl-program/compute-stage/input-carriers",
    "abg://gtl-program/compute-stage/output-carriers",
    "abg://gtl-program/compute-stage/predecessor-resolves",
    "abg://gtl-program/compute-stage/plugin-contract-resolves",
    "abg://gtl-program/compute-stage/regime-disposition-required",
    "abg://gtl-program/compute-stage/participating-regime-binding",
    "abg://gtl-program/hook-boundary/concern-refs",
    "abg://gtl-program/hook-boundary/plugin-contract-resolves",
    "abg://gtl-program/hook-boundary/plugin-stage-binding-resolves",
    "abg://gtl-program/selection-boundary/candidate-refs",
    "abg://gtl-program/job-binding/graph-function-resolves",
    "abg://gtl-program/job-binding/role-ref-resolves",
    "abg://gtl-program/role-binding/capability-refs",
    "abg://gtl-program/external-tool-gate/transport-ref",
    "abg://gtl-program/external-tool-gate/admission-ref",
    "abg://gtl-program/external-tool-gate/not-language-truth",
    "abg://gtl-program/runtime-binding/module-ref-resolves",
    "abg://gtl-program/runtime-binding/public-start-ref-resolves",
    "abg://gtl-program/runtime-binding/plugin-contract-resolves",
    "abg://gtl-program/runtime-binding/plugin-stage-binding-resolves",
    "abg://gtl-program/runtime-binding/stage-binding-resolves"
  ]) {
    assert(ruleRefs.has(ruleRef), ruleRef);
  }
});

test("T-152 GTL program typechecker observes GTL algebra operation carriers", () => {
  const aToB = graphFunctionFixture({
    graphFunctionName: "algebra_a_to_b",
    graphName: "AlgebraAToB",
    inputName: "AlgebraA",
    outputName: "AlgebraB"
  });
  const bToC = graphFunctionFixture({
    graphFunctionName: "algebra_b_to_c",
    graphName: "AlgebraBToC",
    inputName: "AlgebraB",
    outputName: "AlgebraC"
  });
  const direct = graphFunctionFixture({
    graphFunctionName: "algebra_direct",
    graphName: "AlgebraDirect",
    inputName: "AlgebraDirectInput",
    outputName: "AlgebraDirectOutput"
  });
  const vectorBoundary = vectorBoundaryNode("AlgebraCandidateVector");
  const source = node("AlgebraSource");
  const target = node("AlgebraTarget");
  const outer = edge([source], target, {
    name: "algebra_substitute_contract",
    id: "vector-algebra-substitute-contract"
  });
  const inner = edge([source], target, {
    name: "algebra_substitute_inner"
  });
  const contractVector = outer.vectors[0];
  assert.notEqual(contractVector, undefined);
  const substituted = substitute(outer, contractVector.id, inner);
  const vectorIdentity = identity([vectorBoundary]);
  const graphFunctions = [
    compose(aToB, bToC),
    identity([node("AlgebraIdentityNode")]),
    recurse(direct, evaluator("algebra_recursion_done"), {
      binding: "binding://t150/algebra/foldback",
      mode: "rebind",
      requiresParentEvaluation: true
    }),
    fan_out(vectorIdentity, vectorBoundary),
    fan_in(vectorIdentity, vectorBoundary),
    gate(direct, rule("algebra_gate"), [evaluator("algebra_gate_eval")]),
    promote(node("AlgebraPromoteSource"), node("AlgebraPromoteTarget"))
  ];
  const module = constructModule({
    name: "t150-program-conformance-algebra",
    graphs: [substituted],
    graphFunctions,
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  const report = typecheckGtlProgram(
    compliantInput({
      catalogGraphFunctionRefs: graphFunctions.map(
        (graphFunction) => graphFunction.name
      ),
      modules: [module]
    })
  );

  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  for (const featureKind of [
    "graph_algebra_compose",
    "graph_algebra_substitute",
    "graph_algebra_recurse",
    "graph_algebra_fan_out",
    "graph_algebra_fan_in",
    "graph_algebra_gate",
    "graph_algebra_promote",
    "graph_algebra_identity"
  ]) {
    assert.match(messages, new RegExp(`${featureKind} marked not_used`, "u"));
  }
});

test("T-152 GTL program typechecker rejects lossy target-carrier contract rows", () => {
  const { graphFunction, graph, vector } = graphFunctionIdentity();
  const report = typecheckGtlProgram(
    compliantInput({
      targetCarrierContracts: [
        {
          edgeRef: graphFunction.name,
          graphVectorRef: vector.name,
          graphFunctionId: graphFunction.id,
          graphId: graph.id,
          graphVectorId: vector.id,
          targetAssetType: vector.target.name,
          targetCarrierContractRef:
            "gtl://target-carrier-contract/t150/prompt-invocation"
        }
      ]
    })
  );

  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert.match(messages, /targetCarrierContracts\[0\]\.targetCarrierContractDigest/u);
  assert.match(messages, /targetCarrierContracts\[0\]\.requiredFieldRefs/u);
  assert.match(messages, /targetCarrierContracts\[0\]\.literalDomainRefs/u);
  assert.match(messages, /targetCarrierContracts\[0\]\.closurePreconditionRef/u);
});

test("T-150 GTL program typechecker catches graph row, prompt, plugin, and identity drift", () => {
  const { graphFunction, graph, vector } = graphFunctionIdentity();
  const badPlugin = {
    ...pluginContract(),
    mayEmitRuntimeEvents: true
  };
  const report = typecheckGtlProgram(
    compliantInput({
      targetCarrierContracts: [
        targetCarrierContractRow({
          edgeRef: "construct_prompt_invocation",
          graphVectorRef: "wrong_vector",
          graphFunction,
          graph,
          vector,
          targetAssetType: "WrongTarget",
          targetCarrierContractRef: "local://target-carrier"
        })
      ],
      promptAssets: [
        {
          surfaceRef: "prompt://t150/bad",
          assetSurface: assetSurface({
            renderedViewDigestPolicyRef: null
          }),
          renderedViewDigest: "not-a-digest",
          currentAbgFoldRefs: [
            "package:@abiogenesis/typescript-tenant@3.9.0-rc.13#old/fold"
          ]
        }
      ],
      pluginContracts: [badPlugin],
      sourceIdentitySurfaces: [
        {
          surfaceRef: "workspace://code/stale.ts",
          text: "const policy = 'abg-3.7'; const stage = 'rc13';"
        }
      ]
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/target-carrier/vector-ref-match"));
  assert(ruleRefs.has("abg://gtl-program/target-carrier/target-asset-match"));
  assert(ruleRefs.has("abg://gtl-program/target-carrier/gtl-ref"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/rendered-view-digest-policy"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/rendered-view-digest"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/current-abg-fold-ref"));
  assert(ruleRefs.has("abg://gtl-program/plugin-contract/admission"));
  assert(ruleRefs.has("abg://gtl-program/source-identity/current-abg-version"));
  assert(ruleRefs.has("abg://gtl-program/source-identity/stale-stage-label"));
});

test("T-204 GTL program typechecker rejects declared source-authority regressions", () => {
  const policies = [
    {
      policyRef:
        "abg://gtl-program/source-authority/no-archive-status-as-acceptance",
      sourceSurfaceRefs: ["workspace://operator/design_depth_register.ts"],
      forbiddenTokens: ["sdlc_edge_closure_decision.json", "postflight.json"],
      forbiddenMatch: "any",
      message:
        "design-depth predecessor acceptance must not be derived from archive status files"
    },
    {
      policyRef:
        "abg://gtl-program/source-authority/no-unfiltered-current-postflight-downgrade",
      sourceSurfaceRefs: ["workspace://operator/installed_operator.ts"],
      forbiddenTokens: [
        "activePostflightBlockingReasonCarriers(input.currentPostflight)",
        "currentPostflightBlockers"
      ],
      forbiddenMatch: "all",
      requiredMitigationTokens: [
        'lawfulReentryPoint !== "same_edge_retry"',
        'lawfulReentryPoint !== "repair_worker_output"',
        'lawfulReentryPoint !== "escalate_to_fp"'
      ],
      message:
        "current-postflight review-grade shortcut must not downgrade retryable reentry to triage"
    },
    {
      policyRef:
        "abg://gtl-program/source-authority/read-model-does-not-author-runtime-truth",
      sourceSurfaceRefs: ["workspace://workspace_api/entry.ts"],
      forbiddenTokens: [
        "sdlc_edge_closure_decision.json",
        "writeSdlcSystemArtifact"
      ],
      forbiddenMatch: "all",
      message:
        "workspace gaps read model must not author closure or artifact truth"
    },
    {
      policyRef:
        "abg://gtl-program/source-authority/read-model-does-not-invoke-runtime-control",
      sourceSurfaceRefs: ["workspace://workspace_api/entry.ts"],
      forbiddenTokens: ["postflight.json", "publicStartOnce"],
      forbiddenMatch: "all",
      message:
        "workspace gaps read model must not invoke traversal or start control"
    },
    {
      policyRef:
        "abg://gtl-program/source-authority/product-materialization-lineage-caches-requirement-markers",
      sourceSurfaceRefs: ["workspace://operator/postflight_checks.ts"],
      forbiddenTokens: [
        "contentCarriesRequirementObligation({",
        "REQUIREMENT_MARKER_EXPRESSION"
      ],
      forbiddenMatch: "all",
      requiredMitigationTokens: [
        "normalizedRequirementMarkersForContent",
        "contentCarriesRequirementObligationWithMarkers"
      ],
      message:
        "product-materialization lineage checks must not rescan requirement markers for every obligation/file pairing"
    }
  ];
  const report = typecheckGtlProgram(
    compliantInput({
      sourceIdentitySurfaces: [
        {
          surfaceRef: "workspace://operator/design_depth_register.ts",
          text: [
            "function predecessorDesignRegisterArchiveIsAccepted() {",
            "  return readFileSync('sdlc_edge_closure_decision.json', 'utf8');",
            "}"
          ].join("\n")
        },
        {
          surfaceRef: "workspace://operator/installed_operator.ts",
          text: [
            "const currentPostflightBlockers =",
            "  activePostflightBlockingReasonCarriers(input.currentPostflight);",
            "if (currentPostflightBlockers.length > 0) {",
            "  return 'triage_gap';",
            "}"
          ].join("\n")
        },
        {
          surfaceRef: "workspace://workspace_api/entry.ts",
          text: [
            "const closure = 'sdlc_edge_closure_decision.json';",
            "const postflight = 'postflight.json';",
            "writeSdlcSystemArtifact({ relativePath: closure });",
            "publicStartOnce({ target: postflight });"
          ].join("\n")
        },
        {
          surfaceRef: "workspace://operator/postflight_checks.ts",
          text: [
            "function evaluateMaterializedProductFiles() {",
            "  contentCarriesRequirementObligation({ content, obligationId, displayId });",
            "  content.match(REQUIREMENT_MARKER_EXPRESSION);",
            "}"
          ].join("\n")
        }
      ],
      sourceAuthorityPolicies: policies
    })
  );
  const ruleRefs = issueRuleRefs(report);

  assert.equal(report.passed, false);
  assert(
    ruleRefs.has(
      "abg://gtl-program/source-authority/no-archive-status-as-acceptance"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/source-authority/no-unfiltered-current-postflight-downgrade"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/source-authority/read-model-does-not-author-runtime-truth"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/source-authority/read-model-does-not-invoke-runtime-control"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/source-authority/product-materialization-lineage-caches-requirement-markers"
    )
  );

  const mitigated = typecheckGtlProgram(
    compliantInput({
      sourceIdentitySurfaces: [
        {
          surfaceRef: "workspace://operator/installed_operator.ts",
          text: [
            "function currentPostflightBlocksReviewGradeEvaluator(reason) {",
            '  return reason.lawfulReentryPoint !== "same_edge_retry" &&',
            '    reason.lawfulReentryPoint !== "repair_worker_output" &&',
            '    reason.lawfulReentryPoint !== "escalate_to_fp";',
            "}",
            "const currentPostflightBlockers =",
            "  activePostflightBlockingReasonCarriers(input.currentPostflight).filter(currentPostflightBlocksReviewGradeEvaluator);"
          ].join("\n")
        }
      ],
      sourceAuthorityPolicies: [policies[1]]
    })
  );

  assert.equal(
    issueRuleRefs(mitigated).has(
      "abg://gtl-program/source-authority/no-unfiltered-current-postflight-downgrade"
    ),
    false
  );

  const markerScanMitigated = typecheckGtlProgram(
    compliantInput({
      sourceIdentitySurfaces: [
        {
          surfaceRef: "workspace://operator/postflight_checks.ts",
          text: [
            "function normalizedRequirementMarkersForContent(content) {",
            "  return content.match(REQUIREMENT_MARKER_EXPRESSION);",
            "}",
            "function evaluateMaterializedProductFiles() {",
            "  contentCarriesRequirementObligationWithMarkers({ content, normalizedMarkers, obligationId, displayId });",
            "}"
          ].join("\n")
        }
      ],
      sourceAuthorityPolicies: [policies[4]]
    })
  );

  assert.equal(
    issueRuleRefs(markerScanMitigated).has(
      "abg://gtl-program/source-authority/product-materialization-lineage-caches-requirement-markers"
    ),
    false
  );
});

test("T-204 GTL program typechecker rejects duplicate or unresolved source-authority rows", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      sourceIdentitySurfaces: [
        {
          surfaceRef: "workspace://operator/installed_operator.ts",
          text: "const currentPostflightBlockers = [];"
        }
      ],
      sourceAuthorityPolicies: [
        {
          policyRef:
            "abg://gtl-program/source-authority/no-unresolved-policy",
          sourceSurfaceRefs: ["workspace://operator/missing.ts"],
          sourceSurfaceRefPrefixes: ["workspace://operator/missing/"],
          forbiddenTokens: ["currentPostflightBlockers"],
          forbiddenMatch: "all",
          message: "unresolved policy should fail closed"
        },
        {
          policyRef:
            "abg://gtl-program/source-authority/no-unresolved-policy",
          sourceSurfaceRefs: ["workspace://operator/installed_operator.ts"],
          sourceSurfaceRefPrefixes: [],
          forbiddenTokens: ["does_not_match"],
          forbiddenMatch: "all",
          message: "duplicate policy refs are ambiguous authority"
        }
      ]
    })
  );
  const ruleRefs = issueRuleRefs(report);

  assert.equal(report.passed, false);
  assert(
    ruleRefs.has("abg://gtl-program/source-authority-policy/unique-ref")
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/source-authority-policy/source-surface-ref-resolves"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/source-authority-policy/source-surface-prefix-resolves"
    )
  );
});

test("T-204 GTL program typechecker admits fail-closed semantic F_P review gates", () => {
  const validGate = {
    gateRef: "semantic-review-gate://t150/prompt-materialization/fp",
    subjectRef: "workspace://t150/program-conformance-tool",
    deterministicReportDigest: "sha256:semantic-prompt-package",
    reviewResultKind: "sdlc_semantic_compiler_fp_review_result",
    reviewVersion: "ts-semantic-compiler-fp-review-result-v1",
    status: "passed",
    findingCount: 0,
    reviewerProfileRef: "reviewer-profile://t150/fp-code-review",
    reviewedAt: "2026-06-23T00:00:00.000Z",
    evidenceRefs: ["test://t150/semantic-review"]
  };

  assert.equal(
    typecheckGtlProgram(
      compliantInput({ semanticReviewGates: [validGate] })
    ).passed,
    true
  );

  const report = typecheckGtlProgram(
    compliantInput({
      semanticReviewGates: [
        validGate,
        {
          ...validGate,
          gateRef: validGate.gateRef,
          subjectRef: "workspace://t150/other",
          deterministicReportDigest: "not-a-digest",
          reviewResultKind: "unadmitted_review_result",
          status: "failed",
          findingCount: 2
        }
      ]
    })
  );
  const ruleRefs = issueRuleRefs(report);

  assert.equal(report.passed, false);
  assert(
    ruleRefs.has("abg://gtl-program/semantic-review-gate/unique-ref")
  );
  assert(
    ruleRefs.has("abg://gtl-program/semantic-review-gate/subject-ref")
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/semantic-review-gate/deterministic-report-digest"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/semantic-review-gate/admitted-result-kind"
    )
  );
  assert(
    ruleRefs.has("abg://gtl-program/semantic-review-gate/status-passed")
  );
  assert(
    ruleRefs.has("abg://gtl-program/semantic-review-gate/no-open-findings")
  );
});

test("T-152 GTL program typechecker rejects stale ABG URI and package identity forms", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      sourceIdentitySurfaces: [
        {
          surfaceRef: "workspace://code/stale-uri-identity.ts",
          text: [
            "const frontier = 'runtime://abg/3.8/saga-frontier';",
            "const live = 'runtime://abg-3-6-live';",
            "const packageRef = 'package:@abiogenesis/typescript-tenant@3.9.0-rc.13#old/fold';",
            "const graphRef = 'abg://3.7/policy-carrier';"
          ].join("\n")
        }
      ]
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/source-identity/current-abg-version"));
  assert(ruleRefs.has("abg://gtl-program/source-identity/current-abi-package-version"));
  assert.match(messages, /runtime:\/\/abg\/3\.8\/saga-frontier/u);
  assert.match(messages, /runtime:\/\/abg-3-6-live/u);
  assert.match(messages, /@abiogenesis\/typescript-tenant@3\.9\.0-rc\.13/u);
  assert.match(messages, /abg:\/\/3\.7\/policy-carrier/u);
});

test("T-150 GTL program typechecker rejects empty inventory without expected coverage", () => {
  const report = typecheckGtlProgram({
    subjectRef: "workspace://t150/empty",
    abiPackageVersion: ABG_VERSION
  });

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert.equal(report.coverage.publishedGraphFunctionCount, 0);
  assert(ruleRefs.has("abg://gtl-program/coverage/expected-coverage-required"));
});

test("T-150 GTL program typechecker rejects partial expected coverage", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      expectedCoverage: { catalogGraphFunctionCount: 0 }
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/coverage/expected-count-required"));
  assert(ruleRefs.has("abg://gtl-program/coverage/expected-count-nonzero"));
});

test("T-150 GTL program typechecker rejects invalid ABI package versions", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      abiPackageVersion: ""
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/version/exact-package-version"));
});

test("T-150 GTL program typechecker rejects unsatisfied graph dependencies", () => {
  const graphFunction = unsatisfiedDependencyGraphFunction();
  const graph = materializeGraphFunction(graphFunction);
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);
  const report = typecheckGtlProgram(
    compliantInput({
      catalogGraphFunctionRefs: ["construct_prompt_from_missing_dependency"],
      modules: [moduleFixture(graphFunction)],
      targetCarrierContracts: [
        targetCarrierContractRow({
          edgeRef: "construct_prompt_from_missing_dependency",
          graphVectorRef: "construct_prompt_from_missing_dependency",
          graphFunction,
          graph,
          vector,
          targetAssetType: "PromptInvocationAsset",
          targetCarrierContractRef: "gtl://target-carrier-contract/t150/prompt-invocation"
        })
      ],
      edgeClosureContracts: [
        {
          edgeRef: "construct_prompt_from_missing_dependency",
          graphFunctionId: graphFunction.id,
          graphId: graph.id,
          graphVectorId: vector.id,
          targetAssetType: "PromptInvocationAsset"
        }
      ],
      overlays: [
        {
          overlayRef: "overlay://t150/default",
          graphFunctionRefs: ["construct_prompt_from_missing_dependency"],
          graphVectorRefs: ["construct_prompt_from_missing_dependency"],
          publicStartTargets: ["construct_prompt_from_missing_dependency"],
          defaultStartTarget: "construct_prompt_from_missing_dependency"
        }
      ],
      publicStartTargets: [
        {
          name: "prompt",
          graphFunctionRef: "construct_prompt_from_missing_dependency",
          overlayRefs: ["overlay://t150/default"],
          defaultForOverlayRefs: ["overlay://t150/default"]
        }
      ]
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/graph-vector/source-node-declared"));
  assert(ruleRefs.has("abg://gtl-program/graph-vector/source-derivable"));
  assert(ruleRefs.has("abg://gtl-program/graph/output-derivable"));
});

test("T-150 GTL program typechecker rejects duplicate target-carrier truth for one vector identity", () => {
  const base = compliantInput({
    expectedCoverage: expectedCoverage({
      targetCarrierContractCount: 2
    })
  });
  const firstTargetCarrier = base.targetCarrierContracts[0];
  assert.notEqual(firstTargetCarrier, undefined);
  const report = typecheckGtlProgram({
    ...base,
    targetCarrierContracts: [
      firstTargetCarrier,
      {
        ...firstTargetCarrier,
        targetCarrierContractRef:
          "gtl://target-carrier-contract/t150/prompt-invocation/duplicate"
      }
    ]
  });

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/target-carrier/unique-vector-row"));
});

test("T-152 GTL program typechecker rejects duplicate edge-closure truth for one vector identity", () => {
  const base = compliantInput({
    expectedCoverage: expectedCoverage({
      edgeClosureContractCount: 2
    })
  });
  const firstEdgeClosure = base.edgeClosureContracts[0];
  assert.notEqual(firstEdgeClosure, undefined);
  const report = typecheckGtlProgram({
    ...base,
    edgeClosureContracts: [
      firstEdgeClosure,
      {
        ...firstEdgeClosure,
        edgeRef: `${firstEdgeClosure.edgeRef}:duplicate`
      }
    ]
  });

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/edge-closure/unique-vector-row"));
});

test("T-150 GTL program typechecker uses opaque vector identity, not display labels", () => {
  const first = graphFunctionIdentity({
    graphFunctionName: "construct_prompt_one",
    graphName: "PromptGraphOne",
    outputName: "PromptInvocationAssetOne",
    vectorName: "shared_prompt_vector"
  });
  const second = graphFunctionIdentity({
    graphFunctionName: "construct_prompt_two",
    graphName: "PromptGraphTwo",
    outputName: "PromptInvocationAssetTwo",
    vectorName: "shared_prompt_vector"
  });
  const firstModule = moduleFixture(first.graphFunction);
  const secondModule = moduleFixture(second.graphFunction);
  const featureRows = mergeFeatureRows(
    completeFeatureRows({
      graphFunction: first.graphFunction,
      graph: first.graph,
      vector: first.vector,
      module: firstModule
    }),
    completeFeatureRows({
      graphFunction: second.graphFunction,
      graph: second.graph,
      vector: second.vector,
      module: secondModule
    })
  );
  const targetCarrierContracts = [
    targetCarrierContractRow({
      edgeRef: first.graphFunction.name,
      graphVectorRef: first.vector.name,
      graphFunction: first.graphFunction,
      graph: first.graph,
      vector: first.vector,
      targetAssetType: first.vector.target.name,
      targetCarrierContractRef:
        "gtl://target-carrier-contract/t150/prompt-invocation/one"
    }),
    targetCarrierContractRow({
      edgeRef: second.graphFunction.name,
      graphVectorRef: second.vector.name,
      graphFunction: second.graphFunction,
      graph: second.graph,
      vector: second.vector,
      targetAssetType: second.vector.target.name,
      targetCarrierContractRef:
        "gtl://target-carrier-contract/t150/prompt-invocation/two"
    })
  ];
  const report = typecheckGtlProgram(
    compliantInput({
      expectedCoverage: expectedCoverage({
        catalogGraphFunctionCount: 2,
        publishedGraphFunctionCount: 2,
        graphVectorCount: 2,
        targetCarrierContractCount: 2,
        edgeClosureContractCount: 2
      }),
      catalogGraphFunctionRefs: [
        first.graphFunction.name,
        second.graphFunction.name
      ],
      modules: [firstModule, secondModule],
      targetCarrierContracts,
      edgeClosureContracts: [
        {
          edgeRef: first.graphFunction.name,
          graphFunctionId: first.graphFunction.id,
          graphId: first.graph.id,
          graphVectorId: first.vector.id,
          targetAssetType: first.vector.target.name
        },
        {
          edgeRef: second.graphFunction.name,
          graphFunctionId: second.graphFunction.id,
          graphId: second.graph.id,
          graphVectorId: second.vector.id,
          targetAssetType: second.vector.target.name
        }
      ],
      traversalBindConservation: traversalBindConservationRows({
        graphFunction: first.graphFunction,
        graph: first.graph,
        vectors: [first.vector],
        targetCarrierContracts: [targetCarrierContracts[0]]
      }).concat(
        traversalBindConservationRows({
          graphFunction: second.graphFunction,
          graph: second.graph,
          vectors: [second.vector],
          targetCarrierContracts: [targetCarrierContracts[1]]
        })
      ),
      overlays: [
        {
          overlayRef: "overlay://t150/default",
          graphFunctionRefs: [
            first.graphFunction.name,
            second.graphFunction.name
          ],
          graphVectorRefs: ["shared_prompt_vector"],
          publicStartTargets: [first.graphFunction.name],
          defaultStartTarget: first.graphFunction.name
        }
      ],
      publicStartTargets: [
        {
          name: "prompt",
          graphFunctionRef: first.graphFunction.name,
          overlayRefs: ["overlay://t150/default"],
          defaultForOverlayRefs: ["overlay://t150/default"]
        }
      ],
      ...featureRows
    })
  );

  assert.equal(report.passed, true, formatGtlProgramConformanceIssues(report.issues));
  assert.equal(report.coverage.graphVectorCount, 2);
});

test("T-150 GTL program typechecker returns typed issues for malformed raw input", () => {
  const report = typecheckGtlProgram({
    subjectRef: "workspace://t150/malformed",
    abiPackageVersion: ABG_VERSION,
    expectedCoverage: expectedCoverage(),
    graphFunctions: {}
  });

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/input/array-field"));
});

test("T-150 GTL program typechecker rejects current ABG engine authority flags on plugin rows", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      pluginContracts: [
        {
          ...pluginContract(),
          mayWriteLedgers: true
        },
        {
          ...pluginContract({ ref: "plugin://t150/evaluate" }),
          maySelectTraversal: false
        }
      ],
      expectedCoverage: expectedCoverage({
        pluginContractCount: 2
      })
    })
  );

  const messages = report.issues.map((entry) => entry.message).join("\n");
  assert.equal(report.passed, false);
  assert.match(messages, /mayWriteLedgers/u);
  assert.match(messages, /maySelectTraversal/u);
});

test("T-158 GTL program typechecker rejects malformed plugin result interfaces", () => {
  const base = compliantInput();
  const resultInterface = base.pluginResultInterfaces[0];
  assert.notEqual(resultInterface, undefined);

  const report = typecheckGtlProgram(
    compliantInput({
      pluginResultInterfaces: [
        {
          ...resultInterface,
          resultInterfaceRef: "result-interface://t158/malformed",
          stageRole: "evaluate",
          computeMeans: "F_D",
          resultCarrierKind: "WrongCarrier",
          outputCarrierRefs: ["WrongCarrier"],
          requiredIdentityFieldRefs: ["compositionRef"],
          selectorAuthorityRefs: [
            "file://tmp/fp_evaluate_result.json"
          ]
        }
      ]
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(
    ruleRefs.has("abg://gtl-program/plugin-result-interface/stage-role")
  );
  assert(
    ruleRefs.has("abg://gtl-program/plugin-result-interface/compute-means")
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/plugin-result-interface/output-carrier-covers-stage"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/plugin-result-interface/output-carrier-stage-member"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/plugin-result-interface/required-identity-field"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/plugin-result-interface/no-local-file-selector"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/plugin-result-interface/stage-binding-required"
    )
  );
});

test("T-158 GTL program typechecker rejects ambiguous plugin result interfaces", () => {
  const base = compliantInput();
  const resultInterface = base.pluginResultInterfaces[0];
  assert.notEqual(resultInterface, undefined);

  const report = typecheckGtlProgram(
    compliantInput({
      pluginResultInterfaces: [
        resultInterface,
        {
          ...resultInterface,
          resultInterfaceRef:
            "result-interface://t158/ambiguous-same-output",
          producedCarrierRefs: [
            resultInterface.producedCarrierRefs[0] ??
              "carrier://t158/ambiguous"
          ]
        }
      ]
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(
    ruleRefs.has(
      "abg://gtl-program/plugin-result-interface/unique-runtime-selector"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/plugin-result-interface/unique-produced-carriers"
    )
  );
});

test("T-158 GTL program typechecker publishes admitted plugin result interface catalog", () => {
  const report = typecheckGtlProgram(compliantInput());

  assert.equal(report.passed, true);
  assert.equal(
    report.pluginResultInterfaceCatalog.kind,
    "admitted_plugin_result_interface_catalog"
  );
  assert.ok(report.pluginResultInterfaceCatalog.interfaces.length > 0);
  assert.match(
    report.pluginResultInterfaceCatalog.interfaces[0].resultInterfaceContractDigest,
    /^sha256:/u
  );
});

test("T-150 GTL program typechecker rejects partial prompt asset rows", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      promptAssets: [
        {
          surfaceRef: "prompt://t150/partial",
          assetSurface: assetSurface({
            outputContractRefs: [],
            constructorRefs: [],
            rendererRefs: [],
            renderedViewDigestPolicyRef: null,
            authoritySlots: [],
            proofObligationRefs: []
          })
        }
      ]
    })
  );

  const ruleRefs = new Set(report.issues.map((entry) => entry.ruleRef));
  assert.equal(report.passed, false);
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/renderer-ref"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/rendered-view-digest-policy"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/constructor-ref"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/proof-obligation"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/output-contract"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/authority-slot"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/gtl-node"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/rendered-view-digest"));
  assert(ruleRefs.has("abg://gtl-program/prompt-asset/evidence-ref"));
});

test("T-150 GTL program typechecker report identity is bound to audited inventory", () => {
  const first = typecheckGtlProgram(compliantInput());
  const second = typecheckGtlProgram(
    compliantInput(
      {},
      {
        graphFunctionName: "construct_alternate_prompt_invocation",
        graphName: "AlternatePromptConstructionGraph",
        outputName: "AlternatePromptInvocationAsset"
      }
    )
  );
  const third = typecheckGtlProgram(
    compliantInput({
      featureCoverageManifest: featureCoverageManifest({
        manifestRef: "feature-coverage://t150/alternate",
        dispositions: {
          graph_algebra_same_object: "present"
        }
      })
    })
  );

  assert.equal(first.passed, true, formatGtlProgramConformanceIssues(first.issues));
  assert.equal(second.passed, true, formatGtlProgramConformanceIssues(second.issues));
  assert.equal(third.passed, true, formatGtlProgramConformanceIssues(third.issues));
  assert.notEqual(first.inventoryDigest, second.inventoryDigest);
  assert.notEqual(first.reportRef, second.reportRef);
  assert.notEqual(first.inventoryDigests.featureCoverageManifest, third.inventoryDigests.featureCoverageManifest);
  assert.notEqual(first.reportRef, third.reportRef);
});

test("T-159 GTL program typechecker exports traversal-unit report types in public declarations", async () => {
  const contractDeclarationSource = await readFile(
    "build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.d.ts",
    "utf8"
  );
  const contractBarrelSource = await readFile(
    "build/semantic/code/src/abg/m03/contracts/index.d.ts",
    "utf8"
  );

  assert.match(
    contractDeclarationSource,
    /GtlProgramTraversalUnitProjectionRow/u
  );
  assert.match(
    contractDeclarationSource,
    /GtlProgramTraversalEntryUnitProjectionRow/u
  );
  assert.match(
    contractDeclarationSource,
    /GtlProgramTraversalUnitProjection/u
  );
  assert.match(
    contractDeclarationSource,
    /GtlProgramTraversalBindConservationRow/u
  );
  assert.match(contractDeclarationSource, /GtlProgramObligationDeltaFamily/u);
  assert.match(contractDeclarationSource, /targetCarrierContractRefs/u);
  assert.match(contractDeclarationSource, /conservationBasisRefs/u);
  assert.match(contractDeclarationSource, /allowedObligationDeltaFamilies/u);
  assert.match(contractDeclarationSource, /edgeClosureRefs/u);
  assert.match(
    contractBarrelSource,
    /GtlProgramTraversalUnitProjectionRow/u
  );
  assert.match(
    contractBarrelSource,
    /GtlProgramTraversalBindConservationRow/u
  );
});

test("T-159 GTL program typechecker does not publish a flat traversal closure enum", async () => {
  const contractDeclarationSource = await readFile(
    "build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.d.ts",
    "utf8"
  );
  const contractBarrelSource = await readFile(
    "build/semantic/code/src/abg/m03/contracts/index.d.ts",
    "utf8"
  );
  const allowedTraversalCatalogSource = await readFile(
    "build/semantic/code/src/abg/m03/contracts/allowed_consequence_traversal_catalog.d.ts",
    "utf8"
  );
  const constructionActionKindSource = await readFile(
    "build/semantic/code/src/abg/m03/contracts/construction_action_kinds.d.ts",
    "utf8"
  );
  const carrierSource = await readFile(
    "build/semantic/code/src/abg/m03/contracts/carriers.d.ts",
    "utf8"
  );
  const continuationTransitionSource = await readFile(
    "build/semantic/code/src/abg/m03/contracts/continuation_transition.d.ts",
    "utf8"
  );
  const publicTraversalSources = [
    contractDeclarationSource,
    contractBarrelSource
  ].join("\n");

  assert.doesNotMatch(publicTraversalSources, /\bClosureState\b/u);
  assert.doesNotMatch(publicTraversalSources, /\bTraversalClosureState\b/u);
  assert.doesNotMatch(publicTraversalSources, /\bCLOSURE_STATE_VALUES\b/u);
  assert.match(
    allowedTraversalCatalogSource,
    /AllowedConsequenceTraversalFamily/u
  );
  assert.match(constructionActionKindSource, /ConstructionActionKind/u);
  assert.match(carrierSource, /TerminalKind/u);
  assert.match(
    continuationTransitionSource,
    /RuntimeContinuationTransitionDisposition/u
  );
});

test("T-159 GTL program typechecker reports traversal-unit issues as typed rows", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      expectedCoverage: expectedCoverage({
        targetCarrierContractCount: 0
      }),
      targetCarrierContracts: []
    })
  );
  const issue = report.issues.find(
    (entry) =>
      entry.ruleRef ===
      "abg://gtl-program/traversal-unit/target-carrier-required"
  );

  assert.equal(report.passed, false);
  assert.notEqual(issue, undefined);
  assert.equal(issue?.surfaceKind, "traversal_unit");
  assert.match(
    issue?.surfaceRef ?? "",
    /^abg:\/\/gtl-program\/traversal-unit\/sha256:/u
  );
  assert.equal(report.traversalUnitProjection.units.length, 1);
});

test("T-159 GTL program typechecker rejects traversal units without bind conservation", () => {
  const report = typecheckGtlProgram(
    compliantInput({
      traversalBindConservation: []
    })
  );
  const ruleRefs = issueRuleRefs(report);

  assert.equal(report.passed, false);
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/bind-conservation-required"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/bind-conservation-intent-lineage"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/bind-conservation-carried-obligation"
    )
  );
});

test("T-159 GTL program typechecker rejects incomplete bind conservation coverage", () => {
  const base = compliantInput();
  const targetCarrier = base.targetCarrierContracts[0];
  const graphFunction = base.modules[0]?.graphFunctions[0];
  assert.notEqual(targetCarrier, undefined);
  assert.notEqual(graphFunction, undefined);
  const graph = materializeGraphFunction(graphFunction);
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);
  const report = typecheckGtlProgram(
    compliantInput({
      traversalBindConservation: [
        traversalBindConservationRow({
          graphFunction,
          graph,
          vector,
          targetCarrier,
          targetCarrierBindingRefs: [],
          materializationBindingRefs: [],
          stagedAuthorityRefs: [],
          admissionStrengthRefs: [],
          allowedObligationDeltaFamilies: ["realized"]
        })
      ]
    })
  );
  const ruleRefs = issueRuleRefs(report);

  assert.equal(report.passed, false);
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/bind-conservation-target-carrier-binding"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/bind-conservation-materialization-binding"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/bind-conservation-target-carrier-coverage"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/bind-conservation-materialization-coverage"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/bind-conservation-stage-coverage"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/bind-conservation-admission-strength"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/obligation-delta-disposition-coverage"
    )
  );
});

test("T-159 GTL program typechecker rejects divergent bind admission strength", () => {
  const base = compliantInput();
  const targetCarrier = base.targetCarrierContracts[0];
  const graphFunction = base.modules[0]?.graphFunctions[0];
  assert.notEqual(targetCarrier, undefined);
  assert.notEqual(graphFunction, undefined);
  const graph = materializeGraphFunction(graphFunction);
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);
  const report = typecheckGtlProgram(
    compliantInput({
      traversalBindConservation: [
        traversalBindConservationRow({
          graphFunction,
          graph,
          vector,
          targetCarrier,
          admissionStrengthRefs: [
            "admission-strength://abg/stage-pressure-observed"
          ]
        })
      ]
    })
  );
  const ruleRefs = issueRuleRefs(report);

  assert.equal(report.passed, false);
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-unit/bind-conservation-admission-strength"
    )
  );
  assert.match(
    formatGtlProgramConformanceIssues(report.issues),
    /materialization-stage-compatible/u
  );
});

test("T-159 GTL program typechecker rejects unattached bind conservation inventory rows", () => {
  const base = multiVectorCompliantInput();
  const first = base.traversalBindConservation[0];
  const second = base.traversalBindConservation[1];
  assert.notEqual(first, undefined);
  assert.notEqual(second, undefined);
  const report = typecheckGtlProgram({
    ...base,
    traversalBindConservation: [
      ...base.traversalBindConservation,
      {
        ...first,
        conservationRef: "bind-conservation://t159/dangling",
        graphVectorRef: "missing_pipeline_vector",
        graphVectorId: "graph-vector://t159/missing"
      },
      {
        ...first,
        conservationRef: "bind-conservation://t159/ref-mismatch",
        graphVectorRef: "wrong_pipeline_vector_name"
      },
      {
        ...second,
        conservationRef: first.conservationRef
      }
    ]
  });
  const ruleRefs = issueRuleRefs(report);

  assert.equal(report.passed, false);
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-bind-conservation/no-orphan-row"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-bind-conservation/graph-vector-ref-match"
    )
  );
  assert(
    ruleRefs.has(
      "abg://gtl-program/traversal-bind-conservation/unique-conservation-ref"
    )
  );
});

test("T-159 GTL program CLI emits traversal-unit issue projection for invalid public start", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "t159-gtl-program-"));
  const inputPath = path.join(workspace, "invalid-public-start.json");
  await writeFile(
    inputPath,
    JSON.stringify(
      compliantInput({
        publicStartTargets: [
          {
            name: "missing",
            graphFunctionRef: "missing_graph_function",
            overlayRefs: ["overlay://t150/default"],
            defaultForOverlayRefs: ["overlay://t150/default"]
          }
        ]
      })
    ),
    "utf8"
  );

  let stdout = "";
  let stderr = "";
  const exitCode = await runAbiogenesisCli(
    ["typecheck-gtl-program", "--input", inputPath],
    {
      cwd: () => workspace,
      stdout: (text) => {
        stdout += text;
      },
      stderr: (text) => {
        stderr += text;
      }
    }
  );
  const payload = JSON.parse(stdout);
  const ruleRefs = new Set(
    payload.report.issues.map((entry) => entry.ruleRef)
  );

  assert.equal(exitCode, 1, stderr);
  assert.equal(payload.status, "failed");
  assert.equal(
    payload.report.traversalUnitProjection.kind,
    "gtl_program_traversal_unit_projection"
  );
  assert(
    ruleRefs.has("abg://gtl-program/traversal-unit/public-start-entry")
  );
});

test("T-150 GTL program CLI wrapper delegates to the typechecker function", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "t150-gtl-program-"));
  const validInput = path.join(workspace, "valid-program.json");
  const invalidInput = path.join(workspace, "invalid-program.json");
  await writeFile(validInput, JSON.stringify(compliantInput()), "utf8");
  await writeFile(
    invalidInput,
    JSON.stringify({
      subjectRef: "workspace://t150/empty",
      abiPackageVersion: ABG_VERSION
    }),
    "utf8"
  );

  let validStdout = "";
  let validStderr = "";
  const validExitCode = await runAbiogenesisCli(
    ["typecheck-gtl-program", "--input", validInput],
    {
      cwd: () => workspace,
      stdout: (text) => {
        validStdout += text;
      },
      stderr: (text) => {
        validStderr += text;
      }
    }
  );
  assert.equal(validExitCode, 0, validStderr);
  const validPayload = JSON.parse(validStdout);
  assert.equal(validPayload.command, "typecheck-gtl-program");
  assert.equal(validPayload.status, "passed");
  assert.equal(validPayload.report.passed, true);
  assert.equal(
    validPayload.report.traversalUnitProjection.kind,
    "gtl_program_traversal_unit_projection"
  );
  assert.equal(validPayload.report.traversalUnitProjection.units.length, 1);

  let invalidStdout = "";
  let invalidStderr = "";
  const invalidExitCode = await runAbiogenesisCli(
    ["typecheck-gtl-program", "--input", invalidInput],
    {
      cwd: () => workspace,
      stdout: (text) => {
        invalidStdout += text;
      },
      stderr: (text) => {
        invalidStderr += text;
      }
    }
  );
  assert.equal(invalidExitCode, 1, invalidStderr);
  const invalidPayload = JSON.parse(invalidStdout);
  const ruleRefs = new Set(
    invalidPayload.report.issues.map((entry) => entry.ruleRef)
  );
  assert.equal(invalidPayload.status, "failed");
  assert(ruleRefs.has("abg://gtl-program/coverage/expected-coverage-required"));
});
