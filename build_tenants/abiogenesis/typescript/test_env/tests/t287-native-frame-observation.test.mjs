import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {runControlledFrameEntry,loadFrameOwners,inspectFrameTrace} from '../support/t287-native-frame-observation.mjs';
const root=resolve(import.meta.dirname,'../..'),proof=process.env.ABI5_FRAME_PROOF_ROOT;
const sha=b=>createHash('sha256').update(b).digest('hex');

test('nominal liveness replay cuts preserve cold validation and reject false reuse',{
 skip:!process.env.ABI5_PREFIX_REUSE_OBSERVATIONS,timeout:180_000,
},async()=>{
 const owners=await loadFrameOwners(root),observation=JSON.parse(await readFile(process.env.ABI5_PREFIX_REUSE_OBSERVATIONS,'utf8'));
 const durablePrefix=observation.observedPrefix??observation.prefix;
 const events=owners.events.readRuntimeEventsAtDurablePrefix(durablePrefix,{requireCurrent:true});
 const full=owners.prefix.selectValidatedRuntimeEventPrefix(events);
 const probes=events.filter(e=>['runtime_activity_probe_observed','runtime_external_interruption_observed','actor_process_timeout_observed'].includes(e.kind));
 assert.ok(probes.length>0);
 const folded=owners.live.createRuntimeLivenessEventValidator(full);
 const cuts=event=>({before:owners.prefix.validatedRuntimeEventPrefixThroughEvent(full,events[event.admissionOrdinal-2].eventId),
   after:owners.prefix.validatedRuntimeEventPrefixThroughEvent(full,event.eventId)});
 for(const event of probes){const {before,after}=cuts(event);
  assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,event),true,'unchanged cold candidate path '+event.admissionOrdinal);
  assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,event,after),true,'exact admitted reuse '+event.admissionOrdinal);
  assert.equal(folded(event),true,'computation-local historical fold '+event.admissionOrdinal);
 }
 const event=probes[0],{before,after}=cuts(event);
 const clone=owners.immutable.deepFreeze(structuredClone(event));
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,clone),true,'new frozen candidate keeps the full original validation path');
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,clone,after),false,'equal-shaped event cannot borrow another admitted cut');
 assert.equal(folded(clone),false,'local fold cannot be borrowed by an equal-shaped event');
 const shortFold=owners.live.createRuntimeLivenessEventValidator(after);
 assert.equal(shortFold(probes.at(-1)),false,'local fold cannot consume a later prefix member');
 assert.equal(folded(event),true,'out-of-order lookup safely rederives its exact earlier cut');
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,event,before),false,'missing appended event');
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,event,full),false,'future/nonadjacent cut');
 const copied=Object.freeze(Object.create(Object.getPrototypeOf(after),Object.getOwnPropertyDescriptors(after)));
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,event,copied),false,'copied nominal receipt cannot authenticate a different object');
 const shape=Object.freeze({kind:'validated_runtime_event_prefix',events:after.events});
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,event,shape),false,'shape alone is not nominal authority');
 const detached=owners.prefix.selectValidatedRuntimeEventPrefix(owners.immutable.deepFreeze(structuredClone(after.events)));
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,event,detached),false,'separately selected value-equal cut has different event identities');
 // Deliberately unadmitted control data: a scoped view of later history cannot
 // replace the exact unscoped predecessor + event cut.
 const foreign=owners.immutable.deepFreeze({...event,eventId:event.eventId+'/foreign',admissionOrdinal:event.admissionOrdinal+1,
   runId:'run://prefix-reuse-control/foreign',aggregateId:'run://prefix-reuse-control/foreign',causationEventRefs:[]});
 const hidden=owners.prefix.selectValidatedRuntimeEventPrefix(Object.freeze([...after.events,foreign]),{runId:event.runId});
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,event,hidden),false,'scoped later history cannot replace the exact cut');
 const controls=[['foreign Run',e=>{e.runId+='-foreign';}],['wrong profile',e=>{e.eventContractDigest='sha256:'+'f'.repeat(64);}],
   ['wrong source digest',e=>{e.payload.observation.sourceDigest='sha256:'+'0'.repeat(64);}],
   ['future producer',e=>{e.payload.observation.underlyingEventRef=events.at(-1).eventId;}]];
 for(const [label,mutate]of controls){const changed=structuredClone(event);mutate(changed);owners.immutable.deepFreeze(changed);
  assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,changed),false,label+' cold');
  assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,changed,after),false,label+' reuse');
 }
 let accessed=0;const accessor={...event};Object.defineProperty(accessor,'eventTime',{enumerable:true,get(){accessed++;return event.eventTime;}});Object.freeze(accessor);
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,accessor),false,'frozen accessor is not immutable event data');
 assert.equal(accessed,0,'immutability validation must not execute a getter');
 assert.deepEqual(owners.events.readRuntimeEventsAtDurablePrefix(durablePrefix,{requireCurrent:true}),events);
 console.log(JSON.stringify({kind:'offline_nominal_liveness_reuse',validated:probes.length,coldAndReuseAndFoldEqual:true,falseReuseRefuses:true}));
});

