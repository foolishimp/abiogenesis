// Read-only external caller checks. No staging, owner mutation or authority construction.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, relative, isAbsolute, dirname} from 'node:path';
const sha = b => createHash('sha256').update(b).digest('hex');
export function assertRetainedEnvironment(current, retained, slots, prefix) {
  assert.equal(current.kind, 'exact_prefix_workspace_environment');
  assert.deepEqual(current.prefix, prefix);
  // Prefix/projection identities advance; admitted environment values do not.
  for (const key of ['kind','schemaVersion','workspaceAuthorityBasis','workspaceBindingCandidate','workspaceBinding','productInstalls','resolvedProductLock','productSet']) assert.deepEqual(current[key], retained.projection[key], key);
  assert.deepEqual(current.artifactTruth.rows, retained.projection.artifactTruth.rows, 'same admitted artifact owner rows');
  assert.deepEqual(slots.workspaceBinding, {ref:current.workspaceBinding.bindingId,digest:current.workspaceBinding.bindingDigest});
  assert.deepEqual(slots.workspaceAuthority, current.workspaceAuthorityBasis);
  assert.deepEqual(slots.admittedInstalls, current.productInstalls);
  assert.deepEqual(slots.resolvedLock, {ref:current.resolvedProductLock.lockId,digest:current.resolvedProductLock.lockDigest});
  assert.equal(slots.catalog.digest, retained.catalog.basisDigest);
  assert.equal(slots.catalogView.digest, retained.catalogView.viewDigest);
  assert.equal(retained.catalogView.catalogBasisDigest,retained.catalog.basisDigest);
  assert.equal(retained.catalog.workspaceBindingId,current.workspaceBinding.bindingId);
  assert.equal(retained.catalog.workspaceBindingDigest,current.workspaceBinding.bindingDigest);
  assert.equal(retained.catalog.lockId,current.resolvedProductLock.lockId);
  assert.equal(retained.catalog.lockDigest,current.resolvedProductLock.lockDigest);
}
export async function checkExistingInputs(root, files, targets) {
  assert.equal(await fs.realpath(root), root, 'canonical workspace root');
  assert.deepEqual(files.map(f=>f.target), targets);
  assert.equal(new Set(targets).size, files.length, 'unique selected targets');
  const observations=[];
  for (const f of files) {
    const target=resolve(root,f.target), rel=relative(root,target);
    assert.ok(rel&&!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('../')&&rel!=='.abiogenesis'&&!rel.startsWith('.abiogenesis/'), 'confined selected input');
    assert.equal(rel,f.target, 'canonical relative target');
    let parent=dirname(target);
    while(parent!==root){const s=await fs.lstat(parent);assert.ok(s.isDirectory()&&!s.isSymbolicLink());assert.equal(await fs.realpath(parent),parent);parent=dirname(parent);}
    const before=await fs.lstat(target);assert.ok(before.isFile()&&!before.isSymbolicLink(), 'regular selected input');assert.equal(await fs.realpath(target),target, 'no selected alias');
    const [bytes,origin]=await Promise.all([fs.readFile(target),fs.readFile(f.origin)]),after=await fs.lstat(target);
    assert.equal(after.dev,before.dev);assert.equal(after.ino,before.ino);assert.equal(after.size,before.size);assert.equal(after.mtimeMs,before.mtimeMs);assert.ok(after.isFile()&&!after.isSymbolicLink());
    assert.equal(origin.length,f.bytes);assert.equal(sha(origin),f.sha256,'selected origin digest');
    assert.equal(bytes.length,f.bytes);assert.equal(sha(bytes),f.sha256,'existing target digest');
    observations.push({target:f.target,path:target,device:after.dev,inode:after.ino,bytes:bytes.length,sha256:sha(bytes)});
  }
  return {status:'passed',root,count:files.length,bytes:observations.reduce((n,o)=>n+o.bytes,0),canonicalRegularFiles:true,originsAndTargetsExact:true,writes:0,observations};
}
