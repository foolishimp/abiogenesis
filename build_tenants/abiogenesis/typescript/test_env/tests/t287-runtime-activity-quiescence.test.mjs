import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {ROOT_EVENT_CONTRACT_DIGEST} from '../../build/code/src/abg/event_store.js';
import {selectValidatedRuntimeEventPrefix} from '../../build/code/src/abg/event_prefix.js';
import {eventCalculusEffect} from '../../build/code/src/abg/event_calculus.js';
import {projectRunQuiescence} from '../../build/code/src/abg/replay.js';
test('retained activity is historical while live, blocked and unknown quiescence guards remain',async()=>{
const root=resolve(import.meta.dirname,'../..'),source=await readFile(join(root,'code/src/abg/replay.ts'),'utf8');
const groups=['RUN_QUIESCENCE_LIVE_OR_CONSUMABLE_FLUENTS','RUN_QUIESCENCE_ALLOWED_HISTORICAL_FLUENTS','RUN_QUIESCENCE_RUN_INDEPENDENT_FLUENTS'];
const sets=groups.map(name=>new Set([...source.match(new RegExp('const '+name+' = new Set\\(\\[([\\s\\S]*?)\\]\\);'))[1].matchAll(/"([^"]+)"/g)].map(m=>m[1])));
const observation={kind:'runtime_probe_observation',schemaVersion:'5.0.0',probeRef:'probe://classification/test',scopeDigest:sha256Canonical('classification-scope'),clockOriginRef:'clock://classification/test',elapsedMs:0,underlyingObservationRef:'event://classification/source',underlyingEventRef:'event://classification/source',sourceDigest:sha256Canonical('source'),sourceRevisionDigest:null,evidenceRefs:['event://classification/source'],coverage:'observed',signal:'activity'};
const active=eventCalculusEffect({kind:'runtime_activity_probe_observed',payload:{observation}}),blocked=eventCalculusEffect({kind:'runtime_external_interruption_observed',payload:{observation:{...observation,signal:'external_interruption'}}});
assert.ok(active.initiates.some(f=>f.name==='runtime_activity_recent'));assert.ok(active.initiates.some(f=>f.name==='runtime_invocation_active'));
assert.ok(blocked.initiates.some(f=>f.name==='runtime_invocation_blocked'));assert.ok(blocked.terminates.some(f=>f.name==='runtime_invocation_active'));
assert.ok(sets[1].has('runtime_activity_recent'));
for(const name of ['runtime_invocation_active','runtime_invocation_blocked','runtime_externally_interrupted']){assert.ok(!sets[1].has(name)&&!sets[2].has(name));}
// Complete current quiescence owner over small synthetic event-prefix inputs.
// These are classification unit cases, not admitted Run/profile evidence.
const runId='run://classification/unit',graphCallId='graph-call://classification/unit',frameId='frame://classification/unit';
function prefix(extra){const specs=[['run_segment_opened','run',runId,{}],['graph_call_opened','graph_call',graphCallId,{}],['frame_opened','frame',frameId,{}],['traversal_route_admitted','frame',frameId,{routeKind:'terminal',routeRef:'route://classification/unit',cCallRef:'call://classification/unit'}],...extra];
 const events=specs.map(([kind,aggregateType,aggregateId,payload],i)=>({kind,eventTime:'2026-09-14T00:00:00.000Z',aggregateType,aggregateId,parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://classification/unit',workflowVersion:'5.0.0',scopeClass:'run',basisId:'basis://classification/unit',runId,graphCallId,frameId,payload,eventId:'event://classification/'+(i+1),admissionOrdinal:i+1,payloadDigest:sha256Canonical(payload),eventContractDigest:ROOT_EVENT_CONTRACT_DIGEST}));return selectValidatedRuntimeEventPrefix(deepFreeze(events),{runId});}
const closedSpine=projectRunQuiescence(prefix([]));assert.equal(closedSpine.disposition,'quiescent_for_close');
const actor=projectRunQuiescence(prefix([['actor_invocation_started','actor_invocation','actor://classification/live',{}]]));assert.equal(actor.disposition,'non_quiescent');assert.ok(actor.blockingFluents.includes('actor_invocation_active(actor://classification/live)'));
const unknown=projectRunQuiescence(prefix([['assessed','frame',frameId,{assessmentRef:'assessment://classification/unconsumed'}]]));assert.equal(unknown.disposition,'non_quiescent');assert.ok(unknown.blockingFluents.some(f=>f.startsWith('result_assessment_admitted(')));
// External-block checks conserve the actual EC effect and source classifier;
// they do not claim an admitted interruption Run or resource-recovery proof.
});