test('liveness fold reuse refuses invalid history and never borrows another computation',{
 skip:!process.env.ABI5_PREFIX_REUSE_OBSERVATIONS,timeout:180_000,
},async()=>{
 assert.ok(process.env.ABI5_PREFIX_REUSE_BASELINE_ROOT);
 const owners=await loadFrameOwners(root),baseline=await loadFrameOwners(process.env.ABI5_PREFIX_REUSE_BASELINE_ROOT);
 const observation=JSON.parse(await readFile(process.env.ABI5_PREFIX_REUSE_OBSERVATIONS,'utf8'));
 const rows=owners.events.readRuntimeEventsAtDurablePrefix(observation.observedPrefix??observation.prefix,{requireCurrent:true});
 const actor=rows.find(e=>e.kind==='actor_invocation_started');assert.ok(actor);
 const activity=rows.filter(e=>e.kind==='runtime_activity_probe_observed'&&e.payload.probeContract.scope.actorInvocationRef===actor.aggregateId);
 assert.ok(activity.length>3);
 const target=activity.at(-1),earlier=activity.find(e=>e.payload.observation.signal==='activity'&&e.payload.observation.elapsedMs>0);
 assert.ok(earlier&&earlier.admissionOrdinal<target.admissionOrdinal);
 const clean=owners.prefix.selectValidatedRuntimeEventPrefix(Object.freeze(rows.slice(0,target.admissionOrdinal)));
 const cleanFold=owners.live.createRuntimeLivenessEventValidator(clean);
 for(const event of activity)assert.equal(cleanFold(event),true);
 const controls=[
  ['historical source mismatch',e=>{e.payload.observation.sourceDigest='sha256:'+'0'.repeat(64);}],
  ['historical clock mismatch',e=>{e.payload.observation.clockOriginRef+='-foreign';}],
  ['historical contract mismatch',e=>{e.payload.probeContract.sourceRef+='-foreign';}],
  ['historical elapsed above later sample',e=>{e.payload.observation.elapsedMs=target.payload.observation.elapsedMs+1;}],
  ['historical unavailable activity',e=>{e.payload.observation.coverage='unavailable';}],
 ];
 for(const [label,mutate]of controls){
  const changed=structuredClone(rows.slice(0,target.admissionOrdinal));mutate(changed[earlier.admissionOrdinal-1]);
  owners.immutable.deepFreeze(changed);
  const prefix=owners.prefix.selectValidatedRuntimeEventPrefix(changed),current=changed.at(-1);
  const before=owners.prefix.validatedRuntimeEventPrefixThroughEvent(prefix,changed.at(-2).eventId);
  const oldPrefix=baseline.prefix.selectValidatedRuntimeEventPrefix(changed);
  const oldBefore=baseline.prefix.validatedRuntimeEventPrefixThroughEvent(oldPrefix,changed.at(-2).eventId);
  assert.equal(baseline.live.validateRuntimeLivenessEventAtPrefix(oldBefore,current,oldPrefix),false,label+' predecessor');
  assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(before,current,prefix),false,label+' cold');
  assert.equal(owners.live.createRuntimeLivenessEventValidator(prefix)(current),false,label+' skipped predecessors still checked');
  const warm=owners.live.createRuntimeLivenessEventValidator(prefix);
  for(const event of changed.filter(e=>e.admissionOrdinal<earlier.admissionOrdinal&&activity.some(a=>a.eventId===e.eventId)))assert.equal(warm(event),true);
  assert.equal(warm(current),false,label+' warm history');
  assert.equal(cleanFold(current),false,label+' cannot borrow clean computation');
  assert.equal(cleanFold(target),true,label+' separate failure cannot poison clean computation');
 }
 // A later duplicate owner declaration invalidates a previously valid context;
 // warmed history is never a substitute for current-cut authentication.
 const duplicate=structuredClone(actor),duplicateRows=structuredClone(rows.slice(0,target.admissionOrdinal-1));
 duplicate.eventId+='-duplicate';duplicate.admissionOrdinal=target.admissionOrdinal;duplicateRows.push(duplicate);
 const delayed=structuredClone(target);delayed.admissionOrdinal+=1;duplicateRows.push(delayed);owners.immutable.deepFreeze(duplicateRows);
 const duplicated=owners.prefix.selectValidatedRuntimeEventPrefix(duplicateRows),fold=owners.live.createRuntimeLivenessEventValidator(duplicated);
 for(const event of duplicateRows.filter(e=>e.admissionOrdinal<target.admissionOrdinal&&activity.some(a=>a.eventId===e.eventId)))assert.equal(fold(event),true);
 const duplicateBefore=owners.prefix.validatedRuntimeEventPrefixThroughEvent(duplicated,duplicate.eventId);
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(duplicateBefore,delayed,duplicated),false,'duplicate declaration cold');
 assert.equal(fold(delayed),false,'duplicate declaration after warmed fold');
 assert.throws(()=>owners.live.createRuntimeLivenessEventValidator({kind:'validated_runtime_event_prefix',events:clean.events}),/nominal/);
 console.log(JSON.stringify({kind:'liveness_fold_invalid_history',controls:controls.map(([label])=>label),duplicateContextRefused:true,isolatedComputations:true}));
});

