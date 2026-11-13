// Author-check lane runner for rc7-overhead-author-01, adapted from the supplied prior-author-lanes.mjs:
// the selected finite lanes over one staged tenant. Test temp is /Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-scratch/rc7-overhead-author-01/tmp/host-tmp.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [label, only] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label ?? '') || (only !== undefined && !/^[a-z0-9-]+$/.test(only))) throw new Error('usage: node lanes.mjs <fresh-stage-label> [exact-lane-id]');
const worksite = '/Users/jim/src/apps/abiogenesis-rc6-local-cut';
const tmp = join(worksite, 'qualification-scratch/rc7-overhead-author-01/tmp');
const tenant = join(tmp, label, 'build_tenants/abiogenesis/typescript');
const inputs = JSON.parse(await readFile(join(worksite, 'qualification-inputs/rc7-overhead-author-01/C2_INPUTS.json'), 'utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const environment = { ...process.env, TMPDIR: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-scratch/rc7-overhead-author-01/tmp/host-tmp', TMPPREFIX: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-scratch/rc7-overhead-author-01/tmp/host-tmp/zsh', NPM_CONFIG_CACHE: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-scratch/rc7-overhead-author-01/tmp/host-tmp/npm-cache', NPM_CONFIG_UPDATE_NOTIFIER: 'false', NPM_CONFIG_OFFLINE: 'true' };
for (const key of Object.keys(environment)) {
  if (['ABI5_EVIDENCE_ROOT', 'ABI5_RESULT_LINEAGE_BASELINE', 'ABI5_RESULT_LINEAGE_REPORT'].includes(key) || key.startsWith('ABI5_F11_')) delete environment[key];
}
for (const key of Object.keys(environment)) if (key === 'ABG_WORKSITE_BUILD_ROOT' || key.startsWith('ABI5_WAVE1_FROZEN_ARTIFACT_')) delete environment[key];
const external = JSON.parse(await readFile(join(worksite, 'qualification-inputs/rc7-overhead-author-01/EXTERNAL_READ_INPUTS.json'), 'utf8'));
for (const pin of external.files) { const bytes = await readFile(pin.path); if (bytes.length !== pin.bytes || sha(bytes) !== pin.sha256) throw new Error('Explicit historical fixture pin differs: ' + pin.path); }
environment.ABI5_EVIDENCE_ROOT = external.root;
await mkdir(environment.TMPDIR, { recursive: true });
if (only !== undefined && !inputs.lanes.some(lane => lane.id === only)) throw new Error('Unknown selected lane: ' + only);
const out = join(tmp, label + '-lanes' + (only ? '-' + only : ''));
await mkdir(out);
const lanes = [];
for (const lane of inputs.lanes) {
  if (only !== undefined && lane.id !== only) continue;
  const args = ['--experimental-vm-modules', '--test', '--test-concurrency=1', '--test-reporter=tap', ...lane.files];
  const started = Date.now();
  const child = spawnSync(process.execPath, args, { cwd: tenant, env: environment, encoding: 'utf8', timeout: lane.timeoutMs, maxBuffer: 64 * 1024 * 1024 });
  const stdout = child.stdout ?? '', stderr = child.stderr ?? '';
  const tally = k => { const m = [...stdout.matchAll(new RegExp('^# ' + k + ' (\\d+)$', 'gm'))].at(-1); return m ? Number(m[1]) : null; };
  await writeFile(join(out, lane.id + '.stdout.tap'), stdout, { flag: 'wx' });
  await writeFile(join(out, lane.id + '.stderr.log'), stderr, { flag: 'wx' });
  const activeRc7=[...stdout.matchAll(/^\s*ok \d+ - (RC7 [^\n]+)$/gm)].map(m=>m[1]).filter(s=>!s.includes('# SKIP'));
  const requiredActivePass=(lane.requiredActivePrefixes??[]).every(p=>activeRc7.some(s=>s.startsWith(p)));
  const skippedNames=[...stdout.matchAll(/^\s*ok \d+ - (.*?)\s+# SKIP(?:\s.*)?$/gm)].map(m=>m[1]);
  const historicalSkipsDeclared=skippedNames.length===(tally('skipped')??0)&&skippedNames.every(n=>(lane.allowedHistoricalSkippedTests??[]).includes(n));
  const failing = [...stdout.matchAll(/^\s*not ok \d+ - (.*)$/gm)].map(m => m[1]);
  lanes.push({ id: lane.id, activeRc7, requiredActivePass, historicalSkipsDeclared, skippedNames, command: ['node', ...args].join(' '), cwd: tenant, exitCode: child.status, signal: child.signal,
    error: child.error?.message ?? null, ms: Date.now() - started, tests: tally('tests'), pass: tally('pass'), fail: tally('fail'),
    skipped: tally('skipped'), cancelled: tally('cancelled'), todo: tally('todo'), minimumTests: lane.minimumTests, failing,
    stdoutSha256: sha(Buffer.from(stdout)), stdoutBytes: Buffer.byteLength(stdout), stderrSha256: sha(Buffer.from(stderr)) });
}
await writeFile(join(out, 'summary' + (only ? '-' + only : '') + '.json'), JSON.stringify(lanes, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(lanes.map(({ id, exitCode, ms, tests, pass, fail, skipped, cancelled, todo, failing }) =>
  ({ id, exitCode, ms, tests, pass, fail, skipped, cancelled, todo, failing })), null, 1));

if (lanes.length === 0 || lanes.some(r => r.exitCode !== 0 || r.signal !== null || r.error !== null || r.tests === null || r.tests < r.minimumTests || r.pass + r.skipped !== r.tests || r.fail !== 0 || (r.skipped !== 0 && !r.historicalSkipsDeclared) || !r.requiredActivePass || r.cancelled !== 0 || r.todo !== 0)) process.exitCode = 1;
