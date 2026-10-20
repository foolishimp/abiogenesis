// Declaration/component proof only: artifact coordinates, workspace authority,
// and declaration closure input are supplied premises, never native admissions.
import assert from 'node:assert/strict';
import test from 'node:test';
import * as p from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as v from '../../build/code/src/validator/index.js';
import { validRunEnvironmentProgram } from '../../build/code/src/gtl/stdo_run_environment.js';
import { resolveProgramStart } from '../../build/code/src/gtl/public_start.js';
import { genericRevisionPublicationData, genericRevisionIds } from '../support/t287-generic-job-revision.mjs';
const hash=p.sha256Canonical,ids=p.WORKSITE_COMMAND_EXECUTION_IDS,revision=p.WORKSITE_REVISION_IDS;
const basis={productId:p.ABI5_PRODUCT_ID,packageName:p.ABI5_PACKAGE_NAME,packageVersion:p.ABI5_PACKAGE_VERSION,
  artifactDigest:hash('supplied-artifact'),productContentDigest:hash('supplied-content'),productManifestDigest:hash('supplied-manifest')};
const publications=[gtl.constructHelloWorldModulePublication,gtl.constructConsensusModulePublication,
  gtl.constructWorksiteConstructionModulePublication,gtl.constructWorksiteCommandExecutionModulePublication,
  gtl.constructWorksiteCommandForwardModulePublication,gtl.constructRequirementHandoffModulePublication,
  gtl.constructSemanticStageModulePublication,gtl.constructSemanticRevisionModulePublication,
  gtl.constructSelfConformanceModulePublication,gtl.constructNativeWorkspaceWorkModulePublication].map(f=>f(basis));
