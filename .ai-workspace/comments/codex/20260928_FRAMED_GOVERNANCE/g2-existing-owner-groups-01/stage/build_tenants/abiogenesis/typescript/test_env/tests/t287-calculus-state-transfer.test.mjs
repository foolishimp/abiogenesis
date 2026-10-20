import assert from 'node:assert/strict';
import test from 'node:test';
import {cp, mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {executeAdmittedTestGraph} from '../support/admitted-graph-execution.mjs';

const root = resolve(import.meta.dirname, '../..');
const exec = promisify(execFile);

// Author this finite deterministic test artifact before manifest generation,
// verification and installation. Its real leaf appends "!" and emits evidence
// of the input it actually received. No admitted owner or runtime fact is mocked.
async function changingLeafArtifact(t) {
  const copyStarted = performance.now();
  const scratch = await mkdtemp(join(tmpdir(), 'abg-calculus-transfer-'));
  t.after(() => rm(scratch, {recursive: true, force: true}));
  for (const name of ['build', 'contracts', 'scripts', 'package.json', 'package-lock.json', 'product-toolchain-manifest.json'])
    await cp(join(root, name), join(scratch, name), {recursive: true});
  await mkdir(join(scratch, 'test_env/fixtures'), {recursive: true});
  await cp(join(root, 'test_env/fixtures/abi5-root-candidate-basis.json'), join(scratch, 'test_env/fixtures/abi5-root-candidate-basis.json'));
  await cp(join(root, 'node_modules'), join(scratch, 'node_modules'), {recursive: true, dereference: true});
  t.diagnostic(JSON.stringify({phase: 'fixture_file_provisioning_once', wallMs: performance.now() - copyStarted,
    scope: 'copy ABG deterministic fixture files and dependencies; no odd_glc scenario setup'}));
  const leafPath = join(scratch, 'build/code/src/implementation/hello_compose.js');
  const leaf = await readFile(leafPath, 'utf8');
  const before = 'deepFreeze({ ...input })';
  assert.equal(leaf.split(before).length, 2);
  const changingLeaf = leaf.replace(before, 'deepFreeze({ ...input, subject: input.subject + "!" })');
  const lawPath = join(scratch, 'build/code/src/gtl/hello_world.js');
  const law = await readFile(lawPath, 'utf8');
  const identity = 'output.subject === input.subject;';
  assert.equal(law.split(identity).length, 2);
  const returnPublication = 'return modulePublication(publicationBody);';
  assert.equal(law.split(returnPublication).length, 2);
  return async shape => {
    const selectedLeaf = shape === 'recovery' ? changingLeaf.replace('export function passNormalizedHello(input) {',
      'export function passNormalizedHello(input) { if (input.subject === "seed!") throw new TypeError("deterministic failed consumer");') : changingLeaf;
    assert.ok(shape !== 'recovery' || selectedLeaf !== changingLeaf);
    await writeFile(leafPath, selectedLeaf);
    const transform = `(${fixture.toString()})(${JSON.stringify(shape)})({COMPOSED_HELLO_IDS, C, cCarrier, modulePublication}, modulePublication(publicationBody)).publication`;
    await writeFile(lawPath, law.replace(identity, 'output.subject === input.subject + "!";').replace(returnPublication, `return ${transform};`));
    await exec(process.execPath, ['scripts/generate-product-manifest.mjs'], {cwd: scratch, maxBuffer: 8 * 1024 * 1024});
    return scratch;
  };
}

function fixture(shape) {
  return (gtl, publication) => {
    const ids = gtl.COMPOSED_HELLO_IDS;
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
    const pass = source.find(t => t.programLocusRef === ids.batchFirstLocusRef);
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
    const next = {...graph, template: {...graph.template, nodes: [{...graph.template.nodes[0], term}], edges: [], applications: []}};
    return {publication: gtl.modulePublication({...publication, graphFunctions: publication.graphFunctions.map(g => g === graph ? next : g)}),
      programRef: ids.programRef, graphFunctionRef: ids.graphFunctionRef,
      input: {kind: 'hello_world_input', schemaVersion: '5.0.0', subject: ' seed '}};
  };
}

test('real admitted compose and shared batches conserve changing inputs under one basis', {timeout: 300_000}, async t => {
  const artifactFor = await changingLeafArtifact(t);
  const cases = {compose: ['seed', 'seed!'], batch: ['seed', 'seed'],
    nested: ['seed', 'seed!', 'seed', 'seed!'], progressed: ['seed', 'seed!', 'seed!'],
    batch_in_batch: ['seed', 'seed', 'seed', 'seed'], recovery: ['seed', 'seed', 'seed!'], identity_end: ['seed', 'seed']};
  for (const [shape, expected] of Object.entries(cases).filter(([shape]) => !process.env.ABI5_CALCULUS_CASES || process.env.ABI5_CALCULUS_CASES.split(',').includes(shape))) {
    await t.test(shape, async t => {
      const prepareStarted = performance.now();
      const artifact = await artifactFor(shape);
      const fixtureArtifactPreparationMs = performance.now() - prepareStarted;
      const run = await executeAdmittedTestGraph(t, artifact, {candidateBasisSource: 'packed_artifact',
        graphFunctionRef: 'graph-function://abiogenesis/conformance/hello-compose@5', programRef: 'program://abiogenesis/conformance/hello-compose@5',
        input: {kind: 'hello_world_input', schemaVersion: '5.0.0', subject: ' seed '}});
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
