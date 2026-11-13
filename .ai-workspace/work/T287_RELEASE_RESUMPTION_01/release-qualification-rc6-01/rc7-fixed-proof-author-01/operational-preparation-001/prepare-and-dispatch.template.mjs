import {getHeapStatistics} from 'node:v8';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile,lstat,access} from 'node:fs/promises';
import {constants} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const dir=dirname(fileURLToPath(import.meta.url)),D=dirname(dir),json=async p=>JSON.parse(await readFile(p,'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
const out=join(dir,'execution');
const manifestBytes=await readFile(join(out,'DISPATCH_MANIFEST.json'));
assert.equal(hash(manifestBytes),process.argv[2],'Root dispatch manifest digest');
const manifest=JSON.parse(manifestBytes);assert.equal(manifest.status,'ROOT_ADMITTED_NATIVE_DISPATCH');
for(const p of manifest.files){const b=await readFile(p.path);assert.equal(b.length,p.bytes,p.path);assert.equal(hash(b),p.sha256,p.path);}
try{await lstat(join(out,'HOST_PREPARATION_STARTED.json'));throw Error('Already started; no automatic retry');}catch(e){if(e.code!=='ENOENT')throw e;}
const binding=await json(join(dir,'RUNTIME_BINDINGS.json'));
assert.equal(binding.status,'ROOT_ADMITTED_NATIVE_DISPATCH','Root final admission is unbound');
assert(binding.rootControlAdmission?.path&&binding.rootControlAdmission?.sha256&&Number.isSafeInteger(binding.rootControlAdmission?.bytes),'Root must pin exact admission before preparation');
const admissionBytes=await readFile(binding.rootControlAdmission.path);assert.equal(hash(admissionBytes),binding.rootControlAdmission.sha256);assert.equal(admissionBytes.length,binding.rootControlAdmission.bytes);
assert.equal(binding.rootControlAdmission.path,join(dir,'ROOT_CONTROL_ADMISSION.json'));
assert(binding.resume?.path&&binding.resume?.sha256&&binding.actualClosePrefix,'Actual predecessor close unbound');
const actualCloseBytes=await readFile(binding.actualClose.path);assert.equal(hash(actualCloseBytes),binding.actualClose.sha256);assert.equal(actualCloseBytes.length,binding.actualClose.bytes);
assert.deepEqual(JSON.parse(actualCloseBytes).prefix,binding.actualClosePrefix);
const retained=await json(binding.resume.path),profile=await json(join(dir,'PROVIDER_PROFILE.json')),w=await json(join(dir,'workload.json')),grant=await json(join(dir,'NATIVE_GRANT.json'));
// Root's new exact selection supersedes the prior two-file review conjunction.
const pinnedJson=async pin=>{assert(pin?.path&&pin?.sha256&&Number.isSafeInteger(pin?.bytes),'Required control pin missing');const b=await readFile(pin.path);assert.equal(b.length,pin.bytes,pin.path);assert.equal(hash(b),pin.sha256,pin.path);return JSON.parse(b);};
const selected=await pinnedJson(grant.selection);assert.equal(selected.status,'SELECTED_RC7_RELEASE_INCREMENT_AFTER_CURRENT_CARRIER_CONSOLIDATION');
const admitted=JSON.parse(admissionBytes);assert.deepEqual(admitted.selection,grant.selection);assert.deepEqual(admitted.actualClose,binding.actualClose);assert.deepEqual(admitted.sourceBefore,await (async()=>{const path=join(dir,'SOURCE_BEFORE.json'),b=await readFile(path);return {path,bytes:b.length,sha256:hash(b)};})());
assert.deepEqual(binding.bindingOverlayFields,['binding','catalog','catalogView'],'Only the maintained native-author binding/catalog overlay is permitted; actual current close is retained');
assert.deepEqual(Object.keys(w.workOrders),['construction']);assert(Array.isArray(w.workOrders.construction.instructions));
assert(w.workOrders.construction.instructions.length>0&&w.workOrders.construction.instructions.every(s=>typeof s==='string'&&s.trim().length>1),'Instructions must remain complete strings');
assert.equal(new Set(w.workOrders.construction.readFirst).size,w.workOrders.construction.readFirst.length);
assert(w.workOrders.construction.readFirst.every(p=>w.readRoots.includes(p)));
assert.deepEqual(w.workOrders.construction.writeRoots,grant.nativeWriteRoots);assert.equal(grant.newFilesExpectedAfterConstruction.length,0);
const authorBindingBytes=await readFile(binding.retainedAuthorBinding.path);assert.equal(hash(authorBindingBytes),binding.retainedAuthorBinding.sha256);assert.equal(authorBindingBytes.length,binding.retainedAuthorBinding.bytes);
const authorBinding=JSON.parse(authorBindingBytes);assert.equal(authorBinding.installedRoot,retained.installedRoot);assert.deepEqual(authorBinding.workspaceAuthority,retained.workspaceAuthority);
const actualLatestClose=structuredClone(retained.state.closeHandoff);
for(const key of binding.bindingOverlayFields){assert(['binding','catalog','catalogView'].includes(key));retained.state[key]=authorBinding.state[key];}
assert.deepEqual(retained.state.closeHandoff,actualLatestClose);assert.equal(retained.state.environment,null);
const work=retained.workspaceAuthority.canonicalRoot;assert.equal(work,grant.worksiteRoot);assert.equal(hash(await readFile(binding.resume.path)),binding.resume.sha256);assert.deepEqual(retained.state.closeHandoff.prefix,binding.actualClosePrefix);assert.equal(retained.state.resource,null);assert.equal(retained.state.selection,null);
assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),grant.sourceCommit);execFileSync('/usr/bin/git',['-C',work,'diff','--cached','--quiet']);
for(const f of (await json(join(dir,'SOURCE_BEFORE.json'))).files){const b=await readFile(join(work,f.relativePath));assert.equal(hash(b),f.sha256,f.relativePath);assert.equal(b.length,f.bytes,f.relativePath);}
// Root must admit the maintained export and its mechanically routed operator copy.
for(const p of [binding.operatorRunner,binding.operatorPublicSetup,binding.maintainedCheckerSource]){assert(p?.path&&p?.sha256&&Number.isSafeInteger(p?.bytes),'Future checker/operator pin unbound');const b=await readFile(p.path);assert.equal(b.length,p.bytes,p.path);assert.equal(hash(b),p.sha256,p.path);}
assert.deepEqual(admitted.maintainedCheckerSource,binding.maintainedCheckerSource);assert.deepEqual(admitted.operatorRunner,binding.operatorRunner);assert.deepEqual(admitted.operatorPublicSetup,binding.operatorPublicSetup);
const {installedModules,publicCaller}=await import(pathToFileURL(binding.operatorPublicSetup.path));
const {exclusiveRecord,workerEnvironment,checkInstalledIdentity}=await import(pathToFileURL(binding.operatorRunner.path));
assert.equal(typeof checkInstalledIdentity,'function','Selected maintained checker export unavailable');
const config={...retained.config,processTimeoutMs:profile.outerTimeoutMs,sourceCommit:grant.sourceCommit,runId:'release-qualification-rc7-fixed-proof-author-01',provider:profile.provider,toolchainEnvironment:profile.runtimeEnvironment};
assert(getHeapStatistics().heap_size_limit>=8192*1024*1024);const environment=workerEnvironment(config);
for(const k of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(k)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(k))delete process.env[k];Object.assign(process.env,environment);
const runtime=await installedModules(retained.installedRoot),{product,abg,api}=runtime;
const nativeOwner=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/native_workspace_work.js'))),actor=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')));
const eventResourceOwner=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/definition_event_resource.js')));
await mkdir(out,{recursive:true});const record=(p,v,raw=false)=>exclusiveRecord(out,p,v,raw);
const startedUtc=new Date().toISOString(),startedMs=performance.now(),marks={};
await record('HOST_PREPARATION_STARTED.json',{startedUtc,pid:process.pid,manifestSha256:hash(manifestBytes),automaticRetry:false,qualified:false});
// Availability only: never execute provider/auth during this mechanical preflight.
assert(manifest.files.some(p=>p.path===profile.provider.command),'Root must pin the executable provider wrapper');
const providerAvailability=[];
for(const path of [profile.provider.command,profile.realClaude]){const st=await lstat(path);assert(st.isFile()&&!st.isSymbolicLink(),'Provider executable must be an exact regular file: '+path);assert((st.mode&0o111)!==0,'Provider wrapper/binary has no executable mode: '+path);await access(path,constants.X_OK);providerAvailability.push({path,mode:(st.mode&0o777).toString(8),executable:true,bytes:st.size});}
assert.equal(hash(await readFile(profile.realClaude)),profile.realClaudeSha256);
await record('provider-availability.json',{checks:providerAvailability,providerExecuted:false,credentialsRead:false});
const caller=publicCaller({root:join(dir,'execution'),runtime,native:retained.native,config,record,command:()=>{throw Error('This native SDK start does not launch a CLI')},actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
let outer=null,entry=null,completion=null,sdkOutcome=null,closeReceipt=null,invoked=false;
const errors=[];const failure=(phase,error)=>({phase,name:error?.name??'Error',message:error?.message??String(error),observation:error?.observation??null});
try{
  await checkInstalledIdentity(caller,retained.setup.installations,'before-run');
  marks.beforeRunIdentityMs=performance.now()-startedMs;
  entry=caller.acquire(caller.reopen());outer=caller.state.resource;
  marks.acquiredMs=performance.now()-startedMs;
  const env=caller.refresh(entry.prefix);
  assert.equal(env.workspaceBinding.roots.productRoot,retained.installedRoot,'Root Program requires its exact owner install as Product root');
  marks.environmentMs=performance.now()-startedMs;
const context=await product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});assert.equal(context.kind,'worksite_context_observation');
const entries=new Map(context.entries.map(e=>[e.relativePath,e])),future=new Set(grant.expectedFutureFiles);for(const p of w.testing.selectedPaths)assert.equal(entries.get(p)?.state,future.has(p)?'absent':'file',p);for(const s of w.sources)assert.equal(entries.get(s.path)?.digest,s.digest,s.path);
await record('run.json',{kind:'existing_native_author_program_preparation',sourceCommit:grant.sourceCommit,sourceBasis:'none',providerCalls:0,RunAdmissions:0,programRef:product.NATIVE_WORKSPACE_WORK_IDS.programRef});
let input;const ids=product.NATIVE_WORKSPACE_WORK_IDS,order=w.workOrders.construction,ns='abiogenesis/t287/rc7-fixed-proof-author-01';
const constructed=await api.constructInstalledStartCall({selection:{memberKey:'start',target:{kind:'next'},rootMode:'direct',fhMode:'direct'},programRef:ids.programRef,catalog:caller.state.catalog,catalogView:caller.state.catalogView,applications:[],admittedInstalls:env.productInstalls,workspaceBinding:env.workspaceBinding,verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(env.artifactTruth,i),actorRef:caller.actorRef,
 input:{factory:({workspaceBinding,grants})=>{assert.equal(grants.length,1);input=product.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding,capabilityGrant:grants[0],context,outcome:order.outcome,instructions:order.instructions,readFirst:order.readFirst,writeRoots:order.writeRoots,checks:order.checks});assert(product.isNativeWorkspaceWorkTask(input));assert.equal(input.assessment,undefined);return input;}},inputValueRef:'value://'+ns+'/input',source:{kind:'none'},eventResource:entry,envelope:{definitionContractCoordinates:retained.native.verified.definitionContractCoordinates,requestRef:'request://'+ns+'/start',correlationRef:'correlation://'+ns,eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(dir,'ROOT_CONTROL_ADMISSION.json')).href]}});
