// Author-check staging for rc7-fixed-proof-author-02, adapted from the supplied prior-author-stage.mjs:
// copies only the selected C2 protected source closure (which now includes the
// test-support modules), the named offline toolchain and the immutable RC6 contract
// seed into this tmp root, then compiles and runs the canonical generator.
import { cp, mkdir, readFile, writeFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [label,mode='after'] = process.argv.slice(2);
if(!['before','after'].includes(mode))throw Error('mode must be before or after');
if (!/^[a-z0-9-]+$/.test(label ?? '')) throw new Error('usage: node stage.mjs <label>');
const worksite = '/Users/jim/src/apps/abiogenesis-rc6-local-cut';
const tmp = join(worksite, 'qualification-scratch/rc7-fixed-proof-author-02/tmp');
const stage = join(tmp, label), tenantRel = 'build_tenants/abiogenesis/typescript', tenant = join(stage, tenantRel);
const inputs = JSON.parse(await readFile(join(worksite, 'qualification-inputs/rc7-fixed-proof-author-02/C2_INPUTS.json'), 'utf8'));
const deps = JSON.parse(await readFile(join(worksite, 'qualification-inputs/rc7-fixed-proof-author-02/DEPENDENCY_SOURCE_SELECTION.json'), 'utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const setupStarted=Date.now();
const bounds=JSON.parse(await readFile(join(worksite,'qualification-inputs/rc7-fixed-proof-author-02/COMMAND_BOUNDS.json'),'utf8'));
if(bounds.maxStages!==3||bounds.maxLaneInvocations!==5||bounds.concurrency!==1)throw Error('Selected F2 finite bounds differ');
if(!bounds.stageLabels.includes(label))throw Error('Only three selected stage labels are permitted');
await mkdir(tmp,{recursive:true});
const priorNames=await readdir(tmp);
const allocatedStages=bounds.stageLabels.filter(id=>priorNames.includes(id)||priorNames.includes(id+'-stage.json'));
if(allocatedStages.length>=bounds.maxStages)throw Error('Stage allocation cap reached; failed/incomplete allocations count');
for(const id of allocatedStages)if(!priorNames.includes(id+'-stage.json'))throw Error('Prior stage allocation is incomplete; stop and return');
for(const name of priorNames.filter(n=>bounds.stageLabels.some(id=>n.startsWith(id+'-lanes-')))){
 const laneId=name.slice(name.indexOf('-lanes-')+7);
 try{await lstat(join(tmp,name,'summary-'+laneId+'.json'));}catch(e){if(e.code==='ENOENT')throw Error('Prior lane allocation is incomplete; stop and return');throw e;}
}
if(label!==bounds.stageLabels[allocatedStages.length])throw Error('Stage labels must be allocated serially in selected order');
await mkdir(stage); // Create-only reservation; retained even if setup/build fails.

const custody=JSON.parse(await readFile(join(worksite,'qualification-inputs/rc7-fixed-proof-author-02/SOURCE_CUSTODY.json'),'utf8'));
const baselineBytes=await readFile(custody.sourceBefore.path);
if(baselineBytes.length!==custody.sourceBefore.bytes||sha(baselineBytes)!==custody.sourceBefore.sha256)throw Error('Root-bound source custody differs');
const baseline=JSON.parse(baselineBytes);
const baselineFiles=new Map(baseline.files.map(f=>[f.relativePath,f]));
const sources = [];
for (const path of inputs.protectedSourcePaths) {
  const baselineSource=mode==='before'&&!path.includes('/test_env/tests/')&&!path.includes('/test_env/support/')&&!path.endsWith('/test_env/uat/harness.test.mjs');
  const held=baselineFiles.get(path);if(!held)throw Error('Unselected stage source: '+path);
  const bytes=await readFile(baselineSource?held.sourceSnapshot:join(worksite,path));
  if(baselineSource&&(bytes.length!==held.bytes||sha(bytes)!==held.sha256))throw Error('Baseline source differs: '+path);
  if(!inputs.mutableProductPaths.includes(path)){const current=baselineSource?await readFile(join(worksite,path)):bytes;if(current.length!==held.bytes||sha(current)!==held.sha256)throw Error('Read-only source changed: '+path);}
  await mkdir(dirname(join(stage, path)), { recursive: true });
  await writeFile(join(stage, path), bytes, { flag: 'wx' });
  sources.push({ path, bytes: bytes.length, sha256: sha(bytes) });
}
for (const pin of [...deps.toolchainEntryPins, ...deps.contractSeedPins]) {
  const bytes = await readFile(pin.path);
  if (bytes.length !== pin.bytes || sha(bytes) !== pin.sha256) throw new Error('dependency pin differs: ' + pin.path);
}
await cp(deps.toolchainRoot, join(tenant, 'node_modules'), { recursive: true, verbatimSymlinks: true });
await cp(deps.contractSeedRoot, join(tenant, 'contracts'), { recursive: true });
const environment = { ...process.env, NPM_CONFIG_UPDATE_NOTIFIER: 'false', NPM_CONFIG_OFFLINE: 'true', NPM_CONFIG_USERCONFIG: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-inputs/rc7-fixed-proof-author-02/npm-user.npmrc', NPM_CONFIG_GLOBALCONFIG: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-inputs/rc7-fixed-proof-author-02/npm-global.npmrc', TMPDIR: '/private/tmp/abg-f2', TMPPREFIX: '/private/tmp/abg-f2/zsh', NPM_CONFIG_CACHE: '/private/tmp/abg-f2/npm-cache' };
for (const key of Object.keys(environment)) if (['ABI5_EVIDENCE_ROOT', 'ABI5_RESULT_LINEAGE_BASELINE', 'ABI5_RESULT_LINEAGE_REPORT', 'ABG_WORKSITE_BUILD_ROOT'].includes(key) || key.startsWith('ABI5_F11_') || key.startsWith('ABI5_WAVE1_FROZEN_ARTIFACT_')) delete environment[key];
for(const key of Object.keys(environment))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||key.startsWith('ABG_TS_')||key.startsWith('ABI5_'))delete environment[key];
for(const path of [environment.NPM_CONFIG_USERCONFIG,environment.NPM_CONFIG_GLOBALCONFIG])if((await readFile(path)).length!==0)throw Error('Selected empty npm config differs');
await mkdir(environment.TMPDIR, { recursive: true });
await mkdir(join(tenant, 'artifacts'), { recursive: true });
const run = (command, args, timeoutMs) => {
  const started = Date.now();
  const child = spawnSync(command, args, { cwd: tenant, env: environment, timeout: timeoutMs, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { command: [command, ...args].join(' '), exitCode: child.status, signal: child.signal, error: child.error?.message ?? null,
    ms: Date.now() - started, stdout: (child.stdout ?? '').slice(-4000), stderr: (child.stderr ?? '').slice(-4000) };
};
const setupMs=Date.now()-setupStarted;
const compile = run(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], 240000);
const generate = compile.exitCode === 0 ? run(process.execPath, ['scripts/generate-product-manifest.mjs'], 180000) : null;
const lifecycle = generate?.exitCode === 0 ? run(process.execPath, ['scripts/check-lifecycle-boundary.mjs'], 60000) : null;
const sourceDigest = sha(Buffer.from(JSON.stringify(sources)));
const report = { label, mode, stage, setupMs, priorStageLabels:allocatedStages, stageAllocationCap:bounds.maxStages, sourceCount: sources.length, sourceDigest, sources, compile, generate, lifecycle };
await writeFile(join(tmp, label + '-stage.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ label, sourceCount: sources.length, sourceDigest,
  lifecycle: lifecycle && { exitCode: lifecycle.exitCode, stdout: lifecycle.stdout, stderr: lifecycle.stderr },
  compile: { exitCode: compile.exitCode, ms: compile.ms, stdout: compile.stdout.slice(-3000) },
  generate: generate && { exitCode: generate.exitCode, ms: generate.ms, stderr: generate.stderr.slice(-1500) } }));

if ([compile, generate, lifecycle].some(r => r === null || r.exitCode !== 0 || r.signal !== null || r.error !== null)) process.exitCode = 1;
