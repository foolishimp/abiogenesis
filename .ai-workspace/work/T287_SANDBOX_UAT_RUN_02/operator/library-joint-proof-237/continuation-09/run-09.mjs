// Preparation only: execution requires Root's exact accepted successor grant.
// Existing Public/setup/continuation owners do all admission and preparation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,stat,readdir} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {fixtureSelection,responderEnvironment,expectedProgramDigest,COMMAND,CANDIDATE} from './workload.mjs';

const root=dirname(fileURLToPath(import.meta.url));
assert(process.argv[2],'Root-selected accepted successor/helper inputs are required');
const selected=JSON.parse(await readFile(resolve(process.argv[2]),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const pin of [...selected.acceptedSubjects,...selected.helperFiles]) {
  const bytes=await readFile(pin.path);assert.equal(bytes.length,pin.byteCount,pin.path);assert.equal(sha(bytes),pin.sha256,pin.path);
  assert.notEqual(pin.sha256,'a8a010a3e620f74a723f3f23aab2d484de09dea70c6789e04ed4e1969546e8b5','Cut11 HOLD remains excluded');
}
for(const name of ['runner.mjs','public-setup.mjs','scenarios.mjs','consumer.mjs','continuation.mjs'])
  assert(selected.helperFiles.some(pin=>pin.path===join(selected.helperRoot,name)),'Unselected helper: '+name);
const [setupOwner,runner,scenarios,consumerOwner,continuation]=await Promise.all(
  ['public-setup.mjs','runner.mjs','scenarios.mjs','consumer.mjs','continuation.mjs'].map(name=>import(pathToFileURL(join(selected.helperRoot,name)).href)));
const {installedModules,verifyArtifact,publicCaller,constructLifecycleCall,requireKind,corePublications,BoundaryFailure}=setupOwner;
const host=JSON.parse(await readFile(selected.publicationHost,'utf8'));
const runtime=await installedModules(host.installedRoot),p=runtime.product,a=runtime.abg,hash=p.sha256Canonical;
const executionRoot=selected.fixtureRoot,outputRoot=join(root,'execution');await mkdir(outputRoot);
const environment={...Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(key=>process.env[key]!==undefined).map(key=>[key,process.env[key]])),npm_config_cache:join(selected.publicationRoot,'npm-cache'),npm_config_offline:'true'};
const configuration={runId:'library-joint-proof-237-09',bootstrapRoot:host.installedRoot,worksiteRoot:join(executionRoot,'worksite'),
  nodePath:process.execPath,setupEnvironment:environment,toolchains:{npm:{executable:selected.npm},node:{executable:process.execPath}},
  recursionBound:1000,processTimeoutMs:300000,maxProcessOutputBytes:16777216};
