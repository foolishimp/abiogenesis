#!/usr/bin/env node
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Exit from "effect/Exit";
import * as Option from "effect/Option";
import * as Scope from "effect/Scope";
import { runEffectProgram } from "../shared/effect_definition.js";
import { createMonotonicDeadline, createOwnedProcessLifetime, type OwnedProcessFacts } from "../shared/owned_process_lifetime.js";
import { classifyOwnedProcessTerminal, encodeOwnedProcessFacts } from "../shared/process/index.js";
import { hasExactKeys as exactKeys, isTrimmedNonblankNulFreeString as exactString } from "../shared/admission_predicates.js";
import { classifyPathRelation, pathRelation, pathStrictlyWithin, pathWithin } from "../shared/path_confinement.js";
import { constructWorksiteCommandExecutionLaunchManifest, isAuthorityFreeWorksiteCommandOccurrence,
  type WorksiteCommandExecutionLaunchManifest } from "../product/worksite_command_launch.js";
import { isExecutableWorksiteCommandTask as isWorksiteExecutionTask,
  executableWorksiteCommandSources as worksiteExecutionSources, executableWorksiteCommandLocus as worksiteExecutionLocus,
  executableWorksiteCommandImplementationRef as worksiteExecutionImplementationRef,
  executableWorksiteCommandIdentityPrefix as worksiteExecutionIdentityPrefix,
  type ExecutableWorksiteCommandTask as WorksiteExecutionTask,
  type ExecutableWorksiteSnapshotMember as WorksiteExecutionSnapshotMember } from "../product/worksite_command_forward.js";
import { spawn, type ChildProcessByStdio } from "node:child_process";
import { request as httpRequest } from "node:http";
import type { Readable } from "node:stream";
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
} from "../shared/digests.js";
import {
  WORKSITE_COMMAND_EXECUTION_IDS,
  constructWorksiteExecutionHelperArtifact,
  type WorksiteCommandExecutionWorkerResult,
  type WorksiteCommandHelperFailure,
  type WorksiteCommandResult,
  type WorksiteObservedStream,
  type WorksitePredicateObservation,
  type WorksitePathDelta,
  type WorksitePathObservation,
  type WorksiteReportObservation,
  matchingWorksiteTerritoryRef,
} from "../product/worksite_command_execution.js";
import { observeWorksiteSubject } from "../product/worksite_operations.js";
import { admitIJsonText } from "../shared/i_json.js";
import {
  isWorksiteObservation,
  type WorksiteObservation,
} from "../product/worksite_effect.js";
import { canonicalEquals } from "../shared/value/index.js";
import { admitJson, isRecord } from "../shared/admit/index.js";

let activeCommand: ReturnType<typeof spawn> | null = null;

/** A failure after launch (D15). The message is the throw site's text; `main`
 * publishes `subject` as the helper artifact's `failure` disposition. */
class WorksiteHelperFailure extends TypeError {
  constructor(
    prefix: string,
    detail: Readonly<Record<string, JsonValue>>,
    readonly subject: Omit<WorksiteCommandHelperFailure, "attemptRef"> & { readonly attemptRef: string | null },
  ) {
    super(`${prefix}: ${canonicalJson(detail)}`);
  }
}

/** The helper re-admits the Worker's launch manifest from disk: the exact member
 * set, the members the owner copies through, then equality with the owner's
 * manifest over those members. */
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
  if (!isAuthorityFreeWorksiteCommandOccurrence(candidate.occurrence) ||
    !isSha256Digest(candidate.taskDigest) || !isSha256Digest(candidate.taskManifestDigest) ||
    !exactString(candidate.taskRef) || !exactString(candidate.taskManifestPath) ||
    !exactString(candidate.archiveRoot) || !exactString(candidate.attemptRoot) ||
    !exactString(candidate.launchManifestPath) || !exactString(candidate.helperModulePath) ||
    typeof candidate.taskManifestByteLength !== "number" ||
    !Number.isSafeInteger(candidate.taskManifestByteLength) ||
    Number(candidate.taskManifestByteLength) < 1) return false;
  const expected = constructWorksiteCommandExecutionLaunchManifest({
    taskRef: candidate.taskRef,
    taskDigest: candidate.taskDigest,
    taskManifestPath: candidate.taskManifestPath,
    taskManifestDigest: candidate.taskManifestDigest,
    taskManifestByteLength: candidate.taskManifestByteLength,
    occurrence: candidate.occurrence,
    archiveRoot: candidate.archiveRoot,
    attemptRoot: candidate.attemptRoot,
    launchManifestPath: candidate.launchManifestPath,
    helperModulePath: candidate.helperModulePath,
  });
  const admitted = admitJson(value);
  return admitted.kind === "ok" && canonicalEquals(admitted.value, expected);
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

function record(value: JsonValue | undefined): Readonly<Record<string, JsonValue>> {
  if (!isRecord(value)) {
    throw new TypeError("predicate declaration must be one object");
  }
  return value;
}

