import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import test from 'node:test';
import {witnessMechanics,hash,events,resources,nativeWitness,WITNESS_OPERATION_CONTRACTS,admitExactDefinitionCall} from '../support/witness-reprice-mechanics.mjs';
import * as profiles from '../../build/code/src/abg/event_contract_profiles.js';
import {constructExactOperationInvocationCoordinate} from '../../build/code/src/shared/operation_definition_coordinate.js';
const bytes=h=>readFileSync(h.eventLogPath),rowCount=h=>bytes(h).toString().trim().split('\n').length;
function resign(call){const a=call.invocation.invocationAuthority;const {authorityDigest,...ab}=a;a.authorityDigest=hash(ab);const {invocationRef,invocationDigest,...body}=call.invocation;const d=hash(body);call.invocation={...body,invocationDigest:d,invocationRef:`invocation://abiogenesis/${d.slice(7)}`};return call;}
function assertClosedUnchanged(h,before){assert.deepEqual(bytes(h),before);const reopened=resources.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:h.handoff,handoffDigest:hash(h.handoff)});assert.equal(reopened.kind,'acquired_abg_event_resource');resources.closeAbgEventResource(reopened.resource,reopened.resource.entryPrefix);}

// Same descriptor counter seam as the existing cross-cut Public read fixture.
// Record decoder parse calls separately; no runtime helper is replaced.
async function countHistory(path,action){
  const original={openSync:fs.openSync,readSync:fs.readSync,closeSync:fs.closeSync},parse=JSON.parse,selected=new Set(),work={reads:[],decoderParseCalls:0};
  fs.openSync=function(p,...args){const fd=original.openSync.call(this,p,...args);if(String(p)===path)selected.add(fd);return fd;};
  fs.readSync=function(fd,...args){const n=original.readSync.call(this,fd,...args);if(selected.has(fd))work.reads.push({bytes:n,stack:new Error().stack.split('\n').slice(2,10)});return n;};
  fs.closeSync=function(fd){selected.delete(fd);return original.closeSync.call(this,fd);};
  JSON.parse=function(...args){if(new Error().stack.includes('decodeHistoricalEvents'))work.decoderParseCalls++;return parse.apply(this,args);};
  syncBuiltinESMExports();
  try{return {value:await action(),work};}finally{Object.assign(fs,original);JSON.parse=parse;syncBuiltinESMExports();}
}

test('declared ABG constructors remain unchanged and source binding exposes only selected callables',async()=>{
  const a=await import('../../build/code/src/abg/index.js');
  const h=await witnessMechanics();
  assert.strictEqual(a.WITNESS_OPERATION_CONTRACTS,WITNESS_OPERATION_CONTRACTS);
  assert.strictEqual(a.WITNESS_CONTENT_CONTRACTS,nativeWitness.WITNESS_CONTENT_CONTRACTS);
  assert.deepEqual(Object.keys(h.binding.WITNESS_DEFINITION_BINDINGS.admit),['reprice','run-stopped']);
  assert.equal(typeof h.binding.WITNESS_DEFINITION_BINDINGS.admit.reprice,'function');
});

