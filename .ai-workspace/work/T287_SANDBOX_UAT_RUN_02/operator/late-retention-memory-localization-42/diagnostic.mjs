import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, lstatSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import v8 from 'node:v8';
import inspector from 'node:inspector';

const phase = fileURLToPath(new URL('.', import.meta.url));
const prep = JSON.parse(readFileSync(phase + 'preparation.json', 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function checked(pin) {
  const st = lstatSync(pin.path); assert(st.isFile() && !st.isSymbolicLink());
  const b = readFileSync(pin.path); assert.equal(b.length, pin.byteCount); assert.equal(sha(b), pin.sha256);
  return b;
}
const owner39 = JSON.parse(checked(prep.owner39Preparation));
const triples = owner39.ownerPins.concat(prep.extraRequiredOwnerTriples);
for (const row of triples) { checked(row.source); assert(checked(row.built).equals(checked(row.installed))); }
for (const pin of Object.values(prep.closedRefs)) checked(pin);
const owner = name => pathToFileURL(triples.find(row => row.source.path.endsWith('/' + name + '.ts')).installed.path);
const { sha256Canonical } = await import(owner('shared/digests'));
const { captureDurablePrefixCoordinate, validateDurablePrefixCoordinate, readRuntimeEventsAtDurablePrefix } = await import(owner('abg/event_store'));
const { selectValidatedRuntimeEventPrefix, runtimeEventsFromValidatedPrefix } = await import(owner('abg/event_prefix'));
const { ownedRuntimeDerivationSource } = await import(owner('abg/runtime_derivation'));
const { rehydrateExecutionBasisAtPrefix, hasAdmittedExecutionBasisAtPrefix } = await import(owner('abg/execution_basis'));
const { materializeGraph, isMaterializedGtlGraph } = await import(owner('gtl/materialize'));
const { resolveCProgramTermAtSourcePath } = await import(owner('gtl/source_path'));
const { projectOpenedCCallTraversalInputAtPrefix, hasAdmittedTraversalCursorAtPrefix } = await import(owner('abg/traversal_cursor'));
const { projectOpenedCCallCarrierAtPrefix, projectAdmittedCCallStateAtPrefix } = await import(owner('abg/c_call'));
const { deriveRetainedCCallInputAtPrefix } = await import(owner('abg/traversal_route'));
const { resolveProgramDeclarationClosure } = await import(owner('product/declaration_closure'));
const { constructCatalogProgramValidationInput } = await import(owner('product/catalog_operations'));
const { validateProgram, isProgramValidation } = await import(owner('validator/validation'));
assert.equal(typeof global.gc, 'function');
const prefixCoordinate = captureDurablePrefixCoordinate(JSON.parse(checked(prep.selectedCoordinate)));
assert(validateDurablePrefixCoordinate(prefixCoordinate));
const started = new Date().toISOString(), t0 = performance.now(), samples = [];
let lastStage = 'owners_loaded';
function sample(label) { const row = { label, elapsedMs: performance.now() - t0,
  ...process.memoryUsage(), heapSizeLimit: v8.getHeapStatistics().heap_size_limit }; samples.push(row); return row; }
async function collect(label) { await new Promise(resolve => setImmediate(resolve)); global.gc(); global.gc(); return sample(label); }
function checkpoint(stage, facts = {}) { lastStage = stage; const row = { stage, at: new Date().toISOString(), ...facts };
  writeFileSync(phase + 'progress.jsonl', JSON.stringify(row) + '\n', { flag: 'a' }); console.log(JSON.stringify(row)); }
function requireValue(value, relation) { if (value === null || value === undefined) throw new TypeError('missing owner-rehydration relation: ' + relation); return value; }
const baseline = await collect('owners_loaded');
const sampler = { samplingInterval: 1048576, includeObjectsCollectedByMajorGC: true,
  includeObjectsCollectedByMinorGC: true, cumulativeAllocationsNotLiveRetainers: true };
const session = new inspector.Session(); session.connect();
const post = (method, params = {}) => new Promise((resolve, reject) => session.post(method, params,
  (error, value) => error ? reject(error) : resolve(value)));
let sampling = false;
try { await post('HeapProfiler.startSampling', { samplingInterval: sampler.samplingInterval,
  includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true }); sampling = true; sampler.available = true;
} catch (error) { sampler.available = false; sampler.error = String(error); }
async function closeSampling() {
  if (sampling) {
    sampling = false;
    try {
      const { profile } = await post('HeapProfiler.stopSampling'); const rows = [];
      function walk(node) { if (node.selfSize > 0) rows.push({ selfSize: node.selfSize, nodeId: node.id,
        functionName: node.callFrame.functionName, url: node.callFrame.url, zeroBasedLineNumber: node.callFrame.lineNumber });
        for (const child of node.children ?? []) walk(child); }
      walk(profile.head); rows.sort((a,b) => b.selfSize - a.selfSize);
      sampler.sampleCount = profile.samples.length; sampler.topAttributions = rows.slice(0,40);
      sampler.aggregateSelfSize = rows.reduce((sum,row) => sum + row.selfSize,0);
      const raw = JSON.stringify({ settings: sampler, profile });
      writeFileSync(phase + 'allocation-sampling.json', (Buffer.byteLength(raw) <= 2097152 ? raw : JSON.stringify(sampler)) + '\n', { flag: 'wx' });
      sampler.smallRawProfileWritten = Buffer.byteLength(raw) <= 2097152;
    } catch (error) { sampler.collectionError = String(error); }
  }
  session.disconnect();
}

// Every event/vector/guard input remains local to this function. Only an exact
// owned output, disposable source, WeakRefs and scalar/digest facts escape.
async function exerciseOnce() {
  checkpoint('static_program_validation_start');
  const sourceRequest = JSON.parse(checked(prep.conformanceSource));
  const resources = sourceRequest.invocation.resources;
  const declaration = resources.declarationCatalog;
  const closure = resolveProgramDeclarationClosure(declaration.catalog, declaration.catalogView, resources.packet.program.programRef);
  assert.equal(closure.kind, 'resolved_program_declaration_closure');
  const validationInput = constructCatalogProgramValidationInput(declaration.catalog, declaration.catalogView, closure, resources.packet.program);
  if (validationInput.kind === 'raw_admission_refusal') throw new TypeError(validationInput.message);
  const validation = validateProgram(validationInput);
  assert(isProgramValidation(validation), 'existing static ProgramValidation owner refused original declarations');
  const declarationFunctions = closure.publications.flatMap(publication => publication.graphFunctions);
  checkpoint('static_program_validation_rehydrated', { validationRef: validation.validationRef });
  const beforeAcquisition = await collect('before_one_cold_acquisition');
  const t = performance.now();
  const events = readRuntimeEventsAtDurablePrefix(prefixCoordinate, { requireCurrent: true });
  const acquisitionWallMs = performance.now() - t;
  assert.equal(events.length, prep.expectedEventCount);
  const acquired = sample('cold_acquisition_returned');
  checkpoint('cold_acquisition_returned', { eventCount: events.length, acquisitionWallMs, memory: acquired });
  await collect('cold_events_retained');
  checkpoint('prefix_authentication_start');
  const authorityPrefix = selectValidatedRuntimeEventPrefix(events);
  const context = requireValue(ownedRuntimeDerivationSource(runtimeEventsFromValidatedPrefix(authorityPrefix)), 'owned prefix derivation source');
  const sourceResultEvent = events.find(event => event.admissionOrdinal === prep.targetResultOrdinal);
  const judgmentEvent = events.find(event => event.admissionOrdinal === prep.targetJudgmentOrdinal);
  assert.equal(sourceResultEvent.kind, 'c_call_result_admitted'); assert.equal(judgmentEvent.kind, 'c_call_judged');
  const cCallRef = judgmentEvent.payload.cCallRef;
  assert.equal(cCallRef, sourceResultEvent.payload.cCallRef);
  assert.equal(sourceResultEvent.runId, prep.runRef);
  const opened = requireValue(events.find(event => event.kind === 'c_call_opened' && event.aggregateId === cCallRef), 'exact workflow opened event');
  const basis = requireValue(rehydrateExecutionBasisAtPrefix(authorityPrefix, opened.basisId), 'ExecutionBasis from complete prefix');
  assert(hasAdmittedExecutionBasisAtPrefix(authorityPrefix,basis));
  assert.equal(validation.validationRef, basis.programValidationRef);
  const gfRows = declarationFunctions.filter(gf => gf.name === basis.graphFunctionRef && sha256Canonical(gf) === basis.graphFunctionDigest);
  assert.equal(gfRows.length,1); const gf = gfRows[0];
  const graph = materializeGraph(gf, { invocationAdmissionRef: basis.invocationAdmissionRef,
    admittedInputRef: basis.rawInputAdmissionRef, admittedInputDigest: basis.rawInputDigest, admittedInput: basis.rawInputValue });
  assert(isMaterializedGtlGraph(graph)); assert.equal(graph.materializationRef,basis.graphRef); assert.equal(graph.materializationDigest,basis.graphDigest);
  const traversal = requireValue(projectOpenedCCallTraversalInputAtPrefix(authorityPrefix,graph,cCallRef), 'source cursor/input from opened C_Call');
  const cursor = traversal.cursor; assert(hasAdmittedTraversalCursorAtPrefix(authorityPrefix,cursor));
  const term = resolveCProgramTermAtSourcePath(graph.template,cursor.currentNodeRef,cursor.termPath);
  assert.equal(term.kind,'c_workflow');
  const childRows = declarationFunctions.filter(g => g.name === term.graphFunctionRef && validation.graphFunctionDigests.includes(sha256Canonical(g)));
  assert.equal(childRows.length,1);
  const call = requireValue(projectOpenedCCallCarrierAtPrefix(authorityPrefix,graph,cCallRef,cursor,gf,childRows[0],validation), 'exact workflow C_Call owner');
  // These are serialized authentic event carriers, consumed by the existing
  // strict cold outcome projector; no nominal marker is manufactured.
  const outcome = requireValue(projectAdmittedCCallStateAtPrefix(authorityPrefix,call,
    { ...sourceResultEvent.payload, kind:'admitted_c_call_result',schemaVersion:'5.0.0',disposition:'admitted',admissionEventRef:sourceResultEvent.eventId },
    { ...judgmentEvent.payload,kind:'admitted_c_call_judgment',schemaVersion:'5.0.0',disposition:'admitted',admissionEventRef:judgmentEvent.eventId }), 'strict successful advance outcome');
  assert.equal(outcome.result.resultClass,'success'); assert.equal(outcome.judgment.judgment,'advance');
  assert.equal(outcome.result.valueDigest,prep.targetValueDigest);
  assert.equal(outcome.result.value.kind,'governance_work_state'); assert.equal(outcome.result.value.observations.length,27);
  assert.equal(outcome.result.value.terminal,false);
  const rehydrated = await collect('prefix_and_all_exact_guard_inputs_retained');
  checkpoint('retention_boundary_ready',{ cCallRef,basisRef:basis.basisRef,cursorRef:cursor.cursorRef,
    resultRef:outcome.result.resultRef,judgmentRef:outcome.judgment.judgmentRef, memory:rehydrated });
  const rt = performance.now();
  const output = requireValue(deriveRetainedCCallInputAtPrefix(authorityPrefix,basis,graph,cursor,call,outcome.result,outcome.judgment), 'next ordinary retained input');
  const retentionWallMs = performance.now() - rt;
  const returned = sample('actual_retained_input_return');
  assert.equal(output.input.subjectDigest,sha256Canonical(output.input.value));
  assert.equal(output.input.value.source.kind,'governance_work_state');
  assert.equal(sha256Canonical(output.input.value.source),outcome.result.valueDigest);
  assert.equal(sha256Canonical(output.input.value.entry),basis.rawInputDigest);
  assert.equal(output.input.value.source.observations.length,27); assert.equal(output.input.value.source.terminal,false);
  assert.deepEqual(output.input.value.source.unresolvedSupportRefs,outcome.result.value.unresolvedSupportRefs);
  assert.equal(output.input.admissionRef,'raw-admission://abiogenesis/' + sha256Canonical({contractRef:output.input.contractRef,expectedKind:'invocation_input',subjectDigest:output.input.subjectDigest}).slice(7));
  const after = await collect('retained_input_and_guard_inputs_after_collection');
  const facts = { acquisitionWallMs,retentionWallMs,eventCount:events.length,
    beforeAcquisition,acquired,rehydrated,returned,after,
    basisRef:basis.basisRef,graphRef:graph.materializationRef,graphDigest:graph.materializationDigest,
    cursorRef:cursor.cursorRef,cursorDigest:cursor.cursorDigest,cCallRef:call.cCallRef,
    resultRef:outcome.result.resultRef,resultDigest:outcome.result.resultDigest,resultAdmissionRef:outcome.result.admissionEventRef,
    judgmentRef:outcome.judgment.judgmentRef,judgmentAdmissionRef:outcome.judgment.admissionEventRef,
    validationRef:validation.validationRef,retainedAdmissionRef:output.input.admissionRef,retainedSubjectDigest:output.input.subjectDigest,
    retainedContractRef:output.input.contractRef,retainedValueKind:output.input.value.kind,
    entryDigest:basis.rawInputDigest,sourceDigest:outcome.result.valueDigest,
    sourceObservationCount:27,sourceTerminal:false,unresolvedSupportRefs:[...outcome.result.value.unresolvedSupportRefs],
    causationEventRefs:[...output.causationEventRefs], originalDigest:sha256Canonical(outcome.result.value.original),
    lastEventId:events.at(-1).eventId,lastOrdinal:events.at(-1).admissionOrdinal };
  checkpoint('retention_boundary_returned',{retentionWallMs,retainedSubjectDigest:output.input.subjectDigest,memory:after});
  return { output,context,facts,weakAuthorityVector:new WeakRef(runtimeEventsFromValidatedPrefix(authorityPrefix)),
    weakLastEvent:new WeakRef(events.at(-1)),weakOutput:new WeakRef(output),weakRawValue:new WeakRef(output.input.value) };
}

let lease;
let report;
try {
  lease = await exerciseOnce();
  const held = await collect('closed_caller_scope_output_and_context_deliberately_held');
  lease.output = undefined;
  const callerReleased = await collect('closed_caller_scope_output_released_context_held');
  const outputRetainedByContext = lease.weakOutput.deref() !== undefined;
  lease.context.invalidate();
  const contextInvalidated = await collect('existing_disposable_derivation_context_invalidated');
  const outputAfterInvalidation = lease.weakOutput.deref() !== undefined;
  const lastEventAfterInvalidation = lease.weakLastEvent.deref() !== undefined;
  lease.context = undefined;
  const contextReleased = await collect('derivation_context_reference_released');
  const finalWeakFacts = { outputReachable:lease.weakOutput.deref() !== undefined,rawValueReachable:lease.weakRawValue.deref() !== undefined,
    authorityVectorReachable:lease.weakAuthorityVector.deref() !== undefined,lastEventReachable:lease.weakLastEvent.deref() !== undefined };
  await closeSampling();
  const st = lstatSync(fileURLToPath(prefixCoordinate.eventLogRef),{bigint:true});
  assert.equal(st.dev,BigInt(prep.storeBefore.device));assert.equal(st.ino,BigInt(prep.storeBefore.inode));assert.equal(st.size,BigInt(prep.storeBefore.byteCount));assert.equal(st.mtimeNs.toString(),prep.storeBefore.mtimeNs);
  report = {kind:'single_authentic_late_retention_boundary_diagnostic',started,completed:new Date().toISOString(),wallMs:performance.now()-t0,
    baseline,prefixCoordinate,ownerFacts:lease.facts,held,callerReleased,contextInvalidated,contextReleased,
    outputRetainedByContext,outputAfterInvalidation,lastEventAfterInvalidation,finalWeakFacts,samples,sampler,
    noHeapOverride:true,noSecondAcquisitionReplayRouteAdmissionRecoveryOrNativeEffects:true,
    scopeLimit:'One cold authentic boundary, not the historical live-process retainer graph. Deliberate context invalidation is disposable computation only, no runtime currentness/authority.'};
  lease = undefined;
  checkpoint('complete',{finalWeakFacts,memory:contextReleased});
} catch(error) {
  const failedStage = lastStage;
  await closeSampling();
  report={kind:'single_late_boundary_diagnostic_stopped',started,completed:new Date().toISOString(),wallMs:performance.now()-t0,
    failedStage,failure:{name:error?.name,message:String(error),stack:error?.stack},baseline,prefixCoordinate,samples,sampler,
    noRetryOrAlternateGuard:true,noReplayRecoveryRuntimeOrApplicationEffects:true};
  checkpoint('stopped',{failedStage,name:error?.name,message:String(error)});process.exitCode=1;
}
writeFileSync(phase+'measurement.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
