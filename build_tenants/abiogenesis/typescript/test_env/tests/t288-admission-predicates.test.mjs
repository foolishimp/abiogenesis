import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import * as helpers from '../../build/code/src/shared/admission_predicates.js';
import { compareUnicodeCodeUnits } from '../../build/code/src/shared/canonical_json.js';
import * as bindings from '../../build/code/src/shared/definition_binding_mechanics.js';

const fixtures=JSON.parse(fs.readFileSync(new URL('../support/t288-admission-helper-preimages.json',import.meta.url)));
const sourceRoot=fileURLToPath(new URL('../../code/src/',import.meta.url));
function original(fixture){
 const js=ts.transpileModule(fixture.source.replace(/^export /u,''),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 return new Function('compareUnicodeCodeUnits','sameStrings',js+'\nreturn '+fixture.name)(compareUnicodeCodeUnits,(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]));
}
const scalars=[undefined,null,false,true,0,-0,NaN,Infinity,1n,Symbol('x'),'', ' ', '\t\n', '\u00a0', '\0',' a ','a\0', '😀', '\ud800', {},[],{x:undefined},Object.create(null),new String('x'),new Date(0),new Map(),/x/,()=>{}];
const cases=scalars.map(value=>()=>[value,[]]);
for(const actual of [[],['a'],['a','b'],['a\0b'],[''],['2','10'],['😀','\ud800']]){
 for(const expected of [[],['a'],['b','a'],['a','a'],['a','b'],['a\0b'],[''],['10','2'],[2,10],[undefined],Array(2),null,undefined,'ab',[Symbol('s')]]){
  cases.push(()=>[Object.fromEntries(actual.map(k=>[k,1])),expected]);
 }
}
cases.push(trace=>{
 const value=new Proxy({a:1},{ownKeys(target){trace.push('ownKeys');return Reflect.ownKeys(target);},getOwnPropertyDescriptor(target,key){trace.push('descriptor:'+key);return Reflect.getOwnPropertyDescriptor(target,key);},get(){throw Error('value accessed');}});
 return [value,['a']];
});
cases.push(trace=>[Object.defineProperty({a:1},'hidden',{enumerable:false,get(){trace.push('get hidden');throw Error('getter');}}),['a']]);
cases.push(trace=>[new Proxy({},{ownKeys(){trace.push('ownKeys');throw RangeError('own keys failed');}}),[]]);
cases.push(()=>{const {proxy,revoke}=Proxy.revocable({},{});revoke();return[proxy,[]];});
cases.push(trace=>[{a:1},{*[Symbol.iterator](){trace.push('iterator');yield 'a';}}]);
cases.push(trace=>[{a:1},{*[Symbol.iterator](){trace.push('iterator');throw RangeError('iterator failed');}}]);
cases.push(trace=>[{'10':1,'2':1},[2,{[Symbol.toPrimitive](hint){trace.push('coerce:'+hint);return hint==='number'?10:'10';}}]]);
function observe(fn,factory){const trace=[];const args=factory(trace);try{return{value:fn(...args),trace};}catch(error){return{error:{name:error.name,message:error.message},trace};}}

test('all migrated helper classes preserve erased behavior and side-effect order',()=>{
 let comparisons=0,definitions=0;
 for(const fixture of fixtures){
  const before=original(fixture),after=helpers[fixture.target];assert.equal(typeof after,'function');definitions+=fixture.members;
  for(const [index,factory]of cases.entries()){
   assert.deepEqual(observe(after,factory),observe(before,factory),fixture.id+' case '+index);comparisons++;
  }
 }
 assert.equal(definitions,93);
 console.log(JSON.stringify({scope:'D14 predicate equivalence',classes:fixtures.length,definitions,comparisons,cases:cases.length}));
});

test('different strength and sorting contracts remain visibly different',()=>{
 const nul={'a\0b':0};
 assert.equal(helpers.hasNulJoinedKeys(nul,['a','b']),true);
 assert.equal(helpers.hasExactKeys(nul,['a','b']),false);
 assert.equal(helpers.hasNulJoinedKeys({},['']),true);
 assert.equal(helpers.hasExactKeys({},['']),false);
 assert.equal(helpers.hasNulJoinedKeys({'10':0,'2':0},[2,10]),true);
 assert.equal(helpers.hasUnicodeNulJoinedKeys({'10':0,'2':0},[2,10]),false);
 assert.equal(helpers.isNonEmptyString(' '),true);
 assert.equal(helpers.isNonblankString(' '),false);
 assert.equal(helpers.isNonblankString('a\0'),true);
 assert.equal(helpers.isNonblankNulFreeString('a\0'),false);
 assert.equal(helpers.isJsonRecordShape({notJson:()=>{}}),true);
 assert.equal(bindings.isRecord,helpers.isRecord);
 assert.equal(bindings.hasExactKeys,helpers.hasUnicodeNulJoinedKeys);
});

test('each migrated declaration retains the exact caller type and refinement',()=>{
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'t288-helper-types-'));
 try{
  const declarations=fixtures.map((f,i)=>{
   const node=ts.createSourceFile('before.ts',f.source,ts.ScriptTarget.Latest,true).statements[0];
   const signature=f.source.slice(0,node.body.getStart()).replace(/^export /u,'').replace('function '+f.name,'declare function before'+i);
   return signature+';\ntype Check'+i+' = Assert<Equal<typeof before'+i+', typeof helpers.'+f.target+'>>;';
  }).join('\n');
  const file=path.join(scratch,'types.mts');
  fs.writeFileSync(file,'import type { JsonValue } from '+JSON.stringify(path.join(sourceRoot,'shared/canonical_json.js'))+';\nimport * as helpers from '+JSON.stringify(path.join(sourceRoot,'shared/admission_predicates.js'))+';\ntype Equal<A,B> = (<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2) ? true : false;\ntype Assert<T extends true> = T;\n'+declarations+'\n');
  const command=spawnSync(process.execPath,[fileURLToPath(import.meta.resolve('typescript/bin/tsc')),'--noEmit','--strict','--exactOptionalPropertyTypes','--skipLibCheck','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext',file],{encoding:'utf8'});
  assert.equal(command.status,0,command.stdout+command.stderr);
 }finally{fs.rmSync(scratch,{recursive:true,force:true});}
});