test('exact DefinitionCall admits one native witness pair and fresh-process reads/replay agree (stubbed Product environment)',async()=>{
  const h=await witnessMechanics(),before=bytes(h),beforeStat=statSync(h.eventLogPath),call=await h.call();
  assert.ok(admitExactDefinitionCall(call,WITNESS_OPERATION_CONTRACTS.admit.reprice));
  const result=await h.run(JSON.parse(JSON.stringify(call)));assert.equal(result.exitCode,0,JSON.stringify(result));assert.equal(h.nativeCalls,1);
  const receipt=result.resources.eventResource,successor=receipt.closeHandoff.prefix,rows=events.readRuntimeEventsAtDurablePrefix(successor);
  assert.equal(rows.length,3);assert.deepEqual(rows.slice(1).map(row=>row.kind),['public_operation_admitted','declaration_reprice_admitted']);
  assert.equal(bytes(h).subarray(0,before.length).equals(before),true);assert.equal(statSync(h.eventLogPath).ino,beforeStat.ino);
  assert.deepEqual(receipt.entryPrefix,h.handoff.prefix);assert.equal(successor.storeIdentity.inode,beforeStat.ino);
  const [packet,authority]=h.observed[0];assert.deepEqual(packet.subject,{kind:'authority_basis',...h.historical});assert.deepEqual(packet.context,{kind:'basis',basis:h.historical});
  assert.equal(authority.executionBasis,null);assert.deepEqual(authority.workspaceBinding,h.newW);assert.equal(authority.operationBasis.authorityScopeRef,h.newW.ref);
  assert.equal('executionBasisRef'in rows[1].payload,false);assert.equal(rows[2].basisId,h.historical.ref);assert.equal(rows[2].aggregateId,h.newW.ref);
  const event=rows[2],{eventId,...body}=event;assert.deepEqual(result.ownerOutput.value.admittedEvent,{ref:eventId,digest:hash(body)});
  assert.deepEqual(result.ownerOutput.value.witnessedAct,{ref:event.payload.witnessedActRef,digest:event.payload.witnessedActDigest});
  assert.deepEqual(result.ownerOutput.value.evidence,[h.oldW,h.newW]);
  const record=join(h.scratch,'result.json');writeFileSync(record,JSON.stringify(result),{flag:'wx'});
  const script=`import fs from 'node:fs';import * as a from './build/code/src/abg/index.js';import * as r from './build/code/src/abg/definition_event_resource.js';import {sha256Canonical as h}from './build/code/src/shared/digests.js';const x=JSON.parse(fs.readFileSync(process.argv[1]));const handoff=x.resources.eventResource.closeHandoff;const q=r.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:h(handoff)});if(q.kind!=='acquired_abg_event_resource')throw Error(JSON.stringify(q));const e=a.readRuntimeEventsAtDurablePrefix(q.resource.entryPrefix);const p=a.selectValidatedRuntimeEventPrefix(e);const replay=a.replayValidatedRuntimeEventPrefix(p);r.closeAbgEventResource(q.resource,q.resource.entryPrefix);process.stdout.write(JSON.stringify({events:e,replayDigest:h(replay)}));`;
  const child=spawnSync(process.execPath,['--input-type=module','-e',script,record],{cwd:join(import.meta.dirname,'../..'),encoding:'utf8',env:{...process.env,NODE_OPTIONS:'',NODE_DISABLE_COMPILE_CACHE:'1'}});
  assert.equal(child.status,0,child.stderr);const fresh=JSON.parse(child.stdout);assert.deepEqual(fresh.events,rows);
  const abg=await import('../../build/code/src/abg/index.js');assert.equal(fresh.replayDigest,hash(abg.replayValidatedRuntimeEventPrefix(abg.selectValidatedRuntimeEventPrefix(rows))));
  assert.equal(rowCount(h),3);
  const committed=bytes(h),stale=await h.run(call);
  assert.equal(stale.exitCode,70);assert.equal(stale.failure.fault.stage,'resource_admission');assert.equal(stale.failure.fault.code,'resource_relation_mismatch');assert.equal(h.nativeCalls,1);assert.deepEqual(bytes(h),committed);
  h.advance(result);
  // Lower native duplicate refusal is independently exercised at the new held
  // prefix. This is not a fabricated second admitted Public invocation.
  const reopened=resources.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:h.handoff,handoffDigest:hash(h.handoff)});
  assert.equal(reopened.kind,'acquired_abg_event_resource');
  const duplicated=nativeWitness.admitWitnessedAct({...packet,prefix:reopened.resource.entryPrefix},{...authority,predecessorPrefix:reopened.resource.entryPrefix},{kind:'witness_admission_dependencies',schemaVersion:'5.0.0',eventStore:reopened.resource.store});
  assert.equal(duplicated.code,'duplicate_invocation');assert.equal(rowCount(h),3);resources.closeAbgEventResource(reopened.resource,reopened.resource.entryPrefix);
});

test('external approval remains exact-member only; unselected witness members remain unsupported',async()=>{
  const h=await witnessMechanics(),before=bytes(h);
  for(const member of ['attest','hygiene-stamp','intake','run-resumed'])await assert.rejects(h.call({member}),/exact external approval, actor, request and owner scope/);
  await assert.rejects(h.call({member:'run-stopped'}),/exact external approval, actor, request and owner scope/,'reprice request cannot approve the stop member');
  await assert.rejects(h.call({changeAuthority:a=>{a.actorRef='actor://foreign';}}),/exact external approval/);
  await assert.rejects(h.call({changeAuthority:a=>{a.approval.value.decision='deny';a.approval.digest=hash(a.approval.value);}}),/valid external authority/);
  await assert.rejects(h.call({changeBasis:b=>{b.ownerArtifact.request.artifactRef='artifact://foreign';}}),/verified executing artifact/);
  assert.equal(h.nativeCalls,0);assertClosedUnchanged(h,before);
});

