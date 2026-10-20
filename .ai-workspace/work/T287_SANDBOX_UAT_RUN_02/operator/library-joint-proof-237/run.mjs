// Preparation only: execution requires Root's exact accepted successor grant.
// Existing Public/setup/continuation owners do all admission and preparation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
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
const {installedModules,verifyArtifact,publicCaller,populateSandbox,constructLifecycleCall,requireKind}=setupOwner;
const host=JSON.parse(await readFile(join(root,'publication/host-selector.json'),'utf8'));
const runtime=await installedModules(host.installedRoot),p=runtime.product,a=runtime.abg,hash=p.sha256Canonical;
const executionRoot=join(root,'execution');await mkdir(executionRoot);
const environment={...Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(key=>process.env[key]!==undefined).map(key=>[key,process.env[key]])),npm_config_cache:join(root,'publication/npm-cache'),npm_config_offline:'true'};
const configuration={runId:'library-joint-proof-237',bootstrapRoot:host.installedRoot,worksiteRoot:join(executionRoot,'worksite'),
  nodePath:process.execPath,setupEnvironment:environment,toolchains:{npm:{executable:selected.npm},node:{executable:process.execPath}},
  recursionBound:1000,processTimeoutMs:300000,maxProcessOutputBytes:16777216};
const recordAt=directory=>async(name,value,raw=false)=>{const path=join(directory,name);assert(path.startsWith(directory+'/'));await mkdir(dirname(path),{recursive:true});await writeFile(path,raw?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});};
const record=recordAt(executionRoot),command=runner.commandRecorder(executionRoot,{environment,timeoutMs:configuration.processTimeoutMs,maxOutputBytes:configuration.maxProcessOutputBytes});
let caller,stage='live-native-verification';
const phaseResults=[];
try {
  const manifest=JSON.parse(await readFile(host.manifestPath,'utf8'));
  const native=await verifyArtifact(runtime,{artifactPath:host.archivePath,manifest,expectedArtifactDigest:host.artifactDigest},record,'native');
  assert.strictEqual(p.selectOwnedProductVerification(native.request,native.verified),native.verified);
  caller=publicCaller({root:executionRoot,runtime,native,command,record,config:configuration});
  stage='actual-public-setup';const setup=await populateSandbox(caller);
  const selectedFixture=await fixtureSelection();
  for(const source of selectedFixture.sources){const path=join(configuration.worksiteRoot,source.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,source.bytes,{flag:'wx'});}
  await record('run.json',{runId:configuration.runId,scope:'Controlled mechanical native/C2 lifecycle only',semanticPremise:'Responder selects a declared injected defect and its exact restoration; no Claude or semantic UAT judgment',stockNodeHeap:true});
  await record('workload-source.json',{request:selectedFixture.request,sourceMembers:selectedFixture.sources.map(({bytes,...row})=>({...row,byteCount:bytes.length}))});
  const original=scenarios.constructWorkloadInput(p,selectedFixture,consumerOwner.assessmentSelection,configuration.toolchains);
  stage='initial-native-call';const initial=await constructLifecycleCall(caller,original);
  assert.equal(hash(initial.resolution.program),expectedProgramDigest,'Compare the actual whole Program; never stamp it');
  const setupIdentity=JSON.parse(await readFile(join(executionRoot,'setup-identity.json'),'utf8'));
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
      eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(executionRoot,'run.json')).href]});
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
  assert.equal(await readFile(join(configuration.worksiteRoot,CANDIDATE),'utf8'),'broken\n');
  phaseResults.push({phase:'construction',run:execution.receipt.resources.run,parentResultRef:parent.resultRef,inputDigest:parent.inputDigest,observations:1});
  const artifacts=[{label:'native',acquisition:JSON.parse(await readFile(join(executionRoot,'native-acquisition.json'),'utf8'))},
    {label:'consumer',acquisition:JSON.parse(await readFile(join(executionRoot,'consumer-acquisition.json'),'utf8'))}];
  for(const phase of ['audit','restart']) {
    stage=phase+'-same-pair-preparation';const directory=join(executionRoot,phase);await mkdir(directory);
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
      provenanceRefs:[pathToFileURL(join(executionRoot,'run.json')).href]};
    const next=await continuation.prepareInstalledContinuation(instance);
    assert.equal(next.calls.length,0,'Same-pair restart must not replay completed Public setup or witness effects');
    const cycle=publicCaller({root:directory,runtime,native,command:phaseCommand,record:phaseRecord,config:instance.configuration,actorRef:caller.actorRef});
    cycle.installedRoot=next.summary.installedRoot;cycle.state.closeHandoff=next.close.closeHandoff;
    cycle.state.binding=caller.state.binding;cycle.state.resolvedLock=caller.state.resolvedLock;
    cycle.state.catalog=next.call.resources.catalog;cycle.state.catalogView=next.call.resources.catalogView;
    stage=phase+'-native';execution=await runner.invokeLifecycle(cycle,setup.installations,next.call,{...environment,...responderEnvironment(configuration.worksiteRoot,'audit')});
    reads=await runner.freshReadbacks(cycle,execution);await phaseRecord('fresh-readbacks.json',reads);
    const after=await selectParent(cycle,execution,4);assert.deepEqual(after.original,original.original);
    assert.deepEqual(after.observations.slice(0,parent.observations.length),parent.observations,'Earlier work and failed measurements must survive exactly');
    const measured=after.observations.filter(row=>row.purpose==='testing');assert.equal(measured.length,2);
    const [red,green]=measured.map(row=>row.observed.commandResults[0]);
    assert.equal(red.commandId,COMMAND);assert.equal(green.commandId,COMMAND);assert.equal(red.exitStatus,1);assert.equal(green.exitStatus,0);
    const text=stream=>stream.encoding==='utf8'?stream.text:stream.excerpts.map(row=>row.text).join('');
    assert(text(red.stdout).startsWith('FIXTURE_VALUE_BAD expected=fixed actual='));assert.equal(text(green.stdout),'FIXTURE_VALUE_FIXED\n');
    assert.notEqual(measured[0].resultRef,measured[1].resultRef,'Remeasurement must have a distinct actual producer');
    assert.equal(await readFile(join(configuration.worksiteRoot,CANDIDATE),'utf8'),'fixed\n');
    phaseResults.push({phase,run:execution.receipt.resources.run,parentResultRef:after.resultRef,inputDigest:after.inputDigest,observations:4,
      redResultRef:measured[0].resultRef,greenResultRef:measured[1].resultRef,sourceBasisRef:next.summary.sourceBasisRef,currentUseDigest:next.summary.currentUseDigest,setupEffects:next.calls.length});
    caller=cycle;parent=after;
  }
  stage='original-file-conservation';
  for(const source of selectedFixture.sources)assert.equal(sha(await readFile(join(configuration.worksiteRoot,source.path))),source.digest.slice(7),source.path);
  await record('composition-result.json',{scope:'Mechanical installed native/C2 producer-consumer and restart only; no semantic UAT/capacity/release',programDigest:expectedProgramDigest,phases:phaseResults,finalClose:caller.state.closeHandoff,heapSample:process.memoryUsage()});
} catch(error) {
  await record('first-cause.json',{stage,name:error.name,message:error.message,stack:error.stack,completedPhases:phaseResults,normalClose:caller?.state.closeHandoff??null,disposition:'STOP; Root RCA/action before retry'});
  throw error;
}
