// One isolated test-artifact allocation. Existing npm/Product/command owners do all effectful work.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,dirname,resolve,basename} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),hex=b=>createHash('sha256').update(b).digest('hex');
const pin=async path=>{const b=await readFile(path);return {path,bytes:b.length,sha256:hex(b)};};
async function checked(r){assert(r&&typeof r.path==='string'&&/^[a-f0-9]{64}$/.test(r.sha256),'unbound pin');const s=await lstat(r.path);assert(s.isFile()&&!s.isSymbolicLink(),r.path);const b=await readFile(r.path);assert.equal(b.length,r.bytes,r.path);assert.equal(hex(b),r.sha256,r.path);return b;}
async function absent(p){try{await lstat(p);throw Error('preserve existing allocation: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
assert.equal(process.argv.length,4,'usage: node prepare-test-artifact.mjs ROOT_ARTIFACT_BINDINGS.json SHA256');
const input=resolve(process.argv[2]),raw=await readFile(input);assert.equal(hex(raw),process.argv[3]);const b=JSON.parse(raw);
assert.equal(b.status,'ROOT_SELECTED_ISOLATED_S4_TEST_ARTIFACT');
const O=join(here,'artifact-001'),tmp='/private/tmp/abg-r7p';assert.equal(b.outputRoot,O);assert.equal(b.tempRoot,tmp);assert.equal(b.bootstrapInstallHost,join(O,'bootstrap-install'));
// Actual slots are checked before parsing source inventories or importing any Product owner.
for(const p of [O,tmp,join(here,'actual-001'),'/private/tmp/abg-r7m'])await absent(p);
for(const n of ['activation','finalSourceSubject','finalSourceInventory','candidateAcceptance','completedStageReport','productManifest'])await checked(b[n]);
const controls=JSON.parse(await checked(b.controlManifest));for(const p of controls.files)await checked(p);
const owners=JSON.parse(await checked(b.owners));for(const p of [...owners.canonicalOperatorOwners,...owners.builderOwners])await checked(p);
for(const p of owners.toolchainPins){assert.equal(await realpath(p.configuredPath),p.realPath);await checked({...p,path:p.realPath});}
const tool=name=>owners.toolchainPins.find(p=>p.name===name).configuredPath;assert.equal(await realpath(process.execPath),owners.toolchainPins.find(p=>p.name==='node').realPath);
const limits=b.boundsSelectedByRoot;assert(limits,'Root finite bounds unbound');for(const [k,v] of Object.entries(b.proposedBounds))assert(Number.isSafeInteger(limits[k])&&limits[k]>0&&limits[k]<=v,k);assert.equal(limits.nodeHeapMiB,8192);
const stage=JSON.parse(await checked(b.completedStageReport)),inventory=JSON.parse(await checked(b.finalSourceInventory));
assert.equal(stage.mode,'after');assert.equal(stage.sourceCount,451);assert.equal(stage.sourceDigest,b.sourceDigest);assert.equal(inventory.files.length,451);
for(const p of ['compile','generate','lifecycle'])assert(stage[p]?.exitCode===0&&stage[p].signal===null&&stage[p].error===null,'completed original '+p+' receipt required');
assert.equal(resolve(b.packageRoot),join(resolve(stage.stage),'build_tenants/abiogenesis/typescript'));assert.equal(b.productManifest.path,join(b.packageRoot,'product-toolchain-manifest.json'));
const selected=new Map(inventory.files.map(r=>[r.relativePath,r]));assert.equal(selected.size,451);assert.equal(stage.sources.length,451);
assert.equal(hex(Buffer.from(JSON.stringify(stage.sources))),stage.sourceDigest,'stage source digest');
for(const r of stage.sources){const s=selected.get(r.path);assert(s&&s.bytes===r.bytes&&s.sha256===r.sha256,r.path);}
async function sourceEqual(){for(const r of stage.sources)await checked({path:join(stage.stage,r.path),bytes:r.bytes,sha256:r.sha256});await checked(b.productManifest);}
await sourceEqual();
const prep=JSON.parse(await checked(owners.measurementPreparation));for(const p of prep.files)await checked(p);
const refs=JSON.parse(await checked(owners.fixtureOwners));assert(Array.isArray(b.helperPins));assert.deepEqual(b.helperPins.map(r=>r.relativePath).sort(),[...refs.helperRelativePaths].sort());
for(const r of b.helperPins){const s=selected.get('build_tenants/abiogenesis/typescript/'+r.relativePath);assert(s&&s.bytes===r.bytes&&s.sha256===r.sha256,r.relativePath);await checked({path:join(b.packageRoot,r.relativePath),bytes:r.bytes,sha256:r.sha256});}
const manifest=JSON.parse(await checked(b.productManifest)),pkg=JSON.parse(await readFile(join(b.packageRoot,'package.json'),'utf8'));assert.equal(pkg.name,manifest.packageName);assert.equal(pkg.version,manifest.packageVersion);assert.equal(pkg.name,'@abiogenesis/typescript-tenant');
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(owners.canonicalOperatorOwners[0].path));
await mkdir(O,{mode:0o700});await mkdir(join(O,'archive'));await mkdir(tmp,{mode:0o700});await mkdir(join(tmp,'tmp'));
for(const n of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(tmp,n),'',{flag:'wx'});
const environment={HOME:'/Users/jim',PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',CI:'1',TMPDIR:join(tmp,'tmp'),NODE_OPTIONS:'--max-old-space-size=8192',NPM_CONFIG_USERCONFIG:join(tmp,'npm-user.npmrc'),NPM_CONFIG_GLOBALCONFIG:join(tmp,'npm-global.npmrc'),NPM_CONFIG_CACHE:join(tmp,'npm-cache'),NPM_CONFIG_OFFLINE:'true',NPM_CONFIG_IGNORE_SCRIPTS:'true',NPM_CONFIG_AUDIT:'false',NPM_CONFIG_FUND:'false',NPM_CONFIG_UPDATE_NOTIFIER:'false'};
const save=(name,value)=>exclusiveRecord(O,name,value),command=commandRecorder(O,{environment,maxOutputBytes:limits.outputBytes});
const success=r=>r.exitCode===0&&r.signal===null&&!r.timedOut&&!r.truncated&&!r.failure;
const summary={status:'PARTIAL',startedUtc:new Date().toISOString(),source:b.finalSourceSubject,reusedBuild:b.completedStageReport,compileExecuted:false,generationExecuted:false,lifecycleExecuted:false,packCount:0,bootstrapInstallCount:0,qualified:false};
await save('EXECUTION_STARTED.json',{input:await pin(input),environment,bounds:limits,reusedStageReport:b.completedStageReport});
try{
  summary.packCount=1;
  const packed=await command('pack-once',tool('npm'),['pack','--ignore-scripts','--json','--pack-destination',join(O,'archive')],{cwd:b.packageRoot,environment,timeoutMs:limits.packMs});
  assert(success(packed),'pack failed; preserve receipt, no retry');const rows=JSON.parse(packed.stdout);assert.equal(rows.length,1);const filename=rows[0].filename;assert.equal(filename,basename(filename));assert(filename.endsWith('.tgz'));
  const archive=await pin(join(O,'archive',filename));summary.archive=archive;await sourceEqual();
  const installInput={status:'ROOT_SELECTED_ISOLATED_S4_TEST_ARTIFACT',activation:b.activation,owners:b.owners,archive,stageManifest:b.productManifest,outputRoot:O,installHost:b.bootstrapInstallHost,sourceAcceptance:b.candidateAcceptance};
  await save('INSTALL_INPUTS.json',installInput);const installPin=await pin(join(O,'INSTALL_INPUTS.json'));summary.bootstrapInstallCount=1;
  const installed=await command('verify-install-once',tool('node'),[join(here,'install-test-artifact.mjs'),installPin.path,installPin.sha256],{cwd:here,environment,timeoutMs:limits.installMs});
  assert(success(installed),'Product verification/installation failed; preserve original receipt, no retry');
  const receipt=JSON.parse(await readFile(join(O,'installation.json'),'utf8'));assert.equal(receipt.disposition,'materialized');assert.equal(receipt.installedRoot,join(b.bootstrapInstallHost,'node_modules/@abiogenesis/typescript-tenant'));assert.equal(receipt.artifactDigest,'sha256:'+archive.sha256);await sourceEqual();
  await save('SOURCE_ARTIFACT_RELATION.json',{kind:'accepted_stage_to_isolated_test_artifact',sourceSubject:b.finalSourceSubject,sourceInventory:b.finalSourceInventory,sourceAcceptance:b.candidateAcceptance,sourceDigest:b.sourceDigest,packageRoot:b.packageRoot,sourceRowsEqualBeforeAfter:451,originalCompletedBuild:b.completedStageReport,reusedCompile:{pointer:'/compile',executed:false},reusedGeneration:{pointer:'/generate',executed:false},reusedLifecycle:{pointer:'/lifecycle',executed:false},stageManifest:b.productManifest,archive,verification:await pin(join(O,'verification.json')),resolvedLock:await pin(join(O,'resolved-lock.json')),installation:await pin(join(O,'installation.json')),ownerContentCheck:await pin(join(O,'OWNER_CONTENT_CHECK.json')),declaredPackageVersion:manifest.packageVersion,identityEdited:false,releaseCut:false,selectorChanged:false,qualified:false});
  const measurement=JSON.parse(await checked(owners.measurementBindingsTemplate));Object.assign(measurement,{preparationManifest:owners.measurementPreparation,finalSourceSubject:b.finalSourceSubject,finalSourceInventory:b.finalSourceInventory,sourceArtifactRelation:await pin(join(O,'SOURCE_ARTIFACT_RELATION.json')),candidateArchive:archive,bootstrapInstallHost:b.bootstrapInstallHost,bootstrapInstallReceipt:await pin(join(O,'installation.json')),packageRoot:b.packageRoot,helperPins:b.helperPins,candidateAcceptance:b.candidateAcceptance});
  // Existing measurement template remains unadmitted; Root selects its actual activation/bounds next.
  await save('MEASUREMENT_BINDINGS.pre-admission.json',measurement);summary.status='ISOLATED_TEST_ARTIFACT_AND_BOOTSTRAP_COMPLETE_MEASUREMENT_UNADMITTED';summary.sourceArtifactRelation=await pin(join(O,'SOURCE_ARTIFACT_RELATION.json'));summary.measurementBindings=await pin(join(O,'MEASUREMENT_BINDINGS.pre-admission.json'));
}catch(e){summary.error=String(e);process.exitCode=1;}
summary.endedUtc=new Date().toISOString();await save('SUMMARY.json',summary);console.log(JSON.stringify(summary));
