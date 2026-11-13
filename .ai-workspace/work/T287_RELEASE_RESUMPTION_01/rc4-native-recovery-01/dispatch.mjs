// Root-only one-shot native invocation through existing installed Public pipeline.
import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {dir,work,sha,json,pinned,loadSetup} from './setup-state.mjs';
const root=join(dir,'attempt-001');assert.equal(process.argv.length,3,'usage: node dispatch.mjs MANIFEST_SHA256_HEX');
const raw=await readFile(join(root,'PREPARATION_MANIFEST.json'));assert.equal(sha(raw),process.argv[2]);const m=JSON.parse(raw);assert.equal(m.kind,'rc4_native_recovery_frozen_dispatch');assert.equal(m.status,'PREPARED_NOT_DISPATCHED');assert.equal(m.sourceBasis,'none');
try{await lstat(join(root,'STARTED.json'));throw Error('already started; no retry')}catch(e){if(e.code!=='ENOENT')throw e;}
for(const r of m.files)await pinned(r);await pinned(m.callPreparationBinding);
const {selection,retained,workload:w,profile,local}=await loadSetup(m.callPreparationBinding.sha256);assert(process.env.CLAUDE_CODE_OAUTH_TOKEN,'selected credential environment unavailable');
const {installedModules,publicCaller}=await import(pathToFileURL(local[0]).href);
const {exclusiveRecord,commandRecorder,workerEnvironment,invokeLifecycle,freshReadbacks}=await import(pathToFileURL(local[1]).href);
const runtime=await installedModules(retained.installedRoot);for(const install of retained.setup.installations)assert(await runtime.product.installedProductContentMatches(install),'installed Product changed');
const call=await json(join(root,'prepared-call.json'));assert.equal(runtime.product.sha256Canonical(call),m.callCanonicalDigest);assert.equal(call.resources.source.kind,'none');
const inherited=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const config={...retained.config,setupEnvironment:{...inherited,...profile.toolchainEnvironment},toolchainEnvironment:profile.toolchainEnvironment,provider:profile.provider};
const record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw),caller=publicCaller({root,runtime,native:retained.native,command:commandRecorder(root,{environment:config.setupEnvironment,timeoutMs:profile.outerTimeoutMs,maxOutputBytes:536870912}),record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
const observedAuthority=caller.refresh();const observed=await runtime.product.observeWorksiteContext({workspaceAuthorityBasis:observedAuthority.workspaceAuthorityBasis,workspaceBinding:observedAuthority.workspaceBinding,protectedInstallRoots:observedAuthority.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});assert.equal(observed.kind,'worksite_context_observation');assert.equal(observed.observationDigest,m.contextDigest,'source/current inputs changed since preflight');
await record('STARTED.json',{startedUtc:new Date().toISOString(),pid:process.pid,sourceBasis:'none',sourceCommit:m.sourceCommit,ProductWriteRoots:w.workOrders.construction.writeRoots,provider:{model:profile.model,effort:profile.effort,maxTurns:profile.maxTurns,maxBudgetUsd:null,inactivityTimeoutMs:profile.inactivityTimeoutMs,absoluteTimeoutMs:profile.absoluteTimeoutMs},requiredExecutionBudgetMs:m.requiredExecutionBudgetMs,eventPrefix:m.eventPrefix,automaticRetry:false,qualification:false});
try{
 const execution=await invokeLifecycle(caller,retained.setup.installations,call,workerEnvironment(config));await record('execution.json',execution);await record('after-run-resume.json',{state:caller.state,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority});
 const reads=await freshReadbacks(caller,execution);await record('fresh-reads.json',reads);const o=execution.receipt.ownerOutput;
 await record('outcome-summary.json',{ended:new Date().toISOString(),exitCode:execution.execution.exitCode,outcomeKind:o.outcomeKind,disposition:o.value?.disposition??null,run:execution.receipt.resources.run??null,terminal:o.value?.terminalResult??null,qualification:false,pointOneCompletion:'Requires separate Root actual installed interruption witness.'});console.log(JSON.stringify({status:'returned',outcomeKind:o.outcomeKind,disposition:o.value?.disposition??null,record:root}));
}catch(error){await record('dispatch-failure.json',{at:new Date().toISOString(),name:error.name,message:error.message,closeHandoff:caller.state.closeHandoff,classification:'Preserve actual effects/uncertainty; no fabricated terminal or retry'});throw error;}
