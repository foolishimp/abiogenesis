// C2 operator recipe over its actual materialized candidate. No replacement owner.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const repo=process.cwd(),tenant=join(repo,'build_tenants/abiogenesis/typescript');
const input=join(repo,'rc5-operator-inputs/method-01'),release=join(input,'stdo-3.0.4');
const hash=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const {DEFAULT_LIBRARY_STDO_SOURCE:source}=await import(pathToFileURL(join(tenant,'build/code/src/gtl/default_library.js')));
assert.equal(source.basisRef,'stdo://releases/v3.0.4/');
assert.equal(source.manifestDigest,'sha256:102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b');
// Only the compiled candidate's declared members are materialized. The existing
// product generator authenticates membership, spans and generated declarations.
for(const member of [source.manifest,...Object.values(source.members)]){
  assert(!member.path.startsWith('/')&&!member.path.split('/').includes('..'));
  assert(member.assetPath.startsWith('contracts/default-library/stdo/'));
  const b=await readFile(join(release,member.path));assert.equal(b.length,member.byteCount);
  assert.equal(hash(b),member===source.manifest?source.manifestDigest:member.digest);
  const target=join(tenant,member.assetPath);await mkdir(dirname(target),{recursive:true});await writeFile(target,b);
}
const run=(args,options={})=>{
  const result=spawnSync(process.execPath,args,{cwd:tenant,env:process.env,stdio:'inherit',...options});
  assert.equal(result.signal,null);assert.equal(result.status,0,'C2 command failed: '+args.join(' '));
};
run(['scripts/generate-qualification-rule-catalog.mjs','--stage-authorities',repo,release]);
run(['scripts/generate-product-manifest.mjs']);
const method=async root=>{const m=JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));return {
  releaseRef:'stdo://releases/'+m.release.cut+'/',methodVersion:m.release.cut.slice(1),installedManifestDigest:hash(await readFile(join(root,'manifest.json'))),memberSetDigest:'sha256:'+m.standards.member_set_sha256};};
const retained={sourceRoot:join(input,'retained-source'),releaseRoot:join(input,'stdo-3.0.2')};
const selected={sourceRoot:repo,releaseRoot:release};
retained.expectedMethod=await method(retained.releaseRoot);selected.expectedMethod=await method(selected.releaseRoot);
const fixtures={retainedRC1:retained,selectedRC2:selected,retained,selected,
  meaning:'Legacy test keys retainedRC1/selectedRC2; actual controls are exact RC4 source STDO3.0.2 and current RC5 candidate STDO3.0.4.'};
await mkdir(join(tenant,'artifacts'),{recursive:true});const fixtureFile=join(tenant,'artifacts/stdo-stage-fixtures.json');
await writeFile(fixtureFile,JSON.stringify(fixtures,null,2)+'\n');
const env={...process.env,ABG_QUALIFICATION_STAGE_FIXTURES:fixtureFile,ABG_QUALIFICATION_SOURCE_ROOT:repo,ABG_QUALIFICATION_RELEASE_ROOT:release};
run(['--experimental-vm-modules','--test','--test-concurrency=1','--test-name-pattern=default role content|RC5 STDO 3.0.4',
 'test_env/tests/t287-default-library.test.mjs'],{env});
run(['--experimental-vm-modules','--test','--test-concurrency=1',
 'test_env/tests/t287-stdo3-run-environment.test.mjs','test_env/tests/t287-qualification-law.test.mjs'],{env});
const authority=JSON.parse(await readFile(join(tenant,'contracts/qualification/authority-inputs.json'),'utf8'));
assert.equal(authority.method.releaseRef,source.basisRef);assert.equal(authority.method.installedManifestDigest,source.manifestDigest);
const report={kind:'rc5_method_staging_candidate_proof',sourceBasis:source.basisRef,manifestDigest:source.manifestDigest,
  declaredMembers:Object.values(source.members).map(m=>({path:m.path,digest:m.digest,byteCount:m.byteCount})),
  method:authority.method,qualification:false,legacyControl:retained.expectedMethod,
  limit:'Selected staging/context/qualification-input tests; no whole-candidate qualification or new provider proof.'};
await writeFile(join(tenant,'artifacts/rc5-method-proof.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
