export interface ReleaseSnapshotRequest {
  readonly releaseIdentity: string;
  readonly packageSourceRoot: string;
  readonly snapshotRoot: string;
  readonly sourceRef: string;
  readonly sourceCommit: string;
  readonly sourceDirty: boolean;
  readonly allowDirtySource: boolean;
  readonly rcBranch: string | null;
  readonly releaseNotePath: string | null;
  readonly expectedPackageName: string | null;
  readonly expectedPackageVersion: string | null;
  readonly runBuild: boolean;
  readonly runLint: boolean;
  readonly runTests: boolean;
  readonly npmCacheRoot: string | null;
  readonly createdAt: string;
}

// Parsed node:test summary lines from the tests gate — the manifest's
// self-certifying record of what the suite reported at snapshot time.
export interface ReleaseSnapshotTestSummary {
  readonly tests: number;
  readonly pass: number;
  readonly fail: number;
  readonly skipped: number;
}

export interface ReleaseSnapshotPackageIdentity {
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packagePrivate: boolean;
}

export interface ReleaseSnapshotPackSummary {
  readonly filename: string;
  readonly packageSizeBytes: number;
  readonly unpackedSizeBytes: number;
  readonly npmShasum: string;
  readonly npmIntegrity: string;
  readonly totalFiles: number;
}

export interface ReleaseSnapshotCommandResult {
  readonly command: readonly string[];
  readonly cwd: string;
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

export type ReleaseSnapshotArtifactKind =
  | "package_tarball"
  | "release_note"
  | "snapshot_manifest"
  | "checksum_file";

export interface ReleaseSnapshotArtifactRef {
  readonly kind: ReleaseSnapshotArtifactKind;
  readonly relativePath: string;
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface ReleaseSnapshotManifest {
  readonly kind: "abg_release_snapshot_manifest";
  readonly releaseIdentity: string;
  readonly package: ReleaseSnapshotPackageIdentity;
  readonly sourceRef: string;
  readonly sourceCommit: string;
  readonly sourceDirty: boolean;
  readonly rcBranch: string | null;
  readonly packageSourceRoot: string;
  readonly snapshotRoot: string;
  readonly createdAt: string;
  readonly build: ReleaseSnapshotCommandResult | null;
  readonly lint: ReleaseSnapshotCommandResult | null;
  readonly tests: ReleaseSnapshotCommandResult | null;
  readonly testSummary: ReleaseSnapshotTestSummary | null;
  readonly pack: ReleaseSnapshotCommandResult;
  readonly packSummary: ReleaseSnapshotPackSummary;
  readonly tarball: ReleaseSnapshotArtifactRef;
  readonly releaseNote: ReleaseSnapshotArtifactRef | null;
  readonly checksumFile: string;
}

export type ReleaseSnapshotGapKind =
  | "dirty_source_tree"
  | "package_name_mismatch"
  | "package_version_mismatch"
  | "release_identity_mismatch"
  | "snapshot_root_exists"
  | "release_note_missing"
  | "build_failed"
  | "lint_failed"
  | "tests_failed"
  | "test_output_unparsable"
  | "pack_failed"
  | "pack_output_invalid"
  | "snapshot_write_failed";

export interface ReleaseSnapshotGapRef {
  readonly kind: ReleaseSnapshotGapKind;
  readonly ref: string;
}

export interface ReleaseSnapshotCreated {
  readonly kind: "created";
  readonly releaseIdentity: string;
  readonly snapshotRoot: string;
  readonly manifestPath: string;
  readonly checksumPath: string;
  readonly artifacts: readonly ReleaseSnapshotArtifactRef[];
  readonly manifest: ReleaseSnapshotManifest;
}

export interface ReleaseSnapshotRejected {
  readonly kind: "rejected";
  readonly releaseIdentity: string;
  readonly snapshotRoot: string;
  readonly reason: string;
  readonly gaps: readonly ReleaseSnapshotGapRef[];
  readonly build: ReleaseSnapshotCommandResult | null;
  readonly lint: ReleaseSnapshotCommandResult | null;
  readonly tests: ReleaseSnapshotCommandResult | null;
  readonly pack: ReleaseSnapshotCommandResult | null;
}

export type ReleaseSnapshotOutcome =
  | ReleaseSnapshotCreated
  | ReleaseSnapshotRejected;
