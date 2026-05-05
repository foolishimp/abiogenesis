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
import { parsePlainObject } from "../../../shared/validation/primitives.js";
import { installBootstrap } from "./install.js";
import { admitAbgTypescriptInstallerRequest } from "./typescript_installer_admission.js";
import {
  constructAbgTypescriptInstallerManifest,
  constructAbgTypescriptInstallerOutcome,
  constructInstalledAbgTypescriptInstallerOutcome,
  constructRejectedAbgTypescriptInstallerOutcome
} from "./typescript_installer_constructors.js";
import type { DeliveryWriter } from "../../../shared/abg_delivery_library/index.js";
import type { PublicInstallBootstrapInstalled } from "./carriers.js";
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

const REFERENCE_FALLBACK_CONFIG_RELATIVE_PATH = join(
  "config",
  "abg.reference-fallbacks.json"
);

const INSTALLED_FALLBACK_CONFIG_RELATIVE_PATH = join(
  ".abiogenesis",
  "config",
  "abg.fallbacks.json"
);

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

async function packPackage(
  request: AbgTypescriptInstallerRequest
): Promise<string> {
  const packParent = join(
    request.targetRoot.rootPath,
    ".abiogenesis",
    "package-pack"
  );
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

async function copyFallbackConfig(input: {
  readonly packageSourceRoot: string;
  readonly targetRoot: string;
}): Promise<{
  readonly sourcePath: string;
  readonly targetPath: string;
  readonly evidence: AbgTypescriptInstallerFileEvidence;
}> {
  const sourcePath = join(
    input.packageSourceRoot,
    REFERENCE_FALLBACK_CONFIG_RELATIVE_PATH
  );
  if (!(await pathIsFile(sourcePath))) {
    throw new Error(`missing ABG fallback config source file ${sourcePath}`);
  }
  const targetPath = join(
    input.targetRoot,
    INSTALLED_FALLBACK_CONFIG_RELATIVE_PATH
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
      INSTALLED_FALLBACK_CONFIG_RELATIVE_PATH
    )
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
  request: AbgTypescriptInstallerRequest,
  packageName: string
): Promise<void> {
  const sourceRoot = await locateDependencySource(
    request.packageSourceRoot,
    packageName
  );
  const targetRootPath = join(
    request.targetRoot.rootPath,
    "node_modules",
    ...packageName.split("/")
  );
  await mkdir(dirname(targetRootPath), { recursive: true });
  await rm(targetRootPath, { recursive: true, force: true });
  await symlink(sourceRoot, targetRootPath, "dir");
}

async function linkPackageDependencies(
  request: AbgTypescriptInstallerRequest,
  identity: PackageIdentity
): Promise<void> {
  for (const dependency of identity.dependencies) {
    await linkPackageDependency(request, dependency);
  }
}

async function extractPackage(
  request: AbgTypescriptInstallerRequest,
  identity: PackageIdentity,
  tarballPath: string
): Promise<string> {
  const extractParent = join(
    request.targetRoot.rootPath,
    ".abiogenesis",
    "package-extract"
  );
  await mkdir(extractParent, { recursive: true });
  const extractRoot = await mkdtemp(join(extractParent, "extract-"));
  const extractRun = spawnSync("tar", ["-xzf", tarballPath, "-C", extractRoot], {
    cwd: request.targetRoot.rootPath,
    encoding: "utf8"
  });
  assertSpawnSucceeded(
    extractRun.status,
    extractRun.stdout,
    extractRun.stderr,
    "tar extract"
  );

  const packageRoot = packageRootForName(
    request.targetRoot.rootPath,
    identity.packageName
  );
  await mkdir(dirname(packageRoot), { recursive: true });
  await rm(packageRoot, { recursive: true, force: true });
  await cp(join(extractRoot, "package"), packageRoot, { recursive: true });
  await linkPackageDependencies(request, identity);
  return packageRoot;
}

async function writeCommandBinding(
  targetRoot: string,
  commandName: string,
  packageCommandPath: string
): Promise<string> {
  const binRoot = join(targetRoot, "node_modules", ".bin");
  await mkdir(binRoot, { recursive: true });
  const commandPath = join(binRoot, commandName);
  await rm(commandPath, { force: true });
  await symlink(relative(binRoot, packageCommandPath), commandPath);
  return commandPath;
}

async function writeCommandBindings(
  request: AbgTypescriptInstallerRequest,
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
  await chmod(packageCommandPath, 0o755);
  return Object.freeze([
    await writeCommandBinding(
      request.targetRoot.rootPath,
      "abiogenesis-ts",
      packageCommandPath
    ),
    await writeCommandBinding(
      request.targetRoot.rootPath,
      "genesis-ts",
      packageCommandPath
    )
  ]);
}

function installedCliRuntimeBindingSource(input: {
  readonly runtimeIdentity: AbgTypescriptInstallerRuntimeIdentity;
}): string {
  return `import {
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  edge,
  graphFunctionForVector
} from "@abiogenesis/typescript-tenant";

const installedSubstrate = admitNode({
  id: "node:abiogenesis:installed_substrate",
  name: "installed_substrate",
  schema: { kind: "symbolic", ref: "schema://abiogenesis/install/substrate" },
  markov: ["installed"],
  assetSurface: {
    kind: "installed_substrate",
    requiredContexts: ["workspace"],
    standardsRefs: ["workspace://.abiogenesis/docs/standards/"],
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
    standardsRefs: ["workspace://.abiogenesis/docs/standards/ODD_METHOD.md"],
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
    declarations: { entries: [] }
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
  abgFallbackConfigPath: ".abiogenesis/config/abg.fallbacks.json",
  runId: "run://abiogenesis/installed-substrate-self-test",
  workKey: "wk://abiogenesis/installed-substrate-self-test"
};
`;
}

async function writeCliRuntimeBinding(input: {
  readonly targetRoot: string;
  readonly runtimeIdentity: AbgTypescriptInstallerRuntimeIdentity;
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
      runtimeIdentity: input.runtimeIdentity
    }),
    "utf8"
  );
  return runtimeBindingPath;
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
  const fallbackConfigPath =
    typeof manifestObject["fallbackConfigPath"] === "string"
      ? manifestObject["fallbackConfigPath"]
      : join(targetRoot, INSTALLED_FALLBACK_CONFIG_RELATIVE_PATH);

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
    fallbackConfigPath,
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
    fallbackConfigPresent: await pathIsFile(fallbackConfigPath),
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
        "./app/m04/result-assessment"
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
    const tarballPath = await packPackage(request);
    const installBootstrapOutcome = installedBootstrapOutcome(
      await installBootstrap(
        bootstrapRequest(request, identity, tarballPath),
        nodeDeliveryWriter()
      )
    );
    const packageRoot = await extractPackage(request, identity, tarballPath);
    const commandPaths = await writeCommandBindings(request, packageRoot);
    const runtimeBindingPath = await writeCliRuntimeBinding({
      targetRoot: request.targetRoot.rootPath,
      runtimeIdentity
    });
    const docsInstallRoot = join(request.targetRoot.rootPath, ".abiogenesis", "docs");
    const standardsInstallRoot = join(docsInstallRoot, "standards");
    const docsFiles = await copyDocsFiles(docsSourceRoot, docsInstallRoot);
    const fallbackConfig = await copyFallbackConfig({
      packageSourceRoot: request.packageSourceRoot,
      targetRoot: request.targetRoot.rootPath
    });
    const standardsFiles = await copyStandardsTree(
      standardsSourceRoot,
      standardsInstallRoot
    );
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
      fallbackConfigSourcePath: fallbackConfig.sourcePath,
      fallbackConfigPath: fallbackConfig.targetPath,
      fallbackConfigFile: fallbackConfig.evidence,
      runtimeIdentity,
      runtimeBindingPath,
      installManifestPath: join(
        request.targetRoot.rootPath,
        ".abiogenesis",
        "install-manifest.json"
      ),
      installerManifestPath,
      installProvenancePath,
      bootstrapEntryPath: join(request.targetRoot.rootPath, "bootstrap", "index.mjs"),
      eventsPath: join(
        request.targetRoot.rootPath,
        ".ai-workspace",
        "events",
        "events.jsonl"
      ),
      runtimeDirectory: join(
        request.targetRoot.rootPath,
        ".ai-workspace",
        "runtime"
      )
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
        fallbackConfigSourcePath: fallbackConfig.sourcePath,
        fallbackConfigPath: fallbackConfig.targetPath,
        fallbackConfigSha256: fallbackConfig.evidence.sha256,
        standardsInstallRoot,
        standardsFileCount: standardsFiles.length,
        docsInstallRoot,
        docsFileCount: docsFiles.length,
        eventsPath: manifest.eventsPath,
        runtimeDirectory: manifest.runtimeDirectory,
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
        fallbackConfigSourcePath: fallbackConfig.sourcePath,
        fallbackConfigPath: fallbackConfig.targetPath,
        fallbackConfigFile: fallbackConfig.evidence,
        runtimeIdentity,
        runtimeBindingPath,
        installManifestPath: manifest.installManifestPath,
        installerManifestPath,
        installProvenancePath,
        bootstrapEntryPath: manifest.bootstrapEntryPath,
        eventsPath: manifest.eventsPath,
        runtimeDirectory: manifest.runtimeDirectory,
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
