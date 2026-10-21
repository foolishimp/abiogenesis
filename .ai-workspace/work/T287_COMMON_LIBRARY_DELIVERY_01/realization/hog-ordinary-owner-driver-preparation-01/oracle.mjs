// Independent pre-execution expectations. No Product imports or owner algorithms.
import assert from 'node:assert/strict';

export const CASES = Object.freeze([
  {id:'compose-retry', selector:'COMPOSED_IDS', input:{kind:'data_input',schemaVersion:'5.0.0',subject:'  World  '},
    expected:{kind:'data_output',schemaVersion:'5.0.0',message:'World'}, disposition:'completed'},
  {id:'workflow-foldback', selector:'WORKFLOW_IDS', input:{kind:'data_input',schemaVersion:'5.0.0',subject:'World'},
    expected:{kind:'data_output',schemaVersion:'5.0.0',message:'World'}, disposition:'completed'},
  {id:'fanout-partial', selector:'FAN_OUT_IDS', input:{kind:'member_vector_input',schemaVersion:'5.0.0',members:[
    {ordinal:0,memberRef:'member://abi5-tests/0',value:{kind:'member_input',schemaVersion:'5.0.0',subject:'Ada',block:false}},
    {ordinal:1,memberRef:'member://abi5-tests/1',value:{kind:'member_input',schemaVersion:'5.0.0',subject:'Grace',block:true}},
    {ordinal:2,memberRef:'member://abi5-tests/2',value:{kind:'member_input',schemaVersion:'5.0.0',subject:'Margaret',block:false}},
  ]}, expected:null, disposition:'blocked'},
]);
const one = (rows,label) => { assert.equal(rows.length,1,label); return rows[0]; };
const ofKind = (events,kind) => events.filter(e=>e.kind===kind);

