import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join, resolve, dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {syncBuiltinESMExports} from 'node:module';
import {SourceTextModule, SyntheticModule} from 'node:vm';
import * as v from 'valibot';
import ts from 'typescript';
import {publicOperationBasis} from '../support/root-installed-environment.mjs';

// Source-level differential over fresh owner-admitted fixture history. Retained
// immutable declaration metadata is test data only. Materialized package rows,
// archive verification and the executing-manifest read are explicit assumptions;
// no package/install or retained runtime/worksite operation occurs here.
const root=resolve(import.meta.dirname,'../..');
const predecessor=process.env.ABI5_CONFORMANCE_PREDECESSOR_ROOT;
const territory=process.env.ABI5_CONFORMANCE_PROOF_ROOT;
const sourceOnly=process.env.ABI5_CONFORMANCE_SOURCE_ONLY==='1';
assert.ok(predecessor && territory && process.env.ABI5_CONFORMANCE_METADATA);
const metadata=JSON.parse(fs.readFileSync(process.env.ABI5_CONFORMANCE_METADATA,'utf8'));
const load=(base,file)=>import(pathToFileURL(join(base,'build/code/src',file+'.js')).href);
const product=await load(root,'product/index'), abg=await load(root,'abg/index'), eventStore=await load(root,'abg/event_store');
const hash=product.sha256Canonical, coord=(ref,value)=>({ref,digest:hash(value)});
const verified=metadata.verifiedProducts.find(p=>p.packageName==='@abiogenesis/typescript-tenant');
assert.ok(verified);

