import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {root,work,modules,ready,actual,oldClosure,gfRef,programRef,candidate,resolveClosure,graphOwners,reindex,retained,hash,publicationDigest,D,R,C1,C2,W,closureOwner,load} from '../support/d2-historical-owner-harness.mjs';
const refused=(value,code)=>{assert.equal(value.kind,'execution_declaration_closure_refusal',JSON.stringify(value));if(code)assert.equal(value.code,code,JSON.stringify(value));};
const contains=(closure,refs)=>{assert.equal(closure.kind,'resolved_execution_declaration_closure',JSON.stringify(closure));for(const ref of refs)assert.ok(closure.graphFunctionOwners.some(r=>r.declarationRef===ref),ref);};
const refs=[C1.reducerGraphFunctionRef,C2.graphFunctionRef,W.graphFunctionRef];
const suffix=name=>'graph-function://d2-continuation.example/mechanical/'+name+'@5';
const repairProgram='program://d2-continuation.example/mechanical/repair@5';

test('explicit D2 historical dependency resolves old/new C2 and every declared revision role without new callable rights',()=>{
  const b=candidate(),next=resolveClosure(b);contains(next,[...refs,gfRef,...['projection','repair-bridge','repair-evidence','repair-output','initial-bridge'].map(suffix)]);
  assert.equal(oldClosure.graphFunctionOwners.length,6);
  assert.equal(oldClosure.graphFunctionOwners.some(r=>r.declarationRef===C2.graphFunctionRef),false);
  assert.deepEqual(next.rootGraphFunctionRefs,[gfRef]);
  for(const p of b.catalog.boundPublications){
    const old=actual.catalog.boundPublications.find(x=>x.moduleRef===p.moduleRef);
    assert.deepEqual(p.programs,old.programs,'no membership, policy or start widening');
    assert.deepEqual(p.contributions,old.contributions,'no contributor membership rewrite');
  }
  for(const [program,ref]of [[programRef,gfRef],...['projection','repair-bridge','repair-evidence','repair-output','repair-root'].map(name=>[repairProgram,suffix(name)])]){
    contains(resolveClosure(b,ref,program),[...refs,gfRef,suffix('projection'),suffix('repair-bridge'),suffix('repair-evidence')]);
  }
  refused(resolveClosure(b,C2.graphFunctionRef),'wrong_owner');
  refused(resolveClosure({...b,view:modules['product/catalog'].narrowGraphFunctionCatalog(b.catalog,[])},gfRef),'absent');
  assert.deepEqual(resolveClosure(reindex({...b.catalog,entries:[...b.catalog.entries].reverse(),boundPublications:[...b.catalog.boundPublications].reverse()})),next);
});

test('whole four-Program validation preserves old D1 and declared borrowed membership',()=>{
  const b=candidate(),publications=b.catalog.boundPublications.filter(p=>p.owningProductId===oldClosure.programPublication.owningProductId);
  let count=0;
  for(const publication of publications)for(const program of publication.programs){
    const result=closureOwner.resolveProgramDeclarationClosure(b.catalog,b.view,program.programRef);
    assert.equal(result.kind,'resolved_program_declaration_closure',JSON.stringify(result));
    const input=modules['product/catalog_operations'].constructCatalogProgramValidationInput(b.catalog,b.view,result,program);
    const validation=modules['validator/validation'].validateProgram(input);assert.equal(validation.kind,'program_validation',JSON.stringify(validation));
    assert.equal(validation.disposition,'valid');count++;
  }
  assert.equal(count,4);
  const d1Program='program://d2-continuation.example/mechanical/initial@5';
  const before=closureOwner.resolveExecutionDeclarationClosure(actual.catalog,actual.view,d1Program,suffix('initial-root'));
  const after=resolveClosure(b,suffix('initial-root'),d1Program);
  assert.deepEqual(after.graphFunctionOwners.map(r=>r.declarationRef),before.graphFunctionOwners.map(r=>r.declarationRef),'old D1 scope remains unchanged');
  const actualDefinitions=graphOwners(before,actual.catalog),nextDefinitions=graphOwners(after,b.catalog);
  assert.deepEqual(nextDefinitions,actualDefinitions,'all old D1 constructive definitions remain byte-equivalent');
});

