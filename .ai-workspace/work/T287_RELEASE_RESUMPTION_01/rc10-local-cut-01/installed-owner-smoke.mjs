// One selected direct installed-owner smoke. No reinstall, actor, provider or native workflow.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
assert.equal(process.argv.length,6,'usage: installed-owner-smoke.mjs RELEASE_ROOT FRESH_SCRATCH OUTPUT_JSON RETAINED_RUNTIME_OWNER');
const [release,scratch,output,ownerPath]=process.argv.slice(2);
async function absent(p){try{await lstat(p);throw Error('existing allocation preserved: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
await absent(scratch);await absent(output);
const installed=JSON.parse(await readFile(join(release,'installation.json'),'utf8'));
const cut=JSON.parse(await readFile(join(release,'LOCAL_CUT_RECORD.json'),'utf8'));
assert.equal(installed.installedRoot,cut.installedRoot);assert.equal(cut.source.packageVersion,'5.0.0-rc.10');
const {loadRetainedInstalledRuntime}=await import(pathToFileURL(ownerPath).href);
const runtime=await loadRetainedInstalledRuntime(installed.installedRoot),{product,abg,public:publicApi}=runtime;
assert.equal(product.ABI5_PACKAGE_VERSION,'5.0.0-rc.10');assert.equal(product.ABI5_PRODUCT_ID,'product://abiogenesis/typescript-tenant@5.0.0-rc.10');
for(const name of ['constructInstalledPublicDefinitionCall','runInstalledDefinitionCallWithResource'])assert.equal(typeof publicApi[name],'function',name);
assert(publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.length>0);
const request={artifactPath:cut.archive,artifactRef:pathToFileURL(cut.archive).href,
  expectedArtifactDigest:cut.source.artifactDigest,expectedProductContentDigest:cut.source.productContentDigest,
  expectedManifestDigest:cut.source.manifestDigest,expectedProductId:cut.source.productId,
  expectedPackageName:cut.source.packageName,expectedPackageVersion:cut.source.packageVersion};
const verified=await product.verifyProduct(request);
const verificationBytes=Buffer.from(JSON.stringify(verified,null,2)+'\n');
await writeFile(output+'.verification.json',verificationBytes,{flag:'wx'});
const verification={path:output+'.verification.json',bytes:verificationBytes.length,sha256:createHash('sha256').update(verificationBytes).digest('hex')};
assert.equal(verified.disposition,'verified');assert.equal(product.isVerifiedProductArtifact(verified),true);
assert.strictEqual(product.selectOwnedProductVerification(request,verified),verified);
assert(await product.installedProductContentMatches(installed));
await mkdir(scratch,{mode:0o700});
const report={status:'PENDING',installedRoot:runtime.root,version:product.ABI5_PACKAGE_VERSION,productId:product.ABI5_PRODUCT_ID,
  shippedArchive:cut.archive,artifactDigest:cut.source.artifactDigest,verification,installedContentMatches:true,
  exportedDefinitionCount:publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.length,
  resource:null,ownerRead:null,actualClose:null,nativeTransportInvoked:false,providerCalls:0,qualified:false,
  scope:'Actual immutable-install verification/content/export and empty-resource read/close only. Full lifecycle/performance belongs to exact-shipped-archive installed scratch proof.'};
let store=null,closeAttempted=false,failure=null;
try{
  const acquired=abg.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(scratch,'events.jsonl')});
  assert(acquired.store&&acquired.prefix,'new resource owner refused');store=acquired.store;
  report.resource={eventLogPath:join(scratch,'events.jsonl'),prefix:acquired.prefix};
  report.ownerRead=abg.readRuntimeEventsAtDurablePrefix(acquired.prefix);
  assert(Array.isArray(report.ownerRead));assert.equal(report.ownerRead.length,0);
  closeAttempted=true;report.actualClose=store.projectReopenAuthorityAndClose();assert.deepEqual(report.actualClose.prefix,acquired.prefix);
  report.status='DIRECT_INSTALLED_OWNER_SMOKE_CLOSED';
}catch(e){failure=e;report.status='DIRECT_INSTALLED_OWNER_SMOKE_FAILED';report.failure=String(e?.stack??e);}
finally{
  if(store&&!closeAttempted){closeAttempted=true;try{report.actualClose=store.projectReopenAuthorityAndClose();}catch(e){report.closeFailure=String(e);failure??=e;}}
  await writeFile(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}
if(failure)throw failure;
console.log(JSON.stringify(report));
