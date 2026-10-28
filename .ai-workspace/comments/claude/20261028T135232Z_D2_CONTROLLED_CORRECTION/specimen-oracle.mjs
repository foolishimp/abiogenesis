// T-287 Phase D, package D2: the specimen oracle. The admitted event log is the
// only source of facts and every reader is a fold over it.
//
// `evaluate` is called in-run by run-specimen.mjs with runScenario's oracle
// arguments (runner.mjs:392-394). Admitted C2 observations are selected exactly
// as independent-oracle.mjs:70-90 selects them; nothing under another producer
// or contract is searched for a measurement.
//
// `node specimen-oracle.mjs claims ...` runs after the run's process and the
// cold-reads process have exited: it reopens the archived prefix cold
// (`readRuntimeEventsAtDurablePrefix(captureDurablePrefixCoordinate(archived))`),
// repeats the selection, folds the held fields (TD-18's trace) and writes
// claims.json, trace.json, archive.json and cost.json.
import { createHash } from 'node:crypto';
import { readFile, readdir, lstat, writeFile } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const H='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/';
const sha=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
const decodeStream=stream=>stream?.encoding==='base64'&&typeof stream.payload==='string'?Buffer.from(stream.payload,'base64').toString('utf8'):'';

export const CHECKER=Object.freeze({commandId:'command://abiogenesis-d2/specimen/checker',args:['fixture/checker.mjs'],relativeCwd:'.',timeoutMs:60000,terminationGraceMs:10000});
export const CANDIDATE='fixture/value.txt',BROKEN='broken\n',FIXED='fixed\n';
// Built the way fixture/checker.mjs builds them.
export const EXPECTED_BAD_STDOUT='FIXTURE_VALUE_BAD expected=fixed actual='+JSON.stringify(BROKEN)+'\n';
export const EXPECTED_FIXED_STDOUT='FIXTURE_VALUE_FIXED\n';
export const ORIGINALS=Object.freeze({'fixture/source.md':'sha256:9a28aa248b2fbab7493ff91456331aeb1a8287de363b65fcd59f2ba0dbd3f328',
  'fixture/checker.mjs':'sha256:5a39eff7d6082835ebc49bc9deeaf4ff1d7e01e55314bfec749cf3d018cced22',
  'fixture/rubric.md':'sha256:d5efa802ff34c2847871df8b2bf81f21b05abfca70c1c4c33281ba977f54ea42'});
export const HISTORICAL=Object.freeze(['attempt-07','continuation-16','continuation-17','fixture-successor-17']);

// independent-oracle.mjs:70-90, the selection kept verbatim; the event is retained beside its value.
export function admittedCommandObservations(events,owner,validateObservation,validateSourceObservation) {
  const observations=new Map();
  if(typeof owner?.graphFunctionRef!=='string'||typeof owner.outputContractRef!=='string'||
    typeof owner.runId!=='string'||owner.resultClass!=='success'||typeof validateObservation!=='function')return [];
  for(const [index,event] of (Array.isArray(events)?events:[]).entries()) {
    const payload=event?.payload,value=payload?.value;
    if(event?.kind!=='c_call_result_admitted'||event.graphFunctionRef!==owner.graphFunctionRef||
      payload?.contractRef!==owner.outputContractRef||payload.resultClass!==owner.resultClass||
      payload.valueKind!=='worksite_command_execution_observation'||payload.cCallRef!==event.aggregateId||
      value?.kind!=='worksite_command_execution_observation'||typeof value.observationRef!=='string'||
      !Array.isArray(value.commandResults)||!Array.isArray(value.task?.commands))continue;
    try {
      if(event.runId!==owner.runId&&(typeof validateSourceObservation!=='function'||validateSourceObservation(event)!==true))continue;
      if(validateObservation(value)===true)observations.set(value.observationRef,{index,event,value});
    }catch{/* Missing or invalid owner support cannot earn credit. */}
  }
  return [...observations.values()];
}

