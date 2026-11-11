import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,readdir,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as m01 from '../../build/code/src/gtl/m01.js';
import * as product from '../../build/code/src/product/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import {setupInstalledRootCatalog,setupInstalledRootExecutionBasis,installOncePerFile,installTenantOnce} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {declarations,initialState,ref,contract,hash} from '../fixtures/registered-selection-product/recursive.mjs';
const packageRoot=new URL('../..',import.meta.url).pathname;
const declared='diagnostic://registered-selection/declared-child-failure@5',undeclared='diagnostic://registered-selection/undeclared-child-failure@5';
const boundExhausted='reason://abiogenesis/recursion/bound-exhausted@5';

function environmentDeclaration(){
  const text='Use the declared frame.',digest=product.sha256Bytes(Buffer.from(text)),member={path:'frame.txt',type:'file',digest,target:null};
  const contextMember={memberRef:'member:frame',path:member.path,byteCount:Buffer.byteLength(text),digest};
  return gtl.constructRunEnvironmentDeclaration({kind:'run_environment_declaration',schemaVersion:'5.0.0',declarationRef:'environment:fixture',dependencies:[{dependencyRef:'dependency:frame',basisRef:'generic://frame/',recordRef:'record:frame',recordDigest:digest,recordFormat:'member_inventory@1',inventoryDigest:gtl.stdoInventoryDigest([member]),members:[member]}],
    contexts:[{contextRef:'context:frame',sourceLocator:'generic://frame/',inventoryDigest:hash([contextMember]),members:[contextMember]}],corpusAccess:null,accesses:[],
    roles:[{graphFunctionRef:ref('graph-function','root'),programLocusRef:ref('node','select'),role:'selector',frameRefs:['frame:executive'],policy:{policyRef:'policy:frame',text,digest},contextPolicy:{policyRef:'policy:context',selectors:['full_source','active_binding_semantics']},accessRefs:[],sourceBindings:[{contextRef:'context:frame',memberRef:contextMember.memberRef,memberDigest:digest,startByte:0,endByte:Buffer.byteLength(text),spanDigest:digest}]}]});
}
// The registered-selection recursive fixture with its recurse foldback given
// `failedChildDiagnosticClassRefs`; the crafted form bypasses the constructor.
const declaring=g=>({...g,recurseApplication:input=>g.recurseApplication({...input,foldback:{...input.foldback,failedChildDiagnosticClassRefs:[declared]}})});
const craftedDeclaring=(g,foldback)=>({...g,recurseApplication(input){
  const app=g.recurseApplication(input),changed={...app.foldback,...foldback(app.foldback)};
  const crafted={...app,foldback:changed,foldbackRef:g.foldbackRef(changed)};
  return {...crafted,applicationRef:g.graphFunctionApplicationRef(crafted)};
}});
// The recursive fixture's Program with A and the parent bound to build/foldback.mjs.
function foldbackDeclarations(g){
  const d=declarations(declaring(g),environmentDeclaration()),root=d.graphFunctions[0],A=d.graphFunctions[1],parent=d.graphFunctions.at(-1);
  root.template={kind:'inline_graph',graphRef:ref('graph','root'),startNodeRef:ref('node','call-A'),terminalNodeRefs:[ref('node','call-A')],
    nodes:[{nodeRef:ref('node','call-A'),nodeKind:'c_locus',term:g.workflow.C(g.cGraphFunctionRef({graphFunctionRef:A.name,input:g.cCarrier(contract('recursive-state')),output:g.cCarrier(contract('recursive-state'))}))}],edges:[],applications:[]};
  d.graphFunctions=[root,A,parent];d.contributions=d.contributions.filter(c=>d.graphFunctions.some(f=>f.name===c.handle));
  d.implementationBindings=d.implementationBindings.filter(b=>[ref('binding','A'),ref('binding','parent')].includes(b.bindingRef)).map(b=>({...b,modulePath:'build/foldback.mjs'}));
  d.productSemanticsBinding.modulePath='build/foldback.mjs';d.evaluators=d.evaluators.filter(e=>e.name===ref('evaluator','parent'));d.rules=d.rules.filter(r=>r.name===ref('rule','parent'));
  d.runEnvironments=[];d.programs[0].callableMembership=d.graphFunctions.map(f=>f.name);d.programs[0].policies['abg.compute_regime']='F_D';delete d.programs[0].policies['abg.run_environment'];
  for(const f of d.graphFunctions){f.declarations['abg.compute_regime']='F_D';delete f.declarations['abg.raw_result_contract'];}
  return d;
}
// Disclosed controlled stand-in: the parent re-evaluates identical admitted
// input, so the child varies by invocation through a process-local counter.
// Leaf owners, semantics, admission, storage and cold projectors stay genuine.
const foldbackFixtureSource=`
import {executeB as accepted,evaluateParent as evaluate,SEMANTICS as original,ref,contract,hash} from './recursive.mjs';
const declared=${JSON.stringify(declared)},undeclared=${JSON.stringify(undeclared)};
const counts=globalThis[Symbol.for('abi5.recursive-failure-foldback.invocations')]??=new Map();
const invocation=input=>{const n=(counts.get(input.taskDigest)??0)+1;counts.set(input.taskDigest,n);return n;};
const success=input=>{const c=accepted(input);return {...c,evidenceCandidates:c.evidenceCandidates.map(e=>({...e,implementationRef:ref('implementation','A')}))};};
const failure=(name,input,diagnosticRef)=>{const resultCandidate={kind:'selection_failure',schemaVersion:'5.0.0',failureClass:'controlled_child_failure',diagnosticRef};
 return {kind:'leaf_realization_candidate',schemaVersion:'5.0.0',disposition:'failure',resultCandidate,diagnosticRef,
 evidenceCandidates:[{kind:'deterministic_evidence_candidate',schemaVersion:'5.0.0',implementationRef:ref('implementation',name),inputDigest:hash(input),outputDigest:hash(resultCandidate)}]};};
export function executeA(input){
 const scenario=input.task.scenario,n=invocation(input);
 if(scenario==='success'||scenario==='fail-once'&&n>1)return success(input);
 return failure('A',input,scenario==='undeclared'?undeclared:declared);
}
export function evaluateParent(input){return input.task.scenario==='parent-fails'?failure('parent',input,declared):evaluate(input);}
const descriptor=name=>{const body={implementationRef:ref('implementation',name),packageName:original.packageName,packageVersion:'5.0.0',modulePath:'build/foldback.mjs',namedSymbol:name==='A'?'executeA':'evaluateParent',computeRegime:'F_D',inputContractRef:contract('recursive-state'),outputContractRef:contract('recursive-state'),failureContractRef:contract('failure'),refusalContractRef:contract('refusal')};return {kind:'packaged_leaf_implementation_descriptor',schemaVersion:'5.0.0',...body,descriptorDigest:hash(body)};};
export const A_DESCRIPTOR=descriptor('A'),PARENT_DESCRIPTOR=descriptor('parent');
export const SEMANTICS={...original,resolveJudgmentRelation(predicateRef){
 if(predicateRef!==ref('predicate','A'))return original.resolveJudgmentRelation(predicateRef);
 return {predicateRef,advanceReasonRef:ref('reason','valid'),rejectionReasonRef:ref('reason','unresolved'),evaluate(input,output){return hash(output)===hash(success(input).resultCandidate);}};
}};
`;
const admit=(value,kind)=>{const result=validator.rawAdmitValue(value,kind,'contract:fixture');assert.equal(result.kind,'raw_admitted_value',JSON.stringify(result));return result;};
function validate(d){
  const digest='sha256:'+'1'.repeat(64);
  const publication=gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...d,artifactDigest:digest,productContentDigest:digest,productManifestDigest:digest,contributions:d.contributions.map(c=>({...c,provenanceRefs:[digest]}))});
  return validator.validateProgram({declarationBasisDigest:admit(publication,'module_publication').subjectDigest,programPublication:admit(publication,'module_publication'),program:admit(publication.programs[0],'gtl_program'),graphFunctions:publication.graphFunctions.map(v=>admit(v,'graph_function')),contracts:publication.contracts.map(v=>admit(v,'contract_declaration')),evaluators:publication.evaluators,rules:publication.rules,implementationBindings:publication.implementationBindings.map(v=>admit(v,'implementation_binding')),closureContracts:publication.closureContracts.map(v=>admit(v,'closure_contract'))});
}
const roundTrip=graphFunction=>{const bytes=m01.serializeGraphFunction(graphFunction),admitted=m01.admitGraphFunction(JSON.parse(bytes));
  assert.equal(admitted.kind,'raw_admitted_value');return {bytes,again:m01.serializeGraphFunction(admitted.value),digest:product.sha256Canonical(admitted.value)};};

