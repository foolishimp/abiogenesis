// Bounded adaptation of t287-native-workspace-work.test.mjs's complete-assessment
// component fixture. Admission and role projection are supplied premises. No
// durable-prefix owner brand, event, install, runtime call or provider is created.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {join,dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {performance} from 'node:perf_hooks';
const start=performance.now(),here=import.meta.dirname;
const prior=resolve(here,'../pc05-assessor-triage-01');
const glc='/Users/jim/src/apps/odd_glc',tenant=glc+'/build_tenants/odd_glc/typescript';
const installed=glc+'/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-05';
const core=installed+'/products/core47/node_modules/@abiogenesis/typescript-tenant';
const load=name=>import(pathToFileURL(core+'/build/code/src/'+name+'.js'));
const read=async path=>JSON.parse(await fs.readFile(path,'utf8'));
const product=await load('product/index'),gtl=await load('gtl/index');
const {modulePublicationSemanticDigest}=await load('product/publication');
const {resolveNativeWorkspaceAssessmentSchema,parseNativeWorkspaceAssessmentResult}=await load('product/native_workspace_assessment');
const {ABI5_NATIVE_WORKSPACE_WORK_PRODUCT_SEMANTICS:semantics}=await load('product/builtin_semantics');
const {constructKnownWorkerTransportContract}=await load('abg/transport_contracts');
const {prepareWorkerTransport}=await load('abg/worker_transport');
const {constructProgramConstructionLibrary}=await import(pathToFileURL(tenant+'/src/program-construction.mjs'));
const {ids:glcIds}=await import(pathToFileURL(tenant+'/src/program-construction-contracts.mjs'));
const hash=product.sha256Canonical,bytes=value=>Buffer.byteLength(product.canonicalJson(value));
const task=await read(prior+'/selected-task.json'),basisEvent=await read(prior+'/selected-basis-event.json');
const events=await read(prior+'/selected-events.json'),summary=await read(prior+'/suffix-result.json');
assert.equal(hash(task),summary.taskDigest);assert.equal(bytes(task),713358);assert.deepEqual(task,basisEvent.event.payload.rawInputValue);
const prepared=await read(installed+'/prepared.json'),launch=await read(prepared.launchPath);
const publications=launch.invocation.resources.catalog.boundPublications;
const original=publications.find(p=>p.moduleRef===glcIds.moduleRef);assert(original);
const nativePub=publications.find(p=>p.graphFunctions.some(g=>g.name===product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef));
const ids=product.NATIVE_WORKSPACE_WORK_IDS,graphFunction=nativePub.graphFunctions.find(g=>g.name===ids.assessmentGraphFunctionRef);
const declaration=await read(installed+'/run-environment.json');
const selectedRole=declaration.roles.find(r=>r.role==='assessor');assert(selectedRole);
const memberCache=new Map(),sourceContent=[];
for(const binding of selectedRole.sourceBindings.filter((b,i,rows)=>rows.findIndex(r=>hash(r)===hash(b))===i)) {
  const context=declaration.contexts.find(c=>c.contextRef===binding.contextRef),member=context.members.find(m=>m.memberRef===binding.memberRef);
  let full=memberCache.get(member.digest);
  if(!full) {
    const matches=[];
    for(const dependency of launch.invocation.resources.runEnvironmentResources.dependencies) {
      try {const data=await fs.readFile(join(dependency.root,member.path));if(product.sha256Bytes(data)===member.digest)matches.push(data);}catch{}
    }
    assert.equal(matches.length,1,member.path);full=matches[0];memberCache.set(member.digest,full);
  }
  assert.equal(full.length,member.byteCount);assert.equal(product.sha256Bytes(full),binding.memberDigest);
  const span=full.subarray(binding.startByte,binding.endByte);assert.equal(product.sha256Bytes(span),binding.spanDigest);
  const text=new TextDecoder('utf8',{fatal:true,ignoreBOM:true}).decode(span);assert(Buffer.from(text).equals(span));
  sourceContent.push({...binding,path:member.path,sourceLocator:context.sourceLocator,text});
}
// Actual immutable role/source bytes, with the existing fixture's explicitly
// supplied admission/access-digest frontier. Omitted validation projection is
// null by the real owner contract; its 71-byte digest is only a component value.
const role={frameRefs:selectedRole.frameRefs,policy:selectedRole.policy,contextPolicy:selectedRole.contextPolicy,sourceContent,
  accessContent:selectedRole.accessRefs.map(accessRef=>{const a=declaration.accesses.find(a=>a.accessRef===accessRef);assert.equal(a.operation,'validate');
    return {accessRef,projectionDigest:hash('component admission frontier, not historical access proof'),operation:a.operation,
      claim:'structural_corpus_access_not_frame_application',disposition:'omitted_not_required',projection:null};})};