test('crossed or missing authority, request, resource and grant refuse before native owner',async()=>{
  const h=await witnessMechanics(),valid=await h.call(),before=bytes(h);
  const cases=[
    c=>{delete c.resources.admissionAuthority;},
    c=>{c.resources.admissionAuthority.grants[0].grantDigest=hash('forged');},
    c=>{c.resources.admissionAuthority.basis.request.content.value.reason='unapproved request';},
    c=>{c.resources.admissionAuthority.basis.resourceScope.resourcesDigest=hash('foreign resources');},
    c=>{c.invocation.invocationAuthority.slots.actor.actor.ref='actor://foreign';resign(c);},
    c=>{c.invocation.invocationAuthority.slots.workspace_binding.digest=hash('foreign W');resign(c);},
    c=>{c.invocation.invocationAuthority.slots.dependency_lock.digest=hash('foreign lock');resign(c);},
    c=>{c.invocation.invocationAuthority.slots.product_set[0].digest=hash('foreign install');resign(c);},
    c=>{c.invocation.invocationAuthority.slots.execution_basis=h.historical;resign(c);},
    c=>{c.invocation.definitionDigest=hash('foreign definition');resign(c);},
  ];
  for(const mutate of cases){const c=structuredClone(valid);mutate(c);const result=await h.run(c);assert.equal(result.exitCode,70,JSON.stringify(result));assert.equal(h.nativeCalls,0);assertClosedUnchanged(h,before);}
});

test('installed catalog coordinate cannot be substituted with internally consistent caller coordinates',async()=>{
  const h=await witnessMechanics(),call=structuredClone(await h.call()),before=bytes(h),catalog={...call.invocation.contractCatalog,productContentDigest:hash('foreign installed owner')};
  call.invocation.contractCatalog=catalog;
  for(const key of ['invocationContract','requestContract','expectedResultContract','expectedRefusalContract'])call.invocation[key].contractCatalog=catalog;
  resign(call);assert.ok(admitExactDefinitionCall(call,WITNESS_OPERATION_CONTRACTS.admit.reprice));
  const result=await h.run(call);assert.equal(result.exitCode,70);assert.match(result.failure.fault.message,/installed contract/);assert.equal(h.nativeCalls,0);assertClosedUnchanged(h,before);
});

test('native semantic content/context refusals return owner close handoff and no witness event',async()=>{
  for(const [which,expected]of [['content','content_mismatch'],['context','context_mismatch']]){
    const h=await witnessMechanics(),request=h.request(),before=bytes(h);
    if(which==='content')request.content.value.unlisted='not in the closed native contract';
    else {const wrong={ref:'execution-basis://foreign/missing',digest:hash('missing')};request.subject=wrong;request.context.basis=wrong;}
    const result=await h.run(await h.call({request}));assert.equal(result.exitCode,1,JSON.stringify(result));assert.equal(result.ownerOutput.value.code,expected);assert.equal(h.nativeCalls,1);
    assert.deepEqual(result.resources.eventResource.closeHandoff.prefix,h.handoff.prefix);assertClosedUnchanged(h,before);
  }
});

test('generic witness reprice does not implement D2 cover-selection meaning',async()=>{
  const h=await witnessMechanics(),request=h.request();request.content.value.declarationRef='declaration://mechanical/unrelated';
  request.content.value.beforeDigest=hash('another original declaration');request.content.value.afterDigest=hash('another successor declaration');
  const result=await h.run(await h.call({request}));assert.equal(result.exitCode,0,JSON.stringify(result));assert.equal(rowCount(h),3);
});

