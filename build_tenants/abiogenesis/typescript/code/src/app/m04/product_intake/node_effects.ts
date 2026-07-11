// Implements: REQ-P-INSTALL-043 through REQ-P-INSTALL-048
// Implements: REQ-P-INSTALL-052

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile
} from "node:fs/promises";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { admitToolchainWorkspaceBindingV3 } from "../public_sdk/carrier_admission.js";
import {
  admitIJsonText,
  canonicalizeIJson
} from "../public_sdk/canonical.js";
import type { IJsonValue } from "../public_sdk/canonical.js";
import type {
  ProductIntakeEffects,
  SuppliedProductArtifact,
  SuppliedProductArtifactEntry,
  ToolchainWorkspaceBindingV3,
  VerifiedProductArtifact
} from "../public_sdk/carriers.js";

const TAR_MAX_OUTPUT_BYTES = 64 * 1024 * 1024;

export interface NodeProductIntakeEffectsOptions {
  readonly temporaryRoot?: string;
  readonly environment?: Readonly<
    Partial<Record<"ABG_TOOLCHAIN_ROOT", string>>
  >;
  readonly resolveWorkspaceBindingPath?: (
    bindingRef: string
  ) => string | null;
}

interface TarEntry {
  readonly archivePath: string;
  readonly kind: "directory" | "file";
}

function isErrorWithCode(
  error: unknown
): error is Error & { readonly code: unknown } {
  return (
    error instanceof Error &&
    "code" in error
  );
}

function hasErrorCode(error: unknown, code: string): boolean {
  return isErrorWithCode(error) && error.code === code;
}

function absolutePath(value: string, label: string): string {
  if (!isAbsolute(value)) {
    throw new TypeError(`${label} must be an absolute path`);
  }
  return resolve(value);
}

function tarFlags(
  artifact: SuppliedProductArtifact,
  operation: "extract" | "list" | "verbose"
): string {
  const compressed = artifact.format === "npm_package_tgz" ? "z" : "";
  switch (operation) {
    case "extract":
      return `-x${compressed}f`;
    case "list":
      return `-t${compressed}f`;
    case "verbose":
      return `-t${compressed}vf`;
  }
}

function runTar(input: {
  readonly artifact: SuppliedProductArtifact;
  readonly operation: "extract" | "list" | "verbose";
  readonly extractRoot?: string;
}): string {
  const args = [tarFlags(input.artifact, input.operation), input.artifact.artifactPath];
  if (input.operation === "extract") {
    if (input.extractRoot === undefined) {
      throw new TypeError("tar extraction requires an explicit root");
    }
    args.push("-C", input.extractRoot);
  }
  const result = spawnSync("tar", args, {
    encoding: "utf8",
    env: {
      ...process.env,
      LC_ALL: "C",
      TAR_OPTIONS: undefined
    },
    maxBuffer: TAR_MAX_OUTPUT_BYTES
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "tar failed").trim();
    throw new TypeError(
      `cannot ${input.operation} product archive: ${detail}`
    );
  }
  return result.stdout;
}

function outputLines(output: string, label: string): readonly string[] {
  if (output.length === 0) {
    return Object.freeze([]);
  }
  const withoutFinalNewline = output.endsWith("\n")
    ? output.slice(0, -1)
    : output;
  const lines = withoutFinalNewline.split("\n");
  if (lines.some((line) => line.endsWith("\r"))) {
    throw new TypeError(`${label} contains non-canonical line endings`);
  }
  return Object.freeze(lines);
}

