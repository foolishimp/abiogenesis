import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,lstat,realpath,access} from 'node:fs/promises';
import {join,dirname,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {prepareConsumer} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/consumer.mjs';
import {verifyArtifact} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';

export async function proveConsumer({runtime,native,inputs,hostPhase,command}) {
 const p=runtime.product,g=runtime.gtl,root=join(dirname(hostPhase),'consumer-proof');
 const oldRoot='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/framework-dependency-lock-successor-209/consumer-proof/consumer-source';
 const record=async(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
 const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 const stamp=()=>({at:new Date().toISOString(),...process.memoryUsage()});
 const start=performance.now();
 const fixture=await prepareConsumer({root,product:p,gtl:g,verified:native.verified,archivePath:inputs.archive.path,npm:'/opt/homebrew/bin/npm',recursionBound:1000,command});
 await record('consumer.json',fixture);
 console.log(JSON.stringify({stage:'consumer31-packed',wallMs:performance.now()-start,artifactPath:fixture.artifactPath,...stamp()}));
 const sourceRoot=join(root,'consumer-source'),oldPackage=JSON.parse(await readFile(join(oldRoot,'package.json'),'utf8')),newPackage=JSON.parse(await readFile(join(sourceRoot,'package.json'),'utf8'));
 assert.equal(newPackage.dependencies['@abiogenesis/typescript-tenant'],'file:'+inputs.archive.path);
 assert.deepEqual({...newPackage,dependencies:oldPackage.dependencies},oldPackage,'only immutable managed dependency locator succeeds the original package source');
 const preserved=[];
 for(const path of ['build/publication.json','build/semantics.mjs','contracts/assessment.schema.json','contracts/public-contract-catalog.schema.json','contracts/capabilities/capability-definition-graph.json']) {
  const before=await readFile(join(oldRoot,path)),after=await readFile(join(sourceRoot,path));assert.equal(after.equals(before),true,path);
  preserved.push({path,sha256:hash(after),byteCount:after.length,originalByteEqual:true});
 }
 const oldData=JSON.parse(await readFile(join(oldRoot,'build/publication.json'),'utf8'));
 const oldDeclaration=g.modulePublication({...oldData,artifactDigest:fixture.basis.artifactDigest,productContentDigest:fixture.basis.productContentDigest,productManifestDigest:fixture.basis.manifestDigest,contributions:oldData.contributions.map(row=>({...row,provenanceRefs:[fixture.basis.artifactDigest,fixture.basis.manifestDigest]}))});
 assert.deepEqual(fixture.publication.programs,oldDeclaration.programs,'the canonical complete Program is unchanged');
 assert.equal(fixture.publication.programs.length,1);
 const program=fixture.publication.programs[0],programDigest=p.sha256Canonical(program);
 assert.equal(program.programRef,'program://abi5-tests/sandbox-uat/lifecycle@5');
 assert.equal(programDigest,'sha256:804754973e3c8cc6ff1dd91eb59824aa3d4bdf7ac7be8820c17d8e71c33bd8e2');
 await record('source-program-conservation.json',{originalSourceRoot:oldRoot,newSourceRoot:sourceRoot,preserved,packageChange:{path:'/dependencies/@abiogenesis~1typescript-tenant',before:oldPackage.dependencies['@abiogenesis/typescript-tenant'],after:newPackage.dependencies['@abiogenesis/typescript-tenant']},programRef:program.programRef,programDigest,wholeCanonicalProgramUnchanged:true,canonicalOwner:'gtl.modulePublication',recursionBound:1000,scope:'Immutable declaration correspondence; no execution resolution or ABG admission is asserted'});
 const consumer=await verifyArtifact(runtime,{artifactPath:fixture.artifactPath,manifest:fixture.manifest,expectedArtifactDigest:fixture.basis.artifactDigest},record,'consumer31');
 const resolvedLock=p.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion:'5.0.0',memberKey:'resolve',verifiedArtifacts:[native.verified,consumer.verified]});
 await record('resolved-lock.json',resolvedLock);assert.equal(resolvedLock.kind,'resolved_product_lock');
 const {installProduct}=await import(pathToFileURL(join(inputs.installedRoot,'build/code/src/product/install_product.js')).href);
 console.log(JSON.stringify({stage:'consumer31-install-start',...stamp()}));
 const candidate=await installProduct({artifactPath:fixture.artifactPath,targetRoot:join(root,'installed-host'),verifiedArtifact:consumer.verified,resolvedLock});
 await record('install-result.json',candidate);assert.equal(candidate.kind,'product_install_candidate');
 assert.equal(p.isProductInstallCandidate(candidate,resolvedLock),true);assert.equal(await p.installedProductContentMatches(candidate),true);
 return {fixture,candidate,resolvedLock};
}
