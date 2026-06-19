// Validates: T-131
// Validates: guided-odd-chat-live-build-bootstrap-contract

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FG_CONFORM_PROJECT,
  FG_CONFORM_PROJECT_AUTHORITY,
  ODD_SDLC_OPERATOR_RUN_ROOT_RELATIVE_PATH,
  ODD_SDLC_RUNTIME_ROOT_RELATIVE_PATH,
  ODD_SDLC_TRANSFORM_ASSET_ROOT_RELATIVE_PATH
} from "../../build/semantic/code/src/index.js";
import { liveTestArchiveRoot } from "./archive_root.mjs";
import {
  configuredLiveTimeoutMs,
  liveOperatorRuntimePolicy
} from "./operator_runtime_policy.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const RUNTIME_POLICY = liveOperatorRuntimePolicy();
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const FIXTURE_ROOT = resolve(TEST_DIR, "../fixtures/t131_guided_odd_chat");
const BOOTSTRAP_PATH = path.join(FIXTURE_ROOT, "bootstrap.md");
const DOMAIN_PACKAGE_ROOT = path.join(FIXTURE_ROOT, "domains/document_to_requirements");
const DOMAIN_PACKAGE_PATH = path.join(DOMAIN_PACKAGE_ROOT, "domain.json");
const START_DOCUMENT_PATH = path.join(FIXTURE_ROOT, "examples/start_document.md");
const SOURCE_ODD_SDLC_CLI = path.join(PACKAGE_ROOT, "build/semantic/code/src/cli/main.js");
const LIVE_ENABLED = process.env["ODD_SDLC_TS_T131_GUIDED_ODD_CHAT_LIVE"] === "1";
const CONFORMANCE_ONLY = process.env["ODD_SDLC_TS_LIVE_CONFORMANCE_ONLY"] === "1";
const LIVE_WORKER =
  process.env["ODD_SDLC_TS_T131_GUIDED_ODD_CHAT_WORKER"] ??
  "process://codex?model=gpt-5.5&effort=medium";
const MAX_STEPS = Number.parseInt(
  process.env["ODD_SDLC_TS_T131_GUIDED_ODD_CHAT_MAX_STEPS"] ?? "40",
  10
);
const INSTALL_COMMAND_TIMEOUT_MS = configuredLiveTimeoutMs(
  "ODD_SDLC_TS_T131_GUIDED_ODD_CHAT_COMMAND_TIMEOUT_MS",
  RUNTIME_POLICY.liveHarnessCommandTimeoutMs
);
const REQUESTED_INSTALLED_COMMAND_TIMEOUT_MS = Number.parseInt(
  process.env["ODD_SDLC_TS_T131_GUIDED_ODD_CHAT_INSTALLED_COMMAND_TIMEOUT_MS"] ?? "0",
  10
);
const INSTALLED_COMMAND_TIMEOUT_MS =
  REQUESTED_INSTALLED_COMMAND_TIMEOUT_MS > 0
    ? Math.max(
        RUNTIME_POLICY.minimumOperatorTimeoutMs,
        REQUESTED_INSTALLED_COMMAND_TIMEOUT_MS
      )
    : 0;

function archiveTimestamp() {
  return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(".", "");
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function sha256Text(content) {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}

function extractScenarioContract(markdown) {
  const match = markdown.match(/```json scenario_contract\n([\s\S]*?)\n```/u);
  assert.notEqual(match, null, "bootstrap.md must contain a json scenario_contract fence");
  return JSON.parse(match[1]);
}

function assertUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    assert.equal(seen.has(value), false, `${label} contains duplicate ${value}`);
    seen.add(value);
  }
}

function assertIncludesEvery(actual, expected, label) {
  for (const value of expected) {
    assert.equal(actual.includes(value), true, `${label} must include ${value}`);
  }
}

