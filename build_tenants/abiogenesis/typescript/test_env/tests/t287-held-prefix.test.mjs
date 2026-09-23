// HELD-PREFIX01: real disposable owner reads plus exact HoG call-site checks.
// HoG admission/child receipts below are explicit component assumptions;
// this test does not mint an installed Run or claim qualification.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {syncBuiltinESMExports} from 'node:module';
import * as Effect from 'effect/Effect';
import * as store from '../../build/code/src/abg/event_store.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {projectRunTruthAtDurablePrefix,prepareRunReadAtDurablePrefix} from '../../build/code/src/abg/project_read_ports.js';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
const fixture=process.env.ABI5_HELD_PREFIX_NATIVE_FIXTURE;
const options={skip:!fixture};
const clone=x=>structuredClone(x);
const resign=x=>{const {coordinateDigest,...body}=x;return {...body,coordinateDigest:sha256Canonical(body)};};
async function observe(action){const old=fs.readSync;let reads=0,bytes=0;fs.readSync=(...args)=>{const n=old(...args);reads++;bytes+=n;return n;};syncBuiltinESMExports();try{return {value:await action(),reads,bytes};}finally{fs.readSync=old;syncBuiltinESMExports();}}
function realOwner(t){
  assert(fixture,'explicit retained native fixture directory is required');
  const metadata=JSON.parse(fs.readFileSync(path.join(fixture,'source.json'),'utf8'));
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'abi5-held-prefix-'));
  const file=path.join(dir,'events.jsonl');fs.copyFileSync(path.join(fixture,'native-hello-prefix.jsonl'),file);
  const stat=fs.statSync(file),p=metadata.capturedPrefix;
  const body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath:file,device:stat.dev,inode:stat.ino,
    eventLogDigest:p.prefixDigest,durableByteLength:p.prefixLength,eventContractDigest:p.storeIdentity.eventContractDigest};
  const opened=store.reopenEventStore({...body,authorityDigest:sha256Canonical(body)});
  assert.equal(opened.kind,'reopened_event_store_context',JSON.stringify(opened));
  t.after(()=>{opened.store.closeDurableLog();fs.rmSync(dir,{recursive:true,force:true});});
  const events=store.readRuntimeEventsAtDurablePrefix(opened.prefix);
  return {...opened,events,runId:events.find(e=>e.kind==='run_segment_opened').runId};
}
function values(prefix,run){return {truth:projectRunTruthAtDurablePrefix(prefix,run),
  read:prepareRunReadAtDurablePrefix(prefix,'run_result',run)?.project(),
  replay:prepareRunReadAtDurablePrefix(prefix,'run_replay',run)?.project()};}
