// HELD-PREFIX01: real disposable owner reads plus exact HoG call-site checks.
// HoG admission/child receipts below are explicit component assumptions;
// this test does not mint an installed Run or claim qualification.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {syncBuiltinESMExports} from 'node:module';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import * as Effect from 'effect/Effect';
import * as store from '../../build/code/src/abg/event_store.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {projectRunTruthAtDurablePrefix,prepareRunReadAtDurablePrefix} from '../../build/code/src/abg/project_read_ports.js';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
import * as prefixes from '../../build/code/src/abg/event_prefix.js';
import * as replay from '../../build/code/src/abg/replay.js';
import * as ccall from '../../build/code/src/abg/c_call.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import {constructTraversalCursorCandidate,hasAdmittedTraversalCursorAtPrefix} from '../../build/code/src/abg/traversal_cursor.js';
import {proposeJudgmentCandidate} from '../../build/code/src/hog/judgment.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {canonicalJson} from '../../build/code/src/shared/canonical_json.js';
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

const judgmentFixture=process.env.ABI5_OWNED_JUDGMENT_FIXTURE;
async function observedOutcomeOwner(emitted,counts){
 const root=path.resolve(import.meta.dirname,'../..'),built=path.join(root,'build/code/src/abg/c_call_outcome.js');
 const preimage=emitted?process.env.ABI5_OWNED_OUTCOME_PREIMAGE:undefined;
 const text=fs.readFileSync(preimage??(emitted?built:path.join(root,'code/src/abg/c_call_outcome.ts')),'utf8');
 const module=new SourceTextModule(emitted&&preimage===undefined?text:ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText,{identifier:built});
 await module.link(async specifier=>{
  const url=specifier.startsWith('.')?pathToFileURL(path.resolve(path.dirname(built),specifier)).href:specifier;
  const values={...await import(url)};
  if(specifier==='../shared/digests.js')values.sha256Canonical=(value)=>{
   if(value?.kind==='validated_runtime_event_prefix')counts.wholePrefixHashes.push(value.events.length);
   return sha256Canonical(value);
  };
  if(specifier==='./event_prefix.js')values.runtimeEventPrefixDigest=value=>{
   counts.ownedPrefixDigests++;return prefixes.runtimeEventPrefixDigest(value);
  };
  return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});
 });await module.evaluate();return module.namespace;
}

