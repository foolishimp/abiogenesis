// Preparation-only controller. Root release is required before all Product imports.
import assert from 'node:assert/strict';
import {readFile,writeFile,appendFile,stat,open} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const write=(name,value)=>writeFile(join(here,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const began=performance.now();let frontier='separate Root Runtime10 release',c=null;
async function pinnedJson(pin){
  let bytes=await readFile(pin.path);assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256);
  let text=bytes.toString('utf8');bytes=null;const value=JSON.parse(text);text=null;return value;
}
async function mark(name){frontier=name;await appendFile(join(here,'flow-progress.jsonl'),JSON.stringify({frontier,elapsedMs:performance.now()-began,memory:process.memoryUsage()})+'\n');}
async function physicalEvent(){
  const plan=await read(join(here,'resource-plan.json')),before=await stat(plan.eventLogPath),hash=createHash('sha256');
  for await(const b of createReadStream(plan.eventLogPath))hash.update(b);
  const after=await stat(plan.eventLogPath);assert.deepEqual([before.dev,before.ino,before.size,before.mtimeMs],[after.dev,after.ino,after.size,after.mtimeMs]);
  const h=await open(plan.eventLogPath,'r'),prefix=Buffer.alloc(plan.initialPrefixBytes);
  try{assert.equal((await h.read(prefix,0,prefix.length,0)).bytesRead,prefix.length);}finally{await h.close();}
  assert.equal(sha(prefix),plan.initialPrefixSha256);assert.equal(after.dev,plan.eventDevice);assert.equal(after.ino,plan.eventInode);
  const lockPath=join(here,'task-tmp/abiogenesis-event-store-locks-v5',after.dev+'-'+after.ino+'.lock');
  let lockPresent=false;try{await stat(lockPath);lockPresent=true;}catch(e){if(e.code!=='ENOENT')throw e;}
  return {path:plan.eventLogPath,bytes:after.size,sha256:hash.digest('hex'),device:after.dev,inode:after.ino,lockPath,lockPresent,originalPrefixUnchanged:true};
}
try{
  const cfg=await read(join(here,'driver-config.json')),activation=await read(join(here,'runtime-activation.json'));
  const release=await read(join(here,'runtime-release.json'));
  assert.equal(activation.operation,cfg.runtimeOperation);assert.equal(release.operation,activation.operation);
  assert.equal(release.RootSeparateMessageRelease,true);assert.equal(release.originalPositiveCompanionAccepted,true);
  assert.equal(release.consumerPreparationAccepted,true);assert.ok(release.inputAcceptance);
  assert.deepEqual(activation.inputAcceptance,release.inputAcceptance);
  const RootAcceptance=await pinnedJson(release.inputAcceptance);
  await pinnedJson(activation.consumerPreparationFreeze);
  const originalPositiveAcceptance=await pinnedJson(cfg.originalPositiveAcceptance);
  await pinnedJson(cfg.originalRuntimeFreeze);
  assert.equal(sha(await readFile(join(here,'freeze.json'))),cfg.Q08FreezeSHA256);
  for(const r of cfg.sourceCopies){const b=await readFile(r.copy.path);assert.equal(b.length,r.copy.bytes);assert.equal(sha(b),r.copy.sha256);}
  await write('consumed-input-acceptance.json',{pin:release.inputAcceptance,RootSeparateMessage:release.RootMessage,
    actualAcceptance:RootAcceptance,originalPositiveAcceptancePin:cfg.originalPositiveAcceptance,originalPositiveAcceptance});
  await mark('current installed nominal verification after exact Root release');
  // The external supervisor must establish the group before this first Product import.
  const {loadRuntime}=await import('./f11/public-support.mjs');
  const {caller,verificationRequest}=await import('./f11/ordinary-caller.mjs');
  const identity=await read(join(here,'selected-core.json')),prospect=await read(join(here,'prospective-cases.json'));
  const budgets=await read(join(here,'budgets.json')),nominalStart=performance.now(),runtime=await loadRuntime(identity.installedRoot);
  const verificationPacket={kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(prospect.core)};
  let timer;const verification=await Promise.race([runtime.product.ProductVerificationPort.verify(verificationPacket),
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('nominal phase exceeded its declared budget')),budgets.nominalPreflightMs);})]).finally(()=>clearTimeout(timer));
  assert.equal(verification.kind,'product_verification_success');
  assert.strictEqual(runtime.product.selectOwnedProductVerification(verificationPacket.request,verification.verifiedArtifact),verification.verifiedArtifact);
  assert.equal(verification.verifiedArtifact.productContentDigest,identity.basis.productContentDigest);
  await write('nominal-preflight-completion.json',{status:'passed',elapsedMs:performance.now()-nominalStart,sameProcessOwnedObject:true,productContentDigest:identity.basis.productContentDigest});
  c=await caller('flow',verification,began+budgets.driverBudgetMs,here);
  const setup=await read(cfg.actualSetupStateFile),closed=await pinnedJson(cfg.currentClosedHandoff);
  Object.assign(c.state,{closeHandoff:closed.closeHandoff,environment:setup.environment,catalog:setup.catalog,
    catalogView:setup.catalogView,binding:setup.binding,resolvedLock:setup.resolvedLock,calls:[]});
  c.refresh();assert.equal(c.state.environment.workspaceAuthorityBasis.authorizedActorRef,activation.actorRef);
  const plan=await read(join(here,'resource-plan.json')),initial=await readFile(plan.eventLogPath),s=await stat(plan.eventLogPath);
  assert.equal(initial.length,plan.initialPrefixBytes);assert.equal(sha(initial),plan.initialPrefixSha256);
  assert.equal(s.dev,plan.eventDevice);assert.equal(s.ino,plan.eventInode);assert.equal(c.hash(c.state.closeHandoff),plan.initialHandoffDigest);
  await writeFile(join(here,'runtime09-initial-durable-prefix.bin'),initial,{flag:'wx'});
  await write('initial-resource-handoff.json',{closeHandoff:c.state.closeHandoff,handoffDigest:c.hash(c.state.closeHandoff),physical:await physicalEvent(),borrowedOriginalParentAndReads:true});
  await mark('consume exact Q15 resource and original Runtime09 J; no parent or actor dispatch');
  const rawPacket=await pinnedJson(cfg.inputPacket),manifest=await pinnedJson(cfg.inputManifest),observation=await pinnedJson(cfg.originalProof);
  assert.equal(rawPacket.assertionManifestRef,manifest.resourceRef);
  const packet={...rawPacket,assertion:{kind:'qualification_resource_assertion',schemaVersion:'1',manifests:[manifest],declarationProofs:rawPacket.declarationProofs}};
  assert.equal(packet.assessmentInput.task.resource.ref,manifest.resourceRef);
  assert.equal(packet.assessmentInput.plan.ownerActorRef,activation.actorRef);
  const {assertionForInvokingView,selfConformanceWithActualProof}=await import('./f11/prepare-resources.mjs');
  const {actualOwnerContext,admittedAssessmentAgreement,compactF11Observation,actualVerdictInput,nonGreenAF22,freshReadAgreement}=await import('./f11/proof-oracles.mjs');
  const {positiveRunRoute}=await import('./f11/flow-driver.mjs');
  const archive=assertionForInvokingView(packet.assertion,c.state.catalog,c.state.catalogView,c.hash);
  const route=async(boundary,returned)=>{const selected=positiveRunRoute(c,returned);if(selected.status==='stopped'){
    await write('selected-flow-stop.json',{boundary,...selected});throw Error('first actual continuation refusal at '+boundary+' / '+selected.disposition);
  }return selected.value;};
  const selfInput=selfConformanceWithActualProof(packet,observation.proof);
  const self=await c.prepareStart(c.gtl.SELF_CONFORMANCE_IDS.programRef,c.gtl.SELF_CONFORMANCE_IDS.graphFunctionRef,selfInput,'f11',archive);
  const selfOwner=await actualOwnerContext(c,self);
  const projectionChecks=admittedAssessmentAgreement(c,observation,packet.assessmentInput,selfOwner);
  await write('assessment-consumption-checks.json',projectionChecks);
  await mark('fresh native F11 consumes original J through exact explicit resource');
  const selfStarted=await c.invoke('f11',self.call,'selfConformance'),selfValue=await route('F11',selfStarted);
  const selfReads=await c.freshReads('f11',selfStarted);freshReadAgreement(c,selfValue,selfReads);
  const selfObservation=compactF11Observation(c,selfValue,selfInput);
  const verdictInput=actualVerdictInput(c,packet,selfObservation,selfOwner);
  const verdict=await c.prepareStart('program://abiogenesis/qualification/exact-candidate@5',c.gtl.QUALIFICATION_IDS.verdictGraph,verdictInput,'af22',archive);
  const verdictOwner=await actualOwnerContext(c,verdict);assert.ok(verdictOwner.qualificationResources);
  await mark('sole AF22 follows actual F11; truthful controlled non-green');
  const verdictStarted=await c.invoke('af22',verdict.call,'verdict'),verdictValue=await route('AF22',verdictStarted);
  const verdictReads=await c.freshReads('af22',verdictStarted);freshReadAgreement(c,verdictValue,verdictReads);
  const final=nonGreenAF22(c,verdictValue,verdictInput);
  await write('existing-program-flow-result.json',{mechanicalPath:'completed_remaining_path',
    reusedAssessmentRun:observation.terminal.producer.runRef,selfConformanceRun:selfValue.run,verdictRun:verdictValue.run,
    newCompletedRuns:2,newFreshCLIReads:4,reusedCompletedRuns:1,reusedFreshCLIReads:2,projectionChecks,final,
    originalAssessmentProof:cfg.originalProof,childGraphFoldback:observation.childFoldback,fullQualification:false});
  await write('actual-continuation-state.json',{...c.state,selfObservation,final});
  const physical=await physicalEvent();assert.equal(physical.lockPresent,false);
  await write('positive-closed-resource-handoff.json',{status:'CLOSED',closeHandoff:c.state.closeHandoff,handoffDigest:c.hash(c.state.closeHandoff),physical,actualPublicCalls:c.state.calls.length});
  await write('driver-outcome.json',{status:'positive_path_completed',frontier,elapsedMs:performance.now()-began,
    actualPublicCalls:c.state.calls.length,newCompletedRuns:2,newFreshReads:4,reusedCompletedRuns:1,reusedFreshReads:2,
    newActorExchanges:0,realProviderCalls:0,final,closeHandoff:c.state.closeHandoff,processUsage:process.resourceUsage()});
}catch(error){
  let physical=null;try{physical=await physicalEvent();}catch(e){physical={observationError:String(e)};}
  await write('first-failure.json',{status:'stopped_first_failure',frontier,error:{name:error.name,message:error.message,stack:error.stack},
    elapsedMs:performance.now()-began,calls:c?.state.calls??[],latestActualClosedHandoff:c?.state.closeHandoff??null,
    physical,realProviderCalls:0,noRetry:true,noSourceRepair:true,processUsage:process.resourceUsage()});
  process.stderr.write(error.stack+'\n');process.exitCode=1;
}
