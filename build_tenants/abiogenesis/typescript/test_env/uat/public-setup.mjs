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
export const emptyAuthoritySlots=()=>Object.fromEntries(['workspace_binding','product_set','dependency_lock','catalog_scope',
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

export function corePublications(gtl,verified) {
  return constructors.map(name=>gtl[name]({...verified,productManifestDigest:verified.manifestDigest}));
}

/** Fixture authority is explicit input; the installed owner validates every grant. */
export async function authorizeInstalledOperation({runtime,native,actorRef,packet,request,resources,
  supplied={},prefix=null,resource=null,requestRef,correlationRef,authorityRef,provenanceRefs=[]}) {
  const {product,api}=runtime,hash=product.sha256Canonical,verified=native.verified;
  const definition=api.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(row=>
    row.definitionKey.operationId===packet.definitionKey.operationId&&row.definitionKey.memberKey===packet.definitionKey.memberKey);
  if(!definition)throw new BoundaryFailure('installed-definition',packet.definitionKey);
  const slots={...emptyAuthoritySlots(),...supplied};
  const data=product.constructAdmissionCapabilityData({fixedPacket:packet,ownerArtifact:{request:native.request,verified},request,resources,
    authoritySlots:slots,boundEnvironment:packet.metadata.workspaceBindingRequirement==='forbidden'?null:
      product.admissionEnvironmentSelection(prefix,slots.workspace_binding)});
  const coordinate=(ref,value)=>({ref,digest:hash(value)});
  const authorityValue={actorRef,authorityMode:'trusted_developer'};
  const approvalValue={decision:'allow',actorRef,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,
    requestDigest:hash(request),scopeDigest:product.admissionAuthorityScope(data).digest};
  const authority={kind:'resolved_admission_authority',schemaVersion:version,actorRef,authorityMode:'trusted_developer',
    authority:{...coordinate(authorityRef,authorityValue),value:authorityValue},
    approval:{...coordinate(requestRef+'/approval',approvalValue),value:approvalValue}};
  const admitted=await product.constructAdmissionCapabilityGrants(authority,actorRef,
    {kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data},resource);
  const operation=verified.definitionContractCoordinates.operations.find(row=>row.operationId===packet.definitionKey.operationId);
  const member=operation?.members.find(row=>row.memberKey===packet.definitionKey.memberKey);
  if(!member)throw new BoundaryFailure('installed-definition-contract',packet.definitionKey);
  slots.capability_grants={requiredCapabilityRefs:[...definition.capabilityRefs],
    grants:admitted.grants.map(grant=>({ref:grant.grantRef,digest:grant.grantDigest}))};
  return api.constructInstalledPublicDefinitionCall({product,installedPublic:api,
    definitionContractCoordinates:verified.definitionContractCoordinates,contractCatalog:member.slots.request.contractCatalog,
    ...packet.definitionKey,request,slots,resources:{...resources,admissionAuthority:{basis:admitted.data,authority,grants:admitted.grants}},
    requestRef,correlationRef,eventTime:new Date().toISOString(),provenanceRefs});
}

/** The transport acquisition named by the call's own event resource. */
export function transportAcquisition(call) {
  const resource=call.resources.eventResource;
  return !resource?{kind:'eventless'}:resource.kind==='new_abg_event_resource'?{kind:'new',eventLogPath:resource.eventLogPath}
    :{kind:'reopen',closeHandoff:resource.closeHandoff};
}

/** CLI framing is a single JSON line; canonical encoding preserves the owner's value. */
export function cliTransportJsonl(product,call,acquisition) {
  return product.canonicalJson({kind:'abg_cli_transport_request',schemaVersion:version,acquisition,invocation:call})+'\n';
}

// Installation runs npm in the ambient process environment and the event
// resource lock namespace follows TMPDIR: serial setup runs under the
// configured values, and the ambient values return in finally.
const SETUP_ENVIRONMENT_KEYS=['PATH','TMPDIR'];
async function withSetupEnvironment(environment,body) {
  if(environment===null||typeof environment!=='object')throw new BoundaryFailure('setup-environment','Explicit setup environment required');
  const ambient=SETUP_ENVIRONMENT_KEYS.map(key=>[key,process.env[key]]);
  const assign=([key,value])=>{if(value===undefined)delete process.env[key];else process.env[key]=value;};
  try {
    for(const key of SETUP_ENVIRONMENT_KEYS)assign([key,environment[key]]);
    return await body();
  }finally {ambient.forEach(assign);}
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

export function publicCaller({root,runtime,native,command,record,config,actorRef:selectedActorRef}) {
  const {product,abg,api}=runtime, hash=product.sha256Canonical;
  const state={closeHandoff:null,resource:null,selection:null,binding:null,environment:null,resolvedLock:null,catalog:null,catalogView:null,programBinding:null,calls:[]};
  const actorRef=selectedActorRef??'actor://abi5-tests/sandbox-uat/'+config.runId;
  const coordinate=(ref,value={ref})=>({ref,digest:hash(value)});
  const actor={actor:coordinate(actorRef),attribution:coordinate(actorRef+'/test-owner')};
  const verified=native.verified, contractCatalog={productId:verified.productId,productContentDigest:verified.productContentDigest,
    catalogId:verified.catalogId,catalogVersion:version,catalogDigest:verified.catalogDigest};
  const reopen=()=>({kind:'reopen_abg_event_resource',schemaVersion:version,closeHandoff:state.closeHandoff,handoffDigest:hash(state.closeHandoff)});
  // While setup holds its one acquired resource, the borrowed selection is the
  // current prefix; after the final close, the close handoff is.
  const prefix=()=>state.selection?.prefix??state.closeHandoff?.prefix??null;
  /** One outer acquisition for the setup interval; each call borrows its selection. */
  const acquire=(assertion)=>{
    if(state.resource!==null)throw new BoundaryFailure('setup-acquisition','Setup already holds its event resource');
    const resource=requireKind(abg.acquireAbgEventResource(assertion),'acquired_abg_event_resource','setup-acquisition').resource;
    state.resource=resource;state.selection=abg.selectAcquiredAbgEventResource(resource,resource.entryPrefix);
    return state.selection;
  };
  /** The final close publishes the handoff that later genuine cold entries reopen. */
  const close=(finalPrefix=state.selection.prefix)=>{
    const receipt=abg.closeAbgEventResource(state.resource,finalPrefix);
    state.resource=null;state.selection=null;state.closeHandoff=receipt.closeHandoff;
    return receipt;
  };
  // The held selection's prefix is owner-bound; after the final close the
  // close handoff names the boundary that genuine cold entries reopen.
  const refresh=()=>{
    const truth=requireKind(abg.projectOwnedPrefixArtifactTruth(prefix()),'exact_prefix_artifact_truth_projection','workspace-prefix-projection');
    if(!abg.validateExactPrefixArtifactTruthProjection(truth,{requireCurrent:true}))throw new BoundaryFailure('workspace-prefix-projection','Authenticated read source is not current');
    state.environment=requireKind(abg.projectWorkspaceEnvironmentFromArtifactTruth(truth,state.binding),
      'exact_prefix_workspace_environment','workspace-prefix-projection');
    return state.environment;
  };
  const boundSlots=()=>({workspace_binding:state.binding,product_set:state.environment.productInstalls.map(product.productInstallCoordinate),
    dependency_lock:{ref:state.resolvedLock.lockId,digest:state.resolvedLock.lockDigest},actor});
  async function authorize(packet,request,resources,supplied={}) {
    // Grants bind the borrowed operation resource at the current prefix.
    const resource=state.selection===null?null:
      requireKind(abg.acquireAbgEventResource(state.selection),'acquired_abg_event_resource','borrow-current-resource').resource;
    return authorizeInstalledOperation({runtime,native,actorRef,packet,request,resources,supplied,
      prefix:prefix(),resource,requestRef:'request://abi5-tests/sandbox-uat/'+config.runId+'/'+state.calls.length,
      correlationRef:'correlation://abi5-tests/sandbox-uat/'+config.runId,
      authorityRef:'authority://abi5-tests/sandbox-uat/'+config.runId,provenanceRefs:[pathToFileURL(join(root,'run.json')).href]});
  }
  /** The installed SDK transport receives the actual constructed call in this
   * module instance; records are compact evidence, never re-ingested. Calls
   * carrying the held selection or a bound environment run on the borrowed
   * resource; forbidden-binding calls without an event resource stay eventless. */
  async function invoke(label,call,{expectResult=true}={}) {
    const invocation=call.invocation,resources=call.resources,selection=state.selection;
    const borrowed=selection!==null&&(resources.eventResource!==undefined||resources.admissionAuthority?.basis?.boundEnvironment!=null);
    const acquisitionKind=borrowed?'borrowed':transportAcquisition(call).kind;
    await record('calls/'+label+'.request.json',{kind:'installed_setup_call_coordinates',label,acquisitionKind,
      definitionKey:invocation.definitionKey,invocationRef:invocation.invocationRef,invocationDigest:invocation.invocationDigest,
      requestDigest:hash(invocation.request),resourceKind:resources.kind,resourcesDigest:hash(resources),
      eventResource:resources.eventResource?{kind:resources.eventResource.kind,digest:hash(resources.eventResource)}:null,
      entryPrefix:borrowed?selection.prefix:null});
    const started=new Date().toISOString(),startedMs=performance.now();
    const outcome=borrowed?await api.runInstalledDefinitionCallWithResource(selection,call)
      :await api.runInstalledDefinitionCallTransport(transportAcquisition(call),call);
    const wallMs=performance.now()-startedMs;
    await record('calls/'+label+'.outcome.json',outcome);
    const receipt=outcome.receipt, completion=borrowed?receipt?.resources?.eventResource:undefined;
    if(borrowed)state.selection=completion?requireKind(completion,'abg_event_resource_completion',label+'-completion').successor
      :abg.selectAcquiredAbgEventResource(state.resource,abg.selectHeldEventStoreDurablePrefix(state.resource.store));
    state.calls.push({label,exitCode:receipt?.exitCode??null,definitionKey:invocation.definitionKey,
      outcomeKind:receipt?.ownerOutput?.outcomeKind??outcome.kind,invocationRef:invocation.invocationRef,
      acquisitionKind,prefixDigest:borrowed?hash(state.selection.prefix):null,started,wallMs});
    requireKind(outcome,'installed_definition_call_transport_result',label+'-transport');
    if(expectResult&&(receipt.exitCode!==0||receipt.ownerOutput?.outcomeKind!=='result'))throw new BoundaryFailure(label,receipt);
    return {call,outcome,receipt};
  }
  return {root,runtime,native,config,record,command,state,actorRef,actor,contractCatalog,reopen,prefix,acquire,close,refresh,boundSlots,authorize,invoke};
}

/** `retain` keeps the one outer acquisition held past setup for the caller's
 * session (§10.9 R-G); the session owner closes it once. `program` selects the
 * one setup Program binding (HS3): the ordinary `consumer` default, or the
 * existing `library` Program for the fixed Testing/UAT route. */
export async function populateSandbox(caller,{retain=false,program='consumer'}={}) {
  if(!Object.hasOwn(SETUP_PROGRAMS,program))throw new BoundaryFailure('setup-program',{program});
  return withSetupEnvironment(caller.config.setupEnvironment,()=>populateInstalledSetup(caller,retain,program));
}

// The setup Program and its publication, chosen among the candidate
// publications before workspace binding.
const SETUP_PROGRAMS={consumer:()=>IDS.programRef,library:product=>product.governanceRef('program','default')};
function setupProgram(product,publications,selection) {
  const programRef=SETUP_PROGRAMS[selection](product);
  const holders=publications.filter(value=>value.programs?.some(program=>program.programRef===programRef));
  const programs=holders.flatMap(value=>value.programs.filter(program=>program.programRef===programRef));
  if(holders.length!==1||programs.length!==1)throw new BoundaryFailure('setup-program',{selection,programRef,publications:holders.map(value=>value.moduleRef)});
  return {selection,programRef,publication:holders[0],program:programs[0]};
}
/** The unique admitted install owning that publication: its Product and
 * artifact identity, and one contribution binding of its semantic digest. */
function setupProgramOwner(product,installations,{selection,programRef,publication}) {
  const digest=product.modulePublicationSemanticDigest(publication);
  const owners=installations.filter(install=>install.productId===publication.owningProductId&&
    install.artifactDigest===publication.artifactDigest&&install.productContentDigest===publication.productContentDigest&&
    install.manifestDigest===publication.productManifestDigest&&
    install.contributionManifest.publicationBindings.filter(row=>row.moduleRef===publication.moduleRef&&row.publicationDigest===digest).length===1);
  if(owners.length!==1)throw new BoundaryFailure('setup-program-owner',{selection,programRef,moduleRef:publication.moduleRef,
    owningProductId:publication.owningProductId,owners:owners.map(install=>install.installId)});
  return owners[0];
}

async function populateInstalledSetup(caller,retain,selection) {
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
  const core=native.verified;
  const publications=corePublications(gtl,core).concat(fixture.publication);
  const actualCore=publications.slice(0,-1).map(value=>[value.moduleRef,product.modulePublicationSemanticDigest(value)]).sort();
  const manifestCore=core.contributionManifest.publicationBindings.map(value=>[value.moduleRef,value.publicationDigest]).sort();
  if(hash(actualCore)!==hash(manifestCore))throw new BoundaryFailure('candidate-publication-identity',{actualCore,manifestCore});
  const chosen=setupProgram(product,publications,selection);
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
  // Setup acquires the new event resource once at the first install, borrows
  // its current selection for each history-dependent call and closes it once,
  // unless the session retains it. Only this acquisition is this setup's to close.
  let acquired=false,completed=false;
  try {
    for(let i=0;i<natives.length;i++) {
      const item=natives[i],packed=packedArtifacts[i],eventResource=i===0?caller.acquire({kind:'new_abg_event_resource',schemaVersion:version,eventLogPath,
        locatorDigest:hash({kind:'abg_event_log_locator',eventLogPath:resolve(eventLogPath)})}):state.selection;
      acquired=true;
      const result=await invoke('product-install-'+i,await authorize(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
        {verifiedArtifact:item.verification.coordinates.verifiedArtifact,descriptor:packed.descriptor,contributionManifest:packed.contributionManifest,
          resolvedLock:lock,targetRoot:join(root,'sandbox/installed',i===0?'abg':'test-consumer'),installPolicy:'clean'},
        {kind:'product_install_resource_assertion',schemaVersion:version,eventResource,packedArtifact:packed,verifiedArtifact:item.verified,resolvedLock},
        {dependency_lock:lock,verification_references:[verificationRefs[i]],actor}));
      const artifactTruth=abg.projectOwnedPrefixArtifactTruth(caller.prefix());
      const admitted=abg.projectAdmittedProductInstallByInvocationRef(artifactTruth,result.call.invocation.invocationRef);
      if(!admitted?.install)throw new BoundaryFailure('installed-event-projection',admitted);
      installations.push(admitted.install);
      await record('installed/'+i+'/product-toolchain-manifest.json',JSON.parse(await readFile(result.receipt.resources.installManifest.ref,'utf8')));
      const installerManifest=result.receipt.resources.installerManifest;
      await record('installed/'+i+'/installer-manifest-reference.json',{installerManifest,prefix:caller.prefix()});
      if(installerManifest?.ref!==artifactTruth.projectionRef||installerManifest?.digest!==artifactTruth.projectionDigest)throw new BoundaryFailure('installer-manifest-projection',installerManifest);
      await record('installed/'+i+'/identity.json',{install:admitted.install,receipt:result.receipt});
    }
    caller.installedRoot=installations[0].installedRoot;
    const owner=setupProgramOwner(product,installations,chosen);
    const authorityManifest={workspaceId:workspaceManifest.workspaceRef,canonicalRoot:workspaceManifest.canonicalRoot,
      authorityMode:'trusted_developer',authorizedActorRef:actorRef};
    const workspaceAuthority=product.constructWorkspaceAuthorityBasis({...authorityManifest,
      authorityManifestRef:'authority://abi5-tests/sandbox-uat/'+config.runId+'/workspace',authorityManifestDigest:hash(authorityManifest)});
    caller.workspaceAuthority=workspaceAuthority;
    // productRoot is the chosen Program owner's root (SINGLE_START §3).
    const roots={toolchainRoot:join(root,'sandbox/installed','abg'),productRoot:owner.installedRoot,
      eventLogRoot:dirname(eventLogPath),runtimeStateRoot:join(root,'resources/runtime'),projectionRoot:join(root,'resources/projections'),archiveRoot:join(root,'resources/archives')};
    for(const path of [roots.runtimeStateRoot,roots.projectionRoot,roots.archiveRoot])await mkdir(path,{recursive:true});
    const fields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'};
    const bound=await invoke('workspace-bind',await authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
      {workspaceAuthority:{ref:workspaceAuthority.authorityBasisId,digest:workspaceAuthority.authorityBasisDigest},installedSet:installations.map(product.productInstallCoordinate),
        resolvedLock:lock,declaredRoots:Object.entries(fields).map(([rootKind,field])=>({rootKind,path:roots[field]}))},
      {kind:'product_workspace_binding_resource_assertion',schemaVersion:version,eventResource:state.selection,workspaceAuthority,workspaceManifest,
        admittedInstalls:installations,resolvedLock,declaredRoots:roots},{product_set:installations.map(product.productInstallCoordinate),dependency_lock:lock,actor}));
    state.binding=bound.receipt.ownerOutput.value.binding;caller.refresh();
    const published=await invoke('catalog-admit',await authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
      {workspaceBinding:state.binding,descriptors:packedArtifacts.map(item=>item.descriptor),contributionManifests:packedArtifacts.map(item=>item.contributionManifest),resolvedLock:lock},
      {kind:'catalog_admission_resource_assertion',schemaVersion:version,eventResource:state.selection,workspaceBinding:state.environment.workspaceBinding,
        resolvedLock,verifiedProducts:natives.map(item=>item.verified),admittedInstalls:state.environment.productInstalls,publications},
      {...caller.boundSlots(),dependency_lock:lock}));
    caller.refresh();
    const installedProducts=state.environment.productInstalls.map(install=>abg.projectAdmittedProductInstallByAdmissionEventRef(state.environment.artifactTruth,install.admissionEventRef).candidate);
    state.catalog=requireKind(product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:version,memberKey:'admit',
      readinessBasis:{workspaceBinding:state.environment.workspaceBindingCandidate,resolvedLock,verifiedProducts:natives.map(item=>item.verified),installedProducts,publications}}),'graph_function_catalog','catalog-projection');
    if(published.receipt.ownerOutput.value.catalog.digest!==state.catalog.basisDigest)throw new BoundaryFailure('catalog-public-projection',published.receipt);
    // The admitted Catalog binds the chosen publication in canonical form: the
    // same module, semantic digest, owner and artifact.
    const publicationDigest=product.modulePublicationSemanticDigest(chosen.publication);
    const catalogPublications=state.catalog.boundPublications.filter(value=>value.moduleRef===chosen.publication.moduleRef&&
      value.owningProductId===chosen.publication.owningProductId&&value.artifactDigest===chosen.publication.artifactDigest&&
      product.modulePublicationSemanticDigest(value)===publicationDigest);
    const catalogPrograms=catalogPublications.flatMap(value=>value.programs.filter(program=>program.programRef===chosen.programRef));
    if(catalogPublications.length!==1||catalogPrograms.length!==1)
      throw new BoundaryFailure('setup-program-catalog',{selection,programRef:chosen.programRef,moduleRef:chosen.publication.moduleRef,publicationDigest});
    const selectedProgram=chosen.program,allowlist=[...selectedProgram.callableMembership].sort();
    await invoke('catalog-view',await authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      {catalog:published.receipt.ownerOutput.value.catalog,allowlist},{kind:'catalog_view_resource_assertion',schemaVersion:version,catalog:state.catalog},
      {...caller.boundSlots(),dependency_lock:lock}));
    state.catalogView=requireKind(product.narrowGraphFunctionCatalog(state.catalog,allowlist),'graph_function_catalog_view','catalog-view-projection');
    const conformanceLaw={ref:'law://abiogenesis/validator/gtl-program@5',digest:hash({ref:'law://abiogenesis/validator/gtl-program@5'})};
    const conformance=await invoke('program-conformance',await authorize(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
      {program:{ref:selectedProgram.programRef,digest:hash(selectedProgram)},conformanceLaw,
        inventoryBasis:{kind:'declared_inventory',inventory:state.catalog.boundPublications.map(value=>({ref:value.moduleRef,digest:hash(value)})).sort((a,b)=>a.ref.localeCompare(b.ref))}},
      {kind:'conformance_evaluation_resource_assertion',schemaVersion:version,
        packet:{kind:'conformance_evaluate_packet',schemaVersion:version,memberKey:'gtl_program',publication:chosen.publication,program:selectedProgram},
        conformanceLaw,declaredInventory:state.catalog.boundPublications,declarationCatalog:{catalog:state.catalog,catalogView:state.catalogView}},
      {...caller.boundSlots(),dependency_lock:lock}));
    if(conformance.receipt.ownerOutput.value.disposition!=='passed')throw new BoundaryFailure('program-conformance',conformance.receipt);
    // The one setup binding every later call selector checks; no call rebinds it.
    state.programBinding=Object.freeze({selection,programRef:chosen.programRef,catalogProgramDigest:hash(catalogPrograms[0]),
      moduleRef:chosen.publication.moduleRef,publicationSemanticDigest:publicationDigest,owner:{productId:owner.productId,installId:owner.installId,
        admissionEventRef:owner.admissionEventRef,installedRoot:owner.installedRoot},productRoot:state.environment.workspaceBinding.roots.productRoot});
    if(retain)await record('setup-retained.json',{kind:'held_setup_selection',prefix:state.selection.prefix});
    else await record('setup-close.json',caller.close());
    await record('setup-identity.json',{installations,resolvedLock,workspaceAuthority,workspaceBinding:state.binding,
      catalog:{basisDigest:state.catalog.basisDigest},catalogView:state.catalogView,program:selectedProgram,programBinding:state.programBinding,fixture:fixture.basis,
      closeHandoff:state.closeHandoff,heldPrefix:state.selection?.prefix??null,classification:'Prepared installed generic path; no application UAT pass or provider dispatch'});
    completed=true;
    return {fixture,publications,installations,workspaceAuthority,programBinding:state.programBinding};
  }finally {
    // Failure cleanup retains completed owner effects: close this setup's
    // acquisition at the held durable prefix, or release the outer lock when
    // that close refuses. A refused repeat setup holds and closes nothing.
    const resource=state.resource;
    if(acquired&&!completed&&resource!==null) {
      try{await record('setup-close.json',caller.close(abg.selectHeldEventStoreDurablePrefix(resource.store)));}
      catch(error){abg.abandonAbgEventResource(resource);state.resource=null;state.selection=null;throw error;}
    }
  }
}

