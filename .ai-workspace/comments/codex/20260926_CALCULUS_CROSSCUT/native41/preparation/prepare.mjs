import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import {join,dirname,basename} from 'node:path';
import {installedFullSandboxApis,prepareFullSandboxTransport,fullSandboxSetupCalls,constructFullSandboxEnvironmentResources} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/full-sandbox-support.mjs';
import {materializeD1Publication} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/d1-lifecycle-declarations.mjs';
import {nativeFullSandboxPublications,FULL_SANDBOX_IDS} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/full-sandbox-declarations.mjs';
// Ordinary one-case Public setup only. This caller does not dispatch actors.
const read=async p=>JSON.parse(await readFile(p,'utf8'));
console.error(JSON.stringify({phase:'full_sandbox_setup_start',pid:process.pid,startedAt:new Date().toISOString(),nativeActors:false}));
const selected=await read(join(import.meta.dirname,'selection.json'));
const scratch=import.meta.dirname,schemaVersion='5.0.0',actorRef='actor://odd-glc/generic-lifecycle/owner@5';
const save=async(n,v)=>writeFile(join(scratch,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
await mkdir(join(scratch,'timings'));
const core=await read(selected.coreSelection),configuration=await read(selected.configurationSource),consumer=await read(selected.consumerSelection);
const input=await read(selected.ordinaryInput),nativeInput=await read(selected.nativeIntakeInput),builtBasis=await read(selected.consumerBasis);
const pin={...core.basis,artifactPath:core.artifactPath,installedRoot:core.packageRoot};
const {product,gtl,abg,validator,installedPublic}=await installedFullSandboxApis(core.packageRoot);
const hash=product.sha256Canonical,coord=(ref,value={ref})=>({ref,digest:hash(value)});
for(const row of await read(join(scratch,'caller-subject.json')))assert.equal(await product.sha256File(row.path),'sha256:'+row.sha256);
assert.equal(nativeInput.kind,'native_semantic_revision_intake');assert.deepEqual(nativeInput.sourceRun,selected.sourceRun);assert.deepEqual(nativeInput.sourcePrefix,selected.sourcePrefix);
const oldReceipt=await read(selected.producerReceipt),originalClose=oldReceipt.receipt.resources.eventResource.closeHandoff;
assert.deepEqual(originalClose.prefix,selected.sourcePrefix);
assert.equal(await product.sha256File(selected.entryClosePath),'sha256:'+selected.entryCloseSha256);
const entryClose=await read(selected.entryClosePath);
const expected=b=>Object.fromEntries(['ArtifactDigest','ProductContentDigest','ManifestDigest','ProductId','PackageName','PackageVersion'].map(k=>['expected'+k,b[k[0].toLowerCase()+k.slice(1)]]));
const products=[];
for(const b of [pin,builtBasis]){
 const request={artifactPath:b.artifactPath,artifactRef:basename(b.artifactPath),...expected(b)};
 const verifyStarted=performance.now();
 const verification=await product.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request});
 await save('timings/nominal-verification-'+products.length+'.json',{elapsedMs:performance.now()-verifyStarted,kind:verification.kind});
 if(verification.kind!=='product_verification_success')await save('product-verification-refusal-'+products.length+'.json',verification);
 assert.equal(verification.kind,'product_verification_success');const v=verification.verifiedArtifact;
 products.push({request,verification,packed:{kind:'product_verification_artifact_resource',schemaVersion,artifactPath:request.artifactPath,
  artifact:{ref:v.artifactRef,digest:v.artifactDigest},productContent:{ref:'product-content://abiogenesis/'+v.productContentDigest.slice(7),digest:v.productContentDigest},
  descriptor:verification.coordinates.descriptor,contributionManifest:{ref:v.contributionManifestRef,digest:v.contributionManifestDigest},manifestDigest:v.manifestDigest,
  productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion}});
}
const abiArtifact=products[0].verification.verifiedArtifact,abiRequest=products[0].request,verifiedProducts=products.map(x=>x.verification.verifiedArtifact);
const resolvedLock=product.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion,memberKey:'resolve',verifiedArtifacts:verifiedProducts});
assert.equal(resolvedLock.kind,'resolved_product_lock','unchanged consumer compatibility with corrected core');
const lock={ref:resolvedLock.lockId,digest:resolvedLock.lockDigest};
const calls=[],cliPath=join(core.packageRoot,'build/code/src/public/cli.js'),callerState={ordinal:2500,closeHandoff:entryClose,calls,cliPath,product,abg,installedPublic};
const {call,authorized,reopen,invoke:ownerInvoke,acquire,close,prefix}=fullSandboxSetupCalls({scratch,abiArtifact,abiRequest,hash,coord,calls,state:callerState});
async function invoke(prepared,label){const started=performance.now();try{return await ownerInvoke(prepared,label);}finally{await save('timings/'+label+'.json',{definitionKey:prepared.invocation.definitionKey,elapsedMs:performance.now()-started,timingScope:'existing helper call including request/receipt retention and installed native Public transport; not isolated runtime attribution'});}}
try {
for(const [i,item]of products.entries()){
 const v=item.verification.verifiedArtifact;
 const verificationCall=await authorized(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,
 {targetKind:'packed_artifact',artifact:item.packed.artifact,productContent:item.packed.productContent,descriptor:item.packed.descriptor,
 contributionManifest:item.packed.contributionManifest,declaredDependencies:v.declaredDependencies,
 compatibilityInputs:v.compatibilityRefs.map(compatibilityRef=>({compatibilityRef,subjectRef:item.packed.productContent.ref}))},
 {kind:'product_verification_resources',schemaVersion,targetKind:'packed_artifact',packedArtifact:item.packed,verifiedArtifact:v});
 item.receipt=await invoke(verificationCall,i===0?'verify-core41':'verify-dev16');
 assert.equal(item.receipt.ownerOutput.value.verifiedArtifact.digest,v.verificationDigest);
 item.reference={invocation:{ref:verificationCall.invocation.invocationRef,digest:verificationCall.invocation.invocationDigest},outcome:item.receipt.ownerOutput.value.verifiedArtifact};
}
const resolutionReceipt=await invoke(await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
 {requirements:verifiedProducts.map(p=>({productId:p.productId,packageVersion:p.packageVersion,requiredContractRefs:[],requiredCapabilityRefs:[]})),verifiedCandidates:products.map(p=>p.reference)},
 {kind:'product_resolution_resource_assertion',schemaVersion,verifiedPreimages:products.map(p=>({verification:p.reference,verifiedArtifact:p.verification.verifiedArtifact,verificationOutput:p.receipt.ownerOutput})),
 nativeContractClosure:{selectorDispositions:[],occurrences:[],nativeBindings:[]}}, {verification_references:products.map(p=>p.reference)}),'resolve-core41-dev16');
