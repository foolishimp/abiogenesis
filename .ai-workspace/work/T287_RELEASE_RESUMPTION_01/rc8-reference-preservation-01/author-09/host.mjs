// Retained owner session from the actual preceding close; stdin admits one native call.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,mkdir,statfs} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createInterface} from 'node:readline';
const processStartedUtc=new Date().toISOString(),processStarted=performance.now();
const dir=dirname(fileURLToPath(import.meta.url)),sha=x=>createHash('sha256').update(x).digest('hex');
const pinned=async p=>{const bytes=await readFile(p.path);assert.equal(bytes.length,p.bytes,p.path);assert.equal(sha(bytes),p.sha256,p.path);return bytes;};
const bindingBytes=await readFile(join(dir,'BINDING.json'));assert.equal(sha(bindingBytes),process.argv[2]);
const selected=JSON.parse(bindingBytes);assert.equal(selected.status,'ROOT_SELECTED_SUCCESSOR_SCOPE');
const b={...JSON.parse(await pinned(selected.baseControls)),...selected};
const preparation=JSON.parse(await pinned(b.preparation)),task=JSON.parse(await pinned(b.task));
for(const p of [b.scopeGrant,b.archive,b.providerExecutable,b.providerWrapper,...Object.values(b.sourceHelpers),...b.dependencyPins])await pinned(p);
const source=JSON.parse(await pinned(preparation.sourceFreeze));
const checkSource=async()=>{assert.equal(execFileSync('/usr/bin/git',['-C',b.sourceRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),b.sourceCommit);for(const p of source.rows){const bytes=await readFile(join(b.sourceRoot,p.path));assert.equal(bytes.length,p.bytes,p.path);assert.equal(sha(bytes),p.sha256,p.path);}return source.rows.length;};
await checkSource();Object.assign(process.env,b.environment);
const free=async()=>{const s=await statfs(dir);return s.bavail*s.bsize;};assert((await free())>b.reserveBytes);
const owner=await import(pathToFileURL(b.sourceHelpers['public-setup.mjs'].path)),runner=await import(pathToFileURL(b.sourceHelpers['runner.mjs'].path));
await mkdir(b.runtimeRoot,{mode:0o700});const record=(p,v,raw=false)=>runner.exclusiveRecord(b.runtimeRoot,p,v,raw);
const runtime=await owner.installedModules(b.bootstrapRoot),{product,abg,api}=runtime;
const startedUtc=new Date().toISOString(),started=performance.now(),phases={},mark=name=>{phases[name]={utc:new Date().toISOString(),elapsedMs:performance.now()-started,memory:process.memoryUsage()};};
const config={runId:b.id,sourceCommit:b.sourceCommit,worksiteRoot:b.sourceRoot,bootstrapRoot:b.bootstrapRoot,nodePath:process.execPath,toolchains:{npm:{executable:'/opt/homebrew/bin/npm'}},recursionBound:8,setupEnvironment:b.environment,inheritEnvironment:['HOME','PATH','LANG','LC_ALL','TMPDIR'],toolchainEnvironment:b.environment,provider:b.provider};
let caller,outcome=null,launched=false,failure=null;
try{
  await record('run.json',{kind:'rc8_operator_actual_close_successor',startedUtc,pid:process.pid,bindingSha256:sha(bindingBytes),sourceDigest:source.sourceDigest,sourceRows:source.rows.length,providerCalls:0});
  const manifest=JSON.parse(await readFile(join(b.bootstrapRoot,'product-toolchain-manifest.json'),'utf8'));
  const native=await owner.verifyArtifact(runtime,{artifactPath:b.archive.path,manifest,expectedArtifactDigest:'sha256:'+b.archive.sha256},record,'abg');mark('artifactVerified');
  const prior=JSON.parse(await pinned(preparation.priorPreparedCoordinates)),closed=JSON.parse(await pinned(preparation.actualClose));
  const consumerSource=JSON.parse(await pinned(preparation.consumerAcquisition));
  const consumerVerification=await product.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request:consumerSource.request});
  owner.requireKind(consumerVerification,'product_verification_success','consumer-cold-verification');await record('consumer-reacquisition.json',{request:consumerSource.request,verification:consumerVerification});mark('consumerArtifactVerified');
  caller=owner.publicCaller({root:b.runtimeRoot,runtime,native,config,record,actorRef:'actor://abiogenesis/operator/codex-root',command:runner.commandRecorder(b.runtimeRoot,{environment:b.environment,timeoutMs:b.proofTimeoutMs})});
  caller.state.binding=prior.workspaceBinding;caller.state.closeHandoff=closed.closeHandoff;caller.installedRoot=prior.installedRoot;caller.acquire(caller.reopen());mark('resourceReacquired');
  const env=caller.refresh();caller.state.resolvedLock=env.resolvedProductLock;caller.workspaceAuthority=env.workspaceAuthorityBasis;mark('environmentReconstructed');
  assert.equal(env.workspaceBinding.roots.productRoot,caller.installedRoot);assert.equal(env.productInstalls.length,2);
  const consumerOwner=await import(pathToFileURL(b.sourceHelpers['consumer.mjs'].path));
  const core=owner.corePublications(runtime.gtl,native.verified),library=core.find(p=>p.programs.some(p=>p.programRef===product.governanceRef('program','default')));assert(library);
  const cv=consumerVerification.verifiedArtifact,data=consumerOwner.consumerDeclaration(runtime.gtl,product,library,config.recursionBound);
  const publication=runtime.gtl.modulePublication({...data,artifactDigest:cv.artifactDigest,productContentDigest:cv.productContentDigest,productManifestDigest:cv.manifestDigest,contributions:data.contributions.map(row=>({...row,provenanceRefs:[cv.artifactDigest,cv.manifestDigest]}))});
  const installedProducts=env.productInstalls.map(i=>abg.projectAdmittedProductInstallByAdmissionEventRef(env.artifactTruth,i.admissionEventRef).candidate);
  caller.state.catalog=owner.requireKind(product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:'5.0.0',memberKey:'admit',readinessBasis:{workspaceBinding:env.workspaceBindingCandidate,resolvedLock:env.resolvedProductLock,verifiedProducts:[native.verified,cv],installedProducts,publications:[...core,publication]}}),'graph_function_catalog','cold-catalog');
  assert.equal(caller.state.catalog.basisDigest,preparation.catalogBasisDigest);
  const programs=caller.state.catalog.boundPublications.flatMap(p=>p.programs),libraryProgram=programs.find(p=>p.programRef===prior.setupProgramBinding.programRef);assert(libraryProgram);
  assert.equal(product.sha256Canonical(libraryProgram),prior.setupProgramBinding.catalogProgramDigest);
  caller.state.catalogView=product.narrowGraphFunctionCatalog(caller.state.catalog,[...libraryProgram.callableMembership]);caller.state.programBinding=Object.freeze(prior.setupProgramBinding);mark('catalogReconstructed');
  const ids=product.NATIVE_WORKSPACE_WORK_IDS,nativePrograms=programs.filter(p=>p.programRef===ids.programRef);assert.equal(nativePrograms.length,1);
  const nativeProgram=nativePrograms[0],nativeView=owner.requireKind(product.narrowGraphFunctionCatalog(caller.state.catalog,[...nativeProgram.callableMembership]),'graph_function_catalog_view','native-view');
  const context=owner.requireKind(await product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:task.readRoots,maxFiles:task.maxContextFiles,maxBytes:task.maxContextBytes}),'worksite_context_observation','context-observation');mark('contextObserved');
  const entry=caller.state.selection;let input;
  const constructed=await api.constructInstalledStartCall({selection:{memberKey:'start',target:{kind:'next'},rootMode:'direct',fhMode:'direct'},programRef:ids.programRef,catalog:caller.state.catalog,catalogView:nativeView,applications:[],admittedInstalls:env.productInstalls,workspaceBinding:env.workspaceBinding,verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(env.artifactTruth,i),actorRef:caller.actorRef,
    input:{factory:({workspaceBinding,grants})=>{assert.equal(grants.length,1);input=product.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding,capabilityGrant:grants[0],context,outcome:task.outcome,instructions:task.instructions,readFirst:task.readFirst,writeRoots:task.writeRoots,checks:task.checks});return input;}},inputValueRef:'value://abiogenesis/t287/rc8-ref01/author-09/input',source:{kind:'none'},eventResource:entry,
    envelope:{definitionContractCoordinates:native.verified.definitionContractCoordinates,requestRef:'request://abiogenesis/t287/rc8-ref01/author-09/start',correlationRef:'correlation://abiogenesis/t287/rc8-ref01/author-09',eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(b.task.path).href]}});
  owner.requireKind(constructed,'installed_start_call','native-start');const call=constructed.call;assert.strictEqual(call.resources.eventResource,entry);
  const nativeOwner=await import(pathToFileURL(join(b.bootstrapRoot,'build/code/src/product/native_workspace_work.js'))),renderedBytes=Buffer.byteLength(nativeOwner.renderNativeWorkspaceWorkOrder(input));assert(renderedBytes+131072<task.maxPromptBytes);mark('nativeCallConstructed');
  await record('PREPARED.json',{status:'HELD_PREPARED_NO_NATIVE_DISPATCH',startedUtc,processStartedUtc,hostElapsedMs:performance.now()-processStarted,controlAndImportMs:started-processStarted,pid:process.pid,bindingSha256:sha(bindingBytes),task:b.task,sourceDigest:source.sourceDigest,sourceRows:source.rows.length,actualClose:preparation.actualClose,installedRoot:caller.installedRoot,workspaceBinding:caller.state.binding,setupProgramBinding:caller.state.programBinding,nativeSelection:{programRef:ids.programRef,startRef:ids.startRef,programDigest:product.sha256Canonical(nativeProgram),viewDigest:product.sha256Canonical(nativeView)},invocationRef:call.invocation.invocationRef,invocationDigest:call.invocation.invocationDigest,heldPrefix:entry.prefix,context:{digest:context.observationDigest,entries:context.entries.length},renderedBytes,phases,freeBytes:await free(),providerCalls:0});
  const preparedBytes=await readFile(join(b.runtimeRoot,'PREPARED.json'));console.log(JSON.stringify({status:'HELD_PREPARED_NO_NATIVE_DISPATCH',pid:process.pid,path:join(b.runtimeRoot,'PREPARED.json'),bytes:preparedBytes.length,sha256:sha(preparedBytes),wallMs:performance.now()-started}));
  const lines=createInterface({input:process.stdin,terminal:false});let admissionPin;for await(const line of lines){if(line.trim()){admissionPin=JSON.parse(line);break;}}lines.close();assert(admissionPin,'No Root admission; close without dispatch');assert.equal(dirname(admissionPin.path),dir);
  const admission=JSON.parse(await pinned(admissionPin));assert.equal(admission.status,'ROOT_ADMITTED_NATIVE_DISPATCH');assert.equal(admission.bindingSha256,sha(bindingBytes));assert.equal(admission.preparedSha256,sha(preparedBytes));for(const p of admission.files??[])await pinned(p);
  await checkSource();abg.assertAcquiredAbgEventResourceSelectionCurrent(entry);assert((await free())>b.reserveBytes);
  mark('dispatch');await record('STARTED.json',{utc:new Date().toISOString(),pid:process.pid,admission:admissionPin,invocationRef:call.invocation.invocationRef,phases});launched=true;
  outcome=await runner.invokeLifecycle(caller,env.productInstalls,call,runner.workerEnvironment(config));mark('sdkReturned');await record('NATIVE_RETURN.json',{utc:new Date().toISOString(),actualOutcomePath:join(b.runtimeRoot,'calls/lifecycle-start.outcome.json'),run:outcome.receipt?.resources?.run??null,phases,launched});
}catch(error){failure={name:error.name,message:error.message,observation:error.observation??null};await record('FAILURE.json',{utc:new Date().toISOString(),failure,launched,phases});process.exitCode=1;}
finally{
  if(caller?.state.resource){try{const close=caller.close(abg.selectHeldEventStoreDurablePrefix(caller.state.resource.store));await record('resource-close.json',close);mark('closed');}catch(error){await record('CLOSE_FAILURE.json',{message:error.message});try{abg.abandonAbgEventResource(caller.state.resource);}catch{}process.exitCode=1;}}
  await record('FINAL.json',{utc:new Date().toISOString(),launched,phases,failure,run:outcome?.receipt?.resources?.run??null,qualified:false});console.log(JSON.stringify({status:failure?'RETURN_REQUIRES_ROOT_TRIAGE':'RETURNED_AND_CLOSED',launched,runtimeRoot:b.runtimeRoot}));
}