const recordAt=directory=>async(name,value,raw=false)=>{const path=join(directory,name);assert(path.startsWith(directory+'/'));await mkdir(dirname(path),{recursive:true});await writeFile(path,raw?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});};
const record=recordAt(outputRoot),command=runner.commandRecorder(outputRoot,{environment,timeoutMs:configuration.processTimeoutMs,maxOutputBytes:configuration.maxProcessOutputBytes});
let caller,stage='live-native-verification';
const phaseResults=[];
// Frozen cut30 replay.ts1306–1371 owns this body. Native liveness belongs
// inside it when present; the four identity headers and private derivation do not.
const REPLAY_BODY_FIELDS = [
  'eventStoreDigest','eventCount','lastAdmissionOrdinal','runId','graphCallId','frameId',
  'traversalCursorRef','traversalCursorDigest','traversalCursorEventRef','cCalls','routes',
  'constructionDeltas','fanOutCompletions','continuations','actorProcesses','currentWorksiteObservations',
  'activeFluents','terminalReachedEventRef','frameClosedEventRef','graphCallClosedEventRef','runClosedEventRef',
  'runStoppedEventRef','runStoppedDisposition','invocationRefusalEventRef','runtimeFailureEventRef','runtimeStatus',
];
async function compareCompleteReplay(owner,executed,expectedCount,reads,evidence) {
  // Only this finite fixture's normal closed resource is comparison input.
  // Raw values never replace the helper's Source/currentness/effect authority.
  const prefix=owner.state.closeHandoff.prefix,runId=executed.receipt.resources.run.ref;
  assert(fileURLToPath(prefix.eventLogRef).startsWith(resolve(executionRoot)+'/'),'Comparison is confined to the finite fixture');
  const actual=await installedModules(owner.installedRoot),product=actual.product;
  const [prefixes,replayOwner]=await Promise.all(['event_prefix','replay'].map(name=>
    import(pathToFileURL(join(owner.installedRoot,'build/code/src/abg/'+name+'.js')).href)));
  const rawRows=actual.abg.readRuntimeEventsAtDurablePrefix(structuredClone(prefix),{requireCurrent:true});
  const rawAuthority=prefixes.selectValidatedRuntimeEventPrefix(rawRows);
  const rawRun=prefixes.selectRuntimeEventPrefixFromAuthority(rawAuthority,{runId});
  const full=replayOwner.replayValidatedRuntimeEventPrefix(rawRun,rawAuthority);
  assert.equal(full.kind,'replay_state');assert.equal(full.schemaVersion,'5.0.0');assert.equal(full.runId,runId);
  const livenessPresent=Object.hasOwn(full,'nativeLiveness');
  assert(livenessPresent&&full.nativeLiveness!==null,'A genuine native specimen must exercise nativeLiveness inclusion');
  const body=Object.fromEntries(REPLAY_BODY_FIELDS.map(field=>{
    assert(Object.hasOwn(full,field),'Missing owner-defined replay body field: '+field);return [field,full[field]];
  }));
  if(livenessPresent)body.nativeLiveness=full.nativeLiveness;
  assert.deepEqual(Object.keys(full).sort(),[...REPLAY_BODY_FIELDS,'nativeLiveness','kind','schemaVersion','replayRef','replayDigest'].sort(),'Complete ReplayState has an unreviewed field');
  // Ordinary canonical JSON/hash over the full raw owner result is independent
  // of the new replay streaming writer. No inferred exclusion-list digest.
  const bodyDigest=product.sha256Canonical(body),canonical=product.canonicalJson(full);
  assert.equal(full.replayDigest,bodyDigest);assert.equal(full.replayRef,'replay://abiogenesis/'+bodyDigest.slice(7));
  const authority=prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(prefix);
  const run=prefixes.selectRuntimeEventPrefixFromAuthority(authority,{runId});
  const guard=replayOwner.projectRuntimeReplayGuard(run,authority),parts=[];
  replayOwner.writeRuntimeReplayGuardValue(guard,part=>parts.push(part));
  assert.equal(parts.join(''),canonical,'Streamed complete value differs from raw logical ReplayState');
  assert.equal(guard.replayDigest,bodyDigest);
  let selectedPayloads=0;
  for(const event of rawRows) {
    const selectedEvent=prefixes.runtimeEventAtPrefix(authority,event.eventId);assert(selectedEvent);
    assert.equal(product.canonicalJson(selectedEvent),product.canonicalJson(event),'Selected body differs from raw logical event '+event.eventId);
    assert.equal(product.sha256Canonical(selectedEvent.payload),event.payloadDigest,'Complete payload digest differs '+event.eventId);
    selectedPayloads++;
  }
  const publicReplay=reads.find(read=>read.memberKey==='run_replay');
  assert.equal(publicReplay?.projection?.kind,'run_replay_projection');
  assert.deepEqual(publicReplay.projection.subject,executed.receipt.resources.run);
  assert.deepEqual(publicReplay.source,executed.receipt.resources.run);
  assert.deepEqual(publicReplay.projection.replay,{ref:full.replayRef,digest:bodyDigest});
  assert.deepEqual(publicReplay.ownerOutput.value.projectionBasis,{ref:prefix.eventLogRef,digest:prefix.coordinateDigest});
  assert.equal(prefixes.runtimeEventPrefixDigest(authority),prefixes.runtimeEventPrefixDigest(rawAuthority));
  assert.deepEqual(evidence.source,executed.receipt.resources.run);
  assert.deepEqual(evidence.projection.subject,executed.receipt.resources.run);
  assert.deepEqual(evidence.projection.replay,{ref:full.replayRef,digest:bodyDigest});
  assert.deepEqual(evidence.projectionBasis,{ref:prefix.eventLogRef,digest:prefix.coordinateDigest});
  assert.equal(evidence.projection.kind,'run_evidence_projection');
  assert(Array.isArray(evidence.projection.evidence)&&Array.isArray(evidence.projection.eventAtoms));
  const candidates=full.cCalls.flatMap(row=>{
    const input=product.retainedGovernanceWorkInput(row.resultValue);
    return row.resultClass==='success'&&row.judgment==='advance'&&input?.terminal===false&&input.observations.length===expectedCount?
      [{resultRef:row.resultRef,inputDigest:product.sha256Canonical(input),originalDigest:product.sha256Canonical(input.original),original:input.original,observations:input.observations}]:[];
  });
  assert(candidates.length>0,'Complete actual replay has no judged nonterminal parent with the expected completed work');
  const parent=candidates.at(-1);
  const parentCall=full.cCalls.filter(call=>call.resultRef===parent.resultRef);assert.equal(parentCall.length,1);
  assert.equal(parentCall[0].resultClass,'success');assert.equal(parentCall[0].judgment,'advance');
  const parentRows=rawRows.filter(event=>event.kind==='c_call_result_admitted'&&event.runId===runId&&event.payload.resultRef===parent.resultRef);
  assert.equal(parentRows.length,1);assert.equal(parentRows[0].aggregateId,parentCall[0].cCallRef);
  assert.equal(parentRows[0].payload.resultDigest,parentCall[0].resultDigest);
  assert.deepEqual(parentRows[0].payload.value,parentCall[0].resultValue);
  assert.equal(product.sha256Canonical(product.retainedGovernanceWorkInput(parentCall[0].resultValue)),parent.inputDigest);
  assert(full.actorProcesses.length>0,'Native actor rows must be present in the complete result');
  // Return coordinates/digests/counts only. Complete rows, streamed strings,
  // ReplayState and authority views are not recorded or carried to preparation.
  return {selectedParent:parent,replay:{replayRef:full.replayRef,replayDigest:bodyDigest,canonicalBytes:Buffer.byteLength(canonical),canonicalSha256:sha(canonical),
    nativeLivenessPresent:livenessPresent,nativeLivenessDigest:product.sha256Canonical(full.nativeLiveness),
    eventStoreDigest:full.eventStoreDigest,eventCount:full.eventCount,selectedPayloads,
    collections:Object.fromEntries(['cCalls','routes','constructionDeltas','fanOutCompletions','continuations','actorProcesses','currentWorksiteObservations'].map(field=>[field,full[field].length])),
    parent:{resultRef:parent.resultRef,resultDigest:parentCall[0].resultDigest,cCallRef:parentCall[0].cCallRef,admissionEventRef:parentRows[0].eventId},
    sourceOfComparison:'Actual installed owner; one complete finite raw logical read; full authority scope and selected historical Run scope'}};
}

