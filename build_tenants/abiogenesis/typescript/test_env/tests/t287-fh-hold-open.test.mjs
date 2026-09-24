// Source-only regression over a disposable component copy of the frozen S02
// failed Run prefix. No original journal, actor, native Run or package is changed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const root=resolve(import.meta.dirname,'../..'),repo=resolve(root,'../../..');
const evidence=join(repo,'.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/fh-hold-repair-01');
const episode=join(repo,'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-17');
const built=join(episode,'bootstrap/node_modules/@abiogenesis/typescript-tenant/build/code/src');
const load=p=>import(pathToFileURL(join(built,p+'.js')));
const [events,prefixes,execution,openCall,cursors,calls,transitions,routes,routeOwner,replay,environment,declarations,catalogOperations,programValidator,graphValidator,gtl,digests,immutable]=await Promise.all([
 'abg/event_store','abg/event_prefix','abg/execution_basis','abg/open_call','abg/traversal_cursor','abg/c_call','abg/traversal_transition','hog/route_proposal','abg/traversal_route','abg/replay','abg/environment_admission','product/declaration_closure','product/catalog_operations','validator/index','validator/graph','gtl/materialize','shared/digests','shared/immutable'].map(load));
const hash=digests.sha256Canonical,freeze=immutable.deepFreeze;
const {canonicalJson}=await load('shared/canonical_json');
const byteHash=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
const runId='run://abiogenesis/04aa52546e7a66182ab60aa7e7865ff9c5c8b1ce9bf348ebf2630c6aa2345256';
async function sourceOwner(preimage=false,observations=[]){
 const source=preimage?join(evidence,'continuation.preimage.ts'):join(root,'code/src/abg/continuation.ts');
 const file=join(built,'abg/continuation.js');
 const sourceBytes=fs.readFileSync(source);
 if(preimage)assert.equal(byteHash(sourceBytes),'sha256:66a4159f0a00f3de4aa34c7ab0e2a52223f52207fba65e4375bf255b8a76e95c');
 const compiled=ts.transpileModule(sourceBytes.toString(),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const module=new SourceTextModule(compiled,{identifier:file});
 const links=new Map();
 await module.link(async specifier=>{
  if(links.has(specifier))return links.get(specifier);
  const actual={...await import(specifier.startsWith('.')?pathToFileURL(resolve(dirname(file),specifier)).href:specifier)};
  if(specifier==='./traversal_route.js')actual.isAdmittedRoute=(prefix,route,authority=prefix)=>{
   const admitted=routeOwner.isAdmittedRoute(prefix,route,authority);
   observations.push({routeRef:route.routeRef,admitted,runIds:[...new Set(prefixes.runtimeEventsFromValidatedPrefix(prefix).filter(e=>e.kind==='run_segment_opened').map(e=>e.runId))],authorityEvents:prefixes.runtimeEventsFromValidatedPrefix(authority).length});
   return admitted;
  };
  const linked=new SyntheticModule(Object.keys(actual),function(){for(const[k,v]of Object.entries(actual))this.setExport(k,v);});links.set(specifier,linked);return linked;
 });await module.evaluate();return module.namespace;
}
function fixture(t){
 const snapshot=fs.readFileSync(join(evidence,'captured-events.json'));
 assert.equal(byteHash(snapshot),'sha256:ddf5d846e75b3a8490c1e7bb1894ff342f4f1eda87dfe1b893f0da14e20eaab4');
 const all=freeze(JSON.parse(snapshot));
 // The acquired logical events are re-encoded for this component resource;
 // its physical encoding and coordinates do not impersonate the original.
 assert.equal(byteHash(all.map(e=>canonicalJson(e)).join('\n')+'\n'),'sha256:e421a0fc6f905afe533cdf0b653bb6b1f85368ae25bcb14c8decf994fafe9727');assert.equal(all.length,2035);assert.equal(all.at(-1).kind,'runtime_failure_observed');
 // The transaction that rolled back preceded the failure event. This copy is
 // explicitly component evidence and cannot become an S02 runtime successor.
 const rows=all.slice(0,-1),bytes=Buffer.from(rows.map(e=>canonicalJson(e)).join('\n')+'\n');
 const scratch=fs.mkdtempSync(join(tmpdir(),'abi5-fh-hold-component-')),eventLogPath=join(scratch,'component.events.jsonl');
 t.after(()=>{if(opened?.store)opened.store.closeDurableLog();fs.rmSync(scratch,{recursive:true,force:true});});fs.writeFileSync(eventLogPath,bytes,{flag:'wx'});
 const stat=fs.statSync(eventLogPath),body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath,device:stat.dev,inode:stat.ino,eventLogDigest:byteHash(bytes),durableByteLength:bytes.length,eventContractDigest:rows.at(-1).eventContractDigest};
 let opened;opened=events.reopenEventStore({...body,authorityDigest:hash(body)});assert.ok(opened.store,JSON.stringify(opened));
 const prefix=prefixes.selectValidatedRuntimeEventPrefix(opened.store.readAll());
 const fhOpen=rows.find(e=>e.kind==='c_call_opened'&&e.runId===runId&&e.payload.vectorIndex===2);
 const basis=execution.rehydrateExecutionBasisAtPrefix(prefix,fhOpen.basisId);assert.ok(basis);
 const scopeEvents=k=>rows.find(e=>e.kind===k&&e.runId===runId);
 const r=scopeEvents('run_segment_opened'),g=scopeEvents('graph_call_opened'),f=scopeEvents('frame_opened');
 const scopeBody={executionBasisRef:basis.basisRef,executionBasisDigest:basis.basisDigest,invocationAdmissionRef:basis.invocationAdmissionRef,invocationRef:basis.invocationRef,programRef:basis.programRef,graphFunctionRef:basis.graphFunctionRef,graphRef:basis.graphRef,runId,runDigest:r.payload.runDigest,runOpenEventRef:r.eventId,graphCallId:g.graphCallId,graphCallDigest:g.payload.graphCallDigest,graphCallOpenEventRef:g.eventId,frameId:f.frameId,frameDigest:f.payload.frameDigest,frameLineageId:f.payload.frameLineageId,frameOpenEventRef:f.eventId};
 const scopeDigest=hash(scopeBody),scope=openCall.rehydrateOpenedTraversalScopeAtPrefix(prefix,{...scopeBody,scopeRef:'traversal-scope://abiogenesis/'+scopeDigest.slice(7),scopeDigest});assert.ok(scope);
 const constructionBytes=fs.readFileSync(join(episode,'episode-01/continued-mixed-human-boundary-construction-basis.json'));
 assert.equal(byteHash(constructionBytes),'sha256:3c0c0c331044d9f8fae7dc2c5c8bda7813cefd169a75a67e6a8298e7d17f47bf');
 const construction=freeze(JSON.parse(constructionBytes));
 const {program,graphFunction}=construction.resolution;
 const materialization={invocationAdmissionRef:basis.invocationAdmissionRef,admittedInputRef:basis.rawInputAdmissionRef,admittedInputDigest:basis.rawInputDigest,admittedInput:basis.rawInputValue};
 const graph=gtl.materializeGraph(graphFunction,materialization);assert.equal(graph.materializationRef,basis.graphRef);
 const cCall=calls.projectOpenedCCallCarrierAtPrefix(prefix,graph,fhOpen.payload.cCallRef);assert.ok(cCall);
 const priorResult=rows.find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef==='result://abiogenesis/64c89d51cf2dbc3c824f90651734f5808ae46d3af2b6b53a707bec8ae0f64901').payload;
 const inputValue=priorResult.value,node=graph.template.nodes[0].nodeRef;
 const cursor=cursors.constructTraversalCursorCandidate({programRef:basis.programRef,executionBasisRef:basis.basisRef,traversalScopeRef:scope.scopeRef,runId,graphCallId:scope.graphCallId,frameId:scope.frameId,graphRef:basis.graphRef,inputRef:priorResult.resultRef,inputDigest:priorResult.valueDigest,currentNodeRef:node,position:'at_term',termPath:['node',node,'c','terms','2'],taskOrdinal:null,attempt:1,retryPath:[]});
 assert.equal(cursor.cursorRef,fhOpen.payload.cursorRef);assert.ok(cursors.hasAdmittedTraversalCursorAtPrefix(prefix,cursor));
 const interactionSet=execution.rehydrateAdmittedInteractionSetAtPrefix(prefix,cCall.interactionSetRef);assert.ok(interactionSet);
 const env=environment.projectExactPrefixWorkspaceEnvironment(opened.prefix,{ref:basis.workspaceBindingId,digest:basis.workspaceBindingDigest});assert.equal(env.kind,'exact_prefix_workspace_environment');
 const requestBytes=fs.readFileSync(join(episode,'episode-01/continued-mixed-human-boundary-root-request.json'));
 assert.equal(byteHash(requestBytes),'sha256:bbd1d23de7983bd32e1b6442dda8344da92d804cd819732338352d1e400fab1a');
 const request=JSON.parse(requestBytes);
 const nominalCatalog=declarations.reconstructHistoricalDeclarationCatalog(request.resources,{workspaceBinding:env.workspaceBindingCandidate,resolvedLock:env.resolvedProductLock,installedProducts:env.productInstalls.map(i=>environment.projectAdmittedProductInstallByAdmissionEventRef(env.artifactTruth,i.admissionEventRef).candidate)});
 const closure=declarations.resolveProgramDeclarationClosure(nominalCatalog.catalog,nominalCatalog.catalogView,program.programRef);
 const programValidation=programValidator.validateProgram(catalogOperations.constructCatalogProgramValidationInput(nominalCatalog.catalog,nominalCatalog.catalogView,closure,program));assert.equal(programValidation.validationRef,basis.programValidationRef);
 const graphValidation=graphValidator.validateGraph(graph,programValidation,graphFunction,materialization);assert.equal(graphValidation.validationRef,basis.graphValidationRef);
 const productBasis={install:env.productInstalls.find(i=>i.installId===construction.resolution.programInstall.installId),workspaceBinding:env.workspaceBinding,artifactTruth:env.artifactTruth,catalogView:nominalCatalog.catalogView,programValidation,graphValidation};assert.ok(productBasis.install);
 const admission=stage=>({eventTime:'2026-09-24T00:00:00.000Z',correlationId:'correlation://abiogenesis/fh-component/'+stage,causationEventRefs:[]});
 const pendingBasis=admission('pending'),pendingPlan=calls.planPendingInteractionAdmission(opened.store,graph,graphFunction,cursor,cCall,inputValue,cursor.inputDigest,pendingBasis);
 const stop={stopClass:'interaction',cursor,programLocusRef:cCall.programLocusRef};
 const selectRouteCandidate=state=>{
  const route=routes.proposeHoldRoute(graph,stop,cCall,pendingPlan.pending.judgment,state,cCall.continuationContractRef);assert.equal(route.kind,'traversal_route_candidate');
  return transitions.completeTraversalTransitionCandidate({kind:'traversal_transition_candidate',schemaVersion:'5.0.0',transitionClass:'route',route,evidence:{evidenceClass:'hold',graphFunction,cCall,result:pendingPlan.pending.result,judgment:pendingPlan.pending.judgment},terminalizeRun:false});
 };
 const input={predecessorPrefix:opened.prefix,store:opened.store,executionBasis:basis,scope,program,graphFunction,graph,interactionSet,cursor,request:inputValue,expectedInputDigest:cursor.inputDigest,pendingPlan,routeCandidate:selectRouteCandidate(pendingPlan.replayState),selectRouteCandidate,productBasis,inputValue,pendingBasis,routeBasis:admission('route'),continuationBasis:admission('continuation')};
 return {input,opened,bytes,eventLogPath,rows,snapshotDigest:byteHash(snapshot)};
}

