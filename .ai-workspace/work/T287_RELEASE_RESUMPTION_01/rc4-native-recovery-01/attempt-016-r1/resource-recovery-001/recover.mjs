// Root-only existing event-resource maintenance. No Public/Run/provider calls.
import assert from 'node:assert/strict';
import {readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=fileURLToPath(new URL('.',import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const expected=process.argv[2];assert(process.argv.length===3&&/^[a-f0-9]{64}$/.test(expected));
for(const k of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|PROVIDER/i.test(k)||k==='NPM_CONFIG_CACHE')delete process.env[k];
const record=(n,v)=>writeFile(join(dir,n),JSON.stringify(v,null,2)+'\n',{flag:'wx',mode:0o600});
async function pin(path){const st=await lstat(path);assert(st.isFile()&&!st.isSymbolicLink());const h=createHash('sha256');let bytes=0;for await(const b of createReadStream(path)){h.update(b);bytes+=b.length;}const after=await lstat(path);assert.equal(st.ino,after.ino);assert.equal(st.dev,after.dev);assert.equal(st.mtimeMs,after.mtimeMs);assert.equal(bytes,after.size);return{path,bytes,sha256:h.digest('hex')};}
async function pinned(p){assert.deepEqual(await pin(p.path),p);return readFile(p.path);}
const manifestBytes=await readFile(join(dir,'MANIFEST.json'));assert.equal(sha(manifestBytes),expected);const manifest=JSON.parse(manifestBytes);for(const p of manifest.files)await pinned(p);
const s=JSON.parse(await pinned(manifest.selection)),prior=JSON.parse(await pinned(s.previousBinding));
process.env.TMPDIR=s.runtimeTmp.path;assert.equal(await realpath(s.runtimeTmp.path),s.runtimeTmp.path);const tmp=await lstat(s.runtimeTmp.path);assert(tmp.isDirectory()&&!tmp.isSymbolicLink());assert.equal(tmp.dev,s.runtimeTmp.device);assert.equal(tmp.ino,s.runtimeTmp.inode);
const guards=await import(pathToFileURL(s.builtinGuards.path).href);
function quiescence(){for(const pid of s.knownStoppedPids){try{process.kill(pid,0);throw Error('Prior process live '+pid);}catch(e){if(e.code!=='ESRCH')throw e;}}const rows=execFileSync('/bin/ps',['-axo','pid=,command='],{encoding:'utf8'}).split('\n');assert(!rows.some(r=>r.includes(join(s.installedRoot,'build/code/src/public/cli.js'))||r.includes(s.taskDigest)),'Runtime/actor/helper remains');}
function source(){assert.equal(execFileSync('/usr/bin/git',['-C',s.worksite,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),s.sourceCommit);assert.equal(execFileSync('/usr/bin/git',['-C',s.worksite,'rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim(),s.sourceTree);assert.equal(execFileSync('/usr/bin/git',['-C',s.worksite,'status','--short','--untracked-files=no'],{encoding:'utf8'}),'');}
async function log(){const st=await lstat(s.currentLog.path);assert.equal(st.dev,s.currentLog.device);assert.equal(st.ino,s.currentLog.inode);assert.deepEqual(await pin(s.currentLog.path),{path:s.currentLog.path,bytes:s.currentLog.bytes,sha256:s.currentLog.sha256});}
async function preserve(){await log();source();for(const p of s.sourceFiles)await pinned(p);await guards.checkInstalled(prior);await guards.checkDependency(prior);}
const req=JSON.parse(await pinned(s.genuinePredecessorRequest)),lastCloseHandoff=req.acquisition.closeHandoff;assert.equal(req.acquisition.kind,'reopen');assert.equal(fileURLToPath(lastCloseHandoff.prefix.eventLogRef),s.currentLog.path);assert.equal(lastCloseHandoff.reopenAuthority.device,s.currentLog.device);assert.equal(lastCloseHandoff.reopenAuthority.inode,s.currentLog.inode);
await pinned(s.maintenanceOwner);await pinned(s.baselineResume);quiescence();await preserve();
const ls=await lstat(s.abandonedLock.path),lb=await readFile(s.abandonedLock.path);assert(ls.isFile()&&!ls.isSymbolicLink());assert.equal(ls.dev,s.abandonedLock.device);assert.equal(ls.ino,s.abandonedLock.inode);assert.equal(lb.toString('base64'),s.abandonedLock.bytesBase64);assert.equal('sha256:'+sha(lb),s.abandonedLock.digest);assert.equal(JSON.parse(lb).ownerPid,s.ownerPid);quiescence();
await record('STARTED.json',{operator:'Root',at:new Date().toISOString(),pid:process.pid,manifestSha256:expected,sourceCommit:s.sourceCommit,providerCalls:0,RunAdmissions:0});
let fault;
try{
 const owner=await import(pathToFileURL(s.maintenanceOwner.path).href);
 const selection={lastCloseHandoff,ownerPid:s.ownerPid,expectedCurrent:{byteLength:s.currentLog.bytes,digest:'sha256:'+s.currentLog.sha256},abandonedLock:s.abandonedLock};await record('maintenance-selection.json',selection);
 const result=owner.recoverInterruptedEventStore(selection);await record('maintenance-result.json',result);assert.equal(result?.kind,'recovered','Existing owner refused; exact output retained, no fallback');
 const handoff=result.closeHandoff;assert.equal(handoff.prefix.prefixLength,s.currentLog.bytes);assert.equal(handoff.prefix.prefixDigest,'sha256:'+s.currentLog.sha256);assert.equal(fileURLToPath(handoff.prefix.eventLogRef),s.currentLog.path);
 const abg=await import(pathToFileURL(join(s.installedRoot,'build/code/src/abg/index.js')).href);const truth=abg.projectOwnedPrefixArtifactTruth(handoff.prefix);assert(abg.validateExactPrefixArtifactTruthProjection(truth,{requireCurrent:true}),'Recovered current projection unavailable');
 await preserve();try{await lstat(s.abandonedLock.path);throw Error('Recovery retained lock');}catch(e){if(e.code!=='ENOENT')throw e;}
 await record('recovered-close-handoff.json',handoff);
 const baseline=JSON.parse(await pinned(s.baselineResume));assert.equal(baseline.installedRoot,s.installedRoot);const resume={...baseline,state:{...baseline.state,closeHandoff:handoff,environment:null,calls:[]},config:{...baseline.config,sourceCommit:s.sourceCommit,runId:'rc4-attempt016-resource-recovery-001',provider:{enabled:false}}};await record('recovered-operator-resume.json',resume);
 await record('RECOVERY_RESULT.json',{status:'RECOVERED_RESOURCE_ONLY_NO_RUN_CONTINUATION',at:new Date().toISOString(),handoff:await pin(join(dir,'recovered-close-handoff.json')),resume:await pin(join(dir,'recovered-operator-resume.json')),validatedEventCount:result.validatedEventCount,eventBytesUnchanged:true,installedUnchanged:true,sourceUnchanged:true,dependenciesUnchanged:true,providerCalls:0,RunAdmissions:0,acceptance:false});
}catch(e){fault=e;await record('FAULT.json',{at:new Date().toISOString(),name:e.name,message:e.message,observation:e.observation??null,meaning:'No fallback, stale handoff, retry or fabricated current prefix.'});}
finally{try{await preserve();await record('PRESERVATION.json',{log:s.currentLog,sourceCommit:s.sourceCommit,eventBytesUnchanged:true,installedUnchanged:true,sourceUnchanged:true,dependenciesUnchanged:true});}catch(e){fault??=e;await record('PRESERVATION_FAULT.json',{name:e.name,message:e.message});}}
if(fault)throw fault;console.log(JSON.stringify({status:'RECOVERED_RESOURCE_ONLY',providerCalls:0,RunAdmissions:0}));
