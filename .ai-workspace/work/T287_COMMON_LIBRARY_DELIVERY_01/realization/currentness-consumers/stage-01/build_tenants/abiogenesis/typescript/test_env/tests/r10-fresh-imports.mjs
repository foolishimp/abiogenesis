import assert from 'node:assert/strict';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const files=['abg/project_read_ports','abg/index','abg/project_read_definition_bindings','product/declaration_closure','validator/conformance_definition_bindings','product/execution_resolution','product/run_invocation_operation'];
for(const file of files) {
  const absolute=path.resolve(import.meta.dirname,'../../build/code/src',file+'.js');
  const result=spawnSync(process.execPath,['--input-type=module','-e',`await import(${JSON.stringify(absolute)})`],{env:process.env,encoding:'utf8',timeout:30000});
  assert.equal(result.status,0,`${file}\n${result.stderr}`);assert.equal(result.signal,null);
}
console.log(JSON.stringify({kind:'r10_fresh_owner_imports',disposition:'passed',files,effects:'module initialization only; no Public or owner operation invoked'}));
