// Validates: T-113

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  admitComponentDepthRegisterFromArtifact,
  deriveComponentDepthAssuranceLedger,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  promptForHandoff,
  sdlcTargetCarrierContractRef,
  sdlcTargetCarrierOutputKind,
  sha256Text
} from "../../build/semantic/code/src/index.js";

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t113-workspace-"));
  mkdirSync(path.join(root, "specification"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(path.join(root, "README.md"), "# T-113 Fixture\n", "utf8");
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nINT-T113: Prove component-depth carrier admission.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    "# Requirements\n\nREQ-T113-001: Materialized component files satisfy typed component rows.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t113_fixture",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: scala",
      "    build_tool: sbt"
    ].join("\n"),
    "utf8"
  );
  mkdirSync(path.join(root, "build_tenants/scala_spark/spec"), {
    recursive: true
  });
  writeFileSync(
    path.join(root, "build_tenants/scala_spark/spec/TECH_STACK.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language: "Scala",
        buildTool: "sbt",
        sourceTargets: ["build_tenants/scala_spark/src/main/scala/generated/Core.scala"],
        testFiles: ["build_tenants/scala_spark/src/test/scala/generated/CoreSpec.scala"]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function writeArtifact(register, name = register.targetAssetType) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t113-"));
  const outputFile = path.join(root, `${name}.md`);
  const content = `${JSON.stringify(register, null, 2)}\n`;
  mkdirSync(path.dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, content, "utf8");
  return { outputFile, content };
}

function componentDepthEdgeRefForTarget(targetAssetType) {
  switch (targetAssetType) {
    case "component_code_surface":
      return "derive_component_code_surface";
    case "component_realization_qualification_surface":
      return "qualify_component_realization_surface";
    case "component_test_surface":
      return "derive_component_test_surface";
    case "uat_test_source_surface":
      return "derive_lite_uat_test_source_surface";
    case "component_test_qualification_surface":
      return "qualify_component_test_execution_surface";
    case "component_repair_schedule_surface":
      return "derive_component_repair_schedule_surface";
    case "release_depth_parity_surface":
      return "derive_release_depth_parity_surface";
    default:
      throw new TypeError(`Unsupported component-depth target ${targetAssetType}`);
  }
}

function componentDepthTargetCarrierFor(register, edgeRefOverride = null) {
  const edgeRef =
    edgeRefOverride ?? componentDepthEdgeRefForTarget(register.targetAssetType);
  return {
    kind: sdlcTargetCarrierOutputKind(register.targetAssetType),
    targetAssetType: register.targetAssetType,
    edgeRef,
    contractRef: sdlcTargetCarrierContractRef({
      edgeRef,
      targetAssetType: register.targetAssetType
    }),
    contractDigest: sha256Text(JSON.stringify({
      edgeRef,
      targetAssetType: register.targetAssetType,
      payloadKind: register.kind
    })),
    payload: register
  };
}

function writeCarrierArtifact(register, name = register.targetAssetType) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t113-"));
  const outputFile = path.join(root, `${name}.json`);
  const carrier = componentDepthTargetCarrierFor(register);
  const content = `${JSON.stringify(carrier, null, 2)}\n`;
  mkdirSync(path.dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, content, "utf8");
  return { outputFile, content };
}

function writeMarkdownCarrierArtifact(register, name = register.targetAssetType) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t113-"));
  const outputFile = path.join(root, `${name}.md`);
  const carrier = componentDepthTargetCarrierFor(register);
  const content = [
    `# ${name}`,
    "",
    "```json component_depth_register",
    JSON.stringify(carrier, null, 2),
    "```",
    ""
  ].join("\n");
  mkdirSync(path.dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, content, "utf8");
  return { outputFile, content };
}

function writePlainFenceLabeledCarrierArtifact(register, name = register.targetAssetType) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t113-"));
  const outputFile = path.join(root, `${name}.md`);
  const carrier = componentDepthTargetCarrierFor(register);
  const content = [
    `# ${name}`,
    "",
    "```",
    "json component_depth_register",
    JSON.stringify(carrier, null, 2),
    "```",
    ""
  ].join("\n");
  mkdirSync(path.dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, content, "utf8");
  return { outputFile, content };
}

