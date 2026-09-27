import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as product from '@abiogenesis/typescript-tenant/product';
import * as gtl from '@abiogenesis/typescript-tenant/gtl';
import * as validator from '@abiogenesis/typescript-tenant/validator';
import {constructAbgHistoricalDeclarationReference} from '@abiogenesis/typescript-tenant/abg';
import {constructLifecycleProgram,constructProgramConstructionLibrary,selectLifecycleWork,projectNativeSource} from '../src/program-construction.mjs';
import {ids,stages,constructionStages,preservedConstructionStages,dependencyKind} from '../src/program-construction-contracts.mjs';
import {isConstructionInput,isNativeConstructionInput,constructNativeConstructionInput,constructionState,isConstructionState,nativeConstructionTask,constructionOutput,
  authenticSource,reacquisitionRequest,evaluationInput,constructedEvaluationInput,evaluationOutput,isEvaluationState,
  constructionAssessmentInput,constructionAssessmentTask,constructionAssessmentOutput,assessmentEvidence,isAssessmentInput,
  constructPreservedConstructionInput,isPreservedConstructionInput,authenticPreservedConstruction,PROGRAM_CONSTRUCTION_SEMANTICS} from '../src/program-construction-runtime.mjs';
import {rawContract as assessmentResultContract,ASSESSMENT_SCHEMA_TEXT} from '../src/native-continuation-contracts.mjs';
import {programConstructionPackageInputs} from '../scripts/build-native-continuation-product.mjs';
import {constructOddGlcProductPackage} from '../src/product-package.mjs';
import {loadNative44Fixture,constructNative44Candidate} from './fixtures/program-construction/native44-input.mjs';
import {evaluatorPublication,deriveNativeRecords,evaluateNativeRecords,EVALUATOR_SEMANTICS,fixtureIds} from './fixtures/program-construction/native-records-evaluator.mjs';
import {checkInstalledConstructionTopology} from './abi5-installed-program-construction.test.mjs';
const hash=product.sha256Canonical,z='sha256:'+'0'.repeat(64),version='5.0.0';
const artifact={productId:product.ABI5_PRODUCT_ID,packageName:product.ABI5_PACKAGE_NAME,packageVersion:product.ABI5_PACKAGE_VERSION,
  artifactDigest:z,productContentDigest:z,manifestDigest:z,productManifestDigest:z};
const library=constructProgramConstructionLibrary({gtl,product,artifact}),core=gtl.constructWorksiteCommandExecutionModulePublication(artifact),evaluator=evaluatorPublication({gtl,artifact});
const f=await loadNative44Fixture({evaluatorGraph:evaluator.graphFunctions[0]});
const basis=input=>({executionObservation:input.origin.observation,nativeWork:input.origin.observation.task.sourceNativeWork,
  construction:input.origin.construction,execution:input.origin.execution,sourceRefs:input.origin.sourceRefs,currentContext:input.currentContext,evaluations:[]});
const select=(input=f.input,override={})=>selectLifecycleWork({product,model:input.model,basis:basis(input),selectedDutyRefs:input.selectedDutyRefs,...override});
const route={roles:['evaluate'],fitJudgment:{ref:'judgment://component/contract-fit',digest:hash('contract-fit')},
  obligationRefs:f.input.model.duties.filter(d=>d.role==='evaluate').map(d=>d.obligationRef),permittedEffects:[],
  publications:[library,core,evaluator],graphFunctionRefs:[ids.authenticateGraphFunctionRef,product.NATIVE_WORK_REACQUISITION_IDS.graphFunctionRef,ids.prepareGraphFunctionRef,fixtureIds.graphFunctionRef],retainEntryAfter:[1]};
const construct=(input=f.input,routes=[route])=>constructLifecycleProgram({gtl,product,artifact,model:input.model,basis:basis(input),selectedDutyRefs:input.selectedDutyRefs,routes});
function validation(candidate,extra=[]){const pubs=[candidate.publication,core,evaluator,...extra];const raw=(x,k)=>validator.rawAdmitValue(x,k,'contract://component/'+k);
  return validator.validateProgram({declarationBasisDigest:hash(pubs),programPublication:raw(candidate.publication,'module_publication'),program:raw(candidate.publication.programs[0],'gtl_program'),
    graphFunctions:pubs.flatMap(p=>p.graphFunctions).map(x=>raw(x,'graph_function')),contracts:pubs.flatMap(p=>p.contracts).map(x=>raw(x,'contract_declaration')),
    implementationBindings:pubs.flatMap(p=>p.implementationBindings).map(x=>raw(x,'implementation_binding')),closureContracts:pubs.flatMap(p=>p.closureContracts).map(x=>raw(x,'closure_contract')),rules:[],evaluators:[]});}
function componentEvaluationInput(input=f.input){const request=reacquisitionRequest(input),acquired=product.constructNativeWorksiteCommandExecutionTask({...request,
  sourceReacquisition:{request,nativeBasis:{predecessorPrefix:request.source.prefix,cCallRef:'c-call://component/unadmitted-reacquisition'},bindingCoverEventRefs:[]}});
  return evaluationInput(product.constructRetainedGraphInput(input,acquired));}

