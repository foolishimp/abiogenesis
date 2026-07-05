// Implements: REQ-P-POLICY-017

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { access, appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type {
  PluginTraversalKind,
  RuntimeEvent,
  StartIntent
} from "../abg/m03/contracts/carriers.js";
import type {
  AffectPriorityPolicy,
  EngineStartPassthroughFields,
  ConstructionPriorityScheme,
  EngineAssuranceProvider,
  EngineRunnerPluginSet
} from "../abg/m03/index.js";
import {
  ENGINE_START_PASSTHROUGH_KEYS,
  engineStartPassthrough,
  admitAffectPriorityPolicies,
  admitConstructionPriorityScheme,
  admitAbgFallbackBundle,
  formatGtlProgramConformanceIssues,
  typecheckGtlProgram,
  type AbgFallbackBundle
} from "../abg/m03/index.js";
import type { Module } from "../gtl/m02/contracts/carriers.js";
import {
  constructModuleLookupAuthority,
  resolvePublishedGraphFunction
} from "../gtl/m02/contracts/lookup.js";
import {
  admitOperatorAssetQueryContract,
  admitToolchainWorkspaceBinding,
  installAbiogenesisContextBootstrap,
  installAbiogenesisTypescript,
  publicGaps,
  publicCallableStartAsync,
  resolvePublicAssetTarget,
  resultAssessment,
  TOOLCHAIN_BINDING_RELATIVE_PATH
} from "../app/m04/index.js";
import {
  leverEntries,
  loadAbgLeverOverridesBundle,
  getLeverOverride,
  type AbgLeverOverridesBundle,
  type LeverEntry
} from "../shared/lever_registry/index.js";
import {
  INSTALLED_ABG_CONFIG_RELATIVE_PATH,
  loadAbgConfigSectionsFromFile
} from "../shared/abg_config/load.js";
import { createReleaseSnapshotBundle } from "../qualification/m05/index.js";
import type { OperatorAssetQueryContract } from "../app/m04/asset_addressing/carriers.js";
import type {
  FhMode,
  RootMode
} from "../app/m04/contracts/carriers.js";
import type { PublicCallableStartOutcome } from "../app/m04/max_autonomy/carriers.js";
import type { PublicStartContext } from "../app/m04/public_start.js";
import { seedRuntimeEventAdmissionOrdinal } from "../abg/m03/events/index.js";
import type { ToolchainWorkspaceBinding } from "../app/m04/index.js";

interface AbiogenesisCliIo {
  readonly cwd: () => string;
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
}

interface ParsedFlags {
  readonly flags: ReadonlyMap<string, string>;
  readonly positionals: readonly string[];
}

type ParsedCommand =
  | ParsedContextBootstrapCommand
  | ParsedInstallCommand
  | ParsedStartCommand
  | ParsedGapsCommand
  | ParsedGenConfigCommand
  | ParsedAssessResultCommand
  | ParsedTypecheckGtlProgramCommand
  | ParsedReleaseSnapshotCommand;

interface ParsedInstallCommand {
  readonly kind: "install";
  readonly target: string;
  readonly packageSource: string | null;
  readonly installedPackageName: string | null;
  readonly toolchainRoot: string | null;
  readonly observedWorkspaceRoot: string | null;
  readonly observerStateRoot: string | null;
  readonly executorStateRoot: string | null;
  readonly eventRoot: string | null;
  readonly eventLogPath: string | null;
  readonly runtimeRoot: string | null;
  readonly projectionRoot: string | null;
  readonly archiveRoot: string | null;
}

interface ParsedContextBootstrapCommand {
  readonly kind: "context-bootstrap";
  readonly target: string;
  readonly packageSource: string | null;
  readonly toolchainRoot: string | null;
  readonly observedWorkspaceRoot: string | null;
  readonly observerStateRoot: string | null;
  readonly executorStateRoot: string | null;
  readonly eventRoot: string | null;
  readonly eventLogPath: string | null;
  readonly runtimeRoot: string | null;
  readonly projectionRoot: string | null;
  readonly archiveRoot: string | null;
}

interface ParsedStartCommand {
  readonly kind: "start";
  readonly workspace: string;
  readonly scope: string;
  readonly target: CliStartTarget;
  readonly until: StartIntent["until"];
  // undefined when the flag is omitted, so the governed default governs instead
  // of a hardcoded CLI default: fh_mode via the lever override/registry,
  // root_mode via REQ-P-POLICY-013 (T-118).
  readonly fhMode: FhMode | undefined;
  readonly rootMode: RootMode | undefined;
}

interface ParsedGapsCommand {
  readonly kind: "gaps";
  readonly workspace: string;
  readonly scope: string;
}

interface ParsedGenConfigCommand {
  readonly kind: "gen-config";
  readonly workspace: string;
  readonly format: "json" | "text";
}

interface ParsedAssessResultCommand {
  readonly kind: "assess-result";
  readonly workspace: string;
  readonly result: string;
}

interface ParsedTypecheckGtlProgramCommand {
  readonly kind: "typecheck-gtl-program";
  readonly input: string;
  readonly format: "json" | "text";
}

interface ParsedReleaseSnapshotCommand {
  readonly kind: "release-snapshot";
  readonly packageSource: string | null;
  readonly snapshotRoot: string;
  readonly releaseIdentity: string;
  readonly sourceRef: string | null;
  readonly sourceCommit: string | null;
  readonly rcBranch: string | null;
  readonly releaseNote: string | null;
  readonly expectedPackageName: string | null;
  readonly expectedPackageVersion: string | null;
  readonly runBuild: boolean;
  readonly allowDirtySource: boolean;
  readonly npmCacheRoot: string | null;
}

type CliStartTarget =
  | { readonly kind: "next"; readonly publicRef: "next" }
  | {
      readonly kind: "graph_function";
      readonly handle: string;
      readonly publicRef: string;
    }
  | { readonly kind: "asset"; readonly handle: string; readonly publicRef: string };

interface RuntimeBinding extends EngineStartPassthroughFields {
  readonly module: Module;
  readonly runtimeIdentity: PublicStartContext["runtimeIdentity"];
  readonly resolvedPolicy: PublicStartContext["resolvedPolicy"];
  // Scoped to plugin-observer FALLBACK resolution only (installed-workspace
  // path for the abg.config.json `fallbacks` section). It is NOT global config
  // authority: the lever and target-carrier sections resolve via
  // loadAbgConfigSections (installed -> package -> walk-up).
  readonly fallbackConfigPath?: string | null;
  readonly pluginTraversalObserverFallbackEnabled?: boolean;
  readonly pluginTraversalObserverFallbackKinds?: readonly PluginTraversalKind[];
  readonly runtimeEvents?: readonly RuntimeEvent[];
  readonly constructionPriorityScheme?: ConstructionPriorityScheme;
  readonly constructionAffectPolicies?: readonly AffectPriorityPolicy[];
  readonly assuranceProvider?: EngineAssuranceProvider;
  readonly resolveNextTarget?: RuntimeBindingNextTargetResolver;
  readonly resolvePolicy?: RuntimeBindingPolicyFactory;
  readonly plugins?: EngineRunnerPluginSet;
  readonly createPlugins?: RuntimeBindingPluginFactory;
  readonly runId?: string | null;
  readonly workKey?: string | null;
  readonly frameId?: string | null;
  readonly frameLineageId?: string | null;
  readonly operatorAssetContract?: OperatorAssetQueryContract;
  readonly operatorAssets?: unknown;
}

interface RuntimeBindingPluginFactoryInput {
  readonly workspaceRoot: string;
  readonly command: ParsedStartCommand;
  readonly target: ResolvedCliTarget;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly eventSink: (event: RuntimeEvent) => void;
}

interface RuntimeBindingPolicyFactoryInput {
  readonly workspaceRoot: string;
  readonly command: ParsedStartCommand;
  readonly target: ResolvedCliTarget;
  readonly replayEvents: readonly RuntimeEvent[];
}

interface RuntimeBindingNextTargetResolverInput {
  readonly workspaceRoot: string;
  readonly command: ParsedStartCommand;
  readonly replayEvents: readonly RuntimeEvent[];
}

type RuntimeBindingNextTargetResolution =
  | string
  | {
      readonly graphFunctionHandle?: string;
      readonly graphFunctionName?: string;
      readonly handle?: string;
    };

type RuntimeBindingPluginFactory = (
  input: RuntimeBindingPluginFactoryInput
) => EngineRunnerPluginSet | Promise<EngineRunnerPluginSet>;

type RuntimeBindingPolicyFactory = (
  input: RuntimeBindingPolicyFactoryInput
) =>
  | PublicStartContext["resolvedPolicy"]
  | Promise<PublicStartContext["resolvedPolicy"]>;

type RuntimeBindingNextTargetResolver = (
  input: RuntimeBindingNextTargetResolverInput
) =>
  | RuntimeBindingNextTargetResolution
  | Promise<RuntimeBindingNextTargetResolution>;

interface ResolvedCliTarget {
  readonly inputRef: string;
  readonly graphFunctionHandle: string;
  readonly graphFunctionId: string;
  readonly assetId: string | null;
}

class CliError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function hasOwnField(
  input: Readonly<Record<string, unknown>>,
  key: string
): boolean {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function parseFlags(args: readonly string[]): ParsedFlags {
  const flags = new Map<string, string>();
  const positionals: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    if (current === undefined) {
      continue;
    }
    if (!current.startsWith("--")) {
      positionals.push(current);
      continue;
    }

    const key = current.slice(2);
    if (key.length === 0) {
      throw new CliError("empty flag name");
    }
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new CliError(`--${key} requires a value`);
    }
    flags.set(key, value);
    index += 1;
  }

  return Object.freeze({
    flags,
    positionals: Object.freeze(positionals)
  });
}