function writeTargetCarrierSectionArtifact(
  register,
  name = register.targetAssetType,
  edgeRefOverride = null
) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t113-"));
  const outputFile = path.join(root, `${name}.md`);
  const carrier = componentDepthTargetCarrierFor(register, edgeRefOverride);
  const content = [
    `# ${name}`,
    "",
    "## Target Carrier",
    "",
    JSON.stringify(carrier),
    ""
  ].join("\n");
  mkdirSync(path.dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, content, "utf8");
  return { outputFile, content };
}

function writeUnfencedEmbeddedCarrierArtifact(
  register,
  name = register.targetAssetType,
  edgeRefOverride = null
) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t113-"));
  const outputFile = path.join(root, `${name}.md`);
  const carrier = componentDepthTargetCarrierFor(register, edgeRefOverride);
  const content = [
    `# ${name}`,
    "",
    "The prose surface can precede the selected target carrier.",
    "",
    JSON.stringify(carrier, null, 2),
    ""
  ].join("\n");
  mkdirSync(path.dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, content, "utf8");
  return { outputFile, content };
}

function reportFor(outputFile, content, manifest, materializedFiles = []) {
  return {
    kind: "odd_sdlc.worker_result_report",
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile,
    digest: sha256Text(content),
    summary: "T-113 component-depth admission fixture",
    unresolvedReasons: [],
    materializedFiles,
    materializationDiagnostics: [],
    executionEvidence: null,
    executionEvidenceErrors: [],
    obligationAssessments: [],
    fpTransformRequestRef: null,
    fpTransformResultRef: null,
    fpTransformStatusSnapshot: null,
    fpEvaluateResultRef: null
  };
}

function materializeSourceFile(manifest, relativePath, content) {
  return materializeProductFile(manifest, "source", relativePath, content);
}

function materializeProductFile(manifest, role, relativePath, content) {
  const absolutePath = path.join(manifest.productMaterialization.tenantRoot, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
  return {
    kind: "sdlc_materialized_product_file",
    role,
    relativePath,
    absolutePath,
    digest: sha256Text(content),
    byteCount: Buffer.byteLength(content, "utf8"),
    materializationSource: "current_attempt"
  };
}

function componentRow() {
  return {
    kind: "sdlc_component_realization_row",
    componentId: "cmp.compiler.ir",
    moduleName: "cdme-compiler",
    relativePath: "cdme-compiler/src/main/scala/cdme/compiler/ir/package.scala",
    publicBoundary: "package_internal",
    trancheId: "tranche:foundation-ir",
    firstProductFileToChange:
      "cdme-compiler/src/main/scala/cdme/compiler/ir/package.scala",
    upstreamComponentIds: [],
    requirementIds: ["REQ-TYP-001"],
    sourceAssetRefs: ["asset://implementation_design_surface"]
  };
}

test("T-113 admits production-shaped component realization rows on current component targets", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 9,
    contract,
    runId: "t113-component-depth"
  });
  const row = componentRow();
  const materializedFile = materializeSourceFile(
    manifest,
    row.relativePath,
    "package cdme.compiler.ir\n\nfinal case class IrNode(id: String)\n"
  );
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_code_surface",
    componentRealizationRows: [row]
  };
  const { outputFile, content } = writeArtifact(register);

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_code_surface",
    outputFile
  });
  assert.equal(admission.status, "admitted");
  assert.equal(admission.register.componentRealizationRows.length, 1);
  assert.equal(
    admission.register.componentRealizationRows[0].firstProductFileToChange,
    "cdme-compiler/src/main/scala/cdme/compiler/ir/package.scala"
  );

  const ledger = deriveComponentDepthAssuranceLedger({
    manifest,
    report: reportFor(outputFile, content, manifest, [materializedFile])
  });
  assert(ledger);
  assert.equal(ledger.reasons.length, 0);
});

test("T-188 component-code prompt publishes topology row fields required by admission", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 9,
    contract,
    runId: "t188-component-code-prompt"
  });

  const prompt = promptForHandoff(manifest);
  assert.match(
    prompt,
    /payload\.componentTopologyRows[^.]+sourceAssetRefs/u
  );
  assert.match(
    prompt,
    /sourceAssetRefs must name the design or source authority/u
  );
  assert.match(prompt, /payload\.componentTestRows=\[\]/u);
  assert.match(prompt, /payload\.componentTestQualificationRows=\[\]/u);
});

