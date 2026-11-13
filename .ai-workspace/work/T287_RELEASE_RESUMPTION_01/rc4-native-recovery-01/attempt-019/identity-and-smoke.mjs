// Bounded operator C2 adapter: existing package/verify/install owners and existing language smoke.
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),hash=b=>createHash('sha256').update(b).digest('hex');
const archive=join(root,'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.4.tgz'),host=join(root,'artifacts/rc4-smoke-host');
const read=async p=>JSON.parse(await readFile(p,'utf8')),save=async(n,v)=>writeFile(join(root,'artifacts',n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const basis=await read(join(root,'test_env/fixtures/abi5-root-candidate-basis.json'));
assert.equal(basis.packageVersion,'5.0.0-rc.4');assert.equal(basis.productId,'product://abiogenesis/typescript-tenant@5.0.0-rc.4');
assert.equal('sha256:'+hash(await readFile(archive)),basis.artifactDigest);
if(process.argv[2]==='prepare'){
 const product=await import(pathToFileURL(join(root,'build/code/src/product/index.js')).href);
 const verified=await product.verifyProduct({artifactPath:archive,artifactRef:pathToFileURL(archive).href,expectedArtifactDigest:basis.artifactDigest,expectedProductContentDigest:basis.productContentDigest,expectedManifestDigest:basis.manifestDigest,expectedProductId:basis.productId,expectedPackageName:basis.packageName,expectedPackageVersion:basis.packageVersion});
 await save('rc4-verification.json',verified);assert.equal(verified.disposition,'verified');
 const lock=product.constructResolvedProductLock([verified]);assert.equal(lock.kind,'resolved_product_lock');await save('rc4-lock.json',lock);
 try{await lstat(host);throw Error('smoke host already exists')}catch(e){if(e.code!=='ENOENT')throw e;}
 const installed=await product.installProduct({artifactPath:archive,targetRoot:host,verifiedArtifact:verified,resolvedLock:lock});await save('rc4-installation.json',installed);assert.equal(installed.disposition,'materialized');assert(product.isProductInstallCandidate(installed,lock));assert(await product.installedProductContentMatches(installed));
 const baseline=process.env.ABI5_RC4_BASELINE_ROOT;assert(baseline,'exact accepted baseline root required');
 const inventory=async base=>{const out=[];async function visit(rel){const p=join(base,rel),st=await lstat(p);assert(!st.isSymbolicLink(),p);if(st.isDirectory()){for(const n of (await readdir(p)).sort())await visit(rel?rel+'/'+n:n);}else{assert(st.isFile(),p);const b=await readFile(p);out.push({path:rel,bytes:b.length,sha256:hash(b)});}}await visit('');return out;};
 const old=await inventory(baseline),current=await inventory(installed.installedRoot);assert.deepEqual(current.map(x=>x.path),old.map(x=>x.path));
 const expectedBaselineManifest='8bc7781b743cdef9078445ad000e95b2043a92ad208b5718b5e92a28a53821de';assert.equal(product.sha256Canonical(await read(join(baseline,'product-toolchain-manifest.json'))),'sha256:'+expectedBaselineManifest);
 const changed=current.filter((r,i)=>r.sha256!==old[i].sha256).map((r)=>({path:r.path,before:old.find(x=>x.path===r.path),after:r}));
 const permitted=['package.json','build/code/src/product/contracts.js','build/code/src/product/contracts.d.ts','contracts/capabilities/capability-definition-graph.json','product-toolchain-manifest.json'];
 await save('rc4-payload-delta.json',{baselineRoot:baseline,baselineArtifactSha256:'4589f5c5174cb84ba37f4efecd15f52f6437fa696d117aeff58b84bd5f8363ac',candidate:basis,inventory:current,baselineInventory:old,changed,permittedIdentityAndGeneratorPaths:permitted});
 assert(changed.every(x=>permitted.includes(x.path)),'Unexplained payload change outside identity/generator paths');
 for(const rel of ['build/code/src/product/contracts.js','build/code/src/product/contracts.d.ts'])assert.equal(await readFile(join(installed.installedRoot,rel),'utf8'),(await readFile(join(baseline,rel),'utf8')).replaceAll('5.0.0-rc.3','5.0.0-rc.4'),rel);
 const before=await read(join(baseline,'package.json')),after=await read(join(installed.installedRoot,'package.json'));assert.deepEqual(after,{...before,version:'5.0.0-rc.4'});
 const manifest=await read(join(installed.installedRoot,'product-toolchain-manifest.json'));assert.equal(manifest.schemaVersion,'5.0.0');assert.equal(manifest.packageVersion,'5.0.0-rc.4');assert.equal(manifest.productId,basis.productId);
 console.log(JSON.stringify({status:'RC4_IDENTITY_PAYLOAD_AND_INSTALL_VERIFIED',basis,installedRoot:installed.installedRoot,members:current.length,changedPaths:changed.map(x=>x.path),providerCalls:0,published:false,qualified:false,selectorChanged:false}));
}else if(process.argv[2]==='smoke'){
 const r=spawnSync(process.execPath,['--experimental-vm-modules','--test','test_env/tests/installed-language-smoke.test.mjs'],{cwd:root,env:{...process.env,ABI5_WAVE1_FROZEN_ARTIFACT_PATH:archive,ABI5_WAVE1_FROZEN_INSTALL_HOST:host,ABI5_WAVE1_FROZEN_ARTIFACT_SHA256:basis.artifactDigest},stdio:'inherit'});if(r.error)throw r.error;assert.equal(r.signal,null);process.exitCode=r.status??1;
}else throw Error('Expected prepare or smoke');