async function setupChangedPair(caller) {
  const {root,runtime,native,config,record,state,actor,actorRef,authorize,invoke}=caller;
  const {product,abg,gtl,validator}=runtime, hash=product.sha256Canonical;
  const version='5.0.0';
  const workspaceManifest=JSON.parse(await readFile(join(executionRoot,'workspace-manifest.json'),'utf8'));
  await record('workspace-manifest.json',workspaceManifest);
  const fixture=await prepareConsumer({root:join(root,'setup'),product,gtl,verified:native.verified,archivePath:native.request.artifactPath,
    npm:config.toolchains.npm.executable,recursionBound:config.recursionBound,command:caller.command});
  const consumer=await verifyArtifact(runtime,{artifactPath:fixture.artifactPath,manifest:fixture.manifest,expectedArtifactDigest:fixture.basis.artifactDigest},record,'consumer');
  const natives=[native,consumer], verificationRefs=[], packedArtifacts=[], verificationOutputs=[];
  assert.strictEqual(product.selectOwnedProductVerification(consumer.request,consumer.verified),consumer.verified);
  assert.equal(hash(fixture.publication.programs[0]),expectedProgramDigest,'The new consumer must preserve the complete original Program');
  for(const relative of ['build/semantics.mjs','contracts/assessment.schema.json','contracts/public-contract-catalog.schema.json']) assert.deepEqual(await readFile(join(root,'setup/consumer-source',relative)),await readFile(join(executionRoot,'setup/consumer-source',relative)),relative);
  const resolvedLock=requireKind(product.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion:version,
    memberKey:'resolve',verifiedArtifacts:natives.map(item=>item.verified)}),'resolved_product_lock','lock-construction');
  stage='same-workspace-owner-reconstruction';
  const close=JSON.parse(await readFile(selected.resource.closeHandoff,'utf8'));
  const physical=await stat(fileURLToPath(close.prefix.eventLogRef),{bigint:true});
  assert.equal(physical.dev.toString(),selected.resource.device);assert.equal(physical.ino.toString(),selected.resource.inode);
  assert.equal(physical.size.toString(),selected.resource.byteCount);assert.equal(physical.mtimeNs.toString(),selected.resource.mtimeNs);
  assert.equal(close.prefix.prefixDigest,selected.resource.prefixDigest);assert.equal(close.prefix.coordinateDigest,selected.resource.coordinateDigest);
  assert(!(await readdir(dirname(fileURLToPath(close.prefix.eventLogRef)))).some(name=>/lock/iu.test(name)),'Fixture must be quiescent');
  const prior=JSON.parse(await readFile(selected.previousSetup,'utf8'));
  state.closeHandoff=close;state.binding=prior.binding;
  let held=null,oldEnvironment;
  try {
    held=requireKind(abg.acquireAbgEventResource(caller.reopen()),'acquired_abg_event_resource','same-fixture-acquisition').resource;
    oldEnvironment=caller.refresh(held.entryPrefix);
    assert.deepEqual(oldEnvironment.workspaceBinding.bindingId,state.binding.ref);
    assert.deepEqual(oldEnvironment.workspaceBinding.bindingDigest,state.binding.digest);
    assert.equal(oldEnvironment.workspaceAuthorityBasis.authorizedActorRef,actorRef);
    assert.equal(oldEnvironment.workspaceAuthorityBasis.workspaceId,workspaceManifest.workspaceRef);
    assert.equal(oldEnvironment.workspaceAuthorityBasis.canonicalRoot,config.worksiteRoot);
    const normal=abg.closeAbgEventResource(held,held.entryPrefix);held=null;
    assert.deepEqual(normal.closeHandoff,close);state.closeHandoff=normal.closeHandoff;
  } finally {if(held)state.closeHandoff=abg.closeAbgEventResource(held,held.entryPrefix).closeHandoff;}
  stage='new-pair-public-setup';
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
  state.resolvedLock=resolvedLock;
  const lock={ref:resolvedLock.lockId,digest:resolvedLock.lockDigest};
  const resolved=await invoke('product-resolve',await authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
    {requirements:natives.map(({verified:v})=>({productId:v.productId,packageVersion:v.packageVersion,requiredContractRefs:[],requiredCapabilityRefs:[]})),verifiedCandidates:verificationRefs},
    {kind:'product_resolution_resource_assertion',schemaVersion:version,
      verifiedPreimages:natives.map((item,i)=>({verification:verificationRefs[i],verifiedArtifact:item.verified,
        verificationOutput:verificationOutputs[i]})),
      nativeContractClosure:{selectorDispositions:[],occurrences:[],nativeBindings:[]}},{verification_references:verificationRefs}));
  if(hash(resolved.receipt.ownerOutput.value.resolvedLock)!==hash(lock))throw new BoundaryFailure('resolved-lock-identity',resolved.receipt);
  const eventLogPath=fileURLToPath(state.closeHandoff.prefix.eventLogRef);
  const installations=[];
  for(let i=0;i<natives.length;i++) {
    const item=natives[i],packed=packedArtifacts[i],eventResource=caller.reopen();
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
  const workspaceAuthority=oldEnvironment.workspaceAuthorityBasis;
  caller.workspaceAuthority=workspaceAuthority;
  const roots={...oldEnvironment.workspaceBinding.roots,toolchainRoot:join(root,'sandbox/installed','abg'),productRoot:installations[1].installedRoot};
  const fields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'};
  const bound=await invoke('workspace-bind',await authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
    {workspaceAuthority:{ref:workspaceAuthority.authorityBasisId,digest:workspaceAuthority.authorityBasisDigest},installedSet:installations.map(product.productInstallCoordinate),
      resolvedLock:lock,declaredRoots:Object.entries(fields).map(([rootKind,field])=>({rootKind,path:roots[field]}))},
    {kind:'product_workspace_binding_resource_assertion',schemaVersion:version,eventResource:caller.reopen(),workspaceAuthority,workspaceManifest,
      admittedInstalls:installations,resolvedLock,declaredRoots:roots},{product_set:installations.map(product.productInstallCoordinate),dependency_lock:lock,actor}));
  state.binding=bound.receipt.ownerOutput.value.binding;caller.refresh();
  const core=native.verified;
  const publications=corePublications(gtl,core).concat(fixture.publication);
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