function contained(root: string, relativePath: string): string {
  const absolute = resolve(root, ...relativePath.replaceAll("\\", "/").split("/"));
  const fromRoot = relative(root, absolute);
  if (!pathWithin(classifyPathRelation(fromRoot)) || resolve(root, fromRoot) !== absolute) {
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
  if (!pathStrictlyWithin(classifyPathRelation(fromRoot))) {
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
  task: WorksiteExecutionTask,
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
    if (otherRoot === undefined || pathWithin(pathRelation(archiveRoot, otherRoot)) ||
      pathWithin(pathRelation(otherRoot, archiveRoot))) {
      throw new TypeError("command execution archive root overlaps a protected workspace root");
    }
  }
}

async function admitLaunchManifest(): Promise<Readonly<{
  task: WorksiteExecutionTask;
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
    `${canonicalJson(manifest)}\n`,
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
  if (!isWorksiteExecutionTask(taskValue)) {
    throw new TypeError("helper task manifest does not retain one exact Product task");
  }
  const task = taskValue;
  const canonicalTaskBytes = Buffer.from(
    `${canonicalJson(task)}\n`,
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
  if (manifest.occurrence.programLocusRef !== worksiteExecutionLocus(task) ||
    manifest.implementationRef !== worksiteExecutionImplementationRef(task) || !taskManifestBytes.equals(canonicalTaskBytes) ||
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
  task: WorksiteExecutionTask,
  before: ReadonlyMap<string, WorksitePathObservation>,
  after: ReadonlyMap<string, WorksitePathObservation>,
  authorizeSnapshotTerritories = true,
): readonly WorksitePathDelta[] {
  const paths = [...new Set([...before.keys(), ...after.keys()])].sort((left, right) => left.localeCompare(right));
  const rows: WorksitePathDelta[] = [];
  for (const relativePath of paths) {
    const prior = before.get(relativePath) ?? null;
    const next = after.get(relativePath) ?? null;
    if (canonicalEquals(prior, next)) continue;
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
  task: WorksiteExecutionTask,
  snapshotRoot: string,
): Promise<Readonly<{
  snapshotRef: string;
  snapshotDigest: `sha256:${string}`;
  snapshotMembers: readonly WorksiteExecutionSnapshotMember[];
}>> {
  await mkdir(snapshotRoot);
  const members: WorksiteExecutionSnapshotMember[] = [];
  for (const [ordinal, protectedRow] of worksiteExecutionSources(task).entries()) {
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
      ...("sourceMemberRef" in protectedRow && "source" in protectedRow
        ? { kind: "worksite_command_forward_snapshot_member" as const, sourceMemberRef: protectedRow.sourceMemberRef, source: protectedRow.source }
        : "sourceMemberRef" in protectedRow
        ? { kind: "worksite_snapshot_member" as const, sourceMemberRef: protectedRow.sourceMemberRef }
        : { kind: "worksite_revision_snapshot_member" as const, designTargetRef: protectedRow.designTargetRef, source: protectedRow.source }),
      schemaVersion: "5.0.0" as const,
      ordinal,
      sourceObservationRef: protectedRow.observation.observationRef,
      sourceObservationDigest: protectedRow.observation.observationDigest,
      relativePath: protectedRow.subject.relativePath,
      byteLength: bytes.byteLength,
      digest,
    }));
  }
  const snapshotMembers = Object.freeze(members);
  const snapshotDigest = sha256Canonical(snapshotMembers);
  return Object.freeze({
    snapshotRef: `${worksiteExecutionIdentityPrefix(task, "snapshot")}/${snapshotDigest.slice("sha256:".length)}`,
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
  command: WorksiteExecutionTask["commands"][number],
  report: WorksiteExecutionTask["commands"][number]["expectedReports"][number],
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
    const observationDigest = sha256Canonical(body);
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
    // Absence is established by the owned group probe, never by signal failure.
  }
}

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    if (activeCommand !== null) signalProcess(activeCommand, "SIGKILL");
    process.exit(signal === "SIGTERM" ? 143 : 130);
  });
}

function unconfirmedScopeDiagnostic(facts: OwnedProcessFacts): Buffer {
  return Buffer.from(`\nABI owned process cleanup unresolved: ${canonicalJson({
    directExit: facts.directExit, scopeKind: facts.scopeKind, scopeAbsence: facts.scopeAbsence,
    noChildEstablished: facts.noChildEstablished, closeObserved: facts.closeObserved,
    streamsDisposed: facts.streamsDisposed, drainExpired: facts.drainExpired,
  })}\n`, "utf8");
}

/** The process members of one launch's observation: a command result's, and an
 * HTTP probe's `process`. */
