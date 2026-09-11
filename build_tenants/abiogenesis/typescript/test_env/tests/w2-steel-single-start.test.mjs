import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { selectWorksiteConstruction, prepareWorksiteCommands } from '../../build/code/src/implementation/worksite_command_execution.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as product from '../../build/code/src/product/index.js';
import * as validator from '../../build/code/src/validator/index.js';

// Static declarations only. These coordinates do not assert a verified artifact,
// admitted catalog, installed owner or executable runtime authority.
const artifact = {
  productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME,
  packageVersion: product.ABI5_PACKAGE_VERSION,
  artifactDigest: `sha256:${'1'.repeat(64)}`, productContentDigest: `sha256:${'2'.repeat(64)}`,
  productManifestDigest: `sha256:${'3'.repeat(64)}`,
};
const c1 = product.WORKSITE_CONSTRUCTION_IDS;
const c2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
const p = product.WORKSITE_PREPARATION_IDS;
const c1Publication = gtl.constructWorksiteConstructionModulePublication(artifact);
const c2Publication = gtl.constructWorksiteCommandExecutionModulePublication(artifact);
const raw = (value, kind) => {
  const admitted = validator.rawAdmitValue(JSON.parse(JSON.stringify(value)), kind, `contract://unit/raw/${kind}`);
  assert.equal(admitted.kind, 'raw_admitted_value');
  return admitted;
};
const pure = (ref, bindingRef, predicate, role) => {
  const binding = c2Publication.implementationBindings.find((row) => row.bindingRef === bindingRef);
  return { nodeRef: ref, nodeKind: 'c_locus', term: gtl.C.of({
    input: gtl.cCarrier(binding.inputContractRef), output: gtl.cCarrier(binding.outputContractRef),
    programLocusRef: ref, stageRole: role, fibre: 'F_D', armId: `${ref}/arm`, compositionRef: null,
    vectorIndex: 0, judgmentPredicateRef: predicate, resultBearing: false,
    requirement: { kind: 'executable_leaf_requirement', implementationBindingRef: bindingRef,
      inputContractRef: binding.inputContractRef, outputContractRef: binding.outputContractRef,
      failureContractRef: binding.failureContractRef, refusalContractRef: binding.refusalContractRef,
      evidenceContractRef: c2.evidenceContractRef, judgmentContractRef: c2.judgmentContractRef },
  }) };
};
function subject() {
  const gf = {
    kind: 'graph_function', name: 'graph-function://unit/retained-worksite@5', version: '5.0.0',
    environment: { requires: [p.inputContractRef],
      provides: [c1.taskContractRef, c1.resultContractRef, p.boundInputContractRef, c2.taskContractRef, c2.observationContractRef],
      carries: [p.inputContractRef, c1.taskContractRef, c1.resultContractRef, p.boundInputContractRef, c2.taskContractRef, c2.observationContractRef] },
    inputs: [p.inputContractRef], outputs: [c2.observationContractRef],
    template: { kind: 'inline_graph', graphRef: 'graph://unit/retained-worksite@5',
      startNodeRef: 'node://unit/select', terminalNodeRefs: ['node://unit/execute'],
      nodes: [pure('node://unit/select', p.selectBindingRef, p.selectPredicateRef, 'select'),
        { nodeRef: 'node://unit/construct', nodeKind: 'c_locus', term: gtl.workflow.C(gtl.cGraphFunctionRef({
          graphFunctionRef: c1.graphFunctionRef, input: gtl.cCarrier(c1.taskContractRef), output: gtl.cCarrier(c1.resultContractRef) })) },
        pure('node://unit/prepare', p.prepareBindingRef, p.preparePredicateRef, 'prepare'),
        { nodeRef: 'node://unit/execute', nodeKind: 'c_locus', term: gtl.workflow.C(gtl.cGraphFunctionRef({
          graphFunctionRef: c2.graphFunctionRef, input: gtl.cCarrier(c2.taskContractRef), output: gtl.cCarrier(c2.observationContractRef) })) }],
      edges: [gtl.graphEdge({ fromNodeRef: 'node://unit/select', toNodeRef: 'node://unit/construct' }),
        gtl.graphEdge({ fromNodeRef: 'node://unit/construct', toNodeRef: 'node://unit/prepare', inputBinding: product.worksiteRetentionBinding() }),
        gtl.graphEdge({ fromNodeRef: 'node://unit/prepare', toNodeRef: 'node://unit/execute' })], applications: [] },
    effects: ['effect://abiogenesis/worksite/file.replace/v1'],
    declarations: { 'abg.compute_regime': 'mixed', 'abg.closure_contract': c2.closureContractRef,
      'abg.evidence_contract': c2.evidenceContractRef, 'abg.judgment_contract': c2.judgmentContractRef,
      'abg.judgment_predicate': p.rootPredicateRef, 'abg.transition_contract': c2.transitionContractRef }, tags: [],
  };
  const program = { kind: 'gtl_program', programRef: 'program://unit/retained-worksite@5', version: '5.0.0', moduleRef: 'module://unit/retained-worksite@5',
    starts: [{ startRef: 'start://unit/retained-worksite@5', graphFunctionRef: gf.name }],
    callableMembership: [gf.name, c1.graphFunctionRef, c1.vectorApplicationGraphFunctionRef, c1.fileReplaceGraphFunctionRef, c1.reducerGraphFunctionRef, c2.graphFunctionRef],
    closureContractRef: c2.closureContractRef, policies: { 'abg.root_mode': 'direct', 'abg.compute_regime': 'mixed' } };
  const publication = { ...c2Publication, moduleRef: program.moduleRef, owningProductId: 'product://unit/consumer@5',
    programs: [program], graphFunctions: [gf], contracts: [], implementationBindings: [], contributions: [] };
  return { gf: structuredClone(gf), program, publication,
    graphs: [...c1Publication.graphFunctions, ...c2Publication.graphFunctions],
    contracts: [...c1Publication.contracts, ...c2Publication.contracts],
    bindings: [...c1Publication.implementationBindings, ...c2Publication.implementationBindings],
    closures: [...c1Publication.closureContracts, ...c2Publication.closureContracts] };
}
function validate(s) {
  const publication = raw({ ...s.publication, graphFunctions: [s.gf] }, 'module_publication');
  return validator.validateProgram({ declarationBasisDigest: publication.subjectDigest, programPublication: publication,
    program: raw(s.program, 'gtl_program'), graphFunctions: [s.gf, ...s.graphs].map((row) => raw(row, 'graph_function')),
    contracts: s.contracts.map((row) => raw(row, 'contract_declaration')), evaluators: [], rules: [],
    implementationBindings: s.bindings.map((row) => raw(row, 'implementation_binding')),
    closureContracts: s.closures.map((row) => raw(row, 'closure_contract')) });
}
const diagnostic = (result, code, words) => {
  assert.equal(result.kind, 'static_validation_refusal', JSON.stringify(result));
  assert.ok(result.diagnostics.some((row) => row.code === code && row.message.includes(words)), JSON.stringify(result));
};

