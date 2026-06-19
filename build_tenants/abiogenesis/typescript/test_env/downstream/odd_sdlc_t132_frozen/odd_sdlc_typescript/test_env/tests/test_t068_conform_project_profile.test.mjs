// Validates: REQ-F-ODDSDLC-026
// Validates: REQ-F-ODDSDLC-027
// Validates: REQ-F-ODDSDLC-028
// Validates: REQ-F-ODDSDLC-032
// Validates: REQ-F-ODDSDLC-053
// Validates: T-068

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveSdlcConformProjectReportFromWorkspace,
  deriveSdlcProjectConstraintsFromWorkspace,
  deriveWorkerHandoffManifest,
  declaredProductFileTargets,
  FG_CONFORM_PROJECT,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";

function makeWorkspace(name, constraintsText) {
  const root = mkdtempSync(path.join(tmpdir(), `${name}-`));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants"), { recursive: true });
  writeFileSync(path.join(root, "specification/INTENT.md"), "# Intent\n", "utf8");
  writeFileSync(path.join(root, "specification/PRODUCT.md"), "# Product\n", "utf8");
  writeFileSync(path.join(root, "specification/GOALS.md"), "# Goals\n", "utf8");
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    "# Imported Sources\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/10-generated-bootstrap.md"),
    "# Requirements\n\nREQ-T068-001: Preserve graph-owned requirement lineage.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_bootstrap.md"),
    "# Project Bootstrap\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/TENANT_REGISTRY.md"),
    "# Tenant Registry\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    `${constraintsText.trim()}\n`,
    "utf8"
  );
  return root;
}

test("T-068 conforms arbitrary tenant registry into canonical project profile", () => {
  const workspace = makeWorkspace(
    "odd-sdlc-t068-kotlin",
    `
project:
  name: ledger service
  kind: imported_workspace
  version: 1.2.3
active_tenant: kotlin_jvm
ambiguity_risk_appetite: high
structure:
  root_code_policy: tenant_root_only
build_tenants:
  kotlin_jvm:
    output_dir: build_tenants/kotlin_jvm
    language: kotlin
    build_tool: gradle
    test_runner: gradle test
    test_execution_contract: gradle test
    module_structure:
      - ingress-core
      - settlement-engine
    capability_contracts:
      cli_runner: true
      junit: true
`
  );

  const profile = deriveSdlcConformProjectProfileFromWorkspace(workspace);
  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const report = deriveSdlcConformProjectReportFromWorkspace(workspace);

  assert.equal(profile.kind, "sdlc_conform_project_profile");
  assert.equal(profile.projectSlug, "ledger_service");
  assert.equal(profile.projectKind, "imported_workspace");
  assert.equal(profile.version, "1.2.3");
  assert.equal(profile.activeTenant, "kotlin_jvm");
  assert.equal(profile.selectedOutputRoot, "build_tenants/kotlin_jvm");
  assert.equal(profile.declaredOutputRoot, "build_tenants/kotlin_jvm");
  assert.deepStrictEqual(profile.runtimeLayout, {
    kind: "sdlc_runtime_layout",
    runtimeRoot: ".ai-workspace/runtime/odd_sdlc",
    transformAssetRoot: ".ai-workspace/runtime/odd_sdlc/assets",
    operatorRunRoot: ".ai-workspace/runtime/odd_sdlc/operator-runs",
    productMaterializationRootPolicy: "selected_output_root"
  });
  assert.deepStrictEqual(profile.declaredModuleNames, [
    "ingress-core",
    "settlement-engine"
  ]);
  assert.equal(profile.language, "kotlin");
  assert.equal(profile.tool, "gradle");
  assert.equal(profile.buildExecutionContract, "undeclared");
  assert.equal(profile.testExecutionContract, "gradle test");
  assert.equal(profile.deploymentContract, "undeclared");
  assert.equal(profile.runtimeObservationContract, "undeclared");
  assert.equal(profile.realizationMode, "planned_output_tree");
  assert.equal(profile.overlayStrategy, "full_lifecycle");
  assert.equal(profile.overlayRef, SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF);
  assert.deepStrictEqual(
    profile.capabilityContracts.map((contract) => `${contract.name}:${contract.value}`),
    ["cli_runner:true", "junit:true"]
  );

  assert.equal(constraints.activeTenant, "kotlin_jvm");
  assert.equal(constraints.selectedOutputRoot, "build_tenants/kotlin_jvm");
  assert.deepStrictEqual(constraints.runtimeLayout, profile.runtimeLayout);
  assert.deepStrictEqual(constraints.capabilityContracts, ["cli_runner", "junit"]);
  assert.equal(report.governingGraphFunction, FG_CONFORM_PROJECT);
  assert.deepStrictEqual(report.conformanceGaps, []);
});

