import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,realpathSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const [npmCli,record]=process.argv.slice(2);
const r=spawnSync(process.execPath,[npmCli,'run','build'],{stdio:'inherit',env:process.env});
if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);
// Resolution only: test adapters import bare modules from their test file; normal helper imports from its compiled file.
const parents=['test_env/tests/t287-owned-process-lifetime.test.mjs','test_env/tests/m5-worker-transport.test.mjs','test_env/tests/t287-lifecycle-failure-carrier.test.mjs','build/code/src/implementation/worksite_command_helper.js','build/code/src/shared/effect_definition.js'];
const specs=new Set(['effect/Cause','effect/Effect','effect/Exit','effect/Fiber','effect/Scope']);
for(const p of parents)for(const m of readFileSync(p,'utf8').matchAll(/from\s+["'](effect(?:\/[^"']+)?)['"]/g))specs.add(m[1]);
const rows=[];
for(const spec of [...specs].sort()){
 const origins=parents.map(parent=>({parent,url:import.meta.resolve(spec,pathToFileURL(resolve(parent)).href)}));
 for(const o of origins)o.realpath=realpathSync(fileURLToPath(o.url));
 assert.equal(new Set(origins.map(x=>x.url)).size,1,`${spec}: distinct ESM module URLs`);
 assert.equal(new Set(origins.map(x=>x.realpath)).size,1,`${spec}: distinct Effect origins`);
 assert(origins[0].realpath.startsWith(realpathSync('node_modules/effect')+'/'));
 rows.push({specifier:spec,origins});
}
writeFileSync(record,JSON.stringify({kind:'actual_normal_work_esm_resolution',node:process.execPath,packageRoot:process.cwd(),effectVersion:JSON.parse(readFileSync('node_modules/effect/package.json')).version,rows,oneOriginPerSpecifier:true,standing:'Actual Node ESM resolution under import conditions; no module execution or packaged-root adapter credit.'},null,2)+'\n',{flag:'wx'});
