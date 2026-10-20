import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const phase=import.meta.dirname,baseline=join(phase,'baseline');
const host=JSON.parse(readFileSync(join(phase,'../operator/native-observation-presentation-successor-140/host-preparation/exacthost-identity.json')));
const env={...process.env,...host.environment};
function run(name,args){const started=new Date().toISOString(),start=performance.now();
 writeFileSync(join(phase,'commands',name+'.request.json'),JSON.stringify({command:process.execPath,args,cwd:baseline,environmentKeys:Object.keys(env).sort(),started},null,2)+'\n',{flag:'wx'});
 const r=spawnSync(process.execPath,args,{cwd:baseline,env,encoding:'utf8',maxBuffer:2*1024*1024});
 writeFileSync(join(phase,'commands',name+'.stdout'),r.stdout??'',{flag:'wx'});writeFileSync(join(phase,'commands',name+'.stderr'),r.stderr??'',{flag:'wx'});
 const result={exitCode:r.status,signal:r.signal,error:r.error?{name:r.error.name,code:r.error.code,message:r.error.message}:null,wallMs:performance.now()-start,started,finished:new Date().toISOString()};
 writeFileSync(join(phase,'commands',name+'.result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});process.stdout.write(JSON.stringify({name,...result})+'\n');
 if(r.status!==0||r.error)process.exit(1);
}
run('isolated-compile-owner-import-145',['/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript/bin/tsc','--project',join(baseline,'tsconfig.json')]);
run('focused-owner-retained-145',['--experimental-vm-modules','--test','--test-concurrency=1','test_env/tests/t287-recursive-failure-reuse-control.test.mjs']);
