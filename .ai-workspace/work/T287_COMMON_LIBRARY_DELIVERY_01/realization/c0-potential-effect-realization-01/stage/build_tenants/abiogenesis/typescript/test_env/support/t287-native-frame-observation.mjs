import assert from 'node:assert/strict';
import {chmod,mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
export async function controlledFrameWorker(root){
 await mkdir(root,{recursive:true});const command=join(root,'claude');
 await writeFile(command,`#!/usr/bin/env node
let prompt='';process.stdin.setEncoding('utf8');process.stdin.on('data',b=>prompt+=b);
process.stdin.on('end',()=>{
 const sections={};for(const part of prompt.split(/^## /m).slice(1)){const cut=part.indexOf('\\n');sections[part.slice(0,cut)]=JSON.parse(part.slice(cut+1).trim());}
 const task=sections.task,current=sections.predecessors.at(-1),assessor=sections.role.startsWith('Independently');
 const q={memberRef:sections.source[0].memberRef,quote:sections.source[0].text.slice(0,200)};
 const raw=assessor?{kind:'semantic_stage_assessment_candidate',schemaVersion:'5.0.0',criteria:task.rubric.map(c=>({criterionRef:c.criterionRef,disposition:'satisfied',explanation:'Controlled carrier plumbing only; no semantic qualification.',sourceQuotes:[q],statementRefs:current.candidate.statements.map(s=>s.statementRef)})),pressure:[]}:
 {kind:'semantic_stage_asset_candidate',schemaVersion:'5.0.0',statements:[{statementRef:task.stageRef+'/fixture-statement',text:'Controlled carrier witness preserves the original source and obligations.',modality:'supporting',sourceQuotes:[q],requirementRefs:sections.obligations.sourceDeclaration.terms.map(t=>t.requirementRef),obligationRefs:sections.obligations.sourceDeclaration.fulfillmentBindings.map(b=>b.obligationRef),predecessorStatementRefs:sections.predecessors.flatMap(a=>a.candidate.statements.map(s=>s.statementRef))}],requirementCandidates:[],worksiteDesign:null,pressure:[]};
 console.log(JSON.stringify({type:'system',subtype:'init'}));
 setTimeout(()=>console.log(JSON.stringify({type:'result',subtype:'success',result:JSON.stringify(raw)})),40);
});\n`);await chmod(command,0o755);return command;
}
export async function runControlledFrameEntry(proof,packageRoot){
 assert.ok(process.env.ABI5_FRAME_EXECUTION_GRANT,'separate Executive native execution grant required');
 const entry=process.env.ABI5_FRAME_ENTRY_ROOT;assert.ok(entry,'exact frozen proof entry required');
 const child=spawn(process.execPath,[join(entry,'run-entry.mjs'),'native'],{cwd:entry,env:{...process.env,ABI5_FRAME_PACKAGE_ROOT:packageRoot},stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';child.stdout.on('data',b=>{stdout+=b;process.stdout.write(b)});child.stderr.on('data',b=>{stderr+=b;process.stderr.write(b)});
 const code=await new Promise((r,j)=>{child.on('error',j);child.on('close',r)});assert.equal(code,0,stdout+stderr);
 const attempt=process.env.ABI5_FRAME_ATTEMPT??'native-01';
 const result=JSON.parse(await readFile(join(entry,attempt,'output/attempt-01/proof.json')));
 return {result,installedRoot:join(entry,attempt,'output/harness-01-01/cli-host/node_modules/@abiogenesis/typescript-tenant')};
}
export async function loadFrameOwners(root){const get=p=>import(pathToFileURL(join(root,'build/code/src',p+'.js')));return {
 events:await get('abg/event_store'),prefix:await get('abg/event_prefix'),live:await get('abg/runtime_liveness'),
 calculus:await get('abg/event_calculus'),replay:await get('abg/replay'),immutable:await get('shared/immutable'),digests:await get('shared/digests')};}
export function inspectFrameTrace(owners,events){
 const full=owners.prefix.selectValidatedRuntimeEventPrefix(owners.immutable.deepFreeze(events));
 const rows=[];for(const opened of events.filter(e=>e.kind==='frame_opened')){
  const context=owners.live.projectFrameLivenessContext(full,opened.frameId);assert.ok(context,'native opening declares frame');
  const probes=events.filter(e=>e.kind==='runtime_activity_probe_observed'&&e.payload.probeContract.scope.cCallRef===null&&e.frameId===opened.frameId);
  assert.ok(probes.length>=2);assert.equal(probes[0].payload.observation.elapsedMs,0);
  assert.equal(new Set(probes.map(e=>e.payload.observation.clockOriginRef)).size,1);
  for(const [i,e]of probes.entries()){
   const o=e.payload.observation,producer=events.find(p=>p.eventId===o.underlyingEventRef);assert.ok(producer);
   assert.notEqual(producer.kind,'runtime_activity_probe_observed');assert.equal(o.sourceDigest,producer.payloadDigest);
   assert.deepEqual(e.causationEventRefs,[...new Set([opened.eventId,producer.eventId])]);
   if(i>0)assert.ok(o.elapsedMs>=probes[i-1].payload.observation.elapsedMs);
   const before=owners.prefix.selectValidatedRuntimeEventPrefix(owners.immutable.deepFreeze(events.slice(0,e.admissionOrdinal-1)));
   assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,e),true,'native sample authenticates '+producer.kind);
   const cut=owners.prefix.selectValidatedRuntimeEventPrefix(owners.immutable.deepFreeze(events.slice(0,e.admissionOrdinal)));
   const projection=owners.live.projectRuntimeLivenessAtPrefix(cut,opened.frameId);assert.ok(projection);
   if(producer.kind==='c_call_judged')assert.deepEqual(projection.activeSystems,[context.probes[0].sourceRef],'child judgment keeps frame observation active');
   if(producer.kind==='frame_closed')assert.deepEqual(projection.activeSystems,[],'terminal sample never revives');
  }
  const projection=owners.live.projectRuntimeLivenessAtPrefix(full,opened.frameId);assert.ok(projection);assert.deepEqual(projection.activeSystems,[]);
  rows.push({frameId:opened.frameId,basisRef:context.scope.basisRef,attempt:context.scope.attempt,origin:context.binding.clockOriginRef,
   samples:probes.map(e=>({eventRef:e.eventId,ordinal:e.admissionOrdinal,producerRef:e.payload.observation.underlyingEventRef,
    producer:events.find(p=>p.eventId===e.payload.observation.underlyingEventRef).kind,elapsedMs:e.payload.observation.elapsedMs}))});
 }
 const calculus=owners.calculus.deriveRuntimeEventCalculusProjection(full);
 assert.ok(!calculus.holds.some(f=>f.name==='runtime_invocation_active'));
 const quiescences=[...new Set(events.filter(e=>e.kind==='run_segment_opened').map(e=>e.runId))].map(runId=>{
  const projection=owners.replay.projectRunQuiescence(owners.prefix.selectValidatedRuntimeEventPrefix(events,{runId}));
  assert.equal(projection.disposition,'quiescent_for_close');assert.deepEqual(projection.blockingFluents,[]);return {runId,projection};
 });
 for(const close of events.filter(e=>e.kind==='graph_call_closed'))assert.equal(events.find(e=>e.eventId===close.causationEventRefs[0]).kind,'frame_closed');
 for(const close of events.filter(e=>e.kind==='run_closed'))assert.equal(events.find(e=>e.eventId===close.causationEventRefs[0]).kind,'graph_call_closed');
 return {rows,quiescences,calculus};
}
