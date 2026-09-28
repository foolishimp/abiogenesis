import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdir,mkdtemp,readFile,writeFile,readdir,copyFile,symlink} from 'node:fs/promises';
import {join,resolve,basename} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {nativeSelectionEnvironment} from '../support/native-registered-selection.mjs';
import {declarations,ref,contract} from '../fixtures/registered-selection-product/native.mjs';
const packageRoot=new URL('../..',import.meta.url).pathname;

test('native Executive selects registered capabilities through installed Public entry', {skip:process.env.ABI5_NATIVE_SELECTION_LIVE!=='1'}, async()=>{
  const evidence=process.env.ABI5_NATIVE_SELECTION_EVIDENCE_ROOT ?? await mkdtemp(join(tmpdir(),'abi5-native-selection-'));
  await mkdir(evidence,{recursive:true});
  const save=(name,value)=>writeFile(join(evidence,name),JSON.stringify(value,null,2)+'\n');
  const provider=JSON.parse(await readFile(process.env.ABI5_NATIVE_SELECTION_PROVIDER,'utf8'));
  let frozenArtifact;try{frozenArtifact=JSON.parse(await readFile(join(evidence,'frozen-artifact.json'),'utf8'));}catch{}
  let selectedEnvironment;
  const accounting={wallMs:{}};
  const environment=await setupInstalledRootCatalog({after:()=>{}},packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,setupAccounting:accounting,
    ...(frozenArtifact?{frozenArtifact}:{}),prepareAdditionalProducts:async basis=>{
      selectedEnvironment=await nativeSelectionEnvironment(basis);
      const abiPackageArchivePath=frozenArtifact?.artifactPath ?? join(basis.scratch,'artifacts',(await readdir(join(basis.scratch,'artifacts'))).find(p=>p.endsWith('.tgz')));
      return [await prepareRegisteredSelectionProduct({...basis,abiPackageArchivePath,declarationFactory:gtl=>declarations(gtl,selectedEnvironment.declaration),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('../fixtures/registered-selection-product/index.mjs',import.meta.url)},
          {path:'build/native.mjs',source:new URL('../fixtures/registered-selection-product/native.mjs',import.meta.url)}]})];
    }});
  const {product,gtl,abg}=environment;
  assert.equal(await product.sha256File(provider.executable),provider.sha256,'exact configured provider executable');
  if(!frozenArtifact){const installHost=join(evidence,'frozen-host');await mkdir(join(installHost,'node_modules/@abiogenesis'),{recursive:true});
    await symlink(environment.installedRoot,join(installHost,'node_modules/@abiogenesis/typescript-tenant'));
    frozenArtifact={artifactPath:environment.artifactPath,installHost,artifactSha256:await product.sha256File(environment.artifactPath)};
    await save('frozen-artifact.json',frozenArtifact);}
  await save('setup.json',{scratch:environment.scratch,installedRoots:environment.installedRoots,artifactPaths:environment.artifactPaths,accounting});
  await save('run-environment.json',selectedEnvironment.declaration);
  const declaration=environment.additionalPublications[0],root=declaration.graphFunctions.find(g=>g.name===ref('graph-function','root'));
  environment.catalogView=product.narrowGraphFunctionCatalog(environment.catalog,['root','A','B'].map(n=>ref('graph-function',n)));
  assert.equal(environment.catalogView.kind,'graph_function_catalog_view');
  assert.equal(Object.hasOwn(declaration.programs[0],'constructionComposition'),false);
  const load=async path=>import(pathToFileURL(join(environment.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),readContracts=await load('abg/project_read_operation_contracts');
  const storeOwner=await load('abg/event_store'),callOwner=await load('abg/c_call'),cursorOwner=await load('abg/traversal_cursor'),assemblyOwner=await load('abg/instruction_assembly');
  const targets=['A','B'].map(n=>environment.catalogView.entries.find(e=>e.definitionRef===ref('graph-function',n))).map(e=>({graphFunctionRef:e.definitionRef,definitionDigest:e.definitionDigest}));
  const record={service:'Atlas',status:'healthy'};
  const cases=[
    {name:'machine',requirement:'The receiving service consumes a single JSON object and rejects labels, Markdown and prose. Preserve both field names and values.',expected:'A'},
    {name:'human',requirement:'This record is for an on-call operator reading plain text in a terminal. Put each field on its own labelled line; avoid JSON punctuation.',expected:'B'},
    {name:'unsupported',requirement:'The receiving verifier requires a cryptographically signed binary record whose signature can be checked against an approved public key. Neither unsigned text nor unsigned JSON satisfies the request.',expected:null},
  ];
  const task=requirement=>({kind:'registered_selection_task',schemaVersion:'5.0.0',workerActorRef:ref('actor','executive'),workerBindingRef:ref('worker','native-selection'),
    task:'Choose a permitted registered capability that serves the current recipient requirement, or preserve an explicit gap.',
    observations:[{observationRef:ref('observation','record'),qualification:'Current record supplied for this invocation; not independently verified workspace state.',value:record},
      {observationRef:ref('observation','recipient'),qualification:'Current recipient requirement supplied for this invocation.',value:requirement}],
    requiredSupportRefs:[ref('support','recipient-output')],childInput:{contractRef:contract('child-input'),value:{kind:'selection_record_input',record}},maxPromptBytes:65_536});
  const sample=task(cases[0].requirement),raw={disposition:'selected',graphFunctionRef:targets[0].graphFunctionRef,reason:'controlled domain probe',evidenceRefs:[sample.observations[0].observationRef]};
  const bound=product.materializeNativeRegisteredChoice(sample,targets,raw);
  assert.deepEqual(bound.input,sample.childInput);
  assert.equal(product.materializeNativeRegisteredChoice(sample,targets,{...raw,graphFunctionRef:ref('graph-function','outside')}),null);
  assert.equal(product.materializeNativeRegisteredChoice(sample,targets,{...raw,extra:'malformed'}),null);
  assert.equal(product.materializeNativeRegisteredChoice(sample,targets,{...raw,evidenceRefs:[ref('observation','unknown')]}),null);
  assert.equal(gtl.resolveRegisteredSelection({...root.template,applications:[]},{currentNodeRef:ref('node','select'),termPath:gtl.rootCSourcePath(ref('node','select'))},contract('choice'),bound,Object.fromEntries(targets.map(t=>[t.graphFunctionRef,t.definitionDigest]))),null);
  let handoff=environment.store.projectReopenAuthorityAndClose();
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const missing=await constructInstalledStartCall({environment,publicApi,eventResource:resource(),input:sample,identity:'missing-context'});
  const refused=await runInstalledCliRequest({scratch:environment.scratch,installedRoot:environment.installedRoot,identity:'missing-context',acquisition:{kind:'reopen',closeHandoff:handoff},call:missing.call,expectedExitCode:null});
  await save('missing-context.json',refused);
  assert.equal(refused.output.receipt.ownerOutput.outcomeKind,'refusal');
  assert.ok(refused.output.receipt.ownerOutput.value.issuePaths.some(p=>p.includes('missing_binding')));
  handoff=refused.output.receipt.resources.eventResource.closeHandoff;
  assert.equal(storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).some(e=>e.kind==='actor_invocation_opened'),false);
  const actorEnvironment={...process.env,ABG_TS_CLAUDE_COMMAND:provider.executable,ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(provider.appendArgs)};
  const results=[];
  for(const scenario of cases){
    const input=task(scenario.requirement),before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
    const start=await constructInstalledStartCall({environment,publicApi,eventResource:resource(),input,identity:scenario.name,runEnvironmentResourceFactory:selectedEnvironment.resources});
    const execution=await runInstalledCliRequest({scratch:environment.scratch,installedRoot:environment.installedRoot,identity:scenario.name,
      acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,environment:actorEnvironment});
    await save(`case-${scenario.name}.json`,execution);
    const receipt=execution.output.receipt;assert.ok(receipt,JSON.stringify(execution.output));
    handoff=receipt.resources.eventResource.closeHandoff;await save('final-handoff.json',handoff);
    const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),slice=events.slice(before);await save(`events-${scenario.name}.json`,slice);
    const binding=slice.find(e=>e.kind==='actor_transport_binding_admitted');
    if(binding){await save(`assembly-${scenario.name}.json`,binding.payload.instructionAssembly);
      for(const [name,path] of Object.entries(binding.payload.paths)){if(typeof path==='string')try{await copyFile(path,join(evidence,`${scenario.name}-${name}-${basename(path)}`));}catch(error){if(error.code!=='ENOENT')throw error;}}}
    assert.equal(receipt.ownerOutput.outcomeKind,'result',JSON.stringify(receipt.ownerOutput));
    assert.equal(receipt.ownerOutput.value.disposition,scenario.expected===null?'blocked':'completed',JSON.stringify(receipt.ownerOutput));
    assert.ok(binding,'owned real native transport');assert.equal(binding.payload.command,provider.executable);
    assert.equal(binding.payload.args[binding.payload.args.indexOf('--model')+1],'claude-opus-5-5');
    assert.equal(binding.payload.args[binding.payload.args.indexOf('--effort')+1],'xhigh');assert.ok(!binding.payload.args.includes('--fallback-model'));
    const stdout=await readFile(binding.payload.paths.stdoutPath??binding.payload.paths.stdout,'utf8');
    const nativeRows=stdout.trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
    const reportedModels=[...new Set(nativeRows.flatMap(row=>[row.model,row.message?.model,...Object.keys(row.modelUsage??{})]).filter(Boolean))];
    assert.ok(reportedModels.length>0);assert.ok(reportedModels.every(m=>m==='claude-opus-5-5'),JSON.stringify(reportedModels));
    const observation=slice.find(e=>e.kind==='actor_result_artifact_observed'),close=slice.find(e=>e.kind==='actor_invocation_closed');
    assert.equal(observation.payload.toolCallCount,0);const rawAnswer=JSON.parse(observation.payload.finalOutput);
    const choice=slice.find(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='registered_graph_choice');
    assert.deepEqual(choice.payload.value,product.materializeNativeRegisteredChoice(input,targets,rawAnswer));
    assert.equal(rawAnswer.disposition,scenario.expected===null?'gap':'selected');
    if(scenario.expected!==null)assert.equal(rawAnswer.graphFunctionRef,ref('graph-function',scenario.expected),'unexpected semantic selection stops the remaining attempts');
    const opened=slice.filter(e=>e.kind==='graph_call_opened').map(e=>e.graphFunctionRef);
    assert.deepEqual(opened,[root.name,...(scenario.expected===null?[]:[ref('graph-function',scenario.expected)])]);
    assert.equal(slice.filter(e=>e.kind==='child_foldback_admitted').length,scenario.expected===null?0:1);
    assert.equal(slice.filter(e=>e.kind==='run_closed').length,scenario.expected===null?0:1);
    const prompt=binding.payload.instructionAssembly.request.prompt;
    assert.ok(!prompt.includes('readinessBasis'));assert.ok(Buffer.byteLength(prompt)<=input.maxPromptBytes);
    const nativeMs=Date.parse(close.eventTime)-Date.parse(slice.find(e=>e.kind==='actor_invocation_opened').eventTime);
    results.push({name:scenario.name,disposition:receipt.ownerOutput.value.disposition,wallMs:execution.wallMs,nativeIntervalMs:nativeMs,
      frameworkOutsideNativeIntervalMs:execution.wallMs-nativeMs,promptBytes:Buffer.byteLength(prompt),publicRequestBytes:(await readFile(execution.requestPath)).length,reportedModels,rawAnswer});
    await save('cases.json',results);console.log(scenario.name,rawAnswer.disposition,rawAnswer.graphFunctionRef??'gap',`${execution.wallMs.toFixed(1)}ms`);
    for(const memberKey of ['run_result','run_replay']){
      const readCall=constructInstalledRunReadCall({environment,publicApi,projectReadContracts:readContracts,memberKey,
        selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source:receipt.resources.run,eventResource:resource(),identity:`${scenario.name}-${memberKey}`});
      const read=await runInstalledCliRequest({scratch:environment.scratch,installedRoot:environment.installedRoot,identity:`${scenario.name}-${memberKey}`,acquisition:{kind:'reopen',closeHandoff:handoff},call:readCall.call});
      await save(`read-${scenario.name}-${memberKey}.json`,read);assert.equal(read.output.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(read.output));
      assert.deepEqual(read.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);
      assert.deepEqual(read.output.receipt.ownerOutput.value.projection.terminalResult,receipt.ownerOutput.value.terminalResult);
      assert.deepEqual(read.output.receipt.ownerOutput.value.projection.replay,receipt.resources.replay);
    }
    if(scenario.name==='machine'){
      const predecessorPrefix=storeOwner.durableRuntimeEventPrefixThroughEvent(handoff.prefix,close.eventId);
      const prefix=abg.selectValidatedRuntimeEventPrefix(storeOwner.readRuntimeEventsAtDurablePrefix(predecessorPrefix));
      const executionBasis=abg.rehydrateExecutionBasisAtPrefix(prefix,binding.basisId);
      const graph=gtl.materializeGraph(root,{invocationAdmissionRef:executionBasis.invocationAdmissionRef,admittedInputRef:executionBasis.rawInputAdmissionRef,admittedInputDigest:executionBasis.rawInputDigest,admittedInput:executionBasis.rawInputValue});
      const entered=slice.find(e=>e.kind==='traversal_cursor_entered'&&e.basisId===binding.basisId);
      const cursor=cursorOwner.constructTraversalCursorCandidate({programRef:executionBasis.programRef,executionBasisRef:executionBasis.basisRef,traversalScopeRef:entered.payload.traversalScopeRef,
        runId:binding.runId,graphCallId:binding.graphCallId,frameId:binding.frameId,graphRef:graph.materializationRef,inputRef:executionBasis.rawInputAdmissionRef,inputDigest:executionBasis.rawInputDigest,
        currentNodeRef:ref('node','select'),position:'at_term',termPath:gtl.rootCSourcePath(ref('node','select')),taskOrdinal:null,attempt:1,retryPath:[]});
      const cCall=callOwner.projectOpenedCCallCarrierAtPrefix(prefix,graph,binding.payload.cCallRef);
      const basis={publication:declaration,graph,graphFunction:root,declarationGraphFunctions:declaration.graphFunctions,executionBasis,cCall,cursor,predecessorPrefix};
      assert.equal(assemblyOwner.registeredSelectionInstructionResultMatches(basis,input,choice.payload.value),true);
      const changed=structuredClone(choice.payload.value);changed.graphFunctionRef=targets[1].graphFunctionRef;changed.definitionDigest=targets[1].definitionDigest;
      assert.equal(assemblyOwner.registeredSelectionInstructionResultMatches(basis,input,changed),false,'observed A cannot become permitted B');
      const changedInput=structuredClone(choice.payload.value);changedInput.input.value.record.status='changed';
      assert.equal(assemblyOwner.registeredSelectionInstructionResultMatches(basis,input,changedInput),false,'bound input cannot change after observation');
      const stale=structuredClone(basis.declarationGraphFunctions);stale[1].declarations['abg.functional_purpose']='changed';
      const refusal=assemblyOwner.evaluateRegisteredSelectionInstructionAssembly({...basis,declarationGraphFunctions:stale},input);
      assert.equal(refusal.kind,'native_instruction_assembly_refusal');
      await save('mechanical.json',{missingContext:'Public refusal before actor',undeclaredChoiceData:'ordinary',unknownRawTarget:'refused',malformedRaw:'refused',unknownEvidence:'refused',rawChoiceChange:'refused',boundInputChange:'refused',staleTarget:refusal,
        scope:'controlled installed owner checks against the real native basis; no extra provider invocations'});
    }
  }
  await writeFile(join(evidence,'events.jsonl'),await readFile(new URL(handoff.prefix.eventLogRef)));
});
