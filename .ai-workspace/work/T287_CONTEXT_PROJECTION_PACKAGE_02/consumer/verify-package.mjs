import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as product from '@abiogenesis/typescript-tenant/product';
const root=resolve(process.env.ABI5_PUBLIC_PREPARATION_PACKAGE_ROOT),work=resolve(root,'../../../..');
const selected=JSON.parse(await readFile(join(work,'package-correspondence.json'),'utf8'));
const manifest=JSON.parse(await readFile(join(root,'product-toolchain-manifest.json'),'utf8'));
const request={artifactPath:selected.archive.path,artifactRef:pathToFileURL(selected.archive.path).href,
 expectedArtifactDigest:'sha256:'+selected.archive.sha256,expectedProductContentDigest:manifest.productContentDigest,
 expectedManifestDigest:product.sha256Canonical(manifest),expectedProductId:manifest.productId,
 expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion};
const result=await product.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion:'5.0.0',
 memberKey:'verify',targetKind:'packed_artifact',request});
if(result.kind!=='product_verification_success')
 await writeFile(join(work,'verification-refusal.json'),JSON.stringify(result)+'\n',{flag:'wx'});
assert.equal(result.kind,'product_verification_success',result.code);
assert.strictEqual(product.selectOwnedProductVerification(request,result.verifiedArtifact),result.verifiedArtifact);
const v=result.verifiedArtifact;
const observation={status:'owner_verified_private_package',artifact:{ref:v.artifactRef,digest:v.artifactDigest},
 productContentDigest:v.productContentDigest,manifestDigest:v.manifestDigest,catalogDigest:v.catalogDigest,
 capabilityGraphDigest:v.capabilityDefinitionGraph.graphDigest,productId:v.productId,packageVersion:v.packageVersion,
 selectedOwnedVerification:true,runtimeEffects:0,providerEffects:0,currentRSSBytes:process.memoryUsage().rss,
 cumulativePeakRSSBytes:process.resourceUsage().maxRSS*1024};
await writeFile(join(work,'owner-verification.json'),JSON.stringify(observation)+'\n',{flag:'wx'});
console.log(JSON.stringify(observation));
