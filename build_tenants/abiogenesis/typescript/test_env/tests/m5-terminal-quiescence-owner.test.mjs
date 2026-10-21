import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  projectActorProcessLifecycle,
} from "../../build/code/src/abg/actor_process.js";
import {
  projectCCallPhase,
} from "../../build/code/src/abg/c_call.js";
import {
  deriveRuntimeEventCalculusProjection,
  eventCalculusEffect,
  holdsAt,
  constructRuntimeFluent,
} from "../../build/code/src/abg/event_calculus.js";
import {
  selectValidatedRuntimeEventPrefix,
  selectOwnedRuntimeEventPrefix,
  readOwnedRuntimeEventPrefixAtDurablePrefix,
  runtimeEventPrefixExtent,
} from "../../build/code/src/abg/event_prefix.js";
import { createNewEmptyAppendSink, admitRuntimeEvent, admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  selectHeldEventStoreDurablePrefix } from '../../build/code/src/abg/event_store.js';
import { projectRuntimeActorProcessFactsAtPrefix } from "../../build/code/src/abg/replay.js";
import { sha256Canonical } from '../../build/code/src/shared/digests.js';
import { deepFreeze } from "../../build/code/src/shared/immutable.js";

function event(kind, ordinal, aggregateType, aggregateId, parentAggregateId, payload) {
  return Object.freeze({
    kind,
    eventTime: "2026-08-04T00:00:00.000Z",
    aggregateType,
    aggregateId,
    parentAggregateId,
    causationEventRefs: Object.freeze([]),
    correlationId: "correlation://t287/cleanup",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "basis://t287/cleanup",
    runId: "run://t287/cleanup",
    graphCallId: "graph-call://t287/cleanup",
    frameId: "frame://t287/cleanup",
    payload: Object.freeze(payload),
    eventId: `event://t287/cleanup/${ordinal}`,
    admissionOrdinal: ordinal,
    payloadDigest: `sha256:${"0".repeat(64)}`,
  });
}

function prefix(rows) {
  return selectValidatedRuntimeEventPrefix(Object.freeze(rows), {
    runId: "run://t287/cleanup",
  });
}

const actorRef = "actor-invocation://t287/cleanup";
const processRef = "process://t287/cleanup";
const cCallRef = "c-call:sha256:t287-atomic-open";

test("CCall opening is one atomic open-and-fibre transition", () => {
  const opened = event("c_call_opened", 1, "c_call", cCallRef, "frame://t287/cleanup", {
    cCallRef,
  });
  assert.throws(
    () => projectCCallPhase(prefix([opened]), cCallRef),
    /atomic open\/fibre pair/,
  );
  const fibre = Object.freeze({
    ...event("c_call_fibre_selected", 2, "c_call", cCallRef, "frame://t287/cleanup", {
      cCallRef,
    }),
    causationEventRefs: Object.freeze([opened.eventId]),
  });
  assert.equal(
    projectCCallPhase(prefix([opened, fibre]), cCallRef).phase,
    "selected_no_evidence",
  );
});

test("timeout and termination-unconfirmed never prove a started process absent", () => {
  const selected = prefix([
    event("actor_process_started", 1, "process", processRef, actorRef, {
      actorInvocationRef: actorRef,
      processRef,
    }),
    event("actor_process_timeout_observed", 2, "process", processRef, actorRef, {
      actorInvocationRef: actorRef,
      processRef,
    }),
    event("actor_process_termination_unconfirmed", 3, "process", processRef, actorRef, {
      actorInvocationRef: actorRef,
      processRef,
    }),
    event("run_stopped", 4, "run", "run://t287/cleanup", null, {}),
  ]);
  const calculus = deriveRuntimeEventCalculusProjection(selected);
  assert.equal(holdsAt(calculus, constructRuntimeFluent({
    name: "actor_process_live",
    identity: processRef,
  })), true);
  assert.deepEqual(projectActorProcessLifecycle(selected, actorRef), {
    kind: "actor_process_lifecycle_projection",
    actorInvocationRef: actorRef,
    processRef,
    processTerminalEventRef: null,
    processTerminalKind: null,
    actorTerminalEventRef: null,
    processLive: true,
    cleanupPending: true,
    terminationUnconfirmed: true,
    cleanupDisposition: "termination_unconfirmed",
  });
});

