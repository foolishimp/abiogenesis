import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import * as product from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import * as native from '../../build/code/src/product/native_workspace_work.js';
import * as c2 from '../../build/code/src/product/worksite_command_execution.js';
import {parseNativeWorkspaceAssessmentResult} from '../../build/code/src/product/native_workspace_assessment.js';
import {loadWorksiteOwner,worksiteFixture} from '../support/t287-generic-job-worksite.mjs';
import {libraryEnvironment,witnessRef} from '../support/default-library.mjs';
import {prepareFulfillmentSeed,fulfillmentWitnessInput,fulfillmentAssessmentSchema,fulfillmentConsumerDeclaration,freshLifecyclePaths} from '../support/default-library-fulfillment.mjs';
const packageRoot=new URL('../..',import.meta.url).pathname,records=new URL('../../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/',import.meta.url).pathname;
const hash=product.sha256Canonical,basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:'5.0.0-rc.1',artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
async function fixture(t){const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const files=await prepareFulfillmentSeed({seedRoot:join(records,'default-library-witness/seed'),caseContractPath:join(records,'s6-witness-contract.md'),destination:f.canonicalRoot});
  const state=fulfillmentWitnessInput({product,files}),observe=()=>physical.observeWorksiteContext({...f,readRoots:state.original.readRoots,maxFiles:128,maxBytes:131072});
  return {...f,physical,files,state,observe};}
