import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import test from 'node:test';
import {resolveProgramDeclarationClosure,resolveExecutionDeclarationClosure,validateResolvedProgramDeclarationClosure} from '../../build/code/src/product/declaration_closure.js';
import {lookupGraphFunctionDefinition,narrowGraphFunctionCatalog} from '../../build/code/src/product/catalog.js';
import {constructCatalogProgramValidationInput} from '../../build/code/src/product/catalog_operations.js';
import {validateProgram} from '../../build/code/src/validator/validation.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';

// Retain this historical test's original basis separately from integration origins.
const root=resolve(import.meta.dirname,'../../..'),origins=JSON.parse(fs.readFileSync(join(root,'evidence/s01-origins.json')));
const bytes=fs.readFileSync(join(root,'evidence/s01-closure-input.json'));
assert.equal(createHash('sha256').update(bytes).digest('hex'),origins.retainedS01.sha256);
const retained=JSON.parse(bytes),programRef=retained.programRef,gf='graph-function://abiogenesis/conformance/hello-world@5';
const clone=()=>structuredClone(retained),programOf=b=>b.catalog.boundPublications.flatMap(p=>p.programs).find(p=>p.programRef===programRef);
const parent=await import(pathToFileURL(join(origins.compiledParent.root,'build/code/src/product/declaration_closure.js')).href);
const selected=b=>b.catalog.entries.find(e=>e.definitionRef===gf&&e.programMembershipRefs.includes(programRef));
const closure=b=>resolveProgramDeclarationClosure(b.catalog,b.view,programRef);
function refusal(actual,code){assert.equal(actual.kind,'execution_declaration_closure_refusal',JSON.stringify(actual));if(code!==undefined)assert.equal(actual.code,code,JSON.stringify(actual));}

// Negative rows below are explicit untrusted mechanical mutations, never new
// admitted Catalogs, publications, installs or runtime history. Reindexing only
// removes accidental stale-view failure so the selected owner guard is reached.
function reindex(b){
  for(const e of b.catalog.entries){const {entryDigest,...body}=e;e.entryDigest=sha256Canonical(body);}
  b.catalog.byHandle=Object.fromEntries(b.catalog.entries.map(e=>[e.handle,e]));
  b.view=narrowGraphFunctionCatalog(b.catalog,retained.view.allowlist);
  assert.equal(b.view.kind,'graph_function_catalog_view');return b;
}

test('actual retained S01 resolves its Program owner and passes whole-Program validation',()=>{
  const old=parent.resolveProgramDeclarationClosure(retained.catalog,retained.view,programRef);
  refusal(old,'ambiguous');
  const result=closure(retained);assert.equal(result.kind,'resolved_program_declaration_closure');
  assert.equal(validateResolvedProgramDeclarationClosure(result,retained.catalog,retained.view),true);
  assert.equal(result.programRef,programRef);assert.deepEqual(result.rootGraphFunctionRefs,[gf]);
  const lookup=lookupGraphFunctionDefinition(retained.catalog,gf,programRef);assert.equal(lookup.kind,'graph_function_definition_lookup_exact');
  assert.equal(lookup.entry.handle,gf);
  assert.deepEqual(result.graphFunctionOwners.map(x=>x.declarationRef),[gf]);
  const input=constructCatalogProgramValidationInput(retained.catalog,retained.view,result,programOf(retained));
  assert.notEqual(input.kind,'raw_admission_refusal',JSON.stringify(input));
  const valid=validateProgram(input);assert.equal(valid.kind,'program_validation',JSON.stringify(valid));assert.equal(valid.disposition,'valid');
});

test('local owner relation is deterministic and legacy exact execution closure is unchanged',()=>{
  const result=closure(retained),b=clone();b.catalog.entries.reverse();b.catalog.boundPublications.reverse();
  assert.deepEqual(closure(b),result);
  assert.deepEqual(resolveExecutionDeclarationClosure(retained.catalog,retained.view,programRef,gf),parent.resolveExecutionDeclarationClosure(retained.catalog,retained.view,programRef,gf));
});

