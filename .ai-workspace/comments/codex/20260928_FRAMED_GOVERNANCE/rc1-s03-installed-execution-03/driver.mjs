import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {caller,verificationRequest,schemaVersion} from './ordinary-caller.mjs';
import {loadRuntime} from './public-support.mjs';
import {verifyInstalledCurrent,preparePairCase,preparePairColdRead} from './caller-draft.mjs';
import {originalConsumers} from './original-consumers.mjs';
import {renderPublicGapHandoff} from './sole-output-renderer.mjs';
const D=import.meta.dirname,G=dirname(D),C=join(G,'final-candidate-construction-03');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const save=(n,v)=>fs.writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const sha=b=>createHash('sha256').update(b).digest('hex');
const began=performance.now(),deadline=began+1200000;
let c,phase='preflight',results=[],items=[],lastBoundary=null;
const progress=p=>{phase=p;console.log(JSON.stringify({phase,elapsedMs:performance.now()-began}));};
async function physical(label){
 const plan=await read(join(D,'resource-plan.json')),path=plan.eventLogPath;
 const before=await fs.stat(path),bytes=await fs.readFile(path),after=await fs.stat(path);
 assert.equal(before.dev,after.dev);assert.equal(before.ino,after.ino);assert.equal(before.size,after.size);assert.equal(before.mtimeMs,after.mtimeMs);
 const lockPath=join(D,'tmp/abiogenesis-event-store-locks-v5',after.dev+'-'+after.ino+'.lock');
 let lockPresent=false;try{await fs.stat(lockPath);lockPresent=true;}catch(e){if(e.code!=='ENOENT')throw e;}
 assert.equal(lockPresent,false);
 const value={path,bytes:bytes.length,sha256:sha(bytes),device:after.dev,inode:after.ino,mtimeMs:after.mtimeMs,
  stableDuringRead:true,lockPath,lockPresent,prefix:c?.state.closeHandoff?.prefix??null};
 await save(label+'-physical.json',value);await fs.writeFile(join(D,label+'-prefix.jsonl'),bytes,{flag:'wx'});
 return {value,bytes};
}
async function setup(){
 const identity=await read(join(D,'selected-core.json')),prospect=await read(join(D,'prospective-cases.json'));
 const r=await loadRuntime(identity.installedRoot),{product}=r;
 const corePacket={kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(prospect.core)};
 progress('same-process-core-verification');
 const coreVerification=await verifyInstalledCurrent({product,packet:corePacket,expected:prospect.core.basis});
 items=[{name:'core',...prospect.core,verification:coreVerification,verified:coreVerification.verifiedArtifact}];
 const fixturePacket={kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(prospect.fixture)};
 progress('same-process-unchanged-fixture-verification');
 const fixtureVerification=await product.ProductVerificationPort.verify(fixturePacket);
 assert.equal(fixtureVerification.kind,'product_verification_success',JSON.stringify(fixtureVerification));
 assert.strictEqual(product.selectOwnedProductVerification(fixturePacket.request,fixtureVerification.verifiedArtifact),fixtureVerification.verifiedArtifact);
 for(const [key,value] of Object.entries(prospect.fixture.basis))assert.deepEqual(fixtureVerification.verifiedArtifact[key],value,key);
 items.push({name:'fixture',...prospect.fixture,verification:fixtureVerification,verified:fixtureVerification.verifiedArtifact});
 await save('same-process-verification.json',items.map(({name,verification,verified})=>({name,kind:verification.kind,coordinates:verification.coordinates,
  artifactDigest:verified.artifactDigest,productContentDigest:verified.productContentDigest,manifestDigest:verified.manifestDigest,
  ownerSelection:'same nominal verified object in process; saved evidence is not nominal authority'})));
 const constructorRows=(await read(join(C,'final-publication-bindings.json'))).constructorPopulation;
 const corePublications=constructorRows.map(row=>r.gtl[row.constructor]({...items[0].verified,productManifestDigest:items[0].verified.manifestDigest}));
 const originalPublication=await read(prospect.originalPublicationPreimage.path),fixtureBasis=items[1].verified;
 const fixturePublication=r.gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...structuredClone(originalPublication),
  artifactDigest:fixtureBasis.artifactDigest,productContentDigest:fixtureBasis.productContentDigest,productManifestDigest:fixtureBasis.manifestDigest,
  contributions:originalPublication.contributions.map(row=>({...structuredClone(row),provenanceRefs:[fixtureBasis.artifactDigest,fixtureBasis.manifestDigest]}))});
 const publications=[...corePublications,fixturePublication];
 assert.deepEqual(publications.map(p=>[p.owningProductId,p.moduleRef,product.modulePublicationSemanticDigest(p)].join('\0')).sort(),
  items.flatMap(i=>i.verified.contributionManifest.publicationBindings.map(p=>[i.verified.productId,p.moduleRef,p.publicationDigest].join('\0'))).sort());
 c=await caller('s03',coreVerification,deadline,D);
 const {abg,hash,actor,state,authorized,invoke}=c;
 progress('ordinary-public-environment-setup');
 const workspaceRoot=join(D,'resources/worksite');
 const created=await invoke('workspace',await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
  {targetRoot:workspaceRoot,createPolicy:'clean',scaffoldPolicy:'none'},
  {kind:'workspace_resource_assertion',schemaVersion,targetRoot:workspaceRoot,targetRootDigest:hash({kind:'workspace_target',targetRoot:workspaceRoot})},{actor}));
 const workspaceManifest=await read(created.receipt.resources.manifest.locator);
 for(const item of items){
  const v=item.verified;item.packed={kind:'product_verification_artifact_resource',schemaVersion,artifactPath:item.artifactPath,
   artifact:{ref:v.artifactRef,digest:v.artifactDigest},productContent:{ref:'product-content://abiogenesis/'+v.productContentDigest.slice(7),digest:v.productContentDigest},
   descriptor:item.verification.coordinates.descriptor,contributionManifest:{ref:v.contributionManifestRef,digest:v.contributionManifestDigest},
   manifestDigest:v.manifestDigest,productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion};
  const result=await invoke('verify-'+item.name,await authorized(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,
   {targetKind:'packed_artifact',artifact:item.packed.artifact,productContent:item.packed.productContent,descriptor:item.packed.descriptor,
    contributionManifest:item.packed.contributionManifest,declaredDependencies:v.declaredDependencies,
    compatibilityInputs:v.compatibilityRefs.map(compatibilityRef=>({compatibilityRef,subjectRef:item.packed.productContent.ref}))},
   {kind:'product_verification_resources',schemaVersion,targetKind:'packed_artifact',packedArtifact:item.packed}));
  item.verificationRef={invocation:{ref:result.call.invocation.invocationRef,digest:result.call.invocation.invocationDigest},outcome:result.receipt.ownerOutput.value.verifiedArtifact};
  item.verificationOutput=result.receipt.ownerOutput;
 }
 const resolvedLock=product.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion,memberKey:'resolve',verifiedArtifacts:items.map(i=>i.verified)});
 assert.equal(resolvedLock.kind,'resolved_product_lock',JSON.stringify(resolvedLock));state.resolvedLock=resolvedLock;
 const lock={ref:resolvedLock.lockId,digest:resolvedLock.lockDigest};
 await invoke('resolve',await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
  {requirements:items.map(i=>({productId:i.verified.productId,packageVersion:i.verified.packageVersion,requiredContractRefs:[],requiredCapabilityRefs:[]})),verifiedCandidates:items.map(i=>i.verificationRef)},
  {kind:'product_resolution_resource_assertion',schemaVersion,verifiedPreimages:items.map(i=>({verification:i.verificationRef,verifiedArtifact:i.verified,verificationOutput:i.verificationOutput})),
   nativeContractClosure:{selectorDispositions:[],occurrences:[],nativeBindings:[]}},{verification_references:items.map(i=>i.verificationRef)}));
 const resourceRoot=join(D,'resources'),eventLogPath=join(resourceRoot,'events/runtime.events.jsonl'),installRoot=join(resourceRoot,'installed');
 for(const item of items){
  const eventResource=state.closeHandoff?c.reopen():{kind:'new_abg_event_resource',schemaVersion,eventLogPath,locatorDigest:hash({kind:'abg_event_log_locator',eventLogPath:resolve(eventLogPath)})};
  const installed=await invoke('install-'+item.name,await authorized(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
   {verifiedArtifact:item.verification.coordinates.verifiedArtifact,descriptor:item.packed.descriptor,contributionManifest:item.packed.contributionManifest,
    resolvedLock:lock,targetRoot:join(installRoot,item.name),installPolicy:'clean'},
   {kind:'product_install_resource_assertion',schemaVersion,eventResource,packedArtifact:item.packed,verifiedArtifact:item.verified,resolvedLock},
   {dependency_lock:lock,verification_references:[item.verificationRef],actor}));
  const row=abg.projectAdmittedProductInstallByInvocationRef(abg.projectExactPrefixArtifactTruth(state.closeHandoff.prefix),installed.call.invocation.invocationRef);assert.ok(row);
  item.install=row.install;
 }
 const authorityManifest={workspaceId:workspaceManifest.workspaceRef,canonicalRoot:workspaceManifest.canonicalRoot,authorityMode:'trusted_developer',authorizedActorRef:c.op.actorRef};
 const workspaceAuthority=product.constructWorkspaceAuthorityBasis({...authorityManifest,authorityManifestRef:c.op.authorityRef+'/workspace-manifest',authorityManifestDigest:hash(authorityManifest)});
 const roots={toolchainRoot:installRoot,productRoot:items[0].install.installedRoot,eventLogRoot:dirname(eventLogPath),runtimeStateRoot:join(resourceRoot,'runtime'),projectionRoot:join(resourceRoot,'projections'),archiveRoot:join(resourceRoot,'archives')};
 const rootFields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'};
 const coordinates=items.map(i=>product.productInstallCoordinate(i.install));
 const bound=await invoke('bind',await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
  {workspaceAuthority:{ref:workspaceAuthority.authorityBasisId,digest:workspaceAuthority.authorityBasisDigest},installedSet:coordinates,resolvedLock:lock,
   declaredRoots:Object.entries(rootFields).map(([rootKind,field])=>({rootKind,path:roots[field]}))},
  {kind:'product_workspace_binding_resource_assertion',schemaVersion,eventResource:c.reopen(),workspaceAuthority,workspaceManifest,
   admittedInstalls:items.map(i=>i.install),resolvedLock,declaredRoots:roots},{product_set:coordinates,dependency_lock:lock,actor}));
 state.binding=bound.receipt.ownerOutput.value.binding;c.refresh();
 const publicationInputs={workspaceBinding:state.binding,descriptors:items.map(i=>i.packed.descriptor),verifiedProducts:items.map(i=>i.verified),modulePublications:publications};
 await save('publication-inputs.json',publicationInputs);
 const admitted=await invoke('catalog',await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
  {workspaceBinding:state.binding,descriptors:publicationInputs.descriptors,contributionManifests:items.map(i=>({ref:i.verified.contributionManifestRef,digest:i.verified.contributionManifestDigest})),resolvedLock:lock},
  {kind:'catalog_admission_resource_assertion',schemaVersion,eventResource:c.reopen(),workspaceBinding:state.environment.workspaceBinding,
   resolvedLock,verifiedProducts:publicationInputs.verifiedProducts,admittedInstalls:state.environment.productInstalls,publications},c.boundSlots()));
 const installed=state.environment.productInstalls.map(i=>abg.projectAdmittedProductInstallByAdmissionEventRef(state.environment.artifactTruth,i.admissionEventRef));assert.ok(installed.every(Boolean));
 state.catalog=product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion,memberKey:'admit',readinessBasis:{workspaceBinding:state.environment.workspaceBindingCandidate,
  resolvedLock,verifiedProducts:publicationInputs.verifiedProducts,installedProducts:installed.map(i=>i.candidate),publications}});
 assert.equal(state.catalog.kind,'graph_function_catalog',JSON.stringify(state.catalog));assert.equal(admitted.receipt.ownerOutput.value.catalog.digest,state.catalog.basisDigest);
 const program=fixturePublication.programs.find(p=>p.programRef==='program://s03-automatic/root@5');assert.ok(program);
 const allowlist=[...program.callableMembership].sort();
 const viewed=await invoke('catalog-view',await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
  {catalog:admitted.receipt.ownerOutput.value.catalog,allowlist},{kind:'catalog_view_resource_assertion',schemaVersion,catalog:state.catalog},c.boundSlots()));
 state.catalogView=product.narrowGraphFunctionCatalog(state.catalog,allowlist);assert.equal(viewed.receipt.ownerOutput.value.view.digest,state.catalogView.viewDigest);
 await c.conformance(program.programRef,'conformance-s03',publicationInputs);c.refresh();
 await save('setup-state.json',{...state,items,workspaceAuthority,workspaceManifest,roots,program,contractCatalog:c.contractCatalog});
 return {workspaceAuthority,workspaceManifest,roots,program,identity,prospect};
}
try{
 const {workspaceAuthority,prospect}=await setup();
 const f=await import(pathToFileURL(prospect.originalFixtureImplementation.path).href),oracle=await read(join(D,'original-oracle.json'));
 const consumers=originalConsumers(f);
 assert.deepEqual(f.DOMAIN_ORACLE.initialDomain,oracle.initialDomain);assert.equal(f.DOMAIN_ORACLE.handoff,oracle.negative.expectedHandoff);
 const replay=await import(pathToFileURL(join(c.packageIdentity.installedRoot,'build/code/src/abg/replay.js')).href);
 await save('proof-projector-binding.json',{path:join(c.packageIdentity.installedRoot,'build/code/src/abg/replay.js'),
  export:'projectRunIdentityAtPrefix',role:'read-only existing replay owner projection for original causal oracle; no runtime admission/effect',
  fixtureOriginalPureConstructors:prospect.originalFixtureImplementation});
 const environment=()=>({...c.state.environment,product:c.product,abg:c.abg,catalog:c.state.catalog,catalogView:c.state.catalogView,
  admittedInstalls:c.state.environment.productInstalls,workspaceAuthority,workspaceBinding:c.state.environment.workspaceBinding,verified:c.verified});
 const initial=await physical('initial');lastBoundary=c.state.closeHandoff;
 const semanticInputs=[];
 for(const entry of [{caseKey:'positive',correctionAvailable:true},{caseKey:'no-action',correctionAvailable:false}]){
  progress(entry.caseKey+'-start-preparation');c.refresh();
  const prepared=await preparePairCase({environment:environment(),publicApi:c.installedPublic,eventResource:c.reopen(),fixture:f,
   caseKey:entry.caseKey,identity:'c03-s03-'+entry.caseKey,eventTime:new Date().toISOString()});
  const made=prepared.made;semanticInputs.push(made.call.invocation.request.input.value);
  await save(entry.caseKey+'/start-preparation.json',{call:made.call,authority:made.workAuthority,policy:made.capabilityBasis.policy,
   resolution:made.resolution.resolution,input:made.call.invocation.request.input.value,ownerPrepared:prepared.ownerPrepared});
  const before=await physical(entry.caseKey+'/before');
  progress(entry.caseKey+'-ordinary-start');
  const started=await c.invoke(entry.caseKey+'-start',made.call,'start');
  assert.equal(started.receipt.ownerOutput.value.disposition,entry.correctionAvailable?'completed':'gap_stop');
  const boundary=c.state.closeHandoff;lastBoundary=boundary;
  const after=await physical(entry.caseKey+'/after');
  assert.equal(before.value.device,after.value.device);assert.equal(before.value.inode,after.value.inode);
  assert.ok(after.bytes.subarray(0,before.bytes.length).equals(before.bytes),'predecessor physical prefix conserved');
  const rows=c.abg.readRuntimeEventsAtDurablePrefix(boundary.prefix),prefix=c.abg.selectValidatedRuntimeEventPrefix(rows);
  const identity=replay.projectRunIdentityAtPrefix(prefix,started.receipt.resources.run.ref);assert.ok(identity);
  assert.deepEqual(identity.run,started.receipt.resources.run);assert.deepEqual(identity.run,started.receipt.ownerOutput.value.run);
  const semantic=consumers.assertNativeDomain({rows,run:identity.run,identity,prepared:made,oracle,correctionAvailable:entry.correctionAvailable});
  assert.deepEqual(identity.executionBasis,{ref:semantic.basis.payload.basisRef,digest:semantic.basis.payload.basisDigest});
  const cold={};
  for(const memberKey of ['run_result','run_replay','run_status','run_gaps']){
   progress(entry.caseKey+'-'+memberKey);c.refresh();
   const read=preparePairColdRead({environment:environment(),publicApi:c.installedPublic,projectReadContracts:c.abg,
    memberKey,run:identity.run,eventResource:c.reopen(),identity:'c03-s03-'+entry.caseKey+'-'+memberKey,eventTime:new Date().toISOString()});
   const expected=!entry.correctionAvailable&&memberKey==='run_result'?{outcomeKind:'refusal',code:'not_ready'}:{outcomeKind:'result'};
   const result=await c.invoke(entry.caseKey+'-'+memberKey,read.call,'read',expected);
   assert.deepEqual(c.state.closeHandoff.prefix,boundary.prefix);cold[memberKey]=result.receipt.ownerOutput;
  }
  const afterReads=await physical(entry.caseKey+'/after-reads');assert.deepEqual(afterReads.bytes,after.bytes);
  const proof=consumers.assertColdDomain({cold,identity,boundary,semantic,rows,oracle,correctionAvailable:entry.correctionAvailable,product:c.product});
  const rendering=renderPublicGapHandoff(cold.run_gaps);assert.equal(rendering,proof.handoff);
  await fs.writeFile(join(D,entry.caseKey,'public-handoff.txt'),rendering,{flag:'wx'});
  if(!entry.correctionAvailable){
   const frontier=cold.run_gaps.value.projection.frontiers[0];
   for(const evidence of frontier.basis.inputEvidence){
    const event=rows.find(e=>e.eventId===evidence.admissionEventRef);assert.ok(event);assert.equal(event.runId,identity.run.ref);
    assert.equal(event.aggregateId,frontier.nextAction.cCallRef);assert.equal(event.payload.evidenceRef,evidence.evidence.ref);
    assert.equal(event.payload.evidenceDigest,evidence.evidence.digest);assert.equal(event.payload.inputDigest,frontier.basis.valueDigest);
   }
  }
  await save(entry.caseKey+'/oracle-result.json',{status:'passed',identity,boundary,semantic,cold,
   physical:{before:before.value,after:after.value,afterReads:afterReads.value},rendering,
   claim:'original native causal and cold assertions on accepted C03; no arbitrary native correction or fullS03 claim'});
  results.push({caseKey:entry.caseKey,run:identity.run,executionBasis:identity.executionBasis,status:'passed',
   disposition:started.receipt.ownerOutput.value.disposition,eventGrowth:after.value.bytes-before.value.bytes,
   rootEvents:rows.filter(r=>r.runId===identity.run.ref).length,prefix:boundary.prefix,coldReads:4,coldAppendBytes:0,
   desired:10,actual:entry.correctionAvailable?10:3,unaffected:oracle.initialDomain.unaffected,rendering});
 }
 assert.deepEqual({...semanticInputs[0],correctionAvailable:false},semanticInputs[1],'same semantic inputs differ only by declared capability availability');
 const final=await physical('final');assert.ok(final.bytes.subarray(0,initial.bytes.length).equals(initial.bytes));
 await save('final-handoff.json',c.state.closeHandoff);
 await save('pair-result.json',{status:'passed',activation:'T287_RC1_S03_INSTALLED_PAIR_03',results,calls:c.state.calls,
  initial:initial.value,final:final.value,elapsedMs:performance.now()-began,budgetMs:1200000,
  limits:['bounded original S03a pair only','no fullS03 qualification','no native model/provider/network/Git or source/candidate effect'],
  zeroModelCalls:true,allPublicCallsFreshCLI:true,allColdReadsAppendNothing:true});
 console.log(JSON.stringify({status:'passed',cases:results.length,calls:c.state.calls.length,elapsedMs:performance.now()-began}));
}catch(error){
 let observed=null;
 try{if(c?.state.closeHandoff)observed=(await physical('failure-final')).value;}catch(observation){observed={observationError:observation.message};}
 if(c?.state.closeHandoff)await save('failure-final-handoff.json',c.state.closeHandoff);
 await save('failure.json',{status:'first_failure_stopped',phase,message:error.message,stack:error.stack,
  actualCalls:c?.state.calls??[],results,lastGenuineHandoff:c?.state.closeHandoff??lastBoundary,physical:observed,
  ownedDriverPid:process.pid,elapsedMs:performance.now()-began,constructionSourceProviderNetworkGitEffects:0});
 console.error(error.stack);process.exitCode=1;
}
