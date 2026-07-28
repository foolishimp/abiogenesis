import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

import {
  catalogContribution,
  closureContract,
  constructHelloWorldModulePublication,
  contractDeclaration,
  implementationBinding,
} from "../../build/code/src/gtl/index.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PRODUCT_ID,
  constructResolvedProductLock as constructProductLock,
  isResolvedProductLock,
  sha256Canonical,
} from "../../build/code/src/product/index.js";
import {
  directSatisfiedDependencyRefs,
} from "../../build/code/src/product/catalog.js";
import {
  declarationExportSymbols,
  linkNativeContractSet,
  resolveNativeDeclarationClosures,
} from "../../build/code/src/product/declaration_exports.js";
import {
  resolveExactMatch,
} from "../../build/code/src/product/exact_match.js";
import {
  loadVerifiedInstalledModule,
} from "../../build/code/src/product/installed_module.js";

const packageRoot = new URL("../..", import.meta.url).pathname;
const digest = (character) => `sha256:${character.repeat(64)}`;
const candidateManifest = JSON.parse(
  await readFile(join(packageRoot, "product-toolchain-manifest.json"), "utf8"),
);

function install(label, character, overrides = {}) {
  const productId =
    overrides.productId ?? `product://s06-prime/${label}@5`;
  const packageName = overrides.packageName ?? `@s06-prime/${label}`;
  const productContentDigest =
    overrides.productContentDigest ?? digest(character);
  const descriptorRef = `descriptor://s06-prime/${label}@5`;
  const contributionManifestRef =
    `contribution-manifest://s06-prime/${label}@5`;
  const publicContract = {
    contractId: `contract://s06-prime/${label}@5`,
    contractVersion: "5.0.0",
    contractDigest: digest(character),
    contractKind: "vocabulary_asset",
    owningProduct: productId,
    requirementAuthorityRefs: [`requirement://s06-prime/${label}@5`],
    capabilityIdentities: [`capability://s06-prime/${label}@5`],
    assetLocator: {
      path: "contracts/s06-prime.json",
      mediaType: "application/json",
      schemaVersion: "5.0.0",
      contentDigest: digest(character),
    },
  };
  const catalogId = `catalog://s06-prime/${label}@5`;
  const catalogDigest = digest(character);
  const contributionManifest = {
    kind: "product_contribution_manifest",
    schemaVersion: "5.0.0",
    contributionManifestRef,
    productId,
    productVersion: "5.0.0",
    descriptorRef,
    productContentDigest,
    publicContractCatalogId: catalogId,
    publicContractCatalogDigest: catalogDigest,
    publicationBindings: [],
    rows: [],
  };
  return {
    kind: "verified_product_artifact",
    schemaVersion: "5.0.0",
    disposition: "verified",
    artifactRef: `artifact://s06-prime/${label}@5`,
    artifactByteLength: 1,
    productId,
    packageName,
    packageVersion: "5.0.0",
    artifactDigest: digest(character),
    productContentDigest,
    manifestDigest: digest(character),
    descriptorRef,
    publisherNamespace: "s06-prime",
    contributionManifestRef,
    contributionManifestDigest: sha256Canonical(contributionManifest),
    contributionManifest,
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    declaredDependencies: [],
    provenanceRef: `provenance://s06-prime/${label}@5`,
    declaredCapabilityRefs: [`capability://s06-prime/${label}@5`],
    catalogId,
    catalogDigest,
    publicContracts: [publicContract],
    publicContractRefs: [publicContract.contractId],
    publicCapabilityRefs: [`capability://s06-prime/${label}@5`],
    checkedPayloadFiles: 1,
    ...overrides,
  };
}

const toolchain = install("abiogenesis-toolchain", "8", {
  productId: ABI5_PRODUCT_ID,
  packageName: ABI5_PACKAGE_NAME,
  productContentDigest: candidateManifest.productContentDigest,
});

function constructResolvedProductLock(artifacts, ...ignored) {
  void ignored;
  return constructProductLock([toolchain, ...artifacts]);
}

function dependency(target, overrides = {}) {
  return {
    kind: "requires",
    productId: target.productId,
    packageVersion: target.packageVersion,
    compatibilityRef: target.compatibilityRefs[0],
    requiredContractRefs: [target.publicContractRefs[0]],
    requiredCapabilityRefs: [target.publicCapabilityRefs[0]],
    ...overrides,
  };
}