test("T-197 rejects component-test rows on component-code target before row alias parsing", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_code_surface",
    componentRealizationRows: [
      componentRow()
    ],
    componentTestRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "hello_world_javascript_test",
        moduleName: "hello_world_javascript",
        relativePath: "test/hello.test.js",
        publicBoundary: "node --test test/hello.test.js",
        requirementIds: ["REQ-T197-LIVE-001"],
        sourceAssetRefs: ["workspace://design/component_code_surface.md"]
      }
    ]
  };
  const { outputFile } = writeCarrierArtifact(
    register,
    "component_code_surface"
  );

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_code_surface",
    outputFile
  });

  assert.equal(admission.status, "rejected");
  const reasons = admission.blockingReasons.join("\n");
  assert.match(
    reasons,
    /component_depth_register_component_code_test_rows_wrong_stage/u
  );
  assert.doesNotMatch(reasons, /componentTestRows\[0\]\.componentId: unexpected field/u);
});

test("T-188 component-test prompt keeps source topology rows out of test carrier", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 22,
    contract,
    runId: "t188-component-test-prompt"
  });

  const prompt = promptForHandoff(manifest);
  assert.match(prompt, /do not copy source componentTopologyRows/u);
  assert.match(prompt, /componentTestRows\[\]\.componentIds/u);
  assert.match(prompt, /payload\.componentTopologyRows=\[\]/u);
  assert.match(prompt, /payload\.componentRepairSchedule=null/u);
});

test("B-084 rejects metadata-rich component realization aliases", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_realization_qualification_surface",
    componentRealizationRows: [
      {
        ...componentRow(),
        realizationOrder: 1,
        publishesSurfaces: [],
        sourceAssetRefs: ["asset://implementation_design_surface"]
      }
    ]
  };
  const { outputFile } = writeArtifact(register, "component_realization_qualification_surface");

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_realization_qualification_surface",
    outputFile
  });

  assert.equal(admission.status, "rejected");
  assert.match(admission.blockingReasons.join("\n"), /realizationOrder: unexpected field/u);
});

test("T-171 rejects boolean publicBoundary on component realization rows", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_code_surface",
    componentRealizationRows: [
      {
        ...componentRow(),
        publicBoundary: true
      }
    ]
  };
  const { outputFile } = writeArtifact(register, "component_code_surface");

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_code_surface",
    outputFile
  });

  assert.equal(admission.status, "rejected");
  assert.match(admission.blockingReasons.join("\n"), /publicBoundary: expected string/u);
});

test("B-084 admits metadata-rich component test rows", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_test_surface",
    componentTestRows: [
      {
        kind: "sdlc_component_test_realization_row",
        testClassId: "tc.compiler.api.compile-happy-path",
        relativePath:
          "cdme-compiler/src/test/scala/cdme/compiler/api/CompilerSpec.scala",
        testcaseIds: ["TC-COMPILER-001"],
        componentIds: ["cmp.compiler.api"],
        requirementIds: ["REQ-AI-001"],
        shardId: "sbt:test"
      }
    ]
  };
  const { outputFile } = writeArtifact(register, "component_test_surface");

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_test_surface",
    outputFile
  });

  assert.equal(admission.status, "admitted");
  assert.equal(admission.register.componentTestRows.length, 1);
  assert.equal(admission.register.componentTestRows[0].shardId, "sbt:test");
});

function uatComponentDepthRegister(testcaseIds) {
  return {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "uat_test_source_surface",
    componentTopologyRows: [],
    componentRealizationRows: [],
    testComponentTopologyRows: [],
    componentTestRows: [
      {
        kind: "sdlc_component_test_realization_row",
        testClassId: "hello_world_uat",
        relativePath: "test/hello.test.js",
        testcaseIds,
        componentIds: ["hello_world"],
        requirementIds: ["REQ-T113-UAT-001"],
        shardId: "node:test"
      }
    ],
    componentTestQualificationRows: [],
    componentExecutionFailureRegister: null,
    componentRepairSchedule: null,
    releaseDepthParity: null
  };
}

