import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

import { applyCatalogDeclaration, buildGraphFunctionCatalog, narrowGraphFunctionCatalog, sha256Canonical } from "../../build/code/src/product/index.js";

import { prepareFlavoredCatalogProduct } from "../support/flavored-catalog-product.mjs";
import { importInstalledPackageExport, setupInstalledCliHarness as setupInstalledCliHarnessBase } from "../support/root-cli-environment.mjs";

const packageRoot = new URL("../..", import.meta.url).pathname;

function setupInstalledCliHarness(context, root) {
  return setupInstalledCliHarnessBase(context, root, {
    candidateBasisSource: "packed_artifact",
  });
}

function expectedVerificationIdentity(basis) {
  return {
    expectedArtifactDigest: basis.artifactDigest,
    expectedProductContentDigest: basis.productContentDigest,
    expectedManifestDigest: basis.manifestDigest,
    expectedProductId: basis.productId,
    expectedPackageName: basis.packageName,
    expectedPackageVersion: basis.packageVersion,
  };
}

test("S06 verified Product and resolved lock truth are deeply immutable", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const installedProduct = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `immutable-product=${Date.now()}`,
  );
  const verified = await installedProduct.verifyProduct({
    artifactPath: harness.artifactPath,
    artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis),
  });
  assert.equal(verified.kind, "verified_product_artifact");
  assert.equal(Object.isFrozen(verified), true);
  assert.equal(Object.isFrozen(verified.compatibilityRefs), true);
  assert.equal(Object.isFrozen(verified.contributionManifest), true);
  assert.equal(Object.isFrozen(verified.contributionManifest.rows), true);
  assert.equal(
    Object.isFrozen(
      verified.contributionManifest.rows[0].readinessPrerequisiteRefs,
    ),
    true,
  );
  assert.throws(
    () => {
      verified.compatibilityRefs[0] =
        "compatibility://abiogenesis/major/999";
    },
    TypeError,
  );
  const lock = installedProduct.constructResolvedProductLock([verified]);
  assert.equal(lock.kind, "resolved_product_lock");
  assert.equal(Object.isFrozen(lock), true);
  assert.equal(Object.isFrozen(lock.rows), true);
  assert.equal(Object.isFrozen(lock.rows[0].publicContracts), true);
  assert.throws(
    () => {
      lock.rows[0].publicContractRefs[0] =
        "abg.contract.public.forged";
    },
    TypeError,
  );
});

test("S06 catalog construction rejects unequal publications with one module identity", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(harness);
  const unequal = structuredClone(flavored.publication);
  unequal.graphFunctions[0].effects = [
    "effect://flavor.example/text/forged@5",
  ];
  const refused = buildGraphFunctionCatalog([
    flavored.publication,
    unequal,
  ]);
  assert.equal(refused.kind, "catalog_construction_refusal");
  assert.equal(refused.code, "publication_identity_collision");
});

test("S06 external side-effect declaration imports refuse during Product resolution", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(
    harness,
    join(harness.scratch, "side-effect-declaration"),
    {
      transformDeclaration: (declaration) =>
        `${declaration}\nimport "@abiogenesis/typescript-tenant/gtl";\n`,
    },
  );
  const verifiedAbi = await harness.product.verifyProduct({
    artifactPath: harness.artifactPath,
    artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis),
  });
  const verifiedFlavored = await harness.product.verifyProduct({
    artifactPath: flavored.artifactPath,
    artifactRef: flavored.artifactRef,
    ...expectedVerificationIdentity(flavored.basis),
  });
  assert.equal(verifiedAbi.kind, "verified_product_artifact");
  assert.equal(verifiedFlavored.kind, "verified_product_artifact");
  const refused = harness.product.constructResolvedProductLock([
    verifiedAbi,
    verifiedFlavored,
  ]);
  assert.equal(refused.kind, "environment_refusal");
  assert.equal(refused.code, "incompatible_dependency");
  assert.match(refused.message, /side-effect-only/u);
});