function lockRow(value) {
  return {
    productId: value.productId,
    packageName: value.packageName,
    packageVersion: value.packageVersion,
    artifactDigest: value.artifactDigest,
    productContentDigest: value.productContentDigest,
    manifestDigest: value.manifestDigest,
    descriptorRef: value.descriptorRef,
    publisherNamespace: value.publisherNamespace,
    catalogId: value.catalogId,
    catalogDigest: value.catalogDigest,
    contributionManifestRef: value.contributionManifestRef,
    contributionManifestDigest: value.contributionManifestDigest,
    contributionManifest: value.contributionManifest,
    compatibilityRefs: value.compatibilityRefs,
    declaredDependencies: value.declaredDependencies,
    provenanceRef: value.provenanceRef,
    declaredCapabilityRefs: value.declaredCapabilityRefs,
    publicContracts: value.publicContracts,
    publicContractRefs: value.publicContractRefs,
    publicCapabilityRefs: value.publicCapabilityRefs,
  };
}

test("S06 exact coordinate lookup distinguishes zero, one, and many", () => {
  const rows = [
    { ref: "uri://example/a", value: 1 },
    { ref: "uri://example/b", value: 2 },
    { ref: "uri://example/b", value: 3 },
  ];
  assert.deepEqual(
    resolveExactMatch(rows, (row) => row.ref === "uri://example/missing"),
    { kind: "absent" },
  );
  assert.deepEqual(
    resolveExactMatch(rows, (row) => row.ref === "uri://example/a"),
    { kind: "one", value: rows[0] },
  );
  const many = resolveExactMatch(
    rows,
    (row) => row.ref === "uri://example/b",
  );
  assert.equal(many.kind, "many");
  assert.deepEqual(many.values, [rows[1], rows[2]]);
  assert.equal(Object.isFrozen(many.values), true);
});

test("S06 dependency topology uses one cycle relation for construction and validation", () => {
  const right = install("right", "b");
  const left = install("left", "a", {
    declaredDependencies: [dependency(right)],
  });
  const acyclic = constructResolvedProductLock([left, right]);
  assert.equal(acyclic.kind, "resolved_product_lock");
  assert.equal(isResolvedProductLock(acyclic), true);
  assert.deepEqual(acyclic.dependencyEdges, [{
    kind: "requires",
    fromProductId: left.productId,
    toProductId: right.productId,
    packageVersion: right.packageVersion,
    compatibilityRef: right.compatibilityRefs[0],
    compatibilityDisposition: "compatible",
    requiredContractRefs: [right.publicContractRefs[0]],
    requiredCapabilityRefs: [right.publicCapabilityRefs[0]],
  }]);

  assert.equal(
    constructResolvedProductLock([left]).code,
    "unresolved_dependency",
    "a missing declared dependency must refuse",
  );
  const wrongVersion = install("wrong-version", "c", {
    declaredDependencies: [
      dependency(right, { packageVersion: "6.0.0" }),
    ],
  });
  assert.equal(
    constructResolvedProductLock([wrongVersion, right]).code,
    "incompatible_dependency",
    "an incompatible exact version must refuse",
  );
  const wrongCompatibility = install("wrong-compatibility", "d", {
    declaredDependencies: [
      dependency(right, {
        compatibilityRef: "compatibility://abiogenesis/major/6",
      }),
    ],
  });
  assert.equal(
    constructResolvedProductLock([wrongCompatibility, right]).code,
    "incompatible_dependency",
    "an incompatible declared compatibility must refuse",
  );
  const wrongCapability = install("wrong-capability", "e", {
    declaredDependencies: [
      dependency(right, {
        requiredCapabilityRefs: ["capability://s06-prime/missing@5"],
      }),
    ],
  });
  assert.equal(
    constructResolvedProductLock([wrongCapability, right]).code,
    "unresolved_dependency",
    "a missing required capability must refuse",
  );
  const wrongContract = install("wrong-contract", "f", {
    declaredDependencies: [
      dependency(right, {
        requiredContractRefs: ["contract://s06-prime/missing@5"],
      }),
    ],
  });
  assert.equal(
    constructResolvedProductLock([wrongContract, right]).code,
    "unresolved_dependency",
    "a missing required public contract must refuse",
  );
  const ambiguousRight = install("ambiguous-right", "9", {
    productId: right.productId,
  });
  assert.equal(
    constructResolvedProductLock([right, ambiguousRight]).code,
    "ambiguous_dependency",
    "two verified artifacts claiming one Product identity must refuse as ambiguous",
  );

  const standalone = install("standalone", "0");
  const hostInjected = constructResolvedProductLock(
    [standalone],
    [{
      kind: "requires",
      fromProductId: standalone.productId,
      toProductId: right.productId,
    }],
  );
  assert.equal(hostInjected.kind, "resolved_product_lock");
  assert.deepEqual(
    hostInjected.dependencyEdges,
    [],
    "caller arguments cannot add undeclared dependency authority",
  );

  const cycleLeftBase = install("cycle-left", "1");
  const cycleRightBase = install("cycle-right", "2");
  const cycleLeft = {
    ...cycleLeftBase,
    declaredDependencies: [dependency(cycleRightBase)],
  };
  const cycleRight = {
    ...cycleRightBase,
    declaredDependencies: [dependency(cycleLeftBase)],
  };
  const cycleRows = [lockRow(cycleLeft), lockRow(cycleRight)];
  const cycleEdges = [{
    kind: "requires",
    fromProductId: cycleLeft.productId,
    toProductId: cycleRight.productId,
    packageVersion: cycleRight.packageVersion,
    compatibilityRef: cycleRight.compatibilityRefs[0],
    compatibilityDisposition: "compatible",
    requiredContractRefs: [cycleRight.publicContractRefs[0]],
    requiredCapabilityRefs: [cycleRight.publicCapabilityRefs[0]],
  }, {
    kind: "requires",
    fromProductId: cycleRight.productId,
    toProductId: cycleLeft.productId,
    packageVersion: cycleLeft.packageVersion,
    compatibilityRef: cycleLeft.compatibilityRefs[0],
    compatibilityDisposition: "compatible",
    requiredContractRefs: [cycleLeft.publicContractRefs[0]],
    requiredCapabilityRefs: [cycleLeft.publicCapabilityRefs[0]],
  }];
  const refused = constructResolvedProductLock([cycleLeft, cycleRight]);
  assert.equal(refused.kind, "environment_refusal");
  assert.equal(refused.code, "cyclic_dependency");

  const lockBody = {
    rows: cycleRows,
    dependencyEdges: cycleEdges,
    nativeContractClosureDigest: sha256Canonical({
      toolchainProductContentDigest: toolchain.productContentDigest,
      bindings: [],
    }),
  };
  const lockDigest = sha256Canonical(lockBody);
  const forged = {
    kind: "resolved_product_lock",
    schemaVersion: "5.0.0",
    lockId:
      `product-lock://abiogenesis/${lockDigest.slice("sha256:".length)}`,
    lockDigest,
    nativeContractClosureDigest: lockBody.nativeContractClosureDigest,
    rows: cycleRows,
    dependencyEdges: cycleEdges,
  };
  assert.equal(
    isResolvedProductLock(forged),
    false,
    "a digest-consistent cyclic lock must still fail validation",
  );
});

