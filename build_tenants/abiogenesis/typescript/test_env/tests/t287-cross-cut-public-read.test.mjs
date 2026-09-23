import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {syncBuiltinESMExports} from 'node:module';
import * as Effect from 'effect/Effect';
import * as product from '../../build/code/src/product/index.js';
import * as pub from '../../build/code/src/public/index.js';
import * as events from '../../build/code/src/abg/event_store.js';
import {projectExactPrefixWorkspaceEnvironment} from '../../build/code/src/abg/environment_admission.js';
import {prepareRunReadAtDurablePrefix} from '../../build/code/src/abg/project_read_ports.js';
import {ABG_PROJECT_READ_CONTRACTS} from '../../build/code/src/abg/project_read_operation_contracts.js';
import {ABG_PROJECT_READ_DEFINITION_BINDINGS} from '../../build/code/src/abg/project_read_definition_bindings.js';
import {admitExactDefinitionCall} from '../../build/code/src/shared/definition_binding_mechanics.js';
import {parseProductManifest,parseProductPublicContract,projectProductManifestOperationCoordinate} from '../../build/code/src/product/verify_product.js';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
const root=resolve(import.meta.dirname,'../..'),hash=product.sha256Canonical;
const fixtureRoot=resolve(root,'../../../.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01');
const digest=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
const manifest=JSON.parse(fs.readFileSync(join(root,'product-toolchain-manifest.json'),'utf8'));
const parsed=parseProductManifest(manifest);assert.ok(parsed);
// Use the existing Product coordinate binder over generated metadata/assets.
// This component fixture is not full archive verification or installed proof.
const verifier=await privateOwner('product/verify_product.js',['bindDefinitionContractCoordinates','PUBLIC_ADAPTER_PROJECTION_PATH']);
const publicRows=parsed.publicContractCatalog.rows.map(row=>parseProductPublicContract(row,parsed.productId));assert.ok(publicRows.every(Boolean));
const files=new Map([verifier.PUBLIC_ADAPTER_PROJECTION_PATH,...publicRows.filter(r=>r.contractId.startsWith('abg.operation.')).map(r=>r.assetLocator.path)]
  .map(p=>[p,fs.readFileSync(join(root,p))]));
const coordinates=verifier.bindDefinitionContractCoordinates(parsed,publicRows,files,parsed.productContentDigest);assert.ok(coordinates?.operations);
const current=projectProductManifestOperationCoordinate(manifest,'abg.operation.project.read');assert.ok(current);
const shapeSlots={workspace_binding:null,product_set:null,dependency_lock:null,catalog_scope:null,execution_program:null,graph_function:null,input_contract:null,
  session_policy:null,capability_grants:null,actor:null,transport_steering:null,verification_references:null,execution_basis:null};

