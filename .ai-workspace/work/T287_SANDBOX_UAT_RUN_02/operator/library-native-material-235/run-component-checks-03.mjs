import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { commandRecorder } from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const phase = dirname(fileURLToPath(import.meta.url));
const [label, fixture, ...tests] = process.argv.slice(2);
if (!label || !fixture || tests.length === 0) throw new TypeError('a receipt label, owned fixture and finite tests are required');
const environment = { ...process.env };
for (const key of Object.keys(environment)) if (key.startsWith('ABI5_') || key.startsWith('ABG_')) delete environment[key];
environment.TMPDIR = join(phase, 'disposable');
environment.ABI5_NATIVE_MATERIAL_SCRATCH = join(phase, 'disposable');
environment.ABI5_CONTEXT_PROOF_ROOT = join(phase, 'disposable');
environment.ABI5_NATIVE_MATERIAL_PREIMAGE = join(phase, 'preimages/code/src/abg/instruction_assembly.ts');
environment.ABI5_FULFILLMENT_RECORDS_ROOT = join(phase, 'fulfillment-records');
environment.ABI5_NATIVE_SOURCE_READY_CATALOG = join(phase, 'actual-ready-catalog-236.json');
const record = commandRecorder(phase, { environment, timeoutMs: 19260000, maxOutputBytes: 536870912 });
const result = await record(label, process.execPath,
  ['--experimental-vm-modules', '--test', '--test-reporter=tap', '--test-concurrency=1', ...tests], { cwd: join(phase, fixture) });
console.log(JSON.stringify({ label, exitCode: result.exitCode, signal: result.signal, wallMs: result.wallMs,
  timedOut: result.timedOut, truncated: result.truncated, failure: result.failure,
  summaries: result.stdout.split('\n').filter(line => /^# (tests|pass|fail|cancelled|skipped|duration_ms) /.test(line)),
  metrics: result.stdout.split('\n').filter(line => /^# \{"kind":/.test(line)) }));
if (result.exitCode !== 0 || result.signal !== null || result.timedOut || result.truncated || result.failure !== null) process.exitCode = 1;
