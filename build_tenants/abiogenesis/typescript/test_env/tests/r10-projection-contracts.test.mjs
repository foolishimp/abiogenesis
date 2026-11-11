import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import * as v from 'valibot';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
import {ABG_PROJECT_READ_CONTRACTS} from '../../build/code/src/abg/project_read_operation_contracts.js';
import {projectAbgReadOutput} from '../../build/code/src/abg/project_read_definition_bindings.js';
import {RunProjectionPort,GraphCallProjectionPort,projectRunTruthAtDurablePrefix} from '../../build/code/src/abg/project_read_ports.js';
import {constructRunInvocationOutcome} from '../../build/code/src/product/run_invocation_operation.js';
import {ABG_TYPED_TERMINAL_RESULT_SCHEMA} from '../../build/code/src/abg/terminal_result_contracts.js';
import {projectAdmittedCCallStateAtPrefix} from '../../build/code/src/abg/c_call.js';
import {readRuntimeEventsAtDurablePrefix} from '../../build/code/src/abg/event_store.js';
import {selectValidatedRuntimeEventPrefix,validatedRuntimeEventPrefixThroughEvent} from '../../build/code/src/abg/event_prefix.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {PUBLIC_FUNCTION_DEFINITION_FAMILY,PUBLIC_OPERATION_CONTRACT_PROJECTIONS} from '../../build/code/src/public/binding/public_function_family.js';
import {ROOT_EVENT_CONTRACT_DIGEST,projectRuntimeEventFromValidatedHistory} from '../../build/code/src/abg/event_store.js';
import {constructRuntimeSystemProbeContract} from '../../build/code/src/abg/runtime_liveness_contracts.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {eventsInput,eventLogPath,historical,reopenPackagedS01Store,s01Skip as skip} from '../fixtures/r10-projection-family/s01-store.mjs';
// Integration relocates test source only. The S01 store (under the evidence
// root; s01-store.mjs) is reopened once by the store owner to obtain this file's
// coordinate and closed with no append; no Public invocation or application
// effect is selected. Without the root every case that reads it skips.
let prefix,events,run,graph,truth;
if(!skip){
  const reopened=reopenPackagedS01Store(historical.reopenAuthority.eventContractDigest);
  assert.ok(reopened.prefix,JSON.stringify(reopened));
  prefix=reopened.prefix;events=readRuntimeEventsAtDurablePrefix(prefix);
  run=events.find(e=>e.kind==='run_segment_opened').runId;graph=events.find(e=>e.kind==='graph_call_opened').graphCallId;
  truth=projectRunTruthAtDurablePrefix(prefix,run);assert.equal(truth.kind,'abg_run_truth_projection');
}
const packet=(member,target=run)=>({kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey:member,prefix,targetRef:target});
const projection=(member,fromOrdinal=0,limit=1)=>({source:{sourceRef:member.startsWith('graph_call')?graph:run,sourceDigest:member.startsWith('graph_call')?truth.graphCall.digest:truth.run.digest},
  projectionBasis:{projectionBasisRef:prefix.eventLogRef,projectionBasisDigest:prefix.coordinateDigest},selector:{kind:'ordinal_page',fromOrdinal,limit}});
const owners=await privateOwner('abg/project_read_ports.js',['terminalResult']);
const replay=skip?null:RunProjectionPort.run_replay(packet('run_replay'));
if(!skip)assert.equal(replay.kind,'abg_project_read_projection');

test('the retained S01 log is the historical S01 prefix: the owner coordinate keeps its digest, length and profile; the current profile refuses it',{skip},()=>{
  assert.equal(prefix.eventLogRef,pathToFileURL(eventLogPath).href);
  assert.equal(prefix.prefixDigest,historical.prefix.prefixDigest);
  assert.equal(prefix.prefixLength,historical.prefix.prefixLength);
  assert.equal(prefix.storeIdentity.eventContractDigest,historical.prefix.storeIdentity.eventContractDigest);
  const current=reopenPackagedS01Store(ROOT_EVENT_CONTRACT_DIGEST);
  assert.equal(current.kind,'event_store_reopen_refusal',JSON.stringify(current));
  assert.equal(current.code,'invalid_event_history');
});

