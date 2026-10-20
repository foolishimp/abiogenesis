import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import ts from 'typescript';
import {sha256Canonical as hash} from '../../build/code/src/shared/digests.js';

const root=resolve(import.meta.dirname,'../..');
// Source-only component checks. Frozen dependencies supply lower premises;
// nothing here opens a resource, admits a Run or dispatches an actor.
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

test('undispatched refusal retains entered, routed and resumed cursor ownership at raw and cold boundaries',async()=>{
 let rows=[],recorded=[];
 const prefix={component:'frozen upstream prefix premise'},prefixDigest=hash('component prefix');
 const prefixOps={runtimeEventsFromValidatedPrefix:()=>rows,selectValidatedRuntimeEventPrefix:()=>prefix,
  selectRuntimeEventPrefixFromAuthority:()=>prefix,
  runtimeEventPrefixDigest:()=>prefixDigest,indexedRuntimeEvents:(_p,key)=>rows.filter(e=>
   key==='id:'+e.eventId||key==='graph-call:'+e.graphCallId||key==='aggregate:'+e.aggregateType+':'+e.aggregateId)};
 const cursors=await sourceOwner('abg/traversal_cursor',{'./event_prefix.js':prefixOps});
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
 const scope={runId:call.runId,graphCallId:call.graphCallId,frameId:call.frameId,basisId:call.basisId};
 const entry={...scope,eventId:'event://entry',admissionOrdinal:1,aggregateType:'frame',aggregateId:call.frameId,
  kind:'traversal_cursor_entered',payload:{cursorRef:cursor.cursorRef,cursorDigest:cursor.cursorDigest,inputDigest}};
 const opened={...scope,eventId:call.openedEventRef,admissionOrdinal:3,kind:'c_call_opened',aggregateType:'c_call',aggregateId:cCallRef,
  parentAggregateId:call.frameId,causationEventRefs:[entry.eventId],payload:{cCallRef,cCallDigest,callClass:'leaf',cursorRef:cursor.cursorRef,cursorDigest:cursor.cursorDigest}};
 const fibre={...scope,eventId:call.fibreSelectedEventRef,admissionOrdinal:4,kind:'c_call_fibre_selected',aggregateType:'c_call',aggregateId:cCallRef,
  parentAggregateId:call.frameId,causationEventRefs:[opened.eventId],payload:{cCallRef,callClass:'leaf',implementationRef:o.implementationRef,
   regime:'F_P',armId:call.armId,compositionRef:null,implementationSetRef:call.implementationSetRef}};
 const frozenStore=await import('../../build/code/src/abg/event_store.js');
 // Only physical append/prefix custody is substituted. The actual cursor,
 // CCall, observation, raw evidence and cold association predicates run.
 const owner=await sourceOwner('abg/c_call',{'./event_contract_profiles.js':profiles,'./event_prefix.js':prefixOps,
  './traversal_cursor.js':cursors,'./event_store.js':{
   selectHeldEventStoreDurablePrefix:()=>({storeIdentity:{eventContractDigest:frozenStore.ROOT_EVENT_CONTRACT_DIGEST}}),
   isRuntimeEventTransactionActive:()=>true,admitRuntimeEvent:(_s,e)=>{const event={...e,eventId:'event://evidence',admissionOrdinal:5};recorded.push(event);return event;}},
  './runtime_liveness.js':{captureNativeFrameBoundary:()=>null,observeNativeFrameLiveness:()=>{},observeNativeCCallLiveness:()=>{}}});
 const admit=(selected=cursor,c=candidate)=>owner.admitEvidence({digest:()=>prefixDigest},prefix,{}, {},selected,call,c,
  call.evidenceContractRef,inputDigest,{correlationId:'correlation://component',causationEventRefs:[]});
 rows=[entry,opened,fibre];
 assert.equal(owner.undispatchedOwnerEvidenceMatches(prefix,call,candidate,inputDigest),true);
 assert.equal(admit().kind,'admitted_c_call_evidence');
 const route={...scope,eventId:'event://route',admissionOrdinal:2,aggregateType:'frame',aggregateId:call.frameId,
  kind:'traversal_route_admitted',payload:{sourceCursorRef:'cursor://case',sourceCursorDigest:hash('case'),
   targetCursorRef:cursor.cursorRef,targetCursorDigest:cursor.cursorDigest}};
 const routedOpen={...opened,causationEventRefs:[route.eventId]};
 rows=[{...entry,payload:{...entry.payload,cursorRef:route.payload.sourceCursorRef,cursorDigest:route.payload.sourceCursorDigest}},route,routedOpen,fibre];
 assert.equal(owner.undispatchedOwnerEvidenceMatches(prefix,call,candidate,inputDigest),true);
 const admitted=admit();assert.equal(admitted.kind,'admitted_c_call_evidence');
 assert.deepEqual(recorded.at(-1).payload.ownerObservation,o);
 assert.equal(diagnostic.readRuntimeFailureDiagnosticSubject(admitted.ownerObservation.diagnosticRef).message,'assembly refused');
 assert.equal(admit({...cursor,inputDigest:hash('wrong')}).kind,'c_call_admission_rejection');
 const other=cursors.constructTraversalCursorCandidate({...cursor,termPath:['node','case','other']});
 assert.equal(admit(other).kind,'c_call_admission_rejection');
 assert.equal(owner.undispatchedOwnerEvidenceMatches(prefix,call,{...candidate,outputDigest:hash('wrong')},inputDigest),false);
 assert.equal(owner.undispatchedOwnerEvidenceMatches(prefix,call,{...candidate,ownerObservation:{...o,cCallRef:'c-call:wrong'}},inputDigest),false);
 assert.equal(owner.undispatchedOwnerEvidenceMatches(prefix,call,{...candidate,ownerObservation:{...o,attempt:2}},inputDigest),false);
 const validRows=rows;
 for(const bad of [{...route,runId:'run://other'},{...route,frameId:'frame://other'},
   {...route,payload:{...route.payload,targetCursorDigest:hash('wrong')}},{...route,eventId:'event://unrelated'},
   {...route,admissionOrdinal:6}]){
  rows=[validRows[0],bad,routedOpen,fibre];
  assert.equal(owner.undispatchedOwnerEvidenceMatches(prefix,call,candidate,inputDigest),false);
 }
 rows=[validRows[0],route,{...routedOpen,causationEventRefs:[entry.eventId]},fibre];
 assert.equal(owner.undispatchedOwnerEvidenceMatches(prefix,call,candidate,inputDigest),false);
 rows=[...validRows,route];assert.equal(owner.undispatchedOwnerEvidenceMatches(prefix,call,candidate,inputDigest),false);
 rows=[...validRows,{kind:'actor_transport_binding_admitted',aggregateId:'binding://actor',payload:{cCallRef}}];
 assert.equal(owner.undispatchedOwnerEvidenceMatches(prefix,call,candidate,inputDigest),false);
 const resumed={...scope,eventId:'event://resume',admissionOrdinal:2,aggregateType:'continuation',aggregateId:'continuation://component',
  kind:'fh_interaction_resume_admitted',payload:{successorCursor:cursor,successorCursorRef:cursor.cursorRef,
   successorCursorDigest:cursor.cursorDigest,successorInputDigest:inputDigest}};
 rows=[resumed,{...opened,causationEventRefs:[resumed.eventId]},fibre];
 assert.equal(admit().kind,'admitted_c_call_evidence');
 rows=[{...resumed,payload:{...resumed.payload,successorInputDigest:hash('wrong')}},rows[1],fibre];
 assert.equal(owner.undispatchedOwnerEvidenceMatches(prefix,call,candidate,inputDigest),false);
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

test('CCall refusal completion keeps full authority across sparse multi-Run scope and cold raw admission',async()=>{
 const prefixes=await import('../../build/code/src/abg/event_prefix.js');
 const {deepFreeze}=await import('../../build/code/src/shared/immutable.js');
 const identity={basisId:'basis://refusal',graphCallId:'graph-call://refusal',frameId:'frame://refusal',
  vectorIndex:0,stageRole:'workflow',taskOrdinal:null,attempt:1,programLocusRef:'locus://refusal',retryPath:[],
  childGraphFunctionRef:'graph-function://child',failureContractRef:'contract://failure'};
 const cCallDigest=hash(identity),cCallRef='c-call:'+cCallDigest;
 const call=deepFreeze({...identity,kind:'c_call',schemaVersion:'5.0.0',callClass:'workflow',cCallDigest,cCallRef,
  runId:'run://selected',graphFunctionRef:'graph-function://parent',regime:'F_D',armId:'arm://workflow',compositionRef:null,
  implementationSetRef:'implementations://refusal',openedEventRef:'event://opened',fibreSelectedEventRef:'event://fibre',
  outputContractRef:'contract://output',refusalContractRef:'contract://refusal',refusalValueKind:'component_refusal',
  evidenceContractRef:'contract://evidence',rejectionContractRef:'contract://rejection',judgmentPredicateRef:'predicate://judgment'});
 const event=(eventId,admissionOrdinal,runId,kind,causationEventRefs=[],payload={})=>deepFreeze({eventId,admissionOrdinal,
  kind,runId,eventTime:'2026-09-26T00:00:00.000Z',aggregateType:'run',aggregateId:runId,parentAggregateId:null,
  causationEventRefs,correlationId:'correlation://refusal',workflowVersion:'5.0.0',scopeClass:'run',
  basisId:call.basisId,graphCallId:call.graphCallId,frameId:call.frameId,payload,payloadDigest:hash(payload)});
 const opened=deepFreeze({...event(call.openedEventRef,3,call.runId,'c_call_opened',['event://selected'],
  {cCallRef,cCallDigest,callClass:call.callClass,cursorRef:'cursor://selected'}),aggregateType:'c_call',
  aggregateId:cCallRef,parentAggregateId:call.frameId});
 const fibre=deepFreeze({...event(call.fibreSelectedEventRef,4,call.runId,'c_call_fibre_selected',[opened.eventId],
  {cCallRef,callClass:call.callClass,regime:call.regime,armId:call.armId,compositionRef:null,
   implementationSetRef:call.implementationSetRef}),aggregateType:'c_call',aggregateId:cCallRef,parentAggregateId:call.frameId});
 const initial=deepFreeze([event('event://selected',1,call.runId,'run_segment_opened'),
  event('event://unrelated',2,'run://other','run_segment_opened'),opened,fibre,
  event('event://other-progress',5,'run://other','run_segment_opened',['event://unrelated'])]);
 const predecessor={component:'durable predecessor custody premise'},successor={component:'durable successor custody premise'};
 let rows=initial,active=false,completionCalls=0;
 const snapshot=()=>deepFreeze([...rows]);
 const currentPrefix=()=>prefixes.selectValidatedRuntimeEventPrefix(snapshot());
 const store={readAll:snapshot,digest:()=>prefixes.runtimeEventPrefixDigest(currentPrefix())};
 // These are explicit physical custody and replay-digest premises. The actual
 // prefix selector, CCall phase/identity checks, refusal evidence/result/J,
 // outcome composition and final receipt association are not substituted.
 const storeOps={isRuntimeEventTransactionActive:()=>active,
  readActiveRuntimeTransactionAtDurablePrefix:(s,p,options)=>{
   assert.strictEqual(s,store);assert.strictEqual(p,predecessor);assert(active);assert.equal(options.durableOnly,true);return snapshot();},
  admitNonEmptyRuntimeEventTransactionAtDurablePrefix:(s,p,action)=>{
   assert.strictEqual(s,store);assert.strictEqual(p,predecessor);const prior=rows;active=true;
   try{return {value:action(),successorPrefix:successor};}catch(error){rows=prior;throw error;}finally{active=false;}},
  admitRuntimeEvent:(s,candidate)=>{assert.strictEqual(s,store);assert(active);
   const row=deepFreeze({...candidate,eventId:'event://appended/'+rows.length,admissionOrdinal:rows.length+1,payloadDigest:hash(candidate.payload)});
   rows=deepFreeze([...rows,row]);return row;}};
 const replayOps={replay:()=>({replayDigest:hash(rows)}),projectActiveRuntimeTransaction:()=>{
  const authorityPrefix=currentPrefix();return {authorityPrefix,
   runtimePrefix:prefixes.selectRuntimeEventPrefixFromAuthority(authorityPrefix,{runId:call.runId}),replayState:{replayDigest:hash(rows)}};}};
 const owner=await sourceOwner('abg/c_call',{'./event_store.js':storeOps,'./replay.js':replayOps,
  './runtime_liveness.js':{captureNativeFrameBoundary:()=>null,observeNativeFrameLiveness:()=>{}}});
 const outcome=await sourceOwner('abg/c_call_outcome',{'./event_store.js':storeOps,'./replay.js':replayOps,
  './c_call.js':{...owner,completeRejectedCCall:(...args)=>{completionCalls++;
   assert.deepEqual(prefixes.runtimeEventsFromValidatedPrefix(args[1]),rows,'handoff conserves the full authority cut');
   return owner.completeRejectedCCall(...args);}}});
 const basis={correlationId:'correlation://refusal',causationEventRefs:[]};
 const full=currentPrefix(),sparse=prefixes.selectRuntimeEventPrefixFromAuthority(full,{runId:call.runId});
 assert.deepEqual(sparse.events.map(e=>e.admissionOrdinal),[1,3,4]);
 assert.throws(()=>prefixes.selectValidatedRuntimeEventPrefix(sparse.events),/gap-free admission-ordinal order/,
  'a sparse subset is still not raw globally admitted history');
 const rejection=owner.admitResult(store,full,{}, {},{},call,{kind:'bad_result'},'success',call.outputContractRef,'result',()=>false,[],basis);
 assert.equal(rejection.kind,'c_call_admission_rejection');assert.equal(rejection.stage,'result');
 const input={store,predecessorPrefix:predecessor,graph:{},graphFunction:{},cursor:{},cCall:call,rejection,basis};
 for(const changes of [{rejection:{...rejection,cCallRef:'c-call:wrong'}},{cCall:{...call,cCallDigest:hash('wrong')}},
  {cCall:{...call,runId:'run://other'}},{rejection:{...rejection,stage:'judgment'}}]){
  assert.throws(()=>outcome.admitCCallRejection({...input,...changes}),/authentic open-call|stage does not match/);
  assert.strictEqual(rows,initial,'failed component transaction conserves the predecessor');
 }
 for(const raw of [initial,deepFreeze(JSON.parse(JSON.stringify(initial)))]){
  rows=raw;
  const result=outcome.admitCCallRejection(input);
  assert.equal(result.disposition,'blocked');assert.strictEqual(result.successorPrefix,successor);
  assert.equal(result.diagnosticRef,rejection.diagnosticRef);assert.equal(result.result.resultClass,'refusal');
  assert.equal(result.result.value.candidateDigest,rejection.candidateDigest);
  assert.equal(result.result.value.diagnosticRef,rejection.diagnosticRef);
  assert.deepEqual(rows.slice(-3).map(e=>e.kind),['c_call_evidenced','c_call_result_admitted','c_call_judged']);
  assert(rows.slice(-3).every(e=>e.runId===call.runId));
  assert.equal(rows.at(-1).payload.judgment,'blocked');
  assert.equal(rows.at(-1).payload.reasonRef,rejection.diagnosticRef);
  assert(!result.runtimePrefix.events.some(e=>e.runId==='run://other'));
  const completed=rows;
  assert.throws(()=>outcome.admitCCallRejection(input),/authentic open-call admission rejection/);
  assert.strictEqual(rows,completed,'duplicate completion is refused without changing prior events');
 }
 assert.equal(completionCalls,8);
 assert.deepEqual(full.events,initial,'earlier authority cut remains immutable');
 assert.throws(()=>prefixes.runtimeEventsFromValidatedPrefix({...full}),/nominal validated/);
 assert.throws(()=>prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(initial.map((e,i)=>i===2?{...e,admissionOrdinal:9}:e))),/gap-free admission-ordinal order/);
});
