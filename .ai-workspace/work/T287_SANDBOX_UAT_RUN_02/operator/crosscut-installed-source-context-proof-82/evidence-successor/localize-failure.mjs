import assert from 'node:assert/strict';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const phase=dirname(fileURLToPath(import.meta.url)),evidence=join(phase,'execution-authority-root');
const setup=JSON.parse(await readFile(join(evidence,'setup.json'),'utf8'));
const handoff=JSON.parse(await readFile(join(evidence,'handoff.json'),'utf8'));
const product=await import(pathToFileURL(join(setup.installedRoot,'build/code/src/product/index.js')));
const abg=await import(pathToFileURL(join(setup.installedRoot,'build/code/src/abg/index.js')));
const events=abg.readRuntimeEventsAtDurablePrefix(handoff.prefix,{requireCurrent:true});
const coord=e=>({ordinal:e.admissionOrdinal,eventId:e.eventId,kind:e.kind,runId:e.runId,graphFunctionRef:e.graphFunctionRef,cCallRef:e.aggregateId});
const failures=events.filter(e=>e.kind==='runtime_failure_observed'||e.kind==='actor_invocation_failed'||e.kind==='c_call_result_admitted'&&e.payload.resultClass!=='success');
const result={eventCount:events.length,prefix:handoff.prefix,firstFailure:failures[0]===undefined?null:{...coord(failures[0]),payload:failures[0].payload},failures:failures.map(e=>({...coord(e),payload:e.payload})),
  actors:events.filter(e=>['actor_process_started','actor_process_exited','actor_process_termination_unconfirmed','actor_invocation_failed'].includes(e.kind)).map(e=>({...coord(e),payload:e.payload})),
  taskResults:events.filter(e=>e.kind==='c_call_result_admitted'&&['framed_synthesis_task','native_workspace_work_task','worksite_command_execution_task'].includes(e.payload.value?.kind)).map(e=>({...coord(e),resultRef:e.payload.resultRef,resultDigest:e.payload.resultDigest,valueKind:e.payload.value.kind,taskDigest:e.payload.value.taskDigest,maxPromptBytes:e.payload.value.maxPromptBytes})),
  stderr:events.filter(e=>e.kind==='actor_process_stderr_observed').map(e=>({...coord(e),payload:e.payload}))};
const parents=events.filter(e=>e.kind==='c_call_result_admitted'&&product.isGovernanceWorkState(e.payload.value));
const parent=parents.at(-1);assert.ok(parent);
result.parent={...coord(parent),resultRef:parent.payload.resultRef,resultDigest:parent.payload.resultDigest,observations:parent.payload.value.observations.map(o=>({purpose:o.purpose,resultRef:o.resultRef,resultDigest:o.resultDigest,cCallRef:o.cCallRef,actorInvocationRef:o.actorInvocationRef})),terminal:parent.payload.value.terminal,unresolvedSupportRefs:parent.payload.value.unresolvedSupportRefs};
result.c2=[];
for(const e of events.filter(e=>e.kind==='c_call_result_admitted'&&product.isObservedWorksiteCommandExecutionObservation(e.payload.value))){
  const v=e.payload.value,p=join(v.provenance.helperPlan.sandboxRoot,'evidence/literal.txt'),bytes=await readFile(p);
  result.c2.push({...coord(e),resultRef:e.payload.resultRef,resultDigest:e.payload.resultDigest,producer:v.provenance.actorInvocationRef,helperPlan:v.provenance.helperPlan,
    commandResults:v.commandResults.map(r=>({commandId:r.commandId,exitStatus:r.exitStatus,timedOut:r.timedOut,terminationConfirmed:r.terminationConfirmed,stdoutBytes:r.stdout.byteLength,stdoutDigest:r.stdout.digest})),
    actualEvidenceFile:{path:p,digest:product.sha256Bytes(bytes),byteCount:bytes.length},allowedWriteTerritories:v.task.allowedWriteTerritories,worksiteDelta:v.worksiteDelta});
}
result.selectedNoEvidence=events.filter(e=>e.kind==='c_call_fibre_selected').slice(-5).map(e=>({...coord(e),payload:e.payload}));
await writeFile(join(phase,'failure-localization.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({eventCount:result.eventCount,firstFailure:result.firstFailure,parent:result.parent,c2Count:result.c2.length,actors:result.actors.map(r=>({ordinal:r.ordinal,kind:r.kind,payload:r.payload}))},null,2));
