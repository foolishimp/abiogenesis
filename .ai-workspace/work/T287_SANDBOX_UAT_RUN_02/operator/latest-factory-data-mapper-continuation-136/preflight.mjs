import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const record=commandRecorder(root,{environment:process.env,timeoutMs:30000,maxOutputBytes:1048576});
for(const [label,name,args] of [['safe-auth-status','auth-status.mjs',[]],['args-composition','args-composition-proof.mjs',[]],['mechanical-inspection','prepare.mjs',['--inspect']]]){
  const result=await record(label,'/opt/homebrew/bin/node',[join(root,name),...args],{cwd:root});
  console.log(JSON.stringify({label,exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure}));
  assert.equal(result.exitCode,0);assert.equal(result.signal,null);assert.equal(result.timedOut,false);assert.equal(result.truncated,false);assert.equal(result.failure,null);
}
