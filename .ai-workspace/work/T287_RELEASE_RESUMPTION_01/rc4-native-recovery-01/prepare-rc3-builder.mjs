// Root-only setup recipe. Authoring/parse-checking this file invokes no Product.
// Reuses existing operator-client owners; no lifecycle/provider invocation here.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {lstat,mkdir,readFile,realpath} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=fileURLToPath(new URL('.',import.meta.url)).replace(/\/$/u,'');
const base=join(dir,'../rc3-dogfood-01');
const sha=b=>createHash('sha256').update(b).digest('hex');
const canonical=v=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(canonical).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
async function pin(r){const s=await lstat(r.path);assert(s.isFile()&&!s.isSymbolicLink(),r.path);const b=await readFile(r.path);assert.equal(b.length,r.bytes,r.path);assert.equal(sha(b),r.sha256,r.path);return b;}
async function absent(p){try{await lstat(p);throw Error('must be absent: '+p)}catch(e){if(e.code!=='ENOENT')throw e;}}
assert.equal(process.argv.length,4,'usage: node prepare-rc3-builder.mjs ABSOLUTE_ROOT_SETUP_SELECTION SHA256_HEX');
assert.equal(resolve(process.argv[2]),join(dir,'ROOT_SETUP_SELECTION.json'));
const raw=await readFile(process.argv[2]);assert.equal(sha(raw),process.argv[3]);const d=JSON.parse(raw);
assert.equal(d.kind,'rc4_native_recovery_root_setup_selection');assert.equal(d.status,'ROOT_SELECTED_SETUP');assert.equal(d.providerDispatch,false);
assert.equal(d.frontierDisposition,'ROOT_ADMITTED');assert(d.nativeGrant?.path&&d.nativeGrant?.sha256);
const pinned=new Map();for(const r of d.files){assert(!pinned.has(r.path),'duplicate file');pinned.set(r.path,r);await pin(r);}
for(const p of [fileURLToPath(import.meta.url),join(dir,'setup-config.DRAFT.json'),join(dir,'PREPARATION_CHECKS.json'),d.nativeGrant.path])assert(pinned.has(p),'missing selected file: '+p);
assert.equal(pinned.get(d.nativeGrant.path).sha256,d.nativeGrant.sha256);
const c=JSON.parse(await readFile(join(dir,'setup-config.DRAFT.json'),'utf8'));
assert.equal(c.sourceCommit,'bcb1faf63cfb39bd7ccf7e14b48b133d1163216b');assert.equal(c.worksiteRoot,'/Users/jim/src/apps/abiogenesis-rc4-native-recovery');assert.equal(c.runtimeRoot,join(dir,'runtime-001'));
assert.equal(c.bootstrapRoot,'/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.3/node_modules/@abiogenesis/typescript-tenant');
assert.equal(c.builder.archiveSha256,'70de04c36e5716fd37d23e00daa37ab9f5bc079f51aec2544f8f0eb1c40649cd');
assert.equal(await realpath(c.bootstrapRoot),c.bootstrapRoot);assert.equal(await realpath(process.execPath),c.nodePath);
assert.equal(execFileSync('/usr/bin/git',['-C',c.worksiteRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),c.sourceCommit);
execFileSync('/usr/bin/git',['-C',c.worksiteRoot,'diff','--quiet']);execFileSync('/usr/bin/git',['-C',c.worksiteRoot,'diff','--cached','--quiet']);
await absent(c.runtimeRoot);await absent(join(c.worksiteRoot,'.abiogenesis'));
const checks=JSON.parse(await readFile(join(dir,'PREPARATION_CHECKS.json'),'utf8'));
for(const key of ['builderRecord','builderArchive','installedManifest','installedCli','payloadCorrespondence','installation'])await pin(checks[key]);
assert.equal(checks.builderArchive.sha256,c.builder.archiveSha256);
const manifest=JSON.parse(await readFile(checks.installedManifest.path,'utf8'));assert.equal(sha(canonical(manifest)),c.builder.manifestSha256);assert.equal(manifest.productContentDigest,'sha256:'+c.builder.productContentSha256);
const inventory=JSON.parse(await pin(checks.payloadCorrespondence));assert.equal(inventory.installedRoot,c.bootstrapRoot);assert.equal(inventory.artifactDigest,'sha256:'+c.builder.archiveSha256);assert.equal(inventory.members,5321);assert.equal(inventory.inventory.length,inventory.members);
for(const row of inventory.inventory){assert(!row.path.startsWith('/')&&!row.path.split('/').includes('..'));await pin({path:join(c.bootstrapRoot,row.path),bytes:row.bytes,sha256:row.digest.replace(/^sha256:/u,'')});}
const expected=['public-setup.mjs','runner.mjs','consumer.mjs','scenarios.mjs'].map(n=>resolve(base,'operator-client',n));
assert.deepEqual(checks.operatorClosure.map(r=>r.path).sort(),[...expected].sort());for(const r of checks.operatorClosure)await pin(r);
for(const r of d.executablePins){assert.equal(await realpath(r.configuredPath),r.path);await pin(r);}
assert(d.executablePins.some(r=>r.path===c.nodePath));assert(d.executablePins.some(r=>r.configuredPath===c.toolchains.npm.executable));
assert(pinned.has(d.workspaceAuthority.path));assert.equal(pinned.get(d.workspaceAuthority.path).sha256,d.workspaceAuthority.sha256);
// Exact installed payload and all local executable modules were checked before imports.
const {installedModules,verifyArtifact,publicCaller,populateSandbox}=await import(pathToFileURL(expected[0]).href);
const {exclusiveRecord,commandRecorder}=await import(pathToFileURL(expected[1]).href);
const runtime=await installedModules(c.bootstrapRoot),installation=JSON.parse(await pin(checks.installation));assert(await runtime.product.installedProductContentMatches(installation));
await mkdir(c.runtimeRoot,{mode:0o700});const record=(p,v,raw=false)=>exclusiveRecord(c.runtimeRoot,p,v,raw);
try{
 const env={...Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]])),...c.toolchainEnvironment};
 const config={...c,setupEnvironment:env,importAuthority:{ref:pathToFileURL(d.workspaceAuthority.path).href,digest:'sha256:'+d.workspaceAuthority.sha256}};
 const native=await verifyArtifact(runtime,{artifactPath:c.builder.archivePath,manifest,expectedArtifactDigest:'sha256:'+c.builder.archiveSha256},record,'abg');
 const caller=publicCaller({root:c.runtimeRoot,runtime,native,command:commandRecorder(c.runtimeRoot,{environment:env,timeoutMs:300000}),record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
 await record('ROOT_SETUP_SELECTION.json',d);const setup=await populateSandbox(caller);
 await record('operator-resume-material.json',{config:{...caller.config,setupEnvironment:{keys:Object.keys(env)}},native,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority,state:{closeHandoff:caller.state.closeHandoff,binding:caller.state.binding,resolvedLock:caller.state.resolvedLock,catalog:caller.state.catalog,catalogView:caller.state.catalogView,calls:caller.state.calls},setup});
 await record('summary.json',{status:'fresh_rc3_setup_completed_not_dispatched',sourceCommit:c.sourceCommit,builderArchiveSha256:c.builder.archiveSha256,initialInstalledRoot:c.bootstrapRoot,installedRoot:caller.installedRoot,providerCalls:0,operations:caller.state.calls,qualification:false});
 console.log(JSON.stringify({status:'fresh_rc3_setup_completed_not_dispatched',runtimeRoot:c.runtimeRoot,providerCalls:0}));
}catch(error){await record('setup-failure.json',{name:error.name,message:error.message,providerCalls:0,classification:'Preserve actual setup effects; no retry or invented close'});throw error;}
