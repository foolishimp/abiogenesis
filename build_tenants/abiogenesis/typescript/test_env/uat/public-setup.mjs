import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { IDS, prepareConsumer } from './consumer.mjs';

const version='5.0.0';
const constructors=['constructConsensusModulePublication','constructDefaultGovernanceLibraryModulePublication',
  'constructSelfConformanceModulePublication','constructRequirementHandoffModulePublication',
  'constructSemanticRevisionModulePublication','constructSemanticStageModulePublication',
  'constructWorksiteCommandExecutionModulePublication','constructWorksiteCommandForwardModulePublication',
  'constructWorksiteConstructionModulePublication','constructNativeWorkspaceWorkModulePublication'];
const emptySlots=()=>Object.fromEntries(['workspace_binding','product_set','dependency_lock','catalog_scope',
  'execution_program','graph_function','input_contract','session_policy','capability_grants','actor',
  'transport_steering','verification_references','execution_basis'].map(key=>[key,null]));

export class BoundaryFailure extends Error {
  constructor(stage,observation){super(stage+': '+JSON.stringify(observation));this.stage=stage;this.observation=observation;}
}
export function requireKind(value,kind,stage){if(value?.kind!==kind)throw new BoundaryFailure(stage,value);return value;}
export async function installedModules(root) {
  const load=name=>import(pathToFileURL(join(root,'build/code/src',name,'index.js')).href);
  const [product,abg,gtl,validator,api,invocationTruth]=await Promise.all([
    ...['product','abg','gtl','validator','public'].map(load),
    import(pathToFileURL(join(root,'build/code/src/abg/invocation_execution_truth.js')).href)]);
  return {product,abg,gtl,validator,api,invocationTruth};
}

export async function verifyArtifact(runtime,{artifactPath,manifest,expectedArtifactDigest},record,label) {
  const {product}=runtime;
  const request={artifactPath,artifactRef:pathToFileURL(artifactPath).href,expectedArtifactDigest,
    expectedProductContentDigest:manifest.productContentDigest,expectedManifestDigest:product.sha256Canonical(manifest),
    expectedProductId:manifest.productId,expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion};
  const verification=await product.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion:version,
    memberKey:'verify',targetKind:'packed_artifact',request});
  await record(label+'-acquisition.json',{request,verification});
  requireKind(verification,'product_verification_success',label+'-artifact-verification');
  return {request,verification,verified:verification.verifiedArtifact};
}

