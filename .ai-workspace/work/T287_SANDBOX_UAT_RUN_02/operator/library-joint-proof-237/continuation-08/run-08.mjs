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
const {installedModules,verifyArtifact,publicCaller,constructLifecycleCall,requireKind,corePublications}=setupOwner;
const host=JSON.parse(await readFile(selected.publicationHost,'utf8'));
const runtime=await installedModules(host.installedRoot),p=runtime.product,a=runtime.abg,hash=p.sha256Canonical;
const executionRoot=selected.fixtureRoot,outputRoot=join(root,'execution');await mkdir(outputRoot);
const environment={...Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(key=>process.env[key]!==undefined).map(key=>[key,process.env[key]])),npm_config_cache:join(selected.publicationRoot,'npm-cache'),npm_config_offline:'true'};
const configuration={runId:'library-joint-proof-237',bootstrapRoot:host.installedRoot,worksiteRoot:join(executionRoot,'worksite'),
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
async function compareCompleteReplay(owner,executed,parent,reads) {
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
  const physical=reads.find(read=>read.memberKey==='run_replay')?.projection?.physicalCoordinates;assert(physical);
  assert.equal(physical.scopedReplayDigest,bodyDigest);assert.equal(physical.scopedReplayRef,full.replayRef);
  assert.equal(physical.fullEventHistoryDigest,prefixes.runtimeEventPrefixDigest(rawAuthority));
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
  return {replayRef:full.replayRef,replayDigest:bodyDigest,canonicalBytes:Buffer.byteLength(canonical),canonicalSha256:sha(canonical),
    nativeLivenessPresent:livenessPresent,nativeLivenessDigest:product.sha256Canonical(full.nativeLiveness),
    eventStoreDigest:full.eventStoreDigest,eventCount:full.eventCount,selectedPayloads,
    collections:Object.fromEntries(['cCalls','routes','constructionDeltas','fanOutCompletions','continuations','actorProcesses','currentWorksiteObservations'].map(field=>[field,full[field].length])),
    parent:{resultRef:parent.resultRef,resultDigest:parentCall[0].resultDigest,cCallRef:parentCall[0].cCallRef,admissionEventRef:parentRows[0].eventId},
    sourceOfComparison:'Actual installed owner; one complete finite raw logical read; full authority scope and selected historical Run scope'};
}

async function restoreRecordedSetup(owner) {
  const version='5.0.0',read=async path=>JSON.parse(await readFile(path,'utf8'));
  const previous=selected.previousExecution,close=await read(join(previous,'calls/catalog-admit.close.json'));
  const physical=await stat(fileURLToPath(close.prefix.eventLogRef),{bigint:true});
  assert.equal(physical.dev.toString(),selected.resource.device);assert.equal(physical.ino.toString(),selected.resource.inode);
  assert.equal(physical.size.toString(),selected.resource.byteCount);assert.equal(physical.mtimeNs.toString(),selected.resource.mtimeNs);
  assert(!(await readdir(dirname(fileURLToPath(close.prefix.eventLogRef)))).some(name=>/lock/iu.test(name)),'A quiet fixture must not retain an append lock');
  assert.deepEqual(close,await read(selected.resource.closeHandoff));
  const consumerExpected=await read(join(previous,'consumer-acquisition.json'));
  const consumerManifest=await read(join(previous,'setup/consumer-source/product-toolchain-manifest.json'));
  stage='live-consumer-verification';
  const consumer=await verifyArtifact(runtime,{artifactPath:consumerExpected.request.artifactPath,manifest:consumerManifest,
    expectedArtifactDigest:consumerExpected.request.expectedArtifactDigest},record,'consumer');
  assert.deepEqual(consumer.request,consumerExpected.request);
  assert.deepEqual(consumer.verification,consumerExpected.verification);
  assert.strictEqual(p.selectOwnedProductVerification(consumer.request,consumer.verified),consumer.verified);
  stage='same-pair-pure-resolution';
  const resolvedLock=requireKind(p.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion:version,
    memberKey:'resolve',verifiedArtifacts:[owner.native.verified,consumer.verified]}),'resolved_product_lock','recorded-lock-construction');
  const readOutcome=async label=>{const value=await read(join(previous,'calls',label+'.outcome.json'));
    assert.equal(value.kind,'installed_definition_call_transport_result');assert.equal(value.receipt.exitCode,0);
    assert.equal(value.receipt.ownerOutput.outcomeKind,'result');return value.receipt;};
  const resolved=await readOutcome('product-resolve'),bound=await readOutcome('workspace-bind'),catalog=await readOutcome('catalog-admit'),view=await readOutcome('catalog-view');
  const lock={ref:resolvedLock.lockId,digest:resolvedLock.lockDigest};
  assert.deepEqual(resolved.receipt??resolved.ownerOutput.value.resolvedLock,lock);
  assert.deepEqual(bound.ownerOutput.value.resolvedLock,lock);
  owner.state.closeHandoff=close;owner.state.binding=bound.ownerOutput.value.binding;owner.state.resolvedLock=resolvedLock;
  const completedLabels=['workspace-create','product-verify-0','product-verify-1','product-resolve','product-install-0','product-install-1','workspace-bind','catalog-admit','catalog-view'];
  for(const label of completedLabels){const receipt=await readOutcome(label);owner.state.calls.push({label,exitCode:receipt.exitCode,
    definitionKey:receipt.definitionKey,outcomeKind:receipt.ownerOutput.outcomeKind,invocationRef:receipt.invocationRef});}
  let resource=null,environment,installations,installedProducts,workspaceAuthority;
  stage='recorded-fixture-resource-acquisition';
  try {
    resource=requireKind(a.acquireAbgEventResource(owner.reopen()),'acquired_abg_event_resource','recorded-fixture-acquisition').resource;
    assert.deepEqual(resource.entryPrefix,close.prefix);
    environment=owner.refresh(resource.entryPrefix);
    assert.deepEqual(environment.resolvedProductLock,resolvedLock);
    assert.equal(environment.workspaceAuthorityBasis.authorizedActorRef,owner.actorRef);
    const workspaceManifest=await read(join(previous,'workspace-manifest.json'));
    assert.equal(environment.workspaceAuthorityBasis.workspaceId,workspaceManifest.workspaceRef);
    assert.equal(environment.workspaceAuthorityBasis.canonicalRoot,configuration.worksiteRoot);
    workspaceAuthority=environment.workspaceAuthorityBasis;owner.workspaceAuthority=workspaceAuthority;
    installations=[];installedProducts=[];
    for(let i=0;i<2;i++){
      const receipt=await readOutcome('product-install-'+i);
      const actual=a.projectAdmittedProductInstallByInvocationRef(environment.artifactTruth,receipt.invocationRef);
      assert(actual?.install&&actual?.candidate,'Recorded install must be actually admitted');
      assert.deepEqual(p.productInstallCoordinate(actual.install),receipt.ownerOutput.value.installedProduct);
      assert.deepEqual(actual.resolvedLock,resolvedLock);assert.deepEqual(receipt.ownerOutput.value.resolvedLock,lock);
      assert(environment.productInstalls.some(install=>hash(install)===hash(actual.install)));
      const v=i===0?owner.native.verified:consumer.verified;
      assert.equal(actual.install.artifactDigest,v.artifactDigest);assert.equal(actual.install.productContentDigest,v.productContentDigest);
      assert.equal(actual.install.manifestDigest,v.manifestDigest);
      installations.push(actual.install);installedProducts.push(actual.candidate);
    }
    assert.equal(environment.productInstalls.length,installations.length);
    assert.deepEqual(bound.ownerOutput.value.installedSet,installations.map(p.productInstallCoordinate));
    const actualBinding=a.projectAdmittedWorkspaceBindingByInvocationRef(environment.artifactTruth,bound.invocationRef,resolvedLock);
    assert(actualBinding?.binding);assert.deepEqual(actualBinding.binding,environment.workspaceBinding);
    assert.equal(actualBinding.binding.bindingId,owner.state.binding.ref);assert.equal(actualBinding.binding.bindingDigest,owner.state.binding.digest);
    const rootFields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'};
    for(const row of bound.ownerOutput.value.declaredRoots)assert.equal(environment.workspaceBinding.roots[rootFields[row.rootKind]],row.path);
    owner.installedRoot=installations[0].installedRoot;
    stage='recorded-catalog-pure-reconstruction';
    const data=await read(join(previous,'setup/consumer-source/build/publication.json')),v=consumer.verified;
    const publication=runtime.gtl.modulePublication({...data,artifactDigest:v.artifactDigest,productContentDigest:v.productContentDigest,
      productManifestDigest:v.manifestDigest,contributions:data.contributions.map(row=>({...row,provenanceRefs:[v.artifactDigest,v.manifestDigest]}))});
    const publications=corePublications(runtime.gtl,owner.native.verified).concat(publication);
    assert.deepEqual(publications.slice(0,-1).map(value=>[value.moduleRef,p.modulePublicationSemanticDigest(value)]).sort(),
      owner.native.verified.contributionManifest.publicationBindings.map(value=>[value.moduleRef,value.publicationDigest]).sort());
    assert.deepEqual(v.contributionManifest.publicationBindings,[{moduleRef:publication.moduleRef,publicationDigest:p.modulePublicationSemanticDigest(publication)}]);
    owner.state.catalog=requireKind(p.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:version,memberKey:'admit',
      readinessBasis:{workspaceBinding:environment.workspaceBindingCandidate,resolvedLock,verifiedProducts:[owner.native.verified,v],installedProducts,publications}}),'graph_function_catalog','recorded-catalog-reconstruction');
    assert.equal(owner.state.catalog.basisDigest,catalog.ownerOutput.value.catalog.digest);
    assert.equal('graph-function-catalog://abiogenesis/'+owner.state.catalog.basisDigest.slice(7),catalog.ownerOutput.value.catalog.ref);
    const program=publication.programs[0],allowlist=[...program.callableMembership].sort();
    assert.equal(hash(program),expectedProgramDigest,'The reconstructed whole Program must equal the original comparison');
    owner.state.catalogView=requireKind(p.narrowGraphFunctionCatalog(owner.state.catalog,allowlist),'graph_function_catalog_view','recorded-view-reconstruction');
    assert.equal(owner.state.catalogView.viewDigest,view.ownerOutput.value.view.digest);
    assert.equal('graph-function-catalog-view://abiogenesis/'+owner.state.catalogView.viewDigest.slice(7),view.ownerOutput.value.view.ref);
    assert.deepEqual(view.ownerOutput.value.effectiveHandles,allowlist);assert.deepEqual(owner.state.catalogView.allowlist,allowlist);
    const fixture={artifactPath:consumer.request.artifactPath,artifactRef:consumer.verified.artifactRef,manifest:consumerManifest,publication,
      basis:{productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion,artifactDigest:v.artifactDigest,manifestDigest:v.manifestDigest,productContentDigest:v.productContentDigest},ids:consumerOwner.IDS};
    // No writes occurred under this acquisition; its normal close remains the same complete value.
    const normal=a.closeAbgEventResource(resource,resource.entryPrefix);resource=null;
    assert.deepEqual(normal.closeHandoff,close);owner.state.closeHandoff=normal.closeHandoff;
    await record('setup-reconstruction.json',{installs:installations.map(p.productInstallCoordinate),binding:owner.state.binding,lock,
      catalog:catalog.ownerOutput.value.catalog,view:view.ownerOutput.value.view,programDigest:hash(program),close:normal.closeHandoff,replayedSetupEffects:0});
    stage='remaining-program-conformance';
    const priorOutcome=join(previous,'calls/program-conformance.outcome.json');
    let conformance;
    try{const prior=await read(priorOutcome);assert.equal(prior.receipt.ownerOutput.value.disposition,'passed');conformance=prior.receipt;}
    catch(error){if(error.code!=='ENOENT')throw error;
      const conformanceLaw={ref:'law://abiogenesis/validator/gtl-program@5',digest:hash({ref:'law://abiogenesis/validator/gtl-program@5'})};
      const packet=runtime.validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program;
      const request={program:{ref:program.programRef,digest:hash(program)},conformanceLaw,
        inventoryBasis:{kind:'declared_inventory',inventory:owner.state.catalog.boundPublications.map(value=>({ref:value.moduleRef,digest:hash(value)})).sort((a,b)=>a.ref.localeCompare(b.ref))}};
      const resources={kind:'conformance_evaluation_resource_assertion',schemaVersion:version,
        packet:{kind:'conformance_evaluate_packet',schemaVersion:version,memberKey:'gtl_program',publication,program},
        conformanceLaw,declaredInventory:owner.state.catalog.boundPublications,declarationCatalog:{catalog:owner.state.catalog,catalogView:owner.state.catalogView}};
      const call=await setupOwner.authorizeInstalledOperation({runtime,native:owner.native,actorRef:owner.actorRef,packet,request,resources,
        supplied:{...owner.boundSlots(),dependency_lock:lock},prefix:owner.state.closeHandoff.prefix,
        requestRef:'request://abi5-tests/sandbox-uat/'+configuration.runId+'/continuation08/program-conformance',
        correlationRef:'correlation://abi5-tests/sandbox-uat/'+configuration.runId+'/continuation08',authorityRef:'authority://abi5-tests/sandbox-uat/'+configuration.runId,
        provenanceRefs:[pathToFileURL(join(outputRoot,'run.json')).href]});
      const evaluated=await owner.invoke('program-conformance',call);conformance=evaluated.receipt;
      assert.equal(conformance.ownerOutput.value.disposition,'passed');
    }
    await record('setup-identity.json',{installations,resolvedLock,workspaceAuthority,workspaceBinding:owner.state.binding,
      catalog:{basisDigest:owner.state.catalog.basisDigest},catalogView:owner.state.catalogView,program,fixture:fixture.basis,
      closeHandoff:owner.state.closeHandoff,classification:'Actual recorded07 setup reconstructed; only missing conformance completed; no application/native effect yet'});
    return {fixture,publications,installations,workspaceAuthority};
  } finally {if(resource){const normal=a.closeAbgEventResource(resource,resource.entryPrefix);owner.state.closeHandoff=normal.closeHandoff;}}
}

