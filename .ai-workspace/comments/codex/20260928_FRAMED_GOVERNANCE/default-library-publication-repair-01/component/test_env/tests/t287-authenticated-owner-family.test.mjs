import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { sha256Bytes, sha256Canonical } from '../../build/code/src/shared/digests.js';
const root=fileURLToPath(new URL('../../',import.meta.url));
const load=async root=>Object.fromEntries(await Promise.all(['event_store','event_prefix','event_calculus','runtime_liveness','graph_application','traversal_route','closure','retry'].map(async n=>[n,await import(pathToFileURL(join(root,'build/code/src/abg',n+'.js')))])));
const counts=()=>({...globalThis.p0Work});const delta=(a,b,k)=>(b[k]??0)-(a[k]??0);

test('probe and threshold share one entry, retain lineage and conserve exact owner events and refusals',{skip:!process.env.ABI5_OWNER_HISTORY},async()=>{
 const raw=await readFile(process.env.ABI5_OWNER_HISTORY,'utf8'),lines=raw.trimEnd().split('\n'),events=lines.map(JSON.parse);
 const sample=events.find(e=>e.kind==='runtime_activity_probe_observed'&&e.payload.actorInvocationRef&&e.payload.observation.underlyingEventRef);
 assert.ok(sample);const history=Buffer.from(lines.slice(0,sample.admissionOrdinal-1).join('\n')+'\n');
 const modules=[await load(process.env.ABI5_OWNER_PREDECESSOR),await load(root)];const results=[];
 for(let variant=0;variant<modules.length;variant++){
  const m=modules[variant],scratch=await mkdtemp(join(tmpdir(),'read05-owner-family-'));
  const acquire=async name=>{const path=join(scratch,name+'.jsonl');await writeFile(path,history);const node=await stat(path);
   const body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath:path,device:node.dev,inode:node.ino,eventLogDigest:sha256Bytes(history),durableByteLength:history.length,eventContractDigest:sample.eventContractDigest};
   const opened=m.event_store.reopenEventStore({...body,authorityDigest:sha256Canonical(body)});assert.equal(opened.kind,'reopened_event_store_context');return {...opened,path};};
  const observed=await acquire('probe'),timed=await acquire('threshold');
  try{
   const actor=sample.payload.actorInvocationRef;
   const prefix=m.event_prefix.selectValidatedRuntimeEventPrefix(observed.store.readAll());
   m.event_calculus.deriveRuntimeEventCalculusProjection(prefix);m.runtime_liveness.projectActorLivenessContext(prefix,actor);
   const before=counts();const result=m.runtime_liveness.admitRuntimeActivityProbe({store:observed.store,predecessorPrefix:observed.prefix,actorInvocationRef:actor,source:sample.payload.probeContract.source,observation:sample.payload.observation,eventTime:sample.eventTime,correlationId:sample.correlationId});const after=counts();
   assert.equal(sha256Canonical(result.value),sha256Canonical(sample),'exact native probe event conserved');
   if(variant===1&&globalThis.p0Work){assert.equal(delta(before,after,'descriptorReads'),2);assert.equal(delta(before,after,'ecOwners'),0);assert.equal(delta(before,after,'livenessOwners'),0);}
   const appended=await readFile(observed.path);assert.throws(()=>m.runtime_liveness.admitRuntimeActivityProbe({store:observed.store,predecessorPrefix:observed.prefix,actorInvocationRef:actor,source:sample.payload.probeContract.source,observation:sample.payload.observation,eventTime:sample.eventTime,correlationId:sample.correlationId}));assert.deepEqual(await readFile(observed.path),appended);
   const bad=Buffer.from(appended);bad[0]=91;await writeFile(observed.path,bad);assert.throws(()=>m.runtime_liveness.admitRuntimeActivityProbe({store:observed.store,predecessorPrefix:result.successorPrefix,actorInvocationRef:actor,source:sample.payload.probeContract.source,observation:sample.payload.observation,eventTime:sample.eventTime,correlationId:sample.correlationId}));assert.deepEqual(await readFile(observed.path),bad);await writeFile(observed.path,appended);
   const stale={store:observed.store,predecessorPrefix:observed.prefix};
   const refusals=[m.graph_application.admitChildPreparationRefusal({...stale,relationClass:'recursive_application'}),m.graph_application.admitChildFoldback({...stale,relationClass:'recursive_application'}),
    m.traversal_route.admitTraversalTransition(stale),m.traversal_route.admitCompletedRetryTraversalTransition(stale),m.traversal_route.admitBlockedRetryTraversalTransition(stale),
    m.closure.admitScopeClosure(observed.store,observed.prefix,{kind:'ordinary',cCall:{runId:sample.runId}},null,null,null)];
   assert.ok(refusals.every(x=>x.disposition==='refused'));assert.deepEqual(await readFile(observed.path),appended);
   const planArgs=[{}, {}, {}, null, {completionClass:'judged_success',cCall:{},result:{},judgment:{}}, {}];
   const planBefore=counts();const planned=m.retry.planCompletedRetryProgress(observed.prefix,...planArgs);const planAfter=counts();
   if(variant===1&&globalThis.p0Work)assert.equal(delta(planBefore,planAfter,'descriptorReads'),0);
   assert.equal(sha256Canonical(m.retry.planCompletedRetryProgress(structuredClone(observed.prefix),...planArgs)),sha256Canonical(planned));
   const native=m.runtime_liveness.projectActorLivenessContext(m.event_prefix.selectValidatedRuntimeEventPrefix(timed.store.readAll()),actor);assert.ok(native?.binding.policy);
   const process=events.slice(0,sample.admissionOrdinal-1).find(e=>e.kind==='actor_process_started'&&e.payload.actorInvocationRef===actor);assert.ok(process);
   const base={store:timed.store,predecessorPrefix:timed.prefix,actorInvocationRef:actor,processRef:process.aggregateId,eventTime:sample.eventTime,correlationId:sample.correlationId};
   const under=m.runtime_liveness.admitRuntimeThreshold({...base,elapsedMs:sample.payload.observation.elapsedMs});assert.equal(under.kind,'runtime_threshold_not_reached');assert.deepEqual(await readFile(timed.path),history);
   const timedBefore=counts();const reached=m.runtime_liveness.admitRuntimeThreshold({...base,elapsedMs:native.binding.policy.hardCapMs+1});const timedAfter=counts();assert.equal(reached.kind,'runtime_threshold_admitted');
   if(variant===1&&globalThis.p0Work)assert.equal(delta(timedBefore,timedAfter,'descriptorReads'),2);
   results.push({probe:result.value,refusals,planned,under,reached:{...reached,successorPrefix:null}});
   if(variant===1)console.log(JSON.stringify({kind:'owner_family_controls',proofScope:'copied immutable native history; direct owner fixture, no live continuation or Public qualification',probeEntryAndAppendReads:delta(before,after,'descriptorReads'),probeNewEcOwners:delta(before,after,'ecOwners'),probeNewLivenessOwners:delta(before,after,'livenessOwners'),thresholdEntryAndAppendReads:delta(timedBefore,timedAfter,'descriptorReads'),physicalAndStaleRefusals:true}));
  }finally{observed.store.closeDurableLog();timed.store.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
 }
 assert.equal(sha256Canonical(results[1]),sha256Canonical(results[0]),'same policy, event, projection and not-reached outputs across owner modules');
});
