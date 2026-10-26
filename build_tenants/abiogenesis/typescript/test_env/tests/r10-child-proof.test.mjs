import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {syncBuiltinESMExports} from 'node:module';
import * as v from 'valibot';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
import {GraphCallProjectionPort,projectRunTruthAtDurablePrefix} from '../../build/code/src/abg/project_read_ports.js';
import {projectExactExecutionBasisAtPrefix} from '../../build/code/src/abg/invocation_execution_truth.js';
import {projectExactPrefixWorkspaceEnvironment} from '../../build/code/src/abg/environment_admission.js';
import {resolveExecutionDeclarationClosure,selectExactClosureContract} from '../../build/code/src/product/declaration_closure.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {reopenEventStore,closeHeldEventStoreAtDurablePrefix} from '../../build/code/src/abg/event_store.js';
import {evidenceInput} from '../support/evidence-root.mjs';
import {callInput as s01CallInput,eventsInput as s01EventsInput,reopenPackagedS01Store} from '../fixtures/r10-projection-family/s01-store.mjs';
// The retained D2 store with its program-ready record, the S01 call-9 record
// and the S01 store's call-11 record and log (s01-store.mjs) are historical
// evidence under the evidence root, named by path, digest and bytes. Without the root every case skips with the reason. The
// store was appended after this proof's capture (913 lines); the proof is over
// its first 846 lines, 13,540,472 bytes, sha256 4f561cea….
const D2='comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/';
const logInput=evidenceInput({path:D2+'events-01/runtime.events.jsonl',sha256:'f841bba98385cb572a944edf1793634fcf10baf59a74331110042bcb200f8e82',bytes:19058361});
const readyInput=evidenceInput({path:D2+'attempt-01/program-ready-16.json',sha256:'2147862a16f8526d546ca918563b8d8b8094e684d8f629784b256e4803d3fc02',bytes:12781893});
const s01Input=evidenceInput({path:'comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01/call-9.jsonl',
  sha256:'b41e2253b63acb7fd9d2505544272c1ef887c2430d11ec3027d11759a8d32d65',bytes:20426253});
const absent=[logInput,readyInput,s01Input,s01CallInput,s01EventsInput].find(input=>input.kind==='absent');
if(absent)test('R10 child proof over the retained D2 store and the S01 call-9 record',{skip:absent.reason},()=>{});
else await (async()=>{
const hash=x=>createHash('sha256').update(x).digest('hex');
const logBytes=logInput.bytes.subarray(0,13540472),readyBytes=readyInput.bytes,retainedStats=[logInput.path,readyInput.path].map(file=>fs.statSync(file));
assert.equal(hash(logBytes),'4f561ceacf40fd13db82132d93890cb67750453dfa81a75c0401f04bd9345649');
const lines=logBytes.toString('utf8').trimEnd().split('\n'),events=lines.map(JSON.parse),ready=JSON.parse(readyBytes);
const proof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:ready.call.resources.catalog,catalogView:ready.call.resources.catalogView};
// The retained close handoff names the original file and a device number that
// no longer holds; it is historical evidence and is never compared. The store
// owner reopens a byte copy in per-run scratch under the retained profile and
// closes it with no append; that truthful coordinate is the base of every
// historical cut below. Nothing is written under the evidence root.
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'r10-child-proof-')),log=path.join(scratch,'runtime.events.jsonl');
fs.writeFileSync(log,logBytes);after(()=>fs.rmSync(scratch,{recursive:true,force:true}));
const copy=fs.statSync(log),authority={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath:log,device:copy.dev,inode:copy.ino,
  eventLogDigest:'sha256:'+hash(logBytes),durableByteLength:logBytes.length,eventContractDigest:ready.closeHandoff.prefix.storeIdentity.eventContractDigest};
const reopened=reopenEventStore({...authority,authorityDigest:sha256Canonical(authority)});
assert.equal(reopened.kind,'reopened_event_store_context',JSON.stringify(reopened));
const {prefix:current}=closeHeldEventStoreAtDurablePrefix(reopened.store,reopened.prefix);
assert.equal(current.prefixLength,logBytes.length);assert.equal(current.storeIdentity.eventContractDigest,ready.closeHandoff.prefix.storeIdentity.eventContractDigest);
function prefixAt(ordinal){const selected=Buffer.from(lines.slice(0,ordinal).join('\n')+'\n');const {coordinateDigest:_,...base}=structuredClone(current);
  const body={...base,prefixLength:selected.length,prefixDigest:'sha256:'+hash(selected)};return {...body,coordinateDigest:sha256Canonical(body)};}
const close=events.find(e=>e.admissionOrdinal===67),prefix=prefixAt(67);
const packet={kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey:'graph_call_result',prefix,targetRef:close.graphCallId,declarationProof:proof};
const owner=await privateOwner('abg/project_read_ports.js',['prepareRead','scopeForBasis','terminalContract','graphCallContext','typedTerminalResult']);
const prepared=owner.prepareRead('graph_call_result',packet);assert.ok(!prepared.code);
const basis=projectExactExecutionBasisAtPrefix(prepared.fullPrefix,close.basisId),scope=owner.scopeForBasis(prepared.fullPrefix,basis);
const contract=owner.terminalContract(prepared,basis,scope);
assert.equal(contract.ref,'contract://abiogenesis/semantic-stage/envelope@5');
const changedProof=mutate=>{const value=structuredClone(proof);mutate(value);return {...prepared,packet:{...packet,declarationProof:value}};};

