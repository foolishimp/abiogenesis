// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import { admitPublicInstallBootstrapRequest } from "./admission.js";
import {
  constructInstallBootstrapPlan,
  constructInstallVerification,
  constructInstalledPublicInstallBootstrapOutcome,
  constructPublicInstallBootstrapOutcome,
  constructRejectedPublicInstallBootstrapOutcome
} from "./constructors.js";
import {
  deliveryVerificationPassed,
  materializeDeliveryPlan,
  verifyDeliveryPlan
} from "../../../shared/abg_delivery_library/index.js";
import { parsePlainObject } from "../../../shared/validation/primitives.js";
import type {
  InstallVerification,
  PublicInstallBootstrapOutcome,
  PublicInstallBootstrapRequest
} from "./carriers.js";
import type {
  DeliveryVerification,
  DeliveryPlan,
  DeliveryWriter
} from "../../../shared/abg_delivery_library/index.js";

function joinPath(root: string, relativePath: string): string {
  if (relativePath.length === 0) {
    return root;
  }
  if (root.endsWith("/")) {
    return `${root}${relativePath}`;
  }
  return `${root}/${relativePath}`;
}

function stringifyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function derivePackageManifest(
  request: PublicInstallBootstrapRequest
): string {
  return stringifyJson({
    name: request.installedPackageName,
    private: true,
    type: "module",
    exports: {
      ".": "./bootstrap/index.mjs"
    },
    dependencies: {
      [request.runtimePackage.packageName]: request.runtimePackage.dependencyRef
    }
  });
}

function deriveInstallManifest(
  request: PublicInstallBootstrapRequest
): string {
  return stringifyJson({
    installedPackageName: request.installedPackageName,
    targetRoot: request.targetRoot.rootPath,
    bootstrapEntry: "./bootstrap/index.mjs",
    workspaceRoots: {
      eventsLog: ".ai-workspace/events/events.jsonl",
      runtimeDirectory: ".ai-workspace/runtime"
    },
    runtimePackage: {
      packageName: request.runtimePackage.packageName,
      packageVersion: request.runtimePackage.packageVersion,
      dependencyRef: request.runtimePackage.dependencyRef,
      appExportSubpath: request.runtimePackage.appExportSubpath,
      requiredExports: request.runtimePackage.requiredExports
    }
  });
}

function deriveBootstrapEntry(
  request: PublicInstallBootstrapRequest
): string {
  return (
    `export * from "${request.runtimePackage.packageName}/${request.runtimePackage.appExportSubpath.slice(2)}";\n`
  );
}

export function deriveInstallBootstrapPlan(
  request: PublicInstallBootstrapRequest
): DeliveryPlan {
  return constructInstallBootstrapPlan({
    directories: [
      { kind: "workspace_root", relativePath: ".ai-workspace" },
      { kind: "events_root", relativePath: ".ai-workspace/events" },
      { kind: "runtime_root", relativePath: ".ai-workspace/runtime" },
      { kind: "install_root", relativePath: ".abiogenesis" },
      { kind: "bootstrap_root", relativePath: "bootstrap" }
    ],
    files: [
      {
        kind: "package_manifest",
        relativePath: "package.json",
        content: derivePackageManifest(request)
      },
      {
        kind: "install_manifest",
        relativePath: ".abiogenesis/install-manifest.json",
        content: deriveInstallManifest(request)
      },
      {
        kind: "bootstrap_entry",
        relativePath: "bootstrap/index.mjs",
        content: deriveBootstrapEntry(request)
      },
      {
        kind: "workspace_events",
        relativePath: ".ai-workspace/events/events.jsonl",
        content: ""
      }
    ]
  });
}

async function readJsonObject(
  writer: DeliveryWriter,
  path: string
): Promise<Record<string, unknown> | null> {
  const raw = await writer.readTextFile(path);
  if (raw === null) {
    return null;
  }
  return parsePlainObject(JSON.parse(raw), path);
}

