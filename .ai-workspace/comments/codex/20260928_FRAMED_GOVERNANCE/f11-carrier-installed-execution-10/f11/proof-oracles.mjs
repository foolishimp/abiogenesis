// Future installed observation checks through exported Product/ABG/validator interfaces only.
import assert from 'node:assert/strict';
const c=(ref,digest)=>({ref,digest});
export async function actualOwnerContext(caller,constructed){
 const {product,abg,state}=caller,call=constructed.call;
 const resources={catalog:call.resources.catalog,catalogView:call.resources.catalogView,applications:call.resources.applications,source:call.resources.source,qualificationResources:call.resources.qualificationResources};
 const owner=await product.ProductRunInvocationPort.prepare({memberKey:'start',invocation:call.invocation,resources,admittedInstalls:state.environment.productInstalls,workspaceBinding:state.environment.workspaceBinding,verifyInstallAdmission:x=>abg.hasAdmittedProductInstall(state.environment.artifactTruth,x),transportResourceAssertion:call.resources.eventResource});
 assert.equal(owner.kind,'prepared_product_run_invocation','actual Product preparation must return the prepared owner kind');
 assert.ok(owner.qualificationResources,'actual owning preparation acquired complete assertions');
 assert.deepEqual(owner.admittedInput,call.invocation.request.input.value);
 return owner;
}
function terminal(caller,value,kind){
 assert.equal(value.disposition,'completed');assert.equal(value.stop,null);
 const t=value.terminalResult;assert(caller.abg.isAbgTypedTerminalResult(t));
 assert.equal(t.valueKind,kind);assert.equal(t.producer.runRef,value.run.ref);
 assert.equal(t.valueDigest,caller.hash(t.value));return t;
}
export function assessmentProof(caller,value,input){
 const t=terminal(caller,value,'qualification_judgment');
 assert(caller.validator.isQualificationJudgment(t.value));
 assert.deepEqual(t.value.task,input.task);assert.deepEqual(t.value.plan,input.plan);
 assert.equal(t.value.source.cCallRef,t.producer.cCallRef);
 const selected={kind:'judgment_selection',selectionRef:'selection://abiogenesis/t287/f11-carrier/assessment',slotRef:input.task.slotRef,task:c(input.task.taskRef,input.task.taskDigest),programRef:t.producer.program.ref,invocationAdmissionRef:t.producer.invocationAdmissionRef,result:t.result};
 const proof={kind:'qualification_proof_resource',schemaVersion:'5.0.0',representation:'resource_refs_v1',resource:input.task.resource,prefix:caller.state.closeHandoff.prefix,declarations:input.task.declarations,selections:[selected]};
 assert(caller.validator.isQualificationProofResource(proof));return {terminal:t,proof,selection:selected};
}
export function parentAssessmentProof(caller,value,input,parentSelection){
 const t=terminal(caller,value,'qualification_judgment');
 assert(caller.validator.isQualificationJudgment(t.value));
 assert.deepEqual(t.value.task,input.task);assert.deepEqual(t.value.plan,input.plan);
 assert.equal(t.producer.program.ref,parentSelection.programRef);
 assert.notEqual(t.value.source.cCallRef,t.producer.cCallRef,'actual child assessor must produce J');
 const events=caller.abg.readRuntimeEventsAtDurablePrefix(caller.state.closeHandoff.prefix);
 const one=rows=>{assert.equal(rows.length,1,'one exact actual child/fold/closure relation required');return rows[0];};
 const child=one(events.filter(e=>e.kind==='c_call_opened'&&e.aggregateId===t.value.source.cCallRef));
 assert.equal(child.payload.callClass,'leaf');
 const fibre=one(events.filter(e=>e.kind==='c_call_fibre_selected'&&e.aggregateId===child.aggregateId));
 assert.equal(fibre.payload.implementationRef,caller.gtl.QUALIFICATION_IDS.assessImplementation);
 assert.equal(child.payload.graphFunctionRef,parentSelection.childGraphFunctionRef);
 const fold=one(events.filter(e=>e.kind==='child_foldback_admitted'&&e.runId===value.run.ref&&
  e.graphCallId===t.producer.graphCallRef&&e.payload.childGraphCallId===child.graphCallId));
 assert.equal(fold.payload.parentCCallRef,t.producer.cCallRef);assert.equal(fold.payload.childDisposition,'closed');
 assert.equal(fold.payload.outputDigest,t.valueDigest);
 const childClose=one(events.filter(e=>e.kind==='graph_call_closed'&&e.runId===value.run.ref&&e.graphCallId===child.graphCallId));
 const parentClose=one(events.filter(e=>e.kind==='graph_call_closed'&&e.runId===value.run.ref&&e.graphCallId===t.producer.graphCallRef));
 const runClose=one(events.filter(e=>e.kind==='run_closed'&&e.runId===value.run.ref));
 assert.ok(childClose.admissionOrdinal<fold.admissionOrdinal&&fold.admissionOrdinal<parentClose.admissionOrdinal&&parentClose.admissionOrdinal<runClose.admissionOrdinal);
 const selected={kind:'judgment_selection',selectionRef:'selection://abiogenesis/t287/q05/parent-child-assessment',
  slotRef:input.task.slotRef,task:c(input.task.taskRef,input.task.taskDigest),programRef:t.producer.program.ref,
  invocationAdmissionRef:t.producer.invocationAdmissionRef,result:t.result};
 const proof={kind:'qualification_proof_resource',schemaVersion:'5.0.0',representation:'resource_refs_v1',
  resource:input.task.resource,prefix:caller.state.closeHandoff.prefix,declarations:input.task.declarations,selections:[selected]};
 assert(caller.validator.isQualificationProofResource(proof));
 return {terminal:t,proof,selection:selected,childFoldback:{status:'actual',childCCallRef:child.aggregateId,
  childGraphCallRef:child.graphCallId,foldbackEventRef:fold.eventId,childCloseEventRef:childClose.eventId,
  parentCloseEventRef:parentClose.eventId,runCloseEventRef:runClose.eventId,semanticQualification:false}};
}
export function admittedAssessmentAgreement(caller,observation,input,ownerContext){
 const projected=caller.abg.projectQualificationJudgment(observation.proof,input.plan,observation.selection,ownerContext.qualificationResources);
 assert.deepEqual(projected,observation.terminal.value,'cold consumer authenticates actual Result, actor artifact, transport and advance J');
 assert.equal(caller.abg.projectQualificationJudgment(observation.proof,input.plan,observation.selection),null,'warm success cannot substitute missing explicit resource');
 assert.equal(caller.abg.projectQualificationJudgment(observation.proof,input.plan,{...observation.selection,result:{...observation.selection.result,digest:caller.hash('crossed-result')}} ,ownerContext.qualificationResources),null);
 return {admittedAssessment:true,warmMissingResourceRefused:true,crossedResultRefused:true,semanticQualification:false};
}
export function compactF11Observation(caller,value,input){
 const t=terminal(caller,value,'self_conformance_result');
 assert(caller.validator.isSelfConformanceResult(t.value));
 assert.equal(t.value.inputDigest,caller.hash(input));assert.deepEqual(t.value.scope,input.scope);
 assert.equal(t.value.ruleApplications.length,input.applications.length);
 assert.notEqual(t.value.disposition,'passed');assert.equal(t.value.qualificationVerdict,false);
 const selected={kind:'self_conformance_selection',selectionRef:'selection://abiogenesis/t287/f11-carrier/self-conformance',slotRef:'node://abiogenesis/qualification/self-conformance@5',programRef:t.producer.program.ref,invocationAdmissionRef:t.producer.invocationAdmissionRef,result:t.result};
 return {terminal:t,selection:selected,semanticQualification:false};
}
export function actualVerdictInput(caller,packet,selfObservation,ownerContext){
 const proof={kind:'qualification_proof_resource',schemaVersion:'5.0.0',representation:'resource_refs_v1',resource:packet.assessmentInput.task.resource,prefix:caller.state.closeHandoff.prefix,declarations:packet.assertion.manifests[0].declarationSelections,selections:[selfObservation.selection]};
 const summary=caller.abg.projectQualificationSelfConformance(proof,selfObservation.selection,packet.selfConformanceBase.basis,ownerContext.qualificationResources);
 assert.ok(summary,'whole native F11 has an authenticated owning Result');assert.notEqual(summary.disposition,'green');
 return {kind:'qualification_verdict_input',schemaVersion:'5.0.0',slotRef:'node://abiogenesis/qualification/exact-candidate@5',basis:packet.selfConformanceBase.basis,coverage:packet.coverageCatalog,selectionRef:selfObservation.selection.selectionRef,selfConformance:summary,proof};
}
export function nonGreenAF22(caller,value,input){
 const t=terminal(caller,value,'exact_candidate_qualification');
 assert(caller.validator.isQualificationVerdict(t.value));
 assert.notEqual(t.value.disposition,'green');
 assert.deepEqual(t.value.subjectBasis,{ref:input.basis.basisRef,digest:input.basis.basisDigest});
 assert.deepEqual(t.value.selfConformance,input.selfConformance);
 return {soleAF22:t.producer.cCallRef,disposition:t.value.disposition,releaseAuthorization:false};
}
export function freshReadAgreement(caller,value,reads){
 const a=reads.run_result.ownerOutput.value,b=reads.run_replay.ownerOutput.value;
 assert.deepEqual(a.source,value.run);assert.deepEqual(b.source,value.run);
 assert.deepEqual(a.projection.terminalResult,value.terminalResult);
 assert.deepEqual(b.projection.terminalResult,value.terminalResult);
 assert.deepEqual(b.projection.replay,value.replay);
 assert.equal(b.projection.status,'closed');
 return {run:value.run,terminalEqual:true,replayEqual:true};
}
