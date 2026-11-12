import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

// A harness that runs extracted compiled bodies in a VM context binds their
// free names by hand. A name it misses throws ReferenceError inside the body,
// and a body that catches its own errors turns that into an ordinary refusal.
// unboundNames lists the names a source reads that no declaration inside it
// binds, by the compiler's own scope resolution (no lib, so the ECMAScript
// globals are listed too). assertContextBinds fails, naming them, on each one
// that neither the context nor a new VM context's own globals bind. An exempt
// name must still be read by the source.
const realmGlobals=new Set(runInNewContext('Object.getOwnPropertyNames(globalThis)'));
export function unboundNames(source) {
  const file='extracted.js',options={allowJs:true,checkJs:true,noLib:true,noEmit:true,types:[]};
  const parsed=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  const host={...ts.createCompilerHost(options),getSourceFile:name=>name===file?parsed:undefined,fileExists:name=>name===file,readFile:()=>undefined};
  const unresolved=ts.createProgram([file],options,host).getSemanticDiagnostics(parsed)
    .filter(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n').startsWith("Cannot find name '"));
  return [...new Set(unresolved.map(d=>source.slice(d.start,d.start+d.length)))].sort();
}
export function assertContextBinds(source,context,label,exempt=[]) {
  const names=unboundNames(source);
  assert.deepEqual(exempt.filter(name=>!names.includes(name)),[],`${label} no longer reads these exempt names`);
  const missing=names.filter(name=>!(name in context)&&!realmGlobals.has(name)&&!exempt.includes(name));
  assert.deepEqual(missing,[],`${label} reads names its VM context does not bind: ${missing.join(', ')}`);
}