function judgmentOwnerFixture(t,name){
 const file=path.join(judgmentFixture,'fixture/events/events.jsonl'),stat=fs.statSync(file);
 assert(stat.size<=3_000_000,'bounded retained fixture only; never the original workspace');
 const bytes=fs.readFileSync(file),input=JSON.parse(fs.readFileSync(path.join(judgmentFixture,'fresh-read-input.json'),'utf8'));
 assert.equal('sha256:'+createHash('sha256').update(bytes).digest('hex'),input.closeHandoff.prefix.prefixDigest);
 const lines=bytes.toString('utf8').trimEnd().split('\n'),all=lines.map(JSON.parse);
 const judgmentIndex=all.findIndex(e=>e.kind==='c_call_judged');assert(judgmentIndex>0);
 const seed=Buffer.from(lines.slice(0,judgmentIndex).join('\n')+'\n');
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'abi5-judgment-'+name+'-')),eventLogPath=path.join(scratch,'events.jsonl');
 fs.writeFileSync(eventLogPath,seed,{flag:'wx'});
 const s=fs.statSync(eventLogPath),body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath,
  device:s.dev,inode:s.ino,eventLogDigest:'sha256:'+createHash('sha256').update(seed).digest('hex'),durableByteLength:seed.length,
  eventContractDigest:input.closeHandoff.prefix.storeIdentity.eventContractDigest};
 const acquired=store.reopenEventStore({...body,authorityDigest:sha256Canonical(body)});
 assert.equal(acquired.kind,'reopened_event_store_context');
 t.after(()=>{acquired.store.closeDurableLog();fs.rmSync(scratch,{recursive:true,force:true});});
 const events=store.readRuntimeEventsAtDurablePrefix(acquired.prefix),basis=events.find(e=>e.kind==='basis_admitted').payload;
 const products=events[0].payload.resolvedLock.rows.filter(row=>row.packageName==='@abiogenesis/typescript-tenant');
 assert.equal(products.length,1);const product=products[0];
 const publication=gtl.constructHelloWorldModulePublication({...product,productManifestDigest:product.manifestDigest});
 const graphFunction=publication.graphFunctions.find(value=>value.name===basis.graphFunctionRef);assert(graphFunction);
 const graph=gtl.materializeGraph(graphFunction,{invocationAdmissionRef:basis.invocationAdmissionRef,
  admittedInputRef:basis.rawInputAdmissionRef,admittedInputDigest:basis.rawInputDigest,admittedInput:basis.rawInputValue});
 assert.equal(graph.materializationDigest,basis.graphDigest);
 const truth=replay.projectRuntimeTruthAtDurablePrefix(acquired.prefix,events.find(e=>e.kind==='run_segment_opened').runId);
 const resultEvent=events.find(e=>e.kind==='c_call_result_admitted');
 const cCall=ccall.projectOpenedCCallCarrierAtPrefix(truth.authorityPrefix,graph,resultEvent.payload.cCallRef);assert(cCall);
 const result=ccall.projectAdmittedCCallResultAtPrefix(truth.authorityPrefix,cCall,deepFreeze({
  kind:'admitted_c_call_result',schemaVersion:'5.0.0',disposition:'admitted',...resultEvent.payload,admissionEventRef:resultEvent.eventId}));assert(result);
 const ce=events.find(e=>e.kind==='traversal_cursor_entered'),cp=ce.payload;
 const cursor=constructTraversalCursorCandidate({programRef:cp.programRef,executionBasisRef:cp.executionBasisRef,
  traversalScopeRef:cp.traversalScopeRef,runId:ce.runId,graphCallId:ce.graphCallId,frameId:ce.frameId,
  graphRef:cp.materializationRef,inputRef:cp.inputRef,inputDigest:cp.inputDigest,currentNodeRef:cp.termPath[1],
  position:'at_term',termPath:cp.termPath,taskOrdinal:cp.taskOrdinal,attempt:cp.attempt,retryPath:cp.retryPath});
 assert.equal(cursor.cursorDigest,cp.cursorDigest);assert(hasAdmittedTraversalCursorAtPrefix(truth.authorityPrefix,cursor));
 const outcome=deepFreeze({kind:'admitted_c_call_outcome',schemaVersion:'5.0.0',disposition:'result',cCall,result,
  runtimePrefix:truth.runtimePrefix,replayState:truth.replayState,successorPrefix:acquired.prefix});
 const started=performance.now(),candidate=proposeJudgmentCandidate({cCall,result,replayState:truth.replayState,
  contractRef:cCall.judgmentContractRef,currentOwnerPrefix:acquired.prefix,decision:{decisionClass:'evaluate',input:basis.rawInputValue,
   relation:{predicateRef:cCall.judgmentPredicateRef,advanceReasonRef:'reason://abiogenesis/conformance/hello-world-satisfied@5',
    rejectionReasonRef:'reason://abiogenesis/conformance/hello-world-rejected@5',evaluate:gtl.evaluateHelloWorldResult}}});
 assert.equal(candidate.judgment,'advance');
 const judgmentProposalMs=performance.now()-started;
 return {...acquired,events,seed,graph,graphFunction,cursor,outcome,candidate,judgmentProposalMs,
  basis:{eventTime:'2026-09-24T00:00:00.000Z',correlationId:'correlation://owned-judgment',causationEventRefs:[]}};
}

