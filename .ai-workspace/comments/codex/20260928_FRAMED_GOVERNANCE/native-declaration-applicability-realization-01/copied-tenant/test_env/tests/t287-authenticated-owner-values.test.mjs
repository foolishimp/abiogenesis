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

test('pure artifact values do not reacquire; fresh bytes, currentness and held effect checks still refuse drift',async()=>{
 const scratch=await mkdtemp(join(tmpdir(),'read05-values-'));const path=join(scratch,'events.jsonl');
 const acquired=store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});assert.ok('store'in acquired);
 try{
  const committed=store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,acquired.prefix,()=>store.admitRuntimeEvent(acquired.store,candidate('one')));
  const coordinate=committed.successorPrefix;const value=artifact.projectExactPrefixArtifactTruth(coordinate);assert.equal(value.kind,'exact_prefix_artifact_truth_projection');
  const warm=artifact.runtimePrefixFromArtifactTruth(value);
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
  assert.deepEqual(artifact.runtimePrefixFromArtifactTruth(value).events,acquired.store.readAll());
  assert.equal(artifact.runtimePrefixFromArtifactTruth(structuredClone(value)),null);
  assert.equal(artifact.validateArtifactTruthProjectionValue(structuredClone(value)),true);
  const stolen={...value,prefixEventCount:99};for(const symbol of Object.getOwnPropertySymbols(value))Object.defineProperty(stolen,symbol,Object.getOwnPropertyDescriptor(value,symbol));deepFreeze(stolen);
  assert.equal(artifact.validateArtifactTruthProjectionValue(stolen),false);assert.equal(artifact.runtimePrefixFromArtifactTruth(stolen),null);
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
  const bytes=await readFile(path),changed=Buffer.from(bytes);changed[0]=91;await writeFile(path,changed);
  assert.equal(artifact.validateArtifactTruthProjectionValue(value),true,'immutable past value is a derivation, not current physical authority');
  assert.equal(artifact.validateExactPrefixArtifactTruthProjection(value),false);
  assert.throws(()=>store.readRuntimeEventsAtDurablePrefix(coordinate),e=>e.code==='prefix_digest_mismatch');
  let effected=false;assert.throws(()=>store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,coordinate,()=>{effected=true;}));assert.equal(effected,false);
  assert.throws(()=>store.readHeldRuntimeEventsAtDurablePrefix(acquired.store,coordinate));
  assert.throws(()=>store.admitRuntimeEventTransaction(acquired.store,()=>store.readActiveRuntimeTransactionAtDurablePrefix(acquired.store,coordinate,{durableOnly:true})),/bytes differ/);
  assert.equal(artifact.projectOwnedPrefixArtifactTruth(structuredClone(coordinate)).kind,'exact_prefix_artifact_truth_projection_refusal');

  await writeFile(path,bytes);await writeFile(path,Buffer.concat([bytes,Buffer.from('\n')]));
  assert.throws(()=>store.readRuntimeEventsAtDurablePrefix(coordinate,{requireCurrent:true}),e=>e.code==='prefix_length_mismatch');assert.throws(()=>store.assertHeldEventStoreAtDurablePrefix(acquired.store,coordinate));
  await writeFile(path,bytes.subarray(0,bytes.length-1));assert.equal(artifact.validateExactPrefixArtifactTruthProjection(value),false);
  await writeFile(path,bytes);await rename(path,path+'.old');await writeFile(path,bytes);
  assert.equal(artifact.validateExactPrefixArtifactTruthProjection(value),false);await rm(path);await rename(path+'.old',path);
  assert.equal(artifact.validateExactPrefixArtifactTruthProjection(value),true);
  // Mutation during an admitted action is caught by the unchanged post-append
  // byte check and removes only the owner's newly appended suffix.
  const fs=await import('node:fs');
  assert.throws(()=>store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,coordinate,()=>{
   fs.writeFileSync(path,changed);store.admitRuntimeEvent(acquired.store,candidate('commit-drift'));
  }));assert.deepEqual(await readFile(path),changed);assert.equal(acquired.store.readAll().length,1);
  await writeFile(path,bytes);

  console.log(JSON.stringify({kind:'artifact_value_boundary_controls',pureRepeatedPhysicalReads:difference(before,after,'physicalReads'),heldAndActiveNewEcOwners:0,heldAndActiveNewLivenessOwners:0,heldAndActiveRepeatedPayloadRows:0,coldAndForgeryConserved:true,sameLengthCurrentnessTruncationInodeAndMutationRefused:true}));
 }finally{acquired.store.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
});