test('six current owner outputs preserve the same admitted terminal carrier and the 18/56 Public roster',{skip},()=>{
  assert.equal(PUBLIC_OPERATION_CONTRACT_PROJECTIONS.length,18);
  assert.equal(PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.length,56);
  for(const [member,port,target] of [['run_result',RunProjectionPort.run_result,run],['run_replay',RunProjectionPort.run_replay,run],['graph_call_result',GraphCallProjectionPort.graph_call_result,graph],['graph_call_replay',GraphCallProjectionPort.graph_call_replay,graph]]) {
    const actual=port(packet(member,target));assert.equal(actual.kind,'abg_project_read_projection');
    const output=projectAbgReadOutput(ABG_PROJECT_READ_CONTRACTS[member],projection(member),member,actual);
    assert.equal(output.outcomeKind,'result');assert.deepEqual(output.value.projection.terminalResult,truth.terminalResult);
  }
  for(const member of ['invoke','start'])assert.deepEqual(constructRunInvocationOutcome(member,truth).value.terminalResult,truth.terminalResult);
});

test('legal I-JSON null is not absence (pure carrier and replay-row selection, not a new admitted result)',{skip},()=>{
  const terminal={...truth.terminalResult,value:null,valueDigest:sha256Canonical(null)};
  assert.equal(v.safeParse(ABG_TYPED_TERMINAL_RESULT_SCHEMA,terminal).success,true);
  const selected=owners.terminalResult([{routeKind:'terminal',cCallRef:'call:null'}],[{cCallRef:'call:null',resultRef:'result:null',resultDigest:sha256Canonical('result'),resultValue:null}]);
  assert.ok(selected);assert.equal(selected.result.resultValue,null);
  assert.equal(owners.terminalResult([{routeKind:'terminal',cCallRef:'call:null'}],[]),null);
});

test('held/failed/missing terminal truth cannot become a completed Product result',{skip},()=>{
  assert.equal(constructRunInvocationOutcome('start',{...truth,runtimeStatus:'held'}).outcomeKind,'nonterminal');
  const failed=constructRunInvocationOutcome('start',{...truth,runtimeStatus:'failed'});
  assert.equal(failed.value.disposition,'runtime_failed');assert.equal(failed.value.result,null);assert.equal(failed.value.terminalResult,null);
  const blocked=constructRunInvocationOutcome('start',{...truth,runtimeStatus:'blocked'});
  assert.equal(blocked.value.disposition,'blocked');assert.equal(blocked.value.terminalResult,null);
  assert.equal(constructRunInvocationOutcome('start',{...truth,terminalResult:null}).outcomeKind,'refusal');
  assert.equal(constructRunInvocationOutcome('start',{...truth,result:{...truth.result,digest:sha256Canonical('wrong')}}).outcomeKind,'refusal');
});

test('read before Run close is not_ready while the actually closed root GraphCall is independently readable',{skip},()=>{
  const bytes=eventsInput.bytes;
  const selected=Buffer.from(bytes.toString('utf8').trimEnd().split('\n').slice(0,19).join('\n')+'\n');
  const {coordinateDigest:_,...rest}=prefix;
  const body={...rest,prefixLength:selected.length,prefixDigest:'sha256:'+createHash('sha256').update(selected).digest('hex')};
  const before={...body,coordinateDigest:sha256Canonical(body)};
  const notReady=RunProjectionPort.run_result({...packet('run_result'),prefix:before});
  assert.equal(notReady.kind,'abg_project_read_refusal');assert.equal(notReady.code,'target_not_ready');
  const projected=GraphCallProjectionPort.graph_call_result({...packet('graph_call_result',graph),prefix:before});
  assert.equal(projected.kind,'abg_project_read_projection');assert.equal(projected.value.terminalResult.result.ref,truth.result.ref);
});

