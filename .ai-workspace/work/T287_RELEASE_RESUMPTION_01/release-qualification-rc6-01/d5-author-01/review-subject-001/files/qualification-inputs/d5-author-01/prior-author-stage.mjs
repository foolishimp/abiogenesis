// Author-check staging for d5-author-01, adapted from the supplied prior-author-stage.mjs:
// copies only the selected C2 protected source closure (which now includes the
// test-support modules), the named offline toolchain and the immutable RC6 contract
// seed into this tmp root, then compiles and runs the canonical generator.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [label] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label ?? '')) throw new Error('usage: node stage.mjs <label>');
const worksite = '/Users/jim/src/apps/abiogenesis-rc6-local-cut';
const tmp = join(worksite, 'qualification-scratch/d5-author-01/tmp');
const stage = join(tmp, label), tenantRel = 'build_tenants/abiogenesis/typescript', tenant = join(stage, tenantRel);
const inputs = JSON.parse(await readFile(join(worksite, 'qualification-inputs/d5-author-01/C2_INPUTS.json'), 'utf8'));
const deps = JSON.parse(await readFile(join(worksite, 'qualification-inputs/d5-author-01/DEPENDENCY_SOURCE_SELECTION.json'), 'utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
await rm(stage, { recursive: true, force: true });
const sources = [];
for (const path of inputs.protectedSourcePaths) {
  const bytes = await readFile(join(worksite, path));
  await mkdir(dirname(join(stage, path)), { recursive: true });
  await writeFile(join(stage, path), bytes);
  sources.push({ path, bytes: bytes.length, sha256: sha(bytes) });
}
for (const pin of [...deps.toolchainEntryPins, ...deps.contractSeedPins]) {
  const bytes = await readFile(pin.path);
  if (bytes.length !== pin.bytes || sha(bytes) !== pin.sha256) throw new Error('dependency pin differs: ' + pin.path);
}
await cp(deps.toolchainRoot, join(tenant, 'node_modules'), { recursive: true, verbatimSymlinks: true });
await cp(deps.contractSeedRoot, join(tenant, 'contracts'), { recursive: true });
const run = (command, args) => {
  const started = Date.now();
  const child = spawnSync(command, args, { cwd: tenant, env: { ...process.env, NPM_CONFIG_UPDATE_NOTIFIER: 'false', NPM_CONFIG_OFFLINE: 'true', TMPDIR: '/private/tmp/abg-d5a', TMPPREFIX: '/private/tmp/abg-d5a/zsh', NPM_CONFIG_CACHE: '/private/tmp/abg-d5a/npm-cache' }, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { command: [command, ...args].join(' '), exitCode: child.status, signal: child.signal,
    ms: Date.now() - started, stdout: (child.stdout ?? '').slice(-4000), stderr: (child.stderr ?? '').slice(-4000) };
};
const compile = run(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json']);
const generate = compile.exitCode === 0 ? run(process.execPath, ['scripts/generate-product-manifest.mjs']) : null;
const lifecycle = generate?.exitCode === 0 ? run(process.execPath, ['scripts/check-lifecycle-boundary.mjs']) : null;
const sourceDigest = sha(Buffer.from(JSON.stringify(sources)));
const report = { label, stage, sourceCount: sources.length, sourceDigest, sources, compile, generate, lifecycle };
await writeFile(join(tmp, label + '-stage.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ label, sourceCount: sources.length, sourceDigest,
  lifecycle: lifecycle && { exitCode: lifecycle.exitCode, stdout: lifecycle.stdout, stderr: lifecycle.stderr },
  compile: { exitCode: compile.exitCode, ms: compile.ms, stdout: compile.stdout.slice(-3000) },
  generate: generate && { exitCode: generate.exitCode, ms: generate.ms, stderr: generate.stderr.slice(-1500) } }));
