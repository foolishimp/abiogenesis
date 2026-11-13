// Operator-only join of existing immutable setup and actual final returned state; no calls/effects.
import assert from 'node:assert/strict';
import {readFile,stat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
export const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
export const dir=join(base,'single-machine-p1-03');
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const fileSha=p=>new Promise((ok,no)=>{const h=createHash('sha256'),s=createReadStream(p);s.on('data',b=>h.update(b));s.on('error',no);s.on('end',()=>ok(h.digest('hex')))});
const canonical=x=>x===null||typeof x!=='object'?JSON.stringify(x):Array.isArray(x)?'['+x.map(canonical).join(',')+']':'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
export async function pinned(r){assert(r&&r.path&&/^[0-9a-f]{64}$/.test(r.sha256),'pending pin');const b=await readFile(r.path);assert.equal(b.length,r.bytes,r.path);assert.equal(sha(b),r.sha256,r.path);return b;}
export async function loadReuse(){
 const s=JSON.parse(await readFile(join(dir,'ROOT_REUSE_SELECTION.json'),'utf8'));
 assert.equal(s.kind,'single_machine_p1_03_reuse_selection');assert.equal(s.status,'ROOT_SELECTED_REUSE_AND_SOURCE');assert.equal(s.providerDispatch,false);assert(s.rootAuthority&&s.sourceCommit&&s.sourceBaseline&&s.grant,'Root/source freeze pending');
 assert.equal(s.runtimeRoot,join(base,'single-machine-p1-01/runtime-001'));assert.equal(s.worksiteRoot,'/Users/jim/src/apps/abiogenesis-single-machine-p1');assert.equal(s.runId,'single-machine-p1-03');assert.equal(s.recursionBound,4);assert.equal(s.writePathCount,10);assert.equal(s.c2SelectedPaths,963);assert.equal(s.newSourceBasis,'none');assert.deepEqual(s.observations,[]);assert.equal(s.synthesis,null);
 await pinned(s.rootAuthority);await pinned(s.sourceBaseline);await pinned(s.grant);await pinned(s.priorFrozenManifest);
 const original=JSON.parse(await pinned(s.priorSetup)),after=JSON.parse(await pinned(s.priorAfterRunResume)),execution=JSON.parse(await pinned(s.priorExecution));await pinned(s.priorFreshReads);
 assert.equal(execution.receipt.resources.run.ref,s.firstRunRef);assert.equal(execution.execution.exitCode,0,'first Public invocation has not returned normally');
 assert.equal(canonical(after.state.closeHandoff),canonical(execution.receipt.resources.eventResource.closeHandoff),'returned handoff mismatch');
 assert.equal(after.installedRoot,original.installedRoot);assert.equal(canonical(after.workspaceAuthority),canonical(original.workspaceAuthority));assert.equal(canonical(after.state.binding),canonical(original.state.binding));
 const e=s.eventPrefix;assert(e&&e.path,'final physical prefix pending');assert.equal(fileURLToPath(after.state.closeHandoff.prefix.eventLogRef),e.path);assert.equal(after.state.closeHandoff.prefix.prefixLength,e.bytes);assert.equal(after.state.closeHandoff.prefix.prefixDigest,'sha256:'+e.sha256);assert.equal(after.state.closeHandoff.prefix.coordinateDigest,e.coordinateDigest);
 const st=await stat(e.path);assert.equal(st.size,e.bytes);assert.equal(st.dev,e.device);assert.equal(st.ino,e.inode);assert.equal(await fileSha(e.path),e.sha256,'final physical prefix changed');
 assert.equal(await realpath(original.installedRoot),original.installedRoot);
 return {selection:s,retained:{...original,...after,config:{...original.config,runId:s.runId}}};
}
