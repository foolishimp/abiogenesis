import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

import { canonicalJson } from
  "../../build/code/src/shared/canonical_json.js";
import {
  payloadInventoryDigest,
  sha256Bytes,
  sha256Canonical,
} from "../../build/code/src/shared/digests.js";
import { PUBLIC_PROJECTION_PAYLOADS } from
  "../../build/code/src/shared/public_function_projections.js";
import { resolveNativeDeclarationClosures } from
  "../../build/code/src/product/declaration_exports.js";
import {
  bindS06PublicFunctionCatalog,
  derivePublicCatalogRowProposals,
} from "../../build/code/src/product/public_contract_publication.js";
import * as productApi from "../../build/code/src/product/index.js";
import * as verificationContractModule from
  "../../build/code/src/product/verification_operation_contracts.js";

const execFileAsync = promisify(execFile);
const manifestName = "product-toolchain-manifest.json";
const adapterPath = "contracts/public-functions/adapter-projection.json";
const operationPathPattern =
  /^contracts\/public-operations\/.+\/operation-contract\.json$/u;

async function walkFiles(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(root, path));
    else if (entry.isFile()) files.push(relative(root, path).replaceAll("\\", "/"));
  }
  return files.sort();
}

async function writeCanonicalJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${canonicalJson(value)}\n`, "utf8");
}

async function packagePayloadFiles(packageDirectory) {
  const locators = (await walkFiles(packageDirectory))
    .filter((path) => path !== manifestName);
  const files = new Map();
  for (const path of locators) {
    files.set(path, await readFile(join(packageDirectory, path)));
  }
  return { files, locators };
}

async function nativeClosures(packageDirectory) {
  const { files } = await packagePayloadFiles(packageDirectory);
  const packageJson = JSON.parse(
    await readFile(join(packageDirectory, "package.json"), "utf8"),
  );
  const declarationSources = [...files.entries()]
    .filter(([path]) => /\.d\.(?:c|m)?ts$/u.test(path))
    .map(([path, bytes]) => ({ path, bytes }));
  const sourceProductContentDigest = sha256Canonical({
    kind: "pfc_f08a_native_declaration_probe",
    declarations: declarationSources.map(({ path, bytes }) => ({
      path,
      declarationDigest: sha256Bytes(bytes),
    })).sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0),
  });
  const closures = await resolveNativeDeclarationClosures({
    packageName: packageJson.name,
    packageType: packageJson.type === "module" ? "module" : "commonjs",
    packageExports: packageJson.exports,
    declarationSources,
    sourceProductContentDigest,
  });
  assert.ok(closures, "temporary package declarations must form a program");
  return { closures, packageJson };
}

async function resealCatalogAssets(manifest, packageDirectory) {
  for (const row of manifest.publicContractCatalog.rows) {
    if (row.assetLocator !== undefined) {
      const digest = sha256Bytes(await readFile(join(
        packageDirectory,
        row.assetLocator.path,
      )));
      row.assetLocator.contentDigest = digest;
      if (row.contractKind !== "native_typed_group") row.contractDigest = digest;
    }
    if (row.contractKind === "native_typed_group") {
      row.contractDigest = sha256Canonical(
        row.nativeTypedLocator.declarationInventory,
      );
    }
  }
  manifest.publicContractCatalog.catalogSchemaDigest = sha256Bytes(
    await readFile(join(
      packageDirectory,
      manifest.publicContractCatalog.catalogSchemaPath,
    )),
  );
  const { catalogDigest: _catalogDigest, ...catalogFields } =
    manifest.publicContractCatalog;
  manifest.publicContractCatalog.catalogDigest = sha256Canonical(catalogFields);
}

async function sealCandidate(candidateRoot, packageDirectory, manifest) {
  await resealCatalogAssets(manifest, packageDirectory);
  const { files, locators } = await packagePayloadFiles(packageDirectory);
  manifest.productRelativeLocators = locators;
  manifest.productContentDigest = payloadInventoryDigest(
    [...files.entries()].map(([path, bytes]) => ({
      path,
      sha256: sha256Bytes(bytes),
    })),
  );
  manifest.contributionManifest.productContentDigest =
    manifest.productContentDigest;
  manifest.contributionManifest.publicContractCatalogId =
    manifest.publicContractCatalog.catalogId;
  manifest.contributionManifest.publicContractCatalogDigest =
    manifest.publicContractCatalog.catalogDigest;
  manifest.contributionManifestDigest = sha256Canonical(
    manifest.contributionManifest,
  );
  await writeCanonicalJson(join(packageDirectory, manifestName), manifest);

  const artifactPath = join(candidateRoot, "candidate.tgz");
  await execFileAsync(
    "tar",
    ["-czf", artifactPath, "-C", candidateRoot, "package"],
  );
  return {
    artifactPath,
    artifactRef: `artifact://t287-pfc-f08a/${candidateRoot.split("/").at(-1)}`,
    expectedArtifactDigest: sha256Bytes(await readFile(artifactPath)),
    expectedProductContentDigest: manifest.productContentDigest,
    expectedManifestDigest: sha256Canonical(manifest),
    expectedProductId: manifest.productId,
    expectedPackageName: manifest.packageName,
    expectedPackageVersion: manifest.packageVersion,
  };
}

