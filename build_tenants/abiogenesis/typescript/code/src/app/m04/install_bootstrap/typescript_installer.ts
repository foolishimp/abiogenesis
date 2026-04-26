// Implements: REQ-P-QUAL-018G
// Implements: REQ-P-QUAL-018H
// Implements: REQ-P-SCENARIOS

import { spawnSync } from "node:child_process";
import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink,
  writeFile
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { parsePlainObject } from "../../../shared/validation/primitives.js";
import { installBootstrap } from "./install.js";
import { admitAbgTypescriptInstallerRequest } from "./typescript_installer_admission.js";
import {
  constructAbgTypescriptInstallerManifest,
  constructAbgTypescriptInstallerOutcome,
  constructInstalledAbgTypescriptInstallerOutcome,
  constructRejectedAbgTypescriptInstallerOutcome
} from "./typescript_installer_constructors.js";
import type { DeliveryWriter } from "../../../shared/abg_delivery_library/index.js";
import type { PublicInstallBootstrapInstalled } from "./carriers.js";
import type {
  AbgTypescriptInstallerOutcome,
  AbgTypescriptInstallerRequest,
  AbgTypescriptInstallerRuntimeIdentity
} from "./typescript_installer_carriers.js";

interface PackageIdentity {
  readonly packageName: string;
  readonly packageVersion: string;
  readonly dependencies: readonly string[];
}

function isNodeErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error["code"] === code
  );
}

function stringifyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function nodeDeliveryWriter(): DeliveryWriter {
  return Object.freeze({
    async ensureDirectory(targetPath: string): Promise<void> {
      await mkdir(targetPath, { recursive: true });
    },
    async writeTextFile(targetPath: string, content: string): Promise<void> {
      await mkdir(dirname(targetPath), { recursive: true });
      await writeFile(targetPath, content, "utf8");
    },
    async readTextFile(targetPath: string): Promise<string | null> {
      try {
        return await readFile(targetPath, "utf8");
      } catch (error: unknown) {
        if (isNodeErrorCode(error, "ENOENT")) {
          return null;
        }
        throw error;
      }
    },
    async isDirectory(targetPath: string): Promise<boolean> {
      try {
        return (await stat(targetPath)).isDirectory();
      } catch (error: unknown) {
        if (isNodeErrorCode(error, "ENOENT")) {
          return false;
        }
        throw error;
      }
    },
    async isFile(targetPath: string): Promise<boolean> {
      try {
        return (await stat(targetPath)).isFile();
      } catch (error: unknown) {
        if (isNodeErrorCode(error, "ENOENT")) {
          return false;
        }
        throw error;
      }
    }
  });
}

function dependencyNames(input: Record<string, unknown>): readonly string[] {
  const dependencies = input["dependencies"];
  if (dependencies === undefined) {
    return Object.freeze([]);
  }
  const dependencyMap = parsePlainObject(
    dependencies,
    "package.json.dependencies"
  );
  return Object.freeze(Object.keys(dependencyMap).sort());
}

async function readPackageIdentity(
  packageSourceRoot: string
): Promise<PackageIdentity> {
  const raw = await readFile(join(packageSourceRoot, "package.json"), "utf8");
  const packageJson = parsePlainObject(JSON.parse(raw), "package.json");
  const packageName = packageJson["name"];
  const packageVersion = packageJson["version"];
  if (typeof packageName !== "string" || packageName.length === 0) {
    throw new TypeError("package.json.name: expected a non-empty string");
  }
  if (typeof packageVersion !== "string" || packageVersion.length === 0) {
    throw new TypeError("package.json.version: expected a non-empty string");
  }
  return Object.freeze({
    packageName,
    packageVersion,
    dependencies: dependencyNames(packageJson)
  });
}

