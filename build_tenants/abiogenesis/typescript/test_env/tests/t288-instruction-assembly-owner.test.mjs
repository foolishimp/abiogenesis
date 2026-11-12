import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
    './environment_admission.js': { hasAdmittedWorkspaceBinding: () => true },
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
  assert.equal(builds, 1); assert.equal(cold, 0); assert.equal(reads, 1);
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