test("S06 Product verification resolves contract authority and exact locators", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const installedProduct = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `contract-locators=${Date.now()}`,
  );
  const nativeOnlyContract = (row, native) => {
    delete row.assetLocator;
    return {
      ...row,
      contractDigest: native.nativeContractDigest,
      contractKind: "native_typed_group",
      nativeTypedLocator: native.nativeTypedLocator,
    };
  };
  const cases = [
    {
      label: "missing-version",
      transformPublicContract: (row) => {
        delete row.contractVersion;
        return row;
      },
      expectedCode: "catalog_mismatch",
    },
    {
      label: "empty-authority",
      transformPublicContract: (row) => ({
        ...row,
        requirementAuthorityRefs: [],
      }),
      expectedCode: "catalog_mismatch",
    },
    {
      label: "empty-capability",
      transformPublicContract: (row) => ({
        ...row,
        capabilityIdentities: [],
      }),
      expectedCode: "catalog_mismatch",
    },
    {
      label: "missing-definition",
      transformPublicContract: (row) => ({
        ...row,
        assetLocator: {
          ...row.assetLocator,
          definitionRef: "#/$defs/DoesNotExist",
        },
      }),
      expectedCode: "contract_asset_mismatch",
    },
    {
      label: "missing-native-symbol",
      transformPublicContract: (row, native) => ({
        ...row,
        nativeTypedLocator: {
          ...native.nativeTypedLocator,
          namedSymbol: "ForgedNativeContract",
        },
      }),
      expectedCode: "catalog_mismatch",
    },
    {
      label: "invalid-native-declaration",
      transformDeclaration: (declaration) =>
        `${declaration}\nexport declare const Forged:;\n`,
      transformPublicContract: nativeOnlyContract,
      expectedCode: "catalog_mismatch",
    },
    {
      label: "invalid-external-import-syntax",
      transformDeclaration: (declaration) =>
        `${declaration}\nimport { Missing as } from "@abiogenesis/typescript-tenant/gtl";\n`,
      transformPublicContract: nativeOnlyContract,
      expectedCode: "catalog_mismatch",
    },
    {
      label: "unresolved-native-reexport",
      transformDeclaration: (declaration) =>
        `${declaration}\nexport { Missing } from "./missing.js";\n`,
      transformPublicContract: nativeOnlyContract,
      expectedCode: "catalog_mismatch",
    },
    {
      label: "quoted-false-native-symbol",
      transformDeclaration: (declaration) =>
        `${declaration}\nexport declare const EXPORT_BAIT: "export const MissingSymbol";\n`,
      transformPublicContract: (row, native) => {
        delete row.assetLocator;
        return {
          ...row,
          contractDigest: native.nativeContractDigest,
          contractKind: "native_typed_group",
          nativeTypedLocator: {
            ...native.nativeTypedLocator,
            namedSymbol: "MissingSymbol",
          },
        };
      },
      expectedCode: "catalog_mismatch",
    },
    {
      label: "non-schema-definition",
      transformPublicContract: (row) => ({
        ...row,
        assetLocator: {
          ...row.assetLocator,
          definitionRef: "#/$id",
        },
      }),
      expectedCode: "contract_asset_mismatch",
    },
    {
      label: "malformed-pointer-escape",
      transformSchema: (schema) => ({
        ...schema,
        $defs: { "~2": { type: "object" } },
      }),
      transformPublicContract: (row) => ({
        ...row,
        assetLocator: {
          ...row.assetLocator,
          definitionRef: "#/$defs/~2",
        },
      }),
      expectedCode: "contract_asset_mismatch",
    },
    {
      label: "dangling-pointer-escape",
      transformSchema: (schema) => ({
        ...schema,
        $defs: { "~": { type: "object" } },
      }),
      transformPublicContract: (row) => ({
        ...row,
        assetLocator: {
          ...row.assetLocator,
          definitionRef: "#/$defs/~",
        },
      }),
      expectedCode: "contract_asset_mismatch",
    },
    {
      label: "native-kind-asset-digest",
      transformPublicContract: (row, native) => ({
        ...row,
        contractKind: "native_typed_group",
        nativeTypedLocator: native.nativeTypedLocator,
      }),
      expectedCode: "catalog_mismatch",
    },
    {
      label: "duplicate-native-coordinate",
      transformPublicContract: nativeOnlyContract,
      expectedCode: "catalog_mismatch",
    },
  ];
  for (const row of cases) {
    const flavored = await prepareFlavoredCatalogProduct(
      harness,
      join(harness.scratch, row.label),
      {
        transformDeclaration: row.transformDeclaration,
        transformPublicContract: row.transformPublicContract,
        transformSchema: row.transformSchema,
      },
    );
    const refused = await installedProduct.verifyProduct({
      artifactPath: flavored.artifactPath,
      artifactRef: flavored.artifactRef,
      ...expectedVerificationIdentity(flavored.basis),
    });
    assert.equal(refused.kind, "product_verification_refusal", row.label);
    assert.equal(refused.code, row.expectedCode, row.label);
  }
});