test("S06 readiness authority stops at the publisher's direct dependency edges", () => {
  const transitive = install("transitive", "3");
  const direct = install("direct", "2", {
    declaredDependencies: [dependency(transitive)],
  });
  const publisher = install("publisher", "1", {
    declaredDependencies: [dependency(direct)],
  });
  const lock = constructResolvedProductLock([publisher, direct, transitive]);
  assert.equal(lock.kind, "resolved_product_lock");

  const satisfied = directSatisfiedDependencyRefs(lock, publisher.productId);
  assert.equal(satisfied.has(direct.publicContractRefs[0]), true);
  assert.equal(satisfied.has(direct.publicCapabilityRefs[0]), true);
  assert.equal(
    satisfied.has(transitive.publicContractRefs[0]),
    false,
    "A -> B -> C must not let A consume C's contract without an A -> C edge",
  );
  assert.equal(
    satisfied.has(transitive.publicCapabilityRefs[0]),
    false,
    "A -> B -> C must not let A consume C's capability without an A -> C edge",
  );
});

test("S06 native export resolution is TypeScript-program derived", async () => {
  const encode = (path, source) => ({
    path,
    bytes: new TextEncoder().encode(source),
  });
  const valid = await declarationExportSymbols("index.d.ts", [
    encode(
      "index.d.ts",
      [
        "export declare const enum Kind { A }",
        "export declare namespace \u03A9 { type Value = string }",
        "export type * as Types from \"./types.js\"",
        "export declare const noSemicolon: string",
      ].join("\n"),
    ),
    encode("types.d.ts", "export type T = string"),
  ]);
  assert.notEqual(valid, null);
  assert.equal(valid.has("Kind"), true);
  assert.equal(valid.has("\u03A9"), true);
  assert.equal(valid.has("Types"), true);
  assert.equal(valid.has("noSemicolon"), true);

  assert.equal(
    await declarationExportSymbols("index.d.ts", [
      encode("index.d.ts", "export declare const Forged:;"),
    ]),
    null,
    "syntactically invalid declaration exports must refuse",
  );
  assert.equal(
    await declarationExportSymbols("index.d.ts", [
      encode(
        "index.d.ts",
        "export { Missing } from \"./missing.js\";",
      ),
    ]),
    null,
    "unresolved declaration re-exports must refuse",
  );

  const exportAssignment = await declarationExportSymbols("index.d.ts", [
    encode(
      "index.d.ts",
      "declare const Foo: unique symbol;\nexport = Foo;",
    ),
  ]);
  assert.notEqual(exportAssignment, null);
  assert.equal(
    exportAssignment.has("default"),
    false,
    "TypeScript export assignment must not mint an ESM default export",
  );
});