function assertScenarioContract(contract) {
  assert.equal(contract.schemaVersion, "t131.guided_odd_chat.bootstrap.v1");
  assert.equal(contract.scenarioId, "t131_guided_odd_chat_live_build");
  assert.equal(contract.product.name, "odd_chat");
  assert.equal(contract.buildTenant.name, "typescript-node-cli");
  assert.equal(contract.graphRepository.loadMode, "deployed_odd_gtl_abg_domain");
  assert.equal(contract.defaultDomain.name, "document_to_requirements");
  assert.equal(contract.defaultDomain.kind, "odd_gtl_abg_domain");
  assert.equal(contract.builderHarness.builder, "odd_sdlc");
  assert.equal(contract.builderHarness.notRuntimeDependency, true);
  assert.deepEqual(contract.authorityInput, {
    kind: "source_file",
    path: "bootstrap.md",
    graphFunction: FG_CONFORM_PROJECT_AUTHORITY
  });
  assert.equal(contract.workspaceDialogue.purpose.includes("workspace"), true);
  assert.equal(contract.graphFunctionSelection.defaultGraphFunction, "document_to_requirements");
  assert.equal(contract.sandbox.installOddSdlc, true);

  assert.equal(Array.isArray(contract.requirements), true);
  assert.equal(contract.requirements.length >= 9, true);
  assertUnique(contract.requirements.map((row) => row.id), "requirements");
  assertIncludesEvery(
    contract.requirements.map((row) => row.id),
    ["REQ-OCHAT-008", "REQ-OCHAT-009"],
    "requirements"
  );

  const nodes = contract.gtlGraph.nodes;
  const vectors = contract.gtlGraph.vectors;
  const actions = contract.lawfulActions;
  assert.equal(Array.isArray(nodes), true);
  assert.equal(Array.isArray(vectors), true);
  assert.equal(Array.isArray(actions), true);
  assert.equal(nodes.length >= 12, true);
  assert.equal(vectors.length >= 11, true);
  assert.equal(actions.length, vectors.length);

  const nodeIds = nodes.map((node) => node.id);
  const vectorIds = vectors.map((vector) => vector.id);
  const actionIds = actions.map((action) => action.id);
  assertUnique(nodeIds, "gtlGraph.nodes");
  assertUnique(vectorIds, "gtlGraph.vectors");
  assertUnique(actionIds, "lawfulActions");

  assertIncludesEvery(
    nodeIds,
    [
      "asset:start_document",
      "asset:sandbox_workspace",
      "asset:installed_odd_sdlc",
      "asset:implementation",
      "asset:deployment",
      "asset:test_execution",
      "asset:release_readiness"
    ],
    "gtlGraph.nodes"
  );
  assertIncludesEvery(
    vectorIds,
    [
      "vector:setup_sandbox",
      "vector:install_odd_sdlc",
      "vector:build_implementation",
      "vector:deploy_cli",
      "vector:execute_tests",
      "vector:project_release"
    ],
    "gtlGraph.vectors"
  );

  const nodeIdSet = new Set(nodeIds);
  for (const vector of vectors) {
    assert.equal(Array.isArray(vector.source), true, `${vector.id} must declare source refs`);
    assert.equal(vector.source.length > 0, true, `${vector.id} must have source refs`);
    for (const source of vector.source) {
      assert.equal(nodeIdSet.has(source), true, `${vector.id} source ${source} must be a node`);
    }
    assert.equal(nodeIdSet.has(vector.target), true, `${vector.id} target must be a node`);
  }

  const vectorIdSet = new Set(vectorIds);
  const actionVectorSet = new Set();
  for (const action of actions) {
    assert.equal(vectorIdSet.has(action.vector), true, `${action.id} must bind a graph vector`);
    assert.equal(
      actionVectorSet.has(action.vector),
      false,
      `${action.vector} must have one primary lawful action`
    );
    actionVectorSet.add(action.vector);
    assert.equal(typeof action.graphFunction, "string", `${action.id} must name graph function`);
    assert.equal(action.graphFunction.length > 0, true);
    assert.equal(typeof action.expectedCarrier, "string", `${action.id} carrier must be typed`);
    assert.equal(action.expectedCarrier.startsWith("schema://"), true);
    assertIncludesEvery(["continue", "retry", "review", "reprice"], [action.humanDecision], "humanDecision enum");
    assert.equal(typeof action.donePredicate, "string", `${action.id} needs done predicate`);
    assert.equal(action.donePredicate.length > 0, true);
    assert.equal(typeof action.retryAction, "string", `${action.id} needs retry route`);
    assert.equal(action.retryAction.startsWith("action:"), true);
  }

  const domain = contract.defaultDomain;
  const domainNodeIds = domain.nodes.map((node) => node.id);
  const domainVectorIds = domain.vectors.map((vector) => vector.id);
  const domainActionIds = domain.lawfulActions.map((action) => action.id);
  assertIncludesEvery(
    domainNodeIds,
    [
      "asset:input_document",
      "asset:document_observation",
      "asset:requirement_candidates",
      "asset:requirements_set"
    ],
    "defaultDomain.nodes"
  );
  assertIncludesEvery(
    domainVectorIds,
    [
      "domain_vector:observe_document",
      "domain_vector:derive_requirement_candidates",
      "domain_vector:accept_requirements"
    ],
    "defaultDomain.vectors"
  );
  assertIncludesEvery(
    domainActionIds,
    [
      "domain_action:observe_document",
      "domain_action:derive_requirement_candidates",
      "domain_action:accept_requirements"
    ],
    "defaultDomain.lawfulActions"
  );
  assertIncludesEvery(
    contract.workspaceDialogue.commands.map((command) => command.name),
    ["workspace create", "workspace open"],
    "workspaceDialogue.commands"
  );
  assertIncludesEvery(
    contract.graphFunctionSelection.commands.map((command) => command.name),
    ["graph-functions", "select-graph-function"],
    "graphFunctionSelection.commands"
  );

  assertIncludesEvery(
    contract.expectedFiles,
      [
        "build_tenants/typescript/package.json",
        "build_tenants/typescript/tsconfig.json",
        "build_tenants/typescript/src/cli.ts",
        "build_tenants/typescript/src/commands/domain.ts",
        "build_tenants/typescript/src/commands/evidence.ts",
        "build_tenants/typescript/src/commands/graphFunctions.ts",
        "build_tenants/typescript/src/commands/intent.ts",
        "build_tenants/typescript/src/commands/invoke.ts",
        "build_tenants/typescript/src/commands/workspace.ts",
        "build_tenants/typescript/src/app/carrierValidation.ts",
        "build_tenants/typescript/src/app/domainProjection.ts",
        "build_tenants/typescript/src/app/evidenceLedger.ts",
        "build_tenants/typescript/src/app/invocationService.ts",
        "build_tenants/typescript/src/app/workspaceStore.ts",
        "build_tenants/typescript/src/domain/defaultDomainAdapter.ts",
        "build_tenants/typescript/src/domain/domainAdapter.ts",
        "build_tenants/typescript/src/render.ts",
        "build_tenants/typescript/src/types.ts",
        "build_tenants/typescript/test/odd_chat.test.ts"
      ],
    "expectedFiles"
  );
  assertIncludesEvery(Object.keys(contract.commands), [
    "sandboxSetup",
    "installOddSdlc",
    "buildOddChat",
    "deployOddChat",
    "testOddChat"
  ], "commands");
  assert.equal(
    contract.commands.installOddSdlc.some((command) => command.includes("odd-sdlc-ts gaps")),
    true,
    "installOddSdlc commands must prove odd_sdlc can inspect the workspace"
  );
  assert.equal(
    contract.commands.deployOddChat.some((command) => command.includes("npm link")),
    true,
    "deployOddChat commands must install the CLI locally"
  );
  assert.equal(
    contract.commands.testOddChat.some((command) => command.includes("npm test")),
    true,
    "testOddChat commands must run tests"
  );
  assert.equal(
    contract.commands.testOddChat.some((command) => command.includes("workspace create")),
    true,
    "testOddChat commands must prove workspace creation"
  );
  assert.equal(
    contract.commands.conformProjectAuthority.some((command) =>
      command.includes(`graph_function:${FG_CONFORM_PROJECT_AUTHORITY}`)
    ),
    true,
    "conformProjectAuthority commands must use Fg_conform_project_authority"
  );
  assert.equal(
    contract.commands.materializeProduct.some((command) =>
      command.includes("asset:component_code_surface")
    ),
    true,
    "materializeProduct commands must target component_code_surface"
  );
  assert.equal(
    contract.commands.materializeProduct.some((command) =>
      command.includes("bootstrap_release_self_test")
    ),
    false,
    "materializeProduct commands must not use bootstrap_release_self_test"
  );
  assert.equal(
    contract.commands.testOddChat.some((command) => command.includes("graph-functions")),
    true,
    "testOddChat commands must prove graph-function listing"
  );
  assert.equal(
    contract.commands.testOddChat.some((command) => command.includes("select-graph-function")),
    true,
    "testOddChat commands must prove graph-function selection"
  );

  assertIncludesEvery(
    contract.releaseReadiness.requiredEvidence,
    [
      "installed_odd_sdlc_surface",
      "implementation_surface",
      "deployment_surface",
      "workspace_surface",
      "graph_function_selection_surface",
      "test_execution_surface"
    ],
    "releaseReadiness.requiredEvidence"
  );
}

