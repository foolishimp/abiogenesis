// Pure installed declaration construction from CLOSED snapshots only.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {loadRuntime} from './public-support.mjs';
const D=import.meta.dirname,read=async n=>JSON.parse(await fs.readFile(path.join(D,n),'utf8'));
const write=(n,v)=>fs.writeFile(path.join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const core=await read('selected-core.json'),{product,validator,gtl}=await loadRuntime(core.installedRoot);
const catalog=await read('retained-catalog.json'),environment=await read('closed-current-environment.json');
const gf=gtl.QUALIFICATION_IDS.assessGraph,programRef='program://abiogenesis/qualification/assess@5';
assert.equal(catalog.boundPublications.length,11);
const view=product.narrowGraphFunctionCatalog(catalog,[gf]);
assert.equal(view.kind,'graph_function_catalog_view');assert.deepEqual(view.allowlist,[gf]);
const closure=product.resolveExecutionDeclarationClosure(catalog,view,programRef,gf);
assert.equal(closure.kind,'resolved_execution_declaration_closure',JSON.stringify(closure));
const programClosure=product.resolveProgramDeclarationClosure(catalog,view,programRef);
assert.equal(programClosure.kind,'resolved_program_declaration_closure',JSON.stringify(programClosure));
const publication=catalog.boundPublications.find(p=>p.programs.some(q=>q.programRef===programRef)),program=publication.programs.find(p=>p.programRef===programRef);
assert.ok(program);assert.deepEqual(program.callableMembership,[gf]);
assert.deepEqual(publication.runEnvironments??[],[]);assert.equal(program.policies['abg.run_environment'],undefined);
const validationInput=product.constructCatalogProgramValidationInput(catalog,view,programClosure,program);
assert.notEqual(validationInput.kind,'raw_admission_refusal',JSON.stringify(validationInput));
const validation=validator.validateProgram(validationInput);assert.equal(validation.kind,'program_validation',JSON.stringify(validation));
assert.equal(validation.executableLeafRows.length,1);assert.equal(validation.executableLeafRows[0].fibre,'F_P');
assert.equal(validation.interactionLeafRows.length,0);
const hash=product.sha256Canonical,c=(ref,digest)=>({ref,digest});
const proof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog,catalogView:view};
const law=c('law://abiogenesis/validator/gtl-program@5',hash({ref:'law://abiogenesis/validator/gtl-program@5'}));
const conformance={request:{program:c(programRef,hash(program)),conformanceLaw:law,
 inventoryBasis:{kind:'declared_inventory',inventory:catalog.boundPublications.map(p=>c(p.moduleRef,hash(p))).sort((a,b)=>a.ref.localeCompare(b.ref))}},
 resources:{kind:'conformance_evaluation_resource_assertion',schemaVersion:'5.0.0',packet:{kind:'conformance_evaluate_packet',schemaVersion:'5.0.0',memberKey:'gtl_program',publication,program},conformanceLaw:law,declaredInventory:catalog.boundPublications,declarationCatalog:{catalog,catalogView:view}}};
await write('assessment-view.json',view);await write('assessment-declarations.json',[proof]);
await write('assessment-program.json',{programRef,graphFunctionRef:gf,programLocusRef:'node://abiogenesis/qualification/assess@5',program,publication,
 rootActorRef:environment.workspaceBinding.authorizedActorRef,ownerAuthorityRef:'actor-capability://abiogenesis/qualification/product-owner@5',
 exactProgramDigest:hash(program),viewDigest:view.viewDigest,catalogBasisDigest:catalog.basisDigest});
await write('conformance-input.json',conformance);
const joins={status:'PASSED_PURE_DECLARATION_CONSTRUCTION',catalogPublications:11,viewAllowlist:view.allowlist,
 actualInstalledFunctions:['narrowGraphFunctionCatalog','resolveExecutionDeclarationClosure','resolveProgramDeclarationClosure','constructCatalogProgramValidationInput','validateProgram'],
 programDigest:hash(program),viewDigest:view.viewDigest,catalogBasisDigest:catalog.basisDigest,
 rootActorRef:environment.workspaceBinding.authorizedActorRef,implementation:validation.executableLeafRows,
 futureNative:'Ordinary view admission, conformance, actual current execution resolution/start and two cold reads remain unexecuted',
 nativeCalls:0,movingResourceReads:0};
await write('declaration-owner-joins.json',joins);
for(const n of ['assessment-view.json','assessment-declarations.json','assessment-program.json','conformance-input.json']){
 const b=await fs.readFile(path.join(D,n));console.log(JSON.stringify({path:path.join(D,n),bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')}));
}
