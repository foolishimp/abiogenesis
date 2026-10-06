import assert from 'node:assert/strict';
import test from 'node:test';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {executeAdmittedTestGraph} from '../support/admitted-graph-execution.mjs';
import {prepareLanguageStructuralFixture} from '../support/language-structural-fixture.mjs';
import {COMPOSED_IDS} from '../fixtures/language-structural/program.mjs';

const root = resolve(import.meta.dirname, '../..');

// Author only the external test Product before manifest generation and packing.
// Its real deterministic leaf changes the received value; ABG stays unchanged.
function changingLeafArtifact() {
  return shape => async basis => [await prepareLanguageStructuralFixture({...basis,sourceTransform(name,source){
    if(name==='leaf.mjs'){
      source=source.replace("candidate('pass',input,{...input})","candidate('pass',input,{...input,subject:input.subject+'!'})");
      if(shape==='recovery')source=source.replace("export const pass=input=>candidate", "export const pass=input=>{if(input.subject==='seed!')throw new TypeError('deterministic failed consumer');return candidate").replace("subject:input.subject+'!'})", "subject:input.subject+'!'})};");
      return source.replace("return output.subject===input.subject;","return output.subject===input.subject+'!';")
        .replace("return output.message===input.subject.trim();","return output.message.startsWith(input.subject.trim());");
    }
    return source.replace('export function constructStructuralPublication','function baseStructuralPublication')+
      '\nexport function constructStructuralPublication(gtl,artifact){return ('+fixture.toString()+')('+JSON.stringify(shape)+')({...gtl,COMPOSED_IDS,LEAF_SPECS},baseStructuralPublication(gtl,artifact)).publication;}\n';
  }})];
}

function fixture(shape) {
  return (gtl, publication) => {
    const ids = gtl.COMPOSED_IDS;
    const graph = publication.graphFunctions.find(g => g.name === ids.graphFunctionRef);
    const leaves = t => t.kind === 'c_of' ? [t] : t.kind === 'c_compose' ? t.terms.flatMap(leaves)
      : t.kind === 'c_batch' ? t.tasks.flatMap(leaves) : t.kind === 'c_retry' ? leaves(t.term)
      : t.kind === 'c_edge' ? [t.transform, t.evaluate, t.consequence] : [];
    const source = leaves(graph.template.nodes[0].term);
    const clone = (source, locus) => gtl.C.of({...source, input: gtl.cCarrier(source.inputCarrierRef),
      output: gtl.cCarrier(source.outputCarrierRef), programLocusRef: 'locus://test/calculus/' + locus,
      compositionRef: null, vectorIndex: 0});
    const normalizer = clone(source.find(t => t.programLocusRef === ids.normalizeLocusRef), 'normalize');
    const render = clone(source.find(t => t.programLocusRef === ids.renderLocusRef), 'render');
    const pass = source.find(t => t.kind === 'c_of' && t.requirement.implementationBindingRef === gtl.LEAF_SPECS.pass.ids.implementationBindingRef);
    const leaf = name => clone(pass, name);
    const batch = (name, tasks) => gtl.C.batch(tasks, 'batch://test/calculus/' + name);
    const terms = {
      compose: () => gtl.C.compose(leaf('A'), leaf('B')),
      batch: () => batch('ordinary', [leaf('A'), leaf('B')]),
      nested: () => batch('nested', [gtl.C.compose(leaf('A'), leaf('B')), gtl.C.compose(leaf('C'), leaf('D'))]),
      progressed: () => gtl.C.compose(leaf('P'), batch('progressed', [leaf('A'), leaf('B')])),
      batch_in_batch: () => batch('outer', [batch('inner1', [leaf('A'), leaf('B')]), batch('inner2', [leaf('C'), leaf('D')])]),
      identity_end: () => batch('identity-end', [gtl.C.compose(leaf('A'), gtl.C.id(gtl.cCarrier(pass.outputCarrierRef))), leaf('B')]),
      recovery: () => gtl.C.compose(batch('equal-producers', [leaf('A'), leaf('B')]), leaf('F')),
    };
    const term = gtl.C.compose(normalizer, gtl.C.compose(terms[shape](), render));
    const final=gtl.LEAF_SPECS.project.ids;
    const closureContracts=publication.closureContracts.map(c=>[ids.closureContractRef,ids.childClosureContractRef].includes(c.closureContractRef)?{...c,
      predicateRef:final.judgmentPredicateRef,evidenceContractRef:final.evidenceContractRef,refusalContractRef:final.refusalContractRef,
      judgmentContractRef:final.judgmentContractRef,rejectionContractRef:final.refusalContractRef,transitionContractRef:final.transitionContractRef}:c);
    const next = {...graph,declarations:{...graph.declarations,'abg.evidence_contract':final.evidenceContractRef,'abg.judgment_contract':final.judgmentContractRef,
      'abg.judgment_predicate':final.judgmentPredicateRef,'abg.transition_contract':final.transitionContractRef}, template: {...graph.template, nodes: [{...graph.template.nodes[0], term}], edges: [], applications: []}};
    return {publication: gtl.modulePublication({...publication,closureContracts, graphFunctions: publication.graphFunctions.map(g => g === graph ? next : g)}),
      programRef: ids.programRef, graphFunctionRef: ids.graphFunctionRef,
      input: {kind: 'data_input', schemaVersion: '5.0.0', subject: ' seed '}};
  };
}

