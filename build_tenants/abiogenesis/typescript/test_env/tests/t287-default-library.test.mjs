import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,mkdtemp,readdir,copyFile,cp,rm,symlink} from 'node:fs/promises';
import {join,basename,resolve,dirname} from 'node:path';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import * as eventOwner from '../../build/code/src/abg/event_store.js';
import {selectValidatedRuntimeEventPrefix} from '../../build/code/src/abg/event_prefix.js';
import {loadWorksiteOwner,worksiteFixture} from '../support/t287-generic-job-worksite.mjs';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import * as gtl from '../support/language-test-gtl.mjs';
import * as canonicalProduct from '../../build/code/src/product/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import {observedGovernanceTaskMatches} from '../../build/code/src/abg/default_library.js';
import {projectObservedWorksiteCommandChildAtPrefix} from '../../build/code/src/abg/worksite_input_provenance.js';
import {setupInstalledRootCatalog,requirePublicationValidations} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {libraryConsumerDeclaration,libraryEnvironment,witnessInput,witnessRef,assessmentSchema,schemaPath} from '../support/default-library.mjs';
const canonicalPackageRoot=new URL('../..',import.meta.url).pathname;
const packageRoot=process.env.ABI5_DEFAULT_LIBRARY_BUILD_ROOT??canonicalPackageRoot;
const product=packageRoot===canonicalPackageRoot?canonicalProduct:await import(pathToFileURL(resolve(packageRoot,'build/code/src/product/index.js')).href);
const governanceRoot=new URL('../../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/',import.meta.url).pathname;
const witnessRoot=join(governanceRoot,'default-library-witness');
const basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:'5.0.0-rc.1',artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'];
function validation(publication,program,publications){
  requirePublicationValidations(validator,publications);
  const raw=(v,k)=>{const r=validator.rawAdmitValue(v,k,'contract:fixture');assert.equal(r.kind,'raw_admitted_value',JSON.stringify(r));return r;};
  const p=raw(publication,'module_publication'),unique=(key,values)=>[...new Map(values.map(v=>[v[key],v])).values()];
  return validator.validateProgram({declarationBasisDigest:p.subjectDigest,programPublication:p,program:raw(program,'gtl_program'),
    graphFunctions:unique('name',publications.flatMap(p=>p.graphFunctions)).map(v=>raw(v,'graph_function')),
    contracts:unique('contractRef',publications.flatMap(p=>p.contracts)).map(v=>raw(v,'contract_declaration')),
    evaluators:unique('name',publications.flatMap(p=>p.evaluators)),rules:unique('name',publications.flatMap(p=>p.rules)),
    implementationBindings:unique('bindingRef',publications.flatMap(p=>p.implementationBindings)).map(v=>raw(v,'implementation_binding')),
    closureContracts:unique('closureContractRef',publications.flatMap(p=>p.closureContracts)).map(v=>raw(v,'closure_contract'))});
}
test('default library preserves cumulative wrapper bindings and rejects duplicate carried refs',()=>{
  const state=product.governanceContract('state'),graphs=gtl.defaultGovernanceGraphFunctions();
  for(const purpose of product.GOVERNANCE_PURPOSES){
    const graph=graphs.find(g=>g.name===product.governanceRef('graph-function',purpose));
    const child=purpose==='testing'?product.WORKSITE_COMMAND_EXECUTION_IDS:product.NATIVE_WORKSPACE_WORK_IDS;
    assert.deepEqual(graph.environment,{requires:[state],provides:[state],carries:[state,child.taskContractRef,child.observationContractRef]});
  }
  const publication=gtl.constructDefaultGovernanceLibraryModulePublication(basis);
  assert.equal(requirePublicationValidations(validator,[publication]).length,1);
  const duplicate=structuredClone(publication),wrapper=duplicate.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','testing'));
  wrapper.environment.carries.push(state);
  assert.throws(()=>requirePublicationValidations(validator,[duplicate]),/duplicate_identity.*environment\.carries/s);
});
test('installed root publication precondition rejects a bad non-selected publication',()=>{
  const selected=gtl.constructLanguageTestModulePublication(basis),library=gtl.constructDefaultGovernanceLibraryModulePublication(basis);
  assert.equal(requirePublicationValidations(validator,[selected,library]).length,2);
  const invalid=structuredClone(library),wrapper=invalid.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','construction'));
  wrapper.environment.carries.push(wrapper.environment.carries[0]);
  assert.equal(requirePublicationValidations(validator,[selected])[0].publicationValidation.kind,'publication_validation');
  assert.throws(()=>requirePublicationValidations(validator,[selected,invalid]),/default-library\/default@5: .*duplicate_identity/s);
});
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
test('framed Testing prerequisite keeps the full plan and future mapping while refusing an absent-file probe',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const state=structuredClone(await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')}));
  // Generic physical owner fixture: eighteen supplied inputs and eight future
  // inputs, not application code or an invented native execution/assessment.
  const selectedPaths=Array.from({length:26},(_,i)=>`declared-input-${i}.txt`),missing=selectedPaths.slice(18);
  state.original.testing.selectedPaths=selectedPaths;
  state.original.readRoots=[...state.original.readRoots,...selectedPaths];
  for(const path of selectedPaths.slice(0,18))await writeFile(join(f.canonicalRoot,path),'supplied input\n');
  const original=structuredClone(state.original),originalDigest=product.sha256Canonical(original);
  const observe=()=>physical.observeWorksiteContext({...f,readRoots:state.original.readRoots,maxFiles:100,maxBytes:1000000});
  const task={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state,context:await observe()};assert.ok(product.isFramedSynthesisTask(task));
  const targets=gtl.defaultGovernanceGraphFunctions().filter(g=>g.declarations['abg.default_library_purpose']).map(g=>({
    graphFunctionRef:g.name,definitionDigest:product.sha256Canonical(g),purpose:g.declarations['abg.default_library_purpose']}));
  const testing=targets.find(t=>t.purpose==='testing').graphFunctionRef,construction=targets.find(t=>t.purpose==='construction').graphFunctionRef;
  // Controlled basis coordinates exercise the actual strict product binder;
  // ingress authentication and live selector behavior remain installed proof.
  const basisFor=task=>({inputRef:'input:prerequisite',inputDigest:product.sha256Canonical(task),taskRef:state.original.taskRef,
    environmentRef:'environment:prerequisite',environmentDigest:product.sha256Canonical('environment'),frameEvidenceDigest:product.sha256Canonical('frame'),
    frameRefs:['frame:prerequisite'],contextRef:task.context.observationRef,previousResultRef:null});
  const rawFor=(task,nextGraphFunctionRef)=>({interpretation:'Preserve the full original plan; construct its missing inputs before measurement.',
    contributions:[{graphFunctionRef:testing,contribution:'Future full declared Testing, not a reduced probe.',reason:'Measure all declared inputs when present.',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[task.context.observationRef],dependsOn:[]},
      {graphFunctionRef:construction,contribution:'Author one missing prerequisite.',reason:'Current context has missing declared inputs.',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[task.context.observationRef],dependsOn:[]}],
    gaps:nextGraphFunctionRef===null?[{supportRefs:state.unresolvedSupportRefs,reason:'Testing inputs remain missing.',evidenceRefs:[task.context.observationRef]}]:[],
    nextGraphFunctionRef,nextReason:'Choose current work without changing the full Testing declaration.',nextEvidenceRefs:[task.context.observationRef],
    subjectEvidenceRef:null,revisionReason:'Use current observed prerequisites.',revisionEvidenceRefs:[]});
  const {default:Ajv}=await import('ajv'),ajv=new Ajv({strict:false});
  const validate=task=>ajv.compile(product.framedSynthesisResponseSchema(task,targets));
  const schema=product.framedSynthesisResponseSchema(task,targets),prompt=product.projectFramedSynthesisPromptTask(task);
  assert.deepEqual(prompt.testing,original.testing);assert.deepEqual(prompt.testingPrerequisites.missingSelectedPaths,missing);
  assert.match(prompt.testingPrerequisites.meaning,/Presence does not prove adequacy or completion/);
  assert.ok(schema.properties.contributions.items.properties.graphFunctionRef.enum.includes(testing),'future Testing remains a registered mapping row');
  assert.ok(!schema.properties.nextGraphFunctionRef.enum.includes(testing),'absent selected inputs make immediate Testing unavailable');
  const probe=rawFor(task,testing);probe.contributions[0].contribution='Run a partial eighteen-file probe now.';
  assert.equal(validate(task)(probe),false);assert.equal(product.bindFramedSynthesisResult(task,targets,basisFor(task),probe),null);
  for(const next of [construction,null]){const raw=rawFor(task,next);assert.equal(validate(task)(raw),true);
    const bound=product.bindFramedSynthesisResult(task,targets,basisFor(task),raw);assert.ok(bound);assert.equal(bound.state,state);assert.deepEqual(bound.state.original,original);assert.deepEqual(bound.judgment.contributions,raw.contributions);}
  assert.equal(product.bindFramedSynthesisResult(task,targets,basisFor(task),{...rawFor(task,construction),testing:{selectedPaths:selectedPaths.slice(0,18)}}),null,'raw prose or extra fields cannot replace the plan');
  for(const path of missing)await writeFile(join(f.canonicalRoot,path),'newly available input\n');
  assert.equal(product.bindFramedSynthesisResult(task,targets,basisFor(task),rawFor(task,testing)),null,'physical changes do not rewrite a bound context');
  const complete={...task,context:await observe()},raw=rawFor(complete,testing),bound=product.bindFramedSynthesisResult(complete,targets,basisFor(complete),raw);
  assert.deepEqual(product.projectFramedSynthesisPromptTask(complete).testingPrerequisites.missingSelectedPaths,[]);
  assert.ok(product.framedSynthesisResponseSchema(complete,targets).properties.nextGraphFunctionRef.enum.includes(testing));
  assert.equal(validate(complete)(raw),true);assert.ok(bound);assert.deepEqual(bound.state.original,original);
  const observedFiles=[];for(const relativePath of selectedPaths){const subject=physical.constructWorksiteSubject({...f,relativePath,subjectUri:pathToFileURL(join(f.canonicalRoot,relativePath)).href});
    observedFiles.push({subject,observation:await physical.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject)});}
  const commandTask=product.constructObservedWorksiteCommandExecutionTask({...f,observedFiles,...product.governanceTestingConfiguration(state)});
  assert.deepEqual(commandTask.protectedObservations.map(r=>r.subject.relativePath),selectedPaths);
  assert.ok(observedGovernanceTaskMatches(state,commandTask),'complete supplied files retain the canonical no-author Testing route');
  assert.deepEqual(commandTask.commands.map(c=>({commandId:c.commandId,executable:c.executable,args:c.args,relativeCwd:c.relativeCwd})),
    original.testing.commands.map(c=>({commandId:c.commandId,executable:c.executable,args:c.args,relativeCwd:c.relativeCwd})));
  assert.deepEqual(commandTask.outcomePredicates.map(p=>({predicateId:p.predicateId,predicateKind:p.predicateKind,declaration:p.declaration})),original.testing.outcomePredicates);
  assert.equal(product.sha256Canonical(state.original),originalDigest);
});

