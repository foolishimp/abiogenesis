// Thin external caller template for C07/Setup07 and future exact accepted Q09.
// Written under CONTROL_PREPARATION_ONLY; not imported or executed here.
// All Product imports and owner preparation are behind the Root input release.
import assert from 'node:assert/strict';
import {readFile,writeFile,appendFile,stat,open} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const write=(n,v)=>writeFile(join(here,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const sha=b=>createHash('sha256').update(b).digest('hex');
const start=performance.now();
let frontier='Root input release gate',c=null,packet=null,initialHandoff=null;
async function mark(name,details={}){
 frontier=name;
 await appendFile(join(here,'flow-progress.jsonl'),JSON.stringify({frontier,elapsedMs:performance.now()-start,memory:process.memoryUsage(),...details})+'\n');
}
async function pinnedJson(pin){
 let bytes=await readFile(pin.path);
 assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256);
 let text=bytes.toString('utf8');bytes=null;
 const value=JSON.parse(text);text=null;return value;
}
async function physicalEvent(){
 const plan=await read(join(here,'resource-plan.json')),before=await stat(plan.eventLogPath),hash=createHash('sha256');
 for await(const bytes of createReadStream(plan.eventLogPath))hash.update(bytes);
 const after=await stat(plan.eventLogPath);
 assert.deepEqual([before.dev,before.ino,before.size,before.mtimeMs],[after.dev,after.ino,after.size,after.mtimeMs]);
 const handle=await open(plan.eventLogPath,'r'),prefix=Buffer.alloc(plan.initialPrefixBytes);
 try{const {bytesRead}=await handle.read(prefix,0,prefix.length,0);assert.equal(bytesRead,prefix.length);}finally{await handle.close();}
 assert.equal(sha(prefix),plan.initialPrefixSha256,'original durable prefix remains byte-exact');
 assert.equal(after.dev,plan.eventDevice);assert.equal(after.ino,plan.eventInode);
 const lockPath=join(here,'task-tmp/abiogenesis-event-store-locks-v5',String(after.dev)+'-'+String(after.ino)+'.lock');
 let lockPresent=false;try{await stat(lockPath);lockPresent=true;}catch(error){if(error.code!=='ENOENT')throw error;}
 return {path:plan.eventLogPath,bytes:after.size,sha256:hash.digest('hex'),device:after.dev,inode:after.ino,lockPath,lockPresent,originalPrefixBytes:prefix.length,originalPrefixSHA256:sha(prefix),originalPrefixUnchanged:true};
}
try{
 const cfg=await read(join(here,'driver-config.json')),activation=await read(join(here,'runtime-activation.json'));
 assert.equal(activation.operation,'T287_F11_C07_CARRIER_EXECUTION_08');
 const release=await read(join(here,'runtime-release.json'));
 assert.equal(release.operation,activation.operation);
 assert.equal(release.RootSeparateMessageRelease,true,'file presence alone is not Root release');
 assert.equal(release.inputAcceptance.path,join(cfg.RootAcceptanceControlDirectory,'input-acceptance.json'));
 const inputAcceptance=await pinnedJson(release.inputAcceptance);
 await write('consumed-input-acceptance.json',{pin:release.inputAcceptance,RootSeparateMessage:release.RootMessage,actualAcceptance:inputAcceptance});
 const preparationBytes=await readFile(join(here,'freeze.json'));
 assert.equal(sha(preparationBytes),cfg.Q08FreezeSHA256);
 const preparation=JSON.parse(preparationBytes.toString('utf8'));
 assert.equal(preparation.status,'CLOSED');
 const members=new Map(preparation.records.map(r=>[r.path,r]));
 for(const copy of cfg.sourceCopies){const bytes=await readFile(copy.target);assert.equal(bytes.length,copy.bytes);assert.equal(sha(bytes),copy.sha256);}
 await mark('Root released exact input; published actual installed nominal verification');
 // The supervised process group exists before these first Product imports.
 const {loadRuntime}=await import('./f11/public-support.mjs');
 const {caller,verificationRequest}=await import('./f11/ordinary-caller.mjs');
 const identity=await read(join(here,'selected-core.json')),prospect=await read(join(here,'prospective-cases.json'));
 assert.equal(identity.installedRoot,cfg.currentInstalledRoot);
 const budgets=await read(join(here,'budgets.json'));
 const nominalStart=performance.now(),runtime=await loadRuntime(identity.installedRoot);
 const verificationPacket={kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(prospect.core)};
 let nominalTimer;
 const verification=await Promise.race([
  runtime.product.ProductVerificationPort.verify(verificationPacket),
  new Promise((_,reject)=>{nominalTimer=setTimeout(()=>reject(Error('nominal preflight exceeded its declared '+budgets.nominalPreflightMs+'ms caller budget')),budgets.nominalPreflightMs);}),
 ]).finally(()=>clearTimeout(nominalTimer));
 assert.ok(performance.now()-nominalStart<=budgets.nominalPreflightMs,'nominal phase bound before any Run preparation');
 assert.equal(verification.kind,'product_verification_success');
 assert.strictEqual(runtime.product.selectOwnedProductVerification(verificationPacket.request,verification.verifiedArtifact),verification.verifiedArtifact);
 assert.equal(verification.verifiedArtifact.productContentDigest,identity.basis.productContentDigest);
 await write('nominal-preflight-completion.json',{status:'passed',elapsedMs:performance.now()-nominalStart,completedAt:new Date().toISOString(),sameProcessOwnedObject:true,selectedActualAdmittedRoot:identity.installedRoot,productContentDigest:verification.verifiedArtifact.productContentDigest});
 const deadline=start+budgets.driverBudgetMs;
 c=await caller('flow',verification,deadline,here);
 await mark('load actual complete admitted setup; no setup operation');
 const setup=await read(cfg.actualSetupStateFile);
 assert.equal(setup.workspaceAuthority.authorizedActorRef,activation.actorRef);
 assert.equal(setup.items[0].install.installedRoot,identity.installedRoot);
 Object.assign(c.state,{closeHandoff:setup.closeHandoff,environment:setup.environment,catalog:setup.catalog,catalogView:setup.catalogView,binding:setup.binding,resolvedLock:setup.resolvedLock,calls:[]});
 initialHandoff=setup.closeHandoff;
 const plan=await read(join(here,'resource-plan.json'));
 const original=await readFile(plan.eventLogPath),physical=await stat(plan.eventLogPath);
 assert.equal(original.length,plan.initialPrefixBytes);assert.equal(sha(original),plan.initialPrefixSha256);
 assert.equal(physical.dev,plan.eventDevice);assert.equal(physical.ino,plan.eventInode);
 assert.equal(c.hash(initialHandoff),plan.initialHandoffDigest);
 await writeFile(join(here,'setup07-initial-durable-prefix.bin'),original,{flag:'wx'});
 await write('initial-resource-handoff.json',{closeHandoff:initialHandoff,handoffDigest:c.hash(initialHandoff),physical:{path:plan.eventLogPath,bytes:original.length,sha256:sha(original),device:physical.dev,inode:physical.ino},scope:'immutable initial prefix only; ABG alone may append after this cut'});
 c.refresh();
 await mark('load frozen packet and one separate immutable resource manifest');
 const pinFor=name=>{const r=members.get(name);assert.ok(r);return {path:join(cfg.Q08Root,name),bytes:r.bytes,sha256:r.sha256};};
 const rawPacket=await pinnedJson(pinFor('f11-bound-packet.json'));
 const manifest=await pinnedJson(pinFor(rawPacket.assertionManifestFile));
 assert.equal(manifest.resourceRef,rawPacket.assertionManifestRef);
 packet={...rawPacket,assertion:{kind:'qualification_resource_assertion',schemaVersion:'1',manifests:[manifest],declarationProofs:rawPacket.declarationProofs}};
 assert.equal(packet.assessmentInput.task.resource.ref,manifest.resourceRef);
 assert.equal(packet.assessmentInput.plan.ownerActorRef,activation.actorRef);
 await write('runtime-input-join.json',{packet:pinFor('f11-bound-packet.json'),manifest:pinFor(rawPacket.assertionManifestFile),task:{ref:packet.assessmentInput.task.taskRef,digest:packet.assessmentInput.task.taskDigest},plan:{ref:packet.assessmentInput.plan.planRef,digest:packet.assessmentInput.plan.planDigest},resource:packet.assessmentInput.task.resource,subjectBasis:packet.assessmentInput.task.subjectBasis,lawBasis:packet.assessmentInput.task.lawBasis,workspaceBinding:c.state.binding,catalogBasisDigest:c.state.catalog.basisDigest,viewDigest:c.state.catalogView.viewDigest,currentRootActor:activation.actorRef,rawCriteria:packet.raw.criteria.map(x=>({criterionRef:x.criterionRef,disposition:x.disposition,applicability:x.applicability,grouping:x.grouping})),independentAssessment:false});
 await mark('actual wrapper parent -> core assessment -> child foldback -> F11 -> sole AF22; six cold reads');
 const {runBoundExistingPrograms}=await import('./f11/flow-driver.mjs');
 const result=await runBoundExistingPrograms(c,packet,here,{parentSelection:activation.parentSelection});
 await write('actual-positive-flow-state.json',{...c.state,initialHandoff,observation:result.observation??null,selfObservation:result.selfObservation??null,final:result.final??null});
 if(result.status==='stopped')throw Error('actual selected whole path stopped at '+result.disposition+'; retained typed owner outcome; no fallback');
 await mark('complete mechanical positive path closed; semantic qualification remains non-green');
 const after=await physicalEvent();assert.equal(after.lockPresent,false);
 await write('positive-physical-conservation.json',after);
 await write('positive-closed-resource-handoff.json',{status:'CLOSED',closeHandoff:c.state.closeHandoff,handoffDigest:c.hash(c.state.closeHandoff),physical:after,originalPrefixUnchanged:true,actualPublicCalls:c.state.calls.length});
 await write('driver-outcome.json',{status:'positive_path_completed',frontier,elapsedMs:performance.now()-start,actualPublicCalls:c.state.calls.length,controlledExchanges:1,realProviderCalls:0,freshReads:6,final:result.final,closeHandoff:c.state.closeHandoff,processUsage:process.resourceUsage(),memory:process.memoryUsage(),claim:'mechanical installed transport/admission/consumption only; no green F11/AF22/release'});
}catch(error){
 let physical=null;try{physical=await physicalEvent();}catch(observationError){physical={observationError:String(observationError)};}
 await write('first-failure.json',{status:'stopped_first_failure',frontier,error:{name:error.name,message:error.message,stack:error.stack},elapsedMs:performance.now()-start,calls:c?.state.calls??[],latestActualClosedHandoff:c?.state.closeHandoff??initialHandoff,physical,realProviderCalls:0,noRetry:true,noSourceRepair:true,processUsage:process.resourceUsage(),memory:process.memoryUsage()});
 process.stderr.write(error.stack+'\n');process.exitCode=1;
}
