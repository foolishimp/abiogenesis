// Implements: REQ-P-POLICY-017

import { access, appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type {
  RuntimeEvent,
  StartIntent
} from "../abg/m03/contracts/carriers.js";
import type { Module } from "../gtl/m02/contracts/carriers.js";
import {
  constructModuleLookupAuthority,
  resolvePublishedGraphFunction
} from "../gtl/m02/contracts/lookup.js";
import {
  admitOperatorAssetQueryContract,
  installAbiogenesisTypescript,
  publicGaps,
  publicCallableStart,
  resolvePublicAssetTarget,
  resultAssessment
} from "../app/m04/index.js";
import type { OperatorAssetQueryContract } from "../app/m04/asset_addressing/carriers.js";
import type {
  FhMode,
  PublicStartRequest,
  RootMode
} from "../app/m04/contracts/carriers.js";
import type { PublicCallableStartOutcome } from "../app/m04/max_autonomy/carriers.js";
import type { PublicStartContext } from "../app/m04/public_start.js";

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
  | ParsedInstallCommand
  | ParsedStartCommand
  | ParsedGapsCommand
  | ParsedAssessResultCommand;

interface ParsedInstallCommand {
  readonly kind: "install";
  readonly target: string;
  readonly packageSource: string | null;
  readonly installedPackageName: string;
}

interface ParsedStartCommand {
  readonly kind: "start";
  readonly workspace: string;
  readonly scope: string;
  readonly target: CliStartTarget;
  readonly until: StartIntent["until"];
  readonly fhMode: FhMode;
  readonly rootMode: RootMode;
}

interface ParsedGapsCommand {
  readonly kind: "gaps";
  readonly workspace: string;
  readonly scope: string;
}

interface ParsedAssessResultCommand {
  readonly kind: "assess-result";
  readonly workspace: string;
  readonly result: string;
}

type CliStartTarget =
  | { readonly kind: "next"; readonly publicRef: "next" }
  | {
      readonly kind: "graph_function";
      readonly handle: string;
      readonly publicRef: string;
    }
  | { readonly kind: "asset"; readonly handle: string; readonly publicRef: string };

interface RuntimeBinding {
  readonly module: Module;
  readonly runtimeIdentity: PublicStartContext["runtimeIdentity"];
  readonly resolvedPolicy: PublicStartContext["resolvedPolicy"];
  readonly runtimeEvents?: readonly RuntimeEvent[];
  readonly runId?: string | null;
  readonly workKey?: string | null;
  readonly frameId?: string | null;
  readonly frameLineageId?: string | null;
  readonly operatorAssetContract?: OperatorAssetQueryContract;
  readonly operatorAssets?: unknown;
}

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
  return Object.freeze({
    kind: "start",
    workspace: optionalFlag(parsed, "workspace", "."),
    scope: requiredFlag(parsed, "scope"),
    target: parseStartTarget(requiredFlag(parsed, "target")),
    until: parseUntil(requiredFlag(parsed, "until")),
    fhMode: parseFhMode(optionalFlag(parsed, "fh-mode", "direct")),
    rootMode: parseRootMode(optionalFlag(parsed, "root-mode", "direct"))
  });
}

