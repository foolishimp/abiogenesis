import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,mkdir,statfs} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

// Optional provider authentication stays private until the maintained native
// invocation scope. Setup, imports and probes inherit credential-free ambient.
const providerCredentials=Object.fromEntries(['CLAUDE_CODE_OAUTH_TOKEN']
  .filter(key=>process.env[key]!==undefined).map(key=>[key,process.env[key]]));
for(const key of Object.keys(providerCredentials))delete process.env[key];

const dir=dirname(fileURLToPath(import.meta.url));
const source='/private/tmp/abg-rc14-regression-repair-20261115-06';
const raw='/Users/jim/Library/Application Support/ABIogenesis/development-runs/rc14-regression-repair-20261115-06';
const runtimeRoot=join(raw,'runtime'), tenant=join(source,'build_tenants/abiogenesis/typescript');
const launchPath=resolve(process.argv[2]??'');
assert(process.argv.length===3,'one explicit Root launch-packet path required');
const launch=JSON.parse(await readFile(launchPath,'utf8'));
assert.equal(launch.activationId,'RC14-REGRESSION-REPAIR-NATIVE-006');
assert.equal(launch.dispatchAuthorized,true,'Root must accept packet and pushed source before launch');
const head=launch.sourceHead;assert.match(head,/^[0-9a-f]{40}$/);
const controlClock=JSON.parse(await readFile(join(raw,'CONTROL_START.json'),'utf8'));
assert.equal(launch.observerSha256,'eb5d0028cf7cb27d233c4512a57882785698c301ba83575396c3fc9eb045fc31');
const pinPath='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc13-operational-pin-01/BUILDER_PIN.json';
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const pinBytes=await readFile(pinPath); assert.equal(sha(pinBytes),'52634cafc6bcd9d619997100abfd44a1cad9f52d057de9fd886d1c99ed5b0a26');
const pin=JSON.parse(pinBytes), activation=await json(join(dir,'ACTIVATION.json')), task=await json(join(dir,'TASK.json'));
assert.equal(sha(await readFile(join(dir,'physical-topology.py'))),launch.observerSha256);
assert(Array.isArray(launch.controls)&&launch.controls.length>=6,'exact accepted control digests required');
for(const control of launch.controls){assert(!control.path.includes('..')&&!control.path.startsWith('/'));assert.equal(sha(await readFile(join(dir,control.path))),control.sha256,control.path);}
for(const name of ['HOST.mjs','TASK.json','ACTIVATION.json','physical-topology.py','operate.py','prove.py','setup-custody.py','PRIOR_PARTIAL_SOURCE.json','PRIOR_TITLE_MAP.json','TITLE_MAP.json','RETAINED_PROOF.json'])assert(launch.controls.some(r=>r.path===name),'missing control pin '+name);
async function observeTopology(layout){const bytes=execFileSync('/usr/bin/python3',[join(dir,'physical-topology.py'),'-'],{input:JSON.stringify(layout),timeout:60000,maxBuffer:4*1024*1024});const result=JSON.parse(bytes.toString('utf8'));assert.equal(result.ok,true,result.reason);assert.equal(result.disposition,'separated',result.reason);return result;}
const installed=pin.installedRoot, p=activation.provider, limits=activation.limits;
const setupOwner=await import(pathToFileURL(join(tenant,'test_env/uat/public-setup.mjs')));
const runner=await import(pathToFileURL(join(tenant,'test_env/uat/runner.mjs')));
const record=(path,value,rawBytes=false)=>runner.exclusiveRecord(runtimeRoot,path,value,rawBytes);
const started=performance.now(), phases=[];
const mark=async phase=>{const row={phase,utc:new Date().toISOString(),wallMs:performance.now()-started};phases.push(row);await record(`phases/${phases.length}-${phase}.json`,row);console.log(JSON.stringify(row));};
const pinned=async row=>{const b=await readFile(row.path);assert.equal(b.length,row.bytes);assert.equal(sha(b),row.sha256);};
const original=await json(join(raw,'SOURCE_PREIMAGE.json'));assert.equal(original.head,head);
async function sourceExact(){assert.equal(execFileSync('/usr/bin/git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),head);for(const r of original.rows)assert.equal(sha(await readFile(join(source,r.path))),r.sha256,r.path);for(const r of (await json(join(dir,'PRIOR_PARTIAL_SOURCE.json'))).rows)assert.equal(sha(await readFile(join(source,r.path))),r.sha256,'prior partial '+r.path);}
async function reserve(){const s=await statfs(raw);assert(s.bavail*s.bsize>limits.reserveBytes,'free-space reserve');}
const common={HOME:'/Users/jim',PATH:'/Users/jim/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',
  STDO_STORE:'/Users/jim/Library/Application Support/STDO',GIT_OPTIONAL_LOCKS:'0',NODE_OPTIONS:'--max-old-space-size=8192',NPM_CONFIG_OFFLINE:'true',NPM_CONFIG_UPDATE_NOTIFIER:'false',
  NPM_CONFIG_USERCONFIG:join(raw,'host-scratch/npm-user.npmrc'),NPM_CONFIG_GLOBALCONFIG:join(raw,'host-scratch/npm-global.npmrc')};
const setupEnvironment={...common,TMPDIR:join(raw,'host-scratch/tmp'),NPM_CONFIG_CACHE:join(raw,'host-scratch/npm-cache')};
const workerEnvironment={...common,TMPDIR:join(raw,'host-scratch/worker-tmp'),TMPPREFIX:join(raw,'host-scratch/worker-tmp/zsh'),
  NPM_CONFIG_CACHE:join(raw,'host-scratch/worker-npm-cache'),CLAUDE_CODE_DISABLE_BACKGROUND_TASKS:'1',BASH_DEFAULT_TIMEOUT_MS:'60000',BASH_MAX_TIMEOUT_MS:'90000'};
const config={runId:activation.id,sourceCommit:head,worksiteRoot:source,bootstrapRoot:installed,nodePath:process.execPath,
  toolchains:{npm:{executable:'/opt/homebrew/bin/npm'}},recursionBound:8,setupEnvironment,inheritEnvironment:[],toolchainEnvironment:workerEnvironment,
  provider:{enabled:true,agent:'claude',command:p.executable,model:p.model,maxTurns:limits.nativeMaxTurns,appendArgs:['--effort',p.effort],inactivityTimeoutMs:limits.nativeInactivityMs,absoluteTimeoutMs:limits.nativeAbsoluteMs,inheritEnvironment:['CLAUDE_CODE_OAUTH_TOKEN']}};
// This dedicated host owns its environment; installation subprocesses inherit
// the same explicit scratch/cache settings as commandRecorder.
Object.assign(process.env,setupEnvironment);
let caller=null, setup=null, outcome=null, close=null, launched=false, failure=null, readbackFailure=null, nativeTask=null, nativeCompleted=false;
function requireAuthorTerminal(runtime,receipt,input){
  const {product,abg}=runtime, value=receipt?.ownerOutput?.value;
  assert.equal(receipt?.exitCode,0,'native Public exit');
  assert.equal(receipt?.ownerOutput?.outcomeKind,'result','native Public result');
  assert.equal(value?.disposition,'completed','inner native Run must complete');
  const terminal=value.terminalResult;
  assert(abg.isAbgTypedTerminalResult(terminal),'actual typed terminal required');
  assert.deepEqual(value.result,terminal.result,'inner result/terminal identity');
  assert.deepEqual(value.run,receipt.resources.run,'inner Run identity');
  assert.equal(terminal.producer.runRef,value.run.ref,'terminal producer Run');
  assert.equal(terminal.producer.program.ref,product.NATIVE_WORKSPACE_WORK_IDS.programRef);
  assert.equal(terminal.valueKind,'native_workspace_work_observation');
  assert(product.isNativeWorkspaceWorkObservation(terminal.value),'native observation owner contract');
  assert(product.nativeWorkspaceWorkObservationMatchesTask(input,terminal.value),'native observation must match actual admitted task');
  return terminal;
}
try {
  await record('run.json',{activation:activation.id,head,launch:{path:launchPath,sha256:sha(await readFile(launchPath))},pin:{path:pinPath,sha256:sha(pinBytes)},pid:process.pid,startedUtc:new Date().toISOString(),limits,source,runtimeRoot,providerCallsAtMost:1});
  await sourceExact(); await reserve();
  for(const row of activation.externalReadOnlyInputs)await pinned(row);
  await record('external-method-inputs.json',{inputs:activation.externalReadOnlyInputs,scope:'Byte identity only; actual native content-read before edit remains mandatory audit evidence.'});
  for(const row of [pin.archive,pin.rawPackage,pin.rawProductToolchainManifest])await pinned(row);
  assert.equal(sha(await readFile(p.executable)),p.sha256);
  const version=execFileSync(p.executable,['--version'],{encoding:'utf8',timeout:30000}).trim();assert.equal(version,p.version);
  const help=execFileSync(p.executable,['--help'],{encoding:'utf8',timeout:30000});
  for(const flag of ['--model','--effort','xhigh','--tools','--json-schema','--output-format','--include-partial-messages','--permission-mode','--no-session-persistence','--disable-slash-commands'])assert(help.includes(flag),flag);
  await record('provider-help.raw',help,true);await record('provider-identity.json',{executable:p.executable,sha256:p.sha256,version,model:p.model,effort:p.effort,measurement:'CLI identity and advertised argument support; no remote model attestation'});
  for(const suffix of ['resources/events','resources/runtime','resources/projections','resources/archives','sandbox/installed'])await mkdir(join(runtimeRoot,suffix),{recursive:true});
  const plannedProtected=[join(runtimeRoot,'sandbox/installed/abg'),join(runtimeRoot,'sandbox/installed/abg/node_modules/@abiogenesis/typescript-tenant'),join(runtimeRoot,'sandbox/installed/test-consumer/node_modules/@abi5-tests/sandbox-uat'),
    ...['events','runtime','projections','archives'].map(n=>join(runtimeRoot,'resources',n)),installed,pin.releaseRoot];
  await record('topology-before-setup.json',await observeTopology({worksite:source,writePaths:task.writeRoots.map(x=>join(source,x)),protectedRoots:plannedProtected,archiveRoot:join(runtimeRoot,'resources/archives')}));
  await mark('identity-and-topology-bound');
  const runtime=await setupOwner.installedModules(installed), {product,abg,api}=runtime;
  const native=await setupOwner.verifyArtifact(runtime,{artifactPath:pin.archive.path,manifest:await json(join(installed,'product-toolchain-manifest.json')),expectedArtifactDigest:'sha256:'+pin.archive.sha256},record,'abg');
  const transport=await import(pathToFileURL(join(installed,'build/code/src/abg/transport_contracts.js')));
  const worker=runner.workerEnvironment(config);worker.ABG_TS_FP_TERMINATION_GRACE_MS=String(limits.terminationGraceMs);
  const contract=transport.constructKnownWorkerTransportContract('claude',{command:p.executable,environment:worker});
  const args=transport.withTransportAppendArgs([...contract.argsTemplate,'--tools','Read,Edit,Write,Glob,Grep,Bash'],transport.admitTransportAppendArgs({agentKey:'claude',environment:worker}));
  const configured=transport.deriveConfiguredActorIdentity(contract,args,worker);assert.equal(configured.disposition,'established');assert.equal(configured.model,p.model);
  assert.deepEqual(args.slice(args.indexOf('--effort'),args.indexOf('--effort')+2),['--effort',p.effort]);
  assert.deepEqual(args.slice(args.indexOf('--max-turns'),args.indexOf('--max-turns')+2),['--max-turns',String(limits.nativeMaxTurns)]);
  await record('provider-transport-selection.json',{contract,args,configured,environmentKeys:Object.keys(worker).sort()});
  caller=setupOwner.publicCaller({root:runtimeRoot,runtime,native,config,record,actorRef:'actor://abiogenesis/operator/rc14-regression-repair',
    command:runner.commandRecorder(runtimeRoot,{environment:setupEnvironment,timeoutMs:limits.setupReadbackCommandMs,maxOutputBytes:limits.outputBytesPerCommand})});
  const authorize=caller.authorize;let imported=0;
  caller.authorize=(packet,request,resources,slots)=>packet===product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean
    ?(assert.equal(imported++,0),authorize(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.imported,
      {targetRoot:source,createPolicy:'imported',importAuthority:{ref:pathToFileURL(join(dir,'ACTIVATION.json')).href,digest:product.sha256Bytes(awaitActivationBytes)},preservationPolicy:'preserve_all_existing'},resources,slots))
    :authorize(packet,request,resources,slots);
  const awaitActivationBytes=await readFile(join(dir,'ACTIVATION.json'));
  setup=await setupOwner.populateSandbox(caller,{retain:true,program:'library'});assert.equal(imported,1);await sourceExact();await mark('fresh-public-setup-held');
  const custody=(mode)=>JSON.parse(execFileSync('/usr/bin/python3',[join(dir,'setup-custody.py'),mode,source,raw,head],{encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024}));
  await record('setup-owned-custody-captured.json',custody('capture'));
  for(const suffix of ['worker-tmp','worker-npm-cache'])await mkdir(join(raw,'host-scratch',suffix),{recursive:true});
  const env=caller.refresh(), ids=product.NATIVE_WORKSPACE_WORK_IDS;
  assert.equal(env.workspaceBinding.roots.productRoot,caller.installedRoot);
  const protectedRoots=[...Object.values(env.workspaceBinding.roots),...env.productInstalls.map(x=>x.installedRoot),installed,pin.releaseRoot];
  await record('topology-before-dispatch.json',await observeTopology({worksite:source,writePaths:task.writeRoots.map(x=>join(source,x)),protectedRoots,archiveRoot:env.workspaceBinding.roots.archiveRoot}));
  const operations=await import(pathToFileURL(join(installed,'build/code/src/product/worksite_operations.js')));
  const writeRefusal=await operations.checkWorksiteWriteRoots({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,protectedInstallRoots:env.productInstalls.map(x=>x.installedRoot),writeRoots:task.writeRoots});
  await record('file-write-scope-preflight.json',{writeRoots:task.writeRoots,result:writeRefusal});assert.equal(writeRefusal,null,'exact file-level W must be accepted unchanged');
  const programs=caller.state.catalog.boundPublications.flatMap(x=>x.programs).filter(x=>x.programRef===ids.programRef);assert.equal(programs.length,1);
  const view=setupOwner.requireKind(product.narrowGraphFunctionCatalog(caller.state.catalog,[...programs[0].callableMembership]),'graph_function_catalog_view','native-view');
  const context=await product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,protectedInstallRoots:env.productInstalls.map(x=>x.installedRoot),readRoots:task.readRoots,maxFiles:task.maxContextFiles,maxBytes:task.maxContextBytes});
  assert.equal(context.kind,'worksite_context_observation');
  const entry=caller.state.selection;let input;
  const constructed=await api.constructInstalledStartCall({selection:{memberKey:'start',target:{kind:'next'},rootMode:'direct',fhMode:'direct'},programRef:ids.programRef,catalog:caller.state.catalog,catalogView:view,applications:[],
    admittedInstalls:env.productInstalls,workspaceBinding:env.workspaceBinding,verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(env.artifactTruth,i),actorRef:caller.actorRef,
    input:{factory:({workspaceBinding,grants})=>{assert.equal(grants.length,1);return input=product.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding,capabilityGrant:grants[0],context,outcome:task.outcome,instructions:task.instructions,readFirst:task.readFirst,writeRoots:task.writeRoots,checks:task.checks});}},
    inputValueRef:'value://abiogenesis/rc14/regression-repair/input',source:{kind:'none'},eventResource:entry,
    envelope:{definitionContractCoordinates:native.verified.definitionContractCoordinates,requestRef:'request://abiogenesis/rc14/regression-repair/start',correlationRef:'correlation://abiogenesis/rc14/regression-repair',eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(dir,'TASK.json')).href]}});
  await record('native-construction-kind.json',{kind:constructed.kind,code:constructed.code??null});assert.equal(constructed.kind,'installed_start_call');assert.strictEqual(constructed.call.resources.eventResource,entry);
  await record('PREPARED.json',{head,workspaceBinding:caller.state.binding,programRef:ids.programRef,taskDigest:product.sha256Canonical(input),contextDigest:context.observationDigest,contextEntries:context.entries.length,
    contextBytes:context.entries.reduce((n,e)=>n+(e.state==='file'?e.byteLength:0),0),writeRoots:input.writeRoots,invocationRef:constructed.call.invocation.invocationRef,invocationDigest:constructed.call.invocation.invocationDigest,configured,providerCalls:0});
  nativeTask=input;
  await sourceExact(); await reserve();
  const finalEnv=caller.refresh();
  const finalProtected=[...Object.values(finalEnv.workspaceBinding.roots),...finalEnv.productInstalls.map(x=>x.installedRoot),installed,pin.releaseRoot];
  await record('topology-immediately-before-dispatch.json',await observeTopology({worksite:source,writePaths:task.writeRoots.map(x=>join(source,x)),protectedRoots:finalProtected,archiveRoot:finalEnv.workspaceBinding.roots.archiveRoot}));
  await record('setup-owned-custody-at-dispatch.json',custody('preflight'));
  abg.assertAcquiredAbgEventResourceSelectionCurrent(entry);
  assert(Date.parse(controlClock.deadlineUtc)-Date.now()>limits.nativeAbsoluteMs+15000,'remaining original deadline cannot contain native ceiling and cleanup');
  await mark('one-author-dispatch');launched=true;
  outcome=await runner.invokeLifecycle(caller,setup.installations,constructed.call,{...providerCredentials,...worker});
  await record('NATIVE_RETURN.json',{run:outcome.receipt?.resources?.run??null,ownerOutput:outcome.receipt?.ownerOutput??null,launched});await mark('native-returned');
  requireAuthorTerminal(runtime,outcome.receipt,nativeTask);
}catch(error){failure={name:error.name,message:error.message,observation:error.observation??null,stack:error.stack};await record('FIRST_FAILURE.json',{failure,launched,phases});process.exitCode=1;console.log(JSON.stringify({phase:'first-failure',message:error.message,launched}));}
finally {
  if(caller?.state.resource){try{close=caller.close(caller.runtime.abg.selectHeldEventStoreDurablePrefix(caller.state.resource.store));await record('resource-close.json',close);}
    catch(error){await record('CLOSE_FAILURE.json',{message:error.message});try{caller.runtime.abg.abandonAbgEventResource(caller.state.resource);}catch{}process.exitCode=1;}}
  if(close&&outcome?.receipt?.resources?.run){try{
    const reads=await runner.freshReadbacks(caller,outcome);
    await record('FRESH_READBACKS.json',runner.freshReadbackRecord(reads,caller.runtime.product.sha256Canonical));
    // Failed inner Runs still retain both truthful read outcomes; those outcomes
    // must never turn the original failure into author completion.
    if(failure===null){
      const {product,abg}=caller.runtime, terminal=requireAuthorTerminal(caller.runtime,outcome.receipt,nativeTask);
      assert.deepEqual(reads.map(r=>r.memberKey),['run_result','run_replay']);
      for(const r of reads){
        assert.equal(r.ownerOutput?.outcomeKind,'result',r.memberKey+' must return a result');
        assert.deepEqual(r.source,outcome.receipt.resources.run,r.memberKey+' source identity');
        assert(abg.isAbgTypedTerminalResult(r.projection?.terminalResult),r.memberKey+' typed terminal');
        for(const key of ['result','producer','value','contract'])assert.equal(product.sha256Canonical(r.projection.terminalResult[key]),product.sha256Canonical(terminal[key]),r.memberKey+' terminal '+key);
        assert.deepEqual(r.projection.subject,outcome.receipt.resources.run,r.memberKey+' projection subject');
        if(r.memberKey==='run_result')assert.deepEqual(r.projection.result,terminal.result);
        else assert.equal(r.projection.status,'closed','fresh replay must be closed');
        const retained=await json(join(runtimeRoot,r.outcomePath));
        assert.equal(product.sha256Canonical(retained.receipt.ownerOutput),product.sha256Canonical(r.ownerOutput),r.memberKey+' retained outcome');
      }
      const evidence=[];
      for(const path of ['NATIVE_RETURN.json','FRESH_READBACKS.json','calls/run_result.outcome.json','calls/run_replay.outcome.json']){const bytes=await readFile(join(runtimeRoot,path));evidence.push({path,bytes:bytes.length,sha256:sha(bytes)});}
      await record('AUTHOR_COMPLETION.json',{status:'completed',run:outcome.receipt.resources.run,result:terminal.result,taskDigest:product.sha256Canonical(nativeTask),terminalValueDigest:terminal.valueDigest,evidence,actualResourceClose:true,freshResult:true,freshClosedReplay:true,qualified:false});
      nativeCompleted=true;
    }
  }
    catch(error){readbackFailure={message:error.message,observation:error.observation??null};await record('READBACK_FAILURE.json',readbackFailure);if(failure===null){failure={name:error.name,message:error.message,stage:'fresh-readback-completion',observation:error.observation??null};await record('FIRST_FAILURE.json',{failure,launched,phases});}process.exitCode=1;}}
  if(!nativeCompleted)process.exitCode=1;
  await record('FINAL.json',{launched,nativeCompleted,providerCallsAtMost:launched?1:0,failure,readbackFailure,actualResourceClose:close!==null,run:outcome?.receipt?.resources?.run??null,phases,qualified:false});
  console.log(JSON.stringify({phase:'operator-return',launched,nativeCompleted,failure:failure?.message??null,readbackFailure,actualResourceClose:close!==null}));
}
