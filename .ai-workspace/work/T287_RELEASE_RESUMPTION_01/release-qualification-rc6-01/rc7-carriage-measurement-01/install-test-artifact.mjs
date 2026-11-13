// Thin operator invocation of existing immutable Product verification/lock/install owners.
import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const hex=b=>createHash('sha256').update(b).digest('hex');
async function checked(r){assert(r?.path&&r?.sha256);const s=await lstat(r.path);assert(s.isFile()&&!s.isSymbolicLink());const b=await readFile(r.path);assert.equal(b.length,r.bytes);assert.equal(hex(b),r.sha256);return b;}
async function absent(p){try{await lstat(p);throw Error('preserve partial install: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
assert.equal(process.argv.length,4);const raw=await readFile(resolve(process.argv[2]));assert.equal(hex(raw),process.argv[3]);const b=JSON.parse(raw);assert.equal(b.status,'ROOT_SELECTED_ISOLATED_S4_TEST_ARTIFACT');
const expectedRoot=fileURLToPath(new URL('./artifact-001',import.meta.url));assert.equal(b.outputRoot,expectedRoot);assert.equal(b.installHost,join(expectedRoot,'bootstrap-install'));
await absent(b.installHost);for(const name of ['verification.json','resolved-lock.json','installation.json','OWNER_CONTENT_CHECK.json'])await absent(join(b.outputRoot,name));
await checked(b.activation);await checked(b.sourceAcceptance);await checked(b.archive);const manifest=JSON.parse(await checked(b.stageManifest));const owners=JSON.parse(await checked(b.owners));
for(const r of [...owners.builderOwners,...owners.canonicalOperatorOwners])await checked(r);
const product=await import(pathToFileURL(join(owners.builderRoot,'build/code/src/product/index.js')));const {exclusiveRecord}=await import(pathToFileURL(owners.canonicalOperatorOwners[0].path));const save=(name,value)=>exclusiveRecord(b.outputRoot,name,value);
const verified=await product.verifyProduct({artifactPath:b.archive.path,artifactRef:pathToFileURL(b.archive.path).href,expectedArtifactDigest:'sha256:'+b.archive.sha256,expectedProductContentDigest:manifest.productContentDigest,expectedManifestDigest:product.sha256Canonical(manifest),expectedProductId:manifest.productId,expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion});
await save('verification.json',verified);assert.equal(verified.disposition,'verified','Product verification refused');
const lock=product.constructResolvedProductLock([verified]);await save('resolved-lock.json',lock);assert.equal(lock.kind,'resolved_product_lock');
await absent(b.installHost);const installation=await product.installProduct({artifactPath:b.archive.path,targetRoot:b.installHost,verifiedArtifact:verified,resolvedLock:lock});
await save('installation.json',installation);assert.equal(installation.disposition,'materialized');assert(product.isProductInstallCandidate(installation,lock));const contentMatches=await product.installedProductContentMatches(installation);assert(contentMatches);
await save('OWNER_CONTENT_CHECK.json',{status:'EXISTING_PRODUCT_OWNER_CONTENT_MATCHES',installedRoot:installation.installedRoot,artifactDigest:installation.artifactDigest,manifestDigest:installation.manifestDigest,productContentDigest:installation.productContentDigest,contentMatches,owner:owners.builderOwners[0],releaseCut:false,qualified:false});
console.log(JSON.stringify({status:'ISOLATED_BOOTSTRAP_MATERIALIZED',installedRoot:installation.installedRoot,artifactDigest:installation.artifactDigest,contentMatches,qualified:false}));