try {
  const manifest=JSON.parse(await readFile(host.manifestPath,'utf8'));
  const native=await verifyArtifact(runtime,{artifactPath:host.archivePath,manifest,expectedArtifactDigest:host.artifactDigest},record,'native');
  assert.strictEqual(p.selectOwnedProductVerification(native.request,native.verified),native.verified);
  caller=publicCaller({root:outputRoot,runtime,native,command,record,config:configuration});
  stage='actual-recorded-setup-reconstruction';const setup=await restoreRecordedSetup(caller);
  const selectedFixture=await fixtureSelection();
  for(const source of selectedFixture.sources){const path=join(configuration.worksiteRoot,source.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,source.bytes,{flag:'wx'});}
  await record('run.json',{runId:configuration.runId,scope:'Controlled mechanical native/C2 lifecycle only',semanticPremise:'Responder selects a declared injected defect and its exact restoration; no Claude or semantic UAT judgment',stockNodeHeap:true});
  await record('workload-source.json',{request:selectedFixture.request,sourceMembers:selectedFixture.sources.map(({bytes,...row})=>({...row,byteCount:bytes.length}))});
  const original=scenarios.constructWorkloadInput(p,selectedFixture,consumerOwner.assessmentSelection,configuration.toolchains);
  stage='initial-native-call';const initial=await constructLifecycleCall(caller,original);
  assert.equal(hash(initial.resolution.program),expectedProgramDigest,'Compare the actual whole Program; never stamp it');
  const setupIdentity=JSON.parse(await readFile(join(outputRoot,'setup-identity.json'),'utf8'));
  await record('prepared-definition-call.json',initial.call);
  stage='construction-and-gap';let execution=await runner.invokeLifecycle(caller,setup.installations,initial.call,{...environment,...responderEnvironment(configuration.worksiteRoot,'basis')});
  let reads=await runner.freshReadbacks(caller,execution);await record('fresh-readbacks.json',reads);
  const selectParent=async(owner,executed,expectedCount)=>{
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
    const projection=observed.receipt.ownerOutput.value?.projection;assert.equal(projection?.runId,run.ref);assert(Array.isArray(projection.cCalls));
    const candidates=projection.cCalls.flatMap(row=>{const input=p.retainedGovernanceWorkInput(row.resultValue);return row.resultClass==='success'&&row.judgment==='advance'&&input?.terminal===false&&input.observations.length===expectedCount?
      [{resultRef:row.resultRef,inputDigest:hash(input),originalDigest:hash(input.original),original:input.original,observations:input.observations}]:[];});
    assert(candidates.length>0,'Actual evidence has no judged nonterminal parent with the expected completed work');
    // Keep only the selected address and work needed for fixture comparisons.
    // The shared helper reauthenticates the Result, producer and current Source.
    return candidates.at(-1);
  };
  let parent=await selectParent(caller,execution,1);assert.deepEqual(parent.original,original.original);
  stage='construction-complete-replay';const initialReplay=await compareCompleteReplay(caller,execution,parent,reads);
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
    stage=phase+'-native';execution=await runner.invokeLifecycle(cycle,setup.installations,next.call,{...environment,...responderEnvironment(configuration.worksiteRoot,'audit')});
    reads=await runner.freshReadbacks(cycle,execution);await phaseRecord('fresh-readbacks.json',reads);
    const after=await selectParent(cycle,execution,4);assert.deepEqual(after.original,original.original);
    stage=phase+'-complete-replay';const completeReplay=await compareCompleteReplay(cycle,execution,after,reads);
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