function requireNoPositionals(parsed: ParsedFlags, command: string): void {
  if (parsed.positionals.length > 0) {
    throw new CliError(
      `${command}: unexpected positional arguments ${JSON.stringify(parsed.positionals)}`
    );
  }
}

function requireAllowedFlags(
  parsed: ParsedFlags,
  command: string,
  allowed: readonly string[]
): void {
  const allowedSet = new Set(allowed);
  for (const key of parsed.flags.keys()) {
    if (!allowedSet.has(key)) {
      throw new CliError(`${command}: unsupported flag --${key}`);
    }
  }
}

function requiredFlag(parsed: ParsedFlags, name: string): string {
  const value = parsed.flags.get(name);
  if (value === undefined || value.trim().length === 0) {
    throw new CliError(`--${name} is required`);
  }
  return value;
}

function optionalFlag(
  parsed: ParsedFlags,
  name: string,
  defaultValue: string
): string {
  const value = parsed.flags.get(name);
  return value === undefined ? defaultValue : value;
}

function optionalNullableFlag(parsed: ParsedFlags, name: string): string | null {
  const value = parsed.flags.get(name);
  return value === undefined ? null : value;
}

async function readOptionalJsonObject(
  filePath: string
): Promise<Record<string, unknown> | null> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new CliError(`${filePath}: expected JSON object`);
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

async function resolveInstallPackageName(
  targetRoot: string,
  explicitInstalledPackageName: string | null
): Promise<string> {
  if (explicitInstalledPackageName !== null) {
    return explicitInstalledPackageName;
  }

  const packageJson = await readOptionalJsonObject(join(targetRoot, "package.json"));
  const packageName = packageJson?.["name"];
  if (typeof packageName === "string" && packageName.trim().length > 0) {
    return packageName;
  }

  const installManifest = await readOptionalJsonObject(
    join(targetRoot, ".abiogenesis", "install-manifest.json")
  );
  const manifestInstalledPackageName = installManifest?.["installedPackageName"];
  if (
    typeof manifestInstalledPackageName === "string" &&
    manifestInstalledPackageName.trim().length > 0
  ) {
    return manifestInstalledPackageName;
  }

  return "abiogenesis-typescript-installed-runtime";
}

function parseBooleanFlag(input: string, name: string): boolean {
  if (input === "true") {
    return true;
  }
  if (input === "false") {
    return false;
  }
  throw new CliError(`--${name} must be true or false`);
}

function parseUntil(input: string): StartIntent["until"] {
  if (
    input === "first_traversal" ||
    input === "blocked" ||
    input === "converged"
  ) {
    return input;
  }
  throw new CliError(
    `--until must be one of first_traversal, blocked, converged; got ${JSON.stringify(input)}`
  );
}

function parseFhMode(input: string): FhMode {
  if (input === "direct" || input === "human-proxy") {
    return input;
  }
  throw new CliError(
    `--fh-mode must be one of direct, human-proxy; got ${JSON.stringify(input)}`
  );
}

function parseRootMode(input: string): RootMode {
  if (input === "direct" || input === "supervised") {
    return input;
  }
  throw new CliError(
    `--root-mode must be one of direct, supervised; got ${JSON.stringify(input)}`
  );
}

function parseStartTarget(input: string): CliStartTarget {
  if (input === "next") {
    return Object.freeze({ kind: "next", publicRef: "next" });
  }
  if (input.startsWith("graph_function:")) {
    const handle = input.slice("graph_function:".length);
    if (handle.length === 0) {
      throw new CliError("--target graph_function:<handle> requires a handle");
    }
    return Object.freeze({
      kind: "graph_function",
      handle,
      publicRef: input
    });
  }
  if (input.startsWith("asset:")) {
    const handle = input.slice("asset:".length);
    if (handle.length === 0) {
      throw new CliError("--target asset:<handle> requires a handle");
    }
    return Object.freeze({
      kind: "asset",
      handle,
      publicRef: input
    });
  }
  throw new CliError(
    "--target must be next, graph_function:<handle>, or asset:<handle>"
  );
}

function parseStartCommand(args: readonly string[]): ParsedStartCommand {
  const parsed = parseFlags(args);
  requireNoPositionals(parsed, "start");
  requireAllowedFlags(parsed, "start", [
    "workspace",
    "scope",
    "target",
    "until",
    "fh-mode",
    "root-mode"
  ]);
  const fhModeFlag = optionalNullableFlag(parsed, "fh-mode");
  const rootModeFlag = optionalNullableFlag(parsed, "root-mode");
  return Object.freeze({
    kind: "start",
    workspace: optionalFlag(parsed, "workspace", "."),
    scope: requiredFlag(parsed, "scope"),
    target: parseStartTarget(requiredFlag(parsed, "target")),
    until: parseUntil(requiredFlag(parsed, "until")),
    fhMode: fhModeFlag === null ? undefined : parseFhMode(fhModeFlag),
    rootMode: rootModeFlag === null ? undefined : parseRootMode(rootModeFlag)
  });
}

function parseInstallCommand(args: readonly string[]): ParsedInstallCommand {
  const parsed = parseFlags(args);
  requireNoPositionals(parsed, "install");
  requireAllowedFlags(parsed, "install", [
    "target",
    "package-source",
    "installed-package-name",
    "toolchain-root",
    "observed-workspace-root",
    "observer-state-root",
    "executor-state-root",
    "event-root",
    "event-log-path",
    "runtime-root",
    "projection-root",
    "archive-root"
  ]);
  return Object.freeze({
    kind: "install",
    target: requiredFlag(parsed, "target"),
    packageSource: optionalNullableFlag(parsed, "package-source"),
    installedPackageName: optionalNullableFlag(parsed, "installed-package-name"),
    toolchainRoot: optionalNullableFlag(parsed, "toolchain-root"),
    observedWorkspaceRoot: optionalNullableFlag(parsed, "observed-workspace-root"),
    observerStateRoot: optionalNullableFlag(parsed, "observer-state-root"),
    executorStateRoot: optionalNullableFlag(parsed, "executor-state-root"),
    eventRoot: optionalNullableFlag(parsed, "event-root"),
    eventLogPath: optionalNullableFlag(parsed, "event-log-path"),
    runtimeRoot: optionalNullableFlag(parsed, "runtime-root"),
    projectionRoot: optionalNullableFlag(parsed, "projection-root"),
    archiveRoot: optionalNullableFlag(parsed, "archive-root")
  });
}