test("T-159 admits UAT component-depth rows with UAT testcase refs", () => {
  const { outputFile } = writeCarrierArtifact(
    uatComponentDepthRegister(["tc://t113/uat/hello_world_output"]),
    "uat_test_source_surface"
  );

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "uat_test_source_surface",
    outputFile
  });

  assert.equal(admission.status, "admitted");
  assert.equal(admission.register.componentTestRows[0].testcaseIds[0], "tc://t113/uat/hello_world_output");
});

test("T-159 rejects non-UAT protocol testcase refs on UAT component-depth rows", () => {
  const { outputFile } = writeCarrierArtifact(
    uatComponentDepthRegister([
      "tc://t113/uat/hello_world_output",
      "tc://t113/positive/hello_world_stdout"
    ]),
    "uat_test_source_surface"
  );

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "uat_test_source_surface",
    outputFile
  });

  assert.equal(admission.status, "rejected");
  assert.match(
    admission.blockingReasons.join("\n"),
    /component_depth_register_uat_test_source_non_uat_testcase:tc:\/\/t113\/positive\/hello_world_stdout/u
  );
});

test("T-159 rejects non-UAT local test-case refs on UAT component-depth rows", () => {
  const { outputFile } = writeCarrierArtifact(
    uatComponentDepthRegister([
      "test-case://hello_world_javascript/uat/hello-world-stdout",
      "test-case://hello_world_javascript/positive/hello-world-stdout"
    ]),
    "uat_test_source_surface"
  );

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "uat_test_source_surface",
    outputFile
  });

  assert.equal(admission.status, "rejected");
  assert.match(
    admission.blockingReasons.join("\n"),
    /component_depth_register_uat_test_source_non_uat_testcase:test-case:\/\/hello_world_javascript\/positive\/hello-world-stdout/u
  );
});

test("T-159 component-depth assurance folds UAT target-carrier admission failures", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_lite_uat_test_source_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "framework_smoke_min_fp",
    edgeName: contract.edgeName,
    vectorIndex: 4,
    contract,
    runId: "t159-uat-component-depth"
  });
  const register = uatComponentDepthRegister([
    "tc://t113/uat/hello_world_output",
    "tc://t113/positive/hello_world_stdout"
  ]);
  const { outputFile, content } = writeCarrierArtifact(register, "uat_test_source_surface");
  const materializedFile = materializeProductFile(
    manifest,
    "test",
    "test/hello.test.js",
    "// requirement:REQ-T113-UAT-001\n"
  );

  const ledger = deriveComponentDepthAssuranceLedger({
    manifest,
    report: reportFor(outputFile, content, manifest, [materializedFile])
  });

  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
  assert.match(
    ledger.reasons.map((item) => item.code).join("\n"),
    /component_depth_register_uat_test_source_non_uat_testcase:tc:\/\/t113\/positive\/hello_world_stdout/u
  );
});

test("T-113 admits repair and release-depth rows on current component-depth targets", () => {
  const repairRegister = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_repair_schedule_surface",
    componentRepairSchedule: {
      kind: "sdlc_component_repair_schedule",
      registerVersion: "ts-component-depth-v1",
      scheduleStatus: "no_repair_required",
      repairRows: [],
      evidenceRefs: ["evidence://t113/repair"]
    }
  };
  const releaseRegister = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "release_depth_parity_surface",
    releaseDepthParity: {
      kind: "sdlc_release_depth_parity_assessment",
      status: "met",
      summary: "current component-depth release parity is met",
      blockingReasons: [],
      evidenceRefs: ["evidence://t113/release"]
    }
  };
  const repair = writeArtifact(repairRegister, "component_repair_schedule_surface");
  const release = writeArtifact(releaseRegister, "release_depth_parity_surface");

  assert.equal(
    admitComponentDepthRegisterFromArtifact({
      targetAssetType: "component_repair_schedule_surface",
      outputFile: repair.outputFile
    }).status,
    "admitted"
  );
  assert.equal(
    admitComponentDepthRegisterFromArtifact({
      targetAssetType: "release_depth_parity_surface",
      outputFile: release.outputFile
    }).status,
    "admitted"
  );
});

