import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const phase=dirname(fileURLToPath(import.meta.url));
const tenant='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const support=name=>import(pathToFileURL(join(tenant,'test_env/support',name+'.mjs')).href);
const load=(root,name)=>import(pathToFileURL(join(root,'build/code/src',name+'.js')).href);
const save=(name,value)=>writeFile(join(phase,'execution',name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const resource=(product,closeHandoff)=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',
  closeHandoff,handoffDigest:product.sha256Canonical(closeHandoff)});

// Same existing constructors used by constructInstalledStartCall. The resulting
// grant is compared to that helper's actual Public capability basis before CLI.
function inputGrant(environment,resolution){
  const {product,workspaceBinding,admittedInstalls}=environment;
  const rows=resolution.programValidation;
  const regimes=new Set([...rows.executableLeafRows,...rows.interactionLeafRows].map(r=>r.fibre));
  const policy=product.constructRootInvocationPolicy(workspaceBinding,resolution.program,
    rows.interactionLeafRows.map(r=>({requirementKey:r.requirementKey,requirementKeyDigest:r.requirementKeyDigest,
      actorCapabilityRef:r.requirement.actorCapabilityRef})),['F_D','F_P','F_H'].filter(r=>regimes.has(r)),[]);
  return product.constructCapabilityGrant(policy,workspaceBinding.authorizedActorRef,'abg.operation.run.invoke',
    product.DIRECT_INVOKE_CAPABILITY,{admittedInstalls,workspaceBinding,fixedPacket:product.RUN_OPERATION_CONTRACTS.invoke.start});
}

