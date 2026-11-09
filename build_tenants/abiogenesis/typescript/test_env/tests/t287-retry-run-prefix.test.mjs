import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import test,{after} from 'node:test';
import {prepareDeveloperMiniProduct} from '../support/developer-mini-product.mjs';
import {setupInstalledRootCatalog,setupInstalledRootExecutionBasis} from '../support/root-installed-environment.mjs';

// Current retry-entry producer. The retired S02 rc.1 carrier is historical, not
// current history, so the same three cases are rebuilt on the
// current installed root helpers (setupInstalledRootCatalog through
// setupInstalledRootExecutionBasis, as the F09 producer uses them) and the
// installed module family under env.installedRoot. The developer mini Product
// is published with one added F_D;c_retry(c_retry(F_D)) GraphFunction through
// its existing publication-variant route; both leaves keep the mini Product's
// own render and deterministic-pass bindings. Selected Runs execute the render
// leaf through the actual c-call owner and stop at the outer c_retry cursor;
// these cases then enter retry only. Neighbour Runs run through the engine.
const root=resolve(import.meta.dirname,'../..');
const EVENT_TIME='2026-07-31T00:00:00.000Z';
const PROBE='runtime_activity_probe_observed';
const IDS=Object.freeze({
  programRef:'program://developer.example/greeting/nested-retry-entry@5',
  startRef:'start://developer.example/greeting/nested-retry-entry@5',
  graphFunctionRef:'graph-function://developer.example/greeting/nested-retry-entry@5',
  graphRef:'graph://developer.example/greeting/nested-retry-entry@5',
  nodeRef:'node://developer.example/greeting/nested-retry-entry@5',
  locusRef:'locus://developer.example/greeting/nested-retry-entry',
  compositionRef:'composition://developer.example/greeting/nested-retry-entry@5',
});
const basis=(label,causationEventRefs=[])=>({eventTime:EVENT_TIME,correlationId:'correlation://t287/retry-entry/'+label,causationEventRefs});
const greeting=name=>({kind:'developer_greeting_input',schemaVersion:'5.0.0',name});

function nestedRetryPublication(mini) {
  const M=mini.ids,base=mini.publication;
  // The F09 shape with a nested retry: the mini Product's own render leaf, then
  // c_retry(c_retry(deterministic pass)) over the greeting-output carrier its
  // semantics validate. Both leaves are taken from its mixed GraphFunction. The
  // retried leaf is judged by the greeting-input predicate, which no greeting
  // output satisfies, so an engine Run that reaches it is blocked.
  const mixed=base.graphFunctions.find(g=>g.name===M.mixedGraphFunctionRef);
  const fd=mixed?.template?.nodes?.[0]?.term?.terms?.filter(t=>t.kind==='c_of'&&t.fibre==='F_D');
  const render=fd?.find(t=>t.requirement.implementationBindingRef===M.implementationBindingRef);
  const pass=fd?.find(t=>t.requirement.implementationBindingRef===M.deterministicPassImplementationBindingRef);
  assert.ok(render&&pass);
  const relocate=(leaf,role,vectorIndex,resultBearing)=>({...structuredClone(leaf),stageRole:resultBearing?'result':'transform',
    programLocusRef:IDS.locusRef+'/'+role+'@5',armId:'arm://developer.example/greeting/nested-retry-entry/'+role+'@5',
    compositionRef:IDS.compositionRef,vectorIndex,resultBearing,judgmentPredicateRef:M.judgmentPredicateRef});
  const I=M.inputContractRef,C=M.outputContractRef;
  const retry=term=>({kind:'c_retry',inputCarrierRef:C,outputCarrierRef:C,budget:2,term});
  const body={kind:'c_compose',inputCarrierRef:I,outputCarrierRef:C,
    terms:[relocate(render,'render',0,false),retry(retry(relocate(pass,'retried',1,true)))]};
  const graphFunction={kind:'graph_function',name:IDS.graphFunctionRef,version:'5.0.0',
    environment:{requires:[I],provides:[C],carries:[I,C]},inputs:[I],outputs:[C],
    template:{kind:'inline_graph',graphRef:IDS.graphRef,startNodeRef:IDS.nodeRef,terminalNodeRefs:[IDS.nodeRef],
      nodes:[{nodeRef:IDS.nodeRef,nodeKind:'c_locus',term:body}],edges:[],applications:[]},
    effects:mixed.effects.filter(e=>!e.includes('human-approval')),
    declarations:{'abg.compute_regime':'F_D','abg.closure_contract':M.closureContractRef,'abg.evidence_contract':M.evidenceContractRef,
      'abg.judgment_contract':M.judgmentContractRef,'abg.judgment_predicate':M.judgmentPredicateRef,
      'abg.transition_contract':M.transitionContractRef},
    tags:['developer-authored','retry-entry','nested-retry','all-fd']};
  const program={kind:'gtl_program',programRef:IDS.programRef,version:'5.0.0',moduleRef:M.moduleRef,
    starts:[{startRef:IDS.startRef,graphFunctionRef:IDS.graphFunctionRef}],callableMembership:[IDS.graphFunctionRef],
    closureContractRef:M.closureContractRef,policies:{'abg.compute_regime':'F_D','abg.root_mode':'direct'}};
  const template=base.contributions.find(c=>c.kind==='graph_function');assert.ok(template);
  const contribution={...structuredClone(template),handle:IDS.graphFunctionRef,declarationOrContractRef:IDS.graphFunctionRef,
    programMembershipRefs:[IDS.programRef],readinessPrerequisiteRefs:[IDS.programRef]};
  return {...structuredClone(base),graphFunctions:[...structuredClone(base.graphFunctions),graphFunction],
    programs:[...structuredClone(base.programs),program],contributions:[...structuredClone(base.contributions),contribution]};
}

