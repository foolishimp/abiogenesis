import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {registerHooks} from 'node:module';
// Same test-only export technique as multi-candidate-admission-owner.mjs:
// no copied predicate, no dependency mocking, no public production test port.
const ownerUrl=new URL('../../build/code/src/abg/construction_continuation.js',import.meta.url).href;
const hook=registerHooks({load(url,context,next){const loaded=next(url,context);return url===ownerUrl?{...loaded,format:'module',source:loaded.source+'\nexport { constructionContinuationOperationCandidate };\n'}:loaded;}});
const owner=await import(ownerUrl);
const events=await import('../../build/code/src/abg/event_store.js');
const prefixes=await import('../../build/code/src/abg/event_prefix.js');
const truth=await import('../../build/code/src/abg/invocation_execution_truth.js');
const product=await import('../../build/code/src/product/index.js');
const gtl=await import('../../build/code/src/gtl/index.js');
hook.deregister();
const {declarations}=await import('../fixtures/exact-intent-product/index.mjs');
const fixture=JSON.parse(readFileSync(new URL('../fixtures/continuation-causation.json',import.meta.url),'utf8'));
const candidate=({eventId,admissionOrdinal,payloadDigest,eventContractDigest,...value})=>value;
const evidenceRoot=process.env.ABI5_CAUSATION_EVIDENCE_ROOT;
const save=(name,value)=>{if(evidenceRoot){mkdirSync(evidenceRoot,{recursive:true});writeFileSync(join(evidenceRoot,name),JSON.stringify(value,null,2)+'\n');}};

test('shared continuation constructor admits workspace causes and authenticates pending Run payload after cold reopen',()=>{
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
  const use=owner.selectPendingActionUse(prefix,request);assert.equal(use.kind,'selected_action_use',JSON.stringify(use));
  const historical=fixture.currentIntentOperation,p=historical.payload;
  const currentBasis={eventTime:historical.eventTime,correlationId:historical.correlationId,causationEventRefs:[],definitionDigest:p.definitionDigest,invocationRef:p.invocationRef,invocationPayloadDigest:p.invocationPayloadDigest,invocationDigest:p.invocationDigest};
  const retainedCurrent=owner.constructionContinuationOperationCandidate(invocation,p.capabilityGrant,currentBasis,{operationId:p.operationId,memberKey:p.memberKey,variant:p.variant,continuationKind:p.continuationKind,continuationRef:p.continuationRef,continuationDigest:p.continuationDigest,currentIntentRef:p.currentIntentRef,currentIntentDigest:p.currentIntentDigest});
  assert.deepEqual(retainedCurrent,{...candidate(historical),causationEventRefs:[invocation.admissionEventRef]},'current-intent candidate unchanged except newly admitted fixture workspace cause');
  const currentOperation=events.admitRuntimeEvent(store,retainedCurrent);
  assert.equal(owner.continuationOperationWorkspaceCorresponds(currentOperation,invocation),true);
  const program=declarations(gtl).programs[0],policy=product.constructRootInvocationPolicy(fixture.workspaceBinding,program,[],['F_D','F_P']);
  assert.equal(policy.policyDigest,invocation.policyDigest);
  const packet=product.RUN_OPERATION_CONTRACTS.continue.selected_action;
  const grant=product.constructCapabilityGrant(policy,invocation.actorRef,'abg.operation.run.continue',packet.metadata.capabilityRefs[0],{admittedInstalls:fixture.capabilityOwners,workspaceBinding:fixture.workspaceBinding,fixedPacket:packet});
  const selectedBasis={...currentBasis,invocationRef:'invocation://causation-fixture/selected',invocationDigest:product.sha256Canonical('selected-fixture-operation')};
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
  assert.equal(owner.selectPendingActionUse(prefix,request).code,'resolved_continuation');
  const handoff=store.projectReopenAuthorityAndClose();store=null;
  const cold=events.reopenEventStore(handoff.reopenAuthority);assert.equal(cold.kind,'reopened_event_store_context');store=cold.store;
  const coldRows=store.readAll(),coldPrefix=prefixes.selectValidatedRuntimeEventPrefix(coldRows);
  const coldInvocation=truth.projectExactInvocationAdmissionAtPrefix(coldPrefix,invocation.invocationAdmissionRef);
  assert.ok(owner.projectSelectedActionOperation(coldPrefix,coldRows.find(e=>e.eventId===selectedOperation.eventId)));
  assert.equal(owner.continuationOperationWorkspaceCorresponds(coldRows.find(e=>e.eventId===currentOperation.eventId),coldInvocation),true);
  save('boundary-result.json',{status:'passed',wallMs:performance.now()-started,source:fixture.source,proofClass:fixture.proofClass,events:store.readAll().length,
   currentIntentCandidateIdentical:true,lawfulWorkspaceOperation:true,illegalRunCauseRefused:true,pendingPayloadColdCorrespondence:true,crossedPayloadRefused:true,consumedOnce:true,
   installedOrHoGQualification:false,currentOperation,selectedOperation,pending:current,closeHandoff:handoff});
 }catch(error){save('boundary-failure.json',{message:error.message,stack:error.stack,events:store?.readAll()??[]});throw error;}
 finally{store?.closeDurableLog();rmSync(scratch,{recursive:true,force:true});}
});
