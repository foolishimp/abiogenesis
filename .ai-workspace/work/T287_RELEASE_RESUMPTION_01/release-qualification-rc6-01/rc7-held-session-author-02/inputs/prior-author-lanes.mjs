// Author-check lane runner for rc7-held-session-author-02, adapted from the supplied prior-author-lanes.mjs:
// the selected finite lanes over one staged tenant. Test temp is /private/tmp/abg-hs2.
import { mkdir, readFile, writeFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [label, only] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label ?? '') || !/^[a-z0-9-]+$/.test(only ?? '')) throw new Error('usage: node lanes.mjs <successful-stage-label> <exact-lane-id>');
const setupStarted=Date.now();
const worksite = '/Users/jim/src/apps/abiogenesis-rc6-local-cut';
const tmp = join(worksite, 'qualification-scratch/rc7-held-session-author-02/tmp');
const tenant = join(tmp, label, 'build_tenants/abiogenesis/typescript');
const inputs = JSON.parse(await readFile(join(worksite, 'qualification-inputs/rc7-held-session-author-02/C2_INPUTS.json'), 'utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const environment = { ...process.env, TMPDIR: '/private/tmp/abg-hs2', TMPPREFIX: '/private/tmp/abg-hs2/zsh', NPM_CONFIG_CACHE: '/private/tmp/abg-hs2/npm-cache', NPM_CONFIG_UPDATE_NOTIFIER: 'false', NPM_CONFIG_OFFLINE: 'true', NPM_CONFIG_USERCONFIG: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-inputs/rc7-held-session-author-02/npm-user.npmrc', NPM_CONFIG_GLOBALCONFIG: '/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-inputs/rc7-held-session-author-02/npm-global.npmrc' };
for (const key of Object.keys(environment)) {
  if (['ABI5_EVIDENCE_ROOT', 'ABI5_RESULT_LINEAGE_BASELINE', 'ABI5_RESULT_LINEAGE_REPORT'].includes(key) || key.startsWith('ABI5_F11_')) delete environment[key];
}
for (const key of Object.keys(environment)) if (key === 'ABG_WORKSITE_BUILD_ROOT' || key.startsWith('ABI5_WAVE1_FROZEN_ARTIFACT_')) delete environment[key];
// This exact fixed-route selection has no legacy lane or historical external acquisition.
for(const key of Object.keys(environment))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)||key.startsWith('ABG_TS_')||key.startsWith('ABI5_'))delete environment[key];
for(const path of [environment.NPM_CONFIG_USERCONFIG,environment.NPM_CONFIG_GLOBALCONFIG])if((await readFile(path)).length!==0)throw Error('Selected empty npm configuration differs');
const bounds=JSON.parse(await readFile(join(worksite,'qualification-inputs/rc7-held-session-author-02/COMMAND_BOUNDS.json'),'utf8'));
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
const custody=JSON.parse(await readFile(join(worksite,'qualification-inputs/rc7-held-session-author-02/SOURCE_CUSTODY.json'),'utf8'));
const baselineBytes=await readFile(custody.sourceBefore.path);if(baselineBytes.length!==custody.sourceBefore.bytes||sha(baselineBytes)!==custody.sourceBefore.sha256)throw Error('Baseline pin differs');
const baseline=new Map(JSON.parse(baselineBytes).files.map(f=>[f.relativePath,f]));
for(const f of stageReport.sources){
 if(!inputs.protectedSourcePaths.includes(f.path))throw Error('Unselected stage source');
 const staged=await readFile(join(tmp,label,f.path));if(staged.length!==f.bytes||sha(staged)!==f.sha256)throw Error('Staged source changed: '+f.path);
 const baselineSource=stageReport.mode==='before'&&!f.path.includes('/test_env/tests/')&&!f.path.includes('/test_env/support/')&&!f.path.endsWith('/test_env/uat/harness.test.mjs');
 if(baselineSource){const held=baseline.get(f.path);if(!held||held.bytes!==f.bytes||held.sha256!==f.sha256)throw Error('Before-stage source differs from held baseline: '+f.path);}
 else{const current=await readFile(join(worksite,f.path));if(current.length!==f.bytes||sha(current)!==f.sha256)throw Error('Current source differs from selected stage: '+f.path);}
}
if(stageReport.mode!=='after')throw Error('Only selected after-stage proof is permitted');
const priorByLane=new Map();
for(const name of allocatedLanes){
 const priorLane=name.slice(name.indexOf('-lanes-')+7);
 if(priorLane===only)throw Error('Selected single lane allocation already consumed; no retry');
 priorByLane.set(priorLane,JSON.parse(await readFile(join(tmp,name,'summary-'+priorLane+'.json'),'utf8'))[0]);
}
const passed=r=>r&&r.exitCode===0&&r.fail===0&&r.cancelled===0&&r.todo===0&&r.requiredActivePass&&r.historicalSkipsDeclared;
const correction=only.endsWith('-correction'),baseLane=correction?only.slice(0,-11):only;
if(!['fixed-route','assessment-guards','caller'].includes(baseLane))throw Error('Unselected exact lane');
if(label!==bounds.stageLabels[correction?1:0])throw Error('Lane does not belong to the selected primary/correction stage');
if(correction){
 const primary=JSON.parse(await readFile(join(tmp,bounds.stageLabels[0]+'-stage.json'),'utf8'));
 const failedBuild=[primary.compile,primary.generate,primary.lifecycle].some(r=>!r||r.exitCode!==0||r.signal!==null||r.error!==null);
 const failedLane=['fixed-route','assessment-guards','caller'].some(id=>priorByLane.has(id)&&!passed(priorByLane.get(id)));
 if(!failedBuild&&!failedLane)throw Error('Correction allocation requires an actual recorded failure; no automatic replay');
}
const integration=priorByLane.get(correction?'fixed-route-correction':'fixed-route')??(correction?priorByLane.get('fixed-route'):undefined);
if(baseLane!=='fixed-route'&&(!passed(integration)||(!correction&&integration.stageSourceDigest!==stageReport.sourceDigest)))throw Error('Actual maintained fixed integration must pass first');
// On a correction source, reuse of earlier passing integration is reported explicitly for Root's causal conjunction, never relabelled as same-source proof.
const integrationEvidenceSourceDigest=integration?.stageSourceDigest??null;
const integrationEvidenceReused=baseLane!=='fixed-route'&&integrationEvidenceSourceDigest!==stageReport.sourceDigest;
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
  if(lane.timeoutMs!==300000||lane.testNamePattern?.includes('(?!')||lane.testSkipPattern?.includes('(?!'))throw Error('Selected finite per-lane bound and positive filter required');
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
  lanes.push({ id: lane.id, mode:stageReport.mode, setupMs, priorLaneAllocations:allocatedLanes.length, laneAllocationCap:bounds.maxLaneInvocations, stageSourceDigest:stageReport.sourceDigest, integrationEvidenceSourceDigest, integrationEvidenceReused, activeRc7, requiredActivePass, historicalSkipsDeclared, skippedNames, command: ['node', ...args].join(' '), cwd: tenant, exitCode: child.status, signal: child.signal,
    error: child.error?.message ?? null, ms: Date.now() - started, tests: tally('tests'), pass: tally('pass'), fail: tally('fail'),
    skipped: tally('skipped'), cancelled: tally('cancelled'), todo: tally('todo'), minimumTests: lane.minimumTests, failing,
    stdoutSha256: sha(Buffer.from(stdout)), stdoutBytes: Buffer.byteLength(stdout), stderrSha256: sha(Buffer.from(stderr)) });
}
await writeFile(join(out, 'summary' + (only ? '-' + only : '') + '.json'), JSON.stringify(lanes, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(lanes.map(({ id, exitCode, ms, tests, pass, fail, skipped, cancelled, todo, failing }) =>
  ({ id, exitCode, ms, tests, pass, fail, skipped, cancelled, todo, failing })), null, 1));

if (lanes.length === 0 || lanes.some(r => r.exitCode !== 0 || r.signal !== null || r.error !== null || r.tests === null || r.tests < r.minimumTests || r.pass + r.skipped !== r.tests || r.fail !== 0 || (r.skipped !== 0 && !r.historicalSkipsDeclared) || !r.requiredActivePass || r.cancelled !== 0 || r.todo !== 0)) process.exitCode = 1;
