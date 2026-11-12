import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as product from '../../build/code/src/product/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import * as v from 'valibot';
import {setupInstalledRootExecutionBasis,publicOperationBasis,installOncePerFile,installTenantOnce} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledRunReadCall,runInstalledCliRequest,pendingExecutionUseRequest,constructInstalledPendingCall} from '../support/registered-graph-selection.mjs';
import {declarations,initialState,validState,evaluatedState,selectionTask,executeA,executeB,SEMANTICS,ref,contract,hash} from '../fixtures/registered-selection-product/recursive.mjs';
const packageRoot=new URL('../..',import.meta.url).pathname;

// A run environment that declares a selector role at the fixture's
// registered-selection source: the refusal lane's subject.
function environmentDeclaration(){
  const text='Use the declared frame.',digest=product.sha256Bytes(Buffer.from(text)),member={path:'frame.txt',type:'file',digest,target:null};
  const contextMember={memberRef:'member:frame',path:member.path,byteCount:Buffer.byteLength(text),digest};
  return gtl.constructRunEnvironmentDeclaration({kind:'run_environment_declaration',schemaVersion:'5.0.0',declarationRef:'environment:fixture',dependencies:[{dependencyRef:'dependency:frame',basisRef:'generic://frame/',recordRef:'record:frame',recordDigest:digest,recordFormat:'member_inventory@1',inventoryDigest:gtl.stdoInventoryDigest([member]),members:[member]}],
    contexts:[{contextRef:'context:frame',sourceLocator:'generic://frame/',inventoryDigest:hash([contextMember]),members:[contextMember]}],corpusAccess:null,accesses:[],
    roles:[{graphFunctionRef:ref('graph-function','root'),programLocusRef:ref('node','select'),role:'selector',frameRefs:['frame:executive'],policy:{policyRef:'policy:frame',text,digest},contextPolicy:{policyRef:'policy:context',selectors:['full_source','active_binding_semantics']},accessRefs:[],sourceBindings:[{contextRef:'context:frame',memberRef:contextMember.memberRef,memberDigest:digest,startByte:0,endByte:Buffer.byteLength(text),spanDigest:digest}]}]});
}
test('run.continue current-execution arms are exclusive request alternatives under one closed continuationKind domain',()=>{
  const c=r=>({ref:r,digest:'sha256:'+'1'.repeat(64)}),current=product.RUN_OPERATION_CONTRACTS.continue.current_intent,selected=product.RUN_OPERATION_CONTRACTS.continue.selected_action;
  const base={run:c('run://x'),continuation:c('continuation://x'),continuationInput:c('result://x'),expectedBasis:c('execution-basis://x')},ok=(schema,value)=>v.safeParse(schema,value).success;
  assert.equal(ok(current.requestSchema,{...base,currentIntent:c('intent://x')}),true,'construction-intent arm');
  assert.equal(ok(current.requestSchema,{...base,pendingCursor:c('cursor://x')}),true,'pending-execution arm');
  assert.equal(ok(current.requestSchema,{...base,currentIntent:c('intent://x'),pendingCursor:c('cursor://x')}),false,'mixed arm refuses');
  assert.equal(ok(current.requestSchema,base),false,'no arm refuses');
  assert.equal(ok(current.requestSchema,{...base,pendingCursor:c('cursor://x'),selectedAction:c('action://x')}),false,'no action field on the pending arm');
  assert.equal(ok(selected.requestSchema,{...base,pendingCursor:c('cursor://x')}),false,'the pending arm is not a selected_action request');
  assert.deepEqual(current.metadata.closedDomains.continuationKind,['current_intent','pending_execution']);
  assert.deepEqual(selected.metadata.closedDomains.continuationKind,['selected_action']);
  const result={run:c('run://x'),graphCall:null,admittedIntent:null,successor:c('continuation://x'),disposition:'completed',evidence:[c('evidence://x')],replay:c('replay://x')};
  for(const kind of ['current_intent','pending_execution'])assert.equal(ok(current.resultSchema,{...result,continuationKind:kind}),true,kind);
  assert.equal(ok(current.resultSchema,{...result,continuationKind:'selected_action'}),false,'selected_action is not a current-execution result');
  assert.equal(ok(selected.resultSchema,{...result,admittedIntent:c('intent://x'),continuationKind:'selected_action'}),true);
  assert.equal(ok(selected.resultSchema,{...result,admittedIntent:c('intent://x'),continuationKind:'pending_execution'}),false,'pending_execution is not a selected_action result');
});
test('recursive fixture declares a valid bounded Program with one registered F_D selector',()=>{
  const digest='sha256:'+'1'.repeat(64),d=declarations(gtl);
  const publication=gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...d,artifactDigest:digest,productContentDigest:digest,productManifestDigest:digest,contributions:d.contributions.map(c=>({...c,provenanceRefs:[digest]}))});
  const raw=(v,k)=>{const result=validator.rawAdmitValue(v,k,'contract:fixture');assert.equal(result.kind,'raw_admitted_value',JSON.stringify(result));return result;};
  const admitted=raw(publication,'module_publication');
  const validation=validator.validateProgram({declarationBasisDigest:admitted.subjectDigest,programPublication:admitted,program:raw(publication.programs[0],'gtl_program'),graphFunctions:publication.graphFunctions.map(v=>raw(v,'graph_function')),contracts:publication.contracts.map(v=>raw(v,'contract_declaration')),evaluators:publication.evaluators,rules:publication.rules,implementationBindings:publication.implementationBindings.map(v=>raw(v,'implementation_binding')),closureContracts:publication.closureContracts.map(v=>raw(v,'closure_contract'))});
  assert.equal(validation.kind,'program_validation',JSON.stringify(validation));
  assert.deepEqual(d.graphFunctions[0].template.applications.map(a=>[a.relationKind,a.sourceProgramLocusRef]),[['registered_selection',ref('node','select')]]);
  assert.equal(validation.executableLeafRows.filter(r=>r.fibre==='F_P').length,0,'the selector is the declared F_D rule');
  const app=d.graphFunctions.at(-1).template.applications[0];assert.equal(app.bound,3);assert.equal(app.foldback.requiresParentEvaluation,true);
  assert.equal(gtl.recursionTerminationDecision(app,initialState()),false);
  assert.equal(gtl.recursionTerminationDecision(app,{kind:'missing-state'}),null);
});
// Refusal lane: an F_P registered-selection source with a declared selector role
// (a native registered-selection task route) is refused at every program door
// with an existing code. The run-environment declaration alone stays admissible
// data, and the same F_P selection without the role stays a valid Program.
function nativeSelectorDeclarations(withRole){
  const d=declarations(gtl),root=d.graphFunctions[0],select=root.template.nodes.find(n=>n.nodeRef===ref('node','select'));
  select.term={...select.term,fibre:'F_P'};
  d.implementationBindings=d.implementationBindings.map(b=>b.bindingRef===ref('binding','select')?{...b,computeRegime:'F_P'}:b);
  d.evaluators[0]={...d.evaluators[0],regime:'F_P'};
  for(const c of d.contracts)if(c.contractRef===contract('request'))c.valueKind='registered_selection_task';
  d.contracts.push({contractRef:contract('native-response'),contractVersion:'5.0.0',contractKind:'output',valueKind:'registered_selection_response'});
  root.declarations={...root.declarations,'abg.compute_regime':'F_P','abg.raw_result_contract':contract('native-response')};
  d.programs[0].policies={...d.programs[0].policies,'abg.compute_regime':'F_P'};
  if(withRole){const environment=environmentDeclaration();d.programs[0].policies['abg.run_environment']=environment.declarationRef;d.runEnvironments=[environment];}
  const digest='sha256:'+'1'.repeat(64);
  return gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...d,artifactDigest:digest,productContentDigest:digest,productManifestDigest:digest,contributions:d.contributions.map(c=>({...c,provenanceRefs:[digest]}))});
}
test('a declared selector role at an F_P registered-selection source is refused at every program door',async()=>{
  const m03=await import('@abiogenesis/typescript-tenant/abg/m03');
  const raw=(v,k)=>{const result=validator.rawAdmitValue(v,k,'contract:fixture');assert.equal(result.kind,'raw_admitted_value',JSON.stringify(result));return result;};
  const doors=publication=>{
    const admitted=raw(publication,'module_publication'),program=publication.programs[0];
    const validation=validator.validateProgram({declarationBasisDigest:admitted.subjectDigest,programPublication:admitted,program:raw(program,'gtl_program'),graphFunctions:publication.graphFunctions.map(v=>raw(v,'graph_function')),contracts:publication.contracts.map(v=>raw(v,'contract_declaration')),evaluators:publication.evaluators,rules:publication.rules,implementationBindings:publication.implementationBindings.map(v=>raw(v,'implementation_binding')),closureContracts:publication.closureContracts.map(v=>raw(v,'closure_contract'))});
    const packet=m03.admitGtlProgramConformanceInput({kind:'conformance_evaluate_packet',schemaVersion:'5.0.0',memberKey:'gtl_program',publication,program});
    assert.equal(packet.kind,'raw_admitted_value',JSON.stringify(packet));
    return {validation,conformance:m03.typecheckGtlProgram(packet),observe:()=>product.observeRunEnvironment({publication,program,graphFunctions:publication.graphFunctions,
      authority:{authorityRef:'authority:refusal-lane',authorityDigest:hash('authority'),actorRef:'actor:refusal-lane'},archiveRoot:tmpdir()})};
  };
  const generic=doors(nativeSelectorDeclarations(false));
  assert.equal(generic.validation.kind,'program_validation',JSON.stringify(generic.validation));
  assert.equal(generic.validation.executableLeafRows.filter(r=>r.fibre==='F_P').length,1,'registered F_P selection without the role is a valid Program');
  assert.equal(generic.conformance.disposition,'passed',JSON.stringify(generic.conformance));
  assert.deepEqual(await generic.observe(),{kind:'run_environment_observed',evidence:null});
  const role=doors(nativeSelectorDeclarations(true)),runEnvironment={code:'invalid_reference',path:'$.runEnvironments'};
  assert.equal(role.validation.kind,'static_validation_refusal');
  assert.ok(role.validation.diagnostics.some(x=>x.code===runEnvironment.code&&x.path===runEnvironment.path),JSON.stringify(role.validation.diagnostics));
  assert.equal(role.conformance.disposition,'failed');assert.equal(role.conformance.code,'validation_failed');
  assert.ok(role.conformance.diagnostics.some(x=>x.code===runEnvironment.code&&x.path===runEnvironment.path),JSON.stringify(role.conformance.diagnostics));
  assert.deepEqual(await role.observe(),{kind:'run_environment_refusal',cause:'unsupported_declaration',issuePath:'/program/runEnvironment'});
  // The native task and raw response are not registered choices, and the
  // Product package exports no native task guard, schema or binder.
  assert.equal(gtl.isRegisteredGraphChoice({kind:'registered_selection_task',schemaVersion:'5.0.0',task:'t',observations:[],requiredSupportRefs:[],childInput:{contractRef:contract('recursive-state'),value:initialState()}}),false);
  assert.equal(gtl.isRegisteredGraphChoice({kind:'registered_selection_response',disposition:'selected',graphFunctionRef:ref('graph-function','A'),reason:'r',evidenceRefs:[]}),false);
  for(const name of ['isNativeRegisteredSelectionTask','isNativeRegisteredSelectionResponse','nativeRegisteredSelectionResponseSchema','materializeNativeRegisteredChoice'])
    assert.equal(name in product,false,name);
});
test('receiver counterevidence and unresolved task survive child returns until parent evaluation',()=>{
  const initial=initialState(),first=executeA(initial).resultCandidate;
  assert.equal(SEMANTICS.resolveJudgmentRelation(ref('predicate','workflow')).evaluate(initial,first),true);
  assert.equal(first.measurements[0].accepted,false);assert.equal(first.terminal,false);assert.deepEqual(first.unresolvedSupportRefs,initial.requiredSupportRefs);
  const secondInput=evaluatedState(first),task=selectionTask(secondInput);
  assert.deepEqual(task.childInput.value,secondInput);assert.deepEqual(task.observations.at(-1).value,first.measurements[0]);
  const second=executeB(secondInput).resultCandidate;assert.equal(second.measurements[1].accepted,true);assert.equal(second.terminal,false);
  assert.deepEqual(second.unresolvedSupportRefs,initial.requiredSupportRefs);
  const terminal=evaluatedState(second);assert.equal(terminal.terminal,true);assert.deepEqual(terminal.unresolvedSupportRefs,[]);
  for(const s of [first,secondInput,second,terminal]){assert.equal(validState(s),true);assert.deepEqual(s.task,initial.task);assert.equal(s.taskDigest,initial.taskDigest);assert.deepEqual(s.requiredSupportRefs,initial.requiredSupportRefs);}
  const childRelation=SEMANTICS.resolveJudgmentRelation(ref('predicate','B'));
  assert.equal(childRelation.evaluate(secondInput,terminal),false,'child cannot clear obligations or certify parent completion');
  for(const alter of [s=>{delete s.taskDigest;},s=>{s.requiredSupportRefs=[];},s=>{s.measurements[0].accepted=true;},s=>{s.measurements[0].diagnostic='fabricated';}]){
    const bad=structuredClone(first);alter(bad);assert.equal(validState(bad),false);assert.throws(()=>selectionTask(bad),/invalid recursive/);
  }
});

