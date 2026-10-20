import { isRecord } from "../shared/admission_predicates.js";
import { constants } from "node:fs";
import {
  lstat,
  link,
  mkdir,
  open,
  readdir,
  realpath,
  rename,
  unlink,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
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
  postPublicationWorksiteFailure,
  worksiteSubjectWithinTerritory,
  type FileWorksiteObservation,
  type WorksiteEffectAuthorization,
  type WorksiteEffectRefusal,
  type WorksiteFileReplaceReceipt,
  type WorksiteFileReplaceRequest,
  type WorksiteObservation,
  type WorksiteSubject,
  type WorksiteTerritory,
  type WorksitePublicationFacts,
  type WorksitePostPublicationDiagnostic,
  type WorksitePhysicalOutcome,
  constructWorksiteFileParentsRequest,
  constructWorksiteFileParentsAuthorization,
  constructWorksiteFileParentsSuccess,
  isWorksiteFileParentsRequest,
  isWorksiteFileParentsAuthorization,
  isWorksiteContextObservation,
  normalizeWorksiteRelativePath,
  worksiteFileParentPaths,
  worksiteFileParentsFailure,
  type WorksiteFileParentsRequestInput,
  type WorksiteFileParentsRequest,
  type WorksiteFileParentsAuthorization,
  type WorksiteFileParentsResult,
  type WorksiteAncestorObservation,
  type WorksiteFileParentOutcome,
  type WorksiteContextEntry,
  type WorksiteContextObservation,
} from "./worksite_effect.js";

