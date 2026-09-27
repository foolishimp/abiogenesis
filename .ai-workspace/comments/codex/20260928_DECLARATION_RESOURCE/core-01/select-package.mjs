import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
const D=import.meta.dirname,read=async p=>JSON.parse(await readFile(p,'utf8')),identity=await read(join(D,'package-identity.json'));
const pkg=await read(join(identity.packageRoot,'package.json')),entry=pkg.exports['./product'];
const product=await import(pathToFileURL(join(identity.packageRoot,typeof entry==='string'?entry:entry.import)));
const manifest=await read(join(identity.packageRoot,'product-toolchain-manifest.json'));
const basis={artifactDigest:identity.artifactDigest,productContentDigest:manifest.productContentDigest,manifestDigest:product.sha256Canonical(manifest),
 productId:manifest.productId,packageName:manifest.packageName,packageVersion:manifest.packageVersion};
const request={artifactPath:identity.artifactPath,artifactRef:basename(identity.artifactPath),...Object.fromEntries(Object.entries(basis).map(([k,v])=>['expected'+k[0].toUpperCase()+k.slice(1),v]))};
const result=await product.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request});
assert.equal(result.kind,'product_verification_success');
const selected={packageRoot:identity.packageRoot,artifactPath:identity.artifactPath,artifactRef:pathToFileURL(identity.artifactPath).href,basis};
await writeFile(join(D,'selected-core.json'),JSON.stringify(selected,null,2)+'\n',{flag:'wx'});
await writeFile(join(D,'product-verification.json'),JSON.stringify({kind:result.kind,coordinates:result.coordinates},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(selected));
