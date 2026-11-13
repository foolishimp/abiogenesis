// RC11 preparation adapted from the pinned RC10 local-cut controls. Execution requires separate Root phase binding.
// No Product implementation, qualification, M coordination writes or automatic retry.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {readFile,writeFile,mkdir,lstat,realpath,copyFile,chmod,unlink,statfs,readlink,cp,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,isAbsolute,resolve,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
// Canonical command custody and toolchain remain referenced existing owners.
const here=dirname(fileURLToPath(import.meta.url));
const T='build_tenants/abiogenesis/typescript';
const VERSION='5.0.0-rc.11';
const hex=b=>createHash('sha256').update(b).digest('hex');
async function pin(path){const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink(),path);const b=await readFile(path);return {path,bytes:b.length,sha256:hex(b)};}
async function checked(r){assert(r&&isAbsolute(r.path)&&Number.isSafeInteger(r.bytes)&&/^[a-f0-9]{64}$/.test(r.sha256),'unbound/invalid file pin');assert.deepEqual(await pin(r.path),r);return readFile(r.path);}
async function jsonPin(r){return JSON.parse(await checked(r));}
async function absent(p){try{await lstat(p);throw Error('preserved allocation/collision: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
function rel(p){assert(typeof p==='string'&&p&&!isAbsolute(p)&&!p.includes('\\')&&!p.split('/').some(x=>!x||x==='.'||x==='..'||x==='.git'),p);return p;}
async function safeTarget(root,p){rel(p);let at=root;for(const part of p.split('/').slice(0,-1)){at=join(at,part);try{const s=await lstat(at);assert(s.isDirectory()&&!s.isSymbolicLink(),at);}catch(e){if(e.code!=='ENOENT')throw e;await mkdir(at);}}const dest=join(root,p);try{const s=await lstat(dest);assert(s.isFile()&&!s.isSymbolicLink(),dest);}catch(e){if(e.code!=='ENOENT')throw e;}return dest;}
assert.equal(process.argv.length,5,'usage: node run-clean-reproduction.mjs reproduce ROOT_BINDINGS.json SHA256_HEX');
const [phase,input,inputSha]=process.argv.slice(2);assert.equal(phase,'reproduce');
const raw=await readFile(resolve(input));assert.equal(hex(raw),inputSha);const b=JSON.parse(raw);
assert.equal(b.status,'ROOT_SELECTED_LOCAL_RC11_REPRODUCTION_ONLY','future binding/activation still unbound');
assert.equal(b.executionEnabled,true,'execution is held');
await checked(b.activation);for(const r of b.preservationPins)await checked(r);await checked(b.dependencyMetadata);await checked(b.dependencyCopyHelper);
const prep=await jsonPin(b.preparationManifest);assert.equal(prep.status,'PREPARED_UNBOUND_NO_EXECUTION');assert.equal(prep.controlRevision,'rc11-metadata-bound-reproduction-only-003');
for(const p of prep.files)await checked(p);
const own=JSON.parse(await readFile(join(here,'OWNER_AND_TOOL_PINS.json'),'utf8'));
assert.equal(own.builderArchive.sha256,'1354b327f4288530223181b5968b43b87a530ec048cddee5a86d984f04ae4fb9');await checked(own.builderArchive);
for(const p of own.canonicalCommandOwner)await checked(p);await checked(own.builderPin);
for(const p of own.tools){assert.equal(await realpath(p.configuredPath),p.realPath);await checked({path:p.realPath,bytes:p.bytes,sha256:p.sha256});}
assert.equal(await realpath(process.execPath),own.tools.find(x=>x.name==='node').realPath);
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(own.canonicalCommandOwner[0].path));
await checked({path:own.dependencyCopyPython.path,bytes:own.dependencyCopyPython.bytes,sha256:own.dependencyCopyPython.sha256});
const tool=name=>own.tools.find(x=>x.name===name).configuredPath;
const save=(root,name,value)=>exclusiveRecord(root,name,value);
const p=own.paths, W=p.worktree, O=p.output;
const env={HOME:'/Users/jim',PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',CI:'1',GIT_TERMINAL_PROMPT:'0',GIT_OPTIONAL_LOCKS:'0',TMPDIR:join(p.temp,'tmp'),NODE_OPTIONS:'--max-old-space-size=8192',npm_config_userconfig:join(p.temp,'npm-user.npmrc'),npm_config_globalconfig:join(p.temp,'npm-global.npmrc'),npm_config_cache:join(p.temp,'npm-cache'),npm_config_offline:'true',npm_config_ignore_scripts:'true',npm_config_audit:'false',npm_config_fund:'false'};
const build=b;
assert.equal(build.source.sourceDigest,'cfd7ead1bf29c9c1eed0c97ff9e8e30fccb170d89f1f11cc2bfe4f9c90067b6c');assert.deepEqual(build.paths,p);assert.equal(build.nodeHeapMiB,8192);assert.equal(build.maxOutputBytes,67108864);
const ceilings={git:120000,dependencies:120000,compile:240000,generate:600000,pack:120000,inventory:120000,install:1200000,installedOwner:900000};
for(const [k,v] of Object.entries(ceilings))assert(Number.isInteger(build.boundsMs[k])&&build.boundsMs[k]>0&&build.boundsMs[k]<=v,k);
async function reserve(){const s=await statfs(p.repository);assert(s.bavail*s.bsize>=4294967296,'4 GiB free-space reserve: stop, preserve custody, no retry');return s.bavail*s.bsize;}
async function openCommands(root){const command=commandRecorder(root,{environment:env,maxOutputBytes:build.maxOutputBytes});return async(label,exe,args,cwd=W,kind='git')=>{await reserve();const r=await command(label,exe,args,{cwd,environment:env,timeoutMs:build.boundsMs[kind]});assert(!r.timedOut&&!r.truncated&&!r.failure&&r.exitCode===0&&r.signal===null,'command failed; retained original receipt: '+label);await reserve();return r;};}
const gitArgs=(root,args)=>['-C',root,'-c','core.hooksPath=/dev/null',...args];
async function preserved(run,label){
 const root=p.repository,head=(await run(label+'-main-head',tool('git'),gitArgs(root,['rev-parse','HEAD']),root)).stdout.trim();
 assert.equal(head,build.source.mainCommit,'main moved: return to Root');
 const indexPath=(await run(label+'-main-index',tool('git'),gitArgs(root,['rev-parse','--git-path','index']),root)).stdout.trim();
 const changed=(await run(label+'-main-tracked-paths',tool('git'),gitArgs(root,['diff','HEAD','--name-only','-z']),root)).stdout.split('\0').filter(Boolean).sort();
 const tracked=[];for(const relativePath of changed){rel(relativePath);tracked.push({relativePath,...await pin(join(root,relativePath))});}
 await checked(own.builderArchive);await verifyInputInventory(own.contractSeedInventory);
 return {root,head,index:await pin(resolve(root,indexPath)),trackedChanges:tracked,immutableRC10Archive:own.builderArchive};
}
async function sourceRows(){await checked(build.source.subject);const observed=await jsonPin(build.source.inventory);const inv={...observed,files:observed.files??observed.rows?.map(r=>({relativePath:r.path,sourceSnapshot:join(observed.frozenRoot,r.path),bytes:r.bytes,sha256:r.sha256}))};assert(Array.isArray(inv.files)&&inv.files.length>0);if(observed.sourceDigest!==undefined)assert.equal(observed.sourceDigest,build.source.sourceDigest);assert(/^[a-f0-9]{40}$/.test(build.source.baseCommit)&&/^[a-f0-9]{40}$/.test(build.source.baseTree));const selection=await jsonPin(build.source.selection);assert.equal(selection.sourceDigest,build.source.sourceDigest);assert.deepEqual(selection.selectedPaths,build.source.expectedChangedPaths);assert.deepEqual(selection.expectedNewPaths,build.source.expectedNewPaths);assert.deepEqual(selection.deletedPaths,build.source.deletedPaths);assert(selection.fileModes&&typeof selection.fileModes==='object');assert.equal(selection.defaultFileMode,'100644');assert.equal(observed.sourceRoot,W);assert.equal(observed.frozenRoot,build.source.frozenRoot);assert(Array.isArray(build.source.deletedPaths));await checked(build.source.cumulativeSourceCoverageDisposition);assert.equal(build.qualified,false);assert.equal(build.unitPassed,false);assert.equal(build.m5QualificationBlockerOpen,true);await checked(build.rootDebtRegistration);const seen=new Set();for(const r of inv.files){rel(r.relativePath);assert(!seen.has(r.relativePath));seen.add(r.relativePath);await checked({path:r.sourceSnapshot,bytes:r.bytes,sha256:r.sha256});}for(const [name,mode] of Object.entries(selection.fileModes)){assert(seen.has(name));assert(['100644','100755'].includes(mode));}for(const r of build.source.deletedPaths){rel(r.relativePath);assert(!seen.has(r.relativePath));assert(/^[a-f0-9]{64}$/.test(r.beforeSha256));}return inv.files;}
async function conserve(rows,root,identity){const selection=await jsonPin(build.source.selection);for(const r of rows){assert.equal((await lstat(join(root,r.relativePath))).mode&0o111?"100755":"100644",(selection.fileModes[r.relativePath]??selection.defaultFileMode),"source mode differs: "+r.relativePath);const q=await pin(join(root,r.relativePath));const expected=identity?.find(x=>x.relativePath===r.relativePath)?.after;assert.equal(q.sha256,expected?.sha256??r.sha256,r.relativePath);assert.equal(q.bytes,expected?.bytes??r.bytes,r.relativePath);}for(const r of build.source.deletedPaths)await absent(join(root,r.relativePath));}
async function checkBuildInputs(){
  for(const key of ['source','targetedProof','unitDisposition','remainingProof'])await checked(build.acceptance[key]);
  assert.equal(build.metadata.toVersion,VERSION);assert.equal(build.metadata.rewriteIdentity,false);
  await verifyInputInventory(own.dependencyInventory);await verifyInputInventory(own.contractSeedInventory);await checked(own.builderArchive);
  await checked(build.source.testedArchive);await checked(build.source.testedManifest);const relation=await jsonPin(build.source.testedArchiveSourceRelation);assert.equal(relation.sourceDigest,build.source.sourceDigest);assert.deepEqual(relation.archive,build.source.testedArchive);const testedInputs=await jsonPin(build.source.testedBuildInputs);assert.deepEqual(testedInputs.dependencyInventory,own.dependencyInventory);assert.deepEqual(testedInputs.contractSeedInventory,own.contractSeedInventory);assert.equal(testedInputs.allOriginalSourceBytesEqual,true);
  assert(Array.isArray(build.source.expectedChangedPaths)&&build.source.expectedChangedPaths.length===14);for(const p of build.source.expectedChangedPaths){rel(p);assert(!p.split('/').some(x=>x==='.abiogenesis'||x==='qualification-scratch'),'operator/progress path is not selected source: '+p);}assert.equal(new Set(build.source.expectedChangedPaths).size,build.source.expectedChangedPaths.length);
  assert(Array.isArray(build.source.expectedNewPaths));for(const p of build.source.expectedNewPaths){rel(p);assert(build.source.expectedChangedPaths.includes(p),p);}assert.equal(new Set(build.source.expectedNewPaths).size,build.source.expectedNewPaths.length);
}

// Match the actual frozen stage closure: exact source, full offline dependencies,
// and only absent RC10 contract seed assets. No Product identity rewriting.
async function verifyInputInventory(record,override){
 const inv=await jsonPin(record),root=override??inv.root;assert(Array.isArray(inv.rows)&&inv.rows.length>0);
 const actualPaths=[];async function inventoryPaths(dir,prefix=''){for(const name of await readdir(dir)){const path=prefix+name,st=await lstat(join(dir,name));if(st.isDirectory()&&!st.isSymbolicLink())await inventoryPaths(join(dir,name),path+'/');else actualPaths.push(path);}}
 await inventoryPaths(root);assert.deepEqual(actualPaths.sort(),inv.rows.map(r=>r.path).sort(),'input inventory has missing or additional files');
 for(const r of inv.rows){const file=join(root,rel(r.path)),st=await lstat(file);
  if(r.kind==='symlink'){assert(st.isSymbolicLink());assert.equal(await readlink(file),r.target);const target=relative(await realpath(root),await realpath(file));assert(target&&!target.startsWith('..')&&!isAbsolute(target),'dependency link escapes');}
  else{assert(st.isFile()&&!st.isSymbolicLink());const actual=await pin(file);assert.equal(actual.bytes,r.bytes,file);assert.equal(actual.sha256,r.sha256,file);}}
 return inv;
}
async function checkReproductionInputs(rows,root,sourceCommit){
 await conserve(rows,root);await verifyInputInventory(own.dependencyInventory);await verifyInputInventory(own.contractSeedInventory);
 await save(O,'REPRODUCTION_INPUTS_VERIFIED.json',{status:'EXACT_FROZEN_INPUTS_PRESENT_BEFORE_COMPILE',sourceCommit,sourceInventory:build.source.inventory,sourceDigest:build.source.sourceDigest,sourceRows:rows.length,dependencyInventory:own.dependencyInventory,contractSeedInventory:own.contractSeedInventory,sourceWins:true});
}
async function compilePack(run,label,root){
 const tenant=join(root,T);await absent(join(tenant,'build'));await absent(join(tenant,'node_modules'));await absent(join(tenant,'artifacts'));
 const dep=await verifyInputInventory(own.dependencyInventory),seed=await verifyInputInventory(own.contractSeedInventory);
 await run(label+'-dependencies',own.dependencyCopyPython.path,[build.dependencyCopyHelper.path,'copy',build.dependencyMetadata.path,build.dependencyMetadata.sha256,join(tenant,'node_modules')],root,'dependencies');await verifyInputInventory(own.dependencyInventory,join(tenant,'node_modules'));
 const seeded=[];for(const r of seed.rows){assert.equal(r.kind,'file');const dest=join(tenant,'contracts',rel(r.path));let exists=true;try{await lstat(dest);}catch(e){if(e.code!=='ENOENT')throw e;exists=false;}if(!exists){await mkdir(dirname(dest),{recursive:true});await copyFile(join(seed.root,r.path),dest,constants.COPYFILE_EXCL);seeded.push(r);}}
 const tested=await jsonPin(build.source.testedBuildInputs);assert.deepEqual(seeded,tested.appliedAbsentSeeds,'clean reproduction seed closure differs from measured stage');
 await save(O,'REPRODUCTION_BUILD_INPUTS.json',{dependencyInventory:own.dependencyInventory,contractSeedInventory:own.contractSeedInventory,seededContracts:seeded,sourceWins:true,productRuntimeImportsFromDependencyCheckout:false});
 await run(label+'-compile',tool('node'),['node_modules/typescript/bin/tsc','-p','tsconfig.json'],tenant,'compile');await run(label+'-metadata-before-generator',own.dependencyCopyPython.path,[build.dependencyCopyHelper.path,'verify',build.dependencyMetadata.path,build.dependencyMetadata.sha256,join(tenant,'node_modules')],root,'dependencies');await run(label+'-generate',tool('node'),['scripts/generate-product-manifest.mjs'],tenant,'generate');await run(label+'-metadata-before-pack',own.dependencyCopyPython.path,[build.dependencyCopyHelper.path,'verify',build.dependencyMetadata.path,build.dependencyMetadata.sha256,join(tenant,'node_modules')],root,'dependencies');await mkdir(join(tenant,'artifacts'));await run(label+'-pack',tool('npm'),['pack','--ignore-scripts','--offline','--json','--pack-destination','artifacts'],tenant,'pack');return {archive:await pin(join(tenant,'artifacts/abiogenesis-typescript-tenant-'+VERSION+'.tgz')),manifest:await pin(join(tenant,'product-toolchain-manifest.json'))};
}


await checkBuildInputs();const rows=await sourceRows();const checkpoint=await jsonPin(build.sourceCheckpoint);
assert.equal(checkpoint.sourceCommit,build.expectedSourceCommit);assert.equal(checkpoint.sourceTree,build.expectedSourceTree);
await conserve(rows,W);for(const q of [O,p.temp,p.releaseRoot,p.installHost])await absent(q);await reserve();await mkdir(O,{mode:0o700});
const run=await openCommands(O);const result={phase,startedUtc:new Date().toISOString(),input:{path:resolve(input),bytes:raw.length,sha256:inputSha},status:'FAILED',qualified:false,published:false};
try{
 const before=await preserved(run,'before');await save(O,'PRESERVED_BEFORE.json',before);
 assert.equal((await run('existing-source-head',tool('git'),gitArgs(W,['rev-parse','HEAD']))).stdout.trim(),checkpoint.sourceCommit);
 assert.equal((await run('existing-source-tree',tool('git'),gitArgs(W,['rev-parse','HEAD^{tree}']))).stdout.trim(),checkpoint.sourceTree);
 assert.equal((await run('existing-source-branch',tool('git'),gitArgs(W,['branch','--show-current']))).stdout.trim(),p.branch);
 for(const [label,args]of [['tracked-clean',['diff','--quiet']],['index-clean',['diff','--cached','--quiet']]])await run(label,tool('git'),gitArgs(W,args));
 const untracked=(await run('untracked-before',tool('git'),gitArgs(W,['ls-files','--others','--exclude-standard','-z']))).stdout.split('\0').filter(Boolean).sort();
 await mkdir(p.temp,{mode:0o700});await mkdir(env.TMPDIR,{mode:0o700});for(const n of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(p.temp,n),'',{flag:'wx'});
 await save(O,'ENVIRONMENT.json',{environment:env,configs:[await pin(env.npm_config_userconfig),await pin(env.npm_config_globalconfig)],boundsMs:build.boundsMs,maxOutputBytes:build.maxOutputBytes});
 const reproRoot=join(p.temp,'reproduction');await mkdir(reproRoot);const sourceArchive=join(O,'reproduction-source.tar');
 await run('reproduction-source-archive',tool('git'),gitArgs(W,['archive','--format=tar','--output='+sourceArchive,checkpoint.sourceCommit,...[...new Set(rows.map(r=>r.relativePath.startsWith(T+'/')?T:r.relativePath.split('/')[0]))].sort()]));
 await run('reproduction-source-extract',tool('tar'),['-xf',sourceArchive,'-C',reproRoot],reproRoot);
 await checkReproductionInputs(rows,reproRoot,checkpoint.sourceCommit);
 const reproduction=await compilePack(run,'reproduction',reproRoot);const candidate={archive:build.source.testedArchive,manifest:build.source.testedManifest};
 assert.equal(reproduction.archive.bytes,candidate.archive.bytes);assert.equal(reproduction.archive.sha256,candidate.archive.sha256,'clean reproduction differs from exact tested archive');assert.equal(reproduction.manifest.sha256,candidate.manifest.sha256);
 await save(O,'REPRODUCTION_RESULT.json',{status:'BYTE_EQUAL',sourceCommit:checkpoint.sourceCommit,sourceTree:checkpoint.sourceTree,root:reproRoot,sourceArchive:await pin(sourceArchive),expectedArchive:candidate.archive,...reproduction,dependencyMetadata:build.dependencyMetadata,sourceWins:true,actualSeeds:[],metadataDependent:true});
 await run('exact-tested-artifact-members',tool('python'),[join(here,'exact-artifact-correspondence.py'),candidate.archive.path,reproduction.archive.path,join(O,'EXACT_TESTED_ARTIFACT.json')],W,'inventory');
 await sourceRows();await conserve(rows,W);assert.deepEqual(await preserved(run,'after'),before);for(const r of build.preservationPins)await checked(r);
 assert.equal((await run('source-head-after',tool('git'),gitArgs(W,['rev-parse','HEAD']))).stdout.trim(),checkpoint.sourceCommit);
 assert.deepEqual((await run('untracked-after',tool('git'),gitArgs(W,['ls-files','--others','--exclude-standard','-z']))).stdout.split('\0').filter(Boolean).sort(),untracked);
 result.status='EXACT_METADATA_BOUND_CLEAN_REPRODUCTION_COMPLETE_INSTALL_HELD';result.sourceCheckpoint=build.sourceCheckpoint;result.reproduction=await pin(join(O,'REPRODUCTION_RESULT.json'));result.correspondence=await pin(join(O,'EXACT_TESTED_ARTIFACT.json'));result.gitMutations=false;result.metadataDependentLimit='Exact fully declared source, dependency contents/links/modes and relevant directory/hidden-lock metadata. No source-plus-file-bytes-only or metadata-insensitive reproduction claim.';
}catch(e){result.error=String(e);throw e;}finally{result.endedUtc=new Date().toISOString();await save(O,'RESULT.json',result);console.log(JSON.stringify(result));}
