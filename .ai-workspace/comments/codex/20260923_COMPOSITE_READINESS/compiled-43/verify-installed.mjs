import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const D=import.meta.dirname,read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const inputs=read(join(D,'build-inputs.json')),generated=read(join(D,'generated-delta.json'));
const save=(n,v)=>fs.writeFileSync(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const identity=read(join(D,'package-identity.json')),pkg=read(join(identity.packageRoot,'package.json'));
const load=name=>import(pathToFileURL(join(identity.packageRoot,pkg.exports['./'+name].import)).href);
const [product,abg,publicApi]=await Promise.all(['product','abg','public'].map(load));
const manifest=read(join(identity.packageRoot,'product-toolchain-manifest.json'));
const request={artifactPath:identity.artifactPath,artifactRef:pathToFileURL(identity.artifactPath).href,
 expectedArtifactDigest:identity.artifactDigest,expectedProductContentDigest:manifest.productContentDigest,
 expectedManifestDigest:product.sha256Canonical(manifest),expectedProductId:manifest.productId,
 expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion};
const packet={kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request};
save('product-verification-request.json',packet);
const start=performance.now(),verification=await product.ProductVerificationPort.verify(packet);
save('product-verification-timing.json',{elapsedMs:performance.now()-start,kind:verification.kind,memory:process.memoryUsage()});
if(verification.kind!=='product_verification_success'){save('product-verification-failure.json',verification);throw Error(verification.kind);}
const v=verification.verifiedArtifact;assert.strictEqual(product.selectOwnedProductVerification(request,v),v);
assert.equal(typeof abg.WITNESS_DEFINITION_BINDINGS.admit['run-stopped'],'function');
assert.deepEqual(Object.keys(abg.WITNESS_DEFINITION_BINDINGS.admit),['reprice','run-stopped']);
assert.ok(publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.some(d=>d.definitionKey.operationId==='abg.operation.witness.admit'&&d.definitionKey.memberKey==='run-stopped'));
const selected={packageRoot:identity.packageRoot,artifactPath:identity.artifactPath,artifactRef:request.artifactRef,basis:{artifactDigest:v.artifactDigest,productContentDigest:v.productContentDigest,manifestDigest:v.manifestDigest,productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion}};
save('selected-core.json',selected);
save('product-verification-summary.json',{kind:verification.kind,coordinates:verification.coordinates,verificationRef:v.verificationRef,verificationDigest:v.verificationDigest,basis:selected.basis,contributionManifestDigest:v.contributionManifestDigest,catalogDigest:v.catalogDigest,publicationBindings:v.contributionManifest.publicationBindings,stopExport:true,limit:'Actual installed verification and binding export; this retained summary is not nominal authority or installed stop execution.'});
save('package-readiness.json',{status:'CLOSED_PACKAGE_NATIVE_QUALIFICATION_DISTINCT',identity,selected,sourceSubjects:read(join(D,'accepted-source.json')).sourceSubjects,sourceReturns:read(join(D,'accepted-source.json')).sourceReturns,buildInputsPreserved:inputs.length,generatedChanged:generated.length,memberCorrespondence:identity.archiveMembers,testsReused:'Combined Evidence context/recovery emission and focused checks reused; no duplicate compile or test run',nativeExecution:false});
console.log(JSON.stringify(selected));