test('actual child selects a different output contract from the admitted root without root or View substitution',()=>{
  const root=events.find(e=>e.kind==='invocation_admitted'&&e.payload.invocationAdmissionRef===basis.invocationAdmissionRef).payload;
  assert.notEqual(contract.ref,root.outputContractRef);assert.notEqual(contract.digest,root.outputContractDigest);
  const declaration=proof.catalog.boundPublications.flatMap(p=>p.contracts).find(c=>c.contractRef===contract.ref);
  assert.equal(contract.digest,sha256Canonical(declaration));assert.notEqual(contract.digest,sha256Canonical({ref:contract.ref}));
});

test('missing, foreign, stale View and equal-URI changed declaration proofs refuse from a real positive basis',()=>{
  const {declarationProof:_,...missing}=packet;
  assert.throws(()=>owner.terminalContract({...prepared,packet:missing},basis,scope),/historical declaration evidence/);
  for(const [name,mutate] of [
    ['foreign workspace',p=>{p.catalog.readinessBasis.workspaceBinding.bindingId='workspace-binding://foreign';}],
    ['stale View',p=>{p.catalogView.allowlist=[];}],
    ['equal URI changed declaration',p=>{p.catalog.boundPublications.flatMap(x=>x.contracts).find(c=>c.contractRef===contract.ref).valueKind='foreign-value-kind';}],
    ['multiple supplied owner rows',p=>{p.catalog.readinessBasis.publications.push(structuredClone(p.catalog.readinessBasis.publications[0]));}],
  ])assert.throws(()=>owner.terminalContract(changedProof(mutate),basis,scope),undefined,name);
  assert.deepEqual(owner.terminalContract(prepared,basis,scope),contract,'unmodified positive remains valid');
});

test('native root/child ancestry and basis coordinates cannot be supplied across an invocation',()=>{
  assert.throws(()=>owner.terminalContract(prepared,{...basis,workspaceBindingDigest:sha256Canonical('crossed')},scope),/ancestry crosses/);
  assert.throws(()=>owner.terminalContract(prepared,{...basis,parentCCallRef:'c-call:foreign'},scope),/historical parent frontier/);
  assert.throws(()=>owner.terminalContract(prepared,{...basis,localExecutableLeafKeys:[]},scope),/child subsets/);
});

test('future environment admission refuses even if a supplied projection otherwise looks equal (explicit environment lookup assumption)',async()=>{
  const futureOwner=await privateOwner('abg/project_read_ports.js',['terminalContract'],{
    './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:(...args)=>{
      const actual=projectExactPrefixWorkspaceEnvironment(...args);assert.equal(actual.kind,'exact_prefix_workspace_environment');
      return {...actual,workspaceBinding:{...actual.workspaceBinding,admissionEventRef:close.eventId}};
    }},
  });
  assert.throws(()=>futureOwner.terminalContract(prepared,basis,scope),/not historical/);
});

test('held-parent summary does not erase a genuinely closed child or close its Run (held status is an explicit projection assumption)',()=>{
  const context=owner.graphCallContext(prepared,close.graphCallId);assert.ok(context);
  const held={...context,replay:{...context.replay,runtimeStatus:'held'}};
  const terminal=owner.typedTerminalResult(prepared,held,close.graphCallId,false);
  assert.equal(terminal.contract.digest,contract.digest);assert.equal(terminal.producer.graphCallRef,close.graphCallId);
  assert.equal(owner.typedTerminalResult(prepared,held,close.graphCallId,true),null);
});

test('same child remains authentic after actual root completion at prefix831; no current active-parent requirement',()=>{
  const later=prefixAt(831);
  const result=GraphCallProjectionPort.graph_call_result({...packet,prefix:later});
  assert.equal(result.kind,'abg_project_read_projection',JSON.stringify(result));
  const root=projectRunTruthAtDurablePrefix(later,close.runId);assert.equal(root.kind,'abg_run_truth_projection');assert.equal(root.runtimeStatus,'closed');
  assert.equal(result.value.terminalResult.contract.ref,contract.ref);assert.notEqual(result.value.terminalResult.contract.ref,root.terminalResult.contract.ref);
  assert.equal(result.value.terminalResult.producer.graphCallRef,close.graphCallId);
  assert.equal(result.value.terminalResult.projectionBasis.digest,later.coordinateDigest);
});

test('one exact contract selector refuses competing same-valued owners inside the resolved closure',()=>{
  const rootBasis=events.find(e=>e.kind==='basis_admitted'&&e.payload.basisClass==='root'&&e.payload.invocationAdmissionRef===basis.invocationAdmissionRef).payload;
  const closure=resolveExecutionDeclarationClosure(proof.catalog,proof.catalogView,rootBasis.programRef,rootBasis.graphFunctionRef);
  assert.equal(closure.kind,'resolved_execution_declaration_closure');assert.ok(selectExactClosureContract(closure,contract.ref));
  const changed=structuredClone(closure),selected=changed.contractOwners.find(o=>o.declarationRef===contract.ref);
  changed.contractOwners.push(structuredClone(selected));assert.equal(selectExactClosureContract(changed,contract.ref),null);
});