test("preterminal Process exit is the single cleanup confirmation", () => {
  const selected = prefix([
    event("actor_process_started", 1, "process", processRef, actorRef, {
      actorInvocationRef: actorRef,
      processRef,
    }),
    event("actor_process_exited", 2, "process", processRef, actorRef, {
      actorInvocationRef: actorRef,
      processRef,
    }),
  ]);
  const projected = projectActorProcessLifecycle(selected, actorRef);
  assert.equal(projected.processTerminalKind, "actor_process_exited");
  assert.equal(projected.processLive, false);
  assert.equal(projected.cleanupPending, true);
  assert.equal(projected.cleanupDisposition, "pending");
});

test("duplicate Process terminality and Actor terminal before confirmation fail closed", () => {
  assert.throws(() => projectActorProcessLifecycle(prefix([
    event("actor_process_started", 1, "process", processRef, actorRef, {}),
    event("actor_process_exited", 2, "process", processRef, actorRef, {}),
    event("actor_process_exited", 3, "process", processRef, actorRef, {}),
  ]), actorRef), /single terminal cardinality/);
  assert.throws(() => projectActorProcessLifecycle(prefix([
    event("actor_process_started", 1, "process", processRef, actorRef, {}),
    event("actor_invocation_failed", 2, "actor_invocation", actorRef, "c-call://t287", {}),
  ]), actorRef), /requires confirmed Process terminality/);
});

test('unconfirmed cleanup stays live until a genuine confirmed Process terminal, including cold replay', () => {
  const rows = [
    event('actor_invocation_started', 1, 'actor_invocation', actorRef, cCallRef, { actorInvocationRef: actorRef }),
    event('actor_process_started', 2, 'process', processRef, actorRef, { actorInvocationRef: actorRef, processRef }),
    event('actor_process_termination_unconfirmed', 3, 'process', processRef, actorRef, { actorInvocationRef: actorRef, processRef }),
    event('runtime_failure_observed', 4, 'run', 'run://t287/cleanup', null, {}),
  ];
  const assertCut = (values, confirmed, actorDone) => {
    const selected = prefix(deepFreeze(JSON.parse(JSON.stringify(values))));
    const calculus = deriveRuntimeEventCalculusProjection(selected);
    const projected = projectActorProcessLifecycle(selected, actorRef);
    assert.equal(projected.processLive, !confirmed);
    assert.equal(projected.terminationUnconfirmed, !confirmed);
    assert.equal(projected.cleanupPending, !actorDone);
    assert.equal(projectRuntimeActorProcessFactsAtPrefix(selected)[0].terminationConfirmed, confirmed);
    assert.equal(holdsAt(calculus, constructRuntimeFluent({ name: 'actor_process_live', identity: processRef })), !confirmed);
    assert.equal(holdsAt(calculus, constructRuntimeFluent({ name: 'actor_cleanup_live', identity: processRef })), !confirmed);
    assert.equal(holdsAt(calculus, constructRuntimeFluent({ name: 'actor_cleanup_pending', identity: processRef })), !actorDone);
    assert.equal(holdsAt(calculus, constructRuntimeFluent({ name: 'actor_process_termination_unconfirmed', identity: processRef })), true,
      'later physical confirmation does not erase the historical uncertainty fact');
  };
  assertCut(rows, false, false);
  // The owner admits this event only after owned-scope absence, not at raw child exit.
  rows.push(event('actor_process_exited', 5, 'process', processRef, actorRef,
    { actorInvocationRef: actorRef, processRef, status: 0, signal: null }));
  assertCut(rows, true, false);
  rows.push(event('actor_invocation_failed', 6, 'actor_invocation', actorRef, cCallRef,
    { actorInvocationRef: actorRef, processRef }));
  assertCut(rows, true, true);
});