test('whole-prefix typed replay summary is conserved on first and empty-end pages; invalid offsets and arithmetic refuse',{skip},()=>{
  const count=replay.value.eventAtoms.length;
  for(const offset of [0,count]) {
    const output=projectAbgReadOutput(ABG_PROJECT_READ_CONTRACTS.run_replay,projection('run_replay',offset,1),'run_replay',replay);
    assert.equal(output.outcomeKind,'result');assert.equal(output.value.projection.status,'closed');
    assert.deepEqual(output.value.projection.terminalResult,truth.terminalResult);
  }
  for(const [offset,limit,code] of [[count+1,1,'cursor_invalid'],[Number.MAX_SAFE_INTEGER,1,'range_invalid'],[-1,1,'range_invalid'],[0,0,'range_invalid']]) {
    const output=projectAbgReadOutput(ABG_PROJECT_READ_CONTRACTS.run_replay,projection('run_replay',offset,limit),'run_replay',replay);
    assert.equal(output.outcomeKind,'refusal');assert.equal(output.value.code,code);
  }
});

test('scope and packet crossings refuse; root does not accept a caller declarationProof field',{skip},()=>{
  assert.equal(RunProjectionPort.run_replay({...packet('run_replay'),declarationProof:{}}).code,'invalid_packet');
  assert.equal(RunProjectionPort.run_result({...packet('run_result'),prefix:{...prefix,coordinateDigest:sha256Canonical('wrong')}}).code,'invalid_history');
  assert.equal(GraphCallProjectionPort.graph_call_result(packet('graph_call_result',run)).kind,'abg_project_read_refusal');
  assert.equal(RunProjectionPort.run_result(packet('run_result',graph)).kind,'abg_project_read_refusal');
});

