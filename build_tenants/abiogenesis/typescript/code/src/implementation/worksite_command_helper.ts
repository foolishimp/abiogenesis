#!/usr/bin/env node
import { spawn } from "node:child_process";
import { request as httpRequest } from "node:http";
import {
  link,
  lstat,
  mkdir,
  readFile,
  readlink,
  readdir,
  realpath,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import {
  WORKSITE_COMMAND_EXECUTION_IDS,
  constructWorksiteCommandHelperArtifact,
  isWorksiteCommandExecutionTask,
  type WorksiteCommandExecutionTask,
  type WorksiteCommandExecutionWorkerResult,
  type WorksiteCommandResult,
  type WorksiteObservedStream,
  type WorksitePredicateObservation,
  type WorksitePathDelta,
  type WorksitePathObservation,
  type WorksiteReportObservation,
  type WorksiteSnapshotMember,
  matchingWorksiteTerritoryRef,
} from "../product/worksite_command_execution.js";
import { observeWorksiteSubject } from "../product/worksite_operations.js";
import { admitIJsonText } from "../shared/i_json.js";
import {
  isWorksiteObservation,
  type WorksiteObservation,
} from "../product/worksite_effect.js";

let activeCommand: ReturnType<typeof spawn> | null = null;

interface AuthorityFreeWorksiteCommandExecutionOccurrence {
  readonly cCallRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly programLocusRef: string;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly executionAuthority: null;
}

interface WorksiteCommandExecutionLaunchManifest {
  readonly kind: "worksite_command_execution_launch_manifest";
  readonly schemaVersion: "5.0.0";
  readonly launchManifestRef: string;
  readonly launchManifestDigest: Sha256Digest;
  readonly taskRef: string;
  readonly taskDigest: Sha256Digest;
  readonly taskManifestPath: string;
  readonly taskManifestDigest: Sha256Digest;
  readonly taskManifestByteLength: number;
  readonly occurrence: AuthorityFreeWorksiteCommandExecutionOccurrence;
  readonly occurrenceDigest: Sha256Digest;
  readonly attemptRef: string;
  readonly attemptDigest: Sha256Digest;
  readonly archiveRoot: string;
  readonly attemptRoot: string;
  readonly launchManifestPath: string;
  readonly helperModulePath: string;
  readonly implementationRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.implementationRef;
  readonly implementationBindingRef:
    typeof WORKSITE_COMMAND_EXECUTION_IDS.implementationBindingRef;
  readonly packageName: typeof ABI5_PACKAGE_NAME;
  readonly packageVersion: typeof ABI5_PACKAGE_VERSION;
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

function occurrenceIdentity(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAuthorityFreeOccurrence(
  value: unknown,
): value is AuthorityFreeWorksiteCommandExecutionOccurrence {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    exactKeys(value as Readonly<Record<string, unknown>>, [
      "attempt", "cCallRef", "executionAuthority", "frameId", "graphCallId",
      "programLocusRef", "runId", "taskOrdinal",
    ]) && occurrenceIdentity((value as Readonly<Record<string, unknown>>).cCallRef) &&
    occurrenceIdentity((value as Readonly<Record<string, unknown>>).runId) &&
    occurrenceIdentity((value as Readonly<Record<string, unknown>>).graphCallId) &&
    occurrenceIdentity((value as Readonly<Record<string, unknown>>).frameId) &&
    (value as Readonly<Record<string, unknown>>).programLocusRef ===
      WORKSITE_COMMAND_EXECUTION_IDS.nodeRef &&
    ((value as Readonly<Record<string, unknown>>).taskOrdinal === null ||
      Number.isSafeInteger((value as Readonly<Record<string, unknown>>).taskOrdinal) &&
      Number((value as Readonly<Record<string, unknown>>).taskOrdinal) >= 0) &&
    Number.isSafeInteger((value as Readonly<Record<string, unknown>>).attempt) &&
    Number((value as Readonly<Record<string, unknown>>).attempt) >= 1 &&
    (value as Readonly<Record<string, unknown>>).executionAuthority === null;
}

function worksiteCommandExecutionAttemptRef(
  occurrence: AuthorityFreeWorksiteCommandExecutionOccurrence,
): string {
  const digest = sha256Canonical({
    cCallRef: occurrence.cCallRef,
    runId: occurrence.runId,
    graphCallId: occurrence.graphCallId,
    frameId: occurrence.frameId,
    taskOrdinal: occurrence.taskOrdinal,
    attempt: occurrence.attempt,
  });
  return `worksite-command-attempt://abiogenesis/${digest.slice("sha256:".length)}`;
}

function isWorksiteCommandExecutionLaunchManifest(
  value: unknown,
): value is WorksiteCommandExecutionLaunchManifest {
  if (typeof value !== "object" || value === null || Array.isArray(value) ||
    !exactKeys(value as Readonly<Record<string, unknown>>, [
      "archiveRoot", "attemptDigest", "attemptRef", "attemptRoot", "helperModulePath",
      "implementationBindingRef", "implementationRef", "kind", "launchManifestDigest",
      "launchManifestPath", "launchManifestRef", "occurrence", "occurrenceDigest",
      "packageName", "packageVersion", "schemaVersion", "taskDigest",
      "taskManifestByteLength", "taskManifestDigest", "taskManifestPath", "taskRef",
    ])) return false;
  const candidate = value as Readonly<Record<string, unknown>>;
  if (candidate.kind !== "worksite_command_execution_launch_manifest" ||
    candidate.schemaVersion !== "5.0.0" ||
    !isAuthorityFreeOccurrence(candidate.occurrence) ||
    !isSha256Digest(candidate.launchManifestDigest) ||
    !isSha256Digest(candidate.taskDigest) ||
    !isSha256Digest(candidate.taskManifestDigest) ||
    !isSha256Digest(candidate.occurrenceDigest) ||
    !isSha256Digest(candidate.attemptDigest) ||
    !nonempty(candidate.launchManifestRef) || !nonempty(candidate.taskRef) ||
    !nonempty(candidate.taskManifestPath) || !nonempty(candidate.attemptRef) ||
    !nonempty(candidate.archiveRoot) || !nonempty(candidate.attemptRoot) ||
    !nonempty(candidate.launchManifestPath) || !nonempty(candidate.helperModulePath) ||
    !Number.isSafeInteger(candidate.taskManifestByteLength) ||
    Number(candidate.taskManifestByteLength) < 1 ||
    candidate.implementationRef !== WORKSITE_COMMAND_EXECUTION_IDS.implementationRef ||
    candidate.implementationBindingRef !==
      WORKSITE_COMMAND_EXECUTION_IDS.implementationBindingRef ||
    candidate.packageName !== ABI5_PACKAGE_NAME ||
    candidate.packageVersion !== ABI5_PACKAGE_VERSION) return false;
  const occurrence = candidate.occurrence;
  const occurrenceDigest = sha256Canonical(occurrence as unknown as JsonValue);
  const attemptRef = worksiteCommandExecutionAttemptRef(occurrence);
  const attemptDigest = sha256Canonical({ attemptRef });
  const body = {
    kind: "worksite_command_execution_launch_manifest" as const,
    schemaVersion: "5.0.0" as const,
    taskRef: candidate.taskRef,
    taskDigest: candidate.taskDigest,
    taskManifestPath: candidate.taskManifestPath,
    taskManifestDigest: candidate.taskManifestDigest,
    taskManifestByteLength: candidate.taskManifestByteLength,
    occurrence,
    occurrenceDigest,
    attemptRef,
    attemptDigest,
    archiveRoot: candidate.archiveRoot,
    attemptRoot: candidate.attemptRoot,
    launchManifestPath: candidate.launchManifestPath,
    helperModulePath: candidate.helperModulePath,
    implementationRef: WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,
    implementationBindingRef:
      WORKSITE_COMMAND_EXECUTION_IDS.implementationBindingRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
  } as const;
  const launchManifestDigest = sha256Canonical(body as unknown as JsonValue);
  const expected = {
    ...body,
    launchManifestRef:
      `worksite-command-launch-manifest://abiogenesis/${launchManifestDigest.slice("sha256:".length)}`,
    launchManifestDigest,
  };
  return canonicalJson(value as JsonValue) ===
    canonicalJson(expected as unknown as JsonValue);
}

function exactLaunchManifestArgument(): string {
  const argv = process.argv.slice(2);
  if (argv.length !== 2 || argv[0] !== "--task" ||
    argv[1] === undefined || argv[1].length === 0 ||
    argv[1].trim() !== argv[1] || argv[1].includes("\0")) {
    throw new TypeError("helper requires exactly --task <launch-manifest>");
  }
  return argv[1];
}

function record(value: JsonValue): Readonly<Record<string, JsonValue>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("predicate declaration must be one object");
  }
  return value as unknown as Readonly<Record<string, JsonValue>>;
}

function contained(root: string, relativePath: string): string {
  const absolute = resolve(root, ...relativePath.replaceAll("\\", "/").split("/"));
  const fromRoot = relative(root, absolute);
  if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || resolve(root, fromRoot) !== absolute) {
    throw new TypeError("relative path escapes its declared root");
  }
  return absolute;
}

