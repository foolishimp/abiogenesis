import assert from 'node:assert/strict';
import {isAbsolute} from 'node:path';

/** Caller correspondence only; canonical owners still validate and admit resources. */
export function assertPackedResourceCorrespondence(item,request,packed) {
 const v=item.verified;
 assert.equal(request.targetKind,'packed_artifact');
 assert.deepEqual(Object.keys(packed).sort(),['artifact','artifactPath','contributionManifest','descriptor','kind','manifestDigest','packageName','packageVersion','productContent','productId','schemaVersion']);
 assert.equal(packed.kind,'product_verification_artifact_resource');
 assert.equal(packed.schemaVersion,'5.0.0');
 assert.equal(typeof packed.artifactPath,'string');assert(isAbsolute(packed.artifactPath));
 assert.equal(packed.artifactPath,item.request.artifactPath);
 for(const field of ['artifact','productContent','descriptor','contributionManifest'])assert.deepEqual(packed[field],request[field]);
 assert.deepEqual(packed.artifact,{ref:v.artifactRef,digest:v.artifactDigest});
 assert.equal(packed.productContent.digest,v.productContentDigest);
 assert.deepEqual(packed.descriptor,item.verification.coordinates.descriptor);
 assert.deepEqual(packed.contributionManifest,{ref:v.contributionManifestRef,digest:v.contributionManifestDigest});
 for(const field of ['manifestDigest','productId','packageName','packageVersion'])assert.equal(packed[field],v[field]);
 assert.deepEqual(request.declaredDependencies,v.declaredDependencies);
 assert.deepEqual(request.compatibilityInputs,v.compatibilityRefs.map(compatibilityRef=>({compatibilityRef,subjectRef:packed.productContent.ref})));
 return packed;
}

export function recordedPackedResource(item,request) {
 const v=item.verified;
 const packed={kind:'product_verification_artifact_resource',schemaVersion:'5.0.0',artifactPath:item.request.artifactPath,
  artifact:request.artifact,productContent:request.productContent,descriptor:request.descriptor,contributionManifest:request.contributionManifest,
  manifestDigest:v.manifestDigest,productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion};
 return assertPackedResourceCorrespondence(item,request,packed);
}