test("S06 native declaration closure binds package roots and reachable bytes", async () => {
  const encode = (path, source) => ({
    path,
    bytes: new TextEncoder().encode(source),
  });
  const resolve = (valueType) =>
    resolveNativeDeclarationClosures({
      packageName: "@s06-prime/native-closure",
      packageExports: {
        ".": {
          types: "./build/index.d.ts",
          import: "./build/index.js",
        },
      },
      declarationSources: [
        encode(
          "build/index.d.ts",
          [
            "export { Contract } from \"./contract.js\";",
            "export type { External } from \"@s06-prime/dependency/product\";",
          ].join("\n"),
        ),
        encode(
          "build/contract.d.ts",
          `export interface Contract { value: ${valueType}; }`,
        ),
      ],
    });
  const stringClosure = await resolve("string");
  const numberClosure = await resolve("number");
  assert.notEqual(stringClosure, null);
  assert.notEqual(numberClosure, null);
  assert.equal(stringClosure.length, 1);
  assert.deepEqual(
    stringClosure[0].declarationInventory.map((row) => row.declarationPath),
    ["build/contract.d.ts", "build/index.d.ts"],
  );
  assert.deepEqual(
    [
      ...new Set(
        stringClosure[0].externalOccurrences.map(
          (occurrence) => occurrence.moduleSpecifier,
        ),
      ),
    ],
    ["@s06-prime/dependency/product"],
  );
  assert.notEqual(
    sha256Canonical(stringClosure[0].declarationInventory),
    sha256Canonical(numberClosure[0].declarationInventory),
    "changing one reachable re-exported declaration must change native meaning",
  );
});