const artifact={productId:original.owningProductId,artifactDigest:original.artifactDigest,productContentDigest:original.productContentDigest,
  manifestDigest:original.productManifestDigest,productManifestDigest:original.productManifestDigest};
const sourceLibrary=constructProgramConstructionLibrary({gtl,product,artifact,includeNativeConstruction:true,evaluationGraph:publications.flatMap(p=>p.graphFunctions).find(g=>g.name===original.graphFunctions.find(g=>g.name===glcIds.evaluationChildGraphFunctionRef).template.nodes[0].term.graphFunctionRef),includeAssessment:true});
const sourceChild=sourceLibrary.graphFunctions.find(g=>g.name===glcIds.assessmentChildGraphFunctionRef);
const current=structuredClone(original),child=current.graphFunctions.find(g=>g.name===sourceChild.name);
assert.equal(child.declarations['abg.raw_result_contract'],undefined);
const {['abg.raw_result_contract']:selectedContract,...oldDeclarations}=sourceChild.declarations;
assert.deepEqual(child.declarations,oldDeclarations);assert.equal(selectedContract,task.assessment.resultContract.contractRef);
child.declarations={...sourceChild.declarations};
const installedRoot=installed+'/products/construction/node_modules/@odd-glc/route-one-typescript';
const manifest=await read(installedRoot+'/product-toolchain-manifest.json');
const schemaBytes=Buffer.from(task.assessment.schemaAsset.bytesBase64,'base64');
const schemaRow=manifest.publicContractCatalog.rows.find(r=>r.contractKind==='schema_asset'&&r.contractId===selectedContract);assert(schemaRow);
assert((await fs.readFile(join(installedRoot,schemaRow.assetLocator.path))).equals(schemaBytes));
const install={productId:current.owningProductId,installedRoot,publicContracts:manifest.publicContractCatalog.rows,
  artifactDigest:current.artifactDigest,productContentDigest:current.productContentDigest,manifestDigest:current.productManifestDigest,
  contributionManifest:{publicationBindings:[{moduleRef:current.moduleRef,publicationDigest:modulePublicationSemanticDigest(current)}]}};
const opened=events.find(e=>e.kind==='c_call_opened'&&e.aggregateId===summary.nativeCCallRef);
const call={...opened.payload,runId:opened.runId,regime:'F_P',implementationRef:ids.implementationRef,implementationBindingRef:ids.implementationBindingRef,
  inputContractRef:ids.taskContractRef,outputContractRef:ids.observationContractRef};
const execution=basisEvent.event.payload;
const owner={inputDigest:hash(task),inputValue:task,inputRef:execution.rawInputAdmissionRef,call,execution,
  program:current.programs.find(p=>p.programRef===execution.programRef),events:[],environment:{kind:'exact_prefix_workspace_environment',productInstalls:[install]}};
