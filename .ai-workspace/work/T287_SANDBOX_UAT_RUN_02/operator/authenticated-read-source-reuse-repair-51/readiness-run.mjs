import {readFile,writeFile} from 'node:fs/promises';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root=new URL('.',import.meta.url).pathname,cwd='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const command=commandRecorder(root,{timeoutMs:180000,maxOutputBytes:1048576});
const build=await command('build','/opt/homebrew/bin/npm',['run','build'],{cwd});
console.log(JSON.stringify({stage:'build',exitCode:build.exitCode,wallMs:build.durationMs,timedOut:build.timedOut,truncated:build.truncated}));
if(build.exitCode!==0||build.timedOut||build.truncated)process.exitCode=1;
else {
 const ordered=await command('focused-owner','/opt/homebrew/bin/node',['--test','--test-concurrency=1','--test-name-pattern=cold acquisition receipt|historical durable cuts|held derivation','test_env/tests/t287-ordered-reconstruction.test.mjs'],{cwd});
 console.log(JSON.stringify({stage:'focused-owner',exitCode:ordered.exitCode,wallMs:ordered.durationMs,timedOut:ordered.timedOut,truncated:ordered.truncated}));
 if(ordered.exitCode!==0||ordered.timedOut||ordered.truncated)process.exitCode=1;
 else {
  const harness=await command('focused-harness','/opt/homebrew/bin/node',['--test','--test-concurrency=1','--test-name-pattern=Oracle event acquisition|Eventless read conservation|One authentic cold read|Native refusal without|Admitted failed and blocked|Both retained install','test_env/uat/harness.test.mjs'],{cwd,environment:{ABI5_UAT_UNIT_ROOT:root+'unit-runs',ABI5_AUTHENTIC_READ_HISTORY:'/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/event-memory-repair-35/owner-history.physical-prefix.jsonl',ABI5_AUTHENTIC_READ_HISTORY_DIGEST:'sha256:d37d30df4ba656cab7b31e233ca566fa9ba97b830f564568f13f9bac3990a89f'}});
  console.log(JSON.stringify({stage:'focused-harness',exitCode:harness.exitCode,wallMs:harness.durationMs,timedOut:harness.timedOut,truncated:harness.truncated}));
  if(harness.exitCode!==0||harness.timedOut||harness.truncated)process.exitCode=1;
 }
}