export interface WorksiteFileReplaceInput {
  /** Admitted owner roots supplied only by the guarded internal writer. */
  readonly protectedInstallRoots?: readonly string[];
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
  protectedInstallRoots: readonly string[] = [],
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
      [...Object.values(workspaceBinding.roots), ...protectedInstallRoots].map(plannedCanonicalPath),
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
  let inspected: WorksiteEffectRefusal | { readonly fileIdentity: string; readonly bytes: Uint8Array };
  try {
    handle = await open(
      target.targetPath,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    const status = await handle.stat();
    if (!status.isFile()) {
      inspected = worksiteRefusal(
        "target_not_file",
        "worksite subject changed to a non-file during observation",
      );
    } else if (status.nlink !== 1) {
      inspected = worksiteRefusal(
        "aliased_subject",
        "worksite subject must not share its file identity with another hard link",
      );
    } else {
      const bytes = await handle.readFile();
      inspected = { fileIdentity: `${status.dev}:${status.ino}`, bytes };
    }
  } catch (error) {
    inspected = worksiteRefusal(
      errnoCode(error) === "ELOOP" ? "symlink_forbidden" : "filesystem_refused",
      `worksite file observation failed: ${String(error)}`,
      null,
      errnoCode(error),
    );
  }
  try {
    await handle?.close();
  } catch (error) {
    const closeCode = errnoCode(error);
    const closeMessage = `worksite file observation close failed (${closeCode ?? "unknown"}): ${String(error)}`;
    inspected = "kind" in inspected
      ? worksiteRefusal(inspected.code, `${inspected.message}; secondary ${closeMessage}`,
          inspected.lastObservation, inspected.substrateCode)
      : worksiteRefusal("filesystem_refused", closeMessage, null, closeCode);
  }
  return inspected;
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
  protectedInstallRoots: readonly string[] = [],
): Promise<WorksiteCommitLocus | WorksiteEffectRefusal> {
  const target = await resolveWorksiteTarget(
    workspaceAuthorityBasis,
    workspaceBinding,
    subject,
    protectedInstallRoots,
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
    input.protectedInstallRoots,
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
    input.protectedInstallRoots,
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
  let publication: WorksitePublicationFacts | null = null;
  let compensation: Extract<WorksitePhysicalOutcome, { kind: "publication_only" }>["compensation"] = "not_attempted";
  let stagingCleanup: Extract<WorksitePhysicalOutcome, { kind: "publication_only" }>["stagingCleanup"] = "removed";
  let postPublicationObservation: WorksiteObservation | null = null;
  const diagnostics: WorksitePostPublicationDiagnostic[] = [];
  const diagnostic = (stage: WorksitePostPublicationDiagnostic["stage"], refusal: WorksiteEffectRefusal): void => {
    diagnostics.push({ stage, code: refusal.code, message: refusal.message, substrateCode: refusal.substrateCode });
  };
  const perform = async (): Promise<WorksiteFileReplaceResult> => {
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
      input.protectedInstallRoots,
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
      input.protectedInstallRoots,
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
      publication = {
        committed: true, method: "link", writtenDigest: input.request.replacementDigest,
        byteLength: replacement.byteLength, stagingPath: temporaryPath,
        stagingFileIdentity: temporaryFileIdentity!,
      };
      try {
        await unlink(temporaryPath);
        temporaryPresent = false;
      } catch (cleanupError) {
        stagingCleanup = "failed";
        const failure = worksiteRefusal("filesystem_refused",
          `published worksite staging cleanup failed: ${String(cleanupError)}`,
          null, errnoCode(cleanupError));
        diagnostic("staging_cleanup", failure);
        try {
          const publishedStatus = await lstat(target.targetPath);
          const stagingStatus = await lstat(temporaryPath);
          if (`${publishedStatus.dev}:${publishedStatus.ino}` === temporaryFileIdentity &&
            `${stagingStatus.dev}:${stagingStatus.ino}` === temporaryFileIdentity &&
            publishedStatus.isFile() && stagingStatus.isFile() &&
            !publishedStatus.isSymbolicLink() && !stagingStatus.isSymbolicLink()) {
            try {
              await unlink(target.targetPath);
              compensation = "succeeded";
            } catch (error) {
              compensation = "failed";
              diagnostic("target_compensation", worksiteRefusal("filesystem_refused",
                `published target compensation failed: ${String(error)}`, null, errnoCode(error)));
            }
          } else {
            compensation = "skipped_unverified_identity";
            diagnostic("target_compensation", worksiteRefusal("stale_observation",
              "target compensation skipped because published identity was not retained"));
          }
        } catch (error) {
          compensation = "skipped_unverified_identity";
          diagnostic("target_compensation", worksiteRefusal("filesystem_refused",
            `target compensation identity could not be observed: ${String(error)}`, null, errnoCode(error)));
        }
        return failure;
      }
    } else {
      await rename(temporaryPath, target.targetPath);
      publication = {
        committed: true, method: "rename", writtenDigest: input.request.replacementDigest,
        byteLength: replacement.byteLength, stagingPath: temporaryPath,
        stagingFileIdentity: temporaryFileIdentity!,
      };
      temporaryPresent = false;
      stagingCleanup = "consumed_by_rename";
    }

    const successor = await observeWorksiteSubject(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
      subject,
    );
    if (isWorksiteObservation(successor)) postPublicationObservation = successor;
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
    if (receipt.kind !== "worksite_file_replace_receipt") {
      diagnostic("successor_receipt", receipt);
      return receipt;
    }
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
      publication === null
        ? `atomic worksite replacement failed before commit: ${String(error)}`
        : `published worksite successor observation failed: ${String(error)}`,
      publication === null ? immediate : postPublicationObservation,
      errnoCode(error),
    );
  }
  };
  const outcome = await perform();
  if (publication !== null && outcome.kind === "worksite_effect_refusal" && diagnostics.length === 0) {
    diagnostic("successor_observation", outcome);
  }
  // Finish physical cleanup before freezing any post-publication failure.
    if (temporaryPresent) {
      try {
        const status = await lstat(temporaryPath);
        if (`${status.dev}:${status.ino}` === temporaryFileIdentity &&
          status.isFile() && !status.isSymbolicLink()) {
          await unlink(temporaryPath);
          stagingCleanup = "removed";
        } else if (publication !== null) {
          stagingCleanup = "skipped_unverified_identity";
          diagnostic("staging_cleanup", worksiteRefusal("stale_observation",
            "final staging cleanup skipped a substituted path"));
        }
      } catch (error) {
        if (errnoCode(error) === "ENOENT") {
          stagingCleanup = "removed";
        } else if (publication !== null) {
          stagingCleanup = "failed";
          diagnostic("staging_cleanup", worksiteRefusal("filesystem_refused",
            `final staging cleanup failed: ${String(error)}`, null, errnoCode(error)));
        }
      }
    }
  if (publication === null || outcome.kind !== "worksite_effect_refusal") return outcome;
  let stagingResidue: Extract<WorksitePhysicalOutcome, { kind: "publication_only" }>["stagingResidue"];
  try {
    const status = await lstat(temporaryPath);
    const fileIdentity = `${status.dev}:${status.ino}`;
    stagingResidue = {
      state: fileIdentity === temporaryFileIdentity && status.isFile() && !status.isSymbolicLink()
        ? "owned_file" : "other_path",
      fileIdentity,
    };
  } catch (error) {
    stagingResidue = { state: errnoCode(error) === "ENOENT" ? "absent" : "unknown", fileIdentity: null };
    if (errnoCode(error) !== "ENOENT") diagnostic("staging_residue", worksiteRefusal("filesystem_refused",
      `staging residue inspection failed: ${String(error)}`, null, errnoCode(error)));
  }
  return postPublicationWorksiteFailure(outcome, {
    kind: "publication_only", authorization: input.authorization, publication,
    compensation, stagingCleanup, stagingResidue, postPublicationObservation, diagnostics,
  });
}