test('fresh-process child projection reads only the retained log once proof is supplied; no current workspace or installed declaration file lookup',()=>{
  const methods=['openSync','readFileSync','statSync','lstatSync','realpathSync','existsSync'];
  const old=Object.fromEntries(methods.map(name=>[name,fs[name]]));
  const reads=[];
  try {
    for(const name of methods)fs[name]=function(target,...args){
      if(typeof target!=='number') {
        const resolved=target instanceof URL?target.pathname:path.resolve(String(target));
        assert.ok(resolved===log||resolved===path.dirname(log),`unexpected current-file read: ${name} ${resolved}`);
        reads.push([name,resolved]);
      }
      return old[name].call(fs,target,...args);
    };
    syncBuiltinESMExports();
    const output=GraphCallProjectionPort.graph_call_result(packet);
    assert.equal(output.kind,'abg_project_read_projection',JSON.stringify(output));
    assert.deepEqual(output.value.terminalResult.contract,contract);
    assert.ok(reads.length>0);
  } finally {
    for(const name of methods)fs[name]=old[name];syncBuiltinESMExports();
  }
});

test('conformance keeps the complete artifact-truth, inventory and Program joins around the shared verifier',async()=>{
  const call=JSON.parse(s01Input.bytes.toString('utf8')).invocation;
  const resources=call.resources,catalog=resources.declarationCatalog.catalog;
  const workspace={ref:catalog.workspaceBindingId,digest:catalog.workspaceBindingDigest};
  // The record's artifact-truth prefix names the original S01 file and a device
  // that no longer holds. The same prefix (length and digest) is read from a
  // scratch copy of the S01 store under the evidence root, under the coordinate
  // its owner gives on reopen with no append.
  const historical=resources.artifactTruth.prefix,packaged=reopenPackagedS01Store(historical.storeIdentity.eventContractDigest);
  assert.ok(packaged.prefix,JSON.stringify(packaged));
  const {coordinateDigest:_,...base}=structuredClone(packaged.prefix);
  const body={...base,prefixLength:historical.prefixLength,prefixDigest:historical.prefixDigest};
  const environment=projectExactPrefixWorkspaceEnvironment({...body,coordinateDigest:sha256Canonical(body)},workspace);
  assert.equal(environment.kind,'exact_prefix_workspace_environment',JSON.stringify(environment).slice(0,400));
  const conformance=await privateOwner('validator/conformance_definition_bindings.js',['reconstructDeclarationBasis']);
  assert.equal(conformance.reconstructDeclarationBasis(resources,environment).declarationClosure.kind,'resolved_program_declaration_closure');
  const incomplete={...resources,declaredInventory:resources.declaredInventory.slice(1)};
  assert.throws(()=>conformance.reconstructDeclarationBasis(incomplete,environment),/inventory differs/);
  // The artifact truth the join reads is the admitted environment's, not a supplied copy.
  const foreign={...environment,artifactTruth:{...environment.artifactTruth,projectionDigest:sha256Canonical('foreign')}};
  assert.throws(()=>conformance.reconstructDeclarationBasis(resources,foreign),/artifact truth differs/);
  // The S01 call-11 record under the evidence root (s01-store.mjs).
  const readBytes=s01CallInput.bytes;
  assert.equal(hash(readBytes),'3d4adcf616337360931993fbd10e42090c989ac24060d56318cd21ea9363f845');
  const read=JSON.parse(readBytes.toString('utf8')).invocation.resources;
  const schemas=await privateOwner('abg/project_read_definition_bindings.js',['PROJECT_READ_RESOURCE_ASSERTION_SCHEMA','GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA']);
  assert.equal(v.safeParse(schemas.PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,read).success,true);
  assert.equal(v.safeParse(schemas.PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,{...read,declarationProof:proof}).success,false);
  assert.equal(v.safeParse(schemas.GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA,{...read,declarationProof:proof}).success,true);
  assert.equal(v.safeParse(schemas.GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA,{...read,declarationProof:{...proof,admitted:true}}).success,false);
});

test('the retained native log and proof bytes remain unchanged',()=>{
  // The retained files under the evidence root keep their bytes and their
  // physical identity across the lane; the scratch copy the owner read keeps its bytes.
  assert.equal(hash(fs.readFileSync(logInput.path)),hash(logInput.bytes));assert.equal(hash(fs.readFileSync(readyInput.path)),hash(readyBytes));
  [logInput.path,readyInput.path].forEach((file,index)=>{const now=fs.statSync(file),before=retainedStats[index];
    assert.deepEqual([now.dev,now.ino,now.size,now.mtimeMs],[before.dev,before.ino,before.size,before.mtimeMs],file);});
  assert.equal(hash(fs.readFileSync(log)),hash(logBytes));
});
})();
