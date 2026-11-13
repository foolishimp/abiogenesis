import assert from 'node:assert/strict';
import { appendFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as Effect from '/private/tmp/abg-rc11-foundation-20261110-01/build_tenants/abiogenesis/typescript/node_modules/effect/dist/esm/Effect.js';
import * as Exit from '/private/tmp/abg-rc11-foundation-20261110-01/build_tenants/abiogenesis/typescript/node_modules/effect/dist/esm/Exit.js';
import * as Cause from '/private/tmp/abg-rc11-foundation-20261110-01/build_tenants/abiogenesis/typescript/node_modules/effect/dist/esm/Cause.js';
import * as Fiber from '/private/tmp/abg-rc11-foundation-20261110-01/build_tenants/abiogenesis/typescript/node_modules/effect/dist/esm/Fiber.js';
import * as Deferred from '/private/tmp/abg-rc11-foundation-20261110-01/build_tenants/abiogenesis/typescript/node_modules/effect/dist/esm/Deferred.js';
const out = fileURLToPath(new URL('.', import.meta.url));
class WorksiteLikeError extends Error {}
const rows = [];
const value = (v, row) => ({ type: v === null ? 'null' : typeof v,
  samePrimary: Object.is(v, row.primary), sameCleanup: Object.is(v, row.cleanup),
  description: v instanceof Error ? `${v.name}:${v.message}` : String(v) });
const causeView = (c, r) => c._tag === 'Fail' ? { tag: c._tag, value: value(c.error,r) }
  : c._tag === 'Die' ? { tag: c._tag, value: value(c.defect,r) }
  : c._tag === 'Sequential' || c._tag === 'Parallel' ? { tag:c._tag,left:causeView(c.left,r),right:causeView(c.right,r) }
  : { tag:c._tag };
const exitView = (e,r) => Exit.isSuccess(e) ? { tag:'Success', value:value(e.value,r) } : { tag:'Failure',cause:causeView(e.cause,r) };
const bodyScope = (use,row,capture) => Effect.scoped(Effect.gen(function*(){
  yield* Effect.addFinalizer(() => Effect.zipRight(Effect.sync(() => {row.order.push('cleanup');row.cleanupCount++;}), Effect.die(row.cleanup)));
  row.order.push('acquired');
  return yield* Effect.onExit(use, e => Effect.sync(() => { row.order.push('use-exit'); row.useExit=exitView(e,row);capture(e); }));
}));
// This local test pattern has one Scope and one library runner, no Product owner.
const selectedScope = (use,row) => Effect.uninterruptibleMask(restore => Effect.gen(function*(){
  let useExit;
  const closed = yield* Effect.exit(restore(bodyScope(use,row,e => {useExit=e;})));
  row.order.push('scope-closed');row.closedExit=exitView(closed,row);
  const selected = useExit !== undefined && Exit.isFailure(useExit) ? useExit : closed;
  row.selectedFrom = useExit !== undefined && Exit.isFailure(useExit) ? 'use' : 'closed';
  row.selectedExit=exitView(selected,row);row.order.push('selected');
  return yield* (Exit.isFailure(selected) ? Effect.failCause(selected.cause) : Effect.succeed(selected.value));
}));
const narrow = (program,row) => Effect.catchAll(program,e => {
  row.order.push('typed-catch');row.catchCount++;
  row.catchValue=value(e,row);
  return e instanceof WorksiteLikeError ? Effect.succeed('recovered-worksite-like') : Effect.fail(e);
});
const record = (row,checks) => {
  const result={name:row.name,order:row.order,cleanupCount:row.cleanupCount,catchCount:row.catchCount,
    useExit:row.useExit,closedExit:row.closedExit,selectedFrom:row.selectedFrom,selectedExit:row.selectedExit,
    finalExit:row.finalExit,catchValue:row.catchValue,checks};
  rows.push(result);appendFileSync(out+'OBSERVATIONS.jsonl',JSON.stringify(result)+'\n');
  return Object.values(checks).every(Boolean);
};
const newRow=(name,primary)=>({name,primary,cleanup:new Error('cleanup-'+name),order:[],cleanupCount:0,catchCount:0});
const program=Effect.gen(function*(){
  const mixed=newRow('mixed-cause-baseline',new WorksiteLikeError('primary-mixed'));
  const secondary=new Error('typed-secondary');
  const mixedCause=Cause.sequential(Cause.die(mixed.primary),Cause.fail(secondary));
  const mixedObservation={name:mixed.name,checks:{squashSelectsTypedSecondary:Object.is(Cause.squash(mixedCause),secondary),loneUndefinedPreserved:Object.is(Cause.squash(Cause.fail(undefined)),undefined)}};
  rows.push(mixedObservation);appendFileSync(out+'OBSERVATIONS.jsonl',JSON.stringify(mixedObservation)+'\n');
  const naive=newRow('naive-catchAll',new WorksiteLikeError('primary-naive'));
  const ne=yield* Effect.exit(narrow(bodyScope(Effect.fail(naive.primary),naive,()=>{}),naive));naive.finalExit=exitView(ne,naive);
  record(naive,{failed:Exit.isFailure(ne),typedCatchBypassed:naive.catchCount===0,cleanupRanOnce:naive.cleanupCount===1});
  for(const [name,primary,success] of [
    ['selected-worksite',new WorksiteLikeError('original-worksite'),false],
    ['selected-undefined',undefined,false],['selected-primitive','raw-primary',false],
    ['selected-success-cleanup',null,true]
  ]){
    const row=newRow(name,primary);const use=success?Effect.succeed('use-ok'):Effect.fail(primary);
    const e=yield* Effect.exit(narrow(selectedScope(use,row),row));row.finalExit=exitView(e,row);
    const checks={cleanupRanOnce:row.cleanupCount===1,selectionAfterCleanup:row.order.indexOf('selected')>row.order.indexOf('cleanup')};
    if(name==='selected-worksite'){checks.recovered=Exit.isSuccess(e)&&e.value==='recovered-worksite-like';checks.samePrimaryCaught=row.catchCount===1&&row.catchValue.samePrimary;checks.primarySelected=row.selectedFrom==='use';}
    else if(success){checks.cleanupFailed=Exit.isFailure(e)&&e.cause._tag==='Die'&&Object.is(e.cause.defect,row.cleanup);checks.noTypedCatch=row.catchCount===0;checks.closedSelected=row.selectedFrom==='closed';}
    else {checks.samePrimaryFailure=Exit.isFailure(e)&&e.cause._tag==='Fail'&&Object.is(e.cause.error,primary);checks.failurePresence=Exit.isFailure(e);checks.primarySelected=row.selectedFrom==='use';}
    if(!record(row,checks))return {halt:'first-pattern-failure',case:name};
  }
  const live=newRow('selected-live-interruption',undefined);const ready=yield* Deferred.make();
  const use=Effect.zipRight(Effect.sync(()=>live.order.push('body-live')),Effect.zipRight(Deferred.succeed(ready,undefined),Effect.never));
  const fiber=yield* Effect.fork(selectedScope(use,live));yield* Deferred.await(ready);live.order.push('interrupt-request');
  const e=yield* Fiber.interrupt(fiber);live.order.push('interrupt-return');live.finalExit=exitView(e,live);
  const ok=record(live,{failureRemains:Exit.isFailure(e),interruptionPreserved:Exit.isFailure(e)&&Cause.isInterruptedOnly(e.cause),cleanupRanOnce:live.cleanupCount===1,cleanupBeforeHandback:live.order.indexOf('cleanup')<live.order.indexOf('interrupt-return'),primarySelected:live.selectedFrom==='use',combinedCleanupFailureRetained:live.closedExit?.cause?.tag==='Sequential'});
  return {halt:ok?null:'interruption-pattern-failure'};
});
const final=await Effect.runPromiseExit(program);
const summary={kind:'Effect3.22.1 API-only single invocation',node:process.version,pid:process.pid,
  result:Exit.isSuccess(final)?final.value:{halt:'fixture-program-failure',cause:Cause.pretty(final.cause)},
  observations:rows,claimLimits:['No Product imports or implementation','No OS child or signal created by fixture','No D15 artifact, physical absence or installed proof credit']};
writeFileSync(out+'RESULT.json',JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({result:summary.result,cases:rows.length,allChecks:rows.every(r=>Object.values(r.checks).every(Boolean))}));
assert(Exit.isSuccess(final),'fixture program completed');
assert.equal(summary.result.halt,null,'local pattern passed without retry');
for(const row of rows)for(const [name,ok]of Object.entries(row.checks))assert.equal(ok,true,row.name+': '+name);