export function outcomeOracle({selected, ids, receipt, events, owners}) {
  assert.equal(receipt.kind,'definition_host_receipt');
  assert.equal(receipt.failure,null,JSON.stringify(receipt.failure));
  assert.equal(receipt.ownerOutput.outcomeKind,'result');
  const value=receipt.ownerOutput.value;
  assert.equal(value.disposition,selected.disposition);
  assert.ok(receipt.resources.run?.ref);
  assert.deepEqual(value.run,receipt.resources.run);
  assert.equal(events.some(e=>/actor_process|worker_transport|worker_attempt/u.test(e.kind)),false,'zero native lifecycle');
  assert.equal(events.some(e=>e.kind==='construction_intent_selected'),false);
  assert.ok(owners.routes.length>0);
  for(const r of owners.routes) assert.equal(r?.kind,'historical_traversal_route_projection');
  for(const f of owners.foldbacks) {
    assert.equal(f?.kind,'application_child_foldback_admission');
    const basis=one(ofKind(events,'basis_admitted').filter(e=>e.basisId===f.childExecutionBasisRef),'exact child basis');
    assert.equal(basis.payload.basisDigest,f.childExecutionBasisDigest);
    const result=one(ofKind(events,'c_call_result_admitted').filter(e=>e.payload.resultRef===f.childResultRef),'exact child result');
    assert.equal(result.graphCallId,f.childGraphCallId);assert.equal(result.payload.resultDigest,f.childResultDigest);
    const judgment=one(ofKind(events,'c_call_judged').filter(e=>e.payload.judgmentRef===f.childJudgmentRef),'exact child judgment');
    assert.equal(judgment.graphCallId,f.childGraphCallId);assert.equal(judgment.payload.resultRef,f.childResultRef);
    assert.ok(events.some(e=>e.eventId===f.childTerminalEventRef&&e.graphCallId===f.childGraphCallId));
    assert.ok(ofKind(events,'c_call_opened').some(e=>e.aggregateId===f.parentCCallRef));
    assert.ok(ofKind(events,'c_call_judged').some(e=>e.aggregateId===f.parentCCallRef&&e.payload.judgmentRef===f.parentJudgmentRef));
    if(f.childDisposition==='closed')assert.ok(ofKind(events,'terminal_reached').some(e=>e.graphCallId===f.childGraphCallId&&e.payload.closureRef===f.childClosureRef));
  }
  for(const f of owners.fanouts) assert.equal(f?.kind,'fan_out_completion_admission');
  const opened=ofKind(events,'graph_call_opened');
  const root=one(opened.filter(e=>e.graphFunctionRef===ids.graphFunctionRef),'one selected root');
  assert.equal(root.runId,value.run.ref);
  if(selected.disposition==='completed') {
    assert.deepEqual(value.terminalResult.value,selected.expected,'literal authored output');
    assert.deepEqual(value.result,value.terminalResult.result);
    assert.equal(ofKind(events,'run_closed').length,1);
  } else {
    assert.equal(value.result,null); assert.equal(value.terminalResult,null);
    assert.equal(ofKind(events,'run_closed').length,0,'no success Run closure');
  }
  if(selected.id==='compose-retry') {
    assert.deepEqual(opened.map(e=>e.graphFunctionRef),[ids.graphFunctionRef]);
    assert.equal(ofKind(events,'c_call_opened').length,6,'six authored deterministic leaves');
    const attempt=one(ofKind(events,'retry_attempt_opened'),'one declared first attempt');
    assert.equal(attempt.payload.attempt,1); assert.equal(attempt.payload.budget,2);
    assert.deepEqual(attempt.payload.retryPath,[1]);
    const progress=one(ofKind(events,'retry_progress_recorded'),'one completed progress');
    assert.equal(progress.payload.progressClass,'completed');
    assert.equal(progress.payload.attemptRef,attempt.payload.attemptRef);
    assert.equal(progress.payload.retryBoundaryRef,attempt.payload.retryBoundaryRef);
    assert.ok(progress.causationEventRefs.includes(attempt.eventId));
    const consumed=one(owners.routes.filter(r=>r.consumedAvailabilityRefs.includes(progress.payload.progressRef)),
      'actual projected route consumes exact completed retry progress');
    assert.ok(['advance','terminal'].includes(consumed.routeKind));
    assert.equal(consumed.runId,attempt.runId); assert.equal(consumed.frameId,attempt.frameId);
    assert.equal(consumed.cCallRef,progress.payload.cCallRef);
    assert.equal(consumed.judgmentRef,progress.payload.judgmentRef);
    assert.ok(consumed.admissionOrdinal>progress.admissionOrdinal);
  } else if(selected.id==='workflow-foldback') {
    assert.deepEqual(opened.map(e=>e.graphFunctionRef),[ids.graphFunctionRef,'graph-function://abi5-tests/structural/atomic@5']);
    const f=one(owners.foldbacks,'one actual child foldback');
    assert.equal(f.childDisposition,'closed'); assert.ok(f.childClosureRef); assert.equal(f.childReasonRef,null);
    assert.equal(f.childGraphCallId,opened[1].graphCallId);
    const childResult=one(ofKind(events,'c_call_result_admitted').filter(e=>e.payload.resultRef===f.childResultRef),'selected child result');
    assert.deepEqual(childResult.payload.value,value.terminalResult.value,'parent preserves child value');
    assert.ok(ofKind(events,'basis_admitted').some(e=>e.basisId===f.childExecutionBasisRef));
    assert.ok(ofKind(events,'c_call_opened').some(e=>e.aggregateId===f.parentCCallRef));
    assert.ok(events.some(e=>e.eventId===f.childTerminalEventRef));
    assert.ok(owners.routes.some(r=>r.cCallRef===f.parentCCallRef&&r.judgmentRef===f.parentJudgmentRef));
  } else {
    assert.deepEqual(opened.map(e=>e.graphFunctionRef),[ids.graphFunctionRef,ids.elementGraphFunctionRef,ids.elementGraphFunctionRef]);
    assert.equal(opened.some(e=>e.graphFunctionRef===ids.reducerGraphFunctionRef),false);
    const f=one(owners.fanouts,'one partial completion');
    assert.equal(f.completionKind,'partial_stop'); assert.equal(f.batchRef,ids.batchRef);
    assert.deepEqual(f.completedRows.map(r=>r.ordinal),[0]);
    assert.equal(f.stoppingRow.ordinal,1); assert.equal(f.stoppingRow.disposition,'blocked');
    assert.deepEqual(f.unstartedRows.map(r=>r.ordinal),[2]);
    assert.equal(Object.hasOwn(f,'outputVector'),false);
    assert.deepEqual(f.completedRows[0].value,{kind:'member_output',schemaVersion:'5.0.0',subject:'Ada',message:'Ada'});
    assert.equal(f.completedRows[0].inputMemberRef,selected.input.members[0].memberRef);
    assert.equal(f.stoppingRow.inputMemberRef,selected.input.members[1].memberRef);
    assert.equal(f.unstartedRows[0].inputMemberRef,selected.input.members[2].memberRef);
    assert.deepEqual(owners.foldbacks.map(x=>x.childDisposition),['closed','blocked']);
    assert.equal(f.completedRows[0].foldbackRef,owners.foldbacks[0].foldbackRef);
    assert.equal(f.stoppingRow.foldbackRef,owners.foldbacks[1].foldbackRef);
    const route=one(owners.routes.filter(r=>r.graphCallId===root.graphCallId&&r.routeKind==='blocked'),
      'actual root blocked route');
    assert.equal(route.cCallRef,f.stoppingRow.cCallRef); assert.equal(route.judgmentRef,f.stoppingRow.judgmentRef);
    assert.equal(route.targetCursorRef,null);
    assert.ok(route.consumedAvailabilityRefs.includes(f.applicationRef));
    assert.ok(route.consumedAvailabilityRefs.includes(f.stoppingRow.judgmentRef));
  }
  return {status:'satisfied',case:selected.id,disposition:value.disposition,nativeCalls:0,
    limit:selected.id==='compose-retry'?'one successful retry attempt; no failing/native retries':'selected deterministic authored relation only'};
}

export function readOracle({selected, startReceipt, memberKey, readReceipt, actualBefore, actualAfter}) {
  assert.equal(readReceipt.kind,'definition_host_receipt'); assert.equal(readReceipt.failure,null);
  assert.equal(readReceipt.ownerOutput.outcomeKind,'result');
  assert.deepEqual(readReceipt.resources.eventResource.closeHandoff.prefix,actualBefore.prefix,'actual returned input prefix conserved');
  assert.deepEqual(actualAfter.bytes,actualBefore.bytes,'fresh read appended no physical bytes');
  const projection=readReceipt.ownerOutput.value.projection;
  assert.deepEqual(projection.replay,startReceipt.resources.replay);
  assert.deepEqual(projection.terminalResult,startReceipt.ownerOutput.value.terminalResult);
  if(memberKey==='run_result') {
    assert.equal(selected.disposition,'completed','partial stop has no successful Result read');
    assert.deepEqual(projection.result,startReceipt.ownerOutput.value.result);
    assert.deepEqual(projection.terminalResult.value,selected.expected);
  } else assert.equal(projection.status,selected.disposition==='completed'?'closed':'blocked');
  return {status:'satisfied',memberKey,prefixConserved:true,physicalBytesConserved:true};
}