interface WorksiteReadBasis {
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly protectedInstallRoots?: readonly string[];
}

async function worksiteReadRoots(input: WorksiteReadBasis): Promise<WorksiteEffectRefusal | { root: string; protectedRoots: readonly string[] }> {
  const root = input.workspaceAuthorityBasis.canonicalRoot;
  const territory = constructWorksiteTerritory({ ...input, relativeRoot: ".", territoryUri: pathToFileURL(root).href });
  if (territory.kind !== "worksite_territory") return territory;
  const inspected = await inspectPhysicalDirectory(root);
  if ("kind" in inspected) return inspected;
  try {
    const protectedRoots = await Promise.all([...Object.values(input.workspaceBinding.roots), ...(input.protectedInstallRoots ?? [])].map(plannedCanonicalPath));
    return { root, protectedRoots };
  } catch (error) { return worksiteRefusal("invalid_coordinate", `protected worksite roots cannot be resolved: ${String(error)}`, null, errnoCode(error)); }
}

function checkedWorksitePath(root: string, protectedRoots: readonly string[], path: string): string | WorksiteEffectRefusal {
  if (normalizeWorksiteRelativePath(path, true) !== path) return worksiteRefusal("invalid_relative_path", "worksite path must be normalized and relative");
  const target = resolve(root, ...path.split("/"));
  if (!confined(root, target) || protectedRoots.some(protectedRoot => confined(protectedRoot, target))) {
    return worksiteRefusal("subject_outside_territory", "worksite path escapes A or enters a protected install/runtime root");
  }
  return target;
}

/** Read only: no directory prerequisite is manufactured by observation. */
export async function observeWorksiteFileParents(input: Omit<WorksiteFileParentsRequestInput, "ancestorObservations"> & { readonly protectedInstallRoots?: readonly string[] }): Promise<WorksiteFileParentsRequest | WorksiteEffectRefusal> {
  const resolved = await worksiteReadRoots(input);
  if ("kind" in resolved) return resolved;
  const paths = worksiteFileParentPaths(input.targets);
  if (paths.length === 0) return worksiteRefusal("invalid_relative_path", "assessed file targets contain an invalid path");
  const observations: WorksiteAncestorObservation[] = [];
  const absent: string[] = [];
  for (const relativePath of paths) {
    const path = checkedWorksitePath(resolved.root, resolved.protectedRoots, relativePath);
    if (typeof path !== "string") return path;
    if (absent.some(parent => relativePath.startsWith(`${parent}/`))) {
      observations.push({ relativePath, state: "absent", fileIdentity: null });
      continue;
    }
    const observed = await inspectPhysicalDirectory(path);
    if ("kind" in observed) {
      if (relativePath !== "." && observed.substrateCode === "ENOENT") {
        absent.push(relativePath);
        observations.push({ relativePath, state: "absent", fileIdentity: null });
      } else return observed;
    } else observations.push({ relativePath, state: "directory", fileIdentity: observed.fileIdentity });
  }
  return constructWorksiteFileParentsRequest({ ...input, ancestorObservations: observations });
}