const cleanups=[];
after(async()=>{for(const cleanup of cleanups.reverse())await cleanup();});
const context={after:cleanup=>{cleanups.push(cleanup);}};
let shared=null;
const fixture=()=>shared??=build();

async function build() {
  const env=await setupInstalledRootCatalog(context,root,{
    authorizedActorRef:'actor://developer.example/trusted-developer',
    programRef:IDS.programRef,graphFunctionRef:IDS.graphFunctionRef,
    prepareAdditionalProducts:async({scratch})=>{
      const mini=await prepareDeveloperMiniProduct(root,scratch);
      const variant=await mini.materializePublicationVariant('nested-retry-entry',nestedRetryPublication(mini));
      return [{...variant,ids:IDS,loadInstalledPublication:async({verified})=>{
        assert.equal(verified.artifactDigest,variant.basis.artifactDigest);
        assert.equal(verified.manifestDigest,variant.basis.manifestDigest);
        return variant.publication;
      }}];
    },
  });
  const owner=async path=>import(pathToFileURL(join(env.installedRoot,'build/code/src',path)).href);
  const owners={eventStore:await owner('abg/event_store.js'),eventPrefix:await owner('abg/event_prefix.js'),
    replay:await owner('abg/replay.js'),retry:await owner('abg/retry.js'),cursor:await owner('abg/traversal_cursor.js'),
    traversal:await owner('hog/traversal.js'),routes:await owner('hog/route_proposal.js'),
    structural:await owner('hog/structural_transition.js'),cCall:await owner('hog/ccall_lifecycle.js')};
  const Effect=await import(pathToFileURL(createRequire(join(env.installedRoot,'build/code/src/hog/index.js'))
    .resolve('effect/Effect')).href);
  const store=env.store,eventLogPath=join(env.scratch,'runtime','events.jsonl');
  const held=()=>owners.eventStore.selectHeldEventStoreDurablePrefix(store);
  let ordinal=0;
  async function admitRun(label) {
    ordinal+=1;
    // Each later Run is admitted over the current held prefix and the exact
    // workspace artifact truth projected at it, as the c0 reuse route does.
    const current=env.abg.projectExactPrefixWorkspaceEnvironment(held(),{ref:env.workspaceBinding.bindingId,
      digest:env.workspaceBinding.bindingDigest});
    assert.equal(current.kind,'exact_prefix_workspace_environment',JSON.stringify(current));
    assert.deepEqual(current.workspaceBinding,env.workspaceBinding);
    const run=await setupInstalledRootExecutionBasis(context,root,{existingEnvironment:{...env,
      artifactTruth:current.artifactTruth,durablePrefix:held()},programRef:IDS.programRef,
      graphFunctionRef:IDS.graphFunctionRef,input:greeting('retry-entry-'+label),publicInvocationRef:'invocation://t287/retry-entry/'+label});
    assert.equal(run.store,store,'every Run shares the one installed workspace store');
    const opened=run.abg.openTraversalScope(store,held(),{kind:'root',executionBasis:run.executionBasis},basis(label+'/open'));
    assert.equal(opened.kind,'traversal_scope_open_admission',JSON.stringify(opened));
    return {...run,opened,label,ordinal};
  }
  // Three neighbouring Runs of the same GraphFunction run through the ordinary
  // engine: each enters both retry levels, judges the leaf blocked and stops.
  const neighbours=[];
  for (const label of ['neighbour-1','neighbour-2','neighbour-3']) {
    const run=await admitRun(label);
    const completion=await run.hog.executeGraphTraversal({store,predecessorPrefix:held(),executionBasis:run.executionBasis,
      openedTraversalScope:run.opened.scope,program:run.program,graphFunction:run.graphFunction,graph:run.graph,
      graphValidation:run.graphValidation,programValidation:run.programValidation,implementationSet:run.implementationSet,
      interactionSet:run.executionBasisAdmission.interactionSet,continuationProductBasis:{artifactTruth:run.artifactTruth,
        install:run.additionalAdmittedInstalls[0],workspaceBinding:run.workspaceBinding,catalogView:run.catalogView,
        programValidation:run.programValidation,graphValidation:run.graphValidation},
      leafPort:run.leafPort,closureContract:run.closureContract,
      actorRuntimeBinding:{workspaceBinding:run.workspaceBinding,artifactTruth:run.artifactTruth},
      input:run.input,inputDigest:run.rawInput.subjectDigest,eventTime:EVENT_TIME,correlationId:'correlation://t287/retry-entry/'+label});
    neighbours.push({...run,completion});
  }
  // Each selected Run executes its render leaf through the actual c-call owner,
  // as F09 executes its transform, and is left at its outer c_retry cursor.
  async function selectedRun(label) {
    const run=await admitRun(label);
    const traversal=run.hog.traverse({program:run.program,graphFunction:run.graphFunction,graph:run.graph,
      graphValidation:run.graphValidation,executionBasis:run.executionBasis,openedTraversalScope:run.opened.scope});
    assert.equal(traversal.kind,'traversal_cursor',JSON.stringify(traversal));
    const entered=run.abg.admitInitialTraversalCursor(store,held(),run.executionBasis,run.opened.scope,run.graph,
      run.graphValidation,traversal,basis(label+'/initial-cursor'));
    assert.equal(entered.kind,'traversal_cursor_admission',JSON.stringify(entered));
    const scope={program:run.program,graphFunction:run.graphFunction,graph:run.graph,graphValidation:run.graphValidation,
      executionBasis:run.executionBasis,openedTraversalScope:run.opened.scope};
    let cursor=traversal,stop=null;
    for (let step=0;stop===null;step+=1) {
      assert.ok(step<8,'structural owner reaches the render locus');
      const traversed=run.hog.traverseFromCursor(scope,cursor);
      if (traversed.kind==='traversal_stop_ref') { stop=traversed; break; }
      const term=run.hog.resolveTraversalTerm(run.graph,cursor);
      const advanced=owners.structural.advanceStructuralTransition({store,predecessorPrefix:held(),
        executionBasis:run.executionBasis,openedTraversalScope:run.opened.scope,graph:run.graph,graphFunction:run.graphFunction,
        leafPort:run.leafPort,cursor,input:run.input,term,ordinal:step,structuralOrdinal:step,eventTime:EVENT_TIME,
        correlationId:'correlation://t287/retry-entry/'+label+'/structural'});
      assert.equal(advanced.kind,'structural_advance',JSON.stringify(advanced));
      cursor=advanced.cursor;
    }
    assert.equal(stop.programLocusRef,IDS.locusRef+'/render@5');
    const lifecycle=await Effect.runPromise(owners.cCall.evaluateExecutableCCall({store,predecessorPrefix:held(),
      executionBasis:run.executionBasis,openedTraversalScope:run.opened.scope,program:run.program,graphFunction:run.graphFunction,
      graph:run.graph,graphValidation:run.graphValidation,stop,implementationSet:run.implementationSet,leafPort:run.leafPort,
      input:run.input,closureContract:run.closureContract,
      actorRuntimeBinding:{workspaceBinding:run.workspaceBinding,artifactTruth:run.artifactTruth},scopeClass:'root',
      clock:{eventTime:EVENT_TIME,correlationId:'correlation://t287/retry-entry/'+label+'/render'},ordinal:0}));
    assert.equal(lifecycle.kind,'c_call_evaluation',JSON.stringify(lifecycle));
    const rendered=lifecycle.completion;
    assert.equal(rendered.disposition,'advanced',JSON.stringify(rendered));
    assert.equal(rendered.nextCursor.inputDigest,run.product.sha256Canonical(rendered.resultValue));
    return {...run,source:rendered.nextCursor,retryInput:rendered.resultValue};
  }
  return {env,owners,store,eventLogPath,held,neighbours,selectedRun};
}