// Existing private-owner test technique; exact emitted code, no production hooks.
async function mechanism(base,relative,overrides={}) {
  const file=join(base,'build/code/src',relative+'.js');
  const text=sourceOnly && base===root && ['validator/conformance_definition_bindings','product/admission_authority','product/invocation','abg/artifact_truth','implementation/release_publication'].includes(relative)
    ? ts.transpileModule(fs.readFileSync(join(root,'code/src',relative+'.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText
    : fs.readFileSync(file,'utf8');
  const module=new SourceTextModule(text,{identifier:file,
    initializeImportMeta:meta=>{meta.url=pathToFileURL(file).href;}});
  const links=new Map();
  await module.link(async spec=>{
    if(links.has(spec))return links.get(spec);
    const actual=await import(spec.startsWith('.')?pathToFileURL(resolve(dirname(file),spec)).href:spec);
    const values={...actual,...overrides[spec]};
    const linked=new SyntheticModule(Object.keys(values),function(){for(const [k,value]of Object.entries(values))this.setExport(k,value);});
    links.set(spec,linked);return linked;
  });
  await module.evaluate();return module.namespace;
}

async function backend(base) {
  let env=await load(base,'abg/environment_admission');
  const metrics={environmentDerivations:0,warmEnvironmentRelations:0,archiveChecks:0};
  let archiveFails=false, manifestFails=false, afterManifestRead=null, invocation;
  const artifact=base===root ? await mechanism(base,'abg/artifact_truth',{
    './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:(...args)=>env.projectExactPrefixWorkspaceEnvironment(...args)},
  }) : await load(base,'abg/artifact_truth');
  if(base===root) env=await mechanism(base,'abg/environment_admission',{'./artifact_truth.js':artifact});
  const authority=await mechanism(base,'product/admission_authority',{
    '../abg/artifact_truth.js':artifact,
    '../abg/environment_admission.js':{
      projectExactPrefixWorkspaceEnvironment:(...args)=>{metrics.environmentDerivations++;return env.projectExactPrefixWorkspaceEnvironment(...args);},
      projectWorkspaceEnvironmentFromArtifactTruth:(...args)=>{metrics.environmentDerivations++;return env.projectWorkspaceEnvironmentFromArtifactTruth(...args);},
    },
    './verify_product.js':{verifyProduct:async request=>{metrics.archiveChecks++;
      assert.equal(request.artifactPath,join(territory,'unmaterialized-fixture.tgz'));
      return archiveFails?{kind:'product_verification_refusal'}:verified;}},
    'node:fs/promises':{readFile:async file=>{assert.equal(String(file),join(base,'product-toolchain-manifest.json'));
      afterManifestRead?.();
      return Buffer.from(JSON.stringify(manifestFails?{changed:true}:metadata.ownerManifest));}},
    './invocation.js':{constructCapabilityGrant:(...args)=>invocation.constructCapabilityGrant(...args),
      constructAdmissionCapabilityGrants:(...args)=>invocation.constructAdmissionCapabilityGrants(...args)},
  });
  invocation=await mechanism(base,'product/invocation',{'./admission_authority.js':authority});
  const mechanics=await load(base,'shared/definition_binding_mechanics');
  metrics.resourceSelfComparisons=0;
  const bindings=await mechanism(base,'validator/conformance_definition_bindings',{'../product/admission_authority.js':authority,
    '../abg/index.js':{...env,...artifact},
    '../shared/definition_binding_mechanics.js':{sameJson:(a,b)=>{
      if(a===b && a?.kind==='conformance_evaluation_resource_assertion')metrics.resourceSelfComparisons++;
      return mechanics.sameJson(a,b);}}});
  return {base,authority,invocation,bindings,metrics,env,artifact,
    publicApi:await load(base,'public/index'),contracts:await load(base,'validator/conformance_operation_contracts'),host:await load(base,'shared/effect_definition'),
    failArchive:value=>{archiveFails=value;},failManifest:value=>{manifestFails=value;},afterManifestRead:fn=>{afterManifestRead=fn;}};
}

async function fixture(t) {
  fs.mkdirSync(territory,{recursive:true});const scratch=fs.mkdtempSync(join(territory,'disposable-'));
  t.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));
  const lock=(await load(predecessor,'product/index')).constructResolvedProductLock(metadata.verifiedProducts);
  assert.equal(lock.kind,'resolved_product_lock',JSON.stringify(lock));
  const candidates=metadata.verifiedProducts.map((value,i)=>{
    const {kind,disposition,verificationRef,verificationDigest,artifactRef,artifactByteLength,definitionContractCoordinates,checkedPayloadFiles,nativeDeclarationEvidence,...body}=value;
    return {...body,kind:'product_install_candidate',disposition:'materialized',installedRoot:join(scratch,'assumed-install-'+i),
      installId:`product-install://${value.packageName}/${value.packageVersion}/${value.productContentDigest.slice(7)}/${lock.lockDigest.slice(7)}`,
      resolvedLockId:lock.lockId,resolvedLockDigest:lock.lockDigest};
  });
  const eventLogPath=join(scratch,'events.jsonl');
  const opened=abg.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath});assert.ok(opened.store);
  let prefix=opened.prefix;const installs=[];
  try {
    for(const [i,candidate]of candidates.entries()) {
      assert.equal(product.isProductInstallCandidate(candidate,lock),true);
      const result=abg.admitProductInstall(opened.store,candidate,{...publicOperationBasis(product,'abg.operation.product.install',candidate.installId,candidate.productContentDigest,'invocation://conformance-fixture/install-'+i),predecessorPrefix:prefix},lock);
      assert.equal(result.kind,'artifact_owner_result',JSON.stringify(result));installs.push(result.value);prefix=result.successorPrefix;
    }
    const manifest={workspaceId:'workspace://conformance-fixture',canonicalRoot:join(scratch,'worksite'),authorityMode:'trusted_developer',authorizedActorRef:'actor://conformance-fixture'};
    const authority=product.constructWorkspaceAuthorityBasis({...manifest,authorityManifestRef:'manifest://conformance-fixture',authorityManifestDigest:hash(manifest)});
    const candidate=product.constructWorkspaceBinding(authority,product.constructProductSet(installs,lock),lock,
      Object.fromEntries(['toolchain','product','eventLog','runtimeState','projection','archive'].map(k=>[k+'Root',join(scratch,k)])));
    assert.equal(candidate.kind,'workspace_binding_candidate');
    const result=abg.admitWorkspaceBinding(opened.store,candidate,{...publicOperationBasis(product,'abg.operation.workspace.bind',candidate.bindingId,candidate.bindingDigest,'invocation://conformance-fixture/bind',installs.map(x=>x.admissionEventRef)),predecessorPrefix:prefix},authority);
    assert.equal(result.kind,'artifact_owner_result');
    const handoff=opened.store.projectReopenAuthorityAndClose();prefix=handoff.prefix;
    const workspace={ref:result.value.bindingId,digest:result.value.bindingDigest};
    const environment=abg.projectExactPrefixWorkspaceEnvironment(prefix,workspace);assert.equal(environment.kind,'exact_prefix_workspace_environment');
    const catalog=product.admitGraphFunctionCatalog({workspaceBinding:candidate,resolvedLock:lock,verifiedProducts:metadata.verifiedProducts,installedProducts:candidates,publications:metadata.publications});
    assert.equal(catalog.kind,'graph_function_catalog',JSON.stringify(catalog));
    const catalogView=product.narrowGraphFunctionCatalog(catalog,metadata.program.callableMembership);assert.equal(catalogView.kind,'graph_function_catalog_view');
    const law=coord('law://abiogenesis/validator/gtl-program@5',{ref:'law://abiogenesis/validator/gtl-program@5'});
    const resources={kind:'conformance_evaluation_resource_assertion',schemaVersion:'5.0.0',packet:{kind:'conformance_evaluate_packet',schemaVersion:'5.0.0',memberKey:'gtl_program',publication:metadata.publication,program:metadata.program},
      conformanceLaw:law,declaredInventory:metadata.publications,declarationCatalog:{catalog,catalogView}};
    return {scratch,eventLogPath,prefix,workspace,environment,resources,law,handoff};
  } finally {opened.store.closeDurableLog();}
}

