import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { SourceTextModule, SyntheticModule } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const load = name => import(pathToFileURL(join(root, 'build/code/src', name + '.js')).href);
const { sha256Canonical: hash } = await load('shared/digests');
const { deepFreeze } = await load('shared/immutable');
const { SEMANTIC_STAGE_IDS: S } = await load('gtl/semantic_stage_identity');
const { SEMANTIC_REVISION_IDS: R } = await load('gtl/semantic_revision_identity');

// Retired (T-292 TD-60): the revision decision view over a retained D2 selector prompt; holds only against the step6 installed preparation of 2026-09-24

test('native revision decision view preserves byte identity, non-UTF8 absence and changed candidate observations', async () => {
  const { sha256Bytes } = await load('shared/digests');
  const { renderNativeRevisionSelectionDecisionView: render } = await load('abg/instruction_assembly');
  const candidate = { meaning: 'original candidate' }, candidateBytes = Buffer.from(JSON.stringify(candidate));
  const file = (relativePath, bytes) => ({ relativePath, state: 'file', encoding: 'base64', bytes: bytes.toString('base64'), digest: sha256Bytes(bytes), byteLength: bytes.length });
  const original = file('candidate.json', candidateBytes);
  const historical = { kind: 'worksite_context_observation', observationRef: 'context://historical', workspaceBindingIdentity: 'binding://old', entries: [original] };
  const current = { ...historical, observationRef: 'context://current', workspaceBindingIdentity: 'binding://new', entries: [
    file('candidate.json', Buffer.from('{"meaning":"changed current candidate"}')),
    file('unicode.txt', Buffer.from('\uFEFF\r\n☃\n')), file('binary.bin', Buffer.from([0xff, 0x00])),
  ] };
  const asset = { assetRef: 'asset://one', assetDigest: hash(candidate), candidate, groundedTerms: [], assessment: null,
    source: { nativeWork: { assetPath: 'candidate.json', assetDigest: original.digest } } };
  const envelope = { kind: 'semantic_stage_envelope', job: { members: [], taskData: {}, evaluationData: { secret: 'withheld' } },
    declaration: { declarationRef: 'lifecycle://one' }, assets: [asset], context: historical, evidence: null, worksite: null };
  const sections = { role: 'selection', source: [], predecessors: [asset], worksite: { context: current, construction: null },
    evidence: { parent: null, causes: [{ result: { valueKind: 'semantic_stage_envelope', value: envelope } }] }, task: {} };
  const view = render(sections, envelope);
  const material = view.predecessors.materialAssets[0], body = ref => view.worksite.byteBodies[Number(ref.presentationRef.split('/').at(-1))];
  assert.equal(body(material.candidate).text, candidateBytes.toString());
  assert.notEqual(material.candidate.presentationRef, view.worksite.context.entries[0].textView.presentationRef);
  assert.deepEqual(Buffer.from(body(view.worksite.context.entries[1].textView).text), Buffer.from('\uFEFF\r\n☃\n'));
  assert.equal(body(view.worksite.context.entries[2].textView).disposition, 'text_unavailable_non_utf8');
  assert.equal(body(view.worksite.context.entries[2].textView).text, null);
  const changed = structuredClone(sections); changed.worksite.context.entries[0].digest = original.digest;
  assert.throws(() => render(changed, envelope), /evidence byte identity mismatch/);
  const duplicateKeys = Buffer.from('{"meaning":"wrong","meaning":"original candidate"}');
  const raw = file('candidate.json', duplicateKeys), unparseable = structuredClone(sections);
  unparseable.evidence.causes[0].result.value.context.entries = [raw];
  unparseable.predecessors[0].source.nativeWork.assetDigest = raw.digest;
  unparseable.evidence.causes[0].result.value.assets[0].source.nativeWork.assetDigest = raw.digest;
  assert.deepEqual(render(unparseable, envelope).predecessors.materialAssets[0].candidate, candidate, 'duplicate-key text cannot replace a typed candidate');
});

