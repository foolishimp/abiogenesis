// Operator composition over immutable RC7 setup/SDK owners. No Product runtime authority.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,mkdir,statfs} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createInterface} from 'node:readline';
const dir=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=await readFile(join(dir,'BINDING.json'));assert.equal(sha(bytes),process.argv[2]);
const binding=JSON.parse(bytes),bindingSha256=sha(bytes),start=performance.now(),startedUtc=new Date().toISOString();
Object.assign(process.env,binding.environment);
const pinned=async p=>{const b=await readFile(p.path);assert.equal(b.length,p.bytes,p.path);assert.equal(sha(b),p.sha256,p.path);return b;};
for(const p of [binding.activation,binding.task,binding.archive,binding.sourceMaterialization,binding.providerExecutable,binding.providerWrapper,...Object.values(binding.sourceHelpers),...binding.dependencyPins])await pinned(p);
const task=JSON.parse(await pinned(binding.task)),free=async()=>{const s=await statfs(dir);return s.bavail*s.bsize;};
assert((await free())>binding.reserveBytes);assert.equal(execFileSync('/usr/bin/git',['-C',binding.sourceRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),binding.sourceCommit);
execFileSync('/usr/bin/git',['-C',binding.sourceRoot,'diff','--quiet']);
const setupOwner=await import(pathToFileURL(binding.sourceHelpers['public-setup.mjs'].path));
const runner=await import(pathToFileURL(binding.sourceHelpers['runner.mjs'].path));
await mkdir(binding.runtimeRoot,{mode:0o700});
const record=(p,v,raw=false)=>runner.exclusiveRecord(binding.runtimeRoot,p,v,raw);
const runtime=await setupOwner.installedModules(binding.bootstrapRoot),{product,abg,api}=runtime;
const manifest=JSON.parse(await readFile(join(binding.bootstrapRoot,'product-toolchain-manifest.json'),'utf8'));
const config={runId:'rc8-reference-preservation-01',sourceCommit:binding.sourceCommit,worksiteRoot:binding.sourceRoot,bootstrapRoot:binding.bootstrapRoot,
  nodePath:process.execPath,toolchains:{npm:{executable:'/opt/homebrew/bin/npm'}},recursionBound:8,setupEnvironment:binding.environment,
  inheritEnvironment:['HOME','PATH','LANG','LC_ALL','TMPDIR'],toolchainEnvironment:binding.environment,provider:binding.provider};
const phases={},mark=name=>{phases[name]={utc:new Date().toISOString(),elapsedMs:performance.now()-start,memory:process.memoryUsage()};};
let caller,setup,call,input,outcome=null,launched=false,failure=null;
try{
  await record('run.json',{kind:'rc8_operator_held_setup',startedUtc,pid:process.pid,bindingSha256,sourceCommit:binding.sourceCommit,providerCalls:0});
  const native=await setupOwner.verifyArtifact(runtime,{artifactPath:binding.archive.path,manifest,expectedArtifactDigest:'sha256:'+binding.archive.sha256},record,'abg');mark('artifactVerified');
  caller=setupOwner.publicCaller({root:binding.runtimeRoot,runtime,native,config,record,actorRef:'actor://abiogenesis/operator/codex-root',
    command:runner.commandRecorder(binding.runtimeRoot,{environment:binding.environment,timeoutMs:binding.proofTimeoutMs})});
  // Exact existing imported-workspace adaptation from setup-rc6.mjs; setup graph stays maintained.
  const authorize=caller.authorize;let imported=0;
  caller.authorize=(packet,request,resources,slots)=>packet===product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean
    ?(assert.equal(imported++,0),authorize(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.imported,
      {targetRoot:binding.sourceRoot,createPolicy:'imported',importAuthority:{ref:pathToFileURL(binding.activation.path).href,digest:'sha256:'+binding.activation.sha256},preservationPolicy:'preserve_all_existing'},resources,slots))
    :authorize(packet,request,resources,slots);
  setup=await setupOwner.populateSandbox(caller,{retain:true,program:'library'});assert.equal(imported,1);mark('setupHeld');
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
    inputValueRef:'value://abiogenesis/t287/rc8-ref01/input',source:{kind:'none'},eventResource:entry,
    envelope:{definitionContractCoordinates:native.verified.definitionContractCoordinates,requestRef:'request://abiogenesis/t287/rc8-ref01/start',correlationRef:'correlation://abiogenesis/t287/rc8-ref01',
      eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(binding.task.path).href]}});
  assert.equal(constructed.kind,'installed_start_call','Native start construction: '+constructed.kind+' / '+String(constructed.code??''));call=constructed.call;assert.strictEqual(call.resources.eventResource,entry);
  const nativeOwner=await import(pathToFileURL(join(binding.bootstrapRoot,'build/code/src/product/native_workspace_work.js')));
  const renderedBytes=Buffer.byteLength(nativeOwner.renderNativeWorkspaceWorkOrder(input));assert(renderedBytes+131072<task.maxPromptBytes);mark('nativeCallConstructed');
  const prepared={status:'HELD_PREPARED_NO_NATIVE_DISPATCH',pid:process.pid,startedUtc,bindingSha256,task:binding.task,sourceCommit:binding.sourceCommit,
    installedRoot:caller.installedRoot,workspaceBinding:caller.state.binding,setupProgramBinding:caller.state.programBinding,
    nativeSelection:{programRef:ids.programRef,startRef:ids.startRef,programDigest:product.sha256Canonical(nativeProgram),viewDigest:product.sha256Canonical(nativeView)},
    invocationRef:call.invocation.invocationRef,invocationDigest:call.invocation.invocationDigest,heldPrefix:entry.prefix,
    context:{digest:context.observationDigest,entries:context.entries.length},renderedBytes,phases,freeBytes:await free(),providerCalls:0,RunAdmissions:0,
    meaning:'Actual setup owners and canonical native call constructed. Same live owner resource, environment, Catalog and call retained in this process. No serialized resume or call is re-ingested; native Program execution is unproved until Root admits and the actual SDK returns.'};
  await record('PREPARED.json',prepared);const preparedBytes=await readFile(join(binding.runtimeRoot,'PREPARED.json')),preparedSha256=sha(preparedBytes);
  console.log(JSON.stringify({status:prepared.status,pid:process.pid,preparedPath:join(binding.runtimeRoot,'PREPARED.json'),preparedSha256,wallMs:performance.now()-start,providerCalls:0}));
  // This stdin pin is operator control only. Root supplies its exact admission after consuming PREPARED.
  const lines=createInterface({input:process.stdin,terminal:false});let admissionPin;
  for await(const line of lines){if(!line.trim())continue;admissionPin=JSON.parse(line);break;}lines.close();
  assert(admissionPin,'No admission received; close without dispatch');assert.equal(dirname(admissionPin.path),dir);
  const admission=JSON.parse(await pinned(admissionPin));assert.equal(admission.status,'ROOT_ADMITTED_NATIVE_DISPATCH');
  assert.equal(admission.bindingSha256,bindingSha256);assert.equal(admission.preparedSha256,preparedSha256);
  for(const p of admission.files??[])await pinned(p);execFileSync('/usr/bin/git',['-C',binding.sourceRoot,'diff','--quiet']);
  abg.assertAcquiredAbgEventResourceSelectionCurrent(entry);assert((await free())>binding.reserveBytes);
  await record('STARTED.json',{utc:new Date().toISOString(),pid:process.pid,admission:admissionPin,invocationRef:call.invocation.invocationRef,phases});
  mark('dispatch');launched=true;outcome=await runner.invokeLifecycle(caller,setup.installations,call,runner.workerEnvironment(config));mark('sdkReturned');
  await record('NATIVE_RETURN.json',{utc:new Date().toISOString(),actualOutcomePath:join(binding.runtimeRoot,'calls/lifecycle-start.outcome.json'),run:outcome.receipt?.resources?.run??null,phases,launched});
}catch(error){failure={name:error.name,message:error.message,observation:error.observation??null};await record('FAILURE.json',{utc:new Date().toISOString(),failure,launched,phases});process.exitCode=1;}
finally{
  if(caller?.state.resource){try{const close=caller.close(abg.selectHeldEventStoreDurablePrefix(caller.state.resource.store));await record('resource-close.json',close);mark('closed');}
    catch(error){await record('CLOSE_FAILURE.json',{message:error.message});try{abg.abandonAbgEventResource(caller.state.resource);}catch{}process.exitCode=1;}}
  await record('FINAL.json',{utc:new Date().toISOString(),launched,phases,failure,run:outcome?.receipt?.resources?.run??null,qualified:false});
  console.log(JSON.stringify({status:failure?'RETURN_REQUIRES_ROOT_TRIAGE':'RETURNED_AND_CLOSED',launched,runtimeRoot:binding.runtimeRoot}));
}
