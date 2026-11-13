// Passive F SDK return custody: the existing B binder and N reference-freezer
// algorithms, with /receipt and the separate actual /closeHandoff owner shapes.
// No acquire/reopen/refresh/read invocation, provider, source mutation or tests.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat,open} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname,join,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getHeapStatistics} from 'node:v8';
import {installedModules} from '../../operator-client/public-setup.mjs';

const out=dirname(fileURLToPath(import.meta.url)),author=dirname(dirname(out));
const sha=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(process.argv[2]);assert.equal(sha(raw),process.argv[3]);const input=JSON.parse(raw);
assert.equal(input.authorRoot,author);assert.equal(input.heapMiB,8192);assert(getHeapStatistics().heap_size_limit>=8192*1024*1024);
const pinned=async p=>{assert(p&&isAbsolute(p.path)&&Number.isSafeInteger(p.bytes)&&/^[a-f0-9]{64}$/u.test(p.sha256));const b=await readFile(p.path);assert.equal(b.length,p.bytes,p.path);assert.equal(sha(b),p.sha256,p.path);return JSON.parse(b);};
const pin=async path=>{const b=await readFile(path);return {path,bytes:b.length,sha256:sha(b)};};
const record=async(path,value)=>{await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx'});return pin(path);};
await record(join(out,'BINDER_STARTED.json'),{at:new Date().toISOString(),pid:process.pid,inputSha256:process.argv[3],role:'Passive operator custody',runtimeAcquisitions:0});
let close=null,run=null;
try{
 const admission=await pinned(input.admission),manifest=await pinned(input.manifest),before=await pinned(input.sourceBefore),grant=await pinned(input.grant),w=await pinned(input.workload),binding=await pinned(input.runtimeBinding);
 assert.equal(input.admission.sha256,'c296b568d17045205d67048e12172c2e7e740036323bffb508fc4291721a3f66');
 assert.equal(input.manifest.sha256,'cda6d00a91a95893d53660c915144ffbe7568b0188b14d556a21ccfbbb138711');
 assert.equal(manifest.status,'ROOT_ADMITTED_NATIVE_DISPATCH');assert.deepEqual(admission.sourceBefore,input.sourceBefore);
 for(const p of [input.admission,input.grant,input.workload,input.runtimeBinding,...input.operatorCopies])assert(manifest.files.some(q=>q.path===p.path&&q.bytes===p.bytes&&q.sha256===p.sha256),p.path);
 assert.equal(before.files.length,450);assert.equal(grant.productWritePaths.length,5);assert.equal(grant.handoffFiles.length,3);assert.equal(w.testing.selectedPaths.length,471);
 assert.equal(before.inheritedTrackedChangedPaths.length,55);assert.equal(before.inheritedNewProductPaths.length,2);
 const host=await pinned(input.hostResult),start=await pinned(input.hostStart),summary=await pinned(input.summary),pending=await pinned(input.pending);
 assert.equal(start.manifestSha256,input.manifest.sha256);assert.equal(host.exitCode,0);assert.equal(host.signal,null);assert.equal(host.failure,null);assert.equal(host.timedOut,false);assert.equal(host.truncated,false);
 try{process.kill(start.pid,0);throw Error('Author host PID remains live');}catch(e){if(e.code!=='ESRCH')throw e;}
 assert.equal(pending.actualOutcomeFile,input.execution.path);assert.equal(pending.receiptPointer,'/receipt');assert.equal(pending.actualCloseReceiptFile,input.resourceClose.path);assert.equal(pending.closeHandoffPointer,'/closeHandoff');assert.equal(pending.actualResumeFile,input.resume.path);
 let execution=await pinned(input.execution);const receipt=execution.receipt;assert.equal(receipt?.kind,'definition_host_receipt');
 const terminal=receipt.ownerOutput?.value?.terminalResult??null;run=receipt.resources?.run??null;
 const outcome={transport:'installed_sdk',sdkExitCode:receipt.exitCode,outcomeKind:receipt.ownerOutput?.outcomeKind??null,disposition:receipt.ownerOutput?.value?.disposition??null};execution=null;
 assert.equal(outcome.sdkExitCode,summary.sdkExitCode);assert.equal(outcome.outcomeKind,summary.outcomeKind);assert.equal(outcome.disposition,summary.disposition);assert.deepEqual(run,summary.run);
 const closed=await pinned(input.resourceClose);assert.equal(closed.kind,'abg_event_resource_receipt');close=closed.closeHandoff;assert(close);assert.equal(summary.physicalCloseSucceeded,true);assert.deepEqual(summary.errors,[]);
 let resumed=await pinned(input.resume);assert.equal(resumed.installedRoot,binding.installedRoot);assert.equal(resumed.state.resource,null);assert.equal(resumed.state.selection,null);assert.equal(resumed.state.environment,null);
 // Existing installed pure owner validators only; no event-resource acquisition.
 const runtime=await installedModules(resumed.installedRoot),hash=runtime.product.sha256Canonical;
 assert.equal(hash(resumed.state.closeHandoff),hash(close));assert.deepEqual(pending.run,run);
 const verified=resumed.native.verified,environment={};
 for(const key of ['HOME','PATH','LANG','LC_ALL','TMPDIR','NODE_OPTIONS','STDO_STORE'])if(resumed.config.setupEnvironment[key]!==undefined)environment[key]=resumed.config.setupEnvironment[key];
 environment.NODE_OPTIONS='--max-old-space-size=8192';environment.TMPDIR='/private/tmp/abg-o7f';
 const readInput={sourceExecution:input.execution,sourceResume:input.resume,sourceClose:input.resourceClose,hostResult:input.hostResult,hostLaunch:input.hostStart,pending:input.pending,
  installedRoot:resumed.installedRoot,native:{verified:{productId:verified.productId,productContentDigest:verified.productContentDigest,catalogId:verified.catalogId,catalogDigest:verified.catalogDigest,definitionContractCoordinates:verified.definitionContractCoordinates}},binding:resumed.state.binding,closeHandoff:close,run,
  config:{runId:resumed.config.runId,nodePath:resumed.config.nodePath,setupEnvironment:environment},provenancePath:join(author,'execution/run.json'),members:['run_result','run_replay'],heapMiB:8192,timeoutMs:input.readTimeoutMs,hostTimeoutMs:input.readHostTimeoutMs,maxOutputBytes:input.maxOutputBytes,
  sourceOutcome:outcome,expectedTerminal:null,sourceCustody:null,limits:['One cold process per member, same actual close; no refresh/lifecycle/provider/retry/heap increase.','Full owner output remains at existing calls/<member>.outcome.json.','Full actual typed terminal/value/producer/result identity, not exit-only agreement.']};
 assert.equal(input.readTimeoutMs,600000);assert.equal(input.readHostTimeoutMs,900000);assert.equal(input.maxOutputBytes,536870912);resumed=null;
 assert(terminal!==null,'Actual absent terminal must retain its distinct failure; no successful closure implied');
 assert(runtime.abg.isAbgTypedTerminalResult(terminal));assert.equal(hash(terminal.value),terminal.valueDigest);assert.equal(terminal.producer.runRef,run.ref);
 readInput.expectedTerminal={terminalDigest:hash(terminal),result:terminal.result,contract:terminal.contract,valueKind:terminal.valueKind,valueDigest:terminal.valueDigest,producerDigest:hash(terminal.producer),valueCanonicalDigest:hash(terminal.value),sourcePointer:'/receipt/ownerOutput/value/terminalResult'};
 const native=terminal.value;assert(runtime.product.isNativeWorkspaceWorkObservation(native)||runtime.product.isNativeWorkspaceWorkFailure(native));assert(native.after!==null,'Actual after absent: preserve partial custody');
 const timing=await pinned(input.timing),rows=timing.results.filter(r=>r.eventId===terminal.producer.resultAdmissionEventRef);assert.equal(rows.length,1);const row=rows[0],prefix=close.prefix,log=fileURLToPath(prefix.eventLogRef);
 assert.equal(log,timing.eventLog);assert.equal(row.runId,run.ref);assert.equal(row.resultRef,terminal.result.ref);assert.equal(row.valueDigest,terminal.valueDigest);assert(row.offset>=timing.fromByte&&row.offset+row.rowBytes<=prefix.prefixLength);
 const handle=await open(log,'r');let physical;
 try{const initial=await handle.stat();assert.equal(initial.dev,prefix.storeIdentity.device);assert.equal(initial.ino,prefix.storeIdentity.inode);assert.equal(initial.size,prefix.prefixLength);
  physical=Buffer.alloc(row.rowBytes);let count=0;while(count<physical.length){const r=await handle.read(physical,count,physical.length-count,row.offset+count);assert(r.bytesRead>0);count+=r.bytesRead;}
  const final=await handle.stat();assert.equal(final.size,initial.size);assert.equal(final.mtimeMs,initial.mtimeMs);assert.equal(final.ctimeMs,initial.ctimeMs);
 }finally{await handle.close();}
 assert.equal(sha(physical),row.rowSha256);assert.equal(physical.at(-1),10);
 const stored=JSON.parse(physical.toString('utf8')),event=stored.event??stored,payload=event.payload;physical=null;
 assert.equal(event.kind,'c_call_result_admitted');assert.equal(event.eventId,terminal.producer.resultAdmissionEventRef);assert.equal(event.admissionOrdinal,row.admissionOrdinal);assert.equal(event.runId,run.ref);assert.equal(event.aggregateId,terminal.producer.cCallRef);assert.equal(event.graphFunctionRef,terminal.producer.graphFunction.ref);
 assert.equal(payload.cCallRef,terminal.producer.cCallRef);assert.equal(payload.resultRef,terminal.result.ref);assert.equal(payload.resultDigest,terminal.result.digest);assert.equal(payload.contractRef,terminal.contract.ref);assert.equal(payload.valueKind,terminal.valueKind);assert.equal(payload.valueDigest,terminal.valueDigest);
 let logicalPayload;
 if(Object.hasOwn(payload,'value')){assert.equal(hash(payload.value),terminal.valueDigest);logicalPayload=payload;}
 else{assert.equal(stored.codecVersion,1);assert.equal(stored.bodyReference?.bodyDigest,terminal.valueDigest);logicalPayload={...payload,value:native};}
 assert.equal(hash(logicalPayload),event.payloadDigest);const {resultRef,resultDigest,...resultBody}=logicalPayload;assert.equal(hash(resultBody),resultDigest);assert.equal(resultRef,'result://abiogenesis/'+resultDigest.slice(7));
 const physicalPin=await record(join(out,'NATIVE_RESULT_COORDINATES.json'),{...row,physicalRow:{path:log,offset:row.offset,bytes:row.rowBytes,sha256:row.rowSha256},payloadDigest:event.payloadDigest,bodyReference:stored.bodyReference??null,producer:terminal.producer,terminalIdentity:readInput.expectedTerminal,ownerReceipt:input.execution,ownerValuePointer:'/receipt/ownerOutput/value/terminalResult/value',standing:'Actual owner receipt and exact physical row agree; no event admission or whole-history decoding.'});
 const entries=new Map(native.after.entries.map((e,index)=>[e.relativePath,{entry:e,index}]));assert.equal(entries.size,471);assert.deepEqual([...entries.keys()].sort(),[...w.testing.selectedPaths].sort());
 const controls=w.testing.selectedPaths.filter(p=>p.startsWith('qualification-inputs/rc7-fixed-proof-author-01/'));assert.equal(controls.length,18);
 const held=new Map(before.files.map(f=>[f.relativePath,f])),sourceRows=[],controlRows=[],handoffs=[],changed=[];
 const subjectRoot=join(author,'review-subject-001');await mkdir(subjectRoot);
 for(const name of [...held.keys(),...controls]){
  const path=join(grant.worksiteRoot,name),info=await lstat(path);assert(info.isFile()&&!info.isSymbolicLink(),name);const bytes=await readFile(path),digest=sha(bytes),{entry,index}=entries.get(name);
  assert.equal(entry.state,'file',name);assert.equal(entry.byteLength,bytes.length,name);assert.equal(entry.digest,'sha256:'+digest,name);
  const prior=held.get(name);
  if(prior){const priorBytes=await readFile(prior.sourceSnapshot);assert.equal(priorBytes.length,prior.bytes);assert.equal(sha(priorBytes),prior.sha256);
   const isChanged=prior.sha256!==digest;if(isChanged)assert(grant.productWritePaths.includes(name),'Unpermitted changed source: '+name);
   let sourceSnapshot=prior.sourceSnapshot;if(isChanged){sourceSnapshot=join(subjectRoot,'files',name);await mkdir(dirname(sourceSnapshot),{recursive:true});await writeFile(sourceSnapshot,bytes,{flag:'wx'});changed.push(name);}
   sourceRows.push({relativePath:name,bytes:bytes.length,sha256:digest,sourceSnapshot,sourceStanding:'actual_F_SDK_terminal_after_and_live_bytes_equal',changedFromSourceBefore:isChanged,heldPreimage:{path:prior.sourceSnapshot,bytes:prior.bytes,sha256:prior.sha256},afterEntryIndex:index});
  }else{const selected=manifest.files.filter(p=>p.path===path);assert.equal(selected.length,1);assert.equal(selected[0].bytes,bytes.length);assert.equal(selected[0].sha256,digest);controlRows.push({relativePath:name,...selected[0],afterEntryIndex:index});}
 }
 for(const name of grant.handoffFiles){const {entry,index}=entries.get(name),path=join(grant.worksiteRoot,name);assert.equal(entry.state,'file','Expected handoff not returned: '+name);const bytes=await readFile(path);assert.equal(entry.byteLength,bytes.length);assert.equal(entry.digest,'sha256:'+sha(bytes));const snapshot=join(subjectRoot,'handoffs',name.split('/').at(-1));await mkdir(dirname(snapshot),{recursive:true});await writeFile(snapshot,bytes,{flag:'wx'});handoffs.push({relativePath:name,livePath:path,bytes:bytes.length,sha256:sha(bytes),snapshot,afterEntryIndex:index});}
 assert.equal(execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),grant.sourceCommit);execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'diff','--cached','--quiet']);
 const tracked=execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'diff','--name-only',grant.sourceCommit],{encoding:'utf8'}).trim().split('\n').filter(Boolean),allowed=new Set([...before.inheritedTrackedChangedPaths,...grant.productWritePaths]);assert(tracked.every(p=>allowed.has(p)),'Tracked path outside inherited/selected cone');
 const diff=execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'diff','--no-ext-diff','--binary',grant.sourceCommit,'--',...grant.productWritePaths],{maxBuffer:8*1024*1024});await writeFile(join(subjectRoot,'selected-current.diff'),diff,{flag:'wx'});
 const custody=await record(join(out,'SOURCE_CUSTODY.json'),{status:'ACTUAL_AFTER_PHYSICAL_RESULT_AND_LIVE_SOURCE_MATCH',sourceBefore:input.sourceBefore,physicalNativeResult:physicalPin,sourceExecution:input.execution,afterObservationRef:native.after.observationRef,afterObservationDigest:native.after.observationDigest,sourceCount:450,stagedControlCount:18,handoffCount:3,presentRowsMatched:471,changedPaths:changed,sourceRows,controlRows,handoffs,inheritedTrackedChangedPaths:before.inheritedTrackedChangedPaths,currentTrackedChangedPaths:tracked,inheritedNewProductPaths:before.inheritedNewProductPaths,sourceAccepted:false});
 const sourceAfter=await record(join(author,'SOURCE_AFTER.json'),{kind:'native_author_source_after','status':'FROZEN_ACTUAL_F_AFTER_CUSTODY_REVIEW_PROOF_PENDING',sourceCommit:grant.sourceCommit,sourceBefore:input.sourceBefore,actualSourceCustody:custody,actualExecution:input.execution,physicalNativeResult:physicalPin,afterObservationRef:native.after.observationRef,afterObservationDigest:native.after.observationDigest,files:sourceRows,sourceCount:450,changedPaths:changed,inheritedTrackedChangedPaths:tracked,inheritedNewProductPaths:before.inheritedNewProductPaths,inheritedUntrackedPaths:before.inheritedUntrackedPaths,handoffs,qualified:false,accepted:false});
 const subject=await record(join(subjectRoot,'SUBJECT.json'),{kind:'frozen_native_author_subject',status:'FROZEN_REVIEW_AND_AFFECTED_PROOF_PENDING',productFrame:'fixed15 ABIogenesis5.0 / GOAL035 T287 / STDO3.0.4; existing five-file fixed Testing/UAT route',sourceBefore:input.sourceBefore,sourceAfter,sourceCustody:custody,physicalNativeResult:physicalPin,actualExecution:input.execution,actualResume:input.resume,actualClose:input.resourceClose,admission:input.admission,dispatchManifest:input.manifest,scope:grant.productWritePaths,changedPaths:changed,sourceCount:450,selectedContextCount:471,files:sourceRows.filter(f=>grant.productWritePaths.includes(f.relativePath)),controls:controlRows,handoffs,selectedCurrentDiff:await pin(join(subjectRoot,'selected-current.diff')),limits:['Only changed authorized source snapshots copied; unchanged inherited source uses exact immutable preimage references.','Frozen source/physical custody is not independent review, affected proof acceptance, held-session proof or qualification.']});
 readInput.sourceCustody=subject;const readInputPin=await record(join(out,'READ_INPUT.json'),readInput);
 const closedPin=await record(join(out,'CLOSE.json'),{status:'ACTUAL_F_SDK_RETURN_CLOSED_COLD_READS_REVIEW_PROOF_PENDING',closeHandoff:close,closeDigest:hash(close),actualExecution:input.execution,actualResume:input.resume,actualClose:input.resourceClose,run,originalOutcome:outcome,hostResult:input.hostResult,sourceAfter,subject,physicalNativeResult:physicalPin,terminalIdentity:readInput.expectedTerminal,readInput:readInputPin,coldReads:[],sourceAccepted:false,qualified:false});
 console.log(JSON.stringify({status:'FROZEN_AND_COLD_READ_INPUT_READY',subject,sourceAfter,readInput:readInputPin,close:closedPin,changedPaths:changed,presentRowsMatched:471}));
}catch(error){await record(join(out,'PARTIAL_CUSTODY.json'),{status:'PARTIAL_ACTUAL_F_CUSTODY_REQUIRES_ROOT',at:new Date().toISOString(),name:error.name,message:String(error.message).slice(0,1000),closeHandoff:close,run,actualExecution:input.execution,actualResume:input.resume,automaticRetry:false});throw error;}
