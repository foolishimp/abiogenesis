import assert from 'node:assert/strict';
import * as productBase from '../../build/code/src/product/index.js';
import * as command from '../../build/code/src/product/worksite_command_execution.js';
import * as effect from '../../build/code/src/product/worksite_effect.js';
import {constructC2ComponentTask} from '../fixtures/c2-component/input.mjs';
export const product={...productBase,...command,...effect};
export const hash=product.sha256Canonical;
let component;
// Supplied component premises only; no journal, native admission or physical proof.
export function componentTask(){return component??=constructC2ComponentTask(product);}
const identity=(prefix,digest)=>`${prefix}/${digest.slice(7)}`;
// Exact mechanical observation constructor over one C2 task.
// All actor/command coordinates below are synthetic.
// No actor, helper, command, event store or native admission is invoked.
export function observationFor(task,exitStatus=1) {
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

