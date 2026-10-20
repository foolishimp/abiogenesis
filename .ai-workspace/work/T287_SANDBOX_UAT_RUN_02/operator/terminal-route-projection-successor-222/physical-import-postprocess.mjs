import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,lstat,realpath,access} from 'node:fs/promises';
import {join,dirname,resolve,relative,isAbsolute,sep} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const phase=dirname(fileURLToPath(import.meta.url)),root=join(phase,'consumer-proof');
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const candidate=await read(join(root,'install-result.json')),fixture=await read(join(root,'consumer.json'));
const host=await read(join(phase,'host-preparation/exacthost-identity.json'));
const conserved=await read(join(root,'source-program-conservation.json'));
const product=await import(pathToFileURL(join(host.installedRoot,'build/code/src/product/index.js')).href);
const hash=b=>createHash('sha256').update(b).digest('hex'),start=performance.now();
assert.equal(candidate.kind,'product_install_candidate');
assert.equal(conserved.programDigest,'sha256:804754973e3c8cc6ff1dd91eb59824aa3d4bdf7ac7be8820c17d8e71c33bd8e2');
assert.equal(product.sha256Canonical(fixture.publication.programs[0]),conserved.programDigest);
const wrapper=join(candidate.installedRoot,'build/semantics.mjs'),packageName='@abiogenesis/typescript-tenant';
const search=[];let dependencyRoot=null;
for(const path of createRequire(pathToFileURL(wrapper)).resolve.paths(packageName)??[]) {
 const packageRoot=join(path,...packageName.split('/'));let exists=false;try{await access(packageRoot);exists=true;}catch{}
 search.push({path:packageRoot,exists});
 if(exists){assert.equal((await lstat(packageRoot)).isSymbolicLink(),false);dependencyRoot=await realpath(packageRoot);break;}
}
assert.ok(dependencyRoot,'actual first managed dependency exists');
const inside=relative(resolve(join(root,'installed-host')),dependencyRoot);
assert.equal(!isAbsolute(inside)&&inside!=='..'&&!inside.startsWith('..'+sep),true,'physical dependency stays in the declared isolated install');
const dependencyPackage=await read(join(dependencyRoot,'package.json')),dependencyManifest=await read(join(dependencyRoot,'product-toolchain-manifest.json'));
assert.equal(dependencyPackage.name,packageName);
assert.equal(dependencyManifest.productContentDigest,host.productContentDigest);
assert.equal(product.sha256Canonical(dependencyManifest),host.manifestDigest);
const importTarget=dependencyPackage.exports['./product'].import;
assert.equal(importTarget,'./build/code/src/product/index.js');
const resolvedProductEntry=await realpath(resolve(dependencyRoot,importTarget));
assert.equal(resolvedProductEntry.startsWith(dependencyRoot+sep),true);
const payload=[];
async function walk(path,basePath='') {
 for(const name of (await readdir(path)).sort()) {
  const absolute=join(path,name),key=join(basePath,name),s=await lstat(absolute);assert.equal(s.isSymbolicLink(),false,key);
  if(s.isDirectory())await walk(absolute,key);
  else {assert.equal(s.isFile(),true,key);const b=await readFile(absolute);payload.push({path:key,sha256:hash(b),byteCount:b.length,mode:s.mode&0o777});}
 }
}
await walk(candidate.installedRoot);
assert.deepEqual(payload.map(row=>row.path).sort(),[...fixture.manifest.productRelativeLocators,fixture.manifest.capabilityDefinitionGraph.assetLocator.path,'product-toolchain-manifest.json'].sort(),'entire consumer payload has no unlisted nearer dependency/shadow');
for(const row of payload){const source=await readFile(join(root,'consumer-source',row.path));assert.equal(row.sha256,hash(source));assert.equal(row.byteCount,source.length);}
const actualWrapper=await import(pathToFileURL(wrapper).href),actualProduct=await import(pathToFileURL(resolvedProductEntry).href),base=actualProduct.ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS;
const delegatedKeys=Object.keys(base).filter(key=>!['bindingRef','packageName','packageVersion','validateContractValue'].includes(key));
for(const key of delegatedKeys)assert.equal(actualWrapper.SEMANTICS[key],base[key],key+' delegates the actually imported candidate30 owner');
assert.equal(delegatedKeys.includes('validateInvocationBasis'),true);
const proof={candidate,lockId:candidate.resolvedLockId,lockDigest:candidate.resolvedLockDigest,actualNativeOwner:{installedRoot:dependencyRoot,resolvedProductEntry,importTarget,artifactDigest:host.artifactSha256,productContentDigest:dependencyManifest.productContentDigest,manifestDigest:product.sha256Canonical(dependencyManifest)},moduleSearch:search,noNearerManagedDependencyShadow:true,ordinaryImportedWrapper:wrapper,delegatedKeys,delegatesActualCandidate30:true,programRef:conserved.programRef,programDigest:conserved.programDigest,wholeCanonicalProgramUnchanged:true,installedConsumerPayload:payload,completeInstalledInventory:true,recordedAt:new Date().toISOString(),wallMs:performance.now()-start,scope:'Actual ESM import of unchanged immutable consumer and managed dependency, complete consumer inventory and canonical declaration correspondence. No ABG-admitted install/current binding/Run/execution resolution/model effect; successful host/consumer author operations were not repeated.'};
await writeFile(join(root,'physical-import-program-proof.json'),JSON.stringify(proof,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({stage:'consumer30-joint-proof-passed',wallMs:proof.wallMs,programDigest:proof.programDigest,consumerContent:candidate.productContentDigest,nativeContent:proof.actualNativeOwner.productContentDigest,dependencyRoot,delegatedKeys,payloadMembers:payload.length}));