test('a recurse foldback without failedChildDiagnosticClassRefs keeps its base bytes, refs and definition digest',()=>{
  // Pinned from base 62fd17271 (built from git archive, same fixture and library).
  const parent=declarations(gtl,environmentDeclaration()).graphFunctions.at(-1),app=parent.template.applications[0];
  assert.deepEqual(Object.keys(app.foldback).sort(),['binding','mode','requiresParentEvaluation']);
  assert.equal(app.foldbackRef,'foldback://abiogenesis/e7df59cd5dc25a9252febf61e03e386cd22158dca44e9380fab9c984465b9a17');
  assert.equal(app.applicationRef,'graph-function-application://abiogenesis/bab459462f4d8b82cbcd9b3c69416eeaef46de60827bd426f2bfaabb8a9da597');
  // In-memory digest is taken before serialization; the catalog's definitionDigest
  // is sha256Canonical over the admitted JSON, equal to the canonical bytes' digest.
  assert.equal(product.sha256Canonical(parent),'sha256:b784f663d703f78e5aa6b69ed6633d766178562db9127dbb735f8428df3b3cae');
  const fixture=roundTrip(parent);assert.equal(fixture.again,fixture.bytes);
  assert.equal(fixture.digest,'sha256:0e991ec0d71beba210c18eba0593b7baff44bca2f026e599a4474a1d9784520e');assert.equal(product.sha256Bytes(Buffer.from(fixture.bytes)),fixture.digest);
  const executive=gtl.defaultGovernanceGraphFunctions().find(f=>f.template.applications.some(a=>a.relationKind==='recurse'));
  const executiveApp=executive.template.applications.find(a=>a.relationKind==='recurse');
  assert.equal(executiveApp.foldbackRef,'foldback://abiogenesis/3ecc27c2a0989da5d929b2ad9fc65a06a69254e27115f9be18c33c00aa760b48');
  assert.equal(executiveApp.applicationRef,'graph-function-application://abiogenesis/03ffe21ac89f20a9f8c4bc530b0ce6c26d2da491ba437cac7f867d4a4fc42dff');
  assert.equal(product.sha256Canonical(executive),'sha256:8b4b06c886ee72b3e8f83c0ed2f47bf2bc8cae4ab12e18f509f089e031970fed');
  const library=roundTrip(executive);assert.equal(library.again,library.bytes);
  assert.equal(library.digest,'sha256:40a2a777d44648e3ecbc48b43531b65022b2b7d6627c041f0bb6ffc3beb2ba53');assert.equal(product.sha256Bytes(Buffer.from(library.bytes)),library.digest);
});

