import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
export const root=resolve(import.meta.dirname,'../../..'),work=join(root,'work'),base=resolve(root,'..');
export const load=path=>import(pathToFileURL(join(work,'build/code/src',path+'.js')).href);
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
// Exact frozen declaration input copied for isolated integration; no native
// store is acquired or projected by the selected static test subset.
export const ready=JSON.parse(fs.readFileSync(join(root,'evidence/d2-program-ready.json')));
export const modules=Object.fromEntries(await Promise.all(['product/declaration_closure','product/publication','product/catalog','product/catalog_operations','gtl/semantic_revision_publication','gtl/semantic_revision_identity','gtl/semantic_stage_identity','gtl/declaration_references','product/worksite_construction','product/worksite_command_execution','product/worksite_revision_identity','shared/digests','shared/immutable','validator/validation'].map(async name=>[name,await load(name)])));
export const D=modules['gtl/semantic_stage_identity'].SEMANTIC_STAGE_IDS,R=modules['gtl/semantic_revision_identity'].SEMANTIC_REVISION_IDS;
export const C1=modules['product/worksite_construction'].WORKSITE_CONSTRUCTION_IDS,C2=modules['product/worksite_command_execution'].WORKSITE_COMMAND_EXECUTION_IDS,W=modules['product/worksite_revision_identity'].WORKSITE_REVISION_IDS;
export const hash=modules['shared/digests'].sha256Canonical,freeze=modules['shared/immutable'].deepFreeze;
export const closureOwner=modules['product/declaration_closure'];
export const publicationDigest=modules['product/publication'].modulePublicationSemanticDigest;
export const actual={catalog:ready.call.resources.catalog,view:ready.call.resources.catalogView};
export const gfRef=ready.resolution.graphFunctionRef,programRef=ready.programRef;
const roleBindings=new Map(['selection','projection','author','assessor','bridge','evidenceInput','terminal'].map(role=>[R[role+'BindingRef'],role]));
const boundRoles=g=>g.template.nodes.flatMap(n=>modules['gtl/declaration_references'].projectCProgramNodeDeclarationReferences(n.term).implementationBindingRefs).map(b=>roleBindings.get(b)).filter(Boolean);
export function graphOwners(closure,catalog){return closure.graphFunctionOwners.map(owner=>{
  const matches=catalog.boundPublications.filter(p=>p.moduleRef===owner.moduleRef&&p.owningProductId===owner.productId&&publicationDigest(p)===owner.publicationDigest).flatMap(p=>p.graphFunctions.filter(g=>g.name===owner.declarationRef));
  assert.equal(matches.length,1,owner.declarationRef);return matches[0];
});}
export const oldClosure=closureOwner.resolveExecutionDeclarationClosure(actual.catalog,actual.view,programRef,gfRef);
assert.equal(oldClosure.closureDigest,'sha256:36fe4ea9fe79190b7252b3b9666989914868a521d545cdf3689292f6f2eed50b');
export function reindex(catalog,allowlist=actual.view.allowlist){
  catalog=structuredClone(catalog);
  for(const e of catalog.entries){const {entryDigest,...body}=e;e.entryDigest=hash(body);}
  catalog.byHandle=Object.fromEntries(catalog.entries.map(e=>[e.handle,e]));
  return {catalog,view:modules['product/catalog'].narrowGraphFunctionCatalog(catalog,allowlist)};
}
// Pure constructor/carrier test data: these replacements are NOT a newly
// verified artifact, Catalog admission, execution basis or runtime history.
export function candidate(){
  const catalog=structuredClone(actual.catalog),changes=[];
  for(const publication of catalog.boundPublications){
    const before=publicationDigest(publication);
    publication.graphFunctions=publication.graphFunctions.map(g=>{
      const roles=boundRoles(g);if(roles.length===0)return g;
      let next;
      const input={graphFunctionRef:g.name,closureContractRef:g.declarations['abg.closure_contract'],
        ...(g.declarations['abg.child_closure_contract']===undefined?{}:{childClosureContractRef:g.declarations['abg.child_closure_contract']})};
      if(roles.length===1&&roles[0]==='selection')next=modules['gtl/semantic_revision_publication'].constructSemanticRevisionSelectionGraphFunction({...input,lifecycleRef:g.declarations['abg.semantic_revision_selection']});
      else if(roles.length===1)next=modules['gtl/semantic_revision_publication'].constructSemanticRevisionGraphFunction({...input,role:roles[0]});
      else if(g.name===R.graphFunctionRef){next={...g,declarations:{...g.declarations,'abg.semantic_revision_history':R.historicalOwnerDependencyRef}};}
      else throw new Error('Unrecognized fixture role composition: '+g.name);
      assert.deepEqual(next,{...g,declarations:{...g.declarations,'abg.semantic_revision_history':R.historicalOwnerDependencyRef}});
      changes.push(g.name);return next;
    });
    const after=publicationDigest(publication);
    if(before!==after)for(const row of catalog.entries.filter(r=>r.moduleRef===publication.moduleRef)){
      row.definition=publication.graphFunctions.find(g=>g.name===row.definitionRef);assert.ok(row.definition);
      row.definitionDigest=hash(row.definition);row.publicationDigest=after;
    }
  }
  return {...structuredClone(reindex(catalog)),changes};
}
export function resolveClosure(b,ref=gfRef,program=programRef){return closureOwner.resolveExecutionDeclarationClosure(b.catalog,b.view,program,ref);}
export async function retained(){
  const [store,prefixes,executions,calls,cursors,stage,revision,instructions,materialize]=await Promise.all(['abg/event_store','abg/event_prefix','abg/execution_basis','abg/c_call','abg/traversal_cursor','abg/semantic_stage','abg/semantic_revision','abg/instruction_assembly','gtl/materialize'].map(load));
  const path=join(base,'installed-continuation-09/installed-frame-01/events-01/runtime.events.jsonl'),bytes=fs.readFileSync(path),s=fs.lstatSync(path);
  assert.equal(sha(bytes),'4f561ceacf40fd13db82132d93890cb67750453dfa81a75c0401f04bd9345649');assert.equal(s.dev,16777230);assert.equal(s.ino,449590349);
  const prefixBytes=Buffer.from(bytes.toString().split('\n').slice(0,841).join('\n')+'\n');
  assert.equal(prefixBytes.length,13530062);assert.equal(sha(prefixBytes),'990c1759304eec8752e0bceed0c046869ac229df4d3ba8c179f24bbb35d2053f');
  const body={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:pathToFileURL(path).href,prefixLength:prefixBytes.length,
    prefixDigest:modules['shared/digests'].sha256Bytes(prefixBytes),storeIdentity:{device:s.dev,inode:s.ino,eventContractDigest:store.ROOT_EVENT_CONTRACT_DIGEST}};
  const durable=freeze({...body,coordinateDigest:hash(body)});
  assert.equal(durable.coordinateDigest,'sha256:776f03b3c790e07de2e51c8fc8939c7a4427ec17e0e705ccb98ba831e2a88f49');
  const events=store.readRuntimeEventsAtDurablePrefix(durable),prefix=prefixes.selectValidatedRuntimeEventPrefix(events);
  const execution=executions.rehydrateExecutionBasisAtPrefix(prefix,events[834].payload.basisRef);assert.ok(execution);
  const definitions=graphOwners(oldClosure,actual.catalog),gf=definitions.find(g=>g.name===execution.graphFunctionRef);assert.ok(gf);
  const graph=materialize.materializeGraph(gf,{invocationAdmissionRef:execution.invocationAdmissionRef,admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:execution.rawInputValue});
  const cCall=calls.projectOpenedCCallCarrierAtPrefix(prefix,graph,events[839].aggregateId);assert.ok(cCall);
  const event=events[838],cp=event.payload;
  const cursor=cursors.constructTraversalCursorCandidate({programRef:cp.programRef,executionBasisRef:cp.executionBasisRef,traversalScopeRef:cp.traversalScopeRef,runId:event.runId,graphCallId:event.graphCallId,frameId:event.frameId,graphRef:cp.materializationRef,inputRef:cp.inputRef,inputDigest:cp.inputDigest,currentNodeRef:graph.template.startNodeRef,position:'at_term',termPath:cp.termPath,taskOrdinal:cp.taskOrdinal,attempt:cp.attempt,retryPath:cp.retryPath});
  assert.equal(cursor.cursorDigest,cp.cursorDigest);assert.equal(cursors.hasAdmittedTraversalCursorAtPrefix(prefix,cursor),true);
  const publication=oldClosure.programPublication,lifecyclePublication=actual.catalog.boundPublications.find(p=>p.semanticLifecycle?.declarationRef===gf.declarations['abg.semantic_revision_selection']);
  assert.ok(lifecyclePublication);const sourcePublication=actual.catalog.boundPublications.find(p=>p.requirementHandoffs?.some(d=>d.declarationRef===lifecyclePublication.semanticLifecycle.sourceDeclarationRef));assert.ok(sourcePublication);
  const basis={publication,lifecyclePublication,sourcePublication,graph,graphFunction:gf,declarationGraphFunctions:definitions,executionBasis:execution,cCall,cursor,predecessorPrefix:durable};
  assert.ok(stage.authenticateSemanticStageBasis(basis));
  return {store,prefixes,executions,calls,cursors,stage,revision,instructions,events,prefix,basis,input:execution.rawInputValue,durable};
}
