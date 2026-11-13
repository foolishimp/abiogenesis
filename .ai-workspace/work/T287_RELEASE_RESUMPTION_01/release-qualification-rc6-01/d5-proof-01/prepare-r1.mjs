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
const binding=await json(join(dir,'RUNTIME_BINDINGS.json'));
assert.equal(binding.status,'ROOT_BOUND_TO_ACTUAL_D5_RETURN_CLOSE','Actual D5 source/close/admission are unbound');
for(const key of ['frozenSubject','actualResume','rootControlAdmission']){const p=binding[key];assert(p?.path&&p?.sha256&&Number.isSafeInteger(p.bytes),key+' remains unbound');const b=await readFile(p.path);assert.equal(b.length,p.bytes,key);assert.equal(hash(b),p.sha256,key);}
assert(binding.actualClosePrefix,'Actual close prefix unbound');
const frozen=await json(binding.frozenSubject.path),frozenControl=await json(join(dir,'inputs/FROZEN_SUBJECT.json'));
assert.equal(frozenControl.status,'BOUND_ACTUAL_D5_NATIVE_SUBJECT');assert.deepEqual(frozenControl.subject,binding.frozenSubject);assert.equal(frozenControl.nativeResultRef,frozen.nativeResultRef);
const retained=await json(binding.actualResume.path),profile=await json(join(dir,'PROVIDER_PROFILE.json'));
assert.deepEqual(retained.state.closeHandoff.prefix,binding.actualClosePrefix);

const w=await json(join(dir,'workload.json')),grant=await json(join(dir,'PROOF_ONLY_GRANT.json')),work=retained.workspaceAuthority.canonicalRoot;
const consumerBytes=await readFile(binding.consumerBindingSelection.path);assert.equal(consumerBytes.length,binding.consumerBindingSelection.bytes);assert.equal(hash(consumerBytes),binding.consumerBindingSelection.sha256);const priorConsumer=JSON.parse(consumerBytes);assert.equal(retained.state.resource,null);assert.equal(retained.state.selection,null);const latestClose=retained.state.closeHandoff;Object.assign(retained.state,{binding:priorConsumer.binding,catalog:priorConsumer.catalog,catalogView:priorConsumer.catalogView,environment:null});assert.strictEqual(retained.state.closeHandoff,latestClose);
assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),grant.sourceCommit);
const held=await json(join(dir,'SOURCE_BEFORE.json'));assert.equal(held.status,'BOUND_ACTUAL_D5_NATIVE_SUBJECT');assert(Array.isArray(held.files)&&held.files.length>0);assert.deepEqual(held.frozenSubject,binding.frozenSubject);assert.deepEqual(grant.frozenSubject,binding.frozenSubject);assert.deepEqual(grant.actualResume,binding.actualResume);assert.equal(grant.previousConstructionResult,frozen.nativeResultRef);assert.equal(grant.status,'ROOT_ADMITTED_PROOF_PREFLIGHT');
for(const file of held.files){const bytes=await readFile(join(work,file.relativePath));assert.equal(hash(bytes),file.sha256,file.relativePath);assert.equal(bytes.length,file.bytes,file.relativePath);}
assert.equal(frozen.sourceCommit,grant.sourceCommit);
const frozenPins=new Map(frozen.files.map(f=>[f.path,{bytes:f.bytes,sha256:f.sha256}])),heldPins=new Map(held.files.map(f=>[f.relativePath,f]));
for(const name of ['return.json','readiness.json','progress.json']){const bytes=await readFile(join(dirname(binding.frozenSubject.path),name));frozenPins.set('qualification-scratch/d5-author-01/'+name,{bytes:bytes.length,sha256:hash(bytes)});}
for(const path of w.testing.selectedPaths){const original=frozenPins.get(path),heldPin=heldPins.get(path);assert(original&&heldPin,'Missing actual frozen input: '+path);assert.equal(heldPin.bytes,original.bytes,path);assert.equal(heldPin.sha256,original.sha256,path);}