type LaunchProcessObservation = Readonly<{
  exitStatus: number;
  processSignal: NodeJS.Signals | null;
  timedOut: boolean;
  signalSequence: readonly ("SIGTERM" | "SIGKILL")[];
  terminationConfirmed: boolean;
  stdout: WorksiteObservedStream;
  stderr: WorksiteObservedStream;
}>;

/** The no-child launch failure of a synchronous spawn error (design §10.5).
 * For every errno but EACCES, EAGAIN, EMFILE, ENFILE and ENOENT, `spawn` throws
 * its errno exception (`syscall` "spawn") before any child or lifetime exists;
 * those five reach the lifetime as its `launchFailure`. The observation is the
 * one that launch failure gives: exit 127, no signal, no timeout and no cleanup
 * signal, termination confirmed, empty stdout and the error's message in
 * stderr. Any other throw, such as an argument Node refuses before it launches,
 * is rethrown. */
function noChildLaunchObservation(error: unknown): LaunchProcessObservation {
  const launch = error as NodeJS.ErrnoException;
  if (!(error instanceof Error) || launch.syscall !== "spawn" || typeof launch.code !== "string") throw error;
  return {
    exitStatus: 127, processSignal: null, timedOut: false, signalSequence: [], terminationConfirmed: true,
    stdout: stream(Buffer.alloc(0)), stderr: stream(Buffer.from(error.message, "utf8")),
  };
}

/** A command's process observation: its declared members, then its launch's. */
function commandProcessObservation(
  command: WorksiteExecutionTask["commands"][number],
  ordinal: number,
  launched: LaunchProcessObservation,
) {
  return {
    ordinal,
    commandId: command.commandId,
    executable: command.executable,
    args: [...command.args],
    relativeCwd: command.relativeCwd,
    environment: command.environment,
    timeoutMs: command.timeoutMs,
    terminationGraceMs: command.terminationGraceMs,
    exitStatus: launched.exitStatus,
    timedOut: launched.timedOut,
    processSignal: launched.processSignal,
    signalSequence: launched.signalSequence,
    terminationConfirmed: launched.terminationConfirmed,
    stdout: launched.stdout,
    stderr: launched.stderr,
  };
}

/** A command's result: its process observation, its declared reports and its digest. */
async function commandResult(
  executionRoot: string,
  command: WorksiteExecutionTask["commands"][number],
  ordinal: number,
  launched: LaunchProcessObservation,
): Promise<WorksiteCommandResult> {
  const reports = await Promise.all(command.expectedReports.map((row) =>
    reportObservation(executionRoot, command, row)
  ));
  const body = {
    ...commandProcessObservation(command, ordinal, launched),
    reports,
    reportCount: reports.filter((row) => row.state === "file").length,
  };
  const observationDigest = sha256Canonical(body);
  const result = Object.freeze({
    kind: "worksite_command_result" as const,
    schemaVersion: "5.0.0" as const,
    ...body,
    observationRef: `worksite-command-observation://abiogenesis/${observationDigest.slice("sha256:".length)}`,
    observationDigest,
  });
  return result;
}

/** Lift one fallible Promise operation: its synchronous throw or its rejection
 * stays the exact failure value, never a library wrapper. */
function attempt<A>(operation: () => PromiseLike<A>): Effect.Effect<A, unknown> {
  return Effect.tryPromise({ try: () => operation(), catch: (value) => value });
}

/** Lift one fallible synchronous operation, keeping its exact thrown value. */
function attemptSync<A>(operation: () => A): Effect.Effect<A, unknown> {
  return Effect.try({ try: () => operation(), catch: (value) => value });
}

/** The barrier every command release crosses before it disposes: request the
 * lifetime's existing finite cleanup, inert once cleanup began or completed,
 * then await that lifetime's one canonical completion. */
function settled(lifetime: ReturnType<typeof createOwnedProcessLifetime>): Effect.Effect<OwnedProcessFacts> {
  return Effect.suspend(() => {
    lifetime.requestTermination();
    return Effect.promise(() => lifetime.completion);
  });
}

/** The bounded diagnostic of one closed command Scope. A failed use stays the
 * outcome, so release faults behind it are written here, never dropped. */
function commandScopeClosed(used: Exit.Exit<unknown, unknown>, closed: Exit.Exit<void>): void {
  if (Exit.isSuccess(used) || Exit.isSuccess(closed)) return;
  try {
    process.stderr.write(`ABI worksite command release fault: ${Cause.pretty(closed.cause).slice(0, 8192)}\n`);
  } catch {
    // A diagnostic never replaces the selected outcome.
  }
}

/** One command Scope. Its use runs interruptibly and its Exit is kept before
 * the Scope closes. A failed use, interruption included, is the outcome;
 * otherwise the closed Scope is, so a release fault alone still fails. */