test("S06 Product verification resolves JSON Schema array pointers", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const installedProduct = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `array-pointers=${Date.now()}`,
  );
  for (
    const definitionRef of [
      "#/oneOf/0",
      "#/oneOf/0/additionalProperties",
    ]
  ) {
    const flavored = await prepareFlavoredCatalogProduct(
      harness,
      join(
        harness.scratch,
        `array-pointer-${definitionRef.endsWith("0") ? "schema" : "boolean"}`,
      ),
      {
        transformPublicContract: (row) => ({
          ...row,
          assetLocator: {
            ...row.assetLocator,
            definitionRef,
          },
        }),
      },
    );
    const verified = await installedProduct.verifyProduct({
      artifactPath: flavored.artifactPath,
      artifactRef: flavored.artifactRef,
      ...expectedVerificationIdentity(flavored.basis),
    });
    assert.equal(
      verified.kind,
      "verified_product_artifact",
      `${definitionRef}: ${JSON.stringify(verified)}`,
    );
  }
});

test("S06 catalog narrowing refuses unknown handles without an admission fallback", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(
    harness,
    join(harness.scratch, "unresolved-readiness"),
    {
      transformPublication: (publication) => publication,
    },
  );
  const catalog = buildGraphFunctionCatalog([flavored.publication]);
  assert.equal(catalog.kind, "graph_function_catalog");
  const refused = narrowGraphFunctionCatalog(
    catalog,
    ["graph-function://flavor.example/never-published@5"],
  );
  assert.equal(refused.kind, "catalog_construction_refusal");
  assert.equal(refused.code, "unknown_allowlist_entry");
});

