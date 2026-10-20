import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
const control=JSON.parse(await readFile(new URL('./test-fixture-identity.json',import.meta.url)));
export async function prepareRegisteredSelectionProduct({product,gtl,declarationFactory}){
 const data=JSON.parse(await readFile(join(control.sourceRoot,'build/publication.json')));
 assert.deepEqual(await declarationFactory(gtl),data,'test fixture declarations must remain exact');
 assert.equal(await product.sha256File(control.artifactPath),control.artifactDigest);
 const manifest=JSON.parse(await readFile(join(control.sourceRoot,'product-toolchain-manifest.json')));
 assert.equal(product.sha256Canonical(manifest),control.manifestDigest);
 const {artifactDigest,manifestDigest,productContentDigest,productId,packageName,packageVersion}=control;
 const basis={artifactDigest,manifestDigest,productContentDigest,productId,packageName,packageVersion};
 const program=data.programs[0],start=program.starts.find(s=>s.startRef===program.policies['abg.default_start_ref']);
 return {artifactPath:control.artifactPath,artifactRef:control.artifactPath.split('/').at(-1),basis,sourceRoot:control.sourceRoot,
 ids:{graphFunctionRef:start.graphFunctionRef,moduleRef:data.moduleRef,nodeRef:data.graphFunctions.find(g=>g.name===start.graphFunctionRef).template.startNodeRef,programRef:program.programRef,startRef:start.startRef},
 async loadInstalledPublication({installedRoot,gtl:owner}){const installed=JSON.parse(await readFile(join(installedRoot,'build/publication.json')));
 return owner.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...installed,artifactDigest,productContentDigest,productManifestDigest:manifestDigest,
 contributions:installed.contributions.map(c=>({...c,provenanceRefs:[artifactDigest,manifestDigest]}))});}};
}