function parseContextBootstrapCommand(
  args: readonly string[]
): ParsedContextBootstrapCommand {
  const parsed = parseFlags(args);
  requireNoPositionals(parsed, "context-bootstrap");
  requireAllowedFlags(parsed, "context-bootstrap", [
    "target",
    "package-source",
    "toolchain-root",
    "observed-workspace-root",
    "observer-state-root",
    "executor-state-root",
    "event-root",
    "event-log-path",
    "runtime-root",
    "projection-root",
    "archive-root"
  ]);
  return Object.freeze({
    kind: "context-bootstrap",
    target: requiredFlag(parsed, "target"),
    packageSource: optionalNullableFlag(parsed, "package-source"),
    toolchainRoot: optionalNullableFlag(parsed, "toolchain-root"),
    observedWorkspaceRoot: optionalNullableFlag(parsed, "observed-workspace-root"),
    observerStateRoot: optionalNullableFlag(parsed, "observer-state-root"),
    executorStateRoot: optionalNullableFlag(parsed, "executor-state-root"),
    eventRoot: optionalNullableFlag(parsed, "event-root"),
    eventLogPath: optionalNullableFlag(parsed, "event-log-path"),
    runtimeRoot: optionalNullableFlag(parsed, "runtime-root"),
    projectionRoot: optionalNullableFlag(parsed, "projection-root"),
    archiveRoot: optionalNullableFlag(parsed, "archive-root")
  });
}

function parseGapsCommand(args: readonly string[]): ParsedGapsCommand {
  const parsed = parseFlags(args);
  requireNoPositionals(parsed, "gaps");
  requireAllowedFlags(parsed, "gaps", ["workspace", "scope"]);
  return Object.freeze({
    kind: "gaps",
    workspace: optionalFlag(parsed, "workspace", "."),
    scope: requiredFlag(parsed, "scope")
  });
}

function parseGenConfigCommand(
  args: readonly string[]
): ParsedGenConfigCommand {
  const parsed = parseFlags(args);
  requireNoPositionals(parsed, "gen-config");
  requireAllowedFlags(parsed, "gen-config", ["workspace", "format"]);
  const format = optionalFlag(parsed, "format", "json");
  if (format !== "json" && format !== "text") {
    throw new CliError('gen-config --format must be "json" or "text"');
  }
  return Object.freeze({
    kind: "gen-config",
    workspace: optionalFlag(parsed, "workspace", "."),
    format
  });
}

function parseAssessResultCommand(
  args: readonly string[]
): ParsedAssessResultCommand {
  const parsed = parseFlags(args);
  requireNoPositionals(parsed, "assess-result");
  requireAllowedFlags(parsed, "assess-result", ["workspace", "result"]);
  return Object.freeze({
    kind: "assess-result",
    workspace: optionalFlag(parsed, "workspace", "."),
    result: requiredFlag(parsed, "result")
  });
}

function parseTypecheckGtlProgramCommand(
  args: readonly string[]
): ParsedTypecheckGtlProgramCommand {
  const parsed = parseFlags(args);
  requireNoPositionals(parsed, "typecheck-gtl-program");
  requireAllowedFlags(parsed, "typecheck-gtl-program", ["input", "format"]);
  const format = optionalFlag(parsed, "format", "json");
  if (format !== "json" && format !== "text") {
    throw new CliError('typecheck-gtl-program --format must be "json" or "text"');
  }
  return Object.freeze({
    kind: "typecheck-gtl-program",
    input: requiredFlag(parsed, "input"),
    format
  });
}

function parseReleaseSnapshotCommand(
  args: readonly string[]
): ParsedReleaseSnapshotCommand {
  const parsed = parseFlags(args);
  requireNoPositionals(parsed, "release-snapshot");
  requireAllowedFlags(parsed, "release-snapshot", [
    "package-source",
    "snapshot-root",
    "release-identity",
    "source-ref",
    "source-commit",
    "rc-branch",
    "release-note",
    "expected-package-name",
    "expected-package-version",
    "build",
    "allow-dirty-source",
    "npm-cache-root"
  ]);
  return Object.freeze({
    kind: "release-snapshot",
    packageSource: optionalNullableFlag(parsed, "package-source"),
    snapshotRoot: requiredFlag(parsed, "snapshot-root"),
    releaseIdentity: requiredFlag(parsed, "release-identity"),
    sourceRef: optionalNullableFlag(parsed, "source-ref"),
    sourceCommit: optionalNullableFlag(parsed, "source-commit"),
    rcBranch: optionalNullableFlag(parsed, "rc-branch"),
    releaseNote: optionalNullableFlag(parsed, "release-note"),
    expectedPackageName: optionalNullableFlag(parsed, "expected-package-name"),
    expectedPackageVersion: optionalNullableFlag(
      parsed,
      "expected-package-version"
    ),
    runBuild: parseBooleanFlag(optionalFlag(parsed, "build", "true"), "build"),
    allowDirtySource: parseBooleanFlag(
      optionalFlag(parsed, "allow-dirty-source", "false"),
      "allow-dirty-source"
    ),
    npmCacheRoot: optionalNullableFlag(parsed, "npm-cache-root")
  });
}

function parseCommand(argv: readonly string[]): ParsedCommand {
  const command = argv[0];
  if (command === undefined) {
    throw new CliError("command is required");
  }
  const args = argv.slice(1);
  switch (command) {
    case "context-bootstrap":
      return parseContextBootstrapCommand(args);
    case "install":
      return parseInstallCommand(args);
    case "start":
      return parseStartCommand(args);
    case "gaps":
      return parseGapsCommand(args);
    case "gen-config":
      return parseGenConfigCommand(args);
    case "assess-result":
      return parseAssessResultCommand(args);
    case "typecheck-gtl-program":
      return parseTypecheckGtlProgramCommand(args);
    case "release-snapshot":
      return parseReleaseSnapshotCommand(args);
    default:
      throw new CliError(`unsupported command ${JSON.stringify(command)}`);
  }
}

function resolveWorkspace(cwd: string, workspace: string): string {
  return isAbsolute(workspace) ? resolve(workspace) : resolve(cwd, workspace);
}