test('failedChildDiagnosticClassRefs is declared, validated for form and round-trips',()=>{
  const d=foldbackDeclarations(gtl),parent=d.graphFunctions.at(-1),app=parent.template.applications[0];
  assert.deepEqual(app.foldback,{mode:'rebind',binding:'$',requiresParentEvaluation:true,failedChildDiagnosticClassRefs:[declared]});
  assert.equal(app.foldbackRef,gtl.foldbackRef(app.foldback));assert.notEqual(app.foldbackRef,'foldback://abiogenesis/e7df59cd5dc25a9252febf61e03e386cd22158dca44e9380fab9c984465b9a17');
  assert.equal(parent.template.nodes[0].term.compositionRef,app.applicationRef);
  const trip=roundTrip(parent);assert.equal(trip.again,trip.bytes);assert.deepEqual(JSON.parse(trip.bytes).template.applications[0].foldback.failedChildDiagnosticClassRefs,[declared]);
  const validation=validate(d);assert.equal(validation.kind,'program_validation',JSON.stringify(validation));
  const base={inputContractRef:app.inputContractRef,outputContractRef:app.outputContractRef,graphFunctionRef:app.graphFunctionRef,terminationRuleRef:app.terminationRuleRef,terminationEvaluatorRefs:app.terminationEvaluatorRefs,terminationFieldRef:app.terminationFieldRef,bound:app.bound};
  for(const refs of [[],[''],[declared,declared]])
    assert.throws(()=>gtl.recurseApplication({...base,foldback:{mode:'rebind',binding:'$',requiresParentEvaluation:true,failedChildDiagnosticClassRefs:refs}}),/failedChildDiagnosticClassRefs/);
  assert.equal(m01.admitGraphFunction(JSON.parse(m01.serializeGraphFunction(parent).replace(JSON.stringify([declared]),'[]'))).kind!=='raw_admitted_value',true,'the schema refuses an empty list');
  const duplicate=declarations(craftedDeclaring(gtl,()=>({failedChildDiagnosticClassRefs:[declared,declared]})),environmentDeclaration());
  const refused=validate({...foldbackDeclarations(gtl),graphFunctions:[...foldbackDeclarations(gtl).graphFunctions.slice(0,-1),duplicate.graphFunctions.at(-1)]});
  const dupApp=duplicate.graphFunctions.at(-1).template.applications[0];
  assert.ok(refused.diagnostics.some(x=>x.code==='invalid_application'&&x.path.endsWith(`applications[${dupApp.applicationRef}].foldback.failedChildDiagnosticClassRefs`)),JSON.stringify(refused.diagnostics));
});

