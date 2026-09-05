import {
  delimiter as pathDelimiter,
  dirname,
  isAbsolute,
  join,
  posix,
  relative,
  resolve,
  win32,
} from "node:path";

import type { ActorProcessObservation } from "../abg/actor_process.js";
import {
  canonicalJson,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isWorkspaceAuthorityBasis,
  type WorkspaceAuthorityBasis,
  type WorkspaceBinding,
} from "./environment.js";
import {
  isCapabilityGrantValue,
  type CapabilityGrant,
} from "./invocation.js";
import {
  isWorksiteConstructionResult,
  type WorksiteConstructionResult,
} from "./worksite_construction.js";
import {
  isWorksiteObservation,
  isWorksiteSubject,
  constructWorksiteSubject,
  type FileWorksiteObservation,
  type WorksiteObservation,
  type WorksiteSubject,
} from "./worksite_effect.js";
const SCHEMA_VERSION = "5.0.0" as const;
const BASE64_PATTERN =
  "^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$";

/** Exact identities for the bounded C2 worker-executes sibling. */
export const WORKSITE_COMMAND_EXECUTION_IDS = Object.freeze({
  moduleRef: "module://abiogenesis/worksite/command-execution@5",
  programRef: "program://abiogenesis/worksite/command-execution@5",
  startRef: "start://abiogenesis/worksite/command-execution@5",
  graphFunctionRef:
    "graph-function://abiogenesis/worksite/command-execution@5",
  graphRef: "graph://abiogenesis/worksite/command-execution@5",
  nodeRef: "node://abiogenesis/worksite/command-execution/fp@5",
  armId: "arm://abiogenesis/worksite/command-execution/fp@5",
  taskContractRef:
    "contract://abiogenesis/worksite/command-execution-task@5",
  workerResultContractRef:
    "contract://abiogenesis/worksite/command-execution-worker-result@5",
  observationContractRef:
    "contract://abiogenesis/worksite/command-execution-observation@5",
  failureContractRef:
    "contract://abiogenesis/worksite/command-execution-failure@5",
  refusalContractRef:
    "contract://abiogenesis/worksite/command-execution-refusal@5",
  evidenceContractRef:
    "contract://abiogenesis/worksite/command-execution-evidence@5",
  judgmentContractRef:
    "contract://abiogenesis/worksite/command-execution-judgment@5",
  transitionContractRef:
    "contract://abiogenesis/worksite/command-execution-transition@5",
  closureContractRef:
    "contract://abiogenesis/worksite/command-execution-closure@5",
  implementationRef:
    "implementation://abiogenesis/worksite/command-execution-fp@5",
  implementationBindingRef:
    "implementation-binding://abiogenesis/worksite/command-execution-fp@5",
  judgmentPredicateRef:
    "predicate://abiogenesis/worksite/command-execution-observation@5",
  materializationPlanRef:
    "prompt-plan://abiogenesis/worksite/command-execution@5",
  rendererRef:
    "renderer://abiogenesis/worksite/command-execution@5",
  workerActorRef:
    "actor://abiogenesis/worksite/command-execution-worker@5",
  workerBindingRef:
    "worker-binding://abiogenesis/worksite/command-execution-worker@5",
  httpPortFileArgumentPlaceholder: "{ABI_HTTP_PORT_FILE}",
  transportLane: "worker_executes" as const,
});

export interface WorksiteCommandEnvironmentEntry {
  readonly kind: "worksite_command_environment_entry";
  readonly schemaVersion: "5.0.0";
  readonly name: string;
  readonly value: string;
}

export interface WorksiteDeclaredCommand {
  readonly kind: "worksite_declared_command";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly commandId: string;
  readonly executable: string;
  readonly args: readonly string[];
  readonly relativeCwd: string;
  readonly environment: readonly WorksiteCommandEnvironmentEntry[];
  readonly timeoutMs: number;
  readonly terminationGraceMs: number;
  readonly expectedReports: readonly WorksiteExpectedReport[];
}

export interface WorksiteExpectedReport {
  readonly kind: "worksite_expected_report";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly reportIdentity: string;
  readonly relativePath: string;
}

export interface WorksiteExpectedReportInput {
  readonly reportIdentity: string;
  readonly relativePath: string;
}

export interface WorksiteDeclaredCommandInput {
  readonly commandId: string;
  readonly executable: string;
  readonly args: readonly string[];
  readonly relativeCwd: string;
  readonly environment?: Readonly<Record<string, string>> | readonly WorksiteCommandEnvironmentEntry[];
  readonly timeoutMs: number;
  readonly terminationGraceMs: number;
  readonly expectedReports: readonly WorksiteExpectedReportInput[];
}

export interface WorksiteOutcomePredicate {
  readonly kind: "worksite_outcome_predicate";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly predicateId: string;
  readonly predicateKind: string;
  readonly declaration: JsonValue;
}

export interface WorksiteOutcomePredicateInput {
  readonly predicateId: string;
  readonly predicateKind: string;
  readonly declaration: JsonValue;
}

export interface WorksiteProtectedObservation {
  readonly kind: "worksite_protected_observation";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly sourceMemberRef: string;
  readonly subject: WorksiteSubject;
  readonly observation: FileWorksiteObservation;
}

export interface WorksiteProtectedObservationInput {
  readonly sourceMemberRef: string;
  readonly subject: WorksiteSubject;
  readonly observation: FileWorksiteObservation;
}

export interface WorksiteCommandWriteTerritory {
  readonly kind: "worksite_command_write_territory";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly territoryRef: string;
  readonly territoryDigest: Sha256Digest;
  readonly pathKind: "file" | "subtree";
  readonly relativePath: string;
  readonly purpose: "execution_evidence";
}

export interface WorksiteCommandWriteTerritoryInput {
  readonly pathKind: "file" | "subtree";
  readonly relativePath: string;
}

export interface WorksiteCommandExecutionTask {
  readonly kind: "worksite_command_execution_task";
  readonly schemaVersion: "5.0.0";
  readonly taskRef: string;
  readonly taskDigest: Sha256Digest;
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly capabilityGrant: CapabilityGrant;
  readonly sourceConstructionResultRef: string;
  readonly sourceConstructionResultDigest: Sha256Digest;
  readonly sourceConstructionResult: WorksiteConstructionResult;
  readonly materializationPlanRef:
    typeof WORKSITE_COMMAND_EXECUTION_IDS.materializationPlanRef;
  readonly rendererRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.rendererRef;
  readonly instructionContractRef:
    typeof WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef;
  readonly resultContractRef:
    typeof WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef;
  readonly workerActorRef:
    typeof WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef;
  readonly workerBindingRef:
    typeof WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef;
  readonly transportLane: "worker_executes";
  readonly commands: readonly WorksiteDeclaredCommand[];
  readonly outcomePredicates: readonly WorksiteOutcomePredicate[];
  readonly protectedObservations: readonly WorksiteProtectedObservation[];
  readonly allowedWriteTerritories: readonly WorksiteCommandWriteTerritory[];
}

export interface WorksiteCommandExecutionTaskInput {
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly capabilityGrant: CapabilityGrant;
  readonly sourceConstructionResultRef: string;
  readonly sourceConstructionResultDigest: Sha256Digest;
  readonly sourceConstructionResult: WorksiteConstructionResult;
  readonly commands: readonly WorksiteDeclaredCommandInput[];
  readonly outcomePredicates?: readonly WorksiteOutcomePredicateInput[];
  readonly protectedObservations: readonly WorksiteProtectedObservationInput[];
  readonly allowedWriteTerritories: readonly WorksiteCommandWriteTerritoryInput[];
}

export interface WorksiteObservedStream {
  readonly kind: "worksite_observed_stream";
  readonly schemaVersion: "5.0.0";
  readonly encoding: "base64";
  readonly payload: string;
  readonly byteLength: number;
  readonly digest: Sha256Digest;
}

export interface WorksiteCommandResult {
  readonly kind: "worksite_command_result";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly commandId: string;
  readonly executable: string;
  readonly args: readonly string[];
  readonly relativeCwd: string;
  readonly environment: readonly WorksiteCommandEnvironmentEntry[];
  readonly timeoutMs: number;
  readonly terminationGraceMs: number;
  readonly exitStatus: number;
  readonly timedOut: boolean;
  readonly processSignal: string | null;
  readonly signalSequence: readonly ("SIGTERM" | "SIGKILL")[];
  readonly terminationConfirmed: boolean;
  readonly stdout: WorksiteObservedStream;
  readonly stderr: WorksiteObservedStream;
  readonly reports: readonly WorksiteReportObservation[];
  readonly reportCount: number;
  readonly observationRef: string;
  readonly observationDigest: Sha256Digest;
}

export interface WorksiteReportObservation {
  readonly kind: "worksite_report_observation";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly commandOrdinal: number;
  readonly commandId: string;
  readonly expectedReportIdentity: string;
  readonly relativePath: string;
  readonly state: "absent" | "file";
  readonly byteLength: number | null;
  readonly digest: Sha256Digest | null;
  readonly observationRef: string;
  readonly observationDigest: Sha256Digest;
}

export interface WorksitePredicateObservation {
  readonly kind: "worksite_predicate_observation";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly predicateId: string;
  readonly predicateKind: string;
  readonly observedValue: JsonValue;
  readonly evidence: readonly JsonValue[];
  readonly evidenceRefs: readonly string[];
}

export interface WorksitePathObservation {
  readonly kind: "worksite_path_observation";
  readonly schemaVersion: "5.0.0";
  readonly relativePath: string;
  readonly nodeKind: "directory" | "file" | "symlink";
  readonly digest: Sha256Digest;
  readonly byteLength: number | null;
  readonly symlinkTarget: string | null;
}

export interface WorksitePathDelta {
  readonly kind: "worksite_path_delta";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly changeKind: "changed" | "created" | "deleted";
  readonly relativePath: string;
  readonly before: WorksitePathObservation | null;
  readonly after: WorksitePathObservation | null;
  readonly matchedTerritoryRef: string | null;
}

export interface WorksiteCommandExecutionWorkerResult {
  readonly kind: "worksite_command_execution_worker_result";
  readonly schemaVersion: "5.0.0";
  readonly taskRef: string;
  readonly taskDigest: Sha256Digest;
  readonly workspaceBindingIdentity: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly sourceConstructionResultRef: string;
  readonly sourceConstructionResultDigest: Sha256Digest;
  readonly commandResults: readonly WorksiteCommandResult[];
  readonly predicateObservations: readonly WorksitePredicateObservation[];
}

export interface WorksiteCommandExecutionProvenance {
  readonly kind: "worksite_command_execution_provenance";
  readonly schemaVersion: "5.0.0";
  readonly actorInvocationRef: string;
  readonly actorRef: string;
  readonly workerBindingRef: string;
  readonly actorProcessRef: string;
  readonly transportBindingRef: string;
  readonly transportBindingDigest: Sha256Digest;
  readonly transportDigest: Sha256Digest;
  readonly toolCallCount: number;
  readonly helperArtifactPath: string;
  readonly helperArtifactRef: string;
  readonly helperArtifactDigest: Sha256Digest;
  readonly helperArtifactByteLength: number;
  readonly helperToolInvocation: Readonly<{
    readonly kind: "worker_tool_invocation_evidence";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly toolUseRef: string;
    readonly toolName: string;
    readonly inputDigest: Sha256Digest;
    readonly inputByteLength: number;
  }>;
  readonly helperPlan: WorksiteCommandExecutionHelperPlan;
}

