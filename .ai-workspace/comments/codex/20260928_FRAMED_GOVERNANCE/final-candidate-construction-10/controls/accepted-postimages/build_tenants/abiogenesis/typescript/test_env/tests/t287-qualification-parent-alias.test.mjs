// Pure component proof over a retained admitted body-reference history.
// Qualification resource/declaration lookup is an explicit lower premise.
// The canonical durable reader, cursor/CCall/outcome owners and alias resolver
// execute. Synthetic competition cases separately supply lower admission.
// No Runtime admission, append/reopen, actor, provider or qualification run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolve, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {SourceTextModule, SyntheticModule} from 'node:vm';
import {performance} from 'node:perf_hooks';

const hashBytes = bytes => createHash('sha256').update(bytes).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));

test('native parent alias conserves the original child/J and rejects crossed provenance and competing producers', async t => {
  const started = performance.now();
  const bindingPath = process.env.ABI5_PARENT_ALIAS_BINDINGS;
  assert(bindingPath, 'explicit frozen fixture and isolated emitted-owner binding required');
  const binding = JSON.parse(fs.readFileSync(bindingPath, 'utf8'));
  for (const pin of Object.values(binding.fixtures)) {
    const bytes = fs.readFileSync(pin.path);
    assert.equal(bytes.length, pin.bytes);
    assert.equal(hashBytes(bytes), pin.sha256, pin.path);
  }
  const stage = resolve(binding.stageRoot, 'build/code/src');
  const imported = new Map();
  async function actual(relative) {
    if (!imported.has(relative)) imported.set(relative,
      await import(pathToFileURL(join(stage, relative)).href));
    return imported.get(relative);
  }
  const packet = JSON.parse(fs.readFileSync(binding.fixtures.packet.path, 'utf8'));
  const retained = JSON.parse(fs.readFileSync(binding.fixtures.retained.path, 'utf8'));
  const proof = {...retained.proof, declarations: packet.declarationProofs};
  // This lookup is deliberately narrower than material/resource qualification.
  // It preserves the actual task identity and declaration bytes, and does not
  // claim that the complete resource manifest or semantic context was checked.
  const resourcesPremise = {
    resolveQualificationAssessment(input) {
      assert.deepEqual(input, packet.assessmentInput, 'exact retained reference task/plan');
      return {task: {declarations: packet.declarationProofs}, plan: input.plan};
    },
  };
  const exposures = ['graphOwner', 'nativeState', 'producerForResult'];
  async function owner(source, overrides = {}, names = exposures) {
    const file = join(stage, 'abg/qualification_proof.js');
    const module = new SourceTextModule(source + '\nexport { ' + names.join(', ') + ' };\n',
      {identifier: file, initializeImportMeta(meta) { meta.url = pathToFileURL(file).href; }});
    const linked = new Map();
    await module.link(async specifier => {
      if (linked.has(specifier)) return linked.get(specifier);
      const url = specifier.startsWith('.')
        ? pathToFileURL(resolve(stage, 'abg', specifier)).href : specifier;
      const values = {...await import(url), ...(overrides[specifier] ?? {})};
      const module = new SyntheticModule(Object.keys(values), function () {
        for (const [key, value] of Object.entries(values)) this.setExport(key, value);
      });
      linked.set(specifier, module);
      return module;
    });
    await module.evaluate();
    return module.namespace;
  }
  const currentSource = fs.readFileSync(join(stage, 'abg/qualification_proof.js'), 'utf8');
  const resources = {'../validator/qualification_resources.js': resourcesPremise};
  const current = await owner(currentSource, resources);
  const previous = await owner(fs.readFileSync(binding.fixtures.historicalOwner.path, 'utf8'), resources);
  const eventsOwner = await actual('abg/event_store.js');
  const prefixOwner = await actual('abg/event_prefix.js');
  const cursorOwner = await actual('abg/traversal_cursor.js');
  const calls = await actual('abg/c_call.js');
  const events = eventsOwner.readRuntimeEventsAtDurablePrefix(proof.prefix);
  const prefix = prefixOwner.selectValidatedRuntimeEventPrefix(events);
  const parent = current.graphOwner(proof.prefix,
    retained.terminal.producer.cCallRef, proof.declarations);
  assert(parent, 'real workflow owner reconstructs from admitted cursor and published GraphFunction');
  assert.equal(parent.call.callClass, 'workflow');
  assert.equal(previous.graphOwner(proof.prefix, parent.call.cCallRef, proof.declarations), null,
    'pinned preimage omits required workflow reconstruction inputs');
  const parentResult = events.find(e => e.kind === 'c_call_result_admitted' && e.aggregateId === parent.call.cCallRef);
  assert(parentResult, 'canonical reader recovers the parent body-reference Result');
  const physical = fs.readFileSync(fileURLToPath(proof.prefix.eventLogRef)).subarray(0, proof.prefix.prefixLength);
  const rawRows = physical.toString('utf8').trim().split('\n').map(JSON.parse);
  assert(!rawRows.some(e => e.kind === 'c_call_result_admitted' && e.aggregateId === parent.call.cCallRef),
    'physical raw-kind absence does not imply decoded parent Result absence');
  const childRef = retained.childFoldback.childCCallRef;
  const childResult = events.find(e => e.kind === 'c_call_result_admitted' && e.aggregateId === childRef);
  assert(childResult);
  const parentCoordinate = {ref: parentResult.payload.resultRef, digest: parentResult.payload.resultDigest};
  const childCoordinate = {ref: childResult.payload.resultRef, digest: childResult.payload.resultDigest};
  const direct = current.producerForResult(proof, childCoordinate);
  const alias = current.producerForResult(proof, parentCoordinate);
  assert(direct && alias, 'direct child and parent alias reach authenticated native states');
  assert.equal(alias.state.cCall.cCallRef, childRef);
  assert.equal(direct.state.cCall.cCallRef, childRef);
  assert.deepEqual(alias.state.result, direct.state.result);
  assert.deepEqual(alias.state.judgment, direct.state.judgment);
  assert.equal(alias.state.result.value.kind, 'qualification_judgment');
  assert.equal(new Set([alias.state.cCall.cCallRef, direct.state.cCall.cCallRef]).size, 1);

  const sourceInput = cursorOwner.projectOpenedCCallTraversalInputAtPrefix(prefix, parent.graph, parent.call.cCallRef);
  assert(sourceInput);
  const fn = parent.publication.graphFunctions.find(f => f.name === parent.execution.graphFunctionRef);
  assert(fn);
  assert.equal(calls.projectOpenedCCallCarrierAtPrefix(prefix, parent.graph, parent.call.cCallRef), null,
    'missing cursor and GraphFunction refuse at the canonical owner');
  assert.equal(calls.projectOpenedCCallCarrierAtPrefix(prefix, parent.graph, parent.call.cCallRef,
    {...sourceInput.cursor, cursorDigest: 'sha256:' + '0'.repeat(64)}, fn), null, 'crossed cursor digest refuses');
  assert.equal(calls.projectOpenedCCallCarrierAtPrefix(prefix, parent.graph, parent.call.cCallRef,
    sourceInput.cursor, alias.owner.publication.graphFunctions.find(f => f.name === alias.owner.execution.graphFunctionRef)), null,
  'crossed child GraphFunction cannot reconstruct its parent');

  const subTraversal = events.find(e => e.kind === 'c_call_evidenced' && e.aggregateId === parent.call.cCallRef &&
    e.payload.evidenceClass === 'sub_traversal');
  assert(subTraversal, 'real authenticated foldback source');
  const {deepFreeze} = await actual('shared/immutable.js');
  const {RuntimeDerivationSource} = await actual('abg/runtime_derivation.js');
  const negatives = [];
  for (const [name, mutate] of [
    ['missing foldback', rows => rows.filter(e => e !== subTraversal)],
    ['crossed child graph call', rows => rows.map(e => e === subTraversal
      ? {...e, payload: {...e.payload, childGraphCallId: 'graph-call://crossed'}} : e)],
    ['crossed child result', rows => rows.map(e => e === subTraversal
      ? {...e, payload: {...e.payload, childResultDigest: 'sha256:' + '0'.repeat(64)}} : e)],
  ]) {
    // These are counterfactual reads, never admitted or written. Removing the
    // evidence row also removes its ordinal slot and expands references to its
    // existing causes; no dangling cause or ordinal gap may stand in for the
    // intended missing-foldback predicate. Crossed rows retain their ordinals.
    const altered = mutate([...events]);
    const rows = new RuntimeDerivationSource().snapshot(altered.map((event, i) => {
      const causes = name === 'missing foldback'
        ? [...new Set(event.causationEventRefs.flatMap(ref => ref === subTraversal.eventId
          ? subTraversal.causationEventRefs : [ref]))]
        : event.causationEventRefs;
      return deepFreeze({...event, admissionOrdinal: i + 1, causationEventRefs: causes});
    }));
    // This real canonical owner checks deep immutability, admission order,
    // event-profile eligibility and causal predecessors before alias lookup.
    const alteredPrefix = prefixOwner.selectValidatedRuntimeEventPrefix(rows);
    assert.equal(prefixOwner.runtimeEventsFromValidatedPrefix(alteredPrefix).length, rows.length);
    const counter = await owner(currentSource, {...resources,
      './event_store.js': {readRuntimeEventsAtDurablePrefix: coordinate => {
        assert.deepEqual(coordinate, proof.prefix); return rows;
      }},
    });
    const state = counter.nativeState(proof, parent.call.cCallRef);
    assert(state, name + ': actual parent native-state owner must succeed before alias routing');
    assert.equal(state.state.cCall.callClass, 'workflow');
    const evidence = state.state.evidence.filter(e => e.evidenceClass === 'sub_traversal');
    let expectedBoundary;
    let witness;
    if (name === 'missing foldback') {
      assert.equal(evidence.length, 0);
      expectedBoundary = 'producerForResult: required unique sub_traversal evidence has no childResultRef/childResultDigest';
      witness = {subTraversalEvidenceCount: evidence.length};
    } else {
      assert.equal(evidence.length, 1);
      const selected = rows.filter(e => e.kind === 'c_call_result_admitted' &&
        e.payload.resultRef === evidence[0].childResultRef && e.payload.resultDigest === evidence[0].childResultDigest);
      if (name === 'crossed child graph call') {
        assert.equal(selected.length, 1);
        assert.notEqual(selected[0].graphCallId, evidence[0].childGraphCallId);
        expectedBoundary = 'producerForResult: unique child Result graphCallId differs from sub_traversal.childGraphCallId';
        witness = {childResultCount: selected.length, actualGraphCallId: selected[0].graphCallId,
          evidenceGraphCallId: evidence[0].childGraphCallId};
      } else {
        assert.equal(selected.length, 0);
        expectedBoundary = 'producerForResult: no child Result has the exact sub_traversal childResultRef/childResultDigest';
        witness = {childResultCount: selected.length, childResultRef: evidence[0].childResultRef,
          childResultDigest: evidence[0].childResultDigest};
      }
    }
    // An exception is an unexpected test failure, not evidence of this guard.
    assert.equal(counter.producerForResult(proof, parentCoordinate), null, name);
    negatives.push({name, preliminaryPrefixAccepted: true, eventCount: rows.length,
      parentNativeStateAccepted: true, expectedBoundary, witness, actualOutcome: 'null (no exception)',
      lowerPremise: 'counterfactual durable event read supplied; ordinal/cause normalization only for the removed evidence; no native admission'});
  }

  // Reuse the existing finite admitted-lookup fixture for the actual eligibility
  // and duplicate-selection policy. Its native admission/CCall projections are
  // supplied premises; this does not fabricate a second installed producer.
  const fixturePath = binding.fixtures.canonicalFixtureSupport.path;
  const fixture = await import(pathToFileURL(fixturePath).href);
  const originalRead = fs.readFileSync;
  const ownerPath = join(binding.originalTenant, 'build/code/src/abg/qualification_proof.js');
  fs.readFileSync = function (path, options, ...rest) {
    const p = path instanceof URL ? fileURLToPath(path) : String(path);
    if (resolve(p) === ownerPath) return options === 'utf8' ? currentSource : Buffer.from(currentSource);
    return originalRead.call(this, path, options, ...rest);
  };
  let f;
  try { f = await fixture.nativeJoinFixture({sameRealm: true}); }
  finally { fs.readFileSync = originalRead; }
  const core = await actual('gtl/self_conformance.js');
  const opened = f.open(fixture.ids.malformedAssessGraph, f.input, 'alias-unique-child');
  const computed = f.implementation.realizeMalformedGtlAssessment(f.input,
    {cCallRef: opened.call.cCallRef, qualificationOwnerBasis: opened.basis});
  assert.equal(computed.disposition, 'success');
  const result = f.complete(opened, computed.resultCandidate);
  const input = {kind: 'self_conformance_input', schemaVersion: '5.0.0', basis: f.input.basis};
  const consumer = f.open(core.SELF_CONFORMANCE_IDS.graphFunctionRef, input, 'alias-consumer');
  const selection = {kind: 'execution_selection', selectionRef: 'selection://component/parent-alias',
    slotRef: opened.call.programLocusRef, programRef: opened.execution.programRef,
    invocationAdmissionRef: opened.execution.invocationAdmissionRef,
    result: {ref: result.resultRef, digest: result.resultDigest}};
  const selectedProof = () => ({...f.proof(), selections: [selection]});
  const resolveMaterial = proof => f.owner.resolveQualificationExecutionMaterial(proof, f.input.basis,
    {...consumer.basis, predecessorPrefix: f.coordinate(f.events.length)});
  const material = resolveMaterial(selectedProof());
  assert(material);
  assert.equal(material.evidence.length, 1, 'one selected eligible producer yields one material');
  const duplicate = selectedProof();
  duplicate.selections.push({...selection, selectionRef: 'selection://component/duplicate-alias'});
  assert.equal(resolveMaterial(duplicate), null, 'duplicate alias selection cannot mint a second producer');
  const peer = f.open(fixture.ids.malformedAssessGraph, f.input, 'alias-competing-child');
  // Equal output values do not deduplicate distinct actual producer identities
  // within this fixture's explicit lower admitted-lookup premise.
  f.complete(peer, computed.resultCandidate);
  assert.equal(resolveMaterial(selectedProof()), null, 'distinct eligible equal-valued producer refuses');

  const report = {status: 'PASS_COMPONENT_ONLY', parentCCallRef: parent.call.cCallRef,
    originalChildCCallRef: childRef, originalChildResult: childCoordinate, parentResult: parentCoordinate,
    parentBodyReferenceDecoded: true, directChildPreserved: true, aliasOriginalProducerCount: 1,
    sourceCursor: {ref: sourceInput.cursor.cursorRef, digest: sourceInput.cursor.cursorDigest},
    parentGraphFunction: fn.name, negatives, competitionLowerPremise: 'existing finite synthetic admitted-lookup fixture',
    resourceLowerPremise: binding.qualificationResourcesPremise, RuntimeAdmissions: 0,
    providerCalls: 0, qualificationCredit: false, elapsedMs: performance.now() - started,
    maxRSSBytes: process.resourceUsage().maxRSS * 1024};
  const reportPath = process.env.ABI5_PARENT_ALIAS_REPORT;
  if (reportPath) fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
  t.diagnostic(JSON.stringify(report));
});