function archivePathSegments(input: {
  readonly artifact: SuppliedProductArtifact;
  readonly archivePath: string;
  readonly directory: boolean;
}): readonly string[] {
  const pathWithoutDirectorySlash = input.directory
    ? input.archivePath.slice(0, -1)
    : input.archivePath;
  if (
    pathWithoutDirectorySlash.length === 0 ||
    input.archivePath.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(input.archivePath) ||
    input.archivePath.startsWith("/") ||
    (input.directory
      ? !input.archivePath.endsWith("/")
      : input.archivePath.endsWith("/"))
  ) {
    throw new TypeError(
      `archive entry has an unsafe path: ${JSON.stringify(input.archivePath)}`
    );
  }
  const segments = pathWithoutDirectorySlash.split("/");
  if (
    segments.some(
      (segment) => segment.length === 0 || segment === "." || segment === ".."
    )
  ) {
    throw new TypeError(
      `archive entry escapes the product root: ${JSON.stringify(input.archivePath)}`
    );
  }
  if (input.artifact.format === "npm_package_tgz") {
    if (
      segments[0] !== "package" ||
      (!input.directory && segments.length < 2)
    ) {
      throw new TypeError(
        `npm archive entry is outside package/: ${JSON.stringify(input.archivePath)}`
      );
    }
  }
  return Object.freeze(segments);
}

function inspectTarTable(artifact: SuppliedProductArtifact): readonly TarEntry[] {
  const archivePaths = outputLines(
    runTar({ artifact, operation: "list" }),
    "tar path table"
  );
  const verboseRows = outputLines(
    runTar({ artifact, operation: "verbose" }),
    "tar type table"
  );
  if (archivePaths.length !== verboseRows.length) {
    throw new TypeError("tar path and type tables are not aligned");
  }

  const seen = new Map<string, TarEntry["kind"]>();
  const entries: TarEntry[] = [];
  for (const [index, archivePath] of archivePaths.entries()) {
    const verboseRow = verboseRows[index];
    const typeMarker = verboseRow?.[0];
    const kind = typeMarker === "-" ? "file" : typeMarker === "d" ? "directory" : null;
    if (kind === null) {
      throw new TypeError(
        `archive entry ${JSON.stringify(archivePath)} has unsupported type ${JSON.stringify(typeMarker)}`
      );
    }
    const segments = archivePathSegments({
      artifact,
      archivePath,
      directory: kind === "directory"
    });
    const canonicalPath = segments.join("/");
    if (seen.has(canonicalPath)) {
      throw new TypeError(
        `archive contains duplicate path ${JSON.stringify(canonicalPath)}`
      );
    }
    seen.set(canonicalPath, kind);
    entries.push(Object.freeze({ archivePath, kind }));
  }
  return Object.freeze(entries);
}

function productRelativePath(
  artifact: SuppliedProductArtifact,
  archivePath: string
): string {
  const segments = archivePathSegments({
    artifact,
    archivePath,
    directory: false
  });
  return artifact.format === "npm_package_tgz"
    ? segments.slice(1).join("/")
    : segments.join("/");
}

function containedPath(root: string, relativePath: string): string {
  const target = resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    throw new TypeError(`product path escapes destination root: ${relativePath}`);
  }
  return target;
}

async function inspectArtifactAtRoot(input: {
  readonly artifact: SuppliedProductArtifact;
  readonly temporaryRoot: string;
}): Promise<readonly SuppliedProductArtifactEntry[]> {
  absolutePath(input.artifact.artifactPath, "artifactPath");
  const table = inspectTarTable(input.artifact);
  await mkdir(input.temporaryRoot, { recursive: true });
  const extractRoot = await mkdtemp(
    join(input.temporaryRoot, "abg-product-intake-")
  );
  try {
    runTar({
      artifact: input.artifact,
      operation: "extract",
      extractRoot
    });
    const entries: SuppliedProductArtifactEntry[] = [];
    for (const entry of table) {
      if (entry.kind === "directory") {
        continue;
      }
      const extractedPath = containedPath(extractRoot, entry.archivePath);
      const bytes = await readFile(extractedPath);
      entries.push(
        Object.freeze({
          relativePath: entry.archivePath,
          bytes: new Uint8Array(bytes)
        })
      );
    }
    return Object.freeze(entries);
  } finally {
    await rm(extractRoot, { recursive: true, force: true });
  }
}

function sha256(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

async function directoryIsEmpty(path: string): Promise<boolean> {
  try {
    return (await readdir(path, { withFileTypes: true })).length === 0;
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return true;
    }
    throw error;
  }
}

