import assert from 'node:assert/strict';
import test from 'node:test';
import {writeFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {registerHooks} from 'node:module';
import {evidenceInput} from '../support/evidence-root.mjs';
// Test-only export of the owner's own function:
// no copied predicate, no dependency mocking, no public production test port.
const ownerUrl=new URL('../../build/code/src/abg/construction_continuation.js',import.meta.url).href;
const hook=registerHooks({load(url,context,next){const loaded=next(url,context);return url===ownerUrl?{...loaded,format:'module',source:loaded.source+'\nexport { constructionContinuationOperationCandidate };\n'}:loaded;}});
// Match the supported installed fixture's Product-entry initialization order.
const product=await import('../../build/code/src/product/index.js');
const owner=await import(ownerUrl);
const events=await import('../../build/code/src/abg/event_store.js');
const prefixes=await import('../../build/code/src/abg/event_prefix.js');
const truth=await import('../../build/code/src/abg/invocation_execution_truth.js');
hook.deregister();
// The controlled predecessor premises are read from the two S7 exact-intent
// records under ABI5_EVIDENCE_ROOT by path, sha256 and bytes (TD-19): the
// eight route rows and the current-intent operation (ordinal 122) of the final
// events, and the admitted Program, WorkspaceBinding and continue-capability
// owner of the attempt-07 continue call's catalog readiness basis.
const S7='comments/codex/20260928_FRAMED_GOVERNANCE/s7-pending-consumer-01/exact-intent-02/';
const eventsInput=evidenceInput({path:S7+'final-events.json',sha256:'4e96fd895487a6b9e581467e6cad6ad60415a15dd411e9fbc68e39eb18e8a6a8',bytes:5070328});
const callInput=evidenceInput({path:S7+'attempt-07/continue-call.json',sha256:'5c83dcf7daded0f8af1cc53ad7e070faa6b83d2d26f9604090b206c56b3ebf4c',bytes:22500824});
const skip=(eventsInput.kind==='absent'&&eventsInput.reason)||(callInput.kind==='absent'&&callInput.reason);
const ROUTE_ORDINALS=[4,5,7,8,9,10,64,66],CURRENT_INTENT_ORDINAL=122;
function premises(){
  const events=JSON.parse(eventsInput.bytes.toString('utf8')),readiness=JSON.parse(callInput.bytes.toString('utf8')).resources.catalog.readinessBasis;
  const atOrdinal=ordinal=>{const rows=events.filter(row=>row.admissionOrdinal===ordinal);assert.equal(rows.length,1,`one retained row at ordinal ${ordinal}`);return rows[0];};
  const continues=install=>install.publicContracts.filter(contract=>contract.contractId==='abg.operation.run.continue');
  const installs=readiness.installedProducts.filter(install=>continues(install).length>0);assert.equal(installs.length,1,'one install owns the continue capability');
  const install=installs[0],continueContracts=continues(install);
  assert.equal(continueContracts.length,1);
  const programs=readiness.publications[0].programs.filter(program=>program.programRef==='program://exact-intent/root@5');assert.equal(programs.length,1);
  return {rows:ROUTE_ORDINALS.map(atOrdinal),currentIntentOperation:atOrdinal(CURRENT_INTENT_ORDINAL),workspaceBinding:readiness.workspaceBinding,program:programs[0],
    capabilityOwners:[{productId:install.productId,productContentDigest:install.productContentDigest,catalogId:install.catalogId,catalogDigest:install.catalogDigest,
      capabilityDefinitionGraph:install.capabilityDefinitionGraph,publicContracts:continueContracts}]};
}
// Validate the complete selected route relation before any physical admission.
function selectedRoute(fixture){
  const selectionRows=fixture.rows.filter(row=>row.kind==='construction_intent_selected');
  assert.equal(selectionRows.length,1);
  const selection=selectionRows[0],routeRows=fixture.rows.filter(row=>row.kind==='traversal_route_admitted'&&selection.causationEventRefs.includes(row.eventId));
  assert.equal(routeRows.length,1,'pending selection requires its actual causal route');
  for(const field of ['runId','frameId','graphCallId','basisId'])assert.equal(routeRows[0][field],selection[field]);
  for(const field of ['routeRef','targetCursorRef','targetCursorDigest'])assert.equal(routeRows[0].payload[field],selection.payload[field]);
}
const candidate=({eventId,admissionOrdinal,payloadDigest,eventContractDigest,...value})=>value;
const evidenceRoot=process.env.ABI5_CAUSATION_EVIDENCE_ROOT;
const save=(name,value)=>{if(evidenceRoot){mkdirSync(evidenceRoot,{recursive:true});writeFileSync(join(evidenceRoot,name),JSON.stringify(value,null,2)+'\n');}};

test('shared continuation constructor admits workspace causes and authenticates pending Run payload after cold reopen',{skip},()=>{
 const fixture=premises();selectedRoute(fixture);
 const scratch=mkdtempSync(join(tmpdir(),'abg-causation-')),started=performance.now();
 let store;try{
  const acquired=events.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(scratch,'events.jsonl')});
  store=acquired.store;const mapped=new Map();
  // Controlled predecessor premises; physical records and event identities are
  // freshly admitted here. This does not reproduce the old installed traversal.
  for(const row of fixture.rows){const value=candidate(row);value.causationEventRefs=row.causationEventRefs.flatMap(ref=>mapped.has(ref)?[mapped.get(ref)]:[]);
   const admitted=events.admitRuntimeEvent(store,value);mapped.set(row.eventId,admitted.eventId);}
  let prefix=prefixes.selectValidatedRuntimeEventPrefix(store.readAll());
  const run=store.readAll().find(e=>e.kind==='run_segment_opened');
  const invocation=truth.projectExactInvocationAdmissionAtPrefix(prefix,run.payload.invocationAdmissionRef);assert.ok(invocation);
  const pending=owner.projectSelectedActionContinuations(prefix,run.runId);assert.equal(pending.length,1);assert.equal(pending[0].status,'open');
  const current=pending[0],request={run:{ref:run.runId,digest:run.payload.runDigest},continuation:{ref:current.continuationRef,digest:current.continuationDigest},selectedAction:{ref:current.selectedActionRef,digest:current.selectedActionDigest},basisRelation:{kind:'same_basis'}};
  const use=owner.selectPendingActionUse(prefix,request,{ref:current.executionBasisRef,digest:current.executionBasisDigest});assert.equal(use.kind,'selected_action_use',JSON.stringify(use));
  const historical=fixture.currentIntentOperation,p=historical.payload;
  const currentBasis={eventTime:historical.eventTime,correlationId:historical.correlationId,causationEventRefs:[],definitionDigest:p.definitionDigest,invocationRef:p.invocationRef,invocationPayloadDigest:p.invocationPayloadDigest,invocationDigest:p.invocationDigest};
  const retainedCurrent=owner.constructionContinuationOperationCandidate(invocation,p.capabilityGrant,currentBasis,{operationId:p.operationId,memberKey:p.memberKey,variant:p.variant,continuationKind:p.continuationKind,continuationRef:p.continuationRef,continuationDigest:p.continuationDigest,currentIntentRef:p.currentIntentRef,currentIntentDigest:p.currentIntentDigest});
  assert.deepEqual(retainedCurrent,{...candidate(historical),causationEventRefs:[invocation.admissionEventRef]},'current-intent candidate unchanged except newly admitted fixture workspace cause');
  const currentOperation=events.admitRuntimeEvent(store,retainedCurrent);
  assert.equal(owner.continuationOperationWorkspaceCorresponds(currentOperation,invocation),true);
  const program=fixture.program;
  assert.equal(program.programRef,invocation.programRef);
  assert.equal(product.sha256Canonical(program),invocation.programDigest,'use the actual retained immutable Program');
  const policy=product.constructRootInvocationPolicy(fixture.workspaceBinding,program,[],['F_D','F_P']);
  assert.equal(policy.policyDigest,invocation.policyDigest);
  const packet=product.RUN_OPERATION_CONTRACTS.continue.selected_action;
  const grant=product.constructCapabilityGrant(policy,invocation.actorRef,'abg.operation.run.continue',packet.metadata.capabilityRefs[0],{admittedInstalls:fixture.capabilityOwners,workspaceBinding:fixture.workspaceBinding,fixedPacket:packet});
  assert.equal(grant.definitionKey.memberKey,'selected_action');
  const selectedBasis={...currentBasis,definitionDigest:grant.definitionDigest,invocationRef:'invocation://causation-fixture/selected',invocationDigest:product.sha256Canonical('selected-fixture-operation')};
  const selectedCandidate=owner.constructionContinuationOperationCandidate(invocation,grant,selectedBasis,{
   operationId:'abg.operation.run.continue',memberKey:'selected_action',variant:'selected_action',continuationKind:'selected_action',
   continuationRef:current.continuationRef,continuationDigest:current.continuationDigest,currentContinuationRef:current.continuationRef,currentContinuationDigest:current.continuationDigest,
   sourceRunId:current.runId,sourceRunDigest:request.run.digest,currentRunId:current.runId,selectedActionRef:current.selectedActionRef,selectedActionDigest:current.selectedActionDigest,
   currentIntentRef:current.constructionIntentRef,currentIntentDigest:current.constructionIntentDigest,executionBasisRef:current.executionBasisRef,executionBasisDigest:current.executionBasisDigest,basisRelation:request.basisRelation});
  assert.deepEqual(selectedCandidate.causationEventRefs,[invocation.admissionEventRef]);
  const before=store.readAll().length;
  assert.throws(()=>events.admitRuntimeEvent(store,{...selectedCandidate,causationEventRefs:[...selectedCandidate.causationEventRefs,current.openedEventRef]}),/causation cannot cross a run scope/);
  assert.equal(store.readAll().length,before,'illegal predecessor cause makes no append');
  const selectedOperation=events.admitRuntimeEvent(store,selectedCandidate);
  prefix=prefixes.selectValidatedRuntimeEventPrefix(store.readAll());
  assert.ok(owner.projectSelectedActionOperation(prefix,selectedOperation),'actual changed cold correspondence accepts lawful envelope and pending payload');
  assert.equal(owner.projectSelectedActionOperation(prefix,{...selectedOperation,payload:{...selectedOperation.payload,currentContinuationDigest:product.sha256Canonical('crossed')}}),null);
  assert.equal(owner.projectSelectedActionOperation(prefix,{...selectedOperation,payload:{...selectedOperation.payload,sourceRunId:'run://unknown'}}),null);
  assert.equal(owner.projectSelectedActionOperation(prefix,{...selectedOperation,causationEventRefs:[]}),null,'workspace source remains required');
  assert.equal(owner.projectSelectedActionContinuations(prefix,run.runId)[0].status,'consumed');
  assert.equal(owner.selectPendingActionUse(prefix,request,{ref:current.executionBasisRef,digest:current.executionBasisDigest}).code,'resolved_continuation');
  const handoff=store.projectReopenAuthorityAndClose();store=null;
  const cold=events.reopenEventStore(handoff.reopenAuthority);assert.equal(cold.kind,'reopened_event_store_context');store=cold.store;
  const coldRows=store.readAll(),coldPrefix=prefixes.selectValidatedRuntimeEventPrefix(coldRows);
  const coldInvocation=truth.projectExactInvocationAdmissionAtPrefix(coldPrefix,invocation.invocationAdmissionRef);
  assert.ok(owner.projectSelectedActionOperation(coldPrefix,coldRows.find(e=>e.eventId===selectedOperation.eventId)));
  assert.equal(owner.continuationOperationWorkspaceCorresponds(coldRows.find(e=>e.eventId===currentOperation.eventId),coldInvocation),true);
  save('boundary-result.json',{status:'passed',wallMs:performance.now()-started,source:{finalEvents:S7+'final-events.json',continueCall:S7+'attempt-07/continue-call.json',ordinals:[...ROUTE_ORDINALS,CURRENT_INTENT_ORDINAL]},
   proofClass:'Controlled immutable predecessor carriers; newly admitted event-owner boundary test only; no edited history is native execution.',events:store.readAll().length,
   currentIntentCandidateIdentical:true,lawfulWorkspaceOperation:true,illegalRunCauseRefused:true,pendingPayloadColdCorrespondence:true,crossedPayloadRefused:true,consumedOnce:true,
   installedOrHoGQualification:false,currentOperation,selectedOperation,pending:current,closeHandoff:handoff});
 }catch(error){save('boundary-failure.json',{message:error.message,stack:error.stack,events:store?.readAll()??[]});throw error;}
 finally{store?.closeDurableLog();rmSync(scratch,{recursive:true,force:true});}
});