test('owned actor selection preserves complete lifecycle truth across unrelated history and cold bytes',async()=>{
  // Genuine finite EventStore admissions, not a native process or Run proof.
  const scratch=await mkdtemp(join(process.env.ABI5_NATIVE_MATERIAL_SCRATCH??tmpdir(),'native-selected-'));
  const path=join(scratch,'events.jsonl'),acquired=createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});
  assert.ok('store'in acquired);
  try{
    admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,acquired.prefix,()=>{
      const admit=(kind,aggregateId,parentAggregateId,payload)=>admitRuntimeEvent(acquired.store,{
        kind,eventTime:'2026-10-10T00:00:00.000Z',aggregateType:'process',aggregateId,parentAggregateId,
        causationEventRefs:[],correlationId:'correlation://native-selected',workflowVersion:'5.0.0',scopeClass:'run',
        basisId:'basis://native-selected',runId:'run://t287/cleanup',graphCallId:'graph-call://t287/cleanup',frameId:'frame://t287/cleanup',payload});
      admit('actor_process_started',processRef,actorRef,{actorInvocationRef:actorRef,processRef,processId:17});
      admit('actor_process_started','process://foreign','actor-invocation://foreign',{actorInvocationRef:'actor-invocation://foreign',processRef:'process://foreign',processId:18});
      for(let i=0;i<128;i++)admitRuntimeEvent(acquired.store,{kind:'public_operation_admitted',eventTime:'2026-10-10T00:00:00.000Z',
        aggregateType:'workspace',aggregateId:'invocation://unrelated/'+i,parentAggregateId:null,causationEventRefs:[],
        correlationId:'correlation://unrelated/'+i,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://unrelated',
        payload:{invocationRef:'invocation://unrelated/'+i,invocationDigest:sha256Canonical(i),operationId:'abg.operation.project.read',variant:'status'}});
      admit('actor_process_termination_unconfirmed',processRef,actorRef,{actorInvocationRef:actorRef,processRef});
      admit('actor_process_exited',processRef,actorRef,{actorInvocationRef:actorRef,processRef,status:0,signal:null});
    });
    const owned=selectOwnedRuntimeEventPrefix(acquired.store),complete=selectValidatedRuntimeEventPrefix(acquired.store.readAll());
    const expected=projectActorProcessLifecycle(complete,actorRef);
    assert.equal(expected.processLive,false);assert.equal(expected.terminationUnconfirmed,false);assert.equal(expected.cleanupDisposition,'pending');
    assert.deepEqual(projectActorProcessLifecycle(owned,actorRef),expected);
    assert.equal(runtimeEventPrefixExtent(owned).count,132);assert.equal(Object.hasOwn(owned,'events'),false);
    assert.throws(()=>projectActorProcessLifecycle({...owned},actorRef),'copied private selection has no nominal owner');
    const coordinate=structuredClone(selectHeldEventStoreDurablePrefix(acquired.store));acquired.store.closeDurableLog();
    const cold=readOwnedRuntimeEventPrefixAtDurablePrefix(coordinate,{requireCurrent:true});
    assert.deepEqual(projectActorProcessLifecycle(cold,actorRef),expected,'cold selected bodies preserve later confirmed cleanup and its pending Actor obligation');
    const bytes=await readFile(path),changed=Buffer.from(bytes);changed[0]=91;await writeFile(path,changed);
    assert.throws(()=>readOwnedRuntimeEventPrefixAtDurablePrefix(coordinate,{requireCurrent:true}),e=>e.code==='prefix_digest_mismatch');
    await writeFile(path,bytes);
  }finally{acquired.store.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
});


test('unjoined process uncertainty preserves cleanup without claiming a native write scope', () => {
  const unknown = event('actor_process_termination_unconfirmed', 2, 'process', processRef, actorRef,
    { actorInvocationRef: actorRef, processRef });
  const effect = eventCalculusEffect(unknown, [event('actor_process_started', 1, 'process', processRef, actorRef,
    { actorInvocationRef: actorRef, processRef, processId: 17 })]);
  assert.deepEqual(effect.terminates, []);
  assert.deepEqual(effect.clips, []);
  assert.equal(effect.initiates.some(f => f.name === 'actor_cleanup_pending'), true);
});
