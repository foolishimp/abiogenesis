import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import * as product from "../../build/code/src/product/index.js";
import { evidenceGate } from "../support/evidence-root.mjs";

// Each complete candidate is retained under ABG_REGRESSION_PROOF_ROOT, one
// file per case, before its assertions run. Retained evidence is only read.
const regressionRoot = process.env.ABG_REGRESSION_PROOF_ROOT;
async function retainCandidate(name, value) {
  if (!regressionRoot) return;
  const directory = join(regressionRoot, "w2-steel-single-start-closure");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, `${name}.json`), `${JSON.stringify(value)}\n`);
}

// Retired (T-292 TD-60): a retained C2 pre-actor failure Run keeps its historical cuts; input the retained installed C2 pre-actor failure not recorded
// Retired (T-292 TD-60): retry continuation keeps the retained C1 input of a completed prefix; input the retained completed C1 prefix not recorded
// Retired (T-292 TD-60): the fan-out output of a retained C0 prefix validates apart from leaf slots; input the retained successful C0 prefix not recorded
// Retired (T-292 TD-60): a retained C0 publication witness binds raw and installed identities; input the retained installed C0 prefix not recorded
// Retired (T-292 TD-60): a retained first-leaf stage output keeps its C1 task carrier; input the retained installed first-leaf prefix not recorded
// Retired (T-292 TD-60): an installed preflight binds raw publication apart from installed identity; input the authentic installed preflight and original prefix not recorded

// The retained installed conformance call resolves through evidence gate
// catalogue row steel03-retained-call under ABI5_EVIDENCE_ROOT.
const retainedCall = evidenceGate("steel03-retained-call");
const callPath = retainedCall.kind === "present" ? retainedCall.inputs.call.path : undefined;

