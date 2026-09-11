import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import test from 'node:test';
import {witnessMechanics,hash,events,resources,nativeWitness,WITNESS_OPERATION_CONTRACTS,admitExactDefinitionCall} from '../support/witness-reprice-mechanics.mjs';
const bytes=h=>readFileSync(h.eventLogPath),rowCount=h=>bytes(h).toString().trim().split('\n').length;
function resign(call){const a=call.invocation.invocationAuthority;const {authorityDigest,...ab}=a;a.authorityDigest=hash(ab);const {invocationRef,invocationDigest,...body}=call.invocation;const d=hash(body);call.invocation={...body,invocationDigest:d,invocationRef:`invocation://abiogenesis/${d.slice(7)}`};return call;}
function assertClosedUnchanged(h,before){assert.deepEqual(bytes(h),before);const reopened=resources.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:h.handoff,handoffDigest:hash(h.handoff)});assert.equal(reopened.kind,'acquired_abg_event_resource');resources.closeAbgEventResource(reopened.resource,reopened.resource.entryPrefix);}

test('declared ABG export exposes the unchanged constructor data and only the selected callable',async()=>{
  const a=await import('../../build/code/src/abg/index.js');
  assert.strictEqual(a.WITNESS_OPERATION_CONTRACTS,WITNESS_OPERATION_CONTRACTS);
  assert.strictEqual(a.WITNESS_CONTENT_CONTRACTS,nativeWitness.WITNESS_CONTENT_CONTRACTS);
  assert.deepEqual(Object.keys(a.WITNESS_DEFINITION_BINDINGS.admit),['reprice']);
  assert.equal(typeof a.WITNESS_DEFINITION_BINDINGS.admit.reprice,'function');
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
  assert.equal(stale.exitCode,70);assert.equal(stale.failure.fault.stage,'resource_acquisition');assert.equal(h.nativeCalls,1);assert.deepEqual(bytes(h),committed);
  h.advance(result);
  // Lower native duplicate refusal is independently exercised at the new held
  // prefix. This is not a fabricated second admitted Public invocation.
  const reopened=resources.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:h.handoff,handoffDigest:hash(h.handoff)});
  assert.equal(reopened.kind,'acquired_abg_event_resource');
  const duplicated=nativeWitness.admitWitnessedAct({...packet,prefix:reopened.resource.entryPrefix},{...authority,predecessorPrefix:reopened.resource.entryPrefix},{kind:'witness_admission_dependencies',schemaVersion:'5.0.0',eventStore:reopened.resource.store});
  assert.equal(duplicated.code,'duplicate_invocation');assert.equal(rowCount(h),3);resources.closeAbgEventResource(reopened.resource,reopened.resource.entryPrefix);
});

test('reprice external approval is exact-member only; other witness members remain unsupported',async()=>{
  const h=await witnessMechanics(),before=bytes(h);
  for(const member of ['attest','hygiene-stamp','intake','run-resumed','run-stopped'])await assert.rejects(h.call({member}),/exact external approval, actor, request and owner scope/);
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