export function publicCaller({root,runtime,native,command,record,config}) {
  const {product,abg,api}=runtime, hash=product.sha256Canonical;
  const state={closeHandoff:null,binding:null,environment:null,resolvedLock:null,catalog:null,catalogView:null,calls:[]};
  const actorRef='actor://abi5-tests/sandbox-uat/'+config.runId;
  const coordinate=(ref,value={ref})=>({ref,digest:hash(value)});
  const actor={actor:coordinate(actorRef),attribution:coordinate(actorRef+'/test-owner')};
  const verified=native.verified, contractCatalog={productId:verified.productId,productContentDigest:verified.productContentDigest,
    catalogId:verified.catalogId,catalogVersion:version,catalogDigest:verified.catalogDigest};
  const reopen=()=>({kind:'reopen_abg_event_resource',schemaVersion:version,closeHandoff:state.closeHandoff,handoffDigest:hash(state.closeHandoff)});
  const refresh=(readSource)=>{
    const prefix=state.closeHandoff.prefix,retained=readSource??state.environment?.prefix;
    const source=retained&&hash(retained)===hash(prefix)?retained:prefix;
    const truth=requireKind(abg.projectOwnedPrefixArtifactTruth(source),'exact_prefix_artifact_truth_projection','workspace-prefix-projection');
    if(!abg.validateExactPrefixArtifactTruthProjection(truth,{requireCurrent:true}))throw new BoundaryFailure('workspace-prefix-projection','Authenticated read source is not current');
    state.environment=requireKind(abg.projectWorkspaceEnvironmentFromArtifactTruth(truth,state.binding),
      'exact_prefix_workspace_environment','workspace-prefix-projection');
    return state.environment;
  };
  const boundSlots=()=>({workspace_binding:state.binding,product_set:state.environment.productInstalls.map(product.productInstallCoordinate),
    dependency_lock:{ref:state.resolvedLock.lockId,digest:state.resolvedLock.lockDigest},actor});
  async function authorize(packet,request,resources,supplied={}) {
    const definition=api.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(row=>row.definitionKey.operationId===packet.definitionKey.operationId&&row.definitionKey.memberKey===packet.definitionKey.memberKey);
    if(!definition)throw new BoundaryFailure('installed-definition',packet.definitionKey);
    const selected={...emptySlots(),capability_grants:{requiredCapabilityRefs:[...definition.capabilityRefs],grants:[]},...supplied};
    const data={kind:'admission_capability_data',schemaVersion:version,
      definition:{definitionKey:definition.definitionKey,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,
        owner:{ref:packet.owner.authorityRef,digest:packet.owner.authorityDigest}},
      ownerArtifact:{request:native.request,verified},request,
      resourceScope:{resourcesDigest:hash(resources),authoritySlots:product.admissionAuthoritySlots(selected)},
      boundEnvironment:packet.metadata.workspaceBindingRequirement==='forbidden'?null:product.admissionEnvironmentSelection(state.closeHandoff.prefix,selected.workspace_binding)};
    const authorityValue={actorRef,authorityMode:'trusted_developer'}, authorityRef='authority://abi5-tests/sandbox-uat/'+config.runId;
    const approvalValue={decision:'allow',actorRef,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,
      requestDigest:hash(request),scopeDigest:product.admissionAuthorityScope(data).digest};
    const authority={kind:'resolved_admission_authority',schemaVersion:version,actorRef,authorityMode:'trusted_developer',
      authority:{...coordinate(authorityRef,authorityValue),value:authorityValue},
      approval:{...coordinate(authorityRef+'/approval/'+state.calls.length,approvalValue),value:approvalValue}};
    const grants=await Promise.all(definition.capabilityRefs.map(cap=>product.constructCapabilityGrant(authority,actorRef,
      packet.definitionKey.operationId,cap,{kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data})));
    return api.constructInstalledPublicDefinitionCall({product,installedPublic:api,definitionContractCoordinates:verified.definitionContractCoordinates,
      contractCatalog,...packet.definitionKey,request,slots:{...selected,capability_grants:{requiredCapabilityRefs:[...definition.capabilityRefs],
        grants:grants.map(grant=>({ref:grant.grantRef,digest:grant.grantDigest}))}},
      resources:{...resources,admissionAuthority:{basis:data,authority,grants}},requestRef:'request://abi5-tests/sandbox-uat/'+config.runId+'/'+state.calls.length,
      correlationRef:'correlation://abi5-tests/sandbox-uat/'+config.runId,eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(root,'run.json')).href]});
  }
  async function invoke(label,call,{runtimeRoot=config.bootstrapRoot,environment=config.setupEnvironment,expectResult=true}={}) {
    const resources=call.resources.eventResource;
    const acquisition=!resources?{kind:'eventless'}:resources.kind==='new_abg_event_resource'?{kind:'new',eventLogPath:resources.eventLogPath}
      :{kind:'reopen',closeHandoff:resources.closeHandoff};
    const request={kind:'abg_cli_transport_request',schemaVersion:version,acquisition,invocation:call};
    const requestPath=join(root,'calls',label+'.request.jsonl');
    await record('calls/'+label+'.request.jsonl',JSON.stringify(request)+'\n',true);
    const execution=await command(label,config.nodePath,[join(runtimeRoot,'build/code/src/public/cli.js'),'--jsonl',requestPath],{cwd:root,environment});
    let outcome;
    try{const lines=execution.stdout.trim().split(/\r?\n/u);if(lines.length!==1)throw new Error('Expected one CLI outcome');outcome=JSON.parse(lines[0]);}
    catch(error){throw new BoundaryFailure(label+'-transport',{...execution,parseError:String(error)});}
    await record('calls/'+label+'.outcome.json',outcome);
    const receipt=outcome.receipt, handoff=receipt?.resources?.eventResource?.closeHandoff;
    if(handoff){state.closeHandoff=handoff;await record('calls/'+label+'.close.json',handoff);}
    state.calls.push({label,exitCode:execution.exitCode,definitionKey:call.invocation.definitionKey,
      outcomeKind:receipt?.ownerOutput?.outcomeKind??outcome.kind,invocationRef:call.invocation.invocationRef});
    requireKind(outcome,'installed_definition_call_transport_result',label+'-transport');
    if(expectResult&&(execution.exitCode!==0||receipt?.ownerOutput?.outcomeKind!=='result'))throw new BoundaryFailure(label,receipt);
    return {call,outcome,receipt,execution};
  }
  return {root,runtime,native,config,record,command,state,actorRef,actor,contractCatalog,reopen,refresh,boundSlots,authorize,invoke};
}

