import { constants } from "node:fs";
import {
  lstat,
  link,
  open,
  realpath,
  rename,
  unlink,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { CCall } from "../abg/c_call.js";
import type {
  AdmittedImplementationSet,
  ExecutionBasis,
} from "../abg/execution_basis.js";
import type {
  WorkspaceAuthorityBasis,
  WorkspaceBinding,
} from "./environment.js";
import {
  WORKSITE_FILE_REPLACE_EFFECT_URI,
  constructWorksiteEffectAuthorization,
  constructWorksiteFileReplaceReceipt,
  constructWorksiteObservation,
  constructWorksiteSubject,
  constructWorksiteTerritory,
  isWorksiteEffectAuthorization,
  isWorksiteFileReplaceRequest,
  isWorksiteObservation,
  isWorksiteSubject,
  isWorksiteTerritory,
  worksiteRefusal,
  worksiteSubjectWithinTerritory,
  type FileWorksiteObservation,
  type WorksiteEffectAuthorization,
  type WorksiteEffectRefusal,
  type WorksiteFileReplaceReceipt,
  type WorksiteFileReplaceRequest,
  type WorksiteObservation,
  type WorksiteSubject,
  type WorksiteTerritory,
} from "./worksite_effect.js";

export interface WorksiteFileReplaceInput {
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly request: WorksiteFileReplaceRequest;
  readonly executionBasis: ExecutionBasis;
  readonly cCall: CCall;
  readonly implementationSet: AdmittedImplementationSet;
  readonly authorization: WorksiteEffectAuthorization;
}

export interface WorksiteFileReplaceSuccess {
  readonly kind: "worksite_file_replace_result";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "committed";
  readonly effectUri: typeof WORKSITE_FILE_REPLACE_EFFECT_URI;
  readonly receipt: WorksiteFileReplaceReceipt;
  readonly successorObservation: FileWorksiteObservation;
}

export type WorksiteFileReplaceResult =
  | WorksiteEffectRefusal
  | WorksiteFileReplaceSuccess;

function sameCanonical(left: unknown, right: unknown): boolean {
  return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactSubjectForBinding(
  workspaceAuthorityBasis: WorkspaceAuthorityBasis,
  workspaceBinding: WorkspaceBinding,
  subject: WorksiteSubject,
): boolean {
  if (!isWorksiteSubject(subject)) return false;
  const expected = constructWorksiteSubject({
    workspaceAuthorityBasis,
    workspaceBinding,
    subjectUri: subject.subjectUri,
    relativePath: subject.relativePath,
  });
  return expected.kind === "worksite_subject" &&
    sameCanonical(expected, subject);
}

function exactTerritoryForBinding(
  workspaceAuthorityBasis: WorkspaceAuthorityBasis,
  workspaceBinding: WorkspaceBinding,
  territory: WorksiteTerritory,
): boolean {
  if (!isWorksiteTerritory(territory)) return false;
  const expected = constructWorksiteTerritory({
    workspaceAuthorityBasis,
    workspaceBinding,
    territoryUri: territory.territoryUri,
    relativeRoot: territory.relativeRoot,
  });
  return expected.kind === "worksite_territory" &&
    sameCanonical(expected, territory);
}

function errnoCode(error: unknown): string | null {
  const code = (error as NodeJS.ErrnoException).code;
  return typeof code === "string" ? code : null;
}

function confined(root: string, path: string): boolean {
  const fromRoot = relative(root, path);
  return fromRoot === "" ||
    (!isAbsolute(fromRoot) && fromRoot !== ".." && !fromRoot.startsWith("../"));
}

interface ResolvedWorksiteTarget {
  readonly canonicalRoot: string;
  readonly targetPath: string;
  readonly protectedRoots: readonly string[];
}

interface PhysicalDirectoryIdentity {
  readonly path: string;
  readonly fileIdentity: string;
}

interface WorksiteCommitLocus {
  readonly target: ResolvedWorksiteTarget;
  readonly parent: PhysicalDirectoryIdentity;
  readonly targetFileIdentity: string | null;
  readonly observation: WorksiteObservation;
}

async function plannedCanonicalPath(path: string): Promise<string> {
  let cursor = resolve(path);
  const missing: string[] = [];
  for (;;) {
    try {
      const status = await lstat(cursor);
      if (status.isSymbolicLink() || !status.isDirectory()) {
        throw new TypeError("workspace root crosses a symlink or non-directory node");
      }
      const concrete = await realpath(cursor);
      if (concrete !== cursor) {
        throw new TypeError("workspace root is not physical-canonical");
      }
      return resolve(concrete, ...missing);
    } catch (error) {
      if (errnoCode(error) !== "ENOENT") throw error;
      const parent = dirname(cursor);
      if (parent === cursor) throw error;
      missing.unshift(basename(cursor));
      cursor = parent;
    }
  }
}

async function resolveWorksiteTarget(
  workspaceAuthorityBasis: WorkspaceAuthorityBasis,
  workspaceBinding: WorkspaceBinding,
  subject: WorksiteSubject,
): Promise<ResolvedWorksiteTarget | WorksiteEffectRefusal> {
  if (!exactSubjectForBinding(
    workspaceAuthorityBasis,
    workspaceBinding,
    subject,
  )) {
    return worksiteRefusal(
      "binding_mismatch",
      "worksite subject does not reproduce under the admitted canonical worksite root",
    );
  }
  const declaredRoot = resolve(workspaceAuthorityBasis.canonicalRoot);
  try {
    const declaredRootStat = await lstat(declaredRoot);
    if (declaredRootStat.isSymbolicLink() || !declaredRootStat.isDirectory()) {
      return worksiteRefusal(
        declaredRootStat.isSymbolicLink()
          ? "symlink_forbidden"
          : "invalid_worksite_root",
        "WorkspaceAuthorityBasis canonical root must be one concrete directory",
      );
    }
    const canonicalRoot = await realpath(declaredRoot);
    if (workspaceAuthorityBasis.canonicalRoot !== declaredRoot ||
      canonicalRoot !== declaredRoot) {
      return worksiteRefusal(
        "aliased_subject",
        "WorkspaceAuthorityBasis canonical root must be lexical- and physical-canonical",
      );
    }
    const targetPath = resolve(
      canonicalRoot,
      ...subject.relativePath.split("/"),
    );
    if (!confined(canonicalRoot, targetPath) || targetPath === canonicalRoot) {
      return worksiteRefusal(
        "invalid_relative_path",
        "worksite subject escapes the WorkspaceAuthorityBasis canonical root",
      );
    }
    const protectedRoots = await Promise.all(
      Object.values(workspaceBinding.roots).map(plannedCanonicalPath),
    );
    if (protectedRoots.some((root) => confined(root, targetPath))) {
      return worksiteRefusal(
        "binding_mismatch",
        "worksite subject enters a protected WorkspaceBinding root",
      );
    }
    return { canonicalRoot, targetPath, protectedRoots };
  } catch (error) {
    return worksiteRefusal(
      "invalid_worksite_root",
      `WorkspaceAuthorityBasis canonical root cannot be resolved: ${String(error)}`,
      null,
      errnoCode(error),
    );
  }
}

async function inspectTargetPath(
  target: ResolvedWorksiteTarget,
  subject: WorksiteSubject,
): Promise<WorksiteEffectRefusal | "absent" | {
  readonly fileIdentity: string;
  readonly bytes: Uint8Array;
}> {
  const segments = subject.relativePath.split("/");
  let cursor = target.canonicalRoot;
  for (const [index, segment] of segments.entries()) {
    cursor = resolve(cursor, segment);
    try {
      const status = await lstat(cursor);
      if (status.isSymbolicLink()) {
        return worksiteRefusal(
          "symlink_forbidden",
          "worksite subject and every containing directory must be free of symlinks",
        );
      }
      const canonicalComponentPath = await realpath(cursor);
      if (canonicalComponentPath !== cursor) {
        return worksiteRefusal(
          "aliased_subject",
          "worksite subject and every existing containing directory must use their exact filesystem spelling",
        );
      }
      const final = index === segments.length - 1;
      if (!final && !status.isDirectory()) {
        return worksiteRefusal(
          "target_parent_missing",
          "worksite subject parent must be an existing concrete directory",
        );
      }
      if (final && !status.isFile()) {
        return worksiteRefusal(
          "target_not_file",
          "worksite subject must be absent or one regular file",
        );
      }
    } catch (error) {
      if (errnoCode(error) === "ENOENT") {
        return index === segments.length - 1
          ? "absent"
          : worksiteRefusal(
            "target_parent_missing",
            "worksite subject parent must exist before file replacement",
            null,
            "ENOENT",
          );
      }
      return worksiteRefusal(
        "filesystem_refused",
        `worksite path inspection failed: ${String(error)}`,
        null,
        errnoCode(error),
      );
    }
  }

  let handle;
  try {
    handle = await open(
      target.targetPath,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    const status = await handle.stat();
    if (!status.isFile()) {
      return worksiteRefusal(
        "target_not_file",
        "worksite subject changed to a non-file during observation",
      );
    }
    if (status.nlink !== 1) {
      return worksiteRefusal(
        "aliased_subject",
        "worksite subject must not share its file identity with another hard link",
      );
    }
    const bytes = await handle.readFile();
    return {
      fileIdentity: `${status.dev}:${status.ino}`,
      bytes,
    };
  } catch (error) {
    return worksiteRefusal(
      errnoCode(error) === "ELOOP" ? "symlink_forbidden" : "filesystem_refused",
      `worksite file observation failed: ${String(error)}`,
      null,
      errnoCode(error),
    );
  } finally {
    await handle?.close();
  }
}

async function inspectPhysicalDirectory(
  path: string,
): Promise<PhysicalDirectoryIdentity | WorksiteEffectRefusal> {
  try {
    const status = await lstat(path);
    if (status.isSymbolicLink()) {
      return worksiteRefusal(
        "symlink_forbidden",
        "worksite commit parent must remain one concrete directory",
      );
    }
    if (!status.isDirectory()) {
      return worksiteRefusal(
        "target_parent_missing",
        "worksite commit parent must remain an existing directory",
      );
    }
    if (await realpath(path) !== path) {
      return worksiteRefusal(
        "aliased_subject",
        "worksite commit parent must retain its physical-canonical path",
      );
    }
    return {
      path,
      fileIdentity: `${status.dev}:${status.ino}`,
    };
  } catch (error) {
    return worksiteRefusal(
      errnoCode(error) === "ENOENT"
        ? "target_parent_missing"
        : "filesystem_refused",
      `worksite commit parent inspection failed: ${String(error)}`,
      null,
      errnoCode(error),
    );
  }
}

function sameResolvedTarget(
  left: ResolvedWorksiteTarget,
  right: ResolvedWorksiteTarget,
): boolean {
  return left.canonicalRoot === right.canonicalRoot &&
    left.targetPath === right.targetPath &&
    sameCanonical(left.protectedRoots, right.protectedRoots);
}

function observationFromInspection(
  subject: WorksiteSubject,
  inspected: "absent" | {
    readonly fileIdentity: string;
    readonly bytes: Uint8Array;
  },
): WorksiteObservation | WorksiteEffectRefusal {
  return inspected === "absent"
    ? constructWorksiteObservation({ subject, state: "absent" })
    : constructWorksiteObservation({
        subject,
        state: "file",
        fileIdentity: inspected.fileIdentity,
        fileDigest: sha256Bytes(inspected.bytes),
        byteLength: inspected.bytes.byteLength,
      });
}

async function inspectCommitLocus(
  workspaceAuthorityBasis: WorkspaceAuthorityBasis,
  workspaceBinding: WorkspaceBinding,
  subject: WorksiteSubject,
  expectedTarget?: ResolvedWorksiteTarget,
): Promise<WorksiteCommitLocus | WorksiteEffectRefusal> {
  const target = await resolveWorksiteTarget(
    workspaceAuthorityBasis,
    workspaceBinding,
    subject,
  );
  if ("kind" in target) return target;
  if (expectedTarget !== undefined &&
    !sameResolvedTarget(target, expectedTarget)) {
    return worksiteRefusal(
      "aliased_subject",
      "worksite target resolution changed before commit",
    );
  }
  const parentPath = dirname(target.targetPath);
  const parentBefore = await inspectPhysicalDirectory(parentPath);
  if ("kind" in parentBefore) return parentBefore;
  const inspected = await inspectTargetPath(target, subject);
  if (typeof inspected !== "string" && "kind" in inspected) return inspected;
  const parentAfter = await inspectPhysicalDirectory(parentPath);
  if ("kind" in parentAfter) return parentAfter;
  if (parentBefore.fileIdentity !== parentAfter.fileIdentity) {
    return worksiteRefusal(
      "stale_observation",
      "worksite commit parent changed while O0 was observed",
    );
  }
  const observation = observationFromInspection(subject, inspected);
  if (!isWorksiteObservation(observation)) return observation;
  return {
    target,
    parent: parentAfter,
    targetFileIdentity: inspected === "absent"
      ? null
      : inspected.fileIdentity,
    observation,
  };
}

async function inspectStagingFile(
  path: string,
  expectedParent: PhysicalDirectoryIdentity,
): Promise<WorksiteEffectRefusal | {
  readonly fileIdentity: string;
  readonly bytes: Uint8Array;
}> {
  const parentBefore = await inspectPhysicalDirectory(dirname(path));
  if ("kind" in parentBefore) return parentBefore;
  if (parentBefore.fileIdentity !== expectedParent.fileIdentity) {
    return worksiteRefusal(
      "stale_observation",
      "worksite staging parent differs from the verified commit parent",
    );
  }
  let handle;
  try {
    const status = await lstat(path);
    if (status.isSymbolicLink() || !status.isFile() || status.nlink !== 1 ||
      await realpath(path) !== path) {
      return worksiteRefusal(
        status.isSymbolicLink() ? "symlink_forbidden" : "aliased_subject",
        "worksite staging file must remain one canonical unaliased file",
      );
    }
    handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const openedStatus = await handle.stat();
    if (!openedStatus.isFile() || openedStatus.nlink !== 1 ||
      `${openedStatus.dev}:${openedStatus.ino}` !== `${status.dev}:${status.ino}`) {
      return worksiteRefusal(
        "aliased_subject",
        "worksite staging file identity changed before commit",
      );
    }
    const bytes = await handle.readFile();
    const parentAfter = await inspectPhysicalDirectory(dirname(path));
    if ("kind" in parentAfter) return parentAfter;
    if (parentAfter.fileIdentity !== expectedParent.fileIdentity) {
      return worksiteRefusal(
        "stale_observation",
        "worksite staging parent changed before commit",
      );
    }
    return {
      fileIdentity: `${openedStatus.dev}:${openedStatus.ino}`,
      bytes,
    };
  } catch (error) {
    return worksiteRefusal(
      errnoCode(error) === "ELOOP" ? "symlink_forbidden" : "filesystem_refused",
      `worksite staging inspection failed: ${String(error)}`,
      null,
      errnoCode(error),
    );
  } finally {
    await handle?.close();
  }
}

export async function observeWorksiteSubject(
  workspaceAuthorityBasis: WorkspaceAuthorityBasis,
  workspaceBinding: WorkspaceBinding,
  subject: WorksiteSubject,
): Promise<WorksiteEffectRefusal | WorksiteObservation> {
  const locus = await inspectCommitLocus(
    workspaceAuthorityBasis,
    workspaceBinding,
    subject,
  );
  return "kind" in locus ? locus : locus.observation;
}

export function isWorksiteFileReplaceInput(
  value: unknown,
): value is WorksiteFileReplaceInput {
  if (
    !isRecord(value) ||
    !(
      "workspaceBinding" in value &&
      "workspaceAuthorityBasis" in value &&
      "request" in value &&
      "executionBasis" in value &&
      "cCall" in value &&
      "implementationSet" in value &&
      "authorization" in value
    )
  ) return false;
  const input = value as unknown as WorksiteFileReplaceInput;
  try {
    if (
      !isWorksiteFileReplaceRequest(input.request) ||
      !isWorksiteEffectAuthorization(input.authorization) ||
      !exactSubjectForBinding(
        input.workspaceAuthorityBasis,
        input.workspaceBinding,
        input.request.subject,
      ) ||
      !exactTerritoryForBinding(
        input.workspaceAuthorityBasis,
        input.workspaceBinding,
        input.request.territory,
      ) ||
      !sameCanonical(
        input.workspaceAuthorityBasis,
        input.request.workspaceAuthorityBasis,
      ) ||
      !worksiteSubjectWithinTerritory(
        input.request.subject,
        input.request.territory,
      )
    ) return false;
    const expected = constructWorksiteEffectAuthorization({
      workspaceBinding: input.workspaceBinding,
      request: input.request,
      executionBasis: input.executionBasis,
      cCall: input.cCall,
      implementationSet: input.implementationSet,
    });
    return expected.kind === "worksite_effect_authorization" &&
      sameCanonical(expected, input.authorization);
  } catch {
    return false;
  }
}

export async function replaceWorksiteFile(
  input: WorksiteFileReplaceInput,
): Promise<WorksiteFileReplaceResult> {
  if (!isWorksiteFileReplaceInput(input)) {
    return worksiteRefusal(
      "authorization_mismatch",
      "file replacement requires the exact request and selected call authorization",
    );
  }
  const { predecessorObservation, subject, territory } = input.request;
  if (!exactTerritoryForBinding(
    input.workspaceAuthorityBasis,
    input.workspaceBinding,
    territory,
  )) {
    return worksiteRefusal(
      "binding_mismatch",
      "write territory does not reproduce under the canonical worksite root",
    );
  }
  const target = await resolveWorksiteTarget(
    input.workspaceAuthorityBasis,
    input.workspaceBinding,
    subject,
  );
  if ("kind" in target) return target;
  const territoryPath = resolve(
    target.canonicalRoot,
    ...territory.relativeRoot.split("/"),
  );
  if (!confined(target.canonicalRoot, territoryPath) ||
    target.protectedRoots.some((root) => confined(root, territoryPath)) ||
    !confined(territoryPath, target.targetPath)) {
    return worksiteRefusal(
      "subject_outside_territory",
      "worksite subject is outside the authorized write territory",
    );
  }

  const initialLocus = await inspectCommitLocus(
    input.workspaceAuthorityBasis,
    input.workspaceBinding,
    subject,
    target,
  );
  if ("kind" in initialLocus) return initialLocus;
  const immediate = initialLocus.observation;
  if (!sameCanonical(immediate, predecessorObservation)) {
    return worksiteRefusal(
      "stale_observation",
      "worksite subject changed after O0; replacement requires fresh observation and authorization",
      immediate,
    );
  }

  const replacement = Buffer.from(input.request.replacementBytes, "base64");
  if (
    replacement.byteLength !== input.request.replacementByteLength ||
    sha256Bytes(replacement) !== input.request.replacementDigest
  ) {
    return worksiteRefusal(
      "replacement_invalid",
      "replacement bytes do not reproduce the admitted request digest",
      immediate,
    );
  }

  const parentPath = initialLocus.parent.path;
  const temporaryPath = resolve(
    parentPath,
    `.abiogenesis-${basename(target.targetPath)}-${randomUUID()}.tmp`,
  );
  let temporaryPresent = false;
  let temporaryFileIdentity: string | null = null;
  try {
    const stagingParent = await inspectPhysicalDirectory(parentPath);
    if ("kind" in stagingParent) return stagingParent;
    if (stagingParent.fileIdentity !== initialLocus.parent.fileIdentity) {
      return worksiteRefusal(
        "stale_observation",
        "worksite commit parent changed before staging",
        immediate,
      );
    }
    const stagingHandle = await open(
      temporaryPath,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY |
        constants.O_NOFOLLOW,
      0o600,
    );
    temporaryPresent = true;
    try {
      const createdStatus = await stagingHandle.stat();
      if (!createdStatus.isFile() || createdStatus.nlink !== 1) {
        return worksiteRefusal(
          "aliased_subject",
          "worksite staging creation did not retain one private file identity",
          immediate,
        );
      }
      temporaryFileIdentity = `${createdStatus.dev}:${createdStatus.ino}`;
      await stagingHandle.writeFile(replacement);
      await stagingHandle.sync();
    } finally {
      await stagingHandle.close();
    }

    const staged = await inspectStagingFile(
      temporaryPath,
      initialLocus.parent,
    );
    if ("kind" in staged) return staged;
    if (staged.fileIdentity !== temporaryFileIdentity ||
      staged.bytes.byteLength !== input.request.replacementByteLength ||
      sha256Bytes(staged.bytes) !== input.request.replacementDigest) {
      return worksiteRefusal(
        "replacement_invalid",
        "staged worksite successor differs from the admitted replacement",
        immediate,
      );
    }

    const atCommitLocus = await inspectCommitLocus(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
      subject,
      target,
    );
    if ("kind" in atCommitLocus) return atCommitLocus;
    const atCommit = atCommitLocus.observation;
    if (!sameCanonical(atCommit, predecessorObservation)) {
      return worksiteRefusal(
        "stale_observation",
        "worksite subject changed before atomic commit",
        atCommit,
      );
    }
    if (atCommitLocus.parent.fileIdentity !==
        initialLocus.parent.fileIdentity ||
      atCommitLocus.targetFileIdentity !== initialLocus.targetFileIdentity) {
      return worksiteRefusal(
        "stale_observation",
        "worksite parent or O0 physical identity changed before atomic commit",
        atCommit,
      );
    }
    const commitStaging = await inspectStagingFile(
      temporaryPath,
      initialLocus.parent,
    );
    if ("kind" in commitStaging) return commitStaging;
    if (commitStaging.fileIdentity !== staged.fileIdentity ||
      commitStaging.bytes.byteLength !== input.request.replacementByteLength ||
      sha256Bytes(commitStaging.bytes) !== input.request.replacementDigest) {
      return worksiteRefusal(
        "replacement_invalid",
        "worksite staging identity or bytes changed before atomic commit",
        atCommit,
      );
    }
    const commitParent = await inspectPhysicalDirectory(parentPath);
    if ("kind" in commitParent) return commitParent;
    if (commitParent.fileIdentity !== initialLocus.parent.fileIdentity) {
      return worksiteRefusal(
        "stale_observation",
        "worksite commit parent changed at publication",
        atCommit,
      );
    }
    const publicationLocus = await inspectCommitLocus(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
      subject,
      target,
    );
    if ("kind" in publicationLocus) return publicationLocus;
    if (!sameCanonical(publicationLocus.observation, predecessorObservation) ||
      publicationLocus.parent.fileIdentity !==
        initialLocus.parent.fileIdentity ||
      publicationLocus.targetFileIdentity !== initialLocus.targetFileIdentity) {
      return worksiteRefusal(
        "stale_observation",
        "worksite parent or atomic O0 identity changed at publication",
        publicationLocus.observation,
      );
    }
    if (predecessorObservation.state === "absent") {
      await link(temporaryPath, target.targetPath);
      try {
        await unlink(temporaryPath);
        temporaryPresent = false;
      } catch (cleanupError) {
        const publishedStatus = await lstat(target.targetPath);
        const stagingStatus = await lstat(temporaryPath);
        if (`${publishedStatus.dev}:${publishedStatus.ino}` ===
            `${stagingStatus.dev}:${stagingStatus.ino}`) {
          await unlink(target.targetPath);
        }
        throw cleanupError;
      }
    } else {
      await rename(temporaryPath, target.targetPath);
      temporaryPresent = false;
    }

    const successor = await observeWorksiteSubject(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
      subject,
    );
    if (!isWorksiteObservation(successor) || successor.state !== "file") {
      return isWorksiteObservation(successor)
        ? worksiteRefusal(
          "successor_observation_mismatch",
          "atomic replacement did not produce one regular-file successor observation",
          successor,
        )
        : successor;
    }
    if (
      successor.fileDigest !== input.request.replacementDigest ||
      successor.byteLength !== input.request.replacementByteLength
    ) {
      return worksiteRefusal(
        "successor_observation_mismatch",
        "successor observation does not reproduce the committed replacement bytes",
        successor,
      );
    }
    const receipt = constructWorksiteFileReplaceReceipt(
      input.authorization,
      predecessorObservation,
      successor,
      input.request.replacementDigest,
    );
    if (receipt.kind !== "worksite_file_replace_receipt") return receipt;
    return deepFreeze({
      kind: "worksite_file_replace_result" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "committed" as const,
      effectUri: WORKSITE_FILE_REPLACE_EFFECT_URI,
      receipt,
      successorObservation: successor,
    });
  } catch (error) {
    return worksiteRefusal(
      "filesystem_refused",
      `atomic worksite replacement failed before commit: ${String(error)}`,
      immediate,
      errnoCode(error),
    );
  } finally {
    if (temporaryPresent) {
      try {
        const status = await lstat(temporaryPath);
        if (`${status.dev}:${status.ino}` === temporaryFileIdentity) {
          await unlink(temporaryPath);
        }
      } catch {
        // Cleanup never acquires authority over a substituted path.
      }
    }
  }
}