test('native second-event transaction failure leaves neither event and preserves first cause',async()=>{
  const h=await witnessMechanics({transactionFault:true}),before=bytes(h),result=await h.run(await h.call());
  assert.equal(result.exitCode,70,JSON.stringify(result));assert.equal(h.nativeCalls,1);assert.equal(result.failure.fault.code,'sink_unavailable');
  assert.match(result.failure.fault.message,/injected second-event transaction failure/);assertClosedUnchanged(h,before);assert.equal(rowCount(h),1);
});

test('duplicate native outcome projects a typed basis refusal without forging success',async()=>{
  const h=await witnessMechanics({faultNative:p=>({kind:'witness_admission_refusal',schemaVersion:'5.0.0',disposition:'refused',memberKey:'reprice',subjectRef:p.subject.ref,code:'duplicate_invocation',message:'injected mapping case',successorPrefix:p.prefix})}),before=bytes(h);
  const result=await h.run(await h.call());assert.equal(result.exitCode,1);assert.equal(result.ownerOutput.value.code,'basis_mismatch');assert.deepEqual(result.ownerOutput.value.issuePaths,['/invocationRef']);assertClosedUnchanged(h,before);
});

test('raw Public witness with material history decodes only on acquisition and retains cold correspondence',async()=>{
  const h=await witnessMechanics({seedPayloadBytes:20*1024*1024}),beforeSize=statSync(h.eventLogPath).size,call=JSON.parse(JSON.stringify(await h.call()));
  const measured=await countHistory(h.eventLogPath,()=>h.run(call)),result=measured.value;
  assert.equal(result.exitCode,0,JSON.stringify(result));assert.equal(h.nativeCalls,1);
  console.log(JSON.stringify({kind:'witness_owned_history_boundaries',historyBytes:beforeSize,...measured.work,lowerPremises:'Product verification and environment injected; raw call, native store/admission/append/close/receipt real',installedProof:false}));
  assert.equal(measured.work.reads.length,1,'cold acquisition only: copied packet and successful close/return retain the held proof');
  assert.equal(measured.work.reads[0].bytes,beforeSize);
  assert.equal(measured.work.decoderParseCalls,2,'one seed record parse plus its existing canonical candidate capture');
  const cold=await countHistory(h.eventLogPath,()=>h.binding.witnessRepriceResourcesCorrespond(structuredClone(call.resources),structuredClone(result.resources),call.invocation.request.content.value));
  assert.equal(cold.value,true);assert.equal(cold.work.reads.length,2,'standalone closed/raw correspondence still authenticates both cuts');
  const forged=structuredClone(result.resources);forged.eventResource.entryPrefix=result.resources.eventResource.closeHandoff.prefix;
  const {receiptDigest,...body}=forged.eventResource;forged.eventResource.receiptDigest=hash(body);
  assert.equal(h.binding.witnessRepriceResourcesCorrespond(call.resources,forged,call.invocation.request.content.value),false);
  const valid=bytes(h),changed=Buffer.from(valid);changed[0]=91;writeFileSync(h.eventLogPath,changed);
  assert.equal(h.binding.witnessRepriceResourcesCorrespond(call.resources,result.resources,call.invocation.request.content.value),false,'closed owner fact cannot lend current byte authentication');
  writeFileSync(h.eventLogPath,valid);
});

test('copied witness packets keep I-JSON, wrong-prefix and foreign-store refusals',async()=>{
  let checked=false;
  const h=await witnessMechanics({faultNative:(packet,authority,dependencies)=>{
    const attempt=(p,a=authority,d=dependencies)=>nativeWitness.admitWitnessedAct(p,a,d);
    let getters=0;const accessor={...packet,get content(){getters++;return packet.content;}};
    assert.equal(attempt(accessor).code,'content_invalid');assert.equal(getters,0);
    const copied=structuredClone(packet),{coordinateDigest,...body}=copied.prefix;body.prefixDigest=hash('wrong prefix');copied.prefix={...body,coordinateDigest:hash(body)};
    assert.equal(attempt(copied,{...authority,predecessorPrefix:copied.prefix}).code,'basis_mismatch');
    const foreign=events.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(h.scratch,'foreign.jsonl')});assert.ok(foreign.store);
    try{assert.equal(attempt(packet,authority,{...dependencies,eventStore:foreign.store}).code,'basis_mismatch');}finally{foreign.store.closeDurableLog();}
    checked=true;return attempt(JSON.parse(JSON.stringify(packet)));
  }});
  const result=await h.run(await h.call());assert.equal(result.exitCode,0,JSON.stringify(result));assert.equal(checked,true);assert.equal(rowCount(h),3);
});