async function constructLawfulCandidate(temporaryRoot) {
  const candidateRoot = join(temporaryRoot, "lawful");
  const packageDirectory = join(candidateRoot, "package");
  await mkdir(packageDirectory, { recursive: true });
  await writeCanonicalJson(join(packageDirectory, "package.json"), {
    name: productApi.ABI5_PACKAGE_NAME,
    version: productApi.ABI5_PACKAGE_VERSION,
    type: "module",
    exports: {
      "./public": {
        types: "./public.d.ts",
        import: "./public.js",
      },
    },
  });
  await writeFile(
    join(packageDirectory, "public.d.ts"),
    "export declare const PUBLIC_OPERATION_SCHEMAS: Readonly<Record<string, unknown>>;\n" +
      "export declare const PUBLIC_OPERATION_CONTRACT_PROJECTIONS: readonly unknown[];\n",
    "utf8",
  );
  await writeFile(join(packageDirectory, "public.js"), "export {};\n", "utf8");
  const catalogSchemaPath =
    "contracts/schemas/public-contract-catalog.schema.json";
  await writeCanonicalJson(join(packageDirectory, catalogSchemaPath), {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $defs: {
      PublicCatalogBindingRefusal: { type: "object" },
    },
  });
  const selectedProjectionAssets = [
    PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset,
    ...PUBLIC_PROJECTION_PAYLOADS.operationContractAssets,
    PUBLIC_PROJECTION_PAYLOADS.adapterAsset,
  ];
  for (const asset of selectedProjectionAssets) {
    const path = join(packageDirectory, asset.path);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, asset.bytes, "utf8");
  }

  const { closures, packageJson } = await nativeClosures(packageDirectory);
  const { files } = await packagePayloadFiles(packageDirectory);
  const productContentDigest = payloadInventoryDigest(
    [...files.entries()].map(([path, bytes]) => ({
      path,
      sha256: sha256Bytes(bytes),
    })),
  );
  const catalogSchemaDigest = sha256Bytes(
    await readFile(join(packageDirectory, catalogSchemaPath)),
  );
  const extantCatalogFields = {
    schemaVersion: "5.0.0",
    catalogId:
      "catalog://abiogenesis/typescript-tenant/public-contracts@5.0.0",
    catalogVersion: "5.0.0",
    catalogSchemaPath,
    catalogSchemaDigest,
    rows: [{
      contractId: "abg.schema.public-contract-catalog",
      contractVersion: "5.0.0",
      contractDigest: catalogSchemaDigest,
      contractKind: "schema_asset",
      owningProduct: productApi.ABI5_PRODUCT_ID,
      requirementAuthorityRefs: [
        "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-002",
      ],
      capabilityIdentities: ["abg.capability.product.verify@5"],
      assetLocator: {
        path: catalogSchemaPath,
        mediaType: "application/schema+json",
        schemaVersion: "5.0.0",
        contentDigest: catalogSchemaDigest,
      },
    }],
  };
  const extantCatalog = {
    ...extantCatalogFields,
    catalogDigest: sha256Canonical(extantCatalogFields),
  };
  const publicClosure = closures.find(({ packageExportPath }) =>
    packageExportPath === "./public"
  );
  assert.ok(publicClosure, "./public declaration closure must exist");
  const proposalSet = derivePublicCatalogRowProposals(
    productApi.ABI5_PRODUCT_ID,
    packageJson.name,
    publicClosure,
  );
  const binding = bindS06PublicFunctionCatalog({
    extantCatalog,
    extantCatalogCoordinate: {
      productId: productApi.ABI5_PRODUCT_ID,
      productContentDigest,
      catalogId: extantCatalog.catalogId,
      catalogVersion: extantCatalog.catalogVersion,
      catalogDigest: extantCatalog.catalogDigest,
    },
    productId: productApi.ABI5_PRODUCT_ID,
    productContentDigest,
    proposalSequence: proposalSet.proposals,
    publicPackageName: packageJson.name,
    publicDeclarationClosure: publicClosure,
  });
  assert.equal(binding.disposition, "bound", JSON.stringify(binding));
  const contributionManifest = {
    kind: "product_contribution_manifest",
    schemaVersion: "5.0.0",
    contributionManifestRef:
      "product-contribution-manifest://abiogenesis/t287-pfc-f08a",
    productId: productApi.ABI5_PRODUCT_ID,
    productVersion: productApi.ABI5_PACKAGE_VERSION,
    descriptorRef: "product-descriptor://abiogenesis/typescript-tenant@5",
    productContentDigest,
    publicContractCatalogId: binding.catalog.catalogId,
    publicContractCatalogDigest: binding.catalog.catalogDigest,
    publicationBindings: [],
    rows: [],
  };
  const manifest = {
    kind: "abg_product_toolchain_manifest",
    schemaVersion: "5.0.0",
    productId: productApi.ABI5_PRODUCT_ID,
    packageName: productApi.ABI5_PACKAGE_NAME,
    packageVersion: productApi.ABI5_PACKAGE_VERSION,
    productContentDigest,
    productRelativeLocators: [],
    descriptorRef: contributionManifest.descriptorRef,
    publisherNamespace: "abiogenesis",
    contributionManifestRef: contributionManifest.contributionManifestRef,
    contributionManifestDigest: sha256Canonical(contributionManifest),
    contributionManifest,
    compatibilityRefs: [],
    declaredDependencies: [],
    provenanceRef: "provenance://abiogenesis/t287-pfc-f08a",
    declaredCapabilityRefs: [
      "abg.capability.operator.public-contract@5",
      "abg.capability.product.verify@5",
    ],
    publicContractCatalog: structuredClone(binding.catalog),
  };
  const request = await sealCandidate(candidateRoot, packageDirectory, manifest);
  return { candidateRoot, manifest, packageDirectory, request };
}

