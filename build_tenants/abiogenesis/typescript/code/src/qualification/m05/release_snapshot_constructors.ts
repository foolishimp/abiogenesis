import type {
  ReleaseSnapshotArtifactRef,
  ReleaseSnapshotCommandResult,
  ReleaseSnapshotCreated,
  ReleaseSnapshotGapKind,
  ReleaseSnapshotGapRef,
  ReleaseSnapshotManifest,
  ReleaseSnapshotOutcome,
  ReleaseSnapshotPackSummary,
  ReleaseSnapshotPackageIdentity,
  ReleaseSnapshotRejected,
  ReleaseSnapshotRequest
} from "./release_snapshot_carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeArtifacts(
  values: readonly ReleaseSnapshotArtifactRef[]
): readonly ReleaseSnapshotArtifactRef[] {
  return Object.freeze(values.map((entry) => constructReleaseSnapshotArtifactRef(entry)));
}

function freezeGaps(
  values: readonly ReleaseSnapshotGapRef[]
): readonly ReleaseSnapshotGapRef[] {
  return Object.freeze(values.map((entry) => constructReleaseSnapshotGapRef(entry.kind, entry.ref)));
}

export function constructReleaseSnapshotRequest(
  input: ReleaseSnapshotRequest
): ReleaseSnapshotRequest {
  return Object.freeze({
    releaseIdentity: input.releaseIdentity,
    packageSourceRoot: input.packageSourceRoot,
    snapshotRoot: input.snapshotRoot,
    sourceRef: input.sourceRef,
    sourceCommit: input.sourceCommit,
    sourceDirty: input.sourceDirty,
    allowDirtySource: input.allowDirtySource,
    rcBranch: input.rcBranch,
    releaseNotePath: input.releaseNotePath,
    expectedPackageName: input.expectedPackageName,
    expectedPackageVersion: input.expectedPackageVersion,
    runBuild: input.runBuild,
    npmCacheRoot: input.npmCacheRoot,
    createdAt: input.createdAt
  });
}

export function constructReleaseSnapshotPackageIdentity(
  input: ReleaseSnapshotPackageIdentity
): ReleaseSnapshotPackageIdentity {
  return Object.freeze({
    packageName: input.packageName,
    packageVersion: input.packageVersion,
    packagePrivate: input.packagePrivate
  });
}

export function constructReleaseSnapshotPackSummary(
  input: ReleaseSnapshotPackSummary
): ReleaseSnapshotPackSummary {
  return Object.freeze({
    filename: input.filename,
    packageSizeBytes: input.packageSizeBytes,
    unpackedSizeBytes: input.unpackedSizeBytes,
    npmShasum: input.npmShasum,
    npmIntegrity: input.npmIntegrity,
    totalFiles: input.totalFiles
  });
}

export function constructReleaseSnapshotCommandResult(
  input: ReleaseSnapshotCommandResult
): ReleaseSnapshotCommandResult {
  return Object.freeze({
    command: freezeStringArray(input.command),
    cwd: input.cwd,
    status: input.status,
    stdout: input.stdout,
    stderr: input.stderr
  });
}

export function constructReleaseSnapshotArtifactRef(
  input: ReleaseSnapshotArtifactRef
): ReleaseSnapshotArtifactRef {
  return Object.freeze({
    kind: input.kind,
    relativePath: input.relativePath,
    path: input.path,
    bytes: input.bytes,
    sha256: input.sha256
  });
}

export function constructReleaseSnapshotManifest(
  input: ReleaseSnapshotManifest
): ReleaseSnapshotManifest {
  return Object.freeze({
    kind: "abg_release_snapshot_manifest",
    releaseIdentity: input.releaseIdentity,
    package: constructReleaseSnapshotPackageIdentity(input.package),
    sourceRef: input.sourceRef,
    sourceCommit: input.sourceCommit,
    sourceDirty: input.sourceDirty,
    rcBranch: input.rcBranch,
    packageSourceRoot: input.packageSourceRoot,
    snapshotRoot: input.snapshotRoot,
    createdAt: input.createdAt,
    build:
      input.build === null
        ? null
        : constructReleaseSnapshotCommandResult(input.build),
    pack: constructReleaseSnapshotCommandResult(input.pack),
    packSummary: constructReleaseSnapshotPackSummary(input.packSummary),
    tarball: constructReleaseSnapshotArtifactRef(input.tarball),
    releaseNote:
      input.releaseNote === null
        ? null
        : constructReleaseSnapshotArtifactRef(input.releaseNote),
    checksumFile: input.checksumFile
  });
}

export function constructReleaseSnapshotGapRef(
  kind: ReleaseSnapshotGapKind,
  ref: string
): ReleaseSnapshotGapRef {
  return Object.freeze({
    kind,
    ref
  });
}

export function constructReleaseSnapshotCreatedOutcome(input: {
  readonly releaseIdentity: string;
  readonly snapshotRoot: string;
  readonly manifestPath: string;
  readonly checksumPath: string;
  readonly artifacts: readonly ReleaseSnapshotArtifactRef[];
  readonly manifest: ReleaseSnapshotManifest;
}): ReleaseSnapshotCreated {
  return Object.freeze({
    kind: "created",
    releaseIdentity: input.releaseIdentity,
    snapshotRoot: input.snapshotRoot,
    manifestPath: input.manifestPath,
    checksumPath: input.checksumPath,
    artifacts: freezeArtifacts(input.artifacts),
    manifest: constructReleaseSnapshotManifest(input.manifest)
  });
}

export function constructReleaseSnapshotRejectedOutcome(input: {
  readonly releaseIdentity: string;
  readonly snapshotRoot: string;
  readonly reason: string;
  readonly gaps: readonly ReleaseSnapshotGapRef[];
  readonly build: ReleaseSnapshotCommandResult | null;
  readonly pack: ReleaseSnapshotCommandResult | null;
}): ReleaseSnapshotRejected {
  return Object.freeze({
    kind: "rejected",
    releaseIdentity: input.releaseIdentity,
    snapshotRoot: input.snapshotRoot,
    reason: input.reason,
    gaps: freezeGaps(input.gaps),
    build:
      input.build === null
        ? null
        : constructReleaseSnapshotCommandResult(input.build),
    pack:
      input.pack === null
        ? null
        : constructReleaseSnapshotCommandResult(input.pack)
  });
}

export function constructReleaseSnapshotOutcome(
  outcome: ReleaseSnapshotOutcome
): ReleaseSnapshotOutcome {
  return Object.freeze({
    ...outcome
  });
}