test('serialized exact E/S/T and a nonterminal unchanged C1 workflow validate', () => {
  const s = subject();
  const result = validate(s);
  assert.equal(result.kind, 'program_validation', JSON.stringify(result));
  assert.equal(s.gf.template.nodes[1].term.outputCarrierRef, c1.resultContractRef);
  assert.equal(s.gf.template.nodes[1].term.kind, 'c_workflow');
});
test('raw crossed target with the same valueKind refuses before dispatch', () => {
  const s = subject(); const crossed = 'contract://unit/crossed-bound-input@5';
  s.contracts.push({ ...s.contracts.find((row) => row.contractRef === p.boundInputContractRef), contractRef: crossed });
  const edge = s.gf.template.edges[1];
  edge.inputBinding.targetContractRef = crossed;
  edge.edgeRef = gtl.graphEdgeRef(edge);
  s.gf.template.nodes[2].term.inputCarrierRef = crossed;
  s.gf.template.nodes[2].term.requirement.inputContractRef = crossed;
  s.bindings = s.bindings.map((row) => row.bindingRef === p.prepareBindingRef ? { ...row, inputContractRef: crossed } : row);
  s.gf.environment.carries = s.gf.environment.carries.map((ref) => ref === p.boundInputContractRef ? crossed : ref);
  s.gf.environment.provides = s.gf.environment.provides.map((ref) => ref === p.boundInputContractRef ? crossed : ref);
  diagnostic(validate(s), 'carrier_mismatch', 'exact owner-derived E/S/T');
});
test('native binding refuses an unknown tuple and serialized mutation cannot keep edge identity', () => {
  assert.throws(() => gtl.graphEdge({ fromNodeRef: 'n1', toNodeRef: 'n2', inputBinding: { ...product.worksiteRetentionBinding(), targetContractRef: 'contract://unknown' } }), /E\/S\/T schema relation/);
  const s = subject(); s.gf.template.edges[1].inputBinding.entryContractRef = 'contract://unknown';
  diagnostic(validate(s), 'identity_mismatch', 'edge');
});
test('missing preserved E and unbound unequal ordinary wires refuse', () => {
  const s = subject(); s.gf.environment.carries = s.gf.environment.carries.filter((ref) => ref !== p.inputContractRef);
  diagnostic(validate(s), 'carrier_mismatch', 'preserved entry/source');
  const t = subject(); t.gf.template.edges[1] = gtl.graphEdge({ fromNodeRef: 'node://unit/construct', toNodeRef: 'node://unit/prepare' });
  diagnostic(validate(t), 'carrier_mismatch', 'ordinary graph edge');
});
test('terminal cardinality remains one while explicit downstream consumption preserves child result', () => {
  const s = subject(); s.gf.template.terminalNodeRefs = ['node://unit/prepare'];
  diagnostic(validate(s), 'invalid_result_cardinality', 'exactly one result-bearing');
});
test('C2 and serial C3 publish graph-call child closure without changing callable pairs', () => {
  const c2Graph = c2Publication.graphFunctions.find((row) => row.name === c2.graphFunctionRef);
  const c3 = product.WORKSITE_BRANCH_CONSTRUCTION_IDS;
  const c3Graph = c1Publication.graphFunctions.find((row) => row.name === c3.graphFunctionRef);
  for (const [pub, graph, ids] of [[c2Publication, c2Graph, c2], [c1Publication, c3Graph, c3]]) {
    const child = pub.closureContracts.find((row) => row.closureContractRef === graph.declarations['abg.child_closure_contract']);
    assert.equal(child.closureScope, 'graph_call');
    assert.deepEqual(graph.inputs, [ids.taskContractRef]);
    assert.deepEqual(graph.outputs, [child.resultContractRef]);
    assert.ok(!child.eventKindRefs.includes('run_closed'));
  }
});