try {
  const manifest=JSON.parse(await readFile(host.manifestPath,'utf8'));
  const native=await verifyArtifact(runtime,{artifactPath:host.archivePath,manifest,expectedArtifactDigest:host.artifactDigest},record,'native');
  assert.strictEqual(p.selectOwnedProductVerification(native.request,native.verified),native.verified);
  caller=publicCaller({root:outputRoot,runtime,native,command,record,config:configuration,actorRef:selected.actorRef});
  stage='actual-new-pair-setup';const setup=await setupChangedPair(caller);
  const selectedFixture=await fixtureSelection();
  for(const source of selectedFixture.sources)assert.deepEqual(await readFile(join(configuration.worksiteRoot,source.path)),source.bytes,'Existing original input changed: '+source.path);
  await record('run.json',{runId:configuration.runId,scope:'Controlled mechanical native/C2 lifecycle only',semanticPremise:'Responder selects a declared injected defect and its exact restoration; no Claude or semantic UAT judgment',stockNodeHeap:true});
  await record('workload-source.json',{request:selectedFixture.request,sourceMembers:selectedFixture.sources.map(({bytes,...row})=>({...row,byteCount:bytes.length}))});
  const original=scenarios.constructWorkloadInput(p,selectedFixture,consumerOwner.assessmentSelection,configuration.toolchains);
  stage='initial-native-call';const initial=await constructLifecycleCall(caller,original);
  assert.equal(hash(initial.resolution.program),expectedProgramDigest,'Compare the actual whole Program; never stamp it');
  const setupIdentity=JSON.parse(await readFile(join(outputRoot,'setup-identity.json'),'utf8'));
  await record('prepared-definition-call.json',initial.call);
  stage='construction-and-gap';let execution=await runner.invokeLifecycle(caller,setup.installations,initial.call,{...environment,...responderEnvironment(configuration.worksiteRoot,'basis')});
  const readEvidence=async(owner,executed)=>{
    const env=owner.refresh(),prefix=owner.state.closeHandoff.prefix,run=executed.receipt.resources.run;
    const packet=a.ABG_PROJECT_READ_CONTRACTS.run_evidence;
    const grants=packet.metadata.capabilityRefs.map(cap=>p.constructCapabilityGrant(env.workspaceAuthorityBasis,owner.actorRef,packet.definitionKey.operationId,cap,
      {admittedInstalls:env.productInstalls,workspaceBinding:env.workspaceBinding,fixedPacket:packet}));
    const slots={...Object.fromEntries(Object.keys(executed.call.invocation.invocationAuthority.slots).map(key=>[key,null])),
      workspace_binding:owner.state.binding,product_set:env.productInstalls.map(p.productInstallCoordinate),
      dependency_lock:{ref:env.workspaceBinding.lockId,digest:env.workspaceBinding.lockDigest},
      capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(grant=>({ref:grant.grantRef,digest:grant.grantDigest}))}};
    const call=runtime.api.constructInstalledPublicDefinitionCall({product:p,installedPublic:runtime.api,definitionContractCoordinates:owner.native.verified.definitionContractCoordinates,
      contractCatalog:owner.contractCatalog,...packet.definitionKey,slots,
      request:{caseKey:'run_evidence',source:{sourceKind:'run',sourceRef:run.ref,sourceDigest:run.digest},projectionBasis:{projectionBasisRef:prefix.eventLogRef,projectionBasisDigest:prefix.coordinateDigest},selector:{kind:'none'}},
      resources:{kind:'abg_project_read_resource_assertion',schemaVersion:'5.0.0',eventResource:owner.reopen()},
      requestRef:'request://abi5-tests/library-joint-proof-237/'+owner.config.runId+'/run-evidence',correlationRef:'correlation://abi5-tests/library-joint-proof-237/'+owner.config.runId,
      eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(outputRoot,'run.json')).href]});
    const observed=await owner.invoke('run-evidence',call,{runtimeRoot:owner.installedRoot,expectResult:true});
    assert.equal(hash(owner.state.closeHandoff.prefix),hash(prefix),'Evidence read must preserve the closed prefix');
    const value=observed.receipt.ownerOutput.value;
    assert.equal(value?.projection?.kind,'run_evidence_projection');
    assert.deepEqual(value.source,run);assert.deepEqual(value.projection.subject,run);
    assert.deepEqual(value.projectionBasis,{ref:prefix.eventLogRef,digest:prefix.coordinateDigest});
    return value;
  };
  const checkLifecycle=async(owner,executed)=>{
    const result=executed.receipt.ownerOutput,disposition=result.value?.disposition;
    await owner.record('lifecycle-disposition.json',{outcomeKind:result.outcomeKind,disposition:disposition??null,run:executed.receipt.resources.run??null,receiptExitCode:executed.receipt.exitCode});
    console.log(JSON.stringify({stage:'actual-native-disposition',disposition:disposition??null,outcomeKind:result.outcomeKind,run:executed.receipt.resources.run??null}));
    if(disposition==='runtime_failed') {
      const evidence=await readEvidence(owner,executed);
      await owner.record('runtime-failure-evidence.json',evidence);
      throw new setupOwner.BoundaryFailure('actual-native-runtime-failed',{receipt:executed.receipt,evidence});
    }
    assert.notEqual(result.outcomeKind,'refusal','Actual lifecycle owner refused');
    assert(['held','gap_stop','blocked','completed'].includes(disposition),'Unknown actual lifecycle disposition');
  };
  await checkLifecycle(caller,execution);
  let reads=await runner.freshReadbacks(caller,execution);await record('fresh-readbacks.json',reads);
  const initialEvidence=await readEvidence(caller,execution);
  stage='construction-complete-replay';const initialComparison=await compareCompleteReplay(caller,execution,1,reads,initialEvidence);
  let parent=initialComparison.selectedParent;assert.deepEqual(parent.original,original.original);const initialReplay=initialComparison.replay;
  assert.equal(await readFile(join(configuration.worksiteRoot,CANDIDATE),'utf8'),'broken\n');
  phaseResults.push({phase:'construction',run:execution.receipt.resources.run,parentResultRef:parent.resultRef,inputDigest:parent.inputDigest,observations:1,replay:initialReplay,committedBytes:caller.state.closeHandoff.prefix.prefixLength,orchestratorMemory:process.memoryUsage()});
  const artifacts=[{label:'native',acquisition:JSON.parse(await readFile(join(outputRoot,'native-acquisition.json'),'utf8'))},
    {label:'consumer',acquisition:JSON.parse(await readFile(join(outputRoot,'consumer-acquisition.json'),'utf8'))}];
  for(const phase of ['audit','restart']) {
    stage=phase+'-same-pair-preparation';const directory=join(outputRoot,phase);await mkdir(directory);
    const phaseRecord=recordAt(directory),phaseCommand=runner.commandRecorder(directory,{environment,timeoutMs:configuration.processTimeoutMs,maxOutputBytes:configuration.maxProcessOutputBytes});
    const handoff=caller.state.closeHandoff,facts=await stat(fileURLToPath(handoff.prefix.eventLogRef),{bigint:true});
    const instance={root:directory,installedRoot:caller.installedRoot,actorRef:caller.actorRef,namespace:'request://abi5-tests/library-joint-proof-237/'+phase,
      artifacts,record:phaseRecord,command:phaseCommand,configuration:{...configuration,runId:configuration.runId+'-'+phase},
      resource:{closeHandoff:handoff,mtimeNs:facts.mtimeNs.toString()},
      source:{call:execution.call,setup:setupIdentity,publicAuthorityDigest:execution.call.invocation.invocationDigest,
        invocationAdmissionRef:execution.receipt.resources.invocationAdmission.ref,runRef:execution.receipt.resources.run.ref,resultRef:parent.resultRef,
        expected:{inputDigest:parent.inputDigest,originalDigest:parent.originalDigest,observations:parent.observations.length}},
      current:{reuseInstalledPair:true,lock:{ref:caller.state.resolvedLock.lockId,digest:caller.state.resolvedLock.lockDigest},
        workspaceManifest:JSON.parse(await readFile(join(executionRoot,'workspace-manifest.json'),'utf8')),
        consumerPublication:{publication:setup.fixture.publication},programDigest:expectedProgramDigest},
      provenanceRefs:[pathToFileURL(join(outputRoot,'run.json')).href]};
    const next=await continuation.prepareInstalledContinuation(instance);
    assert.equal(next.calls.length,0,'Same-pair restart must not replay completed Public setup or witness effects');
    assert.equal(next.summary.sourceResultRef,parent.resultRef);assert.equal(next.summary.sourceInputDigest,parent.inputDigest);
    assert.equal(next.summary.observations,parent.observations.length);assert.equal(next.summary.terminal,false);
    assert.equal(next.prepared.sourceResultBasis.sourceResultRef,parent.resultRef);
    assert.equal(hash(p.retainedGovernanceWorkInput(next.prepared.sourceResultBasis.sourceResultValue)),parent.inputDigest);
    const cycle=publicCaller({root:directory,runtime,native,command:phaseCommand,record:phaseRecord,config:instance.configuration,actorRef:caller.actorRef});
    cycle.installedRoot=next.summary.installedRoot;cycle.state.closeHandoff=next.close.closeHandoff;
    cycle.state.binding=caller.state.binding;cycle.state.resolvedLock=caller.state.resolvedLock;
    cycle.state.catalog=next.call.resources.catalog;cycle.state.catalogView=next.call.resources.catalogView;
    stage=phase+'-native';caller=cycle;execution=await runner.invokeLifecycle(cycle,setup.installations,next.call,{...environment,...responderEnvironment(configuration.worksiteRoot,'audit')});
    await checkLifecycle(cycle,execution);
    reads=await runner.freshReadbacks(cycle,execution);await phaseRecord('fresh-readbacks.json',reads);
    const phaseEvidence=await readEvidence(cycle,execution);
    stage=phase+'-complete-replay';const phaseComparison=await compareCompleteReplay(cycle,execution,4,reads,phaseEvidence);
    const after=phaseComparison.selectedParent;assert.deepEqual(after.original,original.original);const completeReplay=phaseComparison.replay;
    assert.deepEqual(after.observations.slice(0,parent.observations.length),parent.observations,'Earlier work and failed measurements must survive exactly');
    const measured=after.observations.filter(row=>row.purpose==='testing');assert.equal(measured.length,2);
    const [red,green]=measured.map(row=>row.value.commandResults[0]);
    assert.equal(red.commandId,COMMAND);assert.equal(green.commandId,COMMAND);assert.equal(red.exitStatus,1);assert.equal(green.exitStatus,0);
    const text=stream=>stream.encoding==='utf8'?stream.text:stream.excerpts.map(row=>row.text).join('');
    assert(text(red.stdout).startsWith('FIXTURE_VALUE_BAD expected=fixed actual='));assert.equal(text(green.stdout),'FIXTURE_VALUE_FIXED\n');
    assert.notEqual(measured[0].resultRef,measured[1].resultRef,'Remeasurement must have a distinct actual producer');
    assert.equal(await readFile(join(configuration.worksiteRoot,CANDIDATE),'utf8'),'fixed\n');
    phaseResults.push({phase,run:execution.receipt.resources.run,parentResultRef:after.resultRef,inputDigest:after.inputDigest,observations:4,
      redResultRef:measured[0].resultRef,greenResultRef:measured[1].resultRef,sourceResultRef:next.summary.sourceResultRef,replay:completeReplay,sourceBasisRef:next.summary.sourceBasisRef,currentUseDigest:next.summary.currentUseDigest,setupEffects:next.calls.length,committedBytes:cycle.state.closeHandoff.prefix.prefixLength,orchestratorMemory:process.memoryUsage()});
    caller=cycle;parent=after;
  }
  stage='original-file-conservation';
  for(const source of selectedFixture.sources)assert.equal(sha(await readFile(join(configuration.worksiteRoot,source.path))),source.digest.slice(7),source.path);
  await record('composition-result.json',{scope:'Mechanical installed native/C2 producer-consumer and restart only; no semantic UAT/capacity/release',programDigest:expectedProgramDigest,phases:phaseResults,finalClose:caller.state.closeHandoff,heapSample:process.memoryUsage()});
} catch(error) {
  await record('first-cause.json',{stage,name:error.name,message:error.message,stack:error.stack,completedPhases:phaseResults,normalClose:caller?.state.closeHandoff??null,disposition:'STOP; Root RCA/action before retry'});
  throw error;
}