function commandScope<A>(use: Effect.Effect<A, unknown, Scope.Scope>): Effect.Effect<A, unknown> {
  return Effect.uninterruptibleMask((restore) => Effect.gen(function* () {
    const scope = yield* Scope.make();
    const used = yield* Effect.exit(restore(Scope.extend(use, scope)));
    const closed = yield* Effect.exit(Scope.close(scope, used));
    commandScopeClosed(used, closed);
    if (Exit.isFailure(used) || Exit.isSuccess(closed)) return yield* used;
    return yield* Effect.failCause(closed.cause);
  }));
}

/** One command's launch inside its Scope: its owned child's observation, or
 * the no-child observation of a synchronous spawn error. */
function launchCommand(
  task: WorksiteExecutionTask,
  ordinal: number,
  cwd: string,
  attemptRef: string | null,
): Effect.Effect<LaunchProcessObservation, unknown, Scope.Scope> {
  return Effect.gen(function* () {
    const command = task.commands[ordinal]!;
    const environment = Object.fromEntries(command.environment.map((entry) => [entry.name, entry.value]));
    const stdout: Buffer[] = [], stderr: Buffer[] = [];
    const signalSequence: ("SIGTERM" | "SIGKILL")[] = [];
    let timedOut = false;
    let launchFailed = false;
    let captureOpen = true;
    const timeoutTimer = createMonotonicDeadline();
    // Spawn and lifetime are one uninterruptible acquisition: once a child
    // exists, its settling release is registered before anything can fail.
    const launch = yield* Effect.acquireRelease(
      attemptSync(() => spawn(command.executable, [...command.args], {
        cwd, env: environment, detached: process.platform !== "win32",
        stdio: ["ignore", "pipe", "pipe"],
      })).pipe(Effect.either, Effect.map(Either.map((child) => {
        activeCommand = child;
        const lifetime = createOwnedProcessLifetime(child, { terminationGraceMs: command.terminationGraceMs }, {
          onError: (error) => { launchFailed = true; stderr.push(Buffer.from(error.message, "utf8")); timeoutTimer.cancel(); },
          onExit: () => {
            captureOpen = false; timeoutTimer.cancel(); child.stdout.destroy(); child.stderr.destroy();
          },
          onSignalRequested: (signal) => {
            timeoutTimer.cancel(); signalSequence.push(signal);
            stderr.push(Buffer.from(`${signal === "SIGTERM" ? "\n" : ""}ABI worksite command cleanup: ${signal} requested\n`, "utf8"));
          },
        });
        return { child, lifetime };
      }))),
      (launch) => Either.isLeft(launch) ? Effect.void
        : Effect.zipRight(settled(launch.right.lifetime), Effect.sync(() => { activeCommand = null; })),
    );
    if (Either.isLeft(launch)) return yield* attemptSync(() => noChildLaunchObservation(launch.left));
    const { child, lifetime } = launch.right;
    // Each later resource registers its release before its fallible
    // acquisition; that release disposes only after the settlement barrier.
    const hold = (acquire: () => unknown, release: () => void) => Effect.zipRight(
      Effect.addFinalizer(() => Effect.zipRight(settled(lifetime), Effect.sync(release))),
      attemptSync(acquire),
    );
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    const onStdout = (chunk: Buffer): void => { if (captureOpen) lifetime.observe(() => stdout.push(Buffer.from(chunk))); };
    const onStderr = (chunk: Buffer): void => { if (captureOpen) lifetime.observe(() => stderr.push(Buffer.from(chunk))); };
    yield* Effect.all([
      hold(() => {
        heartbeat = setInterval(() => {
          lifetime.observe(() => { process.stderr.write(`ABI_WORKSITE_HEARTBEAT command=${command.commandId}\n`); });
        }, Math.min(15_000, Math.max(1_000, Math.floor(command.timeoutMs / 4))));
      }, () => clearInterval(heartbeat)),
      hold(() => child.stdout.on("data", onStdout), () => child.stdout.off("data", onStdout)),
      hold(() => child.stderr.on("data", onStderr), () => child.stderr.off("data", onStderr)),
      hold(() => timeoutTimer.after(command.timeoutMs, () => { timedOut = true; lifetime.requestTermination(); }),
        () => timeoutTimer.cancel()),
    ], { discard: true }).pipe(Effect.catchAll((error) => Effect.sync(() => lifetime.fail(error))));
    const facts = yield* Effect.promise(() => lifetime.completion);
    if (facts.firstError !== null) {
      const detail = {
        taskRef: task.taskRef, taskDigest: task.taskDigest, attemptRef, command,
        diagnostic: { name: facts.firstError.name, message: facts.firstError.message },
        processFacts: encodeOwnedProcessFacts(facts),
      };
      return yield* Effect.fail(new WorksiteHelperFailure("worksite command failed; dependent work stopped", detail,
        { failureClass: "command_failed", ...detail }));
    }
    // A spawn failure has no child to clean up; an exit needs a confirmed boundary.
    const terminal = classifyOwnedProcessTerminal(facts);
    if (terminal === "unconfirmed") stderr.push(unconfirmedScopeDiagnostic(facts));
    const launched: LaunchProcessObservation = {
      exitStatus: timedOut ? 124 : launchFailed ? 127 : (facts.directExit?.status ?? 128),
      processSignal: facts.directExit?.signal ?? null, timedOut,
      signalSequence: Object.freeze([...signalSequence]), terminationConfirmed: terminal !== "unconfirmed",
      stdout: stream(Buffer.concat(stdout)), stderr: stream(Buffer.concat(stderr)),
    };
    if (!launched.terminationConfirmed) {
      const processObservation = commandProcessObservation(command, ordinal, launched);
      const detail = {
        taskRef: task.taskRef, taskDigest: task.taskDigest, attemptRef,
        command: processObservation, diagnostic: decodeStream(processObservation.stderr),
        processFacts: encodeOwnedProcessFacts(facts),
      };
      return yield* Effect.fail(new WorksiteHelperFailure("worksite command cleanup unresolved; dependent work stopped", detail,
        { failureClass: "command_cleanup_unresolved", ...detail, diagnostic: { name: "TypeError", message: detail.diagnostic } }));
    }
    return launched;
  });
}

