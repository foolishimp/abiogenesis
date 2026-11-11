import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { hasExactKeys, isNonblankString } from "../shared/admission_predicates.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "./contracts.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "./worksite_command_execution_identity.js";
import { WORKSITE_REVISION_IDS } from "./worksite_revision_identity.js";
import { WORKSITE_COMMAND_FORWARD_IDS } from "./worksite_command_forward_identity.js";

// The launch identity of one C2 command attempt. The Worker writes the launch
// manifest beside the task manifest; the helper process reads it from disk and
// re-admits it with these same rules. This module imports only identity
// constants and shared value rules, so the helper's start-up graph stays small.

/** @internal The C2 occurrence a launch carries: the leaf coordinates and no execution authority. */
export type AuthorityFreeWorksiteCommandExecutionOccurrence = {
  readonly cCallRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly programLocusRef: string;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly executionAuthority: null;
};

/** @internal The launch manifest: its body, the body's digest and the reference over that digest. */
export type WorksiteCommandExecutionLaunchManifest = {
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
  readonly implementationRef: string;
  readonly implementationBindingRef: string;
  readonly packageName: typeof ABI5_PACKAGE_NAME;
  readonly packageVersion: typeof ABI5_PACKAGE_VERSION;
};

const COMMAND_LOCI: readonly string[] = [
  WORKSITE_COMMAND_EXECUTION_IDS.nodeRef, WORKSITE_REVISION_IDS.nodeRef, WORKSITE_COMMAND_FORWARD_IDS.nodeRef,
];

/** @internal One exact authority-free occurrence at a C2 command locus. */
export function isAuthorityFreeWorksiteCommandOccurrence(
  value: unknown,
): value is AuthorityFreeWorksiteCommandExecutionOccurrence {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const row = value as Readonly<Record<string, unknown>>;
  return hasExactKeys(row, [
    "attempt", "cCallRef", "executionAuthority", "frameId", "graphCallId",
    "programLocusRef", "runId", "taskOrdinal",
  ]) && isNonblankString(row.cCallRef) && isNonblankString(row.runId) &&
    isNonblankString(row.graphCallId) && isNonblankString(row.frameId) &&
    COMMAND_LOCI.includes(row.programLocusRef as string) &&
    (row.taskOrdinal === null || Number.isSafeInteger(row.taskOrdinal) && Number(row.taskOrdinal) >= 0) &&
    Number.isSafeInteger(row.attempt) && Number(row.attempt) >= 1 &&
    row.executionAuthority === null;
}

/** The attempt identity: the digest of the six occurrence coordinates. */
export function worksiteCommandExecutionAttemptRef(occurrence: Readonly<{
  cCallRef: string; runId: string; graphCallId: string; frameId: string; taskOrdinal: number | null; attempt: number;
}>): string {
  const digest = sha256Canonical({ cCallRef: occurrence.cCallRef, runId: occurrence.runId,
    graphCallId: occurrence.graphCallId, frameId: occurrence.frameId,
    taskOrdinal: occurrence.taskOrdinal, attempt: occurrence.attempt });
  return `worksite-command-attempt://abiogenesis/${digest.slice("sha256:".length)}`;
}

/** The implementation a launch names, chosen by its command locus. */
function worksiteCommandLaunchImplementation(programLocusRef: string): Readonly<{
  implementationRef: string; implementationBindingRef: string;
}> {
  const ids = programLocusRef === WORKSITE_COMMAND_FORWARD_IDS.nodeRef ? WORKSITE_COMMAND_FORWARD_IDS
    : programLocusRef === WORKSITE_COMMAND_EXECUTION_IDS.nodeRef ? WORKSITE_COMMAND_EXECUTION_IDS : WORKSITE_REVISION_IDS;
  return { implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef };
}

/** @internal The launch manifest over its inputs. The attempt reference and the
 * occurrence, attempt and body digests are derived here; the implementation
 * follows the occurrence's locus; the package is this package. */
export function constructWorksiteCommandExecutionLaunchManifest(input: Readonly<{
  taskRef: string; taskDigest: Sha256Digest; taskManifestPath: string; taskManifestDigest: Sha256Digest;
  taskManifestByteLength: number; occurrence: AuthorityFreeWorksiteCommandExecutionOccurrence;
  archiveRoot: string; attemptRoot: string; launchManifestPath: string; helperModulePath: string;
}>): WorksiteCommandExecutionLaunchManifest {
  const attemptRef = worksiteCommandExecutionAttemptRef(input.occurrence);
  const body = {
    kind: "worksite_command_execution_launch_manifest" as const,
    schemaVersion: "5.0.0" as const,
    taskRef: input.taskRef,
    taskDigest: input.taskDigest,
    taskManifestPath: input.taskManifestPath,
    taskManifestDigest: input.taskManifestDigest,
    taskManifestByteLength: input.taskManifestByteLength,
    occurrence: input.occurrence,
    occurrenceDigest: sha256Canonical(input.occurrence),
    attemptRef,
    attemptDigest: sha256Canonical({ attemptRef }),
    archiveRoot: input.archiveRoot,
    attemptRoot: input.attemptRoot,
    launchManifestPath: input.launchManifestPath,
    helperModulePath: input.helperModulePath,
    ...worksiteCommandLaunchImplementation(input.occurrence.programLocusRef),
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
  } as const;
  const launchManifestDigest = sha256Canonical(body);
  return {
    ...body,
    launchManifestRef: `worksite-command-launch-manifest://abiogenesis/${launchManifestDigest.slice("sha256:".length)}`,
    launchManifestDigest,
  };
}
