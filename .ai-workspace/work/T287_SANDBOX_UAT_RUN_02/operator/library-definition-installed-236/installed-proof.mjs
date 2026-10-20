import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import {installedModules,verifyArtifact,publicCaller,populateSandbox,requireKind} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';
const root=dirname(fileURLToPath(import.meta.url)),fixture=join(root,'public-fixture');await mkdir(fixture);
const selector=JSON.parse(await readFile(join(root,'host-selector.json'),'utf8'));
const environment={...process.env,npm_config_cache:join(root,'npm-cache'),npm_config_offline:'true'};
const command=commandRecorder(fixture,{environment,timeoutMs:300000,maxOutputBytes:8388608});
const record=async(name,value,raw=false)=>{const path=join(fixture,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,raw?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});};
const stages=[],started=performance.now();const sample=label=>{const row={label,elapsedMs:performance.now()-started,...process.memoryUsage(),scope:'actual current proof process sample; CLI child peaks unmeasured'};stages.push(row);console.log(JSON.stringify(row));};
let caller;
try {
 sample('installed-modules-start');const runtime=await installedModules(selector.installedRoot),p=runtime.product,a=runtime.abg;
 const manifest=JSON.parse(await readFile(selector.manifestPath,'utf8'));
 sample('native-verification-start');const native=await verifyArtifact(runtime,{artifactPath:selector.archivePath,manifest,expectedArtifactDigest:selector.artifactDigest},record,'native');sample('native-verification-complete');
 assert.strictEqual(p.selectOwnedProductVerification(native.request,native.verified),native.verified);
 const config={runId:'library-definition-236',bootstrapRoot:selector.installedRoot,worksiteRoot:join(fixture,'worksite'),nodePath:process.execPath,
  setupEnvironment:environment,toolchains:{npm:{executable:'/opt/homebrew/bin/npm'}},recursionBound:1000};
 caller=publicCaller({root:fixture,runtime,native,command,record,config});
 sample('public-population-start');const setup=await populateSandbox(caller);sample('public-population-complete');
 const env=caller.refresh(),params={catalog:caller.state.catalog,catalogView:caller.state.catalogView,admittedInstalls:env.productInstalls,
  verifyInstallAdmission:install=>a.hasAdmittedProductInstall(env.artifactTruth,install),programRef:setup.fixture.ids.programRef,
  selection:{kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'}};
 assert(env.productInstalls.every(install=>a.hasAdmittedProductInstall(env.artifactTruth,install)));
 sample('execution-resolution-first-start');const first=requireKind(await p.ProductExecutionResolutionPort.resolve(params),'loaded_product_execution_resolution','installed-resolution');sample('execution-resolution-first-complete');
 const expected='sha256:804754973e3c8cc6ff1dd91eb59824aa3d4bdf7ac7be8820c17d8e71c33bd8e2';assert.equal(p.sha256Canonical(first.program),expected);
 sample('execution-resolution-warm-start');const second=requireKind(await p.ProductExecutionResolutionPort.resolve(params),'loaded_product_execution_resolution','installed-warm-resolution');sample('execution-resolution-warm-complete');
 assert.deepEqual(second.resolution,first.resolution);assert.deepEqual(second.programValidation,first.programValidation);
 assert.strictEqual(second.programValidation,first.programValidation,'same installed declaration handoff shares actual validated Program');
 const crossed=structuredClone(caller.state.catalog.readinessBasis);crossed.workspaceBinding.lockDigest=p.sha256Canonical({crossed:true});
 const refused=p.admitGraphFunctionCatalog(crossed);assert.equal(refused.kind,'catalog_construction_refusal');
 const summary={scope:'actual installed Public definition composition; no Run/provider/app/UAT or capacity claim',installedRoot:selector.installedRoot,
  archive:selector.artifactDigest,content:native.verified.productContentDigest,manifest:native.verified.manifestDigest,
  programDigest:p.sha256Canonical(first.program),programValidationRef:first.programValidation.validationRef,
  sameOwnerProgramValidationReused:first.programValidation===second.programValidation,
  loadedResolution:first.resolution,typedCrossedBindingRefusal:refused,installCoordinates:env.productInstalls.map(p.productInstallCoordinate),
  binding:caller.state.binding,lock:{ref:caller.state.resolvedLock.lockId,digest:caller.state.resolvedLock.lockDigest},
  catalogDigest:caller.state.catalog.basisDigest,viewDigest:caller.state.catalogView.viewDigest,publicCalls:caller.state.calls,
  closeHandoff:caller.state.closeHandoff,stages};
 await record('composition-result.json',summary);
 console.log(JSON.stringify({stage:'positive-public-composition-PASS',programDigest:summary.programDigest,admittedInstalls:summary.installCoordinates.length,calls:summary.publicCalls.length,warmProgramValidationShared:true}));
 const oldPath='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/portable-close-handoff-successor-227/consumer-proof/consumer31-acquisition.json';
 const old=JSON.parse(await readFile(oldPath,'utf8'));
 sample('old-peer-negative-start');const oldVerified=await p.verifyProduct(old.request);assert.equal(oldVerified.kind,'verified_product_artifact');
 const oldPeerLock=requireKind(p.resolveProductArtifacts([native.verified,oldVerified]),'resolved_product_environment','negative-old-peer-lock').lock;
 const negative=await p.installProduct({artifactPath:old.request.artifactPath,targetRoot:join(root,'old-peer-negative'),verifiedArtifact:oldVerified,resolvedLock:oldPeerLock});
 assert.equal(negative.kind,'product_install_refusal');assert.equal(negative.code,'installation_verification_failed');sample('old-peer-negative-complete');
 await record('old-peer-refusal.json',{scope:'actual physical temporary installer; no successful ProductInstall/ABG admission',oldConsumerArtifact:oldVerified.artifactDigest,currentNativeContent:native.verified.productContentDigest,resolvedLock:{ref:oldPeerLock.lockId,digest:oldPeerLock.lockDigest},refusal:negative,stages:stages.slice(-2)});
 await record('stages.json',stages);
 console.log(JSON.stringify({stage:'old-same-version-peer-PASS',refusal:negative}));
} catch(error) {
 await record('first-cause.json',{name:error.name,message:error.message,stack:error.stack,stage:stages.at(-1),completedCalls:caller?.state.calls??[],genuineClose:caller?.state.closeHandoff??null});
 throw error;
}