test('actual retained native projection selects only the missing computation, retaining the original population',()=>{
  assert(isConstructionInput(f.input));assert.equal(f.componentPremises,true);
  const selection=select();assert.equal(selection.disposition,'candidate');assert.deepEqual(selection.work.map(w=>w.role),['evaluate','evaluate']);
  assert.equal(selection.support.length,2);assert.equal(selection.carriedBindingRefs.length,13);assert.equal(selection.originalTaskCompletion,'not_claimed');
  assert.equal(f.input.origin.bindingRefs.length,15);assert.equal(f.input.origin.observation.commandResults.length,9);
});
test('real installed GTL validation accepts the ordinary generated acquisition/evaluation composition',async()=>{
  const candidate=construct();assert.equal(candidate.kind,'candidate');const result=validation(candidate);
  assert.equal(result.kind,'program_validation',JSON.stringify(result));
  const actualFixture=await constructNative44Candidate({gtl,artifact});
  assert.equal(actualFixture.candidate.start.programRef,candidate.start.programRef);
  const root=candidate.publication.graphFunctions.find(g=>g.name===candidate.start.graphFunctionRef);assert.equal(root.template.nodes.length,4);
  assert.equal(root.template.edges.filter(e=>e.inputBinding).length,1);
  const membership=candidate.publication.programs[0].callableMembership;
  assert(!membership.includes(product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef));
  assert(!membership.includes(product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef));
  assert(!membership.includes(product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef));
  assert.deepEqual(root.effects,[]);
});
test('packaging fixture publishes an admissible callable with exact Program membership',()=>{
  const raw=(x,k)=>validator.rawAdmitValue(x,k,'contract://abiogenesis/gtl/'+k.replaceAll('_','-')+'@5');
  const check=publication=>validator.validatePublication(raw(publication,'module_publication'),
    publication.contributions.map(c=>raw(c,'catalog_contribution')));
  assert.equal(check(evaluator).kind,'publication_validation',JSON.stringify(check(evaluator)));
  const absent=structuredClone(evaluator);absent.programs=[];absent.contributions[0].programMembershipRefs=[];
  assert.equal(check(absent).kind,'static_validation_refusal');
  const duplicate=structuredClone(evaluator);duplicate.contributions[0].provenanceRefs=[z,z];
  assert.equal(check(duplicate).kind,'static_validation_refusal');
});
test('missing artifact versus missing execution preserve necessity; absent published compositions stay gaps',()=>{
  const absent={...basis(f.input),nativeWork:undefined,executionObservation:undefined};
  assert.deepEqual(select(f.input,{basis:absent}).work.map(r=>r.role),['construct','execute','evaluate','evaluate']);
  assert.deepEqual(select(f.input,{basis:{...absent,currentContext:{entries:[]}}}).work.map(r=>r.role),['construct','execute','evaluate','evaluate']);
  const unexecuted={...basis(f.input),executionObservation:undefined};
  assert.deepEqual(select(f.input,{basis:unexecuted}).work.map(r=>r.role),['execute','evaluate','evaluate']);
  const missing=constructLifecycleProgram({gtl,product,artifact,model:f.input.model,basis:absent,selectedDutyRefs:f.input.selectedDutyRefs,routes:[route]});
  assert.equal(missing.kind,'gap');assert.equal(missing.gaps[0].cause,'compatible_published_composition_absent');
  const broader=constructLifecycleProgram({gtl,product,artifact,model:f.input.model,basis:absent,selectedDutyRefs:f.input.selectedDutyRefs,
    routes:[{...route,roles:['construct','execute','evaluate']}]});
  assert.equal(broader.gaps[0].cause,'executable_evidence_regime_not_supported');
});
test('assessment requires exact evidence/source, complete scope, satisfactory verdict and independence',()=>{
  const input=structuredClone(f.input),d=input.model.duties.at(-1);d.role='assess';input.selectedDutyRefs=[d.ref];
  const relation={dutyRef:d.ref,result:{ref:'result://component/assessment',digest:hash('assessment')},scopeRefs:d.scopeRefs,
    sourceRefs:input.origin.sourceRefs,execution:input.origin.execution,verdict:'satisfied',producer:{actorInvocationRef:'actor://component/independent',cCallRef:'c-call://component/independent'}};
  const b=basis(input);b.evaluations=[relation];assert.equal(select(input,{basis:b}).disposition,'report_refs');
  for(const change of [{verdict:'negative'},{verdict:'indeterminate'},{scopeRefs:d.scopeRefs.slice(1)},
    {sourceRefs:[]},{execution:{ref:'result://wrong',digest:hash('wrong')}},{producer:input.origin.observation.task.sourceNativeWork.provenance}]) {
    assert.equal(select(input,{basis:{...b,evaluations:[{...relation,...change}]}}).work.at(-1).role,'assess');
  }
  assert.equal(isConstructionInput(input),false,'the first executable adapter cannot authenticate arbitrary assessment projections');
});
test('all selected duties supported reports references without creating original-task completion',()=>{
  const b=basis(f.input);b.evaluations=f.input.model.duties.filter(d=>d.role==='evaluate').map(d=>({dutyRef:d.ref,
    result:{ref:'result://component/'+d.ref,digest:hash(d.ref)},scopeRefs:d.scopeRefs,sourceRefs:f.input.origin.sourceRefs,
    execution:f.input.origin.execution,verdict:'satisfied'}));
  const selection=select(f.input,{basis:b});assert.equal(selection.disposition,'report_refs');assert.equal(selection.work.length,0);
  assert.equal(selection.originalTaskCompletion,'not_claimed');assert.equal(selection.carriedBindingRefs.length,13);
  assert.equal(constructLifecycleProgram({gtl,product,artifact,model:f.input.model,basis:b,selectedDutyRefs:f.input.selectedDutyRefs,routes:[]}).kind,'report_refs');
});
test('stale or unknown support blocks affected reuse and never infers rollback',()=>{
  const input=structuredClone(f.input);input.currentContext.entries.find(e=>e.relativePath==='test-execution-plan.json').digest=hash('changed');
  assert.equal(select(input).disposition,'gap');assert.equal(isConstructionInput(input),false);
  const missing=select(f.input,{basis:{...basis(f.input),currentContext:null}});assert.equal(missing.disposition,'gap');
  assert(missing.gaps.every(g=>g.state==='unknown'));
});
test('missing historical construction input remains a prospective obligation',()=>{
  const input=structuredClone(f.input),d={...input.model.duties[0],ref:'duty://component/constructed-from',role:'provenance'};
  input.model.duties.push(d);input.selectedDutyRefs=[d.ref];
  assert.equal(select(input).work[0].reason,'historical_input_relation_absent');
  assert.equal(construct(input).kind,'gap');
});
function prospectiveInput() {
  const input=structuredClone(f.input),template=input.model.duties[0],retained=input.origin.observation.task.sourceNativeWork;
  const predecessor=retained.before.entries.find(e=>e.state==='file'&&retained.task.readFirst.includes(e.relativePath)&&
    input.currentContext.entries.some(c=>c.relativePath===e.relativePath&&c.state==='file'&&c.digest===e.digest));
  assert(predecessor,'the representative retained basis has an unchanged historical input');
  const producer={...template,ref:'duty://component/prospective-producer',role:'provenance',requires:[],
    dependencies:[{path:predecessor.relativePath,digest:predecessor.digest}],dependentPaths:['prospective-design.md']};
  const consumer={...template,ref:'duty://component/prospective-consumer',role:'provenance',requires:[producer.ref],
    dependencies:[{producerDutyRef:producer.ref,path:producer.dependentPaths[0]}],dependentPaths:['prospective-source.mjs']};
  const evaluation={...input.model.duties.at(-1),ref:'duty://component/prospective-evaluation',requires:[consumer.ref],
    dependencies:[{producerDutyRef:consumer.ref,path:consumer.dependentPaths[0]}]};
  const assessment={...evaluation,ref:'duty://component/prospective-assessment',role:'assess',requires:[evaluation.ref,consumer.ref]};
  input.model.duties.push(producer,consumer,evaluation,assessment);input.selectedDutyRefs=[assessment.ref];
  return {input,producer,consumer,evaluation,assessment};
}
test('future outputs bind prerequisite duties and paths without borrowing retained digests or provenance',()=>{
  const {input,producer,consumer,evaluation,assessment}=prospectiveInput(),before=structuredClone(input);
  const result=select(input);
  assert.equal(result.disposition,'candidate');
  assert.deepEqual(result.interpretation,input.model.interpretation);assert.deepEqual(result.sourceRefs,input.model.sourceRefs);
  assert.deepEqual(result.work.map(w=>w.dutyRef),[producer.ref,consumer.ref,evaluation.ref,assessment.ref]);
  assert.equal(result.work[0].reason,'prospective_input_relation_not_established');
  assert.deepEqual(result.work[0].dependentPaths,producer.dependentPaths);
  for(const row of result.work.slice(1)) {
    assert.deepEqual(row.dependencies,input.model.duties.find(d=>d.ref===row.dutyRef).dependencies);
    assert(row.dependencies.every(d=>dependencyKind(d)==='producer_output'&&!Object.hasOwn(d,'digest')));
    assert(!Object.hasOwn(row,'refs'),'no historical support coordinate belongs to future work');
    assert.equal(row.bindingRef,input.model.duties.find(d=>d.ref===row.dutyRef).bindingRef);
  }
  assert.deepEqual(input,before);assert.equal(Object.isFrozen(input.model.duties[0]),false);
  assert.equal(result.originalTaskCompletion,'not_claimed');
  assert.equal(isConstructionInput(input),false);
  const allRoles={...route,roles:['provenance','evaluate','assess'],obligationRefs:[...new Set(result.work.map(w=>w.obligationRef))]};
  assert.equal(construct(input,[allRoles]).gaps[0].cause,'executable_evidence_regime_not_supported');
  // Removing the prospective output declaration exposes only the original
  // historical input relation, never credit for the newly declared work.
  const historical=structuredClone(input);historical.model.duties=historical.model.duties.filter(d=>d.ref!==consumer.ref&&d.ref!==evaluation.ref&&d.ref!==assessment.ref);
  delete historical.model.duties.find(d=>d.ref===producer.ref).dependentPaths;historical.selectedDutyRefs=[producer.ref];
  assert.equal(select(historical).disposition,'report_refs');
});
test('missing, ambiguous, undeclared and cyclic producer bindings refuse before candidate construction',()=>{
  const cases=[
    [({consumer})=>{consumer.dependencies[0].producerDutyRef='duty://absent';},/exact producer duty/],
    [({input,producer})=>{input.model.duties.push(structuredClone(producer));},/unique duty/],
    [({consumer})=>{consumer.requires=[];},/declared prerequisite/],
    [({consumer})=>{consumer.dependencies[0].path='undeclared.md';},/declared producer output/],
    [({consumer})=>{consumer.dependencies[0].digest=hash('invented future');},/invalid duty/],
    [({consumer})=>{consumer.dependencies.push({...consumer.dependencies[0]});},/ambiguous dependency path/],
    [({producer})=>{producer.dependentPaths.push(producer.dependentPaths[0]);},/invalid duty/],
    [({producer,consumer})=>{producer.requires=[consumer.ref];producer.dependencies=[{producerDutyRef:consumer.ref,path:consumer.dependentPaths[0]}];},/cyclic/],
  ];
  for(const [change,expected] of cases){const fixture=prospectiveInput();change(fixture);assert.throws(()=>select(fixture.input),expected);}
});
test('present, absent, changed and unavailable observed inputs retain affected dependency states',()=>{
  const {input,producer,consumer,assessment}=prospectiveInput(),path=producer.dependencies[0].path;
  assert.equal(select(input).disposition,'candidate');
  const cases=[
    [entry=>{entry.digest=hash('changed predecessor');},'stale','current_dependency_changed'],
    [entry=>{entry.state='absent';delete entry.digest;},'stale','current_dependency_absent'],
    [entry=>{entry.state='unavailable';delete entry.digest;},'unknown','current_dependency_unavailable'],
  ];
  for(const [change,state,reason] of cases) {
    const changed=structuredClone(input);change(changed.currentContext.entries.find(e=>e.relativePath===path));
    const selection=select(changed);assert.equal(selection.disposition,'gap');assert.equal(selection.work.length,0);
    assert.equal(selection.gaps.find(g=>g.dutyRef===producer.ref).dependencyStates[0].reason,reason);
    for(const ref of [producer.ref,consumer.ref,assessment.ref])assert.equal(selection.gaps.find(g=>g.dutyRef===ref).state,state);
  }
  for(const modify of [ctx=>{ctx.entries=ctx.entries.filter(e=>e.relativePath!==path);},
    ctx=>{ctx.entries.push({...ctx.entries.find(e=>e.relativePath===path)});}]) {
    const changed=structuredClone(input);modify(changed.currentContext);
    assert.equal(select(changed).gaps.find(g=>g.dutyRef===producer.ref).state,'unknown');
  }
  const mixed=structuredClone(input);mixed.model.duties.find(d=>d.ref===consumer.ref).dependencies.push({path:'not-observed.md',digest:hash('not-observed')});
  assert.equal(select(mixed).gaps.find(g=>g.dutyRef===consumer.ref).state,'unknown','a selected producer does not invent an unrelated observed input');
});
test('missing prerequisite work withdraws old assessments and preserves exact unsatisfactory relations',()=>{
  const {input,assessment}=prospectiveInput(),b=basis(input);
  const previous={dutyRef:assessment.ref,result:{ref:'result://component/prior-assessment',digest:hash('prior')},
    sourceRefs:b.sourceRefs,execution:b.execution,scopeRefs:assessment.scopeRefs,verdict:'satisfied',
    producer:{actorInvocationRef:'actor://component/independent',cCallRef:'c-call://component/independent'}};
  for(const verdict of ['satisfied','negative','indeterminate']) {
    const relation={...previous,verdict},result=select(input,{basis:{...b,evaluations:[relation]}});
    const row=result.work.find(w=>w.dutyRef===assessment.ref);
    assert.equal(row.state,'missing');assert.deepEqual(row.evaluations,[relation]);
    assert(!result.support.some(s=>s.dutyRef===assessment.ref));assert(!Object.hasOwn(row,'refs'));
  }
  // Even an assessment without a direct future-output reference cannot reuse
  // its old result when a required prospective predecessor is unresolved.
  assessment.dependencies=[];
  const missing=select(input,{basis:{...b,evaluations:[previous]}});
  assert(!missing.support.some(s=>s.dutyRef===assessment.ref));
  input.model.duties.find(d=>d.ref===assessment.requires[0]).applicability={value:'unknown',basisRefs:['ruling://pending']};
  const unknown=select(input,{basis:{...b,evaluations:[previous]}}).gaps.find(g=>g.dutyRef===assessment.ref);
  assert.equal(unknown.state,'unknown');assert(!Object.hasOwn(unknown,'refs'));assert.deepEqual(unknown.evaluations,[previous]);
});
test('partial binding selection carries other duties and mandatory assessment with their uncertainty',()=>{
  const {input,producer,consumer,assessment}=prospectiveInput();input.selectedDutyRefs=[producer.ref];
  const result=select(input);
  assert(result.carriedDutyRefs.includes(consumer.ref));assert(result.carriedDutyRefs.includes(assessment.ref));
  assert(result.carriedBindingRefs.includes(producer.bindingRef));
  assert.equal(result.carriedDuties.find(d=>d.dutyRef===assessment.ref).role,'assess');
  const originalUnknown=structuredClone(input);originalUnknown.model.duties.find(d=>d.ref===assessment.ref).applicability.value='unknown';
  assert.equal(select(originalUnknown).carriedDuties.find(d=>d.dutyRef===assessment.ref).state,'unknown');
});
test('excluded producer cannot supply a future output; excluded consumer selects no prerequisite work',()=>{
  const {input,producer,consumer}=prospectiveInput();producer.applicability={value:'false',basisRefs:['ruling://producer/inapplicable']};
  const result=select(input);assert.equal(result.gaps.find(g=>g.dutyRef===consumer.ref).reason,'producer_excluded');
  assert.deepEqual(result.excluded.find(e=>e.dutyRef===producer.ref).basisRefs,producer.applicability.basisRefs);
  const excluded=prospectiveInput();excluded.input.selectedDutyRefs=[excluded.consumer.ref];
  excluded.consumer.applicability={value:'false',basisRefs:['ruling://consumer/inapplicable']};
  const skipped=select(excluded.input);assert.equal(skipped.disposition,'report_refs');assert.equal(skipped.work.length,0);
  assert(skipped.carriedDutyRefs.includes(excluded.producer.ref));
});