assert.equal(hash(resolutionReceipt.ownerOutput.value.resolvedLock),hash(lock));
const actor={actor:coord(actorRef),attribution:coord('attribution://odd-glc/full-sandbox')},targets=[join(scratch,'products/core41'),join(scratch,'products/dev16')],installed=[];
await acquire();
for(const [i,item]of products.entries()){
 const request=await authorized(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
 {verifiedArtifact:item.verification.coordinates.verifiedArtifact,descriptor:item.packed.descriptor,contributionManifest:item.packed.contributionManifest,resolvedLock:lock,targetRoot:targets[i],installPolicy:'clean'},
 {kind:'product_install_resource_assertion',schemaVersion,eventResource:reopen(),packedArtifact:item.packed,verifiedArtifact:item.verification.verifiedArtifact,resolvedLock},
 {dependency_lock:lock,verification_references:[item.reference],actor});
 await invoke(request,i===0?'install-core41':'install-dev16');
 const row=abg.projectAdmittedProductInstallByInvocationRef(abg.projectExactPrefixArtifactTruth(prefix()),request.invocation.invocationRef);assert.ok(row);installed.push(row);
}
const abiRoot=installed[0].install.installedRoot,consumerRoot=installed[1].install.installedRoot,jobRoot=join(scratch,'invocation');await mkdir(jobRoot,{recursive:true});
const publicationBytes=await readFile(join(consumerRoot,'build/publication.json'));assert.equal(product.sha256Bytes(publicationBytes),builtBasis.payloadInventory.find(r=>r.path==='build/publication.json').sha256);
const publication=materializeD1Publication({gtl,identity:builtBasis,publicationData:JSON.parse(publicationBytes)}),lifecycle=publication.semanticJobLifecycle;
const publications=[...nativeFullSandboxPublications(gtl,abiArtifact,true),publication];
const priorBasis=await read(selected.producerReadbackBasis);
const workspaceAuthority=priorBasis.environment.workspaceAuthorityBasis,workspaceManifest=await read(join(selected.workspaceRoot,'.abiogenesis/workspace-manifest.json'));
assert.equal(workspaceAuthority.canonicalRoot,selected.workspaceRoot);
const conserved=[];
for(const member of input.members){const path=join(selected.workspaceRoot,member.path),expected=product.sha256Bytes(Buffer.from(member.base64,'base64'));assert.equal(await product.sha256File(path),expected,'preserved original source: '+member.path);conserved.push({path,sha256:expected});}
const rubric=join(selected.workspaceRoot,input.taskData.nativeLifecycle.rubricPath),rubricDigest=product.sha256Bytes(Buffer.from(product.canonicalJson(lifecycle)+'\n'));
assert.equal(await product.sha256File(rubric),rubricDigest,'preserved original rubric');conserved.push({path:rubric,sha256:rubricDigest});
// Existing accepted and rejected stage files are preserved; intake has no absence requirement.