test('a prefix holding a malformed liveness event is not admitted history: Run and workspace reads over it refuse',{skip},async()=>{
  // Component boundary: supply the authenticated immutable-event premise to
  // the read owner. These current-profile variants are unadmitted test data;
  // physical decoding/stamps are exercised by the decoder and body-codec tests.
  // Since RC6 the read owner's preparation takes its rows from the explicit
  // fresh read readOwnedRuntimeEventPrefixAtDurablePrefix (library design
  // §10.4, "Runtime history prefixes and held event resources"), so the
  // premise is supplied there.
  const nativeEvents=deepFreeze(events.map(event=>({...event,eventContractDigest:ROOT_EVENT_CONTRACT_DIGEST})));
  const reader=rows=>privateOwner('abg/project_read_ports.js',['prepareRead'],{
    './event_prefix.js':{readOwnedRuntimeEventPrefixAtDurablePrefix:()=>selectValidatedRuntimeEventPrefix(rows)},
  });
  const original=await reader(nativeEvents);
  const expected=original.RunProjectionPort.run_result(packet('run_result'));
  assert.equal(expected.kind,'abg_project_read_projection');
  const workspace=events.find(event=>event.scopeClass==='workspace').aggregateId;
  const workspaceExpected=original.WorkspaceProjectionPort.workspace_replay(packet('workspace_replay',workspace));
  assert.equal(workspaceExpected.kind,'abg_project_read_projection');
  assert.equal(workspaceExpected.value.eventContractProjection.effectRows.length,nativeEvents.length);
  const malformed=runId=>{
    const scope={basisRef:'basis://scope-control',programRef:'program://scope-control',runId,
      graphFunctionRef:'graph-function://scope-control',graphCallId:'graph-call://scope-control',frameId:'frame://scope-control',
      cCallRef:null,programLocusRef:null,taskOrdinal:null,vectorIndex:null,edgeRef:null,attempt:1,
      actorInvocationRef:null,actorRef:null,workerBindingRef:null,backendRef:null};
    const probeContract=constructRuntimeSystemProbeContract({scope,clockOriginRef:'clock://scope-control',source:'frame_progress',
      sourceRef:'frame://scope-control',declarationEventRef:'event://missing-declaration',required:true});
    const observation={kind:'runtime_probe_observation',schemaVersion:'5.0.0',probeRef:probeContract.probeRef,
      scopeDigest:sha256Canonical(scope),clockOriginRef:probeContract.clockOriginRef,elapsedMs:0,
      underlyingObservationRef:'event://missing-source',underlyingEventRef:'event://missing-source',sourceDigest:sha256Canonical('missing'),
      sourceRevisionDigest:null,evidenceRefs:[],coverage:'observed',signal:'activity'};
    const event=projectRuntimeEventFromValidatedHistory(nativeEvents,{kind:'runtime_activity_probe_observed',eventTime:'2026-09-27T00:00:00.000Z',
      aggregateType:'graph_call',aggregateId:scope.graphCallId,parentAggregateId:runId,causationEventRefs:[],
      correlationId:'correlation://scope-control',workflowVersion:'5.0.0',scopeClass:'run',basisId:scope.basisRef,runId,
      graphFunctionRef:scope.graphFunctionRef,graphCallId:scope.graphCallId,frameId:scope.frameId,payload:{probeContract,observation}});
    return deepFreeze([...nativeEvents,event]);
  };
  // Whole-prefix law: every read replays the complete prefix, so the calculus
  // fold refuses the malformed event whichever Run's scope holds it, and the
  // projector catch of projectPreparedRead (abg/project_read_ports.ts) answers
  // invalid_history for the Run reads and the workspace replay alike.
  const unrelated=await reader(malformed('run://unrelated-scope-control'));
  assert.equal(unrelated.RunProjectionPort.run_result(packet('run_result')).code,'invalid_history');
  assert.equal(unrelated.WorkspaceProjectionPort.workspace_replay(packet('workspace_replay',workspace)).code,'invalid_history');
  const target=await reader(malformed(run));
  assert.equal(target.RunProjectionPort.run_result(packet('run_result')).code,'invalid_history');
  assert.equal(target.RunProjectionPort.run_replay(packet('run_replay')).code,'invalid_history');
});

test('native CCall owner rejects altered value, contract, producer, judgment and pre-result prefix without test-owned admission',{skip},()=>{
  const opened=events.find(e=>e.kind==='c_call_opened'),fibre=events.find(e=>e.kind==='c_call_fibre_selected');
  const resultEvent=events.find(e=>e.kind==='c_call_result_admitted'),judgmentEvent=events.find(e=>e.kind==='c_call_judged');
  const call={...opened.payload,...fibre.payload,kind:'c_call',schemaVersion:'5.0.0',runId:opened.runId,
    childGraphFunctionRef:null,failureContractRef:'',openedEventRef:opened.eventId,fibreSelectedEventRef:fibre.eventId};
  const result={...resultEvent.payload,kind:'admitted_c_call_result',schemaVersion:'5.0.0',disposition:'admitted',admissionEventRef:resultEvent.eventId};
  const judgment={...judgmentEvent.payload,kind:'admitted_c_call_judgment',schemaVersion:'5.0.0',disposition:'admitted',admissionEventRef:judgmentEvent.eventId};
  const selected=selectValidatedRuntimeEventPrefix(events);
  assert.ok(projectAdmittedCCallStateAtPrefix(selected,call,result,judgment));
  for(const changed of [{...result,value:{kind:'spoof'}},{...result,contractRef:'contract://foreign'},{...result,cCallRef:'c-call:foreign'}])
    assert.equal(projectAdmittedCCallStateAtPrefix(selected,call,changed,judgment),null);
  assert.equal(projectAdmittedCCallStateAtPrefix(selected,call,result,{...judgment,resultRef:'result://foreign'}),null);
  assert.equal(projectAdmittedCCallStateAtPrefix(validatedRuntimeEventPrefixThroughEvent(selected,fibre.eventId),call,result,judgment),null);
});

