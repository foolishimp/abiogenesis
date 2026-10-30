// External owner/operator preview deployment; no AF25, model call or qualification verdict.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const [sourceRoot,artifactPath,releaseRoot,installHost,archiveRoot]=process.argv.slice(2);
assert(archiveRoot,'Usage: deploy-smoke SOURCE_ROOT ARTIFACT RELEASE_ROOT EMPTY_INSTALL_HOST ARCHIVE_ROOT');
const tenant=join(sourceRoot,'build_tenants/abiogenesis/typescript');
const bootstrap=join(releaseRoot,'bootstrap');await mkdir(bootstrap);
execFileSync('/usr/bin/tar',['-xzf',artifactPath,'-C',bootstrap]);
const bootstrapPackage=join(bootstrap,'package');
const product=await import(pathToFileURL(join(bootstrapPackage,'build/code/src/product/index.js')));
const manifest=JSON.parse(await readFile(join(bootstrapPackage,'product-toolchain-manifest.json'),'utf8'));
const artifactDigest=await product.sha256File(artifactPath);
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:sourceRoot}).toString().trim();
const write=async(name,value)=>writeFile(join(releaseRoot,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const verified=await product.verifyProduct({artifactPath,artifactRef:pathToFileURL(artifactPath).href,
 expectedArtifactDigest:artifactDigest,expectedProductContentDigest:manifest.productContentDigest,
 expectedManifestDigest:product.sha256Canonical(manifest),expectedProductId:manifest.productId,
 expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion});
assert.equal(verified.disposition,'verified',JSON.stringify(verified));await write('verification.json',verified);
const lock=product.constructResolvedProductLock([verified]);assert.equal(lock.kind,'resolved_product_lock');await write('resolved-lock.json',lock);
const install=await product.installProduct({artifactPath,targetRoot:installHost,verifiedArtifact:verified,resolvedLock:lock});
await write('installation.json',install);assert.equal(install.disposition,'materialized',JSON.stringify(install));
assert(product.isProductInstallCandidate(install,lock));assert(await product.installedProductContentMatches(install));
const payload=execFileSync('/usr/bin/tar',['-tzf',artifactPath]).toString().trim().split('\n').filter(p=>!p.endsWith('/')).sort();
const inventory=[];
for(const path of payload){assert(path.startsWith('package/'));const relativePath=path.slice(8),expected=join(bootstrapPackage,relativePath),actual=join(install.installedRoot,relativePath);
 const expectedBytes=await readFile(expected),actualBytes=await readFile(actual);assert(expectedBytes.equals(actualBytes),relativePath);
 inventory.push({path:relativePath,byteCount:actualBytes.length,digest:product.sha256Bytes(actualBytes)});}
await write('payload-correspondence.json',{artifactDigest,installedRoot:install.installedRoot,members:inventory.length,inventoryDigest:product.sha256Canonical(inventory),inventory});
await mkdir(archiveRoot,{recursive:true});process.env.TMPDIR=archiveRoot;
process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH=artifactPath;
process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST=installHost;
process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256=artifactDigest;
const {runInstalledLanguageTest}=await import(pathToFileURL(join(tenant,'test_env/support/installed-language-test.mjs')));
const {LANGUAGE_TEST_IDS,evaluateLanguageTestResult}=await import(pathToFileURL(join(tenant,'test_env/support/language-smoke-fixture.mjs')));
// Preserve the existing helper's context instead of its test teardown deleting the original prefix and requests.
const cleanup=[];const proof=await runInstalledLanguageTest({after:fn=>cleanup.push(fn)},tenant,{identity:'development-rc1-installed-language-smoke'});
assert.equal(proof.receipt.exitCode,0);assert.equal(proof.receipt.ownerOutput.outcomeKind,'result');
const result=proof.events.find(e=>e.kind==='c_call_result_admitted');assert(result);
assert.equal(result.payload.contractRef,LANGUAGE_TEST_IDS.outputContractRef);
assert(evaluateLanguageTestResult({kind:'hello_world_input',subject:'World'},result.payload.value));
assert.equal(proof.events.filter(e=>e.kind==='run_closed').length,1);
assert.equal(proof.events.filter(e=>e.kind==='c_call_opened').length,1);
assert.deepEqual(proof.reads.map(r=>r.memberKey),['run_result','run_replay']);
assert(proof.reads.every(r=>r.receipt.exitCode===0));
const eventBytes=await readFile(new URL(proof.handoff.prefix.eventLogRef));
assert.equal(await product.sha256File(artifactPath),artifactDigest,'no repack or artifact mutation during proof');
const summary={kind:'rc1_development_preview_local_deployment',qualification:false,sourceCommit,artifactPath,artifactDigest,
 canonicalInstall:{host:installHost,installedRoot:install.installedRoot,installId:install.installId,productContentDigest:install.productContentDigest,manifestDigest:install.manifestDigest},
 smoke:{providerCalls:0,classification:'deterministic installed-language path proof only',scratch:proof.environment.scratch,
 installedRoot:proof.environment.installedRoot,installedCli:join(proof.environment.installedRoot,'build/code/src/public/cli.js'),
 receipt:proof.receipt,handoff:proof.handoff,selectedEvents:proof.events.filter(e=>['c_call_result_admitted','run_closed'].includes(e.kind)),
 reads:proof.reads.map(r=>({memberKey:r.memberKey,exitCode:r.receipt.exitCode,closeHandoff:r.receipt.resources.eventResource.closeHandoff,
 outcomeKind:r.receipt.ownerOutput.outcomeKind})),eventLog:{path:proof.handoff.prefix.eventLogRef,byteCount:eventBytes.length,digest:product.sha256Bytes(eventBytes)},
 unchangedAcrossFreshReads:true,retainedOriginalContext:true},
 limits:['External operator preview; no AF22 green, AF25 snapshot, native/model qualification or human acceptance.',
 'Canonical deployment is a physical Product-install candidate; the smoke independently admits that exact artifact through its own install/lock/runtime context.',
 'Source/package identity, Product owner verification and complete payload correspondence are proved; semantic completeness and overall productivity are unverified.']};
await write('deployment-receipt.json',summary);console.log(JSON.stringify({sourceCommit,artifactDigest,installedRoot:install.installedRoot,smokeRoot:proof.environment.scratch,payloadMembers:inventory.length,eventBytes:eventBytes.length,providerCalls:0,qualification:false}));
