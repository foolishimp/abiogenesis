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

function install(label, character) {
  return {
    kind: "product_install",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    admissionEventRef: `event://s06-prime/${label}`,
    installId: `product-install://s06-prime/${label}`,
    installedRoot: `/tmp/s06-prime/${label}`,
    productId: `product://s06-prime/${label}@5`,
    packageName: `@s06-prime/${label}`,
    packageVersion: "5.0.0",
    artifactDigest: digest(character),
    productContentDigest: digest(character),
    manifestDigest: digest(character),
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
  const left = install("left", "a");
  const right = install("right", "b");
  const acyclic = constructResolvedProductLock(
    [left, right],
    [{
      kind: "requires",
      fromProductId: left.productId,
      toProductId: right.productId,
    }],
  );
  assert.equal(acyclic.kind, "resolved_product_lock");
  assert.equal(isResolvedProductLock(acyclic), true);

  const cycleEdges = [{
    kind: "requires",
    fromProductId: left.productId,
    toProductId: right.productId,
  }, {
    kind: "requires",
    fromProductId: right.productId,
    toProductId: left.productId,
  }];
  const refused = constructResolvedProductLock([left, right], cycleEdges);
  assert.equal(refused.kind, "environment_refusal");
  assert.equal(refused.code, "invalid_dependency");

  const lockBody = {
    rows: acyclic.rows,
    dependencyEdges: cycleEdges,
  };
  const lockDigest = sha256Canonical(lockBody);
  const forged = {
    ...acyclic,
    lockId:
      `product-lock://abiogenesis/${lockDigest.slice("sha256:".length)}`,
    lockDigest,
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
