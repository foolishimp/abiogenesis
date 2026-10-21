import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,lstat,writeFile,realpath} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const root=import.meta.dirname;
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=async p=>{const b=await readFile(p.path);assert.equal(sha(b),p.sha256,p.path);return b;};
const save=async(n,v)=>writeFile(join(root,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const absent=async p=>{try{await lstat(p);assert.fail('resource already exists: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}};
const negatives=[];
try {
  const configBytes=await readFile(join(root,'readiness-configuration.json'));
  const c=JSON.parse(configBytes),grant=JSON.parse(await readFile(join(root,'readiness-effect-grant.json')));
  assert.equal(c.status,'activated');assert.equal(grant.status,'granted');
  assert.equal(sha(configBytes),grant.configuration.sha256);
  assert.equal(grant.maxPackCalls,1);assert.equal(grant.maxInstallCalls,0);assert.equal(grant.maxNativeCalls,0);
  assert.equal(process.version,'v24.7.0');assert.equal(await realpath(process.execPath),await realpath(c.node.path));
  for(const p of [c.node,c.npm,c.archive,c.manifest,c.package,...c.support.flatMap(x=>[x.source,x.copy])])await pin(p);
  for(const [key,value]of Object.entries(c.environment))assert.equal(process.env[key],value,key);
  assert.equal(process.env.NODE_OPTIONS,undefined);assert.equal(process.env.ABG_TS_CLAUDE_COMMAND,undefined);
  for(const p of Object.values(c.roots))await absent(p);
  const product=await import(pathToFileURL(join(c.stageTenant,'build/code/src/product/index.js')).href);
  const gtl=await import(pathToFileURL(join(c.stageTenant,'build/code/src/gtl/index.js')).href);
  const {prepareLanguageStructuralFixture}=await import(pathToFileURL(join(root,'readiness-support/test_env/support/language-structural-fixture.mjs')).href);
  const manifest=JSON.parse(await pin(c.manifest)),pkg=JSON.parse(await pin(c.package));
  assert.equal(manifest.packageName,pkg.name);assert.equal(manifest.packageVersion,pkg.version);
  const abiPublication=gtl.constructWorksiteConstructionModulePublication({productId:manifest.productId,
    artifactDigest:'sha256:'+c.archive.sha256,productContentDigest:manifest.productContentDigest,
    productManifestDigest:product.sha256Canonical(manifest),packageName:manifest.packageName,packageVersion:manifest.packageVersion});
  assert.equal(abiPublication.productSemanticsBinding.packageName,pkg.name);
  assert.equal(abiPublication.productSemanticsBinding.packageVersion,pkg.version);
  const cases=[
    ['missing-archive',{abiPackageArchivePath:undefined},/absolute exact ABI package archive path/],
    ['relative-archive',{abiPackageArchivePath:'relative.tgz'},/absolute exact ABI package archive path/],
    ['crossed-archive-digest',{abiPublication:{...abiPublication,artifactDigest:'sha256:'+'0'.repeat(64)}},/ABI archive differs from its publication/],
    ['missing-package-name',{abiPublication:{...abiPublication,productSemanticsBinding:{...abiPublication.productSemanticsBinding,packageName:''}}},/publication's ABI package name/],
  ];
  for(const [name,overrides,message]of cases){
    const scratch=join(c.roots.fixture,name);let observed;
    try{await prepareLanguageStructuralFixture({scratch,product,gtl,abiPublication,abiPackageArchivePath:c.archive.path,...overrides});}
    catch(e){observed=e;}
    assert.ok(observed,name+' must refuse');assert.match(observed.message,message);
    await absent(scratch);negatives.push({name,error:{name:observed.name,message:observed.message},fixtureEffects:false});
  }
  await save('readiness-negatives.json',{status:'satisfied',cases:negatives,scope:'actual support guards before fixture writes; no install or workload'});
  await save('fixture-pack.request.json',{executable:c.npm.path,args:['pack','--ignore-scripts','--json','--pack-destination',join(c.roots.fixture,'positive/language-structural-fixture/artifacts')],
    cwd:join(c.roots.fixture,'positive/language-structural-fixture'),environment:c.environment,via:'unchanged declared helper execFileAsync(npm,...)',attempt:1});
  const prepared=await prepareLanguageStructuralFixture({scratch:join(c.roots.fixture,'positive'),product,gtl,abiPublication,abiPackageArchivePath:c.archive.path});
  const fixturePackage=JSON.parse(await readFile(join(prepared.sourceRoot,'package.json')));
  assert.deepEqual(fixturePackage.dependencies,{[pkg.name]:'file:'+c.archive.path});
  assert.equal(prepared.manifest.declaredDependencies.length,1);
  const required=prepared.manifest.declaredDependencies[0];
  assert.equal(required.kind,'requires');assert.equal(required.productId,abiPublication.owningProductId);
  assert.equal(required.packageVersion,pkg.version);
  assert.deepEqual(required.requiredContractRefs,['abg.contract.gtl.root-declaration','abg.schema.public-operation-invocation']);
  assert.deepEqual(required.requiredCapabilityRefs,['abg.capability.catalog.invoke-graph-function@5','abg.capability.gtl.declare@5']);
  const manifestBytes=await readFile(join(prepared.sourceRoot,'product-toolchain-manifest.json'));
  assert.deepEqual(manifestBytes,Buffer.from(product.canonicalJson(prepared.manifest)+'\n'));
  const archiveBytes=await readFile(prepared.artifactPath);
  assert.equal('sha256:'+sha(archiveBytes),prepared.basis.artifactDigest);
  const result={status:'satisfied',scope:'support artifact readiness only; historical final01 archive; no install/admission/traversal',
    abiArchive:c.archive,abiPublication,fixture:{artifactPath:prepared.artifactPath,artifactSha256:sha(archiveBytes),artifactBytes:archiveBytes.length,
      sourceRoot:prepared.sourceRoot,basis:prepared.basis,package:fixturePackage,manifest:prepared.manifest,manifestBytesSha256:sha(manifestBytes)},
    expectedRefusals:negatives.length,fixturePackCalls:1,internalPackStdout:'helper consumes npm JSON and returns artifactPath; raw internal stdout not exposed by its declared interface',
    installs:0,workloads:0,nativeCalls:0,cleanup:false};
  await save('readiness-result.json',result);
  process.stdout.write(JSON.stringify({status:'satisfied',expectedRefusals:negatives.length,fixtureArchive:result.fixture.artifactSha256,installs:0,workloads:0,nativeCalls:0})+'\n');
} catch(error) {
  await save('readiness-first-failure.json',{status:'stopped',error:{name:error.name,message:error.message,stack:error.stack},completedNegatives:negatives,
    retention:'all allocated roots retained; no retry, cleanup or repair',nativeCalls:0});
  throw error;
}