test('framed synthesis binds imported contracts, exact raw judgment and compact choice provenance',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  const context=await physical.observeWorksiteContext({...f,readRoots:state.original.readRoots,maxFiles:state.original.maxContextFiles,maxBytes:state.original.maxContextBytes});
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),graph=library.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','executive-step'));
  const node=graph.template.nodes.find(n=>n.term.programLocusRef===product.governanceRef('node','select')),role=library.runEnvironments[0].roles.find(r=>r.role==='selector');
  const supplied={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state,context};
  const targets=library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']);
  const events=[],call={regime:'F_P',cCallRef:'call:unit',cCallDigest:product.sha256Canonical('call'),graphFunctionRef:graph.name,programLocusRef:node.nodeRef,inputContractRef:node.term.inputCarrierRef,outputContractRef:node.term.outputCarrierRef,implementationRef:product.governanceRef('implementation','select')};
  const execution={programRef:library.programs[0].programRef,basisRef:'basis:unit',basisDigest:product.sha256Canonical('basis'),invocationAdmissionRef:'invocation:unit',registeredSelectionDefinitionDigests:Object.fromEntries(targets.map(g=>[g.name,product.sha256Canonical(g)]))};
  const owner={events,call,execution,graph:{template:graph.template},inputValue:supplied,inputDigest:product.sha256Canonical(supplied),inputRef:'input:unit',program:library.programs[0]};
  const candidate={publication:{...library,contracts:[]},graphFunction:graph,declarationGraphFunctions:library.graphFunctions,executionBasis:execution,cCall:call,cursor:{currentNodeRef:node.nodeRef,termPath:gtl.rootCSourcePath(node.nodeRef)},predecessorPrefix:{}};
  // Controlled authenticated occurrence/role premises; actual task/context and
  // declaration/result owners are exercised here. Installed proof owns ingress.
  const file=resolve(packageRoot,'build/code/src/abg/instruction_assembly.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateNativeInstructionAssemblyBasis:()=>owner}:specifier==='./stdo_environment.js'?{projectRunEnvironmentRoleEvidence:()=>({...role,invocationAdmissionRef:'invocation:unit',environmentRef:'environment:unit',environmentDigest:product.sha256Canonical('environment'),evidenceDigest:product.sha256Canonical('evidence'),contextPolicyDigest:product.sha256Canonical(role.contextPolicy),sourceContent:[],accessContent:[]})}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const lookup=ref=>library.contracts.find(c=>c.contractRef===ref)??null;
  const assembly=m.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,supplied,lookup);assert.equal(assembly.kind,'native_instruction_assembly',JSON.stringify(assembly));
  const rendered=assembly.request.prompt, response=assembly.request.responseJsonSchema;
  const canonical=assembly.envelope.sections.response;
  assert.deepEqual(canonical,product.framedSynthesisResponseSchema(supplied,assembly.envelope.targetBindings));assert.ok(canonical.anyOf.length>0,'canonical target/source constraints remain intact');
  assert.equal(assembly.plan.responsePresentation,undefined);assert.equal(assembly.request.responsePresentation,undefined);
  assert.deepEqual(Object.keys(response).sort(),['additionalProperties','properties','required','type']);
  for(const key of Object.keys(response))assert.deepEqual(response[key],canonical[key],key+' is conserved from the canonical owner');
  for(const key of ['anyOf','oneOf','allOf'])assert.equal(Object.hasOwn(response,key),false,'provider root has no '+key);
  assert.equal(assembly.plan.canonicalResponseSchemaDigest,product.sha256Canonical(canonical));assert.equal(assembly.plan.carrierResponseSchemaDigest,product.sha256Canonical(response));
  assert.notEqual(assembly.plan.canonicalResponseSchemaDigest,assembly.plan.carrierResponseSchemaDigest,'shape carrier is not the canonical semantic schema');
  assert.equal(assembly.manifest.canonicalResponseSchemaDigest,assembly.plan.canonicalResponseSchemaDigest);assert.equal(assembly.manifest.responseSchemaDigest,assembly.plan.carrierResponseSchemaDigest);
  const transport=await import(pathToFileURL(resolve(packageRoot,'build/code/src/abg/transport_contracts.js')).href);
  const argsInput={contract:transport.constructKnownWorkerTransportContract('claude',{environment:{}}),prompt:rendered,outputPath:'/unused-selector-output.json',lane:assembly.request.transportLane,responseJsonSchema:response,environment:{}};
  const args=transport.composeWorkerTransportArgs(argsInput);
  assert.equal(args.filter(arg=>arg==='--json-schema').length,1);assert.deepEqual(JSON.parse(args.at(-1)),response);
  assert.deepEqual(args.slice(-5,-2),['--safe-mode','--tools','']);
  for(const rule of ['at most one contribution row per graphFunctionRef','different contribution row in THIS response; no self-dependency','admitted evidenceRefs, not dependsOn','null with nonempty gaps and null subjectEvidenceRef','For UAT, subjectEvidenceRef must select','For Testing, optionally select','For other work or a gap, subjectEvidenceRef must be null'])assert.ok(rendered.includes(rule),rule);
  assert.match(response.properties.contributions.description,/one contribution row per graphFunctionRef/);
  assert.match(response.properties.contributions.items.properties.dependsOn.description,/different contribution in THIS response/);
  assert.match(response.properties.nextGraphFunctionRef.description,/gaps must be nonempty and subjectEvidenceRef must be null/);
  assert.equal(JSON.parse(JSON.stringify(assembly)).manifest.runEnvironment.invocationAdmissionRef,execution.invocationAdmissionRef);
  assert.equal(m.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,supplied).cause,'unknown_dependency');
  for(const missing of [call.inputContractRef,call.outputContractRef,graph.declarations['abg.raw_result_contract'],product.governanceContract('state')])
    assert.equal(m.namespace.evaluateFramedSynthesisInstructionAssembly({...candidate,publication:library},supplied,ref=>ref===missing?null:lookup(ref)).cause,'unknown_dependency');
  const target=targets.find(g=>g.declarations['abg.default_library_purpose']==='testing');
  const raw={interpretation:'Measure supplied candidate against original criteria.',contributions:[{graphFunctionRef:target.name,contribution:'Actual measurements',reason:'No execution evidence yet',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[context.observationRef],dependsOn:[]}],gaps:[],nextGraphFunctionRef:target.name,nextReason:'Measure current files',nextEvidenceRefs:[context.observationRef],subjectEvidenceRef:null,revisionReason:'Initial judgment',revisionEvidenceRefs:[]};
  const hook=await import('../../build/code/src/implementation/default_library.js'),port=await import('../../build/code/src/implementation/leaf_invocation_port.js');
  // Actual exported hook and actual prepared-port guard; this test supplies the
  // same controlled owned-assembly premise as above and never invokes an actor.
  const prepared=await port.invokeLeafOwnerBoundary({resolution:hook.GOVERNANCE_SELECTOR_DESCRIPTOR,value:supplied,inputDigest:owner.inputDigest,failureValueKind:'governance_failure',verifyAuthority:()=>true,validateSuccess:product.isFramedSynthesisResult,
    resolveWorkerContracts:()=>({instructionContractRef:call.inputContractRef,resultContractRef:graph.declarations['abg.raw_result_contract']}),occurrence:{cCallRef:call.cCallRef,runId:'run:unit',graphCallId:'graph-call:unit',frameId:'frame:unit',programLocusRef:node.nodeRef,taskOrdinal:null,attempt:0,executionAuthority:null},contractByRef:lookup,
    loadImplementation:async()=> (value,occurrence)=>hook.selectGovernanceWork(value,occurrence,()=>assembly)});
  assert.equal(prepared.kind,'prepared_probabilistic_leaf_owner_invocation',JSON.stringify(prepared));assert.deepEqual(prepared.workerRequest,assembly.request);
  const bound=product.bindFramedSynthesisResult(supplied,assembly.envelope.targetBindings,assembly.envelope.boundBasis,raw);assert.ok(bound);assert.deepEqual(bound.judgment,raw);assert.equal(bound.state,state);
  const observation={disposition:'success',toolCallCount:0,finalOutput:JSON.stringify(raw),inputDigest:owner.inputDigest,implementationRef:call.implementationRef};
  const check=(value=bound,obs=observation,b=candidate)=>m.namespace.framedSynthesisInstructionResultMatches(b,supplied,value,obs,lookup);
  const complete=text=>hook.selectGovernanceWork(supplied,{},()=>assembly).complete({request:assembly.request,observation:{...observation,promptDigest:assembly.manifest.promptDigest,finalOutput:text}});
  assert.deepEqual(complete(JSON.stringify(raw)).resultCandidate,bound);
  const worker=await import(pathToFileURL(resolve(packageRoot,'build/code/src/abg/worker_transport.js')).href);
  const structuredRaw=line=>{const observer=worker.createWorkerTransportOutputObserver(true);observer.observe(line+'\n');return observer.finish().finalOutput;};
  const successfulCarrier=JSON.stringify({type:'result',subtype:'success',is_error:false,structured_output:raw});
  const structured=structuredRaw(successfulCarrier);assert.deepEqual(complete(structured).resultCandidate,bound);assert.equal(check(bound,{...observation,finalOutput:structured}),true);
  for(const line of ['', '{', '{"type":"result","subtype":"success","is_error":false,"structured_output":'+JSON.stringify(raw)+',"structured_output":'+JSON.stringify(raw)+'}',
    JSON.stringify({type:'result',subtype:'success',is_error:false,result:'```json\n'+JSON.stringify(raw)+'\n```'})]){
    const rejected=structuredRaw(line);assert.equal(rejected,'');assert.throws(()=>complete(rejected));assert.equal(check(bound,{...observation,finalOutput:rejected}),false);
  }
  for(const text of ['', '{', 'null', '{"interpretation":"duplicate",'+JSON.stringify(raw).slice(1)]){
    assert.throws(()=>complete(text));assert.equal(check(bound,{...observation,finalOutput:text}),false);
  }
  assert.equal(check(),true);assert.equal(check({...bound,judgment:{...raw,nextReason:'rewritten'}}),false);assert.equal(check({...bound,basis:{...bound.basis,frameEvidenceDigest:product.sha256Canonical('crossed')}}),false);
  assert.equal(check(bound,{...observation,inputDigest:product.sha256Canonical('crossed')}),false);assert.equal(check(bound,{...observation,finalOutput:JSON.stringify({...raw,extra:'discard me'})}),false);
  const {framedSynthesisNativeRole:profile}=await import('../../build/code/src/gtl/stdo_run_environment.js');
  const unrelated=structuredClone(graph);delete unrelated.declarations['abg.framed_synthesis_locus'];assert.equal(profile(library,execution.programRef,unrelated,node.nodeRef),null);
  const invalid=structuredClone(graph);invalid.declarations['abg.framed_synthesis_projection']='node:missing';assert.equal(profile(library,execution.programRef,invalid,node.nodeRef),false);assert.equal(check(bound,observation,{...candidate,graphFunction:invalid}),false);
  const bind=raw=>product.bindFramedSynthesisResult(supplied,assembly.envelope.targetBindings,assembly.envelope.boundBasis,raw);
  for(const invalid of [{...raw,nextGraphFunctionRef:'graph:foreign'},{...raw,contributions:[...raw.contributions,...raw.contributions]},
    {...raw,contributions:[{...raw.contributions[0],dependsOn:[target.name]}]}, {...raw,nextEvidenceRefs:['result:invented']}, {...raw,subjectEvidenceRef:'result:invented'},
    {...raw,contributions:[{...raw.contributions[0],dependsOn:[targets.find(t=>t.name!==target.name).name]}]},
    {...raw,nextGraphFunctionRef:targets.find(t=>t.name!==target.name).name}, {...raw,nextGraphFunctionRef:null},
    {...raw,contributions:[{...raw.contributions[0],supportRefs:['support:foreign']}]}])assert.equal(bind(invalid),null);
  const gap=bind({...raw,contributions:[],nextGraphFunctionRef:null,gaps:[{supportRefs:state.unresolvedSupportRefs,reason:'Missing capability',evidenceRefs:[]}]});assert.ok(gap);
  const current={resultRef:'result:synthesis',resultDigest:product.sha256Canonical(bound),basis:bound.basis,judgment:bound.judgment};
  assert.ok(product.isGovernanceWorkState({...state,synthesis:current}));assert.equal(product.isGovernanceWorkState({...state,synthesis:{...current,state}}),false,'prior whole state is refused');
  assert.equal(product.isGovernanceWorkState({...state,synthesis:{...current,result:bound}}),false,'prior whole Result is refused');
  const later={...supplied,state:{...state,synthesis:current}},laterBasis={...bound.basis,previousResultRef:current.resultRef};
  const revision=product.bindFramedSynthesisResult(later,assembly.envelope.targetBindings,laterBasis,{...raw,revisionReason:'Retained judgment reconsidered',revisionEvidenceRefs:[current.resultRef]});assert.ok(revision);
  assert.equal(product.bindFramedSynthesisResult(later,assembly.envelope.targetBindings,bound.basis,raw),null,'revision must name exact prior result');
  assert.deepEqual(Object.keys(revision.state.synthesis).sort(),['basis','judgment','resultDigest','resultRef']);
  const invocation={invocationRef:'invocation:unit',invocationAdmissionRef:execution.invocationAdmissionRef,capabilityGrants:[f.capabilityGrant]},projection=graph.template.nodes.find(n=>n.nodeRef===graph.declarations['abg.framed_synthesis_projection']);
  const origin={kind:'c_call_result_admitted',runId:'run:unit',basisId:execution.basisRef,graphCallId:'graph-call:unit',aggregateId:call.cCallRef,payload:{resultClass:'success',resultRef:'result:unit',resultDigest:product.sha256Canonical(bound)}};
  const projectionOwner={...owner,inputValue:bound,inputRef:origin.payload.resultRef,inputOrigin:{event:origin},execution:{...execution,rootImplementationSetRef:'set:unit'},environment:{kind:'exact_prefix_workspace_environment'},prefix:{},call:{...call,runId:'run:unit',graphCallId:'graph-call:unit',implementationRef:product.governanceRef('implementation','project-choice'),outputContractRef:product.governanceContract('choice')}};
  const root={kind:'basis_admitted',payload:{basisClass:'root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:'set:unit',rawInputValue:state}},opened={kind:'c_call_opened',runId:'run:unit',basisId:execution.basisRef,payload:{programLocusRef:node.nodeRef}};
  const projectionFile=resolve(packageRoot,'build/code/src/abg/default_library.js'),projectionModule=new SourceTextModule(await readFile(projectionFile,'utf8'),{identifier:projectionFile});
  await projectionModule.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(projectionFile),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateNativeInstructionAssemblyBasis:()=>projectionOwner}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:(_p,key)=>key==='invocation:'+invocation.invocationRef?[root]:[opened]}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await projectionModule.evaluate();
  const projectionBasis={graphFunction:graph,cursor:{currentNodeRef:projection.nodeRef,termPath:gtl.rootCSourcePath(projection.nodeRef)}};
  const choice=projectionModule.namespace.projectGovernanceChoice(projectionBasis,bound);assert.ok(choice);assert.equal(choice.graphFunctionRef,raw.nextGraphFunctionRef);assert.equal(choice.reason,raw.nextReason);assert.deepEqual(choice.input.value.original,state.original);assert.deepEqual(choice.input.value.synthesis,current.resultRef==='result:unit'?current:{...current,resultRef:'result:unit'});
  origin.basisId='basis:foreign';assert.equal(projectionModule.namespace.projectGovernanceChoice(projectionBasis,bound),null);origin.basisId=execution.basisRef;
  projectionOwner.inputValue=gap;assert.equal(projectionModule.namespace.projectGovernanceChoice(projectionBasis,gap).disposition,'gap');

  // Actual binder -> admitted-choice projection -> typed native preparation,
  // under the controlled occurrence/index premises disclosed above. No actor
  // or application work is supplied by this counterexample.
  const construction=targets.find(g=>g.declarations['abg.default_library_purpose']==='construction');
  const increment={...raw.contributions[0],graphFunctionRef:construction.name,
    contribution:'Inspect only the current candidate and report its remaining gaps.',
    reason:'Full testing and independent acceptance remain parent obligations.'};
  const narrow=bind({...raw,interpretation:'The original task requires several iterations.',contributions:[increment],
    nextGraphFunctionRef:construction.name,nextReason:'One bounded inspection before reassessment.'});assert.ok(narrow);
  projectionOwner.inputValue=narrow;origin.payload.resultDigest=product.sha256Canonical(narrow);
  const selected=projectionModule.namespace.projectGovernanceChoice(projectionBasis,narrow).input.value;
  assert.deepEqual(selected.original,state.original);assert.deepEqual(selected.unresolvedSupportRefs,state.unresolvedSupportRefs);
  Object.assign(projectionOwner.execution,{workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest});
  projectionOwner.environment={kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,productInstalls:[]};
  const prepare=async input=>{projectionOwner.inputValue=input;projectionOwner.call.implementationRef=product.governanceRef('implementation','prepare-native');return projectionModule.namespace.projectGovernanceNativeTask({graphFunction:construction},input);};
  const selectedTask=await prepare(selected),native=await import('../../build/code/src/product/native_workspace_work.js');
  assert.ok(native.isNativeWorkspaceWorkTask(selectedTask));
  const selectedInstruction=selectedTask.instructions.find(i=>i.startsWith('Current admitted selection for this work unit: '));assert.ok(selectedInstruction);
  const selectedMeaning=JSON.parse(selectedInstruction.slice(selectedInstruction.indexOf(': ')+2));
  assert.deepEqual(selectedMeaning.contributions,[increment]);assert.equal(selectedMeaning.interpretation,narrow.judgment.interpretation);
  assert.equal(selectedMeaning.nextReason,narrow.judgment.nextReason);assert.equal(selectedMeaning.resultRef,origin.payload.resultRef);
  assert.equal(selectedMeaning.resultDigest,origin.payload.resultDigest);assert.deepEqual(selectedMeaning.nextEvidenceRefs,narrow.judgment.nextEvidenceRefs);
  const order=state.original.workOrders.construction;
  assert.notEqual(increment.contribution,order.outcome);assert.equal(selectedTask.outcome,increment.contribution,'operative child goal is the selected increment');
  for(const key of ['readFirst','writeRoots','checks'])assert.deepEqual(selectedTask[key],order[key],key+' stays caller-owned');
  assert.deepEqual(selectedTask.capabilityGrant,f.capabilityGrant);assert.ok(selectedTask.instructions.includes('Supplied purpose outcome (parent context): '+order.outcome));
  assert.ok(selectedTask.instructions.includes('Conserved original task: '+state.original.task));
  assert.ok(selectedTask.instructions.includes('Unresolved parent outcomes: '+JSON.stringify(state.unresolvedSupportRefs)));
  assert.equal(projectionModule.namespace.governanceResultMatches({graphFunction:construction},selected,selectedTask),true);
  const renderedWork=native.renderNativeWorkspaceWorkOrder(selectedTask);
  assert.ok(renderedWork.includes('Outcome: '+increment.contribution));assert.equal(renderedWork.includes('Outcome: '+order.outcome),false,'the broader parent goal is not rendered as the operative child goal');
  assert.ok(selectedTask.instructions.some(i=>i.includes('return a truthful partial report')),'author work may yield a bounded partial report');
  assert.deepEqual(native.nativeWorkspaceWorkResponseSchema(selectedTask).required,['summary','gaps']);
  const directTask=await prepare(state);assert.ok(native.isNativeWorkspaceWorkTask(directTask));
  assert.equal(directTask.outcome,order.outcome,'direct calls retain the supplied goal');
  assert.equal(directTask.instructions.some(i=>i===selectedInstruction),false);
  projectionOwner.inputValue=selected;
  assert.equal(projectionModule.namespace.governanceResultMatches({graphFunction:construction},selected,directTask),false,'old global-only adaptation cannot satisfy the selected preparation');
  const otherChoice={...selected,synthesis:choice.input.value.synthesis};
  const otherTask=await prepare(otherChoice);assert.deepEqual(otherTask.instructions,directTask.instructions,'an unrelated selected purpose is not imported');assert.equal(otherTask.outcome,order.outcome);

  const partial=native.constructNativeWorkspaceWorkObservation(selectedTask,selectedTask.context,
    {summary:'Controlled bounded inspection report.',gaps:['Parent testing and independent acceptance remain.']},
    {cCallRef:'call:partial',executionAuthorityRef:'authority:unit',executionAuthorityDigest:product.sha256Canonical('authority'),actorInvocationRef:'actor:unit',transportBindingRef:'transport:unit',transportBindingDigest:product.sha256Canonical('transport'),promptDigest:product.sha256Canonical('prompt'),transportDigest:product.sha256Canonical('transport')});
  const retained=product.constructRetainedGraphInput(selected,partial),partialEvent={kind:'c_call_result_admitted',runId:'run:unit',basisId:'basis:child',aggregateId:'call:partial',payload:{resultClass:'success',resultRef:'result:partial',resultDigest:product.sha256Canonical(partial),value:partial}};
  projectionOwner.inputValue=retained;projectionOwner.call.implementationRef=product.governanceRef('implementation','fold');
  projectionOwner.inputOrigin={retainedProjection:{entryBasis:projectionOwner.execution,input:{admissionRef:projectionOwner.inputRef,value:retained},sourceResult:partialEvent}};
  const folded=projectionModule.namespace.projectGovernanceFold({graphFunction:construction},retained);assert.ok(folded);
  assert.deepEqual(folded.original,state.original);assert.deepEqual(folded.unresolvedSupportRefs,state.unresolvedSupportRefs);
  assert.equal(folded.terminal,false);assert.equal(folded.observations.at(-1).resultRef,partialEvent.payload.resultRef);
  assert.deepEqual(folded.observations.at(-1).value.report,partial.report);
  projectionOwner.inputValue=folded;projectionOwner.call.implementationRef=product.governanceRef('implementation','evaluate-parent');
  assert.deepEqual(projectionModule.namespace.projectGovernanceParent({},folded),folded,'partial work returns for parent reassessment');
  const reentered={...supplied,state:folded},reentryBasis={...narrow.basis,inputRef:'input:after-partial',inputDigest:product.sha256Canonical(reentered),previousResultRef:folded.synthesis.resultRef};
  const next=product.bindFramedSynthesisResult(reentered,assembly.envelope.targetBindings,reentryBasis,{...raw,nextReason:'Measure after the bounded inspection.',nextEvidenceRefs:[partialEvent.payload.resultRef],revisionReason:'The partial inspection is now admitted.',revisionEvidenceRefs:[folded.synthesis.resultRef]});assert.ok(next);
  projectionOwner.inputValue=next;projectionOwner.inputOrigin={event:origin};projectionOwner.call.implementationRef=product.governanceRef('implementation','project-choice');origin.payload.resultDigest=product.sha256Canonical(next);
  const nextChoice=projectionModule.namespace.projectGovernanceChoice(projectionBasis,next);assert.equal(nextChoice.graphFunctionRef,target.name);
  assert.deepEqual(nextChoice.input.value.original,state.original);assert.deepEqual(nextChoice.input.value.observations,folded.observations);assert.equal(nextChoice.input.value.synthesis.basis.previousResultRef,folded.synthesis.resultRef);

});

