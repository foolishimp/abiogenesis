import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import { importInstalledPackageExport } from "../support/root-cli-environment.mjs";

const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;

const COMMON_CONTRACT_IDS = Object.freeze([
  "abg.schema.public-operation-contract",
  "abg.schema.public-operation-invocation",
  "abg.schema.public-operation-outcome",
]);

const OPERATION_IDS = Object.freeze([
  "abg.operation.workspace.create",
  "abg.operation.workspace.open",
  "abg.operation.project.read",
  "abg.operation.product.verify",
  "abg.operation.product.resolve",
  "abg.operation.product.install",
  "abg.operation.workspace.bind",
  "abg.operation.catalog.admit",
  "abg.operation.catalog.view",
  "abg.operation.catalog.apply",
  "abg.operation.run.invoke",
  "abg.operation.run.continue",
  "abg.operation.interaction.respond",
  "abg.operation.result.assess",
  "abg.operation.witness.admit",
  "abg.operation.conformance.evaluate",
  "abg.operation.product.materialize",
  "abg.operation.release.snapshot",
]);

const REPLACEMENT_CONTRACT_IDS = Object.freeze(
  [...COMMON_CONTRACT_IDS, ...OPERATION_IDS].sort(),
);

const MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS = Object.freeze([
  "abg.schema.product-toolchain-manifest",
  "abg.schema.public-contract-catalog",
  "abg.schema.public-operation-contract",
  "abg.schema.public-operation-invocation",
  "abg.schema.public-operation-outcome",
  "abg.schema.native-contract-inventory",
  "abg.schema.capability-contract",
  "abg.schema.closed-vocabulary",
  "abg.schema.gtl-graph-function",
  "abg.schema.gtl-module",
  "abg.schema.gtl-c-program",
  "abg.schema.gtl-program-conformance-input",
  "abg.schema.catalog-product-descriptor",
  "abg.schema.catalog-contribution-manifest",
  "abg.schema.resolved-product-lock",
  "abg.schema.workspace-binding",
  "abg.schema.install-manifest",
  "abg.schema.installer-manifest",
  "abg.schema.catalog-admission",
  "abg.schema.host-invocation",
  "abg.schema.runtime-event",
  "abg.schema.runtime-result",
  "abg.schema.runtime-replay",
  "abg.schema.fh-interaction",
  "abg.schema.tenant-conformance-manifest",
  "abg.schema.self-conformance-result",
  "abg.schema.exact-candidate-qualification",
  "abg.schema.consensus-subject",
  "abg.schema.consensus-panel",
  "abg.schema.consensus-reviewer-profile",
  "abg.schema.review-findings",
  "abg.schema.review-rulings",
  "abg.schema.consensus-round-policy",
  "abg.schema.consensus-round-outcome",
  "abg.schema.consensus-result",
  "abg.schema.ticket-consensus-projection",
  "abg.schema.release-snapshot",
  "abg.schema.a5-r1-release-manifest",
  "abg.vocabulary.runtime-event-kind",
  "abg.vocabulary.gtl-program-diagnostic-id",
  "abg.vocabulary.gtl-program-repair-edit-class",
  "abg.vocabulary.review-ruling-kind",
  "abg.vocabulary.consensus-round-outcome",
  "abg.asset.gtl.language-conformance-corpus",
]);

