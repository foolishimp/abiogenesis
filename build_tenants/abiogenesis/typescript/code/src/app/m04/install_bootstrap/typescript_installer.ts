// Implements: REQ-P-QUAL-018G
// Implements: REQ-P-QUAL-018H
// Implements: REQ-P-SCENARIOS
// Implements: REQ-P-INSTALL

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { parsePlainObject } from "../../../shared/validation/primitives.js";
import { installBootstrap } from "./install.js";
import { admitAbgTypescriptInstallerRequest } from "./typescript_installer_admission.js";
import {
  constructAbgTypescriptInstallerManifest,
  constructAbgTypescriptInstallerOutcome,
  constructInstalledAbgTypescriptInstallerOutcome,
  constructRejectedAbgTypescriptInstallerOutcome
} from "./typescript_installer_constructors.js";
import {
  constructAbiogenesisProductToolchainBinding,
  constructWorkspaceToolchainBinding,
  resolveToolchainRoot,
  TOOLCHAIN_BINDING_RELATIVE_PATH
} from "../toolchain_binding/index.js";
import {
  injectMarkedSection,
  type DeliveryWriter
} from "../../../shared/abg_delivery_library/index.js";
import type { PublicInstallBootstrapInstalled } from "./carriers.js";
import type {
  ToolchainMutableStateRootInput,
  ToolchainSelectionSource,
  ToolchainWorkspaceBinding
} from "../toolchain_binding/index.js";
import type {
  AbgTypescriptInstallerFileEvidence,
  AbgTypescriptInstallerOutcome,
  AbgTypescriptInstallerRequest,
  AbgTypescriptInstallerRuntimeIdentity,
  AbgTypescriptInstallerTopologyVerification
} from "./typescript_installer_carriers.js";

interface PackageIdentity {
  readonly packageName: string;
  readonly packageVersion: string;
  readonly dependencies: readonly string[];
}

export interface AbgContextBootstrapOutcome {
  readonly kind: "context_bootstrap_installed";
  readonly targetRoot: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly toolchainRoot: string;
  readonly toolchainBindingPath: string;
  readonly toolchainBinding: ToolchainWorkspaceBinding;
  readonly installedContextPath: string;
  readonly installedContextFile: AbgTypescriptInstallerFileEvidence;
  readonly installedInstructionFiles: readonly AbgTypescriptInstallerFileEvidence[];
  readonly aiWorkspaceDirectories: readonly string[];
}

type TargetMode = "imported" | "clean_no_project_authority";
type InstallMode = "fresh" | "refresh";

const REQUIRED_STANDARDS_SMOKE_FILES = Object.freeze([
  "README.md",
  "SPEC_METHOD.md",
  "TICKET_METHOD.md",
  "DESIGN_MODULE_METHOD.md",
  "ODD_METHOD.md",
  "UX_METHOD.md",
  "IDENTITY_METHOD.md",
  "WORLD_MODEL_METHOD.md",
  "RELEASE_METHOD.md",
  "WRITING_GUIDE.md",
  "POSTING_GUIDE.md",
  "GLOSSARY_GUIDE.md",
  "templates/README.md"
] as const);

const REQUIRED_DOC_FILES = Object.freeze([
  "README.md",
  "LLM_GTL_APP_BUILDER_GUIDE.md",
  "USER_GUIDE.md"
] as const);

// One consolidated config file holds the levers / fallbacks / targetCarriers
// sections, installed at .abiogenesis/config/abg.config.json.
const REFERENCE_ABG_CONFIG_RELATIVE_PATH = join("config", "abg.config.json");

const INSTALLED_ABG_CONFIG_RELATIVE_PATH = join(
  ".abiogenesis",
  "config",
  "abg.config.json"
);

const INSTALLED_ABG_GTL_CONTEXT_RELATIVE_PATH = join(
  ".abiogenesis",
  "context",
  "ABG_GTL_CONTEXT.md"
);

const ABG_GTL_CONTEXT_MARKERS = Object.freeze({
  startMarker: "<!-- ABG_GTL_CONTEXT_START -->",
  endMarker: "<!-- ABG_GTL_CONTEXT_END -->"
});

const ABG_GTL_CONTEXT_INSTRUCTION_FILES = Object.freeze([
  "AGENTS.md",
  "CLAUDE.md"
] as const);

const AI_WORKSPACE_CONTEXT_DIRECTORIES = Object.freeze([
  ".ai-workspace",
  join(".ai-workspace", "comments"),
  join(".ai-workspace", "comments", "codex"),
  join(".ai-workspace", "tickets"),
  join(".ai-workspace", "tickets", "active"),
  join(".ai-workspace", "tickets", "backlog"),
  join(".ai-workspace", "tickets", "completed"),
  join(".ai-workspace", "events"),
  join(".ai-workspace", "runtime"),
  join(".ai-workspace", "projections"),
  join(".ai-workspace", "archives")
] as const);

function isNodeErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error["code"] === code
  );
}

function stringifyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function pathIsFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch (error: unknown) {
    if (isNodeErrorCode(error, "ENOENT")) {
      return false;
    }
    throw error;
  }
}

function nodeDeliveryWriter(): DeliveryWriter {
  return Object.freeze({
    async ensureDirectory(targetPath: string): Promise<void> {
      await mkdir(targetPath, { recursive: true });
    },
    async writeTextFile(targetPath: string, content: string): Promise<void> {
      await mkdir(dirname(targetPath), { recursive: true });
      await writeFile(targetPath, content, "utf8");
    },
    async readTextFile(targetPath: string): Promise<string | null> {
      try {
        return await readFile(targetPath, "utf8");
      } catch (error: unknown) {
        if (isNodeErrorCode(error, "ENOENT")) {
          return null;
        }
        throw error;
      }
    },
    async isDirectory(targetPath: string): Promise<boolean> {
      try {
        return (await stat(targetPath)).isDirectory();
      } catch (error: unknown) {
        if (isNodeErrorCode(error, "ENOENT")) {
          return false;
        }
        throw error;
      }
    },
    async isFile(targetPath: string): Promise<boolean> {
      try {
        return (await stat(targetPath)).isFile();
      } catch (error: unknown) {
        if (isNodeErrorCode(error, "ENOENT")) {
          return false;
        }
        throw error;
      }
    }
  });
}

function dependencyNames(input: Record<string, unknown>): readonly string[] {
  const dependencies = input["dependencies"];
  if (dependencies === undefined) {
    return Object.freeze([]);
  }
  const dependencyMap = parsePlainObject(
    dependencies,
    "package.json.dependencies"
  );
  return Object.freeze(Object.keys(dependencyMap).sort());
}

async function readPackageIdentity(
  packageSourceRoot: string
): Promise<PackageIdentity> {
  const raw = await readFile(join(packageSourceRoot, "package.json"), "utf8");
  const packageJson = parsePlainObject(JSON.parse(raw), "package.json");
  const packageName = packageJson["name"];
  const packageVersion = packageJson["version"];
  if (typeof packageName !== "string" || packageName.length === 0) {
    throw new TypeError("package.json.name: expected a non-empty string");
  }
  if (typeof packageVersion !== "string" || packageVersion.length === 0) {
    throw new TypeError("package.json.version: expected a non-empty string");
  }
  return Object.freeze({
    packageName,
    packageVersion,
    dependencies: dependencyNames(packageJson)
  });
}

