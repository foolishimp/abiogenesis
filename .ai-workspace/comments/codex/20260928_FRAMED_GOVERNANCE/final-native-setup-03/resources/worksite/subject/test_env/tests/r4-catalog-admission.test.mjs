import assert from "node:assert/strict";
import test from "node:test";

import { createNewEmptyAppendSink } from "../../build/code/src/abg/index.js";
import {
  applyCatalogDeclaration,
  buildGraphFunctionCatalog,
  graphFunctionCatalogCanonicalSnapshot,
  lookupGraphFunction,
  lookupGraphFunctionDefinition,
  narrowGraphFunctionCatalog,
  refreshGraphFunctionCatalog,
} from "../../build/code/src/product/catalog.js";
import {
  CONSENSUS_IDS,
  HELLO_WORLD_DIRECT_IDS,
  HELLO_WORLD_IDS,
  constructConsensusModulePublication,
  constructHelloWorldModulePublication,
} from "../../build/code/src/gtl/index.js";
import { sha256Canonical } from "../../build/code/src/shared/digests.js";
import { acquireNewEmptyAppendSinkFixture } from "../support/new-empty-append-sink.mjs";

const artifact = Object.freeze({
  productId: "product://abiogenesis/catalog-proof@5",
  artifactDigest: `sha256:${"1".repeat(64)}`,
  productContentDigest: `sha256:${"2".repeat(64)}`,
  productManifestDigest: `sha256:${"3".repeat(64)}`,
  packageName: "@abiogenesis/catalog-proof",
  packageVersion: "5.0.0",
});

function publications() {
  return [
    constructHelloWorldModulePublication(artifact),
    constructConsensusModulePublication(artifact),
  ];
}

function requireCatalog(result) {
  assert.equal(result.kind, "graph_function_catalog", JSON.stringify(result));
  return result;
}

function requireView(result) {
  assert.equal(
    result.kind,
    "graph_function_catalog_view",
    JSON.stringify(result),
  );
  return result;
}

test("R4 catalog construction is permutation and cache-loss deterministic", () => {
  const [hello, consensus] = publications();
  const forward = requireCatalog(buildGraphFunctionCatalog([hello, consensus]));
  const reverse = requireCatalog(buildGraphFunctionCatalog([consensus, hello]));
  const reconstructed = requireCatalog(buildGraphFunctionCatalog(
    structuredClone([hello, consensus]),
  ));

  assert.equal(
    graphFunctionCatalogCanonicalSnapshot(forward),
    graphFunctionCatalogCanonicalSnapshot(reverse),
  );
  assert.equal(
    graphFunctionCatalogCanonicalSnapshot(forward),
    graphFunctionCatalogCanonicalSnapshot(reconstructed),
  );
  assert.deepEqual(
    forward.entries.map((entry) => entry.handle),
    [...forward.entries.map((entry) => entry.handle)].sort(),
  );
  assert.equal(Object.isFrozen(forward), true);
  assert.equal(Object.isFrozen(forward.entries), true);
  assert.equal(Object.isFrozen(forward.byHandle), true);
});