function defaultBindingPath(bindingRef: string): string | null {
  if (isAbsolute(bindingRef)) {
    return resolve(bindingRef);
  }
  if (bindingRef.startsWith("file://")) {
    return resolve(fileURLToPath(bindingRef));
  }
  return null;
}

export function createNodeProductIntakeEffects(
  options: NodeProductIntakeEffectsOptions = {}
): ProductIntakeEffects {
  const temporaryRoot = absolutePath(
    options.temporaryRoot ?? process.env["TMPDIR"] ?? "/tmp",
    "temporaryRoot"
  );
  const inspectArtifact = async (
    artifact: SuppliedProductArtifact
  ): Promise<readonly SuppliedProductArtifactEntry[]> =>
    inspectArtifactAtRoot({ artifact, temporaryRoot });

  const readInstalledBytes = async (
    absoluteInstalledPath: string
  ): Promise<Uint8Array | null> => {
    const installedPath = absolutePath(
      absoluteInstalledPath,
      "installed product path"
    );
    try {
      return new Uint8Array(await readFile(installedPath));
    } catch (error) {
      if (hasErrorCode(error, "ENOENT")) {
        return null;
      }
      throw error;
    }
  };

  const readRecord = async (
    absoluteRecordPath: string
  ): Promise<IJsonValue | null> => {
    const bytes = await readInstalledBytes(absoluteRecordPath);
    if (bytes === null) {
      return null;
    }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return admitIJsonText(text, absoluteRecordPath);
  };

  return Object.freeze({
    async readArtifactBytes(
      absoluteArtifactPath: string
    ): Promise<Uint8Array> {
      const artifactPath = absolutePath(absoluteArtifactPath, "artifactPath");
      return new Uint8Array(await readFile(artifactPath));
    },
    readInstalledBytes,
    inspectArtifact,
    readRecord,
    async writeRecord(
      absoluteRecordPath: string,
      value: IJsonValue
    ): Promise<void> {
      const recordPath = absolutePath(absoluteRecordPath, "record path");
      await mkdir(dirname(recordPath), { recursive: true });
      await writeFile(recordPath, canonicalizeIJson(value), "utf8");
    },
    async materializeVerifiedArtifact(
      artifact: VerifiedProductArtifact,
      destinationRoot: string
    ): Promise<void> {
      const root = absolutePath(destinationRoot, "destinationRoot");
      const suppliedBytes = new Uint8Array(
        await readFile(absolutePath(artifact.artifact.artifactPath, "artifactPath"))
      );
      if (sha256(suppliedBytes) !== artifact.artifact.expectedArtifactDigest) {
        throw new TypeError("supplied artifact bytes changed after verification");
      }
      if (!(await directoryIsEmpty(root))) {
        throw new TypeError(`immutable product destination is not empty: ${root}`);
      }
      const entries = await inspectArtifact(artifact.artifact);
      const materializationPlan = entries
        .map((entry) =>
          Object.freeze({
            relativePath: productRelativePath(
              artifact.artifact,
              entry.relativePath
            ),
            bytes: entry.bytes
          })
        )
        .sort((left, right) =>
          left.relativePath < right.relativePath
            ? -1
            : left.relativePath > right.relativePath
              ? 1
              : 0
        );
      await mkdir(root, { recursive: true });
      for (const entry of materializationPlan) {
        const target = containedPath(root, entry.relativePath);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, entry.bytes);
      }
    },
    readEnvironment(name: "ABG_TOOLCHAIN_ROOT"): string | null {
      return options.environment === undefined
        ? process.env[name] ?? null
        : options.environment[name] ?? null;
    },
    async readWorkspaceBinding(
      bindingRef: string
    ): Promise<ToolchainWorkspaceBindingV3 | null> {
      const resolveBindingPath =
        options.resolveWorkspaceBindingPath ?? defaultBindingPath;
      const bindingPath = resolveBindingPath(bindingRef);
      if (bindingPath === null) {
        return null;
      }
      const value = await readRecord(absolutePath(bindingPath, "workspace binding path"));
      return value === null ? null : admitToolchainWorkspaceBindingV3(value);
    }
  });
}
