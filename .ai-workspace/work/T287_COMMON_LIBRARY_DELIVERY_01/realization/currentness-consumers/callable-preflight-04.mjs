import fs from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import ts from './node_modules/typescript/lib/typescript.js';
const paths = ['test_env/tests/t287-native-work-currentness-consumers.test.mjs', 'test_env/support/t287-native-work-currentness-consumers.mjs'];
const rows = [], errors = [];
const chain = node => ts.isIdentifier(node) ? [node.text] : ts.isPropertyAccessExpression(node) ? [...chain(node.expression), node.name.text] : [];
for (const path of paths) {
 const text = await fs.readFile(path, 'utf8'), tree = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS), values = new Map(), bindings = [];
 for (const statement of tree.statements) if (ts.isImportDeclaration(statement)) {
  const spec=statement.moduleSpecifier.text, url=spec.startsWith('node:')?spec:pathToFileURL(resolve(dirname(path),spec)).href;
  const module=await import(url), clause=statement.importClause;
  if (!clause) continue;
  const add=(local,name,value)=>{values.set(local,value);bindings.push({local,export:name,module:spec,type:typeof value});if(value===undefined)errors.push(path+': missing import '+name+' from '+spec);};
  if(clause.name)add(clause.name.text,'default',module.default);
  if(clause.namedBindings) {
   if(ts.isNamespaceImport(clause.namedBindings))add(clause.namedBindings.name.text,'*',module);
   else for(const element of clause.namedBindings.elements)add(element.name.text,element.propertyName?.text??element.name.text,module[element.propertyName?.text??element.name.text]);
  }
 }
 const members=[],calls=[],otherCalls=[];
 function visit(node) {
  if(ts.isPropertyAccessExpression(node)) {
   const segments=chain(node); if(segments.length && values.has(segments[0])) {
    let value=values.get(segments[0]);for(const key of segments.slice(1))value=value?.[key];
    members.push({expression:segments.join('.'),type:typeof value});if(value===undefined)errors.push(path+': missing imported member '+segments.join('.'));
   }
  }
  if(ts.isCallExpression(node)||ts.isNewExpression(node)) {
   const segments=chain(node.expression);
   if(segments.length&&values.has(segments[0])){
    let value=values.get(segments[0]);for(const key of segments.slice(1))value=value?.[key];
    calls.push({expression:segments.join('.'),type:typeof value});if(typeof value!=='function')errors.push(path+': uncallable '+segments.join('.'));
   } else otherCalls.push({expression:node.expression.getText(tree),line:tree.getLineAndCharacterOfPosition(node.getStart(tree)).line+1});
  }
  ts.forEachChild(node,visit);
 }
 visit(tree);rows.push({path,bindings,members,calls,nonImportCalls:otherCalls});
}
const support=await import('./test_env/support/t287-native-work-currentness-consumers.mjs');
const factories={
 'abg/default_library':['projectGovernanceNativeTask','projectGovernanceParent'],
 'abg/execution_basis':['hasExactWorksiteCommandLeafSourceAtDurablePrefix','authenticateOwnedNativeInstructionAssemblyBasis','rehydrateExecutionBasisAtPrefix'],
 'abg/worksite_input_provenance':['projectObservedWorksiteCommandChildAtPrefix'],
 'abg/semantic_job':['projectNativeSemanticFold','projectNativeSemanticEvidence','authenticateOwnedSemanticJobBasis','semanticJobRootAtPrefix','semanticJobContextMatches','semanticJobContextCurrent'],
 'abg/semantic_revision':['prepareNativeSemanticRevisionIntake','projectOwnedJobRevisionSubject'],
};
const factoryRows=[];
for(const [path,methods] of Object.entries(factories)){
 const instance=await support.component(path);const calls=methods.map(name=>({name,type:typeof instance[name]}));
 for(const row of calls)if(row.type!=='function')errors.push(path+': factory missing '+row.name);
 factoryRows.push({path,calls});
}
const helpers=await support.semanticFixtureHelpers();
const helperRows=['fixture','author','assess','candidate','verdict','provenance'].map(name=>({name,type:typeof helpers[name]}));
for(const row of helperRows)if(row.type!=='function')errors.push('semantic helpers missing '+row.name);
for(const field of ['declaration','publication','declaredPublication'])assert.equal(typeof helpers[field],'object');
const tracer=support.traceInvalidator();assert.equal(typeof tracer.worksiteCommandSourcesInvalidatedAfter,'function');assert.ok(Array.isArray(tracer.calls));assert.equal(tracer.calls.length,0);
console.log(JSON.stringify({rows,factoryRows,helperRows,tracerShape:{calls:[],method:typeof tracer.worksiteCommandSourcesInvalidatedAfter},errors,
 effects:'imports, SourceTextModule instantiation and reflection only; no fixture allocation, EventStore append, worksite write, target gate invocation, provider or native process'},null,2));
assert.deepEqual(errors,[]);
