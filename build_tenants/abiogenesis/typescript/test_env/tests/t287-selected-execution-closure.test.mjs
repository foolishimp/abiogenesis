import assert from "node:assert/strict";
import fs from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SourceTextModule, SyntheticModule } from "node:vm";
import test from "node:test";
import ts from "typescript";
import { acquireNewEmptyAppendSinkFixture } from "../support/new-empty-append-sink.mjs";

const tenant = resolve(import.meta.dirname, "../..");
const installed = process.env.ABI5_SELECTED_CLOSURE_INSTALLED_ROOT;
const evidence = process.env.ABI5_SELECTED_CLOSURE_EVIDENCE;
const historyFixture = process.env.ABI5_SELECTED_CLOSURE_HISTORY_FIXTURE;
assert.ok(installed && evidence && historyFixture, "select the frozen installed owner, refused request and finite historical fixture");
const load = relative => import(pathToFileURL(join(installed, "build/code/src", relative + ".js")).href);
const [product, gtl, validator, events, prefixes, invocations, oldBasis] = await Promise.all([
  load("product/index"), load("gtl/index"), load("validator/index"), load("abg/event_store"),
  load("abg/event_prefix"), load("abg/invocation_admission"), load("abg/execution_basis"),
]);
const read = path => JSON.parse(fs.readFileSync(path, "utf8"));
const sha = product.sha256Canonical;
const { deepFreeze } = await load("shared/immutable");