function resolveOptionalWorkspace(
  cwd: string,
  workspace: string | null
): string | null {
  if (workspace === null) {
    return null;
  }
  return resolveWorkspace(cwd, workspace);
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function locateCurrentPackageRoot(): Promise<string> {
  let current = dirname(fileURLToPath(import.meta.url));
  while (current !== dirname(current)) {
    if (
      (await pathExists(join(current, "package.json"))) &&
      (await pathExists(join(current, "build", "semantic", "code", "src")))
    ) {
      return current;
    }
    current = dirname(current);
  }
  throw new CliError("unable to locate current TypeScript ABG package root");
}

async function resolvePackageSource(
  cwd: string,
  packageSource: string | null
): Promise<string> {
  if (packageSource === null) {
    return locateCurrentPackageRoot();
  }
  return isAbsolute(packageSource)
    ? resolve(packageSource)
    : resolve(cwd, packageSource);
}

function gitOutput(
  packageSourceRoot: string,
  args: readonly string[]
): string | null {
  const run = spawnSync("git", ["-C", packageSourceRoot, ...args], {
    encoding: "utf8"
  });
  if (run.status !== 0) {
    return null;
  }
  const output = run.stdout.trim();
  return output.length === 0 ? null : output;
}

function requiredGitOutput(
  packageSourceRoot: string,
  args: readonly string[],
  label: string
): string {
  const output = gitOutput(packageSourceRoot, args);
  if (output === null) {
    throw new CliError(`unable to resolve ${label} for ${packageSourceRoot}`);
  }
  return output;
}

function gitSourceRef(packageSourceRoot: string): string {
  return (
    gitOutput(packageSourceRoot, ["describe", "--tags", "--exact-match", "HEAD"]) ??
    "HEAD"
  );
}

function gitSourceDirty(packageSourceRoot: string): boolean {
  const output = gitOutput(packageSourceRoot, [
    "status",
    "--porcelain",
    "--untracked-files=normal"
  ]);
  return output !== null && output.length > 0;
}

function toolchainBindingPath(workspaceRoot: string): string {
  return join(workspaceRoot, TOOLCHAIN_BINDING_RELATIVE_PATH);
}

async function loadToolchainWorkspaceBinding(
  workspaceRoot: string
): Promise<ToolchainWorkspaceBinding | null> {
  const bindingPath = toolchainBindingPath(workspaceRoot);
  try {
    const payload = JSON.parse(await readFile(bindingPath, "utf8")) as unknown;
    return admitToolchainWorkspaceBinding(payload, bindingPath);
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error["code"] === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function requireToolchainWorkspaceBinding(
  workspaceRoot: string
): Promise<ToolchainWorkspaceBinding> {
  const binding = await loadToolchainWorkspaceBinding(workspaceRoot);
  if (binding === null) {
    throw new CliError(
      `missing ABG workspace toolchain binding at ${toolchainBindingPath(workspaceRoot)}; run install with --toolchain-root or set ABG_TOOLCHAIN_ROOT`
    );
  }
  return binding;
}

function runtimeEventLogPath(
  binding: ToolchainWorkspaceBinding
): string {
  return binding.mutableStateRoots.eventLogPath;
}

function runtimeBindingCandidates(workspaceRoot: string): readonly string[] {
  return Object.freeze([
    join(workspaceRoot, ".abiogenesis", "typescript-runtime.mjs"),
    join(workspaceRoot, ".abiogenesis", "cli-runtime.mjs")
  ]);
}

async function readReplayEvents(path: string): Promise<readonly RuntimeEvent[]> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    return Object.freeze([]);
  }

  const events: RuntimeEvent[] = [];
  const lines = text.split(/\r?\n/u);
  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      continue;
    }
    try {
      events.push(JSON.parse(trimmed) as RuntimeEvent);
    } catch {
      throw new CliError(`events replay line ${index + 1} is not valid JSON`);
    }
  }
  return Object.freeze(events);
}

async function appendRuntimeEvents(
  path: string,
  events: readonly RuntimeEvent[]
): Promise<void> {
  if (events.length === 0) {
    return;
  }
  await mkdir(dirname(path), { recursive: true });
  await appendFile(
    path,
    `${events.map((event) => JSON.stringify(event)).join("\n")}\n`,
    "utf8"
  );
}

function unwrapRuntimeBinding(namespace: unknown): unknown {
  if (!isRecord(namespace)) {
    return namespace;
  }
  const runtimeBinding = namespace["runtimeBinding"];
  if (runtimeBinding !== undefined) {
    return runtimeBinding;
  }
  const defaultBinding = namespace["default"];
  if (defaultBinding !== undefined) {
    return defaultBinding;
  }
  return namespace;
}

function requiredObjectField(
  input: Record<string, unknown>,
  key: string,
  label: string
): Record<string, unknown> {
  const value = input[key];
  if (!isRecord(value)) {
    throw new CliError(`${label}.${key} must be an object`);
  }
  return value;
}

function coerceNullableStringField(
  input: Record<string, unknown>,
  key: string,
  label: string
): string | null | undefined {
  if (!Object.hasOwn(input, key)) {
    return undefined;
  }
  const value = input[key];
  if (value === null) {
    return null;
  }
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  throw new CliError(`${label}.${key} must be null or a non-empty string`);
}

function coerceOptionalBooleanField(
  input: Record<string, unknown>,
  key: string,
  label: string
): boolean | undefined {
  if (!Object.hasOwn(input, key)) {
    return undefined;
  }
  const value = input[key];
  if (typeof value === "boolean") {
    return value;
  }
  throw new CliError(`${label}.${key} must be a boolean`);
}

function coercePluginTraversalKinds(
  input: Record<string, unknown>,
  key: string,
  label: string
): readonly PluginTraversalKind[] | undefined {
  if (!Object.hasOwn(input, key)) {
    return undefined;
  }
  const value = input[key];
  if (!Array.isArray(value)) {
    throw new CliError(`${label}.${key} must be an array`);
  }
  return Object.freeze(
    value.map((entry, index) => {
      if (
        entry === "transform" ||
        entry === "evaluate" ||
        entry === "consequence"
      ) {
        return entry;
      }
      throw new CliError(
        `${label}.${key}[${index}] must be transform, evaluate, or consequence`
      );
    })
  );
}