function parseInstallCommand(args: readonly string[]): ParsedInstallCommand {
  const parsed = parseFlags(args);
  requireNoPositionals(parsed, "install");
  requireAllowedFlags(parsed, "install", [
    "target",
    "package-source",
    "installed-package-name"
  ]);
  return Object.freeze({
    kind: "install",
    target: requiredFlag(parsed, "target"),
    packageSource: optionalNullableFlag(parsed, "package-source"),
    installedPackageName: optionalFlag(
      parsed,
      "installed-package-name",
      "abiogenesis-typescript-installed-runtime"
    )
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

function parseCommand(argv: readonly string[]): ParsedCommand {
  const command = argv[0];
  if (command === undefined) {
    throw new CliError("command is required");
  }
  const args = argv.slice(1);
  switch (command) {
    case "install":
      return parseInstallCommand(args);
    case "start":
      return parseStartCommand(args);
    case "gaps":
      return parseGapsCommand(args);
    case "assess-result":
      return parseAssessResultCommand(args);
    default:
      throw new CliError(`unsupported command ${JSON.stringify(command)}`);
  }
}

function resolveWorkspace(cwd: string, workspace: string): string {
  return isAbsolute(workspace) ? resolve(workspace) : resolve(cwd, workspace);
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

function eventsPath(workspaceRoot: string): string {
  return join(workspaceRoot, ".ai-workspace", "events", "events.jsonl");
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
    runtimeEvents?: readonly RuntimeEvent[];
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

function defaultOperatorAssetContract(): OperatorAssetQueryContract {
  return admitOperatorAssetQueryContract({
    command: ["typescript-runtime-binding"],
    binding_source: "typescript_runtime_binding.operator_assets"
  });
}

function resolveNextTarget(module: Module): ResolvedCliTarget {
  const authority = constructModuleLookupAuthority(module);
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
  const graphFunction = module.graphFunctions.find(
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
  target: CliStartTarget
): Promise<ResolvedCliTarget> {
  switch (target.kind) {
    case "next":
      return resolveNextTarget(binding.module);
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
  binding: RuntimeBinding,
  replayEvents: readonly RuntimeEvent[]
): PublicStartContext {
  const runtimeEvents = Object.freeze([
    ...replayEvents,
    ...(binding.runtimeEvents ?? Object.freeze([]))
  ]);
  return {
    module: binding.module,
    runtimeIdentity: binding.runtimeIdentity,
    resolvedPolicy: binding.resolvedPolicy,
    runtimeEvents,
    ...(binding.runId !== undefined ? { runId: binding.runId } : {}),
    ...(binding.workKey !== undefined ? { workKey: binding.workKey } : {}),
    ...(binding.frameId !== undefined ? { frameId: binding.frameId } : {}),
    ...(binding.frameLineageId !== undefined
      ? { frameLineageId: binding.frameLineageId }
      : {})
  };
}

function startRequest(
  command: ParsedStartCommand,
  workspaceRoot: string,
  binding: RuntimeBinding,
  target: ResolvedCliTarget
): PublicStartRequest {
  if (command.scope !== "workspace") {
    throw new CliError("TypeScript CLI currently supports --scope workspace only");
  }
  return {
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot,
        moduleName: binding.module.name
      },
      target: {
        kind: "graph_function",
        handle: target.graphFunctionHandle
      },
      until: command.until
    },
    controlModes: {
      fhMode: command.fhMode,
      rootMode: command.rootMode
    },
    runtimeSelector: null
  };
}

function callableInput(request: PublicStartRequest): unknown {
  return {
    scope: {
      kind: request.startIntent.scope.kind,
      workspaceRoot: request.startIntent.scope.workspaceRoot,
      moduleName: request.startIntent.scope.moduleName
    },
    target: {
      kind: request.startIntent.target.kind,
      handle: request.startIntent.target.handle
    },
    until: request.startIntent.until,
    fh_mode: request.controlModes.fhMode,
    root_mode: request.controlModes.rootMode
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
  const binding = await loadRuntimeBinding(workspaceRoot);
  const eventLogPath = eventsPath(workspaceRoot);
  const replayEvents = await readReplayEvents(eventLogPath);
  const target = await resolveCliTarget(workspaceRoot, binding, command.target);
  const request = startRequest(command, workspaceRoot, binding, target);
  const emitted: RuntimeEvent[] = [];
  const outcome = publicCallableStart(
    callableInput(request),
    startContext(binding, replayEvents),
    (event) => {
      emitted.push(event);
    }
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
    fh_mode: command.fhMode,
    root_mode: command.rootMode,
    event_kinds: emitted.map((event) => event.kind),
    events_path: eventLogPath,
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
      dispatch_requested: entry.dispatchRequested
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
  const binding = await loadRuntimeBinding(workspaceRoot);
  const projection = publicGaps(
    {
      scope: {
        kind: "workspace",
        workspaceRoot,
        moduleName: binding.module.name
      }
    },
    startContext(binding, await readReplayEvents(eventsPath(workspaceRoot)))
  );
  io.stdout(`${JSON.stringify(gapsOutput(projection))}\n`);
  return 0;
}

async function runAssessResultCommand(
  command: ParsedAssessResultCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  const workspaceRoot = resolveWorkspace(io.cwd(), command.workspace);
  const resultPath = isAbsolute(command.result)
    ? resolve(command.result)
    : resolve(workspaceRoot, command.result);
  const payload = JSON.parse(await readFile(resultPath, "utf8")) as unknown;
  const emitted: RuntimeEvent[] = [];
  const outcome = resultAssessment(payload, (event) => {
    emitted.push(event);
  });
  await appendRuntimeEvents(eventsPath(workspaceRoot), emitted);
  io.stdout(
    `${JSON.stringify({
      command: "assess-result",
      status: outcome.kind,
      result: resultPath,
      event_kinds: emitted.map((event) => event.kind),
      outcome
    })}\n`
  );
  return outcome.kind === "accepted" ? 0 : 1;
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
  const outcome = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot,
    installedPackageName: command.installedPackageName
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

async function runParsedCommand(
  command: ParsedCommand,
  io: AbiogenesisCliIo
): Promise<number> {
  switch (command.kind) {
    case "install":
      return runInstallCommand(command, io);
    case "start":
      return runStartCommand(command, io);
    case "gaps":
      return runGapsCommand(command, io);
    case "assess-result":
      return runAssessResultCommand(command, io);
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