test("T-068 admits standard runtime layout from project constraints template", () => {
  const workspace = makeWorkspace(
    "odd-sdlc-t068-runtime-layout",
    `
project:
  name: runtime layout project
active_tenant: node_cli
selected_output_root: build_tenants/node_cli
runtime:
  root: .ai-workspace/runtime/odd_sdlc
  transform_asset_root: .ai-workspace/runtime/odd_sdlc/assets
  operator_run_root: .ai-workspace/runtime/odd_sdlc/operator-runs
  product_materialization_root_policy: selected_output_root
build_tenants:
  node_cli:
    output_dir: build_tenants/node_cli
    language: typescript
    build_tool: npm
    test_runner: npm test
`
  );

  const profile = deriveSdlcConformProjectProfileFromWorkspace(workspace);
  assert.equal(profile.runtimeLayout.runtimeRoot, ".ai-workspace/runtime/odd_sdlc");
  assert.equal(
    profile.runtimeLayout.transformAssetRoot,
    ".ai-workspace/runtime/odd_sdlc/assets"
  );
  assert.equal(
    profile.runtimeLayout.operatorRunRoot,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
  assert.equal(profile.runtimeLayout.productMaterializationRootPolicy, "selected_output_root");
});

test("T-068 canonical project constraints template includes runtime layout", () => {
  const workspace = makeWorkspace(
    "odd-sdlc-t068-template-runtime-layout",
    `
project:
  name: template runtime layout
active_tenant: node_cli
build_tenants:
  node_cli:
    output_dir: build_tenants/node_cli
    language: typescript
    build_tool: npm
`
  );

  materializeSdlcProjectConformance({ workspaceRoot: workspace });
  const constraintsText = readFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    "utf8"
  );
  assert.match(constraintsText, /runtime:\n/);
  assert.match(constraintsText, /  overlay_strategy: full_lifecycle\n/);
  assert.match(
    constraintsText,
    /  overlay_ref: overlay:\/\/odd-sdlc\/current-full-traversal\n/
  );
  assert.match(constraintsText, /  root: \.ai-workspace\/runtime\/odd_sdlc\n/);
  assert.match(
    constraintsText,
    /  transform_asset_root: \.ai-workspace\/runtime\/odd_sdlc\/assets\n/
  );
  assert.match(
    constraintsText,
    /  operator_run_root: \.ai-workspace\/runtime\/odd_sdlc\/operator-runs\n/
  );
  assert.match(
    constraintsText,
    /  product_materialization_root_policy: selected_output_root\n/
  );
});

test("T-171 conformance does not synthesize product or requirement authority", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t164-conform-"));
  mkdirSync(path.join(workspace, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t164 rust service",
      "  overlay_strategy: thread",
      "  overlay_ref: overlay://odd-sdlc/lite-design-module-implementation",
      "active_tenant: hello_world_rust_service",
      "selected_output_root: build_tenants/hello_world_rust_service",
      "build_tenants:",
      "  hello_world_rust_service:",
      "    output_dir: build_tenants/hello_world_rust_service",
      "    language: Rust",
      "    build_tool: cargo",
      "    test_runner: cargo test",
      "    module_structure:",
      "      - hello_world_rust_service"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "bootstrap.md"),
    [
      "# Bootstrap",
      "",
      "## Product Definition",
      "",
      "The product shall provide `build_tenants/hello_world_rust_service/Cargo.toml`.",
      "The product shall provide `build_tenants/hello_world_rust_service/src/main.rs`.",
      "",
      "## Requirements",
      "",
      "### REQ-T164-RUST-SVC-001 Cargo Manifest",
      "",
      "The product shall provide one Cargo manifest at",
      "`build_tenants/hello_world_rust_service/Cargo.toml`.",
      "",
      "### REQ-T164-RUST-SVC-002 Rust Executable Source",
      "",
      "The product shall provide one Rust executable source file at",
      "`build_tenants/hello_world_rust_service/src/main.rs`."
    ].join("\n"),
    "utf8"
  );

  materializeSdlcProjectConformance({ workspaceRoot: workspace });

  for (const relativePath of [
    "specification/PRODUCT.md",
    "specification/GOALS.md",
    "specification/requirements/00-imported-sources.md",
    "specification/requirements/01-t164-requirements.md"
  ]) {
    assert.equal(
      existsSync(path.join(workspace, relativePath)),
      false,
      `${relativePath} must be graph traversal output, not conformance output`
    );
  }
  const bootstrapReadModel = readFileSync(
    path.join(workspace, ".ai-workspace/context/project_bootstrap.md"),
    "utf8"
  );
  assert.match(bootstrapReadModel, /deterministic read model over imported project authority/);
  assert.match(bootstrapReadModel, /It is not a replacement for project-owned specification truth/);

  const constraints = deriveSdlcProjectConstraintsFromWorkspace(workspace);
  const profile = deriveSdlcConformProjectProfileFromWorkspace(workspace);
  assert.equal(profile.overlayStrategy, "thread");
  assert.equal(profile.overlayRef, SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF);
  const contract = hookContractByEdgeName("derive_lite_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "lite_design_module_implementation",
    edgeName: contract.edgeName,
    vectorIndex: 2,
    contract,
    projectConstraints: constraints,
    runId: "t164-conformed-product-targets"
  });

  assert.deepStrictEqual(declaredProductFileTargets(manifest), []);
});