await save('worksite-conservation.json',{workspaceRoot:selected.workspaceRoot,workspaceAuthority:{ref:workspaceAuthority.authorityBasisId,digest:workspaceAuthority.authorityBasisDigest},members:conserved,sourceRun:selected.sourceRun,sourcePrefix:selected.sourcePrefix,writes:'no application effect; current Public binding only'});
const roots={eventLogRoot:dirname(new URL(selected.sourcePrefix.eventLogRef).pathname),toolchainRoot:targets[0],productRoot:consumerRoot,runtimeStateRoot:join(jobRoot,'runtime'),projectionRoot:join(jobRoot,'projections'),archiveRoot:join(jobRoot,'archives')};
const rootFields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'};
const installs=installed.map(r=>r.install),coordinates=installs.map(product.productInstallCoordinate);
const bound=await invoke(await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
 {workspaceAuthority:{ref:workspaceAuthority.authorityBasisId,digest:workspaceAuthority.authorityBasisDigest},installedSet:coordinates,resolvedLock:lock,declaredRoots:Object.entries(rootFields).map(([rootKind,field])=>({rootKind,path:roots[field]}))},
 {kind:'product_workspace_binding_resource_assertion',schemaVersion,eventResource:reopen(),workspaceAuthority,workspaceManifest,admittedInstalls:installs,resolvedLock,declaredRoots:roots},
 {product_set:coordinates,dependency_lock:lock,actor}),selected.key+'-bind-existing-workspace');
const binding=bound.ownerOutput.value.binding,boundSlots={workspace_binding:binding,product_set:coordinates,dependency_lock:lock,actor};
const environment=abg.projectExactPrefixWorkspaceEnvironment(prefix(),binding);assert.equal(environment.kind,'exact_prefix_workspace_environment');
const catalogReceipt=await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
 {workspaceBinding:binding,descriptors:products.map(p=>p.packed.descriptor),contributionManifests:products.map(p=>p.packed.contributionManifest),resolvedLock:lock},
 {kind:'catalog_admission_resource_assertion',schemaVersion,eventResource:reopen(),workspaceBinding:environment.workspaceBinding,resolvedLock,verifiedProducts,admittedInstalls:installs,publications},boundSlots),'catalog');
const catalog=product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion,memberKey:'admit',readinessBasis:{workspaceBinding:environment.workspaceBindingCandidate,resolvedLock,verifiedProducts,installedProducts:installed.map(r=>r.candidate),publications}});assert.equal(catalog.kind,'graph_function_catalog');
const allowlist=catalog.entries.filter(r=>r.programMembershipRefs.includes(selected.programRef)).map(r=>r.handle).sort(),catalogView=product.narrowGraphFunctionCatalog(catalog,allowlist);
const view=await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,{catalog:catalogReceipt.ownerOutput.value.catalog,allowlist},{kind:'catalog_view_resource_assertion',schemaVersion,catalog},boundSlots),'view');
const catalogScope={catalog:catalogReceipt.ownerOutput.value.catalog,view:view.ownerOutput.value.view,allowlist:catalogView.allowlist};
const program=publication.programs.find(p=>p.programRef===selected.programRef);
assert.ok(program);const runEnvironment=publication.runEnvironments.find(e=>e.declarationRef===program.policies[gtl.RUN_ENVIRONMENT_POLICY]);assert.ok(runEnvironment);
const law=coord('law://abiogenesis/validator/gtl-program@5');
const checked=await invoke(await authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
 {program:coord(program.programRef,program),conformanceLaw:law,inventoryBasis:{kind:'declared_inventory',inventory:catalog.boundPublications.map(p=>coord(p.moduleRef,p)).sort((a,b)=>a.ref.localeCompare(b.ref))}},
 {kind:'conformance_evaluation_resource_assertion',schemaVersion,packet:{kind:'conformance_evaluate_packet',schemaVersion,memberKey:'gtl_program',publication,program},conformanceLaw:law,declaredInventory:catalog.boundPublications,declarationCatalog:{catalog,catalogView}},boundSlots),'intake-conformance');