function runtimeIdentityForPackage(
  identity: PackageIdentity
): AbgTypescriptInstallerRuntimeIdentity {
  return Object.freeze({
    workerId: "abiogenesis-typescript-installer",
    backendId: "node",
    buildId: identity.packageVersion,
    resolvedRuntimeRef: `package:${identity.packageName}@${identity.packageVersion}`
  });
}

function packedTarballName(stdout: string): string {
  const lines = stdout
    .trim()
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.endsWith(".tgz"));
  const last = lines.at(-1);
  if (last === undefined) {
    throw new Error(`npm pack did not report a tarball name\n${stdout}`);
  }
  return last;
}

function assertSpawnSucceeded(
  status: number | null,
  stdout: string,
  stderr: string,
  label: string
): void {
  if (status !== 0) {
    throw new Error(
      `${label} failed with status ${status ?? "null"}\nstdout:\n${stdout}\nstderr:\n${stderr}`
    );
  }
}

async function packPackage(input: {
  readonly request: AbgTypescriptInstallerRequest;
  readonly packParent: string;
}): Promise<string> {
  const request = input.request;
  const packParent = input.packParent;
  await mkdir(packParent, { recursive: true });
  const packRoot = await mkdtemp(join(packParent, "pack-"));
  const packRun = spawnSync(
    "npm",
    ["pack", "--pack-destination", packRoot, "--silent"],
    {
      cwd: request.packageSourceRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        npm_config_cache: join(request.targetRoot.rootPath, ".npm-cache")
      }
    }
  );
  assertSpawnSucceeded(
    packRun.status,
    packRun.stdout,
    packRun.stderr,
    "npm pack"
  );
  return join(packRoot, packedTarballName(packRun.stdout));
}

async function pathIsDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch (error: unknown) {
    if (isNodeErrorCode(error, "ENOENT")) {
      return false;
    }
    throw error;
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error: unknown) {
    if (isNodeErrorCode(error, "ENOENT")) {
      return false;
    }
    throw error;
  }
}

async function detectTargetMode(targetRoot: string): Promise<TargetMode> {
  for (const relativePath of [
    "specification",
    "build_tenants",
    "docs",
    "README.md"
  ]) {
    if (await pathExists(join(targetRoot, relativePath))) {
      return "imported";
    }
  }
  return "clean_no_project_authority";
}

async function detectInstallMode(targetRoot: string): Promise<InstallMode> {
  for (const relativePath of [
    join(".abiogenesis", "typescript-installer-manifest.json"),
    join(".abiogenesis", "install-manifest.json"),
    join(".abiogenesis", "install-provenance.json")
  ]) {
    if (await pathExists(join(targetRoot, relativePath))) {
      return "refresh";
    }
  }
  return "fresh";
}

async function findUpwardDirectory(
  startRoot: string,
  candidates: readonly string[]
): Promise<string | null> {
  let current = startRoot;
  while (current !== dirname(current)) {
    for (const candidate of candidates) {
      const candidateRoot = join(current, candidate);
      if (await pathIsDirectory(candidateRoot)) {
        return candidateRoot;
      }
    }
    current = dirname(current);
  }
  return null;
}

async function resolveStandardsSourceRoot(
  request: AbgTypescriptInstallerRequest
): Promise<string> {
  if (request.standardsSourceRoot !== null) {
    return request.standardsSourceRoot;
  }
  const sourceRoot = await findUpwardDirectory(request.packageSourceRoot, [
    join("docs", "standards"),
    join(".abiogenesis", "docs", "standards"),
    join("specification_methodology", "specification", "standards")
  ]);
  if (sourceRoot === null) {
    throw new Error("unable to locate specification methodology standards source");
  }
  return sourceRoot;
}

async function resolveDocsSourceRoot(
  request: AbgTypescriptInstallerRequest
): Promise<string> {
  if (request.docsSourceRoot !== null) {
    return request.docsSourceRoot;
  }
  const sourceRoot = await findUpwardDirectory(request.packageSourceRoot, [
    join(".abiogenesis", "docs"),
    "docs"
  ]);
  if (sourceRoot === null) {
    throw new Error("unable to locate ABIogenesis docs source");
  }
  return sourceRoot;
}

function sha256(content: Uint8Array): string {
  return createHash("sha256").update(content).digest("hex");
}

