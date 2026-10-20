import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {recordedPackedResource,assertPackedResourceCorrespondence} from './packed-resources.mjs';
import {bindingCoordinateOf,prepareBindingInputs} from './binding-inputs.mjs';
const root=dirname(fileURLToPath(import.meta.url)),read=async path=>JSON.parse(await readFile(path,'utf8')),start=performance.now();
const selected=await read(join(root,'inputs.json')),host=await read(selected.host.path);
const p=await import(pathToFileURL(join(host.installedRoot,'build/code/src/product/index.js')));
const require=createRequire(join(host.installedRoot,'package.json')),v=require('valibot');
const items=await Promise.all([selected.acquisition,selected.consumerAcquisition].map(async row=>{const captured=await read(row.path);return {...captured,verified:captured.verification.verifiedArtifact};}));
assert.equal(items[0].verified.productContentDigest,host.productContentDigest);
assert.equal(items[0].verified.artifactDigest,'sha256:'+host.artifactSha256);
const caller=await readFile(join(root,'prepare.mjs'),'utf8');
const expression=caller.match(/const verificationRequests=(.+);\n const packed=/)?.[1];assert.ok(expression,'Frozen caller pure verification-request expression');
// Evaluate only the caller's pure mapping, never import/execute prepare.mjs.
const verificationRequests=Function('items','return ('+expression+');')(items);
const packed=items.map((item,i)=>recordedPackedResource(item,verificationRequests[i]));
for(let i=0;i<items.length;i++){
 const parsed=v.safeParse(p.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify.requestSchema,verificationRequests[i]);
 assert(parsed.success,JSON.stringify(parsed.issues));assert.deepEqual(parsed.output,verificationRequests[i]);
 assert.equal(packed[i].descriptor.digest,items[i].verification.coordinates.descriptor.digest);
 const wrong={...packed[i],kind:'product_verification_artifact',productContent:{ref:items[i].verified.productId,digest:items[i].verified.productContentDigest}};delete wrong.artifactPath;
 assert.throws(()=>assertPackedResourceCorrespondence(items[i],verificationRequests[i],wrong));
}
const lock=p.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion:'5.0.0',memberKey:'resolve',verifiedArtifacts:items.map(x=>x.verified)});
assert.equal(lock.kind,'resolved_product_lock',JSON.stringify(lock));assert(p.isResolvedProductLock(lock));
const capturedCurrent=await read(selected.latest176['current-setup.json'].path);
assert.notEqual(lock.lockDigest,capturedCurrent.resolvedLock.lockDigest);
const targetRoots=[join(root,'installed-current27'),join(root,'installed-consumer-current27')];
// Controlled materialized-candidate fields only; there is no install/admission.
const candidates=items.map((item,i)=>{
 const row=lock.rows.find(row=>row.productId===item.verified.productId);assert.ok(row);
 return {kind:'product_install_candidate',schemaVersion:'5.0.0',disposition:'materialized',...row,installId:'product-install://'+row.packageName+'/'+row.packageVersion+'/'+row.productContentDigest.slice(7)+'/'+lock.lockDigest.slice(7),installedRoot:join(targetRoots[i],'node_modules',...row.packageName.split('/')),resolvedLockId:lock.lockId,resolvedLockDigest:lock.lockDigest};
});
for(const candidate of candidates){assert(p.isProductInstallCandidate(candidate,lock));assert.equal(candidate.admissionEventRef,undefined);}
const oldConsumer=capturedCurrent.installations.find(row=>row.productId===items[1].verified.productId);assert.ok(oldConsumer);
assert.equal(candidates[1].artifactDigest,oldConsumer.artifactDigest);assert.equal(candidates[1].productContentDigest,oldConsumer.productContentDigest);
const mixed=p.constructProductSet([candidates[0],oldConsumer],lock);assert.equal(mixed.kind,'environment_refusal');assert.equal(mixed.code,'lock_mismatch');
const lockCoordinate={ref:lock.lockId,digest:lock.lockDigest};
const verificationRefs=items.map((item,i)=>({invocation:{ref:'invocation://abi5-tests/controlled-183-verification-'+i,digest:p.sha256Canonical({controlled:i})},outcome:item.verification.coordinates.verifiedArtifact}));
const resolveRequest={requirements:items.map(({verified:item})=>({productId:item.productId,packageVersion:item.packageVersion,requiredContractRefs:[],requiredCapabilityRefs:[]})),verifiedCandidates:verificationRefs};
const resolvedSchema=v.safeParse(p.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve.requestSchema,resolveRequest);assert(resolvedSchema.success,JSON.stringify(resolvedSchema.issues));
for(let i=0;i<items.length;i++){
 const request={verifiedArtifact:items[i].verification.coordinates.verifiedArtifact,descriptor:packed[i].descriptor,contributionManifest:packed[i].contributionManifest,resolvedLock:lockCoordinate,targetRoot:targetRoots[i],installPolicy:'clean'};
 const parsed=v.safeParse(p.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install.requestSchema,request);assert(parsed.success,JSON.stringify(parsed.issues));assert.deepEqual(parsed.output,request);p.sha256Canonical(request);
}
const bindingInputs=prepareBindingInputs(p,{oldBinding:capturedCurrent.workspaceBinding,workspaceAuthority:capturedCurrent.workspaceAuthority,nativeInstall:candidates[0],consumerInstall:candidates[1],nativeTargetRoot:targetRoots[0],resolvedLock:lock});
const parsed=v.safeParse(p.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind.requestSchema,bindingInputs.request);assert(parsed.success,JSON.stringify(parsed.issues));assert.deepEqual(parsed.output,bindingInputs.request);
assert.equal(bindingInputs.request.declaredRoots.length,6);assert.equal(new Set(bindingInputs.request.declaredRoots.map(x=>x.rootKind)).size,6);assert.equal(bindingInputs.requestDigest,p.sha256Canonical(bindingInputs.request));
for(const field of ['eventLogRoot','runtimeStateRoot','projectionRoot','archiveRoot'])assert.equal(bindingInputs.roots[field],capturedCurrent.workspaceBinding.roots[field]);
assert.equal(bindingInputs.roots.productRoot,candidates[1].installedRoot);assert.equal(bindingInputs.roots.toolchainRoot,targetRoots[0]);
const handoff=await read(selected.handoff.path),latest=await read(selected.latest176['return.json'].path);assert.deepEqual(handoff.prefix,latest.actualCurrentClosePrefix);assert.equal(handoff.prefix.prefixLength,1686258635);
assert.equal(handoff.prefix.prefixDigest,'sha256:8acaa9862be4a108bac3946fe09f4403a08bff344f21ac34ad813add5679c858');
for(const f of ['verify-artifacts.mjs','packed-resources.mjs','binding-inputs.mjs','operation-resource.mjs'])assert.equal(createHash('sha256').update(await readFile(join(root,f))).digest('hex'),createHash('sha256').update(await readFile(join(dirname(selected.callerRepairBase.path),f))).digest('hex'));
for(const label of ["invoke('product-verify-'","invoke('product-resolve'","invoke('product-install27'","invoke('product-install-consumer27'","invoke('workspace-bind27'","invoke('catalog-admit27'","invoke('catalog-view27'"])assert(caller.includes(label));
assert(!caller.includes('completedCall('));assert(!caller.includes('continuedCall('));
assert(caller.indexOf('const packed=')<caller.indexOf("pulse('acquisition-start'"));
assert(caller.includes('borrowCurrentOperationResource(a,resource,selection)'));
assert(caller.includes('projectExactInvocationAdmissionAtPrefix(prefixAt(),source.sourceInvocationAdmissionRef)'));
assert(caller.indexOf("record('current-source-use-discriminator.json'")<caller.indexOf("assert.ok(use,'Actual current27"));
const result={kind:'bounded_current27_caller_preflight',status:'PASS',wallMs:performance.now()-start,host:host.installedRoot,canonicalOwners:['PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify.requestSchema','ProductEnvironmentPort.resolve','PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve.requestSchema','PRODUCT_INSTALL_SOURCE_DECLARATIONS.install.requestSchema','constructProductSet','PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind.requestSchema'],verificationRequests:verificationRequests.map((request,i)=>({requestDigest:p.sha256Canonical(request),artifact:request.artifact,productContent:request.productContent,descriptor:request.descriptor,packedArtifactPath:packed[i].artifactPath})),prospectiveLock:lockCoordinate,previous26Lock:{ref:capturedCurrent.resolvedLock.lockId,digest:capturedCurrent.resolvedLock.lockDigest},mixedLockRefusal:{kind:mixed.kind,code:mixed.code},sixRootRequest:bindingInputs.request,sixRootRequestDigest:bindingInputs.requestDigest,recordedCurrentBinding:bindingCoordinateOf(capturedCurrent.workspaceBinding),latest176Prefix:handoff.prefix,claims:['Exact caller pure packed-verification mapping validates against canonical installed27 schema and helper correspondence for native27 and unchanged consumer','Earlier wrong kind/productId coordinate/missing artifactPath form refuses','Canonical prospective27 lock differs from actual26 lock; old26 consumer/new27 lock combination refuses','Controlled current-lock materialized candidate fields produce a canonical six-root binding request; same A/authority/physical roots retained','Fresh setup owner calls, current operation borrowed resource, scalar source projection and null-before-assert are present; four174 helpers byte-exact'],limits:'Captured complete verified values are lower premises only, not restored nominal receipts. Controlled verification invocation coordinates and install candidates carry no admissions. No campaign log read/acquisition, archive verification, Public transport, installation, binding, catalog, cover, source-use, native model, currentness or capacity proof. Actual process must live-verify before acquisition, derive actual source/binding/install records and admit each necessary27 producer.'};
await writeFile(join(root,'preflight-result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:result.status,wallMs:result.wallMs,prospectiveLock:lockCoordinate,mixedLockRefusal:result.mixedLockRefusal,sixRootRequestDigest:result.sixRootRequestDigest,controlledOnly:true,noResourceOrTransport:true}));
