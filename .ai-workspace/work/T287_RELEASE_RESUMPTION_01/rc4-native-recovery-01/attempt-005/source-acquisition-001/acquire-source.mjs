// Prepared Writer artifact. Root alone may execute after exact packet review.
// One Public read plus pure existing-owner source eligibility; no maintenance or Run.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,lstat,realpath} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';
const dir=fileURLToPath(new URL('.',import.meta.url));
const [manifestHash]=process.argv.slice(2);
assert(process.argv.length===3&&/^[a-f0-9]{64}$/u.test(manifestHash),'usage: node acquire-source.mjs MANIFEST_SHA256');
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key))delete process.env[key];
const sha=b=>createHash('sha256').update(b).digest('hex');
const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
async function pin(path){const a=await lstat(path);assert(a.isFile()&&!a.isSymbolicLink(),path);const h=createHash('sha256');let bytes=0;for await(const b of createReadStream(path)){h.update(b);bytes+=b.length;}const z=await lstat(path);assert.equal(a.dev,z.dev);assert.equal(a.ino,z.ino);assert.equal(a.size,bytes);assert.equal(a.mtimeMs,z.mtimeMs);assert.equal(a.ctimeMs,z.ctimeMs);return{path,bytes,sha256:h.digest('hex')};}
async function verify(r){assert.deepEqual(await pin(r.path),r,r.path);}
async function absent(path){try{await lstat(path);return false;}catch(e){if(e.code==='ENOENT')return true;throw e;}}
async function record(name,value){const path=join(dir,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});}
const manifestBytes=await readFile(join(dir,'MANIFEST.json'));assert.equal(sha(manifestBytes),manifestHash);
const m=JSON.parse(manifestBytes);assert.equal(m.status,'PREPARED_FOR_ROOT_REVIEW_NO_EXECUTION');for(const r of m.files)await verify(r);
const s=await readJson(m.selection.path),prior=await readJson(s.priorSelection.path);
const oldManifest=await readJson(s.priorManifest.path);for(const r of oldManifest.files)await verify(r);
const resume=await readJson(s.currentResume.path),original=await readJson(s.originalCall.path);
assert.equal(await realpath(process.execPath),prior.node.path);
process.env.TMPDIR=prior.runtimeTmp.path;assert.equal(tmpdir(),prior.runtimeTmp.path);
assert.equal(await realpath(prior.runtimeTmp.path),prior.runtimeTmp.path);
const tmp=await lstat(prior.runtimeTmp.path);assert(tmp.isDirectory()&&!tmp.isSymbolicLink());assert.equal(tmp.dev,prior.runtimeTmp.device);assert.equal(tmp.ino,prior.runtimeTmp.inode);assert.equal(tmp.uid,prior.runtimeTmp.uid);
const within=(a,b)=>a===b||a.startsWith(b+'/');assert(![prior.worksite,...prior.protectedRoots,...prior.nativeWritableRoots].some(r=>within(prior.runtimeTmp.path,r)||within(r,prior.runtimeTmp.path)));
assert.equal(execFileSync('/usr/bin/git',['-C',prior.worksite,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),prior.sourceCommit);
assert.equal(execFileSync('/usr/bin/git',['-C',prior.worksite,'rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim(),prior.sourceTree);
assert.equal(execFileSync('/usr/bin/git',['-C',prior.worksite,'status','--short','--untracked-files=no'],{encoding:'utf8'}),'');
async function preservation(){const log=await lstat(prior.currentLog.path);assert.equal(log.dev,prior.currentLog.device);assert.equal(log.ino,prior.currentLog.inode);await verify({path:prior.currentLog.path,bytes:prior.currentLog.bytes,sha256:prior.currentLog.sha256});await verify(prior.builderArtifact);await verify(prior.installedInventory);const inventory=await readJson(prior.installedInventory.path);assert.equal(inventory.members,5321);assert.equal(await realpath(prior.installedRoot),prior.installedRoot);for(const r of inventory.inventory)await verify({path:join(prior.installedRoot,r.path),bytes:r.bytes,sha256:r.digest.slice(7)});for(const r of prior.otherInstalledFiles)await verify(r);for(const r of m.files)await verify(r);return{eventLogUnchanged:true,installedUnchanged:true,pinnedInputsUnchanged:true,providerCalls:0,RunAdmissions:0};}
function quiescence(){for(const pid of prior.knownStoppedPids){try{process.kill(pid,0);throw Error('Previous actor is live: '+pid);}catch(e){if(e.code!=='ESRCH')throw e;}}const rows=execFileSync('/bin/ps',['-axo','pid=,command='],{encoding:'utf8'}).split('\n');assert.equal(rows.filter(r=>r.includes(prior.worksite)||r.includes(join(prior.installedRoot,'build/code/src/public/cli.js'))).length,0,'Worksite/installed CLI process present');}
const safeEnvironment={PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',TMPDIR:prior.runtimeTmp.path,NODE_OPTIONS:'--max-old-space-size=8192'};
assert.equal(resume.installedRoot,prior.installedRoot);assert.equal(resume.state.closeHandoff.prefix.prefixLength,prior.currentLog.bytes);assert.equal(resume.state.closeHandoff.prefix.prefixDigest,'sha256:'+prior.currentLog.sha256);
assert(await absent(join(dir,'STARTED.json')),'One-shot acquisition already attempted');
await preservation();quiescence();assert(await absent(prior.runtimeTmp.lockPath),'Ordinary runtime lock is present');
await record('STARTED.json',{at:new Date().toISOString(),operator:'Root',pid:process.pid,manifestSha256:manifestHash,sourceCommit:prior.sourceCommit,providerCalls:0,RunAdmissions:0});
let failure=null;
try{
 const {installedModules,publicCaller,emptyAuthoritySlots}=await import(pathToFileURL(prior.operatorClosure[0].path).href);
 const {commandRecorder}=await import(pathToFileURL(prior.operatorClosure[1].path).href);
 const runtime=await installedModules(prior.installedRoot),{product,abg,api}=runtime;
 const owner=name=>import(pathToFileURL(join(prior.installedRoot,'build/code/src',name+'.js')).href);
 const readOwner=await owner('abg/project_read_ports');
 const root=join(dir,'read');await mkdir(root);
 const write=async(name,value,raw=false)=>{const path=join(root,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,raw?value:JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});};
 const config={...resume.config,provider:{enabled:false},setupEnvironment:safeEnvironment,toolchainEnvironment:safeEnvironment};
 const command=commandRecorder(root,{environment:safeEnvironment,timeoutMs:900000,maxOutputBytes:536870912});
 const caller=publicCaller({root,runtime,native:resume.native,command,record:write,config,actorRef:'actor://abiogenesis/operator/codex-root'});
 Object.assign(caller.state,resume.state);caller.installedRoot=prior.installedRoot;caller.workspaceAuthority=resume.workspaceAuthority;
 await write('run.json',{kind:'operator_public_source_acquisition_only',manifestSha256:manifestHash,providerCalls:0,RunAdmissions:0});
 const prefix=caller.state.closeHandoff.prefix,env=caller.refresh();
 const coordinates=readOwner.prepareRunReadAtDurablePrefix(prefix,'graph_call_result',s.graphCallRef);
 await record('owned-read-coordinate.json',coordinates);assert(coordinates!==null,'Missing authenticated GraphCall source coordinate');assert.equal(coordinates.source.ref,s.graphCallRef);assert.deepEqual(coordinates.workspaceBinding,caller.state.binding);
 const {catalog,catalogView}=original.resources;
 const declarationProof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog,catalogView};
 const packet=abg.ABG_PROJECT_READ_CONTRACTS.graph_call_result;
 const grants=packet.metadata.capabilityRefs.map(cap=>product.constructCapabilityGrant(env.workspaceAuthorityBasis,caller.actorRef,packet.definitionKey.operationId,cap,{admittedInstalls:env.productInstalls,workspaceBinding:env.workspaceBinding,fixedPacket:packet}));
 const slots={...emptyAuthoritySlots(),workspace_binding:caller.state.binding,product_set:env.productInstalls.map(product.productInstallCoordinate),dependency_lock:{ref:env.workspaceBinding.lockId,digest:env.workspaceBinding.lockDigest},capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))}};
 const request={caseKey:'graph_call_result',source:{sourceKind:'graph_call',sourceRef:coordinates.source.ref,sourceDigest:coordinates.source.digest},projectionBasis:{projectionBasisRef:prefix.eventLogRef,projectionBasisDigest:prefix.coordinateDigest},selector:{kind:'none'}};
 const call=api.constructInstalledPublicDefinitionCall({product,installedPublic:api,definitionContractCoordinates:resume.native.verified.definitionContractCoordinates,contractCatalog:caller.contractCatalog,...packet.definitionKey,request,slots,resources:{kind:'abg_project_read_resource_assertion',schemaVersion:'5.0.0',eventResource:caller.reopen(),declarationProof},requestRef:s.requestRef,correlationRef:s.correlationRef,eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(root,'run.json')).href]});
 const observed=await caller.invoke('graph_call_result',call,{runtimeRoot:prior.installedRoot,environment:safeEnvironment,expectResult:false});
 const receipt=observed.receipt??null,handoff=receipt?.resources?.eventResource?.closeHandoff??null;
 await record('public-read-outcome.json',{exitCode:observed.execution.exitCode,receipt,returnedHandoffPresent:handoff!==null});
 assert(handoff!==null,'Public read returned no authenticated handoff; fault retained, no resume synthesized');
 assert.equal(product.sha256Canonical(handoff.prefix),product.sha256Canonical(prefix),'Read changed prefix');
 assert.deepEqual(caller.state.closeHandoff,handoff);await preservation();assert(await absent(prior.runtimeTmp.lockPath));
 await record('public-read-operator-resume.json',{...resume,state:caller.state});
 assert.equal(observed.execution.exitCode,0,'Public child process failed despite returned resources');
 assert.equal(receipt.ownerOutput?.outcomeKind,'result','Public read refused; exact refusal retained');
 const terminal=receipt.ownerOutput.value?.projection?.terminalResult??null;
 await record('terminal-result.json',terminal);
 const terminalOwner=await owner('abg/terminal_result_contracts');assert(terminalOwner.isAbgTypedTerminalResult(terminal),'No genuine typed terminal result');
 assert.equal(terminal.producer.runRef,s.runRef);assert.equal(terminal.producer.graphCallRef,s.graphCallRef);assert.equal(terminal.valueDigest,product.sha256Canonical(terminal.value));
 const eventStore=await owner('abg/event_store'),prefixOwner=await owner('abg/event_prefix'),invocationOwner=await owner('abg/invocation_admission'),executionOwner=await owner('abg/invocation_execution_truth'),authorityOwner=await owner('public/run_projection_authority');
 const validated=prefixOwner.selectValidatedRuntimeEventPrefix(eventStore.readRuntimeEventsAtDurablePrefix(handoff.prefix));
 const admission=invocationOwner.rehydrateInvocationAdmissionAtPrefix(validated,terminal.producer.invocationAdmissionRef);
 assert(admission!==null,'Missing exact source invocation admission');assert(invocationOwner.hasInvocationRunBindingAtPrefix(validated,admission,s.runRef));
 const execution=executionOwner.projectExactExecutionBasisAtPrefix(validated,terminal.producer.executionBasis.ref);
 assert(execution!==null,'Missing terminal producer execution basis');assert.equal(execution.invocationAdmissionRef,admission.invocationAdmissionRef);
 assert.equal(admission.programRef,original.invocation.request.program.ref);assert.equal(admission.programDigest,original.invocation.request.program.digest);
 assert.deepEqual(terminal.producer.program,{ref:admission.programRef,digest:admission.programDigest});
 assert.equal(admission.workspaceBindingId,caller.state.binding.ref);assert.equal(admission.workspaceBindingDigest,caller.state.binding.digest);
 assert.equal(admission.catalogBasisDigest,catalog.basisDigest);assert.equal(admission.catalogViewDigest,catalogView.viewDigest);
 const publications=catalog.boundPublications;
 const programPublications=publications.filter(p=>p.programs.some(program=>program.programRef===admission.programRef));
 assert.equal(programPublications.length,1,'No unique original Program publication');
 const publication=programPublications[0],installs=env.productInstalls.filter(i=>i.productId===publication.owningProductId&&i.manifestDigest===publication.productManifestDigest&&i.productContentDigest===publication.productContentDigest&&i.artifactDigest===publication.artifactDigest);
 assert.equal(installs.length,1,'No exact admitted ProductInstall for original Program publication');
 const authority=authorityOwner.constructPublicRunProjectionAuthority({prefix:handoff.prefix,reopenAuthority:handoff.reopenAuthority,runtimeInvocationRef:admission.invocationRef,invocationAdmissionRef:admission.invocationAdmissionRef,runId:s.runRef,graphCallId:terminal.producer.graphCallRef,resultRef:terminal.result.ref,outputContractRef:terminal.contract.ref,install:installs[0],workspaceId:admission.workspaceId,workspaceBindingId:admission.workspaceBindingId,workspaceBindingDigest:admission.workspaceBindingDigest,catalogBasisDigest:admission.catalogBasisDigest,catalogReadinessBasis:catalog.readinessBasis,catalogViewAllowlist:catalogView.allowlist,catalogViewDigest:admission.catalogViewDigest,publicationDigests:catalog.publicationDigests,publications});
 assert(authorityOwner.parsePublicRunProjectionAuthority(authority)!==null);
 await record('public-run-projection-authority.json',authority);
 const input={publicAuthorityDigest:authority.authorityDigest,runtimeInvocationRef:admission.invocationRef,invocationAdmissionRef:admission.invocationAdmissionRef,runId:s.runRef,resultRef:terminal.result.ref};
 await record('source-basis-derivation-input.json',input);
 const basis=invocationOwner.deriveInvocationSourceResultBasisAtPrefix(validated,input);
 await record('source-result-basis.json',basis);
 if(basis!==null){
  assert.equal(basis.sourceResultRef,terminal.result.ref);assert.equal(basis.sourceResultDigest,terminal.result.digest);assert.equal(basis.sourceCCallRef,terminal.producer.cCallRef);assert.equal(basis.sourceResultAdmissionEventRef,terminal.producer.resultAdmissionEventRef);assert.equal(basis.sourceResultJudgmentEventRef,terminal.producer.judgmentAdmissionEventRef);assert.equal(basis.sourceGraphCallId,terminal.producer.graphCallRef);assert.deepEqual(basis.sourceResultValue,terminal.value);assert.equal(basis.sourceResultValueDigest,terminal.valueDigest);assert.equal(basis.sourceResultContractRef,original.invocation.request.input.contract.ref);assert.equal(terminal.value.kind,original.invocation.request.input.value.kind);assert.deepEqual(terminal.value.original,original.invocation.request.input.value.original);
 }
 await record('ELIGIBILITY_RESULT.json',{status:basis===null?'OWNER_SOURCE_BASIS_NULL':'OWNER_DERIVED_RETAINED_SOURCE_AVAILABLE_FOR_ROOT_REVIEW',basisRef:basis?.basisRef??null,missingFact:basis===null?'Existing derivation owner did not establish closed/inactive applicable source use for this exact terminal. No alternative source, cause or eligibility is inferred.':null,sourceCommit:prior.sourceCommit,originalTaskUnchanged:basis!==null,providerCalls:0,RunAdmissions:0,pendingFrontierRecovery:false,R2Closure:false,dispatchSelected:false});
}catch(error){failure=error;await record('FAULT.json',{at:new Date().toISOString(),name:error.name,message:error.message,observation:error.observation??null,providerCalls:0,RunAdmissions:0,meaning:'Exact fault retained. No fabricated SourceUse, handoff, retry or Run.'});}
finally{try{await record('PRESERVATION.json',{...await preservation(),lockAbsent:await absent(prior.runtimeTmp.lockPath)});}catch(error){await record('PRESERVATION_FAILURE.json',{name:error.name,message:error.message});failure??=error;}}
if(failure)throw failure;
console.log(JSON.stringify({directory:dir,status:'read_and_owner_eligibility_retained',providerCalls:0,RunAdmissions:0}));