function nativeFixture() {
  const {input,producer,consumer}=prospectiveInput();delete input.evaluator;input.kind='lifecycle_native_construction_input';
  const sibling={...producer,ref:producer.ref+'/sibling',dependentPaths:['prospective-second.md']};input.model.duties.push(sibling);
  input.selectedDutyRefs=[consumer.ref,sibling.ref];
  input.constructionGroups=[{ref:'group://component/first',dutyRefs:[producer.ref,sibling.ref],fitJudgment:input.model.interpretation,
    outcome:'Derive the two selected dependent artifacts from their current source.',instructions:['Component task parameters; no native execution is authorized by this fixture.'],
    readFirst:producer.dependencies.map(d=>d.path),writeRoots:[...producer.dependentPaths,...sibling.dependentPaths],checks:[]},
    {ref:'group://component/second',dutyRefs:[consumer.ref],fitJudgment:input.model.interpretation,
    outcome:'Derive the selected source from the preceding actual design output.',instructions:['Component task parameters.'],
    readFirst:consumer.dependencies.map(d=>d.path),writeRoots:consumer.dependentPaths,checks:[]}];
  const native=gtl.constructNativeWorkspaceWorkModulePublication(artifact),library=constructProgramConstructionLibrary({gtl,product,artifact,includeNativeConstruction:true});
  const route={roles:['provenance'],fitJudgment:input.model.interpretation,obligationRefs:[...new Set([producer,sibling,consumer].map(d=>d.obligationRef))],
    permittedEffects:[product.NATIVE_WORKSPACE_WORK_IDS.effectUri],publications:[library,core,native],
    graphFunctionRefs:[ids.nativeAuthenticateGraphFunctionRef,product.NATIVE_WORK_REACQUISITION_IDS.graphFunctionRef,
      ids.prepareConstructionGraphFunctionRef,...input.constructionGroups.map(()=>ids.constructionChildGraphFunctionRef)],retainEntryAfter:[1]};
  return {input,producer,consumer,sibling,native,route};
}
function acquiredFor(input) {
  const request=reacquisitionRequest(input);
  return product.constructNativeWorksiteCommandExecutionTask({...request,sourceReacquisition:{request,
    nativeBasis:{predecessorPrefix:request.source.prefix,cCallRef:'c-call://component/unadmitted-reacquisition'},bindingCoverEventRefs:[]}});
}
test('declaration references cross construction handoffs without embedding proof or accepting a crossed source',()=>{
  const {input}=nativeFixture(),legacyRequest=reacquisitionRequest(input);
  // Explicit component declaration coordinates; only ABG's installed owner
  // establishes the historical proof and its actual admitted preparation.
  const catalogBasisDigest=hash('component constructor catalog');
  const proof={kind:'abg_historical_declaration_proof',schemaVersion:version,
    catalog:{basisDigest:catalogBasisDigest,readinessBasisDigest:hash('component constructor readiness')},
    catalogView:{catalogBasisDigest,viewDigest:hash('component constructor view')}};
  const {declarationProof,...selected}=input.sourceSelection;
  input.sourceSelection={...selected,declarationReference:constructAbgHistoricalDeclarationReference(proof)};
  const request=reacquisitionRequest(input),acquired=acquiredFor(input);
  assert.deepEqual(request.source,input.sourceSelection);
  assert.equal(Object.hasOwn(request.source,'declarationProof'),false);
  const sourceFree=({source,requestRef,requestDigest,...rest})=>rest;
  assert.deepEqual(sourceFree(request),sourceFree(legacyRequest));
  assert.notEqual(request.requestDigest,legacyRequest.requestDigest);
  assert(product.isNativeWorksiteCommandReacquisitionRequest(legacyRequest),'old inline representation remains valid');
  const state=constructionState(product.constructRetainedGraphInput(input,acquired));
  assert(isConstructionState(state));
  assert.deepEqual(nativeConstructionTask(state).context,input.currentContext);
  const crossed=structuredClone(input);
  crossed.sourceSelection.declarationReference.viewDigest=hash('other constructor view');
  assert.throws(()=>constructionState(product.constructRetainedGraphInput(crossed,acquired)),/exact original construction entry/);
  const ambiguous=structuredClone(input);ambiguous.sourceSelection.declarationProof=declarationProof;
  assert.throws(()=>reacquisitionRequest(ambiguous),/source selector|reacquisition/);
});
// Explicit unadmitted component premises. Public native validation checks their
// shape; only the installed native owner can establish actual observation truth.
function componentObservation(task,files={},gaps=[],occurrence='first') {
  const after=structuredClone(task.context);
  for(const [path,text] of Object.entries(files)) {
    const bytes=Buffer.from(text),entry={relativePath:path,state:'file',fileIdentity:'component-file://'+path,
      byteLength:bytes.length,digest:product.sha256Bytes(bytes),encoding:'base64',bytes:bytes.toString('base64')};
    const index=after.entries.findIndex(e=>e.relativePath===path);if(index<0)after.entries.push(entry);else after.entries[index]=entry;
    const parent=path.includes('/')?path.slice(0,path.lastIndexOf('/')):'.',name=path.slice(path.lastIndexOf('/')+1),directory=after.entries.find(e=>e.relativePath===parent&&e.state==='directory');
    if(directory)directory.members=[...new Set([...directory.members,name])].sort();
  }
  after.entries.sort((a,b)=>a.relativePath<b.relativePath?-1:1);
  const {kind,schemaVersion,observationRef,observationDigest,...contextBody}=after;
  after.observationDigest=hash(contextBody);after.observationRef='worksite-context-observation://abiogenesis/'+after.observationDigest.slice(7);
  assert(product.isWorksiteContextObservation(after));
  const before=task.context,paths=[...new Set([...before.entries,...after.entries].map(e=>e.relativePath))].sort();
  const body={kind:'native_workspace_work_observation',schemaVersion:version,task,before,after,
    changedPaths:paths.filter(path=>JSON.stringify(before.entries.find(e=>e.relativePath===path))!==JSON.stringify(after.entries.find(e=>e.relativePath===path))),
    report:{summary:'Unadmitted component observation',gaps},provenance:{...f.input.origin.observation.task.sourceNativeWork.provenance,
      cCallRef:'c-call://component/'+occurrence,actorInvocationRef:'actor://component/'+occurrence}};
  const digest=hash(body),result={...body,observationDigest:digest,observationRef:'native-work-observation://abiogenesis/'+digest.slice(7)};
  assert(product.isNativeWorkspaceWorkObservation(result));return result;
}
test('construction groups become ordinary GTL children with exact membership and retained output joins',()=>{
  const {input,native,route}=nativeFixture();assert(isNativeConstructionInput(input));
  const candidate=constructLifecycleProgram({gtl,product,artifact,model:input.model,basis:basis(input),selectedDutyRefs:input.selectedDutyRefs,
    constructionGroups:input.constructionGroups,routes:[route]});
  assert.equal(candidate.kind,'candidate');const validated=validation(candidate,[native]);
  assert.equal(validated.kind,'program_validation',JSON.stringify(validated));
  const raw=(x,k)=>validator.rawAdmitValue(x,k,'contract://abiogenesis/gtl/'+k.replaceAll('_','-')+'@5');
  const published=validator.validatePublication(raw(candidate.publication,'module_publication'),candidate.publication.contributions.map(c=>raw(c,'catalog_contribution')));
  assert.equal(published.kind,'publication_validation',JSON.stringify(published));
  const root=candidate.publication.graphFunctions.find(g=>g.name===candidate.start.graphFunctionRef),child=candidate.publication.graphFunctions.find(g=>g.name===ids.constructionChildGraphFunctionRef);
  assert.equal(root.template.nodes.length,5);assert.deepEqual(root.effects,[product.NATIVE_WORKSPACE_WORK_IDS.effectUri]);
  assert.equal(child.template.nodes.length,3);assert.equal(child.template.edges.filter(e=>e.inputBinding).length,1);
  assert.equal(new Set(candidate.correspondence.map(c=>c.producerNodeRef)).size,2,'two grouped duties share their one actual child occurrence');
  const membership=candidate.publication.programs[0].callableMembership;
  assert(membership.includes(product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef));assert.equal(membership.length,new Set(membership).size);
  assert(!membership.includes(product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef));assert(!membership.includes(product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef));
  const topology=checkInstalledConstructionTopology({product,activation:{mode:'construction_only',expectation:'predecessor_refusal'},input,
    catalog:{boundPublications:[candidate.publication,core,native]},programRef:candidate.start.programRef});
  assert.deepEqual(topology.expectedCalls,root.template.nodes.map(n=>n.term.graphFunctionRef));
  const tampered=structuredClone(candidate.publication);tampered.graphFunctions.find(g=>g.name===ids.constructionChildGraphFunctionRef).template.edges[1].inputBinding=
    product.graphInputRetentionBinding(ids.nativeInputContractRef,product.NATIVE_WORKSPACE_WORK_IDS.observationContractRef);
  assert.throws(()=>checkInstalledConstructionTopology({product,activation:{mode:'construction_only',expectation:'predecessor_refusal'},input,
    catalog:{boundPublications:[tampered,core,native]},programRef:candidate.start.programRef}));
});
test('actual acquisition and child outputs provide current native tasks and future producer digests',()=>{
  const {input,producer,consumer}=nativeFixture(),original=structuredClone(input.origin);
  const state=constructionState(product.constructRetainedGraphInput(input,acquiredFor(input)));assert(isConstructionState(state));
  const task=nativeConstructionTask(state);assert.deepEqual(task.context,input.currentContext);assert.deepEqual(task.checks,[]);
  assert(!task.instructions.some(text=>text.includes('commandResults')),'historical envelopes are not native task instructions');
  const observed=componentObservation(task,{'prospective-design.md':'new design','prospective-second.md':'second design'});
  const next=constructionOutput(product.constructRetainedGraphInput(state,observed));assert(isConstructionState(next));
  const nextTask=nativeConstructionTask(next);assert.deepEqual(nextTask.context,observed.after);
  assert(nextTask.readFirst.includes(producer.dependentPaths[0]));
  const result=constructionOutput(product.constructRetainedGraphInput(next,componentObservation(nextTask,{'prospective-source.mjs':'new source'},[],'second')));
  assert.equal(result.disposition,'observed');assert.equal(result.evaluationDisposition,'not_performed');assert.equal(result.assessmentDisposition,'not_performed');
  assert.deepEqual(result.entry.origin,{construction:original.construction,execution:original.execution});assert.deepEqual(input.origin,original);
  assert.equal(Object.hasOwn(result.entry.origin,'observation'),false,'children do not repeat the retained historical envelope');
  assert(result.pendingDutyRefs.includes(consumer.ref));
  const dependency=result.constructionObservations[1].resolvedDependencies[0];
  assert.equal(dependency.producerDutyRef,producer.ref);assert.equal(dependency.digest,observed.after.entries.find(e=>e.relativePath===producer.dependentPaths[0]).digest);
  assert.deepEqual(dependency.observation,{ref:observed.observationRef,digest:observed.observationDigest});
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(ids.nativeCompletionPredicateRef).evaluate(input,result),true);
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(ids.nativeCompletionPredicateRef).evaluate(input,state),false);
  assert.throws(()=>nativeConstructionTask(result),/current acquired/);
});
test('wrong predecessor, acquisition, task and root substitutions refuse before dependent preparation',()=>{
  const {input,producer}=nativeFixture(),acquired=acquiredFor(input),state=constructionState(product.constructRetainedGraphInput(input,acquired));
  const wrong=structuredClone(input);wrong.model.duties.find(d=>d.ref===producer.ref).dependencies[0].digest=hash('wrong predecessor');
  assert(isNativeConstructionInput(wrong),'shape admission preserves the actual acquired-context discriminator');
  assert.throws(()=>constructionState(product.constructRetainedGraphInput(wrong,acquiredFor(wrong))),/predecessor basis/);
  const relation=PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(constructionStages[1].predicateRef);
  assert.equal(relation.evaluate(product.constructRetainedGraphInput(wrong,acquiredFor(wrong)),state),false);
  const different=structuredClone(input);different.constructionGroups[0].outcome+=' changed';
  assert.throws(()=>constructionState(product.constructRetainedGraphInput(input,acquiredFor({...input,sourceSelection:{...input.sourceSelection,graphCallRef:'graph-call://wrong'}}))),/exact original construction entry/);
  const observed=componentObservation(nativeConstructionTask(state),{'prospective-design.md':'new','prospective-second.md':'new'});
  const altered=constructionState(product.constructRetainedGraphInput(different,acquiredFor(different)));
  assert.throws(()=>constructionOutput(product.constructRetainedGraphInput(altered,observed)),/exact prepared task/);
  assert.throws(()=>constructionOutput(product.constructRetainedGraphInput(state,input.origin.observation.task.sourceNativeWork)),/exact prepared task/);
  assert.throws(()=>constructionOutput(product.constructRetainedGraphInput(input,observed)),/child input\/output join/);
  const forged=structuredClone(state);forged.currentContext=observed.after;assert.equal(isConstructionState(forged),false);
  const premature=structuredClone(state);premature.constructionObservations=[{groupRef:input.constructionGroups[1].ref,dutyRefs:input.constructionGroups[1].dutyRefs,observation:observed,resolvedDependencies:[]}];
  assert.equal(isConstructionState(premature),false);
});
test('partial output and stale retained execution remain explicit without inventing an after-context',()=>{
  const {input}=nativeFixture(),state=constructionState(product.constructRetainedGraphInput(input,acquiredFor(input))),task=nativeConstructionTask(state);
  for(const [files,gaps] of [[{},[]],[{'prospective-design.md':'partial'},['remaining work']]]) {
    const result=constructionOutput(product.constructRetainedGraphInput(state,componentObservation(task,files,gaps)));
    assert.equal(result.disposition,'partial');assert(result.gaps.length>0);assert.equal(result.originalTaskCompletion,'not_claimed');
    assert.throws(()=>nativeConstructionTask(result),/current acquired/);
  }
  const changed=structuredClone(input),member=changed.origin.observation.snapshotMembers[0];
  changed.constructionGroups[0].writeRoots.push(member.relativePath);
  const changedState=constructionState(product.constructRetainedGraphInput(changed,acquiredFor(changed)));
  const result=constructionOutput(product.constructRetainedGraphInput(changedState,componentObservation(nativeConstructionTask(changedState),
    {'prospective-design.md':'new','prospective-second.md':'new',[member.relativePath]:'changed retained execution input'})));
  assert(result.gaps.some(g=>g.cause==='retained_execution_stale'));assert.deepEqual(result.entry.origin.execution,input.origin.execution);
  const unavailable={...componentObservation(task),after:null};
  assert.throws(()=>constructionOutput(product.constructRetainedGraphInput(state,unavailable)),/exact prepared task/);
});
test('group coverage, future child boundaries and native effect contracts reject ambiguous construction',()=>{
  for(const modify of [x=>{x.input.constructionGroups[0].dutyRefs.push(x.consumer.ref);},
    x=>{x.input.constructionGroups.reverse();},x=>{x.input.constructionGroups[0].readFirst=[];},
    x=>{x.input.constructionGroups[0].writeRoots=['outside.md'];},x=>{x.input.constructionGroups[0].checks=['node run.mjs'];}]) {
    const x=nativeFixture();modify(x);assert.equal(isNativeConstructionInput(x.input),false);
  }
  const {input,route}=nativeFixture();route.permittedEffects=[];
  assert.equal(constructLifecycleProgram({gtl,product,artifact,model:input.model,basis:basis(input),selectedDutyRefs:input.selectedDutyRefs,
    constructionGroups:input.constructionGroups,routes:[route]}).gaps[0].cause,'effect_not_permitted');
});
function combinedFixture() {
  const fixture=nativeFixture(),{input,sibling}=fixture;
  const duty=input.model.duties.find(d=>d.ref==='duty://component/prospective-evaluation'),binding=f.terminalValue.current.bindingVersions[14];
  duty.bindingRef=binding.versionRef;duty.obligationRef=binding.binding.obligationRef;
  input.selectedDutyRefs=[duty.ref,sibling.ref];input.evaluator=structuredClone(f.input.evaluator);
  input.evaluator.parameters.comparison={obligationRef:duty.obligationRef,bindingRef:duty.bindingRef,
    predicateId:'hello-world-return-exact',predicateKind:'module_export_return_exact',ordinal:6};
  const library=constructProgramConstructionLibrary({gtl,product,artifact,includeNativeConstruction:true,evaluationGraph:evaluator.graphFunctions[0]});
  const selection=select(input);
  fixture.route={...fixture.route,roles:[...new Set(selection.work.map(d=>d.role))],obligationRefs:[...new Set(selection.work.map(d=>d.obligationRef))],
    publications:[library,core,fixture.native,evaluator],graphFunctionRefs:[...fixture.route.graphFunctionRefs,ids.prepareConstructedEvaluationGraphFunctionRef,ids.evaluationChildGraphFunctionRef],
    retainEntryAfter:[1,2+input.constructionGroups.length]};
  return {...fixture,duty};
}
function completedConstruction(input,lastFiles={},lastGaps=[],omittedLastPaths=[]) {
  let state=constructionState(product.constructRetainedGraphInput(input,acquiredFor(input)));
  for(const [index,group] of input.constructionGroups.entries()) {
    const files=Object.fromEntries(group.dutyRefs.flatMap(ref=>{
      const duty=input.model.duties.find(d=>d.ref===ref);
      return duty.dependentPaths.filter(path=>index!==input.constructionGroups.length-1||!omittedLastPaths.includes(path))
        .map(path=>[path,'Derived from '+duty.dependencies.map(d=>d.path).join(', ')+'.\n']);
    }));
    state=constructionOutput(product.constructRetainedGraphInput(state,componentObservation(nativeConstructionTask(state),
      {...files,...(index===input.constructionGroups.length-1?lastFiles:{})},index===input.constructionGroups.length-1?lastGaps:[],'combined-'+index)));
  }
  return state;
}
test('PC03 ordinary construction and supplied evaluator children validate with actual retention operands',()=>{
  const {input,route,native}=combinedFixture();assert(isNativeConstructionInput(input));
  const candidate=constructLifecycleProgram({gtl,product,artifact,model:input.model,basis:basis(input),selectedDutyRefs:input.selectedDutyRefs,
    constructionGroups:input.constructionGroups,routes:[route]});
  assert.equal(candidate.kind,'candidate');const checked=validation(candidate,[native]);assert.equal(checked.kind,'program_validation',JSON.stringify(checked));
  const raw=(x,k)=>validator.rawAdmitValue(x,k,'contract://abiogenesis/gtl/'+k.replaceAll('_','-')+'@5');
  const published=validator.validatePublication(raw(candidate.publication,'module_publication'),candidate.publication.contributions.map(c=>raw(c,'catalog_contribution')));
  assert.equal(published.kind,'publication_validation',JSON.stringify(published));
  const root=candidate.publication.graphFunctions.find(g=>g.name===candidate.start.graphFunctionRef),child=candidate.publication.graphFunctions.find(g=>g.name===ids.evaluationChildGraphFunctionRef);
  assert.deepEqual(root.template.edges.at(-2).inputBinding,product.graphInputRetentionBinding(ids.nativeInputContractRef,ids.constructionStateContractRef));
  assert.deepEqual(child.template.edges[0].inputBinding,product.graphInputRetentionBinding(ids.evaluatorInputContractRef,fixtureIds.outputContractRef));
  assert.deepEqual(child.template.nodes.map(n=>n.term.graphFunctionRef),[fixtureIds.graphFunctionRef,ids.joinEvaluationGraphFunctionRef]);
  const membership=candidate.publication.programs[0].callableMembership;
  assert(membership.includes(fixtureIds.graphFunctionRef));assert(!membership.includes(product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef));
  assert(!membership.includes(product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef));
});
test('PC03 actual construction/evaluator join conserves original records and retains the PC04 seam',()=>{
  const {input}=combinedFixture(),original=product.canonicalJson(input.origin),state=completedConstruction(input);
  const view=constructedEvaluationInput(product.constructRetainedGraphInput(input,state));
  assert.deepEqual(evaluationInput(product.constructRetainedGraphInput(input,state)),view);
  assert.deepEqual(view.constructionObservations,state.constructionObservations);assert.deepEqual(view.currentContext,state.currentContext);
  for(const key of ['commandResults','snapshotMembers','predicateObservations','provenance'])assert.deepEqual(view.executionRecord[key],input.origin.observation[key]);
  for(const key of ['outcomePredicates','protectedObservations'])assert.deepEqual(view.executionRecord[key],input.origin.observation.task[key]);
  assert.equal(product.canonicalJson(input.origin),original);assert.deepEqual(view.construction,input.origin.construction);
  assert.deepEqual(view.dutyPopulation,input.model.duties);assert.deepEqual(view.carriedDuties,select(input).carriedDuties);
  assert(!Object.hasOwn(state.entry.origin,'observation'));assert(!Object.hasOwn(view,'origin'));
  const computed=deriveNativeRecords(view),joined=evaluationOutput(product.constructRetainedGraphInput(view,computed));assert(isEvaluationState(joined));
  assert.deepEqual(joined.computedRecords,computed);assert.deepEqual(joined.evaluationInput,view);
  assert.equal(joined.assessmentDisposition,'not_performed');assert.equal(joined.originalTaskCompletion,'not_claimed');
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(ids.constructedEvaluationPredicateRef).evaluate(input,joined),true);
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(ids.evaluationChildPredicateRef).evaluate(view,joined),true);
  const copied=structuredClone(input);copied.acceptedBindings10And11={verdict:'satisfied'};assert.equal(isNativeConstructionInput(copied),false);
  assert.equal(computed.records.acceptedResultsDisposition,'requires_separate_owner_conjunction');
  assert.equal(Object.hasOwn(computed.records,'planSatisfied'),false,'combined computation does not repeat accepted 10/11 records');
  const wrongOutput=structuredClone(computed);wrongOutput.execution.digest=hash('different original execution');
  assert.throws(()=>evaluationOutput(product.constructRetainedGraphInput(view,wrongOutput)),/conserved computed/);
  const altered=structuredClone(joined);altered.evaluationInput.executionRecord.predicateObservations[6].observedValue='root-copy substitution';
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(ids.constructedEvaluationPredicateRef).evaluate(input,altered),false);
  assert.throws(()=>constructedEvaluationInput(product.constructRetainedGraphInput(input,input.origin.observation.task.sourceNativeWork)),/completed construction/);
});
test('PC03 every retained snapshot dependency and selected predecessor stays current before evaluation',()=>{
  for(const member of f.input.origin.observation.snapshotMembers) {
    const {input}=combinedFixture();input.constructionGroups.at(-1).writeRoots.push(member.relativePath);
    const state=completedConstruction(input,{[member.relativePath]:'changed consumed bytes'});
    assert(state.gaps.some(g=>g.path===member.relativePath&&g.cause==='retained_execution_stale'),member.relativePath);
    assert.throws(()=>constructedEvaluationInput(product.constructRetainedGraphInput(input,state)),/partial or stale/);
  }
  const {input,producer}=combinedFixture();input.constructionGroups.at(-1).writeRoots.push(producer.dependentPaths[0]);
  const stale=completedConstruction(input,{[producer.dependentPaths[0]]:'changed selected predecessor'});
  assert.throws(()=>constructedEvaluationInput(product.constructRetainedGraphInput(input,stale)),/partial or stale/);
});
test('PC03 construction edge records derive from actual before/after and cannot promote false or unknown',()=>{
  const {input}=combinedFixture(),view=constructedEvaluationInput(product.constructRetainedGraphInput(input,completedConstruction(input))),records=deriveNativeRecords(view).records;
  assert.equal(records.constructionEdges.length,3);assert(records.constructionEdges.every(r=>r.verdict==='true'));
  const future=records.constructionEdges.find(r=>r.predecessor.producerDutyRef);assert(future.predecessor.producerObservation);
  for(const mutate of [v=>{v.constructionObservations[0].observation.task.readFirst=[];},
    v=>{v.constructionObservations[0].resolvedDependencies[0].digest=hash('wrong');}]) {
    const altered=structuredClone(view);mutate(altered);assert.equal(deriveNativeRecords(altered).records.verdict,'false');
  }
  const unknown=structuredClone(view);unknown.constructionObservations[0].observation.before.entries=[];
  assert.equal(deriveNativeRecords(unknown).records.conditions.constructionEdges.value,'unknown');
  const absent=structuredClone(view);absent.constructionObservations=[];assert.notEqual(deriveNativeRecords(absent).records.verdict,'true');
  assert.equal(deriveNativeRecords(absent).records.constructionEdges[0].contentObservations.completeReport.value,'unknown');
});
test('PC05 author residuals remain verbatim judgment evidence without deciding every structural edge',()=>{
  const {input}=combinedFixture(),reports=['Independent assessment has not run.','Argument behavior remains unproved.'],state=completedConstruction(input,{},reports);
  assert.equal(state.disposition,'partial');assert(state.gaps.every(g=>g.cause==='author_reported_gap'));
  const view=constructedEvaluationInput(product.constructRetainedGraphInput(input,state)),records=deriveNativeRecords(view).records;
  assert(records.constructionEdges.every(row=>row.verdict==='true'));
  const last=records.constructionEdges.find(row=>row.observation.ref===state.constructionObservations.at(-1).observation.observationRef);
  assert.equal(last.contentObservations.completeReport.value,'false');assert.deepEqual(last.contentObservations.completeReport.report.gaps,reports);
  assert.deepEqual(view.constructionObservations,state.constructionObservations);
  const stale=structuredClone(view);stale.constructionObservations.at(-1).resolvedDependencies[0].digest=hash('stale');
  assert.equal(deriveNativeRecords(stale).records.verdict,'false');
  const missing=completedConstruction(input,{},reports,input.constructionGroups.at(-1).writeRoots);
  assert(missing.gaps.some(g=>g.cause==='dependent_output_absent'));
  assert.throws(()=>constructedEvaluationInput(product.constructRetainedGraphInput(input,missing)),/partial or stale/);
});
test('PC05 predecessor text is non-closing: absent marker permits structure and present marker cannot rescue a bad join',()=>{
  const {input,consumer}=combinedFixture(),path='prospective-package.json';
  consumer.dependentPaths=[path];input.constructionGroups.at(-1).writeRoots=[path];
  for(const duty of input.model.duties)for(const dependency of duty.dependencies)
    if(dependency.producerDutyRef===consumer.ref)dependency.path=path;
  const evaluate=body=>constructedEvaluationInput(product.constructRetainedGraphInput(input,completedConstruction(input,{[path]:body})));
  const plain=evaluate(JSON.stringify({private:true,type:'module'})),output=deriveNativeRecords(plain);
  const edge=output.records.constructionEdges.find(r=>r.dutyRef===consumer.ref);
  assert.equal(edge.contentObservations.declaresPredecessor.value,'false');
  assert.equal(edge.contentObservations.declaresPredecessor.evidenceRole,'non_closing_content_observation');
  assert.equal(Object.hasOwn(edge.conditions,'declaresPredecessor'),false);
  assert.equal(edge.verdict,'true','matching actual component before/after and declared read do not require decorative metadata');
  assert.equal(output.records.semanticClosure,'not_claimed');
  assert(output.records.residuals.includes('faithful derivation requires independent semantic assessment'));
  const marked=structuredClone(evaluate(JSON.stringify({private:true,type:'module',derivedFrom:consumer.dependencies.map(d=>d.path)})));
  const producer=marked.constructionObservations.find(r=>r.dutyRefs.includes(consumer.ref));
  producer.resolvedDependencies[0].digest=hash('crossed predecessor');
  const crossed=deriveNativeRecords(marked).records.constructionEdges.find(r=>r.dutyRef===consumer.ref);
  assert.equal(crossed.contentObservations.declaresPredecessor.value,'true');
  assert.equal(crossed.conditions.predecessorBinding.value,'false');
  assert.equal(crossed.verdict,'false','a decorative marker cannot override the actual structural join');
});
test('PC03 binding14 joins exact predicate, protected module and observed plan while preserving raw-field residuals',()=>{
  const {input}=combinedFixture(),view=constructedEvaluationInput(product.constructRetainedGraphInput(input,completedConstruction(input)));
  const output=deriveNativeRecords(view),comparison=output.records.comparison;
  assert.equal(comparison.verdict,'true');assert.equal(comparison.observedValue,'Hello, world!');assert.equal(comparison.derived.type.value,'string');
  assert.equal(comparison.derived.noArguments.value,'true');assert.equal(comparison.cardinality.declarations,1);assert.equal(comparison.cardinality.observations,1);
  assert(comparison.residuals.some(r=>r.includes('raw argument-list')));assert.equal(output.records.semanticClosure,'not_claimed');
  assert.equal(Object.hasOwn(view.executionRecord.predicateObservations[6],'observedType'),false);
  assert.deepEqual(evaluateNativeRecords(view).resultCandidate,output);
  for(const mutate of [v=>{v.executionRecord.outcomePredicates[6].declaration.equals='different';},
    v=>{v.executionRecord.predicateObservations[6].observedValue=42;},
    v=>{v.executionRecord.predicateObservations.push(structuredClone(v.executionRecord.predicateObservations[6]));},
    v=>{v.executionRecord.predicateObservations[6].ordinal=99;},
    v=>{v.executionRecord.predicateObservations[6].predicateId='other';},
    v=>{v.executionRecord.predicateObservations[6].predicateKind='process_exit';},
    v=>{v.executionRecord.predicateObservations[6].evidence[0].digest=hash('wrong evidence');},
    v=>{v.executionRecord.snapshotMembers.find(m=>m.relativePath==='src/hello.mjs').digest=hash('stale module');},
    v=>{v.evaluator.parameters.plan.digest=hash('stale plan');},
    v=>{v.evaluator.parameters.comparison.bindingRef='binding://unselected';}]) {
    const changed=structuredClone(view);mutate(changed);assert.equal(deriveNativeRecords(changed).records.comparison.verdict,'false');
  }
  const absent=structuredClone(view);delete absent.executionRecord.predicateObservations[6].observedValue;
  assert.equal(deriveNativeRecords(absent).records.comparison.verdict,'unknown');
  const changedPlan=structuredClone(view),planPath=view.evaluator.parameters.plan.path;
  const plan=JSON.parse(Buffer.from(view.currentContext.entries.find(e=>e.relativePath===planPath).bytes,'base64').toString());
  plan.assertedReturnValue='different observed plan assertion';
  const task=path=>product.constructNativeWorkspaceWorkTask({...input.authority,context:view.currentContext,outcome:'Unadmitted parser premise',
    instructions:['Component observation only.'],readFirst:[],writeRoots:[path],checks:[]});
  changedPlan.currentContext=componentObservation(task(planPath),{[planPath]:JSON.stringify(plan)}).after;
  const planComparison=deriveNativeRecords(changedPlan).records.comparison;
  assert.equal(planComparison.conditions.observedEqualsPlan.value,'false');assert.equal(planComparison.conditions.planCurrent.value,'false');
  const noncallable=structuredClone(view);noncallable.currentContext=componentObservation(task('src/hello.mjs'),{'src/hello.mjs':'export const helloWorld = "Hello, world!";'}).after;
  const noCall=deriveNativeRecords(noncallable).records.comparison;
  assert.equal(noCall.conditions.noArguments.value,'unknown');assert.notEqual(noCall.verdict,'true');
  const altered=structuredClone(output);altered.records.comparison.conditions.observedEqualsDeclared.value='false';
  assert.equal(EVALUATOR_SEMANTICS.resolveJudgmentRelation(fixtureIds.predicateRef).evaluate(view,altered),false);
});
function assessmentSelection(input,criteria,recordSelections,candidatePaths,sourcePaths,rubric) {
  return {claim:'Independently judge selected construction and comparison; original task remains open.',fitJudgment:input.model.interpretation,
    rubric,candidatePaths,sourcePaths,recordSelections,criterionEvidence:criteria.map(c=>({criterionRef:c.criterionRef,
      dutyRefs:input.selectedDutyRefs,roles:['source','candidate','execution','oracle','construction_record','comparison_record']}))};
}
function componentAssessment(task,assessment,provenance,after=task.context) {
  const body={kind:'native_workspace_work_observation',schemaVersion:version,task,before:task.context,after,changedPaths:[],report:null,assessment,
    provenance:provenance??{...f.input.origin.observation.task.sourceNativeWork.provenance,actorInvocationRef:'actor://component/independent-assessor',cCallRef:'c-call://component/independent-assessor'}};
  const digest=hash(body),result={...body,observationRef:'native-work-observation://abiogenesis/'+digest.slice(7),observationDigest:digest};
  assert(product.isNativeWorkspaceWorkObservation(result));return result;
}
function satisfiedAssessment(evidence) {
  return {kind:assessmentResultContract.valueKind,criteria:evidence.criteria.map(c=>({criterionRef:c.criterionRef,disposition:'satisfied',rationale:'Unadmitted finite component premise.',
    evidence:[...new Set(Object.values(evidence.roleLabels[c.criterionRef]).flat())].filter(label=>evidence.bytes.get(label).length)
      .map(path=>({path,quote:evidence.bytes.get(path).slice(0,32)}))})),residuals:[]};
}
function smallAssessmentInput(extraFiles={}) {
  const stageRef='stage://component/assessment',criteria=[{criterionRef:'criterion://component/assessment',instruction:'Judge these bounded fixture records.'}];
  const files={'source.txt':'complete synthetic source','candidate.txt':'candidate from source.txt','rubric.json':JSON.stringify({kind:'semantic_job_lifecycle_declaration',stages:[{declarationRef:stageRef,rubric:criteria}]}),...extraFiles};
  const context=structuredClone(f.input.currentContext);context.entries=Object.entries(files).map(([relativePath,text])=>({relativePath,state:'file',fileIdentity:'component://'+relativePath,
    byteLength:Buffer.byteLength(text),digest:product.sha256Bytes(Buffer.from(text)),encoding:'base64',bytes:Buffer.from(text).toString('base64')})).sort((a,b)=>a.relativePath.localeCompare(b.relativePath));
  context.entries.unshift({relativePath:'.',state:'directory',fileIdentity:'component://directory',members:Object.keys(files).sort()});
  context.readRoots=['.'];context.maxFiles=50;context.maxBytes=100000;
  const {kind,schemaVersion,observationRef,observationDigest,...body}=context;context.observationDigest=hash(body);context.observationRef='worksite-context-observation://abiogenesis/'+context.observationDigest.slice(7);
  assert(product.isWorksiteContextObservation(context));
  const coord=path=>({path,digest:context.entries.find(e=>e.relativePath===path).digest}),coordinate=ref=>({ref,digest:z});
  const authorTask=product.constructNativeWorkspaceWorkTask({...f.input.authority,context,outcome:'Synthetic finite author premise',instructions:['No actor runs in this component fixture.'],readFirst:['source.txt'],writeRoots:['candidate.txt'],checks:[]});
  const author=componentObservation(authorTask),duties=['provenance','evaluate','assess'].map((role,index)=>({ref:'duty://component/'+role,role,bindingRef:'binding://component/'+index,obligationRef:'obligation://component/'+index}));
  const stream=text=>({payload:Buffer.from(text).toString('base64'),byteLength:Buffer.byteLength(text),digest:product.sha256Bytes(Buffer.from(text))});
  const view={kind:'lifecycle_evaluation_input',schemaVersion:version,taskRef:'task://component/finite',sourceResult:coordinate('result://component/original'),
    construction:coordinate('result://component/original-construction'),execution:coordinate('result://component/original-execution'),sourceRefs:[{ref:'source://component',digest:coord('source.txt').digest}],interpretation:coordinate('interpretation://component'),
    selectedDutyRefs:duties.map(d=>d.ref),selectedObligationRefs:duties.map(d=>d.obligationRef),carriedDutyRefs:['duty://component/carried'],carriedBindingRefs:['binding://component/carried'],
    executionRecord:{observation:coordinate('observation://component/execution'),commandResults:[{stdout:stream('actual component execution'),stderr:stream('')}],snapshotMembers:[],predicateObservations:[],provenance:{}},
    currentContext:context,evaluator:{graphFunction:coordinate('graph-function://component/evaluator')},acquisition:{},originalTaskCompletion:'not_claimed',
    constructionObservations:[{groupRef:'group://component',dutyRefs:[duties[0].ref],observation:author}],
    constructionEdges:[{dutyRef:duties[0].ref,obligationRef:duties[0].obligationRef,bindingRef:duties[0].bindingRef,dependentPaths:['candidate.txt'],dependencies:[coord('source.txt')]}],dutyPopulation:duties,carriedDuties:[{dutyRef:'duty://component/carried'}],pendingDutyRefs:duties.map(d=>d.ref),acceptedResultsDisposition:'requires_separate_owner_conjunction'};
  const computed={kind:'lifecycle_computed_records',schemaVersion:version,...Object.fromEntries(['taskRef','sourceResult','construction','execution','sourceRefs','interpretation','selectedDutyRefs','selectedObligationRefs','carriedDutyRefs','carriedBindingRefs'].map(k=>[k,view[k]])),
    evaluator:view.evaluator.graphFunction,evidenceRole:'computed_derivation',originalTaskCompletion:'not_claimed',records:{
      edge:{recordKind:'construction_record',dutyRef:duties[0].ref,obligationRef:duties[0].obligationRef,bindingRef:duties[0].bindingRef,
        dependent:{path:'candidate.txt',afterDigest:coord('candidate.txt').digest},predecessor:{path:'source.txt',declaredDigest:coord('source.txt').digest,producerDutyRef:null},verdict:'true'},
      comparison:{recordKind:'comparison_record',obligationRef:duties[1].obligationRef,bindingRef:duties[1].bindingRef,verdict:'true'},residuals:['absent raw type/argument fields; owner disposition remains open']}};
  const text='unchanged synthetic evaluator-only oracle',oracle={ref:'oracle://component/finite',digest:product.sha256Bytes(Buffer.from(text)),text};
  return {kind:'lifecycle_assessment_input',schemaVersion:version,evaluationState:evaluationOutput(product.constructRetainedGraphInput(view,computed)),
    selection:assessmentSelection({model:{interpretation:view.interpretation},selectedDutyRefs:view.selectedDutyRefs},criteria,
      [{recordPath:'/records/edge',role:'construction_record',dutyRef:duties[0].ref},{recordPath:'/records/comparison',role:'comparison_record',dutyRef:duties[1].ref}],
      ['candidate.txt'],['source.txt'],{...coord('rubric.json'),stageRef}),authority:f.input.authority,oracle,
    independentProducers:[{ref:author.observationRef,digest:author.observationDigest,actorInvocationRef:author.provenance.actorInvocationRef,cCallRef:author.provenance.cCallRef}],originalTaskCompletion:'not_claimed'};
}
test('PC04 finite assessment mapping conserves canonical records and refuses unresolved or colliding labels before dispatch',()=>{
  const input=smallAssessmentInput(),evidence=assessmentEvidence(input),task=constructionAssessmentTask(input);assert(isAssessmentInput(input));
  for(const row of evidence.records) {
    assert.equal(row.label,`computed:${hash(input.evaluationState.computedRecords)}:${row.recordPath}`);
    const record=row.recordPath.endsWith('/edge')?input.evaluationState.computedRecords.records.edge:input.evaluationState.computedRecords.records.comparison;
    assert.equal(row.text,product.canonicalJson({evaluator:input.evaluationState.computedRecords.evaluator,outputDigest:hash(input.evaluationState.computedRecords),recordPath:row.recordPath,record}));
    assert(task.instructions.some(text=>text.endsWith('\n'+row.text)));
  }
  assert.deepEqual(task.writeRoots,[]);assert.deepEqual(task.checks,[]);assert.deepEqual(task.context,input.evaluationState.evaluationInput.currentContext);
  assert.deepEqual(task.assessment.resultContract,assessmentResultContract);assert.equal(task.assessment.schemaAsset.bytesBase64,Buffer.from(ASSESSMENT_SCHEMA_TEXT).toString('base64'));
  assert(task.assessment.sources.every(s=>s.path!==task.assessment.candidate.path&&s.path!==task.assessment.rubric.path));
  for(const change of [x=>{x.selection.recordSelections[0].recordPath='/records/absent';},x=>{x.selection.recordSelections[0].role='comparison_record';},
    x=>{x.selection.recordSelections[0].dutyRef='duty://unselected';},x=>{x.selection.criterionEvidence[0].criterionRef='criterion://unknown';},
    x=>{x.selection.rubric.stageRef='stage://absent';},x=>{x.selection.rubric.digest=hash('wrong');},
    x=>{x.selection.sourcePaths=['candidate.txt'];},x=>{x.selection.recordSelections.push(structuredClone(x.selection.recordSelections[0]));}]) {
    const bad=structuredClone(input);change(bad);assert.throws(()=>constructionAssessmentTask(bad));
  }
  assert.throws(()=>constructionAssessmentTask(smallAssessmentInput({'command-1.stdout':'collision'})),/colliding/);
});
test('PC04 finite native assessment preserves negative, unknown and partial results and rejects wrong producer/task/context',()=>{
  const input=smallAssessmentInput(),evidence=assessmentEvidence(input),task=constructionAssessmentTask(input),raw=satisfiedAssessment(evidence);
  const observed=componentAssessment(task,raw),result=constructionAssessmentOutput(product.constructRetainedGraphInput(input,observed));
  assert.equal(result.assessmentDisposition,'satisfied');assert.equal(result.originalTaskCompletion,'not_claimed');assert.equal(result.semanticClosure,'not_claimed');
  assert.deepEqual(result.preservedResiduals,input.evaluationState.computedRecords.records.residuals);
  for(const disposition of ['falsified','indeterminate']) {
    const negative=structuredClone(raw);negative.criteria[0].disposition=disposition;
    const output=constructionAssessmentOutput(product.constructRetainedGraphInput(input,componentAssessment(task,negative)));
    assert.equal(output.assessmentDisposition,'unsatisfied');assert.equal(output.assessmentObservation.assessment.criteria[0].disposition,disposition);
  }
  for(const change of [x=>{x.criteria[0].evidence[0].quote='invented quote';},x=>{x.criteria[0].evidence[0].path='unknown';},
    x=>{x.criteria[0].evidence=x.criteria[0].evidence.filter(e=>!e.path.startsWith('computed:'));},
    x=>{x.residuals=[{scope:'selected-assessment',criterionRef:x.criteria[0].criterionRef,description:'partial'}];}]) {
    const bad=structuredClone(raw);change(bad);assert.equal(constructionAssessmentOutput(product.constructRetainedGraphInput(input,componentAssessment(task,bad))).assessmentDisposition,'unsatisfied');
  }
  for(const verdict of ['false','unknown']) {
    const negative=structuredClone(input);negative.evaluationState.computedRecords.records.edge.verdict=verdict;
    const negativeEvidence=assessmentEvidence(negative),negativeTask=constructionAssessmentTask(negative);
    const output=constructionAssessmentOutput(product.constructRetainedGraphInput(negative,componentAssessment(negativeTask,satisfiedAssessment(negativeEvidence))));
    assert.equal(output.assessmentDisposition,'unsatisfied');assert.equal(output.computedEvidenceDisposition,verdict);
  }
  for(const overlap of [{actorInvocationRef:observed.provenance.actorInvocationRef},{cCallRef:observed.provenance.cCallRef}]) {
    const other=structuredClone(input);other.independentProducers.push({ref:'observation://component/other',digest:z,actorInvocationRef:'actor://component/other',cCallRef:'c-call://component/other',...overlap});
    assert.throws(()=>constructionAssessmentOutput(product.constructRetainedGraphInput(other,componentAssessment(constructionAssessmentTask(other),raw))),/independent/);
  }
  const wrong=structuredClone(input);wrong.selection.claim+=' wrong task';
  assert.throws(()=>constructionAssessmentOutput(product.constructRetainedGraphInput(wrong,observed)),/exact task/);
  const changed=structuredClone(input);changed.evaluationState.evaluationInput.currentContext=smallAssessmentInput({'another.txt':'changed subject'}).evaluationState.evaluationInput.currentContext;
  assert.throws(()=>constructionAssessmentOutput(product.constructRetainedGraphInput(changed,observed)),/after-context/);
});
test('WP-01 every required dependent/predecessor pair reaches assessment including false and unknown siblings',()=>{
  for(const verdict of ['true','false','unknown']) {
    // Unadmitted finite native premises; the supplied evaluator computes all four edge verdicts.
    const input=structuredClone(smallAssessmentInput({'second.txt':'second independent source',
      'candidate.txt':verdict==='false'?'candidate from source.txt':'candidate from source.txt and second.txt',
      'other-candidate.txt':'other candidate from source.txt and second.txt'}));
    const view=input.evaluationState.evaluationInput,edge=view.constructionEdges[0],context=view.currentContext;
    const coord=path=>({path,digest:context.entries.find(e=>e.relativePath===path).digest});
    edge.dependentPaths.push('other-candidate.txt');edge.dependencies.push(coord('second.txt'));
    const task=product.constructNativeWorkspaceWorkTask({...input.authority,context,outcome:'Synthetic two-output, two-predecessor premise',
      instructions:['No actor runs in this component fixture.'],readFirst:['source.txt','second.txt'],writeRoots:edge.dependentPaths,checks:[]});
    const author=componentObservation(task);
    view.constructionObservations=[{groupRef:'group://component',dutyRefs:[edge.dutyRef],observation:author,
      resolvedDependencies:edge.dependencies.filter(dep=>verdict!=='unknown'||dep.path!=='second.txt').map(dep=>({...dep,dutyRef:edge.dutyRef}))}];
    view.selectedDutyRefs=view.dutyPopulation.filter(d=>d.role!=='evaluate').map(d=>d.ref);
    view.selectedObligationRefs=view.dutyPopulation.filter(d=>d.role!=='evaluate').map(d=>d.obligationRef);
    view.evaluator={graphFunction:f.input.evaluator.graphFunction,parameters:{}};
    const computed=deriveNativeRecords(view);assert.equal(computed.records.verdict,verdict);assert.equal(computed.records.constructionEdges.length,4);
    input.evaluationState=evaluationOutput(product.constructRetainedGraphInput(view,computed));
    input.selection.candidatePaths=edge.dependentPaths;input.selection.sourcePaths=['source.txt','second.txt'];
    input.selection.criterionEvidence.forEach(row=>{row.dutyRefs=view.selectedDutyRefs;row.roles=row.roles.filter(role=>role!=='comparison_record');});
    input.selection.recordSelections=computed.records.constructionEdges.map((record,index)=>({recordPath:'/records/constructionEdges/'+index,role:'construction_record',dutyRef:record.dutyRef}));
    input.independentProducers=[{ref:author.observationRef,digest:author.observationDigest,actorInvocationRef:author.provenance.actorInvocationRef,cCallRef:author.provenance.cCallRef}];
    const evidence=assessmentEvidence(input),assessmentTask=constructionAssessmentTask(input);
    const result=constructionAssessmentOutput(product.constructRetainedGraphInput(input,componentAssessment(assessmentTask,satisfiedAssessment(evidence))));
    assert.equal(result.computedEvidenceDisposition,verdict);assert.equal(result.assessmentDisposition,verdict==='true'?'satisfied':'unsatisfied');
    assert.equal(result.originalTaskCompletion,'not_claimed');
    const omitted=structuredClone(input);
    omitted.selection.recordSelections=omitted.selection.recordSelections.filter((_,index)=>verdict==='true'?index!==1:computed.records.constructionEdges[index].verdict==='true');
    assert.throws(()=>constructionAssessmentTask(omitted),/every required dependent\/predecessor edge/);
    if(verdict==='true') {
      const absent=structuredClone(input);absent.evaluationState.computedRecords.records.constructionEdges.pop();absent.selection.recordSelections.pop();
      assert.throws(()=>constructionAssessmentTask(absent),/every required dependent\/predecessor edge/);
      for(const modify of [row=>{row.dependent.path='other-candidate.txt';},row=>{row.predecessor.declaredDigest=z;},row=>{row.predecessor.producerDutyRef='duty://unrelated';}]) {
        const mismatched=structuredClone(input);modify(mismatched.evaluationState.computedRecords.records.constructionEdges[0]);
        assert.throws(()=>constructionAssessmentTask(mismatched),/must match one required dependent\/predecessor edge/);
      }
    }
  }
});
function assessedFixture() {
  const fixture=combinedFixture(),{input,producer,consumer,sibling,native}=fixture;
  input.origin=projectNativeSource(product,f.terminalValue,{includeAssessment:true});
  const assessor=input.model.duties.find(d=>d.role==='assess');assessor.independentOf=[producer.ref,consumer.ref,f.input.model.duties.find(d=>d.role==='execute').ref];
  input.selectedDutyRefs=[assessor.ref,sibling.ref];
  const rubricFile=input.currentContext.entries.find(e=>e.relativePath==='semantic-assets/lifecycle-rubric.json'),rubric=JSON.parse(Buffer.from(rubricFile.bytes,'base64').toString());
  const stage=rubric.stages.find(s=>s.declarationRef==='stage://odd-glc/generic-lifecycle/evidence@5'),work=select(input).work;
  const records=work.filter(d=>d.role==='provenance').map((d,index)=>({recordPath:'/records/constructionEdges/'+index,role:'construction_record',dutyRef:d.dutyRef}));
  records.push({recordPath:'/records/comparison',role:'comparison_record',dutyRef:fixture.duty.ref});
  const candidatePaths=input.constructionGroups.flatMap(g=>g.writeRoots),sourcePaths=input.currentContext.entries.filter(e=>e.state==='file'&&e.relativePath!==rubricFile.relativePath).map(e=>e.relativePath);
  input.assessment=assessmentSelection({...input,selectedDutyRefs:select(input).selectedDutyRefs},stage.rubric,records,candidatePaths,sourcePaths,
    {path:rubricFile.relativePath,digest:rubricFile.digest,stageRef:stage.declarationRef});
  return {...fixture,stage,work};
}
test('PC04 actual PC03 state joins complete original rubric/oracle and ordinary native assessment with no C2',async()=>{
  const fixture=assessedFixture(),{input,native,stage,work}=fixture;
  assert(isNativeConstructionInput(input));
  const proof={historicalGraphCallSource:()=>({terminalResult:f.terminal})};assert.equal(authenticSource(input,{},proof),true);
  const forged=structuredClone(input);forged.origin.assessmentBasis.evaluationData.purpose='forged oracle';assert.equal(authenticSource(forged,{},proof),false);
  const library=constructProgramConstructionLibrary({gtl,product,artifact,includeNativeConstruction:true,evaluationGraph:evaluator.graphFunctions[0],includeAssessment:true});
  const route={...fixture.route,roles:[...new Set(work.map(d=>d.role))],obligationRefs:[...new Set(work.map(d=>d.obligationRef))],publications:[library,core,native,evaluator],
    graphFunctionRefs:[...fixture.route.graphFunctionRefs,ids.prepareAssessmentInputGraphFunctionRef,ids.assessmentChildGraphFunctionRef],retainEntryAfter:[1,2+input.constructionGroups.length,4+input.constructionGroups.length]};
  const candidate=constructLifecycleProgram({gtl,product,artifact,model:input.model,basis:basis(input),selectedDutyRefs:input.selectedDutyRefs,constructionGroups:input.constructionGroups,routes:[route]});
  assert.equal(candidate.kind,'candidate');const checked=validation(candidate,[native]);assert.equal(checked.kind,'program_validation',JSON.stringify(checked));
  const raw=(x,k)=>validator.rawAdmitValue(x,k,'contract://abiogenesis/gtl/'+k.replaceAll('_','-')+'@5');
  assert.equal(validator.validatePublication(raw(candidate.publication,'module_publication'),candidate.publication.contributions.map(c=>raw(c,'catalog_contribution'))).kind,'publication_validation');
  const packageInputs=await programConstructionPackageInputs({product,publication:candidate.publication});
  assert.equal(packageInputs.sourceFiles['contracts/native-continuation-assessment.schema.json'],ASSESSMENT_SCHEMA_TEXT);
  assert(packageInputs.sourceFiles['build/native-continuation-runtime.mjs'].includes('export function interpretJobEvidenceRows'));
  assert(packageInputs.sourceFiles['build/native-continuation-contracts.mjs']);
  const built=constructOddGlcProductPackage({product,gtl,ids:{...ids,packageName:'@odd-glc/route-one-typescript',packageVersion:'0.3.0-dev.2'},
    abiArtifact:JSON.parse(await fs.readFile(process.env.ABI5_COMPONENT_ROOT+'/product-toolchain-manifest.json','utf8')),
    consumerPublication:candidate.publication,...packageInputs,additionalDependencies:[],packageExports:{'./construction-runtime':'./build/program-construction-runtime.mjs'}});
  assert.equal(built.files['contracts/native-continuation-assessment.schema.json'],ASSESSMENT_SCHEMA_TEXT);
  assert.equal(packageInputs.contractRows[0].owningProduct,ids.productId);assert.equal(packageInputs.contractRows[0].contractId,assessmentResultContract.contractRef);
  const membership=candidate.publication.programs[0].callableMembership;assert(membership.includes(product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef));
  assert(!membership.includes(product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef));
  const child=candidate.publication.graphFunctions.find(g=>g.name===ids.assessmentChildGraphFunctionRef);
  assert.deepEqual(child.template.edges[1].inputBinding,product.graphInputRetentionBinding(ids.assessmentInputContractRef,product.NATIVE_WORKSPACE_WORK_IDS.observationContractRef));
  const state=completedConstruction(input),view=constructedEvaluationInput(product.constructRetainedGraphInput(input,state));
  assert.equal(Object.hasOwn(state.entry,'assessmentBasis'),false);assert.equal(Object.hasOwn(view,'assessmentBasis'),false);assert.equal(Object.hasOwn(view,'oracle'),false);
  const evaluated=evaluationOutput(product.constructRetainedGraphInput(view,deriveNativeRecords(view))),assessedInput=constructionAssessmentInput(product.constructRetainedGraphInput(input,evaluated));
  assert.deepEqual(JSON.parse(assessedInput.oracle.text),f.terminalValue.current.job.evaluationData);
  const evidence=assessmentEvidence(assessedInput);assert.deepEqual(evidence.criteria.map(({mandatory,...c})=>c),stage.rubric);assert(evidence.criteria.every(c=>c.mandatory));
  const task=constructionAssessmentTask(assessedInput),observation=componentAssessment(task,satisfiedAssessment(evidence));
  const result=constructionAssessmentOutput(product.constructRetainedGraphInput(assessedInput,observation));assert.equal(result.assessmentDisposition,'satisfied');
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(ids.assessedConstructionPredicateRef).evaluate(input,result),true);
  assert.equal(result.acceptedResultsDisposition,'requires_separate_owner_conjunction');assert.deepEqual(result.preservedResiduals,evaluated.computedRecords.records.residuals);
  assert.deepEqual(task.context,state.currentContext);assert.deepEqual(task.assessment.producer,{resultRef:state.constructionObservations.at(-1).observation.observationRef,
    resultDigest:state.constructionObservations.at(-1).observation.observationDigest,cCallRef:state.constructionObservations.at(-1).observation.provenance.cCallRef,
    actorInvocationRef:state.constructionObservations.at(-1).observation.provenance.actorInvocationRef});
});
// These are explicit unadmitted owner premises. No workspace or grant is written.
function reboundComponentAuthority(original,context) {
  const authority=structuredClone(original),w=authority.workspaceBinding;
  w.roots.productRoot+='/component-successor';
  const {kind,schemaVersion,bindingId,bindingDigest,admissionEventRef,...bindingBody}=w;
  w.bindingDigest=hash(bindingBody);w.bindingId='workspace-binding://abiogenesis/'+w.bindingDigest.slice(7);
  w.admissionEventRef='event://component/unadmitted-binding';
  const grant=authority.capabilityGrant;grant.scopeRef=w.bindingId;grant.scopeDigest=w.bindingDigest;
  const {kind:gk,schemaVersion:gv,grantRef,grantDigest,...grantBody}=grant;
  grant.grantDigest=hash(grantBody);grant.grantRef='capability-grant://abiogenesis/'+grant.grantDigest.slice(7);
  assert(product.isCapabilityGrantValue(grant));
  const currentContext=structuredClone(context);currentContext.workspaceBindingIdentity=w.bindingId;currentContext.workspaceBindingDigest=w.bindingDigest;
  const {kind:ck,schemaVersion:cv,observationRef,observationDigest,...body}=currentContext;
  currentContext.observationDigest=hash(body);currentContext.observationRef='worksite-context-observation://abiogenesis/'+currentContext.observationDigest.slice(7);
  assert(product.isWorksiteContextObservation(currentContext));return {authority,currentContext};
}
function preservedFixture() {
  const fixture=assessedFixture(),originalInput=fixture.input,reports=['The original task remains open.','Independent assessment must judge this remaining uncertainty.'];
  const constructionState=completedConstruction(originalInput,{},reports),current=reboundComponentAuthority(originalInput.authority,constructionState.currentContext);
  const historicalSelection={...structuredClone(f.input.historicalSelection),contract:{ref:ids.constructionStateContractRef,digest:hash('component construction state contract')},
    valueKind:'lifecycle_construction_state',valueDigest:hash(constructionState),result:{ref:'result://component/preserved-construction',digest:hash('component preserved result')}};
  historicalSelection.producer.graphFunction={ref:ids.constructionChildGraphFunctionRef,digest:hash('component construction child')};
  const input=constructPreservedConstructionInput({originalInput,constructionState,historicalSelection,sourceSelection:originalInput.sourceSelection,...current,
    evaluator:{...originalInput.evaluator,fitJudgment:{ref:'judgment://component/repaired-evaluator',digest:hash('repaired evaluator')}}});
  const owner={terminalResult:{...historicalSelection,value:constructionState,projectionBasis:{}},
    input:{graphFunctionRef:'graph-function://component/original-root',contractRef:ids.nativeInputContractRef,value:originalInput},
    publication:{moduleRef:ids.moduleRef,owningProductId:ids.productId}};
  return {...fixture,input,reports,owner};
}
test('PC05 preserved construction suffix authenticates both historical values and declares no author or C2',()=>{
  const {input,native,owner,route:oldRoute}=preservedFixture(),original=input.originalInput;
  assert(isPreservedConstructionInput(input));
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.admitInput(ids.preservedInputContractRef,input),input);
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.admitInput(ids.nativeInputContractRef,input),null);
  const request=reacquisitionRequest(input),predicate=PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(preservedConstructionStages[0].predicateRef);
  assert.equal(predicate.evaluate(input,request,{}, {historicalGraphCallSource:()=>owner}),true);
  assert.equal(predicate.evaluate(input,request,{},{}),false);
  for(const mutate of [o=>{o.input.value.currentContext=structuredClone(input.currentContext);},
    o=>{o.terminalResult.value.gaps=[];},o=>{o.input.contractRef=ids.inputContractRef;},
    o=>{o.terminalResult.producer.graphFunction.ref=ids.assessmentChildGraphFunctionRef;}]) {
    const crossed=structuredClone(owner);mutate(crossed);assert.equal(authenticPreservedConstruction(input,{}, {historicalGraphCallSource:()=>crossed}),false);
  }
  assert.deepEqual(request.sourceNativeWork,input.constructionState.constructionObservations.at(-1).observation);
  assert.notEqual(request.currentContext.workspaceBindingIdentity,request.sourceNativeWork.after.workspaceBindingIdentity);
  const library=constructProgramConstructionLibrary({gtl,product,artifact,includeNativeConstruction:true,evaluationGraph:evaluator.graphFunctions[0],includeAssessment:true,includePreservedConstruction:true});
  const route={...oldRoute,roles:[...new Set(select(original).work.map(d=>d.role))],obligationRefs:[...new Set(select(original).work.map(d=>d.obligationRef))],
    publications:[library,core,native,evaluator],graphFunctionRefs:[ids.preservedAuthenticateGraphFunctionRef,product.NATIVE_WORK_REACQUISITION_IDS.graphFunctionRef,
      ids.prepareConstructedEvaluationGraphFunctionRef,ids.evaluationChildGraphFunctionRef,ids.prepareAssessmentInputGraphFunctionRef,ids.assessmentChildGraphFunctionRef],retainEntryAfter:[1,3]};
  const candidate=constructLifecycleProgram({gtl,product,artifact,model:original.model,basis:basis(original),selectedDutyRefs:original.selectedDutyRefs,
    constructionGroups:original.constructionGroups,preservedConstruction:true,routes:[route]});
  assert.equal(candidate.kind,'candidate');const checked=validation(candidate,[native]);assert.equal(checked.kind,'program_validation',JSON.stringify(checked));
  const raw=(x,k)=>validator.rawAdmitValue(x,k,'contract://abiogenesis/gtl/'+k.replaceAll('_','-')+'@5');
  const published=validator.validatePublication(raw(candidate.publication,'module_publication'),candidate.publication.contributions.map(c=>raw(c,'catalog_contribution')));
  assert.equal(published.kind,'publication_validation',JSON.stringify(published));
  const membership=candidate.publication.programs[0].callableMembership;
  assert(!membership.includes(product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef));assert(!membership.includes(product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef));
  assert(!membership.includes(ids.constructionChildGraphFunctionRef));assert(membership.includes(product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef));
  const root=candidate.publication.graphFunctions.find(g=>g.name===candidate.start.graphFunctionRef);
  assert.equal(root.declarations['abg.failure_contract'],ids.failureContractRef);assert.deepEqual(root.template.nodes.map(n=>n.term.graphFunctionRef),route.graphFunctionRefs);
});
test('PC05 preserved reports reach current independent assessment while historical author bytes remain unchanged',()=>{
  const {input,reports}=preservedFixture(),before=product.canonicalJson(input),acquired=acquiredFor(input);
  const view=constructedEvaluationInput(product.constructRetainedGraphInput(input,acquired)),computed=deriveNativeRecords(view),
    evaluated=evaluationOutput(product.constructRetainedGraphInput(view,computed));
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(ids.constructedEvaluationPredicateRef).evaluate(input,evaluated),true);
  assert.deepEqual(view.constructionObservations,input.constructionState.constructionObservations);assert.deepEqual(view.currentContext,input.currentContext);
  const assessed=constructionAssessmentInput(product.constructRetainedGraphInput(input,evaluated)),evidence=assessmentEvidence(assessed),task=constructionAssessmentTask(assessed);
  for(const row of view.constructionObservations) {
    assert(task.instructions.some(s=>s.includes(product.canonicalJson(row.observation.report))&&s.includes(row.observation.observationRef)&&s.includes(row.observation.provenance.actorInvocationRef)));
  }
  assert(reports.every(report=>task.instructions.some(s=>s.includes(report))));assert.deepEqual(task.context,input.currentContext);assert.deepEqual(task.workspaceBinding,input.authority.workspaceBinding);
  assert.deepEqual(JSON.parse(assessed.oracle.text),input.originalInput.origin.assessmentBasis.evaluationData);
  const observed=componentAssessment(task,satisfiedAssessment(evidence)),result=constructionAssessmentOutput(product.constructRetainedGraphInput(assessed,observed));
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(ids.assessedConstructionPredicateRef).evaluate(input,result),true);
  assert.equal(product.canonicalJson(input),before);assert.equal(input.constructionState.disposition,'partial');
  const author=view.constructionObservations[0].observation;
  assert.throws(()=>constructionAssessmentOutput(product.constructRetainedGraphInput(assessed,componentAssessment(task,satisfiedAssessment(evidence),author.provenance))),/independent assessor/);
  const wrong=structuredClone(evaluated);wrong.evaluationInput.constructionObservations.at(-1).observation.report.gaps=[];
  assert.equal(PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(ids.constructedEvaluationPredicateRef).evaluate(input,wrong),false);
  const crossed=structuredClone(acquired);crossed.sourceReacquisition.request.source.graphCallRef='graph-call://crossed';
  assert.throws(()=>constructedEvaluationInput(product.constructRetainedGraphInput(input,crossed)),/acquired native task|exact preserved/);
});
test('PC05 preserved currentness refuses changed or absent content and a matching wrong terminal role',()=>{
  const {input,owner}=preservedFixture(),path=input.originalInput.constructionGroups.at(-1).writeRoots[0];
  for(const absent of [false,true]) {
    const changed=structuredClone(input),context=changed.currentContext,file=context.entries.find(e=>e.relativePath===path);
    if(absent) {
      context.entries=context.entries.filter(e=>e.relativePath!==path);
      const parent=path.includes('/')?path.slice(0,path.lastIndexOf('/')):'.',name=path.slice(path.lastIndexOf('/')+1);
      context.entries.find(e=>e.relativePath===parent).members=context.entries.find(e=>e.relativePath===parent).members.filter(n=>n!==name);
    } else {
      const bytes=Buffer.from('changed after the preserved author');Object.assign(file,{bytes:bytes.toString('base64'),byteLength:bytes.length,digest:product.sha256Bytes(bytes)});
    }
    const {kind,schemaVersion,observationRef,observationDigest,...body}=context;
    context.observationDigest=hash(body);context.observationRef='worksite-context-observation://abiogenesis/'+context.observationDigest.slice(7);
    assert(product.isWorksiteContextObservation(context));assert(isPreservedConstructionInput(changed),'shape cannot establish currentness');
    assert.throws(()=>reacquisitionRequest(changed),/exact retained context/);
  }
  const wrong=structuredClone(input),matching=structuredClone(owner);
  wrong.historicalSelection.producer.graphFunction.ref=ids.assessmentChildGraphFunctionRef;
  matching.terminalResult.producer.graphFunction.ref=ids.assessmentChildGraphFunctionRef;
  assert.equal(authenticPreservedConstruction(wrong,{}, {historicalGraphCallSource:()=>matching}),false);
});
test('applicability unknown stays residual, false records basis, cycles refuse',()=>{
  for(const [value,expected] of [['unknown','gap'],['false','report_refs']]) {
    const input=structuredClone(f.input);input.model.duties.filter(d=>d.role==='evaluate').forEach(d=>d.applicability.value=value);
    assert.equal(select(input).disposition,expected);
  }
  const cyclic=structuredClone(f.input);cyclic.model.duties[0].requires=[cyclic.model.duties.at(-1).ref];assert.throws(()=>select(cyclic),/cyclic/);
});
test('actual incompatible effects/interfaces and ambiguous candidates refuse selection',()=>{
  const changed=structuredClone(route);changed.publications[2].graphFunctions[0].effects=['effect://component/ungranted'];
  assert.equal(construct(f.input,[changed]).gaps[0].cause,'effect_not_permitted');
  const incompatible=structuredClone(route);incompatible.publications[2].graphFunctions[0].inputs=['contract://component/wrong'];
  assert.throws(()=>construct(f.input,[incompatible]),/incompatible/);
  assert.equal(construct(f.input,[route,route]).gaps[0].cause,'ambiguous_compatible_composition');
});
test('irrelevant history and task labels do not change declaration identity or residual reduction',()=>{
  const input=structuredClone(f.input);input.model.taskRef='task://different-label';
  const a=construct(),b=construct(input);assert.equal(a.start.programRef,b.start.programRef);
  assert.equal(a.start.programRef,construct(f.input,[{...route,fitJudgment:{ref:'judgment://other-task/fit',digest:hash('other-fit')}}]).start.programRef);
  assert.deepEqual(select(f.input,{basis:{...basis(f.input),unrelatedHistory:['unused audit']}}),select());
});
test('first judgment refuses absent owner proof and forged retained source even when caller JSON is shaped',()=>{
  const request=reacquisitionRequest(f.input),relation=PROGRAM_CONSTRUCTION_SEMANTICS.resolveJudgmentRelation(stages[0].predicateRef);
  assert.equal(relation.evaluate(f.input,request),false);assert.equal(authenticSource(f.input,{},{}),false);
  const changed=structuredClone(f.terminalValue);changed.current.basis.jobRef='semantic-job://forged';
  assert.equal(authenticSource(f.input,{}, {historicalGraphCallSource:()=>({terminalResult:{...f.terminal,value:changed}})}),false);
  const substituted=structuredClone(f.input);substituted.origin.execution.digest=hash('forged');
  assert.equal(authenticSource(substituted,{}, {historicalGraphCallSource:()=>({terminalResult:f.terminal})}),false);
});
test('actual retained streams compute exact reviewed-candidate records; pure checks grant no admission',async()=>{
  const input=componentEvaluationInput(),output=deriveNativeRecords(input),expected=JSON.parse(await fs.readFile(new URL('./fixtures/program-construction/expected-native44.json',import.meta.url),'utf8'));
  assert.deepEqual(evaluateNativeRecords(input).resultCandidate,output,'actual packaged leaf hashes only I-JSON values');
  assert.deepEqual(output.records.derivationBasis.executionObservation,input.executionRecord.observation);
  assert.equal(Object.hasOwn(output.records.derivationBasis,'producer'),false,'absent historical fields remain absent');
  for(const [key,value] of Object.entries(expected))assert.deepEqual(output.records[key],value,key);
  assert.equal(output.records.perSuite.length,2);assert(output.records.perSuite.every(s=>s.passed));
  assert.equal(input.executionObservation,undefined,'evaluator gets an admitted compact record view, never native prompt bodies');
  assert.equal(input.executionRecord.commandResults.length,9);
  assert.equal(output.execution.ref,f.coordinates.execution.resultRef);assert.equal(output.evidenceRole,'computed_derivation');
  assert.equal(EVALUATOR_SEMANTICS.resolveJudgmentRelation(fixtureIds.predicateRef).evaluate(input,output),true);
  const altered=structuredClone(output);altered.records.conditions.componentPassed=false;
  assert.equal(EVALUATOR_SEMANTICS.resolveJudgmentRelation(fixtureIds.predicateRef).evaluate(input,altered),false);
  const stale=structuredClone(input);stale.currentContext.entries.find(e=>e.relativePath==='test-execution-plan.json').digest=hash('stale');
  assert.throws(()=>deriveNativeRecords(stale),/selected native evaluator input required/);
});

