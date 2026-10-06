import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const out = fileURLToPath(new URL('.',import.meta.url));
const subj = new URL('../bootstrap-invocation-correction-01/',import.meta.url);
const base='file:///var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abi5-composite22-install-8cgqclin/node_modules/@abiogenesis/typescript-tenant/build/code/src/';
const mods=await Promise.all(['abg/event_store','abg/event_prefix','abg/replay','abg/execution_basis','abg/worksite_revision','product/semantic_job','product/semantic_revision','gtl/semantic_stage_identity','gtl/semantic_revision_identity','product/worksite_command_execution','abg/artifact_truth','abg/environment_admission','abg/invocation_admission','abg/native_worksite_execution','shared/digests'].map(p=>import(base+p+'.js')));
const [store,prefixes,replay,execution,revision,job,product,stageIds,revisionIds,commands,artifact,environment,invocation,native,digests]=mods;
const read=n=>JSON.parse(readFileSync(new URL(n,subj),'utf8'));
const close=read('read-run_evidence-02.json').receipt.resources.eventResource.closeHandoff.prefix;
const suffix=read('closed-suffix.json').rows;
const input=suffix[3].payload.rawInputValue;
const report={scope:'One installed-owner authenticated read, then pure projections of actual closed recorded events. Forensic only; no admission, runtime invocation or fabricated premises.',installedBase:base,close,input,checks:{},leaves:[]};
const start=Date.now();
// The single owner read was consumed by the preceding diagnostic attempt (see acquisition-failure.json).
// This successor inspects retained bytes directly, with the existing pure decoder; no acquisition API.
const logPath=fileURLToPath(close.eventLogRef), stat=statSync(logPath);
if(stat.dev!==close.storeIdentity.device||stat.ino!==close.storeIdentity.inode||stat.size!==close.prefixLength)throw new Error('retained closed file changed');
const retainedBytes=readFileSync(logPath);
if(digests.sha256Bytes(retainedBytes)!==close.prefixDigest)throw new Error('retained close digest mismatch');
const events=store.validateHistoricalEvents(retainedBytes,close.storeIdentity.eventContractDigest);
report.acquisition={eventCount:events.length,elapsedMs:Date.now()-start,physical:store.runtimeEventPhysicalPrefix(events)};
const stop='event://abiogenesis/4a5a68b3022525e6cb33f7d03b04ed51834b0f8f5253488db7482306abdead63';
const stopIndex=events.findIndex(e=>e.eventId===stop);
const historicalEvents=events.slice(0,stopIndex+1);
report.historicalPhysical=store.runtimeEventPhysicalPrefix(historicalEvents);
report.checks.sourcePrefixBytes=report.historicalPhysical.byteLength===input.sourcePrefix.prefixLength&&report.historicalPhysical.digest===input.sourcePrefix.prefixDigest;
const whole=prefixes.selectValidatedRuntimeEventPrefix(events);
const prefix=prefixes.validatedRuntimeEventPrefixThroughEvent(whole,stop);
const currentEvent=suffix[20];
const currentEvents=events.slice(0,events.findIndex(e=>e.eventId===currentEvent.eventId)+1);
const current=prefixes.validatedRuntimeEventPrefixThroughEvent(whole,currentEvent.eventId);
report.currentPhysical=store.runtimeEventPhysicalPrefix(currentEvents);
const hash=digests.sha256Canonical, same=(a,b)=>hash(a)===hash(b);
const run=replay.projectRunIdentityAtPrefix(prefix,input.sourceRun.ref);
const root=run===null?null:execution.rehydrateExecutionBasisAtPrefix(prefix,run.executionBasis.ref);
report.sourceRun=run; report.checks.sourceRunMatch=run!==null&&same(run.run,input.sourceRun);
report.sourceRoot=root===null?null:{basisRef:root.basisRef,invocationAdmissionRef:root.invocationAdmissionRef,rawInputDigest:root.rawInputDigest,rawInputAdmissionRef:root.rawInputAdmissionRef,rawInputKind:root.rawInputValue?.kind,parentExecutionBasisRef:root.parentExecutionBasisRef};
const envelope=v=>product.isSemanticJobRevisionEnvelope(v)?v.current:job.isSemanticJobEnvelope(v)?v:null;
const leafFacts=[];
for(const e of historicalEvents.filter(e=>e.kind==='c_call_result_admitted'&&e.runId===input.sourceRun.ref)){
 const j=historicalEvents.find(j=>j.kind==='c_call_judged'&&j.aggregateId===e.aggregateId);
 const f=historicalEvents.find(f=>f.kind==='c_call_fibre_selected'&&f.aggregateId===e.aggregateId);
 const coord={cCallRef:e.aggregateId,resultRef:e.payload.resultRef,resultDigest:e.payload.resultDigest,resultAdmissionEventRef:e.eventId,judgmentEventRef:j?.eventId};
 const state=j===undefined?null:revision.projectWorksiteRevisionNativeResult(prefix,coord);
 const env=envelope(e.payload.value);
 report.leaves.push({ordinal:e.admissionOrdinal,...coord,implementationRef:f?.payload.implementationRef,rawResultClass:e.payload.resultClass,rawKind:e.payload.value?.kind,rawJudgment:j?.payload.judgment,ownerProjected:state!==null,envelopeValid:env!==null,assets:env?.assets.map(a=>({assetRef:a.assetRef,stageRef:a.stageRef,assessmentDisposition:a.assessment?.disposition,assessmentSource:a.assessment?.source})),basisId:e.basisId});
 if(state!==null)leafFacts.push({state,event:e});
}
const ids=revisionIds.SEMANTIC_REVISION_IDS, sids=stageIds.SEMANTIC_STAGE_IDS;
const causes=leafFacts.filter(({state})=>{
 const env=envelope(state.result.value);
 return [sids.nativeAssessorFoldImplementationRef,ids.assessorImplementationRef].includes(state.cCall.implementationRef)?env!==null&&env.assets.at(-1)?.assessment!=null&&env.assets.at(-1).assessment.disposition!=='satisfied'&&state.judgment.judgment!=='advance':state.cCall.implementationRef===commands.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef&&(state.result.resultClass==='failure'||state.judgment.judgment!=='advance'||commands.isNativeWorksiteCommandExecutionObservation(state.result.value)&&state.result.value.commandResults.some(r=>r.exitStatus!==0||r.timedOut||r.processSignal!==null));
});
report.causeCount=causes.length;
const retained={input,currentFibreEvent:currentEvent,run,sourceRoot:root};
if(causes.length===1){
 const cause=causes[0], rejected=envelope(cause.state.result.value);
 const causeBasis=execution.rehydrateExecutionBasisAtPrefix(prefix,cause.state.cCall.basisId);
 const command=commands.isNativeWorksiteCommandExecutionObservation(cause.state.result.value)?cause.state.result.value.task:causeBasis?.rawInputValue;
 const construction=rejected?.evidence?.constructionResult??(commands.isNativeWorksiteCommandExecutionTask(command)?command.sourceNativeWork:null);
 report.cause={ordinal:cause.event.admissionOrdinal,cCallRef:cause.state.cCall.cCallRef,implementationRef:cause.state.cCall.implementationRef,rejected:rejected!==null,constructionAbsent:construction===null};
 const parents=leafFacts.filter(({state,event})=>{
  const env=envelope(state.result.value);
  if(event.admissionOrdinal>=cause.event.admissionOrdinal||state.result.resultClass!=='success'||state.judgment.judgment!=='advance'||env===null||!env.assets.every(a=>a.assessment?.disposition==='satisfied'))return false;
  const last=env.assets.at(-1);
  const exact=last===undefined?state.cCall.implementationRef===sids.jobIntakeImplementationRef:state.cCall.cCallRef===(last.assessment.source.nativeWork?.adapterCCallRef??last.assessment.source.cCallRef)||state.cCall.implementationRef===ids.projectionImplementationRef;
  return exact&&rejected!==null&&same(env.basis,rejected.basis)&&same(env.assets,rejected.assets.slice(0,-1));
 });
 report.parentCount=parents.length;
 retained.cause=cause;retained.causeBasis=causeBasis;
 if(parents.length===1){
  const parent=parents[0], env=envelope(parent.state.result.value);
  const original=execution.rehydrateExecutionBasisAtPrefix(prefix,env.basis.rootExecutionBasisRef);
  const parentBasis=execution.rehydrateExecutionBasisAtPrefix(prefix,parent.state.cCall.basisId);
  const prepared=read('readback-basis.json');
  report.parent={ordinal:parent.event.admissionOrdinal,cCallRef:parent.state.cCall.cCallRef,implementationRef:parent.state.cCall.implementationRef,assets:env.assets.map(a=>a.assetRef),contextPresent:env.context!==null};
  report.checks.originalExists=original!==null;
  report.checks.originalJobShape=original!==null&&job.isSemanticJobInput(original.rawInputValue);
  report.checks.originalJobEqual=original!==null&&same(original.rawInputValue,env.job);
  report.checks.originalInputRef=original?.rawInputAdmissionRef===env.basis.rootInputRef;
  report.checks.originalInvocation=original?.invocationAdmissionRef===env.basis.invocationAdmissionRef;
  report.checks.lifecycleEqual=same(env.declaration,prepared.publication.semanticJobLifecycle);
  report.lifecycleDigest=hash(env.declaration);
  report.checks.parentSameInvocation=parentBasis?.invocationAdmissionRef===root?.invocationAdmissionRef;
  report.checks.causeSameInvocation=causeBasis?.invocationAdmissionRef===root?.invocationAdmissionRef;
  const currentBasis=execution.rehydrateExecutionBasisAtPrefix(current,suffix[14].event.basisId);
  const oldTruth=artifact.projectArtifactTruth(prefix);
  const oldRows=oldTruth.artifacts.filter(r=>r.operationId==='abg.operation.workspace.bind'&&r.authorityScopeRef===parentBasis.workspaceBindingId&&r.authorityScopeDigest===parentBasis.workspaceBindingDigest);
  const ce=prepared.environment;
  report.checks.currentEnvironmentBinding=ce.workspaceBinding.bindingId===currentBasis.workspaceBindingId&&ce.workspaceBinding.bindingDigest===currentBasis.workspaceBindingDigest;
  const oldRow=oldRows.length===1?oldRows[0]:null;
  const oe=oldRow===null?{kind:'absent'}:{kind:'forensic_recorded_workspace_environment',workspaceAuthorityBasis:oldRow.workspaceAuthorityBasis,workspaceBinding:{...oldRow.artifact,kind:'workspace_binding',admissionEventRef:oldRow.admissionEventRef}};
  report.currentEnvironmentKind=ce.kind; report.oldEnvironmentKind=oe.kind;
  report.checks.authorityEqual=ce.kind==='exact_prefix_workspace_environment'&&oe.kind==='forensic_recorded_workspace_environment'&&same(ce.workspaceAuthorityBasis,oe.workspaceAuthorityBasis);
  report.checks.bindingCover=report.checks.authorityEqual&&revision.projectWorksiteRevisionBindingCover(current,oe.workspaceBinding,ce.workspaceBinding,[parentBasis,causeBasis])!==null;
  const expected=rejected.context;
  report.checks.expectedContextExists=expected!==null;
  report.checks.invalidatedAfterCause=expected===null?null:native.worksiteCommandSourcesInvalidatedAfter(current,cause.event.admissionOrdinal,ce.workspaceAuthorityBasis.canonicalRoot,[],expected.readRoots);
  const inv=invocation.rehydrateInvocationAdmissionAtPrefix(current,currentBasis.invocationAdmissionRef);
  report.currentGrantCount=inv?.capabilityGrants.length;
  report.currentPublicationDigest=hash(prepared.publication);
  retained.parent=parent;retained.parentBasis=parentBasis;retained.currentBasis=currentBasis;retained.expectedContext=expected;retained.publication=prepared.publication;
  retained.currentEnvironment=ce;retained.oldEnvironment=oe;
 }
}
report.elapsedMs=Date.now()-start;
writeFileSync(out+'recorded-relation.json',JSON.stringify(report,null,2)+'\n');
writeFileSync(out+'retained-facts.json',JSON.stringify(retained)+'\n');
console.log(JSON.stringify(report,null,2));
