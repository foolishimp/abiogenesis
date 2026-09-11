import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import * as v from 'valibot';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
import {ABG_PROJECT_READ_CONTRACTS} from '../../build/code/src/abg/project_read_operation_contracts.js';
import {RunProjectionPort,GraphCallProjectionPort,projectRunTruthAtDurablePrefix} from '../../build/code/src/abg/project_read_ports.js';
import {constructRunInvocationOutcome} from '../../build/code/src/product/run_invocation_operation.js';
import {ABG_TYPED_TERMINAL_RESULT_SCHEMA} from '../../build/code/src/abg/terminal_result_contracts.js';
import {projectAdmittedCCallStateAtPrefix} from '../../build/code/src/abg/c_call.js';
import {readRuntimeEventsAtDurablePrefix} from '../../build/code/src/abg/event_store.js';
import {selectValidatedRuntimeEventPrefix,validatedRuntimeEventPrefixThroughEvent} from '../../build/code/src/abg/event_prefix.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {PUBLIC_FUNCTION_DEFINITION_FAMILY,PUBLIC_OPERATION_CONTRACT_PROJECTIONS} from '../../build/code/src/shared/public_function_family.js';
// Integration relocates test source only. This original S01 store is read-only;
// no acquisition, append, Public invocation or application effect is selected.
const native='/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01';
const request=JSON.parse(fs.readFileSync(path.join(native,'call-11.jsonl'),'utf8'));
const prefix=request.acquisition.closeHandoff.prefix,events=readRuntimeEventsAtDurablePrefix(prefix);
const run=events.find(e=>e.kind==='run_segment_opened').runId,graph=events.find(e=>e.kind==='graph_call_opened').graphCallId;
const truth=projectRunTruthAtDurablePrefix(prefix,run);assert.equal(truth.kind,'abg_run_truth_projection');
const packet=(member,target=run)=>({kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey:member,prefix,targetRef:target});
const projection=(member,fromOrdinal=0,limit=1)=>({source:{sourceRef:member.startsWith('graph_call')?graph:run,sourceDigest:member.startsWith('graph_call')?truth.graphCall.digest:truth.run.digest},
  projectionBasis:{projectionBasisRef:prefix.eventLogRef,projectionBasisDigest:prefix.coordinateDigest},selector:{kind:'ordinal_page',fromOrdinal,limit}});
const adapters=await privateOwner('abg/project_read_definition_bindings.js',['outputFor','PROJECT_READ_RESOURCE_ASSERTION_SCHEMA','GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA']);
const owners=await privateOwner('abg/project_read_ports.js',['terminalResult']);
const replay=RunProjectionPort.run_replay(packet('run_replay'));
assert.equal(replay.kind,'abg_project_read_projection');

test('six current owner outputs preserve the same admitted terminal carrier and the 18/56 Public roster',()=>{
  assert.equal(PUBLIC_OPERATION_CONTRACT_PROJECTIONS.length,18);
  assert.equal(PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.length,56);
  for(const [member,port,target] of [['run_result',RunProjectionPort.run_result,run],['run_replay',RunProjectionPort.run_replay,run],['graph_call_result',GraphCallProjectionPort.graph_call_result,graph],['graph_call_replay',GraphCallProjectionPort.graph_call_replay,graph]]) {
    const actual=port(packet(member,target));assert.equal(actual.kind,'abg_project_read_projection');
    const output=adapters.outputFor(ABG_PROJECT_READ_CONTRACTS[member],projection(member),member,actual);
    assert.equal(output.outcomeKind,'result');assert.deepEqual(output.value.projection.terminalResult,truth.terminalResult);
  }
  for(const member of ['invoke','start'])assert.deepEqual(constructRunInvocationOutcome(member,truth).value.terminalResult,truth.terminalResult);
});

test('legal I-JSON null is not absence (pure carrier and replay-row selection, not a new admitted result)',()=>{
  const terminal={...truth.terminalResult,value:null,valueDigest:sha256Canonical(null)};
  assert.equal(v.safeParse(ABG_TYPED_TERMINAL_RESULT_SCHEMA,terminal).success,true);
  const selected=owners.terminalResult([{routeKind:'terminal',cCallRef:'call:null'}],[{cCallRef:'call:null',resultRef:'result:null',resultDigest:sha256Canonical('result'),resultValue:null}]);
  assert.ok(selected);assert.equal(selected.result.resultValue,null);
  assert.equal(owners.terminalResult([{routeKind:'terminal',cCallRef:'call:null'}],[]),null);
});

