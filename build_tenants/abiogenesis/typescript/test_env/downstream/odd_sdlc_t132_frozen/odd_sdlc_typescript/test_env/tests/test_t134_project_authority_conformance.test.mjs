// Validates: T-134

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
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_CONFORM_PROJECT,
  admitSdlcProjectAuthorityInput,
  admitSdlcProjectConstraints,
  conformProjectProfileFromConstraintsText,
  constructSdlcGtlModule,
  deriveSdlcProjectAuthorityConformanceProjection,
  deriveSdlcTargetObligationBinding,
  deriveSdlcWorkspaceIngressReport,
  materializeSdlcProjectAuthorityConformance,
  projectSdlcQueryDomain
} from "../../build/semantic/code/src/index.js";

const TEMPLATE_ROOT =
  "/Users/jim/src/apps/specification_methodology/specification/standards/templates";
const T132_HELLO_WORLD_BOOTSTRAP = path.join(
  process.cwd(),
  "test_env/fixtures/t132_hello_world_single_tenant/bootstrap.md"
);

function profile() {
  return conformProjectProfileFromConstraintsText({
    workspaceRoot: "/workspace/t134-rust-hello-world",
    constraintsText: [
      "project:",
      "  name: rust_hello_world",
      "  selected_output_root: build_tenants/hello_world_rust",
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  hello_world_rust:",
      "    output_dir: build_tenants/hello_world_rust",
      "    language: rust",
      "    test_runner: cargo-test",
      "    module_structure:",
      "      - hello_world"
    ].join("\n")
  });
}

function conformanceReport(overrides = {}) {
  return Object.freeze({
    kind: "sdlc_conform_project_report",
    governingGraphFunction: FG_CONFORM_PROJECT,
    status: overrides.status ?? "passed",
    workspaceRootUri: "file:///workspace/t134-rust-hello-world",
    sourceRefs: Object.freeze(overrides.sourceRefs ?? ["file:///workspace/README.md"]),
    materializedTopologyRefs: Object.freeze([]),
    profile: profile(),
    conformanceGaps: Object.freeze(overrides.conformanceGaps ?? [])
  });
}

function targetBinding(targetAssetType, targetAssetRefs = undefined) {
  const module = constructSdlcGtlModule();
  const projectConstraints = admitSdlcProjectConstraints({
    projectSlug: "t134",
    activeTenant: "hello_world_rust",
    selectedOutputRoot: "build_tenants/hello_world_rust",
    ambiguityRiskAppetite: "medium",
    capabilityContracts: ["transport_contract"]
  });
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "file:///workspace/t134-rust-hello-world",
    projectConstraints,
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  return deriveSdlcTargetObligationBinding({
    queryDomain,
    targetAssetType,
    ...(targetAssetRefs === undefined ? {} : { targetAssetRefs })
  });
}

test("T-134 publishes Fg_conform_project_authority as authority conformance graph, not broad release construction", () => {
  const module = constructSdlcGtlModule();
  const graphFunction = module.graphFunctions.find(
    (candidate) => candidate.name === FG_CONFORM_PROJECT_AUTHORITY
  );
  assert(graphFunction);
  assert.equal(graphFunction.outputs.some((node) => node.name === "project_bootstrap_surface"), true);
  assert.equal(graphFunction.outputs.some((node) => node.name === "intent_surface"), true);
  assert.equal(graphFunction.outputs.some((node) => node.name === "product_surface"), true);
  assert.equal(graphFunction.outputs.some((node) => node.name === "goal_surface"), true);
  assert.equal(graphFunction.outputs.some((node) => node.name === "requirement_surface"), false);
  assert.equal(graphFunction.outputs.some((node) => node.name === "component_code_surface"), false);
  assert.equal(graphFunction.outputs.some((node) => node.name === "release_surface"), false);

  const bootstrapRelease = module.graphFunctions.find(
    (candidate) => candidate.name === "bootstrap_release_self_test"
  );
  assert(bootstrapRelease);
  assert.notEqual(graphFunction.id, bootstrapRelease.id);
  assert.equal(module.jobs.some((job) => job.name === `${FG_CONFORM_PROJECT_AUTHORITY}_job`), true);
});

