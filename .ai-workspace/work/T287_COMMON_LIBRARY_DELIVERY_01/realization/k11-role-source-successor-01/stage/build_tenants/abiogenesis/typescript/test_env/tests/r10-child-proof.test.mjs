import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
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
const base=path.resolve(import.meta.dirname,'../../../../../20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01');
const log=path.join(base,'events-01/runtime.events.jsonl'),readyPath=path.join(base,'attempt-01/program-ready-16.json');
const hash=x=>createHash('sha256').update(x).digest('hex');
const logBytes=fs.readFileSync(log),readyBytes=fs.readFileSync(readyPath);
assert.equal(hash(logBytes),'4f561ceacf40fd13db82132d93890cb67750453dfa81a75c0401f04bd9345649');
assert.equal(hash(readyBytes),'2147862a16f8526d546ca918563b8d8b8094e684d8f629784b256e4803d3fc02');
const lines=logBytes.toString('utf8').trimEnd().split('\n'),events=lines.map(JSON.parse),ready=JSON.parse(readyBytes);
const proof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:ready.call.resources.catalog,catalogView:ready.call.resources.catalogView};
function prefixAt(ordinal){const selected=Buffer.from(lines.slice(0,ordinal).join('\n')+'\n');const {coordinateDigest:_,...old}=ready.closeHandoff.prefix;
  const body={...old,prefixLength:selected.length,prefixDigest:'sha256:'+hash(selected)};return {...body,coordinateDigest:sha256Canonical(body)};}
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
  const s01=path.resolve(import.meta.dirname,'../../../../fixture-program-selection-01/attempt-01');
  const call=JSON.parse(fs.readFileSync(path.join(s01,'call-9.jsonl'),'utf8')).invocation;
  const resources=call.resources,catalog=resources.declarationCatalog.catalog;
  const workspace={ref:catalog.workspaceBindingId,digest:catalog.workspaceBindingDigest};
  const environment=projectExactPrefixWorkspaceEnvironment(resources.artifactTruth.prefix,workspace);
  const conformance=await privateOwner('validator/conformance_definition_bindings.js',['reconstructDeclarationBasis']);
  assert.equal(conformance.reconstructDeclarationBasis(resources,environment).declarationClosure.kind,'resolved_program_declaration_closure');
  const incomplete={...resources,declaredInventory:resources.declaredInventory.slice(1)};
  assert.throws(()=>conformance.reconstructDeclarationBasis(incomplete,environment),/inventory differs/);
  const changed=structuredClone(resources);changed.artifactTruth.projectionDigest=sha256Canonical('foreign');
  assert.throws(()=>conformance.reconstructDeclarationBasis(changed,environment),/artifact truth differs/);
  const read=JSON.parse(fs.readFileSync(path.join(s01,'call-11.jsonl'),'utf8')).invocation.resources;
  const schemas=await privateOwner('abg/project_read_definition_bindings.js',['PROJECT_READ_RESOURCE_ASSERTION_SCHEMA','GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA']);
  assert.equal(v.safeParse(schemas.PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,read).success,true);
  assert.equal(v.safeParse(schemas.PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,{...read,declarationProof:proof}).success,false);
  assert.equal(v.safeParse(schemas.GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA,{...read,declarationProof:proof}).success,true);
  assert.equal(v.safeParse(schemas.GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA,{...read,declarationProof:{...proof,admitted:true}}).success,false);
});

test('the retained native log and proof bytes remain unchanged',()=>{
  assert.equal(hash(fs.readFileSync(log)),hash(logBytes));assert.equal(hash(fs.readFileSync(readyPath)),hash(readyBytes));
  assert.equal(fs.statSync(log).dev,16777230);assert.equal(fs.statSync(log).ino,449590349);
});