test('liveness hash reuse preserves complete probe contracts and rejects untrusted contexts',{
 skip:!process.env.ABI5_PREFIX_REUSE_OBSERVATIONS,timeout:180_000,
},async()=>{
 assert.ok(process.env.ABI5_PREFIX_REUSE_BASELINE_ROOT,'explicit frozen predecessor required');
 const owners=await loadFrameOwners(root),baseline=await loadFrameOwners(process.env.ABI5_PREFIX_REUSE_BASELINE_ROOT);
 const observation=JSON.parse(await readFile(process.env.ABI5_PREFIX_REUSE_OBSERVATIONS,'utf8'));
 const durable=observation.observedPrefix??observation.prefix;
 const history=owners.events.readRuntimeEventsAtDurablePrefix(durable,{requireCurrent:true});
 const actor=history.find(e=>e.kind==='actor_invocation_started');assert.ok(actor);
 const event=history.findLast(e=>e.kind==='runtime_activity_probe_observed'&&e.payload.probeContract.scope.actorInvocationRef===actor.aggregateId);
 assert.ok(event);assert.ok(event.payload.observation.elapsedMs>0,'selected activity has earlier same-scope history');
 const evaluate=api=>{
   const rows=api.events.readRuntimeEventsAtDurablePrefix(durable,{requireCurrent:true});
   const full=api.prefix.selectValidatedRuntimeEventPrefix(rows),actual=rows[event.admissionOrdinal-1];
   const before=api.prefix.validatedRuntimeEventPrefixThroughEvent(full,rows[event.admissionOrdinal-2].eventId);
   const after=api.prefix.validatedRuntimeEventPrefixThroughEvent(full,actual.eventId);
   const context=api.live.projectActorLivenessContext(after,actor.aggregateId);assert.ok(context);
   const sample={clockOriginRef:actual.payload.observation.clockOriginRef,elapsedMs:actual.payload.observation.elapsedMs,eventRef:actual.eventId};
   const projection=api.live.deriveRuntimeLiveness(after,context,sample);assert.ok(projection);
   const contextControls=[['same-ref changed contract',c=>{c.probes[0].required=!c.probes[0].required;}],
     ['duplicate contract',c=>{c.probes.push(structuredClone(c.probes[0]));}],
     ['wrong scope',c=>{c.scope.programRef+='-foreign';}],
     ['wrong clock',c=>{c.binding.clockOriginRef+='-foreign';}],
     ['untrusted declaration',c=>{c.declarationEventRef+='-foreign';}]];
   for(const [label,mutate]of contextControls){const changed=structuredClone(context);mutate(changed);
     assert.equal(api.live.deriveRuntimeLiveness(after,changed,sample),null,label);}
   const eventControls=[['same-ref changed payload',e=>{e.payload.probeContract.sourceRef+='-foreign';}],
     ['wrong probe ref',e=>{e.payload.observation.probeRef+='-foreign';}],
     ['wrong source',e=>{e.payload.observation.sourceDigest='sha256:'+'0'.repeat(64);}],
     ['wrong scope',e=>{e.payload.observation.scopeDigest='sha256:'+'0'.repeat(64);}],
     ['wrong clock',e=>{e.payload.observation.clockOriginRef+='-foreign';}],
     ['backward elapsed order',e=>{e.payload.observation.elapsedMs=0;}],
     ['invalid coverage signal',e=>{e.payload.observation.coverage='unavailable';e.payload.observation.signal='activity';}]];
   for(const [label,mutate]of eventControls){const changed=structuredClone(actual);mutate(changed);api.immutable.deepFreeze(changed);
     assert.equal(api.live.validateRuntimeLivenessEventAtPrefix(before,changed),false,label);}
   return {projection,contextControls:contextControls.map(([label])=>label),eventControls:eventControls.map(([label])=>label)};
 };
 const expected=evaluate(baseline),actual=evaluate(owners);
 assert.deepEqual(actual,expected,'full projection and every refusal are conserved under both owners');
 console.log(JSON.stringify({kind:'liveness_hash_reuse_falsifiers',ordinal:event.admissionOrdinal,
   contextControls:actual.contextControls,eventControls:actual.eventControls,projectionDigest:actual.projection.projectionDigest}));
});

