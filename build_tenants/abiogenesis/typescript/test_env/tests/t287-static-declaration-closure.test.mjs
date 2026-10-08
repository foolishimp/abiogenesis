import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import test from 'node:test';
import {constructStructuralPublication, STRUCTURAL_IDS, GRAPH_EDGE_IDS,
  SUBSTITUTED_IDS, WORKFLOW_IDS, GATE_IDS, RECURSION_IDS, FAN_OUT_IDS}
  from '../fixtures/language-structural/program.mjs';
import {declarations as registeredSelectionDeclarations, ref as selectionRef,
  packageName as selectionPackageName} from '../fixtures/registered-selection-product/index.mjs';

const tenant = resolve(import.meta.dirname, '../..');
const ownerRoot = process.env.ABI5_STATIC_CLOSURE_OWNER_ROOT ?? join(tenant, 'build/code/src');
const load = file => import(pathToFileURL(join(ownerRoot, file + '.js')).href);
const [owner, catalogOwner, gtl, digests, publicationOwner, catalogOperations, validator] =
  await Promise.all(['product/declaration_closure', 'product/catalog', 'gtl/index',
    'shared/digests', 'product/publication', 'product/catalog_operations',
    'validator/validation'].map(load));
const baselinePath = process.env.ABI5_STATIC_CLOSURE_BASELINE_MODULE;
const baseline = baselinePath ? await import(pathToFileURL(baselinePath).href) : null;
const artifact = {productId: 'product://abi5-tests/static-source-owner@5',
  artifactDigest: 'sha256:' + '1'.repeat(64), productContentDigest: 'sha256:' + '2'.repeat(64),
  productManifestDigest: 'sha256:' + '3'.repeat(64),
  packageName: '@abi5-tests/static-source-owner', packageVersion: '5.0.0'};
const normalizeRef = GRAPH_EDGE_IDS.normalizeGraphFunctionRef;
const renderRef = GRAPH_EDGE_IDS.renderGraphFunctionRef;
const publication = () => structuredClone(constructStructuralPublication(gtl, artifact));

// Portable source-component tests supply installed readiness as lower premises.
// The actual catalog constructors, reference projection, declaration closure,
// raw/whole Validator and owner-coordinate checks are unchanged. These records
// do not authenticate an installation, invoke a Program, or admit runtime truth.
function fixture(publications = [publication()], {installs, edges = [],
  allowlist = [GRAPH_EDGE_IDS.graphFunctionRef]} = {}) {
  const catalog = catalogOwner.buildGraphFunctionCatalog(publications);
  assert.equal(catalog.kind, 'graph_function_catalog');
  const ready = {...catalog, boundPublications: publications, readinessBasis: {
    resolvedLock: {dependencyEdges: edges}, installedProducts: installs ?? [{
      ...artifact, manifestDigest: artifact.productManifestDigest,
      installId: 'product-install://abi5-tests/static-source-owner@5',
    }],
  }};
  const view = catalogOwner.narrowGraphFunctionCatalog(ready, allowlist);
  assert.equal(view.kind, 'graph_function_catalog_view');
  return {catalog: ready, view};
}
const programClosure = (basis, programRef = GRAPH_EDGE_IDS.programRef) =>
  owner.resolveProgramDeclarationClosure(basis.catalog, basis.view, programRef);
const executionClosure = basis => owner.resolveExecutionDeclarationClosure(
  basis.catalog, basis.view, GRAPH_EDGE_IDS.programRef, GRAPH_EDGE_IDS.graphFunctionRef);
function refused(result, code, name) {
  assert.equal(result.kind, 'execution_declaration_closure_refusal');
  assert.equal(result.code, code);
  if (name !== undefined) assert.ok(result.message.includes(name), result.message);
}
const resolved = (result, kind = 'resolved_program_declaration_closure') => {
  assert.equal(result.kind, kind, JSON.stringify(result)); return result;
};

