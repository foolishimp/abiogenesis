import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const env={...process.env,ABG_GOVERNANCE_COVERED_BUILD_ROOT:root+'build-01/code/src',ABG_WORKSITE_BUILD_ROOT:root+'build-01/code/src'};
delete env.ABG_NATIVE_REACQUISITION_RETAINED_ROOT;
const cases=[
  ['testing-refusals-01',['--experimental-vm-modules','--test','--test-name-pattern=^(library prepare-testing|library Testing first-refusal|reacquisition publishes)',root+'input-01/test_env/tests/t287-native-work-reacquisition.test.mjs']],
  ['diagnostic-readback-01',['--experimental-vm-modules','--test',root+'input-01/test_env/tests/t287-runtime-failure-diagnostic.test.mjs']],
];
for(const [name,args] of cases){
  const start=performance.now(),r=spawnSync(process.execPath,args,{cwd:root,env,encoding:'utf8',maxBuffer:16*1024*1024});
  writeFileSync(root+'commands/'+name+'.stdout',r.stdout??'');writeFileSync(root+'commands/'+name+'.stderr',r.stderr??'');
  const result={kind:'testing_first_refusal_component_check',sourceCut:40,command:[process.execPath,...args],exitCode:r.status,signal:r.signal,elapsedMs:performance.now()-start,source:root+'dependency-cut-40-inputs.json',limits:['Actual nullable owner/candidate/diagnostic and disposable failure admission/readback paths with explicitly controlled lower Source/environment/CCall/terminal and basis/frame/replay premises; no installed Testing/C2 or actual first-null/effect claim. No retained original resource is activated.']};
  writeFileSync(root+'commands/'+name+'.result.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));if(r.stdout)console.log(r.stdout);if(r.stderr)console.error(r.stderr);
  if(r.status!==0){process.exitCode=r.status??1;break;}
}