test("T-197 rejects Markdown-fenced component-depth target carrier payloads", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_repair_schedule_surface",
    componentRepairSchedule: {
      kind: "sdlc_component_repair_schedule",
      registerVersion: "ts-component-depth-v1",
      scheduleStatus: "triage_gap",
      repairRows: [],
      evidenceRefs: ["evidence://t188/component-repair-schedule"]
    }
  };
  const { outputFile } = writeMarkdownCarrierArtifact(
    register,
    "component_repair_schedule_surface"
  );

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_repair_schedule_surface",
    outputFile
  });

  assert.equal(admission.status, "rejected");
  assert.match(admission.blockingReasons.join("\n"), /component_depth_register_missing/u);
});

test("T-197 rejects plain-fence labeled component-depth target carrier payloads", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_repair_schedule_surface",
    componentRepairSchedule: {
      kind: "sdlc_component_repair_schedule",
      registerVersion: "ts-component-depth-v1",
      scheduleStatus: "triage_gap",
      repairRows: [],
      evidenceRefs: ["evidence://t194/component-repair-schedule"]
    }
  };
  const { outputFile } = writePlainFenceLabeledCarrierArtifact(
    register,
    "component_repair_schedule_surface"
  );

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_repair_schedule_surface",
    outputFile
  });

  assert.equal(admission.status, "rejected");
  assert.match(admission.blockingReasons.join("\n"), /component_depth_register_missing/u);
});

test("T-132 admits Markdown Target Carrier envelope with component-depth payload", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_code_surface",
    componentTopologyRows: [
      {
        kind: "sdlc_component_topology_row",
        componentId: "hello_program",
        moduleName: "hello_world_javascript",
        relativePath: "build_tenants/hello_world_javascript/src/hello.js",
        publicBoundary: "build_tenants/hello_world_javascript/src/hello.js",
        concernRole: "other",
        requirementIds: [
          "requirement:t132_hello_world_single_tenant.bootstrap.req_t132_001"
        ],
        sourceAssetRefs: [
          "workspace://build_tenants/hello_world_javascript/design/adrs/ADR-002-implementation-design-surface.md"
        ]
      }
    ],
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "hello_program",
        moduleName: "hello_world_javascript",
        relativePath: "build_tenants/hello_world_javascript/src/hello.js",
        publicBoundary: "build_tenants/hello_world_javascript/src/hello.js",
        requirementIds: [
          "requirement:t132_hello_world_single_tenant.bootstrap.req_t132_001"
        ],
        sourceAssetRefs: [
          "workspace://build_tenants/hello_world_javascript/design/adrs/ADR-002-implementation-design-surface.md"
        ]
      }
    ],
    testComponentTopologyRows: [],
    componentTestRows: [],
    componentTestQualificationRows: [],
    componentExecutionFailureRegister: null,
    componentRepairSchedule: null,
    releaseDepthParity: null
  };
  const { outputFile } = writeTargetCarrierSectionArtifact(
    register,
    "component_code_surface",
    "derive_lite_component_code_surface"
  );

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_code_surface",
    outputFile
  });

  assert.equal(admission.status, "admitted");
  assert.equal(admission.register.componentRealizationRows.length, 1);
  assert.equal(
    admission.register.componentRealizationRows[0].componentId,
    "hello_program"
  );
});

test("T-132 admits raw unfenced target-carrier envelope embedded in Markdown", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_code_surface",
    componentTopologyRows: [
      {
        kind: "sdlc_component_topology_row",
        componentId: "hello_main",
        moduleName: "hello_world_javascript",
        relativePath: "src/hello.js",
        publicBoundary: "direct stdout: Hello, world!",
        concernRole: "other",
        requirementIds: [
          "requirement:t132_hello_world_single_tenant.bootstrap.req_t132_001"
        ],
        sourceAssetRefs: [
          "workspace://build_tenants/hello_world_javascript/design/adrs/ADR-002-implementation-design-surface.md"
        ]
      }
    ],
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "hello_main",
        moduleName: "hello_world_javascript",
        relativePath: "src/hello.js",
        publicBoundary: "direct stdout: Hello, world!",
        requirementIds: [
          "requirement:t132_hello_world_single_tenant.bootstrap.req_t132_001"
        ],
        sourceAssetRefs: [
          "workspace://build_tenants/hello_world_javascript/design/adrs/ADR-002-implementation-design-surface.md"
        ]
      }
    ],
    testComponentTopologyRows: [],
    componentTestRows: [],
    componentTestQualificationRows: [],
    componentExecutionFailureRegister: null,
    componentRepairSchedule: null,
    releaseDepthParity: null
  };
  const { outputFile } = writeUnfencedEmbeddedCarrierArtifact(
    register,
    "component_code_surface",
    "derive_lite_component_code_surface"
  );

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_code_surface",
    outputFile
  });

  assert.equal(admission.status, "admitted");
  assert.equal(admission.register.componentTopologyRows[0].componentId, "hello_main");
  assert.equal(
    admission.register.componentRealizationRows[0].relativePath,
    "src/hello.js"
  );
});