// One tiny external deterministic Product supplies controlled leaf bytes. Its
// actual installed implementations, semantics, ABG admission, storage and cold
// projectors remain genuine owners. Only the HoG source under test is linked
// in memory, avoiding a tenant build/pack and any recording or replay double.
function failureDeclarations(g){
  const d=declarations(g),root=d.graphFunctions[0],A=d.graphFunctions[1],parent=d.graphFunctions.at(-1);
  root.template={kind:'inline_graph',graphRef:ref('graph','root'),startNodeRef:ref('node','call-A'),terminalNodeRefs:[ref('node','call-A')],
    nodes:[{nodeRef:ref('node','call-A'),nodeKind:'c_locus',term:g.workflow.C(g.cGraphFunctionRef({graphFunctionRef:A.name,input:g.cCarrier(contract('recursive-state')),output:g.cCarrier(contract('recursive-state'))}))}],edges:[],applications:[]};
  d.graphFunctions=[root,A,parent];d.contributions=d.contributions.filter(c=>d.graphFunctions.some(f=>f.name===c.handle));
  d.implementationBindings=d.implementationBindings.filter(b=>[ref('binding','A'),ref('binding','parent')].includes(b.bindingRef)).map(b=>({...b,modulePath:'build/failure.mjs'}));
  d.productSemanticsBinding.modulePath='build/failure.mjs';d.evaluators=d.evaluators.filter(e=>e.name===ref('evaluator','parent'));d.rules=d.rules.filter(r=>r.name===ref('rule','parent'));
  d.programs[0].callableMembership=d.graphFunctions.map(f=>f.name);
  return d;
}
const failureFixtureSource=`
import {executeA as first,evaluateParent,executeB as accepted,SEMANTICS as original,ref,contract,hash} from './recursive.mjs';
export {evaluateParent};
const diagnosticRef='diagnostic://registered-selection/original-child-failure@5';
export function executeA(input){
 if(input.measurements.length===0)return first(input);
 if(input.task.scenario==='success')return {...accepted(input),evidenceCandidates:accepted(input).evidenceCandidates.map(e=>({...e,implementationRef:ref('implementation','A')}))};
 const resultCandidate={kind:'selection_failure',schemaVersion:'5.0.0',failureClass:'controlled_child_failure',diagnosticRef};
 return {kind:'leaf_realization_candidate',schemaVersion:'5.0.0',disposition:'failure',resultCandidate,diagnosticRef,
 evidenceCandidates:[{kind:'deterministic_evidence_candidate',schemaVersion:'5.0.0',implementationRef:ref('implementation','A'),inputDigest:hash(input),outputDigest:hash(resultCandidate)}]};
}
const descriptor=name=>{const body={implementationRef:ref('implementation',name),packageName:original.packageName,packageVersion:'5.0.0',modulePath:'build/failure.mjs',namedSymbol:name==='A'?'executeA':'evaluateParent',computeRegime:'F_D',inputContractRef:contract('recursive-state'),outputContractRef:contract('recursive-state'),failureContractRef:contract('failure'),refusalContractRef:contract('refusal')};return {kind:'packaged_leaf_implementation_descriptor',schemaVersion:'5.0.0',...body,descriptorDigest:hash(body)};};
export const A_DESCRIPTOR=descriptor('A'),PARENT_DESCRIPTOR=descriptor('parent');
export const SEMANTICS={...original,resolveJudgmentRelation(predicateRef){
 if(predicateRef!==ref('predicate','A'))return original.resolveJudgmentRelation(predicateRef);
 return {predicateRef,advanceReasonRef:ref('reason','valid'),rejectionReasonRef:ref('reason','unresolved'),evaluate(input,output){return hash(output)===hash(executeA(input).resultCandidate);}};
}};
`;
// The failure-fixture cases share one packed, verified and installed Product
// (the tenant and the failure fixture Product) for this file; each environment
// opens its own store, workspace and scratch root on it.
const failureFixtureInstall=installOncePerFile(async()=>{
  const fixtureRoot=await mkdtemp(join(tmpdir(),'abi5-recursive-failure-source-')),removeFixture=()=>rm(fixtureRoot,{force:true,recursive:true});
  try{
    const fixturePath=join(fixtureRoot,'failure.mjs');await writeFile(fixturePath,failureFixtureSource);
    const install=await installTenantOnce(packageRoot,{candidateBasisSource:'packed_artifact',
      prepareAdditionalProducts:async basis=>{
        const artifact=process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH??join(basis.scratch,'artifacts',(await readdir(join(basis.scratch,'artifacts'))).find(p=>p.endsWith('.tgz')));
        return [await prepareRegisteredSelectionProduct({...basis,abiPackageArchivePath:artifact,declarationFactory:failureDeclarations,
          fixtureFiles:[...['index','recursive'].map(n=>({path:'build/'+n+'.mjs',source:new URL('../fixtures/registered-selection-product/'+n+'.mjs',import.meta.url)})),{path:'build/failure.mjs',source:fixturePath}]})];
      }});
    return {install,fixtureRoot,dispose:async()=>{try{await install.dispose();}finally{await removeFixture();}}};
  }catch(error){await removeFixture();throw error;}
});
async function linkedOwner(environment,relative,code,overrides={},expose=[]){
  const built=join(environment.installedRoot,'build/code/src',relative+'.js');
  const module=new SourceTextModule(code+(expose.length?'\nexport {'+expose.join(',')+'};':''),{identifier:built});
  await module.link(async specifier=>{
    const target=specifier.startsWith('.')?pathToFileURL(resolve(dirname(built),specifier)).href:specifier;
    const values=overrides[specifier]??await import(target);
    return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});
  });
  await module.evaluate();return module.namespace;
}
// The frozen external fixture remains F_D. This control supplies diagnostic
// bytes through the actual leaf owner boundary; it does not claim that the
// installed fixture implements an F_P preparation exception or these bytes.
async function retainedDiagnosticCCallOwner(env,load,diagnosticRef){
  const leafOwner=await load('implementation/leaf_invocation_port'),storeOwner=await load('abg/event_store');
  const controlledDeterministicRealizer=async(port,call)=>{
    const original=await port.invoke(call);
    if(call.resolution.implementationRef!==ref('implementation','A')||call.input.measurements.length===0)return original;
    assert.equal(call.resolution.computeRegime,'F_D');assert.equal(original.kind,'closed_leaf_owner_receipt');
    assert.equal(original.computeRegime,'F_D');assert.notEqual(original.receipt,null);assert.equal(original.candidate.disposition,'failure');
    const failureValueKind=port.contractValueKind(call.failureContractRef,'failure');
    assert.equal(failureValueKind,'selection_failure');
    const resultCandidate={...original.candidate.resultCandidate,diagnosticRef};
    const candidate={...original.candidate,diagnosticRef,resultCandidate,
      evidenceCandidates:original.candidate.evidenceCandidates.map(e=>({...e,outputDigest:hash(resultCandidate)}))};
    return leafOwner.invokeLeafOwnerBoundary({resolution:call.resolution,value:call.input,inputDigest:call.inputDigest,
      failureValueKind,occurrence:call.occurrence,
      verifyAuthority:()=>{
        storeOwner.assertHeldEventStoreAtDurablePrefix(env.store,call.predecessorPrefix);
        return port.isExactLoadedCapability()&&port.isAdmittedResolution(call.resolution)&&original.receipt!==null;
      },
      validateSuccess:value=>port.validateContractValue(call.resolution.outputContractRef,'output',value),
      resolveWorkerContracts:()=>null,
      loadImplementation:async()=>value=>{assert.equal(value,call.input);return candidate;}});
  };
  const code=await readFile(join(env.installedRoot,'build/code/src/hog/ccall_lifecycle.js'),'utf8');
  const callSite='input.leafPort.invoke({';assert.equal(code.split(callSite).length,2);
  return linkedOwner(env,'hog/ccall_lifecycle',
    'import {controlledDeterministicRealizer} from "../implementation/leaf_invocation_port.js";\n'+
    code.replace(callSite,'controlledDeterministicRealizer(input.leafPort,{'),
    {'../implementation/leaf_invocation_port.js':{...leafOwner,controlledDeterministicRealizer}});
}
test('authenticated recursive child failure preserves its diagnostic, prior work and cold failed truth',async t=>{
  const shared=await failureFixtureInstall(),prepared=shared.install.additionalProducts[0],fixtureRoot=shared.fixtureRoot;
  const sourceCode=await readFile(join(packageRoot,'build/code/src/hog/recursion_lifecycle.js'),'utf8');
  const opaqueDiagnostic='diagnostic://registered-selection/original-child-failure@5',mismatch='diagnostic://abiogenesis/hog/application-foldback-mismatch@5';
  const cases=[];
  // RETIRED: the 'old-failure' arm, whose installed recursion owner yielded the
  // application-foldback mismatch; the installed owner is the head owner and
  // preserves the child diagnostic, which every failure scenario asserts.
  for(const scenario of ['failure','retained-diagnostic','retained-null','success']){
    const input=initialState();input.task={...input.task,scenario:scenario==='success'?'success':'failure'};input.taskDigest=hash(input.task);
    const env=await setupInstalledRootExecutionBasis(t,packageRoot,{install:shared.install,candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
      programRef:ref('program','root'),graphFunctionRef:ref('graph-function','recursive-parent'),input});
    const load=relative=>import(pathToFileURL(join(env.installedRoot,'build/code/src',relative+'.js')).href);
    const diagnosticOwner=await load('abg/runtime_failure'),profiles=await load('abg/event_contract_profiles');
    const retained=scenario.startsWith('retained-');
    const diagnostic=scenario==='retained-null'?diagnosticOwner.constructRuntimeFailureDiagnosticRef(null):
      scenario==='retained-diagnostic'?profiles.undispatchedOwnerDiagnosticRef('preparation','thrown',new TypeError('controlled F_D diagnostic bytes é𝄞')):opaqueDiagnostic;
    const retainedSubject=diagnosticOwner.readRuntimeFailureDiagnosticSubject(diagnostic);
    const owner=await linkedOwner(env,'hog/recursion_lifecycle',sourceCode,{},['projectFailedRecursionChildTruth','requireDeferredApplication']);
    const captures=[];
    const selected=owner;
    // graph_execute completes a recursion child through the owned completion.
    const recursion={...selected,completeOwnedRecursionChild(frame,child){
      captures.push({frame,child});
      if((scenario==='failure'||retained)&&child.disposition==='failed'){
        assert.equal(child.replayState.runtimeStatus,'active','valid child-local failure leaves its enclosing Run live');
        const state=owner.requireDeferredApplication(frame.restored,frame.restoration),project=c=>owner.projectFailedRecursionChildTruth(frame,state,c);
        const count=env.store.readAll().length;assert.ok(project(child));
        const prior=captures[0].frame,priorState=owner.requireDeferredApplication(prior.restored,prior.restoration);
        assert.equal(owner.projectFailedRecursionChildTruth(frame,priorState,child),null,'genuine failed child cannot be paired with an earlier admitted parent attempt');
        for(const changed of [{...child,cCallRef:state.cCall.cCallRef},{...child,resultRef:state.result.resultRef},{...child,judgmentRef:state.judgment.judgmentRef},
          {...child,resultValue:{...child.resultValue,diagnosticRef:'diagnostic://crossed'}},{...child,diagnosticRef:'diagnostic://crossed'},{...child,closureRef:'closure://unadmitted'},
          {...child,successorPrefix:frame.restored.successorPrefix},{...child,resultRef:null}])assert.equal(project(changed),null);
        assert.equal(owner.projectFailedRecursionChildTruth({...frame,childExecutionBasis:{...frame.childExecutionBasis,parentExecutionBasisRef:'basis://crossed'}},state,child),null);
        for(const changed of [{parentCCallRef:'c-call://crossed'},{rawInputAdmissionRef:'result://crossed'},{rawInputDigest:hash('crossed')}])
          assert.equal(owner.projectFailedRecursionChildTruth({...frame,childExecutionBasis:{...frame.childExecutionBasis,...changed}},state,child),null);
        assert.equal(owner.projectFailedRecursionChildTruth({...frame,childTraversalScope:{...frame.childTraversalScope,runId:'run://crossed'}},state,child),null);
        assert.throws(()=>owner.completeOwnedRecursionChild(frame,{...child,disposition:'held',continuationRef:null}),/inconsistent lineage/);
        if(retained){
          assert.throws(()=>env.abg.admitRuntimeFailure({store:env.store,predecessorPrefix:child.successorPrefix,
            executionBasis:state.input.executionBasis,scope:state.input.openedTraversalScope,stage:'route',
            subject:{stage:'replacement-child-failure-subject'},diagnosticRef:diagnostic,
            basis:{eventTime:'2026-07-21T00:00:00.000Z',correlationId:'correlation://retained-subject-refusal',causationEventRefs:[]}}),
            /diagnostic does not match its retained subject digest/,'unchanged failure owner rejects subject replacement');
        }
        assert.equal(env.store.readAll().length,count,'pure crossed/stale/held refusals admit no events');
      }
      return selected.completeOwnedRecursionChild(frame,child);
    }};
    const graphOverrides={'./recursion_lifecycle.js':recursion};
    if(retained)graphOverrides['./ccall_lifecycle.js']=await retainedDiagnosticCCallOwner(env,load,diagnostic);
    const graph=await linkedOwner(env,'hog/graph_execute',await readFile(join(env.installedRoot,'build/code/src/hog/graph_execute.js'),'utf8'),graphOverrides);
    const opened=env.abg.openTraversalScope(env.store,env.durablePrefix,{kind:'root',executionBasis:env.executionBasis},{eventTime:'2026-07-21T00:00:00.000Z',correlationId:'correlation://recursive-failure/'+scenario+'/open',causationEventRefs:[]});
    assert.equal(opened.kind,'traversal_scope_open_admission');
    const result=await graph.executeGraphTraversal({store:env.store,predecessorPrefix:opened.successorPrefix,executionBasis:env.executionBasis,
      openedTraversalScope:opened.scope,program:env.program,programPublication:env.executionResolution.programPublication,programValidation:env.programValidation,
      graphFunction:env.graphFunction,graph:env.graph,graphValidation:env.graphValidation,implementationSet:env.implementationSet,
      interactionSet:env.executionBasisAdmission.interactionSet,leafPort:env.leafPort,actorRuntimeBinding:{workspaceBinding:env.workspaceBinding,artifactTruth:env.artifactTruth},
      input:env.input,inputDigest:env.rawInput.subjectDigest,closureContract:env.closureContract,eventTime:'2026-07-21T00:00:00.000Z',correlationId:'correlation://recursive-failure/'+scenario});
    const events=env.store.readAll(),runEvents=events.filter(e=>e.runId===opened.run.runId),failures=runEvents.filter(e=>e.kind==='runtime_failure_observed');
    if(scenario==='success'){
      // Model-free pending-execution premise: retained log bytes cut at durable
      // event boundaries of this actual installed recursion/workflow Run.
      const continuation=await load('abg/construction_continuation'),storeOwner=await load('abg/event_store');
      const lines=(await readFile(join(env.scratch,'runtime','events.jsonl'))).toString('utf8').split('\n');
      const coldAt=event=>{const i=lines.findIndex(l=>l.includes('"eventId":"'+event.eventId+'"'));assert.ok(i>=0,'durable boundary row');
        return env.abg.selectValidatedRuntimeEventPrefix(storeOwner.validateHistoricalEvents(Buffer.from(lines.slice(0,i+1).join('\n')+'\n')));};
      const pending=event=>continuation.projectPendingExecutionContinuations(coldAt(event),opened.run.runId);
      const leaves=runEvents.filter(e=>e.kind==='c_call_opened'&&e.payload.programLocusRef===ref('node','A'));
      assert.equal(leaves.length,2,'one completed and one later leaf occurrence');
      const [done,later]=leaves,row=kind=>runEvents.find(e=>e.aggregateId===later.aggregateId&&e.kind===kind);
      const [p]=pending(row('c_call_fibre_selected'));
      assert.deepEqual(p.chain.map(c=>c.relation),['root','recursion','workflow'],'unfinished recursive and workflow returns');
      assert.equal(p.status,'open');assert.equal(p.phase,'effect_unknown','an opened call has no attested absence of dispatch');assert.equal(p.pendingCCallRef,later.aggregateId);
      assert.equal(p.pendingCursorRef,later.payload.cursorRef);assert.equal(p.pendingCursorDigest,later.payload.cursorDigest);
      assert.notEqual(p.pendingCCallRef,done.aggregateId,'completed work is not a pending position');
      const termination=runEvents.find(e=>e.kind==='c_call_opened'&&e.aggregateId===p.chain[1].parentCCallRef);
      assert.equal(termination.payload.stageRole,'termination');
      assert.ok(runEvents.some(e=>e.kind==='c_call_result_admitted'&&e.aggregateId===termination.aggregateId),'non-terminal parent evaluation is admitted');
      const producer=runEvents.find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===p.progressedInputRef);
      assert.equal(producer?.payload.resultClass,'success','progressed input is an admitted producer Result');
      assert.equal(producer.payload.valueDigest,p.progressedInputDigest);
      assert.notEqual(p.progressedInputRef,env.executionBasis.rawInputAdmissionRef,'progressed input is not graph-entry input');
      assert.deepEqual(pending(row('c_call_fibre_selected')),[p],'cold acquisition is deterministic');
      assert.match(p.continuationRef,/^continuation:\/\/abiogenesis\//);assert.equal(p.continuationDigest,(await load('shared/digests')).sha256Canonical((({continuationRef,continuationDigest,openedEventRef,terminalEventRef,status,...body})=>body)(p)));
      assert.equal(pending(row('c_call_evidenced'))[0].phase,'effect_unknown','evidence without Result keeps its effect unknown');
      assert.deepEqual(pending(row('c_call_result_admitted')),[],'an admitted Result awaiting judgment is another phase');
      const fold=runEvents.filter(e=>e.kind==='child_foldback_admitted'&&e.payload.parentCCallRef===p.chain[2].parentCCallRef);
      assert.equal(fold.length,1);assert.deepEqual(pending(fold[0]),[],'a folded child awaiting its parent Result is another phase');
      assert.deepEqual(pending(runEvents.find(e=>e.kind==='run_closed')),[],'a closed Run has no pending execution');
    }
    const parentResults=runEvents.filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===ref('graph-function','recursive-parent'));
    assert.equal(parentResults[1].payload.value.measurements[0].accepted,false);assert.deepEqual(parentResults[1].payload.value.task,input.task);
    assert.equal(runEvents.filter(e=>e.kind==='child_foldback_admitted'&&e.payload.applicationRef!==undefined).length,scenario==='success'?2:1);
    if(scenario==='success'){assert.equal(result.disposition,'closed');assert.equal(result.resultValue.terminal,true);assert.equal(failures.length,0);}
    else{
      assert.equal(result.disposition,'failed');assert.equal(result.diagnosticRef,diagnostic);assert.equal(failures.length,1);
        const {frame,child}=captures.at(-1),truth=owner.projectFailedRecursionChildTruth(frame,owner.requireDeferredApplication(frame.restored,frame.restoration),child);
        assert.equal(result.resultRef,child.resultRef);assert.equal(result.judgmentRef,child.judgmentRef);assert.deepEqual(result.resultValue,child.resultValue);
        assert.equal(failures[0].payload.diagnosticRef,diagnostic);assert.deepEqual(failures[0].causationEventRefs,[truth.routeEventRef]);
        if(retained){
          assert.equal(failures[0].payload.subjectDigest,hash(retainedSubject));
          const evidence=diagnosticOwner.projectRuntimeFailureEvidenceAtPrefix(env.abg.selectValidatedRuntimeEventPrefix(events));
          assert.equal(evidence.length,1);assert.equal(evidence[0].availability,'retained');assert.deepEqual(evidence[0].subject,retainedSubject);
          const childResult=runEvents.find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===child.resultRef);
          assert.equal(childResult.payload.value.diagnosticRef,diagnostic);
          assert.equal(runEvents.some(e=>e.kind==='c_call_evidenced'&&e.payload.evidenceClass==='undispatched_owner_refusal'),false,
            'controlled F_D diagnostic proof claims no F_P owner observation');
        }
        assert.equal(runEvents.some(e=>e.kind==='runtime_failure_observed'&&e.payload.diagnosticRef===mismatch),false);
        const count=events.length,globallyFailed={...child,replayState:result.replayState};assert.equal(owner.completeOwnedRecursionChild(frame,globallyFailed),globallyFailed);
        assert.equal(env.store.readAll().length,count);
    }
    const handoff=env.store.projectReopenAuthorityAndClose(),cold=env.abg.reopenEventStore(structuredClone(handoff.reopenAuthority));
    assert.equal(cold.kind,'reopened_event_store_context');
    const reads=await load('abg/project_read_ports'),runReplay=reads.prepareRunReadAtDurablePrefix(cold.prefix,'run_replay',opened.run.runId).project(),runResult=reads.prepareRunReadAtDurablePrefix(cold.prefix,'run_result',opened.run.runId).project();
    assert.equal(runReplay.disposition,'projected');assert.equal(runReplay.value.runtimeStatus,scenario==='success'?'closed':'failed');
    if(retained){const coldEvents=env.abg.readRuntimeEventsAtDurablePrefix(cold.prefix),coldEvidence=diagnosticOwner.projectRuntimeFailureEvidenceAtPrefix(env.abg.selectValidatedRuntimeEventPrefix(coldEvents));
      assert.equal(coldEvidence.length,1);const evidence=coldEvidence[0],coldFailure=coldEvents.find(e=>e.eventId===evidence.admissionEventRef);
      assert.equal(coldFailure.kind,'runtime_failure_observed');assert.equal(coldFailure.runId,opened.run.runId);
      assert.equal(evidence.failureRef,coldFailure.payload.failureRef);assert.equal(evidence.failureDigest,coldFailure.payload.failureDigest);
      assert.equal(evidence.admissionEventDigest,coldFailure.payloadDigest);assert.equal(evidence.subjectDigest,hash(retainedSubject));
      assert.equal(evidence.availability,'retained');assert.deepEqual(evidence.subject,retainedSubject);
      assert.equal(coldFailure.payload.diagnosticRef,diagnostic);assert.deepEqual(coldFailure.causationEventRefs,failures[0].causationEventRefs);}
    if(scenario==='success')assert.equal(runResult.disposition,'projected');else{assert.equal(runResult.code,'target_absent');assert.equal(runReplay.value.terminalResult,null);}
    assert.deepEqual(cold.store.projectReopenAuthorityAndClose().prefix,handoff.prefix);
    cases.push({scenario,eventCount:events.length,runId:opened.run.runId,disposition:result.disposition,diagnosticRef:result.diagnosticRef,
      priorParentResult:parentResults[1].payload.resultRef,childResultRef:result.resultRef,coldRuntimeStatus:runReplay.value.runtimeStatus,prefixDigest:handoff.prefix.coordinateDigest});
  }
  t.diagnostic(JSON.stringify({cases,fixtureArtifact:{...prepared.basis,artifactPath:prepared.artifactPath,sourceRoot:prepared.sourceRoot},fixtureRoot,sourceUnderTestDigest:product.sha256Bytes(Buffer.from(sourceCode)),
    proofLimit:'Genuine installed lower admission/storage/read owners with in-memory HoG linkage; retained lanes use a disclosed controlled F_D realizer through invokeLeafOwnerBoundary and unchanged declared fibre/contracts. Installed F_P exception reachability is source-proven separately; no installed145/F_P-to-HoG join, provider, DataMapper, UAT or semantic adequacy claim.'}));
});

