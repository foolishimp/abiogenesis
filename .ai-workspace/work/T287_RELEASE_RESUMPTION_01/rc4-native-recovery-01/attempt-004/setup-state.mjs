// Builtin-only reader for a fresh task using the supported final close handoff.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,lstat,realpath} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const dir=fileURLToPath(new URL('.',import.meta.url)).replace(/\/$/u,''),work='/Users/jim/src/apps/abiogenesis-rc4-native-recovery';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export async function json(p){return JSON.parse(await readFile(p,'utf8'));}
export async function pinned(r){const s=await lstat(r.path);assert(s.isFile()&&!s.isSymbolicLink(),r.path);const b=await readFile(r.path);assert.equal(b.length,r.bytes,r.path);assert.equal(sha(b),r.sha256,r.path);return b;}
export async function loadSetup(expectedDigest){
 const raw=await readFile(join(dir,'CALL_PREPARATION_BINDING.json'));assert.equal(sha(raw),expectedDigest);
 const selection=JSON.parse(raw);assert.equal(selection.status,'PREPARED_FOR_ROOT_REVIEW');assert.equal(selection.sourceBasis,'none');
 const admission=await json(join(dir,'ROOT_ADMISSION.json'));
 assert.equal(admission.status,'ROOT_ADMITTED_NEXT_NATIVE_PACKET');assert.equal(admission.bindingSha256,expectedDigest);
 assert.equal(admission.sourceCommit,selection.sourceCommit);assert.equal(admission.operator,'Root');
 for(const r of selection.files)await pinned(r);
 execFileSync(selection.offlineDependency.python,['-I','-B',join(dir,'operator-preflight.py')],{encoding:'utf8',timeout:120000,maxBuffer:2097152});
 const local=selection.operatorClosure.map(r=>r.path);assert.equal(local.length,4);for(const r of selection.operatorClosure)await pinned(r);
 const original=JSON.parse(await pinned(selection.setupResume)),after=JSON.parse(await pinned(selection.afterResume));
 assert.equal(after.installedRoot,original.installedRoot);assert.deepEqual(after.workspaceAuthority,original.workspaceAuthority);
 const retained={...original,state:after.state,installedRoot:after.installedRoot,workspaceAuthority:after.workspaceAuthority,
   config:{...original.config,runId:'rc4-native-recovery-01-attempt-004',sourceCommit:selection.sourceCommit}};
 assert.equal(retained.workspaceAuthority.canonicalRoot,work);
 assert.equal(retained.native.request.expectedArtifactDigest,'sha256:70de04c36e5716fd37d23e00daa37ab9f5bc079f51aec2544f8f0eb1c40649cd');
 assert.equal(await realpath(retained.installedRoot),retained.installedRoot);
 const inventory=JSON.parse(await pinned(selection.nativePayloadInventory));assert.equal(inventory.members,5321);
 assert.equal(inventory.artifactDigest,retained.native.request.expectedArtifactDigest);
 for(const r of inventory.inventory)await pinned({path:join(retained.installedRoot,r.path),bytes:r.bytes,sha256:r.digest.slice(7)});
 const e=selection.eventPrefix,actual=await lstat(e.path);assert.equal(fileURLToPath(retained.state.closeHandoff.prefix.eventLogRef),e.path);
 assert.equal(actual.dev,e.device);assert.equal(actual.ino,e.inode);assert.equal(actual.size,e.bytes);assert.equal(sha(await readFile(e.path)),e.sha256);
 assert.equal(retained.state.closeHandoff.prefix.coordinateDigest,e.coordinateDigest);
 const workload=JSON.parse(await pinned(selection.workload)),profile=JSON.parse(await pinned(selection.profile)),grant=JSON.parse(await pinned(selection.grant));
 for(const r of profile.executables){assert.equal(await realpath(r.configuredPath),r.path);await pinned(r);}
 return {selection,retained,workload,grant,profile,local,bindingDigest:sha(raw)};
}
