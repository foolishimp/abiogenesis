// Source-blind packed-component proof of the existing preparation owners.
// Fixture material and external construction records are supplied inputs;
// no ABG occurrence, independent judgment or qualification verdict is asserted.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  acquireQualificationResources, prepareQualificationAssessment,
  constructQualificationIdentity as identity, qualificationHash as hash,
  QUALIFICATION_ROLE_POLICY as policy,
} from "@abiogenesis/typescript-tenant/qualification/m05";

assert(process.env.ABI5_PUBLIC_PREPARATION_PACKAGE_ROOT, "an extracted package is required");
const root = resolve(process.env.ABI5_PUBLIC_PREPARATION_PACKAGE_ROOT);
assert.equal(fileURLToPath(import.meta.resolve("@abiogenesis/typescript-tenant/qualification/m05")),
  join(root, "build/code/src/qualification/m05.js"));
const digest = bytes => "sha256:" + createHash("sha256").update(bytes).digest("hex");
const coordinate = (ref, valueDigest) => ({ ref, digest: valueDigest });
const source = ({ ref, path, digest: valueDigest, byteCount }) => ({ ref, path, digest: valueDigest, byteCount });
const material = (ref, path, text) => {
  const bytes = Buffer.from(text);
  return { ref, path, digest: digest(bytes), byteCount: bytes.length, contentBase64: bytes.toString("base64") };
};
const catalogBytes = readFileSync(join(root, "contracts/qualification/rule-catalog.json"));
const catalog = JSON.parse(catalogBytes);
const roleSources = policy.authoritySourceRefs.map(ref => {
  const row = catalog.sources.find(value => value.ref === ref);
  assert(row, ref);
  return row;
});
const authorityMaterial = roleSources.map(row => ({ ...row,
  contentBase64: readFileSync(join(root, row.path)).toString("base64") }));
const subjectMaterial = [
  material("fixture://preparation/member-a", "fixture/member-a.mjs", "export const a = 1;\n"),
  material("fixture://preparation/member-b", "fixture/member-b.mjs", "export const b = 2;\n"),
];
const inventory = identity({ kind: "qualification_subject_inventory",
  selectedRoots: ["fixture://preparation/root"], coverage: "incomplete",
  members: subjectMaterial.map(value => ({ ...source(value), surfaceRoles: ["code"], classificationEvidenceRefs: [] })),
}, "inventoryRef", "inventoryDigest", "qualification-inventory://abiogenesis/");
const inventoryCoordinate = coordinate(inventory.inventoryRef, inventory.inventoryDigest);
const subjectBasis = coordinate("fixture://preparation/subject", hash(inventory.members));
const law = identity({ kind: "qualification_law_basis", ...catalog.method,
  catalog: { ref: catalog.catalogRef, digest: digest(catalogBytes), ownerRef: catalog.ownerRef,
    version: catalog.catalogVersion, assetPath: "contracts/qualification/rule-catalog.json" },
  sources: catalog.sources,
}, "lawBasisRef", "lawBasisDigest", "qualification-law://abiogenesis/");
const lawBasis = coordinate(law.lawBasisRef, law.lawBasisDigest);
const catalogCoordinate = coordinate(catalog.catalogRef, digest(catalogBytes));

function planFor(task) {
  return identity({ kind: "qualification_assessment_plan", subjectBasis, lawBasis,
    slots: [{ slotRef: task.slotRef, task: coordinate(task.taskRef, task.taskDigest),
      taskOrdinal: task.taskOrdinal, graphFunctionRef: "fixture://preparation/assessment",
      programLocusRef: task.slotRef, role: task.role, coverage: task.coverage }],
    coverage: task.coverage, sharedCoverage: "disjoint", ownerAuthorityRef: policy.authorityRef,
    ownerActorRef: "fixture://preparation/owner",
  }, "planRef", "planDigest", "qualification-plan://abiogenesis/");
}
const inputFor = task => ({ kind: "qualification_assessment_input", schemaVersion: "5.0.0", task, plan: planFor(task) });