async function canonicalDirectoryRoot(root: string): Promise<string> {
  const declared = resolve(root);
  const status = await lstat(declared);
  if (status.isSymbolicLink() || !status.isDirectory()) {
    throw new TypeError("declared root must be one concrete directory");
  }
  const canonical = await realpath(declared);
  if (root !== declared || canonical !== declared) {
    throw new TypeError("declared root must be lexical- and physical-canonical");
  }
  return canonical;
}

async function confinedExistingPath(
  root: string,
  relativePath: string,
  finalKind: "directory" | "file",
): Promise<string> {
  const canonicalRoot = await canonicalDirectoryRoot(root);
  const absolute = contained(canonicalRoot, relativePath);
  let cursor = canonicalRoot;
  const segments = relativePath.replaceAll("\\", "/").split("/").filter((row) => row !== ".");
  for (const [ordinal, segment] of segments.entries()) {
    cursor = resolve(cursor, segment);
    const status = await lstat(cursor);
    if (status.isSymbolicLink() || await realpath(cursor) !== cursor) {
      throw new TypeError("worksite path has a symlink or aliased component");
    }
    const final = ordinal === segments.length - 1;
    if (!final && !status.isDirectory()) throw new TypeError("worksite path parent is not a directory");
    if (final && (finalKind === "directory" ? !status.isDirectory() : !status.isFile())) {
      throw new TypeError(`worksite path is not one ${finalKind}`);
    }
  }
  return absolute;
}

async function canonicalExistingPathWithinRoot(
  declaredRootValue: string,
  candidateValue: string,
  finalKind: "directory" | "file",
): Promise<string> {
  if (!isAbsolute(declaredRootValue) || resolve(declaredRootValue) !== declaredRootValue ||
    !isAbsolute(candidateValue) || resolve(candidateValue) !== candidateValue) {
    throw new TypeError("helper launch path must be absolute and lexical-canonical");
  }
  const fromRoot = relative(declaredRootValue, candidateValue);
  if (fromRoot === "" || fromRoot === ".." || fromRoot.startsWith(`..${sep}`) ||
    isAbsolute(fromRoot)) {
    throw new TypeError("helper launch path escapes its declared root");
  }
  const rootStatus = await lstat(declaredRootValue);
  if (rootStatus.isSymbolicLink() || !rootStatus.isDirectory()) {
    throw new TypeError("helper launch root must be one concrete directory");
  }
  let declaredCursor = declaredRootValue;
  let canonicalCursor = await realpath(declaredRootValue);
  if (canonicalCursor !== declaredRootValue) {
    throw new TypeError("helper launch root must be physical-canonical");
  }
  const segments = fromRoot.split(sep).filter((segment) => segment.length > 0);
  for (const [ordinal, segment] of segments.entries()) {
    declaredCursor = resolve(declaredCursor, segment);
    canonicalCursor = resolve(canonicalCursor, segment);
    const status = await lstat(declaredCursor);
    if (status.isSymbolicLink() || await realpath(declaredCursor) !== canonicalCursor) {
      throw new TypeError("helper launch path has a symlink or aliased component");
    }
    const final = ordinal === segments.length - 1;
    if (!final && !status.isDirectory()) {
      throw new TypeError("helper launch path parent is not a directory");
    }
    if (final && (finalKind === "directory" ? !status.isDirectory() : !status.isFile())) {
      throw new TypeError(`helper launch path is not one ${finalKind}`);
    }
  }
  return candidateValue;
}

