// One exact Root-selected native start. There is no automatic retry.
import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {installedModules,publicCaller} from '../operator-client/public-setup.mjs';
import {exclusiveRecord,commandRecorder,workerEnvironment,invokeLifecycle,freshReadbacks} from '../operator-client/runner.mjs';
const dir=dirname(fileURLToPath(import.meta.url)),out=join(dir,'execution'),json=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(join(out,'DISPATCH_MANIFEST.json'));assert.equal(hash(raw),process.argv[2]);
const manifest=JSON.parse(raw);assert.equal(manifest.status,'ROOT_ADMITTED_NATIVE_DISPATCH');
try{await lstat(join(out,'STARTED.json'));throw Error('Already started; no automatic retry');}catch(e){if(e.code!=='ENOENT')throw e;}
for(const p of manifest.files){const bytes=await readFile(p.path);assert.equal(hash(bytes),p.sha256,p.path);assert.equal(bytes.length,p.bytes,p.path);}
const retained=await json(join(out,'resume.json')),profile=await json(join(dir,'PROVIDER_PROFILE.json')),w=await json(join(dir,'workload.json')),pre=await json(join(out,'PREPARED_CALL.json'));
assert.equal(execFileSync('/usr/bin/git',['-C',pre.worksite,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),pre.sourceCommit);
assert(process.env.CLAUDE_CODE_OAUTH_TOKEN,'Selected native credential unavailable');
const environment=workerEnvironment(retained.config);
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(key))delete process.env[key];
Object.assign(process.env,environment);
const runtime=await installedModules(retained.installedRoot),record=(p,v,raw=false)=>exclusiveRecord(out,p,v,raw);
const caller=publicCaller({root:out,runtime,native:retained.native,config:retained.config,record,
 command:commandRecorder(out,{environment,timeoutMs:profile.outerTimeoutMs,maxOutputBytes:536870912}),actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
const env=caller.refresh(),observed=await runtime.product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
 protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
assert.equal(observed.kind,'worksite_context_observation');assert.equal(observed.observationDigest,pre.contextDigest,'Source/input context changed after exact preflight');
const actor=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')));
assert.deepEqual(actor.selectedWorksiteCommandAmbientEnvironment(),pre.ambientEnvironment);
const call=await json(join(out,'prepared-call.json'));assert.equal(runtime.product.sha256Canonical(call),pre.callCanonicalDigest);
assert.equal(call.resources.source.kind,'none');assert.equal(call.invocation.request.sourceBasis.kind,'none');
const startedUtc=new Date().toISOString(),start=performance.now();
await record('STARTED.json',{startedUtc,pid:process.pid,sourceCommit:pre.sourceCommit,manifestSha256:hash(raw),contextDigest:pre.contextDigest,
 callCanonicalDigest:pre.callCanonicalDigest,provider:profile.provider,automaticRetry:false,qualified:false,role:'Root operator activation; ABG alone dispatches native coding'});
try{
 const execution=await invokeLifecycle(caller,retained.setup.installations,call,environment);
 await record('execution.json',execution);
 assert(execution.receipt?.resources?.eventResource?.closeHandoff,'Actual invocation returned no close handoff');
 const receipt=execution.receipt;
 await record('outcome-summary.json',{startedUtc,endedUtc:new Date().toISOString(),wallMs:performance.now()-start,exitCode:execution.execution.exitCode,
  outcomeKind:receipt.ownerOutput?.outcomeKind,disposition:receipt.ownerOutput?.value?.disposition??null,run:receipt.resources.run??null,
  terminal:receipt.ownerOutput?.value?.terminalResult??null,qualified:false,meaning:'Native return; independent source review and actual C2/UAT determine bounded acceptance.'});
 if(receipt.resources.run){await record('fresh-reads.json',await freshReadbacks(caller,execution));}
 await record('after-run-resume.json',{...retained,state:caller.state});
 console.log(JSON.stringify({status:'NATIVE_RETURNED_ACTUAL_RESOURCES',outcomeKind:receipt.ownerOutput?.outcomeKind,run:receipt.resources.run??null,wallMs:performance.now()-start,executionRoot:out}));
}catch(error){await record('DISPATCH_FAILURE.json',{at:new Date().toISOString(),name:error.name,message:error.message,observation:error.observation??null,
 wallMs:performance.now()-start,meaning:'Actual failure retained; no old close handoff substituted or automatic retry.'});throw error;}
