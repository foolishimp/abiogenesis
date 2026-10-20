// DRAFT flow after independently accepted C05 and Q06 + actual setup + separately bound inputs.
// Each invoke uses the installed declared CLI in a separate process. No retry or provider dispatch.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {requirePublicResult} from './public-outcomes.mjs';
import {assertionForInvokingView,selfConformanceWithActualProof} from './prepare-resources.mjs';
import {actualOwnerContext,parentAssessmentProof,admittedAssessmentAgreement,compactF11Observation,actualVerdictInput,nonGreenAF22,freshReadAgreement} from './proof-oracles.mjs';
export async function runBoundExistingPrograms(c,packet,executionRoot,{parentSelection}){
 assert.ok(parentSelection,'actual selected wrapper Program/GraphFunction required');
 assert.notEqual(parentSelection.programRef,'program://abiogenesis/qualification/assess@5','no root-only assessment fallback');
 assert.equal(parentSelection.childGraphFunctionRef,c.gtl.QUALIFICATION_IDS.assessGraph);
 assert.equal(parentSelection.inputContractRef,c.gtl.QUALIFICATION_IDS.assessmentInput);
 const {gtl,validator,state,hash}=c;
 assert.deepEqual(packet.selfConformanceBase.basis.workspaceBinding,{ref:state.environment.workspaceBinding.bindingId,digest:state.environment.workspaceBinding.bindingDigest});
 const archive=assertionForInvokingView(packet.assertion,state.catalog,state.catalogView,hash);
 const write=(n,x)=>writeFile(join(executionRoot,n),JSON.stringify(x)+'\n',{flag:'wx'});
 // Only prepare the published core view for its exported renderer; never dispatch this root.
 const promptPreparation=await c.prepareStart('program://abiogenesis/qualification/assess@5',gtl.QUALIFICATION_IDS.assessGraph,packet.assessmentInput,'child-prompt-preparation-only',archive);
 const assessment=await c.prepareStart(parentSelection.programRef,parentSelection.graphFunctionRef,packet.assessmentInput,'parent',archive);
 const assessmentOwner=await actualOwnerContext(c,promptPreparation);
 const establishedView=assessmentOwner.qualificationResources.assessment(assessmentOwner.admittedInput,()=>{throw new Error('Product preparation did not already establish the complete assessment view');});
 const request=validator.qualificationWorkerRequest(assessmentOwner.admittedInput,establishedView);
 const promptBytes=Buffer.from(request.prompt,'utf8'),rawBytes=Buffer.from(JSON.stringify(packet.raw)+'\n');
 await write('controlled-response-binding.json',{claim:'mechanical_transport_only',promptUtf8Bytes:promptBytes.length,promptUtf8SHA256:createHash('sha256').update(promptBytes).digest('hex'),rawResponseSHA256:createHash('sha256').update(rawBytes).digest('hex')});
 await writeFile(join(executionRoot,'controlled-raw-response.json'),rawBytes,{flag:'wx'});
 await write('assessment-owner-request-pin.json',{requestDigest:hash(request),promptDigest:hash(request.prompt),promptUtf8Bytes:promptBytes.length,inputDigest:hash(packet.assessmentInput)});
 const started=await c.invoke('parent',assessment.call,'assessment');
 if(started.disposition.kind!=='result'){await write('selected-flow-stop.json',{boundary:'wrapper_parent',disposition:started.disposition.kind,exitCode:started.receipt?.exitCode??2,qualification:false,noFallback:true});return {status:'stopped',disposition:started.disposition.kind};}
 const value=requirePublicResult(started);
 const reads=await c.freshReads('assess',started);freshReadAgreement(c,value,reads);
 const observation=parentAssessmentProof(c,value,packet.assessmentInput,parentSelection);
 await write('actual-assessment-proof.json',observation);
 const f11Input=selfConformanceWithActualProof(packet,observation.proof);
 const self=await c.prepareStart(gtl.SELF_CONFORMANCE_IDS.programRef,gtl.SELF_CONFORMANCE_IDS.graphFunctionRef,f11Input,'f11',archive);
 const selfOwner=await actualOwnerContext(c,self);
 const projectionChecks=admittedAssessmentAgreement(c,observation,packet.assessmentInput,selfOwner);
 await write('assessment-consumption-checks.json',projectionChecks);
 // Fresh installed CLI is the actual cold semantic consumer, not this warm observation check.
 const selfStarted=await c.invoke('f11',self.call,'selfConformance');
 if(selfStarted.disposition.kind!=='result'){await write('selected-flow-stop.json',{boundary:'F11',disposition:selfStarted.disposition.kind,qualification:false,noFallback:true});return {status:'stopped',disposition:selfStarted.disposition.kind};}
 const selfValue=requirePublicResult(selfStarted);
 const selfReads=await c.freshReads('f11',selfStarted);freshReadAgreement(c,selfValue,selfReads);
 const selfObservation=compactF11Observation(c,selfValue,f11Input);
 const verdictInput=actualVerdictInput(c,packet,selfObservation,selfOwner);
 const verdict=await c.prepareStart('program://abiogenesis/qualification/exact-candidate@5',gtl.QUALIFICATION_IDS.verdictGraph,verdictInput,'af22',archive);
 const verdictOwner=await actualOwnerContext(c,verdict);
 assert.ok(verdictOwner.qualificationResources);
 const verdictStarted=await c.invoke('af22',verdict.call,'verdict');
 if(verdictStarted.disposition.kind!=='result'){await write('selected-flow-stop.json',{boundary:'AF22',disposition:verdictStarted.disposition.kind,qualification:false,noFallback:true});return {status:'stopped',disposition:verdictStarted.disposition.kind};}
 const verdictValue=requirePublicResult(verdictStarted);
 const verdictReads=await c.freshReads('af22',verdictStarted);freshReadAgreement(c,verdictValue,verdictReads);
 const final=nonGreenAF22(c,verdictValue,verdictInput);
 await write('existing-program-flow-result.json',{mechanicalPath:'completed',assessmentRun:value.run,selfConformanceRun:selfValue.run,verdictRun:verdictValue.run,controlledExchanges:1,realProviderCalls:0,freshCLIReads:6,projectionChecks,final,childGraphFoldback:observation.childFoldback,fullQualification:false});
 return {observation,selfObservation,final,closeHandoff:state.closeHandoff};
}
