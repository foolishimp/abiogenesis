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
const retained=await json(join(campaign,'f4-02/execution/after-run-resume.json')),profile=await json(join(dir,'PROVIDER_PROFILE.json'));
const w=await json(join(dir,'workload.json')),grant=await json(join(dir,'NATIVE_GRANT.json')),work=retained.workspaceAuthority.canonicalRoot;
assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),grant.sourceCommit);
execFileSync('/usr/bin/git',['-C',work,'diff','--quiet']);execFileSync('/usr/bin/git',['-C',work,'diff','--cached','--quiet']);
const config={...retained.config,runId:'rc5-performance-f4-03',provider:profile.provider,toolchainEnvironment:profile.runtimeEnvironment};
const environment=workerEnvironment(config);
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(key))delete process.env[key];
Object.assign(process.env,environment);
const runtime=await installedModules(retained.installedRoot),{product,abg}=runtime;
const dry=publicCaller({root:dir,runtime,native:retained.native,config,record:()=>{throw Error('Unexpected effect during preflight')},command:()=>{throw Error('Unexpected command')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(dry.state,retained.state);dry.installedRoot=retained.installedRoot;dry.workspaceAuthority=retained.workspaceAuthority;
const env=dry.refresh(),authority={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding};
for(const install of env.productInstalls)assert(await product.installedProductContentMatches(install));
const log=fileURLToPath(dry.state.closeHandoff.prefix.eventLogRef),before=hash(await readFile(log));
const observation=await product.observeWorksiteContext({...authority,protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
assert.equal(observation.kind,'worksite_context_observation',JSON.stringify(observation));
const observed=new Map(observation.entries.map(e=>[e.relativePath,e]));
for(const p of w.testing.selectedPaths)assert.equal(observed.get(p)?.state,'file',p);
for(const source of w.sources)assert.equal(observed.get(source.path)?.digest,source.digest,source.path);
const input=product.constructGovernanceWorkState({...w,assessment:{...w.assessment,...assessmentSelection}});assert(product.isGovernanceWorkState(input));
const c2=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/worksite_command_execution.js'))),actor=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')));
const subjects=w.testing.selectedPaths.map(relativePath=>product.constructWorksiteSubject({...authority,relativePath,subjectUri:pathToFileURL(join(work,relativePath)).href}));
const ambient=actor.selectedWorksiteCommandAmbientEnvironment();
const configuration=c2.constructWorksiteCommandConfiguration({...authority,protectedSubjects:subjects,commands:w.testing.commands,outcomePredicates:w.testing.outcomePredicates,allowedWriteTerritories:w.testing.allowedWriteTerritories},ambient);
const budget=c2.projectWorksiteCommandExecutionBudget(w.testing),limits=actor.selectedWorksiteCommandExecutionLimits();
assert(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits));
await mkdir(join(dir,'execution'));
const record=(p,v,raw=false)=>exclusiveRecord(join(dir,'execution'),p,v,raw);
const caller=publicCaller({root:join(dir,'execution'),runtime,native:retained.native,config,record,command:()=>{throw Error('Unexpected Public execution')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
await record('run.json',{kind:'rc5_f4_native_preparation',sourceCommit:grant.sourceCommit,sourceBasis:'none',providerCalls:0,RunAdmissions:0});
await record('input.json',input);
const {call}=await constructLifecycleCall(caller,input);await record('prepared-call.json',call);
assert.equal(hash(await readFile(log)),before,'Preparation changed historical prefix');
const prepared={status:'PREPARED_NOT_DISPATCHED',sourceCommit:grant.sourceCommit,worksite:work,installedRoot:retained.installedRoot,
 contextDigest:observation.observationDigest,observedEntries:observation.entries.length,selectedFiles:subjects.length,commands:configuration.commands.length,
 budget,limits,ambientEnvironment:ambient,eventPrefix:caller.state.closeHandoff.prefix,inputCanonicalDigest:product.sha256Canonical(input),
 callCanonicalDigest:product.sha256Canonical(call),callFileSha256:hash(await readFile(join(dir,'execution/prepared-call.json'))),workloadSha256:hash(await readFile(join(dir,'workload.json'))),
 runtimeEnvironment:profile.runtimeEnvironment,providerCalls:0,RunAdmissions:0,meaning:'Actual installed constructors/configuration/context and Public start-call population; no native dispatch or candidate acceptance.'};
await record('PREPARED_CALL.json',prepared);
await record('resume.json',{...retained,config});
console.log(JSON.stringify({status:prepared.status,contextDigest:prepared.contextDigest,commands:prepared.commands,selectedFiles:prepared.selectedFiles,budget:prepared.budget,callCanonicalDigest:prepared.callCanonicalDigest}));