function domainContractShape(domainPackage) {
  return {
    name: domainPackage.name,
    kind: domainPackage.kind,
    purpose: domainPackage.purpose,
    entryAsset: domainPackage.entryAsset,
    terminalAsset: domainPackage.terminalAsset,
    nodes: domainPackage.nodes,
    vectors: domainPackage.vectors,
    lawfulActions: domainPackage.lawfulActions
  };
}

function assertFixtureInputAssets(contract) {
  assert.equal(existsSync(DOMAIN_PACKAGE_PATH), true, "default domain package is missing");
  assert.equal(existsSync(START_DOCUMENT_PATH), true, "start document fixture is missing");

  const domainPackage = readJson(DOMAIN_PACKAGE_PATH);
  assert.equal(domainPackage.schemaVersion, "odd_gtl_abg_domain.v1");
  assert.deepEqual(
    domainContractShape(domainPackage),
    contract.defaultDomain,
    "domain.json must remain the loadable form of bootstrap scenario_contract.defaultDomain"
  );

  const graphFunctionIds = domainPackage.graphFunctions.map((row) => row.id);
  assertIncludesEvery(
    graphFunctionIds,
    [contract.graphFunctionSelection.defaultGraphFunction],
    "deployed domain graphFunctions"
  );
  assertIncludesEvery(
    graphFunctionIds,
    contract.defaultDomain.lawfulActions.map((action) => action.graphFunction),
    "deployed domain graphFunctions"
  );

  const aggregate = domainPackage.graphFunctions.find(
    (row) => row.id === contract.graphFunctionSelection.defaultGraphFunction
  );
  assert.equal(aggregate?.kind, "aggregate");
  assertIncludesEvery(
    aggregate?.composedOf ?? [],
    contract.defaultDomain.lawfulActions.map((action) => action.graphFunction),
    "default aggregate graph function"
  );

  const carrierSchemaIds = domainPackage.carrierSchemas.map((row) => row.id);
  assertIncludesEvery(
    carrierSchemaIds,
    contract.defaultDomain.lawfulActions.map((action) => action.expectedCarrier),
    "deployed domain carrierSchemas"
  );
}