async function requireAbsent(path: string, label: string): Promise<void> {
  try {
    await lstat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  throw new TypeError(`${label} must be absent before helper execution`);
}

function containsAbsolutePath(root: string, candidate: string): boolean {
  const relation = relative(root, candidate);
  return relation === "" || (!relation.startsWith(`..${sep}`) &&
    relation !== ".." && !isAbsolute(relation));
}

async function plannedCanonicalDirectoryPath(path: string): Promise<string> {
  let cursor = resolve(path);
  const missing: string[] = [];
  for (;;) {
    try {
      const status = await lstat(cursor);
      if (status.isSymbolicLink() || !status.isDirectory()) {
        throw new TypeError("workspace root crosses a symlink or non-directory node");
      }
      return resolve(await realpath(cursor), ...missing);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parent = dirname(cursor);
      if (parent === cursor) {
        throw new TypeError("workspace root has no concrete ancestor");
      }
      missing.unshift(cursor.slice(parent.length + (parent.endsWith(sep) ? 0 : 1)));
      cursor = parent;
    }
  }
}

async function assertLaunchArchiveBoundary(
  task: WorksiteCommandExecutionTask,
  manifest: WorksiteCommandExecutionLaunchManifest,
): Promise<void> {
  const canonicalRoots = new Map<string, string>();
  for (const [name, root] of Object.entries(task.workspaceBinding.roots)) {
    canonicalRoots.set(name, await plannedCanonicalDirectoryPath(root));
  }
  const archiveRoot = canonicalRoots.get("archiveRoot");
  if (archiveRoot === undefined) {
    throw new TypeError("helper launch manifest has no canonical archive root");
  }
  for (const name of [
    "productRoot", "toolchainRoot", "eventLogRoot", "runtimeStateRoot",
    "projectionRoot",
  ]) {
    const otherRoot = canonicalRoots.get(name);
    if (otherRoot === undefined || containsAbsolutePath(archiveRoot, otherRoot) ||
      containsAbsolutePath(otherRoot, archiveRoot)) {
      throw new TypeError("command execution archive root overlaps a protected workspace root");
    }
  }
}

async function admitLaunchManifest(): Promise<Readonly<{
  task: WorksiteCommandExecutionTask;
  manifest: WorksiteCommandExecutionLaunchManifest;
  manifestBytes: Buffer;
  artifactPath: string;
  sandboxRoot: string;
}>> {
  const manifestPath = exactLaunchManifestArgument();
  if (!isAbsolute(manifestPath) || resolve(manifestPath) !== manifestPath) {
    throw new TypeError("helper launch manifest argument must be absolute and lexical-canonical");
  }
  const manifestBytes = await readFile(manifestPath);
  const manifestValue = admitIJsonText(
    manifestBytes.toString("utf8"),
    "worksite command execution launch manifest",
  );
  if (!isWorksiteCommandExecutionLaunchManifest(manifestValue)) {
    throw new TypeError("helper received an invalid command-execution launch manifest");
  }
  const manifest = manifestValue;
  const canonicalBytes = Buffer.from(
    `${canonicalJson(manifest as unknown as JsonValue)}\n`,
    "utf8",
  );
  if (!manifestBytes.equals(canonicalBytes) ||
    manifest.launchManifestPath !== manifestPath) {
    throw new TypeError("helper launch manifest bytes or locus are not canonical");
  }
  const derivedTaskManifestPath = resolve(manifest.attemptRoot, "task.json");
  const derivedLaunchManifestPath = resolve(manifest.attemptRoot, "launch.json");
  if (manifest.taskManifestPath !== derivedTaskManifestPath ||
    manifest.launchManifestPath !== derivedLaunchManifestPath ||
    manifest.taskManifestPath === manifest.launchManifestPath) {
    throw new TypeError("helper launch manifest does not name exact distinct siblings");
  }
  await canonicalExistingPathWithinRoot(
    manifest.archiveRoot,
    manifest.attemptRoot,
    "directory",
  );
  const canonicalTaskManifestPath = await canonicalExistingPathWithinRoot(
    manifest.archiveRoot,
    manifest.taskManifestPath,
    "file",
  );
  const canonicalManifestPath = await canonicalExistingPathWithinRoot(
    manifest.archiveRoot,
    manifest.launchManifestPath,
    "file",
  );
  const taskManifestStatus = await lstat(canonicalTaskManifestPath);
  const launchManifestStatus = await lstat(canonicalManifestPath);
  if (taskManifestStatus.nlink !== 1 || launchManifestStatus.nlink !== 1 ||
    taskManifestStatus.dev === launchManifestStatus.dev &&
      taskManifestStatus.ino === launchManifestStatus.ino) {
    throw new TypeError("helper manifests must be distinct single-linked filesystem nodes");
  }
  const taskManifestBytes = await readFile(canonicalTaskManifestPath);
  const taskValue = admitIJsonText(
    taskManifestBytes.toString("utf8"),
    "worksite command execution Product task manifest",
  );
  if (!isWorksiteCommandExecutionTask(taskValue)) {
    throw new TypeError("helper task manifest does not retain one exact Product task");
  }
  const task = taskValue;
  const canonicalTaskBytes = Buffer.from(
    `${canonicalJson(task as unknown as JsonValue)}\n`,
    "utf8",
  );
  const expectedAttemptRoot = join(
    task.workspaceBinding.roots.archiveRoot,
    "worksite-command-execution",
    task.taskDigest.slice("sha256:".length),
    manifest.attemptDigest.slice("sha256:".length),
  );
  const expectedHelperModulePath = join(
    task.workspaceBinding.roots.toolchainRoot,
    "node_modules", "@abiogenesis", "typescript-tenant", "build", "code", "src",
    "implementation", "worksite_command_helper.js",
  );
  if (!taskManifestBytes.equals(canonicalTaskBytes) ||
    manifest.taskRef !== task.taskRef || manifest.taskDigest !== task.taskDigest ||
    manifest.taskManifestDigest !== sha256Bytes(taskManifestBytes) ||
    manifest.taskManifestByteLength !== taskManifestBytes.byteLength ||
    manifest.archiveRoot !== task.workspaceBinding.roots.archiveRoot ||
    manifest.attemptRoot !== expectedAttemptRoot ||
    manifest.taskManifestPath !== join(expectedAttemptRoot, "task.json") ||
    manifest.launchManifestPath !== join(expectedAttemptRoot, "launch.json") ||
    manifest.helperModulePath !== expectedHelperModulePath) {
    throw new TypeError("helper task and launch manifests do not form one exact attempt");
  }
  await assertLaunchArchiveBoundary(task, manifest);
  const declaredHelperPath = await canonicalExistingPathWithinRoot(
    task.workspaceBinding.roots.toolchainRoot,
    manifest.helperModulePath,
    "file",
  );
  const invokedHelperPath = process.argv[1];
  if (invokedHelperPath === undefined || !isAbsolute(invokedHelperPath) ||
    resolve(invokedHelperPath) !== manifest.helperModulePath ||
    await realpath(resolve(invokedHelperPath)) !== await realpath(declaredHelperPath) ||
    await realpath(fileURLToPath(import.meta.url)) !== await realpath(declaredHelperPath)) {
    throw new TypeError("helper launch manifest names a different installed helper");
  }
  const artifactPath = resolve(manifest.attemptRoot, "result.json");
  const sandboxRoot = resolve(manifest.attemptRoot, "sandbox");
  await requireAbsent(artifactPath, "helper result sibling");
  await requireAbsent(sandboxRoot, "helper sandbox sibling");
  return Object.freeze({
    task,
    manifest,
    manifestBytes,
    artifactPath,
    sandboxRoot,
  });
}

async function filesystemInventory(
  declaredRoot: string,
): Promise<ReadonlyMap<string, WorksitePathObservation>> {
  const root = await canonicalDirectoryRoot(declaredRoot);
  const rows = new Map<string, WorksitePathObservation>();
  const visit = async (absoluteDirectory: string, relativeDirectory: string): Promise<void> => {
    const entries = await readdir(absoluteDirectory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const relativePath = relativeDirectory === "" ? entry.name : `${relativeDirectory}/${entry.name}`;
      const absolute = resolve(absoluteDirectory, entry.name);
      const status = await lstat(absolute);
      let observation: WorksitePathObservation;
      if (status.isSymbolicLink()) {
        const target = await readlink(absolute);
        observation = Object.freeze({
          kind: "worksite_path_observation" as const,
          schemaVersion: "5.0.0" as const,
          relativePath,
          nodeKind: "symlink" as const,
          digest: sha256Bytes(Buffer.from(target, "utf8")),
          byteLength: null,
          symlinkTarget: target,
        });
      } else if (status.isDirectory()) {
        observation = Object.freeze({
          kind: "worksite_path_observation" as const,
          schemaVersion: "5.0.0" as const,
          relativePath,
          nodeKind: "directory" as const,
          digest: sha256Bytes(Buffer.from("directory", "utf8")),
          byteLength: null,
          symlinkTarget: null,
        });
      } else if (status.isFile()) {
        const bytes = await readFile(absolute);
        observation = Object.freeze({
          kind: "worksite_path_observation" as const,
          schemaVersion: "5.0.0" as const,
          relativePath,
          nodeKind: "file" as const,
          digest: sha256Bytes(bytes),
          byteLength: bytes.byteLength,
          symlinkTarget: null,
        });
      } else {
        throw new TypeError("worksite inventory encountered a special filesystem node");
      }
      rows.set(relativePath, observation);
      if (status.isDirectory()) await visit(absolute, relativePath);
    }
  };
  await visit(root, "");
  return rows;
}

function worksiteDelta(
  task: WorksiteCommandExecutionTask,
  before: ReadonlyMap<string, WorksitePathObservation>,
  after: ReadonlyMap<string, WorksitePathObservation>,
  authorizeSnapshotTerritories = true,
): readonly WorksitePathDelta[] {
  const paths = [...new Set([...before.keys(), ...after.keys()])].sort((left, right) => left.localeCompare(right));
  const rows: WorksitePathDelta[] = [];
  for (const relativePath of paths) {
    const prior = before.get(relativePath) ?? null;
    const next = after.get(relativePath) ?? null;
    if (canonicalJson(prior as unknown as JsonValue) === canonicalJson(next as unknown as JsonValue)) continue;
    rows.push(Object.freeze({
      kind: "worksite_path_delta" as const,
      schemaVersion: "5.0.0" as const,
      ordinal: rows.length,
      changeKind: prior === null ? "created" as const : next === null ? "deleted" as const : "changed" as const,
      relativePath,
      before: prior,
      after: next,
      matchedTerritoryRef: authorizeSnapshotTerritories
        ? matchingWorksiteTerritoryRef(relativePath, task.allowedWriteTerritories)
        : null,
    }));
  }
  return Object.freeze(rows);
}

async function materializeSnapshot(
  task: WorksiteCommandExecutionTask,
  snapshotRoot: string,
): Promise<Readonly<{
  snapshotRef: string;
  snapshotDigest: `sha256:${string}`;
  snapshotMembers: readonly WorksiteSnapshotMember[];
}>> {
  await mkdir(snapshotRoot);
  const members: WorksiteSnapshotMember[] = [];
  for (const [ordinal, protectedRow] of task.protectedObservations.entries()) {
    const sourcePath = await confinedExistingPath(
      task.workspaceAuthorityBasis.canonicalRoot,
      protectedRow.subject.relativePath,
      "file",
    );
    const bytes = await readFile(sourcePath);
    const digest = sha256Bytes(bytes);
    if (digest !== protectedRow.observation.fileDigest ||
      bytes.byteLength !== protectedRow.observation.byteLength) {
      throw new TypeError("snapshot source bytes differ from protected O1");
    }
    const targetPath = contained(snapshotRoot, protectedRow.subject.relativePath);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, bytes, { flag: "wx" });
    const published = await readFile(targetPath);
    if (!published.equals(bytes)) throw new TypeError("snapshot member changed after create-only publication");
    members.push(Object.freeze({
      kind: "worksite_snapshot_member" as const,
      schemaVersion: "5.0.0" as const,
      ordinal,
      sourceMemberRef: protectedRow.sourceMemberRef,
      sourceObservationRef: protectedRow.observation.observationRef,
      sourceObservationDigest: protectedRow.observation.observationDigest,
      relativePath: protectedRow.subject.relativePath,
      byteLength: bytes.byteLength,
      digest,
    }));
  }
  const snapshotMembers = Object.freeze(members);
  const snapshotDigest = sha256Canonical(snapshotMembers as unknown as JsonValue);
  return Object.freeze({
    snapshotRef: `worksite-command-snapshot://abiogenesis/${snapshotDigest.slice("sha256:".length)}`,
    snapshotDigest,
    snapshotMembers,
  });
}