const fact=(ref,kind,files,contractRef,commands=[])=>({resultRef:ref,resultDigest:hash(ref),contractRef,cCallRef:'call:'+ref,actorInvocationRef:'actor:'+ref,kind,files,dependencies:files,commands,assessmentContractRef:null,producerResultRef:null,producerActorRef:null});
function positive(d,state,evidence){
  const n=evidence.findLast(e=>e.kind==='native'),c=evidence.findLast(e=>e.kind==='execution'&&e.commands.every(c=>c.exitStatus===0)),red=evidence.find(e=>e.kind==='execution'&&e.commands.some(c=>c.exitStatus!==0));
  return {obligations:product.governanceFulfillmentActive(d,state).map(a=>({obligationRef:a.binding.obligationRef,policyRef:a.binding.proofPolicyRef,shapeRef:a.binding.proofShapeRef,judgment:'satisfied',reason:'Controlled semantic premise; no native judgment qualification.',
    support:a.shape.requiredEvidenceRoles.filter(r=>r!=='semantic_assessment').map(role=>({role,resultRef:role==='realization'&&a.binding.realizationContractRef===product.NATIVE_WORKSPACE_WORK_IDS.observationContractRef?n.resultRef:c.resultRef,
      artifactPath:role==='realization'?(a.binding.realizationContractRef===product.NATIVE_WORKSPACE_WORK_IDS.observationContractRef?freshLifecyclePaths[0]:'generated/hello-world.mjs'):role==='verifier_artifact'?'test/component/hello-cli.test.mjs':null,
      commandId:role==='verifier_execution'?witnessRef('command','1'):null})),adverseEvidenceRefs:a.completeness.adverseCommands.length?[red.resultRef]:[],
    criteria:a.completeness.semanticCriteria.map(criterionRef=>({criterionRef,judgment:'satisfied',reason:'Controlled criterion premise'})),depth:a.completeness.depthClasses.map(c=>({classRef:c.classRef,judgment:'satisfied',reason:'Controlled depth premise',evidenceRefs:[c.resultRef].filter(Boolean)}))})),
    discoveries:d.discoveryClasses.map(c=>({classRef:c.classRef,judgment:'satisfied',reason:'Controlled complete-discovery premise',evidenceRefs:[n.resultRef]}))};
}
test('prospective installed declaration uses immutable schema and exact original source; later domains do not change bytes',async t=>{
  const f=await fixture(t),d=f.state.original.fulfillment,context=await f.observe();
  assert.equal(product.sha256Bytes(f.files['source/witness-contract.md']),'sha256:f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b');
  assert.ok(product.governanceFulfillmentSourceMatches(d,context));
  for(const path of freshLifecyclePaths)assert.equal(context.entries.find(e=>e.relativePath===path)?.state,'absent');
  const pubs=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'].map(n=>gtl[n](basis)),env=await libraryEnvironment({gtl,product});
  const data=fulfillmentConsumerDeclaration({gtl,product,library:pubs[0],runEnvironment:env.declaration});
  const consumer=gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...data,artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,productManifestDigest:basis.productManifestDigest,contributions:data.contributions.map(c=>({...c,provenanceRefs:[basis.artifactDigest]}))});
  const raw=(value,kind)=>{const result=validator.rawAdmitValue(value,kind,'contract:fixture');assert.equal(result.kind,'raw_admitted_value',JSON.stringify(result));return result;};
  const publications=[...pubs,consumer],unique=(key,values)=>[...new Map(values.map(v=>[v[key],v])).values()],admittedPub=raw(consumer,'module_publication');
  const validation=validator.validateProgram({declarationBasisDigest:admittedPub.subjectDigest,programPublication:admittedPub,program:raw(consumer.programs[0],'gtl_program'),
    graphFunctions:unique('name',publications.flatMap(p=>p.graphFunctions)).map(v=>raw(v,'graph_function')),
    contracts:unique('contractRef',publications.flatMap(p=>p.contracts)).map(v=>raw(v,'contract_declaration')),
    evaluators:unique('name',publications.flatMap(p=>p.evaluators)),rules:unique('name',publications.flatMap(p=>p.rules)),
    implementationBindings:unique('bindingRef',publications.flatMap(p=>p.implementationBindings)).map(v=>raw(v,'implementation_binding')),
    closureContracts:unique('closureContractRef',publications.flatMap(p=>p.closureContracts)).map(v=>raw(v,'closure_contract'))});
  assert.equal(validation.kind,'program_validation',JSON.stringify(validation));
  const lookup=ref=>[...pubs,consumer].flatMap(p=>p.contracts).find(c=>c.contractRef===ref)??null;
  assert.ok(product.governanceFulfillmentContractsMatch(d,lookup));assert.equal(product.governanceFulfillmentContractsMatch(d,()=>null),false);
  assert.equal(product.governanceFulfillmentSelection(consumer.programs[0],f.state.original),'selected');assert.equal(product.governanceFulfillmentSelection({policies:{}},f.state.original),'invalid');
  const {fulfillment,...ordinary}=f.state.original;assert.equal(product.governanceFulfillmentSelection({policies:{}},ordinary),'absent');assert.equal(product.governanceFulfillmentSelection(consumer.programs[0],ordinary),'invalid');
  const schemaBytes=JSON.stringify(fulfillmentAssessmentSchema(product)),p={candidateRef:'candidate:later',classRef:d.discoveryClasses[0].classRef,meaning:'Additional source-grounded coverage',reason:'Observed need',sourceQuotes:[{memberRef:d.context.members[0].memberRef,quote:'sdlcComplianceScenario'}],predecessorRequirementRefs:[d.terms[0].requirementRef],evidenceRefs:['result:later']};
  const next=product.deriveGovernanceObligations(d,f.state.fulfillment,[p],f.state.original.taskRef,'result:synthesis',context,['result:later']);assert.ok(next);assert.equal(next.additions.length,1);assert.equal(next.coverage.length,d.bindings.length+1);
  assert.deepEqual(product.deriveGovernanceObligations(d,next,[p],f.state.original.taskRef,'result:repeated',context,['result:later']),next);
  assert.equal(product.deriveGovernanceObligations(d,next,[{...p,meaning:'Changed identity'}],f.state.original.taskRef,'result:new',context,['result:later']),null);
  assert.equal(product.deriveGovernanceObligations(d,f.state.fulfillment,[{...p,sourceQuotes:[{...p.sourceQuotes[0],quote:'not actually in the source'}]}],f.state.original.taskRef,'result:new',context,['result:later']),null);
  assert.equal(JSON.stringify(fulfillmentAssessmentSchema(product)),schemaBytes);
  assert.ok(!schemaBytes.includes(next.additions[0].binding.obligationRef),'dynamic identities are not schema enums');
  const laterFact=fact('result:later','native',[],product.NATIVE_WORKSPACE_WORK_IDS.observationContractRef);
  const open={kind:'consumer_outcome_assessment',disposition:'unmet',reason:'Later requirement remains open',unresolvedCriteria:['later requirement'],fulfillment:{
    obligations:product.governanceFulfillmentActive(d,next).map(a=>({obligationRef:a.binding.obligationRef,policyRef:a.binding.proofPolicyRef,shapeRef:a.binding.proofShapeRef,judgment:'indeterminate',reason:'No sufficient support yet',support:[],adverseEvidenceRefs:[],criteria:a.completeness.semanticCriteria.map(criterionRef=>({criterionRef,judgment:'indeterminate',reason:'Open'})),depth:a.completeness.depthClasses.map(c=>({classRef:c.classRef,judgment:'indeterminate',reason:'Open',evidenceRefs:['result:later']}))})),discoveries:d.discoveryClasses.map(c=>({classRef:c.classRef,judgment:'indeterminate',reason:'Open',evidenceRefs:['result:later']}))}};
  const parsed=parseNativeWorkspaceAssessmentResult(JSON.parse(schemaBytes),JSON.stringify(open));assert.ok(parsed,'the unchanged actual installed assessment parser accepts later identities');
  assert.ok(product.bindGovernanceFulfillmentAssessment(d,next,parsed.fulfillment,[laterFact]));
  assert.equal(product.bindGovernanceFulfillmentAssessment(d,f.state.fulfillment,parsed.fulfillment,[laterFact]),null,'same schema, wrong admitted obligation domain refuses');
  assert.equal(product.bindGovernanceFulfillmentAssessment(d,next,parsed.fulfillment,[]),null,'same schema, unknown later evidence refuses');

});
test('pure projection separates historical adverse evidence, current roles, policy completeness and later obligations',async t=>{
  const f=await fixture(t),d=f.state.original.fulfillment;
  const files=[{path:'generated/hello-world.mjs',digest:hash('corrected')},{path:'test/component/hello-cli.test.mjs',digest:hash('verifier')},...freshLifecyclePaths.map(path=>({path,digest:hash(path)}))];
  const n=fact('result:author','native',files,product.NATIVE_WORKSPACE_WORK_IDS.observationContractRef),c=fact('result:current','execution',files,product.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,[{commandId:witnessRef('command','1'),exitStatus:0,timedOut:false}]);
  const red=fact('result:baseline','execution',[{...files[0],digest:hash('old faulty')}],c.contractRef,[{commandId:witnessRef('command','1'),exitStatus:1,timedOut:false}]);
  const evidence=[red,n,c],raw=positive(d,f.state.fulfillment,evidence),assessment={...fact('result:assessment','assessment',files,n.contractRef),assessmentContractRef:d.assessmentContractRef,producerResultRef:c.resultRef,producerActorRef:c.actorInvocationRef};
  const bound=product.bindGovernanceFulfillmentAssessment(d,f.state.fulfillment,raw,evidence);assert.ok(bound);assert.deepEqual(bound,raw);
  const project=value=>product.projectGovernanceFulfillment(d,f.state.fulfillment,value,assessment,evidence);
  const covered=project(bound);assert.ok(covered.coverage.every(r=>r.disposition==='eligible'),JSON.stringify(covered));assert.ok(covered.coverage.every(r=>r.assessmentResultRef===assessment.resultRef));
  assert.ok(covered.coverage.find(r=>r.obligationRef===witnessRef('obligation','revision')).supportResultRefs.includes(red.resultRef));
  for(const mutate of [x=>x.obligations.pop(),x=>x.obligations.push(x.obligations[0]),x=>x.obligations[0].support[0].resultRef='result:foreign',x=>x.obligations[0].support[0].digest=hash('model-hash'),x=>x.obligations[0].support.push({role:'semantic_assessment',resultRef:'future:self',artifactPath:null,commandId:null})]){const bad=structuredClone(raw);mutate(bad);assert.equal(product.bindGovernanceFulfillmentAssessment(d,f.state.fulfillment,bad,evidence),null);}
  const negative=structuredClone(raw);negative.obligations[0].judgment='indeterminate';assert.ok(product.bindGovernanceFulfillmentAssessment(d,f.state.fulfillment,negative,evidence));assert.equal(project(negative).coverage[0].disposition,'open');
  const sameRoles=structuredClone(raw);sameRoles.obligations[0].support.find(s=>s.role==='verifier_artifact').artifactPath='generated/hello-world.mjs';assert.ok(project(sameRoles).coverage[0].gaps.includes('roles_not_distinct'));
  const wrongContract=structuredClone(evidence);wrongContract[2].contractRef='contract:wrong';assert.ok(product.projectGovernanceFulfillment(d,f.state.fulfillment,raw,assessment,wrongContract).coverage[0].gaps.includes('realization_pair_missing'));
  const stale=product.invalidateGovernanceFulfillment(covered,[{...files[0],digest:hash('later edit')}],['generated/hello-world.mjs']);assert.equal(stale.coverage[0].disposition,'stale');assert.equal(stale.coverage[1].disposition,'eligible');
  const unsupported=structuredClone(d);unsupported.completeness[0].strengthRuleRef='rule:unknown';assert.ok(product.projectGovernanceFulfillment(unsupported,f.state.fulfillment,raw,assessment,evidence).coverage[0].gaps.includes('unsupported_strength_rule'));
  const missingAdverse=structuredClone(raw);missingAdverse.obligations.find(r=>r.obligationRef===witnessRef('obligation','revision')).adverseEvidenceRefs=[];assert.ok(project(missingAdverse).coverage.at(-1).gaps.includes('adverse_evidence_missing'));
  const independent={...assessment,actorInvocationRef:c.actorInvocationRef};assert.ok(product.projectGovernanceFulfillment(d,f.state.fulfillment,raw,independent,evidence).coverage[0].gaps.includes('independent_assessment_missing'));
});

