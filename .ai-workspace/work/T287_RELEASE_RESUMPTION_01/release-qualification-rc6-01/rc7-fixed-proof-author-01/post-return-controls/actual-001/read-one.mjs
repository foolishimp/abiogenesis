// One actual pending cold read. Adapted from P3 read-one-r2.mjs.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {getHeapStatistics} from 'node:v8';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {installedModules,publicCaller} from '../../operator-client/public-setup.mjs';
import {exclusiveRecord,commandRecorder,invokeColdInstalledEntry,eventResourceIdentity} from '../../operator-client/runner.mjs';

const [inputPath,expected,member]=process.argv.slice(2),bytes=await readFile(inputPath);
const sha=b=>createHash('sha256').update(b).digest('hex');assert.equal(sha(bytes),expected);
const input=JSON.parse(bytes);assert(['run_result','run_replay'].includes(member)&&input.members.includes(member));
const root=join(dirname(inputPath),member);await mkdir(root);
const record=(path,value,raw=false)=>exclusiveRecord(root,path,value,raw),started=performance.now(),phases=[];
const mark=phase=>phases.push({phase,at:new Date().toISOString(),offsetMs:performance.now()-started,memory:process.memoryUsage()});
const filePin=async path=>{let size=0;const hash=createHash('sha256');for await(const chunk of createReadStream(path)){size+=chunk.length;hash.update(chunk);}return {path,bytes:size,sha256:hash.digest('hex')};};
assert.equal(input.heapMiB,8192);assert(getHeapStatistics().heap_size_limit>=8192*1024*1024);
await record('STARTED.json',{at:new Date().toISOString(),pid:process.pid,member,inputSha256:expected,heapLimitBytes:getHeapStatistics().heap_size_limit,automaticRetry:false});
let observed=null;
try{
 const runtime=await installedModules(input.installedRoot),hash=runtime.product.sha256Canonical;
 assert.equal(input.config.setupEnvironment.NODE_OPTIONS,'--max-old-space-size=8192');
 const physical=await eventResourceIdentity(fileURLToPath(input.closeHandoff.prefix.eventLogRef));
 assert.equal(physical.byteCount,input.closeHandoff.prefix.prefixLength);assert.equal(physical.digest,input.closeHandoff.prefix.prefixDigest);
 assert.equal(physical.device,input.closeHandoff.prefix.storeIdentity.device);assert.equal(physical.inode,input.closeHandoff.prefix.storeIdentity.inode);
 mark('physical_prefix_checked');
 const prefix=runtime.abg.captureDurablePrefixCoordinate(input.closeHandoff.prefix),sameClose={...input.closeHandoff,prefix};
 assert.equal(hash(sameClose),hash(input.closeHandoff));
 const caller=publicCaller({root,runtime,native:input.native,config:input.config,record,
  command:commandRecorder(root,{environment:input.config.setupEnvironment,timeoutMs:input.timeoutMs,maxOutputBytes:input.maxOutputBytes}),actorRef:'actor://abiogenesis/operator/codex-root'});
 caller.installedRoot=input.installedRoot;caller.state.binding=input.binding;caller.state.closeHandoff=sameClose;
 // No refresh. The exact captured owner coordinate goes into the existing API.
 const constructed=runtime.api.constructInstalledRunReadCall({memberKey:member,workspaceBinding:input.binding,sourceRef:input.run.ref,
  selector:member==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:4096}:{kind:'none'},eventResource:caller.reopen(),
  envelope:{definitionContractCoordinates:input.native.verified.definitionContractCoordinates,
   requestRef:'request://abi5-tests/sandbox-uat/'+input.config.runId+'/rc7-fixed-proof-author-01-post-return/'+member,
   correlationRef:'correlation://abi5-tests/sandbox-uat/'+input.config.runId,eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(input.provenancePath).href]}});
 assert.equal(constructed.kind,'installed_run_read_call');assert.deepEqual(constructed.population.source,input.run);
 mark('cold_installed_read');
 observed=await invokeColdInstalledEntry(caller,member,constructed.call,{runtimeRoot:input.installedRoot,environment:input.config.setupEnvironment});
 assert.equal(observed.execution.timedOut,false);assert.equal(observed.execution.truncated,false);assert.equal(observed.execution.signal,null);assert.equal(observed.execution.failure,null);
 const owner=observed.receipt?.ownerOutput,projection=owner?.value?.projection,terminal=projection?.terminalResult??null;
 const outputPin=await filePin(join(root,'calls',member+'.outcome.json'));
 // New summaries reference the existing full call artifact only. The unchanged
 // canonical recorder retains its legacy stdout/result JSON copies; this control
 // does not clone that owner or claim those retained costs have been removed.
 mark('cold_read_returned');
 assert.equal(hash(caller.state.closeHandoff),hash(input.closeHandoff));
 assert.deepEqual(await eventResourceIdentity(fileURLToPath(prefix.eventLogRef)),physical);
 let relation;
 if(input.expectedTerminal!==null){
  const expectedTerminal=input.expectedTerminal;
  assert.equal(owner?.outcomeKind,'result','Typed original terminal requires a successful owner read');assert.equal(observed.execution.exitCode,0);
  assert(runtime.abg.isAbgTypedTerminalResult(terminal));assert.deepEqual(owner.value.source,input.run);assert.deepEqual(projection.subject,input.run);
  assert.equal(hash(terminal.value),terminal.valueDigest);assert.deepEqual(terminal.result,expectedTerminal.result);assert.deepEqual(terminal.contract,expectedTerminal.contract);
  assert.equal(terminal.valueKind,expectedTerminal.valueKind);assert.equal(terminal.valueDigest,expectedTerminal.valueDigest);
  assert.equal(hash(terminal.producer),expectedTerminal.producerDigest);assert.equal(hash(terminal.value),expectedTerminal.valueCanonicalDigest);
  assert.equal(hash(terminal),expectedTerminal.terminalDigest,'Full original typed terminal must agree');relation='FULL_TYPED_TERMINAL_EQUAL';
 }else{
  assert.equal(terminal,null,'Actual original return had no terminal');
  if(member==='run_result'){assert.equal(owner?.outcomeKind,'refusal');assert.equal(owner.value?.code,'not_found');assert.equal(observed.execution.exitCode,1);assert.equal(projection,undefined);}
  else{assert.equal(owner?.outcomeKind,'result');assert.equal(observed.execution.exitCode,0);assert(projection);assert.deepEqual(owner.value.source,input.run);assert.deepEqual(projection.subject,input.run);assert.equal(projection.terminalResult,null);}
  relation='ACTUAL_ABSENT_TERMINAL_AGREEMENT_NOT_TASK_SUCCESS';
 }
 const summary={status:'ACTUAL_COLD_READ_RETAINED',member,relation,ownerOutput:outputPin,sourceExecution:input.sourceExecution,originalOutcome:input.sourceOutcome,
  source:owner?.value?.source??null,outcomeKind:owner?.outcomeKind??null,refusalCode:owner?.outcomeKind==='refusal'?owner.value.code:null,
  projectionKind:projection?.kind??null,projectionStatus:projection?.status??null,terminalPresent:terminal!==null,
  terminalDigest:terminal===null?null:hash(terminal),closeDigest:hash(input.closeHandoff),physicalPrefixUnchanged:true,wallMs:performance.now()-started,phases,
  qualified:false,meaning:'Exact owner-read relation only; source review, affected proof and Root disposition remain separate.'};
 await record('SUMMARY.json',summary);console.log(JSON.stringify({status:summary.status,member,relation,output:outputPin,wallMs:summary.wallMs}));
}catch(error){
 const outputPath=join(root,'calls',member+'.outcome.json');let output=null;try{output=await filePin(outputPath);}catch{}
 await record('FAILURE.json',{at:new Date().toISOString(),name:error.name,message:String(error.message).slice(0,800),member,ownerOutput:output,
  outcomeKind:observed?.receipt?.ownerOutput?.outcomeKind??null,refusalCode:observed?.receipt?.ownerOutput?.value?.code??null,
  status:'READ_UNSATISFIED_OR_REFUSAL_PRESERVED',wallMs:performance.now()-started,phases,automaticRetry:false});throw error;
}
