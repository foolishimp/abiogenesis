// Granted external failed-Run readback only. The supervisor establishes this
// process group before any installed Product import. No Run or helper dispatch.
import assert from 'node:assert/strict';
import {readFile,writeFile,appendFile,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),start=performance.now();
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const write=(n,v)=>writeFile(join(here,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
let frontier='verify granted readback inputs',c=null,before=null;
async function mark(name,details={}){frontier=name;await appendFile(join(here,'readback-progress.jsonl'),JSON.stringify({frontier,elapsedMs:performance.now()-start,memory:process.memoryUsage(),...details})+'\n');}
async function physical(){
 const p=await read(join(here,'resource-plan.json')),a=await stat(p.eventLogPath),h=createHash('sha256');
 for await(const bytes of createReadStream(p.eventLogPath))h.update(bytes);
 const b=await stat(p.eventLogPath),digest=h.digest('hex');
 assert.deepEqual([a.dev,a.ino,a.size,a.mtimeMs],[b.dev,b.ino,b.size,b.mtimeMs]);
 assert.equal(b.dev,p.eventDevice);assert.equal(b.ino,p.eventInode);
 assert.equal(b.size,p.initialPrefixBytes);assert.equal(digest,p.initialPrefixSha256);
 const lockPath=join(here,'task-tmp/abiogenesis-event-store-locks-v5',String(b.dev)+'-'+String(b.ino)+'.lock');
 let lockPresent=false;try{await stat(lockPath);lockPresent=true;}catch(e){if(e.code!=='ENOENT')throw e;}
 assert.equal(lockPresent,false);
 return {path:p.eventLogPath,bytes:b.size,sha256:digest,device:b.dev,inode:b.ino,mtimeMs:b.mtimeMs,mode:b.mode&0o777,lockPath,lockPresent};
}
async function conserved(name){const row=await physical();assert.deepEqual(row,before);await write(name,row);return row;}
try{
 const cfg=await read(join(here,'driver-config.json')),activation=await read(join(here,'runtime-activation.json')),budgets=await read(join(here,'budgets.json'));
 assert.equal(activation.operation,'T287_F11_CALLER_REPAIR_AND_FAILED_READBACK_01');
 assert.equal(cfg.operation,activation.operation);assert.equal(process.env.HOME,cfg.HOME);
 assert.equal(process.versions.node,'24.7.0');assert.equal(process.execPath,cfg.node.path);
 for(const key of ['NODE_OPTIONS','NODE_PATH','V8_OPTIONS','ABG_TS_CLAUDE_COMMAND','ABG_TS_GEMINI_COMMAND','ABG_TS_CODEX_COMMAND'])assert.equal(process.env[key],undefined,key+' must not add a heap/provider route');
 const handoffBytes=await readFile(cfg.authenticHandoff.path);assert.equal(handoffBytes.length,cfg.authenticHandoff.bytes);assert.equal(sha(handoffBytes),cfg.authenticHandoff.sha256);
 const authentic=JSON.parse(handoffBytes.toString('utf8'));assert.equal(authentic.status,'CLOSED_AUTHENTIC_FAILED_RUN');
 assert.deepEqual(await read(join(here,'authentic-closed-handoff.json')),authentic);
 before=await physical();await write('physical-before.json',before);
 await mark('one current C05 same-process nominal check; no Runtime admission');
 const {loadRuntime}=await import('./f11/public-support.mjs');
 const {caller,verificationRequest}=await import('./f11/ordinary-caller.mjs');
 const identity=await read(join(here,'selected-core.json')),prospect=await read(join(here,'prospective-cases.json')),r=await loadRuntime(identity.installedRoot);
 const packet={kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(prospect.core)};
 const nominalStart=performance.now();let timer;
 const verification=await Promise.race([r.product.ProductVerificationPort.verify(packet),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('nominal check exceeded its declared bound')),budgets.nominalPreflightMs);})]).finally(()=>clearTimeout(timer));
 assert.equal(verification.kind,'product_verification_success');
 assert.strictEqual(r.product.selectOwnedProductVerification(packet.request,verification.verifiedArtifact),verification.verifiedArtifact);
 assert.equal(verification.verifiedArtifact.productContentDigest,identity.basis.productContentDigest);
 await write('nominal-preflight-completion.json',{status:'passed',elapsedMs:performance.now()-nominalStart,sameProcessOwnedObject:true,selectedActualAdmittedRoot:identity.installedRoot,productContentDigest:verification.verifiedArtifact.productContentDigest,heap:'default; unchanged',HOME:process.env.HOME});
 c=await caller('failed-readback',verification,start+budgets.driverBudgetMs,here);
 let setupBytes=await readFile(cfg.actualSetupStateFile);assert.equal(setupBytes.length,cfg.setupStatePin.bytes);assert.equal(sha(setupBytes),cfg.setupStatePin.sha256);
 let setup=JSON.parse(setupBytes.toString('utf8'));setupBytes=null;
 assert.equal(setup.workspaceAuthority.authorizedActorRef,activation.actorRef);
 assert.equal(setup.items[0].install.installedRoot,identity.installedRoot);
 // Select already admitted environment/binding only. Catalog/View and the
 // qualification resource manifest are unnecessary for these root projections.
 Object.assign(c.state,{closeHandoff:authentic.closeHandoff,environment:setup.environment,binding:setup.binding,resolvedLock:setup.resolvedLock,calls:[]});setup=null;
 assert.equal(c.hash(c.state.closeHandoff),authentic.handoffDigest);c.refresh();
 const receipt=await read(join(here,'retained-parent-host-receipt.json')),transport=await read(join(here,'retained-parent-transport.json')),timing=await read(join(here,'retained-parent-timing.json')),invocation=await read(join(here,'retained-parent-invocation.json'));
 assert.deepEqual(transport.receipt,receipt);assert.equal(invocation.invocationRef,receipt.invocationRef);
 assert.deepEqual(receipt.ownerOutput.value.run,cfg.expectedRun);
 const {classifyInstalledOutcome,requirePublicResult}=await import('./f11/public-outcomes.mjs');
 const {positiveRunRoute}=await import('./f11/flow-driver.mjs');
 const actualDisposition=classifyInstalledOutcome({transport,terminal:timing.terminal,call:{invocation},installedPublic:c.installedPublic});
 const retained={call:{invocation},receipt,disposition:actualDisposition};
 await mark('pure stop routing against authentic retained parent receipt');
 const route=positiveRunRoute(c,retained);
 assert.equal(actualDisposition.kind,'result');assert.equal(receipt.exitCode,0);
 assert.equal(route.status,'stopped');assert.equal(route.disposition,'runtime_failed');assert.equal(route.terminalResult,null);
 assert.equal(route.qualification,false);assert.equal(c.state.calls.length,0);
 await write('actual-failed-run-stop-regression.json',{status:'passed',actualRetainedParentInvocationRef:receipt.invocationRef,route,actualPublicOutcome:'result',actualRunDisposition:'runtime_failed',positiveAdvancementPermitted:false,actualFreshCallsBeforeDiagnostic:0,noFakeJudgmentOrSemanticPass:true,qualificationResourcesLoaded:false});
 await conserved('physical-after-pure-stop-regression.json');
 await mark('fresh installed root run_result diagnostic; expected typed not_found refusal');
 const result=await c.freshRead('failed',retained,'run_result','refusal');
 assert.equal(result.disposition.kind,'refusal');assert.equal(result.receipt.exitCode,1);
 assert.equal(result.receipt.ownerOutput.outcomeKind,'refusal');assert.equal(result.receipt.ownerOutput.value.code,'not_found');
 assert.deepEqual(Object.keys(result.call.resources).sort(),['eventResource','kind','schemaVersion']);
 await conserved('physical-after-run-result.json');
 await mark('fresh installed root run_replay diagnostic; expected failed replay');
 const replay=await c.freshRead('failed',retained,'run_replay','result'),value=requirePublicResult(replay);
 assert.equal(replay.receipt.exitCode,0);assert.deepEqual(value.source,cfg.expectedRun);
 assert.equal(value.projection.status,'failed');assert.equal(value.projection.terminalResult,null);
 assert.deepEqual(value.projection.replay,receipt.ownerOutput.value.replay);
 assert.deepEqual(Object.keys(replay.call.resources).sort(),['eventResource','kind','schemaVersion']);
 await conserved('physical-after-run-replay.json');
 await mark('bind cold projection to complete retained causal failure/foldback/stopped prefix');
 const events=c.abg.readRuntimeEventsAtDurablePrefix(c.state.closeHandoff.prefix),native=events.filter(e=>e.runId===cfg.expectedRun.ref);
 const one=(kind,predicate=()=>true)=>{const rows=native.filter(e=>e.kind===kind&&predicate(e));assert.equal(rows.length,1,'one authentic '+kind);return rows[0];};
 const fold=one('child_foldback_admitted'),stop=one('run_stopped');
 assert.equal(fold.payload.childDisposition,'failed');assert.equal(fold.payload.childClosureRef,null);assert.equal(stop.payload.disposition,'failed');
 const childRoute=one('traversal_route_admitted',e=>e.eventId===fold.payload.childTerminalEventRef);
 const parentRoute=one('traversal_route_admitted',e=>e.eventId===stop.causationEventRefs[0]);
 const childResult=one('c_call_result_admitted',e=>e.graphCallId===fold.payload.childGraphCallId);
 const childJudgment=one('c_call_judged',e=>e.payload.judgmentRef===fold.payload.childJudgmentRef);
 const parentResult=one('c_call_result_admitted',e=>e.aggregateId===fold.payload.parentCCallRef);
 const parentJudgment=one('c_call_judged',e=>e.payload.judgmentRef===stop.payload.judgmentRef);
 assert.ok(childResult.admissionOrdinal<childJudgment.admissionOrdinal&&childJudgment.admissionOrdinal<childRoute.admissionOrdinal&&childRoute.admissionOrdinal<fold.admissionOrdinal&&fold.admissionOrdinal<parentResult.admissionOrdinal&&parentResult.admissionOrdinal<parentJudgment.admissionOrdinal&&parentJudgment.admissionOrdinal<parentRoute.admissionOrdinal&&parentRoute.admissionOrdinal<stop.admissionOrdinal);
 const byRef=new Map(events.map(e=>[e.eventId,e]));
 for(const event of native)for(const ref of event.causationEventRefs){assert.ok(byRef.has(ref));assert.ok(byRef.get(ref).admissionOrdinal<event.admissionOrdinal);}
 assert.equal(native.filter(e=>e.kind==='run_closed'||e.kind==='graph_call_closed').length,0);
 assert.deepEqual(c.state.closeHandoff,authentic.closeHandoff);assert.equal(c.state.calls.length,2);
 const selected=[childResult,childJudgment,childRoute,fold,parentResult,parentJudgment,parentRoute,stop];
 await write('retained-causal-failure-correspondence.json',{status:'passed',prefix:c.state.closeHandoff.prefix,run:cfg.expectedRun,completeRunEventCount:native.length,allCausationReferencesResolveEarlier:true,childFailureResult:fold.payload.childResultRef,childFailureJudgment:fold.payload.childJudgmentRef,foldbackDisposition:fold.payload.childDisposition,parentFailureJudgment:stop.payload.judgmentRef,stopEvent:stop.eventId,closedGraphCalls:0,runClosed:0,terminalResult:null,qualificationJudgmentProduced:false,selectedNativeEvents:selected,completeOrderedNativeEventRoster:native.map(e=>({eventId:e.eventId,ordinal:e.admissionOrdinal,kind:e.kind,graphCallId:e.graphCallId,aggregateId:e.aggregateId,causationEventRefs:e.causationEventRefs}))});
 const after=await conserved('physical-final.json');
 await write('closed-event-resource-handoff.json',{status:'CLOSED_AUTHENTIC_FAILED_RUN_UNCHANGED',closeHandoff:c.state.closeHandoff,handoffDigest:c.hash(c.state.closeHandoff),physical:after,actualFreshCLIReadCalls:c.state.calls,appendBytes:0,newTask:0,newRun:0,helperCalls:0,providerCalls:0,qualification:false});
 await write('driver-outcome.json',{status:'failed_run_readback_passed',actualRunRemains:'failed',frontier,elapsedMs:performance.now()-start,nominalChecks:1,actualFreshCLIReads:2,result:{outcome:'refusal',code:'not_found',exitCode:1},replay:{outcome:'result',status:'failed',terminalResult:null,exitCode:0},positiveStopRegression:'passed',qualificationResourcesLoaded:false,appendBytes:0,newTask:0,newRun:0,helperCalls:0,providerCalls:0,fullQualification:false,processUsage:process.resourceUsage(),memory:process.memoryUsage()});
}catch(error){
 let current=null;try{current=await physical();}catch(observationError){current={observationError:String(observationError)};}
 await write('first-failure.json',{status:'stopped_first_failure',frontier,error:{name:error.name,message:error.message,stack:error.stack},elapsedMs:performance.now()-start,calls:c?.state.calls??[],latestActualClosedHandoff:c?.state.closeHandoff??null,physical:current,before,providerCalls:0,helperCalls:0,noRetry:true,noAutoRepair:true,processUsage:process.resourceUsage(),memory:process.memoryUsage()});
 process.stderr.write(error.stack+'\n');process.exitCode=1;
}