test("T-153 rejects component-depth wrappers that are not GTL target-carrier envelopes", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_repair_schedule_surface",
    componentRepairSchedule: {
      kind: "sdlc_component_repair_schedule",
      registerVersion: "ts-component-depth-v1",
      scheduleStatus: "triage_gap",
      repairRows: [],
      evidenceRefs: ["evidence://t153/component-repair-schedule"]
    }
  };
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t153-"));
  const outputFile = path.join(root, "component_repair_schedule_surface.json");
  const carrier = {
    ...componentDepthTargetCarrierFor(register),
    contractRef: "contract://odd-sdlc/local-component-depth-wrapper"
  };
  writeFileSync(
    outputFile,
    `${JSON.stringify(carrier, null, 2)}\n`,
    "utf8"
  );

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_repair_schedule_surface",
    outputFile
  });

  assert.equal(admission.status, "rejected");
  const reasons = admission.blockingReasons.join("\n");
  assert.match(reasons, /contractRef: unexpected protocol value/u);
});

test("T-188 target-carrier payload rejection reports payload schema only", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_test_surface",
    componentTopologyRows: [
      {
        kind: "sdlc_component_topology_row",
        componentId: "missing-source-refs",
        moduleName: "test",
        relativePath: "test/topology.test.js",
        publicBoundary: "test boundary",
        concernRole: "validator",
        requirementIds: ["REQ-T188-001"]
      }
    ],
    componentTestRows: [
      {
        kind: "sdlc_component_test_realization_row",
        testClassId: "tc.topology",
        relativePath: "test/topology.test.js",
        testcaseIds: ["TC-T188-001"],
        componentIds: ["cmp.topology"],
        requirementIds: ["REQ-T188-001"],
        shardId: "node:test"
      }
    ]
  };
  const { outputFile } = writeCarrierArtifact(
    register,
    "component_test_surface"
  );

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_test_surface",
    outputFile
  });

  assert.equal(admission.status, "rejected");
  const reasons = admission.blockingReasons.join("\n");
  assert.match(reasons, /componentTopologyRows\[0\]\.sourceAssetRefs: expected array/u);
  assert.doesNotMatch(reasons, /component_depth_register\.edgeRef: unexpected field/u);
  assert.doesNotMatch(reasons, /component_depth_register\.contractRef: unexpected field/u);
});

test("T-113 ignores stale repair schedule payload on component-code target", () => {
  const register = {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_code_surface",
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "source-component",
        moduleName: "source",
        relativePath: "src/main/scala",
        publicBoundary: "source boundary",
        requirementIds: ["requirement:data_mapper.req_source"],
        sourceAssetRefs: ["build_tenants/scala_spark/src/main/scala"]
      }
    ],
    componentRepairSchedule: {
      kind: "sdlc_component_repair_schedule",
      registerVersion: "ts-component-depth-v1",
      scheduleStatus: "no_repair_required",
      repairRows: [
        {
          kind: "sdlc_component_repair_schedule_row",
          scheduleId: "stale-row",
          failureId: "stale-failure",
          repairTarget: "component_code",
          lawfulReentryPoint: "repair_worker_output",
          attributionConfidence: "high"
        }
      ]
    }
  };
  const { outputFile } = writeArtifact(register, "component_code_surface");

  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_code_surface",
    outputFile
  });

  assert.equal(admission.status, "admitted");
  assert.equal(admission.register.componentRepairSchedule, null);
  assert.equal(admission.register.componentRealizationRows.length, 1);
});
