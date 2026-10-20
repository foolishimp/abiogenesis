import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const work='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const candidate=work+'/candidate-16', packaged=candidate+'/scratch/successor/package';
const product=await import(pathToFileURL(packaged+'/build/code/src/product/index.js').href);
const manifest=JSON.parse(await readFile(packaged+'/product-toolchain-manifest.json','utf8'));
const oldManifest=JSON.parse(await readFile(work+'/candidate-15/scratch/successor/package/product-toolchain-manifest.json','utf8'));
const comparison=JSON.parse(await readFile(candidate+'/member-delta.json','utf8'));
const declarationPath='build/code/src/shared/canonical_json.d.ts';
const declarationDigest=product.sha256Bytes(await readFile(packaged+'/'+declarationPath));
const oldDeclarationDigest=product.sha256Bytes(await readFile(work+'/candidate-15/scratch/successor/package/'+declarationPath));
assert.equal(declarationDigest,'sha256:a0fc03f5f9b034de297ff7511955f018f97df9a1dcc8ca11d53ef03000c3ffcf');
assert.equal(oldDeclarationDigest,'sha256:ed0e12fb3f654cd0d6a55f72c47d40d4241550d72f42f86976a84ba8a88ba7d2');
const counts={catalogDigest:0,declarationDigests:0,contractDigests:0};
for(const row of comparison.catalogDifferences){
  let current=manifest.publicContractCatalog,previous=oldManifest.publicContractCatalog;
  for(const key of row.path){current=current[key];previous=previous[key];}
  assert.equal(current,row.after);assert.equal(previous,row.before);
  if(row.path.length===1){
    assert.equal(current,product.productPublicContractCatalogDigest(manifest.publicContractCatalog));
    assert.equal(previous,product.productPublicContractCatalogDigest(oldManifest.publicContractCatalog));counts.catalogDigest++;
  }else if(row.path.length===6){
    assert.equal(current,declarationDigest);assert.equal(previous,oldDeclarationDigest);counts.declarationDigests++;
  }else{
    const index=row.path[1];
    assert.equal(current,product.sha256Canonical(manifest.publicContractCatalog.rows[index].nativeTypedLocator.declarationInventory));
    assert.equal(previous,product.sha256Canonical(oldManifest.publicContractCatalog.rows[index].nativeTypedLocator.declarationInventory));counts.contractDigests++;
  }
}
assert.deepEqual(counts,{catalogDigest:1,declarationDigests:50,contractDigests:23});
assert.equal(manifest.publicContractCatalog.rows.length,75);
assert.equal(manifest.contributionManifest.publicationBindings.length,10);
assert.equal(manifest.contributionManifest.rows.length,47);
await writeFile(candidate+'/catalog-owner-derivation.json',JSON.stringify({counts,declarationPath,declarationDigest,oldDeclarationDigest,ownerRoutes:{declaration:'product.sha256Bytes',contract:'generate-product-manifest.mjs nativeContractDigest/product.sha256Canonical(declarationInventory)',catalog:'product.productPublicContractCatalogDigest'},allBeforeAndAfterRecomputed:true,noOtherPublicCatalogFieldDifference:true,noArbitraryDigestOmission:true},null,2)+'\n',{flag:'wx'});
const archive=JSON.parse(await readFile(candidate+'/archive.json','utf8'));
const request={artifactPath:archive.archive.path,artifactRef:'abiogenesis-typescript-tenant-5.0.0-rc.1.tgz',expectedArtifactDigest:'sha256:'+archive.archive.sha256,expectedProductContentDigest:manifest.productContentDigest,expectedManifestDigest:product.sha256Canonical(manifest),expectedProductId:manifest.productId,expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion};
const startedAt=new Date().toISOString(),clock=performance.now();
const result=await product.verifyProduct(request);
const wallMs=performance.now()-clock;
const projection=Object.fromEntries(['kind','disposition','artifactDigest','productContentDigest','manifestDigest','catalogDigest','contributionManifestDigest','checkedPayloadFiles'].filter(key=>result[key]!==undefined).map(key=>[key,result[key]]));
await writeFile(candidate+'/owner-verification.json',JSON.stringify({request,projection,startedAt,finishedAt:new Date().toISOString(),wallMs,sourceBlindPackagedOwner:true,noInstallOrRun:true},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({projection,wallMs}));
assert.equal(result.kind,'verified_product_artifact');assert.equal(result.disposition,'verified');assert.equal(result.checkedPayloadFiles,5263);