async function fixture(t) {
  // Copy only the exact previously closed R10 fixture prefix into a disposable
  // component resource. Never acquire or mutate its original resource or C10.
  const fd=fs.openSync(join(fixtureRoot,'events-01/runtime.events.jsonl'),'r');
  const bytes=Buffer.alloc(13540472);try {assert.equal(fs.readSync(fd,bytes,0,bytes.length,0),bytes.length);} finally {fs.closeSync(fd);}
  assert.equal(digest(bytes),'sha256:4f561ceacf40fd13db82132d93890cb67750453dfa81a75c0401f04bd9345649');
  const readyBytes=fs.readFileSync(join(fixtureRoot,'attempt-01/program-ready-16.json'));
  assert.equal(digest(readyBytes),'sha256:2147862a16f8526d546ca918563b8d8b8094e684d8f629784b256e4803d3fc02');
  const ready=JSON.parse(readyBytes),rows=bytes.toString('utf8').trimEnd().split('\n').map(JSON.parse);
  const scratch=fs.mkdtempSync(join(tmpdir(),'abi5-cross-cut-read-')),eventLogPath=join(scratch,'fixture.events.jsonl');
  t.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));fs.writeFileSync(eventLogPath,bytes,{flag:'wx'});
  const stat=fs.statSync(eventLogPath),body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath,device:stat.dev,inode:stat.ino,
    eventLogDigest:digest(bytes),durableByteLength:bytes.length,eventContractDigest:events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST};
  // This explicit cold input selects disposable fixture bytes only. The native
  // owner validates all rows and issues the genuine handoff used by Definition calls.
  const reopened=events.reopenEventStore({...body,authorityDigest:hash(body)});assert.ok(reopened.store,JSON.stringify(reopened));
  const owner=reopened.store;t.after(()=>owner.closeDurableLog());
  const prefix=events.selectHeldEventStoreDurablePrefix(owner),blocked=rows.find(r=>r.admissionOrdinal===846),child=rows.find(r=>r.admissionOrdinal===67);
  assert.equal(blocked.payload.disposition,'blocked');assert.equal(child.kind,'graph_call_closed');
  const blockedTruth=prepareRunReadAtDurablePrefix(prefix,'run_status',blocked.runId);assert.ok(blockedTruth);
  const environment=projectExactPrefixWorkspaceEnvironment(prefix,blockedTruth.workspaceBinding);assert.equal(environment.kind,'exact_prefix_workspace_environment');
  const selections={};for(const member of ['run_status','run_result','run_replay','graph_call_result','graph_call_replay']) {
    const target=member.startsWith('graph_call')?child.graphCallId:blocked.runId;
    selections[member]=prepareRunReadAtDurablePrefix(prefix,member,target);assert.ok(selections[member]);
    assert.deepEqual(selections[member].workspaceBinding,blockedTruth.workspaceBinding);
  }
  const declarationProof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:ready.call.resources.catalog,catalogView:ready.call.resources.catalogView};
  const historicalOwners=environment.productInstalls.filter(i=>i.publicContracts.some(r=>r.contractId==='abg.operation.project.read'));
  assert.equal(historicalOwners.length,1);const historical=historicalOwners[0];
  assert.notEqual(historical.productContentDigest,current.contractCatalog.productContentDigest);
  assert.notEqual(historical.catalogDigest,current.contractCatalog.catalogDigest);
  assert.notEqual(historical.publicContracts.find(r=>r.contractId==='abg.operation.project.read').contractDigest,current.flatRow.contractDigest);
  const handoff=owner.projectReopenAuthorityAndClose();
  const call=(member,{catalog=current.contractCatalog,slots:slotChanges={},proof=declarationProof,sourceChanges={}}={})=>{
    const packet=ABG_PROJECT_READ_CONTRACTS[member],graph=member.startsWith('graph_call');
    const grants=packet.metadata.capabilityRefs.map(capabilityRef=>product.constructCapabilityGrant(environment.workspaceAuthorityBasis,environment.workspaceBinding.authorizedActorRef,
      packet.definitionKey.operationId,capabilityRef,{admittedInstalls:environment.productInstalls,workspaceBinding:environment.workspaceBinding,fixedPacket:packet}));
    assert.equal(grants[0].operationContract.contractCatalog.productContentDigest,historical.productContentDigest);
    const slots={...shapeSlots,workspace_binding:blockedTruth.workspaceBinding,product_set:environment.productInstalls.map(i=>({ref:i.installId,digest:i.productContentDigest})),
      dependency_lock:{ref:environment.resolvedProductLock.lockId,digest:environment.resolvedProductLock.lockDigest},
      capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))},...slotChanges};
    // Incorrect-catalog variants are explicit adversarial candidates, never
    // treated as owner-issued current verification coordinates.
    const selected=structuredClone(coordinates);for(const operation of selected.operations)for(const entry of operation.members)for(const c of Object.values(entry.slots))if(c)c.contractCatalog=catalog;
    return pub.constructInstalledPublicDefinitionCall({product,installedPublic:pub,definitionContractCoordinates:selected,contractCatalog:catalog,...packet.definitionKey,
      request:{caseKey:member,source:{sourceKind:graph?'graph_call':'run',sourceRef:selections[member].source.ref,sourceDigest:selections[member].source.digest,...sourceChanges},
        projectionBasis:{projectionBasisRef:handoff.prefix.eventLogRef,projectionBasisDigest:handoff.prefix.coordinateDigest},
        selector:member.endsWith('_replay')?{kind:'ordinal_page',fromOrdinal:0,limit:10000}:{kind:'none'}},slots,
      resources:{kind:'abg_project_read_resource_assertion',schemaVersion:'5.0.0',eventResource:{kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:hash(handoff)},
        ...(graph&&proof!==undefined?{declarationProof:proof}:{})},requestRef:'request://cross-cut/'+member,correlationRef:'correlation://cross-cut',eventTime:'2026-09-23T00:00:00.000Z',provenanceRefs:['proof://cross-cut/component']});
  };
  const invoke=async (candidate,checkBytes=true)=>{
    const member=candidate.invocation.definitionKey.memberKey;
    assert.ok(admitExactDefinitionCall(candidate,ABG_PROJECT_READ_CONTRACTS[member]));
    const result=await Effect.runPromise(ABG_PROJECT_READ_DEFINITION_BINDINGS[member](structuredClone(candidate)));
    assert.deepEqual(result.resources.eventResource.closeHandoff.prefix,handoff.prefix);
    if(checkBytes)assert.equal(digest(fs.readFileSync(eventLogPath)),digest(bytes));
    return result.ownerOutput;
  };
  return {call,invoke,bytes,eventLogPath,handoff,historical,declarationProof,selections,rows};
}

