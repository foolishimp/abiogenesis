import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export async function owners(root){
 const load=p=>import(pathToFileURL(join(root,'build/code/src',p+'.js')));
 const names={events:'abg/event_store',prefix:'abg/event_prefix',live:'abg/runtime_liveness',replay:'abg/replay',immutable:'shared/immutable',digests:'shared/digests',transition:'abg/traversal_transition',canonical:'shared/canonical_json',calculus:'abg/event_calculus'};
 const out={root};for(const [k,p]of Object.entries(names))out[k]=await load(p);
 out.ts=(await import(pathToFileURL(join(root,'node_modules/typescript/lib/typescript.js')))).default;
 out.extract=(module,names,deps)=>{
  const source=fs.readFileSync(join(root,'build/code/src',module+'.js'),'utf8');
  const tree=out.ts.createSourceFile(module+'.js',source,out.ts.ScriptTarget.Latest,true,out.ts.ScriptKind.JS);
  const texts=names.map(name=>{const node=tree.statements.find(n=>((out.ts.isFunctionDeclaration(n)||out.ts.isClassDeclaration(n))&&n.name?.text===name)||out.ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(tree)===name));assert.ok(node,name);return node.getText(tree).replace(/^export /,'');});
  const text=texts.join('\n');return {sha256:sha(text),api:Function(...Object.keys(deps),text+'\nreturn {'+names.join(',')+'};')(...Object.values(deps))};
 };
 return out;
}
export function historyFixture(o,path,expected){
 const bytes=fs.readFileSync(path);assert.equal(sha(bytes),expected);const history=o.events.validateHistoricalEvents(bytes),judged=history.find(e=>e.kind==='c_call_judged');
 const plannedRows=o.immutable.deepFreeze(history.slice(0,judged.admissionOrdinal)),predecessorRows=o.immutable.deepFreeze(plannedRows.slice(0,-1));
 const context=o.live.projectFrameLivenessContext(o.prefix.selectValidatedRuntimeEventPrefix(plannedRows),judged.frameId),probe=context.probes[0];
 const observation={kind:'runtime_probe_observation',schemaVersion:'5.0.0',probeRef:probe.probeRef,scopeDigest:o.digests.sha256Canonical(context.scope),clockOriginRef:context.binding.clockOriginRef,elapsedMs:10,underlyingObservationRef:judged.eventId,underlyingEventRef:judged.eventId,sourceDigest:judged.payloadDigest,sourceRevisionDigest:null,evidenceRefs:[judged.eventId],coverage:'observed',signal:'activity'};
 const candidate={kind:'runtime_activity_probe_observed',eventTime:judged.eventTime,aggregateType:'graph_call',aggregateId:judged.graphCallId,parentAggregateId:judged.runId,causationEventRefs:[...new Set([context.declarationEventRef,judged.eventId])],correlationId:judged.correlationId,workflowVersion:'5.0.0',scopeClass:'run',basisId:judged.basisId,runId:judged.runId,graphFunctionRef:judged.graphFunctionRef,graphCallId:judged.graphCallId,frameId:judged.frameId,payload:{probeContract:probe,observation}};
 const probeEvent=o.events.projectRuntimeEventFromValidatedHistory(plannedRows,candidate);
 assert.equal(o.live.validateRuntimeLivenessEventAtPrefix(o.prefix.selectValidatedRuntimeEventPrefix(plannedRows),probeEvent),true);
 const actualRows=o.immutable.deepFreeze([...plannedRows,probeEvent]);
 const project=rows=>o.replay.replayValidatedRuntimeEventPrefix(o.prefix.selectValidatedRuntimeEventPrefix(rows,{runId:judged.runId}),o.prefix.selectValidatedRuntimeEventPrefix(rows));
 assert.notEqual(project(plannedRows).replayDigest,project(actualRows).replayDigest);
 return {bytes,history,judged,plannedRows,predecessorRows,actualRows,probeEvent,project};
}
export function strictConsumer(o,f,state){
 const ref={kind:'admitted_traversal_route',admissionEventRef:f.judged.eventId,routeRef:'component-route',routeDigest:o.digests.sha256Canonical({route:'component'})};
 const dependencies={isRuntimeEventTransactionActive:()=>state.active,assertHeldEventStoreAtDurablePrefix:()=>{},readRuntimeEventsAtDurablePrefix:()=>f.predecessorRows,
  runtimeEventsFromValidatedPrefix:o.prefix.runtimeEventsFromValidatedPrefix,selectValidatedRuntimeEventPrefix:o.prefix.selectValidatedRuntimeEventPrefix,
  sha256Canonical:o.digests.sha256Canonical,replayValidatedRuntimeEventPrefix:o.replay.replayValidatedRuntimeEventPrefix,
  isTraversalTransitionCandidate:o.transition.isTraversalTransitionCandidate,deepFreeze:o.immutable.deepFreeze,
  refusal:(code,message)=>({kind:'traversal_route_admission_refusal',code,message}),
  admitRoute:(_s,_e,_g,_source,_target,replay,candidate)=>{state.reached++;state.consumedReplay=replay;state.consumedCandidate=candidate;return ref;},
  selectOwnedTransactionStagedPrefix:()=>o.prefix.selectValidatedRuntimeEventPrefix(state.rows),projectAdmittedRouteAtPrefix:()=>ref};
 return o.extract('abg/traversal_route',['admitTraversalTransitionInActiveTransaction'],dependencies);
}
export function lifecycleComponent(o,f,kind,{stale=false,intervene=false,changeEvidence=false}={}){
 const digest=o.digests.sha256Canonical,deepFreeze=o.immutable.deepFreeze;
 const state={rows:f.predecessorRows,active:false,reached:0,log:[],selected:[],successor:{kind:'component_successor_prefix',digest:digest(f.actualRows)}};
 const store={readAll:()=>state.rows,digest:()=>digest(state.rows)};
 const sourceEvent=f.history.find(e=>e.kind==='c_call_opened'),cp=sourceEvent.payload;
 const source={runId:f.judged.runId,frameId:f.judged.frameId,graphCallId:f.judged.graphCallId,cursorRef:cp.cursorRef,cursorDigest:cp.cursorDigest,graphRef:'materialization://component',inputDigest:digest({}),executionBasisRef:f.judged.basisId};
 const graph={materializationRef:source.graphRef,materializationDigest:digest({graph:'component'}),graphFunctionRef:f.judged.graphFunctionRef};
 const stop={stopClass:'interaction',cursor:source,programLocusRef:cp.programLocusRef,continuationContractRef:'contract://continuation'};
 const call={...cp,regime:'F_H',continuationContractRef:stop.continuationContractRef,transitionContractRef:'contract://transition'};
 const judgment={...f.judged.payload,cCallRef:call.cCallRef,judgment:'pending',admissionEventRef:f.judged.eventId};
 const result={resultRef:'result://component',value:{}};
 const pending={cCall:call,result,judgment};
 const failureTransition={kind:'retry_runtime_failure_transition_admission',disposition:'blocked',close:{cCallRef:call.cCallRef,result,judgment},stoppedProgresses:[]};
 const plan=kind==='hold'?{expectedPrefixDigest:digest(f.predecessorRows),pending,replayState:f.project(f.plannedRows)}:
  {kind:'retry_runtime_failure_transition_plan',predecessorEventDigest:digest(f.predecessorRows),transition:failureTransition,replayState:f.project(f.plannedRows)};
 const basis=()=>({eventTime:f.judged.eventTime,correlationId:'component',causationEventRefs:[]});
 const routeFunctions=o.extract('hog/route_proposal',['routeRefusal','graphRouteCandidate',kind==='hold'?'proposeHoldRoute':'proposeBlockedRoute'],{
  isMaterializedGtlGraph:()=>true,completeRouteCandidate:o.transition.completeRouteCandidate,
 }).api;
 const Routes=Object.fromEntries(Object.entries(routeFunctions).map(([key,value])=>[key,(...args)=>{
  if(key.startsWith('propose')){state.selected.push(args[4]);state.log.push('hog-select');}
  return value(...args);
 }]));
 const strict=strictConsumer(o,f,state);
 const transaction=(_s,_p,action)=>{assert.equal(state.active,false);const before=state.rows;state.active=true;state.log.push('begin');try{const value=action();state.log.push('commit');return {value,successorPrefix:state.successor};}catch(error){state.rows=before;state.log.push('rollback');throw error;}finally{state.active=false;}};
 const admitProducers=()=>{state.log.push('planned-producers');state.rows=f.plannedRows;state.log.push('frame-probe');state.rows=f.actualRows;return kind==='hold'?pending:failureTransition;};
 const common={assertHeldEventStoreAtDurablePrefix:()=>{},readRuntimeEventsAtDurablePrefix:p=>p===state.successor?state.rows:f.predecessorRows,
  sha256Canonical:digest,deepFreeze,selectValidatedRuntimeEventPrefix:o.prefix.selectValidatedRuntimeEventPrefix,replayValidatedRuntimeEventPrefix:o.replay.replayValidatedRuntimeEventPrefix,
  admitTraversalTransitionInActiveTransaction:input=>{state.log.push('strict-consumer');return strict.api.admitTraversalTransitionInActiveTransaction(input);}};
 let owner;
 if(kind==='hold')owner=o.extract('abg/continuation',['admitFhInteractionHold'],{...common,
  admitNonEmptyRuntimeEventTransactionAtDurablePrefix:transaction,admitPlannedPendingInteraction:admitProducers,
  admitFhInteractionOpen:()=>{state.log.push('continuation');return {continuationRef:'continuation://component'};}}).api.admitFhInteractionHold;
 else owner=o.extract('abg/traversal_route',['RouteTransitionAbort','admitBlockedRetryTraversalTransition'],{...common,
  isRuntimeEventTransactionActive:()=>state.active,admitRuntimeEventTransactionAtExpectedPrefix:transaction,
  admitPlannedRetryRuntimeFailureTransitionInActiveTransaction:admitProducers,
  refusal:(code,message)=>({kind:'traversal_route_admission_refusal',code,message}),}).api.admitBlockedRetryTraversalTransition;
 let captured;
 const dispatch=input=>{captured=input;const select=input.selectRouteCandidate;
  input={...input,selectRouteCandidate:replay=>{state.log.push('callback');assert.equal(replay.replayDigest,f.project(f.actualRows).replayDigest);
   let selected=stale?(input.routeCandidate??input.candidate):select(replay);
   if(intervene)state.rows=deepFreeze([...f.actualRows,f.history[f.judged.admissionOrdinal]]);
   if(changeEvidence)selected={...selected,evidence:null};return selected;}};
  return owner(input);};
 const completion=(_kind,replay,prefix,details)=>({replay,prefix,details});
 let run;
 if(kind==='hold'){
  const Abg={selectAdmittedInteractionContract:()=>({}),openCCall:()=>({kind:'c_call_admission',cCall:call,successorPrefix:{component:'predecessor'}}),
   planPendingInteractionAdmission:()=>plan,completeTraversalTransitionCandidate:o.transition.completeTraversalTransitionCandidate,admitFhInteractionHold:dispatch};
  const fn=o.extract('hog/interaction_lifecycle',['holdInteraction'],{Abg,Routes,sha256Canonical:digest,admissionBasis:basis,deepFreeze,
   failTraversal:input=>{throw Error('HoG refusal '+input.stage);},replayAtDurable:()=>f.project(state.rows),projectExecutableTraversalCompletion:completion}).api.holdInteraction;
  run=()=>fn({store,predecessorPrefix:{component:'predecessor'},executionBasis:{},openedTraversalScope:{runId:source.runId},program:{},graphFunction:{},graph,interactionSet:{},continuationProductBasis:{},closureContract:{},stop,value:{},ordinal:0,eventTime:f.judged.eventTime,correlationId:'component'});
 }else{
  const Abg={projectRuntimeTruthAtDurablePrefix:()=>({authorityPrefix:o.prefix.selectValidatedRuntimeEventPrefix(f.predecessorRows)}),
   completeTraversalTransitionCandidate:o.transition.completeTraversalTransitionCandidate,admitBlockedRetryTraversalTransition:dispatch};
  const fn=o.extract('hog/retry_lifecycle',['advanceRetryLifecycle'],{Abg,AbgRetry:{planRetryRuntimeFailureTransition:()=>plan},Routes,admissionBasis:basis,
   failRetry:(_r,_p,stage)=>{throw Error('HoG refusal '+stage);},projectExecutableTraversalCompletion:completion}).api.advanceRetryLifecycle;
  run=()=>fn({context:{store,executionBasis:{},graph,graphFunction:{},stop,clock:{},scopeClass:'root'},outcome:{successorPrefix:{component:'predecessor'},cCall:call,source:{},failureCandidate:{},failureValueKind:'component'}});
 }
 const originalPlan=digest(plan);let evaluation,error;try{evaluation=run();}catch(e){error=String(e);}
 assert.equal(digest(plan),originalPlan,'pure preflight plan conserved');
 if(stale||intervene||changeEvidence){assert.ok(error,'failed relation rolls back');assert.equal(state.reached,0);assert.deepEqual(state.rows,f.predecessorRows);}
 else{assert.ifError(error);assert.equal(state.reached,1);assert.equal(state.selected.length,2);assert.notEqual(state.selected[0].replayDigest,state.selected[1].replayDigest);assert.equal(state.consumedReplay.replayDigest,state.selected[1].replayDigest);assert.equal(state.consumedCandidate.replayStateDigest,state.selected[1].replayDigest);assert.equal(evaluation.completion.prefix,state.successor);assert.deepEqual(state.rows,f.actualRows);}
 return {kind,stale,intervene,changeEvidence,log:state.log,error:error??null,strictConsumerSha256:strict.sha256,preflightReplay:plan.replayState.replayDigest,consumedReplay:state.consumedReplay?.replayDigest??null,receiptUsesExactSuccessor:!error,planConserved:true,
  scope:'Complete extracted HoG lifecycle, pure proposal, atomic owner and strict transition consumer. Graph-brand, planned producer admission, physical transaction/prefix acquisition, downstream route/continuation admission and completion projection are explicit doubles. Real validated historical rows, valid probe relation, replay and candidate construction; not durable F_H/retry execution.'};
}

