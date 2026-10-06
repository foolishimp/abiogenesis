// DRAFT: setup only, separately activated. No Hello rerun, model call or qualification claim.
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {caller,verificationRequest,schemaVersion} from './ordinary-caller.mjs';
import {loadRuntime} from './public-support.mjs';
export async function setup(executionRoot){
 const here=executionRoot,read=async p=>JSON.parse(await readFile(p,'utf8'));
 const fs=await import('node:fs/promises');
 const write=(n,v)=>fs.writeFile(join(here,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
 const activation=await read(join(here,'runtime-activation.json'));
 assert.equal(activation.kind,'root_runtime_execution_activation');
 assert.equal(activation.operation,'T287_F11_CARRIER_INSTALLED_DISCRIMINATOR_01');
 assert.equal(activation.executionRoot,here);assert.equal(activation.realProviderCalls,0);
 const identity=await read(join(here,'selected-core.json')),prospect=await read(join(here,'prospective-cases.json'));
 const r=await loadRuntime(identity.installedRoot),{product}=r,items=[{name:'core',...prospect.core}];
 const item=items[0],packet={kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(item)};
 item.verification=await product.ProductVerificationPort.verify(packet);assert.equal(item.verification.kind,'product_verification_success');item.verified=item.verification.verifiedArtifact;
 assert.strictEqual(product.selectOwnedProductVerification(packet.request,item.verified),item.verified);
 assert.equal(product.sha256Canonical(await read(join(identity.installedRoot,'product-toolchain-manifest.json'))),identity.basis.manifestDigest);
 const constructors=['constructDefaultGovernanceLibraryModulePublication','constructHelloWorldModulePublication','constructConsensusModulePublication','constructWorksiteConstructionModulePublication','constructWorksiteCommandExecutionModulePublication','constructWorksiteCommandForwardModulePublication','constructRequirementHandoffModulePublication','constructSemanticStageModulePublication','constructSemanticRevisionModulePublication','constructSelfConformanceModulePublication','constructNativeWorkspaceWorkModulePublication'];
 const preparedPublications=constructors.map(name=>r.gtl[name]({...item.verified,productManifestDigest:item.verified.manifestDigest}));
 assert.deepEqual(preparedPublications.map(p=>[p.owningProductId,p.moduleRef,product.modulePublicationSemanticDigest(p)].join('\0')).sort(),item.verified.contributionManifest.publicationBindings.map(p=>[item.verified.productId,p.moduleRef,p.publicationDigest].join('\0')).sort());
 const budgets=await read(join(here,'budgets.json')),driverStart=performance.now(),driverDeadline=driverStart+budgets.driverBudgetMs;
 const c=await caller('setup',item.verification,driverDeadline,executionRoot),{abg,gtl,hash,actor,state,authorized,invoke,coord}=c;
 const workspaceRoot=join(here,'resources/worksite');await mkdir(join(here,'resources/events'),{recursive:true});
 const created=await invoke('workspace',await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,{targetRoot:workspaceRoot,createPolicy:'clean',scaffoldPolicy:'none'},{kind:'workspace_resource_assertion',schemaVersion,targetRoot:workspaceRoot,targetRootDigest:hash({kind:'workspace_target',targetRoot:workspaceRoot})},{actor}));
 const workspaceManifest=await read(created.receipt.resources.manifest.locator);
 for(const item of items){
  const v=item.verified;item.packed={kind:'product_verification_artifact_resource',schemaVersion,artifactPath:item.artifactPath,artifact:{ref:v.artifactRef,digest:v.artifactDigest},productContent:{ref:'product-content://abiogenesis/'+v.productContentDigest.slice(7),digest:v.productContentDigest},descriptor:item.verification.coordinates.descriptor,contributionManifest:{ref:v.contributionManifestRef,digest:v.contributionManifestDigest},manifestDigest:v.manifestDigest,productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion};
  const result=await invoke('verify-'+item.name,await authorized(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,{targetKind:'packed_artifact',artifact:item.packed.artifact,productContent:item.packed.productContent,descriptor:item.packed.descriptor,contributionManifest:item.packed.contributionManifest,declaredDependencies:v.declaredDependencies,compatibilityInputs:v.compatibilityRefs.map(compatibilityRef=>({compatibilityRef,subjectRef:item.packed.productContent.ref}))},{kind:'product_verification_resources',schemaVersion,targetKind:'packed_artifact',packedArtifact:item.packed}));
  item.verificationRef={invocation:{ref:result.call.invocation.invocationRef,digest:result.call.invocation.invocationDigest},outcome:result.receipt.ownerOutput.value.verifiedArtifact};item.verificationOutput=result.receipt.ownerOutput;
 }
 const resolvedLock=product.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion,memberKey:'resolve',verifiedArtifacts:items.map(x=>x.verified)});assert.equal(resolvedLock.kind,'resolved_product_lock',JSON.stringify(resolvedLock));state.resolvedLock=resolvedLock;
 const lock={ref:resolvedLock.lockId,digest:resolvedLock.lockDigest};
 await invoke('resolve',await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,{requirements:items.map(i=>({productId:i.verified.productId,packageVersion:i.verified.packageVersion,requiredContractRefs:[],requiredCapabilityRefs:[]})),verifiedCandidates:items.map(i=>i.verificationRef)},{kind:'product_resolution_resource_assertion',schemaVersion,verifiedPreimages:items.map(i=>({verification:i.verificationRef,verifiedArtifact:i.verified,verificationOutput:i.verificationOutput})),nativeContractClosure:{selectorDispositions:[],occurrences:[],nativeBindings:[]}},{verification_references:items.map(i=>i.verificationRef)}));
 const resourcesRoot=join(here,'resources'),eventLogPath=join(resourcesRoot,'events/runtime.events.jsonl'),installRoot=join(resourcesRoot,'installed');
 for(const item of items){
  const eventResource=state.closeHandoff?c.reopen():{kind:'new_abg_event_resource',schemaVersion,eventLogPath,locatorDigest:hash({kind:'abg_event_log_locator',eventLogPath:resolve(eventLogPath)})};
  const installed=await invoke('install-'+item.name,await authorized(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,{verifiedArtifact:item.verification.coordinates.verifiedArtifact,descriptor:item.packed.descriptor,contributionManifest:item.packed.contributionManifest,resolvedLock:lock,targetRoot:join(installRoot,item.name),installPolicy:'clean'},{kind:'product_install_resource_assertion',schemaVersion,eventResource,packedArtifact:item.packed,verifiedArtifact:item.verified,resolvedLock},{dependency_lock:lock,verification_references:[item.verificationRef],actor}));
  const row=abg.projectAdmittedProductInstallByInvocationRef(abg.projectExactPrefixArtifactTruth(state.closeHandoff.prefix),installed.call.invocation.invocationRef);assert.ok(row);item.install=row.install;
 }
 const authorityManifest={workspaceId:workspaceManifest.workspaceRef,canonicalRoot:workspaceManifest.canonicalRoot,authorityMode:'trusted_developer',authorizedActorRef:c.op.actorRef};
 const workspaceAuthority=product.constructWorkspaceAuthorityBasis({...authorityManifest,authorityManifestRef:c.op.authorityRef+'/workspace-manifest',authorityManifestDigest:hash(authorityManifest)});
 const roots={toolchainRoot:installRoot,productRoot:items[0].install.installedRoot,eventLogRoot:dirname(eventLogPath),runtimeStateRoot:join(resourcesRoot,'runtime'),projectionRoot:join(resourcesRoot,'projections'),archiveRoot:join(resourcesRoot,'archives')};
 const rootFields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'},coordinates=items.map(i=>product.productInstallCoordinate(i.install));
 const bound=await invoke('bind',await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,{workspaceAuthority:{ref:workspaceAuthority.authorityBasisId,digest:workspaceAuthority.authorityBasisDigest},installedSet:coordinates,resolvedLock:lock,declaredRoots:Object.entries(rootFields).map(([rootKind,field])=>({rootKind,path:roots[field]}))},{kind:'product_workspace_binding_resource_assertion',schemaVersion,eventResource:c.reopen(),workspaceAuthority,workspaceManifest,admittedInstalls:items.map(i=>i.install),resolvedLock,declaredRoots:roots},{product_set:coordinates,dependency_lock:lock,actor}));
 state.binding=bound.receipt.ownerOutput.value.binding;c.refresh();
 const coreBasis={...items[0].verified,productManifestDigest:items[0].verified.manifestDigest};
 const publications=preparedPublications;
 assert.deepEqual(publications.map(p=>[p.owningProductId,p.moduleRef,product.modulePublicationSemanticDigest(p)].join('\0')).sort(),items.flatMap(i=>i.verified.contributionManifest.publicationBindings.map(p=>[i.verified.productId,p.moduleRef,p.publicationDigest].join('\0'))).sort(),'complete exact installed publication inventories');
 const publicationInputs={workspaceBinding:state.binding,descriptors:items.map(i=>i.packed.descriptor),verifiedProducts:items.map(i=>i.verified),modulePublications:publications};await write('publication-inputs.json',publicationInputs);
 const catalogResult=await invoke('catalog',await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,{workspaceBinding:state.binding,descriptors:publicationInputs.descriptors,contributionManifests:items.map(i=>({ref:i.verified.contributionManifestRef,digest:i.verified.contributionManifestDigest})),resolvedLock:lock},{kind:'catalog_admission_resource_assertion',schemaVersion,eventResource:c.reopen(),workspaceBinding:state.environment.workspaceBinding,resolvedLock,verifiedProducts:publicationInputs.verifiedProducts,admittedInstalls:state.environment.productInstalls,publications},c.boundSlots()));
 const installed=state.environment.productInstalls.map(i=>abg.projectAdmittedProductInstallByAdmissionEventRef(state.environment.artifactTruth,i.admissionEventRef));assert.ok(installed.every(Boolean));
 state.catalog=product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion,memberKey:'admit',readinessBasis:{workspaceBinding:state.environment.workspaceBindingCandidate,resolvedLock,verifiedProducts:publicationInputs.verifiedProducts,installedProducts:installed.map(i=>i.candidate),publications}});assert.equal(state.catalog.kind,'graph_function_catalog',JSON.stringify(state.catalog));assert.equal(catalogResult.receipt.ownerOutput.value.catalog.digest,state.catalog.basisDigest);
 const programs=publications.flatMap(p=>p.programs).filter(p=>['program://abiogenesis/qualification/assess@5',gtl.SELF_CONFORMANCE_IDS.programRef,'program://abiogenesis/qualification/exact-candidate@5'].includes(p.programRef));assert.equal(programs.length,3);
 const allowlist=[...new Set(programs.flatMap(p=>p.callableMembership))].sort();
 await invoke('catalog-view',await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,{catalog:catalogResult.receipt.ownerOutput.value.catalog,allowlist},{kind:'catalog_view_resource_assertion',schemaVersion,catalog:state.catalog},c.boundSlots()));state.catalogView=product.narrowGraphFunctionCatalog(state.catalog,allowlist);
 for(const p of programs)await c.conformance(p.programRef,'conformance-'+p.programRef.split('/').at(-1).split('@')[0],publicationInputs);
 c.refresh();await write('setup-state.json',{...state,items,workspaceAuthority,workspaceManifest,roots,contractCatalog:c.contractCatalog});console.log(JSON.stringify({phase:'ordinary_setup_complete',calls:state.calls.length,install:items[0].install.installId,workspaceBinding:state.binding,prefix:state.closeHandoff.prefix}));
 await write('setup-closed-environment.json',{...state.environment,catalog:state.catalog,catalogView:state.catalogView,installedRoot:identity.installedRoot,verified:item.verified,closeHandoff:state.closeHandoff});
 return {caller:c,identity,prospect,items,workspaceAuthority,workspaceManifest,roots,driverDeadline};
}