test("T-134 Fg_conform_project_authority conforms supportable authority surfaces and defers requirements", () => {
  const projection = deriveSdlcProjectAuthorityConformanceProjection({
    conformanceReport: conformanceReport()
  });
  const rowByRole = new Map(
    projection.authoritySurfaceRows.map((row) => [row.role, row])
  );

  assert.equal(projection.kind, "sdlc_project_authority_conformance_projection");
  assert.equal(projection.graphFunctionName, FG_CONFORM_PROJECT_AUTHORITY);
  assert.equal(projection.readOnly, true);
  assert.equal(projection.gapEvaluationFunction, null);
  assert.equal(projection.nextActionEvaluationFunction, "evaluate_next");
  assert.equal(projection.actionClosureEvaluationFunction, null);
  assert.equal(projection.constructsReleaseGraph, false);
  assert.equal(projection.constructsProductFiles, false);
  assert.equal(rowByRole.get("project_bootstrap")?.support, "supportable");
  assert.equal(rowByRole.get("intent")?.templateRef.endsWith("INTENT_TEMPLATE.md"), true);
  assert.equal(rowByRole.get("product")?.templateRef.endsWith("PRODUCT_TEMPLATE.md"), true);
  assert.equal(rowByRole.get("goals")?.templateRef.endsWith("GOALS_TEMPLATE.md"), true);
  assert.equal(rowByRole.get("requirements_readme")?.support, "deferred");
  assert.equal(projection.requirementGeneration, "deferred_to_evaluator");
  assert.deepEqual(
    projection.nextActionRows.map((row) => [
      row.source,
      row.graphFunctionName,
      row.targetAssetType,
      row.disposition
    ]),
    [[
      "target_binding_required",
      null,
      "project_authority_next_action_projection",
      "no_action"
    ]]
  );
});

