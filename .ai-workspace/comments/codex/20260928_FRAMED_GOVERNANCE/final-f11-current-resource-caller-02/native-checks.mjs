import assert from 'node:assert/strict';
const keys=x=>Object.keys(x).sort();
export async function checkAssessmentStart(c,prepared,input){
 const {product,abg,state,verified,hash,validator}=c,{call,resolution}=prepared;
 const q=c.gtl.QUALIFICATION_IDS;
 const member=verified.definitionContractCoordinates.operations.find(x=>x.operationId===call.invocation.definitionKey.operationId).members.find(x=>x.memberKey==='start');
 assert.deepEqual(call.invocation.requestContract,member.slots.request);
 assert.equal(product.isRunInvocationResourceAssertion(call.resources),true);
 assert.deepEqual(keys(call.resources),['applicationResources','applications','catalog','catalogView','eventResource','kind','schemaVersion','source']);
 assert.deepEqual(call.resources.applications,[]);assert.deepEqual(call.resources.applicationResources,[]);
 assert.deepEqual(call.resources.source,{kind:'none'});assert.deepEqual(call.resources.eventResource,c.reopen());
 assert.equal(call.invocation.request.program.ref,'program://abiogenesis/qualification/assess@5');
 assert.deepEqual(call.invocation.request.sourceBasis,{kind:'none'});
 assert.equal(call.invocation.request.rootMode,'direct');assert.equal(call.invocation.request.until,'converged');
 assert.deepEqual(keys(input),['kind','plan','schemaVersion','task']);
 assert.equal(validator.isQualificationAssessmentInput(input),true);
 assert.equal(resolution.resolution.inputContract.contractRef,q.assessmentInput);
 assert.equal(input.plan.ownerActorRef,state.environment.workspaceBinding.authorizedActorRef);
 const slot=input.plan.slots.find(s=>s.slotRef===input.task.slotRef);
 assert.equal(slot.graphFunctionRef,q.assessGraph);
 assert.equal(slot.programLocusRef,'node://abiogenesis/qualification/assess@5');
 const inner={catalog:call.resources.catalog,catalogView:call.resources.catalogView,
 applications:call.resources.applications,source:call.resources.source};
 const owner=await product.ProductRunInvocationPort.prepare({memberKey:'start',invocation:call.invocation,
 resources:inner,admittedInstalls:state.environment.productInstalls,workspaceBinding:state.environment.workspaceBinding,
 verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(state.environment.artifactTruth,i),transportResourceAssertion:call.resources.eventResource});
 assert.equal(owner.kind,'prepared_product_run_invocation',JSON.stringify(owner));
 assert.equal(owner.runEnvironment,null);assert.deepEqual(owner.admittedInput,input);
 assert.equal(call.invocation.request.input.valueDigest,hash(owner.admittedInput));
 assert.equal(resolution.program.policies['abg.run_environment'],undefined);
 return {actualCall:call,actualOwnerKind:owner.kind,actualOwnerInput:owner.admittedInput,
 actualPolicy:owner.policy,actualGrants:owner.grants,actualAuthority:owner.authority,
 exactProgram:owner.resolution.program,runEnvironmentAbsent:true,nativeDispatches:0,
 claim:'Actual current ordinary installed Product preparation; ABG selected CCall/current prefix are not caller inputs'};
}
export function makeJudgmentProof(c,value,input){
 const terminal=value?.terminalResult;
 if(terminal===null||terminal===undefined)return {judgmentProduced:false,actualDisposition:value?.disposition??null,actualStop:value?.stop??null};
 assert.equal(c.abg.isAbgTypedTerminalResult(terminal),true);
 assert.equal(terminal.producer.runRef,value.run.ref);
 assert.equal(terminal.valueDigest,c.hash(terminal.value));
 if(terminal.valueKind!=='qualification_judgment')return {judgmentProduced:false,actualTypedTerminal:terminal,actualDisposition:value.disposition};
 assert.equal(terminal.contract.ref,c.gtl.QUALIFICATION_IDS.judgment);
 const judgment=terminal.value;
 assert.equal(c.validator.isQualificationJudgment(judgment),true);
 assert.deepEqual(judgment.task,input.task);assert.deepEqual(judgment.plan,input.plan);
 assert.equal(judgment.source.cCallRef,terminal.producer.cCallRef);
 const selection={kind:'judgment_selection',selectionRef:'selection://abiogenesis/t287/f11-material02-rule-015B/assessment01',
 slotRef:input.task.slotRef,task:{ref:input.task.taskRef,digest:input.task.taskDigest},
 programRef:terminal.producer.program.ref,invocationAdmissionRef:terminal.producer.invocationAdmissionRef,result:terminal.result};
 const proof={kind:'qualification_proof_resource',schemaVersion:'5.0.0',prefix:c.state.closeHandoff.prefix,
 declarations:input.task.declarations,selections:[selection]};
 assert.equal(c.validator.isQualificationProofResource(proof),true);
 const projected=c.abg.projectQualificationJudgment(proof,input.plan,selection);
 assert.deepEqual(projected,judgment);
 const claimedAuthors=[...new Set(input.task.provenance.chains.map(x=>x.actorIdentityRef))];
 const identityOverlap=claimedAuthors.includes(judgment.source.actorRef);
 return {judgmentProduced:true,terminal,proof,selection,judgment,actualAttributionJudgments:judgment.raw.attributions,
 declaredConstructionActorIdentities:claimedAuthors,declaredIdentityOverlap:identityOverlap,
 nativeConsumptionRemaining:'The retained subordinate proof and actual raw attribution findings enter existing F11/qualification consumption. No new selected consumer CCall or private authority passage is fabricated here.',
 semanticDispositions:judgment.raw.criteria.map(x=>({criterionRef:x.criterionRef,disposition:x.disposition,
 applicability:x.applicability,grouping:x.grouping,residuals:x.residuals})),
 claim:'Genuine native judgment mechanism only; negative/unknown and insufficient attribution remain explicit; no complete F11 or AF22 verdict'};
}
export function checkFreshReads(c,value,reads){
 const rp=reads.run_result.ownerOutput,re=reads.run_replay.ownerOutput;
 const a=rp?.value,b=re?.value;
 if(a?.source!==undefined)assert.deepEqual(a.source,value.run);
 if(b?.source!==undefined)assert.deepEqual(b.source,value.run);
 assert.ok(b?.projection,'fresh replay must expose actual Run projection');
 assert.deepEqual(b.projection.terminalResult,value.terminalResult);
 assert.deepEqual(b.projection.replay,value.replay);
 if(a?.projection!==undefined){assert.deepEqual(a.projection.terminalResult,value.terminalResult);assert.deepEqual(a.projection.result,value.result);}
 if(value.terminalResult!==null&&value.terminalResult!==undefined){assert.equal(rp.outcomeKind,'result');assert.ok(a?.projection);}
 return {source:value.run,actualResultOutcome:rp,actualReplayOutcome:re,
 terminalEqual:true,replayEqual:true,judgmentProduced:value.terminalResult?.valueKind==='qualification_judgment',
 resultMayBeNotFound:value.terminalResult===null,claim:'Fresh ordinary Public readbacks preserve actual success/failure and exact new handoff without event append'};
}
