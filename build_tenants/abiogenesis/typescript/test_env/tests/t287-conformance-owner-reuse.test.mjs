import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join, resolve, dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {syncBuiltinESMExports} from 'node:module';
import {SourceTextModule, SyntheticModule} from 'node:vm';
import * as v from 'valibot';
import {publicOperationBasis} from '../support/root-installed-environment.mjs';

// Source-level differential over fresh owner-admitted fixture history. Retained
// immutable declaration metadata is test data only. Materialized package rows,
// archive verification and the executing-manifest read are explicit assumptions;
// no package/install or retained runtime/worksite operation occurs here.
const root=resolve(import.meta.dirname,'../..');
const predecessor=process.env.ABI5_CONFORMANCE_PREDECESSOR_ROOT;
const territory=process.env.ABI5_CONFORMANCE_PROOF_ROOT;
assert.ok(predecessor && territory && process.env.ABI5_CONFORMANCE_METADATA);
const metadata=JSON.parse(fs.readFileSync(process.env.ABI5_CONFORMANCE_METADATA,'utf8'));
const load=(base,file)=>import(pathToFileURL(join(base,'build/code/src',file+'.js')).href);
const product=await load(root,'product/index'), abg=await load(root,'abg/index');
const hash=product.sha256Canonical, coord=(ref,value)=>({ref,digest:hash(value)});
const verified=metadata.verifiedProducts.find(p=>p.packageName==='@abiogenesis/typescript-tenant');
assert.ok(verified);

