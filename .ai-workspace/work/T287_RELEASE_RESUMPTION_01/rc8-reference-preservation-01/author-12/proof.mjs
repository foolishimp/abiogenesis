// Test-only successor: freeze the admitted overlay, reuse exact compiled inputs, run the one selected focused fixture lane once.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,readdir,lstat,readlink,copyFile,chmod,symlink,statfs} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),sha=x=>createHash('sha256').update(x).digest('hex');
const pin=async path=>{const bytes=await readFile(path);return {path,bytes:bytes.length,sha256:sha(bytes)};};
const checked=async p=>{assert.deepEqual(await pin(p.path),p);return readFile(p.path);};
const selected=JSON.parse(await readFile(join(here,'BINDING.json'),'utf8'));
assert.equal(selected.status,'ROOT_SELECTED_SUCCESSOR_SCOPE');
const b={...JSON.parse(await checked(selected.baseControls)),...selected};
const prep=JSON.parse(await checked(b.preparation)),bounds=b.proofBounds;
for(const p of b.controlFiles)await checked(p);
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(b.sourceHelpers['runner.mjs'].path));
const root=b.proofRoot,scratch=b.proofScratchRoot,work=join(scratch,'w'),tenant=join(work,b.tenantRelative);
const exists=async p=>{try{await lstat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
const verify=async(base,rows)=>{for(const r of rows){const p=join(base,r.path),s=await lstat(p);if(r.kind==='symlink'){assert(s.isSymbolicLink());assert.equal(await readlink(p),r.target);}else{assert(s.isFile());assert.equal(s.size,r.bytes,p);assert.equal((await pin(p)).sha256,r.sha256,p);if(r.executable!==undefined)assert.equal(!!(s.mode&0o111),r.executable,p);}}};
const materialize=async(from,to,rows)=>{await mkdir(to);for(const r of rows){const dest=join(to,r.path);await mkdir(dirname(dest),{recursive:true});if(r.kind==='symlink')await symlink(r.target,dest);else{await copyFile(join(from,r.path),dest);await chmod(dest,r.executable?0o755:0o644);}}await verify(to,rows);};
assert(await exists(join(b.runtimeRoot,'STARTED.json')),'Native dispatch has not started');
assert(!(await exists(join(root,'HALT.json'))),'Prior failure requires Root re-entry');
const [mode,lane]=process.argv.slice(2),baseInventory=JSON.parse(await checked(prep.stageInventory));
const predecessorReady=JSON.parse(await checked(prep.predecessorReady));
const inventory={...baseInventory,stageRoot:predecessorReady.work,stageFiles:predecessorReady.derivedStageFiles,stageDigest:sha(Buffer.from(JSON.stringify(predecessorReady.derivedStageFiles)))};
const original=JSON.parse(await checked(prep.sourceFreeze));
const env={HOME:process.env.HOME,PATH:join(scratch,'b')+':/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',CI:'1',TMPDIR:join(scratch,'t'),
  NODE_OPTIONS:'--max-old-space-size=8192',npm_config_userconfig:join(scratch,'npm-user.npmrc'),npm_config_globalconfig:join(scratch,'npm-global.npmrc'),
  npm_config_cache:join(scratch,'n'),npm_config_offline:'true',npm_config_audit:'false',npm_config_fund:'false',npm_config_update_notifier:'false',
  ABG_TS_CLAUDE_COMMAND:join(scratch,'UNSELECTED_PROVIDER'),ABG_TS_LIVE_CLAUDE_COMMAND:join(scratch,'UNSELECTED_PROVIDER'),
  ABI5_UAT_UNIT_ROOT:join(tenant,'test_env/test_runs/sandbox-uat-units')};
let allocation=null;
try{
  if(mode==='freeze'){
    assert(!(await exists(root)),'One source-overlay freeze only');await mkdir(root);allocation=root;
    const s=await statfs(root);assert(s.bavail*s.bsize>bounds.reserveBytes,'Free reserve reached');
    await verify(inventory.stageRoot,inventory.stageFiles);await verify(inventory.dependencyRoot,inventory.dependencyFiles);await checked(prep.productArchive);
    const allowed=new Set(b.sourceWritePaths),rows=[],changed=[],overlays=[];
    for(const old of original.rows){const p=await pin(join(b.sourceRoot,old.path)),row={path:old.path,bytes:p.bytes,sha256:p.sha256};
      if(row.bytes!==old.bytes||row.sha256!==old.sha256){assert(allowed.has(row.path),'Outside test grant: '+row.path);changed.push(row.path);}rows.push(row);}
    for(const rel of b.sourceWritePaths.filter(p=>!original.rows.some(r=>r.path===p))){if(await exists(join(b.sourceRoot,rel))){const p=await pin(join(b.sourceRoot,rel));rows.push({path:rel,bytes:p.bytes,sha256:p.sha256});changed.push(rel);}}
    // Preserve the predecessor's code-point source-row order for digest correspondence.
    rows.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
    assert.equal(changed.length,1,'Expected exactly the selected one-file fixture increment');
    for(const rel of changed){const target=join(root,'overlay',rel);await mkdir(dirname(target),{recursive:true});await copyFile(join(b.sourceRoot,rel),target);overlays.push(await pin(target));}
    const sourceDigest=sha(Buffer.from(JSON.stringify(rows))),freeze={status:'FROZEN_TEST_ONLY_OVERLAY',sourceRoot:b.sourceRoot,baseSourceFreeze:prep.sourceFreeze,
      baseSource:original.source??original.baseSource,baseSourceDigest:original.sourceDigest,sourceDigest,rows,changedPaths:changed,overlay:overlays,compiledStage:inventory.stageRoot,
      compiledStageDigest:inventory.stageDigest,dependencyDigest:inventory.dependencyDigest,productArchive:prep.productArchive,buildInvocations:0};
    await exclusiveRecord(root,'source-freeze.json',freeze);console.log(JSON.stringify({status:freeze.status,sourceDigest,freeze:await pin(join(root,'source-freeze.json')),changedPaths:changed}));
    await mkdir(scratch);await materialize(inventory.stageRoot,work,inventory.stageFiles);await materialize(inventory.dependencyRoot,join(tenant,'node_modules'),inventory.dependencyFiles);
    for(const rel of changed){const target=join(work,rel);await mkdir(dirname(target),{recursive:true});await copyFile(join(root,'overlay',rel),target);}
    // Reuse the already-selected exact current-candidate test input; no refresh/repack is repeated here.
    const basisBytes=await checked(prep.currentCandidateFixture);await writeFile(join(tenant,'test_env/fixtures/abi5-root-candidate-basis.json'),basisBytes);
    const derived=inventory.stageFiles.map(r=>{const current=rows.find(x=>x.path===r.path);if(changed.includes(r.path))return {...r,bytes:current.bytes,sha256:current.sha256};
      if(r.path===b.tenantRelative+'/test_env/fixtures/abi5-root-candidate-basis.json')return {...r,bytes:basisBytes.length,sha256:sha(basisBytes)};return r;});
    for(const rel of changed.filter(p=>!derived.some(r=>r.path===p))){const r=rows.find(x=>x.path===rel);derived.push({...r,kind:'file',executable:false});}
    derived.sort((a,b)=>a.path.localeCompare(b.path));await verify(work,derived);
    await mkdir(join(scratch,'t'));await mkdir(join(scratch,'b'));
    for(const p of prep.proofTools){await checked({path:p.path,bytes:p.bytes,sha256:p.sha256});await symlink(p.path,join(scratch,'b',p.name));}
    for(const n of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(scratch,n),'',{flag:'wx'});
    await exclusiveRecord(root,'READY.json',{status:'EXACT_COMPILED_INPUTS_REUSED',sourceDigest,work,tenant,derivedStageFiles:derived,
      currentCandidateFixture:prep.currentCandidateFixture,productArchive:prep.productArchive,buildInvocations:0,environment:env});
    console.log(JSON.stringify({status:'EXACT_COMPILED_INPUTS_REUSED',sourceDigest,tenant}));
  }else{
    assert.equal(mode,'test','Use freeze | test materialization-o1');assert(Object.hasOwn(b.lanes,lane),'Unknown lane');
    const ready=JSON.parse(await readFile(join(root,'READY.json'),'utf8')),freeze=JSON.parse(await readFile(join(root,'source-freeze.json'),'utf8'));
    await verify(work,ready.derivedStageFiles);await verify(join(tenant,'node_modules'),inventory.dependencyFiles);
    const label='lane-01';
    allocation=join(root,label);await mkdir(allocation);const file=b.lanes[lane].files[0],events=join(allocation,'events.jsonl');
    const args=['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap','--test-reporter-destination=stdout',
      '--test-reporter='+join(tenant,'scripts/node-test-evidence-reporter.mjs'),'--test-reporter-destination='+events,...(b.lanes[lane].namePattern?['--test-name-pattern='+b.lanes[lane].namePattern]:[]),'test_env/tests/'+file];
    const host={executable:process.execPath,args,cwd:tenant,outputRoot:root,scratchRoot:scratch,resourceRecord:join(allocation,'resources.json'),bounds};
    await exclusiveRecord(allocation,'file-host-binding.json',host);const hostPin=await pin(join(allocation,'file-host-binding.json'));await checked(prep.fileHost);
    const command=commandRecorder(allocation,{environment:env,timeoutMs:600000,maxOutputBytes:bounds.outputBytes});
    const result=await command('test',process.execPath,[prep.fileHost.path,hostPin.path,hostPin.sha256],{cwd:tenant,environment:env,timeoutMs:600000});
    const eventPin=await pin(events);assert(eventPin.bytes<=bounds.outputBytes);const evidence=(await readFile(events,'utf8')).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));
    const summary=evidence.filter(r=>r.type==='summary'&&r.file===null).at(-1),passed=result.exitCode===0&&!result.signal&&!result.timedOut&&!result.truncated&&!result.failure&&summary?.success===true&&summary.counts.passed===b.lanes[lane].expectedPassed&&summary.counts.skipped===b.lanes[lane].expectedSkipped&&evidence.at(-1)?.type==='end';
    await verify(work,ready.derivedStageFiles);await verify(join(tenant,'node_modules'),inventory.dependencyFiles);await verify(inventory.stageRoot,inventory.stageFiles);await verify(inventory.dependencyRoot,inventory.dependencyFiles);
    const emittedArchive=join(tenant,'artifacts','abiogenesis-typescript-tenant-5.0.0-rc.8.tgz');if(await exists(emittedArchive)){const actual=await pin(emittedArchive);assert.equal(actual.bytes,prep.productArchive.bytes);assert.equal(actual.sha256,prep.productArchive.sha256);}
    await exclusiveRecord(allocation,'RESULT.json',{status:passed?'PASSED':'FAILED',lane,file,sourceDigest:freeze.sourceDigest,counts:summary?.counts??null,events:eventPin,
      wholeFile:b.lanes[lane].wholeFile,namePattern:b.lanes[lane].namePattern??null,optionalInputsSelected:false,wallMs:result.wallMs,exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated,primaryPreserved:true,buildInvocations:0});
    console.log(JSON.stringify({status:passed?'PASSED':'FAILED',lane,counts:summary?.counts,wallMs:result.wallMs,sourceDigest:freeze.sourceDigest}));
    assert(passed,'Selected fixture lane failed or incomplete');
  }
}catch(error){if(await exists(root)&&!(await exists(join(root,'HALT.json'))))await exclusiveRecord(root,'HALT.json',{allocation,error:String(error?.stack??error),autoRetry:false});throw error;}