function embedded(index) {
  const selected = subjectMaterial[index], supplied = [...authorityMaterial, selected];
  const record = material("fixture://preparation/construction-" + index, "fixture/construction-" + index + ".txt",
    "This test constructed " + selected.path + " as supplied fixture data. No native construction is claimed.\n");
  const role = { roleRef: policy.roleRefs[index === 0 ? 3 : 1], authorityRef: policy.authorityRef,
    sourceBindings: roleSources, actorRef: policy.actorRefs[index], workerBindingRef: policy.workerBindingRef,
    rendererRef: policy.rendererRef, materializationPlanRef: policy.materializationPlanRef, independence: "author_distinct" };
  const members = supplied.map(value => ({ memberRef: value.ref, path: value.path, digest: value.digest, byteCount: value.byteCount }));
  const provenance = { kind: "external_construction", subjectInventory: inventoryCoordinate,
    recordSet: coordinate("fixture://preparation/records-" + index, hash([record])), records: [record],
    chains: [{ activationRef: record.ref, preimageRef: record.ref, deltaRef: record.ref, closureRef: record.ref,
      authorRef: "fixture://preparation/test-author", actorIdentityRef: "fixture://preparation/test-author",
      authorityRef: policy.authorityRef, scopeRefs: [selected.ref], postimageMembers: [source(selected)],
      changes: [{ memberRef: selected.ref, patchPath: selected.path, preimageMemberRef: null, postimageMemberRef: selected.ref }],
      attributionSources: [{ sourceRef: record.ref, startByte: 0, endByte: record.byteCount, spanDigest: record.digest }],
    }], acknowledgmentSelectionRef: null };
  const contextRef = "fixture://preparation/context-" + index;
  return inputFor(identity({ kind: "qualification_assessment_task", schemaVersion: "5.0.0",
    slotRef: "fixture://preparation/slot-" + index, taskOrdinal: index, subjectBasis, lawBasis,
    catalog: catalogCoordinate, inventory: inventoryCoordinate, role,
    context: { contextRef, sourceLocator: "fixture://preparation/material-" + index, inventoryDigest: hash(members), members },
    declarations: [], assetSurface: { kind: "qualification_assessment", requiredContexts: [contextRef],
      standardsRefs: policy.authoritySourceRefs, outputContractRefs: ["contract://abiogenesis/qualification/assessment-raw@5"],
      constructorRef: "fixture://preparation/task-construction", rendererRef: policy.rendererRef,
      proofObligationRefs: ["fixture://preparation/supplied-material"],
      authoritySlots: [{ authorityKindRef: policy.authorityRef, disposition: "normal", fallbackPreconditionRefs: [] }] },
    material: supplied, subjectMembers: [source(selected)],
    coverage: [{ criterionRef: "fixture://preparation/criterion-" + index,
      ruleRef: index === 0 ? catalog.rules[0].ruleRef : inventory.inventoryRef,
      surfaceRef: selected.ref, evidenceRole: index === 0 ? "semantic_assessment" : "inventory_classification" }],
    provenance, priorEvidenceRefs: [], residuals: ["Fixture inventory is incomplete; whole-candidate qualification remains open."],
  }, "taskRef", "taskDigest", "qualification-task://abiogenesis/"));
}

const inputs = [embedded(0), embedded(1)];
const entries = [{ entryKind: "inventory", coordinate: inventoryCoordinate, value: inventory },
  { entryKind: "law", coordinate: lawBasis, value: law }];
for (const { task } of inputs) {
  for (const value of [...task.material, ...task.provenance.records]) {
    if (!entries.some(entry => entry.entryKind === "material" && entry.coordinate.ref === value.ref))
      entries.push({ entryKind: "material", coordinate: coordinate(value.ref, value.digest), value });
  }
  const value = { ...task.provenance, records: task.provenance.records.map(record =>
    ({ entryKind: "material", entry: coordinate(record.ref, record.digest) })) };
  entries.push({ entryKind: "provenance", coordinate: coordinate("qualification-provenance://abiogenesis/" + hash(value).slice(7), hash(value)), value });
}
const manifest = identity({ kind: "qualification_resource_manifest", schemaVersion: "1", subjectBasis,
  lawBasis, catalog: catalogCoordinate, inventory: inventoryCoordinate, entries, declarationSelections: [],
}, "resourceRef", "resourceDigest", "qualification-resource://abiogenesis/");
const assertionFor = value => ({ kind: "qualification_resource_assertion", schemaVersion: "1", manifests: [value], declarationProofs: [] });
const assertion = assertionFor(manifest);

