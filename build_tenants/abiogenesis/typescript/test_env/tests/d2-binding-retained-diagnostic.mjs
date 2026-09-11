// Read-only historical discriminator. No store is opened for append and no
// native invocation, actor, helper or application command is executed.
import assert from 'node:assert/strict';
import { readFileSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { selectValidatedRuntimeEventPrefix } from '../../build/code/src/abg/event_prefix.js';
import { projectWorksiteRevisionNativeResult,worksiteExecutionSourcesCurrent,worksiteRevisionEntryBindingDisposition } from '../../build/code/src/abg/worksite_revision.js';
import { constructSemanticRevisionSelectionGraphFunction } from '../../build/code/src/gtl/semantic_revision_publication.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';

const log=resolve(import.meta.dirname,'../../../../installed-continuation-09/installed-frame-01/events-01/runtime.events.jsonl');
const before=readFileSync(log),stat=lstatSync(log);
const digest=b=>createHash('sha256').update(b).digest('hex');
assert.equal(digest(before),'4f561ceacf40fd13db82132d93890cb67750453dfa81a75c0401f04bd9345649');
assert.equal(stat.dev,16777230);assert.equal(stat.ino,449590349);
const events=deepFreeze(before.toString().trimEnd().split('\n').map(JSON.parse));
assert.equal(events.length,846);
const prefix=selectValidatedRuntimeEventPrefix(events);
for(const ordinal of [191,719,769]){
  const result=events[ordinal-1],judgment=events.find(e=>e.kind==='c_call_judged'&&e.aggregateId===result.aggregateId);
  assert.equal(result.kind,'c_call_result_admitted');assert.ok(judgment);
  const coordinate={cCallRef:result.aggregateId,resultRef:result.payload.resultRef,resultDigest:result.payload.resultDigest,
    resultAdmissionEventRef:result.eventId,judgmentEventRef:judgment.eventId};
  const actual=projectWorksiteRevisionNativeResult(prefix,coordinate);
  assert.ok(actual,`actual native leaf ${ordinal}`);
  assert.equal(actual.result.resultDigest,result.payload.resultDigest);
  assert.equal(projectWorksiteRevisionNativeResult(prefix,{...coordinate,resultDigest:'sha256:'+'0'.repeat(64)}),null);
  console.log(JSON.stringify({ordinal,implementation:actual.cCall.implementationRef,resultClass:actual.result.resultClass,judgment:actual.judgment.judgment}));
}
const wrapper=events[198],judged=events.find(e=>e.kind==='c_call_judged'&&e.aggregateId===wrapper.aggregateId);
assert.equal(projectWorksiteRevisionNativeResult(prefix,{cCallRef:wrapper.aggregateId,resultRef:wrapper.payload.resultRef,
  resultDigest:wrapper.payload.resultDigest,resultAdmissionEventRef:wrapper.eventId,judgmentEventRef:judged.eventId}),null);
assert.equal(worksiteExecutionSourcesCurrent(prefix,events[768].payload.value.task),true,'actual old C1-to-C2 source/currentness arm remains valid');
const entry=events[834].payload,input=entry.rawInputValue,parent=projectWorksiteRevisionNativeResult(prefix,input.parent);
assert.ok(parent);
const graphFunction=constructSemanticRevisionSelectionGraphFunction({graphFunctionRef:entry.graphFunctionRef,
  lifecycleRef:parent.result.value.lifecycle.declarationRef,closureContractRef:entry.closureContractRef});
assert.equal(worksiteRevisionEntryBindingDisposition(prefix,graphFunction,input,parent.result.value.worksite.workspaceBinding),'covered',
  'current pure selected declaration consumes actual historical parent/cause; this is not its native admission');
assert.equal(digest(readFileSync(log)),digest(before));
assert.equal(lstatSync(log).ino,stat.ino);
console.log('Retained 846-event native coordinates and bytes conserved; three leaf joins and wrapper refusal passed. No new native evidence.');