function declaredChecker(request) {
  return request?.testing?.commands?.find(row=>row.commandId===CHECKER.commandId)??null;
}
// The checker command row of one admitted observation, matched against the declaration the lifecycle bound.
function checkerRow(entry,declared) {
  const result=entry.value.commandResults.find(row=>row.commandId===CHECKER.commandId);
  const taskRow=entry.value.task.commands.find(row=>row.commandId===CHECKER.commandId);
  if(!result||!taskRow||!declared)return null;
  const exact=result.kind==='worksite_command_result'&&result.executable===declared.executable&&isDeepStrictEqual(result.args,declared.args)&&
    result.relativeCwd===declared.relativeCwd&&result.timeoutMs===declared.timeoutMs&&result.terminationGraceMs===declared.terminationGraceMs&&
    isDeepStrictEqual(result.args,CHECKER.args)&&result.relativeCwd===CHECKER.relativeCwd&&result.timeoutMs===CHECKER.timeoutMs&&
    result.terminationGraceMs===CHECKER.terminationGraceMs&&taskRow.executable===result.executable&&isDeepStrictEqual(taskRow.args,result.args)&&
    taskRow.relativeCwd===result.relativeCwd&&isDeepStrictEqual(taskRow.environment,result.environment)&&taskRow.timeoutMs===result.timeoutMs&&
    taskRow.terminationGraceMs===result.terminationGraceMs;
  const protectedDigests=Object.fromEntries((entry.value.task.protectedObservations??[]).map(row=>[row.subject?.relativePath,row.observation?.fileDigest??null]));
  return {exact,eventId:entry.event.eventId,eventIndex:entry.index,admissionOrdinal:entry.event.admissionOrdinal,runId:entry.event.runId,
    graphFunctionRef:entry.event.graphFunctionRef,cCallRef:entry.event.aggregateId,resultRef:entry.event.payload.resultRef,resultDigest:entry.event.payload.resultDigest,
    observationRef:entry.value.observationRef,observationDigest:entry.value.observationDigest,
    taskRef:entry.value.task.taskRef,taskDigest:entry.value.task.taskDigest,taskKind:entry.value.task.sourceNativeWork?'native':entry.value.task.sourceObservedInput?'observed':'other',
    sourceNativeWorkObservationRef:entry.value.task.sourceNativeWork?.observationRef??null,
    actorInvocationRef:entry.value.provenance?.actorInvocationRef??null,helperArtifactRef:entry.value.helperArtifactRef,helperArtifactDigest:entry.value.helperArtifactDigest,
    command:{commandId:result.commandId,executable:result.executable,args:result.args,relativeCwd:result.relativeCwd,environment:result.environment,
      timeoutMs:result.timeoutMs,terminationGraceMs:result.terminationGraceMs},
    commandObservationRef:result.observationRef,commandObservationDigest:result.observationDigest,
    exitStatus:result.exitStatus,timedOut:result.timedOut,terminationConfirmed:result.terminationConfirmed,processSignal:result.processSignal,
    stdout:decodeStream(result.stdout),stdoutDigest:result.stdout?.digest??null,stderr:decodeStream(result.stderr),
    predicateObservations:entry.value.predicateObservations,worksiteDelta:entry.value.worksiteDelta,productDelta:entry.value.productDelta,
    protectedDigests};
}

const nativeWorkKind='native_workspace_work_observation';
// One row per native work observation (observationRef), at its first admission (the leaf owner's); the same
// observation re-admitted as the purpose child's result is listed under `admissions`, never counted twice.
// (Correction after the run: the run-time oracle, sha256 fd05e521..., counted admissions, not observations.)
function nativeWorkEntries(events) {
  const rows=[],byRef=new Map();
  for(const [index,event] of events.entries()) {
    const payload=event?.payload,value=payload?.value;
    if(event?.kind!=='c_call_result_admitted'||payload?.resultClass!=='success'||payload.valueKind!==nativeWorkKind||value?.kind!==nativeWorkKind)continue;
    const admission={eventId:event.eventId,admissionOrdinal:event.admissionOrdinal,graphFunctionRef:event.graphFunctionRef,contractRef:payload.contractRef,cCallRef:event.aggregateId,resultRef:payload.resultRef};
    if(byRef.has(value.observationRef)){byRef.get(value.observationRef).admissions.push(admission);continue;}
    const entryDigest=(context,path)=>context?.entries?.find(row=>row.relativePath===path)??null;
    const before=entryDigest(value.before,CANDIDATE),after=entryDigest(value.after,CANDIDATE);
    const others=[...new Set([...(value.before?.entries??[]),...(value.after?.entries??[])].map(row=>row.relativePath))].filter(path=>path!==CANDIDATE)
      .map(path=>{const b=entryDigest(value.before,path),a=entryDigest(value.after,path);
        return {path,before:b?{state:b.state,digest:b.digest??null}:null,after:a?{state:a.state,digest:a.digest??null}:null,unchanged:isDeepStrictEqual(b?.state,a?.state)&&(b?.digest??null)===(a?.digest??null)};});
    rows.push({index,eventId:event.eventId,admissionOrdinal:event.admissionOrdinal,graphFunctionRef:event.graphFunctionRef,contractRef:payload.contractRef,
      cCallRef:event.aggregateId,resultRef:payload.resultRef,resultDigest:payload.resultDigest,observationRef:value.observationRef,observationDigest:value.observationDigest,
      writeRoots:value.task?.writeRoots??null,assessment:value.task?.assessment!==undefined,changedPaths:value.changedPaths,
      candidate:{before:before?{state:before.state,digest:before.digest??null}:null,after:after?{state:after.state,digest:after.digest??null}:null},
      others,report:value.report??null,actorInvocationRef:value.provenance?.actorInvocationRef??null,admissions:[admission]});
    byRef.set(value.observationRef,rows.at(-1));
  }
  return rows;
}

