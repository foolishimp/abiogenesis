import assert from 'node:assert/strict';
import {readFile,writeFile,lstat,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {installedModules} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';
const root=fileURLToPath(new URL('.',import.meta.url)),repo='/Users/jim/src/apps/abiogenesis',campaign=join(repo,'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02');
const prior=join(campaign,'operator/installed-stopped-boundary-reproof-54'),json=async p=>JSON.parse(await readFile(p));
const record=(name,x)=>writeFile(join(root,name),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const hash=b=>'sha256:'+createHash('sha256').update(b).digest('hex'),t0=performance.now();
const mark=async(stage,data={})=>{const x={stage,at:new Date().toISOString(),wallMs:performance.now()-t0,memory:process.memoryUsage(),maxRSSKiB:process.resourceUsage().maxRSS,pid:process.pid,...data};await record(stage+'.json',x);console.log(JSON.stringify(x));};
let stage='prepare';
try {
 const inputs=await json(join(prior,'input-pins.json')),runtime=await installedModules(inputs.readerHostRoot),reader=await json(join(prior,'reader18-acquisition.json'));
 assert.equal(reader.verification.kind,'product_verification_success');assert.equal(reader.verification.verifiedArtifact.productContentDigest,'sha256:e4c213aeb707937298c71056f36506f415f2202137fa1c6df253f7cb345bd3a9');
 const closeBytes=await readFile(join(inputs.archive,'final-close-handoff.json'));assert.equal(hash(closeBytes),'sha256:544bd0a03f7b68d0758cf8d1fea67496997953f3b84c996258dd48c3f169e35d');
 const exitPath=join(prior,'owned-process-exit.json'),exitBytes=await readFile(exitPath);assert.equal(hash(exitBytes),'sha256:65b9b72e88952d7681e338c39a2624fb4430ca94f4043a98b180c6d7480c7a38');
 const lockPath='/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-event-store-locks-v5/16777231-467374253.lock';
 const lockStat=await lstat(lockPath),lockBytes=await readFile(lockPath);assert(lockStat.isFile()&&!lockStat.isSymbolicLink());assert.equal(lockBytes.length,124);assert.equal(hash(lockBytes),'sha256:684ceddbc1f4d96f3c0913fb0a0cedf80640a1589e1ad793f0a9038e7ea2d23d');
 let quiescent=false;try{process.kill(89743,0);}catch(e){assert.equal(e.code,'ESRCH');quiescent=true;}assert(quiescent);
 const before=await stat(fileURLToPath(inputs.selectedPrefix.eventLogRef),{bigint:true});assert.equal(before.dev,16777231n);assert.equal(before.ino,467374253n);assert.equal(before.size,1182449986n);assert.equal(String(before.mtimeNs),inputs.storeBefore.mtimeNs);
 const selection={lastCloseHandoff:JSON.parse(closeBytes),expectedCurrent:{byteLength:1182449986,digest:'sha256:9e3ee0a5a2a8480b6e7589ea36e1a43c91fb309834a8d3560f8c5cd74c096cc6'},abandonedLock:{path:lockPath,device:lockStat.dev,inode:lockStat.ino,bytesBase64:lockBytes.toString('base64'),digest:hash(lockBytes)}};
 const proof={at:new Date().toISOString(),ownerPid:89743,processProbe:'ESRCH',exclusiveMaintenance:true,lock:{...selection.abandonedLock,byteCount:124},interruption:{path:join(prior,'commands/run_replay.result.json'),digest:'sha256:03fea6e687ea44bb7b117b34b2a61932291c330a9af73e1f5966a8b0fa763abc'},quiescence:{path:exitPath,digest:hash(exitBytes)},log:{device:Number(before.dev),inode:Number(before.ino),byteCount:Number(before.size),mtimeNs:String(before.mtimeNs),prefixDigest:selection.expectedCurrent.digest}};
 await record('selection-before.json',proof);
 const request={kind:'abg_interrupted_event_resource_recovery',schemaVersion:'5.0.0',...selection,interruption:{ownerPid:89743,evidence:{ref:new URL('commands/run_replay.result.json','file://'+prior+'/').href,digest:proof.interruption.digest},quiescenceEvidence:{ref:new URL('owned-process-exit.json','file://'+prior+'/').href,digest:proof.quiescence.digest},exclusiveMaintenance:true},ownerArtifact:{request:reader.request,verified:reader.verification.verifiedArtifact}};
 const requestDigest=runtime.product.sha256Canonical(request),scope=runtime.abg.abgEventRecoveryScope(request),actorRef='actor://abiogenesis/T287/executive-root';
 const authorityValue={actorRef,authorityMode:'trusted_developer'},approvalValue={decision:'allow',actorRef,definitionRef:runtime.abg.ABG_EVENT_RESOURCE_RECOVERY.definitionRef,definitionDigest:runtime.abg.ABG_EVENT_RESOURCE_RECOVERY_DIGEST,requestDigest,scopeDigest:scope.digest};
 assert.equal(approvalValue.definitionRef,'native-maintenance://abiogenesis/event-resource/recover@5');
 const approval={kind:'resolved_admission_authority',schemaVersion:'5.0.0',actorRef,authorityMode:'trusted_developer',authority:{ref:'authority://abiogenesis/T287/executive-root/maintenance55',digest:runtime.product.sha256Canonical(authorityValue),value:authorityValue},approval:{ref:'approval://abiogenesis/T287/replay-abort-resource-recovery-55',digest:runtime.product.sha256Canonical(approvalValue),value:approvalValue}};
 await record('request.json',request);await record('scope.json',scope);await record('approval.json',approval);
 stage='sdk-recovery';await mark('sdk-recovery-start',{requestDigest,scopeDigest:scope.digest,ownerArtifactDigest:request.ownerArtifact.verified.artifactDigest,installedRoot:inputs.readerHostRoot});
 // Existing SDK performs executing-artifact verification, exact dead-owner/lock
 // checks, one full physical validation, adoption and ordinary close/release.
 const receipt=await runtime.abg.recoverInterruptedAbgEventResource(request,approval);await record('recovery-receipt.json',receipt);
 if(receipt.kind!=='abg_event_resource_recovery_receipt'||receipt.outcome.kind!=='recovered'){stage='sdk-refusal';await mark('sdk-refusal',{kind:receipt.kind,code:receipt.code??receipt.outcome?.code,message:receipt.message??receipt.outcome?.message});process.exitCode=1;}else{
 assert.equal(receipt.outcome.validatedEventCount,165617);assert.deepEqual(receipt.outcome.closeHandoff,selection.lastCloseHandoff);
 const after=await stat(fileURLToPath(inputs.selectedPrefix.eventLogRef),{bigint:true});assert.equal(after.dev,before.dev);assert.equal(after.ino,before.ino);assert.equal(after.size,before.size);assert.equal(after.mtimeNs,before.mtimeNs);
 let lockAbsent=false;try{await lstat(lockPath);}catch(e){assert.equal(e.code,'ENOENT');lockAbsent=true;}assert(lockAbsent);
 await record('conservation.json',{sameCloseHandoff:true,validatedEventCount:receipt.outcome.validatedEventCount,log:{path:fileURLToPath(inputs.selectedPrefix.eventLogRef),device:Number(after.dev),inode:Number(after.ino),byteCount:Number(after.size),digest:receipt.outcome.closeHandoff.prefix.prefixDigest,mtimeNs:String(after.mtimeNs)},digestEstablishedBy:'Exact SDK physical history validation/receipt; no second full log hash',selectedLockAbsent:true,noEventAppend:true,noReplayOrNativeWork:true});
 stage='complete';await mark('complete',{validatedEventCount:receipt.outcome.validatedEventCount,prefix:receipt.outcome.closeHandoff.prefix,selectedLockAbsent:true,receiptDigest:receipt.receiptDigest});
 }
}catch(error){await record('failure.json',{stage,name:error.name,message:error.message,stack:error.stack,at:new Date().toISOString(),wallMs:performance.now()-t0,memory:process.memoryUsage(),stop:'Firstfailure; no retry/direct lock removal'});console.error(JSON.stringify({stage,name:error.name,message:error.message,stack:error.stack}));process.exitCode=1;}