async function callFor(b,f,resources=f.resources,request=null,selection={}) {
  if (b.base === predecessor) resources = {...resources,artifactTruth:f.environment.artifactTruth};
  const operationId=selection.operationId??'abg.operation.conformance.evaluate',memberKey=selection.memberKey??'gtl_program';
  const definition=b.publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===operationId&&d.definitionKey.memberKey===memberKey);
  const packet=selection.packet??b.contracts.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program;
  request??={program:coord(metadata.program.programRef,metadata.program),conformanceLaw:f.law,
    inventoryBasis:{kind:'declared_inventory',inventory:resources.declaredInventory.map(p=>coord(p.moduleRef,p)).sort((a,b)=>a.ref.localeCompare(b.ref))}};
  const slots=Object.fromEntries(['workspace_binding','product_set','dependency_lock','catalog_scope','execution_program','graph_function','input_contract','session_policy','capability_grants','actor','transport_steering','verification_references','execution_basis'].map(k=>[k,null]));
  const actor=coord('actor://conformance-fixture','actor');
  Object.assign(slots,{workspace_binding:f.workspace,product_set:f.environment.productInstalls.map(product.productInstallCoordinate),
    dependency_lock:{ref:f.environment.resolvedProductLock.lockId,digest:f.environment.resolvedProductLock.lockDigest},actor:{actor,attribution:coord('attribution://conformance-fixture','attribution')}});
  const basis={kind:'admission_capability_data',schemaVersion:'5.0.0',definition:{definitionKey:definition.definitionKey,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,owner:{ref:packet.owner.authorityRef,digest:packet.owner.authorityDigest}},
    ownerArtifact:{request:{artifactPath:join(territory,'unmaterialized-fixture.tgz'),artifactRef:verified.artifactRef,expectedArtifactDigest:verified.artifactDigest,expectedProductContentDigest:verified.productContentDigest,expectedManifestDigest:verified.manifestDigest,expectedProductId:verified.productId,expectedPackageName:verified.packageName,expectedPackageVersion:verified.packageVersion},verified},request,
    resourceScope:{resourcesDigest:hash(resources),authoritySlots:b.authority.admissionAuthoritySlots(slots)},boundEnvironment:b.base===predecessor?structuredClone(f.environment):b.authority.admissionEnvironmentSelection(f.prefix,f.workspace)};
  const authorityValue={actorRef:actor.ref,authorityMode:'trusted_developer'};
  const approvalValue={decision:'allow',actorRef:actor.ref,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,requestDigest:hash(request),scopeDigest:b.authority.admissionAuthorityScope(basis).digest};
  const authority={kind:'resolved_admission_authority',schemaVersion:'5.0.0',actorRef:actor.ref,authorityMode:'trusted_developer',authority:{...coord('authority://conformance-fixture',authorityValue),value:authorityValue},approval:{...coord('approval://conformance-fixture',approvalValue),value:approvalValue}};
  const grants=await Promise.all(definition.capabilityRefs.map(cap=>b.invocation.constructCapabilityGrant(authority,actor.ref,definition.definitionKey.operationId,cap,{kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data:basis})));
  slots.capability_grants={requiredCapabilityRefs:definition.capabilityRefs,grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))};
  return JSON.parse(JSON.stringify(b.publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:b.publicApi,definitionContractCoordinates:verified.definitionContractCoordinates,
    contractCatalog:{productId:verified.productId,productContentDigest:verified.productContentDigest,catalogId:verified.catalogId,catalogVersion:'5.0.0',catalogDigest:verified.catalogDigest},operationId:definition.definitionKey.operationId,memberKey,request,slots,
    resources:{...resources,admissionAuthority:{basis,authority,grants}},requestRef:'request://conformance-fixture',correlationRef:'correlation://conformance-fixture',eventTime:'2026-09-22T00:00:00.000Z',provenanceRefs:[]})));
}
async function measured(b,f,call) {
  const prior={...b.metrics};let physicalPrefixReads=0;const open=fs.openSync;
  fs.openSync=function(file,...args){if(String(file)===f.eventLogPath)physicalPrefixReads++;return open.call(fs,file,...args);};syncBuiltinESMExports();
  const start=performance.now();
  try {
    const result=await b.host.runExactDefinition(call,b.bindings.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program(call));
    return {result,elapsedMs:performance.now()-start,physicalPrefixReads,...Object.fromEntries(Object.keys(prior).map(k=>[k,b.metrics[k]-prior[k]]))};
  } finally {fs.openSync=open;syncBuiltinESMExports();}
}
const old=await backend(predecessor),next=await backend(root);

