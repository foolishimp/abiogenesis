// One unchanged registered-selection whole-file proof through the existing recorder/file host; no source changes.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,lstat,readlink,copyFile,chmod,symlink,statfs} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=async path=>{const b=await readFile(path);return {path,bytes:b.length,sha256:sha(b)};};
const checked=async p=>{assert.deepEqual(await pin(p.path),p);return readFile(p.path);};
const absent=async p=>{try{await lstat(p);throw Error('Existing allocation preserved: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}};
const [configPath,configSha,admissionPath,admissionSha]=process.argv.slice(2);
const raw=await readFile(configPath);assert.equal(sha(raw),configSha);const c=JSON.parse(raw);
const admissionRaw=await readFile(admissionPath);assert.equal(sha(admissionRaw),admissionSha);const admission=JSON.parse(admissionRaw);
assert.equal(c.status,'BOUND_FULL_REGISTERED_SELECTION_FILE');assert.equal(admission.status,'ROOT_ADMITTED_FULL_REGISTERED_SELECTION_FILE');assert.equal(admission.bindingSha256,configSha);
for(const p of admission.files??[])await checked(p);
assert.equal(c.file,'test_env/tests/t287-registered-graph-selection.test.mjs');assert.equal(c.expectedCases,1);assert.equal(c.commandTimeoutMs,1800000);
assert.equal(c.bounds.outputBytes,16777216);assert.equal(c.bounds.nodeHeapMiB,8192);assert.equal(c.bounds.reserveBytes,4294967296);assert.equal(c.bounds.maxOwnedBytes,4294967296);
const review=JSON.parse(await checked(c.review));assert.equal(review.verdict.wholeFileWithin600s,'falsified');assert.equal(review.verdict.completedTests,0);assert.equal(review.verdict.semanticAssertionRed,false);assert.equal(admission.reviewSha256,c.review.sha256);
const selection=JSON.parse(await checked(c.rootSelection));assert.equal(selection.status,'ROOT_SELECTED_REGISTERED_SELECTION_WHOLE_PROOF_PREPARATION');assert.equal(selection.sourceDigest,c.sourceDigest);assert.deepEqual(selection.review,c.review);await checked(c.sourceAcceptance);await checked(c.priorStoppedReturn);
const freeze=JSON.parse(await checked(c.sourceFreeze)),ready=JSON.parse(await checked(c.ready)),inventory=JSON.parse(await checked(c.inventory));
assert.equal(freeze.sourceDigest,c.sourceDigest);assert.equal(ready.sourceDigest,c.sourceDigest);await checked(c.artifact);await checked(c.runner);await checked(c.fileHost);for(const p of c.toolPins)await checked({path:p.path,bytes:p.bytes,sha256:p.sha256});
const basisBytes=await checked(c.candidateFixture),basis=JSON.parse(basisBytes),verification=JSON.parse(await checked(c.candidateFixtureReuse.verification));
for(const key of ['artifactDigest','productContentDigest','manifestDigest','productId','packageName','packageVersion'])assert.equal(basis[key],verification[key]);
const verify=async(root,rows)=>{for(const r of rows){const p=join(root,r.path),s=await lstat(p);if(r.kind==='symlink'){assert(s.isSymbolicLink());assert.equal(await readlink(p),r.target);}else{assert(s.isFile());assert.equal(s.size,r.bytes,p);assert.equal((await pin(p)).sha256,r.sha256,p);if(r.executable!==undefined)assert.equal(!!(s.mode&0o111),r.executable,p);}}};
const materialize=async(from,to,rows)=>{await mkdir(to);for(const r of rows){const p=join(to,r.path);await mkdir(dirname(p),{recursive:true});if(r.kind==='symlink')await symlink(r.target,p);else{await copyFile(join(from,r.path),p);await chmod(p,r.executable?0o755:0o644);}}await verify(to,rows);};
await absent(c.outputRoot);await absent(c.scratchRoot);await verify(ready.work,ready.derivedStageFiles);await verify(inventory.dependencyRoot,inventory.dependencyFiles);
const footprint=ready.derivedStageFiles.reduce((n,r)=>n+(r.bytes??0),0)+inventory.dependencyFiles.reduce((n,r)=>n+(r.bytes??0),0),space=await statfs(dirname(c.outputRoot));
assert(footprint<c.bounds.maxOwnedBytes);assert(space.bavail*space.bsize>=c.bounds.reserveBytes+footprint);
await mkdir(c.outputRoot);await mkdir(c.scratchRoot);const work=join(c.scratchRoot,'w'),tenant=join(work,c.tenantRelative),started=performance.now();
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(c.runner.path));
const record=(p,v)=>exclusiveRecord(c.outputRoot,p,v);let result=null;
try{
  await materialize(ready.work,work,ready.derivedStageFiles);await materialize(inventory.dependencyRoot,join(tenant,'node_modules'),inventory.dependencyFiles);
  assert.deepEqual(await readFile(join(tenant,'test_env/fixtures/abi5-root-candidate-basis.json')),basisBytes);
  await mkdir(join(c.scratchRoot,'t'));await mkdir(join(c.scratchRoot,'b'));
  for(const p of c.toolPins)await symlink(p.path,join(c.scratchRoot,'b',p.name));for(const n of ['user.npmrc','global.npmrc'])await writeFile(join(c.scratchRoot,n),'',{flag:'wx'});
  const env={HOME:process.env.HOME,PATH:join(c.scratchRoot,'b')+':/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',CI:'1',TMPDIR:join(c.scratchRoot,'t'),NODE_OPTIONS:'--max-old-space-size=8192',
    npm_config_userconfig:join(c.scratchRoot,'user.npmrc'),npm_config_globalconfig:join(c.scratchRoot,'global.npmrc'),npm_config_cache:join(c.scratchRoot,'n'),npm_config_offline:'true',npm_config_audit:'false',npm_config_fund:'false',npm_config_update_notifier:'false',
    ABG_TS_CLAUDE_COMMAND:join(c.scratchRoot,'UNSELECTED_PROVIDER'),ABG_TS_LIVE_CLAUDE_COMMAND:join(c.scratchRoot,'UNSELECTED_PROVIDER'),ABI5_UAT_UNIT_ROOT:join(tenant,'test_env/test_runs/sandbox-uat-units'),ABI5_SELECTION_EVIDENCE_ROOT:join(c.outputRoot,'selection-evidence')};
  const events=join(c.outputRoot,'events.jsonl'),args=['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap','--test-reporter-destination=stdout','--test-reporter='+join(tenant,'scripts/node-test-evidence-reporter.mjs'),'--test-reporter-destination='+events,c.file];
  await record('EXECUTION_STARTED.json',{at:new Date().toISOString(),pid:process.pid,binding:await pin(configPath),admission:await pin(admissionPath),sourceDigest:c.sourceDigest,file:c.file,wholeFile:true,expectedCases:c.expectedCases,environment:env});
  await record('file-host-binding.json',{executable:c.node.realPath,args,cwd:tenant,outputRoot:c.outputRoot,scratchRoot:c.scratchRoot,resourceRecord:join(c.outputRoot,'resources.json'),bounds:c.bounds});
  const host=await pin(join(c.outputRoot,'file-host-binding.json')),command=commandRecorder(c.outputRoot,{environment:env,timeoutMs:c.commandTimeoutMs,maxOutputBytes:c.bounds.outputBytes});
  result=await command('test',c.node.realPath,[c.fileHost.path,host.path,host.sha256],{cwd:tenant,environment:env,timeoutMs:c.commandTimeoutMs});
  const eventPin=await pin(events);assert(eventPin.bytes<=c.bounds.outputBytes);const rows=(await readFile(events,'utf8')).trim().split('\n').map(l=>JSON.parse(l)),summary=rows.filter(r=>r.type==='summary'&&r.file===null).at(-1);
  const passed=result.exitCode===0&&!result.signal&&!result.timedOut&&!result.truncated&&!result.failure&&summary?.success===true&&summary.counts.passed===c.expectedCases&&summary.counts.skipped===0&&rows.at(-1)?.type==='end';
  await verify(work,ready.derivedStageFiles);await verify(join(tenant,'node_modules'),inventory.dependencyFiles);await verify(ready.work,ready.derivedStageFiles);await verify(inventory.dependencyRoot,inventory.dependencyFiles);
  await record('RESULT.json',{status:passed?'PASSED':'FAILED',sourceDigest:c.sourceDigest,file:c.file,wholeFile:true,counts:summary?.counts??null,events:eventPin,wallMs:result.wallMs,totalMs:performance.now()-started,exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated,primaryPreserved:true,buildInvocations:0,providerCalls:0});
  console.log(JSON.stringify({status:passed?'PASSED':'FAILED',counts:summary?.counts,wallMs:result.wallMs}));assert(passed,'Selected whole fixture file incomplete or red');
}catch(error){await record('HALT.json',{at:new Date().toISOString(),error:String(error?.stack??error),result,automaticRetry:false});throw error;}