test('real admitted compose and shared batches conserve changing inputs under one basis', {timeout: 300_000}, async t => {
  const artifactFor = changingLeafArtifact();
  const cases = {compose: ['seed', 'seed!'], batch: ['seed', 'seed'],
    nested: ['seed', 'seed!', 'seed', 'seed!'], progressed: ['seed', 'seed!', 'seed!'],
    batch_in_batch: ['seed', 'seed', 'seed', 'seed'], recovery: ['seed', 'seed', 'seed!'], identity_end: ['seed', 'seed']};
  for (const [shape, expected] of Object.entries(cases).filter(([shape]) => !process.env.ABI5_CALCULUS_CASES || process.env.ABI5_CALCULUS_CASES.split(',').includes(shape))) {
    await t.test(shape, async t => {
      const prepareStarted = performance.now();
      const prepareAdditionalProducts = artifactFor(shape);
      const fixtureArtifactPreparationMs = performance.now() - prepareStarted;
      const run = await executeAdmittedTestGraph(t, root, {candidateBasisSource: 'packed_artifact', prepareAdditionalProducts,
        graphFunctionRef: COMPOSED_IDS.graphFunctionRef, programRef: COMPOSED_IDS.programRef,
        input: {kind: 'data_input', schemaVersion: '5.0.0', subject: ' seed '}});
      if (shape !== 'recovery') assert.equal(run.completion.disposition, 'closed', JSON.stringify({kind:run.completion.kind,diagnosticRef:run.completion.diagnosticRef,code:run.completion.code}));
      const {abg, product, installedRoot} = run.environment;
      const cursorOwner = await import(pathToFileURL(join(installedRoot, 'build/code/src/abg/traversal_cursor.js')));
      const prefix = abg.selectValidatedRuntimeEventPrefix(run.events);
      const calls = run.events.filter(e => e.kind === 'c_call_opened' && /^locus:\/\/test\/calculus\/[ABCDFP]$/.test(e.payload.programLocusRef));
      assert.equal(new Set(calls.map(e => e.basisId)).size, 1, 'composition does not invent leaf bases');
      const inputs = calls.map(call => {
        const current = cursorOwner.projectOpenedCCallTraversalInputAtPrefix(prefix, run.graph, call.aggregateId);
        assert.ok(current, call.payload.programLocusRef);
        const evidence = run.events.find(e => e.kind === 'c_call_evidenced' && e.aggregateId === call.aggregateId);
        assert.equal(evidence.payload.inputDigest, current.cursor.inputDigest, 'actual deterministic implementation input equals admitted cursor');
        assert.equal(product.sha256Canonical(current.input.value), evidence.payload.inputDigest);
        const result = run.events.find(e => e.kind === 'c_call_result_admitted' && e.aggregateId === call.aggregateId);
        if (call.payload.programLocusRef.endsWith('/F')) assert.equal(result.payload.resultClass, 'failure');
        else assert.equal(result.payload.value.subject, current.input.value.subject + '!');
        return current.input.value.subject;
      });
      assert.deepEqual(inputs, expected);
      if (shape === 'recovery') {
        const provenance = await import(pathToFileURL(join(installedRoot, 'build/code/src/abg/worksite_input_provenance.js')));
        const failed = cursorOwner.projectOpenedCCallTraversalInputAtPrefix(prefix, run.graph, calls[2].aggregateId);
        const first = run.events.find(e => e.kind === 'c_call_result_admitted' && e.aggregateId === calls[0].aggregateId);
        const actual = run.events.find(e => e.kind === 'c_call_result_admitted' && e.aggregateId === calls[1].aggregateId);
        assert.deepEqual(first.payload.value, actual.payload.value, 'distinct producers deliberately emit equal values');
        assert.notDeepEqual(failed.execution.rawInputValue, failed.input.value, 'failed consumer progressed beyond its shared basis entry');
        const producer = provenance.projectWorksiteInputLeafResultAtPrefix(prefix, failed.input.inputRef, failed.input.inputDigest);
        assert.equal(producer.eventId, actual.eventId, 'the exact current reference selects B');
        assert.notEqual(producer.eventId, first.eventId, 'equal-valued A cannot satisfy the recovery producer join');
      }
      t.diagnostic(JSON.stringify({shape, inputs, basis: calls[0].basisId, result: run.completion.resultValue,
        timings: {fixtureArtifactPreparationMs, ...run.timings}, scope: 'scratch-installed ABG deterministic admission/traversal/implementation; no odd_glc scenario, provider or native actor'}));
    });
  }
});