function governanceStates(events) {
  const rows=[];
  for(const [index,event] of events.entries()) {
    const payload=event?.payload,value=payload?.value;
    if(event?.kind!=='c_call_result_admitted'||payload?.resultClass!=='success'||payload.valueKind!=='governance_work_state'||value?.kind!=='governance_work_state')continue;
    rows.push({index,event,value});
  }
  return rows;
}
// Where a governance state carries one C2 measurement: the field paths and their values.
function retention(state,failing) {
  const hits=[];
  (state.observations??[]).forEach((row,k)=>{
    if(row.purpose!=='testing'||row.resultRef!==failing.resultRef)return;
    const results=row.value?.commandResults??[],i=results.findIndex(r=>r.commandId===CHECKER.commandId);
    const r=results[i];
    hits.push({observationIndex:k,resultRefField:`observations[${k}].resultRef`,resultRef:row.resultRef,resultDigest:row.resultDigest,cCallRef:row.cCallRef,
      commandResultField:`observations[${k}].value.commandResults[${i}]`,commandObservationRef:r?.observationRef??null,commandObservationDigest:r?.observationDigest??null,
      exitStatus:r?.exitStatus??null,stdoutText:r?.stdout?.text??decodeStream(r?.stdout),
      equal:row.resultDigest===failing.resultDigest&&row.cCallRef===failing.cCallRef&&r?.observationRef===failing.commandObservationRef&&
        r?.observationDigest===failing.commandObservationDigest&&r?.exitStatus===1&&(r?.stdout?.text??decodeStream(r?.stdout))===EXPECTED_BAD_STDOUT});
  });
  return hits;
}

/** In-run judgment: runScenario's oracle arguments; the five claims' log-borne parts. */
export async function evaluate({worksiteRoot,runArchive,commands=[],events=[],source,request,observationOwner,validateObservation,validateSourceObservation}) {
  const declared=declaredChecker(request);
  const selected=admittedCommandObservations(events,observationOwner,validateObservation,validateSourceObservation);
  const checker=selected.map(entry=>checkerRow(entry,declared)).filter(row=>row!==null);
  const first=checker[0]??null,last=checker.at(-1)??null;
  const brokenDigest=sha(Buffer.from(BROKEN)),fixedDigest=sha(Buffer.from(FIXED));
  const originalsAt=row=>Object.entries(ORIGINALS).every(([path,d])=>row?.protectedDigests?.[path]===d);
  const failingC2={observation:first,
    satisfied:first!==null&&first.exact&&first.exitStatus===1&&first.stdout===EXPECTED_BAD_STDOUT&&first.timedOut===false&&first.terminationConfirmed===true&&
      first.protectedDigests[CANDIDATE]===brokenDigest&&originalsAt(first)};
  const greenC2={observation:last,
    satisfied:last!==null&&last!==first&&last.exact&&last.exitStatus===0&&last.stdout===EXPECTED_FIXED_STDOUT&&last.timedOut===false&&last.terminationConfirmed===true&&
      last.protectedDigests[CANDIDATE]===fixedDigest&&originalsAt(last)&&last.observationDigest!==first?.observationDigest&&
      last.command.commandId===first?.command.commandId&&last.command.executable===first?.command.executable&&isDeepStrictEqual(last.command.args,first?.command.args)&&
      last.command.relativeCwd===first?.command.relativeCwd&&isDeepStrictEqual(last.command.environment,first?.command.environment)&&
      last.command.timeoutMs===first?.command.timeoutMs&&last.command.terminationGraceMs===first?.command.terminationGraceMs};
  const native=nativeWorkEntries(events);
  const between=first&&last?native.filter(row=>row.index>first.eventIndex&&row.index<last.eventIndex):[];
  const writes=between.filter(row=>(row.changedPaths??[]).length>0);
  const firstWrite=first?native.filter(row=>row.index<first.eventIndex&&(row.changedPaths??[]).includes(CANDIDATE)):[];
  const repair={nativeWorkBetween:between,writingUnitsBetween:writes.length,
    priorBrokenWrite:firstWrite.map(row=>({eventId:row.eventId,admissionOrdinal:row.admissionOrdinal,resultRef:row.resultRef,observationRef:row.observationRef,changedPaths:row.changedPaths,candidate:row.candidate,admissions:row.admissions})),
    satisfied:writes.length===1&&isDeepStrictEqual(writes[0].changedPaths,[CANDIDATE])&&writes[0].candidate.before?.digest===brokenDigest&&
      writes[0].candidate.after?.digest===fixedDigest&&writes[0].others.every(row=>row.unchanged)&&isDeepStrictEqual(writes[0].writeRoots,[CANDIDATE])&&
      first?.protectedDigests[CANDIDATE]===brokenDigest&&last?.protectedDigests[CANDIDATE]===fixedDigest&&
      Object.keys(ORIGINALS).every(path=>first?.protectedDigests[path]===last?.protectedDigests[path])};
  const states=governanceStates(events);
  const after=first?states.filter(row=>row.index>first.eventIndex).map(row=>({eventId:row.event.eventId,eventIndex:row.index,admissionOrdinal:row.event.admissionOrdinal,
    graphFunctionRef:row.event.graphFunctionRef,resultRef:row.event.payload.resultRef,terminal:row.value.terminal,hits:retention(row.value,first)})):[];
  const firstRetaining=after.find(row=>row.hits.some(hit=>hit.equal))??null,lastState=after.at(-1)??null;
  const retained={firstRetaining,lastStateAdmitted:lastState,statesAfterFailing:after.length,
    satisfied:firstRetaining!==null&&lastState!==null&&lastState.hits.some(hit=>hit.equal)};
  const disposition=failingC2.satisfied&&repair.satisfied&&greenC2.satisfied&&retained.satisfied?'satisfied':'unsatisfied';
  return {kind:'d2_specimen_judgment',schemaVersion:'1',disposition,specimen:source?.key??null,runArchive,worksiteRoot,
    selection:'independent-oracle.mjs:70-90 over the installed worksite command execution owner (commandObservationOwner of this Run)',
    owner:observationOwner,admittedObservations:selected.length,checkerObservations:checker.map(row=>({eventId:row.eventId,eventIndex:row.eventIndex,
      admissionOrdinal:row.admissionOrdinal,observationRef:row.observationRef,exitStatus:row.exitStatus,stdout:row.stdout,candidateDigest:row.protectedDigests[CANDIDATE]})),
    expected:{brokenDigest,fixedDigest,badStdout:EXPECTED_BAD_STDOUT,fixedStdout:EXPECTED_FIXED_STDOUT},
    claims:{failingC2,repair,greenC2,retention:retained},publicCalls:commands.map(row=>({label:row.label,exitCode:row.exitCode,outcomeKind:row.outcomeKind})),
    limits:'A finite controlled proof; no independent UAT, semantic work, capacity or release claim (fixture/rubric.md).'};
}

