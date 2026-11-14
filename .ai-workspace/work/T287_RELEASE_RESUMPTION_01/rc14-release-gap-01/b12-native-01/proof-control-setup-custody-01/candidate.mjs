// Operator proof adapter: newly built source -> maintained payload owner ->
// candidate verification/install -> fresh installed-export smoke. No provider.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const control=dirname(fileURLToPath(import.meta.url));
const activation=JSON.parse(await readFile(join(control,'ACTIVATION.json'),'utf8'));
const raw=activation.rawRoot, subject=join(raw,'proof/subject');
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const hex=bytes=>createHash('sha256').update(bytes).digest('hex');
const save=async (name,value)=>writeFile(join(raw,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const [mode]=process.argv.slice(2);assert(['package','smoke'].includes(mode)&&process.argv.length===3);
if(mode==='package') {
  const {packProduct}=await import(pathToFileURL(join(subject,'scripts/product-payload.mjs')));
  const product=await import(pathToFileURL(join(subject,'build/code/src/product/index.js')));
  const folder=join(raw,'proof/artifacts');await mkdir(folder);
  const [packed]=await packProduct(subject,folder), archive=join(folder,packed.filename);
  const manifest=await json(join(subject,'product-toolchain-manifest.json'));
  const request={artifactPath:archive,artifactRef:pathToFileURL(archive).href,
    expectedArtifactDigest:'sha256:'+hex(await readFile(archive)),expectedProductContentDigest:manifest.productContentDigest,
    expectedManifestDigest:product.sha256Canonical(manifest),expectedProductId:manifest.productId,
    expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion};
  const verified=await product.verifyProduct(request);
  await save('proof/PACK_VERIFICATION.json',{request,verified});
  assert.equal(verified.disposition,'verified');assert(product.isVerifiedProductArtifact(verified));
  const lock=product.constructResolvedProductLock([verified]);assert.equal(lock.kind,'resolved_product_lock');
  const targetRoot=join(raw,'proof/installed');
  const installation=await product.installProduct({artifactPath:archive,targetRoot,verifiedArtifact:verified,resolvedLock:lock});
  await save('proof/INSTALLATION.json',installation);
  assert.equal(installation.disposition,'materialized');assert(product.isProductInstallCandidate(installation,lock));
  assert(await product.installedProductContentMatches(installation));
  const pkg=await json(join(installation.installedRoot,'package.json'));
  const adapter=await json(join(installation.installedRoot,'contracts/public-functions/adapter-projection.json'));
  const record={status:'CHANGED_SOURCE_CANDIDATE_PACKED_AND_INSTALLED',subject,archive:{path:archive,
    sha256:hex(await readFile(archive)),bytes:(await readFile(archive)).length},request,installedRoot:installation.installedRoot,
    installHost:targetRoot,manifestRawSha256:hex(await readFile(join(subject,'product-toolchain-manifest.json'))),
    packageExports:Object.keys(pkg.exports),publicFunctionDefinitions:adapter.sdkMembers.length,
    publicFunctionFamilyDigest:adapter.family.familyDigest,sourcePostimageSha256:hex(await readFile(join(raw,'SOURCE_POSTIMAGE.json'))),
    qualified:false,versionUnchanged:true,meaning:'B12 source proof candidate; never the pinned RC13 author builder.'};
  await save('proof/CANDIDATE_PACKAGE.json',record);console.log(JSON.stringify(record));
} else {
  const candidate=await json(join(raw,'proof/CANDIDATE_PACKAGE.json'));
  const installation=await json(join(raw,'proof/INSTALLATION.json'));
  assert.equal(hex(await readFile(candidate.archive.path)),candidate.archive.sha256);
  const pkg=await json(join(candidate.installedRoot,'package.json')), runtime={};
  for(const name of ['product','abg','public','validator']) {
    const entry=pkg.exports['./'+name], path=resolve(candidate.installedRoot,typeof entry==='string'?entry:entry.import);
    assert(path.startsWith(candidate.installedRoot+'/'));runtime[name]=await import(pathToFileURL(path));
  }
  const {product,abg,public:api}=runtime;let store=null,close=null,failure=null;
  const result={qualified:false,providerCalls:0,installedRoot:candidate.installedRoot};
  try {
    assert.deepEqual(Object.keys(pkg.exports),candidate.packageExports);
    assert.equal(api.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.length,candidate.publicFunctionDefinitions);
    assert.equal(api.PUBLIC_FUNCTION_DEFINITION_FAMILY.familyDigest,candidate.publicFunctionFamilyDigest);
    const verification=await product.verifyProduct(candidate.request);assert.equal(verification.disposition,'verified');
    assert(await product.installedProductContentMatches(installation));
    const folder=join(raw,'proof/smoke-resource');await mkdir(folder);
    const acquired=abg.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(folder,'events.jsonl')});
    assert(acquired.store&&acquired.prefix);store=acquired.store;
    assert.equal(abg.readRuntimeEventsAtDurablePrefix(acquired.prefix).length,0);
    close=store.projectReopenAuthorityAndClose();store=null;assert.deepEqual(close.prefix,acquired.prefix);
    assert.equal(abg.readRuntimeEventsAtDurablePrefix(JSON.parse(JSON.stringify(close.prefix))).length,0);
    Object.assign(result,{status:'CANDIDATE_INSTALLED_OWNER_SMOKE_CLOSED',verification:verification.disposition,
      installedContentMatches:true,actualClose:close,emptyEvents:0,exports:candidate.packageExports.length});
  } catch(error) {failure=error;Object.assign(result,{status:'FIRST_SMOKE_FAILURE',error:String(error.stack??error)});}
  finally {
    if(store)try{result.cleanupClose=store.projectReopenAuthorityAndClose();}catch(error){result.closeFailure=String(error);failure??=error;}
    await save('proof/SMOKE_RESULT.json',result);
  }
  console.log(JSON.stringify(result));if(failure)throw failure;
}
