import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {getHeapStatistics} from 'node:v8';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {installedModules,publicCaller} from '../../operator-client/public-setup.mjs';
import {exclusiveRecord,commandRecorder,invokeColdInstalledEntry,eventResourceIdentity} from '../../operator-client/runner.mjs';
const A=dirname(fileURLToPath(import.meta.url)),member=process.argv[2],expected=process.argv[3],bytes=await readFile(join(A,'INPUT.json'));
assert.equal(createHash('sha256').update(bytes).digest('hex'),expected);
const input=JSON.parse(bytes),root=join(A,member);assert(input.members.includes(member));await mkdir(root);
const record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw),phases=[],start=performance.now();
const mark=phase=>phases.push({phase,at:new Date().toISOString(),offsetMs:performance.now()-start,memory:process.memoryUsage()});
assert(getHeapStatistics().heap_size_limit>=input.heapMiB*1024*1024);
await record('STARTED.json',{at:new Date().toISOString(),pid:process.pid,member,heapLimitBytes:getHeapStatistics().heap_size_limit,inputSha256:expected,automaticRetry:false});
try{
 for(const p of [input.sourceResume,input.actualReceipt,input.outcome]){const b=await readFile(p.path);assert.equal(b.length,p.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),p.sha256);}
 mark('input_pins_checked');
 const runtime=await installedModules(input.installedRoot),hash=runtime.product.sha256Canonical;
 const physical=await eventResourceIdentity(fileURLToPath(input.closeHandoff.prefix.eventLogRef));
 assert.equal(physical.byteCount,input.closeHandoff.prefix.prefixLength);assert.equal(physical.digest,input.closeHandoff.prefix.prefixDigest);assert.equal(physical.device,input.closeHandoff.prefix.storeIdentity.device);assert.equal(physical.inode,input.closeHandoff.prefix.storeIdentity.inode);
 mark('physical_prefix_checked');
 const prefix=runtime.abg.captureDurablePrefixCoordinate(input.closeHandoff.prefix),sameClose={...input.closeHandoff,prefix};
 assert.equal(hash(sameClose),hash(input.closeHandoff));
 const caller=publicCaller({root,runtime,native:input.native,config:input.config,record,command:commandRecorder(root,{environment:input.config.setupEnvironment,timeoutMs:input.timeoutMs,maxOutputBytes:input.maxOutputBytes}),actorRef:'actor://abiogenesis/operator/codex-root'});
 caller.installedRoot=input.installedRoot;caller.state.binding=input.binding;caller.state.closeHandoff=sameClose;
 mark('construct_run_read');
 const constructed=runtime.api.constructInstalledRunReadCall({memberKey:member,workspaceBinding:input.binding,sourceRef:input.run.ref,
 selector:member==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:4096}:{kind:'none'},eventResource:caller.reopen(),
 envelope:{definitionContractCoordinates:input.native.verified.definitionContractCoordinates,requestRef:'request://abi5-tests/sandbox-uat/'+input.config.runId+'/readback-recovery-001/'+member,correlationRef:'correlation://abi5-tests/sandbox-uat/'+input.config.runId,
 eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(input.provenancePath).href]}});
 assert.equal(constructed.kind,'installed_run_read_call');assert.deepEqual(constructed.population.source,input.run);
 mark('cold_installed_read');
 const observed=await invokeColdInstalledEntry(caller,member,constructed.call,{runtimeRoot:input.installedRoot,environment:input.config.setupEnvironment});
 assert.equal(observed.execution.timedOut,false);assert.equal(observed.execution.truncated,false);
 const output=observed.receipt.ownerOutput;
 if(member==='run_result'){assert.equal(observed.execution.exitCode,1);assert.equal(output.outcomeKind,'refusal');assert.equal(output.value?.code,'not_found');}
 else {assert.equal(observed.execution.exitCode,0);assert.equal(output.outcomeKind,'result');}
 mark('cold_read_returned');
 assert.equal(hash(caller.state.closeHandoff),hash(input.closeHandoff));assert.deepEqual(await eventResourceIdentity(fileURLToPath(prefix.eventLogRef)),physical);
 const ownerOutput=observed.receipt.ownerOutput,projection=ownerOutput.value?.projection;
 if(member==='run_replay'){assert(projection!==undefined);assert.equal(projection.terminalResult,null,'Unexpected terminal after original blocked/null return');}
 else assert.equal(projection,undefined);
 const selected={memberKey:member,projection,source:ownerOutput.value?.source,ownerOutput};await record('READ_RESULT.json',selected);
 await record('SUMMARY.json',{status:'ACTUAL_COLD_READ_RETAINED',member,source:selected.source,projectionKind:projection?.kind??null,projectionStatus:projection?.status??null,terminalPresent:projection?.terminalResult!=null,projectionDigest:projection===undefined?null:hash(projection),outcomeKind:ownerOutput.outcomeKind,refusalCode:ownerOutput.outcomeKind==='refusal'?ownerOutput.value.code:null,closeHandoff:caller.state.closeHandoff,physicalPrefixUnchanged:true,wallMs:performance.now()-start,phases});
 console.log(JSON.stringify({status:'ACTUAL_COLD_READ_RETAINED',member,projectionStatus:projection?.status??null,terminalPresent:projection?.terminalResult!=null,wallMs:performance.now()-start}));
}catch(e){await record('FAILURE.json',{at:new Date().toISOString(),name:e.name,message:String(e.message).slice(0,600),wallMs:performance.now()-start,phases});throw e;}
