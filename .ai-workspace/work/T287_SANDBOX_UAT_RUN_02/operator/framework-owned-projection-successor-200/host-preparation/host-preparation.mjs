import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,lstat} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import {installedModules,verifyArtifact} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';
const phase=dirname(fileURLToPath(import.meta.url)),inputs=JSON.parse(await readFile(join(phase,'inputs.json'),'utf8'));
const record=async(name,value)=>writeFile(join(phase,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const command=commandRecorder(phase,{environment:{...process.env,npm_config_cache:join(phase,'npm-cache'),npm_config_offline:'true'},timeoutMs:300000,maxOutputBytes:1048576});
const installed=await command('install-host28','/opt/homebrew/bin/npm',['install','--ignore-scripts','--no-audit','--no-fund','--prefix',inputs.installHost,inputs.archive.path],{cwd:phase});
assert.equal(installed.exitCode,0);assert.equal(installed.timedOut,false);assert.equal(installed.truncated,false);assert.equal(installed.failure,null);
const expectedRoot=dirname(inputs.manifest.path),members=[],modeDifferences=[];
async function membersAt(root,relative=''){
 const rows=[];
 for(const name of (await readdir(join(root,relative))).sort()){
  const path=join(relative,name),s=await lstat(join(root,path));assert.equal(s.isSymbolicLink(),false,path);
  if(s.isDirectory())rows.push(...await membersAt(root,path));
  else {assert.ok(s.isFile(),path);rows.push({path,mode:s.mode&0o777});}
 }
 return rows;
}
const expected=await membersAt(expectedRoot),actual=await membersAt(inputs.installedRoot);
assert.deepEqual(actual.map(r=>r.path),expected.map(r=>r.path),'installed payload path set matches accepted archive');
for(let i=0;i<expected.length;i++){
 const e=expected[i],a=actual[i],before=await readFile(join(expectedRoot,e.path)),after=await readFile(join(inputs.installedRoot,a.path));
 assert.equal(after.equals(before),true,e.path);
 members.push({path:a.path,sha256:hash(after),byteCount:after.length,mode:a.mode});
 if(a.mode!==e.mode)modeDifferences.push({path:a.path,archiveMode:e.mode,installedMode:a.mode});
}
assert.equal(members.length,5265);
const packageMetadata=JSON.parse(await readFile(join(inputs.installedRoot,'package.json'),'utf8'));
const binPaths=Object.values(packageMetadata.bin).map(path=>path.replace(/^\.\//u,'')).sort();
assert.deepEqual(modeDifferences,binPaths.map(path=>({path,archiveMode:420,installedMode:493})));
for(const f of inputs.fixtures){const b=await readFile(join(inputs.installedRoot,f.relativePath));assert.equal(hash(b),f.sha256);assert.equal(b.length,f.byteCount);}
const lock=JSON.parse(await readFile(join(inputs.installHost,'package-lock.json'),'utf8'));
for(const [path,row] of Object.entries(lock.packages))if(path!==''&&path!=='node_modules/@abiogenesis/typescript-tenant')assert.equal(row.inBundle,true,path+' must be bundled');
const runtime=await installedModules(inputs.installedRoot),manifest=JSON.parse(await readFile(join(inputs.installedRoot,'product-toolchain-manifest.json'),'utf8'));
assert.equal(manifest.productContentDigest,inputs.expectedContentDigest);
assert.equal(runtime.product.sha256Canonical(manifest),inputs.expectedManifestDigest);
await record('installed-members.json',{installedRoot:inputs.installedRoot,memberCount:members.length,members,allArchiveBytesEqual:true,modeDifferences,dependencyPackages:Object.entries(lock.packages).filter(([path])=>path!=='').map(([path,row])=>({path,version:row.version,inBundle:row.inBundle??false,resolved:row.resolved??null})),fixtures:inputs.fixtures});
const clock=performance.now(),native=await verifyArtifact(runtime,{artifactPath:inputs.archive.path,manifest,expectedArtifactDigest:'sha256:'+inputs.archive.sha256},record,'host28');
const verifyWallMs=performance.now()-clock;assert.equal(native.verified.productContentDigest,manifest.productContentDigest);assert.equal(native.verified.manifestDigest,runtime.product.sha256Canonical(manifest));
const contentReadTarget={...native.verified,installedRoot:inputs.installedRoot};
assert.equal(await runtime.product.installedProductContentMatches(contentReadTarget),true,'canonical installed payload currentness predicate');
await record('installed-content-match.json',{owner:'product.installedProductContentMatches',verifiedArtifactDigest:native.verified.artifactDigest,installedRoot:inputs.installedRoot,contentDigest:native.verified.productContentDigest,manifestDigest:native.verified.manifestDigest,matches:true,scope:'Verified artifact expectation projected onto actual physical installed root; no ProductInstall/admission claim'});
const identity={artifactPath:inputs.archive.path,artifactSha256:inputs.archive.sha256,installHost:inputs.installHost,installedRoot:inputs.installedRoot,
 productContentDigest:native.verified.productContentDigest,manifestDigest:native.verified.manifestDigest,verifiedKind:native.verified.kind,verifiedDisposition:native.verified.disposition,
 installedMemberCount:members.length,allArchiveBytesEqual:true,modeDifferences,lockedDependenciesBundledOnly:true,existingDependencyFixtures:inputs.fixtures,
 timings:{installWallMs:installed.wallMs,verifyWallMs},environment:{ABI5_WAVE1_FROZEN_ARTIFACT_PATH:inputs.archive.path,ABI5_WAVE1_FROZEN_INSTALL_HOST:inputs.installHost,ABI5_WAVE1_FROZEN_ARTIFACT_SHA256:inputs.archive.sha256},
 sourceBlindActualInstalledOwner:true,nativeExecution:false,modelExecution:false,scope:'clean host provisioning only; no UAT/qualification/P0 closure'};
await record('exacthost-identity.json',identity);
console.log(JSON.stringify({stage:'host28-verified',verifyWallMs,installWallMs:installed.wallMs,content:identity.productContentDigest,manifest:identity.manifestDigest,members:members.length,modeDifferences}));