assert(owner.program.callableMembership.includes(child.name));
let ownerValue=owner,roleValue=role;
async function component(name,overrides) {
  const path=core+'/build/code/src/'+name+'.js';const module=new SourceTextModule(await fs.readFile(path,'utf8'),{identifier:path});
  await module.link(async specifier=>{const native=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(path),specifier)));
    const values={...native,...overrides[specifier]};return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});});
  await module.evaluate();return module.namespace;
}
const assemblyOwner=await component('abg/instruction_assembly',{
  './execution_basis.js':{authenticateNativeInstructionAssemblyBasis:()=>ownerValue,constructNativeInstructionAssemblyBasis:value=>value},
  './stdo_environment.js':{projectRunEnvironmentRoleEvidence:(...args)=>args.at(-1)==='assessor'?roleValue:false},
});
const basis={publication:current,graphFunction,executionBasis:execution,cCall:call,predecessorPrefix:launch.invocation.resources.eventResource.closeHandoff.prefix};
const construct=publication=>assemblyOwner.constructWorksiteNativeInstructionAssembly({...basis,publication},task);
assert.equal(construct(original),null,'actual missing declaration refuses');
const wrong=structuredClone(current);wrong.graphFunctions.find(g=>g.name===child.name).declarations['abg.raw_result_contract']=ids.workerReportContractRef;
assert.equal(construct(wrong),null,'wrong response declaration refuses');
const unreachable=structuredClone(original);unreachable.graphFunctions.push({...child,name:'graph-function://component/unreachable-assessor@5'});
assert.equal(construct(unreachable),null,'unreachable response declaration refuses');
const assembly=construct(current);assert(assembly,'corrected actual consumer declaration assembles exact task');
assert.equal(assembly.request.inputDigest,hash(task));assert.equal(assembly.request.resultContractRef,selectedContract);
assert.deepEqual(assembly.envelope.task,task);assert.equal(assembly.manifest.promptByteCount,Buffer.byteLength(assembly.request.prompt));
assert(assembly.request.prompt.includes(product.canonicalJson(role)));assert(task.instructions.every(i=>assembly.request.prompt.includes(i)));
const schema=resolveNativeWorkspaceAssessmentSchema(task.assessment,[current],[install]);assert(schema);assert.deepEqual(assembly.request.responseJsonSchema,schema);
ownerValue=null;assert.equal(construct(current),null,'absent native owner refuses');ownerValue=owner;
roleValue=false;assert.equal(construct(current),null,'absent assessor role refuses');roleValue=role;
const crossedTask=structuredClone(task);crossedTask.instructions.push('changed');assert.equal(assemblyOwner.constructWorksiteNativeInstructionAssembly(basis,crossedTask),null);
const badOwner={...current,owningProductId:'product://component/wrong-schema-owner'};
assert.equal(assemblyOwner.constructWorksiteNativeInstructionAssembly({...basis,assessmentPublication:badOwner},task),null,'crossed schema owner refuses');
const schemaSelection={...task.assessment,schemaAsset:{...task.assessment.schemaAsset,bytesBase64:Buffer.from('{}').toString('base64')}};
assert.equal(resolveNativeWorkspaceAssessmentSchema(schemaSelection,[current],[install]),null,'changed schema bytes refuse');
// The raw-result preimage owner uses these exact existing resolver/parser owners.
// No branded port/verification receipt is asserted from this supplied frontier.
const workerContracts=semantics.resolveProbabilisticWorkerContracts({inputContractRef:ids.taskContractRef,outputContractRef:ids.observationContractRef,input:task});
assert.equal(workerContracts.instructionContractRef,assembly.request.instructionContractRef);assert.equal(workerContracts.resultContractRef,selectedContract);
assert.equal(parseNativeWorkspaceAssessmentResult(schema,'{}'),null);
const schemaControl={kind:task.assessment.resultContract.valueKind,criteria:[{criterionRef:'component://schema-control',disposition:'indeterminate',rationale:'Schema check only; no assessment produced.',evidence:[]}],residuals:[]};
assert.deepEqual(parseNativeWorkspaceAssessmentResult(schema,JSON.stringify(schemaControl)),schemaControl);
const transport=await read(installed+'/execution/transport.json'),configuration=transport.configuration;
const {fullSandboxTransportEnvironment}=await import(pathToFileURL(tenant+'/test/full-sandbox-support.mjs'));
const environment=fullSandboxTransportEnvironment(transport,process.env);
const contract=constructKnownWorkerTransportContract('claude',{command:configuration.command,environment});
const plan=await prepareWorkerTransport({contract:{...contract,argsTemplate:[...contract.argsTemplate,'--tools','Read,Edit,Write,Glob,Grep,Bash']},
  prompt:assembly.request.prompt,lane:assembly.request.transportLane,cwd:task.workspaceAuthorityBasis.canonicalRoot,archiveRoot:here,label:'assessor-preflight',
  timeoutMs:configuration.inactivityMs,absoluteTimeoutMs:configuration.absoluteMs,terminationGraceMs:configuration.terminationGraceMs,
  responseJsonSchema:schema,responsePresentation:'result_text',environment});
