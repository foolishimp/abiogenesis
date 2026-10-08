import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,cp,chmod} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {sourceOnlyEnvironment,manifestDigest} from './method.mjs';
const phase=dirname(fileURLToPath(import.meta.url));
const tenant='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const support=async name=>import(pathToFileURL(join(tenant,'test_env/support',name+'.mjs')));
const load=async(root,name)=>import(pathToFileURL(join(root,'build/code/src',name+'.js')));
const save=(root,name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const literal='\uFEFF[error] *** exact Ω😀 diagnostic '+'Ω😀'.repeat(2400)+'\n';

async function fixture(product){
  const {witnessInput}=await support('default-library');
  const seedRoot=join(phase,'fixture'),files={
    'source/original-basic-cli.txt':'\uFEFFLocal framework source/context composition witness Ω😀. Preserve native/C2 producer identity and exact BOM/Unicode stream bytes. Semantic adequacy is deliberately unmet.\n',
    'source/witness-contract.md':'Operate only in the declared scope. The native fixture marker is partial work. Testing records its declared command without an application verdict. Independent assessment retains unmet adequacy.\n',
    'source/basic-cli.oracle.json':'{"semanticAdequacy":"unmet","purpose":"declared local protocol fixture"}\n',
    'generated/hello-world.mjs':'// supplied local protocol fixture material\n'};
  for(const [path,text]of Object.entries(files)){const target=join(seedRoot,path);await mkdir(dirname(target),{recursive:true});await writeFile(target,text,{flag:'wx'});}
  const selection={seedFiles:Object.fromEntries(Object.entries(files).map(([path,text])=>[path,{bytes:Buffer.byteLength(text),sha256:product.sha256Bytes(Buffer.from(text)).slice(7)}])),
    protectedSeedPaths:Object.keys(files).filter(p=>p.startsWith('source/')),applicationWriteRoots:['generated/hello-world.mjs'],evidenceWriteRoots:[],
    commands:[{command:process.execPath,args:['--eval',`process.stdout.write(${JSON.stringify(literal)});process.exitCode=7;`]}]};
  return {seedRoot,selection,input:await witnessInput({product,selection,seedRoot})};
}

export async function prepare(){
  const [product,gtl]=await Promise.all([load(tenant,'product/index'),load(tenant,'gtl/index')]);
  const method=await sourceOnlyEnvironment({product,gtl});
  assert.equal(gtl.isRunEnvironmentDeclaration(method.declaration),true);
  const roles=method.declaration.roles;assert.deepEqual(roles.map(r=>r.role),['selector','constructor','assessor','command_executor']);
  const result=await fixture(product);
  assert.equal(result.input.terminal,false);assert.deepEqual(result.input.observations,[]);assert.equal(result.input.synthesis,null);
  assert.equal(result.input.original.testing.commands[0].timeoutMs,20_000);
  await save(phase,'method.json',method.declaration);await save(phase,'selection.json',result.selection);await save(phase,'input.json',result.input);
  await chmod(join(phase,'protocol.mjs'),0o755);
  const report={prepared:true,manifestDigest,genericSourceOnly:true,corpusAccess:null,roles:roles.map(r=>({role:r.role,graphFunctionRef:r.graphFunctionRef,frameRefs:r.frameRefs})),
    inputDigest:product.sha256Canonical(result.input),literalBytes:Buffer.byteLength(literal),literalDigest:product.sha256Bytes(Buffer.from(literal)),
    candidate20:null,installedExecution:false,modelExecution:false,specializedStdoAcceptance:false};
  await save(phase,'prepared.json',report);return report;
}

// Execution is a separate Root release. Preparation never enters this function.
export async function execute(frozenArtifactPath){
  assert.ok(frozenArtifactPath,'exact separately released candidate20 host/archive selector required');
  const frozenArtifact=JSON.parse(await readFile(frozenArtifactPath,'utf8'));
  const binding=JSON.parse(await readFile(join(phase,'input-binding.json'),'utf8'));
  assert.equal(frozenArtifact.artifactPath,binding.candidate.archive.path);
  assert.equal(frozenArtifact.artifactSha256,binding.candidate.archive.sha256);
  assert.equal(typeof frozenArtifact.installHost,'string','separately released 83 host required');
  for(const pin of [binding.candidate.identity,binding.candidate.archive,binding.freshReadHelper]){
    const bytes=await readFile(pin.path);assert.equal(bytes.length,pin.byteCount);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),pin.sha256);
  }
  const evidence=join(phase,'execution-authority-root');await mkdir(evidence,{recursive:false});
  const [{setupInstalledRootCatalog},{prepareRegisteredSelectionProduct,constructInstalledStartCall,runInstalledCliRequest},library]=await Promise.all([
    support('root-installed-environment'),support('registered-graph-selection'),support('default-library')]);
  let method;
  const env=await setupInstalledRootCatalog({after:()=>{}},tenant,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,frozenArtifact,
    programRef:'program://abiogenesis/worksite/file-replace@5',graphFunctionRef:'graph-function://abiogenesis/worksite/file-replace@5',
    additionalCorePublicationConstructors:['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'],
    prepareAdditionalProducts:async setup=>{
      method=await sourceOnlyEnvironment(setup);
      const basis=setup.abiPublication,semantics=basis.productSemanticsBinding;
      const publication=setup.gtl.constructDefaultGovernanceLibraryModulePublication({productId:basis.owningProductId,artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,productManifestDigest:basis.productManifestDigest,packageName:semantics.packageName,packageVersion:semantics.packageVersion});
      const schema=join(evidence,'assessment.schema.json');await writeFile(schema,JSON.stringify(library.assessmentSchema)+'\n',{flag:'wx'});
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:frozenArtifact.artifactPath,
        declarationFactory:g=>library.libraryConsumerDeclaration(g,publication,method.declaration,{purposes:['construction','testing','uat'],bound:8}),
        fixtureFiles:[{path:'build/index.mjs',source:pathToFileURL(join(tenant,'test_env/fixtures/default-library-product/index.mjs'))}],
        schemaAssets:[{path:library.schemaPath,source:schema,contractId:library.witnessRef('contract','assessment'),requirementAuthorityRefs:[library.witnessRef('support','complete-source-outcome')]}]})];
    }});
  assert.equal(env.verified.productContentDigest,binding.candidate.productContentDigest);
  assert.equal(env.verified.manifestDigest,binding.candidate.canonicalManifestDigest);
  const product=env.product,input=JSON.parse(await readFile(join(phase,'input.json'),'utf8')),selection=JSON.parse(await readFile(join(phase,'selection.json'),'utf8'));
  assert.equal(product.isWorkspaceAuthorityBasis(env.workspaceAuthority),true);
  assert.equal(product.isWorkspaceBindingCandidate(env.bindingCandidate,env.lock,env.productSet,env.workspaceAuthority),true);
  assert.equal(env.workspaceBinding.authorityBasisId,env.workspaceAuthority.authorityBasisId);
  assert.equal(env.workspaceBinding.authorityBasisDigest,env.workspaceAuthority.authorityBasisDigest);
  assert.equal(env.workspaceBinding.bindingId,env.bindingCandidate.bindingId);
  assert.equal(env.workspaceBinding.bindingDigest,env.bindingCandidate.bindingDigest);
  const worksite=env.workspaceAuthority.canonicalRoot;
  await save(evidence,'setup.json',{scratch:env.scratch,installedRoot:env.installedRoot,workspaceAuthority:env.workspaceAuthority,workspaceBinding:env.workspaceBinding,
    setupProgram:'program://abiogenesis/worksite/file-replace@5',actualExternalProgram:env.additionalPublications[0].programs[0].programRef,content:env.verified.productContentDigest});
  await cp(join(phase,'fixture'),worksite,{recursive:true});
  for(const [path,row]of Object.entries(selection.seedFiles))assert.equal(await product.sha256File(join(worksite,path)),'sha256:'+row.sha256);
  const refs=env.additionalPublications[0].programs[0].callableMembership;
  env.catalogView=product.narrowGraphFunctionCatalog(env.catalog,refs);assert.equal(env.catalogView.kind,'graph_function_catalog_view');
  const [publicApi,storeOwner]=await Promise.all([load(env.installedRoot,'public/index'),load(env.installedRoot,'abg/event_store')]);
  const before=env.store.projectReopenAuthorityAndClose(),eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:before,handoffDigest:product.sha256Canonical(before)};
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource,input,identity:'source-context82',runEnvironmentResourceFactory:method.resources});
  assert.equal(start.resolution.program.programRef,library.witnessRef('program','witness'),'actual full cross-owner external Program at start');
  await save(evidence,'input.json',input);await save(evidence,'method.json',method.declaration);
  const execution=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:'source-context82',acquisition:{kind:'reopen',closeHandoff:before},call:start.call,expectedExitCode:null,
    environment:{...process.env,ABG_TS_CLAUDE_COMMAND:join(phase,'protocol.mjs'),ABG_TS_CLAUDE_APPEND_ARGS:'[]'}});
  await save(evidence,'execution.json',execution);
  const receipt=execution.output.receipt;assert.ok(receipt,'actual Public receipt');
  const handoff=receipt.resources.eventResource.closeHandoff;await save(evidence,'handoff.json',handoff);
  const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix);
  const results=events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.resultClass==='success');
  const parent=results.filter(e=>product.isGovernanceWorkState(e.payload.value)).at(-1);assert.ok(parent,'authentic folded parent');
  const state=parent.payload.value;assert.deepEqual(state.original,input.original);assert.equal(state.terminal,false);assert.deepEqual(state.unresolvedSupportRefs,input.unresolvedSupportRefs);
  assert.deepEqual(state.observations.map(o=>o.purpose),['testing','construction','testing','uat']);
  const commands=state.observations.filter(o=>o.purpose==='testing');
  for(const row of commands){const stream=row.value.commandResults[0].stdout;assert.equal(stream.text,literal);assert.equal(stream.digest,product.sha256Bytes(Buffer.from(literal)));assert.equal(stream.byteLength,Buffer.byteLength(literal));assert.equal(row.value.commandResults[0].exitStatus,7);}
  const taskRows=results.filter(e=>product.isFramedSynthesisTask(e.payload.value));
  const taskEvent=taskRows.find(e=>e.payload.value.state.observations.length===1);assert.ok(taskEvent,'actual C2-bearing framed task Result');
  const task=taskEvent.payload.value;
  const synthesis=results.find(e=>product.isFramedSynthesisResult(e.payload.value)&&e.payload.value.state.observations.length===1);assert.ok(synthesis);
  const targets=env.catalog.boundPublications.flatMap(p=>p.graphFunctions).filter(g=>refs.includes(g.name)&&g.declarations['abg.default_library_purpose']).map(g=>({graphFunctionRef:g.name,definitionDigest:product.sha256Canonical(g),purpose:g.declarations['abg.default_library_purpose']}));
  const testing=targets.find(t=>t.purpose==='testing'),raw=structuredClone(synthesis.payload.value.judgment),c2Ref=task.state.observations[0].resultRef;
  raw.nextGraphFunctionRef=testing.graphFunctionRef;raw.subjectEvidenceRef=c2Ref;raw.contributions=[{...raw.contributions[0],graphFunctionRef:testing.graphFunctionRef}];
  const Ajv=(await import(pathToFileURL(join(env.installedRoot,'node_modules/ajv/dist/2020.js')))).default;
  assert.equal(new Ajv({strict:false}).compile(product.framedSynthesisResponseSchema(task,targets))(raw),false);
  assert.equal(product.bindFramedSynthesisResult(task,targets,synthesis.payload.value.basis,raw),null);
  const assemblies=events.filter(e=>e.kind==='actor_transport_binding_admitted').map(e=>({event:e,assembly:e.payload.instructionAssembly}));
  const parseSections=prompt=>Object.fromEntries(prompt.split(/^## /m).slice(1).map(part=>{
    const cut=part.indexOf('\n');return [part.slice(0,cut),JSON.parse(part.slice(cut+1).trim())];}));
  const planning=assemblies.map(({event,assembly})=>({event,sections:parseSections(assembly.request.prompt)})).filter(r=>Array.isArray(r.sections.task?.observations));
  assert.ok(planning.length>=4,'actual owned selector assemblies');
  const projected=planning.find(r=>r.sections.task.observations.length===1).sections.task;
  const planningStream=projected.observations[0].observed.commandResults[0].stdout;
  assert.equal(planningStream.rawBody.resultRef,c2Ref);assert.equal(planningStream.rawBody.resultDigest,task.state.observations[0].resultDigest);
  assert.deepEqual(planningStream.rawBody.fieldPath,['commandResults',0,'stdout']);
  const sourceResult=results.find(e=>e.payload.resultRef===c2Ref);assert.ok(sourceResult);
  const sourceStream=planningStream.rawBody.fieldPath.reduce((value,key)=>value[key],sourceResult.payload.value);
  const bytes=sourceStream.encoding==='base64'?Buffer.from(sourceStream.payload,'base64'):Buffer.from(sourceStream.text);
  assert.equal(bytes.equals(Buffer.from(literal)),true);assert.equal(planningStream.digest,product.sha256Bytes(bytes));
  assert.ok(planningStream.omittedCandidates>0,'real clipped display');assert.ok(planningStream.displayedByteCount<=8192);
  assert.ok(planningStream.excerpts.some(e=>e.text.startsWith('\uFEFF')&&e.text.includes('Ω😀')),'BOM/Unicode remain in actual display');
  for(const excerpt of planningStream.excerpts){
    const expected=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes.subarray(excerpt.startByte,excerpt.endByte));
    assert.equal(excerpt.text,expected,'literal UTF-8 byte citation');
  }
  const declaredEntry=projected.worksite.files.find(e=>e.path==='source/original-basic-cli.txt');assert.ok(declaredEntry);
  const text=declaredEntry.contentIn==='originalTask'?projected.originalTask.slice(declaredEntry.startCharacter,declaredEntry.endCharacter):declaredEntry.content;
  assert.equal(Buffer.from(text).equals(await readFile(join(phase,'fixture/source/original-basic-cli.txt'))),true,'actual declared source retains BOM/Unicode');
  const nativePrepared=results.find(e=>e.payload.value?.kind==='native_workspace_work_task'&&e.payload.value.assessment===undefined);assert.ok(nativePrepared);
  assert.equal(nativePrepared.payload.value.outcome,synthesis.payload.value.judgment.contributions.find(c=>c.graphFunctionRef===synthesis.payload.value.judgment.nextGraphFunctionRef).contribution);
  const nativeContext=JSON.parse(nativePrepared.payload.value.instructions.find(i=>i.startsWith('Actual admitted observations: ')).slice('Actual admitted observations: '.length));
  assert.equal(nativeContext[0].value.commandResults[0].stdout.text,literal);assert.equal(nativeContext[0].resultRef,c2Ref);
  const c2Tasks=results.filter(e=>e.payload.value?.kind==='worksite_command_execution_task');assert.equal(c2Tasks.length,2);
  assert.ok(c2Tasks[0].payload.value.sourceObservedInput);assert.ok(c2Tasks[1].payload.value.sourceNativeWork);
  assert.deepEqual(c2Tasks[1].payload.value.commands,c2Tasks[0].payload.value.commands);
  const assessment=results.find(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef);assert.ok(assessment);
  assert.equal(assessment.payload.value.task.assessment.producer.resultRef,commands[1].resultRef);
  assert.notEqual(assessment.payload.value.provenance.actorInvocationRef,sourceResult.payload.value.provenance.actorInvocationRef);
  assert.equal(state.observations.at(-1).value.disposition,'unmet');
  const {constructInstalledRunReadCall}=await support('registered-graph-selection'),projectReadContracts=await load(env.installedRoot,'abg/project_read_operation_contracts');
  const fresh=[];
  for(const memberKey of ['run_result','run_replay']){
    const resource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
    const read=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source:receipt.resources.run,eventResource:resource,identity:'source-context82-'+memberKey});
    const actual=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:'source-context82-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call:read.call,expectedExitCode:null,environment:process.env});
    await save(evidence,memberKey+'.json',actual);assert.deepEqual(actual.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);fresh.push(memberKey);
  }
  await save(evidence,'proof.json',{installedRoot:env.installedRoot,archive:frozenArtifact.artifactPath,prefix:handoff.prefix,
    parent:{eventId:parent.eventId,ordinal:parent.admissionOrdinal,resultRef:parent.payload.resultRef,resultDigest:parent.payload.resultDigest},
    observations:state.observations.map(o=>({purpose:o.purpose,resultRef:o.resultRef,resultDigest:o.resultDigest,cCallRef:o.cCallRef,actorInvocationRef:o.actorInvocationRef})),
    testingC2Refused:true,invalidTestingDispatched:false,planningByteCitations:planningStream.excerpts.map(e=>({startByte:e.startByte,endByte:e.endByte})),fresh,
    unmet:true,terminal:false,modelCredit:false});
  return {evidence,observations:state.observations.length,terminal:false,unmet:true};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const mode=process.argv[2];assert.equal(mode,'--prepare','82 activation is preparation-only; execute is separately released');
  console.log(JSON.stringify(await prepare()));
}