test('the shared mapper rejects crossed result aliases and keeps failed-command observation data verbatim',{skip},()=>{
  const actual=RunProjectionPort.run_result(packet('run_result'));
  const crossed={...actual,value:{...actual.value,admittedResult:{...actual.value.admittedResult,resultRef:'result://foreign'}}};
  assert.throws(()=>projectAbgReadOutput(ABG_PROJECT_READ_CONTRACTS.run_result,projection('run_result'),'run_result',crossed),/terminal owner coordinates/);
  const observation={kind:'mechanical_failed_command_observation',commandResults:[{exitStatus:1}]};
  const carrier={...truth.terminalResult,value:observation,valueDigest:sha256Canonical(observation)};
  assert.equal(v.safeParse(ABG_TYPED_TERMINAL_RESULT_SCHEMA,carrier).success,true,'carrier does not reprice a failed command into a successful command');
  assert.equal(carrier.value.commandResults[0].exitStatus,1);
});

const c14Frozen = (v) => { if (v && typeof v === 'object') { Object.values(v).forEach(c14Frozen); Object.freeze(v); } return v; };
const c14Row = (kind, eventId, admissionOrdinal, extra = {}) => c14Frozen({ kind, eventTime: '2026-07-21T00:00:00.000Z',
  aggregateType: 'workspace', aggregateId: 'workspace://c14', parentAggregateId: null, causationEventRefs: [],
  correlationId: 'correlation://c14', workflowVersion: '5.0.0', scopeClass: 'workspace', basisId: 'basis://c14', payload: {},
  eventId, admissionOrdinal, payloadDigest: `sha256:${'0'.repeat(64)}`, ...extra });

test('C-14: the basis scope check refuses its one GraphCall by Frame and basis relation with the terminal-projection TypeError', async () => {
  const { selectValidatedRuntimeEventPrefix } = await import('../../build/code/src/abg/event_prefix.js');
  const { privateOwner: c14PrivateOwner } = await import('../support/r10-private-owner-harness.mjs');
  const ports = await c14PrivateOwner('abg/project_read_ports.js', ['scopeForBasis']);
  const basis = c14Frozen({ basisRef: 'basis://c14', basisDigest: 'sha256:' + '2'.repeat(64), basisClass: 'root',
    invocationAdmissionRef: 'invocation-admission://c14', invocationRef: 'invocation://c14', programRef: 'program://c14',
    graphFunctionRef: 'gf://c14', graphFunctionDigest: 'sha256:' + '3'.repeat(64), graphRef: 'graph://c14', graphDigest: 'sha256:' + '4'.repeat(64) });
  const run = c14Row('run_segment_opened', 'event://c14/run', 1, { runId: 'run://c14', scopeClass: 'run', aggregateType: 'run',
    aggregateId: 'run://c14', payload: { runDigest: 'sha256:' + '5'.repeat(64) } });
  const graph = c14Row('graph_call_opened', 'event://c14/graph', 2, { runId: 'run://c14', graphCallId: 'graph-call://c14', scopeClass: 'run',
    causationEventRefs: [run.eventId], payload: { graphFunctionRef: 'gf://other', executionBasisRef: 'basis://c14' } });
  const frame = c14Row('frame_opened', 'event://c14/frame', 3, { runId: 'run://c14', graphCallId: 'graph-call://c14', frameId: 'frame://c14',
    scopeClass: 'run', causationEventRefs: [graph.eventId], payload: { executionBasisRef: 'basis://c14' } });
  for (const [events, message] of [[[run], /one exact basis GraphCall/], [[run, graph], /one exact basis Frame/],
    [[run, graph, frame], /scope differs from its admitted execution basis/]]) {
    assert.throws(() => ports.scopeForBasis(selectValidatedRuntimeEventPrefix(c14Frozen(events)), basis),
      (error) => error instanceof TypeError && message.test(error.message));
  }
});
