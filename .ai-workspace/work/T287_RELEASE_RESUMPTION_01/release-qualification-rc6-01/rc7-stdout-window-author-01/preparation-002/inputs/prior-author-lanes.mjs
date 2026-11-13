// Author-check lane runner for rc7-stdout-window-author-01, adapted from the supplied prior-author-lanes.mjs:
// the selected finite lanes over one staged tenant. Test temp is /private/tmp/abg-sw1.
import { mkdir, readFile, writeFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [label, only] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label ?? '') || !/^[a-z0-9-]+$/.test(only ?? '')) throw new Error('usage: node lanes.mjs <successful-stage-label> <exact-lane-id>');
const setupStarted=Date.now();
const worksite = '/Users/jim/src/apps/abiogenesis-rc6-local-cut';
const tmp = join(worksite, 'qualification-scratch/rc7-stdout-window-author-01/tmp');
const tenant = join(tmp, label, 'build_tenants/abiogenesis/typescript');
const inputs = JSON.parse(await readFile(join(worksite, 'qualification-inputs/rc7-stdout-window-author-01/C2_INPUTS.json'), 'utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const environment = { ...process.env, TMPDIR: '/private/tmp/abg-sw1', TMPPREFIX: '/private/tmp/abg-sw1/zsh', NPM_CONFIG_CACHE: '/private/tmp/abg-sw1/npm-cache', NPM_CONFIG_UPDATE_NOTIFIER: 'false', NPM_CONFIG_OFFLINE: 'true', NPM_CONFIG_USERCONFIG: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-inputs/rc7-stdout-window-author-01/npm-user.npmrc', NPM_CONFIG_GLOBALCONFIG: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-inputs/rc7-stdout-window-author-01/npm-global.npmrc' };
for (const key of Object.keys(environment)) {
  if (['ABI5_EVIDENCE_ROOT', 'ABI5_RESULT_LINEAGE_BASELINE', 'ABI5_RESULT_LINEAGE_REPORT'].includes(key) || key.startsWith('ABI5_F11_')) delete environment[key];
}
for (const key of Object.keys(environment)) if (key === 'ABG_WORKSITE_BUILD_ROOT' || key.startsWith('ABI5_WAVE1_FROZEN_ARTIFACT_')) delete environment[key];
// No D4/S01 raw acquisition; the one historical metadata oracle is pinned below for differential lanes only.
for(const key of Object.keys(environment))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||key.startsWith('ABG_TS_')||key.startsWith('ABI5_'))delete environment[key];
for(const path of [environment.NPM_CONFIG_USERCONFIG,environment.NPM_CONFIG_GLOBALCONFIG])if((await readFile(path)).length!==0)throw Error('Selected empty npm configuration differs');
const bounds=JSON.parse(await readFile(join(worksite,'qualification-inputs/rc7-stdout-window-author-01/COMMAND_BOUNDS.json'),'utf8'));
if(bounds.maxStages!==4||bounds.maxLaneInvocations!==7||bounds.concurrency!==1||!bounds.stageLabels.includes(label)||!bounds.laneIds.includes(only))throw Error('Unselected stage/lane/bounds');
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
const custody=JSON.parse(await readFile(join(worksite,'qualification-inputs/rc7-stdout-window-author-01/SOURCE_CUSTODY.json'),'utf8'));
const baselineBytes=await readFile(custody.sourceBefore.path);if(baselineBytes.length!==custody.sourceBefore.bytes||sha(baselineBytes)!==custody.sourceBefore.sha256)throw Error('Baseline pin differs');
const baseline=new Map(JSON.parse(baselineBytes).files.map(f=>[f.relativePath,f]));
for(const f of stageReport.sources){
 if(!inputs.protectedSourcePaths.includes(f.path))throw Error('Unselected stage source');
 const staged=await readFile(join(tmp,label,f.path));if(staged.length!==f.bytes||sha(staged)!==f.sha256)throw Error('Staged source changed: '+f.path);
 const baselineSource=stageReport.mode==='before'&&!f.path.includes('/test_env/tests/')&&!f.path.includes('/test_env/support/')&&!f.path.endsWith('/test_env/uat/harness.test.mjs');
 if(baselineSource){const held=baseline.get(f.path);if(!held||held.bytes!==f.bytes||held.sha256!==f.sha256)throw Error('Before-stage source differs from held baseline: '+f.path);}
 else{const current=await readFile(join(worksite,f.path));if(current.length!==f.bytes||sha(current)!==f.sha256)throw Error('Current source differs from selected stage: '+f.path);}
}
if(!['before','after'].includes(stageReport.mode)||(stageReport.mode==='before')!==(only==='stdout-before'))throw Error('Unselected stage-mode/lane pair');
const priorByLane=new Map();
for(const name of allocatedLanes){
 const priorLane=name.slice(name.indexOf('-lanes-')+7);
 if(priorLane===only)throw Error('Selected single lane allocation already consumed; no retry');
 priorByLane.set(priorLane,JSON.parse(await readFile(join(tmp,name,'summary-'+priorLane+'.json'),'utf8'))[0]);
}
const passed=r=>r&&r.exitCode===0&&r.fail===0&&r.cancelled===0&&r.todo===0&&r.requiredActivePass&&r.historicalSkipsDeclared;
if(only!=='stdout-before'&&!priorByLane.has('stdout-before'))throw Error('Genuine before discriminator must be retained first');
if(!['stdout-before','stdout-differential'].includes(only)){
 const final=priorByLane.get('stdout-differential');
 if(!passed(final)||final.stageSourceDigest!==stageReport.sourceDigest)throw Error('Affected lanes require the same passing final differential source');
}
// Select and validate the complete one-lane input before any output allocation.
const selectedLanes=inputs.lanes.filter(lane=>lane.id===only);
if(selectedLanes.length!==1)throw Error('Exactly one selected lane required: '+only);
const lane=selectedLanes[0];
if(lane.timeoutMs!==300000)throw Error('Selected unchanged bound required');
for(const pattern of [lane.testNamePattern,lane.testSkipPattern])if(pattern!==undefined){
 if(typeof pattern!=='string'||pattern.length===0||pattern.includes('(?!'))throw Error('Selected positive filter required');
 new RegExp(pattern); // Match the engine syntax before reserving an allocation.
}
const args = ['--experimental-vm-modules', '--test', '--test-concurrency=1', '--test-reporter=tap', ...(lane.testNamePattern === undefined ? [] : ['--test-name-pattern', lane.testNamePattern]), ...(lane.testSkipPattern === undefined ? [] : ['--test-skip-pattern', lane.testSkipPattern]), ...lane.files];
const laneEnvironment={...environment};
if(lane.metadataOracle===true){
 const external=JSON.parse(await readFile(join(worksite,'qualification-inputs/rc7-stdout-window-author-01/EXTERNAL_READ_INPUTS.json'),'utf8'));
 if(external.files.length!==1)throw Error('Exactly one selected historical metadata oracle required');
 const pin=external.files[0],bytes=await readFile(pin.path);
 if(bytes.length!==pin.bytes||sha(bytes)!==pin.sha256)throw Error('Historical metadata oracle pin differs');
 laneEnvironment.ABI5_HS03_STREAM_METADATA=pin.path;
}
await mkdir(environment.TMPDIR, { recursive: true });
const out = join(tmp, label + '-lanes' + (only ? '-' + only : ''));
await mkdir(out); // Create-only reservation immediately before actual execution.
const lanes = [];
const setupMs=Date.now()-setupStarted;
{
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
  const failing = [...stdout.matchAll(/^\s*not ok \d+ - (.*)$/gm)].map(m => m[1]);
  lanes.push({ id: lane.id, mode:stageReport.mode, setupMs, priorLaneAllocations:allocatedLanes.length, laneAllocationCap:bounds.maxLaneInvocations, stageSourceDigest:stageReport.sourceDigest, activeRc7, requiredActivePass, historicalSkipsDeclared, skippedNames, command: ['node', ...args].join(' '), cwd: tenant, exitCode: child.status, signal: child.signal,
    error: child.error?.message ?? null, ms: Date.now() - started, tests: tally('tests'), pass: tally('pass'), fail: tally('fail'),
    skipped: tally('skipped'), cancelled: tally('cancelled'), todo: tally('todo'), minimumTests: lane.minimumTests, failing,
    stdoutSha256: sha(Buffer.from(stdout)), stdoutBytes: Buffer.byteLength(stdout), stderrSha256: sha(Buffer.from(stderr)) });
}
await writeFile(join(out, 'summary' + (only ? '-' + only : '') + '.json'), JSON.stringify(lanes, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(lanes.map(({ id, exitCode, ms, tests, pass, fail, skipped, cancelled, todo, failing }) =>
  ({ id, exitCode, ms, tests, pass, fail, skipped, cancelled, todo, failing })), null, 1));

if (lanes.length === 0 || lanes.some(r => r.exitCode !== 0 || r.signal !== null || r.error !== null || r.tests === null || r.tests < r.minimumTests || r.pass + r.skipped !== r.tests || r.fail !== 0 || (r.skipped !== 0 && !r.historicalSkipsDeclared) || !r.requiredActivePass || r.cancelled !== 0 || r.todo !== 0)) process.exitCode = 1;