test('owned result-to-judgment conserves semantic digests without canonicalizing either complete prefix',{skip:!judgmentFixture},async t=>{
 const beforeCounts={wholePrefixHashes:[],ownedPrefixDigests:0},afterCounts={wholePrefixHashes:[],ownedPrefixDigests:0};
 const before=await observedOutcomeOwner(true,beforeCounts),after=await observedOutcomeOwner(false,afterCounts);
 const a=judgmentOwnerFixture(t,'before'),b=judgmentOwnerFixture(t,'after');
 const refused=(outcome,expression)=>{
  const bytes=fs.readFileSync(new URL(b.prefix.eventLogRef));
  assert.throws(()=>after.admitCCallJudgment({...b,outcome}),expression);
  assert.deepEqual(fs.readFileSync(new URL(b.prefix.eventLogRef)),bytes);
 };
 refused({...b.outcome,runtimePrefix:{...b.outcome.runtimePrefix}},/nominal validated/);
 refused({...b.outcome,runtimePrefix:structuredClone(b.outcome.runtimePrefix)},/nominal validated/);
 const changedPrefix=prefixes.selectRuntimeEventPrefixFromAuthority(
  prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(structuredClone(b.events.slice(0,-1)))),{runId:b.outcome.cCall.runId});
 refused({...b.outcome,runtimePrefix:changedPrefix},/differs from its durable prefix/);
 refused({...b.outcome,successorPrefix:a.prefix},/prefix|store|owner|identity/i);
 refused({...b.outcome,replayState:{...b.outcome.replayState,replayDigest:sha256Canonical('changed')}},/digest|replay|prefix/i);
 beforeCounts.wholePrefixHashes=[];beforeCounts.ownedPrefixDigests=0;
 afterCounts.wholePrefixHashes=[];afterCounts.ownedPrefixDigests=0;
 const phase=async owner=>{const start=performance.now(),heapBefore=process.memoryUsage().heapUsed;
  const measured=await observe(owner);return {...measured,elapsedMs:performance.now()-start,heapBefore,heapAfter:process.memoryUsage().heapUsed};};
 const old=await phase(()=>before.admitCCallJudgment(a));
 // Copied raw event data is usable only after the existing prefix owner genuinely
 // admits it again. It is neither a retained receipt nor a claimed digest.
 const admittedCopy=prefixes.selectRuntimeEventPrefixFromAuthority(
  prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(structuredClone(b.events))),{runId:b.outcome.cCall.runId});
 assert.equal(prefixes.runtimeEventPrefixDigest(admittedCopy),prefixes.runtimeEventPrefixDigest(b.outcome.runtimePrefix));
 const current=await phase(()=>after.admitCCallJudgment(b));
 assert.equal(old.value.disposition,'judged');assert.equal(current.value.disposition,'judged');
 assert.equal(current.value.admitted.result.resultDigest,old.value.admitted.result.resultDigest);
 assert.equal(current.value.admitted.judgment.judgmentDigest,old.value.admitted.judgment.judgmentDigest);
 assert.equal(b.candidate.candidateDigest,a.candidate.candidateDigest);
 if(process.env.ABI5_OWNED_OUTCOME_PREIMAGE)assert.deepEqual(beforeCounts.wholePrefixHashes,
  [a.outcome.runtimePrefix.events.length,a.outcome.runtimePrefix.events.length]);
 assert.deepEqual(afterCounts.wholePrefixHashes,[]);assert.equal(afterCounts.ownedPrefixDigests,2);
 assert.equal(old.reads,0);assert.equal(current.reads,0);
 for(const [f,result]of [[a,old.value],[b,current.value]]){
  assert.equal(prefixes.runtimeEventPrefixDigest(result.runtimePrefix),sha256Canonical(result.runtimePrefix.events));
  assert.equal(replay.projectRuntimeTruthAtDurablePrefix(result.successorPrefix,result.admitted.cCall.runId).replayState.replayDigest,result.replayState.replayDigest);
  assert.equal(f.store.readAll().filter(e=>e.kind==='c_call_judged').length,1);
  const bytes=fs.readFileSync(new URL(result.successorPrefix.eventLogRef));
  assert.throws(()=>after.admitCCallJudgment(f),/current|prefix|predecessor/i);
  assert.deepEqual(fs.readFileSync(new URL(result.successorPrefix.eventLogRef)),bytes);
  const close=f.store.projectReopenAuthorityAndClose();assert.equal(close.prefix.coordinateDigest,result.successorPrefix.coordinateDigest);
 }
 const row={kind:'owned_result_judgment_conservation',fixtureBytes:a.seed.length,fixtureEvents:a.events.length,
  selectedRunEvents:a.outcome.runtimePrefix.events.length,previousWholePrefixBytes:Buffer.byteLength(canonicalJson(a.outcome.runtimePrefix)),
  before:beforeCounts,after:afterCounts,proposalMs:[a.judgmentProposalMs,b.judgmentProposalMs],
  physicalHistoryReads:[old.reads,current.reads],physicalHistoryBytes:[old.bytes,current.bytes],
  admissionMs:[old.elapsedMs,current.elapsedMs],heapEndpoints:[[old.heapBefore,old.heapAfter],[current.heapBefore,current.heapAfter]],
  resultDigest:current.value.admitted.result.resultDigest,judgmentDigest:current.value.admitted.judgment.judgmentDigest,
  guards:['raw copy','spread copy','changed prefix','foreign durable owner','changed replay','stale predecessor'],
  limits:'Retained installed F_D result is genuinely rehydrated in two disposable owners; actual judgment proposal/admission and outer closes. No new Run, R10 historical terminal read, provider, package or original workspace. Timing/heap endpoints include process accumulation and GC; they are not allocation totals or OOM attribution.'};
 t.diagnostic(JSON.stringify(row));
});
