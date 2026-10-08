import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {sourceOnlyEnvironment,manifestDigest} from '../crosscut-installed-source-context-proof-82/method.mjs';
import {ids,fixtureRef,lifecycleEffectDeclaration} from './declarations-composed.mjs';

const phase=dirname(fileURLToPath(import.meta.url));
const tenant='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const support=name=>import(pathToFileURL(join(tenant,'test_env/support',name+'.mjs')).href);
const load=(root,name)=>import(pathToFileURL(join(root,'build/code/src',name+'.js')).href);
const save=(name,value)=>writeFile(join(phase,'successor-composed','execution',name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
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

async function nativeMethod(setup){
  const selected=await sourceOnlyEnvironment(setup);
  const declaration=setup.gtl.constructRunEnvironmentDeclaration({...structuredClone(selected.declaration),
    declarationRef:fixtureRef('environment','native-only'),roles:selected.declaration.roles.filter(r=>r.role==='constructor')});
  assert.equal(declaration.roles.length,1);
  assert.equal(declaration.roles[0].graphFunctionRef,setup.product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef);
  return {declaration,source:selected.source,async resources({authority,program,workspaceBinding,product}){
    const temporaryRoot=join(workspaceBinding.roots.archiveRoot,'local-source-context80');
    await mkdir(temporaryRoot,{recursive:true});
    const coordinates={dependencies:[{dependencyRef:declaration.dependencies[0].dependencyRef,
      root:selected.source.root,recordPath:selected.source.recordPath}],pythonPath:null,temporaryRoot:await realpath(temporaryRoot)};
    return product.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:'5.0.0',...coordinates,
      permission:{authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,
        actorRef:authority.actorRef,programRef:program.programRef,environmentRef:declaration.declarationRef,
        environmentDigest:product.sha256Canonical(declaration),operations:['read_context'],...coordinates}});
  }};
}

