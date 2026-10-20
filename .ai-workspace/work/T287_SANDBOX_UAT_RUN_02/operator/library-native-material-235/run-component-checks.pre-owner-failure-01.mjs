import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { commandRecorder } from '../../../../../../build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';

const phase = dirname(fileURLToPath(import.meta.url));
const label = process.argv[2];
const tests = process.argv.slice(3);
if (!label || tests.length === 0) throw new TypeError('a receipt label and finite test population are required');
const environment = { ...process.env };
for (const key of Object.keys(environment)) {
  if (key.startsWith('ABI5_') || key.startsWith('ABG_')) delete environment[key];
}
environment.TMPDIR = join(phase, 'disposable');
environment.ABI5_NATIVE_MATERIAL_SCRATCH = join(phase, 'disposable');
environment.ABI5_CONTEXT_PROOF_ROOT = join(phase, 'disposable');
environment.ABI5_NATIVE_MATERIAL_PREIMAGE = join(phase, 'preimages/code/src/abg/instruction_assembly.ts');
const command = commandRecorder(phase, { environment, timeoutMs: 19260000, maxOutputBytes: 536870912 });
const result = await command(label, process.execPath, ['--experimental-vm-modules', '--test', '--test-concurrency=1', ...tests],
  { cwd: join(phase, 'component-cut-11') });
const summaries = result.stdout.split('\n').filter(line => /^# (tests|pass|fail|cancelled|skipped|duration_ms) /.test(line));
const metrics = result.stdout.split('\n').filter(line => line.includes('"kind":'));
console.log(JSON.stringify({ label, exitCode: result.exitCode, signal: result.signal, timedOut: result.timedOut,
  truncated: result.truncated, failure: result.failure, wallMs: result.wallMs, summaries, metrics,
  evidence: pathToFileURL(join(phase, 'commands', label + '.result.json')).href }));
if (result.exitCode !== 0 || result.signal !== null || result.timedOut || result.truncated || result.failure !== null) process.exitCode = 1;