async function sourceOwner() {
  const source = fs.readFileSync(process.env.ABI5_SELECTED_CLOSURE_PREIMAGE ?? join(tenant, "code/src/abg/execution_basis.ts"), "utf8");
  const built = join(installed, "build/code/src/abg/execution_basis.js");
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
  const module = new SourceTextModule(code, { identifier: built });
  await module.link(async specifier => {
    const values = await import(specifier.startsWith(".") ? pathToFileURL(resolve(dirname(built), specifier)).href : specifier);
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}
const owner = await sourceOwner();
let selection;
async function selected() {
  if (selection) return selection;
  // Retained request/config are ordinary fixture input. The original event log
  // and workspace are never opened. Install admission is a supplied premise.
  const request = read(join(evidence, "run-start.jsonl")).invocation;
  const prepared = read(join(evidence, "preparation.json"));
  const actual = read(join(evidence, "native-stdout.json")).receipt;
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog: request.resources.catalog,
    catalogView: request.resources.catalogView,
    admittedInstalls: prepared.installedProducts,
    verifyInstallAdmission: install => prepared.installedProducts.some(saved => sha(saved) === sha(install)),
    programRef: request.invocation.request.program.ref,
    selection: read(join(evidence, "../execution-08-remaining-selection/configuration.json")).start.selection,
  });
  assert.equal(resolution.kind, "loaded_product_execution_resolution", JSON.stringify(resolution));
  assert.equal(resolution.resolution.resolutionRef, actual.resources.productExecutionResolution.ref);
  assert.equal(resolution.resolution.resolutionDigest, actual.resources.productExecutionResolution.digest);
  assert.equal(resolution.program.starts.length, 2);
  assert.equal(resolution.programValidation.executableLeafRows.length, 11);
  assert.equal(resolution.implementationSetCandidate.rows.length, 8);
  const originalEvents = fs.readFileSync(join(evidence, "native-appended-physical-evidence.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
  assert.deepEqual(originalEvents.map(row => row.kind), ["public_operation_admitted", "invocation_admitted", "invocation_refused"]);
  selection = { resolution, request, originalEvents, installedProducts: prepared.installedProducts };
  return selection;
}

async function fixture(t, options = {}) {
  const { resolution, request, originalEvents } = await selected();
  const resource = await acquireNewEmptyAppendSinkFixture(t, events.createNewEmptyAppendSink, "abi5-selected-closure-");
  // The two retained admission observations are supplied lower premises in a
  // disposable two-event fixture, with new local event ordinals/identities.
  // This is not reacquisition of their history or installed qualification.
  const localEventRefs = new Map();
  for (const original of originalEvents.slice(0, 2)) {
    const { eventId, admissionOrdinal, payloadDigest, eventContractDigest, ...candidate } = original;
    candidate.causationEventRefs = candidate.causationEventRefs.map(ref => localEventRefs.get(ref) ?? ref);
    const admitted = events.admitRuntimeEvent(resource.store, candidate);
    localEventRefs.set(eventId, admitted.eventId);
  }
  const prefix = events.selectHeldEventStoreDurablePrefix(resource.store);
  const authority = prefixes.selectValidatedRuntimeEventPrefix(resource.store.readAll());
  const invocationAdmission = invocations.rehydrateInvocationAdmissionAtPrefix(authority, originalEvents[1].payload.invocationAdmissionRef);
  assert.ok(invocationAdmission, "existing invocation owner authenticates the supplied pair");
  const rawInputValue = request.invocation.request.input.value;
  const graphInput = { invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: invocationAdmission.rawInputAdmissionRef, admittedInputDigest: invocationAdmission.rawInputDigest, admittedInput: rawInputValue };
  const graph = gtl.materializeGraph(resolution.graphFunction, graphInput);
  const graphValidation = validator.validateGraph(graph, resolution.programValidation, resolution.graphFunction, graphInput);
  assert.equal(graphValidation.kind, "graph_validation");
  const input = {
    invocationAdmission, executionResolution: resolution.resolution,
    rawInputValue, program: resolution.program, programPublication: resolution.programPublication,
    programValidation: resolution.programValidation, graph, graphValidation,
    resolutionSetCandidate: resolution.implementationSetCandidate,
    resolutionSetValidation: resolution.implementationSetValidation, closureContract: resolution.closureContract,
    ...options,
  };
  const admit = () => owner.admitExecutionBasis(resource.store, prefix, input, {
    eventTime: "2026-09-23T07:05:13.324Z", correlationId: "correlation://component/selected-closure", causationEventRefs: [],
  });
  return { ...resource, input, admit };
}

test("lawful multi-entry Program conserves the admitted eight-leaf selection out of eleven", async t => {
  const f = await fixture(t);
  const result = f.admit();
  assert.equal(result.kind, "execution_basis_admission", JSON.stringify(result));
  assert.deepEqual(result.implementationSet.executableLeafKeys, f.input.resolutionSetCandidate.executableLeafKeys);
  assert.equal(result.implementationSet.rows.length, 8);
  assert.deepEqual(result.executionBasis.localExecutableLeafKeys, result.implementationSet.executableLeafKeys);
  assert.deepEqual(f.store.readAll().slice(2).map(row => row.kind), ["implementation_admitted", "basis_admitted"]);
  const prefix = prefixes.selectValidatedRuntimeEventPrefix(f.store.readAll());
  assert.deepEqual(owner.rehydrateExecutionBasisAtPrefix(prefix, result.executionBasis.basisRef), result.executionBasis);
  assert.equal("declarationClosure" in f.store.readAll().at(-1).payload, false, "fresh ingress adds no event field");
});

for (const variant of ["missing", "foreign", "duplicate"]) {
  test(`refuses ${variant} selected leaf substitution before execution admission`, async t => {
    const { resolution } = await selected();
    const candidate = structuredClone(resolution.implementationSetCandidate);
    if (variant === "missing") { candidate.rows.pop(); candidate.executableLeafKeys.pop(); }
    if (variant === "duplicate") { candidate.rows[1] = candidate.rows[0]; candidate.executableLeafKeys[1] = candidate.executableLeafKeys[0]; }
    if (variant === "foreign") { candidate.rows[0].graphFunctionRef = "graph-function://foreign/unselected@5"; }
    const { kind, schemaVersion, disposition, setCandidateRef, setCandidateDigest, ...body } = candidate;
    candidate.setCandidateDigest = sha(body);
    candidate.setCandidateRef = `implementation-resolution-set-candidate://abiogenesis/${candidate.setCandidateDigest.slice(7)}`;
    const f = await fixture(t, { resolutionSetCandidate: candidate });
    const result = f.admit();
    assert.equal(result.kind, "invocation_refusal_admission_receipt");
    assert.deepEqual(result.admission.contractOrDiagnosticRefs, ["diagnostic://abiogenesis/execution-basis/resolution-set-mismatch@5"]);
    assert.deepEqual(f.store.readAll().slice(2).map(row => row.kind), ["invocation_refused"]);
  });
}

test("single-entry resolution retains its whole-Program implementation meaning", async () => {
  const { request, installedProducts } = await selected();
  const catalog = request.resources.catalog;
  const programRef = gtl.HELLO_WORLD_IDS.programRef;
  const graphFunctionRef = gtl.HELLO_WORLD_IDS.graphFunctionRef;
  const view = product.narrowGraphFunctionCatalog(catalog, [graphFunctionRef]);
  assert.equal(view.kind, "graph_function_catalog_view", JSON.stringify(view));
  const resolution = await product.ProductExecutionResolutionPort.resolve({ catalog, catalogView: view,
    admittedInstalls: installedProducts, verifyInstallAdmission: install => installedProducts.some(saved => sha(saved) === sha(install)),
    programRef, selection: { kind: "start", scope: "program", target: "graph_function", graphFunctionHandle: graphFunctionRef, until: "converged", rootMode: "direct" } });
  assert.equal(resolution.kind, "loaded_product_execution_resolution", JSON.stringify(resolution));
  assert.equal(resolution.program.starts.length, 1);
  assert.deepEqual(resolution.implementationSetCandidate.executableLeafKeys, resolution.programValidation.transitiveReachableExecutableLeafKeys);
  assert.equal(resolution.implementationSetCandidate.rows.length, 1);
});

test("self-consistent foreign selected closure cannot replace the admitted resolution", async t => {
  const { resolution } = await selected();
  const foreign = structuredClone(resolution.resolution);
  const removed = foreign.declarationOwners.find(owner => owner.declarationKind === "graph_function");
  foreign.declarationOwners = foreign.declarationOwners.filter(owner => owner !== removed);
  const f = await fixture(t, { executionResolution: foreign });
  assert.equal(f.admit().kind, "invocation_refusal_admission_receipt");
  const { kind: resolutionKind, schemaVersion: version, disposition, resolutionRef, resolutionDigest, ...resolutionBody } = foreign;
  foreign.resolutionDigest = sha(resolutionBody);
  foreign.resolutionRef = `product-execution-resolution://abiogenesis/${foreign.resolutionDigest.slice(7)}`;
  assert.equal(product.isProductExecutionResolution(foreign), true);
  const g = await fixture(t, { executionResolution: foreign });
  assert.equal(g.admit().kind, "invocation_refusal_admission_receipt");
});

test("single-entry historical basis payloads still replay without new ingress fields", async () => {
  const bytes = fs.readFileSync(historyFixture);
  assert.equal(product.sha256Bytes(bytes), "sha256:e8147dd35d207590170bea4f4f2018935c6a5c7fc9893cc3f56585e332692667");
  const rows = bytes.toString("utf8").trim().split("\n").map(JSON.parse);
  const prefix = prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(rows));
  const bases = rows.filter(row => row.kind === "basis_admitted");
  const publication = gtl.constructHelloWorldModulePublication({ productId: "product://fixture/selected-closure",
    artifactDigest: sha({ fixture: "artifact" }), productContentDigest: sha({ fixture: "content" }),
    productManifestDigest: sha({ fixture: "manifest" }), packageName: "@abiogenesis/typescript-tenant", packageVersion: "5.0.0-rc.1" });
  const single = publication.programs.find(program => program.programRef === "program://abiogenesis/conformance/hello-compose@5");
  assert.equal(single.starts.length, 1);
  assert.ok(bases.some(row => row.payload.programRef === single.programRef && row.payload.programDigest === sha(single)));
  for (const event of bases) {
    assert.equal("declarationClosure" in event.payload, false);
    assert.equal("executionResolution" in event.payload, false);
    const before = oldBasis.rehydrateExecutionBasisAtPrefix(prefix, event.payload.basisRef);
    assert.ok(before);
    assert.deepEqual(owner.rehydrateExecutionBasisAtPrefix(prefix, event.payload.basisRef), before);
  }
});

test("the actual Public refusal call preserves admitted event and diagnostic references", async () => {
  const { originalEvents } = await selected();
  const refusal = originalEvents[2];
  const source = fs.readFileSync(join(tenant, "code/src/owner_bindings/run_invocation.ts"), "utf8");
  const ast = ts.createSourceFile("run_invocation.ts", source, ts.ScriptTarget.Latest, true);
  const matches = [];
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === "ProductRunInvocationPort.projectOwnerRefusal" &&
      node.arguments[1]?.getText(ast).includes('stage: "execution_basis"')) matches.push(node.arguments[1]);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.equal(matches.length, 1);
  const actualArgument = Function("execution", `return (${matches[0].getText(ast)});`)({ admission: {
    ...refusal.payload, admissionEventRef: refusal.eventId,
  } });
  const result = product.ProductRunInvocationPort.projectOwnerRefusal("start", actualArgument);
  assert.equal(result.value.code, "invalid_graph_function");
  assert.deepEqual(result.value.issuePaths, ["/execution_basis"]);
  assert.deepEqual(result.value.evidenceRefs, [refusal.eventId, ...refusal.payload.contractOrDiagnosticRefs]);
});
