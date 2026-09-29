import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {dirname,join,basename} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const here=dirname(fileURLToPath(import.meta.url)),base=here,read=async p=>JSON.parse(await readFile(p,'utf8')),save=(n,v)=>writeFile(join(here,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'}),hash=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
assert.deepEqual(process.argv.slice(2),['--dispatch-once'],'Execute only after explicit Executive dispatch selection.');
const readiness=await read(join(here,'launch-readiness.json')),provider=await read(join(here,'provider.json')),controls=await read(join(here,'controls.json')),setup=await read(join(base,'setup.json')),caseReady=await read(join(base,'readiness.json')),start=await read(join(base,'start-prepared.json')),input=await read(join(base,'input.json')),initial=await read(join(base,'handoff-before-start.json'));
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
// Read-only cold projections may expose the first failure, but never resume work.
if(receipt.resources.run){const readback=await import('./readback.mjs');await readback.readback();}
const terminal=parents.at(-1),commands=results.filter(e=>e.graphFunctionRef===product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef&&e.payload.resultClass==='success'),authors=results.filter(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef&&e.payload.resultClass==='success'),assessment=results.findLast(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef&&e.payload.resultClass==='success');
try{
 assert.equal(receipt.ownerOutput.outcomeKind,'result');assert.equal(receipt.ownerOutput.value.disposition,'completed');assert.equal(terminal?.payload.value.terminal,true);assert.ok(terminal.payload.value.fulfillment.coverage.every(r=>r.disposition==='eligible'&&r.assessmentResultRef===assessment?.payload.resultRef));
 assert.ok(commands.length>=2);assert.ok(commands[0].payload.value.task.sourceObservedInput);assert.ok(commands[0].payload.value.commandResults.some(r=>r.exitStatus!==0));const corrected=authors.find(e=>e.payload.value.changedPaths.includes('generated/hello-world.mjs'));assert.ok(corrected&&commands[0].admissionOrdinal<corrected.admissionOrdinal);
 for(const path of caseReady.absentAssets)assert.ok(authors.some(e=>e.payload.value.changedPaths.includes(path)&&e.payload.value.before.entries.some(r=>r.relativePath===path&&r.state==='absent'))&&effects[path].bytes>0,path);
 for(const source of input.original.sources)assert.equal(effects[source.path].sha256,source.digest,source.path);
 for(const parent of parents)assert.deepEqual(parent.payload.value.original,input.original);
 const last=commands.at(-1).payload.value;assert.ok(last.commandResults.every(r=>r.exitStatus===0));assert.equal(Buffer.from(last.commandResults[0].stdout.payload,'base64').toString(),'Hello, world!\n');const testOutput=Buffer.from(last.commandResults[1].stdout.payload,'base64').toString();assert.match(testOutput,/pass 2/);assert.match(testOutput,/fail 0/);
 for(const actor of actors){assert.equal(actor.command,provider.executable);assert.equal(actor.args[actor.args.indexOf('--model')+1],provider.requestedModel);assert.equal(actor.args[actor.args.indexOf('--effort')+1],provider.requestedEffort);assert.ok(!actor.args.includes('--fallback-model'));assert.ok(actor.reportedModels.length>0&&actor.reportedModels.every(m=>m===provider.requestedModel));}
 await save('outcome.json',{completed:true,parentEvent:terminal.eventId,assessmentEvent:assessment.eventId,baselineEvent:commands[0].eventId,correctionEvent:corrected.eventId,finalCommandEvent:commands.at(-1).eventId,runClosureEvents:events.filter(e=>e.kind==='run_closed').map(e=>e.eventId),sourceFreeze:readiness.sourceFreeze});
}catch(error){await save('first-failure.json',{stage:'outcome',message:String(error),ownerOutput:receipt.ownerOutput,sourceFreeze:readiness.sourceFreeze});throw error;}
console.log(JSON.stringify({completed:true,wallMs,nativeMs,frameworkOutsideNativeMs:wallMs-nativeMs}));