// ---- After the run: the cold claims (claims.json, trace.json, archive.json, cost.json) ----
async function fileFacts(path) {
  const bytes=await readFile(path);return {path,sha256:sha(bytes),byteCount:bytes.length};
}
async function walk(root,match,found=[],seen=[]) {
  for(const entry of await readdir(root,{withFileTypes:true})) {
    const path=join(root,entry.name);
    if(entry.name==='.ai-workspace')seen.push(path);
    if(entry.isDirectory())await walk(path,match,found,seen);
    else if(entry.isFile()&&match(entry.name))found.push(path);
  }
  return {found,seen};
}
function resultRow(stdout) {
  const rows=String(stdout??'').split(/\r?\n/u).flatMap(line=>{try{return [JSON.parse(line)];}catch{return [];}});
  const result=rows.filter(row=>row?.type==='result').at(-1)??null,init=rows.find(row=>row?.type==='system'&&row?.subtype==='init')??null;
  return {result,init};
}

export async function claims({archive,coldReadsPath,measurePath,out}) {
  const { installedModules }=await import(H+'public-setup.mjs');
  const { commandObservationOwner, commandObservationSourceUse, eventResourceIdentity }=await import(H+'runner.mjs');
  const json=async path=>JSON.parse(await readFile(join(archive,path),'utf8'));
  const run=await json('run.json'),summary=await json('summary.json'),closeHandoff=await json('final-close-handoff.json'),archivedPrefix=await json('runtime-event-prefix.json');
  const outcome=await json('calls/lifecycle-start.outcome.json'),reads=await json('fresh-readback.json'),conservation=await json('source-conservation.json');
  const held=await json('specimen-judgment.json'),workload=await json('workload-source.json'),setup=await json('setup-identity.json'),acquisition=await json('specimen-acquisition.json');
  const cold=JSON.parse(await readFile(coldReadsPath,'utf8')),measure=measurePath?JSON.parse(await readFile(measurePath,'utf8')):null;
  const runtime=await installedModules(join(archive,'bootstrap/node_modules/@abiogenesis/typescript-tenant')),{abg,product}=runtime,hash=product.sha256Canonical;
  const installedOwner=(await installedModules(setup.installations[0].installedRoot)).product;
  // The cold fold source: the archived coordinate, captured and read from physical bytes.
  const source=abg.captureDurablePrefixCoordinate(archivedPrefix),events=abg.readRuntimeEventsAtDurablePrefix(source);
  const execution={receipt:outcome.receipt},receipt=outcome.receipt,terminal=receipt.ownerOutput.value?.terminalResult??null;
  const observationOwner=commandObservationOwner(installedOwner,execution);
  const validateSourceObservation=commandObservationSourceUse(runtime,source,events,observationOwner);
  const relation=installedOwner.resolveWorksiteCommandExecutionJudgmentRelation(installedOwner.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef);
  // The bound testing block (executable bound by the toolchain), as the in-run call passed it, recovered from the Run's first admitted governance state.
  const boundTesting=(()=>{for(const e of events){const v=e.payload?.value;if(e.kind==='c_call_result_admitted'&&v?.kind==='governance_work_state')return v.original.testing;}return null;})();
  const foldRequest={...workload.request,testing:boundTesting};
  const folded=await evaluate({worksiteRoot:join(archive,'sandbox/worksite'),runArchive:archive,events,source:run.scenario,request:foldRequest,
    observationOwner,validateSourceObservation,validateObservation:relation?observation=>relation.evaluate(observation.task,observation):undefined});
  const byId=new Map(events.map((event,index)=>[event.eventId,{event,index}]));
  const eq=(a,b)=>hash(a??null)===hash(b??null);
  const trace=[];
  // Required rows are the activation's held fields; supplementary rows corroborate and never make a gap.
  const field=(name,heldValue,heldSource,recovered,fold,required=true)=>{trace.push({field:name,required,held:heldValue??null,heldSource,recovered:recovered??null,fold,equal:eq(heldValue,recovered)});};
  // The Run's end, held by the lifecycle-start receipt: a typed terminal result, or its stop.
  const value=receipt.ownerOutput.value??{};
  const rootTerminal=events.filter(e=>e.kind==='terminal_reached'&&e.graphCallId===value.graphCall?.ref);
  if(terminal) {
    const resultEvent=byId.get(terminal.producer.resultAdmissionEventRef),judgmentEvent=byId.get(terminal.producer.judgmentAdmissionEventRef);
    const p=resultEvent?.event.payload;
    field('terminal.result',terminal.result,'lifecycle-start receipt ownerOutput.value.terminalResult',p?{ref:p.resultRef,digest:p.resultDigest}:null,
      'the event whose eventId is producer.resultAdmissionEventRef: payload {resultRef,resultDigest}');
    field('terminal.valueDigest',terminal.valueDigest,'receipt',p?hash(p.value):null,'sha256Canonical of that event payload.value');
    field('terminal.valueDigest(payload)',terminal.valueDigest,'receipt',p?.valueDigest,'that event payload.valueDigest');
    field('terminal.valueKind',terminal.valueKind,'receipt',p?.valueKind,'that event payload.valueKind',false);
    field('terminal.contract.ref',terminal.contract?.ref,'receipt',p?.contractRef,'that event payload.contractRef',false);
    field('terminal.producer.cCallRef',terminal.producer.cCallRef,'receipt',resultEvent?.event.aggregateId,'that event aggregateId');
    field('terminal.producer.runRef',terminal.producer.runRef,'receipt',resultEvent?.event.runId,'that event runId');
    field('terminal.producer.graphCallRef',terminal.producer.graphCallRef,'receipt',resultEvent?.event.graphCallId,'that event graphCallId',false);
    field('terminal.producer.judgmentRef',terminal.producer.judgmentRef,'receipt',judgmentEvent?.event.payload?.judgmentRef,
      'the event whose eventId is producer.judgmentAdmissionEventRef: payload.judgmentRef ('+(judgmentEvent?.event.kind??'absent')+')');
    for(const read of reads)field('fresh '+read.memberKey+' terminal value digest',read.projection?.terminalResult?.valueDigest,'fresh-readback.json',p?hash(p.value):null,'as terminal.valueDigest',false);
  }else {
    field('terminal result (absent)',null,'receipt ownerOutput.value.terminalResult (null)',rootTerminal.length?rootTerminal.map(e=>e.eventId):null,
      'terminal_reached events of the root graph call (receipt graphCall.ref): none');
    for(const read of reads)field('fresh '+read.memberKey+' terminal (absent)',read.projection?.terminalResult??null,'fresh-readback.json',null,'as terminal result (absent)',false);
  }
  const stopEvent=value.stop?byId.get(value.stop.ref)?.event??null:null;
  const stateEvent=stopEvent?events.find(e=>e.kind==='c_call_result_admitted'&&e.aggregateId===stopEvent.payload?.cCallRef)??null:null;
  if(value.stop) {
    field('stop',value.stop,'receipt ownerOutput.value.stop',stopEvent?{ref:stopEvent.eventId,digest:stopEvent.payloadDigest}:null,'the run_stopped event: {eventId,payloadDigest}');
    field('stop disposition',value.disposition,'receipt ownerOutput.value.disposition',stopEvent?.payload?.disposition,'run_stopped payload.disposition');
    const judged=events.find(e=>e.kind==='c_call_judged'&&e.payload?.judgmentRef===stopEvent?.payload?.judgmentRef)??null;
    field('stop producer',{cCallRef:stopEvent?.payload?.cCallRef??null,judgmentRef:stopEvent?.payload?.judgmentRef??null},'run_stopped payload, held in the receipt by stop.digest',
      judged?{cCallRef:judged.aggregateId,judgmentRef:judged.payload.judgmentRef}:null,'the c_call_judged event carrying that judgmentRef: {aggregateId,payload.judgmentRef}');
    field('state at the stop (result admission)',value.evidence?.find(r=>r.ref===stateEvent?.eventId)??null,'receipt ownerOutput.value.evidence row of that event',
      stateEvent?{ref:stateEvent.eventId,digest:stateEvent.payloadDigest}:null,'c_call_result_admitted of the stop c-call: {eventId,payloadDigest}');
    field('state at the stop (value digest)',stateEvent?.payload?.valueDigest??null,'that event payload.valueDigest',stateEvent?hash(stateEvent.payload.value):null,'sha256Canonical of payload.value');
  }
  const evidence=value.evidence??[],evidenceMatched=evidence.filter(r=>byId.get(r.ref)?.event.payloadDigest===r.digest).length;
  field('receipt evidence rows',evidence.length,'receipt ownerOutput.value.evidence (count)',evidenceMatched,'rows whose ref is an eventId of the log with an equal payloadDigest');
  // The Run coordinate: {ref: the run id, digest: its opening event's payloadDigest}.
  const runRes=receipt.resources?.run??null,opened=events.filter(e=>e.kind==='run_segment_opened'&&e.aggregateId===runRes?.ref);
  field('run',runRes,'receipt resources.run',opened[0]?{ref:opened[0].aggregateId,digest:opened[0].payloadDigest}:null,'run_segment_opened: {aggregateId,payloadDigest}');
  const body=opened[0]?.payload?(({runId,runDigest,...rest})=>rest)(opened[0].payload):null;
  field('run body digest',opened[0]?.payload?.runDigest??null,'run_segment_opened payload.runDigest',body?hash(body):null,'sha256Canonical of the runBody (open_call.ts:527-538)',false);
  const gcOpen=events.find(e=>e.kind==='graph_call_opened'&&e.aggregateId===value.graphCall?.ref)??null;
  field('root graph call',value.graphCall??null,'receipt ownerOutput.value.graphCall',gcOpen?{ref:gcOpen.aggregateId,digest:gcOpen.payloadDigest}:null,'graph_call_opened: {aggregateId,payloadDigest}');
  const replayRead=reads.find(r=>r.memberKey==='run_replay');
  field('replay',value.replay??null,'receipt ownerOutput.value.replay',replayRead?.projection?.replay??null,'fresh run_replay projection.replay (an owner projection, not a log fold)',false);
  // The two observations, the repair write and the retention, held in-run against the cold fold.
  const pick=row=>row?{eventId:row.eventId,admissionOrdinal:row.admissionOrdinal,resultRef:row.resultRef,resultDigest:row.resultDigest,observationRef:row.observationRef,
    observationDigest:row.observationDigest,commandObservationRef:row.commandObservationRef,commandObservationDigest:row.commandObservationDigest,exitStatus:row.exitStatus,stdout:row.stdout}:null;
  field('failing C2 observation',pick(held.claims.failingC2.observation),'specimen-judgment.json (in-run fold)',pick(folded.claims.failingC2.observation),
    'first checker observation of the installed C2 owner (independent-oracle.mjs:70-90 selection)');
  field('green C2 observation',pick(held.claims.greenC2.observation),'specimen-judgment.json (in-run fold)',pick(folded.claims.greenC2.observation),'last checker observation, same selection');
  // Both sides one row per observationRef: the run-time oracle listed every admission (the leaf's and the purpose child's).
  const repairPick=r=>{const once=new Set();return (r?.nativeWorkBetween??[]).filter(row=>(row.changedPaths??[]).length>0&&!once.has(row.observationRef)&&once.add(row.observationRef)).map(row=>({eventId:row.eventId,resultRef:row.resultRef,observationRef:row.observationRef,changedPaths:row.changedPaths,candidate:row.candidate}));};
  field('repair write',repairPick(held.claims.repair),'specimen-judgment.json (in-run fold)',repairPick(folded.claims.repair),
    'native workspace work observations admitted between the two C2 observations with nonempty changedPaths');
  const retPick=r=>r?.firstRetaining?{eventId:r.firstRetaining.eventId,resultRef:r.firstRetaining.resultRef,hits:r.firstRetaining.hits}:null;
  field('parent retention',retPick(held.claims.retention),'specimen-judgment.json (in-run fold)',retPick(folded.claims.retention),'first governance_work_state result after the failing C2 that carries it');
  // The close handoff's prefix and the event log's identity.
  field('closeHandoff.prefix',closeHandoff.prefix,'final-close-handoff.json',archivedPrefix,'runtime-event-prefix.json (captured from the same handoff by readOracleEvents)');
  const identity=await eventResourceIdentity(fileURLToPath(closeHandoff.prefix.eventLogRef));
  field('event log device/inode',{device:closeHandoff.prefix.storeIdentity.device,inode:closeHandoff.prefix.storeIdentity.inode},'final-close-handoff.json prefix.storeIdentity',
    {device:identity.device,inode:identity.inode},'eventResourceIdentity of prefix.eventLogRef (the physical file the cold read authenticated)');
  field('event log byte length',closeHandoff.prefix.prefixLength,'final-close-handoff.json prefix.prefixLength',identity.byteCount,'eventResourceIdentity byteCount (no append after close)',false);
  field('cold read authenticated',true,'the coordinate',Array.isArray(events)&&events.length>0,
    'readRuntimeEventsAtDurablePrefix(captureDurablePrefixCoordinate(archived)) read and validated '+events.length+' events against prefixDigest');
  // The parent's governance_work_state at close: the terminal value, or the state the stop c-call admitted.
  const closeState=terminal?.value?.kind==='governance_work_state'?terminal.value:stateEvent?.payload?.value?.kind==='governance_work_state'?stateEvent.payload.value:null;
  const closeStateSource=terminal?'terminal result value':stateEvent?{eventId:stateEvent.eventId,admissionOrdinal:stateEvent.admissionOrdinal,graphFunctionRef:stateEvent.graphFunctionRef,resultRef:stateEvent.payload.resultRef}:null;
  const terminalHits=closeState&&folded.claims.failingC2.observation?retention(closeState,folded.claims.failingC2.observation):[];
  const gaps=trace.filter(row=>row.required&&!row.equal);
  // Owners: actor process starts in the log; their transports from the binding's archive root.
  const starts=events.filter(e=>e.kind==='actor_invocation_started');
  const archiveRoot=setup.workspaceBinding?.roots?.archiveRoot??join(archive,'resources/archives');
  const {found,seen}=await walk(archiveRoot,name=>/-transport\.json$/u.test(name));
  const transports=[];
  for(const path of found.sort()) {
    const facts=await fileFacts(path),record=JSON.parse(await readFile(path,'utf8')),{result,init}=resultRow(record.stdout);
    transports.push({path:relative(archive,path),sha256:facts.sha256,byteCount:facts.byteCount,disposition:record.disposition,status:record.status,lane:record.lane,
      timedOut:record.timedOut,total_cost_usd:result?.total_cost_usd??null,num_turns:result?.num_turns??null,duration_ms:result?.duration_ms??null,
      duration_api_ms:result?.duration_api_ms??null,is_error:result?.is_error??null,subtype:result?.subtype??null,
      model:init?.model??null,models:result?.modelUsage?Object.keys(result.modelUsage):null});
  }
  const total=(key)=>Math.round(transports.reduce((s,row)=>s+(typeof row[key]==='number'?row[key]:0),0)*1e6)/1e6;
  const cost={kind:'d2_cost',archive,runId:run.runId,transportRoot:relative(archive,archiveRoot),productAiWorkspaceDirectories:seen.map(path=>relative(archive,path)),
    actorInvocationsStarted:starts.length,actorInvocations:starts.map(e=>({eventId:e.eventId,admissionOrdinal:e.admissionOrdinal,eventTime:e.eventTime,graphFunctionRef:e.graphFunctionRef,aggregateId:e.aggregateId})),
    transports,totals:{transports:transports.length,total_cost_usd:total('total_cost_usd'),num_turns:total('num_turns')},measure};
  const summaryFacts=await Promise.all(['summary.json','fresh-readback.json','final-close-handoff.json','runtime-event-prefix.json','source-conservation.json','specimen-judgment.json']
    .map(async name=>({name,...(await fileFacts(join(archive,name)))})));
  const archiveRecord={kind:'d2_archive',archive,runId:run.runId,freshRoot:{sandbox:join(archive,'sandbox'),bootstrap:join(archive,'bootstrap')},
    files:summaryFacts.map(({name,sha256,byteCount})=>({name,sha256,byteCount})),eventLog:{path:fileURLToPath(closeHandoff.prefix.eventLogRef),...identity},
    events:events.length,summary};
  // Claim 5: no Run migration.
  const scan=async dir=>{const hits=[];try{for(const name of await readdir(join(archive,dir))){const text=await readFile(join(archive,dir,name),'utf8');
    for(const word of HISTORICAL)if(text.includes(word))hits.push({file:dir+'/'+name,word});}}catch(error){if(error.code!=='ENOENT')throw error;}return hits;};
  const eventHits=events.filter(e=>HISTORICAL.some(word=>JSON.stringify(e).includes(word))).map(e=>e.eventId);
  const driverText=await readFile(new URL('./run-specimen.mjs',import.meta.url),'utf8');
  const driverHits=HISTORICAL.filter(word=>driverText.includes(word));
  const runOpens=events.filter(e=>e.kind==='run_segment_opened');
  const firstEvent=events[0];
  const claim5={satisfied:false,specimen:acquisition.assets,conservation,driverSourceHits:driverHits,commandRecordHits:[...await scan('commands'),...await scan('calls')],eventPayloadHits:eventHits,
    runSegmentsOpened:runOpens.map(e=>({eventId:e.eventId,admissionOrdinal:e.admissionOrdinal,runId:e.runId})),
    eventLogUnderArchive:fileURLToPath(closeHandoff.prefix.eventLogRef).startsWith(archive+'/'),firstEvent:{kind:firstEvent?.kind,admissionOrdinal:firstEvent?.admissionOrdinal,eventTime:firstEvent?.eventTime}};
  claim5.satisfied=driverHits.length===0&&claim5.commandRecordHits.length===0&&eventHits.length===0&&runOpens.length===1&&runOpens[0].runId===runRes?.ref&&claim5.eventLogUnderArchive&&
    acquisition.assets.filter(a=>a.worksitePath).every(a=>ORIGINALS[a.worksitePath]===a.digest)&&conservation.every(row=>row.expected===row.observed);
  const claim4={satisfied:false,freshReadback:reads.map(read=>({memberKey:read.memberKey,outcomeKind:read.ownerOutput?.outcomeKind,status:read.projection?.status??null,
    projectionDigest:hash(read.projection??null),terminalValueDigest:read.projection?.terminalResult?.valueDigest??null})),
    coldReads:{allEqual:cold.allEqual,identityUnchanged:cold.identityUnchanged,reads:cold.reads,coldRoot:cold.coldRoot,pid:cold.process?.pid},traceGaps:gaps.map(row=>row.field)};
  // Claim 4 as the activation states it: run_result a result whose terminal equals the receipt's, run_replay `closed`,
  // the cold reads equal, the resource identity unchanged, no trace gap. Held-state conservation (the reads agree with
  // what the receipt holds when no terminal result exists) is recorded beside it as evidence, not as the disposition.
  const runResult=reads.find(r=>r.memberKey==='run_result'),heldStatus=terminal?'closed':value.disposition;
  claim4.expected={runResult:'result with the held terminal',runReplayStatus:'closed'};
  claim4.held={runResult:terminal?'result with the held terminal':'refusal not_found (no terminal result held)',runReplayStatus:heldStatus};
  claim4.literalClosed=replayRead?.projection?.status==='closed';
  claim4.heldStateConserved=reads.length===2&&(terminal?runResult?.ownerOutput?.outcomeKind==='result':runResult?.ownerOutput?.outcomeKind==='refusal'&&runResult.ownerOutput.value?.code==='not_found')&&
    replayRead?.ownerOutput?.outcomeKind==='result'&&replayRead.projection?.status===heldStatus&&eq(replayRead.projection?.subject,runRes)&&
    (terminal?true:(replayRead.projection?.terminalResult??null)===null)&&cold.allEqual===true&&cold.identityUnchanged===true&&gaps.length===0;
  claim4.satisfied=Boolean(terminal)&&claim4.literalClosed&&runResult?.ownerOutput?.outcomeKind==='result'&&claim4.heldStateConserved===true;
  claim4.gap=claim4.satisfied?null:'No terminal result: the Run stopped blocked at the selector gap the specimen predicts; run_result is a not_found refusal and run_replay reports blocked, not closed. The reads conserve the held stop.';
  const f=folded.claims;
  const claimsRecord={kind:'d2_claims',archive,runId:run.runId,runRef:runRes?.ref??null,
    inRunJudgment:{disposition:held.disposition,oracleModule:held.oracleModule,claims:Object.fromEntries(Object.entries(held.claims).map(([k,v])=>[k,v.satisfied])),
      foldedNow:Object.fromEntries(Object.entries(f).map(([k,v])=>[k,v.satisfied])),
      note:'The run-time oracle counted native work admissions, not observations; one repair admitted at the leaf and as the construction child result counted twice. Corrected fold below.'},
    modules:{oracleAtRunTime:held.oracleModule,oracleAtFold:{...(await fileFacts(fileURLToPath(import.meta.url))),path:'specimen-oracle.mjs'},
      driverAtRunTime:{path:'run-specimen.mjs',sha256:'sha256:233409e96addb6a61fdde3a00b5e1237166bb21bed5654c6a30c43c904867fd0',byteCount:20619,source:'the copy kept in the Worker scratch before the coldReads edit'},
      driverAtFold:{...(await fileFacts(fileURLToPath(new URL('./run-specimen.mjs',import.meta.url)))),path:'run-specimen.mjs'}},
    harness:{status:summary.status,uatPass:summary.uatPass,reason:summary.reason,runtimeDisposition:summary.runtimeDisposition??null,terminalAvailable:summary.terminalAvailable??null,
      stop:value.stop?{disposition:value.disposition,stop:value.stop,reasonRef:stopEvent?.payload?.reasonRef??null}:null,
      closeState:closeState?{source:closeStateSource,terminal:closeState.terminal,unresolvedSupportRefs:closeState.unresolvedSupportRefs,observations:closeState.observations.map(o=>o.purpose)}:null,
      uatVerdict:closeState?closeState.observations.filter(o=>o.purpose==='uat').map(o=>o.value):null},
    claims:[
      {claim:1,title:'The failing C2, retained',satisfied:f.failingC2.satisfied&&f.retention.satisfied&&terminalHits.some(hit=>hit.equal),
        observation:f.failingC2.observation,parentFirstRetaining:f.retention.firstRetaining,closeStateSource,closeStateRetention:terminalHits,
        route:'A nonzero subject-command exit is an admitted success-class C2 observation (worksite_command_execution.ts:2347); the diagnostic rides in commandResults[].stdout'},
      {claim:2,title:'One native repair, fixture/value.txt only',satisfied:f.repair.satisfied,repair:f.repair},
      {claim:3,title:'The same checker, green',satisfied:f.greenC2.satisfied,observation:f.greenC2.observation,
        checkerDigestConserved:conservation.find(row=>row.path==='fixture/checker.mjs')},
      {claim:4,title:'Close, reopen, fresh reads conserve',...claim4},
      {claim:5,title:'No Run migration',...claim5}]};
  claimsRecord.satisfied=claimsRecord.claims.every(row=>row.satisfied);
  const traceRecord={kind:'d2_trace',archive,runId:run.runId,source:'readRuntimeEventsAtDurablePrefix(captureDurablePrefixCoordinate(runtime-event-prefix.json))',
    events:events.length,fields:trace,gaps:gaps.map(row=>row.field),complete:gaps.length===0};
  for(const [name,value] of [['claims.json',claimsRecord],['trace.json',traceRecord],['archive.json',archiveRecord],['cost.json',cost]])
    await writeFile(join(out,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  return {claims:claimsRecord.claims.map(row=>({claim:row.claim,satisfied:row.satisfied})),traceComplete:traceRecord.complete,gaps:traceRecord.gaps,cost:cost.totals,owners:starts.length};
}

async function main(args=process.argv.slice(2)) {
  const [mode,...rest]=args,options={};
  for(let i=0;i<rest.length;i++){if(['--archive','--cold','--measure','--out'].includes(rest[i]))options[rest[i].slice(2)]=rest[++i];else throw new TypeError('Unknown argument: '+rest[i]);}
  if(mode!=='claims'||!options.archive||!options.cold||!options.out)throw new TypeError('Usage: specimen-oracle.mjs claims --archive SEALED_ARCHIVE --cold COLD_READS_JSON [--measure MEASURE_JSON] --out RECORD_DIRECTORY');
  const result=await claims({archive:resolve(options.archive),coldReadsPath:resolve(options.cold),measurePath:options.measure?resolve(options.measure):null,out:resolve(options.out)});
  console.log(JSON.stringify(result,null,2));return result.claims.every(row=>row.satisfied)&&result.traceComplete?0:1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))process.exitCode=await main();