function operationRows(manifest) {
  return manifest.publicContractCatalog.rows.filter(({ contractId }) =>
    contractId.startsWith("abg.operation.")
  );
}

async function stripPublicFunctionClaim(packageDirectory, manifest) {
  const rows = operationRows(manifest);
  manifest.declaredCapabilityRefs = manifest.declaredCapabilityRefs.filter(
    (capabilityRef) =>
      capabilityRef !== "abg.capability.operator.public-contract@5",
  );
  manifest.publicContractCatalog.rows =
    manifest.publicContractCatalog.rows.filter(({ contractId }) =>
      !contractId.startsWith("abg.operation.")
    );
  await rm(join(packageDirectory, adapterPath));
  for (const row of rows) {
    await rm(join(packageDirectory, row.assetLocator.path));
  }
}

async function rewriteOperationProjection(packageDirectory, row, mutate) {
  const path = join(packageDirectory, row.assetLocator.path);
  const projection = JSON.parse(await readFile(path, "utf8"));
  mutate(projection);
  const { rowDigest: _rowDigest, rowRef: _rowRef, ...body } = projection;
  projection.rowDigest = sha256Canonical(body);
  projection.rowRef =
    `${projection.rowRef.slice(0, projection.rowRef.lastIndexOf("/") + 1)}` +
    projection.rowDigest.slice("sha256:".length);
  await writeCanonicalJson(path, projection);
}

