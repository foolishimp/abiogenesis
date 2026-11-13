// Actual post-setup facts only. Pending bindings refuse before runtime import/effect.
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
export const dir='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-03/budget-retest-01';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const fileSha=p=>new Promise((ok,no)=>{const h=createHash('sha256'),s=createReadStream(p);s.on('data',b=>h.update(b));s.on('error',no);s.on('end',()=>ok(h.digest('hex')))});
export async function pinned(r){assert(r&&r.path&&/^[0-9a-f]{64}$/.test(r.sha256),'pending pin');const b=await readFile(r.path);assert.equal(b.length,r.bytes,r.path);assert.equal(sha(b),r.sha256,r.path);return b;}
export async function loadCallState(){const selection=JSON.parse(await readFile(join(dir,'ROOT_CALL_SELECTION.json'),'utf8'));assert.equal(selection.status,'ROOT_SELECTED_FRESH_TESTING_UAT_CALL');assert.equal(selection.providerDispatch,false);assert(selection.rootAuthority&&selection.sourceBaseline&&selection.priorClosure&&selection.priorConstruction,'closed candidate binding pending');for(const k of ['rootAuthority','sourceBaseline','priorClosure','priorConstruction','setupResume','grant','priorFrozenManifest'])await pinned(selection[k]);const retained=JSON.parse(await pinned(selection.setupResume));assert.equal(selection.runId,'single-machine-p1-03-budget-retest-01');assert.equal(selection.recursionBound,3);assert.equal(selection.writePathCount,0);assert.equal(selection.c2SelectedPaths,963);assert.equal(selection.newSourceBasis,'none');assert.deepEqual(selection.observations,[]);assert.equal(selection.synthesis,null);assert.equal(retained.config.worksiteRoot,selection.worksiteRoot);const e=selection.eventPrefix,p=retained.state.closeHandoff.prefix;assert.equal(fileURLToPath(p.eventLogRef),e.path);assert.equal(p.prefixLength,e.bytes);assert.equal(p.prefixDigest,'sha256:'+e.sha256);assert.equal(p.coordinateDigest,e.coordinateDigest);const st=await stat(e.path);assert.equal(st.size,e.bytes);assert.equal(st.dev,e.device);assert.equal(st.ino,e.inode);assert.equal(await fileSha(e.path),e.sha256);return {selection,retained};}
