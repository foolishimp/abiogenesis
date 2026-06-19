// Validates: T-181

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  designDepthFpEvaluatorContentRegisterPath,
  admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity,
  constructSdlcFpEvaluateResult,
  constructWorkerConstructionBrief,
  constructWorkerInvocationPackage,
  deriveWorkerHandoffManifest,
  deriveSdlcOperatorAssuranceGate,
  evaluateSdlcComputeStage,
  FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  promptForHandoff,
  typecheckCurrentSdlcGtlProgram,
  SDLC_FUNCTION_CATALOG,
  SDLC_OPERATOR_RUN_ARTIFACT_CATALOG,
  sha256Text,
  selectSdlcWorkCategoryGovernance,
  writeDesignDepthRegisterProjectionFromEvaluateContentRegister,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";
import {
  admitImplementationDesignRegisterCandidateForManifest,
  admitImplementationDesignRegisterForManifest,
  admitImplementationDesignRegisterForRuntimeEvaluation,
  designDepthFpEvaluatorRegisterPath
} from "../../build/semantic/code/src/operator/plugins/evaluate/design_depth_register.js";
import { readOperatorRunCarriers } from "../../build/semantic/code/src/analysis/carrier_loaders.js";

const PACKAGE_ROOT = process.cwd();
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "../..");

