import assert from 'node:assert/strict';
export function assertScenario(row,started,events,input) {
 const all=kind=>events.filter(e=>e.kind===kind), calls=all('c_call_opened'), routes=all('traversal_route_admitted'), fibres=all('c_call_fibre_selected'), folds=all('child_foldback_admitted');
 const output=started.receipt.ownerOutput.value.terminalResult?.value;
 if(['nested-compose','graph-substitution','transparent-child','gate-advance'].includes(row.case)) assert.deepEqual(output,{kind:'hello_world_output',schemaVersion:'5.0.0',message:'Hello World'});
 switch(row.case) {
 case 'nested-compose':
  assert.equal(calls.length,6);assert.equal(all('graph_call_opened').length,1);assert.equal(all('frame_opened').length,1);assert.equal(all('c_call_result_admitted').length,6);assert.equal(all('c_call_judged').length,6);
  assert.deepEqual(routes.map(e=>e.payload.routeKind),['advance','advance','advance','advance','advance','retry','advance','advance','advance','terminal']);
  assert.deepEqual(calls.slice(1,3).map(e=>e.payload.taskOrdinal),[0,1]);
  assert.ok(calls.slice(1,3).every(e=>e.payload.batchRef==='batch://abiogenesis/conformance/hello-compose/checks@5'));
  assert.deepEqual(calls.slice(3).map(e=>e.payload.stageRole),['transform','evaluate','consequence']);
  assert.ok(all('retry_progress_recorded').some(e=>e.payload.progressClass==='completed')); break;
 case 'graph-substitution':
  assert.deepEqual(calls.map(e=>e.payload.programLocusRef),['locus://abiogenesis/conformance/hello-graph-edge/normalize@5','locus://abiogenesis/conformance/hello-substitute/normalized-pass@5','locus://abiogenesis/conformance/hello-graph-edge/render@5']);
  assert.equal(fibres.length,3);assert.equal(fibres[0].payload.compositionRef,fibres[2].payload.compositionRef);assert.notEqual(fibres[0].payload.compositionRef,fibres[1].payload.compositionRef);
  assert.deepEqual(routes.map(e=>e.payload.routeKind),['advance','advance','terminal']);break;
 case 'transparent-child':
  assert.equal(all('graph_call_opened').length,2);assert.equal(all('frame_opened').length,2);assert.equal(calls.length,2);assert.equal(folds.length,1);
  {const evidence=all('c_call_evidenced').filter(e=>e.payload.evidenceClass==='sub_traversal');assert.equal(evidence.length,1);assert.equal(folds[0].payload.parentCCallRef,evidence[0].payload.cCallRef);assert.ok(folds[0].causationEventRefs.includes(folds[0].payload.childTerminalEventRef));assert.ok(folds[0].admissionOrdinal<all('run_closed')[0].admissionOrdinal);} break;
 case 'gate-advance': case 'gate-block': {
  const evaluator=calls.find(e=>e.payload.stageRole==='evaluate');assert.ok(evaluator);
  const judgment=all('c_call_judged').find(e=>e.aggregateId===evaluator.aggregateId);assert.ok(judgment);
  const route=routes.find(e=>e.payload.cCallRef===evaluator.aggregateId);assert.ok(route);
  assert.equal(judgment.payload.judgment,row.case==='gate-advance'?'advance':'blocked');assert.equal(route.payload.routeKind,judgment.payload.judgment);assert.ok(route.causationEventRefs.includes(judgment.eventId));
  assert.equal(all('graph_call_opened').filter(e=>e.graphFunctionRef==='graph-function://abiogenesis/conformance/hello-gate-target@5').length,row.case==='gate-advance'?1:0); break; }
 case 'recursive-foldback': case 'recursive-child-block': case 'recursive-bound': {
  const parent=calls.filter(e=>e.graphFunctionRef===row.graphFunctionRef), child=all('graph_call_opened').filter(e=>e.graphFunctionRef==='graph-function://abiogenesis/conformance/bounded-recursion-step@5');
  if(row.case==='recursive-child-block') {const f=folds.find(e=>e.payload.childDisposition==='blocked');assert.ok(f);assert.ok(routes.some(e=>e.graphFunctionRef===row.graphFunctionRef&&e.payload.routeKind==='blocked'&&e.payload.consumedAvailabilityRefs.includes(f.payload.foldbackRef)));}
  else {assert.deepEqual(parent.map(e=>e.payload.attempt),[1,2,3,4]);assert.equal(child.length,3);}
  if(row.case==='recursive-foldback') {assert.deepEqual(output,{...input,remaining:0,terminal:true,trace:[2,1,0]});assert.equal(folds.length,3);
   for(const f of folds) {const rs=routes.filter(e=>e.payload.consumedAvailabilityRefs.includes(f.payload.foldbackRef));assert.equal(rs.length,1);assert.ok(rs[0].causationEventRefs.includes(f.eventId));assert.ok(rs[0].admissionOrdinal>f.admissionOrdinal);const terminal=events.find(e=>e.eventId===f.payload.childTerminalEventRef);assert.ok(terminal&&terminal.admissionOrdinal<f.admissionOrdinal);}}
  if(row.case==='recursive-bound') assert.ok(routes.some(e=>e.payload.routeKind==='blocked'&&e.payload.declarationRef?.startsWith('graph-function-application://'))); break; }
 case 'ordered-vector': case 'partial-vector': {
  const completion=all('fan_out_completion_admitted');assert.equal(completion.length,1);const p=completion[0].payload;
  const reducer=all('graph_call_opened').filter(e=>e.graphFunctionRef==='graph-function://abiogenesis/conformance/fan-out-hello-reducer@5');
  if(row.case==='ordered-vector') {assert.equal(p.completionKind,'complete_vector');assert.deepEqual(p.taskRows.map(r=>r.inputMemberRef),input.members.map(m=>m.memberRef));assert.deepEqual(p.outputVector.members.map(m=>m.ordinal),[0,1,2]);assert.equal(reducer.length,1);assert.ok(reducer[0].admissionOrdinal>completion[0].admissionOrdinal);assert.deepEqual(output,{kind:'fan_out_hello_summary',schemaVersion:'5.0.0',count:3,messages:['Hello Alpha','Hello Beta','Hello Gamma']});}
  else {assert.equal(p.completionKind,'partial_stop');assert.deepEqual(p.completedRows.map(r=>r.ordinal),[0]);assert.equal(p.stoppingRow.ordinal,1);assert.deepEqual(p.unstartedRows.map(r=>r.ordinal),[2]);assert.equal(reducer.length,0);assert.equal(Object.hasOwn(p,'outputVector'),false);}break; }
 default: throw Error('unselected scenario '+row.case);
 }
}