// One retry-entry transition candidate from the actual HoG structural owners
// over the current owned history; ABG alone admits it.
function retryEntry(f,run,cursor) {
  const {owners,store}=f;
  const term=run.hog.resolveTraversalTerm(run.graph,cursor);
  assert.equal(term.kind,'c_retry');
  const predecessorPrefix=f.held();
  const truth=owners.replay.projectOwnedRuntimeTruthAtDurablePrefix(predecessorPrefix,cursor.runId);
  const target=owners.traversal.deriveStructuralTargetCursor(run.graph,cursor,term,truth.authorityPrefix);
  assert.equal(target?.kind,'traversal_cursor',JSON.stringify(target));
  assert.equal(target.inputDigest,run.product.sha256Canonical(run.retryInput));
  assert.equal(run.leafPort.validateContractValueByRef(term.inputCarrierRef,run.retryInput),true);
  const route=owners.routes.proposeStructuralRoute(run.graph,cursor,target,'retry',truth.replayState);
  assert.equal(route.kind,'traversal_route_candidate',JSON.stringify(route));
  const candidate=run.abg.completeTraversalTransitionCandidate({kind:'traversal_transition_candidate',schemaVersion:'5.0.0',
    transitionClass:'retry',route,evidence:null,retryInput:run.retryInput,terminalizeRun:false});
  return {predecessorPrefix,store,executionBasis:run.executionBasis,graph:run.graph,graphFunction:run.graphFunction,
    source:cursor,target,candidate,basis:basis(run.label+'/retry/'+cursor.retryPath.length)};
}
const rows=f=>f.store.readAll();
const ownedPrefix=(f,scope)=>f.owners.eventPrefix.selectRuntimeEventPrefixFromStore(f.store,scope);