test('equal-valued aliases competing for the same Program remain ambiguous',()=>{
  const b=clone(),aliases=b.catalog.entries.filter(e=>e.definitionRef===gf);assert.equal(aliases.length,2);
  assert.deepEqual(aliases[0].definition,aliases[1].definition);
  const foreign=aliases.find(e=>!e.programMembershipRefs.includes(programRef));assert.ok(foreign);foreign.programMembershipRefs.push(programRef);reindex(b);
  assert.equal(lookupGraphFunctionDefinition(b.catalog,gf,programRef).kind,'graph_function_definition_lookup_ambiguous');
  assert.equal(b.view.entries.filter(e=>e.definitionRef===gf).length,1,'view does not hide Program-wide owner ambiguity');
  refusal(closure(b),'ambiguous');
});

test('missing reciprocal local Program membership refuses without selecting another Program alias',()=>{
  const b=clone(),entry=selected(b);entry.programMembershipRefs=entry.programMembershipRefs.filter(p=>p!==programRef);reindex(b);
  assert.equal(lookupGraphFunctionDefinition(b.catalog,gf,programRef).kind,'graph_function_definition_lookup_absent');refusal(closure(b),'absent');
});

for(const variant of ['owner','publication','definition_digest','definition_bytes'])test(`exact selected row preserves ${variant} gate`,()=>{
  const b=clone(),entry=selected(b);
  if(variant==='owner')entry.owningProductId='product://s01-negative.example/foreign@5';
  if(variant==='publication')entry.publicationDigest=sha256Canonical('wrong-publication');
  if(variant==='definition_digest')entry.definitionDigest=sha256Canonical('wrong-definition');
  if(variant==='definition_bytes')entry.definition={...entry.definition,version:'5.0.1'};
  reindex(b);assert.equal(lookupGraphFunctionDefinition(b.catalog,gf,programRef).kind,'graph_function_definition_lookup_exact');
  refusal(closure(b),'absent');
});

test('exact declaration publication and contract owners remain required',()=>{
  const crossed=clone(),publication=crossed.catalog.boundPublications.find(p=>p.programs.some(x=>x.programRef===programRef));
  publication.productContentDigest=sha256Canonical('foreign-publication-content');refusal(closure(crossed),'absent');
  const missing=clone(),owner=missing.catalog.boundPublications.find(p=>p.graphFunctions.some(g=>g.name===gf));
  const contractRef=owner.graphFunctions.find(g=>g.name===gf).outputs[0];owner.contracts=owner.contracts.filter(c=>c.contractRef!==contractRef);
  // Preserve the selected row's newly supplied publication coordinate to reach
  // the downstream missing-contract guard instead of the prior digest gate.
  return import('../../build/code/src/product/publication.js').then(({modulePublicationSemanticDigest})=>{
    const entry=selected(missing);entry.publicationDigest=modulePublicationSemanticDigest(owner);reindex(missing);
    refusal(closure(missing),'absent');assert.match(closure(missing).message,/Contract .*publication owner/);
  });
});

test('caller-selected root cannot execute outside its narrowed View or Program membership',()=>{
  const empty=narrowGraphFunctionCatalog(retained.catalog,[]);
  refusal(resolveExecutionDeclarationClosure(retained.catalog,empty,programRef,gf),'absent');
  const aliasOnly=narrowGraphFunctionCatalog(retained.catalog,['gtl://abiogenesis/conformance/hello-world/direct-call@5']);
  refusal(resolveExecutionDeclarationClosure(retained.catalog,aliasOnly,programRef,gf),'absent');
  refusal(resolveExecutionDeclarationClosure(retained.catalog,retained.view,programRef,'graph-function://s01-negative.example/not-member@5'),'wrong_owner');
  assert.equal(resolveProgramDeclarationClosure(retained.catalog,empty,programRef).kind,'resolved_program_declaration_closure','whole-Program static closure does not grant root execution visibility');
});

test('one production path changed; all other Source04 source and inherited tests remain exact',()=>{
  const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  const changed=origins.parent.source.filter(r=>hash(join(root,'work',r.path))!==r.sha256).map(r=>r.path);
  assert.deepEqual(changed,['code/src/product/declaration_closure.ts']);
  for(const r of origins.parent.tests)assert.equal(hash(join(root,'work',r.path)),r.sha256,r.path);
});