export interface WorksiteFileParentsInput extends WorksiteReadBasis {
  readonly request: WorksiteFileParentsRequest;
  readonly executionBasis: ExecutionBasis;
  readonly cCall: CCall;
  readonly implementationSet: AdmittedImplementationSet;
  readonly authorization: WorksiteFileParentsAuthorization;
}

/** Internal physical owner; the guarded selected C0 leaf is the runtime entry. */
export async function createWorksiteFileParents(input: WorksiteFileParentsInput): Promise<WorksiteFileParentsResult> {
  if (!isWorksiteFileParentsRequest(input.request) || !isWorksiteFileParentsAuthorization(input.authorization) ||
    !sameCanonical(input.workspaceAuthorityBasis, input.request.workspaceAuthorityBasis)) return worksiteRefusal("authorization_mismatch", "file parents require their own exact authorization");
  const expected = constructWorksiteFileParentsAuthorization(input);
  if (expected.kind !== "worksite_file_parents_authorization" || !sameCanonical(expected, input.authorization)) return worksiteRefusal("authorization_mismatch", "file-parent authorization does not reproduce from its basis and request");
  const { request, authorization } = input;
  const outcomes: WorksiteFileParentOutcome[] = [];
  const failed = (failure: WorksiteEffectRefusal): WorksiteFileParentsResult => worksiteFileParentsFailure(request, authorization, outcomes, failure);
  try {
    const resolved = await worksiteReadRoots(input);
    if ("kind" in resolved) return failed(resolved);
    for (const target of request.targets) {
      const path = checkedWorksitePath(resolved.root, resolved.protectedRoots, target.relativePath);
      if (typeof path !== "string") return failed(path);
    }
    const current = await observeWorksiteFileParents({ ...input, ...request });
    if (current.kind !== "worksite_file_parents_request") return failed(current);
    if (!sameCanonical(current, request)) return failed(worksiteRefusal("stale_observation", "file-parent ancestor chain changed before any effect"));
    const revalidateKnown = async (): Promise<WorksiteEffectRefusal | null> => {
      for (const outcome of outcomes) {
        const path = checkedWorksitePath(resolved.root, resolved.protectedRoots, outcome.relativePath);
        if (typeof path !== "string") return path;
        const observed = await inspectPhysicalDirectory(path);
        if ("kind" in observed) return observed;
        if (outcome.identityState !== "known" || observed.fileIdentity !== outcome.fileIdentity) return worksiteRefusal("stale_observation", "file-parent physical directory identity changed");
      }
      return null;
    };
    for (const observed of request.ancestorObservations) {
      const prior = await revalidateKnown();
      if (prior !== null) return failed(prior);
      const path = checkedWorksitePath(resolved.root, resolved.protectedRoots, observed.relativePath);
      if (typeof path !== "string") return failed(path);
      if (observed.state === "directory") {
        const actual = await inspectPhysicalDirectory(path);
        if ("kind" in actual) return failed(actual);
        if (actual.fileIdentity !== observed.fileIdentity) return failed(worksiteRefusal("stale_observation", "existing file-parent identity changed"));
        outcomes.push({ relativePath: observed.relativePath, disposition: "existing", identityState: "known", fileIdentity: actual.fileIdentity });
      } else {
        try {
          await lstat(path);
          return failed(worksiteRefusal("stale_observation", "declared absent file parent now exists"));
        } catch (error) { if (errnoCode(error) !== "ENOENT") return failed(worksiteRefusal("filesystem_refused", `file-parent absence check failed: ${String(error)}`, null, errnoCode(error))); }
        const parent = await inspectPhysicalDirectory(dirname(path));
        if ("kind" in parent) return failed(parent);
        const parentRelative = relative(resolved.root, dirname(path)).split("\\").join("/") || ".";
        if (!outcomes.some(outcome => outcome.relativePath === parentRelative && outcome.identityState === "known" && outcome.fileIdentity === parent.fileIdentity)) {
          return failed(worksiteRefusal("stale_observation", "actual mkdir parent no longer matches its retained directory identity"));
        }
        try { await mkdir(path); }
        catch (error) { return failed(worksiteRefusal(errnoCode(error) === "EEXIST" ? "stale_observation" : "filesystem_refused", `nonrecursive file-parent mkdir failed: ${String(error)}`, null, errnoCode(error))); }
        // The syscall fact is retained before any fallible identity verification.
        outcomes.push({ relativePath: observed.relativePath, disposition: "created", identityState: "unknown", fileIdentity: null });
        const created = await inspectPhysicalDirectory(path);
        if ("kind" in created) return failed(created);
        outcomes[outcomes.length - 1] = { relativePath: observed.relativePath, disposition: "created", identityState: "known", fileIdentity: created.fileIdentity };
      }
    }
    const final = await revalidateKnown();
    if (final !== null) return failed(final);
    const success = constructWorksiteFileParentsSuccess(request, authorization, outcomes);
    return success.kind === "worksite_file_parents_result" ? success : failed(success);
  } catch (error) {
    return failed(worksiteRefusal("filesystem_refused", `file-parent owner failed: ${String(error)}`, null, errnoCode(error)));
  }
}

