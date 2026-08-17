import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const manifestPath = join(root, "product-toolchain-manifest.json");
const publicSchemaPath = "contracts/schemas/public-operation.schema.json";
const publicOperatorCapability =
  "abg.capability.operator.public-contract@5";
const generatedDirectoryPaths = Object.freeze([
  "contracts/public-functions",
  "contracts/public-operations",
  "contracts/schemas/operations",
]);
const generatorPath = join(root, "scripts/generate-product-manifest.mjs");
const sharedProjectionOwner =
  "../build/code/src/shared/public_function_projections.js";

test("W2-05 generator imports projections from the exact shared owner", async () => {
  const source = await readFile(generatorPath, "utf8");
  const namedImports = [...source.matchAll(
    /import\s*\{(?<bindings>[^}]*)\}\s*from\s*"(?<source>[^"]+)";/gu,
  )].map(({ groups }) => ({
    bindings: groups.bindings.split(",").map((binding) => binding.trim()),
    source: groups.source,
  }));
  const projectionOwners = namedImports
    .filter(({ bindings }) => bindings.includes("PUBLIC_PROJECTION_PAYLOADS"))
    .map(({ source: importSource }) => importSource);

  assert.deepEqual(projectionOwners, [sharedProjectionOwner]);
  assert.equal(
    namedImports.some(({ source: importSource }) =>
      importSource === "../build/code/src/public/index.js"
    ),
    false,
  );
});

async function walkFiles(directory) {
  const files = [];
  async function visit(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) await visit(child);
      else if (entry.isFile()) {
        files.push(relative(root, child).replaceAll("\\", "/"));
      }
    }
  }
  await visit(directory);
  return files.sort();
}

async function builtApi(cacheKey) {
  const moduleUrl = (path) =>
    `${pathToFileURL(join(root, path)).href}?w2_05=${cacheKey}`;
  const [canonical, digests, declarations, family, projections, publication] =
    await Promise.all([
      import(moduleUrl("build/code/src/shared/canonical_json.js")),
      import(moduleUrl("build/code/src/shared/digests.js")),
      import(moduleUrl("build/code/src/product/declaration_exports.js")),
      import(moduleUrl("build/code/src/shared/public_function_family.js")),
      import(moduleUrl("build/code/src/shared/public_function_projections.js")),
      import(moduleUrl("build/code/src/product/public_contract_publication.js")),
    ]);
  return { canonical, declarations, digests, family, projections, publication };
}

async function exactPublicDeclarationClosure(manifest, declarations) {
  const packageJson = JSON.parse(
    await readFile(join(root, "package.json"), "utf8"),
  );
  const declarationSources = await Promise.all(
    manifest.productRelativeLocators
      .filter((path) => /\.d\.(?:c|m)?ts$/u.test(path))
      .map(async (path) => ({ path, bytes: await readFile(join(root, path)) })),
  );
  const closures = await declarations.resolveNativeDeclarationClosures({
    packageName: packageJson.name,
    packageType: packageJson.type === "module" ? "module" : "commonjs",
    packageExports: packageJson.exports,
    declarationSources,
  });
  assert.ok(closures, "generated declarations must form exact export closures");
  const publicClosures = closures.filter(
    ({ packageExportPath }) => packageExportPath === "./public",
  );
  assert.equal(publicClosures.length, 1, "./public closure must be exact");
  return publicClosures[0];
}