export async function populateSandbox(caller) {
  const {root,runtime,native,config,record,state,actor,actorRef,authorize,invoke}=caller;
  const {product,abg,gtl,validator}=runtime, hash=product.sha256Canonical;
  const created=await invoke('workspace-create',await authorize(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
    {targetRoot:config.worksiteRoot,createPolicy:'clean',scaffoldPolicy:'none'},
    {kind:'workspace_resource_assertion',schemaVersion:version,targetRoot:config.worksiteRoot,
      targetRootDigest:hash({kind:'workspace_target',targetRoot:config.worksiteRoot})},{actor}));
  const workspaceManifest=JSON.parse(await readFile(created.receipt.resources.manifest.locator,'utf8'));
  await record('workspace-manifest.json',workspaceManifest);
  const fixture=await prepareConsumer({root:join(root,'setup'),product,gtl,verified:native.verified,archivePath:native.request.artifactPath,
    npm:config.toolchains.npm.executable,recursionBound:config.recursionBound,command:caller.command});
  const consumer=await verifyArtifact(runtime,{artifactPath:fixture.artifactPath,manifest:fixture.manifest,expectedArtifactDigest:fixture.basis.artifactDigest},record,'consumer');
  const natives=[native,consumer], verificationRefs=[], packedArtifacts=[], verificationOutputs=[];
  for(let i=0;i<natives.length;i++) {
    const item=natives[i], v=item.verified;
    const packed={kind:'product_verification_artifact_resource',schemaVersion:version,artifactPath:item.request.artifactPath,
      artifact:{ref:v.artifactRef,digest:v.artifactDigest},productContent:{ref:'product-content://abi5-tests/'+v.productContentDigest.slice(7),digest:v.productContentDigest},
      descriptor:item.verification.coordinates.descriptor,contributionManifest:{ref:v.contributionManifestRef,digest:v.contributionManifestDigest},
      manifestDigest:v.manifestDigest,productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion};
    const checked=await invoke('product-verify-'+i,await authorize(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,
      {targetKind:'packed_artifact',artifact:packed.artifact,productContent:packed.productContent,descriptor:packed.descriptor,
        contributionManifest:packed.contributionManifest,declaredDependencies:v.declaredDependencies,
        compatibilityInputs:v.compatibilityRefs.map(compatibilityRef=>({compatibilityRef,subjectRef:packed.productContent.ref}))},
      {kind:'product_verification_resources',schemaVersion:version,targetKind:'packed_artifact',packedArtifact:packed,verifiedArtifact:v}));
    verificationRefs.push({invocation:{ref:checked.call.invocation.invocationRef,digest:checked.call.invocation.invocationDigest},
      outcome:checked.receipt.ownerOutput.value.verifiedArtifact});packedArtifacts.push(packed);verificationOutputs.push(checked.receipt.ownerOutput);
  }
  const resolvedLock=requireKind(product.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion:version,
    memberKey:'resolve',verifiedArtifacts:natives.map(item=>item.verified)}),'resolved_product_lock','lock-construction');
  state.resolvedLock=resolvedLock;
  const lock={ref:resolvedLock.lockId,digest:resolvedLock.lockDigest};
  const resolved=await invoke('product-resolve',await authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
    {requirements:natives.map(({verified:v})=>({productId:v.productId,packageVersion:v.packageVersion,requiredContractRefs:[],requiredCapabilityRefs:[]})),verifiedCandidates:verificationRefs},
    {kind:'product_resolution_resource_assertion',schemaVersion:version,
      verifiedPreimages:natives.map((item,i)=>({verification:verificationRefs[i],verifiedArtifact:item.verified,
        verificationOutput:verificationOutputs[i]})),
      nativeContractClosure:{selectorDispositions:[],occurrences:[],nativeBindings:[]}},{verification_references:verificationRefs}));
  if(hash(resolved.receipt.ownerOutput.value.resolvedLock)!==hash(lock))throw new BoundaryFailure('resolved-lock-identity',resolved.receipt);
  const eventLogPath=join(root,'resources/events/runtime.events.jsonl');await mkdir(dirname(eventLogPath),{recursive:true});
  const installations=[];
  for(let i=0;i<natives.length;i++) {
    const item=natives[i],packed=packedArtifacts[i],eventResource=i===0?{kind:'new_abg_event_resource',schemaVersion:version,eventLogPath,
      locatorDigest:hash({kind:'abg_event_log_locator',eventLogPath:resolve(eventLogPath)})}:caller.reopen();
    const result=await invoke('product-install-'+i,await authorize(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
      {verifiedArtifact:item.verification.coordinates.verifiedArtifact,descriptor:packed.descriptor,contributionManifest:packed.contributionManifest,
        resolvedLock:lock,targetRoot:join(root,'sandbox/installed',i===0?'abg':'test-consumer'),installPolicy:'clean'},
      {kind:'product_install_resource_assertion',schemaVersion:version,eventResource,packedArtifact:packed,verifiedArtifact:item.verified,resolvedLock},
      {dependency_lock:lock,verification_references:[verificationRefs[i]],actor}));
    const artifactTruth=abg.projectExactPrefixArtifactTruth(state.closeHandoff.prefix);
    const admitted=abg.projectAdmittedProductInstallByInvocationRef(artifactTruth,result.call.invocation.invocationRef);
    if(!admitted?.install)throw new BoundaryFailure('installed-event-projection',admitted);
    installations.push(admitted.install);
    await record('installed/'+i+'/product-toolchain-manifest.json',JSON.parse(await readFile(result.receipt.resources.installManifest.ref,'utf8')));
    const installerManifest=result.receipt.resources.installerManifest;
    await record('installed/'+i+'/installer-manifest-reference.json',{installerManifest,prefix:state.closeHandoff.prefix});
    if(installerManifest?.ref!==artifactTruth.projectionRef||installerManifest?.digest!==artifactTruth.projectionDigest)throw new BoundaryFailure('installer-manifest-projection',installerManifest);
    await record('installed/'+i+'/identity.json',{install:admitted.install,receipt:result.receipt});
  }
  caller.installedRoot=installations[0].installedRoot;
  const authorityManifest={workspaceId:workspaceManifest.workspaceRef,canonicalRoot:workspaceManifest.canonicalRoot,
    authorityMode:'trusted_developer',authorizedActorRef:actorRef};
  const workspaceAuthority=product.constructWorkspaceAuthorityBasis({...authorityManifest,
    authorityManifestRef:'authority://abi5-tests/sandbox-uat/'+config.runId+'/workspace',authorityManifestDigest:hash(authorityManifest)});
  caller.workspaceAuthority=workspaceAuthority;
  const roots={toolchainRoot:join(root,'sandbox/installed','abg'),productRoot:installations[1].installedRoot,
    eventLogRoot:dirname(eventLogPath),runtimeStateRoot:join(root,'resources/runtime'),projectionRoot:join(root,'resources/projections'),archiveRoot:join(root,'resources/archives')};
  for(const path of [roots.runtimeStateRoot,roots.projectionRoot,roots.archiveRoot])await mkdir(path,{recursive:true});
  const fields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'};
  const bound=await invoke('workspace-bind',await authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
    {workspaceAuthority:{ref:workspaceAuthority.authorityBasisId,digest:workspaceAuthority.authorityBasisDigest},installedSet:installations.map(product.productInstallCoordinate),
      resolvedLock:lock,declaredRoots:Object.entries(fields).map(([rootKind,field])=>({rootKind,path:roots[field]}))},
    {kind:'product_workspace_binding_resource_assertion',schemaVersion:version,eventResource:caller.reopen(),workspaceAuthority,workspaceManifest,
      admittedInstalls:installations,resolvedLock,declaredRoots:roots},{product_set:installations.map(product.productInstallCoordinate),dependency_lock:lock,actor}));
  state.binding=bound.receipt.ownerOutput.value.binding;caller.refresh();
  const core=native.verified;
  const publications=constructors.map(name=>gtl[name]({...core,productManifestDigest:core.manifestDigest})).concat(fixture.publication);
  const actualCore=publications.slice(0,-1).map(value=>[value.moduleRef,product.modulePublicationSemanticDigest(value)]).sort();
  const manifestCore=core.contributionManifest.publicationBindings.map(value=>[value.moduleRef,value.publicationDigest]).sort();
  if(hash(actualCore)!==hash(manifestCore))throw new BoundaryFailure('candidate-publication-identity',{actualCore,manifestCore});
  const published=await invoke('catalog-admit',await authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
    {workspaceBinding:state.binding,descriptors:packedArtifacts.map(item=>item.descriptor),contributionManifests:packedArtifacts.map(item=>item.contributionManifest),resolvedLock:lock},
    {kind:'catalog_admission_resource_assertion',schemaVersion:version,eventResource:caller.reopen(),workspaceBinding:state.environment.workspaceBinding,
      resolvedLock,verifiedProducts:natives.map(item=>item.verified),admittedInstalls:state.environment.productInstalls,publications},
    {...caller.boundSlots(),dependency_lock:lock}));
  caller.refresh();
  const installedProducts=state.environment.productInstalls.map(install=>abg.projectAdmittedProductInstallByAdmissionEventRef(state.environment.artifactTruth,install.admissionEventRef).candidate);
  state.catalog=requireKind(product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:version,memberKey:'admit',
    readinessBasis:{workspaceBinding:state.environment.workspaceBindingCandidate,resolvedLock,verifiedProducts:natives.map(item=>item.verified),installedProducts,publications}}),'graph_function_catalog','catalog-projection');
  if(published.receipt.ownerOutput.value.catalog.digest!==state.catalog.basisDigest)throw new BoundaryFailure('catalog-public-projection',published.receipt);
  const selectedProgram=fixture.publication.programs[0],allowlist=[...selectedProgram.callableMembership].sort();
  await invoke('catalog-view',await authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
    {catalog:published.receipt.ownerOutput.value.catalog,allowlist},{kind:'catalog_view_resource_assertion',schemaVersion:version,catalog:state.catalog},
    {...caller.boundSlots(),dependency_lock:lock}));
  state.catalogView=requireKind(product.narrowGraphFunctionCatalog(state.catalog,allowlist),'graph_function_catalog_view','catalog-view-projection');
  const conformanceLaw={ref:'law://abiogenesis/validator/gtl-program@5',digest:hash({ref:'law://abiogenesis/validator/gtl-program@5'})};
  const conformance=await invoke('program-conformance',await authorize(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
    {program:{ref:selectedProgram.programRef,digest:hash(selectedProgram)},conformanceLaw,
      inventoryBasis:{kind:'declared_inventory',inventory:state.catalog.boundPublications.map(value=>({ref:value.moduleRef,digest:hash(value)})).sort((a,b)=>a.ref.localeCompare(b.ref))}},
    {kind:'conformance_evaluation_resource_assertion',schemaVersion:version,
      packet:{kind:'conformance_evaluate_packet',schemaVersion:version,memberKey:'gtl_program',publication:fixture.publication,program:selectedProgram},
      conformanceLaw,declaredInventory:state.catalog.boundPublications,declarationCatalog:{catalog:state.catalog,catalogView:state.catalogView}},
    {...caller.boundSlots(),dependency_lock:lock}));
  if(conformance.receipt.ownerOutput.value.disposition!=='passed')throw new BoundaryFailure('program-conformance',conformance.receipt);
  await record('setup-identity.json',{installations,resolvedLock,workspaceAuthority,workspaceBinding:state.binding,
    catalog:{basisDigest:state.catalog.basisDigest},catalogView:state.catalogView,program:selectedProgram,fixture:fixture.basis,
    closeHandoff:state.closeHandoff,classification:'Prepared installed generic path; no application UAT pass or provider dispatch'});
  return {fixture,publications,installations,workspaceAuthority};
}

