// Bounded successor to install-test-artifact.mjs: the retained verification is
// consumed by the exact archive's own unchanged Product lock/install owners.
import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const hex=b=>createHash('sha256').update(b).digest('hex');
async function checked(r){assert(r?.path&&r?.sha256);const s=await lstat(r.path);assert(s.isFile()&&!s.isSymbolicLink());const b=await readFile(r.path);assert.equal(b.length,r.bytes,r.path);assert.equal(hex(b),r.sha256,r.path);return b;}
async function absent(p){try{await lstat(p);throw Error('preserve partial allocation: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
assert.equal(process.argv.length,4);const raw=await readFile(resolve(process.argv[2]));assert.equal(hex(raw),process.argv[3]);const b=JSON.parse(raw);
assert.equal(b.status,'ROOT_SELECTED_ISOLATED_S4_TEST_ARTIFACT');
const G=resolve(dirname(fileURLToPath(import.meta.url)),'..'),O=join(G,'artifact-install-002');
assert.equal(b.outputRoot,O);assert.equal(b.installHost,join(O,'bootstrap-install'));assert.equal(b.bootstrapPackage,join(O,'bootstrap/package'));
await absent(b.installHost);for(const name of ['resolved-lock.json','installation.json','OWNER_CONTENT_CHECK.json','INSTALL_SUMMARY.json'])await absent(join(O,name));
await checked(b.activation);await checked(b.sourceAcceptance);await checked(b.archive);await checked(b.bootstrapSelection);
const manifestBytes=await checked(b.stageManifest);assert((await readFile(join(b.bootstrapPackage,'product-toolchain-manifest.json'))).equals(manifestBytes));
const manifest=JSON.parse(manifestBytes),verified=JSON.parse(await checked(b.retainedVerification));
const owners=JSON.parse(await checked(b.owners));for(const r of owners.canonicalOperatorOwners)await checked(r);
for(const r of b.candidateOwnerPins)await checked({path:join(b.bootstrapPackage,r.relativePath),bytes:r.bytes,sha256:r.sha256});
const product=await import(pathToFileURL(join(b.bootstrapPackage,'build/code/src/product/index.js')));
const {exclusiveRecord}=await import(pathToFileURL(owners.canonicalOperatorOwners[0].path));const save=(name,value)=>exclusiveRecord(O,name,value);
assert.equal(verified.disposition,'verified');assert.equal(verified.artifactDigest,'sha256:'+b.archive.sha256);assert.equal(verified.artifactByteLength,b.archive.bytes);
for(const k of ['productId','packageName','packageVersion','productContentDigest'])assert.equal(verified[k],manifest[k],k);
assert.equal(verified.manifestDigest,product.sha256Canonical(manifest));
const summary={status:'PARTIAL',startedUtc:new Date().toISOString(),retainedVerification:b.retainedVerification,explicitVerificationCalls:0,productInstallCalled:false,qualified:false};
try{
  const lock=product.constructResolvedProductLock([verified]);await save('resolved-lock.json',lock);assert.equal(lock.kind,'resolved_product_lock');
  await absent(b.installHost);summary.productInstallCalled=true;
  // The public owner reauthenticates current archive bytes when the retained
  // carrier has no same-instance WeakMap custody. Do not bypass that check.
  const installation=await product.installProduct({artifactPath:b.archive.path,targetRoot:b.installHost,verifiedArtifact:verified,resolvedLock:lock});
  await save('installation.json',installation);assert.equal(installation.disposition,'materialized');assert(product.isProductInstallCandidate(installation,lock));
  const contentMatches=await product.installedProductContentMatches(installation);assert(contentMatches);
  await save('OWNER_CONTENT_CHECK.json',{status:'EXISTING_PRODUCT_OWNER_CONTENT_MATCHES',installedRoot:installation.installedRoot,artifactDigest:installation.artifactDigest,manifestDigest:installation.manifestDigest,productContentDigest:installation.productContentDigest,contentMatches,owner:{path:join(b.bootstrapPackage,'build/code/src/product/index.js'),...b.candidateOwnerPins.find(x=>x.relativePath==='build/code/src/product/index.js')},releaseCut:false,qualified:false});
  summary.status='ISOLATED_BOOTSTRAP_MATERIALIZED';summary.installedRoot=installation.installedRoot;summary.artifactDigest=installation.artifactDigest;summary.contentMatches=contentMatches;
}catch(e){summary.error=String(e);process.exitCode=1;}
summary.endedUtc=new Date().toISOString();await save('INSTALL_SUMMARY.json',summary);console.log(JSON.stringify(summary));
