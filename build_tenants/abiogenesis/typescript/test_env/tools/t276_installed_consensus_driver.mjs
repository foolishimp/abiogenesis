// Source-blind installed Consensus qualification driver for T-276.

import { createHash } from "node:crypto";
import { lstat, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

const REQUIRED_CONTRACT_COORDINATES = Object.freeze([
  Object.freeze({ path: "invocationSchemaPath", digest: "invocationSchemaDigest" }),
  Object.freeze({ path: "requestSchemaPath", digest: "requestSchemaDigest" }),
  Object.freeze({ path: "resultSchemaPath", digest: "resultSchemaDigest" }),
  Object.freeze({ path: "refusalSchemaPath", digest: "refusalSchemaDigest" })
]);
const SHA256_DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const CANONICAL_ORACLE_DIGEST =
  "sha256:2ec08e37bf29940de3386890396e5198b52a395301b1d31c667eda5502af0fb5";
const CANONICAL_REQUIREMENT_SOURCE_DIGEST =
  "sha256:eed6bfd474d8e572a82d25a7e227f5e1e447f0f78f75933a32fdaf3ed7c43764";

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function canonicalizeIJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeIJson).join(",")}]`;
  }
  return `{${Object.keys(value).sort(compareText).map(
    (key) => `${JSON.stringify(key)}:${canonicalizeIJson(value[key])}`
  ).join(",")}}`;
}

function digestCanonicalIJson(value) {
  return sha256(Buffer.from(canonicalizeIJson(value), "utf8"));
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function insideRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function gap(coordinate, reason, delta = null) {
  return Object.freeze({
    kind: "frontier_gap",
    phase: "p2_packed_operation_family",
    coordinate: Object.freeze(coordinate),
    reason,
    familyDelta: delta === null ? null : Object.freeze(delta),
    targetOperationInvocationCount: 0
  });
}

function admitQualificationOracle(value) {
  if (
    !isObject(value) ||
    value.kind !== "t276_public_operation_family_qualification_oracle" ||
    value.schemaVersion !== 1 ||
    value.ordering !== "REQ-P-PUBLIC-CONTRACTS-008-table-order" ||
    !isObject(value.basis) ||
    value.basis.targetRequirementRef !==
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-008" ||
    value.basis.targetRequirementSourceDigest !==
      CANONICAL_REQUIREMENT_SOURCE_DIGEST ||
    value.basis.steelThreadDesignDigest !==
      "1cca67612f32171edcaf597c0ec98f1208481d577f5496e097b5f6ff07e7d636" ||
    !Array.isArray(value.targetOperationIds) ||
    value.targetOperationIds.length !== 19 ||
    value.targetOperationIds.some(
      (identity) =>
        typeof identity !== "string" ||
        !identity.startsWith("abg.operation.")
    ) ||
    new Set(value.targetOperationIds).size !== value.targetOperationIds.length
  ) {
    throw new TypeError("invalid T-276 operation-family qualification oracle");
  }
  return Object.freeze({
    ...value,
    basis: Object.freeze({ ...value.basis }),
    targetOperationIds: Object.freeze([...value.targetOperationIds])
  });
}

function catalogDigestBasis(catalog) {
  const { catalogDigest, ...basis } = catalog;
  void catalogDigest;
  return basis;
}

async function installedAssetBytes(packageRoot, relativePath) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }
  try {
    const resolvedRoot = await realpath(packageRoot);
    const resolvedAsset = await realpath(path.join(packageRoot, relativePath));
    if (!insideRoot(resolvedRoot, resolvedAsset)) {
      return null;
    }
    return await readFile(resolvedAsset);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function verifyManifestCatalog(packageRoot, packageManifest, catalog) {
  const manifestBytes = await installedAssetBytes(
    packageRoot,
    "product-toolchain-manifest.json"
  );
  const catalogSchemaBytes = await installedAssetBytes(
    packageRoot,
    catalog.catalogSchemaPath
  );
  if (manifestBytes === null || catalogSchemaBytes === null) {
    return false;
  }
  const manifest = JSON.parse(manifestBytes);
  return (
    manifest.packageName === packageManifest.name &&
    manifest.packageVersion === packageManifest.version &&
    manifest.publicContractCatalogPath ===
      "contracts/public-contract-catalog.json" &&
    manifest.publicContractCatalogDigest === catalog.catalogDigest &&
    canonicalizeIJson(manifest.publicContractCatalog) ===
      canonicalizeIJson(catalog) &&
    digestCanonicalIJson(catalogDigestBasis(catalog)) ===
      catalog.catalogDigest &&
    sha256(catalogSchemaBytes) === catalog.catalogSchemaDigest &&
    Array.isArray(manifest.productRelativeLocators) &&
    manifest.productRelativeLocators.includes(
      "contracts/public-contract-catalog.json"
    )
  );
}

async function verifyOperationAssets(packageRoot, row, manifestLocators, cache) {
  if (!isObject(row?.assetLocator) || !isObject(row.operationContract)) {
    return false;
  }
  const operationAssetPath = row.assetLocator.relativePath;
  if (!manifestLocators.has(operationAssetPath)) {
    return false;
  }
  const operationBytes = await installedAssetBytes(packageRoot, operationAssetPath);
  if (operationBytes === null || sha256(operationBytes) !== row.digest) {
    return false;
  }
  let operationAsset;
  try {
    operationAsset = JSON.parse(operationBytes);
  } catch {
    return false;
  }
  if (!isObject(operationAsset)) {
    return false;
  }
  const { operationDigest, ...publishedBasis } = row.operationContract;
  void operationDigest;
  const { kind, schemaVersion, ...assetBasis } = operationAsset;
  if (
    kind !== "abg_public_operation_contract" ||
    schemaVersion !== 1 ||
    canonicalizeIJson(publishedBasis) !== canonicalizeIJson(assetBasis)
  ) {
    return false;
  }
  for (const coordinate of REQUIRED_CONTRACT_COORDINATES) {
    const schemaPath = row.operationContract[coordinate.path];
    const expectedDigest = row.operationContract[coordinate.digest];
    if (!manifestLocators.has(schemaPath)) {
      return false;
    }
    let actualDigest = cache.get(schemaPath);
    if (actualDigest === undefined) {
      const bytes = await installedAssetBytes(packageRoot, schemaPath);
      actualDigest = bytes === null ? null : sha256(bytes);
      cache.set(schemaPath, actualDigest);
    }
    if (actualDigest !== expectedDigest) {
      return false;
    }
  }
  return true;
}

async function verifyPresentOperationAssets(packageRoot, catalog, oracle) {
  const manifestBytes = await installedAssetBytes(
    packageRoot,
    "product-toolchain-manifest.json"
  );
  if (manifestBytes === null) {
    return [...oracle.targetOperationIds];
  }
  const manifest = JSON.parse(manifestBytes);
  const manifestLocators = new Set(manifest.productRelativeLocators ?? []);
  const operationRows = catalog.rows.filter(
    (row) => row?.contractKind === "operation"
  );
  const cache = new Map();
  const incomplete = [];
  for (const operationId of oracle.targetOperationIds) {
    const matches = operationRows.filter((row) => row.contractId === operationId);
    if (matches.length !== 1) {
      continue;
    }
    if (
      !await verifyOperationAssets(
        packageRoot,
        matches[0],
        manifestLocators,
        cache
      )
    ) {
      incomplete.push(operationId);
    }
  }
  return incomplete;
}

function mergeIncompleteDelta(delta, assetIncomplete, targetOrder) {
  const incomplete = new Set([
    ...delta.incompleteTargetOperationIds,
    ...assetIncomplete
  ]);
  return Object.freeze({
    ...delta,
    incompleteTargetOperationIds: Object.freeze(
      targetOrder.filter((operationId) => incomplete.has(operationId))
    )
  });
}

function preflightPackedOperationFamily(catalog, oracle) {
  if (!isObject(catalog) || !Array.isArray(catalog.rows)) {
    return gap(
      { kind: "packed_asset", asset: "public_contract_catalog" },
      "malformed_public_contract_catalog"
    );
  }
  const rows = catalog.rows.filter((row) => row?.contractKind === "operation");
  const byIdentity = new Map();
  for (const row of rows) {
    if (typeof row?.contractId !== "string") {
      continue;
    }
    const matches = byIdentity.get(row.contractId) ?? [];
    matches.push(row);
    byIdentity.set(row.contractId, matches);
  }

  const targetIds = new Set(oracle.targetOperationIds);
  const missingTargetOperationIds = oracle.targetOperationIds.filter(
    (operationId) => !byIdentity.has(operationId)
  );
  const duplicateTargetOperationIds = oracle.targetOperationIds.filter(
    (operationId) => (byIdentity.get(operationId)?.length ?? 0) > 1
  );
  const incompleteTargetOperationIds = oracle.targetOperationIds.filter(
    (operationId) => {
      const row = byIdentity.get(operationId)?.[0];
      return row !== undefined && (
        !isObject(row.operationContract) ||
        row.operationContract.operationId !== operationId ||
        !SHA256_DIGEST_PATTERN.test(row.digest) ||
        !isObject(row.assetLocator) ||
        row.assetLocator.digest !== row.digest ||
        row.operationContract.operationDigest !== row.digest ||
        REQUIRED_CONTRACT_COORDINATES.some(
          (coordinate) =>
            typeof row.operationContract[coordinate.path] !== "string" ||
            row.operationContract[coordinate.path].length === 0 ||
            !SHA256_DIGEST_PATTERN.test(
              row.operationContract[coordinate.digest]
            )
        )
      );
    }
  );
  const retiredOperationIds = [...byIdentity.keys()]
    .filter((operationId) => !targetIds.has(operationId))
    .sort(compareText);
  const familyDelta = {
    missingTargetOperationIds: Object.freeze(missingTargetOperationIds),
    duplicateTargetOperationIds: Object.freeze(duplicateTargetOperationIds),
    incompleteTargetOperationIds: Object.freeze(incompleteTargetOperationIds),
    retiredOperationIds: Object.freeze(retiredOperationIds)
  };

  if (missingTargetOperationIds.length > 0) {
    return gap(
      {
        kind: "operation_identity",
        operationId: missingTargetOperationIds[0]
      },
      "operation_family_mismatch",
      familyDelta
    );
  }
  if (duplicateTargetOperationIds.length > 0) {
    return gap(
      {
        kind: "operation_identity",
        operationId: duplicateTargetOperationIds[0]
      },
      "operation_family_mismatch",
      familyDelta
    );
  }
  if (incompleteTargetOperationIds.length > 0) {
    return gap(
      {
        kind: "operation_contract",
        operationId: incompleteTargetOperationIds[0]
      },
      "operation_family_mismatch",
      familyDelta
    );
  }
  if (retiredOperationIds.length > 0 || rows.length !== oracle.targetOperationIds.length) {
    return gap(
      {
        kind: "retired_operation_identity",
        operationId: retiredOperationIds[0] ?? null
      },
      "operation_family_mismatch",
      familyDelta
    );
  }
  return Object.freeze({
    kind: "accepted_exact_operation_family",
    familyDelta: Object.freeze(familyDelta)
  });
}

async function installedFile(packageRoot, candidate, asset) {
  const resolvedRoot = await realpath(packageRoot);
  const resolvedCandidate = await realpath(candidate);
  if (
    !insideRoot(resolvedRoot, resolvedCandidate) ||
    !(await stat(resolvedCandidate)).isFile()
  ) {
    return gap(
      { kind: "packed_asset", asset },
      "installed_asset_outside_candidate"
    );
  }
  return null;
}

async function runInstalledConsensusScenario(config) {
  const packageRoot = path.resolve(config.packageRoot);
  const packageEntry = await lstat(packageRoot);
  if (!packageEntry.isDirectory() || packageEntry.isSymbolicLink()) {
    return gap(
      { kind: "packed_asset", asset: "installed_package_root" },
      "installed_package_is_not_detached_directory"
    );
  }
  const packageJsonPath = path.join(packageRoot, "package.json");
  const catalogPath = path.join(packageRoot, "contracts/public-contract-catalog.json");
  for (const [candidate, asset] of [
    [packageJsonPath, "package_manifest"],
    [catalogPath, "public_contract_catalog"],
    [config.cliPath, "abg_cli"]
  ]) {
    const assetGap = await installedFile(packageRoot, candidate, asset);
    if (assetGap !== null) {
      return assetGap;
    }
  }

  const artifactDigest = sha256(await readFile(path.resolve(config.artifactPath)));
  if (artifactDigest !== config.expectedArtifactDigest) {
    return gap(
      { kind: "packed_asset", asset: "candidate_artifact_digest" },
      "candidate_artifact_digest_mismatch"
    );
  }
  const oracleBytes = await readFile(path.resolve(config.qualificationOraclePath));
  if (sha256(oracleBytes) !== CANONICAL_ORACLE_DIGEST) {
    return gap(
      { kind: "qualification_oracle", asset: "public_operation_family" },
      "qualification_oracle_digest_mismatch"
    );
  }

  const oracle = admitQualificationOracle(JSON.parse(oracleBytes));
  const packageManifest = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  if (!await verifyManifestCatalog(packageRoot, packageManifest, catalog)) {
    return gap(
      { kind: "packed_asset", asset: "manifest_catalog_family" },
      "installed_publication_incoherent"
    );
  }
  const family = preflightPackedOperationFamily(catalog, oracle);
  const evidence = {
    candidate: Object.freeze({
      artifactDigest,
      packageName: packageManifest.name,
      packageVersion: packageManifest.version,
      catalogDigest: catalog.catalogDigest ?? null,
      catalogVersion: catalog.catalogVersion ?? null
    }),
    qualificationOracle: Object.freeze({
      digest: CANONICAL_ORACLE_DIGEST,
      ordering: oracle.ordering,
      targetRequirementSourceDigest:
        oracle.basis.targetRequirementSourceDigest,
      steelThreadDesignDigest: oracle.basis.steelThreadDesignDigest
    }),
    workspace: Object.freeze({
      application: "temporary",
      requestedRoot: path.resolve(config.workspaceRoot),
      workspaceOperationInvoked: false
    })
  };
  if (family.familyDelta === null || family.familyDelta === undefined) {
    return Object.freeze({ ...family, ...evidence });
  }
  const assetIncompleteTargetOperationIds = await verifyPresentOperationAssets(
    packageRoot,
    catalog,
    oracle
  );
  const mergedFamilyDelta = mergeIncompleteDelta(
    family.familyDelta,
    assetIncompleteTargetOperationIds,
    oracle.targetOperationIds
  );
  if (family.kind !== "accepted_exact_operation_family") {
    return Object.freeze({
      ...family,
      familyDelta: mergedFamilyDelta,
      ...evidence
    });
  }

  const incompleteTargetOperationIds =
    mergedFamilyDelta.incompleteTargetOperationIds;
  if (incompleteTargetOperationIds.length > 0) {
    return Object.freeze({
      ...gap(
        {
          kind: "operation_contract",
          operationId: incompleteTargetOperationIds[0]
        },
        "operation_family_mismatch",
        {
          missingTargetOperationIds: Object.freeze([]),
          duplicateTargetOperationIds: Object.freeze([]),
          incompleteTargetOperationIds: Object.freeze(
            incompleteTargetOperationIds
          ),
          retiredOperationIds: Object.freeze([])
        }
      ),
      ...evidence
    });
  }

  return Object.freeze({
    kind: "frontier_gap",
    phase: "installed_consensus_driver",
    coordinate: Object.freeze({
      kind: "delivery_step",
      operationId: "abg.operation.workspace.create"
    }),
    reason: "installed_consensus_invocation_not_yet_realized",
    familyDelta: null,
    targetOperationInvocationCount: 0,
    ...evidence
  });
}

async function main() {
  const flag = process.argv.indexOf("--config");
  const configPath = flag < 0 ? undefined : process.argv[flag + 1];
  if (typeof configPath !== "string" || configPath.length === 0) {
    throw new TypeError("expected --config <path>");
  }
  const config = JSON.parse(await readFile(path.resolve(configPath), "utf8"));
  process.stdout.write(`${JSON.stringify(await runInstalledConsensusScenario(config))}\n`);
}

await main();
