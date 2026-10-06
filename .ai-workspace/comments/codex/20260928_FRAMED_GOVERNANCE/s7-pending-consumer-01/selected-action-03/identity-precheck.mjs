import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
const proof=new URL('.',import.meta.url).pathname,repo=process.cwd();
const predecessor=JSON.parse(await readFile(join(proof,'../selected-action-02/environment.json'),'utf8'));
const core=predecessor.installedRoot,load=p=>import(pathToFileURL(join(core,`build/code/src/${p}.js`)).href);
const product=await load('product/index'),gtl=await load('gtl/index'),validator=await load('validator/index');
const f=await import(pathToFileURL(join(repo,'build_tenants/abiogenesis/typescript/test_env/fixtures/t287-selected-action-product/index.mjs')).href);
const {rawProgramInput,requireRawAdmission}=await import(pathToFileURL(join(repo,'build_tenants/abiogenesis/typescript/test_env/support/root-installed-environment.mjs')).href);
const authored=f.declarations(gtl),coordinate=product.sha256Canonical({fixtureIdentityPrecheck:true});
const published=gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...authored,artifactDigest:coordinate,productContentDigest:coordinate,productManifestDigest:coordinate,contributions:authored.contributions.map(c=>({...c,provenanceRefs:[coordinate]}))});
const admitted=requireRawAdmission(validator,published,'module_publication','contract://abiogenesis/gtl/module-publication@5'),program=admitted.value.programs.find(p=>p.programRef===f.ref('program','root'));
const validation=validator.validateProgram(rawProgramInput(validator,admitted,program));assert.equal(validation.kind,'program_validation',JSON.stringify(validation));
assert.notEqual(f.actionCatalog.catalogDigest,program.actionCatalog.catalogDigest,'precheck must expose authored/admitted identity difference');
const checks=[];
for(const phase of [0,1]){
 const input={...f.fixtureInput({workspaceBinding:predecessor.workspaceBinding,program}),phase};input.task={...input.task,payload:phase===0?'first action':'selected second action'};
 const basis=f.gap(f.model(input).resultCandidate).resultCandidate,refresh=f.refreshGap(f.refreshModel({kind:'identity_precheck_evaluation',observationSnapshot:input}).resultCandidate).resultCandidate,choice=f.next(basis).resultCandidate;
 for(const b of [basis,refresh]){assert.deepEqual(b.admittedActionCatalog,program.actionCatalog);assert.deepEqual(b.observationSnapshot.actionCatalog,program.actionCatalog);assert.deepEqual(b.declaredPolicy,program.constructionComposition.closurePolicy);}
 const selected=program.actionCatalog.rows.find(row=>row.actionRef===f.ref('action',phase===0?'initial':'consumer'));assert.equal(choice.selectedActionRef,selected.actionRef);
 for(const field of ['programRef','graphFunctionRef','targetProgramLocusRef','targetObligationRefs','inputAssetRefs','outputAssetRefs','expectedDeltaRef','progressConditionRef','stopConditionRef'])assert.deepEqual(choice[field],selected[field]);
 assert.equal(choice.priorityProjection.orderedActionRefs[0],selected.actionRef);assert.equal(choice.targetObligationBindings[0].eligibleActionRefs[0],selected.actionRef);
 checks.push({phase,initialCatalogDigest:basis.admittedActionCatalog.catalogDigest,refreshCatalogDigest:refresh.admittedActionCatalog.catalogDigest,selectedActionRef:choice.selectedActionRef,targetInputDigest:basis.targetInputDigest});
}
const result={status:'passed',scope:'pure targeted fixture correspondence using exact predecessor installed GTL publication normalization; no traversal or new runtime events',coreArchive:predecessor.artifactPaths[0],coreArchiveSha256:await product.sha256File(predecessor.artifactPaths[0]),programDigest:product.sha256Canonical(program),authorCatalogDigest:f.actionCatalog.catalogDigest,admittedCatalogDigest:program.actionCatalog.catalogDigest,admittedCallableMembership:program.callableMembership,validation:{kind:validation.kind,diagnostics:validation.diagnostics},checks,policyWorkGrants:'The existing setup owner constructs these from executionResolution.program; successor host asserts policy and invocation correspondence before traversal.'};await writeFile(join(proof,'identity-precheck.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
