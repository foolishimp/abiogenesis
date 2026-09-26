import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const D=import.meta.dirname,read=async p=>JSON.parse(await readFile(p,'utf8'));
const identity=await read(join(D,'package-identity.json'));
const product=await import(pathToFileURL(join(identity.packageRoot,'build/code/src/product/index.js')));
const manifest=await read(join(identity.packageRoot,'product-toolchain-manifest.json'));
const request={artifactPath:identity.artifactPath,artifactRef:pathToFileURL(identity.artifactPath).href,
 expectedArtifactDigest:identity.artifactDigest,expectedProductContentDigest:manifest.productContentDigest,
 expectedManifestDigest:product.sha256Canonical(manifest),expectedProductId:manifest.productId,
 expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion};
const start=performance.now();
const result=await product.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request});
const elapsedMs=performance.now()-start;
assert.equal(result.kind,'product_verification_success',JSON.stringify(result.kind==='product_verification_success'?{kind:result.kind}:result));
const v=result.verifiedArtifact;
const selected={packageRoot:identity.packageRoot,artifactPath:identity.artifactPath,artifactRef:request.artifactRef,
 basis:Object.fromEntries(['artifactDigest','productContentDigest','manifestDigest','productId','packageName','packageVersion'].map(k=>[k,v[k]]))};
await writeFile(join(D,'selected-core.json'),JSON.stringify(selected,null,2)+'\n',{flag:'wx'});
await writeFile(join(D,'verification.json'),JSON.stringify({kind:result.kind,elapsedMs,coordinates:result.coordinates,
 scope:'exact private package; installed delivery and release qualification remain separate'},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({kind:result.kind,elapsedMs,selected}));
