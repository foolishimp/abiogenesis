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
  LANGUAGE_TEST_DIRECT_IDS,
  LANGUAGE_TEST_IDS,
  constructLanguageTestModulePublication,
} from "../support/language-test-gtl.mjs";
import {
  STRUCTURAL_DIRECT_IDS,
  STRUCTURAL_IDS,
  constructStructuralModulePublication,
} from "../support/language-structural-gtl.mjs";
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

const NODE_TYPE_HANDLE = "node-type://abiogenesis/catalog-proof/subject@5";

// The second publication carries one non-callable node_type declaration beside
// its GraphFunction contributions.
function structuralPublication() {
  const publication = structuredClone(
    constructStructuralModulePublication(artifact),
  );
  publication.contributions.push({
    handle: NODE_TYPE_HANDLE,
    kind: "node_type",
    declarationOrContractRef: STRUCTURAL_IDS.inputContractRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [],
    readinessPrerequisiteRefs: [],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  });
  return publication;
}

function publications() {
  return [
    constructLanguageTestModulePublication(artifact),
    structuralPublication(),
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
  const [hello, structural] = publications();
  const forward = requireCatalog(buildGraphFunctionCatalog([hello, structural]));
  const reverse = requireCatalog(buildGraphFunctionCatalog([structural, hello]));
  const reconstructed = requireCatalog(buildGraphFunctionCatalog(
    structuredClone([hello, structural]),
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
  const [hello, structural] = publications();
  const initial = requireCatalog(buildGraphFunctionCatalog([hello]));
  const added = requireCatalog(refreshGraphFunctionCatalog([hello, structural]));
  assert.ok(added.entries.length > initial.entries.length);
  assert.notEqual(added.basisDigest, initial.basisDigest);
  assert.equal(
    lookupGraphFunction(added, STRUCTURAL_DIRECT_IDS.handle)?.definitionRef,
    STRUCTURAL_IDS.graphFunctionRef,
  );

  const changed = structuredClone(hello);
  const changedHelloGraphFunction = changed.graphFunctions.find(
    (candidate) => candidate.name === LANGUAGE_TEST_IDS.graphFunctionRef,
  );
  assert.ok(changedHelloGraphFunction);
  changedHelloGraphFunction.tags = [
    ...changedHelloGraphFunction.tags,
    "dynamic-refresh-proof",
  ];
  const replaced = requireCatalog(refreshGraphFunctionCatalog([changed]));
  assert.notEqual(replaced.basisDigest, initial.basisDigest);
  assert.notEqual(
    lookupGraphFunction(replaced, LANGUAGE_TEST_IDS.graphFunctionRef)
      ?.definitionDigest,
    lookupGraphFunction(initial, LANGUAGE_TEST_IDS.graphFunctionRef)
      ?.definitionDigest,
  );
});

test("R4 keeps canonical handles distinct from GraphFunction definitions", () => {
  const [hello] = publications();
  const catalog = requireCatalog(buildGraphFunctionCatalog([hello]));
  const directSelected = lookupGraphFunction(
    catalog,
    LANGUAGE_TEST_DIRECT_IDS.handle,
  );
  assert.ok(directSelected);
  assert.equal(directSelected.handle, LANGUAGE_TEST_DIRECT_IDS.handle);
  assert.equal(
    directSelected.definitionRef,
    LANGUAGE_TEST_IDS.graphFunctionRef,
  );
  assert.notEqual(directSelected.handle, directSelected.definitionRef);
  const narrowed = requireView(narrowGraphFunctionCatalog(
    catalog,
    [
      LANGUAGE_TEST_IDS.graphFunctionRef,
      LANGUAGE_TEST_DIRECT_IDS.handle,
    ],
  ));
  const exactCanonical = lookupGraphFunctionDefinition(
    narrowed,
    LANGUAGE_TEST_IDS.graphFunctionRef,
    LANGUAGE_TEST_IDS.programRef,
  );
  assert.equal(exactCanonical.kind, "graph_function_definition_lookup_exact");
  assert.equal(exactCanonical.entry.handle, LANGUAGE_TEST_IDS.graphFunctionRef);
  const exactDirect = lookupGraphFunctionDefinition(
    narrowed,
    LANGUAGE_TEST_IDS.graphFunctionRef,
    LANGUAGE_TEST_DIRECT_IDS.programRef,
  );
  assert.equal(exactDirect.kind, "graph_function_definition_lookup_exact");
  assert.deepEqual(exactDirect.entry, directSelected);
  const absent = lookupGraphFunctionDefinition(
    narrowed,
    LANGUAGE_TEST_IDS.graphFunctionRef,
    "program://abiogenesis/conformance/absent@5",
  );
  assert.deepEqual(absent, {
    kind: "graph_function_definition_lookup_absent",
    definitionRef: LANGUAGE_TEST_IDS.graphFunctionRef,
    programRef: "program://abiogenesis/conformance/absent@5",
  });

  const ambiguousHello = structuredClone(hello);
  const ambiguousAlias = ambiguousHello.contributions.find(
    (row) => row.handle === LANGUAGE_TEST_DIRECT_IDS.handle,
  );
  assert.ok(ambiguousAlias);
  ambiguousAlias.programMembershipRefs = [
    ...ambiguousAlias.programMembershipRefs,
    LANGUAGE_TEST_IDS.programRef,
  ];
  const ambiguousCatalog = requireCatalog(
    buildGraphFunctionCatalog([ambiguousHello]),
  );
  const ambiguous = lookupGraphFunctionDefinition(
    ambiguousCatalog,
    LANGUAGE_TEST_IDS.graphFunctionRef,
    LANGUAGE_TEST_IDS.programRef,
  );
  assert.equal(
    ambiguous.kind,
    "graph_function_definition_lookup_ambiguous",
  );
  assert.deepEqual(
    ambiguous.entries.map((entry) => entry.handle),
    [LANGUAGE_TEST_DIRECT_IDS.handle, LANGUAGE_TEST_IDS.graphFunctionRef].sort(),
  );
  assert.equal(Object.isFrozen(ambiguous), true);
  assert.equal(Object.isFrozen(ambiguous.entries), true);
});

test("R4 equal duplicates are idempotent and unequal collisions refuse", () => {
  const [hello, structural] = publications();
  const single = requireCatalog(buildGraphFunctionCatalog([hello]));
  const duplicate = requireCatalog(buildGraphFunctionCatalog([
    hello,
    structuredClone(hello),
  ]));
  assert.equal(
    graphFunctionCatalogCanonicalSnapshot(single),
    graphFunctionCatalogCanonicalSnapshot(duplicate),
  );

  const collision = structuredClone(structural);
  collision.contributions[0].handle = LANGUAGE_TEST_IDS.graphFunctionRef;
  const refused = buildGraphFunctionCatalog([hello, collision]);
  assert.equal(refused.kind, "catalog_construction_refusal");
  assert.equal(refused.code, "canonical_handle_collision");

  const unequalPublication = structuredClone(hello);
  const unequalHelloGraphFunction = unequalPublication.graphFunctions.find(
    (candidate) => candidate.name === LANGUAGE_TEST_IDS.graphFunctionRef,
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
    (row) => row.handle === LANGUAGE_TEST_DIRECT_IDS.handle,
  );
  assert.ok(wrongDefinitionAlias);
  wrongDefinitionAlias.declarationOrContractRef =
    "graph-function://abiogenesis/conformance/absent@5";
  const definitionRefusal = buildGraphFunctionCatalog([wrongDefinition]);
  assert.equal(definitionRefusal.kind, "catalog_construction_refusal");
  assert.equal(definitionRefusal.code, "graph_function_definition_missing");

  const wrongMembership = structuredClone(hello);
  const wrongMembershipAlias = wrongMembership.contributions.find(
    (row) => row.handle === LANGUAGE_TEST_DIRECT_IDS.handle,
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
      (row) => row.handle === LANGUAGE_TEST_IDS.graphFunctionRef,
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
  assert.ok(declaration, "structural publication must expose a node type");
  assert.equal(declaration.handle, NODE_TYPE_HANDLE);
  assert.equal(lookupGraphFunction(catalog, declaration.handle), null);
  assert.equal(catalog.byHandle[declaration.handle], undefined);
  assert.equal(
    catalog.declarationsByHandle[declaration.handle]?.entryDigest,
    declaration.entryDigest,
  );

  const view = requireView(narrowGraphFunctionCatalog(catalog, [
    LANGUAGE_TEST_IDS.graphFunctionRef,
    declaration.handle,
  ]));
  assert.equal(view.entries.length, 1);
  assert.equal(view.declarationEntries.length, 1);
  assert.equal(
    lookupGraphFunction(view, LANGUAGE_TEST_IDS.graphFunctionRef)?.definitionRef,
    LANGUAGE_TEST_IDS.graphFunctionRef,
  );

  const targetDigest = sha256Canonical({
    programRef: STRUCTURAL_IDS.programRef,
  });
  const appliedValueDigest = sha256Canonical({ value: "proof" });
  const application = applyCatalogDeclaration(view, {
    applicationKind: "node_type",
    handle: declaration.handle,
    targetRef: STRUCTURAL_IDS.programRef,
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
      targetRef: STRUCTURAL_IDS.programRef,
      targetDigest,
      appliedValueRef: "value://t287/catalog-proof",
      appliedValueDigest,
    }),
  );

  const wrongKind = applyCatalogDeclaration(view, {
    applicationKind: "overlay",
    handle: declaration.handle,
    targetRef: STRUCTURAL_IDS.programRef,
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
    LANGUAGE_TEST_IDS.graphFunctionRef,
  ]));
  assert.ok(lookupGraphFunction(view, LANGUAGE_TEST_IDS.graphFunctionRef));
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

// The catalog-application site of the shared schema-asset admission. The
// catalog, view, environment, publication and owner identities are supplied
// lower premises; the site's schema loop and `admitInstalledSchemaAsset` run as
// built over one installed root.
test("R4 catalog application lands each schema-asset admission refusal in its unready message", async (context) => {
  const { mkdtemp, mkdir, writeFile, readFile, rm } = await import("node:fs/promises");
  const { join, resolve, dirname } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const { pathToFileURL, fileURLToPath } = await import("node:url");
  const { SourceTextModule, SyntheticModule } = await import("node:vm");
  const { sha256Bytes } = await import("../../build/code/src/shared/digests.js");
  const installedRoot = await mkdtemp(join(tmpdir(), "r4-schema-admission-"));
  context.after(() => rm(installedRoot, { recursive: true, force: true }));
  const productId = "product://abiogenesis/schema-admission@5", contractId = "abg.schema.r4-application-value";
  const document = (dialect) => Buffer.from(JSON.stringify({ $schema: dialect, $id: contractId, type: "object",
    properties: { kind: { const: "r4_application_value" } }, required: ["kind"] }));
  const current = document("https://json-schema.org/draft/2020-12/schema");
  const draft07 = document("http://json-schema.org/draft-07/schema#");
  await mkdir(join(installedRoot, "schemas"), { recursive: true });
  await writeFile(join(installedRoot, "schemas/value.schema.json"), current);
  await writeFile(join(installedRoot, "schemas/draft07.schema.json"), draft07);
  const schemaRow = (overrides = {}, bytes = current, path = "schemas/value.schema.json") => ({
    contractKind: "schema_asset", contractId, owningProduct: productId, contractVersion: "5.0.0", contractDigest: sha256Bytes(bytes),
    assetLocator: { mediaType: "application/schema+json", path, contentDigest: sha256Bytes(bytes) }, ...overrides });
  const programRef = "program://abiogenesis/schema-admission@5", handle = "overlay://abiogenesis/schema-admission@5";
  const declaration = { contractRef: contractId, contractVersion: "5.0.0", valueKind: "r4_application_value" };
  const program = { programRef, callableMembership: [] };
  const publication = { moduleRef: "module://abiogenesis/schema-admission@5", contracts: [declaration], programs: [program] };
  const row = { handle, moduleRef: publication.moduleRef, publicationDigest: sha256Canonical("publication"), owningProductId: productId,
    declarationKind: "overlay", declarationOrContractRef: contractId, programMembershipRefs: [programRef] };
  const contribution = { moduleRef: row.moduleRef, handle, kind: "overlay", declarationOrContractRef: contractId, owningProductId: productId,
    programMembershipRefs: [programRef], provenanceRef: "provenance://abiogenesis/schema-admission@5" };
  const binding = { bindingId: "binding://abiogenesis/schema-admission@5", bindingDigest: sha256Canonical("binding") };
  const lock = { lockId: "lock://abiogenesis/schema-admission@5", lockDigest: sha256Canonical("lock") };
  const catalog = { kind: "graph_function_catalog", workspaceBindingId: binding.bindingId, workspaceBindingDigest: binding.bindingDigest,
    basisDigest: sha256Canonical("catalog"), boundPublications: [publication],
    readinessBasis: { workspaceBinding: binding, resolvedLock: lock, installedProducts: [{ productId }],
      verifiedProducts: [{ productId, descriptorRef: "descriptor://abiogenesis/schema-admission@5", productContentDigest: sha256Canonical("content"),
        contributionManifestRef: "contributions://abiogenesis/schema-admission@5", contributionManifestDigest: sha256Canonical("contributions"),
        contributionManifest: { rows: [contribution] } }] } };
  const view = { kind: "graph_function_catalog_view", viewDigest: sha256Canonical("view"), declarationsByHandle: { [handle]: row }, entries: [] };
  let install;
  const environment = () => ({ kind: "exact_prefix_workspace_environment", workspaceBindingCandidate: binding, resolvedProductLock: lock,
    productInstalls: [install], artifactTruth: { projectionRef: "truth://r4", projectionDigest: sha256Canonical("truth") },
    workspaceAuthorityBasis: { authorityBasisDigest: sha256Canonical("authority") }, workspaceBinding: binding });
  const replacements = {
    "./catalog.js": { admitGraphFunctionCatalog: () => catalog, narrowGraphFunctionCatalog: () => view,
      applyCatalogDeclaration: () => ({ kind: "declaration_application" }) },
    "../abg/environment_admission.js": { projectExactPrefixWorkspaceEnvironment: environment, projectAdmittedProductInstall: () => install },
    "../abg/event_store.js": { validateDurablePrefixCoordinate: () => true },
    "./publication.js": { modulePublicationSemanticDigest: () => row.publicationDigest },
    "./environment.js": { productInstallCoordinate: () => ({ ref: productId, digest: sha256Canonical("install") }) },
    "../validator/raw_admission.js": { rawAdmitValue: () => ({ kind: "raw_admitted_value" }) },
    "./declaration_exports.js": { readExecutingToolchainIdentity: () => ({ manifestDigest: sha256Canonical("toolchain") }) },
  };
  const file = fileURLToPath(new URL("../../build/code/src/product/declaration_application.js", import.meta.url));
  const site = new SourceTextModule(await readFile(file, "utf8"), { identifier: file });
  await site.link(async (specifier) => {
    const actual = await import(specifier.startsWith(".") ? pathToFileURL(resolve(dirname(file), specifier)).href : specifier);
    const values = { ...actual, ...(replacements[specifier] ?? {}) };
    return new SyntheticModule(Object.keys(values), function () { for (const [k, v] of Object.entries(values)) this.setExport(k, v); });
  });
  await site.evaluate();
  const construct = (contractRow, bytes = current) => {
    install = { productId, installedRoot, publicContracts: [contractRow] };
    return site.namespace.constructCatalogApplicationResources({ catalog, catalogView: view, catalogRow: row,
      construction: { prefix: { coordinateDigest: sha256Canonical("prefix") }, programRef, targetRef: programRef,
        value: { kind: "r4_application_value" }, schemaAssets: [{ productId, contractId, bytesBase64: bytes.toString("base64") }] } });
  };
  // The falsifier: the admitted asset passes every check and the application is constructed.
  const admitted = construct(schemaRow());
  assert.equal(admitted.application.kind, "declaration_application");
  assert.deepEqual(admitted.resources.validationReceipt.ref.startsWith("validation://abiogenesis/"), true);
  const unready = (contractRow, message, bytes) => assert.throws(() => construct(contractRow, bytes),
    (error) => error.code === "unready" && error.message === message, message);
  unready(schemaRow({ assetLocator: { ...schemaRow().assetLocator, mediaType: "application/json" } }), "schema asset has no compatible installed locator");
  unready(schemaRow({ contractVersion: "4.0.0" }), "schema asset has no compatible installed locator");
  unready(schemaRow({}, current, "../outside.schema.json"), "schema locator escapes its installed owner");
  unready(schemaRow({}, draft07, "schemas/draft07.schema.json"), "unsupported or crossed schema dialect/identity", draft07);

  // Declaration predecessor relation over genuine Event Store coordinates and
  // the actual owned readers. The catalog, view, environment and coordinate
  // validation above stay explicit premises; each earlier cut receives its own
  // consistent resources through the actual constructor.
  await context.test("R4 catalog application predecessor is the same-log exact earlier cut", async (t) => {
    const events = await import("../../build/code/src/abg/event_store.js");
    const { readFileSync, writeFileSync, statSync } = await import("node:fs");
    const scratch = await mkdtemp(join(tmpdir(), "r4-predecessor-"));
    t.after(() => rm(scratch, { recursive: true, force: true }));
    const candidate = (n) => ({ kind: "public_operation_admitted", eventTime: "2026-11-03T00:00:00.000Z", aggregateType: "workspace",
      aggregateId: "invocation://r4-predecessor/" + n, parentAggregateId: null, causationEventRefs: [], correlationId: "correlation://r4-predecessor/" + n,
      workflowVersion: "5.0.0", scopeClass: "workspace", basisId: "basis://r4-predecessor",
      payload: { invocationDigest: sha256Canonical(n), invocationRef: "invocation://r4-predecessor/" + n, operationId: "abg.operation.project.read", variant: "status" } });
    const sinks = [];
    const sink = (name) => {
      const acquired = createNewEmptyAppendSink({ kind: "new_empty_append_sink_request", schemaVersion: "5.0.0", eventLogPath: join(scratch, name + ".jsonl") });
      assert.ok("store" in acquired, JSON.stringify(acquired)); sinks.push(acquired.store); return acquired;
    };
    t.after(() => { for (const store of sinks) try { store.closeDurableLog(); } catch {} });
    const append = (acquired, prefix, n) => events.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store, prefix,
      () => events.admitRuntimeEvent(acquired.store, candidate(n))).successorPrefix;
    const primary = sink("primary"), empty = primary.prefix, one = append(primary, empty, "one"), two = append(primary, one, "two");
    const foreign = sink("foreign"), foreignOne = append(foreign, foreign.prefix, "one");
    const resourcesAt = (prefix) => {
      install = { productId, installedRoot, publicContracts: [schemaRow()] };
      return site.namespace.constructCatalogApplicationResources({ catalog, catalogView: view, catalogRow: row,
        construction: { prefix, programRef, targetRef: programRef, value: { kind: "r4_application_value" },
          schemaAssets: [{ productId, contractId, bytesBase64: current.toString("base64") }] } }).resources;
    };
    // Test oracle: the original same-log ordered-prefix relation over complete
    // authenticated histories; complete materialization is this boundary's output.
    const oracle = (earlier, now) => {
      const a = events.readRuntimeEventsAtDurablePrefix(earlier), b = events.readRuntimeEventsAtDurablePrefix(now);
      return earlier.eventLogRef === now.eventLogRef && a.length <= b.length && sha256Canonical(b.slice(0, a.length)) === sha256Canonical(a);
    };
    const logical = "application prefix is not an exact predecessor of this invocation";
    const decide = (earlier, now) => {
      try { return site.namespace.reconstructCatalogApplication(resourcesAt(earlier), now).kind; }
      catch (error) { return error.code === "unready" && error.message === logical ? "logical_refusal" : "physical_refusal:" + error.message; }
    };
    const cases = [["empty/equal", empty, empty], ["empty/nonempty", empty, two], ["exact predecessor", one, two], ["equal nonempty", two, two],
      ["current shorter than earlier", two, one], ["foreign log", foreignOne, two], ["copied earlier coordinate", structuredClone(one), two],
      ["copied current coordinate", one, structuredClone(two)]];
    const rows = cases.map(([name, earlier, now]) => ({ name, oracle: oracle(earlier, now), decision: decide(earlier, now) }));
    for (const row of rows) assert.equal(row.decision, row.oracle ? "declaration_application" : "logical_refusal", row.name);
    assert.deepEqual(rows.filter((row) => !row.oracle).map((row) => row.name), ["current shorter than earlier", "foreign log"]);
    // A tampered or reordered physical resource is refused by authentication
    // before the logical comparison. That boundary is recorded as physical; it
    // is not evidence for the later digest-inequality branch, and a same-log
    // divergent history is not constructible over one append-only log.
    const bytes = readFileSync(new URL(two.eventLogRef)), lines = bytes.toString("utf8").trimEnd().split("\n");
    const resource = (name, text) => {
      const path = join(scratch, name + ".jsonl"); writeFileSync(path, text, { flag: "wx" }); const stat = statSync(path);
      const body = { ...two, eventLogRef: pathToFileURL(path).href, storeIdentity: { ...two.storeIdentity, device: stat.dev, inode: stat.ino } };
      delete body.coordinateDigest; return { ...body, coordinateDigest: sha256Canonical(body) };
    };
    const altered = resource("altered", lines[0] + "\n" + lines[1].replace("r4-predecessor/two", "r4-predecessor/2wo") + "\n");
    const reordered = resource("reordered", lines[1] + "\n" + lines[0] + "\n");
    const physical = [["altered earlier bytes", altered, two], ["reordered earlier bytes", reordered, two], ["altered current bytes", one, altered]]
      .map(([name, earlier, now]) => { const decision = decide(earlier, now); assert.match(decision, /^physical_refusal:/, name);
        assert.doesNotMatch(decision, new RegExp(logical), name); return { name, decision }; });
    // The closed owner keeps no authority: both cuts authenticate cold.
    primary.store.closeDurableLog();
    assert.equal(decide(one, two), "declaration_application", "closed-owner predecessor authenticates cold");
    assert.equal(decide(two, one), "logical_refusal", "closed-owner shorter current cut");
    t.diagnostic(JSON.stringify({ kind: "r4_declaration_predecessor", rows, physical, sameLogDivergentHistory: "not constructible over one append-only log; unclaimed" }));
  });
});
