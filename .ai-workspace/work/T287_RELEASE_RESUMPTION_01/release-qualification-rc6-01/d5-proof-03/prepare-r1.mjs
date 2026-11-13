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
/* OPERATOR_PHASE_TIMING_BEGIN module-body-and-clock */
import {writeFile as writePhaseTiming} from 'node:fs/promises';
const phaseTimingOriginMs=performance.now(),phaseTimingOriginUtc=new Date().toISOString();
const phaseTimingPoints=[],phaseTimingRecordLabels={"run.json":"run_record_persistence","input.json":"governance_input_persistence","prepared-call.json":"lifecycle_call_persistence","PREPARED_CALL.json":"preflight_summary_persistence","resume.json":"prepared_resume_persistence"};
let phaseTimingCompleted=false,phaseTimingOverflow=false;
const phaseTimingMark=name=>{if(phaseTimingPoints.length<64)phaseTimingPoints.push({phase:name,enteredUtc:new Date().toISOString(),offsetMs:performance.now()-phaseTimingOriginMs});else phaseTimingOverflow=true;};
const phaseTimingRecord=path=>{const label=phaseTimingRecordLabels[path];if(typeof label==='string')phaseTimingMark(label);};
phaseTimingMark('module_body_entry');
try {
/* OPERATOR_PHASE_TIMING_END module-body-and-clock */const dir=dirname(fileURLToPath(import.meta.url)),campaign=dirname(dir),json=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
/* OPERATOR_PHASE_TIMING_BEGIN binding_and_admission_pin_checks */
phaseTimingMark('binding_and_admission_pin_checks');
/* OPERATOR_PHASE_TIMING_END binding_and_admission_pin_checks */const binding=await json(join(dir,'RUNTIME_BINDINGS.json'));
assert.equal(binding.status,'ROOT_BOUND_TO_ACTUAL_D5_RETURN_CLOSE','Actual D5 source/close/admission are unbound');
for(const key of ['frozenSubject','actualResume','actualClose','rootControlAdmission']){const p=binding[key];assert(p?.path&&p?.sha256&&Number.isSafeInteger(p.bytes),key+' remains unbound');const b=await readFile(p.path);assert.equal(b.length,p.bytes,key);assert.equal(hash(b),p.sha256,key);}
assert(binding.actualClosePrefix,'Actual close prefix unbound');
assert.equal(dirname(dirname(binding.actualResume.path)),binding.expectedAuthorDirectory,'Actual resume must come from selected author03');
assert.equal(dirname(binding.actualClose.path),binding.expectedAuthorDirectory,'Actual close must come from selected author03');
assert.equal(dirname(dirname(binding.frozenSubject.path)),binding.expectedAuthorDirectory,'Frozen subject must come from selected author03');
assert.deepEqual((await json(binding.actualClose.path)).prefix,binding.actualClosePrefix);
assert(binding.authorHandoffs&&Object.keys(binding.authorHandoffs).sort().join(',')==='progress.json,readiness.json,return.json','Actual author handoffs unbound');
const frozen=await json(binding.frozenSubject.path),frozenControl=await json(join(dir,'inputs/FROZEN_SUBJECT.json'));
assert.equal(frozenControl.status,'BOUND_ACTUAL_D5_NATIVE_SUBJECT');assert.deepEqual(frozenControl.subject,binding.frozenSubject);assert.equal(frozenControl.nativeResultRef,frozen.nativeResultRef);assert.equal(frozenControl.nativeResultDigest,frozen.nativeResultDigest);assert.deepEqual(frozenControl.authorHandoffs,binding.authorHandoffs);
/* OPERATOR_PHASE_TIMING_BEGIN actual_resume_parse_and_close_check */
phaseTimingMark('actual_resume_parse_and_close_check');
/* OPERATOR_PHASE_TIMING_END actual_resume_parse_and_close_check */const retained=await json(binding.actualResume.path),profile=await json(join(dir,'PROVIDER_PROFILE.json'));
assert.deepEqual(retained.state.closeHandoff.prefix,binding.actualClosePrefix);

/* OPERATOR_PHASE_TIMING_BEGIN workload_and_grant_load */
phaseTimingMark('workload_and_grant_load');
/* OPERATOR_PHASE_TIMING_END workload_and_grant_load */const w=await json(join(dir,'workload.json')),grant=await json(join(dir,'PROOF_ONLY_GRANT.json')),work=retained.workspaceAuthority.canonicalRoot;
/* OPERATOR_PHASE_TIMING_BEGIN consumer_binding_verify_parse_and_overlay */
phaseTimingMark('consumer_binding_verify_parse_and_overlay');
/* OPERATOR_PHASE_TIMING_END consumer_binding_verify_parse_and_overlay */const consumerBytes=await readFile(binding.consumerBindingSelection.path);assert.equal(consumerBytes.length,binding.consumerBindingSelection.bytes);assert.equal(hash(consumerBytes),binding.consumerBindingSelection.sha256);const priorConsumer=JSON.parse(consumerBytes);assert.equal(retained.state.resource,null);assert.equal(retained.state.selection,null);const latestClose=retained.state.closeHandoff;Object.assign(retained.state,{binding:priorConsumer.binding,catalog:priorConsumer.catalog,catalogView:priorConsumer.catalogView,environment:null});assert.strictEqual(retained.state.closeHandoff,latestClose);
/* OPERATOR_PHASE_TIMING_BEGIN source_identity_and_hash_correspondence */
phaseTimingMark('source_identity_and_hash_correspondence');
/* OPERATOR_PHASE_TIMING_END source_identity_and_hash_correspondence */assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),grant.sourceCommit);
const held=await json(join(dir,'SOURCE_BEFORE.json'));assert.equal(held.status,'BOUND_ACTUAL_D5_NATIVE_SUBJECT');assert(Array.isArray(held.files)&&held.files.length>0);assert.equal(new Set(held.files.map(f=>f.relativePath)).size,held.files.length);assert.deepEqual([...held.files.map(f=>f.relativePath)].sort(),[...w.readRoots].sort(),'Complete source/control context must be bound');assert.deepEqual(held.frozenSubject,binding.frozenSubject);assert.deepEqual(grant.frozenSubject,binding.frozenSubject);assert.deepEqual(grant.actualResume,binding.actualResume);assert.equal(grant.previousConstructionResult,frozen.nativeResultRef);assert.equal(grant.status,'ROOT_ADMITTED_PROOF_PREFLIGHT');
for(const file of held.files){const bytes=await readFile(join(work,file.relativePath));assert.equal(hash(bytes),file.sha256,file.relativePath);assert.equal(bytes.length,file.bytes,file.relativePath);}
assert.equal(frozen.sourceCommit,grant.sourceCommit);
const frozenPins=new Map(frozen.files.map(f=>[f.path,{bytes:f.bytes,sha256:f.sha256}])),heldPins=new Map(held.files.map(f=>[f.relativePath,f]));
for(const name of ['return.json','readiness.json','progress.json']){const p=binding.authorHandoffs[name];assert.equal(p.path,join(dirname(binding.frozenSubject.path),name));const bytes=await readFile(p.path);assert.equal(bytes.length,p.bytes,name);assert.equal(hash(bytes),p.sha256,name);frozenPins.set('qualification-scratch/d5-author-03/'+name,{bytes:bytes.length,sha256:hash(bytes)});}
for(const path of w.testing.selectedPaths){const original=frozenPins.get(path),heldPin=heldPins.get(path);assert(original&&heldPin,'Missing actual frozen input: '+path);assert.equal(heldPin.bytes,original.bytes,path);assert.equal(heldPin.sha256,original.sha256,path);}