assert.equal(plan.promptTransport,'stdin');assert(!plan.args.includes('--json-schema'));assert(!plan.args.includes(assembly.request.prompt));
assert.equal(plan.responseJsonSchemaDigest,hash(schema));assert.equal(plan.promptDigest,hash(assembly.request.prompt));
let actorPlan=null,providerCalls=0,historyCalls=0;
const actor=await component('abg/actor_process',{
  './instruction_assembly.js':assemblyOwner,
  './execution_basis.js':{constructNativeInstructionAssemblyBasis:value=>value,authenticateNativeInstructionAssemblyBasis:()=>ownerValue},
  './environment_admission.js':{hasAdmittedWorkspaceBinding:()=>true},
  './event_store.js':{readRuntimeEventsAtDurablePrefix:()=>{historyCalls++;return Object.freeze([]);},
    admitNonEmptyRuntimeEventTransactionAtDurablePrefix:()=>{throw Error('event mutation prohibited');}},
  './invocation_admission.js':{rehydrateInvocationAdmissionAtPrefix:()=>null},
  './worker_transport.js':{prepareWorkerTransport:async input=>{actorPlan=await prepareWorkerTransport(input);throw Error('stopped after real local transport preparation');},
    runPreparedWorkerTransport:()=>{providerCalls++;throw Error('provider prohibited');}},
});
const occurrence={...Object.fromEntries(['cCallRef','runId','graphCallId','frameId','programLocusRef','taskOrdinal','attempt'].map(k=>[k,call[k]])),nativeInstructionAssemblyBasis:basis};
const preparedActor=actor.prepareActorProcessInvocation(task,occurrence);
assert.deepEqual(preparedActor.prepareInstructionAssembly(),assembly);
const envKeys=['NODE_OPTIONS','ABG_TS_CLAUDE_COMMAND','ABG_TS_CLAUDE_APPEND_ARGS','CLAUDE_CODE_EFFORT_LEVEL','ABG_TS_FP_TIMEOUT_MS','ABG_TS_FP_ABSOLUTE_TIMEOUT_MS','ABG_TS_FP_TERMINATION_GRACE_MS'];
const beforeEnvironment=Object.fromEntries(envKeys.map(k=>[k,process.env[k]]));
try {
  for(const key of envKeys)process.env[key]=environment[key];
  const stop=await preparedActor.invokeActorProcess({store:null,predecessorPrefix:basis.predecessorPrefix,
    executionBasis:execution,scope:{},cCall:call,expectedInputDigest:hash(task),occurrence,workerContracts,
    runtime:{workspaceBinding:task.workspaceBinding,artifactTruth:{}},request:assembly.request,dispatchOrdinal:1,basis:{}});
  assert.equal(stop.message,'stopped after real local transport preparation');assert(actorPlan);
  assert.deepEqual(actorPlan.args,plan.args);assert.equal(actorPlan.promptDigest,plan.promptDigest);
  assert.equal(actorPlan.responseJsonSchemaDigest,plan.responseJsonSchemaDigest);
  assert.equal(actorPlan.timeoutMs,configuration.inactivityMs);assert.equal(actorPlan.absoluteTimeoutMs,configuration.absoluteMs);
} finally {for(const key of envKeys)if(beforeEnvironment[key]===undefined)delete process.env[key];else process.env[key]=beforeEnvironment[key];}
assert.equal(providerCalls,0);assert.equal(historyCalls,1,'one supplied empty-prefix component premise, no physical history read');

assert.equal(hash(task),summary.taskDigest);assert.equal(bytes(task),713358);
const report={status:'component_preflight_passed_not_installed_authentication',elapsedMs:performance.now()-start,
  fixture:'t287-native-workspace-work.test.mjs: complete assessment preparation joins assessor context, declared schema and exact native owner without dispatch',
  task:{digest:hash(task),bytes:bytes(task),unchanged:true,contextBytes:bytes(task.context),contextMaxFiles:task.context.maxFiles,contextMaxBytes:task.context.maxBytes},
  declaration:{graphFunctionRef:child.name,contractRef:selectedContract,sourceChildDigest:hash(sourceChild),originalPublicationDigest:hash(original),componentCorrectedPublicationDigest:hash(current)},
  controls:{missing:true,wrong:true,unreachable:true,corrected:true,absentOwner:true,absentRole:true,crossedTask:true,crossedSchemaOwner:true,changedSchema:true,
    rawContractSelectionMatches:true,actorToTransportPreparationPassed:true,malformedRawAssessmentRefused:true,schemaOnlyIndeterminateControlAccepted:true},
  bytes:{declaredRole:bytes(role),sourceText:sourceContent.reduce((n,s)=>n+Buffer.byteLength(s.text),0),prompt:Buffer.byteLength(assembly.request.prompt),
    responseSchema:bytes(schema),request:bytes(assembly.request),assembly:bytes(assembly),transportArgv:plan.args.reduce((n,s)=>n+Buffer.byteLength(s)+1,0)},
  transport:{configuration,effortEnvironment:environment.CLAUDE_CODE_EFFORT_LEVEL,promptTransport:plan.promptTransport,responsePresentation:'result_text',args:plan.args,responseJsonSchemaDigest:plan.responseJsonSchemaDigest,
    localPreparationPassed:true,providerInvoked:false,archiveWritten:false},
  frontier:'Native basis authentication and role evidence are supplied component premises, as in the existing fixture. Exact role source spans are independently hash-verified from retained resource roots; omitted validation projection uses a labeled component digest of the same fixed byte width. No durable owner brand, installed successor identity or raw-result verification capability was created. Actual admission/role projection and raw-result port verification remain installed responsibilities.',
  bounds:'Existing native-work assembly and transport preparation impose no numerical prompt-byte/token ceiling. Exact request passed their guards, uses stdin, and does not put prompt/schema in argv. Task context retains its existing declared file/byte limits. Provider model acceptance is not proved by this no-provider check.'};
await fs.writeFile(join(here,'preflight-result.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