test('liveness batch hash reuse preserves cold projections and isolates exact prefixes',{
 skip:!process.env.ABI5_PREFIX_REUSE_OBSERVATIONS,timeout:180_000,
},async()=>{
 const owners=await loadFrameOwners(root),observation=JSON.parse(await readFile(process.env.ABI5_PREFIX_REUSE_OBSERVATIONS,'utf8'));
 const rows=owners.events.readRuntimeEventsAtDurablePrefix(observation.observedPrefix??observation.prefix,{requireCurrent:true});
 const full=owners.prefix.selectValidatedRuntimeEventPrefix(rows),runId=observation.runRef??observation.runId;
 const ordinals=JSON.parse(process.env.ABI5_PREFIX_REUSE_CUTS??'[100,1098]');
 const cuts=[ordinals[0],ordinals.at(-1)].map(ordinal=>{
   const event=rows.find(e=>e.admissionOrdinal===ordinal);assert.ok(event);
   return owners.prefix.validatedRuntimeEventPrefixThroughEvent(full,event.eventId);
 });
 const project=prefix=>owners.live.projectRuntimeLivenessForScope(prefix,runId);
 const early=project(cuts[0]),late=project(cuts[1]);assert.ok(early.length&&late.length);
 for(const [index,prefix]of cuts.entries()){
   const batch=index===0?early:late,prefixDigest=owners.digests.sha256Canonical(owners.prefix.runtimeEventsFromValidatedPrefix(prefix));
   for(const row of batch){
     const occurrence=row.scope.actorInvocationRef??row.scope.cCallRef??row.scope.frameId;
     assert.deepEqual(row,owners.live.projectRuntimeLivenessAtPrefix(prefix,occurrence),'private batch and exported cold relation agree');
     assert.equal(row.prefixDigest,prefixDigest,'digest belongs to this exact authenticated prefix');
   }
 }
 assert.notEqual(early[0].prefixDigest,late[0].prefixDigest);
 assert.deepEqual(project(cuts[0]),early,'later call cannot poison an earlier prefix');
 const copied=Object.freeze(Object.create(Object.getPrototypeOf(cuts[0]),Object.getOwnPropertyDescriptors(cuts[0])));
 assert.throws(()=>project(copied),/nominal/,'copied nominal receipt is not trusted batch authority');
 assert.throws(()=>project(Object.freeze({kind:'validated_runtime_event_prefix',events:cuts[0].events})),/nominal/);
 console.log(JSON.stringify({kind:'liveness_batch_hash_reuse',ordinals:[ordinals[0],ordinals.at(-1)],coldEqual:true,isolatedPrefixes:true}));
});