test("R4 refresh adds and replaces exact publication sets", () => {
  const [hello, consensus] = publications();
  const initial = requireCatalog(buildGraphFunctionCatalog([hello]));
  const added = requireCatalog(refreshGraphFunctionCatalog([hello, consensus]));
  assert.ok(added.entries.length > initial.entries.length);
  assert.notEqual(added.basisDigest, initial.basisDigest);
  assert.equal(
    lookupGraphFunction(added, "gtl://abg/consensus/submitter-reviewer-rounds")?.definitionRef,
    CONSENSUS_IDS.graphFunctionRef,
  );

  const changed = structuredClone(hello);
  const changedHelloGraphFunction = changed.graphFunctions.find(
    (candidate) => candidate.name === HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.ok(changedHelloGraphFunction);
  changedHelloGraphFunction.tags = [
    ...changedHelloGraphFunction.tags,
    "dynamic-refresh-proof",
  ];
  const replaced = requireCatalog(refreshGraphFunctionCatalog([changed]));
  assert.notEqual(replaced.basisDigest, initial.basisDigest);
  assert.notEqual(
    lookupGraphFunction(replaced, HELLO_WORLD_IDS.graphFunctionRef)
      ?.definitionDigest,
    lookupGraphFunction(initial, HELLO_WORLD_IDS.graphFunctionRef)
      ?.definitionDigest,
  );
});

test("R4 keeps canonical handles distinct from GraphFunction definitions", () => {
  const [hello] = publications();
  const catalog = requireCatalog(buildGraphFunctionCatalog([hello]));
  const directSelected = lookupGraphFunction(
    catalog,
    HELLO_WORLD_DIRECT_IDS.handle,
  );
  assert.ok(directSelected);
  assert.equal(directSelected.handle, HELLO_WORLD_DIRECT_IDS.handle);
  assert.equal(
    directSelected.definitionRef,
    HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.notEqual(directSelected.handle, directSelected.definitionRef);
  const narrowed = requireView(narrowGraphFunctionCatalog(
    catalog,
    [
      HELLO_WORLD_IDS.graphFunctionRef,
      HELLO_WORLD_DIRECT_IDS.handle,
    ],
  ));
  const exactCanonical = lookupGraphFunctionDefinition(
    narrowed,
    HELLO_WORLD_IDS.graphFunctionRef,
    HELLO_WORLD_IDS.programRef,
  );
  assert.equal(exactCanonical.kind, "graph_function_definition_lookup_exact");
  assert.equal(exactCanonical.entry.handle, HELLO_WORLD_IDS.graphFunctionRef);
  const exactDirect = lookupGraphFunctionDefinition(
    narrowed,
    HELLO_WORLD_IDS.graphFunctionRef,
    HELLO_WORLD_DIRECT_IDS.programRef,
  );
  assert.equal(exactDirect.kind, "graph_function_definition_lookup_exact");
  assert.deepEqual(exactDirect.entry, directSelected);
  const absent = lookupGraphFunctionDefinition(
    narrowed,
    HELLO_WORLD_IDS.graphFunctionRef,
    "program://abiogenesis/conformance/absent@5",
  );
  assert.deepEqual(absent, {
    kind: "graph_function_definition_lookup_absent",
    definitionRef: HELLO_WORLD_IDS.graphFunctionRef,
    programRef: "program://abiogenesis/conformance/absent@5",
  });

  const ambiguousHello = structuredClone(hello);
  const ambiguousAlias = ambiguousHello.contributions.find(
    (row) => row.handle === HELLO_WORLD_DIRECT_IDS.handle,
  );
  assert.ok(ambiguousAlias);
  ambiguousAlias.programMembershipRefs = [
    ...ambiguousAlias.programMembershipRefs,
    HELLO_WORLD_IDS.programRef,
  ];
  const ambiguousCatalog = requireCatalog(
    buildGraphFunctionCatalog([ambiguousHello]),
  );
  const ambiguous = lookupGraphFunctionDefinition(
    ambiguousCatalog,
    HELLO_WORLD_IDS.graphFunctionRef,
    HELLO_WORLD_IDS.programRef,
  );
  assert.equal(
    ambiguous.kind,
    "graph_function_definition_lookup_ambiguous",
  );
  assert.deepEqual(
    ambiguous.entries.map((entry) => entry.handle),
    [HELLO_WORLD_DIRECT_IDS.handle, HELLO_WORLD_IDS.graphFunctionRef].sort(),
  );
  assert.equal(Object.isFrozen(ambiguous), true);
  assert.equal(Object.isFrozen(ambiguous.entries), true);
});

test("R4 equal duplicates are idempotent and unequal collisions refuse", () => {
  const [hello, consensus] = publications();
  const single = requireCatalog(buildGraphFunctionCatalog([hello]));
  const duplicate = requireCatalog(buildGraphFunctionCatalog([
    hello,
    structuredClone(hello),
  ]));
  assert.equal(
    graphFunctionCatalogCanonicalSnapshot(single),
    graphFunctionCatalogCanonicalSnapshot(duplicate),
  );

  const collision = structuredClone(consensus);
  collision.contributions[0].handle = HELLO_WORLD_IDS.graphFunctionRef;
  const refused = buildGraphFunctionCatalog([hello, collision]);
  assert.equal(refused.kind, "catalog_construction_refusal");
  assert.equal(refused.code, "canonical_handle_collision");

  const unequalPublication = structuredClone(hello);
  const unequalHelloGraphFunction = unequalPublication.graphFunctions.find(
    (candidate) => candidate.name === HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.ok(unequalHelloGraphFunction);
  unequalHelloGraphFunction.tags = ["unequal-module-proof"];
  const publicationRefusal = buildGraphFunctionCatalog([
    hello,
    unequalPublication,
  ]);
  assert.equal(publicationRefusal.kind, "catalog_construction_refusal");
  assert.equal(publicationRefusal.code, "publication_identity_collision");

  const wrongDefinition = structuredClone(hello);
  const wrongDefinitionAlias = wrongDefinition.contributions.find(
    (row) => row.handle === HELLO_WORLD_DIRECT_IDS.handle,
  );
  assert.ok(wrongDefinitionAlias);
  wrongDefinitionAlias.declarationOrContractRef =
    "graph-function://abiogenesis/conformance/absent@5";
  const definitionRefusal = buildGraphFunctionCatalog([wrongDefinition]);
  assert.equal(definitionRefusal.kind, "catalog_construction_refusal");
  assert.equal(definitionRefusal.code, "graph_function_definition_missing");

  const wrongMembership = structuredClone(hello);
  const wrongMembershipAlias = wrongMembership.contributions.find(
    (row) => row.handle === HELLO_WORLD_DIRECT_IDS.handle,
  );
  assert.ok(wrongMembershipAlias);
  wrongMembershipAlias.programMembershipRefs = [
    "program://abiogenesis/conformance/absent@5",
  ];
  const membershipRefusal = buildGraphFunctionCatalog([wrongMembership]);
  assert.equal(membershipRefusal.kind, "catalog_construction_refusal");
  assert.equal(membershipRefusal.code, "invalid_program_membership");

  for (const field of [
    "programMembershipRefs",
    "readinessPrerequisiteRefs",
    "compatibilityRefs",
    "provenanceRefs",
  ]) {
    const duplicatedInventory = structuredClone(hello);
    const contribution = duplicatedInventory.contributions.find(
      (row) => row.handle === HELLO_WORLD_IDS.graphFunctionRef,
    );
    assert.ok(contribution);
    assert.ok(contribution[field].length > 0, `${field} duplicate witness`);
    contribution[field].push(contribution[field][0]);
    const duplicateRefusal = buildGraphFunctionCatalog([
      duplicatedInventory,
    ]);
    assert.equal(
      duplicateRefusal.kind,
      "catalog_construction_refusal",
      JSON.stringify(duplicateRefusal),
    );
    assert.equal(duplicateRefusal.code, "duplicate_contribution_reference");
    assert.equal(
      duplicateRefusal.message.includes(field),
      true,
      duplicateRefusal.message,
    );
  }
});

test("R4 view and declaration application are pure and non-callable separated", () => {
  const catalog = requireCatalog(buildGraphFunctionCatalog(publications()));
  const declaration = catalog.declarationEntries.find(
    (entry) => entry.declarationKind === "node_type",
  );
  assert.ok(declaration, "consensus publication must expose a node type");
  assert.equal(lookupGraphFunction(catalog, declaration.handle), null);
  assert.equal(catalog.byHandle[declaration.handle], undefined);
  assert.equal(
    catalog.declarationsByHandle[declaration.handle]?.entryDigest,
    declaration.entryDigest,
  );

  const view = requireView(narrowGraphFunctionCatalog(catalog, [
    HELLO_WORLD_IDS.graphFunctionRef,
    declaration.handle,
  ]));
  assert.equal(view.entries.length, 1);
  assert.equal(view.declarationEntries.length, 1);
  assert.equal(
    lookupGraphFunction(view, HELLO_WORLD_IDS.graphFunctionRef)?.definitionRef,
    HELLO_WORLD_IDS.graphFunctionRef,
  );

  const targetDigest = sha256Canonical({
    programRef: CONSENSUS_IDS.oneSurfaceProgramRef,
  });
  const appliedValueDigest = sha256Canonical({ value: "proof" });
  const application = applyCatalogDeclaration(view, {
    applicationKind: "node_type",
    handle: declaration.handle,
    targetRef: CONSENSUS_IDS.oneSurfaceProgramRef,
    targetDigest,
    appliedValueRef: "value://t287/catalog-proof",
    appliedValueDigest,
  });
  assert.equal(application.kind, "declaration_application");
  assert.equal(application.declaration.entryDigest, declaration.entryDigest);
  assert.equal(Object.isFrozen(application), true);
  assert.deepEqual(
    application,
    applyCatalogDeclaration(structuredClone(view), {
      applicationKind: "node_type",
      handle: declaration.handle,
      targetRef: CONSENSUS_IDS.oneSurfaceProgramRef,
      targetDigest,
      appliedValueRef: "value://t287/catalog-proof",
      appliedValueDigest,
    }),
  );

  const wrongKind = applyCatalogDeclaration(view, {
    applicationKind: "overlay",
    handle: declaration.handle,
    targetRef: CONSENSUS_IDS.oneSurfaceProgramRef,
    targetDigest,
    appliedValueRef: "value://t287/catalog-proof",
    appliedValueDigest,
  });
  assert.equal(wrongKind.kind, "declaration_application_refusal");
  assert.equal(wrongKind.code, "kind_mismatch");
});

test("R4 pure catalog operations admit zero registry or catalog events", async (context) => {
  const { store } = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-r4-store-",
  );
  const catalog = requireCatalog(buildGraphFunctionCatalog(publications()));
  const view = requireView(narrowGraphFunctionCatalog(catalog, [
    HELLO_WORLD_IDS.graphFunctionRef,
  ]));
  assert.ok(lookupGraphFunction(view, HELLO_WORLD_IDS.graphFunctionRef));
  assert.deepEqual(store.readAll(), []);
  assert.equal(
    store.readAll().some((event) =>
      (
        event.kind === "public_operation_artifact_admitted" &&
        typeof event.payload === "object" &&
        event.payload !== null &&
        "operationId" in event.payload &&
        (
          event.payload.operationId === "abg.operation.catalog.admit" ||
          event.payload.operationId === "abg.operation.catalog.view"
        )
      )
    ),
    false,
  );
});