const retainedEventPath = process.env.W2_STEEL_RETAINED_EVENT_PATH;
test('pure preparation preserves actual recorded A/W, grant, source and command configuration', {
  skip: !retainedEventPath && 'explicit historical carrier fixture is optional outside this focused proof',
}, async () => {
  const events = (await readFile(retainedEventPath, 'utf8')).trim().split('\n').map(JSON.parse);
  const tasks = events.filter((event) => event.kind === 'basis_admitted' && event.payload.basisClass === 'root').map((event) => event.payload.rawInputValue);
  const constructionTask = tasks.find((task) => task.kind === 'worksite_construction_task');
  const observedTask = tasks.find((task) => task.kind === 'worksite_command_execution_task');
  assert.ok(constructionTask && observedTask);
  const entry = product.constructWorksiteCommandPreparationInput({ constructionTask,
    commands: observedTask.commands, outcomePredicates: observedTask.outcomePredicates,
    allowedWriteTerritories: observedTask.allowedWriteTerritories });
  const selected = selectWorksiteConstruction(entry);
  assert.equal(selected.disposition, 'success');
  assert.deepEqual(selected.resultCandidate, constructionTask);
  const bound = product.constructRetainedWorksiteInput(product.worksiteRetentionBinding(), entry, observedTask.sourceConstructionResult);
  const prepared = prepareWorksiteCommands(bound);
  assert.equal(prepared.disposition, 'success', JSON.stringify(prepared));
  const task = prepared.resultCandidate;
  assert.ok(product.isWorksiteCommandExecutionTask(task));
  for (const key of ['workspaceAuthorityBasis', 'workspaceBinding', 'commands', 'outcomePredicates', 'allowedWriteTerritories', 'sourceConstructionResult']) {
    assert.deepEqual(task[key], observedTask[key], key);
  }
  assert.deepEqual(task.capabilityGrant, constructionTask.capabilityGrant);
  assert.equal(product.isWorksitePreparationBoundInput({ ...bound, unowned: true }), false);
  assert.throws(() => product.constructRetainedWorksiteInput(product.worksiteRetentionBinding(), { ...entry, unowned: true }, bound.source));
});
test('pure preparation failure remains an ordinary typed failure', () => {
  for (const result of [selectWorksiteConstruction({ kind: 'wrong' }), prepareWorksiteCommands({ kind: 'wrong' })]) {
    assert.equal(result.disposition, 'failure');
    assert.ok(product.isWorksiteCommandExecutionFailure(result.resultCandidate));
  }
});