test('raw witness acquisition still refuses changed current physical bytes before native admission',async()=>{
  const h=await witnessMechanics(),call=await h.call(),before=bytes(h),changed=Buffer.from(before);changed[0]=91;
  writeFileSync(h.eventLogPath,changed);
  const refused=await h.run(JSON.parse(JSON.stringify(call)));assert.equal(refused.exitCode,70);assert.equal(h.nativeCalls,0);assert.deepEqual(bytes(h),changed);
  writeFileSync(h.eventLogPath,before);const accepted=await h.run(call);assert.equal(accepted.exitCode,0,JSON.stringify(accepted));assert.equal(h.nativeCalls,1);
});

test('all six native witness members consume the admitted held history after raw packet validation',async()=>{
  const h=await witnessMechanics(),first=await h.run(await h.call());assert.equal(first.exitCode,0);
  const reopened=resources.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:first.resources.eventResource.closeHandoff,handoffDigest:hash(first.resources.eventResource.closeHandoff)});assert.equal(reopened.kind,'acquired_abg_event_resource');
  const [original,originalAuthority]=h.observed[0],run={ref:'run://mechanical/absent',digest:hash('absent run')},results=[];
  try{
    const measured=await countHistory(h.eventLogPath,()=>{
      for(const member of nativeWitness.WITNESS_ADMISSION_MEMBER_KEYS){
        const prefix=events.selectHeldEventStoreDurablePrefix(reopened.resource.store),packet=structuredClone({...original,prefix,memberKey:member,act:member}),authority=structuredClone({...originalAuthority,predecessorPrefix:prefix});
        let value=packet.content.value;
        if(member==='attest'){packet.subject={kind:'evidence_claim',ref:prefix.eventLogRef,digest:prefix.prefixDigest};value={scope:'selected_prefix'};}
        if(member==='hygiene-stamp'){packet.subject={kind:'workspace',...h.newW};packet.context={kind:'workspace',workspace:h.newW};value={observedBy:h.actor.ref,observations:[{artifactRef:'artifact://mechanical/untracked',observedDigest:hash('observed'),copyOutRef:null}]};}
        if(member==='intake'){packet.subject={kind:'intake_item',ref:'halt-diagnosis://absent',digest:hash('absent halt')};packet.context={kind:'segment',run,segment:{ref:'event://absent',digest:hash('absent segment')}};authority.executionBasis=h.historical;value={owner:h.actor.ref,changeClass:'realization_refactor',reEntryPoint:'realization',summary:'missing Run control',triagedBy:h.actor.ref};}
        if(member.startsWith('run-')){packet.subject={kind:'run',...run};packet.context={kind:'run',run,basis:h.historical};authority.executionBasis=h.historical;value={reasonKind:member==='run-stopped'?'operator_stop':'operator_resume',reasonDetail:'missing Run control'};}
        const contract=nativeWitness.WITNESS_CONTENT_CONTRACTS[member],valueDigest=hash(value);
        packet.content={kind:member.startsWith('run-')?'typed_reason':'typed_payload',contentContract:{ref:contract.ref,digest:contract.digest},value,valueDigest,valueRef:'witness-content://abiogenesis/'+valueDigest.slice(7)};
        const definition=h.declaration.definitions.find(d=>d.definitionKey.operationId==='abg.operation.witness.admit'&&d.definitionKey.memberKey===member);
        authority.operationBasis={...authority.operationBasis,...constructExactOperationInvocationCoordinate({operationId:'abg.operation.witness.admit',memberKey:member,definitionDigest:definition.definitionDigest},'invocation://mechanical/native-family/'+member,hash(packet))};
        // Native authority preimages are explicit component premises here;
        // this does not activate unsupported Public witness members.
        const result=nativeWitness.admitWitnessedAct(JSON.parse(JSON.stringify(packet)),authority,{kind:'witness_admission_dependencies',schemaVersion:'5.0.0',eventStore:reopened.resource.store});
        if(['reprice','attest','hygiene-stamp'].includes(member))assert.equal(result.kind,'witness_admission',JSON.stringify(result));
        else assert.equal(result.code,'context_mismatch',JSON.stringify(result));
        results.push({member,kind:result.kind,code:result.code??null});
      }
    });
    assert.equal(measured.work.reads.length,0);assert.equal(measured.work.decoderParseCalls,0);
    console.log(JSON.stringify({kind:'native_witness_family_held_reuse',results,...measured.work,authorityPremise:'native lower-owner fixture; no additional Public operation activation'}));
  }finally{resources.closeAbgEventResource(reopened.resource,events.selectHeldEventStoreDurablePrefix(reopened.resource.store));}
});