async function controlledOwner(f){
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),program={...library.programs[0],policies:{...library.programs[0].policies,'abg.default_library_fulfillment':product.GOVERNANCE_FULFILLMENT_PROFILE}};
  const rows=[],invocation={invocationRef:'invocation:fulfillment',invocationAdmissionRef:'admission:fulfillment',capabilityGrants:[f.capabilityGrant]},execution={basisRef:'basis:wrapper',invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:fulfillment',workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest};
  const root={kind:'basis_admitted',payload:{basisClass:'root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:f.state}};
  const owned={program,prefix:{},events:rows,execution,environment:{kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,productInstalls:[]},call:{runId:'run:fulfillment'},inputValue:null,inputRef:'input:fulfillment',inputOrigin:{}};
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  // Exact ingress/closed occurrence is the controlled premise. Real child,
  // task, observation, retained input and owner projectors run below. No live
  // model, installed traversal or semantic adequacy is claimed by these tests.
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation,projectExactExecutionBasisAtPrefix:()=>execution}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:(_p,key)=>key==='invocation:'+invocation.invocationRef?[root]:rows.filter(e=>key==='payload:resultRef:'+e.payload.resultRef||key==='related:'+e.aggregateId)}:specifier==='./native_worksite_execution.js'?{worksiteCommandSourcesInvalidatedAfter:()=>false,projectNativeWorkspaceWorkSourceAtPrefix:()=>({sourceBasis:execution})}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const at=(purpose,operation,input)=>{owned.inputValue=input;owned.call.implementationRef=product.governanceRef('implementation',operation);return {graphFunction:library.graphFunctions.find(g=>g.declarations['abg.default_library_purpose']===purpose)};};
  return {m,owned,rows,execution,root,library,at};
}
function synthesis(state,purpose,context,subjectEvidenceRef=null){return {...state,synthesis:{resultRef:'result:synthesis:'+purpose,resultDigest:hash(purpose),basis:{inputRef:'input:synthesis',inputDigest:hash(state),taskRef:state.original.taskRef,environmentRef:'environment:test',environmentDigest:hash('environment'),frameEvidenceDigest:hash('frame'),frameRefs:['frame:test'],contextRef:context.observationRef,previousResultRef:state.synthesis?.resultRef??null},judgment:{interpretation:'Controlled semantic premise',contributions:[{graphFunctionRef:product.governanceRef('graph-function',purpose),contribution:'Selected work',reason:'Actual evidence',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[],dependsOn:[]}],gaps:[],nextGraphFunctionRef:product.governanceRef('graph-function',purpose),nextReason:'Chosen work',nextEvidenceRefs:[],subjectEvidenceRef,revisionReason:'Current evidence',revisionEvidenceRefs:[],requirementProposals:[]}}};}
const provenance=name=>({cCallRef:'call:'+name,executionAuthorityRef:'authority:test',executionAuthorityDigest:hash('authority'),actorInvocationRef:'actor:'+name,transportBindingRef:'transport:test',transportBindingDigest:hash('transport'),promptDigest:hash('prompt'),transportDigest:hash('transport')});
function observedCommand(task,status){
  const plan=c2.worksiteCommandExecutionHelperPlan(task,'attempt:'+status),empty={kind:'worksite_observed_stream',schemaVersion:'5.0.0',encoding:'base64',payload:'',byteLength:0,digest:product.sha256Bytes(Buffer.alloc(0))};
  const commandResults=task.commands.map(({kind,schemaVersion,expectedReports,...command})=>{const body={...command,exitStatus:status,timedOut:false,processSignal:null,signalSequence:[],terminationConfirmed:true,stdout:empty,stderr:empty,reports:[],reportCount:0},digest=hash(body);return {kind:'worksite_command_result',schemaVersion:'5.0.0',...body,observationRef:'worksite-command-observation://abiogenesis/'+digest.slice(7),observationDigest:digest};});
  const members=task.protectedObservations.map(row=>({kind:'worksite_snapshot_member',schemaVersion:'5.0.0',ordinal:row.ordinal,sourceMemberRef:row.sourceMemberRef,sourceObservationRef:row.observation.observationRef,sourceObservationDigest:row.observation.observationDigest,relativePath:row.subject.relativePath,byteLength:row.observation.byteLength,digest:row.observation.fileDigest})),snapshotDigest=hash(members);
  const artifact=c2.constructWorksiteExecutionHelperArtifact({task,disposition:'success',commandResults,predicateObservations:[],worksiteDelta:[],productDelta:[],snapshotRoot:plan.sandboxRoot,snapshotRef:'worksite-command-snapshot://abiogenesis/'+snapshotDigest.slice(7),snapshotDigest,snapshotMembers:members,protectedBefore:task.protectedObservations.map(r=>r.observation),protectedAfter:task.protectedObservations.map(r=>r.observation)});
  const acknowledgment={kind:'worksite_command_execution_worker_result',schemaVersion:'5.0.0',taskRef:task.taskRef,taskDigest:task.taskDigest,attemptRef:plan.attemptRef,helperArtifactRef:artifact.artifactRef,helperArtifactDigest:artifact.artifactDigest};
  return c2.constructWorksiteExecutionObservation(task,acknowledgment,{actorRef:task.workerActorRef,workerBindingRef:task.workerBindingRef,implementationRef:product.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,inputDigest:hash(task),transportLane:'worker_executes',disposition:'success',toolCallCount:1,toolInvocations:[{kind:'worker_tool_invocation_evidence',schemaVersion:'5.0.0',ordinal:0,toolName:'Bash',toolUseRef:'tool:test',inputDigest:plan.toolInputDigest,inputByteLength:plan.toolInputByteLength}],processRef:'process:test',...provenance('command-'+status)},artifact,plan);
}
test('real task/child carriers and retained fold attach assessment provenance before the parent consumes coverage',async t=>{
  const f=await fixture(t),o=await controlledOwner(f),first=await f.observe();
  const fold=(state,purpose,source)=>{const input=product.constructRetainedGraphInput(state,source),b=o.at(purpose,'fold',input),n=o.rows.length,event={kind:'c_call_result_admitted',runId:'run:fulfillment',basisId:'basis:child',aggregateId:'call:actual:'+n,admissionOrdinal:n+10,payload:{resultRef:'result:actual:'+n,resultDigest:hash({n,source}),valueDigest:hash(source),contractRef:purpose==='testing'?product.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef:product.NATIVE_WORKSPACE_WORK_IDS.observationContractRef,resultClass:'success',value:source}};
    o.rows.push(event);o.owned.inputOrigin={retainedProjection:{entryBasis:o.execution,input:{admissionRef:o.owned.inputRef,value:input},sourceResult:event}};const result=o.m.namespace.projectGovernanceFold(b,input);assert.ok(result,purpose);assert.equal(result.observations.at(-1).fulfillmentEvidence.cCallRef,event.aggregateId);return result;};
  const testing=synthesis(f.state,'testing',first),task=await o.m.namespace.projectGovernanceTestingTask(o.at('testing','prepare-testing',testing),testing);assert.ok(task.sourceObservedInput);
  const red=fold(testing,'testing',observedCommand(task,1));assert.equal(red.observations.at(-1).fulfillmentEvidence.kind,'execution');
  const premature=synthesis(red,'uat',first,red.observations.at(-1).resultRef);await assert.rejects(()=>o.m.namespace.projectGovernanceNativeTask(o.at('uat','prepare-native',premature),premature),/assessment file missing/);
  // Physical asset bytes here are a disclosed component fixture, not the S6 run.
  const designed=synthesis(red,'design',first),nativeTask=await o.m.namespace.projectGovernanceNativeTask(o.at('design','prepare-native',designed),designed);
  for(const path of freshLifecyclePaths.slice(1)){await mkdir(dirname(join(f.canonicalRoot,path)),{recursive:true});await writeFile(join(f.canonicalRoot,path),'controlled asset '+path+'\n');}
  let state=fold(designed,'design',native.constructNativeWorkspaceWorkObservation(nativeTask,await f.observe(),{summary:'Component asset author',gaps:[]},provenance('design')));
  const specified=synthesis(state,'specification',await f.observe()),specTask=await o.m.namespace.projectGovernanceNativeTask(o.at('specification','prepare-native',specified),specified);await mkdir(join(f.canonicalRoot,'specification'),{recursive:true});await writeFile(join(f.canonicalRoot,freshLifecyclePaths[0]),'controlled conformance\n');
  state=fold(specified,'specification',native.constructNativeWorkspaceWorkObservation(specTask,await f.observe(),{summary:'Component conformance',gaps:[]},provenance('specification')));
  const greenState=synthesis(state,'testing',await f.observe()),greenTask=await o.m.namespace.projectGovernanceTestingTask(o.at('testing','prepare-testing',greenState),greenState);state=fold(greenState,'testing',observedCommand(greenTask,0));
  const uat=synthesis(state,'uat',await f.observe(),state.observations.at(-1).resultRef),assessmentTask=await o.m.namespace.projectGovernanceNativeTask(o.at('uat','prepare-native',uat),uat);assert.ok(assessmentTask);
  assert.equal(assessmentTask.assessment.producer.cCallRef,state.observations.at(-1).cCallRef);assert.ok(assessmentTask.instructions.some(s=>s.includes('Do not emit digests')));
  const evidence=uat.observations.map(o=>o.fulfillmentEvidence),raw={kind:'consumer_outcome_assessment',disposition:'satisfied',reason:'Controlled semantic premise only',unresolvedCriteria:[],fulfillment:positive(uat.original.fulfillment,uat.fulfillment,evidence)};
  const source=native.constructNativeWorkspaceWorkObservation(assessmentTask,await f.observe(),null,provenance('independent-assessor'),raw);
  assert.ok(native.isNativeWorkspaceWorkObservation(source));const assessed=fold(uat,'uat',source),actual=assessed.observations.at(-1);
  assert.ok(assessed.fulfillment.coverage.every(r=>r.assessmentResultRef===actual.resultRef));assert.ok(!JSON.stringify(raw).includes(actual.resultRef));
  o.at('uat','evaluate-parent',assessed);assert.equal(o.m.namespace.projectGovernanceParent({},assessed).terminal,true);
  const bad=structuredClone(raw);bad.fulfillment.obligations[0].judgment='indeterminate';const negative=native.constructNativeWorkspaceWorkObservation(assessmentTask,await f.observe(),null,provenance('another-assessor'),bad),unmet=fold(uat,'uat',negative);o.at('uat','evaluate-parent',unmet);assert.equal(o.m.namespace.projectGovernanceParent({},unmet).terminal,false);
  assert.ok(unmet.unresolvedSupportRefs.includes(uat.original.fulfillment.bindings[0].obligationRef));
});

