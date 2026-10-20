import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {access,lstat,mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {dirname,isAbsolute,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {authorizeInstalledOperation,BoundaryFailure,cliTransportJsonl,corePublications,
  emptyAuthoritySlots,installedModules,publicCaller,requireKind} from './public-setup.mjs';
import {freshReadbacks} from './runner.mjs';

const version='5.0.0';
const bindingCoordinate=binding=>({ref:binding.bindingId,digest:binding.bindingDigest});
const lockCoordinate=lock=>({ref:lock.lockId,digest:lock.lockDigest});

async function selectedValue(selection) {
  if(!selection||typeof selection.path!=='string')return selection;
  const facts=await lstat(selection.path);
  assert(facts.isFile()&&!facts.isSymbolicLink(),'Selected fixture input must be a regular file');
  const bytes=await readFile(selection.path);
  assert.equal(bytes.length,selection.byteCount,'Selected fixture input length changed');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),selection.sha256,'Selected fixture input digest changed');
  return JSON.parse(bytes.toString('utf8'));
}

async function physicalPreflight(resource) {
  const material=await selectedValue(resource.physical),quiet=await selectedValue(resource.quiescence);
  if(material)for(const row of material.physicalRows) {
    const path=resolve(material.workspaceRoot,row.relativePath);
    assert(path.startsWith(resolve(material.workspaceRoot)+'/'),'Physical selection leaves the worksite');
    if(row.state==='absent')await assert.rejects(access(path),error=>error.code==='ENOENT');
    else {
      const facts=await lstat(path);assert(facts.isFile()&&!facts.isSymbolicLink());
      const bytes=await readFile(path);
      assert.equal(bytes.length,row.byteCount);assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256);
      assert.equal(facts.dev,row.device);assert.equal(facts.ino,row.inode);
    }
  }
  if(quiet) {
    await assert.rejects(access(quiet.selectedLockPath),error=>error.code==='ENOENT');
    for(const {pid} of quiet.ownedPids) {
      assert.throws(()=>process.kill(pid,0),error=>error.code==='ESRCH','Previously owned process still exists');
      assert.throws(()=>process.kill(-pid,0),error=>error.code==='ESRCH','Previously owned process group still exists');
    }
  }
  const handoff=await selectedValue(resource.closeHandoff),facts=await stat(fileURLToPath(handoff.prefix.eventLogRef),{bigint:true});
  assert.equal(facts.dev.toString(),String(handoff.prefix.storeIdentity.device));
  assert.equal(facts.ino.toString(),String(handoff.prefix.storeIdentity.inode));
  assert.equal(facts.size.toString(),String(handoff.prefix.prefixLength));
  if(resource.mtimeNs!==undefined)assert.equal(facts.mtimeNs.toString(),String(resource.mtimeNs));
  return {handoff,material,stat:{path:fileURLToPath(handoff.prefix.eventLogRef),device:facts.dev.toString(),
    inode:facts.ino.toString(),byteCount:facts.size.toString(),mtimeNs:facts.mtimeNs.toString()},lockAbsent:quiet!==undefined&&quiet!==null};
}

function verificationRequest(item) {
  const v=item.verified,productContent={ref:'product-content://abi5-tests/'+v.productContentDigest.slice(7),digest:v.productContentDigest};
  return {targetKind:'packed_artifact',artifact:{ref:v.artifactRef,digest:v.artifactDigest},productContent,
    descriptor:item.verification.coordinates.descriptor,contributionManifest:{ref:v.contributionManifestRef,digest:v.contributionManifestDigest},
    declaredDependencies:v.declaredDependencies,
    compatibilityInputs:v.compatibilityRefs.map(compatibilityRef=>({compatibilityRef,subjectRef:productContent.ref}))};
}

function packedResource(item,request) {
  const v=item.verified;assert(isAbsolute(item.request.artifactPath));
  return {kind:'product_verification_artifact_resource',schemaVersion:version,artifactPath:item.request.artifactPath,
    artifact:request.artifact,productContent:request.productContent,descriptor:request.descriptor,
    contributionManifest:request.contributionManifest,manifestDigest:v.manifestDigest,
    productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion};
}

/**
 * Fixture-owned instance data selects inputs; installed owners retain authority.
 * An instance supplies root/installedRoot/artifacts, source selectors and expected
 * identities, resource preimages, current consumer publication/Program, actor and
 * unchanged launch configuration. No original history is acquired on import.
 * This prepares a call, never dispatches run.invoke or a worker.
 */
