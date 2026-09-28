import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,mkdtemp,readdir,copyFile,cp,rm} from 'node:fs/promises';
import {join,basename,resolve,dirname} from 'node:path';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import * as eventOwner from '../../build/code/src/abg/event_store.js';
import {selectValidatedRuntimeEventPrefix} from '../../build/code/src/abg/event_prefix.js';
import {loadWorksiteOwner,worksiteFixture} from '../support/t287-generic-job-worksite.mjs';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as product from '../../build/code/src/product/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import {observedGovernanceTaskMatches} from '../../build/code/src/abg/default_library.js';
import {projectObservedWorksiteCommandChildAtPrefix} from '../../build/code/src/abg/worksite_input_provenance.js';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {libraryConsumerDeclaration,libraryEnvironment,witnessInput,witnessRef,assessmentSchema,schemaPath} from '../support/default-library.mjs';
const packageRoot=new URL('../..',import.meta.url).pathname;
const governanceRoot=new URL('../../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/',import.meta.url).pathname;
const witnessRoot=join(governanceRoot,'default-library-witness');
const basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:'5.0.0-rc.1',artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'];
function validation(publication,program,publications){
  const raw=(v,k)=>{const r=validator.rawAdmitValue(v,k,'contract:fixture');assert.equal(r.kind,'raw_admitted_value',JSON.stringify(r));return r;};
  const p=raw(publication,'module_publication'),unique=(key,values)=>[...new Map(values.map(v=>[v[key],v])).values()];
  return validator.validateProgram({declarationBasisDigest:p.subjectDigest,programPublication:p,program:raw(program,'gtl_program'),
    graphFunctions:unique('name',publications.flatMap(p=>p.graphFunctions)).map(v=>raw(v,'graph_function')),
    contracts:unique('contractRef',publications.flatMap(p=>p.contracts)).map(v=>raw(v,'contract_declaration')),
    evaluators:unique('name',publications.flatMap(p=>p.evaluators)),rules:unique('name',publications.flatMap(p=>p.rules)),
    implementationBindings:unique('bindingRef',publications.flatMap(p=>p.implementationBindings)).map(v=>raw(v,'implementation_binding')),
    closureContracts:unique('closureContractRef',publications.flatMap(p=>p.closureContracts)).map(v=>raw(v,'closure_contract'))});
}
test('default catalogue publishes conditional purposes over fixed native/C2 children and mandatory parent evaluation',()=>{
  const pubs=constructors.map(n=>gtl[n](basis)),library=pubs[0];
  assert.deepEqual(library.runEnvironments[0].roles.find(r=>r.role==='selector').contextPolicy.selectors,['full_source','active_binding_semantics']);
  const contractRefs=pubs.flatMap(p=>p.contracts.map(c=>c.contractRef));assert.equal(new Set(contractRefs).size,contractRefs.length,'shared contracts retain one publication owner');
  assert.equal(library.contributions.length,7);assert.equal(library.graphFunctions.length,8);
  const result=validation(library,library.programs[0],pubs);assert.equal(result.kind,'program_validation',JSON.stringify(result));
  assert.equal(result.executableLeafRows.filter(r=>r.fibre==='F_P').length,4);
  const app=library.graphFunctions.find(g=>g.name===product.governanceRef("graph-function","executive")).template.applications[0];assert.equal(app.foldback.requiresParentEvaluation,true);assert.equal(app.bound,12);
  assert.equal(library.programs[0].constructionComposition,undefined);
  const selected=gtl.defaultGovernanceGraphFunctions({purposes:['testing']});assert.equal(selected.length,3);assert.equal(selected[1].template.nodes.filter(n=>n.term.kind==='c_workflow').length,1);
  assert.equal(selected[2].template.nodes[1].term.graphFunctionRef,product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef);
  assert.throws(()=>gtl.defaultGovernanceGraphFunctions({purposes:[]}));assert.equal(observedGovernanceTaskMatches({kind:'governance_work_state'},{}),false);
  assert.equal(projectObservedWorksiteCommandChildAtPrefix(null,{parentBasis:{},parentCCallRef:'missing',runId:'missing',task:{}}),null);
});
test('independent consumer restricts choices while preserving actual native role and schema owners',async()=>{
  const pubs=constructors.map(n=>gtl[n](basis)),selected=await libraryEnvironment({gtl,product});
  const data=libraryConsumerDeclaration(gtl,pubs[0],selected.declaration);
  const consumer=gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...data,artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,productManifestDigest:basis.productManifestDigest,
    contributions:data.contributions.map(c=>({...c,provenanceRefs:[basis.artifactDigest]}))});
  assert.deepEqual(consumer.contracts.map(c=>c.contractRef),[witnessRef('contract','assessment')]);
  const result=validation(consumer,consumer.programs[0],[...pubs,consumer]);assert.equal(result.kind,'program_validation',JSON.stringify(result));
  assert.equal(result.executableLeafRows.filter(r=>r.fibre==='F_P').length,4);
  assert.ok(!consumer.programs[0].callableMembership.includes(product.governanceRef('graph-function','induction')));
});
test('retention and execution share root, imported and exact external semantics owner selection',async()=>{
  const {graphFunctionSemanticsOwner:select}=await import('../../build/code/src/product/execution_resolution.js');
  const pubs=constructors.map(n=>gtl[n](basis)),library=pubs[0],graph=library.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','testing'));
  const coordinate=(publication,declarationKind,declarationRef)=>({declarationKind,declarationRef,productId:publication.owningProductId,installId:'install:'+publication.moduleRef,moduleRef:publication.moduleRef,publicationDigest:product.modulePublicationSemanticDigest(publication)});
  const libraryOwner=coordinate(library,'graph_function',graph.name),root={...libraryOwner,moduleRef:'module:consumer',declarationKind:'semantics',declarationRef:'semantics:consumer'};
  const closure={selectedGraphFunctionRef:'graph:root',semanticsOwner:root,publications:[library],graphFunctionOwners:[libraryOwner],contractOwners:[],evaluatorOwners:[],ruleOwners:[],implementationBindingOwners:[],closureContractOwners:[]};
  // Exact publication/install binding is the supplied owner premise. Production
  // callers retain their existing ingress/bound-owner checks around this projection.
  const lookup=owner=>owner.moduleRef===library.moduleRef?{publication:library,install:{packageName:basis.packageName,packageVersion:basis.packageVersion}}:null;
  const selected=select(closure,graph.name,lookup);assert.equal(selected.moduleRef,library.moduleRef);assert.equal(selected.declarationRef,library.productSemanticsBinding.bindingRef);assert.notEqual(selected.moduleRef,root.moduleRef);
  assert.equal(select(closure,'graph:root',()=>null),root);assert.equal(select(closure,graph.name,()=>null),null);
  assert.equal(select({...closure,graphFunctionOwners:[libraryOwner,libraryOwner]},graph.name,lookup),null);
  const external={...library,moduleRef:'module:external-consumer',productSemanticsBinding:library.productSemanticsBinding},externalOwner=coordinate(external,'graph_function','graph:external');
  const imported={...closure,publications:[external,library],graphFunctionOwners:[externalOwner],contractOwners:[coordinate(library,'contract',product.governanceContract('state'))]};
  const externalLookup=owner=>owner.moduleRef===external.moduleRef?{publication:external,install:{packageName:'@consumer/own',packageVersion:'1'}}:lookup(owner);
  assert.equal(select(imported,'graph:external',externalLookup).moduleRef,library.moduleRef);
  assert.equal(select({...imported,publications:[external],contractOwners:[]},'graph:external',externalLookup),null);
  const rival={...library,moduleRef:'module:rival'},rivalOwner=coordinate(rival,'contract','contract:rival');
  assert.equal(select({...imported,publications:[external,library,rival],contractOwners:[...imported.contractOwners,rivalOwner]},'graph:external',owner=>owner.moduleRef===rival.moduleRef?{publication:rival,install:{packageName:basis.packageName,packageVersion:basis.packageVersion}}:externalLookup(owner)),null);
});
test('declared wrapper judgments advance actual observations, including red C2, without satisfying parent state',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),semantics=product.ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS;
  const native=await import('../../build/code/src/product/native_workspace_work.js'),c2=await import('../../build/code/src/product/worksite_command_execution.js');
  await writeFile(join(f.canonicalRoot,'source.txt'),'supplied source\n');
  const subject=physical.constructWorksiteSubject({...f,relativePath:'source.txt',subjectUri:pathToFileURL(join(f.canonicalRoot,'source.txt')).href}),observation=await physical.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject);
  const context=await physical.observeWorksiteContext({...f,readRoots:['source.txt'],maxFiles:2,maxBytes:1000});
  const task=product.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,capabilityGrant:f.capabilityGrant,context,outcome:'Bounded check',instructions:['Read supplied source.'],readFirst:['source.txt'],writeRoots:[],checks:[]});
  const provenance={cCallRef:'call:component',executionAuthorityRef:'authority:component',executionAuthorityDigest:product.sha256Canonical('authority'),actorInvocationRef:'actor:component',transportBindingRef:'transport:component',transportBindingDigest:product.sha256Canonical('binding'),promptDigest:product.sha256Canonical('prompt'),transportDigest:product.sha256Canonical('transport')};
  const value=native.constructNativeWorkspaceWorkObservation(task,context,{summary:'Observed',gaps:[]},provenance);
  for(const wrapper of library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']&&g.declarations['abg.default_library_purpose']!=='testing')){
    assert.equal(wrapper.declarations['abg.judgment_predicate'],product.NATIVE_WORKSPACE_WORK_IDS.judgmentPredicateRef);
    const relation=semantics.resolveJudgmentRelation(wrapper.declarations['abg.judgment_predicate']);assert.equal(relation.evaluate(task,value),true);assert.equal(relation.evaluate({...task,outcome:'changed'},value),false);
    assert.equal(wrapper.template.nodes.at(-1).term.judgmentPredicateRef,product.governanceRef('predicate','fold'));
  }
  const commandTask=product.constructObservedWorksiteCommandExecutionTask({...f,observedFiles:[{subject,observation}],commands:[{commandId:'command:component',executable:'node',args:['--version'],relativeCwd:'.',environment:{},timeoutMs:1000,terminationGraceMs:100,expectedReports:[]}],outcomePredicates:[],allowedWriteTerritories:[{pathKind:'subtree',relativePath:'verification'}]});
  const plan=c2.worksiteCommandExecutionHelperPlan(commandTask,'attempt:component'),{kind:_,schemaVersion:__,expectedReports:___,...command}=commandTask.commands[0];
  const empty={kind:'worksite_observed_stream',schemaVersion:'5.0.0',encoding:'base64',payload:'',byteLength:0,digest:product.sha256Bytes(Buffer.alloc(0))};
  const body={...command,exitStatus:7,timedOut:false,processSignal:null,signalSequence:[],terminationConfirmed:true,stdout:empty,stderr:empty,reports:[],reportCount:0},digest=product.sha256Canonical(body);
  const commandResult={kind:'worksite_command_result',schemaVersion:'5.0.0',...body,observationRef:'worksite-command-observation://abiogenesis/'+digest.slice(7),observationDigest:digest};
  const members=commandTask.protectedObservations.map(row=>({kind:'worksite_snapshot_member',schemaVersion:'5.0.0',ordinal:row.ordinal,sourceMemberRef:row.sourceMemberRef,sourceObservationRef:row.observation.observationRef,sourceObservationDigest:row.observation.observationDigest,relativePath:row.subject.relativePath,byteLength:row.observation.byteLength,digest:row.observation.fileDigest})),snapshotDigest=product.sha256Canonical(members);
  const artifact=c2.constructWorksiteExecutionHelperArtifact({task:commandTask,disposition:'success',commandResults:[commandResult],predicateObservations:[],worksiteDelta:[],productDelta:[],snapshotRoot:plan.sandboxRoot,snapshotRef:'worksite-command-snapshot://abiogenesis/'+snapshotDigest.slice(7),snapshotDigest,snapshotMembers:members,protectedBefore:[observation],protectedAfter:[observation]});
  const acknowledgment={kind:'worksite_command_execution_worker_result',schemaVersion:'5.0.0',taskRef:commandTask.taskRef,taskDigest:commandTask.taskDigest,attemptRef:plan.attemptRef,helperArtifactRef:artifact.artifactRef,helperArtifactDigest:artifact.artifactDigest};
  const actor={actorRef:commandTask.workerActorRef,workerBindingRef:commandTask.workerBindingRef,implementationRef:product.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,inputDigest:product.sha256Canonical(commandTask),transportLane:'worker_executes',disposition:'success',toolCallCount:1,toolInvocations:[{kind:'worker_tool_invocation_evidence',schemaVersion:'5.0.0',ordinal:0,toolName:'Bash',toolUseRef:'tool:component',inputDigest:plan.toolInputDigest,inputByteLength:plan.toolInputByteLength}],processRef:'process:component',...provenance};
  const observed=c2.constructWorksiteExecutionObservation(commandTask,acknowledgment,actor,artifact,plan),wrapper=library.graphFunctions.find(g=>g.declarations['abg.default_library_purpose']==='testing');
  assert.equal(wrapper.declarations['abg.judgment_predicate'],product.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef);
  assert.equal(semantics.resolveJudgmentRelation(wrapper.declarations['abg.judgment_predicate']).evaluate(commandTask,observed),true);assert.equal(observed.commandResults[0].exitStatus,7);
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  assert.equal(product.governanceVerdict(state),false);assert.equal(semantics.resolveJudgmentRelation(product.governanceRef('predicate','fold')).evaluate(commandTask,observed),false,'observation and state fold remain different contracts');
});