test('retry entry conserves nested attempts in one Run while the workspace retains other stopped Runs',async t=>{
  const f=await fixture();
  // Genuine neighbours: each rendered, entered retry depths 1 and 2 at the same
  // locus, was blocked by its judged retried leaf, and was stopped by the engine.
  for (const n of f.neighbours) {
    const own=rows(f).filter(e=>e.runId===n.opened.scope.runId&&e.kind!==PROBE);
    assert.equal(n.completion.kind,'executable_traversal_completion',n.label);
    assert.deepEqual(own.map(e=>e.kind),['run_segment_opened','graph_call_opened','frame_opened','traversal_cursor_entered',
      'traversal_route_admitted','c_call_opened','c_call_fibre_selected','c_call_evidenced','c_call_result_admitted','c_call_judged',
      'traversal_route_admitted','traversal_route_admitted','retry_attempt_opened','traversal_route_admitted','retry_attempt_opened',
      'c_call_opened','c_call_fibre_selected','c_call_evidenced','c_call_result_admitted','c_call_judged','traversal_route_admitted',
      'run_stopped'],n.label);
    const attempts=own.filter(e=>e.kind==='retry_attempt_opened');
    assert.deepEqual(attempts.map(e=>e.payload.retryPath),[[1],[1,1]],n.label+' '+JSON.stringify(Object.keys(attempts[0].payload)));
    assert.deepEqual(own.filter(e=>e.kind==='c_call_judged').map(e=>e.payload.judgment),['advance','blocked'],n.label);
  }
  const stoppedBefore=rows(f).filter(e=>e.kind==='run_stopped').map(e=>e.runId);
  assert.deepEqual(stoppedBefore,f.neighbours.map(n=>n.opened.scope.runId),'three real neighbouring Runs are stopped');
  const run=await f.selectedRun('nested');
  let cursor=run.source;
  assert.deepEqual(cursor.retryPath,[]);
  const entryStart=rows(f).length;
  for (const depth of [1,2]) {
    const input=retryEntry(f,run,cursor),before=rows(f).length;
    const previousAuthority=ownedPrefix(f);
    const result=run.abg.admitTraversalTransition(input);
    assert.equal(result.kind,'route_transition_admission',JSON.stringify(result));
    // Current ABG admission also records its activity probe in the same Run.
    const appended=rows(f).slice(before),delta=appended.filter(e=>e.kind!==PROBE);
    assert.ok(appended.every(e=>e.runId===cursor.runId));
    assert.deepEqual(delta.map(e=>e.kind),['traversal_route_admitted','retry_attempt_opened']);
    assert.ok(delta.every(e=>e.runId===cursor.runId&&e.frameId===cursor.frameId));
    assert.deepEqual(delta[1].causationEventRefs,[delta[0].eventId]);
    assert.deepEqual(result.retryAttempt.retryPath,Array(depth).fill(1),'nested c_retry depth '+depth);
    assert.equal(result.retryAttempt.budget,2);
    const authority=ownedPrefix(f);
    const selected=f.owners.eventPrefix.selectRuntimeEventPrefixFromAuthority(authority,{runId:cursor.runId});
    const whole=f.owners.retry.projectDeclaredCRetryFrontier(authority,run.graph,input.target,run.graphFunction);
    const scoped=f.owners.retry.projectDeclaredCRetryFrontier(selected,run.graph,input.target,run.graphFunction,depth,authority);
    assert.equal(whole?.state,'attempt_active');assert.equal(scoped?.state,'attempt_active');
    assert.deepEqual(whole.active.attempt,scoped.active.attempt,'same native attempt with full authority or explicit selected Run');
    assert.equal(whole.active.attempt.attemptRef,result.retryAttempt.attemptRef);
    assert.equal(f.owners.retry.projectDeclaredCRetryFrontier(selected,run.graph,input.target,run.graphFunction,depth,previousAuthority),null,
      'stale authority cannot authenticate the newly admitted route');
    // Neighbour attempts at the same locus and depth belong to other Runs.
    for (const n of f.neighbours) {
      const neighbourRun=f.owners.eventPrefix.selectRuntimeEventPrefixFromAuthority(authority,{runId:n.opened.scope.runId});
      assert.equal(f.owners.retry.projectDeclaredCRetryFrontier(neighbourRun,run.graph,input.target,run.graphFunction,depth,authority),null);
    }
    const committed=fs.readFileSync(f.eventLogPath);
    const duplicate=f.owners.retry.admitRetryAttempt(f.store,authority,run.executionBasis,run.graph,run.graphFunction,input.target,
      run.retryInput,result.route.admissionEventRef,input.basis);
    assert.equal(duplicate.kind,'retry_admission_refusal','one route cannot mint a competing duplicate attempt');
    assert.equal(duplicate.code,'route_mismatch');
    assert.deepEqual(fs.readFileSync(f.eventLogPath),committed);
    cursor=input.target;
  }
  assert.deepEqual(rows(f).filter(e=>e.kind==='run_stopped').map(e=>e.runId),stoppedBefore);
  assert.deepEqual(rows(f).slice(entryStart).filter(e=>e.kind!==PROBE).map(e=>e.kind),['traversal_route_admitted','retry_attempt_opened',
    'traversal_route_admitted','retry_attempt_opened'],'retry entry invokes no actor, opens no c-call and stops no Run');
  t.diagnostic('Installed current root/F09 helper route: three engine-stopped neighbour Runs and one selected Run entering nested retry depths 1 and 2.');
});