function projectConstraintsText(contract) {
  return [
    "project:",
    `  name: ${contract.sandbox.workspaceSlug}`,
    `active_tenant: ${contract.buildTenant.name}`,
    `selected_output_root: ${contract.buildTenant.sourceRoot}`,
    "ambiguity_risk_appetite: low",
    "runtime:",
    `  root: ${ODD_SDLC_RUNTIME_ROOT_RELATIVE_PATH}`,
    `  transform_asset_root: ${ODD_SDLC_TRANSFORM_ASSET_ROOT_RELATIVE_PATH}`,
    `  operator_run_root: ${ODD_SDLC_OPERATOR_RUN_ROOT_RELATIVE_PATH}`,
    "  product_materialization_root_policy: selected_output_root",
    "build_tenants:",
    `  ${contract.buildTenant.name}:`,
    `    output_dir: ${contract.buildTenant.sourceRoot}/`,
    `    language: ${contract.buildTenant.language}`,
    `    build_tool: ${contract.buildTenant.packageManager}`,
    `    test_runner: ${contract.buildTenant.packageManager}`,
    "    module_structure:",
    `      - ${contract.buildTenant.name}`
  ].join("\n");
}

function expectedRequirementIds(contract) {
  return contract.requirements.map((row) => row.id);
}

