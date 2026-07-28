import { execFile } from "node:child_process";
import { access, lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import type {
  InstallProductRequest,
  ProductInstallCandidate,
  ProductInstallRefusal,
  ProductInstallRefusalCode,
  ProductInstallResult,
} from "./contracts.js";
import {
  type ProductInstall,
  verifiedArtifactMatchesResolvedLock,
} from "./environment.js";
import {
  payloadInventoryDigest,
  sha256Canonical,
  sha256File,
  type PayloadInventoryRow,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { parseProductManifest } from "./verify_product.js";

function refusal(
  code: ProductInstallRefusalCode,
  message: string,
): ProductInstallRefusal {
  return {
    kind: "product_install_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function runNpmInstall(targetRoot: string, artifactPath: string): Promise<void> {
  return new Promise((resolveRun, reject) => {
    execFile(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--offline",
        "--package-lock=true",
        artifactPath,
      ],
      { cwd: targetRoot, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
      (error, _stdout, stderr) => {
        if (error !== null) {
          reject(new Error(stderr || error.message));
          return;
        }
        resolveRun();
      },
    );
  });
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function installedPackageRoot(targetRoot: string, packageName: string): string | null {
  if (!/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/u.test(packageName)) {
    return null;
  }
  return join(targetRoot, "node_modules", ...packageName.split("/"));
}

async function listInstalledPayloadFiles(installedRoot: string): Promise<readonly string[]> {
  const files: string[] = [];
  const visit = async (absolute: string): Promise<void> => {
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) {
      throw new Error(`installed payload contains a symbolic link: ${absolute}`);
    }
    if (stat.isDirectory()) {
      for (const entry of (await readdir(absolute)).sort()) {
        await visit(join(absolute, entry));
      }
      return;
    }
    if (stat.isFile()) {
      files.push(relative(installedRoot, absolute).split(sep).join("/"));
    }
  };

  await visit(join(installedRoot, "package.json"));
  await visit(join(installedRoot, "build"));
  await visit(join(installedRoot, "contracts"));
  return files.sort();
}

export async function installedProductContentMatches(
  install: ProductInstallCandidate | ProductInstall,
): Promise<boolean> {
  try {
    const installedPackage = JSON.parse(
      await readFile(join(install.installedRoot, "package.json"), "utf8"),
    ) as unknown;
    const installedManifest = parseProductManifest(JSON.parse(
      await readFile(
        join(install.installedRoot, "product-toolchain-manifest.json"),
        "utf8",
      ),
    ));
    if (
      typeof installedPackage !== "object" ||
      installedPackage === null ||
      !("name" in installedPackage) ||
      !("version" in installedPackage) ||
      installedPackage.name !== install.packageName ||
      installedPackage.version !== install.packageVersion ||
      installedManifest === null ||
      installedManifest.productId !== install.productId ||
      installedManifest.packageName !== install.packageName ||
      installedManifest.packageVersion !== install.packageVersion ||
      installedManifest.productContentDigest !== install.productContentDigest ||
      sha256Canonical(installedManifest as unknown as JsonValue) !== install.manifestDigest
    ) {
      return false;
    }
    const actualFiles = await listInstalledPayloadFiles(install.installedRoot);
    const expectedFiles = [...installedManifest.productRelativeLocators].sort();
    if (canonicalJson(actualFiles) !== canonicalJson(expectedFiles)) return false;
    const inventory: PayloadInventoryRow[] = [];
    for (const path of expectedFiles) {
      inventory.push({
        path,
        sha256: await sha256File(join(install.installedRoot, path)),
      });
    }
    return payloadInventoryDigest(inventory) === install.productContentDigest;
  } catch {
    return false;
  }
}

export async function installProduct(
  request: InstallProductRequest,
): Promise<ProductInstallResult> {
  if (
    !verifiedArtifactMatchesResolvedLock(
      request.verifiedArtifact,
      request.resolvedLock,
    )
  ) {
    return refusal(
      "dependency_lock_mismatch",
      "installation requires exact membership in one resolved Product lock",
    );
  }

  let artifactDigest: string;
  try {
    artifactDigest = await sha256File(request.artifactPath);
  } catch (error) {
    return refusal("artifact_mismatch", String(error));
  }
  if (artifactDigest !== request.verifiedArtifact.artifactDigest) {
    return refusal("artifact_mismatch", "artifact bytes differ from the verified artifact");
  }

  await mkdir(request.targetRoot, { recursive: true });
  if ((await readdir(request.targetRoot)).length !== 0) {
    return refusal("target_not_empty", "installation target must be empty");
  }

  const consumerPackage = {
    name: "abiogenesis-installed-product-consumer",
    version: "0.0.0",
    private: true,
    type: "module",
  };
  await writeFile(
    join(request.targetRoot, "package.json"),
    `${canonicalJson(consumerPackage)}\n`,
    "utf8",
  );

  try {
    await runNpmInstall(request.targetRoot, resolve(request.artifactPath));
  } catch (error) {
    return refusal("install_failed", String(error));
  }

  const installedRoot = installedPackageRoot(
    request.targetRoot,
    request.verifiedArtifact.packageName,
  );
  if (installedRoot === null) {
    return refusal("installed_identity_mismatch", "verified package name is not an installable package identity");
  }
  let installedPackage: unknown;
  let installedManifestUnknown: unknown;
  try {
    installedPackage = JSON.parse(await readFile(join(installedRoot, "package.json"), "utf8"));
    installedManifestUnknown = JSON.parse(
      await readFile(join(installedRoot, "product-toolchain-manifest.json"), "utf8"),
    );
  } catch (error) {
    return refusal("installed_identity_mismatch", String(error));
  }

  if (
    typeof installedPackage !== "object" ||
    installedPackage === null ||
    !("name" in installedPackage) ||
    !("version" in installedPackage) ||
    installedPackage.name !== request.verifiedArtifact.packageName ||
    installedPackage.version !== request.verifiedArtifact.packageVersion
  ) {
    return refusal("installed_identity_mismatch", "installed package identity is not the verified identity");
  }

  const installedManifest = parseProductManifest(installedManifestUnknown);
  if (installedManifest === null) {
    return refusal("installed_manifest_mismatch", "installed manifest shape is invalid");
  }
  const installedManifestDigest = sha256Canonical(installedManifest as unknown as JsonValue);
  if (installedManifestDigest !== request.verifiedArtifact.manifestDigest) {
    return refusal("installed_manifest_mismatch", "installed manifest is not the verified manifest");
  }

  try {
    const actualFiles = await listInstalledPayloadFiles(installedRoot);
    const expectedFiles = [...installedManifest.productRelativeLocators].sort();
    if (canonicalJson(actualFiles) !== canonicalJson(expectedFiles)) {
      return refusal("installed_manifest_mismatch", "installed payload file set differs from the manifest");
    }
    const inventory: PayloadInventoryRow[] = [];
    for (const path of expectedFiles) {
      inventory.push({ path, sha256: await sha256File(join(installedRoot, path)) });
    }
    if (payloadInventoryDigest(inventory) !== request.verifiedArtifact.productContentDigest) {
      return refusal("installed_manifest_mismatch", "installed payload bytes differ from the verified artifact");
    }
  } catch (error) {
    return refusal("installed_manifest_mismatch", String(error));
  }

  const prohibitedPaths = ["code", "scripts", "test_env", "tsconfig.json"];
  for (const path of prohibitedPaths) {
    if (await exists(join(installedRoot, path))) {
      return refusal("unexpected_source_surface", `installed package contains source-only path: ${path}`);
    }
  }
  const contentSuffix = request.verifiedArtifact.productContentDigest.slice("sha256:".length);
  const lockSuffix = request.resolvedLock.lockDigest.slice("sha256:".length);
  return deepFreeze({
    kind: "product_install_candidate",
    schemaVersion: "5.0.0",
    disposition: "materialized",
    installId:
      `product-install://${request.verifiedArtifact.packageName}/${request.verifiedArtifact.packageVersion}/${contentSuffix}/${lockSuffix}`,
    installedRoot,
    productId: request.verifiedArtifact.productId,
    packageName: request.verifiedArtifact.packageName,
    packageVersion: request.verifiedArtifact.packageVersion,
    artifactDigest: request.verifiedArtifact.artifactDigest,
    productContentDigest: request.verifiedArtifact.productContentDigest,
    manifestDigest: request.verifiedArtifact.manifestDigest,
    descriptorRef: request.verifiedArtifact.descriptorRef,
    publisherNamespace: request.verifiedArtifact.publisherNamespace,
    contributionManifestRef:
      request.verifiedArtifact.contributionManifestRef,
    contributionManifestDigest:
      request.verifiedArtifact.contributionManifestDigest,
    contributionManifest: {
      ...request.verifiedArtifact.contributionManifest,
      publicationBindings:
        request.verifiedArtifact.contributionManifest.publicationBindings.map(
          (binding) => ({ ...binding }),
        ),
      rows: request.verifiedArtifact.contributionManifest.rows.map((row) => ({
        ...row,
        programMembershipRefs: [...row.programMembershipRefs],
        compatibilityRefs: [...row.compatibilityRefs],
        readinessPrerequisiteRefs: [...row.readinessPrerequisiteRefs],
      })),
    },
    compatibilityRefs: [...request.verifiedArtifact.compatibilityRefs],
    declaredDependencies: request.verifiedArtifact.declaredDependencies.map(
      (dependency) => ({
        ...dependency,
        requiredContractRefs: [...dependency.requiredContractRefs],
        requiredCapabilityRefs: [...dependency.requiredCapabilityRefs],
      }),
    ),
    provenanceRef: request.verifiedArtifact.provenanceRef,
    declaredCapabilityRefs: [
      ...request.verifiedArtifact.declaredCapabilityRefs,
    ],
    catalogId: request.verifiedArtifact.catalogId,
    catalogDigest: request.verifiedArtifact.catalogDigest,
    publicContracts: request.verifiedArtifact.publicContracts.map(
      (contract) => ({
        ...contract,
        requirementAuthorityRefs: [...contract.requirementAuthorityRefs],
        capabilityIdentities: [...contract.capabilityIdentities],
        ...(contract.nativeTypedLocator === undefined
          ? {}
          : {
            nativeTypedLocator: {
              ...contract.nativeTypedLocator,
              exportedSymbols: [
                ...contract.nativeTypedLocator.exportedSymbols,
              ],
            },
          }),
        ...(contract.assetLocator === undefined
          ? {}
          : { assetLocator: { ...contract.assetLocator } }),
      }),
    ),
    publicContractRefs: [...request.verifiedArtifact.publicContractRefs],
    publicCapabilityRefs: [...request.verifiedArtifact.publicCapabilityRefs],
    resolvedLockId: request.resolvedLock.lockId,
    resolvedLockDigest: request.resolvedLock.lockDigest,
  });
}
