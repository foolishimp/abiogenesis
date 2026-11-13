import {getHeapStatistics} from 'node:v8';
// One exact Root-selected native start. There is no automatic retry.
import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {installedModules,publicCaller} from '../operator-client/public-setup.mjs';
import {exclusiveRecord,commandRecorder,workerEnvironment,invokeLifecycle,freshReadbacks} from '../operator-client/runner.mjs';
/* OPERATOR_PHASE_TIMING_BEGIN module-body-and-clock */
import {writeFile as writePhaseTiming} from 'node:fs/promises';
const phaseTimingOriginMs=performance.now(),phaseTimingOriginUtc=new Date().toISOString();
const phaseTimingPoints=[],phaseTimingRecordLabels={"STARTED.json":"dispatch_start_record_persistence","execution.json":"execution_output_persistence","outcome-summary.json":"outcome_summary_persistence","fresh-reads.json":"fresh_readback_output_persistence","after-run-resume.json":"final_resume_persistence","DISPATCH_FAILURE.json":"dispatch_failure_persistence"};
let phaseTimingCompleted=false,phaseTimingOverflow=false;
const phaseTimingMark=name=>{if(phaseTimingPoints.length<64)phaseTimingPoints.push({phase:name,enteredUtc:new Date().toISOString(),offsetMs:performance.now()-phaseTimingOriginMs});else phaseTimingOverflow=true;};
const phaseTimingRecord=path=>{const label=phaseTimingRecordLabels[path];if(typeof label==='string')phaseTimingMark(label);};
phaseTimingMark('module_body_entry');
try {
/* OPERATOR_PHASE_TIMING_END module-body-and-clock */const dir=dirname(fileURLToPath(import.meta.url)),out=join(dir,'execution'),json=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
/* OPERATOR_PHASE_TIMING_BEGIN dispatch_manifest_and_pin_checks */
phaseTimingMark('dispatch_manifest_and_pin_checks');
/* OPERATOR_PHASE_TIMING_END dispatch_manifest_and_pin_checks */const raw=await readFile(join(out,'DISPATCH_MANIFEST.json'));assert.equal(hash(raw),process.argv[2]);
const manifest=JSON.parse(raw);assert.equal(manifest.status,'ROOT_ADMITTED_NATIVE_DISPATCH');
try{await lstat(join(out,'STARTED.json'));throw Error('Already started; no automatic retry');}catch(e){if(e.code!=='ENOENT')throw e;}
for(const p of manifest.files){const bytes=await readFile(p.path);assert.equal(hash(bytes),p.sha256,p.path);assert.equal(bytes.length,p.bytes,p.path);}
/* OPERATOR_PHASE_TIMING_BEGIN prepared_resume_and_controls_load */
phaseTimingMark('prepared_resume_and_controls_load');
/* OPERATOR_PHASE_TIMING_END prepared_resume_and_controls_load */const retained=await json(join(out,'resume.json')),profile=await json(join(dir,'PROVIDER_PROFILE.json')),w=await json(join(dir,'workload.json')),pre=await json(join(out,'PREPARED_CALL.json'));
/* OPERATOR_PHASE_TIMING_BEGIN head_credential_presence_and_heap_guards */
phaseTimingMark('head_credential_presence_and_heap_guards');
/* OPERATOR_PHASE_TIMING_END head_credential_presence_and_heap_guards */assert.equal(execFileSync('/usr/bin/git',['-C',pre.worksite,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),pre.sourceCommit);
assert(process.env.CLAUDE_CODE_OAUTH_TOKEN,'Selected native credential unavailable');
const hostHeapMatch=/^--max-old-space-size=(\d+)$/u.exec(profile.runtimeEnvironment.NODE_OPTIONS);
assert(hostHeapMatch&&getHeapStatistics().heap_size_limit>=Number(hostHeapMatch[1])*1024*1024,'Apply declared host Node heap policy at launch');
/* OPERATOR_PHASE_TIMING_BEGIN selected_environment_preparation */
phaseTimingMark('selected_environment_preparation');
/* OPERATOR_PHASE_TIMING_END selected_environment_preparation */const environment=workerEnvironment(retained.config);
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(key))delete process.env[key];
Object.assign(process.env,environment);
/* OPERATOR_PHASE_TIMING_BEGIN installed_owner_loading */
phaseTimingMark('installed_owner_loading');
/* OPERATOR_PHASE_TIMING_END installed_owner_loading */const runtime=await installedModules(retained.installedRoot),record=(p,v,raw=false)=>/* OPERATOR_PHASE_TIMING_BEGIN selected-record-boundary-open */
(phaseTimingRecord(p),
/* OPERATOR_PHASE_TIMING_END selected-record-boundary-open */exclusiveRecord(out,p,v,raw)/* OPERATOR_PHASE_TIMING_BEGIN selected-record-boundary-close */
)
/* OPERATOR_PHASE_TIMING_END selected-record-boundary-close */;
/* OPERATOR_PHASE_TIMING_BEGIN recording_caller_setup */
phaseTimingMark('recording_caller_setup');
/* OPERATOR_PHASE_TIMING_END recording_caller_setup */const caller=publicCaller({root:out,runtime,native:retained.native,config:retained.config,record,
 command:commandRecorder(out,{environment,timeoutMs:profile.outerTimeoutMs,maxOutputBytes:536870912}),actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
/* OPERATOR_PHASE_TIMING_BEGIN environment_refresh */
phaseTimingMark('environment_refresh');
/* OPERATOR_PHASE_TIMING_END environment_refresh */const env=caller.refresh(),observed=/* OPERATOR_PHASE_TIMING_BEGIN observation-boundary-open */
(phaseTimingMark('worksite_observation'),
/* OPERATOR_PHASE_TIMING_END observation-boundary-open */await runtime.product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
 protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes})/* OPERATOR_PHASE_TIMING_BEGIN observation-boundary-close */
)
/* OPERATOR_PHASE_TIMING_END observation-boundary-close */;
/* OPERATOR_PHASE_TIMING_BEGIN observed_context_correspondence */
phaseTimingMark('observed_context_correspondence');
/* OPERATOR_PHASE_TIMING_END observed_context_correspondence */assert.equal(observed.kind,'worksite_context_observation');assert.equal(observed.observationDigest,pre.contextDigest,'Source/input context changed after exact preflight');
/* OPERATOR_PHASE_TIMING_BEGIN actor_owner_load_and_ambient_guard */
phaseTimingMark('actor_owner_load_and_ambient_guard');
/* OPERATOR_PHASE_TIMING_END actor_owner_load_and_ambient_guard */const actor=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')));
assert.deepEqual(actor.selectedWorksiteCommandAmbientEnvironment(),pre.ambientEnvironment);
/* OPERATOR_PHASE_TIMING_BEGIN prepared_call_read_and_canonical_guard */
phaseTimingMark('prepared_call_read_and_canonical_guard');
/* OPERATOR_PHASE_TIMING_END prepared_call_read_and_canonical_guard */const call=await json(join(out,'prepared-call.json'));assert.equal(runtime.product.sha256Canonical(call),pre.callCanonicalDigest);
assert.equal(call.resources.source.kind,'none');assert.equal(call.invocation.request.sourceBasis.kind,'none');
/* OPERATOR_PHASE_TIMING_BEGIN dispatch_start_record_construction */
phaseTimingMark('dispatch_start_record_construction');
/* OPERATOR_PHASE_TIMING_END dispatch_start_record_construction */const startedUtc=new Date().toISOString(),start=performance.now();
await record('STARTED.json',{startedUtc,pid:process.pid,hostHeapLimitBytes:getHeapStatistics().heap_size_limit,sourceCommit:pre.sourceCommit,manifestSha256:hash(raw),contextDigest:pre.contextDigest,
 callCanonicalDigest:pre.callCanonicalDigest,provider:profile.provider,automaticRetry:false,qualified:false,role:'Root operator activation; ABG alone dispatches selected native work'});
try{
 /* OPERATOR_PHASE_TIMING_BEGIN lifecycle_invocation */
phaseTimingMark('lifecycle_invocation');
/* OPERATOR_PHASE_TIMING_END lifecycle_invocation */const execution=await invokeLifecycle(caller,retained.setup.installations,call,environment);
 await record('execution.json',execution);
 /* OPERATOR_PHASE_TIMING_BEGIN receipt_check_and_outcome_construction */
phaseTimingMark('receipt_check_and_outcome_construction');
/* OPERATOR_PHASE_TIMING_END receipt_check_and_outcome_construction */assert(execution.receipt?.resources?.eventResource?.closeHandoff,'Actual invocation returned no close handoff');
 const receipt=execution.receipt;
 await record('outcome-summary.json',{startedUtc,endedUtc:new Date().toISOString(),wallMs:performance.now()-start,exitCode:execution.execution.exitCode,
  outcomeKind:receipt.ownerOutput?.outcomeKind,disposition:receipt.ownerOutput?.value?.disposition??null,run:receipt.resources.run??null,
  terminal:receipt.ownerOutput?.value?.terminalResult??null,qualified:false,meaning:'Native return; independent source review and actual C2/UAT determine bounded acceptance.'});
 /* OPERATOR_PHASE_TIMING_BEGIN fresh_readback_selection */
phaseTimingMark('fresh_readback_selection');
/* OPERATOR_PHASE_TIMING_END fresh_readback_selection */if(receipt.resources.run){/* OPERATOR_PHASE_TIMING_BEGIN fresh_readbacks */
phaseTimingMark('fresh_readbacks');
/* OPERATOR_PHASE_TIMING_END fresh_readbacks */await record('fresh-reads.json',await freshReadbacks(caller,execution));}
 await record('after-run-resume.json',{...retained,state:{...caller.state,environment:null}});
 console.log(JSON.stringify({status:'NATIVE_RETURNED_ACTUAL_RESOURCES',outcomeKind:receipt.ownerOutput?.outcomeKind,run:receipt.resources.run??null,wallMs:performance.now()-start,executionRoot:out}));
}catch(error){await record('DISPATCH_FAILURE.json',{at:new Date().toISOString(),name:error.name,message:error.message,observation:error.observation??null,
 wallMs:performance.now()-start,meaning:'Actual failure retained; no old close handoff substituted or automatic retry.'});throw error;}
/* OPERATOR_PHASE_TIMING_BEGIN completion-and-artifact */
phaseTimingCompleted=true;
} finally {
 const endMs=performance.now()-phaseTimingOriginMs,endedUtc=new Date().toISOString();
 const timing={kind:'bounded_operator_phase_wall_timing',script:"dispatch.mjs",moduleBodyEnteredUtc:phaseTimingOriginUtc,endedUtc,
  moduleBodyElapsedMs:endMs,status:phaseTimingCompleted?'script_completed':'script_threw_before_completion',markerOverflow:phaseTimingOverflow,
  phases:phaseTimingPoints.map((point,index)=>({...point,durationMs:(phaseTimingPoints[index+1]?.offsetMs??endMs)-point.offsetMs})),
  existingCommandTiming:'execution/commands/<existing-label>.request.json started; result.json started,wallMs,exitCode,signal,timedOut,truncated. Reuse only these scalar fields; command recorder unchanged.',
  limits:['Module body begins after static imports; host launch and static import time require existing external launch evidence.',
   'Sequential monotonic wall intervals include I/O, scheduling and bookkeeping, not CPU attribution or causal speedup.',
   'invokeLifecycle includes its existing before/after installed-content checks; existing command wall times overlap this interval. Do not add them.',
   'Fresh-readback command details remain in existing run_result/run_replay command metadata. Selected record phases start at record entry after argument evaluation.',
   'Timing artifact serialization/write is excluded. A hard kill or static import failure may leave no artifact. Existing artifact is never overwritten.',
   'Timing is observation only, with no new predicate, owner admission, retry, provider telemetry, private payload, environment value or credential.']};
 try {await writePhaseTiming(new URL('./DISPATCH_PHASE_TIMING.json',import.meta.url),JSON.stringify(timing,null,2)+'\n',{flag:'wx'});}
 catch(error){try{console.error(JSON.stringify({kind:'operator_phase_timing_write_failed',code:typeof error?.code==='string'?error.code.slice(0,40):null}));}catch{}}
}
/* OPERATOR_PHASE_TIMING_END completion-and-artifact */