function stream(bytes: Buffer): WorksiteObservedStream {
  return Object.freeze({
    kind: "worksite_observed_stream" as const,
    schemaVersion: "5.0.0" as const,
    encoding: "base64" as const,
    payload: bytes.toString("base64"),
    byteLength: bytes.byteLength,
    digest: sha256Bytes(bytes),
  });
}

async function reportObservation(
  executionRoot: string,
  command: WorksiteCommandExecutionTask["commands"][number],
  report: WorksiteCommandExecutionTask["commands"][number]["expectedReports"][number],
): Promise<WorksiteReportObservation> {
  const construct = (
    state: "absent" | "file",
    byteLength: number | null,
    digest: `sha256:${string}` | null,
  ): WorksiteReportObservation => {
    const body = {
      commandOrdinal: command.ordinal,
      commandId: command.commandId,
      expectedReportIdentity: report.reportIdentity,
      reportOrdinal: report.ordinal,
      relativePath: report.relativePath,
      state,
      byteLength,
      digest,
    };
    const observationDigest = sha256Canonical(body as unknown as JsonValue);
    return Object.freeze({
      kind: "worksite_report_observation" as const,
      schemaVersion: "5.0.0" as const,
      ordinal: report.ordinal,
      commandOrdinal: command.ordinal,
      commandId: command.commandId,
      expectedReportIdentity: report.reportIdentity,
      relativePath: report.relativePath,
      state,
      byteLength,
      digest,
      observationRef: `worksite-report-observation://abiogenesis/${observationDigest.slice("sha256:".length)}`,
      observationDigest,
    });
  };
  try {
    const snapshotAbsolute = await confinedExistingPath(
      executionRoot,
      report.relativePath,
      "file",
    );
    const info = await lstat(snapshotAbsolute);
    if (!info.isFile()) throw new TypeError("declared report is not a regular file");
    const bytes = await readFile(snapshotAbsolute);
    return construct("file", bytes.byteLength, sha256Bytes(bytes));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return construct("absent", null, null);
  }
}

function signalProcess(child: ReturnType<typeof spawn>, signal: NodeJS.Signals): void {
  try {
    if (process.platform !== "win32" && child.pid !== undefined) process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch {
    // A concurrently exited child is already terminated.
  }
}

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    if (activeCommand !== null) signalProcess(activeCommand, "SIGKILL");
    process.exit(signal === "SIGTERM" ? 143 : 130);
  });
}

