// Builtin-only authenticated fresh setup reader; no ABI import or execution.
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
 const raw=await readFile(join(dir,'CALL_PREPARATION_BINDING.json'));if(expectedDigest!==undefined)assert.equal(sha(raw),expectedDigest);
 const selection=JSON.parse(raw);assert.equal(selection.kind,'rc4_native_recovery_call_preparation_binding');assert.equal(selection.status,'ROOT_AUTHORIZED_FRESH_SETUP_CALL_PREPARATION');assert.equal(selection.sourceBasis,'none');
 const files=new Map(selection.files.map(r=>[r.path,r]));assert(files.has(fileURLToPath(import.meta.url)));
 for(const r of selection.files)await pinned(r);
 const local=['public-setup.mjs','runner.mjs','consumer.mjs','scenarios.mjs'].map(n=>resolve(dir,'../rc3-dogfood-01/operator-client',n));assert(local.every(p=>files.has(p)),'operator executable closure missing');
 assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),selection.sourceCommit);
 execFileSync('/usr/bin/git',['-C',work,'diff','--quiet']);execFileSync('/usr/bin/git',['-C',work,'diff','--cached','--quiet']);
 const grant=JSON.parse(await pinned(selection.grant));assert.equal(grant.status,'ROOT_ADMITTED_SETUP_SELECTED_NOT_EXECUTED');
 for(const r of grant.Construction.preimages)await pinned({...r,path:join(work,r.path)});
 const material=JSON.parse(await pinned(selection.materialization));for(const r of material.rows)await pinned({path:join(work,r.target),bytes:r.bytes,sha256:r.sha256});
 const resourceMaterial=JSON.parse(await pinned(selection.resourceMaterialization));await pinned(resourceMaterial.source);await pinned(resourceMaterial.target);
 const retained=JSON.parse(await pinned(selection.setupResume));const summary=JSON.parse(await pinned(selection.setupSummary));assert.equal(summary.status,'fresh_rc3_setup_completed_not_dispatched');assert.equal(summary.providerCalls,0);
 assert.equal(retained.config.runId,'rc4-native-recovery-01');assert.equal(retained.native.request.expectedArtifactDigest,'sha256:70de04c36e5716fd37d23e00daa37ab9f5bc079f51aec2544f8f0eb1c40649cd');assert.equal(retained.native.request.expectedManifestDigest,'sha256:8e2230b5821c7f16df3db968862ee26e0306a845759d0d5b9a4f4cc0e498ef89');
 assert.equal(retained.installedRoot,join(dir,'runtime-001/sandbox/installed/abg/node_modules/@abiogenesis/typescript-tenant'));assert.equal(await realpath(retained.installedRoot),retained.installedRoot);
 // Existing owner-install custody is reused by reference to authenticate the fresh same-artifact payload.
 const inventory=JSON.parse(await pinned(selection.nativePayloadInventory));assert.equal(inventory.members,5321);assert.equal(inventory.artifactDigest,retained.native.request.expectedArtifactDigest);
 for(const r of inventory.inventory)await pinned({path:join(retained.installedRoot,r.path),bytes:r.bytes,sha256:r.digest.slice(7)});
 const e=selection.eventPrefix,actual=await lstat(e.path);assert.equal(fileURLToPath(retained.state.closeHandoff.prefix.eventLogRef),e.path);assert.equal(actual.dev,e.device);assert.equal(actual.ino,e.inode);assert.equal(actual.size,e.bytes);assert.equal(sha(await readFile(e.path)),e.sha256);assert.equal(retained.state.closeHandoff.prefix.coordinateDigest,e.coordinateDigest);
 const workload=JSON.parse(await pinned(selection.workload)),profile=JSON.parse(await pinned(selection.profile));assert.equal(workload.testing.selectedPaths.length,966);assert.equal(workload.readRoots.length,980);assert.equal(workload.testing.commands.length,9);assert.deepEqual(workload.workOrders.construction.writeRoots,grant.Construction.writePaths);assert(Object.entries(workload.workOrders).every(([r,v])=>r==='construction'||v.writeRoots.length===0));
 for(const r of profile.executables){assert.equal(await realpath(r.configuredPath),r.path);await pinned(r);}
 return {selection,retained,workload,grant,profile,local,bindingDigest:sha(raw)};
}
