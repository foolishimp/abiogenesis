// Author-check lane runner for rc7-overhead-author-03, adapted from the supplied prior-author-lanes.mjs:
// the selected finite lanes over one staged tenant. Test temp is /private/tmp/abg-o7c.
import { mkdir, readFile, writeFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [label, only] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label ?? '') || !/^[a-z0-9-]+$/.test(only ?? '')) throw new Error('usage: node lanes.mjs <successful-stage-label> <exact-lane-id>');
const setupStarted=Date.now();
const worksite = '/Users/jim/src/apps/abiogenesis-rc6-local-cut';
const tmp = join(worksite, 'qualification-scratch/rc7-overhead-author-03/tmp');
const tenant = join(tmp, label, 'build_tenants/abiogenesis/typescript');
const inputs = JSON.parse(await readFile(join(worksite, 'qualification-inputs/rc7-overhead-author-03/C2_INPUTS.json'), 'utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const environment = { ...process.env, TMPDIR: '/private/tmp/abg-o7c', TMPPREFIX: '/private/tmp/abg-o7c/zsh', NPM_CONFIG_CACHE: '/private/tmp/abg-o7c/npm-cache', NPM_CONFIG_UPDATE_NOTIFIER: 'false', NPM_CONFIG_OFFLINE: 'true', NPM_CONFIG_USERCONFIG: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-inputs/rc7-overhead-author-03/npm-user.npmrc', NPM_CONFIG_GLOBALCONFIG: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-inputs/rc7-overhead-author-03/npm-global.npmrc' };
for (const key of Object.keys(environment)) {
  if (['ABI5_EVIDENCE_ROOT', 'ABI5_RESULT_LINEAGE_BASELINE', 'ABI5_RESULT_LINEAGE_REPORT'].includes(key) || key.startsWith('ABI5_F11_')) delete environment[key];
}
for (const key of Object.keys(environment)) if (key === 'ABG_WORKSITE_BUILD_ROOT' || key.startsWith('ABI5_WAVE1_FROZEN_ARTIFACT_')) delete environment[key];
// The bridge has no legacy lane or historical external acquisition.
for(const key of Object.keys(environment))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||key.startsWith('ABG_TS_')||key.startsWith('ABI5_'))delete environment[key];
for(const path of [environment.NPM_CONFIG_USERCONFIG,environment.NPM_CONFIG_GLOBALCONFIG])if((await readFile(path)).length!==0)throw Error('Selected empty npm configuration differs');
const bounds=JSON.parse(await readFile(join(worksite,'qualification-inputs/rc7-overhead-author-03/COMMAND_BOUNDS.json'),'utf8'));
if(bounds.maxStages!==2||bounds.maxLaneInvocations!==6||bounds.concurrency!==1||!bounds.stageLabels.includes(label)||!bounds.laneIds.includes(only))throw Error('Unselected stage/lane/bounds');
const priorNames=await readdir(tmp);
const allocatedStages=bounds.stageLabels.filter(id=>priorNames.includes(id)||priorNames.includes(id+'-stage.json'));
if(allocatedStages.length>bounds.maxStages)throw Error('Stage cap already exceeded');
for(const id of allocatedStages)if(!priorNames.includes(id+'-stage.json'))throw Error('Prior stage allocation incomplete; stop and return');
const allocatedLanes=priorNames.filter(n=>bounds.stageLabels.some(id=>n.startsWith(id+'-lanes-')));
if(allocatedLanes.length>=bounds.maxLaneInvocations)throw Error('Lane allocation cap reached; failed/incomplete allocations count');
for(const name of allocatedLanes){
 const laneId=name.slice(name.indexOf('-lanes-')+7);
 try{await lstat(join(tmp,name,'summary-'+laneId+'.json'));}catch(e){if(e.code==='ENOENT')throw Error('Prior lane allocation incomplete; stop and return');throw e;}
}
const stageReport=JSON.parse(await readFile(join(tmp,label+'-stage.json'),'utf8'));
if(stageReport.label!==label||stageReport.sourceCount!==inputs.protectedSourcePaths.length||[stageReport.compile,stageReport.generate,stageReport.lifecycle].some(r=>!r||r.exitCode!==0||r.signal!==null||r.error!==null))throw Error('Stage compile/generation/guard incomplete');
if(stageReport.sources.length!==inputs.protectedSourcePaths.length||new Set(stageReport.sources.map(f=>f.path)).size!==inputs.protectedSourcePaths.length)throw Error('Stage source selection incomplete');
for(const f of stageReport.sources){
 if(!inputs.protectedSourcePaths.includes(f.path))throw Error('Unselected stage source');
 for(const root of [join(tmp,label),worksite]){const b=await readFile(join(root,f.path));if(b.length!==f.bytes||sha(b)!==f.sha256)throw Error('Source changed since selected stage: '+f.path);}
}
await mkdir(environment.TMPDIR, { recursive: true });
if (only !== undefined && !inputs.lanes.some(lane => lane.id === only)) throw new Error('Unknown selected lane: ' + only);
const out = join(tmp, label + '-lanes' + (only ? '-' + only : ''));
await mkdir(out);
const lanes = [];
const setupMs=Date.now()-setupStarted;
for (const lane of inputs.lanes) {
  if (only !== undefined && lane.id !== only) continue;
  const args = ['--experimental-vm-modules', '--test', '--test-concurrency=1', '--test-reporter=tap', ...(lane.testNamePattern === undefined ? [] : ['--test-name-pattern', lane.testNamePattern]), ...(lane.testSkipPattern === undefined ? [] : ['--test-skip-pattern', lane.testSkipPattern]), ...lane.files];
  const laneEnvironment={...environment};
  if(lane.timeoutMs!==300000||!lane.selectedTestNames?.length||lane.testNamePattern?.includes('(?!'))throw Error('Exact positive bounded lane required');
  const started = Date.now();
  const child = spawnSync(process.execPath, args, { cwd: tenant, env: laneEnvironment, encoding: 'utf8', timeout: lane.timeoutMs, maxBuffer: 64 * 1024 * 1024 });
  const stdout = child.stdout ?? '', stderr = child.stderr ?? '';
  const tally = k => { const m = [...stdout.matchAll(new RegExp('^# ' + k + ' (\\d+)$', 'gm'))].at(-1); return m ? Number(m[1]) : null; };
  await writeFile(join(out, lane.id + '.stdout.tap'), stdout, { flag: 'wx' });
  await writeFile(join(out, lane.id + '.stderr.log'), stderr, { flag: 'wx' });
  const activeRc7=[...stdout.matchAll(/^\s*ok \d+ - (RC7 [^\n]+)$/gm)].map(m=>m[1]).filter(s=>!s.includes('# SKIP'));
  const requiredActivePass=(lane.requiredActivePrefixes??[]).every(p=>activeRc7.some(s=>s.startsWith(p)));
  const skippedNames=[...stdout.matchAll(/^\s*ok \d+ - (.*?)\s+# SKIP(?:\s.*)?$/gm)].map(m=>m[1]);
  const historicalSkipsDeclared=skippedNames.length===(tally('skipped')??0)&&skippedNames.every(n=>(lane.allowedHistoricalSkippedTests??[]).includes(n));
  const passedNames=[...stdout.matchAll(/^\s*ok \d+ - (.*?)$/gm)].map(m=>m[1]).filter(n=>!n.includes('# SKIP'));
  const selectedPassedNames=passedNames.filter(n=>lane.selectedTestNames.includes(n));
  const selectedSkippedNames=skippedNames.filter(n=>lane.selectedTestNames.includes(n));
  const exactSelectedPass=lane.selectedTestNames.every(n=>selectedPassedNames.filter(p=>p===n).length===1)&&passedNames.length===lane.selectedTestNames.length;
  const failing = [...stdout.matchAll(/^\s*not ok \d+ - (.*)$/gm)].map(m => m[1]);
  lanes.push({ id: lane.id, setupMs, priorLaneAllocations:allocatedLanes.length, laneAllocationCap:bounds.maxLaneInvocations, stageSourceDigest:stageReport.sourceDigest, selectedTestNames:lane.selectedTestNames, selectedPassedNames, selectedSkippedNames, exactSelectedPass, nameFilteredExclusions:'Unselected case names are not proof; actual TAP skips remain separately recorded', activeRc7, requiredActivePass, historicalSkipsDeclared, skippedNames, command: ['node', ...args].join(' '), cwd: tenant, exitCode: child.status, signal: child.signal,
    error: child.error?.message ?? null, ms: Date.now() - started, tests: tally('tests'), pass: tally('pass'), fail: tally('fail'),
    skipped: tally('skipped'), cancelled: tally('cancelled'), todo: tally('todo'), minimumTests: lane.minimumTests, failing,
    stdoutSha256: sha(Buffer.from(stdout)), stdoutBytes: Buffer.byteLength(stdout), stderrSha256: sha(Buffer.from(stderr)) });
}
await writeFile(join(out, 'summary' + (only ? '-' + only : '') + '.json'), JSON.stringify(lanes, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(lanes.map(({ id, exitCode, ms, tests, pass, fail, skipped, cancelled, todo, failing }) =>
  ({ id, exitCode, ms, tests, pass, fail, skipped, cancelled, todo, failing })), null, 1));

if (lanes.length === 0 || lanes.some(r => !r.exactSelectedPass || r.selectedSkippedNames.length!==0 || r.exitCode !== 0 || r.signal !== null || r.error !== null || r.tests === null || r.tests < r.minimumTests || r.pass + r.skipped !== r.tests || r.fail !== 0 || (r.skipped !== 0 && !r.historicalSkipsDeclared) || !r.requiredActivePass || r.cancelled !== 0 || r.todo !== 0)) process.exitCode = 1;
