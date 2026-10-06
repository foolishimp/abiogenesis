// Exact finite original semantic/cold assertions; installed immutable fixture injected, no effects at import.
import assert from 'node:assert/strict';
export function originalConsumers(f){
function assertNativeDomain({rows,run,identity,prepared,oracle,correctionAvailable}){
 assert.deepEqual(identity.run,run,'existing Run identity projector binds the supplied Run');
 const local=rows.filter(row=>row.runId===run.ref),intents=local.filter(row=>row.kind==='construction_intent_selected'),deltas=local.filter(row=>row.kind==='construction_delta_observed');
 assert.deepEqual(intents.map(row=>row.payload.constructionIntent.selectedActionRef),[f.ref('action','observe'),...(correctionAvailable?[f.ref('action','correct')]:[])]);
 const invocation=rows.find(row=>row.kind==='invocation_admitted'&&row.payload.publicRequestInvocationRef===prepared.call.invocation.invocationRef);assert.ok(invocation,'actual submitted Public invocation admission');
 assert.equal(invocation.payload.authorityDigest,prepared.workAuthority.authorityDigest);assert.equal(invocation.payload.policyDigest,prepared.capabilityBasis.policy.policyDigest);
 // Root B is workspace-scoped; the existing Run identity projector owns I/B/Run.
 const bases=rows.filter(row=>row.kind==='basis_admitted'&&row.payload.basisClass==='root'&&row.payload.basisRef===identity.executionBasis.ref);assert.equal(bases.length,1);const basis=bases[0];assert.equal(basis.scopeClass,'workspace');assert.equal(basis.basisId,identity.executionBasis.ref);assert.equal(basis.payload.basisDigest,identity.executionBasis.digest);assert.equal(basis.payload.invocationAdmissionRef,invocation.payload.invocationAdmissionRef);assert.equal(basis.payload.programDigest,f.hash(prepared.resolution.program));assert.equal(basis.payload.rawInputDigest,f.hash(prepared.call.invocation.request.input.value));assert.deepEqual(basis.payload.rawInputValue,prepared.call.invocation.request.input.value);
 const joins=intents.map((event,index)=>{
  // The event envelope retains joins; the nested intent owns its declared work.
  const envelope=event.payload,intent=envelope.constructionIntent;assert.equal(intent.kind,'construction_intent');
  const {constructionIntentRef,constructionIntentDigest,...intentBody}=intent;assert.equal(constructionIntentDigest,f.hash(intentBody));assert.equal(constructionIntentRef,`construction-intent://abiogenesis/${constructionIntentDigest.slice(7)}`);
  for(const field of ['constructionIntentRef','constructionIntentDigest','targetCursorRef','targetCursorDigest','actionCatalogRef','actionCatalogDigest','actionCatalogRowDigest','nextActionBasisRef','nextActionBasisDigest','nextActionProjectionRef','nextActionProjectionDigest'])assert.equal(envelope[field],intent[field],`intent envelope ${field}`);
  assert.equal(event.basisId,basis.payload.basisRef);assert.equal(intent.executionBasisRef,identity.executionBasis.ref);assert.equal(intent.executionBasisDigest,identity.executionBasis.digest);assert.equal(intent.runId,run.ref);assert.equal(intent.invocationAdmissionRef,invocation.payload.invocationAdmissionRef);assert.equal(intent.programDigest,basis.payload.programDigest);assert.equal(intent.targetInputDigest,f.hash(intent.targetInput));assert.deepEqual(intent.targetInput,envelope.nextActionBasis.targetInput);assert.equal(envelope.nextActionProjection.selectedActionRef,intent.selectedActionRef);
  const delta=deltas.find(row=>row.payload.constructionIntentRef===intent.constructionIntentRef);assert.ok(delta);assert.equal(delta.payload.constructionIntentDigest,intent.constructionIntentDigest);
  const evaluation=delta.payload.actionEvaluation,childResult=local.find(row=>row.kind==='c_call_result_admitted'&&row.payload.resultRef===evaluation.admittedEvidenceRefs[0]);assert.ok(childResult);
  const workflow=local.find(row=>row.kind==='c_call_opened'&&row.payload.cursorRef===intent.targetCursorRef);assert.equal(workflow?.payload.callClass,'workflow');
  const childBasis=local.find(row=>row.kind==='basis_admitted'&&row.payload.basisClass==='child'&&row.payload.parentCCallRef===workflow.payload.cCallRef);assert.ok(childBasis);assert.equal(childBasis.payload.parentExecutionBasisRef,basis.payload.basisRef);assert.equal(childBasis.payload.invocationAdmissionRef,invocation.payload.invocationAdmissionRef);assert.deepEqual(childBasis.payload.rawInputValue,intent.targetInput);assert.equal(childBasis.payload.rawInputDigest,f.hash(intent.targetInput));
  const childCalls=local.filter(row=>row.kind==='c_call_opened'&&row.basisId===childBasis.payload.basisRef);assert.deepEqual(childCalls.map(row=>row.payload.programLocusRef),[f.ref('locus','producer'),f.ref('locus','consumer')]);assert.equal(childCalls[1].payload.cCallRef,childResult.payload.cCallRef);assert.equal(childResult.basisId,childBasis.payload.basisRef);
  const producerResult=local.find(row=>row.kind==='c_call_result_admitted'&&row.payload.cCallRef===childCalls[0].payload.cCallRef);assert.ok(producerResult);assert.deepEqual(producerResult.payload.value.task,intent.targetInput);assert.deepEqual(producerResult.payload.value.result,childResult.payload.value);
  const evaluationBasis=local.find(row=>row.kind==='c_call_result_admitted'&&row.payload.value?.basisRef===evaluation.actionEvaluationBasisRef);assert.ok(evaluationBasis);assert.equal(evaluationBasis.payload.value.basisDigest,evaluation.actionEvaluationBasisDigest);assert.deepEqual(evaluationBasis.payload.value.constructionIntent,{...intent,admissionEventRef:event.eventId});assert.deepEqual(evaluationBasis.payload.value.admittedEvidence[0].responseValue,childResult.payload.value);assert.equal(evaluationBasis.payload.value.admittedEvidence[0].responseRef,childResult.payload.resultRef);
  const evaluationResult=local.find(row=>row.kind==='c_call_result_admitted'&&row.payload.resultRef===delta.payload.sourceResultRef);assert.ok(evaluationResult);assert.deepEqual(evaluationResult.payload.value,evaluation);assert.equal(delta.payload.actionEvaluationDigest,evaluation.actionEvaluationDigest);assert.deepEqual(delta.payload.edgeClosureDecision,evaluation.edgeClosureDecision);assert.deepEqual(delta.payload.edgeFulfillmentLedger,evaluation.edgeFulfillmentLedger);
  assert.deepEqual(childResult.payload.value.domain.unaffected,oracle.initialDomain.unaffected);assert.deepEqual(intent.targetInput.domain.unaffected,oracle.initialDomain.unaffected);
  const expectedValue=index===0?3:10;assert.equal(childResult.payload.value.domain.target.value,expectedValue);assert.equal(childResult.payload.value.observedGap.actual,expectedValue);assert.equal(childResult.payload.value.observedGap.desired,10);
  assert.deepEqual(evaluation.edgeFulfillmentLedger.rows.map(row=>row.obligationRef),[index===0?oracle.observationObligationRef:oracle.targetObligationRef]);assert.equal(evaluation.edgeClosureDecision.disposition,index===0?'continue_candidate':'close_candidate');
  if(index===0){assert.equal(childResult.payload.value.correctionDisposition,'repair');assert.equal(evaluation.edgeClosureDecision.correctionDisposition,'repair');const archive=evaluation.runtimeArchiveInspection.runtimeEvidenceEventRefs.map(ref=>rows.find(row=>row.eventId===ref));assert.equal(archive.length,5);assert.deepEqual(archive.map(row=>row?.kind),['construction_intent_selected','c_call_result_admitted','c_call_judged','terminal_reached','graph_call_closed']);assert.equal(archive[0].eventId,event.eventId);assert.equal(archive[1].eventId,childResult.eventId);}
  return {intent:event,workflow,childBasis,childCalls,producerResult,childResult,evaluationBasis,evaluationResult,delta};
 });
 const reentry=local.filter(row=>row.kind==='traversal_route_admitted'&&row.payload.routeKind==='re_enter');assert.equal(reentry.length,1);
 const refresh=local.find(row=>row.kind==='c_call_result_admitted'&&row.payload.value?.kind==='graph_span_selection'&&row.payload.value.disposition==='re_enter');assert.ok(refresh);assert.equal(refresh.payload.value.targetInput.priorEvaluation.constructionIntentRef,intents[0].payload.constructionIntentRef);assert.deepEqual(refresh.payload.value.targetInput.domain,oracle.initialDomain);assert.equal(refresh.payload.value.targetInput.observedGap.disposition,'unmet');
 const rootCalls=local.filter(row=>row.kind==='c_call_opened'&&row.basisId===basis.payload.basisRef),loci=rootCalls.filter(row=>row.payload.callClass!=='workflow').map(row=>row.payload.programLocusRef);
 assert.deepEqual(loci,['model','gap','next','evaluate','refreshModel','model','gap','next',...(correctionAvailable?['evaluate','refreshModel','refreshGap','finish']:[])].map(name=>f.ref('locus',name)));
 if(correctionAvailable){
  const completed=local.find(row=>row.kind==='run_closed');assert.ok(completed);const parent=rows.find(row=>row.eventId===completed.payload.graphCallClosedEventRef);assert.equal(parent?.kind,'graph_call_closed');assert.equal(parent.graphCallId,intents[0].graphCallId);
  const refreshed=local.find(row=>row.kind==='c_call_result_admitted'&&row.payload.value?.kind==='graph_span_selection'&&row.payload.value.disposition==='continue');assert.ok(refreshed);assert.deepEqual(refreshed.payload.value.state.observationSnapshot.domain,joins[1].childResult.payload.value.domain);assert.equal(refreshed.payload.value.state.evaluation.constructionIntentRef,intents[1].payload.constructionIntentRef);
  const lastGap=local.find(row=>row.kind==='c_call_result_admitted'&&row.payload.value?.runtimeFrontier?.phase==='post_evidence');assert.ok(lastGap);assert.equal(lastGap.payload.value.gapProjection.actual,10);assert.deepEqual(lastGap.payload.value.observationSnapshot.domain.unaffected,oracle.initialDomain.unaffected);
  return {status:'passed',invocation,basis,joins,reentry,refresh,refreshed,lastGap,completed,parent};
 }
 const stopped=local.find(row=>row.kind==='run_stopped'),gapRoute=local.find(row=>row.kind==='traversal_route_admitted'&&row.payload.routeKind==='gap_stop');assert.ok(stopped);assert.ok(gapRoute);assert.equal(local.some(row=>row.kind==='run_closed'),false);
 const stop=local.find(row=>row.kind==='c_call_result_admitted'&&row.payload.value?.disposition==='no_action');assert.ok(stop);assert.equal(stop.payload.value.noActionDisposition,'gap_stop');assert.deepEqual(stop.payload.value.targetObligationRefs,[oracle.targetObligationRef]);assert.deepEqual(stop.payload.value.targetObligationBindings,[{kind:'target_obligation_binding',disposition:'unbound',obligationRef:oracle.targetObligationRef,eligibleActionRefs:[]}]);assert.deepEqual(stop.payload.value.priorityProjection.orderedActionRefs,[]);assert.deepEqual(stop.payload.value.missingAssetRefs,[f.ref('asset','correction-capability')]);
 const gap=local.find(row=>row.kind==='c_call_result_admitted'&&row.payload.value?.basisRef===stop.payload.value.nextActionBasisRef);assert.ok(gap);assert.equal(gap.payload.value.gapProjection.actual,3);assert.equal(gap.payload.value.gapProjection.handoff,oracle.negative.expectedHandoff);assert.deepEqual(gap.payload.value.observationSnapshot.domain,oracle.initialDomain);
 return {status:'passed',invocation,basis,joins,reentry,refresh,stopped,gapRoute,stop,gap};
}

// The ordinary caller renders only a supported result. Native events and the
// independent oracle are used below to check it, never to supply missing data.
function renderPublicGapHandoff(output){
 assert.equal(output.outcomeKind,'result');assert.equal(output.value.caseKey,'run_gaps');
 const projection=output.value.projection;assert.equal(projection.kind,'run_gap_projection');
 return projection.frontiers.map(frontier=>{
  const explanation=frontier.basis.value.gapProjection.handoff;
  assert.equal(typeof explanation,'string');assert.ok(explanation.length>0);
  const obligations=frontier.nextAction.value.targetObligationRefs;
  assert.ok(Array.isArray(obligations)&&obligations.length>0);
  return `Run ${frontier.run.ref}: ${explanation}\nUnfulfilled obligation: ${obligations.join(', ')}\nAdmitted gap: ${frontier.nextAction.value.projectionRef}\n`;
 }).join('\n');
}

function assertPublicGapDomain({output,identity,boundary,semantic,oracle,correctionAvailable,product}){
 assert.equal(output.outcomeKind,'result');assert.equal(output.value.caseKey,'run_gaps');
 assert.deepEqual(output.value.source,identity.run);assert.equal(output.value.projectionBasis.digest,boundary.prefix.coordinateDigest);
 const projection=output.value.projection;assert.deepEqual(projection.subject,identity.run);
 const handoff=renderPublicGapHandoff(output);
 if(correctionAvailable){assert.deepEqual(projection.gaps,[]);assert.deepEqual(projection.frontiers,[]);assert.equal(handoff,'');}
 else{
  assert.equal(projection.frontiers.length,1);const frontier=projection.frontiers[0];
  assert.deepEqual(frontier.run,identity.run);assert.deepEqual(frontier.executionBasis,identity.executionBasis);
  assert.deepEqual(projection.gaps,[frontier.route]);assert.equal(frontier.basis.value.gapProjection.actual,3);assert.equal(frontier.basis.value.gapProjection.desired,10);
  assert.deepEqual(frontier.nextAction.value.targetObligationRefs,[oracle.targetObligationRef]);
  assert.deepEqual(frontier.nextAction.value.missingAssetRefs,[f.ref('asset','correction-capability')]);
  assert.equal(frontier.basis.value.gapProjection.handoff,oracle.negative.expectedHandoff);assert.ok(handoff.includes(oracle.negative.expectedHandoff));
  assert.deepEqual(frontier.basis.value,semantic.gap.payload.value);
  assert.equal(frontier.basis.valueDigest,product.sha256Canonical(frontier.basis.value));assert.ok(frontier.basis.inputEvidence.length>0);
  for(const [carrier,event] of [[frontier.nextAction,semantic.stop]]){
   assert.equal(carrier.resultAdmissionEventRef,event.eventId);assert.deepEqual(carrier.value,event.payload.value);
   assert.equal(carrier.valueDigest,product.sha256Canonical(carrier.value));assert.equal(carrier.result.ref,event.payload.resultRef);
  }
  assert.equal(frontier.routeAdmissionEventRef,semantic.gapRoute.eventId);assert.equal(frontier.stop.ref,semantic.stopped.eventId);
 }
 return {projection,handoff};
}

function assertColdDomain({cold,identity,boundary,semantic,rows,oracle,correctionAvailable,product}){
 const replayProjection=cold.run_replay.value.projection,status=cold.run_status.value.projection;assert.deepEqual(replayProjection.subject,identity.run);assert.equal(replayProjection.status,correctionAvailable?'closed':'gap_stopped');assert.equal(status.status,replayProjection.status);assert.deepEqual(status.executionBasis,identity.executionBasis);assert.deepEqual(status.replay,replayProjection.replay);assert.equal(cold.run_replay.value.projectionBasis.digest,boundary.prefix.coordinateDigest);
 if(correctionAvailable){const result=cold.run_result.value.projection;assert.deepEqual(result.terminalResult,replayProjection.terminalResult);assert.equal(result.terminalResult.value.disposition,'converged');assert.equal(result.terminalResult.value.targetOutcomeRef,oracle.targetOutcomeRef);assert.equal(result.terminalResult.value.edgeClosureDecisionRef,semantic.joins[1].delta.payload.edgeClosureDecisionRef);assert.equal(result.terminalResult.valueDigest,product.sha256Canonical(result.terminalResult.value));assert.deepEqual(result.terminalResult.producer.executionBasis,identity.executionBasis);assert.equal(result.terminalResult.producer.invocationAdmissionRef,semantic.invocation.payload.invocationAdmissionRef);assert.deepEqual(rows.find(row=>row.eventId===result.terminalResult.producer.resultAdmissionEventRef).payload.value,result.terminalResult.value);}
 else{assert.equal(cold.run_result.outcomeKind,'refusal');assert.equal(cold.run_result.value.code,'not_ready');assert.equal(replayProjection.terminalResult,null);assert.ok(status.activeFluents.length>0);}
 const gap=assertPublicGapDomain({output:cold.run_gaps,identity,boundary,semantic,oracle,correctionAvailable,product});
 return {status:'passed',replay:replayProjection,statusProjection:status,gapProjection:gap.projection,handoff:gap.handoff};
}


return Object.freeze({assertNativeDomain,renderPublicGapHandoff,assertPublicGapDomain,assertColdDomain});
}
