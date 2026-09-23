import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import {join} from 'node:path';
import * as p from '../../build/code/src/product/index.js';
import * as store from '../../build/code/src/abg/event_store.js';
import * as prefixOwner from '../../build/code/src/abg/event_prefix.js';
import * as reads from '../../build/code/src/abg/project_read_ports.js';
import {hasJudgedTerminalRouteCausation} from '../../build/code/src/abg/retry.js';
import {ABG_PROJECT_READ_CONTRACTS} from '../../build/code/src/abg/project_read_operation_contracts.js';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
const clone=x=>structuredClone(x),hash=p.sha256Canonical;
const fixturePath=process.env.ABI5_S02_PROJECTION_FIXTURE;
function fixture(t){
 assert(fixturePath,'select the exact frozen S02 episode fixture');
 const receipt=JSON.parse(fs.readFileSync(join(fixturePath,'nested-compose-root-stdout.json'),'utf8')).receipt;
 const closed=receipt.resources.eventResource.closeHandoff;
 const bytes=fs.readFileSync(closed.reopenAuthority.eventLogPath);
 assert.equal(p.sha256Bytes(bytes),'sha256:24d05767b1cdb6f4fbaad8569a240101f4fa8b6b682226b0daf54c6e73108ad7');
 assert.equal(bytes.length,2757817);
 const dir=fs.mkdtempSync(join(os.tmpdir(),'abi5-terminal-projection-')),file=join(dir,'events.jsonl');fs.writeFileSync(file,bytes,{flag:'wx'});
 const st=fs.statSync(file),body={...closed.reopenAuthority,eventLogPath:file,device:st.dev,inode:st.ino};delete body.authorityDigest;
 const acquired=store.reopenEventStore({...body,authorityDigest:hash(body)});assert.equal(acquired.kind,'reopened_event_store_context');
 t.after(()=>{acquired.store.closeDurableLog();fs.rmSync(dir,{recursive:true,force:true});});
 const events=store.readRuntimeEventsAtDurablePrefix(acquired.prefix),full=prefixOwner.selectValidatedRuntimeEventPrefix(events);
 const one=(kind,predicate=()=>true)=>{const rows=events.filter(x=>x.kind===kind&&predicate(x));assert.equal(rows.length,1);return rows[0];};
 const run=one('run_segment_opened'),route=one('traversal_route_admitted',x=>x.payload.routeKind==='terminal');
 const judgment=one('c_call_judged',x=>x.aggregateId===route.payload.cCallRef);
 const runPrefix=prefixOwner.selectValidatedRuntimeEventPrefix(events,{runId:run.runId});
 return {...acquired,events,full,runPrefix,run,route,judgment,binding:run.parentAggregateId};
}

test('actual closed retry-completion history yields exact Run truth, Result and replay without new execution',t=>{
 const f=fixture(t);assert.equal(f.route.causationEventRefs.includes(f.judgment.eventId),false);
 assert(hasJudgedTerminalRouteCausation(f.runPrefix,f.route,f.judgment,f.full));
 const truth=reads.projectRunTruthAtDurablePrefix(f.prefix,f.run.runId);
 assert.equal(truth.kind,'abg_run_truth_projection',JSON.stringify(truth));assert.equal(truth.runtimeStatus,'closed');
 assert.equal(truth.result.ref,'result://abiogenesis/ef2bf81d0627e4e39289de35a489f4a8a1d56a462a1e09a11ebb1597e161c407');
 assert.deepEqual(truth.terminalResult.value,{kind:'hello_world_output',schemaVersion:'5.0.0',message:'Hello World'});
 for(const memberKey of ['run_result','run_replay']){
  const read=reads.prepareRunReadAtDurablePrefix(f.prefix,memberKey,f.run.runId).project();
  assert.equal(read.kind,'abg_project_read_projection');assert.deepEqual(read.value.terminalResult,truth.terminalResult);
 }
 const closed=f.store.projectReopenAuthorityAndClose();
 const cold=reads.projectRunTruthAtDurablePrefix(clone(closed.prefix),f.run.runId);assert.deepEqual(cold,truth);
 t.diagnostic('Real frozen failed S02 events copied into a disposable owner; actual cold/read/terminal owners. No fresh installed Run, provider or original resource mutation.');
});

