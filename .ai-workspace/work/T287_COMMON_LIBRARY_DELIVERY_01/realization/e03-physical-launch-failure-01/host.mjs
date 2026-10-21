import assert from 'node:assert/strict';
import { appendFileSync, writeFileSync, readFileSync, existsSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { createHash } from 'node:crypto';

const base=import.meta.dirname;
const config=JSON.parse(readFileSync(join(base,'config.json'),'utf8'));
const inputs=JSON.parse(readFileSync(join(base,'prepared-inputs.json'),'utf8'));
const preflight=JSON.parse(readFileSync(join(base,'preflight.json'),'utf8'));
const evidence=config.evidenceRoot;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const errorIds=new WeakMap();let nextError=0,sequence=0,currentCase='host';
const events=[],attempts=[],completed=[];
const errorValue=error=>{
 if(!errorIds.has(error))errorIds.set(error,++nextError);
 return {errorId:errorIds.get(error),name:error.name,message:error.message,code:error.code??null,errno:error.errno??null,
  syscall:error.syscall??null,path:error.path??null,spawnargs:error.spawnargs??null,stack:error.stack??null};
};
const normalized=value=>{
 if(value instanceof Error)return errorValue(value);
 if(typeof value==='bigint')return value.toString();
 if(value===undefined)return null;
 if(Buffer.isBuffer(value))return {kind:'buffer',bytes:value.length,sha256:sha(value),...(value.length<=1024?{base64:value.toString('base64')}:{})};
 if(Array.isArray(value))return value.map(normalized);
 if(value!==null&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,normalized(item)]));
 return value;
};
const log=value=>{
 const row=normalized({sequence:++sequence,monotonicNs:process.hrtime.bigint(),case:currentCase,...value});
 events.push(row);appendFileSync(join(evidence,'events.jsonl'),JSON.stringify(row)+'\n');return row;
};
const save=(name,value)=>writeFileSync(join(evidence,name),JSON.stringify(normalized(value),null,2)+'\n',{flag:'wx'});
const streamState=stream=>stream===null?null:{destroyed:stream.destroyed,closed:stream.closed,readable:stream.readable,writable:stream.writable,
 readableEnded:stream.readableEnded,writableEnded:stream.writableEnded,writableFinished:stream.writableFinished,writableLength:stream.writableLength,
 errorListeners:stream.listenerCount('error'),closeListeners:stream.listenerCount('close')};
const childState=child=>({pid:child.pid??null,pidWasUndefined:child.pid===undefined,exitCode:child.exitCode,signalCode:child.signalCode,
 killed:child.killed,spawnfile:child.spawnfile,spawnargs:child.spawnargs,
 childErrorListeners:child.listenerCount('error'),childCloseListeners:child.listenerCount('close'),
 stdin:streamState(child.stdin),stdout:streamState(child.stdout),stderr:streamState(child.stderr)});