const fixtureFiles=fixturePath=>[...['index','native','recursive'].map(n=>({path:'build/'+n+'.mjs',source:new URL('../fixtures/registered-selection-product/'+n+'.mjs',import.meta.url)})),{path:'build/foldback.mjs',source:fixturePath}];
const scenarioInput=scenario=>{const input=initialState();input.task={...input.task,scenario};input.taskDigest=hash(input.task);return input;};
async function scenarioFixture(t,scenario){
  const fixtureRoot=await mkdtemp(join(tmpdir(),'abi5-recursive-failure-foldback-'));t.after(()=>rm(fixtureRoot,{force:true,recursive:true}));
  const fixturePath=join(fixtureRoot,'foldback.mjs');await writeFile(fixturePath,foldbackFixtureSource);
  return {fixturePath,input:scenarioInput(scenario)};
}
// The direct scenario cases share one packed, verified and installed Product
// (the tenant and the foldback fixture Product) for this file; each scenario
// opens its own store, workspace and scratch root on it. The Public start case
// installs for itself.
const scenarioInstall=installOncePerFile(async()=>{
  const fixtureRoot=await mkdtemp(join(tmpdir(),'abi5-recursive-failure-foldback-')),removeFixture=()=>rm(fixtureRoot,{force:true,recursive:true});
  try{
    const fixturePath=join(fixtureRoot,'foldback.mjs');await writeFile(fixturePath,foldbackFixtureSource);
    const install=await installTenantOnce(packageRoot,{candidateBasisSource:'packed_artifact',
      prepareAdditionalProducts:async basis=>{
        const artifact=join(basis.scratch,'artifacts',(await readdir(join(basis.scratch,'artifacts'))).find(p=>p.endsWith('.tgz')));
        return [await prepareRegisteredSelectionProduct({...basis,abiPackageArchivePath:artifact,declarationFactory:foldbackDeclarations,fixtureFiles:fixtureFiles(fixturePath)})];
      }});
    return {install,dispose:async()=>{try{await install.dispose();}finally{await removeFixture();}}};
  }catch(error){await removeFixture();throw error;}
});
// The frame probe (no C_Call, no actor) of each child frame that folded back failed.
function failedFoldProbes(runEvents){
  return runEvents.filter(e=>e.kind==='child_foldback_admitted'&&e.payload.childDisposition==='failed').map(fold=>{
    const scopes=[...new Set(runEvents.filter(e=>e.kind==='runtime_activity_probe_observed'&&e.payload.probeContract.scope.frameId===fold.payload.childFrameId&&
      e.payload.probeContract.scope.cCallRef===null&&e.payload.probeContract.scope.actorInvocationRef===null).map(e=>e.payload.observation.scopeDigest))];
    assert.equal(scopes.length,1,'one frame probe scope per folded child frame');
    return {fold,scopeDigest:scopes[0],key:`runtime_invocation_active(${scopes[0]})`};
  });
}
async function runScenario(t,scenario){
  const input=scenarioInput(scenario);
  const env=await setupInstalledRootExecutionBasis(t,packageRoot,{install:(await scenarioInstall()).install,candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    programRef:ref('program','root'),graphFunctionRef:ref('graph-function','recursive-parent'),input});
  const load=relative=>import(pathToFileURL(join(env.installedRoot,'build/code/src',relative+'.js')).href);
  assert.deepEqual(env.graph.template.applications[0].foldback.failedChildDiagnosticClassRefs,[declared],'the installed Program carries the declaration');
  const graph=await load('hog/graph_execute'),reads=await load('abg/project_read_ports'),cursors=await load('abg/traversal_cursor'),stores=await load('abg/event_store');
  const replay=await load('abg/replay'),calculus=await load('abg/event_calculus');
  const opened=env.abg.openTraversalScope(env.store,env.durablePrefix,{kind:'root',executionBasis:env.executionBasis},{eventTime:'2026-11-11T00:00:00.000Z',correlationId:'correlation://recursive-failure-foldback/'+scenario+'/open',causationEventRefs:[]});
  assert.equal(opened.kind,'traversal_scope_open_admission');
  const result=await graph.executeGraphTraversal({store:env.store,predecessorPrefix:opened.successorPrefix,executionBasis:env.executionBasis,
    openedTraversalScope:opened.scope,program:env.program,programPublication:env.executionResolution.programPublication,programValidation:env.programValidation,
    graphFunction:env.graphFunction,graph:env.graph,graphValidation:env.graphValidation,implementationSet:env.implementationSet,
    interactionSet:env.executionBasisAdmission.interactionSet,leafPort:env.leafPort,actorRuntimeBinding:{workspaceBinding:env.workspaceBinding,artifactTruth:env.artifactTruth},
    input:env.input,inputDigest:env.rawInput.subjectDigest,closureContract:env.closureContract,eventTime:'2026-11-11T00:00:00.000Z',correlationId:'correlation://recursive-failure-foldback/'+scenario});
  const allEvents=env.store.readAll(),runEvents=allEvents.filter(e=>e.runId===opened.run.runId);
  for(const e of runEvents)assert.ok(stores.ROOT_EVENT_KIND_VALUES.includes(e.kind),e.kind);
  const warm=reads.prepareRunReadAtDurablePrefix(result.successorPrefix,'run_replay',opened.run.runId).project();
  const handoff=env.store.projectReopenAuthorityAndClose(),cold=env.abg.reopenEventStore(structuredClone(handoff.reopenAuthority));
  assert.equal(cold.kind,'reopened_event_store_context');
  const coldReplay=reads.prepareRunReadAtDurablePrefix(cold.prefix,'run_replay',opened.run.runId).project();
  assert.equal(coldReplay.disposition,'projected');assert.deepEqual(coldReplay.value,warm.value,'cold reopen replays the warm projection');
  const coldPrefix=env.abg.selectValidatedRuntimeEventPrefix(env.abg.readRuntimeEventsAtDurablePrefix(cold.prefix));
  const coldCursor=(p,ref,digest)=>cursors.projectAdmittedTraversalCursorAtPrefix(coldPrefix,env.graph,{cursorRef:ref,cursorDigest:digest,runId:p.runId,graphCallId:p.graphCallId,frameId:p.frameId,executionBasisRef:env.executionBasis.basisRef});
  const parentRoot=env.graphFunction.name;
  const parentCalls=runEvents.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===parentRoot);
  const parentResults=runEvents.filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===parentRoot);
  const folds=runEvents.filter(e=>e.kind==='child_foldback_admitted'&&e.payload.applicationRef!==undefined);
  const recursionRoutes=runEvents.filter(e=>e.kind==='traversal_route_admitted'&&e.payload.declarationRef===env.graph.template.applications[0].applicationRef);
  const failures=runEvents.filter(e=>e.kind==='runtime_failure_observed');
  cold.store.projectReopenAuthorityAndClose();
  const prefixBefore=ordinal=>env.abg.selectValidatedRuntimeEventPrefix(Object.freeze(allEvents.filter(e=>e.admissionOrdinal<ordinal)));
  return {env,result,runEvents,parentCalls,parentResults,folds,recursionRoutes,failures,coldReplay,coldCursor,replay,calculus,prefixBefore,kinds:new Set(runEvents.map(e=>e.kind))};
}
// Each re-entry route after a failed foldback targets the source cursor's term
// at attempt + 1 over the source cursor's own admitted input, read cold.
function assertFailedReentry(run,fold){
  const route=run.recursionRoutes.find(r=>r.payload.routeKind==='advance'&&r.payload.consumedAvailabilityRefs.includes(fold.payload.foldbackRef));
  assert.ok(route,'the failed foldback is consumed by one recursion advance');assert.equal(route.payload.sourceCursorRef,fold.payload.sourceCursorRef);
  const source=run.coldCursor(route,route.payload.sourceCursorRef,route.payload.sourceCursorDigest),target=run.coldCursor(route,route.payload.targetCursorRef,route.payload.targetCursorDigest);
  assert.ok(source&&target,'both cursors project cold');assert.equal(target.attempt,source.attempt+1);
  assert.equal(target.inputRef,source.inputRef);assert.equal(target.inputDigest,source.inputDigest);assert.notEqual(target.inputRef,fold.payload.childResultRef);
  return {source,target};
}

