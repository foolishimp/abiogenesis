import assert from 'node:assert/strict';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import test from 'node:test';
import {witnessMechanics,hash,events,resources,nativeWitness,WITNESS_OPERATION_CONTRACTS,admitExactDefinitionCall} from '../support/witness-reprice-mechanics.mjs';
import {selectValidatedRuntimeEventPrefix} from '../../build/code/src/abg/event_prefix.js';
import {replayValidatedRuntimeEventPrefix} from '../../build/code/src/abg/replay.js';
import {constructRuntimeFluent,deriveRuntimeEventCalculusProjection,holdsAt} from '../../build/code/src/abg/event_calculus.js';

const bytes=h=>fs.readFileSync(h.eventLogPath);
const input=h=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:h.handoff,handoffDigest:hash(h.handoff)});
function request(h){
  const contract=nativeWitness.WITNESS_CONTENT_CONTRACTS['run-stopped'];
  return {subjectKind:'run',subject:h.operatorRun,act:'run-stopped',
    content:{kind:'typed_reason',contentContract:{ref:contract.ref,digest:contract.digest},value:{reasonKind:'operator_stop',reasonDetail:'Selected operator stop component proof'}},
    context:{kind:'run',run:h.operatorRun,basis:h.historical},evidence:[h.operatorRun],provenance:[h.historical]};
}
const call=(h,options={})=>h.call({member:'run-stopped',request:request(h),...options});
function resign(call){
  const {authorityDigest,...authority}=call.invocation.invocationAuthority;call.invocation.invocationAuthority={...authority,authorityDigest:hash(authority)};
  const {invocationDigest,invocationRef,...body}=call.invocation,digest=hash(body);
  call.invocation={...body,invocationDigest:digest,invocationRef:'invocation://abiogenesis/'+digest.slice(7)};
}
function assertReleased(h,before){
  assert.deepEqual(bytes(h),before);const reopened=resources.acquireAbgEventResource(input(h));
  assert.equal(reopened.kind,'acquired_abg_event_resource');resources.closeAbgEventResource(reopened.resource,reopened.resource.entryPrefix);
}