test('compose sources retain exact published owners without callable rows in both closure modes', () => {
  const pub = publication(), before = JSON.stringify(pub), basis = fixture([pub]);
  const program = pub.programs.find(p => p.programRef === GRAPH_EDGE_IDS.programRef);
  assert.deepEqual(program.callableMembership, [GRAPH_EDGE_IDS.graphFunctionRef]);
  assert.equal(basis.catalog.entries.some(row => [normalizeRef, renderRef].includes(row.definitionRef)), false);
  for (const [result, kind] of [[programClosure(basis), 'resolved_program_declaration_closure'],
    [executionClosure(basis), 'resolved_execution_declaration_closure']]) {
    const closure = resolved(result, kind);
    assert.deepEqual(closure.rootGraphFunctionRefs, [GRAPH_EDGE_IDS.graphFunctionRef]);
    for (const ref of [normalizeRef, renderRef]) {
      const matches = closure.graphFunctionOwners.filter(row => row.declarationRef === ref);
      assert.equal(matches.length, 1); assert.equal(matches[0].productId, artifact.productId);
      assert.equal(matches[0].publicationDigest, publicationOwner.modulePublicationSemanticDigest(pub));
    }
    assert.equal(closure.implementationBindingOwners.length, 2);
  }
  assert.equal(JSON.stringify(pub), before);
  const closure = programClosure(basis);
  const raw = catalogOperations.constructCatalogProgramValidationInput(basis.catalog, basis.view, closure, program);
  assert.notEqual(raw.kind, 'raw_admission_refusal');
  const judgment = validator.validateProgram(raw);
  assert.equal(judgment.kind, 'program_validation'); assert.equal(judgment.disposition, 'valid');
  refused(owner.resolveExecutionDeclarationClosure(basis.catalog, basis.view,
    GRAPH_EDGE_IDS.programRef, normalizeRef), 'wrong_owner');
});

test('substitute source provenance resolves without widening its Program', () => {
  const pub = publication(), basis = fixture([pub]);
  const result = resolved(programClosure(basis, SUBSTITUTED_IDS.programRef));
  assert.deepEqual(result.rootGraphFunctionRefs, [SUBSTITUTED_IDS.graphFunctionRef]);
  assert.ok(result.graphFunctionOwners.length > 1);
  const program = pub.programs.find(p => p.programRef === SUBSTITUTED_IDS.programRef);
  const raw = catalogOperations.constructCatalogProgramValidationInput(basis.catalog, basis.view, result, program);
  const judgment = validator.validateProgram(raw);
  assert.equal(judgment.kind, 'program_validation'); assert.equal(judgment.disposition, 'valid');
});

test('unpublished or ambiguous static sources still refuse at their exact declaration owner', () => {
  const missing = publication(); missing.graphFunctions = missing.graphFunctions.filter(g => g.name !== normalizeRef);
  refused(programClosure(fixture([missing])), 'absent', normalizeRef);
  const pub = publication(), duplicate = structuredClone(pub);
  duplicate.moduleRef += '/duplicate'; duplicate.programs = []; duplicate.contributions = [];
  duplicate.graphFunctions = duplicate.graphFunctions.filter(g => g.name === normalizeRef);
  refused(programClosure(fixture([pub, duplicate])), 'ambiguous', normalizeRef);
});

test('static sources remain dependency-bound and require an exact installed owner', () => {
  const pub = publication(), source = structuredClone(pub), foreign = 'product://abi5-tests/foreign-source@5';
  pub.graphFunctions = pub.graphFunctions.filter(g => g.name !== normalizeRef);
  source.moduleRef += '/foreign'; source.owningProductId = foreign;
  source.programs = []; source.contributions = [];
  source.contracts = []; source.implementationBindings = []; source.closureContracts = [];
  source.evaluators = []; source.rules = [];
  source.graphFunctions = source.graphFunctions.filter(g => g.name === normalizeRef);
  refused(programClosure(fixture([pub, source])), 'missing_dependency', normalizeRef);
  const edges = [{fromProductId: artifact.productId, toProductId: foreign, compatibilityDisposition: 'compatible'}];
  refused(programClosure(fixture([pub, source], {edges})), 'wrong_owner');
});

test('static sources conserve required contracts and implementation bindings', () => {
  for (const population of ['contracts', 'implementationBindings', 'closureContracts']) {
    const pub = publication(), source = pub.graphFunctions.find(g => g.name === normalizeRef);
    const ref = population === 'contracts' ? source.inputs[0]
      : population === 'implementationBindings' ? source.template.nodes[0].term.requirement.implementationBindingRef
      : pub.programs.find(p => p.programRef === GRAPH_EDGE_IDS.programRef).closureContractRef;
    assert.ok(ref, population);
    pub[population] = pub[population].filter(row =>
      (row.contractRef ?? row.bindingRef ?? row.closureContractRef) !== ref);
    refused(programClosure(fixture([pub])), 'absent', ref);
  }
});