test('retry entry refuses foreign scope and stale source without committing a partial transition',async()=>{
  const f=await fixture(),run=await f.selectedRun('foreign-stale'),input=retryEntry(f,run,run.source);
  const foreign=rows(f).find(e=>e.kind==='traversal_cursor_entered'&&e.runId===f.neighbours[0].opened.scope.runId);
  assert.ok(foreign);
  const {kind,schemaVersion,cursorRef,cursorDigest,...targetBody}=input.target;
  const wrong=f.owners.cursor.constructTraversalCursorCandidate({...targetBody,runId:foreign.runId,frameId:foreign.frameId});
  assert.equal(wrong.kind,'traversal_cursor');
  const before=fs.readFileSync(f.eventLogPath);
  const r1=run.abg.admitTraversalTransition({...input,target:wrong});
  assert.equal(r1.kind,'traversal_route_admission_refusal');assert.equal(r1.code,'candidate_mismatch');
  assert.deepEqual(fs.readFileSync(f.eventLogPath),before);
  assert.equal(run.abg.admitTraversalTransition(input).kind,'route_transition_admission');
  const committed=fs.readFileSync(f.eventLogPath);
  const r2=run.abg.admitTraversalTransition(input),r3=run.abg.admitTraversalTransition({...input,predecessorPrefix:f.held()});
  assert.equal(r2.kind,'traversal_route_admission_refusal');
  assert.equal(r2.code,'replay_mismatch','old prefix and spent source cannot be reused');
  assert.equal(r3.kind,'traversal_route_admission_refusal');
  assert.equal(r3.code,'candidate_mismatch','a current prefix cannot respend the consumed source cursor');
  assert.deepEqual(fs.readFileSync(f.eventLogPath),committed);
});