function reference(input, resource = manifest) {
  const resourceCoordinate = coordinate(resource.resourceRef, resource.resourceDigest);
  const selection = (entryKind, entry) => ({ kind: "qualification_resource_selection", schemaVersion: "1", resource: resourceCoordinate, entryKind, entry });
  const provenance = resource.entries.find(entry => entry.entryKind === "provenance" &&
    entry.value.chains[0].activationRef === input.task.provenance.chains[0].activationRef);
  return inputFor(identity({ ...input.task, representation: "resource_refs_v1", resource: resourceCoordinate,
    material: input.task.material.map(value => selection("material", coordinate(value.ref, value.digest))),
    provenance: selection("provenance", provenance.coordinate), declarations: resource.declarationSelections,
  }, "taskRef", "taskDigest", "qualification-task://abiogenesis/"));
}

test("two responsibility bindings use the same published preparation and immutable resource owners", t => {
  const resources = acquireQualificationResources(assertion);
  assert.notEqual(resources.assertion, assertion, "acquisition detaches supplied mutable input once");
  const prepared = inputs.map(input => {
    const direct = prepareQualificationAssessment(input), selected = reference(input);
    const first = prepareQualificationAssessment(selected, resources);
    const again = prepareQualificationAssessment(structuredClone(selected), resources);
    assert.equal(first.view.task, again.view.task, "resolved immutable dependencies are reused within this basis");
    assert.deepEqual(first.view.task.material, direct.view.task.material);
    assert.deepEqual(first.view.task.coverage, direct.view.task.coverage);
    assert.deepEqual(first.view.task.role, direct.view.task.role);
    assert.equal(first.request.prompt, direct.request.prompt);
    assert.equal(first.request.inputDigest, hash(selected));
    assert.notEqual(first.request.inputDigest, direct.request.inputDigest, "different canonical representations keep their identities");
    assert(Object.isFrozen(first.request));
    assert(Object.isFrozen(first.view.task.material));
    assert.equal(first.matches(selected, {}), false, "preparation cannot manufacture a completed judgment");
    assert(first.request.prompt.includes(input.task.material.at(-1).contentBase64 === "" ? "" :
      Buffer.from(input.task.material.at(-1).contentBase64, "base64").toString("utf8").trim()));
    return first;
  });
  assert.notEqual(prepared[0].view.task.role.roleRef, prepared[1].view.task.role.roleRef);
  assert.notEqual(prepared[0].view.task.coverage[0].evidenceRole, prepared[1].view.task.coverage[0].evidenceRole);
  assert.notEqual(prepared[0].request.prompt, prepared[1].request.prompt);
  assert.equal(resources.assertion.manifests[0].inventory.digest, inventory.inventoryDigest);
  t.diagnostic(JSON.stringify({ responsibilityBindings: 2, embeddedPreparations: 2, referencePreparations: 4,
    resourceAcquisitions: 1, inventoryCoverage: inventory.coverage, assertionBytes: Buffer.byteLength(JSON.stringify(assertion)),
    promptBytes: prepared.map(value => Buffer.byteLength(value.request.prompt)), runtimeCalls: 0, qualificationClaims: 0 }));
});

test("existing owners refuse missing resources, crossed selectors and changed task identity", () => {
  const resources = acquireQualificationResources(assertion), valid = reference(inputs[0]);
  assert.throws(() => prepareQualificationAssessment(valid), /qualification_resource_dependency_missing/);
  const invalid = structuredClone(valid);
  invalid.task.residuals.push("Changed without new task identity.");
  assert.throws(() => prepareQualificationAssessment(invalid, resources), /invalid qualification assessment input/);
  const crossedManifest = { ...manifest, resourceDigest: hash("crossed resource") };
  assert.throws(() => prepareQualificationAssessment(reference(inputs[0], crossedManifest), resources), /qualification_resource_missing_or_crossed/);
  const crossedTask = structuredClone(valid.task);
  crossedTask.material.at(-1).entry.digest = hash("crossed entry");
  const crossed = inputFor(identity(crossedTask, "taskRef", "taskDigest", "qualification-task://abiogenesis/"));
  assert.throws(() => prepareQualificationAssessment(crossed, resources), /qualification_resource_entry_missing_or_crossed/);
  const missingManifest = identity({ ...manifest, entries: manifest.entries.filter(entry =>
    entry.coordinate.ref !== inputs[0].task.material.at(-1).ref) }, "resourceRef", "resourceDigest", "qualification-resource://abiogenesis/");
  const missingResources = acquireQualificationResources(assertionFor(missingManifest));
  assert.throws(() => prepareQualificationAssessment(reference(inputs[0], missingManifest), missingResources), /qualification_resource_entry_missing_or_crossed/);
  const altered = structuredClone(assertion);
  altered.manifests[0].entries.find(entry => entry.entryKind === "material").value.contentBase64 = Buffer.from("different").toString("base64");
  altered.manifests[0] = identity(altered.manifests[0], "resourceRef", "resourceDigest", "qualification-resource://abiogenesis/");
  assert.throws(() => acquireQualificationResources(altered), /qualification_resource_material_bytes/);
  assert.equal(prepareQualificationAssessment(valid, resources).request.inputDigest, hash(valid), "original positive is restored");
});