function sha256Text(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function fileEvidence(
  root: string,
  relativePath: string
): Promise<AbgTypescriptInstallerFileEvidence> {
  const content = await readFile(join(root, relativePath));
  return Object.freeze({
    relativePath,
    bytes: content.byteLength,
    sha256: sha256(content)
  });
}

async function treeFileEvidence(
  root: string,
  prefix = ""
): Promise<readonly AbgTypescriptInstallerFileEvidence[]> {
  const entries = await readdir(join(root, prefix), { withFileTypes: true });
  const evidence: AbgTypescriptInstallerFileEvidence[] = [];
  for (const entry of [...entries].sort((left, right) =>
    left.name.localeCompare(right.name)
  )) {
    const relativePath = prefix.length === 0 ? entry.name : join(prefix, entry.name);
    if (entry.isDirectory()) {
      evidence.push(...(await treeFileEvidence(root, relativePath)));
    } else if (entry.isFile()) {
      evidence.push(await fileEvidence(root, relativePath));
    }
  }
  return Object.freeze(evidence);
}

async function copyStandardsTree(
  sourceRoot: string,
  targetRoot: string
): Promise<readonly AbgTypescriptInstallerFileEvidence[]> {
  if (sourceRoot !== targetRoot) {
    await rm(targetRoot, { recursive: true, force: true });
    await mkdir(dirname(targetRoot), { recursive: true });
    await cp(sourceRoot, targetRoot, { recursive: true });
  }
  return treeFileEvidence(targetRoot);
}

async function copyDocsFiles(
  sourceRoot: string,
  targetRoot: string
): Promise<readonly AbgTypescriptInstallerFileEvidence[]> {
  await mkdir(targetRoot, { recursive: true });
  for (const filename of REQUIRED_DOC_FILES) {
    const sourcePath = join(sourceRoot, filename);
    if (!(await pathIsFile(sourcePath))) {
      throw new Error(`missing ABIogenesis docs source file ${sourcePath}`);
    }
    await cp(sourcePath, join(targetRoot, filename), { recursive: false });
  }
  const evidence: AbgTypescriptInstallerFileEvidence[] = [];
  for (const filename of REQUIRED_DOC_FILES) {
    evidence.push(await fileEvidence(targetRoot, filename));
  }
  return Object.freeze(evidence);
}

async function copyAbgConfig(input: {
  readonly packageSourceRoot: string;
  readonly targetRoot: string;
}): Promise<{
  readonly sourcePath: string;
  readonly targetPath: string;
  readonly evidence: AbgTypescriptInstallerFileEvidence;
}> {
  const sourcePath = join(
    input.packageSourceRoot,
    REFERENCE_ABG_CONFIG_RELATIVE_PATH
  );
  if (!(await pathIsFile(sourcePath))) {
    throw new Error(`missing ABG fallback config source file ${sourcePath}`);
  }
  const targetPath = join(
    input.targetRoot,
    INSTALLED_ABG_CONFIG_RELATIVE_PATH
  );
  await mkdir(dirname(targetPath), { recursive: true });
  if (!(await pathIsFile(targetPath))) {
    await cp(sourcePath, targetPath, { recursive: false });
  }
  return Object.freeze({
    sourcePath,
    targetPath,
    evidence: await fileEvidence(
      input.targetRoot,
      INSTALLED_ABG_CONFIG_RELATIVE_PATH
    )
  });
}

function installedAbgGtlContextContent(identity: PackageIdentity): string {
  return `# Installed ABG/GTL Context Compression

Version: ${identity.packageVersion}
Package: ${identity.packageName}

This context is owned by the installed ABG/GTL product version. Refresh it with
the ABIogenesis installer; do not hand-maintain it as downstream source truth.

Authoritative source surfaces:
- specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md
- specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md
- specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
- specification/requirements/product/REQ-P-INSTALL.md

Core chain:

\`\`\`text
graph-function library -> graph overlay/program -> workspace binding -> ABG traversal -> replay interpretation
\`\`\`

Installed axioms:
- A GraphFunction is a reusable workflow library function or callable work
  contract.
- A graph overlay or GTL program composition is the program surface. It binds
  graph functions, node types, starts, roles, security, policies, proof
  obligations, plugin contracts, result contracts, and allowed bindings.
- A workspace is the mutable program instance surface. It may provide bootstrap
  config, files, observed state, generated artifacts, run archives, and
  operator data. It does not select traversal, call vectors, own closure, or
  replace ABG startup/admission.
- ABG traversal owns startup, registry projection, selection, graph-call
  opening, vector progression, instruction assembly, worker/effect dispatch,
  admission, fold, residual, continuation, re-entry, block, terminal
  projection, and replay truth.
- Downstream products may publish specialized graph functions and overlays
  through GTL declarations consumed by ABG. They must not create local prompt
  shells, registries, ledgers, traversal loops, closure truth, or duplicate
  runtime state.
- F_D applies only over known algebra or total functions. F_P/F_H outputs may
  provide admitted evidence or policy judgment, but they do not become
  deterministic traversal law without F_D conformance over admitted truth.
- Instruction and prompt envelopes are ABG-rendered projections over admitted
  carriers. Product templates are data; product renderers are not authority to
  inject a separate prompt shell.
- Tests that claim traversal parity must enter through admitted GTL program and
  workspace startup, or through a documented ABG resume boundary, and must read
  replay truth for traversal-affecting results. Direct vector, plugin, worker,
  or script calls are not traversal parity.
`;
}

async function writeInstalledAbgGtlContext(input: {
  readonly targetRoot: string;
  readonly identity: PackageIdentity;
}): Promise<{
  readonly contextPath: string;
  readonly contextFile: AbgTypescriptInstallerFileEvidence;
  readonly instructionFiles: readonly AbgTypescriptInstallerFileEvidence[];
}> {
  const content = installedAbgGtlContextContent(input.identity);
  const contextPath = join(
    input.targetRoot,
    INSTALLED_ABG_GTL_CONTEXT_RELATIVE_PATH
  );
  await mkdir(dirname(contextPath), { recursive: true });
  await writeFile(contextPath, content, "utf8");

  const instructionFiles: AbgTypescriptInstallerFileEvidence[] = [];
  for (const relativePath of ABG_GTL_CONTEXT_INSTRUCTION_FILES) {
    const targetPath = join(input.targetRoot, relativePath);
    let existingContent: string | null = null;
    try {
      existingContent = await readFile(targetPath, "utf8");
    } catch (error: unknown) {
      if (!isNodeErrorCode(error, "ENOENT")) {
        throw error;
      }
    }
    const injected = injectMarkedSection(existingContent, {
      markers: ABG_GTL_CONTEXT_MARKERS,
      targetFile: { relativePath },
      sectionContent: content
    });
    if (injected.kind === "updated") {
      await mkdir(dirname(targetPath), { recursive: true });
      await writeFile(targetPath, injected.content, "utf8");
    }
    instructionFiles.push(await fileEvidence(input.targetRoot, relativePath));
  }

  return Object.freeze({
    contextPath,
    contextFile: await fileEvidence(
      input.targetRoot,
      INSTALLED_ABG_GTL_CONTEXT_RELATIVE_PATH
    ),
    instructionFiles: Object.freeze(instructionFiles)
  });
}

async function ensureAiWorkspaceContextDirectories(
  targetRoot: string
): Promise<readonly string[]> {
  const created: string[] = [];
  for (const relativePath of AI_WORKSPACE_CONTEXT_DIRECTORIES) {
    await mkdir(join(targetRoot, relativePath), { recursive: true });
    created.push(relativePath);
  }
  return Object.freeze(created);
}

function contextBootstrapRequest(input: unknown): {
  readonly targetRoot: string;
  readonly packageSourceRoot: string;
  readonly toolchainRoot: string | null;
  readonly mutableStateRoots: ToolchainMutableStateRootInput | null;
  readonly initializeAiWorkspace: boolean;
} {
  const request = parsePlainObject(input, "ABG context bootstrap request");
  const targetRoot = request["targetRoot"];
  const packageSourceRoot = request["packageSourceRoot"];
  const toolchainRoot = request["toolchainRoot"];
  const mutableStateRoots = request["mutableStateRoots"];
  const initializeAiWorkspace = request["initializeAiWorkspace"];
  if (typeof targetRoot !== "string" || targetRoot.length === 0) {
    throw new TypeError("ABG context bootstrap targetRoot must be non-empty");
  }
  if (
    typeof packageSourceRoot !== "string" ||
    packageSourceRoot.length === 0
  ) {
    throw new TypeError(
      "ABG context bootstrap packageSourceRoot must be non-empty"
    );
  }
  if (
    initializeAiWorkspace !== undefined &&
    typeof initializeAiWorkspace !== "boolean"
  ) {
    throw new TypeError(
      "ABG context bootstrap initializeAiWorkspace must be boolean when present"
    );
  }
  if (
    toolchainRoot !== undefined &&
    toolchainRoot !== null &&
    typeof toolchainRoot !== "string"
  ) {
    throw new TypeError(
      "ABG context bootstrap toolchainRoot must be string or null when present"
    );
  }
  if (
    mutableStateRoots !== undefined &&
    mutableStateRoots !== null &&
    (typeof mutableStateRoots !== "object" || Array.isArray(mutableStateRoots))
  ) {
    throw new TypeError(
      "ABG context bootstrap mutableStateRoots must be object or null when present"
    );
  }
  return Object.freeze({
    targetRoot,
    packageSourceRoot,
    toolchainRoot: toolchainRoot ?? null,
    mutableStateRoots:
      mutableStateRoots === undefined
        ? null
        : (mutableStateRoots as ToolchainMutableStateRootInput | null),
    initializeAiWorkspace: initializeAiWorkspace ?? true
  });
}

async function readInstalledProductBinding(input: {
  readonly productRoot: string;
  readonly identity: PackageIdentity;
}): Promise<ToolchainWorkspaceBinding["products"][number]> {
  const manifestPath = join(input.productRoot, "product-toolchain-manifest.json");
  const manifestContent = await readFile(manifestPath, "utf8");
  const manifest = parsePlainObject(
    JSON.parse(manifestContent),
    "ABG product toolchain manifest"
  );
  const packageVersion = manifest["packageVersion"];
  const packageRoot = manifest["packageRoot"];
  const binRoot = manifest["binRoot"];
  const libRoot = manifest["libRoot"];
  const docsRoot = manifest["docsRoot"];
  const standardsRoot = manifest["standardsRoot"];
  const commandPaths = manifest["commandPaths"];
  if (packageVersion !== input.identity.packageVersion) {
    throw new TypeError(
      `installed product version ${String(packageVersion)} does not match package ${input.identity.packageVersion}`
    );
  }
  if (
    typeof packageRoot !== "string" ||
    typeof binRoot !== "string" ||
    typeof libRoot !== "string" ||
    typeof docsRoot !== "string" ||
    typeof standardsRoot !== "string" ||
    !Array.isArray(commandPaths) ||
    !commandPaths.every((value) => typeof value === "string")
  ) {
    throw new TypeError("ABG product toolchain manifest is malformed");
  }
  return constructAbiogenesisProductToolchainBinding({
    packageVersion: input.identity.packageVersion,
    productRoot: input.productRoot,
    packageRoot,
    binRoot,
    libRoot,
    docsRoot,
    standardsRoot,
    manifestPath,
    manifestDigest: sha256Text(manifestContent),
    commandPaths
  });
}

export async function installAbiogenesisContextBootstrap(
  input: unknown
): Promise<AbgContextBootstrapOutcome> {
  const request = contextBootstrapRequest(input);
  await mkdir(request.targetRoot, { recursive: true });
  const identity = await readPackageIdentity(request.packageSourceRoot);
  const resolvedToolchain = resolveToolchainRoot({
    targetRoot: request.targetRoot,
    explicitToolchainRoot: request.toolchainRoot
  });
  const productRoot = productRootForSharedToolchain({
    toolchainRoot: resolvedToolchain.root,
    packageVersion: identity.packageVersion
  });
  const productBinding = await readInstalledProductBinding({
    productRoot,
    identity
  });
  const toolchainBinding = constructWorkspaceToolchainBinding({
    targetRoot: request.targetRoot,
    toolchainRoot: resolvedToolchain.root,
    selectionSource: resolvedToolchain.source,
    products: [productBinding],
    mutableStateRoots: request.mutableStateRoots
  });
  await ensureMutableStateRoots(toolchainBinding);
  const toolchainBindingPath = await writeToolchainBinding({
    targetRoot: request.targetRoot,
    binding: toolchainBinding
  });
  const installedContext = await writeInstalledAbgGtlContext({
    targetRoot: request.targetRoot,
    identity
  });
  const aiWorkspaceDirectories = request.initializeAiWorkspace
    ? await ensureAiWorkspaceContextDirectories(request.targetRoot)
    : Object.freeze([] as const);

  return Object.freeze({
    kind: "context_bootstrap_installed",
    targetRoot: request.targetRoot,
    packageName: identity.packageName,
    packageVersion: identity.packageVersion,
    toolchainRoot: resolvedToolchain.root,
    toolchainBindingPath,
    toolchainBinding,
    installedContextPath: installedContext.contextPath,
    installedContextFile: installedContext.contextFile,
    installedInstructionFiles: installedContext.instructionFiles,
    aiWorkspaceDirectories
  });
}


async function writeInstallProvenance(input: {
  readonly manifestPath: string;
  readonly manifest: unknown;
}): Promise<void> {
  await writeFile(input.manifestPath, stringifyJson(input.manifest), "utf8");
}

function packageRootForName(targetRoot: string, packageName: string): string {
  return join(targetRoot, "node_modules", ...packageName.split("/"));
}

async function locateDependencySource(
  packageSourceRoot: string,
  packageName: string
): Promise<string> {
  let current = packageSourceRoot;
  while (current !== dirname(current)) {
    const candidate = join(current, "node_modules", ...packageName.split("/"));
    if (await pathIsDirectory(candidate)) {
      return candidate;
    }
    current = dirname(current);
  }
  throw new Error(`dependency ${packageName} is not installed near package source`);
}

async function linkPackageDependency(
  input: {
    readonly packageSourceRoot: string;
    readonly installRoot: string;
  },
  packageName: string
): Promise<void> {
  const sourceRoot = await locateDependencySource(
    input.packageSourceRoot,
    packageName
  );
  const targetRootPath = join(
    input.installRoot,
    "node_modules",
    ...packageName.split("/")
  );
  await mkdir(dirname(targetRootPath), { recursive: true });
  await rm(targetRootPath, { recursive: true, force: true });
  await symlink(sourceRoot, targetRootPath, "dir");
}

async function linkPackageDependencies(
  input: {
    readonly packageSourceRoot: string;
    readonly installRoot: string;
  },
  identity: PackageIdentity
): Promise<void> {
  for (const dependency of identity.dependencies) {
    await linkPackageDependency(input, dependency);
  }
}

async function extractPackage(
  request: AbgTypescriptInstallerRequest,
  identity: PackageIdentity,
  tarballPath: string,
  installRoot: string
): Promise<string> {
  const extractParent = join(
    installRoot,
    "package-extract"
  );
  await mkdir(extractParent, { recursive: true });
  const extractRoot = await mkdtemp(join(extractParent, "extract-"));
  const extractRun = spawnSync("tar", ["-xzf", tarballPath, "-C", extractRoot], {
    cwd: installRoot,
    encoding: "utf8"
  });
  assertSpawnSucceeded(
    extractRun.status,
    extractRun.stdout,
    extractRun.stderr,
    "tar extract"
  );

  const packageRoot = packageRootForName(
    installRoot,
    identity.packageName
  );
  await mkdir(dirname(packageRoot), { recursive: true });
  await rm(packageRoot, { recursive: true, force: true });
  await cp(join(extractRoot, "package"), packageRoot, { recursive: true });
  await linkPackageDependencies(
    {
      packageSourceRoot: request.packageSourceRoot,
      installRoot
    },
    identity
  );
  return packageRoot;
}

async function writeCommandBinding(
  binRoot: string,
  commandName: string,
  packageCommandPath: string
): Promise<string> {
  await mkdir(binRoot, { recursive: true });
  const commandPath = join(binRoot, commandName);
  await rm(commandPath, { force: true });
  await symlink(relative(binRoot, packageCommandPath), commandPath);
  return commandPath;
}

async function writeCommandBindings(
  binRoot: string,
  packageRoot: string
): Promise<readonly string[]> {
  const packageCommandPath = join(
    packageRoot,
    "build",
    "semantic",
    "code",
    "src",
    "bin",
    "abiogenesis.js"
  );
  const packageInstallCommandPath = join(
    packageRoot,
    "build",
    "semantic",
    "code",
    "src",
    "bin",
    "abg.install.js"
  );
  await chmod(packageCommandPath, 0o755);
  await chmod(packageInstallCommandPath, 0o755);
  return Object.freeze([
    await writeCommandBinding(
      binRoot,
      "abiogenesis-ts",
      packageCommandPath
    ),
    await writeCommandBinding(
      binRoot,
      "genesis-ts",
      packageCommandPath
    ),
    await writeCommandBinding(
      binRoot,
      "abg.install",
      packageInstallCommandPath
    )
  ]);
}

function installedCliRuntimeBindingSource(input: {
  readonly runtimeIdentity: AbgTypescriptInstallerRuntimeIdentity;
  readonly packageImportSpecifier: string;
  readonly standardsRoot: string;
}): string {
  return `import {
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  constructDefaultAbgFnCompositionDeclarations,
  edge,
  graphFunctionForVector
} from ${JSON.stringify(input.packageImportSpecifier)};

const installedSubstrate = admitNode({
  id: "node:abiogenesis:installed_substrate",
  name: "installed_substrate",
  schema: { kind: "symbolic", ref: "schema://abiogenesis/install/substrate" },
  markov: ["installed"],
  assetSurface: {
    kind: "installed_substrate",
    requiredContexts: ["workspace"],
    standardsRefs: [${JSON.stringify(input.standardsRoot)}],
    outputContractRefs: ["installed_substrate_present"]
  },
  tags: ["abiogenesis", "installer", "substrate"]
});

const cliRuntimeBinding = admitNode({
  id: "node:abiogenesis:cli_runtime_binding",
  name: "cli_runtime_binding",
  schema: { kind: "symbolic", ref: "schema://abiogenesis/install/cli-runtime-binding" },
  markov: ["installed"],
  assetSurface: {
    kind: "cli_runtime_binding",
    requiredContexts: ["workspace"],
    standardsRefs: [${JSON.stringify(join(input.standardsRoot, "ODD_METHOD.md"))}],
    outputContractRefs: ["cli_runtime_binding_present"]
  },
  tags: ["abiogenesis", "installer", "runtime_binding"]
});

const runtimeBindingGraphFunction = graphFunctionForVector(
  edge([installedSubstrate], cliRuntimeBinding, {
    id: "graph:abiogenesis:installed_cli_runtime_binding",
    name: "installed_substrate_to_cli_runtime_binding",
    evaluators: [
      {
        name: "installed_cli_runtime_binding_present",
        regime: "F_D",
        description: "Installed CLI runtime binding is present and package-backed.",
        binding: "fd://abiogenesis/installed-cli-runtime-binding/present",
        tags: ["installer", "runtime_binding"]
      }
    ],
    declarations: constructDefaultAbgFnCompositionDeclarations({
      scopeRef: "abiogenesis/installed-cli-runtime-binding",
      hostGraphVectorRef: "graph:abiogenesis:installed_cli_runtime_binding"
    })
  }).vectors[0],
  {
    id: "graph-function:abiogenesis:installed_cli_runtime_binding_self_test",
    name: "installed_cli_runtime_binding_self_test",
    declarations: { entries: [] }
  }
);

const module = admitModule({
  name: "abiogenesis_installed_substrate",
  graphs: [runtimeBindingGraphFunction.template.graph],
  graphFunctions: [runtimeBindingGraphFunction],
  refinementBoundaries: [],
  candidateFamilies: [],
  jobs: [
    {
      id: "job:abiogenesis:installed_cli_runtime_binding_self_test",
      name: "installed_cli_runtime_binding_self_test_job",
      contracts: [
        {
          kind: "graph_function",
          targetId: runtimeBindingGraphFunction.id
        }
      ],
      roles: [],
      tags: ["abiogenesis", "installer", "self_test"]
    }
  ],
  roles: [],
  operators: [],
  evaluators: [],
  rules: [],
  imports: [],
  metadata: { entries: [] }
});

export const runtimeBinding = {
  module,
  runtimeIdentity: admitResolvedRuntimeIdentity(${JSON.stringify(
    input.runtimeIdentity,
    null,
    2
  )}),
  resolvedPolicy: admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: "policy://abiogenesis/installed-substrate-self-test/F_D",
    defaultRegime: "F_D",
    dispatchRef: null
  }),
  fallbackConfigPath: ".abiogenesis/config/abg.config.json",
  runId: "run://abiogenesis/installed-substrate-self-test",
  workKey: "wk://abiogenesis/installed-substrate-self-test"
};
`;
}

async function writeCliRuntimeBinding(input: {
  readonly targetRoot: string;
  readonly runtimeIdentity: AbgTypescriptInstallerRuntimeIdentity;
  readonly packageRoot: string;
  readonly standardsRoot: string;
}): Promise<string> {
  const runtimeBindingPath = join(
    input.targetRoot,
    ".abiogenesis",
    "cli-runtime.mjs"
  );
  await mkdir(dirname(runtimeBindingPath), { recursive: true });
  await writeFile(
    runtimeBindingPath,
    installedCliRuntimeBindingSource({
      runtimeIdentity: input.runtimeIdentity,
      standardsRoot: input.standardsRoot,
      packageImportSpecifier: pathToFileURL(
        join(input.packageRoot, "build", "semantic", "code", "src", "index.js")
      ).href
    }),
    "utf8"
  );
  return runtimeBindingPath;
}

async function writeProductRootBootstrapEntry(input: {
  readonly targetRoot: string;
  readonly packageRoot: string;
}): Promise<void> {
  const appM04Specifier = pathToFileURL(
    join(
      input.packageRoot,
      "build",
      "semantic",
      "code",
      "src",
      "app",
      "m04",
      "index.js"
    )
  ).href;
  await writeFile(
    join(input.targetRoot, "bootstrap", "index.mjs"),
    `export * from ${JSON.stringify(appM04Specifier)};\n`,
    "utf8"
  );
}

function productRootForSharedToolchain(input: {
  readonly toolchainRoot: string;
  readonly packageVersion: string;
}): string {
  return join(
    input.toolchainRoot,
    "products",
    "abiogenesis",
    input.packageVersion
  );
}

function installerLayout(input: {
  readonly request: AbgTypescriptInstallerRequest;
  readonly identity: PackageIdentity;
}): {
  readonly toolchainRoot: string;
  readonly toolchainSelectionSource: ToolchainSelectionSource;
  readonly productRoot: string;
  readonly packageInstallRoot: string;
  readonly packParent: string;
  readonly binRoot: string;
  readonly libRoot: string;
} {
  const resolvedToolchain = resolveToolchainRoot({
    targetRoot: input.request.targetRoot.rootPath,
    explicitToolchainRoot: input.request.toolchainRoot
  });
  const productRoot = productRootForSharedToolchain({
    toolchainRoot: resolvedToolchain.root,
    packageVersion: input.identity.packageVersion
  });
  const libRoot = join(productRoot, "lib");
  const binRoot = join(productRoot, "bin");
  const packParent = join(productRoot, "package-pack");
  return Object.freeze({
    toolchainRoot: resolvedToolchain.root,
    toolchainSelectionSource: resolvedToolchain.source,
    productRoot,
    packageInstallRoot: libRoot,
    packParent,
    binRoot,
    libRoot
  });
}

async function ensureMutableStateRoots(
  binding: ToolchainWorkspaceBinding
): Promise<void> {
  await mkdir(binding.mutableStateRoots.observerStateRoot, { recursive: true });
  await mkdir(binding.mutableStateRoots.executorStateRoot, { recursive: true });
  await mkdir(binding.mutableStateRoots.eventRoot, { recursive: true });
  await mkdir(binding.mutableStateRoots.runtimeRoot, { recursive: true });
  await mkdir(binding.mutableStateRoots.projectionRoot, { recursive: true });
  await mkdir(binding.mutableStateRoots.archiveRoot, { recursive: true });
  if (!(await pathIsFile(binding.mutableStateRoots.eventLogPath))) {
    await writeFile(binding.mutableStateRoots.eventLogPath, "", "utf8");
  }
}

async function writeProductToolchainManifest(input: {
  readonly productRoot: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageRoot: string;
  readonly binRoot: string;
  readonly libRoot: string;
  readonly commandPaths: readonly string[];
  readonly docsRoot: string;
  readonly standardsRoot: string;
  readonly tarballPath: string;
}): Promise<{ readonly path: string; readonly digest: string }> {
  const manifestPath = join(input.productRoot, "product-toolchain-manifest.json");
  await mkdir(dirname(manifestPath), { recursive: true });
  const manifestContent = stringifyJson({
    kind: "abg_product_toolchain_manifest",
    productId: "abiogenesis",
    packageName: input.packageName,
    packageVersion: input.packageVersion,
    productRoot: input.productRoot,
    packageRoot: input.packageRoot,
    binRoot: input.binRoot,
    libRoot: input.libRoot,
    commandPaths: input.commandPaths,
    docsRoot: input.docsRoot,
    standardsRoot: input.standardsRoot,
    tarballPath: input.tarballPath,
    requires: []
  });
  await writeFile(manifestPath, manifestContent, "utf8");
  return Object.freeze({
    path: manifestPath,
    digest: sha256Text(manifestContent)
  });
}

async function writeToolchainBinding(input: {
  readonly targetRoot: string;
  readonly binding: ToolchainWorkspaceBinding;
}): Promise<string> {
  const bindingPath = join(input.targetRoot, TOOLCHAIN_BINDING_RELATIVE_PATH);
  await mkdir(dirname(bindingPath), { recursive: true });
  await writeFile(bindingPath, stringifyJson(input.binding), "utf8");
  return bindingPath;
}

async function allPathsPresent(paths: readonly string[]): Promise<boolean> {
  for (const path of paths) {
    if (!(await pathExists(path))) {
      return false;
    }
  }
  return true;
}

async function missingPaths(paths: readonly string[]): Promise<readonly string[]> {
  const missing: string[] = [];
  for (const path of paths) {
    if (!(await pathExists(path))) {
      missing.push(path);
    }
  }
  return Object.freeze(missing);
}

function manifestTargetMode(input: unknown): TargetMode {
  const manifest = parsePlainObject(input, "typescript installer manifest");
  const targetMode = manifest["targetMode"];
  if (targetMode === "imported" || targetMode === "clean_no_project_authority") {
    return targetMode;
  }
  return "clean_no_project_authority";
}

export async function verifyAbiogenesisTypescriptInstallTopology(input: {
  readonly targetRoot: string;
}): Promise<AbgTypescriptInstallerTopologyVerification> {
  const targetRoot = input.targetRoot;
  const installerManifestPath = join(
    targetRoot,
    ".abiogenesis",
    "typescript-installer-manifest.json"
  );
  const manifest: unknown = JSON.parse(
    await readFile(installerManifestPath, "utf8")
  );
  const manifestObject = parsePlainObject(
    manifest,
    "typescript installer manifest"
  );
  const commandPaths = Array.isArray(manifestObject["commandPaths"])
    ? manifestObject["commandPaths"].filter(
        (value): value is string => typeof value === "string"
      )
    : [];
  const standardsInstallRoot =
    typeof manifestObject["standardsInstallRoot"] === "string"
      ? manifestObject["standardsInstallRoot"]
      : join(targetRoot, ".abiogenesis", "docs", "standards");
  const docsInstallRoot =
    typeof manifestObject["docsInstallRoot"] === "string"
      ? manifestObject["docsInstallRoot"]
      : join(targetRoot, ".abiogenesis", "docs");
  const installProvenancePath =
    typeof manifestObject["installProvenancePath"] === "string"
      ? manifestObject["installProvenancePath"]
      : join(targetRoot, ".abiogenesis", "install-provenance.json");
  const packageRoot =
    typeof manifestObject["packageRoot"] === "string"
      ? manifestObject["packageRoot"]
      : join(targetRoot, "node_modules");
  const installManifestPath =
    typeof manifestObject["installManifestPath"] === "string"
      ? manifestObject["installManifestPath"]
      : join(targetRoot, ".abiogenesis", "install-manifest.json");
  const bootstrapEntryPath =
    typeof manifestObject["bootstrapEntryPath"] === "string"
      ? manifestObject["bootstrapEntryPath"]
      : join(targetRoot, "bootstrap", "index.mjs");
  const eventsPath =
    typeof manifestObject["eventsPath"] === "string"
      ? manifestObject["eventsPath"]
      : join(targetRoot, ".ai-workspace", "events", "events.jsonl");
  const runtimeDirectory =
    typeof manifestObject["runtimeDirectory"] === "string"
      ? manifestObject["runtimeDirectory"]
      : join(targetRoot, ".ai-workspace", "runtime");
  const runtimeBindingPath =
    typeof manifestObject["runtimeBindingPath"] === "string"
      ? manifestObject["runtimeBindingPath"]
      : join(targetRoot, ".abiogenesis", "cli-runtime.mjs");
  const toolchainBindingPath =
    typeof manifestObject["toolchainBindingPath"] === "string"
      ? manifestObject["toolchainBindingPath"]
      : join(targetRoot, TOOLCHAIN_BINDING_RELATIVE_PATH);
  const abgConfigPath =
    typeof manifestObject["abgConfigPath"] === "string"
      ? manifestObject["abgConfigPath"]
      : join(targetRoot, INSTALLED_ABG_CONFIG_RELATIVE_PATH);
  const installedContextPath =
    typeof manifestObject["installedContextPath"] === "string"
      ? manifestObject["installedContextPath"]
      : join(targetRoot, INSTALLED_ABG_GTL_CONTEXT_RELATIVE_PATH);
  const installedInstructionFiles = Array.isArray(
    manifestObject["installedInstructionFiles"]
  )
    ? manifestObject["installedInstructionFiles"]
        .map((entry) => {
          const evidence = parsePlainObject(
            entry,
            "typescript installer manifest installedInstructionFiles entry"
          );
          const relativePath = evidence["relativePath"];
          return typeof relativePath === "string"
            ? join(targetRoot, relativePath)
            : null;
        })
        .filter((entry): entry is string => entry !== null)
    : ABG_GTL_CONTEXT_INSTRUCTION_FILES.map((relativePath) =>
        join(targetRoot, relativePath)
      );
  const projectionDirectory =
    typeof manifestObject["projectionDirectory"] === "string"
      ? manifestObject["projectionDirectory"]
      : join(targetRoot, ".ai-workspace", "projections");
  const archiveDirectory =
    typeof manifestObject["archiveDirectory"] === "string"
      ? manifestObject["archiveDirectory"]
      : join(targetRoot, ".ai-workspace", "archives");

  const requiredPaths = Object.freeze([
    join(targetRoot, ".abiogenesis"),
    packageRoot,
    ...commandPaths,
    installManifestPath,
    installerManifestPath,
    installProvenancePath,
    bootstrapEntryPath,
    eventsPath,
    runtimeDirectory,
    runtimeBindingPath,
    toolchainBindingPath,
    abgConfigPath,
    installedContextPath,
    ...installedInstructionFiles,
    projectionDirectory,
    archiveDirectory,
    standardsInstallRoot,
    docsInstallRoot,
    ...REQUIRED_STANDARDS_SMOKE_FILES.map((relativePath) =>
      join(standardsInstallRoot, relativePath)
    ),
    ...REQUIRED_DOC_FILES.map((relativePath) => join(docsInstallRoot, relativePath))
  ]);
  const absentPaths = await missingPaths(requiredPaths);

  return Object.freeze({
    kind: "abg_typescript_install_topology_verification",
    targetRoot,
    complete: absentPaths.length === 0,
    targetMode: manifestTargetMode(manifest),
    cleanTargetPolicy: "no_scaffold",
    missingPaths: absentPaths,
    substrateRootPresent: await pathIsDirectory(join(targetRoot, ".abiogenesis")),
    packageRootPresent: await pathIsDirectory(packageRoot),
    commandBindingsPresent: await allPathsPresent(commandPaths),
    installManifestPresent: await pathIsFile(installManifestPath),
    installerManifestPresent: await pathIsFile(installerManifestPath),
    installProvenancePresent: await pathIsFile(installProvenancePath),
    bootstrapEntryPresent: await pathIsFile(bootstrapEntryPath),
    eventsPathPresent: await pathIsFile(eventsPath),
    runtimeDirectoryPresent: await pathIsDirectory(runtimeDirectory),
    runtimeBindingPresent: await pathIsFile(runtimeBindingPath),
    toolchainBindingPresent: await pathIsFile(toolchainBindingPath),
    abgConfigPresent: await pathIsFile(abgConfigPath),
    installedContextPresent: await pathIsFile(installedContextPath),
    installedInstructionContextPresent: await allPathsPresent(
      installedInstructionFiles
    ),
    standardsRootPresent: await pathIsDirectory(standardsInstallRoot),
    standardsSmokeFilesPresent: await allPathsPresent(
      REQUIRED_STANDARDS_SMOKE_FILES.map((relativePath) =>
        join(standardsInstallRoot, relativePath)
      )
    ),
    docsRootPresent: await pathIsDirectory(docsInstallRoot)
  });
}

function bootstrapRequest(
  request: AbgTypescriptInstallerRequest,
  identity: PackageIdentity,
  tarballPath: string
): unknown {
  const dependencyPath = relative(request.targetRoot.rootPath, tarballPath);
  return {
    targetRoot: {
      rootPath: request.targetRoot.rootPath
    },
    installedPackageName: request.installedPackageName,
    runtimePackage: {
      packageName: identity.packageName,
      packageVersion: identity.packageVersion,
      dependencyRef: `file:${dependencyPath}`,
      appExportSubpath: "./app/m04",
      requiredExports: [
        ".",
        "./app/m04",
        "./app/m04/control",
        "./app/m04/event-ingress",
        "./app/m04/gaps",
        "./app/m04/install-bootstrap",
        "./app/m04/live-status",
        "./app/m04/result-assessment",
        "./app/m04/toolchain-binding"
      ]
    }
  };
}

function installedBootstrapOutcome(
  outcome: Awaited<ReturnType<typeof installBootstrap>>
): PublicInstallBootstrapInstalled {
  if (outcome.kind === "rejected") {
    throw new Error(outcome.reason);
  }
  return outcome;
}

export async function installAbiogenesisTypescript(
  input: unknown
): Promise<AbgTypescriptInstallerOutcome> {
  const request = admitAbgTypescriptInstallerRequest(input);
  try {
    const targetMode = await detectTargetMode(request.targetRoot.rootPath);
    const installMode = await detectInstallMode(request.targetRoot.rootPath);
    const standardsSourceRoot = await resolveStandardsSourceRoot(request);
    const docsSourceRoot = await resolveDocsSourceRoot(request);
    const identity = await readPackageIdentity(request.packageSourceRoot);
    const runtimeIdentity = runtimeIdentityForPackage(identity);
    const layout = installerLayout({ request, identity });
    const tarballPath = await packPackage({
      request,
      packParent: layout.packParent
    });
    const installBootstrapOutcome = installedBootstrapOutcome(
      await installBootstrap(
        bootstrapRequest(request, identity, tarballPath),
        nodeDeliveryWriter()
      )
    );
    const packageRoot = await extractPackage(
      request,
      identity,
      tarballPath,
      layout.packageInstallRoot
    );
    await writeProductRootBootstrapEntry({
      targetRoot: request.targetRoot.rootPath,
      packageRoot
    });
    const commandPaths = await writeCommandBindings(layout.binRoot, packageRoot);
    const docsInstallRoot = join(layout.productRoot, "docs");
    const standardsInstallRoot = join(docsInstallRoot, "standards");
    const runtimeBindingPath = await writeCliRuntimeBinding({
      targetRoot: request.targetRoot.rootPath,
      runtimeIdentity,
      packageRoot,
      standardsRoot: standardsInstallRoot
    });
    const docsFiles = await copyDocsFiles(docsSourceRoot, docsInstallRoot);
    const abgConfig = await copyAbgConfig({
      packageSourceRoot: request.packageSourceRoot,
      targetRoot: request.targetRoot.rootPath
    });
    const installedContext = await writeInstalledAbgGtlContext({
      targetRoot: request.targetRoot.rootPath,
      identity
    });
    const standardsFiles = await copyStandardsTree(
      standardsSourceRoot,
      standardsInstallRoot
    );
    const productManifest = await writeProductToolchainManifest({
      productRoot: layout.productRoot,
      packageName: identity.packageName,
      packageVersion: identity.packageVersion,
      packageRoot,
      binRoot: layout.binRoot,
      libRoot: layout.libRoot,
      commandPaths,
      docsRoot: docsInstallRoot,
      standardsRoot: standardsInstallRoot,
      tarballPath
    });
    const productBinding = constructAbiogenesisProductToolchainBinding({
      packageVersion: identity.packageVersion,
      productRoot: layout.productRoot,
      packageRoot,
      binRoot: layout.binRoot,
      libRoot: layout.libRoot,
      docsRoot: docsInstallRoot,
      standardsRoot: standardsInstallRoot,
      manifestPath: productManifest.path,
      manifestDigest: productManifest.digest,
      commandPaths
    });
    const toolchainBinding = constructWorkspaceToolchainBinding({
      targetRoot: request.targetRoot.rootPath,
      toolchainRoot: layout.toolchainRoot,
      selectionSource: layout.toolchainSelectionSource,
      products: [productBinding],
      mutableStateRoots: request.mutableStateRoots
    });
    await ensureMutableStateRoots(toolchainBinding);
    const toolchainBindingPath = await writeToolchainBinding({
      targetRoot: request.targetRoot.rootPath,
      binding: toolchainBinding
    });
    const installerManifestPath = join(
      request.targetRoot.rootPath,
      ".abiogenesis",
      "typescript-installer-manifest.json"
    );
    const installProvenancePath = join(
      request.targetRoot.rootPath,
      ".abiogenesis",
      "install-provenance.json"
    );
    const manifest = constructAbgTypescriptInstallerManifest({
      targetRoot: request.targetRoot.rootPath,
      targetMode,
      installMode,
      cleanTargetPolicy: request.cleanTargetPolicy,
      installedPackageName: request.installedPackageName,
      packageName: identity.packageName,
      packageVersion: identity.packageVersion,
      packageSourceRoot: request.packageSourceRoot,
      packageRoot,
      tarballPath,
      commandPaths,
      standardsSourceRoot,
      standardsInstallRoot,
      standardsFiles,
      docsSourceRoot,
      docsInstallRoot,
      docsFiles,
      abgConfigSourcePath: abgConfig.sourcePath,
      abgConfigPath: abgConfig.targetPath,
      abgConfigFile: abgConfig.evidence,
      installedContextPath: installedContext.contextPath,
      installedContextFile: installedContext.contextFile,
      installedInstructionFiles: installedContext.instructionFiles,
      runtimeIdentity,
      runtimeBindingPath,
      toolchainBindingPath,
      toolchainBinding,
      installManifestPath: join(
        request.targetRoot.rootPath,
        ".abiogenesis",
        "install-manifest.json"
      ),
      installerManifestPath,
      installProvenancePath,
      bootstrapEntryPath: join(request.targetRoot.rootPath, "bootstrap", "index.mjs"),
      eventsPath: toolchainBinding.mutableStateRoots.eventLogPath,
      runtimeDirectory: toolchainBinding.mutableStateRoots.runtimeRoot,
      projectionDirectory: toolchainBinding.mutableStateRoots.projectionRoot,
      archiveDirectory: toolchainBinding.mutableStateRoots.archiveRoot,
      mutableStateRoots: toolchainBinding.mutableStateRoots
    });
    await writeFile(installerManifestPath, stringifyJson(manifest), "utf8");
    await writeInstallProvenance({
      manifestPath: installProvenancePath,
      manifest: {
        kind: "abg_typescript_install_provenance",
        targetRoot: request.targetRoot.rootPath,
        targetMode,
        installMode,
        cleanTargetPolicy: request.cleanTargetPolicy,
        packageName: identity.packageName,
        packageVersion: identity.packageVersion,
        packageRoot,
        commandPaths,
        runtimeIdentity,
        installManifestPath: manifest.installManifestPath,
        installerManifestPath,
        runtimeBindingPath,
        toolchainBindingPath,
        toolchainRoot: layout.toolchainRoot,
        toolchainSelectionSource: layout.toolchainSelectionSource,
        toolchainBinding,
        abgConfigSourcePath: abgConfig.sourcePath,
        abgConfigPath: abgConfig.targetPath,
        abgConfigSha256: abgConfig.evidence.sha256,
        installedContextPath: installedContext.contextPath,
        installedContextSha256: installedContext.contextFile.sha256,
        installedInstructionFiles: installedContext.instructionFiles,
        standardsInstallRoot,
        standardsFileCount: standardsFiles.length,
        docsInstallRoot,
        docsFileCount: docsFiles.length,
        eventsPath: manifest.eventsPath,
        runtimeDirectory: manifest.runtimeDirectory,
        projectionDirectory: manifest.projectionDirectory,
        archiveDirectory: manifest.archiveDirectory,
        mutableStateRoots: manifest.mutableStateRoots,
        installResult: "installed"
      }
    });
    const topologyVerification =
      await verifyAbiogenesisTypescriptInstallTopology({
        targetRoot: request.targetRoot.rootPath
      });
    if (!topologyVerification.complete) {
      throw new Error(
        `installed topology incomplete: ${topologyVerification.missingPaths.join(", ")}`
      );
    }
    return constructAbgTypescriptInstallerOutcome(
      constructInstalledAbgTypescriptInstallerOutcome({
        targetRoot: request.targetRoot,
        targetMode,
        installMode,
        cleanTargetPolicy: request.cleanTargetPolicy,
        installedPackageName: request.installedPackageName,
        packageName: identity.packageName,
        packageVersion: identity.packageVersion,
        packageSourceRoot: request.packageSourceRoot,
        packageRoot,
        tarballPath,
        commandPaths,
        standardsSourceRoot,
        standardsInstallRoot,
        standardsFiles,
        docsSourceRoot,
        docsInstallRoot,
        docsFiles,
        abgConfigSourcePath: abgConfig.sourcePath,
        abgConfigPath: abgConfig.targetPath,
        abgConfigFile: abgConfig.evidence,
        installedContextPath: installedContext.contextPath,
        installedContextFile: installedContext.contextFile,
        installedInstructionFiles: installedContext.instructionFiles,
        runtimeIdentity,
        runtimeBindingPath,
        toolchainBindingPath,
        toolchainBinding,
        installManifestPath: manifest.installManifestPath,
        installerManifestPath,
        installProvenancePath,
        bootstrapEntryPath: manifest.bootstrapEntryPath,
        eventsPath: manifest.eventsPath,
        runtimeDirectory: manifest.runtimeDirectory,
        projectionDirectory: manifest.projectionDirectory,
        archiveDirectory: manifest.archiveDirectory,
        mutableStateRoots: manifest.mutableStateRoots,
        installBootstrapOutcome,
        topologyVerification,
        manifest
      })
    );
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "installer failed";
    return constructAbgTypescriptInstallerOutcome(
      constructRejectedAbgTypescriptInstallerOutcome({
        targetRoot: request.targetRoot,
        reason
      })
    );
  }
}