test('retry entry retains the failed native scope refusal and refuses an unrelated authority prefix',async()=>{
  const f=await fixture(),run=await f.selectedRun('failed-scope'),input=retryEntry(f,run,run.source);
  // The actual structural owner refuses an unadmitted leaf port and records
  // the native scope failure before any route.
  const term=run.hog.resolveTraversalTerm(run.graph,run.source),failureBefore=rows(f).length;
  assert.throws(()=>f.owners.structural.advanceStructuralTransition({store:f.store,predecessorPrefix:f.held(),
    executionBasis:run.executionBasis,openedTraversalScope:run.opened.scope,graph:run.graph,graphFunction:run.graphFunction,
    leafPort:{},cursor:run.source,input:run.retryInput,term,ordinal:0,structuralOrdinal:0,eventTime:EVENT_TIME,
    correlationId:'correlation://t287/retry-entry/failed-scope/structural'}));
  const failure=rows(f).slice(failureBefore);
  assert.deepEqual(failure.map(e=>e.kind),['runtime_failure_observed']);
  assert.equal(failure[0].runId,run.source.runId);assert.equal(failure[0].frameId,run.source.frameId);
  const before=fs.readFileSync(f.eventLogPath);
  const stale=run.abg.admitTraversalTransition({...input,predecessorPrefix:f.held()});
  assert.equal(stale.kind,'traversal_route_admission_refusal');assert.equal(stale.code,'candidate_mismatch');
  // A retry entry rebuilt by the same HoG owners from post-failure truth is
  // proposed, and ABG fails closed in the failed frame's liveness observation.
  const truth=f.owners.replay.projectOwnedRuntimeTruthAtDurablePrefix(f.held(),run.source.runId);
  const target=f.owners.traversal.deriveStructuralTargetCursor(run.graph,run.source,term,truth.authorityPrefix);
  assert.equal(target.kind,'traversal_cursor');
  const route=f.owners.routes.proposeStructuralRoute(run.graph,run.source,target,'retry',truth.replayState);
  assert.equal(route.kind,'traversal_route_candidate');
  const candidate=run.abg.completeTraversalTransitionCandidate({kind:'traversal_transition_candidate',schemaVersion:'5.0.0',
    transitionClass:'retry',route,evidence:null,retryInput:run.retryInput,terminalizeRun:false});
  assert.throws(()=>run.abg.admitTraversalTransition({...input,predecessorPrefix:f.held(),target,candidate}),
    error=>error instanceof TypeError&&error.message==='native liveness relation refused the selected observation');
  assert.deepEqual(fs.readFileSync(f.eventLogPath),before);
  assert.equal(rows(f).filter(e=>e.runId===run.source.runId&&e.kind==='retry_attempt_opened').length,0);
  const prefix=ownedPrefix(f),foreignRun=f.neighbours[1].opened.scope.runId;
  const foreign=f.owners.eventPrefix.selectRuntimeEventPrefixFromAuthority(prefix,{runId:foreignRun});
  assert.equal(f.owners.retry.projectDeclaredCRetryFrontier(foreign,run.graph,input.target,run.graphFunction,1,prefix),null);
});
