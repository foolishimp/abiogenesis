import { commandRecorder } from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const cwd = '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const command = commandRecorder(root, { environment: Object.fromEntries(['HOME','PATH','TMPDIR','LANG'].filter(key => process.env[key] !== undefined).map(key => [key,process.env[key]])), timeoutMs: 120000, maxOutputBytes: 1048576 });
if (process.argv[2] === 'syntax') {
  for (const file of ['m5-worker-transport','m5-terminal-quiescence-owner','t287-native-workspace-work']) {
    const result = await command('syntax-'+file,process.execPath,['--check','test_env/tests/'+file+'.test.mjs'],{cwd});
    console.log(JSON.stringify({label:file,exitCode:result.exitCode,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated}));
    if (result.exitCode !== 0 || result.timedOut || result.truncated) { process.exitCode=1; break; }
  }
} else {
  const r02Only = process.argv[2]?.startsWith('r02-') ?? false;
  const pattern = r02Only ? 'post-effect channel conflict' : 'M5 |owned process groups|CCall opening|post-effect channel conflict|native timeout retains|native malformed-report retains|native read-only-change retains|unknown native after-state|observed partial failure|unavailable after observation|cold leader exit|timeout and termination-unconfirmed|preterminal Process exit|duplicate Process terminality';
  const label = process.argv[2] ?? 'focused';
  const files = r02Only ? ['test_env/tests/t287-native-workspace-work.test.mjs'] : ['test_env/tests/m5-worker-transport.test.mjs','test_env/tests/m5-terminal-quiescence-owner.test.mjs','test_env/tests/t287-native-workspace-work.test.mjs'];
  const result = await command(label,process.execPath,['--experimental-vm-modules','--test','--test-concurrency=1','--test-name-pattern',pattern,...files],{cwd});
  console.log(JSON.stringify({label,exitCode:result.exitCode,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,stdout:result.stdout,stderr:result.stderr}));
  process.exitCode = result.exitCode === 0 && !result.timedOut && !result.truncated ? 0 : 1;
}
