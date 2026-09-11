import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import * as abg from '../../build/code/src/abg/index.js';
import {reconstructHistoricalDeclarationCatalog,selectExactClosureContract} from '../../build/code/src/product/declaration_closure.js';
import {staticDeclarations} from '../support/d1-preserved-result-harness.mjs';
import {actual,candidate,resolveClosure,reindex,publicationDigest,gfRef,hash,R} from '../support/d2-historical-owner-harness.mjs';

// These tests compose pure declaration owners. Ready Catalog/environment data
// and negative mutations are supplied test inputs, not new native admission.
// No retained D1/D2 store, application file or native effect is observed.

test('combined ABG barrel retains D1 recovery, D2 witness and R10 typed-result exports',()=>{
  for(const name of ['projectWorksitePreservedResultArtifact','projectWorksitePreservedCandidateBundle',
    'nativeWorksiteRecoverySourceAtPrefix','isAbgTypedTerminalResult'])assert.equal(typeof abg[name],'function',name);
  assert.ok(abg.WITNESS_DEFINITION_BINDINGS.admit.reprice);
  assert.ok(abg.WITNESS_OPERATION_CONTRACTS.admit.reprice);
  assert.ok(abg.WITNESS_CONTENT_CONTRACTS.reprice);
  assert.ok(abg.ABG_TYPED_TERMINAL_RESULT_SCHEMA);assert.ok(abg.ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA);
});

test('D1 recovery and D2 history guards remain conjunctive on the shared declaration path',()=>{
  assert.equal(staticDeclarations().closure().kind,'resolved_program_declaration_closure');
  const valid=candidate();assert.equal(resolveClosure(valid).kind,'resolved_execution_declaration_closure');
  const b=candidate(),publication=b.catalog.boundPublications.find(p=>p.graphFunctions.some(g=>g.name===gfRef));
  const graph=publication.graphFunctions.find(g=>g.name===gfRef),before=publicationDigest(publication);
  assert.equal(graph.declarations['abg.semantic_revision_history'],R.historicalOwnerDependencyRef);
  graph.declarations['abg.preserved_result_source']='{}';
  const after=publicationDigest(publication);
  for(const row of b.catalog.entries.filter(r=>r.publicationDigest===before)){
    row.publicationDigest=after;row.definition=publication.graphFunctions.find(g=>g.name===row.definitionRef);row.definitionDigest=hash(row.definition);
  }
  const refused=resolveClosure(reindex(b.catalog));
  assert.equal(refused.kind,'execution_declaration_closure_refusal');assert.equal(refused.code,'wrong_owner');
  assert.match(refused.message,/preserved-result/,'a valid D2 marker cannot bypass the D1 recovery claim guard');
  const recoveryWithHistory=staticDeclarations(g=>({...g,declarations:{...g.declarations,'abg.semantic_revision_history':R.historicalOwnerDependencyRef}}));
  assert.equal(recoveryWithHistory.closure().kind,'execution_declaration_closure_refusal','a native recovery role cannot impersonate a D2 history owner');
});

test('R10 unique historical contract selector works on expanded D2 closure without root or duplicate-owner substitution',()=>{
  const b=candidate(),closure=resolveClosure(b);assert.equal(closure.kind,'resolved_execution_declaration_closure');
  const owner=closure.contractOwners.find(row=>row.declarationRef==='contract://abiogenesis/worksite/command-execution-observation@5');
  assert.ok(owner,'the exact old-C2 observation contract owner is present');const selected=selectExactClosureContract(closure,owner.declarationRef);assert.ok(selected);
  assert.equal(selected.owner.declarationRef,owner.declarationRef);
  assert.equal(selectExactClosureContract({...closure,contractOwners:[...closure.contractOwners,{...owner}]},owner.declarationRef),null);
  assert.equal(selectExactClosureContract(closure,'contract://integration/foreign'),null);
  const wrong=structuredClone(closure);wrong.contractOwners.find(row=>row.declarationRef===owner.declarationRef).publicationDigest=hash('wrong historical publication');
  assert.equal(selectExactClosureContract(wrong,owner.declarationRef),null);
});

test('shared R10 Catalog verifier preserves exact supplied environment and narrowed View on the integrated owner',()=>{
  const environment={workspaceBinding:actual.catalog.readinessBasis.workspaceBinding,resolvedLock:actual.catalog.readinessBasis.resolvedLock,
    installedProducts:actual.catalog.readinessBasis.installedProducts};
  const supplied={catalog:actual.catalog,catalogView:actual.view};
  assert.deepEqual(reconstructHistoricalDeclarationCatalog(supplied,environment),supplied);
  assert.throws(()=>reconstructHistoricalDeclarationCatalog(supplied,{...environment,installedProducts:[...environment.installedProducts,environment.installedProducts[0]]}),/exact admitted workspace/);
  assert.throws(()=>reconstructHistoricalDeclarationCatalog(supplied,{...environment,workspaceBinding:{...environment.workspaceBinding,bindingDigest:hash('foreign W')}}),/exact admitted workspace/);
  assert.throws(()=>reconstructHistoricalDeclarationCatalog({...supplied,catalogView:{...actual.view,viewDigest:hash('wrong View')}},environment),/exact narrowing/);
});

test('unaffected C0 and existing F11 native owners remain exact Source04 bytes',()=>{
  const root=path.resolve(import.meta.dirname,'../../..'),origins=JSON.parse(fs.readFileSync(path.join(root,'origins.json')));
  const base=origins.parents.find(p=>p.id==='source04').sourceRoot;
  for(const relative of ['code/src/implementation/worksite_file_replace.ts','code/src/product/worksite_effect.ts',
    'code/src/validator/self_conformance.ts','code/src/validator/self_conformance_basis.ts','code/src/validator/self_conformance_contracts.ts',
    'code/src/validator/self_conformance_publication.ts','code/src/implementation/self_conformance.ts']){
    assert.ok(fs.readFileSync(path.join(root,'work',relative)).equals(fs.readFileSync(path.join(base,relative))),relative);
  }
});