test('actual S02 pending F_H transaction holds in its Run while retaining full workspace authority and atomic refusal',async t=>{
 const f=fixture(t),observations=[];
 const baseline=await sourceOwner(true,observations),current=await sourceOwner(false,observations);
 const unchanged=()=>{assert.deepEqual(fs.readFileSync(f.eventLogPath),f.bytes);assert.equal(f.opened.store.readAll().length,2034);};
 assert.throws(()=>baseline.admitFhInteractionHold(f.input),/F_H continuation requires one exact admitted pending interaction basis/);unchanged();assert.equal(observations.at(-1).admitted,false);
 const baselineGuard=observations.at(-1);assert.ok(baselineGuard.runIds.length>1);
 const refused=[];
 for(const [name,alter] of [
  ['changed held input',i=>({...i,inputValue:{...i.inputValue,message:'foreign'}})],
  ['changed catalog authority',i=>({...i,productBasis:{...i.productBasis,catalogView:{...i.productBasis.catalogView,viewDigest:hash('foreign')}}})],
  ['foreign traversal scope',i=>({...i,scope:{...i.scope,runId:'run://foreign'}})],
  ['malformed pending request',i=>({...i,request:{kind:'malformed'}})],
 ]){let cause;assert.throws(()=>current.admitFhInteractionHold(alter(f.input)),error=>{cause=String(error);return error instanceof TypeError;},name);unchanged();refused.push({name,cause,rollback:true});}
 const admitted=current.admitFhInteractionHold(f.input);assert.equal(admitted.continuation.disposition,'open');
 const after=f.opened.store.readAll(),appended=after.slice(f.rows.length);assert.equal(appended.filter(e=>e.kind==='fh_interaction_opened').length,1);
 assert.equal(appended.filter(e=>e.kind==='traversal_route_admitted'&&e.payload.routeKind==='hold').length,1);
 assert.equal(appended.filter(e=>e.kind==='run_stopped'||e.kind==='fh_interaction_response_admitted'||e.kind==='fh_interaction_resume_admitted'||e.kind==='closure_admitted').length,0);
 const full=prefixes.selectValidatedRuntimeEventPrefix(after),run=prefixes.selectRuntimeEventPrefixFromAuthority(full,{runId});
 const state=replay.replayValidatedRuntimeEventPrefix(run,full);
 assert.equal(state.runtimeStatus,'held');assert.equal(state.continuations.length,1);
 assert.equal(state.continuations[0].status,'open');assert.equal(state.continuations[0].responseRef,null);assert.equal(state.continuations[0].resumedEventRef,null);
 assert.equal(state.runClosedEventRef,null);assert.equal(state.runtimeFailureEventRef,null);assert.equal(state.cCalls.length,3);
 assert.equal(state.continuations[0].heldCursorRef,f.input.cursor.cursorRef);
 assert.deepEqual(observations.at(-1).runIds,[runId]);
 assert.equal(routeOwner.isAdmittedRoute(prefixes.selectRuntimeEventPrefixFromAuthority(full,{runId:baselineGuard.runIds.find(id=>id!==runId)}),admitted.route,full),false,'another Run cannot supply this hold');
 assert.equal(routeOwner.isAdmittedRoute(run,admitted.route,full),true);
 assert.throws(()=>current.admitFhInteractionHold(f.input));
 assert.equal(f.opened.store.readAll().length,after.length,'stale predecessor cannot duplicate the hold');
 const componentClose=f.opened.store.closeDurableLog();
 const coldFull=prefixes.selectValidatedRuntimeEventPrefix(events.readRuntimeEventsAtDurablePrefix(admitted.successorPrefix));
 const cold=replay.replayValidatedRuntimeEventPrefix(prefixes.selectRuntimeEventPrefixFromAuthority(coldFull,{runId}),coldFull);
 assert.deepEqual(cold,state,'cold owner reconstruction preserves the component hold');
 const result={componentClose,coldReplayMatches:true,refused,kind:'fh_hold_source_component_evidence',originalRunId:runId,fixtureSnapshotDigest:f.snapshotDigest,baselineGuard,correctedGuard:observations.at(-1),componentBeforeBytes:f.bytes.length,componentAfterBytes:fs.statSync(f.eventLogPath).size,componentAfterEvents:after.length,appended:appended.map(e=>({ordinal:e.admissionOrdinal,kind:e.kind,eventId:e.eventId})),continuation:admitted.continuation,replay:state,refusals:4,originalResourceEffects:false,actorCalls:0,installedQualification:false};
 if(process.env.ABI5_FH_HOLD_EVIDENCE)fs.writeFileSync(join(process.env.ABI5_FH_HOLD_EVIDENCE,'component-observations.json'),JSON.stringify(result,null,2)+'\n');
 t.diagnostic(JSON.stringify({baselineRoute:baselineGuard.admitted,correctedRoute:observations.at(-1).admitted,appended:appended.length,refusals:4}));
});

