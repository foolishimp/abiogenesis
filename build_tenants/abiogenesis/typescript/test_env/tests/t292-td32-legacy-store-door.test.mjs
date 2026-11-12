// T-292 TD-32: the legacy-store door. A store on the legacy event profile L
// admits one append, its witnessed reprice (the Public witness `reprice`
// admission followed by the profile boundary); every other append is refused
// by the event store's one durable append owner, before a byte is written,
// and the store stays held at its prefix. Each case drives one caller against
// a store on L, prints one door-table row (`td32_door_row`: outcome, code, log
// bytes unchanged) and asserts it. Rows on the `public` surface run the
// witness definition binding through runExactDefinition over the mechanical
// fixture of support/witness-reprice-mechanics.mjs (product verification and
// environment are injected there); rows on the `owner` surface drive the event
// store's own append entries over a real reopened L log. The actor's refusal
// on any profile but the current one is in t287-lifecycle-failure-carrier.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,mkdtempSync,writeFileSync,statSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {witnessMechanics,hash,events,resources,nativeWitness} from '../support/witness-reprice-mechanics.mjs';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
import * as profiles from '../../build/code/src/abg/event_contract_profiles.js';
import {canonicalJson} from '../../build/code/src/shared/canonical_json.js';

const L=events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST,W=events.ROOT_EVENT_CONTRACT_DIGEST;
const DOOR=/a store on the legacy event profile admits no append before its witnessed reprice/;
const bytes=path=>readFileSync(path);
const report=(row,surface,value)=>{console.log(JSON.stringify({kind:'td32_door_row',row,surface,...value}));return value;};

function profileRequest(h){
  const request=h.request();request.content.value={declarationRef:profiles.ROOT_EVENT_PROFILE_DECLARATION_REF,beforeDigest:L,
    afterDigest:W,changeClass:'design_reframe',owningTicketRef:'ticket://T-287',reason:profiles.ROOT_EVENT_PROFILE_UPGRADE_REASON};
  request.evidence=[...request.evidence,{ref:profiles.ROOT_WINDOW_EVENT_PROFILE_REF,digest:W}];return request;
}
function runStoppedRequest(h){
  const contract=nativeWitness.WITNESS_CONTENT_CONTRACTS['run-stopped'];
  return {subjectKind:'run',subject:h.operatorRun,act:'run-stopped',
    content:{kind:'typed_reason',contentContract:{ref:contract.ref,digest:contract.digest},value:{reasonKind:'operator_stop',reasonDetail:'TD-32 legacy-store door'}},
    context:{kind:'run',run:h.operatorRun,basis:h.historical},evidence:[h.operatorRun],provenance:[h.historical]};
}
// One Public witness act; the store's handoff stays acquirable when nothing was written.
async function publicAct(h,options){
  const before=bytes(h.eventLogPath),result=await h.run(await h.call(options));
  const bytesUnchanged=Buffer.compare(before,bytes(h.eventLogPath))===0;
  if(bytesUnchanged){
    const reopened=resources.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:h.handoff,handoffDigest:hash(h.handoff)});
    assert.equal(reopened.kind,'acquired_abg_event_resource','the refused store stays acquirable at its handoff');
    resources.closeAbgEventResource(reopened.resource,reopened.resource.entryPrefix);
  }
  return {result,outcome:{exitCode:result.exitCode,code:result.exitCode===0?null:result.failure?.fault?.code??null,bytesUnchanged}};
}

test('public: the profile reprice of a store on L is admitted, and the repriced store then takes a witness act',async()=>{
  const h=await witnessMechanics({legacyProfile:true});
  const {result,outcome}=await publicAct(h,{request:profileRequest(h)});
  report('witness reprice of the profile (the one admitted append)','public',outcome);
  assert.equal(result.exitCode,0,JSON.stringify(result));assert.equal(outcome.bytesUnchanged,false);
  assert.equal(result.resources.eventResource.entryPrefix.storeIdentity.eventContractDigest,L);
  assert.equal(result.resources.eventResource.closeHandoff.prefix.storeIdentity.eventContractDigest,W);
  h.advance(result);
  const after=await publicAct(h,{serial:'after-profile-reprice'});
  report('witness act after the store is repriced','public',after.outcome);
  assert.equal(after.result.exitCode,0,JSON.stringify(after.result));assert.equal(after.outcome.bytesUnchanged,false);
});

test('public: a witness act other than the profile reprice is refused on a store on L before anything is written',async()=>{
  const h=await witnessMechanics({legacyProfile:true});
  const {result,outcome}=await publicAct(h,{});
  report('witness reprice of a declaration (not the profile)','public',outcome);
  const r=await witnessMechanics({legacyProfile:true,operatorRun:true});
  const stopped=await publicAct(r,{member:'run-stopped',request:runStoppedRequest(r)});
  report('witness run-stopped','public',stopped.outcome);
  for(const {result:refused,outcome:row} of [{result,outcome},stopped]){
    assert.equal(refused.exitCode,70,JSON.stringify(refused));assert.equal(row.code,'sink_unavailable');
    assert.match(refused.failure.fault.message,DOOR);assert.equal(row.bytesUnchanged,true);
  }
});

