// Root-only ordinary setup; no lifecycle or provider stage. File-only authoring is not execution.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {lstat,mkdir,readFile,realpath} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
async function pin(r){const s=await lstat(r.path);assert(s.isFile()&&!s.isSymbolicLink(),r.path);const b=await readFile(r.path);assert.equal(b.length,r.bytes,r.path);assert.equal(sha(b),r.sha256,r.path);return b;}
async function absent(p){try{await lstat(p);throw Error('must be absent: '+p)}catch(e){if(e.code!=='ENOENT')throw e;}}
assert.equal(process.argv.length,3,'usage: node prepare-runtime.mjs ROOT_SETUP_SELECTION_SHA256');
const selectionBytes=await readFile(join(dir,'ROOT_SETUP_SELECTION.json'));assert.equal(sha(selectionBytes),process.argv[2]);const selected=JSON.parse(selectionBytes);
assert.equal(selected.kind,'rc4_native_recovery_root_setup_selection');assert.equal(selected.status,'ROOT_SELECTED_SETUP');assert.equal(selected.operator,'Root');assert.equal(selected.providerDispatch,false);assert.deepEqual(selected.allowedStages,['setup']);
const bindingBytes=await readFile(join(dir,'SETUP_BINDING.json'));assert.equal(sha(bindingBytes),selected.bindingSha256);const binding=JSON.parse(bindingBytes);
for(const r of binding.files)await pin(r);
const c=await json(join(dir,'setup-config.json')),sources=await json(join(dir,'SOURCE_BINDINGS.json'));
assert.equal(c.sourceCommit,binding.sourceCommit);assert.equal(c.runtimeRoot,binding.runtimeRoot);assert.equal(c.workspaceAcquisition.kind,'open');assert.equal(c.provider.enabled,false);assert.equal(c.recursionBound,8);assert.equal(c.expectedConsumerDeclarationDigest,'sha256:e133e2328933c90950b466f5bddc030831b898198ef155a4c65537b2e521fc33');
assert.equal(await realpath(process.execPath),c.nodePath);assert.equal(await realpath(c.worksiteRoot),c.worksiteRoot);
const git=(...args)=>execFileSync('/usr/bin/git',['-C',c.worksiteRoot,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),c.sourceCommit);assert.equal(git('rev-parse','HEAD^{tree}'),c.sourceTree);assert.equal(git('status','--short','--untracked-files=no'),'');
await absent(c.runtimeRoot);
const workspaceBytes=await pin(sources.workspaceManifest),manifest=JSON.parse(workspaceBytes);assert.equal(manifest.canonicalRoot,c.worksiteRoot);assert.deepEqual(c.workspaceAcquisition.expectedAuthority,{ref:manifest.authorityBasis.authorityRef,digest:manifest.authorityBasis.authorityDigest});
const tmp=await lstat(binding.runtimeTmp.path);assert(tmp.isDirectory()&&!tmp.isSymbolicLink());assert.equal(tmp.dev,binding.runtimeTmp.device);assert.equal(tmp.ino,binding.runtimeTmp.inode);assert.equal(await realpath(binding.runtimeTmp.path),binding.runtimeTmp.path);assert(!binding.runtimeTmp.path.startsWith(c.worksiteRoot+'/'));
const ps=execFileSync('/bin/ps',['-axo','pid=,command='],{encoding:'utf8'});for(const line of ps.split('\n')){const match=line.trim().match(/^(\d+)\s+(.*)$/u);if(!match||Number(match[1])===process.pid)continue;assert(!match[2].includes(c.worksiteRoot)&&!match[2].includes(c.runtimeRoot),'Active process in selected source/setup territory');}
const inventory=JSON.parse(await pin(sources.payloadCorrespondence));assert.equal(inventory.members,5321);assert.equal(inventory.artifactDigest,'sha256:'+c.builder.archiveSha256);
for(const row of inventory.inventory)await pin({path:join(c.bootstrapRoot,row.path),bytes:row.bytes,sha256:row.digest.slice(7)});
for(const r of binding.executables){assert.equal(await realpath(r.configuredPath),r.path);await pin(r);}
// No provider credentials/configuration are needed for ordinary setup.
for(const key of Object.keys(process.env))if(key.startsWith('ABG_TS_')||key.startsWith('CLAUDE_CODE_OAUTH')||key.startsWith('ANTHROPIC_')||key==='NPM_CONFIG_CACHE')delete process.env[key];
Object.assign(process.env,c.toolchainEnvironment);assert.equal(process.env.TMPDIR,binding.runtimeTmp.path);assert.equal(process.env.NPM_CONFIG_CACHE,undefined);
const {installedModules,verifyArtifact,publicCaller,populateSandbox}=await import(pathToFileURL(sources.publicSetup.path).href);
const {exclusiveRecord,commandRecorder}=await import(pathToFileURL(binding.runner.path).href);
const runtime=await installedModules(c.bootstrapRoot);const installation=JSON.parse(await pin(sources.installation));assert(await runtime.product.installedProductContentMatches(installation));
const installedManifest=JSON.parse(await pin(sources.installedManifest));assert.equal(runtime.product.sha256Canonical(installedManifest),'sha256:'+c.builder.manifestSha256);
await mkdir(c.runtimeRoot,{mode:0o700});const record=(p,v,raw=false)=>exclusiveRecord(c.runtimeRoot,p,v,raw),env={...c.toolchainEnvironment};
try{
 const config={...c,setupEnvironment:env};
 await record('run.json',{kind:'rc4_native_recovery_operator_setup',runId:c.runId,sourceCommit:c.sourceCommit,builderArchiveSha256:c.builder.archiveSha256,rootSetupSelection:{path:join(dir,'ROOT_SETUP_SELECTION.json'),sha256:process.argv[2]},workspaceAcquisition:c.workspaceAcquisition,nativeDispatch:false,providerCalls:0,meaning:'Fresh ordinary resource setup; source3c3c6e803 is unaccepted HC1 partial custody; no recovery or candidate acceptance.'});
 const native=await verifyArtifact(runtime,{artifactPath:c.builder.archivePath,manifest:installedManifest,expectedArtifactDigest:'sha256:'+c.builder.archiveSha256},record,'abg');
 const commands=commandRecorder(c.runtimeRoot,{environment:env,timeoutMs:300000});
 const command=(label,executable,args,options={})=>commands(label,executable,args,{...options,environment:label==='pack-consumer'?{...env,NPM_CONFIG_CACHE:join(c.runtimeRoot,'setup/npm-cache')}:(options.environment??env)});
 const caller=publicCaller({root:c.runtimeRoot,runtime,native,command,record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
 assert.equal(caller.state.closeHandoff,null);await record('ROOT_SETUP_SELECTION.json',selected);
 const setup=await populateSandbox(caller,c.workspaceAcquisition);
 const actualConsumer=await json(join(c.runtimeRoot,'sandbox/installed/test-consumer/node_modules/@abi5-tests/sandbox-uat/build/publication.json'));
 assert.equal(runtime.product.sha256Canonical(actualConsumer),c.expectedConsumerDeclarationDigest,'Actual installed consumer must be the selected immutable bound8 declaration');
 assert.deepEqual(await readFile(sources.workspaceManifest.path),workspaceBytes,'Original workspace manifest changed');
 assert.equal(git('rev-parse','HEAD'),c.sourceCommit);assert.equal(git('status','--short','--untracked-files=no'),'');
 assert(caller.state.closeHandoff,'Actual owner-returned close handoff required');assert.equal(caller.workspaceAuthority.canonicalRoot,c.worksiteRoot);
 for(const row of inventory.inventory)await pin({path:join(c.bootstrapRoot,row.path),bytes:row.bytes,sha256:row.digest.slice(7)});
 await record('operator-resume-material.json',{config:{...caller.config,setupEnvironment:{keys:Object.keys(env)}},native,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority,state:{closeHandoff:caller.state.closeHandoff,binding:caller.state.binding,resolvedLock:caller.state.resolvedLock,catalog:caller.state.catalog,catalogView:caller.state.catalogView,calls:caller.state.calls},setup});
 await record('summary.json',{status:'fresh_rc3_setup_completed_not_dispatched',sourceCommit:c.sourceCommit,sourceTree:c.sourceTree,sourceStanding:'unfinished partial preservation',builderArchiveSha256:c.builder.archiveSha256,installedRoot:caller.installedRoot,workspaceManifestPreserved:true,workspaceAcquisition:'open',providerCalls:0,RunAdmissions:0,operations:caller.state.calls,qualification:false});
 console.log(JSON.stringify({status:'fresh_rc3_setup_completed_not_dispatched',runtimeRoot:c.runtimeRoot,providerCalls:0,RunAdmissions:0}));
}catch(error){await record('setup-failure.json',{name:error.name,message:error.message,providerCalls:0,RunAdmissions:0,classification:'Preserve actual effects; no retry, stale handoff substitution or invented admission.'});throw error;}
