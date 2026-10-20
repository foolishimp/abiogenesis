// Adapted from the existing core18 preparation. File correspondence only; no runtime or recipe execution.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {join, relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const D=import.meta.dirname,R='/Users/jim/src/apps/abiogenesis',T=join(R,'build_tenants/abiogenesis/typescript');
const Q=join(R,'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE'),P=join(D,'../qualification-core34-preparation-01');
const C=join(R,'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-37');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const record=p=>{const b=fs.readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
const save=(n,x)=>fs.writeFileSync(join(D,n),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const coord=p=>({ref:'repo://abiogenesis/'+relative(R,p),digest:'sha256:'+record(p).sha256});
const checked=p=>{const x=record(join(T,p));return {path:p,bytes:x.bytes,sha256:x.sha256};};
const exact=(p,x)=>{const a=record(p);assert.equal(a.sha256,x.sha256,p);assert.equal(a.bytes,x.bytes,p);return a;};
const files=(dir)=>fs.readdirSync(join(T,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(dir+'/'+e.name):e.isFile()?[dir+'/'+e.name]:[]);
const started=performance.now();
const core=read(join(C,'selected-core.json'));
assert.equal(core.basis.artifactDigest,'sha256:c676fad10c62aeea0331f1b926b882fd9d940b0d9b65ed18a35913f7334a6bbc');
assert.equal(core.basis.productContentDigest,'sha256:47eaa506935d1e125234196c983babd04328bcaf66c96a50c75b3d5c76f99f0e');
assert.equal(core.basis.manifestDigest,'sha256:e7ea2d44e1214675e92b19e30adf0343ed448206c7d309279a71f80cc072cfd5');
const correspondence=read(join(C,'package-correspondence.json'));
assert.equal(record(join(C,'archive-members.json')).sha256,correspondence.archiveMembersSha256);
assert.equal(correspondence.artifactDigest,core.basis.artifactDigest);
const q=await import(pathToFileURL(join(core.packageRoot,'build/code/src/validator/qualification_contracts.js')).href);
const v=createRequire(join(core.packageRoot,'package.json'))('valibot');
const generated=read(join(C,'generated-after.json')),buildInputs=read(join(C,'build-inputs.json'));
const rows=new Map([...buildInputs,...generated].map(x=>[x.path,x]));
// Current selected source candidates supplement the accepted package inputs. No completeness judgment follows.
for(const path of [...files('design'),...files('test_env/tests'),...files('test_env/support')])rows.set(path,checked(path));
const inventoryRows=[...rows.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'));
for(const x of inventoryRows)exact(join(T,x.path),x);
save('source-inventory.json',inventoryRows);
const inventorySha=record(join(D,'source-inventory.json')).sha256,oldRows=read(join(P,'source-inventory.json')),oldMap=new Map(oldRows.map(x=>[x.path,x]));
save('inventory-delta.json',{predecessor:record(join(P,'source-inventory.json')),acceptedBuildInputs:record(join(C,'build-inputs.json')),acceptedGenerated:record(join(C,'generated-after.json')),currentCandidateRoots:['design/','test_env/tests/','test_env/support/'],added:inventoryRows.filter(x=>!oldMap.has(x.path)),removed:oldRows.filter(x=>!rows.has(x.path)),changed:inventoryRows.filter(x=>oldMap.has(x.path)&&x.sha256!==oldMap.get(x.path).sha256).map(after=>({before:oldMap.get(after.path),after})),completeness:'candidate_population_only_independent_whole_subject_selection_pending'});
const input=read(join(P,'input-manifest.json')),changedInputs=[],reusedInputs=[];
for(const row of input.sourceFiles){
 const next=rows.get(row.path);assert.ok(next,row.path);
 if(next.sha256!==row.sha256){changedInputs.push({path:row.path,beforeSha256:row.sha256,afterSha256:next.sha256,bytes:next.bytes});Object.assign(row,{sha256:next.sha256,bytes:next.bytes,origin:join(T,row.path)});}
 else reusedInputs.push(row.path);
 exact(row.origin,row);
}
for(const dep of input.dependencies)exact(dep.origin,dep);
input.parentAcceptedSubject=core.basis.productContentDigest;input.tenantInventorySha256=inventorySha;input.sourceBytes=input.sourceFiles.reduce((n,x)=>n+x.bytes,0);
save('input-manifest.json',input);
save('source-input-delta.json',{predecessor:record(join(P,'input-manifest.json')),changed:changedInputs,reusedCount:reusedInputs.length,sourceCopies:0,preservation:'Current origins are checked against exact selected core37 input/generated records; the existing staging helper checks extent and digest again before copying. Changed or missing origins refuse. No Git lookup or source-body copy was performed.'});
save('expected-output-inventory.json',{basisInventorySha256:inventorySha,paths:generated});
const reusedControls=[];
for(const name of ['recipe.mjs','recipe-stage.mjs','compare-generated.mjs','test-environment.mjs','config.json','toolchain.json','npm-toolchain-inventory.json','test-selection.json','lint-population.json','release-claims.json','configuration-binding.json']){
 const source=join(P,name);fs.copyFileSync(source,join(D,name),fs.constants.COPYFILE_EXCL);reusedControls.push({...record(source),local:name});
}
// Reuse the existing package-export loader and start constructor, without importing or calling it.
fs.copyFileSync(join(Q,'native-material-01/public-support.mjs'),join(D,'public-support.mjs'),fs.constants.COPYFILE_EXCL);
reusedControls.push({...record(join(Q,'native-material-01/public-support.mjs')),local:'public-support.mjs'});
const recipe=read(join(P,'verification-recipe.json'));
for(const aux of recipe.auxiliaryInputs){const p=aux.relativePath.startsWith('recipe/')?join(D,aux.relativePath.slice(7)):input.dependencies.find(d=>d.target===aux.relativePath)?.origin;assert.ok(p,aux.relativePath);const row=record(p);aux.digest='sha256:'+row.sha256;aux.byteCount=row.bytes;}
v.parse(q.QUALIFICATION_VERIFICATION_RECIPE_SCHEMA,recipe);save('verification-recipe.json',recipe);
const config=read(join(D,'config.json')),binding=read(join(D,'configuration-binding.json'));
assert.equal(q.qualificationHash(binding.commands),recipe.commandConfigurationDigest);assert.equal(q.qualificationHash(binding.predicates),recipe.predicateConfigurationDigest);assert.equal(q.qualificationHash(binding.allowedWriteTerritories),recipe.writeTerritoriesDigest);
const selection=read(join(D,'test-selection.json'));
// Preserve checked test/title correspondence by exact unchanged selected files; do not run or expand tests.
for(const test of selection.tests)for(const path of test.files)assert.equal(rows.get(path).sha256,oldMap.get(path).sha256,'changed selected test needs a new selection: '+path);
const classify=p=>p.startsWith('design/')?['design']:p.startsWith('test_env/')?['proof']:p.startsWith('scripts/')?['execution_contract']:p.startsWith('contracts/qualification/')?['qualification']:p.startsWith('contracts/')?['public_contract']:p.startsWith('code/')||p.startsWith('build/')?['code']:['manifest'];
const classificationRef=coord(join(D,'activation.md')).ref;
const members=inventoryRows.map(x=>({ref:'repo://abiogenesis/build_tenants/abiogenesis/typescript/'+x.path,path:'build_tenants/abiogenesis/typescript/'+x.path,digest:'sha256:'+x.sha256,byteCount:x.bytes,surfaceRoles:classify(x.path),classificationEvidenceRefs:[classificationRef]}));
const authority=read(join(core.packageRoot,'contracts/qualification/authority-inputs.json'));
for(const x of authority.sources.filter(x=>x.ref.startsWith('repo://abiogenesis/'))){const path=x.ref.slice('repo://abiogenesis/'.length),actual=record(join(R,path));assert.equal('sha256:'+actual.sha256,x.digest,path);members.push({ref:x.ref,path,digest:x.digest,byteCount:actual.bytes,surfaceRoles:['constitutional'],classificationEvidenceRefs:[classificationRef]});}
for(const name of ['verification-recipe.json','recipe.mjs','recipe-stage.mjs','compare-generated.mjs','test-environment.mjs','config.json','input-manifest.json','expected-output-inventory.json','test-selection.json','lint-population.json','toolchain.json','npm-toolchain-inventory.json','release-claims.json','public-support.mjs']){
 const row=record(join(D,name)),path=relative(R,row.path);members.push({ref:'repo://abiogenesis/'+path,path,digest:'sha256:'+row.sha256,byteCount:row.bytes,surfaceRoles:[name==='release-claims.json'?'release_claim':name==='toolchain.json'||name==='npm-toolchain-inventory.json'?'manifest':'execution_contract'],classificationEvidenceRefs:[classificationRef]});
}
const inventory=q.constructQualificationIdentity({kind:'qualification_subject_inventory',selectedRoots:['repo://abiogenesis/build_tenants/abiogenesis/typescript/','repo://abiogenesis/specification/','repo://abiogenesis/stdo_abiogenesis.json',...members.filter(x=>x.path.startsWith('.ai-workspace/')).map(x=>x.ref)],coverage:'incomplete',members},'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');
v.parse(q.QUALIFICATION_INVENTORY_SCHEMA,inventory);save('qualification-inventory.json',inventory);
const law=read(join(core.packageRoot,'contracts/qualification/law-basis.json')),coverage=read(join(core.packageRoot,'contracts/qualification/coverage.json'));
assert.equal(authority.method.installedManifestDigest,'sha256:5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64');
const template=read(join(P,'basis-template.json'));
Object.assign(template.body,{sourceInventory:{ref:inventory.inventoryRef,digest:inventory.inventoryDigest},artifact:{ref:core.artifactRef,digest:core.basis.artifactDigest},productManifest:{ref:'repo://abiogenesis/build_tenants/abiogenesis/typescript/product-toolchain-manifest.json',digest:core.basis.manifestDigest},productContentDigest:core.basis.productContentDigest,toolchain:coord(join(D,'toolchain.json')),installedProduct:null,workspaceBinding:null,tenantManifest:null,coverageCatalog:{ref:coverage.catalogRef,digest:coverage.catalogDigest},lawBasis:{ref:law.lawBasisRef,digest:law.lawBasisDigest}});
template.body.prospectiveRelease.releaseClaim=coord(join(D,'release-claims.json'));save('basis-template.json',template);
const recipeBytes=fs.readFileSync(join(D,'verification-recipe.json')),recipeMember=members.find(x=>x.path===relative(R,join(D,'verification-recipe.json')));
save('verification-selection-binding.json',{recipe:{ref:recipeMember.ref,path:recipeMember.path,digest:recipeMember.digest,byteCount:recipeMember.byteCount,contentBase64:recipeBytes.toString('base64')},recipePath:'recipe/verification-recipe.json',missing:'executionSelectionRef remains absent until actual same-subject admitted observed-root-C2 Result exists.'});
const evidencePaths=[join(C,'return.md'),join(C,'accepted-source.json'),join(C,'build-inputs.json'),join(C,'generated-after.json'),join(C,'archive-members.json'),join(C,'package-correspondence.json'),join(P,'return.md'),join(P,'checks.json'),join(Q,'return.md'),join(D,'../native34-continuation-01/release-readiness-01/return.md')];
const evidence=evidencePaths.map(record);assert.equal(evidence.at(-1).sha256,'a2099be52091d46280b49e91c4f07404a79b542deb1bb4b0a288df2f68adbb42');
save('candidate-selection.json',{status:'prepared_core37_not_a_qualification_basis',core,sourceCheckpoint:{kind:'exact_core37_package_inputs_plus_explicit_current_candidate_inventory',buildInputs:record(join(C,'build-inputs.json')),acceptedSource:record(join(C,'accepted-source.json')),sourceInventory:record(join(D,'source-inventory.json'))},lawBasis:{ref:law.lawBasisRef,digest:law.lawBasisDigest},coverage:{ref:coverage.catalogRef,digest:coverage.catalogDigest},consumer:{label:'unchanged_dev15_witness_dependency_only',artifactDigest:'sha256:0d56f168bf4afbcffd0e264e298f6bd1429e9546b39d4c7823e0f3c086afc964',productContentDigest:'sha256:33d8bc33935403c959114c13566a198660e34a3659213ad478c3c37e4064bd5e',manifestDigest:'sha256:0327ef3c929aecdd282342f93304ed45e1ae2fdeb71a528b4d113984cfdaf6ee',evidence:record(join(C,'return.md')),admittedBinding:null},executedHere:false});
save('reuse-selection.json',{status:'mechanical_preparation_only',evidence,reusedControls,sourceInputs:{unchanged:reusedInputs.length,changed:changedInputs.length,copied:0},dependencies:{reused:input.dependencies.length,copied:0,digestsChecked:true},acceptedPackageCorrespondence:'Reused closed 5233-member source/archive/install correspondence; no archive expansion or full package re-verification.',toolchain:'Exact unchanged toolchain and npm inventory controls reused from closed core18 checks; no present host executable or full npm population requalification. Later execution must preserve or refresh the actual executable premise.',coverageDomain:'Same installed source-linked catalog, no new executable roster; F11 owns applicability/sufficiency.'});
save('checks.json',{status:'CLOSED_MECHANICAL_PREPARATION_NATIVE_UNBOUND',sourceInventoryMembers:inventoryRows.length,qualificationInventoryMembers:members.length,inventoryCoverage:inventory.coverage,sourceInputs:input.sourceFiles.length,sourceInputsChanged:changedInputs.length,sourceInputsReused:reusedInputs.length,expectedGenerated:generated.length,commands:config.commands.length,predicates:config.outcomePredicates.length,testCommands:selection.tests.length,selectedTitles:selection.tests.reduce((n,x)=>n+x.selectedTitles.length,0),dependencies:input.dependencies.length,inventorySchema:true,recipeSchema:true,configurationBindings:true,sourceAndAuxiliaryBindings:true,selectedTestsByteIdentical:true,inventoryDigest:inventory.inventoryDigest,recipeDigest:recipeMember.digest,elapsedMs:performance.now()-started,runtimeCalls:0,testsExecuted:0,sourceCopies:0,archiveExpansions:0,gitCalls:0});
console.log(JSON.stringify(read(join(D,'checks.json'))));
