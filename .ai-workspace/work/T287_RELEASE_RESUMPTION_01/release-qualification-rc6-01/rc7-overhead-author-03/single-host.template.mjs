// Root-only template: B's existing preparation and cold invocation in one host.
// No executable admission exists in this preparation packet.
import {getHeapStatistics} from 'node:v8';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {installedModules,publicCaller} from '../operator-client/public-setup.mjs';
import {exclusiveRecord,commandRecorder,workerEnvironment,invokeLifecycle,eventResourceIdentity} from '../operator-client/runner.mjs';

performance.mark('module-body-entry');
const dir=dirname(fileURLToPath(import.meta.url)),out=join(dir,'execution');
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const pinnedJson=async pin=>{
 assert(pin?.path&&/^[a-f0-9]{64}$/u.test(pin.sha256)&&Number.isSafeInteger(pin.bytes),'Required actual pin unbound');
 const bytes=await readFile(pin.path);assert.equal(bytes.length,pin.bytes,pin.path);assert.equal(hash(bytes),pin.sha256,pin.path);
 return JSON.parse(bytes);
};
const phases={};
const finish=(name,start)=>{performance.mark(name+'-end');phases[name]=performance.measure(name,start,name+'-end').duration;};
let invocationStarted=false,record;

performance.mark('control-pin-verification-start');
const raw=await readFile(join(dir,'HOST_MANIFEST.json'));assert.equal(hash(raw),process.argv[2]);
const manifest=JSON.parse(raw);assert.equal(manifest.status,'ROOT_ADMITTED_NATIVE_DISPATCH');
assert(Array.isArray(manifest.files)&&manifest.files.length>0);
// Only small closed control files belong here. The actual retained resume is pinned
// and parsed once through RUNTIME_BINDINGS below, never copied into this manifest.
for(const pin of manifest.files){const b=await readFile(pin.path);assert.equal(b.length,pin.bytes,pin.path);assert.equal(hash(b),pin.sha256,pin.path);}
const binding=await json(join(dir,'RUNTIME_BINDINGS.json'));
assert.equal(binding.status,'ROOT_ADMITTED_FOR_PREPARATION');
assert.equal(binding.rootControlAdmission?.path,join(dir,'ROOT_CONTROL_ADMISSION.json'));
const admitted=await pinnedJson(binding.rootControlAdmission);
assert.deepEqual(admitted.selection,manifest.selection);
assert.deepEqual(admitted.scopeAddendum,manifest.scopeAddendum);
assert(admitted.rootFinalSourceDisposition&&admitted.actualClosedReadbacks&&admitted.closedSourceReviews?.length>=2,'Root conjunction is unbound');
await pinnedJson(admitted.rootFinalSourceDisposition);
await pinnedJson(admitted.actualClosedReadbacks);
for(const pin of admitted.closedSourceReviews)await pinnedJson(pin);
finish('control-pin-verification','control-pin-verification-start');
await mkdir(out); // A failed/incomplete host is retained; there is no retry path.
record=(p,v,raw=false)=>exclusiveRecord(out,p,v,raw);
try{
 performance.mark('resume-config-parse-start');
 const actualClose=await pinnedJson(binding.actualClose);
 assert.deepEqual(actualClose.closeHandoff.prefix,binding.actualClosePrefix);
 const retained=await pinnedJson(binding.resume); // One original complete resume acquisition.
 const profile=await json(join(dir,'PROVIDER_PROFILE.json'));
 const w=await json(join(dir,'workload.json')),grant=await json(join(dir,'NATIVE_GRANT.json'));
 const selected=await pinnedJson(grant.selection),addendum=await pinnedJson(grant.scopeAddendum);
 assert.deepEqual(grant.selection,manifest.selection);assert.deepEqual(grant.scopeAddendum,manifest.scopeAddendum);
 assert.deepEqual(grant.productWritePaths,addendum.effectiveSourceWritePaths);
 assert.deepEqual(grant.productWritePaths,admitted.productWritePaths);
 assert.equal(selected.kind,'bounded_native_known_reentry_preparation_selection');
 assert.equal(grant.status,'ROOT_ADMITTED_EXACT_NATIVE_CONSTRUCTION');
 assert.deepEqual(admitted.actualClose,binding.actualClose);
 assert.deepEqual(binding.bindingOverlayFields,['binding','catalog','catalogView']);
 const authorBinding=await pinnedJson(binding.retainedAuthorBinding);
 assert.equal(authorBinding.installedRoot,retained.installedRoot);assert.deepEqual(authorBinding.workspaceAuthority,retained.workspaceAuthority);
 const actualLatestClose=structuredClone(retained.state.closeHandoff);
 for(const key of binding.bindingOverlayFields)retained.state[key]=authorBinding.state[key];
 assert.deepEqual(retained.state.closeHandoff,actualLatestClose);
 assert.deepEqual(retained.state.closeHandoff.prefix,binding.actualClosePrefix);
 assert.equal(retained.state.environment,null);assert.equal(retained.state.resource,null);assert.equal(retained.state.selection,null);
 const work=retained.workspaceAuthority.canonicalRoot;assert.equal(work,grant.worksiteRoot);
 assert.equal(profile.outerTimeoutMs,10800000);assert.equal(profile.provider.maxTurns,320);
 assert.equal(profile.provider.absoluteTimeoutMs,5400000);assert.equal(profile.provider.inactivityTimeoutMs,1800000);
 assert.equal(profile.runtimeEnvironment.NODE_OPTIONS,'--max-old-space-size=8192');
 assert(getHeapStatistics().heap_size_limit>=8192*1024*1024,'Root must apply the selected heap at host launch');
 assert(process.env.CLAUDE_CODE_OAUTH_TOKEN,'Selected native credential unavailable');
 const config={...retained.config,processTimeoutMs:profile.outerTimeoutMs,sourceCommit:grant.sourceCommit,
  runId:'release-qualification-rc7-overhead-author-03',provider:profile.provider,toolchainEnvironment:profile.runtimeEnvironment};
 const environment=workerEnvironment(config);
 for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(key))delete process.env[key];
 Object.assign(process.env,environment);
 finish('resume-config-parse','resume-config-parse-start');

 performance.mark('source-control-verification-start');
 assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),grant.sourceCommit);
 execFileSync('/usr/bin/git',['-C',work,'diff','--cached','--quiet']);
 assert.equal(admitted.sourceBefore.path,join(dir,'SOURCE_BEFORE.json'));
 const sourceBefore=await pinnedJson(admitted.sourceBefore);assert.equal(sourceBefore.files.length,449);
 for(const f of sourceBefore.files){const b=await readFile(join(work,f.relativePath));assert.equal(b.length,f.bytes,f.relativePath);assert.equal(hash(b),f.sha256,f.relativePath);}
 assert.deepEqual(Object.keys(w.workOrders),['construction']);assert(Array.isArray(w.workOrders.construction.instructions));
 assert(w.workOrders.construction.instructions.length>0&&w.workOrders.construction.instructions.every(s=>typeof s==='string'&&s.trim().length>1));
 assert.equal(new Set(w.workOrders.construction.readFirst).size,w.workOrders.construction.readFirst.length);
 assert(w.workOrders.construction.readFirst.every(p=>w.readRoots.includes(p)));
 assert.deepEqual(w.workOrders.construction.writeRoots,grant.nativeWriteRoots);assert.equal(grant.newFilesExpectedAfterConstruction.length,0);
 finish('source-control-verification','source-control-verification-start');

 performance.mark('installed-modules-start');
 const runtime=await installedModules(retained.installedRoot),{product,abg,api}=runtime;
 const nativeOwner=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/product/native_workspace_work.js')));
 const actor=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/actor_process.js')));
 finish('installed-modules','installed-modules-start');
 const caller=publicCaller({root:out,runtime,native:retained.native,config,record,
  command:commandRecorder(out,{environment,timeoutMs:profile.outerTimeoutMs,maxOutputBytes:536870912}),actorRef:'actor://abiogenesis/operator/codex-root'});
 Object.assign(caller.state,retained.state);caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
 performance.mark('caller-refresh-start');
 const env=caller.refresh(); // Exactly one parent caller/environment acquisition.
 assert.equal(env.workspaceBinding.roots.productRoot,retained.installedRoot);
 for(const install of env.productInstalls)assert(await product.installedProductContentMatches(install));
 finish('caller-refresh','caller-refresh-start');
 performance.mark('prefix-identity-start');
 const log=fileURLToPath(binding.actualClosePrefix.eventLogRef),initialIdentity=await eventResourceIdentity(log);
 assert.equal(initialIdentity.byteCount,binding.actualClosePrefix.prefixLength);assert.equal(initialIdentity.digest,binding.actualClosePrefix.prefixDigest);
 finish('prefix-identity','prefix-identity-start');

 performance.mark('context-observation-start');
 const context=await product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
  protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
 assert.equal(context.kind,'worksite_context_observation');
 const entries=new Map(context.entries.map(e=>[e.relativePath,e])),future=new Set(grant.expectedFutureFiles);
 for(const p of w.testing.selectedPaths)assert.equal(entries.get(p)?.state,future.has(p)?'absent':'file',p);
 for(const s of w.sources)assert.equal(entries.get(s.path)?.digest,s.digest,s.path);
 finish('context-observation','context-observation-start');
 await record('run.json',{kind:'existing_native_author_one_host_preparation',sourceCommit:grant.sourceCommit,sourceBasis:'none',providerCalls:0,RunAdmissions:0,programRef:product.NATIVE_WORKSPACE_WORK_IDS.programRef});
 performance.mark('construct-call-start');
 let input;const ids=product.NATIVE_WORKSPACE_WORK_IDS,order=w.workOrders.construction,ns='abiogenesis/t287/rc7-overhead-author-03';
 const constructed=await api.constructInstalledStartCall({selection:{memberKey:'start',target:{kind:'next'},rootMode:'direct',fhMode:'direct'},
  programRef:ids.programRef,catalog:caller.state.catalog,catalogView:caller.state.catalogView,applications:[],admittedInstalls:env.productInstalls,
  workspaceBinding:env.workspaceBinding,verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(env.artifactTruth,i),actorRef:caller.actorRef,
  input:{factory:({workspaceBinding,grants})=>{assert.equal(grants.length,1);input=product.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthorityBasis,
   workspaceBinding,capabilityGrant:grants[0],context,outcome:order.outcome,instructions:order.instructions,readFirst:order.readFirst,writeRoots:order.writeRoots,checks:order.checks});
   assert(product.isNativeWorkspaceWorkTask(input));assert.equal(input.assessment,undefined);return input;}},inputValueRef:'value://'+ns+'/input',source:{kind:'none'},
  eventResource:caller.reopen(),envelope:{definitionContractCoordinates:retained.native.verified.definitionContractCoordinates,requestRef:'request://'+ns+'/start',correlationRef:'correlation://'+ns,
   eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(dir,'ROOT_CONTROL_ADMISSION.json')).href]}});
 assert.equal(constructed.kind,'installed_start_call','Existing start-call owner refused construction');const call=constructed.call;
 assert.equal(call.resources.source.kind,'none');assert.equal(call.invocation.request.sourceBasis.kind,'none');
 finish('construct-call','construct-call-start');

 performance.mark('capacity-canonical-digest-start');
 const renderedBytes=Buffer.byteLength(nativeOwner.renderNativeWorkspaceWorkOrder(input)),reserveBytes=131072;
 assert(renderedBytes+reserveBytes<w.maxPromptBytes,'Native work order exceeds selected prompt budget');
 const capacity={kind:'actual_existing_native_order_render_measurement',renderedNativeOrderBytes:renderedBytes,maxPromptBytes:w.maxPromptBytes,reserveBytes,fitsWithReserve:true,
  providerCalls:0,RunAdmissions:0,limits:['Existing native order text; full transport/instruction assembly retains existing guards.']};
 const inputCanonicalDigest=product.sha256Canonical(input),callCanonicalDigest=product.sha256Canonical(call);
 await writeFile(join(dir,'NATIVE_CAPACITY_PREFLIGHT.json'),JSON.stringify(capacity,null,2)+'\n',{flag:'wx'});
 finish('capacity-canonical-digest','capacity-canonical-digest-start');
 performance.mark('prefix-preservation-start');
 assert.deepEqual(await eventResourceIdentity(log),initialIdentity,'Mechanical preparation changed the actual prefix');
 finish('prefix-preservation','prefix-preservation-start');
 const prepared={status:'PREPARED_IN_SAME_HOST',programRef:ids.programRef,sourceCommit:grant.sourceCommit,sourceBefore:admitted.sourceBefore,
  worksite:work,installedRoot:retained.installedRoot,contextDigest:context.observationDigest,observedEntries:context.entries.length,selectedFiles:w.testing.selectedPaths.length,
  ambientEnvironment:actor.selectedWorksiteCommandAmbientEnvironment(),eventPrefix:caller.state.closeHandoff.prefix,inputCanonicalDigest,callCanonicalDigest,capacity,phaseMs:phases,
  retainedResume:binding.resume,meaning:'Metadata only. Input, call, caller and environment remain the same live objects; no intermediate resume or prepared-call body copy/reparse.'};
 await record('PREPARED_CALL.json',prepared);
 const startedUtc=new Date().toISOString(),start=performance.now();
 phases.moduleBodyToStartedMs=start-performance.getEntriesByName('module-body-entry')[0].startTime;
 await record('STARTED.json',{startedUtc,pid:process.pid,hostHeapLimitBytes:getHeapStatistics().heap_size_limit,sourceCommit:grant.sourceCommit,
  manifestSha256:hash(raw),contextDigest:context.observationDigest,callCanonicalDigest,provider:profile.provider,phaseMs:phases,
  automaticRetry:false,qualified:false,role:'Root operator activation; ABG alone dispatches selected native work'});
 invocationStarted=true;
 const execution=await invokeLifecycle(caller,retained.setup.installations,call,environment); // Unchanged cold owner and exact prepared call.
 const invocationWallMs=performance.now()-start;
 await record('execution.json',execution); // One complete owner-returned execution; summaries reference it.
 assert(execution.receipt?.resources?.eventResource?.closeHandoff,'Actual invocation returned no close handoff');
 const receipt=execution.receipt;caller.state.environment=null;
 await record('after-run-resume.json',{...retained,config,state:{...caller.state,environment:null}}); // One actual successor resume.
 await record('READBACKS_PENDING.json',{status:'ACTUAL_NATIVE_RECEIPT_RETAINED_READBACKS_PENDING',actualExecutionFile:join(out,'execution.json'),actualResumeFile:join(out,'after-run-resume.json'),
  actualClose:receipt.resources.eventResource.closeHandoff,run:receipt.resources.run??null,terminalPresent:receipt.ownerOutput?.value?.terminalResult!=null,
  postReturnSelectionFile:join(dir,'POST_RETURN_CUSTODY.json'),qualified:false,
  meaning:'Let this host exit. Bind actual CLI receipt, physical Result row and after observation; keep B mandatory cold reads unchanged. Any selected fresh read must match the complete original typed terminal, not exit zero or null alone.'});
 await record('outcome-summary.json',{startedUtc,endedUtc:new Date().toISOString(),phaseMs:phases,invocationWallMs,exitCode:execution.execution.exitCode,
  outcomeKind:receipt.ownerOutput?.outcomeKind,disposition:receipt.ownerOutput?.value?.disposition??null,run:receipt.resources.run??null,
  terminalPresent:receipt.ownerOutput?.value?.terminalResult!=null,actualExecutionFile:join(out,'execution.json'),readbacks:'pending_root_selection',qualified:false});
 console.log(JSON.stringify({status:'NATIVE_RETURNED_ACTUAL_RESOURCES_CUSTODY_PENDING',outcomeKind:receipt.ownerOutput?.outcomeKind,run:receipt.resources.run??null,invocationWallMs,executionRoot:out}));
}catch(error){
 await record(invocationStarted?'DISPATCH_FAILURE.json':'PREPARATION_FAILURE.json',{at:new Date().toISOString(),name:error.name,message:error.message,observation:error.observation??null,
  phaseMs:phases,meaning:'Actual failure retained; no older close substituted and no automatic retry.'});throw error;
}
