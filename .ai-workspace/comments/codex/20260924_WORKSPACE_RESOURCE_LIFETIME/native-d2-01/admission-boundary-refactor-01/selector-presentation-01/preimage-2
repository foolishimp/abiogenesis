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