test('default role content is the selected STDO source with capability instructions separate',async()=>{
  const {DEFAULT_LIBRARY_STDO_SOURCE:source}=await import('../../build/code/src/gtl/default_library.js');
  const original=await readFile(join('/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.1',source.path));
  const packaged=await readFile(join(packageRoot,source.assetPath));assert.deepEqual(packaged,original);assert.equal(product.sha256Bytes(packaged),source.digest);
  const environment=gtl.defaultLibraryRunEnvironment();
  for(const role of environment.roles){assert.ok(role.frameRefs.every(ref=>ref.startsWith(source.basisRef+source.path+'#')));
    assert.equal(role.policy.text,product.DEFAULT_LIBRARY_POLICY);
    for(const span of role.sourceBindings){const bytes=packaged.subarray(span.startByte,span.endByte);assert.equal(product.sha256Bytes(bytes),span.spanDigest);assert.ok(bytes.toString().startsWith('## Derived '));assert.notEqual(bytes.toString(),role.policy.text);}}
});
test('selector assembly and raw-result correspondence consume imported owner contracts and refuse missing owners',async()=>{
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),graph=library.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','executive-step'));
  const node=graph.template.nodes.find(n=>n.term.programLocusRef===product.governanceRef('node','select')),role=library.runEnvironments[0].roles.find(r=>r.role==='selector');
  const supplied={kind:'registered_selection_task',schemaVersion:'5.0.0',workerActorRef:'actor:unit',workerBindingRef:'worker:unit',task:'Choose declared work.',observations:[],requiredSupportRefs:['support:unit'],childInput:{contractRef:product.governanceContract('state'),value:{kind:'governance_work_state'}},maxPromptBytes:65536};
  const targets=library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']);
  const events=[],call={regime:'F_P',cCallRef:'call:unit',cCallDigest:product.sha256Canonical('call'),graphFunctionRef:graph.name,programLocusRef:node.nodeRef,inputContractRef:node.term.inputCarrierRef,outputContractRef:node.term.outputCarrierRef,implementationRef:product.governanceRef('implementation','select')};
  const execution={programRef:library.programs[0].programRef,basisRef:'basis:unit',basisDigest:product.sha256Canonical('basis'),invocationAdmissionRef:'invocation:unit',registeredSelectionDefinitionDigests:Object.fromEntries(targets.map(g=>[g.name,product.sha256Canonical(g)]))};
  const inputDigest=product.sha256Canonical(supplied),owner={events,call,execution,graph:{template:graph.template},inputDigest,inputRef:'input:unit',program:library.programs[0]};
  const candidate={publication:{...library,contracts:[]},graphFunction:graph,declarationGraphFunctions:library.graphFunctions,executionBasis:execution,cCall:call,cursor:{currentNodeRef:node.nodeRef,termPath:gtl.rootCSourcePath(node.nodeRef)},predecessorPrefix:{}};
  // Controlled already-admitted basis/role/transport premises isolate this
  // projection boundary; the installed witness supplies their real owners.
  const file=resolve(packageRoot,'build/code/src/abg/instruction_assembly.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateNativeInstructionAssemblyBasis:()=>owner}:specifier==='./event_store.js'?{reidentifyHistoricalDurablePrefixCoordinate:()=>candidate.predecessorPrefix}:specifier==='./stdo_environment.js'?{projectRunEnvironmentRoleEvidence:()=>({...role,invocationAdmissionRef:'invocation:unit',environmentRef:'environment:unit',environmentDigest:product.sha256Canonical('environment'),evidenceDigest:product.sha256Canonical('evidence'),contextPolicyDigest:product.sha256Canonical(role.contextPolicy),sourceContent:[],accessContent:[]})}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const lookup=ref=>library.contracts.find(c=>c.contractRef===ref)??null;
  const assembly=m.namespace.evaluateRegisteredSelectionInstructionAssembly(candidate,supplied,lookup);assert.equal(assembly.kind,'native_instruction_assembly',JSON.stringify(assembly));
  assert.equal(m.namespace.evaluateRegisteredSelectionInstructionAssembly(candidate,supplied).cause,'unknown_dependency');
  for(const missing of [call.inputContractRef,call.outputContractRef,graph.declarations['abg.raw_result_contract'],supplied.childInput.contractRef])
    assert.equal(m.namespace.evaluateRegisteredSelectionInstructionAssembly({...candidate,publication:library},supplied,ref=>ref===missing?null:lookup(ref)).cause,'unknown_dependency','selected owner null cannot use available local copy');
  const raw={disposition:'selected',graphFunctionRef:targets[0].name,reason:'unit correspondence',evidenceRefs:[]};
  const choice=product.materializeNativeRegisteredChoice(supplied,assembly.envelope.targetBindings,raw);
  events.push({kind:'actor_result_artifact_observed',parentAggregateId:call.cCallRef,eventId:'event:observation',payload:{transportBindingRef:'transport:unit',actorInvocationRef:'actor-invocation:unit',disposition:'success',toolCallCount:0,finalOutput:JSON.stringify(raw),promptDigest:assembly.manifest.promptDigest}},
    {kind:'actor_transport_binding_admitted',aggregateId:'transport:unit',payload:{instructionAssembly:assembly}},
    {kind:'actor_invocation_closed',aggregateId:'actor-invocation:unit',payload:{consumedArtifactEventRef:'event:observation'}});
  assert.equal(m.namespace.registeredSelectionInstructionResultMatches(candidate,supplied,choice,lookup),true);
  assert.equal(m.namespace.registeredSelectionInstructionResultMatches(candidate,supplied,choice,()=>null),false);
  assert.equal(m.namespace.registeredSelectionInstructionResultMatches(candidate,supplied,{...choice,reason:'rewritten'},lookup),false);
});

