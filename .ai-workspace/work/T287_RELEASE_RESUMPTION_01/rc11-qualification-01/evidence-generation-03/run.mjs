import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {spawn} from 'node:child_process';
import {finished} from 'node:stream/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {config,controlRoot,checkInputs,json,save,pin,load,snapshot,sha,childEnvironment} from './common.mjs';
const mode=process.argv[2];assert.ok(['native-assessment','selected-action'].includes(mode),'select exactly one population');
await checkInputs();
assert.equal(process.env.RC11_EVIDENCE_ADMISSION,config.admissionToken,'Root must supply exact execution admission token after reviewing controls');
await fs.mkdir(join(controlRoot,'raw'),{recursive:true});await fs.mkdir(join(controlRoot,'generated'),{recursive:true});
const output=join(controlRoot,'raw',mode);await fs.mkdir(output,{recursive:false});
const runtimeTmp=join(output,'tmp');await fs.mkdir(runtimeTmp,{recursive:false});
const environment=childEnvironment(runtimeTmp);process.env.TMPDIR=runtimeTmp;
const script=mode==='native-assessment'?join(controlRoot,'native-host.mjs'):join(config.tenant,'test_env/support/t287-selected-action-host.mjs');
if(mode==='native-assessment')environment.ABG_TS_CLAUDE_COMMAND=join(controlRoot,'malformed-actor.mjs');
else{environment.ABI5_SELECTED_ACTION_EVIDENCE_ROOT=output;delete environment.ABG_TS_CLAUDE_COMMAND;}
const args=mode==='native-assessment'?[script,output]:[script];
const stdout=createWriteStream(join(output,'stdout.log'),{flags:'wx'}),stderr=createWriteStream(join(output,'stderr.log'),{flags:'wx'});
let child=null,timedOut=false,killTimer=null,timer=null,childFinished=false;const signals=[],started=performance.now();
try{
 child=spawn(config.nodeExecutable,args,{cwd:output,env:environment,detached:true,stdio:['ignore','pipe','pipe']});
 assert.ok(Number.isSafeInteger(child.pid)&&child.pid>0);child.stdout.pipe(stdout);child.stderr.pipe(stderr);
 const exitPromise=new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',(code,signal)=>{childFinished=true;resolve({code,signal});});});
 // Attach rejection immediately while recording launch, then await the same outcome.
 void exitPromise.catch(()=>{});
 const signal=sig=>{try{process.kill(-child.pid,sig);signals.push({signal:sig,atMs:performance.now()-started,scope:'exact spawned process group'});}catch(error){if(error.code!=='ESRCH')throw error;}};
 timer=setTimeout(()=>{timedOut=true;signal('SIGTERM');killTimer=setTimeout(()=>signal('SIGKILL'),config.signalGraceMs);},config.absoluteTimeoutMs);
 await save(join(output,'LAUNCH.json'),{mode,pid:child.pid,pgid:child.pid,executable:config.nodeExecutable,args,script:await pin(script),runtimeTmp,absoluteTimeoutMs:config.absoluteTimeoutMs,signalGraceMs:config.signalGraceMs,startedUtc:new Date().toISOString(),sourceCommit:config.sourceCommit,archiveSha256:config.archiveSha256});
 const exit=await exitPromise;
 clearTimeout(timer);if(killTimer)clearTimeout(killTimer);await Promise.all([finished(stdout),finished(stderr)]);
 let groupAbsent=false;try{process.kill(-child.pid,0);}catch(error){if(error.code==='ESRCH')groupAbsent=true;else throw error;}
 await save(join(output,'HOST_TERMINATION.json'),{...exit,pid:child.pid,pgid:child.pid,timedOut,signals,groupAbsent,wallMs:performance.now()-started});
 assert.equal(timedOut,false,'outer timeout: preserve effect uncertainty; no retry or automatic wider cleanup');assert.equal(groupAbsent,true,'owned host group still present');
 if(mode==='native-assessment'){assert.equal(exit.code,0,'native host failure; see preserved FAILURE/stdout/stderr');assert.equal(exit.signal,null);const result=await json(join(output,'GENERATION.json'));assert.equal(result.status,'generated_current_owner_snapshot');}
 else{
  assert.equal(exit.code,null);assert.equal(exit.signal,'SIGKILL','existing host must stop only at retained selected boundary');
  const observerFailure=await json(join(output,'observer-failure.json')).catch(e=>{if(e.code==='ENOENT')return null;throw e;});assert.equal(observerFailure,null,JSON.stringify(observerFailure));
  const e=await json(join(output,'environment.json')),opened=await json(join(output,'opened.json')),interruption=await json(join(output,'interruption.json')),origin=await json(join(output,'initial-origin.json'));
  assert.equal(interruption.processId,child.pid);assert.equal(origin.ownerPid,child.pid);assert.equal(interruption.selectionCount,2);
  const store=await load(e.installedRoot,'abg/event_store'),prefixOwner=await load(e.installedRoot,'abg/event_prefix'),owner=await load(e.installedRoot,'abg/construction_continuation');
  assert.equal((await json(join(e.installedRoot,'package.json'))).version,'5.0.0-rc.10');
  const eventLogPath=origin.initialOrigin.newResourceRequest.eventLogPath;assert.ok(eventLogPath.startsWith(runtimeTmp+'/'),'only this attempt scratch event store');
  const bytes=await fs.readFile(eventLogPath);assert.deepEqual(bytes,await fs.readFile(join(output,'interrupted-prefix.jsonl')));
  const physical=origin.initialOrigin,lockPath=join(runtimeTmp,'abiogenesis-event-store-locks-v5',`${physical.device}-${physical.inode}.lock`),lock=await fs.stat(lockPath),lockBytes=await fs.readFile(lockPath);
  const selection={...origin,expectedCurrent:{byteLength:bytes.length,digest:'sha256:'+sha(bytes)},abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:'sha256:'+sha(lockBytes)}};
  await save(join(output,'recovery-selection.json'),selection);
  const recovery=store.recoverInterruptedEventStore(selection);await save(join(output,'recovery.json'),recovery);assert.equal(recovery.kind,'recovered',JSON.stringify(recovery));
  const handoff=recovery.closeHandoff;const physicalRows=store.readRuntimeEventsAtDurablePrefix(handoff.prefix);const after=await fs.readFile(eventLogPath);assert.deepEqual(after,bytes,'recovery preserves original runtime bytes');
  const decoded=store.validateHistoricalEvents(bytes,handoff.prefix.storeIdentity.eventContractDigest);assert.deepEqual(decoded,physicalRows);const prefix=prefixOwner.selectValidatedRuntimeEventPrefix(decoded);
  const actual=owner.projectSelectedActionContinuations(prefix,opened.scope.runId).at(-1);assert.ok(actual);assert.equal(actual.status,'open');assert.equal(actual.openedEventRef,interruption.selectedEvent.eventId);assert.equal(actual.executionBasisRef,e.executionBasis.basisRef);assert.equal(actual.executionBasisDigest,e.executionBasis.basisDigest);
  assert.equal(decoded.some(r=>r.kind==='c_call_opened'&&r.runId===actual.runId&&r.payload.cursorRef===actual.heldCursorRef),false,'no pending child dispatch');
  const fixture={population:'selected-action',eventContractDigest:handoff.prefix.storeIdentity.eventContractDigest,eventCount:decoded.length,runId:opened.scope.runId,opened,actual,basis:{ref:actual.executionBasisRef,digest:actual.executionBasisDigest},externalEvidence:{environment:await pin(join(output,'environment.json')),interruption:await pin(join(output,'interruption.json')),recovery:await pin(join(output,'recovery.json')),hostTermination:await pin(join(output,'HOST_TERMINATION.json'))},proofClass:'real fixed RC10 internal installed setup and HoG selection; exact captured historical pending boundary; physical third case not selected'};
  const generated=await snapshot(bytes,fixture,join(controlRoot,'generated/selected-action'));
  await save(join(output,'GENERATION.json'),{status:'generated_current_owner_snapshot',generated,ownerRecoveryClosed:true,physicalReadMatched:true,paidProviderCalls:0,optionalPhysicalThirdCase:false});
 }
 await save(join(output,'RETURN.json'),{status:'population_generated_pending_Root_acceptance',mode,wallMs:performance.now()-started,generation:await pin(join(output,'GENERATION.json')),hostTermination:await pin(join(output,'HOST_TERMINATION.json')),candidateStaging:false});
}catch(error){
 // Only the exact launched group is signalled on control failure. Detached actor
 // groups may exist: never infer complete descendant closure from this cleanup.
 if(child&&!childFinished){try{process.kill(-child.pid,'SIGTERM');signals.push({signal:'SIGTERM',atMs:performance.now()-started,scope:'exact spawned group after control failure'});}catch(e){if(e.code!=='ESRCH')signals.push({signal:'SIGTERM',error:String(e)});}await new Promise(r=>setTimeout(r,config.signalGraceMs));if(!childFinished)try{process.kill(-child.pid,'SIGKILL');signals.push({signal:'SIGKILL',atMs:performance.now()-started,scope:'exact spawned group after control failure'});}catch(e){if(e.code!=='ESRCH')signals.push({signal:'SIGKILL',error:String(e)});}}
 if(timer)clearTimeout(timer);if(killTimer)clearTimeout(killTimer);
 await save(join(output,'CONTROL_FAILURE.json'),{mode,message:error.message,stack:error.stack,pid:child?.pid??null,timedOut,signals,wallMs:performance.now()-started,standing:'Stopped; preserve files, outstanding physical/runtime ownership and old failed subjects. No auto retry, candidate staging or acceptance.'});throw error;
}