function coerceRuntimeBinding(input: unknown, label: string): RuntimeBinding {
  if (!isRecord(input)) {
    throw new CliError(`${label} must export an object runtime binding`);
  }

  const module = requiredObjectField(input, "module", label) as unknown as Module;
  const runtimeIdentity = requiredObjectField(
    input,
    "runtimeIdentity",
    label
  ) as unknown as PublicStartContext["runtimeIdentity"];
  const resolvedPolicy = requiredObjectField(
    input,
    "resolvedPolicy",
    label
  ) as unknown as PublicStartContext["resolvedPolicy"];

  const result: {
    module: Module;
    runtimeIdentity: PublicStartContext["runtimeIdentity"];
    resolvedPolicy: PublicStartContext["resolvedPolicy"];
    fallbackConfigPath?: string | null;
    pluginTraversalObserverFallbackEnabled?: boolean;
    pluginTraversalObserverFallbackKinds?: readonly PluginTraversalKind[];
    runtimeEvents?: readonly RuntimeEvent[];
    constructionPriorityScheme?: ConstructionPriorityScheme;
    constructionAffectPolicies?: readonly AffectPriorityPolicy[];
    assuranceProvider?: EngineAssuranceProvider;
    resolveNextTarget?: RuntimeBindingNextTargetResolver;
    resolvePolicy?: RuntimeBindingPolicyFactory;
    plugins?: EngineRunnerPluginSet;
    createPlugins?: RuntimeBindingPluginFactory;
    runId?: string | null;
    workKey?: string | null;
    frameId?: string | null;
    frameLineageId?: string | null;
    operatorAssetContract?: OperatorAssetQueryContract;
    operatorAssets?: unknown;
  } = {
    module,
    runtimeIdentity,
    resolvedPolicy
  };

  if (Array.isArray(input["runtimeEvents"])) {
    result.runtimeEvents = Object.freeze([...input["runtimeEvents"]]) as readonly RuntimeEvent[];
  }
  const fallbackConfigPath = coerceNullableStringField(
    input,
    "fallbackConfigPath",
    label
  );
  if (fallbackConfigPath !== undefined) {
    result.fallbackConfigPath = fallbackConfigPath;
  }
  if (hasOwnField(input, "constructionPriorityScheme")) {
    result.constructionPriorityScheme = admitConstructionPriorityScheme(
      input["constructionPriorityScheme"],
      `${label}.constructionPriorityScheme`
    );
  }
  if (hasOwnField(input, "constructionAffectPolicies")) {
    result.constructionAffectPolicies = admitAffectPriorityPolicies(
      input["constructionAffectPolicies"],
      `${label}.constructionAffectPolicies`
    );
  }
  if (hasOwnField(input, "assuranceProvider")) {
    if (!isRecord(input["assuranceProvider"])) {
      throw new CliError(`${label}.assuranceProvider must be an object`);
    }
    if (typeof input["assuranceProvider"]["authoritySnapshot"] !== "function") {
      throw new CliError(
        `${label}.assuranceProvider.authoritySnapshot must be a function`
      );
    }
    if (
      hasOwnField(input["assuranceProvider"], "evidenceRows") &&
      typeof input["assuranceProvider"]["evidenceRows"] !== "function"
    ) {
      throw new CliError(
        `${label}.assuranceProvider.evidenceRows must be a function`
      );
    }
    if (
      hasOwnField(input["assuranceProvider"], "eventLedgerValid") &&
      typeof input["assuranceProvider"]["eventLedgerValid"] !== "function"
    ) {
      throw new CliError(
        `${label}.assuranceProvider.eventLedgerValid must be a function`
      );
    }
    if (
      hasOwnField(input["assuranceProvider"], "priorClosureSnapshot") &&
      typeof input["assuranceProvider"]["priorClosureSnapshot"] !== "function"
    ) {
      throw new CliError(
        `${label}.assuranceProvider.priorClosureSnapshot must be a function`
      );
    }
    result.assuranceProvider =
      input["assuranceProvider"] as unknown as EngineAssuranceProvider;
  }
  for (const passthroughKey of ENGINE_START_PASSTHROUGH_KEYS) {
    if (hasOwnField(input, passthroughKey)) {
      if (!isRecord(input[passthroughKey])) {
        throw new CliError(`${label}.${passthroughKey} must be an object`);
      }
      (result as Record<string, unknown>)[passthroughKey] = input[passthroughKey];
    }
  }
  if (hasOwnField(input, "plugins")) {
    if (!isRecord(input["plugins"])) {
      throw new CliError(`${label}.plugins must be an object`);
    }
    result.plugins = input["plugins"] as unknown as EngineRunnerPluginSet;
  }
  if (hasOwnField(input, "resolvePolicy")) {
    if (typeof input["resolvePolicy"] !== "function") {
      throw new CliError(`${label}.resolvePolicy must be a function`);
    }
    result.resolvePolicy = input["resolvePolicy"] as RuntimeBindingPolicyFactory;
  }
  if (hasOwnField(input, "resolveNextTarget")) {
    if (typeof input["resolveNextTarget"] !== "function") {
      throw new CliError(`${label}.resolveNextTarget must be a function`);
    }
    result.resolveNextTarget =
      input["resolveNextTarget"] as RuntimeBindingNextTargetResolver;
  }
  if (hasOwnField(input, "createPlugins")) {
    if (typeof input["createPlugins"] !== "function") {
      throw new CliError(`${label}.createPlugins must be a function`);
    }
    if (result.plugins !== undefined) {
      throw new CliError(
        `${label} must declare plugins or createPlugins, not both`
      );
    }
    result.createPlugins = input["createPlugins"] as RuntimeBindingPluginFactory;
  }

  const pluginTraversalObserverFallbackEnabled = coerceOptionalBooleanField(
    input,
    "pluginTraversalObserverFallbackEnabled",
    label
  );
  if (pluginTraversalObserverFallbackEnabled !== undefined) {
    result.pluginTraversalObserverFallbackEnabled =
      pluginTraversalObserverFallbackEnabled;
  }
  const pluginTraversalObserverFallbackKinds = coercePluginTraversalKinds(
    input,
    "pluginTraversalObserverFallbackKinds",
    label
  );
  if (pluginTraversalObserverFallbackKinds !== undefined) {
    result.pluginTraversalObserverFallbackKinds =
      pluginTraversalObserverFallbackKinds;
  }

  const runId = coerceNullableStringField(input, "runId", label);
  if (runId !== undefined) {
    result.runId = runId;
  }
  const workKey = coerceNullableStringField(input, "workKey", label);
  if (workKey !== undefined) {
    result.workKey = workKey;
  }
  const frameId = coerceNullableStringField(input, "frameId", label);
  if (frameId !== undefined) {
    result.frameId = frameId;
  }
  const frameLineageId = coerceNullableStringField(
    input,
    "frameLineageId",
    label
  );
  if (frameLineageId !== undefined) {
    result.frameLineageId = frameLineageId;
  }

  const contract = input["operatorAssetContract"];
  if (contract !== undefined && contract !== null) {
    result.operatorAssetContract = admitOperatorAssetQueryContract(
      contract,
      `${label}.operatorAssetContract`
    );
  }
  if (Object.hasOwn(input, "operatorAssets")) {
    result.operatorAssets = input["operatorAssets"];
  }

  return Object.freeze(result);
}

function resolveCliInstalledAbgConfigPath(
  workspaceRoot: string,
  binding: RuntimeBinding
): string | null {
  const configuredPath =
    binding.fallbackConfigPath ?? INSTALLED_ABG_CONFIG_RELATIVE_PATH;
  if (configuredPath === null) {
    return null;
  }
  const workspacePrefix = "workspace://";
  const path =
    configuredPath.startsWith(workspacePrefix)
      ? configuredPath.slice(workspacePrefix.length)
      : configuredPath;
  return isAbsolute(path) ? path : join(workspaceRoot, path);
}

function loadCliFallbackBundle(
  workspaceRoot: string,
  binding: RuntimeBinding
): AbgFallbackBundle | null {
  // Fallbacks keep the T-117 installed-workspace-only absence law. Lever and
  // target-carrier defaults may fall back to package/walk-up config, but plugin
  // observer fallbacks must not silently read package defaults for an installed
  // workspace whose local fallback config is absent.
  const fallbackPath = resolveCliInstalledAbgConfigPath(workspaceRoot, binding);
  if (fallbackPath === null || !existsSync(fallbackPath)) {
    return null;
  }
  const sections = loadAbgConfigSectionsFromFile(fallbackPath);
  if (sections.fallbacks === null) {
    return null;
  }
  return admitAbgFallbackBundle(sections.fallbacks.value, {
    bundlePath: sections.fallbacks.bundlePath,
    bundleDigest: sections.fallbacks.bundleDigest
  });
}

async function loadRuntimeBinding(workspaceRoot: string): Promise<RuntimeBinding> {
  const candidates = runtimeBindingCandidates(workspaceRoot);
  for (const candidate of candidates) {
    try {
      await access(candidate);
    } catch {
      continue;
    }
    const namespace = await import(pathToFileURL(candidate).href);
    return coerceRuntimeBinding(unwrapRuntimeBinding(namespace), candidate);
  }
  throw new CliError(
    `TypeScript CLI requires an app-owned runtime binding at ${candidates.join(" or ")}`
  );
}

async function runtimePolicyForStart(input: {
  readonly binding: RuntimeBinding;
  readonly workspaceRoot: string;
  readonly command: ParsedStartCommand;
  readonly target: ResolvedCliTarget;
  readonly replayEvents: readonly RuntimeEvent[];
}): Promise<PublicStartContext["resolvedPolicy"]> {
  if (input.binding.resolvePolicy === undefined) {
    return input.binding.resolvedPolicy;
  }
  return input.binding.resolvePolicy({
    workspaceRoot: input.workspaceRoot,
    command: input.command,
    target: input.target,
    replayEvents: input.replayEvents
  });
}

async function runtimePluginsForStart(input: {
  readonly binding: RuntimeBinding;
  readonly workspaceRoot: string;
  readonly command: ParsedStartCommand;
  readonly target: ResolvedCliTarget;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly eventSink: (event: RuntimeEvent) => void;
}): Promise<EngineRunnerPluginSet | undefined> {
  if (input.binding.createPlugins === undefined) {
    return input.binding.plugins;
  }
  return input.binding.createPlugins({
    workspaceRoot: input.workspaceRoot,
    command: input.command,
    target: input.target,
    replayEvents: input.replayEvents,
    eventSink: input.eventSink
  });
}

function defaultOperatorAssetContract(): OperatorAssetQueryContract {
  return admitOperatorAssetQueryContract({
    command: ["typescript-runtime-binding"],
    binding_source: "typescript_runtime_binding.operator_assets"
  });
}

function graphFunctionHandleFromNextResolution(
  resolution: RuntimeBindingNextTargetResolution
): string {
  if (typeof resolution === "string") {
    return resolution;
  }
  return (
    resolution.graphFunctionHandle ??
    resolution.graphFunctionName ??
    resolution.handle ??
    ""
  );
}