test('declared child failure folds back failed once, re-evaluates the parent over its prior input and the Run closes',async t=>{
  const success=await runScenario(t,'success'),run=await runScenario(t,'fail-once');
  assert.equal(success.result.disposition,'closed');assert.equal(success.folds.length,1);
  const trace=run.runEvents.map(e=>[e.kind,e.graphFunctionRef?.split('/').at(-1),e.payload?.routeKind??e.payload?.childDisposition??e.payload?.resultClass??e.payload?.diagnosticRef??'']);
  assert.equal(run.result.disposition,'closed',JSON.stringify({diagnosticRef:run.result.diagnosticRef,failures:run.failures.map(f=>f.payload),trace}));assert.equal(run.result.resultValue.terminal,true);assert.equal(run.failures.length,0);
  assert.deepEqual(run.folds.map(f=>f.payload.childDisposition),['failed','closed']);
  const [failed]=run.folds,childResult=run.runEvents.find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===failed.payload.childResultRef);
  assert.equal(failed.payload.childReasonRef,declared);assert.equal(failed.payload.childClosureRef,null);
  assert.equal(childResult.payload.resultClass,'failure','the failure Result stays failure-class');assert.equal(childResult.payload.value.diagnosticRef,declared);
  assert.equal(run.parentCalls.length,3,'parent evaluated at attempts 1, 2 and 3');
  assert.deepEqual(run.parentResults.map(e=>e.payload.resultClass),['success','success','success']);
  assert.equal(run.parentResults[1].payload.valueDigest,run.parentResults[0].payload.valueDigest,'re-evaluation over the prior admitted input');
  const {source}=assertFailedReentry(run,failed);assert.equal(source.inputRef,run.env.executionBasis.rawInputAdmissionRef);
  for(const kind of run.kinds)assert.ok(success.kinds.has(kind),'no event kind beyond the successful recursion: '+kind);
  assert.equal(run.coldReplay.value.runtimeStatus,'closed');
  await t.test('a folded child frame probe blocks Run quiescence until its stopped foldback is admitted',()=>{
    const probes=failedFoldProbes(run.runEvents);
    assert.equal(probes.length,2,'the workflow child and the recursion child beneath the parent');
    for(const probe of probes){
      const before=run.replay.projectRunQuiescence(run.prefixBefore(probe.fold.admissionOrdinal));
      assert.ok(before.blockingFluents.includes(probe.key),'without its admitted foldback the frame probe blocks: '+JSON.stringify(before.blockingFluents));
    }
    const close=run.runEvents.filter(e=>e.kind==='terminal_reached').at(-1),preClose=run.prefixBefore(close.admissionOrdinal);
    const quiescence=run.replay.projectRunQuiescence(preClose),held=run.calculus.deriveRuntimeHeldFluentProjection(preClose).holds.map(f=>f.fluentRef);
    assert.equal(quiescence.disposition,'quiescent_for_close',JSON.stringify(quiescence.blockingFluents));assert.deepEqual(quiescence.blockingFluents,[]);
    for(const probe of probes)assert.ok(held.includes(probe.key),'the derived frame probe fluent still holds; only quiescence reads it as historical');
  });
  t.diagnostic(JSON.stringify({successKinds:[...success.kinds].sort(),failOnceKinds:[...run.kinds].sort(),folds:run.folds.map(f=>f.payload.childDisposition),
    proofLimit:'Installed packed build; disclosed process-local invocation counter in the fixture child; no provider or network.'}));
});

