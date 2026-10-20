import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Mechanical declaration smoke only. No Run, implementation dispatch, catalog
// admission, artifact verification, model, command helper or filesystem writes.
// Native raw-admission/whole-Program setup follows w2-steel-single-start.test.mjs.
// Supply genuine constructed source/lifecycle publications, not selector stubs.
export async function runStaticD2({ packageRoot, sourcePublication, lifecyclePublication }) {
  const load = (path) => import(pathToFileURL(join(resolve(packageRoot), 'build/code/src', path)).href);
  const [revision, identity, stage, oldIdentity, algebra, validation, admission] = await Promise.all([
    load('gtl/semantic_revision_publication.js'), load('gtl/semantic_revision_identity.js'),
    load('gtl/semantic_stage_publication.js'), load('gtl/semantic_stage_identity.js'),
    load('gtl/c_algebra.js'), load('validator/validation.js'), load('validator/raw_admission.js'),
  ]);
  const R = identity.SEMANTIC_REVISION_IDS, D = oldIdentity.SEMANTIC_STAGE_IDS;
  assert.ok(lifecyclePublication?.semanticLifecycle?.declarationRef, 'a real lifecycle owner is required');
  assert.ok(sourcePublication?.requirementHandoffs?.some(row =>
    row.declarationRef === lifecyclePublication.semanticLifecycle.sourceDeclarationRef), 'exact source owner is required');
  const packageJson = JSON.parse(await readFile(join(resolve(packageRoot), 'package.json'), 'utf8'));
  // As in the existing static smoke, these coordinates claim no installed owner.
  const artifact = { productId: 'product://unit/d2-static-native@5', packageName: packageJson.name,
    packageVersion: packageJson.version, artifactDigest: `sha256:${'1'.repeat(64)}`,
    productContentDigest: `sha256:${'2'.repeat(64)}`, productManifestDigest: `sha256:${'3'.repeat(64)}` };
  const old = stage.constructSemanticStageModulePublication(artifact);
  const next = revision.constructSemanticRevisionModulePublication(artifact);
  const raw = (value, kind) => {
    const result = admission.rawAdmitValue(structuredClone(value), kind, `contract://unit/raw/${kind}`);
    assert.equal(result.kind, 'raw_admitted_value', JSON.stringify(result));
    return result;
  };
  const unique = (rows, key) => [...new Map(rows.map(row => [row[key], row])).values()];
  const scope = 'unit/d2-static-selection';
  const rootRef = `graph-function://${scope}/root@5`, childRef = `graph-function://${scope}/child@5`;
  const rootClosureRef = `contract://${scope}/run-closure@5`, childClosureRef = `contract://${scope}/call-closure@5`;
  function subject() {
    const child = revision.constructSemanticRevisionSelectionGraphFunction({ graphFunctionRef: childRef,
      closureContractRef: rootClosureRef, childClosureContractRef: childClosureRef,
      lifecycleRef: lifecyclePublication.semanticLifecycle.declarationRef });
    const nodeRef = `node://${scope}/call@5`;
    const root = { ...structuredClone(child), name: rootRef, tags: ['d2-static-native-call'],
      declarations: { ...child.declarations },
      template: { kind: 'inline_graph', graphRef: `graph://${scope}/root@5`, startNodeRef: nodeRef,
        terminalNodeRefs: [nodeRef], edges: [], applications: [], nodes: [{ nodeRef, nodeKind: 'c_locus',
          term: algebra.workflow.C(algebra.cGraphFunctionRef({ graphFunctionRef: childRef,
            input: algebra.cCarrier(R.selectionInputContractRef), output: algebra.cCarrier(R.selectionContractRef) })) }] } };
    // The wrapper has no F_P leaf and must not pretend to be another selector.
    delete root.declarations['abg.raw_result_contract'];
    delete root.declarations['abg.semantic_revision_selection'];
    const closures = ['run', 'graph_call'].map(closureScope => stage.constructSemanticClosureContract({
      closureContractRef: closureScope === 'run' ? rootClosureRef : childClosureRef,
      predicateRef: R.selectionPredicateRef, resultContractRef: R.selectionContractRef, closureScope }));
    const program = { kind: 'gtl_program', programRef: `program://${scope}@5`, version: '5.0.0',
      moduleRef: `module://${scope}@5`, starts: [{ startRef: `start://${scope}@5`, graphFunctionRef: rootRef }],
      callableMembership: [rootRef, childRef], closureContractRef: rootClosureRef,
      policies: { 'abg.root_mode': 'direct', 'abg.compute_regime': 'F_P',
        'abg.semantic_lifecycle': lifecyclePublication.semanticLifecycle.declarationRef } };
    const contracts = unique([...old.contracts, ...next.contracts, ...sourcePublication.contracts,
      ...lifecyclePublication.contracts, ...closures.map(c => ({ ...old.contracts.find(r => r.contractKind === 'closure'),
        contractRef: c.closureContractRef }))], 'contractRef');
    return structuredClone({ root, child, program, closures, contracts,
      publication: { ...next, moduleRef: program.moduleRef, programs: [program],
        graphFunctions: [root, child], contracts, closureContracts: closures, contributions: [] } });
  }
  function validate(s) {
    const publication = raw({ ...s.publication, graphFunctions: [s.root, s.child],
      closureContracts: s.closures }, 'module_publication');
    return validation.validateProgram({ declarationBasisDigest: publication.subjectDigest, programPublication: publication,
      program: raw(s.program, 'gtl_program'), graphFunctions: [s.root, s.child].map(g => raw(g, 'graph_function')),
      contracts: s.contracts.map(c => raw(c, 'contract_declaration')), evaluators: [], rules: [],
      implementationBindings: next.implementationBindings.map(b => raw(b, 'implementation_binding')),
      closureContracts: s.closures.map(c => raw(c, 'closure_contract')),
      semanticSourcePublication: raw(sourcePublication, 'module_publication'),
      semanticLifecyclePublication: raw(lifecyclePublication, 'module_publication') });
  }
  const results = [];
  function refusal(name, s, words) {
    const result = validate(s);
    assert.equal(result.kind, 'static_validation_refusal', `${name}: ${JSON.stringify(result)}`);
    assert.ok(result.diagnostics.some(d => d.code === 'missing_contract' && d.message.includes(words)),
      `${name}: missing native discriminator: ${JSON.stringify(result)}`);
    results.push({ name, kind: result.kind, diagnostics: result.diagnostics });
  }
  const positive = subject(), valid = validate(positive);
  assert.equal(valid.kind, 'program_validation', JSON.stringify(valid));
  assert.notEqual(positive.child.declarations['abg.raw_result_contract'], positive.child.outputs[0]);
  results.push({ name: 'ordinary D2 selection with a native nested call and distinct closures', kind: valid.kind });
  const rawEqualsOutput = subject();
  rawEqualsOutput.child.declarations['abg.raw_result_contract'] = R.selectionContractRef;
  refusal('raw result aliases constructive output', rawEqualsOutput, 'distinct from the GraphFunction output');
  const wrongScope = subject();
  wrongScope.child.declarations['abg.child_closure_contract'] = rootClosureRef;
  refusal('child uses a valid run-scope closure', wrongScope, 'GraphCall-scope contract over its output');
  const wrongOutput = subject();
  wrongOutput.closures.find(c => c.closureContractRef === childClosureRef).resultContractRef = R.selectionRawContractRef;
  refusal('child closure names raw result instead of constructive output', wrongOutput, 'GraphCall-scope contract over its output');
  const oldRaw = raw(old, 'module_publication');
  const oldResult = validation.validateProgram({ declarationBasisDigest: oldRaw.subjectDigest, programPublication: oldRaw,
    program: raw(old.programs[0], 'gtl_program'), graphFunctions: old.graphFunctions.map(g => raw(g, 'graph_function')),
    contracts: old.contracts.map(c => raw(c, 'contract_declaration')), evaluators: [], rules: [],
    implementationBindings: old.implementationBindings.map(b => raw(b, 'implementation_binding')),
    closureContracts: old.closureContracts.map(c => raw(c, 'closure_contract')) });
  assert.equal(D.graphFunctionRef, 'graph-function://abiogenesis/semantic-stage@5');
  assert.equal(D.workerContractRef, 'contract://abiogenesis/semantic-stage/worker-result@5');
  assert.equal(oldResult.kind, 'program_validation', JSON.stringify(oldResult));
  results.push({ name: 'old D1 native constructor and identities preserved', kind: oldResult.kind });
  return { kind: 'd2_static_contract_smoke', packageRoot: resolve(packageRoot), results,
    limit: 'Pure native Program validation only; no installed, runtime, semantic or mixed-source qualification.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [packageRoot, sourcePath, lifecyclePath] = process.argv.slice(2);
  assert.ok(packageRoot && sourcePath && lifecyclePath,
    'usage: node static-d2.mjs PACKAGE_ROOT SOURCE_PUBLICATION.json LIFECYCLE_PUBLICATION.json');
  const [sourcePublication, lifecyclePublication] = await Promise.all([sourcePath, lifecyclePath]
    .map(async path => JSON.parse(await readFile(resolve(path), 'utf8'))));
  console.log(JSON.stringify(await runStaticD2({ packageRoot, sourcePublication, lifecyclePublication }), null, 2));
}