test('TAP headings are not results; role attribution still rejects absent, duplicate or conflicting results',()=>{
  const input=componentEvaluationInput(),titles=input.evaluator.parameters.suites.map(s=>s.title);
  const summaries=['1..2','# tests 2','# suites 0','# pass 2','# fail 0','# cancelled 0','# skipped 0','# todo 0'];
  const records=lines=>{
    // These are unadmitted parser premises, never replacements for native44 evidence.
    const changed=structuredClone(input),bytes=Buffer.from(['TAP version 13',...lines,...summaries,''].join('\n'));
    changed.executionRecord.commandResults.find(r=>r.commandId===changed.evaluator.parameters.plannedCommandId).stdout={
      payload:bytes.toString('base64'),byteLength:bytes.length,digest:product.sha256Bytes(bytes)};
    return deriveNativeRecords(changed).records;
  };
  const lines=[`# Subtest: ${titles[0]}`,`ok 1 - ${titles[0]}`,`# Subtest: ${titles[1]}`,`ok 2 - ${titles[1]}`];
  const passed=records(lines);
  assert.deepEqual(passed.conditions,{componentPassed:true,uatPassed:true,planSatisfied:true,passFloor:true});
  assert(passed.perSuite.every(s=>s.witnesses.length===1));
  for(const first of [[],[`ok 1 - ${titles[0]}`,`ok 3 - ${titles[0]}`],
    [`ok 1 - ${titles[0]}`,`not ok 3 - ${titles[0]}`],[`ok 1 - unrelated ${titles[0]}`]]) {
    const refused=records([`# Subtest: ${titles[0]}`,...first,...lines.slice(2)]);
    assert.equal(refused.conditions.componentPassed,false);
    assert.equal(refused.conditions.uatPassed,true);
  }
});