test('held Run truth/result/replay equal copied and closed-owner cold projections without history reads',options,async t=>{
  const a=realOwner(t),warm=await observe(()=>values(a.prefix,a.runId));
  assert.equal(warm.value.truth.kind,'abg_run_truth_projection');assert.equal(warm.value.truth.runtimeStatus,'closed');
  assert.equal(warm.value.read.kind,'abg_project_read_projection');assert.equal(warm.value.replay.kind,'abg_project_read_projection');
  assert.equal(warm.reads,0);
  const copied=await observe(()=>values(clone(a.prefix),a.runId));assert.deepEqual(copied.value,warm.value);assert(copied.bytes>0);
  a.store.projectReopenAuthorityAndClose();const closed=await observe(()=>values(a.prefix,a.runId));
  assert.deepEqual(closed.value,warm.value);assert(closed.bytes>0);
  t.diagnostic(JSON.stringify({warmReads:warm.reads,copiedReads:copied.reads,copiedBytes:copied.bytes,closedReads:closed.reads,closedBytes:closed.bytes}));
});
test('only exact known cuts reuse held history; copied, foreign, forward and wrong coordinates retain authentication',options,async t=>{
  const a=realOwner(t),old=store.durableRuntimeEventPrefixThroughEvent(a.prefix,a.events.at(-2).eventId);
  const selected=await observe(()=>store.reidentifyHistoricalDurablePrefixCoordinate(a.prefix,clone(old)));
  assert.equal(selected.reads,0);assert.deepEqual(selected.value,old);
  const read=await observe(()=>store.readRuntimeEventsAtDurablePrefix(selected.value));assert.equal(read.reads,0);assert.equal(read.value.length,a.events.length-1);
  assert.throws(()=>store.readRuntimeEventsAtDurablePrefix(old,{requireCurrent:true}),/current|length|prefix/);
  const copied=await observe(()=>store.reidentifyHistoricalDurablePrefixCoordinate(clone(a.prefix),clone(old)));assert(copied.bytes>0);assert.deepEqual(copied.value,old);
  for(const changed of [resign({...old,prefixDigest:'sha256:'+'0'.repeat(64)}),
      resign({...old,storeIdentity:{...old.storeIdentity,inode:old.storeIdentity.inode+1}}),
      resign({...a.prefix,prefixLength:a.prefix.prefixLength+1})]){
    assert.throws(()=>store.reidentifyHistoricalDurablePrefixCoordinate(a.prefix,changed));
    assert.equal(projectRunTruthAtDurablePrefix(changed,a.runId).kind,'abg_run_truth_refusal');
    assert.equal(prepareRunReadAtDurablePrefix(changed,'run_result',a.runId),null);
  }
  t.diagnostic(JSON.stringify({ownedCutReads:selected.reads,copiedOwnerReads:copied.reads,copiedOwnerBytes:copied.bytes}));
});
test('cold reopen preserves pre-acquisition cuts for ancestry and real R10 projections',options,async t=>{
  const a=realOwner(t),prior=store.durableRuntimeEventPrefixThroughEvent(a.prefix,a.events.at(-2).eventId);
  const expected=values(prior,a.runId),closed=a.store.projectReopenAuthorityAndClose();
  const acquired=await observe(()=>store.reopenEventStore(clone(closed.reopenAuthority)));
  const b=acquired.value;assert.equal(b.kind,'reopened_event_store_context');assert(acquired.bytes>0);
  t.after(()=>b.store.closeDurableLog());
  const warm=await observe(()=>{
    assert(store.authenticateRuntimePrefixAncestry(clone(prior),b.prefix));
    const historical=store.reidentifyHistoricalDurablePrefixCoordinate(b.prefix,clone(prior));
    assert.deepEqual(historical,prior);
    assert.throws(()=>store.readRuntimeEventsAtDurablePrefix(historical,{requireCurrent:true}),/current|length|prefix/);
    return values(historical,a.runId);
  });
  assert.deepEqual(warm.value,expected);assert.equal(warm.reads,0,'cold acquisition already authenticated the prior physical rows');
  for(const changed of [resign({...prior,prefixDigest:'sha256:'+'0'.repeat(64)}),
      resign({...prior,prefixLength:prior.prefixLength-1}),
      resign({...prior,storeIdentity:{...prior.storeIdentity,eventContractDigest:store.ROOT_EVENT_CONTRACT_DIGEST}}),
      resign({...prior,storeIdentity:{...prior.storeIdentity,inode:prior.storeIdentity.inode+1}})]){
    assert.equal(store.authenticateRuntimePrefixAncestry(changed,b.prefix),false);
    assert.throws(()=>store.readRuntimeEventsAtDurablePrefix(store.reidentifyHistoricalDurablePrefixCoordinate(b.prefix,changed)));
  }
  const copied=await observe(()=>values(store.reidentifyHistoricalDurablePrefixCoordinate(clone(b.prefix),clone(prior)),a.runId));
  assert.deepEqual(copied.value,expected);assert(copied.bytes>0);
  b.store.projectReopenAuthorityAndClose();
  const cold=await observe(()=>values(store.reidentifyHistoricalDurablePrefixCoordinate(b.prefix,clone(prior)),a.runId));
  assert.deepEqual(cold.value,expected);assert(cold.bytes>0);
  t.diagnostic(JSON.stringify({acquisitionReads:acquired.reads,acquisitionBytes:acquired.bytes,historicalReads:warm.reads,
    copiedReads:copied.reads,closedReads:cold.reads,limit:'Real retained Hello history copied into a disposable owner; actual ancestry and R10 truth/result/replay, no installed Run.'}));
});
for(const mode of ['leaf','workflow']) test(`ordinary ${mode} judgment receives exact Result successor; cold and held candidates agree`,options,async t=>{
  const a=realOwner(t),prior=store.durableRuntimeEventPrefixThroughEvent(a.prefix,a.events.at(-2).eventId);
  const cCall={cCallRef:'c-call://component',judgmentPredicateRef:'predicate://component',judgmentContractRef:'contract://judgment'};
  const result={resultRef:'result://component',resultDigest:sha256Canonical({answer:7}),value:{answer:7}},input={request:7};
  const replayState={replayDigest:sha256Canonical('replay')},sentinel=Error('judgment admission boundary');
  let captured,evaluatedPrefix;
  const relation={predicateRef:cCall.judgmentPredicateRef,advanceReasonRef:'reason://advance',rejectionReasonRef:'reason://refuse',
    evaluate:(i,o,p)=>{evaluatedPrefix=p;assert.deepEqual(i,input);assert.deepEqual(o,result.value);return store.readRuntimeEventsAtDurablePrefix(p).length===a.events.length;}};
  let successor=a.prefix;
  const port={contractValueKind:()=> 'fixture',resolveJudgmentRelation:()=>relation,
    invoke:async()=>({candidate:{disposition:'success',resultCandidate:result.value}})};
  const overrides={'../abg/index.js':{
    selectAdmittedImplementationResolution:()=>({implementationRef:'implementation://component'}),
    openCCall:()=>({kind:'c_call_admission',cCall,successorPrefix:prior}),
    admitCCallResult:()=>({disposition:'result',cCall,result,replayState,successorPrefix:successor}),
    admitCCallJudgment:args=>{captured=args.candidate;throw sentinel;}}};
  let invoke;
  if(mode==='leaf'){
    const owner=await privateOwner('hog/ccall_lifecycle.js',[],overrides);
    invoke=async()=>{await assert.rejects(Effect.runPromise(owner.evaluateExecutableCCall({graph:{graphFunctionRef:'gf://component'},
      graphFunction:{template:{nodes:[]}},stop:{cursor:{inputDigest:sha256Canonical(input)},computeRegime:'F_D'},
      input,leafPort:port,clock:{correlationId:'component'},ordinal:1,predecessorPrefix:prior})),/judgment admission boundary/);};
  }else{
    overrides['../abg/c_call.js']={resolveWorkflowFailureContract:()=> 'contract://failure',
      prepareWorkflowChildFoldback:()=>({intent:null,admit:()=>({kind:'child_foldback_admission',successorPrefix:prior})})};
    const owner=await privateOwner('hog/workflow_lifecycle.js',[],overrides);
    invoke=()=>assert.throws(()=>owner.completeWorkflowLocus({authority:{leafPort:port,correlationId:'component'},
      parentCCall:cCall,cursor:{inputDigest:sha256Canonical(input)},workflowTerm:{outputCarrierRef:'contract://output'},value:input,ordinal:1},
      {disposition:'closed',resultRef:'result://child',judgmentRef:'judgment://child',resultValue:result.value,closureRef:'closure://child',successorPrefix:prior}),e=>e===sentinel);
  }
  const warm=await observe(invoke);assert.strictEqual(evaluatedPrefix,a.prefix);assert.equal(captured.judgment,'advance');assert.equal(warm.reads,0);
  const candidate=clone(captured);successor=clone(a.prefix);const cold=await observe(invoke);
  assert.strictEqual(evaluatedPrefix,successor);assert.deepEqual(captured,candidate);assert(cold.bytes>0);
  successor=resign({...a.prefix,prefixDigest:'sha256:'+'0'.repeat(64)});await invoke();assert.equal(captured.judgment,'blocked');
  assert.equal(captured.reasonRef,'diagnostic://abiogenesis/hog/judgment-evaluation-exception@5');
  t.diagnostic(JSON.stringify({warmReads:warm.reads,coldReads:cold.reads,coldBytes:cold.bytes}));
});