const publication=publications.find(x=>x.moduleRef===ids.moduleRef),root=publication.programs.find(x=>x.programRef===ids.programRef);
const child=publication.programs.find(x=>x.callableMembership.includes(revision.graphFunctionRef));
const raw=(value,kind)=>{const r=v.rawAdmitValue(value,kind,'contract://component/c2-child/'+kind);assert.equal(r.kind,'raw_admitted_value');return r;};
const validatePublication=p=>v.validatePublication(raw(p,'module_publication'),p.contributions.map(c=>raw(c,'catalog_contribution')));
function validateProgram(owner,program,owners=publications){
 const unique=(rows,key)=>[...new Map(rows.map(x=>[x[key],x])).values()];
 const admitted=raw(owner,'module_publication');
 return v.validateProgram({declarationBasisDigest:admitted.subjectDigest,programPublication:admitted,program:raw(program,'gtl_program'),
  graphFunctions:unique(owners.flatMap(p=>p.graphFunctions).filter(g=>program.callableMembership.includes(g.name)),'name').map(g=>raw(g,'graph_function')),
  contracts:unique(owners.flatMap(p=>p.contracts),'contractRef').map(c=>raw(c,'contract_declaration')),
  implementationBindings:unique(owners.flatMap(p=>p.implementationBindings),'bindingRef').map(b=>raw(b,'implementation_binding')),
  closureContracts:unique(owners.flatMap(p=>p.closureContracts),'closureContractRef').map(c=>raw(c,'closure_contract')),
  rules:[],evaluators:[]});
}
test('complete core publication validation and catalog construction retain every contribution',()=>{
 for(const owner of publications){const result=validatePublication(owner);assert.equal(result.kind,'publication_validation',JSON.stringify(result));}
 const catalog=p.buildGraphFunctionCatalog(publications);assert.equal(catalog.kind,'graph_function_catalog',JSON.stringify(catalog));
 assert.equal(catalog.entries.length+catalog.declarationEntries.length,publications.reduce((n,p)=>n+p.contributions.length,0));
 const entry=p.lookupGraphFunction(p.narrowGraphFunctionCatalog(catalog,[revision.graphFunctionRef]),revision.graphFunctionRef);
 assert.ok(entry);assert.deepEqual(entry.programMembershipRefs,[child.programRef]);
 for(const refs of [[],['program://component/foreign']]){
  const crossed=structuredClone(publication);crossed.contributions.find(c=>c.handle===revision.graphFunctionRef).programMembershipRefs=refs;
  const refused=validatePublication(crossed);assert.equal(refused.kind,'static_validation_refusal');
  assert.ok(refused.diagnostics.some(d=>d.code==='missing_membership'&&d.path.includes(revision.graphFunctionRef)));
 }
});
test('revision no-start Program validates with its existing child closure and leaves root environment exact',()=>{
 assert.deepEqual(child.starts,[]);assert.deepEqual(child.callableMembership,[revision.graphFunctionRef]);
 assert.equal(child.closureContractRef,revision.childClosureContractRef);assert.equal(child.policies['abg.root_mode'],'supervised');
 const result=validateProgram(publication,child);assert.equal(result.kind,'program_validation',JSON.stringify(result));
 assert.equal(validRunEnvironmentProgram(publication,root,publication.graphFunctions),true);
 assert.deepEqual(root.callableMembership,[ids.graphFunctionRef]);
 const crossed={...root,callableMembership:[...root.callableMembership,revision.graphFunctionRef]};
 assert.equal(validRunEnvironmentProgram(publication,crossed,publication.graphFunctions),false,'rejected root/environment relation stays rejected');
});
test('revision no-start Program refuses public starts and direct root invocation',()=>{
 for(const request of [{scope:'program',target:'next',until:'converged',rootMode:'direct'},
  {scope:'program',target:'start://component/guessed',startRef:'start://component/guessed',until:'converged',rootMode:'supervised'}]){
  assert.equal(resolveProgramStart(child,request).kind,'program_start_refusal');
 }
 const catalog=p.buildGraphFunctionCatalog(publications),view=p.narrowGraphFunctionCatalog(catalog,[revision.graphFunctionRef]);
 const selected=p.lookupGraphFunction(view,revision.graphFunctionRef);
 // Supplied workspace identity is sufficient only to construct a Product policy;
 // the exact supervised guard refuses before any authority/admission/effect.
 const workspace={authorityBasisId:'authority://component',authorityBasisDigest:hash('authority'),authorizedActorRef:'actor://component',
  bindingId:'binding://component',bindingDigest:hash('binding')};
 const policy=p.constructRootInvocationPolicy(workspace,child,[],['F_P']);
 const request=v.rawAdmitValue({kind:'public_invocation',operationId:'abg.operation.run.invoke',variant:'direct',invocationRef:'invocation://component'},
  'public_operation_request','contract://abiogenesis/public/run-invoke-request@5');
 const refused=p.constructDirectInvocation(workspace,view,child,selected,request,
  raw({kind:'worksite_revision_command_execution_task'},'invocation_input'),policy,[],null);
 assert.equal(refused.kind,'invocation_construction_refusal');assert.equal(refused.code,'authority_mismatch');
 assert.match(refused.message,/supervised Program/);
});
test('existing generic correction parent still composes the unchanged revision child',()=>{
 const abiPublication=publications.find(p=>p.moduleRef===gtl.SEMANTIC_STAGE_IDS.moduleRef);
 const data=genericRevisionPublicationData({product:p,gtl,abiPublication});
 const owner=gtl.modulePublication({...data,kind:'module_publication',moduleVersion:'5.0.0',
  artifactDigest:hash('consumer-artifact'),productContentDigest:hash('consumer-content'),productManifestDigest:hash('consumer-manifest'),
  contributions:data.contributions.map(c=>({...c,provenanceRefs:[hash('consumer-artifact'),hash('consumer-manifest')]}))});
 const parent=owner.programs.find(p=>p.programRef===genericRevisionIds.repairProgramRef);assert.ok(parent.callableMembership.includes(revision.graphFunctionRef));
 const graph=owner.graphFunctions.find(g=>g.name==='graph-function://generic-job-mechanics.example/repair-worksite@5');assert.ok(graph);
 const execute=graph.template.nodes.find(n=>n.nodeRef==='node://generic-job-mechanics.example/repair-worksite-execute@5');
 assert.ok(JSON.stringify(execute.term).includes(JSON.stringify(revision.graphFunctionRef)),'actual declared workflow target');
 const result=validateProgram(owner,parent,[...publications,owner]);assert.equal(result.kind,'program_validation',JSON.stringify(result));
 const missing=structuredClone(parent);missing.callableMembership=missing.callableMembership.filter(x=>x!==revision.graphFunctionRef);
 const crossed=structuredClone(owner);crossed.programs=crossed.programs.map(x=>x.programRef===parent.programRef?missing:x);
 assert.equal(validateProgram(crossed,missing,[...publications,crossed]).kind,'static_validation_refusal','removing child membership breaks the same parent');
});
