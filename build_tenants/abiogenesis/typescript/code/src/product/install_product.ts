import { execFile } from "node:child_process";
import {
  access,
  lstat,
  mkdir,
  readFile,
  readdir,
  rename,
  rmdir,
  writeFile,
} from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";

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
  isResolvedProductLock,
  verifiedArtifactMatchesResolvedLock,
} from "./environment.js";
import {
  payloadInventoryDigest,
  sha256Canonical,
  sha256File,
  type PayloadInventoryRow,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isVerifiedProductArtifact,
  parseProductManifest,
  verifyProduct,
} from "./verify_product.js";
import {
  createPhysicalArtifactStagingRoot,
  observePhysicalArtifact,
  physicalArtifactEffectEvidence,
  preserveOwnedPhysicalResidue,
  type PhysicalArtifactEffectEvidence,
} from "./physical_artifact_effect.js";

function refusal(
  code: ProductInstallRefusalCode,
  message: string,
  physicalEffect: PhysicalArtifactEffectEvidence | null = null,
): ProductInstallRefusal {
  return {
    kind: "product_install_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
    physicalEffect,
  };
}

class ProductInstallPhysicalRefusal extends Error {
  constructor(
    readonly code: ProductInstallRefusalCode,
    message: string,
  ) {
    super(message);
  }
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

async function isAbsent(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return false;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return true;
    throw error;
  }
}

function installedPackageRoot(targetRoot: string, packageName: string): string | null {
  if (!/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/u.test(packageName)) {
    return null;
  }
  return join(targetRoot, "node_modules", ...packageName.split("/"));
}

interface InstalledPayloadLayout {
  readonly files: readonly string[];
  readonly directories: readonly string[];
}

async function installedPayloadLayout(
  installedRoot: string,
): Promise<InstalledPayloadLayout> {
  const files: string[] = [];
  const directories: string[] = [];
  const visit = async (absolute: string): Promise<void> => {
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) {
      throw new Error(`installed payload contains a symbolic link: ${absolute}`);
    }
    if (stat.isDirectory()) {
      directories.push(
        relative(installedRoot, absolute).split(sep).join("/") || ".",
      );
      for (const entry of (await readdir(absolute)).sort()) {
        await visit(join(absolute, entry));
      }
      return;
    }
    if (stat.isFile()) {
      const locator = relative(installedRoot, absolute).split(sep).join("/");
      if (locator !== "product-toolchain-manifest.json") files.push(locator);
      return;
    }
    throw new Error(`installed payload contains an unsupported entry: ${absolute}`);
  };

  await visit(installedRoot);
  return { files: files.sort(), directories: directories.sort() };
}

