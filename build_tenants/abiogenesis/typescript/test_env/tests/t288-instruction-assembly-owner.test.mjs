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

const selectorPrompt = process.env.ABI5_NATIVE_D2_SELECTOR_PROMPT;
test('native revision decision view conserves retained selector material without duplicate byte bodies or evaluator-only data', {
  skip: !selectorPrompt,
}, async t => {
  const { sha256Bytes } = await load('shared/digests');
  const { canonicalJson } = await load('shared/canonical_json');
  const { admitIJsonText } = await load('shared/i_json');
  const { renderNativeRevisionSelectionDecisionView: render } = await load('abg/instruction_assembly');
  const bytes = fs.readFileSync(selectorPrompt);
  assert.equal(sha256Bytes(bytes), 'sha256:ef70f87489f8bb9bc3fa875baafa8c651fe43f39d4132a8435472feab532e3e2');
  const parts = bytes.toString('utf8').split(/^## (\w+)\n/m);
  const old = Object.fromEntries(Array.from({ length: (parts.length - 1) / 2 }, (_, i) => [parts[i * 2 + 1], JSON.parse(parts[i * 2 + 2])]));
  const envelope = old.evidence[0].result.value;
  // The retained prompt carries the genuine cause leaf, but only parent
  // coordinates. This test does not recreate parent authority or authenticate
  // a runtime prefix. Production obtains the full parent from its existing owner.
  const sections = { ...old, evidence: { parent: null, causes: old.evidence } };
  const before = hash(sections), view = render(sections, envelope);
  const deref = ref => ref.slice(2).split('/').reduce((value, key) => value[key], view);
  const textOf = ref => { const value = deref(ref.presentationRef); return typeof value === 'string' ? value : value.text; };
  assert.equal(hash(sections), before, 'full retained carriers are unchanged');
  assert.deepEqual(view, render(sections, envelope), 'deterministic presentation');
  assert.deepEqual(view.source, old.source, 'complete ordinary source remains available');
  assert.deepEqual(view.task.runEnvironment, old.task.runEnvironment, 'STDO sourceContent and selected policy unchanged');
  assert.deepEqual(view.task.input, old.task.input);
  assert.deepEqual(view.task.stages, old.task.stages);
  assert.deepEqual(view.task.targets, old.task.targets);
  assert.deepEqual(view.obligations, old.obligations);
  assert.deepEqual(view.response, old.response);
  assert.equal(view.evidence.parent, null, 'retained parent coordinates remain in task.input; no fabricated parent leaf');
  assert.deepEqual(view.task.originalJob.taskData, envelope.job.taskData);
  assert.deepEqual(view.task.originalJob.worksiteScope, envelope.job.worksiteScope);
  assert.deepEqual(view.task.originalJob.evaluationData, { disposition: 'withheld_evaluator_only' });
  assert.deepEqual(old.task.runEnvironment.contextPolicy.selectors, ['current_worksite']);
  for (let i = 0; i < old.evidence.length; i++) {
    const cause = old.evidence[i], projected = view.evidence.causes[i];
    assert.deepEqual(projected.cCall, cause.cCall);
    assert.deepEqual(projected.judgment, cause.judgment);
    const { value, ...result } = cause.result, { value: projectedValue, ...projectedResult } = projected.result;
    assert.deepEqual(projectedResult, result, 'Result outcome/provenance unchanged');
    assert.equal(projectedValue.rawEnvelopeDigest, hash(value));
    assert.equal(projectedValue.job.digest, hash(value.job));
    assert.equal(projectedValue.declaration.digest, hash(value.declaration));
    assert.deepEqual(projectedValue.basis, value.basis);
    assert.deepEqual(projectedValue.bindingVersions, value.bindingVersions);
    assert.deepEqual(projectedValue.remainingGaps, value.remainingGaps);
    for (let j = 0; j < value.assets.length; j++) {
      const asset = value.assets[j], material = deref(projectedValue.assets[j].presentationRef);
      assert.deepEqual(material.assessment, asset.assessment, 'full published assessment remains available');
      assert.deepEqual(material.source, asset.source);
      assert.deepEqual(material.groundedTerms, asset.groundedTerms);
      const candidate = material.candidate.interpretation === 'exact_json_candidate'
        ? admitIJsonText(textOf(material.candidate), 'retained candidate') : material.candidate;
      assert.deepEqual(candidate, asset.candidate);
      assert.equal(projectedValue.assets[j].materialDigest, hash(asset));
    }
  }
  assert.equal(view.predecessors.materialAssets.length, 3);
  assert.equal(view.predecessors.accepted.length, 2);
  assert.equal(deref(view.evidence.causes[0].result.value.assets[2].presentationRef).assessment.disposition, 'falsified');
  assert.ok(!view.predecessors.accepted.some(ref => ref.presentationRef === view.evidence.causes[0].result.value.assets[2].presentationRef));
  for (const [original, projected] of [
    [old.worksite.context, view.worksite.context],
    [envelope.context, view.evidence.causes[0].result.value.context],
  ]) {
    const { entries, ...identity } = original, { entries: projectedEntries, ...projectedIdentity } = projected;
    assert.deepEqual(projectedIdentity, identity, 'historical/current observation and binding identities remain distinct');
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i], shown = projectedEntries[i];
      if (entry.state !== 'file') { assert.deepEqual(shown, entry); continue; }
      const { bytes: encoded, encoding, ...fileIdentity } = entry;
      const { textView, sourceEncoding, ...shownIdentity } = shown;
      assert.deepEqual(shownIdentity, fileIdentity); assert.equal(sourceEncoding, encoding);
      assert.deepEqual(Buffer.from(textOf(textView), 'utf8'), Buffer.from(encoded, 'base64'));
      assert.equal(textView.digest, entry.digest);
      const duplicate = view.worksite.context.entries.find(e => e.state === 'file' && e.digest === entry.digest);
      assert.deepEqual(textView, duplicate.textView, 'identical observed bytes have one text view');
    }
  }
  assert.equal(new Set(view.worksite.byteBodies.map(body => body.digest)).size, view.worksite.byteBodies.length);
  for (const source of old.source) assert.ok(!view.worksite.byteBodies.some(body => body.digest === sha256Bytes(Buffer.from(source.text))));
  const sentinel = 'EVALUATOR_ONLY_MUST_NOT_REACH_SELECTOR_916dad7e';
  const withheld = structuredClone(sections);
  withheld.evidence.causes[0].result.value.job.evaluationData = { hidden: sentinel };
  const withheldView = render(withheld, withheld.evidence.causes[0].result.value);
  assert.ok(!canonicalJson(withheldView).includes(sentinel), 'no nested cause/job/presentation leaks evaluator-only data');
  assert.deepEqual(withheldView.predecessors.materialAssets.map(a => a.assessment), view.predecessors.materialAssets.map(a => a.assessment));
  assert.deepEqual(withheldView.source, view.source);
  // Exercise plan/manifest/request composition with explicitly substituted
  // upstream admission and role selection. This proves presentation wiring,
  // not eligibility, root ancestry, currentness or installed admission.
  const call = { graphFunctionRef: 'graph://presentation-test', programLocusRef: 'locus://selection',
    cCallRef: 'c-call://presentation-test', cCallDigest: hash('presentation-call'), inputContractRef: R.selectionInputContractRef };
  const owner = { events: [], call, lifecycle: envelope.declaration, inputRef: 'input://presentation-test', inputDigest: hash(old.task.input),
    execution: { invocationAdmissionRef: 'invocation://presentation-test', programRef: 'program://presentation-test', basisRef: 'basis://presentation-test', basisDigest: hash('presentation-basis') } };
  const subject = { owner, envelope, nativeWorksite: { ...old.worksite }, construction: null, currentWorksite: null,
    parent: old.evidence[0], causes: old.evidence };
  const assemblyOwner = await component('abg/instruction_assembly', {
    './execution_basis.js': { constructNativeInstructionAssemblyBasis: value => value },
    './semantic_revision.js': { projectJobRevisionSubject: () => subject },
    './stdo_environment.js': { projectRunEnvironmentRoleEvidence: () => old.task.runEnvironment },
    '../gtl/c_algebra.js': { cLeafTerms: () => [{ programLocusRef: call.programLocusRef }] },
    '../gtl/stdo_run_environment.js': { nativeContextLeafFamily: () => 'assessor' },
  });
  const assembly = assemblyOwner.evaluateNativeInstructionAssembly({ publication: { semanticJobLifecycle: {} },
    graphFunction: { template: { nodes: [{ term: {} }] } }, cCall: { implementationRef: R.selectionImplementationRef }, predecessorPrefix: { fixture: true } }, old.task.input);
  assert.equal(assembly.kind, 'native_instruction_assembly');
  assert.equal(assembly.plan.evaluationDataIncluded, false);
  assert.equal(assembly.plan.presentation, 'native_revision_decision_view');
  assert.ok(assembly.manifest.sections.every(section => section.disposition === 'included_decision_view'));
  assert.equal(assembly.manifest.promptBytesDigest, sha256Bytes(Buffer.from(assembly.request.prompt)));
  assert.equal(assembly.manifest.promptByteCount, Buffer.byteLength(assembly.request.prompt));
  assert.equal(assembly.manifest.envelopeDigest, hash(assembly.envelope));
  assert.equal(assembly.manifest.nativeContext, undefined);
  assert.deepEqual(assembly.manifest.worksiteContent.nativeContext, { ref: old.worksite.context.observationRef, digest: old.worksite.context.observationDigest });
  assert.deepEqual(assembly.envelope.sections.evidence.parent.cCall, old.evidence[0].cCall);
  assert.deepEqual(assembly.envelope.sections.evidence.parent.judgment, old.evidence[0].judgment);
  assert.deepEqual(assembly.envelope.sections.task.runEnvironment, old.task.runEnvironment);
  t.diagnostic(JSON.stringify({ retainedPromptBytes: bytes.length,
    decisionSectionsBytes: Buffer.byteLength(Object.entries(view).map(([name, value]) => `## ${name}\n${canonicalJson(value)}`).join('\n\n')),
    distinctAssets: view.predecessors.materialAssets.length, distinctAdditionalByteBodies: view.worksite.byteBodies.length,
    sourceBytes: old.source.reduce((n, m) => n + Buffer.byteLength(m.text), 0), fullAssessments: view.predecessors.materialAssets.filter(a => a.assessment).length }));
});

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
      predicateKind: 'module_export_return_exact', declaration: { path: 'module.mjs', export: 'value', equals } })) },
    commandResults: [{ stdout: stream, stderr: stream }],
    predicateObservations: opaque.map((observedValue, ordinal) => ({ kind: 'worksite_predicate_observation', schemaVersion: '5.0.0',
      ordinal, predicateId: `predicate-${ordinal}`, predicateKind: 'module_export_return_exact', observedValue, evidence: opaque, evidenceRefs: [] })) };
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
      requireNativeInstructionAssembly: () => { builds++; if (!requiredCurrent) throw new TypeError('stale_basis'); if (requiredFailure) throw requiredFailure; return assembly; },
      constructNativeInstructionAssembly: () => { cold++; return assembly; },
      requireWorksiteNativeInstructionAssembly: () => { builds++; return assembly; },
      constructWorksiteNativeInstructionAssembly: () => { cold++; return assembly; },
    },
    './execution_basis.js': { constructNativeInstructionAssemblyBasis: b => b === basis ? b : Object.freeze({ ...b }),
      authenticateNativeInstructionAssemblyBasis: () => ({ call: { cCallRef: 'call://one' }, execution: { basisRef: 'basis://one' }, inputDigest: request.inputDigest, inputValue: { input: 1 } }) },
    './semantic_stage.js': { semanticInputValueAtBasis: () => ({ input: 1 }) },
    './environment_admission.js': { hasAdmittedWorkspaceBinding: () => true },
    './event_store.js': { readRuntimeEventsAtDurablePrefix: () => { reads++; if (!physicalCurrent) throw new TypeError('physical prefix changed'); return Object.freeze([]); } },
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
    '../abg/semantic_stage.js': { authenticateSemanticStageBasis: () => ({ admitted: true }) },
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
    '../abg/semantic_stage.js': { authenticateSemanticStageBasis: () => owner },
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