async function detectInstallMismatch(
  request: PublicInstallBootstrapRequest,
  writer: DeliveryWriter
): Promise<string | null> {
  const packageJsonPath = joinPath(request.targetRoot.rootPath, "package.json");
  const existingPackageJson = await readJsonObject(writer, packageJsonPath);
  if (existingPackageJson !== null) {
    const existingName = existingPackageJson["name"];
    if (
      typeof existingName === "string" &&
      existingName !== request.installedPackageName
    ) {
      return "existing package.json name does not match installedPackageName";
    }
    const dependencies = existingPackageJson["dependencies"];
    if (typeof dependencies === "object" && dependencies !== null) {
      const dependencyMap = parsePlainObject(
        dependencies,
        `${packageJsonPath}.dependencies`
      );
      const dependencyRef = dependencyMap[
        request.runtimePackage.packageName
      ];
      if (
        typeof dependencyRef === "string" &&
        dependencyRef !== request.runtimePackage.dependencyRef
      ) {
        return "existing package.json runtime dependency does not match the admitted runtime package contract";
      }
    }
  }

  const installManifestPath = joinPath(
    request.targetRoot.rootPath,
    ".abiogenesis/install-manifest.json"
  );
  const existingManifest = await readJsonObject(writer, installManifestPath);
  if (existingManifest !== null) {
    const runtimePackage = existingManifest["runtimePackage"];
    if (typeof runtimePackage === "object" && runtimePackage !== null) {
      const existingRuntimePackage = parsePlainObject(
        runtimePackage,
        `${installManifestPath}.runtimePackage`
      );
      const packageName = existingRuntimePackage["packageName"];
      const dependencyRef = existingRuntimePackage["dependencyRef"];
      if (
        (typeof packageName === "string" &&
          packageName !== request.runtimePackage.packageName) ||
        (typeof dependencyRef === "string" &&
          dependencyRef !== request.runtimePackage.dependencyRef)
      ) {
        return "existing install manifest runtime package does not match the admitted runtime package contract";
      }
    }
  }

  return null;
}

function deriveInstallVerification(
  verification: DeliveryVerification
): InstallVerification {
  return constructInstallVerification({
    packageManifest: verification.items.some(
      (entry) =>
        entry.kind === "file" &&
        entry.relativePath === "package.json" &&
        entry.verified
    ),
    installManifest: verification.items.some(
      (entry) =>
        entry.kind === "file" &&
        entry.relativePath === ".abiogenesis/install-manifest.json" &&
        entry.verified
    ),
    bootstrapEntry: verification.items.some(
      (entry) =>
        entry.kind === "file" &&
        entry.relativePath === "bootstrap/index.mjs" &&
        entry.verified
    ),
    workspaceEvents: verification.items.some(
      (entry) =>
        entry.kind === "file" &&
        entry.relativePath === ".ai-workspace/events/events.jsonl" &&
        entry.verified
    ),
    runtimeDirectory: verification.items.some(
      (entry) =>
        entry.kind === "directory" &&
        entry.relativePath === ".ai-workspace/runtime" &&
        entry.verified
    )
  });
}

export async function installBootstrap(
  input: unknown,
  writer: DeliveryWriter
): Promise<PublicInstallBootstrapOutcome> {
  const request = admitPublicInstallBootstrapRequest(input);
  const mismatchReason = await detectInstallMismatch(request, writer);
  if (mismatchReason !== null) {
    return constructPublicInstallBootstrapOutcome(
      constructRejectedPublicInstallBootstrapOutcome({
        targetRoot: request.targetRoot,
        reason: mismatchReason
      })
    );
  }
  const plan = deriveInstallBootstrapPlan(request);
  await materializeDeliveryPlan(request.targetRoot.rootPath, plan, writer);
  const deliveryVerification = await verifyDeliveryPlan(
    request.targetRoot.rootPath,
    plan,
    writer
  );
  const verification = deriveInstallVerification(deliveryVerification);
  if (!deliveryVerificationPassed(deliveryVerification)) {
    return constructPublicInstallBootstrapOutcome(
      constructRejectedPublicInstallBootstrapOutcome({
        targetRoot: request.targetRoot,
        reason: "installed delivery root failed post-write verification"
      })
    );
  }
  return constructPublicInstallBootstrapOutcome(
    constructInstalledPublicInstallBootstrapOutcome({
      targetRoot: request.targetRoot,
      installedPackageName: request.installedPackageName,
      runtimePackage: request.runtimePackage,
      plan,
      verification
    })
  );
}