test("S06 catalog applications are pure reconstructible values", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(harness);
  const catalog = buildGraphFunctionCatalog([flavored.publication]);
  assert.equal(catalog.kind, "graph_function_catalog");
  const view = narrowGraphFunctionCatalog(catalog, [
    flavored.ids.nodeTypeHandle,
    flavored.ids.overlayHandle,
    flavored.ids.graphFunctionRef,
  ]);
  assert.equal(view.kind, "graph_function_catalog_view");

  const nodeTarget = {
    kind: "program",
    programRef: flavored.ids.programRef,
  };
  const nodeTargetDigest = sha256Canonical(nodeTarget);
  const nodeValueDigest = sha256Canonical(flavored.nodeTypeValue);
  const nodeInput = {
    applicationKind: "node_type",
    handle: flavored.ids.nodeTypeHandle,
    targetRef:
      `catalog-target://abiogenesis/${nodeTargetDigest.slice("sha256:".length)}`,
    targetDigest: nodeTargetDigest,
    appliedValueRef:
      `catalog-value://abiogenesis/${nodeValueDigest.slice("sha256:".length)}`,
    appliedValueDigest: nodeValueDigest,
  };
  const node = applyCatalogDeclaration(view, nodeInput);
  assert.equal(node.kind, "declaration_application");
  assert.deepEqual(
    applyCatalogDeclaration(structuredClone(view), structuredClone(nodeInput)),
    node,
  );
  assert.equal(Object.hasOwn(node, "admissionEventRef"), false);

  const overlayTarget = { contributorRef: flavored.basis.productId };
  const overlayTargetDigest = sha256Canonical(overlayTarget);
  const overlayValueDigest = sha256Canonical(flavored.overlayValue);
  const overlay = applyCatalogDeclaration(view, {
    applicationKind: "overlay",
    handle: flavored.ids.overlayHandle,
    targetRef:
      `catalog-target://abiogenesis/${overlayTargetDigest.slice("sha256:".length)}`,
    targetDigest: overlayTargetDigest,
    appliedValueRef:
      `catalog-value://abiogenesis/${overlayValueDigest.slice("sha256:".length)}`,
    appliedValueDigest: overlayValueDigest,
  });
  assert.equal(overlay.kind, "declaration_application");

  const callable = applyCatalogDeclaration(view, {
    ...nodeInput,
    handle: flavored.ids.graphFunctionRef,
  });
  assert.equal(callable.kind, "declaration_application_refusal");
  assert.equal(callable.code, "outside_view");
  const wrongKind = applyCatalogDeclaration(view, {
    ...nodeInput,
    applicationKind: "overlay",
  });
  assert.equal(wrongKind.kind, "declaration_application_refusal");
  assert.equal(wrongKind.code, "kind_mismatch");
});

test("S06 Codex delegate and flavored Product keep their public boundaries", async () => {
  const delegateSource = await readFile(
    join(packageRoot, "code/src/public/codex_cli.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    delegateSource,
    /(?:from\s+["'][.]{2}\/(?:abg|gtl|hog|implementation|product|public|validator)\/|import\s*\(|require\s*\()/u,
  );
  assert.doesNotMatch(
    delegateSource,
    /GraphFunction|catalog\.apply|run\.invoke|continuation|closure/u,
  );
  assert.match(
    delegateSource,
    /spawn\(installedCliPath,\s*\["--jsonl", transcriptPath\]/u,
  );
  assert.doesNotMatch(
    delegateSource,
    /spawn\(cliPath,/u,
  );

  const flavoredRuntimeSource = await readFile(
    join(
      packageRoot,
      "test_env/fixtures/flavored-catalog-product/src/index.ts",
    ),
    "utf8",
  );
  const flavoredPublicationSource = await readFile(
    join(
      packageRoot,
      "test_env/fixtures/flavored-catalog-product/src/publication.ts",
    ),
    "utf8",
  );
  const flavoredSource =
    `${flavoredRuntimeSource}\n${flavoredPublicationSource}`;
  assert.match(
    flavoredSource,
    /from "@abiogenesis\/typescript-tenant\/gtl"/u,
  );
  assert.doesNotMatch(
    flavoredRuntimeSource,
    /from "@abiogenesis\/typescript-tenant\/gtl"/u,
    "installed effect and semantics code must not depend on declaration-time GTL constructors",
  );
  for (const constructor of [
    "catalogContribution",
    "closureContract",
    "contractDeclaration",
    "implementationBinding",
    "modulePublication",
    "productSemanticsBinding",
  ]) {
    assert.match(
      flavoredSource,
      new RegExp(`declarations\\.${constructor}\\(`, "u"),
    );
  }
  assert.doesNotMatch(
    flavoredSource,
    /build\/code\/src|from\s+["'][.]{2}\/|(?:import|require)\s*\(\s*["'](?:[.]{2}\/|@abiogenesis\/typescript-tenant\/build\/)/u,
  );
});