async function measureHistoryReads(f, action) {
  const originals={openSync:fs.openSync,readSync:fs.readSync,closeSync:fs.closeSync},selected=new Set();let reads=0,readBytes=0;
  fs.openSync=function(path,...args){const fd=originals.openSync.call(this,path,...args);if(String(path)===f.eventLogPath)selected.add(fd);return fd;};
  fs.readSync=function(fd,...args){const n=originals.readSync.call(this,fd,...args);if(selected.has(fd)){reads++;readBytes+=n;}return n;};
  fs.closeSync=function(fd){selected.delete(fd);return originals.closeSync.call(this,fd);};syncBuiltinESMExports();
  try {return {value:await action(),reads,readBytes};} finally {Object.assign(fs,originals);syncBuiltinESMExports();}
}

test('different-cut native Definition reads keep blocked absence and exact historical child result/replay',async t=>{
  const f=await fixture(t),out={};
  const measurements={};
  for(const member of ['run_status','run_result','run_replay','graph_call_result','graph_call_replay']) {
    const measured=await measureHistoryReads(f,()=>f.invoke(f.call(member),false));out[member]=measured.value;
    assert.equal(measured.reads,1,member+' must retain the acquired prefix through late proof admission');
    assert.equal(measured.readBytes,f.bytes.length,member+' reconstructs history only at acquisition');
    measurements[member]={reads:measured.reads,readBytes:measured.readBytes};
  }
  assert.equal(digest(fs.readFileSync(f.eventLogPath)),digest(f.bytes));
  assert.equal(out.run_status.value.projection.status,'blocked');
  assert.equal(out.run_result.outcomeKind,'refusal');assert.equal(out.run_result.value.code,'not_found');
  assert.equal(out.run_replay.value.projection.status,'blocked');assert.equal(out.run_replay.value.projection.terminalResult,null);
  const result=out.graph_call_result.value.projection.terminalResult;
  assert.equal(out.graph_call_replay.value.projection.status,'closed');assert.deepEqual(out.graph_call_replay.value.projection.terminalResult,result);
  const original=f.rows.find(r=>r.eventId===result.producer.resultAdmissionEventRef);assert.ok(original);assert.deepEqual(result.value,original.payload.value);
  assert.equal(result.producer.graphCallRef,f.selections.graph_call_result.source.ref);
  console.log(JSON.stringify({kind:'cross_cut_read_component',members:5,currentCatalog:current.contractCatalog,historicalCatalogDigest:f.historical.catalogDigest,
    historyReadsByMember:measurements,blocked:'blocked',absentResult:'not_found',childValueDigest:result.valueDigest,installedProof:false}));
});

test('current catalog and historical source permission refuse independently',async t=>{
  const f=await fixture(t),refused=async (c,path)=>{const r=await f.invoke(c);assert.equal(r.outcomeKind,'refusal');assert.equal(r.value.code,'projection_basis_mismatch');assert.deepEqual(r.value.issuePaths,[path]);};
  const historicalCatalog={...current.contractCatalog,productContentDigest:f.historical.productContentDigest,catalogDigest:f.historical.catalogDigest,catalogId:f.historical.catalogId};
  await refused(f.call('run_status',{catalog:historicalCatalog}),'/contractCatalog');
  await refused(f.call('run_status',{catalog:{...current.contractCatalog,catalogDigest:hash('wrong-current-catalog')}}),'/contractCatalog');
  const correct=f.call('run_status');
  await refused(f.call('run_status',{slots:{capability_grants:{...correct.invocation.invocationAuthority.slots.capability_grants,grants:[{ref:'grant://foreign',digest:hash('foreign')}]}}}),'/invocationAuthority');
  await refused(f.call('run_status',{slots:{workspace_binding:{ref:'workspace-binding://foreign',digest:hash('foreign')}}}),'/invocationAuthority/slots/workspace_binding');
  await refused(f.call('run_status',{slots:{product_set:[{ref:'product-install://foreign',digest:hash('foreign')}]}}),'/invocationAuthority');
  await refused(f.call('run_status',{slots:{dependency_lock:{ref:'product-lock://foreign',digest:hash('foreign')}}}),'/invocationAuthority');
  const obsolete=structuredClone(correct);for(const key of ['requestContract','expectedResultContract','expectedRefusalContract'])obsolete.invocation[key].flatRow.contractDigest=f.historical.publicContracts.find(r=>r.contractId==='abg.operation.project.read').contractDigest;
  const {invocationRef,invocationDigest,...body}=obsolete.invocation;obsolete.invocation.invocationDigest=hash(body);obsolete.invocation.invocationRef='invocation://abiogenesis/'+hash(body).slice(7);
  assert.equal(admitExactDefinitionCall(obsolete,ABG_PROJECT_READ_CONTRACTS.run_status),null);
});

