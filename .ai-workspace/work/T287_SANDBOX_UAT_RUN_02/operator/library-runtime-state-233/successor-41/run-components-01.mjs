import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const env={...process.env,TMPDIR:root+'test-scratch',ABG_WORKSITE_BUILD_ROOT:root+'build-01/code/src'};
const cases=[
 ['selected-configuration-01',[root+'check-selected-configuration-01.mjs']],
 ['configuration-01',['--experimental-vm-modules','--test','--test-name-pattern=^(C2 explicit zero|C2 finite host)',root+'input-01/test_env/tests/t287-worksite-command-execution.test.mjs']],
 ['observed-helper-01',['--experimental-vm-modules','--test','--test-name-pattern=^(observed C2 has|observed C2 refuses|observed C2 zero|changed physical observed|observed C2 result)',root+'input-01/test_env/tests/t287-observed-worksite-command.test.mjs']],
 ['forward-contracts-01',['--experimental-vm-modules','--test',root+'input-01/test_env/tests/forward-command-contracts.test.mjs']],
];
for(const [name,args] of cases){
 const start=performance.now(),r=spawnSync(process.execPath,args,{cwd:root,env,encoding:'utf8',maxBuffer:16*1024*1024});
 writeFileSync(root+'commands/'+name+'.stdout',r.stdout??'');writeFileSync(root+'commands/'+name+'.stderr',r.stderr??'');
 const result={kind:'c2_zero_write_component_check',sourceCut:41,command:[process.execPath,...args],exitCode:r.status,signal:r.signal,
  elapsedMs:performance.now()-start,source:root+'dependency-cut-41-inputs.json',
  limits:['Cold A/W/grant and C1/forward source/cover facts are supplied lower premises; source-under-test helper staging is not Product installation. Disposable helper commands run only in the isolated fixture mirror. No actual native/C2 continuation, original worksite, capacity or UAT claim.']};
 writeFileSync(root+'commands/'+name+'.result.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));if(r.stdout)console.log(r.stdout);if(r.stderr)console.error(r.stderr);
 if(r.status!==0){process.exitCode=r.status??1;break;}
}