function exactPayloadLayout(
  layout: InstalledPayloadLayout,
  expectedFiles: readonly string[],
): boolean {
  const expectedDirectories = new Set(["."]);
  for (const file of expectedFiles) {
    const parts = file.split("/");
    for (let index = 1; index < parts.length; index += 1) {
      expectedDirectories.add(parts.slice(0, index).join("/"));
    }
  }
  return canonicalJson(layout.files) === canonicalJson([...expectedFiles].sort()) &&
    canonicalJson(layout.directories) ===
      canonicalJson([...expectedDirectories].sort());
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
    const expectedFiles = [...installedManifest.productRelativeLocators].sort();
    const layout = await installedPayloadLayout(install.installedRoot);
    if (!exactPayloadLayout(layout, expectedFiles)) return false;
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
    !isVerifiedProductArtifact(request.verifiedArtifact) ||
    !isResolvedProductLock(request.resolvedLock) ||
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

  const currentVerification = await verifyProduct({
    artifactPath: request.artifactPath,
    artifactRef: request.verifiedArtifact.artifactRef,
    expectedArtifactDigest: request.verifiedArtifact.artifactDigest,
    expectedProductContentDigest:
      request.verifiedArtifact.productContentDigest,
    expectedManifestDigest: request.verifiedArtifact.manifestDigest,
    expectedProductId: request.verifiedArtifact.productId,
    expectedPackageName: request.verifiedArtifact.packageName,
    expectedPackageVersion: request.verifiedArtifact.packageVersion,
  });
  if (
    currentVerification.kind !== "verified_product_artifact" ||
    canonicalJson(currentVerification as unknown as JsonValue) !==
      canonicalJson(request.verifiedArtifact as unknown as JsonValue)
  ) {
    return refusal(
      "artifact_mismatch",
      "installation requires current bytes equal to the complete verified Product carrier",
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

  const targetRoot = resolve(request.targetRoot);
  const targetBefore = await observePhysicalArtifact(targetRoot);
  if (targetBefore.disposition === "observation_refused") {
    return refusal(
      "install_failed",
      `installation target could not be observed: ${targetBefore.observationFailure}`,
    );
  }
  if (
    targetBefore.disposition === "observed" &&
    targetBefore.inventory[0]?.artifactKind !== "directory"
  ) {
    return refusal("install_failed", "installation target must be a directory");
  }
  if (
    targetBefore.disposition === "observed" &&
    targetBefore.inventory.length !== 1
  ) {
    return refusal("target_not_empty", "installation target must be empty");
  }

  let stagingRoot: string | null = null;
  const movedLocators: string[] = [];
  let installedRoot: string;
  try {
    if (targetBefore.disposition === "absent") {
      await mkdir(targetRoot, { recursive: false });
    }
    if ((await readdir(targetRoot)).length !== 0) {
      throw new ProductInstallPhysicalRefusal(
        "target_not_empty",
        "installation target changed before staging",
      );
    }
    stagingRoot = await createPhysicalArtifactStagingRoot(
      targetRoot,
      "product_install",
    );
    const consumerPackage = {
      name: "abiogenesis-installed-product-consumer",
      version: "0.0.0",
      private: true,
      type: "module",
    };
    await writeFile(
      join(stagingRoot, "package.json"),
      `${canonicalJson(consumerPackage)}\n`,
      "utf8",
    );
    try {
      await runNpmInstall(stagingRoot, resolve(request.artifactPath));
    } catch (error) {
      throw new ProductInstallPhysicalRefusal("install_failed", String(error));
    }

    const stagedInstalledRoot = installedPackageRoot(
      stagingRoot,
      request.verifiedArtifact.packageName,
    );
    if (stagedInstalledRoot === null) {
      throw new ProductInstallPhysicalRefusal(
        "installed_identity_mismatch",
        "verified package name is not an installable package identity",
      );
    }
    let installedPackage: unknown;
    let installedManifestUnknown: unknown;
    try {
      installedPackage = JSON.parse(
        await readFile(join(stagedInstalledRoot, "package.json"), "utf8"),
      );
      installedManifestUnknown = JSON.parse(
        await readFile(
          join(stagedInstalledRoot, "product-toolchain-manifest.json"),
          "utf8",
        ),
      );
    } catch (error) {
      throw new ProductInstallPhysicalRefusal(
        "installed_identity_mismatch",
        String(error),
      );
    }
    if (
      typeof installedPackage !== "object" ||
      installedPackage === null ||
      !("name" in installedPackage) ||
      !("version" in installedPackage) ||
      installedPackage.name !== request.verifiedArtifact.packageName ||
      installedPackage.version !== request.verifiedArtifact.packageVersion
    ) {
      throw new ProductInstallPhysicalRefusal(
        "installed_identity_mismatch",
        "installed package identity is not the verified identity",
      );
    }

    const installedManifest = parseProductManifest(installedManifestUnknown);
    if (installedManifest === null) {
      throw new ProductInstallPhysicalRefusal(
        "installed_manifest_mismatch",
        "installed manifest shape is invalid",
      );
    }
    const installedManifestDigest = sha256Canonical(
      installedManifest as unknown as JsonValue,
    );
    if (installedManifestDigest !== request.verifiedArtifact.manifestDigest) {
      throw new ProductInstallPhysicalRefusal(
        "installed_manifest_mismatch",
        "installed manifest is not the verified manifest",
      );
    }

    try {
      const expectedFiles = [...installedManifest.productRelativeLocators].sort();
      const layout = await installedPayloadLayout(stagedInstalledRoot);
      if (!exactPayloadLayout(layout, expectedFiles)) {
        throw new ProductInstallPhysicalRefusal(
          "installed_manifest_mismatch",
          "installed payload file set differs from the manifest",
        );
      }
      const inventory: PayloadInventoryRow[] = [];
      for (const path of expectedFiles) {
        inventory.push({
          path,
          sha256: await sha256File(join(stagedInstalledRoot, path)),
        });
      }
      if (
        payloadInventoryDigest(inventory) !==
          request.verifiedArtifact.productContentDigest
      ) {
        throw new ProductInstallPhysicalRefusal(
          "installed_manifest_mismatch",
          "installed payload bytes differ from the verified artifact",
        );
      }
    } catch (error) {
      if (error instanceof ProductInstallPhysicalRefusal) throw error;
      throw new ProductInstallPhysicalRefusal(
        "installed_manifest_mismatch",
        String(error),
      );
    }

    const prohibitedPaths = ["code", "scripts", "test_env", "tsconfig.json"];
    for (const path of prohibitedPaths) {
      if (await exists(join(stagedInstalledRoot, path))) {
        throw new ProductInstallPhysicalRefusal(
          "unexpected_source_surface",
          `installed package contains source-only path: ${path}`,
        );
      }
    }

    const stagedEntries = await readdir(stagingRoot);
    const targetEntries = await readdir(targetRoot);
    if (
      canonicalJson([...stagedEntries].sort()) !== canonicalJson([
        "node_modules",
        "package-lock.json",
        "package.json",
      ]) ||
      targetEntries.length !== 1 ||
      targetEntries[0] !== basename(stagingRoot)
    ) {
      throw new ProductInstallPhysicalRefusal(
        "target_not_empty",
        "installation target changed before commit",
      );
    }
    for (const entry of stagedEntries.sort()) {
      const committedLocator = join(targetRoot, entry);
      if (!(await isAbsent(committedLocator))) {
        throw new ProductInstallPhysicalRefusal(
          "target_not_empty",
          `installation target acquired foreign content before commit: ${entry}`,
        );
      }
      await rename(join(stagingRoot, entry), committedLocator);
      movedLocators.unshift(committedLocator);
    }
    await rmdir(stagingRoot);
    if (
      canonicalJson((await readdir(targetRoot)).sort()) !==
        canonicalJson([...stagedEntries].sort())
    ) {
      throw new ProductInstallPhysicalRefusal(
        "target_not_empty",
        "installation target changed during commit",
      );
    }
    const finalInstalledRoot = installedPackageRoot(
      targetRoot,
      request.verifiedArtifact.packageName,
    );
    if (finalInstalledRoot === null) {
      throw new ProductInstallPhysicalRefusal(
        "installed_identity_mismatch",
        "committed package identity has no lawful installed locator",
      );
    }
    installedRoot = finalInstalledRoot;
    const committedFiles = [...installedManifest.productRelativeLocators].sort();
    const committedLayout = await installedPayloadLayout(installedRoot);
    if (!exactPayloadLayout(committedLayout, committedFiles)) {
      throw new ProductInstallPhysicalRefusal(
        "installed_manifest_mismatch",
        "committed payload file set differs from the verified manifest",
      );
    }
    const committedInventory: PayloadInventoryRow[] = [];
    for (const path of committedFiles) {
      committedInventory.push({
        path,
        sha256: await sha256File(join(installedRoot, path)),
      });
    }
    if (
      payloadInventoryDigest(committedInventory) !==
        request.verifiedArtifact.productContentDigest
    ) {
      throw new ProductInstallPhysicalRefusal(
        "installed_manifest_mismatch",
        "committed payload bytes differ from the verified artifact",
      );
    }
  } catch (error) {
    const targetAtFailure = await observePhysicalArtifact(targetRoot);
    const stagingAtFailure = stagingRoot === null
      ? null
      : await observePhysicalArtifact(stagingRoot);
    const compensation = await preserveOwnedPhysicalResidue({
      owner: "product_install",
      targetRoot,
      stagingRoot,
      targetBefore,
      targetAtFailure,
      stagingAtFailure,
      ownedLocators: [
        ...movedLocators,
        ...(stagingRoot === null ? [] : [stagingRoot]),
      ],
    });
    const targetAfter = await observePhysicalArtifact(targetRoot);
    const stagingAfter = stagingRoot === null
      ? null
      : await observePhysicalArtifact(stagingRoot);
    const cause = error instanceof ProductInstallPhysicalRefusal
      ? error
      : new ProductInstallPhysicalRefusal("install_failed", String(error));
    return refusal(
      cause.code,
      cause.message,
      physicalArtifactEffectEvidence(
        "product_install",
        targetRoot,
        stagingRoot,
        targetBefore,
        targetAtFailure,
        stagingAtFailure,
        compensation,
        targetAfter,
        stagingAfter,
      ),
    );
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
              declarationInventory:
                contract.nativeTypedLocator.declarationInventory.map(
                  (entry) => ({ ...entry }),
                ),
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
