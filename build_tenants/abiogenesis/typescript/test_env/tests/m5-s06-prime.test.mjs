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
  constructResolvedProductLock,
  isResolvedProductLock,
  sha256Canonical,
} from "../../build/code/src/product/index.js";
import {
  resolveExactMatch,
} from "../../build/code/src/product/exact_match.js";
import {
  loadVerifiedInstalledModule,
} from "../../build/code/src/product/installed_module.js";

const packageRoot = new URL("../..", import.meta.url).pathname;
const digest = (character) => `sha256:${character.repeat(64)}`;

function install(label, character, overrides = {}) {
  const productId = `product://s06-prime/${label}@5`;
  const packageName = `@s06-prime/${label}`;
  const productContentDigest = digest(character);
  const descriptorRef = `descriptor://s06-prime/${label}@5`;
  const contributionManifestRef =
    `contribution-manifest://s06-prime/${label}@5`;
  const publicContract = {
    contractId: `contract://s06-prime/${label}@5`,
    contractVersion: "5.0.0",
    contractDigest: digest(character),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [`requirement://s06-prime/${label}@5`],
    capabilityIdentities: [`capability://s06-prime/${label}@5`],
    nativeTypedLocator: {
      packageName,
      packageExportPath: "./product",
      namedSymbol: "S06PrimeContract",
      exportedSymbols: ["S06PrimeContract"],
      declarationPath: "build/product.d.ts",
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
  };
  const lockDigest = sha256Canonical(lockBody);
  const forged = {
    kind: "resolved_product_lock",
    schemaVersion: "5.0.0",
    lockId:
      `product-lock://abiogenesis/${lockDigest.slice("sha256:".length)}`,
    lockDigest,
    rows: cycleRows,
    dependencyEdges: cycleEdges,
  };
  assert.equal(
    isResolvedProductLock(forged),
    false,
    "a digest-consistent cyclic lock must still fail validation",
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