test('parent conservation joins the pre-Run root basis through exact invocation and root implementation set',async()=>{
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  const invocation={invocationRef:'invocation:root',invocationAdmissionRef:'invocation-admission:root',capabilityGrants:[{}]},root={kind:'basis_admitted',runId:null,payload:{basisClass:'root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:'set:root',rawInputValue:state}},roots=[root];
  const owned={inputValue:state,call:{runId:'run:later-created',implementationRef:product.governanceRef('implementation','evaluate-parent')},execution:{invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:root'},environment:{kind:'exact_prefix_workspace_environment'},prefix:{}};
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:(_p,key)=>key==='invocation:'+invocation.invocationRef?roots:[]}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  assert.deepEqual(m.namespace.projectGovernanceParent({},state),state,'root basis has no Run coordinate yet');
  root.payload.implementationSetRef='set:foreign';assert.equal(m.namespace.projectGovernanceParent({},state),null);root.payload.implementationSetRef='set:root';
  root.payload.invocationAdmissionRef='invocation-admission:foreign';assert.equal(m.namespace.projectGovernanceParent({},state),null);root.payload.invocationAdmissionRef=invocation.invocationAdmissionRef;
  roots.push(root);assert.equal(m.namespace.projectGovernanceParent({},state),null);
});

test('consumer-authored source and scope remain exact application data; no solution is in library',async()=>{
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),input=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  assert.ok(product.isGovernanceWorkState(input));assert.equal(input.terminal,false);assert.deepEqual(input.unresolvedSupportRefs,input.original.requiredSupportRefs);
  assert.deepEqual(input.observations,[]);assert.ok(!input.original.task.includes(selection.prospectiveCounterexample.expectedObservedMismatch));
  const library=await readFile(new URL('../../code/src/product/default_library.ts',import.meta.url),'utf8');assert.ok(!library.includes('Hello'));
  const bad=structuredClone(input);bad.original.sources[0].digest='wrong';assert.equal(product.isGovernanceWorkState(bad),false);
  bad.original.sources=input.original.sources;bad.unresolvedSupportRefs=[];assert.equal(product.isGovernanceWorkState(bad),false);
});

test('observed child provenance joins the current preparation and rejects crossed or missing causal facts',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const observedFiles=[];
  for(const relativePath of state.original.testing.selectedPaths){const subject=physical.constructWorksiteSubject({...f,relativePath,subjectUri:pathToFileURL(join(f.canonicalRoot,relativePath)).href});
    observedFiles.push({subject,observation:await physical.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject)});}
  const task=product.constructObservedWorksiteCommandExecutionTask({...f,observedFiles,...product.governanceTestingConfiguration(state)});
  assert.equal(observedGovernanceTaskMatches(state,task),true);
  const parent={basisRef:'basis:testing',graphFunctionRef:product.governanceRef('graph-function','testing'),invocationAdmissionRef:'invocation:testing',
    rawInputValue:state,rawInputAdmissionRef:'raw:testing',rawInputDigest:product.sha256Canonical(state),workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest};
  const rows=[];let currentnessArgs=null;
  const scope={scopeClass:'run',runId:'run:testing',basisId:parent.basisRef,graphCallId:'call:testing',frameId:'frame:testing',graphFunctionRef:parent.graphFunctionRef};
  const append=(kind,payload,aggregateId,causes=[],extra={})=>{const event={kind,payload,eventTime:'2026-09-29T00:00:00.000Z',aggregateType:'c_call',aggregateId,parentAggregateId:null,causationEventRefs:causes,correlationId:'correlation:testing',workflowVersion:'5.0.0',...scope,...extra,eventId:'event:'+rows.length,admissionOrdinal:rows.length};rows.push(event);return event;};
  // Controlled admitted-event/index, invocation and currentness premises.
  // This is source-owner correspondence proof, not installed execution. The
  // unchanged currentness owner has separate real-file/refusal checks below.
  const file=resolve(packageRoot,'build/code/src/abg/worksite_input_provenance.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:(_p,r)=>r===parent.invocationAdmissionRef?{capabilityGrants:[f.capabilityGrant]}:null}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:(_p,key)=>rows.filter(e=>key==='basis:'+e.basisId)}:specifier==='./native_worksite_execution.js'?{worksiteCommandSourcesInvalidatedAfter:(...args)=>{currentnessArgs=args;return false;}}:{};const values={...actual,...replacements};
    return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const check=(patch={})=>m.namespace.projectObservedWorksiteCommandChildAtPrefix({rows},{parentBasis:parent,parentCCallRef:'call:c2',runId:scope.runId,task,...patch});
  assert.equal(check(),null);
  append('c_call_result_admitted',{resultRef:'result:old',resultDigest:product.sha256Canonical(task),resultClass:'success',value:task},'call:old',[],{runId:'run:old',basisId:'basis:old'});
  const entered=append('traversal_cursor_entered',{cursorRef:'cursor:prepare',cursorDigest:product.sha256Canonical('prepare'),inputRef:parent.rawInputAdmissionRef,inputDigest:parent.rawInputDigest},'frame:testing');
  const opened=append('c_call_opened',{cursorRef:'cursor:prepare',cursorDigest:product.sha256Canonical('prepare'),callClass:'leaf'},'call:prepare',[entered.eventId]);
  const fibre=append('c_call_fibre_selected',{regime:'F_D',implementationRef:product.governanceRef('implementation','prepare-testing'),implementationBindingRef:product.governanceRef('binding','prepare-testing')},'call:prepare',[opened.eventId]);
  const result=append('c_call_result_admitted',{resultRef:'result:prepare',resultDigest:product.sha256Canonical(task),resultClass:'success',contractRef:product.WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,value:task,valueDigest:product.sha256Canonical(task)},'call:prepare',[fibre.eventId]);
  const judgment=append('c_call_judged',{resultRef:'result:prepare',resultDigest:product.sha256Canonical(task),judgment:'advance',judgmentRef:'judgment:prepare'},'call:prepare',[result.eventId]);
  const route=append('traversal_route_admitted',{routeKind:'advance',cCallRef:'call:prepare',judgmentRef:'judgment:prepare',targetCursorRef:'cursor:c2',targetCursorDigest:product.sha256Canonical('c2')},'frame:testing',[judgment.eventId]);
  append('c_call_opened',{callClass:'workflow',childGraphFunctionRef:product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,cursorRef:'cursor:c2',cursorDigest:product.sha256Canonical('c2')},'call:c2',[route.eventId]);
  assert.ok(check());assert.equal(check().preparationResult.eventId,result.eventId);assert.equal(check().acquisitionEvent.eventId,fibre.eventId);assert.equal(currentnessArgs[1],fibre.admissionOrdinal);assert.deepEqual(currentnessArgs[3],state.original.testing.selectedPaths);
  assert.equal(check({runId:'run:old'}),null);assert.equal(check({parentCCallRef:'call:other'}),null);
  assert.equal(check({task:{...task,sourceNativeWork:{}}}),null);
  const crossed=structuredClone(state);crossed.original.testing.commands[0].args=['--version'];assert.equal(observedGovernanceTaskMatches(crossed,task),false);
  const original=parent.rawInputDigest;parent.rawInputDigest=product.sha256Canonical('crossed');assert.equal(check(),null);parent.rawInputDigest=original;
  append('c_call_judged',{resultRef:'result:prepare',resultDigest:product.sha256Canonical(task),judgment:'advance',judgmentRef:'judgment:duplicate'},'call:prepare',[result.eventId]);assert.equal(check(),null,'ambiguous applicable provenance refuses');
});

test('one installed Public default-library invocation reuses observed files, corrects actual work and independently closes',{skip:process.env.ABI5_DEFAULT_LIBRARY_LIVE!=='1'},async()=>{
  const evidence=process.env.ABI5_DEFAULT_LIBRARY_EVIDENCE_ROOT??await mkdtemp(join(tmpdir(),'abi5-default-library-'));
  await mkdir(evidence,{recursive:true});const save=(n,v)=>writeFile(join(evidence,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
  const selectionPath=join(witnessRoot,'selection.json'),selection=JSON.parse(await readFile(selectionPath,'utf8'));
  assert.equal(await product.sha256File(selectionPath),'sha256:ca439cb9aa144477a6aa1d5956d51a5a2c29c084283e2b028a5b94af74c55dbc');
  const provider=JSON.parse(await readFile(process.env.ABI5_NATIVE_SELECTION_PROVIDER,'utf8'));
  assert.equal(provider.requestedModel,'claude-opus-5-5');assert.equal(provider.requestedEffort,'xhigh');assert.equal(await product.sha256File(provider.executable),provider.sha256);
  await save('provider.json',provider);await save('selection.json',selection);
  const accounting={wallMs:{}};let selectedEnvironment;
  const env=await setupInstalledRootCatalog({after:()=>{}},packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,setupAccounting:accounting,
    additionalCorePublicationConstructors:constructors,
    prepareAdditionalProducts:async setup=>{
      selectedEnvironment=await libraryEnvironment(setup);
      const archive=join(setup.scratch,'artifacts',(await readdir(join(setup.scratch,'artifacts'))).find(n=>n.endsWith('.tgz')));
      const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(assessmentSchema)+'\n');
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:archive,declarationFactory:g=>libraryConsumerDeclaration(g,library,selectedEnvironment.declaration),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('../fixtures/default-library-product/index.mjs',import.meta.url)}],
        schemaAssets:[{path:schemaPath,source:schema,contractId:witnessRef('schema','assessment'),requirementAuthorityRefs:[witnessRef('support','complete-source-outcome')]}]})];
    }});
  await save('setup.json',{scratch:env.scratch,installedRoots:env.installedRoots,artifactPaths:env.artifactPaths,accounting});
  await save('archive.json',{core:{path:env.artifactPath,sha256:await product.sha256File(env.artifactPath)},consumer:env.additionalProducts[0].basis});
  await copyFile(env.artifactPath,join(evidence,'core.tgz'));await copyFile(env.additionalProducts[0].artifactPath,join(evidence,'consumer.tgz'));
  await save('run-environment.json',selectedEnvironment.declaration);await save('publication.json',env.additionalPublications[0]);
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  const copyStarted=performance.now();await cp(join(witnessRoot,'seed'),worksite,{recursive:true});
  for(const [path,row] of Object.entries(selection.seedFiles))assert.equal(await product.sha256File(join(worksite,path)),'sha256:'+row.sha256);
  await save('seed-copy.json',{wallMs:performance.now()-copyStarted,bytes:Object.values(selection.seedFiles).reduce((n,r)=>n+r.bytes,0),files:selection.seedFiles});
  const input=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});await save('input.json',input);
  const refs=env.additionalPublications[0].programs[0].callableMembership;
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,refs);assert.equal(env.catalogView.kind,'graph_function_catalog_view',JSON.stringify(env.catalogView));
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),readContracts=await load('abg/project_read_operation_contracts'),storeOwner=await load('abg/event_store');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'default-library',runEnvironmentResourceFactory:selectedEnvironment.resources});
  const closure=env.product.resolveProgramDeclarationClosure(env.catalog,env.catalogView,start.resolution.program.programRef);
  assert.equal(closure.kind,'resolved_program_declaration_closure',JSON.stringify(closure));
  const selectedRefs=['state','selection-task','choice','native-response'].map(product.governanceContract);
  for(const ref of selectedRefs){const owners=closure.contractOwners.filter(o=>o.declarationRef===ref);assert.equal(owners.length,1);assert.equal(owners[0].moduleRef,product.governanceRef('module','default'));}
  // Unadmitted duplicate-owner probe; never install or dispatch this mutation.
  const duplicate=structuredClone(env.catalog),consumer=duplicate.boundPublications.find(p=>p.moduleRef===witnessRef('module','witness'));
  consumer.contracts.push(structuredClone(duplicate.boundPublications.find(p=>p.moduleRef===product.governanceRef('module','default')).contracts.find(c=>c.contractRef===product.governanceContract('state'))));
  const changedDigest=env.product.modulePublicationSemanticDigest(consumer);
  for(const entry of duplicate.entries.filter(e=>e.owningProductId===consumer.owningProductId)){entry.publicationDigest=changedDigest;const {entryDigest,...body}=entry;entry.entryDigest=product.sha256Canonical(body);}
  duplicate.byHandle=Object.fromEntries(duplicate.entries.map(e=>[e.handle,e]));
  const duplicateView=env.product.narrowGraphFunctionCatalog(duplicate,env.catalogView.allowlist),refusal=env.product.resolveProgramDeclarationClosure(duplicate,duplicateView,start.resolution.program.programRef);
  await save('imported-contract-owners.json',{owners:closure.contractOwners.filter(o=>selectedRefs.includes(o.declarationRef)),duplicateProbe:refusal});
  assert.equal(refusal.kind,'execution_declaration_closure_refusal');assert.equal(refusal.code,'ambiguous');assert.match(refusal.message,/Contract .*state.*one exact compatible publication owner/);
  await save('mechanical-readiness.json',{selectionSha256:await product.sha256File(selectionPath),providerSha256:provider.sha256,inputDigest:product.sha256Canonical(input),callableMembership:refs,ready:true});
  const execution=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:'default-library',acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,
    environment:{...process.env,ABG_TS_CLAUDE_COMMAND:provider.executable,ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(provider.appendArgs)}});
  await save('execution.json',execution);const receipt=execution.output.receipt;assert.ok(receipt,JSON.stringify(execution.output));
  handoff=receipt.resources.eventResource.closeHandoff;await save('handoff.json',handoff);
  const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).slice(before);await save('events.json',events);
  await writeFile(join(evidence,'events.jsonl'),await readFile(new URL(handoff.prefix.eventLogRef)),{flag:'wx'});
  const bindings=events.filter(e=>e.kind==='actor_transport_binding_admitted');const timings=[];
  for(const [i,binding] of bindings.entries()){
    await save(`assembly-${i+1}.json`,binding.payload.instructionAssembly);
    for(const [name,path] of Object.entries(binding.payload.paths))if(typeof path==='string')try{await copyFile(path,join(evidence,`actor-${i+1}-${name}-${basename(path)}`));}catch(e){if(e.code!=='ENOENT')throw e;}
    const started=events.find(e=>e.kind==='actor_invocation_started'&&e.parentAggregateId===binding.parentAggregateId),closed=events.find(e=>e.kind==='actor_invocation_closed'&&e.parentAggregateId===binding.parentAggregateId);
    const stdout=await readFile(binding.payload.paths.stdoutPath??binding.payload.paths.stdout,'utf8');
    const rows=stdout.trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
    const reportedModels=[...new Set(rows.flatMap(row=>[row.model,row.message?.model,...Object.keys(row.modelUsage??{})]).filter(Boolean))];
    timings.push({actor:i+1,command:binding.payload.command,args:binding.payload.args,reportedModels,nativeIntervalMs:started&&closed?Date.parse(closed.eventTime)-Date.parse(started.eventTime):null,promptBytes:Buffer.byteLength(binding.payload.instructionAssembly.request.prompt)});
  }
  await save('timing.json',{setup:accounting,executionMs:execution.wallMs,native:timings,frameworkOutsideNativeIntervalsMs:execution.wallMs-timings.reduce((n,t)=>n+(t.nativeIntervalMs??0),0),publicRequestBytes:(await readFile(execution.requestPath)).length,eventCount:events.length});
  await cp(worksite,join(evidence,'worksite-result'),{recursive:true,filter:path=>!path.includes('/.ai-workspace')});
  for(const row of timings){assert.equal(row.command,provider.executable);assert.equal(row.args[row.args.indexOf('--model')+1],'claude-opus-5-5');assert.equal(row.args[row.args.indexOf('--effort')+1],'xhigh');assert.ok(!row.args.includes('--fallback-model'));assert.ok(row.reportedModels.length>0&&row.reportedModels.every(m=>m==='claude-opus-5-5'));}
  assert.equal(receipt.ownerOutput.outcomeKind,'result',JSON.stringify(receipt.ownerOutput));assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
  const results=events.filter(e=>e.kind==='c_call_result_admitted'),choices=results.filter(e=>e.payload.value?.kind==='registered_graph_choice');
  const commands=results.filter(e=>e.payload.value?.kind==='worksite_command_execution_observation'&&e.graphFunctionRef===product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef);
  assert.ok(commands.length>=2);assert.ok(commands[0].payload.value.task.sourceObservedInput);assert.ok(commands[0].payload.value.commandResults.some(r=>r.exitStatus!==0));
  const author=results.find(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef);assert.ok(author&&author.admissionOrdinal>commands[0].admissionOrdinal);
  assert.equal(events.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef&&e.admissionOrdinal<commands[0].admissionOrdinal).length,0);
  assert.ok(new Set(choices.map(e=>e.payload.value.graphFunctionRef)).size>=3);
  const selectedTasks=results.filter(e=>e.payload.value?.kind==='registered_selection_task');
  assert.ok(selectedTasks.some(e=>e.admissionOrdinal>commands[0].admissionOrdinal&&JSON.stringify(e.payload.value).includes(commands[0].payload.resultRef)));
  const assessment=results.find(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef);assert.ok(assessment);assert.equal(assessment.payload.value.assessment.disposition,'satisfied');
  assert.notEqual(assessment.payload.value.provenance.actorInvocationRef,author.payload.value.provenance.actorInvocationRef);
  const parent=results.filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive'));assert.equal(parent.at(-1).payload.value.terminal,true);assert.ok(parent.slice(0,-1).every(e=>!e.payload.value.terminal));
  assert.ok(parent.at(-1).admissionOrdinal>assessment.admissionOrdinal);assert.equal(events.filter(e=>e.kind==='run_closed').length,1);
  for(const event of parent){assert.deepEqual(event.payload.value.original,input.original);if(!event.payload.value.terminal)assert.deepEqual(event.payload.value.unresolvedSupportRefs,input.unresolvedSupportRefs);}
  for(const path of selection.protectedSeedPaths)assert.equal(await product.sha256File(join(worksite,path)),'sha256:'+selection.seedFiles[path].sha256);
  const final=commands.at(-1).payload.value;assert.ok(final.commandResults.every(r=>r.exitStatus===0));
  assert.equal(Buffer.from(final.commandResults[0].stdout.payload,'base64').toString('utf8'),'Hello, world!\n');
  const testOutput=Buffer.from(final.commandResults[1].stdout.payload,'base64').toString('utf8');assert.match(testOutput,/pass 2/);assert.match(testOutput,/fail 0/);
  await save('asserted-outcome.json',{choiceRefs:choices.map(e=>e.payload.value.graphFunctionRef),commandResultRefs:commands.map(e=>e.payload.resultRef),assessmentRef:assessment.payload.resultRef,parentRef:parent.at(-1).payload.resultRef});
  for(const memberKey of ['run_result','run_replay']){
    const call=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts:readContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source:receipt.resources.run,eventResource:resource(),identity:`default-library-${memberKey}`});
    const read=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:`default-library-${memberKey}`,acquisition:{kind:'reopen',closeHandoff:handoff},call:call.call,expectedExitCode:0});await save(`read-${memberKey}.json`,read);
    assert.deepEqual(read.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);assert.deepEqual(read.output.receipt.ownerOutput.value.projection.terminalResult,receipt.ownerOutput.value.terminalResult);assert.deepEqual(read.output.receipt.ownerOutput.value.projection.replay,receipt.resources.replay);
  }
});
