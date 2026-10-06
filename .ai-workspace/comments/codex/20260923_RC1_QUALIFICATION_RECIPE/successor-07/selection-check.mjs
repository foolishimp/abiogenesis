// Finite read-only preparation check; no staging, commands, native call or judgment.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {selectedFiles} from './recipe.mjs';
const D=import.meta.dirname,Q=resolve(D,'..'),T='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const read=(p)=>JSON.parse(fs.readFileSync(p,'utf8')),local=n=>read(join(D,n));
const ready=local('package-readiness.json'),p=await import(pathToFileURL(join(ready.installRoot,'build/code/src/product/index.js')).href);
const require=createRequire(join(T,'package.json')),ts=require('typescript');
const hash=b=>p.sha256Bytes(b),fileHash=f=>hash(fs.readFileSync(f));
const files=await selectedFiles();assert.equal(new Set(files.map(r=>r.target)).size,files.length);
for(const r of files){const b=fs.readFileSync(r.origin);assert.equal(b.length,r.bytes,r.origin);assert.equal(hash(b),'sha256:'+r.sha256,r.origin);}
const recipe=local('verification-recipe.json'),binding=local('configuration-binding.json'),config=local('config.json');
assert.equal(p.sha256Canonical(binding.commands),recipe.commandConfigurationDigest);
assert.equal(p.sha256Canonical(binding.predicates),recipe.predicateConfigurationDigest);
assert.equal(p.sha256Canonical(binding.allowedWriteTerritories),recipe.writeTerritoriesDigest);
assert.deepEqual(config,read(join(Q,'config.json')));
assert.deepEqual(recipe.commands,read(join(Q,'verification-recipe.json')).commands);
const selected=local('test-selection.json'),testRows=[];
for(const selection of selected.tests){
 const titles=[];
 for(const file of selection.files){
  const tree=ts.createSourceFile(file,fs.readFileSync(join(T,file),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  for(const statement of tree.statements){if(!ts.isExpressionStatement(statement)||!ts.isCallExpression(statement.expression))continue;
   const call=statement.expression;if(ts.isIdentifier(call.expression)&&call.expression.text==='test'){
    assert.ok(ts.isStringLiteralLike(call.arguments[0]),'finite selected test title');titles.push(call.arguments[0].text);
   }
  }
 }
 const command=config.commands.find(row=>row.commandId===selection.commandId);assert.ok(command);
 const patterns=command.args.filter(a=>a.startsWith('--test-name-pattern='));assert.ok(patterns.length<=1);
 const selectedByCommand=patterns.length?titles.filter(title=>new RegExp(patterns[0].slice('--test-name-pattern='.length)).test(title)):titles;
 assert.deepEqual(selectedByCommand,selection.selectedTitles,'actual Node command title domain');
 if(selection.selectionKind==='whole_file')assert.equal(patterns.length,0);
 else assert.equal(patterns.length,1);
 assert.equal(selection.selectedTitles.length,selection.expectedTestCount);
 testRows.push({commandId:selection.commandId,selectionKind:selection.selectionKind,selectedTitles:selectedByCommand.length,declaredTopLevelTitles:titles.length,actualSelectedTitles:selectedByCommand,sourceFiles:selection.files,commandPattern:patterns[0]??null});
}
assert.equal(testRows.reduce((n,r)=>n+r.selectedTitles,0),selected.totalSelectedTitles);
const tool=local('toolchain.json');assert.equal(fileHash(tool.node.invokedPath),'sha256:'+tool.node.sha256);assert.equal(fileHash(tool.npm.invokedPath),'sha256:'+tool.npm.sha256);
const npm=local('npm-toolchain-inventory.json');for(const r of npm.files){const b=fs.readFileSync(join(npm.root,r.path));assert.equal(b.length,r.bytes);assert.equal(hash(b),'sha256:'+r.sha256);}
const manifest=local('input-manifest.json'),inventory=local('source-inventory.json'),map=new Map(inventory.map(r=>[r.path,r]));
for(const r of manifest.sourceFiles){assert.equal(map.get(r.path)?.sha256,r.sha256,r.path);assert.equal(fileHash(join(T,r.path)),'sha256:'+r.sha256,r.path);}
for(const r of local('expected-output-inventory.json').paths){assert.equal(map.get(r.path)?.sha256,r.sha256);assert.equal(fileHash(join(T,r.path)),'sha256:'+r.sha256);}
const recipeAux=recipe.auxiliaryInputs.map(r=>[r.relativePath,r.digest,r.byteCount]);
const actualAux=files.filter(r=>!r.target.startsWith('subject/')&&r.target!=='recipe/verification-recipe.json').map(r=>[r.target,'sha256:'+r.sha256,r.bytes]);
assert.deepEqual(actualAux,recipeAux);
const verification=local('verification-selection-binding.json'),recipeBytes=fs.readFileSync(join(D,'verification-recipe.json'));
assert.equal(verification.recipe.digest,hash(recipeBytes));assert.equal(verification.recipe.contentBase64,recipeBytes.toString('base64'));
assert.equal('executionSelectionRef' in verification,false);
const basis=local('basis-template.json');for(const key of basis.requiredNativeBindings)assert.equal(basis.body[key],null,key);
const contract=read(join(T,'contracts/qualification/coverage.json'));
const coverageDomain=contract.claims.map(claim=>({coverageRef:claim.coverageRef,behaviors:claim.behaviors,requirementRefs:claim.requirementRefs,evidenceRoles:claim.evidenceRoles}));
assert.equal(new Set(coverageDomain.map(r=>r.coverageRef)).size,coverageDomain.length);
const coverageBehaviorCount=coverageDomain.reduce((n,r)=>n+r.behaviors.length,0);
const selectedTests=local('test-selection.json');assert.deepEqual(recipe.tests,selectedTests.tests.map(({commandId,files})=>({commandId,files})));
assert.deepEqual(recipe.lint,local('lint-population.json').lint);
const result={status:'CLOSED_PREPARATION_CHECK_PASSED',selectedFiles:files.length,sourceFiles:manifest.sourceFiles.length,dependencies:manifest.dependencies.length,sourceInventoryMembers:inventory.length,qualificationInventoryMembers:local('qualification-inventory.json').members.length,expectedGenerated:local('expected-output-inventory.json').paths.length,coverageDomain,coverageBehaviorCount,commands:config.commands.length,predicates:config.outcomePredicates.length,tests:testRows,totalSelectedTitles:selected.totalSelectedTitles,toolchainFilesChecked:npm.files.length+2,configuration:'Byte-identical commands/policies and reused normalization from unchanged owner; hashes match existing recipe contract.',runtime:'No staging or command execution; no QUAL056/F11, actor/executor or execution Result manufactured.'};
fs.writeFileSync(join(D,'selection-check.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
