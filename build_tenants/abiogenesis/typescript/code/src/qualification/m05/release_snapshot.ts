import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  constructReleaseSnapshotArtifactRef,
  constructReleaseSnapshotCommandResult,
  constructReleaseSnapshotCreatedOutcome,
  constructReleaseSnapshotGapRef,
  constructReleaseSnapshotManifest,
  constructReleaseSnapshotOutcome,
  constructReleaseSnapshotPackSummary,
  constructReleaseSnapshotPackageIdentity,
  constructReleaseSnapshotRejectedOutcome
} from "./release_snapshot_constructors.js";
import type {
  ReleaseSnapshotArtifactKind,
  ReleaseSnapshotArtifactRef,
  ReleaseSnapshotCommandResult,
  ReleaseSnapshotGapRef,
  ReleaseSnapshotManifest,
  ReleaseSnapshotOutcome,
  ReleaseSnapshotPackSummary,
  ReleaseSnapshotPackageIdentity,
  ReleaseSnapshotRequest
} from "./release_snapshot_carriers.js";

interface NpmPackEntry {
  readonly filename: string;
  readonly name: string;
  readonly version: string;
  readonly size: number;
  readonly unpackedSize: number;
  readonly shasum: string;
  readonly integrity: string;
  readonly fileCount: number;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function readRequiredString(
  input: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): string {
  const value = input[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label}.${key}: expected non-empty string`);
  }
  return value;
}

function readRequiredNumber(
  input: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): number {
  const value = input[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${label}.${key}: expected finite number`);
  }
  return value;
}

function readOptionalBoolean(
  input: Readonly<Record<string, unknown>>,
  key: string
): boolean {
  const value = input[key];
  return typeof value === "boolean" ? value : false;
}

function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function commandOutputText(value: string | null): string {
  return typeof value === "string" ? value : "";
}

function commandResult(input: {
  readonly command: readonly string[];
  readonly cwd: string;
  readonly status: number | null;
  readonly stdout: string | null;
  readonly stderr: string | null;
}): ReleaseSnapshotCommandResult {
  return constructReleaseSnapshotCommandResult({
    command: input.command,
    cwd: input.cwd,
    status: input.status,
    stdout: commandOutputText(input.stdout),
    stderr: commandOutputText(input.stderr)
  });
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error["code"] === "ENOENT"
    ) {
      return false;
    }
    throw error;
  }
}

async function directoryHasEntries(path: string): Promise<boolean> {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries.length > 0;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error["code"] === "ENOENT"
    ) {
      return false;
    }
    throw error;
  }
}

async function readPackageIdentity(
  packageSourceRoot: string
): Promise<ReleaseSnapshotPackageIdentity> {
  const raw = await readFile(join(packageSourceRoot, "package.json"), "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed)) {
    throw new TypeError("package.json: expected object");
  }
  return constructReleaseSnapshotPackageIdentity({
    packageName: readRequiredString(parsed, "name", "package.json"),
    packageVersion: readRequiredString(parsed, "version", "package.json"),
    packagePrivate: readOptionalBoolean(parsed, "private")
  });
}

function preflightGaps(
  request: ReleaseSnapshotRequest,
  identity: ReleaseSnapshotPackageIdentity,
  snapshotRootExists: boolean,
  snapshotRootHasEntries: boolean,
  releaseNoteExists: boolean
): readonly ReleaseSnapshotGapRef[] {
  const gaps: ReleaseSnapshotGapRef[] = [];
  if (request.sourceDirty && !request.allowDirtySource) {
    gaps.push(
      constructReleaseSnapshotGapRef("dirty_source_tree", request.sourceRef)
    );
  }
  if (
    request.expectedPackageName !== null &&
    request.expectedPackageName !== identity.packageName
  ) {
    gaps.push(
      constructReleaseSnapshotGapRef(
        "package_name_mismatch",
        `${request.expectedPackageName} != ${identity.packageName}`
      )
    );
  }
  if (
    request.expectedPackageVersion !== null &&
    request.expectedPackageVersion !== identity.packageVersion
  ) {
    gaps.push(
      constructReleaseSnapshotGapRef(
        "package_version_mismatch",
        `${request.expectedPackageVersion} != ${identity.packageVersion}`
      )
    );
  }
  if (request.releaseIdentity !== identity.packageVersion) {
    gaps.push(
      constructReleaseSnapshotGapRef(
        "release_identity_mismatch",
        `${request.releaseIdentity} != ${identity.packageVersion}`
      )
    );
  }
  if (snapshotRootExists && snapshotRootHasEntries) {
    gaps.push(
      constructReleaseSnapshotGapRef("snapshot_root_exists", request.snapshotRoot)
    );
  }
  if (request.releaseNotePath !== null && !releaseNoteExists) {
    gaps.push(
      constructReleaseSnapshotGapRef(
        "release_note_missing",
        request.releaseNotePath
      )
    );
  }
  return Object.freeze(gaps);
}

