// Implements: REQ-F-ODDSDLC-040
// Implements: REQ-F-ODDSDLC-042

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
import { dirname, join, resolve } from "node:path";
import { isRecord } from "../admission/codecs.js";
import { assertCurrentSdlcGtlProgramConformance } from "../gtl_conformance/index.js";
import type {
  OddSdlcTypescriptReleaseSnapshotAbgSubstrate,
  OddSdlcTypescriptReleaseSnapshotArtifactKind,
  OddSdlcTypescriptReleaseSnapshotArtifactRef,
  OddSdlcTypescriptReleaseSnapshotCommandResult,
  OddSdlcTypescriptReleaseSnapshotGapRef,
  OddSdlcTypescriptReleaseSnapshotManifest,
  OddSdlcTypescriptReleaseSnapshotOutcome,
  OddSdlcTypescriptReleaseSnapshotPackSummary,
  OddSdlcTypescriptReleaseSnapshotPackageIdentity,
  OddSdlcTypescriptReleaseSnapshotRequest
} from "./carriers.js";

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

interface AdmittedReleaseSnapshotRequest
  extends OddSdlcTypescriptReleaseSnapshotRequest {
  readonly packageSourceRoot: string;
  readonly snapshotRoot: string;
  readonly releaseNotePath: string | null;
  readonly npmCacheRoot: string | null;
  readonly createdAt: string;
}

