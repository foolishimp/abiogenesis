// FUTURE NATIVE EXECUTION ONLY. Offline preparation never imports this driver.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {here,read,caller,verificationRequest,schemaVersion} from './ordinary-caller.mjs';
import {loadRuntime} from './public-support.mjs';
import {checkAssessmentStart,makeJudgmentProof,checkFreshReads} from './native-checks.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const outputRoot=process.argv[2];
assert.equal(outputRoot,join(here,'../final-f11-native-assessment-execution-02'));
assert.equal(await fs.realpath(outputRoot),outputRoot);
const write=(name,value)=>fs.writeFile(join(outputRoot,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
async function verifyRecord(record){const b=await fs.readFile(record.path);assert.equal(b.length,record.bytes,record.path);assert.equal(sha(b),record.sha256,record.path);return b;}
const activation=await read(join(outputRoot,'native-activation.json'));
assert.equal(activation.kind,'root_native_execution_activation');assert.equal(activation.operation,'T287_F11_NATIVE_ASSESSMENT_02');
assert.equal(activation.ordinaryCalls,5);assert.equal(activation.assessmentDispatches,1);
assert.deepEqual(activation.initialHandoff,(await read(join(here,'consumed-inputs.json'))).currentHandoff);
await verifyRecord(activation.initialHandoff);
assert.equal(activation.providerPrerequisite,'usable_actual_native_provider_access');
assert.equal(typeof activation.providerAccessEvidence,'object');
await verifyRecord(activation.providerAccessEvidence);
await verifyRecord(activation.grant);
const consumed=await read(join(here,'consumed-inputs.json'));
await verifyRecord(consumed.assessmentDeclarations);
const currentResource=(await read(join(here,'initial-handoff.json'))).reopenAuthority.eventLogPath;
assert.equal(await fs.realpath(currentResource),currentResource);
const preparedFreeze=JSON.parse(await verifyRecord(activation.callerFreeze));
for(const r of preparedFreeze.records)await verifyRecord({...r,path:join(here,r.path)});
const bindingPin=await read(join(here,'bound-input-pin.json'));
assert.deepEqual(activation.boundFreeze,bindingPin.freeze);
const boundFreeze=JSON.parse(await verifyRecord(bindingPin.freeze));
for(const r of boundFreeze.records)await verifyRecord({...r,path:join(bindingPin.root,r.path)});
const input=JSON.parse(await verifyRecord(bindingPin.assessmentInput));
const requestExpected=JSON.parse(await verifyRecord(bindingPin.workerRequest));
const budgets=await read(join(here,'budgets.json'));
assert.deepEqual(activation.budgets,budgets);
assert.equal(activation.executionOutputRoot,outputRoot);
assert.equal(activation.nodeOldSpaceMiB,budgets.nodeOldSpaceMiB);
assert.ok(process.execArgv.includes('--max-old-space-size='+budgets.nodeOldSpaceMiB));
const runtimeEnvironment=await read(join(here,'runtime-environment.json'));
for(const [k,v]of Object.entries(runtimeEnvironment))process.env[k]=v;
const began=performance.now(),window={deadline:began+budgets.totalCeilingMs};
let c=null,phase='nominal-verification',start=null,startValue=null,proofObservation=null;
const reached=[];const mark=x=>reached.push(x);
await write('driver-start.json',{pid:process.pid,startedAt:new Date().toISOString(),activation,budgets});
try{
 const identity=await read(join(here,'selected-core.json')),prospect=await read(join(here,'prospective-cases.json'));
 const r=await loadRuntime(identity.installedRoot),{product,abg,validator,gtl}=r;
 const verifyRequest=verificationRequest(prospect.core);
 const verification=await product.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request:verifyRequest});
 await write('bootstrap-core.json',verification);assert.equal(verification.kind,'product_verification_success');
 assert.strictEqual(product.selectOwnedProductVerification(verifyRequest,verification.verifiedArtifact),verification.verifiedArtifact);
 c=await caller('f11',verification,window,outputRoot);const {state,hash}=c;
 const initial=await read(join(here,'initial-handoff.json')),closedEnvironment=await read(join(here,'closed-current-environment.json'));
 state.closeHandoff=initial;state.binding={ref:closedEnvironment.workspaceBinding.bindingId,digest:closedEnvironment.workspaceBinding.bindingDigest};
 state.resolvedLock=closedEnvironment.resolvedProductLock;state.catalog=await read(join(here,'retained-catalog.json'));
 state.catalogView=product.narrowGraphFunctionCatalog(state.catalog,[gtl.QUALIFICATION_IDS.assessGraph]);
 assert.deepEqual(state.catalogView,await read(join(here,'assessment-view.json')));
 const current=c.refresh();
 for(const k of ['workspaceAuthorityBasis','workspaceBindingCandidate','workspaceBinding','productInstalls','resolvedProductLock','productSet'])assert.deepEqual(current[k],closedEnvironment[k],k);
 assert.deepEqual(current.artifactTruth.rows,closedEnvironment.artifactTruth.rows);
 assert.equal(c.op.actorRef,current.workspaceBinding.authorizedActorRef);
 const physical=await c.physical('initial');
 assert.equal(physical.device,initial.prefix.storeIdentity.device);assert.equal(physical.inode,initial.prefix.storeIdentity.inode);
 assert.equal(physical.bytes,initial.prefix.prefixLength);assert.equal('sha256:'+physical.sha256,initial.prefix.prefixDigest);
 assert.deepEqual(current.prefix,initial.prefix);mark('exact genuine136 prefix/A-W/install/lock/productSet/root actor verified current');
 assert.equal(validator.isQualificationAssessmentInput(input),true);
 assert.deepEqual(input.task.declarations,await read(join(here,'../final-f11-native-assessment-01/assessment-declarations.json')));
 const workerRequest=validator.qualificationWorkerRequest(input);assert.deepEqual(workerRequest,requestExpected);
 assert.equal(workerRequest.instructionContractRef,c.gtl.QUALIFICATION_IDS.assessmentInput);
 assert.equal(workerRequest.resultContractRef,c.gtl.QUALIFICATION_IDS.assessmentRaw);
 assert.equal(Buffer.byteLength(workerRequest.prompt,'utf8'),budgets.actualPromptUtf8Bytes);
 assert.equal(workerRequest.transportLane,'closed_prompt_proof');
 await write('actual-worker-request.json',workerRequest);mark('closed bound input/plan/full unchanged-owner prompt matched');
 phase='assessment-view';
 const catalogCoordinate={ref:'graph-function-catalog://abiogenesis/'+state.catalog.basisDigest.slice(7),digest:state.catalog.basisDigest};
 const viewCall=await c.authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
 {catalog:catalogCoordinate,allowlist:state.catalogView.allowlist},{kind:'catalog_view_resource_assertion',schemaVersion,catalog:state.catalog},c.boundSlots());
 await c.invoke('assessment-view',viewCall,'setup');mark('ordinary assessment view operation');
 phase='assessment-conformance';
 const conformance=await c.prepareConformance('program://abiogenesis/qualification/assess@5','conformance-assess',{modulePublications:state.catalog.boundPublications});
 const conformed=await c.invoke('conformance-assess',conformance.call,'setup');
 assert.equal(conformed.receipt.ownerOutput.value.disposition,'passed',JSON.stringify(conformed.receipt.ownerOutput));mark('ordinary exact assessment Program conformance passed');
 phase='actual-owner-preparation';
 const prepared=await c.prepareStart('program://abiogenesis/qualification/assess@5',gtl.QUALIFICATION_IDS.assessGraph,async({grants})=>{
  assert.equal(grants.length,1);await write('actual-direct-grant.json',{grants,rootActorRef:c.op.actorRef,workspaceBinding:state.environment.workspaceBinding});return input;
 },'assess-rule');
 await write('assessment-owner-precondition.json',await checkAssessmentStart(c,prepared,input));mark('actual ordinary owner/input/grant/policy preparation');
 assert.ok(performance.now()-began<=budgets.purePreflightAllowanceMs+2*budgets.stages.setup);
 phase='assessment-start';
 await write('native-start.json',{startedAt:new Date().toISOString(),assessmentDispatches:1,operationPlan:budgets.operationPlan});
 start=await c.invoke('assess-rule',prepared.call,'assessment');
 assert.ok(start.returnedHandoff,'No actual native close handoff: stop, never synthesize a new one');
 assert.equal(start.receipt.ownerOutput?.outcomeKind,'result','No genuine Run outcome available for fresh reads');
 startValue=start.receipt.ownerOutput.value;assert.ok(startValue?.run?.ref&&startValue.run.digest);
 await write('actual-assessment-owner-value.json',startValue);mark('actual native start outcome and lawful returned handoff');
 // Fresh readbacks happen before semantic/attribution assertions. No second dispatch.
 phase='fresh-reads';const reads=await c.freshReads('assess-rule',start);
 const cold=checkFreshReads(c,startValue,reads);await write('cold-results.json',{reads,cold,closeHandoff:state.closeHandoff});
 mark('two fresh supported result/replay reads; prefix unchanged');
 phase='native-proof-observation';
 proofObservation=makeJudgmentProof(c,startValue,input);await write('judgment-proof-observation.json',proofObservation);
 if(proofObservation.proof)await write('qualification-proof-resource.json',proofObservation.proof);
 const finalPhysical=await c.physical('final'),finalBytes=await fs.readFile(initial.reopenAuthority.eventLogPath);
 const originalRecord=await read(join(here,'initial-resource-snapshot.json')),originalBytes=await verifyRecord(originalRecord);
 assert.deepEqual(finalBytes.subarray(0,originalBytes.length),originalBytes);
 assert.equal(finalPhysical.device,physical.device);assert.equal(finalPhysical.inode,physical.inode);
 await fs.writeFile(join(outputRoot,'final-native-prefix.jsonl'),finalBytes,{flag:'wx'});
 await write('final-handoff.json',state.closeHandoff);
 assert.equal(state.calls.length,5);assert.ok(performance.now()<window.deadline);
 await write('native-result.json',{status:proofObservation.judgmentProduced?'native_judgment_observed':'closed_native_failure_observed',
 actualDisposition:startValue.disposition,actualStop:startValue.stop,judgmentProduced:proofObservation.judgmentProduced,
 semanticDispositions:proofObservation.semanticDispositions??[],priorPrefixConserved:true,initialPrefix:initial.prefix,finalPrefix:state.closeHandoff.prefix,
 ordinaryCalls:5,assessmentDispatches:1,freshReads:2,C2Calls:0,HelloCalls:0,elapsedMs:performance.now()-began,reached,
 finalEventBytes:finalPhysical.bytes,eventGrowthBytes:finalPhysical.bytes-originalBytes.length,
 processEvidence:state.calls.map(x=>({label:x.label,receipt:join(outputRoot,'f11-'+x.label+'-native-process.json')})),
 claim:'One bounded selection/assessment/readback discriminator. Failed/indeterminate/insufficient findings remain live; no complete F11, qualification or AF22 verdict.'});
 console.log(JSON.stringify({status:'CLOSED_native_observation',disposition:startValue.disposition,judgmentProduced:proofObservation.judgmentProduced,ordinaryCalls:5}));
}catch(error){
 let finalPhysical=null;
 try{if(c){finalPhysical=await c.physical('failure-final');await fs.writeFile(join(outputRoot,'failure-native-prefix.jsonl'),await fs.readFile((await read(join(here,'resource-plan.json'))).eventLogPath),{flag:'wx'});if(c.state.closeHandoff)await write('final-handoff.json',c.state.closeHandoff);}}
 catch(observationError){await write('failure-observation.json',{message:String(observationError)});}
 await write('failure.json',{phase,message:String(error),stack:error.stack,finalPhysical,closeHandoff:c?.state.closeHandoff??null,
 actualStartOutcome:startValue,proofObservation,calls:c?.state.calls??[],reached,elapsedMs:performance.now()-began});
 console.error(error.stack);process.exitCode=1;
}
