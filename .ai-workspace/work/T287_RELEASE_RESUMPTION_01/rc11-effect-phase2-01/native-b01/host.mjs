// RC11: maintained fresh imported setup through pinned RC10 Public owners. Separate setup and native admission.
import assert from 'node:assert/strict';
import {validateTransport} from './transport-preflight.mjs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,mkdir,statfs} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createInterface} from 'node:readline';
const dir=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const [bindingPath,bindingDigest,setupAdmissionPath,setupAdmissionDigest]=process.argv.slice(2);
assert(bindingPath&&bindingDigest&&setupAdmissionPath&&setupAdmissionDigest,'exact binding and setup admission pins required');
const bytes=await readFile(bindingPath);assert.equal(sha(bytes),bindingDigest);
const setupAdmissionBytes=await readFile(setupAdmissionPath);assert.equal(sha(setupAdmissionBytes),setupAdmissionDigest);
const setupAdmission=JSON.parse(setupAdmissionBytes);assert.equal(setupAdmission.status,'ROOT_ADMITTED_PHASE2_SETUP');assert.equal(setupAdmission.bindingSha256,bindingDigest);
const binding=JSON.parse(bytes),bindingSha256=sha(bytes),start=performance.now(),startedUtc=new Date().toISOString();
assert.equal(binding.status,'PREPARED_PHASE2_NATIVE_EXECUTION_HELD');
assert.equal(setupAdmission.scopeSha256,binding.activation.sha256);
assert.equal(binding.sourceRoot,'/private/tmp/abg-rc11-foundation-20261110-01');
assert.equal(binding.runtimeRoot,join(dir,'runtime-001'));
assert(setupAdmission.grantsFreshPublicSetup===true&&setupAdmission.providerDispatch===false,'setup grant must hold native dispatch');
Object.assign(process.env,binding.environment);
const pinned=async p=>{const b=await readFile(p.path);assert.equal(b.length,p.bytes,p.path);assert.equal(sha(b),p.sha256,p.path);return b;};
for(const p of [...(setupAdmission.files??[]),binding.builderPin,binding.scopeInputGrant,...binding.readOnlyInputPins,binding.activation,binding.task,binding.archive,binding.sourceMaterialization,binding.providerExecutable,binding.providerWrapper,...Object.values(binding.sourceHelpers),...binding.dependencyPins,binding.sourceInventory,...binding.proofControls])await pinned(p);
const transportPreflight=await validateTransport(binding);
const task=JSON.parse(await pinned(binding.task));assert(Array.isArray(task.instructions)&&task.instructions.every(x=>typeof x==='string'&&x.length>0&&!x.includes('\0')),'installed instructions array contract');const free=async()=>{const s=await statfs(dir);return s.bavail*s.bsize;};
assert((await free())>binding.reserveBytes);assert.equal(execFileSync('/usr/bin/git',['-C',binding.sourceRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),binding.sourceCommit);
const source=JSON.parse(await pinned(binding.sourceInventory));
const checkSource=async()=>{assert.equal(execFileSync('/usr/bin/git',['-C',binding.sourceRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),binding.sourceCommit);for(const control of binding.readOnlyInputPins)await pinned(control);for(const row of source.rows){const actual=await readFile(join(binding.sourceRoot,row.path));assert.equal(actual.length,row.bytes,row.path);assert.equal(sha(actual),row.sha256,row.path);}return source.rows.length;};
await checkSource();for(const p of binding.prebuiltPins??[])await pinned(p);
const setupOwner=await import(pathToFileURL(binding.sourceHelpers['public-setup.mjs'].path));
const runner=await import(pathToFileURL(binding.sourceHelpers['runner.mjs'].path));
await mkdir(binding.scratchRoot,{mode:0o700});
for(const path of [binding.environment.TMPDIR,binding.environment.NPM_CONFIG_CACHE])await mkdir(path,{mode:0o700});
for(const path of binding.nativeScratchDirectories)await mkdir(path,{recursive:true,mode:0o700});
await mkdir(binding.runtimeRoot,{mode:0o700});
const record=(p,v,raw=false)=>runner.exclusiveRecord(binding.runtimeRoot,p,v,raw);
const runtime=await setupOwner.installedModules(binding.bootstrapRoot),{product,abg,api}=runtime;
const manifest=JSON.parse(await readFile(join(binding.bootstrapRoot,'product-toolchain-manifest.json'),'utf8'));
const config={runId:binding.id,sourceCommit:binding.sourceCommit,worksiteRoot:binding.sourceRoot,bootstrapRoot:binding.bootstrapRoot,
  nodePath:process.execPath,toolchains:{npm:{executable:'/opt/homebrew/bin/npm'}},recursionBound:8,setupEnvironment:binding.environment,
  inheritEnvironment:['HOME','PATH','LANG','LC_ALL','TMPDIR'],toolchainEnvironment:binding.workerEnvironment,provider:binding.provider};
const phases={},mark=name=>{phases[name]={utc:new Date().toISOString(),elapsedMs:performance.now()-start,memory:process.memoryUsage()};};
let caller,setup,call,input,outcome=null,launched=false,failure=null,actualClose=null,readbackFailure=null;
try{
  await record('run.json',{kind:'effect_phase2_operator_held_setup',startedUtc,pid:process.pid,bindingSha256,sourceCommit:binding.sourceCommit,providerCalls:0});
  const native=await setupOwner.verifyArtifact(runtime,{artifactPath:binding.archive.path,manifest,expectedArtifactDigest:'sha256:'+binding.archive.sha256},record,'abg');mark('artifactVerified');
  caller=setupOwner.publicCaller({root:binding.runtimeRoot,runtime,native,config,record,actorRef:'actor://abiogenesis/operator/codex-root',
    command:runner.commandRecorder(binding.runtimeRoot,{environment:binding.environment,timeoutMs:binding.proofTimeoutMs})});
  // PHASE2-02: actual Public open of this setup-established unbound manifest.
  const manifestBytes=await pinned(binding.workspaceOpenManifest),existingManifest=JSON.parse(manifestBytes);
  assert.equal(existingManifest.canonicalRoot,binding.sourceRoot);assert.equal(existingManifest.bindingRef,null);
  const expectedAuthority={ref:existingManifest.authorityBasis.authorityRef,digest:existingManifest.authorityBasis.authorityDigest};
  assert.deepEqual(expectedAuthority,binding.expectedWorkspaceAuthority);
  const authorize=caller.authorize,invoke=caller.invoke;let opened=0,openObserved=0;
  caller.authorize=(packet,request,resources,slots)=>packet===product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean
    ?(assert.equal(opened++,0),authorize(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.open.open,
      {targetRoot:binding.sourceRoot,expectedAuthority},resources,{}))
    :authorize(packet,request,resources,slots);
  caller.invoke=async(label,call,options)=>{
    const actual=await invoke(label,call,options);
    if(label==='workspace-create'){
      assert.equal(openObserved++,0);assert.equal(actual.call.invocation.definitionKey.operationId,'abg.operation.workspace.open');
      assert.equal(actual.call.invocation.definitionKey.memberKey,'open');assert.equal(actual.receipt.ownerOutput.outcomeKind,'result');
      assert.equal(actual.receipt.ownerOutput.value.disposition,'unbound');assert.deepEqual(actual.receipt.ownerOutput.value.authority,expectedAuthority);
      assert.equal(actual.receipt.resources.manifest.locator,binding.workspaceOpenManifest.path);
      assert.equal(actual.receipt.resources.manifest.valueDigest,product.sha256Canonical(existingManifest));
      await pinned(binding.workspaceOpenManifest);await record('WORKSPACE_OPEN.json',{definitionKey:actual.call.invocation.definitionKey,disposition:actual.receipt.ownerOutput.value.disposition,manifest:binding.workspaceOpenManifest,authority:expectedAuthority,receipt:actual.receipt.resources});
    }
    return actual;
  };
  setup=await setupOwner.populateSandbox(caller,{retain:true,program:'library'});assert.equal(opened,1);assert.equal(openObserved,1);await pinned(binding.workspaceOpenManifest);await checkSource();mark('setupHeld');
  const env=caller.refresh(),ids=product.NATIVE_WORKSPACE_WORK_IDS;
  assert.equal(env.workspaceBinding.roots.productRoot,caller.installedRoot);
  const nativePrograms=caller.state.catalog.boundPublications.flatMap(p=>p.programs).filter(p=>p.programRef===ids.programRef);assert.equal(nativePrograms.length,1);
  // Native selection is distinct from the setup's unchanged library binding/conformance.
  const nativeProgram=nativePrograms[0],nativeView=setupOwner.requireKind(product.narrowGraphFunctionCatalog(caller.state.catalog,[...nativeProgram.callableMembership]),'graph_function_catalog_view','native-view');
  const context=await product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
    protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:task.readRoots,maxFiles:task.maxContextFiles,maxBytes:task.maxContextBytes});
  assert.equal(context.kind,'worksite_context_observation');mark('contextObserved');
  const entry=caller.state.selection,constructed=await api.constructInstalledStartCall({selection:{memberKey:'start',target:{kind:'next'},rootMode:'direct',fhMode:'direct'},
    programRef:ids.programRef,catalog:caller.state.catalog,catalogView:nativeView,applications:[],admittedInstalls:env.productInstalls,workspaceBinding:env.workspaceBinding,
    verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(env.artifactTruth,i),actorRef:caller.actorRef,
    input:{factory:({workspaceBinding,grants})=>{assert.equal(grants.length,1);input=product.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding,
      capabilityGrant:grants[0],context,outcome:task.outcome,instructions:task.instructions,readFirst:task.readFirst,writeRoots:task.writeRoots,checks:task.checks});return input;}},
    inputValueRef:'value://abiogenesis/t287/rc11-effect-phase2/input',source:{kind:'none'},eventResource:entry,
    envelope:{definitionContractCoordinates:native.verified.definitionContractCoordinates,requestRef:'request://abiogenesis/t287/rc11-effect-phase2/start',correlationRef:'correlation://abiogenesis/t287/rc11-effect-phase2',
      eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(binding.task.path).href]}});
  assert.equal(constructed.kind,'installed_start_call','Native start construction: '+constructed.kind+' / '+String(constructed.code??''));call=constructed.call;assert.strictEqual(call.resources.eventResource,entry);
  const nativeOwner=await import(pathToFileURL(join(binding.bootstrapRoot,'build/code/src/product/native_workspace_work.js')));
  const renderedBytes=Buffer.byteLength(nativeOwner.renderNativeWorkspaceWorkOrder(input));assert(renderedBytes+131072<task.maxPromptBytes);mark('nativeCallConstructed');
  const prepared={status:'HELD_PREPARED_NO_NATIVE_DISPATCH',pid:process.pid,startedUtc,bindingSha256,task:binding.task,sourceCommit:binding.sourceCommit,sourcePreimage:binding.sourceInventory,sourceRows:source.rows.length,
    installedRoot:caller.installedRoot,workspaceBinding:caller.state.binding,setupProgramBinding:caller.state.programBinding,
    nativeSelection:{programRef:ids.programRef,startRef:ids.startRef,programDigest:product.sha256Canonical(nativeProgram),viewDigest:product.sha256Canonical(nativeView)},
    invocationRef:call.invocation.invocationRef,invocationDigest:call.invocation.invocationDigest,heldPrefix:entry.prefix,
    context:{digest:context.observationDigest,entries:context.entries.length,fileMembers:context.entries.filter(e=>e.state==='file').length,sourceBytes:context.entries.reduce((sum,e)=>sum+(e.state==='file'?e.byteLength:0),0),canonicalBytes:Buffer.byteLength(product.canonicalJson(context))},transportPreflight,renderedBytes,renderedMeasurementScope:'Exact installed native work-order text; provider/system scaffolding is not measured.',phases,freeBytes:await free(),providerCalls:0,RunAdmissions:0,
    meaning:'Actual setup owners and canonical native call constructed. Same live owner resource, environment, Catalog and call retained in this process. No serialized resume or call is re-ingested; native Program execution is unproved until Root admits and the actual SDK returns.'};
  await record('PREPARED.json',prepared);const preparedBytes=await readFile(join(binding.runtimeRoot,'PREPARED.json')),preparedSha256=sha(preparedBytes);
  console.log(JSON.stringify({status:prepared.status,pid:process.pid,preparedPath:join(binding.runtimeRoot,'PREPARED.json'),preparedSha256,wallMs:performance.now()-start,providerCalls:0}));
  // This stdin pin is operator control only. Root supplies its exact admission after consuming PREPARED.
  const lines=createInterface({input:process.stdin,terminal:false});let admissionPin;
  for await(const line of lines){if(!line.trim())continue;admissionPin=JSON.parse(line);break;}lines.close();
  assert(admissionPin,'No admission received; close without dispatch');assert.equal(dirname(admissionPin.path),dir);
  const admission=JSON.parse(await pinned(admissionPin));assert.equal(admission.status,'ROOT_ADMITTED_NATIVE_DISPATCH');
  assert.equal(admission.bindingSha256,bindingSha256);assert.equal(admission.preparedSha256,preparedSha256);
  for(const p of admission.files??[])await pinned(p);await checkSource();for(const p of binding.prebuiltPins??[])await pinned(p);await validateTransport(binding);
  abg.assertAcquiredAbgEventResourceSelectionCurrent(entry);assert((await free())>binding.reserveBytes);
  // Source-only author admission binds the already observed exact task; external evidence/proof is separately admitted.
  assert.equal(admission.taskSha256,binding.task.sha256);
  await pinned(binding.task);
  await record('STARTED.json',{utc:new Date().toISOString(),pid:process.pid,admission:admissionPin,invocationRef:call.invocation.invocationRef,phases});
  mark('dispatch');launched=true;outcome=await runner.invokeLifecycle(caller,setup.installations,call,runner.workerEnvironment(config));mark('sdkReturned');
  await record('NATIVE_RETURN.json',{utc:new Date().toISOString(),actualOutcomePath:join(binding.runtimeRoot,'calls/lifecycle-start.outcome.json'),run:outcome.receipt?.resources?.run??null,phases,launched});
}catch(error){failure={name:error.name,message:error.message,observation:error.observation??null};await record('FAILURE.json',{utc:new Date().toISOString(),failure,launched,phases});process.exitCode=1;}
finally{
  if(caller?.state.resource){try{const close=caller.close(abg.selectHeldEventStoreDurablePrefix(caller.state.resource.store));await record('resource-close.json',close);actualClose=close;mark('closed');}
    catch(error){await record('CLOSE_FAILURE.json',{message:error.message});try{abg.abandonAbgEventResource(caller.state.resource);}catch{}process.exitCode=1;}}
  if(actualClose&&outcome?.receipt?.resources?.run){
    try{const reads=await runner.freshReadbacks(caller,outcome);await record('FRESH_READBACKS.json',{status:'ACTUAL_COLD_READBACKS_RECORDED',actualClosePrefix:actualClose.closeHandoff.prefix,observations:runner.freshReadbackRecord(reads,product.sha256Canonical),standing:'Actual result/replay outcomes; absent or failed terminal remains absent or failed. No source acceptance.'});mark('freshReadbacks');}
    catch(error){readbackFailure={name:error.name,message:error.message,observation:error.observation??null};await record('READBACK_FAILURE.json',readbackFailure);process.exitCode=1;}
  }
  await record('FINAL.json',{utc:new Date().toISOString(),launched,phases,failure,readbackFailure,actualPhysicalClose:actualClose!==null,run:outcome?.receipt?.resources?.run??null,qualified:false});
  console.log(JSON.stringify({status:failure||readbackFailure||!actualClose?'RETURN_REQUIRES_ROOT_TRIAGE':'RETURNED_AND_CLOSED',launched,runtimeRoot:binding.runtimeRoot}));
}