function canonicalize(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function sha256Bytes(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function canonicalDigest(value) {
  return sha256Bytes(canonicalJson(value));
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function isDeepFrozen(value) {
  return value === null || typeof value !== "object" ||
    (Object.isFrozen(value) && Object.values(value).every(isDeepFrozen));
}

const SUCCESS_ORACLE = deepFreeze({
  caseId: "success",
  inputLaw: {
    attempt:
      "the exact ProductCatalogBindingAttempt over the verified extant catalog, exact future production PFC-F07 proposal set, Product identity, and Product content identity",
    concreteProjectionSource:
      "future production PFC-F07 only; Increment 0A supplies no family, proposal, owner, digest, locator, or generated asset value",
  },
  outcomeLaw: {
    disposition: "bound",
    retainedRows: "preserved byte-for-byte",
    replacementContractIds: REPLACEMENT_CONTRACT_IDS,
    replacedCommonIdentityCount: 3,
    replacedOperationIdentityCount: 18,
    diagnostic: {
      relation: "MandatorySchemaVocabularyCorpusGapSet",
      mandatoryIdentityCorpus: MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS,
      mandatoryIdentityCorpusCount: 44,
      meaning: "S06 publication diagnostic only; not release closure",
    },
    runtimeEventDelta: 0,
  },
});

function refusalOracle(caseId, failureClass, mutationLaw, issuePathLaw) {
  return deepFreeze({
    caseId,
    mutationLaw,
    outcomeLaw: {
      kind: "public_catalog_binding_refusal",
      disposition: "refused",
      attempt:
        "exact canonical equality with the future production PFC-F07-backed attempt supplied to the Product relation",
      failureClass,
      issuePaths: issuePathLaw,
      issuePathCardinality: "unique and non-empty",
      catalog: "absent",
      diagnostic: "absent",
      runtimeEventDelta: 0,
    },
  });
}

const REFUSAL_ORACLES = deepFreeze([
  refusalOracle(
    "forbidden-extant-operation-row",
    "forbidden_operation_identity",
    "add exactly one extant abg.operation.* identity outside the accepted eighteen-operation set",
    "only JSON Pointer paths naming the forbidden extant operation identity",
  ),
  refusalOracle(
    "duplicate-contract-identity",
    "duplicate_contract_identity",
    "duplicate exactly one contract identity in the supplied production PFC-F07 proposal sequence",
    "only JSON Pointer paths naming the duplicated proposal identities",
  ),
  refusalOracle(
    "omitted-projected-identity",
    "missing_projected_identity",
    "omit exactly one of the three common or eighteen operation identities from the supplied production PFC-F07 proposal sequence",
    "only JSON Pointer paths naming the missing projected identity relation",
  ),
  refusalOracle(
    "extra-projected-identity",
    "unexpected_projected_identity",
    "add exactly one identity outside the three common plus eighteen operation projection set",
    "only JSON Pointer paths naming the unexpected projected identity",
  ),
  refusalOracle(
    "changed-retained-row",
    "retained_row_changed",
    "change exactly one field of one extant row outside the replacement identity set",
    "only JSON Pointer paths naming the changed retained row field",
  ),
  refusalOracle(
    "wrong-owning-product",
    "owning_product_mismatch",
    "change only the owning Product of one otherwise exact production PFC-F07 proposal",
    "only JSON Pointer paths naming the mismatched owning Product",
  ),
  refusalOracle(
    "unresolved-locator",
    "unresolved_locator",
    "change only one production PFC-F07 proposal locator so its declared content cannot be resolved",
    "only JSON Pointer paths naming the unresolved locator",
  ),
  refusalOracle(
    "mismatched-content-digest",
    "content_digest_mismatch",
    "change only one production PFC-F07 proposal content digest while retaining resolvable content",
    "only JSON Pointer paths naming the mismatched content digest",
  ),
]);

const DECLARATIVE_ORACLES = deepFreeze([
  SUCCESS_ORACLE,
  ...REFUSAL_ORACLES,
]);

function catalogDigest(catalog) {
  const { catalogDigest: _catalogDigest, ...preimage } = catalog;
  return canonicalDigest(preimage);
}

function safeInstalledPath(installedRoot, locatorPath) {
  assert.equal(typeof locatorPath, "string");
  assert.equal(locatorPath.length > 0, true);
  assert.equal(isAbsolute(locatorPath), false);
  assert.equal(locatorPath.includes("\\"), false);
  const resolved = resolve(installedRoot, locatorPath);
  const relation = relative(installedRoot, resolved);
  assert.equal(
    relation.length > 0 &&
      relation !== ".." &&
      !relation.startsWith(`..${sep}`) &&
      !isAbsolute(relation),
    true,
    locatorPath,
  );
  return resolved;
}

function resolveDefinition(bytes, definitionRef) {
  if (definitionRef === undefined) return true;
  assert.equal(definitionRef.startsWith("#"), true);
  let current = JSON.parse(bytes.toString("utf8"));
  const pointer = decodeURIComponent(definitionRef.slice(1));
  if (pointer.length === 0) return true;
  assert.equal(pointer.startsWith("/"), true);
  for (const encodedSegment of pointer.slice(1).split("/")) {
    assert.doesNotMatch(encodedSegment, /~(?:[^01]|$)/u);
    const segment = encodedSegment.replace(/~1/gu, "/").replace(/~0/gu, "~");
    assert.equal(typeof current, "object");
    assert.notEqual(current, null);
    assert.equal(Object.hasOwn(current, segment), true, definitionRef);
    current = current[segment];
  }
  return true;
}

async function validateExtantCatalog(catalog, harness, packageJson) {
  assert.equal(catalogDigest(catalog), catalog.catalogDigest);
  const catalogSchemaBytes = await readFile(
    safeInstalledPath(
      harness.installedPackageRoot,
      catalog.catalogSchemaPath,
    ),
  );
  assert.equal(sha256Bytes(catalogSchemaBytes), catalog.catalogSchemaDigest);

  const byteCache = new Map();
  let assetLocatorCount = 0;
  let nativeLocatorCount = 0;
  for (const row of catalog.rows) {
    assert.match(row.contractDigest, DIGEST_PATTERN);
    assert.equal(Array.isArray(row.requirementAuthorityRefs), true);
    assert.equal(row.requirementAuthorityRefs.length > 0, true);
    assert.equal(Array.isArray(row.capabilityIdentities), true);
    assert.equal(row.capabilityIdentities.length > 0, true);

    if (row.assetLocator !== undefined) {
      const assetPath = safeInstalledPath(
        harness.installedPackageRoot,
        row.assetLocator.path,
      );
      if (!byteCache.has(assetPath)) byteCache.set(assetPath, await readFile(assetPath));
      const bytes = byteCache.get(assetPath);
      assert.equal(sha256Bytes(bytes), row.assetLocator.contentDigest);
      assert.equal(sha256Bytes(bytes), row.contractDigest);
      assert.equal(resolveDefinition(bytes, row.assetLocator.definitionRef), true);
      assetLocatorCount += 1;
    }

    if (row.nativeTypedLocator !== undefined) {
      const locator = row.nativeTypedLocator;
      assert.equal(locator.packageName, packageJson.name);
      assert.notEqual(packageJson.exports?.[locator.packageExportPath], undefined);
      assert.equal(locator.declarationInventory.length > 0, true);
      assert.equal(
        locator.declarationInventory.some(
          (entry) => entry.declarationPath === locator.declarationPath,
        ),
        true,
      );
      for (const entry of locator.declarationInventory) {
        const declarationPath = safeInstalledPath(
          harness.installedPackageRoot,
          entry.declarationPath,
        );
        if (!byteCache.has(declarationPath)) {
          byteCache.set(declarationPath, await readFile(declarationPath));
        }
        assert.equal(
          sha256Bytes(byteCache.get(declarationPath)),
          entry.declarationDigest,
        );
      }
      if (row.contractKind === "native_typed_group") {
        assert.equal(
          canonicalDigest(locator.declarationInventory),
          row.contractDigest,
        );
      }
      nativeLocatorCount += 1;
    }

    const locatorLaw = {
      native_typed_group: [false, true],
      schema_asset: [true, false],
      serialized_native_contract: [true, true],
      vocabulary_asset: [true, false],
    }[row.contractKind];
    assert.notEqual(locatorLaw, undefined, row.contractKind);
    assert.equal(row.assetLocator !== undefined, locatorLaw[0]);
    assert.equal(row.nativeTypedLocator !== undefined, locatorLaw[1]);
  }

  return {
    catalogId: catalog.catalogId,
    catalogVersion: catalog.catalogVersion,
    catalogDigest: catalog.catalogDigest,
    rowCount: catalog.rows.length,
    assetLocatorCount,
    nativeLocatorCount,
    catalogDigestVerified: true,
    catalogSchemaDigestVerified: true,
    allExtantLocatorsVerified: true,
  };
}

function containsConcretePfcF07Value(value) {
  const forbiddenFields = new Set([
    "attemptRef",
    "attemptDigest",
    "familyRef",
    "familyDigest",
    "proposalSetRef",
    "proposalSetDigest",
    "proposals",
    "proposalAssets",
    "definitionDigest",
    "ownerPortDigest",
    "ownerAuthorityDigest",
    "assetLocator",
    "nativeTypedLocator",
  ]);
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsConcretePfcF07Value);
  return Object.entries(value).some(
    ([key, child]) =>
      forbiddenFields.has(key) || containsConcretePfcF07Value(child),
  );
}

export async function runAxPfcF08({ harness, packageRoot }) {
  assert.equal(resolve(packageRoot), resolve(harness.sourcePackageRoot));
  const [product, abg] = await Promise.all([
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/product",
      "increment-0a=pfc-f08-product",
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/abg",
      "increment-0a=pfc-f08-abg",
    ),
  ]);
  const packageJson = JSON.parse(
    await readFile(join(harness.installedPackageRoot, "package.json"), "utf8"),
  );
  const targetExportsPresent = {
    contracts: Object.hasOwn(product, "PUBLIC_CATALOG_BINDING_CONTRACTS"),
    callable: Object.hasOwn(product, "bindS06PublicFunctionCatalog"),
  };
  assert.deepEqual(targetExportsPresent, { contracts: false, callable: false });

  const verification = await product.verifyProduct({
    artifactPath: harness.artifactPath,
    artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis),
  });
  assert.equal(verification.kind, "verified_product_artifact");
  assert.equal(
    verification.productContentDigest,
    harness.candidateManifest.productContentDigest,
  );
  const extantCatalog = await validateExtantCatalog(
    harness.candidateManifest.publicContractCatalog,
    harness,
    packageJson,
  );

  const eventStore = new abg.AbgEventStore();
  const eventStoreBefore = {
    count: eventStore.readAll().length,
    digest: eventStore.digest(),
  };
  const eventStoreAfter = {
    count: eventStore.readAll().length,
    digest: eventStore.digest(),
  };
  assert.deepEqual(eventStoreAfter, eventStoreBefore);

  const oracleDigests = DECLARATIVE_ORACLES.map(canonicalDigest);
  assert.equal(DECLARATIVE_ORACLES.length, 9);
  assert.equal(REFUSAL_ORACLES.length, 8);
  assert.equal(new Set(oracleDigests).size, 9);
  assert.equal(DECLARATIVE_ORACLES.every(isDeepFrozen), true);
  assert.equal(containsConcretePfcF07Value(DECLARATIVE_ORACLES), false);

  return {
    relationId: "AX-PFC-F08",
    disposition: "confirmed_red",
    claim:
      "the installed Product lacks the exact PFC-F08 catalog-binding contracts and callable",
    ingress:
      "installed @abiogenesis/typescript-tenant/product PUBLIC_CATALOG_BINDING_CONTRACTS and bindS06PublicFunctionCatalog exports",
    fixtureSource: {
      authority:
        "accepted design section 13 and census AX-PFC-F08 missing-export characterization",
      installedArtifactVerified: true,
      extantCatalog,
      concretePfcF07Values: "deferred exclusively to future production PFC-F07",
      oracleDigests,
    },
    processBoundary:
      "one installed immutable Product load and one untouched ABG event store; Increment 0A constructs no PFC family, proposal, attempt, binding, or output value",
    mutation: REFUSAL_ORACLES.map((oracle) => ({
      caseId: oracle.caseId,
      failureClass: oracle.outcomeLaw.failureClass,
      mutationLaw: oracle.mutationLaw,
    })),
    oracle: {
      success: SUCCESS_ORACLE,
      refusals: REFUSAL_ORACLES,
    },
    expectedBaselineSignature: {
      disposition: "confirmed_red",
      targetExportsPresent: { contracts: false, callable: false },
      concretePfcF07ValuesPresent: false,
      runtimeEventDelta: 0,
    },
    observedSignature: {
      targetExportsPresent,
      installedArtifactVerified: verification.kind === "verified_product_artifact",
      extantCatalog,
      declarativeOracleCount: DECLARATIVE_ORACLES.length,
      distinctDeclarativeOracleDigestCount: new Set(oracleDigests).size,
      concretePfcF07ValuesPresent:
        containsConcretePfcF07Value(DECLARATIVE_ORACLES),
      eventStoreBefore,
      eventStoreAfter,
    },
    maskControls: [
      {
        control:
          "the packed installed Product and complete extant catalog basis verify before the missing target export is recorded",
        passed:
          verification.kind === "verified_product_artifact" &&
          extantCatalog.catalogDigestVerified &&
          extantCatalog.catalogSchemaDigestVerified &&
          extantCatalog.allExtantLocatorsVerified,
      },
      {
        control:
          "the accepted replacement and mandatory-diagnostic identity sets remain exact without constructing any proposal value",
        passed:
          COMMON_CONTRACT_IDS.length === 3 &&
          OPERATION_IDS.length === 18 &&
          REPLACEMENT_CONTRACT_IDS.length === 21 &&
          new Set(REPLACEMENT_CONTRACT_IDS).size === 21 &&
          MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS.length === 44,
      },
      {
        control:
          "one success and eight distinct refusal laws are deeply immutable and content-addressably distinct",
        passed:
          DECLARATIVE_ORACLES.length === 9 &&
          REFUSAL_ORACLES.length === 8 &&
          DECLARATIVE_ORACLES.every(isDeepFrozen) &&
          new Set(oracleDigests).size === 9,
      },
      {
        control:
          "the refusal laws preserve the exact accepted closed failure algebra and require exact attempt echo, unique non-empty issue paths, no catalog, no diagnostic, and no event",
        passed:
          REFUSAL_ORACLES.map((oracle) => oracle.outcomeLaw.failureClass)
            .join("\0") === [
              "forbidden_operation_identity",
              "duplicate_contract_identity",
              "missing_projected_identity",
              "unexpected_projected_identity",
              "retained_row_changed",
              "owning_product_mismatch",
              "unresolved_locator",
              "content_digest_mismatch",
            ].join("\0") &&
          REFUSAL_ORACLES.every(
            (oracle) =>
              oracle.outcomeLaw.attempt.includes("exact canonical equality") &&
              oracle.outcomeLaw.issuePathCardinality === "unique and non-empty" &&
              oracle.outcomeLaw.catalog === "absent" &&
              oracle.outcomeLaw.diagnostic === "absent" &&
              oracle.outcomeLaw.runtimeEventDelta === 0,
          ),
      },
      {
        control:
          "Increment 0A supplies no concrete PFC-F01, PFC-F02, or PFC-F07 family, owner, proposal, attempt, digest, locator, or generated asset value",
        passed: containsConcretePfcF07Value(DECLARATIVE_ORACLES) === false,
      },
      {
        control:
          "missing installed Product exports are the sole executed baseline defect and the characterization emits no ABG runtime event",
        passed:
          targetExportsPresent.contracts === false &&
          targetExportsPresent.callable === false &&
          eventStoreAfter.count === eventStoreBefore.count &&
          eventStoreAfter.digest === eventStoreBefore.digest,
      },
    ],
    cases: DECLARATIVE_ORACLES.map((oracle, index) => ({
      caseId: oracle.caseId,
      expected: {
        baseline: "exact installed PFC-F08 exports absent",
        finalOracleDigest: oracleDigests[index],
      },
      observed: {
        targetExportsPresent,
        concretePfcF07ValuesPresent: false,
        eventDelta: eventStoreAfter.count - eventStoreBefore.count,
        eventDigestChanged: eventStoreAfter.digest !== eventStoreBefore.digest,
      },
      passed:
        targetExportsPresent.contracts === false &&
        targetExportsPresent.callable === false &&
        eventStoreAfter.count === eventStoreBefore.count &&
        eventStoreAfter.digest === eventStoreBefore.digest,
    })),
  };
}