async function runCommand(
  task: WorksiteCommandExecutionTask,
  executionRoot: string,
  ordinal: number,
): Promise<WorksiteCommandResult> {
  const command = task.commands[ordinal]!;
  const cwd = await confinedExistingPath(
    executionRoot,
    command.relativeCwd,
    "directory",
  );
  const environment = Object.fromEntries(command.environment.map((entry) => [entry.name, entry.value]));
  const observed = await new Promise<{
    readonly status: number;
    readonly signal: string | null;
    readonly timedOut: boolean;
    readonly signalSequence: readonly ("SIGTERM" | "SIGKILL")[];
    readonly terminationConfirmed: boolean;
    readonly stdout: Buffer;
    readonly stderr: Buffer;
  }>((resolveResult) => {
    const child = spawn(command.executable, [...command.args], {
      cwd,
      env: environment,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let launchFailed = false;
    let timedOut = false;
    const signalSequence: ("SIGTERM" | "SIGKILL")[] = [];
    let forceTimer: ReturnType<typeof setTimeout> | undefined;
    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      signalSequence.push("SIGTERM");
      stderr.push(Buffer.from("\nABI worksite command timeout: SIGTERM requested\n", "utf8"));
      signalProcess(child, "SIGTERM");
      forceTimer = setTimeout(() => {
        signalSequence.push("SIGKILL");
        stderr.push(Buffer.from("ABI worksite command timeout: SIGKILL requested\n", "utf8"));
        signalProcess(child, "SIGKILL");
      }, command.terminationGraceMs);
    }, command.timeoutMs);
    activeCommand = child;
    const heartbeat = setInterval(() => {
      process.stderr.write(`ABI_WORKSITE_HEARTBEAT command=${command.commandId}\n`);
    }, Math.min(15_000, Math.max(1_000, Math.floor(command.timeoutMs / 4))));
    child.stdout.on("data", (chunk: Buffer) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(Buffer.from(chunk)));
    child.once("error", (error) => {
      launchFailed = true;
      stderr.push(Buffer.from(error.message, "utf8"));
    });
    child.once("close", (status, signal) => {
      activeCommand = null;
      clearTimeout(timeoutTimer);
      clearInterval(heartbeat);
      if (forceTimer !== undefined) clearTimeout(forceTimer);
      resolveResult({
        status: timedOut ? 124 : launchFailed ? 127 : (status ?? 128),
        signal,
        timedOut,
        signalSequence: Object.freeze([...signalSequence]),
        terminationConfirmed: true,
        stdout: Buffer.concat(stdout),
        stderr: Buffer.concat(stderr),
      });
    });
  });
  const reports = await Promise.all(command.expectedReports.map((row) =>
    reportObservation(executionRoot, command, row)
  ));
  const body = {
    ordinal,
    commandId: command.commandId,
    executable: command.executable,
    args: [...command.args],
    relativeCwd: command.relativeCwd,
    environment: command.environment,
    timeoutMs: command.timeoutMs,
    terminationGraceMs: command.terminationGraceMs,
    exitStatus: observed.status,
    timedOut: observed.timedOut,
    processSignal: observed.signal,
    signalSequence: observed.signalSequence,
    terminationConfirmed: observed.terminationConfirmed,
    stdout: stream(observed.stdout),
    stderr: stream(observed.stderr),
    reports,
    reportCount: reports.filter((row) => row.state === "file").length,
  };
  const observationDigest = sha256Canonical(body as unknown as JsonValue);
  return Object.freeze({
    kind: "worksite_command_result" as const,
    schemaVersion: "5.0.0" as const,
    ...body,
    observationRef: `worksite-command-observation://abiogenesis/${observationDigest.slice("sha256:".length)}`,
    observationDigest,
  });
}

function decodeStream(value: WorksiteObservedStream): string {
  return Buffer.from(value.payload, "base64").toString("utf8");
}

function commandFor(
  task: WorksiteCommandExecutionTask,
  commandResults: readonly WorksiteCommandResult[],
  declaration: Readonly<Record<string, JsonValue>>,
): WorksiteCommandResult {
  const id = declaration.validationCommandId;
  if (typeof id !== "string") throw new TypeError("predicate has no validationCommandId");
  const ordinal = task.commands.findIndex((row) => row.commandId === id);
  const result = commandResults[ordinal];
  if (ordinal < 0 || result === undefined) throw new TypeError("predicate selects no exact command");
  return result;
}

function nodeTestPassCount(stdout: string, stderr: string): number | null {
  const matches = [...`${stdout}\n${stderr}`.matchAll(
    /(?:^|\r?\n)(?:#|ℹ) pass (0|[1-9]\d*)(?=\r?\n|$)/gu,
  )];
  if (matches.length !== 1) return null;
  const count = Number(matches[0]![1]);
  return Number.isSafeInteger(count) ? count : null;
}

function declaredReportSet(
  task: WorksiteCommandExecutionTask,
): Readonly<Record<string, JsonValue>> | null {
  for (const predicate of task.outcomePredicates) {
    if (predicate.predicateKind !== "test_report_set_exact") continue;
    return record(predicate.declaration);
  }
  return null;
}

function reportCounts(xml: string): Readonly<{
  tests: number;
  failures: number;
  errors: number;
  skipped: number;
  observedPassCount: number;
}> {
  // ABI 4.6's accepted verifier semantics: comments/CDATA are inert,
  // aggregate attributes are never trusted, and testcase children alone count.
  const inert = xml
    .replace(/<!--[\s\S]*?-->/gu, "")
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/gu, "");
  const testcases = [...inert.matchAll(/<testcase\b[^>]*?(\/>|>([\s\S]*?)<\/testcase>)/gu)];
  let failures = 0;
  let errors = 0;
  let skipped = 0;
  for (const testcase of testcases) {
    const body = testcase[2] ?? "";
    if (/<failure\b/u.test(body)) failures += 1;
    else if (/<error\b/u.test(body)) errors += 1;
    else if (/<skipped\b/u.test(body)) skipped += 1;
  }
  return Object.freeze({
    tests: testcases.length,
    failures,
    errors,
    skipped,
    observedPassCount: failures === 0 && errors === 0
      ? Math.max(0, testcases.length - skipped)
      : 0,
  });
}

async function walkFiles(root: string, base = root, rows: string[] = []): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return rows;
    throw error;
  }
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolute = resolve(root, entry.name);
    if (entry.isDirectory()) await walkFiles(absolute, base, rows);
    else if (entry.isFile()) rows.push(relative(base, absolute).split(sep).join("/"));
    else throw new TypeError("report walk encountered a symlink or special node");
  }
  return rows;
}