function writeBootstrapWorkspace(workspace, bootstrapMarkdown, contract) {
  rmSync(workspace, { recursive: true, force: true });
  mkdirSync(path.join(workspace, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(workspace, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(workspace, "gtl"), { recursive: true });
  mkdirSync(path.join(workspace, "domains/document_to_requirements"), { recursive: true });
  mkdirSync(path.join(workspace, "examples"), { recursive: true });
  mkdirSync(path.join(workspace, ".odd-chat/workspaces"), { recursive: true });
  mkdirSync(path.join(workspace, "build_tenants"), { recursive: true });
  writeFileSync(path.join(workspace, "README.md"), `# ${contract.product.name}\n\n${contract.product.definition}\n`, "utf8");
  writeFileSync(path.join(workspace, "bootstrap.md"), bootstrapMarkdown, "utf8");
  const constraintsText = projectConstraintsText(contract);
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/project_constraints.yml"),
    constraintsText,
    "utf8"
  );
  writeJson(path.join(workspace, "gtl/graph.json"), {
    kind: "t131_guided_odd_chat_builder_graph_projection",
    sourceBootstrapDigest: sha256Text(bootstrapMarkdown),
    role: contract.gtlGraph.role,
    moduleName: contract.gtlGraph.moduleName,
    graphFunction: contract.gtlGraph.graphFunction,
    nodes: contract.gtlGraph.nodes,
    vectors: contract.gtlGraph.vectors,
    lawfulActions: contract.lawfulActions
  });
  cpSync(DOMAIN_PACKAGE_ROOT, path.join(workspace, "domains/document_to_requirements"), {
    recursive: true
  });
  writeJson(path.join(workspace, ".odd-chat/workspace-dialogue-contract.json"), {
    kind: "t131_guided_odd_chat_workspace_dialogue_contract",
    sourceBootstrapDigest: sha256Text(bootstrapMarkdown),
    workspaceDialogue: contract.workspaceDialogue,
    graphFunctionSelection: contract.graphFunctionSelection
  });
  cpSync(START_DOCUMENT_PATH, path.join(workspace, "examples/start_document.md"));
}

function assertNoPrebuiltOddChatImplementation(workspace, contract) {
  const generatedTargetsPresent = contract.expectedFiles
    .filter((relativePath) => relativePath.startsWith(`${contract.buildTenant.sourceRoot}/`))
    .filter((relativePath) => existsSync(path.join(workspace, relativePath)))
    .sort();
  assert.deepEqual(
    generatedTargetsPresent,
    [],
    `bootstrap sandbox must not start with generated odd_chat implementation files: ${generatedTargetsPresent.join(", ")}`
  );
}

function assertBootstrapSourceWorkspace(workspace, contract) {
  assert.equal(existsSync(path.join(workspace, "bootstrap.md")), true);
  assert.equal(
    existsSync(path.join(workspace, ".ai-workspace/context/project_constraints.yml")),
    true
  );
  for (const relativePath of [
    ".ai-workspace/context/project_bootstrap.md",
    "specification/INTENT.md",
    "specification/PRODUCT.md",
    "specification/GOALS.md"
  ]) {
    assert.equal(
      existsSync(path.join(workspace, relativePath)),
      false,
      `sandbox must not pre-materialize ${relativePath}`
    );
  }
  const requirementFiles = readdirSync(path.join(workspace, "specification/requirements"))
    .filter((entry) => entry.endsWith(".md"));
  assert.deepEqual(requirementFiles, []);
  assert.equal(
    readFileSync(path.join(workspace, "domains/document_to_requirements/domain.json"), "utf8"),
    readFileSync(DOMAIN_PACKAGE_PATH, "utf8"),
    "sandbox must carry the fixture domain package, not a synthesized stand-in"
  );
  assert.equal(
    readFileSync(path.join(workspace, "examples/start_document.md"), "utf8"),
    readFileSync(START_DOCUMENT_PATH, "utf8"),
    "sandbox must carry the fixture start document"
  );
  assertNoPrebuiltOddChatImplementation(workspace, contract);
}

function assertConformedProjectWorkspace(workspace, contract) {
  for (const relativePath of [
    ".ai-workspace/context/project_bootstrap.md",
    "specification/INTENT.md",
    "specification/PRODUCT.md",
    "specification/GOALS.md"
  ]) {
    assert.equal(
      existsSync(path.join(workspace, relativePath)),
      true,
      `F_P authority conformance must materialize ${relativePath}`
    );
  }
  const requirementDir = path.join(workspace, "specification/requirements");
  const requirementFiles = readdirSync(requirementDir)
    .filter((entry) => entry.endsWith(".md"))
    .sort();
  assert.ok(
    requirementFiles.length > 0,
    "F_P authority conformance must induce at least one requirement surface"
  );
  const requirementText = requirementFiles
    .map((file) => readFileSync(path.join(requirementDir, file), "utf8"))
    .join("\n");
  for (const requirementId of expectedRequirementIds(contract)) {
    assert.match(requirementText, new RegExp(`\\b${requirementId}\\b`, "u"));
  }
}

function installedOddSdlcCommand(install) {
  const commandPath = install.commandPaths.find(
    (candidate) => path.basename(candidate) === "odd-sdlc-ts"
  );
  assert(commandPath, "odd-sdlc-ts command path missing");
  return commandPath;
}

function installedCommandEnv() {
  const env = { ...process.env };
  delete env.ODD_SDLC_TS_TEST_RUN_ROOT;
  delete env.ODD_SDLC_TS_LIVE_TEST_RUN_ROOT;
  return {
    ...env,
    ODD_SDLC_TS_OUTPUT: "json",
    ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal",
    ABG_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal"
  };
}

function runSourceInstallCommand(workspace, archiveRoot) {
  const args = [
    SOURCE_ODD_SDLC_CLI,
    "install",
    "--target",
    workspace,
    "--package-source",
    PACKAGE_ROOT,
    "--abg-package-source",
    ABG_TYPESCRIPT_ROOT,
    "--installed-package-name",
    "odd-sdlc-t131-guided-odd-chat"
  ];
  const run = spawnSync(process.execPath, args, {
    cwd: PACKAGE_ROOT,
    encoding: "utf8",
    env: installedCommandEnv(),
    maxBuffer: 1024 * 1024 * 50,
    timeout: INSTALL_COMMAND_TIMEOUT_MS
  });
  writeJson(path.join(archiveRoot, "install.process.json"), {
    label: "install",
    commandPath: process.execPath,
    args,
    cwd: PACKAGE_ROOT,
    status: run.status,
    signal: run.signal,
    error: run.error?.message ?? null,
    timeoutMs: INSTALL_COMMAND_TIMEOUT_MS,
    stdoutBytes: Buffer.byteLength(run.stdout ?? "", "utf8"),
    stderrBytes: Buffer.byteLength(run.stderr ?? "", "utf8")
  });
  writeFileSync(path.join(archiveRoot, "install.stdout.json"), run.stdout ?? "", "utf8");
  writeFileSync(path.join(archiveRoot, "install.stderr.log"), run.stderr ?? "", "utf8");
  assert.equal(run.status, 0, run.stderr || run.error?.message);
  const result = JSON.parse(run.stdout);
  writeJson(path.join(archiveRoot, "install_result.json"), result);
  assert.equal(result.kind, "odd_sdlc_spec_method_result");
  assert.equal(result.command, "install");
  assert.equal(result.status, "ok");
  assert.equal(result.payload?.kind, "installed");
  return result.payload;
}

function runInstalled(commandPath, args, workspace, archiveRoot, label) {
  const options = {
    cwd: workspace,
    encoding: "utf8",
    env: installedCommandEnv(),
    maxBuffer: 1024 * 1024 * 50
  };
  if (INSTALLED_COMMAND_TIMEOUT_MS > 0) {
    options.timeout = INSTALLED_COMMAND_TIMEOUT_MS;
  }
  const run = spawnSync(commandPath, args, options);
  const record = {
    label,
    commandPath,
    args,
    cwd: workspace,
    status: run.status,
    signal: run.signal,
    error: run.error?.message ?? null,
    timeoutMs: INSTALLED_COMMAND_TIMEOUT_MS > 0 ? INSTALLED_COMMAND_TIMEOUT_MS : null,
    stdoutBytes: Buffer.byteLength(run.stdout ?? "", "utf8"),
    stderr: run.stderr
  };
  writeJson(path.join(archiveRoot, `${label}.process.json`), record);
  writeFileSync(path.join(archiveRoot, `${label}.stdout.json`), run.stdout ?? "", "utf8");
  writeFileSync(path.join(archiveRoot, `${label}.stderr.log`), run.stderr ?? "", "utf8");
  assert.equal(run.status, 0, run.stderr || JSON.stringify(record, null, 2));
  const parsed = JSON.parse(run.stdout);
  assert.equal(parsed.kind, "odd_sdlc_spec_method_result");
  assert.equal(parsed.status, "ok", JSON.stringify(parsed, null, 2));
  return parsed.payload;
}

function runGeneratedOddChatCommand(workspace, archiveRoot, label, command, args) {
  const tenantRoot = path.join(workspace, "build_tenants/typescript");
  const run = spawnSync(command, args, {
    cwd: tenantRoot,
    encoding: "utf8",
    env: installedCommandEnv(),
    maxBuffer: 1024 * 1024 * 20,
    timeout: INSTALL_COMMAND_TIMEOUT_MS
  });
  const record = {
    label,
    command,
    args,
    cwd: tenantRoot,
    status: run.status,
    signal: run.signal,
    error: run.error?.message ?? null,
    timeoutMs: INSTALL_COMMAND_TIMEOUT_MS,
    stdoutBytes: Buffer.byteLength(run.stdout ?? "", "utf8"),
    stderrBytes: Buffer.byteLength(run.stderr ?? "", "utf8")
  };
  writeJson(path.join(archiveRoot, `${label}.process.json`), record);
  writeFileSync(path.join(archiveRoot, `${label}.stdout.log`), run.stdout ?? "", "utf8");
  writeFileSync(path.join(archiveRoot, `${label}.stderr.log`), run.stderr ?? "", "utf8");
  assert.equal(run.status, 0, run.stderr || run.error?.message || JSON.stringify(record, null, 2));
  return record;
}

function proveGeneratedOddChat(workspace, archiveRoot) {
  const proof = [
    runGeneratedOddChatCommand(workspace, archiveRoot, "odd-chat-npm-install", "npm", ["install"]),
    runGeneratedOddChatCommand(workspace, archiveRoot, "odd-chat-npm-build", "npm", ["run", "build"]),
    runGeneratedOddChatCommand(workspace, archiveRoot, "odd-chat-npm-test", "npm", ["test"])
  ];
  writeJson(path.join(archiveRoot, "odd_chat_execution_proof.json"), {
    kind: "t131_guided_odd_chat_execution_proof",
    workspace,
    commands: proof
  });
  return proof;
}

function edgeSummary(payload) {
  return {
    status: payload.status,
    currentEdge: payload.projection?.currentEdge ?? payload.summary?.currentEdge ?? null,
    summaryEdge: payload.summary?.currentEdge ?? null,
    graphFunction: payload.summary?.graphFunctionName ?? null,
    postflight: payload.postflight?.status ?? null,
    assurance: payload.assuranceSatisfaction?.status ?? null,
    blockingReason: payload.summary?.blockingReason ?? payload.blockingReason ?? null,
    archiveRoot: payload.archiveRoot ?? payload.summary?.archiveRoot ?? null
  };
}

function listFilesRecursively(root) {
  if (!existsSync(root)) {
    return [];
  }
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(child);
      } else if (entry.isFile()) {
        files.push(child);
      }
    }
  }
  return files.sort();
}

