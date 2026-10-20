// Root-selected exact44 installed Testing/restart discriminator; original DataMapper excluded.
// Existing Public/setup/continuation owners do all admission and preparation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,stat,readdir} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {fixtureSelection,responderEnvironment,expectedProgramDigest,COMMAND,CANDIDATE} from '../continuation-09/workload.mjs';

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
const [setupOwner,runner,consumerOwner,continuation]=await Promise.all(
  ['public-setup.mjs','runner.mjs','consumer.mjs','continuation.mjs'].map(name=>import(pathToFileURL(join(selected.helperRoot,name)).href)));
const {installedModules,verifyArtifact,publicCaller,requireKind,BoundaryFailure}=setupOwner;
const host=JSON.parse(await readFile(selected.publicationHost,'utf8'));
const runtime=await installedModules(host.installedRoot),p=runtime.product,a=runtime.abg,hash=p.sha256Canonical;
const executionRoot=selected.fixtureRoot,outputRoot=join(root,'execution');await mkdir(outputRoot);
const environment={...Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(key=>process.env[key]!==undefined).map(key=>[key,process.env[key]])),npm_config_cache:join(selected.publicationRoot,'npm-cache'),npm_config_offline:'true'};
const configuration={runId:'library-joint-proof-237-16',bootstrapRoot:host.installedRoot,worksiteRoot:join(executionRoot,'worksite'),
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
    throw new BoundaryFailure('actual-native-runtime-failed',{run:executed.receipt.resources.run,
      invocationAdmission:executed.receipt.resources.invocationAdmission,stop:result.value.stop,
      evidencePath:join(owner.root,'runtime-failure-evidence.json'),nativeOutcomePath:join(owner.root,'calls/lifecycle-start.outcome.json')});
  }
  assert.notEqual(result.outcomeKind,'refusal','Actual lifecycle owner refused');
  assert(['held','gap_stop','blocked','completed'].includes(disposition),'Unknown actual lifecycle disposition');
};

