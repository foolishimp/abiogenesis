// Reuse the installed Product's Context observer; never claim a preflight rerun.
import assert from 'node:assert/strict';
import {readFile,lstat,realpath} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {installedModules} from '../operator-client/public-setup.mjs';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01',dir=join(base,'increment-b-05');
const sha=b=>createHash('sha256').update(b).digest('hex'),work='/Users/jim/src/apps/abiogenesis-rc3-dogfood';
const setup=JSON.parse(await readFile(join(base,'setup-001/operator-resume-material.json'),'utf8'));
const prior=JSON.parse(await readFile(join(base,'attempt-006/after-run-resume.json'),'utf8'));
const retained=JSON.parse(await readFile(join(dir,'RETAINED_PREFLIGHT_AUTHORITY.json'),'utf8'));
const p=JSON.parse(await readFile(join(dir,'model-free-preflight.json'),'utf8')),wraw=await readFile(join(dir,'workload.json')),w=JSON.parse(wraw);
const census=JSON.parse(await readFile(join(dir,'snapshot-census.json'),'utf8')),custody=JSON.parse(await readFile(join(dir,'B04_SOURCE_CUSTODY.json'),'utf8'));
const physical=JSON.parse(await readFile(join(dir,'PHYSICAL_BOUNDARY.json'),'utf8'));
assert.equal(p.kind,'rc3_b05_model_free_preflight');assert.equal(p.status,'prepared_not_dispatched');assert.equal(sha(wraw),p.workloadSha256);
assert.equal(execFileSync('/usr/bin/git',['rev-parse','HEAD'],{cwd:work,encoding:'utf8'}).trim(),census.sourceCommit);
const changes=execFileSync('/usr/bin/git',['status','--porcelain=v1','-z','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],{cwd:work,encoding:'utf8'}).split('\0').filter(Boolean).map(s=>s.slice(3)).sort();
assert.deepEqual(changes,custody.rows.filter(r=>r.gitStatus!=='  ').map(r=>r.path).sort());
for(const row of physical.rows){
 const s=await lstat(row.path);assert(!s.isSymbolicLink());assert.equal(await realpath(row.path),row.path);
 assert.equal(s.dev,row.device);assert.equal(s.ino,row.inode);assert.equal(row.kind==='file'?s.isFile():s.isDirectory(),true);
 if(row.sha256!==undefined)assert.equal(sha(await readFile(row.path)),row.sha256);
}
assert.equal(retained.workspaceBinding.bindingId,prior.state.binding.ref);assert.equal(retained.workspaceBinding.bindingDigest,prior.state.binding.digest);
assert.equal(retained.workspaceAuthorityBasis.authorityBasisId,prior.workspaceAuthority.authorityBasisId);
assert.equal(retained.workspaceAuthorityBasis.authorityBasisDigest,prior.workspaceAuthority.authorityBasisDigest);
const {product}=await installedModules(setup.installedRoot);
const manifest=JSON.parse(await readFile(join(setup.installedRoot,'product-toolchain-manifest.json'),'utf8'));
assert.equal(product.sha256Canonical(manifest),setup.native.request.expectedManifestDigest);
for(const install of setup.setup.installations)assert(await product.installedProductContentMatches(install),'selected installed Product changed');
const observed=await product.observeWorksiteContext({workspaceAuthorityBasis:retained.workspaceAuthorityBasis,workspaceBinding:retained.workspaceBinding,
 protectedInstallRoots:retained.protectedInstallRoots,readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
assert.equal(observed.kind,'worksite_context_observation');assert.equal(observed.observationDigest,p.contextDigest);
assert.equal(observed.observationDigest,retained.matchedPreflightContextDigest);
assert.equal(observed.entries.length,Object.keys(census.rows).length);
for(const [path,row] of Object.entries(census.rows)){
 const actual=observed.entries.find(e=>e.relativePath===path);assert(actual,path);assert.equal(actual.state,row.state,path);
 if(row.state==='file'){assert.equal(actual.digest,'sha256:'+row.sha256,path);assert.equal(actual.byteLength,row.bytes,path)}
}
console.log(JSON.stringify({kind:'retained_actual_preflight_validated_against_unchanged_inputs',status:'validated',
 workloadSha256:sha(wraw),contextDigest:observed.observationDigest,paths:observed.entries.length,
 limits:['The successful actual preflight was not rerun','This is not native B05 admission; the native invocation performs its own owner/currentness checks']}));