function profileRequest(h){
  const request=h.request();request.content.value={declarationRef:profiles.ROOT_EVENT_PROFILE_DECLARATION_REF,beforeDigest:events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST,
    afterDigest:events.ROOT_EVENT_CONTRACT_DIGEST,changeClass:'design_reframe',owningTicketRef:'ticket://T-287',reason:profiles.ROOT_EVENT_PROFILE_UPGRADE_REASON};
  request.evidence=[...request.evidence,{ref:profiles.ROOT_CURRENT_EVENT_PROFILE_REF,digest:events.ROOT_EVENT_CONTRACT_DIGEST}];return request;
}

test('Public profile reprice retains the exact L-to-P boundary and standalone cold content checks',async()=>{
  const h=await witnessMechanics({legacyProfile:true}),request=profileRequest(h),call=JSON.parse(JSON.stringify(await h.call({request})));
  const measured=await countHistory(h.eventLogPath,()=>h.run(call)),result=measured.value;
  assert.equal(result.exitCode,0,JSON.stringify(result));assert.equal(result.resources.kind,'witness_profile_reprice_resource_receipt');
  assert.equal(result.resources.eventResource.entryPrefix.storeIdentity.eventContractDigest,events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST);
  assert.equal(result.resources.eventResource.closeHandoff.prefix.storeIdentity.eventContractDigest,events.ROOT_EVENT_CONTRACT_DIGEST);
  const rows=events.readRuntimeEventsAtDurablePrefix(result.resources.eventResource.closeHandoff.prefix);
  assert.equal(events.projectRootEventProfileSchedule(rows).boundaryEventRef,result.resources.boundaryEventRef);assert.equal(rows.length,3);
  assert.equal(measured.work.reads.length,1,'live native profile boundary also retains predecessor correspondence');
  assert.equal(h.binding.witnessRepriceResourcesCorrespond(call.resources,structuredClone(result.resources),request.content.value),true);
  assert.equal(h.binding.witnessRepriceResourcesCorrespond(call.resources,result.resources,{...request.content.value,reason:'changed'}),false);
  assert.equal(h.binding.witnessRepriceResourcesCorrespond(call.resources,{...result.resources,boundaryEventRef:h.seed.eventId},request.content.value),false);
  console.log(JSON.stringify({kind:'witness_profile_boundary',...measured.work,rawColdContentAndBoundaryControls:true}));
  for(const change of [r=>{r.content.value.reason='wrong profile reason';},r=>{r.evidence=r.evidence.filter(e=>e.ref!==profiles.ROOT_CURRENT_EVENT_PROFILE_REF);}]){
    const other=await witnessMechanics({legacyProfile:true}),bad=profileRequest(other),before=bytes(other);change(bad);
    const refused=await other.run(await other.call({request:bad}));assert.equal(refused.exitCode,70);assert.equal(refused.failure.fault.code,'sink_unavailable');assertClosedUnchanged(other,before);
  }
  h.advance(result);const current=bytes(h),repeated=await h.run(await h.call({request:profileRequest(h),serial:'repeated-profile'}));
  assert.equal(repeated.exitCode,70);assertClosedUnchanged(h,current);
});

test('successful append still requires successful physical close before any receipt',async()=>{
  const h=await witnessMechanics({beforeClose:()=>{throw new Error('injected physical close failure');}});
  const result=await h.run(await h.call());assert.equal(result.exitCode,70);assert.match(result.failure.fault.message,/injected physical close failure/);
  assert.equal(result.resources,null);assert.equal(rowCount(h),3,'already appended pair remains a partial effect');
  const stale=resources.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:h.handoff,handoffDigest:hash(h.handoff)});
  assert.notEqual(stale.kind,'acquired_abg_event_resource','old handoff cannot be restamped to recover a missing receipt');
});
