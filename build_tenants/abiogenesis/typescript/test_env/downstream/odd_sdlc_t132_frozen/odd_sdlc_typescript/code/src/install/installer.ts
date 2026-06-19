// Implements: REQ-F-ODDSDLC-040

import { installAbiogenesisTypescript } from "@abiogenesis/typescript-tenant/app/m04/install-bootstrap";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { admitOddSdlcTypescriptInstallRequest } from "./admission.js";
import type {
  OddSdlcTypescriptInstallManifest,
  OddSdlcTypescriptInstallOutcome,
  OddSdlcTypescriptInstallRequest,
  OddSdlcTypescriptRuntimeIdentity
} from "./carriers.js";
import {
  installPackedNodePackage,
  packNodePackage,
  readNodePackageIdentity
} from "../package_binding/index.js";
import { oddSdlcBootstrapGovernance, writeOddSdlcInstructionFiles } from "./instruction_files.js";
import {
  legacyBlockingReasonCode,
  makeSdlcBlockingReason
} from "../shared/blocking_reason.js";
import { appendOddSdlcRuntimeEvents } from "../operator/event_store.js";
import { isRecord as isPlainRecord } from "../admission/codecs.js";

export const ODD_SDLC_TYPESCRIPT_INSTALLER_ECOSYSTEM = "odd_sdlc_typescript" as const;

async function emitOddSdlcWorkspaceInstallationAdmitted(input: {
  readonly targetRoot: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly resolvedRuntimeRef: string;
  readonly installManifestPath: string;
}): Promise<void> {
  await appendOddSdlcRuntimeEvents({
    workspaceRoot: input.targetRoot,
    events: Object.freeze([
      Object.freeze({
        kind: "workspace_installation_admitted" as const,
        installResult: "installed" as const,
        targetRoot: input.targetRoot,
        packageName: input.packageName,
        packageVersion: input.packageVersion,
        resolvedRuntimeRef: input.resolvedRuntimeRef,
        installManifestPath: input.installManifestPath,
        installerEcosystem: ODD_SDLC_TYPESCRIPT_INSTALLER_ECOSYSTEM,
        causationEventRefs: Object.freeze([]),
        correlationId: `odd-sdlc-install://${randomUUID()}`
      })
    ])
  });
}

export const ODD_SDLC_TYPESCRIPT_PRODUCT_INSTALL_ROOT_RELATIVE = Object.freeze([
  ".abiogenesis",
  "odd_sdlc",
  "typescript"
] as const);

export function oddSdlcTypescriptProductInstallRoot(targetRoot: string): string {
  return join(targetRoot, ...ODD_SDLC_TYPESCRIPT_PRODUCT_INSTALL_ROOT_RELATIVE);
}

function abgDocsSourceIsUsable(candidateRoot: string): boolean {
  return (
    existsSync(resolve(candidateRoot, "README.md")) &&
    existsSync(resolve(candidateRoot, "LLM_GTL_APP_BUILDER_GUIDE.md")) &&
    existsSync(resolve(candidateRoot, "USER_GUIDE.md"))
  );
}

function standardsSourceIsUsable(candidateRoot: string): boolean {
  return (
    existsSync(resolve(candidateRoot, "SPEC_METHOD.md")) &&
    existsSync(resolve(candidateRoot, "ODD_METHOD.md")) &&
    existsSync(resolve(candidateRoot, "RELEASE_METHOD.md"))
  );
}

function resolveInstallAbgDocsSourceRoot(
  packageSourceRoot: string
): string | null {
  const siblingDocs = resolve(packageSourceRoot, "../../..", "abiogenesis/docs");
  if (abgDocsSourceIsUsable(siblingDocs)) {
    return siblingDocs;
  }
  const installedDocs = resolve(packageSourceRoot, ".abiogenesis/docs");
  if (abgDocsSourceIsUsable(installedDocs)) {
    return installedDocs;
  }
  return null;
}