function runCommand(
  task: WorksiteExecutionTask,
  executionRoot: string,
  ordinal: number,
  attemptRef: string | null = null,
): Effect.Effect<WorksiteCommandResult, unknown> {
  return Effect.gen(function* () {
    const command = task.commands[ordinal]!;
    const cwd = yield* attempt(() => confinedExistingPath(
      executionRoot,
      command.relativeCwd,
      "directory",
    ));
    const launched = yield* commandScope(launchCommand(task, ordinal, cwd, attemptRef));
    return yield* attempt(() => commandResult(executionRoot, command, ordinal, launched));
  });
}

function decodeStream(value: WorksiteObservedStream): string {
  return Buffer.from(value.payload, "base64").toString("utf8");
}

function commandFor(
  task: WorksiteExecutionTask,
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
  task: WorksiteExecutionTask,
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
  const selector = record(declaration.selector);
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
    const observationDigest = sha256Canonical(evidenceBody);
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

/** An HTTP probe's observation: the request it sent, its port file, the
 * response and its launch's process observation. */
function httpProbeObservation(
  request: Parameters<typeof oneHttpRequest>[0] | null,
  portFile: Readonly<{ relativePath: string; port: number | null; bytes: Buffer | null; issue: string | null }>,
  response: Awaited<ReturnType<typeof oneHttpRequest>>,
  launched: LaunchProcessObservation,
) {
  return {
    request,
    portFile: {
      relativePath: portFile.relativePath,
      port: portFile.port,
      state: portFile.port === null ? portFile.bytes === null ? "absent" : "invalid" : "observed",
      issue: portFile.issue,
      byteLength: portFile.bytes?.byteLength ?? null,
      digest: portFile.bytes === null ? null : sha256Bytes(portFile.bytes),
    },
    response: response === null ? null : {
      status: response.status,
      body: response.body.toString("utf8"),
      bodyDigest: sha256Bytes(response.body),
      byteLength: response.body.byteLength,
    },
    process: launched,
  };
}

async function runHttpProbe(
  task: WorksiteExecutionTask,
  executionRoot: string,
  declaration: Readonly<Record<string, JsonValue>>,
  attemptRef: string | null = null,
  predicate: Readonly<{ ordinal: number; predicateId: string }> | null = null,
): Promise<JsonValue> {
  const launch = record(declaration.launch);
  const request = record(declaration.request);
  const portFile = record(launch.portFile);
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
  let child: ChildProcessByStdio<null, Readable, Readable>;
  try {
    child = spawn(launch.executable as string, launchArgs, {
      cwd,
      env: environment,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    // The port file was absent before the launch and no child exists to write
    // it: the issue the asynchronous launch failure gives.
    return httpProbeObservation(null, { relativePath: portFileRelativePath, port: null, bytes: null,
      issue: "process_exited_before_port" }, null, noChildLaunchObservation(error));
  }
  activeCommand = child;
  const stdout: Buffer[] = [], stderr: Buffer[] = [];
  const signalSequence: ("SIGTERM" | "SIGKILL")[] = [];
  const launchTimer = createMonotonicDeadline(), requestTimer = createMonotonicDeadline();
  let launchFailed = false, launchExpired = false, requestOpen = true, completed = false;
  const lifetime = createOwnedProcessLifetime(child, { terminationGraceMs: launch.terminationGraceMs as number }, {
    onError: (error) => { launchFailed = true; stderr.push(Buffer.from(error.message, "utf8")); launchTimer.cancel(); },
    onExit: () => { launchTimer.cancel(); },
    onSignalRequested: (signal) => { signalSequence.push(signal); },
  });
  const heartbeat = setInterval(() => {
    lifetime.observe(() => { process.stderr.write("ABI_WORKSITE_HEARTBEAT http-probe\n"); });
  }, Math.min(15_000, Math.max(1_000, Math.floor((launch.timeoutMs as number) / 4))));
  const onStdout = (chunk: Buffer): void => { lifetime.observe(() => stdout.push(Buffer.from(chunk))); };
  const onStderr = (chunk: Buffer): void => { lifetime.observe(() => stderr.push(Buffer.from(chunk))); };
  let selectedPort: number | null = null;
  let portFileBytes: Buffer | null = null;
  let portFileIssue: string | null = null;
  let requestInput: Parameters<typeof oneHttpRequest>[0] | null = null;
  let response: Awaited<ReturnType<typeof oneHttpRequest>> = null;
  let ownerError: Error | null = null;
  let facts: Awaited<typeof lifetime.completion>;
  const observing = (): boolean => !launchFailed && !completed && !lifetime.snapshot().closeObserved &&
    lifetime.snapshot().firstError === null && requestOpen;
  void lifetime.completion.then(() => { completed = true; });
  try {
    child.stdout.on("data", onStdout); child.stderr.on("data", onStderr);
    launchTimer.after(launch.timeoutMs as number, () => { launchExpired = true; lifetime.requestTermination(); });
    requestTimer.after(Math.min(launch.timeoutMs as number, request.timeoutMs as number), () => { requestOpen = false; });
    while (observing() && selectedPort === null) {
      try {
        const observedPath = await confinedExistingPath(executionRoot, portFileRelativePath, "file");
        const bytes = await readFile(observedPath);
        portFileBytes = bytes;
        const text = bytes.toString("utf8");
        if (!/^(?:[1-9]\d{0,4})\r?\n?$/u.test(text)) { portFileIssue = "noncanonical_decimal_port"; break; }
        const candidate = Number(text.trim());
        if (!Number.isSafeInteger(candidate) || candidate < 1 || candidate > 65_535) { portFileIssue = "port_out_of_range"; break; }
        selectedPort = candidate;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") { portFileIssue = "port_file_confinement_or_read_failure"; break; }
        await new Promise((resolveWait) => setTimeout(resolveWait, 25));
      }
    }
    if (selectedPort === null && portFileIssue === null) {
      portFileIssue = lifetime.snapshot().closeObserved ? "process_exited_before_port" : "port_file_timeout";
    }
    requestInput = selectedPort === null ? null : {
      hostname: request.hostname as string, port: selectedPort,
      method: request.method as string, path: request.path as string, timeoutMs: request.timeoutMs as number,
    };
    while (observing() && requestInput !== null && response === null) {
      response = await oneHttpRequest(requestInput);
      if (response === null) await new Promise((resolveWait) => setTimeout(resolveWait, 25));
    }
    if (portFileIssue !== null) lifetime.requestTermination();
  } catch (error) {
    ownerError = error instanceof Error ? error : new TypeError(String(error)); lifetime.fail(ownerError);
  } finally {
    // Normal response still allows the declared launch duration. Any exceptional
    // owner path above has already requested bounded cleanup before this wait.
    try { facts = await lifetime.completion; }
    finally {
      launchTimer.cancel(); requestTimer.cancel(); clearInterval(heartbeat); activeCommand = null;
      child.stdout.off("data", onStdout); child.stderr.off("data", onStderr);
    }
  }
  if (facts.firstError !== null) {
    const detail = {
      taskRef: task.taskRef, taskDigest: task.taskDigest, attemptRef, ...(predicate === null ? {} : { predicate }), request,
      diagnostic: { name: facts.firstError.name, message: facts.firstError.message },
      processFacts: encodeOwnedProcessFacts(facts),
    };
    throw new WorksiteHelperFailure("worksite HTTP probe failed; dependent work stopped", detail,
      { failureClass: "http_probe_failed", ...detail });
  }
  if (ownerError !== null) throw ownerError;
  const timedOut = launchExpired && portFileIssue === null;
  const terminal = classifyOwnedProcessTerminal(facts);
  if (terminal === "unconfirmed") stderr.push(unconfirmedScopeDiagnostic(facts));
  const probe = httpProbeObservation(requestInput, {
    relativePath: portFileRelativePath, port: selectedPort, bytes: portFileBytes, issue: portFileIssue,
  }, response, {
    exitStatus: timedOut ? 124 : launchFailed ? 127 : (facts.directExit?.status ?? 128),
    processSignal: facts.directExit?.signal ?? null,
    timedOut,
    signalSequence,
    terminationConfirmed: terminal !== "unconfirmed",
    stdout: stream(Buffer.concat(stdout)),
    stderr: stream(Buffer.concat(stderr)),
  });
  if (!probe.process.terminationConfirmed) {
    const detail = {
      taskRef: task.taskRef, taskDigest: task.taskDigest, attemptRef, ...(predicate === null ? {} : { predicate }),
      observation: probe, diagnostic: decodeStream(probe.process.stderr),
      processFacts: encodeOwnedProcessFacts(facts),
    };
    throw new WorksiteHelperFailure("worksite HTTP cleanup unresolved; dependent work stopped", detail,
      { failureClass: "http_cleanup_unresolved", ...detail, diagnostic: { name: "TypeError", message: detail.diagnostic } });
  }
  return probe;
}

async function predicateObservation(
  task: WorksiteExecutionTask,
  executionRoot: string,
  commandResults: readonly WorksiteCommandResult[],
  ordinal: number,
  attemptRef: string | null = null,
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
    evidenceRefs = worksiteExecutionSources(task)
      .filter((row) => row.subject.relativePath === modulePath)
      .map((row) => row.observation.observationRef);
    evidence = worksiteExecutionSources(task)
      .filter((row) => row.subject.relativePath === modulePath)
      .map((row) => ({
        kind: "worksite_observation_coordinate",
        schemaVersion: "5.0.0",
        ref: row.observation.observationRef,
        digest: row.observation.observationDigest,
      }));
  } else if (predicate.predicateKind === "http_response_exact") {
    const command = commandFor(task, commandResults, declaration);
    observedValue = await runHttpProbe(task, executionRoot, declaration, attemptRef,
      { ordinal: predicate.ordinal, predicateId: predicate.predicateId });
    const probeDigest = sha256Canonical({
      predicateId: predicate.predicateId,
      observedValue,
    });
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
    const selector = record(declaration.selector);
    const prefix = selector.prefix as string;
    const suffix = selector.suffix as string;
    const segmentIndex = selector.segmentIndex as number;
    const paths = worksiteExecutionSources(task).map((row) => row.subject.relativePath);
    observedValue = [...new Set(paths.flatMap((path) => {
      if (!path.startsWith(prefix) || !path.endsWith(suffix)) return [];
      const selected = path.slice(prefix.length).split("/")[segmentIndex];
      return selected === undefined || selected.length === 0 ? [] : [selected];
    }))];
    evidenceRefs = worksiteExecutionSources(task).map((row) => row.observation.observationRef);
    evidence = worksiteExecutionSources(task).map((row) => ({
      kind: "worksite_observation_coordinate",
      schemaVersion: "5.0.0",
      ref: row.observation.observationRef,
      digest: row.observation.observationDigest,
    }));
  } else if (predicate.predicateKind === "file_count") {
    const selector = record(declaration.selector);
    const suffixes = selector.includeSuffixes as readonly string[];
    const substrings = selector.includeSubstrings as readonly string[];
    const selected = worksiteExecutionSources(task).filter((row) => {
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

async function observations(task: WorksiteExecutionTask) {
  const rows = await Promise.all(worksiteExecutionSources(task).map((row) =>
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

/** The raw value a failed helper Exit selects: the first Fail or Die payload in
 * sequential (release) order, never a preferred category. An interruption or a
 * parallel Cause has no one original value and selects none. */
function selectedFailure(cause: Cause.Cause<unknown>): Option.Option<unknown> {
  const [ordered, first] = Cause.match<readonly [boolean, Option.Option<unknown>], unknown>(cause, {
    onEmpty: [true, Option.none()],
    onFail: (error) => [true, Option.some(error)],
    onDie: (defect) => [true, Option.some(defect)],
    onInterrupt: () => [false, Option.none()],
    onSequential: (left, right) => [left[0] && right[0], Option.orElse(left[1], () => right[1])],
    onParallel: () => [false, Option.none()],
  });
  return ordered ? first : Option.none();
}

/** The helper's host boundary: run one program once through the package
 * membrane and return its value or throw its selected raw failure. A failure
 * with no one original value throws its actual Cause. */
async function runHelperProgram<A>(program: Effect.Effect<A, unknown>): Promise<A> {
  const exit = await runEffectProgram(program);
  if (Exit.isSuccess(exit)) return exit.value;
  const selected = selectedFailure(exit.cause);
  throw Option.isSome(selected) ? selected.value : exit.cause;
}

/** Print one acknowledgment and settle only once its write has drained. */
function acknowledge(line: string, output: NodeJS.WritableStream = process.stdout): Promise<void> {
  return new Promise<void>((resolveWrite, rejectWrite) => {
    output.write(line, (error) => error === null || error === undefined ? resolveWrite() : rejectWrite(error));
  });
}

async function main(): Promise<void> {
  return runHelperProgram(Effect.gen(function* () {
    const preflight = yield* attempt(() => admitLaunchManifest());
    const { task, artifactPath, sandboxRoot } = preflight;
    if (!isWorksiteExecutionTask(task)) {
      return yield* Effect.fail(new TypeError("helper launch manifest does not retain one exact Product task"));
    }
    const before = yield* attempt(() => observations(task));
    const productInventoryBefore = yield* attempt(() => filesystemInventory(
      task.workspaceBinding.roots.productRoot,
    ));
    const beforeMatches = before.every((row, ordinal) => canonicalEquals(
      row,
      worksiteExecutionSources(task)[ordinal]!.observation,
    ));
    const commandResults: WorksiteCommandResult[] = [];
    const predicateObservations: WorksitePredicateObservation[] = [];
    const snapshot = yield* attempt(() => beforeMatches
      ? materializeSnapshot(task, sandboxRoot)
      : (async () => {
          await mkdir(sandboxRoot);
          const snapshotMembers = Object.freeze([]) as readonly WorksiteExecutionSnapshotMember[];
          const snapshotDigest = sha256Canonical(snapshotMembers);
          return Object.freeze({
            snapshotRef: `${worksiteExecutionIdentityPrefix(task, "snapshot")}/${snapshotDigest.slice("sha256:".length)}`,
            snapshotDigest,
            snapshotMembers,
          });
        })());
    const inventoryBefore = yield* attempt(() => filesystemInventory(sandboxRoot));
    // A failure after launch is published as the artifact's `failure`
    // disposition, then rethrown: the helper still exits non-zero. Any other
    // failure, defect or interruption escapes unchanged.
    const failed = !beforeMatches ? null : yield* Effect.gen(function* () {
      for (let ordinal = 0; ordinal < task.commands.length; ordinal += 1) {
        const command = yield* runCommand(task, sandboxRoot, ordinal, preflight.manifest.attemptRef);
        if (!command.terminationConfirmed) {
          return yield* Effect.fail(new TypeError(`worksite command cleanup unresolved; dependent work stopped: ${canonicalJson({
            taskRef: task.taskRef, taskDigest: task.taskDigest, attemptRef: preflight.manifest.attemptRef,
            command, diagnostic: decodeStream(command.stderr),
          })}`));
        }
        commandResults.push(command);
      }
      for (let ordinal = 0; ordinal < task.outcomePredicates.length; ordinal += 1) {
        const observation = yield* attempt(() =>
          predicateObservation(task, sandboxRoot, commandResults, ordinal, preflight.manifest.attemptRef));
        if (observation.predicateKind === "http_response_exact") {
          const probe = record(observation.observedValue);
          const processObservation = record(probe.process);
          if (processObservation.terminationConfirmed !== true) {
            return yield* Effect.fail(new TypeError(`worksite HTTP cleanup unresolved; dependent work stopped: ${canonicalJson({
              taskRef: task.taskRef, taskDigest: task.taskDigest, attemptRef: preflight.manifest.attemptRef,
              observation, diagnostic: decodeStream(processObservation.stderr as unknown as WorksiteObservedStream),
            })}`));
          }
        }
        predicateObservations.push(observation);
      }
      return null;
    }).pipe(Effect.catchAll((error) => error instanceof WorksiteHelperFailure ? Effect.succeed(error) : Effect.fail(error)));
    const after = yield* attempt(() => observations(task));
    const inventoryAfter = yield* attempt(() => filesystemInventory(sandboxRoot));
    const delta = worksiteDelta(task, inventoryBefore, inventoryAfter);
    const productInventoryAfter = yield* attempt(() => filesystemInventory(
      task.workspaceBinding.roots.productRoot,
    ));
    const productDelta = worksiteDelta(task, productInventoryBefore, productInventoryAfter, false);
    const afterMatches = after.every((row, ordinal) => canonicalEquals(
      row,
      worksiteExecutionSources(task)[ordinal]!.observation,
    ));
    const artifact = constructWorksiteExecutionHelperArtifact({
      task,
      // The adapters ran under this manifest's attempt; the subject names it.
      ...(failed === null ? {} : { failure: { ...failed.subject, attemptRef: preflight.manifest.attemptRef } }),
      disposition: failed !== null
        ? "failure"
        : !beforeMatches || !afterMatches
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
    const bytes = Buffer.from(`${canonicalJson(artifact)}\n`, "utf8");
    yield* attempt(() => publishCreateOnly(artifactPath, bytes));
    yield* attempt(() => canonicalExistingPathWithinRoot(
      preflight.manifest.archiveRoot,
      artifactPath,
      "file",
    ));
    // The acknowledgment is printed for every disposition, a failure included,
    // and drained before the rethrow: a pipe is asynchronous.
    const workerReturnProjection = Object.freeze({
      kind: "worksite_command_execution_worker_result" as const,
      schemaVersion: "5.0.0" as const,
      taskRef: task.taskRef,
      taskDigest: task.taskDigest,
      attemptRef: preflight.manifest.attemptRef,
      helperArtifactRef: artifact.artifactRef,
      helperArtifactDigest: artifact.artifactDigest,
    }) satisfies WorksiteCommandExecutionWorkerResult;
    yield* attempt(() => acknowledge(`${canonicalJson(workerReturnProjection)}\n`));
    if (failed !== null) return yield* Effect.fail(failed);
  }));
}

await main();
