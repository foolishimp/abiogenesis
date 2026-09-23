import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import * as p from '../../build/code/src/product/index.js';
import * as es from '../../build/code/src/abg/event_store.js';
import * as ep from '../../build/code/src/abg/event_prefix.js';
import * as cursorOwner from '../../build/code/src/abg/traversal_cursor.js';
import * as transitionOwner from '../../build/code/src/abg/traversal_transition.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {rawAdmitValue} from '../../build/code/src/validator/index.js';
import {acquireNewEmptyAppendSinkFixture} from '../support/new-empty-append-sink.mjs';
const hash=p.sha256Canonical;
async function owner(relative,overrides={}){
 const file=path.resolve('build/code/src',relative),m=new vm.SourceTextModule(await fs.readFile(file,'utf8'),{identifier:file});
 await m.link(async spec=>{const actual=await import(spec.startsWith('node:')?spec:pathToFileURL(path.resolve(path.dirname(file),spec)).href),values={...actual,...overrides[spec]};
  return new vm.SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();return m.namespace;
}
// Lower premises: declaration/materialization, admitted execution basis and the
// completed CCall carrier are supplied. No replacement for cursor admission,
// workflow-input provenance, runtime event store/transaction, or replay is used.
// This is an owner component fixture, not installed Product or actor evidence.
test('route-origin workflow cursor stages, replays, commits and cold-projects exact retained input',async t=>{
 const acquired=await acquireNewEmptyAppendSinkFixture(t,es.createNewEmptyAppendSink,'retained-route-cursor-');
 let entry={kind:'job_entry',schemaVersion:'5.0.0',job:{label:'fixture'}},output={kind:'job_execution',schemaVersion:'5.0.0',result:'completed'};
 let material=null;
 if(process.env.ABI5_RETAINED_MATERIAL){
  material=JSON.parse(await fs.readFile(process.env.ABI5_RETAINED_MATERIAL,'utf8'));
  const select=async spec=>{let value=JSON.parse(await fs.readFile(spec.path,'utf8'));for(const key of spec.keys)value=value[key];assert.equal(hash(value),spec.digest);return value;};
  entry=await select(material.entry);output=await select(material.source);
 }
 const E='contract://fixture/entry',S='contract://fixture/source',T=p.RETAINED_GRAPH_INPUT_CONTRACT.contractRef;
 const f={runId:'run://fixture',graphCallId:'graph-call://parent',frameId:'frame://parent',basisId:'basis://parent'};
 const childScope={...f,graphCallId:'graph-call://child',frameId:'frame://child',basisId:'basis://child'};
 const common={programRef:'program://fixture',invocationAdmissionRef:'invocation-admission://fixture',invocationRef:'invocation://fixture',invocationDigest:hash('invocation')};
 const basis={...common,basisClass:'root',basisRef:f.basisId,basisDigest:hash('parent'),programRef:'program://fixture',rawInputValue:entry,
  graphFunctionRef:'graph-function://root',graphRef:'graph://fixture',graphDigest:hash('graph'),parentCCallRef:null};
 const child={...common,basisRef:childScope.basisId,basisDigest:hash('child'),graphFunctionRef:'graph-function://child',parentExecutionBasisRef:basis.basisRef,
  parentCCallRef:'call://source',rawInputDigest:hash('source-input'),closureContractRef:'closure://child',resultContractRef:S};
 let prefix=acquired.prefix;const rows=[];
 const append=(kind,payload,scope=f,aggregateType='c_call',aggregateId='call://source',causes=[])=>{
  if(kind==='c_call_result_admitted')payload={cCallRef:aggregateId,...payload};
  if(kind==='c_call_judged')payload={cCallRef:aggregateId,judgmentDigest:hash(payload),retryAttemptRef:null,...payload};
  const committed=es.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,prefix,()=>es.admitRuntimeEvent(acquired.store,{
   kind,eventTime:'2026-09-23T00:00:00.000Z',aggregateType,aggregateId,parentAggregateId:aggregateType==='frame'?scope.graphCallId:scope.frameId,
   causationEventRefs:causes,correlationId:'fixture/'+kind,workflowVersion:'5.0.0',scopeClass:aggregateType==='workspace'?'workspace':'run',...(aggregateType==='workspace'?{basisId:scope.basisId}:scope),graphFunctionRef:basis.graphFunctionRef,
   materializationRef:basis.graphRef,payload}));prefix=committed.successorPrefix;const event=committed.value;rows.push(event);return event;
 };
 const admittedBasis=append('basis_admitted',{basisRef:basis.basisRef,basisDigest:basis.basisDigest,basisClass:'root',rawInputValue:entry},f,'workspace','workspace://fixture');
 basis.admissionEventRef=admittedBasis.eventId;
 const cursorBase={programRef:basis.programRef,executionBasisRef:basis.basisRef,traversalScopeRef:'scope://fixture',runId:f.runId,graphCallId:f.graphCallId,frameId:f.frameId,
  graphRef:basis.graphRef,inputRef:'input://source',inputDigest:child.rawInputDigest,currentNodeRef:'n1',position:'at_term',termPath:[],taskOrdinal:null,attempt:1,retryPath:[]};
 const source=cursorOwner.constructTraversalCursorCandidate(cursorBase);
 const initial=cursorOwner.constructTraversalCursorCandidate({...cursorBase,currentNodeRef:'n0'});
 const entered=append('traversal_cursor_entered',{cursorRef:initial.cursorRef,cursorDigest:initial.cursorDigest,inputDigest:initial.inputDigest},f,'frame',f.frameId,[admittedBasis.eventId]);
 const routeBody={routeKind:'advance',declarationRef:basis.graphRef,declarationDigest:basis.graphDigest,sourceCursorRef:initial.cursorRef,sourceCursorDigest:initial.cursorDigest,
  targetCursorRef:source.cursorRef,targetCursorDigest:source.cursorDigest,cCallRef:null,judgmentRef:null,consumedAvailabilityRefs:[],contractRef:null,replayStateDigest:hash('prior')};
 const priorDigest=hash(routeBody);
 const prior=append('traversal_route_admitted',{routeRef:`traversal-route://abiogenesis/${priorDigest.slice(7)}`,routeDigest:priorDigest,...routeBody},f,'frame',f.frameId,[entered.eventId]);
 const opened=append('c_call_opened',{cCallRef:'call://source',cCallDigest:hash('call'),callClass:'workflow',childGraphFunctionRef:child.graphFunctionRef,
  failureContractRef:'failure://fixture',judgmentPredicateRef:'predicate://fixture',cursorRef:source.cursorRef,cursorDigest:source.cursorDigest,
  batchRef:null,taskOrdinal:null,attempt:1,retryPath:[],programLocusRef:'locus://source'},f,'c_call','call://source',[prior.eventId]);
 const fibre=append('c_call_fibre_selected',{cCallRef:'call://source',callClass:'workflow',armId:'arm://source',regime:'F_D',childGraphFunctionRef:child.graphFunctionRef},f,'c_call','call://source',[opened.eventId]);
 const childOpened=append('c_call_opened',{cCallRef:'call://child',cCallDigest:hash('child-call'),callClass:'leaf',batchRef:null,taskOrdinal:null,attempt:1,retryPath:[],programLocusRef:'locus://child'},childScope,'c_call','call://child',[fibre.eventId]);
 const childFibre=append('c_call_fibre_selected',{cCallRef:'call://child',callClass:'leaf',armId:'arm://child',regime:'F_D'},childScope,'c_call','call://child',[childOpened.eventId]);
 const childResult=append('c_call_result_admitted',{resultRef:'result://child',resultDigest:hash('child-result'),resultClass:'success',value:output,valueDigest:hash(output)},childScope,'c_call','call://child',[childFibre.eventId]);
 const childJ=append('c_call_judged',{resultRef:'result://child',resultDigest:hash('child-result'),judgment:'advance',judgmentRef:'judgment://child'},childScope,'c_call','call://child',[childResult.eventId]);
 const terminal=append('terminal_reached',{closureRef:'closure://value',closureDigest:hash('closure'),routeRef:'route://child-terminal',terminalKind:'success',resultRef:'result://child',judgmentRef:'judgment://child'},childScope,'frame',childScope.frameId,[childJ.eventId]);
 const frameClosed=append('frame_closed',{frameId:childScope.frameId,terminalReachedEventRef:terminal.eventId},childScope,'frame',childScope.frameId,[terminal.eventId]);
 const closed=append('graph_call_closed',{closureContractRef:child.closureContractRef,graphCallId:childScope.graphCallId,frameClosedEventRef:frameClosed.eventId},childScope,'graph_call',childScope.graphCallId,[frameClosed.eventId]);
 const foldPayload={parentCCallRef:'call://source',childDisposition:'closed',childExecutionBasisRef:child.basisRef,childExecutionBasisDigest:child.basisDigest,
  childGraphCallId:childScope.graphCallId,childResultRef:'result://child',childJudgmentRef:'judgment://child',childClosureRef:'closure://value',childTerminalEventRef:closed.eventId,
  outputDigest:hash(output),foldbackRef:'foldback://fixture',foldbackDigest:hash('foldback')};
 const fold=append('child_foldback_admitted',foldPayload,f,'frame',f.frameId,[closed.eventId,fibre.eventId]);
 const evidenceBody={cCallRef:'call://source',evidenceClass:'sub_traversal',contractRef:'evidence-contract://fixture',implementationRef:null,inputDigest:source.inputDigest,outputDigest:hash(output),
  foldbackRef:foldPayload.foldbackRef,foldbackDigest:foldPayload.foldbackDigest,foldbackEventRef:fold.eventId,childExecutionBasisRef:child.basisRef,childExecutionBasisDigest:child.basisDigest};
 const evidenceDigest=hash(evidenceBody),evidenceRef=`evidence://abiogenesis/${evidenceDigest.slice(7)}`;
 const evidence=append('c_call_evidenced',{evidenceRef,evidenceDigest,...evidenceBody},f,'c_call','call://source',[fibre.eventId,fold.eventId]);
 const resultEvent=append('c_call_result_admitted',{resultRef:'result://parent',resultClass:'success',resultDigest:hash('parent-result'),value:output,valueDigest:hash(output),evidenceRefs:[evidenceRef]},f,'c_call','call://source',[evidence.eventId]);
 const judgeEvent=append('c_call_judged',{resultRef:'result://parent',resultDigest:hash('parent-result'),judgment:'advance',judgmentRef:'judgment://parent'},f,'c_call','call://source',[resultEvent.eventId]);
 const input=rawAdmitValue(p.constructRetainedGraphInput(entry,output),'invocation_input',T);
 const target=cursorOwner.constructTraversalCursorCandidate({...cursorBase,currentNodeRef:'n2',inputRef:input.admissionRef,inputDigest:input.subjectDigest});
 const call={...f,cCallRef:'call://source',callClass:'workflow',childGraphFunctionRef:child.graphFunctionRef,inputContractRef:E,outputContractRef:S,transitionContractRef:'transition://fixture',
  taskOrdinal:null,attempt:1,retryPath:[]};
 const result={...resultEvent.payload,admissionEventRef:resultEvent.eventId},judgment={...judgeEvent.payload,admissionEventRef:judgeEvent.eventId};
 const lookup={projectExactExecutionBasisAtPrefix:(_v,ref)=>ref===basis.basisRef?basis:ref===child.basisRef?child:null,projectExactInvocationAdmissionAtPrefix:()=>({inputContractRef:E})};
 const cold=await owner('abg/worksite_input_provenance.js',{'./invocation_execution_truth.js':lookup});
 const replay=await owner('abg/replay.js',{'./worksite_input_provenance.js':cold});
 const graph={materializationRef:basis.graphRef,materializationDigest:basis.graphDigest,template:{nodes:[{nodeRef:'n1',term:{kind:'c_workflow',graphFunctionRef:child.graphFunctionRef}},{nodeRef:'n2',term:{kind:'c_of'}}],
  edges:[{fromNodeRef:'n1',toNodeRef:'n2',inputBinding:p.graphInputRetentionBinding(E,S)}]}};
 const sourcePath={deriveCSourceContinuation:()=>({relation:'graph_edge'}),resolveCProgramTermAtSourcePath:()=>({kind:'c_workflow',graphFunctionRef:child.graphFunctionRef,inputCarrierRef:E,outputCarrierRef:S}),
  deriveCContinuationTarget:(_g,_s,completed)=>({disposition:'advance',nodeRef:'n2',termPath:[],taskOrdinal:null,attempt:1,retryPath:[],...completed})};
 const makeRouteOwner=projectionReplay=>owner('abg/traversal_route.js',{'./invocation_execution_truth.js':lookup,'./replay.js':projectionReplay,'./execution_basis.js':{hasAdmittedExecutionBasisAtPrefix:()=>true,rehydrateExecutionBasisAtPrefix:lookup.projectExactExecutionBasisAtPrefix,admittedConstructionComposition:()=>null,selectAdmittedConstructionAuthority:()=>null},
  '../gtl/materialize.js':{isMaterializedGtlGraph:()=>true},'../gtl/source_path.js':sourcePath,
  './runtime_liveness.js':{captureNativeFrameBoundary:()=>null,observeNativeFrameLiveness:()=>{}},
  './c_call.js':{projectAdmittedCCallOutcomeAtPrefix:()=>({cCall:call,result,judgment})},'./retry.js':{projectDeclaredCRetryExitProgress:()=>({progressClass:'none',exitedRetryDepths:[]})}});
 const routeOwner=await makeRouteOwner(replay);
 const authority=ep.selectValidatedRuntimeEventPrefix(acquired.store.readAll());
 assert.equal(authority.events.filter(e=>e.kind==='traversal_cursor_entered'&&e.payload.cursorRef===source.cursorRef).length,0);
 assert.equal(cursorOwner.traversalCursorAdmissionEventRefAtPrefix(authority,source),prior.eventId);
 const beforeReplay=replay.replayValidatedRuntimeEventPrefix(authority);
 const retained=routeOwner.deriveRetainedCCallInputAtPrefix(authority,basis,graph,source,call,result,judgment);assert.deepEqual(retained.input,input);
 const nextBody={...routeBody,sourceCursorRef:source.cursorRef,sourceCursorDigest:source.cursorDigest,targetCursorRef:target.cursorRef,targetCursorDigest:target.cursorDigest,
  cCallRef:call.cCallRef,judgmentRef:judgment.judgmentRef,consumedAvailabilityRefs:[judgment.judgmentRef],contractRef:call.transitionContractRef,replayStateDigest:beforeReplay.replayDigest,boundInput:retained.input};
 const route=transitionOwner.completeRouteCandidate(nextBody);
 const candidate=transitionOwner.completeTraversalTransitionCandidate({kind:'traversal_transition_candidate',schemaVersion:'5.0.0',transitionClass:'route',route,
  evidence:{evidenceClass:'judged',cCall:call,result,judgment,graphFunction:{},completedProgresses:[]},terminalizeRun:false});
 assert(transitionOwner.isTraversalTransitionCandidate(candidate));
 const transitionInput={store:acquired.store,predecessorPrefix:prefix,executionBasis:basis,graph,graphFunction:{},source,target,candidate,basis:{correlationId:'fixture/transition',causationEventRefs:[]}};
 const rejectedProjection=process.env.ABI5_CURSOR_BASELINE_PROVENANCE
  ? await owner(process.env.ABI5_CURSOR_BASELINE_PROVENANCE,{'./invocation_execution_truth.js':lookup,'./event_prefix.js':ep})
  : {...cold,projectRetainedWorksiteInputAtPrefix:()=>null};
 const rejectingReplay=await owner('abg/replay.js',{'./worksite_input_provenance.js':rejectedProjection});
 const rejectingRoute=await makeRouteOwner(rejectingReplay);
 if(material===null)assert.throws(()=>rejectingRoute.admitTraversalTransition(transitionInput),error=>error.message==='traversal transition differs from its staged successor projection' &&
  error.cause?.message==='replay retained input has no exact entry/source/foldback provenance');
 assert.equal(acquired.store.readAll().length,authority.events.length,'failed staging rolled back');
 assert.equal(es.selectHeldEventStoreDurablePrefix(acquired.store).prefixDigest,prefix.prefixDigest);
 const admitted=routeOwner.admitTraversalTransition(transitionInput);
 assert.equal(admitted.kind,'route_transition_admission',JSON.stringify(admitted));
 const copied=ep.selectValidatedRuntimeEventPrefix(deepFreeze(JSON.parse(JSON.stringify(acquired.store.readAll()))));
 const finalRoute=copied.events.find(e=>e.eventId===admitted.route.admissionEventRef);
 assert.deepEqual(cold.projectRetainedWorksiteInputAtPrefix(copied,finalRoute)?.input,input);
 const coldReplay=replay.replayValidatedRuntimeEventPrefix(copied);
 assert.deepEqual(coldReplay.routes.at(-1).boundInput,input);
 assert.equal(coldReplay.replayDigest,admitted.replayState.replayDigest);
 assert.equal(cursorOwner.traversalCursorAdmissionEventRefAtPrefix(copied,target),admitted.route.admissionEventRef);
 assert.equal(es.selectHeldEventStoreDurablePrefix(acquired.store).prefixDigest,admitted.successorPrefix.prefixDigest);
 if(material===null){
  prefix=admitted.successorPrefix;
  append('traversal_cursor_entered',{cursorRef:source.cursorRef,cursorDigest:source.cursorDigest,inputDigest:source.inputDigest},f,'frame',f.frameId,[finalRoute.eventId]);
  const contradicted=ep.selectValidatedRuntimeEventPrefix(acquired.store.readAll());
  assert.equal(cold.projectRetainedWorksiteInputAtPrefix(contradicted,finalRoute),null);
  assert.throws(()=>replay.replayValidatedRuntimeEventPrefix(contradicted),/no exact entry\/source\/foldback provenance/,'new competing origin invalidates prior replay relation');
 }
 t.diagnostic(JSON.stringify({admittedEvents:copied.events.length,retainedBytes:Buffer.byteLength(JSON.stringify(input.value)),retainedDigest:input.subjectDigest,baseline:process.env.ABI5_CURSOR_BASELINE_PROVENANCE??'injected missing provenance',material:material!==null,sourceEnteredRows:0,sourceOrigin:prior.eventId,retainedRoute:admitted.route.admissionEventRef,coldReplayDigest:coldReplay.replayDigest,
  lowerPremises:'Supplied declaration, basis, completed CCall carrier and inert native frame-clock observer; real cursor/provenance, append transaction, staged route admission and replay.'}));
});
