// Validates: T-150
// Validates: REQ-L-GTL3-ASSET-SURFACE
// Validates: REQ-R-ABG3-INTERPRET

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
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
  const input = node(inputName);
  const output = node(outputName);
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
    declarations: emptySerializedAttrs(),
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
    declarations: emptySerializedAttrs(),
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

function runtimeReentryRouteRow(input) {
  const programRef = input.graphFunction.name;
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
    reentryTargetVectorIndex: 0,
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
  const programRef = graphFunction.name;
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
  const stageBindingRefs = [
    `stage-binding://t150/${programRef}/transform.C`,
    `stage-binding://t150/${programRef}/evaluate.C`,
    `stage-binding://t150/${programRef}/consequence.C`
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
        hostRef: vector.name,
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
        hostRef: vector.name,
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
        hostRef: vector.name,
        tagRefs: ruleEntry.tags,
        evidenceRefs: ["test://t150/rule"]
      }
    ],
    computeCompositions: [
      {
        compositionRef,
        compositionDigest,
        hostKind: "graph_vector",
        hostRef: vector.name,
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
    hookBoundaries: [
      {
        hookRef: `hook://t150/${programRef}/fp-dispatch`,
        hookKey: "abg.fp_consciousness",
        hostKind: "graph_vector",
        hostRef: vector.name,
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
        publicStartRef: "prompt",
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
        vector
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
  const promptSurface = assetSurface();
  const featureRows = completeFeatureRows({
    graphFunction,
    graph,
    vector,
    module
  });
  return {
    subjectRef: "workspace://t150/program-conformance-tool",
    abiPackageVersion: ABG_VERSION,
    expectedCoverage: expectedCoverage(),
    featureCoverageManifest: featureCoverageManifest(),
    catalogGraphFunctionRefs: [graphFunctionName],
    modules: [module],
    targetCarrierContracts: [
      targetCarrierContractRow({
        edgeRef: graphFunctionName,
        graphVectorRef: vectorName,
        graphFunction,
        graph,
        vector,
        targetAssetType: outputName,
        targetCarrierContractRef: "gtl://target-carrier-contract/t150/prompt-invocation"
      })
    ],
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
  assert.match(report.inventoryDigests.runtimeReentryRoutes, /^sha256:/u);
  assert.match(report.reportRef, /^abg:\/\/gtl-program-conformance-report\/sha256:/u);
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
      targetCarrierContracts: [
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
      ],
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