test('native basis retains one immutable derivation; copied, changed and physically stale inputs revalidate',{skip:!process.env.ABI5_NATIVE_BASIS_SAMPLE},async()=>{
 const { stat }=await import('node:fs/promises');const { pathToFileURL, fileURLToPath }=await import('node:url');
 const native=await import('../../build/code/src/abg/execution_basis.js');
 const old=await import(pathToFileURL(join(process.env.ABI5_NATIVE_BASIS_PREDECESSOR,'build/code/src/abg/execution_basis.js')));
 const sample=JSON.parse(await readFile(process.env.ABI5_NATIVE_BASIS_SAMPLE));
 const originalBytes=await readFile(fileURLToPath(sample.predecessorPrefix.eventLogRef));
 const scratch=await mkdtemp(join(tmpdir(),'read05-basis-'));const path=join(scratch,'events.jsonl');
 const bytes=originalBytes.subarray(0,sample.predecessorPrefix.prefixLength);await writeFile(path,bytes);const node=await stat(path);
 const { coordinateDigest,...body }=sample.predecessorPrefix;body.eventLogRef=pathToFileURL(path).href;body.storeIdentity={...body.storeIdentity,device:node.dev,inode:node.ino};
 sample.predecessorPrefix={...body,coordinateDigest:sha256Canonical(body)};
 try{
  const expected=old.authenticateNativeInstructionAssemblyBasis(sample);assert.ok(expected);
  const value=native.constructNativeInstructionAssemblyBasis(sample);assert.ok(value);
  const before=counts();const selected=native.authenticateNativeInstructionAssemblyBasis(value);assert.ok(selected);
  for(let i=0;i<5;i++)assert.equal(native.authenticateNativeInstructionAssemblyBasis(value),selected);
  if(globalThis.p0Work)assert.equal(difference(before,counts(),'physicalReads'),0);
  const { environment,...actual }=selected;assert.equal(sha256Canonical(actual),sha256Canonical(expected),'exact serializable owner result across independent module brands');assert.equal(environment.kind,'exact_prefix_workspace_environment');
  assert.equal(native.constructNativeInstructionAssemblyBasis(value),value);
  const copied=structuredClone(value);const freshBefore=counts();assert.equal(sha256Canonical(native.authenticateNativeInstructionAssemblyBasis(copied)),sha256Canonical(selected));
  if(globalThis.p0Work)assert.ok(difference(freshBefore,counts(),'physicalReads')>0);
  sample.cCall.cCallRef='c-call://read05/foreign';assert.equal(native.authenticateNativeInstructionAssemblyBasis(sample),null);assert.equal(native.authenticateNativeInstructionAssemblyBasis(value),selected);
  const stolen={...value,cCall:{...value.cCall,cCallRef:'c-call://read05/foreign'}};
  for(const symbol of Object.getOwnPropertySymbols(value))Object.defineProperty(stolen,symbol,Object.getOwnPropertyDescriptor(value,symbol));deepFreeze(stolen);
  assert.equal(native.authenticateNativeInstructionAssemblyBasis(stolen),null);
  const changed=Buffer.from(bytes);changed[0]=91;await writeFile(path,changed);
  assert.equal(native.authenticateNativeInstructionAssemblyBasis(value),selected,'pure derivation does not assert current physical truth');
  assert.equal(native.authenticateNativeInstructionAssemblyBasis(copied),null,'cold input still authenticates physical bytes');
  assert.throws(()=>store.readRuntimeEventsAtDurablePrefix(value.predecessorPrefix),e=>e.code==='prefix_digest_mismatch');
  console.log(JSON.stringify({kind:'native_basis_owner_controls',predecessorOutputConserved:true,repeatedPurePhysicalReads:0,coldChangedCopiedReceiptAndPhysicalRefusals:true}));
 }finally{await rm(scratch,{recursive:true,force:true});}
});