test("source-blind strict caller imports canonical input, resource and request types from m05", t => {
  const require = createRequire(import.meta.url), ts = require(join(root, "build/toolchain/typescript.cjs"));
  const file = join(dirname(fileURLToPath(import.meta.url)), "public-preparation-consumer.mts");
  const consumer = `import {acquireQualificationResources,prepareQualificationAssessment,
    type QualificationResourceAssertion,type QualificationAssessmentInput,type QualificationEmbeddedTask,
    type QualificationReferenceTask,type QualificationResources,type ResolvedQualificationAssessment,
    type PreparedQualificationAssessment,type ProbabilisticWorkerRequest}
    from '@abiogenesis/typescript-tenant/qualification/m05';
declare const assertion:QualificationResourceAssertion, embedded:QualificationEmbeddedTask, reference:QualificationReferenceTask;
declare const input:QualificationAssessmentInput;
const resources:QualificationResources=acquireQualificationResources(assertion);
const preparation:PreparedQualificationAssessment=prepareQualificationAssessment(input,resources);
const view:ResolvedQualificationAssessment=preparation.view;
const request:Readonly<ProbabilisticWorkerRequest>=preparation.request;
const resolveReference=(supplied:QualificationAssessmentInput):PreparedQualificationAssessment=>prepareQualificationAssessment(supplied,resources);
const resolveEmbedded=(supplied:QualificationAssessmentInput):PreparedQualificationAssessment=>prepareQualificationAssessment(supplied);
const closedKind:QualificationAssessmentInput['kind']='qualification_assessment_input';
// @ts-expect-error the published task domain remains closed
const invented:QualificationEmbeddedTask['kind']='new_preparation_task';
// @ts-expect-error an arbitrary object cannot replace canonical acquired resources
prepareQualificationAssessment(input,{});
// @ts-expect-error reference material selections cannot substitute for embedded bodies
const crossed:QualificationEmbeddedTask=reference;
void [embedded,view,request,resolveReference,resolveEmbedded,closedKind,invented,crossed];
`;
  writeFileSync(file, consumer, { flag: "wx" });
  const options = { module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022, strict: true, exactOptionalPropertyTypes: true, noEmit: true, skipLibCheck: false,
    typeRoots: [join(root, "build/toolchain/node_modules/@types")], types: ["node"] };
  const program = ts.createProgram([file], options), diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics,
    { getCanonicalFileName: value => value, getCurrentDirectory: () => dirname(file), getNewLine: () => "\n" }));
  t.diagnostic(JSON.stringify({ nativeConsumer: file, strict: true, diagnostics: 0, closedTypeNegatives: 3 }));
});

test("generated m05 group locates both canonical owners and hashes its actual native inventory", () => {
  const product = JSON.parse(readFileSync(join(root, "product-toolchain-manifest.json")));
  const rows = product.publicContractCatalog.rows.filter(row => row.contractId === "abg.contract.qualification.m05");
  assert.equal(rows.length, 1);
  const row = rows[0], locator = row.nativeTypedLocator;
  assert.equal(locator.packageExportPath, "./qualification/m05");
  assert.equal(row.contractDigest, hash(locator.declarationInventory));
  for (const path of ["build/code/src/qualification/m05.d.ts", "build/code/src/validator/qualification.d.ts",
    "build/code/src/validator/qualification_resources.d.ts", "build/code/src/implementation/contracts.d.ts"]) {
    const member = locator.declarationInventory.find(value => value.declarationPath === path);
    assert(member, path);
    assert.equal(member.declarationDigest, digest(readFileSync(join(root, path))));
  }
  const facade = readFileSync(join(root, locator.declarationPath), "utf8");
  assert(facade.includes('export { acquireQualificationResources } from "../validator/qualification_resources.js";'));
  assert(facade.includes('export { prepareQualificationAssessment } from "../validator/qualification.js";'));
});