test('current Public run_status supplies the same Run and route-grade basis to stop; cold replay preserves the result',async()=>{
  const h=await witnessMechanics({operatorRun:true}),before=bytes(h),status=h.publicStatus(h.handoff.prefix),stopRequest=request(h);
  assert.notEqual(status.source.digest,h.nativeOperatorRun.digest,'Public semantic opening digest differs from the native Run-body digest');
  assert.deepEqual(status.projection.subject,status.source);assert.deepEqual(status.projection.executionBasis,h.historical);
  stopRequest.subject=status.source;stopRequest.context={kind:'run',run:status.source,basis:status.projection.executionBasis};
  const raw=await call(h,{request:stopRequest});
  assert.ok(admitExactDefinitionCall(raw,WITNESS_OPERATION_CONTRACTS.admit['run-stopped']));
  const result=await h.run(JSON.parse(JSON.stringify(raw)));assert.equal(result.exitCode,0,JSON.stringify(result));assert.equal(h.nativeCalls,1);
  assert.equal(result.resources.kind,'witness_run_stopped_resource_receipt');
  const outcome=result.resources.eventResource,rows=events.readRuntimeEventsAtDurablePrefix(outcome.closeHandoff.prefix),stop=rows.at(-1);
  assert.deepEqual(rows.slice(-2).map(row=>row.kind),['public_operation_admitted','run_stopped']);
  assert.equal(bytes(h).subarray(0,before.length).equals(before),true);assert.deepEqual(outcome.entryPrefix,h.handoff.prefix);
  assert.deepEqual(outcome.closeHandoff.prefix.storeIdentity,h.handoff.prefix.storeIdentity);
  assert.equal(stop.runId,h.operatorRun.ref);assert.equal(stop.basisId,h.historical.ref);
  assert.equal(stop.payload.actorRef,h.actor.ref);assert.equal(stop.payload.operatorActorRef,h.actor.ref);
  assert.deepEqual(stop.payload.contentValue,raw.invocation.request.content.value);assert.deepEqual(stop.payload.context,{...raw.invocation.request.context,run:h.nativeOperatorRun});
  assert.deepEqual(raw.invocation.request,stopRequest,'owner conversion never mutates the approved Public request');
  assert.equal(rows.at(-2).payload.executionBasisRef,h.historical.ref);assert.equal(rows.at(-2).payload.executionBasisDigest,h.historical.digest);
  const {eventId,...body}=stop;assert.deepEqual(result.ownerOutput.value.admittedEvent,{ref:eventId,digest:hash(body)});
  assert.equal(result.ownerOutput.value.act,'run-stopped');assert.deepEqual(result.ownerOutput.value.evidence,[h.operatorRun]);
  const [packet,authority]=h.observed[0];assert.deepEqual(authority.executionBasis,h.historical);assert.deepEqual(packet.actor,h.actor);
  assert.deepEqual(packet.subject,{kind:'run',...h.nativeOperatorRun});
  const prefix=selectValidatedRuntimeEventPrefix(rows,{runId:h.operatorRun.ref}),calculus=deriveRuntimeEventCalculusProjection(prefix);
  assert.equal(holdsAt(calculus,constructRuntimeFluent({name:'run_active',identity:h.operatorRun.ref})),false);
  assert.equal(holdsAt(calculus,constructRuntimeFluent({name:'operator_run_stopped',identity:h.operatorRun.ref})),true);
  const file=join(h.scratch,'result.json');fs.writeFileSync(file,JSON.stringify({result,run:h.operatorRun.ref}),{flag:'wx'});
  const script=`import fs from 'node:fs';import * as e from './build/code/src/abg/event_store.js';import * as r from './build/code/src/abg/definition_event_resource.js';import {selectValidatedRuntimeEventPrefix as p}from './build/code/src/abg/event_prefix.js';import {replayValidatedRuntimeEventPrefix as replay}from './build/code/src/abg/replay.js';import {sha256Canonical as hash}from './build/code/src/shared/digests.js';const x=JSON.parse(fs.readFileSync(process.argv[1]));const handoff=x.result.resources.eventResource.closeHandoff;const a=r.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:hash(handoff)});if(a.kind!=='acquired_abg_event_resource')throw Error(JSON.stringify(a));const rows=e.readRuntimeEventsAtDurablePrefix(a.resource.entryPrefix);const digest=hash(replay(p(rows,{runId:x.run})));r.closeAbgEventResource(a.resource,a.resource.entryPrefix);process.stdout.write(JSON.stringify({rows,digest}));`;
  const child=spawnSync(process.execPath,['--input-type=module','-e',script,file],{cwd:join(import.meta.dirname,'../..'),encoding:'utf8',env:{...process.env,NODE_OPTIONS:'',NODE_DISABLE_COMPILE_CACHE:'1'}});
  assert.equal(child.status,0,child.stderr);const cold=JSON.parse(child.stdout);assert.deepEqual(cold.rows,rows);assert.equal(cold.digest,hash(replayValidatedRuntimeEventPrefix(prefix)));
  const committed=bytes(h),stale=await h.run(raw);assert.equal(stale.exitCode,70);assert.equal(h.nativeCalls,1);assert.deepEqual(bytes(h),committed);
  h.advance(result);const repeated=await h.run(await call(h,{serial:'second-stop'}));assert.equal(repeated.exitCode,1,JSON.stringify(repeated));
  assert.equal(repeated.ownerOutput.value.code,'act_mismatch');assertReleased(h,committed);
});

test('wrong actor, missing/crossed execution basis, grant and malformed request refuse before native admission',async()=>{
  const h=await witnessMechanics({operatorRun:true}),raw=await call(h),before=bytes(h);
  const mutations=[c=>{c.invocation.invocationAuthority.slots.actor.actor.ref='actor://foreign';},
    c=>{c.invocation.invocationAuthority.slots.execution_basis=null;},
    c=>{c.invocation.invocationAuthority.slots.execution_basis={ref:'basis://foreign',digest:hash('foreign')};},
    c=>{delete c.resources.admissionAuthority;},c=>{c.resources.admissionAuthority.grants[0].grantDigest=hash('forged');},
    c=>{c.invocation.request.subjectKind='workspace';},c=>{c.resources.kind='witness_reprice_resource_assertion';}];
  for(const mutate of mutations){const candidate=structuredClone(raw);mutate(candidate);resign(candidate);const result=await h.run(candidate);
    assert.equal(result.exitCode,70,JSON.stringify(result));assert.equal(h.nativeCalls,0);assertReleased(h,before);}
  await assert.rejects(call(h,{changeAuthority:a=>{a.actorRef='actor://foreign';}}),/exact external approval/);
});