// Existing private-owner test technique; exact emitted code, no production hooks.
async function mechanism(base,relative,overrides={}) {
  const file=join(base,'build/code/src',relative+'.js');
  const module=new SourceTextModule(fs.readFileSync(file,'utf8'),{identifier:file,
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
  const env=await load(base,'abg/environment_admission'),metrics={environmentDerivations:0,warmEnvironmentRelations:0,archiveChecks:0};
  let archiveFails=false, manifestFails=false, afterManifestRead=null, invocation;
  const authority=await mechanism(base,'product/admission_authority',{
    '../abg/environment_admission.js':{
      projectExactPrefixWorkspaceEnvironment:(...args)=>{metrics.environmentDerivations++;return env.projectExactPrefixWorkspaceEnvironment(...args);},
      projectWorkspaceEnvironmentFromArtifactTruth:(...args)=>{metrics.warmEnvironmentRelations++;return env.projectWorkspaceEnvironmentFromArtifactTruth(...args);},
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
  const bindings=await mechanism(base,'validator/conformance_definition_bindings',{'../product/admission_authority.js':authority});
  return {base,authority,invocation,bindings,metrics,env,
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
      conformanceLaw:law,artifactTruth:environment.artifactTruth,declaredInventory:metadata.publications,declarationCatalog:{catalog,catalogView}};
    return {scratch,eventLogPath,prefix,workspace,environment,resources,law};
  } finally {opened.store.closeDurableLog();}
}

async function callFor(b,f,resources=f.resources,request=null) {
  const definition=b.publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId==='abg.operation.conformance.evaluate'&&d.definitionKey.memberKey==='gtl_program');
  const packet=b.contracts.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program;
  request??={program:coord(metadata.program.programRef,metadata.program),conformanceLaw:f.law,
    inventoryBasis:{kind:'declared_inventory',inventory:resources.declaredInventory.map(p=>coord(p.moduleRef,p)).sort((a,b)=>a.ref.localeCompare(b.ref))}};
  const slots=Object.fromEntries(['workspace_binding','product_set','dependency_lock','catalog_scope','execution_program','graph_function','input_contract','session_policy','capability_grants','actor','transport_steering','verification_references','execution_basis'].map(k=>[k,null]));
  const actor=coord('actor://conformance-fixture','actor');
  Object.assign(slots,{workspace_binding:f.workspace,product_set:f.environment.productInstalls.map(product.productInstallCoordinate),
    dependency_lock:{ref:f.environment.resolvedProductLock.lockId,digest:f.environment.resolvedProductLock.lockDigest},actor:{actor,attribution:coord('attribution://conformance-fixture','attribution')}});
  const basis={kind:'admission_capability_data',schemaVersion:'5.0.0',definition:{definitionKey:definition.definitionKey,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,owner:{ref:packet.owner.authorityRef,digest:packet.owner.authorityDigest}},
    ownerArtifact:{request:{artifactPath:join(territory,'unmaterialized-fixture.tgz'),artifactRef:verified.artifactRef,expectedArtifactDigest:verified.artifactDigest,expectedProductContentDigest:verified.productContentDigest,expectedManifestDigest:verified.manifestDigest,expectedProductId:verified.productId,expectedPackageName:verified.packageName,expectedPackageVersion:verified.packageVersion},verified},request,
    resourceScope:{resourcesDigest:hash(resources),authoritySlots:b.authority.admissionAuthoritySlots(slots)},boundEnvironment:structuredClone(f.environment)};
  const authorityValue={actorRef:actor.ref,authorityMode:'trusted_developer'};
  const approvalValue={decision:'allow',actorRef:actor.ref,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,requestDigest:hash(request),scopeDigest:b.authority.admissionAuthorityScope(basis).digest};
  const authority={kind:'resolved_admission_authority',schemaVersion:'5.0.0',actorRef:actor.ref,authorityMode:'trusted_developer',authority:{...coord('authority://conformance-fixture',authorityValue),value:authorityValue},approval:{...coord('approval://conformance-fixture',approvalValue),value:approvalValue}};
  const grants=await Promise.all(definition.capabilityRefs.map(cap=>b.invocation.constructCapabilityGrant(authority,actor.ref,definition.definitionKey.operationId,cap,{kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data:basis})));
  slots.capability_grants={requiredCapabilityRefs:definition.capabilityRefs,grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))};
  return JSON.parse(JSON.stringify(b.publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:b.publicApi,definitionContractCoordinates:verified.definitionContractCoordinates,
    contractCatalog:{productId:verified.productId,productContentDigest:verified.productContentDigest,catalogId:verified.catalogId,catalogVersion:'5.0.0',catalogDigest:verified.catalogDigest},operationId:definition.definitionKey.operationId,memberKey:'gtl_program',request,slots,
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

test('same-call conformance retains one real owner derivation; predecessor result, grants and serializable resources agree',async t=>{
  const f=await fixture(t),call=await callFor(old,f);assert.deepEqual(await callFor(next,f),call);
  const before=fs.readFileSync(f.eventLogPath),a=await measured(old,f,call),b=await measured(next,f,call);
  assert.equal(a.result.exitCode,0,JSON.stringify(a.result.failure));assert.equal(b.result.exitCode,0,JSON.stringify(b.result.failure));
  assert.deepEqual(b.result,a.result);assert.equal(b.result.ownerOutput.value.disposition,'passed');
  assert.ok(a.physicalPrefixReads>b.physicalPrefixReads,'shared structural admission does not repeat physical environment authentication');
  assert.equal(a.archiveChecks,1);assert.equal(b.archiveChecks,1);assert.equal(b.environmentDerivations,1);assert.equal(b.warmEnvironmentRelations,0);
  assert.deepEqual(fs.readFileSync(f.eventLogPath),before);
  console.log(JSON.stringify({kind:'conformance_reuse_differential',predecessor:{...a,result:undefined},successor:{...b,result:undefined},ownerOutputDigest:hash(b.result.ownerOutput),resourceDigest:hash(b.result.resources),fixtureOnly:true}));

  for(const [label,change]of [
    ['incomplete inventory',r=>r.declaredInventory.pop()],
    ['crossed catalog',r=>r.declarationCatalog.catalog.workspaceBindingDigest=hash('foreign')],
    ['forged raw artifact',r=>r.artifactTruth.projectionDigest=hash('foreign')],
    ['changed Program',r=>r.packet.program.version='foreign'],
  ]) {
    const r=structuredClone(f.resources);change(r);const c=await callFor(next,f,r);
    const outcome=await measured(next,f,c);assert.notEqual(outcome.result.exitCode,0,label);assert.equal(outcome.result.failure.fault.code,'resource_relation_mismatch',label);
  }
  for(const [label,change]of [
    ['approval scope',c=>c.resources.admissionAuthority.authority.approval.value.scopeDigest=hash('foreign')],
    ['request/resource digest',c=>c.resources.admissionAuthority.basis.resourceScope.resourcesDigest=hash('foreign')],
    ['actor',c=>c.resources.admissionAuthority.authority.actorRef='actor://foreign'],
    ['grant',c=>c.resources.admissionAuthority.grants[0].grantDigest=hash('foreign')],
  ]) {const c=structuredClone(call);change(c);assert.notEqual((await measured(next,f,c)).result.exitCode,0,label);}
  for(const fail of [next.failArchive,next.failManifest]) {fail(true);assert.notEqual((await measured(next,f,call)).result.exitCode,0);fail(false);}
  for(const backend of [old,next]) {
    const corrupt=Buffer.from(before);corrupt[0]^=1;
    backend.afterManifestRead(()=>fs.writeFileSync(f.eventLogPath,corrupt));
    try {assert.notEqual((await measured(backend,f,call)).result.exitCode,0,'physical drift after awaited verification refuses');}
    finally {backend.afterManifestRead(null);fs.writeFileSync(f.eventLogPath,before);}
  }
});

test('structural admission is effect-free; semantic admission authenticates raw, copied, warm and changed environment inputs',async t=>{
  const f=await fixture(t),call=await callFor(next,f),schema=next.authority.ADMISSION_CAPABILITY_DATA_SCHEMA;
  const resource=call.resources.admissionAuthority,raw=resource.basis,packet=next.contracts.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program;
  const admit=data=>next.authority.validateAdmissionCapabilityBasis(resource.authority,resource.authority.actorRef,packet.metadata.capabilityRefs[0],
    {kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data});
  const beforeParse=next.metrics.environmentDerivations;
  assert.equal(v.safeParse(next.authority.admissionAuthorityResourceStructure,resource).success,true);
  assert.equal(next.metrics.environmentDerivations,beforeParse,'fixed-owner structural parsing derives no semantic environment');
  assert.equal(v.safeParse(schema,raw).success,true);
  assert.equal(next.metrics.environmentDerivations,beforeParse+1,'exported standalone parser preserves cold semantic admission');
  for(const change of [x=>x.boundEnvironment.productSet.productSetDigest=hash('foreign'),x=>x.ownerArtifact.verified.verificationDigest=hash('foreign')]){
    const changed=structuredClone(resource);change(changed.basis);
    assert.equal(v.safeParse(next.authority.ADMISSION_AUTHORITY_RESOURCE_SCHEMA,changed).success,false,'direct release-artifact schema retains exact semantic refusal');
  }
  const start=next.metrics.environmentDerivations;
  const once=(await admit(raw)).data;assert.equal(next.metrics.environmentDerivations-start,1);
  const again=(await admit(once)).data;assert.equal(next.metrics.environmentDerivations-start,1);
  assert.equal(again.boundEnvironment,once.boundEnvironment,'exact immutable environment is consumed unchanged');
  const cloned=(await admit(structuredClone(once))).data;assert.equal(next.metrics.environmentDerivations-start,2);
  assert.deepEqual(JSON.parse(JSON.stringify(again)),raw);assert.deepEqual(JSON.parse(JSON.stringify(cloned)),raw);
  for(const change of [
    x=>x.boundEnvironment.workspaceBinding.bindingDigest=hash('foreign'),
    x=>x.boundEnvironment.productSet.productSetDigest=hash('foreign'),
    x=>x.boundEnvironment.prefix.prefixDigest=hash('foreign'),
    x=>{x.boundEnvironment.artifactTruth={...once.boundEnvironment.artifactTruth,prefixEventCount:999};
      for(const symbol of Object.getOwnPropertySymbols(once.boundEnvironment.artifactTruth))Object.defineProperty(x.boundEnvironment.artifactTruth,symbol,Object.getOwnPropertyDescriptor(once.boundEnvironment.artifactTruth,symbol));},
  ]) {const changed=structuredClone(raw);change(changed);await assert.rejects(admit(changed));}
  const bytes=fs.readFileSync(f.eventLogPath),changed=Buffer.from(bytes);changed[0]^=1;fs.writeFileSync(f.eventLogPath,changed);
  await assert.rejects(admit(once),'genuine derivation does not waive cold physical integrity');
  await assert.rejects(admit(raw),'copied input refuses changed physical bytes');
  fs.writeFileSync(f.eventLogPath,bytes);await admit(once);
  fs.renameSync(f.eventLogPath,join(f.scratch,'original'));fs.writeFileSync(f.eventLogPath,bytes);
  await assert.rejects(admit(once),'replacement inode refuses');
});