test('runtime use of a private static source refuses before or after static discovery', () => {
  for (const late of [false, true]) {
    // Explicit untrusted application mutations test closure refusal, not whole
    // Program validity. The late named gate is already an exported fixture GF;
    // it names normalize only after that source has been traversed statically.
    const pub = publication(), root = pub.graphFunctions.find(g => g.name === GRAPH_EDGE_IDS.graphFunctionRef);
    const gate = pub.graphFunctions.find(g => g.name === GATE_IDS.graphFunctionRef);
    const runtime = structuredClone(gate.template.applications[0]);
    const reidentify = value => { const {applicationRef, ...body} = value;
      return {...body, applicationRef: gtl.graphFunctionApplicationRef(body)}; };
    if (late) {
      gate.template.applications[0] = reidentify({...runtime, targetRef: normalizeRef});
      root.template.applications.push(reidentify({...runtime, targetRef: gate.name}));
    } else root.template.applications.push(reidentify({...runtime, targetRef: normalizeRef}));
    const basis = fixture([pub]);
    for (const result of [programClosure(basis), executionClosure(basis)]) {
      refused(result, 'absent', normalizeRef);
      assert.match(result.message, /Catalog\/View owner row/);
    }
  }
});

test('existing named workflow, gate, recursion and fan-out owner rows remain required', () => {
  for (const ids of [WORKFLOW_IDS, GATE_IDS, RECURSION_IDS, FAN_OUT_IDS]) {
    const pub = publication(), basis = fixture([pub]);
    const result = resolved(programClosure(basis, ids.programRef));
    if (baseline) assert.deepEqual(result, baseline.resolveProgramDeclarationClosure(
      basis.catalog, basis.view, ids.programRef));
    const root = pub.graphFunctions.find(g => g.name === ids.graphFunctionRef);
    const refs = root.template.nodes.flatMap(n => gtl.projectCProgramNodeDeclarationReferences(n.term).graphFunctionRefs)
      .concat(root.template.applications.flatMap(a => gtl.projectGraphFunctionApplicationDeclarationReferences(a).graphFunctionRefs));
    const target = refs.find(ref => ref !== root.name);
    assert.ok(target, ids.graphFunctionRef);
    const bad = fixture([pub]); bad.catalog.entries = bad.catalog.entries.filter(row => row.definitionRef !== target);
    refused(programClosure(bad, ids.programRef), 'absent', target);
  }
});

test('registered selection retains strict named-child ownership and whole validation', () => {
  const source = registeredSelectionDeclarations(gtl), productId = source.owningProductId;
  source.contributions = source.contributions.map(row => gtl.catalogContribution({
    ...row, provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest]}));
  const pub = gtl.modulePublication({kind: 'module_publication', moduleVersion: '5.0.0',
    artifactDigest: artifact.artifactDigest, productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest, ...source});
  const installs = [{...artifact, productId, packageName: selectionPackageName,
    manifestDigest: artifact.productManifestDigest, installId: 'product-install://abi5-tests/registered-owner@5'}];
  const basis = fixture([pub], {installs, allowlist: [selectionRef('graph-function', 'root')]});
  const program = pub.programs[0], result = resolved(programClosure(basis, program.programRef));
  if (baseline) assert.deepEqual(result, baseline.resolveProgramDeclarationClosure(
    basis.catalog, basis.view, program.programRef));
  const raw = catalogOperations.constructCatalogProgramValidationInput(basis.catalog, basis.view, result, program);
  const judgment = validator.validateProgram(raw);
  assert.equal(judgment.kind, 'program_validation'); assert.equal(judgment.disposition, 'valid');
  const bad = fixture([pub], {installs, allowlist: [selectionRef('graph-function', 'root')]});
  bad.catalog.entries = bad.catalog.entries.filter(row => row.definitionRef !== selectionRef('graph-function', 'A'));
  refused(programClosure(bad, program.programRef), 'absent', selectionRef('graph-function', 'A'));
});