try {
  const manifest=JSON.parse(await readFile(host.manifestPath,'utf8'));
  const native=await verifyArtifact(runtime,{artifactPath:host.archivePath,manifest,expectedArtifactDigest:host.artifactDigest},record,'native');
  assert.strictEqual(p.selectOwnedProductVerification(native.request,native.verified),native.verified);
  stage='new-consumer-definition';
  const fixture=await consumerOwner.prepareConsumer({root:join(outputRoot,'setup'),product:p,gtl:runtime.gtl,verified:native.verified,
    archivePath:native.request.artifactPath,npm:configuration.toolchains.npm.executable,recursionBound:configuration.recursionBound,command});
  const consumer=await verifyArtifact(runtime,{artifactPath:fixture.artifactPath,manifest:fixture.manifest,expectedArtifactDigest:fixture.basis.artifactDigest},record,'consumer');
  assert.strictEqual(p.selectOwnedProductVerification(consumer.request,consumer.verified),consumer.verified);
  assert.equal(hash(fixture.publication.programs[0]),expectedProgramDigest,'The complete original Program must remain exact');
  for(const relative of ['build/semantics.mjs','contracts/assessment.schema.json','contracts/public-contract-catalog.schema.json'])
    assert.deepEqual(await readFile(join(outputRoot,'setup/consumer-source',relative)),await readFile(join(selected.previousExecution,'setup/consumer-source',relative)),relative);
  const resolvedLock=requireKind(p.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion:'5.0.0',
    memberKey:'resolve',verifiedArtifacts:[native.verified,consumer.verified]}),'resolved_product_lock','early-fixed-resolution');
  const selectedFixture=await fixtureSelection();
  for(const source of selectedFixture.sources)assert.deepEqual(await readFile(join(configuration.worksiteRoot,source.path)),source.bytes,'Existing original input changed: '+source.path);
  assert.equal(await readFile(join(configuration.worksiteRoot,CANDIDATE),'utf8'),'broken\n');
  // This prior admitted input supplies only an expected original-field comparison.
  // The helper derives the actual selected parent Source and currentness itself.
  const historical=JSON.parse(await readFile(selected.originalComparison.path,'utf8')).event.payload.rawInputValue;
  const originalDigest=hash(historical.original);
  await record('run.json',{runId:configuration.runId,scope:'Actual Testing retry from the completed37 construction parent; no initial Construction or old setup replay',
    sourceResultRef:selected.source.resultRef,semanticPremise:'Local controlled responder; no Claude/semantic UAT assessment',stockNodeHeap:true});
  const directory=join(outputRoot,'audit');await mkdir(directory);
  const phaseRecord=recordAt(directory),phaseCommand=runner.commandRecorder(directory,{environment,timeoutMs:configuration.processTimeoutMs,maxOutputBytes:configuration.maxProcessOutputBytes});
  const instance={root:directory,installedRoot:host.installedRoot,actorRef:selected.actorRef,namespace:'request://abi5-tests/library-joint-proof-237/'+configuration.runId+'/audit',
    artifacts:[{label:'native',acquisition:{request:native.request,verification:native.verification}},{label:'consumer',acquisition:{request:consumer.request,verification:consumer.verification}}],
    record:phaseRecord,command:phaseCommand,configuration:{...configuration,runId:configuration.runId+'-audit'},
    resource:{closeHandoff:JSON.parse(await readFile(selected.resource.closeHandoff.path,'utf8')).closeHandoff,mtimeNs:selected.resource.mtimeNs},
    source:{...selected.source,expected:{...selected.source.expected,originalDigest}},
    current:{reuseInstalledPair:false,lock:{ref:resolvedLock.lockId,digest:resolvedLock.lockDigest},workspaceManifest:selected.workspaceManifest,
      consumerPublication:{publication:fixture.publication},programDigest:expectedProgramDigest,ticketRef:selected.ticketRef,repriceReason:selected.repriceReason},
    provenanceRefs:[pathToFileURL(join(outputRoot,'run.json')).href]};
  stage='audit-changed-pair-preparation';
  const next=await continuation.prepareInstalledContinuation(instance);
  assert.equal(next.summary.sourceResultRef,selected.source.resultRef);assert.equal(next.summary.sourceInputDigest,selected.source.expected.inputDigest);
  assert.equal(next.summary.observations,1);assert.equal(next.summary.terminal,false);
  assert.equal(next.prepared.sourceResultBasis.sourceResultRef,selected.source.resultRef);
  const parentInput=p.retainedGovernanceWorkInput(next.prepared.sourceResultBasis.sourceResultValue);assert(parentInput);
  assert.equal(hash(parentInput),selected.source.expected.inputDigest);assert.equal(hash(parentInput.original),originalDigest);
  const cycle=publicCaller({root:directory,runtime,native,command:phaseCommand,record:phaseRecord,config:instance.configuration,actorRef:selected.actorRef});
  cycle.installedRoot=next.summary.installedRoot;cycle.state.closeHandoff=next.close.closeHandoff;
  cycle.state.binding=next.call.invocation.invocationAuthority.slots.workspace_binding;cycle.state.resolvedLock=resolvedLock;
  cycle.state.catalog=next.call.resources.catalog;cycle.state.catalogView=next.call.resources.catalogView;
  const currentEnvironment=cycle.refresh(next.summary.finalPrefix);
  assert.deepEqual(currentEnvironment.workspaceBinding,next.prepared.workspaceBinding);
  assert.deepEqual(currentEnvironment.resolvedProductLock,resolvedLock);
  const installations=currentEnvironment.productInstalls;assert.equal(installations.length,2);
  for(let i=0;i<installations.length;i++) {
    const verified=i===0?native.verified:consumer.verified;
    for(const field of ['artifactDigest','productContentDigest','manifestDigest'])assert.equal(installations[i][field],verified[field]);
  }
  assert.equal(installations[0].installedRoot,cycle.installedRoot);
  const setupIdentity={installations,resolvedLock,workspaceAuthority:currentEnvironment.workspaceAuthorityBasis,
    workspaceBinding:cycle.state.binding,program:next.prepared.resolution.program,catalog:{basisDigest:cycle.state.catalog.basisDigest},catalogView:cycle.state.catalogView,
    fixture:fixture.basis,closeHandoff:cycle.state.closeHandoff,classification:'Actual changed-pair owner outputs; original37 source/setup remain historical'};
  await record('setup-identity.json',setupIdentity);
  phaseResults.push({phase:'changed-pair-preparation',sourceResultRef:next.summary.sourceResultRef,sourceBasisRef:next.summary.sourceBasisRef,
    currentUseDigest:next.summary.currentUseDigest,setupEffects:next.calls,programDigest:hash(next.prepared.resolution.program),committedBytes:cycle.state.closeHandoff.prefix.prefixLength});
  stage='audit-native';caller=cycle;
  const execution=await runner.invokeLifecycle(cycle,installations,next.call,{...environment,...responderEnvironment(configuration.worksiteRoot,'audit')});
  await checkLifecycle(cycle,execution);
  const reads=await runner.freshReadbacks(cycle,execution);await phaseRecord('fresh-readbacks.json',reads);
  const evidence=await readEvidence(cycle,execution);
  stage='audit-complete-replay';const comparison=await compareCompleteReplay(cycle,execution,4,reads,evidence),after=comparison.selectedParent;
  assert.deepEqual(after.original,parentInput.original);
  assert.deepEqual(after.observations.slice(0,parentInput.observations.length),parentInput.observations,'Earlier completed work must remain exact');
  const measured=after.observations.filter(row=>row.purpose==='testing');assert.equal(measured.length,2);
  const [red,green]=measured.map(row=>row.value.commandResults[0]);
  assert.equal(red.commandId,COMMAND);assert.equal(green.commandId,COMMAND);assert.equal(red.exitStatus,1);assert.equal(green.exitStatus,0);
  const text=stream=>stream.encoding==='utf8'?stream.text:stream.excerpts.map(row=>row.text).join('');
  assert(text(red.stdout).startsWith('FIXTURE_VALUE_BAD expected=fixed actual='));assert.equal(text(green.stdout),'FIXTURE_VALUE_FIXED\n');
  assert.notEqual(measured[0].resultRef,measured[1].resultRef);assert.equal(await readFile(join(configuration.worksiteRoot,CANDIDATE),'utf8'),'fixed\n');
  phaseResults.push({phase:'audit',run:execution.receipt.resources.run,parentResultRef:after.resultRef,inputDigest:after.inputDigest,observations:4,
    redResultRef:measured[0].resultRef,greenResultRef:measured[1].resultRef,replay:comparison.replay,committedBytes:cycle.state.closeHandoff.prefix.prefixLength,orchestratorMemory:process.memoryUsage()});
  // Reuse the original09 same-pair owner path only after the Testing discriminator passed.
  // No second setup, witness, or construction effects are permitted at this boundary.
  stage='restart-same-pair-preparation';const restartDirectory=join(outputRoot,'restart');await mkdir(restartDirectory);
  const restartRecord=recordAt(restartDirectory),restartCommand=runner.commandRecorder(restartDirectory,{environment,timeoutMs:configuration.processTimeoutMs,maxOutputBytes:configuration.maxProcessOutputBytes});
  const restartHandoff=cycle.state.closeHandoff,restartFacts=await stat(fileURLToPath(restartHandoff.prefix.eventLogRef),{bigint:true});
  const restartInstance={root:restartDirectory,installedRoot:host.installedRoot,actorRef:cycle.actorRef,namespace:'request://abi5-tests/library-joint-proof-237/'+configuration.runId+'/restart',
    artifacts:instance.artifacts,record:restartRecord,command:restartCommand,configuration:{...configuration,runId:configuration.runId+'-restart'},
    resource:{closeHandoff:restartHandoff,mtimeNs:restartFacts.mtimeNs.toString()},
    source:{call:execution.call,setup:setupIdentity,publicAuthorityDigest:execution.call.invocation.invocationDigest,
      invocationAdmissionRef:execution.receipt.resources.invocationAdmission.ref,runRef:execution.receipt.resources.run.ref,resultRef:after.resultRef,
      expected:{inputDigest:after.inputDigest,originalDigest:after.originalDigest,observations:after.observations.length}},
    current:{reuseInstalledPair:true,lock:{ref:resolvedLock.lockId,digest:resolvedLock.lockDigest},workspaceManifest:selected.workspaceManifest,
      consumerPublication:{publication:fixture.publication},programDigest:expectedProgramDigest},
    provenanceRefs:[pathToFileURL(join(outputRoot,'run.json')).href]};
  const restarted=await continuation.prepareInstalledContinuation(restartInstance);
  assert.equal(restarted.calls.length,0,'Same-pair restart must not replay completed setup or witness effects');
  assert.equal(restarted.summary.sourceResultRef,after.resultRef);assert.equal(restarted.summary.sourceInputDigest,after.inputDigest);
  assert.equal(restarted.summary.observations,after.observations.length);assert.equal(restarted.summary.terminal,false);
  assert.equal(restarted.prepared.sourceResultBasis.sourceResultRef,after.resultRef);
  assert.equal(hash(p.retainedGovernanceWorkInput(restarted.prepared.sourceResultBasis.sourceResultValue)),after.inputDigest);
  const restartCycle=publicCaller({root:restartDirectory,runtime,native,command:restartCommand,record:restartRecord,config:restartInstance.configuration,actorRef:cycle.actorRef});
  restartCycle.installedRoot=restarted.summary.installedRoot;restartCycle.state.closeHandoff=restarted.close.closeHandoff;
  restartCycle.state.binding=restarted.call.invocation.invocationAuthority.slots.workspace_binding;restartCycle.state.resolvedLock=resolvedLock;
  restartCycle.state.catalog=restarted.call.resources.catalog;restartCycle.state.catalogView=restarted.call.resources.catalogView;
  const restartEnvironment=restartCycle.refresh(restarted.summary.finalPrefix);
  assert.deepEqual(restartEnvironment.workspaceBinding,currentEnvironment.workspaceBinding);assert.deepEqual(restartEnvironment.resolvedProductLock,resolvedLock);
  assert.deepEqual(restartEnvironment.productInstalls,installations);
  stage='restart-native';caller=restartCycle;
  const restartExecution=await runner.invokeLifecycle(restartCycle,installations,restarted.call,{...environment,...responderEnvironment(configuration.worksiteRoot,'audit')});
  await checkLifecycle(restartCycle,restartExecution);
  const restartReads=await runner.freshReadbacks(restartCycle,restartExecution);await restartRecord('fresh-readbacks.json',restartReads);
  const restartEvidence=await readEvidence(restartCycle,restartExecution);
  stage='restart-complete-replay';const restartComparison=await compareCompleteReplay(restartCycle,restartExecution,4,restartReads,restartEvidence),restored=restartComparison.selectedParent;
  assert.deepEqual(restored.original,after.original);assert.deepEqual(restored.observations,after.observations,'All original producers and red citations must survive restart exactly');
  assert.equal(await readFile(join(configuration.worksiteRoot,CANDIDATE),'utf8'),'fixed\n');
  phaseResults.push({phase:'restart',run:restartExecution.receipt.resources.run,parentResultRef:restored.resultRef,inputDigest:restored.inputDigest,observations:4,
    sourceResultRef:restarted.summary.sourceResultRef,sourceBasisRef:restarted.summary.sourceBasisRef,currentUseDigest:restarted.summary.currentUseDigest,
    setupEffects:restarted.calls.length,replay:restartComparison.replay,committedBytes:restartCycle.state.closeHandoff.prefix.prefixLength,orchestratorMemory:process.memoryUsage()});
  for(const source of selectedFixture.sources)assert.equal(sha(await readFile(join(configuration.worksiteRoot,source.path))),source.digest.slice(7),source.path);
  await record('composition-result.json',{scope:'Installed43 Testing and same-pair restart from37 parent; original DataMapper/capacity/semantic UAT remain separate',
    programDigest:expectedProgramDigest,phases:phaseResults,finalClose:caller.state.closeHandoff,heapSample:process.memoryUsage()});
} catch(error) {
  await record('first-cause.json',{stage,name:error.name,message:error.message,stack:error.stack,observation:error instanceof BoundaryFailure?error.observation:null,
    completedPhases:phaseResults,normalClose:caller?.state.closeHandoff??null,disposition:'STOP; Root RCA/action before retry'});
  throw error;
}
