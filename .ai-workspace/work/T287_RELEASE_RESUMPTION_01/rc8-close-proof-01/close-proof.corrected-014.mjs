// T-287 operator custody only. Product tests, reporter and command owner remain unchanged.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,mkdir,readdir,lstat,readlink,realpath,copyFile,chmod,symlink,rm,rename,statfs} from 'node:fs/promises';
import {dirname,join,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),tenant='build_tenants/abiogenesis/typescript',GiB=1024**3;
const hex=b=>createHash('sha256').update(b).digest('hex');
const inside=(root,p)=>{const r=relative(root,p);return r!==''&&!r.startsWith('..')&&!isAbsolute(r);};
const relativePath=p=>{assert(typeof p==='string'&&p&&!isAbsolute(p)&&!p.split('/').some(s=>s==='..'||s==='.'||s===''),'unsafe relative path');return p;};
const buildEffects=['test_env/tests/t287-w2-05-generator-package-reproducibility.test.mjs','test_env/tests/t287-w2-05-release-snapshot-definition-bindings.test.mjs'];
const outputPaths=['artifacts','test_env/evidence','test_env/test_runs'];
async function hashFile(p){const h=createHash('sha256');for await(const b of createReadStream(p))h.update(b);return h.digest('hex');}
async function pin(p){const s=await lstat(p);assert(s.isFile(),'regular file required: '+p);return {path:p,bytes:s.size,sha256:await hashFile(p)};}
async function checked(p){assert(p&&/^[a-f0-9]{64}$/.test(p.sha256));const a=await pin(p.path);assert.equal(a.bytes,p.bytes,p.path);assert.equal(a.sha256,p.sha256,p.path);return readFile(p.path);}
async function absent(p){try{await lstat(p);throw Error('existing allocation preserved: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
async function record(root,name,value){const p=join(root,relativePath(name));await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(value,null,2)+'\n',{flag:'wx'});return pin(p);}
async function inventory(root,selections,{dependencies=false,retainLinks=false}={}){
  const rows=[];
  async function visit(p){const full=join(root,p),s=await lstat(full);
    if(s.isSymbolicLink()){
      assert(dependencies,'stage inputs must be materialized regular files: '+p);
      const target=await readlink(full);assert(retainLinks||(!isAbsolute(target)&&inside(root,resolve(dirname(full),target))),'dependency link escapes inventory');
      rows.push({path:p,kind:'symlink',target});
    }else if(s.isDirectory()){
      for(const n of (await readdir(full)).sort()){
        const next=p?join(p,n):n;
        if(!dependencies&&(n==='.git'||next===join(tenant,'node_modules')||outputPaths.some(x=>next===join(tenant,x))))continue;
        await visit(next);
      }
    }else{assert(s.isFile(),'unexpected member: '+p);rows.push({path:p,kind:'file',bytes:s.size,sha256:await hashFile(full),executable:!!(s.mode&0o111)});}
  }
  for(const p of selections)await visit(relativePath(p));
  rows.sort((a,b)=>a.path.localeCompare(b.path));assert.equal(new Set(rows.map(r=>r.path)).size,rows.length,'overlapping materialization roots');return rows;
}
async function verify(root,rows){for(const r of rows){const p=join(root,r.path),s=await lstat(p);
  if(r.kind==='symlink'){assert(s.isSymbolicLink());assert.equal(await readlink(p),r.target,p);}
  else{assert(s.isFile());assert.equal(s.size,r.bytes,p);assert.equal(await hashFile(p),r.sha256,p);assert.equal(!!(s.mode&0o111),r.executable,p);}
}}
async function materialize(from,to,rows){await mkdir(to);for(const r of rows){const target=join(to,r.path);await mkdir(dirname(target),{recursive:true});
  if(r.kind==='symlink')await symlink(r.target,target);else{await copyFile(join(from,r.path),target);await chmod(target,r.executable?0o755:0o644);}
}await verify(to,rows);}
const digestRows=rows=>hex(Buffer.from(JSON.stringify(rows)));
async function size(p){let s;try{s=await lstat(p);}catch(e){if(e.code==='ENOENT')return 0;throw e;}if(s.isSymbolicLink())return 0;if(s.isFile())return s.size;let n=0;for(const v of await readdir(p))n+=await size(join(p,v));return n;}
async function resource(config){const s=await statfs(here),ownedBytes=await size(config.outputRoot)+await size(config.scratchRoot),freeBytes=s.bavail*s.bsize;
  assert(freeBytes>=config.bounds.reserveBytes,'RESOURCE_STOP: free-space reserve');assert(ownedBytes<=config.bounds.maxOwnedBytes,'RESOURCE_STOP: owned-byte budget');return {at:new Date().toISOString(),freeBytes,ownedBytes};}
async function loadConfig(path,sha){const raw=await readFile(path);assert.equal(hex(raw),sha);const c=JSON.parse(raw);
  assert.equal(c.status,'BOUND_RC8_CLOSE_PROOF');assert(/^[a-f0-9]{40}$/.test(c.subject.baseCommit));assert(/^[a-f0-9]{64}$/.test(c.subject.sourceDigest));
  for(const k of ['sourceCommit','sourceTree'])assert(c.subject[k]===null||/^[a-f0-9]{40}$/.test(c.subject[k]));
  assert.equal(c.subject.builder,'5.0.0-rc.7');assert.equal(c.subject.method,'stdo://releases/v3.0.4/');assert.equal(c.providerCallsSelected,0);
  assert.equal(c.stage.root,await realpath(c.stage.root));assert(c.stage.materializationRoots?.length);for(const p of c.stage.materializationRoots)relativePath(p);
  await checked(c.stage.freezeReceipt);assert.equal(c.dependencies.root,await realpath(c.dependencies.root));
  assert.equal(await realpath(process.execPath),c.node.realPath);await checked({path:c.node.realPath,bytes:c.node.bytes,sha256:c.node.sha256});
  for(const p of c.ownerPins)await checked(p);for(const p of c.toolPins)await checked(p);
  assert(inside(here,c.outputRoot)&&inside(here,c.bindingRoot));assert(/^\/private\/tmp\/abg-r8c-[a-z0-9-]{1,18}$/.test(c.scratchRoot));
  assert.equal(c.bounds.reserveBytes,4*GiB);assert(c.bounds.maxOwnedBytes>0&&c.bounds.maxOwnedBytes<=4*GiB);
  assert(c.bounds.overallMs>0&&c.bounds.overallMs<=14400000);assert.equal(c.bounds.outputBytes,16*1024**2);
  assert.equal(c.bounds.pollMs,10000);assert.equal(c.bounds.defaultFileMs,600000);assert.equal(c.bounds.nodeHeapMiB,8192);
  for(const [p,n]of Object.entries(c.fileTimeoutMs)){relativePath(p);assert(n>=600000&&n<=3600000);}
  assert(Array.isArray(c.focusedCoverage));return c;
}
async function bind(c,configPin){
  await absent(c.bindingRoot);
  const files=await inventory(c.stage.root,c.stage.materializationRoots),dependencies=await inventory(c.dependencies.root,await readdir(c.dependencies.root),{dependencies:true});
  const available=new Map(files.map(x=>[x.path,x]));
  const testDir=join(c.stage.root,tenant,'test_env/tests');
  const tests=(await readdir(testDir)).filter(n=>n.endsWith('.test.mjs')).map(n=>'test_env/tests/'+n).sort();
  tests.push('test_env/uat/harness.test.mjs');
  for(const p of [...tests,'scripts/node-test-evidence-reporter.mjs','test_env/fixtures/abi5-root-candidate-basis.json'])assert(available.has(join(tenant,p)),'missing frozen input: '+p);
  for(const p of ['specification/PRODUCT.md','stdo_abiogenesis.json'])assert(available.has(p),'missing stage control: '+p);
  assert(files.some(r=>r.path.startsWith('.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/')),'tracked governance fixtures must be materialized in exact stage');
  for(const p of buildEffects)assert(tests.includes(p));
  const skipDeclarations=[],timeoutDeclarations=[];
  for(const p of tests){const lines=(await readFile(join(c.stage.root,tenant,p),'utf8')).split('\n');lines.forEach((text,i)=>{
    if(/skip\s*:|\.skip\(/u.test(text))skipDeclarations.push({file:p,line:i+1,source:text.trim()});
    if(/timeout\s*:/u.test(text))timeoutDeclarations.push({file:p,line:i+1,source:text.trim()});
  });}
  // Retain predecessor receipts through exact test-only source correspondence, never restamp them.
  const relation=c.retainedCreditSourceRelation;let nativeWorkspaceCredit=null;
  if(relation){
    await checked(relation.rootSourceAcceptance);await checked(relation.successorFreezeReceipt);await checked(relation.archive);
    assert.equal(relation.successorFreezeReceipt.sha256,c.stage.freezeReceipt.sha256);
    const base=JSON.parse(await checked(relation.baseInventory)),allow=new Set(relation.allowedChangedPaths);
    assert.deepEqual(dependencies,base.dependencyFiles,'test overlay changed dependencies');
    const actual=new Map(files.map(r=>[r.path,r])),before=new Map(base.stageFiles.map(r=>[r.path,r]));
    const basis=join(tenant,'test_env/fixtures/abi5-root-candidate-basis.json');await checked(relation.currentCandidateFixture);
    for(const r of base.stageFiles){const current=actual.get(r.path);assert(current,'missing predecessor input '+r.path);
      if(allow.has(r.path))continue;
      if(r.path===basis){assert.equal(current.bytes,relation.currentCandidateFixture.bytes);assert.equal(current.sha256,relation.currentCandidateFixture.sha256);}
      else assert.deepEqual(current,r,'non-test overlay input changed: '+r.path);
    }
    for(const r of files)assert(before.has(r.path)||allow.has(r.path),'ungranted new stage input '+r.path);
    assert.equal(base.freezeReceipt.sha256,relation.predecessorFreezeReceiptSha256);
    // Only the selected A5 native-workspace whole-file receipt may carry its A5 freeze.
    const carry=relation.nativeWorkspaceCarry;
    if(carry){
      assert.equal(carry.file,'test_env/tests/t287-native-workspace-work.test.mjs');
      assert.equal(carry.onlyIncrementalChangedPath,join(tenant,'test_env/tests/t287-f04a-probabilistic-result-candidate.test.mjs'));
      const previous=JSON.parse(await checked(carry.predecessorFreezeReceipt)),next=JSON.parse(await checked(relation.successorFreezeReceipt));
      const previousReady=JSON.parse(await checked(carry.predecessorReady)),nextReady=JSON.parse(await checked(carry.successorReady));
      assert.equal(carry.successorReady.sha256,c.stage.completedStage.sha256);assert.equal(nextReady.work,c.stage.root);
      assert.equal(next.baseSourceFreeze.sha256,carry.predecessorFreezeReceipt.sha256);
      assert.deepEqual(next.changedPaths,[carry.onlyIncrementalChangedPath]);assert.equal(previous.rows.length,next.rows.length);
      const previousRows=new Map(previous.rows.map(r=>[r.path,r]));
      for(const r of next.rows){assert(previousRows.has(r.path));if(r.path!==carry.onlyIncrementalChangedPath)assert.deepEqual(r,previousRows.get(r.path));}
      assert.equal(previousReady.sourceDigest,previous.sourceDigest);assert.equal(nextReady.sourceDigest,next.sourceDigest);
      assert.deepEqual(previousReady.productArchive,nextReady.productArchive);assert.equal(nextReady.productArchive.sha256,relation.archive.sha256);
      assert.deepEqual(nextReady.derivedStageFiles,files);assert.equal(previousReady.derivedStageFiles.length,files.length);
      for(const r of previousReady.derivedStageFiles)if(r.path!==carry.onlyIncrementalChangedPath)assert.deepEqual(actual.get(r.path),r,'A5 input correspondence changed: '+r.path);
      assert.deepEqual(carry.unchangedInputs.map(r=>r.path).sort(),[join(tenant,carry.file),join(tenant,'test_env/support/stdout-component-fixture.mjs')].sort());
      for(const r of carry.unchangedInputs){assert.deepEqual(previousRows.get(r.path),r);assert.equal(actual.get(r.path).bytes,r.bytes);assert.equal(actual.get(r.path).sha256,r.sha256);}
      nativeWorkspaceCredit={file:carry.file,freezeSha256:carry.predecessorFreezeReceipt.sha256};
    }
  }
  const credited=new Set();for(const row of c.focusedCoverage){assert(tests.includes(row.file)&&!credited.has(row.file));
    assert.equal(row.wholeFile,true,'partial/name-filtered work does not replace a whole-file broad run');assert.equal(row.success,true);
    assert(row.freezeReceiptSha256===c.stage.freezeReceipt.sha256||(relation&&row.freezeReceiptSha256===relation.predecessorFreezeReceiptSha256)||(nativeWorkspaceCredit&&row.file===nativeWorkspaceCredit.file&&row.freezeReceiptSha256===nativeWorkspaceCredit.freezeSha256),'focused receipt needs exact source or selected unchanged-test correspondence');
    assert.equal(row.testSha256,available.get(join(tenant,row.file)).sha256);assert(row.evidencePins.length);for(const p of row.evidencePins)await checked(p);
    assert(row.counts&&Number.isInteger(row.counts.passed)&&Number.isInteger(row.counts.skipped));credited.add(row.file);
  }
  const deferred=c.deferredFiles;
  assert.deepEqual(deferred.map(r=>r.file).sort(),['test_env/tests/t287-governed-context.test.mjs','test_env/tests/t287-installed-product-coordinate.test.mjs','test_env/tests/t287-native-assessment-evidence.test.mjs','test_env/tests/t287-native-worksite-execution.test.mjs','test_env/tests/t287-owned-process-lifetime.test.mjs','test_env/tests/t287-single-address-space-consolidation.test.mjs']);
  for(const row of deferred){assert(tests.includes(row.file)&&!credited.has(row.file));assert.equal(row.disposition,'SCHEDULING_DEFERRED_NO_COVERAGE');
    assert.equal(row.testSha256,available.get(join(tenant,row.file)).sha256);assert(row.evidencePins.length);for(const p of row.evidencePins)await checked(p);}
  await mkdir(c.bindingRoot);
  const bound={status:'BOUND_NOT_EXECUTION_ADMITTED',at:new Date().toISOString(),config:configPin,subject:c.subject,freezeReceipt:c.stage.freezeReceipt,
    stageRoot:c.stage.root,stageFiles:files,stageDigest:digestRows(files),dependencyRoot:c.dependencies.root,dependencyFiles:dependencies,dependencyDigest:digestRows(dependencies),
    retainedCreditSourceRelation:relation??null,tests,counts:{testFiles:tests.length-1,harnessFiles:1,allTestDirectoryMjs:(await readdir(testDir)).filter(x=>x.endsWith('.mjs')).length,
      focusedWholeFiles:credited.size,deferredFiles:deferred.length,scheduledFiles:tests.length-credited.size-deferred.length},focusedCoverage:c.focusedCoverage,deferredFiles:deferred,buildEffectFiles:buildEffects,
    skipDeclarations,timeoutDeclarations,skipStanding:'Declarations are source facts, not executed coverage. Actual skips and TODOs remain separate; Root owns their disposition.'};
  const result=await record(c.bindingRoot,'BOUND_INVENTORY.json',bound);console.log(JSON.stringify({status:bound.status,inventory:result,counts:bound.counts,stageDigest:bound.stageDigest,dependencyDigest:bound.dependencyDigest}));
}
async function emittedFiles(root){const rows=[];for(const p of outputPaths){try{const s=await lstat(join(root,p));if(s.isDirectory())rows.push(...await inventory(root,[p],{dependencies:true,retainLinks:true}));}catch(e){if(e.code!=='ENOENT')throw e;}}return rows;}
async function run(c,configPin,inventoryPin,admissionPin){
  const bound=JSON.parse(await checked(inventoryPin)),admission=JSON.parse(await checked(admissionPin));
  assert.deepEqual(bound.deferredFiles,c.deferredFiles);
  assert.equal(bound.config.sha256,configPin.sha256);assert.equal(admission.status,'ROOT_ADMITTED_RC8_BROAD_CLOSE');assert.equal(admission.configSha256,configPin.sha256);
  assert.equal(admission.inventorySha256,inventoryPin.sha256);assert.equal(admission.frozenStageReceiptSha256,c.stage.freezeReceipt.sha256);
  const prep=JSON.parse(await readFile(join(here,'PREPARATION_MANIFEST_CORRECTED_014.json'),'utf8'));assert.equal(await hashFile(join(here,'PREPARATION_MANIFEST_CORRECTED_014.json')),admission.preparationManifestSha256);
  for(const p of prep.files)await checked(p);
  assert.equal(bound.stageRoot,c.stage.root);assert.equal(bound.dependencyRoot,c.dependencies.root);await verify(c.stage.root,bound.stageFiles);await verify(c.dependencies.root,bound.dependencyFiles);
  assert.equal(digestRows(bound.stageFiles),bound.stageDigest);assert.equal(digestRows(bound.dependencyFiles),bound.dependencyDigest);
  await absent(c.outputRoot);await absent(c.scratchRoot);const initial=await resource(c);
  const footprint=bound.stageFiles.reduce((n,r)=>n+(r.bytes??0),0),depBytes=bound.dependencyFiles.reduce((n,r)=>n+(r.bytes??0),0);
  assert(2*(footprint+depBytes)<=c.bounds.maxOwnedBytes,'base plus isolated copy exceeds owned-byte budget before test output');
  assert(initial.freeBytes>=c.bounds.reserveBytes+2*(footprint+depBytes),'insufficient room for common plus one isolated build copy');
  await mkdir(c.outputRoot);await mkdir(c.scratchRoot,{mode:0o700});
  const start=Date.now(),results=[],resources=[initial],common=join(c.scratchRoot,'w'),dep=join(common,tenant,'node_modules'),tmp=join(c.scratchRoot,'t'),bin=join(c.scratchRoot,'b');
  const {commandRecorder}=await import(pathToFileURL(c.ownerPins[0].path));let failure=null;
  try{
    await materialize(c.stage.root,common,bound.stageFiles);await materialize(c.dependencies.root,dep,bound.dependencyFiles);
    await mkdir(tmp);await mkdir(bin);
    // An explicit tool PATH omits provider CLIs; live selectors and credential variables are not inherited.
    for(const tool of c.toolPins)await symlink(tool.path,join(bin,tool.name));
    for(const n of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(c.scratchRoot,n),'',{flag:'wx'});
    const env={HOME:process.env.HOME,PATH:bin+':/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',CI:'1',TMPDIR:tmp,
      NODE_OPTIONS:'--max-old-space-size='+c.bounds.nodeHeapMiB,npm_config_userconfig:join(c.scratchRoot,'npm-user.npmrc'),npm_config_globalconfig:join(c.scratchRoot,'npm-global.npmrc'),
      npm_config_cache:join(c.scratchRoot,'n'),npm_config_offline:'true',npm_config_audit:'false',npm_config_fund:'false',npm_config_update_notifier:'false',
      ABG_TS_CLAUDE_COMMAND:join(c.scratchRoot,'UNSELECTED_PROVIDER'),ABG_TS_LIVE_CLAUDE_COMMAND:join(c.scratchRoot,'UNSELECTED_PROVIDER'),
      ABI5_UAT_UNIT_ROOT:join(common,tenant,'test_env/test_runs/sandbox-uat-units')};
    await record(c.outputRoot,'EXECUTION_STARTED.json',{at:new Date().toISOString(),config:configPin,inventory:inventoryPin,admission:admissionPin,subject:c.subject,
      environment:env,bounds:c.bounds,primaryStage:c.stage.root,primaryStageWritesSelected:0,providerCallsSelected:0,
      resourceEnforcement:'Ten-second monitored operational stop plus file boundaries; not a quota. Overshoot and detached descendants remain possible.'});
    // Preserve normal npm package layout; compare existing npm-owned packlists before any test.
    const npmRequire=createRequire(c.toolPins.find(p=>p.name==='npm').path),Arborist=npmRequire('@npmcli/arborist'),npmPacklist=npmRequire('npm-packlist');
    const packageMembers=async root=>(await npmPacklist(await new Arborist({path:root}).loadActual())).sort();
    const expectedMembers=await packageMembers(join(c.stage.root,tenant)),actualMembers=await packageMembers(join(common,tenant));
    const expectedSet=new Set(expectedMembers),actualSet=new Set(actualMembers),missing=expectedMembers.filter(p=>!actualSet.has(p)),extra=actualMembers.filter(p=>!expectedSet.has(p));
    const describe=members=>({members:members.length,dependencies:members.filter(p=>p.startsWith('node_modules/')).length,listSha256:hex(Buffer.from(JSON.stringify(members)))});
    await record(c.outputRoot,'PACKAGE_LAYOUT_READBACK.json',{owner:'npm Arborist.loadActual + npm-packlist',expectedRoot:join(c.stage.root,tenant),actualRoot:join(common,tenant),
      expected:describe(expectedMembers),actual:describe(actualMembers),missing,extra,physicalDependencyDirectory:(await lstat(dep)).isDirectory(),readOnly:true});
    assert.equal(expectedMembers.length,5325);assert.equal(describe(expectedMembers).dependencies,4328);assert.deepEqual(actualMembers,expectedMembers,'derived npm package file list differs from accepted physical stage');
    const command=commandRecorder(c.outputRoot,{environment:env,timeoutMs:c.bounds.defaultFileMs,maxOutputBytes:c.bounds.outputBytes});
    // Select the current candidate through its maintained refresh owner, once in this derived tree.
    const basisRelative=join(tenant,'test_env/fixtures/abi5-root-candidate-basis.json'),basisPath=join(common,basisRelative),refresh=c.candidateBasisRefresh;
    const originalBasisRow=bound.stageFiles.find(r=>r.path===basisRelative);assert(originalBasisRow);
    await checked(refresh.originalFixture);const externalVerification=JSON.parse(await checked(refresh.verification));await checked(refresh.archive);
    const refreshOwner=join(common,tenant,'scripts/refresh-candidate-basis.mjs');await checked({...refresh.owner,path:refreshOwner});
    const refreshHost=await record(c.outputRoot,'setup-bindings/refresh-candidate-basis.json',{executable:c.node.realPath,args:[refreshOwner],cwd:join(common,tenant),
      outputRoot:c.outputRoot,scratchRoot:c.scratchRoot,resourceRecord:join(c.outputRoot,'resources/setup-refresh-candidate-basis.json'),bounds:c.bounds});
    const refreshResult=await command('setup-refresh-candidate-basis',c.node.realPath,[join(here,'file-host.mjs'),refreshHost.path,refreshHost.sha256],
      {cwd:join(common,tenant),environment:env,timeoutMs:Math.min(c.bounds.defaultFileMs,c.bounds.overallMs-(Date.now()-start))});
    assert(refreshResult.exitCode===0&&!refreshResult.signal&&!refreshResult.timedOut&&!refreshResult.truncated&&!refreshResult.failure,'candidate basis refresh owner failed');
    const refreshedBasisBytes=await readFile(basisPath),refreshedBasis=JSON.parse(refreshedBasisBytes),refreshedBasisPin=await pin(basisPath);
    const refreshedArchive=await pin(join(common,tenant,'artifacts',refresh.archiveFileName));
    const fields=['artifactDigest','productContentDigest','manifestDigest','productId','packageName','packageVersion'];
    const fieldMatches=Object.fromEntries(fields.map(k=>[k,refreshedBasis[k]===externalVerification[k]]));
    const derivedStageFiles=bound.stageFiles.map(r=>r.path===basisRelative?{...r,bytes:refreshedBasisPin.bytes,sha256:refreshedBasisPin.sha256}:r),derivedStageDigest=digestRows(derivedStageFiles);
    await record(c.outputRoot,'CANDIDATE_BASIS_REFRESH.json',{owner:refresh.owner,commandReceipt:await pin(join(c.outputRoot,'commands/setup-refresh-candidate-basis.result.json')),
      originalFixture:refresh.originalFixture,refreshedFixture:refreshedBasisPin,refreshedBasis,externalVerification:refresh.verification,fieldMatches,
      fixedExternalArchive:refresh.archive,actualOwnerProducedArchive:refreshedArchive,primaryStageDigest:bound.stageDigest,derivedStageDigest,
      onlySubstitutedInput:basisRelative,standing:'Selected derived test-data transformation only; primary source and negative-test external expectations remain fixed.'});
    assert.equal(externalVerification.kind,'verified_product_artifact');assert.equal(externalVerification.disposition,'verified');
    assert.equal(refreshedArchive.bytes,refresh.archive.bytes);assert.equal(refreshedArchive.sha256,refresh.archive.sha256);
    for(const k of fields)assert.equal(refreshedBasis[k],externalVerification[k],'candidate basis differs from fixed verified RC8 identity: '+k);
    await verify(common,derivedStageFiles);resources.push(await resource(c));
    const credits=new Map(c.focusedCoverage.map(r=>[r.file,r])),deferred=new Map(bound.deferredFiles.map(r=>[r.file,r]));
    const ordered=[...bound.tests.filter(p=>!buildEffects.includes(p)),...buildEffects];
    for(const [i,file]of ordered.entries()){
      if(credits.has(file)){results.push({file,kind:'credited_whole_file',credit:credits.get(file)});continue;}
      if(deferred.has(file)){const entry={file,kind:'deferred_no_coverage',deferral:deferred.get(file)};await record(c.outputRoot,'deferred/'+String(i+1).padStart(3,'0')+'.json',entry);results.push(entry);continue;}
      const remaining=c.bounds.overallMs-(Date.now()-start);assert(remaining>0,'OVERALL_TIME_STOP');resources.push(await resource(c));
      const label=String(i+1).padStart(3,'0')+'-'+file.split('/').at(-1).replace('.test.mjs',''),isolated=buildEffects.includes(file),work=isolated?join(c.scratchRoot,'x'+i):common;
      if(isolated){await materialize(c.stage.root,work,bound.stageFiles);await materialize(c.dependencies.root,join(work,tenant,'node_modules'),bound.dependencyFiles);await writeFile(join(work,basisRelative),refreshedBasisBytes);await verify(work,derivedStageFiles);}
      const cwd=join(work,tenant),events=join(c.outputRoot,'events',label+'.jsonl');await mkdir(dirname(events),{recursive:true});
      const args=['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap','--test-reporter-destination=stdout',
        '--test-reporter='+join(cwd,'scripts/node-test-evidence-reporter.mjs'),'--test-reporter-destination='+events,file];
      const timeout=Math.min(c.fileTimeoutMs[file]??c.bounds.defaultFileMs,remaining);
      const host=await record(c.outputRoot,'file-bindings/'+label+'.json',{executable:c.node.realPath,args,cwd,outputRoot:c.outputRoot,scratchRoot:c.scratchRoot,
        resourceRecord:join(c.outputRoot,'resources',label+'.json'),bounds:c.bounds});
      let fileEnvironment=env;
      if(file==='test_env/tests/t287-calculus-fold.test.mjs'){
        const oracle=c.hs03MetadataOracle;assert.equal(oracle.testFile,file);assert.equal(oracle.environmentVariable,'ABI5_HS03_STREAM_METADATA');
        assert.deepEqual(await pin(oracle.metadata.path),oracle.metadata);assert.deepEqual(await pin(oracle.manifest.path),oracle.manifest);
        await record(c.outputRoot,'external-inputs/'+label+'.json',{testFile:file,testSource:await pin(join(cwd,file)),metadata:oracle.metadata,manifest:oracle.manifest,
          environmentVariable:oracle.environmentVariable,standing:'Historical metadata oracle by read-only reference. Current tests synthesize chunks and admit new current events; no historical event import or relabelling.'});
        fileEnvironment={...env,ABI5_HS03_STREAM_METADATA:oracle.metadata.path};
      }
      if(file==='test_env/tests/t287-framework-handoff-types.test.mjs'){
        const oracle=c.hc1BaselineOracle;assert.equal(oracle.testFile,file);assert.equal(oracle.environmentVariable,'ABI5_HC1_BASELINE_PACKAGE_PATH');
        assert.deepEqual(await pin(oracle.archive.path),oracle.archive);await checked(oracle.testSource);
        await record(c.outputRoot,'external-inputs/'+label+'.json',{testFile:file,testSource:await pin(join(cwd,file)),archive:oracle.archive,environmentVariable:oracle.environmentVariable,standing:oracle.standing});
        fileEnvironment={...env,ABI5_HC1_BASELINE_PACKAGE_PATH:oracle.archive.path};
      }
      if(file==='test_env/tests/t287-single-address-space-consolidation.test.mjs'){
        const oracle=c.consolidationInputsOracle;assert.equal(oracle.testFile,file);assert.equal(oracle.environmentVariable,'ABI5_CONSOLIDATION_INPUTS');
        const resources=JSON.parse(await checked(oracle.resources));await checked(oracle.baseline);await checked(oracle.testSource);await checked(oracle.supportSource);
        assert.equal(dirname(oracle.resources.path),oracle.root);assert.equal(dirname(oracle.baseline.path),oracle.root);assert.equal(resources.readOnly,true);
        assert.deepEqual({path:resources.eventLogPath,bytes:resources.eventLogBytes,sha256:resources.eventLogSha256},oracle.eventLog);assert.deepEqual(await pin(oracle.eventLog.path),oracle.eventLog);
        await record(c.outputRoot,'external-inputs/'+label+'.json',{testFile:file,testSource:await pin(join(cwd,file)),root:oracle.root,resources:oracle.resources,baseline:oracle.baseline,eventLog:oracle.eventLog,environmentVariable:oracle.environmentVariable,standing:oracle.standing});
        fileEnvironment={...env,ABI5_CONSOLIDATION_INPUTS:oracle.root};
      }
      const result=await command(label,c.node.realPath,[join(here,'file-host.mjs'),host.path,host.sha256],{cwd,environment:fileEnvironment,timeoutMs:timeout});
      let rows=[],parseFailure=null;
      try{const s=await lstat(events);assert(s.size<=c.bounds.outputBytes,'event reporter output bound exceeded');rows=(await readFile(events,'utf8')).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));}catch(e){parseFailure=String(e);}
      const summary=rows.filter(r=>r.type==='summary'&&r.file===null).at(-1),skips=rows.filter(r=>r.type==='case'&&(r.skip||r.todo));
      const passed=result.exitCode===0&&!result.signal&&!result.timedOut&&!result.truncated&&!result.failure&&!parseFailure&&summary?.success===true&&rows.at(-1)?.type==='end';
      const effects=await emittedFiles(cwd),entry={file,kind:'executed',passed,wallMs:result.wallMs,exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,
        truncated:result.truncated,failure:result.failure,parseFailure,counts:summary?.counts??null,skips,events:await pin(events).catch(()=>null),
        commandReceipt:'commands/'+label+'.result.json',workspace:work,isolatedBuildEffect:isolated,effects,sourceEffects:[]};
      if(isolated){
        // These two existing tests intentionally rebuild. Retain exact changed starting-member coordinates.
        for(const r of derivedStageFiles){if(r.kind!=='file')continue;const p=join(work,r.path);let actual=null;try{actual=await pin(p);}catch(e){if(e.code!=='ENOENT')throw e;}
          if(!actual||actual.sha256!==r.sha256)entry.sourceEffects.push({path:r.path,before:r,after:actual});}
      }
      await record(c.outputRoot,'files/'+label+'.json',entry);results.push(entry);
      if(!passed)throw Error('FIRST_TEST_RED_OR_INCOMPLETE: '+file);
      if(!isolated)assert.equal(digestRows(await inventory(common,c.stage.materializationRoots)),derivedStageDigest,'ordinary test changed staged input membership/bytes');
      await verify(dep,bound.dependencyFiles);resources.push(await resource(c));
      if(isolated){
        // Root selected cleanup only after successful custody; primary test evidence moves intact before removal.
        const retained=join(c.outputRoot,'build-effects',label);await mkdir(retained,{recursive:true});
        for(const p of outputPaths){try{await lstat(join(cwd,p));await mkdir(dirname(join(retained,p)),{recursive:true});await rename(join(cwd,p),join(retained,p));}catch(e){if(e.code!=='ENOENT')throw e;}}
        await record(c.outputRoot,'build-effects/'+label+'/CUSTODY.json',{startingStageDigest:derivedStageDigest,primaryStageDigest:bound.stageDigest,startingDependencyDigest:bound.dependencyDigest,
          effects,sourceEffects:entry.sourceEffects,cleanup:'Only this successful derived source/build copy; retained test outputs above are preserved.'});
        await rm(work,{recursive:true,force:false});
      }
    }
  }catch(e){failure=String(e?.stack??e);await record(c.outputRoot,'FAILURE.json',{at:new Date().toISOString(),failure,retainedScratch:c.scratchRoot,autoRetry:false});}
  let primaryPreserved=false;try{await verify(c.stage.root,bound.stageFiles);await verify(c.dependencies.root,bound.dependencyFiles);primaryPreserved=true;}catch(e){failure??=String(e);}
  const completed=results.filter(r=>r.kind==='executed'&&r.passed).length+results.filter(r=>r.kind==='credited_whole_file').length;
  const deferredFiles=bound.deferredFiles.map(r=>r.file);
  const status=!failure&&completed+deferredFiles.length===bound.tests.length&&primaryPreserved?'BOUNDED_REMAINDER_COMPLETE_WITH_DEFERRED':'BROAD_CLOSE_STOPPED_INCOMPLETE';
  const countsFor=kind=>{const total={};for(const r of results.filter(r=>r.kind===kind))for(const [key,n]of Object.entries(r.counts??r.credit?.counts??{}))if(Number.isInteger(n))total[key]=(total[key]??0)+n;return total;};
  const out=await record(c.outputRoot,'SUMMARY.json',{status,at:new Date().toISOString(),subject:c.subject,inventory:inventoryPin,wallMs:Date.now()-start,failure,
    files:{inventoried:bound.tests.length,executed:results.filter(r=>r.kind==='executed').length,creditedWhole:results.filter(r=>r.kind==='credited_whole_file').length,
      passedThisRun:results.filter(r=>r.kind==='executed'&&r.passed).length,deferredSelected:deferredFiles.length,deferredRecorded:results.filter(r=>r.kind==='deferred_no_coverage').length,
      pending:bound.tests.filter(p=>!results.some(r=>r.file===p&&(r.kind==='credited_whole_file'||r.kind==='executed'&&r.passed)))},deferredFiles:bound.deferredFiles,
    observedTestCounts:countsFor('executed'),creditedTestCounts:countsFor('credited_whole_file'),results,resourceBoundarySamples:resources,primaryPreserved,providerCallsSelected:0,wholeReleaseQualified:false,
    limits:['Per-file and credited counts remain separate; skips and TODOs are not passed coverage.','Resource bounds are monitored, not quota enforced. Escaped descendants are not proven absent.',
      'Independent findings, exact-installed proof, measurement/profile and broader 5.0/human gates retain their owners. No source repair or automatic retry.']});
  console.log(JSON.stringify({status,summary:out}));if(failure)process.exitCode=1;
}
const [mode,configPath,configSha,...rest]=process.argv.slice(2);assert(['bind','run'].includes(mode),'usage: close-proof.corrected-014.mjs bind CONFIG SHA | run CONFIG SHA INVENTORY SHA ADMISSION SHA');
const c=await loadConfig(resolve(configPath),configSha),configPin=await pin(resolve(configPath));
if(mode==='bind'){assert.equal(rest.length,0);await bind(c,configPin);}else{assert.equal(rest.length,4);
  await run(c,configPin,{...await pin(resolve(rest[0])),sha256:rest[1]},{...await pin(resolve(rest[2])),sha256:rest[3]});}
