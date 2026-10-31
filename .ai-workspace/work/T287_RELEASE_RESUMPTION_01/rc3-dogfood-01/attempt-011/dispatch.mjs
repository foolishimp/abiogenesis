// Root-only one-shot Testing→UAT dispatch; no Construction is offered.
import assert from 'node:assert/strict';
import {readFile,stat,readdir,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01',root=join(base,'attempt-011'),setup=join(base,'setup-004');
const sha=b=>createHash('sha256').update(b).digest('hex'),json=async p=>JSON.parse(await readFile(p,'utf8'));
const raw=await readFile(join(root,'PREPARATION_MANIFEST.json'));assert.equal(sha(raw),process.argv[2]);const manifest=JSON.parse(raw);
for(const row of manifest.files){const b=await readFile(row.path);assert.equal(b.length,row.bytes,row.path);assert.equal(sha(b),row.sha256,row.path);}
assert.equal(manifest.executableLocalClosure?.method,'relative static imports and literal dynamic imports, recursively; no module evaluation');
const pinned=new Set(manifest.files.map(row=>row.path));
for(const entry of manifest.executableLocalClosure.modules){assert(pinned.has(entry.path),`unfrozen executable: ${entry.path}`);for(const dependency of entry.localImports)assert(pinned.has(dependency),`unfrozen import: ${dependency}`);}
for(const name of ['attempt-011/dispatch.mjs','increment-b-08/public-setup.mjs','operator-client/runner.mjs'])assert(manifest.executableLocalClosure.modules.some(row=>row.path===join(base,name)),`missing executable root: ${name}`);
const provider=await json(join(base,'increment-b-08/PROVIDER_BINDING.json'));
for(const name of ['node','claude','npm']){const p=provider.executables[name];assert.equal(await realpath(p.configuredPath),p.realPath);assert.equal(sha(await readFile(p.realPath)),p.sha256);}
assert(process.env.CLAUDE_CODE_OAUTH_TOKEN,'existing named credential binding is unavailable');
const activation=await json(join(root,'ACTIVATE_B09.json')),retained=await json(activation.setupResume.path),binding=await json(join(root,'PREPARED_CALL.json'));
assert.equal(sha(await readFile(activation.setupResume.path)),activation.setupResume.sha256);
const eventPath=fileURLToPath(retained.state.closeHandoff.prefix.eventLogRef);assert.equal(sha(await readFile(eventPath)),activation.initialEventLog.sha256);assert.equal((await stat(eventPath)).size,activation.initialEventLog.bytes);
// Existing B08 archives remain historical; current exact prefix is checked above.
const selection=await json(join(root,'SELECTION.json'));assert.equal(sha(await readFile(selection.additionalSource.path)),selection.additionalSource.sha256);
const source=await json(join(base,'increment-b-08/SOURCE_AND_ELIGIBILITY.json')),work='/Users/jim/src/apps/abiogenesis-rc3-dogfood';
for(const row of source.candidateRows)assert.equal(sha(await readFile(join(work,row.path))),row.current.sha256,row.path);
for(const p of [source.stdo.resolvedEntrypoint,source.stdo.interpreter,source.stdo.releaseManifest,...source.stdo.toolchainModuleSources])assert.equal(sha(await readFile(p.path)),p.sha256);
const repair=await json(join(base,'increment-b-08/EXECUTABLE_CLOSURE_REPAIR.json')),dependency=repair.offlineDependencyVerification;
for(const p of [dependency.python,dependency.script,dependency.inventory]){assert(pinned.has(p.path));const bytes=await readFile(p.path);assert.equal(bytes.length,p.bytes);assert.equal(sha(bytes),p.sha256);}
assert.equal(await realpath(dependency.python.path),dependency.python.path);
const verified=spawnSync(dependency.python.path,dependency.arguments,{encoding:'utf8',timeout:120000,maxBuffer:2097152});
assert.ifError(verified.error);assert.equal(verified.signal,null);assert.equal(verified.status,0,verified.stderr);
const dependencyVerification=JSON.parse(verified.stdout);assert.deepEqual(dependencyVerification,await json(dependency.inventory.path));
// All local executable bytes and offline dependencies are validated before local imports.
const {installedModules,publicCaller}=await import('../increment-b-08/public-setup.mjs');
const {exclusiveRecord,commandRecorder,workerEnvironment,invokeLifecycle,freshReadbacks}=await import('../operator-client/runner.mjs');
const runtime=await installedModules(retained.installedRoot),call=await json(join(root,'prepared-call.json'));
assert.equal(runtime.product.sha256Canonical(call),binding.callCanonicalDigest);assert.equal(call.resources.source.kind,'none');
const env=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const launch={BASH_DEFAULT_TIMEOUT_MS:'2400000',BASH_MAX_TIMEOUT_MS:'2400000',CLAUDE_CODE_DISABLE_BACKGROUND_TASKS:'1',NODE_OPTIONS:'--max-old-space-size=8192'};
const config={...retained.config,runId:'rc3-dogfood-01-increment-b-09',setupEnvironment:{...env,...launch},toolchainEnvironment:launch,
 provider:{enabled:true,agent:'claude',command:provider.executables.claude.configuredPath,model:provider.model,maxTurns:provider.maxTurnsPerProcess,appendArgs:['--effort',provider.effort],inactivityTimeoutMs:provider.inactivityTimeoutMs,absoluteTimeoutMs:provider.absoluteTimeoutMs,inheritEnvironment:['CLAUDE_CODE_OAUTH_TOKEN']}};
const record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw),caller=publicCaller({root,runtime,native:retained.native,command:commandRecorder(root,{environment:config.setupEnvironment,timeoutMs:provider.outerPublicTimeoutMs,maxOutputBytes:536870912}),record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
await record('STARTED.json',{startedUtc:new Date().toISOString(),pid:process.pid,sourceBasis:'none',ProductWriteRoots:[],provider:{model:provider.model,effort:provider.effort,maxTurns:provider.maxTurnsPerProcess,maxBudgetUsd:null},automaticRetry:false,failedB07Unchanged:true,offlineDependencyVerification:dependencyVerification});
try{const execution=await invokeLifecycle(caller,retained.setup.installations,call,workerEnvironment(config));await record('execution.json',execution);await record('after-run-resume.json',{state:caller.state,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority});
 const reads=await freshReadbacks(caller,execution);await record('fresh-reads.json',reads);const o=execution.receipt.ownerOutput;
 await record('outcome-summary.json',{ended:new Date().toISOString(),exitCode:execution.execution.exitCode,outcomeKind:o.outcomeKind,disposition:o.value?.disposition??null,run:execution.receipt.resources.run??null,terminal:o.value?.terminalResult??null,failedB07Unchanged:true,qualification:false});
 console.log(JSON.stringify({status:'returned',outcomeKind:o.outcomeKind,disposition:o.value?.disposition??null,record:root}));
}catch(error){await record('dispatch-failure.json',{at:new Date().toISOString(),name:error.name,message:error.message,closeHandoff:caller.state.closeHandoff,classification:'preserve actual effects; no fabricated terminal or retry'});throw error;}