function rejectSnapshot(input: {
  readonly request: ReleaseSnapshotRequest;
  readonly reason: string;
  readonly gaps: readonly ReleaseSnapshotGapRef[];
  readonly build: ReleaseSnapshotCommandResult | null;
  readonly pack: ReleaseSnapshotCommandResult | null;
}): ReleaseSnapshotOutcome {
  return constructReleaseSnapshotOutcome(
    constructReleaseSnapshotRejectedOutcome({
      releaseIdentity: input.request.releaseIdentity,
      snapshotRoot: input.request.snapshotRoot,
      reason: input.reason,
      gaps: input.gaps,
      build: input.build,
      pack: input.pack
    })
  );
}

function runBuildCommand(
  request: ReleaseSnapshotRequest
): ReleaseSnapshotCommandResult | null {
  if (!request.runBuild) {
    return null;
  }
  const executable = "npm";
  const args = Object.freeze(["run", "build:semantic"]);
  const command = Object.freeze([executable, ...args]);
  const run = spawnSync(executable, args, {
    cwd: request.packageSourceRoot,
    encoding: "utf8",
    env:
      request.npmCacheRoot === null
        ? process.env
        : { ...process.env, npm_config_cache: request.npmCacheRoot }
  });
  return commandResult({
    command,
    cwd: request.packageSourceRoot,
    status: run.status,
    stdout: run.stdout,
    stderr: run.stderr
  });
}

function parseNpmPackEntry(input: unknown, label: string): NpmPackEntry {
  if (!isRecord(input)) {
    throw new TypeError(`${label}: expected object`);
  }
  const files = input["files"];
  return Object.freeze({
    filename: readRequiredString(input, "filename", label),
    name: readRequiredString(input, "name", label),
    version: readRequiredString(input, "version", label),
    size: readRequiredNumber(input, "size", label),
    unpackedSize: readRequiredNumber(input, "unpackedSize", label),
    shasum: readRequiredString(input, "shasum", label),
    integrity: readRequiredString(input, "integrity", label),
    fileCount: Array.isArray(files) ? files.length : 0
  });
}

function parseNpmPackOutput(stdout: string): NpmPackEntry {
  const parsed: unknown = JSON.parse(stdout);
  if (!Array.isArray(parsed) || parsed.length !== 1) {
    throw new TypeError("npm pack --json: expected one package entry");
  }
  return parseNpmPackEntry(parsed[0], "npm pack entry");
}

function runPackCommand(input: {
  readonly request: ReleaseSnapshotRequest;
  readonly stagingRoot: string;
}): {
  readonly result: ReleaseSnapshotCommandResult;
  readonly entry: NpmPackEntry | null;
  readonly gap: ReleaseSnapshotGapRef | null;
} {
  const executable = "npm";
  const args = Object.freeze([
    "pack",
    "--pack-destination",
    input.stagingRoot,
    "--json"
  ]);
  const command = Object.freeze([executable, ...args]);
  const run = spawnSync(executable, args, {
    cwd: input.request.packageSourceRoot,
    encoding: "utf8",
    env:
      input.request.npmCacheRoot === null
        ? process.env
        : { ...process.env, npm_config_cache: input.request.npmCacheRoot }
  });
  const result = commandResult({
    command,
    cwd: input.request.packageSourceRoot,
    status: run.status,
    stdout: run.stdout,
    stderr: run.stderr
  });
  if (run.status !== 0) {
    return {
      result,
      entry: null,
      gap: constructReleaseSnapshotGapRef("pack_failed", result.stderr)
    };
  }
  try {
    return {
      result,
      entry: parseNpmPackOutput(result.stdout),
      gap: null
    };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "invalid pack output";
    return {
      result,
      entry: null,
      gap: constructReleaseSnapshotGapRef("pack_output_invalid", reason)
    };
  }
}