export interface WorksiteCommandHelperArtifact {
  readonly kind: "worksite_command_helper_artifact";
  readonly schemaVersion: "5.0.0";
  readonly artifactRef: string;
  readonly artifactDigest: Sha256Digest;
  readonly taskRef: string;
  readonly taskDigest: Sha256Digest;
  readonly disposition: "product_mismatch" | "protected_mismatch" | "success" | "territory_mismatch";
  readonly commandResults: readonly WorksiteCommandResult[];
  readonly predicateObservations: readonly WorksitePredicateObservation[];
  readonly worksiteDelta: readonly WorksitePathDelta[];
  readonly productDelta: readonly WorksitePathDelta[];
  readonly snapshotRoot: string;
  readonly snapshotRef: string;
  readonly snapshotDigest: Sha256Digest;
  readonly snapshotMembers: readonly WorksiteSnapshotMember[];
  readonly protectedBefore: readonly WorksiteObservation[];
  readonly protectedAfter: readonly WorksiteObservation[];
}

export interface WorksiteSnapshotMember {
  readonly kind: "worksite_snapshot_member";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly sourceMemberRef: string;
  readonly sourceObservationRef: string;
  readonly sourceObservationDigest: Sha256Digest;
  readonly relativePath: string;
  readonly byteLength: number;
  readonly digest: Sha256Digest;
}

export interface WorksiteCommandExecutionHelperPlan {
  readonly kind: "worksite_command_execution_helper_plan";
  readonly schemaVersion: "5.0.0";
  readonly attemptRef: string;
  readonly helperModulePath: string;
  readonly taskManifestPath: string;
  readonly taskManifestDigest: Sha256Digest;
  readonly taskManifestByteLength: number;
  readonly artifactPath: string;
  readonly sandboxRoot: string;
  readonly toolCommand: string;
  readonly toolInputDigest: Sha256Digest;
  readonly toolInputByteLength: number;
}

export interface WorksiteCommandExecutionObservation {
  readonly kind: "worksite_command_execution_observation";
  readonly schemaVersion: "5.0.0";
  readonly observationRef: string;
  readonly observationDigest: Sha256Digest;
  readonly task: WorksiteCommandExecutionTask;
  readonly provenance: WorksiteCommandExecutionProvenance;
  readonly helperArtifactRef: string;
  readonly helperArtifactDigest: Sha256Digest;
  readonly commandResults: readonly WorksiteCommandResult[];
  readonly predicateObservations: readonly WorksitePredicateObservation[];
  readonly worksiteDelta: readonly WorksitePathDelta[];
  readonly productDelta: readonly WorksitePathDelta[];
  readonly snapshotRef: string;
  readonly snapshotDigest: Sha256Digest;
  readonly snapshotMembers: readonly WorksiteSnapshotMember[];
}

export interface WorksiteCommandExecutionFailure {
  readonly kind: "worksite_command_execution_failure";
  readonly schemaVersion: "5.0.0";
  readonly failureClass: string;
  readonly diagnosticRef: string;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(
  value: Readonly<Record<string, unknown>>,
  fields: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...fields].sort().join("\0");
}

function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 &&
    value.trim() === value && !value.includes("\0");
}

function same(left: unknown, right: unknown): boolean {
  return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
}