export async function prepareInstalledContinuation(instance) {
  const {root}=instance;assert(isAbsolute(root));assert(isAbsolute(instance.installedRoot));
  const started=performance.now();let stage='preflight',resource=null,runtime=null,selection=null,serial=0,close=null;
  const record=instance.record??(async(name,value,raw=false)=>{
    const path=join(root,name);assert(path.startsWith(root+'/'));await mkdir(dirname(path),{recursive:true});
    await writeFile(path,raw?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  });
  const checkpoint=async(name,fields={})=>{
    stage=name;const value={stage:name,elapsedMs:performance.now()-started,at:new Date().toISOString(),...process.memoryUsage(),...fields};
    await record('stages/'+String(serial++).padStart(3,'0')+'-'+name+'.json',value);
    if(instance.checkpoint)await instance.checkpoint(value);
  };
  const callbackCheckpoint=(name,fields)=>{
    stage=name;instance.callbackCheckpoint?.({stage:name,elapsedMs:performance.now()-started,
      at:new Date().toISOString(),...process.memoryUsage(),...fields});
  };
  const calls=[];
  try {
    await mkdir(root,{recursive:true});
    for(const pin of instance.pins??[])await selectedValue(pin);
    const physical=await physicalPreflight(instance.resource);
    await record('physical-preflight.json',physical);
    runtime=await installedModules(instance.installedRoot);
    const {product:p,abg:a,api,gtl:g,invocationTruth:truth}=runtime,hash=p.sha256Canonical;
    const actorRef=instance.actorRef,namespace=instance.namespace;
    assert.equal(typeof actorRef,'string');assert.equal(typeof namespace,'string');
    const coordinate=(ref,value={ref})=>({ref,digest:hash(value)});
    const actor={actor:coordinate(actorRef,{actorRef}),attribution:coordinate(actorRef+'/test-owner')};
    const items=[];
    for(const artifact of instance.artifacts) {
      const expected=await selectedValue(artifact.acquisition);
      await checkpoint(artifact.label+'-verify-start',{beforeAcquisition:true});
      const verification=await p.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion:version,
        memberKey:'verify',targetKind:'packed_artifact',request:expected.request});
      requireKind(verification,'product_verification_success',artifact.label+'-verification');
      assert.deepEqual(verification,expected.verification,'Actual artifact verification differs from its selected immutable acquisition');
      const verified=verification.verifiedArtifact;
      assert.strictEqual(p.selectOwnedProductVerification(expected.request,verified),verified,'Live owner verification receipt is required');
      items.push({...expected,verification,verified});
      await checkpoint(artifact.label+'-verify-complete',{beforeAcquisition:true,contentDigest:verified.productContentDigest});
    }
    assert.equal(items.length,2,'The UAT fixture selects its native and consumer pair');
    const [native,consumer]=items,verificationRequests=items.map(verificationRequest),packed=items.map((item,i)=>packedResource(item,verificationRequests[i]));
    await checkpoint('fixed-resolution-start',{beforeAcquisition:true});
    const lock=requireKind(p.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion:version,
      memberKey:'resolve',verifiedArtifacts:items.map(item=>item.verified)}),'resolved_product_lock','fixed-product-resolution');
    assert.deepEqual(lockCoordinate(lock),instance.current.lock);
    await checkpoint('fixed-resolution-complete',{beforeAcquisition:true,lock:lockCoordinate(lock)});

    const refreshSelection=()=>a.selectAcquiredAbgEventResource(resource,a.selectHeldEventStoreDurablePrefix(resource.store));
    const eventsAt=()=>a.readRuntimeEventsAtDurablePrefix(selection.prefix,{requireCurrent:true});
    const prefixAt=()=>a.selectValidatedRuntimeEventPrefix(eventsAt());
    const artifactTruth=()=>requireKind(a.projectOwnedPrefixArtifactTruth(selection.prefix),'exact_prefix_artifact_truth_projection','owned-prefix');
    async function invoke(label,packet,request,resources,supplied={}) {
      await checkpoint(label+'-grant-start',{beforeAcquisition:resource===null});
      let operationResource=null;
      if(resource!==null) {
        operationResource=requireKind(a.acquireAbgEventResource(selection),'acquired_abg_event_resource','borrow-current-resource').resource;
        assert.strictEqual(operationResource.store,resource.store,'Foreign operation owner cannot borrow the enclosing resource');
        assert.deepEqual(operationResource.entryPrefix,selection.prefix);
      }
      const call=await authorizeInstalledOperation({runtime,native,actorRef,packet,request,resources,supplied,
        prefix:selection?.prefix??null,resource:operationResource,requestRef:namespace+'/'+label,
        correlationRef:namespace,authorityRef:namespace+'/authority',provenanceRefs:instance.provenanceRefs??[]});
      await record('calls/'+label+'.request-projection.json',{invocation:call.invocation,
        resourcesDigest:hash(call.resources),resourceKind:resources.kind,entryPrefix:selection?.prefix??null});
      await checkpoint(label+'-transport-start',{beforeAcquisition:resource===null});
      const outcome=resource!==null&&(Object.hasOwn(resources,'eventResource')||packet.metadata.workspaceBindingRequirement!=='forbidden')?
        await api.runInstalledDefinitionCallWithResource(selection,call):await api.runInstalledDefinitionCallTransport({kind:'eventless'},call);
      await record('calls/'+label+'.outcome.json',outcome);
      requireKind(outcome,'installed_definition_call_transport_result',label+'-transport');
      if(outcome.receipt.ownerOutput?.outcomeKind!=='result')throw new BoundaryFailure(label,outcome.receipt.ownerOutput);
      if(resource!==null) {
        const completion=outcome.receipt.resources?.eventResource;
        selection=completion?requireKind(completion,'abg_event_resource_completion',label+'-completion').successor:refreshSelection();
      }
      calls.push({label,invocationRef:call.invocation.invocationRef,invocationDigest:call.invocation.invocationDigest,
        outcomeKind:outcome.receipt.ownerOutput.outcomeKind});
      await checkpoint(label+'-complete',{beforeAcquisition:resource===null,prefixLength:selection?.prefix.prefixLength??null});
      return {call,outcome,receipt:outcome.receipt};
    }

    // Both definitions explicitly forbid WorkspaceBinding and have no history
    // dependency. Retain their complete owner outputs for installation.
    const verificationRefs=[],verificationOutputs=[];
    for(let i=0;i<items.length;i++) {
      const checked=await invoke('product-verify-'+i,p.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,verificationRequests[i],
        {kind:'product_verification_resources',schemaVersion:version,targetKind:'packed_artifact',packedArtifact:packed[i],verifiedArtifact:items[i].verified});
      assert.equal(checked.receipt.ownerOutput.value.disposition,'locally_verified');
      assert.deepEqual(checked.receipt.ownerOutput.value.verifiedArtifact,items[i].verification.coordinates.verifiedArtifact);
      verificationRefs.push({invocation:{ref:checked.call.invocation.invocationRef,digest:checked.call.invocation.invocationDigest},
        outcome:checked.receipt.ownerOutput.value.verifiedArtifact});verificationOutputs.push(checked.receipt.ownerOutput);
    }
    const resolved=await invoke('product-resolve',p.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
      {requirements:items.map(({verified:v})=>({productId:v.productId,packageVersion:v.packageVersion,requiredContractRefs:[],requiredCapabilityRefs:[]})),verifiedCandidates:verificationRefs},
      {kind:'product_resolution_resource_assertion',schemaVersion:version,
        verifiedPreimages:items.map((item,i)=>({verification:verificationRefs[i],verifiedArtifact:item.verified,verificationOutput:verificationOutputs[i]})),
        nativeContractClosure:{selectorDispositions:[],occurrences:[],nativeBindings:[]}},{verification_references:verificationRefs});
    assert.deepEqual(resolved.receipt.ownerOutput.value.resolvedLock,lockCoordinate(lock));

    await checkpoint('acquisition-start',{prefixLength:physical.handoff.prefix.prefixLength});
    resource=requireKind(a.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:version,
      closeHandoff:physical.handoff,handoffDigest:hash(physical.handoff)}),'acquired_abg_event_resource','source-acquisition').resource;
    selection=refreshSelection();await checkpoint('acquisition-complete',{eventCount:eventsAt().length,prefix:selection.prefix});
    const sourceTransport=await selectedValue(instance.source.call);
    const sourceCall=sourceTransport.kind==='abg_cli_transport_request'?sourceTransport.invocation:sourceTransport;
    const setup=await selectedValue(instance.source.setup);
    const expected=instance.source.expected;
    assert.equal(sourceCall.invocation.invocationDigest,instance.source.publicAuthorityDigest);
    await checkpoint('source-invocation-admission-start',{invocationAdmissionRef:instance.source.invocationAdmissionRef});
    const sourceAdmission=a.rehydrateInvocationAdmissionAtPrefix(prefixAt(),instance.source.invocationAdmissionRef);
    if(!sourceAdmission)throw new BoundaryFailure('source-invocation-admission',null);
    assert.equal(sourceAdmission.actorRef,actorRef);assert.equal(setup.workspaceAuthority.authorizedActorRef,actorRef);
    const derive=()=>a.deriveInvocationSourceResultBasisAtPrefix(prefixAt(),{publicAuthorityDigest:sourceCall.invocation.invocationDigest,
      runtimeInvocationRef:sourceAdmission.invocationRef,invocationAdmissionRef:sourceAdmission.invocationAdmissionRef,
      runId:instance.source.runRef,resultRef:instance.source.resultRef});
    let source=derive();if(!source)throw new BoundaryFailure('source-result-basis',null);
    const input=p.retainedGovernanceWorkInput(source.sourceResultValue);if(!input)throw new BoundaryFailure('source-work-input',null);
    assert.equal(hash(input),expected.inputDigest);assert.equal(hash(input.original),expected.originalDigest);
    assert.equal(input.terminal,false);assert.equal(input.observations.length,expected.observations);
    assert.equal(source.sourceResultAdmissionEventRef,expected.sourceResultAdmissionEventRef);
    assert.equal(source.sourceResultJudgmentEventRef,expected.sourceResultJudgmentEventRef);
    await checkpoint('source-complete',{basisRef:source.basisRef,basisDigest:source.basisDigest,observations:input.observations.length,inputDigest:hash(input)});
    const readPorts=await import(pathToFileURL(join(instance.installedRoot,'build/code/src/abg/project_read_ports.js')).href);
    const revision=await import(pathToFileURL(join(instance.installedRoot,'build/code/src/abg/worksite_revision.js')).href);
    const {deepFreeze}=await import(pathToFileURL(join(instance.installedRoot,'build/code/src/shared/immutable.js')).href);
    const oldDeclaration=deepFreeze({kind:'abg_historical_declaration_proof',schemaVersion:version,
      catalog:sourceCall.resources.catalog,catalogView:sourceCall.resources.catalogView});
    const last=input.observations.at(-1),observed=eventsAt().find(event=>event.kind==='c_call_result_admitted'&&event.payload.resultRef===last.resultRef);
    assert.ok(observed);assert.equal(observed.payload.resultDigest,last.resultDigest);
    const terminal=a.projectClosedGraphCallTerminalAtDurablePrefix(selection.prefix,observed.graphCallId,oldDeclaration);
    if(!terminal)throw new BoundaryFailure('closed-child-source-resource',null);
    const {value:unusedValue,projectionBasis:unusedBasis,...terminalSelection}=terminal;
    const historicalSource=deepFreeze({kind:'abg_historical_graph_call_source_resource',schemaVersion:version,
      terminal:terminalSelection,input:{graphFunctionRef:sourceAdmission.graphFunctionRef,contractRef:sourceAdmission.inputContractRef},declarationProof:oldDeclaration});
    if(!readPorts.projectHistoricalGraphCallSourceAtDurablePrefix(selection.prefix,historicalSource))throw new BoundaryFailure('historical-source-resource',null);

    let selectedBinding=bindingCoordinate(setup.workspaceBinding),environment=null,binding=null;
    assert.equal(selectedBinding.ref,sourceAdmission.workspaceBindingId);assert.equal(selectedBinding.digest,sourceAdmission.workspaceBindingDigest);
    const refresh=()=>{
      environment=requireKind(a.projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth(),selectedBinding),'exact_prefix_workspace_environment','workspace-environment');
      binding=environment.workspaceBinding;assert.deepEqual(bindingCoordinate(binding),selectedBinding);return environment;
    };
    refresh();const oldBinding=binding,oldAuthority=environment.workspaceAuthorityBasis;
    assert.deepEqual(oldAuthority,setup.workspaceAuthority);
    const bound=()=>({workspace_binding:selectedBinding,product_set:environment.productInstalls.map(p.productInstallCoordinate),dependency_lock:lockCoordinate(lock),actor});
    const installs=[];
    for(let i=0;i<items.length;i++) {
      const targetRoot=join(root,i===0?'installed-native':'installed-consumer');
      const admitted=await invoke('product-install-'+i,p.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
        {verifiedArtifact:items[i].verification.coordinates.verifiedArtifact,descriptor:packed[i].descriptor,
          contributionManifest:packed[i].contributionManifest,resolvedLock:lockCoordinate(lock),targetRoot,installPolicy:'clean'},
        {kind:'product_install_resource_assertion',schemaVersion:version,eventResource:selection,packedArtifact:packed[i],verifiedArtifact:items[i].verified,resolvedLock:lock},
        {dependency_lock:lockCoordinate(lock),verification_references:[verificationRefs[i]],actor});
      const actual=a.projectAdmittedProductInstallByInvocationRef(artifactTruth(),admitted.call.invocation.invocationRef);
      assert.ok(actual?.install);assert.deepEqual(actual.resolvedLock,lock);
      assert.deepEqual(p.productInstallCoordinate(actual.install),admitted.receipt.ownerOutput.value.installedProduct);
      for(const field of ['productContentDigest','artifactDigest','manifestDigest'])assert.equal(actual.install[field],items[i].verified[field]);
      installs.push(actual.install);
    }
    const manifest=await selectedValue(instance.current.workspaceManifest);
    assert.equal(manifest.workspaceRef,oldBinding.workspaceId);assert.equal(manifest.canonicalRoot,oldAuthority.canonicalRoot);
    assert.equal(oldAuthority.authorityBasisId,oldBinding.authorityBasisId);assert.equal(oldAuthority.authorityBasisDigest,oldBinding.authorityBasisDigest);
    requireKind(p.constructProductSet(installs,lock),'product_set','current-install-set');
    const roots={...oldBinding.roots,toolchainRoot:join(root,'installed-native'),productRoot:installs[1].installedRoot};
    const fields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'};
    const boundResult=await invoke('workspace-bind',p.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
      {workspaceAuthority:{ref:oldAuthority.authorityBasisId,digest:oldAuthority.authorityBasisDigest},installedSet:installs.map(p.productInstallCoordinate),
        resolvedLock:lockCoordinate(lock),declaredRoots:Object.entries(fields).map(([rootKind,key])=>({rootKind,path:roots[key]}))},
      {kind:'product_workspace_binding_resource_assertion',schemaVersion:version,eventResource:selection,workspaceAuthority:oldAuthority,
        workspaceManifest:manifest,admittedInstalls:installs,resolvedLock:lock,declaredRoots:roots},
      {product_set:installs.map(p.productInstallCoordinate),dependency_lock:lockCoordinate(lock),actor});
    selectedBinding=boundResult.receipt.ownerOutput.value.binding;
    const admittedBinding=a.projectAdmittedWorkspaceBindingByInvocationRef(artifactTruth(),boundResult.call.invocation.invocationRef,lock);
    assert.ok(admittedBinding?.binding);assert.deepEqual(bindingCoordinate(admittedBinding.binding),selectedBinding);
    refresh();assert.deepEqual(binding,admittedBinding.binding);assert.deepEqual(environment.workspaceAuthorityBasis,oldAuthority);
    assert.deepEqual(environment.productInstalls,installs);assert.deepEqual(environment.resolvedProductLock,lock);
    assert.deepEqual(binding.roots,roots);assert.equal(binding.workspaceId,oldBinding.workspaceId);assert.equal(binding.authorizedActorRef,oldBinding.authorizedActorRef);

    const consumerRecord=await selectedValue(instance.current.consumerPublication),consumerPublication=g.modulePublication(consumerRecord.publication);
    for(const [field,verifiedField] of [['artifactDigest','artifactDigest'],['productContentDigest','productContentDigest'],['productManifestDigest','manifestDigest'],['owningProductId','productId']])assert.equal(consumerPublication[field],consumer.verified[verifiedField]);
    const publicationBindings=consumer.verified.contributionManifest.publicationBindings.filter(row=>row.moduleRef===consumerPublication.moduleRef);
    assert.equal(publicationBindings.length,1);assert.equal(p.modulePublicationSemanticDigest(consumerPublication),publicationBindings[0].publicationDigest);
    const publications=corePublications(g,native.verified).concat(consumerPublication);
    const published=await invoke('catalog-admit',p.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
      {workspaceBinding:selectedBinding,descriptors:packed.map(item=>item.descriptor),contributionManifests:packed.map(item=>item.contributionManifest),resolvedLock:lockCoordinate(lock)},
      {kind:'catalog_admission_resource_assertion',schemaVersion:version,eventResource:selection,workspaceBinding:binding,
        resolvedLock:lock,verifiedProducts:items.map(item=>item.verified),admittedInstalls:installs,publications},bound());
    refresh();const installedProducts=installs.map(install=>a.projectAdmittedProductInstallByAdmissionEventRef(environment.artifactTruth,install.admissionEventRef).candidate);
    const catalog=requireKind(p.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:version,memberKey:'admit',
      readinessBasis:{workspaceBinding:environment.workspaceBindingCandidate,resolvedLock:lock,verifiedProducts:items.map(item=>item.verified),installedProducts,publications}}),'graph_function_catalog','current-catalog');
    assert.equal(catalog.basisDigest,published.receipt.ownerOutput.value.catalog.digest);
    await invoke('catalog-view',p.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      {catalog:published.receipt.ownerOutput.value.catalog,allowlist:oldDeclaration.catalogView.allowlist},
      {kind:'catalog_view_resource_assertion',schemaVersion:version,catalog},bound());
    const view=requireKind(p.narrowGraphFunctionCatalog(catalog,oldDeclaration.catalogView.allowlist),'graph_function_catalog_view','current-view');
    const resolution=requireKind(await p.ProductExecutionResolutionPort.resolve({catalog,catalogView:view,admittedInstalls:installs,
      verifyInstallAdmission:install=>a.hasAdmittedProductInstall(environment.artifactTruth,install),programRef:setup.program.ref,
      selection:{kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'}}),'loaded_product_execution_resolution','current-resolution');
    assert.equal(hash(resolution.program),sourceCall.invocation.request.program.digest);assert.equal(hash(resolution.program),instance.current.programDigest);

    const bases=new Map();
    for(const reference of [{resultRef:source.sourceResultRef,resultDigest:source.sourceResultDigest},...input.observations,...(input.synthesis===null?[]:[input.synthesis])]) {
      const admitted=eventsAt().find(event=>event.kind==='c_call_result_admitted'&&event.payload.resultRef===reference.resultRef);
      assert.ok(admitted);assert.equal(admitted.payload.resultDigest,reference.resultDigest);
      let basis=truth.projectExactExecutionBasisAtPrefix(prefixAt(),admitted.basisId);assert.ok(basis);
      while(basis!==null&&!bases.has(basis.basisRef)) {
        bases.set(basis.basisRef,basis);
        basis=basis.parentExecutionBasisRef===null?null:truth.projectExactExecutionBasisAtPrefix(prefixAt(),basis.parentExecutionBasisRef);
      }
    }
    await record('consumed-bases.json',[...bases.values()].map(basis=>({basisRef:basis.basisRef,basisDigest:basis.basisDigest,
      admissionEventRef:basis.admissionEventRef,workspaceBindingId:basis.workspaceBindingId,workspaceBindingDigest:basis.workspaceBindingDigest,parentExecutionBasisRef:basis.parentExecutionBasisRef})));
    for(const basis of bases.values()) {
      const before=revision.projectAdmittedWorkspaceBindingAtCoordinate(prefixAt(),basis.workspaceBindingId,basis.workspaceBindingDigest);assert.ok(before);
      if(!revision.projectWorksiteRevisionBindingCover(prefixAt(),before,binding,[basis])) {
        const subject={ref:basis.basisRef,digest:basis.basisDigest},content=a.WITNESS_CONTENT_CONTRACTS.reprice;
        await invoke('witness-'+serial,a.WITNESS_OPERATION_CONTRACTS.admit.reprice,
          {subjectKind:'authority_basis',subject,act:'reprice',content:{kind:'typed_payload',contentContract:{ref:content.ref,digest:content.digest},
            value:{declarationRef:before.bindingId,beforeDigest:before.bindingDigest,afterDigest:binding.bindingDigest,
              changeClass:'realization_refactor',owningTicketRef:instance.current.ticketRef,reason:instance.current.repriceReason}},
            context:{kind:'basis',basis:subject},evidence:[{ref:before.bindingId,digest:before.bindingDigest},{ref:binding.bindingId,digest:binding.bindingDigest}],provenance:[subject]},
          {kind:'witness_reprice_resource_assertion',schemaVersion:version,eventResource:selection},bound());
      }
      assert.ok(revision.projectWorksiteRevisionBindingCover(prefixAt(),before,binding,[basis]),'Actual target-binding cover refused');
    }
    await checkpoint('covers-complete',{consumedBases:bases.size});
    source=derive();if(!source)throw new BoundaryFailure('source-after-current-effects',null);
    assert.equal(hash(p.retainedGovernanceWorkInput(source.sourceResultValue)),hash(input));
    const currentDeclaration={kind:'abg_historical_declaration_proof',schemaVersion:version,catalog,catalogView:view};
    const comparison={predecessorPrefix:selection.prefix,source,workspaceBinding:binding,program:resolution.program,
      graphFunction:resolution.graphFunction,currentDeclaration,historicalDeclarations:[oldDeclaration]};
    const use=truth.projectGovernanceCoveredSourceUse(prefixAt(),comparison);
    await record('current-source-use.json',use);
    if(!use)throw new BoundaryFailure('current-source-use',null);
    await checkpoint('current-source-use-complete',{useDigest:use.useDigest,sourceBasisRef:source.basisRef});

    const packet=p.RUN_OPERATION_CONTRACTS.invoke.start;
    const regimes=new Set([...resolution.programValidation.executableLeafRows,...resolution.programValidation.interactionLeafRows].map(row=>row.fibre));
    const applications=sourceCall.resources.applications;
    const policy=p.constructRootInvocationPolicy(binding,resolution.program,
      resolution.programValidation.interactionLeafRows.map(row=>({requirementKey:row.requirementKey,requirementKeyDigest:row.requirementKeyDigest,actorCapabilityRef:row.requirement.actorCapabilityRef})),
      ['F_D','F_P','F_H'].filter(fibre=>regimes.has(fibre)),applications);
    const grants=[p.constructCapabilityGrant(policy,actorRef,packet.definitionKey.operationId,p.DIRECT_INVOKE_CAPABILITY,
      {admittedInstalls:installs,workspaceBinding:binding,fixedPacket:packet})];
    const authority=p.constructInvocationAuthority(actorRef,binding,view,setup.program.ref,resolution.selectedCatalogEntry,policy,grants,
      {admittedInstalls:installs,workspaceBinding:binding,fixedPacket:packet});
    const previous=sourceCall.resources.runEnvironmentResources;
    const runEnvironmentResources=p.constructRunEnvironmentResources({...previous,permission:{...previous.permission,
      authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,
      dependencies:previous.dependencies,pythonPath:previous.pythonPath,temporaryRoot:previous.temporaryRoot}});
    const finalPrefix=selection.prefix,finalValidatedPrefix=prefixAt();
    await checkpoint('resource-close-start');
    close=a.closeAbgEventResource(resource,finalPrefix);resource=null;
    await record('final-resource-receipt.json',close);await record('final-close-handoff.json',close.closeHandoff);
    await checkpoint('resource-close-complete',{prefixLength:close.closeHandoff.prefix.prefixLength});
    const eventResource={kind:'reopen_abg_event_resource',schemaVersion:version,closeHandoff:close.closeHandoff,handoffDigest:hash(close.closeHandoff)};
    const program={ref:resolution.resolution.programRef,digest:resolution.resolution.programDigest};
    const viewRef={ref:'graph-function-catalog-view://abiogenesis/'+view.viewDigest.slice(7),digest:view.viewDigest};
    const boundInput={contract:{ref:resolution.resolution.inputContract.contractRef,digest:resolution.resolution.inputContractDigest},
      valueRef:namespace+'/input',valueDigest:hash(input),value:input};
    const request={...sourceCall.invocation.request,catalogView:viewRef,input:boundInput,sourceBasis:{kind:'admitted_source_result',
      projectionAuthority:{ref:sourceCall.invocation.invocationRef,digest:source.publicAuthorityDigest},sourceResult:{ref:source.sourceResultRef,digest:source.sourceResultDigest}}};
    const steering=hash(eventResource);
    const slots={...emptyAuthoritySlots(),workspace_binding:selectedBinding,product_set:installs.map(p.productInstallCoordinate),dependency_lock:lockCoordinate(lock),
      catalog_scope:{catalog:{ref:'graph-function-catalog://abiogenesis/'+catalog.basisDigest.slice(7),digest:catalog.basisDigest},view:viewRef,allowlist:request.allowlist},
      execution_program:program,input_contract:boundInput,session_policy:{ref:policy.policyRef,digest:policy.policyDigest},
      capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(grant=>({ref:grant.grantRef,digest:grant.grantDigest}))},
      actor:{actor:{ref:actorRef,digest:hash({actorRef})},attribution:{ref:authority.authorityRef,digest:authority.authorityDigest}},
      transport_steering:{ref:'transport-steering://abiogenesis/'+steering.slice(7),digest:steering}};
    const resources={catalog,catalogView:view,applications,source:{kind:'admitted_source_result',basis:source},historicalSource,runEnvironmentResources};
    const contract= native.verified.definitionContractCoordinates.operations.find(row=>row.operationId===packet.definitionKey.operationId).members.find(row=>row.memberKey===packet.definitionKey.memberKey);
    const call=api.constructInstalledPublicDefinitionCall({product:p,installedPublic:api,
      definitionContractCoordinates:native.verified.definitionContractCoordinates,contractCatalog:contract.slots.request.contractCatalog,
      ...packet.definitionKey,request,slots,resources:{...resources,kind:'run_invocation_resource_assertion',schemaVersion:version,eventResource},
      requestRef:namespace+'/start',correlationRef:namespace,eventTime:new Date().toISOString(),provenanceRefs:instance.provenanceRefs??[]});
    assert.ok(p.isRunInvocationResourceAssertion(call.resources),'Actual native resource headers refused');
    await checkpoint('private-preparation-start');
    const prepared=await p.ProductRunInvocationPort.prepare({memberKey:'start',invocation:call.invocation,resources,
      admittedInstalls:installs,workspaceBinding:binding,verifyInstallAdmission:install=>a.hasAdmittedProductInstall(environment.artifactTruth,install),
      transportResourceAssertion:eventResource,deriveCurrentSourceUse:(basis,resolved)=>{
        callbackCheckpoint('covered-use-callback-start',{sourceBasisRef:basis.basisRef});
        const actual=truth.projectGovernanceCoveredSourceUse(finalValidatedPrefix,{predecessorPrefix:finalPrefix,source:basis,
          workspaceBinding:binding,program:resolved.program,graphFunction:resolved.graphFunction,currentDeclaration,historicalDeclarations:[oldDeclaration]});
        callbackCheckpoint('covered-use-callback-complete',{returned:actual===null?null:{useDigest:actual.useDigest,sourceBasisRef:actual.sourceBasisRef}});
        return actual;
      }});
    await record('product-preparation-result.json',prepared.kind==='prepared_product_run_invocation'?{
      kind:prepared.kind,rawInputDigest:prepared.rawInput.subjectDigest,sourceBasisRef:prepared.sourceResultBasis.basisRef,
      currentSourceUse:prepared.currentSourceUse,program:prepared.resolution.resolution,runEnvironment:prepared.runEnvironment}:prepared);
    requireKind(prepared,'prepared_product_run_invocation','private-product-preparation');
    const requestPath=join(root,'calls/continuation-start.request.jsonl');
    await record('calls/continuation-start.request.jsonl',cliTransportJsonl(p,call,{kind:'reopen',closeHandoff:close.closeHandoff}),true);
    const launch={executable:instance.configuration.nodePath,args:[join(installs[0].installedRoot,'build/code/src/public/cli.js'),'--jsonl',requestPath],cwd:root};
    const summary={kind:prepared.kind,sourceResultRef:source.sourceResultRef,sourceBasisRef:source.basisRef,
      sourceInputDigest:hash(input),observations:input.observations.length,terminal:input.terminal,workspaceBinding:binding,
      workspaceAuthority:oldAuthority,program,view:viewRef,installedRoot:installs[0].installedRoot,currentUseDigest:use.useDigest,
      consumedBases:bases.size,finalPrefix,launch,operatorControl:instance.controlReference??null,
      limits:{nativeMs:instance.configuration.processTimeoutMs,nativeBytes:instance.configuration.maxProcessOutputBytes},
      qualityClock:'Actual future native CLI command.request.started + 18000000ms; preparation starts no clock'};
    await record('prepared-setup.json',summary);await checkpoint('preparation-complete',{kind:prepared.kind,currentUseDigest:use.useDigest});

    // Existing fresh Public result/replay owner remains the read implementation.
    // Acquire it only after the actual caller supplies a genuine execution receipt.
    const readbacks=async execution=>{
      assert.equal(typeof instance.command,'function','Fresh reads require the ordinary command recorder');
      const caller=publicCaller({root,runtime,native,command:instance.command,record,config:instance.configuration,actorRef});
      caller.installedRoot=installs[0].installedRoot;
      caller.state.closeHandoff=execution.receipt.resources.eventResource.closeHandoff;
      caller.state.binding=selectedBinding;caller.state.resolvedLock=lock;
      caller.state.catalog=catalog;caller.state.catalogView=view;
      return freshReadbacks(caller,execution);
    };
    return {prepared,call,summary,close,launch,requestPath,calls,readbacks};
  } catch(error) {
    await record('first-cause.json',{stage,elapsedMs:performance.now()-started,name:error?.name,message:error?.message,
      stack:error?.stack,observation:error instanceof BoundaryFailure?error.observation:null,
      disposition:'HOLD; retain completed owner effects; Executive root-cause/action before retry'});
    throw error;
  } finally {
    if(resource!==null&&runtime!==null) {
      const finalPrefix=runtime.abg.selectHeldEventStoreDurablePrefix(resource.store);
      try {
        close=runtime.abg.closeAbgEventResource(resource,finalPrefix);resource=null;
        await record('final-resource-receipt.json',close);await record('final-close-handoff.json',close.closeHandoff);
      } catch(error) {
        await record('resource-close-failure.json',{stage,name:error?.name,message:error?.message,stack:error?.stack});
        throw error;
      }
    }
  }
}