async function generatedSnapshot(run, api) {
  const { canonicalJson } = api.canonical;
  const { payloadInventoryDigest, sha256Bytes, sha256Canonical } = api.digests;
  const { PUBLIC_FUNCTION_DEFINITION_FAMILY } = api.family;
  const { PUBLIC_PROJECTION_PAYLOADS } = api.projections;
  const {
    S06_REPLACEMENT_CONTRACT_IDS,
    bindS06PublicFunctionCatalog,
    derivePublicCatalogRowProposals,
  } = api.publication;

  const expectedAssets = [...PUBLIC_PROJECTION_PAYLOADS.assets]
    .sort((left, right) => left.path.localeCompare(right.path));
  const expectedPaths = expectedAssets.map(({ path }) => path).sort();
  const actualPaths = [
    publicSchemaPath,
    ...(await Promise.all(generatedDirectoryPaths.map((path) =>
      walkFiles(join(root, path))
    ))).flat(),
  ].sort();
  assert.deepEqual(actualPaths, expectedPaths, "generated payload exact set");
  assert.equal(PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.length, 18);
  assert.equal(PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.length, 56);

  const assetHashes = [];
  for (const asset of expectedAssets) {
    const bytes = await readFile(join(root, asset.path));
    assert.equal(bytes.toString("utf8"), asset.bytes, asset.path);
    assert.equal(sha256Bytes(bytes), asset.contentDigest, asset.path);
    assetHashes.push({ path: asset.path, sha256: sha256Bytes(bytes) });
  }

  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const selectedManifestPaths = manifest.productRelativeLocators
    .filter((path) => expectedPaths.includes(path))
    .sort();
  assert.deepEqual(
    selectedManifestPaths,
    expectedPaths,
    "manifest must locate the exact generated projection set",
  );
  assert.equal(manifest.schemaVersion, "5.0.0");
  assert.equal(manifest.publicContractCatalog.schemaVersion, "5.0.0");
  assert.equal(manifest.publicContractCatalog.catalogVersion, "5.0.0");
  assert.ok(manifest.declaredCapabilityRefs.includes(publicOperatorCapability));

  const catalog = manifest.publicContractCatalog;
  const replacementIds = [...S06_REPLACEMENT_CONTRACT_IDS].sort();
  const replacementIdSet = new Set(replacementIds);
  const projectedRows = catalog.rows.filter(({ contractId }) =>
    replacementIdSet.has(contractId)
  );
  assert.deepEqual(
    projectedRows.map(({ contractId }) => contractId).sort(),
    replacementIds,
    "catalog must contain the exact 3 common plus 18 operation rows",
  );
  assert.ok(projectedRows.every(({ contractVersion }) =>
    contractVersion === "5.0.0"
  ));
  const operationRows = projectedRows.filter(({ contractId }) =>
    contractId.startsWith("abg.operation.")
  );
  assert.equal(operationRows.length, 18);
  assert.equal(new Set(operationRows.map(({ contractId }) => contractId)).size, 18);

  const publicClosure = await exactPublicDeclarationClosure(
    manifest,
    api.declarations,
  );
  const proposalSet = derivePublicCatalogRowProposals(
    manifest.productId,
    manifest.packageName,
    publicClosure,
  );
  assert.equal(proposalSet.proposals.length, 21);
  assert.equal(
    canonicalJson(proposalSet.proposals),
    canonicalJson(projectedRows),
    "catalog rows must be the exact PFC-F07 proposals",
  );
  assert.ok(projectedRows.every(({ nativeTypedLocator }) =>
    nativeTypedLocator.packageExportPath === "./public"
  ));

  const retainedRows = catalog.rows.filter(({ contractId }) =>
    !replacementIdSet.has(contractId)
  );
  const extantCatalogFields = {
    schemaVersion: "5.0.0",
    catalogId: catalog.catalogId,
    catalogVersion: "5.0.0",
    catalogSchemaPath: catalog.catalogSchemaPath,
    catalogSchemaDigest: catalog.catalogSchemaDigest,
    rows: structuredClone(retainedRows),
  };
  const extantCatalog = {
    ...extantCatalogFields,
    catalogDigest: sha256Canonical(extantCatalogFields),
  };
  const binding = bindS06PublicFunctionCatalog({
    extantCatalog,
    extantCatalogCoordinate: {
      productId: manifest.productId,
      productContentDigest: manifest.productContentDigest,
      catalogId: extantCatalog.catalogId,
      catalogVersion: extantCatalog.catalogVersion,
      catalogDigest: extantCatalog.catalogDigest,
    },
    productId: manifest.productId,
    productContentDigest: manifest.productContentDigest,
    proposalSequence: proposalSet.proposals,
    publicPackageName: manifest.packageName,
    publicDeclarationClosure: publicClosure,
  });
  assert.equal(binding.disposition, "bound", JSON.stringify(binding));
  assert.equal(
    canonicalJson(binding.catalog),
    canonicalJson(catalog),
    "manifest catalog must be the one PFC-F08 binding result",
  );
  assert.equal(
    canonicalJson(binding.catalog.rows.filter(({ contractId }) =>
      !replacementIdSet.has(contractId)
    )),
    canonicalJson(retainedRows),
    "PFC-F08 must retain every non-S06 row byte-for-byte",
  );

  const { catalogDigest, ...catalogBody } = catalog;
  assert.equal(sha256Canonical(catalogBody), catalogDigest);
  const payloadInventory = await Promise.all(
    manifest.productRelativeLocators.map(async (path) => ({
      path,
      sha256: sha256Bytes(await readFile(join(root, path))),
    })),
  );
  assert.equal(
    payloadInventoryDigest(payloadInventory),
    manifest.productContentDigest,
  );

  return {
    run,
    assetHashes,
    assetSetDigest: sha256Canonical(assetHashes),
    catalogRowsDigest: sha256Canonical(catalog.rows),
    retainedRowsDigest: sha256Canonical(retainedRows),
    catalogDigest,
    productContentDigest: manifest.productContentDigest,
    manifestDigest: sha256Bytes(manifestBytes),
    manifestBytes,
    catalogRowsBytes: canonicalJson(catalog.rows),
    operationIds: operationRows.map(({ contractId }) => contractId).sort(),
    generatedAssetPaths: expectedPaths,
  };
}

