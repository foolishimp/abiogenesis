import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {installedFullSandboxApis,prepareFullSandboxTransport,fullSandboxSetupCalls,constructFullSandboxEnvironmentResources} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/full-sandbox-support.mjs';
const D=import.meta.dirname,P=join(D,'../preparation'),I=join(D,'../intake-01'),read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(n,v)=>writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
await mkdir(join(D,'timings'));
const prepared=await read(join(P,'prepared.json')),prior=await read(join(P,'readback-basis.json')),selection=await read(join(P,'selection.json'));
const intake=await read(join(I,'intake-readback.json')),requestValue=await read(join(I,'intake-terminal-request.json'));
assert.equal(intake.status,'returned_unique_declared_suffix');
const core=await read(selection.coreSelection),configuration=await read(selection.configurationSource);
const {product,gtl,abg,validator,installedPublic}=await installedFullSandboxApis(prior.abiRoot);
const hash=product.sha256Canonical,coord=(ref,value={ref})=>({ref,digest:hash(value)}),schemaVersion='5.0.0';
assert.equal(hash(requestValue),intake.valueDigest);
const lookup=await import(pathToFileURL(join((await read(join(I,'native-prepared.json'))).consumerRoot,'build/native-lifecycle-declarations.mjs')).href);
const selected=lookup.selectNativeSemanticRevisionStart({product,publication:prior.publication,request:requestValue});
assert.deepEqual(selected,intake.selected);
const abiRequest={artifactPath:core.artifactPath,artifactRef:basename(core.artifactPath),...Object.fromEntries(['ArtifactDigest','ProductContentDigest','ManifestDigest','ProductId','PackageName','PackageVersion'].map(k=>['expected'+k,core.basis[k[0].toLowerCase()+k.slice(1)]]))};
let started=performance.now();const verification=await product.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request:abiRequest});
await save('verification.json',{kind:verification.kind,elapsedMs:performance.now()-started,...(verification.kind==='product_verification_success'?{coordinates:verification.coordinates}:{refusal:verification})});assert.equal(verification.kind,'product_verification_success');
const abiArtifact=verification.verifiedArtifact,close=(await read(join(I,'live-receipt.json'))).receipt.resources.eventResource.closeHandoff;
assert.deepEqual(close.prefix,intake.prefix);
const calls=[],state={ordinal:3100,closeHandoff:close,product,abg,installedPublic};
const setup=fullSandboxSetupCalls({scratch:D,abiArtifact,abiRequest,hash,coord,calls,state});
async function invoke(call,label){const start=performance.now();try{return await setup.invoke(call,label);}finally{await save('timings/'+label+'.json',{elapsedMs:performance.now()-start,definitionKey:call.invocation.definitionKey});}}
try {
 await setup.acquire();
 const environment=abg.projectExactPrefixWorkspaceEnvironment(setup.prefix(),prior.boundSlots.workspace_binding);assert.equal(environment.kind,'exact_prefix_workspace_environment');
 const {catalog}= (await read(join(I,'intake-start.jsonl'))).invocation.resources;
 const oldScope=(await read(join(I,'intake-start.jsonl'))).invocation.invocation.invocationAuthority.slots.catalog_scope;
 const allowlist=catalog.entries.filter(row=>row.programMembershipRefs.includes(selected.programRef)).map(row=>row.handle).sort();
 const catalogView=product.narrowGraphFunctionCatalog(catalog,allowlist),boundSlots=prior.boundSlots,lock=prior.lock,actorRef=prior.actorRef;
 const view=await invoke(await setup.authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,{catalog:oldScope.catalog,allowlist},{kind:'catalog_view_resource_assertion',schemaVersion,catalog},boundSlots),'selected-suffix-view');
 const catalogScope={catalog:oldScope.catalog,view:view.ownerOutput.value.view,allowlist:catalogView.allowlist};
 const publication=prior.publication,program=publication.programs.find(p=>p.programRef===selected.programRef);assert.ok(program);
 assert.equal(program.policies['abg.default_start_ref'],selected.startRef);
 const law=coord('law://abiogenesis/validator/gtl-program@5');
 const conformance=await invoke(await setup.authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
  {program:coord(program.programRef,program),conformanceLaw:law,inventoryBasis:{kind:'declared_inventory',inventory:catalog.boundPublications.map(p=>coord(p.moduleRef,p)).sort((a,b)=>a.ref.localeCompare(b.ref))}},
  {kind:'conformance_evaluation_resource_assertion',schemaVersion,packet:{kind:'conformance_evaluate_packet',schemaVersion,memberKey:'gtl_program',publication,program},conformanceLaw:law,declaredInventory:catalog.boundPublications,declarationCatalog:{catalog,catalogView}},boundSlots),'selected-suffix-conformance');
 assert.equal(conformance.ownerOutput.value.disposition,'passed');
 started=performance.now();
 const resolution=await product.ProductExecutionResolutionPort.resolve({catalog,catalogView,admittedInstalls:environment.productInstalls,verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(environment.artifactTruth,i),programRef:program.programRef,selection:{kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'}});
 await save('execution-resolution.json',resolution.kind==='loaded_product_execution_resolution'?{kind:resolution.kind,resolution:resolution.resolution}:resolution);
 await save('timings/execution-resolution.json',{kind:resolution.kind,elapsedMs:performance.now()-started});assert.equal(resolution.kind,'loaded_product_execution_resolution','complete resolver response retained');
 const packet=product.RUN_OPERATION_CONTRACTS.invoke.start,regimes=new Set([...resolution.programValidation.executableLeafRows,...resolution.programValidation.interactionLeafRows].map(row=>row.fibre));
 const policy=product.constructRootInvocationPolicy(environment.workspaceBinding,program,[],['F_D','F_P','F_H'].filter(r=>regimes.has(r)),[]);
 const grantBasis={admittedInstalls:environment.productInstalls,workspaceBinding:environment.workspaceBinding,fixedPacket:packet};
 const grants=[product.constructCapabilityGrant(policy,actorRef,'abg.operation.run.invoke',product.DIRECT_INVOKE_CAPABILITY,grantBasis)];
 const authority=product.constructInvocationAuthority(actorRef,environment.workspaceBinding,catalogView,program.programRef,resolution.selectedCatalogEntry,policy,grants,grantBasis);
 const runEnvironment=publication.runEnvironments.find(e=>e.declarationRef===program.policies[gtl.RUN_ENVIRONMENT_POLICY]);assert.ok(runEnvironment);
 const temporaryRoot=join(environment.workspaceBinding.roots.archiveRoot,'run-environment-access');await mkdir(temporaryRoot,{recursive:true});
 const runEnvironmentResources=constructFullSandboxEnvironmentResources({product,declaration:runEnvironment,configuration:configuration.runEnvironmentResources,authority,program,temporaryRoot});
 assert.equal(resolution.resolution.inputContract.contractRef,gtl.SEMANTIC_REVISION_IDS.requestContractRef);
 const carrier={contract:{ref:resolution.resolution.inputContract.contractRef,digest:resolution.resolution.inputContractDigest},valueRef:'value://odd-glc/native-semantic-revision/admitted-request@5',valueDigest:hash(requestValue),value:requestValue};
 await setup.close();const eventResource=setup.reopen(),steering=hash(eventResource);
 const slots={graph_function:null,verification_references:null,execution_basis:null,workspace_binding:boundSlots.workspace_binding,product_set:environment.productInstalls.map(i=>({ref:i.installId,digest:i.productContentDigest})),dependency_lock:lock,catalog_scope:catalogScope,
  execution_program:{ref:program.programRef,digest:resolution.resolution.programDigest},input_contract:carrier,session_policy:{ref:policy.policyRef,digest:policy.policyDigest},capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))},actor:{actor:coord(actorRef,{actorRef}),attribution:{ref:authority.authorityRef,digest:authority.authorityDigest}},transport_steering:{ref:'transport-steering://abiogenesis/'+steering.slice(7),digest:steering}};
 const request={program:slots.execution_program,scope:'program',target:{kind:'next'},until:'converged',catalogView:catalogScope.view,allowlist,input:carrier,fhMode:'direct',rootMode:'direct',sourceBasis:{kind:'none'}};
 const resources={kind:'run_invocation_resource_assertion',schemaVersion,catalog,catalogView,applications:[],applicationResources:[],source:{kind:'none'},runEnvironmentResources,eventResource};
 const call=setup.call(packet,request,slots,resources);await save('suffix-start.jsonl',{kind:'abg_cli_transport_request',schemaVersion,acquisition:{kind:'reopen',closeHandoff:eventResource.closeHandoff},invocation:call});
 await save('readback-basis.json',{...prior,abiArtifact,environment,closeHandoff:state.closeHandoff,ordinal:state.ordinal});
 const original=await read(join(I,'native-prepared.json'));
 const transport=await prepareFullSandboxTransport(selection.suffixTransportConfiguration,{product,abg});
 await save('native-prepared.json',{...original,transport,key:'bootstrap-native-d2-suffix',scratch:D,setupRoot:D,launchPath:join(D,'suffix-start.jsonl'),launchDigest:await product.sha256File(join(D,'suffix-start.jsonl')),ordinal:state.ordinal,inputDigest:carrier.valueDigest,setupPrefix:state.closeHandoff.prefix,maximumActorOccurrences:12,
  lifecycle:{...original.lifecycle,programRef:program.programRef,programDigest:resolution.resolution.programDigest,actorOccurrenceUpperBound:12},boundary:'Complete graph-declared suffix selected only from ordinary admitted terminal request and public publication lookup; no host stage loop.'});
 await save('prepared.json',{status:'CLOSED_PREPARED_NOT_LAUNCHED',selected,selectionChoice:requestValue.selectionChoice,inputDigest:carrier.valueDigest,sourceIntakeRun:intake.run,originalSourceRun:prepared.sourceRun,originalSourcePrefix:prepared.sourcePrefix,calls,closeHandoff:state.closeHandoff,transport,readbackMs:prepared.readbackMs,maximumActorOccurrences:12,perOccurrenceUsd:8,limitsUnchangedExceptSuffixBudget:true});
 console.log(JSON.stringify({status:'CLOSED_PREPARED_NOT_LAUNCHED',selected,close:state.closeHandoff.prefix.coordinateDigest}));
}catch(error){await save('first-failure.json',{message:error.message,stack:error.stack,calls});throw error;}finally{await setup.close();}