execFileSync('/usr/bin/git',['-C',work,'diff','--cached','--quiet']);
/* OPERATOR_PHASE_TIMING_BEGIN selected_environment_preparation */
phaseTimingMark('selected_environment_preparation');
/* OPERATOR_PHASE_TIMING_END selected_environment_preparation */const config={...retained.config,processTimeoutMs:profile.outerTimeoutMs,sourceCommit:grant.sourceCommit,runId:'release-qualification-d5-proof-03',provider:profile.provider,toolchainEnvironment:profile.runtimeEnvironment};
const hostHeapMatch=/^--max-old-space-size=(\d+)$/u.exec(profile.runtimeEnvironment.NODE_OPTIONS);
assert(hostHeapMatch&&getHeapStatistics().heap_size_limit>=Number(hostHeapMatch[1])*1024*1024,'Apply declared host Node heap policy at launch');
const environment=workerEnvironment(config);
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(key))delete process.env[key];
Object.assign(process.env,environment);
/* OPERATOR_PHASE_TIMING_BEGIN installed_owner_loading */
phaseTimingMark('installed_owner_loading');
/* OPERATOR_PHASE_TIMING_END installed_owner_loading */const runtime=await installedModules(retained.installedRoot),{product,abg}=runtime;
/* OPERATOR_PHASE_TIMING_BEGIN governance_input_construction */
phaseTimingMark('governance_input_construction');
/* OPERATOR_PHASE_TIMING_END governance_input_construction */assert.deepEqual(Object.keys(w.workOrders).sort(),['testing','uat']);
for(const [role,o]of Object.entries(w.workOrders)){assert(Array.isArray(o.instructions)&&o.instructions.length>0,role);assert(o.instructions.every(t=>typeof t==='string'&&t.trim().length>1),'Fragmented/blank instruction in '+role);}
const input=product.constructGovernanceWorkState({...w,assessment:{...w.assessment,...assessmentSelection}});assert(product.isGovernanceWorkState(input));assert.equal(input.observations.length,0);assert.equal(input.synthesis,null);
/* OPERATOR_PHASE_TIMING_BEGIN command_and_actor_owner_loading */
phaseTimingMark('command_and_actor_owner_loading');
/* OPERATOR_PHASE_TIMING_END command_and_actor_owner_loading */const c2=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/worksite_command_execution.js'))),actor=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')));
/* OPERATOR_PHASE_TIMING_BEGIN existing_budget_projection_and_guard */
phaseTimingMark('existing_budget_projection_and_guard');
/* OPERATOR_PHASE_TIMING_END existing_budget_projection_and_guard */const budget=c2.projectWorksiteCommandExecutionBudget(w.testing),limits=actor.selectedWorksiteCommandExecutionLimits();
assert(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits));assert.equal(budget.requiredExecutionBudgetMs,1636750,'Declared D5 budget changed');
/* OPERATOR_PHASE_TIMING_BEGIN dry_caller_setup */
phaseTimingMark('dry_caller_setup');
/* OPERATOR_PHASE_TIMING_END dry_caller_setup */const dry=publicCaller({root:dir,runtime,native:retained.native,config,record:()=>{throw Error('Unexpected effect during preflight')},command:()=>{throw Error('Unexpected command')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(dry.state,retained.state);dry.installedRoot=retained.installedRoot;dry.workspaceAuthority=retained.workspaceAuthority;
/* OPERATOR_PHASE_TIMING_BEGIN environment_refresh */
phaseTimingMark('environment_refresh');
/* OPERATOR_PHASE_TIMING_END environment_refresh */const env=dry.refresh(),authority={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding};
/* OPERATOR_PHASE_TIMING_BEGIN installed_content_verification */
phaseTimingMark('installed_content_verification');
/* OPERATOR_PHASE_TIMING_END installed_content_verification */for(const install of env.productInstalls)assert(await product.installedProductContentMatches(install));
/* OPERATOR_PHASE_TIMING_BEGIN physical_prefix_read_and_hash */
phaseTimingMark('physical_prefix_read_and_hash');
/* OPERATOR_PHASE_TIMING_END physical_prefix_read_and_hash */const log=fileURLToPath(dry.state.closeHandoff.prefix.eventLogRef),physicalBefore=await readFile(log),before=hash(physicalBefore);assert.equal(physicalBefore.length,binding.actualClosePrefix.prefixLength);assert.equal('sha256:'+before,binding.actualClosePrefix.prefixDigest);
/* OPERATOR_PHASE_TIMING_BEGIN worksite_observation */
phaseTimingMark('worksite_observation');
/* OPERATOR_PHASE_TIMING_END worksite_observation */const observation=await product.observeWorksiteContext({...authority,protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
assert.equal(observation.kind,'worksite_context_observation',JSON.stringify(observation));
/* OPERATOR_PHASE_TIMING_BEGIN observed_source_and_assessment_asset_checks */
phaseTimingMark('observed_source_and_assessment_asset_checks');
/* OPERATOR_PHASE_TIMING_END observed_source_and_assessment_asset_checks */const observed=new Map(observation.entries.map(e=>[e.relativePath,e]));
const expectedFuture=new Set(await json(join(dir,'EXPECTED_FUTURE_FILES.json')));
for(const p of w.testing.selectedPaths)assert.equal(observed.get(p)?.state,expectedFuture.has(p)?'absent':'file',p);
for(const source of w.sources)assert.equal(observed.get(source.path)?.digest,source.digest,source.path);
const assets=[w.assessment.candidatePath,w.assessment.rubricPath,...w.assessment.sources,...Object.values(w.workOrders).flatMap(o=>o.readFirst)];assert(!w.assessment.sources.includes(w.assessment.candidatePath)&&!w.assessment.sources.includes(w.assessment.rubricPath));for(const o of Object.values(w.workOrders)){assert.equal(o.readFirst.length,new Set(o.readFirst).size);assert.deepEqual(o.writeRoots,[]);}for(const p of assets){assert(w.readRoots.includes(p),'Undeclared assessment asset: '+p);assert.equal(observed.get(p)?.state,'file','Assessment asset absent: '+p);}assert.equal(expectedFuture.size,0,'Proof requires actual handoffs, never placeholders');
/* OPERATOR_PHASE_TIMING_BEGIN projection_owner_loading */
phaseTimingMark('projection_owner_loading');
/* OPERATOR_PHASE_TIMING_END projection_owner_loading */const defaultOwner=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/default_library.js')));
/* OPERATOR_PHASE_TIMING_BEGIN initial_projection_and_size_calculation */
phaseTimingMark('initial_projection_and_size_calculation');
/* OPERATOR_PHASE_TIMING_END initial_projection_and_size_calculation */const initialProjection=defaultOwner.projectFramedSynthesisPromptTask({kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:input,context:observation});
const projectionBytes=Buffer.byteLength(product.canonicalJson(initialProjection)),reserveBytes=131072;
const capacity={kind:'bounded_current_initial_projection_measurement',projectionBytes,selectedFiles:w.testing.selectedPaths.length,sourceCount:w.sources.length,contextBytes:Buffer.byteLength(product.canonicalJson(observation)),maxPromptBytes:w.maxPromptBytes,reserveBytes,initialProjectionFitsWithReserve:projectionBytes+reserveBytes<w.maxPromptBytes,providerCalls:0,RunAdmissions:0,limits:['Initial owner task projection only; not complete rendered request or future-stage fit.','Existing native assembly applies actual prompt limit before each paid invocation.','No historical task/prompt bodies or invented future producer observations used.']};
/* OPERATOR_PHASE_TIMING_BEGIN capacity_record_persistence */
phaseTimingMark('capacity_record_persistence');
/* OPERATOR_PHASE_TIMING_END capacity_record_persistence */await writeFile(join(dir,'SELECTOR_CAPACITY_PREFLIGHT.json'),JSON.stringify(capacity,null,2)+'\n',{flag:'wx'});
/* OPERATOR_PHASE_TIMING_BEGIN capacity_guard */
phaseTimingMark('capacity_guard');
/* OPERATOR_PHASE_TIMING_END capacity_guard */assert(capacity.initialProjectionFitsWithReserve,'Initial task projection exceeds selected bound');
/* OPERATOR_PHASE_TIMING_BEGIN subjects_and_command_configuration */
phaseTimingMark('subjects_and_command_configuration');
/* OPERATOR_PHASE_TIMING_END subjects_and_command_configuration */const subjects=w.testing.selectedPaths.map(relativePath=>product.constructWorksiteSubject({...authority,relativePath,subjectUri:pathToFileURL(join(work,relativePath)).href}));
const ambient=actor.selectedWorksiteCommandAmbientEnvironment();
const configuration=c2.constructWorksiteCommandConfiguration({...authority,protectedSubjects:subjects,commands:w.testing.commands,outcomePredicates:w.testing.outcomePredicates,allowedWriteTerritories:w.testing.allowedWriteTerritories},ambient);
/* OPERATOR_PHASE_TIMING_BEGIN execution_archive_setup */
phaseTimingMark('execution_archive_setup');
/* OPERATOR_PHASE_TIMING_END execution_archive_setup */await mkdir(join(dir,'execution'));
const record=(p,v,raw=false)=>/* OPERATOR_PHASE_TIMING_BEGIN selected-record-boundary-open */
(phaseTimingRecord(p),
/* OPERATOR_PHASE_TIMING_END selected-record-boundary-open */exclusiveRecord(join(dir,'execution'),p,v,raw)/* OPERATOR_PHASE_TIMING_BEGIN selected-record-boundary-close */
)
/* OPERATOR_PHASE_TIMING_END selected-record-boundary-close */;
/* OPERATOR_PHASE_TIMING_BEGIN recording_caller_setup */
phaseTimingMark('recording_caller_setup');
/* OPERATOR_PHASE_TIMING_END recording_caller_setup */const caller=publicCaller({root:join(dir,'execution'),runtime,native:retained.native,config,record,command:()=>{throw Error('Unexpected Public execution')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
await record('run.json',{kind:'bounded_d5_current_candidate_proof_only_preparation',sourceCommit:grant.sourceCommit,heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),sourceBasis:'none',providerCalls:0,RunAdmissions:0});
await record('input.json',input);
/* OPERATOR_PHASE_TIMING_BEGIN lifecycle_call_construction */
phaseTimingMark('lifecycle_call_construction');
/* OPERATOR_PHASE_TIMING_END lifecycle_call_construction */const {call}=await constructLifecycleCall(caller,input);await record('prepared-call.json',call);
/* OPERATOR_PHASE_TIMING_BEGIN final_prefix_read_and_consistency_check */
phaseTimingMark('final_prefix_read_and_consistency_check');
/* OPERATOR_PHASE_TIMING_END final_prefix_read_and_consistency_check */assert.equal(hash(await readFile(log)),before,'Preparation changed historical prefix');
/* OPERATOR_PHASE_TIMING_BEGIN preflight_summary_construction */
phaseTimingMark('preflight_summary_construction');
/* OPERATOR_PHASE_TIMING_END preflight_summary_construction */const prepared={status:'PREPARED_NOT_DISPATCHED',sourceCommit:grant.sourceCommit,heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),worksite:work,installedRoot:retained.installedRoot,
 contextDigest:observation.observationDigest,observedEntries:observation.entries.length,selectedFiles:subjects.length,commands:configuration.commands.length,
 budget,limits,selectorCapacity:capacity,ambientEnvironment:ambient,eventPrefix:caller.state.closeHandoff.prefix,inputCanonicalDigest:product.sha256Canonical(input),
 callCanonicalDigest:product.sha256Canonical(call),callFileSha256:hash(await readFile(join(dir,'execution/prepared-call.json'))),workloadSha256:hash(await readFile(join(dir,'workload.json'))),
 runtimeEnvironment:profile.runtimeEnvironment,providerCalls:0,RunAdmissions:0,meaning:'Existing installed owners and source-none proof-only call. Only Testing/UAT; no coding stage or qualification acceptance.'};
await record('PREPARED_CALL.json',prepared);
await record('resume.json',{...retained,config});
console.log(JSON.stringify({status:prepared.status,contextDigest:prepared.contextDigest,commands:prepared.commands,selectedFiles:prepared.selectedFiles,budget:prepared.budget,callCanonicalDigest:prepared.callCanonicalDigest}));
/* OPERATOR_PHASE_TIMING_BEGIN completion-and-artifact */
phaseTimingCompleted=true;
} finally {
 const endMs=performance.now()-phaseTimingOriginMs,endedUtc=new Date().toISOString();
 const timing={kind:'bounded_operator_phase_wall_timing',script:"prepare-r1.mjs",moduleBodyEnteredUtc:phaseTimingOriginUtc,endedUtc,
  moduleBodyElapsedMs:endMs,status:phaseTimingCompleted?'script_completed':'script_threw_before_completion',markerOverflow:phaseTimingOverflow,
  phases:phaseTimingPoints.map((point,index)=>({...point,durationMs:(phaseTimingPoints[index+1]?.offsetMs??endMs)-point.offsetMs})),
  existingCommandTiming:'execution/commands/<existing-label>.request.json started; result.json started,wallMs,exitCode,signal,timedOut,truncated. Reuse only these scalar fields; command recorder unchanged.',
  limits:['Module body begins after static imports; host launch and static import time require existing external launch evidence.',
   'Sequential monotonic wall intervals include I/O, scheduling and bookkeeping, not CPU attribution or causal speedup.',
   'invokeLifecycle includes its existing before/after installed-content checks; existing command wall times overlap this interval. Do not add them.',
   'Fresh-readback command details remain in existing run_result/run_replay command metadata. Selected record phases start at record entry after argument evaluation.',
   'Timing artifact serialization/write is excluded. A hard kill or static import failure may leave no artifact. Existing artifact is never overwritten.',
   'Timing is observation only, with no new predicate, owner admission, retry, provider telemetry, private payload, environment value or credential.']};
 try {await writePhaseTiming(new URL('./PREPARE_PHASE_TIMING.json',import.meta.url),JSON.stringify(timing,null,2)+'\n',{flag:'wx'});}
 catch(error){try{console.error(JSON.stringify({kind:'operator_phase_timing_write_failed',code:typeof error?.code==='string'?error.code.slice(0,40):null}));}catch{}}
}
/* OPERATOR_PHASE_TIMING_END completion-and-artifact */