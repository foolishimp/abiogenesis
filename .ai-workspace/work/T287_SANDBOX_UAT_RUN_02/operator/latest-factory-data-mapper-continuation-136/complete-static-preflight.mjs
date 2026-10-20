import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const record=commandRecorder(root,{environment:process.env,timeoutMs:30000,maxOutputBytes:1048576});
for(const [label,name,args]of [['args-composition-corrected','args-composition-proof.mjs',[]],['mechanical-inspection','prepare.mjs',['--inspect']]]){
 const r=await record(label,'/opt/homebrew/bin/node',[join(root,name),...args],{cwd:root});
 console.log(JSON.stringify({label,exitCode:r.exitCode,signal:r.signal,wallMs:r.wallMs,timedOut:r.timedOut,truncated:r.truncated,failure:r.failure}));
 assert.equal(r.exitCode,0);assert.equal(r.signal,null);assert.equal(r.timedOut,false);assert.equal(r.truncated,false);assert.equal(r.failure,null);
}