test('same-subject conformance retains one real owner derivation and predecessor semantic result',async t=>{
  const f=await fixture(t),call=await callFor(old,f),nextCall=await callFor(next,f);
  assert.deepEqual(nextCall.invocation.request,call.invocation.request);
  const before=fs.readFileSync(f.eventLogPath),a=await measured(old,f,call),b=await measured(next,f,nextCall);
  assert.equal(a.result.exitCode,0,JSON.stringify(a.result.failure));assert.equal(b.result.exitCode,0,JSON.stringify(b.result.failure));
  assert.deepEqual(b.result.ownerOutput,a.result.ownerOutput);
  const {artifactTruth:_removed,...oldResources}=a.result.resources;
  assert.deepEqual(b.result.resources,oldResources);assert.equal(b.result.ownerOutput.value.disposition,'passed');
  assert.ok(b.physicalPrefixReads<=a.physicalPrefixReads,'resource deletion adds no physical environment acquisition');
  assert.equal(a.resourceSelfComparisons,1);assert.equal(b.resourceSelfComparisons,0);
  assert.equal(b.physicalPrefixReads,1,'cold ingress plus same-acquisition currentness reads history once');
  assert.equal(a.archiveChecks,1);assert.equal(b.archiveChecks,1);assert.equal(b.environmentDerivations,1);assert.equal(b.warmEnvironmentRelations,0);
  assert.deepEqual(fs.readFileSync(f.eventLogPath),before);
  console.log(JSON.stringify({kind:'conformance_reuse_differential',predecessor:{...a,result:undefined},successor:{...b,result:undefined},ownerOutputDigest:hash(b.result.ownerOutput),resourceDigest:hash(b.result.resources),fixtureOnly:true}));

  for(const [label,change]of [
    ['incomplete inventory',r=>r.declaredInventory.pop()],
    ['crossed catalog',r=>r.declarationCatalog.catalog.workspaceBindingDigest=hash('foreign')],
    ['changed Program',r=>r.packet.program.version='foreign'],
  ]) {
    const r=structuredClone(f.resources);change(r);const c=await callFor(next,f,r);
    const outcome=await measured(next,f,c);assert.notEqual(outcome.result.exitCode,0,label);assert.equal(outcome.result.failure.fault.code,'resource_relation_mismatch',label);
  }
  for(const [label,change]of [
    ['forged environment prefix',c=>c.resources.admissionAuthority.basis.boundEnvironment.prefix.prefixDigest=hash('foreign')],
    ['approval scope',c=>c.resources.admissionAuthority.authority.approval.value.scopeDigest=hash('foreign')],
    ['request/resource digest',c=>c.resources.admissionAuthority.basis.resourceScope.resourcesDigest=hash('foreign')],
    ['actor',c=>c.resources.admissionAuthority.authority.actorRef='actor://foreign'],
    ['grant',c=>c.resources.admissionAuthority.grants[0].grantDigest=hash('foreign')],
  ]) {const c=structuredClone(nextCall);change(c);assert.notEqual((await measured(next,f,c)).result.exitCode,0,label);}
  for(const [label,changedResources,request]of [
    ['law mismatch',{...f.resources,conformanceLaw:coord('law://foreign',{ref:'law://foreign'})},
      {...nextCall.invocation.request,conformanceLaw:coord('law://foreign',{ref:'law://foreign'})}],
    ['incomplete declared inventory',{...f.resources,declaredInventory:f.resources.declaredInventory.slice(1)},null],
    ['changed Program',{...f.resources,packet:{...f.resources.packet,program:{...f.resources.packet.program,version:'foreign'}}},null],
  ]) {
    const results=[];
    for(const backend of [old,next]) {
      const c=await callFor(backend,f,changedResources,request);
      const result=(await measured(backend,f,c)).result;
      results.push(result.ownerOutput??{code:result.failure.fault.code,stage:result.failure.fault.stage});
    }
    assert.deepEqual(results[1],results[0],label+' is conserved');
    assert.ok(results[1].outcomeKind==='refusal' || results[1].code, label+' must refuse');
  }
  // The wrapper's approved resources digest still validates finite raw JSON
  // before grant construction. The private owner's removed self-comparison
  // is not an ingress bypass, including for direct in-process DefinitionCall.
  for(const malformed of [NaN,Infinity,undefined,1n]) {
    for(const [b,original]of [[old,call],[next,nextCall]]) {
      const c=structuredClone(original);c.resources.packet.malformed=malformed;
      const checks=b.metrics.archiveChecks,result=await measured(b,f,c);
      assert.notEqual(result.result.exitCode,0,'malformed raw resources refuse');
      assert.equal(b.metrics.archiveChecks,checks,'raw refusal precedes archive/admission effects');
    }
  }
  for(const extra of ['artifactTruth','unrelated']) {
    const resources={...f.resources,[extra]:f.environment.artifactTruth};
    const c=await callFor(next,f,resources),result=await measured(next,f,c);
    assert.equal(result.result.failure.fault.code,'invalid_resource_assertion','removed/unknown slots stay closed');
  }
  // Supplied size fixtures are not runtime authority. The new wire carries no
  // artifact/environment body and its selection size is independent of rows.
  const scaling=[];
  for(const n of [1,8,64]) {
    const artifactTruth={rows:Array.from({length:n},(_,i)=>({i,value:'x'.repeat(1024)}))};
    const resources={...f.resources};
    const before={resources:{...resources,artifactTruth},basis:{boundEnvironment:{artifactTruth}}};
    const after={resources,basis:{boundEnvironment:nextCall.resources.admissionAuthority.basis.boundEnvironment}};
    const oldBytes=Buffer.byteLength(JSON.stringify(before)),newBytes=Buffer.byteLength(JSON.stringify(after));
    assert.equal(oldBytes-newBytes,2*Buffer.byteLength(JSON.stringify(artifactTruth))+35-Buffer.byteLength(JSON.stringify(after.basis.boundEnvironment)));
    assert.equal('artifactTruth' in after.basis.boundEnvironment,false);
    scaling.push({rows:n,oldBytes,newBytes,removedBytes:oldBytes-newBytes});
  }
  assert.equal(new Set(scaling.map(row=>row.newBytes)).size,1);
  console.log(JSON.stringify({kind:'conformance_resource_scaling',scaling,scope:'finite supplied size fixtures; no original history or allocation attribution'}));
  for(const fail of [next.failArchive,next.failManifest]) {fail(true);assert.notEqual((await measured(next,f,nextCall)).result.exitCode,0);fail(false);}
  for(const backend of [old,next]) {
    const corrupt=backend===old ? Buffer.from(before) : Buffer.concat([before,Buffer.from(' ')]);
    if(backend===old)corrupt[0]^=1; // Predecessor checks bytes; successor checks ordinary extent drift.
    backend.afterManifestRead(()=>fs.writeFileSync(f.eventLogPath,corrupt));
    try {assert.notEqual((await measured(backend,f,backend===old?call:nextCall)).result.exitCode,0,'physical drift after awaited verification refuses');}
    finally {backend.afterManifestRead(null);fs.writeFileSync(f.eventLogPath,before);}
  }
});