function runtimeIdentityForPackage(
  identity: PackageIdentity
): AbgTypescriptInstallerRuntimeIdentity {
  return Object.freeze({
    workerId: "abiogenesis-typescript-installer",
    backendId: "node",
    buildId: identity.packageVersion,
    resolvedRuntimeRef: `package:${identity.packageName}@${identity.packageVersion}`
  });
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

async function packPackage(
  request: AbgTypescriptInstallerRequest
): Promise<string> {
  const packParent = join(
    request.targetRoot.rootPath,
    ".abiogenesis",
    "package-pack"
  );
  await mkdir(packParent, { recursive: true });
  const packRoot = await mkdtemp(join(packParent, "pack-"));
  const packRun = spawnSync(
    "npm",
    ["pack", "--pack-destination", packRoot, "--silent"],
    {
      cwd: request.packageSourceRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        npm_config_cache: join(request.targetRoot.rootPath, ".npm-cache")
      }
    }
  );
  assertSpawnSucceeded(
    packRun.status,
    packRun.stdout,
    packRun.stderr,
    "npm pack"
  );
  return join(packRoot, packedTarballName(packRun.stdout));
}

async function pathIsDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch (error: unknown) {
    if (isNodeErrorCode(error, "ENOENT")) {
      return false;
    }
    throw error;
  }
}

