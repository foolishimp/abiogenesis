// Implements: REQ-F-ODDSDLC-040

import { spawnSync } from "node:child_process";
import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import type {
  InstalledNodePackage,
  NodePackageBinaryBinding,
  NodePackageIdentity,
  PackedNodePackage
} from "./carriers.js";
import { isRecord as isPlainRecord } from "../admission/codecs.js";

export interface PackNodePackageInput {
  readonly packageSourceRoot: string;
  readonly packDestinationRoot: string;
  readonly npmCacheRoot: string;
}

export interface InstallPackedNodePackageInput {
  readonly targetRoot: string;
  readonly packageSourceRoot: string;
  readonly packageExtractRoot: string;
  readonly identity: NodePackageIdentity;
  readonly tarballPath: string;
  readonly commandNames: readonly string[];
}

function isNodeErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error["code"] === code
  );
}

function assertPlainRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isPlainRecord(value)) {
    throw new TypeError(`${label}: expected object`);
  }
  return value;
}

function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`package.json.${key}: expected non-empty string`);
  }
  return value;
}

function dependencyNames(record: Record<string, unknown>): readonly string[] {
  const value = record["dependencies"];
  if (value === undefined) {
    return Object.freeze([]);
  }
  const dependencies = assertPlainRecord(value, "package.json.dependencies");
  return Object.freeze(Object.keys(dependencies).sort());
}

function binMap(record: Record<string, unknown>, packageName: string): Readonly<Record<string, string>> {
  const value = record["bin"];
  if (value === undefined) {
    return Object.freeze({});
  }
  if (typeof value === "string" && value.length > 0) {
    return Object.freeze({ [packageName]: value });
  }
  const rawMap = assertPlainRecord(value, "package.json.bin");
  const result: Record<string, string> = {};
  for (const [commandName, commandPath] of Object.entries(rawMap)) {
    if (typeof commandPath !== "string" || commandPath.length === 0) {
      throw new TypeError(`package.json.bin.${commandName}: expected non-empty string`);
    }
    result[commandName] = commandPath;
  }
  return Object.freeze(result);
}

function packedTarballName(stdout: string): string {
  const lines = stdout
    .trim()
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.endsWith(".tgz"));
  const last = lines.at(-1);
  if (last === undefined) {
    throw new Error(`npm pack did not report a tarball name\n${stdout}`);
  }
  return last;
}

function assertSpawnSucceeded(
  status: number | null,
  stdout: string,
  stderr: string,
  label: string
): void {
  if (status !== 0) {
    throw new Error(
      `${label} failed with status ${status ?? "null"}\nstdout:\n${stdout}\nstderr:\n${stderr}`
    );
  }
}

async function pathIsDirectory(targetPath: string): Promise<boolean> {
  try {
    return (await stat(targetPath)).isDirectory();
  } catch (error: unknown) {
    if (isNodeErrorCode(error, "ENOENT")) {
      return false;
    }
    throw error;
  }
}

async function locateDependencySource(
  packageSourceRoot: string,
  packageName: string
): Promise<string> {
  let current = packageSourceRoot;
  while (current !== dirname(current)) {
    const candidate = join(current, "node_modules", ...packageName.split("/"));
    if (await pathIsDirectory(candidate)) {
      return candidate;
    }
    current = dirname(current);
  }
  throw new Error(`dependency ${packageName} is not installed near package source`);
}

function packageRootForName(targetRoot: string, packageName: string): string {
  return join(targetRoot, "node_modules", ...packageName.split("/"));
}

async function linkPackageDependency(
  input: InstallPackedNodePackageInput,
  packageName: string
): Promise<void> {
  const sourceRoot = await locateDependencySource(input.packageSourceRoot, packageName);
  const targetRootPath = join(input.targetRoot, "node_modules", ...packageName.split("/"));
  await mkdir(dirname(targetRootPath), { recursive: true });
  await rm(targetRootPath, { recursive: true, force: true });
  await symlink(sourceRoot, targetRootPath, "dir");
}

async function linkPackageDependencies(input: InstallPackedNodePackageInput): Promise<void> {
  for (const dependency of input.identity.dependencies) {
    await linkPackageDependency(input, dependency);
  }
}