/** Actual assembly/result owners with controlled authentication premises. This
 * never authenticates an installed occurrence or invokes an actor. */
async function planningAssemblyFor(task,{oldProjectorSource}={}) {
  const {consumerDeclaration,IDS}=await import('../uat/consumer.mjs');
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis);
  const data=consumerDeclaration(gtl,product,library,1000),publication=gtl.modulePublication({...data,
    artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,productManifestDigest:basis.productManifestDigest,
    contributions:data.contributions.map(c=>({...c,provenanceRefs:[basis.artifactDigest]}))});
  const graph=publication.graphFunctions.find(g=>g.name===IDS.stepRef),node=graph.template.nodes.find(n=>n.term.programLocusRef===product.governanceRef('node','select'));
  const targets=library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']),role=publication.runEnvironments[0].roles.find(r=>r.role==='selector');
  const call={regime:'F_P',cCallRef:'call:controlled-planning',cCallDigest:product.sha256Canonical('call'),graphFunctionRef:graph.name,
    programLocusRef:node.nodeRef,inputContractRef:node.term.inputCarrierRef,outputContractRef:node.term.outputCarrierRef,implementationRef:product.governanceRef('implementation','select')};
  const execution={programRef:IDS.programRef,basisRef:'basis:controlled-planning',basisDigest:product.sha256Canonical('basis'),
    invocationAdmissionRef:'invocation:controlled-planning',registeredSelectionDefinitionDigests:Object.fromEntries(targets.map(g=>[g.name,product.sha256Canonical(g)]))};
  const owner={events:[],call,execution,graph:{template:graph.template},inputValue:task,inputDigest:product.sha256Canonical(task),inputRef:'input:controlled-planning',program:publication.programs[0]};
  const candidate={publication,graphFunction:graph,declarationGraphFunctions:[...publication.graphFunctions,...library.graphFunctions],
    executionBasis:execution,cCall:call,cursor:{currentNodeRef:node.nodeRef,termPath:gtl.rootCSourcePath(node.nodeRef)},predecessorPrefix:{}};
  const source=await import('../../build/code/src/gtl/default_library.js'),bytes=await readFile(join(packageRoot,source.DEFAULT_LIBRARY_STDO_SOURCE.assetPath));
  const sourceContent=role.sourceBindings.map(binding=>{
    assert.equal(product.sha256Bytes(bytes),binding.memberDigest);
    const span=bytes.subarray(binding.startByte,binding.endByte);assert.equal(product.sha256Bytes(span),binding.spanDigest);
    return {...binding,path:source.DEFAULT_LIBRARY_STDO_SOURCE.path,sourceLocator:source.DEFAULT_LIBRARY_STDO_SOURCE.basisRef,text:new TextDecoder('utf-8',{fatal:true}).decode(span)};
  });
  let oldProjector;
  if(oldProjectorSource){
    const {default:ts}=await import('typescript'),file=resolve(packageRoot,'build/code/src/product/default_library.js');
    const old=new SourceTextModule(ts.transpileModule(await readFile(oldProjectorSource,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText,{identifier:file});
    await old.link(async s=>{const actual=await import(s.startsWith('node:')||!s.startsWith('.')?s:pathToFileURL(resolve(dirname(file),s)).href);
      return new SyntheticModule(Object.keys(actual),function(){for(const[k,v]of Object.entries(actual))this.setExport(k,v);});});
    await old.evaluate();oldProjector=old.namespace.projectFramedSynthesisPromptTask;
  }
  const file=resolve(packageRoot,'build/code/src/abg/instruction_assembly.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async s=>{const actual=await import(s.startsWith('node:')?s:pathToFileURL(resolve(dirname(file),s)).href);
    const replacements=s==='./execution_basis.js'?{authenticateNativeInstructionAssemblyBasis:()=>owner}:
      s==='./stdo_environment.js'?{projectRunEnvironmentRoleEvidence:()=>({...role,invocationAdmissionRef:execution.invocationAdmissionRef,
        environmentRef:publication.runEnvironments[0].declarationRef,environmentDigest:product.sha256Canonical(publication.runEnvironments[0]),
        evidenceDigest:product.sha256Canonical('evidence'),contextPolicyDigest:product.sha256Canonical(role.contextPolicy),sourceContent,accessContent:[]})}:
      s==='../product/default_library.js'&&oldProjector?{projectFramedSynthesisPromptTask:oldProjector}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
  await m.evaluate();const lookup=ref=>[...publication.contracts,...library.contracts].find(c=>c.contractRef===ref)??null;
  return m.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,task,lookup);
}
function planningFactCorrespondence(task,view) {
  assert.equal(view.originalTask,task.state.original.task);assert.deepEqual(view.testing,task.state.original.testing);
  assert.deepEqual(view.unresolvedSupportRefs,task.state.unresolvedSupportRefs);
  assert.deepEqual(view.priorJudgment,task.state.synthesis===null?null:{resultRef:task.state.synthesis.resultRef,judgment:task.state.synthesis.judgment});
  assert.equal(view.observations.length,task.state.observations.length);
  for(const[i,source]of task.state.observations.entries()){
    const shown=view.observations[i];
    for(const key of ['resultRef','resultDigest','cCallRef','actorInvocationRef','purpose','selectedGraphFunctionRef','synthesisResultRef'])assert.deepEqual(shown[key],source[key]);
    if(source.purpose!=='testing'){assert.deepEqual(shown.observed,source.value);continue;}
    for(const[j,row]of source.value.commandResults.entries()){
      const command=shown.observed.commandResults[j];
      for(const[k,v]of Object.entries(row))if(!['stdout','stderr'].includes(k))assert.deepEqual(command[k],v);
      for(const lane of ['stdout','stderr']){
        const stream=row[lane],display=command[lane];if(!stream||!['utf8','base64'].includes(stream.encoding)){assert.deepEqual(display,stream);continue;}
        const raw=stream.encoding==='utf8'?Buffer.from(stream.text):Buffer.from(stream.payload,'base64');
        assert.deepEqual(display.rawBody,{resultRef:source.resultRef,resultDigest:source.resultDigest,fieldPath:['commandResults',j,lane],omittedFromPlanningView:true});
        assert.equal(display.digest,stream.digest);assert.equal(display.byteLength,stream.byteLength);assert.equal(display.displayOnly,true);
        assert.ok(!Object.hasOwn(display,'text')&&!Object.hasOwn(display,'payload'));
        let count=0;for(const excerpt of display.excerpts){assert.equal(raw.subarray(excerpt.startByte,excerpt.endByte).toString(),excerpt.text);count+=excerpt.endByte-excerpt.startByte;}
        assert.equal(count,display.displayedByteCount);assert.ok(count<=8192&&display.excerpts.length<=32);
      }
    }
    for(const[j,row]of source.value.predicateObservations.entries()){
      const shownPredicate=shown.observed.predicateObservations[j];
      for(const[k,v]of Object.entries(row))if(k!=='evidence')assert.deepEqual(shownPredicate[k],v);
      assert.deepEqual(shownPredicate.evidenceBody,{resultRef:source.resultRef,resultDigest:source.resultDigest,fieldPath:['predicateObservations',j,'evidence'],omittedFromPlanningView:true});
    }
  }
}
test('selector planning preserves provenance, adverse values and bounded Unicode diagnostic ranges',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=structuredClone(await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')}));
  const context=await physical.observeWorksiteContext({...f,readRoots:state.original.readRoots,maxFiles:state.original.maxContextFiles,maxBytes:state.original.maxContextBytes});
  const text='ordinary line\n'.repeat(2400)+'[info] - controlled Ω😀 named diagnostic *** FAILED ***\n[error] exact application red\n';
  const stream=text=>({encoding:'utf8',text,digest:product.sha256Bytes(Buffer.from(text)),byteLength:Buffer.byteLength(text)});
  // Constructed planning carrier, no C2 execution/admission claim.
  state.observations=[{purpose:'testing',resultRef:'result:controlled',resultDigest:product.sha256Canonical('controlled'),cCallRef:'call:controlled',
    actorInvocationRef:'actor:controlled',selectedGraphFunctionRef:product.governanceRef('graph-function','testing'),synthesisResultRef:'result:selection',
    value:{commandResults:[{commandId:'command:controlled',observationRef:'observation:command',observationDigest:product.sha256Canonical('command'),
      exitStatus:1,timedOut:false,processSignal:null,terminationConfirmed:false,unknownStatus:null,stdout:stream(text),
      stderr:stream('\uFEFF*** '+ 'Ω😀'.repeat(2400)+'\n'),reports:[{relativePath:'report.xml',state:'absent',digest:null,byteLength:null,observationRef:'report:missing'}]}],
      predicateObservations:[{predicateId:'predicate:controlled',predicateKind:'process_exit',observedValue:1,evidenceRefs:['observation:command'],evidence:[{opaque:'full proof'}]},
        {predicateId:'predicate:unknown',predicateKind:'unknown',observedValue:null,evidenceRefs:[],evidence:[]}]}}];
  const task={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state,context},before=product.sha256Canonical(task);
  const view=product.projectFramedSynthesisPromptTask(task);planningFactCorrespondence(task,view);
  assert.ok(view.observations[0].observed.commandResults[0].stdout.excerpts.some(e=>e.text.includes('controlled Ω😀 named diagnostic')));
  assert.ok(view.observations[0].observed.commandResults[0].stderr.omittedCandidates>0);
  assert.equal(product.sha256Canonical(task),before);assert.equal(product.governanceVerdict(state),false);
  for(const text of ['\uFEFFa\n','\uFEFF[error] Ω😀 exact\n','[error] plain Ω😀\n'])for(const encoding of ['utf8','base64']){
    const sample=structuredClone(task),bytes=Buffer.from(text),row=sample.state.observations[0].value.commandResults[0];
    row.stdout={encoding,...(encoding==='utf8'?{text}:{payload:bytes.toString('base64')}),digest:product.sha256Bytes(bytes),byteLength:bytes.length};
    const projected=product.projectFramedSynthesisPromptTask(sample);planningFactCorrespondence(sample,projected);
    const displayed=projected.observations[0].observed.commandResults[0].stdout;
    assert.equal(displayed.excerpts[0].startByte,0);assert.equal(displayed.excerpts[0].text,text);
    assert.equal(Buffer.from(displayed.excerpts[0].text).equals(bytes),true,'literal display preserves the complete cited bytes');
  }
  const assembly=await planningAssemblyFor(task);assert.equal(assembly.kind,'native_instruction_assembly',JSON.stringify(assembly));
  assert.ok(Buffer.byteLength(assembly.request.prompt)<=state.original.maxPromptBytes);
  const target=assembly.envelope.targetBindings.find(t=>t.purpose==='construction'),raw={interpretation:'Application remains non-green.',
    contributions:[{graphFunctionRef:target.graphFunctionRef,contribution:'Inspect the reported gap.',reason:'The measurement is adverse.',supportRefs:state.unresolvedSupportRefs,evidenceRefs:['result:controlled'],dependsOn:[]}],
    gaps:[],nextGraphFunctionRef:target.graphFunctionRef,nextReason:'Correct bounded work then reassess.',nextEvidenceRefs:['result:controlled'],subjectEvidenceRef:null,revisionReason:'Initial',revisionEvidenceRefs:[]};
  const bound=product.bindFramedSynthesisResult(task,assembly.envelope.targetBindings,assembly.envelope.boundBasis,raw);assert.ok(bound);assert.deepEqual(bound.state,state);assert.deepEqual(bound.judgment,raw);
  const oversized=structuredClone(task);oversized.state.original.task='x'.repeat(state.original.maxPromptBytes+1);
  assert.equal((await planningAssemblyFor(oversized)).cause,'declared_bound_overflow');
});
test('selector planning fits captured eighteen and realistic fifty-one complete owned assemblies',
  {skip:!process.env.ABI5_PLANNING_PROJECTION_CAPTURE},async t=>{
    const fixture=JSON.parse(await readFile(process.env.ABI5_PLANNING_PROJECTION_CAPTURE,'utf8')),metrics=[];
    const load=async pin=>{const bytes=await readFile(pin.path);assert.equal(product.sha256Bytes(bytes),'sha256:'+pin.sha256);return JSON.parse(bytes);};
    const captured=await load(fixture.captured),controlled=await load(fixture.controlled);
    assert.equal(product.sha256Bytes(await readFile(fixture.oldProjector.path)),'sha256:'+fixture.oldProjector.sha256);
    assert.equal(captured.state.observations.length,18);assert.equal(controlled.state.observations.length,51);
    assert.deepEqual(controlled.state.observations.slice(0,18),captured.state.observations);assert.deepEqual(controlled.state.original,captured.state.original);
    for(const[name,task]of [['captured',captured],['controlled16',controlled]]){
      const before=product.sha256Canonical(task),view=product.projectFramedSynthesisPromptTask(task);planningFactCorrespondence(task,view);
      let knownNameLines=0;
      for(const[i,o]of task.state.observations.entries())if(o.purpose==='testing')for(const[j,c]of o.value.commandResults.entries()){
        const names=(c.stdout.text??'').split('\n').filter(line=>line.includes('*** FAILED ***')),shown=view.observations[i].observed.commandResults[j].stdout;
        knownNameLines+=names.length;for(const name of names)assert.ok(shown.excerpts.some(e=>e.text.includes(name)),name);
      }
      if(name==='captured')assert.equal(knownNameLines,31);
      const old=await planningAssemblyFor(task,{oldProjectorSource:fixture.oldProjector.path});assert.equal(old.cause,'declared_bound_overflow');
      const assembly=await planningAssemblyFor(task);assert.equal(assembly.kind,'native_instruction_assembly',JSON.stringify(assembly));
      assert.ok(Buffer.byteLength(assembly.request.prompt)<=task.state.original.maxPromptBytes);assert.equal(product.sha256Canonical(task),before);
      metrics.push({name,observations:task.state.observations.length,completePromptBytes:Buffer.byteLength(assembly.request.prompt),projectionBytes:Buffer.byteLength(product.canonicalJson(view)),knownNameLines});
    }
    const fd=await import('node:fs/promises'),handle=await fd.open(fixture.eventStore.path,'r');
    try{for(const coordinate of fixture.owners){
      const bytes=Buffer.alloc(coordinate.byteLength);await handle.read(bytes,0,bytes.length,coordinate.offset);assert.equal(product.sha256Bytes(bytes),'sha256:'+coordinate.sha256);
      const event=JSON.parse(bytes),owner=event.payload.value;assert.equal(event.payload.resultRef,coordinate.resultRef);
      assert.equal(product.sha256Canonical(owner),event.payload.valueDigest);
      const {resultRef,resultDigest,...resultBody}=event.payload;
      assert.equal(product.sha256Canonical(resultBody),resultDigest);
      assert.equal(resultDigest,coordinate.resultDigest);assert.equal(resultRef,'result://abiogenesis/'+resultDigest.slice(7));
      const retained=captured.state.observations.find(o=>o.resultRef===coordinate.resultRef);assert.equal(retained.resultDigest,coordinate.resultDigest);
      assert.equal(event.payload.cCallRef,retained.cCallRef);assert.equal(event.aggregateId,retained.cCallRef);
      const displayed=product.projectFramedSynthesisPromptTask(captured).observations[captured.state.observations.indexOf(retained)].observed;
      for(const[j,row]of retained.value.commandResults.entries())for(const lane of ['stdout','stderr']){
        const ref=displayed.commandResults[j][lane].rawBody,stream=ref.fieldPath.reduce((v,k)=>v[k],owner),decoded=Buffer.from(stream.payload,'base64');
        assert.equal(product.sha256Bytes(decoded),stream.digest);assert.equal(decoded.length,stream.byteLength);
        assert.equal(stream.digest,row[lane].digest);assert.equal(stream.byteLength,row[lane].byteLength);
        assert.equal(decoded.toString(),row[lane].text);
      }
      for(const[j,p]of retained.value.predicateObservations.entries())assert.deepEqual(
        displayed.predicateObservations[j].evidenceBody.fieldPath.reduce((v,k)=>v[k],owner),p.evidence);
    }}finally{await handle.close();}
    t.diagnostic(JSON.stringify({metrics,authenticOwningResults:fixture.owners.length,controlled:'synthetic; not native mutant detection'}));
  });

test('fold and assessment consume actual native, C2 and assessment carriers with exact retained origin',async t=>{
  const nativeOwner=await import('../../build/code/src/product/native_workspace_work.js');
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));
  const suppliedState=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  // Valid upper UAT input may omit its explicitly selected candidate from the
  // caller's read-first list. This is the observed G08 adapter counterexample.
  const originalState=product.constructGovernanceWorkState({...suppliedState.original,workOrders:{...suppliedState.original.workOrders,
    uat:{...suppliedState.original.workOrders.uat,readFirst:suppliedState.original.workOrders.uat.readFirst.filter(p=>p!==suppliedState.original.assessment.candidatePath)}}});
  assert.ok(product.isGovernanceWorkState(originalState));assert.ok(!originalState.original.workOrders.uat.readFirst.includes(originalState.original.assessment.candidatePath));
  const context=await physical.observeWorksiteContext({...f,readRoots:originalState.original.readRoots,maxFiles:originalState.original.maxContextFiles,maxBytes:originalState.original.maxContextBytes});
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),rows=[],invocation={invocationRef:'invocation:test',invocationAdmissionRef:'invocation-admission:test',capabilityGrants:[f.capabilityGrant]};
  const execution={basisRef:'basis:wrapper',invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:test',workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest};
  const root={kind:'basis_admitted',payload:{basisClass:'root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:originalState}};
  const owned={program:library.programs[0],prefix:{},events:rows,execution,environment:{kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,productInstalls:[]},call:{runId:'run:test'},inputValue:null,inputRef:'input:test',inputOrigin:{}};
  let sourceBasis={...execution},invalidated=false;
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  // Controlled admitted occurrence/index premises; all native/C2/assessment
  // values and worksite observations are their actual typed owner constructors.
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation,projectExactExecutionBasisAtPrefix:()=>sourceBasis}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:(_p,key)=>key==='invocation:'+invocation.invocationRef?[root]:rows.filter(e=>key==='payload:resultRef:'+e.payload.resultRef||key==='related:'+e.aggregateId)}:specifier==='./native_worksite_execution.js'?{worksiteCommandSourcesInvalidatedAfter:()=>invalidated,projectNativeWorkspaceWorkSourceAtPrefix:()=>({sourceBasis})}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const synth=(state,purpose,subjectEvidenceRef=null)=>({...state,synthesis:{resultRef:'result:synthesis:'+purpose,resultDigest:product.sha256Canonical(purpose),basis:{inputRef:'input:synthesis',inputDigest:product.sha256Canonical(state),taskRef:state.original.taskRef,environmentRef:'environment:test',environmentDigest:product.sha256Canonical('environment'),frameEvidenceDigest:product.sha256Canonical('frame'),frameRefs:['frame:test'],contextRef:context.observationRef,previousResultRef:state.synthesis?.resultRef??null},judgment:{interpretation:'Supplied work',contributions:[{graphFunctionRef:product.governanceRef('graph-function',purpose),contribution:'Selected work',reason:'Actual evidence',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[],dependsOn:[]}],gaps:[],nextGraphFunctionRef:product.governanceRef('graph-function',purpose),nextReason:'Chosen work',nextEvidenceRefs:[],subjectEvidenceRef,revisionReason:'Current evidence',revisionEvidenceRefs:[]}}});
  const at=(purpose,operation,input)=>{owned.inputValue=input;owned.call.implementationRef=product.governanceRef('implementation',operation);return {graphFunction:library.graphFunctions.find(g=>g.declarations['abg.default_library_purpose']===purpose)};};
  const provenance={cCallRef:'call:native',executionAuthorityRef:'authority:test',executionAuthorityDigest:product.sha256Canonical('authority'),actorInvocationRef:'actor:native',transportBindingRef:'transport:test',transportBindingDigest:product.sha256Canonical('transport'),promptDigest:product.sha256Canonical('prompt'),transportDigest:product.sha256Canonical('transport')};
  const fold=(state,purpose,value)=>{const input=product.constructRetainedGraphInput(state,value),b=at(purpose,'fold',input),event={kind:'c_call_result_admitted',runId:'run:test',basisId:'basis:child',aggregateId:'call:actual:'+purpose+':'+rows.length,admissionOrdinal:rows.length+10,payload:{resultRef:'result:actual:'+purpose+':'+rows.length,resultDigest:product.sha256Canonical(value),resultClass:'success',value}};
    rows.push(event);owned.inputOrigin={retainedProjection:{entryBasis:execution,input:{admissionRef:owned.inputRef,value:input},sourceResult:event}};
    const folded=m.namespace.projectGovernanceFold(b,input);assert.ok(folded,purpose);assert.equal(folded.observations.at(-1).cCallRef,event.aggregateId);assert.equal(folded.observations.at(-1).actorInvocationRef,value.provenance.actorInvocationRef);assert.equal(folded.observations.at(-1).synthesisResultRef,state.synthesis.resultRef);
    const retained=owned.inputOrigin.retainedProjection;owned.inputOrigin={};assert.equal(m.namespace.projectGovernanceFold(b,input),null);owned.inputOrigin={retainedProjection:{...retained,entryBasis:{basisRef:'basis:foreign'}}};assert.equal(m.namespace.projectGovernanceFold(b,input),null);owned.inputOrigin={retainedProjection:retained};return folded;};
  const selectedReads=async(state,producer)=>{
    const order=state.original.workOrders.uat,selected=state.original.assessment,b=at('uat','prepare-native',state);
    const task=await m.namespace.projectGovernanceNativeTask(b,state);assert.ok(nativeOwner.isNativeWorkspaceWorkTask(task));
    const contribution=state.synthesis.judgment.contributions.find(c=>c.graphFunctionRef===b.graphFunction.name);
    assert.notEqual(contribution.contribution,order.outcome);assert.equal(task.outcome,contribution.contribution,'the selected UAT outcome still identifies its work');
    assert.ok(task.instructions.includes('Governing full-original assessment outcome: '+order.outcome));
    assert.ok(task.instructions.includes('Conserved original task: '+state.original.task));
    assert.ok(task.instructions.some(i=>i.includes('all current criteria govern this independent assessment')&&i.includes('preserving every unmet or indeterminate criterion')));
    assert.equal(task.instructions.some(i=>i.includes('return a truthful partial report')||i.startsWith('Supplied purpose outcome (parent context):')),false,'UAT cannot inherit author completion guidance');
    const response=nativeOwner.nativeWorkspaceWorkResponseSchema(task),rendered=nativeOwner.renderNativeWorkspaceWorkOrder(task);
    assert.deepEqual(response,JSON.parse(Buffer.from(state.original.assessment.schemaAsset.bytesBase64,'base64').toString('utf8')));
    assert.equal(response.properties.summary,undefined);assert.equal(response.properties.gaps,undefined);
    assert.ok(rendered.includes('Reacquire full source, actual candidate and rubric independently.'));
    assert.ok(rendered.includes('Return one JSON object matching the exact declared schema'));
    assert.deepEqual(task.readFirst,[...order.readFirst,selected.candidatePath]);assert.deepEqual(task.writeRoots,[]);
    assert.equal(task.assessment.producer.cCallRef,producer.cCallRef);assert.equal(task.assessment.producer.actorInvocationRef,producer.actorInvocationRef);
    assert.equal(m.namespace.governanceResultMatches(b,state,task),true);
    assert.equal(m.namespace.governanceResultMatches(b,state,{...task,readFirst:order.readFirst}),false,'admission rejects omitted selected material');
    const rootInput=root.payload.rawInputValue;
    const variant=readFirst=>({...state,original:{...state.original,workOrders:{...state.original.workOrders,uat:{...order,readFirst}}}});
    // Each variation has its own controlled immutable ingress. These are
    // actual owner projections under index/occurrence premises, not Run proof.
    const presentReads=[selected.candidatePath,...order.readFirst],present=variant(presentReads);
    root.payload.rawInputValue=product.constructGovernanceWorkState(present.original);
    assert.deepEqual((await m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',present),present)).readFirst,presentReads,'already-present paths keep their original positions');
    const selectedOnly=variant([]);root.payload.rawInputValue=product.constructGovernanceWorkState(selectedOnly.original);
    assert.deepEqual((await m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',selectedOnly),selectedOnly)).readFirst,[...selected.sources,selected.candidatePath,selected.rubricPath],'only explicit assessment selections supply missing reads');
    const duplicate=variant([...order.readFirst,order.readFirst[0]]);root.payload.rawInputValue=product.constructGovernanceWorkState(duplicate.original);
    assert.ok(product.isGovernanceWorkState(duplicate));
    await assert.rejects(()=>m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',duplicate),duplicate),/native workspace task requires one bound worksite, context and declared scope/);
    assert.equal(m.namespace.governanceResultMatches(at('uat','prepare-native',duplicate),duplicate,task),false,'original duplicate refusal is retained');
    root.payload.rawInputValue=rootInput;return task;
  };
  // Any actual native capability may supply evidence: construction label is not required.
  const nativeState=synth(originalState,'design');
  nativeState.original={...originalState.original,workOrders:{...originalState.original.workOrders,design:originalState.original.workOrders.construction}};
  // Conserve original definition at this controlled root; do not change live witness.
  root.payload.rawInputValue=product.constructGovernanceWorkState(nativeState.original);
  const task=await m.namespace.projectGovernanceNativeTask(at('design','prepare-native',nativeState),nativeState);assert.ok(task);
  const native=nativeOwner.constructNativeWorkspaceWorkObservation(task,context,{summary:'Existing candidate inspected',gaps:['Parent testing and independent acceptance remain unresolved.']},provenance);
  const nativeFold=fold(nativeState,'design',native),uatFromNative=synth(nativeFold,'uat',nativeFold.observations.at(-1).resultRef);
  assert.deepEqual(nativeFold.original,nativeState.original);assert.deepEqual(nativeFold.unresolvedSupportRefs,nativeState.unresolvedSupportRefs);
  assert.equal(nativeFold.terminal,false);assert.deepEqual(nativeFold.observations.at(-1).value.report,native.report,'truthful partial report is retained without parent satisfaction');
  const nativeAssessmentTask=await selectedReads(uatFromNative,nativeFold.observations.at(-1));
  const nativeAssessment=nativeOwner.constructNativeWorkspaceWorkObservation(nativeAssessmentTask,context,null,{...provenance,cCallRef:'call:native-assessment',actorInvocationRef:'actor:native-assessor'},{kind:'consumer_outcome_assessment',disposition:'unmet',reason:'Controlled native subject judgment',unresolvedCriteria:['behavior']});
  assert.equal(fold(uatFromNative,'uat',nativeAssessment).observations.at(-1).value.disposition,'unmet');
  root.payload.rawInputValue=originalState;
  const testing=synth(originalState,'testing'),commandTask=await m.namespace.projectGovernanceTestingTask(at('testing','prepare-testing',testing),testing);assert.ok(commandTask?.sourceObservedInput);
  const c2=await import('../../build/code/src/product/worksite_command_execution.js'),plan=c2.worksiteCommandExecutionHelperPlan(commandTask,'attempt:test');
  const empty={kind:'worksite_observed_stream',schemaVersion:'5.0.0',encoding:'base64',payload:'',byteLength:0,digest:product.sha256Bytes(Buffer.alloc(0))};
  const literal='\uFEFF[error] exact Ω😀 diagnostic\n*** '+ 'Ω😀'.repeat(2400)+'\n',literalBytes=Buffer.from(literal);
  const bomStream={...empty,payload:literalBytes.toString('base64'),byteLength:literalBytes.length,digest:product.sha256Bytes(literalBytes)};
  const commandResults=commandTask.commands.map(({kind,schemaVersion,expectedReports,...command})=>{const body={...command,exitStatus:7,timedOut:false,processSignal:null,signalSequence:[],terminationConfirmed:true,stdout:bomStream,stderr:empty,reports:[],reportCount:0},digest=product.sha256Canonical(body);return {kind:'worksite_command_result',schemaVersion:'5.0.0',...body,observationRef:'worksite-command-observation://abiogenesis/'+digest.slice(7),observationDigest:digest};});
  const members=commandTask.protectedObservations.map(row=>({kind:'worksite_snapshot_member',schemaVersion:'5.0.0',ordinal:row.ordinal,sourceMemberRef:row.sourceMemberRef,sourceObservationRef:row.observation.observationRef,sourceObservationDigest:row.observation.observationDigest,relativePath:row.subject.relativePath,byteLength:row.observation.byteLength,digest:row.observation.fileDigest})),snapshotDigest=product.sha256Canonical(members);
  const artifact=c2.constructWorksiteExecutionHelperArtifact({task:commandTask,disposition:'success',commandResults,predicateObservations:[],worksiteDelta:[],productDelta:[],snapshotRoot:plan.sandboxRoot,snapshotRef:'worksite-command-snapshot://abiogenesis/'+snapshotDigest.slice(7),snapshotDigest,snapshotMembers:members,protectedBefore:commandTask.protectedObservations.map(r=>r.observation),protectedAfter:commandTask.protectedObservations.map(r=>r.observation)});
  const acknowledgment={kind:'worksite_command_execution_worker_result',schemaVersion:'5.0.0',taskRef:commandTask.taskRef,taskDigest:commandTask.taskDigest,attemptRef:plan.attemptRef,helperArtifactRef:artifact.artifactRef,helperArtifactDigest:artifact.artifactDigest};
  const actor={actorRef:commandTask.workerActorRef,workerBindingRef:commandTask.workerBindingRef,implementationRef:product.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,inputDigest:product.sha256Canonical(commandTask),transportLane:'worker_executes',disposition:'success',toolCallCount:1,toolInvocations:[{kind:'worker_tool_invocation_evidence',schemaVersion:'5.0.0',ordinal:0,toolName:'Bash',toolUseRef:'tool:test',inputDigest:plan.toolInputDigest,inputByteLength:plan.toolInputByteLength}],processRef:'process:test',...provenance,actorInvocationRef:'actor:measurement'};
  const observed=c2.constructWorksiteExecutionObservation(commandTask,acknowledgment,actor,artifact,plan);assert.equal(observed.provenance.cCallRef,undefined,'C2 does not expose invented cCall provenance');
  const measured=fold(testing,'testing',observed);assert.equal(measured.terminal,false);assert.equal(measured.observations.at(-1).value.commandResults[0].exitStatus,7);
  const foldedStream=measured.observations.at(-1).value.commandResults[0].stdout;
  assert.equal(foldedStream.text,literal);assert.equal(Buffer.from(foldedStream.text).equals(literalBytes),true);
  assert.equal(foldedStream.digest,bomStream.digest);assert.equal(foldedStream.byteLength,bomStream.byteLength);
  const planningTask={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:measured,context};
  planningFactCorrespondence(planningTask,product.projectFramedSynthesisPromptTask(planningTask));
  const author=synth(measured,'construction'),authorTask=await m.namespace.projectGovernanceNativeTask(at('construction','prepare-native',author),author);
  const literalContext=JSON.parse(authorTask.instructions.find(i=>i.startsWith('Actual admitted observations: ')).slice('Actual admitted observations: '.length));
  assert.equal(literalContext.at(-1).value.commandResults[0].stdout.text,literal);
  assert.equal(Buffer.from(literalContext.at(-1).value.commandResults[0].stdout.text).equals(literalBytes),true);
  const uat=synth(measured,'uat',measured.observations.at(-1).resultRef),b=at('uat','prepare-native',uat);
  const assessmentTask=await selectedReads(uat,measured.observations.at(-1));assert.equal(assessmentTask.assessment.producer.actorInvocationRef,'actor:measurement');
  at('uat','prepare-native',uat);
  const admitted=m.namespace.governanceResultMatches(b,uat,assessmentTask);assert.equal(admitted,true);
  sourceBasis={...execution,invocationAdmissionRef:'invocation:crossed'};assert.equal(await m.namespace.projectGovernanceNativeTask(b,uat),null);sourceBasis={...execution};
  invalidated=true;assert.equal(await m.namespace.projectGovernanceNativeTask(b,uat),null);invalidated=false;
  const missing=synth(measured,'uat','result:missing');assert.equal(await m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',missing),missing),null);
  const selectedBadTesting=synth(measured,'testing','result:missing');assert.equal(await m.namespace.projectGovernanceTestingTask(at('testing','prepare-testing',selectedBadTesting),selectedBadTesting),null);assert.equal(observedGovernanceTaskMatches(selectedBadTesting,commandTask),false);
  const assessment=nativeOwner.constructNativeWorkspaceWorkObservation(assessmentTask,context,null,{...provenance,cCallRef:'call:assessment',actorInvocationRef:'actor:assessor'},{kind:'consumer_outcome_assessment',disposition:'unmet',reason:'Observed failures',unresolvedCriteria:['behavior']});
  assert.ok(nativeOwner.isNativeWorkspaceWorkObservation(assessment));const assessed=fold(uat,'uat',assessment);assert.equal(assessed.observations.at(-1).value.disposition,'unmet');assert.equal(assessed.terminal,false);
  assert.equal(nativeOwner.isNativeWorkspaceWorkObservation(nativeOwner.constructNativeWorkspaceWorkObservation(assessmentTask,context,null,{...provenance,actorInvocationRef:'actor:measurement'},assessment.assessment)),false,'measurement actor cannot assess itself');

  // One actual folded population exercises schema -> raw binder -> admitted
  // choice -> native/C2 preparation. Occurrence/index authenticity above is a
  // controlled premise; there is no provider, native Run or UAT success claim.
  const population={...assessed,observations:[...nativeFold.observations,...assessed.observations],synthesis:null};
  const framed={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:population,context};assert.ok(product.isFramedSynthesisTask(framed));
  const targets=library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']).map(g=>({graphFunctionRef:g.name,definitionDigest:product.sha256Canonical(g),purpose:g.declarations['abg.default_library_purpose']}));
  const bindBasis=synth(population,'testing').synthesis.basis;
  const {default:Ajv2020}=await import('ajv/dist/2020.js'),validate=new Ajv2020({strict:false}).compile(product.framedSynthesisResponseSchema(framed,targets));
  const nativeRef=nativeFold.observations.at(-1).resultRef,c2Ref=measured.observations.at(-1).resultRef,assessmentRef=assessed.observations.at(-1).resultRef;
  const expected={testing:[nativeRef,null],uat:[nativeRef,c2Ref]};
  assert.deepEqual(product.governanceSubjectEvidenceRefs(population,'testing'),expected.testing);
  assert.deepEqual(product.governanceSubjectEvidenceRefs(population,'uat'),expected.uat);
  const executive=library.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','executive-step'));
  const selectNode=executive.template.nodes.find(n=>n.nodeRef===executive.declarations['abg.framed_synthesis_locus']);
  const projectNode=executive.template.nodes.find(n=>n.nodeRef===executive.declarations['abg.framed_synthesis_projection']);
  owned.graph={template:executive.template};execution.registeredSelectionDefinitionDigests=Object.fromEntries(targets.map(row=>[row.graphFunctionRef,row.definitionDigest]));
  owned.call.graphCallId='graph-call:typed-source';owned.call.outputContractRef=product.governanceContract('choice');
  const projectionBasis={graphFunction:executive,cursor:{currentNodeRef:projectNode.nodeRef,termPath:gtl.rootCSourcePath(projectNode.nodeRef)}};
  const choose=bound=>{
    const event={kind:'c_call_result_admitted',runId:owned.call.runId,basisId:execution.basisRef,graphCallId:owned.call.graphCallId,aggregateId:'call:source-choice',payload:{resultClass:'success',resultRef:'result:source-choice',resultDigest:product.sha256Canonical(bound)}};
    rows.push({kind:'c_call_opened',runId:owned.call.runId,basisId:execution.basisRef,aggregateId:event.aggregateId,payload:{programLocusRef:selectNode.nodeRef}});
    owned.inputValue=bound;owned.inputRef=event.payload.resultRef;owned.inputOrigin={event};owned.call.implementationRef=product.governanceRef('implementation','project-choice');
    const choice=m.namespace.projectGovernanceChoice(projectionBasis,bound);assert.ok(choice);rows.pop();
    assert.deepEqual(choice.input.value.original,population.original);assert.deepEqual(choice.input.value.observations,population.observations);return choice.input.value;
  };
  for(const purpose of ['testing','uat'])for(const subject of [null,nativeRef,c2Ref,assessmentRef,'result:unknown']){
    const raw=synth(population,purpose,subject).synthesis.judgment,eligible=expected[purpose].includes(subject);
    assert.equal(validate(raw),eligible,purpose+' schema '+subject);
    const bound=product.bindFramedSynthesisResult(framed,targets,bindBasis,raw);assert.equal(bound!==null,eligible,purpose+' raw binder '+subject);
    if(!bound)continue;
    const selected=choose(bound),selectedBasis=at(purpose,purpose==='testing'?'prepare-testing':'prepare-native',selected);
    const prepared=purpose==='testing'?await m.namespace.projectGovernanceTestingTask(selectedBasis,selected):await m.namespace.projectGovernanceNativeTask(selectedBasis,selected);
    assert.ok(prepared,purpose+' actual owner preparation '+subject);assert.equal(m.namespace.governanceResultMatches(selectedBasis,selected,prepared),true);
    if(purpose==='testing'){
      assert.equal(prepared.sourceObservedInput!==undefined,subject===null);assert.equal(prepared.sourceNativeWork!==undefined,subject!==null);
      assert.deepEqual(prepared.commands.map(c=>c.commandId),population.original.testing.commands.map(c=>c.commandId));
    }else assert.equal(prepared.assessment.producer.resultRef,subject);
  }
  const incompatible=synth(population,'testing',c2Ref);
  assert.equal(await m.namespace.projectGovernanceTestingTask(at('testing','prepare-testing',incompatible),incompatible),null,'prep shares the same typed-source refusal');
  assert.deepEqual(product.governanceSubjectEvidenceRefs({...population,observations:[...population.observations,nativeFold.observations.at(-1)]},'testing'),[null],'duplicate source identities are never offered');
  assert.deepEqual(product.governanceSubjectEvidenceRefs({...population,observations:[{...nativeFold.observations.at(-1),value:{report:{summary:'malformed'},changedPaths:[]}}]},'testing'),[null]);
});

test('parent conservation joins the pre-Run root basis through exact invocation and root implementation set',async()=>{
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  const invocation={invocationRef:'invocation:root',invocationAdmissionRef:'invocation-admission:root',capabilityGrants:[{}]},root={kind:'basis_admitted',runId:null,payload:{basisClass:'root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:'set:root',rawInputValue:state}},roots=[root];
  const owned={program:{policies:{}},inputValue:state,call:{runId:'run:later-created',implementationRef:product.governanceRef('implementation','evaluate-parent')},execution:{invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:root'},environment:{kind:'exact_prefix_workspace_environment'},prefix:{}};
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:(_p,key)=>key==='invocation:'+invocation.invocationRef?roots:[]}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  assert.deepEqual(m.namespace.projectGovernanceParent({},state),state,'root basis has no Run coordinate yet');
  root.payload.implementationSetRef='set:foreign';assert.equal(m.namespace.projectGovernanceParent({},state),null);root.payload.implementationSetRef='set:root';
  root.payload.invocationAdmissionRef='invocation-admission:foreign';assert.equal(m.namespace.projectGovernanceParent({},state),null);root.payload.invocationAdmissionRef=invocation.invocationAdmissionRef;
  roots.push(root);assert.equal(m.namespace.projectGovernanceParent({},state),null);
});

test('DataMapper caller separates author territories and baseline inputs from future final proof',async()=>{
  const scenarios=await import('../uat/scenarios.mjs'),consumer=await import('../uat/consumer.mjs');
  const {root,rows}=await scenarios.loadScenarios(join(packageRoot,'test_env/fixtures/sandbox-uat'));
  const selected=await scenarios.acquireScenario(root,rows.find(r=>r.key==='data-mapper-full'));
  // Actual acquisition and strict governance owner; the toolchain coordinate
  // is a unit input and no SBT, Scala, actor or application work runs here.
  const state=scenarios.constructWorkloadInput(product,selected,consumer.assessmentSelection,{sbt:{executable:'/unit/sbt',environment:{}}});
  assert.ok(product.isGovernanceWorkState(state));assert.equal(state.terminal,false);
  assert.equal(state.original.task,selected.request.task);assert.deepEqual(state.unresolvedSupportRefs,selected.request.requiredSupportRefs);
  const orders=state.original.workOrders,baseline=state.original.testing.selectedPaths;
  assert.deepEqual(orders.induction.writeRoots,['specification/intent.md']);
  assert.ok(orders.specification.writeRoots.every(p=>p.startsWith('specification/')));
  assert.ok(orders.design.writeRoots.every(p=>p.startsWith('design/')||p==='repair/component-repair-schedule.md'));
  assert.ok(orders.construction.writeRoots.every(p=>!p.startsWith('specification/')&&!p.startsWith('design/')));
  // The original request also reads the separate execution-result projection;
  // that path is not one of its original author-granted artifacts.
  assert.ok(selected.request.readRoots.includes('test-execution-result.json'));
  const finalPaths=selected.request.readRoots.filter(p=>!p.startsWith('source/')&&p!=='test-execution-result.json');
  assert.equal(finalPaths.length,44);assert.deepEqual([...new Set(['induction','specification','design','construction'].flatMap(p=>orders[p].writeRoots))].sort(),[...finalPaths].sort());
  for(const source of state.original.sources)assert.ok(baseline.includes(source.path),'original source remains snapshotted');
  for(const fragment of ['/build.sbt','/project/plugins.sbt','/project/build.properties'])assert.equal(baseline.filter(p=>p.endsWith(fragment)).length,1);
  assert.equal(baseline.filter(p=>p.includes('/src/main/scala/')).length,11);
  assert.equal(baseline.filter(p=>p.includes('/src/test/scala/')).length,8);
  assert.equal(baseline.length,26);
  for(const path of ['depth-proof-map.json','mutation-outcomes.json','release/release-preparation.md','proof/repaired-component-test-execution-qualification.md']){
    assert.ok(finalPaths.includes(path),'future proof remains a final obligation');assert.equal(baseline.includes(path),false,'future output is not an initial command input');
  }
  assert.deepEqual(state.original.testing.commands[0].args,['test']);assert.equal(state.original.testing.commands[0].expectedReports.length,8);
  assert.equal(state.original.testing.outcomePredicates.find(p=>p.predicateKind==='test_pass_count').declaration.greaterThanOrEqual,20);
  assert.deepEqual(state.original.testing.outcomePredicates,selected.request.testing.outcomePredicates);
  assert.deepEqual(state.original.assessment.sources,selected.request.assessment.sources);
  assert.equal(state.original.assessment.candidatePath,'release/release-preparation.md');
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

test('observed command correspondence conserves explicit input across empty and different process environments',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=structuredClone(await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')}));
  state.original.testing.commands[0].environment={PATH_PREFIX:'/selected/bin',DECLARED:'fixed'};
  state.original.testing.commands[1].environment={PATH:'/explicit/bin',LANG:'C'};
  const observedFiles=[];for(const path of state.original.testing.selectedPaths){const subject=physical.constructWorksiteSubject({...f,relativePath:path,subjectUri:pathToFileURL(join(f.canonicalRoot,path)).href});observedFiles.push({subject,observation:await physical.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject)});}
  const command=await import('../../build/code/src/product/worksite_command_execution.js');
  const task=command.constructObservedWorksiteCommandExecutionTask({...f,observedFiles,...product.governanceTestingConfiguration(state)});
  assert.equal(observedGovernanceTaskMatches(state,task),true);
  const child=`import assert from 'node:assert/strict';import {observedGovernanceTaskMatches} from ${JSON.stringify(pathToFileURL(resolve(packageRoot,'build/code/src/abg/default_library.js')).href)};const [state,task]=JSON.parse(process.argv[1]);assert.equal(observedGovernanceTaskMatches(state,task),true);`;
  for(const environment of [{},{PATH:'/different/bin',HOME:'/different-home',LANG:'different',LC_ALL:'different',TMPDIR:'/different-tmp'}])await promisify(execFile)(process.execPath,['--input-type=module','--eval',child,JSON.stringify([state,task])],{env:environment});
  const changed=mutate=>{const value=structuredClone(state);mutate(value.original.testing);assert.equal(observedGovernanceTaskMatches(value,task),false);};
  for(const [key,value]of Object.entries({commandId:'changed',executable:'other',args:['--version'],relativeCwd:'test',timeoutMs:19000,terminationGraceMs:1000,expectedReports:[{reportIdentity:'changed',relativePath:'evidence/report'}]}))changed(t=>t.commands[0][key]=value);
  changed(t=>t.commands[0].environment.DECLARED='changed');changed(t=>t.commands[0].environment.PATH_PREFIX='/other/bin');changed(t=>t.commands[1].environment.PATH='/other/bin');changed(t=>t.commands[1].environment.LANG='changed');changed(t=>t.allowedWriteTerritories[0].relativePath='other-evidence');
  assert.equal(observedGovernanceTaskMatches(state,{...task,taskDigest:product.sha256Canonical('changed')}),false);
  const configuration={workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,...product.governanceTestingConfiguration(state),protectedSubjects:observedFiles.map(r=>r.subject)};
  // The same owner also captures HTTP launch defaults; replay must not reacquire them.
  configuration.outcomePredicates=[{predicateId:'predicate:http',predicateKind:'http_response_exact',declaration:{validationCommandId:state.original.testing.commands[0].commandId,status:200,body:'ok',launch:{executable:'node',args:[product.WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder],relativeCwd:'.',environment:{PATH_PREFIX:'/http/bin',MODE:'fixed'},portFile:{relativePath:'execution-evidence/port'},timeoutMs:1000,terminationGraceMs:100},request:{hostname:'127.0.0.1',method:'GET',path:'/',timeoutMs:500}}}];
  const bound=command.constructWorksiteCommandConfiguration(configuration);assert.equal(command.worksiteCommandConfigurationMatches(configuration,bound),true);
  const wrong=structuredClone(configuration);wrong.outcomePredicates[0].declaration.launch.environment.MODE='changed';assert.equal(command.worksiteCommandConfigurationMatches(wrong,bound),false);
  const predicateChild=`import assert from 'node:assert/strict';import {worksiteCommandConfigurationMatches} from ${JSON.stringify(pathToFileURL(resolve(packageRoot,'build/code/src/product/worksite_command_execution.js')).href)};const [input,bound]=JSON.parse(process.argv[1]);assert.equal(worksiteCommandConfigurationMatches(input,bound),true);`;
  await promisify(execFile)(process.execPath,['--input-type=module','--eval',predicateChild,JSON.stringify([configuration,bound])],{env:{}});
});

test('one installed Public default-library invocation reuses observed files, corrects actual work and independently closes',{skip:process.env.ABI5_DEFAULT_LIBRARY_LIVE!=='1'},async()=>{
  const evidence=process.env.ABI5_DEFAULT_LIBRARY_EVIDENCE_ROOT??await mkdtemp(join(tmpdir(),'abi5-default-library-'));
  await mkdir(evidence,{recursive:true});const save=(n,v)=>writeFile(join(evidence,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
  const selectionPath=join(witnessRoot,'selection.json'),selection=JSON.parse(await readFile(selectionPath,'utf8'));
  assert.equal(await product.sha256File(selectionPath),'sha256:ca439cb9aa144477a6aa1d5956d51a5a2c29c084283e2b028a5b94af74c55dbc');
  const provider=JSON.parse(await readFile(process.env.ABI5_NATIVE_SELECTION_PROVIDER,'utf8'));
  assert.equal(provider.requestedModel,'claude-opus-5-5');assert.equal(provider.requestedEffort,'xhigh');assert.equal(await product.sha256File(provider.executable),provider.sha256);
  await save('provider.json',provider);await save('selection.json',selection);
  const companion=process.env.ABI5_DEFAULT_LIBRARY_SUPPLIED_VALID==='1';
  const frozenArtifact=process.env.ABI5_DEFAULT_LIBRARY_FROZEN_ARTIFACT?JSON.parse(await readFile(process.env.ABI5_DEFAULT_LIBRARY_FROZEN_ARTIFACT,'utf8')):null;
  if(companion)assert.ok(process.env.ABI5_DEFAULT_LIBRARY_VALID_CANDIDATE&&process.env.ABI5_DEFAULT_LIBRARY_CANDIDATE_EVENTS,'companion requires exact observed candidate bytes and their retained source event');
  const accounting={wallMs:{}};let selectedEnvironment;
  const env=await setupInstalledRootCatalog({after:()=>{}},packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,setupAccounting:accounting,...(frozenArtifact?{frozenArtifact}:{}),
    additionalCorePublicationConstructors:constructors,
    prepareAdditionalProducts:async setup=>{
      selectedEnvironment=await libraryEnvironment(setup);
      const archive=frozenArtifact?.artifactPath??join(setup.scratch,'artifacts',(await readdir(join(setup.scratch,'artifacts'))).find(n=>n.endsWith('.tgz')));
      const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(assessmentSchema)+'\n');
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:archive,declarationFactory:g=>libraryConsumerDeclaration(g,library,selectedEnvironment.declaration,companion?{purposes:['testing','uat']}:{}),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('../fixtures/default-library-product/index.mjs',import.meta.url)}],
        schemaAssets:[{path:schemaPath,source:schema,contractId:witnessRef('contract','assessment'),requirementAuthorityRefs:[witnessRef('support','complete-source-outcome')]}]})];
    }});
  const installHost=join(evidence,'frozen-host');await mkdir(join(installHost,'node_modules/@abiogenesis'),{recursive:true});await symlink(env.installedRoot,join(installHost,'node_modules/@abiogenesis/typescript-tenant'));
  await save('frozen-artifact.json',{artifactPath:env.artifactPath,installHost,artifactSha256:await product.sha256File(env.artifactPath)});
  await save('setup.json',{scratch:env.scratch,installedRoots:env.installedRoots,artifactPaths:env.artifactPaths,accounting});
  await save('archive.json',{core:{path:env.artifactPath,sha256:await product.sha256File(env.artifactPath)},consumer:env.additionalProducts[0].basis});
  await copyFile(env.artifactPath,join(evidence,'core.tgz'));await copyFile(env.additionalProducts[0].artifactPath,join(evidence,'consumer.tgz'));
  await save('run-environment.json',selectedEnvironment.declaration);await save('publication.json',env.additionalPublications[0]);
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  const copyStarted=performance.now();await cp(join(witnessRoot,'seed'),worksite,{recursive:true});
  for(const [path,row] of Object.entries(selection.seedFiles))assert.equal(await product.sha256File(join(worksite,path)),'sha256:'+row.sha256);
  await save('seed-copy.json',{wallMs:performance.now()-copyStarted,bytes:Object.values(selection.seedFiles).reduce((n,r)=>n+r.bytes,0),files:selection.seedFiles});
  const caseSelection=structuredClone(selection);
  if(companion){
    const candidate=await readFile(process.env.ABI5_DEFAULT_LIBRARY_VALID_CANDIDATE),sourceEvents=JSON.parse(await readFile(process.env.ABI5_DEFAULT_LIBRARY_CANDIDATE_EVENTS,'utf8'));
    const source=sourceEvents.filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef&&e.payload.resultClass==='success').find(e=>e.payload.value?.after?.entries.some(row=>row.relativePath==='generated/hello-world.mjs'&&row.digest===product.sha256Bytes(candidate)));
    assert.ok(source,'candidate must equal actual observed native output');const member=source.payload.value.after.entries.find(row=>row.relativePath==='generated/hello-world.mjs');
    assert.equal(member.byteLength,candidate.length);assert.deepEqual(Buffer.from(member.bytes,'base64'),candidate);
    await copyFile(process.env.ABI5_DEFAULT_LIBRARY_VALID_CANDIDATE,join(worksite,'generated/hello-world.mjs'));
    const contract=join(witnessRoot,'supplied-work-contract.md');await copyFile(contract,join(worksite,'source/witness-contract.md'));
    caseSelection.applicationWriteRoots=[];
    for(const path of ['generated/hello-world.mjs','source/witness-contract.md']){const bytes=await readFile(join(worksite,path));caseSelection.seedFiles[path]={bytes:bytes.length,sha256:product.sha256Bytes(bytes).slice(7)};}
    await save('supplied-candidate.json',{source:process.env.ABI5_DEFAULT_LIBRARY_VALID_CANDIDATE,digest:member.digest,byteLength:member.byteLength,sourceEventsSha256:await product.sha256File(process.env.ABI5_DEFAULT_LIBRARY_CANDIDATE_EVENTS),sourceEvent:source.eventId,sourceResult:source.payload.resultRef,contract,contractDigest:await product.sha256File(contract),runtimeImport:false});
  }
  await save('case-input-files.json',caseSelection.seedFiles);
  const input=await witnessInput({product,selection:caseSelection,seedRoot:worksite});await save('input.json',input);
  const refs=env.additionalPublications[0].programs[0].callableMembership;
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,refs);assert.equal(env.catalogView.kind,'graph_function_catalog_view',JSON.stringify(env.catalogView));
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),readContracts=await load('abg/project_read_operation_contracts'),storeOwner=await load('abg/event_store');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'default-library',runEnvironmentResourceFactory:selectedEnvironment.resources});
  const closure=env.product.resolveProgramDeclarationClosure(env.catalog,env.catalogView,start.resolution.program.programRef);
  assert.equal(closure.kind,'resolved_program_declaration_closure',JSON.stringify(closure));
  const selectedRefs=['state','selection-task','synthesis','choice','native-response'].map(product.governanceContract);
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
  const physical=await load('product/worksite_operations'),observedInput={workspaceAuthorityBasis:env.workspaceAuthority,workspaceBinding:env.workspaceBinding,capabilityGrant:start.capabilityBasis.capabilityGrants[0],protectedInstallRoots:env.installedRoots,readRoots:input.original.readRoots,maxFiles:input.original.maxContextFiles,maxBytes:input.original.maxContextBytes};
  const context=await physical.observeWorksiteContext(observedInput),protectedScope=await physical.observeWorksiteContext({...observedInput,readRoots:['.']});
  await save('context-readiness.json',{context,protectedScope});assert.equal(context.kind,'worksite_context_observation',JSON.stringify(context));assert.equal(context.entries.length,10);
  assert.ok(input.original.sources.every(s=>context.entries.some(e=>e.relativePath===s.path&&e.digest===s.digest)));
  for(const path of [...input.original.testing.selectedPaths,...Object.values(input.original.workOrders).flatMap(o=>[...o.readFirst,...o.writeRoots]),input.original.assessment.candidatePath,input.original.assessment.rubricPath])assert.ok(context.entries.some(e=>e.relativePath===path));
  assert.notEqual(protectedScope.kind,'worksite_context_observation');assert.ok(!input.original.assessment.sources.includes(input.original.assessment.rubricPath));
  await save('mechanical-readiness.json',{companion,selectionSha256:await product.sha256File(selectionPath),providerSha256:provider.sha256,inputDigest:product.sha256Canonical(input),callableMembership:refs,ready:true});
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
    const started=events.find(e=>e.kind==='actor_invocation_started'&&e.parentAggregateId===binding.parentAggregateId),closed=events.find(e=>['actor_invocation_closed','actor_invocation_failed'].includes(e.kind)&&e.parentAggregateId===binding.parentAggregateId);
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
  assert.ok(commands.length>=(companion?1:2));assert.ok(commands[0].payload.value.task.sourceObservedInput);
  const author=results.find(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef);
  if(companion)assert.equal(author,undefined,'supplied valid work reaches UAT without an author');
  else{assert.ok(commands[0].payload.value.commandResults.some(r=>r.exitStatus!==0));assert.ok(author&&author.admissionOrdinal>commands[0].admissionOrdinal);}
  assert.equal(events.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef&&e.admissionOrdinal<commands[0].admissionOrdinal).length,0);
  assert.ok(new Set(choices.map(e=>e.payload.value.graphFunctionRef)).size>=(companion?2:3));
  const selectedTasks=results.filter(e=>e.payload.value?.kind==='framed_synthesis_task');
  assert.ok(selectedTasks.some(e=>e.admissionOrdinal>commands[0].admissionOrdinal&&JSON.stringify(e.payload.value).includes(commands[0].payload.resultRef)));
  const assessment=results.find(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef);assert.ok(assessment);assert.equal(assessment.payload.value.assessment.disposition,'satisfied');
  assert.notEqual(assessment.payload.value.provenance.actorInvocationRef,(author??commands[0]).payload.value.provenance.actorInvocationRef);
  if(companion){assert.ok(commands.some(e=>assessment.payload.value.task.assessment.producer.resultRef===e.payload.resultRef));assert.equal(events.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef).length,0);}
  const parent=results.filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive'));assert.equal(parent.at(-1).payload.value.terminal,true);assert.ok(parent.slice(0,-1).every(e=>!e.payload.value.terminal));
  assert.ok(parent.at(-1).admissionOrdinal>assessment.admissionOrdinal);assert.equal(events.filter(e=>e.kind==='run_closed').length,1);
  for(const event of parent){assert.deepEqual(event.payload.value.original,input.original);if(!event.payload.value.terminal)assert.deepEqual(event.payload.value.unresolvedSupportRefs,input.unresolvedSupportRefs);}
  for(const path of [...selection.protectedSeedPaths,...(companion?['generated/hello-world.mjs']:[])])assert.equal(await product.sha256File(join(worksite,path)),'sha256:'+caseSelection.seedFiles[path].sha256);
  const final=commands.at(-1).payload.value;assert.ok(final.commandResults.every(r=>r.exitStatus===0));
  assert.equal(Buffer.from(final.commandResults[0].stdout.payload,'base64').toString('utf8'),'Hello, world!\n');
  const testOutput=Buffer.from(final.commandResults[1].stdout.payload,'base64').toString('utf8');assert.match(testOutput,/pass 2/);assert.match(testOutput,/fail 0/);
  const syntheses=results.filter(e=>e.payload.value?.kind==='framed_synthesis_result');assert.equal(syntheses.length,choices.length);
  const correspondence=syntheses.map((e,i)=>{const value=e.payload.value,choice=choices[i],folded=results.find(r=>r.payload.value?.kind==='governance_work_state'&&r.payload.value.observations.at(-1)?.synthesisResultRef===e.payload.resultRef);
    assert.deepEqual(choice.payload.value.reason,value.judgment.nextReason);assert.equal(choice.payload.value.graphFunctionRef,value.judgment.nextGraphFunctionRef);assert.equal(choice.payload.value.input.value.synthesis.resultRef,e.payload.resultRef);assert.deepEqual(choice.payload.value.input.value.synthesis.judgment,value.judgment);
    assert.equal(value.basis.previousResultRef,i===0?null:syntheses[i-1].payload.resultRef);assert.deepEqual(value.state.original,input.original);assert.ok(folded);
    const observation=folded.payload.value.observations.at(-1),child=results.find(r=>r.payload.resultRef===observation.resultRef&&r.aggregateId===observation.cCallRef);assert.ok(child);
    return {synthesisEvent:e.eventId,synthesisOrdinal:e.admissionOrdinal,resultRef:e.payload.resultRef,basis:value.basis,judgment:value.judgment,choiceEvent:choice.eventId,choiceOrdinal:choice.admissionOrdinal,childResultEvent:child.eventId,childResultOrdinal:child.admissionOrdinal,childGraphFunction:child.graphFunctionRef,foldEvent:folded.eventId,foldOrdinal:folded.admissionOrdinal,parentEvent:parent.find(p=>p.admissionOrdinal>folded.admissionOrdinal)?.eventId};});
  await save('synthesis-correspondence.json',correspondence);
  await save('asserted-outcome.json',{companion,choiceRefs:choices.map(e=>e.payload.value.graphFunctionRef),commandResultRefs:commands.map(e=>e.payload.resultRef),assessmentRef:assessment.payload.resultRef,parentRef:parent.at(-1).payload.resultRef});
  for(const memberKey of ['run_result','run_replay']){
    const call=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts:readContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source:receipt.resources.run,eventResource:resource(),identity:`default-library-${memberKey}`});
    const read=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:`default-library-${memberKey}`,acquisition:{kind:'reopen',closeHandoff:handoff},call:call.call,expectedExitCode:0});await save(`read-${memberKey}.json`,read);
    assert.deepEqual(read.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);assert.deepEqual(read.output.receipt.ownerOutput.value.projection.terminalResult,receipt.ownerOutput.value.terminalResult);assert.deepEqual(read.output.receipt.ownerOutput.value.projection.replay,receipt.resources.replay);
  }
});
