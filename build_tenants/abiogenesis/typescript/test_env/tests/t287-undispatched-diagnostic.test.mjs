import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import ts from 'typescript';
import {sha256Canonical as hash} from '../../build/code/src/shared/digests.js';

const root=resolve(import.meta.dirname,'../..');
// Source-only component checks. Frozen dependencies supply lower premises;
// nothing here dispatches an actor. The refusal-completion case alone opens
// per-run scratch stores through the store owner under the system temporary
// directory and removes them.
async function sourceOwner(relative,overrides={},expose=[]){
 const built=join(root,'build/code/src',relative+'.js');
 const code=ts.transpileModule(fs.readFileSync(join(root,'code/src',relative+'.ts'),'utf8'),{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText+(expose.length?'\nexport {'+expose.join(',')+'};':'');
 const module=new SourceTextModule(code,{identifier:built});
 await module.link(async specifier=>{const values={...await import(specifier.startsWith('.')?pathToFileURL(resolve(dirname(built),specifier)).href:specifier),...overrides[specifier]};
  return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
 await module.evaluate();return module.namespace;
}
const diagnostic=await sourceOwner('abg/runtime_failure');
const profiles=await sourceOwner('abg/event_contract_profiles',{'./runtime_failure.js':diagnostic});
const port=await sourceOwner('implementation/leaf_invocation_port',{'../abg/event_contract_profiles.js':profiles});
const value={kind:'component_task'},inputDigest=hash(value);
const resolution={computeRegime:'F_P',implementationRef:'implementation://component/preparation',inputContractRef:'contract://component/input',
 outputContractRef:'contract://component/output',failureContractRef:'contract://component/failure'};
const occurrence={cCallRef:'c-call://component/preparation',runId:'run://component',graphCallId:'graph-call://component',frameId:'frame://component',
 programLocusRef:'locus://component',taskOrdinal:null,attempt:1,executionAuthority:null};
const base={resolution,value,inputDigest,failureValueKind:'component_failure',verifyAuthority:()=>true,validateSuccess:()=>true,
 resolveWorkerContracts:()=>({instructionContractRef:resolution.inputContractRef,resultContractRef:resolution.outputContractRef}),occurrence};

test('first preparation exception remains retrievable through the unchanged typed refusal and cold JSON',async()=>{
 const error=new TypeError('worksite dispatch requires exact native admitted instruction assembly');
 const firstStack=error.stack;
 const receipt=await port.invokeLeafOwnerBoundary({...base,loadImplementation:async()=>()=>{throw error;}});
 const cold=JSON.parse(JSON.stringify(receipt)),o=cold.ownerObservation;
 assert.equal(cold.kind,'closed_leaf_owner_receipt');assert.equal(o.stage,'preparation');assert.equal(o.reason,'thrown');
 assert.equal(o.errorClass,'TypeError');assert.equal(o.errorCode,null);assert(profiles.isUndispatchedOwnerObservation(o));
 const subject=diagnostic.readRuntimeFailureDiagnosticSubject(o.diagnosticRef);
 assert.equal(subject.message,error.message);assert.equal(subject.stack,firstStack);
 assert.equal(subject.messageTruncated,false);assert.equal(subject.stackTruncated,false);
 assert.equal(subject.diagnosticClassRef,profiles.undispatchedOwnerDiagnosticRef('preparation','thrown'));
 assert.equal(cold.candidate.resultCandidate.failureClass,'implementation_exception');
 assert.equal(cold.candidate.resultCandidate.diagnosticRef,o.diagnosticRef);
 const altered={...subject,stack:firstStack+'changed'};
 assert.notEqual(hash(cold.candidate.resultCandidate),hash({...cold.candidate.resultCandidate,diagnosticRef:diagnostic.constructRuntimeFailureDiagnosticRef(altered)}));
 assert.equal(profiles.isUndispatchedOwnerObservation({...o,stage:'implementation_load'}),false);
 assert.equal(profiles.isUndispatchedOwnerObservation({...o,errorClass:'Error'}),false);
 assert.equal(profiles.isUndispatchedOwnerObservation({...o,diagnosticRef:diagnostic.constructRuntimeFailureDiagnosticRef({...subject,prompt:'forbidden'})}),false);
 assert.equal(profiles.isUndispatchedOwnerObservation({...o,diagnosticRef:o.diagnosticRef+'%20'}),false);
});

test('current event profile keeps its descriptor and accepts retained or historical opaque diagnostics',async()=>{
 const store=await sourceOwner('abg/event_store',{'./event_contract_profiles.js':profiles},['assertRuntimeEventContract']);
 const frozen=await import('../../build/code/src/abg/event_store.js');
 assert.equal(store.ROOT_EVENT_CONTRACT_DIGEST,frozen.ROOT_EVENT_CONTRACT_DIGEST);
 const error=new RangeError('small preparation failure');
 const receipt=await port.invokeLeafOwnerBoundary({...base,loadImplementation:async()=>()=>{throw error;}});
 const o=receipt.ownerObservation,failure=receipt.candidate.resultCandidate;
 const candidate={kind:'c_call_evidenced',eventTime:'2026-09-24T00:00:00.000Z',aggregateType:'c_call',aggregateId:o.cCallRef,parentAggregateId:o.frameId,
  causationEventRefs:[],correlationId:'correlation://component',workflowVersion:'5.0.0',scopeClass:'run',basisId:'basis://component',
  runId:o.runId,graphCallId:o.graphCallId,frameId:o.frameId,payload:{cCallRef:o.cCallRef,contractRef:'contract://component/evidence',
   evidenceClass:'undispatched_owner_refusal',evidenceRef:'evidence://component',evidenceDigest:hash(o),implementationRef:o.implementationRef,
   inputDigest,outputDigest:hash(failure),failureContractRef:resolution.failureContractRef,failureValue:failure,ownerObservation:o}};
 assert.doesNotThrow(()=>store.assertRuntimeEventContract(candidate,store.ROOT_EVENT_CONTRACT_DIGEST));
 const old=profiles.undispatchedOwnerDiagnosticRef('preparation','thrown');
 const historical={...o,diagnosticRef:old};
 assert(profiles.isUndispatchedOwnerObservation(historical));assert.equal(diagnostic.readRuntimeFailureDiagnosticSubject(old),null);
 assert.doesNotThrow(()=>store.assertRuntimeEventContract({...candidate,payload:{...candidate.payload,ownerObservation:historical}},store.ROOT_EVENT_CONTRACT_DIGEST));
 assert.throws(()=>store.assertRuntimeEventContract({...candidate,runId:'run://crossed'},store.ROOT_EVENT_CONTRACT_DIGEST),/exact CCall/);
 assert.throws(()=>store.assertRuntimeEventContract(candidate,store.LEGACY_ROOT_EVENT_CONTRACT_DIGEST));
});

test('other pre-dispatch catches keep exact stage and native stack; arbitrary getters stay unread',async()=>{
 for(const stage of ['authority_verification','worker_contract_resolution','implementation_load']){
  const error=new Error(stage),changes=stage==='authority_verification'?{verifyAuthority:()=>{throw error;}}:
   stage==='worker_contract_resolution'?{resolveWorkerContracts:()=>{throw error;}}:{loadImplementation:async()=>{throw error;}};
  const receipt=await port.invokeLeafOwnerBoundary({...base,loadImplementation:async()=>()=>null,...changes});
  assert.equal(receipt.ownerObservation.stage,stage);
  assert.equal(diagnostic.readRuntimeFailureDiagnosticSubject(receipt.ownerObservation.diagnosticRef).message,stage);
 }
 let gets=0;const hostile={get message(){gets++;throw Error('forbidden');},get stack(){gets++;throw Error('forbidden');}};
 assert.equal(profiles.undispatchedOwnerDiagnosticRef('preparation','thrown',hostile),profiles.undispatchedOwnerDiagnosticRef('preparation','thrown'));
 const nativeHostile=new TypeError('safe');Object.defineProperty(nativeHostile,'stack',{get(){gets++;throw Error('forbidden');}});
 assert.equal(profiles.undispatchedOwnerDiagnosticRef('preparation','thrown',nativeHostile),profiles.undispatchedOwnerDiagnosticRef('preparation','thrown'));
 assert.equal(gets,0);
 const large=new Error('x'.repeat(9000));Object.defineProperty(large,'stack',{value:'y'.repeat(40000)});
 const ref=profiles.undispatchedOwnerDiagnosticRef('preparation','thrown',large),body=diagnostic.readRuntimeFailureDiagnosticSubject(ref);
 assert.equal(body.message.length,8192);assert.equal(body.stack.length,32768);assert(body.messageTruncated&&body.stackTruncated);
});

test('undispatched refusal retains entered, routed and resumed cursor ownership at raw and cold boundaries',async t=>{
 // The actual prefix owner selects every cut from one immutable admitted
 // order; the array order is the admission order and ordinals are gap-free.
 const prefixes=await import('../../build/code/src/abg/event_prefix.js');
 const cursors=await import('../../build/code/src/abg/traversal_cursor.js');
 const {deepFreeze}=await import('../../build/code/src/shared/immutable.js');
 let rows=[],recorded=[];
 const cursor=cursors.constructTraversalCursorCandidate({programRef:'program://component',executionBasisRef:'basis://component',
  traversalScopeRef:'scope://component',runId:occurrence.runId,graphCallId:occurrence.graphCallId,frameId:occurrence.frameId,
  graphRef:'graph://component',inputRef:'input://component',inputDigest,currentNodeRef:'node://component',position:'at_term',
  termPath:['node','case','author'],taskOrdinal:null,attempt:1,retryPath:[]});
 const callIdentity={basisId:cursor.executionBasisRef,graphCallId:cursor.graphCallId,frameId:cursor.frameId,vectorIndex:0,
  stageRole:'semantic-revision-author',taskOrdinal:null,attempt:1,programLocusRef:occurrence.programLocusRef,retryPath:[]};
 const cCallDigest=hash(callIdentity),cCallRef='c-call:'+cCallDigest;
 const receipt=await port.invokeLeafOwnerBoundary({...base,occurrence:{...occurrence,cCallRef},
  loadImplementation:async()=>()=>{throw new TypeError('assembly refused');}});
 const o=receipt.ownerObservation,failure=receipt.candidate.resultCandidate;
 const call={...o,...callIdentity,kind:'c_call',schemaVersion:'5.0.0',cCallRef,cCallDigest,callClass:'leaf',regime:'F_P',
  openedEventRef:'event://opened',fibreSelectedEventRef:'event://selected',failureContractRef:resolution.failureContractRef,
  evidenceContractRef:'contract://component/evidence',armId:'arm://component',compositionRef:null,implementationSetRef:'set://component'};
 const candidate={kind:'undispatched_owner_refusal_evidence_candidate',schemaVersion:'5.0.0',implementationRef:o.implementationRef,inputDigest,
  outputDigest:hash(failure),failureContractRef:resolution.failureContractRef,failureValue:failure,ownerObservation:o};
 const scope={runId:call.runId,graphCallId:call.graphCallId,frameId:call.frameId,basisId:call.basisId,eventTime:'2026-09-24T00:00:00.000Z',
  parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://component',workflowVersion:'5.0.0',scopeClass:'run'};
 const entry={...scope,eventId:'event://entry',aggregateType:'frame',aggregateId:call.frameId,
  kind:'traversal_cursor_entered',payload:{cursorRef:cursor.cursorRef,cursorDigest:cursor.cursorDigest,inputDigest}};
 const opened={...scope,eventId:call.openedEventRef,kind:'c_call_opened',aggregateType:'c_call',aggregateId:cCallRef,
  parentAggregateId:call.frameId,causationEventRefs:[entry.eventId],payload:{cCallRef,cCallDigest,callClass:'leaf',cursorRef:cursor.cursorRef,cursorDigest:cursor.cursorDigest}};
 const fibre={...scope,eventId:call.fibreSelectedEventRef,kind:'c_call_fibre_selected',aggregateType:'c_call',aggregateId:cCallRef,
  parentAggregateId:call.frameId,causationEventRefs:[opened.eventId],payload:{cCallRef,callClass:'leaf',implementationRef:o.implementationRef,
   regime:'F_P',armId:call.armId,compositionRef:null,implementationSetRef:call.implementationSetRef}};
 const selectPrefix=()=>prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(rows.map((e,i)=>({...e,admissionOrdinal:i+1,payloadDigest:hash(e.payload)}))));
 const matches=(c=candidate)=>owner.undispatchedOwnerEvidenceMatches(selectPrefix(),call,c,inputDigest);
 const frozenStore=await import('../../build/code/src/abg/event_store.js');
 // Controlled component test: physical append custody and native frame
 // liveness sampling are substituted. The actual prefix owner, cursor, CCall,
 // observation, raw evidence and cold association predicates run.
 t.diagnostic('controlled component test: physical append custody and native frame liveness sampling substituted');
 const owner=await sourceOwner('abg/c_call',{'./event_contract_profiles.js':profiles,'./event_store.js':{
   selectHeldEventStoreDurablePrefix:()=>({storeIdentity:{eventContractDigest:frozenStore.ROOT_EVENT_CONTRACT_DIGEST}}),
   isRuntimeEventTransactionActive:()=>true,admitRuntimeEvent:(_s,e)=>{const event={...e,eventId:'event://evidence',admissionOrdinal:rows.length+1};recorded.push(event);return event;}},
  './runtime_liveness.js':{captureNativeFrameBoundary:()=>null,observeNativeFrameLiveness:()=>{},observeNativeCCallLiveness:()=>{}}});
 const admit=(selected=cursor,c=candidate)=>{const prefix=selectPrefix();
  return owner.admitEvidence({digest:()=>prefixes.runtimeEventPrefixDigest(prefix)},prefix,{}, {},selected,call,c,
   call.evidenceContractRef,inputDigest,{correlationId:'correlation://component',causationEventRefs:[]});};
 rows=[entry,opened,fibre];
 assert.equal(matches(),true);
 assert.equal(admit().kind,'admitted_c_call_evidence');
 const route={...scope,eventId:'event://route',aggregateType:'frame',aggregateId:call.frameId,
  kind:'traversal_route_admitted',payload:{sourceCursorRef:'cursor://case',sourceCursorDigest:hash('case'),
   targetCursorRef:cursor.cursorRef,targetCursorDigest:cursor.cursorDigest}};
 const routedOpen={...opened,causationEventRefs:[route.eventId]};
 const routedEntry={...entry,payload:{...entry.payload,cursorRef:route.payload.sourceCursorRef,cursorDigest:route.payload.sourceCursorDigest}};
 rows=[routedEntry,route,routedOpen,fibre];
 assert.equal(matches(),true);
 const admitted=admit();assert.equal(admitted.kind,'admitted_c_call_evidence');
 assert.deepEqual(recorded.at(-1).payload.ownerObservation,o);
 assert.equal(diagnostic.readRuntimeFailureDiagnosticSubject(admitted.ownerObservation.diagnosticRef).message,'assembly refused');
 assert.equal(admit({...cursor,inputDigest:hash('wrong')}).kind,'c_call_admission_rejection');
 const other=cursors.constructTraversalCursorCandidate({...cursor,termPath:['node','case','other']});
 assert.equal(admit(other).kind,'c_call_admission_rejection');
 assert.equal(matches({...candidate,outputDigest:hash('wrong')}),false);
 assert.equal(matches({...candidate,ownerObservation:{...o,cCallRef:'c-call:wrong'}}),false);
 assert.equal(matches({...candidate,ownerObservation:{...o,attempt:2}}),false);
 for(const bad of [{...route,frameId:'frame://other'},{...route,payload:{...route.payload,targetCursorDigest:hash('wrong')}}]){
  rows=[routedEntry,bad,routedOpen,fibre];assert.equal(matches(),false);
 }
 // A route admitted after the call it would own is not that call's origin.
 rows=[routedEntry,routedOpen,route,fibre];assert.equal(matches(),false);
 // A cross-Run cause and a dangling cause are refused earlier, by the prefix owner.
 rows=[routedEntry,{...route,runId:'run://other'},routedOpen,fibre];
 assert.throws(selectPrefix,/cannot cross a run causation boundary/);
 rows=[routedEntry,{...route,eventId:'event://unrelated'},routedOpen,fibre];
 assert.throws(selectPrefix,/unknown causal predecessor/);
 rows=[routedEntry,route,{...routedOpen,causationEventRefs:[routedEntry.eventId]},fibre];assert.equal(matches(),false);
 rows=[routedEntry,route,{...route,eventId:'event://second-route'},routedOpen,fibre];assert.equal(matches(),false);
 rows=[routedEntry,route,routedOpen,fibre,{...scope,eventId:'event://binding',kind:'actor_transport_binding_admitted',aggregateType:'actor_transport_binding',
  aggregateId:'binding://actor',causationEventRefs:[fibre.eventId],payload:{cCallRef}}];
 assert.equal(matches(),false);
 const resumed={...scope,eventId:'event://resume',aggregateType:'continuation',aggregateId:'continuation://component',
  kind:'fh_interaction_resume_admitted',payload:{successorCursor:cursor,successorCursorRef:cursor.cursorRef,
   successorCursorDigest:cursor.cursorDigest,successorInputDigest:inputDigest}};
 rows=[resumed,{...opened,causationEventRefs:[resumed.eventId]},fibre];
 assert.equal(admit().kind,'admitted_c_call_evidence');
 rows=[{...resumed,payload:{...resumed.payload,successorInputDigest:hash('wrong')}},rows[1],fibre];
 assert.equal(matches(),false);
});

test('source diagnostic/profile/store imports initialize together with their actual cyclic links',async()=>{
 const names=['abg/event_store','abg/event_contract_profiles','abg/runtime_failure'];
 const modules=new Map(names.map(name=>{
  const path=join(root,'build/code/src',name+'.js');
  const code=ts.transpileModule(fs.readFileSync(join(root,'code/src',name+'.ts'),'utf8'),{
   compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
  return [path,new SourceTextModule(code,{identifier:path})];
 }));
 const entry=modules.get(join(root,'build/code/src/abg/event_store.js'));
 await entry.link(async(specifier,from)=>{
  const path=specifier.startsWith('.')?resolve(dirname(from.identifier),specifier):specifier;
  if(modules.has(path))return modules.get(path);
  const values=await import(specifier.startsWith('.')?pathToFileURL(path).href:specifier);
  return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});
 });await entry.evaluate();
 const profile=modules.get(join(root,'build/code/src/abg/event_contract_profiles.js')).namespace;
 const retained=modules.get(join(root,'build/code/src/abg/runtime_failure.js')).namespace;
 assert.equal(retained.readRuntimeFailureDiagnosticSubject(profile.undispatchedOwnerDiagnosticRef('preparation','thrown',new Error('initialized'))).message,'initialized');
});

test('existing run_evidence exposes digest-bound undispatched diagnostics and refuses cold substitution',async()=>{
 const receipt=await port.invokeLeafOwnerBoundary({...base,loadImplementation:async()=>()=>{throw new TypeError('first preparation cause');}});
 const o=receipt.ownerObservation,failure=receipt.candidate.resultCandidate;
 const body={cCallRef:o.cCallRef,evidenceClass:'undispatched_owner_refusal',contractRef:'contract://component/evidence',
  implementationRef:o.implementationRef,inputDigest,outputDigest:hash(failure),failureContractRef:resolution.failureContractRef,failureValue:failure,ownerObservation:o};
 const evidenceDigest=hash(body),payload={...body,evidenceDigest,evidenceRef:'evidence://abiogenesis/'+evidenceDigest.slice(7)};
 let event=JSON.parse(JSON.stringify({kind:'c_call_evidenced',aggregateType:'c_call',aggregateId:o.cCallRef,
  eventId:'event://component',payloadDigest:hash(payload),payload,runId:o.runId,graphCallId:o.graphCallId,frameId:o.frameId,basisId:'basis://component',causationEventRefs:['event://selected']}));
 const projection=await sourceOwner('abg/runtime_failure',{'./event_contract_profiles.js':profiles,
  './event_prefix.js':{indexedRuntimeEvents:(_prefix,key)=>key==='kind:c_call_evidenced'?[event]:[]}});
 const rows=projection.projectRuntimeFailureEvidenceAtPrefix({});
 assert.equal(rows[0].kind,'undispatched_owner_failure_evidence');assert.equal(rows[0].availability,'retained');
 assert.equal(rows[0].subject.message,'first preparation cause');assert.equal(rows[0].subjectDigest,hash(rows[0].subject));
 assert.equal(rows[0].evidenceDigest,evidenceDigest);
 const adapter=await sourceOwner('abg/project_read_definition_bindings',{},['evidenceProjection']);
 const publicValue=adapter.evidenceProjection('run_evidence',{source:{sourceRef:o.runId,sourceDigest:hash('run')}},
  {replayRef:'replay://component',replayDigest:hash('replay'),evidenceRefs:[],eventAtoms:[],runtimeFailures:rows});
 assert.equal(publicValue.evidence.length,1);
 const projected=JSON.parse(decodeURIComponent(publicValue.evidence[0].ref.split(',').slice(1).join(',')));
 assert.equal(projected.subject.message,'first preparation cause');assert.equal(publicValue.evidence[0].digest,hash(projected));
 event.payload.ownerObservation={...o,diagnosticRef:profiles.undispatchedOwnerDiagnosticRef('preparation','thrown')};
 assert.throws(()=>projection.projectRuntimeFailureEvidenceAtPrefix({}),/identity or scope/);
 const historicalObservation=event.payload.ownerObservation,historicalFailure={...failure,diagnosticRef:historicalObservation.diagnosticRef};
 const historicalBody={...body,ownerObservation:historicalObservation,failureValue:historicalFailure,outputDigest:hash(historicalFailure)};
 const historicalDigest=hash(historicalBody),historicalPayload={...historicalBody,evidenceDigest:historicalDigest,evidenceRef:'evidence://abiogenesis/'+historicalDigest.slice(7)};
 event={...event,payload:historicalPayload,payloadDigest:hash(historicalPayload)};
 assert.equal(projection.projectRuntimeFailureEvidenceAtPrefix({})[0].availability,'not_retained');
});

test('CCall refusal completion keeps full authority across sparse multi-Run scope and cold raw admission',async t=>{
 const prefixes=await import('../../build/code/src/abg/event_prefix.js');
 const stores=await import('../../build/code/src/abg/event_store.js');
 const {deepFreeze}=await import('../../build/code/src/shared/immutable.js');
 const directory=fs.mkdtempSync(join(tmpdir(),'undispatched-refusal-'));
 t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
 const identity={basisId:'basis://refusal',graphCallId:'graph-call://refusal',frameId:'frame://refusal',
  vectorIndex:0,stageRole:'workflow',taskOrdinal:null,attempt:1,programLocusRef:'locus://refusal',retryPath:[],
  childGraphFunctionRef:'graph-function://child',failureContractRef:'contract://failure'};
 const cCallDigest=hash(identity),cCallRef='c-call:'+cCallDigest,runId='run://selected';
 const shape={callClass:'workflow',regime:'F_D',armId:'arm://workflow',compositionRef:null,implementationSetRef:'implementations://refusal',
  judgmentPredicateRef:'predicate://judgment'};
 // The store owner constructs and admits the whole history: two Runs whose
 // events interleave, so the selected Run's own events are sparse in it.
 const envelope=(kind,run,causationEventRefs,payload,extra={})=>({kind,runId:run,eventTime:'2026-09-26T00:00:00.000Z',
  aggregateType:'run',aggregateId:run,parentAggregateId:null,causationEventRefs,correlationId:'correlation://refusal',
  workflowVersion:'5.0.0',scopeClass:'run',basisId:identity.basisId,graphCallId:identity.graphCallId,frameId:identity.frameId,payload,...extra});
 const segment=run=>({executionBasisDigest:hash('basis'),executionBasisRef:identity.basisId,graphDigest:hash('graph'),
  graphFunctionRef:'graph-function://parent',graphRef:'graph://refusal',invocationAdmissionRef:'invocation-admission://'+run,
  invocationRef:'invocation://'+run,programRef:'program://refusal',runDigest:hash(run),runId:run,workspaceBindingId:'workspace-binding://refusal'});
 const history=events=>{
  const acquired=stores.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',
   eventLogPath:join(directory,'events-'+fs.readdirSync(directory).length+'.jsonl')});
  assert('store' in acquired,JSON.stringify(acquired));t.after(()=>acquired.store.closeDurableLog());
  const selected=stores.admitRuntimeEvent(acquired.store,events.selected()),unrelated=stores.admitRuntimeEvent(acquired.store,events.unrelated());
  const opened=stores.admitRuntimeEvent(acquired.store,events.opened(selected));
  const fibre=stores.admitRuntimeEvent(acquired.store,events.fibre(opened));
  stores.admitRuntimeEvent(acquired.store,events.progress(unrelated));
  return {store:acquired.store,opened,fibre};
 };
 const events={selected:()=>envelope('run_segment_opened',runId,[],segment(runId)),
  unrelated:()=>envelope('run_segment_opened','run://other',[],segment('run://other')),
  opened:selected=>envelope('c_call_opened',runId,[selected.eventId],{cCallRef,cCallDigest,callClass:shape.callClass,basisId:identity.basisId,
   graphFunctionRef:'graph-function://parent',graphCallId:identity.graphCallId,frameId:identity.frameId,edgeRef:'edge://refusal',
   vectorIndex:identity.vectorIndex,stageRole:identity.stageRole,batchRef:null,taskOrdinal:identity.taskOrdinal,attempt:identity.attempt,
   programLocusRef:identity.programLocusRef,retryPath:identity.retryPath,cursorRef:'cursor://selected',cursorDigest:hash('cursor'),
   childGraphFunctionRef:identity.childGraphFunctionRef,failureContractRef:identity.failureContractRef,judgmentPredicateRef:shape.judgmentPredicateRef},
   {aggregateType:'c_call',aggregateId:cCallRef,parentAggregateId:identity.frameId}),
  fibre:opened=>envelope('c_call_fibre_selected',runId,[opened.eventId],{cCallRef,callClass:shape.callClass,regime:shape.regime,armId:shape.armId,
   compositionRef:null,implementationSetRef:shape.implementationSetRef,childGraphFunctionRef:identity.childGraphFunctionRef},
   {aggregateType:'c_call',aggregateId:cCallRef,parentAggregateId:identity.frameId}),
  progress:unrelated=>envelope('run_segment_opened','run://other',[unrelated.eventId],segment('run://other'))};
 const warm=history(events);
 // The cold history is admitted from a JSON copy of every candidate and read
 // back from its durable bytes by the owner's reopen.
 const coldEvents=Object.fromEntries(Object.entries(events).map(([k,f])=>[k,(...a)=>JSON.parse(JSON.stringify(f(...a)))]));
 const coldSource=history(coldEvents);
 const reopened=stores.reopenEventStore(coldSource.store.projectReopenAuthorityAndClose().reopenAuthority);
 assert.equal(reopened.kind,'reopened_event_store_context');t.after(()=>reopened.store.closeDurableLog());
 assert.equal(coldSource.opened.eventId,warm.opened.eventId);
 const call=deepFreeze({...identity,kind:'c_call',schemaVersion:'5.0.0',cCallDigest,cCallRef,runId,graphFunctionRef:'graph-function://parent',
  ...shape,openedEventRef:warm.opened.eventId,fibreSelectedEventRef:warm.fibre.eventId,
  outputContractRef:'contract://output',refusalContractRef:'contract://refusal',refusalValueKind:'component_refusal',
  evidenceContractRef:'contract://evidence',rejectionContractRef:'contract://rejection'});
 const held=store=>stores.selectHeldEventStoreDurablePrefix(store);
 const eventsAt=prefix=>stores.projectRuntimeEventsAtDurablePrefix(prefix);
 let completionCalls=0,authority=null;
 // Native frame liveness sampling is the one substituted premise: these
 // Runs open no native frame. The store, prefix, CCall phase and identity,
 // refusal evidence, result and judgment, and outcome composition all run.
 t.diagnostic('controlled component test: native frame liveness sampling substituted');
 const owner=await sourceOwner('abg/c_call',{'./runtime_liveness.js':{captureNativeFrameBoundary:()=>null,observeNativeFrameLiveness:()=>{}}});
 const outcome=await sourceOwner('abg/c_call_outcome',{'./c_call.js':{...owner,completeRejectedCCall:(...args)=>{completionCalls++;
  assert.deepEqual([...prefixes.runtimeEventBodiesAtPrefix(args[1])],[...eventsAt(authority)],'handoff conserves the full authority cut');
  return owner.completeRejectedCCall(...args);}}});
 const basis={correlationId:'correlation://refusal',causationEventRefs:[],eventTime:'2026-09-24T00:00:00.000Z'};
 const initial=eventsAt(held(warm.store));
 const full=prefixes.selectValidatedRuntimeEventPrefix(initial),sparse=prefixes.selectRuntimeEventPrefixFromAuthority(full,{runId});
 assert.deepEqual(sparse.events.map(e=>e.admissionOrdinal),[1,3,4]);
 assert.throws(()=>prefixes.selectValidatedRuntimeEventPrefix(sparse.events),/gap-free admission-ordinal order/,
  'a sparse subset is still not raw globally admitted history');
 const rejection=owner.admitResult(warm.store,full,{}, {},{},call,{kind:'bad_result'},'success',call.outputContractRef,'result',()=>false,[],basis);
 assert.equal(rejection.kind,'c_call_admission_rejection');assert.equal(rejection.stage,'result');
 const input={store:warm.store,predecessorPrefix:held(warm.store),graph:{},graphFunction:{},cursor:{},cCall:call,rejection,basis};
 authority=input.predecessorPrefix;
 for(const changes of [{rejection:{...rejection,cCallRef:'c-call:wrong'}},{cCall:{...call,cCallDigest:hash('wrong')}},
  {cCall:{...call,runId:'run://other'}},{rejection:{...rejection,stage:'judgment'}}]){
  assert.throws(()=>outcome.admitCCallRejection({...input,...changes}),/authentic open-call|stage does not match/);
  assert.equal(held(warm.store).coordinateDigest,input.predecessorPrefix.coordinateDigest,'failed transaction conserves the predecessor');
 }
 for(const store of [warm.store,reopened.store]){
  const predecessorPrefix=held(store);authority=predecessorPrefix;
  assert.deepEqual(eventsAt(predecessorPrefix),initial);
  const result=outcome.admitCCallRejection({...input,store,predecessorPrefix});
  assert.equal(result.disposition,'blocked');assert.deepEqual(result.successorPrefix,held(store));
  assert.equal(result.diagnosticRef,rejection.diagnosticRef);assert.equal(result.result.resultClass,'refusal');
  assert.equal(result.result.value.candidateDigest,rejection.candidateDigest);
  assert.equal(result.result.value.diagnosticRef,rejection.diagnosticRef);
  const rows=eventsAt(result.successorPrefix);
  assert.deepEqual(rows.slice(0,initial.length),initial);
  assert.deepEqual(rows.slice(-3).map(e=>e.kind),['c_call_evidenced','c_call_result_admitted','c_call_judged']);
  assert(rows.slice(-3).every(e=>e.runId===call.runId));
  assert.equal(rows.at(-1).payload.judgment,'blocked');
  assert.equal(rows.at(-1).payload.reasonRef,rejection.diagnosticRef);
  assert(!result.runtimePrefix.events.some(e=>e.runId==='run://other'));
  // The Public prefix is the owned Run selection at the same cut: same events,
  // extent, digest and profile.
  const owned=prefixes.selectRuntimeEventPrefixFromAuthority(prefixes.selectValidatedRuntimeEventPrefix(rows),{runId:call.runId});
  assert.deepEqual(result.runtimePrefix.events.map(e=>e.eventId),owned.events.map(e=>e.eventId));
  assert.deepEqual(prefixes.runtimeEventPrefixExtent(result.runtimePrefix),prefixes.runtimeEventPrefixExtent(owned));
  assert.equal(prefixes.runtimeEventPrefixDigest(result.runtimePrefix),prefixes.runtimeEventPrefixDigest(owned));
  assert.deepEqual(prefixes.runtimeEventProfileScheduleFromValidatedPrefix(result.runtimePrefix),
   prefixes.runtimeEventProfileScheduleFromValidatedPrefix(owned));
  authority=result.successorPrefix;
  assert.throws(()=>outcome.admitCCallRejection({...input,store,predecessorPrefix:result.successorPrefix}),/authentic open-call admission rejection/);
  assert.equal(held(store).coordinateDigest,result.successorPrefix.coordinateDigest,'duplicate completion is refused without changing prior events');
 }
 assert.equal(completionCalls,8);
 assert.deepEqual(full.events,initial,'earlier authority cut remains immutable');
 assert.throws(()=>prefixes.runtimeEventsFromValidatedPrefix({...full}),/nominal validated/);
 assert.throws(()=>prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(initial.map((e,i)=>i===2?{...e,admissionOrdinal:9}:e))),/gap-free admission-ordinal order/);
});