function requiredString(
  input: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): string {
  const value = input[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label}.${key}: expected non-empty string`);
  }
  return value.trim();
}

function optionalString(
  input: Readonly<Record<string, unknown>>,
  key: string
): string | null {
  const value = input[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function optionalBoolean(
  input: Readonly<Record<string, unknown>>,
  key: string,
  fallback: boolean | null
): boolean | null {
  const value = input[key];
  return typeof value === "boolean" ? value : fallback;
}

function optionalBooleanDefault(
  input: Readonly<Record<string, unknown>>,
  key: string,
  fallback: boolean
): boolean {
  const value = input[key];
  return typeof value === "boolean" ? value : fallback;
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function commandText(value: string | null): string {
  return typeof value === "string" ? value : "";
}

function commandResult(input: {
  readonly command: readonly string[];
  readonly cwd: string;
  readonly status: number | null;
  readonly stdout: string | null;
  readonly stderr: string | null;
}): OddSdlcTypescriptReleaseSnapshotCommandResult {
  return Object.freeze({
    command: Object.freeze([...input.command]),
    cwd: input.cwd,
    status: input.status,
    stdout: commandText(input.stdout),
    stderr: commandText(input.stderr)
  });
}

function gap(kind: OddSdlcTypescriptReleaseSnapshotGapRef["kind"], ref: string) {
  return Object.freeze({ kind, ref });
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
    return (await readdir(path)).length > 0;
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

async function fileSha256(path: string): Promise<string> {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function fileBytes(path: string): Promise<number> {
  return (await readFile(path)).byteLength;
}

function basename(path: string): string {
  const parts = path.split(/[\\/]/u).filter((entry) => entry.length > 0);
  return parts.at(-1) ?? path;
}

async function artifactRef(input: {
  readonly kind: OddSdlcTypescriptReleaseSnapshotArtifactKind;
  readonly snapshotRoot: string;
  readonly relativePath: string;
}): Promise<OddSdlcTypescriptReleaseSnapshotArtifactRef> {
  const path = join(input.snapshotRoot, input.relativePath);
  return Object.freeze({
    kind: input.kind,
    relativePath: input.relativePath,
    path,
    bytes: await fileBytes(path),
    sha256: await fileSha256(path)
  });
}

function relocateArtifact(input: {
  readonly artifact: OddSdlcTypescriptReleaseSnapshotArtifactRef;
  readonly snapshotRoot: string;
}): OddSdlcTypescriptReleaseSnapshotArtifactRef {
  return Object.freeze({
    ...input.artifact,
    path: join(input.snapshotRoot, input.artifact.relativePath)
  });
}

async function readPackageJson(
  packageSourceRoot: string
): Promise<Record<string, unknown>> {
  const parsed: unknown = JSON.parse(
    await readFile(join(packageSourceRoot, "package.json"), "utf8")
  );
  if (!isRecord(parsed)) {
    throw new TypeError("package.json: expected object");
  }
  return parsed;
}

async function readPackageIdentity(
  packageSourceRoot: string
): Promise<OddSdlcTypescriptReleaseSnapshotPackageIdentity> {
  const packageJson = await readPackageJson(packageSourceRoot);
  return Object.freeze({
    packageName: requiredString(packageJson, "name", "package.json"),
    packageVersion: requiredString(packageJson, "version", "package.json"),
    packagePrivate:
      typeof packageJson["private"] === "boolean"
        ? packageJson["private"]
        : false
  });
}

function dependencyRef(
  packageJson: Readonly<Record<string, unknown>>,
  packageName: string
): string | null {
  const dependencies = packageJson["dependencies"];
  if (!isRecord(dependencies)) {
    return null;
  }
  const value = dependencies[packageName];
  return typeof value === "string" ? value : null;
}

function resolveFileDependency(
  packageSourceRoot: string,
  value: string
): string | null {
  if (!value.startsWith("file:")) {
    return null;
  }
  return resolve(packageSourceRoot, value.slice("file:".length));
}

async function abgSubstrateForPackage(
  packageSourceRoot: string
): Promise<{
  readonly substrate: OddSdlcTypescriptReleaseSnapshotAbgSubstrate | null;
  readonly gaps: readonly OddSdlcTypescriptReleaseSnapshotGapRef[];
}> {
  const packageJson = await readPackageJson(packageSourceRoot);
  const dependency = dependencyRef(packageJson, "@abiogenesis/typescript-tenant");
  const tarballPath =
    dependency === null ? null : resolveFileDependency(packageSourceRoot, dependency);
  if (
    dependency === null ||
    tarballPath === null ||
    !tarballPath.endsWith(".tgz") ||
    !tarballPath.includes("/release_snapshots/abiogenesis-typescript-tenant/")
  ) {
    return Object.freeze({
      substrate: null,
      gaps: Object.freeze([
        gap(
          "abg_release_snapshot_missing",
          dependency ?? "@abiogenesis/typescript-tenant"
        )
      ])
    });
  }

  const snapshotRoot = dirname(tarballPath);
  const manifestPath = join(snapshotRoot, "release-snapshot-manifest.json");
  if (!(await pathExists(manifestPath))) {
    return Object.freeze({
      substrate: null,
      gaps: Object.freeze([gap("abg_release_snapshot_missing", manifestPath)])
    });
  }
  const manifest: unknown = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!isRecord(manifest) || !isRecord(manifest["package"])) {
    return Object.freeze({
      substrate: null,
      gaps: Object.freeze([gap("abg_release_snapshot_mismatch", manifestPath)])
    });
  }
  const packageIdentity = manifest["package"];
  const packageName = packageIdentity["packageName"];
  const packageVersion = packageIdentity["packageVersion"];
  const tarball = isRecord(manifest["tarball"]) ? manifest["tarball"] : null;
  const tarballSha256 = typeof tarball?.["sha256"] === "string"
    ? tarball["sha256"]
    : await fileSha256(tarballPath);
  if (
    packageName !== "@abiogenesis/typescript-tenant" ||
    typeof packageVersion !== "string" ||
    basename(tarballPath) !== `abiogenesis-typescript-tenant-${packageVersion}.tgz`
  ) {
    return Object.freeze({
      substrate: null,
      gaps: Object.freeze([gap("abg_release_snapshot_mismatch", manifestPath)])
    });
  }
  return Object.freeze({
    substrate: Object.freeze({
      packageName: "@abiogenesis/typescript-tenant" as const,
      packageVersion,
      dependencyRef: dependency,
      snapshotRoot,
      manifestPath,
      tarballPath,
      tarballSha256,
      sourceRef: optionalString(manifest, "sourceRef"),
      sourceCommit: optionalString(manifest, "sourceCommit")
    }),
    gaps: Object.freeze([])
  });
}

function gitOutput(
  packageSourceRoot: string,
  args: readonly string[]
): string | null {
  const run = spawnSync("git", ["-C", packageSourceRoot, ...args], {
    encoding: "utf8"
  });
  if (run.status !== 0) {
    return null;
  }
  const output = run.stdout.trim();
  return output.length === 0 ? null : output;
}

function sourceRef(packageSourceRoot: string): string {
  return (
    gitOutput(packageSourceRoot, ["describe", "--tags", "--exact-match", "HEAD"]) ??
    gitOutput(packageSourceRoot, ["rev-parse", "--abbrev-ref", "HEAD"]) ??
    "unknown"
  );
}

function sourceCommit(packageSourceRoot: string): string {
  return gitOutput(packageSourceRoot, ["rev-parse", "HEAD"]) ?? "unknown";
}

function sourceDirty(packageSourceRoot: string): boolean {
  return (
    gitOutput(packageSourceRoot, ["status", "--porcelain", "--untracked-files=no"]) ??
    ""
  ).length > 0;
}

function admitRequest(
  input: unknown
): AdmittedReleaseSnapshotRequest {
  if (!isRecord(input)) {
    throw new TypeError("odd_sdlc release-snapshot request: expected object");
  }
  const releaseNotePath = optionalString(input, "releaseNotePath");
  const npmCacheRoot = optionalString(input, "npmCacheRoot");
  return Object.freeze({
    kind: "odd_sdlc_typescript_release_snapshot_request" as const,
    releaseIdentity: requiredString(input, "releaseIdentity", "request"),
    packageSourceRoot: resolve(requiredString(input, "packageSourceRoot", "request")),
    snapshotRoot: resolve(requiredString(input, "snapshotRoot", "request")),
    sourceRef: optionalString(input, "sourceRef"),
    sourceCommit: optionalString(input, "sourceCommit"),
    sourceDirty: optionalBoolean(input, "sourceDirty", null),
    allowDirtySource: optionalBooleanDefault(input, "allowDirtySource", false),
    rcBranch: optionalString(input, "rcBranch"),
    releaseNotePath: releaseNotePath === null ? null : resolve(releaseNotePath),
    expectedPackageName: optionalString(input, "expectedPackageName"),
    expectedPackageVersion: optionalString(input, "expectedPackageVersion"),
    runBuild: optionalBooleanDefault(input, "runBuild", true),
    npmCacheRoot: npmCacheRoot === null ? null : resolve(npmCacheRoot),
    createdAt: optionalString(input, "createdAt") ?? new Date().toISOString()
  });
}

function preflightGaps(input: {
  readonly request: AdmittedReleaseSnapshotRequest;
  readonly identity: OddSdlcTypescriptReleaseSnapshotPackageIdentity;
  readonly snapshotRootExists: boolean;
  readonly snapshotRootHasEntries: boolean;
  readonly releaseNoteExists: boolean;
  readonly substrateGaps: readonly OddSdlcTypescriptReleaseSnapshotGapRef[];
}): readonly OddSdlcTypescriptReleaseSnapshotGapRef[] {
  const gaps: OddSdlcTypescriptReleaseSnapshotGapRef[] = [
    ...input.substrateGaps
  ];
  if (input.request.sourceDirty === true && !input.request.allowDirtySource) {
    gaps.push(gap("dirty_source_tree", input.request.sourceRef ?? "source"));
  }
  if (
    input.request.expectedPackageName !== null &&
    input.request.expectedPackageName !== input.identity.packageName
  ) {
    gaps.push(
      gap(
        "package_name_mismatch",
        `${input.request.expectedPackageName} != ${input.identity.packageName}`
      )
    );
  }
  if (
    input.request.expectedPackageVersion !== null &&
    input.request.expectedPackageVersion !== input.identity.packageVersion
  ) {
    gaps.push(
      gap(
        "package_version_mismatch",
        `${input.request.expectedPackageVersion} != ${input.identity.packageVersion}`
      )
    );
  }
  if (input.request.releaseIdentity !== input.identity.packageVersion) {
    gaps.push(
      gap(
        "release_identity_mismatch",
        `${input.request.releaseIdentity} != ${input.identity.packageVersion}`
      )
    );
  }
  if (input.snapshotRootExists && input.snapshotRootHasEntries) {
    gaps.push(gap("snapshot_root_exists", input.request.snapshotRoot));
  }
  if (input.request.releaseNotePath !== null && !input.releaseNoteExists) {
    gaps.push(gap("release_note_missing", input.request.releaseNotePath));
  }
  return Object.freeze(gaps);
}

function rejected(input: {
  readonly request: AdmittedReleaseSnapshotRequest;
  readonly reason: string;
  readonly gaps: readonly OddSdlcTypescriptReleaseSnapshotGapRef[];
  readonly build: OddSdlcTypescriptReleaseSnapshotCommandResult | null;
  readonly pack: OddSdlcTypescriptReleaseSnapshotCommandResult | null;
}): OddSdlcTypescriptReleaseSnapshotOutcome {
  return Object.freeze({
    kind: "rejected" as const,
    releaseIdentity: input.request.releaseIdentity,
    snapshotRoot: input.request.snapshotRoot,
    reason: input.reason,
    gaps: Object.freeze([...input.gaps]),
    build: input.build,
    pack: input.pack
  });
}

function runBuild(
  request: AdmittedReleaseSnapshotRequest
): OddSdlcTypescriptReleaseSnapshotCommandResult | null {
  if (!request.runBuild) {
    return null;
  }
  const command = Object.freeze(["npm", "run", "build:semantic"]);
  const run = spawnSync("npm", ["run", "build:semantic"], {
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

function parseNumber(
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

function parsePackEntry(input: unknown): NpmPackEntry {
  if (!isRecord(input)) {
    throw new TypeError("npm pack entry: expected object");
  }
  const files = input["files"];
  return Object.freeze({
    filename: requiredString(input, "filename", "npm pack entry"),
    name: requiredString(input, "name", "npm pack entry"),
    version: requiredString(input, "version", "npm pack entry"),
    size: parseNumber(input, "size", "npm pack entry"),
    unpackedSize: parseNumber(input, "unpackedSize", "npm pack entry"),
    shasum: requiredString(input, "shasum", "npm pack entry"),
    integrity: requiredString(input, "integrity", "npm pack entry"),
    fileCount: Array.isArray(files) ? files.length : 0
  });
}

function parsePackOutput(stdout: string): NpmPackEntry {
  const parsed: unknown = JSON.parse(stdout);
  if (!Array.isArray(parsed) || parsed.length !== 1) {
    throw new TypeError("npm pack --json: expected one package entry");
  }
  return parsePackEntry(parsed[0]);
}

function runPack(input: {
  readonly request: AdmittedReleaseSnapshotRequest;
  readonly stagingRoot: string;
}): {
  readonly result: OddSdlcTypescriptReleaseSnapshotCommandResult;
  readonly entry: NpmPackEntry | null;
  readonly gap: OddSdlcTypescriptReleaseSnapshotGapRef | null;
} {
  const command = Object.freeze([
    "npm",
    "pack",
    "--pack-destination",
    input.stagingRoot,
    "--json"
  ]);
  const run = spawnSync("npm", command.slice(1), {
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
    return Object.freeze({
      result,
      entry: null,
      gap: gap("pack_failed", result.stderr)
    });
  }
  try {
    return Object.freeze({
      result,
      entry: parsePackOutput(result.stdout),
      gap: null
    });
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "invalid pack output";
    return Object.freeze({
      result,
      entry: null,
      gap: gap("pack_output_invalid", reason)
    });
  }
}

function packSummary(
  entry: NpmPackEntry
): OddSdlcTypescriptReleaseSnapshotPackSummary {
  return Object.freeze({
    filename: basename(entry.filename),
    packageSizeBytes: entry.size,
    unpackedSizeBytes: entry.unpackedSize,
    npmShasum: entry.shasum,
    npmIntegrity: entry.integrity,
    totalFiles: entry.fileCount
  });
}

async function writeChecksums(input: {
  readonly stagingRoot: string;
  readonly artifacts: readonly OddSdlcTypescriptReleaseSnapshotArtifactRef[];
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
  if (await directoryHasEntries(input.snapshotRoot)) {
    throw new Error(`snapshot root already contains files: ${input.snapshotRoot}`);
  }
  if (await pathExists(input.snapshotRoot)) {
    await rm(input.snapshotRoot, { recursive: true, force: true });
  }
  await cp(input.stagingRoot, input.snapshotRoot, { recursive: true });
  await rm(input.stagingRoot, { recursive: true, force: true });
}

export async function deriveOddSdlcTypescriptReleaseSnapshot(
  input: unknown
): Promise<OddSdlcTypescriptReleaseSnapshotOutcome> {
  const requestBase = admitRequest(input);
  assertCurrentSdlcGtlProgramConformance({
    packageRoot: requestBase.packageSourceRoot
  });
  const request = Object.freeze({
    ...requestBase,
    sourceRef: requestBase.sourceRef ?? sourceRef(requestBase.packageSourceRoot),
    sourceCommit:
      requestBase.sourceCommit ?? sourceCommit(requestBase.packageSourceRoot),
    sourceDirty:
      requestBase.sourceDirty ?? sourceDirty(requestBase.packageSourceRoot)
  });
  const identity = await readPackageIdentity(request.packageSourceRoot);
  const abgSubstrate = await abgSubstrateForPackage(request.packageSourceRoot);
  const snapshotRootExists = await pathExists(request.snapshotRoot);
  const snapshotRootHasEntries = await directoryHasEntries(request.snapshotRoot);
  const releaseNoteExists =
    request.releaseNotePath === null
      ? false
      : await pathExists(request.releaseNotePath);
  const preflight = preflightGaps({
    request,
    identity,
    snapshotRootExists,
    snapshotRootHasEntries,
    releaseNoteExists,
    substrateGaps: abgSubstrate.gaps
  });
  if (preflight.length > 0 || abgSubstrate.substrate === null) {
    return rejected({
      request,
      reason: "release snapshot preflight failed",
      gaps: preflight,
      build: null,
      pack: null
    });
  }

  const build = runBuild(request);
  if (build !== null && build.status !== 0) {
    return rejected({
      request,
      reason: "release snapshot build failed",
      gaps: Object.freeze([gap("build_failed", build.stderr)]),
      build,
      pack: null
    });
  }

  const stagingRoot = `${request.snapshotRoot}.staging-${Date.now()}`;
  await rm(stagingRoot, { recursive: true, force: true });
  await mkdir(dirname(request.snapshotRoot), { recursive: true });
  await mkdir(stagingRoot, { recursive: true });

  try {
    const pack = runPack({ request, stagingRoot });
    if (pack.gap !== null || pack.entry === null) {
      await rm(stagingRoot, { recursive: true, force: true });
      return rejected({
        request,
        reason: "release snapshot pack failed",
        gaps: Object.freeze(
          pack.gap === null ? [gap("pack_failed", "missing pack entry")] : [pack.gap]
        ),
        build,
        pack: pack.result
      });
    }

    const tarballRelativePath = basename(pack.entry.filename);
    const tarball = await artifactRef({
      kind: "package_tarball",
      snapshotRoot: stagingRoot,
      relativePath: tarballRelativePath
    });
    let releaseNote: OddSdlcTypescriptReleaseSnapshotArtifactRef | null = null;
    if (request.releaseNotePath !== null) {
      await cp(request.releaseNotePath, join(stagingRoot, "release-note.md"));
      releaseNote = await artifactRef({
        kind: "release_note",
        snapshotRoot: stagingRoot,
        relativePath: "release-note.md"
      });
    }
    const manifest: OddSdlcTypescriptReleaseSnapshotManifest = Object.freeze({
      kind: "odd_sdlc_release_snapshot_manifest" as const,
      releaseIdentity: request.releaseIdentity,
      package: identity,
      abgSubstrate: abgSubstrate.substrate,
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
      tarball: relocateArtifact({ artifact: tarball, snapshotRoot: request.snapshotRoot }),
      releaseNote:
        releaseNote === null
          ? null
          : relocateArtifact({
              artifact: releaseNote,
              snapshotRoot: request.snapshotRoot
            }),
      checksumFile: "checksums.sha256"
    });
    await writeFile(
      join(stagingRoot, "release-snapshot-manifest.json"),
      stableJson(manifest),
      "utf8"
    );
    const manifestArtifact = await artifactRef({
      kind: "snapshot_manifest",
      snapshotRoot: stagingRoot,
      relativePath: "release-snapshot-manifest.json"
    });
    const checksumInputs =
      releaseNote === null
        ? Object.freeze([tarball, manifestArtifact])
        : Object.freeze([tarball, releaseNote, manifestArtifact]);
    await writeChecksums({ stagingRoot, artifacts: checksumInputs });
    await artifactRef({
      kind: "checksum_file",
      snapshotRoot: stagingRoot,
      relativePath: "checksums.sha256"
    });
    await finalizeSnapshotRoot({ stagingRoot, snapshotRoot: request.snapshotRoot });

    const artifacts =
      releaseNote === null
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

    return Object.freeze({
      kind: "created" as const,
      releaseIdentity: request.releaseIdentity,
      snapshotRoot: request.snapshotRoot,
      manifestPath: join(request.snapshotRoot, "release-snapshot-manifest.json"),
      checksumPath: join(request.snapshotRoot, "checksums.sha256"),
      artifacts,
      manifest
    });
  } catch (error: unknown) {
    await rm(stagingRoot, { recursive: true, force: true });
    const reason =
      error instanceof Error ? error.message : "release snapshot write failed";
    return rejected({
      request,
      reason,
      gaps: Object.freeze([gap("snapshot_write_failed", reason)]),
      build,
      pack: null
    });
  }
}