// Root supplies an exact separately accepted archive/install-host selector.
// Importing this module or syntax checking it never enters native execution.
export async function execute(frozenArtifactPath){
  assert.equal(typeof frozenArtifactPath,'string','explicit frozen candidate selector is required');
  const frozenArtifact=JSON.parse(await readFile(frozenArtifactPath,'utf8'));
  for(const key of ['artifactPath','artifactSha256','installHost'])assert.equal(typeof frozenArtifact[key],'string',key);
  const digest='sha256:'+createHash('sha256').update(await readFile(frozenArtifact.artifactPath)).digest('hex');
  assert.equal(digest,frozenArtifact.artifactSha256.startsWith('sha256:')?frozenArtifact.artifactSha256:'sha256:'+frozenArtifact.artifactSha256);
  const methodBytes=await readFile(new URL('../crosscut-installed-source-context-proof-82/method.mjs',import.meta.url));
  assert.equal(createHash('sha256').update(methodBytes).digest('hex'),'303bed8f5dcefcc780c26e6b93a0e771b9c3ff403a8c38ba215871041e75eaa2');
  await mkdir(join(phase,'successor-composed','execution'),{recursive:false});
  const [{setupInstalledRootCatalog},registered]=await Promise.all([
    support('root-installed-environment'),support('registered-graph-selection')]);
  let method;
  // Source resources are preserved for independent cold proof. This is test
  // resource lifetime management, never a runtime-admission recording double.
  const cleanupRegistrations=[];
  const environment=await setupInstalledRootCatalog({after:callback=>cleanupRegistrations.push(callback)},tenant,{
    frozenArtifact,candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    programRef:'program://abiogenesis/worksite/file-replace@5',
    graphFunctionRef:'graph-function://abiogenesis/worksite/file-replace@5',
    additionalCorePublicationConstructors:['constructNativeWorkspaceWorkModulePublication'],
    prepareAdditionalProducts:async setup=>{
      method=await nativeMethod(setup);
      const abi=setup.abiPublication,binding=abi.productSemanticsBinding;
      const native=setup.gtl.constructNativeWorkspaceWorkModulePublication({productId:abi.owningProductId,
        artifactDigest:abi.artifactDigest,productContentDigest:abi.productContentDigest,
        productManifestDigest:abi.productManifestDigest,packageName:binding.packageName,packageVersion:binding.packageVersion});
      return [await registered.prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:frozenArtifact.artifactPath,
        declarationFactory:gtl=>lifecycleEffectDeclaration(gtl,native,method.declaration,abi),
        fixtureFiles:[{path:'build/ordinary-protocol-fixture.mjs',source:pathToFileURL(join(phase,'ordinary-protocol-fixture.mjs'))}]})];
    }});
  const {product,abg,installedRoot,workspaceBinding,workspaceAuthority}=environment;
  const [publicApi,storeOwner,readContracts,eventCalculus]=await Promise.all([
    load(installedRoot,'public/index'),load(installedRoot,'abg/event_store'),
    load(installedRoot,'abg/project_read_operation_contracts'),load(installedRoot,'abg/event_calculus')]);
  const native=product.NATIVE_WORKSPACE_WORK_IDS;
  const c0=environment.gtl.WORKSITE_C0_IDS;
  const protocol=join(environment.additionalInstallCandidates[0].installedRoot,'build/ordinary-protocol-fixture.mjs');
  assert.equal(product.sha256Bytes(await readFile(protocol)),product.sha256Bytes(await readFile(join(phase,'ordinary-protocol-fixture.mjs'))));
  environment.catalogView=product.narrowGraphFunctionCatalog(environment.catalog,[c0.graphFunctionRef,ids.c0GraphFunctionRef,ids.graphFunctionRef,native.graphFunctionRef]);
  assert.equal(environment.catalogView.kind,'graph_function_catalog_view');
  await save('setup.json',{scratch:environment.scratch,installedRoots:environment.installedRoots,
    artifactPaths:environment.artifactPaths,verified:environment.verified,method:method.declaration,
    methodManifest:manifestDigest,protocol,cleanupRegistered:cleanupRegistrations.length,
    originalInputsArePhysicalOnly:true,privateRuntimeWriter:false});
  // Canonical installed pure closure checks precede any new native dispatch.
  for(const [name,programRef,rootRef] of [['native',ids.programRef,ids.graphFunctionRef],['c0',ids.c0ProgramRef,ids.c0GraphFunctionRef]]){
    const resolved=await product.ProductExecutionResolutionPort.resolve({catalog:environment.catalog,catalogView:environment.catalogView,
      admittedInstalls:environment.admittedInstalls,verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(environment.artifactTruth,install),
      programRef,selection:Object.freeze({kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'})});
    await save('pure-'+name+'-resolution.json',resolved.kind==='loaded_product_execution_resolution'?{
      kind:resolved.kind,programRef:resolved.program.programRef,rootRef,programDigest:product.sha256Canonical(resolved.program),
      inputContract:resolved.resolution.inputContract,outputContract:resolved.resolution.outputContract,
      closure:resolved.declarationClosure,semanticsBinding:resolved.declarationClosure.programPublication.productSemanticsBinding,
      leafOwners:resolved.implementationSetCandidate.rows.map(row=>({graphFunctionRef:row.graphFunctionRef,
        graphFunctionOwnerProductId:row.graphFunctionOwnerProductId,implementationOwnerProductId:row.implementationOwnerProductId,computeRegime:row.computeRegime}))
    }:resolved);
    assert.equal(resolved.kind,'loaded_product_execution_resolution',JSON.stringify(resolved));
    assert.equal(resolved.declarationClosure.programPublication.owningProductId,ids.productId);
    assert.equal(resolved.declarationClosure.semanticsOwner.productId,environment.verified.productId);
    assert.equal(resolved.implementationSetCandidate.rows.every(row=>row.implementationOwnerProductId===environment.verified.productId),true);
  }
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
      ...(mode===undefined?{}:{runEnvironmentResourceFactory:method.resources}),
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
    const execution=await registered.runInstalledCliRequest({scratch:environment.scratch,installedRoot,identity,
      acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,environment:{...process.env,...worker}});
    await save(identity+'-execution.json',execution);
    assert.equal(execution.output.kind,'installed_definition_call_transport_result');
    const receipt=execution.output.receipt;assert.equal(receipt.kind,'definition_host_receipt');
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
  const r01=await invoke('r01',ids.programRef,ids.startRef,g=>nativeInput(g,[]),'r01-leader-exit');
  const actor01=r01.events.filter(e=>e.kind==='actor_invocation_started'&&e.runId===r01.receipt.resources.run?.ref);
  assert.equal(actor01.length,1,'one actual registered native actor');
  const exits=r01.events.filter(e=>e.kind==='actor_process_exited'&&e.parentAggregateId===actor01[0].aggregateId);
  assert.equal(exits.length,1);assert.equal(exits[0].payload.status,0,'original leader status is preserved');
  const outcomes=r01.events.filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===native.graphFunctionRef);
  const value=outcomes.at(-1)?.payload.value;
  const artifacts=r01.events.filter(e=>e.kind==='actor_result_artifact_observed'&&e.aggregateId===actor01[0].aggregateId);
  const carrier=artifacts.at(-1)?.payload;
  const residue=r01.events.filter(e=>e.kind==='actor_process_termination_unconfirmed'&&e.parentAggregateId===actor01[0].aggregateId);
  assert.ok((carrier?.terminationConfirmed===true&&carrier.processStatus===0)||residue.length===1,
    'group absence is owner-confirmed or truthful unknown residue is admitted; leader exit alone is insufficient');
  const liveness=abg.projectRuntimeLivenessAtPrefix(r01.prefix,actor01[0].aggregateId);assert.ok(liveness,'cold native liveness owns the actual occurrence');
  await save('r01-proof.json',{actor:actor01[0],exits,artifact:artifacts.at(-1)??null,selectedResult:outcomes.at(-1)??null,residue,liveness,
    premise:'Controlled ordinary protocol process; no provider/model/semantic assessment credit.'});
  const observations={};
  for(const relativePath of ['target-a.txt','target-b.txt']){
    const before=readCold().events.length;
    const c0proof=await invoke(relativePath==='target-a.txt'?'c0-a':'c0-b',ids.c0ProgramRef,ids.c0StartRef,async grant=>{
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
  const r02=await invoke('r02',ids.programRef,ids.startRef,g=>nativeInput(g,['target-a.txt','target-b.txt']),'r02-channel-conflict');
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
    const result=await registered.runInstalledCliRequest({scratch:environment.scratch,installedRoot,identity:'r02-'+memberKey,
      acquisition:{kind:'reopen',closeHandoff:handoff},call:read.call,expectedExitCode:null,environment:process.env});
    await save('r02-'+memberKey+'.json',result);
    if(memberKey==='run_replay')assert.equal(result.output.receipt.ownerOutput.outcomeKind,'result');
    assert.deepEqual(result.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);
    assert.deepEqual(await readFile(new URL(handoff.prefix.eventLogRef)),before,'fresh read appends no bytes');
  }
  await save('final.json',{status:'bounded_installed_lifecycle_effect_proof',handoff,
    r01:{leaderStatus:0,coldLiveness:true},r02:{currentA:false,currentB:true,unknownAfter:true},
    semanticAssessment:false,modelProvider:false,UAT:false,remaining:'No general capacity, HTTP, C2 descendant or application adequacy claim.'});
  return {environment,handoff};
}

if(process.argv[1]!==undefined&&fileURLToPath(import.meta.url)===process.argv[1]){
  assert.equal(process.argv[2],'--execute','preparation import/syntax check does not execute');
  await execute(process.argv[3]);
}