export interface WorksiteContextInput extends WorksiteReadBasis {
  readonly readRoots: readonly string[];
  /** Bounds every observed entry, including directories and absent roots. */
  readonly maxFiles: number;
  readonly maxBytes: number;
}

/** Complete for its declared read roots or refused; replay consumes these bytes. */
export async function observeWorksiteContext(input: WorksiteContextInput): Promise<WorksiteContextObservation | WorksiteEffectRefusal> {
  if (!Array.isArray(input.readRoots) || input.readRoots.length === 0 || new Set(input.readRoots).size !== input.readRoots.length ||
    input.readRoots.some(path => normalizeWorksiteRelativePath(path, true) !== path) || !Number.isSafeInteger(input.maxFiles) || input.maxFiles < 1 ||
    !Number.isSafeInteger(input.maxBytes) || input.maxBytes < 0) return worksiteRefusal("invalid_coordinate", "worksite context requires finite explicit limits and exact relative read roots");
  const resolved = await worksiteReadRoots(input);
  if ("kind" in resolved) return resolved;
  const entries = new Map<string, WorksiteContextEntry>();
  let totalBytes = 0;
  const visit = async (relativePath: string): Promise<WorksiteEffectRefusal | null> => {
    if (entries.has(relativePath)) return null;
    if (entries.size >= input.maxFiles) return worksiteRefusal("filesystem_refused", "worksite context entry limit exceeded; no truncated observation is returned");
    const path = checkedWorksitePath(resolved.root, resolved.protectedRoots, relativePath);
    if (typeof path !== "string") return path;
    let status;
    try { status = await lstat(path); }
    catch (error) {
      if (errnoCode(error) === "ENOENT") { entries.set(relativePath, { relativePath, state: "absent" }); return null; }
      throw error;
    }
    if (status.isSymbolicLink()) return worksiteRefusal("symlink_forbidden", "worksite context cannot follow a symlink");
    if (await realpath(path) !== path) return worksiteRefusal("aliased_subject", "worksite context requires canonical path spelling");
    const fileIdentity = `${status.dev}:${status.ino}`;
    if (status.isDirectory()) {
      const members = (await readdir(path)).sort();
      entries.set(relativePath, { relativePath, state: "directory", fileIdentity, members });
      if (members.filter(member => !entries.has(relativePath === "." ? member : `${relativePath}/${member}`)).length > input.maxFiles - entries.size) return worksiteRefusal("filesystem_refused", "worksite context directory membership exceeds entry limit");
      for (const member of members) {
        const failure = await visit(relativePath === "." ? member : `${relativePath}/${member}`);
        if (failure !== null) return failure;
      }
      const after = await inspectPhysicalDirectory(path);
      if ("kind" in after) return after;
      if (after.fileIdentity !== fileIdentity || !sameCanonical(members, (await readdir(path)).sort())) return worksiteRefusal("stale_observation", "worksite directory changed during context observation");
      return null;
    }
    if (!status.isFile()) return worksiteRefusal("target_not_file", "worksite context admits only concrete directories and regular files");
    if (status.nlink !== 1) return worksiteRefusal("aliased_subject", "worksite context file has another hard link");
    if (status.size > input.maxBytes - totalBytes) return worksiteRefusal("filesystem_refused", "worksite context byte limit exceeded");
    const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    let bytes: Buffer;
    try {
      const before = await handle.stat();
      if (!before.isFile() || before.nlink !== 1 || `${before.dev}:${before.ino}` !== fileIdentity) return worksiteRefusal("stale_observation", "context file identity changed before reading");
      const chunks: Buffer[] = [];
      let length = 0;
      while (true) {
        const buffer = Buffer.alloc(Math.min(65536, input.maxBytes - totalBytes - length + 1));
        const read = await handle.read(buffer, 0, buffer.length, null);
        if (read.bytesRead === 0) break;
        length += read.bytesRead;
        if (length > input.maxBytes - totalBytes) return worksiteRefusal("filesystem_refused", "worksite context byte limit exceeded during reading");
        chunks.push(buffer.subarray(0, read.bytesRead));
      }
      bytes = Buffer.concat(chunks);
      const after = await handle.stat();
      if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs || bytes.length !== after.size) return worksiteRefusal("stale_observation", "context file changed during reading");
    } finally { await handle.close(); }
    const afterPath = await lstat(path);
    if (!afterPath.isFile() || afterPath.nlink !== 1 || `${afterPath.dev}:${afterPath.ino}` !== fileIdentity || await realpath(path) !== path) return worksiteRefusal("stale_observation", "context file path changed during reading");
    totalBytes += bytes.length;
    entries.set(relativePath, { relativePath, state: "file", fileIdentity, byteLength: bytes.length, digest: sha256Bytes(bytes), encoding: "base64", bytes: bytes.toString("base64") });
    return null;
  };
  try {
    for (const root of input.readRoots) {
      // Check every existing path component before descending into a selected root.
      const segments = root === "." ? [] : root.split("/");
      for (let count = 0; count < segments.length; count += 1) {
        const parent = segments.slice(0, count).join("/") || ".";
        const path = checkedWorksitePath(resolved.root, resolved.protectedRoots, parent);
        if (typeof path !== "string") return path;
        const inspected = await inspectPhysicalDirectory(path);
        if ("kind" in inspected && inspected.substrateCode !== "ENOENT") return inspected;
        if ("kind" in inspected) break;
      }
      const failure = await visit(root);
      if (failure !== null) return failure;
    }
    const body = {
      workspaceAuthorityBasisRef: input.workspaceAuthorityBasis.authorityBasisId,
      workspaceAuthorityBasisDigest: input.workspaceAuthorityBasis.authorityBasisDigest,
      workspaceBindingIdentity: input.workspaceBinding.bindingId, workspaceBindingDigest: input.workspaceBinding.bindingDigest,
      readRoots: input.readRoots, maxFiles: input.maxFiles, maxBytes: input.maxBytes,
      entries: [...entries.values()].sort((a, b) => a.relativePath < b.relativePath ? -1 : a.relativePath > b.relativePath ? 1 : 0),
    };
    const observationDigest = sha256Canonical(body as unknown as JsonValue);
    const observation = deepFreeze({ kind: "worksite_context_observation" as const, schemaVersion: "5.0.0" as const,
      observationRef: `worksite-context-observation://abiogenesis/${observationDigest.slice("sha256:".length)}`, observationDigest, ...body });
    return isWorksiteContextObservation(observation) ? observation : worksiteRefusal("stale_observation", "worksite context did not produce a complete closed observation");
  } catch (error) { return worksiteRefusal("filesystem_refused", `worksite context observation failed: ${String(error)}`, null, errnoCode(error)); }
}
