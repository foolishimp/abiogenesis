import assert from 'node:assert/strict';
import {lstat, realpath} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';

// Operator observation for this isolated layout. It grants no Product effect.
// Every planned path must descend from an existing anchor; positive separation
// uses complete directory-identity ancestor chains, never distinct path strings.
export async function physicalPath(path) {
  const declared=resolve(path); assert.equal(path,declared,'lexical canonical path');
  let cursor=declared; const missing=[];
  for (;;) {
    try { await lstat(cursor); break; }
    catch(e) { if(e.code!=='ENOENT')throw e; const parent=dirname(cursor); assert.notEqual(parent,cursor); missing.unshift(cursor.slice(parent.length+1)); cursor=parent; }
  }
  const status=await lstat(cursor); assert(!status.isSymbolicLink(),'no symlink anchor');
  assert.equal(await realpath(cursor),cursor,'stored spelling');
  assert(status.isDirectory()||status.isFile(),'ordinary node');
  if(status.isFile())assert.equal(status.nlink,1,'one physical file link');
  const anchor=status.isDirectory()?cursor:dirname(cursor), ancestors=[];
  for(let at=anchor;;at=dirname(at)) {
    const s=await lstat(at,{bigint:true}); assert(s.isDirectory()&&!s.isSymbolicLink(),'concrete ancestor');
    assert.equal(await realpath(at),at,'stored ancestor spelling');
    ancestors.push({path:at,identity:`${s.dev}:${s.ino}`}); if(dirname(at)===at)break;
  }
  return {path:declared,existing:cursor,kind:status.isDirectory()?'directory':'file',missing,anchor,ancestors};
}
function separated(a,b) {
  const left=a.ancestors[0].identity,right=b.ancestors[0].identity;
  return !a.ancestors.some(x=>x.identity===right)&&!b.ancestors.some(x=>x.identity===left);
}
export async function observeTopology({worksite,writePaths,protectedRoots,archiveRoot}) {
  const A=await physicalPath(worksite), writes=await Promise.all(writePaths.map(physicalPath));
  const protectedRows=await Promise.all([...new Set(protectedRoots)].map(physicalPath));
  const archive=await physicalPath(archiveRoot);
  for(const w of writes) {
    assert(w.ancestors.some(a=>a.identity===A.ancestors[0].identity),'W physically under A');
    for(const p of protectedRows)assert(separated(w,p),`unproved W/protected separation: ${w.path} / ${p.path}`);
  }
  for(const p of protectedRows)if(p.path!==archiveRoot)assert(separated(archive,p),`unproved archive/protected separation: ${p.path}`);
  return {kind:'operator_physical_topology_observation',worksite:A,writes,protectedRoots:protectedRows,archive,
    claim:'Existing-anchor physical ancestry separates this finite W and archive from protected roots; trusted stable local namespace only, no general RC13 confinement or adversarial-race claim.'};
}