async function reportSet(
  executionRoot: string,
  declaration: Readonly<Record<string, JsonValue>>,
): Promise<Readonly<{
  rows: readonly Readonly<{
    kind: "worksite_report_set_member_observation"; schemaVersion: "5.0.0";
    relativePath: string; tests: number; failures: number; errors: number;
    skipped: number; observedPassCount: number; byteLength: number;
    digest: `sha256:${string}`; observationRef: string; observationDigest: `sha256:${string}`;
  }>[];
  totals: Readonly<{
    tests: number; failures: number; errors: number; skipped: number; observedPassCount: number;
  }>;
}>> {
  const baseRelative = declaration.base as string;
  const selector = record(declaration.selector as JsonValue);
  const substrings = selector.includeSubstrings as readonly string[];
  const suffixes = selector.includeSuffixes as readonly string[];
  let base: string;
  try {
    base = await confinedExistingPath(executionRoot, baseRelative, "directory");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return Object.freeze({
      rows: Object.freeze([]),
      totals: Object.freeze({
        tests: 0, failures: 0, errors: 0, skipped: 0, observedPassCount: 0,
      }),
    });
  }
  const files = await walkFiles(base);
  const rows = [];
  for (const relativePath of files.filter((path) =>
    (substrings.length === 0 || substrings.some((substring) => path.includes(substring))) &&
    (suffixes.length === 0 || suffixes.some((suffix) => path.endsWith(suffix))))) {
    const reportPath = await confinedExistingPath(base, relativePath, "file");
    const bytes = await readFile(reportPath);
    const digest = sha256Bytes(bytes);
    const counts = reportCounts(bytes.toString("utf8"));
    const evidenceBody = {
      base: baseRelative,
      selector,
      relativePath,
      byteLength: bytes.byteLength,
      digest,
      ...counts,
    };
    const observationDigest = sha256Canonical(evidenceBody as unknown as JsonValue);
    rows.push(Object.freeze({
      kind: "worksite_report_set_member_observation" as const,
      schemaVersion: "5.0.0" as const,
      relativePath,
      ...counts,
      byteLength: bytes.byteLength,
      digest,
      observationRef: `worksite-report-set-member-observation://abiogenesis/${observationDigest.slice("sha256:".length)}`,
      observationDigest,
    }));
  }
  return Object.freeze({
    rows: Object.freeze(rows),
    totals: Object.freeze(rows.reduce((sum, row) => ({
      tests: sum.tests + row.tests,
      failures: sum.failures + row.failures,
      errors: sum.errors + row.errors,
      skipped: sum.skipped + row.skipped,
      observedPassCount: sum.observedPassCount + row.observedPassCount,
    }), { tests: 0, failures: 0, errors: 0, skipped: 0, observedPassCount: 0 })),
  });
}

async function oneHttpRequest(input: Readonly<{
  hostname: string;
  port: number;
  method: string;
  path: string;
  timeoutMs: number;
}>): Promise<Readonly<{ status: number; body: Buffer }> | null> {
  return new Promise((resolveRequest) => {
    const request = httpRequest({
      hostname: input.hostname,
      port: input.port,
      method: input.method,
      path: input.path,
      timeout: Math.min(input.timeoutMs, 500),
    }, (response) => {
      const chunks: Buffer[] = [];
      let byteLength = 0;
      response.on("data", (chunk: Buffer) => {
        byteLength += chunk.byteLength;
        if (byteLength <= 16 * 1024 * 1024) chunks.push(Buffer.from(chunk));
        else request.destroy(new TypeError("HTTP probe response exceeds 16 MiB"));
      });
      response.once("end", () => resolveRequest({
        status: response.statusCode ?? 0,
        body: Buffer.concat(chunks),
      }));
      response.once("error", () => resolveRequest(null));
    });
    request.once("timeout", () => request.destroy());
    request.once("error", () => resolveRequest(null));
    request.end();
  });
}

async function waitForExit<T>(exit: Promise<T>, timeoutMs: number): Promise<T | null> {
  return new Promise((resolveWait) => {
    const timer = setTimeout(() => resolveWait(null), timeoutMs);
    exit.then((value) => {
      clearTimeout(timer);
      resolveWait(value);
    });
  });
}

