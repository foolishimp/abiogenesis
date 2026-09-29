import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {dirname,join,basename} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const base=dirname(fileURLToPath(import.meta.url)),phase=process.argv[3],here=join(base,phase??'invalid'),read=async p=>JSON.parse(await readFile(p,'utf8')),save=(n,v)=>writeFile(join(here,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'}),hash=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
assert.ok(process.argv[2]==='--dispatch-once'&&['first','fresh'].includes(phase)&&process.argv.length===4,'Explicit Executive dispatch required for exactly one selected phase.');await mkdir(here,{recursive:true});
const readiness=await read(join(base,'launch-readiness.json')),provider=await read(join(base,'provider.json')),controls=await read(join(base,'controls.json')),setup=await read(join(base,'setup.json')),caseReady=await read(join(base,'readiness.json')),start=await read(join(phase==='first'?base:here,'start-prepared.json')),input=await read(join(base,'input.json')),initial=await read(join(phase==='first'?base:here,'handoff-before-start.json'));
for(const [path,id]of Object.entries(readiness.sources))assert.equal(hash(await readFile(join(base,path))),id.sha256,path);
assert.equal(hash(await readFile(provider.executable)),provider.sha256);assert.equal(hash(await readFile(readiness.helper.path)),readiness.helper.sha256);
for(const value of [controls.actor.timeout,controls.actor.absolute,controls.actor.grace])assert.equal(process.env[value.environmentKey]??null,value.inherited,value.environmentKey);
assert.equal(process.env.ABG_TS_WORKER_SANDBOX??null,controls.transport.sandboxEnvironment);
const load=p=>import(pathToFileURL(join(setup.installedRoots[0],'build/code/src',p+'.js')).href),product=await load('product/index'),store=await load('abg/event_store');
const before=store.readRuntimeEventsAtDurablePrefix(initial.prefix).length;
const requestPath=join(here,'start-request.jsonl'),request={kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:initial},invocation:start.call};
await writeFile(requestPath,JSON.stringify(request)+'\n',{flag:'wx'});await save('dispatch-start.json',{startedAt:new Date().toISOString(),provider,sourceFreeze:readiness.sourceFreeze,beforeEventCount:before});
// One established installed CLI transport call. Preserve stdout/stderr before
// parsing/assertion, including a malformed/refusing first response. No retry.
const started=performance.now();let observed;
try{observed=await promisify(execFile)(process.execPath,[join(setup.installedRoots[0],'build/code/src/public/cli.js'),'--jsonl',requestPath],{cwd:setup.scratch,env:{...process.env,ABG_TS_CLAUDE_COMMAND:provider.executable,ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(provider.appendArgs)},maxBuffer:controls.cli.maxBufferBytes});}
catch(error){observed={stdout:error.stdout??'',stderr:error.stderr??'',error:{name:error.name,message:error.message,code:error.code??null,signal:error.signal??null}};}
const wallMs=performance.now()-started;await writeFile(join(here,'cli.stdout'),observed.stdout,{flag:'wx'});await writeFile(join(here,'cli.stderr'),observed.stderr,{flag:'wx'});
await copyFile(fileURLToPath(initial.prefix.eventLogRef),join(here,'events.jsonl'));
let output;try{output=JSON.parse(observed.stdout.trim());}catch(error){await save('first-failure.json',{stage:'public-response',wallMs,error:observed.error??{message:String(error)}});throw error;}
const execution={wallMs,requestPath,cliPath:join(setup.installedRoots[0],'build/code/src/public/cli.js'),error:observed.error??null,output};await save('execution.json',execution);
const receipt=output.receipt,handoff=receipt?.resources?.eventResource?.closeHandoff;
if(!handoff){await save('first-failure.json',{stage:'missing-close-handoff',wallMs,output});throw new Error('No returned exact durable source; raw first response and event log preserved.');}
await save('handoff.json',handoff);const events=store.readRuntimeEventsAtDurablePrefix(handoff.prefix).slice(before),results=events.filter(e=>e.kind==='c_call_result_admitted'),bindings=events.filter(e=>e.kind==='actor_transport_binding_admitted'),actors=[];
for(const [i,b]of bindings.entries()){
 await save(`assembly-${i+1}.json`,b.payload.instructionAssembly);const retained=[];
 for(const [role,path]of Object.entries(b.payload.paths))if(typeof path==='string'){try{const destination=`actor-${i+1}-${role}-${basename(path)}`;await copyFile(path,join(here,destination));retained.push({role,path:destination,sha256:hash(await readFile(path))});}catch(error){if(error.code!=='ENOENT')throw error;retained.push({role,absent:true});}}
 const began=events.find(e=>e.kind==='actor_invocation_started'&&e.parentAggregateId===b.parentAggregateId),ended=events.find(e=>['actor_invocation_closed','actor_invocation_failed'].includes(e.kind)&&e.parentAggregateId===b.parentAggregateId);
 let rows=[];try{const stdout=await readFile(b.payload.paths.stdoutPath??b.payload.paths.stdout,'utf8');rows=stdout.trim().split('\n').filter(Boolean).map(s=>JSON.parse(s));}catch{}
 actors.push({actor:i+1,bindingEvent:b.eventId,command:b.payload.command,args:b.payload.args,timeoutMs:b.payload.timeoutMs,absoluteTimeoutMs:b.payload.absoluteTimeoutMs,terminationGraceMs:b.payload.terminationGraceMs,nativeIntervalMs:began&&ended?Date.parse(ended.eventTime)-Date.parse(began.eventTime):null,promptBytes:Buffer.byteLength(b.payload.instructionAssembly.request.prompt),reportedModels:[...new Set(rows.flatMap(r=>[r.model,r.message?.model,...Object.keys(r.modelUsage??{})]).filter(Boolean))],reportedUsage:rows.filter(r=>r.type==='result').map(r=>({totalCostUsd:r.total_cost_usd??null,usage:r.usage??null,modelUsage:r.modelUsage??null})),retained});
}
const effects={};for(const path of input.original.readRoots){try{const bytes=await readFile(join(caseReady.worksite,path));await mkdir(dirname(join(here,'worksite-result',path)),{recursive:true});await writeFile(join(here,'worksite-result',path),bytes,{flag:'wx'});effects[path]={bytes:bytes.length,sha256:hash(bytes)};}catch(error){if(error.code!=='ENOENT')throw error;effects[path]={absent:true};}}
await save('effects.json',effects);
const synthesis=results.filter(e=>e.payload.value?.kind==='framed_synthesis_result'),choices=results.filter(e=>e.payload.value?.kind==='registered_graph_choice'),parents=results.filter(e=>e.graphFunctionRef==='graph-function://default-library-witness/executive@5'&&e.payload.value?.kind==='governance_work_state');
await save('synthesis-chain.json',synthesis.map(e=>{const choice=choices.find(c=>c.payload.value.input?.value?.synthesis?.resultRef===e.payload.resultRef||c.payload.value.disposition==='gap'&&c.payload.value.evidenceRefs.includes(e.payload.resultRef)),fold=results.find(r=>r.payload.value?.kind==='governance_work_state'&&r.payload.value.observations.at(-1)?.synthesisResultRef===e.payload.resultRef),observation=fold?.payload.value.observations.at(-1),child=observation?results.find(r=>r.payload.resultRef===observation.resultRef&&r.aggregateId===observation.cCallRef):null;return {synthesisEvent:e.eventId,synthesisOrdinal:e.admissionOrdinal,resultRef:e.payload.resultRef,basis:e.payload.value.basis,judgment:e.payload.value.judgment,choiceEvent:choice?.eventId??null,childEvent:child?.eventId??null,childResultRef:observation?.resultRef??null,childGraphFunction:child?.graphFunctionRef??null,foldEvent:fold?.eventId??null,parentEvent:parents.find(p=>fold&&p.admissionOrdinal>fold.admissionOrdinal)?.eventId??null};}));
const nativeMs=actors.every(a=>a.nativeIntervalMs!==null)?actors.reduce((sum,a)=>sum+a.nativeIntervalMs,0):null;
await save('timing.json',{priorSetupMs:caseReady.setupMs,executionMs:wallMs,nativeMs,frameworkOutsideNativeMs:nativeMs===null?null:wallMs-nativeMs,requestBytes:(await readFile(requestPath)).length,eventCount:events.length,actors});
// Preserve both cold reads before any expected-frontier assertion.
if(receipt.resources.run){const reads=await import('./readback.mjs');await reads.readback(phase);}
const terminal=parents.at(-1),commands=results.filter(e=>e.graphFunctionRef===product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef&&e.payload.resultClass==='success'),assessment=results.findLast(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef&&e.payload.resultClass==='success');
try {
 for(const source of input.original.sources)assert.equal(effects[source.path].sha256,source.digest,source.path);
 for(const actor of actors){assert.equal(actor.command,provider.executable);assert.equal(actor.args[actor.args.indexOf('--model')+1],provider.requestedModel);assert.equal(actor.args[actor.args.indexOf('--effort')+1],provider.requestedEffort);assert.ok(!actor.args.includes('--fallback-model'));assert.ok(actor.reportedModels.length>0&&actor.reportedModels.every(m=>m===provider.requestedModel));}
 if(phase==='first'){
  assert.ok(commands.length>=1,'actual measurement producer required');assert.ok(commands.every(c=>c.payload.value.commandResults.every(r=>r.exitStatus===0)),'supplied candidate measurement must pass');
  assert.equal(assessment,undefined,'missing assessment input must prevent actual assessment');assert.equal(effects[caseReady.missingAssessmentInput].absent,true);
  const failed=results.find(e=>e.payload.resultClass!=='success'),selection=failed&&events.find(e=>e.kind==='c_call_fibre_selected'&&e.aggregateId===failed.aggregateId);
  assert.equal(selection?.payload.implementationRef,product.governanceRef('implementation','prepare-native'),'first unexpected frontier returns for triage');
  assert.equal(failed?.graphFunctionRef,product.governanceRef('graph-function','uat'));
  assert.notEqual(terminal?.payload.value.terminal,true);await save('expected-frontier.json',{failedResult:failed,selectedImplementation:selection,producerResultRefs:commands.map(e=>e.payload.resultRef),missingInput:caseReady.missingAssessmentInput,meaning:'physical missing assessment-only input; failed Run remains historical; no automatic successor'});
 } else {
  const source=await read(join(here,'source-result-basis.json'));
  assert.equal(receipt.ownerOutput.outcomeKind,'result');assert.equal(receipt.ownerOutput.value.disposition,'completed');assert.equal(terminal?.payload.value.terminal,true);assert.ok(assessment);
  assert.ok(source.sourceResultValue.observations.some(o=>o.resultRef===assessment.payload.value.task.assessment.producer.resultRef&&o.cCallRef===assessment.payload.value.task.assessment.producer.cCallRef&&o.actorInvocationRef===assessment.payload.value.task.assessment.producer.actorInvocationRef),'actual assessment uses prior producer identity');
  assert.notEqual(assessment.payload.value.provenance.actorInvocationRef,assessment.payload.value.task.assessment.producer.actorInvocationRef);assert.equal(commands.length,0,'no producer reexecution merely for current provenance');
  for(const parent of parents)assert.deepEqual(parent.payload.value.original,input.original);
  await save('outcome.json',{completed:true,assessmentEvent:assessment.eventId,parentEvent:terminal.eventId,priorProducer:assessment.payload.value.task.assessment.producer,runClosureEvents:events.filter(e=>e.kind==='run_closed').map(e=>e.eventId),claim:'new ordinary invocation, not exact execution recovery'});
 }
}catch(error){await save('first-failure.json',{stage:'outcome',message:String(error),ownerOutput:receipt.ownerOutput,phase});throw error;}
console.log(JSON.stringify({phase,expectedOutcome:true,wallMs,nativeMs,frameworkOutsideNativeMs:wallMs-nativeMs}));
