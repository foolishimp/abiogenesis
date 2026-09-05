import {
  lstatSync,
  linkSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";

import type { ActorProcessCarrierValidation } from "../abg/actor_process.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import {
  WORKSITE_COMMAND_EXECUTION_IDS,
  constructWorksiteCommandExecutionObservation,
  constructWorksiteCommandExecutionWorkerResult,
  helperArtifactPreservesProtectedObservations,
  isWorksiteCommandExecutionHelperPlan,
  isWorksiteCommandExecutionTask,
  isWorksiteCommandHelperArtifact,
  renderWorksiteCommandExecutionPrompt,
  worksiteCommandExecutionHelperPlan,
  worksiteCommandExecutionWorkerResultSchema,
  type WorksiteCommandExecutionTask,
  type WorksiteCommandExecutionHelperPlan,
} from "../product/worksite_command_execution.js";
import { observeWorksiteSubject } from "../product/worksite_operations.js";
import {
  constructWorksiteObservation,
  isWorksiteObservation,
  type WorksiteObservation,
  type WorksiteSubject,
} from "../product/worksite_effect.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  LeafExecutionOccurrence,
  LeafRealizationCandidate,
  PreparedProbabilisticLeafInvocation,
} from "./contracts.js";

const descriptorBody = {
  implementationRef: WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/worksite_command_execution.js",
  namedSymbol: "realizeWorksiteCommandExecution",
  computeRegime: "F_P" as const,
  inputContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,
  outputContractRef: WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,
  failureContractRef: WORKSITE_COMMAND_EXECUTION_IDS.failureContractRef,
  refusalContractRef: WORKSITE_COMMAND_EXECUTION_IDS.refusalContractRef,
};

export const WORKSITE_COMMAND_EXECUTION_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(descriptorBody),
  ...descriptorBody,
}) satisfies PackagedLeafImplementationDescriptor;

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

interface WorksiteCommandExecutionLaunchPlan {
  readonly helperPlan: WorksiteCommandExecutionHelperPlan;
  readonly occurrence: AuthorityFreeWorksiteCommandExecutionOccurrence;
  readonly attemptDigest: Sha256Digest;
  readonly attemptRoot: string;
  readonly launchManifest: WorksiteCommandExecutionLaunchManifest;
  readonly launchManifestPath: string;
  readonly launchManifestRef: string;
  readonly launchManifestDigest: Sha256Digest;
  readonly launchManifestByteDigest: Sha256Digest;
  readonly launchManifestByteLength: number;
}