function generatedProductState(workspace, contract) {
  const expectedFiles = contract.expectedFiles.map((relativePath) => ({
    relativePath,
    exists: existsSync(path.join(workspace, relativePath))
  }));
  const runtimeRoot = path.join(workspace, ".ai-workspace/runtime/odd_sdlc");
  const runtimeFiles = listFilesRecursively(runtimeRoot).map((candidate) =>
    path.relative(workspace, candidate)
  );
  return {
    expectedFiles,
    expectedFilesPresent: expectedFiles.every((row) => row.exists),
    runtimeFiles: runtimeFiles.slice(-100),
    runtimeFileCount: runtimeFiles.length,
    generatedAtMtimeMs: statSync(workspace).mtimeMs
  };
}

test("T-131 bootstrap document is a complete guided odd_chat scenario contract", () => {
  const bootstrapMarkdown = readFileSync(BOOTSTRAP_PATH, "utf8");
  const contract = extractScenarioContract(bootstrapMarkdown);
  assertScenarioContract(contract);
  assertFixtureInputAssets(contract);

  const archiveRoot = resolve(
    liveTestArchiveRoot("t131_guided_odd_chat_contract", archiveTimestamp(), process.pid)
  );
  writeJson(path.join(archiveRoot, "scenario_contract_snapshot.json"), {
    bootstrapPath: BOOTSTRAP_PATH,
    bootstrapDigest: sha256Text(bootstrapMarkdown),
    contract
  });
});