test('historical source digest and child declaration evidence remain necessary',async t=>{
  const f=await fixture(t);
  const wrong=await f.invoke(f.call('run_status',{sourceChanges:{sourceDigest:hash('wrong-source')}}));assert.equal(wrong.value.code,'source_digest_mismatch');
  const missing=f.call('graph_call_result');delete missing.resources.declarationProof;
  assert.equal((await f.invoke(missing)).outcomeKind,'refusal');
  const proof=structuredClone(f.declarationProof);proof.catalogView.allowlist=[];
  assert.equal((await f.invoke(f.call('graph_call_result',{proof}))).outcomeKind,'refusal');
  assert.equal((await f.invoke(f.call('graph_call_result'))).outcomeKind,'result');
});

test('Product metadata projection refuses incoherent catalog and missing or duplicate operation rows',()=>{
  const wrong=structuredClone(manifest);wrong.publicContractCatalog.catalogDigest=hash('wrong');
  assert.equal(projectProductManifestOperationCoordinate(wrong,'abg.operation.project.read'),null);
  for(const change of [x=>{x.publicContractCatalog.rows=x.publicContractCatalog.rows.filter(r=>r.contractId!=='abg.operation.project.read');},x=>{x.publicContractCatalog.rows.push(x.publicContractCatalog.rows.find(r=>r.contractId==='abg.operation.project.read'));}]) {
    const x=structuredClone(manifest);change(x);
    const {catalogDigest,...body}=x.publicContractCatalog;x.publicContractCatalog.catalogDigest=hash(body);
    x.contributionManifest.publicContractCatalogDigest=x.publicContractCatalog.catalogDigest;
    x.contributionManifestDigest=hash(x.contributionManifest);
    assert.ok(parseProductManifest(x),'row refusal is separate from manifest shape and identity');
    assert.equal(projectProductManifestOperationCoordinate(x,'abg.operation.project.read'),null);
  }
});


test('late child proof preserves only the exact acquired prefix; copies and closed owners reconstruct, changed bytes refuse',async t=>{
  const f=await fixture(t),opened=events.reopenEventStore(f.handoff.reopenAuthority);assert.ok(opened.store);
  t.after(()=>opened.store.closeDurableLog());const prefix=opened.prefix;
  const target=f.selections.graph_call_result.source.ref;
  const project=coordinate=>{
    const prepared=prepareRunReadAtDurablePrefix(coordinate,'graph_call_result',target);assert.ok(prepared);
    return prepared.project(f.declarationProof);
  };
  const warm=await measureHistoryReads(f,()=>project(prefix));assert.equal(warm.value.kind,'abg_project_read_projection');
  assert.equal(warm.reads,0,'already acquired history remains owned throughout terminal declaration reconstruction');
  const selected=prepareRunReadAtDurablePrefix(prefix,'graph_call_result',target);assert.ok(selected);
  for(const proof of [undefined,{...f.declarationProof,schemaVersion:'foreign'},
    {...f.declarationProof,catalogView:{...f.declarationProof.catalogView,allowlist:[]}}]) {
    assert.equal(selected.project(proof).kind,'abg_project_read_refusal','late proof is admitted on each call');
  }
  assert.deepEqual(selected.project(f.declarationProof),warm.value,'a prior refusal does not poison the admitted owner context');
  const copied=await measureHistoryReads(f,()=>project(structuredClone(prefix)));
  assert.ok(copied.reads>0,'equal bytes do not acquire owner authority');assert.deepEqual(copied.value,warm.value);
  const foreignBody={...prefix,storeIdentity:{...prefix.storeIdentity,inode:prefix.storeIdentity.inode+1}};
  delete foreignBody.coordinateDigest;
  assert.equal(prepareRunReadAtDurablePrefix({...foreignBody,coordinateDigest:hash(foreignBody)},'graph_call_result',target),null);
  assert.equal(prepareRunReadAtDurablePrefix({...prefix,prefixDigest:hash('wrong')},'graph_call_result',target),null);
  opened.store.closeDurableLog();
  const closed=await measureHistoryReads(f,()=>project(prefix));assert.ok(closed.reads>0,'closed owner cannot retain live acquisition authority');
  assert.deepEqual(closed.value,warm.value);
  // A prepared historical read retains its semantic context, but the child
  // declaration callback must still authenticate bytes once its owner closes.
  const prepared=prepareRunReadAtDurablePrefix(prefix,'graph_call_result',target);assert.ok(prepared);
  const fd=fs.openSync(f.eventLogPath,'r+');try{fs.writeSync(fd,Buffer.from('!'),0,1,0);}finally{fs.closeSync(fd);}
  const stale=prepared.project(f.declarationProof);assert.equal(stale.kind,'abg_project_read_refusal');
  assert.equal(prepareRunReadAtDurablePrefix(prefix,'graph_call_result',target),null);
});