async function cloneAndSeal(
  temporaryRoot,
  lawfulPackageDirectory,
  name,
  mutate,
) {
  const candidateRoot = join(temporaryRoot, name);
  const packageDirectory = join(candidateRoot, "package");
  await mkdir(candidateRoot, { recursive: true });
  await cp(lawfulPackageDirectory, packageDirectory, { recursive: true });
  const manifest = JSON.parse(
    await readFile(join(packageDirectory, manifestName), "utf8"),
  );
  await mutate(packageDirectory, manifest);
  return sealCandidate(candidateRoot, packageDirectory, manifest);
}

function replaceOperationIdentity(value, from, to) {
  if (value === null || typeof value !== "object") return value === from ? to : value;
  if (Array.isArray(value)) {
    return value.map((child) => replaceOperationIdentity(child, from, to));
  }
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [
    key,
    replaceOperationIdentity(child, from, to),
  ]));
}

function forgeShapeValidArtifact(verified, catalog) {
  const forgedCatalog = structuredClone(catalog);
  forgedCatalog.catalogId = `${forgedCatalog.catalogId}/forged`;
  const { catalogDigest: _catalogDigest, ...catalogBody } = forgedCatalog;
  forgedCatalog.catalogDigest = sha256Canonical(catalogBody);

  const forged = structuredClone(verified);
  forged.catalogId = forgedCatalog.catalogId;
  forged.catalogDigest = forgedCatalog.catalogDigest;
  forged.publicContracts = forgedCatalog.rows;
  forged.definitionContractCoordinates = null;
  forged.contributionManifest.publicContractCatalogId = forgedCatalog.catalogId;
  forged.contributionManifest.publicContractCatalogDigest =
    forgedCatalog.catalogDigest;
  forged.contributionManifestDigest = sha256Canonical(
    forged.contributionManifest,
  );
  delete forged.verificationDigest;
  delete forged.verificationRef;
  const verificationDigest = sha256Canonical(forged);
  forged.verificationDigest = verificationDigest;
  forged.verificationRef =
    `product-verification://abiogenesis/${verificationDigest.slice("sha256:".length)}`;
  return { forged, forgedCatalog };
}

