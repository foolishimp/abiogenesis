// Implements: REQ-F-ODDSDLC-040

import type { NodePackageIdentity, PackedNodePackage } from "../package_binding/index.js";

export interface OddSdlcTypescriptReleaseCutRequest {
  readonly kind: "odd_sdlc_typescript_release_cut_request";
  readonly packageSourceRoot: string;
  readonly archiveRoot: string;
}

export interface OddSdlcTypescriptReleaseCutManifest {
  readonly kind: "odd_sdlc_typescript_release_cut_manifest";
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageSourceRoot: string;
  readonly archiveRoot: string;
  readonly tarballPath: string;
  readonly releaseManifestPath: string;
  readonly binaryBinding: {
    readonly commandName: "odd-sdlc-ts";
    readonly relativePackageCommandPath: string;
    readonly sourceCommandPath: string;
  };
  readonly packageIdentity: NodePackageIdentity;
}

export interface OddSdlcTypescriptReleaseCutOutcome {
  readonly kind: "odd_sdlc_typescript_release_cut";
  readonly request: OddSdlcTypescriptReleaseCutRequest;
  readonly packedPackage: PackedNodePackage;
  readonly manifest: OddSdlcTypescriptReleaseCutManifest;
  readonly releaseManifestPath: string;
  readonly postmortemPath: string;
}

export interface OddSdlcTypescriptReleaseSnapshotRequest {
  readonly kind: "odd_sdlc_typescript_release_snapshot_request";
  readonly releaseIdentity: string;
  readonly packageSourceRoot: string;
  readonly snapshotRoot: string;
  readonly sourceRef: string | null;
  readonly sourceCommit: string | null;
  readonly sourceDirty: boolean | null;
  readonly allowDirtySource: boolean;
  readonly rcBranch: string | null;
  readonly releaseNotePath: string | null;
  readonly expectedPackageName: string | null;
  readonly expectedPackageVersion: string | null;
  readonly runBuild: boolean;
  readonly npmCacheRoot: string | null;
  readonly createdAt: string | null;
}

export interface OddSdlcTypescriptReleaseSnapshotPackageIdentity {
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packagePrivate: boolean;
}

export interface OddSdlcTypescriptReleaseSnapshotAbgSubstrate {
  readonly packageName: "@abiogenesis/typescript-tenant";
  readonly packageVersion: string;
  readonly dependencyRef: string;
  readonly snapshotRoot: string;
  readonly manifestPath: string;
  readonly tarballPath: string;
  readonly tarballSha256: string;
  readonly sourceRef: string | null;
  readonly sourceCommit: string | null;
}

export interface OddSdlcTypescriptReleaseSnapshotPackSummary {
  readonly filename: string;
  readonly packageSizeBytes: number;
  readonly unpackedSizeBytes: number;
  readonly npmShasum: string;
  readonly npmIntegrity: string;
  readonly totalFiles: number;
}

