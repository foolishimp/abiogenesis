import {getHeapStatistics} from 'node:v8';
// Exact installed-owner preflight and start-call construction; no provider dispatch.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {installedModules,publicCaller,constructLifecycleCall} from '../operator-client/public-setup.mjs';
import {exclusiveRecord,workerEnvironment} from '../operator-client/runner.mjs';
import {assessmentSelection} from '../operator-client/consumer.mjs';
const dir=dirname(fileURLToPath(import.meta.url)),campaign=dirname(dir),json=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const retained=await json(join(campaign,'q23-identity-01/execution/after-run-resume.json')),profile=await json(join(dir,'PROVIDER_PROFILE.json'));
const w=await json(join(dir,'workload.json')),grant=await json(join(dir,'NATIVE_GRANT.json')),work=retained.workspaceAuthority.canonicalRoot;
const binding=await json(join(dir,'RUNTIME_BINDINGS.json'));assert.deepEqual(retained.state.closeHandoff.prefix,binding.actualClosePrefix);assert.equal(hash(await readFile(binding.resume.path)),binding.resume.sha256);assert.equal(work,grant.worksiteRoot);
assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),grant.sourceCommit);
const held=await json(join(dir,'SOURCE_BEFORE.json'));
for(const file of held.files){const bytes=await readFile(join(work,file.relativePath));assert.equal(hash(bytes),file.sha256,file.relativePath);assert.equal(bytes.length,file.bytes,file.relativePath);}
execFileSync('/usr/bin/git',['-C',work,'diff','--cached','--quiet']);
const config={...retained.config,processTimeoutMs:profile.outerTimeoutMs,sourceCommit:grant.sourceCommit,runId:'release-qualification-q23-identity-02',provider:profile.provider,toolchainEnvironment:profile.runtimeEnvironment};
const hostHeapMatch=/^--max-old-space-size=(\d+)$/u.exec(profile.runtimeEnvironment.NODE_OPTIONS);
assert(hostHeapMatch&&getHeapStatistics().heap_size_limit>=Number(hostHeapMatch[1])*1024*1024,'Apply declared host Node heap policy at launch');
const environment=workerEnvironment(config);
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(key))delete process.env[key];
Object.assign(process.env,environment);
const runtime=await installedModules(retained.installedRoot),{product,abg}=runtime;
assert.deepEqual(Object.keys(w.workOrders).sort(),['construction','design','induction','specification','testing','uat']);
const input=product.constructGovernanceWorkState({...w,assessment:{...w.assessment,...assessmentSelection}});assert(product.isGovernanceWorkState(input));assert.equal(input.observations.length,0);assert.equal(input.synthesis,null);
const c2=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/worksite_command_execution.js'))),actor=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')));
const budget=c2.projectWorksiteCommandExecutionBudget(w.testing),limits=actor.selectedWorksiteCommandExecutionLimits();
assert(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits));
const dry=publicCaller({root:dir,runtime,native:retained.native,config,record:()=>{throw Error('Unexpected effect during preflight')},command:()=>{throw Error('Unexpected command')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(dry.state,retained.state);dry.installedRoot=retained.installedRoot;dry.workspaceAuthority=retained.workspaceAuthority;
const env=dry.refresh(),authority={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding};
for(const install of env.productInstalls)assert(await product.installedProductContentMatches(install));
const log=fileURLToPath(dry.state.closeHandoff.prefix.eventLogRef),logBytes=await readFile(log),before=hash(logBytes);assert.equal(logBytes.length,binding.actualClosePrefix.prefixLength);assert.equal('sha256:'+before,binding.actualClosePrefix.prefixDigest);
const observation=await product.observeWorksiteContext({...authority,protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
assert.equal(observation.kind,'worksite_context_observation',JSON.stringify(observation));
const observed=new Map(observation.entries.map(e=>[e.relativePath,e]));
const expectedFuture=new Set(await json(join(dir,'EXPECTED_FUTURE_FILES.json')));
for(const p of w.testing.selectedPaths)assert.equal(observed.get(p)?.state,expectedFuture.has(p)?'absent':'file',p);
for(const source of w.sources)assert.equal(observed.get(source.path)?.digest,source.digest,source.path);
const defaultOwner=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/default_library.js')));
const initialProjection=defaultOwner.projectFramedSynthesisPromptTask({kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:input,context:observation});
const projectionBytes=Buffer.byteLength(product.canonicalJson(initialProjection)),reserveBytes=131072;
const capacity={kind:'bounded_current_initial_projection_measurement',projectionBytes,selectedFiles:w.testing.selectedPaths.length,sourceCount:w.sources.length,contextBytes:Buffer.byteLength(product.canonicalJson(observation)),maxPromptBytes:w.maxPromptBytes,reserveBytes,initialProjectionFitsWithReserve:projectionBytes+reserveBytes<w.maxPromptBytes,providerCalls:0,RunAdmissions:0,limits:['Initial owner task projection only; not complete rendered request or future-stage fit.','Existing native assembly applies actual prompt limit before each paid invocation.','No historical task/prompt bodies or invented future producer observations used.']};
await writeFile(join(dir,'SELECTOR_CAPACITY_PREFLIGHT.json'),JSON.stringify(capacity,null,2)+'\n',{flag:'wx'});
assert(capacity.initialProjectionFitsWithReserve,'Initial task projection exceeds selected bound');
const subjects=w.testing.selectedPaths.map(relativePath=>product.constructWorksiteSubject({...authority,relativePath,subjectUri:pathToFileURL(join(work,relativePath)).href}));
const ambient=actor.selectedWorksiteCommandAmbientEnvironment();
const configuration=c2.constructWorksiteCommandConfiguration({...authority,protectedSubjects:subjects,commands:w.testing.commands,outcomePredicates:w.testing.outcomePredicates,allowedWriteTerritories:w.testing.allowedWriteTerritories},ambient);
await mkdir(join(dir,'execution'));
const record=(p,v,raw=false)=>exclusiveRecord(join(dir,'execution'),p,v,raw);
const caller=publicCaller({root:join(dir,'execution'),runtime,native:retained.native,config,record,command:()=>{throw Error('Unexpected Public execution')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
await record('run.json',{kind:'bounded_q23_native_construction_preparation',sourceCommit:grant.sourceCommit,heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),sourceBasis:'none',providerCalls:0,RunAdmissions:0});
await record('input.json',input);
const {call}=await constructLifecycleCall(caller,input);await record('prepared-call.json',call);
assert.equal(hash(await readFile(log)),before,'Preparation changed historical prefix');
const prepared={status:'PREPARED_NOT_DISPATCHED',sourceCommit:grant.sourceCommit,heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),worksite:work,installedRoot:retained.installedRoot,
 contextDigest:observation.observationDigest,observedEntries:observation.entries.length,selectedFiles:subjects.length,commands:configuration.commands.length,
 budget,limits,selectorCapacity:capacity,ambientEnvironment:ambient,eventPrefix:caller.state.closeHandoff.prefix,inputCanonicalDigest:product.sha256Canonical(input),
 callCanonicalDigest:product.sha256Canonical(call),callFileSha256:hash(await readFile(join(dir,'execution/prepared-call.json'))),workloadSha256:hash(await readFile(join(dir,'workload.json'))),
 runtimeEnvironment:profile.runtimeEnvironment,providerCalls:0,RunAdmissions:0,meaning:'Existing installed owners and source-none native Construction/Testing/UAT call. No dispatch, candidate acceptance or qualification claim.'};
await record('PREPARED_CALL.json',prepared);
await record('resume.json',{...retained,config});
console.log(JSON.stringify({status:prepared.status,contextDigest:prepared.contextDigest,commands:prepared.commands,selectedFiles:prepared.selectedFiles,budget:prepared.budget,callCanonicalDigest:prepared.callCanonicalDigest}));