function resolveInstallAbgStandardsSourceRoot(
  packageSourceRoot: string
): string | null {
  const siblingStandards = resolve(
    packageSourceRoot,
    "../../..",
    "specification_methodology/specification/standards"
  );
  if (standardsSourceIsUsable(siblingStandards)) {
    return siblingStandards;
  }
  const installedStandards = resolve(packageSourceRoot, ".abiogenesis/docs/standards");
  if (standardsSourceIsUsable(installedStandards)) {
    return installedStandards;
  }
  return null;
}

function stableJson(payload: unknown): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

async function writeTextFile(targetPath: string, content: string): Promise<void> {
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, "utf8");
}

function fileDependencyRef(targetRoot: string, tarballPath: string): string {
  return `file:${relative(targetRoot, tarballPath).split("\\").join("/")}`;
}

async function persistInstalledPackageDependency(input: {
  readonly targetRoot: string;
  readonly packageName: string;
  readonly tarballPath: string;
}): Promise<void> {
  await persistPackageDependency({
    packageJsonRoot: input.targetRoot,
    dependencyBaseRoot: input.targetRoot,
    packageName: input.packageName,
    tarballPath: input.tarballPath
  });
}

async function persistPackageDependency(input: {
  readonly packageJsonRoot: string;
  readonly dependencyBaseRoot: string;
  readonly packageName: string;
  readonly tarballPath: string;
}): Promise<void> {
  const packageJsonPath = join(input.packageJsonRoot, "package.json");
  const raw = await readFile(packageJsonPath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  const packageJson: Record<string, unknown> = isPlainRecord(parsed)
    ? { ...parsed }
    : {};
  const dependencies = isPlainRecord(packageJson["dependencies"])
    ? { ...packageJson["dependencies"] }
    : {};
  dependencies[input.packageName] = fileDependencyRef(
    input.dependencyBaseRoot,
    input.tarballPath
  );
  packageJson["dependencies"] = dependencies;
  await writeTextFile(packageJsonPath, stableJson(packageJson));
}

function substrateRuntimeRef(abgOutcome: Awaited<ReturnType<typeof installAbiogenesisTypescript>>): string | null {
  if (abgOutcome.kind !== "installed") {
    return null;
  }
  return abgOutcome.runtimeIdentity.resolvedRuntimeRef;
}

function runtimeIdentityFor(
  packageName: string,
  packageVersion: string,
  abgOutcome: Awaited<ReturnType<typeof installAbiogenesisTypescript>>
): OddSdlcTypescriptRuntimeIdentity {
  return Object.freeze({
    kind: "odd_sdlc_typescript_runtime_identity",
    packageName,
    packageVersion,
    resolvedRuntimeRef: `package:${packageName}@${packageVersion}`,
    substrateRuntimeRef: substrateRuntimeRef(abgOutcome)
  });
}

function installedAbgRuntimeBindingSource(input: {
  readonly packageName: string;
}): string {
  return `import {
  constructSdlcGtlModule,
  createOddSdlcAbgRuntimeBindingPlugins,
  oddSdlcAbgRuntimeWorkerTransportFromEnv,
  resolveOddSdlcAbgRuntimeBindingPolicy
} from ${JSON.stringify(input.packageName)};

export const runtimeBinding = {
  module: constructSdlcGtlModule(),
  runtimeIdentity: {
    workerId: "worker://odd-sdlc/typescript",
    backendId: "backend://node",
    buildId: "build://odd-sdlc/typescript",
    resolvedRuntimeRef: "runtime://abiogenesis/typescript"
  },
  resolvedPolicy: {
    resolvedPolicyBundleRef: "policy://odd-sdlc/start/F_P",
    defaultRegime: "F_P",
    dispatchRef: "dispatch://odd-sdlc/public-start",
    approvalSubjectRef: null
  },
  fallbackConfigPath: ".abiogenesis/config/abg.config.json",
  runId: "run://odd-sdlc/public-start",
  workKey: "wk://odd-sdlc/public-start",
  resolvePolicy(input) {
    return resolveOddSdlcAbgRuntimeBindingPolicy({
      targetGraphFunction: input.target.graphFunctionHandle
    });
  },
  createPlugins(input) {
    return createOddSdlcAbgRuntimeBindingPlugins({
      workspaceRoot: input.workspaceRoot,
      targetGraphFunction: input.target.graphFunctionHandle,
      until: input.command.until,
      replayEvents: input.replayEvents,
      eventSink: input.eventSink,
      workerTransport: oddSdlcAbgRuntimeWorkerTransportFromEnv()
    });
  }
};
`;
}

async function writeInstalledAbgRuntimeBinding(input: {
  readonly targetRoot: string;
  readonly packageName: string;
}): Promise<string> {
  const runtimeBindingPath = join(
    input.targetRoot,
    ".abiogenesis",
    "typescript-runtime.mjs"
  );
  await writeTextFile(
    runtimeBindingPath,
    installedAbgRuntimeBindingSource({
      packageName: input.packageName
    })
  );
  return runtimeBindingPath;
}

function requireInstalledAbg(
  abgOutcome: Awaited<ReturnType<typeof installAbiogenesisTypescript>>
): Extract<typeof abgOutcome, { readonly kind: "installed" }> {
  if (abgOutcome.kind !== "installed") {
    throw new Error(`ABG TypeScript install rejected: ${abgOutcome.reason}`);
  }
  return abgOutcome;
}

async function installAdmittedOddSdlcTypescript(
  request: OddSdlcTypescriptInstallRequest
): Promise<OddSdlcTypescriptInstallOutcome> {
  try {
    const identity = await readNodePackageIdentity(request.packageSourceRoot);
    const productInstallRoot = oddSdlcTypescriptProductInstallRoot(request.targetRoot);
    const packed = await packNodePackage({
      packageSourceRoot: request.packageSourceRoot,
      packDestinationRoot: join(productInstallRoot, "package-pack"),
      npmCacheRoot: join(request.targetRoot, ".npm-cache")
    });
    const installedPackage = await installPackedNodePackage({
      targetRoot: request.targetRoot,
      packageSourceRoot: request.packageSourceRoot,
      packageExtractRoot: join(productInstallRoot, "package-extract"),
      identity,
      tarballPath: packed.tarballPath,
      commandNames: ["odd-sdlc-ts"]
    });
    const abgOutcome = requireInstalledAbg(
      await installAbiogenesisTypescript({
        targetRoot: {
          rootPath: request.targetRoot
        },
        packageSourceRoot: request.abgPackageSourceRoot,
        standardsSourceRoot:
          request.abgStandardsSourceRoot ??
          resolveInstallAbgStandardsSourceRoot(request.packageSourceRoot),
        docsSourceRoot:
          request.abgDocsSourceRoot ??
          resolveInstallAbgDocsSourceRoot(request.packageSourceRoot),
        installedPackageName: `${request.installedPackageName}-abg`
      })
    );
    await persistPackageDependency({
      packageJsonRoot: installedPackage.packageRoot,
      dependencyBaseRoot: installedPackage.packageRoot,
      packageName: abgOutcome.packageName,
      tarballPath: abgOutcome.tarballPath
    });
    const repackedInstalledPackage = await packNodePackage({
      packageSourceRoot: installedPackage.packageRoot,
      packDestinationRoot: join(productInstallRoot, "package-pack"),
      npmCacheRoot: join(request.targetRoot, ".npm-cache")
    });
    const installedPackageForManifest = Object.freeze({
      ...installedPackage,
      tarballPath: repackedInstalledPackage.tarballPath
    });
    await persistInstalledPackageDependency({
      targetRoot: request.targetRoot,
      packageName: installedPackageForManifest.packageName,
      tarballPath: installedPackageForManifest.tarballPath
    });
    const oddSdlcCommandPath = installedPackage.commandBindings[0]?.commandPath;
    if (oddSdlcCommandPath === undefined) {
      throw new Error("odd-sdlc-ts command binding was not created");
    }
    const genesisCommandPath =
      abgOutcome.commandPaths.find((candidate) => candidate.endsWith("/genesis-ts")) ??
      null;
    const abiogenesisCommandPath =
      abgOutcome.commandPaths.find((candidate) => candidate.endsWith("/abiogenesis-ts")) ??
      null;
    const bootstrapGuidePath = join(
      request.targetRoot,
      ".ai-workspace",
      "context",
      "odd_sdlc_typescript_bootstrap.md"
    );
    const normalizationPath = join(
      request.targetRoot,
      ".ai-workspace",
      "runtime",
      "odd_sdlc-typescript-installation.json"
    );
    const abgRuntimeBindingPath = await writeInstalledAbgRuntimeBinding({
      targetRoot: request.targetRoot,
      packageName: installedPackageForManifest.packageName
    });
    const installManifestPath = join(productInstallRoot, "install-manifest.json");
    const instructionFiles = await writeOddSdlcInstructionFiles({
      targetRoot: request.targetRoot,
      productInstallRoot,
      oddSdlcCommandPath,
      genesisCommandPath,
      abiogenesisCommandPath,
      bootstrapGuidePath,
      normalizationPath,
      installManifestPath,
      abgInstallManifestPath: abgOutcome.installManifestPath
    });
    const runtimeIdentity = runtimeIdentityFor(
      installedPackage.packageName,
      installedPackage.packageVersion,
      abgOutcome
    );
    const bootstrapGovernance = oddSdlcBootstrapGovernance();
    const manifest: OddSdlcTypescriptInstallManifest = Object.freeze({
      kind: "odd_sdlc_typescript_install_manifest",
      targetRoot: request.targetRoot,
      productInstallRoot,
      installedPackageName: request.installedPackageName,
      packageName: installedPackageForManifest.packageName,
      packageVersion: installedPackageForManifest.packageVersion,
      packageSourceRoot: request.packageSourceRoot,
      packageRoot: installedPackageForManifest.packageRoot,
      tarballPath: installedPackageForManifest.tarballPath,
      commandBindings: installedPackageForManifest.commandBindings,
      abgCommandPaths: abgOutcome.commandPaths,
      abgInstallManifestPath: abgOutcome.installManifestPath,
      abgInstallerManifestPath: abgOutcome.installerManifestPath,
      abgRuntimeBindingPath,
      bootstrapGuidePath,
      instructionFiles,
      bootstrapGovernance,
      normalizationPath,
      installManifestPath,
      runtimeIdentity
    });

    await writeTextFile(installManifestPath, stableJson(manifest));
    await writeTextFile(
      normalizationPath,
      stableJson({
        kind: "odd_sdlc_typescript_installation_projection",
        targetRoot: request.targetRoot,
        productInstallRoot,
        commandPaths: [
          ...installedPackage.commandBindings.map((binding) => binding.commandPath),
          ...abgOutcome.commandPaths
        ],
        runtimeIdentity,
        installManifestPath,
        bootstrapGuidePath,
        instructionFiles,
        bootstrapGovernance,
        abgRuntimeBindingPath,
        abgInstallManifestPath: abgOutcome.installManifestPath
      })
    );
    await emitOddSdlcWorkspaceInstallationAdmitted({
      targetRoot: request.targetRoot,
      packageName: installedPackage.packageName,
      packageVersion: installedPackage.packageVersion,
      resolvedRuntimeRef: runtimeIdentity.resolvedRuntimeRef,
      installManifestPath
    });
    return Object.freeze({
      kind: "installed",
      request,
      productInstallRoot,
      installedPackage: installedPackageForManifest,
      abgOutcome,
      manifest,
      commandPaths: Object.freeze([
        ...installedPackageForManifest.commandBindings.map((binding) => binding.commandPath),
        ...abgOutcome.commandPaths
      ]),
      bootstrapGuidePath,
      instructionFiles,
      normalizationPath,
      installManifestPath
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "odd_sdlc TypeScript install failed";
    const blockingReason = makeSdlcBlockingReason({
      code: message.startsWith("ABG TypeScript install rejected:")
        ? "abg_install_rejected"
        : message.includes("command binding")
          ? "command_binding_missing"
          : "install_failed",
      detail: message,
      evidenceRefs: [request.targetRoot]
    });
    return Object.freeze({
      kind: "rejected",
      request,
      reason: legacyBlockingReasonCode(blockingReason),
      blockingReason
    });
  }
}

export async function installOddSdlcTypescript(
  input: unknown
): Promise<OddSdlcTypescriptInstallOutcome> {
  return installAdmittedOddSdlcTypescript(
    admitOddSdlcTypescriptInstallRequest(input)
  );
}