async function runHttpProbe(
  _task: WorksiteCommandExecutionTask,
  executionRoot: string,
  declaration: Readonly<Record<string, JsonValue>>,
): Promise<JsonValue> {
  const launch = record(declaration.launch as JsonValue);
  const request = record(declaration.request as JsonValue);
  const portFile = record(launch.portFile as JsonValue);
  const portFileRelativePath = portFile.relativePath as string;
  const portFileParent = dirname(portFileRelativePath);
  await confinedExistingPath(executionRoot, portFileParent, "directory");
  const portFilePath = contained(executionRoot, portFileRelativePath);
  try {
    await lstat(portFilePath);
    throw new TypeError("HTTP probe port file must be create-only for this attempt");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const cwd = await confinedExistingPath(
    executionRoot,
    launch.relativeCwd as string,
    "directory",
  );
  const environment = Object.fromEntries(
    (launch.environment as readonly JsonValue[]).map((value) => {
      const entry = record(value);
      return [entry.name as string, entry.value as string];
    }),
  );
  const launchArgs = (launch.args as readonly string[]).map((arg) =>
    arg === WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder
      ? portFilePath
      : arg
  );
  const child = spawn(launch.executable as string, launchArgs, {
    cwd,
    env: environment,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  activeCommand = child;
  const heartbeat = setInterval(() => {
    process.stderr.write("ABI_WORKSITE_HEARTBEAT http-probe\n");
  }, Math.min(15_000, Math.max(1_000, Math.floor((launch.timeoutMs as number) / 4))));
  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];
  child.stdout.on("data", (chunk: Buffer) => stdout.push(Buffer.from(chunk)));
  child.stderr.on("data", (chunk: Buffer) => stderr.push(Buffer.from(chunk)));
  let launchFailed = false;
  let childClosed = false;
  child.once("error", (error) => {
    launchFailed = true;
    stderr.push(Buffer.from(error.message, "utf8"));
  });
  const exit = new Promise<Readonly<{ status: number | null; signal: string | null }>>((resolveExit) => {
    child.once("close", (status, signal) => {
      activeCommand = null;
      childClosed = true;
      clearInterval(heartbeat);
      resolveExit({ status, signal });
    });
  });
  const launchDeadline = Date.now() + (launch.timeoutMs as number);
  const requestDeadline = Math.min(
    launchDeadline,
    Date.now() + (request.timeoutMs as number),
  );
  let selectedPort: number | null = null;
  let portFileBytes: Buffer | null = null;
  let portFileIssue: string | null = null;
  while (!launchFailed && !childClosed && selectedPort === null && Date.now() < requestDeadline) {
    try {
      const observedPath = await confinedExistingPath(
        executionRoot,
        portFileRelativePath,
        "file",
      );
      const bytes = await readFile(observedPath);
      portFileBytes = bytes;
      const text = bytes.toString("utf8");
      if (!/^(?:[1-9]\d{0,4})\r?\n?$/u.test(text)) {
        portFileIssue = "noncanonical_decimal_port";
        break;
      }
      const candidate = Number(text.trim());
      if (!Number.isSafeInteger(candidate) || candidate < 1 || candidate > 65_535) {
        portFileIssue = "port_out_of_range";
        break;
      }
      selectedPort = candidate;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        portFileIssue = "port_file_confinement_or_read_failure";
        break;
      }
      await new Promise((resolveWait) => setTimeout(resolveWait, 25));
    }
  }
  if (selectedPort === null && portFileIssue === null) {
    portFileIssue = childClosed ? "process_exited_before_port" : "port_file_timeout";
  }
  const requestInput = selectedPort === null ? null : {
    hostname: request.hostname as string,
    port: selectedPort,
    method: request.method as string,
    path: request.path as string,
    timeoutMs: request.timeoutMs as number,
  };
  let response: Awaited<ReturnType<typeof oneHttpRequest>> = null;
  while (!launchFailed && !childClosed && requestInput !== null && response === null &&
    Date.now() < requestDeadline) {
    response = await oneHttpRequest(requestInput);
    if (response === null) await new Promise((resolveWait) => setTimeout(resolveWait, 25));
  }
  const signalSequence: ("SIGTERM" | "SIGKILL")[] = [];
  let timedOut = false;
  let exitValue = portFileIssue !== null && !childClosed
    ? null
    : await waitForExit(exit, Math.max(0, launchDeadline - Date.now()));
  if (exitValue === null) {
    timedOut = portFileIssue === null;
    signalSequence.push("SIGTERM");
    signalProcess(child, "SIGTERM");
    exitValue = await waitForExit(exit, launch.terminationGraceMs as number);
    if (exitValue === null) {
      signalSequence.push("SIGKILL");
      signalProcess(child, "SIGKILL");
      exitValue = await exit;
    }
  }
  return {
    request: requestInput,
    portFile: {
      relativePath: portFileRelativePath,
      port: selectedPort,
      state: selectedPort === null ? portFileBytes === null ? "absent" : "invalid" : "observed",
      issue: portFileIssue,
      byteLength: portFileBytes?.byteLength ?? null,
      digest: portFileBytes === null ? null : sha256Bytes(portFileBytes),
    },
    response: response === null ? null : {
      status: response.status,
      body: response.body.toString("utf8"),
      bodyDigest: sha256Bytes(response.body),
      byteLength: response.body.byteLength,
    },
    process: {
      exitStatus: timedOut ? 124 : launchFailed ? 127 : (exitValue.status ?? 128),
      processSignal: exitValue.signal,
      timedOut,
      signalSequence,
      terminationConfirmed: true,
      stdout: stream(Buffer.concat(stdout)),
      stderr: stream(Buffer.concat(stderr)),
    },
  } as unknown as JsonValue;
}

async function predicateObservation(
  task: WorksiteCommandExecutionTask,
  executionRoot: string,
  commandResults: readonly WorksiteCommandResult[],
  ordinal: number,
): Promise<WorksitePredicateObservation> {
  const predicate = task.outcomePredicates[ordinal]!;
  const declaration = record(predicate.declaration);
  let observedValue: JsonValue = null;
  let evidence: JsonValue[] = [];
  let evidenceRefs: readonly string[] = [];
  const commandEvidence = (command: WorksiteCommandResult): JsonValue => ({
    kind: "worksite_command_observation_coordinate",
    schemaVersion: "5.0.0",
    ref: command.observationRef,
    digest: command.observationDigest,
  });
  if (predicate.predicateKind === "process_exit") {
    const command = commandFor(task, commandResults, declaration);
    observedValue = command.exitStatus;
    evidence = [commandEvidence(command)];
    evidenceRefs = [command.observationRef];
  } else if (predicate.predicateKind === "stdout_exact") {
    const command = commandFor(task, commandResults, declaration);
    observedValue = decodeStream(command.stdout);
    evidence = [commandEvidence(command)];
    evidenceRefs = [command.observationRef];
  } else if (predicate.predicateKind === "test_pass_count") {
    const command = commandFor(task, commandResults, declaration);
    const parsed = nodeTestPassCount(decodeStream(command.stdout), decodeStream(command.stderr));
    const reportDeclaration = declaredReportSet(task);
    const reports = parsed === null && reportDeclaration !== null
      ? await reportSet(executionRoot, reportDeclaration)
      : null;
    observedValue = parsed ?? reports?.totals.observedPassCount ?? 0;
    evidence = [commandEvidence(command), ...(reports?.rows ?? []) as unknown as JsonValue[]];
    evidenceRefs = [command.observationRef, ...(reports === null
      ? command.reports.filter((row) => row.state === "file").map((row) => row.observationRef)
      : reports.rows.map((row) => row.observationRef))];
  } else if (predicate.predicateKind === "module_export_return_exact") {
    const modulePath = declaration.path;
    const exportName = declaration.export;
    if (typeof modulePath !== "string" || typeof exportName !== "string") {
      throw new TypeError("module predicate declaration is malformed");
    }
    const absolute = await confinedExistingPath(
      executionRoot,
      modulePath,
      "file",
    );
    try {
      const namespace = await import(`${pathToFileURL(absolute).href}?abi=${task.taskDigest}&p=${ordinal}`);
      const exported = namespace[exportName];
      const result = typeof exported === "function" ? await exported() : exported;
      observedValue = result === undefined
        ? null
        : JSON.parse(JSON.stringify(result)) as JsonValue;
    } catch {
      observedValue = null;
    }
    evidenceRefs = task.protectedObservations
      .filter((row) => row.subject.relativePath === modulePath)
      .map((row) => row.observation.observationRef);
    evidence = task.protectedObservations
      .filter((row) => row.subject.relativePath === modulePath)
      .map((row) => ({
        kind: "worksite_observation_coordinate",
        schemaVersion: "5.0.0",
        ref: row.observation.observationRef,
        digest: row.observation.observationDigest,
      }));
  } else if (predicate.predicateKind === "http_response_exact") {
    const command = commandFor(task, commandResults, declaration);
    observedValue = await runHttpProbe(task, executionRoot, declaration);
    const probeDigest = sha256Canonical({
      predicateId: predicate.predicateId,
      observedValue,
    } as unknown as JsonValue);
    evidence = [commandEvidence(command), {
      kind: "worksite_http_probe_observation",
      schemaVersion: "5.0.0",
      observationRef: `http-probe-observation://abiogenesis/${probeDigest.slice("sha256:".length)}`,
      observationDigest: probeDigest,
      observedValue,
    }];
    evidenceRefs = [
      command.observationRef,
      `http-probe-observation://abiogenesis/${probeDigest.slice("sha256:".length)}`,
    ];
  } else if (predicate.predicateKind === "module_set_exact") {
    const selector = record(declaration.selector as JsonValue);
    const prefix = selector.prefix as string;
    const suffix = selector.suffix as string;
    const segmentIndex = selector.segmentIndex as number;
    const paths = task.protectedObservations.map((row) => row.subject.relativePath);
    observedValue = [...new Set(paths.flatMap((path) => {
      if (!path.startsWith(prefix) || !path.endsWith(suffix)) return [];
      const selected = path.slice(prefix.length).split("/")[segmentIndex];
      return selected === undefined || selected.length === 0 ? [] : [selected];
    }))];
    evidenceRefs = task.protectedObservations.map((row) => row.observation.observationRef);
    evidence = task.protectedObservations.map((row) => ({
      kind: "worksite_observation_coordinate",
      schemaVersion: "5.0.0",
      ref: row.observation.observationRef,
      digest: row.observation.observationDigest,
    }));
  } else if (predicate.predicateKind === "file_count") {
    const selector = record(declaration.selector as JsonValue);
    const suffixes = selector.includeSuffixes as readonly string[];
    const substrings = selector.includeSubstrings as readonly string[];
    const selected = task.protectedObservations.filter((row) => {
      const path = row.subject.relativePath;
      return suffixes.some((suffix) => path.endsWith(suffix)) ||
        substrings.some((substring) => path.includes(substring));
    });
    observedValue = selected.length;
    evidenceRefs = selected.map((row) => row.observation.observationRef);
    evidence = selected.map((row) => ({
      kind: "worksite_observation_coordinate",
      schemaVersion: "5.0.0",
      ref: row.observation.observationRef,
      digest: row.observation.observationDigest,
    }));
  } else if (predicate.predicateKind === "test_report_set_exact" ||
    predicate.predicateKind === "test_report_failure_count" ||
    predicate.predicateKind === "test_report_error_count") {
    const reportDeclaration = predicate.predicateKind === "test_report_set_exact"
      ? declaration
      : declaredReportSet(task);
    if (reportDeclaration === null) {
      throw new TypeError("report predicate requires one declared report-set selector");
    }
    const reports = await reportSet(executionRoot, reportDeclaration);
    observedValue = predicate.predicateKind === "test_report_set_exact"
      ? reports.rows.map((row) => row.relativePath)
      : predicate.predicateKind === "test_report_failure_count"
      ? reports.totals.failures
      : reports.totals.errors;
    evidenceRefs = reports.rows.map((row) => row.observationRef);
    evidence = [...reports.rows] as unknown as JsonValue[];
  } else {
    throw new TypeError(`unsupported worksite predicate ${predicate.predicateKind}`);
  }
  return Object.freeze({
    kind: "worksite_predicate_observation" as const,
    schemaVersion: "5.0.0" as const,
    ordinal,
    predicateId: predicate.predicateId,
    predicateKind: predicate.predicateKind,
    observedValue,
    evidence: Object.freeze(evidence),
    evidenceRefs: Object.freeze([...evidenceRefs]),
  });
}

async function observations(task: WorksiteCommandExecutionTask) {
  const rows = await Promise.all(task.protectedObservations.map((row) =>
    observeWorksiteSubject(
      task.workspaceAuthorityBasis,
      task.workspaceBinding,
      row.subject,
    )
  ));
  if (!rows.every(isWorksiteObservation)) {
    throw new TypeError("protected subject observation refused");
  }
  return rows as readonly WorksiteObservation[];
}

async function publishCreateOnly(path: string, bytes: Buffer): Promise<void> {
  const parent = dirname(path);
  const parentStatus = await lstat(parent);
  if (!parentStatus.isDirectory() || parentStatus.isSymbolicLink() ||
    await realpath(parent) !== parent) {
    throw new TypeError("create-only helper artifact parent must remain canonical");
  }
  const temporaryPath = `${path}.tmp-${String(process.pid)}`;
  await writeFile(temporaryPath, bytes, { flag: "wx" });
  try {
    await link(temporaryPath, path);
  } finally {
    await unlink(temporaryPath);
  }
  const publishedStatus = await lstat(path);
  if (!publishedStatus.isFile() || publishedStatus.isSymbolicLink() ||
    publishedStatus.nlink !== 1 || await realpath(path) !== path ||
    !Buffer.from(await readFile(path)).equals(bytes)) {
    throw new TypeError("create-only helper artifact changed identity or bytes after publication");
  }
}

async function main(): Promise<void> {
  const preflight = await admitLaunchManifest();
  const { task, artifactPath, sandboxRoot } = preflight;
  if (!isWorksiteCommandExecutionTask(task)) {
    throw new TypeError("helper launch manifest does not retain one exact Product task");
  }
  const before = await observations(task);
  const productInventoryBefore = await filesystemInventory(
    task.workspaceBinding.roots.productRoot,
  );
  const beforeMatches = before.every((row, ordinal) => canonicalJson(row as unknown as JsonValue) ===
    canonicalJson(task.protectedObservations[ordinal]!.observation as unknown as JsonValue));
  const commandResults: WorksiteCommandResult[] = [];
  const predicateObservations: WorksitePredicateObservation[] = [];
  const snapshot = beforeMatches
    ? await materializeSnapshot(task, sandboxRoot)
    : await (async () => {
        await mkdir(sandboxRoot);
        const snapshotMembers = Object.freeze([]) as readonly WorksiteSnapshotMember[];
        const snapshotDigest = sha256Canonical(snapshotMembers as unknown as JsonValue);
        return Object.freeze({
          snapshotRef: `worksite-command-snapshot://abiogenesis/${snapshotDigest.slice("sha256:".length)}`,
          snapshotDigest,
          snapshotMembers,
        });
      })();
  const inventoryBefore = await filesystemInventory(sandboxRoot);
  if (beforeMatches) {
    for (let ordinal = 0; ordinal < task.commands.length; ordinal += 1) {
      commandResults.push(await runCommand(task, sandboxRoot, ordinal));
    }
    for (let ordinal = 0; ordinal < task.outcomePredicates.length; ordinal += 1) {
      predicateObservations.push(await predicateObservation(
        task,
        sandboxRoot,
        commandResults,
        ordinal,
      ));
    }
  }
  const after = await observations(task);
  const inventoryAfter = await filesystemInventory(sandboxRoot);
  const delta = worksiteDelta(task, inventoryBefore, inventoryAfter);
  const productInventoryAfter = await filesystemInventory(
    task.workspaceBinding.roots.productRoot,
  );
  const productDelta = worksiteDelta(task, productInventoryBefore, productInventoryAfter, false);
  const afterMatches = after.every((row, ordinal) => canonicalJson(row as unknown as JsonValue) ===
    canonicalJson(task.protectedObservations[ordinal]!.observation as unknown as JsonValue));
  const artifact = constructWorksiteCommandHelperArtifact({
    task,
    disposition: !beforeMatches || !afterMatches
      ? "protected_mismatch"
      : productDelta.length > 0
      ? "product_mismatch"
      : delta.some((row) => row.matchedTerritoryRef === null)
      ? "territory_mismatch"
      : "success",
    commandResults,
    predicateObservations,
    worksiteDelta: delta,
    productDelta,
    snapshotRoot: sandboxRoot,
    snapshotRef: snapshot.snapshotRef,
    snapshotDigest: snapshot.snapshotDigest,
    snapshotMembers: snapshot.snapshotMembers,
    protectedBefore: before,
    protectedAfter: after,
  });
  const bytes = Buffer.from(`${canonicalJson(artifact as unknown as JsonValue)}\n`, "utf8");
  await publishCreateOnly(artifactPath, bytes);
  await canonicalExistingPathWithinRoot(
    preflight.manifest.archiveRoot,
    artifactPath,
    "file",
  );
  const workerReturnProjection = Object.freeze({
    kind: "worksite_command_execution_worker_result" as const,
    schemaVersion: "5.0.0" as const,
    taskRef: task.taskRef,
    taskDigest: task.taskDigest,
    workspaceBindingIdentity: task.workspaceBinding.bindingId,
    workspaceBindingDigest: task.workspaceBinding.bindingDigest,
    sourceConstructionResultRef: task.sourceConstructionResultRef,
    sourceConstructionResultDigest: task.sourceConstructionResultDigest,
    commandResults: artifact.commandResults,
    predicateObservations: artifact.predicateObservations,
  }) satisfies WorksiteCommandExecutionWorkerResult;
  process.stdout.write(
    `${canonicalJson(workerReturnProjection as unknown as JsonValue)}\n`,
  );
}

await main();