assert.equal(constructed.kind,'installed_start_call',JSON.stringify(constructed));const call=constructed.call;assert.strictEqual(call.resources.eventResource,entry,'Keep the actual acquired selection in the actual call');
const renderedBytes=Buffer.byteLength(nativeOwner.renderNativeWorkspaceWorkOrder(input)),reserveBytes=131072;assert(renderedBytes+reserveBytes<w.maxPromptBytes,'Native work order exceeds selected prompt budget');
const capacity={kind:'actual_existing_native_order_render_measurement',renderedNativeOrderBytes:renderedBytes,maxPromptBytes:w.maxPromptBytes,reserveBytes,fitsWithReserve:true,providerCalls:0,RunAdmissions:0,limits:['Actual owner work-order text, not complete transport/instruction assembly. Existing dispatch owners apply actual remaining guards.','No selector is part of the selected one-node native author Program.']};await writeFile(join(dir,'NATIVE_CAPACITY_PREFLIGHT.json'),JSON.stringify(capacity,null,2)+'\n',{flag:'wx'});
// The call is retained once as evidence, never reparsed as execution authority.
await record('prepared-call.json',call);abg.assertAcquiredAbgEventResourceSelectionCurrent(entry);
const prepared={status:'PREPARED_SAME_PROCESS_CALL_RETAINED_FOR_SDK',programRef:ids.programRef,startRef:ids.startRef,sourceCommit:grant.sourceCommit,
 heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),worksite:work,installedRoot:retained.installedRoot,
 contextDigest:context.observationDigest,observedEntries:context.entries.length,selectedFiles:w.testing.selectedPaths.length,
 ambientEnvironment:actor.selectedWorksiteCommandAmbientEnvironment(),eventPrefix:entry.prefix,
 inputCanonicalDigest:product.sha256Canonical(input),callCanonicalDigest:product.sha256Canonical(call),
 callFileSha256:hash(await readFile(join(out,'prepared-call.json'))),capacity,providerCalls:0,RunAdmissions:0,
 meaning:'Same live resource, environment, input and constructed call through preflight; recorded JSON is evidence only.'};
