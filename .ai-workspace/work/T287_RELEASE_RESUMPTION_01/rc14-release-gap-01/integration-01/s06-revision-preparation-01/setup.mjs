// External Public operation composition derived from frozen public-setup.mjs.
// No admission predicates, event writes, traversal or semantic selection are implemented here.
import {mkdir,readFile,realpath} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {prepareConsumer} from './consumer.mjs';
import {closedSource,pinnedJson} from './revision-source.mjs';
const version='5.0.0';
export async function populateS06(caller,options) {
  const keys=['PATH','TMPDIR'],ambient=keys.map(key=>[key,process.env[key]]);
  const assign=([key,value])=>{if(value===undefined)delete process.env[key];else process.env[key]=value;};
  try{for(const key of keys)assign([key,caller.config.setupEnvironment[key]]);return await populateInstalledSetup(caller,options);}
  finally{ambient.forEach(assign);}
}
async function populateInstalledSetup(caller,{D,P,nativeDeclarations,tenant,packageRoot}) {
  const retain=true,selection="s06";
  const {verifyArtifact,corePublications,requireKind,BoundaryFailure}=P;
  const {root,runtime,native,config,record,state,actor,actorRef,authorize,invoke}=caller;
  const {product,abg,gtl,validator}=runtime, hash=product.sha256Canonical;
  const prior=await pinnedJson(closedSource.identity),closed=await pinnedJson(closedSource.closeReceipt);
  const workspaceManifest=await pinnedJson(closedSource.workspaceManifest);
  if(actorRef!==closedSource.actorRef||config.worksiteRoot!==closedSource.workspaceRoot)throw new BoundaryFailure('original-workspace-authority','Exact old authority/actor required');
  state.closeHandoff=closed.closeHandoff;state.binding=prior.workspaceBinding;state.resolvedLock=prior.resolvedLock;
  await record('retained-workspace-manifest.json',workspaceManifest);
  const fixture=await prepareConsumer({root:join(root,'setup'),product,gtl,verified:native.verified,archivePath:native.request.artifactPath,
    npm:config.toolchains.npm.executable,recursionBound:config.recursionBound,command:caller.command,D,P,nativeDeclarations,tenant,packageRoot});
  const consumer=await verifyArtifact(runtime,{artifactPath:fixture.artifactPath,manifest:fixture.manifest,expectedArtifactDigest:fixture.basis.artifactDigest},record,'consumer');
  const core=native.verified;
  const publications=corePublications(gtl,core).concat(fixture.publications);
  const actualCore=publications.slice(0,-fixture.publications.length).map(value=>[value.moduleRef,product.modulePublicationSemanticDigest(value)]).sort();
  const manifestCore=core.contributionManifest.publicationBindings.map(value=>[value.moduleRef,value.publicationDigest]).sort();
  if(hash(actualCore)!==hash(manifestCore))throw new BoundaryFailure('candidate-publication-identity',{actualCore,manifestCore});
  const programRef=fixture.programRefs.intake;
  const holders=publications.filter(value=>value.programs.some(program=>program.programRef===programRef));
  if(holders.length!==1)throw new BoundaryFailure('s06-program-owner',{programRef});
  const programs=holders[0].programs.filter(program=>program.programRef===programRef);
  if(programs.length!==1)throw new BoundaryFailure('s06-program',{programRef});
  const chosen={selection,programRef,publication:holders[0],program:programs[0]};
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
  const eventLogPath=closedSource.eventLog.path;
  const installations=[];
  // Setup acquires the new event resource once at the first install, borrows
  // its current selection for each history-dependent call and closes it once,
  // unless the session retains it. Only this acquisition is this setup's to close.
  let acquired=false,completed=false;
  try {
    for(let i=0;i<natives.length;i++) {
      const item=natives[i],packed=packedArtifacts[i],eventResource=i===0?caller.acquire(caller.reopen()):state.selection;
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
    const semanticDigest=product.modulePublicationSemanticDigest(chosen.publication);
    const owners=installations.filter(install=>install.productId===chosen.publication.owningProductId&&install.artifactDigest===chosen.publication.artifactDigest&&install.productContentDigest===chosen.publication.productContentDigest&&install.manifestDigest===chosen.publication.productManifestDigest&&install.contributionManifest.publicationBindings.filter(row=>row.moduleRef===chosen.publication.moduleRef&&row.publicationDigest===semanticDigest).length===1);
    if(owners.length!==1)throw new BoundaryFailure('s06-program-owner',{programRef,owners:owners.map(row=>row.installId)});
    const owner=owners[0];
    const workspaceAuthority=prior.workspaceAuthority;
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
    const selectedProgram=chosen.program,allowlist=[...new Set(fixture.publications.flatMap(p=>p.programs.flatMap(g=>g.callableMembership)))].sort();
    await invoke('catalog-view',await authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      {catalog:published.receipt.ownerOutput.value.catalog,allowlist},{kind:'catalog_view_resource_assertion',schemaVersion:version,catalog:state.catalog},
      {...caller.boundSlots(),dependency_lock:lock}));
    state.catalogView=requireKind(product.narrowGraphFunctionCatalog(state.catalog,allowlist),'graph_function_catalog_view','catalog-view-projection');
    for(const [phase,ref] of Object.entries(fixture.programRefs)) {
      const selectedPublication=fixture.publications.find(p=>p.programs.some(q=>q.programRef===ref));
      const selectedProgram=selectedPublication.programs.find(q=>q.programRef===ref);
    const conformanceLaw={ref:'law://abiogenesis/validator/gtl-program@5',digest:hash({ref:'law://abiogenesis/validator/gtl-program@5'})};
    const conformance=await invoke('program-conformance-'+phase,await authorize(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
      {program:{ref:selectedProgram.programRef,digest:hash(selectedProgram)},conformanceLaw,
        inventoryBasis:{kind:'declared_inventory',inventory:state.catalog.boundPublications.map(value=>({ref:value.moduleRef,digest:hash(value)})).sort((a,b)=>a.ref.localeCompare(b.ref))}},
      {kind:'conformance_evaluation_resource_assertion',schemaVersion:version,
        packet:{kind:'conformance_evaluate_packet',schemaVersion:version,memberKey:'gtl_program',publication:selectedPublication,program:selectedProgram},
        conformanceLaw,declaredInventory:state.catalog.boundPublications,declarationCatalog:{catalog:state.catalog,catalogView:state.catalogView}},
      {...caller.boundSlots(),dependency_lock:lock}));
    if(conformance.receipt.ownerOutput.value.disposition!=='passed')throw new BoundaryFailure('program-conformance',conformance.receipt);
    }
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

export async function constructPhaseCall(caller,input,P,fixture,phase) {
  if(!["intake","revision","d2"].includes(phase))throw new Error("Declared phase required");
  const {BoundaryFailure}=P;
  const selection={memberKey:"start",target:{kind:"next"},rootMode:"direct",fhMode:"direct"},source={kind:"none"},refs={request:phase+'-start',input:phase+'-input'},stages={input:"s06-input",population:"s06-start"};
  const {runtime,state,native,actorRef,config}=caller,{product,abg,api}=runtime,hash=product.sha256Canonical;
  // The setup Program binding is checked before any population, task or grant.
  const bound=state.programBinding;
  if(bound?.selection!=='s06')throw new BoundaryFailure('s06-program-binding',bound);
  const selectedRef=fixture.programRefs[phase];
  const holders=state.catalog.boundPublications.filter(row=>row.programs.some(p=>p.programRef===selectedRef));
  if(holders.length!==1)throw new BoundaryFailure("phase-program-owner",selectedRef);
  const publication=holders[0],program=publication.programs.find(p=>p.programRef===selectedRef);
  if(publication.owningProductId!==fixture.ids.productId||!program)throw new BoundaryFailure("phase-program-binding",selectedRef);
  const programRef=program.programRef,catalogView=state.catalogView,declaration=publication.runEnvironments?.find(row=>row.declarationRef===program.policies['abg.run_environment']);
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
    ...(declaration===undefined?{}:{async runEnvironmentResources({authority}) {
      const supportRoot=join(workspaceBinding.roots.archiveRoot,'run-environment-support');
      await mkdir(supportRoot,{recursive:true});
      const temporaryRoot=await realpath(supportRoot);
      const dependencyRoot=await realpath(join(caller.installedRoot,'contracts/default-library/stdo'));
      const dependencies=declaration.dependencies.map(dependency=>fixture.contextResources.find(r=>r.dependencyRef===dependency.dependencyRef)??{dependencyRef:dependency.dependencyRef,root:dependencyRoot,recordPath:join(dependencyRoot,'context.inventory.json')});
      const coordinates={dependencies,pythonPath:null,temporaryRoot};
      return product.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:version,...coordinates,
        permission:{authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,actorRef,programRef,
          environmentRef:declaration.declarationRef,environmentDigest:hash(declaration),operations:['read_context'],...coordinates}});
    }}),
    // The held session's current selection; a reopen only after its close.
    eventResource:state.selection??caller.reopen(),
    envelope:{definitionContractCoordinates:native.verified.definitionContractCoordinates,requestRef:'request://'+namespace+'/'+refs.request,
      correlationRef:'correlation://'+namespace,eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(caller.root,'run.json')).href]}});
  if(constructed.kind!=='installed_start_call')throw new BoundaryFailure(
    constructed.ownerOutput?.value?.code==='invalid_input'?stages.input:stages.population,constructed.ownerOutput??constructed);
  return {call:constructed.call,resolution:constructed.population.resolution};
}