test('native revision decision view leaves all opaque C2 and application JSON verbatim', async () => {
  const { sha256Bytes } = await load('shared/digests');
  const { renderNativeRevisionSelectionDecisionView: render } = await load('abg/instruction_assembly');
  const context = { kind: 'worksite_context_observation', entries: [] };
  const opaque = [
    { base64: 'ordinary text is not a byte carrier' }, { base64: 'YQ==' },
    { payload: 'ordinary payload', encoding: 'base64' },
    { payload: 'YQ==', encoding: 'base64', digest: 'not-an-owner-digest', byteLength: 999 },
    { kind: 'worksite_context_observation', entries: 'application value' },
    { assetRef: 'application-asset', assetDigest: 'opaque', candidate: { base64: 'opaque' }, groundedTerms: [], assessment: null },
    { kind: 'semantic_stage_envelope', job: { evaluationData: 'ordinary-domain-data-must-remain' }, assets: 'application value' },
    { kind: 'semantic_revision_envelope', current: 'application value', revisionBasis: 'application value' },
  ];
  const streamBytes = Buffer.from('actual command output\r\n'), stream = { encoding: 'base64', payload: streamBytes.toString('base64'),
    digest: sha256Bytes(streamBytes), byteLength: streamBytes.length };
  const nativeWork = { kind: 'native_workspace_work_observation', task: { context }, before: context, after: context,
    report: { opaque }, assessment: { opaque } };
  const execution = { kind: 'worksite_command_execution_observation',
    task: { sourceNativeWork: nativeWork, outcomePredicates: opaque.map((equals, ordinal) => ({
      kind: 'worksite_outcome_predicate', schemaVersion: '5.0.0', ordinal, predicateId: `predicate-${ordinal}`,
      predicateKind: 'stdout_exact', declaration: { validationCommandId: 'command://value', equals } })) },
    commandResults: [{ stdout: stream, stderr: stream }],
    predicateObservations: opaque.map((observedValue, ordinal) => ({ kind: 'worksite_predicate_observation', schemaVersion: '5.0.0',
      ordinal, predicateId: `predicate-${ordinal}`, predicateKind: 'stdout_exact', observedValue, evidence: opaque, evidenceRefs: [] })) };
  const asset = { assetRef: 'asset://actual-slot', assetDigest: hash(opaque), source: {}, candidate: { opaque }, groundedTerms: [], assessment: { candidate: { opaque } } };
  const envelope = { kind: 'semantic_stage_envelope', job: { members: [], taskData: { opaque }, evaluationData: { hidden: 'actual-private-evaluator-sentinel' } },
    declaration: { declarationRef: 'lifecycle://actual-slot' }, assets: [asset], context,
    worksite: null, evidence: { constructionResult: nativeWork, executionObservation: execution,
      artifacts: [{ subjectRef: 'subject://one', observationRef: 'observation://one', role: 'realization', base64: stream.payload }] } };
  const sections = { role: 'selection', source: [], task: {}, predecessors: [asset],
    worksite: { context, construction: { result: { valueKind: 'native_workspace_work_observation', value: nativeWork } } },
    evidence: { parent: { result: { valueKind: 'semantic_stage_envelope', value: envelope } }, causes: [
      { result: { valueKind: 'worksite_command_execution_observation', value: execution } },
      ...opaque.map(value => ({ result: { valueKind: 'application_defined_result', value } })),
    ] } };
  const before = hash(sections), view = render(sections, envelope), observed = view.evidence.causes[0].result.value;
  assert.equal(hash(sections), before);
  assert.deepEqual(observed.predicateObservations, execution.predicateObservations);
  assert.deepEqual(observed.task.outcomePredicates, execution.task.outcomePredicates);
  assert.deepEqual(observed.task.sourceNativeWork.report, nativeWork.report);
  assert.deepEqual(observed.task.sourceNativeWork.assessment, nativeWork.assessment);
  assert.deepEqual(view.task.originalJob.taskData, envelope.job.taskData);
  assert.deepEqual(view.predecessors.materialAssets[0].candidate, asset.candidate);
  assert.deepEqual(view.predecessors.materialAssets[0].assessment, asset.assessment);
  assert.deepEqual(view.evidence.causes.slice(1).map(leaf => leaf.result.value), opaque);
  assert.deepEqual(view.evidence.parent.result.value.evidence.executionObservation.predicateObservations, execution.predicateObservations);
  assert.equal(view.worksite.byteBodies.length, 1, 'actual stdout/stderr/artifact share one verified body');
  assert.equal(view.worksite.byteBodies[0].text, streamBytes.toString());
  assert.equal(observed.commandResults[0].stdout.textView.presentationRef, observed.commandResults[0].stderr.textView.presentationRef);
  assert.ok(!JSON.stringify(view).includes('actual-private-evaluator-sentinel'));
  assert.ok(JSON.stringify(view).includes('ordinary-domain-data-must-remain'));
});

