import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as store from '../../build/code/src/abg/event_store.js';
import * as prefix from '../../build/code/src/abg/event_prefix.js';
import * as artifact from '../../build/code/src/abg/artifact_truth.js';
import { deriveRuntimeEventCalculusProjection } from '../../build/code/src/abg/event_calculus.js';
import { projectActorLivenessContext } from '../../build/code/src/abg/runtime_liveness.js';
import { RuntimeDerivationSource } from '../../build/code/src/abg/runtime_derivation.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { sha256Canonical } from '../../build/code/src/shared/digests.js';
const counts=()=>({...globalThis.p0Work});
const difference=(a,b,key)=>(b[key]??0)-(a[key]??0);
const candidate=n=>({kind:'public_operation_admitted',eventTime:'2026-09-20T02:00:00.000Z',aggregateType:'workspace',aggregateId:'invocation://read05/'+n,parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://read05/'+n,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://read05',payload:{invocationDigest:sha256Canonical(n),invocationRef:'invocation://read05/'+n,operationId:'abg.operation.project.read',variant:'status'}});

test('immutable payload validation advances owner rows, with cold, reverse, changed-source and getter refusals',()=>{
 const source=new RuntimeDerivationSource();
 const first=store.projectRuntimeEventFromValidatedHistory([],candidate('first'));
 const second=store.projectRuntimeEventFromValidatedHistory([first],candidate('second'));
 const before=counts();const a=prefix.selectValidatedRuntimeEventPrefix(source.snapshot([first]));
 const once=counts();prefix.selectValidatedRuntimeEventPrefix(source.snapshot([first]));
 const repeat=counts();const b=prefix.selectValidatedRuntimeEventPrefix(source.snapshot([first,second]));
 const grown=counts();assert.deepEqual(prefix.selectValidatedRuntimeEventPrefix(source.snapshot([first])).events,a.events);
 assert.deepEqual(b.events,prefix.selectValidatedRuntimeEventPrefix(deepFreeze(structuredClone([first,second]))).events);
 if(globalThis.p0Work){assert.equal(difference(before,once,'immutablePayloadRows'),1);assert.equal(difference(once,repeat,'immutablePayloadNodes'),0);assert.equal(difference(repeat,grown,'immutablePayloadRows'),1);}
 const mutable={...first,payload:{...first.payload}};
 assert.throws(()=>prefix.selectValidatedRuntimeEventPrefix(source.snapshot([mutable])),/immutable snapshot/);
 let getterCalls=0;const getter=Object.freeze({...first,payload:Object.freeze({get value(){getterCalls++;return 'mutable';}})});
 assert.throws(()=>prefix.selectValidatedRuntimeEventPrefix(source.snapshot([getter])),/immutable snapshot/);assert.equal(getterCalls,0);
 const valid=source.snapshot([first]),forged=[mutable];
 for(const symbol of Object.getOwnPropertySymbols(valid))Object.defineProperty(forged,symbol,Object.getOwnPropertyDescriptor(valid,symbol));
 Object.freeze(forged);assert.throws(()=>prefix.selectValidatedRuntimeEventPrefix(forged),/immutable snapshot/);
 source.invalidate();assert.deepEqual(prefix.selectValidatedRuntimeEventPrefix(source.snapshot([first,second])).events,b.events);
 console.log(JSON.stringify({kind:'immutable_owner_controls',firstRows:difference(before,once,'immutablePayloadRows'),repeatPayloadNodes:difference(once,repeat,'immutablePayloadNodes'),suffixRows:difference(repeat,grown,'immutablePayloadRows'),coldReverseChangedGetterAndForgeryConserved:true}));
});

test('pure artifact values do not reacquire; cold ingress still refuses byte, extent and identity drift',async()=>{
 const scratch=await mkdtemp(join(tmpdir(),'read05-values-'));const path=join(scratch,'events.jsonl');
 const acquired=store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});assert.ok('store'in acquired);
 try{
  const committed=store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,acquired.prefix,()=>store.admitRuntimeEvent(acquired.store,candidate('one')));
  const coordinate=committed.successorPrefix;const value=artifact.projectExactPrefixArtifactTruth(coordinate);assert.equal(value.kind,'exact_prefix_artifact_truth_projection');
  const warm=artifact.runtimePrefixFromOwnedArtifactTruth(value);
  const expectedEc=deriveRuntimeEventCalculusProjection(warm);
  assert.equal(projectActorLivenessContext(warm,'actor://read05/absent'),null);
  const deriveSameLineage=events=>{
   const p=prefix.selectValidatedRuntimeEventPrefix(events);
   assert.deepEqual(deriveRuntimeEventCalculusProjection(p),expectedEc);
   assert.equal(projectActorLivenessContext(p,'actor://read05/absent'),null);
  };
  const heldBefore=counts();const held=store.readHeldRuntimeEventsAtDurablePrefix(acquired.store,coordinate);
  assert.deepEqual(held,acquired.store.readAll());
  deriveSameLineage(held);
  if(globalThis.p0Work)for(const key of ['ecOwners','livenessOwners','immutablePayloadRows'])assert.equal(difference(heldBefore,counts(),key),0,`held ${key}`);

  if(globalThis.p0Work){assert.equal(difference(heldBefore,counts(),'descriptorReads'),1);assert.equal(difference(heldBefore,counts(),'physicalReads'),0);}
  const ownedBefore=counts();const owned=artifact.projectOwnedPrefixArtifactTruth(coordinate);assert.deepEqual(owned,value);
  if(globalThis.p0Work)assert.equal(difference(ownedBefore,counts(),'descriptorReads'),0);
  assert.deepEqual(artifact.projectOwnedPrefixArtifactTruth(structuredClone(coordinate)),value);

  const before=counts();for(let i=0;i<5;i++)assert.equal(artifact.validateArtifactTruthProjectionValue(value),true);const after=counts();
  if(globalThis.p0Work)assert.equal(difference(before,after,'physicalReads'),0);
  let complete='';prefix.writeRuntimeEventPrefixValue(artifact.runtimePrefixFromOwnedArtifactTruth(value),part=>{complete+=part;});
  assert.deepEqual(JSON.parse(complete).events,acquired.store.readAll(),'the canonical writer emits the complete owner value');
  assert.equal(artifact.runtimePrefixFromOwnedArtifactTruth(structuredClone(value)),null);
  assert.equal(artifact.validateArtifactTruthProjectionValue(structuredClone(value)),true);
  const stolen={...value,prefixEventCount:99};for(const symbol of Object.getOwnPropertySymbols(value))Object.defineProperty(stolen,symbol,Object.getOwnPropertyDescriptor(value,symbol));deepFreeze(stolen);
  assert.equal(artifact.validateArtifactTruthProjectionValue(stolen),false);assert.equal(artifact.runtimePrefixFromOwnedArtifactTruth(stolen),null);
  const pureBefore=counts();assert.equal(store.projectRuntimeEventsAtDurablePrefix(coordinate)[0],acquired.store.readAll()[0]);
  if(globalThis.p0Work)assert.equal(difference(pureBefore,counts(),'physicalReads'),0);
  assert.deepEqual(store.projectRuntimeEventsAtDurablePrefix(structuredClone(coordinate)),acquired.store.readAll());
  assert.throws(()=>store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,coordinate,()=>{
   store.admitRuntimeEvent(acquired.store,candidate('rollback'));
   const activeBefore=counts();assert.equal(store.readActiveRuntimeTransactionAtDurablePrefix(acquired.store,coordinate).length,2);
   assert.equal(store.readActiveRuntimeTransactionAtDurablePrefix(acquired.store,coordinate,{durableOnly:true}).length,1);
   assert.equal(store.readActiveRuntimeTransactionAtDurablePrefix(acquired.store,coordinate,{durableOnly:true})[0],held[0]);
   deriveSameLineage(store.readActiveRuntimeTransactionAtDurablePrefix(acquired.store,coordinate,{durableOnly:true}));
   if(globalThis.p0Work)for(const key of ['ecOwners','livenessOwners','immutablePayloadRows'])assert.equal(difference(activeBefore,counts(),key),0,`active historical ${key}`);

   if(globalThis.p0Work)assert.equal(difference(activeBefore,counts(),'descriptorReads'),0);
   assert.throws(()=>store.readActiveRuntimeTransactionAtDurablePrefix(acquired.store,acquired.prefix));
   throw Error('staged rollback control');
  }),/staged rollback control/);
  assert.equal(acquired.store.readAll().length,1);
  // A held, open store is the exclusive writer of its log: its derivation is
  // current by the store's own head, and the trusted-desktop boundary does not
  // rehash unchanged prior bytes for hostile same-length mutation. Cold and
  // copied ingress still authenticate through the reader (T287_D4_D5 design
  // :262-271; T287_W2_R2 design :88-95).
  // Retired: the held-store arms of the superseded cut, in which held, active
  // and transactional reads re-authenticated the bytes under an external
  // same-length mutation, append, truncation or inode replacement, and an
  // in-action overwrite was caught by a post-append byte check.
  const bytes=await readFile(path),changed=Buffer.from(bytes);changed[0]=91;await writeFile(path,changed);
  assert.equal(artifact.validateArtifactTruthProjectionValue(value),true,'immutable past value is a derivation, not current physical authority');
  assert.equal(artifact.validateExactPrefixArtifactTruthProjection(structuredClone(value)),false,'copied value authenticates cold');
  assert.throws(()=>store.readRuntimeEventsAtDurablePrefix(structuredClone(coordinate)),e=>e.code==='prefix_digest_mismatch');
  assert.equal(artifact.projectOwnedPrefixArtifactTruth(structuredClone(coordinate)).kind,'exact_prefix_artifact_truth_projection_refusal');

  await writeFile(path,bytes);await writeFile(path,Buffer.concat([bytes,Buffer.from('\n')]));
  assert.throws(()=>store.readRuntimeEventsAtDurablePrefix(structuredClone(coordinate),{requireCurrent:true}),e=>e.code==='prefix_length_mismatch');
  await writeFile(path,bytes.subarray(0,bytes.length-1));assert.equal(artifact.validateExactPrefixArtifactTruthProjection(structuredClone(value)),false);
  await writeFile(path,bytes);await rename(path,path+'.old');await writeFile(path,bytes);
  assert.equal(artifact.validateExactPrefixArtifactTruthProjection(structuredClone(value)),false);await rm(path);await rename(path+'.old',path);
  assert.equal(artifact.validateExactPrefixArtifactTruthProjection(structuredClone(value)),true);
  assert.equal(artifact.validateExactPrefixArtifactTruthProjection(value),true);

  console.log(JSON.stringify({kind:'artifact_value_boundary_controls',pureRepeatedPhysicalReads:difference(before,after,'physicalReads'),heldAndActiveNewEcOwners:0,heldAndActiveNewLivenessOwners:0,heldAndActiveRepeatedPayloadRows:0,coldAndForgeryConserved:true,coldSameLengthCurrentnessTruncationAndInodeRefused:true}));
 }finally{acquired.store.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
});

// Retired (T-292 TD-60): the native basis derivation matches its predecessor build over a retained sample; input the retained native execution-basis sample not recorded