test('native controlled process preserves frame observations and owner causes',async context=>{
 assert.ok(proof,'explicit proof-local territory');
 const {result,installedRoot}=await runControlledFrameEntry(proof,process.env.ABI5_FRAME_PACKAGE_ROOT??root);
 assert.equal(result.disposition,'controlled_frame_plumbing_completed');
 const owners=await loadFrameOwners(installedRoot),eventLogPath=new URL(result.closeHandoff.prefix.eventLogRef);
 const bytes=await readFile(eventLogPath),events=owners.events.validateHistoricalEvents(bytes),report=inspectFrameTrace(owners,events);
 const closedActors=events.filter(e=>e.kind==='actor_invocation_closed');assert.equal(closedActors.length,2);
 assert.equal(closedActors[0].frameId,closedActors[1].frameId,'author and evaluator share the declared child frame');
 const childFrame=closedActors[0].frameId,openedCalls=events.filter(e=>e.kind==='c_call_opened'&&e.frameId===childFrame);
 assert.equal(openedCalls.length,3,'three actual CCalls share the child frame');
 assert.ok(openedCalls.some(e=>JSON.stringify(e.payload).includes('locus://stdo-note.example/frame-proof/consequence@5')));
 const samples=report.rows.find(row=>row.frameId===childFrame).samples.map(s=>s.producer);
 for(const expected of ['actor_invocation_closed','c_call_evidenced','c_call_result_admitted','c_call_judged','traversal_route_admitted','c_call_fibre_selected','frame_closed'])assert.ok(samples.includes(expected),expected);
 assert.ok(events.some(e=>e.kind==='child_foldback_admitted'));
 const barriers=JSON.parse(await readFile(join(process.env.ABI5_FRAME_ENTRY_ROOT,process.env.ABI5_FRAME_ATTEMPT??'native-01','barriers.json')));
 assert.equal(barriers.length,2);assert.ok(barriers.every(b=>b.frameSampleDurableBeforeCarrierValidation));
 await writeFile(join(proof,'native-trace.json'),JSON.stringify({claims:'controlled native plumbing, not semantic LLM or Product qualification',
  path:eventLogPath.href,sha256:sha(bytes),report,barriers},null,2)+'\n');
});