test('operator stop preserves the held obligation and current Run reads while terminal cleanup remains scoped',async t=>{
 const {loadMechanism}=await import('../support/witness-reprice-mechanics.mjs');
 const currentLoad=p=>import(pathToFileURL(join(root,'build/code/src',p+'.js')));
 const [storeOwner,prefixOwner,witness,coordinates,baselineCalculus]=await Promise.all([
  'abg/event_store','abg/event_prefix','abg/witness_admission_operation','shared/operation_definition_coordinate','abg/event_calculus'].map(currentLoad));
 const calculus=await loadMechanism('abg/event_calculus.js');
 const continuation=await loadMechanism('abg/fh_continuation_projection.js',{'./event_calculus.js':calculus});
 const replayOwner=await loadMechanism('abg/replay.js',{'./event_calculus.js':calculus,'./continuation.js':continuation});
 const reads=await loadMechanism('abg/project_read_ports.js',{'./event_calculus.js':calculus,'./replay.js':replayOwner});
 const readContracts=await loadMechanism('abg/project_read_operation_contracts.js');
 const readBinding=await loadMechanism('abg/project_read_definition_bindings.js',{'./project_read_ports.js':reads,'./project_read_operation_contracts.js':readContracts},['outputFor']);
 const retainedPath=join(repo,'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-19/operator-stop-02/execution-03/operator-stop-02-stop-request.json');
 const retainedBytes=fs.readFileSync(retainedPath),retained=JSON.parse(retainedBytes).invocation;
 const observations=[];
 const save=()=>{if(process.env.ABI5_OPERATOR_STOP_EVIDENCE)fs.writeFileSync(join(process.env.ABI5_OPERATOR_STOP_EVIDENCE,'component-observations.json'),JSON.stringify({
  kind:'held_operator_stop_component_evidence',retainedRequestDigest:byteHash(retainedBytes),observations,
  premises:'Existing copied F_H fixture and explicit lower witness authority; no Public operator, original resource or installed qualification claim',
 },null,2)+'\n');};
 for(const reasonKind of ['operator_stop','external_interruption']){
  const f=fixture(t),holdOwner=await sourceOwner(false),held=holdOwner.admitFhInteractionHold(f.input);
  const handoff=f.opened.store.projectReopenAuthorityAndClose(),opened=storeOwner.reopenEventStore(handoff.reopenAuthority);
  assert.ok(opened.store,JSON.stringify(opened));t.after(()=>opened.store.closeDurableLog());
  const heldRows=opened.store.readAll(),opening=heldRows.find(e=>e.kind==='run_segment_opened'&&e.runId===runId);
  const nativeRun={ref:runId,digest:opening.payload.runDigest};
  const basis={ref:opening.payload.executionBasisRef,digest:opening.payload.executionBasisDigest};
  const w=f.input.productBasis.workspaceBinding,workspaceBinding={ref:w.bindingId,digest:w.bindingDigest};
  const contentValue={...retained.request.content.value,reasonKind},valueDigest=hash(contentValue);
  const packet={kind:'witness_admit_packet',schemaVersion:'5.0.0',memberKey:'run-stopped',prefix:opened.prefix,
   actor:retained.invocationAuthority.slots.actor.actor,subject:{kind:'run',...nativeRun},act:'run-stopped',
   content:{...retained.request.content,value:contentValue,valueDigest,valueRef:'witness-content://abiogenesis/'+valueDigest.slice(7)},
   context:{kind:'run',run:nativeRun,basis},evidence:[nativeRun],provenance:[basis]};
  // This is an explicit component admission-authority premise. The installed
  // Public stop already succeeded; this test isolates its downstream fold.
  const operationBasis={...coordinates.constructExactOperationInvocationCoordinate({operationId:'abg.operation.witness.admit',memberKey:'run-stopped',definitionDigest:retained.definitionDigest},
   'invocation://component/held-stop/'+reasonKind,hash(packet)),authorityScopeRef:workspaceBinding.ref,authorityScopeDigest:workspaceBinding.digest,
   correlationId:'correlation://component/held-stop/'+reasonKind,eventTime:retained.eventTime,causationEventRefs:[w.admissionEventRef]};
  const authority={kind:'witness_admission_authority',schemaVersion:'5.0.0',operationBasis,predecessorPrefix:opened.prefix,workspaceBinding,
   productSet:{ref:'product-set://component/held-stop',digest:hash('component product-set premise')},
   dependencyLock:retained.invocationAuthority.slots.dependency_lock,actor:packet.actor,
   capabilityGrant:retained.invocationAuthority.slots.capability_grants.grants[0],executionBasis:basis};
  const before=reads.prepareRunReadAtDurablePrefix(opened.prefix,'run_status',runId);assert.ok(before,'component Run is readable before stop');
  const beforeValue=before.project();
  const stop=witness.admitWitnessedAct(packet,authority,{kind:'witness_admission_dependencies',schemaVersion:'5.0.0',eventStore:opened.store});
  assert.equal(stop.kind,'witness_admission',JSON.stringify(stop));
  const full=prefixOwner.selectValidatedRuntimeEventPrefix(opened.store.readAll()),run=prefixOwner.selectRuntimeEventPrefixFromAuthority(full,{runId});
  const projection=calculus.deriveRuntimeEventCalculusProjection(run);
  const observation={reasonKind,before:beforeValue,stop,retainedContinuation:held.continuation.continuationRef};observations.push(observation);
  try{observation.replay=replayOwner.replayValidatedRuntimeEventPrefix(run,full);}
  catch(error){observation.firstCause={name:error.name,message:error.message,stack:error.stack};
   observation.preparedRead=reads.prepareRunReadAtDurablePrefix(stop.successorPrefix,'run_status',runId);save();throw error;}
  assert.equal(observation.replay.runtimeStatus,'stopped');assert.equal(observation.replay.continuations[0].status,'open');
  assert.equal(observation.replay.continuations[0].terminalEventRef,null);
  assert.equal(calculus.holdsAt(projection,calculus.constructRuntimeFluent({name:'run_active',identity:runId})),false);
  assert.equal(calculus.holdsAt(projection,calculus.constructRuntimeFluent({name:'operator_run_stopped',identity:runId})),true);
  const heldNames=new Set(['continuation_open','continuation_response_available','frame_held','interaction_pending']);
  const withoutHeld=p=>({...p,holds:p.holds.filter(f=>!heldNames.has(f.name)),effectRows:p.effectRows.map(row=>({...row,terminates:row.terminates.filter(f=>!heldNames.has(f.name))}))});
  assert.deepEqual(withoutHeld(projection),withoutHeld(baselineCalculus.deriveRuntimeEventCalculusProjection(run)),'all other Run/process/locus cleanup remains identical');
  const sameAuthority={...authority,predecessorPrefix:stop.successorPrefix,
   operationBasis:{...operationBasis,...coordinates.constructExactOperationInvocationCoordinate({operationId:operationBasis.operationId,memberKey:operationBasis.memberKey,definitionDigest:operationBasis.definitionDigest},operationBasis.invocationRef+'/again',hash('again'))}};
  const refused=witness.admitWitnessedAct({...packet,prefix:stop.successorPrefix},sameAuthority,{kind:'witness_admission_dependencies',schemaVersion:'5.0.0',eventStore:opened.store});
  assert.equal(refused.code,'act_forbidden');observation.repeatedStopRefusal=refused.code;
  observation.reads={};
  for(const member of ['run_status','run_result','run_replay']){
   const prepared=reads.prepareRunReadAtDurablePrefix(stop.successorPrefix,member,runId);assert.ok(prepared,member);
   assert.deepEqual(prepared.source,before.source);const value=prepared.project();
   assert.equal('code'in value,member==='run_result',JSON.stringify(value));
   if(member==='run_result')assert.equal(value.code,'target_absent','stop authors no traversal Result');
   const request={caseKey:member,source:{sourceKind:'run',sourceRef:prepared.source.ref,sourceDigest:prepared.source.digest},
    projectionBasis:{projectionBasisRef:stop.successorPrefix.eventLogRef,projectionBasisDigest:stop.successorPrefix.coordinateDigest},
    selector:member==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:1000}:{kind:'none'}};
   const output=readBinding.outputFor(readContracts.ABG_PROJECT_READ_CONTRACTS[member],request,member,value);
   assert.equal(output.outcomeKind,member==='run_result'?'refusal':'result');
   if(member==='run_result')assert.equal(output.value.code,'not_found','unchanged Public absent-Result mapping');
   observation.reads[member]={nativeKind:value.kind,nativeCode:value.code??null,publicOutcome:output.outcomeKind,publicCode:output.value.code??null,source:prepared.source};
  }
  const close=opened.store.projectReopenAuthorityAndClose();
  const coldRows=freeze(JSON.parse(JSON.stringify(opened.store.readAll()))),coldFull=prefixOwner.selectValidatedRuntimeEventPrefix(coldRows);
  const cold=replayOwner.replayValidatedRuntimeEventPrefix(prefixOwner.selectRuntimeEventPrefixFromAuthority(coldFull,{runId}),coldFull);
  assert.deepEqual(cold,observation.replay);observation.coldReplayMatches=true;observation.close=close;
  observation.replay={runtimeStatus:observation.replay.runtimeStatus,continuations:observation.replay.continuations,runStoppedEventRef:observation.replay.runStoppedEventRef};
  // The non-preserving cases retain their existing cleanup; no new terminal
  // continuation semantics are introduced by this repair.
  for(const terminalReason of ['operator_abort','campaign_close']){
   const stopEvent=opened.store.readAll().at(-1),{eventId,admissionOrdinal,eventContractDigest,payloadDigest,...candidate}=stopEvent;
   const terminal=storeOwner.projectRuntimeEventFromValidatedHistory(heldRows,{...candidate,causationEventRefs:[heldRows.at(-1).eventId],payload:{...candidate.payload,reasonKind:terminalReason}});
   const terminalPrefix=prefixOwner.selectValidatedRuntimeEventPrefix(freeze([...heldRows,terminal])),terminalProjection=calculus.deriveRuntimeEventCalculusProjection(terminalPrefix);
   assert.equal(calculus.holdsAt(terminalProjection,calculus.constructRuntimeFluent({name:'continuation_open',identity:held.continuation.continuationRef})),false);
   assert.deepEqual(terminalProjection,baselineCalculus.deriveRuntimeEventCalculusProjection(terminalPrefix),'non-preserving terminal effects are unchanged');
  }
 }
 save();
});
