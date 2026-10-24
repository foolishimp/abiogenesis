import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {GraphCallProjectionPort,projectRunTruthAtDurablePrefix} from '../../build/code/src/abg/project_read_ports.js';
import {reopenEventStore,closeHeldEventStoreAtDurablePrefix} from '../../build/code/src/abg/event_store.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {evidenceInput} from '../support/evidence-root.mjs';
// The retained D2 store and its program-ready record live under the evidence
// root. The store was appended after this proof's capture (913 lines); the
// projection is over its first 846 lines, 13,540,472 bytes, sha256 4f561cea….
const D2='comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/';
const logInput=evidenceInput({path:D2+'events-01/runtime.events.jsonl',sha256:'f841bba98385cb572a944edf1793634fcf10baf59a74331110042bcb200f8e82',bytes:19058361});
const readyInput=evidenceInput({path:D2+'attempt-01/program-ready-16.json',sha256:'2147862a16f8526d546ca918563b8d8b8094e684d8f629784b256e4803d3fc02',bytes:12781893});
const absent=[logInput,readyInput].find(input=>input.kind==='absent');
if(absent){console.log(JSON.stringify({kind:'r10_actual_historical_child_projection',disposition:'skipped',reason:absent.reason}));process.exit(0);}
const hash=x=>createHash('sha256').update(x).digest('hex');
const bytes=logInput.bytes.subarray(0,13540472),readyBytes=readyInput.bytes,stat=fs.statSync(logInput.path),readyStat=fs.statSync(readyInput.path);
assert.equal(hash(bytes),'4f561ceacf40fd13db82132d93890cb67750453dfa81a75c0401f04bd9345649');
const lines=bytes.toString('utf8').trimEnd().split('\n'),events=lines.map(JSON.parse),ready=JSON.parse(readyBytes);
// The retained close handoff names the original file and a device that no
// longer holds. The store owner reopens a byte copy in per-run scratch under
// the retained profile and closes it with no append; its coordinate is the
// base of each historical cut. Nothing is written under the evidence root.
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'r10-retained-child-')),log=path.join(scratch,'runtime.events.jsonl');
fs.writeFileSync(log,bytes);
const copy=fs.statSync(log),authority={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath:log,device:copy.dev,inode:copy.ino,
  eventLogDigest:'sha256:'+hash(bytes),durableByteLength:bytes.length,eventContractDigest:ready.closeHandoff.prefix.storeIdentity.eventContractDigest};
const reopened=reopenEventStore({...authority,authorityDigest:sha256Canonical(authority)});
assert.equal(reopened.kind,'reopened_event_store_context',JSON.stringify(reopened));
const {prefix:current}=closeHeldEventStoreAtDurablePrefix(reopened.store,reopened.prefix);
assert.equal(events.length,846);
const proof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:ready.call.resources.catalog,catalogView:ready.call.resources.catalogView};
const summaries=[];
for(const ordinal of [67,216,283]) {
  const close=events.find(e=>e.admissionOrdinal===ordinal);assert.equal(close.kind,'graph_call_closed');
  const selectedBytes=Buffer.from(lines.slice(0,ordinal).join('\n')+'\n');
  const {coordinateDigest:_,...base}=structuredClone(current);
  const body={...base,prefixLength:selectedBytes.length,prefixDigest:'sha256:'+hash(selectedBytes)};
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
assert.equal(hash(fs.readFileSync(logInput.path)),hash(logInput.bytes));assert.equal(hash(fs.readFileSync(readyInput.path)),hash(readyBytes));
for(const [file,before] of [[logInput.path,stat],[readyInput.path,readyStat]]){const now=fs.statSync(file);
  assert.deepEqual([now.dev,now.ino,now.size,now.mtimeMs],[before.dev,before.ino,before.size,before.mtimeMs],file);}
assert.equal(hash(fs.readFileSync(log)),hash(bytes));fs.rmSync(scratch,{recursive:true,force:true});
console.log(JSON.stringify({kind:'r10_actual_historical_child_projection',disposition:'passed',nativeExecution:false,
  logSha256:hash(bytes),readySha256:hash(readyBytes),summaries,
  limits:['new isolated owner projects existing admitted histories, not a fresh installed Public call','mechanical D2 actors are not semantic UAT']}));