test("consumer callable membership resolves exact borrowed owners without contributor membership rewriting", {
  skip: retainedCall.kind === "absent" && retainedCall.reason,
}, async () => {
  const call = JSON.parse(await readFile(callPath, "utf8")).invocation;
  const resources = call.resources;
  const supplied = resources.declarationCatalog;
  // The Product's Catalog owner re-derives the recorded Catalog from its recorded readiness
  // basis under the explicit recorded question, as the historical declaration proof does;
  // catalog.admit refuses this basis (below). The recorded result is retained apart by the
  // owner and never becomes an owner-admitted ready Catalog for new work.
  const catalog = product.admitGraphFunctionCatalog(supplied.catalog.readinessBasis, "recorded");
  // The same historical declaration offered as new work asks the strict question
  // and is refused by the current register; no current Catalog replaces it.
  const strictNewWork = product.admitGraphFunctionCatalog(supplied.catalog.readinessBasis);
  // Identities only: the retained Catalog bytes themselves are never copied.
  await retainCandidate("consumer-callable-membership-recorded-catalog", {
    callSha256: await product.sha256File(callPath),
    suppliedCatalog: { basisDigest: supplied.catalog.basisDigest, viewDigest: supplied.catalogView.viewDigest },
    recordedCatalog: catalog.kind === "graph_function_catalog" ? {
      kind: catalog.kind, basisDigest: catalog.basisDigest, readinessBasisDigest: catalog.readinessBasisDigest,
      lockDigest: catalog.lockDigest, workspaceBindingId: catalog.workspaceBindingId, entryCount: catalog.entries.length,
      exact: product.canonicalJson(catalog) === product.canonicalJson(supplied.catalog),
    } : catalog,
    strictNewWork: strictNewWork.kind === "graph_function_catalog"
      ? { kind: strictNewWork.kind, basisDigest: strictNewWork.basisDigest } : strictNewWork,
  });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  assert.equal(strictNewWork.kind, "catalog_construction_refusal", JSON.stringify(strictNewWork).slice(0, 4000));
  assert.equal(strictNewWork.disposition, "refused", JSON.stringify(strictNewWork).slice(0, 4000));
  assert.notEqual(strictNewWork, catalog);
  const view = product.narrowGraphFunctionCatalog(catalog, supplied.catalogView.allowlist);
  assert.deepEqual(catalog, supplied.catalog);
  assert.deepEqual(view, supplied.catalogView);
  const program = resources.packet.program;
  const consumer = resources.packet.publication.owningProductId;
  const borrowed = catalog.entries.filter(row => program.callableMembership.includes(row.definitionRef) && row.owningProductId !== consumer);
  assert.equal(borrowed.length, 5);
  assert.ok(borrowed.every(row => !row.programMembershipRefs.includes(program.programRef)));
  const closure = product.resolveProgramDeclarationClosure(catalog, view, program.programRef);
  assert.equal(closure.kind, "resolved_program_declaration_closure", JSON.stringify(closure));
  assert.deepEqual(closure.programPublication, resources.packet.publication);
  const rootRef = program.starts[0].graphFunctionRef;
  const root = product.resolveExecutionDeclarationClosure(catalog, view, program.programRef, rootRef);
  assert.equal(root.kind, "resolved_execution_declaration_closure", JSON.stringify(root));
  const refusedView = product.narrowGraphFunctionCatalog(catalog, []);
  const missingRoot = product.resolveExecutionDeclarationClosure(catalog, refusedView, program.programRef, rootRef);
  assert.equal(missingRoot.kind, "execution_declaration_closure_refusal");
  assert.equal(missingRoot.code, "absent");
  assert.match(missingRoot.message, /Program-aware CatalogView/);

  // These are untrusted negative carrier mutations of the retained Catalog,
  // never new admitted catalogs, locks or dependency authority.
  const refused = [];
  for (const variant of ["missing_dependency", "crossed_dependency"]) {
    const candidate = structuredClone(catalog);
    const edges = candidate.readinessBasis.resolvedLock.dependencyEdges;
    const edge = edges.find(row => row.fromProductId === consumer && row.toProductId === borrowed[0].owningProductId);
    assert.ok(edge, "retained compatible dependency must exist");
    if (variant === "missing_dependency") edges.splice(edges.indexOf(edge), 1);
    else edge.toProductId = "product://unrelated.example/foreign@5.0.0";
    const result = product.resolveProgramDeclarationClosure(candidate, view, program.programRef);
    assert.equal(result.kind, "execution_declaration_closure_refusal", JSON.stringify(result));
    assert.equal(result.code, "missing_dependency", JSON.stringify(result));
    assert.match(result.message, /exact compatible publication owner/);
    refused.push({ variant, result });
  }

  // Historical reconstruction above preserves this exact recorded Catalog. New
  // admission uses the current language: its inactive Consensus Program now
  // refuses on the retired key, before the previously refused gate application.
  const admission = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion: "5.0.0",
    memberKey: "admit", readinessBasis: supplied.catalog.readinessBasis });
  await retainCandidate("consumer-callable-membership-new-admission", { admission, refused });
  assert.equal(admission.kind, "catalog_validation_refusal", JSON.stringify(admission));
  assert.equal(admission.validation.code, "invalid_kind", JSON.stringify(admission));
  assert.equal(admission.validation.message,
    '$/programs/0/actionCatalog: Invalid key: Expected never but received "actionCatalog"');
  if (process.env.ABI5_STEEL03_CLOSURE_PROOF_PATH) {
    await writeFile(process.env.ABI5_STEEL03_CLOSURE_PROOF_PATH, JSON.stringify({
      disposition: "retained_closure_discriminator_passed", callSha256: await product.sha256File(callPath),
      catalogExact: true, viewExact: true, borrowedMembers: borrowed.map(row => ({
        definitionRef: row.definitionRef, owningProductId: row.owningProductId, programMembershipRefs: row.programMembershipRefs })),
      closure, selectedRootClosure: root, missingRoot, refused,
      limits: "Pure closure projection over retained installed data; no new event or installed runtime execution.",
    }, null, 2) + "\n", { flag: "wx" });
  }
});

const resourceCallPath = process.env.ABI5_STEEL03_RETAINED_START_CALL_PATH;
test("run resources preserve the accepted retention carrier and reject wrong kind or extra fields", {
  skip: !resourceCallPath && "ABI5_STEEL03_RETAINED_START_CALL_PATH unset; requires the retained exact start resource assertion",
}, async () => {
  const call = JSON.parse(await readFile(resourceCallPath, "utf8")).invocation;
  assert.equal(product.isRunInvocationResourceAssertion(call.resources), true);
  const results = [];
  for (const variant of ["wrong_kind", "extra_binding_field", "extra_edge_field"]) {
    const resources = structuredClone(call.resources);
    const edge = resources.catalog.boundPublications.flatMap(row => row.graphFunctions)
      .flatMap(row => row.template.edges).find(row => row.inputBinding !== undefined);
    assert.ok(edge);
    if (variant === "wrong_kind") edge.inputBinding.kind = "caller_mapping";
    else if (variant === "extra_binding_field") edge.inputBinding.unownedField = true;
    else edge.unownedField = true;
    assert.equal(product.isRunInvocationResourceAssertion(resources), false, variant);
    results.push({ variant, accepted: false });
  }
  if (process.env.ABI5_STEEL03_RESOURCE_PROOF_PATH) {
    await writeFile(process.env.ABI5_STEEL03_RESOURCE_PROOF_PATH, JSON.stringify({
      disposition: "retained_resource_schema_discriminator_passed",
      callSha256: await product.sha256File(resourceCallPath), exactResourcesAccepted: true, results,
      limits: "The owner structural guard supplies no prefix, tuple, owner or invocation admission authority.",
    }, null, 2) + "\n", { flag: "wx" });
  }
});
