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
const final=await json(join(dir,'FINALIZATION_CUSTODY.json'));assert.equal(final.status,'FINALIZED_NOT_PREFLIGHTED_OR_DISPATCHED');
for(const pin of [...final.files,...Object.values(final.requiredPins)]){const b=await readFile(pin.path);assert.equal(b.length,pin.bytes,pin.path);assert.equal(hash(b),pin.sha256,pin.path);}
const rootBindings=await readFile(join(dir,'ROOT_FINALIZATION_BINDINGS.json'));assert.equal(hash(rootBindings),final.rootBindingsSha256);
const retained=await json(final.requiredPins.afterRunResume.path),profile=await json(join(dir,'PROVIDER_PROFILE.json'));
delete retained.state.environment;
const w=await json(join(dir,'workload.json')),grant=await json(join(dir,'PROOF_ONLY_GRANT.json')),work=retained.workspaceAuthority.canonicalRoot;
assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),grant.sourceCommit);
const held=await json(join(dir,'SOURCE_BEFORE.json'));
for(const file of held.files){const bytes=await readFile(join(work,file.relativePath));assert.equal(hash(bytes),file.sha256,file.relativePath);assert.equal(bytes.length,file.bytes,file.relativePath);}
execFileSync('/usr/bin/git',['-C',work,'diff','--cached','--quiet']);
const config={...retained.config,processTimeoutMs:profile.outerTimeoutMs,runId:'single-address-space-proof-10',provider:profile.provider,toolchainEnvironment:profile.runtimeEnvironment};
const hostHeapMatch=/^--max-old-space-size=(\d+)$/u.exec(profile.runtimeEnvironment.NODE_OPTIONS);
assert(hostHeapMatch&&getHeapStatistics().heap_size_limit>=Number(hostHeapMatch[1])*1024*1024,'Apply declared host Node heap policy at launch');
const environment=workerEnvironment(config);
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(key))delete process.env[key];
Object.assign(process.env,environment);
const runtime=await installedModules(retained.installedRoot),{product,abg}=runtime;
assert.deepEqual(Object.keys(w.workOrders).sort(),['testing','uat']);
const input=product.constructGovernanceWorkState({...w,assessment:{...w.assessment,...assessmentSelection}});assert(product.isGovernanceWorkState(input));
const c2=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/worksite_command_execution.js'))),actor=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')));
const budget=c2.projectWorksiteCommandExecutionBudget(w.testing),limits=actor.selectedWorksiteCommandExecutionLimits();
assert(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits));
const dry=publicCaller({root:dir,runtime,native:retained.native,config,record:()=>{throw Error('Unexpected effect during preflight')},command:()=>{throw Error('Unexpected command')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(dry.state,retained.state);dry.installedRoot=retained.installedRoot;dry.workspaceAuthority=retained.workspaceAuthority;
const env=dry.refresh(),authority={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding};
for(const install of env.productInstalls)assert(await product.installedProductContentMatches(install));
const log=fileURLToPath(dry.state.closeHandoff.prefix.eventLogRef),before=hash(await readFile(log));
const observation=await product.observeWorksiteContext({...authority,protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
assert.equal(observation.kind,'worksite_context_observation',JSON.stringify(observation));
const observed=new Map(observation.entries.map(e=>[e.relativePath,e]));
const expectedFuture=new Set(await json(join(dir,'EXPECTED_FUTURE_FILES.json')));assert.equal(expectedFuture.size,0,'No future native files in proof-only route');
for(const p of w.testing.selectedPaths)assert.equal(observed.get(p)?.state,expectedFuture.has(p)?'absent':'file',p);
for(const source of w.sources)assert.equal(observed.get(source.path)?.digest,source.digest,source.path);
const {measureSelectorCapacity}=await import('./selector-size-preflight.mjs');
const capacity=await measureSelectorCapacity({input,observation,installedRoot:retained.installedRoot,campaign,product});
await writeFile(join(dir,'SELECTOR_CAPACITY_PREFLIGHT_R1.json'),JSON.stringify(capacity,null,2)+'\n',{flag:'wx'});
assert(capacity.fitsWithReserve,'Predictive selector capacity exceeds unchanged bound');
const subjects=w.testing.selectedPaths.map(relativePath=>product.constructWorksiteSubject({...authority,relativePath,subjectUri:pathToFileURL(join(work,relativePath)).href}));
const ambient=actor.selectedWorksiteCommandAmbientEnvironment();
const configuration=c2.constructWorksiteCommandConfiguration({...authority,protectedSubjects:subjects,commands:w.testing.commands,outcomePredicates:w.testing.outcomePredicates,allowedWriteTerritories:w.testing.allowedWriteTerritories},ambient);
await mkdir(join(dir,'execution'));
const record=(p,v,raw=false)=>exclusiveRecord(join(dir,'execution'),p,v,raw);
const caller=publicCaller({root:join(dir,'execution'),runtime,native:retained.native,config,record,command:()=>{throw Error('Unexpected Public execution')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
await record('run.json',{kind:'single_address_space_proof_only_preparation',sourceCommit:grant.sourceCommit,heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),sourceBasis:'none',providerCalls:0,RunAdmissions:0});
await record('input.json',input);
const {call}=await constructLifecycleCall(caller,input);await record('prepared-call.json',call);
assert.equal(hash(await readFile(log)),before,'Preparation changed historical prefix');
const prepared={status:'PREPARED_NOT_DISPATCHED',sourceCommit:grant.sourceCommit,heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),worksite:work,installedRoot:retained.installedRoot,
 contextDigest:observation.observationDigest,observedEntries:observation.entries.length,selectedFiles:subjects.length,commands:configuration.commands.length,
 budget,limits,selectorCapacity:capacity,ambientEnvironment:ambient,eventPrefix:caller.state.closeHandoff.prefix,inputCanonicalDigest:product.sha256Canonical(input),
 callCanonicalDigest:product.sha256Canonical(call),callFileSha256:hash(await readFile(join(dir,'execution/prepared-call.json'))),workloadSha256:hash(await readFile(join(dir,'workload.json'))),
 runtimeEnvironment:profile.runtimeEnvironment,providerCalls:0,RunAdmissions:0,meaning:'Actual installed constructors/configuration/context and Public proof-only start-call population; no construction order, dispatch or candidate acceptance.'};
await record('PREPARED_CALL.json',prepared);
await record('resume.json',{...retained,config,state:{...retained.state,environment:null}});
console.log(JSON.stringify({status:prepared.status,contextDigest:prepared.contextDigest,commands:prepared.commands,selectedFiles:prepared.selectedFiles,budget:prepared.budget,callCanonicalDigest:prepared.callCanonicalDigest}));
