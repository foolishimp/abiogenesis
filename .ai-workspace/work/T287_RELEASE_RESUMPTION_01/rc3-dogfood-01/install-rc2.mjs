// Prepared owner/operator procedure. Execute only on Root's explicit selection.
// No provider call, native run or release is performed by this installation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {lstat,mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const activation=join(base,'runtime-activation-001');
const artifact='/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.2/abiogenesis-typescript-tenant-5.0.0-rc.2.tgz';
const installHost='/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.2';
const worksite='/Users/jim/src/apps/abiogenesis-rc3-dogfood';
const expected={sourceCommit:'d1e4527dbbc0b9ca1a929122c62ca225184f3341',
 artifactDigest:'sha256:36e02dd927066db2f64d71446334982d65b9b8b4ab1c7666d83d04c530aca528',
 productContentDigest:'sha256:828e886a98f6342c6d9ffff1eeb2aa02739c669af85b482df1eb35ba4820ead8',
 manifestDigest:'sha256:4cbec075adc577e9a7544167ac858e04a4d9340e4c2eb18ccb752128c4da623d',
 productId:'product://abiogenesis/typescript-tenant@5.0.0-rc.2',
 packageName:'@abiogenesis/typescript-tenant',packageVersion:'5.0.0-rc.2'};
const sha=raw=>'sha256:'+createHash('sha256').update(raw).digest('hex');
async function absent(path){try{await lstat(path);throw Error(`existing path: ${path}`)}catch(e){if(e.code!=='ENOENT')throw e;}}
assert.equal(execFileSync('/usr/bin/git',['rev-parse','HEAD'],{cwd:worksite,encoding:'utf8'}).trim(),expected.sourceCommit);
assert.equal(execFileSync('/usr/bin/git',['status','--porcelain=v1','-uno'],{cwd:worksite,encoding:'utf8'}),'','tracked worksite changed');
const bytes=await readFile(artifact);assert.equal(sha(bytes),expected.artifactDigest);assert.equal(bytes.length,10902612);
await absent(activation);await absent(installHost);
const members=execFileSync('/usr/bin/tar',['-tzf',artifact],{encoding:'utf8',maxBuffer:16*1024*1024}).trimEnd().split('\n');
assert(members.every(p=>p.startsWith('package/')&&!p.split('/').includes('..')));
await mkdir(activation);const bootstrap=join(activation,'bootstrap');await mkdir(bootstrap);
execFileSync('/usr/bin/tar',['-xzf',artifact,'-C',bootstrap]);
const pkg=join(bootstrap,'package');const manifest=JSON.parse(await readFile(join(pkg,'product-toolchain-manifest.json'),'utf8'));
const product=await import(pathToFileURL(join(pkg,'build/code/src/product/index.js')));
assert.equal(product.sha256Canonical(manifest),expected.manifestDigest);
for(const key of ['productContentDigest','productId','packageName','packageVersion'])assert.equal(manifest[key],expected[key]);
const save=(name,value)=>writeFile(join(activation,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const verified=await product.verifyProduct({artifactPath:artifact,artifactRef:pathToFileURL(artifact).href,
 expectedArtifactDigest:expected.artifactDigest,expectedProductContentDigest:expected.productContentDigest,
 expectedManifestDigest:expected.manifestDigest,expectedProductId:expected.productId,
 expectedPackageName:expected.packageName,expectedPackageVersion:expected.packageVersion});
await save('verification.json',verified);assert.equal(verified.disposition,'verified',JSON.stringify(verified));
const lock=product.constructResolvedProductLock([verified]);await save('resolved-lock.json',lock);assert.equal(lock.kind,'resolved_product_lock');
const installed=await product.installProduct({artifactPath:artifact,targetRoot:installHost,verifiedArtifact:verified,resolvedLock:lock});
await save('installation.json',installed);assert.equal(installed.disposition,'materialized',JSON.stringify(installed));
assert(product.isProductInstallCandidate(installed,lock));assert(await product.installedProductContentMatches(installed));
const inventory=[];
for(const path of members.filter(x=>!x.endsWith('/')).sort()){
 const rel=path.slice('package/'.length);const original=await readFile(join(pkg,rel));const actual=await readFile(join(installed.installedRoot,rel));
 assert(original.equals(actual),rel);inventory.push({path:rel,bytes:actual.length,digest:sha(actual)});
}
assert.equal(sha(await readFile(artifact)),expected.artifactDigest,'artifact changed');
await save('payload-correspondence.json',{artifactDigest:expected.artifactDigest,installedRoot:installed.installedRoot,members:inventory.length,inventoryDigest:product.sha256Canonical(inventory),inventory});
await save('activation-summary.json',{kind:'local_rc2_development_install',qualification:false,published:false,providerCalls:0,source:expected,installHost,installedRoot:installed.installedRoot,installId:installed.installId,bootstrap,archiveMembers:inventory.length,node:process.version,platform:process.platform,arch:process.arch,limitations:['Product install candidate only; no native run or acceptance','fresh RC2 runtime resources required separately']});
console.log(JSON.stringify({artifactDigest:expected.artifactDigest,installedRoot:installed.installedRoot,installId:installed.installId,members:inventory.length,providerCalls:0,qualification:false}));