async function resolveNextTarget(input: {
  readonly workspaceRoot: string;
  readonly binding: RuntimeBinding;
  readonly command: ParsedStartCommand;
  readonly replayEvents: readonly RuntimeEvent[];
}): Promise<ResolvedCliTarget> {
  const authority = constructModuleLookupAuthority(input.binding.module);
  if (input.binding.resolveNextTarget !== undefined) {
    const graphFunctionHandle = graphFunctionHandleFromNextResolution(
      await input.binding.resolveNextTarget({
        workspaceRoot: input.workspaceRoot,
        command: input.command,
        replayEvents: input.replayEvents
      })
    ).trim();
    if (graphFunctionHandle.length === 0) {
      throw new CliError(
        "runtime binding resolveNextTarget must return a graph function handle"
      );
    }
    const graphFunction = resolvePublishedGraphFunction(
      authority,
      graphFunctionHandle
    );
    return Object.freeze({
      inputRef: "next",
      graphFunctionHandle,
      graphFunctionId: graphFunction.id,
      assetId: null
    });
  }
  const active = authority.semanticJobs.filter(
    (binding) => binding.jobs.length > 0
  );
  if (active.length !== 1) {
    throw new CliError(
      "target next requires exactly one published semantic job in the workspace scope"
    );
  }
  const binding = active[0];
  if (binding === undefined || binding.jobs.length !== 1) {
    throw new CliError(
      "target next requires exactly one published semantic job in the workspace scope"
    );
  }
  const graphFunction = input.binding.module.graphFunctions.find(
    (candidate) => candidate.id === binding.graphFunctionId
  );
  if (graphFunction === undefined) {
    throw new CliError(
      `target next resolved unknown graph function ${JSON.stringify(binding.graphFunctionId)}`
    );
  }
  return Object.freeze({
    inputRef: "next",
    graphFunctionHandle: graphFunction.name,
    graphFunctionId: graphFunction.id,
    assetId: null
  });
}

function resolveGraphFunctionTarget(
  module: Module,
  target: Extract<CliStartTarget, { readonly kind: "graph_function" }>
): ResolvedCliTarget {
  const graphFunction = resolvePublishedGraphFunction(
    constructModuleLookupAuthority(module),
    target.handle
  );
  return Object.freeze({
    inputRef: target.publicRef,
    graphFunctionHandle: target.handle,
    graphFunctionId: graphFunction.id,
    assetId: null
  });
}

async function resolveAssetTarget(
  workspaceRoot: string,
  binding: RuntimeBinding,
  target: Extract<CliStartTarget, { readonly kind: "asset" }>
): Promise<ResolvedCliTarget> {
  if (!Object.hasOwn(binding, "operatorAssets")) {
    throw new CliError(
      "asset targets require the runtime binding to publish operatorAssets"
    );
  }
  const outcome = await resolvePublicAssetTarget(
    {
      target: {
        kind: "asset",
        handle: target.handle
      }
    },
    {
      module: binding.module,
      workspaceRoot,
      operatorAssetContract:
        binding.operatorAssetContract ?? defaultOperatorAssetContract()
    },
    async () => binding.operatorAssets
  );
  if (outcome.kind === "rejected") {
    throw new CliError(outcome.reason);
  }
  return Object.freeze({
    inputRef: target.publicRef,
    graphFunctionHandle: outcome.target.ownerHandle,
    graphFunctionId: outcome.target.ownerTargetId,
    assetId: outcome.target.assetId
  });
}

async function resolveCliTarget(
  workspaceRoot: string,
  binding: RuntimeBinding,
  target: CliStartTarget,
  command: ParsedStartCommand,
  replayEvents: readonly RuntimeEvent[]
): Promise<ResolvedCliTarget> {
  switch (target.kind) {
    case "next":
      return resolveNextTarget({
        workspaceRoot,
        binding,
        command,
        replayEvents
      });
    case "graph_function":
      return resolveGraphFunctionTarget(binding.module, target);
    case "asset":
      return resolveAssetTarget(workspaceRoot, binding, target);
    default: {
      const exhaustive: never = target;
      throw new CliError(`unsupported target ${JSON.stringify(exhaustive)}`);
    }
  }
}

function startContext(
  workspaceRoot: string,
  binding: RuntimeBinding,
  replayEvents: readonly RuntimeEvent[],
  resolvedPolicy: PublicStartContext["resolvedPolicy"]
): PublicStartContext {
  const runtimeEvents = Object.freeze([
    ...replayEvents,
    ...(binding.runtimeEvents ?? Object.freeze([]))
  ]);
  return {
    module: binding.module,
    runtimeIdentity: binding.runtimeIdentity,
    resolvedPolicy,
    runtimeEvents,
    abgFallbackBundle: loadCliFallbackBundle(workspaceRoot, binding),
    leverOverridesBundle: loadAbgLeverOverridesBundle(workspaceRoot),
    ...(binding.constructionPriorityScheme === undefined
      ? {}
      : { constructionPriorityScheme: binding.constructionPriorityScheme }),
    ...(binding.constructionAffectPolicies === undefined
      ? {}
      : { constructionAffectPolicies: binding.constructionAffectPolicies }),
    ...(binding.assuranceProvider === undefined
      ? {}
      : { assuranceProvider: binding.assuranceProvider }),
    ...engineStartPassthrough(binding),
    ...(binding.pluginTraversalObserverFallbackEnabled === undefined
      ? {}
      : {
          pluginTraversalObserverFallbackEnabled:
            binding.pluginTraversalObserverFallbackEnabled
        }),
    ...(binding.pluginTraversalObserverFallbackKinds === undefined
      ? {}
      : {
          pluginTraversalObserverFallbackKinds:
            binding.pluginTraversalObserverFallbackKinds
        }),
    ...(binding.runId !== undefined ? { runId: binding.runId } : {}),
    ...(binding.workKey !== undefined ? { workKey: binding.workKey } : {}),
    ...(binding.frameId !== undefined ? { frameId: binding.frameId } : {}),
    ...(binding.frameLineageId !== undefined
      ? { frameLineageId: binding.frameLineageId }
      : {})
  };
}

function callableInput(
  command: ParsedStartCommand,
  workspaceRoot: string,
  binding: RuntimeBinding,
  target: ResolvedCliTarget
): unknown {
  if (command.scope !== "workspace") {
    throw new CliError("TypeScript CLI currently supports --scope workspace only");
  }
  return {
    scope: {
      kind: "workspace",
      workspaceRoot,
      moduleName: binding.module.name
    },
    target: {
      kind: "graph_function",
      handle: target.graphFunctionHandle
    },
    until: command.until,
    ...(command.fhMode === undefined ? {} : { fh_mode: command.fhMode }),
    ...(command.rootMode === undefined ? {} : { root_mode: command.rootMode })
  };
}

