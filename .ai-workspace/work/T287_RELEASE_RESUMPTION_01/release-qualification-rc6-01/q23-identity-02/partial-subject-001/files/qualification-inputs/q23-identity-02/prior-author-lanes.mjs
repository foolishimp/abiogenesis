// Author-check lane runner for q23-identity-01: the two selected finite lanes over one staged tenant.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [label, only] = process.argv.slice(2);
const worksite = '/Users/jim/src/apps/abiogenesis-rc6-local-cut';
const tmp = join(worksite, 'qualification-scratch/q23-identity-01/tmp');
const tenant = join(tmp, label, 'build_tenants/abiogenesis/typescript');
const inputs = JSON.parse(await readFile(join(worksite, 'qualification-inputs/q23-identity-01/C2_INPUTS.json'), 'utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const environment = { ...process.env, TMPDIR: '/private/tmp/abg-q23' };
for (const key of Object.keys(environment)) {
  if (['ABI5_EVIDENCE_ROOT', 'ABI5_RESULT_LINEAGE_BASELINE', 'ABI5_RESULT_LINEAGE_REPORT'].includes(key) || key.startsWith('ABI5_F11_')) delete environment[key];
}
await mkdir(environment.TMPDIR, { recursive: true });
const out = join(tmp, label + '-lanes');
await mkdir(out, { recursive: true });
const lanes = [];
for (const lane of inputs.lanes) {
  if (only !== undefined && lane.id !== only) continue;
  const args = ['--experimental-vm-modules', '--test', '--test-concurrency=1', '--test-reporter=tap', ...lane.files];
  const started = Date.now();
  const child = spawnSync(process.execPath, args, { cwd: tenant, env: environment, encoding: 'utf8', timeout: lane.timeoutMs, maxBuffer: 64 * 1024 * 1024 });
  const stdout = child.stdout ?? '', stderr = child.stderr ?? '';
  const tally = k => { const m = [...stdout.matchAll(new RegExp('^# ' + k + ' (\\d+)$', 'gm'))].at(-1); return m ? Number(m[1]) : null; };
  await writeFile(join(out, lane.id + '.stdout.tap'), stdout);
  await writeFile(join(out, lane.id + '.stderr.log'), stderr);
  const failing = [...stdout.matchAll(/^\s*not ok \d+ - (.*)$/gm)].map(m => m[1]);
  lanes.push({ id: lane.id, command: ['node', ...args].join(' '), cwd: tenant, exitCode: child.status, signal: child.signal,
    error: child.error?.message ?? null, ms: Date.now() - started, tests: tally('tests'), pass: tally('pass'), fail: tally('fail'),
    skipped: tally('skipped'), cancelled: tally('cancelled'), todo: tally('todo'), minimumTests: lane.minimumTests, failing,
    stdoutSha256: sha(Buffer.from(stdout)), stdoutBytes: Buffer.byteLength(stdout), stderrSha256: sha(Buffer.from(stderr)) });
}
await writeFile(join(out, 'summary' + (only ? '-' + only : '') + '.json'), JSON.stringify(lanes, null, 2) + '\n');
console.log(JSON.stringify(lanes.map(({ id, exitCode, ms, tests, pass, fail, skipped, cancelled, todo, failing }) =>
  ({ id, exitCode, ms, tests, pass, fail, skipped, cancelled, todo, failing })), null, 1));
