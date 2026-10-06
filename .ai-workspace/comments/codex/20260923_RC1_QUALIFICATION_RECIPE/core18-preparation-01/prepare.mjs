// Finite identity/schema preparation only. Never stages inputs or invokes commands/runtime.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const D=import.meta.dirname,R='/Users/jim/src/apps/abiogenesis',T=join(R,'build_tenants/abiogenesis/typescript');
const Q=join(R,'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE');
const P=join(Q,'successor-07'),C=join(R,'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-18');
const COMMIT='701026970da59538e6dcc203ada4538b80e3d6de';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const record=p=>{const b=fs.readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
const save=(n,x)=>fs.writeFileSync(join(D,n),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const started=performance.now();
try {
 const core=read(join(C,'selected-core.json'));
 assert.equal(core.basis.artifactDigest,'sha256:64093fb74a474c7e246333975c556c4cb34797326dbc81d1c5929455a69498bb');
 assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:R,encoding:'utf8'}).trim(),COMMIT);
 const product=await import(pathToFileURL(join(core.packageRoot,'build/code/src/product/index.js')).href);
 const q=await import(pathToFileURL(join(core.packageRoot,'build/code/src/validator/qualification_contracts.js')).href);
 const v=createRequire(join(core.packageRoot,'package.json'))('valibot');
 const canonical=x=>product.sha256Canonical(x);
 const oldRows=read(join(P,'source-inventory.json'));
 const currentRows=read(join(C,'source-freeze-before-build.json')).members;
 const generated=read(join(C,'generated-after.json'));
 const rows=new Map(currentRows.map(x=>[x.path,x]));
 for(const x of generated)rows.set(x.path,x);
 const inventoryRows=[...rows.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'));
 for(const x of inventoryRows){const r=record(join(T,x.path));assert.equal(r.sha256,x.sha256,x.path);assert.equal(r.bytes,x.bytes,x.path);}
 const sourceInventoryBytes=Buffer.from(JSON.stringify(inventoryRows,null,2)+'\n');
 fs.writeFileSync(join(D,'source-inventory.json'),sourceInventoryBytes,{flag:'wx'});
 const inventorySha=sha(sourceInventoryBytes),oldMap=new Map(oldRows.map(x=>[x.path,x]));
 const sourceDelta={predecessor:record(join(P,'source-inventory.json')),sourceCommit:COMMIT,
  added:inventoryRows.filter(x=>!oldMap.has(x.path)),removed:oldRows.filter(x=>!rows.has(x.path)),
  changed:inventoryRows.filter(x=>oldMap.has(x.path)&&x.sha256!==oldMap.get(x.path).sha256).map(after=>({before:oldMap.get(after.path),after}))};
 save('inventory-delta.json',sourceDelta);
 const input=read(join(P,'input-manifest.json')),changedInputs=[],reusedInputs=[];
 for(const row of input.sourceFiles){
  const next=rows.get(row.path);assert.ok(next,row.path);
  if(next.sha256!==row.sha256){
   const origin=join(T,row.path),gitPath='build_tenants/abiogenesis/typescript/'+row.path;
   const gitBytes=execFileSync('git',['show',COMMIT+':'+gitPath],{cwd:R,maxBuffer:8*1024*1024});
   assert.equal(sha(gitBytes),next.sha256,'exact checkpoint '+row.path);
   changedInputs.push({path:row.path,beforeSha256:row.sha256,afterSha256:next.sha256,origin,immutableSource:{commit:COMMIT,path:gitPath},bytes:next.bytes});
   Object.assign(row,{sha256:next.sha256,bytes:next.bytes,origin});
  }else reusedInputs.push(row.path);
  const actual=record(row.origin);assert.equal(actual.sha256,row.sha256);assert.equal(actual.bytes,row.bytes);
 }
 for(const dep of input.dependencies){const actual=record(dep.origin);assert.equal(actual.sha256,dep.sha256);assert.equal(actual.bytes,dep.bytes);}
 input.parentAcceptedSubject='sha256:3aa415ff96c7f8646cd1701ea9060fa1a517a57869b6e44db3e357de8c3f3f95';
 input.tenantInventorySha256=inventorySha;input.sourceBytes=input.sourceFiles.reduce((n,x)=>n+x.bytes,0);
 save('input-manifest.json',input);
 save('source-input-delta.json',{changed:changedInputs,reusedCount:reusedInputs.length,sourceCopies:0,
  preservation:'Changed inputs are exact current files matched to the immutable Git checkpoint. Existing recipe verifies extent and digest before staging. If moved or changed, stop; a later selected staging activation may restore these exact Git blobs to its own destination. No mutable path is trusted by name.'});
 save('expected-output-inventory.json',{basisInventorySha256:inventorySha,paths:generated});
 const reusedControls=[];
 for(const name of ['recipe.mjs','recipe-stage.mjs','compare-generated.mjs','test-environment.mjs','config.json','toolchain.json','npm-toolchain-inventory.json','test-selection.json','lint-population.json','release-claims.json','configuration-binding.json']){
  const source=join(P,name),bytes=fs.readFileSync(source);fs.writeFileSync(join(D,name),bytes,{flag:'wx'});reusedControls.push({...record(source),local:name});
 }
 const recipe=read(join(P,'verification-recipe.json'));
 for(const aux of recipe.auxiliaryInputs){
  const p=aux.relativePath.startsWith('recipe/')?join(D,aux.relativePath.slice(7)):input.dependencies.find(d=>d.target===aux.relativePath)?.origin;
  assert.ok(p,aux.relativePath);const row=record(p);aux.digest='sha256:'+row.sha256;aux.byteCount=row.bytes;
 }
 v.parse(q.QUALIFICATION_VERIFICATION_RECIPE_SCHEMA,recipe);save('verification-recipe.json',recipe);
 const config=read(join(D,'config.json')),binding=read(join(D,'configuration-binding.json'));
 assert.equal(canonical(binding.commands),recipe.commandConfigurationDigest);
 assert.equal(canonical(binding.predicates),recipe.predicateConfigurationDigest);
 assert.equal(canonical(binding.allowedWriteTerritories),recipe.writeTerritoriesDigest);
 assert.deepEqual(config,read(join(P,'config.json')));
 const testSelection=read(join(D,'test-selection.json')),ts=createRequire(join(T,'package.json'))('typescript');
 const testDomains=[];
 for(const selection of testSelection.tests){
  const titles=[];
  for(const file of selection.files){const tree=ts.createSourceFile(file,fs.readFileSync(join(T,file),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
   for(const s of tree.statements)if(ts.isExpressionStatement(s)&&ts.isCallExpression(s.expression)&&ts.isIdentifier(s.expression.expression)&&s.expression.expression.text==='test'){
    assert.ok(ts.isStringLiteralLike(s.expression.arguments[0]));titles.push(s.expression.arguments[0].text);
   }
  }
  const cmd=config.commands.find(x=>x.commandId===selection.commandId),pattern=cmd.args.find(x=>x.startsWith('--test-name-pattern='));
  const selected=pattern?titles.filter(x=>new RegExp(pattern.slice('--test-name-pattern='.length)).test(x)):titles;
  assert.deepEqual(selected,selection.selectedTitles);assert.equal(selected.length,selection.expectedTestCount);
  testDomains.push({commandId:selection.commandId,files:selection.files,selectedTitles:selected,scope:selection.premises,executed:false});
 }
 const toolchain=read(join(D,'toolchain.json'));
 for(const tool of [toolchain.node,toolchain.npm])assert.equal(record(tool.invokedPath).sha256,tool.sha256);
 const npm=read(join(D,'npm-toolchain-inventory.json'));
 for(const row of npm.files){const actual=record(join(npm.root,row.path));assert.equal(actual.sha256,row.sha256);assert.equal(actual.bytes,row.bytes);}
 const classify=p=>p.startsWith('design/')?['design']:p.startsWith('test_env/')?['proof']:p.startsWith('scripts/')?['execution_contract']:p.startsWith('contracts/qualification/')?['qualification']:p.startsWith('contracts/')?['public_contract']:p.startsWith('code/')||p.startsWith('build/')?['code']:['manifest'];
 const classificationRef='selection://abiogenesis/rc1/core18-preparation-01';
 const members=inventoryRows.map(x=>({ref:'repo://abiogenesis/build_tenants/abiogenesis/typescript/'+x.path,path:'build_tenants/abiogenesis/typescript/'+x.path,digest:'sha256:'+x.sha256,byteCount:x.bytes,surfaceRoles:classify(x.path),classificationEvidenceRefs:[classificationRef]}));
 const authority=read(join(core.packageRoot,'contracts/qualification/authority-inputs.json'));
 for(const x of authority.sources.filter(x=>x.ref.startsWith('repo://abiogenesis/'))){const path=x.ref.slice('repo://abiogenesis/'.length),actual=record(join(R,path));assert.equal('sha256:'+actual.sha256,x.digest);members.push({ref:x.ref,path,digest:x.digest,byteCount:actual.bytes,surfaceRoles:['constitutional'],classificationEvidenceRefs:[classificationRef]});}
 for(const name of ['verification-recipe.json','recipe.mjs','recipe-stage.mjs','compare-generated.mjs','test-environment.mjs','config.json','input-manifest.json','expected-output-inventory.json','test-selection.json','lint-population.json','toolchain.json','npm-toolchain-inventory.json','release-claims.json']){
  const row=record(join(D,name)),path=row.path.slice(R.length+1);members.push({ref:'repo://abiogenesis/'+path,path,digest:'sha256:'+row.sha256,byteCount:row.bytes,surfaceRoles:[name==='release-claims.json'?'release_claim':name==='toolchain.json'||name==='npm-toolchain-inventory.json'?'manifest':'execution_contract'],classificationEvidenceRefs:[classificationRef]});
 }
 const inventory=q.constructQualificationIdentity({kind:'qualification_subject_inventory',selectedRoots:['repo://abiogenesis/build_tenants/abiogenesis/typescript/','repo://abiogenesis/specification/','repo://abiogenesis/stdo_abiogenesis.json',...members.filter(x=>x.path.startsWith('.ai-workspace/')).map(x=>x.ref)],coverage:'incomplete',members},'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');
 v.parse(q.QUALIFICATION_INVENTORY_SCHEMA,inventory);save('qualification-inventory.json',inventory);
 const law=read(join(core.packageRoot,'contracts/qualification/law-basis.json')),coverage=read(join(core.packageRoot,'contracts/qualification/coverage.json'));
 const template=read(join(P,'basis-template.json'));
 const coord=name=>{const m=members.find(x=>x.path.endsWith('/core18-preparation-01/'+name));return {ref:m.ref,digest:m.digest};};
 Object.assign(template.body,{sourceInventory:{ref:inventory.inventoryRef,digest:inventory.inventoryDigest},artifact:{ref:core.artifactRef,digest:core.basis.artifactDigest},productManifest:{ref:'repo://abiogenesis/build_tenants/abiogenesis/typescript/product-toolchain-manifest.json',digest:core.basis.manifestDigest},productContentDigest:core.basis.productContentDigest,toolchain:coord('toolchain.json'),installedProduct:null,workspaceBinding:null,tenantManifest:null,coverageCatalog:{ref:coverage.catalogRef,digest:coverage.catalogDigest},lawBasis:{ref:law.lawBasisRef,digest:law.lawBasisDigest}});
 template.body.prospectiveRelease.releaseClaim=coord('release-claims.json');
 template.status='unbound_preparation_only_incomplete_inventory_no_basis_identity_minted';save('basis-template.json',template);
 const recipeBytes=fs.readFileSync(join(D,'verification-recipe.json')),recipeMember=members.find(x=>x.path.endsWith('/core18-preparation-01/verification-recipe.json'));
 save('verification-selection-binding.json',{recipe:{ref:recipeMember.ref,path:recipeMember.path,digest:recipeMember.digest,byteCount:recipeMember.byteCount,contentBase64:recipeBytes.toString('base64')},recipePath:'recipe/verification-recipe.json',missing:'executionSelectionRef remains absent until actual same-subject admitted observed-root-C2 Result exists.'});
 const preparedPath='/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260924_HELLO_PROJECT_BASELINE/fresh-native-01/opus-successor-04/caller/jobs/basic-cli/prepared.json';
 const consumer=read(preparedPath).oddGlcArtifact;
 assert.equal(consumer.artifactDigest,'sha256:aef3df7a43da5d8af620c624a4c88f5eb30b6de26437458a8fd81156b6d877c9');
 save('candidate-selection.json',{status:'Root_selected_preparation_not_final_qualification_basis',core,sourceCommit:COMMIT,sourceFreeze:record(join(C,'source-freeze-before-build.json')),generatedInventory:record(join(C,'generated-after.json')),archiveMemberInventory:record(join(C,'archive-members.json')),coreConstruction:record(join(C,'return.md')),lawBasis:{ref:law.lawBasisRef,digest:law.lawBasisDigest},coverage:{ref:coverage.catalogRef,digest:coverage.catalogDigest},consumer:{...consumer,coordinateEvidence:record(preparedPath),scope:'unchanged dev8 witness dependency, not part of ABI candidate identity; coordinate record does not relabel historical core17 execution'},executedHere:false});
 save('reuse-selection.json',{status:'prepared_only',predecessor:record(join(P,'basis-template.json')),missingQ07ClosedReturn:!fs.existsSync(join(P,'return.md')),nearestClosedPreparation:record(join(Q,'successor-06/return.md')),reusedControls,sourceInputs:{unchanged:reusedInputs.length,changed:changedInputs.length,copied:0},dependencies:{reused:input.dependencies.length,copied:0},nativeOwnerReturns:[record(join(Q,'successor-05/implementation-01/return.md')),record(join(Q,'successor-05/implementation-02/return.md'))]});
 save('command-domains.json',{status:'declared_not_run',commands:config.commands.map(x=>({commandId:x.commandId,role:recipe.commands.find(y=>y.commandId===x.commandId).role,executable:x.executable,args:x.args,relativeCwd:x.relativeCwd,timeoutMs:x.timeoutMs,terminationGraceMs:x.terminationGraceMs,expectedReports:x.expectedReports})),predicates:config.outcomePredicates,lint:recipe.lint,tests:testDomains,skipPolicy:recipe.skipPolicy,reportFormat:recipe.reportFormat,allowedWriteTerritories:config.allowedWriteTerritories,budget:'Existing per-command caps and supervision proposal retained as preparation; Root must select native actor/executor policy before any execution.'});
 save('coverage-domain.json',{status:'unchanged_source_linked_behavioral_obligations_not_executable_gate_roster',source:record(join(core.packageRoot,'contracts/qualification/coverage.json')),catalogRef:coverage.catalogRef,catalogDigest:coverage.catalogDigest,claims:coverage.claims,evidenceBindings:null,independentApplicabilityAndSufficiency:null});
 save('checks.json',{status:'CLOSED_STRUCTURAL_PREPARATION_PASSED_NATIVE_UNBOUND',sourceCommit:COMMIT,sourceInventoryMembers:inventoryRows.length,qualificationInventoryMembers:members.length,inventoryCoverage:inventory.coverage,sourceInputs:input.sourceFiles.length,sourceInputsChanged:changedInputs.length,sourceInputsReused:reusedInputs.length,expectedGenerated:generated.length,commands:config.commands.length,predicates:config.outcomePredicates.length,testCommands:testDomains.length,selectedTitles:testDomains.reduce((n,x)=>n+x.selectedTitles.length,0),lintFiles:recipe.lint.files.length,dependencies:input.dependencies.length,toolchainMembersChecked:npm.files.length+2,inventorySchema:true,recipeSchema:true,configurationBindings:true,sourceAndAuxiliaryBindings:true,inventoryDigest:inventory.inventoryDigest,recipeDigest:recipeMember.digest,elapsedMs:performance.now()-started,runtimeCalls:0,testsExecuted:0,sourceCopies:0,archiveExpansions:0});
 console.log(JSON.stringify(read(join(D,'checks.json'))));
} catch(error){save('first-failure.json',{message:String(error?.message??error),stack:String(error?.stack??'')});console.error(error);process.exitCode=1;}
