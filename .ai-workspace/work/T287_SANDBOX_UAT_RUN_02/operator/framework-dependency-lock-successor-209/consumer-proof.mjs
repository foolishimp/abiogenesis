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
 const oldRoot='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/sandbox-uat/data-mapper-full/2026-10-08T17-40-42-399Z-9331fc68-b309-49fb-a8f1-9a544450add9/setup/consumer-source';
 const record=async(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
 const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 const stamp=()=>({at:new Date().toISOString(),...process.memoryUsage()});
 const start=performance.now();
 const fixture=await prepareConsumer({root,product:p,gtl:g,verified:native.verified,archivePath:inputs.archive.path,npm:'/opt/homebrew/bin/npm',recursionBound:1000,command});
 await record('consumer.json',fixture);
 console.log(JSON.stringify({stage:'consumer29-packed',wallMs:performance.now()-start,artifactPath:fixture.artifactPath,...stamp()}));
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
 const consumer=await verifyArtifact(runtime,{artifactPath:fixture.artifactPath,manifest:fixture.manifest,expectedArtifactDigest:fixture.basis.artifactDigest},record,'consumer29');
 const resolvedLock=p.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion:'5.0.0',memberKey:'resolve',verifiedArtifacts:[native.verified,consumer.verified]});
 await record('resolved-lock.json',resolvedLock);assert.equal(resolvedLock.kind,'resolved_product_lock');
 const {installProduct}=await import(pathToFileURL(join(inputs.installedRoot,'build/code/src/product/install_product.js')).href);
 console.log(JSON.stringify({stage:'consumer29-install-start',...stamp()}));
 const candidate=await installProduct({artifactPath:fixture.artifactPath,targetRoot:join(root,'installed-host'),verifiedArtifact:consumer.verified,resolvedLock});
 await record('install-result.json',candidate);assert.equal(candidate.kind,'product_install_candidate');
 assert.equal(p.isProductInstallCandidate(candidate,resolvedLock),true);assert.equal(await p.installedProductContentMatches(candidate),true);
 const wrapper=join(candidate.installedRoot,'build/semantics.mjs'),resolveFrom=createRequire(pathToFileURL(wrapper));
 const resolvedProductEntry=resolveFrom.resolve('@abiogenesis/typescript-tenant/product');
 const dependencyRoot=await realpath(join(dirname(resolvedProductEntry),'../../../..'));
 const dependencyManifest=JSON.parse(await readFile(join(dependencyRoot,'product-toolchain-manifest.json'),'utf8'));
 assert.equal(dependencyManifest.productContentDigest,native.verified.productContentDigest);
 assert.equal(p.sha256Canonical(dependencyManifest),native.verified.manifestDigest);
 assert.equal(await p.installedProductContentMatches({...native.verified,installedRoot:dependencyRoot}),true);
 const search=[];
 for(const path of resolveFrom.resolve.paths('@abiogenesis/typescript-tenant')??[]) {
  const packageRoot=join(path,'@abiogenesis/typescript-tenant');let exists=false;try{await access(packageRoot);exists=true;}catch{}
  search.push({path:packageRoot,exists});if(exists){assert.equal(await realpath(packageRoot),dependencyRoot);break;}
 }
 assert.equal(search.some(row=>row.exists),true);
 const actualWrapper=await import(pathToFileURL(wrapper).href),actualProduct=await import(pathToFileURL(resolvedProductEntry).href),base=actualProduct.ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS;
 const delegatedKeys=Object.keys(base).filter(key=>!['bindingRef','packageName','packageVersion','validateContractValue'].includes(key));
 for(const key of delegatedKeys)assert.equal(actualWrapper.SEMANTICS[key],base[key],key+' delegates the actually resolved candidate29 owner');
 assert.equal(delegatedKeys.includes('validateInvocationBasis'),true);
 const payload=[];
 async function walk(path,basePath=''){for(const name of (await readdir(path)).sort()){const absolute=join(path,name),key=join(basePath,name),s=await lstat(absolute);assert.equal(s.isSymbolicLink(),false,key);if(s.isDirectory())await walk(absolute,key);else{assert.equal(s.isFile(),true,key);const b=await readFile(absolute);payload.push({path:key,sha256:hash(b),byteCount:b.length,mode:s.mode&0o777});}}}
 await walk(candidate.installedRoot);
 const expectedPaths=[...fixture.manifest.productRelativeLocators,fixture.manifest.capabilityDefinitionGraph.assetLocator.path,'product-toolchain-manifest.json'].sort();
 assert.deepEqual(payload.map(row=>row.path).sort(),expectedPaths);
 for(const row of payload){const source=await readFile(join(sourceRoot,row.path));assert.equal(row.sha256,hash(source));assert.equal(row.byteCount,source.length);}
 await record('physical-import-program-proof.json',{candidate,lockId:resolvedLock.lockId,lockDigest:resolvedLock.lockDigest,consumerVerified:consumer.verified,actualNativeOwner:{installedRoot:dependencyRoot,resolvedProductEntry,artifactDigest:native.verified.artifactDigest,productContentDigest:native.verified.productContentDigest,manifestDigest:native.verified.manifestDigest},moduleSearch:search,noNearerManagedDependencyShadow:true,ordinaryImportedWrapper:wrapper,delegatedKeys,delegatesActualCandidate29:true,programRef:program.programRef,programDigest,wholeCanonicalProgramUnchanged:true,installedConsumerPayload:payload,completeInstalledInventory:true,wallMs:performance.now()-start,scope:'Genuine immutable consumer materialization, physical import and declaration correspondence; no ABG-admitted install, current WorkspaceBinding, execution resolution or Run/model effect'});
 console.log(JSON.stringify({stage:'consumer29-joint-proof-passed',wallMs:performance.now()-start,programDigest,consumerContent:consumer.verified.productContentDigest,nativeContent:native.verified.productContentDigest,lockDigest:resolvedLock.lockDigest,...stamp()}));
 return {fixture,candidate,resolvedLock};
}