async function component(name, overrides) {
  const path = join(root, 'build/code/src', name + '.js');
  const module = new SourceTextModule(fs.readFileSync(path, 'utf8'), { identifier: path });
  await module.link(async specifier => {
    const native = await import(specifier.startsWith('node:') ? specifier : pathToFileURL(resolve(dirname(path), specifier)).href);
    const values = { ...native, ...overrides[specifier] };
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}

// TD78 executing-Product identity is an explicit lower-owner premise of the
// actor composition below, never a native answer over synthetic coordinates.
// The production guard still calls the relation; it holds only at the fixture's
// expected prefix and exact WorkspaceBinding ref/digest while the bound lock's
// Product identity equals the executing identity. A wrong prefix, a foreign ref
// or digest, or a false or unavailable executing identity refuses. Installed
// TD78 correctness stays with the genuine installed relation checks.
function executingProductPremise(expected) {
  const premise = { ...expected, calls: [], boundWorkspaceMatchesExecutingToolchain: (prefix, binding) => {
    const answer = typeof premise.prefix === 'object' && premise.prefix !== null && isDeepStrictEqual(prefix, premise.prefix) &&
      typeof premise.ref === 'string' && premise.ref.length > 0 && binding?.ref === premise.ref &&
      typeof premise.digest === 'string' && premise.digest.length > 0 && binding?.digest === premise.digest &&
      typeof premise.boundIdentity === 'string' && premise.executingIdentity === premise.boundIdentity;
    premise.calls.push({ prefix, binding, answer });
    return answer;
  } };
  return premise;
}

test('actor owner retains its own assembly, authenticates raw dispatch, and rejects forged return/basis/drift', async () => {
  // Component boundary: admitted basis/workspace and assembly construction are
  // supplied; the actual compiled preparation and dispatch comparison execute.
  // The transport sentinel prevents every process, event and filesystem effect.
  let builds = 0, cold = 0, reads = 0, physicalCurrent = true, requiredCurrent = true, requiredFailure;
  const stopped = new Error('component transport reached; no dispatch');
  const request = deepFreeze({ actorRef: 'actor://unit', workerBindingRef: 'worker://unit',
    implementationRef: S.authorImplementationRef, inputDigest: hash({ input: 1 }),
    materializationPlanRef: 'plan://unit', rendererRef: 'renderer://unit',
    instructionContractRef: 'contract://input', resultContractRef: 'contract://result',
    transportLane: 'closed_prompt_proof', prompt: 'exact required content', responseJsonSchema: { type: 'object' } });
  const assembly = deepFreeze({ kind: 'native_instruction_assembly', schemaVersion: '5.0.0',
    planRef: request.materializationPlanRef, plan: { role: 'author' }, planDigest: hash('plan'),
    envelope: { inputDigest: request.inputDigest }, envelopeDigest: hash('envelope'),
    manifest: { promptDigest: hash(request.prompt) }, manifestDigest: hash('manifest'), request });
  const basis = deepFreeze({ admitted: true, publication: {}, predecessorPrefix: { coordinateDigest: hash('prefix') },
    executionBasis: { basisRef: 'basis://one', basisDigest: hash('basis') }, cCall: { cCallDigest: hash('call') } });
  // TD78 is a premise at the basis predecessor and the input's exact binding.
  const td78 = executingProductPremise({ prefix: basis.predecessorPrefix, ref: 'binding://one', digest: hash('binding'),
    boundIdentity: hash('toolchain://unit'), executingIdentity: hash('toolchain://unit') });
  const actor = await component('abg/actor_process', {
    './instruction_assembly.js': {
      // Supplied lower assembly premise, through the actual private owner call.
      requireDeclaredNativeInstructionAssembly: () => { builds++; if (!requiredCurrent) throw new TypeError('stale_basis'); if (requiredFailure) throw requiredFailure; return assembly; },
      constructDeclaredNativeInstructionAssembly: () => { cold++; return assembly; },
      requireNativeInstructionAssembly: () => { builds++; if (!requiredCurrent) throw new TypeError('stale_basis'); if (requiredFailure) throw requiredFailure; return assembly; },
      constructNativeInstructionAssembly: () => { cold++; return assembly; },
      requireWorksiteNativeInstructionAssembly: () => { builds++; return assembly; },
      constructWorksiteNativeInstructionAssembly: () => { cold++; return assembly; },
    },
    './execution_basis.js': { constructNativeInstructionAssemblyBasis: b => b === basis ? b : Object.freeze({ ...b }),
      authenticateOwnedNativeInstructionAssemblyBasis: () => ({ call: { cCallRef: 'call://one' }, execution: { basisRef: 'basis://one' }, inputDigest: request.inputDigest, inputValue: { input: 1 } }) },
    './semantic_stage.js': { semanticInputValueAtBasis: () => ({ input: 1 }) },
    './environment_admission.js': { hasAdmittedWorkspaceBinding: () => true,
      boundWorkspaceMatchesExecutingToolchain: td78.boundWorkspaceMatchesExecutingToolchain },
    './event_prefix.js': { readOwnedRuntimeEventPrefixAtDurablePrefix: () => { reads++; if (!physicalCurrent) throw new TypeError('physical prefix changed'); return Object.freeze({ fixture: 'supplied prefix' }); } },
    './invocation_admission.js': { rehydrateInvocationAdmissionAtPrefix: () => null },
    './worker_transport.js': { prepareWorkerTransport: () => { throw stopped; } },
  });
  const occurrence = { semanticStageBasis: basis, cCallRef: 'call://one', runId: 'run://one', graphCallId: 'graph://one',
    frameId: 'frame://one', programLocusRef: 'locus://one', taskOrdinal: null, attempt: 1 };
  const input = { occurrence, request, predecessorPrefix: basis.predecessorPrefix, cCall: { ...occurrence, cCallDigest: hash('call'), implementationRef: request.implementationRef, implementationBindingRef: 'implementation-binding://one' },
    expectedInputDigest: request.inputDigest, workerContracts: { instructionContractRef: request.instructionContractRef, resultContractRef: request.resultContractRef },
    executionBasis: { basisRef: 'basis://one', basisDigest: hash('basis'), workspaceId: 'workspace://one', workspaceBindingId: 'binding://one', workspaceBindingDigest: hash('binding') },
    runtime: { workspaceBinding: { workspaceId: 'workspace://one', bindingId: 'binding://one', bindingDigest: hash('binding'), status: 'active', roots: { archiveRoot: '/unused/unit/archive' } }, artifactTruth: {} }, dispatchOrdinal: 1 };
  const refused = async (promise, expected) => { const r = await promise; assert.equal(r.kind, 'actor_process_effect_refusal'); assert.match(r.message, expected); };
  const prepared = actor.prepareActorProcessInvocation({ input: 1 }, occurrence);
  assert.equal(prepared.prepareInstructionAssembly(), assembly);
  await refused(prepared.invokeActorProcess(input), /component transport reached/);
  assert.deepEqual(td78.calls, [{ prefix: basis.predecessorPrefix, binding: { ref: 'binding://one', digest: hash('binding') }, answer: true }]);
  assert.equal(builds, 1); assert.equal(cold, 0); assert.equal(reads, 1);
  // TD78 negative controls refuse at the production guard before assembly
  // reconstruction, the physical prefix read or transport. The prepared path
  // refuses a moved prefix earlier, so the wrong prefix uses standalone dispatch;
  // foreign binding coordinates reach both execution basis and runtime binding.
  const foreignBinding = over => ({ ...input, executionBasis: { ...input.executionBasis, ...over.basis },
    runtime: { ...input.runtime, workspaceBinding: { ...input.runtime.workspaceBinding, ...over.binding } } });
  for (const [label, dispatch, identity = td78.boundIdentity] of [
    ['wrong prefix', () => actor.invokeActorProcess({ ...input, predecessorPrefix: { coordinateDigest: hash('foreign prefix') } })],
    ['foreign binding ref', () => prepared.invokeActorProcess(foreignBinding({ basis: { workspaceBindingId: 'binding://foreign' }, binding: { bindingId: 'binding://foreign' } }))],
    ['foreign binding digest', () => prepared.invokeActorProcess(foreignBinding({ basis: { workspaceBindingDigest: hash('foreign binding') }, binding: { bindingDigest: hash('foreign binding') } }))],
    ['false executing identity', () => prepared.invokeActorProcess(input), hash('toolchain://foreign')],
    ['unavailable executing identity', () => prepared.invokeActorProcess(input), null],
  ]) {
    td78.calls.length = 0; td78.executingIdentity = identity;
    const counts = [builds, cold, reads];
    const result = await dispatch();
    td78.executingIdentity = td78.boundIdentity;
    assert.equal(result.kind, 'actor_process_effect_refusal', label);
    assert.match(result.message, /actor process request or workspace differs from the admitted execution basis/, label);
    assert.deepEqual(td78.calls.map(call => call.answer), [false], label);
    assert.deepEqual([builds, cold, reads], counts, `${label}: no assembly, prefix read or transport`);
  }
  for (const key of ['prompt', 'rendererRef', 'materializationPlanRef', 'actorRef', 'workerBindingRef']) {
    await refused(prepared.invokeActorProcess({ ...input, request: { ...request, [key]: request[key] + '/forged' } }), /exact native admitted instruction assembly/);
  }
  await refused(prepared.invokeActorProcess({ ...input, occurrence: { ...occurrence, semanticStageBasis: { ...basis } } }), /crosses actor coordinates/);
  await refused(prepared.invokeActorProcess({ ...input, occurrence: { ...occurrence, cCallRef: 'call://foreign' } }), /crosses actor coordinates/);
  await refused(prepared.invokeActorProcess({ ...input, executionBasis: { ...input.executionBasis, basisRef: 'basis://foreign' } }), /crosses actor coordinates/);
  await refused(prepared.invokeActorProcess({ ...input, predecessorPrefix: { coordinateDigest: hash('later prefix') } }), /crosses actor coordinates/);
  await refused(prepared.invokeActorProcess({ ...input, request: { ...request, implementationRef: 'implementation://foreign' },
    cCall: { ...input.cCall, implementationRef: 'implementation://foreign' } }), /exact native admitted instruction assembly/);
  physicalCurrent = false;
  await refused(prepared.invokeActorProcess(input), /physical prefix changed/);
  physicalCurrent = true;
  requiredCurrent = false;
  assert.throws(() => prepared.prepareInstructionAssembly(), /stale_basis/, 'a new preparation must reobserve required content');
  await refused(prepared.invokeActorProcess(input), /preparation did not complete/, 'failed fresh preparation cannot borrow the prior assembly');
  requiredCurrent = true;
  await refused(actor.invokeActorProcess(input), /component transport reached/);
  assert.equal(cold, 1, 'standalone dispatch reconstructs');
  const rawOccurrence = { ...occurrence, semanticStageBasis: { ...basis } };
  const raw = actor.prepareActorProcessInvocation({ input: 1 }, rawOccurrence);
  raw.prepareInstructionAssembly();
  await refused(raw.invokeActorProcess({ ...input, occurrence: rawOccurrence }), /component transport reached/);
  assert.equal(cold, 2, 'raw/copy basis does not inherit retained-value authority');
  const worksiteOccurrence = { ...occurrence, semanticStageBasis: undefined, nativeInstructionAssemblyBasis: basis };
  const worksite = actor.prepareActorProcessInvocation({ input: 1 }, worksiteOccurrence);
  assert.equal(worksite.prepareInstructionAssembly(), assembly);
  const beforeWorksite = cold;
  await refused(worksite.invokeActorProcess({ ...input, occurrence: worksiteOccurrence }), /component transport reached/);
  assert.equal(cold, beforeWorksite, 'worksite assembly also survives owner composition without another materialization');
  for (const cause of ['unknown_dependency', 'unavailable_required_content', 'declared_bound_overflow']) {
    requiredFailure = new TypeError(cause, { cause: deepFreeze({ kind: 'native_instruction_assembly_refusal', cause }) });
    const rejected = actor.prepareActorProcessInvocation({ input: 1 }, occurrence);
    assert.throws(() => rejected.prepareInstructionAssembly(), e => e === requiredFailure, 'typed assembly refusal is preserved');
    await refused(rejected.invokeActorProcess(input), /preparation did not complete/);
  }
  requiredFailure = undefined;
  const leaf = await component('implementation/leaf_invocation_port', {
    '../abg/actor_process.js': { prepareActorProcessInvocation: actor.prepareActorProcessInvocation },
    '../abg/semantic_stage.js': { authenticateOwnedSemanticStageBasis: () => ({ admitted: true }) },
  });
  const invokeLeaf = loadImplementation => leaf.invokeLeafOwnerBoundary({
    resolution: { computeRegime: 'F_P', implementationRef: request.implementationRef,
      inputContractRef: request.instructionContractRef, outputContractRef: request.resultContractRef },
    value: { input: 1 }, inputDigest: request.inputDigest, failureValueKind: 'test_failure',
    verifyAuthority: () => true, validateSuccess: () => true,
    resolveWorkerContracts: () => input.workerContracts,
    occurrence: { ...occurrence, executionAuthority: null }, loadImplementation,
  });
  const forged = await invokeLeaf(async () => (_value, _occurrence, assemble) => {
    const owned = assemble();
    return deepFreeze({ kind: 'prepared_probabilistic_leaf_invocation', schemaVersion: '5.0.0',
      workerRequest: { ...owned.request, prompt: 'implementation-forged prompt' }, complete() {} });
  });
  assert.equal(forged.kind, 'prepared_probabilistic_leaf_owner_invocation');
  await refused(forged.invokeActorProcess({ ...input, request: forged.workerRequest }), /exact native admitted instruction assembly/);
  const replaced = await invokeLeaf(async () => (_value, _occurrence, assemble) => deepFreeze({
    kind: 'prepared_probabilistic_leaf_invocation', schemaVersion: '5.0.0', workerRequest: assemble().request,
    instructionAssembly: { request: { ...request, prompt: 'forged assembly' } }, complete() {},
  }));
  assert.equal(replaced.effectDisposition, 'not_dispatched');
  assert.equal(replaced.ownerObservation.reason, 'malformed_preparation');

});

test('semantic stage, revision and selection implementations preserve the complete owner request', async () => {
  let owner, cold = 0, supplied = 0;
  const assembly = deepFreeze({ request: { prompt: 'canonical envelope', responseJsonSchema: { type: 'object' } }, manifest: { promptDigest: hash('canonical envelope') } });
  const overrides = {
    '../abg/instruction_assembly.js': { requireNativeInstructionAssembly: () => { cold++; return assembly; },
      requireWorksiteNativeInstructionAssembly: () => { cold++; return assembly; } },
    '../product/worksite_construction.js': { isWorksiteConstructionTask: () => true },
    '../abg/semantic_stage.js': { authenticateOwnedSemanticStageBasis: () => owner },
    '../product/semantic_stage.js': { isSemanticStageEnvelope: () => true },
    '../product/semantic_revision.js': { isSemanticRevisionEnvelope: () => true },
  };
  const stage = await component('implementation/semantic_stage', overrides);
  const revision = await component('implementation/semantic_revision', overrides);
  for (const [module, name, role, implementationRef] of [
    [stage, 'realizeSemanticAuthor', 'author', S.authorImplementationRef],
    [stage, 'realizeSemanticAssessor', 'assessor', S.assessorImplementationRef],
    [revision, 'realizeSemanticRevisionAuthor', 'author', R.authorImplementationRef],
    [revision, 'realizeSemanticRevisionAssessor', 'assessor', R.assessorImplementationRef],
    [revision, 'realizeSemanticRevisionSelection', null, R.selectionImplementationRef],
  ]) {
    owner = { role, stage: {}, call: { implementationRef } };
    const occurrence = { semanticStageBasis: { publication: {} } };
    const standalone = module[name]({}, occurrence);
    const before = cold;
    const composed = module[name]({}, occurrence, () => { supplied++; return assembly; });
    assert.equal(composed.workerRequest, assembly.request);
    assert.deepEqual(composed.workerRequest, standalone.workerRequest);
    assert.equal(cold, before, name + ' does not reconstruct supplied owner assembly');
  }
  const construction = await component('implementation/worksite_construction', overrides);
  const occurrence = { nativeInstructionAssemblyBasis: {} };
  const standalone = construction.realizeWorksiteConstructionCandidate({}, occurrence);
  const composed = construction.realizeWorksiteConstructionCandidate({}, occurrence, () => { supplied++; return assembly; });
  assert.equal(composed.workerRequest, assembly.request);
  assert.deepEqual(composed.workerRequest, standalone.workerRequest);
  assert.equal(cold, 6); assert.equal(supplied, 6);
});

// Retired (T-292 TD-60): retained D07 assemblies conserve their canonical parts; input the retained D07 predecessor scratch not recorded

// Retired (T-290 C-5, item 2): five cases over retained T-288 native D2
// material. NATIVE_D2 below is comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/
// native-d2-01/admission-boundary-refactor-01/selector-presentation-01/
// author-context-policy-01 and OWNER_REPAIR is NATIVE_D2/design-presentation-
// continuation-02/owner-continuation-repair-01, both under ABI5_EVIDENCE_ROOT.
// - 'actual derived revision successor shares complete typed assets under the
//   unchanged Design bound': NATIVE_D2/design-bound-diagnosis-01/
//   design-input.json (sha256:49b8be73c463…, 1545750 bytes).
// - 'semantic result matcher follows the exact native compact Design
//   materialization and preserves other roles': the same intake and
//   OWNER_REPAIR/native37-continuation-01/intake-01/intake-terminal-request.json
//   (sha256:3494d102d333…, 296449 bytes).
// - 'assessment-first actual successor preserves typed retained terms and full
//   pending candidate under the unchanged bound': OWNER_REPAIR/
//   native38-continuation-01/first-cause-suffix/87788-c_call_result_admitted.jsonl
//   (sha256:359b374ef0f0…, 1513991 bytes) and the successor the retired
//   retained branch of t287-native-semantic-revision wrote from it.
// - 'native42 operational selector context preserves current inventory and
//   qualified completed evidence': comments/codex/20260926_CALCULUS_CROSSCUT/
//   evidence-recovery-01/native42-selector-component-fixture.json
//   (sha256:1bd71a0947d9…, 13904702 bytes).
// - 'native42 Evidence role context preserves selected observations under the
//   unchanged bound': comments/codex/20260926_CALCULUS_CROSSCUT/
//   evidence-context-01/native42-selected-events.json (sha256:733701942d27…,
//   6413207 bytes).
// Each input carries a native revision intake whose durable prefix coordinate
// is stamped with the intermediate root event contract sha256:4196aaeb…, which
// the current reader refuses, so the current revision and intake guards refuse
// the envelope. The coordinates name prefixes of 104482827 to 531792783 bytes
// of an odd_glc native store outside the evidence root, and no retained record
// holds those events. A truthful coordinate under the current profile needs a
// new native run, which is the owner's; no case can be regenerated from
// retained events.

// B64 capture law: every actual candidate is collected and written complete to
// ABG_REGRESSION_PROOF_ROOT before any dependent assertion. A collection or
// assertion failure is primary and is rethrown unchanged. A capture failure
// beside it is secondary and is carried where the selected reporter
// (scripts/node-test-evidence-reporter.mjs: name, message, stack, code,
// failureType and cause, recursively) retains it: appended at the end of the
// primary's cause chain, else to its message, else written to stderr. A
// capture failure alone fails the case. No t.diagnostic is relied on.
function writeB64Candidate(file, value) {
  const dir = process.env.ABG_REGRESSION_PROOF_ROOT;
  if (dir === undefined || dir === '') return null;
  try { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(join(dir, file), JSON.stringify(value, null, 1)); return null; }
  catch (error) { return error; }
}
function b64CarryCaptureFailure(primary, captureError) {
  let detail; try { detail = String(captureError?.stack ?? captureError); } catch { detail = '[unprintable capture failure]'; }
  const carried = new Error('B64 capture failure after the primary failure: ' + detail, { cause: captureError });
  carried.name = 'B64CaptureFailure'; carried.code = 'B64_CAPTURE_FAILURE';
  let link = primary;
  for (let depth = 0; depth < 32 && link !== null && (typeof link === 'object' || typeof link === 'function'); depth++) {
    let next; try { next = link.cause; } catch { break; }
    if (next === undefined || next === null) {
      try { Object.defineProperty(link, 'cause', { value: carried, configurable: true, writable: true, enumerable: false }); } catch {}
      if (link.cause === carried) return 'primary_cause_chain_end';
      break;
    }
    link = next;
  }
  try {
    if (primary !== null && typeof primary === 'object') {
      const suffix = ` [${carried.message}]`; primary.message = String(primary.message) + suffix;
      if (String(primary.message).endsWith(suffix)) return 'primary_message';
    }
  } catch {}
  try { process.stderr.write(carried.message + '\n'); return 'stderr'; } catch { return 'not_carried'; }
}
async function b64CapturedCase(t, file, candidate, collect, verify) {
  const fail = (phase, primary) => {
    try { candidate.primaryError = { phase, error: String(primary?.stack ?? primary) }; } catch {}
    const secondary = writeB64Candidate(file, candidate);
    if (secondary !== null) b64CarryCaptureFailure(primary, secondary);
    throw primary;
  };
  try { await collect(); } catch (primary) { fail('collect', primary); }
  const captureError = writeB64Candidate(file, candidate);
  if (captureError !== null) throw new Error(`B64 candidate capture failed: ${String(captureError?.stack ?? captureError)}`, { cause: captureError });
  try { await verify(); } catch (primary) { fail('verify', primary); }
}

// B64 presentation component: the real event store, real held-prefix carriage
// and the real body owner serve the real selector decision view renderer. The
// historical uses and decision sections here are case-supplied lower premises,
// not owner-derived uses or an owner-built assembly. The native-semantic-job
// B64 Public composition derives uses only for one same-binding source Run
// (its intake parent and adverse cause); the inherited parent of an older Run
// and binding and the C2/evidence/revision-cause routes below remain
// lower-component coverage with no full composition regression.
test('B64 historical member presentation preserves complete stage and revision decision material', async t => {
  const candidate = { kind: 'b64_member_presentation_candidate', premise: null, uses: null, views: {}, refusals: [], stageView: null, carriers: null };
  const asJson = read => read.kind === 'worksite_context_body' ? { ...read, bytes: read.bytes.toString('base64') } : read;
  const text = { 'src/a.txt': 'alpha '.repeat(2000), 'src/b.json': JSON.stringify({ meaning: 'historical candidate' }) };
  const binary = Buffer.from([0xff, 0x00, 0xfe]);
  let x = null;
  await b64CapturedCase(t, 'b64-member-presentation.candidate.json', candidate, async () => {
    const storeOwner = await load('abg/event_store'), prefixes = await load('abg/event_prefix'), canonical = await load('shared/canonical_json');
    const { renderNativeRevisionSelectionDecisionView: render } = await load('abg/instruction_assembly');
    const { sha256Bytes } = await load('shared/digests');
    const { loadWorksiteOwner, worksiteFixture } = await import('../support/t287-generic-job-worksite.mjs');
    const product = await loadWorksiteOwner();
    const worksite = async files => {
      const w = await worksiteFixture(product); t.after(() => fs.promises.rm(w.scratch, { force: true, recursive: true }));
      for (const [path, bytes] of Object.entries(files)) { fs.mkdirSync(join(w.canonicalRoot, path, '..'), { recursive: true }); fs.writeFileSync(join(w.canonicalRoot, path), bytes); }
      return { w, observe: async () => product.observeWorksiteContext({ ...w, readRoots: ['src'], maxFiles: 4096, maxBytes: 64 * 1024 * 1024 }) };
    };
    const W0 = await worksite(text), W1 = await worksite({ ...text, 'src/c.bin': binary });
    const dir = fs.mkdtempSync(join(W1.w.scratch, 'b64-store-')), eventLogPath = join(dir, 'events.jsonl');
    const acquired = storeOwner.createNewEmptyAppendSink({ kind: 'new_empty_append_sink_request', schemaVersion: '5.0.0', eventLogPath });
    // The acquisition outcome is retained in the candidate before its check.
    candidate.storeAcquisition = acquired.store ? { acquired: true, eventLogPath } : { acquired: false, eventLogPath, refusal: acquired };
    assert.ok(acquired.store, JSON.stringify(acquired)); t.after(() => acquired.store.closeDurableLog());
    const store = acquired.store;
    const envl = (kind, payload, o = {}) => ({ kind, payload, eventTime: '2026-11-16T00:00:00.000Z', aggregateType: 'workspace', aggregateId: 'workspace://b64',
      parentAggregateId: null, causationEventRefs: [], correlationId: 'correlation://b64', workflowVersion: '5.0.0', scopeClass: 'workspace', basisId: 'basis://b64', ...o });
    const admit = (label, runId, value) => {
      const cCallRef = 'c-call://b64-presentation/' + label;
      const extra = { aggregateType: 'c_call', aggregateId: cCallRef, parentAggregateId: 'frame://' + label, scopeClass: 'run', runId, graphCallId: 'graph-call://' + label, frameId: 'frame://' + label };
      const pair = storeOwner.admitRuntimeEventBatch(store, [() => envl('c_call_opened', { cCallRef, cCallDigest: hash(label), callClass: 'leaf', batchRef: null, taskOrdinal: null, attempt: 1, programLocusRef: 'locus://' + label, retryPath: [] }, extra),
        prior => envl('c_call_fibre_selected', { cCallRef, callClass: 'leaf', armId: 'arm://b64', regime: 'F_D' }, { ...extra, causationEventRefs: [prior.at(-1).eventId] })]);
      const body = { cCallRef, resultClass: 'success', contractRef: 'contract://b64-output', valueKind: value.kind, evidenceRefs: [], value, valueDigest: hash(value) };
      const resultDigest = hash(body), resultRef = 'result://b64-presentation/' + resultDigest.slice(7);
      const event = storeOwner.admitRuntimeEvent(store, envl('c_call_result_admitted', { ...body, resultRef, resultDigest }, { ...extra, causationEventRefs: [pair.at(-1).eventId] }));
      return { event, leaf: { cCall: { cCallRef, runId }, result: { resultRef, resultDigest, resultClass: 'success', valueKind: value.kind, value }, judgment: { judgment: 'advance' } } };
    };
    const held = () => prefixes.selectRuntimeEventPrefixFromStore(store);
    const O = 'run://b64-presentation/older', A = 'run://b64-presentation/source';
    const task = (label, context) => ({ kind: 'native_workspace_work_task', schemaVersion: '5.0.0', handoff: label, context });
    const envelopeOf = (context, evidence = null) => ({ kind: 'semantic_stage_envelope', job: { members: [], taskData: {}, evaluationData: { secret: 'withheld' } },
      declaration: { declarationRef: 'lifecycle://b64' }, assets: [], context, evidence, worksite: null });
    // Older Run under the older binding: one holder and the inherited parent.
    const holder0 = admit('older-holder', O, task('older-holder', await W0.observe()));
    const after0 = prefixes.reuseWorksiteContextBodiesAtPrefix(held(), await W0.observe(), { runId: O });
    const parent = admit('inherited-parent', O, envelopeOf(after0));
    // Source Run under the newer binding: holder, native observation, folds and C2.
    const holder1 = admit('source-holder', A, task('source-holder', await W1.observe()));
    const after1 = prefixes.reuseWorksiteContextBodiesAtPrefix(held(), await W1.observe(), { runId: A });
    const nativeObservation = { kind: 'native_workspace_work_observation', schemaVersion: '5.0.0', observationRef: after1.observationRef, observationDigest: after1.observationDigest,
      after: after1, changedPaths: [], report: { opaque: { base64: 'not a carrier' } }, assessment: { disposition: 'falsified' } };
    const streamBytes = Buffer.from('actual command output\r\n');
    const stream = { encoding: 'base64', payload: streamBytes.toString('base64'), digest: sha256Bytes(streamBytes), byteLength: streamBytes.length };
    const c2Value = { kind: 'worksite_command_execution_observation', schemaVersion: '5.0.0',
      task: { sourceNativeWork: nativeObservation, sourceReacquisition: { request: { sourceNativeWork: nativeObservation, currentContext: after1 } } },
      commandResults: [{ stdout: stream, stderr: stream }] };
    const adverse = admit('adverse-fold', A, envelopeOf(after1));
    const c2 = admit('c2-observation', A, c2Value);
    const evidenceFold = admit('evidence-fold', A, envelopeOf(after1, { constructionResult: nativeObservation, executionObservation: c2Value, artifacts: [] }));
    const current = await W1.observe();
    const revisionCause = admit('revision-cause', A, { kind: 'semantic_revision_envelope', current: envelopeOf(after1),
      revisionBasis: { historicalAssets: [], request: { nativeWorksite: { context: current } } } });
    const files = context => context.entries.filter(e => e.state === 'file');
    // The complete carriage premise, retained before any assertion.
    candidate.premise = { older: { holderEventRef: holder0.event.eventId, after: after0 }, source: { holderEventRef: holder1.event.eventId, after: after1 }, current,
      binding: { older: after0.workspaceBindingIdentity, source: after1.workspaceBindingIdentity } };
    const useOf = (row, context) => ({ resultRef: row.leaf.result.resultRef, resultDigest: row.leaf.result.resultDigest, cCallRef: row.leaf.cCall.cCallRef, runId: row.leaf.cCall.runId,
      coveredBinding: { bindingId: context.workspaceBindingIdentity, bindingDigest: context.workspaceBindingDigest } });
    const uses = [useOf(parent, after0), ...[adverse, c2, evidenceFold, revisionCause].map(row => useOf(row, after1))];
    candidate.uses = uses;
    const envelope = envelopeOf(after0);
    const sections = { role: 'selection', source: [], predecessors: [], worksite: { context: current, construction: null },
      evidence: { parent: parent.leaf, causes: [adverse.leaf, c2.leaf, evidenceFold.leaf, revisionCause.leaf] }, task: {} };
    const cold = prefixes.selectValidatedRuntimeEventPrefix(storeOwner.validateHistoricalEvents(fs.readFileSync(eventLogPath)));
    const present = (label, prefix, declared, chosen = sections) => {
      const reads = []; let view = null, error = null;
      try {
        view = render(chosen, envelope, (at, context, relativePath) => {
          const read = prefixes.resolveHistoricalWorksiteContextBodyAtPrefix(prefix, at, context, relativePath, declared);
          reads.push({ at, relativePath, read: asJson(read) });
          if (read.kind !== 'worksite_context_body') throw new TypeError(`historical context member ${read.code}: ${read.reason}`);
          return read.bytes;
        });
      } catch (e) { error = String(e?.message ?? e); }
      return (candidate.views[label] = { reads, view, error });
    };
    present('held', held(), uses); present('cold', cold, uses);
    const refusal = (label, ...args) => candidate.refusals.push({ label, ...present('negative: ' + label, ...args) });
    refusal('inherited parent under the newest cause binding', held(), uses.map((u, i) => i === 0 ? { ...u, coveredBinding: uses[1].coveredBinding } : u));
    refusal('undeclared C2 historical use', held(), uses.filter(u => u.resultRef !== c2.leaf.result.resultRef));
    refusal('older parent under the source Run', held(), uses.map((u, i) => i === 0 ? { ...u, runId: A } : u));
    const memberCurrent = structuredClone(sections); memberCurrent.worksite.context = after1;
    refusal('member-backed current W context', held(), uses, memberCurrent);
    const tampered = structuredClone(sections); tampered.evidence.causes[0].result.value.context.entries.find(e => e.state === 'file').digest = hash('other');
    refusal('presented context differs from its admitted Result', held(), uses, tampered);
    // The applicable same-Run semantic-stage member view of the fold's own envelope.
    candidate.stageView = files(after1).map(e => ({ relativePath: e.relativePath, read: asJson(prefixes.resolveWorksiteContextBodyAtPrefix(held(), after1, e.relativePath, { runId: A })) }));
    const stored = store.readAll();
    candidate.carriers = Object.fromEntries(Object.entries({ parent, adverse, c2, evidenceFold, revisionCause }).map(([k, row]) =>
      [k, { original: canonical.canonicalJson(row.leaf.result.value), stored: canonical.canonicalJson(stored.find(e => e.eventId === row.event.eventId).payload.value) }]));
    x = { holder0, holder1, files };
  }, async () => {
    const premise = candidate.premise;
    assert.notEqual(premise.binding.older, premise.binding.source, 'the inherited parent has an older binding than the newest cause');
    for (const side of ['older', 'source']) assert.ok(x.files(premise[side].after).every(e => e.encoding === 'admitted_member'), side);
    assert.ok(x.files(premise.current).every(e => e.encoding === 'base64'), 'current W is a fresh inline observation');
    for (const label of ['held', 'cold']) {
      const row = candidate.views[label];
      assert.equal(row.error, null, `${label}: ${row.error}`);
      for (const r of row.reads) assert.equal(r.read.kind, 'worksite_context_body', JSON.stringify(r));
      const routes = new Set(row.reads.map(r => r.at.resultRef + ' ' + r.at.route.join('.')));
      for (const route of ['context', 'task.sourceNativeWork.after', 'task.sourceReacquisition.request.sourceNativeWork.after', 'task.sourceReacquisition.request.currentContext',
        'evidence.constructionResult.after', 'evidence.executionObservation.task.sourceNativeWork.after', 'current.context'])
        assert.ok([...routes].some(r => r.endsWith(' ' + route)), `${label}: route ${route}`);
      assert.ok(row.reads.filter(r => r.at.resultRef === candidate.uses[0].resultRef).every(r => r.read.holder.eventRef === x.holder0.event.eventId));
      assert.ok(row.reads.filter(r => r.at.resultRef !== candidate.uses[0].resultRef).every(r => r.read.holder.eventRef === x.holder1.event.eventId));
      const view = row.view, body = ref => view.worksite.byteBodies[Number(ref.presentationRef.split('/').at(-1))];
      const parentEntries = x.files(view.evidence.parent.result.value.context);
      for (const e of parentEntries) { assert.equal(e.sourceEncoding, 'admitted_member'); assert.ok(e.member); assert.equal(body(e.textView).digest, e.digest); }
      assert.equal(body(parentEntries.find(e => e.relativePath === 'src/a.txt').textView).text, text['src/a.txt']);
      const c2Entries = x.files(view.evidence.causes[1].result.value.task.sourceNativeWork.after);
      assert.equal(body(c2Entries.find(e => e.relativePath === 'src/c.bin').textView).disposition, 'text_unavailable_non_utf8');
      assert.equal(body(c2Entries.find(e => e.relativePath === 'src/c.bin').textView).text, null);
      assert.deepEqual(view.evidence.causes[1].result.value.task.sourceNativeWork.report, { opaque: { base64: 'not a carrier' } }, 'opaque application JSON verbatim');
      assert.ok(x.files(view.worksite.context).every(e => e.sourceEncoding === 'base64' && e.member === undefined), 'current W context stays inline');
      const digests = view.worksite.byteBodies.map(b => b.digest);
      assert.equal(new Set(digests).size, digests.length, 'each distinct byte body is presented once');
    }
    assert.deepEqual(candidate.views.cold.view, candidate.views.held.view, 'held and cold prefixes yield the same presentation');
    for (const row of candidate.refusals) { assert.notEqual(row.error, null, row.label); assert.equal(row.view, null, row.label); }
    for (const row of candidate.refusals.slice(0, 3)) assert.equal(row.reads.at(-1).read.kind, 'worksite_context_body_refusal', row.label);
    for (const row of candidate.stageView) { assert.equal(row.read.kind, 'worksite_context_body', JSON.stringify(row)); assert.equal(row.read.holder.eventRef, x.holder1.event.eventId); }
    for (const [k, row] of Object.entries(candidate.carriers)) assert.equal(row.stored, row.original, `the admitted ${k} carrier is unchanged`);
    t.diagnostic('B64 presentation component: real store, held-prefix carriage, body owner and decision-view renderer over case-supplied sections; historical uses are lower premises. Owner derivation of inherited-parent/older-binding and C2-route uses is not exercised by any full composition.');
  });
});