// Model-free same-Run pending execution over the actual installed
// recursion/workflow owners. A controlled interruption stops the process
// boundary before the second workflow leaf opens its call: no Result, failure
// or closure is admitted. The occurrence is then derived cold, refused for
// crossed coordinates, consumed once by one admitted current_intent-member
// pending_execution operation and resumed by HoG in the same Run.
// One controlled interruption shared by the owner-path and Public-path tests:
// the process boundary stops before the second workflow leaf opens its call.
async function interruptedRecursiveRun(t){
  const input=initialState();input.task={...input.task,scenario:'success'};input.taskDigest=hash(input.task);
  const env=await setupInstalledRootExecutionBasis(t,packageRoot,{install:(await failureFixtureInstall()).install,candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    programRef:ref('program','root'),graphFunctionRef:ref('graph-function','recursive-parent'),input});
  const load=relative=>import(pathToFileURL(join(env.installedRoot,'build/code/src',relative+'.js')).href);
  const cc=await load('abg/construction_continuation'),storeOwner=await load('abg/event_store');
  const ccall=await load('hog/ccall_lifecycle');let interrupted=0;
  const interrupting={...ccall,evaluateOwnedExecutableCCall(context){
    if(context.stop.programLocusRef===ref('node','A')&&context.input.measurements.length>0){interrupted++;throw new Error('controlled process interruption');}
    return ccall.evaluateOwnedExecutableCCall(context);
  }};
  const graph=await linkedOwner(env,'hog/graph_execute',await readFile(join(env.installedRoot,'build/code/src/hog/graph_execute.js'),'utf8'),{'./ccall_lifecycle.js':interrupting});
  const time='2026-11-02T00:00:00.000Z';
  const opened=env.abg.openTraversalScope(env.store,env.durablePrefix,{kind:'root',executionBasis:env.executionBasis},{eventTime:time,correlationId:'correlation://pending-execution/open',causationEventRefs:[]});
  assert.equal(opened.kind,'traversal_scope_open_admission');
  const runtime={program:env.program,programPublication:env.executionResolution.programPublication,programValidation:env.programValidation,
    graphFunction:env.graphFunction,graph:env.graph,graphValidation:env.graphValidation,implementationSet:env.implementationSet,
    interactionSet:env.executionBasisAdmission.interactionSet,leafPort:env.leafPort,actorRuntimeBinding:{workspaceBinding:env.workspaceBinding,artifactTruth:env.artifactTruth},
    closureContract:env.closureContract,eventTime:time};
  await assert.rejects(graph.executeGraphTraversal({...runtime,store:env.store,predecessorPrefix:opened.successorPrefix,executionBasis:env.executionBasis,
    openedTraversalScope:opened.scope,input:env.input,inputDigest:env.rawInput.subjectDigest,correlationId:'correlation://pending-execution/original'}),/controlled process interruption/);
  assert.equal(interrupted,1);
  const runId=opened.run.runId,interruptedEvents=env.store.readAll(),runAt=events=>events.filter(e=>e.runId===runId);
  assert.equal(runAt(interruptedEvents).some(e=>['run_closed','runtime_failure_observed','run_stopped'].includes(e.kind)),false,'interruption admits no terminal or failure truth');
  return {env,load,cc,storeOwner,runtime,time,opened,runId,interruptedEvents,runAt};
}
test('interrupted recursive workflow resumes its exact pending execution once in the same Run',async t=>{
  const {env,load,cc,storeOwner,runtime,time,opened,runId,interruptedEvents,runAt}=await interruptedRecursiveRun(t);
  const cold=async()=>env.abg.selectValidatedRuntimeEventPrefix(storeOwner.validateHistoricalEvents(await readFile(join(env.scratch,'runtime','events.jsonl'))));
  const [p,...extra]=cc.projectPendingExecutionContinuations(await cold(),runId);
  assert.equal(extra.length,0);assert.deepEqual(p.chain.map(c=>c.relation),['root','recursion','workflow'],'unfinished recursive and workflow returns');
  assert.equal(p.phase,'undispatched');assert.equal(p.pendingCCallRef,null);assert.equal(p.status,'open');
  const producer=runAt(interruptedEvents).find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===p.progressedInputRef);
  assert.equal(producer?.payload.resultClass,'success','progressed input is an admitted producer Result');assert.equal(producer.payload.valueDigest,p.progressedInputDigest);
  assert.notEqual(p.progressedInputRef,env.executionBasis.rawInputAdmissionRef,'progressed input is not graph-entry input');
  assert.equal(producer.payload.value.measurements.length,1,'the completed first child measurement is the progressed input');
  const termination=runAt(interruptedEvents).find(e=>e.kind==='c_call_opened'&&e.aggregateId===p.chain[1].parentCCallRef);
  assert.equal(termination.payload.stageRole,'termination');
  assert.equal(termination.payload.attempt,runAt(interruptedEvents).filter(e=>e.kind==='c_call_opened'&&e.payload.stageRole==='termination').length,
    'the pending recursion level is under the latest parent evaluation; its consumed allowance is that admitted attempt');
  // An earlier cut at the first leaf's opened call is another phase: its effect is unknown and refuses.
  const firstLeaf=runAt(interruptedEvents).find(e=>e.kind==='c_call_fibre_selected'&&runAt(interruptedEvents).some(o=>o.kind==='c_call_opened'&&o.aggregateId===e.aggregateId&&o.payload.programLocusRef===ref('node','A')));
  const lines=(await readFile(join(env.scratch,'runtime','events.jsonl'))).toString('utf8').split('\n');
  const cut=lines.findIndex(l=>l.includes('"eventId":"'+firstLeaf.eventId+'"'));assert.ok(cut>0);
  const early=env.abg.selectValidatedRuntimeEventPrefix(storeOwner.validateHistoricalEvents(Buffer.from(lines.slice(0,cut+1).join('\n')+'\n')));
  const [unknown]=cc.projectPendingExecutionContinuations(early,runId);assert.equal(unknown.phase,'effect_unknown');
  const rootScope=env.abg.projectOpenedTraversalScopeForFrameAtPrefix?.(await cold(),p.chain[0].frameId)??opened.scope;
  const coordinate=(ref,digest)=>({ref,digest});
  const requestFor=o=>({run:coordinate(runId,rootScope.runDigest),continuation:coordinate(o.continuationRef,o.continuationDigest),
    pendingCursor:coordinate(o.pendingCursorRef,o.pendingCursorDigest),continuationInput:coordinate(o.progressedInputRef??'none',o.progressedInputDigest??hash('none')),
    expectedBasis:coordinate(o.chain[0].basisRef,o.chain[0].basisDigest)});
  const request=requestFor(p),zero='sha256:'+'0'.repeat(64);
  assert.deepEqual(cc.selectPendingExecutionUse(early,requestFor(unknown)),{kind:'refused',code:'replay_mismatch',path:'/continuation/effect'});
  const count=env.store.readAll().length,now=env.abg.selectValidatedRuntimeEventPrefix(env.store.readAll());
  for(const [name,patch,code,path] of [['continuation',{continuation:coordinate(p.continuationRef,zero)},'missing_continuation','/continuation'],
    ['run',{run:coordinate(runId,zero)},'basis_mismatch','/run'],['basis',{expectedBasis:coordinate(p.chain[0].basisRef,zero)},'basis_mismatch','/expectedBasis'],
    ['cursor',{pendingCursor:coordinate(p.pendingCursorRef,zero)},'response_mismatch','/pendingCursor'],
    ['input',{continuationInput:coordinate(env.executionBasis.rawInputAdmissionRef,env.executionBasis.rawInputDigest)},'response_mismatch','/continuationInput']])
    assert.deepEqual(cc.selectPendingExecutionUse(now,{...request,...patch}),{kind:'refused',code,path},name);
  assert.equal(env.store.readAll().length,count,'refusals admit nothing');
  const use=cc.selectPendingExecutionUse(now,request);assert.equal(use.kind,'pending_execution_use',JSON.stringify(use));
  assert.equal(use.source.continuationRef,p.continuationRef);assert.equal(use.rootBasis.basisRef,env.executionBasis.basisRef);
  const packet=env.product.RUN_OPERATION_CONTRACTS.continue.current_intent;
  assert.deepEqual(packet.metadata.closedDomains.continuationKind,['current_intent','pending_execution']);
  const grant=env.product.constructCapabilityGrant(env.policy,env.actorRef,'abg.operation.run.continue',packet.metadata.capabilityRefs[0],
    {admittedInstalls:env.admittedInstalls,workspaceBinding:env.workspaceBinding,fixedPacket:packet});
  const operationBasis=n=>({...publicOperationBasis(env.product,'abg.operation.run.continue',env.workspaceBinding.bindingId,env.workspaceBinding.bindingDigest,
    'public-invocation://pending-execution/'+n,[],'current_intent'),eventTime:time,correlationId:'correlation://pending-execution/use/'+n});
  assert.throws(()=>cc.admitPendingExecutionContinuationOperation(env.store,storeOwner.selectHeldEventStoreDurablePrefix(env.store),{...use},grant,operationBasis(0)),/exact occurrence/,'an unselected copy grants no use');
  const admitted=cc.admitPendingExecutionContinuationOperation(env.store,storeOwner.selectHeldEventStoreDurablePrefix(env.store),use,grant,operationBasis(1));
  const operation=env.store.readAll().find(e=>e.kind==='public_operation_admitted'&&e.payload.continuationKind==='pending_execution');
  assert.equal(operation.payload.memberKey,'current_intent');assert.equal(operation.payload.variant,'pending_execution');assert.equal(operation.runId,undefined,'a workspace operation, not a Run event');
  const afterUse=env.abg.selectValidatedRuntimeEventPrefix(env.store.readAll());
  assert.equal(cc.projectPendingExecutionContinuations(afterUse,runId)[0].status,'consumed');
  assert.deepEqual(cc.selectPendingExecutionUse(afterUse,request),{kind:'refused',code:'resolved_continuation',path:'/continuation'},'one use');
  assert.ok(cc.projectPendingExecutionOperation(afterUse,operation),'cold operation correspondence');
  // Combined Public invocation truth: the continuation owner, not F_H, claims the
  // pending_execution operation; the same invocation is a duplicate, another is available.
  const fh=await load('abg/fh_continuation_projection'),effectful=await load('abg/effectful_invocation_truth');
  assert.deepEqual(fh.projectFhEffectfulPublicInvocationFacts(afterUse),{disposition:'valid',facts:[]},'pending_execution is not an F_H arm');
  const duplicate=effectful.projectEffectfulPublicInvocationTruthAtPrefix(afterUse,'public-invocation://pending-execution/1');
  assert.equal(duplicate.disposition,'duplicate',JSON.stringify(duplicate.disposition==='invalid_history'?duplicate:null));
  assert.equal(duplicate.priorAdmission.publicOperationEventRef,operation.eventId);assert.equal(duplicate.priorAdmission.operationId,'abg.operation.run.continue');
  assert.equal(effectful.projectEffectfulPublicInvocationTruthAtPrefix(afterUse,'public-invocation://pending-execution/2').disposition,'available');
  // Mixed-arm payloads fail their owner projection; a construction kind never reaches F_H.
  const crossed=patch=>({...operation,payload:{...operation.payload,...patch}});
  assert.equal(cc.projectPendingExecutionOperation(afterUse,crossed({memberKey:'selected_action'})),null,'pending kind under the selected_action member');
  assert.equal(cc.projectPendingExecutionOperation(afterUse,crossed({variant:'current_intent'})),null,'pending kind under the construction-intent variant');
  assert.equal(cc.projectSelectedActionOperation(afterUse,crossed({continuationKind:'selected_action'})),null,'selected-action kind over a pending payload');
  assert.equal(cc.isConstructionContinuationKind('pending_execution'),true);assert.equal(cc.isConstructionContinuationKind('fh_interaction'),false);
  assert.equal(cc.isConstructionContinuationKind(undefined),false,'a malformed or unknown kind stays with F_H, which refuses it');
  const completedBefore=runAt(env.store.readAll()).filter(e=>e.kind==='c_call_opened').map(e=>e.payload.cursorRef);
  const hog=await load('hog/graph_execute');
  const result=await hog.executeGraphTraversal({pendingExecutionResume:true,continuation:{runId,continuationRef:p.continuationRef,continuationDigest:p.continuationDigest},
    root:{...runtime,store:env.store,predecessorPrefix:admitted.successorPrefix,executionBasis:use.rootBasis,openedTraversalScope:use.rootScope,correlationId:'correlation://pending-execution/resume'}});
  assert.equal(result.disposition,'closed',JSON.stringify(result));assert.equal(result.resultValue.terminal,true);
  const final=runAt(env.store.readAll()),reopened=final.filter(e=>e.kind==='c_call_opened'&&completedBefore.includes(e.payload.cursorRef));
  assert.equal(reopened.length,completedBefore.length,'no completed position is reopened or redispatched');
  const resumed=final.filter(e=>e.kind==='c_call_opened'&&!completedBefore.includes(e.payload.cursorRef));
  assert.equal(resumed[0].payload.cursorRef,p.pendingCursorRef,'the first resumed call is the exact pending position');
  assert.equal(final.filter(e=>e.kind==='child_foldback_admitted'&&e.payload.applicationRef!==undefined).length,2,'workflow and recursion returns complete');
  assert.equal(final.filter(e=>e.kind==='run_closed').length,1);assert.equal(final.some(e=>e.kind==='runtime_failure_observed'),false);
  assert.equal(new Set(final.map(e=>e.runId)).size,1,'same Run identity');
  assert.deepEqual(final.find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===p.progressedInputRef),producer,'original producer Result unchanged');
  const parentResults=final.filter(e=>e.kind==='c_call_result_admitted'&&e.aggregateId!==undefined&&final.some(o=>o.kind==='c_call_opened'&&o.aggregateId===e.aggregateId&&o.payload.stageRole==='termination'));
  assert.equal(parentResults.at(-1).payload.value.measurements.length,2);assert.deepEqual(parentResults.at(-1).payload.value.measurements[0],producer.payload.value.measurements[0],'completed child measurement conserved');
  const finalCold=await cold();
  assert.deepEqual(cc.projectPendingExecutionContinuations(finalCold,runId),[],'no pending execution remains');
  assert.ok(cc.projectPendingExecutionOperation(finalCold,operation),'cold operation correspondence after completion');
  assert.deepEqual(cc.selectPendingExecutionUse(finalCold,request),{kind:'refused',code:'resolved_continuation',path:'/continuation'},'duplicate after completion');
  assert.equal(effectful.projectEffectfulPublicInvocationTruthAtPrefix(finalCold,'public-invocation://pending-execution/1').disposition,'duplicate','duplicate invocation after completion');
  const handoff=env.store.projectReopenAuthorityAndClose(),reopenedStore=env.abg.reopenEventStore(structuredClone(handoff.reopenAuthority));
  const reads=await load('abg/project_read_ports');
  const replay=reads.prepareRunReadAtDurablePrefix(reopenedStore.prefix,'run_replay',runId).project(),runResult=reads.prepareRunReadAtDurablePrefix(reopenedStore.prefix,'run_result',runId).project();
  assert.equal(replay.disposition,'projected');assert.equal(replay.value.runtimeStatus,'closed');assert.equal(runResult.disposition,'projected');
  reopenedStore.store.projectReopenAuthorityAndClose();
  t.diagnostic(JSON.stringify({runId,continuationRef:p.continuationRef,chain:p.chain.map(c=>c.relation),eventsBefore:interruptedEvents.length,eventsAfter:final.length,
    proofLimit:'In-process controlled interruption at a durable undispatched boundary; installed owners and the actual cut log; ABG/HoG owner path, not the Public CLI. Root installed fresh-process witness remains separate.'}));
});