test('retained native assemblies conserve every canonical part and required-content refusal', {
  skip: !process.env.ABI5_D07_PREDECESSOR_SCRATCH, timeout: 180000,
}, async t => {
  const scratch = process.env.ABI5_D07_PREDECESSOR_SCRATCH;
  const call = JSON.parse(fs.readFileSync(join(scratch, 'full-call.json'), 'utf8'));
  const all = fs.readFileSync(join(scratch, 'runtime/events.jsonl'));
  const events = all.toString('utf8').trim().split('\n').map(JSON.parse);
  const publications = call.resources.catalog.boundPublications;
  const declarations = publications.flatMap(p => p.graphFunctions);
  const [store, prefixes, executions, calls, cursors, materialize, native, instructions, traversal, actor] = await Promise.all(
    ['abg/event_store', 'abg/event_prefix', 'abg/execution_basis', 'abg/c_call', 'abg/traversal_cursor', 'gtl/materialize',
      'abg/semantic_stage', 'abg/instruction_assembly', 'hog/traversal', 'abg/actor_process'].map(load));
  let matched = 0, fresh = 0, stale = 0;
  const physicalRefusals = [];
  const roles = [];
  for (const binding of events.filter(e => e.kind === 'actor_transport_binding_admitted' && e.payload.instructionAssembly)) {
    const saved = binding.payload.instructionAssembly;
    const cut = saved.envelope.predecessorPrefix;
    const before = store.readRuntimeEventsAtDurablePrefix(cut), prefix = prefixes.selectValidatedRuntimeEventPrefix(before);
    const opened = before.find(e => e.kind === 'c_call_opened' && e.aggregateId === saved.envelope.cCallRef);
    const executionBasis = executions.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
    const publication = publications.find(p => p.programs.some(p => p.programRef === executionBasis.programRef));
    const graphFunction = declarations.find(g => g.name === executionBasis.graphFunctionRef);
    const graph = materialize.materializeGraph(graphFunction, { invocationAdmissionRef: executionBasis.invocationAdmissionRef,
      admittedInputRef: executionBasis.rawInputAdmissionRef, admittedInputDigest: executionBasis.rawInputDigest, admittedInput: executionBasis.rawInputValue });
    const cCall = calls.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId);
    const worksite = saved.envelope.nativeBasis !== undefined;
    let rawBasis;
    if (worksite) rawBasis = saved.envelope.nativeBasis;
    else {
      const entered = before.find(e => e.kind === 'traversal_cursor_entered' && e.graphCallId === opened.graphCallId && e.basisId === opened.basisId);
      const cp = entered.payload;
      let cursor = cursors.constructTraversalCursorCandidate({ programRef: cp.programRef, executionBasisRef: cp.executionBasisRef,
        traversalScopeRef: cp.traversalScopeRef, runId: entered.runId, graphCallId: entered.graphCallId, frameId: entered.frameId,
        graphRef: cp.materializationRef, inputRef: cp.inputRef, inputDigest: cp.inputDigest, currentNodeRef: graph.template.startNodeRef,
        position: 'at_term', termPath: cp.termPath, taskOrdinal: cp.taskOrdinal, attempt: cp.attempt, retryPath: cp.retryPath });
      if (cursor.cursorDigest !== opened.payload.cursorDigest) cursor = traversal.deriveStructuralTargetCursor(graph, cursor, graph.template.nodes[0].term);
      if (saved.plan.role === 'assessor') cursor = traversal.deriveCompletedTraversalCursor(graph, cursor, { inputRef: saved.envelope.inputRef, inputDigest: saved.envelope.inputDigest });
      assert.equal(cursor.cursorDigest, opened.payload.cursorDigest);
      rawBasis = { publication, lifecyclePublication: publication, sourcePublication: publication, graph, graphFunction,
        declarationGraphFunctions: declarations, executionBasis, cCall, cursor, predecessorPrefix: cut };
    }
    const basis = executions.constructNativeInstructionAssemblyBasis(rawBasis); assert.ok(basis);
    const owner = executions.authenticateNativeInstructionAssemblyBasis(basis); assert.ok(owner);
    const input = owner.inputValue;
    const exact = worksite ? instructions.constructWorksiteNativeInstructionAssembly(basis, input) : instructions.constructNativeInstructionAssembly(basis, input);
    assert.deepEqual(exact, saved, 'plan/envelope/manifest/request match exact admitted native bytes');
    const requireAssembly = () => worksite ? instructions.requireWorksiteNativeInstructionAssembly(basis, input) : instructions.requireNativeInstructionAssembly(basis, input);
    const occurrence = { ...Object.fromEntries(['cCallRef', 'runId', 'graphCallId', 'frameId', 'programLocusRef', 'taskOrdinal', 'attempt'].map(k => [k, cCall[k]])),
      [worksite ? 'nativeInstructionAssemblyBasis' : 'semanticStageBasis']: basis };
    const prepared = actor.prepareActorProcessInvocation(input, occurrence);
    try {
      const current = requireAssembly();
      assert.deepEqual(prepared.prepareInstructionAssembly(), current);
      fresh++;
    } catch (error) {
      assert.throws(() => prepared.prepareInstructionAssembly(), e => e.message === error.message && hash(e.cause ?? null) === hash(error.cause ?? null));
      assert.equal(error.cause?.cause, 'stale_basis');
      physicalRefusals.push({ stage: saved.plan.stageRef, role: saved.plan.role, cause: error.cause.cause });
      stale++;
    }
    const changed = { ...input, schemaVersion: 'foreign' };
    assert.equal(worksite ? instructions.constructWorksiteNativeInstructionAssembly(basis, changed) : instructions.constructNativeInstructionAssembly(basis, changed), null);
    assert.equal(executions.constructNativeInstructionAssemblyBasis({ ...basis, cCall: { ...basis.cCall, cCallRef: 'c-call://foreign' } }), null);
    roles.push(saved.plan.role); matched++;
  }
  // The unchanged native fixture's C2 uses the standalone request path.
  // Exercise the context-companion forwarding seam with that exact task, but
  // stop at assembly preparation before any manifest or physical effect.
  const commandResult = events.find(e => e.kind === 'c_call_result_admitted' && e.payload.value?.kind === 'worksite_command_execution_observation');
  const commandOpened = events.find(e => e.kind === 'c_call_opened' && e.aggregateId === commandResult.payload.cCallRef);
  const commandOccurrence = { ...Object.fromEntries(['cCallRef', 'graphCallId', 'frameId', 'programLocusRef', 'taskOrdinal', 'attempt'].map(k => [k, commandOpened.payload[k]])),
    runId: commandOpened.runId, executionAuthority: null, nativeInstructionAssemblyBasis: {} };
  const commandStop = new TypeError('component command assembly refusal; before effects');
  let commandCold = 0, commandSupplied = 0;
  const command = await component('implementation/worksite_command_execution', {
    '../abg/execution_basis.js': { authenticateNativeInstructionAssemblyBasis: () => ({ call: commandOccurrence }) },
    '../abg/instruction_assembly.js': { requireWorksiteNativeInstructionAssembly: () => { commandCold++; throw commandStop; } },
  });
  assert.throws(() => command.realizeWorksiteCommandExecution(commandResult.payload.value.task, commandOccurrence), e => e === commandStop);
  assert.throws(() => command.realizeWorksiteCommandExecution(commandResult.payload.value.task, commandOccurrence,
    () => { commandSupplied++; throw commandStop; }), e => e === commandStop);
  assert.equal(commandCold, 1); assert.equal(commandSupplied, 1);
  assert.equal(matched, 10); assert.equal(fresh, 8); assert.equal(stale, 2);
  assert.deepEqual(fs.readFileSync(join(scratch, 'runtime/events.jsonl')), all, 'immutable regression history unchanged');
  console.log(JSON.stringify({ scope: 'read-only retained native owner equivalence; no new native effects', matched, fresh, stale, roles, physicalRefusals }));
});