test('held/failed/missing terminal truth cannot become a completed Product result',()=>{
  assert.equal(constructRunInvocationOutcome('start',{...truth,runtimeStatus:'held'}).outcomeKind,'nonterminal');
  const failed=constructRunInvocationOutcome('start',{...truth,runtimeStatus:'failed'});
  assert.equal(failed.value.disposition,'runtime_failed');assert.equal(failed.value.result,null);assert.equal(failed.value.terminalResult,null);
  const blocked=constructRunInvocationOutcome('start',{...truth,runtimeStatus:'blocked'});
  assert.equal(blocked.value.disposition,'blocked');assert.equal(blocked.value.terminalResult,null);
  assert.equal(constructRunInvocationOutcome('start',{...truth,terminalResult:null}).outcomeKind,'refusal');
  assert.equal(constructRunInvocationOutcome('start',{...truth,result:{...truth.result,digest:sha256Canonical('wrong')}}).outcomeKind,'refusal');
});

test('read before Run close is not_ready while the actually closed root GraphCall is independently readable',()=>{
  const bytes=fs.readFileSync(path.join(native,'events-01/runtime.events.jsonl'));
  const selected=Buffer.from(bytes.toString('utf8').trimEnd().split('\n').slice(0,19).join('\n')+'\n');
  const {coordinateDigest:_,...rest}=prefix;
  const body={...rest,prefixLength:selected.length,prefixDigest:'sha256:'+createHash('sha256').update(selected).digest('hex')};
  const before={...body,coordinateDigest:sha256Canonical(body)};
  const notReady=RunProjectionPort.run_result({...packet('run_result'),prefix:before});
  assert.equal(notReady.kind,'abg_project_read_refusal');assert.equal(notReady.code,'target_not_ready');
  const projected=GraphCallProjectionPort.graph_call_result({...packet('graph_call_result',graph),prefix:before});
  assert.equal(projected.kind,'abg_project_read_projection');assert.equal(projected.value.terminalResult.result.ref,truth.result.ref);
});

test('whole-prefix typed replay summary is conserved on first and empty-end pages; invalid offsets and arithmetic refuse',()=>{
  const count=replay.value.eventAtoms.length;
  for(const offset of [0,count]) {
    const output=adapters.outputFor(ABG_PROJECT_READ_CONTRACTS.run_replay,projection('run_replay',offset,1),'run_replay',replay);
    assert.equal(output.outcomeKind,'result');assert.equal(output.value.projection.status,'closed');
    assert.deepEqual(output.value.projection.terminalResult,truth.terminalResult);
  }
  for(const [offset,limit,code] of [[count+1,1,'cursor_invalid'],[Number.MAX_SAFE_INTEGER,1,'range_invalid'],[-1,1,'range_invalid'],[0,0,'range_invalid']]) {
    const output=adapters.outputFor(ABG_PROJECT_READ_CONTRACTS.run_replay,projection('run_replay',offset,limit),'run_replay',replay);
    assert.equal(output.outcomeKind,'refusal');assert.equal(output.value.code,code);
  }
});

test('scope and packet crossings refuse; root does not accept a caller declarationProof field',()=>{
  assert.equal(RunProjectionPort.run_replay({...packet('run_replay'),declarationProof:{}}).code,'invalid_packet');
  assert.equal(RunProjectionPort.run_result({...packet('run_result'),prefix:{...prefix,coordinateDigest:sha256Canonical('wrong')}}).code,'invalid_history');
  assert.equal(GraphCallProjectionPort.graph_call_result(packet('graph_call_result',run)).kind,'abg_project_read_refusal');
  assert.equal(RunProjectionPort.run_result(packet('run_result',graph)).kind,'abg_project_read_refusal');
});

test('native CCall owner rejects altered value, contract, producer, judgment and pre-result prefix without test-owned admission',()=>{
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

test('the shared mapper rejects crossed result aliases and keeps failed-command observation data verbatim',()=>{
  const actual=RunProjectionPort.run_result(packet('run_result'));
  const crossed={...actual,value:{...actual.value,admittedResult:{...actual.value.admittedResult,resultRef:'result://foreign'}}};
  assert.throws(()=>adapters.outputFor(ABG_PROJECT_READ_CONTRACTS.run_result,projection('run_result'),'run_result',crossed),/terminal owner coordinates/);
  const observation={kind:'mechanical_failed_command_observation',commandResults:[{exitStatus:1}]};
  const carrier={...truth.terminalResult,value:observation,valueDigest:sha256Canonical(observation)};
  assert.equal(v.safeParse(ABG_TYPED_TERMINAL_RESULT_SCHEMA,carrier).success,true,'carrier does not reprice a failed command into a successful command');
  assert.equal(carrier.value.commandResults[0].exitStatus,1);
});