function readRepoFile(relativePath) {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

test("T-183 ticket is the admitted deletion-first implementation migration contract", () => {
  const ticket = readRepoFile(
    ".ai-workspace/tickets/completed/T-183-delete-fd-semantic-registers-and-restore-bare-admission.md"
  );

  assert.match(ticket, /ticket_category: implementation_migration/u);
  assert.match(ticket, /change_intent:/u);
  assert.match(ticket, /triaged_at: \d{4}-\d{2}-\d{2}/u);
  assert.match(ticket, /migration_strategy:/u);
  assert.match(ticket, /target_truth:/u);
  assert.match(ticket, /superseded_truth:/u);
  assert.match(ticket, /closure_law:/u);
  assert.match(ticket, /evaluation_criteria:/u);
  assert.match(ticket, /non_closure_conditions:/u);
  assert.match(ticket, /proof_surface:/u);
  assert.match(ticket, /## Design Module Method Refactor Ledger/u);
  assert.match(ticket, /single authoritative truth surface/u);
  assert.match(ticket, /R-010/u);
  assert.match(ticket, /R-030/u);
  assert.match(ticket, /R-040/u);
  assert.match(ticket, /no compatibility bridge for default live execution/u);
});

test("T-181 design module declares evaluator register IACS carrier truth", () => {
  const design = readRepoFile(
    "build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_STAGED_COMPUTE_BOUNDARY.md"
  );

  assert.match(design, /#### Design-Depth Evaluator Register Rule/u);
  assert.match(design, /SdlcDesignDepthRegister/u);
  assert.match(design, /design_depth_fp_evaluator_register\.json/u);
  assert.match(design, /SdlcEvaluatePluginAdapter/u);
  assert.match(design, /requireSourceFileTargets=true/u);
  assert.match(design, /System owner: ABG owns/u);
  assert.match(design, /Product owner: ODD_SDLC owns/u);
  assert.match(design, /Bridge: none in default live execution/u);
  assert.match(design, /do not synthesize semantic\s+design-depth truth for closure/u);
  assert.match(design, /not a final ledger write/u);
  assert.match(design, /not closure authority/u);
  assert.match(design, /flowchart TD/u);
  assert.match(design, /Source-text\s+guards may remain as drift detection/u);
});

test("T-181 common config carries one compressed governance doc per work category", () => {
  const categories = [
    "requirements_build",
    "design_build",
    "coding_build",
    "uat_test_case_build",
    "unit_test_build"
  ];
  for (const category of categories) {
    const doc = readRepoFile(
      `build_tenants/typescript/config/work-category-governance/${category}.md`
    );
    assert.match(doc, /Spec method constraints:/u);
    assert.match(doc, /Design module method constraints:/u);
    assert.match(doc, /Agentic work policy:/u);
    assert.match(doc, /one truth/u);
    assert.match(doc, /Stdout is work trace only/u);
    assert.match(doc, /IO cap: reads <=80 lines/u);
    assert.match(doc, /jq\/rg\/cat\/git diff\/status end `\| head -80`/u);
    assert.match(doc, /sed is inclusive: end-start\+1<=80/u);
    assert.match(doc, /`200,299p` invalid \(100\), use `200,279p`/u);
    assert.match(doc, /no bare jq\/rg\/cat/u);
    assert.match(doc, /targeted edits rather than whole-file replacement/u);
  }
  for (const entry of SDLC_FUNCTION_CATALOG) {
    assert.ok(
      categories.includes(entry.workCategoryGovernanceCategory),
      `${entry.name} has work-category governance`
    );
  }
  assert.deepEqual(
    selectSdlcWorkCategoryGovernance({
      edgeName: "derive_requirement_surface",
      targetAssetType: "requirement_surface"
    }),
    {
      kind: "sdlc_work_category_governance_selection",
      category: "requirements_build",
      configRef:
        "config://odd-sdlc/work-category-governance/requirements_build/v1",
      workerPath:
        "node_modules/@odd-sdlc/typescript-tenant/config/work-category-governance/requirements_build.md",
      selectionSource: "graph_function_catalog",
      edgeName: "derive_requirement_surface",
      targetAssetType: "requirement_surface"
    }
  );
  assert.equal(
    selectSdlcWorkCategoryGovernance({
      edgeName: "derive_component_code_surface",
      targetAssetType: "component_code_surface"
    }).category,
    "coding_build"
  );

  const runtimePolicy = JSON.parse(
    readRepoFile("build_tenants/typescript/config/operator-runtime-policy.json")
  );
  assert.equal(runtimePolicy.kind, "odd_sdlc_operator_runtime_policy");
  assert.equal(
    runtimePolicy.policyRef,
    "config://odd-sdlc/operator-runtime-policy/v1"
  );
  assert.equal(
    runtimePolicy.worker.inactivityTimeoutMs,
    runtimePolicy.minimumOperatorTimeoutMs
  );
  assert.equal(
    runtimePolicy.designDepthFpEvaluator.timeoutMs,
    600000
  );
  assert.ok(
    runtimePolicy.designDepthFpEvaluator.timeoutMs <
      runtimePolicy.minimumOperatorTimeoutMs
  );
  assert.equal(
    runtimePolicy.executionShard.timeoutMs,
    runtimePolicy.minimumOperatorTimeoutMs
  );
  assert.equal(
    runtimePolicy.executionShard.inactivityTimeoutMs,
    runtimePolicy.minimumOperatorTimeoutMs
  );
  assert.equal(
    runtimePolicy.liveHarness.commandTimeoutMs,
    runtimePolicy.minimumOperatorTimeoutMs
  );
  assert.ok(
    runtimePolicy.worker.timeoutMs >= runtimePolicy.minimumOperatorTimeoutMs
  );
});

test("T-181 worker prompts prevent whole-file Write drift in live PTY execution", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForEdge({
      workspaceRoot,
      runId: "20260523T000000006Z_pid18107",
      graphFunctionName: "derive_requirement_surface",
      edgeName: "derive_requirement_surface"
    });
    const prompt = promptForHandoff(manifest);

    assert.match(prompt, /Tool-profile contract: no-execution SDLC profile/u);
    assert.match(prompt, /use only bounded workspace-relative read-only inspection/u);
    assert.match(prompt, /never run product, build\/test, framework\/traversal, background, or artifact-write commands/u);
    assert.match(prompt, /must inspect <=80 lines/u);
    assert.doesNotMatch(prompt, /jq\/rg\/cat\/git diff\/status end `\| head -80`/u);
    assert.doesNotMatch(prompt, /sed is inclusive: end-start\+1<=80/u);
    assert.doesNotMatch(prompt, /no bare jq\/rg\/cat/u);
    assert.match(prompt, /do not use the Claude Write tool for whole-file replacement/u);
    assert.match(prompt, /targeted Edit operations/u);
    assert.doesNotMatch(prompt, /make the file-write operation the next worker action/u);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t181-fp-eval-"));
  mkdirSync(path.join(root, "specification"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(path.join(root, "README.md"), "# T-181 Fixture\n", "utf8");
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nINT-T181: Prove F_P evaluator populated registers.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    "# Requirements\n\nREQ-T181-001: Populate design-depth register in evaluate.C/F_P.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t181_fixture",
      "active_tenant: typescript",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    language: typescript",
      "    build_tool: npm"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function manifestForImplementationDesign(workspaceRoot, runId) {
  return manifestForEdge({
    workspaceRoot,
    runId,
    graphFunctionName: "derive_implementation_design_surface",
    edgeName: "derive_implementation_design_surface"
  });
}

function manifestForEdge({
  workspaceRoot,
  runId,
  graphFunctionName,
  edgeName,
  retryContext = undefined
}) {
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  const selectedContract =
    edgeName === "derive_implementation_design_surface"
      ? contract
      : hookContractByEdgeName(edgeName);
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName,
    edgeName: selectedContract.edgeName,
    vectorIndex: 0,
    contract: selectedContract,
    runId,
    retryContext
  });
}

function implementationDesignAdr(componentId) {
  return [
    "# ADR-002 Implementation Design Surface",
    "",
    "## Module Boundary",
    "",
    "| module | component | path | public boundary |",
    "|---|---|---|---|",
    `| app | ${componentId} | src/${componentId}.js | Emits fixture output |`,
    "",
    "## Product File Targets",
    "",
    "| role | file | expected behavior |",
    "|---|---|---|",
    `| source | src/${componentId}.js | generated source |`,
    "",
    "## Requirement Lineage",
    "",
    "| requirement id | component | source file |",
    "|---|---|---|",
    `| REQ-T181-001 | ${componentId} | src/${componentId}.js |`,
    ""
  ].join("\n");
}

function implementationDesignRegister(componentId, evidenceRef) {
  return {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    stackProfileRows: [
      {
        kind: "sdlc_stack_profile_row",
        stackRef: "stack://node",
        language: "javascript",
        buildTool: "npm"
      }
    ],
    implementationModuleRows: [
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "app",
        moduleRef: "module://app"
      }
    ],
    aggregateDomainModelRows: [],
    moduleSchemaFragments: [],
    moduleStateDiagramFragments: [],
    aggregateDomainModel: null,
    sunnyDaySequenceRows: [],
    aggregateSunnyDaySequence: null,
    componentTopologyRows: [
      {
        kind: "sdlc_component_topology_row",
        componentId,
        moduleName: "app",
        relativePath: `src/${componentId}.js`,
        publicBoundary: "Emits fixture output",
        concernRole: "other",
        requirementIds: ["REQ-T181-001"],
        sourceAssetRefs: [evidenceRef]
      }
    ],
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId,
        moduleName: "app",
        relativePath: `src/${componentId}.js`,
        publicBoundary: "Emits fixture output",
        trancheId: null,
        firstProductFileToChange: `src/${componentId}.js`,
        upstreamComponentIds: [],
        requirementIds: ["REQ-T181-001"],
        sourceAssetRefs: [evidenceRef]
      }
    ],
    fileTargetRows: [
      {
        kind: "sdlc_file_target_row",
        relativePath: `src/${componentId}.js`,
        role: "source"
      }
    ],
    designCompletenessVerdict: null
  };
}

function surfaceReport({ manifest, content }) {
  return {
    kind: "odd_sdlc.worker_result_report",
    projectionRole: "typed_fp_stage_projection",
    authoritativeStageResultRef: pathToFileURL(
      path.join(manifest.archiveRoot, "fp_evaluate_result.json")
    ).href,
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: sha256Text(content),
    summary: "fixture",
    unresolvedReasons: [],
    materializedFiles: [],
    materializationDiagnostics: [],
    executionEvidence: null,
    executionEvidenceErrors: [],
    obligationAssessments: []
  };
}

function writePriorWorkerResultReport({ manifest, content }) {
  const report = surfaceReport({ manifest, content });
  writeFileSync(
    path.join(manifest.archiveRoot, "worker_result_report.json"),
    `${JSON.stringify(
      {
        ...report,
        fpTransformRequestRef: null,
        fpTransformResultRef: null,
        fpTransformStatusSnapshot: null,
        fpEvaluateResultRef: pathToFileURL(
          path.join(manifest.archiveRoot, "fp_evaluate_result.json")
        ).href
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function selectedComposition() {
  return {
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: "abg.fn_composition://t181/selected",
    compositionDigest: "digest://t181/selected",
    compositionSelectionRef: "abg.fn_composition_selection://t181/selected",
    selectedRegimeBindingRef: "abg.fn_composition.regime_binding://t181/evaluate/fp",
    graphFunctionRef: "Fg_t181",
    graphVectorRef: "derive_implementation_design_surface",
    basisRef: "basis://t181"
  };
}

function designDepthGtlSelectedComposition() {
  const resultInterface = typecheckCurrentSdlcGtlProgram()
    .pluginResultInterfaceCatalog.interfaces.find(
      (contract) =>
        contract.compositionRef ===
          "abg.fn_composition://odd-sdlc/derive_implementation_design_surface" &&
        contract.stageRole === "evaluate" &&
        contract.computeMeans === "F_P" &&
        contract.outputCarrierRefs.includes("SdlcDesignDepthRegister")
    );
  assert.ok(
    resultInterface,
    "admitted design-depth GTL result interface exists"
  );
  return {
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: resultInterface.compositionRef,
    compositionDigest: resultInterface.compositionDigest,
    resultInterfaceRef: resultInterface.resultInterfaceRef,
    resultEnvelopeContractRef: resultInterface.resultEnvelopeContractRef,
    resultInterfaceContractDigest:
      resultInterface.resultInterfaceContractDigest,
    compositionSelectionRef:
      "abg.fn_composition_selection://odd-sdlc/derive_implementation_design_surface/t181",
    selectedRegimeBindingRef:
      "abg.fn_composition.regime_binding://odd-sdlc/derive_implementation_design_surface/evaluate/F_P",
    graphFunctionRef: "derive_implementation_design_surface",
    graphVectorRef: "derive_implementation_design_surface",
    basisRef: "basis://t181/design-depth-gtl"
  };
}

function writeDesignDepthFpEvaluatorRuleOutcomeProof({
  manifest,
  registerPath,
  includeRuleOutcomeEnvelopeEvidence = true
}) {
  const composition = designDepthGtlSelectedComposition();
  const registerRef = pathToFileURL(registerPath).href;
  const contentRegisterRef = pathToFileURL(
    designDepthFpEvaluatorContentRegisterPath({ archiveRoot: manifest.archiveRoot })
  ).href;
  const proofPath = path.join(
    manifest.archiveRoot,
    "design_depth_fp_evaluator_rule_outcome.json"
  );
  writeFileSync(
    proofPath,
    `${JSON.stringify(
      {
        kind: "evaluation_rule_outcome",
        status: "accepted",
        ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
        ruleRole: "semantic_judgment",
        computeMeans: "F_P",
        producedRegisterRefs: [contentRegisterRef, registerRef],
        evidenceRefs: [contentRegisterRef, registerRef],
        findingRefs: [
          `finding://odd-sdlc/${manifest.runId}/evaluate/design-depth-register`
        ],
        humanResponseRefs: [],
        residualPressureRefs: [],
        continuationRefs: [],
        diagnosticRefs: [],
        selectedCompositionRef: composition.compositionRef,
        selectedCompositionDigest: composition.compositionDigest,
        selectedCompositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
        compositionContributionRef: composition.selectedRegimeBindingRef,
        reason: null
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const proofRef = pathToFileURL(proofPath).href;
  const envelopeRef = `plugin-result-envelope:t181:${manifest.runId}`;
  const envelopeEvents = [
    {
      kind: "payload_observed",
      payloadClass: "admitted_plugin_result_envelope",
      payloadRef: envelopeRef,
      authorityRef: composition.resultInterfaceRef,
      contractRef: composition.resultEnvelopeContractRef
    },
    {
      kind: "payload_validated",
      payloadRef: envelopeRef,
      contractRef: composition.resultEnvelopeContractRef,
      contractDigest: composition.resultInterfaceContractDigest
    },
    {
      kind: "evidence_admitted",
      payloadRef: envelopeRef,
      evidenceRef: contentRegisterRef
    },
    {
      kind: "evidence_admitted",
      payloadRef: envelopeRef,
      evidenceRef: registerRef
    },
    ...(includeRuleOutcomeEnvelopeEvidence
      ? [
          {
            kind: "evidence_admitted",
            payloadRef: envelopeRef,
            evidenceRef: proofRef
          }
        ]
      : [])
  ];
  writeFileSync(
    path.join(manifest.archiveRoot, "runtime_events.json"),
    `${JSON.stringify(envelopeEvents, null, 2)}\n`,
    "utf8"
  );
  return proofRef;
}

function fpEvaluateResultPayloadForRegister(registerPath, options = {}) {
  const composition = designDepthGtlSelectedComposition();
  const scalarSelectedRegimeBindingRef =
    options.selectedRegimeBindingRef ?? composition.selectedRegimeBindingRef;
  const scalarComposition = {
    ...composition,
    selectedRegimeBindingRef: scalarSelectedRegimeBindingRef
  };
  const registerRef = pathToFileURL(registerPath).href;
  const contentRegisterRef = pathToFileURL(
    path.join(path.dirname(registerPath), "design_depth_fp_evaluator_content_register.json")
  ).href;
  const ruleOutcomeRef = pathToFileURL(
    path.join(path.dirname(registerPath), "design_depth_fp_evaluator_rule_outcome.json")
  ).href;
  return {
    kind: "sdlc_fp_evaluate_result",
    stage: "F_P.evaluate",
    computeNotationStage: "evaluate.C",
    stageAuthority: "typed_fp_stage_carriers",
    selectedComposition: scalarComposition,
    compositionRef: composition.compositionRef,
    compositionDigest: composition.compositionDigest,
    compositionSelectionRef: composition.compositionSelectionRef,
    selectedRegimeBindingRef: scalarSelectedRegimeBindingRef,
    evaluationRef: "evaluation://t181/fp",
    findings: [
      {
        findingRef: "finding://t181/evaluate/design-depth-register",
        compositionRef: composition.compositionRef,
        compositionDigest: composition.compositionDigest,
        authorityRefs: [contentRegisterRef, registerRef, ruleOutcomeRef],
        evidenceRefs: [contentRegisterRef, registerRef, ruleOutcomeRef]
      }
    ],
    evaluation: {
      evaluationRef: "evaluation://t181/fp",
      status: "passed",
      findingRefs: ["finding://t181/evaluate/design-depth-register"]
    },
    status: "passed",
    postflightStatus: "passed",
    blockingReasons: [],
    evidenceRefs: [contentRegisterRef, registerRef, ruleOutcomeRef]
  };
}

function writeDesignDepthFpEvaluatorContentRegister({ manifest, registerPath }) {
  const composition = designDepthGtlSelectedComposition();
  const register = JSON.parse(readFileSync(registerPath, "utf8"));
  const contentRegisterPath = designDepthFpEvaluatorContentRegisterPath({
    archiveRoot: manifest.archiveRoot
  });
  const contentRegisterRef = pathToFileURL(contentRegisterPath).href;
  const registerRef = pathToFileURL(registerPath).href;
  writeFileSync(
    contentRegisterPath,
    `${JSON.stringify(
      {
        kind: "sdlc_evaluate_content_register",
        registerVersion: "ts-evaluate-content-register-v1",
        stage: "evaluate.C",
        ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
        ruleRole: "semantic_judgment",
        computeMeans: "F_P",
        authorityFunction: "synthesize_model",
        selectedCompositionRef: composition.compositionRef,
        selectedCompositionDigest: composition.compositionDigest,
        selectedCompositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
        compositionContributionRef: composition.selectedRegimeBindingRef,
        sourceBasisRefs: [pathToFileURL(manifest.outputFile).href],
        candidateArtifactRefs: [pathToFileURL(manifest.outputFile).href],
        evidenceRefs: [pathToFileURL(manifest.outputFile).href, registerRef],
        contentRows: [
          {
            kind: "sdlc_evaluate_content_register_row",
            rowRef: `content-register-row://t181/${manifest.runId}/design-depth`,
            authorityFunction: "synthesize_model",
            carrierFamily: "ProductAssetModel",
            contentKind: "sdlc_design_depth_register",
            payload: register,
            sourceBasisRefs: [pathToFileURL(manifest.outputFile).href],
            evidenceRefs: [pathToFileURL(manifest.outputFile).href, registerRef]
          }
        ]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  return contentRegisterRef;
}

test("T-181 design-depth content register normalizes root version aliases during projection", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t181-root-version-alias-normalization"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    writeFileSync(
      manifest.outputFile,
      implementationDesignAdr("alias-component"),
      "utf8"
    );
    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    const contentRegisterPath = designDepthFpEvaluatorContentRegisterPath({
      archiveRoot: manifest.archiveRoot
    });
    const composition = designDepthGtlSelectedComposition();
    const evidenceRef = pathToFileURL(manifest.outputFile).href;
    const axisVerdict = (axis) => ({
      kind: "sdlc_design_completeness_axis_verdict",
      axis,
      status: "satisfied",
      reasons: [],
      evidenceRefs: [evidenceRef]
    });
    const register = implementationDesignRegister("alias-component", evidenceRef);
    register.aggregateDomainModelRows = [
      {
        kind: "sdlc_aggregate_domain_model_row",
        modelRef: "model://t181/alias-component"
      }
    ];
    register.aggregateDomainModel = {
      kind: "sdlc_aggregate_domain_model",
      modelVersion: "ts-design-depth-v1",
      entities: [],
      operations: [],
      crossModuleReferences: [],
      evidenceRefs: [evidenceRef]
    };
    register.sunnyDaySequenceRows = [
      {
        kind: "sdlc_sunny_day_sequence_row",
        sequenceRef: "sequence://t181/alias-component"
      }
    ];
    register.aggregateSunnyDaySequence = {
      kind: "sdlc_aggregate_sunny_day_sequence",
      sequenceVersion: "ts-design-depth-v1",
      steps: [],
      evidenceRefs: [evidenceRef]
    };
    register.designCompletenessVerdict = {
      kind: "sdlc_design_completeness_verdict",
      verdictVersion: "ts-design-depth-v1",
      entity: axisVerdict("entity"),
      attribute: axisVerdict("attribute"),
      flow: axisVerdict("flow")
    };
    mkdirSync(path.dirname(contentRegisterPath), { recursive: true });
    writeFileSync(
      contentRegisterPath,
      `${JSON.stringify(
        {
          kind: "sdlc_evaluate_content_register",
          registerVersion: "ts-evaluate-content-register-v1",
          stage: "evaluate.C",
          ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          authorityFunction: "synthesize_model",
          selectedCompositionRef: composition.compositionRef,
          selectedCompositionDigest: composition.compositionDigest,
          selectedCompositionSelectionRef: composition.compositionSelectionRef,
          selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
          compositionContributionRef: composition.selectedRegimeBindingRef,
          sourceBasisRefs: [evidenceRef],
          candidateArtifactRefs: [evidenceRef],
          evidenceRefs: [evidenceRef],
          contentRows: [
            {
              kind: "sdlc_evaluate_content_register_row",
              rowRef: `content-register-row://t181/${manifest.runId}/design-depth`,
              authorityFunction: "synthesize_model",
              carrierFamily: "ProductAssetModel",
              contentKind: "sdlc_design_depth_register",
              payload: {
                ...register,
                modelVersion: "ts-design-depth-v1",
                sequenceVersion: "ts-design-depth-v1",
                verdictVersion: "ts-design-depth-v1"
              },
              sourceBasisRefs: [evidenceRef],
              evidenceRefs: [evidenceRef]
            }
          ]
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const admission = admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity({
      registerPath: contentRegisterPath,
      selectedIdentity: {
        selectedCompositionRef: composition.compositionRef,
        selectedCompositionDigest: composition.compositionDigest,
        selectedCompositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef
      },
      ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
      authorityFunction: "synthesize_model"
    });
    assert.equal(admission.status, "admitted");

    writeDesignDepthRegisterProjectionFromEvaluateContentRegister({
      register: admission.register,
      archiveRoot: manifest.archiveRoot,
      registerPath
    });
    const projected = JSON.parse(readFileSync(registerPath, "utf8"));

    assert.equal(Object.hasOwn(projected, "modelVersion"), false);
    assert.equal(Object.hasOwn(projected, "sequenceVersion"), false);
    assert.equal(Object.hasOwn(projected, "verdictVersion"), false);
    assert.equal(
      projected.aggregateDomainModel.modelVersion,
      "ts-design-depth-v1"
    );
    assert.equal(
      projected.aggregateSunnyDaySequence.sequenceVersion,
      "ts-design-depth-v1"
    );
    assert.equal(
      projected.designCompletenessVerdict.verdictVersion,
      "ts-design-depth-v1"
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 design-depth content register supports incremental fragment projection", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t181-incremental-content-register"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    writeFileSync(
      manifest.outputFile,
      implementationDesignAdr("incremental-component"),
      "utf8"
    );
    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    const contentRegisterPath = designDepthFpEvaluatorContentRegisterPath({
      archiveRoot: manifest.archiveRoot
    });
    const composition = designDepthGtlSelectedComposition();
    const evidenceRef = pathToFileURL(manifest.outputFile).href;
    const register = implementationDesignRegister(
      "incremental-component",
      evidenceRef
    );
    const sections = [
      "stackProfileRows",
      "implementationModuleRows",
      "aggregateDomainModelRows",
      "moduleSchemaFragments",
      "moduleStateDiagramFragments",
      "aggregateDomainModel",
      "sunnyDaySequenceRows",
      "aggregateSunnyDaySequence",
      "componentTopologyRows",
      "componentRealizationRows",
      "fileTargetRows",
      "designCompletenessVerdict"
    ];
    mkdirSync(path.dirname(contentRegisterPath), { recursive: true });
    writeFileSync(
      contentRegisterPath,
      `${JSON.stringify(
        {
          kind: "sdlc_evaluate_content_register",
          registerVersion: "ts-evaluate-content-register-v1",
          stage: "evaluate.C",
          ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          authorityFunction: "synthesize_model",
          selectedCompositionRef: composition.compositionRef,
          selectedCompositionDigest: composition.compositionDigest,
          selectedCompositionSelectionRef: composition.compositionSelectionRef,
          selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
          compositionContributionRef: composition.selectedRegimeBindingRef,
          sourceBasisRefs: [evidenceRef],
          candidateArtifactRefs: [evidenceRef],
          evidenceRefs: [evidenceRef],
          contentRows: sections.map((section, index) => ({
            kind: "sdlc_evaluate_content_register_row",
            rowRef: `content-register-row://t181/incremental/${section}`,
            authorityFunction: "synthesize_model",
            carrierFamily: "ProductAssetModel",
            contentKind: "sdlc_design_depth_register_fragment",
            payload: {
              kind: "sdlc_design_depth_register_fragment",
              fragmentVersion: "ts-design-depth-fragment-v1",
              targetAssetType: "implementation_design_surface",
              section,
              sequence: index + 1,
              mergeMode: "replace",
              value: register[section]
            },
            sourceBasisRefs: [evidenceRef],
            evidenceRefs: [evidenceRef]
          }))
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const admission = admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity({
      registerPath: contentRegisterPath,
      selectedIdentity: {
        selectedCompositionRef: composition.compositionRef,
        selectedCompositionDigest: composition.compositionDigest,
        selectedCompositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef
      },
      ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
      authorityFunction: "synthesize_model"
    });
    assert.equal(admission.status, "admitted");

    const projectedRef = writeDesignDepthRegisterProjectionFromEvaluateContentRegister({
      register: admission.register,
      archiveRoot: manifest.archiveRoot,
      registerPath
    });
    const projected = JSON.parse(readFileSync(registerPath, "utf8"));

    assert.equal(projectedRef, pathToFileURL(registerPath).href);
    assert.equal(projected.kind, "sdlc_design_depth_register");
    assert.equal(projected.targetAssetType, "implementation_design_surface");
    assert.deepEqual(projected.componentTopologyRows, register.componentTopologyRows);
    assert.deepEqual(
      projected.componentRealizationRows,
      register.componentRealizationRows
    );
    assert.deepEqual(projected.fileTargetRows, register.fileTargetRows);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 design-depth content register canonicalizes numeric tranche ids", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t181-numeric-tranche-canonicalization"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    writeFileSync(
      manifest.outputFile,
      implementationDesignAdr("numeric-tranche-component"),
      "utf8"
    );
    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    const contentRegisterPath = designDepthFpEvaluatorContentRegisterPath({
      archiveRoot: manifest.archiveRoot
    });
    const composition = selectedComposition();
    const evidenceRef = pathToFileURL(manifest.outputFile).href;
    const register = implementationDesignRegister(
      "numeric-tranche-component",
      evidenceRef
    );
    const registerWithNumericTranche = {
      ...register,
      componentRealizationRows: [
        {
          ...register.componentRealizationRows[0],
          trancheId: 1
        }
      ]
    };
    const sections = [
      "stackProfileRows",
      "implementationModuleRows",
      "aggregateDomainModelRows",
      "moduleSchemaFragments",
      "moduleStateDiagramFragments",
      "aggregateDomainModel",
      "sunnyDaySequenceRows",
      "aggregateSunnyDaySequence",
      "componentTopologyRows",
      "componentRealizationRows",
      "fileTargetRows",
      "designCompletenessVerdict"
    ];
    mkdirSync(path.dirname(contentRegisterPath), { recursive: true });
    writeFileSync(
      contentRegisterPath,
      `${JSON.stringify(
        {
          kind: "sdlc_evaluate_content_register",
          registerVersion: "ts-evaluate-content-register-v1",
          stage: "evaluate.C",
          ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          authorityFunction: "synthesize_model",
          selectedCompositionRef: composition.compositionRef,
          selectedCompositionDigest: composition.compositionDigest,
          selectedCompositionSelectionRef: composition.compositionSelectionRef,
          selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
          compositionContributionRef: composition.selectedRegimeBindingRef,
          sourceBasisRefs: [evidenceRef],
          candidateArtifactRefs: [evidenceRef],
          evidenceRefs: [evidenceRef],
          contentRows: sections.map((section, index) => ({
            kind: "sdlc_evaluate_content_register_row",
            rowRef: `content-register-row://t181/numeric-tranche/${section}`,
            authorityFunction: "synthesize_model",
            carrierFamily: "ProductAssetModel",
            contentKind: "sdlc_design_depth_register_fragment",
            payload: {
              kind: "sdlc_design_depth_register_fragment",
              fragmentVersion: "ts-design-depth-fragment-v1",
              targetAssetType: "implementation_design_surface",
              section,
              sequence: index + 1,
              mergeMode: "replace",
              value: registerWithNumericTranche[section]
            },
            sourceBasisRefs: [evidenceRef],
            evidenceRefs: [evidenceRef]
          }))
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const admission = admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity({
      registerPath: contentRegisterPath,
      selectedIdentity: {
        selectedCompositionRef: composition.compositionRef,
        selectedCompositionDigest: composition.compositionDigest,
        selectedCompositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef
      },
      ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
      authorityFunction: "synthesize_model"
    });
    assert.equal(admission.status, "admitted");

    writeDesignDepthRegisterProjectionFromEvaluateContentRegister({
      register: admission.register,
      archiveRoot: manifest.archiveRoot,
      registerPath
    });
    const projected = JSON.parse(readFileSync(registerPath, "utf8"));

    assert.equal(projected.componentRealizationRows[0].trancheId, "1");
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-184 evaluator projection rejects object-valued invariants before writing register truth", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t184-object-invariant-rejection"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    writeFileSync(
      manifest.outputFile,
      implementationDesignAdr("object-invariant-component"),
      "utf8"
    );
    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    const contentRegisterPath = designDepthFpEvaluatorContentRegisterPath({
      archiveRoot: manifest.archiveRoot
    });
    const composition = selectedComposition();
    const evidenceRef = pathToFileURL(manifest.outputFile).href;
    const register = implementationDesignRegister(
      "object-invariant-component",
      evidenceRef
    );
    register.moduleSchemaFragments = [
      {
        kind: "sdlc_module_schema_fragment",
        moduleName: "app",
        entities: [
          {
            kind: "sdlc_domain_entity",
            entityId: "entity:app.hello",
            moduleName: "app",
            ownership: "owned",
            attributes: [],
            invariants: [
              {
                kind: "sdlc_domain_invariant",
                invariantId: "invariant:app.hello.output",
                statement: "hello output is deterministic",
                evidenceRefs: [evidenceRef]
              }
            ],
            sourceAssetRefs: [evidenceRef]
          }
        ],
        operations: [],
        requirementIds: ["REQ-T181-001"],
        sourceAssetRefs: [evidenceRef]
      }
    ];
    mkdirSync(path.dirname(contentRegisterPath), { recursive: true });
    writeFileSync(
      contentRegisterPath,
      `${JSON.stringify(
        {
          kind: "sdlc_evaluate_content_register",
          registerVersion: "ts-evaluate-content-register-v1",
          stage: "evaluate.C",
          ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          authorityFunction: "synthesize_model",
          selectedCompositionRef: composition.compositionRef,
          selectedCompositionDigest: composition.compositionDigest,
          selectedCompositionSelectionRef: composition.compositionSelectionRef,
          selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
          compositionContributionRef: composition.selectedRegimeBindingRef,
          sourceBasisRefs: [evidenceRef],
          candidateArtifactRefs: [evidenceRef],
          evidenceRefs: [evidenceRef],
          contentRows: [
            {
              kind: "sdlc_evaluate_content_register_row",
              rowRef: `content-register-row://t184/${manifest.runId}/design-depth`,
              authorityFunction: "synthesize_model",
              carrierFamily: "ProductAssetModel",
              contentKind: "sdlc_design_depth_register",
              payload: register,
              sourceBasisRefs: [evidenceRef],
              evidenceRefs: [evidenceRef]
            }
          ]
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const admission = admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity({
      registerPath: contentRegisterPath,
      selectedIdentity: {
        selectedCompositionRef: composition.compositionRef,
        selectedCompositionDigest: composition.compositionDigest,
        selectedCompositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef
      },
      ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
      authorityFunction: "synthesize_model"
    });
    assert.equal(admission.status, "admitted");
    assert.throws(
      () =>
        writeDesignDepthRegisterProjectionFromEvaluateContentRegister({
          register: admission.register,
          archiveRoot: manifest.archiveRoot,
          registerPath
        }),
      /design_depth_register\.moduleSchemaFragments\[0\]\.entities\[0\]\.invariants\[0\]: expected string/u
    );
    assert.equal(existsSync(registerPath), false);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 incomplete design-depth fragments remain observable but not projected", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t181-incomplete-content-register"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    writeFileSync(
      manifest.outputFile,
      implementationDesignAdr("incomplete-component"),
      "utf8"
    );
    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    const contentRegisterPath = designDepthFpEvaluatorContentRegisterPath({
      archiveRoot: manifest.archiveRoot
    });
    const composition = selectedComposition();
    const evidenceRef = pathToFileURL(manifest.outputFile).href;
    const register = implementationDesignRegister("incomplete-component", evidenceRef);
    mkdirSync(path.dirname(contentRegisterPath), { recursive: true });
    writeFileSync(
      contentRegisterPath,
      `${JSON.stringify(
        {
          kind: "sdlc_evaluate_content_register",
          registerVersion: "ts-evaluate-content-register-v1",
          stage: "evaluate.C",
          ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          authorityFunction: "synthesize_model",
          selectedCompositionRef: composition.compositionRef,
          selectedCompositionDigest: composition.compositionDigest,
          selectedCompositionSelectionRef: composition.compositionSelectionRef,
          selectedRegimeBindingRef: composition.selectedRegimeBindingRef,
          compositionContributionRef: composition.selectedRegimeBindingRef,
          sourceBasisRefs: [evidenceRef],
          candidateArtifactRefs: [evidenceRef],
          evidenceRefs: [evidenceRef],
          contentRows: [
            {
              kind: "sdlc_evaluate_content_register_row",
              rowRef: "content-register-row://t181/incomplete/stack",
              authorityFunction: "synthesize_model",
              carrierFamily: "ProductAssetModel",
              contentKind: "sdlc_design_depth_register_fragment",
              payload: {
                kind: "sdlc_design_depth_register_fragment",
                fragmentVersion: "ts-design-depth-fragment-v1",
                targetAssetType: "implementation_design_surface",
                section: "stackProfileRows",
                sequence: 1,
                mergeMode: "replace",
                value: register.stackProfileRows
              },
              sourceBasisRefs: [evidenceRef],
              evidenceRefs: [evidenceRef]
            }
          ]
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const admission = admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity({
      registerPath: contentRegisterPath,
      selectedIdentity: {
        selectedCompositionRef: composition.compositionRef,
        selectedCompositionDigest: composition.compositionDigest,
        selectedCompositionSelectionRef: composition.compositionSelectionRef,
        selectedRegimeBindingRef: composition.selectedRegimeBindingRef
      },
      ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
      authorityFunction: "synthesize_model"
    });
    assert.equal(admission.status, "admitted");
    assert.throws(
      () =>
        writeDesignDepthRegisterProjectionFromEvaluateContentRegister({
          register: admission.register,
          archiveRoot: manifest.archiveRoot,
          registerPath
        }),
      /evaluate content register has no design-depth register payload/u
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-183 evaluate content register rejects bridge-shaped extra semantic surfaces", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t183-content-register-closed-shape"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    writeFileSync(manifest.outputFile, implementationDesignAdr("fp-sidecar"), "utf8");
    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    mkdirSync(path.dirname(registerPath), { recursive: true });
    writeFileSync(
      registerPath,
      `${JSON.stringify(
        implementationDesignRegister(
          "fp-sidecar",
          pathToFileURL(manifest.outputFile).href
        ),
        null,
        2
      )}\n`,
      "utf8"
    );
    writeDesignDepthFpEvaluatorContentRegister({ manifest, registerPath });
    const contentRegisterPath = designDepthFpEvaluatorContentRegisterPath({
      archiveRoot: manifest.archiveRoot
    });
    const composition = designDepthGtlSelectedComposition();
    const selectedIdentity = {
      selectedCompositionRef: composition.compositionRef,
      selectedCompositionDigest: composition.compositionDigest,
      selectedCompositionSelectionRef: composition.compositionSelectionRef,
      selectedRegimeBindingRef: composition.selectedRegimeBindingRef
    };
    const admissionInput = {
      registerPath: contentRegisterPath,
      selectedIdentity,
      ruleRef: "evaluation-rule://odd-sdlc/design-depth-register/fp",
      authorityFunction: "synthesize_model"
    };

    const cleanRegister = JSON.parse(readFileSync(contentRegisterPath, "utf8"));
    assert.equal(
      admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity(admissionInput)
        .status,
      "admitted"
    );

    writeFileSync(
      contentRegisterPath,
      `${JSON.stringify(
        {
          ...cleanRegister,
          legacySemanticRows: []
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    const topLevelExtra =
      admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity(admissionInput);
    assert.equal(topLevelExtra.status, "rejected");
    assert.match(
      topLevelExtra.blockingReasons.join("\n"),
      /unexpected keys legacySemanticRows/u
    );

    writeFileSync(
      contentRegisterPath,
      `${JSON.stringify(
        {
          ...cleanRegister,
          contentRows: cleanRegister.contentRows.map((row) => ({
            ...row,
            legacyScore: 1
          }))
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    const rowExtra =
      admitSdlcEvaluateContentRegisterArtifactForSelectedIdentity(admissionInput);
    assert.equal(rowExtra.status, "rejected");
    assert.match(rowExtra.blockingReasons.join("\n"), /unexpected keys legacyScore/u);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 handoff names evaluate.C/F_P as design-depth register population", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(workspaceRoot, "t181-prompt");
    const files = writeHandoffFiles(manifest);
    const prompt = readFileSync(files.promptPath, "utf8");

    assert.match(
      prompt,
      /evaluate\.C\/F_P design-depth evaluator populates the design-depth register/u
    );
    assert.match(prompt, /Deterministic framework code admits and validates/u);
    assert.doesNotMatch(
      prompt,
      /framework evaluator derives and publishes the design-depth register/u
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 evaluator sidecar is preferred over legacy ADR derivation", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t181-sidecar-preferred"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const content = implementationDesignAdr("fd-derived");
    writeFileSync(manifest.outputFile, content, "utf8");
    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    mkdirSync(path.dirname(registerPath), { recursive: true });
    writeFileSync(
      registerPath,
      `${JSON.stringify(
        implementationDesignRegister(
          "fp-sidecar",
          pathToFileURL(manifest.outputFile).href
        ),
        null,
        2
      )}\n`,
      "utf8"
    );

    const admission = admitImplementationDesignRegisterCandidateForManifest({
      manifest
    });

    assert.equal(admission.status, "admitted");
    assert.equal(admission.register.componentTopologyRows[0].componentId, "fp-sidecar");
    assert.notEqual(
      admission.register.componentTopologyRows[0].componentId,
      "fd-derived"
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 evaluator sidecar must be admitted JSON, not Markdown fallback", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t181-sidecar-markdown"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    writeFileSync(manifest.outputFile, implementationDesignAdr("fd-derived"), "utf8");
    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    mkdirSync(path.dirname(registerPath), { recursive: true });
    writeFileSync(registerPath, implementationDesignAdr("markdown-sidecar"), "utf8");

    const admission = admitImplementationDesignRegisterCandidateForManifest({
      manifest
    });

    assert.equal(admission.status, "rejected");
    assert.deepEqual(admission.blockingReasons, [
      "design_depth_register_json_required"
    ]);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-183 evaluator sidecar admission is structural and does not replace F_P semantic judgment", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t181-sidecar-quality"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    writeFileSync(manifest.outputFile, implementationDesignAdr("fp-sidecar"), "utf8");
    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    mkdirSync(path.dirname(registerPath), { recursive: true });
    const evidenceRef = pathToFileURL(manifest.outputFile).href;
    const register = implementationDesignRegister("fp-sidecar", evidenceRef);
    register.componentTopologyRows[0].publicBoundary = "module-root";
    register.componentRealizationRows[0].publicBoundary = "module-root";
    register.fileTargetRows = [
      ...register.fileTargetRows,
      {
        kind: "sdlc_file_target_row",
        relativePath: register.fileTargetRows[0].relativePath,
        role: "runtime_binding"
      }
    ];
    writeFileSync(registerPath, `${JSON.stringify(register, null, 2)}\n`, "utf8");

    const admission = admitImplementationDesignRegisterCandidateForManifest({
      manifest
    });

    assert.equal(admission.status, "admitted");
    assert.equal(
      admission.register.componentTopologyRows[0].publicBoundary,
      "module-root"
    );
    const runtimeAdmission = admitImplementationDesignRegisterForManifest({
      manifest
    });
    assert.equal(runtimeAdmission.status, "rejected");
    assert.deepEqual(runtimeAdmission.blockingReasons, [
      "design_depth_fp_evaluator_register_unadmitted"
    ]);

    const missingSourceTargetRegister = implementationDesignRegister(
      "fp-sidecar",
      evidenceRef
    );
    missingSourceTargetRegister.fileTargetRows = [
      {
        kind: "sdlc_file_target_row",
        relativePath: "package.json",
        role: "build_config"
      }
    ];
    writeFileSync(
      registerPath,
      `${JSON.stringify(missingSourceTargetRegister, null, 2)}\n`,
      "utf8"
    );
    const missingSourceTargetAdmission =
      admitImplementationDesignRegisterCandidateForManifest({
        manifest
      });
    assert.equal(missingSourceTargetAdmission.status, "admitted");
    assert.deepEqual(
      missingSourceTargetAdmission.register.fileTargetRows.map((row) => row.role),
      ["build_config"]
    );

    const emptyTopologyRegister = implementationDesignRegister(
      "fp-sidecar",
      evidenceRef
    );
    emptyTopologyRegister.componentTopologyRows = [];
    emptyTopologyRegister.componentRealizationRows = [];
    emptyTopologyRegister.fileTargetRows = [
      {
        kind: "sdlc_file_target_row",
        relativePath: "package.json",
        role: "build_config"
      }
    ];
    writeFileSync(
      registerPath,
      `${JSON.stringify(emptyTopologyRegister, null, 2)}\n`,
      "utf8"
    );
    const emptyTopologyAdmission =
      admitImplementationDesignRegisterCandidateForManifest({
        manifest
      });
    assert.equal(emptyTopologyAdmission.status, "admitted");
    assert.deepEqual(emptyTopologyAdmission.register.componentTopologyRows, []);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-158 design-depth evaluator result admission uses ABG envelope instead of nested selectedComposition", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t181-abg-plugin-result-envelope"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    writeFileSync(
      manifest.outputFile,
      implementationDesignAdr("abg-result-envelope"),
      "utf8"
    );
    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    mkdirSync(path.dirname(registerPath), { recursive: true });
    writeFileSync(
      registerPath,
      `${JSON.stringify(
        implementationDesignRegister(
          "abg-result-envelope",
          pathToFileURL(manifest.outputFile).href
        ),
        null,
        2
      )}\n`,
      "utf8"
    );
    writeDesignDepthFpEvaluatorContentRegister({ manifest, registerPath });
    writeDesignDepthFpEvaluatorRuleOutcomeProof({ manifest, registerPath });
    const fpEvaluateResult = { ...fpEvaluateResultPayloadForRegister(registerPath) };
    delete fpEvaluateResult.selectedComposition;
    writeFileSync(
      path.join(manifest.archiveRoot, "fp_evaluate_result.json"),
      `${JSON.stringify(fpEvaluateResult, null, 2)}\n`,
      "utf8"
    );

    const admission = admitImplementationDesignRegisterForManifest({
      manifest
    });

    assert.equal(admission.status, "admitted");
    assert.ok(
      admission.evidenceRefs.some((ref) => ref.startsWith("plugin-result-envelope:")),
      JSON.stringify(admission.evidenceRefs, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 F_P evaluator register truth defers transform postflight and validates after sidecar", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "t181-sidecar-required"
    );
    mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
    const content = implementationDesignAdr("fd-derived");
    writeFileSync(manifest.outputFile, content, "utf8");
    const report = surfaceReport({ manifest, content });

    const directAdmission = admitImplementationDesignRegisterForManifest({
      manifest
    });
    assert.equal(directAdmission.status, "rejected");
    assert.deepEqual(directAdmission.blockingReasons, [
      "design_depth_fp_evaluator_register_missing"
    ]);

    const before = evaluateSdlcComputeStage({ manifest, report });
    assert.equal(before.status, "blocked");
    assert.match(
      before.blockingReasons.join("\n"),
      /design_depth_fp_evaluator_pending/u
    );
    assert.equal(
      before.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(before.blockingReasonCarriers, null, 2)
    );
    const preEvaluateAssuranceGate = deriveSdlcOperatorAssuranceGate({
      manifest,
      report,
      postflight: before
    });
    assert.equal(
      JSON.stringify(preEvaluateAssuranceGate).includes("design_depth_register_missing"),
      false,
      JSON.stringify(preEvaluateAssuranceGate, null, 2)
    );
    assert.equal(
      preEvaluateAssuranceGate.requiredDimensions.includes("design_completeness"),
      false,
      JSON.stringify(preEvaluateAssuranceGate.requiredDimensions, null, 2)
    );

    const registerPath = designDepthFpEvaluatorRegisterPath(manifest);
    mkdirSync(path.dirname(registerPath), { recursive: true });
    writeFileSync(
      registerPath,
      `${JSON.stringify(
        implementationDesignRegister(
          "fp-sidecar",
          pathToFileURL(manifest.outputFile).href
        ),
        null,
        2
      )}\n`,
      "utf8"
    );

    const filesystemOnly = evaluateSdlcComputeStage({ manifest, report });
    assert.equal(filesystemOnly.status, "blocked");
    assert.match(
      filesystemOnly.blockingReasons.join("\n"),
      /design_depth_fp_evaluator_pending/u
    );
    assert.match(
      JSON.stringify(filesystemOnly.blockingReasonCarriers),
      /design_depth_fp_evaluator_register_unadmitted/u
    );
    const filesystemOnlyAdmission = admitImplementationDesignRegisterForManifest({
      manifest
    });
    assert.equal(filesystemOnlyAdmission.status, "rejected");
    assert.deepEqual(filesystemOnlyAdmission.blockingReasons, [
      "design_depth_fp_evaluator_register_unadmitted"
    ]);

    const fpEvaluatorAdmissionEvidenceRefs = Object.freeze([
      writeDesignDepthFpEvaluatorRuleOutcomeProof({ manifest, registerPath })
    ]);
    const missingContentRegister = evaluateSdlcComputeStage({
      manifest,
      report,
      fpEvaluatorAdmissionEvidenceRefs
    });
    assert.equal(missingContentRegister.status, "blocked");
    assert.match(
      missingContentRegister.blockingReasons.join("\n"),
      /design_depth_register_admission_invalid/u
    );
    assert.match(
      JSON.stringify(missingContentRegister.blockingReasonCarriers),
      /design_depth_fp_evaluator_register_unadmitted/u
    );
    const missingContentRegisterAdmission =
      admitImplementationDesignRegisterForRuntimeEvaluation({
        manifest,
        fpEvaluatorAdmissionEvidenceRefs
      });
    assert.equal(missingContentRegisterAdmission.status, "rejected");
    assert.deepEqual(missingContentRegisterAdmission.blockingReasons, [
      "design_depth_fp_evaluator_register_unadmitted"
    ]);

    writeDesignDepthFpEvaluatorContentRegister({ manifest, registerPath });
    const after = evaluateSdlcComputeStage({
      manifest,
      report,
      fpEvaluatorAdmissionEvidenceRefs
    });
    assert.equal(after.status, "passed");
    assert.deepEqual(after.blockingReasons, []);
    assert.equal(
      after.blockingReasonCarriers.some((reason) =>
        reason.code.startsWith("staged_")
      ),
      false,
      JSON.stringify(after.blockingReasonCarriers, null, 2)
    );
    assert.ok(
      after.evidenceRefs.some((ref) =>
        ref.endsWith("/design_depth_fp_evaluator_register.json")
      ),
      JSON.stringify(after.evidenceRefs, null, 2)
    );
    const fpEvaluateResult = constructSdlcFpEvaluateResult({
      manifest,
      selectedComposition: selectedComposition(),
      report,
      postflight: after
    });
    assert.equal(
      fpEvaluateResult.selectedRegimeBindingRef,
      "abg.fn_composition.regime_binding://t181/evaluate/fp"
    );
    assert.ok(
      fpEvaluateResult.evidenceRefs.some((ref) =>
        ref.endsWith("/design_depth_fp_evaluator_register.json")
      ),
      JSON.stringify(fpEvaluateResult.evidenceRefs, null, 2)
    );
    assert.ok(
      fpEvaluateResult.findings[0].authorityRefs.some((ref) =>
        ref.endsWith("/design_depth_fp_evaluator_register.json")
      ),
      JSON.stringify(fpEvaluateResult.findings[0].authorityRefs, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 component edges read evaluator register from source-asset lineage refs", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const graphFunctionName = "Fg_t181_product";
    const prior = manifestForEdge({
      workspaceRoot,
      runId: "20260523T000000000Z_pid18101",
      graphFunctionName,
      edgeName: "derive_lite_design_adr_surface"
    });
    writeHandoffFiles(prior);
    mkdirSync(path.dirname(prior.outputFile), { recursive: true });
    const priorContent = implementationDesignAdr("fp-predecessor");
    writeFileSync(prior.outputFile, priorContent, "utf8");
    const priorRegisterPath = designDepthFpEvaluatorRegisterPath(prior);
    mkdirSync(path.dirname(priorRegisterPath), { recursive: true });
    writeFileSync(
      priorRegisterPath,
      `${JSON.stringify(
        implementationDesignRegister(
          "fp-predecessor",
          pathToFileURL(prior.outputFile).href
        ),
        null,
        2
      )}\n`,
      "utf8"
    );
    writeDesignDepthFpEvaluatorContentRegister({
      manifest: prior,
      registerPath: priorRegisterPath
    });
    writeDesignDepthFpEvaluatorRuleOutcomeProof({
      manifest: prior,
      registerPath: priorRegisterPath
    });
    writeFileSync(
      path.join(prior.archiveRoot, "fp_evaluate_result.json"),
      `${JSON.stringify(
        fpEvaluateResultPayloadForRegister(priorRegisterPath, {
          selectedRegimeBindingRef:
            "regime-binding://odd-sdlc/derive_lite_design_adr_surface/transform/F_P"
        }),
        null,
        2
      )}\n`,
      "utf8"
    );
    writePriorWorkerResultReport({ manifest: prior, content: priorContent });

    const current = manifestForEdge({
      workspaceRoot,
      runId: "20260523T000000001Z_pid18102",
      graphFunctionName,
      edgeName: "derive_lite_component_code_surface"
    });

    const admission = admitImplementationDesignRegisterForManifest({
      manifest: current
    });

    assert.equal(admission.status, "admitted");
    assert.equal(
      admission.register.componentTopologyRows[0].componentId,
      "fp-predecessor"
    );
    assert.ok(
      admission.evidenceRefs.some((ref) =>
        ref.endsWith("/design_depth_fp_evaluator_register.json")
      ),
      JSON.stringify(admission.evidenceRefs, null, 2)
    );
    const invocationPackage = constructWorkerInvocationPackage({ manifest: current });
    const constructionBrief = constructWorkerConstructionBrief({
      manifest: current,
      constructionBriefPath: path.join(
        current.archiveRoot,
        "worker_construction_brief.json"
      ),
      invocationPackage
    });
    const prompt = promptForHandoff(current);
    assert.ok(
      constructionBrief.stagePressure.designDepthEvaluatorRegisterRefs.some((ref) =>
        ref.endsWith("/design_depth_fp_evaluator_register.json")
      ),
      JSON.stringify(constructionBrief.stagePressure, null, 2)
    );
    assert.match(
      prompt,
      /Treat the admitted design-depth evaluator register as the highest implementation-design semantic pressure/u
    );
    assert.match(
      prompt,
      /connect the product behavior to that source file's runtime entrypoint/u
    );
    assert.match(
      prompt,
      /Tenant stack authority must match the product files actually emitted/u
    );
    assert.match(
      prompt,
      /Pre-return syntax check: every emitted source, test, and build\/config product file must use the language, module\/import system, file extension, test framework, and command shape declared by tenant stack authority/u
    );
    assert.match(prompt, /construction_brief\.stagePressure\.designDepthEvaluatorRegisterRefs/u);
    assert.match(prompt, /compressed work-category governance/u);
    assert.match(prompt, /config\/work-category-governance\/coding_build\.md/u);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-203 component-code targets admit predecessor evaluator register when rule outcome is separate", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const graphFunctionName = "Fg_t203_product";
    const prior = manifestForEdge({
      workspaceRoot,
      runId: "20260523T000000010Z_pid20301",
      graphFunctionName,
      edgeName: "derive_lite_design_adr_surface"
    });
    writeHandoffFiles(prior);
    mkdirSync(path.dirname(prior.outputFile), { recursive: true });
    const priorContent = implementationDesignAdr("fp-live-ordering");
    writeFileSync(prior.outputFile, priorContent, "utf8");
    const priorRegisterPath = designDepthFpEvaluatorRegisterPath(prior);
    mkdirSync(path.dirname(priorRegisterPath), { recursive: true });
    writeFileSync(
      priorRegisterPath,
      `${JSON.stringify(
        implementationDesignRegister(
          "fp-live-ordering",
          pathToFileURL(prior.outputFile).href
        ),
        null,
        2
      )}\n`,
      "utf8"
    );
    writeDesignDepthFpEvaluatorContentRegister({
      manifest: prior,
      registerPath: priorRegisterPath
    });
    writeDesignDepthFpEvaluatorRuleOutcomeProof({
      manifest: prior,
      registerPath: priorRegisterPath,
      includeRuleOutcomeEnvelopeEvidence: false
    });
    writeFileSync(
      path.join(prior.archiveRoot, "fp_evaluate_result.json"),
      `${JSON.stringify(fpEvaluateResultPayloadForRegister(priorRegisterPath), null, 2)}\n`,
      "utf8"
    );
    writePriorWorkerResultReport({ manifest: prior, content: priorContent });

    const current = manifestForEdge({
      workspaceRoot,
      runId: "20260523T000000011Z_pid20302",
      graphFunctionName,
      edgeName: "derive_lite_component_code_surface"
    });
    const admission = admitImplementationDesignRegisterForManifest({
      manifest: current
    });

    assert.equal(admission.status, "admitted");
    assert.ok(
      admission.evidenceRefs.some((ref) =>
        ref.endsWith("/design_depth_fp_evaluator_rule_outcome.json")
      ),
      JSON.stringify(admission.evidenceRefs, null, 2)
    );

    const invocationPackage = constructWorkerInvocationPackage({ manifest: current });
    const expectedSourceTarget = `${current.productMaterialization.selectedOutputRoot}/src/fp-live-ordering.js`;
    assert.ok(
      invocationPackage.outputContract.declaredProductFileTargets.includes(
        expectedSourceTarget
      ),
      JSON.stringify(invocationPackage.outputContract, null, 2)
    );
    assert.ok(
      invocationPackage.outputContract.declaredProductTargetContracts.some(
        (contract) =>
          contract.path === expectedSourceTarget &&
          contract.requiredRole === "source"
      ),
      JSON.stringify(invocationPackage.outputContract, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-203 component-code targets admit predecessor evaluator register from persisted rule outcome without runtime events", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const graphFunctionName = "Fg_t203_product";
    const prior = manifestForEdge({
      workspaceRoot,
      runId: "20260523T000000012Z_pid20303",
      graphFunctionName,
      edgeName: "derive_lite_design_adr_surface"
    });
    writeHandoffFiles(prior);
    mkdirSync(path.dirname(prior.outputFile), { recursive: true });
    const priorContent = implementationDesignAdr("fp-live-no-runtime-events");
    writeFileSync(prior.outputFile, priorContent, "utf8");
    const priorRegisterPath = designDepthFpEvaluatorRegisterPath(prior);
    mkdirSync(path.dirname(priorRegisterPath), { recursive: true });
    writeFileSync(
      priorRegisterPath,
      `${JSON.stringify(
        implementationDesignRegister(
          "fp-live-no-runtime-events",
          pathToFileURL(prior.outputFile).href
        ),
        null,
        2
      )}\n`,
      "utf8"
    );
    writeDesignDepthFpEvaluatorContentRegister({
      manifest: prior,
      registerPath: priorRegisterPath
    });
    writeDesignDepthFpEvaluatorRuleOutcomeProof({
      manifest: prior,
      registerPath: priorRegisterPath
    });
    rmSync(path.join(prior.archiveRoot, "runtime_events.json"), { force: true });
    writeFileSync(
      path.join(prior.archiveRoot, "fp_evaluate_result.json"),
      `${JSON.stringify(fpEvaluateResultPayloadForRegister(priorRegisterPath), null, 2)}\n`,
      "utf8"
    );
    writePriorWorkerResultReport({ manifest: prior, content: priorContent });

    const current = manifestForEdge({
      workspaceRoot,
      runId: "20260523T000000013Z_pid20304",
      graphFunctionName,
      edgeName: "derive_lite_component_code_surface"
    });
    const admission = admitImplementationDesignRegisterForManifest({
      manifest: current
    });

    assert.equal(admission.status, "admitted");
    assert.ok(
      admission.evidenceRefs.some((ref) =>
        ref.endsWith("/design_depth_fp_evaluator_rule_outcome.json")
      ),
      JSON.stringify(admission.evidenceRefs, null, 2)
    );
    assert.equal(
      admission.evidenceRefs.some((ref) => ref.endsWith("/runtime_events.json")),
      false
    );

    const invocationPackage = constructWorkerInvocationPackage({ manifest: current });
    const expectedSourceTarget = `${current.productMaterialization.selectedOutputRoot}/src/fp-live-no-runtime-events.js`;
    assert.ok(
      invocationPackage.outputContract.declaredProductFileTargets.includes(
        expectedSourceTarget
      ),
      JSON.stringify(invocationPackage.outputContract, null, 2)
    );
    const constructionBrief = constructWorkerConstructionBrief({
      manifest: current,
      constructionBriefPath: path.join(
        current.archiveRoot,
        "worker_construction_brief.json"
      ),
      invocationPackage
    });
    assert.ok(
      constructionBrief.stagePressure.designDepthEvaluatorRegisterRefs.some((ref) =>
        ref.endsWith("/design_depth_fp_evaluator_register.json")
      ),
      JSON.stringify(constructionBrief.stagePressure, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 framework-smoke component-code prompt preserves downstream test execution", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const current = manifestForEdge({
      workspaceRoot,
      runId: "20260523T000000002Z_pid18104",
      graphFunctionName: FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE,
      edgeName: "derive_lite_component_code_surface"
    });
    const prompt = promptForHandoff(current);

    assert.match(
      prompt,
      /For framework-smoke Min\(F_P\) component_code_surface, materialize the source product files declared by the admitted F_P design-depth register and stagePressure\. Preserve the declared test execution contract for downstream derive_test_execution_result_surface; do not run it on the component-code edge/u
    );
    assert.doesNotMatch(
      prompt,
      /When admitted design authority declares role=test product targets for this edge, run the declared test execution contract before returning/u
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 component-code edge accepts implementation-design evaluator register across graph functions", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const prior = manifestForImplementationDesign(
      workspaceRoot,
      "20260523T000000003Z_pid18105"
    );
    writeHandoffFiles(prior);
    mkdirSync(path.dirname(prior.outputFile), { recursive: true });
    const priorContent = implementationDesignAdr("fp-cross-edge");
    writeFileSync(prior.outputFile, priorContent, "utf8");
    const priorRegisterPath = designDepthFpEvaluatorRegisterPath(prior);
    mkdirSync(path.dirname(priorRegisterPath), { recursive: true });
    writeFileSync(
      priorRegisterPath,
      `${JSON.stringify(
        implementationDesignRegister(
          "fp-cross-edge",
          pathToFileURL(prior.outputFile).href
        ),
        null,
        2
      )}\n`,
      "utf8"
    );
    writeDesignDepthFpEvaluatorContentRegister({
      manifest: prior,
      registerPath: priorRegisterPath
    });
    writeDesignDepthFpEvaluatorRuleOutcomeProof({
      manifest: prior,
      registerPath: priorRegisterPath
    });
    writeFileSync(
      path.join(prior.archiveRoot, "fp_evaluate_result.json"),
      `${JSON.stringify(
        fpEvaluateResultPayloadForRegister(priorRegisterPath),
        null,
        2
      )}\n`,
      "utf8"
    );
    writePriorWorkerResultReport({ manifest: prior, content: priorContent });

    const current = manifestForEdge({
      workspaceRoot,
      runId: "20260523T000000004Z_pid18106",
      graphFunctionName: "derive_component_code_surface",
      edgeName: "derive_component_code_surface"
    });

    assert.notEqual(current.graphFunctionName, prior.graphFunctionName);
    assert.deepEqual(current.inputAssetTypes, ["implementation_design_surface"]);

    const invocationPackage = constructWorkerInvocationPackage({ manifest: current });
    const constructionBrief = constructWorkerConstructionBrief({
      manifest: current,
      constructionBriefPath: path.join(
        current.archiveRoot,
        "worker_construction_brief.json"
      ),
      invocationPackage
    });

    assert.ok(
      constructionBrief.stagePressure.designDepthEvaluatorRegisterRefs.some((ref) =>
        ref.endsWith("/design_depth_fp_evaluator_register.json")
      ),
      JSON.stringify(constructionBrief.stagePressure, null, 2)
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 analyzer uses runtime admission for evaluator sidecar", () => {
  const workspaceRoot = makeWorkspace();
  try {
    const manifest = manifestForImplementationDesign(
      workspaceRoot,
      "20260523T000000002Z_pid18103"
    );
    mkdirSync(manifest.archiveRoot, { recursive: true });
    writeFileSync(
      path.join(manifest.archiveRoot, "design_depth_fp_evaluator_register.json"),
      implementationDesignAdr("markdown-sidecar"),
      "utf8"
    );

    const carriers = readOperatorRunCarriers(manifest.archiveRoot);
    const sidecar =
      carriers.artifactStateByRef[
        "operator-run-artifact://design-depth-fp-evaluator-register"
      ];

    assert.equal(sidecar.status, "malformed");
    assert.match(sidecar.detail, /design_depth_register_json_required/u);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-181 installed operator declares an F_P evaluation rule for register population", () => {
  const source = readRepoFile("build_tenants/typescript/code/src/operator/installed_operator.ts");
  const handoffSource = readRepoFile("build_tenants/typescript/code/src/operator/plugins/transform/launch_contract.ts");
  const promptEdgePolicySource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/prompt_edge_policy.ts"
  );
  const operatorIndex = readRepoFile("build_tenants/typescript/code/src/operator/index.ts");
  const evaluatePluginSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/index.ts"
  );
  const evaluatePostflightSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/postflight.ts"
  );
  const evaluateDesignDepthSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/design_depth_register.ts"
  );
  const evaluatorPromptSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/prompts.ts"
  );
  const pluginContractsSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/plugin_contracts.ts"
  );
  const pluginSetSource = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/plugin_set.ts"
  );
  const runtimePolicySource = readRepoFile(
    "build_tenants/typescript/code/src/operator/runtime_policy.ts"
  );

  assert.match(source, /DESIGN_DEPTH_FP_EVALUATOR_RULE_REF/u);
  assert.match(pluginContractsSource, /function designDepthFpEvaluatorRuleContract\(\)/u);
  assert.match(pluginContractsSource, /outputCarrier: "SdlcDesignDepthRegister"/u);
  assert.match(pluginContractsSource, /computeStageRole: "evaluate"/u);
  assert.match(pluginContractsSource, /computeMeans: "F_P"/u);
  assert.match(pluginSetSource, /evaluationRules: Object\.freeze\(\[/u);
  assert.match(pluginSetSource, /requiredEvaluationRuleRefs: Object\.freeze\(\[/u);
  assert.match(pluginSetSource, /REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF/u);
  assert.doesNotMatch(source, /function designDepthFpEvaluatorRuleContract\(\)/u);
  assert.doesNotMatch(source, /evaluationRules: Object\.freeze/u);
  assert.match(evaluatorPromptSource, /Do not start background jobs/u);
  assert.match(
    evaluatorPromptSource,
    /Do not execute a generated product, service, test, or script unless the active tool list explicitly exposes command execution/u
  );
  assert.match(evaluatorPromptSource, /Do not use shell job-control cleanup such as `kill %1`/u);
  assert.match(evaluatorPromptSource, /A passed assessment is invalid if a spawned process remains live/u);
  assert.doesNotMatch(source, /designDepthFpEvaluatorRuleEnabled/u);
  assert.doesNotMatch(handoffSource, /designDepthFpEvaluatorRegistersEnabled/u);
  assert.doesNotMatch(handoffSource, /allowLegacyImplementationDesignDerivation/u);
  assert.doesNotMatch(handoffSource, /allowLegacyDerivation/u);
  assert.doesNotMatch(handoffSource, /node\/javascript/u);
  assert.doesNotMatch(handoffSource, /SBT\/JDK/u);
  assert.doesNotMatch(handoffSource, /java\.security\.manager/u);
  assert.doesNotMatch(operatorIndex, /admitImplementationDesignRegisterForManifest/u);
  assert.match(operatorIndex, /evaluateSdlcComputeStage/u);
  assert.match(operatorIndex, /SDLC_EVALUATE_C_PLUGIN_SURFACE/u);
  assert.doesNotMatch(operatorIndex, /export \* from "\.\/plugins\/evaluate\/index\.js"/u);
  assert.doesNotMatch(operatorIndex, /export \* from "\.\/handoff\.js"/u);
  assert.match(evaluatePluginSource, /SDLC_EVALUATE_C_PLUGIN_SURFACE/u);
  assert.match(evaluatePluginSource, /evaluateSdlcComputeStage/u);
  assert.doesNotMatch(
    evaluatePluginSource,
    /admitImplementationDesignRegisterForManifest/u
  );
  assert.doesNotMatch(
    evaluatePluginSource,
    /admitImplementationDesignRegisterCandidateForManifest/u
  );
  assert.match(evaluatePostflightSource, /export function evaluateSdlcComputeStage/u);
  assert.match(evaluatePostflightSource, /export function constructSdlcFpEvaluateResult/u);
  assert.match(evaluatePostflightSource, /export function writeSdlcFpEvaluateResult/u);
  assert.doesNotMatch(evaluatePluginSource, /evaluateWorkerResultPostflight/u);
  assert.doesNotMatch(evaluatePluginSource, /constructFpEvaluateResult/u);
  assert.doesNotMatch(evaluatePluginSource, /writeFpEvaluateResult/u);
  assert.doesNotMatch(handoffSource, /export function evaluateWorkerResultPostflight/u);
  assert.doesNotMatch(handoffSource, /export function constructFpEvaluateResult/u);
  assert.doesNotMatch(handoffSource, /export function writeFpEvaluateResult/u);
  assert.doesNotMatch(handoffSource, /function evaluateWorkerResultPostflight/u);
  assert.doesNotMatch(handoffSource, /function constructFpEvaluateResult/u);
  assert.doesNotMatch(handoffSource, /function writeFpEvaluateResult/u);
  assert.doesNotMatch(handoffSource, /export function evaluateSdlcComputeStage/u);
  assert.doesNotMatch(handoffSource, /export function constructSdlcFpEvaluateResult/u);
  assert.doesNotMatch(handoffSource, /export function writeSdlcFpEvaluateResult/u);
  assert.doesNotMatch(handoffSource, /function evaluateSdlcComputeStage/u);
  assert.doesNotMatch(handoffSource, /function constructSdlcFpEvaluateResult/u);
  assert.doesNotMatch(handoffSource, /function writeSdlcFpEvaluateResult/u);
  assert.match(source, /from "\.\/plugins\/evaluate\/index\.js"/u);
  assert.doesNotMatch(
    /import \{[\s\S]*evaluateSdlcComputeStage[\s\S]*\} from "\.\/handoff\.js"/u.exec(source)?.[0] ?? "",
    /evaluateSdlcComputeStage/u
  );
  assert.doesNotMatch(
    /import \{[\s\S]*evaluateWorkerResultPostflight[\s\S]*\} from "\.\/handoff\.js"/u.exec(source)?.[0] ?? "",
    /evaluateWorkerResultPostflight/u
  );
  assert.doesNotMatch(
    readRepoFile("build_tenants/typescript/code/src/operator/design_depth_register.ts"),
    /allowMarkdownDerivation/u
  );
  assert.match(evaluatorPromptSource, /Allowed componentTopologyRows\[\]\.concernRole values/u);
  assert.match(evaluatorPromptSource, /concernRole must be one of the allowed values exactly/u);
  assert.match(evaluatorPromptSource, /Do not turn test, proof-test, package, runtime-config/u);
  assert.match(evaluatorPromptSource, /fileTargetRows to materialized product file roles/u);
  assert.match(evaluatorPromptSource, /A source row marked deferred is still a materialized product target/u);
  assert.match(evaluatorPromptSource, /Do not collapse the register to manifest-only/u);
  assert.match(evaluatorPromptSource, /Staged decomposition admission is mandatory/u);
  assert.match(evaluatorPromptSource, /must own no more than 8 requirementIds/u);
  assert.match(evaluatorPromptSource, /split it into multiple component rows/u);
  assert.match(evaluatorPromptSource, /component-row pressure density remains 8 or less/u);
  assert.match(evaluatorPromptSource, /Keep upstreamComponentIds as component ids only/u);
  assert.match(evaluatorPromptSource, /Register size budget is part of correctness/u);
  assert.match(evaluatorPromptSource, /bounded pressure map, not an exhaustive copy/u);
  assert.match(evaluatorPromptSource, /Do not derive one component per requirement/u);
  assert.match(evaluatorPromptSource, /20 to 32 componentTopologyRows\/componentRealizationRows/u);
  assert.match(evaluatorPromptSource, /no more than 16 aggregate entities/u);
  assert.match(evaluatorPromptSource, /no more than 24 aggregate operations/u);
  assert.match(evaluatorPromptSource, /no more than 18 steps/u);
  assert.match(evaluatorPromptSource, /3 to 8 local\/high-signal requirementIds per component row/u);
  assert.match(evaluatorPromptSource, /Do not repeat the same large requirement id list/u);
  assert.match(evaluatorPromptSource, /Do not print, cat, tail, grep, or paste full authority files into stdout/u);
  assert.match(evaluatorPromptSource, /Do not display worker_invocation_package\.json/u);
  assert.match(evaluatorPromptSource, /Do not use command helpers to display the five primary inputs/u);
  assert.match(evaluatorPromptSource, /use Read offset\/limit and inspect only bounded line ranges/u);
  assert.match(evaluatorPromptSource, /The content register path is the durable evaluation artifact/u);
  assert.match(evaluatorPromptSource, /system pre-creates that path as a non-admitted draft/u);
  assert.match(evaluatorPromptSource, /not a single-shot JSON response/u);
  assert.match(evaluatorPromptSource, /Agentic F_P work loop/u);
  assert.match(evaluatorPromptSource, /After the first evaluator update exists, write a short plan and checklist/u);
  assert.match(evaluatorPromptSource, /update the draft content register before doing deep exploratory review/u);
  assert.match(evaluatorPromptSource, /Do not use the Read tool on the handoff manifest/u);
  assert.match(evaluatorPromptSource, /Precomputed worker result report summary/u);
  assert.match(evaluatorPromptSource, /Do not inspect the worker result report/u);
  assert.match(evaluatorPromptSource, /Do not use the Read tool on the worker invocation package/u);
  assert.match(evaluatorPromptSource, /Do not run any bounded-summary action before the first evaluator update/u);
  assert.match(evaluatorPromptSource, /the next tool action must publish the content register update/u);
  assert.match(evaluatorPromptSource, /before any ADR summary, worker-report inspection, source-authority lookup/u);
  assert.doesNotMatch(evaluatorPromptSource, /At most one bounded summary script is allowed/u);
  assert.match(evaluatorPromptSource, /the next tool action must publish the content register update/u);
  assert.match(evaluatorPromptSource, /Do not say .*writing the register.* until that file write has succeeded/u);
  assert.doesNotMatch(evaluatorPromptSource, /Use the provided .*seed script/u);
  assert.doesNotMatch(evaluatorPromptSource, /First register materialization recipe/u);
  assert.doesNotMatch(evaluatorPromptSource, /parses the ADR component topology table/u);
  assert.doesNotMatch(evaluatorPromptSource, /designDepthFpEvaluatorSeedScript/u);
  assert.doesNotMatch(evaluatorPromptSource, /design_depth_fp_evaluator_seed_register/u);
  assert.doesNotMatch(evaluatorPromptSource, /moduleName\.startsWith\("cdme-"\)/u);
  assert.doesNotMatch(evaluatorPromptSource, /src\/main\/scala/u);
  assert.doesNotMatch(evaluatorPromptSource, /stack:scala-spark-sbt/u);
  assert.doesNotMatch(evaluatorPromptSource, /model:cdme-data-mapper/u);
  assert.match(evaluatorPromptSource, /First register materialization rule/u);
  assert.match(evaluatorPromptSource, /selected evaluate\.C\/F_P semantic pressure map/u);
  assert.doesNotMatch(evaluatorPromptSource, /Exact first update command pattern/u);
  assert.doesNotMatch(evaluatorPromptSource, /Exact second update command pattern/u);
  assert.doesNotMatch(evaluatorPromptSource, /node --input-type=module/u);
  assert.doesNotMatch(evaluatorPromptSource, /await rename\(tmp, file\)/u);
  assert.doesNotMatch(evaluatorPromptSource, /tableRows|sectionText/u);
  assert.match(evaluatorPromptSource, /no framework-authored recipe for deriving register rows/u);
  assert.match(evaluatorPromptSource, /the row values are your evaluation/u);
  assert.match(evaluatorPromptSource, /F_D does not construct semantic register rows/u);
  assert.match(evaluatorPromptSource, /mandatory bounded target-path reconciliation pass/u);
  assert.match(evaluatorPromptSource, /If those sources name exact product paths, the final register must preserve those exact paths/u);
  assert.match(evaluatorPromptSource, /Do not deterministically construct later semantic register rows/u);
  assert.match(evaluatorPromptSource, /Do not spend the run enumerating every requirement id before writing the register/u);
  assert.match(evaluatorPromptSource, /Draft-row timeout is worse than an admitted pressure map/u);
  assert.match(
    evaluatorPromptSource,
    /Command-helper output budget before first evaluator update: if the active tool profile exposes command helpers/u
  );
  assert.match(
    evaluatorPromptSource,
    /the only pre-update helper allowed is the named carrier-helper update or equivalent same-path temp-then-rename implementation/u
  );
  assert.match(
    evaluatorPromptSource,
    /it may print only compact row counts/u
  );
  assert.match(
    evaluatorPromptSource,
    /do not run product, build, test, framework, traversal, or background commands/u
  );
  assert.match(evaluatorPromptSource, /named carrier-helper update/u);
  assert.match(evaluatorPromptSource, /First-update carrier helper contract/u);
  assert.match(evaluatorPromptSource, /DESIGN_DEPTH_DRAFT_FRAGMENT_UPDATE_HELPER_CONTRACT_REF/u);
  assert.match(evaluatorPromptSource, /Bounded first-pass register target/u);
  assert.match(evaluatorPromptSource, /It is acceptable to rewrite the content register multiple times while converging/u);
  assert.match(evaluatorPromptSource, /Stdout is an agent work trace, not evaluation truth/u);
  assert.match(evaluatorPromptSource, /compressed work-category governance/u);
  assert.match(source, /selectSdlcWorkCategoryGovernance/u);
  assert.match(evaluatorPromptSource, /Durable evaluation artifact to create and validate/u);
  assert.match(evaluatorPromptSource, /partial or blocked designCompletenessVerdict axes/u);
  assert.match(source, /sdlcOperatorRuntimePolicy/u);
  assert.match(runtimePolicySource, /operator-runtime-policy\.json/u);
  assert.match(runtimePolicySource, /ODD_SDLC_DESIGN_DEPTH_FP_EVALUATOR_TIMEOUT_MS/u);
  assert.match(
    runtimePolicySource,
    /ODD_SDLC_DESIGN_DEPTH_FP_EVALUATOR_STDOUT_BUDGET_BYTES/u
  );
  assert.match(source, /stdoutBudgetBytes/u);
  assert.match(evaluatorPromptSource, /write the content register file first, then validate that file/u);
  assert.match(evaluatorPromptSource, /highest semantic design-depth truth/u);
  assert.match(evaluatorPromptSource, /sdlc_evaluate_content_register/u);
  assert.match(evaluatorPromptSource, /contentRows\[\]\.rowRef/u);
  assert.match(evaluatorPromptSource, /contentRows\[\]\.sourceBasisRefs\[\]/u);
  assert.match(evaluatorPromptSource, /contentRows\[\]\.evidenceRefs\[\]/u);
  assert.match(evaluatorPromptSource, /contentRows\[\] are the incremental register/u);
  assert.match(evaluatorPromptSource, /sdlc_design_depth_register_fragment/u);
  assert.match(evaluatorPromptSource, /F_D assembles admitted fragment rows/u);
  assert.match(evaluatorPromptSource, /at least one fragment for every listed register section/u);
  assert.doesNotMatch(
    evaluatorPromptSource,
    /contentRows\[0\]\.payload must be the full design-depth register object/u
  );
  assert.match(
    evaluatorPromptSource,
    /preserve that executable-entrypoint obligation in publicBoundary/u
  );
  assert.match(evaluatorPromptSource, /Evaluate the workspace, admitted transform evidence/u);
  assert.match(evaluatorPromptSource, /compact pressure map from design state A to implementation state B/u);
  assert.match(evaluatorPromptSource, /Nested closed-object contract/u);
  assert.match(evaluatorPromptSource, /Do not use string shorthand for typed rows/u);
  assert.match(evaluatorPromptSource, /moduleSchemaFragments\[\]\.entities\[\] must contain closed sdlc_domain_entity objects/u);
  assert.match(evaluatorPromptSource, /sdlc_domain_entity\.invariants must be a string array/u);
  assert.match(evaluatorPromptSource, /Structured invariant objects are invalid/u);
  assert.match(evaluatorPromptSource, /moduleSchemaFragments\[\]\.operations\[\] and aggregateDomainModel\.operations\[\] must contain closed sdlc_domain_operation objects/u);
  assert.match(evaluatorPromptSource, /aggregateDomainModel\.entities\[\]\.attributes\[\] must contain full closed sdlc_domain_attribute objects/u);
  assert.match(evaluatorPromptSource, /never emit attribute id strings, names, or summaries in this array/u);
  assert.match(evaluatorPromptSource, /aggregateDomainModel\.modelVersion must be exactly "ts-design-depth-v1"/u);
  assert.match(evaluatorPromptSource, /aggregateSunnyDaySequence\.sequenceVersion must be exactly "ts-design-depth-v1"/u);
  assert.match(evaluatorPromptSource, /verdictVersion must be exactly "ts-design-depth-v1"/u);
  assert.match(evaluatorPromptSource, /designCompletenessVerdict is a closed object with exactly kind, verdictVersion, entity, attribute, flow/u);
  assert.match(evaluatorPromptSource, /Do not emit entityAxis, attributeAxis, flowAxis, axisVerdicts/u);
  assert.match(evaluatorPromptSource, /Each designCompletenessVerdict axis object is closed with exactly kind \\"sdlc_design_completeness_axis_verdict\\", axis, status, reasons, evidenceRefs/u);
  assert.match(evaluatorPromptSource, /Allowed designCompletenessVerdict\.\*\.status values/u);
  assert.match(evaluatorPromptSource, /Use "satisfied" for a complete axis; never use "complete"/u);
  assert.match(evaluatorPromptSource, /re-open the JSON you wrote and verify that every typed nested item above is an object/u);
  assert.match(evaluatorPromptSource, /bounded path-integrity self-check/u);
  assert.match(evaluatorPromptSource, /structural validity alone is not enough if exact product file paths drift/u);
  assert.match(evaluatorPromptSource, /must not appear in componentTopologyRows or componentRealizationRows merely to satisfy the source-row rule/u);
  assert.match(evaluatorPromptSource, /Required self-check before final response/u);
  assert.match(evaluatorPromptSource, /Self-check contentRows\[\] entries: exactly kind, rowRef, authorityFunction/u);
  assert.match(evaluatorPromptSource, /fragmentVersion, targetAssetType, section, sequence, mergeMode, value/u);
  assert.match(evaluatorPromptSource, /Self-check non-null aggregateDomainModel\.modelVersion/u);
  assert.match(evaluatorPromptSource, /aggregateDomainModel\.modelVersion/u);
  assert.match(evaluatorPromptSource, /Self-check every moduleSchemaFragments\[\] item: exactly kind, moduleName, entities, operations, requirementIds, sourceAssetRefs/u);
  assert.match(evaluatorPromptSource, /kind must be exactly \\"sdlc_module_schema_fragment\\"/u);
  assert.match(evaluatorPromptSource, /Self-check non-null designCompletenessVerdict keys: exactly attribute, entity, flow, kind, verdictVersion/u);
  assert.match(evaluatorPromptSource, /Self-check each designCompletenessVerdict axis object: exactly axis, evidenceRefs, kind, reasons, status/u);
  assert.match(evaluatorPromptSource, /Self-check moduleSchemaFragments\[\]\.entities\[\]\.invariants: array of strings/u);
  assert.match(evaluatorPromptSource, /Self-check register arrays contain objects, not strings/u);
  assert.match(evaluatorPromptSource, /Self-check nested register arrays contain objects, not strings/u);
  assert.match(evaluatorPromptSource, /Do not mark an axis partial or blocked merely because/u);
  assert.doesNotMatch(
    readRepoFile("build_tenants/typescript/code/src/operator/design_depth_register.ts"),
    /component_realization_source_file_target_missing/u
  );
  assert.match(source, /function shouldDeferDispatchConsequenceToFpEvaluator/u);
  assert.match(source, /\? null\s*:\s*publishDispatchState\(current\)/u);
  assert.match(source, /dispatchState\.current = current/u);
  assert.match(source, /ABG process actor invocation requires actor ref/u);
  assert.doesNotMatch(source, /fallbackStageRole/u);
  assert.match(source, /designDepthFpEvaluatorAdmissionEvidenceByArchiveRoot/u);
  assert.match(
    source,
    /const ruleOutcomeRef = writeDesignDepthFpEvaluatorRuleOutcomeProof\(\{\s*manifest: dispatchState\.current\.manifest,\s*outcome\s*\}\);\s*if \(outcome\.status === "accepted"\)/su
  );
  assert.match(source, /design-depth evaluator rule not applicable to non-design edge/u);
  assert.doesNotMatch(source, /design-depth evaluator rule selected for non-design edge/u);
  assert.doesNotMatch(handoffSource, /latestDesignDepthFpEvaluatorRegisterPath/u);
  assert.match(evaluateDesignDepthSource, /source_asset:implementation_design_surface/u);
  assert.match(evaluateDesignDepthSource, /design_depth_fp_evaluator_register_unadmitted/u);
  assert.match(evaluateDesignDepthSource, /export function admitImplementationDesignRegisterForManifest/u);
  assert.doesNotMatch(handoffSource, /export function admitImplementationDesignRegisterForManifest/u);
  assert.match(promptEdgePolicySource, /stagePressure\.designDepthEvaluatorRegisterRefs/u);
});

test("T-181 evaluator artifacts are cataloged operator-run truth", () => {
  const rowsByPath = new Map(
    SDLC_OPERATOR_RUN_ARTIFACT_CATALOG.map((row) => [row.relativePath, row])
  );
  const expected = [
    "design_depth_fp_evaluator_run.json",
    "design_depth_fp_evaluator_content_register.json",
    "design_depth_fp_evaluator_rule_outcome.json",
    "design_depth_fp_evaluator_register.json",
    "design_depth_fp_evaluator_prompt.md",
    "design_depth_fp_evaluator_stdout.log",
    "design_depth_fp_evaluator_stderr.log",
    "design_depth_fp_evaluator_last_message.txt",
    "design_depth_fp_evaluator_process_started.json",
    "design_depth_fp_evaluator_process_events.jsonl",
    "fp_evaluator_postflight.json"
  ];

  for (const relativePath of expected) {
    assert.ok(rowsByPath.has(relativePath), `${relativePath} has catalog row`);
  }

  assert.equal(
    rowsByPath.get("design_depth_fp_evaluator_content_register.json").carrierKind,
    "sdlc_evaluate_content_register"
  );
  assert.equal(
    rowsByPath.get("design_depth_fp_evaluator_content_register.json").sourceOwner,
    "fp_evaluator"
  );
  assert.equal(
    rowsByPath.get("design_depth_fp_evaluator_rule_outcome.json").carrierKind,
    "evaluation_rule_outcome"
  );
  assert.equal(
    rowsByPath.get("design_depth_fp_evaluator_rule_outcome.json").sourceOwner,
    "fp_evaluator"
  );
  assert.equal(
    rowsByPath.get("design_depth_fp_evaluator_register.json").carrierKind,
    "sdlc_design_depth_register"
  );
  assert.equal(
    rowsByPath.get("design_depth_fp_evaluator_register.json").sourceOwner,
    "fp_evaluator"
  );
  assert.equal(
    rowsByPath.get("design_depth_fp_evaluator_process_events.jsonl").carrierKind,
    "jsonl:runtime_event"
  );
});