// The same controlled interruption, then a cold reopen through the real installed
// Public CLI and the run.continue current-execution member's pending_execution
// arm: crossed refusal, one consumed use, duplicate and second-use refusals, and
// cold run_result/run_replay reads. Generic recursion fixture; the default-library
// pending-Testing topology and Root's installed fresh-process witness remain separate.
test('interrupted recursive workflow resumes once through the cold Public run.continue pending_execution arm',async t=>{
  const {env,load,cc,opened,runId,interruptedEvents,runAt}=await interruptedRecursiveRun(t);
  const {product}=env,publicApi=await load('public/index'),projectReadContracts=await load('abg/project_read_operation_contracts');
  const prefix=env.abg.selectValidatedRuntimeEventPrefix(env.store.readAll());
  const [p,...extra]=cc.projectPendingExecutionContinuations(prefix,runId);
  assert.equal(extra.length,0);assert.equal(p.phase,'undispatched');assert.equal(p.status,'open');
  const coordinate=(ref,digest)=>({ref,digest}),zero='sha256:'+'0'.repeat(64);
  const request=await pendingExecutionUseRequest({environment:env,prefix,runId,pending:p});
  const producer=runAt(interruptedEvents).find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===p.progressedInputRef);
  const completedBefore=runAt(interruptedEvents).filter(e=>e.kind==='c_call_opened').map(e=>e.payload.cursorRef);
  let handoff=env.store.projectReopenAuthorityAndClose();
  // The shared support assembles the cold Public pending_execution call through
  // the shipped constructor. This Run's root admission names the fixture's
  // admitted invocation authority (asserted only); no run-environment resources.
  const pending=await constructInstalledPendingCall({environment:env,publicApi,continuation:cc,prefix,request,expectedAuthority:env.invocationAuthority,
    eventResource:()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)}),
    identityScope:'pending-execution-public',eventTime:'2026-11-02T00:01:00.000Z',provenanceRef:ref('provenance','fixture')});
  assert.equal(pending.use.source.continuationRef,p.continuationRef);assert.equal(pending.population.slots.input_contract.valueRef,p.progressedInputRef);
  const cli=async(identity,call)=>{
    const execution=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:`pending-${identity}-${Math.random().toString(16).slice(2)}`,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null});
    const receipt=execution.output?.receipt;assert.ok(receipt,JSON.stringify(execution).slice(0,4000));assert.equal(receipt.failure,null,JSON.stringify(receipt).slice(0,4000));
    if(receipt.resources?.eventResource?.closeHandoff)handoff=receipt.resources.eventResource.closeHandoff;
    return receipt;
  };
  const storeOwner=await load('abg/event_store'),storeOwnerRead=()=>storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix);
  const before=storeOwnerRead().length;
  const crossed=await cli('crossed',pending.replay('crossed',{pendingCursor:coordinate(p.pendingCursorRef,zero)}));
  assert.equal(crossed.ownerOutput.outcomeKind,'refusal');assert.equal(crossed.ownerOutput.value.code,'response_mismatch');assert.deepEqual(crossed.ownerOutput.value.issuePaths,['/pendingCursor']);
  assert.equal(storeOwnerRead().length,before,'a refused crossed request admits nothing');
  // The pending execution is Run-scoped: a Run that does not hold it, or its Run under another digest, is refused.
  for(const [name,run,code,path] of [['wrong-run',{ref:`${runId}/absent`,digest:zero},'missing_continuation','/continuation'],['wrong-run-digest',{ref:runId,digest:zero},'basis_mismatch','/run']]){
    const out=await cli(name,pending.replay(name,{run}));
    assert.equal(out.ownerOutput.outcomeKind,'refusal',name);assert.equal(out.ownerOutput.value.code,code,name);assert.deepEqual(out.ownerOutput.value.issuePaths,[path],name);
    assert.equal(storeOwnerRead().length,before,`${name} admits nothing`);
  }
  const continueCall=await pending.call('continue');
  const continued=await cli('continue',continueCall);
  assert.equal(continued.ownerOutput.outcomeKind,'result',JSON.stringify(continued.ownerOutput));
  assert.equal(continued.ownerOutput.value.continuationKind,'pending_execution');assert.equal(continued.ownerOutput.value.admittedIntent,null);
  assert.equal(continued.ownerOutput.value.disposition,'completed');assert.equal(continued.ownerOutput.value.run.ref,runId,'same Run');
  const afterContinue=storeOwnerRead().length;
  // A literal resend of the consumed Public invocation, with the acquisition it names.
  const duplicateExecution=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:'pending-duplicate',
    acquisition:{kind:'reopen',closeHandoff:continueCall.resources.eventResource.closeHandoff},call:continueCall,expectedExitCode:null});
  // Its identity binds the exact prefix it named; the advanced log refuses it at
  // acquisition, before any owner admission. Owner-level duplicate truth over the
  // same invocation is asserted in the owner-path test above.
  const resend=duplicateExecution.output.receipt;
  assert.equal(resend.invocationRef,continued.invocationRef,'the literal resend is the consumed Public invocation');
  assert.equal(resend.ownerOutput,null);assert.equal(resend.failure.fault.stage,'resource_acquisition');assert.equal(resend.failure.fault.code,'acquisition_refused');
  assert.match(resend.failure.fault.message,/durable_log_mismatch/);
  const second=await cli('second-use',pending.replay('second-use'));
  assert.equal(second.ownerOutput.outcomeKind,'refusal');assert.equal(second.ownerOutput.value.code,'resolved_continuation');assert.deepEqual(second.ownerOutput.value.issuePaths,['/continuation'],'one use');
  assert.equal(storeOwnerRead().length,afterContinue,'duplicate and second use admit nothing');
  const final=runAt(storeOwnerRead());
  assert.equal(final.filter(e=>e.kind==='c_call_opened'&&completedBefore.includes(e.payload.cursorRef)).length,completedBefore.length,'no completed position reopened');
  const resumed=final.filter(e=>e.kind==='c_call_opened'&&!completedBefore.includes(e.payload.cursorRef));
  assert.equal(resumed[0].payload.cursorRef,p.pendingCursorRef,'the first resumed call is the exact pending position');
  assert.equal(final.filter(e=>e.kind==='run_closed').length,1);assert.equal(final.some(e=>e.kind==='runtime_failure_observed'),false);
  assert.deepEqual(final.find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===p.progressedInputRef),producer,'original producer Result unchanged');
  assert.equal(storeOwnerRead().filter(e=>e.kind==='public_operation_admitted'&&e.payload.continuationKind==='pending_execution').length,1,'one consumed use');
  const reads={};
  for(const memberKey of ['run_result','run_replay']){
    const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
    const {call:readCall}=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:1024},source:continued.resources.run,eventResource,identity:`pending-${memberKey}`});
    const read=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:`pending-${memberKey}`,acquisition:{kind:'reopen',closeHandoff:handoff},call:readCall,expectedExitCode:null});
    assert.equal(read.output.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(read.output).slice(0,4000));reads[memberKey]=read.output.receipt.ownerOutput.value;
  }
  // An actual closed child GraphCall of this Run, neither its root GraphCall nor a missing Run: its typed
  // Result reads only under the historical declaration proof; omitting the proof refuses. Neither read appends.
  const graphCalls=final.filter(e=>e.kind==='graph_call_opened'),roots=graphCalls.filter(e=>e.payload.parentFrameId===undefined).map(e=>e.graphCallId);
  assert.ok(roots.length>0,'the Run opened its root GraphCall');
  const child=graphCalls.find(e=>e.payload.parentFrameId!==undefined&&final.some(c=>c.kind==='graph_call_closed'&&c.graphCallId===e.graphCallId));
  assert.ok(child&&!roots.includes(child.graphCallId),'a closed child GraphCall, not the root GraphCall');
  const declarationProof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:env.catalog,catalogView:env.catalogView};
  const childRead=async(identity,proof)=>{
    const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
    const constructed=publicApi.constructInstalledRunReadCall({memberKey:'graph_call_result',
      workspaceBinding:{ref:env.workspaceBinding.bindingId,digest:env.workspaceBinding.bindingDigest},sourceRef:child.graphCallId,selector:{kind:'none'},eventResource,
      ...(proof===undefined?{}:{declarationProof:proof}),
      envelope:{definitionContractCoordinates:env.verified.definitionContractCoordinates,requestRef:`public-request://pending-execution-public/${identity}`,
        correlationRef:`correlation://pending-execution-public/${identity}`,eventTime:'2026-11-02T00:02:00.000Z',provenanceRefs:[ref('provenance','fixture')]}});
    assert.equal(constructed.kind,'installed_run_read_call',JSON.stringify(constructed));
    assert.equal(constructed.population.source.ref,child.graphCallId);
    assert.equal(Object.hasOwn(constructed.call.resources,'declarationProof'),proof!==undefined);
    return cli(identity,constructed.call);
  };
  const beforeChildReads=storeOwnerRead().length;
  const proved=await childRead('child-graph-call-proof',declarationProof);
  assert.equal(proved.ownerOutput.outcomeKind,'result',JSON.stringify(proved.ownerOutput).slice(0,4000));
  assert.deepEqual([proved.ownerOutput.value.projection.terminalResult.producer.runRef,proved.ownerOutput.value.projection.terminalResult.producer.graphCallRef],[runId,child.graphCallId]);
  const omitted=await childRead('child-graph-call-omitted-proof');
  assert.equal(omitted.ownerOutput.outcomeKind,'refusal');assert.equal(omitted.ownerOutput.value.code,'projection_basis_mismatch');assert.deepEqual(omitted.ownerOutput.value.issuePaths,[]);
  assert.equal(storeOwnerRead().length,beforeChildReads,'child GraphCall reads append zero events');
  t.diagnostic(JSON.stringify({runId,continuationRef:p.continuationRef,chain:p.chain.map(c=>c.relation),eventsBefore:interruptedEvents.length,eventsAfter:storeOwnerRead().length,
    replay:continued.ownerOutput.value.replay,proofLimit:'Cold reopen through the installed Public CLI pending_execution arm over the generic recursion fixture; not the default-library pending-Testing topology; not Root installed fresh-process witness.'}));
});