execFileSync('/usr/bin/git',['-C',work,'diff','--cached','--quiet']);
const config={...retained.config,processTimeoutMs:profile.outerTimeoutMs,sourceCommit:grant.sourceCommit,runId:'release-qualification-d5-proof-01',provider:profile.provider,toolchainEnvironment:profile.runtimeEnvironment};
const hostHeapMatch=/^--max-old-space-size=(\d+)$/u.exec(profile.runtimeEnvironment.NODE_OPTIONS);
assert(hostHeapMatch&&getHeapStatistics().heap_size_limit>=Number(hostHeapMatch[1])*1024*1024,'Apply declared host Node heap policy at launch');
const environment=workerEnvironment(config);
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(key))delete process.env[key];
Object.assign(process.env,environment);
const runtime=await installedModules(retained.installedRoot),{product,abg}=runtime;
assert.deepEqual(Object.keys(w.workOrders).sort(),['testing','uat']);
const input=product.constructGovernanceWorkState({...w,assessment:{...w.assessment,...assessmentSelection}});assert(product.isGovernanceWorkState(input));assert.equal(input.observations.length,0);assert.equal(input.synthesis,null);
const c2=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/worksite_command_execution.js'))),actor=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')));
const budget=c2.projectWorksiteCommandExecutionBudget(w.testing),limits=actor.selectedWorksiteCommandExecutionLimits();
assert(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits));assert.equal(budget.requiredExecutionBudgetMs,1636750,'Declared D5 budget changed');
const dry=publicCaller({root:dir,runtime,native:retained.native,config,record:()=>{throw Error('Unexpected effect during preflight')},command:()=>{throw Error('Unexpected command')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(dry.state,retained.state);dry.installedRoot=retained.installedRoot;dry.workspaceAuthority=retained.workspaceAuthority;
const env=dry.refresh(),authority={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding};
for(const install of env.productInstalls)assert(await product.installedProductContentMatches(install));
const log=fileURLToPath(dry.state.closeHandoff.prefix.eventLogRef),physicalBefore=await readFile(log),before=hash(physicalBefore);assert.equal(physicalBefore.length,binding.actualClosePrefix.prefixLength);assert.equal('sha256:'+before,binding.actualClosePrefix.prefixDigest);
const observation=await product.observeWorksiteContext({...authority,protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
assert.equal(observation.kind,'worksite_context_observation',JSON.stringify(observation));
const observed=new Map(observation.entries.map(e=>[e.relativePath,e]));
const expectedFuture=new Set(await json(join(dir,'EXPECTED_FUTURE_FILES.json')));
for(const p of w.testing.selectedPaths)assert.equal(observed.get(p)?.state,expectedFuture.has(p)?'absent':'file',p);
for(const source of w.sources)assert.equal(observed.get(source.path)?.digest,source.digest,source.path);
const assets=[w.assessment.candidatePath,w.assessment.rubricPath,...w.assessment.sources,...Object.values(w.workOrders).flatMap(o=>o.readFirst)];assert(!w.assessment.sources.includes(w.assessment.candidatePath)&&!w.assessment.sources.includes(w.assessment.rubricPath));for(const o of Object.values(w.workOrders)){assert.equal(o.readFirst.length,new Set(o.readFirst).size);assert.deepEqual(o.writeRoots,[]);}for(const p of assets){assert(w.readRoots.includes(p),'Undeclared assessment asset: '+p);assert.equal(observed.get(p)?.state,'file','Assessment asset absent: '+p);}assert.equal(expectedFuture.size,0,'Proof requires actual handoffs, never placeholders');
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
await record('run.json',{kind:'bounded_d5_current_candidate_proof_only_preparation',sourceCommit:grant.sourceCommit,heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),sourceBasis:'none',providerCalls:0,RunAdmissions:0});
await record('input.json',input);
const {call}=await constructLifecycleCall(caller,input);await record('prepared-call.json',call);
assert.equal(hash(await readFile(log)),before,'Preparation changed historical prefix');
const prepared={status:'PREPARED_NOT_DISPATCHED',sourceCommit:grant.sourceCommit,heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),worksite:work,installedRoot:retained.installedRoot,
 contextDigest:observation.observationDigest,observedEntries:observation.entries.length,selectedFiles:subjects.length,commands:configuration.commands.length,
 budget,limits,selectorCapacity:capacity,ambientEnvironment:ambient,eventPrefix:caller.state.closeHandoff.prefix,inputCanonicalDigest:product.sha256Canonical(input),
 callCanonicalDigest:product.sha256Canonical(call),callFileSha256:hash(await readFile(join(dir,'execution/prepared-call.json'))),workloadSha256:hash(await readFile(join(dir,'workload.json'))),
 runtimeEnvironment:profile.runtimeEnvironment,providerCalls:0,RunAdmissions:0,meaning:'Existing installed owners and source-none proof-only call. Only Testing/UAT; no coding stage or qualification acceptance.'};
await record('PREPARED_CALL.json',prepared);
await record('resume.json',{...retained,config});
console.log(JSON.stringify({status:prepared.status,contextDigest:prepared.contextDigest,commands:prepared.commands,selectedFiles:prepared.selectedFiles,budget:prepared.budget,callCanonicalDigest:prepared.callCanonicalDigest}));