const retainedDesignDirectory = process.env.ABI5_NATIVE_D2_DESIGN_DIRECTORY;
test('actual derived revision successor shares complete typed assets under the unchanged Design bound', {skip: !retainedDesignDirectory}, async t => {
  const {sha256Bytes} = await load('shared/digests');
  const {canonicalJson} = await load('shared/canonical_json');
  const D = retainedDesignDirectory;
  const retained = JSON.parse(fs.readFileSync(join(D,'design-bound-diagnosis-01/design-input.json'),'utf8')).targets[0].event.payload;
  const parent = retained.rawInputValue;
  assert.equal(hash(parent),'sha256:b18bc0a6c74426fdf145ca3a9bf4e9275816b2fab8643271468c7c906f19d185');
  const publication = JSON.parse(fs.readFileSync(join(D,'publication-01/prospective-publication.json'),'utf8'));
  const stage = parent.current.declaration.stages[parent.current.assets.length];
  const revision=await load('product/semantic_revision'),job=await load('product/semantic_job');
  // Future acquisition/selection coordinates are component premises, not new
  // authority. Reuse the review's actual pure Product successor construction.
  const selection={...parent.revisionBasis.selection,selectedStageRef:stage.declarationRef,
    selectedObligationRefs:job.projectSemanticJobBindings(parent.current).map(row=>row.binding.obligationRef),selectedTargetRefs:[]};
  const request={...parent.revisionBasis.request,selectionChoice:{mode:'stage_revision',selectedStageRef:stage.declarationRef},
    nativeWorksite:{...parent.revisionBasis.request.nativeWorksite,context:parent.current.context}};
  const input=revision.deriveSemanticJobRevision(parent,request,selection,null,null);
  assert(input && revision.isSemanticJobRevisionEnvelope(input));
  assert.deepEqual(input.current.assets,parent.current.assets);assert.deepEqual(input.current.job,parent.current.job);
  assert.equal(input.revisionBasis.parentRevisionRef,parent.revisionBasis.basisRef);
  assert.equal(input.revisionBasis.historicalAssets.length,4);
  assert.equal(stage.assembly.maxPromptBytes,1048576);
  const prompt = fs.readFileSync(join(D,'installed-01/preparation/invocation/archives/fp-551946c5d41986bb-prompt.txt'),'utf8');
  const chunks = prompt.split(/^## (\w+)\n/m);
  const preceding = Object.fromEntries(Array.from({length:(chunks.length-1)/2},(_,i)=>[chunks[i*2+1],JSON.parse(chunks[i*2+2])]));
  const roles = publication.runEnvironments.flatMap(e=>e.roles).filter(r=>r.graphFunctionRef===retained.graphFunctionRef && r.programLocusRef===stage.authorLocusRef && r.role==='author');
  assert(roles.length);assert(roles.every(r=>hash(r)===hash(roles[0])));
  const role = roles[0], sourceContent = role.sourceBindings.filter((b,i,rows)=>rows.findIndex(x=>hash(x)===hash(b))===i).map(b=>{
    const row=preceding.role.environment.sourceContent.find(row=>Object.entries(b).every(([k,v])=>row[k]===v));assert(row);
    assert.equal(sha256Bytes(Buffer.from(row.text)),b.spanDigest);return row;
  });
  assert.deepEqual(role.policy,preceding.role.environment.policy);
  // Exact retained input and published role/content; authentication, current
  // workspace, execution basis and admitted role evidence are explicit component
  // premises. This is the real complete renderer, not an installed assembly claim.
  let supplied=input, selectedRole=role;
  const call={cCallRef:'component:retained-design',cCallDigest:hash('component-call'),graphFunctionRef:retained.graphFunctionRef,
    programLocusRef:stage.authorLocusRef,inputContractRef:R.envelopeContractRef,implementationRef:R.authorImplementationRef};
  const owner={role:'author',stage,lifecycle:input.current.declaration,events:[],call,inputDigest:hash(input),inputRef:retained.rawInputAdmissionRef,
    execution:{...retained,invocationAdmissionRef:retained.invocationAdmissionRef}};
  const stdo=()=>({invocationAdmissionRef:retained.invocationAdmissionRef,environmentRef:'component:retained-role',environmentDigest:hash('component-environment'),evidenceDigest:hash('component-evidence'),
    role:'author',policy:selectedRole.policy,contextPolicy:selectedRole.contextPolicy,contextPolicyDigest:hash(selectedRole.contextPolicy),frameRefs:selectedRole.frameRefs,sourceContent,accessContent:preceding.evidence.environmentAccess});
  const componentOwner=await component('abg/instruction_assembly',{
    './execution_basis.js':{constructNativeInstructionAssemblyBasis:b=>b},
    './semantic_job.js':{authenticateSemanticJobBasis:()=>owner},
    './semantic_revision.js':{semanticJobRevisionInputMatchesBasis:()=>true,projectJobRevisionSubject:()=>({currentWorksite:null,origins:[]})},
    './stdo_environment.js':{projectRunEnvironmentRoleEvidence:stdo},
    '../gtl/c_algebra.js':{cLeafTerms:()=>[{programLocusRef:call.programLocusRef}]},
    '../gtl/stdo_run_environment.js':{nativeContextLeafFamily:()=> 'author'},
  });
  const basis={publication,graphFunction:{template:{nodes:[{term:{}}]}},cCall:call,predecessorPrefix:{fixture:true}};
  const assemble=()=>componentOwner.evaluateNativeInstructionAssembly(basis,supplied);
  const before=hash(input),assembly=assemble();assert.equal(assembly.kind,'native_instruction_assembly');assert.equal(hash(input),before);
  const sections=assembly.envelope.sections;
  // DR01: use the real rendered revision domain at the actual completion
  // seam. Prefix/role authentication remains the disclosed premise above;
  // neither this complete component response nor the old partial provider
  // response is admitted runtime evidence.
  const contract=sections.role.actorContract,ordinary=job.projectSemanticJobActorContract(input.current,stage.declarationRef,'author');
  assert.equal(contract.requirementRefs.length,29);assert.equal(ordinary.requirementRefs.length,15);
  assert.equal(contract.requirementRefs[14],'requirement://abiogenesis/semantic-job/6cec93b453f2df9b331e5908febb36e581998805218c49fab406ce4e9370a287');
  assert.equal(ordinary.requirementRefs[14],'requirement://abiogenesis/semantic-job/db07c18d91f1dcee127290132e58619874224e0edc21af9af0b29245818242ff');
  const retainedPrompt=process.env.ABI5_NATIVE_D2_DESIGN_RESPONSE_PROMPT;
  if(retainedPrompt){
    const bytes=fs.readFileSync(retainedPrompt);assert.equal(sha256Bytes(bytes),'sha256:6b3e7830ec5a8b06d126d36daf73ee22869cda649ce76871c210a127c0a6332d');
    const parts=bytes.toString('utf8').split(/^## (\w+)\n/m),actual=Object.fromEntries(Array.from({length:(parts.length-1)/2},(_,i)=>[parts[i*2+1],JSON.parse(parts[i*2+2])]));
    assert.equal(hash(contract),hash(actual.role.actorContract),'same complete contract as the retained failed core31 Design request');
  }
  assert.equal(assembly.request.responseJsonSchema.properties.kind.const,'semantic_job_design_response');
  const {default:Ajv}=await import('ajv'),validate=new Ajv({strict:false}).compile(assembly.request.responseJsonSchema);
  const indices=rows=>rows.map((_,i)=>i).reverse(),cap=input.current.job.worksiteScope.executableCapabilities[0];
  const path=name=>input.current.job.worksiteScope.writeRoots[0]==='.'?name:input.current.job.worksiteScope.writeRoots[0]+'/'+name;
  const opaque={requirementRefs:[0,'literal'],bindingVersionRefs:[900],sourceQuotes:[{memberRef:900,quote:'not a source quote'}],
    kind:'semantic_revision_envelope',base64:'YQ==',payload:'literal',encoding:'base64',evaluationData:{untouched:true}};
  const response={kind:'semantic_job_design_response',schemaVersion:'5.0.0',bindings:[],asset:{kind:'semantic_stage_asset_candidate',schemaVersion:'5.0.0',
    statements:[{statementRef:'component:revision-design-statement',text:'Preserve authored prose, quotes and ordered choices.',modality:'supporting',
      sourceQuotes:[{memberRef:0,quote:Buffer.from(input.current.job.members[0].base64,'base64').toString('utf8')}],
      requirementRefs:[14,...indices(contract.requirementRefs).filter(i=>i!==14)],obligationRefs:indices(contract.obligationRefs),predecessorStatementRefs:indices(contract.predecessorStatementRefs)}],
    requirementCandidates:[],worksiteDesign:null,pressure:[{pressureRef:'component:revision-pressure',text:'Retain every version without claiming it satisfied.',requirementRefs:indices(contract.requirementRefs),disposition:'unassessed'}]},
    design:{targets:['implementation','verifier'].map(role=>({relativePath:path(role+'.mjs'),role,obligationRefs:indices(contract.obligationRefs),bindingVersionRefs:indices(contract.design.active),changeInstruction:'Retain the exact selected meanings.'})),
      dependencyPaths:[],dependencyDisposition:'sufficient',commands:[{commandId:'component:check',executable:cap.executable,args:['requirementRefs','0'],relativeCwd:cap.relativeCwdRoots[0],environment:{},timeoutMs:100,terminationGraceMs:1,expectedReports:[]}],
      outcomePredicates:[{predicateId:'component:opaque',predicateKind:'module_export_return_exact',declaration:{path:path('implementation.mjs'),export:'inspect',equals:opaque}}]}};
  assert.equal(validate(response),true,JSON.stringify(validate.errors));
  const canonical=structuredClone(response);canonical.kind='semantic_job_asset_candidate';
  for(const s of canonical.asset.statements){s.requirementRefs=s.requirementRefs.map(i=>contract.requirementRefs[i]);s.obligationRefs=s.obligationRefs.map(i=>contract.obligationRefs[i]);s.predecessorStatementRefs=s.predecessorStatementRefs.map(i=>contract.predecessorStatementRefs[i]);for(const q of s.sourceQuotes)q.memberRef=contract.sourceMemberRefs[q.memberRef];}
  for(const p of canonical.asset.pressure)p.requirementRefs=p.requirementRefs.map(i=>contract.requirementRefs[i]);
  for(const target of canonical.design.targets){target.obligationRefs=target.obligationRefs.map(i=>contract.obligationRefs[i]);target.bindingVersionRefs=target.bindingVersionRefs.map(i=>contract.design.active[i].versionRef);}
  const expanded=job.materializeSemanticJobDesignResponse(input,stage.declarationRef,response);
  assert.equal(canonicalJson(expanded),canonicalJson(canonical),'all typed identities/order and opaque data round-trip byte-identically');
  assert.deepEqual(expanded.design.outcomePredicates[0].declaration.equals,opaque);
  assert.equal(job.materializeSemanticJobDesignResponse(input.current,stage.declarationRef,response),null,'ordinary 15-entry domain cannot consume this 29-entry revision response');
  assert.equal(canonical.asset.statements[0].requirementRefs[0],contract.requirementRefs[14]);
  assert(canonical.asset.pressure[0].requirementRefs.some(ref=>!ordinary.requirementRefs.includes(ref)),'retained-only choices remain available');
  const impl=await component('implementation/semantic_revision',{'../abg/semantic_job.js':{authenticateSemanticJobBasis:()=>owner}});
  const prepared=impl.realizeSemanticRevisionAuthor(input,{semanticStageBasis:basis,cCallRef:call.cCallRef},()=>assembly);
  const observation={disposition:'success',promptDigest:assembly.manifest.promptDigest,toolCallCount:0,inputDigest:owner.inputDigest,implementationRef:call.implementationRef,
    actorRef:S.workerActorRef,workerBindingRef:S.workerBindingRef,transportLane:'closed_prompt_proof',actorInvocationRef:'component:revision-author',transportDigest:hash('component:revision-transport'),finalOutput:JSON.stringify(response)};
  const complete=(raw=response,o={})=>prepared.complete({request:assembly.request,observation:{...observation,finalOutput:JSON.stringify(raw),...o}});
  const completed=complete();assert.equal(completed.disposition,'success');
  const provenance={cCallRef:call.cCallRef,inputDigest:owner.inputDigest,actorInvocationRef:observation.actorInvocationRef,promptDigest:observation.promptDigest,transportDigest:observation.transportDigest};
  assert.equal(hash(completed.resultCandidate),hash(revision.deriveJobRevisionAsset(input,stage.declarationRef,canonical,provenance)));
  assert.equal(hash(completed.resultCandidate.current.assets.slice(0,-1)),hash(input.current.assets));
  assert.equal(completed.resultCandidate.current.assets.at(-1).assessment,null,'independent assessment remains required');
  assert.deepEqual(completed.resultCandidate.current.assets.at(-1).candidate,canonical);
  assert.equal(complete(canonical).disposition,'failure','no raw canonical fallback for the selected typed transport');
  assert.equal(complete(response,{disposition:'failure'}).disposition,'failure','failed provider output is never salvaged');
  assert.equal(complete(response,{finalOutput:'{"kind":'}).disposition,'failure','partial JSON is never salvaged');
  for(const key of ['promptDigest','inputDigest','implementationRef','actorRef','workerBindingRef','transportLane'])assert.equal(complete(response,{[key]:'wrong:'+key}).disposition,'failure',key);
  assert.equal(prepared.complete({request:{...assembly.request,inputDigest:hash('wrong-input')},observation}).disposition,'failure');
  for(const mutate of [
    r=>{r.asset.statements[0].requirementRefs=[29];},r=>{r.asset.pressure[0].requirementRefs=[29];},
    r=>{r.asset.statements[0].obligationRefs=[contract.obligationRefs.length];},r=>{r.asset.statements[0].predecessorStatementRefs=[contract.predecessorStatementRefs.length];},
    r=>{r.asset.statements[0].sourceQuotes[0].memberRef=contract.sourceMemberRefs.length;},r=>{r.design.targets[0].bindingVersionRefs=[contract.design.active.length];},
    ...[-1,0.5,'14',null].map(value=>r=>{r.asset.statements[0].requirementRefs=[value];}),r=>{r.extra=true;},
  ]){const bad=structuredClone(response);mutate(bad);assert.equal(job.materializeSemanticJobDesignResponse(input,stage.declarationRef,bad),null);assert.equal(complete(bad).disposition,'failure');}
  const malformed={...input,revisionBasis:{...input.revisionBasis,basisDigest:hash('wrong-revision')}};
  assert.equal(job.materializeSemanticJobDesignResponse(malformed,stage.declarationRef,response),null);
  assert.equal(job.materializeSemanticJobDesignResponse(input,input.current.declaration.stages[2].declarationRef,response),null);
  const uncovered=structuredClone(response);uncovered.design.targets.pop();
  assert(job.materializeSemanticJobDesignResponse(input,stage.declarationRef,uncovered));assert.equal(complete(uncovered).disposition,'failure','materialization does not waive canonical coverage');
  assert.equal(hash(input),before,'completion preserves the exact input');
  t.diagnostic(JSON.stringify({scope:'DR01 component completion, upstream admission/role premises supplied; no failed-output reuse',revisionRequirementDomain:contract.requirementRefs.length,ordinaryRequirementDomain:ordinary.requirementRefs.length,
    exactRetainedPromptContractCompared:Boolean(retainedPrompt),typedResponseBytes:Buffer.byteLength(canonicalJson(response)),canonicalResponseBytes:Buffer.byteLength(canonicalJson(canonical))}));
  assert.deepEqual(sections.task.historicalAssets,input.revisionBasis.historicalAssets);
  assert.deepEqual(sections.task.revisionContext.historicalAssets,{presentationRef:'#/task/historicalAssets',materialDigest:hash(input.revisionBasis.historicalAssets)});
  const versions=sections.task.historicalAssets.filter(a=>a.stageRef===input.current.assets.at(-1).stageRef);
  assert.equal(versions.length,2);assert.deepEqual(versions.map(a=>a.assessment.disposition),['falsified','satisfied']);
  assert.notEqual(versions[0].assetDigest,versions[1].assetDigest,'distinct rejected and accepted versions are never collapsed');
  for(const asset of [...parent.revisionBasis.historicalAssets,...parent.current.assets])assert(sections.task.historicalAssets.some(h=>hash(h)===hash(asset)));
  const resolveMaterial=row=>{
    if(row.presentationRef===undefined)return row;
    assert.match(row.presentationRef,/^#\/task\/historicalAssets\/\d+$/);
    const material=row.presentationRef.slice(2).split('/').reduce((value,key)=>value[key],sections);
    assert(material);assert.equal(hash(material),row.materialDigest);return material;
  };
  assert.deepEqual(sections.predecessors.map(resolveMaterial),input.current.assets.filter(a=>stage.predecessorStageRefs.includes(a.stageRef)));
  assert(sections.predecessors.every(row=>row.presentationRef),'all identical current predecessors share exact complete history material');
  assert(!sections.predecessors.map(resolveMaterial).some(asset=>asset.assessment.disposition!=='satisfied'));
  assert.equal(assembly.manifest.contextDispositions.revisionAssetMaterial,'complete_typed_assets_shared_with_history_by_exact_value');
  for(let i=0;i<input.current.context.entries.length;i++){
    const original=input.current.context.entries[i],shown=sections.worksite.observation.entries[i];
    if(original.state!=='file'){assert.deepEqual(shown,original);continue;}
    const {bytes,encoding,...identity}=original,{textView,sourceEncoding,...shownIdentity}=shown;
    assert.deepEqual(shownIdentity,identity);assert.equal(sourceEncoding,encoding);
    assert.deepEqual(Buffer.from(textView.text),Buffer.from(bytes,'base64'));assert.equal(textView.digest,original.digest);assert.equal(textView.byteLength,original.byteLength);
  }
  const actualBytes=Buffer.byteLength(assembly.request.prompt);assert.equal(assembly.manifest.promptByteCount,actualBytes);assert(actualBytes<=stage.assembly.maxPromptBytes);
  t.diagnostic(JSON.stringify({scope:'actual pure Product successor; upstream authentication/currentness/role evidence and future coordinates supplied',parentInputDigest:hash(parent),componentSuccessorDigest:hash(input),
    promptBytes:actualBytes,maxPromptBytes:stage.assembly.maxPromptBytes,headroomBytes:stage.assembly.maxPromptBytes-actualBytes,
    historyAssets:input.revisionBasis.historicalAssets.length,sharedPredecessors:sections.predecessors.length,
    sections:Object.fromEntries(Object.entries(sections).map(([k,v])=>[k,Buffer.byteLength(canonicalJson(v))])),roleSourceSpans:sourceContent.length}));
  supplied=parent;
  const previous=assemble();assert.equal(previous.kind,'native_instruction_assembly');
  const unshared=previous.envelope.sections.predecessors.find(a=>a.assetRef===parent.current.assets.at(-1).assetRef);
  assert.deepEqual(unshared,parent.current.assets.at(-1),'same stage with a distinct historical version retains complete accepted material, never a digest-only/lossy alias');
  assert.notEqual(hash(unshared),hash(parent.revisionBasis.historicalAssets.at(-1)));supplied=input;
  assert.deepEqual(sections.task.taskData,input.current.job.taskData,'ordinary domain task JSON is unchanged');
  selectedRole={...role,contextPolicy:{...role.contextPolicy,selectors:role.contextPolicy.selectors.filter(s=>s!=='current_worksite')}};
  assert.equal(assemble().cause,'unavailable_required_content');selectedRole=role;
  supplied={...input,current:{...input.current,context:null}};assert.equal(assemble().cause,'unavailable_required_content');supplied=input;
  supplied=input;selectedRole={...role,policy:{...role.policy,text:role.policy.text+'x'.repeat(stage.assembly.maxPromptBytes)}};
  // Oversized required role-content premise; no new declared bound or raw ingress waiver.
  assert.equal(assemble().cause,'declared_bound_overflow','same declared bound still refuses an oversized complete presentation');
});
