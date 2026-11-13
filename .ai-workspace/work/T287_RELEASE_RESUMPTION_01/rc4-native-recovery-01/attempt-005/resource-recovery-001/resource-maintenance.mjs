// Root-only exact event-resource maintenance and independent Public read modes.
// No Run invocation, continuation, provider call, source edit or log repair.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,lstat,realpath,readdir} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';
const dir=fileURLToPath(new URL('.',import.meta.url));
const [mode,expectedManifest]=process.argv.slice(2);
assert(process.argv.length===4&&['--recover','--read'].includes(mode)&&/^[a-f0-9]{64}$/u.test(expectedManifest),'usage: node resource-maintenance.mjs --recover|--read MANIFEST_SHA256');
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key))delete process.env[key];
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
async function pin(path){const status=await lstat(path);assert(status.isFile()&&!status.isSymbolicLink(),path);const h=createHash('sha256');let bytes=0;for await(const chunk of createReadStream(path)){h.update(chunk);bytes+=chunk.length;}const after=await lstat(path);assert.equal(status.dev,after.dev);assert.equal(status.ino,after.ino);assert.equal(status.size,bytes);assert.equal(status.mtimeMs,after.mtimeMs);assert.equal(status.ctimeMs,after.ctimeMs);return {path,bytes,sha256:h.digest('hex')};}
async function pinned(r){assert.deepEqual(await pin(r.path),r,r.path);return readFile(r.path);}
async function absent(path){try{await lstat(path);return false;}catch(e){if(e.code==='ENOENT')return true;throw e;}}
async function record(name,value,raw=false){const p=join(dir,name);await mkdir(dirname(p),{recursive:true});await writeFile(p,raw?value:JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});}
const manifestBytes=await readFile(join(dir,'MANIFEST.json'));assert.equal(sha(manifestBytes),expectedManifest);
const manifest=JSON.parse(manifestBytes);assert.equal(manifest.status,'PREPARED_FOR_ROOT_REVIEW_NO_EXECUTION');
for(const p of manifest.files)await pinned(p);
const s=JSON.parse(await pinned(manifest.selection));
process.env.TMPDIR=s.runtimeTmp.path;
assert.equal(tmpdir(),s.runtimeTmp.path);assert.equal(await realpath(s.runtimeTmp.path),s.runtimeTmp.path);
const tmpStat=await lstat(s.runtimeTmp.path);assert(tmpStat.isDirectory()&&!tmpStat.isSymbolicLink());assert.equal(tmpStat.dev,s.runtimeTmp.device);assert.equal(tmpStat.ino,s.runtimeTmp.inode);assert.equal(tmpStat.uid,s.runtimeTmp.uid);
const within=(a,b)=>a===b||a.startsWith(b+'/');
assert(![s.worksite,...s.protectedRoots,...s.nativeWritableRoots].some(root=>within(s.runtimeTmp.path,root)||within(root,s.runtimeTmp.path)));
assert.equal(execFileSync('/usr/bin/git',['-C',s.worksite,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),s.sourceCommit);
assert.equal(execFileSync('/usr/bin/git',['-C',s.worksite,'rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim(),s.sourceTree);
assert.equal(execFileSync('/usr/bin/git',['-C',s.worksite,'status','--short','--untracked-files=no'],{encoding:'utf8'}),'');
async function checkLog(){const identity=await lstat(s.currentLog.path);assert.equal(identity.dev,s.currentLog.device);assert.equal(identity.ino,s.currentLog.inode);assert.deepEqual(await pin(s.currentLog.path),{path:s.currentLog.path,bytes:s.currentLog.bytes,sha256:s.currentLog.sha256});return {device:identity.dev,inode:identity.ino,bytes:identity.size,sha256:s.currentLog.sha256};}
async function checkInstalled(){await pinned(s.builderArtifact);const inventory=JSON.parse(await pinned(s.installedInventory));assert.equal(inventory.members,5321);assert.equal(inventory.artifactDigest,s.builderRequest.expectedArtifactDigest);assert.equal(await realpath(s.installedRoot),s.installedRoot);for(const r of inventory.inventory)await pinned({path:join(s.installedRoot,r.path),bytes:r.bytes,sha256:r.digest.slice(7)});for(const r of s.otherInstalledFiles)await pinned(r);return {nativeMembers:inventory.members,otherMembers:s.otherInstalledFiles.length,unchanged:true};}
function checkQuiescence(){for(const pid of s.knownStoppedPids){try{process.kill(pid,0);throw Error('Known previous process remains live: '+pid);}catch(e){if(e.code!=='ESRCH')throw e;}}const rows=execFileSync('/bin/ps',['-axo','pid=,command='],{encoding:'utf8'}).split('\n');const conflicts=rows.filter(row=>row.includes(s.worksite)||row.includes(join(s.installedRoot,'build/code/src/public/cli.js')));assert.equal(conflicts.length,0,'Worksite/installed CLI process still present');return {knownPidsAbsent:s.knownStoppedPids,matchingWorksiteOrInstalledCliProcesses:0};}
const genuine=JSON.parse(await pinned(s.genuinePredecessor));const original=JSON.parse(await pinned(s.setupResume));
assert.equal(genuine.installedRoot,original.installedRoot);assert.deepEqual(genuine.workspaceAuthority,original.workspaceAuthority);
assert.deepEqual(original.native.request,s.builderRequest);assert.equal(genuine.state.closeHandoff.prefix.prefixLength,208880619);
assert.equal(s.runtimeTmp.lockPath,join(tmpdir(),'abiogenesis-event-store-locks-v5',s.currentLog.device+'-'+s.currentLog.inode+'.lock'));
const safeEnvironment={PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',TMPDIR:s.runtimeTmp.path,NODE_OPTIONS:'--max-old-space-size=8192'};
const selectedMode=mode.slice(2);assert(await absent(join(dir,selectedMode+'-STARTED.json')),'Mode already attempted; no automatic retry');
const before=await checkLog();await checkInstalled();const quiescence=checkQuiescence();assert(await absent(s.runtimeTmp.lockPath),'Selected ordinary runtime lock already exists');
if(mode==='--recover')assert.deepEqual(await readdir(s.runtimeTmp.path),[],'Recovery starts from the explicitly prepared empty runtime tmp directory');
await record(selectedMode+'-STARTED.json',{at:new Date().toISOString(),operator:'Root',pid:process.pid,mode,manifestSha256:expectedManifest,sourceCommit:s.sourceCommit,currentLog:before,quiescence,runtimeTmp:s.runtimeTmp,providerCalls:0,RunAdmissions:0});
let operationError=null;
try{
 if(mode==='--recover'){
  // Import only the installed maintenance owner in this mode.
  const owner=await import(pathToFileURL(join(s.installedRoot,'build/code/src/abg/event_store.js')).href);
  const selection={lastCloseHandoff:genuine.state.closeHandoff,recoveryCase:'lock_absent',lockPath:s.runtimeTmp.lockPath,expectedCurrent:{byteLength:s.currentLog.bytes,digest:'sha256:'+s.currentLog.sha256}};
  await record('maintenance-selection.json',selection);
  const result=owner.recoverInterruptedEventStore(selection);await record('maintenance-result.json',result);
  assert.equal(result?.kind,'recovered','Maintenance refused; retained exact result, no fallback');
  const handoff=result.closeHandoff;assert(handoff&&handoff.prefix&&handoff.reopenAuthority);
  assert.equal(handoff.prefix.prefixLength,s.currentLog.bytes);assert.equal(handoff.prefix.prefixDigest,'sha256:'+s.currentLog.sha256);
  assert.equal(fileURLToPath(handoff.prefix.eventLogRef),s.currentLog.path);assert.equal(handoff.reopenAuthority.device,s.currentLog.device);assert.equal(handoff.reopenAuthority.inode,s.currentLog.inode);
  assert(await absent(s.runtimeTmp.lockPath),'Maintenance did not release its ordinary lock');
  await checkLog();await checkInstalled();
  const state={...genuine.state,closeHandoff:handoff,environment:null,calls:[]};
  const resume={...original,state,installedRoot:genuine.installedRoot,workspaceAuthority:genuine.workspaceAuthority,config:{...original.config,runId:'rc4-attempt005-resource-recovery-001',sourceCommit:s.sourceCommit,setupEnvironment:safeEnvironment,toolchainEnvironment:safeEnvironment,provider:{enabled:false}}};
  await record('recovered-close-handoff.json',handoff);await record('recovered-operator-resume.json',resume);
  await record('RECOVERY_RESULT.json',{status:'RECOVERED_EVENT_RESOURCE_ONLY',at:new Date().toISOString(),ownerResult:await pin(join(dir,'maintenance-result.json')),handoff:await pin(join(dir,'recovered-close-handoff.json')),resume:await pin(join(dir,'recovered-operator-resume.json')),validatedEventCount:result.validatedEventCount,eventLogUnchanged:true,installedUnchanged:true,providerCalls:0,RunAdmissions:0,acceptance:false});
 }else{
  const recovered=await json(join(dir,'RECOVERY_RESULT.json'));assert.equal(recovered.status,'RECOVERED_EVENT_RESOURCE_ONLY');
  const resume=JSON.parse(await pinned(recovered.resume));const handoff=JSON.parse(await pinned(recovered.handoff));assert.deepEqual(resume.state.closeHandoff,handoff);
  assert.equal(handoff.prefix.prefixLength,s.currentLog.bytes);assert.equal(handoff.prefix.prefixDigest,'sha256:'+s.currentLog.sha256);
  const local=s.operatorClosure.map(r=>r.path);for(const r of s.operatorClosure)await pinned(r);
  const {installedModules,publicCaller,emptyAuthoritySlots}=await import(pathToFileURL(local[0]).href);
  const {commandRecorder}=await import(pathToFileURL(local[1]).href);
  const runtime=await installedModules(s.installedRoot),{product,abg,api}=runtime;
  const readOwner=await import(pathToFileURL(join(s.installedRoot,'build/code/src/abg/project_read_ports.js')).href);
  const root=join(dir,'reads');await mkdir(root);const write=(name,value,raw=false)=>record('reads/'+name,value,raw);
  const config={...resume.config,provider:{enabled:false},setupEnvironment:safeEnvironment,toolchainEnvironment:safeEnvironment};
  const command=commandRecorder(root,{environment:safeEnvironment,timeoutMs:900000,maxOutputBytes:536870912});
  const caller=publicCaller({root,runtime,native:resume.native,command,record:write,config,actorRef:'actor://abiogenesis/operator/codex-root'});
  Object.assign(caller.state,resume.state);caller.installedRoot=s.installedRoot;caller.workspaceAuthority=resume.workspaceAuthority;
  await write('run.json',{kind:'operator_public_reads_only',sourceCommit:s.sourceCommit,manifestSha256:expectedManifest,RunAdmissions:0,providerCalls:0});
  const outcomes=[];let validReturnedHandoffs=true;
  for(const target of s.targets){
   const prefix=caller.state.closeHandoff.prefix,env=caller.refresh();
   const coordinates=readOwner.prepareRunReadAtDurablePrefix(prefix,target.memberKey,target.targetRef);
   if(coordinates===null){await write(target.memberKey+'-coordinate-unavailable.json',{target,coordinates:null});outcomes.push({memberKey:target.memberKey,status:'coordinate_unavailable',source:null});validReturnedHandoffs=false;continue;}
   assert.equal(coordinates.source.ref,target.targetRef);assert.deepEqual(coordinates.workspaceBinding,caller.state.binding);
   await write(target.memberKey+'-owned-source.json',{target,source:coordinates.source,workspaceBinding:coordinates.workspaceBinding});
   const packet=abg.ABG_PROJECT_READ_CONTRACTS[target.memberKey];
   const grants=packet.metadata.capabilityRefs.map(cap=>product.constructCapabilityGrant(env.workspaceAuthorityBasis,caller.actorRef,packet.definitionKey.operationId,cap,{admittedInstalls:env.productInstalls,workspaceBinding:env.workspaceBinding,fixedPacket:packet}));
   const slots={...emptyAuthoritySlots(),workspace_binding:caller.state.binding,product_set:env.productInstalls.map(product.productInstallCoordinate),dependency_lock:{ref:env.workspaceBinding.lockId,digest:env.workspaceBinding.lockDigest},capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))}};
   const request={caseKey:target.memberKey,source:{sourceKind:target.sourceKind,sourceRef:coordinates.source.ref,sourceDigest:coordinates.source.digest},projectionBasis:{projectionBasisRef:prefix.eventLogRef,projectionBasisDigest:prefix.coordinateDigest},selector:target.memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:4096}:{kind:'none'}};
   const call=api.constructInstalledPublicDefinitionCall({product,installedPublic:api,definitionContractCoordinates:resume.native.verified.definitionContractCoordinates,contractCatalog:caller.contractCatalog,...packet.definitionKey,request,slots,resources:{kind:'abg_project_read_resource_assertion',schemaVersion:'5.0.0',eventResource:caller.reopen()},requestRef:'request://abiogenesis/operator/rc4-resource-recovery-001/'+target.memberKey,correlationRef:'correlation://abiogenesis/operator/rc4-resource-recovery-001',eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(root,'run.json')).href]});
   try{
    const observed=await caller.invoke(target.memberKey,call,{runtimeRoot:s.installedRoot,environment:safeEnvironment,expectResult:false});
    const receipt=observed.receipt??null,returnedHandoff=receipt?.resources?.eventResource?.closeHandoff??null;
    outcomes.push({memberKey:target.memberKey,source:coordinates.source,exitCode:observed.execution.exitCode,ownerOutput:receipt?.ownerOutput??null,resources:receipt?.resources??null,returnedHandoffPresent:returnedHandoff!==null});
    if(returnedHandoff===null){validReturnedHandoffs=false;break;}
    assert.equal(product.sha256Canonical(returnedHandoff.prefix),product.sha256Canonical(prefix),'Read changed prefix');
   }catch(error){await write(target.memberKey+'-failure.json',{name:error.name,message:error.message,observation:error.observation??null});outcomes.push({memberKey:target.memberKey,status:'fault',message:error.message});validReturnedHandoffs=false;break;}
   await checkLog();assert(await absent(s.runtimeTmp.lockPath),'Public read retained unexpected lock');
  }
  await write('read-outcomes.json',outcomes);await checkLog();await checkInstalled();
  if(validReturnedHandoffs&&outcomes.length===s.targets.length)await record('public-read-operator-resume.json',{...resume,state:caller.state});
  await record('READ_RESULT.json',{status:validReturnedHandoffs?'READS_RETAINED':'READ_FAULT_OR_COORDINATE_GAP_RETAINED',outcomes:await pin(join(root,'read-outcomes.json')),finalOperatorResumeWritten:validReturnedHandoffs&&outcomes.length===s.targets.length,eventLogUnchanged:true,installedUnchanged:true,providerCalls:0,RunAdmissions:0,acceptance:false});
 }
}catch(error){operationError=error;await record(selectedMode+'-failure.json',{at:new Date().toISOString(),name:error.name,message:error.message,observation:error.observation??null,meaning:'Retain actual fault/refusal. No guessed handoff, retry, truncation or Product repair.'});}
finally{
 try{const current=await checkLog(),installed=await checkInstalled();await record(selectedMode+'-preservation.json',{currentLog:current,installed,lockAbsent:await absent(s.runtimeTmp.lockPath),providerCalls:0,RunAdmissions:0});}
 catch(error){await record(selectedMode+'-preservation-failure.json',{name:error.name,message:error.message});operationError??=error;}
}
if(operationError)throw operationError;
console.log(JSON.stringify({mode,status:'records_retained',directory:dir,providerCalls:0,RunAdmissions:0}));