test("PFC-F08A is minted only by verifyProduct over exact artifact bytes", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "abi5-pfc-f08a-"));
  try {
    const lawful = await constructLawfulCandidate(temporaryRoot);
    const verified = await productApi.verifyProduct(lawful.request);
    assert.equal(verified.kind, "verified_product_artifact", JSON.stringify(verified));
    assert.equal(productApi.isVerifiedProductArtifact(verified), true);
    assert.notEqual(verified.definitionContractCoordinates, null);
    assert.equal(verified.definitionContractCoordinates.operations.length, 18);
    assert.equal(
      verified.definitionContractCoordinates.operations.flatMap(({ members }) =>
        members
      ).length,
      56,
    );
    assert.ok(verified.nativeDeclarationEvidence.contracts.length > 0);
    for (const evidence of verified.nativeDeclarationEvidence.contracts) {
      const publicContract = verified.publicContracts.find(
        (contract) => contract.contractId === evidence.contractId,
      );
      assert.ok(publicContract);
      assert.equal(evidence.contractDigest, publicContract.contractDigest);
      assert.deepEqual(evidence.pendingSelectors, []);
      assert.equal("occurrenceRefs" in evidence, false);
    }
    for (const closure of verified.nativeDeclarationEvidence.closures) {
      assert.equal("externalOccurrences" in closure, false);
      assert.equal("exportedSymbolOccurrenceRefs" in closure, false);
      for (const relation of closure.physicalRelations) {
        assert.equal("occurrenceRef" in relation, false);
        assert.equal("packageExportPath" in relation, false);
        assert.equal("selectorKind" in relation, false);
        assert.equal("selectedName" in relation, false);
        assert.equal("visibleName" in relation, false);
        assert.equal("sourceOffset" in relation, false);
      }
    }

    const refusalCases = [
      ["altered-family-bytes", async (packageDirectory) => {
        const path = join(packageDirectory, adapterPath);
        const adapter = JSON.parse(await readFile(path, "utf8"));
        adapter.family.familyDigest = sha256Canonical({ forged: "family" });
        await writeCanonicalJson(path, adapter);
      }, /does not declare the selected exact 18\/56/u],
      ["altered-operation-bytes", async (packageDirectory, manifest) => {
        await rewriteOperationProjection(
          packageDirectory,
          operationRows(manifest)[0],
          (projection) => {
            projection.definitions[0].definitionDigest =
              sha256Canonical({ forged: "definition" });
          },
        );
      }, /diverges from the adapter family/u],
      ["partial-operations", async (packageDirectory, manifest) => {
        const row = operationRows(manifest)[0];
        manifest.publicContractCatalog.rows =
          manifest.publicContractCatalog.rows.filter((candidate) =>
            candidate.contractId !== row.contractId
          );
        await rm(join(packageDirectory, row.assetLocator.path));
      }, /payload set are not exact/u],
      ["extra-operation", async (packageDirectory, manifest) => {
        const row = structuredClone(operationRows(manifest)[0]);
        const sourcePath = join(packageDirectory, row.assetLocator.path);
        const projection = JSON.parse(await readFile(sourcePath, "utf8"));
        const forgedOperationId = "abg.operation.forged.extra";
        const forgedProjection = replaceOperationIdentity(
          projection,
          projection.operationId,
          forgedOperationId,
        );
        const { rowDigest: _rowDigest, rowRef: _rowRef, ...body } =
          forgedProjection;
        forgedProjection.rowDigest = sha256Canonical(body);
        forgedProjection.rowRef =
          `public-operation-contract://abiogenesis/forged/extra/` +
          forgedProjection.rowDigest.slice("sha256:".length);
        row.contractId = forgedOperationId;
        row.assetLocator.path =
          "contracts/public-operations/forged/extra/operation-contract.json";
        await writeCanonicalJson(
          join(packageDirectory, row.assetLocator.path),
          forgedProjection,
        );
        manifest.publicContractCatalog.rows.push(row);
      }, /payload set are not exact/u],
      ["cross-slot-pointers", async (packageDirectory, manifest) => {
        await rewriteOperationProjection(
          packageDirectory,
          operationRows(manifest)[0],
          (projection) => {
            const definition = projection.definitions[0];
            [
              definition.requestContract.definitionRef,
              definition.resultContract.definitionRef,
            ] = [
              definition.resultContract.definitionRef,
              definition.requestContract.definitionRef,
            ];
          },
        );
      }, /cross-slot pointer/u],
      ["catalog-operation-mismatch", async (_packageDirectory, manifest) => {
        const rows = operationRows(manifest);
        rows[0].assetLocator.path = rows[1].assetLocator.path;
      }, /payload set are not exact/u],
      ["selected-product-family-omitted", stripPublicFunctionClaim,
        /public-function adapter projection is absent or malformed/u],
    ];

    for (const [name, mutate, expectedMessage] of refusalCases) {
      const request = await cloneAndSeal(
        temporaryRoot,
        lawful.packageDirectory,
        name,
        mutate,
      );
      const result = await productApi.verifyProduct(request);
      assert.equal(result.kind, "product_verification_refusal", name);
      assert.equal(result.code, "catalog_mismatch", `${name}: ${result.message}`);
      assert.match(result.message, expectedMessage, name);
    }

    const unrelatedNoFamilyRequest = await cloneAndSeal(
      temporaryRoot,
      lawful.packageDirectory,
      "unrelated-no-family",
      async (packageDirectory, manifest) => {
        await stripPublicFunctionClaim(packageDirectory, manifest);
        const productId = "product://example/data-only";
        const packageName = "@example/data-only";
        const catalogRow = manifest.publicContractCatalog.rows.find(
          ({ contractId }) =>
            contractId === "abg.schema.public-contract-catalog",
        );
        assert.ok(catalogRow, "the generic catalog schema row must remain");
        catalogRow.owningProduct = productId;
        manifest.publicContractCatalog.rows = [catalogRow];
        manifest.publicContractCatalog.catalogId =
          "catalog://example/data-only/public-contracts@5.0.0";
        manifest.productId = productId;
        manifest.packageName = packageName;
        manifest.descriptorRef = "product-descriptor://example/data-only@5";
        manifest.publisherNamespace = "example";
        manifest.contributionManifestRef =
          "product-contribution-manifest://example/data-only";
        manifest.provenanceRef = "provenance://example/data-only";
        manifest.declaredCapabilityRefs = [
          "abg.capability.product.verify@5",
        ];
        manifest.contributionManifest.productId = productId;
        manifest.contributionManifest.descriptorRef = manifest.descriptorRef;
        manifest.contributionManifest.contributionManifestRef =
          manifest.contributionManifestRef;
        await writeCanonicalJson(join(packageDirectory, "package.json"), {
          name: packageName,
          version: manifest.packageVersion,
          type: "module",
          exports: {},
        });
        await rm(join(packageDirectory, "public.d.ts"));
        await rm(join(packageDirectory, "public.js"));
        await rm(
          join(packageDirectory, PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.path),
        );
        await rm(join(packageDirectory, "contracts", "public-functions"), {
          recursive: true,
          force: true,
        });
      },
    );
    const unrelatedNoFamily = await productApi.verifyProduct(
      unrelatedNoFamilyRequest,
    );
    assert.equal(
      unrelatedNoFamily.kind,
      "verified_product_artifact",
      JSON.stringify(unrelatedNoFamily),
    );
    assert.equal(unrelatedNoFamily.definitionContractCoordinates, null);

    const { forged, forgedCatalog } = forgeShapeValidArtifact(
      verified,
      lawful.manifest.publicContractCatalog,
    );
    assert.equal(productApi.isVerifiedProductArtifact(forged), true);
    assert.equal(forged.definitionContractCoordinates, null);
    assert.match(forgedCatalog.catalogDigest, /^sha256:[0-9a-f]{64}$/u);
    for (const api of [productApi, verificationContractModule]) {
      assert.equal("joinExpectedOwnerContractSet" in api, false);
      assert.deepEqual(
        Object.entries(api).filter(([name, value]) =>
          typeof value === "function" &&
          /(?:DefinitionContractCoordinate|ExpectedOwnerContractSet)/u.test(name)
        ),
        [],
      );
    }
    const directAttempt = await productApi.verifyProductArtifact({
      kind: "product_verification_packet",
      schemaVersion: "5.0.0",
      memberKey: "verify",
      request: { ...forged, publicContractCatalog: forgedCatalog },
    });
    assert.equal(directAttempt.kind, "product_verification_refusal");
    assert.equal("definitionContractCoordinates" in directAttempt, false);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