function identity(prefix: string, digest: Sha256Digest): string {
  return `${prefix}/${digest.slice("sha256:".length)}`;
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

export function worksiteCommandExecutionHelperPlan(
  task: WorksiteCommandExecutionTask,
  attemptRef: string,
): WorksiteCommandExecutionHelperPlan {
  if (!isWorksiteCommandExecutionTask(task) || !nonempty(attemptRef)) {
    throw new TypeError("command helper plan requires one exact task and attempt identity");
  }
  const helperModulePath = join(
    task.workspaceBinding.roots.toolchainRoot,
    "node_modules", "@abiogenesis", "typescript-tenant", "build", "code", "src",
    "implementation", "worksite_command_helper.js",
  );
  const attemptDigest = sha256Canonical({ attemptRef });
  const attemptRoot = join(
    task.workspaceBinding.roots.archiveRoot,
    "worksite-command-execution",
    task.taskDigest.slice("sha256:".length),
    attemptDigest.slice("sha256:".length),
  );
  const taskManifestPath = join(attemptRoot, "task.json");
  const launchManifestPath = join(dirname(taskManifestPath), "launch.json");
  const artifactPath = join(attemptRoot, "result.json");
  const sandboxRoot = join(attemptRoot, "sandbox");
  const taskBytes = Buffer.from(`${canonicalJson(task as unknown as JsonValue)}\n`, "utf8");
  const toolCommand = [
    shellQuote(process.execPath), shellQuote(helperModulePath),
    "--task", shellQuote(launchManifestPath),
  ].join(" ");
  const toolInputBytes = Buffer.from(canonicalJson({ command: toolCommand }), "utf8");
  return deepFreeze({
    kind: "worksite_command_execution_helper_plan" as const,
    schemaVersion: SCHEMA_VERSION,
    attemptRef,
    helperModulePath,
    taskManifestPath,
    taskManifestDigest: sha256Bytes(taskBytes),
    taskManifestByteLength: taskBytes.byteLength,
    artifactPath,
    sandboxRoot,
    toolCommand,
    toolInputDigest: sha256Bytes(toolInputBytes),
    toolInputByteLength: toolInputBytes.byteLength,
  });
}

export function isWorksiteCommandExecutionHelperPlan(
  task: WorksiteCommandExecutionTask,
  value: unknown,
): value is WorksiteCommandExecutionHelperPlan {
  if (!isRecord(value) || !exactKeys(value, [
    "artifactPath", "attemptRef", "helperModulePath", "kind", "sandboxRoot", "schemaVersion",
    "taskManifestByteLength", "taskManifestDigest", "taskManifestPath", "toolCommand",
    "toolInputByteLength", "toolInputDigest",
  ]) || value.kind !== "worksite_command_execution_helper_plan" ||
    value.schemaVersion !== SCHEMA_VERSION || !nonempty(value.attemptRef)) return false;
  try {
    return same(value, worksiteCommandExecutionHelperPlan(task, value.attemptRef));
  } catch {
    return false;
  }
}

function isExactWorkspaceBinding(value: unknown): value is WorkspaceBinding {
  if (!isRecord(value) || !exactKeys(value, [
    "admissionEventRef", "authorityBasisDigest", "authorityBasisId",
    "authorizedActorRef", "bindingDigest", "bindingId", "kind", "lockDigest",
    "lockId", "productSetDigest", "productSetId", "roots", "schemaVersion",
    "workspaceId",
  ]) || value.kind !== "workspace_binding" || value.schemaVersion !== SCHEMA_VERSION ||
    !nonempty(value.bindingId) || !isSha256Digest(value.bindingDigest) ||
    !nonempty(value.workspaceId) || !nonempty(value.authorityBasisId) ||
    !isSha256Digest(value.authorityBasisDigest) || !nonempty(value.authorizedActorRef) ||
    !nonempty(value.productSetId) || !isSha256Digest(value.productSetDigest) ||
    !nonempty(value.lockId) || !isSha256Digest(value.lockDigest) ||
    !nonempty(value.admissionEventRef) || !isRecord(value.roots) ||
    !exactKeys(value.roots, [
      "archiveRoot", "eventLogRoot", "productRoot", "projectionRoot",
      "runtimeStateRoot", "toolchainRoot",
    ]) || Object.values(value.roots).some((root) =>
      !nonempty(root) || !isAbsolute(root)
    )) return false;
  const body = {
    workspaceId: value.workspaceId,
    authorityBasisId: value.authorityBasisId,
    authorityBasisDigest: value.authorityBasisDigest,
    authorizedActorRef: value.authorizedActorRef,
    productSetId: value.productSetId,
    productSetDigest: value.productSetDigest,
    lockId: value.lockId,
    lockDigest: value.lockDigest,
    roots: value.roots,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.bindingDigest === digest &&
    value.bindingId === identity("workspace-binding://abiogenesis", digest);
}

function exactWorkspaceAuthorityJoin(
  authority: WorkspaceAuthorityBasis,
  workspace: WorkspaceBinding,
): boolean {
  return isWorkspaceAuthorityBasis(authority) &&
    isExactWorkspaceBinding(workspace) &&
    authority.workspaceId === workspace.workspaceId &&
    authority.authorityBasisId === workspace.authorityBasisId &&
    authority.authorityBasisDigest === workspace.authorityBasisDigest &&
    authority.authorizedActorRef === workspace.authorizedActorRef;
}

function isExactDirectGrant(
  value: unknown,
  workspace: WorkspaceBinding,
): value is CapabilityGrant {
  return isCapabilityGrantValue(value) &&
    value.operationId === "abg.operation.run.invoke" &&
    value.definitionKey.operationId === "abg.operation.run.invoke" &&
    value.definitionKey.memberKey === "invoke" &&
    value.actorRef === workspace.authorizedActorRef &&
    value.scopeRef === workspace.bindingId &&
    value.scopeDigest === workspace.bindingDigest;
}

function safeRelativePath(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 ||
    value.trim() !== value || value.includes("\0") ||
    posix.isAbsolute(value) || win32.isAbsolute(value) || value.includes("\\") ||
    value.split("/").some((part) => part === "..")) return false;
  const normalized = posix.normalize(value);
  return normalized !== ".." && normalized === value;
}

function environmentEntries(
  value: WorksiteDeclaredCommandInput["environment"],
): readonly WorksiteCommandEnvironmentEntry[] {
  const raw = value ?? {};
  const alreadyBound = Array.isArray(raw);
  const declared = alreadyBound
    ? raw.map((entry) => ({ name: entry.name, value: entry.value }))
    : Object.entries(raw)
      .map(([name, entryValue]) => ({ name, value: entryValue }));
  if (!alreadyBound) {
    for (const name of ["HOME", "TMPDIR", "LANG", "LC_ALL"] as const) {
      const ambient = process.env[name];
      if (ambient !== undefined && !declared.some((row) => row.name === name)) {
        declared.push({ name, value: ambient });
      }
    }
  }
  const prefixRows = declared.filter((row) => row.name === "PATH_PREFIX");
  if (prefixRows.length > 1) {
    throw new TypeError("worksite command environment permits at most one PATH_PREFIX");
  }
  const rows = declared.filter((row) => row.name !== "PATH_PREFIX");
  const suppliedPath = rows.find((row) => row.name === "PATH");
  const safeAmbientPath = process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin";
  const normalizedPath: string = prefixRows[0] === undefined
    ? (suppliedPath?.value ?? safeAmbientPath)
    : `${prefixRows[0].value}${pathDelimiter}${suppliedPath?.value ?? safeAmbientPath}`;
  if (normalizedPath.split(pathDelimiter).some((segment) =>
    segment.length === 0 || !isAbsolute(segment))) {
    throw new TypeError("worksite command PATH requires only non-empty absolute entries");
  }
  if (suppliedPath === undefined) rows.push({ name: "PATH", value: normalizedPath });
  else suppliedPath.value = normalizedPath;
  rows.sort((left, right) => left.name.localeCompare(right.name));
  if (rows.some((row) =>
    !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(row.name) ||
    typeof row.value !== "string" || row.value.includes("\0")
  ) || new Set(rows.map((row) => row.name)).size !== rows.length) {
    throw new TypeError("worksite command environment requires unique POSIX names and string values");
  }
  return deepFreeze(rows.map((row) => ({
    kind: "worksite_command_environment_entry" as const,
    schemaVersion: SCHEMA_VERSION,
    ...row,
  })));
}

function constructExpectedReport(
  input: WorksiteExpectedReportInput,
  ordinal: number,
): WorksiteExpectedReport {
  if (!nonempty(input.reportIdentity) || !safeRelativePath(input.relativePath)) {
    throw new TypeError("expected report requires one identity and safe relative path");
  }
  return deepFreeze({
    kind: "worksite_expected_report" as const,
    schemaVersion: SCHEMA_VERSION,
    ordinal,
    reportIdentity: input.reportIdentity,
    relativePath: input.relativePath,
  });
}

function isExpectedReport(value: unknown, ordinal: number): value is WorksiteExpectedReport {
  return isRecord(value) && exactKeys(value, [
    "kind", "ordinal", "relativePath", "reportIdentity", "schemaVersion",
  ]) && value.kind === "worksite_expected_report" && value.schemaVersion === SCHEMA_VERSION &&
    value.ordinal === ordinal && nonempty(value.reportIdentity) && safeRelativePath(value.relativePath);
}

function constructCommand(input: WorksiteDeclaredCommandInput, ordinal: number): WorksiteDeclaredCommand {
  if (!nonempty(input.commandId) || !nonempty(input.executable) ||
    !Array.isArray(input.args) || input.args.some((arg) =>
      typeof arg !== "string" || arg.includes("\0")
    ) || !safeRelativePath(input.relativeCwd) || !Number.isSafeInteger(input.timeoutMs) ||
    input.timeoutMs <= 0 || input.timeoutMs > 3_600_000 ||
    !Number.isSafeInteger(input.terminationGraceMs) || input.terminationGraceMs <= 0 ||
    input.terminationGraceMs > 30_000 || input.terminationGraceMs >= input.timeoutMs ||
    !Array.isArray(input.expectedReports)) {
    throw new TypeError("worksite command requires exact executable, args, cwd, timeout, and reports");
  }
  const expectedReports = input.expectedReports.map(constructExpectedReport);
  if (new Set(expectedReports.map((row) => row.reportIdentity)).size !== expectedReports.length ||
    new Set(expectedReports.map((row) => row.relativePath)).size !== expectedReports.length) {
    throw new TypeError("worksite command report identities and paths must be unique");
  }
  return deepFreeze({
    kind: "worksite_declared_command" as const,
    schemaVersion: SCHEMA_VERSION,
    ordinal,
    commandId: input.commandId,
    executable: input.executable,
    args: [...input.args],
    relativeCwd: input.relativeCwd,
    environment: environmentEntries(input.environment),
    timeoutMs: input.timeoutMs,
    terminationGraceMs: input.terminationGraceMs,
    expectedReports,
  });
}

function isCommand(value: unknown, ordinal: number): value is WorksiteDeclaredCommand {
  if (!isRecord(value) || !exactKeys(value, [
    "args", "commandId", "environment", "executable", "expectedReports",
    "kind", "ordinal", "relativeCwd", "schemaVersion", "terminationGraceMs", "timeoutMs",
  ]) || value.kind !== "worksite_declared_command" || value.schemaVersion !== SCHEMA_VERSION ||
    value.ordinal !== ordinal || !Array.isArray(value.expectedReports) ||
    !value.expectedReports.every(isExpectedReport)) return false;
  try {
    return same(value, constructCommand({
      commandId: value.commandId as string,
      executable: value.executable as string,
      args: value.args as readonly string[],
      relativeCwd: value.relativeCwd as string,
      environment: value.environment as readonly WorksiteCommandEnvironmentEntry[],
      timeoutMs: value.timeoutMs as number,
      terminationGraceMs: value.terminationGraceMs as number,
      expectedReports: value.expectedReports as readonly WorksiteExpectedReport[],
    }, ordinal));
  } catch {
    return false;
  }
}

function constructPredicate(input: WorksiteOutcomePredicateInput, ordinal: number): WorksiteOutcomePredicate {
  let declaration = admitIJsonValue(input.declaration, "outcome predicate declaration");
  if (input.predicateKind === "http_response_exact" && isRecord(declaration) &&
    isRecord(declaration.launch)) {
    declaration = admitIJsonValue({
      ...declaration,
      launch: {
        ...declaration.launch,
        environment: environmentEntries(
          declaration.launch.environment as WorksiteDeclaredCommandInput["environment"],
        ),
      },
    }, "HTTP predicate declaration");
  }
  if (!nonempty(input.predicateId) || !nonempty(input.predicateKind) ||
    !validPredicateDeclaration(input.predicateKind, declaration)) {
    throw new TypeError("worksite outcome predicate requires exact id and kind");
  }
  return deepFreeze({
    kind: "worksite_outcome_predicate" as const,
    schemaVersion: SCHEMA_VERSION,
    ordinal,
    predicateId: input.predicateId,
    predicateKind: input.predicateKind,
    declaration,
  });
}

function validPredicateDeclaration(kind: string, value: JsonValue): boolean {
  if (!isRecord(value)) return false;
  const keys = (expected: readonly string[]) => exactKeys(value, expected);
  if (kind === "process_exit") {
    return keys(["equals", "validationCommandId"]) && nonempty(value.validationCommandId) &&
      Number.isSafeInteger(value.equals);
  }
  if (kind === "stdout_exact") {
    return keys(["equals", "validationCommandId"]) && nonempty(value.validationCommandId) &&
      typeof value.equals === "string";
  }
  if (kind === "test_pass_count") {
    return keys(["greaterThanOrEqual", "validationCommandId"]) && nonempty(value.validationCommandId) &&
      Number.isSafeInteger(value.greaterThanOrEqual) && Number(value.greaterThanOrEqual) >= 0;
  }
  if (kind === "module_export_return_exact") {
    return keys(["equals", "export", "path"]) && safeRelativePath(value.path) && nonempty(value.export);
  }
  if (kind === "http_response_exact") {
    if (!keys(["body", "launch", "request", "status", "validationCommandId"]) ||
      !nonempty(value.validationCommandId) || !Number.isSafeInteger(value.status) ||
      typeof value.body !== "string" || !isRecord(value.launch) || !isRecord(value.request) ||
      !exactKeys(value.launch, [
        "args", "environment", "executable", "portFile", "relativeCwd", "terminationGraceMs", "timeoutMs",
      ]) || !nonempty(value.launch.executable) || !Array.isArray(value.launch.args) ||
      !value.launch.args.every((row) => typeof row === "string" && !row.includes("\0")) ||
      value.launch.args.filter((row) =>
        row === WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder
      ).length !== 1 || !isRecord(value.launch.portFile) ||
      !exactKeys(value.launch.portFile, ["relativePath"]) ||
      !safeRelativePath(value.launch.portFile.relativePath) ||
      !safeRelativePath(value.launch.relativeCwd) || !Array.isArray(value.launch.environment) ||
      !value.launch.environment.every((entry, index) => isRecord(entry) && exactKeys(entry, [
        "kind", "name", "schemaVersion", "value",
      ]) && entry.kind === "worksite_command_environment_entry" && entry.schemaVersion === SCHEMA_VERSION &&
        typeof entry.name === "string" && typeof entry.value === "string" && index >= 0) ||
      !value.launch.environment.some((entry) => isRecord(entry) && entry.name === "PATH") ||
      !Number.isSafeInteger(value.launch.timeoutMs) || Number(value.launch.timeoutMs) <= 0 ||
      !Number.isSafeInteger(value.launch.terminationGraceMs) ||
      Number(value.launch.terminationGraceMs) <= 0 ||
      Number(value.launch.terminationGraceMs) >= Number(value.launch.timeoutMs) ||
      !exactKeys(value.request, ["hostname", "method", "path", "timeoutMs"]) ||
      (value.request.hostname !== "127.0.0.1" && value.request.hostname !== "::1") ||
      !nonempty(value.request.method) || !nonempty(value.request.path) ||
      !Number.isSafeInteger(value.request.timeoutMs) ||
      Number(value.request.timeoutMs) <= 0) return false;
    return new Set(value.launch.environment.map((entry) =>
      (entry as Readonly<Record<string, JsonValue>>).name
    )).size === value.launch.environment.length;
  }
  if (kind === "module_set_exact") {
    return keys(["equals", "selector"]) && Array.isArray(value.equals) && value.equals.every(nonempty) &&
      isRecord(value.selector) && exactKeys(value.selector, ["prefix", "segmentIndex", "source", "suffix"]) &&
      value.selector.source === "protected_paths" && typeof value.selector.prefix === "string" &&
      typeof value.selector.suffix === "string" && Number.isSafeInteger(value.selector.segmentIndex) &&
      Number(value.selector.segmentIndex) >= 0;
  }
  if (kind === "file_count") {
    return keys(["equals", "selector"]) && Number.isSafeInteger(value.equals) && Number(value.equals) >= 0 &&
      isRecord(value.selector) && exactKeys(value.selector, ["includeSubstrings", "includeSuffixes", "source"]) &&
      value.selector.source === "protected_paths" && Array.isArray(value.selector.includeSubstrings) &&
      value.selector.includeSubstrings.every((row) => typeof row === "string" && row.length > 0) &&
      Array.isArray(value.selector.includeSuffixes) &&
      value.selector.includeSuffixes.every((row) => typeof row === "string" && row.length > 0) &&
      value.selector.includeSubstrings.length + value.selector.includeSuffixes.length > 0;
  }
  if (kind === "test_report_set_exact") {
    return keys(["base", "equals", "selector"]) && safeRelativePath(value.base) &&
      Array.isArray(value.equals) && value.equals.every(safeRelativePath) &&
      isRecord(value.selector) && exactKeys(value.selector, ["includeSubstrings", "includeSuffixes"]) &&
      Array.isArray(value.selector.includeSubstrings) &&
      value.selector.includeSubstrings.every((row) => typeof row === "string" && row.length > 0) &&
      Array.isArray(value.selector.includeSuffixes) &&
      value.selector.includeSuffixes.every((row) => typeof row === "string" && row.length > 0) &&
      value.selector.includeSubstrings.length + value.selector.includeSuffixes.length > 0;
  }
  if (kind === "test_report_failure_count" || kind === "test_report_error_count") {
    return keys(["equals"]) && Number.isSafeInteger(value.equals) && Number(value.equals) >= 0;
  }
  return false;
}

function isPredicate(value: unknown, ordinal: number): value is WorksiteOutcomePredicate {
  if (!isRecord(value) || !exactKeys(value, [
    "declaration", "kind", "ordinal", "predicateId", "predicateKind", "schemaVersion",
  ]) || value.kind !== "worksite_outcome_predicate" || value.schemaVersion !== SCHEMA_VERSION ||
    value.ordinal !== ordinal) return false;
  try {
    return same(value, constructPredicate({
      predicateId: value.predicateId as string,
      predicateKind: value.predicateKind as string,
      declaration: value.declaration as JsonValue,
    }, ordinal));
  } catch {
    return false;
  }
}

function constructProtectedObservation(
  workspaceAuthorityBasis: WorkspaceAuthorityBasis,
  workspace: WorkspaceBinding,
  source: WorksiteConstructionResult,
  input: WorksiteProtectedObservationInput,
  ordinal: number,
): WorksiteProtectedObservation {
  const member = source.members[ordinal];
  if (member === undefined || input.sourceMemberRef !== member.inputMemberRef ||
    !isWorksiteSubject(input.subject) || !isWorksiteObservation(input.observation) ||
    input.observation.state !== "file" || !same(input.observation, member.successorObservation) ||
    input.subject.workspaceBindingIdentity !== workspace.bindingId ||
    input.subject.workspaceBindingDigest !== workspace.bindingDigest ||
    input.observation.workspaceBindingIdentity !== workspace.bindingId ||
    input.observation.subjectRef !== input.subject.subjectRef ||
    input.observation.subjectDigest !== input.subject.subjectDigest) {
    throw new TypeError("protected observation must bind one exact source C1 member, subject, O1, and workspace");
  }
  const exactSubject = constructWorksiteSubject({
    workspaceAuthorityBasis,
    workspaceBinding: workspace,
    subjectUri: input.subject.subjectUri,
    relativePath: input.subject.relativePath,
  });
  if (exactSubject.kind !== "worksite_subject" ||
    !same(exactSubject, input.subject)) {
    throw new TypeError(
      "protected observation subject must reproduce under the exact canonical worksite authority",
    );
  }
  return deepFreeze({
    kind: "worksite_protected_observation" as const,
    schemaVersion: SCHEMA_VERSION,
    ordinal,
    sourceMemberRef: input.sourceMemberRef,
    subject: input.subject,
    observation: input.observation,
  });
}

function isProtectedObservation(
  value: unknown,
  ordinal: number,
): value is WorksiteProtectedObservation {
  return isRecord(value) && exactKeys(value, [
    "kind", "observation", "ordinal", "schemaVersion", "sourceMemberRef", "subject",
  ]) && value.kind === "worksite_protected_observation" &&
    value.schemaVersion === SCHEMA_VERSION && value.ordinal === ordinal &&
    nonempty(value.sourceMemberRef) && isWorksiteSubject(value.subject) &&
    isWorksiteObservation(value.observation) && value.observation.state === "file";
}

function constructWriteTerritory(
  input: WorksiteCommandWriteTerritoryInput,
  ordinal: number,
): WorksiteCommandWriteTerritory {
  if ((input.pathKind !== "file" && input.pathKind !== "subtree") ||
    !safeRelativePath(input.relativePath)) {
    throw new TypeError("command write territory requires one exact file or subtree path");
  }
  const body = {
    ordinal,
    pathKind: input.pathKind,
    relativePath: input.relativePath,
    purpose: "execution_evidence" as const,
  };
  const territoryDigest = sha256Canonical(body);
  return deepFreeze({
    kind: "worksite_command_write_territory" as const,
    schemaVersion: SCHEMA_VERSION,
    territoryRef: identity("worksite-command-write-territory://abiogenesis", territoryDigest),
    territoryDigest,
    ...body,
  });
}

function isWriteTerritory(value: unknown, ordinal: number): value is WorksiteCommandWriteTerritory {
  if (!isRecord(value) || !exactKeys(value, [
    "kind", "ordinal", "pathKind", "purpose", "relativePath", "schemaVersion", "territoryDigest", "territoryRef",
  ]) || value.kind !== "worksite_command_write_territory" || value.schemaVersion !== SCHEMA_VERSION ||
    value.ordinal !== ordinal || value.purpose !== "execution_evidence" ||
    (value.pathKind !== "file" && value.pathKind !== "subtree") ||
    !safeRelativePath(value.relativePath) || !isSha256Digest(value.territoryDigest) ||
    !nonempty(value.territoryRef)) return false;
  const digest = sha256Canonical({
    ordinal, pathKind: value.pathKind, relativePath: value.relativePath, purpose: value.purpose,
  });
  return value.territoryDigest === digest &&
    value.territoryRef === identity("worksite-command-write-territory://abiogenesis", digest);
}

function withinRelativeRoot(path: string, root: string): boolean {
  const normalizedPath = posix.normalize(path.replaceAll("\\", "/"));
  const normalizedRoot = posix.normalize(root.replaceAll("\\", "/"));
  return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}/`);
}

function exposesWorkspaceRoot(
  value: string,
  authority: WorkspaceAuthorityBasis,
  workspace: WorkspaceBinding,
): boolean {
  const normalized = posix.normalize(value.replaceAll("\\", "/")).toLowerCase();
  return [authority.canonicalRoot, ...Object.values(workspace.roots)].some((root) =>
    normalized.includes(
      posix.normalize(resolve(root).replaceAll("\\", "/")).toLowerCase(),
    )
  );
}

function hasParentPathSegment(value: string): boolean {
  return /(^|[\s"'=,:;\/\\])\.\.(?=$|[\s"'=,:;\/\\])/u.test(value);
}

function unsafeChildValue(
  value: string,
  authority: WorkspaceAuthorityBasis,
  workspace: WorkspaceBinding,
): boolean {
  return exposesWorkspaceRoot(value, authority, workspace) ||
    hasParentPathSegment(value);
}

function protectedRelativeWorksitePath(
  path: string,
  authority: WorkspaceAuthorityBasis,
  workspace: WorkspaceBinding,
): boolean {
  const candidate = resolve(
    authority.canonicalRoot,
    ...path.replaceAll("\\", "/").split("/"),
  );
  return Object.values(workspace.roots).some((root) => {
    const relation = relative(resolve(root), candidate);
    return relation === "" ||
      (!isAbsolute(relation) && relation !== ".." &&
        !relation.startsWith("../"));
  });
}

function predicatePaths(predicate: WorksiteOutcomePredicate): readonly string[] {
  const declaration = predicate.declaration;
  if (!isRecord(declaration)) return [];
  if (predicate.predicateKind === "module_export_return_exact") {
    return typeof declaration.path === "string" ? [declaration.path] : [];
  }
  if (predicate.predicateKind === "test_report_set_exact") {
    return typeof declaration.base === "string" && Array.isArray(declaration.equals)
      ? [declaration.base, ...declaration.equals.flatMap((path) =>
        typeof path === "string" ? [posix.join(declaration.base as string, path)] : []
      )]
      : [];
  }
  if (predicate.predicateKind === "http_response_exact" &&
    isRecord(declaration.launch)) {
    const launch = declaration.launch;
    return [
      typeof launch.relativeCwd === "string" ? launch.relativeCwd : null,
      isRecord(launch.portFile) &&
          typeof launch.portFile.relativePath === "string"
        ? launch.portFile.relativePath
        : null,
    ].filter((path): path is string => path !== null);
  }
  return [];
}

export function worksitePathIsAllowed(
  path: string,
  territories: readonly WorksiteCommandWriteTerritory[],
): boolean {
  return territories.some((territory) => territory.pathKind === "file"
    ? posix.normalize(path.replaceAll("\\", "/")) === territory.relativePath
    : withinRelativeRoot(path, territory.relativePath));
}

export function matchingWorksiteTerritoryRef(
  path: string,
  territories: readonly WorksiteCommandWriteTerritory[],
): string | null {
  const matches = territories.filter((territory) => territory.pathKind === "file"
    ? posix.normalize(path.replaceAll("\\", "/")) === territory.relativePath
    : withinRelativeRoot(path, territory.relativePath));
  return matches.length === 1 ? matches[0]!.territoryRef : null;
}

export function constructWorksiteCommandExecutionTask(
  input: WorksiteCommandExecutionTaskInput,
): WorksiteCommandExecutionTask {
  if (!exactWorkspaceAuthorityJoin(
    input.workspaceAuthorityBasis,
    input.workspaceBinding,
  ) ||
    !isExactDirectGrant(input.capabilityGrant, input.workspaceBinding) ||
    !nonempty(input.sourceConstructionResultRef) ||
    !isSha256Digest(input.sourceConstructionResultDigest) ||
    input.sourceConstructionResultRef !== identity(
      "worksite-construction-result://abiogenesis",
      input.sourceConstructionResultDigest,
    ) || !Array.isArray(input.commands) || input.commands.length === 0 ||
    !Array.isArray(input.outcomePredicates ?? []) ||
    !Array.isArray(input.protectedObservations) ||
    !Array.isArray(input.allowedWriteTerritories) || input.allowedWriteTerritories.length === 0) {
    throw new TypeError("worksite command execution task requires exact W, grant, source C1 result, commands, and predicates");
  }
  const source = input.sourceConstructionResult;
  if (!isWorksiteConstructionResult(source) ||
    source.resultRef !== input.sourceConstructionResultRef ||
    source.resultDigest !== input.sourceConstructionResultDigest ||
    source.members.some((member) =>
      member.successorObservation.workspaceBindingIdentity !== input.workspaceBinding.bindingId
    )) {
    throw new TypeError("worksite command execution source value differs from its exact C1 coordinates or workspace");
  }
  const commands = input.commands.map(constructCommand);
  const predicates = (input.outcomePredicates ?? []).map(constructPredicate);
  const protectedObservations = input.protectedObservations.map((row, ordinal) =>
    constructProtectedObservation(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
      source,
      row,
      ordinal,
    )
  );
  const allowedWriteTerritories = input.allowedWriteTerritories.map(constructWriteTerritory);
  const territoriesOverlap = allowedWriteTerritories.some((left, leftOrdinal) =>
    allowedWriteTerritories.some((right, rightOrdinal) => leftOrdinal !== rightOrdinal &&
      (left.pathKind === "subtree" && withinRelativeRoot(right.relativePath, left.relativePath) ||
        right.pathKind === "subtree" && withinRelativeRoot(left.relativePath, right.relativePath) ||
        left.relativePath === right.relativePath)));
  const commandIds = new Set(commands.map((row) => row.commandId));
  const reportRows = commands.flatMap((row) => row.expectedReports);
  const referencedCommandsAreExact = predicates.every((predicate) => {
    if (!isRecord(predicate.declaration) ||
      !Object.hasOwn(predicate.declaration, "validationCommandId")) return true;
    return typeof predicate.declaration.validationCommandId === "string" &&
      commandIds.has(predicate.declaration.validationCommandId);
  });
  const reportSetPredicates = predicates.filter((row) => row.predicateKind === "test_report_set_exact");
  const reportCountsHaveOneBase = predicates.every((row) =>
    (row.predicateKind !== "test_report_failure_count" && row.predicateKind !== "test_report_error_count") ||
    reportSetPredicates.length === 1
  );
  const declaredReportPathsAreObserved = reportSetPredicates.every((row) => {
    const declaration = row.declaration as Readonly<Record<string, JsonValue>>;
    return typeof declaration.base === "string" && Array.isArray(declaration.equals) &&
      declaration.equals.every((path) => typeof path === "string" && reportRows.some((report) =>
        report.relativePath === posix.join(declaration.base as string, path)
      ));
  });
  const modulePredicatesAreProtected = predicates.every((row) => {
    if (row.predicateKind !== "module_export_return_exact") return true;
    const declaration = row.declaration;
    return isRecord(declaration) && typeof declaration.path === "string" &&
      protectedObservations.some((protectedRow) => protectedRow.subject.relativePath === declaration.path);
  });
  const childInputsExposeWorkspace = commands.some((command) =>
    unsafeChildValue(command.executable, input.workspaceAuthorityBasis, input.workspaceBinding) ||
    command.args.some((arg) => unsafeChildValue(
      arg,
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
    )) ||
    command.environment.some((entry) => unsafeChildValue(
      entry.value,
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
    ))) ||
    predicates.some((predicate) => {
      if (predicate.predicateKind !== "http_response_exact" || !isRecord(predicate.declaration) ||
        !isRecord(predicate.declaration.launch)) return false;
      const launch = predicate.declaration.launch;
      return typeof launch.executable === "string" &&
          unsafeChildValue(
            launch.executable,
            input.workspaceAuthorityBasis,
            input.workspaceBinding,
          ) ||
        (launch.args as readonly JsonValue[]).some((arg) =>
        typeof arg === "string" && unsafeChildValue(
          arg,
          input.workspaceAuthorityBasis,
          input.workspaceBinding,
        )) ||
        (launch.environment as readonly JsonValue[]).some((rawEntry) => {
          const entry = rawEntry as Readonly<Record<string, JsonValue>>;
          return typeof entry.value === "string" && unsafeChildValue(
            entry.value,
            input.workspaceAuthorityBasis,
            input.workspaceBinding,
          );
        });
    });
  const httpPortFilesAreAuthorized = predicates.every((predicate) => {
    if (predicate.predicateKind !== "http_response_exact" || !isRecord(predicate.declaration) ||
      !isRecord(predicate.declaration.launch) || !isRecord(predicate.declaration.launch.portFile)) return true;
    return typeof predicate.declaration.launch.portFile.relativePath === "string" &&
      worksitePathIsAllowed(
        predicate.declaration.launch.portFile.relativePath,
        allowedWriteTerritories,
      );
  });
  const declaredPathsEnterProtectedRoots = [
    ...commands.flatMap((command) => [
      command.relativeCwd,
      ...command.expectedReports.map((report) => report.relativePath),
    ]),
    ...allowedWriteTerritories.map((territory) => territory.relativePath),
    ...predicates.flatMap(predicatePaths),
  ].some((path) => protectedRelativeWorksitePath(
    path,
    input.workspaceAuthorityBasis,
    input.workspaceBinding,
  ));
  if (new Set(commands.map((row) => row.commandId)).size !== commands.length ||
    new Set(predicates.map((row) => row.predicateId)).size !== predicates.length ||
    protectedObservations.length !== source.members.length ||
    new Set(protectedObservations.map((row) => row.subject.subjectRef)).size !== protectedObservations.length ||
    new Set(allowedWriteTerritories.map((row) => `${row.pathKind}:${row.relativePath}`)).size !== allowedWriteTerritories.length ||
    territoriesOverlap ||
    new Set(reportRows.map((row) => row.reportIdentity)).size !== reportRows.length ||
    new Set(reportRows.map((row) => row.relativePath)).size !== reportRows.length ||
    !referencedCommandsAreExact || !reportCountsHaveOneBase || !declaredReportPathsAreObserved ||
    !modulePredicatesAreProtected || childInputsExposeWorkspace ||
    declaredPathsEnterProtectedRoots || !httpPortFilesAreAuthorized ||
    protectedObservations.some((row) => worksitePathIsAllowed(row.subject.relativePath, allowedWriteTerritories)) ||
    commands.some((command) => command.expectedReports.some((report) =>
      !worksitePathIsAllowed(report.relativePath, allowedWriteTerritories)
    ))) {
    throw new TypeError("worksite command and predicate identities must be unique");
  }
  const body = {
    workspaceAuthorityBasis: input.workspaceAuthorityBasis,
    workspaceBinding: input.workspaceBinding,
    capabilityGrant: input.capabilityGrant,
    sourceConstructionResultRef: input.sourceConstructionResultRef,
    sourceConstructionResultDigest: input.sourceConstructionResultDigest,
    sourceConstructionResult: source,
    materializationPlanRef: WORKSITE_COMMAND_EXECUTION_IDS.materializationPlanRef,
    rendererRef: WORKSITE_COMMAND_EXECUTION_IDS.rendererRef,
    instructionContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,
    resultContractRef: WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef,
    workerActorRef: WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef,
    workerBindingRef: WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef,
    transportLane: WORKSITE_COMMAND_EXECUTION_IDS.transportLane,
    commands,
    outcomePredicates: predicates,
    protectedObservations,
    allowedWriteTerritories,
  } as const;
  const taskDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "worksite_command_execution_task" as const,
    schemaVersion: SCHEMA_VERSION,
    taskRef: identity("worksite-command-execution-task://abiogenesis", taskDigest),
    taskDigest,
    ...body,
  });
}

export function isWorksiteCommandExecutionTask(value: unknown): value is WorksiteCommandExecutionTask {
  if (!isRecord(value) || !exactKeys(value, [
    "allowedWriteTerritories", "capabilityGrant", "commands", "instructionContractRef", "kind",
    "materializationPlanRef", "outcomePredicates", "protectedObservations", "rendererRef", "resultContractRef",
    "schemaVersion", "sourceConstructionResult", "sourceConstructionResultDigest",
    "sourceConstructionResultRef", "taskDigest", "taskRef", "transportLane",
    "workerActorRef", "workerBindingRef", "workspaceBinding",
    "workspaceAuthorityBasis",
  ]) || value.kind !== "worksite_command_execution_task" || value.schemaVersion !== SCHEMA_VERSION ||
    !isWorkspaceAuthorityBasis(value.workspaceAuthorityBasis) ||
    !isExactWorkspaceBinding(value.workspaceBinding) ||
    !exactWorkspaceAuthorityJoin(
      value.workspaceAuthorityBasis,
      value.workspaceBinding,
    ) ||
    !Array.isArray(value.commands) || !value.commands.every(isCommand) ||
    !Array.isArray(value.outcomePredicates) || !value.outcomePredicates.every(isPredicate) ||
    !Array.isArray(value.protectedObservations) || !value.protectedObservations.every(isProtectedObservation) ||
    !Array.isArray(value.allowedWriteTerritories) || !value.allowedWriteTerritories.every(isWriteTerritory)) return false;
  try {
    const expected = constructWorksiteCommandExecutionTask({
      workspaceAuthorityBasis:
        value.workspaceAuthorityBasis as WorkspaceAuthorityBasis,
      workspaceBinding: value.workspaceBinding as WorkspaceBinding,
      capabilityGrant: value.capabilityGrant as CapabilityGrant,
      sourceConstructionResultRef: value.sourceConstructionResultRef as string,
      sourceConstructionResultDigest: value.sourceConstructionResultDigest as Sha256Digest,
      sourceConstructionResult: value.sourceConstructionResult as WorksiteConstructionResult,
      commands: value.commands as readonly WorksiteDeclaredCommand[],
      outcomePredicates: value.outcomePredicates as readonly WorksiteOutcomePredicate[],
      protectedObservations: value.protectedObservations as readonly WorksiteProtectedObservation[],
      allowedWriteTerritories: value.allowedWriteTerritories as readonly WorksiteCommandWriteTerritory[],
    });
    return same(value, expected);
  } catch {
    return false;
  }
}

function canonicalBase64(value: unknown): value is string {
  return typeof value === "string" && Buffer.from(value, "base64").toString("base64") === value;
}

function isObservedStream(value: unknown): value is WorksiteObservedStream {
  if (!isRecord(value) || !exactKeys(value, [
    "byteLength", "digest", "encoding", "kind", "payload", "schemaVersion",
  ]) || value.kind !== "worksite_observed_stream" || value.schemaVersion !== SCHEMA_VERSION ||
    value.encoding !== "base64" || !canonicalBase64(value.payload) ||
    !Number.isSafeInteger(value.byteLength) || Number(value.byteLength) < 0 ||
    !isSha256Digest(value.digest)) return false;
  const bytes = Buffer.from(value.payload, "base64");
  return bytes.byteLength === value.byteLength && sha256Bytes(bytes) === value.digest;
}

function isReportObservation(value: unknown, ordinal: number): value is WorksiteReportObservation {
  if (!isRecord(value) || !exactKeys(value, [
    "byteLength", "commandId", "commandOrdinal", "digest", "expectedReportIdentity", "kind",
    "observationDigest", "observationRef", "ordinal", "relativePath", "schemaVersion", "state",
  ]) || value.kind !== "worksite_report_observation" || value.schemaVersion !== SCHEMA_VERSION ||
    value.ordinal !== ordinal || !Number.isSafeInteger(value.commandOrdinal) ||
    Number(value.commandOrdinal) < 0 || !nonempty(value.commandId) ||
    !nonempty(value.expectedReportIdentity) || !safeRelativePath(value.relativePath) ||
    (value.state !== "absent" && value.state !== "file") ||
    !nonempty(value.observationRef) || !isSha256Digest(value.observationDigest)) return false;
  const stateIsValid = value.state === "absent"
    ? value.byteLength === null && value.digest === null
    : Number.isSafeInteger(value.byteLength) && Number(value.byteLength) >= 0 &&
      isSha256Digest(value.digest);
  if (!stateIsValid) return false;
  const observationDigest = sha256Canonical({
    commandOrdinal: Number(value.commandOrdinal),
    commandId: value.commandId,
    expectedReportIdentity: value.expectedReportIdentity,
    reportOrdinal: value.ordinal,
    relativePath: value.relativePath,
    state: value.state,
    byteLength: value.byteLength as number | null,
    digest: value.digest as Sha256Digest | null,
  } as unknown as JsonValue);
  return value.observationDigest === observationDigest &&
    value.observationRef === identity("worksite-report-observation://abiogenesis", observationDigest);
}

function isCommandResult(value: unknown, ordinal: number): value is WorksiteCommandResult {
  if (!(isRecord(value) && exactKeys(value, [
    "args", "commandId", "environment", "executable", "exitStatus", "kind",
    "observationDigest", "observationRef", "ordinal", "processSignal", "relativeCwd",
    "reportCount", "reports", "schemaVersion",
    "signalSequence", "stderr", "stdout", "terminationConfirmed", "terminationGraceMs",
    "timedOut", "timeoutMs",
  ]) && value.kind === "worksite_command_result" && value.schemaVersion === SCHEMA_VERSION &&
    value.ordinal === ordinal && nonempty(value.commandId) && nonempty(value.executable) &&
    Array.isArray(value.args) && value.args.every((arg) => typeof arg === "string" && !arg.includes("\0")) &&
    safeRelativePath(value.relativeCwd) && Array.isArray(value.environment) &&
    value.environment.every((entry) => isRecord(entry) && exactKeys(entry, ["kind", "name", "schemaVersion", "value"]) &&
      entry.kind === "worksite_command_environment_entry" && entry.schemaVersion === SCHEMA_VERSION &&
      typeof entry.name === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/u.test(entry.name) && typeof entry.value === "string") &&
    Number.isSafeInteger(value.exitStatus) && isObservedStream(value.stdout) && isObservedStream(value.stderr) &&
    Number.isSafeInteger(value.timeoutMs) && Number(value.timeoutMs) > 0 &&
    Number.isSafeInteger(value.terminationGraceMs) && Number(value.terminationGraceMs) > 0 &&
    typeof value.timedOut === "boolean" &&
    (value.processSignal === null || nonempty(value.processSignal)) &&
    Array.isArray(value.signalSequence) && value.signalSequence.every((signal) =>
      signal === "SIGTERM" || signal === "SIGKILL") &&
    typeof value.terminationConfirmed === "boolean" &&
    Array.isArray(value.reports) && value.reports.every(isReportObservation) &&
    value.reports.every((report) =>
      report.commandOrdinal === value.ordinal && report.commandId === value.commandId) &&
    Number.isSafeInteger(value.reportCount) && Number(value.reportCount) >= 0 &&
    value.reportCount === value.reports.filter((row) => row.state === "file").length &&
    nonempty(value.observationRef) && isSha256Digest(value.observationDigest))) return false;
  const observationDigest = sha256Canonical({
    ordinal: value.ordinal,
    commandId: value.commandId,
    executable: value.executable,
    args: value.args,
    relativeCwd: value.relativeCwd,
    environment: value.environment,
    timeoutMs: value.timeoutMs,
    terminationGraceMs: value.terminationGraceMs,
    exitStatus: value.exitStatus,
    timedOut: value.timedOut,
    processSignal: value.processSignal,
    signalSequence: value.signalSequence,
    terminationConfirmed: value.terminationConfirmed,
    stdout: value.stdout,
    stderr: value.stderr,
    reports: value.reports,
    reportCount: value.reportCount,
  } as unknown as JsonValue);
  return value.observationDigest === observationDigest &&
    value.observationRef === identity("worksite-command-observation://abiogenesis", observationDigest);
}

function isPredicateObservation(value: unknown, ordinal: number): value is WorksitePredicateObservation {
  if (!isRecord(value) || !exactKeys(value, [
    "evidence", "evidenceRefs", "kind", "observedValue", "ordinal", "predicateId",
    "predicateKind", "schemaVersion",
  ]) || value.kind !== "worksite_predicate_observation" || value.schemaVersion !== SCHEMA_VERSION ||
    value.ordinal !== ordinal || !nonempty(value.predicateId) || !nonempty(value.predicateKind) ||
    !Array.isArray(value.evidence) || !Array.isArray(value.evidenceRefs) ||
    !value.evidenceRefs.every(nonempty)) return false;
  try {
    admitIJsonValue(value.observedValue, "predicate observation");
    admitIJsonValue(value.evidence, "predicate evidence");
    return true;
  } catch {
    return false;
  }
}

function isPathObservation(value: unknown): value is WorksitePathObservation {
  return isRecord(value) && exactKeys(value, [
    "byteLength", "digest", "kind", "nodeKind", "relativePath", "schemaVersion", "symlinkTarget",
  ]) && value.kind === "worksite_path_observation" && value.schemaVersion === SCHEMA_VERSION &&
    safeRelativePath(value.relativePath) &&
    (value.nodeKind === "directory" || value.nodeKind === "file" || value.nodeKind === "symlink") &&
    isSha256Digest(value.digest) &&
    (value.nodeKind === "file"
      ? Number.isSafeInteger(value.byteLength) && Number(value.byteLength) >= 0 && value.symlinkTarget === null
      : value.nodeKind === "symlink"
      ? value.byteLength === null && typeof value.symlinkTarget === "string"
      : value.byteLength === null && value.symlinkTarget === null);
}

function isPathDelta(value: unknown, ordinal: number): value is WorksitePathDelta {
  if (!isRecord(value) || !exactKeys(value, [
    "after", "before", "changeKind", "kind", "matchedTerritoryRef", "ordinal", "relativePath", "schemaVersion",
  ]) || value.kind !== "worksite_path_delta" || value.schemaVersion !== SCHEMA_VERSION ||
    value.ordinal !== ordinal || !safeRelativePath(value.relativePath) ||
    (value.changeKind !== "changed" && value.changeKind !== "created" && value.changeKind !== "deleted") ||
    (value.matchedTerritoryRef !== null && !nonempty(value.matchedTerritoryRef)) ||
    (value.before !== null && !isPathObservation(value.before)) ||
    (value.after !== null && !isPathObservation(value.after))) return false;
  return value.changeKind === "created" ? value.before === null && value.after !== null
    : value.changeKind === "deleted" ? value.before !== null && value.after === null
    : value.before !== null && value.after !== null && !same(value.before, value.after);
}

function isSnapshotMember(value: unknown, ordinal: number): value is WorksiteSnapshotMember {
  return isRecord(value) && exactKeys(value, [
    "byteLength", "digest", "kind", "ordinal", "relativePath", "schemaVersion",
    "sourceMemberRef", "sourceObservationDigest", "sourceObservationRef",
  ]) && value.kind === "worksite_snapshot_member" && value.schemaVersion === SCHEMA_VERSION &&
    value.ordinal === ordinal && nonempty(value.sourceMemberRef) && safeRelativePath(value.relativePath) &&
    nonempty(value.sourceObservationRef) && isSha256Digest(value.sourceObservationDigest) &&
    Number.isSafeInteger(value.byteLength) && Number(value.byteLength) >= 0 && isSha256Digest(value.digest);
}

export function constructWorksiteCommandHelperArtifact(input: Readonly<{
  task: WorksiteCommandExecutionTask;
  disposition: "product_mismatch" | "protected_mismatch" | "success" | "territory_mismatch";
  commandResults: readonly WorksiteCommandResult[];
  predicateObservations: readonly WorksitePredicateObservation[];
  worksiteDelta: readonly WorksitePathDelta[];
  productDelta: readonly WorksitePathDelta[];
  snapshotRoot: string;
  snapshotRef: string;
  snapshotDigest: Sha256Digest;
  snapshotMembers: readonly WorksiteSnapshotMember[];
  protectedBefore: readonly WorksiteObservation[];
  protectedAfter: readonly WorksiteObservation[];
}>): WorksiteCommandHelperArtifact {
  if (!isWorksiteCommandExecutionTask(input.task) ||
    !Array.isArray(input.commandResults) || !input.commandResults.every(isCommandResult) ||
    !Array.isArray(input.predicateObservations) ||
    !input.predicateObservations.every(isPredicateObservation) ||
    !Array.isArray(input.worksiteDelta) || !input.worksiteDelta.every(isPathDelta) ||
    !Array.isArray(input.productDelta) || !input.productDelta.every(isPathDelta) ||
    input.productDelta.some((row) => row.matchedTerritoryRef !== null) ||
    input.worksiteDelta.some((row) => row.matchedTerritoryRef !==
      matchingWorksiteTerritoryRef(row.relativePath, input.task.allowedWriteTerritories)) ||
    !Array.isArray(input.protectedBefore) || !Array.isArray(input.protectedAfter) ||
    !input.protectedBefore.every(isWorksiteObservation) ||
    !input.protectedAfter.every(isWorksiteObservation) ||
    input.protectedBefore.length !== input.task.protectedObservations.length ||
    input.protectedAfter.length !== input.task.protectedObservations.length ||
    !isAbsolute(input.snapshotRoot) || !nonempty(input.snapshotRef) || !isSha256Digest(input.snapshotDigest) ||
    !Array.isArray(input.snapshotMembers) || !input.snapshotMembers.every(isSnapshotMember) ||
    (input.snapshotMembers.length !== 0 &&
      input.snapshotMembers.length !== input.task.protectedObservations.length) ||
    (input.snapshotMembers.length === 0 && input.disposition !== "protected_mismatch") ||
    input.snapshotMembers.some((member, ordinal) => {
      const protectedRow = input.task.protectedObservations[ordinal];
      return protectedRow === undefined || member.sourceMemberRef !== protectedRow.sourceMemberRef ||
        member.relativePath !== protectedRow.subject.relativePath ||
        member.sourceObservationRef !== protectedRow.observation.observationRef ||
        member.sourceObservationDigest !== protectedRow.observation.observationDigest ||
        member.byteLength !== protectedRow.observation.byteLength ||
        member.digest !== protectedRow.observation.fileDigest;
    }) || input.snapshotDigest !== sha256Canonical(input.snapshotMembers as unknown as JsonValue) ||
    (input.commandResults.length !== 0 && input.commandResults.length !== input.task.commands.length) ||
    (input.predicateObservations.length !== 0 &&
      input.predicateObservations.length !== input.task.outcomePredicates.length) ||
    !((input.commandResults.length === 0 && input.predicateObservations.length === 0) ||
      (input.commandResults.length === input.task.commands.length &&
        input.predicateObservations.length === input.task.outcomePredicates.length)) ||
    (input.disposition === "success" && input.commandResults.length !== input.task.commands.length) ||
    (input.disposition === "success" && input.predicateObservations.length !== input.task.outcomePredicates.length) ||
    (input.disposition === "success" && input.worksiteDelta.some((row) => row.matchedTerritoryRef === null)) ||
    (input.disposition === "success" && input.productDelta.length !== 0) ||
    (input.disposition === "territory_mismatch" && !input.worksiteDelta.some((row) => row.matchedTerritoryRef === null)) ||
    (input.disposition === "product_mismatch" && input.productDelta.length === 0) ||
    input.snapshotRef !== identity("worksite-command-snapshot://abiogenesis", input.snapshotDigest) ||
    (input.disposition !== "success" && input.disposition !== "protected_mismatch" &&
      input.disposition !== "territory_mismatch" && input.disposition !== "product_mismatch")) {
    throw new TypeError("command helper artifact requires exact task-bound commands and protected observations");
  }
  if (input.commandResults.length === input.task.commands.length) {
    constructWorksiteCommandExecutionWorkerResult(input.task, {
      kind: "worksite_command_execution_worker_result",
      schemaVersion: SCHEMA_VERSION,
      taskRef: input.task.taskRef,
      taskDigest: input.task.taskDigest,
      workspaceBindingIdentity: input.task.workspaceBinding.bindingId,
      workspaceBindingDigest: input.task.workspaceBinding.bindingDigest,
      sourceConstructionResultRef: input.task.sourceConstructionResultRef,
      sourceConstructionResultDigest: input.task.sourceConstructionResultDigest,
      commandResults: input.commandResults,
      predicateObservations: input.predicateObservations,
    });
  }
  const body = {
    taskRef: input.task.taskRef,
    taskDigest: input.task.taskDigest,
    disposition: input.disposition,
    commandResults: input.commandResults,
    predicateObservations: input.predicateObservations,
    worksiteDelta: input.worksiteDelta,
    productDelta: input.productDelta,
    snapshotRoot: input.snapshotRoot,
    snapshotRef: input.snapshotRef,
    snapshotDigest: input.snapshotDigest,
    snapshotMembers: input.snapshotMembers,
    protectedBefore: input.protectedBefore,
    protectedAfter: input.protectedAfter,
  };
  const artifactDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "worksite_command_helper_artifact" as const,
    schemaVersion: SCHEMA_VERSION,
    artifactRef: identity("worksite-command-helper-artifact://abiogenesis", artifactDigest),
    artifactDigest,
    ...body,
  });
}

export function isWorksiteCommandHelperArtifact(
  task: WorksiteCommandExecutionTask,
  value: unknown,
): value is WorksiteCommandHelperArtifact {
  if (!isRecord(value) || !exactKeys(value, [
    "artifactDigest", "artifactRef", "commandResults", "disposition", "kind", "predicateObservations",
    "productDelta", "protectedAfter", "protectedBefore", "schemaVersion", "taskDigest", "taskRef",
    "snapshotDigest", "snapshotMembers", "snapshotRef", "snapshotRoot", "worksiteDelta",
  ]) || value.kind !== "worksite_command_helper_artifact" || value.schemaVersion !== SCHEMA_VERSION ||
    value.taskRef !== task.taskRef || value.taskDigest !== task.taskDigest ||
    !isSha256Digest(value.artifactDigest) || !nonempty(value.artifactRef)) return false;
  try {
    return same(value, constructWorksiteCommandHelperArtifact({
      task,
      disposition: value.disposition as "product_mismatch" | "protected_mismatch" | "success" | "territory_mismatch",
      commandResults: value.commandResults as readonly WorksiteCommandResult[],
      predicateObservations: value.predicateObservations as readonly WorksitePredicateObservation[],
      worksiteDelta: value.worksiteDelta as readonly WorksitePathDelta[],
      productDelta: value.productDelta as readonly WorksitePathDelta[],
      snapshotRoot: value.snapshotRoot as string,
      snapshotRef: value.snapshotRef as string,
      snapshotDigest: value.snapshotDigest as Sha256Digest,
      snapshotMembers: value.snapshotMembers as readonly WorksiteSnapshotMember[],
      protectedBefore: value.protectedBefore as readonly WorksiteObservation[],
      protectedAfter: value.protectedAfter as readonly WorksiteObservation[],
    }));
  } catch {
    return false;
  }
}

export function helperArtifactPreservesProtectedObservations(
  task: WorksiteCommandExecutionTask,
  artifact: WorksiteCommandHelperArtifact,
): boolean {
  return isWorksiteCommandHelperArtifact(task, artifact) && artifact.disposition === "success" &&
    task.protectedObservations.every((protectedRow, ordinal) =>
      same(artifact.protectedBefore[ordinal], protectedRow.observation) &&
      same(artifact.protectedAfter[ordinal], protectedRow.observation)
    );
}

export function isWorksiteCommandExecutionWorkerResult(value: unknown): value is WorksiteCommandExecutionWorkerResult {
  return isRecord(value) && exactKeys(value, [
    "commandResults", "kind", "predicateObservations", "schemaVersion",
    "sourceConstructionResultDigest", "sourceConstructionResultRef", "taskDigest",
    "taskRef", "workspaceBindingDigest", "workspaceBindingIdentity",
  ]) && value.kind === "worksite_command_execution_worker_result" &&
    value.schemaVersion === SCHEMA_VERSION && nonempty(value.taskRef) &&
    isSha256Digest(value.taskDigest) && nonempty(value.workspaceBindingIdentity) &&
    isSha256Digest(value.workspaceBindingDigest) && nonempty(value.sourceConstructionResultRef) &&
    isSha256Digest(value.sourceConstructionResultDigest) && Array.isArray(value.commandResults) &&
    value.commandResults.length > 0 && value.commandResults.every(isCommandResult) &&
    Array.isArray(value.predicateObservations) && value.predicateObservations.every(isPredicateObservation);
}

export function constructWorksiteCommandExecutionWorkerResult(
  task: WorksiteCommandExecutionTask,
  rawValue: unknown,
): WorksiteCommandExecutionWorkerResult {
  if (!isWorksiteCommandExecutionTask(task) || !isWorksiteCommandExecutionWorkerResult(rawValue) ||
    rawValue.taskRef !== task.taskRef || rawValue.taskDigest !== task.taskDigest ||
    rawValue.workspaceBindingIdentity !== task.workspaceBinding.bindingId ||
    rawValue.workspaceBindingDigest !== task.workspaceBinding.bindingDigest ||
    rawValue.sourceConstructionResultRef !== task.sourceConstructionResultRef ||
    rawValue.sourceConstructionResultDigest !== task.sourceConstructionResultDigest ||
    rawValue.commandResults.length !== task.commands.length ||
    !rawValue.commandResults.every((result, ordinal) => {
      const declared = task.commands[ordinal];
      return declared !== undefined && result.ordinal === ordinal &&
        result.commandId === declared.commandId && result.executable === declared.executable &&
        same(result.args, declared.args) && result.relativeCwd === declared.relativeCwd &&
        same(result.environment, declared.environment) && result.timeoutMs === declared.timeoutMs &&
        result.terminationGraceMs === declared.terminationGraceMs &&
        result.reports.length === declared.expectedReports.length &&
        result.reports.every((report, reportOrdinal) => {
          const expected = declared.expectedReports[reportOrdinal];
          return expected !== undefined && report.ordinal === reportOrdinal &&
            report.commandOrdinal === declared.ordinal && report.commandId === declared.commandId &&
            report.expectedReportIdentity === expected.reportIdentity &&
            report.relativePath === expected.relativePath;
        });
    }) || rawValue.predicateObservations.length !== task.outcomePredicates.length ||
    !rawValue.predicateObservations.every((observation, ordinal) => {
      const declared = task.outcomePredicates[ordinal];
      return declared !== undefined && observation.ordinal === ordinal &&
        observation.predicateId === declared.predicateId &&
        observation.predicateKind === declared.predicateKind;
    })) {
    throw new TypeError("worksite command execution worker result must preserve exact task, source, workspace, command, report, and predicate identity/order");
  }
  return deepFreeze(admitIJsonValue(rawValue, "worksite command execution worker result") as unknown as WorksiteCommandExecutionWorkerResult);
}

export function constructWorksiteCommandExecutionObservation(
  task: WorksiteCommandExecutionTask,
  workerResult: WorksiteCommandExecutionWorkerResult,
  actorObservation: ActorProcessObservation,
  helperArtifact: WorksiteCommandHelperArtifact,
  helperPlan: WorksiteCommandExecutionHelperPlan,
): WorksiteCommandExecutionObservation {
  const exact = constructWorksiteCommandExecutionWorkerResult(task, workerResult);
  const helperToolInvocation = actorObservation.toolInvocations[0];
  if (!isWorksiteCommandExecutionHelperPlan(task, helperPlan) ||
    actorObservation.actorRef !== task.workerActorRef ||
    actorObservation.workerBindingRef !== task.workerBindingRef ||
    actorObservation.implementationRef !== WORKSITE_COMMAND_EXECUTION_IDS.implementationRef ||
    actorObservation.inputDigest !== sha256Canonical(task as unknown as JsonValue) ||
    actorObservation.transportLane !== "worker_executes" || actorObservation.disposition !== "success" ||
    actorObservation.toolCallCount !== 1 || actorObservation.toolInvocations.length !== 1 ||
    helperToolInvocation === undefined || helperToolInvocation.ordinal !== 0 ||
    helperToolInvocation.toolName !== "Bash" ||
    helperToolInvocation.inputDigest !== helperPlan.toolInputDigest ||
    helperToolInvocation.inputByteLength !== helperPlan.toolInputByteLength ||
    !isWorksiteCommandHelperArtifact(task, helperArtifact) ||
    !helperArtifactPreservesProtectedObservations(task, helperArtifact) ||
    helperArtifact.snapshotRoot !== helperPlan.sandboxRoot ||
    !same(helperArtifact.commandResults, exact.commandResults) ||
    !same(helperArtifact.predicateObservations, exact.predicateObservations) ||
    !nonempty(actorObservation.actorInvocationRef) || !nonempty(actorObservation.processRef)) {
    throw new TypeError("worksite command execution observation requires the exact helper tool invocation, artifact, commands, and protected O1 preservation");
  }
  const provenance = deepFreeze({
    kind: "worksite_command_execution_provenance" as const,
    schemaVersion: SCHEMA_VERSION,
    actorInvocationRef: actorObservation.actorInvocationRef,
    actorRef: actorObservation.actorRef,
    workerBindingRef: actorObservation.workerBindingRef,
    actorProcessRef: actorObservation.processRef,
    transportBindingRef: actorObservation.transportBindingRef,
    transportBindingDigest: actorObservation.transportBindingDigest,
    transportDigest: actorObservation.transportDigest,
    toolCallCount: actorObservation.toolCallCount,
    helperArtifactPath: helperPlan.artifactPath,
    helperArtifactRef: helperArtifact.artifactRef,
    helperArtifactDigest: helperArtifact.artifactDigest,
    helperArtifactByteLength: Buffer.byteLength(
      `${canonicalJson(helperArtifact as unknown as JsonValue)}\n`,
      "utf8",
    ),
    helperToolInvocation,
    helperPlan,
  });
  const body = {
    task,
    provenance,
    helperArtifactRef: helperArtifact.artifactRef,
    helperArtifactDigest: helperArtifact.artifactDigest,
    commandResults: exact.commandResults,
    predicateObservations: exact.predicateObservations,
    worksiteDelta: helperArtifact.worksiteDelta,
    productDelta: helperArtifact.productDelta,
    snapshotRef: helperArtifact.snapshotRef,
    snapshotDigest: helperArtifact.snapshotDigest,
    snapshotMembers: helperArtifact.snapshotMembers,
  };
  const observationDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "worksite_command_execution_observation" as const,
    schemaVersion: SCHEMA_VERSION,
    observationRef: identity("worksite-command-execution-observation://abiogenesis", observationDigest),
    observationDigest,
    ...body,
  });
}

export function isWorksiteCommandExecutionObservation(value: unknown): value is WorksiteCommandExecutionObservation {
  if (!isRecord(value) || !exactKeys(value, [
    "commandResults", "helperArtifactDigest", "helperArtifactRef", "kind", "observationDigest", "observationRef",
    "predicateObservations", "productDelta", "provenance", "schemaVersion", "snapshotDigest",
    "snapshotMembers", "snapshotRef", "task", "worksiteDelta",
  ]) || value.kind !== "worksite_command_execution_observation" || value.schemaVersion !== SCHEMA_VERSION ||
    !isWorksiteCommandExecutionTask(value.task) || !isRecord(value.provenance) ||
    !exactKeys(value.provenance, [
      "actorInvocationRef", "actorProcessRef", "actorRef", "kind", "schemaVersion",
      "helperArtifactByteLength", "helperArtifactDigest", "helperArtifactPath", "helperArtifactRef",
      "helperPlan", "helperToolInvocation", "toolCallCount", "transportBindingDigest", "transportBindingRef", "transportDigest",
      "workerBindingRef",
    ]) || value.provenance.kind !== "worksite_command_execution_provenance" ||
    value.provenance.schemaVersion !== SCHEMA_VERSION || value.provenance.actorRef !== WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef ||
    value.provenance.workerBindingRef !== WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef ||
    !nonempty(value.provenance.actorInvocationRef) || !nonempty(value.provenance.actorProcessRef) ||
    !nonempty(value.provenance.transportBindingRef) || !isSha256Digest(value.provenance.transportBindingDigest) ||
    !isSha256Digest(value.provenance.transportDigest) || !Number.isSafeInteger(value.provenance.toolCallCount) ||
    !nonempty(value.provenance.helperArtifactPath) || !nonempty(value.provenance.helperArtifactRef) ||
    !isSha256Digest(value.provenance.helperArtifactDigest) ||
    !Number.isSafeInteger(value.provenance.helperArtifactByteLength) ||
    Number(value.provenance.helperArtifactByteLength) <= 0 ||
    value.provenance.toolCallCount !== 1 || !isRecord(value.provenance.helperToolInvocation) ||
    !exactKeys(value.provenance.helperToolInvocation, [
      "inputByteLength", "inputDigest", "kind", "ordinal", "schemaVersion", "toolName", "toolUseRef",
    ]) || value.provenance.helperToolInvocation.kind !== "worker_tool_invocation_evidence" ||
    value.provenance.helperToolInvocation.schemaVersion !== SCHEMA_VERSION ||
    value.provenance.helperToolInvocation.ordinal !== 0 ||
    value.provenance.helperToolInvocation.toolName !== "Bash" ||
    !nonempty(value.provenance.helperToolInvocation.toolUseRef) ||
    !isSha256Digest(value.provenance.helperToolInvocation.inputDigest) ||
    !Number.isSafeInteger(value.provenance.helperToolInvocation.inputByteLength) ||
    !isWorksiteCommandExecutionHelperPlan(value.task, value.provenance.helperPlan) ||
    value.provenance.helperToolInvocation.inputDigest !== value.provenance.helperPlan.toolInputDigest ||
    value.provenance.helperToolInvocation.inputByteLength !== value.provenance.helperPlan.toolInputByteLength ||
    value.provenance.helperArtifactPath !== value.provenance.helperPlan.artifactPath ||
    value.provenance.helperArtifactRef !== value.helperArtifactRef ||
    value.provenance.helperArtifactDigest !== value.helperArtifactDigest ||
    !Array.isArray(value.commandResults) ||
    !value.commandResults.every(isCommandResult) || !Array.isArray(value.predicateObservations) ||
    !value.predicateObservations.every(isPredicateObservation) || !isSha256Digest(value.observationDigest) ||
    !nonempty(value.observationRef) || !nonempty(value.helperArtifactRef) ||
    !isSha256Digest(value.helperArtifactDigest) || !Array.isArray(value.worksiteDelta) ||
    !value.worksiteDelta.every(isPathDelta) || !Array.isArray(value.productDelta) ||
    !value.productDelta.every(isPathDelta) || value.productDelta.length !== 0 ||
    value.worksiteDelta.some((row) => row.matchedTerritoryRef !==
      matchingWorksiteTerritoryRef(
        row.relativePath,
        (value.task as WorksiteCommandExecutionTask).allowedWriteTerritories,
      )) ||
    !nonempty(value.snapshotRef) || !isSha256Digest(value.snapshotDigest) ||
    !Array.isArray(value.snapshotMembers) || !value.snapshotMembers.every(isSnapshotMember) ||
    value.helperArtifactRef !== identity(
      "worksite-command-helper-artifact://abiogenesis",
      value.helperArtifactDigest as Sha256Digest,
    ) ||
    value.worksiteDelta.some((row) => row.matchedTerritoryRef === null) ||
    value.snapshotMembers.length !== value.task.protectedObservations.length ||
    value.snapshotMembers.some((member, ordinal) => {
      const protectedRow = (value.task as WorksiteCommandExecutionTask).protectedObservations[ordinal];
      return protectedRow === undefined || member.sourceMemberRef !== protectedRow.sourceMemberRef ||
        member.sourceObservationRef !== protectedRow.observation.observationRef ||
        member.sourceObservationDigest !== protectedRow.observation.observationDigest ||
        member.relativePath !== protectedRow.subject.relativePath ||
        member.digest !== protectedRow.observation.fileDigest ||
        member.byteLength !== protectedRow.observation.byteLength;
    }) ||
    value.snapshotRef !== identity("worksite-command-snapshot://abiogenesis", value.snapshotDigest) ||
    value.snapshotDigest !== sha256Canonical(value.snapshotMembers as unknown as JsonValue)) return false;
  try {
    constructWorksiteCommandExecutionWorkerResult(value.task, {
      kind: "worksite_command_execution_worker_result",
      schemaVersion: SCHEMA_VERSION,
      taskRef: value.task.taskRef,
      taskDigest: value.task.taskDigest,
      workspaceBindingIdentity: value.task.workspaceBinding.bindingId,
      workspaceBindingDigest: value.task.workspaceBinding.bindingDigest,
      sourceConstructionResultRef: value.task.sourceConstructionResultRef,
      sourceConstructionResultDigest: value.task.sourceConstructionResultDigest,
      commandResults: value.commandResults,
      predicateObservations: value.predicateObservations,
    });
    const body = {
      task: value.task,
      provenance: value.provenance,
      helperArtifactRef: value.helperArtifactRef,
      helperArtifactDigest: value.helperArtifactDigest,
      commandResults: value.commandResults,
      predicateObservations: value.predicateObservations,
      worksiteDelta: value.worksiteDelta,
      productDelta: value.productDelta,
      snapshotRef: value.snapshotRef,
      snapshotDigest: value.snapshotDigest,
      snapshotMembers: value.snapshotMembers,
    };
    const digest = sha256Canonical(body as unknown as JsonValue);
    return value.observationDigest === digest &&
      value.observationRef === identity("worksite-command-execution-observation://abiogenesis", digest);
  } catch {
    return false;
  }
}

export function isWorksiteCommandExecutionFailure(value: unknown): value is WorksiteCommandExecutionFailure {
  return isRecord(value) && exactKeys(value, ["diagnosticRef", "failureClass", "kind", "schemaVersion"]) &&
    value.kind === "worksite_command_execution_failure" && value.schemaVersion === SCHEMA_VERSION &&
    nonempty(value.failureClass) && nonempty(value.diagnosticRef);
}

/** Product-owned rendering of exact task commands and outcome predicates. */
export function renderWorksiteCommandExecutionPrompt(
  task: WorksiteCommandExecutionTask,
  helperPlan: WorksiteCommandExecutionHelperPlan,
): string {
  if (!isWorksiteCommandExecutionTask(task) ||
    !isWorksiteCommandExecutionHelperPlan(task, helperPlan)) {
    throw new TypeError("command execution prompt requires one exact admitted task and helper plan");
  }
  return [
    "Invoke the Bash tool exactly once with the exact command below. The ABI-owned helper executes every declared command in order and records its exact argv, cwd, environment, streams, exit status, reports, and protected-file observations.",
    helperPlan.toolCommand,
    "Use the helper tool output to return its commandResults and predicateObservations unchanged. The helper, not you, performs every probe.",
    "Do not run any declared command directly and do not use another tool call.",
    "A nonzero subject-command exit is an observation, not a transport failure.",
    "Return only the JSON value required by the supplied schema.",
    canonicalJson({
      taskRef: task.taskRef,
      taskDigest: task.taskDigest,
      workspaceBindingIdentity: task.workspaceBinding.bindingId,
      workspaceBindingDigest: task.workspaceBinding.bindingDigest,
      sourceConstructionResultRef: task.sourceConstructionResultRef,
      sourceConstructionResultDigest: task.sourceConstructionResultDigest,
      commands: task.commands.map((row) => ({ ordinal: row.ordinal, commandId: row.commandId })),
      outcomePredicates: task.outcomePredicates.map((row) => ({
        ordinal: row.ordinal, predicateId: row.predicateId, predicateKind: row.predicateKind,
      })),
    } as unknown as JsonValue),
  ].join("\n\n");
}

export function worksiteCommandExecutionWorkerResultSchema(
  task: WorksiteCommandExecutionTask,
): Readonly<Record<string, JsonValue>> {
  if (!isWorksiteCommandExecutionTask(task)) throw new TypeError("command result schema requires one exact task");
  const canonicalTaskStringSchema = (values: readonly string[]): JsonValue => {
    const enumValues = [...new Set(values)];
    return enumValues.length === 0
      ? { type: "string" }
      : { type: "string", enum: enumValues };
  };
  const environmentEntry = {
    type: "object", additionalProperties: false,
    required: ["kind", "schemaVersion", "name", "value"],
    properties: {
      kind: { const: "worksite_command_environment_entry" },
      schemaVersion: { const: SCHEMA_VERSION }, name: { type: "string" }, value: { type: "string" },
    },
  } as JsonValue;
  const stream = {
    type: "object", additionalProperties: false,
    required: ["kind", "schemaVersion", "encoding", "payload", "byteLength", "digest"],
    properties: {
      kind: { const: "worksite_observed_stream" }, schemaVersion: { const: SCHEMA_VERSION },
      encoding: { const: "base64" }, payload: { type: "string", pattern: BASE64_PATTERN },
      byteLength: { type: "integer", minimum: 0 }, digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
    },
  } as JsonValue;
  const report = {
    type: "object", additionalProperties: false,
    required: [
      "kind", "schemaVersion", "ordinal", "commandOrdinal", "commandId",
      "expectedReportIdentity", "relativePath", "state", "byteLength", "digest",
      "observationRef", "observationDigest",
    ],
    properties: {
      kind: { const: "worksite_report_observation" }, schemaVersion: { const: SCHEMA_VERSION },
      ordinal: { type: "integer", minimum: 0 }, commandOrdinal: { type: "integer", minimum: 0 },
      commandId: { type: "string" }, expectedReportIdentity: { type: "string" },
      relativePath: { type: "string" }, state: { enum: ["absent", "file"] },
      byteLength: { type: ["integer", "null"], minimum: 0 },
      digest: { type: ["string", "null"], pattern: "^sha256:[a-f0-9]{64}$" },
      observationRef: { type: "string" },
      observationDigest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
    },
  } as JsonValue;
  return deepFreeze({
    type: "object", additionalProperties: false,
    required: [
      "kind", "schemaVersion", "taskRef", "taskDigest", "workspaceBindingIdentity",
      "workspaceBindingDigest", "sourceConstructionResultRef", "sourceConstructionResultDigest",
      "commandResults", "predicateObservations",
    ],
    properties: {
      kind: { const: "worksite_command_execution_worker_result" },
      schemaVersion: { const: SCHEMA_VERSION }, taskRef: { const: task.taskRef },
      taskDigest: { const: task.taskDigest }, workspaceBindingIdentity: { const: task.workspaceBinding.bindingId },
      workspaceBindingDigest: { const: task.workspaceBinding.bindingDigest },
      sourceConstructionResultRef: { const: task.sourceConstructionResultRef },
      sourceConstructionResultDigest: { const: task.sourceConstructionResultDigest },
      commandResults: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: [
            "kind", "schemaVersion", "ordinal", "commandId", "executable", "args",
            "relativeCwd", "environment", "timeoutMs", "terminationGraceMs", "exitStatus",
            "timedOut", "processSignal", "signalSequence", "terminationConfirmed", "stdout", "stderr",
            "reports", "reportCount", "observationRef", "observationDigest",
          ],
          properties: {
            kind: { const: "worksite_command_result" }, schemaVersion: { const: SCHEMA_VERSION },
            ordinal: { type: "integer", minimum: 0 },
            commandId: canonicalTaskStringSchema(task.commands.map((row) => row.commandId)),
            executable: canonicalTaskStringSchema(task.commands.map((row) => row.executable)),
            args: { type: "array", items: { type: "string" } }, relativeCwd: { type: "string" },
            environment: { type: "array", items: environmentEntry }, timeoutMs: { type: "integer", minimum: 1 },
            terminationGraceMs: { type: "integer", minimum: 1 },
            exitStatus: { type: "integer" }, timedOut: { type: "boolean" },
            processSignal: { type: ["string", "null"] },
            signalSequence: { type: "array", items: { enum: ["SIGTERM", "SIGKILL"] } },
            terminationConfirmed: { type: "boolean" }, stdout: stream, stderr: stream,
            reports: { type: "array", items: report },
            reportCount: { type: "integer", minimum: 0 },
            observationRef: { type: "string" },
            observationDigest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
          },
        },
      },
      predicateObservations: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["kind", "schemaVersion", "ordinal", "predicateId", "predicateKind", "observedValue", "evidence", "evidenceRefs"],
          properties: {
            kind: { const: "worksite_predicate_observation" }, schemaVersion: { const: SCHEMA_VERSION },
            ordinal: { type: "integer", minimum: 0 },
            predicateId: canonicalTaskStringSchema(task.outcomePredicates.map((row) => row.predicateId)),
            predicateKind: canonicalTaskStringSchema(task.outcomePredicates.map((row) => row.predicateKind)),
            observedValue: {}, evidence: { type: "array" },
            evidenceRefs: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  } as Readonly<Record<string, JsonValue>>);
}

/** F_D admission checks carrier identity only; it never judges domain success. */
export function resolveWorksiteCommandExecutionJudgmentRelation(
  predicateRef: string,
): Readonly<{
  readonly predicateRef: string;
  readonly advanceReasonRef: string;
  readonly rejectionReasonRef: string;
  readonly evaluate: (input: unknown, output: unknown) => boolean;
}> | null {
  if (predicateRef !== WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef) return null;
  return Object.freeze({
    predicateRef,
    advanceReasonRef: "reason://abiogenesis/worksite/command-execution-observed@5",
    rejectionReasonRef: "reason://abiogenesis/worksite/command-execution-malformed@5",
    evaluate: (input, output) => isWorksiteCommandExecutionTask(input) &&
      isWorksiteCommandExecutionObservation(output) && same(output.task, input),
  });
}