test("S06 native external meaning requires one direct named-symbol contract", async () => {
  const encode = (path, source) => ({
    path,
    bytes: new TextEncoder().encode(source),
  });
  const targetPackage = "@s06-prime/native-dependency";
  const sourcePackage = "@s06-prime/native-source";
  const targetClosures = await resolveNativeDeclarationClosures({
    packageName: targetPackage,
    packageExports: {
      "./product": { types: "./build/product.d.ts" },
    },
    declarationSources: [
      encode(
        "build/product.d.ts",
        "export interface Target { readonly value: string; }\n",
      ),
    ],
  });
  const sourceClosures = await resolveNativeDeclarationClosures({
    packageName: sourcePackage,
    packageExports: {
      "./product": { types: "./build/product.d.ts" },
    },
    declarationSources: [
      encode(
        "build/product.d.ts",
        `export { Target as Source } from "${targetPackage}/product";\n`,
      ),
    ],
  });
  assert.notEqual(targetClosures, null);
  assert.notEqual(sourceClosures, null);

  const targetContractRef = "contract://s06-prime/native-target@5";
  const sourceContractRef = "contract://s06-prime/native-source@5";
  const nativeContract = (
    contractId,
    productId,
    packageName,
    namedSymbol,
    closure,
  ) => ({
    contractId,
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(closure.declarationInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: ["requirement://s06-prime/native@5"],
    capabilityIdentities: ["capability://s06-prime/native@5"],
    nativeTypedLocator: {
      packageName,
      packageExportPath: "./product",
      namedSymbol,
      declarationPath: closure.declarationPath,
      declarationInventory: closure.declarationInventory,
    },
  });
  const targetProduct = {
    productId: "product://s06-prime/native-dependency@5",
    productContentDigest: digest("a"),
    packageName: targetPackage,
    declaredDependencies: [],
    publicContracts: [
      nativeContract(
        targetContractRef,
        "product://s06-prime/native-dependency@5",
        targetPackage,
        "Target",
        targetClosures[0],
      ),
    ],
    evidence: {
      productId: "product://s06-prime/native-dependency@5",
      productContentDigest: digest("a"),
      packageName: targetPackage,
      sources: [{
        declarationPath: "build/product.d.ts",
        declarationDigest:
          targetClosures[0].declarationInventory[0].declarationDigest,
        sourceText:
          "export interface Target { readonly value: string; }\n",
      }],
      closures: targetClosures,
      contracts: [{
        contractId: targetContractRef,
        packageExportPath: "./product",
        namedSymbol: "Target",
        localDisposition: "local",
        occurrenceRefs: [],
      }],
    },
  };
  const sourceDependency = {
    kind: "requires",
    productId: targetProduct.productId,
    packageVersion: "5.0.0",
    compatibilityRef: "compatibility://abiogenesis/major/5",
    requiredContractRefs: [targetContractRef],
    requiredCapabilityRefs: [],
  };
  const sourceProduct = {
    productId: "product://s06-prime/native-source@5",
    productContentDigest: digest("b"),
    packageName: sourcePackage,
    declaredDependencies: [sourceDependency],
    publicContracts: [
      nativeContract(
        sourceContractRef,
        "product://s06-prime/native-source@5",
        sourcePackage,
        "Source",
        sourceClosures[0],
      ),
    ],
    evidence: {
      productId: "product://s06-prime/native-source@5",
      productContentDigest: digest("b"),
      packageName: sourcePackage,
      sources: [{
        declarationPath: "build/product.d.ts",
        declarationDigest:
          sourceClosures[0].declarationInventory[0].declarationDigest,
        sourceText:
          `export { Target as Source } from "${targetPackage}/product";\n`,
      }],
      closures: sourceClosures,
      contracts: [{
        contractId: sourceContractRef,
        packageExportPath: "./product",
        namedSymbol: "Source",
        localDisposition: "pending_external",
        occurrenceRefs: sourceClosures[0].externalOccurrences.map(
          (occurrence) => occurrence.occurrenceRef,
        ),
      }],
    },
  };

  const linked = linkNativeContractSet(
    [sourceProduct, targetProduct],
    toolchain.productContentDigest,
  );
  assert.equal(linked.kind, "linked");
  const externalBinding = linked.bindings.find(
    (binding) => binding.kind === "external_binding",
  );
  assert.ok(externalBinding);
  assert.equal(externalBinding.targetNamedSymbol, "Target");
  assert.deepEqual(
    linked.bindings.filter(
      (binding) => binding.kind === "symbol_admission",
    ).map((binding) => binding.namedSymbol).sort(),
    ["Source", "Target"],
  );
  const changedTargetIdentity = linkNativeContractSet(
    [sourceProduct, {
      ...targetProduct,
      productContentDigest: digest("c"),
      evidence: {
        ...targetProduct.evidence,
        productContentDigest: digest("c"),
      },
    }],
    toolchain.productContentDigest,
  );
  assert.equal(changedTargetIdentity.kind, "linked");
  assert.notEqual(
    changedTargetIdentity.nativeContractClosureDigest,
    linked.nativeContractClosureDigest,
    "changed target Product bytes must change linked native meaning",
  );
  const changedToolchain = linkNativeContractSet(
    [sourceProduct, targetProduct],
    digest("d"),
  );
  assert.equal(
    changedToolchain.code,
    "incompatible_dependency",
    "a selected toolchain identity that differs from executing compiler bytes must refuse",
  );

  const missingCoverage = linkNativeContractSet(
    [{
      ...sourceProduct,
      declaredDependencies: [{
        ...sourceDependency,
        requiredContractRefs: [],
      }],
    }, targetProduct],
    toolchain.productContentDigest,
  );
  assert.equal(missingCoverage.code, "unresolved_dependency");

  const intermediate = {
    ...targetProduct,
    productId: "product://s06-prime/native-intermediate@5",
    packageName: "@s06-prime/native-intermediate",
    declaredDependencies: [sourceDependency],
    publicContracts: [],
    evidence: {
      productId: "product://s06-prime/native-intermediate@5",
      productContentDigest: targetProduct.productContentDigest,
      packageName: "@s06-prime/native-intermediate",
      sources: [],
      closures: [],
      contracts: [],
    },
  };
  const transitiveOnly = linkNativeContractSet(
    [{
      ...sourceProduct,
      declaredDependencies: [{
        ...sourceDependency,
        productId: intermediate.productId,
      }],
    }, intermediate, targetProduct],
    toolchain.productContentDigest,
  );
  assert.equal(
    transitiveOnly.code,
    "unresolved_dependency",
    "A -> B -> C must not let C close A's declaration import",
  );
});

test("S06 namespace coverage and augmentation remain owner-relative", async () => {
  const encode = (source) => [{
    path: "build/product.d.ts",
    bytes: new TextEncoder().encode(source),
  }];
  const analyze = async (packageName, source) => {
    const closures = await resolveNativeDeclarationClosures({
      packageName,
      packageExports: {
        "./product": { types: "./build/product.d.ts" },
      },
      declarationSources: encode(source),
    });
    assert.notEqual(closures, null);
    return closures;
  };
  const makeContract = (
    contractId,
    productId,
    packageName,
    namedSymbol,
    closure,
  ) => ({
    contractId,
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(closure.declarationInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: ["requirement://s06-prime/native@5"],
    capabilityIdentities: ["capability://s06-prime/native@5"],
    nativeTypedLocator: {
      packageName,
      packageExportPath: "./product",
      namedSymbol,
      declarationPath: closure.declarationPath,
      declarationInventory: closure.declarationInventory,
    },
  });
  const makeEvidence = (
    productId,
    productContentDigest,
    packageName,
    source,
    closures,
    contracts,
  ) => ({
    productId,
    productContentDigest,
    packageName,
    sources: [{
      declarationPath: "build/product.d.ts",
      declarationDigest:
        closures[0].declarationInventory[0].declarationDigest,
      sourceText: source,
    }],
    closures,
    contracts: contracts.map((contract) => ({
      contractId: contract.contractId,
      packageExportPath: "./product",
      namedSymbol: contract.nativeTypedLocator.namedSymbol,
      localDisposition:
        closures[0].externalOccurrences.length === 0
          ? "local"
          : "pending_external",
      occurrenceRefs: closures[0].externalOccurrences.map(
        (occurrence) => occurrence.occurrenceRef,
      ),
    })),
  });

  const targetPackage = "@s06-prime/coverage-target";
  const targetId = "product://s06-prime/coverage-target@5";
  const targetSource = [
    "export interface Alpha { readonly alpha: string; }",
    "export interface Beta { readonly beta: string; }",
  ].join("\n");
  const targetClosures = await analyze(targetPackage, targetSource);
  const alpha = makeContract(
    "contract://s06-prime/alpha@5",
    targetId,
    targetPackage,
    "Alpha",
    targetClosures[0],
  );
  const beta = makeContract(
    "contract://s06-prime/beta@5",
    targetId,
    targetPackage,
    "Beta",
    targetClosures[0],
  );
  const target = {
    productId: targetId,
    productContentDigest: digest("4"),
    packageName: targetPackage,
    declaredDependencies: [],
    publicContracts: [alpha, beta],
    evidence: makeEvidence(
      targetId,
      digest("4"),
      targetPackage,
      targetSource,
      targetClosures,
      [alpha, beta],
    ),
  };

  const sourcePackage = "@s06-prime/coverage-source";
  const sourceId = "product://s06-prime/coverage-source@5";
  const sourceText = `export * from "${targetPackage}/product";\n`;
  const sourceClosures = await analyze(sourcePackage, sourceText);
  const sourceContract = makeContract(
    "contract://s06-prime/source-alpha@5",
    sourceId,
    sourcePackage,
    "Alpha",
    sourceClosures[0],
  );
  const dependencyFor = (requiredContractRefs) => ({
    kind: "requires",
    productId: targetId,
    packageVersion: "5.0.0",
    compatibilityRef: "compatibility://abiogenesis/major/5",
    requiredContractRefs,
    requiredCapabilityRefs: [],
  });
  const source = {
    productId: sourceId,
    productContentDigest: digest("5"),
    packageName: sourcePackage,
    declaredDependencies: [dependencyFor([alpha.contractId, beta.contractId])],
    publicContracts: [sourceContract],
    evidence: makeEvidence(
      sourceId,
      digest("5"),
      sourcePackage,
      sourceText,
      sourceClosures,
      [sourceContract],
    ),
  };
  assert.equal(
    linkNativeContractSet(
      [source, target],
      toolchain.productContentDigest,
    ).kind,
    "linked",
  );
  assert.equal(
    linkNativeContractSet(
      [{
        ...source,
        declaredDependencies: [dependencyFor([alpha.contractId])],
      }, target],
      toolchain.productContentDigest,
    ).code,
    "unresolved_dependency",
    "export-star requires direct contract coverage for every visible symbol",
  );

  const directivePackage = "@s06-prime/type-directive-source";
  const directiveId = "product://s06-prime/type-directive-source@5";
  const directiveSource = [
    `/// <reference types="${targetPackage}/product" />`,
    `export interface UsesAlpha { readonly value: import("${targetPackage}/product").Alpha; }`,
  ].join("\n");
  const directiveClosures = await analyze(
    directivePackage,
    directiveSource,
  );
  const directiveContract = makeContract(
    "contract://s06-prime/type-directive-source@5",
    directiveId,
    directivePackage,
    "UsesAlpha",
    directiveClosures[0],
  );
  const directiveProduct = {
    productId: directiveId,
    productContentDigest: digest("6"),
    packageName: directivePackage,
    declaredDependencies: [
      dependencyFor([alpha.contractId, beta.contractId]),
    ],
    publicContracts: [directiveContract],
    evidence: makeEvidence(
      directiveId,
      digest("6"),
      directivePackage,
      directiveSource,
      directiveClosures,
      [directiveContract],
    ),
  };
  assert.equal(
    linkNativeContractSet(
      [directiveProduct, target],
      toolchain.productContentDigest,
    ).kind,
    "linked",
    "triple-slash type references use the same direct per-symbol authority",
  );
  assert.equal(
    linkNativeContractSet(
      [{
        ...directiveProduct,
        declaredDependencies: [dependencyFor([alpha.contractId])],
      }, target],
      toolchain.productContentDigest,
    ).code,
    "unresolved_dependency",
    "triple-slash type references cannot bypass complete symbol coverage",
  );

  const duplicateBeta = {
    ...beta,
    contractId: "contract://s06-prime/beta-duplicate@5",
  };
  assert.equal(
    linkNativeContractSet(
      [{
        ...source,
        declaredDependencies: [
          dependencyFor([
            alpha.contractId,
            beta.contractId,
            duplicateBeta.contractId,
          ]),
        ],
      }, {
        ...target,
        publicContracts: [alpha, beta, duplicateBeta],
      }],
      toolchain.productContentDigest,
    ).code,
    "ambiguous_dependency",
    "two contracts cannot own the same crossing symbol",
  );

  const augmentingSource = [
    "export interface Local { readonly value: string; }",
    `declare module "${targetPackage}/product" {`,
    "  interface Alpha { readonly forged: true; }",
    "}",
  ].join("\n");
  const augmentingClosures = await analyze(sourcePackage, augmentingSource);
  const augmentingContract = makeContract(
    "contract://s06-prime/augmenting-local@5",
    sourceId,
    sourcePackage,
    "Local",
    augmentingClosures[0],
  );
  assert.equal(
    linkNativeContractSet(
      [{
        ...source,
        publicContracts: [augmentingContract],
        evidence: makeEvidence(
          sourceId,
          digest("5"),
          sourcePackage,
          augmentingSource,
          augmentingClosures,
          [augmentingContract],
        ),
      }, target],
      toolchain.productContentDigest,
    ).code,
    "incompatible_dependency",
    "one Product cannot augment another Product's module",
  );

  const selfPackage = "@s06-prime/self-augmentation";
  const selfId = "product://s06-prime/self-augmentation@5";
  const selfSource = [
    "export interface Local { readonly value: string; }",
    `declare module "${selfPackage}/product" {`,
    "  interface Local { readonly extended: true; }",
    "}",
  ].join("\n");
  const selfClosures = await analyze(selfPackage, selfSource);
  const selfContract = makeContract(
    "contract://s06-prime/self-augmentation@5",
    selfId,
    selfPackage,
    "Local",
    selfClosures[0],
  );
  assert.equal(
    linkNativeContractSet([{
      productId: selfId,
      productContentDigest: digest("6"),
      packageName: selfPackage,
      declaredDependencies: [],
      publicContracts: [selfContract],
      evidence: makeEvidence(
        selfId,
        digest("6"),
        selfPackage,
        selfSource,
        selfClosures,
        [selfContract],
      ),
    }], toolchain.productContentDigest).kind,
    "linked",
    "same-Product inventoried augmentation must remain lawful",
  );

  const globalSource = [
    "export interface Local { readonly value: string; }",
    "declare global { interface ProductGlobal { readonly leaked: true; } }",
  ].join("\n");
  const globalClosures = await analyze(sourcePackage, globalSource);
  const globalContract = makeContract(
    "contract://s06-prime/global-local@5",
    sourceId,
    sourcePackage,
    "Local",
    globalClosures[0],
  );
  assert.equal(
    linkNativeContractSet(
      [{
        ...source,
        declaredDependencies: [],
        publicContracts: [globalContract],
        evidence: makeEvidence(
          sourceId,
          digest("5"),
          sourcePackage,
          globalSource,
          globalClosures,
          [globalContract],
        ),
      }, target],
      toolchain.productContentDigest,
    ).code,
    "incompatible_dependency",
    "Product-owned globals must refuse in a multi-Product closure",
  );
});

test("S06 installed module loading binds content, confinement, and import once", async () => {
  const manifest = JSON.parse(
    await readFile(
      join(packageRoot, "product-toolchain-manifest.json"),
      "utf8",
    ),
  );
  const currentInstall = {
    kind: "product_install",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    admissionEventRef: "event://s06-prime/current-install",
    installId: "product-install://s06-prime/current",
    installedRoot: packageRoot,
    productId: manifest.productId,
    packageName: manifest.packageName,
    packageVersion: manifest.packageVersion,
    artifactDigest: digest("c"),
    productContentDigest: manifest.productContentDigest,
    manifestDigest: sha256Canonical(manifest),
  };
  const loaded = await loadVerifiedInstalledModule(
    currentInstall,
    "build/code/src/gtl/index.js",
  );
  assert.equal(loaded.kind, "loaded");
  assert.equal(
    typeof loaded.module.constructHelloWorldModulePublication,
    "function",
  );
  assert.deepEqual(
    await loadVerifiedInstalledModule(
      {
        ...currentInstall,
        productContentDigest: digest("9"),
      },
      "build/code/src/gtl/index.js",
    ),
    { kind: "refused", code: "content_mismatch" },
  );
  assert.deepEqual(
    await loadVerifiedInstalledModule(currentInstall, "../outside.js"),
    { kind: "refused", code: "path_escape" },
  );
  assert.deepEqual(
    await loadVerifiedInstalledModule(
      currentInstall,
      "build/code/src/gtl/missing.js",
    ),
    { kind: "refused", code: "load_failed" },
  );
});

test("S06 declaration builders preserve Product meaning and reject malformed mechanics", () => {
  const contract = contractDeclaration({
    contractRef: "contract://s06-prime/input@5",
    contractVersion: "5.0.0",
    contractKind: "input",
    valueKind: "s06_prime_input",
  });
  const binding = implementationBinding({
    kind: "implementation_binding",
    bindingRef: "implementation-binding://s06-prime/fd@5",
    implementationRef: "implementation://s06-prime/fd@5",
    packageName: "@s06-prime/product",
    packageVersion: "5.0.0",
    modulePath: "build/index.js",
    namedSymbol: "realize",
    computeRegime: "F_D",
    inputContractRef: contract.contractRef,
    outputContractRef: "contract://s06-prime/output@5",
    failureContractRef: "contract://s06-prime/failure@5",
    refusalContractRef: "contract://s06-prime/refusal@5",
  });
  const closure = closureContract({
    kind: "closure_contract",
    closureContractRef: "contract://s06-prime/closure@5",
    predicateRef: "predicate://s06-prime/terminal@5",
    evidenceContractRef: "contract://s06-prime/evidence@5",
    resultContractRef: binding.outputContractRef,
    refusalContractRef: binding.refusalContractRef,
    refusalValueKind: "s06_prime_refusal",
    judgmentContractRef: "contract://s06-prime/judgment@5",
    rejectionContractRef: binding.refusalContractRef,
    transitionContractRef: "contract://s06-prime/transition@5",
    replayProjectionRef: "projection://s06-prime/replay@5",
    terminalKind: "completed",
    closureScope: "run",
    eventKindRefs: [
      "terminal_reached",
      "frame_closed",
      "graph_call_closed",
      "run_closed",
    ],
  });
  const contribution = catalogContribution({
    handle: "graph-function://s06-prime/run@5",
    kind: "graph_function",
    declarationOrContractRef: "graph-function://s06-prime/run@5",
    owningProductId: "product://s06-prime/product@5",
    programMembershipRefs: ["program://s06-prime/run@5"],
    readinessPrerequisiteRefs: ["program://s06-prime/run@5"],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [digest("d")],
  });
  assert.equal(Object.isFrozen(contract), true);
  assert.equal(Object.isFrozen(binding), true);
  assert.equal(Object.isFrozen(closure), true);
  assert.equal(Object.isFrozen(contribution.programMembershipRefs), true);
  assert.throws(
    () =>
      closureContract({
        ...closure,
        eventKindRefs: [
          "terminal_reached",
          "frame_closed",
          "graph_call_closed",
        ],
      }),
    /exact terminal event sequence/u,
  );

  const publication = constructHelloWorldModulePublication({
    productId: "product://s06-prime/abiogenesis@5",
    artifactDigest: digest("e"),
    productContentDigest: digest("f"),
    productManifestDigest: digest("0"),
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "5.0.0-dev.286",
  });
  assert.equal(Object.isFrozen(publication), true);
  assert.ok(publication.contracts.every(Object.isFrozen));
  assert.ok(publication.implementationBindings.every(Object.isFrozen));
  assert.ok(publication.closureContracts.every(Object.isFrozen));
  assert.ok(publication.contributions.every(Object.isFrozen));
});
