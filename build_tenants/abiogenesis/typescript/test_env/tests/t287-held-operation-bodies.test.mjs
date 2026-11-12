import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {basename,join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {constructInstalledStartCall,constructInstalledRunReadCall} from '../support/registered-graph-selection.mjs';
import {prepareLanguageSmokeFixture,constructLanguageTestInput} from '../support/language-smoke-fixture.mjs';

const packageRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../..');

// §10.12 O1 lifetime, read operations (TD-51a): a read operation owns the
// bodies it selects. Inside one read each body is read from its location at
// most once; when the read returns nothing it selected stays held, and an open
// run scope's own O1 retention is neither widened nor shortened by the read.
// The O1 gauges count run-scope retention only; operation-held bodies are
// observed here by physical reads of the store's own log.

const ZERO=Object.freeze({openHandles:0,retainedRows:0,retainedPayloadBytes:0,historyBasisBodies:0,historyBasisPayloadBytes:0});

// Physical reads of one event log during `action`, by row. A held store keeps
// its descriptor open, so reads are matched by file identity, not by path. A
// read that starts at a row offset and returns that row's length is a body
// read by location; anything else would be a decode chunk.
async function measureBodyReads(logPath,action){
  const identity=fs.statSync(logPath),original=fs.readSync,reads=[];
  fs.readSync=function(fd,buffer,offset,length,position){
    const count=original.call(this,fd,buffer,offset,length,position),status=fs.fstatSync(fd);
    if(status.dev===identity.dev&&status.ino===identity.ino)
      reads.push({position:typeof offset==='object'&&offset!==null?offset.position:position,bytes:count});
    return count;
  };
  syncBuiltinESMExports();
  let value;
  try{value=await action();}finally{fs.readSync=original;syncBuiltinESMExports();}
  const text=fs.readFileSync(logPath),rows=[];
  for(let offset=0;offset<text.length;){
    const end=text.indexOf(10,offset);
    rows.push({offset,byteLength:end+1-offset,kind:JSON.parse(text.subarray(offset,end).toString('utf8')).kind});
    offset=end+1;
  }
  const byOffset=new Map(rows.map((row,index)=>[row.offset,index])),perRow=new Map();let other=0;
  for(const read of reads){
    const index=byOffset.get(read.position);
    if(index!==undefined&&rows[index].byteLength===read.bytes)perRow.set(index,(perRow.get(index)??0)+1);else other++;
  }
  const select=basis=>new Map([...perRow].filter(([index])=>(rows[index].kind==='basis_admitted')===basis));
  return {value,rows,perRow,other,basis:select(true),nonBasis:select(false)};
}
const counts=map=>Object.fromEntries([...map].sort(([a],[b])=>a-b));
const max=map=>Math.max(0,...map.values());

test('TD-51a: a read operation reads each selected body once and holds none after it returns; an open run scope keeps exactly its own',
  {timeout:600_000},async t=>{
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async basis=>[await prepareLanguageSmokeFixture(basis)]});
  const {installedRoot,product,store}=env;
  const load=name=>import(pathToFileURL(join(installedRoot,'build/code/src',name+'.js')).href);
  const [abg,publicApi,prefixOwner,historyOwner]=await Promise.all(['abg/index','public/index','abg/event_prefix','abg/runtime_history'].map(load));
  const setupHandoff=store.projectReopenAuthorityAndClose();
  const acquired=abg.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:setupHandoff,
    handoffDigest:product.sha256Canonical(setupHandoff)});
  assert.equal(acquired.kind,'acquired_abg_event_resource',JSON.stringify(acquired));
  const held={resource:acquired.resource,selection:abg.selectAcquiredAbgEventResource(acquired.resource,acquired.resource.entryPrefix)};
  t.after(()=>{if(held.resource!==null)abg.abandonAbgEventResource(held.resource);});
  const logPath=fileURLToPath(held.selection.prefix.eventLogRef);
  const owned=()=>prefixOwner.projectOwnedRuntimeEventPrefixAtDurablePrefix(held.selection.prefix);
  const gauges=()=>historyOwner.observeRuntimeHistoryBasisRetention(owned().selection);
  // Each call borrows the held resource and passes its successor on, so the
  // store history outlives every read below.
  const start=async(identity,text)=>{
    const {call}=await constructInstalledStartCall({environment:env,publicApi,eventResource:held.selection,
      input:constructLanguageTestInput(text),identity});
    const measured=await measureBodyReads(logPath,()=>publicApi.runInstalledDefinitionCallWithResource(held.selection,call)),outcome=measured.value;
    assert.equal(outcome.kind,'installed_definition_call_transport_result',JSON.stringify(outcome).slice(0,2000));
    assert.equal(outcome.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(outcome.receipt.ownerOutput).slice(0,2000));
    held.selection=outcome.receipt.resources.eventResource.successor;
    return {receipt:outcome.receipt,measured};
  };
  const read=(memberKey,source,identity)=>async()=>{
    const {call}=constructInstalledRunReadCall({environment:env,publicApi,memberKey,source,eventResource:held.selection,identity,
      selector:memberKey.endsWith('_replay')?{kind:'ordinal_page',fromOrdinal:0,limit:1024}:{kind:'none'}});
    // Only the actual read operation is measured, not its call construction.
    const measured=await measureBodyReads(logPath,()=>publicApi.runInstalledDefinitionCallWithResource(held.selection,call)),outcome=measured.value;
    assert.equal(outcome.kind,'installed_definition_call_transport_result',JSON.stringify(outcome).slice(0,2000));
    assert.equal(outcome.receipt.resources.eventResource.kind,'abg_event_resource_completion','a held read completes and keeps its owner');
    held.selection=outcome.receipt.resources.eventResource.successor;
    return {...measured,value:outcome.receipt.ownerOutput};
  };

  // Two actual Runs give two invocations' basis rows outside every open scope.
  await start('td51a-run-0','Operation bodies 0');
  const second=await start('td51a-run-1','Operation bodies 1');
  assert.deepEqual(gauges(),ZERO,'completed Runs retain nothing');
  const source=second.receipt.resources.run;
  const basisRows=[];{const rows=owned().selection.select('kind:basis_admitted');for(let i=0;i<rows.length;i++)basisRows.push(rows.row(i));}
  assert.ok(basisRows.length>=2,'two Runs admitted their bases');
  const observations={basisRows:basisRows.length,secondRun:{basisReads:counts(second.measured.basis),otherBodyReads:second.measured.nonBasis.size}};

  const selectedBasis={};
  for(const member of ['run_status','run_replay']){
    // One read operation: each body it selects is read from its location at
    // most once, and a held read decodes nothing.
    const first=await read(member,source,'td51a-'+member+'-1')();
    assert.equal(first.other,0,member+': a held read makes no decode read');
    assert.ok(max(first.perRow)<=1,member+': each body is read at most once within the read: '+JSON.stringify(counts(first.perRow)));
    assert.ok(first.basis.size>=1,member+': the read selects basis bodies: '+JSON.stringify(counts(first.perRow)));
    assert.deepEqual(gauges(),ZERO,member+': a returned read leaves no O1 retention');
    // The first read held nothing past its return: the identical second read
    // reads each of those basis bodies from its location again, once, and
    // projects the same output. Non-basis bodies stay generation-kept.
    const again=await read(member,source,'td51a-'+member+'-2')();
    assert.deepEqual(again.value,first.value,member+': the repeated read projects the same output');
    assert.deepEqual(counts(again.basis),counts(first.basis),member+': every basis body the first read selected is read again, once');
    assert.equal(again.nonBasis.size,0,member+': non-basis bodies stay with the history generation');
    assert.deepEqual(gauges(),ZERO);
    observations[member]={firstReads:counts(first.perRow),againBasisReads:counts(again.basis)};
    selectedBasis[member]=[...first.basis.keys()].sort((a,b)=>a-b);
  }

  // Run scopes across a read (§10.12 O1 handles). A scope of another
  // invocation adds nothing: the read's bodies stay operation-held and are
  // read again by the next read. A scope of the read's own invocation keeps
  // its bodies: the read's release does not drop them, the next read does not
  // read them again, and the scope's release does.
  const invocationAt=index=>basisRows.find(row=>row.envelope.admissionOrdinal-1===index).scalarPayload.invocationRef;
  const selected=selectedBasis.run_status,readInvocations=new Set(selected.map(invocationAt));
  const otherInvocation=basisRows.map(row=>row.scalarPayload.invocationRef).find(ref=>!readInvocations.has(ref));
  assert.equal(typeof otherInvocation,'string','one Run\'s basis lies outside the read\'s selection');
  const releaseOther=prefixOwner.retainExecutionBasisLifetime(held.selection.prefix,otherInvocation);
  const underOther=await read('run_status',source,'td51a-other-scope')();
  assert.deepEqual(Object.keys(counts(underOther.basis)).map(Number),selected,'a scope of another invocation keeps none of the read\'s bodies');
  assert.deepEqual(gauges(),{...ZERO,openHandles:1},'the read adds nothing to O1 retention');
  releaseOther();
  assert.deepEqual(gauges(),ZERO);
  const ownInvocation=invocationAt(selected.at(-1)),own=selected.filter(index=>invocationAt(index)===ownInvocation);
  const releaseOwn=prefixOwner.retainExecutionBasisLifetime(held.selection.prefix,ownInvocation);
  await read('run_status',source,'td51a-own-scope-1')();
  const inScope=gauges();
  assert.equal(inScope.openHandles,1);
  assert.equal(inScope.historyBasisBodies,own.length,'the open scope keeps exactly its own selected bodies: '+JSON.stringify({inScope,selected,own}));
  const underOwn=await read('run_status',source,'td51a-own-scope-2')();
  assert.deepEqual(gauges(),inScope,'the read\'s release leaves the run scope\'s retention unchanged');
  assert.deepEqual(Object.keys(counts(underOwn.basis)).map(Number),selected.filter(index=>!own.includes(index)),
    'only bodies outside the open scope are read again');
  releaseOwn();
  assert.deepEqual(gauges(),ZERO,'the scope release drops its own bodies');
  const afterScope=await read('run_status',source,'td51a-after-scope')();
  assert.deepEqual(Object.keys(counts(afterScope.basis)).map(Number),selected,'after the scope release the read reads them again');

  // The owner mechanism on the owned cut: outside an operation each selection
  // is its own consumer; under one operation hold a body is read once; after
  // the release it is read again.
  const prefix=owned(),key='kind:basis_admitted';
  const twice=()=>{prefixOwner.indexedRuntimeEvents(prefix,key);prefixOwner.indexedRuntimeEvents(prefix,key);};
  const unheld=await measureBodyReads(logPath,twice);
  assert.deepEqual(Object.values(counts(unheld.basis)),basisRows.map(()=>2),'two consumers outside an operation read each basis body twice');
  const releaseOperation=prefixOwner.holdOperationBodies(held.selection.prefix);
  const heldOnce=await measureBodyReads(logPath,twice);
  assert.deepEqual(Object.values(counts(heldOnce.basis)),basisRows.map(()=>1),'one operation reads each basis body once');
  assert.deepEqual(gauges(),ZERO,'an operation hold is not O1 retention');
  releaseOperation();releaseOperation();
  const released=await measureBodyReads(logPath,()=>prefixOwner.indexedRuntimeEvents(prefix,key));
  assert.deepEqual(Object.values(counts(released.basis)),basisRows.map(()=>1),'after the last release the bodies are read again; a repeated release is inert');

  // Physical close disposes an open operation hold with the O1 handles: the
  // closed cut reads its bodies by location again, and the late release is inert.
  const closingCut=owned(),closingHold=prefixOwner.holdOperationBodies(held.selection.prefix);
  const closing=await measureBodyReads(logPath,()=>prefixOwner.indexedRuntimeEvents(closingCut,key));
  assert.deepEqual(Object.values(counts(closing.basis)),basisRows.map(()=>1));
  const closed=abg.closeAbgEventResource(held.resource,held.selection.prefix);held.resource=null;
  assert.equal(closed.kind,'abg_event_resource_receipt');
  const afterClose=await measureBodyReads(logPath,()=>prefixOwner.indexedRuntimeEvents(closingCut,key));
  assert.deepEqual(Object.values(counts(afterClose.basis)),basisRows.map(()=>1),'physical close disposed the open operation hold');
  closingHold();
  const closedHold=prefixOwner.holdOperationBodies(held.selection.prefix);
  const afterClosedHold=await measureBodyReads(logPath,()=>{prefixOwner.indexedRuntimeEvents(closingCut,key);prefixOwner.indexedRuntimeEvents(closingCut,key);});
  closedHold();
  assert.deepEqual(Object.values(counts(afterClosedHold.basis)),basisRows.map(()=>2),'a closed coordinate opens no hold');
  t.diagnostic('TD51A_OPERATION_BODIES '+JSON.stringify({...observations,
    meaning:'per-row counts of physical body reads by location in the store log; secondRun is an observation of a run operation, not asserted'}));

  // TD-51b: the release evidence read and the workspace binding run their
  // synchronous bodies through the one hold owner. Each acquires the closed
  // store by its reopen handoff, so the acquisition decode reads every row
  // once; inside the operation each basis body is read from its location at
  // most once. Without the hold each artifact-truth consumer reads it again.
  let handoff=closed.closeHandoff;
  const hash=product.sha256Canonical,actorRef=env.workspaceBinding.authorizedActorRef;
  const reopen=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:hash(handoff)});
  const slotsOf=extra=>({workspace_binding:null,product_set:null,dependency_lock:null,catalog_scope:null,execution_program:null,graph_function:null,
    input_contract:null,session_policy:null,capability_grants:null,actor:null,transport_steering:null,verification_references:null,execution_basis:null,...extra});
  const grantsOf=(capabilityRefs,grants)=>({requiredCapabilityRefs:[...capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))});
  const catalogOf=key=>env.verified.definitionContractCoordinates.operations.find(o=>o.operationId===key.operationId)
    .members.find(m=>m.memberKey===key.memberKey).slots.request.contractCatalog;
  const transported=async(label,call)=>{
    const measured=await measureBodyReads(logPath,()=>publicApi.runInstalledDefinitionCallTransport({kind:'reopen',closeHandoff:handoff},call));
    const outcome=measured.value;
    assert.equal(outcome.kind,'installed_definition_call_transport_result',label+': '+JSON.stringify(outcome).slice(0,2000));
    const receipt=outcome.receipt.resources.eventResource;
    assert.equal(receipt.kind,'abg_event_resource_receipt',label+': the reopened operation closes its resource');
    handoff=receipt.closeHandoff;
    assert.ok(measured.basis.size>=1,label+': the operation selects basis bodies: '+JSON.stringify(counts(measured.perRow)));
    assert.ok(max(measured.basis)<=1,label+': each basis body is read at most once within the operation: '+JSON.stringify(counts(measured.basis)));
    return {ownerOutput:outcome.receipt.ownerOutput,basis:counts(measured.basis)};
  };
  const {PRODUCT_PROJECT_READ_CONTRACTS}=await load('product/project_read_operation_contracts');
  const releasePacket=PRODUCT_PROJECT_READ_CONTRACTS.release_evidence,releaseKey=releasePacket.definitionKey;
  const releaseGrants=releasePacket.metadata.capabilityRefs.map(capabilityRef=>product.constructCapabilityGrant(env.workspaceAuthority,actorRef,
    releaseKey.operationId,capabilityRef,{admittedInstalls:env.admittedInstalls,workspaceBinding:env.workspaceBinding,fixedPacket:releasePacket}));
  const absent={ref:'release-observation://td51b/absent',digest:hash('td51b absent release observation')};
  const releaseRead=await transported('release_evidence',publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:publicApi,
    definitionContractCoordinates:env.verified.definitionContractCoordinates,contractCatalog:catalogOf(releaseKey),...releaseKey,
    request:{caseKey:'release_evidence',source:{sourceKind:'release_cut',sourceRef:'release-cut://td51b/absent',sourceDigest:hash('td51b absent cut')},
      projectionBasis:{projectionBasisRef:handoff.prefix.eventLogRef,projectionBasisDigest:hash(handoff.prefix)},
      selector:{kind:'release_operation_observation',artifact:absent}},
    slots:slotsOf({capability_grants:grantsOf(releasePacket.metadata.capabilityRefs,releaseGrants)}),
    resources:{kind:'release_evidence_resources',schemaVersion:'5.0.0',eventResource:reopen(),artifactPath:join(env.scratch,'td51b-absent-release.json')},
    requestRef:'public-request://td51b/release-evidence',correlationRef:'correlation://td51b/operation-bodies',eventTime:'2026-11-12T00:00:00.000Z',
    provenanceRefs:['provenance://td51b/operation-bodies']}));
  assert.equal(releaseRead.ownerOutput.outcomeKind,'refusal');
  assert.equal(releaseRead.ownerOutput.value.code,'not_ready','the release read projects artifact truth and finds no observation bytes');

  // workspace.bind of a second clean workspace over the admitted installs,
  // with the trusted-developer admission authority (t287-w2-05 shape).
  const verifyRequest={artifactPath:env.artifactPaths[0],artifactRef:basename(env.artifactPaths[0]),expectedArtifactDigest:env.verified.artifactDigest,
    expectedProductContentDigest:env.verified.productContentDigest,expectedManifestDigest:env.verified.manifestDigest,expectedProductId:env.verified.productId,
    expectedPackageName:env.verified.packageName,expectedPackageVersion:env.verified.packageVersion};
  const ownerVerified=await product.verifyProduct(verifyRequest);
  assert.equal(ownerVerified.disposition,'verified',JSON.stringify(ownerVerified).slice(0,2000));
  const workspaceRoot=join(env.scratch,'td51b-workspace');fs.mkdirSync(workspaceRoot);
  const created=await product.WorkspaceOperationPort.create({kind:'workspace_create_packet',schemaVersion:'5.0.0',memberKey:'clean',targetRoot:workspaceRoot,scaffoldPolicy:'none'});
  assert.equal(created.kind,'workspace_create_result',JSON.stringify(created).slice(0,2000));
  const authorityManifest={workspaceId:created.manifest.workspaceRef,canonicalRoot:created.manifest.canonicalRoot,authorityMode:'trusted_developer',authorizedActorRef:actorRef};
  const workspaceAuthority=product.constructWorkspaceAuthorityBasis({...authorityManifest,authorityManifestRef:'manifest://td51b/workspace-authority',
    authorityManifestDigest:hash(authorityManifest)});
  const lock={ref:env.lock.lockId,digest:env.lock.lockDigest},productSet=env.admittedInstalls.map(product.productInstallCoordinate);
  const declaredRoots={toolchainRoot:env.consumerRoot,productRoot:env.installedRoots[1],eventLogRoot:dirname(logPath),
    runtimeStateRoot:join(workspaceRoot,'.ai-workspace/runtime'),projectionRoot:join(workspaceRoot,'.ai-workspace/projections'),archiveRoot:join(workspaceRoot,'.ai-workspace/archive')};
  const rootFields=[['toolchain','toolchainRoot'],['product','productRoot'],['event_log','eventLogRoot'],['runtime_state','runtimeStateRoot'],['projection','projectionRoot'],['archive','archiveRoot']];
  const bindRequest={workspaceAuthority:{ref:workspaceAuthority.authorityBasisId,digest:workspaceAuthority.authorityBasisDigest},installedSet:productSet,resolvedLock:lock,
    declaredRoots:rootFields.map(([rootKind,field])=>({rootKind,path:declaredRoots[field]}))};
  const bindPacket=product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,bindKey=bindPacket.definitionKey;
  const definition=publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===bindKey.operationId&&d.definitionKey.memberKey===bindKey.memberKey);
  const bindResources={kind:'product_workspace_binding_resource_assertion',schemaVersion:'5.0.0',eventResource:reopen(),workspaceAuthority,
    workspaceManifest:created.manifest,admittedInstalls:env.admittedInstalls,resolvedLock:env.lock,declaredRoots};
  const bindSlots=slotsOf({product_set:productSet,dependency_lock:lock,actor:{actor:{ref:actorRef,digest:hash({actorRef})},attribution:{ref:'attribution://td51b/operation-bodies',digest:hash('td51b')}}});
  const data=product.constructAdmissionCapabilityData({fixedPacket:bindPacket,ownerArtifact:{request:verifyRequest,verified:ownerVerified},request:bindRequest,
    resources:bindResources,authoritySlots:bindSlots,boundEnvironment:null});
  const authorityValue={actorRef,authorityMode:'trusted_developer'};
  const approvalValue={decision:'allow',actorRef,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,requestDigest:hash(bindRequest),
    scopeDigest:product.admissionAuthorityScope(data).digest};
  const authority={kind:'resolved_admission_authority',schemaVersion:'5.0.0',actorRef,authorityMode:'trusted_developer',
    authority:{ref:'authority://td51b/developer',digest:hash(authorityValue),value:authorityValue},approval:{ref:'approval://td51b/bind',digest:hash(approvalValue),value:approvalValue}};
  const bindGrants=await Promise.all(definition.capabilityRefs.map(capabilityRef=>product.constructCapabilityGrant(authority,actorRef,bindKey.operationId,capabilityRef,
    {kind:'admission_capability_grant_construction_basis',fixedPacket:bindPacket,data})));
  const bind=await transported('workspace.bind',publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:publicApi,
    definitionContractCoordinates:env.verified.definitionContractCoordinates,contractCatalog:catalogOf(bindKey),...bindKey,request:bindRequest,
    slots:{...bindSlots,capability_grants:grantsOf(definition.capabilityRefs,bindGrants)},
    resources:{...bindResources,admissionAuthority:{basis:data,authority,grants:bindGrants}},requestRef:'public-request://td51b/bind',
    correlationRef:'correlation://td51b/operation-bodies',eventTime:'2026-11-12T00:00:00.000Z',provenanceRefs:['provenance://td51b/operation-bodies']}));
  assert.equal(bind.ownerOutput.outcomeKind,'result',JSON.stringify(bind.ownerOutput).slice(0,2000));
  t.diagnostic('TD51B_OPERATION_BODIES '+JSON.stringify({releaseEvidence:releaseRead.basis,workspaceBind:bind.basis,
    meaning:'per-row counts of physical basis body reads by location in one reopened operation'}));
});
