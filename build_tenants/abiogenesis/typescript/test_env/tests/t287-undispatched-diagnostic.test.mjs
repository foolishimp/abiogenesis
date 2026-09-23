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

test('retained diagnostics preserve the actual CCall owner no-dispatch and exact-output gates',async()=>{
 const receipt=await port.invokeLeafOwnerBoundary({...base,loadImplementation:async()=>()=>{throw new TypeError('assembly refused');}});
 const o=receipt.ownerObservation,failure=receipt.candidate.resultCandidate;
 const call={...o,callClass:'leaf',regime:'F_P',openedEventRef:'event://opened',fibreSelectedEventRef:'event://selected',failureContractRef:resolution.failureContractRef};
 const candidate={kind:'undispatched_owner_refusal_evidence_candidate',schemaVersion:'5.0.0',implementationRef:o.implementationRef,inputDigest,
  outputDigest:hash(failure),failureContractRef:resolution.failureContractRef,failureValue:failure,ownerObservation:o};
 const rows=[{eventId:call.openedEventRef,kind:'c_call_opened',aggregateId:o.cCallRef,payload:{cursorDigest:hash('cursor')}},
  {eventId:call.fibreSelectedEventRef,kind:'c_call_fibre_selected',payload:{implementationRef:o.implementationRef,regime:'F_P'}},
  {kind:'traversal_cursor_entered',payload:{cursorDigest:hash('cursor'),inputDigest}}];
 const owner=await sourceOwner('abg/c_call',{'./event_contract_profiles.js':profiles,'./event_prefix.js':{runtimeEventsFromValidatedPrefix:()=>rows}});
 assert.equal(owner.undispatchedOwnerEvidenceMatches({},call,candidate,inputDigest),true);
 assert.equal(owner.undispatchedOwnerEvidenceMatches({},call,{...candidate,outputDigest:hash('wrong')},inputDigest),false);
 assert.equal(owner.undispatchedOwnerEvidenceMatches({},call,{...candidate,ownerObservation:{...o,attempt:2}},inputDigest),false);
 rows.push({kind:'actor_transport_binding_admitted',aggregateId:'binding://actor',payload:{cCallRef:o.cCallRef}});
 assert.equal(owner.undispatchedOwnerEvidenceMatches({},call,candidate,inputDigest),false);
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