test('borrowed implementation declarations retain dependency, uniqueness and installed-owner guards', () => {
  const pub = publication(), donor = structuredClone(pub), bindingRef = pub.graphFunctions
    .find(g => g.name === normalizeRef).template.nodes[0].term.requirement.implementationBindingRef;
  const foreign = 'product://abi5-tests/borrowed-binding-owner@5';
  pub.implementationBindings = pub.implementationBindings.filter(binding => binding.bindingRef !== bindingRef);
  donor.moduleRef += '/borrowed-binding'; donor.owningProductId = foreign;
  donor.programs = []; donor.contributions = []; donor.graphFunctions = [];
  donor.contracts = []; donor.closureContracts = []; donor.evaluators = []; donor.rules = [];
  donor.implementationBindings = donor.implementationBindings.filter(binding => binding.bindingRef === bindingRef);
  const own = {...artifact, manifestDigest: artifact.productManifestDigest, installId: 'product-install://abi5-tests/own@5'};
  const borrowed = {...own, productId: foreign, installId: 'product-install://abi5-tests/borrowed@5'};
  const edges = [{fromProductId: artifact.productId, toProductId: foreign, compatibilityDisposition: 'compatible'}];
  const basis = fixture([pub, donor], {installs: [own, borrowed], edges});
  const result = resolved(programClosure(basis));
  assert.equal(result.implementationBindingOwners.find(row => row.declarationRef === bindingRef).productId, foreign);
  refused(programClosure(fixture([pub, donor], {installs: [own, borrowed]})), 'missing_dependency', bindingRef);
  refused(programClosure(fixture([pub, donor], {installs: [own], edges})), 'wrong_owner');
  const duplicate = structuredClone(donor); duplicate.moduleRef += '/duplicate';
  refused(programClosure(fixture([pub, donor, duplicate], {installs: [own, borrowed], edges})), 'ambiguous', bindingRef);
});

test('frozen81 unchanged ready basis resolves where its predecessor refused', async context => {
  const inputPath = process.env.ABI5_STATIC_CLOSURE_CAPTURED_INPUT;
  if (!inputPath) {context.skip('requires the exact frozen81 input; portable source checks above remain active'); return;}
  const bytes = await readFile(inputPath);
  assert.equal(bytes.length, 35510031);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),
    'dff32deb5a29c855fe50cf1b6ca942e08a2b220ad82f813e118fa5f441873d5f');
  const resources = JSON.parse(bytes).invocation.resources;
  const original = resources.declarationCatalog, basis = original.catalog.readinessBasis;
  const rebuilt = owner.reconstructHistoricalDeclarationCatalog(original, {
    workspaceBinding: basis.workspaceBinding, resolvedLock: basis.resolvedLock, installedProducts: basis.installedProducts});
  assert.deepEqual(rebuilt, original);
  const {program, publication: packetPublication} = resources.packet;
  assert.deepEqual(program.callableMembership, [GRAPH_EDGE_IDS.graphFunctionRef]);
  assert.equal(rebuilt.catalog.entries.some(row => [normalizeRef, renderRef].includes(row.definitionRef)), false);
  const closure = resolved(owner.resolveProgramDeclarationClosure(rebuilt.catalog, rebuilt.catalogView, program.programRef));
  assert.deepEqual(closure.programPublication, packetPublication);
  resolved(owner.resolveExecutionDeclarationClosure(rebuilt.catalog, rebuilt.catalogView,
    program.programRef, GRAPH_EDGE_IDS.graphFunctionRef), 'resolved_execution_declaration_closure');
  const raw = catalogOperations.constructCatalogProgramValidationInput(rebuilt.catalog, rebuilt.catalogView, closure, program);
  const judgment = validator.validateProgram(raw);
  assert.equal(judgment.kind, 'program_validation'); assert.equal(judgment.disposition, 'valid');
  assert.ok(baseline, 'the captured discriminator requires the exact predecessor owner');
  refused(baseline.resolveProgramDeclarationClosure(rebuilt.catalog, rebuilt.catalogView, program.programRef), 'absent', normalizeRef);
  refused(baseline.resolveExecutionDeclarationClosure(rebuilt.catalog, rebuilt.catalogView,
    program.programRef, GRAPH_EDGE_IDS.graphFunctionRef), 'absent', normalizeRef);
  assert.equal(resources.declarationCatalog.catalog.basisDigest, original.catalog.basisDigest);
});