async function fileSha256(path: string): Promise<string> {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function fileBytes(path: string): Promise<number> {
  return (await readFile(path)).length;
}

function fileBasename(path: string): string {
  const parts = path.split(/[\\/]/u).filter((entry) => entry.length > 0);
  return parts.at(-1) ?? path;
}

async function artifactRef(input: {
  readonly kind: ReleaseSnapshotArtifactKind;
  readonly snapshotRoot: string;
  readonly relativePath: string;
}): Promise<ReleaseSnapshotArtifactRef> {
  const path = join(input.snapshotRoot, input.relativePath);
  return constructReleaseSnapshotArtifactRef({
    kind: input.kind,
    relativePath: input.relativePath,
    path,
    bytes: await fileBytes(path),
    sha256: await fileSha256(path)
  });
}

function relocateArtifactRef(input: {
  readonly artifact: ReleaseSnapshotArtifactRef;
  readonly snapshotRoot: string;
}): ReleaseSnapshotArtifactRef {
  return constructReleaseSnapshotArtifactRef({
    ...input.artifact,
    path: join(input.snapshotRoot, input.artifact.relativePath)
  });
}

function packSummary(entry: NpmPackEntry): ReleaseSnapshotPackSummary {
  return constructReleaseSnapshotPackSummary({
    filename: fileBasename(entry.filename),
    packageSizeBytes: entry.size,
    unpackedSizeBytes: entry.unpackedSize,
    npmShasum: entry.shasum,
    npmIntegrity: entry.integrity,
    totalFiles: entry.fileCount
  });
}

async function writeChecksums(input: {
  readonly stagingRoot: string;
  readonly artifacts: readonly ReleaseSnapshotArtifactRef[];
}): Promise<void> {
  const lines = input.artifacts
    .map((artifact) => `${artifact.sha256}  ${artifact.relativePath}`)
    .sort();
  await writeFile(
    join(input.stagingRoot, "checksums.sha256"),
    `${lines.join("\n")}\n`,
    "utf8"
  );
}

async function finalizeSnapshotRoot(input: {
  readonly stagingRoot: string;
  readonly snapshotRoot: string;
}): Promise<void> {
  const snapshotRootExists = await pathExists(input.snapshotRoot);
  const snapshotRootHasEntries = await directoryHasEntries(input.snapshotRoot);
  if (snapshotRootHasEntries) {
    throw new Error(`snapshot root already contains files: ${input.snapshotRoot}`);
  }
  if (snapshotRootExists) {
    await rm(input.snapshotRoot, { recursive: true, force: true });
  }
  await cp(input.stagingRoot, input.snapshotRoot, { recursive: true });
  await rm(input.stagingRoot, { recursive: true, force: true });
}

export async function createReleaseSnapshotBundle(
  request: ReleaseSnapshotRequest
): Promise<ReleaseSnapshotOutcome> {
  const identity = await readPackageIdentity(request.packageSourceRoot);
  const snapshotRootExists = await pathExists(request.snapshotRoot);
  const snapshotRootHasEntries = await directoryHasEntries(request.snapshotRoot);
  const releaseNoteExists =
    request.releaseNotePath === null
      ? false
      : await pathExists(request.releaseNotePath);
  const gaps = preflightGaps(
    request,
    identity,
    snapshotRootExists,
    snapshotRootHasEntries,
    releaseNoteExists
  );
  if (gaps.length > 0) {
    return rejectSnapshot({
      request,
      reason: "release snapshot preflight failed",
      gaps,
      build: null,
      pack: null
    });
  }

  const build = runBuildCommand(request);
  if (build !== null && build.status !== 0) {
    return rejectSnapshot({
      request,
      reason: "release snapshot build failed",
      gaps: Object.freeze([
        constructReleaseSnapshotGapRef("build_failed", build.stderr)
      ]),
      build,
      pack: null
    });
  }

  const stagingRoot = `${request.snapshotRoot}.staging-${Date.now()}`;
  await rm(stagingRoot, { recursive: true, force: true });
  await mkdir(dirname(request.snapshotRoot), { recursive: true });
  await mkdir(stagingRoot, { recursive: true });

  try {
    const pack = runPackCommand({ request, stagingRoot });
    if (pack.gap !== null || pack.entry === null) {
      await rm(stagingRoot, { recursive: true, force: true });
      return rejectSnapshot({
        request,
        reason: "release snapshot pack failed",
        gaps: Object.freeze(
          pack.gap === null
            ? [constructReleaseSnapshotGapRef("pack_failed", "missing pack entry")]
            : [pack.gap]
        ),
        build,
        pack: pack.result
      });
    }

    const tarballRelativePath = fileBasename(pack.entry.filename);
    const tarball = await artifactRef({
      kind: "package_tarball",
      snapshotRoot: stagingRoot,
      relativePath: tarballRelativePath
    });
    let releaseNote: ReleaseSnapshotArtifactRef | null = null;
    if (request.releaseNotePath !== null) {
      await cp(request.releaseNotePath, join(stagingRoot, "release-note.md"), {
        recursive: false
      });
      releaseNote = await artifactRef({
        kind: "release_note",
        snapshotRoot: stagingRoot,
        relativePath: "release-note.md"
      });
    }
    const finalTarball = relocateArtifactRef({
      artifact: tarball,
      snapshotRoot: request.snapshotRoot
    });
    const finalReleaseNote =
      releaseNote === null
        ? null
        : relocateArtifactRef({
            artifact: releaseNote,
            snapshotRoot: request.snapshotRoot
          });

    const manifest: ReleaseSnapshotManifest = constructReleaseSnapshotManifest({
      kind: "abg_release_snapshot_manifest",
      releaseIdentity: request.releaseIdentity,
      package: identity,
      sourceRef: request.sourceRef,
      sourceCommit: request.sourceCommit,
      sourceDirty: request.sourceDirty,
      rcBranch: request.rcBranch,
      packageSourceRoot: request.packageSourceRoot,
      snapshotRoot: request.snapshotRoot,
      createdAt: request.createdAt,
      build,
      pack: pack.result,
      packSummary: packSummary(pack.entry),
      tarball: finalTarball,
      releaseNote: finalReleaseNote,
      checksumFile: "checksums.sha256"
    });
    await writeFile(
      join(stagingRoot, "release-snapshot-manifest.json"),
      prettyJson(manifest),
      "utf8"
    );
    const manifestArtifact = await artifactRef({
      kind: "snapshot_manifest",
      snapshotRoot: stagingRoot,
      relativePath: "release-snapshot-manifest.json"
    });
    const checksumInputs = releaseNote === null
      ? Object.freeze([tarball, manifestArtifact])
      : Object.freeze([tarball, releaseNote, manifestArtifact]);
    await writeChecksums({ stagingRoot, artifacts: checksumInputs });
    await artifactRef({
      kind: "checksum_file",
      snapshotRoot: stagingRoot,
      relativePath: "checksums.sha256"
    });
    await finalizeSnapshotRoot({ stagingRoot, snapshotRoot: request.snapshotRoot });
    const finalArtifacts = releaseNote === null
      ? Object.freeze([
          await artifactRef({
            kind: "package_tarball",
            snapshotRoot: request.snapshotRoot,
            relativePath: tarballRelativePath
          }),
          await artifactRef({
            kind: "snapshot_manifest",
            snapshotRoot: request.snapshotRoot,
            relativePath: "release-snapshot-manifest.json"
          }),
          await artifactRef({
            kind: "checksum_file",
            snapshotRoot: request.snapshotRoot,
            relativePath: "checksums.sha256"
          })
        ])
      : Object.freeze([
          await artifactRef({
            kind: "package_tarball",
            snapshotRoot: request.snapshotRoot,
            relativePath: tarballRelativePath
          }),
          await artifactRef({
            kind: "release_note",
            snapshotRoot: request.snapshotRoot,
            relativePath: "release-note.md"
          }),
          await artifactRef({
            kind: "snapshot_manifest",
            snapshotRoot: request.snapshotRoot,
            relativePath: "release-snapshot-manifest.json"
          }),
          await artifactRef({
            kind: "checksum_file",
            snapshotRoot: request.snapshotRoot,
            relativePath: "checksums.sha256"
          })
        ]);

    return constructReleaseSnapshotOutcome(
      constructReleaseSnapshotCreatedOutcome({
        releaseIdentity: request.releaseIdentity,
        snapshotRoot: request.snapshotRoot,
        manifestPath: join(
          request.snapshotRoot,
          "release-snapshot-manifest.json"
        ),
        checksumPath: join(request.snapshotRoot, "checksums.sha256"),
        artifacts: finalArtifacts,
        manifest
      })
    );
  } catch (error: unknown) {
    await rm(stagingRoot, { recursive: true, force: true });
    const reason =
      error instanceof Error ? error.message : "release snapshot write failed";
    return rejectSnapshot({
      request,
      reason,
      gaps: Object.freeze([
        constructReleaseSnapshotGapRef("snapshot_write_failed", reason)
      ]),
      build,
      pack: null
    });
  }
}