test("T-131 bootstrap-only sandbox has no prebuilt odd_chat implementation", () => {
  const bootstrapMarkdown = readFileSync(BOOTSTRAP_PATH, "utf8");
  const contract = extractScenarioContract(bootstrapMarkdown);
  assertScenarioContract(contract);
  assertFixtureInputAssets(contract);

  const archiveRoot = resolve(
    liveTestArchiveRoot("t131_guided_odd_chat_bootstrap_fixture", archiveTimestamp(), process.pid)
  );
  const workspace = path.join(archiveRoot, "workspace");
  writeBootstrapWorkspace(workspace, bootstrapMarkdown, contract);
  assertBootstrapSourceWorkspace(workspace, contract);
  writeJson(path.join(archiveRoot, "bootstrap_sandbox_snapshot.json"), {
    workspace,
    bootstrapDigest: sha256Text(bootstrapMarkdown),
    generatedGraphProjection: "gtl/graph.json",
    absentTargetFiles: contract.expectedFiles
  });
});

test(
  "T-131 live guided odd_chat build starts from bootstrap, installs odd_sdlc, and builds target files through installed traversal",
  { skip: LIVE_ENABLED ? false : "ODD_SDLC_TS_T131_GUIDED_ODD_CHAT_LIVE=1 not set" },
  async () => {
    const bootstrapMarkdown = readFileSync(BOOTSTRAP_PATH, "utf8");
    const contract = extractScenarioContract(bootstrapMarkdown);
    assertScenarioContract(contract);
    assertFixtureInputAssets(contract);

    const archiveRoot = resolve(
      liveTestArchiveRoot(
        "t131_guided_odd_chat_bootstrap_sandbox",
        archiveTimestamp(),
        process.pid
      )
    );
    const workspace = path.join(archiveRoot, "workspace");
    writeBootstrapWorkspace(workspace, bootstrapMarkdown, contract);
    assertBootstrapSourceWorkspace(workspace, contract);
    writeJson(path.join(archiveRoot, "scenario_contract_snapshot.json"), {
      bootstrapPath: BOOTSTRAP_PATH,
      bootstrapDigest: sha256Text(bootstrapMarkdown),
      contract
    });

    const install = runSourceInstallCommand(workspace, archiveRoot);
    assert.equal(install.kind, "installed");
    const commandPath = installedOddSdlcCommand(install);
    assert.equal(existsSync(path.join(workspace, "node_modules/.bin/odd-sdlc-ts")), true);

    const steps = [];
    const target = "asset:component_code_surface";
    let terminalState = generatedProductState(workspace, contract);
    writeJson(path.join(archiveRoot, "initial_generated_product_state.json"), terminalState);
    assert.equal(terminalState.expectedFilesPresent, false);

    const conformance = runInstalled(
      commandPath,
      ["start", "--workspace", workspace, "--until", "blocked"],
      workspace,
      archiveRoot,
      "bootstrap-conform-project-start"
    );
    const conformanceSummary = edgeSummary(conformance);
    steps.push({ step: -2, phase: "conform_project", ...conformanceSummary });
    writeJson(path.join(archiveRoot, "bootstrap_conform_project_summary.json"), conformanceSummary);
    assert.notEqual(
      conformanceSummary.blockingReason,
      "target_unavailable",
      "Fg_conform_project must be available before project authority conformance"
    );

    const bootstrap = runInstalled(
      commandPath,
      [
        "start",
        "--workspace",
        workspace,
        "--target",
        `graph_function:${FG_CONFORM_PROJECT_AUTHORITY}`,
        "--until",
        "first_traversal",
        "--worker",
        LIVE_WORKER
      ],
      workspace,
      archiveRoot,
      "bootstrap-authority-start"
    );
    const bootstrapSummary = edgeSummary(bootstrap);
    steps.push({ step: -1, phase: "bootstrap_authority", ...bootstrapSummary });
    writeJson(path.join(archiveRoot, "bootstrap_authority_summary.json"), bootstrapSummary);
    assert.notEqual(
      bootstrapSummary.blockingReason,
      "target_unavailable",
      "Fg_conform_project_authority must be a published bootstrap target"
    );
    assertConformedProjectWorkspace(workspace, contract);
    if (CONFORMANCE_ONLY) {
      writeJson(path.join(archiveRoot, "steps.json"), steps);
      writeJson(path.join(archiveRoot, "run_summary.json"), {
        verdict: "conformance_passed",
        workspace,
        worker: LIVE_WORKER,
        completionController: "authority_conformance_only",
        maxSteps: MAX_STEPS,
        installCommandTimeoutMs: INSTALL_COMMAND_TIMEOUT_MS,
        installedCommandTimeoutMs:
          INSTALLED_COMMAND_TIMEOUT_MS > 0 ? INSTALLED_COMMAND_TIMEOUT_MS : null,
        steps,
        generatedProductState: terminalState
      });
      return;
    }

    for (let step = 0; step < MAX_STEPS; step += 1) {
      const gaps = runInstalled(
        commandPath,
        ["gaps", "--workspace", workspace],
        workspace,
        archiveRoot,
        `step-${String(step).padStart(2, "0")}-gaps`
      );
      const currentEdge = gaps.projection.currentEdge;
      steps.push({ step, phase: "gaps", ...edgeSummary(gaps) });
      writeJson(path.join(archiveRoot, "steps.json"), steps);
      if (currentEdge === null) {
        break;
      }
      if (currentEdge === FG_CONFORM_PROJECT) {
        const induction = runInstalled(
          commandPath,
          ["start", "--workspace", workspace, "--until", "blocked"],
          workspace,
          archiveRoot,
          `step-${String(step).padStart(2, "0")}-induction`
        );
        steps.push({ step, phase: "induction", ...edgeSummary(induction) });
      } else {
        const start = runInstalled(
          commandPath,
          [
            "start",
            "--workspace",
            workspace,
            "--target",
            target,
            "--until",
            "first_traversal",
            "--worker",
            LIVE_WORKER
          ],
          workspace,
          archiveRoot,
          `step-${String(step).padStart(2, "0")}-start-${currentEdge}`
        );
        steps.push({ step, phase: "start", requestedEdge: currentEdge, ...edgeSummary(start) });
        assert(
          start.status === "worker_invoked" || start.status === "converged" || start.status === "blocked",
          JSON.stringify(start, null, 2)
        );
        if (start.workerRun !== null) {
          assert.equal(start.workerRun.executorProfile, "pty-terminal");
          assert.equal(start.workerRun.streamModel, "terminal-transcript");
        }
      }
      terminalState = generatedProductState(workspace, contract);
      writeJson(
        path.join(archiveRoot, `step-${String(step).padStart(2, "0")}-generated-product-state.json`),
        terminalState
      );
      writeJson(path.join(archiveRoot, "steps.json"), steps);
      if (terminalState.expectedFilesPresent) {
        break;
      }
    }

    terminalState = generatedProductState(workspace, contract);
    writeJson(path.join(archiveRoot, "run_summary.json"), {
      verdict: terminalState.expectedFilesPresent ? "passed" : "incomplete",
      workspace,
      worker: LIVE_WORKER,
      maxSteps: MAX_STEPS,
      installCommandTimeoutMs: INSTALL_COMMAND_TIMEOUT_MS,
      installedCommandTimeoutMs: INSTALLED_COMMAND_TIMEOUT_MS > 0 ? INSTALLED_COMMAND_TIMEOUT_MS : null,
      steps,
      generatedProductState: terminalState
    });
    assert.equal(
      terminalState.expectedFilesPresent,
      true,
      `live build did not produce all expected odd_chat target files: ${JSON.stringify(terminalState.expectedFiles, null, 2)}`
    );
    const oddChatExecutionProof = proveGeneratedOddChat(workspace, archiveRoot);
    writeJson(path.join(archiveRoot, "run_summary.json"), {
      verdict: "passed",
      workspace,
      worker: LIVE_WORKER,
      maxSteps: MAX_STEPS,
      installCommandTimeoutMs: INSTALL_COMMAND_TIMEOUT_MS,
      installedCommandTimeoutMs: INSTALLED_COMMAND_TIMEOUT_MS > 0 ? INSTALLED_COMMAND_TIMEOUT_MS : null,
      steps,
      generatedProductState: terminalState,
      oddChatExecutionProof
    });
  }
);
