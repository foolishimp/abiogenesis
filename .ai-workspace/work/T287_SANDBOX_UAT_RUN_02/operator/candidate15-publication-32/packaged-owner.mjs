import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const root="/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-15", phase="/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/candidate15-publication-32", predecessor="/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-14";
const packaged=root+'/scratch/successor/package';
const product=await import(pathToFileURL(packaged+'/build/code/src/product/index.js').href);
const manifest=JSON.parse(await readFile(packaged+'/product-toolchain-manifest.json','utf8'));
const oldManifest=JSON.parse(await readFile(predecessor+'/scratch/successor/package/product-toolchain-manifest.json','utf8'));
const differences=JSON.parse(await readFile(phase+'/public-catalog-diff.json','utf8')).diff;
assert.equal(differences.length,69);
const declarationPath='build/code/src/product/default_library.d.ts';
const declaration=await readFile(packaged+'/'+declarationPath);
const declarationDigest=product.sha256Bytes(declaration);
assert.equal(declarationDigest,'sha256:6bee0713052397379bd61816e42e423acaa8abb092df91706b4813d3f0268803');
let inventory=0, contracts=0, catalog=0;
for (const difference of differences) {
  const path=difference.path;
  let actual=manifest.publicContractCatalog, previous=oldManifest.publicContractCatalog;
  for (const segment of path) {actual=actual[segment];previous=previous[segment];}
  assert.equal(actual,difference.after);assert.equal(previous,difference.before);
  if(path.length===1&&path[0]==='catalogDigest') {
    assert.equal(product.productPublicContractCatalogDigest(manifest.publicContractCatalog),actual);
    assert.equal(product.productPublicContractCatalogDigest(oldManifest.publicContractCatalog),previous);
    catalog++;
  } else if(path.length===6&&path[0]==='rows'&&path[2]==='nativeTypedLocator'&&path[3]==='declarationInventory'&&path[5]==='declarationDigest') {
    const row=manifest.publicContractCatalog.rows[path[1]];
    assert.equal(row.nativeTypedLocator.declarationInventory[path[4]].declarationPath,declarationPath);
    assert.equal(actual,declarationDigest);inventory++;
  } else if(path.length===3&&path[0]==='rows'&&path[2]==='contractDigest') {
    const row=manifest.publicContractCatalog.rows[path[1]], oldRow=oldManifest.publicContractCatalog.rows[path[1]];
    assert.equal(actual,product.sha256Canonical(row.nativeTypedLocator.declarationInventory));
    assert.equal(previous,product.sha256Canonical(oldRow.nativeTypedLocator.declarationInventory));contracts++;
  } else throw Error('Unexpected catalog field difference '+JSON.stringify(path));
}
assert.deepEqual({catalog,inventory,contracts},{catalog:1,inventory:47,contracts:21});
await writeFile(root+'/catalog-owner-derivation.json',JSON.stringify({
  differenceSource:phase+'/public-catalog-diff.json',
  exactSupportedChanges:{catalogDigest:catalog,declarationDigests:inventory,contractDigests:contracts},
  all69BeforeAndAfterValuesCorrespond:true,declarationPath,declarationDigest,
  catalogDigest:manifest.publicContractCatalog.catalogDigest,
  ownerRoutes:{catalog:'product.productPublicContractCatalogDigest',declaration:'product.sha256Bytes',contract:'product.sha256Canonical(nativeTypedLocator.declarationInventory), generate-product-manifest.mjs:550-555'},
  callableDeclarationConservation:'Root independently verified the only emitted d.ts delta is a documentation comment; exact69 digest consequences independently confirmed by Source32/Proof32.',
  unexpectedMetadataDifferences:0,noArbitraryDigestStripping:true
},null,2)+'\n',{flag:'wx'});
const request={
 artifactPath:root+'/packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz',
 artifactRef:'abiogenesis-typescript-tenant-5.0.0-rc.1.tgz',
 expectedArtifactDigest:'sha256:1fe497924a215c4215865c36e50230ebf96e81aefc1ba81705ee59150065267d',
 expectedProductContentDigest:manifest.productContentDigest,
 expectedManifestDigest:product.sha256Canonical(manifest),
 expectedProductId:manifest.productId,expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion
};
const startedAt=new Date().toISOString(),clock=performance.now();
const result=await product.verifyProduct(request);
const wallMs=performance.now()-clock,finishedAt=new Date().toISOString();
const projection=Object.fromEntries(['kind','disposition','artifactDigest','productContentDigest','manifestDigest','catalogDigest','contributionManifestDigest','checkedPayloadFiles'].filter(key=>result[key]!==undefined).map(key=>[key,result[key]]));
await writeFile(root+'/owner-verification.json',JSON.stringify({request,projection,startedAt,finishedAt,wallMs,sourceBlindPackagedOwner:true,noInstallOrRun:true},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({projection,wallMs}));
assert.equal(result.kind,'verified_product_artifact');assert.equal(result.disposition,'verified');assert.equal(result.checkedPayloadFiles,5263);