export interface OddSdlcTypescriptReleaseSnapshotCommandResult {
  readonly command: readonly string[];
  readonly cwd: string;
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

export type OddSdlcTypescriptReleaseSnapshotArtifactKind =
  | "package_tarball"
  | "release_note"
  | "snapshot_manifest"
  | "checksum_file";

export interface OddSdlcTypescriptReleaseSnapshotArtifactRef {
  readonly kind: OddSdlcTypescriptReleaseSnapshotArtifactKind;
  readonly relativePath: string;
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
}

export type OddSdlcTypescriptLegacyReleaseSnapshotArtifactKind =
  | "package_tarball"
  | "release_note"
  | "snapshot_manifest"
  | "legacy_release_cut_manifest"
  | "legacy_release_cut_postmortem"
  | "legacy_proof_artifact";

export interface OddSdlcTypescriptLegacyReleaseSnapshotArtifactRef {
  readonly kind: OddSdlcTypescriptLegacyReleaseSnapshotArtifactKind;
  readonly relativePath: string;
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface OddSdlcTypescriptLegacyReleaseSnapshotManifest {
  readonly kind: "odd_sdlc_legacy_release_snapshot_manifest";
  readonly releaseIdentity: string;
  readonly package: OddSdlcTypescriptReleaseSnapshotPackageIdentity;
  readonly migratedFrom: string;
  readonly migratedAt: string;
  readonly legacyAbgSubstrateRecorded: false;
  readonly legacyAbgSubstrateNote: string;
  readonly legacyReleaseCutManifest: OddSdlcTypescriptLegacyReleaseSnapshotArtifactRef;
  readonly sourcePackageRoot: string;
  readonly legacyArchiveRoot: string;
  readonly snapshotRoot: string;
  readonly tarball: OddSdlcTypescriptLegacyReleaseSnapshotArtifactRef;
  readonly releaseNote: OddSdlcTypescriptLegacyReleaseSnapshotArtifactRef;
  readonly legacyArtifacts: readonly OddSdlcTypescriptLegacyReleaseSnapshotArtifactRef[];
  readonly checksumFile: "checksums.sha256";
}

export interface OddSdlcTypescriptReleaseSnapshotManifest {
  readonly kind: "odd_sdlc_release_snapshot_manifest";
  readonly releaseIdentity: string;
  readonly package: OddSdlcTypescriptReleaseSnapshotPackageIdentity;
  readonly abgSubstrate: OddSdlcTypescriptReleaseSnapshotAbgSubstrate;
  readonly sourceRef: string;
  readonly sourceCommit: string;
  readonly sourceDirty: boolean;
  readonly rcBranch: string | null;
  readonly packageSourceRoot: string;
  readonly snapshotRoot: string;
  readonly createdAt: string;
  readonly build: OddSdlcTypescriptReleaseSnapshotCommandResult | null;
  readonly pack: OddSdlcTypescriptReleaseSnapshotCommandResult;
  readonly packSummary: OddSdlcTypescriptReleaseSnapshotPackSummary;
  readonly tarball: OddSdlcTypescriptReleaseSnapshotArtifactRef;
  readonly releaseNote: OddSdlcTypescriptReleaseSnapshotArtifactRef | null;
  readonly checksumFile: string;
}

export type OddSdlcTypescriptReleaseSnapshotGapKind =
  | "dirty_source_tree"
  | "package_name_mismatch"
  | "package_version_mismatch"
  | "release_identity_mismatch"
  | "snapshot_root_exists"
  | "release_note_missing"
  | "abg_release_snapshot_missing"
  | "abg_release_snapshot_mismatch"
  | "build_failed"
  | "pack_failed"
  | "pack_output_invalid"
  | "snapshot_write_failed";

export interface OddSdlcTypescriptReleaseSnapshotGapRef {
  readonly kind: OddSdlcTypescriptReleaseSnapshotGapKind;
  readonly ref: string;
}

export interface OddSdlcTypescriptReleaseSnapshotCreated {
  readonly kind: "created";
  readonly releaseIdentity: string;
  readonly snapshotRoot: string;
  readonly manifestPath: string;
  readonly checksumPath: string;
  readonly artifacts: readonly OddSdlcTypescriptReleaseSnapshotArtifactRef[];
  readonly manifest: OddSdlcTypescriptReleaseSnapshotManifest;
}

export interface OddSdlcTypescriptReleaseSnapshotRejected {
  readonly kind: "rejected";
  readonly releaseIdentity: string;
  readonly snapshotRoot: string;
  readonly reason: string;
  readonly gaps: readonly OddSdlcTypescriptReleaseSnapshotGapRef[];
  readonly build: OddSdlcTypescriptReleaseSnapshotCommandResult | null;
  readonly pack: OddSdlcTypescriptReleaseSnapshotCommandResult | null;
}

export type OddSdlcTypescriptReleaseSnapshotOutcome =
  | OddSdlcTypescriptReleaseSnapshotCreated
  | OddSdlcTypescriptReleaseSnapshotRejected;