test('terminal producer join refuses missing progress, foreign producer/scope and unrelated causal paths',t=>{
 const f=fixture(t),missing=prefixOwner.validatedRuntimeEventPrefixThroughEvent(f.runPrefix,f.judgment.eventId);
 assert.equal(hasJudgedTerminalRouteCausation(missing,f.route,f.judgment,f.full),false);
 const variants=[
  [{...f.route,payload:{...f.route.payload,cCallRef:'c-call://foreign'}},f.judgment],
  [{...f.route,graphCallId:'graph-call://foreign'},f.judgment],
  [f.route,{...f.judgment,eventId:'event://foreign'}],
  [{...f.route,payload:{...f.route.payload,consumedAvailabilityRefs:[f.judgment.payload.judgmentRef,'retry-progress://missing']}},f.judgment],
  [{...f.route,causationEventRefs:[f.judgment.eventId]},f.judgment],
 ];
 for(const [route,judgment]of variants)assert.equal(hasJudgedTerminalRouteCausation(f.runPrefix,route,judgment,f.full),false);
 // Supplied no-retry route premise checks the conserved direct branch. Actual
 // direct historical child Definition coverage is retained in the companion test.
 const direct={...f.route,payload:{...f.route.payload,consumedAvailabilityRefs:[f.judgment.payload.judgmentRef]},causationEventRefs:[f.judgment.eventId]};
 assert(hasJudgedTerminalRouteCausation(f.runPrefix,direct,f.judgment,f.full));
 assert.equal(hasJudgedTerminalRouteCausation(f.runPrefix,{...direct,causationEventRefs:[f.route.eventId]},f.judgment,f.full),false);
});

test('workspace replay fixed Definition uses its exact owner projection identity in held and cold reads',async t=>{
 const f=fixture(t),owner=await privateOwner('abg/project_read_definition_bindings.js',['outputFor']);
 const packet={kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey:'workspace_replay',prefix:f.prefix,targetRef:f.binding};
 const native=reads.WorkspaceProjectionPort.workspace_replay(packet);assert.equal(native.kind,'abg_project_read_projection');
 assert.equal(native.value.replayRef,undefined,'workspace collection has no singular Run replay');
 const request={caseKey:'workspace_replay',source:{sourceKind:'workspace_binding',sourceRef:f.binding,sourceDigest:hash(f.binding)},
  projectionBasis:{projectionBasisRef:f.prefix.eventLogRef,projectionBasisDigest:f.prefix.coordinateDigest},selector:{kind:'ordinal_page',fromOrdinal:0,limit:1000}};
 const output=owner.outputFor(ABG_PROJECT_READ_CONTRACTS.workspace_replay,request,'workspace_replay',native);
 assert.equal(output.outcomeKind,'result');assert.deepEqual(output.value.projection.replay,{ref:native.projectionRef,digest:native.projectionDigest});
 f.store.projectReopenAuthorityAndClose();const cold=reads.WorkspaceProjectionPort.workspace_replay({...packet,prefix:clone(packet.prefix)});
 assert.deepEqual(cold,native);assert.deepEqual(owner.outputFor(ABG_PROJECT_READ_CONTRACTS.workspace_replay,request,'workspace_replay',cold),output);
 for(const changed of [{...native,projectionRef:'project-read://foreign'},{...native,projectionDigest:hash('wrong')},
  {...native,targetRef:'workspace-binding://foreign'},{...native,prefixCoordinateDigest:hash('stale')},
  {...native,value:{...native.value,workspaceRef:'workspace-binding://foreign'}}]){
  assert.throws(()=>owner.outputFor(ABG_PROJECT_READ_CONTRACTS.workspace_replay,request,'workspace_replay',changed),/workspace replay differs/);
 }
 t.diagnostic('Actual workspace/read projection and fixed output contract, with supplied source digest/request transport premises. No Public acquisition/permission claim.');
});

test('Run-truth refusal conserves the caught terminal cause through existing Public evidenceRefs',async t=>{
 const f=fixture(t);
 // Force only the same rejecting causal predicate as the retained predecessor;
 // every other owner/fixture remains actual. This is an explicit lower premise.
 const owner=await privateOwner('abg/project_read_ports.js',[],{'./retry.js':{hasJudgedTerminalRouteCausation:()=>false}});
 const refusal=owner.projectRunTruthAtDurablePrefix(f.prefix,f.run.runId);assert.equal(refusal.kind,'abg_run_truth_refusal');assert.equal(refusal.code,'invalid_history');
 const output=p.constructRunInvocationOutcome('start',refusal);assert.equal(output.outcomeKind,'refusal');assert.equal(output.value.code,'invalid_intent');
 assert.deepEqual(output.value.evidenceRefs,[refusal.diagnosticRef]);
 const diagnostic=JSON.parse(decodeURIComponent(refusal.diagnosticRef.split(',').slice(1).join(',')));
 assert.equal(diagnostic.targetRef,f.run.runId);assert.equal(diagnostic.prefixCoordinateDigest,f.prefix.coordinateDigest);
 assert.equal(diagnostic.cause.name,'TypeError');assert.equal(diagnostic.cause.message,'terminal closure facts do not join the selected producer');
});