export async function structuralComponent(o,f){
 const digest=o.digests.sha256Canonical,deepFreeze=o.immutable.deepFreeze;
 const failureClasses=(await import(pathToFileURL(join(o.root,'build/code/src/abg/transport_contracts.js')))).WORKER_TRANSPORT_FAILURE_CLASS_VALUES;
 const scope={workflowVersion:'5.0.0',scopeClass:'run',runId:f.judged.runId,graphCallId:f.judged.graphCallId,frameId:f.judged.frameId,basisId:f.judged.basisId,graphFunctionRef:f.judged.graphFunctionRef,materializationRef:'materialization://component'};
 const rows=[],append=(kind,id,payload,causes=[])=>{const event={...scope,kind,eventId:id,admissionOrdinal:rows.length+1,aggregateType:'frame',aggregateId:scope.frameId,parentAggregateId:scope.graphCallId,payload,payloadDigest:digest(payload),causationEventRefs:causes};rows.push(event);return event;};
 const opening=append('frame_opened','component-opening',{});
 const attempts=[];for(const depth of [1,2]){
  const route=append('traversal_route_admitted','component-origin-'+depth,{routeKind:'retry',routeRef:'route://origin-'+depth});
  const body={retryBoundaryRef:'retry-boundary://'+depth,attempt:1,retryPath:Array(depth).fill(1),budget:2,retryTermPath:['tasks','0','term'],wrappedTermPath:['tasks','0','term','term'],retryableFailureClasses:failureClasses,taskOrdinal:null,priorJudgmentRef:null,priorRouteRef:route.payload.routeRef,inputRef:'input://component',inputDigest:digest({}),inputContractRef:'contract://input',inputValue:{}};
  const attemptDigest=digest(body),attemptRef='retry-attempt://abiogenesis/'+attemptDigest.slice(7);
  attempts.push(append('retry_attempt_opened','component-attempt-'+depth,{...body,attemptRef,attemptDigest},[route.eventId]));
 }
 const source={kind:'traversal_cursor',cursorRef:'cursor://source',cursorDigest:digest({source:1}),runId:scope.runId,graphCallId:scope.graphCallId,frameId:scope.frameId,graphRef:scope.materializationRef,executionBasisRef:scope.basisId,traversalScopeRef:'scope://component',retryPath:[1,1]};
 const target={...source,cursorRef:'cursor://target',cursorDigest:digest({target:1}),retryPath:[]};
 const witness=append('traversal_cursor_entered','component-witness',{cursorRef:source.cursorRef,cursorDigest:source.cursorDigest});
 const progressEvents=[];for(const depth of [2,1]){
  const body={attempt:1,attemptRef:attempts[depth-1].payload.attemptRef,completedRetryDepth:depth,completionClass:'structural_identity_success',completionWitnessEventRef:witness.eventId,predecessorProgressRef:progressEvents.at(-1)?.payload.progressRef??null,progressClass:'completed',retryBoundaryRef:'retry-boundary://'+depth,retryPath:Array(depth).fill(1),sourceCursorRef:source.cursorRef,sourceCursorDigest:source.cursorDigest,targetCursorRef:target.cursorRef,targetCursorDigest:target.cursorDigest};
  const progressDigest=digest(body),progressRef='retry-progress://abiogenesis/'+progressDigest.slice(7);
  progressEvents.push(append('retry_progress_recorded','component-progress-'+depth,{...body,progressDigest,progressRef},[attempts[depth-1].eventId,progressEvents.at(-1)?.eventId??witness.eventId]));
 }
 const names=['RETRY_CONTINUATION_PROGRESS_KEYS','RETRY_STOPPED_PROGRESS_KEYS','COMPLETED_PROGRESS_TERMINAL_KEYS','COMPLETED_PROGRESS_ADVANCE_KEYS','STRUCTURAL_COMPLETED_PROGRESS_ADVANCE_KEYS','isRecord','sameStrings','sameNumbers','exactPayloadKeys','progressBody','nonEmptyString','digestValue','positiveInteger','nonNegativeInteger','positiveIntegerValues','stringValues','sharesProgressScope','exactAttemptEvent','exactCursorCarrierEvent','projectRetryProgressAt','projectAdmittedRetryProgress','hasStructuralIdentityCompletedRouteCausation'];
 const projector=o.extract('abg/retry',names,{sha256Canonical:digest,deepFreeze,WORKER_TRANSPORT_FAILURE_CLASS_VALUES:failureClasses,
  validatedRuntimeEventPrefixThroughEvent:(events,ref)=>{const index=events.findIndex(e=>e.eventId===ref);if(index<0)throw Error('missing fixture prefix');return events.slice(0,index+1);},runtimeEventsFromValidatedPrefix:x=>x,
  deriveRuntimeEventCalculusProjection:()=>({component:'explicit retry/locus fluent projection double'}),holdsAt:()=>true,
  constructScopedRetryFluent:(_name,value)=>value,constructRuntimeFluent:value=>value});
 const project=(events,ref)=>projector.api.projectAdmittedRetryProgress(events,ref);
 const progresses=progressEvents.map(e=>project(rows,e.eventId));assert.ok(progresses.every(Boolean),'complete progress projector accepts exact fixture owner relation');
 const causation=o.extract('abg/traversal_route',['deriveCompletedProgressRouteCausation'],{deepFreeze});
 const ownerCauses=causation.api.deriveCompletedProgressRouteCausation(progresses,witness.eventId);
 const graph={materializationRef:source.graphRef,materializationDigest:digest({graph:1}),graphFunctionRef:scope.graphFunctionRef};
 const routes=o.extract('hog/route_proposal',['routeRefusal','graphRouteCandidate','proposeStructuralRoute'],{isMaterializedGtlGraph:()=>true,completeRouteCandidate:o.transition.completeRouteCandidate}).api;
 const progressPlan={kind:'completed_retry_progress_plan',progresses,replayState:f.project(f.plannedRows)};
 let producedCandidate;
 const hog=o.extract('hog/structural_transition',['advanceStructuralTransition'],{
  isAdmittedLeafInvocationPort:()=>true,deriveStructuralTargetCursor:()=>target,runtimePrefixAtDurable:()=>rows,
  traversalCursorAdmissionEventRefAtPrefix:()=>witness.eventId,admissionBasis:()=>({eventTime:f.judged.eventTime,correlationId:'component',causationEventRefs:[]}),
  AbgRetry:{planCompletedRetryProgress:()=>progressPlan},Routes:routes,Abg:{completeTraversalTransitionCandidate:o.transition.completeTraversalTransitionCandidate,
   admitCompletedRetryTraversalTransition:input=>{producedCandidate=input.candidate;assert.deepEqual(input.completion,{completionClass:'structural_identity_success',completionWitnessEventRef:witness.eventId});assert.deepEqual(input.candidate.evidence.completedProgresses,progresses);return {kind:'route_transition_admission',route:{},successorPrefix:{component:'closed successor'}};}},
  applyAdmittedRoute:()=>target,isTraversalCursorCandidate:()=>true,failTraversal:input=>{throw Error('structural refusal '+input.stage);},sha256Canonical:digest}).api.advanceStructuralTransition;
 const result=hog({store:{},predecessorPrefix:{},executionBasis:{implementationSetRef:'set',implementationSetDigest:digest({})},openedTraversalScope:{},graph,graphFunction:{},leafPort:{implementationSetRef:'set',implementationSetDigest:digest({})},cursor:source,input:{},term:{kind:'c_identity'},ordinal:1,structuralOrdinal:1,eventTime:f.judged.eventTime,correlationId:'component'});
 assert.equal(result.kind,'structural_advance');assert.equal(producedCandidate.evidence.completionWitnessEventRef,witness.eventId);
 const route=append('traversal_route_admitted','component-exit',{...o.transition.projectTraversalRouteBody(producedCandidate.route),routeRef:'route://component-exit'},[ownerCauses.causationEventRef,...ownerCauses.additionalCausationEventRefs]);
 const accepts=(events=rows,exit=route,sourceWitness=witness)=>projector.api.hasStructuralIdentityCompletedRouteCausation(events,exit,sourceWitness);
 assert.equal(route.causationEventRefs.includes(witness.eventId),false,'preserved reviewed direct-guard counterexample');assert.equal(accepts(),true);
 const negatives=[];
 const reject=(name,mutate)=>{const fixture=structuredClone({rows,route,witness});mutate(fixture);assert.equal(accepts(fixture.rows,fixture.route,fixture.witness),false,name);negatives.push(name);};
 reject('foreign frame',f=>f.route.frameId='foreign');
 reject('foreign basis',f=>f.route.basisId='foreign');
 reject('wrong source digest',f=>f.route.payload.sourceCursorDigest=digest({wrong:1}));
 reject('wrong target digest',f=>f.route.payload.targetCursorDigest=digest({wrong:1}));
 reject('wrong source witness',f=>f.witness.eventId='foreign');
 reject('direct cursor substituted for progress cause',f=>f.route.causationEventRefs=[witness.eventId]);
 reject('causal chain reversed',f=>f.route.causationEventRefs.reverse());
 reject('consumption chain reversed',f=>f.route.payload.consumedAvailabilityRefs.reverse());
 reject('missing earlier chain consumption',f=>f.route.payload.consumedAvailabilityRefs.shift());
 reject('unadmitted progress reference',f=>f.route.payload.consumedAvailabilityRefs[0]='missing');
 reject('duplicate progress occurrence',f=>f.rows.push(f.rows.find(e=>e.eventId===progressEvents[0].eventId)));
 reject('future progress',f=>f.rows.find(e=>e.eventId===progressEvents[0].eventId).admissionOrdinal=route.admissionOrdinal+1);
 reject('forged progress payload',f=>f.rows.find(e=>e.eventId===progressEvents[0].eventId).payload.completionWitnessEventRef='wrong');
 // These keep the payload digest/ref self-consistent so the complete progress
 // projector, not just identity equality, rejects the changed causal owner.
 reject('wrong first progress cursor cause',f=>f.rows.find(e=>e.eventId===progressEvents[0].eventId).causationEventRefs[1]=attempts[0].eventId);
 reject('wrong outer progress predecessor cause',f=>f.rows.find(e=>e.eventId===progressEvents[1].eventId).causationEventRefs[1]=witness.eventId);
 reject('wrong attempt owner',f=>f.rows.find(e=>e.eventId===progressEvents[0].eventId).causationEventRefs[0]=attempts[0].eventId);
 const contracts=await import(pathToFileURL(join(o.root,'build/code/src/abg/runtime_liveness_contracts.js')));
 const frameScope=o.live.projectFrameLivenessContext(o.prefix.selectValidatedRuntimeEventPrefix(f.plannedRows),f.judged.frameId).scope;
 const contract=contracts.constructRuntimeSystemProbeContract({scope:frameScope,clockOriginRef:'runtime-clock://component',source:'frame_progress',sourceRef:'frame://component',declarationEventRef:opening.eventId,required:true});
 const context={scope:frameScope,binding:{clockOriginRef:contract.clockOriginRef},probes:[contract],declarationEventRef:opening.eventId};
 const observation={kind:'runtime_probe_observation',schemaVersion:'5.0.0',probeRef:contract.probeRef,scopeDigest:digest(frameScope),clockOriginRef:contract.clockOriginRef,elapsedMs:10,underlyingObservationRef:route.eventId,underlyingEventRef:route.eventId,sourceDigest:route.payloadDigest,sourceRevisionDigest:null,evidenceRefs:[route.eventId],coverage:'observed',signal:'activity'};
 const probeDeps={...contracts,digest,same:(a,b)=>digest(a)===digest(b),selectValidatedRuntimeEventPrefix:x=>x,
  hasStructuralIdentityCompletedRouteCausation:projector.api.hasStructuralIdentityCompletedRouteCausation};
 const probeValidator=o.extract('abg/runtime_liveness',['FRAME_PRODUCERS','record','one','probeObservationMatches'],probeDeps);
 assert.equal(probeValidator.api.probeObservationMatches(rows,context,contract,observation,rows.length+1),true,'complete frame producer-join consumer accepts exact completed chain');
 const badRoute={...route,causationEventRefs:[witness.eventId]};
 assert.equal(probeValidator.api.probeObservationMatches([...rows.slice(0,-1),badRoute],context,contract,observation,rows.length+1),false,'adding cursor cause cannot bypass required consumed-progress ownership');
 assert.ok(process.env.ABI5_ROUTE_BASELINE_ROOT,'explicit rejected frozen source');
 const before=await owners(process.env.ABI5_ROUTE_BASELINE_ROOT);
 const oldProbe=before.extract('abg/runtime_liveness',['FRAME_PRODUCERS','record','one','probeObservationMatches'],probeDeps);
 assert.equal(oldProbe.api.probeObservationMatches(rows,context,contract,observation,rows.length+1),false,'exact rejected guard still reproduces against the same component producer');
 return {accepted:true,unchangedHoGStructuralProducerExecuted:true,fullRetryProgressProjectorExecuted:true,fullExactAttemptAndCursorHelpersExecuted:true,progressProjectorSha256:projector.sha256,causalHelperSha256:causation.sha256,ownerCauses,sourceWitness:witness.eventId,originalDirectGuardWouldReject:true,negatives,
  completeFrameProbeJoinConsumer:true,rejectedBaselineJoinStillRejects:true,probeValidatorSha256:probeValidator.sha256,
  scope:'Component-only synthetic rows are never admitted or passed off as native history. Complete extracted structural HoG producer, retry-progress projector, attempt/cursor join and complete frame probe producer-join consumer. Explicit GTL brand/target derivation, retry/locus EC fluents, preflight progress-plan publication, physical prefix acquisition, frame-context fixture and route commit/foldback doubles. No durable retry or native qualification.'};
}