async function extractPackage(input: InstallPackedNodePackageInput): Promise<string> {
  const extractParent = input.packageExtractRoot;
  await mkdir(extractParent, { recursive: true });
  const extractRoot = await mkdtemp(join(extractParent, "extract-"));
  const extractRun = spawnSync("tar", ["-xzf", input.tarballPath, "-C", extractRoot], {
    cwd: input.targetRoot,
    encoding: "utf8"
  });
  assertSpawnSucceeded(
    extractRun.status,
    extractRun.stdout,
    extractRun.stderr,
    "tar extract"
  );

  const packageRoot = packageRootForName(input.targetRoot, input.identity.packageName);
  await mkdir(dirname(packageRoot), { recursive: true });
  await rm(packageRoot, { recursive: true, force: true });
  await cp(join(extractRoot, "package"), packageRoot, { recursive: true });
  await linkPackageDependencies(input);
  return packageRoot;
}

async function bindCommand(
  targetRoot: string,
  packageRoot: string,
  commandName: string,
  relativePackageCommandPath: string
): Promise<NodePackageBinaryBinding> {
  const binRoot = join(targetRoot, "node_modules", ".bin");
  await mkdir(binRoot, { recursive: true });
  const commandPath = join(binRoot, commandName);
  const packageCommandPath = join(packageRoot, relativePackageCommandPath);
  await chmod(packageCommandPath, 0o755);
  await rm(commandPath, { force: true });
  await symlink(relative(binRoot, packageCommandPath), commandPath);
  return Object.freeze({
    commandName,
    commandPath,
    packageCommandPath
  });
}

export async function readNodePackageIdentity(
  packageSourceRoot: string
): Promise<NodePackageIdentity> {
  const raw = await readFile(join(packageSourceRoot, "package.json"), "utf8");
  const packageJson = assertPlainRecord(JSON.parse(raw), "package.json");
  const packageName = stringField(packageJson, "name");
  const packageVersion = stringField(packageJson, "version");
  return Object.freeze({
    kind: "node_package_identity",
    packageName,
    packageVersion,
    dependencies: dependencyNames(packageJson),
    bin: binMap(packageJson, packageName)
  });
}

export async function packNodePackage(
  input: PackNodePackageInput
): Promise<PackedNodePackage> {
  const identity = await readNodePackageIdentity(input.packageSourceRoot);
  await mkdir(input.packDestinationRoot, { recursive: true });
  const packRoot = await mkdtemp(join(input.packDestinationRoot, "pack-"));
  const packRun = spawnSync(
    "npm",
    ["pack", "--pack-destination", packRoot, "--silent"],
    {
      cwd: input.packageSourceRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        npm_config_cache: input.npmCacheRoot
      }
    }
  );
  assertSpawnSucceeded(packRun.status, packRun.stdout, packRun.stderr, "npm pack");
  return Object.freeze({
    kind: "packed_node_package",
    packageSourceRoot: input.packageSourceRoot,
    packageName: identity.packageName,
    packageVersion: identity.packageVersion,
    tarballPath: join(packRoot, packedTarballName(packRun.stdout)),
    packRoot
  });
}

export async function installPackedNodePackage(
  input: InstallPackedNodePackageInput
): Promise<InstalledNodePackage> {
  const packageRoot = await extractPackage(input);
  const commandBindings: NodePackageBinaryBinding[] = [];
  for (const commandName of input.commandNames) {
    const commandRelativePath = input.identity.bin[commandName];
    if (commandRelativePath === undefined) {
      throw new Error(`package ${input.identity.packageName} does not publish ${commandName}`);
    }
    commandBindings.push(
      await bindCommand(input.targetRoot, packageRoot, commandName, commandRelativePath)
    );
  }
  return Object.freeze({
    kind: "installed_node_package",
    targetRoot: input.targetRoot,
    packageName: input.identity.packageName,
    packageVersion: input.identity.packageVersion,
    packageRoot,
    tarballPath: input.tarballPath,
    commandBindings: Object.freeze(commandBindings)
  });
}