/** One consumer-Program run.invoke population over the caller's current
 * environment: explicit selection, input and source intent; refs and refusal
 * stages name the caller's use. */
async function constructConsumerRunCall(caller,{selection,input,source,refs,stages,program:selected=consumerProgram}) {
  const {runtime,state,native,actorRef,config}=caller,{product,abg,api}=runtime,hash=product.sha256Canonical;
  // The setup Program binding is checked before any population, task or grant.
  const {programRef,declaration,catalogView}=selected(caller);
  if(!declaration)throw new BoundaryFailure('default-library-environment','missing declaration');
  const environment=caller.refresh(),admittedInstalls=environment.productInstalls,workspaceBinding=environment.workspaceBinding;
  const namespace='abi5-tests/sandbox-uat/'+config.runId;
  // The shipped run owner populates request, slots, policy, grants and
  // authority; the scenario input and run-environment support stay explicit.
  const constructed=await api.constructInstalledStartCall({
    selection,
    programRef,catalog:state.catalog,catalogView,applications:[],admittedInstalls,workspaceBinding,
    verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(environment.artifactTruth,install),actorRef,
    input:{value:input},inputValueRef:'value://'+namespace+'/'+(refs.input??refs.request+'/input'),source,
    async runEnvironmentResources({authority}) {
      const supportRoot=join(workspaceBinding.roots.archiveRoot,'run-environment-support');
      await mkdir(supportRoot,{recursive:true});
      const temporaryRoot=await realpath(supportRoot);
      const dependencyRoot=await realpath(join(caller.installedRoot,'contracts/default-library/stdo'));
      const dependencies=declaration.dependencies.map(dependency=>({dependencyRef:dependency.dependencyRef,root:dependencyRoot,recordPath:join(dependencyRoot,'context.inventory.json')}));
      const coordinates={dependencies,pythonPath:null,temporaryRoot};
      return product.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:version,...coordinates,
        permission:{authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,actorRef,programRef,
          environmentRef:declaration.declarationRef,environmentDigest:hash(declaration),operations:['read_context'],...coordinates}});
    },
    // The held session's current selection; a reopen only after its close.
    eventResource:state.selection??caller.reopen(),
    envelope:{definitionContractCoordinates:native.verified.definitionContractCoordinates,requestRef:'request://'+namespace+'/'+refs.request,
      correlationRef:'correlation://'+namespace,eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(caller.root,'run.json')).href]}});
  if(constructed.kind!=='installed_start_call')throw new BoundaryFailure(
    constructed.ownerOutput?.value?.code==='invalid_input'?stages.input:stages.population,constructed.ownerOutput??constructed);
  return {call:constructed.call,resolution:constructed.population.resolution};
}
/** The consumer Program hosts the lifecycle start over the setup Catalog view.
 * An absent setup binding is the ordinary consumer default; a binding to
 * another Program refuses. */