test('selected-profile hook and persisted assembly conserve admitted additions through selected and gap projection',async t=>{
  const f=await fixture(t),o=await controlledOwner(f),context=await f.observe(),graph=o.library.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','executive-step'));
  const node=graph.template.nodes.find(n=>n.nodeRef===graph.declarations['abg.framed_synthesis_locus']),projection=graph.template.nodes.find(n=>n.nodeRef===graph.declarations['abg.framed_synthesis_projection']),role=o.library.runEnvironments[0].roles.find(r=>r.role==='selector');
  const targets=o.library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']),task={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:f.state,context};
  Object.assign(o.execution,{programRef:o.owned.program.programRef,basisDigest:hash('basis'),registeredSelectionDefinitionDigests:Object.fromEntries(targets.map(g=>[g.name,hash(g)]))});
  Object.assign(o.owned,{graph:{template:graph.template},inputValue:task,inputRef:'result:prepared',inputDigest:hash(task)});
  Object.assign(o.owned.call,{regime:'F_P',cCallRef:'call:selector',cCallDigest:hash('call'),graphCallId:'graph-call:fulfillment',graphFunctionRef:graph.name,programLocusRef:node.nodeRef,inputContractRef:node.term.inputCarrierRef,outputContractRef:node.term.outputCarrierRef,implementationRef:product.governanceRef('implementation','select')});
  const publication={...o.library,programs:[o.owned.program]},candidate={publication,graphFunction:graph,declarationGraphFunctions:o.library.graphFunctions,executionBasis:o.execution,cCall:o.owned.call,cursor:{currentNodeRef:node.nodeRef,termPath:gtl.rootCSourcePath(node.nodeRef)},predecessorPrefix:{}};
  const file=resolve(packageRoot,'build/code/src/abg/instruction_assembly.js');
  const load=async()=>{const m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href),replacements=specifier==='./execution_basis.js'?{authenticateNativeInstructionAssemblyBasis:()=>o.owned}:specifier==='./stdo_environment.js'?{projectRunEnvironmentRoleEvidence:()=>({...role,invocationAdmissionRef:o.execution.invocationAdmissionRef,environmentRef:'environment:fulfillment',environmentDigest:hash('environment'),evidenceDigest:hash('evidence'),contextPolicyDigest:hash(role.contextPolicy),sourceContent:[],accessContent:[]})}:{};const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();return m;};
  const pubs=[publication,gtl.constructNativeWorkspaceWorkModulePublication(basis),gtl.constructWorksiteCommandExecutionModulePublication(basis)];
  const lookup=ref=>pubs.flatMap(p=>p.contracts).find(c=>c.contractRef===ref)??(ref===f.state.original.assessment.resultContract.contractRef?f.state.original.assessment.resultContract:null);
  const assemblyOwner=await load(),assembly=assemblyOwner.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,task,lookup);assert.equal(assembly.kind,'native_instruction_assembly',JSON.stringify(assembly));
  assert.ok(assembly.request.responseJsonSchema.required.includes('requirementProposals'));
  assert.ok(assembly.request.prompt.includes(f.state.original.fulfillment.bindings[0].obligationRef));
  const target=targets.find(g=>g.declarations['abg.default_library_purpose']==='testing'),d=f.state.original.fulfillment;
  const raw={interpretation:'Controlled current judgment',contributions:[{graphFunctionRef:target.name,contribution:'Measure',reason:'No current evidence',supportRefs:f.state.unresolvedSupportRefs,evidenceRefs:[context.observationRef],dependsOn:[]}],gaps:[],nextGraphFunctionRef:target.name,nextReason:'Current choice',nextEvidenceRefs:[context.observationRef],subjectEvidenceRef:null,revisionReason:'Initial',revisionEvidenceRefs:[],requirementProposals:[{candidateRef:'candidate:after-start',classRef:d.discoveryClasses[0].classRef,meaning:'Additional source obligation',reason:'Current source interpretation',sourceQuotes:[{memberRef:d.context.members[0].memberRef,quote:'sdlcComplianceScenario'}],predecessorRequirementRefs:[d.terms[0].requirementRef],evidenceRefs:[context.observationRef]}]};
  const hook=await import('../../build/code/src/implementation/default_library.js'),port=await import('../../build/code/src/implementation/leaf_invocation_port.js');
  const prepared=await port.invokeLeafOwnerBoundary({resolution:hook.GOVERNANCE_SELECTOR_DESCRIPTOR,value:task,inputDigest:hash(task),failureValueKind:'governance_failure',verifyAuthority:()=>true,validateSuccess:product.isFramedSynthesisResult,resolveWorkerContracts:()=>({instructionContractRef:o.owned.call.inputContractRef,resultContractRef:graph.declarations['abg.raw_result_contract']}),occurrence:{cCallRef:'call:selector',runId:o.owned.call.runId,graphCallId:o.owned.call.graphCallId,frameId:'frame:test',programLocusRef:node.nodeRef,taskOrdinal:null,attempt:0,executionAuthority:null},contractByRef:lookup,loadImplementation:async()=>(value,occurrence)=>hook.selectGovernanceWork(value,occurrence,()=>assembly)});
  assert.equal(prepared.kind,'prepared_probabilistic_leaf_owner_invocation',JSON.stringify(prepared));
  const bind=raw=>product.bindFramedSynthesisResult(task,assembly.envelope.targetBindings,assembly.envelope.boundBasis,raw),bound=bind(raw);assert.ok(bound);
  const observation={disposition:'success',toolCallCount:0,finalOutput:JSON.stringify(raw),inputDigest:hash(task),implementationRef:o.owned.call.implementationRef};
  assert.ok(assemblyOwner.namespace.framedSynthesisInstructionResultMatches(candidate,task,bound,observation,lookup));
  // Reconstruct with a fresh assembly owner from persisted JSON; no retained cache premise.
  const cold=await load(),persisted=JSON.parse(JSON.stringify(assembly));assert.deepEqual(cold.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,task,lookup),persisted);
  assert.ok(cold.namespace.framedSynthesisInstructionResultMatches(candidate,task,bound,observation,lookup));
  const origin={kind:'c_call_result_admitted',runId:o.owned.call.runId,basisId:o.execution.basisRef,graphCallId:o.owned.call.graphCallId,aggregateId:'call:selector',payload:{resultClass:'success',resultRef:'result:selector',resultDigest:hash(bound),valueDigest:hash(bound),value:bound}};
  const inputEvent={kind:'c_call_result_admitted',runId:o.owned.call.runId,basisId:o.execution.basisRef,aggregateId:'call:prepare',payload:{resultClass:'success',resultRef:'result:prepared',resultDigest:hash('prepared-result'),valueDigest:hash(task),value:task}};
  o.rows.push(inputEvent,{kind:'c_call_opened',runId:o.owned.call.runId,basisId:o.execution.basisRef,aggregateId:'call:selector',payload:{programLocusRef:node.nodeRef}});
  Object.assign(o.owned,{inputValue:bound,inputRef:origin.payload.resultRef,inputOrigin:{event:origin}});Object.assign(o.owned.call,{implementationRef:product.governanceRef('implementation','project-choice'),outputContractRef:product.governanceContract('choice')});
  const projectionBasis={graphFunction:graph,cursor:{currentNodeRef:projection.nodeRef,termPath:gtl.rootCSourcePath(projection.nodeRef)}},choice=o.m.namespace.projectGovernanceChoice(projectionBasis,bound);assert.ok(choice);assert.equal(choice.disposition,'selected');
  const next=choice.input.value;assert.equal(next.fulfillment.additions.length,1);const added=next.fulfillment.additions[0];assert.equal(added.introducedByResultRef,origin.payload.resultRef);assert.ok(next.unresolvedSupportRefs.includes(added.binding.obligationRef));assert.deepEqual(next.original,f.state.original);
  const gap=bind({...raw,contributions:[],nextGraphFunctionRef:null,gaps:[{supportRefs:f.state.unresolvedSupportRefs,reason:'No currently suitable work',evidenceRefs:[context.observationRef]}]});assert.ok(gap);o.owned.inputValue=gap;origin.payload.value=gap;origin.payload.valueDigest=hash(gap);origin.payload.resultDigest=hash(gap);
  const projectedGap=o.m.namespace.projectGovernanceChoice(projectionBasis,gap);assert.equal(projectedGap.disposition,'gap');assert.ok(projectedGap.missingSupportRefs.includes(added.binding.obligationRef));assert.ok(projectedGap.evidenceRefs.includes(origin.payload.resultRef));assert.deepEqual(origin.payload.value.judgment.requirementProposals,raw.requirementProposals);
  inputEvent.basisId='basis:foreign';assert.equal(o.m.namespace.projectGovernanceChoice(projectionBasis,gap),null);inputEvent.basisId=o.execution.basisRef;
  inputEvent.payload.valueDigest=hash('different');assert.equal(o.m.namespace.projectGovernanceChoice(projectionBasis,gap),null);
});
