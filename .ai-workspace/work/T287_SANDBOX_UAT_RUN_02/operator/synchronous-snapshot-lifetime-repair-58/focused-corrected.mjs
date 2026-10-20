import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/synchronous-snapshot-lifetime-repair-58';
const request=JSON.parse(await readFile(root+'/commands/focused-tests.request.json','utf8'));
const environment={PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
 ABI5_LIVENESS_CUT_HISTORY:'/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/event-memory-repair-35/owner-history.logical.jsonl',
 ABI5_LIVENESS_CUT_SHA256:'sha256:b22178799d600fbde510c235b8cee58f95b458b363507f98e4da7738557d7afb',
 ABI5_LIVENESS_CUT_PREDECESSOR:'/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-16/scratch/successor/package',
 ABI5_SNAPSHOT_PREDECESSOR:'/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-18/scratch/successor/package'};
const result=await commandRecorder(root,{environment,timeoutMs:180000,maxOutputBytes:1048576})('focused-corrected',request.executable,request.args,{cwd:request.cwd});
console.log(JSON.stringify({exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure}));
assert.equal(result.exitCode,0);assert.equal(result.timedOut,false);assert.equal(result.truncated,false);assert.equal(result.failure,null);