test('revision author/assessor declarations carry the same closed history without stage-name routing',()=>{
  const b=candidate(),pub=b.catalog.boundPublications.find(p=>p.semanticLifecycle),stage=pub.semanticLifecycle.stages[0];
  const ref=stage.graphFunctionRef+'/revision-probe',close=pub.closureContracts.find(c=>c.closureScope==='graph_call'&&c.resultContractRef===D.envelopeContractRef);
  const g=modules['gtl/semantic_revision_publication'].constructSemanticRevisionGraphFunction({graphFunctionRef:ref,closureContractRef:close.closureContractRef,role:'projection',stage});
  assert.equal(g.declarations['abg.semantic_revision_history'],R.historicalOwnerDependencyRef);
  assert.equal(g.declarations['abg.semantic_revision_stage'],stage.declarationRef);
  const oldPubDigest=publicationDigest(pub);pub.graphFunctions.push(g);
  const program=pub.programs.find(p=>p.programRef===repairProgram);program.callableMembership.push(ref);
  const newPubDigest=publicationDigest(pub);
  for(const e of b.catalog.entries.filter(e=>e.publicationDigest===oldPubDigest))e.publicationDigest=newPubDigest;
  b.catalog.entries.push({...b.catalog.entries.find(e=>e.definitionRef===suffix('projection')),handle:ref,definitionRef:ref,definition:g,definitionDigest:hash(g),programMembershipRefs:[repairProgram],publicationDigest:newPubDigest});
  const probe=reindex(b.catalog,[...actual.view.allowlist,ref]);
  contains(resolveClosure(probe,ref,repairProgram),[...refs,gfRef,suffix('projection'),stage.graphFunctionRef]);
});

for(const mutation of ['missing-old-c2','missing-revision-c2','duplicate-publication','missing-install','crossed-install','missing-dependency','crossed-dependency','crossed-owner-row','unknown-dependency','wrong-role','foreign-lifecycle']){
  test('historical closure refuses '+mutation+' (untrusted mechanical carrier mutation)',()=>{
    const b=candidate(),c=b.catalog;
    const commandPub=c.boundPublications.find(p=>p.graphFunctions.some(g=>g.name===C2.graphFunctionRef));
    const consumer=c.boundPublications.find(p=>p.programs.some(p=>p.programRef===programRef));
    if(mutation==='missing-old-c2')commandPub.graphFunctions=commandPub.graphFunctions.filter(g=>g.name!==C2.graphFunctionRef);
    if(mutation==='missing-revision-c2')commandPub.graphFunctions=commandPub.graphFunctions.filter(g=>g.name!==W.graphFunctionRef);
    if(mutation==='duplicate-publication')c.boundPublications.push(structuredClone(commandPub));
    if(mutation==='missing-install')c.readinessBasis.installedProducts=c.readinessBasis.installedProducts.filter(p=>p.productId!==commandPub.owningProductId);
    if(mutation==='crossed-install')for(const p of c.readinessBasis.installedProducts.filter(p=>p.productId===commandPub.owningProductId))p.productContentDigest=hash('crossed');
    if(mutation==='missing-dependency')c.readinessBasis.resolvedLock.dependencyEdges=[];
    if(mutation==='crossed-dependency')for(const e of c.readinessBasis.resolvedLock.dependencyEdges)e.compatibilityDisposition='incompatible';
    if(mutation==='crossed-owner-row')c.entries.find(e=>e.definitionRef===C2.graphFunctionRef).publicationDigest=hash('crossed-publication');
    if(['unknown-dependency','wrong-role','foreign-lifecycle'].includes(mutation)){
      const g=consumer.graphFunctions.find(g=>g.name===gfRef);
      if(mutation==='unknown-dependency')g.declarations['abg.semantic_revision_history']='declaration://unit/unknown';
      if(mutation==='wrong-role')g.template.nodes[0].term=structuredClone(consumer.graphFunctions.find(g=>g.name===suffix('intent')).template.nodes[0].term);
      if(mutation==='foreign-lifecycle')g.declarations['abg.semantic_revision_selection']='declaration://unit/foreign-lifecycle';
      for(const e of c.entries.filter(e=>e.moduleRef===consumer.moduleRef)){e.publicationDigest=publicationDigest(consumer);e.definition=consumer.graphFunctions.find(g=>g.name===e.definitionRef);e.definitionDigest=hash(e.definition);}
    }
    const result=resolveClosure(reindex(c));refused(result);
    if(mutation==='duplicate-publication')assert.equal(result.code,'ambiguous');
    if(mutation.endsWith('dependency'))assert.ok(['missing_dependency','wrong_owner'].includes(result.code));
  });
}

test('no ambient Catalog GraphFunction supplies undeclared semantic history',()=>{
  const b=candidate(),consumer=b.catalog.boundPublications.find(p=>p.semanticLifecycle);
  const alien={...structuredClone(consumer),moduleRef:'module://unit/unrelated',programs:[],semanticLifecycle:undefined,
    contracts:[],closureContracts:[],implementationBindings:[],contributions:[],rules:[],evaluators:[],
    graphFunctions:[{...structuredClone(consumer.graphFunctions.find(g=>g.name===suffix('projection'))),name:'graph-function://unit/ambient-history'}]};
  b.catalog.boundPublications.push(alien);
  assert.equal(resolveClosure(b).graphFunctionOwners.some(o=>o.declarationRef==='graph-function://unit/ambient-history'),false);
});