test('approved but false stop content or Run/basis context returns a semantic refusal and unchanged close',async()=>{
  for(const [kind,expected]of [['content','content_mismatch'],['run','context_mismatch'],['basis','context_mismatch'],['native-alias','context_mismatch']]){
    const h=await witnessMechanics({operatorRun:true}),r=request(h),before=bytes(h);
    if(kind==='content')r.content.value.reasonKind='operator_resume';
    if(kind==='run'){const foreign={ref:'run://absent',digest:hash('absent')};r.subject=foreign;r.context.run=foreign;}
    if(kind==='basis')r.context.basis={ref:'basis://absent',digest:hash('absent')};
    if(kind==='native-alias'){r.subject=h.nativeOperatorRun;r.context.run=h.nativeOperatorRun;}
    const result=await h.run(await call(h,{request:r}));assert.equal(result.exitCode,1,JSON.stringify(result));assert.equal(result.ownerOutput.value.code,expected);
    assert.equal(h.nativeCalls,kind==='content'?1:0);assert.deepEqual(result.resources.eventResource.closeHandoff.prefix,h.handoff.prefix);assertReleased(h,before);
  }
});

test('a closed Run with the authentic Public identity and basis refuses stop without appending',async()=>{
  const h=await witnessMechanics({operatorRun:true,closedRun:true}),before=bytes(h);
  const result=await h.run(await call(h));assert.equal(result.exitCode,1,JSON.stringify(result));
  assert.equal(result.ownerOutput.value.code,'act_mismatch');assert.equal(h.nativeCalls,1);
  assert.deepEqual(result.resources.eventResource.closeHandoff.prefix,h.handoff.prefix);assertReleased(h,before);
});

test('changed cold physical bytes refuse before stop admission',async()=>{
  const h=await witnessMechanics({operatorRun:true}),raw=await call(h),before=bytes(h),changed=Buffer.from(before);changed[0]=91;fs.writeFileSync(h.eventLogPath,changed);
  const refused=await h.run(JSON.parse(JSON.stringify(raw)));assert.equal(refused.exitCode,70);assert.equal(h.nativeCalls,0);assert.deepEqual(bytes(h),changed);
  fs.writeFileSync(h.eventLogPath,before);const accepted=await h.run(raw);assert.equal(accepted.exitCode,0,JSON.stringify(accepted));
});

test('live owner stop borrows its admitted state without decoding history or releasing the enclosing owner',async()=>{
  const h=await witnessMechanics({operatorRun:true}),opened=resources.acquireAbgEventResource(input(h));assert.equal(opened.kind,'acquired_abg_event_resource');
  const selected=resources.selectAcquiredAbgEventResource(opened.resource,opened.resource.entryPrefix),raw=await call(h,{eventResource:selected});
  const oldRead=fs.readSync,oldParse=JSON.parse;let reads=0,decodes=0,result;
  fs.readSync=function(...args){reads++;return oldRead.apply(this,args);};JSON.parse=function(...args){if(new Error().stack.includes('decodeHistoricalEvents'))decodes++;return oldParse.apply(this,args);};syncBuiltinESMExports();
  try{result=await h.run(raw);}finally{fs.readSync=oldRead;JSON.parse=oldParse;syncBuiltinESMExports();}
  try{
    assert.equal(result.exitCode,0,JSON.stringify(result));assert.equal(result.resources.eventResource.kind,'abg_event_resource_completion');
    assert.equal(reads,0);assert.equal(decodes,0);assert.equal(h.nativeCalls,1);
    const next=result.resources.eventResource.successor;resources.assertAcquiredAbgEventResourceSelectionCurrent(next);
    assert.throws(()=>resources.assertAcquiredAbgEventResourceSelectionCurrent(selected));
    console.log(JSON.stringify({kind:'operator_stop_live_owner',reads,decodes,eventDelta:2,productEnvironment:'explicit component premise',installedProof:false}));
  }finally{resources.closeAbgEventResource(opened.resource,events.selectHeldEventStoreDurablePrefix(opened.resource.store));}
});

test('failed native stop transaction keeps both events absent and returns the first cause',async()=>{
  const h=await witnessMechanics({operatorRun:true,transactionFault:true}),before=bytes(h),result=await h.run(await call(h));
  assert.equal(result.exitCode,70,JSON.stringify(result));assert.equal(result.failure.fault.code,'sink_unavailable');
  assert.match(result.failure.fault.message,/injected second-event transaction failure/);assert.equal(h.nativeCalls,1);assertReleased(h,before);
});
