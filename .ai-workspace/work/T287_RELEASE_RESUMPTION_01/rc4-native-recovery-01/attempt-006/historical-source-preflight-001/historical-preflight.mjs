// Prepared Writer artifact. Root alone may execute after exact packet review.
// One native-child Public read plus actual historical prepare-testing diagnostic; no maintenance or Run.
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
assert(process.argv.length===3&&/^[a-f0-9]{64}$/u.test(manifestHash),'usage: node historical-preflight.mjs MANIFEST_SHA256');
for(const key of Object.keys(process.env))if(/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key))delete process.env[key];
delete process.env.NPM_CONFIG_CACHE;
const sha=b=>createHash('sha256').update(b).digest('hex');
const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
async function pin(path){const a=await lstat(path);assert(a.isFile()&&!a.isSymbolicLink(),path);const h=createHash('sha256');let bytes=0;for await(const b of createReadStream(path)){h.update(b);bytes+=b.length;}const z=await lstat(path);assert.equal(a.dev,z.dev);assert.equal(a.ino,z.ino);assert.equal(a.size,bytes);assert.equal(a.mtimeMs,z.mtimeMs);assert.equal(a.ctimeMs,z.ctimeMs);return{path,bytes,sha256:h.digest('hex')};}
async function verify(r){assert.deepEqual(await pin(r.path),r,r.path);}
async function absent(path){try{await lstat(path);return false;}catch(e){if(e.code==='ENOENT')return true;throw e;}}
async function record(name,value){const path=join(dir,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});}
const manifestBytes=await readFile(join(dir,'MANIFEST.json'));assert.equal(sha(manifestBytes),manifestHash);
const m=JSON.parse(manifestBytes);assert.equal(m.status,'PREPARED_FOR_ROOT_REVIEW_NO_EXECUTION');for(const r of m.files)await verify(r);
const s=await readJson(m.selection.path),prior=s.guard;
const resume=await readJson(s.currentResume.path),original=await readJson(s.originalCall.path),failedCall=await readJson(s.failedCall.path),governanceSource=await readJson(s.governanceSource.path);
assert.deepEqual(failedCall.resources.source,{kind:'admitted_source_result',basis:governanceSource});assert.equal(failedCall.resources.historicalSource,undefined);
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
const safeEnvironment={HOME:'/Users/jim',PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG:'en_US.UTF-8',LC_ALL:'en_US.UTF-8',TMPDIR:prior.runtimeTmp.path,NODE_OPTIONS:'--max-old-space-size=8192'};
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
 const readOwner=await owner('abg/project_read_ports'),prefixOwner=await owner('abg/event_prefix'),eventStore=await owner('abg/event_store'),nativeOwner=await owner('abg/native_worksite_execution'),executionOwner=await owner('abg/invocation_execution_truth'),assemblyOwner=await owner('abg/execution_basis'),terminalOwner=await owner('abg/terminal_result_contracts'),admitOwner=await owner('shared/admit/index'),declarationOwner=await owner('product/declaration_closure');
 const full=prefixOwner.readOwnedRuntimeEventPrefixAtDurablePrefix(resume.state.closeHandoff.prefix);
 const nativeRows=prefixOwner.indexedRuntimeEvents(full,'payload:resultRef:'+s.nativeResultRef).filter(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===s.nativeResultRef);assert.equal(nativeRows.length,1);
 const nativeSource=nativeOwner.projectNativeWorkspaceWorkSourceAtPrefix(full,nativeRows[0].payload.value);assert(nativeSource!==null,'Native source owner refused selected observation');assert.equal(nativeSource.sourceResult.graphCallId,s.graphCallRef);assert.equal(nativeSource.sourceResult.payload.resultRef,s.nativeResultRef);
 await record('native-source-coordinate.json',{sourceBasisRef:nativeSource.sourceBasis.basisRef,resultEventRef:nativeSource.sourceResult.eventId,resultRef:nativeSource.sourceResult.payload.resultRef,resultDigest:nativeSource.sourceResult.payload.resultDigest,graphCallRef:nativeSource.sourceResult.graphCallId,sourceClosedEventRef:nativeSource.sourceClosedEvent.eventId});
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
 assert(terminalOwner.isAbgTypedTerminalResult(terminal),'No genuine typed terminal result');assert.equal(terminal.result.ref,s.nativeResultRef);assert.equal(terminal.result.digest,nativeSource.sourceResult.payload.resultDigest);
 assert.equal(terminal.producer.runRef,s.runRef);assert.equal(terminal.producer.graphCallRef,s.graphCallRef);assert.equal(terminal.valueDigest,product.sha256Canonical(terminal.value));
 // Genuine Public native terminal is distinct from outer GovernanceWorkState source54e.
 const invocation=executionOwner.projectExactInvocationAdmissionAtPrefix(full,terminal.producer.invocationAdmissionRef);assert(invocation!==null);
 const nativeClosure=declarationOwner.resolveExecutionDeclarationClosure(catalog,catalogView,invocation.programRef,invocation.graphFunctionRef);assert.equal(nativeClosure.kind,'resolved_execution_declaration_closure');
 const nativeGraphs=nativeClosure.publications.flatMap(p=>p.graphFunctions).filter(g=>g.name===nativeSource.sourceBasis.graphFunctionRef&&product.sha256Canonical(g)===nativeSource.sourceBasis.graphFunctionDigest);assert.equal(nativeGraphs.length,1);assert.equal(nativeGraphs[0].inputs.length,1);
 const {value:_nativeValue,projectionBasis:_nativeProjection,...terminalSelection}=terminal;
 const checked=admitOwner.admitContract(terminalOwner.ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA,{kind:'abg_historical_graph_call_source_resource',schemaVersion:'5.0.0',terminal:terminalSelection,input:{graphFunctionRef:nativeSource.sourceBasis.graphFunctionRef,contractRef:nativeGraphs[0].inputs[0]},declarationProof});
 await record('historical-resource-schema-check.json',checked.kind==='ok'?{kind:'ok'}:checked);assert.equal(checked.kind,'ok');
 const immutable=admitOwner.admitJson(checked.value);assert.equal(immutable.kind,'ok');const historicalSource=immutable.value;
 const projected=readOwner.projectHistoricalGraphCallSourceAtDurablePrefix(handoff.prefix,historicalSource);assert(projected!==null,'Historical resource owner rejected exact native terminal/ancestor/input');assert.deepEqual(projected.terminalResult,terminal);assert.deepEqual(projected.input.value,nativeSource.sourceBasis.rawInputValue);
 await record('historical-source.json',historicalSource);await record('historical-source-owner-check.json',{status:'OWNER_PROJECTED',nativeResult:terminal.result,input:{graphFunctionRef:projected.input.graphFunctionRef,contractRef:projected.input.contractRef,valueDigest:product.sha256Canonical(projected.input.value)},publicationDigest:product.sha256Canonical(projected.publication),governanceStateSourceUnchanged:governanceSource.basisRef});
 // This is the real opened transaction's selected-no-evidence cut, never a reopen handoff.
 const cut=eventStore.durableRuntimeEventPrefixThroughEvent(handoff.prefix,s.failedOccurrence.fibreEventRef);await record('historical-diagnostic-prefix.json',cut);
 const historical=prefixOwner.readOwnedRuntimeEventPrefixAtDurablePrefix(cut);
 const selected=prefixOwner.indexedRuntimeEvents(historical,'id:'+s.failedOccurrence.fibreEventRef);assert.equal(selected.length,1);assert.equal(selected[0].kind,'c_call_fibre_selected');assert.equal(selected[0].aggregateId,s.failedOccurrence.cCallRef);assert.equal(selected[0].payload.implementationRef,'implementation://abiogenesis/default-library/prepare-testing@5');
 const execution=executionOwner.projectExactExecutionBasisAtPrefix(historical,s.failedOccurrence.executionBasisRef);assert(execution!==null);
 const failedInvocation=executionOwner.projectExactInvocationAdmissionAtPrefix(historical,execution.invocationAdmissionRef);assert(failedInvocation!==null);assert.equal(failedInvocation.catalogBasisDigest,catalog.basisDigest);assert.equal(failedInvocation.catalogViewDigest,catalogView.viewDigest);
 const closure=declarationOwner.resolveExecutionDeclarationClosure(catalog,catalogView,failedInvocation.programRef,failedInvocation.graphFunctionRef);assert.equal(closure.kind,'resolved_execution_declaration_closure');
 const declarations=closure.publications.flatMap(p=>p.graphFunctions),graphs=declarations.filter(g=>g.name===execution.graphFunctionRef&&product.sha256Canonical(g)===execution.graphFunctionDigest);assert.equal(graphs.length,1);
 const graphFunction=graphs[0],materializer=await owner('gtl/materialize'),cursorOwner=await owner('abg/traversal_cursor'),callOwner=await owner('abg/c_call');
 const graph=materializer.materializeGraph(graphFunction,{invocationAdmissionRef:execution.invocationAdmissionRef,admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:execution.rawInputValue});
 const opened=callOwner.projectOpenedCCallCarrierAtPrefix(historical,graph,s.failedOccurrence.cCallRef);assert(opened!==null);assert.equal(opened.openedEventRef,s.failedOccurrence.openedEventRef);
 const origin=cursorOwner.projectOpenedCCallTraversalInputAtPrefix(historical,graph,s.failedOccurrence.cCallRef);assert(origin!==null);assert.deepEqual(origin.execution,execution);assert.equal(callOwner.projectCCallCarrierPhaseAtPrefix(historical,opened)?.phase,'selected_no_evidence');
 const basis=assemblyOwner.constructNativeInstructionAssemblyBasis({publication:closure.programPublication,graph,graphFunction,declarationGraphFunctions:declarations,executionBasis:execution,cCall:opened,cursor:origin.cursor,predecessorPrefix:cut});assert(basis!==null,'Actual historical occurrence assembly owner refused');
 const exactInput=origin.input.value;assert(product.isGovernanceWorkState(exactInput));assert.equal(exactInput.synthesis.judgment.subjectEvidenceRef,s.nativeResultRef);assert.deepEqual(exactInput.original,governanceSource.sourceResultValue.original);
 await record('assembly-coordinate.json',{cCallRef:opened.cCallRef,executionBasisRef:execution.basisRef,cursorRef:origin.cursor.cursorRef,inputDigest:product.sha256Canonical(exactInput),selectedSubjectRef:exactInput.synthesis.judgment.subjectEvidenceRef,phase:'selected_no_evidence',source:'existing constructor over actual admitted historical occurrence',diagnosticOnly:true});
 const ambientOwner=await owner('abg/actor_process'),governanceOwner=await owner('abg/default_library'),reacquisitionOwner=await owner('abg/native_work_reacquisition');
 // Same ambient values as actual006, with no provider environment or Run execution.
 const ambientNames=['HOME','TMPDIR','LANG','LC_ALL','PATH'];assert.equal(new Set(s.actualAmbient.map(r=>r.name)).size,s.actualAmbient.length);for(const key of ambientNames)delete process.env[key];for(const row of s.actualAmbient){assert(ambientNames.includes(row.name)&&typeof row.value==='string'&&!row.value.includes('\0'));process.env[row.name]=row.value;}assert.equal(process.env.TMPDIR,prior.runtimeTmp.path);assert.equal(process.env.NPM_CONFIG_CACHE,undefined);assert(!Object.keys(process.env).some(key=>/CLAUDE|ANTHROPIC|OPENAI|AZURE_OPENAI|PROVIDER/iu.test(key)));
 const ambient=ambientOwner.selectedWorksiteCommandAmbientEnvironment();assert.deepEqual(ambient,s.actualAmbient);await record('actual-ambient.json',ambient);
 let observedContext=null;
 async function diagnose(label,resource){
  const refusals=[],contexts=[];let entered=false;
  const refusal=(stage,relation,selectors={},error)=>refusals.push({stage,relation,selectors,error:error===undefined?null:{name:error.name??null,message:error.message??String(error)}});
  const task=await governanceOwner.projectGovernanceTestingTask(basis,exactInput,(context,report)=>{entered=true;contexts.push({observationRef:context.observationRef,observationDigest:context.observationDigest,entries:context.entries.length});if(observedContext===null)observedContext=context;else assert.deepEqual(context,observedContext,'Worksite changed between control and corrected case');return reacquisitionOwner.prepareGovernanceNativeWorkReacquisition(basis,exactInput,context,resource,report,ambient);},refusal,ambient);
  await record(label+'-diagnostic.json',{classification:'counterfactual actual historical preparation occurrence; no admitted Result or runtime continuation',task,refusals,contexts,reacquisitionEntered:entered,providerCalls:0,RunAdmissions:0,C2Commands:0});
  return{task,refusals,reacquisitionEntered:entered};
 }
 const before=await diagnose('omitted-resource',undefined);
 assert(before.task===null&&before.reacquisitionEntered&&before.refusals.some(r=>r.stage==='native_historical_declaration'&&r.relation==='resource_absent'),'Omitted resource did not reproduce actual006; stop before corrected case');
 const corrected=await diagnose('corrected-resource',historicalSource);
 if(observedContext!==null)await record('actual-worksite-context.json',observedContext);
 const firstRefusal=corrected.refusals[0]??null;
 await record('PREFLIGHT_RESULT.json',{status:corrected.task===null?'NEXT_TYPED_REFUSAL_RETAINED':'ACTUAL_OWNER_C2_TASK_CONSTRUCTED_COUNTERFACTUALLY',omissionReproduced:true,correctedTaskKind:corrected.task?.kind??null,firstRefusal,sourceCommit:prior.sourceCommit,governanceSourceBasisRef:governanceSource.basisRef,nativeResultRef:s.nativeResultRef,currentPrefix:handoff.prefix,historicalDiagnosticPrefix:cut,providerCalls:0,RunAdmissions:0,C2Commands:0,paidRetrySelected:false,nativeTesting:false,R2Closure:false,qualification:false});
 assert(corrected.task!==null||firstRefusal!==null,'No task and no typed refusal; missing owner diagnostic');
}catch(error){failure=error;await record('FAULT.json',{at:new Date().toISOString(),name:error.name,message:error.message,observation:error.observation??null,providerCalls:0,RunAdmissions:0,meaning:'Exact fault retained. No fabricated SourceUse, handoff, retry or Run.'});}
finally{try{await record('PRESERVATION.json',{...await preservation(),lockAbsent:await absent(prior.runtimeTmp.lockPath)});}catch(error){await record('PRESERVATION_FAILURE.json',{name:error.name,message:error.message});failure??=error;}}
if(failure)throw failure;
console.log(JSON.stringify({directory:dir,status:'historical_source_and_counterfactual_preflight_retained',providerCalls:0,RunAdmissions:0}));