function exactAuthorityFreeOccurrence(
  occurrence: Readonly<LeafExecutionOccurrence>,
): AuthorityFreeWorksiteCommandExecutionOccurrence {
  const expectedKeys = [
    "attempt", "cCallRef", "executionAuthority", "frameId", "graphCallId",
    "programLocusRef", "runId", "taskOrdinal",
  ].sort().join("\0");
  if (Object.keys(occurrence).sort().join("\0") !== expectedKeys ||
    typeof occurrence.cCallRef !== "string" || occurrence.cCallRef.trim() === "" ||
    typeof occurrence.runId !== "string" || occurrence.runId.trim() === "" ||
    typeof occurrence.graphCallId !== "string" || occurrence.graphCallId.trim() === "" ||
    typeof occurrence.frameId !== "string" || occurrence.frameId.trim() === "" ||
    occurrence.programLocusRef !== WORKSITE_COMMAND_EXECUTION_IDS.nodeRef ||
    !(occurrence.taskOrdinal === null || Number.isSafeInteger(occurrence.taskOrdinal) &&
      Number(occurrence.taskOrdinal) >= 0) || !Number.isSafeInteger(occurrence.attempt) ||
    occurrence.attempt < 1 || occurrence.executionAuthority !== null) {
    throw new TypeError("command execution requires one exact authority-free C2 occurrence");
  }
  return admitIJsonValue(
    occurrence,
    "worksite command execution occurrence",
  ) as unknown as AuthorityFreeWorksiteCommandExecutionOccurrence;
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

function constructWorksiteCommandExecutionLaunchPlan(
  task: WorksiteCommandExecutionTask,
  rawOccurrence: Readonly<LeafExecutionOccurrence>,
): WorksiteCommandExecutionLaunchPlan {
  const occurrence = exactAuthorityFreeOccurrence(rawOccurrence);
  const attemptRef = worksiteCommandExecutionAttemptRef(occurrence);
  const helperPlan = worksiteCommandExecutionHelperPlan(task, attemptRef);
  const occurrenceDigest = sha256Canonical(occurrence as unknown as JsonValue);
  const attemptDigest = sha256Canonical({ attemptRef });
  const attemptRoot = dirname(helperPlan.taskManifestPath);
  const launchManifestPath = resolve(attemptRoot, "launch.json");
  const body = {
    kind: "worksite_command_execution_launch_manifest" as const,
    schemaVersion: "5.0.0" as const,
    taskRef: task.taskRef,
    taskDigest: task.taskDigest,
    taskManifestPath: helperPlan.taskManifestPath,
    taskManifestDigest: helperPlan.taskManifestDigest,
    taskManifestByteLength: helperPlan.taskManifestByteLength,
    occurrence,
    occurrenceDigest,
    attemptRef,
    attemptDigest,
    archiveRoot: task.workspaceBinding.roots.archiveRoot,
    attemptRoot,
    launchManifestPath,
    helperModulePath: helperPlan.helperModulePath,
    implementationRef: WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,
    implementationBindingRef:
      WORKSITE_COMMAND_EXECUTION_IDS.implementationBindingRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
  } as const;
  const launchManifestDigest = sha256Canonical(body as unknown as JsonValue);
  const launchManifest = deepFreeze({
    ...body,
    launchManifestRef:
      `worksite-command-launch-manifest://abiogenesis/${launchManifestDigest.slice("sha256:".length)}`,
    launchManifestDigest,
  });
  const bytes = Buffer.from(
    `${canonicalJson(launchManifest as unknown as JsonValue)}\n`,
    "utf8",
  );
  return deepFreeze({
    helperPlan,
    occurrence,
    attemptDigest,
    attemptRoot,
    launchManifest,
    launchManifestPath,
    launchManifestRef: launchManifest.launchManifestRef,
    launchManifestDigest,
    launchManifestByteDigest: sha256Bytes(bytes),
    launchManifestByteLength: bytes.byteLength,
  });
}

function failure(failureClass: string): Readonly<LeafRealizationCandidate> {
  const diagnosticRef =
    `diagnostic://abiogenesis/worksite/command-execution/${failureClass.replaceAll("_", "-")}@5`;
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failure" as const,
    evidenceCandidates: [] as const,
    resultCandidate: {
      kind: "worksite_command_execution_failure" as const,
      schemaVersion: "5.0.0" as const,
      failureClass,
      diagnosticRef,
    },
    diagnosticRef,
  });
}

function exactExchange(
  task: WorksiteCommandExecutionTask,
  inputDigest: `sha256:${string}`,
  request: Readonly<Record<string, JsonValue>>,
  plan: WorksiteCommandExecutionHelperPlan,
  exchange: ActorProcessCarrierValidation,
): boolean {
  const observation = exchange.observation;
  const tool = observation.toolInvocations[0];
  return canonicalJson(exchange.request as unknown as JsonValue) === canonicalJson(request as unknown as JsonValue) &&
    observation.actorRef === task.workerActorRef &&
    observation.workerBindingRef === task.workerBindingRef &&
    observation.implementationRef === WORKSITE_COMMAND_EXECUTION_IDS.implementationRef &&
    observation.inputDigest === inputDigest &&
    observation.materializationPlanRef === task.materializationPlanRef &&
    observation.rendererRef === task.rendererRef &&
    observation.instructionContractRef === task.instructionContractRef &&
    observation.resultContractRef === task.resultContractRef &&
    observation.transportLane === "worker_executes" &&
    observation.disposition === "success" && observation.failureClass === null &&
    observation.toolCallCount === 1 && observation.toolInvocations.length === 1 &&
    tool !== undefined && tool.ordinal === 0 && tool.toolName === "Bash" &&
    tool.inputDigest === plan.toolInputDigest &&
    tool.inputByteLength === plan.toolInputByteLength;
}

function plannedCanonicalPath(path: string): string {
  let cursor = resolve(path);
  const missing: string[] = [];
  for (;;) {
    try {
      const node = lstatSync(cursor);
      if (!node.isDirectory() && missing.length > 0) {
        throw new TypeError("workspace execution root crosses a non-directory node");
      }
      return resolve(realpathSync(cursor), ...missing);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parent = dirname(cursor);
      if (parent === cursor) {
        throw new TypeError("workspace execution root has no concrete ancestor");
      }
      missing.unshift(basename(cursor));
      cursor = parent;
    }
  }
}

