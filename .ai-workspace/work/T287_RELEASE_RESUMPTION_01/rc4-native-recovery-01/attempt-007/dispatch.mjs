// Root-only one-shot fresh retained-work start. Not run.continue or R2 proof.
import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {dir,sha,json,pinned,loadSetup,runtimeEnvironment,selectProcessEnvironment,checkInstalled} from './setup-state.mjs';
const root=join(dir,'execution');assert.equal(process.argv.length,3,'usage: node dispatch.mjs MANIFEST_SHA256');
const raw=await readFile(join(root,'PREPARATION_MANIFEST.json'));assert.equal(sha(raw),process.argv[2]);const m=JSON.parse(raw);assert.equal(m.kind,'rc4_retained_work_frozen_dispatch');assert.equal(m.status,'PREPARED_NOT_DISPATCHED');assert.equal(m.sourceBasis,'admitted_source_result');
try{await lstat(join(root,'STARTED.json'));throw Error('Already started; no retry')}catch(e){if(e.code!=='ENOENT')throw e;}
for(const r of m.files)await pinned(r);
const {selection,retained,workload:w,profile,local,sourceBasis,historicalSource}=await loadSetup(m.callPreparationBinding.sha256);assert(process.env.CLAUDE_CODE_OAUTH_TOKEN,'Selected credential unavailable');
const {installedModules,publicCaller}=await import(pathToFileURL(local[0]).href);
const {exclusiveRecord,commandRecorder,workerEnvironment,invokeLifecycle,freshReadbacks}=await import(pathToFileURL(local[1]).href);
const assembled=runtimeEnvironment(profile,workerEnvironment,retained);selectProcessEnvironment(assembled.environment);
const runtime=await installedModules(retained.installedRoot),record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw);
const caller=publicCaller({root,runtime,native:retained.native,command:commandRecorder(root,{environment:assembled.environment,timeoutMs:profile.outerTimeoutMs,maxOutputBytes:536870912}),record,config:assembled.config,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
const call=await json(join(root,'prepared-call.json'));assert.equal(runtime.product.sha256Canonical(call),m.callCanonicalDigest);assert.deepEqual(call.resources.source,{kind:'admitted_source_result',basis:sourceBasis});assert.deepEqual(call.invocation.request.input.value,sourceBasis.sourceResultValue);assert.deepEqual(call.resources.historicalSource,historicalSource);
const actorOwner=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')).href);assert.deepEqual(actorOwner.selectedWorksiteCommandAmbientEnvironment(),m.ambientEnvironment);
const authority=caller.refresh(),observed=await runtime.product.observeWorksiteContext({workspaceAuthorityBasis:authority.workspaceAuthorityBasis,workspaceBinding:authority.workspaceBinding,protectedInstallRoots:authority.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});assert.equal(observed.kind,'worksite_context_observation');assert.equal(observed.observationDigest,m.contextDigest,'Current worksite changed after preflight');
const sourceOwner=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/invocation_admission.js')).href);assert.deepEqual(sourceOwner.rehydrateInvocationSourceResultBasisAtDurablePrefix(caller.state.closeHandoff.prefix,sourceBasis),sourceBasis,'Source eligibility changed');
const admitOwner=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/shared/admit/index.js')).href),historicalOwner=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/project_read_ports.js')).href);const historicalChecked=admitOwner.admitJson(historicalSource);assert.equal(historicalChecked.kind,'ok');assert(historicalOwner.projectHistoricalGraphCallSourceAtDurablePrefix(caller.state.closeHandoff.prefix,historicalChecked.value)!==null,'Historical source eligibility changed');
// Existing operator stays immutable. Guard each actual return before a later helper can dereference it.
const invoke=caller.invoke;caller.invoke=async(...args)=>{const result=await invoke(...args);const handoff=result.receipt?.resources?.eventResource?.closeHandoff??null;if(handoff===null){await record('null-resource-return.json',{label:args[0],receipt:result.receipt??null,exitCode:result.execution.exitCode});throw Error('Actual call returned no handoff; no resume or readback may use stale caller state');}assert.deepEqual(caller.state.closeHandoff,handoff);assert(result.receipt.ownerOutput,'Missing typed owner output');return result;};
await record('STARTED.json',{startedUtc:new Date().toISOString(),pid:process.pid,sourceBasis:'admitted_source_result',sourceBasisRef:sourceBasis.basisRef,sourceCommit:m.sourceCommit,eventPrefix:m.eventPrefix,retainedConstructionObservations:sourceBasis.sourceResultValue.observations.length,RuntimeTMPDIR:profile.runtimeEnvironment.TMPDIR,providerCommand:profile.provider.command,profile:m.profile,automaticRetry:false,pendingFrontierRecovery:false,R2Closure:false,qualification:false});
try{
 const execution=await invokeLifecycle(caller,retained.setup.installations,call,assembled.environment);await record('execution.json',execution);
 const receipt=execution.receipt;assert(receipt?.resources?.eventResource?.closeHandoff,'No genuine runtime return');
 await record('outcome-summary.json',{ended:new Date().toISOString(),exitCode:execution.execution.exitCode,outcomeKind:receipt.ownerOutput.outcomeKind,disposition:receipt.ownerOutput.value?.disposition??null,run:receipt.resources.run??null,terminal:receipt.ownerOutput.value?.terminalResult??null,sourceBasisRef:sourceBasis.basisRef,qualification:false,R2Closure:false,meaning:'Fresh retained work. Any predecessor-context refusal is exact evidence for Root; no bypass or replayed progress.'});
 if(receipt.resources.run!==null&&receipt.resources.run!==undefined){const reads=await freshReadbacks(caller,execution);await record('fresh-reads.json',reads);}
 else await record('fresh-reads.json',{status:'NOT_ATTEMPTED_NO_ACTUAL_RUN_COORDINATE',ownerOutput:receipt.ownerOutput});
 await checkInstalled(selection);await record('after-run-resume.json',{...retained,state:caller.state});
 console.log(JSON.stringify({status:'returned_actual_resources',outcomeKind:receipt.ownerOutput.outcomeKind,record:root}));
}catch(error){await record('dispatch-failure.json',{at:new Date().toISOString(),name:error.name,message:error.message,observation:error.observation??null,currentResumeWritten:false,classification:'Actual fault/refusal retained; no old handoff substitution, fabricated terminal or retry'});throw error;}