test('compact selection binds scope, cold acquisition, historical cuts and trusted-desktop currentness',async t=>{
  const f=await fixture(t),call=await callFor(next,f),resource=call.resources.admissionAuthority;
  const raw=resource.basis,packet=next.contracts.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program;
  const admit=(data,authority=resource.authority,acquired=null)=>next.authority.validateAdmissionCapabilityBasis(authority,authority.actorRef,packet.metadata.capabilityRefs[0],
    {kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data},acquired);
  const beforeParse=next.metrics.environmentDerivations;
  assert.equal(v.safeParse(next.authority.ADMISSION_CAPABILITY_DATA_SCHEMA,raw).success,true);
  assert.equal(next.metrics.environmentDerivations,beforeParse,'schema parsing supplies no environment authority');
  const once=await admit(raw),copied=await admit(structuredClone(raw));
  assert.deepEqual(copied.data,once.data);assert.deepEqual(copied.boundEnvironment,once.boundEnvironment);
  assert.equal(once.data.boundEnvironment.kind,'admission_environment_selection');
  assert.equal('artifactTruth' in once.data.boundEnvironment,false);
  assert.equal(once.boundEnvironment.kind,'exact_prefix_workspace_environment');
  assert.deepEqual(once.boundEnvironment.workspaceBinding,f.environment.workspaceBinding);
  const oldCall=await callFor(old,f);
  await assert.rejects(admit(raw,oldCall.resources.admissionAuthority.authority),'old full-preimage approval has no new compact meaning');
  assert.equal(v.safeParse(next.authority.ADMISSION_CAPABILITY_DATA_SCHEMA,oldCall.resources.admissionAuthority.basis).success,false);
  const nullData={...raw,boundEnvironment:null};
  assert.deepEqual(next.authority.admissionAuthorityScope(nullData),old.authority.admissionAuthorityScope(nullData),'null scope identity is preserved');
  for(const change of [
    x=>x.boundEnvironment.workspaceBinding.digest=hash('foreign'),
    x=>x.boundEnvironment.prefix.prefixDigest=hash('foreign'),
    x=>x.boundEnvironment.prefix.storeIdentity.inode+=1,
    x=>x.boundEnvironment.extra='unadmitted',
    x=>x.ownerArtifact.verified.verificationDigest=hash('foreign'),
  ]) {const changed=structuredClone(raw);change(changed);await assert.rejects(admit(changed));}
  const resourceOwner=await load(root,'abg/definition_event_resource');
  const acquired=resourceOwner.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:f.handoff,handoffDigest:hash(f.handoff)});
  assert.equal(acquired.kind,'acquired_abg_event_resource');
  let subsequentPrefixOpens=0;const originalOpen=fs.openSync;
  fs.openSync=function(file,...args){if(String(file)===f.eventLogPath)subsequentPrefixOpens++;return originalOpen.call(fs,file,...args);};syncBuiltinESMExports();
  try {
    const held=await admit(structuredClone(raw),resource.authority,acquired.resource);
    assert.deepEqual(held.boundEnvironment.workspaceBinding,f.environment.workspaceBinding);
    assert.equal(next.artifact.validateExactPrefixArtifactTruthProjection(held.boundEnvironment.artifactTruth,{requireCurrent:true}),true);
    assert.equal(subsequentPrefixOpens,0,'existing held resource establishes environment without another physical acquisition');
  } finally {
    fs.openSync=originalOpen;syncBuiltinESMExports();
    const receipt=resourceOwner.closeAbgEventResource(acquired.resource,acquired.resource.entryPrefix);
    assert.deepEqual(receipt.closeHandoff.prefix,f.prefix);
  }
  const bytes=fs.readFileSync(f.eventLogPath);
  // The actual acquisition is reusable on this trusted laptop; arbitrary JSON
  // never inherits that proof. Hostile same-size overwrite is not a new duty.
  const altered=Buffer.from(bytes);altered[0]^=1;fs.writeFileSync(f.eventLogPath,altered);
  assert.equal(next.artifact.validateExactPrefixArtifactTruthProjection(once.boundEnvironment.artifactTruth,{requireCurrent:true}),true);
  assert.equal(next.artifact.validateExactPrefixArtifactTruthProjection(structuredClone(once.boundEnvironment.artifactTruth),{requireCurrent:true}),false);
  fs.writeFileSync(f.eventLogPath,bytes);
  fs.renameSync(f.eventLogPath,join(f.scratch,'original'));fs.writeFileSync(f.eventLogPath,bytes);
  assert.equal(next.artifact.validateExactPrefixArtifactTruthProjection(once.boundEnvironment.artifactTruth,{requireCurrent:true}),false);
  await assert.rejects(admit(raw),'copied selection still authenticates its exact inode');
  fs.unlinkSync(f.eventLogPath);fs.renameSync(join(f.scratch,'original'),f.eventLogPath);
  const reopened=abg.reopenEventStore(f.handoff.reopenAuthority);assert.ok(reopened.store);
  const unchanged=reopened.store.projectReopenAuthorityAndClose();assert.deepEqual(unchanged.prefix,f.prefix);
  const again=abg.reopenEventStore(unchanged.reopenAuthority);assert.ok(again.store);
  let closed;
  try {
  const basisRef='basis://finite/ordinary-append';
  eventStore.admitRuntimeEvent(again.store,{kind:'basis_admitted',eventTime:'2026-09-23T00:00:00.000Z',aggregateType:'workspace',aggregateId:f.workspace.ref,
    parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://finite/append',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:basisRef,
    payload:{basisRef,basisDigest:hash('finite ordinary append'),basisClass:'root',rawInputValue:{kind:'component-premise'}}});
  closed=again.store.projectReopenAuthorityAndClose();
  } finally {again.store.closeDurableLog();}
  assert.ok(closed.prefix.prefixLength>f.prefix.prefixLength);
  await assert.rejects(admit(raw),'live ingress cannot silently use the stale extent');
  assert.equal(next.artifact.validateExactPrefixArtifactTruthProjection(once.boundEnvironment.artifactTruth,{requireCurrent:true}),false);
  const historical=next.authority.admitCapabilityEnvironment(raw.boundEnvironment,null,false);
  assert.deepEqual(historical.workspaceBinding,f.environment.workspaceBinding,'historical release entry cut keeps exact owner meaning');
  assert.deepEqual(historical.prefix,f.prefix);
  const current=next.authority.admitCapabilityEnvironment(next.authority.admissionEnvironmentSelection(closed.prefix,f.workspace));
  assert.deepEqual(current.workspaceBinding,f.environment.workspaceBinding);
  console.log(JSON.stringify({kind:'compact_admission_selection_proof',selectionBytes:Buffer.byteLength(JSON.stringify(raw.boundEnvironment)),
    oldEnvironmentBytes:Buffer.byteLength(JSON.stringify(f.environment)),oldApprovalRefused:true,nullScopePreserved:true,heldAdditionalPrefixOpens:subsequentPrefixOpens,currentExtent:closed.prefix.prefixLength,
    historicalExtent:f.prefix.prefixLength,scope:'actual finite artifact/environment/grant/conformance owners; archive/install/manifest premises explicitly supplied; basis append is contract-admitted fixture data, not a Run'}));
});