test("T-134 materializes supportable project authority docs from shared templates only", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t134-authority-"));
  const report = materializeSdlcProjectAuthorityConformance({
    workspaceRoot: workspace,
    templateRoot: TEMPLATE_ROOT,
    conformanceReport: conformanceReport()
  });
  const relativePaths = report.materializedFiles.map((file) => file.relativePath).sort();

  assert.equal(report.kind, "sdlc_project_authority_materialization_report");
  assert.equal(report.graphFunctionName, FG_CONFORM_PROJECT_AUTHORITY);
  assert.equal(report.constructsReleaseGraph, false);
  assert.equal(report.constructsProductFiles, false);
  assert.deepEqual(relativePaths, [
    ".ai-workspace/context/project_bootstrap.md",
    "specification/GOALS.md",
    "specification/INTENT.md",
    "specification/PRODUCT.md",
    "specification/requirements/README.md"
  ]);

  const intent = readFileSync(path.join(workspace, "specification/INTENT.md"), "utf8");
  const product = readFileSync(path.join(workspace, "specification/PRODUCT.md"), "utf8");
  const goals = readFileSync(path.join(workspace, "specification/GOALS.md"), "utf8");
  const requirementsReadme = readFileSync(
    path.join(workspace, "specification/requirements/README.md"),
    "utf8"
  );
  const bootstrap = readFileSync(
    path.join(workspace, ".ai-workspace/context/project_bootstrap.md"),
    "utf8"
  );

  assert.match(intent, /^# Project Intent/m);
  assert.match(product, /^# Project Product/m);
  assert.match(goals, /^# Project Goals/m);
  assert.match(requirementsReadme, /^# Project Requirements/m);
  assert.match(intent, /## Conformed Authority/);
  assert.match(product, /template_ref: .*PRODUCT_TEMPLATE\.md/);
  assert.match(goals, /active_tenant: hello_world_rust/);
  assert.match(bootstrap, /This generated surface is a deterministic read model/);
  assert.equal(
    existsSync(path.join(workspace, "specification/requirements/00-starter.md")),
    false
  );
  assert.equal(existsSync(path.join(workspace, "build_tenants/hello_world_rust/Cargo.toml")), false);
});

test("T-134 admits declared authority inputs as bounded source refs and fails closed", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t134-input-"));
  mkdirSync(path.join(workspace, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(workspace, "docs/product_seed"), { recursive: true });
  writeFileSync(path.join(workspace, "specification/INTENT.md"), "# Intent\n", "utf8");
  writeFileSync(
    path.join(workspace, "specification/requirements/R-001.md"),
    "# Requirement\n",
    "utf8"
  );
  writeFileSync(path.join(workspace, "docs/product_seed/seed.md"), "# Seed\n", "utf8");
  writeFileSync(path.join(workspace, "bootstrap.md"), "# Bootstrap\n", "utf8");
  writeFileSync(path.join(workspace, "unrelated.md"), "# Unrelated\n", "utf8");

  const sourceFile = admitSdlcProjectAuthorityInput({
    workspaceRoot: workspace,
    authorityInput: { kind: "source_file", path: "bootstrap.md" }
  });
  const specificationFolder = admitSdlcProjectAuthorityInput({
    workspaceRoot: workspace,
    authorityInput: { kind: "specification_folder", path: "specification" }
  });
  const sourceFolder = admitSdlcProjectAuthorityInput({
    workspaceRoot: workspace,
    authorityInput: { kind: "source_folder", path: "docs/product_seed" }
  });
  const missing = admitSdlcProjectAuthorityInput({
    workspaceRoot: workspace,
    authorityInput: { kind: "source_file", path: "missing.md" }
  });
  const escaped = admitSdlcProjectAuthorityInput({
    workspaceRoot: workspace,
    authorityInput: { kind: "source_file", path: "../outside.md" }
  });
  const typeMismatch = admitSdlcProjectAuthorityInput({
    workspaceRoot: workspace,
    authorityInput: { kind: "source_file", path: "specification" }
  });

  assert.equal(sourceFile.status, "admitted");
  assert.equal(sourceFile.inputKind, "source_file");
  assert.deepEqual(sourceFile.sourceRefs.map((ref) => ref.endsWith("/bootstrap.md")), [true]);
  assert.equal(
    sourceFile.sourceRefs.some((ref) => ref.endsWith("/unrelated.md")),
    false
  );

  assert.equal(specificationFolder.status, "admitted");
  assert.equal(specificationFolder.inputKind, "specification_folder");
  assert.deepEqual(
    specificationFolder.sourceRefs.map((ref) => path.basename(new URL(ref).pathname)).sort(),
    ["INTENT.md", "R-001.md"]
  );

  assert.equal(sourceFolder.status, "admitted");
  assert.deepEqual(
    sourceFolder.sourceRefs.map((ref) => path.basename(new URL(ref).pathname)),
    ["seed.md"]
  );

  assert.equal(missing.status, "blocked");
  assert.deepEqual(missing.reasonRefs, ["authority_input_not_found"]);
  assert.equal(escaped.status, "blocked");
  assert.deepEqual(escaped.reasonRefs, ["authority_input_ambiguous"]);
  assert.equal(typeMismatch.status, "blocked");
  assert.deepEqual(typeMismatch.reasonRefs, ["authority_input_ambiguous"]);
});

test("T-134 required declared authority input blocks instead of scanning the workspace", () => {
  const projection = deriveSdlcProjectAuthorityConformanceProjection({
    conformanceReport: conformanceReport({ sourceRefs: [] }),
    requireDeclaredAuthorityInput: true
  });
  const rowByRole = new Map(
    projection.authoritySurfaceRows.map((row) => [row.role, row])
  );

  assert.equal(projection.authorityInputAdmission?.status, "blocked");
  assert.deepEqual(projection.authorityInputAdmission?.reasonRefs, [
    "authority_input_required"
  ]);
  assert.equal(rowByRole.get("project_bootstrap")?.support, "blocked");
  assert.equal(rowByRole.get("intent")?.support, "blocked");
  assert.deepEqual(
    projection.nextActionRows.map((row) => [
      row.source,
      row.targetAssetType,
      row.disposition,
      row.reasonRefs
    ]),
    [[
      "authority_input",
      "declared_authority_input",
      "blocked",
      ["authority_input_required"]
    ]]
  );
});

test("T-134 conforms hello-world bootstrap as declared source-file authority without product code", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t134-hello-world-"));
  const bootstrapPath = path.join(workspace, "bootstrap.md");
  writeFileSync(bootstrapPath, readFileSync(T132_HELLO_WORLD_BOOTSTRAP, "utf8"), "utf8");

  const report = materializeSdlcProjectAuthorityConformance({
    workspaceRoot: workspace,
    templateRoot: TEMPLATE_ROOT,
    conformanceReport: conformanceReport({ sourceRefs: [] }),
    authorityInput: { kind: "source_file", path: "bootstrap.md" },
    requireDeclaredAuthorityInput: true
  });
  const relativePaths = report.materializedFiles.map((file) => file.relativePath).sort();
  const projectBootstrap = readFileSync(
    path.join(workspace, ".ai-workspace/context/project_bootstrap.md"),
    "utf8"
  );

  assert.equal(report.projection.authorityInputAdmission?.status, "admitted");
  assert.equal(report.projection.authorityInputAdmission?.inputKind, "source_file");
  assert.equal(
    report.projection.authorityInputAdmission?.sourceRefs.some((ref) =>
      ref.endsWith("/bootstrap.md")
    ),
    true
  );
  assert.deepEqual(relativePaths, [
    ".ai-workspace/context/project_bootstrap.md",
    "specification/GOALS.md",
    "specification/INTENT.md",
    "specification/PRODUCT.md",
    "specification/requirements/README.md"
  ]);
  assert.match(projectBootstrap, /authority_input_status: admitted/);
  assert.match(projectBootstrap, /authority_input_kind: source_file/);
  assert.match(projectBootstrap, /bootstrap\.md/);
  assert.equal(
    existsSync(path.join(workspace, "build_tenants/hello_world_javascript/src/hello.js")),
    false
  );
  assert.equal(
    report.projection.nextActionRows.some((row) =>
      row.graphFunctionName === "bootstrap_release_self_test"
    ),
    false
  );
});

test("T-134 target pressure renders binding truth instead of requirements fallback", () => {
  const projection = deriveSdlcProjectAuthorityConformanceProjection({
    conformanceReport: conformanceReport(),
    targetBindings: [
      targetBinding("rust_hello_world_product_files", Object.freeze([
        "file://build_tenants/hello_world_rust/Cargo.toml",
        "file://build_tenants/hello_world_rust/src/main.rs"
      ]))
    ]
  });
  const [row] = projection.nextActionRows;

  assert.equal(row.source, "target_binding");
  assert.equal(row.evaluationFunction, "evaluate_next");
  assert.equal(row.graphFunctionName, null);
  assert.equal(row.targetAssetType, "rust_hello_world_product_files");
  assert.equal(row.disposition, "no_action");
  assert.equal(
    row.reasonRefs.includes("target_asset_has_no_published_graph_action"),
    true
  );
  assert.equal(
    projection.nextActionRows.some((candidate) =>
      candidate.graphFunctionName === "derive_requirement_surface"
    ),
    false
  );
  assert.equal(
    projection.nextActionRows.some((candidate) =>
      candidate.graphFunctionName === "bootstrap_release_self_test"
    ),
    false
  );
});

test("T-134 requirement action appears only when declared target binding admits it", () => {
  const projection = deriveSdlcProjectAuthorityConformanceProjection({
    conformanceReport: conformanceReport(),
    targetBindings: [targetBinding("requirement_surface")]
  });
  const [row] = projection.nextActionRows;

  assert.equal(row.source, "target_binding");
  assert.equal(row.evaluationFunction, "evaluate_next");
  assert.equal(row.graphFunctionName, "derive_requirement_surface");
  assert.equal(row.targetAssetType, "requirement_surface");
  assert.equal(row.disposition, "candidate");
  assert.equal(row.bindingRef, "target-binding://odd-sdlc/requirement_surface");
});

test("T-134 sparse defined workspace reports ambiguity instead of inventing authority", () => {
  const projection = deriveSdlcProjectAuthorityConformanceProjection({
    conformanceReport: conformanceReport({ sourceRefs: [] })
  });
  const intent = projection.authoritySurfaceRows.find((row) => row.role === "intent");

  assert.equal(intent?.support, "deferred");
  assert.equal(intent?.reasonRefs.includes("project_authority_not_observed"), true);
  assert.deepEqual(
    projection.nextActionRows.map((row) => [row.graphFunctionName, row.disposition]),
    [["clarify_project_authority", "candidate"]]
  );
  assert.equal(
    projection.nextActionRows.some((row) => row.graphFunctionName === "bootstrap_release_self_test"),
    false
  );
});

test("T-134 sparse materialization does not invent intent product or goals", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t134-sparse-"));
  const report = materializeSdlcProjectAuthorityConformance({
    workspaceRoot: workspace,
    templateRoot: TEMPLATE_ROOT,
    conformanceReport: conformanceReport({ sourceRefs: [] })
  });
  const relativePaths = report.materializedFiles.map((file) => file.relativePath).sort();

  assert.deepEqual(relativePaths, [
    ".ai-workspace/context/project_bootstrap.md",
    "specification/requirements/README.md"
  ]);
  assert.equal(existsSync(path.join(workspace, "specification/INTENT.md")), false);
  assert.equal(existsSync(path.join(workspace, "specification/PRODUCT.md")), false);
  assert.equal(existsSync(path.join(workspace, "specification/GOALS.md")), false);
  assert.equal(
    report.projection.nextActionRows.some((row) =>
      row.graphFunctionName === "bootstrap_release_self_test"
    ),
    false
  );
});

test("T-134 authority materialization preserves existing project-authored truth", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t134-existing-"));
  const intentPath = path.join(workspace, "specification/INTENT.md");
  mkdirSync(path.dirname(intentPath), { recursive: true });
  writeFileSync(
    intentPath,
    "# Project Intent\n\nThis is project-authored intent.\n",
    "utf8"
  );

  const report = materializeSdlcProjectAuthorityConformance({
    workspaceRoot: workspace,
    templateRoot: TEMPLATE_ROOT,
    conformanceReport: conformanceReport()
  });

  assert.equal(
    readFileSync(intentPath, "utf8"),
    "# Project Intent\n\nThis is project-authored intent.\n"
  );
  assert.equal(
    report.materializedFiles.some((file) => file.relativePath === "specification/INTENT.md"),
    false
  );
  assert.equal(report.skippedExistingFiles.length, 1);
  assert.equal(report.skippedExistingFiles[0].role, "intent");
  assert.equal(
    report.skippedExistingFiles[0].reasonRef,
    "existing_project_authority_without_generated_marker"
  );
});

test("T-134 authority materialization updates only generated authority sections", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t134-update-"));
  const productPath = path.join(workspace, "specification/PRODUCT.md");
  mkdirSync(path.dirname(productPath), { recursive: true });
  writeFileSync(
    productPath,
    [
      "# Project Product",
      "",
      "Project-authored product note.",
      "",
      "## Conformed Authority",
      "",
      "- stale_generated_line: true",
      ""
    ].join("\n"),
    "utf8"
  );

  const report = materializeSdlcProjectAuthorityConformance({
    workspaceRoot: workspace,
    templateRoot: TEMPLATE_ROOT,
    conformanceReport: conformanceReport()
  });
  const product = readFileSync(productPath, "utf8");
  const productFile = report.materializedFiles.find(
    (file) => file.relativePath === "specification/PRODUCT.md"
  );

  assert.match(product, /Project-authored product note\./);
  assert.match(product, /active_tenant: hello_world_rust/);
  assert.doesNotMatch(product, /stale_generated_line/);
  assert.equal(productFile?.writeDisposition, "updated");
});