test('declared child failure that always fails stops at the bound with the existing blocked stop',async t=>{
  const run=await runScenario(t,'always-fail');
  assert.equal(run.result.disposition,'blocked');assert.equal(run.failures.length,0);
  assert.deepEqual(run.folds.map(f=>f.payload.childDisposition),['failed','failed']);
  for(const fold of run.folds)assertFailedReentry(run,fold);
  assert.equal(run.parentCalls.length,3);
  const blocked=run.recursionRoutes.filter(r=>r.payload.routeKind==='blocked');
  assert.equal(blocked.length,1);assert.equal(run.result.diagnosticRef,boundExhausted);
  assert.equal(run.runEvents.filter(e=>e.kind==='run_stopped').length,1);
  t.diagnostic(JSON.stringify({coldRuntimeStatus:run.coldReplay.value.runtimeStatus,blockedRoute:blocked[0].payload}));
});

test('an undeclared child failure fails the Run exactly as without a declaration',async t=>{
  const run=await runScenario(t,'undeclared');
  assert.equal(run.result.disposition,'failed');assert.equal(run.result.diagnosticRef,undeclared);
  assert.equal(run.folds.length,0);assert.equal(run.failures.length,1);assert.equal(run.failures[0].payload.diagnosticRef,undeclared);
  assert.equal(run.parentCalls.length,1);assert.equal(run.coldReplay.value.runtimeStatus,'failed');
});

