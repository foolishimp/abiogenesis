// RC8 adaptation of the accepted RC7 cut sequence. Prepared only until exact Root phase binding.
// No Product implementation, qualification, M coordination writes or automatic retry.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {readFile,writeFile,mkdir,lstat,realpath,copyFile,chmod,unlink,statfs} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,isAbsolute,resolve,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
// Canonical command custody and toolchain remain referenced existing owners.
const here=dirname(fileURLToPath(import.meta.url));
const T='build_tenants/abiogenesis/typescript';
const VERSION='5.0.0-rc.8';
const hex=b=>createHash('sha256').update(b).digest('hex');
async function pin(path){const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink(),path);const b=await readFile(path);return {path,bytes:b.length,sha256:hex(b)};}
async function checked(r){assert(r&&isAbsolute(r.path)&&Number.isSafeInteger(r.bytes)&&/^[a-f0-9]{64}$/.test(r.sha256),'unbound/invalid file pin');assert.deepEqual(await pin(r.path),r);return readFile(r.path);}
async function jsonPin(r){return JSON.parse(await checked(r));}
async function absent(p){try{await lstat(p);throw Error('preserved allocation/collision: '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
function rel(p){assert(typeof p==='string'&&p&&!isAbsolute(p)&&!p.includes('\\')&&!p.split('/').some(x=>!x||x==='.'||x==='..'||x==='.git'),p);return p;}
async function safeTarget(root,p){rel(p);let at=root;for(const part of p.split('/').slice(0,-1)){at=join(at,part);try{const s=await lstat(at);assert(s.isDirectory()&&!s.isSymbolicLink(),at);}catch(e){if(e.code!=='ENOENT')throw e;await mkdir(at);}}const dest=join(root,p);try{const s=await lstat(dest);assert(s.isFile()&&!s.isSymbolicLink(),dest);}catch(e){if(e.code!=='ENOENT')throw e;}return dest;}
assert.equal(process.argv.length,5,'usage: node run-local-cut.corrected-001.mjs build|install ROOT_BINDINGS.json SHA256_HEX');
const [phase,input,inputSha]=process.argv.slice(2);assert(['build','install'].includes(phase));
const raw=await readFile(resolve(input));assert.equal(hex(raw),inputSha);const b=JSON.parse(raw);
assert.equal(b.status,phase==='build'?'ROOT_SELECTED_LOCAL_RC8_BUILD_ONLY':'ROOT_SELECTED_LOCAL_CANDIDATE_INSTALL_ONLY','future binding/activation still unbound');
await checked(b.activation);
const prep=await jsonPin(b.preparationManifest);assert.equal(prep.status,'PREPARED_UNBOUND_NO_EXECUTION');assert.equal(prep.controlRevision,'exact-source-selection-and-archive-inputs-001');
for(const p of prep.files)await checked(p);
const own=JSON.parse(await readFile(join(here,'OWNER_AND_TOOL_PINS.json'),'utf8'));
for(const p of own.canonicalCommandOwner)await checked(p);await checked(own.directSmokeOwner);
for(const p of own.tools){assert.equal(await realpath(p.configuredPath),p.realPath);await checked({path:p.realPath,bytes:p.bytes,sha256:p.sha256});}
assert.equal(await realpath(process.execPath),own.tools.find(x=>x.name==='node').realPath);
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(own.canonicalCommandOwner[0].path));
const tool=name=>own.tools.find(x=>x.name===name).configuredPath;
const save=(root,name,value)=>exclusiveRecord(root,name,value);
const p=own.paths, W=p.worktree, O=p.output;
const env={HOME:'/Users/jim',PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',CI:'1',GIT_TERMINAL_PROMPT:'0',TMPDIR:join(p.temp,'tmp'),NODE_OPTIONS:'--max-old-space-size=8192',npm_config_userconfig:join(p.temp,'npm-user.npmrc'),npm_config_globalconfig:join(p.temp,'npm-global.npmrc'),npm_config_cache:join(p.temp,'npm-cache'),npm_config_offline:'true',npm_config_ignore_scripts:'true',npm_config_audit:'false',npm_config_fund:'false'};
let build=b;
if(phase==='install')build=await jsonPin(b.buildBindings);
assert.deepEqual(build.paths,p);assert.equal(build.nodeHeapMiB,8192);assert.equal(build.maxOutputBytes,67108864);
const ceilings={git:120000,dependencies:120000,compile:240000,generate:600000,pack:120000,inventory:120000,install:600000,installedOwner:60000};
for(const [k,v] of Object.entries(ceilings))assert(Number.isInteger(build.boundsMs[k])&&build.boundsMs[k]>0&&build.boundsMs[k]<=v,k);
async function reserve(){const s=await statfs(p.repository);assert(s.bavail*s.bsize>=4294967296,'4 GiB free-space reserve: stop, preserve custody, no retry');return s.bavail*s.bsize;}
async function openCommands(root){const command=commandRecorder(root,{environment:env,maxOutputBytes:build.maxOutputBytes});return async(label,exe,args,cwd=W,kind='git')=>{await reserve();const r=await command(label,exe,args,{cwd,environment:env,timeoutMs:build.boundsMs[kind]});assert(!r.timedOut&&!r.truncated&&!r.failure&&r.exitCode===0&&r.signal===null,'command failed; retained original receipt: '+label);await reserve();return r;};}
const gitArgs=(root,args)=>['-C',root,'-c','core.hooksPath=/dev/null',...args];
async function preserved(run,label){const out=[];for(const [name,root] of [['main',p.repository],['rc7',p.preservedCut]]){const head=(await run(label+'-'+name+'-head',tool('git'),gitArgs(root,['rev-parse','HEAD']),root)).stdout.trim();const i=(await run(label+'-'+name+'-index',tool('git'),gitArgs(root,['rev-parse','--git-path','index']),root)).stdout.trim();out.push({root,head,index:await pin(resolve(root,i))});}return out;}
async function sourceRows(){await checked(build.source.subject);const observed=await jsonPin(build.source.inventory);const inv={...observed,files:observed.files??observed.rows?.map(r=>({relativePath:r.path,sourceSnapshot:join(observed.source,r.path),bytes:r.bytes,sha256:r.sha256}))};assert(Array.isArray(inv.files)&&inv.files.length>0);if(observed.sourceDigest!==undefined)assert.equal(observed.sourceDigest,build.source.sourceDigest);assert(/^[a-f0-9]{40}$/.test(build.source.baseCommit)&&/^[a-f0-9]{40}$/.test(build.source.baseTree));assert(build.source.fileModes&&typeof build.source.fileModes==='object');assert(Array.isArray(build.source.deletedPaths));await checked(build.source.cumulativeSourceCoverageDisposition);const seen=new Set();for(const r of inv.files){rel(r.relativePath);assert(!seen.has(r.relativePath));seen.add(r.relativePath);await checked({path:r.sourceSnapshot,bytes:r.bytes,sha256:r.sha256});}for(const [name,mode] of Object.entries(build.source.fileModes)){assert(seen.has(name));assert(['100644','100755'].includes(mode));}for(const r of build.source.deletedPaths){rel(r.relativePath);assert(!seen.has(r.relativePath));assert(/^[a-f0-9]{64}$/.test(r.beforeSha256));}return inv.files;}
async function conserve(rows,root,identity){for(const r of rows){const q=await pin(join(root,r.relativePath));const expected=identity?.find(x=>x.relativePath===r.relativePath)?.after;assert.equal(q.sha256,expected?.sha256??r.sha256,r.relativePath);assert.equal(q.bytes,expected?.bytes??r.bytes,r.relativePath);}for(const r of build.source.deletedPaths)await absent(join(root,r.relativePath));}
async function checkBuildInputs(){
  for(const key of ['source','focusedAndReview','broadClose','referenceAfter'])await checked(build.acceptance[key]);
  assert.equal(build.metadata.toVersion,VERSION);assert.equal(build.metadata.rewriteIdentity,false);
  await checked(own.offlineDependencySelection);for(const r of own.toolchainEntryPins)await checked(r);
  await checked(build.source.nativeTestedArchive);await checked(build.source.testedManifest);await checked(build.source.nativeTestedArchiveSourceRelation);
  assert(Array.isArray(build.source.expectedChangedPaths)&&build.source.expectedChangedPaths.length>0);for(const p of build.source.expectedChangedPaths){rel(p);assert(!p.split('/').some(x=>x==='.abiogenesis'||x==='qualification-scratch'),'operator/progress path is not selected source: '+p);}assert.equal(new Set(build.source.expectedChangedPaths).size,build.source.expectedChangedPaths.length);
  assert(Array.isArray(build.source.expectedNewPaths));for(const p of build.source.expectedNewPaths){rel(p);assert(build.source.expectedChangedPaths.includes(p),p);}assert.equal(new Set(build.source.expectedNewPaths).size,build.source.expectedNewPaths.length);
}

// These are canonical generator inputs, not an additional seed tree. Qualification
// member paths come from its already frozen owner manifest; generated rule-catalog
// outputs are regenerated by the canonical owner after this pre-compile check.
const generatorSeedAndControlPaths=["package.json","package-lock.json","tsconfig.json","scripts/generate-product-manifest.mjs","scripts/generate-qualification-rule-catalog.mjs","code/src/gtl/default_library.ts","code/src/gtl/worksite_command_execution.ts","code/src/product/worksite_command_execution.ts","code/support/governed-context/host_adapter.py","contracts/qualification/authority-inputs.json","contracts/schemas/public-contract-catalog.schema.json","contracts/schemas/product-toolchain-manifest.schema.json","contracts/conformance/gtl-language-conformance-corpus.json","contracts/default-library/stdo/manifest.json","contracts/default-library/stdo/standards/EXECUTIVE_BASELINE.md","contracts/default-library/stdo/standards/ASSURANCE.md","contracts/default-library/stdo/plugins/spec/skills/stdo-work/SKILL.md","contracts/default-library/stdo/plugins/spec/skills/stdo-review/SKILL.md","contracts/default-library/stdo/plugins/spec/references/COORDINATED_HANDOFF.md","contracts/default-library/stdo/plugins/spec/references/PRODUCT_BASIS.md"];
async function checkReproductionInputs(rows,root,sourceCommit){
  const expected=new Map(rows.map(r=>[r.relativePath,r]));
  const required=new Set(generatorSeedAndControlPaths.map(p=>T+'/'+p));
  const qualification=JSON.parse(await readFile(join(root,T,'contracts/qualification/authority-inputs.json'),'utf8'));
  assert(Array.isArray(qualification.sources)&&qualification.sources.length>0);
  for(const s of qualification.sources){rel(s.path);assert(s.path.startsWith('contracts/qualification/sources/'));required.add(T+'/'+s.path);}
  const verified=[];
  for(const relativePath of [...required].sort()){const r=expected.get(relativePath);assert(r,'required generator input absent from accepted frozen inventory: '+relativePath);const actual=await pin(join(root,relativePath));assert.equal(actual.bytes,r.bytes,relativePath);assert.equal(actual.sha256,r.sha256,relativePath);verified.push({relativePath,bytes:actual.bytes,sha256:actual.sha256});}
  await save(O,'REPRODUCTION_INPUTS_VERIFIED.json',{status:'EXACT_FROZEN_INPUTS_PRESENT_BEFORE_COMPILE',sourceCommit,sourceInventory:build.source.inventory,sourceDigest:build.source.sourceDigest,inputs:verified,externalSeedCopy:false});
}

async function compilePack(run,label,root){const tenant=join(root,T);await absent(join(tenant,'build'));await absent(join(tenant,'node_modules'));await absent(join(tenant,'artifacts'));for(const r of own.toolchainEntryPins)await checked(r);await run(label+'-dependencies',tool('cp'),['-cR',own.toolchainRoot,join(tenant,'node_modules')],root,'dependencies');await run(label+'-compile',tool('node'),['node_modules/typescript/bin/tsc','-p','tsconfig.json'],tenant,'compile');await run(label+'-generate',tool('node'),['scripts/generate-product-manifest.mjs'],tenant,'generate');await mkdir(join(tenant,'artifacts'));await run(label+'-pack',tool('npm'),['pack','--ignore-scripts','--json','--pack-destination','artifacts'],tenant,'pack');return {archive:await pin(join(tenant,'artifacts/abiogenesis-typescript-tenant-'+VERSION+'.tgz')),manifest:await pin(join(tenant,'product-toolchain-manifest.json'))};}

if(phase==='build'){
  await checkBuildInputs();const rows=await sourceRows();
  // Reuse C8. Its source must already equal the accepted frozen input; never overwrite an author workspace from a stale stage.
  assert.equal(await realpath(W),W);await conserve(rows,W);
  for(const q of [O,p.temp,p.releaseRoot,p.installHost])await absent(q);
  const pkg=JSON.parse(await readFile(join(W,T,'package.json'),'utf8')),lock=JSON.parse(await readFile(join(W,T,'package-lock.json'),'utf8'));
  assert.equal(pkg.version,VERSION);assert.equal(lock.version,VERSION);assert.equal(lock.packages[''].version,VERSION);
  const testedManifest=JSON.parse(await checked(build.source.testedManifest));assert.equal(testedManifest.packageVersion,VERSION);assert.equal(testedManifest.productId,'product://abiogenesis/typescript-tenant@'+VERSION);
  await reserve();await mkdir(O,{mode:0o700});const run=await openCommands(O);const result={phase,startedUtc:new Date().toISOString(),input:{path:resolve(input),bytes:raw.length,sha256:inputSha},status:'FAILED',qualified:false,published:false};
  try{
    const preservedBefore=await preserved(run,'before');await save(O,'PRESERVED_BEFORE.json',preservedBefore);
    assert.equal((await run('existing-source-head',tool('git'),gitArgs(W,['rev-parse','HEAD']))).stdout.trim(),build.source.baseCommit);
    assert.equal((await run('existing-source-tree',tool('git'),gitArgs(W,['rev-parse','HEAD^{tree}']))).stdout.trim(),build.source.baseTree);
    assert.equal((await run('existing-source-branch',tool('git'),gitArgs(W,['branch','--show-current']))).stdout.trim(),p.branch);
    assert.equal((await run('index-before-stage',tool('git'),gitArgs(W,['diff','--cached','--name-only']))).stdout.trim(),'');
    await mkdir(p.temp,{mode:0o700});await mkdir(env.TMPDIR,{mode:0o700});for(const n of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(p.temp,n),'',{flag:'wx'});
    await save(O,'ENVIRONMENT.json',{environment:env,configs:[await pin(env.npm_config_userconfig),await pin(env.npm_config_globalconfig)],boundsMs:build.boundsMs,maxOutputBytes:build.maxOutputBytes});
    const changed=(await run('source-changed',tool('git'),gitArgs(W,['diff','--name-only','-z','HEAD']))).stdout.split('\0').filter(Boolean);
    const untracked=(await run('source-untracked',tool('git'),gitArgs(W,['ls-files','--others','--exclude-standard','-z']))).stdout.split('\0').filter(Boolean);
    const selected=[...build.source.expectedChangedPaths].sort(), selectedSet=new Set(selected);
    for(const path of changed)assert(selectedSet.has(path),'tracked delta outside accepted source selection: '+path);
    const expectedNew=[...build.source.expectedNewPaths].sort(), selectedNew=untracked.filter(path=>selectedSet.has(path)).sort();
    assert.deepEqual(selectedNew,expectedNew,'expected new source files must be present and untracked');
    assert.deepEqual([...new Set([...changed,...selectedNew])].sort(),selected,'exact selected changed source required');
    const ownedSource=new Set(rows.map(r=>r.relativePath));for(const path of selected){assert(ownedSource.has(path)||build.source.deletedPaths.some(r=>r.relativePath===path),'selected delta outside accepted inventory/deletions: '+path);if(expectedNew.includes(path))assert(ownedSource.has(path),'new source lacks frozen byte custody: '+path);}
    const excludedUntrackedPaths=untracked.filter(path=>!selectedSet.has(path)).sort();
    const identity=[];const candidate={archive:build.source.nativeTestedArchive,manifest:build.source.testedManifest};
    await save(O,'SOURCE_PREPARED.json',{status:'ACCEPTED_FROZEN_BYTES_MATCH_EXISTING_C8',sourceSubject:build.source.subject,sourceInventory:build.source.inventory,sourceCount:rows.length,selectedDelta:selected,expectedNewPaths:expectedNew,excludedUntrackedPaths,excludedUntrackedStanding:'Preserved operator/progress or other non-selected paths; path list only, no source membership or content acquisition.',identityChanges:identity,acceptedEvidence:build.acceptance});
    await save(O,'candidate/RESULT.json',{phase:'candidate',status:'BUILT',root:build.source.testedStageRoot,...candidate,standing:'Retained exact tested rc.8 archive. No metadata mutation or identity-bridge allowance.'});
    await run('source-stage',tool('git'),gitArgs(W,['add','--',...selected]));assert.deepEqual((await run('source-staged-paths',tool('git'),gitArgs(W,['diff','--cached','--name-only','-z']))).stdout.split('\0').filter(Boolean).sort(),selected,'staged source must equal exact selection');await run('source-whitespace',tool('git'),gitArgs(W,['diff','--cached','--check']));
    await run('source-checkpoint',tool('git'),gitArgs(W,['-c','commit.gpgsign=false','commit','-m','Checkpoint accepted RC8 reference-preservation source']));
    for(const [label,args]of [['tracked-clean',['diff','--quiet']],['index-clean',['diff','--cached','--quiet']]])await run(label,tool('git'),gitArgs(W,args));
    const sourceCommit=(await run('checkpoint-head',tool('git'),gitArgs(W,['rev-parse','HEAD']))).stdout.trim(),sourceTree=(await run('checkpoint-tree',tool('git'),gitArgs(W,['rev-parse','HEAD^{tree}']))).stdout.trim();
    await save(O,'SOURCE_CHECKPOINT.json',{kind:'rc8_local_source_checkpoint',sourceCommit,sourceTree,branch:p.branch,worktree:W,baseCommit:build.source.baseCommit,subject:build.source.subject,inventory:build.source.inventory,archive:candidate.archive,sourceCount:rows.length,identityChanges:identity,standing:'Exact accepted frozen overlay checkpoint. Local unqualified; install unexecuted.'});
    const reproRoot=join(p.temp,'reproduction');await absent(reproRoot);await mkdir(reproRoot);const sourceArchive=join(O,'reproduction-source.tar');
    await run('reproduction-source-archive',tool('git'),gitArgs(W,['archive','--format=tar','--output='+sourceArchive,sourceCommit,T,'specification','stdo_abiogenesis.json','AGENTS.md','CLAUDE.md']));await run('reproduction-source-extract',tool('tar'),['-xf',sourceArchive,'-C',reproRoot],reproRoot);
    await checkReproductionInputs(rows,reproRoot,sourceCommit);
    const reproduction=await compilePack(run,'reproduction',reproRoot);assert.equal(reproduction.archive.bytes,candidate.archive.bytes);assert.equal(reproduction.archive.sha256,candidate.archive.sha256,'clean reproduction differs from exact tested archive');
    assert.equal(reproduction.manifest.sha256,candidate.manifest.sha256);await save(O,'reproduction/RESULT.json',{phase:'reproduction',status:'BYTE_EQUAL',sourceCommit,root:reproRoot,sourceArchive:await pin(sourceArchive),expectedArchive:candidate.archive,...reproduction});
    await run('exact-tested-artifact-members',tool('python'),[join(here,'exact-artifact-correspondence.py'),candidate.archive.path,reproduction.archive.path,join(O,'EXACT_TESTED_ARTIFACT.json')],W,'inventory');
    const code="import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import{pathToFileURL}from'node:url';const t=process.argv[1];const p=await import(pathToFileURL(t+'/build/code/src/product/index.js'));for(const k of ['verifyProduct','constructResolvedProductLock','installProduct','isProductInstallCandidate','installedProductContentMatches','sha256Canonical'])assert.equal(typeof p[k],'function',k);assert.equal(p.ABI5_PACKAGE_VERSION,'5.0.0-rc.8');const m=JSON.parse(await readFile(t+'/product-toolchain-manifest.json','utf8'));console.log(JSON.stringify({packageName:m.packageName,packageVersion:m.packageVersion,productId:m.productId,manifestDigest:p.sha256Canonical(m),productContentDigest:m.productContentDigest}));";
    const ident=JSON.parse((await run('built-product-identity',tool('node'),['--input-type=module','-e',code,join(reproRoot,T)],W,'inventory')).stdout);assert.equal(ident.packageVersion,VERSION);assert.equal(ident.productId,'product://abiogenesis/typescript-tenant@'+VERSION);assert.equal(ident.packageName,'@abiogenesis/typescript-tenant');
    await save(O,'INSTALL_INPUTS_PENDING.json',{status:'REVIEW_AND_ROOT_INSTALL_BINDING_REQUIRED',worksiteRoot:W,sourceTree,expected:{...ident,sourceCommit,artifactDigest:'sha256:'+candidate.archive.sha256},archive:candidate.archive,archiveMembers:JSON.parse(await readFile(join(O,'EXACT_TESTED_ARTIFACT.json'),'utf8')).members,releaseRoot:p.releaseRoot,installHost:p.installHost,installPath:env.PATH,tools:own.tools,qualified:false,published:false});
    await sourceRows();await conserve(rows,W);assert.deepEqual(await preserved(run,'after'),preservedBefore);result.status='BUILD_AND_BYTE_EQUAL_REPRODUCTION_COMPLETE_INSTALL_UNBOUND';result.sourceCheckpoint=await pin(join(O,'SOURCE_CHECKPOINT.json'));result.candidate=await pin(join(O,'candidate/RESULT.json'));result.reproduction=await pin(join(O,'reproduction/RESULT.json'));
  }catch(e){result.error=String(e);throw e;}finally{result.endedUtc=new Date().toISOString();await save(O,'BUILD_RESULT.json',result);console.log(JSON.stringify(result));}
}else{
  assert.equal(build.status,'ROOT_SELECTED_LOCAL_RC8_BUILD_ONLY');await checked(build.activation);await checkBuildInputs();const rows=await sourceRows();
  const checkpoint=await jsonPin(b.sourceCheckpoint),candidate=await jsonPin(b.candidate),reproduction=await jsonPin(b.reproduction),correspondence=await jsonPin(b.exactTestedArtifact),review=await jsonPin(b.independentPackagingReview);
  assert.equal(correspondence.status,'BYTE_EQUAL');assert.deepEqual(correspondence.changedMembers,[]);assert.equal(correspondence.identityBridgeAllowance,false);
  assert.deepEqual(candidate.archive,build.source.nativeTestedArchive);assert.deepEqual(correspondence.testedArchive,candidate.archive);assert.deepEqual(correspondence.reproductionArchive,reproduction.archive);
  assert.equal(b.sourceCheckpoint.path,join(O,'SOURCE_CHECKPOINT.json'));assert.equal(b.candidate.path,join(O,'candidate/RESULT.json'));assert.equal(b.reproduction.path,join(O,'reproduction/RESULT.json'));assert.equal(b.exactTestedArtifact.path,join(O,'EXACT_TESTED_ARTIFACT.json'));
  assert.equal(candidate.status,'BUILT');assert.equal(reproduction.status,'BYTE_EQUAL');assert.equal(reproduction.sourceCommit,checkpoint.sourceCommit);assert.equal(candidate.archive.sha256,reproduction.archive.sha256);assert.equal(candidate.archive.bytes,reproduction.archive.bytes);assert.deepEqual(checkpoint.subject,build.source.subject);assert.deepEqual(checkpoint.inventory,build.source.inventory);assert.equal(review.verdict,'satisfied');assert.equal(review.sourceCommit,checkpoint.sourceCommit);assert.equal(review.sourceTree,checkpoint.sourceTree);await checked(candidate.archive);await conserve(rows,W,checkpoint.identityChanges);
  for(const key of ['boundedClaim','residuals','rootAuthority'])await checked(b[key]);for(const key of ['published','qualified','selectorChanged'])assert.equal(b[key],false);
  for(const q of [p.releaseRoot,p.installHost,join(O,'install-001'),join(O,'FINAL_INSTALL_VERIFICATION.json')])await absent(q);
  const environment=JSON.parse(await readFile(join(O,'ENVIRONMENT.json'),'utf8'));assert.deepEqual(environment.environment,env);for(const r of environment.configs){assert.equal(r.bytes,0);assert.equal(r.sha256,hex(Buffer.alloc(0)));await checked(r);}
  const out=join(O,'install-001');await mkdir(out);const run=await openCommands(out);const result={phase,startedUtc:new Date().toISOString(),input:{path:resolve(input),bytes:raw.length,sha256:inputSha},status:'FAILED',qualified:false,published:false};
  try{
    const before=await preserved(run,'before');assert.equal((await run('source-head',tool('git'),gitArgs(W,['rev-parse','HEAD']))).stdout.trim(),checkpoint.sourceCommit);for(const [n,args] of [['source-clean',['diff','--quiet']],['index-clean',['diff','--cached','--quiet']]])await run(n,tool('git'),gitArgs(W,args));
    assert.equal(b.installInputs.path,join(O,'INSTALL_INPUTS_PENDING.json'));const pending=await jsonPin(b.installInputs);assert.deepEqual(pending.archive,candidate.archive);assert.equal(pending.expected.sourceCommit,checkpoint.sourceCommit);assert.equal(pending.archiveMembers,correspondence.members);
    for(const [name,key] of [['BOUNDED_CANDIDATE_CLAIM.md','boundedClaim'],['RESIDUALS.md','residuals'],['ROOT_AUTHORITY.md','rootAuthority']])await writeFile(join(out,name),await checked(b[key]),{flag:'wx'});
    const mapping={kind:'rc8_source_artifact_evidence_map',source:build.source,acceptance:build.acceptance,checkpoint:b.sourceCheckpoint,candidate:b.candidate,reproduction:b.reproduction,exactTestedArtifact:b.exactTestedArtifact,independentPackagingReview:b.independentPackagingReview,expected:pending.expected,archive:candidate.archive,qualified:false,limits:b.limits};await save(out,'SOURCE_ARTIFACT_EVIDENCE_MAP.json',mapping);
    const files=[b.activation,b.buildBindings,b.sourceCheckpoint,b.candidate,b.reproduction,b.exactTestedArtifact,b.installInputs,b.independentPackagingReview,await pin(join(here,'install-local-rc8.mjs')),...await Promise.all(['BOUNDED_CANDIDATE_CLAIM.md','RESIDUALS.md','ROOT_AUTHORITY.md','SOURCE_ARTIFACT_EVIDENCE_MAP.json'].map(n=>pin(join(out,n))))];
    const inputManifest={...pending,status:'ROOT_SELECTED_LOCAL_CANDIDATE_INSTALL_ONLY',files,claim:b.claim,limits:b.limits,effectGrant:['Fresh local RC8 release custody and exact Product-owner installation','All-member byte correspondence and fresh installed-owner check'],failurePolicy:'Preserve failure, partial allocation and original receipts. No automatic retry/overwrite/cleanup.'};await save(out,'INPUT_MANIFEST.json',inputManifest);const mp=await pin(join(out,'INPUT_MANIFEST.json'));
    await run('owner-install',tool('node'),[join(here,'install-local-rc8.mjs'),mp.path,mp.sha256],W,'install');
    const fresh=await run('fresh-installed-owner-smoke',tool('node'),[join(here,'installed-owner-smoke.mjs'),p.releaseRoot,join(p.temp,'installed-smoke'),join(out,'INSTALLED_OWNER_SMOKE.json'),own.directSmokeOwner.path],W,'installedOwner');const installedOwner=JSON.parse(fresh.stdout);assert.equal(installedOwner.status,'DIRECT_INSTALLED_OWNER_SMOKE_CLOSED');assert.equal(installedOwner.nativeTransportInvoked,false);
    const cut=JSON.parse(await readFile(join(p.releaseRoot,'LOCAL_CUT_RECORD.json'),'utf8')),payload=JSON.parse(await readFile(join(p.releaseRoot,'payload-correspondence.json'),'utf8'));assert.equal(cut.status,'local_cut_and_owner_install_completed');assert.deepEqual(cut.source,inputManifest.expected);assert.equal(cut.sourceTree,checkpoint.sourceTree);assert.equal(cut.selectedInputManifestSha256,mp.sha256);for(const k of ['published','qualified','tagsCreated','selectorChanged'])assert.equal(cut[k],false);assert.equal(cut.providerCalls,0);assert.equal(cut.nativeRuns,0);assert.equal(payload.members,correspondence.members);assert.equal(payload.inventory.length,correspondence.members);assert.equal(cut.members,correspondence.members);
    const checks=[];for(const line of (await readFile(join(p.releaseRoot,'SHA256SUMS'),'utf8')).trim().split('\n')){const [digest,name]=line.split('  ');rel(name);const r=await pin(join(p.releaseRoot,name));assert.equal(r.sha256,digest);checks.push(r);}
    await conserve(rows,W,checkpoint.identityChanges);await sourceRows();assert.deepEqual(await preserved(run,'after'),before);await save(O,'FINAL_INSTALL_VERIFICATION.json',{kind:'rc8_final_local_install_verification',status:'LOCAL_RC8_CUT_AND_INSTALL_COMPLETE_UNQUALIFIED',sourceCommit:checkpoint.sourceCommit,sourceTree:checkpoint.sourceTree,cutRecord:await pin(join(p.releaseRoot,'LOCAL_CUT_RECORD.json')),selectedManifest:mp,checksums:checks,payloadMembers:payload.members,payloadInventoryDigest:payload.inventoryDigest,installedOwnerRead:installedOwner,installedOwnerReadWallMs:fresh.wallMs,review:b.independentPackagingReview,reproduction:b.reproduction,sourceAcceptance:build.acceptance,exactInstalledFunctionalProof:await pin(join(out,'INSTALLED_OWNER_SMOKE.json')),nativeWorkflowClaim:false,exactShippedArchiveLifecycleProof:build.acceptance.referenceAfter,published:false,qualified:false,globalSelectorChanged:false});result.status='LOCAL_RC8_CUT_AND_INSTALL_COMPLETE_UNQUALIFIED';result.verification=await pin(join(O,'FINAL_INSTALL_VERIFICATION.json'));
  }catch(e){result.error=String(e);throw e;}finally{result.endedUtc=new Date().toISOString();await save(out,'RESULT.json',result);console.log(JSON.stringify(result));}
}
