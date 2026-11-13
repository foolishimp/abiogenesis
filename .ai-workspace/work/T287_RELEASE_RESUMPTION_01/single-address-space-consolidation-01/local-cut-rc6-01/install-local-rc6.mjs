// Root-operated exact local candidate allocation/install. No rebuild, Run, provider or publication.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {copyFile,lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const dir='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/local-cut-rc6-01';
const hex=b=>createHash('sha256').update(b).digest('hex');
async function checked(row){assert((await lstat(row.path)).isFile(),row.path);const b=await readFile(row.path);assert.equal(b.length,row.bytes,row.path);assert.equal(hex(b),row.sha256,row.path);return b;}
async function absent(path){try{await lstat(path);throw Error('no-clobber collision: '+path);}catch(e){if(e.code!=='ENOENT')throw e;}}
assert.equal(process.argv.length,3,'usage: node install-local-rc6.mjs INPUT_MANIFEST_SHA256_HEX');
const raw=await readFile(join(dir,'INPUT_MANIFEST.json'));assert.equal(hex(raw),process.argv[2]);const m=JSON.parse(raw);
assert.equal(m.status,'ROOT_SELECTED_LOCAL_CANDIDATE_INSTALL_ONLY');
for(const row of m.files)await checked(row);
for(const row of m.tools){assert.equal(await realpath(row.configuredPath),row.realPath);await checked({...row,path:row.realPath});}
assert.equal(await realpath(process.execPath),m.tools.find(t=>t.name==='node').realPath);
// The unchanged Product owner invokes `npm` and tar through PATH; select the pinned tools.
assert.equal(m.installPath,'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin');
process.env.PATH=m.installPath;
const e=m.expected;assert.equal(e.packageVersion,'5.0.0-rc.6');assert.equal(e.productId,'product://abiogenesis/typescript-tenant@5.0.0-rc.6');for(const k of ['artifactDigest','manifestDigest','productContentDigest'])assert.match(e[k],/^sha256:[0-9a-f]{64}$/u);assert.match(e.sourceCommit,/^[0-9a-f]{40}$/u);assert.match(m.sourceTree,/^[0-9a-f]{40}$/u);assert(Number.isSafeInteger(m.archiveMembers)&&m.archiveMembers>0);const archive=await checked(m.archive);
assert.equal(execFileSync('/usr/bin/git',['-C',m.worksiteRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),e.sourceCommit);
for(const args of [['diff','--quiet'],['diff','--cached','--quiet']])execFileSync('/usr/bin/git',['-C',m.worksiteRoot,...args]);
await absent(m.releaseRoot);await absent(m.installHost);
const members=execFileSync('/usr/bin/tar',['-tzf',m.archive.path],{encoding:'utf8',maxBuffer:16*1024*1024}).trimEnd().split('\n');
assert.equal(members.length,m.archiveMembers);assert.equal(new Set(members).size,members.length);
assert(members.every(p=>p.startsWith('package/')&&!p.endsWith('/')&&!p.split('/').includes('..')),'unsafe archive member');

// Effects start only after the exact packet/tools/source/archive and both absences pass.
await mkdir(m.releaseRoot,{mode:0o700});
const save=(name,value)=>writeFile(join(m.releaseRoot,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const retainedArchive=join(m.releaseRoot,'abiogenesis-typescript-tenant-5.0.0-rc.6.tgz');
await writeFile(retainedArchive,archive,{flag:'wx'});assert((await readFile(retainedArchive)).equals(archive));
for(const name of ['BOUNDED_CANDIDATE_CLAIM.md','SOURCE_ARTIFACT_EVIDENCE_MAP.json','ROOT_AUTHORITY.md','RESIDUALS.md','INPUT_MANIFEST.json'])
  await copyFile(join(dir,name),join(m.releaseRoot,name),constants.COPYFILE_EXCL);
const bootstrap=join(m.releaseRoot,'bootstrap');await mkdir(bootstrap,{mode:0o700});
execFileSync('/usr/bin/tar',['-xzf',retainedArchive,'-C',bootstrap]);
const pkg=join(bootstrap,'package');
const manifest=JSON.parse(await readFile(join(pkg,'product-toolchain-manifest.json'),'utf8'));
// Only the externally authenticated exact selected archive is imported.
const product=await import(pathToFileURL(join(pkg,'build/code/src/product/index.js')).href);
assert.equal(product.sha256Canonical(manifest),e.manifestDigest);
for(const key of ['productContentDigest','productId','packageName','packageVersion'])assert.equal(manifest[key],e[key]);
const verified=await product.verifyProduct({artifactPath:retainedArchive,artifactRef:pathToFileURL(retainedArchive).href,
  expectedArtifactDigest:e.artifactDigest,expectedProductContentDigest:e.productContentDigest,
  expectedManifestDigest:e.manifestDigest,expectedProductId:e.productId,
  expectedPackageName:e.packageName,expectedPackageVersion:e.packageVersion});
await save('verification.json',verified);assert.equal(verified.disposition,'verified',JSON.stringify(verified));
const lock=product.constructResolvedProductLock([verified]);await save('resolved-lock.json',lock);assert.equal(lock.kind,'resolved_product_lock');
await absent(m.installHost);
const installed=await product.installProduct({artifactPath:retainedArchive,targetRoot:m.installHost,verifiedArtifact:verified,resolvedLock:lock});
await save('installation.json',installed);assert.equal(installed.disposition,'materialized',JSON.stringify(installed));
assert(product.isProductInstallCandidate(installed,lock));assert(await product.installedProductContentMatches(installed));
const inventory=[];
for(const path of [...members].sort()){
  const relativePath=path.slice('package/'.length),original=await readFile(join(pkg,relativePath)),actual=await readFile(join(installed.installedRoot,relativePath));
  assert(original.equals(actual),relativePath);inventory.push({path:relativePath,bytes:actual.length,digest:'sha256:'+hex(actual)});
}
assert.equal(inventory.length,m.archiveMembers);assert.equal(hex(await readFile(retainedArchive)),m.archive.sha256);
await save('payload-correspondence.json',{artifactDigest:e.artifactDigest,installedRoot:installed.installedRoot,
  members:inventory.length,inventoryDigest:product.sha256Canonical(inventory),inventory});
await save('LOCAL_CUT_RECORD.json',{kind:'local_unqualified_development_candidate',status:'local_cut_and_owner_install_completed',
  source:e,sourceTree:m.sourceTree,archive:retainedArchive,installHost:m.installHost,installedRoot:installed.installedRoot,
  installId:installed.installId,members:inventory.length,selectedInputManifestSha256:hex(raw),
  published:false,qualified:false,providerCalls:0,nativeRuns:0,tagsCreated:false,selectorChanged:false,
  claim:m.claim,
  limits:m.limits,
  installedCli:join(installed.installedRoot,'build/code/src/public/cli.js')});
const checksums=[];
for(const name of ['abiogenesis-typescript-tenant-5.0.0-rc.6.tgz','BOUNDED_CANDIDATE_CLAIM.md','SOURCE_ARTIFACT_EVIDENCE_MAP.json',
  'ROOT_AUTHORITY.md','RESIDUALS.md','INPUT_MANIFEST.json','verification.json','resolved-lock.json','installation.json',
  'payload-correspondence.json','LOCAL_CUT_RECORD.json'])checksums.push(hex(await readFile(join(m.releaseRoot,name)))+'  '+name);
await writeFile(join(m.releaseRoot,'SHA256SUMS'),checksums.join('\n')+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'local_cut_and_owner_install_completed',sourceCommit:e.sourceCommit,artifactDigest:e.artifactDigest,
  releaseRoot:m.releaseRoot,installedRoot:installed.installedRoot,members:inventory.length,published:false,qualified:false,providerCalls:0}));