test('compact release-artifact ingress preserves historical selection and downstream F16/QUAL056 gates',async t=>{
  const f=await fixture(t),releaseContracts=await load(root,'product/release_snapshot_operations');
  const qualificationContracts=await load(root,'validator/qualification_contracts');
  const operationCoordinates=await load(root,'shared/operation_definition_coordinate');
  const identity={productId:verified.productId,namespace:'abiogenesis',profile:'one_project_unqualified',projectSubtree:'.',versionLine:'5.0.0',
    ordinal:1,version:'5.0.0-rc.1',releaseClaim:coord('fixture://release-claim','release claim')};
  const basisFor=subjectKind=>qualificationContracts.constructQualificationIdentity({kind:'exact_candidate_qualification',projection:'basis',schemaVersion:'5.0.0',
    subjectKind,productId:verified.productId,productVersion:'5.0.0-rc.1',sourceInventory:coord('fixture://inventory','inventory'),
    artifact:{ref:verified.artifactRef,digest:verified.artifactDigest},productManifest:coord('fixture://manifest','manifest'),productContentDigest:verified.productContentDigest,
    toolchain:coord('fixture://toolchain','toolchain'),installedProduct:coord('fixture://install','install'),workspaceBinding:f.workspace,
    prospectiveRelease:identity,tenantManifest:coord('fixture://tenant','tenant'),coverageCatalog:coord('fixture://coverage','coverage'),lawBasis:f.law},'basisRef','basisDigest','qualification-basis://abiogenesis/');
  // Only the enclosing release observation/proof/grant schema is supplied as a
  // lower-owner premise. Actual Public packet, request, approval, grant, acquired
  // environment, release identity joins and downstream O/qualification guards run.
  // This probe performs no publication, qualification or human acceptance.
  const release=await mechanism(root,'implementation/release_publication',{
    '../product/admission_authority.js':next.authority,
    '../product/invocation.js':next.invocation,
    '../product/release_snapshot_operations.js':{RELEASE_OPERATION_ARTIFACT_SCHEMA:v.unknown()},
  });
  const rawRelease=await mechanism(root,'implementation/release_publication',{
    '../product/admission_authority.js':next.authority,'../product/invocation.js':next.invocation,
  });
  for(const memberKey of ['published_rc','tapped_release']) {
    const request={qualificationBasis:basisFor(memberKey==='published_rc'?'pre_rc_candidate':'installed_rc'),lawBasis:f.law,
      verdict:coord('fixture://unproved-verdict','verdict'),requestedIdentity:identity,
      ...(memberKey==='tapped_release'?{acceptedRc:coord('fixture://unproved-publication','publication'),acceptance:null,predecessor:null}:{})};
    const fields={memberKey,eventResource:{fixture:'supplied release resource'},proof:{fixture:'not qualified'},selection:{fixture:'not selected'},
      effectGrant:memberKey==='published_rc'?{fixture:'not authorized physical effect'}:{sourceApproval:null},
      ...(memberKey==='tapped_release'?{publication:{fixture:'unproved'},ruling:null,decision:'accept',addendum:null}:{})};
    const resources=release.releaseArtifactResources(fields);
    const call=await callFor(next,f,resources,request,{operationId:'abg.operation.release.snapshot',memberKey,packet:releaseContracts.RELEASE_OPERATION_CONTRACTS.snapshot[memberKey]});
    const p=call.invocation,slots=p.invocationAuthority.slots;
    const scope=(memberKey==='published_rc'?releaseContracts.releaseAuthorityScope:releaseContracts.releaseAcceptanceScope)(request,fields.proof,fields.selection,fields.effectGrant);
    const artifact={kind:'release_operation_observation',schemaVersion:'5.0.0',...fields,scope,entryPrefix:f.prefix,
      grants:call.resources.admissionAuthority.grants,admissionAuthority:call.resources.admissionAuthority,request,
      invocation:operationCoordinates.constructExactOperationInvocationCoordinate({operationId:p.definitionKey.operationId,memberKey,definitionDigest:p.definitionDigest},p.invocationRef,p.requestDigest),
      publicInvocation:p,resourceDigest:hash(resources),actorRef:slots.actor.actor.ref,capabilityGrants:slots.capability_grants,
      workspaceBinding:f.workspace,productSet:slots.product_set,dependencyLock:slots.dependency_lock,observation:{disposition:'refused'}};
    const admittedBefore=next.metrics.environmentDerivations;
    assert.equal(release.isReleaseOperationArtifact(artifact),memberKey==='published_rc');
    assert.equal(next.metrics.environmentDerivations-admittedBefore,1,'historical release validation uses the same environment owner once');
    assert.equal(rawRelease.isReleaseOperationArtifact(artifact),false,'supplied outer premises do not become a real release artifact');
    assert.equal(rawRelease.projectReleaseQualification(request,fields.proof,fields.selection,f.prefix,memberKey),null,'unproved native qualification stays unavailable');
    if(memberKey==='published_rc')for(const edit of [
      a=>a.admissionAuthority.basis.boundEnvironment.workspaceBinding.digest=hash('wrong W'),
      a=>a.entryPrefix.coordinateDigest=hash('wrong entry'),
      a=>a.actorRef='actor://foreign',
      a=>a.admissionAuthority.authority.approval.value.scopeDigest=hash('old approval'),
      a=>a.admissionAuthority.basis.boundEnvironment=structuredClone(f.environment),
    ]) {const changed=structuredClone(artifact);edit(changed);assert.equal(release.isReleaseOperationArtifact(changed),false);}
  }
  console.log(JSON.stringify({kind:'release_compact_ingress_component',members:['published_rc','tapped_release'],
    real:'compact admission scope, existing fixed Public packets/grants and finite historical environment owner',
    supplied:'enclosing release observation/proof/effect-grant schema only; no native qualification/publication/human O',
    preserved:'wrong owner/entry/approval and old full carrier refuse; missing original O and unproved QUAL056 remain unavailable'}));
});