test('actual prefix841 keeps its red; successor-derived historical context resolves Design191 and C2-769 without changing events',async()=>{
  const h=await retained(),input=h.input;
  const beforeParent=h.stage.projectSemanticPredecessorAtPrefix(h.prefix,h.events,h.basis.publication,input.parent.cCallRef,h.basis.declarationGraphFunctions);
  assert.ok(beforeParent);assert.equal(beforeParent.result.admissionEventRef,h.events[190].eventId);
  assert.equal(h.stage.projectSemanticPredecessorAtPrefix(h.prefix,h.events,h.basis.publication,input.causes[0].cCallRef,h.basis.declarationGraphFunctions),null);
  assert.equal(h.revision.projectRevisionSelectionSubject(h.basis,input),null);
  assert.equal(h.instructions.constructNativeInstructionAssembly(h.basis,input),null);
  const b=candidate(),closure=resolveClosure(b);contains(closure,refs);
  // Historical native definitions keep their original digests. The expanded
  // context is synthetic readiness, NOT the declaration closure admitted at835.
  const historicalDefinitions=closure.graphFunctionOwners.map(o=>{
    const rows=actual.catalog.boundPublications.filter(p=>p.moduleRef===o.moduleRef&&p.owningProductId===o.productId).flatMap(p=>p.graphFunctions.filter(g=>g.name===o.declarationRef));
    assert.equal(rows.length,1,o.declarationRef);return rows[0];
  });
  const basis={...h.basis,declarationGraphFunctions:historicalDefinitions};
  const subject=h.revision.projectRevisionSelectionSubject(basis,input);assert.ok(subject);
  assert.equal(subject.parent.result.admissionEventRef,h.events[190].eventId);
  assert.equal(subject.causes[0].result.admissionEventRef,h.events[768].eventId);
  assert.equal(subject.causes[0].result.resultClass,'success');assert.equal(subject.causes[0].judgment.judgment,'advance');
  assert.equal(subject.causes[0].result.value.commandResults[0].exitStatus,1,'honest failed command remains failed inside observation');
  const assembly=h.instructions.constructNativeInstructionAssembly(basis,input);assert.ok(assembly);assert.equal(assembly.plan.resultContractRef,R.selectionRawContractRef);
  for(const mutation of ['spliced-result','foreign-call','foreign-lifecycle']){
    if(mutation==='foreign-lifecycle'){assert.equal(h.revision.projectRevisionSelectionSubject({...basis,lifecyclePublication:{...basis.lifecyclePublication,semanticLifecycle:{...basis.lifecyclePublication.semanticLifecycle,declarationRef:'declaration://unit/foreign'}}},input),null);continue;}
    const bad=structuredClone(input);if(mutation==='spliced-result')bad.causes[0].resultAdmissionEventRef=bad.parent.resultAdmissionEventRef;else bad.causes[0].cCallRef=bad.parent.cCallRef;
    assert.equal(h.revision.projectRevisionSelectionSubject(basis,bad),null,'actual input/coordinate admission guard');
  }
  // The unchanged exact-native projector refuses duplicate owning definitions
  // rather than value-deduplicating their equal bytes.
  assert.equal(h.stage.projectSemanticPredecessorAtPrefix(h.prefix,h.events,basis.publication,input.causes[0].cCallRef,[...historicalDefinitions,historicalDefinitions.find(g=>g.name===C2.graphFunctionRef)]),null);
  console.log(JSON.stringify({scope:'pure synthetic closure/context; no new admission',nativePrefix:841,nativeClosure:oldClosure.closureDigest,successorClosure:closure.closureDigest,contextOwners:historicalDefinitions.length,parentOrdinal:191,causeOrdinal:769,commandExit:1,subject:true,assembly:true,promptBytes:assembly.manifest.promptByteCount}));
});

test('source04 inherited tests and all other production bytes remain exact; F11 publication conserved',async()=>{
  const origins=JSON.parse(fs.readFileSync(join(root,'origins.json')));
  const changed=[];
  const {sha}=await import('../support/d2-historical-owner-harness.mjs');
  for(const r of origins.parent.source)if(sha(fs.readFileSync(join(work,r.path)))!==r.sha256)changed.push(r.path);
  assert.deepEqual(changed.sort(),['code/src/product/declaration_closure.ts','code/src/gtl/semantic_revision_identity.ts','code/src/gtl/semantic_revision_publication.ts'].sort());
  for(const r of origins.parent.tests)assert.equal(sha(fs.readFileSync(join(work,r.path))),r.sha256,r.path);
  const p=await load('gtl/self_conformance'),old=await import(pathToFileURL(join(origins.compiledParent.root,'build/code/src/gtl/self_conformance.js')).href);
  const basis={productId:'product://unit/native',artifactDigest:hash(1),productContentDigest:hash(2),productManifestDigest:hash(3),packageName:'@unit/native',packageVersion:'5.0.0'};
  assert.deepEqual(p.constructSelfConformanceModulePublication(basis),old.constructSelfConformanceModulePublication(basis));
});
