// Root-only one-shot dispatch. Preparation did not execute this file.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,realpath} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const root=join(base,'attempt-004'),setup=join(base,'setup-001');
const sha=b=>createHash('sha256').update(b).digest('hex');
const fileSha=path=>new Promise((resolve,reject)=>{const h=createHash('sha256'),s=createReadStream(path);s.on('data',b=>h.update(b));s.on('error',reject);s.on('end',()=>resolve(h.digest('hex')));});
const manifestRaw=await readFile(join(root,'PREPARATION_MANIFEST.json'));
assert.equal(sha(manifestRaw),process.argv[2]);
const manifest=JSON.parse(manifestRaw);
for(const entry of Object.values(manifest.files))assert.equal(await fileSha(entry.path),entry.sha256,'prepared file drift: '+entry.path);
assert.equal(await realpath(manifest.claude.configuredPath),manifest.claude.path);
assert.equal(await fileSha(manifest.claude.path),manifest.claude.sha256,'Claude executable drift');
assert.equal(await realpath(process.execPath),manifest.node.path);assert.equal(await fileSha(manifest.node.path),manifest.node.sha256,'Node executable drift');
assert(typeof process.env.CLAUDE_CODE_OAUTH_TOKEN==='string'&&process.env.CLAUDE_CODE_OAUTH_TOKEN.length>0,'existing Claude credential environment binding unavailable');
const activation=JSON.parse(await readFile(join(root,'ACTIVATE_B02.json'),'utf8'));
const retainedRaw=await readFile(join(setup,'operator-resume-material.json'));assert.equal(sha(retainedRaw),activation.setupResume.sha256);
const retained=JSON.parse(retainedRaw);
assert.equal(await fileSha(retained.native.request.artifactPath),activation.executingArtifactSha256);
assert.equal(await fileSha(join(retained.installedRoot,'contracts/default-library/stdo/manifest.json')),activation.methodManifestSha256,'runtime method basis drift');
const priorRaw=await readFile(join(base,'attempt-003/after-run-resume.json'));assert.equal(sha(priorRaw),activation.previousRunResume.sha256);const prior=JSON.parse(priorRaw);
const eventPath=fileURLToPath(prior.state.closeHandoff.prefix.eventLogRef);
assert.equal(await fileSha(eventPath),activation.initialEventLog.sha256,'RC2 event log changed since preparation');
const preflightPath=join(base,'increment-b-02/preflight.mjs');
const preflightEnv=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const preflight=execFileSync('/opt/homebrew/bin/node',['--experimental-vm-modules',preflightPath,'--check-only'],{cwd:'/Users/jim/src/apps/abiogenesis',encoding:'utf8',
 env:{...preflightEnv,NODE_OPTIONS:'--max-old-space-size=8192'},maxBuffer:4*1024*1024,timeout:300000});
const current=JSON.parse(preflight);assert.equal(current.workloadSha256,activation.workload.sha256);
const toolchain=JSON.parse(execFileSync('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12',
 ['-B',join(base,'increment-a-01/toolchain-census.py'),'--verify'],{encoding:'utf8',timeout:120000}));
assert.equal(toolchain.canonicalInventorySha256,'6aba0391382aae398fe2ddc62536491ed189d45aa1b36d896fe226a09e409049');
const {installedModules,publicCaller}=await import('../operator-client/public-setup.mjs');
const {exclusiveRecord,commandRecorder,workerEnvironment,invokeLifecycle,freshReadbacks}=await import('../operator-client/runner.mjs');
const record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw);
// Exclusive marker means any second launch refuses, including after partial work.
await record('STARTED.json',{kind:'rc3_b02_root_operator_dispatch',startedUtc:new Date().toISOString(),pid:process.pid,
 activationSha256:sha(await readFile(join(root,'ACTIVATE_B02.json'))),preparedCallSha256:manifest.files[join(root,'prepared-call.json')].sha256,
 provider:{agent:'claude',command:'/Users/jim/.local/bin/claude',model:'claude-opus-5-5',effort:'xhigh',maxTurns:120,maxBudgetUsdPerProcess:8},
 budget:{historicalReportedNativeUsd:46.3959266,knownIncrementStopForTriageUsd:12,initialTargetUsd:20,activeProcessReserveUsd:8,aggregateStopUsd:90,aggregateAllocationUsd:100,unmeasuredCharges:'unknown'},
 monitoring:'Root monitors native stream result usage; no automatic aggregate cap',automaticRetry:false});
await record('dispatch-preflight.json',current);
const env=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const launch={BASH_DEFAULT_TIMEOUT_MS:'1800000',BASH_MAX_TIMEOUT_MS:'1800000',CLAUDE_CODE_DISABLE_BACKGROUND_TASKS:'1',NODE_OPTIONS:'--max-old-space-size=8192'};
const config={...retained.config,runId:'rc3-dogfood-01-increment-b-02',setupEnvironment:{...env,...launch},toolchainEnvironment:launch,
 provider:{enabled:true,agent:'claude',command:'/Users/jim/.local/bin/claude',model:'claude-opus-5-5',maxTurns:120,maxBudgetUsd:8,
 appendArgs:['--effort','xhigh'],inactivityTimeoutMs:1800000,absoluteTimeoutMs:2100000,inheritEnvironment:['CLAUDE_CODE_OAUTH_TOKEN']}};
const runtime=await installedModules(retained.installedRoot);
const caller=publicCaller({root,runtime,native:retained.native,command:commandRecorder(root,{environment:config.setupEnvironment,timeoutMs:7200000,maxOutputBytes:536870912}),record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,prior.state);caller.installedRoot=prior.installedRoot;caller.workspaceAuthority=prior.workspaceAuthority;
const call=JSON.parse(await readFile(join(root,'prepared-call.json'),'utf8'));
const binding=JSON.parse(await readFile(join(root,'PREPARED_CALL.json'),'utf8'));
assert.equal(runtime.product.sha256Canonical(call),binding.callCanonicalDigest);assert.equal(call.invocation.invocationRef,binding.invocationRef);
try{
 const execution=await invokeLifecycle(caller,retained.setup.installations,call,workerEnvironment(config));
 await record('execution.json',execution);
 await record('after-run-resume.json',{state:caller.state,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority});
 const reads=await freshReadbacks(caller,execution);await record('fresh-reads.json',reads);
 const output=execution.receipt.ownerOutput;
 await record('outcome-summary.json',{ended:new Date().toISOString(),exitCode:execution.execution.exitCode,
  outcomeKind:output.outcomeKind,disposition:output.value?.disposition??null,run:execution.receipt.resources.run??null,
  terminal:output.value?.terminalResult??null,reads:reads.map(r=>({memberKey:r.memberKey,outcomeKind:r.ownerOutput.outcomeKind})),qualification:false});
 console.log(JSON.stringify({status:'returned',outcomeKind:output.outcomeKind,disposition:output.value?.disposition??null,record:root}));
}catch(error){
 await record('dispatch-failure.json',{failedAt:new Date().toISOString(),name:error?.name,message:error?.message,stack:error?.stack,
  closeHandoff:caller?.state.closeHandoff??null,classification:'Preserve actual effects; an operator exception is not a fabricated terminal Run outcome'});
 console.error(JSON.stringify({status:'operator-exception',name:error?.name,message:String(error?.message).slice(0,1000),record:root}));process.exitCode=1;
}