test("T-068 preserves declared tenant contracts without synthesizing sandbox commands", () => {
  const workspace = makeWorkspace(
    "odd-sdlc-t068-scala",
    `
project:
  name: analytics pipeline
active_tenant: scala_spark
build_tenants:
  scala_spark:
    output_dir: build_tenants/scala_spark/
    language: scala
    build_tool: sbt
    module_structure:
      - ingestion
      - lineage
      - serving
    capability_contracts:
      fat_jar: true
      spark_session: true
      spark_submit_compatible: true
`
  );

  const profile = deriveSdlcConformProjectProfileFromWorkspace(workspace);

  assert.equal(profile.activeTenant, "scala_spark");
  assert.equal(profile.selectedOutputRoot, "build_tenants/scala_spark");
  assert.deepStrictEqual(profile.declaredModuleNames, [
    "ingestion",
    "lineage",
    "serving"
  ]);
  assert.equal(profile.buildExecutionContract, "undeclared");
  assert.equal(profile.testExecutionContract, "undeclared");
  assert.equal(profile.deploymentContract, "undeclared");
});

test("T-068 installed handoff carries conformed project before materialization", () => {
  const workspace = makeWorkspace(
    "odd-sdlc-t068-handoff",
    `
project:
  name: document compiler
active_tenant: node_cli
build_tenants:
  node_cli:
    output_dir: build_tenants/node_cli
    language: typescript
    build_tool: npm
    module_structure:
      - parser
      - renderer
`
  );
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 6,
    contract,
    runId: "t068-conform-project-handoff"
  });
  const handoffFiles = writeHandoffFiles(manifest);
  const archivedProfile = JSON.parse(
    readFileSync(path.join(manifest.archiveRoot, "conformed_project.json"), "utf8")
  );

  assert.equal(manifest.conformedProject.projectSlug, "document_compiler");
  assert.equal(manifest.conformedProject.activeTenant, "node_cli");
  assert.equal(
    manifest.archiveRoot.endsWith(
      ".ai-workspace/runtime/odd_sdlc/operator-runs/t068-conform-project-handoff"
    ),
    true
  );
  assert.equal(
    manifest.outputFile.endsWith(
      "build_tenants/node_cli/design/component_code_surface.md"
    ),
    true
  );
  assert.equal(
    manifest.allowedWriteRoots.includes(manifest.productMaterialization.tenantRoot),
    true
  );
  assert.equal(manifest.productMaterialization.selectedOutputRoot, "build_tenants/node_cli");
  assert.deepStrictEqual(manifest.productMaterialization.declaredModuleNames, [
    "parser",
    "renderer"
  ]);
  assert.equal(manifest.productMaterialization.buildExecutionContract, "undeclared");
  assert.equal(manifest.productMaterialization.testExecutionContract, "undeclared");
  assert.equal(archivedProfile.projectSlug, "document_compiler");
  assert.match(readFileSync(handoffFiles.promptPath, "utf8"), /Declared modules: parser, renderer/);
});

test("T-171 graph traversal owns workspace specification output paths and typed templates", () => {
  const workspace = makeWorkspace(
    "odd-sdlc-t171-workspace-spec-surfaces",
    `
project:
  name: spec surface fixture
active_tenant: node_cli
build_tenants:
  node_cli:
    output_dir: build_tenants/node_cli
    language: javascript
    build_tool: npm
    module_structure:
      - app
`
  );

  for (const [edgeName, expectedOutput] of [
    ["derive_requirement_surface", "specification/requirements/10-generated-bootstrap.md"],
    ["derive_uat_testcases_surface", "specification/scenarios/20-generated-uat-testcases.md"],
    ["derive_testcase_authority_surface", "specification/scenarios/30-generated-testcase-authority.md"]
  ]) {
    const contract = hookContractByEdgeName(edgeName);
    const manifest = deriveWorkerHandoffManifest({
      workspaceRoot: workspace,
      graphFunctionName: "bootstrap_release_self_test",
      edgeName: contract.edgeName,
      vectorIndex: 0,
      contract,
      runId: `t171-${edgeName}`
    });
    assert.equal(manifest.outputFile.endsWith(expectedOutput), true, edgeName);
    assert.equal(
      manifest.allowedWriteRoots.some((root) =>
        manifest.outputFile.startsWith(root)
      ),
      true,
      edgeName
    );
    assert.equal(
      manifest.targetCarrierProjection.constructionTemplate.payloadTemplate !== null,
      true,
      edgeName
    );
    assert.equal(
      manifest.targetCarrierProjection.constructionTemplate.rowTemplates.length,
      1,
      edgeName
    );
  }
});