function assertFinalRootNotSymlink(path: string): void {
  try {
    if (lstatSync(resolve(path)).isSymbolicLink()) {
      throw new TypeError("workspace execution root must not itself be a symlink");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

function assertCanonicalArchiveRoot(path: string): void {
  const declared = resolve(path);
  const node = lstatSync(declared);
  if (path !== declared || node.isSymbolicLink() || !node.isDirectory() ||
    realpathSync(declared) !== declared) {
    throw new TypeError("command execution archive root must be one canonical concrete directory");
  }
}

function containsPath(root: string, candidate: string): boolean {
  const relation = relative(root, candidate);
  return relation === "" || (!relation.startsWith("..") && !isAbsolute(relation));
}

function observeWorksiteSubjectSync(
  task: WorksiteCommandExecutionTask,
  subject: WorksiteSubject,
): WorksiteObservation {
  const declaredRoot = resolve(task.workspaceAuthorityBasis.canonicalRoot);
  const rootStatus = lstatSync(declaredRoot);
  if (declaredRoot !== task.workspaceAuthorityBasis.canonicalRoot ||
    rootStatus.isSymbolicLink() || !rootStatus.isDirectory() ||
    realpathSync(declaredRoot) !== declaredRoot) {
    throw new TypeError("canonical worksite root changed before Worker dispatch");
  }
  const target = resolve(declaredRoot, ...subject.relativePath.split("/"));
  if (target === declaredRoot || !containsPath(declaredRoot, target)) {
    throw new TypeError("protected subject escapes the canonical worksite root");
  }
  const protectedRoots = Object.values(task.workspaceBinding.roots)
    .map(plannedCanonicalPath);
  if (protectedRoots.some((root) => containsPath(root, target))) {
    throw new TypeError("protected subject enters a WorkspaceBinding protected root");
  }
  let cursor = declaredRoot;
  for (const [ordinal, segment] of subject.relativePath.split("/").entries()) {
    cursor = resolve(cursor, segment);
    const status = lstatSync(cursor);
    if (status.isSymbolicLink() || realpathSync(cursor) !== cursor) {
      throw new TypeError("protected subject has a symlink or physical alias");
    }
    const final = ordinal === subject.relativePath.split("/").length - 1;
    if (!final && !status.isDirectory() || final && !status.isFile()) {
      throw new TypeError("protected subject is not one concrete file");
    }
    if (final && status.nlink !== 1) {
      throw new TypeError("protected subject has a hard-link alias");
    }
  }
  const status = lstatSync(target);
  const bytes = readFileSync(target);
  const observation = constructWorksiteObservation({
    subject,
    state: "file",
    fileIdentity: `${status.dev}:${status.ino}`,
    fileDigest: sha256Bytes(bytes),
    byteLength: bytes.byteLength,
  });
  if (!isWorksiteObservation(observation)) {
    throw new TypeError("protected subject observation could not be constructed");
  }
  return observation;
}

function installedProductInventoryDigest(rootValue: string): Sha256Digest {
  const root = resolve(rootValue);
  const rootStatus = lstatSync(root);
  if (root !== rootValue || rootStatus.isSymbolicLink() ||
    !rootStatus.isDirectory() || realpathSync(root) !== root) {
    throw new TypeError("installed Product root must remain canonical");
  }
  const rows: JsonValue[] = [];
  const visit = (directory: string, relativeDirectory: string): void => {
    const entries = readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const relativePath = relativeDirectory.length === 0
        ? entry.name
        : `${relativeDirectory}/${entry.name}`;
      const path = resolve(directory, entry.name);
      const status = lstatSync(path);
      if (status.isSymbolicLink()) {
        const target = readlinkSync(path);
        rows.push({
          relativePath,
          nodeKind: "symlink",
          symlinkTarget: target,
          byteLength: null,
          digest: sha256Bytes(Buffer.from(target, "utf8")),
          fileIdentity: `${status.dev}:${status.ino}:${status.nlink}`,
        });
      } else if (status.isDirectory()) {
        rows.push({
          relativePath,
          nodeKind: "directory",
          symlinkTarget: null,
          byteLength: null,
          digest: sha256Bytes(Buffer.from("directory", "utf8")),
          fileIdentity: `${status.dev}:${status.ino}:${status.nlink}`,
        });
        visit(path, relativePath);
      } else if (status.isFile()) {
        const bytes = readFileSync(path);
        rows.push({
          relativePath,
          nodeKind: "file",
          symlinkTarget: null,
          byteLength: bytes.byteLength,
          digest: sha256Bytes(bytes),
          fileIdentity: `${status.dev}:${status.ino}:${status.nlink}`,
        });
      } else {
        throw new TypeError("installed Product inventory encountered a special node");
      }
    }
  };
  visit(root, "");
  return sha256Canonical(rows);
}

function assertArchiveExecutionBoundary(
  task: WorksiteCommandExecutionTask,
  plan: WorksiteCommandExecutionLaunchPlan,
): void {
  for (const root of Object.values(task.workspaceBinding.roots)) {
    assertFinalRootNotSymlink(root);
  }
  assertCanonicalArchiveRoot(task.workspaceBinding.roots.archiveRoot);
  const productRoot = plannedCanonicalPath(task.workspaceBinding.roots.productRoot);
  const archiveRoot = plannedCanonicalPath(task.workspaceBinding.roots.archiveRoot);
  const nonProductRoots = [
    task.workspaceBinding.roots.productRoot,
    task.workspaceBinding.roots.toolchainRoot,
    task.workspaceBinding.roots.eventLogRoot,
    task.workspaceBinding.roots.runtimeStateRoot,
    task.workspaceBinding.roots.projectionRoot,
  ].map(plannedCanonicalPath);
  if (nonProductRoots.some((root) =>
    containsPath(root, archiveRoot) || containsPath(archiveRoot, root)
  )) {
    throw new TypeError("command execution archive root overlaps a protected workspace root");
  }
  const otherMutableRoots = [
    task.workspaceBinding.roots.eventLogRoot,
    task.workspaceBinding.roots.runtimeStateRoot,
    task.workspaceBinding.roots.projectionRoot,
    task.workspaceBinding.roots.toolchainRoot,
  ].map(plannedCanonicalPath);
  if (otherMutableRoots.some((root) => containsPath(productRoot, root))) {
    throw new TypeError("command execution workspace mechanics overlap the Product root");
  }
  for (const path of [
    plan.attemptRoot,
    plan.helperPlan.taskManifestPath,
    plan.launchManifestPath,
    plan.helperPlan.artifactPath,
    plan.helperPlan.sandboxRoot,
  ]) {
    const lexicalRelation = relative(
      resolve(task.workspaceBinding.roots.archiveRoot),
      resolve(path),
    );
    const canonicalCandidate = plannedCanonicalPath(path);
    const canonicalLexicalCandidate = resolve(archiveRoot, lexicalRelation);
    if (lexicalRelation === "" || lexicalRelation.startsWith("..") ||
      isAbsolute(lexicalRelation) || !containsPath(archiveRoot, canonicalCandidate) ||
      canonicalCandidate !== canonicalLexicalCandidate) {
      throw new TypeError("command execution attempt path escapes its archive root");
    }
  }
}

function assertExistingCanonicalNode(
  path: string,
  expectedKind: "directory" | "file",
): void {
  if (!isAbsolute(path) || resolve(path) !== path) {
    throw new TypeError("command execution path must be absolute and lexical-canonical");
  }
  const node = lstatSync(path);
  if (node.isSymbolicLink() ||
    realpathSync(path) !== path ||
    (expectedKind === "directory" ? !node.isDirectory() : !node.isFile())) {
    throw new TypeError(`command execution path must be one concrete ${expectedKind}`);
  }
}

function launchManifestBytes(
  plan: WorksiteCommandExecutionLaunchPlan,
): Buffer {
  return Buffer.from(
    `${canonicalJson(plan.launchManifest as unknown as JsonValue)}\n`,
    "utf8",
  );
}

function taskManifestBytes(task: WorksiteCommandExecutionTask): Buffer {
  return Buffer.from(`${canonicalJson(task as unknown as JsonValue)}\n`, "utf8");
}

function sameFilesystemNode(leftPath: string, rightPath: string): boolean {
  const left = lstatSync(leftPath);
  const right = lstatSync(rightPath);
  return left.dev === right.dev && left.ino === right.ino;
}

function publishCreateOnly(path: string, bytes: Buffer, label: string): void {
  const temporaryPath = `${path}.tmp-${String(process.pid)}`;
  writeFileSync(temporaryPath, bytes, { flag: "wx" });
  try {
    linkSync(temporaryPath, path);
  } finally {
    unlinkSync(temporaryPath);
  }
  assertExistingCanonicalNode(path, "file");
  if (lstatSync(path).nlink !== 1 || !readFileSync(path).equals(bytes)) {
    throw new TypeError(`${label} publication changed identity or bytes`);
  }
}

function assertManifestPairCurrent(
  task: WorksiteCommandExecutionTask,
  occurrence: Readonly<LeafExecutionOccurrence>,
  plan: WorksiteCommandExecutionLaunchPlan,
): void {
  const expectedPlan = constructWorksiteCommandExecutionLaunchPlan(task, occurrence);
  const taskBytes = taskManifestBytes(task);
  const launchBytes = launchManifestBytes(plan);
  if (!isWorksiteCommandExecutionHelperPlan(task, plan.helperPlan) ||
    canonicalJson(plan as unknown as JsonValue) !==
      canonicalJson(expectedPlan as unknown as JsonValue) ||
    plan.launchManifest.taskRef !== task.taskRef ||
    plan.launchManifest.taskDigest !== task.taskDigest ||
    plan.launchManifest.taskManifestPath !== plan.helperPlan.taskManifestPath ||
    plan.launchManifest.taskManifestDigest !== plan.helperPlan.taskManifestDigest ||
    plan.launchManifest.taskManifestByteLength !== plan.helperPlan.taskManifestByteLength ||
    taskBytes.byteLength !== plan.helperPlan.taskManifestByteLength ||
    sha256Bytes(taskBytes) !== plan.helperPlan.taskManifestDigest ||
    launchBytes.byteLength !== plan.launchManifestByteLength ||
    sha256Bytes(launchBytes) !== plan.launchManifestByteDigest ||
    plan.launchManifest.launchManifestRef !== plan.launchManifestRef ||
    plan.launchManifest.launchManifestDigest !== plan.launchManifestDigest) {
    throw new TypeError("command execution manifests differ from their exact plan");
  }
  assertArchiveExecutionBoundary(task, plan);
  assertExistingCanonicalNode(plan.attemptRoot, "directory");
  assertExistingCanonicalNode(plan.helperPlan.taskManifestPath, "file");
  assertExistingCanonicalNode(plan.launchManifestPath, "file");
  if (plan.helperPlan.taskManifestPath === plan.launchManifestPath ||
    sameFilesystemNode(plan.helperPlan.taskManifestPath, plan.launchManifestPath) ||
    lstatSync(plan.helperPlan.taskManifestPath).nlink !== 1 ||
    lstatSync(plan.launchManifestPath).nlink !== 1) {
    throw new TypeError("command execution manifests must be distinct single-linked files");
  }
  const observedTask = readFileSync(plan.helperPlan.taskManifestPath);
  const observedLaunch = readFileSync(plan.launchManifestPath);
  if (!observedTask.equals(taskBytes) || !observedLaunch.equals(launchBytes) ||
    observedTask.byteLength !== plan.helperPlan.taskManifestByteLength ||
    sha256Bytes(observedTask) !== plan.helperPlan.taskManifestDigest ||
    observedLaunch.byteLength !== plan.launchManifestByteLength ||
    sha256Bytes(observedLaunch) !== plan.launchManifestByteDigest) {
    throw new TypeError("command execution manifest publication changed bytes");
  }
}

function materializeExecutionManifests(
  task: WorksiteCommandExecutionTask,
  occurrence: Readonly<LeafExecutionOccurrence>,
  plan: WorksiteCommandExecutionLaunchPlan,
): void {
  const taskBytes = taskManifestBytes(task);
  const launchBytes = launchManifestBytes(plan);
  mkdirSync(plan.attemptRoot, { recursive: true });
  assertArchiveExecutionBoundary(task, plan);
  assertExistingCanonicalNode(plan.attemptRoot, "directory");
  publishCreateOnly(plan.helperPlan.taskManifestPath, taskBytes, "command task manifest");
  assertExistingCanonicalNode(plan.helperPlan.taskManifestPath, "file");
  if (lstatSync(plan.helperPlan.taskManifestPath).nlink !== 1 ||
    !readFileSync(plan.helperPlan.taskManifestPath).equals(taskBytes)) {
    throw new TypeError("command task manifest is not current before launch readiness");
  }
  publishCreateOnly(plan.launchManifestPath, launchBytes, "command launch manifest");
  assertManifestPairCurrent(task, occurrence, plan);
}

function manifestPairIsCurrent(
  task: WorksiteCommandExecutionTask,
  occurrence: Readonly<LeafExecutionOccurrence>,
  plan: WorksiteCommandExecutionLaunchPlan,
): boolean {
  try {
    assertManifestPairCurrent(task, occurrence, plan);
    return true;
  } catch {
    return false;
  }
}

function requiredExecutionBudgetMs(task: WorksiteCommandExecutionTask): number {
  const commandBudget = task.commands.reduce(
    (sum, command) => sum + command.timeoutMs + command.terminationGraceMs,
    0,
  );
  const probeBudget = task.outcomePredicates.reduce((sum, predicate) => {
    if (predicate.predicateKind !== "http_response_exact" ||
      typeof predicate.declaration !== "object" || predicate.declaration === null ||
      Array.isArray(predicate.declaration)) return sum;
    const declaration = predicate.declaration as Readonly<Record<string, JsonValue>>;
    const launch = declaration.launch;
    const request = declaration.request;
    if (typeof launch !== "object" || launch === null || Array.isArray(launch) ||
      typeof request !== "object" || request === null || Array.isArray(request)) return sum;
    const launchRecord = launch as Readonly<Record<string, JsonValue>>;
    const requestRecord = request as Readonly<Record<string, JsonValue>>;
    return sum + Number(launchRecord.timeoutMs) + Number(launchRecord.terminationGraceMs) +
      Number(requestRecord.timeoutMs);
  }, 0);
  return commandBudget + probeBudget + 5_000;
}

export function realizeWorksiteCommandExecution(
  input: Readonly<WorksiteCommandExecutionTask>,
  occurrence: Readonly<LeafExecutionOccurrence>,
): Readonly<PreparedProbabilisticLeafInvocation<Readonly<LeafRealizationCandidate>>> {
  if (!isWorksiteCommandExecutionTask(input)) {
    throw new TypeError("command execution requires one exact admitted task");
  }
  const c2Occurrence = exactAuthorityFreeOccurrence(occurrence);
  const configuredAbsoluteTimeout = Number(
    process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS ?? "3600000",
  );
  const configuredInactivityTimeout = Number(
    process.env.ABG_TS_FP_TIMEOUT_MS ?? "60000",
  );
  const requiredBudget = requiredExecutionBudgetMs(input);
  if (!Number.isSafeInteger(configuredInactivityTimeout) ||
    configuredInactivityTimeout <= requiredBudget) {
    throw new TypeError("actor inactivity timeout must exceed the task's closed helper execution budget");
  }
  if (!Number.isSafeInteger(configuredAbsoluteTimeout) ||
    configuredAbsoluteTimeout <= requiredBudget ||
    configuredAbsoluteTimeout <= configuredInactivityTimeout) {
    throw new TypeError("actor absolute timeout must exceed the task's closed helper execution budget");
  }
  const inputDigest = sha256Canonical(input as unknown as JsonValue);
  const launchPlan = constructWorksiteCommandExecutionLaunchPlan(
    input,
    c2Occurrence,
  );
  const helperPlan = launchPlan.helperPlan;
  const before = input.protectedObservations.map((row) =>
    observeWorksiteSubjectSync(input, row.subject)
  );
  if (before.some((observation, ordinal) =>
    canonicalJson(observation as unknown as JsonValue) !== canonicalJson(
      input.protectedObservations[ordinal]!.observation as unknown as JsonValue,
    ))) {
    throw new TypeError(
      "protected worksite observation changed before Worker dispatch",
    );
  }
  const productInventoryBefore = installedProductInventoryDigest(
    input.workspaceBinding.roots.productRoot,
  );
  assertArchiveExecutionBoundary(input, launchPlan);
  materializeExecutionManifests(input, c2Occurrence, launchPlan);
  const workerRequest = deepFreeze({
    actorRef: input.workerActorRef,
    workerBindingRef: input.workerBindingRef,
    implementationRef: WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,
    inputDigest,
    materializationPlanRef: input.materializationPlanRef,
    rendererRef: input.rendererRef,
    instructionContractRef: input.instructionContractRef,
    resultContractRef: input.resultContractRef,
    transportLane: input.transportLane,
    prompt: renderWorksiteCommandExecutionPrompt(input, helperPlan),
    responseJsonSchema: worksiteCommandExecutionWorkerResultSchema(input),
  });
  return deepFreeze({
    kind: "prepared_probabilistic_leaf_invocation" as const,
    schemaVersion: "5.0.0" as const,
    workerRequest,
    async complete(exchange: Readonly<ActorProcessCarrierValidation>) {
      const current = await Promise.all(input.protectedObservations.map((row) =>
        observeWorksiteSubject(
          input.workspaceAuthorityBasis,
          input.workspaceBinding,
          row.subject,
        )
      ));
      if (current.some((row, ordinal) =>
        canonicalJson(row as unknown as JsonValue) !== canonicalJson(
          input.protectedObservations[ordinal]!.observation as unknown as JsonValue,
        ))) {
        return failure("protected_observation_mismatch");
      }
      let productInventoryAfter: Sha256Digest;
      try {
        productInventoryAfter = installedProductInventoryDigest(
          input.workspaceBinding.roots.productRoot,
        );
      } catch {
        return failure("product_inventory_mismatch");
      }
      if (productInventoryAfter !== productInventoryBefore) {
        return failure("product_inventory_mismatch");
      }
      if (!exactExchange(
        input,
        inputDigest,
        workerRequest as unknown as Readonly<Record<string, JsonValue>>,
        helperPlan,
        exchange,
      )) return failure("transport_identity_mismatch");
      if (!manifestPairIsCurrent(input, c2Occurrence, launchPlan)) {
        return failure("helper_manifest_mismatch");
      }
      let helperValue: unknown;
      let helperBytes: Buffer;
      try {
        assertArchiveExecutionBoundary(input, launchPlan);
        assertExistingCanonicalNode(helperPlan.sandboxRoot, "directory");
        assertExistingCanonicalNode(helperPlan.artifactPath, "file");
        if (lstatSync(helperPlan.artifactPath).nlink !== 1 ||
          sameFilesystemNode(helperPlan.artifactPath, helperPlan.taskManifestPath) ||
          sameFilesystemNode(helperPlan.artifactPath, launchPlan.launchManifestPath)) {
          throw new TypeError("helper artifact must be one distinct single-linked file");
        }
        helperBytes = readFileSync(helperPlan.artifactPath);
        helperValue = JSON.parse(helperBytes.toString("utf8")) as unknown;
      } catch {
        return failure("helper_artifact_absent");
      }
      if (!isWorksiteCommandHelperArtifact(input, helperValue)) {
        return failure("helper_artifact_contract_failure");
      }
      const canonicalHelperBytes = Buffer.from(
        `${canonicalJson(helperValue as unknown as JsonValue)}\n`,
        "utf8",
      );
      if (!helperBytes.equals(canonicalHelperBytes)) {
        return failure("helper_artifact_contract_failure");
      }
      if (helperValue.disposition !== "success") {
        return failure(`helper_${helperValue.disposition}`);
      }
      let rawValue: unknown;
      try {
        rawValue = JSON.parse(exchange.observation.finalOutput) as unknown;
      } catch {
        return failure("result_contract_failure");
      }
      let workerResult;
      try {
        workerResult = constructWorksiteCommandExecutionWorkerResult(input, rawValue);
      } catch {
        return failure("result_contract_failure");
      }
      if (!helperArtifactPreservesProtectedObservations(input, helperValue) ||
        canonicalJson(helperValue.commandResults as unknown as JsonValue) !==
          canonicalJson(workerResult.commandResults as unknown as JsonValue) ||
        canonicalJson(helperValue.predicateObservations as unknown as JsonValue) !==
          canonicalJson(workerResult.predicateObservations as unknown as JsonValue)) {
        return failure("protected_observation_mismatch");
      }
      let observation;
      try {
        observation = constructWorksiteCommandExecutionObservation(
          input,
          workerResult,
          exchange.observation,
          helperValue,
          helperPlan,
        );
      } catch {
        return failure("result_contract_failure");
      }
      return deepFreeze({
        kind: "leaf_realization_candidate" as const,
        schemaVersion: "5.0.0" as const,
        disposition: "success" as const,
        evidenceCandidates: [] as const,
        resultCandidate: observation as unknown as Readonly<Record<string, JsonValue>>,
      });
    },
  });
}
