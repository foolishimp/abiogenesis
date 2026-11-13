// Root-only one-shot fresh native development start. No retained source or recovery credit.
import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
const assertSame=(actual,expected,message='Operator identity mismatch')=>assert(isDeepStrictEqual(actual,expected),message);
import {readFile,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {dir,sha,json,pinned,loadSetup,runtimeEnvironment,selectProcessEnvironment,checkInstalled,checkDependency} from './setup-state.mjs';
const root=join(dir,'execution');assert.equal(process.argv.length,3,'usage: node dispatch.mjs MANIFEST_SHA256');
const raw=await readFile(join(root,'PREPARATION_MANIFEST.json'));assert.equal(sha(raw),process.argv[2]);const m=JSON.parse(raw);assert.equal(m.kind,'rc4_fresh_native_frozen_dispatch');assert.equal(m.status,'PREPARED_NOT_DISPATCHED');assert.equal(m.sourceBasis,'none');
try{await lstat(join(root,'STARTED.json'));throw Error('Already started; no retry')}catch(e){if(e.code!=='ENOENT')throw e;}
for(const r of m.files)await pinned(r);
const {selection,retained,workload:w,profile,local}=await loadSetup(m.callPreparationBinding.sha256);assert(process.env.CLAUDE_CODE_OAUTH_TOKEN,'Selected credential unavailable');
const {installedModules,publicCaller}=await import(pathToFileURL(local[0]).href);
const {exclusiveRecord,commandRecorder,workerEnvironment,invokeLifecycle,freshReadbacks}=await import(pathToFileURL(local[1]).href);
const assembled=runtimeEnvironment(profile,workerEnvironment,retained);selectProcessEnvironment(assembled.environment);
const runtime=await installedModules(retained.installedRoot),record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw);
const caller=publicCaller({root,runtime,native:retained.native,command:commandRecorder(root,{environment:assembled.environment,timeoutMs:profile.outerTimeoutMs,maxOutputBytes:536870912}),record,config:assembled.config,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
const call=await json(join(root,'prepared-call.json'));assert.equal(runtime.product.sha256Canonical(call),m.callCanonicalDigest);assert.equal(call.resources.source.kind,'none');assert.equal(call.invocation.request.sourceBasis.kind,'none');assertSame(call.invocation.request.input.value,await json(join(root,'input.json')));assertSame(call.invocation.request.input.value.observations,[]);assert.equal(call.invocation.request.input.value.synthesis,null);
const actorOwner=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')).href);assertSame(actorOwner.selectedWorksiteCommandAmbientEnvironment(),m.ambientEnvironment);
const authority=caller.refresh(),observed=await runtime.product.observeWorksiteContext({workspaceAuthorityBasis:authority.workspaceAuthorityBasis,workspaceBinding:authority.workspaceBinding,protectedInstallRoots:authority.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});if(observed.kind!=='worksite_context_observation'){const error=new Error('Dispatch worksite observation refused');error.observation=observed;throw error;}assert.equal(observed.observationDigest,m.contextDigest,'Current worksite changed after preflight');
// Existing operator stays immutable. Guard each actual return before a later helper can dereference it.
const invoke=caller.invoke;caller.invoke=async(...args)=>{const result=await invoke(...args);const handoff=result.receipt?.resources?.eventResource?.closeHandoff??null;if(handoff===null){await record('null-resource-return.json',{label:args[0],receipt:result.receipt??null,exitCode:result.execution.exitCode});throw Error('Actual call returned no handoff; no resume or readback may use stale caller state');}assertSame(caller.state.closeHandoff,handoff);assert(result.receipt.ownerOutput,'Missing typed owner output');return result;};
await record('STARTED.json',{startedUtc:new Date().toISOString(),pid:process.pid,sourceBasis:'none',sourceCommit:m.sourceCommit,eventPrefix:m.eventPrefix,initialObservations:call.invocation.request.input.value.observations.length,RuntimeTMPDIR:profile.runtimeEnvironment.TMPDIR,providerCommand:profile.provider.command,profile:m.profile,automaticRetry:false,pendingFrontierRecovery:false,R2Closure:false,qualification:false});
try{
 const execution=await invokeLifecycle(caller,retained.setup.installations,call,assembled.environment);await record('execution.json',execution);
 const receipt=execution.receipt;assert(receipt?.resources?.eventResource?.closeHandoff,'No genuine runtime return');
 await record('outcome-summary.json',{ended:new Date().toISOString(),exitCode:execution.execution.exitCode,outcomeKind:receipt.ownerOutput.outcomeKind,disposition:receipt.ownerOutput.value?.disposition??null,run:receipt.resources.run??null,terminal:receipt.ownerOutput.value?.terminalResult??null,qualification:false,R2Closure:false,meaning:'Fresh native development; actual Testing/UAT and R1–R5 evidence determine outcome. No recovery or qualification credit follows merely from dispatch.'});
 if(receipt.resources.run!==null&&receipt.resources.run!==undefined){const reads=await freshReadbacks(caller,execution);await record('fresh-reads.json',reads);}
 else await record('fresh-reads.json',{status:'NOT_ATTEMPTED_NO_ACTUAL_RUN_COORDINATE',ownerOutput:receipt.ownerOutput});
 await checkInstalled(selection);await record('offline-dependency-after-run.json',await checkDependency(selection));await record('after-run-resume.json',{...retained,state:caller.state});
 console.log(JSON.stringify({status:'returned_actual_resources',outcomeKind:receipt.ownerOutput.outcomeKind,record:root}));
}catch(error){await record('offline-dependency-after-fault.json',await checkDependency(selection));await record('dispatch-failure.json',{at:new Date().toISOString(),name:error.name,message:error.message,observation:error.observation??null,currentResumeWritten:false,classification:'Actual fault/refusal retained; no old handoff substitution, fabricated terminal or retry'});throw error;}