function consumerProgram(caller) {
  const {state}=caller,bound=state.programBinding??null;
  if(bound!==null&&bound.programRef!==IDS.programRef)throw new BoundaryFailure('setup-program-binding',{expected:IDS.programRef,bound:bound.programRef});
  return {programRef:IDS.programRef,catalogView:state.catalogView,
    declaration:state.catalog.boundPublications.find(value=>value.moduleRef===IDS.moduleRef)?.runEnvironments[0]};
}
/** The existing library Program hosts its own wrapper rows (F2-PROGRAM-001):
 * its declared run environment and the setup Catalog view of its callable
 * membership. Both fixed calls require the one setup `library` binding (HS3). */
function libraryProgram(caller) {
  const {state,runtime:{product}}=caller,programRef=product.governanceRef('program','default'),bound=state.programBinding??null;
  if(bound?.selection!=='library'||bound.programRef!==programRef)throw new BoundaryFailure('setup-program-binding',{expected:programRef,bound:bound?.programRef??null});
  const publication=state.catalog.boundPublications.find(value=>value.programs?.some(program=>program.programRef===programRef));
  const program=publication?.programs.find(value=>value.programRef===programRef);
  if(!program)throw new BoundaryFailure('fixed-program','missing library Program');
  if(product.sha256Canonical(program)!==bound.catalogProgramDigest)throw new BoundaryFailure('setup-program-binding',{expected:bound.catalogProgramDigest,catalog:product.sha256Canonical(program)});
  const declaration=publication.runEnvironments.find(value=>value.declarationRef===program.policies['abg.run_environment']);
  return {programRef,declaration,catalogView:requireKind(state.catalogView,'graph_function_catalog_view','fixed-catalog-view')};
}
export async function constructLifecycleCall(caller,input) {
  return constructConsumerRunCall(caller,{selection:{memberKey:'start',target:{kind:'next'},rootMode:'direct',fhMode:'direct'},
    input,source:{kind:'none'},refs:{request:'start',input:'input'},stages:{input:'lifecycle-input-admission',population:'lifecycle-start-population'}});
}
// RC7 fixed proof route: direct Testing, then UAT over that Run's exact
// admitted Testing state Result. No selector, latest-Result or history search.
const fixedWrapper=(caller,purpose)=>caller.runtime.product.governanceRef('graph-function',purpose);
/** Direct invoke of the Testing wrapper over the fixed input, source none. */
export async function constructFixedTestingCall(caller,input) {
  return constructConsumerRunCall(caller,{selection:{memberKey:'invoke',catalogHandle:fixedWrapper(caller,'testing')},program:libraryProgram,
    input,source:{kind:'none'},refs:{request:'fixed-testing'},stages:{input:'fixed-testing-input-admission',population:'fixed-testing-population'}});
}
/** The completed direct Testing Run's own terminal state Result, derived by the
 * ABG owner at that Run's close handoff, as the UAT input and admitted source. */