export async function constructLifecycleCall(caller,input) {
  const {runtime,state,native,actorRef}=caller,{product,abg,api}=runtime,hash=product.sha256Canonical;
  const environment=caller.refresh(),admittedInstalls=environment.productInstalls,workspaceBinding=environment.workspaceBinding;
  const resolution=requireKind(await product.ProductExecutionResolutionPort.resolve({catalog:state.catalog,catalogView:state.catalogView,admittedInstalls,
    verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(environment.artifactTruth,install),programRef:IDS.programRef,
    selection:{kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'}}),'loaded_product_execution_resolution','default-library-resolution');
  if(!product.admitInstalledProductInput(resolution.productSemantics,resolution.resolution.inputContract.contractRef,input))throw new BoundaryFailure('lifecycle-input-admission',input.kind);
  const fixedPacket=product.RUN_OPERATION_CONTRACTS.invoke.start;
  const regimes=new Set(resolution.programValidation.executableLeafRows.map(row=>row.fibre));
  const policy=product.constructRootInvocationPolicy(workspaceBinding,resolution.program,[],['F_D','F_P','F_H'].filter(regime=>regimes.has(regime)),[]);
  const grants=[product.constructCapabilityGrant(policy,actorRef,fixedPacket.definitionKey.operationId,product.DIRECT_INVOKE_CAPABILITY,{admittedInstalls,workspaceBinding,fixedPacket})];
  const authority=product.constructInvocationAuthority(actorRef,workspaceBinding,state.catalogView,IDS.programRef,resolution.selectedCatalogEntry,policy,grants,{admittedInstalls,workspaceBinding,fixedPacket});
  const boundInput={contract:{ref:resolution.resolution.inputContract.contractRef,digest:resolution.resolution.inputContractDigest},
    valueRef:'value://abi5-tests/sandbox-uat/'+caller.config.runId+'/input',valueDigest:hash(input),value:input};
  const program={ref:resolution.resolution.programRef,digest:resolution.resolution.programDigest},
    view={ref:'graph-function-catalog-view://abiogenesis/'+state.catalogView.viewDigest.slice(7),digest:state.catalogView.viewDigest};
  const eventResource=caller.reopen(),steering=hash(eventResource),lock={ref:state.resolvedLock.lockId,digest:state.resolvedLock.lockDigest};
  const request={program,scope:'program',target:{kind:'next'},until:'converged',catalogView:view,allowlist:[...state.catalogView.allowlist],
    input:boundInput,fhMode:'direct',rootMode:'direct',sourceBasis:{kind:'none'}};
  const slots={...emptySlots(),workspace_binding:state.binding,product_set:admittedInstalls.map(product.productInstallCoordinate),dependency_lock:lock,
    catalog_scope:{catalog:{ref:'graph-function-catalog://abiogenesis/'+state.catalog.basisDigest.slice(7),digest:state.catalog.basisDigest},view,allowlist:request.allowlist},
    execution_program:program,input_contract:boundInput,session_policy:{ref:policy.policyRef,digest:policy.policyDigest},
    capability_grants:{requiredCapabilityRefs:[...fixedPacket.metadata.capabilityRefs],grants:grants.map(grant=>({ref:grant.grantRef,digest:grant.grantDigest}))},
    actor:{actor:{ref:actorRef,digest:hash({actorRef})},attribution:{ref:authority.authorityRef,digest:authority.authorityDigest}},
    transport_steering:{ref:'transport-steering://abiogenesis/'+steering.slice(7),digest:steering}};
  const declaration=state.catalog.boundPublications.find(value=>value.moduleRef===IDS.moduleRef)?.runEnvironments[0];
  if(!declaration)throw new BoundaryFailure('default-library-environment','missing declaration');
  const supportRoot=join(workspaceBinding.roots.archiveRoot,'run-environment-support');
  await mkdir(supportRoot,{recursive:true});
  const temporaryRoot=await realpath(supportRoot);
  const dependencyRoot=await realpath(join(caller.installedRoot,'contracts/default-library/stdo'));
  const dependencies=declaration.dependencies.map(dependency=>({dependencyRef:dependency.dependencyRef,root:dependencyRoot,recordPath:join(dependencyRoot,'context.inventory.json')}));
  const coordinates={dependencies,pythonPath:null,temporaryRoot};
  const runEnvironmentResources=product.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:version,...coordinates,
    permission:{authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,actorRef,programRef:IDS.programRef,
      environmentRef:declaration.declarationRef,environmentDigest:hash(declaration),operations:['read_context'],...coordinates}});
  const contractCatalog=native.verified.definitionContractCoordinates.operations.find(value=>value.operationId===fixedPacket.definitionKey.operationId).members.find(value=>value.memberKey==='start').slots.request.contractCatalog;
  const call=api.constructInstalledPublicDefinitionCall({product,installedPublic:api,definitionContractCoordinates:native.verified.definitionContractCoordinates,contractCatalog,
    ...fixedPacket.definitionKey,request,slots,resources:{kind:'run_invocation_resource_assertion',schemaVersion:version,eventResource,
      catalog:state.catalog,catalogView:state.catalogView,applications:[],source:{kind:'none'},runEnvironmentResources},
    requestRef:'request://abi5-tests/sandbox-uat/'+caller.config.runId+'/start',correlationRef:'correlation://abi5-tests/sandbox-uat/'+caller.config.runId,
    eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(caller.root,'run.json')).href]});
  return {call,resolution};
}
