import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {GraphCallProjectionPort,projectRunTruthAtDurablePrefix} from '../../build/code/src/abg/project_read_ports.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
const native=path.resolve(import.meta.dirname,'../../../../../20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01');
const log=path.join(native,'events-01/runtime.events.jsonl'),readyPath=path.join(native,'attempt-01/program-ready-16.json');
const hash=x=>createHash('sha256').update(x).digest('hex');
const bytes=fs.readFileSync(log),readyBytes=fs.readFileSync(readyPath),stat=fs.statSync(log);
assert.equal(hash(bytes),'4f561ceacf40fd13db82132d93890cb67750453dfa81a75c0401f04bd9345649');
assert.equal(hash(readyBytes),'2147862a16f8526d546ca918563b8d8b8094e684d8f629784b256e4803d3fc02');
assert.equal(stat.dev,16777230);assert.equal(stat.ino,449590349);
const lines=bytes.toString('utf8').trimEnd().split('\n'),events=lines.map(JSON.parse),ready=JSON.parse(readyBytes);
assert.equal(events.length,846);
const proof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:ready.call.resources.catalog,catalogView:ready.call.resources.catalogView};
const summaries=[];
for(const ordinal of [67,216,283]) {
  const close=events.find(e=>e.admissionOrdinal===ordinal);assert.equal(close.kind,'graph_call_closed');
  const selectedBytes=Buffer.from(lines.slice(0,ordinal).join('\n')+'\n');
  const {coordinateDigest:_,...old}=ready.closeHandoff.prefix;
  const body={...old,prefixLength:selectedBytes.length,prefixDigest:'sha256:'+hash(selectedBytes)};
  const prefix={...body,coordinateDigest:sha256Canonical(body)};
  const request={kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey:'graph_call_result',prefix,targetRef:close.graphCallId,declarationProof:proof};
  const output=GraphCallProjectionPort.graph_call_result(request);
  assert.equal(output.kind,'abg_project_read_projection',JSON.stringify({ordinal,output}));
  const terminal=output.value.terminalResult;
  const nativeResult=events.find(e=>e.eventId===terminal.producer.resultAdmissionEventRef);
  const basis=events.find(e=>e.kind==='basis_admitted'&&e.payload.basisRef===close.basisId).payload;
  const invocation=events.find(e=>e.kind==='invocation_admitted'&&e.payload.invocationAdmissionRef===basis.invocationAdmissionRef).payload;
  assert.equal(basis.basisClass,'child');assert.equal(terminal.contract.ref,basis.resultContractRef);
  assert.deepEqual(terminal.value,nativeResult.payload.value);
  assert.equal(terminal.producer.graphCallRef,close.graphCallId);assert.equal(terminal.producer.executionBasis.ref,close.basisId);
  if(ordinal!==67)assert.notEqual(terminal.contract.ref,invocation.outputContractRef,'child output is not substituted with root contract');
  const rootTruth=projectRunTruthAtDurablePrefix(prefix,close.runId);
  assert.equal(rootTruth.kind,'abg_run_truth_projection');assert.notEqual(rootTruth.runtimeStatus,'closed');assert.equal(rootTruth.terminalResult,null);
  const replay=GraphCallProjectionPort.graph_call_replay({...request,memberKey:'graph_call_replay'});
  assert.equal(replay.kind,'abg_project_read_projection');assert.equal(replay.value.runtimeStatus,'closed');assert.deepEqual(replay.value.terminalResult,terminal);
  const {declarationProof:__,...missing}=request;
  assert.equal(GraphCallProjectionPort.graph_call_result(missing).kind,'abg_project_read_refusal');
  summaries.push({ordinal,closeEventRef:close.eventId,runRef:close.runId,graphCallRef:close.graphCallId,basisRef:close.basisId,
    prefix,contract:terminal.contract,rootContract:{ref:invocation.outputContractRef,digest:invocation.outputContractDigest},
    producer:terminal.producer,result:terminal.result,valueDigest:terminal.valueDigest,rootStatus:rootTruth.runtimeStatus});
}
assert.equal(hash(fs.readFileSync(log)),hash(bytes));assert.equal(hash(fs.readFileSync(readyPath)),hash(readyBytes));
assert.equal(fs.statSync(log).ino,stat.ino);assert.equal(fs.statSync(log).dev,stat.dev);assert.equal(fs.statSync(log).size,stat.size);
console.log(JSON.stringify({kind:'r10_actual_historical_child_projection',disposition:'passed',nativeExecution:false,
  logSha256:hash(bytes),readySha256:hash(readyBytes),summaries,
  limits:['new isolated owner projects existing admitted histories, not a fresh installed Public call','mechanical D2 actors are not semantic UAT']}));