export function deriveFixedTestingSource(caller,{call,receipt}) {
  const {product,abg}=caller.runtime,testing=fixedWrapper(caller,'testing');
  const value=receipt?.ownerOutput?.outcomeKind==='result'?receipt.ownerOutput.value:null,producer=value?.terminalResult?.producer;
  // A held call's completion successor, or a cold call's close handoff.
  const eventResource=receipt?.resources?.eventResource,admissionRef=receipt?.resources?.invocationAdmission?.ref;
  const boundary=eventResource?.kind==='abg_event_resource_completion'?eventResource.successor?.prefix:eventResource?.closeHandoff?.prefix;
  if(value?.disposition!=='completed'||!value.result||producer?.graphFunction?.ref!==testing||producer.runRef!==value.run?.ref||
    producer.invocationAdmissionRef!==admissionRef||!boundary)throw new BoundaryFailure('fixed-testing-result',receipt?.ownerOutput??receipt??null);
  const prefix=abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(boundary));
  const admission=abg.rehydrateInvocationAdmissionAtPrefix(prefix,admissionRef);
  if(!admission||admission.graphFunctionRef!==testing)throw new BoundaryFailure('fixed-testing-admission',{invocationAdmissionRef:admissionRef});
  const basis=abg.deriveInvocationSourceResultBasisAtPrefix(prefix,{publicAuthorityDigest:call.invocation.invocationDigest,
    runtimeInvocationRef:admission.invocationRef,invocationAdmissionRef:admission.invocationAdmissionRef,runId:value.run.ref,resultRef:value.result.ref});
  if(!basis||basis.sourceGraphFunctionRef!==testing||basis.sourceRunId!==value.run.ref)throw new BoundaryFailure('fixed-testing-source',basis??null);
  const input=product.retainedGovernanceWorkInput(basis.sourceResultValue);
  if(!input)throw new BoundaryFailure('fixed-testing-state',basis.sourceResultValue);
  return {input,source:{kind:'admitted_source_result',basis,projectionAuthority:{ref:call.invocation.invocationRef,digest:basis.publicAuthorityDigest}}};
}
/** Direct invoke of the UAT wrapper over exactly that derived input and source. */
export async function constructFixedUatCall(caller,{input,source}) {
  return constructConsumerRunCall(caller,{selection:{memberKey:'invoke',catalogHandle:fixedWrapper(caller,'uat')},program:libraryProgram,
    input,source,refs:{request:'fixed-uat'},stages:{input:'fixed-uat-input-admission',population:'fixed-uat-population'}});
}
/** Direct invoke of another library wrapper over the same input and source:
 * the admission discriminator for the fixed route, never a fulfillment path. */
export async function constructFixedWrapperCall(caller,purpose,{input,source}) {
  return constructConsumerRunCall(caller,{selection:{memberKey:'invoke',catalogHandle:fixedWrapper(caller,purpose)},program:libraryProgram,
    input,source,refs:{request:'fixed-'+purpose+'-'+caller.state.calls.length},stages:{input:'fixed-'+purpose+'-input-admission',population:'fixed-'+purpose+'-population'}});
}