test('the parent evaluation failing with a declared class never folds back',async t=>{
  const run=await runScenario(t,'parent-fails');
  assert.equal(run.result.disposition,'failed');assert.equal(run.result.diagnosticRef,declared);
  assert.equal(run.folds.length,0);assert.equal(run.parentCalls.length,1);
  assert.equal(run.runEvents.some(e=>e.kind==='basis_admitted'&&e.payload.basisClass==='child'),false,'no child is prepared');
  assert.equal(run.parentResults[0].payload.resultClass,'failure');assert.equal(run.coldReplay.value.runtimeStatus,'failed');
});

test('a declared foldback survives Public module publication, catalog parsing and a Public start, and the closed Run reads completed',async t=>{
  const {fixturePath,input}=await scenarioFixture(t,'fail-once');
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async basis=>[await prepareRegisteredSelectionProduct({...basis,declarationFactory:foldbackDeclarations,fixtureFiles:fixtureFiles(fixturePath)})]});
  const parentRef=ref('graph-function','recursive-parent'),classes=definitions=>definitions.find(f=>f.name===parentRef).template.applications[0].foldback.failedChildDiagnosticClassRefs;
  assert.deepEqual(classes(env.additionalPublications[0].graphFunctions),[declared],'the Public module publication carries the declaration');
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,['recursive-parent','root','A'].map(n=>ref('graph-function',n)));
  assert.equal(env.catalogView.kind,'graph_function_catalog_view');
  assert.deepEqual(classes(env.catalogView.entries.map(e=>e.definition)),[declared],'the catalog carries the declaration');
  const load=relative=>import(pathToFileURL(join(env.installedRoot,'build/code/src',relative+'.js')).href);
  const publicApi=await load('public/index'),storeOwner=await load('abg/event_store');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'foldback'});
  const execution=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:'foldback',acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null});
  const receipt=execution.output.receipt;assert.ok(receipt,JSON.stringify(execution.output));
  assert.equal(receipt.ownerOutput?.outcomeKind,'result',JSON.stringify(receipt.failure??receipt.ownerOutput));assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
  handoff=receipt.resources.eventResource.closeHandoff;
  const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).slice(before);
  assert.deepEqual(events.filter(e=>e.kind==='child_foldback_admitted'&&e.payload.applicationRef!==undefined).map(e=>e.payload.childDisposition),['failed','closed']);
  assert.equal(events.filter(e=>e.kind==='run_closed').length,1);assert.equal(events.some(e=>e.kind==='runtime_failure_observed'),false);
  const probes=failedFoldProbes(events);assert.equal(probes.length,2);
  const read={};
  for(const memberKey of ['run_status','run_result','run_replay']){
    const {call}=constructInstalledRunReadCall({environment:env,publicApi,memberKey,selector:memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:2048}:{kind:'none'},source:receipt.resources.run,eventResource:resource(),identity:'foldback-'+memberKey});
    const output=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:'foldback-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:0});
    assert.equal(output.output.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(output.output.receipt.ownerOutput));
    read[memberKey]=output.output.receipt.ownerOutput.value.projection;
  }
  const status=read.run_status,result=read.run_result,replay=read.run_replay;
  assert.deepEqual([status.status,replay.status],['closed','closed']);assert.equal(result.terminalResult.value.terminal,true);
  assert.deepEqual([status.replay,result.replay],[replay.replay,replay.replay],'one replay identity across the reads');
  // The Public reads of the closed Run apply the reader rule Run quiescence
  // applies (REQ-P-POLICY-068): a frame ended by its stopped foldback is not
  // presented live. The axioms are unchanged; the derived probe fluent still
  // holds in the owner calculus (asserted in the first test).
  const fluents=status.activeFluents.map(f=>f.ref),liveness=status.nativeLiveness.invocations;
  const folded=probes.map(p=>({frameId:p.fold.payload.childFrameId,probeFluentHeld:fluents.includes(p.key),
    lifecycleFluents:fluents.filter(f=>f.endsWith('('+p.fold.payload.childFrameId+')')||f.endsWith('('+p.fold.payload.childGraphCallId+')')),
    nativeFrame:liveness.find(i=>product.sha256Canonical(i.scope)===p.scopeDigest)??null}));
  for(const row of folded){
    assert.equal(row.probeFluentHeld,false,'the ended frame probe is not presented active');
    assert.deepEqual(row.lifecycleFluents,[],'no frame or graph-call lifecycle fluent of a folded child');
    assert.equal(row.nativeFrame,null,'no native invocation of an ended frame');
  }
  // Run quiescence, the owner reader that closure consumes, reads them as historical.
  const cold=env.abg.reopenEventStore(structuredClone(handoff.reopenAuthority));assert.equal(cold.kind,'reopened_event_store_context');
  const reads=await load('abg/project_read_ports'),runId=events.find(e=>e.kind==='run_closed').runId;
  const owner=reads.prepareRunReadAtDurablePrefix(cold.prefix,'run_status',runId).project();
  const childSources=probes.map(p=>reads.prepareRunReadAtDurablePrefix(cold.prefix,'graph_call_replay',p.fold.payload.childGraphCallId).source);
  cold.store.projectReopenAuthorityAndClose();
  assert.equal(owner.disposition,'projected');assert.equal(owner.value.replayDigest,replay.replay.digest);
  assert.deepEqual([owner.value.quiescence.disposition,owner.value.quiescence.blockingFluents],['quiescent_for_close',[]]);
  // The Public graph-call read of each folded child reads it failed, with no
  // terminal result. The child has no graph_call_closed and its graph_call_active
  // ended at the foldback, so the status is its stopped foldback's disposition.
  const children=[];
  for(const [index,source] of childSources.entries()){
    const identity='foldback-child-'+index;
    const {call}=constructInstalledRunReadCall({environment:env,publicApi,memberKey:'graph_call_replay',selector:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source,eventResource:resource(),identity});
    const output=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:0});
    assert.equal(output.output.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(output.output.receipt.ownerOutput));
    const projection=output.output.receipt.ownerOutput.value.projection;
    const kinds=[...new Set(events.filter(e=>e.graphCallId===source.ref||e.payload?.graphCallId===source.ref||e.aggregateId===source.ref).map(e=>e.kind))];
    children.push({graphCallId:source.ref,status:projection.status,terminalResult:projection.terminalResult,graphCallOpened:kinds.includes('graph_call_opened'),graphCallClosed:kinds.includes('graph_call_closed')});
  }
  for(const child of children)assert.deepEqual([child.status,child.terminalResult,child.graphCallOpened,child.graphCallClosed],['failed',null,true,false]);
  t.diagnostic(JSON.stringify({publicChildGraphCallReplay:children}));
  t.diagnostic(JSON.stringify({publicRunStatus:{status:status.status,replay:status.replay.ref,folded},ownerQuiescence:owner.value.quiescence,
    proofLimit:'Installed packed build, Public start and reads through the installed CLI; disclosed process-local invocation counter in the fixture child; no provider or network.'}));
});