test('frame declaration and observation-join falsifiers over an authentic read-only historical opening',async()=>{
 const owners=await loadFrameOwners(root),bytes=await readFile(process.env.ABI5_FRAME_HISTORY_PATH);
 assert.equal(sha(bytes),process.env.ABI5_FRAME_HISTORY_SHA256);
 const history=owners.events.validateHistoricalEvents(bytes),opened=history.find(e=>e.kind==='frame_opened');assert.ok(opened);
 const rows=owners.immutable.deepFreeze(history.slice(0,opened.admissionOrdinal));
 const prefix=owners.prefix.selectValidatedRuntimeEventPrefix(rows),context=owners.live.projectFrameLivenessContext(prefix,opened.frameId);
 assert.ok(context);assert.equal(context.scope.cCallRef,null);assert.equal(context.scope.actorInvocationRef,null);assert.equal(context.scope.attempt,opened.payload.attempt);
 const probe=context.probes[0],observation={kind:'runtime_probe_observation',schemaVersion:'5.0.0',probeRef:probe.probeRef,
  scopeDigest:owners.digests.sha256Canonical(context.scope),clockOriginRef:context.binding.clockOriginRef,elapsedMs:0,
  underlyingObservationRef:opened.eventId,underlyingEventRef:opened.eventId,sourceDigest:opened.payloadDigest,sourceRevisionDigest:null,
  evidenceRefs:[opened.eventId],coverage:'observed',signal:'activity'};
 const candidate={kind:'runtime_activity_probe_observed',eventTime:opened.eventTime,aggregateType:'graph_call',aggregateId:opened.graphCallId,
  parentAggregateId:opened.runId,causationEventRefs:[opened.eventId],correlationId:opened.correlationId,workflowVersion:'5.0.0',scopeClass:'run',
  basisId:opened.basisId,runId:opened.runId,graphFunctionRef:opened.graphFunctionRef,graphCallId:opened.graphCallId,frameId:opened.frameId,
  payload:{probeContract:probe,observation}};
 const event=owners.events.projectRuntimeEventFromValidatedHistory(rows,candidate);
 assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(prefix,event),true,'pure candidate relation only; not native proof');
 const controls=[['foreign basis',e=>e.basisId='basis://foreign'],['foreign GF',e=>e.graphFunctionRef='gf://foreign'],
  ['foreign Run',e=>e.runId='run://foreign'],['foreign graph',e=>e.graphCallId='graph://foreign'],['foreign frame',e=>e.frameId='frame://foreign'],
  ['attempt',e=>e.payload.probeContract.scope.attempt+=1],['borrowed origin',e=>e.payload.observation.clockOriginRef='runtime-clock://foreign'],
  ['delayed opening',e=>e.payload.observation.elapsedMs=1],['negative elapsed',e=>e.payload.observation.elapsedMs=-1],
  ['future producer',e=>e.payload.observation.underlyingEventRef='event://future'],['wrong digest',e=>e.payload.observation.sourceDigest='sha256:'+'0'.repeat(64)],
  ['causation',e=>e.causationEventRefs=[]],['artifact promotion',e=>e.payload.observation.signal='artifact_admitted']];
 for(const [name,mutate]of controls){const changed=structuredClone(event);mutate(changed);assert.equal(owners.live.validateRuntimeLivenessEventAtPrefix(prefix,changed),false,name);}
 assert.equal(owners.live.projectRuntimeLivenessAtPrefix(prefix,opened.frameId),null,'historical opening creates no invented sample');
 await writeFile(join(proof,'join-falsifiers.json'),JSON.stringify({kind:'pure_relation_falsifiers_not_native_trace',controls:controls.map(([name])=>name),passed:true},null,2)+'\n');
});

test('exact current D4 descriptor and retained historical EC rows/projections are conserved',async()=>{
 assert.ok(process.env.ABI5_FRAME_BASELINE_ROOT);const before=await loadFrameOwners(process.env.ABI5_FRAME_BASELINE_ROOT),after=await loadFrameOwners(root);
 assert.deepEqual(after.events.ROOT_EVENT_CONTRACT_DESCRIPTOR,before.events.ROOT_EVENT_CONTRACT_DESCRIPTOR);
 assert.equal(after.events.ROOT_EVENT_CONTRACT_DIGEST,'sha256:3e8f2d4cb80c3c263c44fdadf6c23a46a5c510c3466f1f2cf31fe6016e01cc6a');
 const bytes=await readFile(process.env.ABI5_FRAME_HISTORY_PATH);assert.equal(sha(bytes),process.env.ABI5_FRAME_HISTORY_SHA256);
 const summaries=[];for(const count of [240,246,388]){
  const a=before.immutable.deepFreeze(before.events.validateHistoricalEvents(bytes).slice(0,count));
  const b=after.immutable.deepFreeze(after.events.validateHistoricalEvents(bytes).slice(0,count));
  const ap=before.prefix.selectValidatedRuntimeEventPrefix(a),bp=after.prefix.selectValidatedRuntimeEventPrefix(b);
  const ecBefore=before.calculus.deriveRuntimeEventCalculusProjection(ap),ecAfter=after.calculus.deriveRuntimeEventCalculusProjection(bp);
  assert.deepEqual(ecAfter,ecBefore,'all effect rows and held fluents');
  assert.deepEqual(after.replay.replayValidatedRuntimeEventPrefix(bp),before.replay.replayValidatedRuntimeEventPrefix(ap));
  summaries.push({count,eventCalculusDigest:sha(JSON.stringify(ecAfter))});
 }
 await writeFile(join(proof,'historical-equality.json'),JSON.stringify({descriptorEqual:true,d4:after.events.ROOT_EVENT_CONTRACT_DIGEST,summaries},null,2)+'\n');
});