function statusForStartOutcome(
  outcome: PublicCallableStartOutcome
): "blocked" | "converged" | "nothing_to_do" | "yielded" | "error" {
  if (outcome.kind === "rejected") {
    return "error";
  }
  switch (outcome.controlOutcome.kind) {
    case "converged":
      return outcome.controlOutcome.terminalKind;
    case "dispatch_required":
    case "human_gate_required":
    case "blocked":
      return "blocked";
    case "yielded":
      return "yielded";
    case "rejected":
      return "error";
    default: {
      const exhaustive: never = outcome.controlOutcome;
      throw new CliError(
        `unsupported control outcome ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function exitCodeForStart(outcome: PublicCallableStartOutcome): number {
  switch (outcome.controlOutcome.kind) {
    case "converged":
      return 0;
    case "dispatch_required":
      return 2;
    case "human_gate_required":
      return 3;
    case "blocked":
      return outcome.controlOutcome.stopDetail.kind === "gap_stop" ? 4 : 2;
    case "yielded":
      return 6;
    case "rejected":
      return outcome.controlOutcome.stopDetail?.kind === "gap_stop" ? 4 : 1;
    default: {
      const exhaustive: never = outcome.controlOutcome;
      throw new CliError(
        `unsupported control outcome ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function firstEventEdge(events: readonly RuntimeEvent[]): string | null {
  for (const event of events) {
    if (event.kind === "vector_traversal_planned") {
      return event.edge;
    }
  }
  return null;
}

async function runStartCommand(
  command: ParsedStartCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  const workspaceRoot = resolveWorkspace(io.cwd(), command.workspace);
  const toolchainBinding = await requireToolchainWorkspaceBinding(workspaceRoot);
  const binding = await loadRuntimeBinding(workspaceRoot);
  const eventLogPath = runtimeEventLogPath(toolchainBinding);
  const replayEvents = await readReplayEvents(eventLogPath);
  seedRuntimeEventAdmissionOrdinal(replayEvents);
  const target = await resolveCliTarget(
    workspaceRoot,
    binding,
    command.target,
    command,
    replayEvents
  );
  const emitted: RuntimeEvent[] = [];
  const eventSink = (event: RuntimeEvent): void => {
    emitted.push(event);
  };
  const resolvedPolicy = await runtimePolicyForStart({
    binding,
    workspaceRoot,
    command,
    target,
    replayEvents
  });
  const plugins = await runtimePluginsForStart({
    binding,
    workspaceRoot,
    command,
    target,
    replayEvents,
    eventSink
  });
  const outcome = await publicCallableStartAsync(
    callableInput(command, workspaceRoot, binding, target),
    startContext(workspaceRoot, binding, replayEvents, resolvedPolicy),
    eventSink,
    plugins
  );
  await appendRuntimeEvents(eventLogPath, emitted);

  const output = {
    command: "start",
    status: statusForStartOutcome(outcome),
    target: target.inputRef,
    resolved_target: `graph_function:${target.graphFunctionHandle}`,
    graph_function_id: target.graphFunctionId,
    asset_id: target.assetId,
    edge: firstEventEdge(emitted),
    stopped_by: outcome.controlOutcome.kind,
    fh_mode: outcome.request.startRequest.controlModes.fhMode,
    root_mode: outcome.request.startRequest.controlModes.rootMode,
    event_kinds: emitted.map((event) => event.kind),
    events_path: eventLogPath,
    toolchain_binding_path: toolchainBinding?.bindingPath ?? null,
    mutable_state_roots: toolchainBinding?.mutableStateRoots ?? null,
    stop_class: outcome.stopClass,
    control_outcome: outcome.controlOutcome,
    live_status: outcome.liveStatus
  };
  io.stdout(`${JSON.stringify(output)}\n`);
  return exitCodeForStart(outcome);
}

function gapsOutput(projection: ReturnType<typeof publicGaps>): unknown {
  return {
    command: "gaps",
    status: projection.status,
    scope: projection.scope,
    jobs_considered: projection.jobsConsidered,
    total_delta: projection.totalDelta,
    open_frames: projection.openFrames,
    converged: projection.converged,
    event_count: projection.eventCount,
    read_only_evaluator: {
      kind: projection.readOnlyEvaluator.kind,
      evaluator_ref: projection.readOnlyEvaluator.evaluatorRef,
      mutation_allowed: projection.readOnlyEvaluator.mutationAllowed,
      best_gap_ref: projection.readOnlyEvaluator.bestGapRef,
      best_asset_ref: projection.readOnlyEvaluator.bestAssetRef,
      best_action_ref: projection.readOnlyEvaluator.bestActionRef,
      best_graph_function_ref: projection.readOnlyEvaluator.bestGraphFunctionRef,
      best_graph_vector_ref: projection.readOnlyEvaluator.bestGraphVectorRef,
      admission_blocker_refs: projection.readOnlyEvaluator.admissionBlockerRefs,
      ranking_reason_refs: projection.readOnlyEvaluator.rankingReasonRefs,
      source_projection_refs: projection.readOnlyEvaluator.sourceProjectionRefs
    },
    gaps: projection.gaps.map((entry) => ({
      graph_function_id: entry.graphFunctionId,
      graph_function_handle: entry.graphFunctionHandle,
      job_id: entry.jobId,
      job_name: entry.jobName,
      edge: entry.edge,
      vector_index: entry.vectorIndex,
      vector_count: entry.vectorCount,
      closed_vector_count: entry.closedVectorCount,
      open_vector_count: entry.openVectorCount,
      delta: entry.delta,
      failing: entry.failing,
      passing: entry.passing,
      delta_summary: entry.deltaSummary,
      environment_ready: entry.environmentReady,
      status: entry.status,
      stop_predicate: entry.stopPredicate,
      dispatch_ref: entry.dispatchRef,
      approval_subject_ref: entry.approvalSubjectRef,
      terminal_kind: entry.terminalKind,
      next_step: entry.nextStep,
      dispatch_requested: entry.dispatchRequested,
      typed_asset_gaps: entry.typedAssetGaps.map((gap) => ({
        gap_ref: gap.gapRef,
        observation_id: gap.observationId,
        asset_ref: gap.assetRef,
        asset_kind: gap.assetKind,
        required_by_ref: gap.requiredByRef,
        missing_truth_refs: gap.missingTruthRefs,
        blocking_reason_refs: gap.blockingReasonRefs,
        eligible_action_refs: gap.eligibleActionRefs,
        best_action_ref: gap.bestActionRef,
        best_graph_function_ref: gap.bestGraphFunctionRef,
        best_graph_vector_ref: gap.bestGraphVectorRef,
        terminal_route_ref: gap.terminalRouteRef,
        admission_blocker_refs: gap.admissionBlockerRefs,
        priority_rank: gap.priorityRank,
        ranking_reason_refs: gap.rankingReasonRefs,
        source_projection_refs: gap.sourceProjectionRefs,
        action_catalog_ref: gap.actionCatalogRef,
        priority_projection_ref: gap.priorityProjectionRef
      }))
    }))
  };
}

async function runGapsCommand(
  command: ParsedGapsCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  const workspaceRoot = resolveWorkspace(io.cwd(), command.workspace);
  if (command.scope !== "workspace") {
    throw new CliError("TypeScript CLI currently supports --scope workspace only");
  }
  const toolchainBinding = await requireToolchainWorkspaceBinding(workspaceRoot);
  const binding = await loadRuntimeBinding(workspaceRoot);
  const eventLogPath = runtimeEventLogPath(toolchainBinding);
  const projection = publicGaps(
    {
      scope: {
        kind: "workspace",
        workspaceRoot,
        moduleName: binding.module.name
      }
    },
    startContext(
      workspaceRoot,
      binding,
      await readReplayEvents(eventLogPath),
      binding.resolvedPolicy
    )
  );
  io.stdout(`${JSON.stringify(gapsOutput(projection))}\n`);
  return 0;
}

function leverProjectionRow(
  entry: LeverEntry,
  bundle: AbgLeverOverridesBundle | null
): unknown {
  const override = getLeverOverride(bundle, entry.dottedKey);
  const overridden = override !== undefined;
  return {
    key: entry.dottedKey,
    value: overridden ? override : entry.value,
    class: entry.leverClass,
    value_kind: entry.valueKind,
    wiring: entry.wiring,
    source: overridden ? "config-override" : "registry-default",
    consumed_at: entry.consumedAt
  };
}

async function runGenConfigCommand(
  command: ParsedGenConfigCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  const workspaceRoot = resolveWorkspace(io.cwd(), command.workspace);
  const bundle = loadAbgLeverOverridesBundle(workspaceRoot);
  const entries = leverEntries();
  if (command.format === "text") {
    for (const entry of entries) {
      const override = getLeverOverride(bundle, entry.dottedKey);
      const value = override === undefined ? entry.value : override;
      const source =
        override === undefined ? "registry-default" : "config-override";
      io.stdout(
        `${entry.dottedKey}\t${JSON.stringify(value)}\t${entry.leverClass}\t${source}\n`
      );
    }
    return 0;
  }
  io.stdout(
    `${JSON.stringify({
      command: "gen-config",
      overrides_bundle:
        bundle === null
          ? null
          : {
              bundleRef: bundle.bundleRef,
              bundleDigest: bundle.bundleDigest,
              bundlePath: bundle.bundlePath
            },
      levers: entries.map((entry) => leverProjectionRow(entry, bundle))
    })}\n`
  );
  return 0;
}

async function runAssessResultCommand(
  command: ParsedAssessResultCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  const workspaceRoot = resolveWorkspace(io.cwd(), command.workspace);
  const toolchainBinding = await requireToolchainWorkspaceBinding(workspaceRoot);
  const eventLogPath = runtimeEventLogPath(toolchainBinding);
  const resultPath = isAbsolute(command.result)
    ? resolve(command.result)
    : resolve(workspaceRoot, command.result);
  const payload = JSON.parse(await readFile(resultPath, "utf8")) as unknown;
  seedRuntimeEventAdmissionOrdinal(await readReplayEvents(eventLogPath));
  const emitted: RuntimeEvent[] = [];
  const outcome = resultAssessment(payload, (event) => {
    emitted.push(event);
  });
  await appendRuntimeEvents(eventLogPath, emitted);
  io.stdout(
    `${JSON.stringify({
      command: "assess-result",
      status: outcome.kind,
      result: resultPath,
      event_kinds: emitted.map((event) => event.kind),
      events_path: eventLogPath,
      outcome
    })}\n`
  );
  return outcome.kind === "accepted" ? 0 : 1;
}

async function runTypecheckGtlProgramCommand(
  command: ParsedTypecheckGtlProgramCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  const inputPath = resolveWorkspace(io.cwd(), command.input);
  const input = JSON.parse(await readFile(inputPath, "utf8")) as unknown;
  const report = typecheckGtlProgram(input);
  if (command.format === "text") {
    io.stdout(
      [
        `status=${report.passed ? "passed" : "failed"}`,
        `reportRef=${report.reportRef}`,
        `inventoryDigest=${report.inventoryDigest}`,
        `issueCount=${report.issueCount}`,
        formatGtlProgramConformanceIssues(report.issues)
      ].join("\n") + "\n"
    );
  } else {
    io.stdout(
      `${JSON.stringify({
        command: "typecheck-gtl-program",
        status: report.passed ? "passed" : "failed",
        input: inputPath,
        report
      })}\n`
    );
  }
  return report.passed ? 0 : 1;
}

async function runInstallCommand(
  command: ParsedInstallCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  const targetRoot = resolveWorkspace(io.cwd(), command.target);
  const packageSourceRoot = await resolvePackageSource(
    io.cwd(),
    command.packageSource
  );
  const mutableStateRoots: Record<string, string> = {};
  for (const [key, value] of [
    ["observedWorkspaceRoot", command.observedWorkspaceRoot],
    ["observerStateRoot", command.observerStateRoot],
    ["executorStateRoot", command.executorStateRoot],
    ["eventRoot", command.eventRoot],
    ["eventLogPath", command.eventLogPath],
    ["runtimeRoot", command.runtimeRoot],
    ["projectionRoot", command.projectionRoot],
    ["archiveRoot", command.archiveRoot]
  ] as const) {
    if (value !== null) {
      mutableStateRoots[key] = resolveWorkspace(io.cwd(), value);
    }
  }
  const outcome = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot,
    installedPackageName: await resolveInstallPackageName(
      targetRoot,
      command.installedPackageName
    ),
    toolchainRoot: resolveOptionalWorkspace(io.cwd(), command.toolchainRoot),
    ...(Object.keys(mutableStateRoots).length === 0
      ? {}
      : { mutableStateRoots })
  });
  io.stdout(
    `${JSON.stringify({
      command: "install",
      status: outcome.kind,
      target_root: targetRoot,
      package_source_root: packageSourceRoot,
      outcome
    })}\n`
  );
  return outcome.kind === "installed" ? 0 : 1;
}

async function runContextBootstrapCommand(
  command: ParsedContextBootstrapCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  const targetRoot = resolveWorkspace(io.cwd(), command.target);
  const packageSourceRoot = await resolvePackageSource(
    io.cwd(),
    command.packageSource
  );
  const mutableStateRoots: Record<string, string> = {};
  for (const [key, value] of Object.entries({
    observedWorkspaceRoot: command.observedWorkspaceRoot,
    observerStateRoot: command.observerStateRoot,
    executorStateRoot: command.executorStateRoot,
    eventRoot: command.eventRoot,
    eventLogPath: command.eventLogPath,
    runtimeRoot: command.runtimeRoot,
    projectionRoot: command.projectionRoot,
    archiveRoot: command.archiveRoot
  })) {
    if (value !== null) {
      mutableStateRoots[key] = resolveWorkspace(io.cwd(), value);
    }
  }
  const outcome = await installAbiogenesisContextBootstrap({
    targetRoot,
    packageSourceRoot,
    toolchainRoot: resolveOptionalWorkspace(io.cwd(), command.toolchainRoot),
    ...(Object.keys(mutableStateRoots).length === 0
      ? {}
      : { mutableStateRoots })
  });
  io.stdout(
    `${JSON.stringify({
      command: "context-bootstrap",
      status: outcome.kind,
      target_root: targetRoot,
      package_source_root: packageSourceRoot,
      outcome
    })}\n`
  );
  return 0;
}

async function runReleaseSnapshotCommand(
  command: ParsedReleaseSnapshotCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  const packageSourceRoot = await resolvePackageSource(
    io.cwd(),
    command.packageSource
  );
  const sourceCommit =
    command.sourceCommit ??
    requiredGitOutput(packageSourceRoot, ["rev-parse", "HEAD"], "source commit");
  const outcome = await createReleaseSnapshotBundle({
    releaseIdentity: command.releaseIdentity,
    packageSourceRoot,
    snapshotRoot: resolveWorkspace(io.cwd(), command.snapshotRoot),
    sourceRef: command.sourceRef ?? gitSourceRef(packageSourceRoot),
    sourceCommit,
    sourceDirty: gitSourceDirty(packageSourceRoot),
    allowDirtySource: command.allowDirtySource,
    rcBranch: command.rcBranch,
    releaseNotePath: resolveOptionalWorkspace(io.cwd(), command.releaseNote),
    expectedPackageName: command.expectedPackageName,
    expectedPackageVersion: command.expectedPackageVersion,
    runBuild: command.runBuild,
    npmCacheRoot: resolveOptionalWorkspace(io.cwd(), command.npmCacheRoot),
    createdAt: new Date().toISOString()
  });
  io.stdout(
    `${JSON.stringify({
      command: "release-snapshot",
      status: outcome.kind,
      release_identity: command.releaseIdentity,
      package_source_root: packageSourceRoot,
      snapshot_root: resolveWorkspace(io.cwd(), command.snapshotRoot),
      outcome
    })}\n`
  );
  return outcome.kind === "created" ? 0 : 1;
}

async function runParsedCommand(
  command: ParsedCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  switch (command.kind) {
    case "context-bootstrap":
      return runContextBootstrapCommand(command, io);
    case "install":
      return runInstallCommand(command, io);
    case "start":
      return runStartCommand(command, io);
    case "gaps":
      return runGapsCommand(command, io);
    case "gen-config":
      return runGenConfigCommand(command, io);
    case "assess-result":
      return runAssessResultCommand(command, io);
    case "typecheck-gtl-program":
      return runTypecheckGtlProgramCommand(command, io);
    case "release-snapshot":
      return runReleaseSnapshotCommand(command, io);
    default: {
      const exhaustive: never = command;
      throw new CliError(`unsupported command ${JSON.stringify(exhaustive)}`);
    }
  }
}

export async function runAbiogenesisCli(
  argv: readonly string[],
  io: AbiogenesisCliIo
): Promise<number> {
  try {
    return await runParsedCommand(parseCommand(argv), io);
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "unknown CLI error";
    const exitCode = error instanceof CliError ? error.exitCode : 1;
    io.stdout(`${JSON.stringify({ status: "error", reason })}\n`);
    io.stderr(`${reason}\n`);
    return exitCode;
  }
}