async function verifyPackedProduct(artifactPath, extractRoot, api) {
  await execFileAsync("tar", ["-xzf", artifactPath, "-C", extractRoot]);
  const productRoot = join(extractRoot, "package");
  const packedManifest = JSON.parse(
    await readFile(join(productRoot, "product-toolchain-manifest.json"), "utf8"),
  );
  const productUrl = pathToFileURL(
    join(productRoot, "build/code/src/product/index.js"),
  ).href;
  const product = await import(`${productUrl}?packed_w2_05=${Date.now()}`);
  const artifactBytes = await readFile(artifactPath);
  const request = {
    artifactPath,
    artifactRef: basename(artifactPath),
    expectedArtifactDigest: product.sha256Bytes(artifactBytes),
    expectedProductContentDigest: packedManifest.productContentDigest,
    expectedManifestDigest: product.sha256Canonical(packedManifest),
    expectedProductId: packedManifest.productId,
    expectedPackageName: packedManifest.packageName,
    expectedPackageVersion: packedManifest.packageVersion,
  };
  const verified = await product.verifyProduct(request);
  assert.equal(verified.kind, "verified_product_artifact", JSON.stringify(verified));
  assert.equal(product.isVerifiedProductArtifact(verified), true);
  assert.ok(verified.definitionContractCoordinates);
  assert.equal(verified.definitionContractCoordinates.operations.length, 18);
  assert.equal(
    verified.definitionContractCoordinates.operations.flatMap(({ members }) =>
      members
    ).length,
    56,
  );
  const { verificationDigest, verificationRef, ...verificationBody } = verified;
  assert.ok(verificationBody.definitionContractCoordinates);
  assert.equal(product.sha256Canonical(verificationBody), verificationDigest);
  assert.equal(
    verificationRef,
    `product-verification://abiogenesis/${verificationDigest.slice(7)}`,
  );
  return {
    artifactDigest: request.expectedArtifactDigest,
    definitionCount: 56,
    operationCount: 18,
    verificationDigest,
    verificationRef,
  };
}

test("W2-05 generator is reproducible and the real pack verifies 18/56", async () => {
  const snapshots = [];
  let api;
  for (const run of [1, 2]) {
    await execFileAsync("npm", ["run", "build"], {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
    });
    api ??= await builtApi(`run-${run}-${Date.now()}`);
    snapshots.push(await generatedSnapshot(run, api));
  }

  const [first, second] = snapshots;
  assert.deepEqual(second.assetHashes, first.assetHashes);
  assert.equal(second.catalogRowsBytes, first.catalogRowsBytes);
  assert.equal(second.catalogDigest, first.catalogDigest);
  assert.equal(second.productContentDigest, first.productContentDigest);
  assert.deepEqual(second.manifestBytes, first.manifestBytes);

  const artifacts = join(root, "artifacts");
  await rm(artifacts, { recursive: true, force: true });
  await mkdir(artifacts, { recursive: true });
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 64 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  assert.equal(typeof packResult.filename, "string");
  const artifactPath = join(artifacts, packResult.filename);
  const extractRoot = await mkdtemp(join(tmpdir(), "abi5-w2-05-pack-"));
  let packedVerification;
  try {
    packedVerification = await verifyPackedProduct(artifactPath, extractRoot, api);
  } finally {
    await rm(extractRoot, { recursive: true, force: true });
  }

  const evidence = {
    kind: "t287_w2_05_generator_package_reproducibility_proof",
    schemaVersion: "5.0.0",
    result: "satisfied",
    generatedProjection: {
      assetPaths: second.generatedAssetPaths,
      assetSetDigest: second.assetSetDigest,
      operationIds: second.operationIds,
      operationCount: 18,
      definitionCount: 56,
    },
    reproducibility: {
      buildCount: 2,
      selectedAssetBytesEqual: true,
      catalogRowsEqual: true,
      catalogDigestEqual: true,
      productContentDigestEqual: true,
      manifestBytesEqual: true,
      runs: snapshots.map((snapshot) => ({
        run: snapshot.run,
        assetSetDigest: snapshot.assetSetDigest,
        catalogRowsDigest: snapshot.catalogRowsDigest,
        retainedRowsDigest: snapshot.retainedRowsDigest,
        catalogDigest: snapshot.catalogDigest,
        productContentDigest: snapshot.productContentDigest,
        manifestDigest: snapshot.manifestDigest,
      })),
    },
    package: {
      filename: packResult.filename,
      integrity: packResult.integrity,
      shasum: packResult.shasum,
      ...packedVerification,
    },
  };
  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "t287-w2-05-generator-package.json"),
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8",
  );
});
