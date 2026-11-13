// One bounded candidate bootstrap using existing npm and Product owners.
// Root must bind accepted frozen source before execution. No build or identity rewrite.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat,readdir,realpath,statfs} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve,dirname,basename,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),hex=b=>createHash('sha256').update(b).digest('hex');
const self=fileURLToPath(import.meta.url),T='build_tenants/abiogenesis/typescript';
async function pin(path){const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink(),path);const raw=await readFile(path);return {path,bytes:raw.length,sha256:hex(raw)};}
async function checked(p){assert(p&&isAbsolute(p.path)&&Number.isSafeInteger(p.bytes)&&/^[a-f0-9]{64}$/.test(p.sha256),'unbound pin');assert.deepEqual(await pin(p.path),p);return readFile(p.path);}
async function absent(p){try{await lstat(p);throw Error('preserve existing allocation: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
function relative(p){assert(p&&!isAbsolute(p)&&!p.includes('\\')&&!p.split('/').some(x=>!x||x==='.'||x==='..'),p);return p;}
const installing=process.argv[2]==='--install';assert.equal(process.argv.length,installing?5:4,'usage: node prepare-rc9-bootstrap-001.mjs BINDINGS SHA256');
const input=resolve(process.argv[installing?3:2]),raw=await readFile(input);assert.equal(hex(raw),process.argv[installing?4:3]);const b=JSON.parse(raw);
assert.equal(b.status,'ROOT_SELECTED_RC9_AFTER_BOOTSTRAP');await checked(b.activation);await checked(b.sourceAcceptance);
assert.equal(b.outputRoot,join(here,'bootstrap-rc9-001'));assert.equal(b.tempRoot,'/private/tmp/abg-r9m-rc9-bootstrap-001');assert.equal(b.installHost,join(b.tempRoot,'host'));
assert.equal(b.bounds.aggregateBytes,1073741824);assert.equal(b.bounds.outputBytes,16777216);assert.equal(b.bounds.freeReserveBytes,4294967296);
const refs=JSON.parse(await checked(b.ownerReferences));for(const p of refs.canonicalOperatorOwners)await checked(p);
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(refs.canonicalOperatorOwners[0].path));
const save=async(name,value)=>{const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');assert(bytes.length<=b.bounds.outputBytes,'retained file exceeds output bound: '+name);return exclusiveRecord(b.outputRoot,name,bytes,true);};
async function budget(label){let bytes=0;const seen=new Set();async function walk(p){const s=await lstat(p).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));if(!s)return;if(s.isSymbolicLink()){bytes+=s.size;return;}if(s.isDirectory()){for(const n of await readdir(p))await walk(join(p,n));return;}const k=s.dev+':'+s.ino;if(!seen.has(k)){seen.add(k);bytes+=s.size;}}await walk(b.outputRoot);await walk(b.tempRoot);assert(bytes<=b.bounds.aggregateBytes,'1 GiB aggregate operational stop');const fs=await statfs(here);assert(fs.bavail*fs.bsize>=b.bounds.freeReserveBytes,'4 GiB free-space reserve');return {label,logicalBytes:bytes,freeBytes:fs.bavail*fs.bsize,quota:false,overshootPossible:true};}
const manifest=JSON.parse(await checked(b.stageManifest));assert.equal(manifest.packageVersion,'5.0.0-rc.9');assert.equal(manifest.productId,'product://abiogenesis/typescript-tenant@5.0.0-rc.9');assert.equal(manifest.packageName,'@abiogenesis/typescript-tenant');
assert.equal(b.sourceIdentity.sourceCommitRole,'base_only');assert.equal(b.sourceIdentity.sourceCommit,b.sourceIdentity.baseCommit);assert(/^[a-f0-9]{40}$/.test(b.sourceIdentity.baseCommit));
const frozen=JSON.parse(await checked(b.sourceIdentity.sourceFreeze));assert.equal(frozen.sourceDigest,b.sourceIdentity.sourceDigest);assert.equal(b.expectedSourceRows,1340);assert.equal(frozen.rows.length,b.expectedSourceRows);
assert.equal(b.packageRoot,join(dirname(b.sourceIdentity.sourceFreeze.path),'work',T));assert.equal(b.stageManifest.path,join(b.packageRoot,'product-toolchain-manifest.json'));
assert.equal(b.sourceIdentity.baseCommit,'2019d62e4bb5d28183cc720b904d7901f19dc44a');
for(const p of b.candidateOwnerPins)await checked({path:join(b.packageRoot,p.relativePath),bytes:p.bytes,sha256:p.sha256});
if(installing){
  await absent(b.installHost);await checked(b.archive);await budget('before_owner_install');
  const product=await import(pathToFileURL(join(b.packageRoot,'build/code/src/product/index.js')));
  assert.equal(product.ABI5_PACKAGE_VERSION,'5.0.0-rc.9');
  const summary={status:'PARTIAL',sourceIdentity:b.sourceIdentity,archive:b.archive,releaseCut:false,qualified:false,providerCalls:0};
  try{
    const verified=await product.verifyProduct({artifactPath:b.archive.path,artifactRef:pathToFileURL(b.archive.path).href,expectedArtifactDigest:'sha256:'+b.archive.sha256,expectedProductContentDigest:manifest.productContentDigest,expectedManifestDigest:product.sha256Canonical(manifest),expectedProductId:manifest.productId,expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion});
    await save('verification.json',verified);assert.equal(verified.disposition,'verified','Product verification refused');
    const lock=product.constructResolvedProductLock([verified]);await save('resolved-lock.json',lock);assert.equal(lock.kind,'resolved_product_lock');
    await budget('before_materialization');const installation=await product.installProduct({artifactPath:b.archive.path,targetRoot:b.installHost,verifiedArtifact:verified,resolvedLock:lock});
    await save('installation.json',installation);assert.equal(installation.disposition,'materialized');assert(product.isProductInstallCandidate(installation,lock));assert.equal(installation.artifactDigest,'sha256:'+b.archive.sha256);
    assert.equal(installation.installedRoot,join(b.installHost,'node_modules/@abiogenesis/typescript-tenant'));assert(await product.installedProductContentMatches(installation));
    await save('OWNER_CONTENT_CHECK.json',{status:'EXISTING_PRODUCT_OWNER_CONTENT_MATCHES',installedRoot:installation.installedRoot,artifactDigest:installation.artifactDigest,manifestDigest:installation.manifestDigest,productContentDigest:installation.productContentDigest,contentMatches:true,releaseCut:false,qualified:false});
    summary.status='ISOLATED_RC9_BOOTSTRAP_MATERIALIZED';summary.installedRoot=installation.installedRoot;summary.artifactDigest=installation.artifactDigest;summary.budget=await budget('after_materialization');
  }catch(e){summary.error=String(e?.stack??e);process.exitCode=1;}
  await save('INSTALL_SUMMARY.json',summary);console.log(JSON.stringify(summary));
}else{
  const prep=JSON.parse(await checked(b.preparationManifest));assert.equal(prep.status,'PREPARED_RC9_BOOTSTRAP_UNEXECUTED');for(const p of prep.files)await checked(p);
  for(const p of b.tools){assert.equal(await realpath(p.configuredPath),p.realPath);await checked({path:p.realPath,bytes:p.bytes,sha256:p.sha256});}
  const tool=name=>b.tools.find(p=>p.name===name).configuredPath;assert.equal(await realpath(process.execPath),b.tools.find(p=>p.name==='node').realPath);
  assert.equal(b.bounds.hostMs,600000);assert.equal(b.bounds.packMs,120000);assert.equal(b.bounds.installMs,480000);assert.equal(b.bounds.nodeHeapMiB,8192);
  const built=JSON.parse(await checked(b.completedStage));assert.equal(built.status,'BUILT');assert.equal(built.sourceDigest,frozen.sourceDigest);assert.equal(built.tenant,b.packageRoot);for(const name of ['compile','generate','imports','lifecycle','calculus'])assert(built.results.some(r=>r.id===name&&r.exitCode===0&&!r.timedOut),name);
  const unit=JSON.parse(await checked(b.completedUnit));assert.equal(unit.status,'PASSED');assert.equal(unit.sourceDigest,frozen.sourceDigest);assert.equal(unit.bindingSha256,built.bindingSha256);
  assert.equal(unit.reporterComplete,true);assert.equal(unit.parseFailure,null);assert.equal(unit.summarySuccess,true);assert.equal(unit.resourceFailure,null);assert.deepEqual(unit.missingFiles,[]);
  assert.equal(unit.counts.failed,0);assert.equal(unit.counts.cancelled,0);assert.equal(unit.counts.todo,0);assert(unit.counts.passed>0);assert(unit.requiredCases.length===2&&unit.requiredCases.every(r=>r.passed));
  await checked(b.unitReporter);assert.deepEqual(unit.reporter,b.unitReporter);assert.equal(b.unitCommandReceipt.path,join(dirname(b.completedUnit.path),unit.command.receipt));
  const unitCommand=JSON.parse(await checked(b.unitCommandReceipt));for(const r of [unit.command,unitCommand])assert(r.exitCode===0&&r.signal===null&&!r.failure&&!r.timedOut&&!r.truncated);
  const buildInputs=JSON.parse(await checked(b.buildInputs));assert.equal(buildInputs.sourceWins,true);assert.equal(buildInputs.productRuntimeImportsFromDependencyCheckout,false);
  assert.deepEqual(buildInputs.dependencyInventory,b.dependencyInventory);assert.deepEqual(buildInputs.contractSeedInventory,b.contractSeedInventory);await checked(b.dependencyInventory);await checked(b.contractSeedInventory);
  assert(Array.isArray(b.counterSourcePins)&&b.counterSourcePins.length===4);for(const p of b.counterSourcePins){const row=frozen.rows.find(r=>r.path===p.relativePath);assert(row);assert.equal(row.bytes,p.bytes);assert.equal(row.sha256,p.sha256);await checked({path:join(frozen.source,p.relativePath),bytes:p.bytes,sha256:p.sha256});}
  const afterTemplate=JSON.parse(await checked(b.afterBindingsTemplate));assert.deepEqual(afterTemplate.subject,b.sourceIdentity);assert(Array.isArray(afterTemplate.additionalCounterSources));
  assert.equal(afterTemplate.packageRoot,b.packageRoot);for(const p of afterTemplate.helperPins)await checked({path:join(b.packageRoot,p.relativePath),bytes:p.bytes,sha256:p.sha256});
  const sourceEqual=async()=>{for(const r of frozen.rows){relative(r.path);await checked({path:join(frozen.source,r.path),bytes:r.bytes,sha256:r.sha256});if(r.path.startsWith(T+'/code/')||r.path.startsWith(T+'/scripts/')||[T+'/package.json',T+'/package-lock.json',T+'/tsconfig.json'].includes(r.path))await checked({path:join(dirname(b.sourceIdentity.sourceFreeze.path),'work',r.path),bytes:r.bytes,sha256:r.sha256});}await checked(b.stageManifest);};
  await sourceEqual();for(const p of [b.outputRoot,b.tempRoot])await absent(p);await budget('before_allocation');
  await mkdir(b.outputRoot,{mode:0o700});await mkdir(join(b.outputRoot,'archive'));await mkdir(b.tempRoot,{mode:0o700});await mkdir(join(b.tempRoot,'tmp'));
  for(const n of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(b.tempRoot,n),'',{flag:'wx'});
  const environment={HOME:'/Users/jim',PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',CI:'1',TMPDIR:join(b.tempRoot,'tmp'),NODE_OPTIONS:'--max-old-space-size=8192',npm_config_userconfig:join(b.tempRoot,'npm-user.npmrc'),npm_config_globalconfig:join(b.tempRoot,'npm-global.npmrc'),npm_config_cache:join(b.tempRoot,'npm-cache'),npm_config_offline:'true',npm_config_ignore_scripts:'true',npm_config_audit:'false',npm_config_fund:'false'};
  const command=commandRecorder(b.outputRoot,{environment,maxOutputBytes:b.bounds.outputBytes}),started=performance.now(),observations=[];
  const success=r=>r.exitCode===0&&r.signal===null&&!r.timedOut&&!r.truncated&&!r.failure;
  const run=async(label,exe,args,cwd,maxMs)=>{observations.push(await budget('before_'+label));const remaining=b.bounds.hostMs-(performance.now()-started);assert(remaining>0,'bootstrap overall timeout');const r=await command(label,exe,args,{cwd,environment,timeoutMs:Math.min(maxMs,remaining)});observations.push(await budget('after_'+label));assert(success(r),'preserved command failure: '+label);return r;};
  const summary={status:'PARTIAL',input:await pin(input),sourceIdentity:b.sourceIdentity,compileExecuted:false,generationExecuted:false,packCount:0,installCount:0,qualified:false,budgetObservations:observations};
  await save('EXECUTION_STARTED.json',{input:await pin(input),sourceIdentity:b.sourceIdentity,stage:b.completedStage,environment,bounds:b.bounds});
  try{
    summary.packCount=1;const packed=await run('pack-once',tool('npm'),['pack','--ignore-scripts','--json','--pack-destination',join(b.outputRoot,'archive')],b.packageRoot,b.bounds.packMs);
    const rows=JSON.parse(packed.stdout);assert.equal(rows.length,1);assert.equal(rows[0].filename,'abiogenesis-typescript-tenant-5.0.0-rc.9.tgz');assert.equal(rows[0].filename,basename(rows[0].filename));const archive=await pin(join(b.outputRoot,'archive',rows[0].filename));summary.archive=archive;await sourceEqual();
    assert.equal(rows[0].name,manifest.packageName);assert.equal(rows[0].version,manifest.packageVersion);assert(Array.isArray(rows[0].files)&&rows[0].files.length>0);
    const members=rows[0].files.map(r=>relative(r.path)).sort();assert.equal(new Set(members).size,members.length);assert.equal(rows[0].entryCount,members.length);
    await save('PACKAGE_LAYOUT.json',{owner:'npm pack --json',members:members.length,dependencies:members.filter(p=>p.startsWith('node_modules/')).length,listSha256:hex(Buffer.from(JSON.stringify(members))),files:rows[0].files,archive,standing:'Actual one-pack member inventory; later broad npm-owned packlist and reproduced archive must match.'});
    await save('INSTALL_INPUTS.json',{...b,archive});const installInput=await pin(join(b.outputRoot,'INSTALL_INPUTS.json'));summary.installCount=1;
    await run('verify-lock-install-once',tool('node'),[self,'--install',installInput.path,installInput.sha256],here,b.bounds.installMs);
    const installation=JSON.parse(await readFile(join(b.outputRoot,'installation.json'),'utf8'));assert.equal(installation.disposition,'materialized');await sourceEqual();
    await save('SOURCE_ARTIFACT_RELATION.json',{kind:'accepted_frozen_overlay_to_exact_rc9_test_artifact',sourceIdentity:b.sourceIdentity,sourceAcceptance:b.sourceAcceptance,completedStage:b.completedStage,packageRoot:b.packageRoot,stageManifest:b.stageManifest,archive,installation:await pin(join(b.outputRoot,'installation.json')),ownerContentCheck:await pin(join(b.outputRoot,'OWNER_CONTENT_CHECK.json')),completedUnit:b.completedUnit,buildInputs:b.buildInputs,packageLayout:await pin(join(b.outputRoot,'PACKAGE_LAYOUT.json')),frozenRowsRechecked:frozen.rows.length,identityEdited:false,releaseCut:false,qualified:false});
    const after=JSON.parse(await checked(b.afterBindingsTemplate));assert.deepEqual(after.subject,b.sourceIdentity);Object.assign(after,{candidateArchive:archive,installRoot:installation.installedRoot,bootstrapInstallHost:b.installHost,installReceipt:await pin(join(b.outputRoot,'installation.json')),cutRecord:null,sourceArtifactRelation:await pin(join(b.outputRoot,'SOURCE_ARTIFACT_RELATION.json'))});
    after.installIdentityPins=await Promise.all(['product-toolchain-manifest.json','build/code/src/product/index.js',...after.additionalCounterSources.map(r=>'build/code/src/'+r.module+'.js')].map(p=>pin(join(installation.installedRoot,p))));
    await save('AFTER_BINDINGS.pre-admission.json',after);summary.status='EXACT_RC9_ARTIFACT_AND_BOOTSTRAP_COMPLETE_AFTER_UNADMITTED';summary.sourceArtifactRelation=await pin(join(b.outputRoot,'SOURCE_ARTIFACT_RELATION.json'));summary.afterBindings=await pin(join(b.outputRoot,'AFTER_BINDINGS.pre-admission.json'));
  }catch(e){summary.error=String(e?.stack??e);process.exitCode=1;}
  await save('BOOTSTRAP_SUMMARY.json',summary);console.log(JSON.stringify(summary));
}