// A real L log: one workspace basis row, written raw with the unchanged
// native projector and reopened by the cold owner, as recorded L stores are.
async function legacyStore(t){
  const legacy=await privateOwner('abg/event_store.js',['projectRuntimeEventAtContract']);
  const scratch=mkdtempSync(join(tmpdir(),'abi5-td32-door-')),eventLogPath=join(scratch,'events.jsonl');
  t.after(()=>rmSync(scratch,{recursive:true,force:true}));
  const common={eventTime:'2026-11-12T00:00:00.000Z',correlationId:'correlation://td32/door',workflowVersion:'5.0.0'};
  const basisRef='execution-basis://td32/door',basisValue={basisClass:'root',rawInputValue:{kind:'td32-door'}};
  const seed=legacy.projectRuntimeEventAtContract([],{...common,kind:'basis_admitted',aggregateType:'workspace',aggregateId:'workspace-binding://td32/door',
    parentAggregateId:null,causationEventRefs:[],scopeClass:'workspace',basisId:basisRef,
    payload:{...basisValue,basisRef,basisDigest:hash(basisValue)}},L);
  const data=Buffer.from(canonicalJson(seed)+'\n');writeFileSync(eventLogPath,data,{flag:'wx'});
  const stat=statSync(eventLogPath),body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath,device:stat.dev,inode:stat.ino,
    eventLogDigest:'sha256:'+createHash('sha256').update(data).digest('hex'),durableByteLength:data.length,eventContractDigest:L};
  const reopened=events.reopenEventStore({...body,authorityDigest:hash(body)});assert.ok(reopened.store,JSON.stringify(reopened));
  t.after(()=>{try{reopened.store.closeDurableLog();}catch{/* closed by the case */}});
  // A Run opening row the L table admits: the first row a Run start appends.
  const run=index=>({...common,kind:'run_segment_opened',aggregateType:'run',aggregateId:`run://td32/door/${index}`,parentAggregateId:'workspace-binding://td32/door',
    causationEventRefs:[seed.eventId],scopeClass:'run',basisId:basisRef,runId:`run://td32/door/${index}`,graphFunctionRef:'graph-function://td32/door',
    payload:{runId:`run://td32/door/${index}`,runDigest:hash(index),executionBasisRef:basisRef,executionBasisDigest:hash(basisValue),
      invocationAdmissionRef:'invocation-admission://td32/door',invocationRef:'invocation://td32/door',workspaceBindingId:'workspace-binding://td32/door',
      programRef:'program://td32/door',graphFunctionRef:'graph-function://td32/door',graphRef:'graph://td32/door',graphDigest:hash('graph')}});
  // A workspace binding artifact row the L table admits, as Product install and workspace bind append it.
  const artifact={...common,kind:'public_operation_artifact_admitted',aggregateType:'workspace',aggregateId:'authority-scope://td32/door',
    parentAggregateId:null,causationEventRefs:[seed.eventId],scopeClass:'workspace',basisId:'authority-scope://td32/door',
    payload:{operationId:'abg.operation.workspace.bind',artifactRef:'workspace-binding://td32/door/next',artifactDigest:hash('next binding')}};
  return {store:reopened.store,eventLogPath,run,artifact};
}
function ownerAppend(t,f,row,append){
  const before=bytes(f.eventLogPath),held=events.selectHeldEventStoreDurablePrefix(f.store),count=f.store.readAll().length;
  let value=null,error=null;
  try{value=append(held);}catch(caught){error=caught;}
  const outcome={outcome:error===null?(value?.code===undefined?'appended':'refused'):'threw',code:value?.code??null,
    message:error===null?(value?.message??null):String(error.message??error).slice(0,160),
    bytesUnchanged:Buffer.compare(before,bytes(f.eventLogPath))===0,rowsUnchanged:f.store.readAll().length===count};
  report(row,'owner',outcome);
  if(outcome.bytesUnchanged)assert.deepEqual(events.selectHeldEventStoreDurablePrefix(f.store),held,'the store stays held at its prefix');
  return outcome;
}

test('owner: every other append entry of the event store refuses a store on L before a byte is written',async t=>{
  const f=await legacyStore(t);
  const single=ownerAppend(t,f,'Run start: the Run opening row through admitRuntimeEvent',()=>events.admitRuntimeEvent(f.store,f.run(1)));
  const transaction=ownerAppend(t,f,'Run continuation and actor binding: a row through admitNonEmptyRuntimeEventTransactionAtDurablePrefix',
    held=>events.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(f.store,held,()=>events.admitRuntimeEvent(f.store,f.run(2))));
  const batch=ownerAppend(t,f,'traversal and basis batches: a row through admitRuntimeEventBatch',()=>events.admitRuntimeEventBatch(f.store,[()=>f.run(3)]));
  const artifact=ownerAppend(t,f,'Public operation admission (Product install, workspace bind): appendCheckedArtifactEvent',
    held=>events.appendCheckedArtifactEvent(f.store,held,f.artifact));
  for(const outcome of [single,transaction,batch]){
    assert.equal(outcome.outcome,'threw');assert.match(outcome.message,DOOR);
    assert.equal(outcome.bytesUnchanged,true);assert.equal(outcome.rowsUnchanged,true);
  }
  assert.equal(artifact.outcome,'refused');assert.equal(artifact.code,'sink_unavailable');assert.match(artifact.message,DOOR);
  assert.equal(artifact.bytesUnchanged,true);assert.equal(artifact.rowsUnchanged,true);
  // Reads are as before: the refused store closes at its unchanged prefix and reopens.
  const handoff=f.store.projectReopenAuthorityAndClose();
  assert.equal(handoff.prefix.storeIdentity.eventContractDigest,L);
  const again=events.reopenEventStore(handoff.reopenAuthority);assert.ok(again.store,JSON.stringify(again));
  assert.equal(again.store.readAll().length,1);again.store.closeDurableLog();
});
