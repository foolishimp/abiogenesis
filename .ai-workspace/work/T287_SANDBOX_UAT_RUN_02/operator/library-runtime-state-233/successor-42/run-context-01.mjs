import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const env={...process.env,TMPDIR:root+'test-scratch',ABG_WORKSITE_BUILD_ROOT:root+'build-01/code/src'};
const cases=[['context-owner-01',[root+'check-context-owner-01.mjs']],['c2-core-environment-01',['--experimental-vm-modules','--test',root+'input-01/test_env/tests/t287-c2-core-environment.test.mjs']]];
for(const [name,args] of cases){
 const start=performance.now(),r=spawnSync(process.execPath,args,{cwd:root,env,encoding:'utf8',maxBuffer:16*1024*1024});
 for(const [suffix,body] of [['stdout',r.stdout??''],['stderr',r.stderr??'']])writeFileSync(root+'commands/'+name+'.'+suffix,body,{flag:'wx'});
 const result={kind:'source42_c2_context_readiness',sourceCut:42,command:[process.execPath,...args],exitCode:r.status,signal:r.signal,elapsedMs:performance.now()-start,
  input:root+'dependency-cut-42-inputs.json',emission:root+'dependency-cut-42-emission.json',
  limits:['Isolated pure declaration/member/span correspondence plus existing disposable context observation/assembly test','Lower component artifact/native assembly and A/W/grant facts explicitly controlled; no actual Product installation/ABG admission/Worker/native/original resource effects']};
 writeFileSync(root+'commands/'+name+'.result.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));if(r.stdout)console.log(r.stdout);if(r.stderr)console.error(r.stderr);
 if(r.status!==0){process.exitCode=r.status??1;break;}
}
