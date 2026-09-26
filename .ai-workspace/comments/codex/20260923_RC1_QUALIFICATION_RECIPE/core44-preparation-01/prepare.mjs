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
const P=join(Q,'core18-preparation-01'),C=join(R,'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-44');
const COMMIT='29da18bca003ead4045f5061b495f17e76b5fa33';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const record=p=>{const b=fs.readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
const save=(n,x)=>fs.writeFileSync(join(D,n),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const started=performance.now();
try {
 const core=read(join(C,'selected-core.json'));
 assert.equal(core.basis.artifactDigest,'sha256:f89e8037921d086505ed7c067720b942948b6326d4cacbb34ede0b2007e97da3');
 assert.equal(execFileSync('git',['rev-parse',COMMIT+'^{commit}'],{cwd:R,encoding:'utf8'}).trim(),COMMIT);
 const product=await import(pathToFileURL(join(core.packageRoot,'build/code/src/product/index.js')).href);
 const q=await import(pathToFileURL(join(core.packageRoot,'build/code/src/validator/qualification_contracts.js')).href);
 const v=createRequire(join(core.packageRoot,'package.json'))('valibot');
 const canonical=x=>product.sha256Canonical(x);
 const oldRows=read(join(P,'source-inventory.json'));
 // Preserve predecessor source-inventory selection, refresh its exact Git sources,
 // and include newly tracked support/test members under the same existing domain.
 // Generated members use the accepted package correspondence, without expansion.
 const prefix='build_tenants/abiogenesis/typescript/';
 const gitLines=execFileSync('git',['ls-tree','-r',COMMIT,'--',prefix],{cwd:R,encoding:'utf8',maxBuffer:8*1024*1024}).trim().split('\n');
 const gitRows=new Map(gitLines.map(line=>{const [meta,path]=line.split('\t');return [path.slice(prefix.length),{gitPath:path,blob:meta.split(' ')[2]}];}));
 const archive=read(join(C,'archive-members.json')),archiveMap=new Map(archive.map(x=>[x.path,x]));
 const generated=archive.filter(x=>x.path.startsWith('build/')||x.path.startsWith('contracts/')||x.path==='product-toolchain-manifest.json');
 const previousGenerated=read(join(P,'expected-output-inventory.json')).paths;
 assert.deepEqual(generated.map(x=>x.path).sort(),previousGenerated.map(x=>x.path).sort(),'generated domain must remain unchanged');
 const generatedPaths=new Set(generated.map(x=>x.path));
 const sourcePaths=new Set(oldRows.filter(x=>!generatedPaths.has(x.path)).map(x=>x.path));
 for(const path of gitRows.keys())if(path.startsWith('code/')||path.startsWith('design/')||path.startsWith('scripts/')||path.startsWith('test_env/tests/')||path.startsWith('test_env/support/'))sourcePaths.add(path);
 const currentRows=[...sourcePaths].sort().map(path=>{
  const binding=gitRows.get(path);assert.ok(binding,'missing exact source '+path);
  const bytes=fs.readFileSync(join(T,path));
  const blob=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
  assert.equal(blob,binding.blob,'source differs from exact commit '+path);
  return {path,bytes:bytes.length,sha256:sha(bytes)};
 });
 const rows=new Map(currentRows.map(x=>[x.path,x]));
 for(const x of generated)rows.set(x.path,x);
 const inventoryRows=[...rows.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'));
 const correspondence=read(join(C,'package-correspondence.json'));
 assert.equal(correspondence.archiveMembers,5233);assert.equal(correspondence.sourceMatches,5233);assert.equal(correspondence.installedMatches,5233);
 assert.equal(record(join(C,'archive-members.json')).sha256,correspondence.archiveMembersSha256);
 assert.equal('sha256:'+record(core.artifactPath).sha256,core.basis.artifactDigest);
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
 input.parentAcceptedSubject='sha256:9cd731abb807d68aae412c691066a150bdfeb6bf7632eae81173d334f1342f14';
 input.candidate='core44_preparation_only';
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
 const classificationRef='selection://abiogenesis/rc1/core44-preparation-01';
 const members=inventoryRows.map(x=>({ref:'repo://abiogenesis/build_tenants/abiogenesis/typescript/'+x.path,path:'build_tenants/abiogenesis/typescript/'+x.path,digest:'sha256:'+x.sha256,byteCount:x.bytes,surfaceRoles:classify(x.path),classificationEvidenceRefs:[classificationRef]}));
 const authority=read(join(core.packageRoot,'contracts/qualification/authority-inputs.json'));
 for(const x of authority.sources.filter(x=>x.ref.startsWith('repo://abiogenesis/'))){const path=x.ref.slice('repo://abiogenesis/'.length),actual=record(join(R,path));assert.equal('sha256:'+actual.sha256,x.digest);members.push({ref:x.ref,path,digest:x.digest,byteCount:actual.bytes,surfaceRoles:['constitutional'],classificationEvidenceRefs:[classificationRef]});}
 for(const name of ['verification-recipe.json','recipe.mjs','recipe-stage.mjs','compare-generated.mjs','test-environment.mjs','config.json','input-manifest.json','expected-output-inventory.json','test-selection.json','lint-population.json','toolchain.json','npm-toolchain-inventory.json','release-claims.json']){
  const row=record(join(D,name)),path=row.path.slice(R.length+1);members.push({ref:'repo://abiogenesis/'+path,path,digest:'sha256:'+row.sha256,byteCount:row.bytes,surfaceRoles:[name==='release-claims.json'?'release_claim':name==='toolchain.json'||name==='npm-toolchain-inventory.json'?'manifest':'execution_contract'],classificationEvidenceRefs:[classificationRef]});
 }
 const inventory=q.constructQualificationIdentity({kind:'qualification_subject_inventory',selectedRoots:['repo://abiogenesis/build_tenants/abiogenesis/typescript/','repo://abiogenesis/specification/','repo://abiogenesis/stdo_abiogenesis.json',...members.filter(x=>x.path.startsWith('.ai-workspace/')).map(x=>x.ref)],coverage:'incomplete',members},'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');
 v.parse(q.QUALIFICATION_INVENTORY_SCHEMA,inventory);save('qualification-inventory.json',inventory);
 const law=read(join(core.packageRoot,'contracts/qualification/law-basis.json')),coverage=read(join(core.packageRoot,'contracts/qualification/coverage.json'));
 assert.deepEqual(coverage.claims,read(join(P,'coverage-domain.json')).claims,'source-linked coverage domain changed');
 assert.equal(coverage.claims.length,16);assert.equal(coverage.claims.reduce((n,x)=>n+x.behaviors.length,0),66);
 for(const name of ['authority-inputs.json','law-basis.json','coverage.json'])assert.equal(record(join(core.packageRoot,'contracts/qualification',name)).sha256,archiveMap.get('contracts/qualification/'+name).sha256);
 const template=read(join(P,'basis-template.json'));
 const coord=name=>{const m=members.find(x=>x.path.endsWith('/core44-preparation-01/'+name));return {ref:m.ref,digest:m.digest};};
 Object.assign(template.body,{sourceInventory:{ref:inventory.inventoryRef,digest:inventory.inventoryDigest},artifact:{ref:core.artifactRef,digest:core.basis.artifactDigest},productManifest:{ref:'repo://abiogenesis/build_tenants/abiogenesis/typescript/product-toolchain-manifest.json',digest:core.basis.manifestDigest},productContentDigest:core.basis.productContentDigest,toolchain:coord('toolchain.json'),installedProduct:null,workspaceBinding:null,tenantManifest:null,coverageCatalog:{ref:coverage.catalogRef,digest:coverage.catalogDigest},lawBasis:{ref:law.lawBasisRef,digest:law.lawBasisDigest}});
 template.body.prospectiveRelease.releaseClaim=coord('release-claims.json');
 template.status='unbound_preparation_only_incomplete_inventory_no_basis_identity_minted';save('basis-template.json',template);
 const recipeBytes=fs.readFileSync(join(D,'verification-recipe.json')),recipeMember=members.find(x=>x.path.endsWith('/core44-preparation-01/verification-recipe.json'));
 save('verification-selection-binding.json',{recipe:{ref:recipeMember.ref,path:recipeMember.path,digest:recipeMember.digest,byteCount:recipeMember.byteCount,contentBase64:recipeBytes.toString('base64')},recipePath:'recipe/verification-recipe.json',missing:'executionSelectionRef remains absent until actual same-subject admitted observed-root-C2 Result exists.'});
 const preparedPath=join(R,'.ai-workspace/comments/codex/20260926_CALCULUS_CROSSCUT/native44/preparation/selection.json');
 const prepared=read(preparedPath),consumer=read(prepared.consumerBasis);
 assert.equal(consumer.artifactDigest,'sha256:3ca34c270eff38076c6b005559b67ced6dcc88bf87d99d9bc7d5887b118c7d8e');
 save('candidate-selection.json',{status:'Root_selected_advance_preparation_not_final_qualification_basis',core,sourceCommit:COMMIT,sourceInventory:record(join(D,'source-inventory.json')),archiveMemberInventory:record(join(C,'archive-members.json')),acceptedCorrespondence:record(join(C,'package-correspondence.json')),coreAcceptance:record(join(C,'return.md')),sourceDisposition:record(join(R,'.ai-workspace/comments/codex/20260926_CALCULUS_CROSSCUT/evidence-context-02/disposition.json')),executiveSelection:record(join(R,'.ai-workspace/comments/codex/20260926_CALCULUS_CROSSCUT/native44/executive-selection.json')),lawBasis:{ref:law.lawBasisRef,digest:law.lawBasisDigest},coverage:{ref:coverage.catalogRef,digest:coverage.catalogDigest},consumer:{...consumer,coordinateEvidence:record(prepared.consumerBasis),selectionEvidence:record(preparedPath),scope:'unchanged RC4/dev16 witness dependency; no ABI candidate membership or outcome credit'},executedHere:false});
 save('reuse-selection.json',{status:'prepared_only',predecessor:record(join(P,'return.md')),predecessorFreeze:record(join(P,'freeze.json')),incompleteQ07:record(join(Q,'successor-07/basis-template.json')),missingQ07ClosedReturn:!fs.existsSync(join(Q,'successor-07/return.md')),nearestClosedOriginalPreparation:record(join(Q,'successor-06/return.md')),reusedControls,sourceInputs:{unchanged:reusedInputs.length,changed:changedInputs.length,copied:0},dependencies:{reused:input.dependencies.length,copied:0},nativeOwnerReturns:[record(join(Q,'successor-05/implementation-01/return.md')),record(join(Q,'successor-05/implementation-02/return.md'))],acceptedMemberCorrespondence:{members:5233,source:record(join(C,'package-correspondence.json')),reexecuted:false}});
 save('command-domains.json',{status:'declared_not_run',commands:config.commands.map(x=>({commandId:x.commandId,role:recipe.commands.find(y=>y.commandId===x.commandId).role,executable:x.executable,args:x.args,relativeCwd:x.relativeCwd,timeoutMs:x.timeoutMs,terminationGraceMs:x.terminationGraceMs,expectedReports:x.expectedReports})),predicates:config.outcomePredicates,lint:recipe.lint,tests:testDomains,skipPolicy:recipe.skipPolicy,reportFormat:recipe.reportFormat,allowedWriteTerritories:config.allowedWriteTerritories,budget:'Existing per-command caps and supervision proposal retained as preparation; Root must select native actor/executor policy before any execution.'});
 save('coverage-domain.json',{status:'unchanged_source_linked_behavioral_obligations_not_executable_gate_roster',source:record(join(core.packageRoot,'contracts/qualification/coverage.json')),catalogRef:coverage.catalogRef,catalogDigest:coverage.catalogDigest,claims:coverage.claims,evidenceBindings:null,independentApplicabilityAndSufficiency:null});
 save('checks.json',{status:'CLOSED_STRUCTURAL_PREPARATION_PASSED_NATIVE_UNBOUND',sourceCommit:COMMIT,sourceInventoryMembers:inventoryRows.length,qualificationInventoryMembers:members.length,inventoryCoverage:inventory.coverage,sourceInputs:input.sourceFiles.length,sourceInputsChanged:changedInputs.length,sourceInputsReused:reusedInputs.length,expectedGenerated:generated.length,commands:config.commands.length,predicates:config.outcomePredicates.length,testCommands:testDomains.length,selectedTitles:testDomains.reduce((n,x)=>n+x.selectedTitles.length,0),lintFiles:recipe.lint.files.length,dependencies:input.dependencies.length,toolchainMembersChecked:npm.files.length+2,inventorySchema:true,recipeSchema:true,configurationBindings:true,sourceAndAuxiliaryBindings:true,inventoryDigest:inventory.inventoryDigest,recipeDigest:recipeMember.digest,elapsedMs:performance.now()-started,runtimeCalls:0,testsExecuted:0,sourceCopies:0,archiveExpansions:0,correspondenceReexecuted:false,acceptedCorrespondenceMembers:5233});
 console.log(JSON.stringify(read(join(D,'checks.json'))));
} catch(error){save('first-failure.json',{message:String(error?.message??error),stack:String(error?.stack??'')});console.error(error);process.exitCode=1;}
