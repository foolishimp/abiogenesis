import assert from 'node:assert/strict';
import {readFile,writeFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {installedModules,requireKind} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';
const root=dirname(fileURLToPath(import.meta.url)),read=async path=>JSON.parse(await readFile(path,'utf8'));
const pin=async path=>{const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink());const b=await readFile(path);return {path,sha256:createHash('sha256').update(b).digest('hex'),byteCount:b.length};};
const x=await read(join(root,'inputs.json')),previous=join(dirname(root),'installed-current-source-preparation-155'),freeze=await read(join(previous,'freeze.json'));
for(const row of freeze.pins)assert.deepEqual(await pin(row.path),row);
const syntax=[];for(const name of ['prepare.mjs','execute-preparation.mjs','preflight.mjs']){
 const checked=spawnSync(process.execPath,['--check',join(root,name)],{env:process.env,encoding:'utf8'});
 assert.equal(checked.status,0,checked.stderr);syntax.push({name,exitCode:checked.status});
}
const host=await read(x.host.path),runtime=await installedModules(host.installedRoot);
const {product:p,abg:a,api,gtl:g,invocationTruth:truth}=runtime;
const readPorts=await import(pathToFileURL(join(host.installedRoot,'build/code/src/abg/project_read_ports.js')).href);
const revision=await import(pathToFileURL(join(host.installedRoot,'build/code/src/abg/worksite_revision.js')).href);
const immutable=await import(pathToFileURL(join(host.installedRoot,'build/code/src/shared/immutable.js')).href);
const namespaces={p,a,api,g,truth,revision,readPorts},source=await readFile(join(root,'prepare.mjs'),'utf8');
const bindings=new Set([...source.matchAll(/\b(p|a|api|g|truth|revision|readPorts)\.([A-Za-z]\w*(?:\.[A-Za-z]\w*)*)\s*\(/g)].map(m=>m[1]+'.'+m[2]));
for(const name of ['p.sha256Canonical','p.productInstallCoordinate'])bindings.add(name);
const constructors=source.match(/const constructors=\[([^\]]+)\]/)[1];
for(const match of constructors.matchAll(/'([^']+)'/g))bindings.add('g.'+match[1]);
const availability=[];for(const binding of [...bindings].sort()){
 const [namespace,...path]=binding.split('.');let value=namespaces[namespace];for(const key of path)value=value?.[key];
 assert.equal(typeof value,'function','Canonical function unavailable: '+binding);availability.push({binding,available:true});
}
for(const [name,value] of [['installedModules',installedModules],['requireKind',requireKind],['deepFreeze',immutable.deepFreeze]]){
 assert.equal(typeof value,'function',name);availability.push({binding:name,available:true});
}
assert.equal(typeof a.projectClosedGraphCallTerminalAtDurablePrefix,'function');
assert.equal(typeof readPorts.projectHistoricalGraphCallSourceAtDurablePrefix,'function');
assert.equal(typeof a.projectHistoricalGraphCallSourceAtDurablePrefix,'undefined');
const result={classification:'Syntax and exact installed canonical function availability only; no synthetic resource or constructor invocation',syntax,availability,functionCount:availability.length,installedRoot:host.installedRoot,script:await pin(join(root,'prepare.mjs')),canonicalOwners:await Promise.all(['abg/index.js','abg/project_read_ports.js','abg/worksite_revision.js','abg/invocation_execution_truth.js','product/index.js','public/index.js','shared/immutable.js'].map(name=>pin(join(host.installedRoot,'build/code/src',name)))),predecessorFreeze:await pin(join(previous,'freeze.json')),all155PinsMatch:true,noResourceAcquisition:true,noPublicEffects:true,noModel:true};
await writeFile(join(root,'binding-preflight.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
process.stdout.write(JSON.stringify({syntaxPass:syntax.length,functionAvailabilityPass:availability.length,all155PinsMatch:true,noResourceAcquisition:true})+'\n');