// Root supplies an exact separately accepted archive/install-host selector.
// Importing this module or syntax checking it never enters native execution.
export async function execute(frozenArtifactPath){
  assert.equal(typeof frozenArtifactPath,'string','explicit frozen candidate selector is required');
  const frozenArtifact=JSON.parse(await readFile(frozenArtifactPath,'utf8'));
  for(const key of ['artifactPath','artifactSha256','installHost'])assert.equal(typeof frozenArtifact[key],'string',key);
  const digest='sha256:'+createHash('sha256').update(await readFile(frozenArtifact.artifactPath)).digest('hex');
  assert.equal(digest,frozenArtifact.artifactSha256.startsWith('sha256:')?frozenArtifact.artifactSha256:'sha256:'+frozenArtifact.artifactSha256);
  const [{setupInstalledRootCatalog},registered]=await Promise.all([
    support('root-installed-environment'),support('registered-graph-selection')]);
  // Source resources are preserved for independent cold proof. This is test
  // resource lifetime management, never a runtime-admission recording double.
  const cleanupRegistrations=[];
  const environment=await setupInstalledRootCatalog({after:callback=>cleanupRegistrations.push(callback)},tenant,{
    frozenArtifact,candidateBasisSource:'packed_artifact',workspaceProductIndex:0,
    programRef:'program://abiogenesis/worksite/file-replace@5',
    graphFunctionRef:'graph-function://abiogenesis/worksite/file-replace@5',
    additionalCorePublicationConstructors:['constructNativeWorkspaceWorkModulePublication'],
    prepareAdditionalProducts:async()=>[]});
  const {product,abg,installedRoot,workspaceBinding,workspaceAuthority}=environment;
  const [publicApi,storeOwner,readContracts,eventCalculus]=await Promise.all([
    load(installedRoot,'public/index'),load(installedRoot,'abg/event_store'),
    load(installedRoot,'abg/project_read_operation_contracts'),load(installedRoot,'abg/event_calculus')]);
  const native=product.NATIVE_WORKSPACE_WORK_IDS;
  const c0=environment.gtl.WORKSITE_C0_IDS;
  const protocol=join(phase,'../crosscut-installed-lifecycle-effect-proof-80/ordinary-protocol-fixture.mjs');
  assert.equal(product.sha256Bytes(await readFile(protocol)),'sha256:16f870b64a8689165d1a6c8ffbb656407fe0fc32dc9f6eaedaa79febdb0c1737');
  assert.equal(workspaceBinding.roots.productRoot,environment.installCandidates[0].installedRoot);
  assert.equal(environment.additionalProducts.length,0);
  assert.equal(await product.installedProductContentMatches(environment.installCandidates[0]),true);
  const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(join(tenant,'test_env/uat/runner.mjs')).href);
  const executionRoot=join(phase,'execution');
  const baseEnvironment={...process.env};delete baseEnvironment.NODE_OPTIONS;
  for(const key of Object.keys(baseEnvironment))if(key.startsWith('ABG_TS_'))delete baseEnvironment[key];
  const command=commandRecorder(executionRoot,{environment:baseEnvironment});
  const cliPath=join(installedRoot,'build/code/src/public/cli.js');
  async function cli(identity,call,worker={}){
    const requestPath=await exclusiveRecord(executionRoot,identity+'-request.jsonl',JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:handoff},invocation:call})+'\n',true);
    const raw=await command(identity,process.execPath,[cliPath,'--jsonl',requestPath],{cwd:environment.scratch,environment:{...baseEnvironment,...worker}});
    assert.equal(raw.timedOut,false);assert.equal(raw.truncated,false);assert.equal(raw.failure,null);assert.equal(raw.signal,null);
    assert.equal(raw.stderr,'','raw CLI stderr retained before assertion');
    const lines=raw.stdout.trim().split(/\r?\n/u);assert.equal(lines.length,1,'one actual CLI output');
    const output=JSON.parse(lines[0]);
    await save(identity+'-output.json',output);
    if(output.kind!=='installed_definition_call_transport_result'||output.receipt?.kind!=='definition_host_receipt')throw new TypeError('Actual CLI has no supported receipt: '+JSON.stringify(output));
    return {output,wallMs:raw.wallMs,exitCode:raw.exitCode,requestPath,cliPath};
  }
  environment.catalogView=product.narrowGraphFunctionCatalog(environment.catalog,[c0.graphFunctionRef,native.graphFunctionRef]);
  assert.equal(environment.catalogView.kind,'graph_function_catalog_view');
  await save('setup.json',{scratch:environment.scratch,installedRoots:environment.installedRoots,
    artifactPaths:environment.artifactPaths,verified:environment.verified,workspaceAuthority,workspaceBinding,installCandidates:environment.installCandidates,
    catalogIdentity:{catalogId:environment.catalog.catalogId,catalogDigest:environment.catalog.catalogDigest},protocol,cleanupRegistered:cleanupRegistrations.length,
    originalInputsArePhysicalOnly:true,privateRuntimeWriter:false});
  let handoff=environment.store.projectReopenAuthorityAndClose();
  const readCold=()=>{
    const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix);
    const prefix=abg.selectValidatedRuntimeEventPrefix(events);
    return {events,prefix,projection:abg.deriveRuntimeEventCalculusProjection(prefix)};
  };
  const isCurrent=(projection,observationRef)=>abg.holdsAt(projection,abg.constructWorksiteObservationCurrentFluent(observationRef));
  async function invoke(identity,programRef,startRef,inputFactory,mode){
    let input,grant;
    const start=await registered.constructInstalledStartCall({environment,publicApi,
      eventResource:resource(product,handoff),identity,programRef,
      inputFactory:async({resolution})=>{grant=inputGrant(environment,resolution);input=await inputFactory(grant);return input;}});
    assert.ok(start.capabilityBasis.capabilityGrants.some(g=>product.canonicalJson(g)===product.canonicalJson(grant)));
    assert.equal(start.resolution.program.policies['abg.default_start_ref'],startRef,'existing direct next selects the declared default');
    if(mode!==undefined){
      const closure=start.resolution.declarationClosure;
      const nativeOwner=closure.graphFunctionOwners.filter(o=>o.declarationRef===native.graphFunctionRef);
      const implementationOwner=closure.implementationBindingOwners.filter(o=>o.declarationRef===native.implementationBindingRef);
      assert.equal(nativeOwner.length,1);assert.equal(implementationOwner.length,1);
      for(const owner of [...nativeOwner,...implementationOwner,closure.semanticsOwner])
        assert.equal(owner.productId,environment.verified.productId,'canonical ABI declaration and semantics owners');
      assert.equal(start.resolution.implementationSetCandidate.rows.filter(r=>r.implementationRef===native.implementationRef)
        .every(r=>r.implementationOwnerProductId===environment.verified.productId),true);
    }
    await save(identity+'-input.json',input);await save(identity+'-call.json',start.call);
    const worker=mode===undefined?{}:{ABG_TS_CLAUDE_COMMAND:protocol,ABG_TS_WORKER_SANDBOX:'agent_default',
      ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(['--fixture-mode',mode,'--fixture-archive-root',workspaceBinding.roots.archiveRoot]),
      ABG_TS_FP_TIMEOUT_MS:'10000',ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:'20000',ABG_TS_FP_TERMINATION_GRACE_MS:'250'};
    const execution=await cli(identity,start.call,worker);
    await save(identity+'-execution.json',execution);
    assert.equal(execution.output.kind,'installed_definition_call_transport_result');
    const receipt=execution.output.receipt;assert.equal(receipt.kind,'definition_host_receipt');
    assert.equal(receipt.ownerOutput.outcomeKind,'result',JSON.stringify(receipt.ownerOutput));
    handoff=receipt.resources.eventResource.closeHandoff;await save(identity+'-handoff.json',handoff);
    return {start,execution,receipt,...readCold()};
  }
  const nativeInput=async(grant,readFirst)=>{
    const context=await product.observeWorksiteContext({workspaceAuthorityBasis:workspaceAuthority,workspaceBinding,
      readRoots:['target-a.txt','target-b.txt'],maxFiles:8,maxBytes:4096});
    assert.equal(context.kind,'worksite_context_observation');
    return product.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:workspaceAuthority,workspaceBinding,
      capabilityGrant:grant,context,outcome:'Execute only the declared local protocol witness; no application or assessment claim.',
      instructions:['Keep all effects within target-a.txt. Return the ordinary native report; runtime owns observation and admission.'],
      readFirst,writeRoots:['target-a.txt'],checks:[]});
  };
  // Reuse the exact prior installed R01 mechanical proof; no new descendant is launched.
  const r01Path=join(phase,'../crosscut-installed-lifecycle-effect-proof-80/successor-directory/execution/r01-proof.json');
  const r01Bytes=await readFile(r01Path);
  assert.equal(product.sha256Bytes(r01Bytes),'sha256:aa9baa62809fc17c9b526e32fd4d98971213e24fce959b39672d496440545590');
  await save('r01-reuse.json',{path:r01Path,sha256:product.sha256Bytes(r01Bytes),scope:'Historical actual candidate20 leader0/group-cleanup/cold-liveness only; no new Run credit.'});
  const pure=[];
  for(const [programRef,graphFunctionRef,startRef]of [[c0.programRef,c0.graphFunctionRef,c0.startRef],[native.programRef,native.graphFunctionRef,native.startRef]]){
    const resolution=await product.ProductExecutionResolutionPort.resolve({catalog:environment.catalog,catalogView:environment.catalogView,
      admittedInstalls:environment.admittedInstalls,verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(environment.artifactTruth,install),
      programRef,selection:Object.freeze({kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'})});
    await save((programRef===c0.programRef?'c0':'native')+'-pure-resolution.json',resolution);
    assert.equal(resolution.kind,'loaded_product_execution_resolution',JSON.stringify(resolution));
    assert.equal(resolution.program.policies['abg.default_start_ref'],startRef);assert.equal(resolution.graphFunction.name,graphFunctionRef);
    assert.equal(resolution.declarationClosure.semanticsOwner.productId,environment.verified.productId);
    assert.equal(resolution.declarationClosure.graphFunctionOwners.filter(o=>o.declarationRef===graphFunctionRef&&o.productId===environment.verified.productId).length,1);
    assert.equal(resolution.program.policies['abg.run_environment'],undefined);
    pure.push({programRef,graphFunctionRef,startRef,semanticsOwner:resolution.declarationClosure.semanticsOwner,
      programDigest:product.sha256Canonical(resolution.program),productRoot:workspaceBinding.roots.productRoot});
  }
  await save('pure-preflight.json',{kind:'canonical_abi_program_provider_worksite_preflight',entries:pure,
    noEnvironmentFactory:true,noAssessment:true,sourceNone:true,observationsImported:false});
  console.log(JSON.stringify({stage:'canonical-program-preflight',status:'pass',scratch:environment.scratch}));
  const observations={};
  for(const relativePath of ['target-a.txt','target-b.txt']){
    const before=readCold().events.length;
    const c0proof=await invoke(relativePath==='target-a.txt'?'c0-a':'c0-b',c0.programRef,c0.startRef,async grant=>{
      const common={workspaceAuthorityBasis:workspaceAuthority,workspaceBinding};
      const subject=product.constructWorksiteSubject({...common,relativePath,subjectUri:pathToFileURL(join(workspaceAuthority.canonicalRoot,relativePath)).href});
      const territory=product.constructWorksiteTerritory({...common,relativeRoot:'.',territoryUri:pathToFileURL(workspaceAuthority.canonicalRoot).href});
      const predecessorObservation=await product.observeWorksiteSubject(workspaceAuthority,workspaceBinding,subject);
      assert.equal(predecessorObservation.state,'absent');
      const request=product.constructWorksiteFileReplaceRequest({...common,subject,territory,predecessorObservation,
        capabilityGrant:grant,replacementBytes:Buffer.from(relativePath==='target-a.txt'?'C0 admitted A\n':'C0 admitted B\n')});
      assert.equal(request.kind,'worksite_file_replace_request');return request;
    });
    const admitted=c0proof.events.slice(before).filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===c0.graphFunctionRef).at(-1);
    assert.equal(admitted?.payload.resultClass,'success');
    const observation=admitted.payload.value.successorObservation;assert.ok(observation);
    assert.equal(isCurrent(c0proof.projection,observation.observationRef),true);
    observations[relativePath]={admittedEventRef:admitted.eventId,resultRef:admitted.payload.resultRef,observation};
    await save(relativePath==='target-a.txt'?'c0-a-proof.json':'c0-b-proof.json',observations[relativePath]);
  }
  const prior=readCold();for(const {observation}of Object.values(observations))assert.equal(isCurrent(prior.projection,observation.observationRef),true);
  const r02=await invoke('r02',native.programRef,native.startRef,g=>nativeInput(g,['target-a.txt','target-b.txt']),'r02-channel-conflict');
  const failures=r02.events.slice(prior.events.length).filter(e=>e.kind==='actor_invocation_failed'&&e.payload.failureClass==='transport_exception');
  assert.equal(failures.length,1,'actual owner transport exception with dispatch lineage');
  assert.equal(await readFile(join(workspaceAuthority.canonicalRoot,'target-a.txt'),'utf8'),'controlled partial native edit\n');
  assert.equal(await readFile(join(workspaceAuthority.canonicalRoot,'target-b.txt'),'utf8'),'C0 admitted B\n');
  assert.equal(isCurrent(r02.projection,observations['target-a.txt'].observation.observationRef),false);
  assert.equal(isCurrent(r02.projection,observations['target-b.txt'].observation.observationRef),true);
  const failure=failures[0],preFailure=Object.freeze(r02.events.filter(e=>e.admissionOrdinal<failure.admissionOrdinal));
  const retired=eventCalculus.projectNativeWorkRetiredObservations(failure,preFailure);
  assert.ok(retired.includes(observations['target-a.txt'].observation.observationRef));
  assert.equal(retired.includes(observations['target-b.txt'].observation.observationRef),false);
  for(const missing of ['c_call_opened','c_call_fibre_selected','actor_invocation_started','actor_transport_binding_admitted','actor_process_started'])
    assert.deepEqual(eventCalculus.projectNativeWorkRetiredObservations(failure,Object.freeze(preFailure.filter(e=>e.kind!==missing))),[],missing+' removal refuses scoped retirement');
  assert.equal(r02.events.slice(prior.events.length).some(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===native.graphFunctionRef),false,
    'no fabricated native Result or post-observation accompanies this exception');
  await save('r02-proof.json',{failure,retired,observations,negativePremises:'Pure omission counterexamples use actual cold rows, never admission or event writing.',
    currentA:false,currentB:true,physicalA:product.sha256Bytes(await readFile(join(workspaceAuthority.canonicalRoot,'target-a.txt'))),
    physicalB:product.sha256Bytes(await readFile(join(workspaceAuthority.canonicalRoot,'target-b.txt')))});
  // Genuine Public fresh reads; no private canonical projector substitutes for them.
  for(const memberKey of ['run_result','run_replay']){
    const source=r02.receipt.resources.run;assert.ok(source);
    const before=await readFile(new URL(handoff.prefix.eventLogRef));
    const read=registered.constructInstalledRunReadCall({environment,publicApi,projectReadContracts:readContracts,memberKey,
      selector:memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:4096}:{kind:'none'},source,
      eventResource:resource(product,handoff),identity:'r02-'+memberKey});
    const result=await cli('r02-'+memberKey,read.call);
    await save('r02-'+memberKey+'.json',result);
    if(memberKey==='run_replay'){assert.equal(result.exitCode,0);assert.equal(result.output.receipt.ownerOutput.outcomeKind,'result');}
    if(memberKey==='run_result'){assert.equal(result.exitCode,1);assert.equal(result.output.receipt.ownerOutput.outcomeKind,'refusal');}
    assert.deepEqual(result.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);
    assert.deepEqual(await readFile(new URL(handoff.prefix.eventLogRef)),before,'fresh read appends no bytes');
  }
  const installContentAfter=await Promise.all(environment.installCandidates.map(i=>product.installedProductContentMatches(i)));
  assert.ok(installContentAfter.every(Boolean));
  const nativeSlice=r02.events.slice(prior.events.length);
  const processRows=nativeSlice.filter(e=>e.kind==='actor_process_started');
  const processStatus=processRows.map(e=>{const pid=e.payload.pid??e.payload.processId;let absent=null;if(Number.isSafeInteger(pid)){try{process.kill(pid,0);absent=false;}catch(error){if(error.code==='ESRCH')absent=true;else throw error;}}return {eventRef:e.eventId,actorRef:e.parentAggregateId,pid:pid??null,absent};});
  await save('conservation.json',{installContentBefore:true,installContentAfter,processStatus,scope:'Known owned actual process rows only; no broad process census.',frozenProtocolSha:product.sha256Bytes(await readFile(protocol))});
  await save('final.json',{status:'bounded_installed_lifecycle_effect_proof',handoff,
    r01:{reusedHistorical:true,leaderStatus:0,coldLiveness:true},r02:{currentA:false,currentB:true,unknownAfter:true},
    semanticAssessment:false,modelProvider:false,UAT:false,remaining:'No general capacity, HTTP, C2 descendant or application adequacy claim.'});
  return {environment,handoff};
}

if(process.argv[1]!==undefined&&fileURLToPath(import.meta.url)===process.argv[1]){
  assert.equal(process.argv[2],'--execute','preparation import/syntax check does not execute');
  try {await execute(process.argv[3]);console.log(JSON.stringify({stage:'complete',status:'bounded_installed_lifecycle_effect_proof'}));}
  catch(error){await save('failure.json',{name:error.name,message:error.message,stack:error.stack,code:error.code??null});console.error(error.stack);process.exitCode=1;}
}
