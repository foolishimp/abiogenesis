import assert from 'node:assert/strict';
import { commandRecorder } from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/synchronous-snapshot-lifetime-repair-58';
const cwd='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const environment={PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin'};
const command=commandRecorder(root,{environment,timeoutMs:180000,maxOutputBytes:1048576});
const check=async(label,executable,args,extra={})=>{
  const result=await command(label,executable,args,{cwd,...extra});
  console.log(JSON.stringify({label,exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure}));
  assert.equal(result.exitCode,0,label);assert.equal(result.timedOut,false);assert.equal(result.truncated,false);assert.equal(result.failure,null);
};
await check('syntax','/opt/homebrew/bin/node',['--check','test_env/tests/t287-ordered-reconstruction.test.mjs']);
console.log(JSON.stringify({stage:'build-started',at:new Date().toISOString()}));
await check('build','/opt/homebrew/bin/npm',['run','build']);
console.log(JSON.stringify({stage:'focused-tests-started',at:new Date().toISOString()}));
await check('focused-tests','/opt/homebrew/bin/node',['--test','--test-concurrency=1','--test-name-pattern=snapshot proof identity|cold acquisition receipt|historical durable cuts|held derivation preserves|liveness historical-cut intermediates','test_env/tests/t287-ordered-reconstruction.test.mjs'],{environment:{...environment,
  ABI5_LIVENESS_CUT_HISTORY:'/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/event-memory-repair-35/owner-history.logical.jsonl',
  ABI5_LIVENESS_CUT_SHA256:'sha256:b22178799d600fbde510c235b8cee58f95b458b363507f98e4da7738557d7afb',
  ABI5_LIVENESS_CUT_PREDECESSOR:'/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-16/scratch/successor/package',
  ABI5_SNAPSHOT_PREDECESSOR:'/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-18/scratch/successor/package'
}});