await record('PREPARED_CALL.json',prepared);
assert.equal(call.resources.source.kind,'none');assert.equal(call.invocation.request.sourceBasis.kind,'none');
marks.preparedMs=performance.now()-startedMs;
await record('STARTED.json',{startedUtc,pid:process.pid,manifestSha256:hash(manifestBytes),sourceCommit:grant.sourceCommit,
 contextDigest:prepared.contextDigest,callCanonicalDigest:prepared.callCanonicalDigest,marks,automaticRetry:false,qualified:false,
 transport:'runInstalledDefinitionCallWithResource',meaning:'One already authorized native SDK invocation; no child CLI metadata is produced.'});
try{
 invoked=true;sdkOutcome=await api.runInstalledDefinitionCallWithResource(entry,call);
 // Preserve actual return, and retain its real successor even if evidence writing fails.
 const candidate=sdkOutcome.receipt?.resources?.eventResource;
 if(candidate?.kind==='abg_event_resource_completion'&&eventResourceOwner.validateAbgEventResourceOutcome(candidate)&&eventResourceOwner.acquiredAbgEventResourceCompletionCorresponds(entry,candidate)){completion=candidate;caller.state.selection=candidate.successor;}
 await record('execution.json',sdkOutcome);
 assert.equal(sdkOutcome.kind,'installed_definition_call_transport_result','Actual SDK transport refusal retained');
 assert(sdkOutcome.receipt,'Actual SDK receipt missing');
 assert(completion,'Actual SDK operation returned no resource completion');
}catch(error){errors.push(failure('sdk-invocation',error));}
finally{try{await checkInstalledIdentity(caller,retained.setup.installations,'after-run');}catch(error){errors.push(failure('after-run-identity',error));}}
}catch(error){errors.push(failure('mechanical-preparation',error));}
finally{
 // Exactly one outer close attempt. A failed/no-completion operation uses the held
 // owner's actual prefix, never the prior reopen handoff or a fresh reader.
 if(outer===null&&caller.state.resource!==null)outer=caller.state.resource;
 if(outer!==null){
  try{
   const finalPrefix=completion?.successor.prefix??abg.selectHeldEventStoreDurablePrefix(outer.store);
   closeReceipt=caller.close(finalPrefix);
  }catch(error){errors.push(failure('physical-close',error));
   // Existing owner cleanup, with no invented receipt or successor handoff.
   try{abg.abandonAbgEventResource(outer);}catch(abandonError){errors.push(failure('resource-abandon',abandonError));}
   caller.state.resource=null;caller.state.selection=null;caller.state.closeHandoff=null;
  }
  if(closeReceipt){try{await record('resource-close.json',closeReceipt);}catch(error){errors.push(failure('close-receipt-persistence',error));}}
 }
 caller.state.environment=null;
}
const receipt=sdkOutcome?.receipt;
if(closeReceipt){
 await record('after-run-resume.json',{...retained,config,state:{...caller.state,resource:null,selection:null,environment:null}});
 await record('READBACKS_PENDING.json',{status:sdkOutcome===null?'ACTUAL_OUTER_CLOSE_NO_SDK_OUTCOME':'ACTUAL_SDK_RETURN_AND_OUTER_CLOSE_RETAINED_READBACKS_PENDING',
  actualOutcomeFile:sdkOutcome===null?null:join(out,'execution.json'),receiptPointer:'/receipt',actualCloseReceiptFile:join(out,'resource-close.json'),closeHandoffPointer:'/closeHandoff',
  actualResumeFile:join(out,'after-run-resume.json'),run:receipt?.resources?.run??null,terminalPresent:receipt?.ownerOutput?.value?.terminalResult!=null,
  errors:errors.map(e=>e.phase),qualified:false,meaning:'Let this host exit. Root binds separate actual cold reads and compares full returned terminal/value/producer/ref/digest. No environment refresh or raw-prefix recapture here.'});
}else await record('RECOVERY_REQUIRED.json',{status:outer===null?'PREPARATION_STOPPED_BEFORE_ACQUISITION':'NO_SUCCESSFUL_OUTER_CLOSE',invoked,actualOutcomeRetained:sdkOutcome!==null,
 actualCompletionRetained:completion!==null,errors,qualified:false,meaning:'No successor close is asserted. Preserve actual owner records and recover under Root; no automatic retry.'});
