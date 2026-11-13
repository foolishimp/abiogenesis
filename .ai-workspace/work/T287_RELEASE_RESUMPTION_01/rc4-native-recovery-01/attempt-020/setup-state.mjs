// Builtin-only exact input/preservation guards. Root alone imports runtime downstream.
import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
const assertSame=(actual,expected,message='Operator identity mismatch')=>assert(isDeepStrictEqual(actual,expected),message);
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,lstat,realpath,readdir,readlink} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
export const dir=fileURLToPath(new URL('.',import.meta.url)).replace(/\/$/u,''),work='/Users/jim/src/apps/abiogenesis-rc4-native-recovery';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export async function json(p){return JSON.parse(await readFile(p,'utf8'));}
export async function pinned(r){const s=await lstat(r.path);assert(s.isFile()&&!s.isSymbolicLink(),r.path);const b=await readFile(r.path);assert.equal(b.length,r.bytes,r.path);assert.equal(sha(b),r.sha256,r.path);return b;}
export function runtimeEnvironment(profile,workerEnvironment,retained){const config={...retained.config,setupEnvironment:profile.runtimeEnvironment,toolchainEnvironment:profile.toolchainEnvironment,provider:profile.provider};return{config,environment:workerEnvironment(config)};}
export function selectProcessEnvironment(environment){for(const k of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(k)||['HOME','PATH','TMPDIR','LANG','LC_ALL','NPM_CONFIG_CACHE'].includes(k))delete process.env[k];Object.assign(process.env,environment);assert.equal(process.env.TMPDIR,'/private/tmp/abiogenesis-rc4-runtime-01');assert.equal(process.env.NPM_CONFIG_CACHE,undefined);}
export async function checkInstalled(selection){const inventory=JSON.parse(await pinned(selection.nativePayloadInventory));assert.equal(inventory.members,5321);for(const r of inventory.inventory)await pinned({path:join(selection.installedRoot,r.path),bytes:r.bytes,sha256:r.digest.slice(7)});for(const r of selection.otherInstalledFiles)await pinned(r);}
export async function checkDependency(selection){const d=selection.offlineDependency;const result=JSON.parse(execFileSync(d.python,['-I','-B',d.script,'--verify'],{encoding:'utf8',timeout:120000,maxBuffer:2097152}));assertSame(result,JSON.parse(await readFile(d.inventory,'utf8')));const l=selection.dependencyLink,st=await lstat(l.path);assert(st.isSymbolicLink());assert.equal(st.dev,l.device);assert.equal(st.ino,l.inode);assert.equal(await readlink(l.path),l.target);return result;}
export async function checkPrefix(selection){const e=selection.eventPrefix,s=await lstat(e.path);assert.equal(s.dev,e.device);assert.equal(s.ino,e.inode);assert.equal(s.size,e.bytes);assert.equal(sha(await readFile(e.path)),e.sha256);}
export async function loadSetup(expectedDigest){
 const raw=await readFile(join(dir,'CALL_PREPARATION_BINDING.json'));assert.equal(sha(raw),expectedDigest);const selection=JSON.parse(raw);assert.equal(selection.sourceBasis,'none');
 const admission=await json(join(dir,'ROOT_ADMISSION.json'));assert.equal(admission.status,'ROOT_ADMITTED_NEXT_NATIVE_PACKET');assert.equal(admission.bindingSha256,expectedDigest);assert.equal(admission.sourceCommit,selection.sourceCommit);assert.equal(admission.operator,'Root');
 for(const r of selection.files)await pinned(r);
 const checkpoint=await json(selection.checkpoint.path);assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),checkpoint.sourceCommit);assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim(),checkpoint.sourceTree);assert.equal(execFileSync('/usr/bin/git',['-C',work,'status','--short','--untracked-files=no'],{encoding:'utf8'}),'');for(const r of checkpoint.preimages)await pinned(r);
 const retained=JSON.parse(await pinned(selection.afterResume));retained.config={...retained.config,runId:'rc4-native-recovery-01-attempt-020',sourceCommit:selection.sourceCommit};
 assert.equal(retained.workspaceAuthority.canonicalRoot,work);assert.equal(retained.installedRoot,selection.installedRoot);assert.equal(await realpath(retained.installedRoot),retained.installedRoot);
 assert.equal(retained.native.request.expectedArtifactDigest,'sha256:70de04c36e5716fd37d23e00daa37ab9f5bc079f51aec2544f8f0eb1c40649cd');await checkInstalled(selection);await checkPrefix(selection);
 assert.equal(retained.state.closeHandoff.prefix.coordinateDigest,selection.eventPrefix.coordinateDigest);
 for(const p of selection.allowedAbsentRoots){try{await lstat(join(work,p));throw Error('Expected absent native-created path exists: '+p)}catch(e){if(e.code!=='ENOENT')throw e;}}
 const link=selection.dependencyLink,ls=await lstat(link.path);assert(ls.isSymbolicLink());assert.equal(ls.dev,link.device);assert.equal(ls.ino,link.inode);assert.equal(await readlink(link.path),link.target);
 const workload=JSON.parse(await pinned(selection.workload)),profile=JSON.parse(await pinned(selection.profile));
 for(const r of profile.executables){assert.equal(await realpath(r.configuredPath),r.path);await pinned({path:r.path,bytes:r.bytes,sha256:r.sha256});}
 assert.equal(profile.provider.command,join(dir,'claude-provider.sh'));assert((await lstat(profile.provider.command)).mode&0o111);
 const t=selection.runtimeTmp,st=await lstat(t.path);assert(st.isDirectory()&&!st.isSymbolicLink());assert.equal(await realpath(t.path),t.path);assert.equal(st.dev,t.device);assert.equal(st.ino,t.inode);assert.equal(st.uid,t.uid);
 const within=(a,b)=>a===b||a.startsWith(b+'/');assert(![work,...selection.protectedRoots,...selection.nativeWritableRoots].some(r=>within(t.path,r)||within(r,t.path)));
 try{await lstat(t.lockPath);throw Error('Runtime lease already present')}catch(e){if(e.code!=='ENOENT')throw e;}
 for(const pid of selection.knownStoppedPids){try{process.kill(pid,0);throw Error('Prior actor live: '+pid)}catch(e){if(e.code!=='ESRCH')throw e;}}
 const processes=execFileSync('/bin/ps',['-axo','pid=,command='],{encoding:'utf8'}).split('\n');assert.equal(processes.filter(r=>r.includes(work)||r.includes(join(selection.installedRoot,'build/code/src/public/cli.js'))).length,0,'Prior worksite/runtime process remains');
 const leaf=profile.existingLeafTmp,leafStat=await lstat(leaf.path);assert(leafStat.isDirectory()&&!leafStat.isSymbolicLink());assert.equal(await realpath(leaf.path),leaf.path);assert.equal(leafStat.dev,leaf.device);assert.equal(leafStat.ino,leaf.inode);assertSame(await readdir(leaf.path),leaf.members);assert.equal(profile.providerScratch.TMPDIR,leaf.path);assert.equal(profile.providerScratch.NPM_CONFIG_CACHE,leaf.path);
 await checkDependency(selection);
 const local=selection.operatorClosure.map(r=>r.path);assert.equal(local.length,4);
 return{selection,retained,workload,profile,local,bindingDigest:sha(raw)};
}

export async function assertSelectedC2Files(workload,observed){
 assert.equal(observed.kind,'worksite_context_observation','C2 selection requires actual owner observation');
 const entries=new Map(observed.entries.map(e=>[e.relativePath,e]));
 const pairs=[];for(const relativePath of workload.testing.selectedPaths){
  const entry=entries.get(relativePath);assert(entry?.state==='file','Selected C2 path missing from actual observed files: '+relativePath);
  const bytes=await readFile(join(work,relativePath));assert.equal(entry.digest,'sha256:'+sha(bytes),'Selected C2 file differs from actual observation: '+relativePath);
  pairs.push({path:relativePath,digest:entry.digest,bytes:bytes.length});
 }return pairs;
}
