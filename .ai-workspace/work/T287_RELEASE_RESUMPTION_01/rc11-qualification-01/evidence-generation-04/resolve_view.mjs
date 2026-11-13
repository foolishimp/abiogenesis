import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const basis=JSON.parse(await fs.readFile(path.join(root,'VIEW_BASIS.json'),'utf8'));
const inventory=JSON.parse(await fs.readFile(path.join(root,'VIEW_INVENTORY.json'),'utf8'));
assert.equal(process.env.NODE_OPTIONS??'','');
assert.equal(process.env.NODE_PATH??'','');
const rows=[];
for(const entry of inventory.entries.filter(e=>e.kind==='file'&&e.relativePath.endsWith('.mjs'))){
 const importer=path.join(basis.view,entry.relativePath),source=await fs.readFile(importer,'utf8');
 const specs=new Set([...source.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']([^"']+)["']/g)].map(m=>m[1]));
 for(const specifier of specs){
  const resolved=import.meta.resolve(specifier,pathToFileURL(importer).href);
  const realpath=resolved.startsWith('node:')?null:await fs.realpath(fileURLToPath(resolved));
  if(specifier==='@abiogenesis/typescript-tenant/product'){
   assert.equal(realpath,path.join(basis.installedRoot,'build/code/src/product/index.js'));
   assert.equal(JSON.parse(await fs.readFile(path.join(basis.view,'package.json'),'utf8')).exports['./product'].import,'./build/code/src/product/index.js');
  }
  if(specifier.startsWith('.'))assert.ok(realpath.startsWith(basis.view+'/'));
  rows.push({importer:entry.relativePath,specifier,resolved,realpath});
 }
}
assert.equal(rows.filter(r=>r.specifier==='@abiogenesis/typescript-tenant/product').length,2);
console.log(JSON.stringify({status:'resolved_without_product_execution',nodeExecutable:process.execPath,nodeVersion:process.version,nodeOptions:process.env.NODE_OPTIONS??'',nodePath:process.env.NODE_PATH??'',execArgv:process.execArgv,scope:'All literal import specifiers in the copied helpers/fixtures; exact self-export product realpath verified. Runtime-computed fixture installs remain the admitted owner path.',productModulesImported:false,rows},null,2));
