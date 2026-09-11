import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {load,packageRoot} from './d2-bounded-harness.mjs';
import {historicalDesignHarness} from './d2-historical-design-harness.mjs';

// Pure carrier fixtures only. Synthetic C0 receipts, helper bytes, actor and
// result coordinates below are NOT RuntimeEvents or native admitted history.
// Product guards/constructors are real; no command, helper, actor or store runs.
export async function workflowStepHarness() {
  const h=await historicalDesignHarness();
  const product={...h.product,...await load('build/code/src/product/worksite_command_execution.js'),
    ...await load('build/code/src/product/worksite_revision.js')};
  const {SEMANTIC_STAGE_IDS:D}=await load('build/code/src/gtl/semantic_stage_identity.js');
  const {SEMANTIC_REVISION_IDS:R}=await load('build/code/src/gtl/semantic_revision_identity.js');
  const {ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS:semantics}=await load('build/code/src/product/builtin_semantics.js');
  const hash=product.sha256Canonical,identity=(prefix,digest)=>`${prefix}/${digest.slice(7)}`;
  const current=h.reobserve(h.stage.worksite,'step-unit');
  const cut=h.project(h.original,current),mapping=h.coordinates(cut.value),configuration=h.configuration(cut.value,mapping);
  assert.ok(configuration);
  const entry=product.constructWorksiteRevisionCommandPreparationInput({...configuration,
    revisionBasisRef:cut.value.revisionBasis.basisRef,revisionBasisDigest:cut.value.revisionBasis.basisDigest,
    snapshotTargetRefs:mapping.snapshotTargetRefs,
    dependencyObservations:mapping.snapshotTargetRefs.filter(ref=>!mapping.selectedTargetRefs.includes(ref)).map(designTargetRef=>{
      const old=mapping.historicalWorksite.targets.find(row=>row.target.targetRef===designTargetRef);
      const row=current.targets.find(row=>row.target.subject.relativePath===old.target.subject.relativePath);
      return {designTargetRef,subject:row.target.subject,observation:row.target.predecessorObservation,
        origin:{kind:'admitted_input',basisAdmissionEventRef:'synthetic-unadmitted:basis',inputAdmissionRef:'synthetic-unadmitted:input',inputDigest:hash('synthetic-unadmitted-input')}};
    })});
  const members=entry.constructionTask.targets.map((target,ordinal)=>{
    const row=current.targets.find(row=>row.target.subject.subjectRef===target.subject.subjectRef),bytes=Buffer.from(row.base64,'base64');
    const successorObservation=product.constructWorksiteObservation({subject:target.subject,state:'file',fileIdentity:`synthetic-unadmitted-successor:${ordinal}`,
      fileDigest:product.sha256Bytes(bytes),byteLength:bytes.length});
    const body={authorizationRef:'synthetic-unadmitted:authorization',authorizationDigest:hash('synthetic-unadmitted-authorization'),
      beforeObservationRef:target.predecessorObservation.observationRef,beforeObservationDigest:target.predecessorObservation.observationDigest,
      afterObservationRef:successorObservation.observationRef,afterObservationDigest:successorObservation.observationDigest,
      writtenDigest:successorObservation.fileDigest,committed:true};
    const receiptDigest=hash(body),receipt={kind:'worksite_file_replace_receipt',schemaVersion:'5.0.0',
      receiptRef:identity('worksite-file-replace-receipt://abiogenesis',receiptDigest),receiptDigest,...body};
    assert.ok(product.isWorksiteFileReplaceReceipt(receipt));
    return {ordinal,inputMemberRef:target.targetRef,outputMemberRef:`synthetic-unadmitted:output-${ordinal}`,receipt,successorObservation};
  });
  const constructionBody={sourceApplicationRef:product.WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef,members};
  const resultDigest=hash(constructionBody),construction={kind:'worksite_construction_result',schemaVersion:'5.0.0',
    resultRef:identity('worksite-construction-result://abiogenesis',resultDigest),resultDigest,...constructionBody};
  assert.ok(product.isWorksiteConstructionResult(construction));
  const task=product.prepareWorksiteCommandTask({kind:'worksite_revision_command_preparation_bound_input',schemaVersion:'5.0.0',entry,source:construction});
  assert.ok(product.isWorksiteRevisionCommandExecutionTask(task));
  function observationFor(task,exitStatus=1) {
    const empty={kind:'worksite_observed_stream',schemaVersion:'5.0.0',encoding:'base64',payload:'',byteLength:0,digest:product.sha256Bytes(Buffer.alloc(0))};
    const commandResults=task.commands.map((command,ordinal)=>{
      const reports=command.expectedReports.map((report,reportOrdinal)=>{
        const body={commandOrdinal:ordinal,commandId:command.commandId,expectedReportIdentity:report.reportIdentity,reportOrdinal,
          relativePath:report.relativePath,state:'absent',byteLength:null,digest:null};
        const observationDigest=hash(body),{reportOrdinal:ignored,...fields}=body;
        return {kind:'worksite_report_observation',schemaVersion:'5.0.0',ordinal:reportOrdinal,...fields,
          observationDigest,observationRef:identity('worksite-report-observation://abiogenesis',observationDigest)};
      });
      const body={ordinal,commandId:command.commandId,executable:command.executable,args:command.args,relativeCwd:command.relativeCwd,
        environment:command.environment,timeoutMs:command.timeoutMs,terminationGraceMs:command.terminationGraceMs,
        exitStatus,timedOut:false,processSignal:null,signalSequence:[],terminationConfirmed:true,stdout:empty,stderr:empty,reports,reportCount:0};
      const observationDigest=hash(body);
      return {kind:'worksite_command_result',schemaVersion:'5.0.0',...body,observationDigest,
        observationRef:identity('worksite-command-observation://abiogenesis',observationDigest)};
    });
    const predicateObservations=task.outcomePredicates.map((p,ordinal)=>({kind:'worksite_predicate_observation',schemaVersion:'5.0.0',ordinal,
      predicateId:p.predicateId,predicateKind:p.predicateKind,observedValue:exitStatus,evidence:[],evidenceRefs:[]}));
    const sources=product.worksiteExecutionSources(task),revision=task.kind==='worksite_revision_command_execution_task';
    const snapshotMembers=sources.map((source,ordinal)=>({kind:revision?'worksite_revision_snapshot_member':'worksite_snapshot_member',schemaVersion:'5.0.0',ordinal,
      ...(revision?{designTargetRef:source.designTargetRef,source:source.source}:{sourceMemberRef:source.sourceMemberRef}),
      sourceObservationRef:source.observation.observationRef,sourceObservationDigest:source.observation.observationDigest,
      relativePath:source.subject.relativePath,byteLength:source.observation.byteLength,digest:source.observation.fileDigest}));
    const plan=product.worksiteCommandExecutionHelperPlan(task,'synthetic-unadmitted:attempt'),snapshotDigest=hash(snapshotMembers);
    const artifact=product.constructWorksiteExecutionHelperArtifact({task,disposition:'success',commandResults,predicateObservations,
      worksiteDelta:[],productDelta:[],snapshotRoot:plan.sandboxRoot,
      snapshotRef:identity(product.worksiteExecutionIdentityPrefix(task,'snapshot'),snapshotDigest),snapshotDigest,snapshotMembers,
      protectedBefore:sources.map(row=>row.observation),protectedAfter:sources.map(row=>row.observation)});
    const acknowledgment={kind:'worksite_command_execution_worker_result',schemaVersion:'5.0.0',taskRef:task.taskRef,taskDigest:task.taskDigest,
      attemptRef:plan.attemptRef,helperArtifactRef:artifact.artifactRef,helperArtifactDigest:artifact.artifactDigest};
    const helperToolInvocation={kind:'worker_tool_invocation_evidence',schemaVersion:'5.0.0',ordinal:0,toolUseRef:'synthetic-unadmitted:tool',toolName:'Bash',
      inputDigest:plan.toolInputDigest,inputByteLength:plan.toolInputByteLength};
    const actor={actorInvocationRef:'synthetic-unadmitted:actor',actorRef:task.workerActorRef,workerBindingRef:task.workerBindingRef,
      processRef:'synthetic-unadmitted:process',implementationRef:product.worksiteExecutionImplementationRef(task),inputDigest:hash(task),
      transportLane:'worker_executes',disposition:'success',toolCallCount:1,toolInvocations:[helperToolInvocation],
      transportBindingRef:'synthetic-unadmitted:transport-binding',transportBindingDigest:hash('binding'),transportDigest:hash('transport')};
    const observation=product.constructWorksiteExecutionObservation(task,acknowledgment,actor,artifact,plan);
    assert.ok(product.isWorksiteExecutionObservation(observation),'real Product constructor and guard accept this synthetic closed carrier');
    return {observation,artifact,plan,acknowledgment,actor};
  }
  const example=observationFor(task),observation=example.observation;
  function foldback(observation,envelope=cut.value) {
    const constructionResultDigest=hash('synthetic-unadmitted CCall construction result body'),executionResultDigest=hash('synthetic-unadmitted CCall execution result body');
    return {...envelope,current:{...envelope.current,evidence:{kind:'semantic_worksite_evidence',
      constructionResultRef:identity('result://abiogenesis',constructionResultDigest),constructionResultDigest,
      executionResultRef:identity('result://abiogenesis',executionResultDigest),executionResultDigest,
      constructionResult:observation.task.sourceConstructionResult,executionObservation:observation,
      artifacts:observation.snapshotMembers.map(member=>({subjectRef:task.snapshotSources[member.ordinal].subject.subjectRef,observationRef:member.sourceObservationRef,
        base64:current.targets.find(row=>row.target.subject.relativePath===member.relativePath).base64,role:'realization'}))}}};
  }
  const step=(input,output)=>semantics.resolveJudgmentRelation(R.stepPredicateRef).evaluate(input,output);
  return {...h,product,D,R,semantics,hash,identity,cut,entry,construction,task,observation,example,observationFor,foldback,step};
}

export function retainedIntentWitness() {
  const path=resolve(packageRoot,'../../installed-continuation-04/installed-frame-01/events-01/runtime.events.jsonl');
  const bytes=readFileSync(path),rows=bytes.toString('utf8').trim().split('\n').map(JSON.parse);
  assert.equal(rows.length,73);
  return {path,bytes,input:rows.find(row=>row.admissionOrdinal===25).payload.rawInputValue,
    output:rows.find(row=>row.admissionOrdinal===70).payload.value,
    result:rows.find(row=>row.admissionOrdinal===70),
    call:rows.find(row=>row.admissionOrdinal===30),judgment:rows.find(row=>row.admissionOrdinal===71)};
}
