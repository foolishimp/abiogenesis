import assert from 'node:assert/strict';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const phase='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/crosscut-closure-successor-94';
assert.equal(process.env.NODE_OPTIONS,undefined);
const command=commandRecorder(phase,{environment:{PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin'},timeoutMs:300000,maxOutputBytes:1048576});
const result=await command('clean-host','/opt/homebrew/bin/node',[phase+'/host-preparation/host-preparation.mjs'],{cwd:phase});
console.log(JSON.stringify({exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,stdout:result.stdout,stderr:result.stderr}));
assert.equal(result.exitCode,0);assert.equal(result.signal,null);assert.equal(result.timedOut,false);assert.equal(result.truncated,false);assert.equal(result.failure,null);