function packageRootForName(targetRoot: string, packageName: string): string {
  return join(targetRoot, "node_modules", ...packageName.split("/"));
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

async function linkPackageDependency(
  request: AbgTypescriptInstallerRequest,
  packageName: string
): Promise<void> {
  const sourceRoot = await locateDependencySource(
    request.packageSourceRoot,
    packageName
  );
  const targetRootPath = join(
    request.targetRoot.rootPath,
    "node_modules",
    ...packageName.split("/")
  );
  await mkdir(dirname(targetRootPath), { recursive: true });
  await rm(targetRootPath, { recursive: true, force: true });
  await symlink(sourceRoot, targetRootPath, "dir");
}

async function linkPackageDependencies(
  request: AbgTypescriptInstallerRequest,
  identity: PackageIdentity
): Promise<void> {
  for (const dependency of identity.dependencies) {
    await linkPackageDependency(request, dependency);
  }
}

async function extractPackage(
  request: AbgTypescriptInstallerRequest,
  identity: PackageIdentity,
  tarballPath: string
): Promise<string> {
  const extractParent = join(
    request.targetRoot.rootPath,
    ".abiogenesis",
    "package-extract"
  );
  await mkdir(extractParent, { recursive: true });
  const extractRoot = await mkdtemp(join(extractParent, "extract-"));
  const extractRun = spawnSync("tar", ["-xzf", tarballPath, "-C", extractRoot], {
    cwd: request.targetRoot.rootPath,
    encoding: "utf8"
  });
  assertSpawnSucceeded(
    extractRun.status,
    extractRun.stdout,
    extractRun.stderr,
    "tar extract"
  );

  const packageRoot = packageRootForName(
    request.targetRoot.rootPath,
    identity.packageName
  );
  await mkdir(dirname(packageRoot), { recursive: true });
  await rm(packageRoot, { recursive: true, force: true });
  await cp(join(extractRoot, "package"), packageRoot, { recursive: true });
  await linkPackageDependencies(request, identity);
  return packageRoot;
}

async function writeCommandBinding(
  targetRoot: string,
  commandName: string,
  packageCommandPath: string
): Promise<string> {
  const binRoot = join(targetRoot, "node_modules", ".bin");
  await mkdir(binRoot, { recursive: true });
  const commandPath = join(binRoot, commandName);
  await rm(commandPath, { force: true });
  await symlink(relative(binRoot, packageCommandPath), commandPath);
  return commandPath;
}

async function writeCommandBindings(
  request: AbgTypescriptInstallerRequest,
  packageRoot: string
): Promise<readonly string[]> {
  const packageCommandPath = join(
    packageRoot,
    "build",
    "semantic",
    "code",
    "src",
    "bin",
    "abiogenesis.js"
  );
  await chmod(packageCommandPath, 0o755);
  return Object.freeze([
    await writeCommandBinding(
      request.targetRoot.rootPath,
      "abiogenesis-ts",
      packageCommandPath
    ),
    await writeCommandBinding(
      request.targetRoot.rootPath,
      "genesis-ts",
      packageCommandPath
    )
  ]);
}

function bootstrapRequest(
  request: AbgTypescriptInstallerRequest,
  identity: PackageIdentity,
  tarballPath: string
): unknown {
  const dependencyPath = relative(request.targetRoot.rootPath, tarballPath);
  return {
    targetRoot: {
      rootPath: request.targetRoot.rootPath
    },
    installedPackageName: request.installedPackageName,
    runtimePackage: {
      packageName: identity.packageName,
      packageVersion: identity.packageVersion,
      dependencyRef: `file:${dependencyPath}`,
      appExportSubpath: "./app/m04",
      requiredExports: [
        ".",
        "./app/m04",
        "./app/m04/control",
        "./app/m04/event-ingress",
        "./app/m04/gaps",
        "./app/m04/install-bootstrap",
        "./app/m04/live-status",
        "./app/m04/result-assessment"
      ]
    }
  };
}

function installedBootstrapOutcome(
  outcome: Awaited<ReturnType<typeof installBootstrap>>
): PublicInstallBootstrapInstalled {
  if (outcome.kind === "rejected") {
    throw new Error(outcome.reason);
  }
  return outcome;
}

export async function installAbiogenesisTypescript(
  input: unknown
): Promise<AbgTypescriptInstallerOutcome> {
  const request = admitAbgTypescriptInstallerRequest(input);
  try {
    const identity = await readPackageIdentity(request.packageSourceRoot);
    const runtimeIdentity = runtimeIdentityForPackage(identity);
    const tarballPath = await packPackage(request);
    const installBootstrapOutcome = installedBootstrapOutcome(
      await installBootstrap(
        bootstrapRequest(request, identity, tarballPath),
        nodeDeliveryWriter()
      )
    );
    const packageRoot = await extractPackage(request, identity, tarballPath);
    const commandPaths = await writeCommandBindings(request, packageRoot);
    const installerManifestPath = join(
      request.targetRoot.rootPath,
      ".abiogenesis",
      "typescript-installer-manifest.json"
    );
    const manifest = constructAbgTypescriptInstallerManifest({
      targetRoot: request.targetRoot.rootPath,
      installedPackageName: request.installedPackageName,
      packageName: identity.packageName,
      packageVersion: identity.packageVersion,
      packageSourceRoot: request.packageSourceRoot,
      packageRoot,
      tarballPath,
      commandPaths,
      runtimeIdentity,
      installManifestPath: join(
        request.targetRoot.rootPath,
        ".abiogenesis",
        "install-manifest.json"
      ),
      installerManifestPath,
      bootstrapEntryPath: join(request.targetRoot.rootPath, "bootstrap", "index.mjs"),
      eventsPath: join(
        request.targetRoot.rootPath,
        ".ai-workspace",
        "events",
        "events.jsonl"
      ),
      runtimeDirectory: join(
        request.targetRoot.rootPath,
        ".ai-workspace",
        "runtime"
      )
    });
    await writeFile(installerManifestPath, stringifyJson(manifest), "utf8");
    return constructAbgTypescriptInstallerOutcome(
      constructInstalledAbgTypescriptInstallerOutcome({
        targetRoot: request.targetRoot,
        installedPackageName: request.installedPackageName,
        packageName: identity.packageName,
        packageVersion: identity.packageVersion,
        packageSourceRoot: request.packageSourceRoot,
        packageRoot,
        tarballPath,
        commandPaths,
        runtimeIdentity,
        installManifestPath: manifest.installManifestPath,
        installerManifestPath,
        bootstrapEntryPath: manifest.bootstrapEntryPath,
        eventsPath: manifest.eventsPath,
        runtimeDirectory: manifest.runtimeDirectory,
        installBootstrapOutcome,
        manifest
      })
    );
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "installer failed";
    return constructAbgTypescriptInstallerOutcome(
      constructRejectedAbgTypescriptInstallerOutcome({
        targetRoot: request.targetRoot,
        reason
      })
    );
  }
}
