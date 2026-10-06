import assert from 'node:assert/strict';
// Data input is supported run_gaps OwnerOutput only; no event, oracle or fixture import.
export function renderPublicGapHandoff(output){
 assert.equal(output.outcomeKind,'result');assert.equal(output.value.caseKey,'run_gaps');
 const projection=output.value.projection;assert.equal(projection.kind,'run_gap_projection');
 return projection.frontiers.map(frontier=>{
  const explanation=frontier.basis.value.gapProjection.handoff;
  assert.equal(typeof explanation,'string');assert.ok(explanation.length>0);
  const obligations=frontier.nextAction.value.targetObligationRefs;
  assert.ok(Array.isArray(obligations)&&obligations.length>0);
  return `Run ${frontier.run.ref}: ${explanation}\nUnfulfilled obligation: ${obligations.join(', ')}\nAdmitted gap: ${frontier.nextAction.value.projectionRef}\n`;
 }).join('\n');
}