const actualSpawn=childProcess.spawn;
const actualKill=process.kill;
const rawEmitter=(emitter,label,attempt)=>{
 const original=emitter.emit;
 emitter.emit=function(event,...args){
  if(['spawn','error','exit','close','finish','end','data','drain'].includes(event)){
   if(event==='error'&&label==='child')attempt.childErrors.push(args[0]);
   log({event:'emitter',emitter:label,eventName:event,args,errorListenerCount:this.listenerCount('error'),pid:attempt.child.pid??null});
  }
  return Reflect.apply(original,this,[event,...args]);
 };
};
const observeStreamMethod=(stream,method,label)=>{
 if(stream===null)return;
 const original=stream[method];
 stream[method]=function(...args){
  const input=typeof args[0]==='string'?Buffer.from(args[0]):Buffer.isBuffer(args[0])?args[0]:null;
  log({event:'stream-method-call',stream:label,method,inputBytes:input?.length??0,inputSha256:input===null?null:sha(input),
   suppliedError:args[0] instanceof Error?args[0]:null,before:streamState(this)});
  try {const returned=Reflect.apply(original,this,args);log({event:'stream-method-return',stream:label,method,returnedSameStream:returned===this,after:streamState(this)});return returned;}
  catch(error){log({event:'stream-method-throw',stream:label,method,error,after:streamState(this)});throw error;}
 };
};
childProcess.spawn=function(...args){
 log({event:'actual-spawn-call',command:args[0],args:args[1],options:args[2]});
 const child=Reflect.apply(actualSpawn,this,args);
 const attempt={case:currentCase,child,childErrors:[]};attempts.push(attempt);
 rawEmitter(child,'child',attempt);
 for(const name of ['stdin','stdout','stderr'])if(child[name]!==null){
  rawEmitter(child[name],name,attempt);observeStreamMethod(child[name],'destroy',name);
 }
 if(child.stdin!==null)observeStreamMethod(child.stdin,'end','stdin');
 log({event:'actual-spawn-return',state:childState(child)});return child;
};
syncBuiltinESMExports();
process.kill=function(...args){log({event:'actual-process-kill-call',args});return Reflect.apply(actualKill,this,args);};
process.on('uncaughtExceptionMonitor',(error,origin)=>log({event:'uncaughtExceptionMonitor',origin,error}));
process.on('exit',code=>log({event:'host-exit',code,pid:process.pid}));
const turn=()=>new Promise(resolve=>setImmediate(resolve));
const load=name=>import(pathToFileURL(join(preflight.frozenTenant,'build/code/src',name+'.js')).href);
const observations=()=>({
 onProcessStarted:pid=>log({event:'owner-process-started',pid}),
 onSpawnFailed:message=>log({event:'owner-spawn-failed',message}),
 onProcessExited:(status,signal)=>log({event:'owner-process-exited',status,signal}),
 onSignalRequested:signal=>log({event:'owner-signal-requested',signal}),
 onTimeoutObserved:timeoutClass=>log({event:'owner-timeout',timeoutClass}),
 onTerminationUnconfirmed:()=>log({event:'owner-unconfirmed'})
});
const commonCheck=(name,record)=>{
 const rows=attempts.filter(a=>a.case===name);assert.equal(rows.length,1);
 assert.equal(rows[0].child.pid,undefined);
 const ownEvents=events.filter(row=>row.case===name);
 assert.equal(ownEvents.filter(row=>row.event==='emitter'&&row.eventName==='spawn').length,0);
 assert.equal(ownEvents.filter(row=>row.event==='owner-process-started'||row.event==='direct-spawn').length,0);
 assert.equal(ownEvents.filter(row=>row.event==='emitter'&&row.emitter==='child'&&row.eventName==='exit').length,0);
 assert.equal(ownEvents.filter(row=>row.event==='uncaughtExceptionMonitor').length,0);
 assert.equal(rows[0].childErrors.length,1);assert.equal(rows[0].childErrors[0].code,'ENOENT');
 assert.equal(record.ownerOutcome.kind,'fulfilled');
 assert.equal(existsSync(config.absentExecutable),false);
 return rows[0];
};
const closeCase=(name,record,check)=>{
 save(name+'-actual.json',record);
 check();
 const decision={case:name,status:'passed',observedEvents:events.filter(row=>row.case===name).length,actualFile:name+'-actual.json'};
 save(name+'-decision.json',decision);completed.push(decision);log({event:'host-survived-owner-settlement',case:name,pid:process.pid});
};
try {
 assert.equal(process.execPath,config.nodeExecutable);assert.equal(process.version,'v24.7.0');assert.equal(process.platform,'darwin');
 assert.equal(realpathSync(config.scratchRoot),config.scratchRoot);assert.equal(realpathSync(evidence),evidence);
 assert.equal(existsSync(config.absentExecutable),false);
 const executionFreeze=JSON.parse(readFileSync(join(base,'execution-freeze.json'),'utf8'));
 for(const row of executionFreeze.files)assert.equal(sha(readFileSync(join(base,row.path))),row.sha256,row.path);
 const prompt=config.promptCharacter.repeat(config.promptByteLength);
 assert.equal(Buffer.byteLength(prompt),inputs.prompt.bytes);assert.equal(sha(prompt),inputs.prompt.sha256);
 log({event:'host-start',pid:process.pid,node:process.version,platform:process.platform,inputsSha256:sha(readFileSync(join(base,'prepared-inputs.json')))});

 currentCase='worker';
 const worker=await load('abg/worker_transport');
 let workerOutcome;
 try{workerOutcome={kind:'fulfilled',value:await worker.runWorkerTransport({contract:inputs.contract,prompt,...inputs.worker,observer:observations()})};}
 catch(error){workerOutcome={kind:'rejected',error};}
 log({event:'owner-settled',outcome:workerOutcome});await turn();
 const workerAttempt=attempts.find(a=>a.case==='worker');
 const workerRecord={case:'worker',ownerOutcome:workerOutcome,child:workerAttempt===undefined?null:childState(workerAttempt.child),
  events:events.filter(row=>row.case==='worker'),prompt:inputs.prompt};
 closeCase('worker',workerRecord,()=>{
  const attempt=commonCheck('worker',workerRecord),value=workerOutcome.value;
  const failed=events.filter(row=>row.case==='worker'&&row.event==='owner-spawn-failed');assert.equal(failed.length,1);
  assert.equal(failed[0].message,attempt.childErrors[0].message);
  assert.equal(value.disposition,'failure');assert.equal(value.failureClass,'transport_failure');
  assert.equal(value.status,null);assert.equal(value.signal,null);assert.equal(value.exitObserved,false);assert.equal(value.terminationConfirmed,false);
  assert.equal(value.timedOut,false);assert.equal(value.timeoutClass,null);assert.equal(value.finalOutput,'');
  const archivedPrompt=readFileSync(join(inputs.worker.archiveRoot,'failed-spawn-prompt.txt'));
  assert.equal(archivedPrompt.length,inputs.prompt.bytes);assert.equal(sha(archivedPrompt),inputs.prompt.sha256);
 });

 currentCase='command';
 const helperPath=preflight.helperExposure.original.path;
 const helperSource=await readFile(join(base,'exposed-helper.js.txt'),'utf8');
 assert.equal(sha(helperSource),preflight.helperExposure.exposed.sha256);
 const priorListeners=new Map(['SIGTERM','SIGINT'].map(signal=>[signal,process.listeners(signal)]));
 const module=new SourceTextModule(helperSource,{identifier:helperPath});
 await module.link(async specifier=>{
  const imported=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(helperPath),specifier)).href);
  return new SyntheticModule(Object.keys(imported),function(){for(const [key,value]of Object.entries(imported))this.setExport(key,value);});
 });
 await module.evaluate();assert.equal(typeof module.namespace.runCommand,'function');
 log({event:'helper-exposure-ready',sourceSha256:sha(helperSource),signalListenerCounts:Object.fromEntries(['SIGTERM','SIGINT'].map(s=>[s,process.listenerCount(s)]))});
 let commandOutcome;
 try{commandOutcome={kind:'fulfilled',value:await module.namespace.runCommand(inputs.command.task,inputs.command.executionRoot,inputs.command.ordinal,inputs.command.attemptRef)};}
 catch(error){commandOutcome={kind:'rejected',error};}
 log({event:'owner-settled',outcome:commandOutcome});await turn();
 const commandAttempt=attempts.find(a=>a.case==='command');
 const commandRecord={case:'command',ownerOutcome:commandOutcome,child:commandAttempt===undefined?null:childState(commandAttempt.child),events:events.filter(row=>row.case==='command')};
 for(const [signal,prior]of priorListeners)for(const listener of process.listeners(signal))if(!prior.includes(listener))process.removeListener(signal,listener);
 log({event:'helper-signal-listeners-restored',counts:Object.fromEntries(['SIGTERM','SIGINT'].map(s=>[s,process.listenerCount(s)]))});
 closeCase('command',commandRecord,()=>{
  const attempt=commonCheck('command',commandRecord),value=commandOutcome.value;
  assert.equal(value.exitStatus,127);assert.equal(value.timedOut,false);assert.equal(value.processSignal,null);assert.equal(value.terminationConfirmed,true);
  assert.deepEqual([...value.signalSequence],[]);
  assert.equal(Buffer.from(value.stderr.payload,'base64').toString('utf8'),attempt.childErrors[0].message);
  assert.equal(Buffer.from(value.stdout.payload,'base64').length,0);assert.equal(value.reportCount,0);
 });

 currentCase='direct';
 const {createOwnedProcessLifetime}=await load('shared/owned_process_lifetime');
 const directChild=childProcess.spawn(inputs.direct.command,inputs.direct.args,inputs.direct.options);
 const lifetime=createOwnedProcessLifetime(directChild,{terminationGraceMs:inputs.direct.terminationGraceMs},{
  onSpawn:pid=>log({event:'direct-spawn',pid}),onError:error=>log({event:'direct-launch-error',error}),
  onExit:(status,signal)=>log({event:'direct-exit',status,signal}),onSignalRequested:signal=>log({event:'direct-signal-requested',signal}),
  onUnconfirmed:()=>log({event:'direct-unconfirmed'})
 });
 let stdinSynchronousError=null;
 try{directChild.stdin.end(prompt);}catch(error){stdinSynchronousError=error;lifetime.fail(error);}
 const facts=await lifetime.completion;
 log({event:'direct-completion',facts});await turn();
 const directAttempt=attempts.find(a=>a.case==='direct');
 const directRecord={case:'direct',ownerOutcome:{kind:'fulfilled',value:facts},child:childState(directChild),stdinSynchronousError,
  launchFailureIsOriginalChildError:facts.launchFailure===directAttempt.childErrors[0],publicationFacts:facts,
  afterTurnSnapshot:lifetime.snapshot(),events:events.filter(row=>row.case==='direct'),prompt:inputs.prompt};
 closeCase('direct',directRecord,()=>{
  commonCheck('direct',directRecord);assert.equal(stdinSynchronousError,null);
  assert.equal(facts.launchFailure?.code,'ENOENT');assert.equal(facts.launchFailure,directAttempt.childErrors[0]);
  assert.equal(facts.firstError,null);assert.equal(facts.noChildEstablished,true);assert.equal(facts.directExit,null);assert.equal(facts.scopeAbsence,'absent');
  assert.equal(facts.signalAttempts,0);
 });
 currentCase='host';
 assert.equal(completed.length,3);assert.equal(events.filter(row=>row.event==='uncaughtExceptionMonitor').length,0);
 save('host-result.json',{status:'bounded_failed_spawn_population_passed',completed,hostPid:process.pid,
  actualSpawnCalls:attempts.length,actualChildPids:attempts.map(a=>a.child.pid??null),
  limit:'Separate direct attempt supplies its own common facts; no internal worker/command facts inferred from outer results. Observed stream errors retained; no every-early-close rejection claim.'});
 log({event:'host-all-cases-complete',completed:completed.length});
 console.log(JSON.stringify({status:'bounded_failed_spawn_population_passed',cases:completed.map(row=>row.case)}));
}catch(error){
 log({event:'first-unexpected-failure',error});
 save('first-failure.json',{case:currentCase,error,completed,attempts:attempts.map(a=>({case:a.case,state:childState(a.child)})),events});
 console.error(error);process.exitCode=1;
}finally{
 childProcess.spawn=actualSpawn;syncBuiltinESMExports();process.kill=actualKill;
}