assert.equal(checked.ownerOutput.value.disposition,'passed');
const resolutionStarted=performance.now();
const resolution=await product.ProductExecutionResolutionPort.resolve({catalog,catalogView,admittedInstalls:environment.productInstalls,verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(environment.artifactTruth,install),programRef:program.programRef,selection:{kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'}});
await save('timings/execution-resolution.json',{elapsedMs:performance.now()-resolutionStarted,kind:resolution.kind});
await save('execution-resolution.json',resolution.kind==='loaded_product_execution_resolution'?{kind:resolution.kind,resolution:resolution.resolution}:resolution);
assert.equal(resolution.kind,'loaded_product_execution_resolution',JSON.stringify({kind:resolution.kind,code:resolution.code,stage:resolution.stage,message:resolution.message}));
const packet=product.RUN_OPERATION_CONTRACTS.invoke.start;
const policy=product.constructRootInvocationPolicy(environment.workspaceBinding,program,[],['F_D','F_P'],[]);
const grantBasis={admittedInstalls:environment.productInstalls,workspaceBinding:environment.workspaceBinding,fixedPacket:packet};
const grants=[product.constructCapabilityGrant(policy,actorRef,'abg.operation.run.invoke',product.DIRECT_INVOKE_CAPABILITY,grantBasis)];
const authority=product.constructInvocationAuthority(actorRef,environment.workspaceBinding,catalogView,program.programRef,resolution.selectedCatalogEntry,policy,grants,grantBasis);
const temporaryRoot=join(roots.archiveRoot,'run-environment-access');await mkdir(temporaryRoot,{recursive:true});
const runEnvironmentResources=constructFullSandboxEnvironmentResources({product,declaration:runEnvironment,configuration:configuration.runEnvironmentResources,authority,program,temporaryRoot});
assert.equal(resolution.resolution.inputContract.contractRef,gtl.SEMANTIC_REVISION_IDS.nativeIntakeContractRef);
const carrier={contract:{ref:resolution.resolution.inputContract.contractRef,digest:resolution.resolution.inputContractDigest},valueRef:'value://odd-glc/native-semantic-revision/bootstrap-intake@5',valueDigest:hash(nativeInput),value:nativeInput};
await close();
const eventResource=reopen(),steeringDigest=hash(eventResource);
const slots={graph_function:null,verification_references:null,execution_basis:null,workspace_binding:boundSlots.workspace_binding,product_set:installs.map(i=>({ref:i.installId,digest:i.productContentDigest})),dependency_lock:lock,catalog_scope:catalogScope,
 execution_program:{ref:program.programRef,digest:resolution.resolution.programDigest},input_contract:carrier,session_policy:{ref:policy.policyRef,digest:policy.policyDigest},capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))},actor:{actor:coord(actorRef,{actorRef}),attribution:{ref:authority.authorityRef,digest:authority.authorityDigest}},transport_steering:{ref:'transport-steering://abiogenesis/'+steeringDigest.slice(7),digest:steeringDigest}};
const request={program:slots.execution_program,scope:'program',target:{kind:'next'},until:'converged',catalogView:catalogScope.view,allowlist,input:carrier,fhMode:'direct',rootMode:'direct',sourceBasis:{kind:'none'}};
const resources={kind:'run_invocation_resource_assertion',schemaVersion,catalog,catalogView,applications:[],applicationResources:[],source:{kind:'none'},runEnvironmentResources,eventResource};
const prepared=call(packet,request,slots,resources);
const transport=await prepareFullSandboxTransport(selected.transportConfiguration,{product,abg});
await save('intake-start.jsonl',{kind:'abg_cli_transport_request',schemaVersion,acquisition:{kind:'reopen',closeHandoff:eventResource.closeHandoff},invocation:prepared});
await save('readback-basis.json',{abiRoot,abiArtifact,environment,boundSlots,lock,actorRef,ordinal:callerState.ordinal,closeHandoff:callerState.closeHandoff,declaration:lifecycle,publication});
await save('prepared.json',{status:'CLOSED_PREPARED_NOT_LAUNCHED',sourceRun:selected.sourceRun,sourcePrefix:selected.sourcePrefix,successorCloseHandoff:callerState.closeHandoff,core,consumer,workspaceRoot:selected.workspaceRoot,programRef:program.programRef,programDigest:resolution.resolution.programDigest,input:nativeInput,launchPath:join(scratch,'intake-start.jsonl'),launchDigest:await product.sha256File(join(scratch,'intake-start.jsonl')),transport,readbackMs:selected.readbackMs,maximumPaidOccurrences:1,perOccurrenceUsd:selected.perOccurrenceUsd,calls,noActors:true,noApplicationEffects:true,pureLookupExport:'@odd-glc/route-one-typescript/native-lifecycle',next:'Root STEP6 selected ordinary original-root read, actual reprice witness, one intake and authenticated-choice declared suffix; no automatic retry'});
console.log(JSON.stringify({status:'CLOSED_PREPARED_NOT_LAUNCHED',programRef:program.programRef,sourceRun:selected.sourceRun,successorPrefix:prefix()}));

} finally { await close(); }