if(errors.length)await record('DISPATCH_FAILURE.json',{at:new Date().toISOString(),errors,invoked,actualOutcomeFile:sdkOutcome===null?null:join(out,'execution.json'),
 actualCloseReceiptFile:closeReceipt===null?null:join(out,'resource-close.json'),meaning:'Actual failures retained independently; no old close transplant or automatic retry.'});
await record('outcome-summary.json',{startedUtc,endedUtc:new Date().toISOString(),wallMs:performance.now()-startedMs,marks,invoked,
 transport:'installed_sdk',sdkExitCode:receipt?.exitCode??null,outcomeKind:receipt?.ownerOutput?.outcomeKind??sdkOutcome?.kind??null,
 disposition:receipt?.ownerOutput?.value?.disposition??null,run:receipt?.resources?.run??null,physicalCloseSucceeded:closeReceipt!==null,
 errors:errors.map(e=>e.phase),qualified:false,meaning:'SDK exitCode is an Effect-host status, not CLI/process metadata. Actual typed blocked/unmet results remain unchanged.'});
console.log(JSON.stringify({status:errors.length?'SDK_NATIVE_RETURN_REQUIRES_ROOT_TRIAGE':'SDK_NATIVE_RETURNED_READBACKS_PENDING',
 outcomeKind:receipt?.ownerOutput?.outcomeKind??sdkOutcome?.kind??null,run:receipt?.resources?.run??null,physicalCloseSucceeded:closeReceipt!==null,executionRoot:out}));
if(errors.length||!closeReceipt||receipt?.failure||!receipt)process.exitCode=1;
