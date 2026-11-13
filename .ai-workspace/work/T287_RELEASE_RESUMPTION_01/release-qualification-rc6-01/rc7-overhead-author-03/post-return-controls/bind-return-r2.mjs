// R2 passive custody only, after actual host exit. Existing B binder/N failed
// capture algorithms; retain references and digests, never another source tree.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat,open} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getHeapStatistics} from 'node:v8';
import {installedModules} from '../../operator-client/public-setup.mjs';
const here=dirname(fileURLToPath(import.meta.url)),author=dirname(here),sha=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(process.argv[2]);assert.equal(sha(raw),process.argv[3]);const input=JSON.parse(raw);
assert.equal(input.authorRoot,author);assert(/^[a-z0-9][a-z0-9-]*$/u.test(input.outputName));
assert.equal(input.heapMiB,8192);assert(getHeapStatistics().heap_size_limit>=8192*1024*1024);
const pinned=async pin=>{assert(pin&&isAbsolute(pin.path)&&Number.isSafeInteger(pin.bytes)&&/^[a-f0-9]{64}$/u.test(pin.sha256),'Actual input unbound');
 const b=await readFile(pin.path);assert.equal(b.length,pin.bytes,pin.path);assert.equal(sha(b),pin.sha256,pin.path);return JSON.parse(b);};
const out=join(here,input.outputName);await mkdir(out);
const record=async(name,value)=>{const path=join(out,name),bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');await writeFile(path,bytes,{flag:'wx'});return {path,bytes:bytes.length,sha256:sha(bytes)};};
let actualClose=null,actualRun=null,actualDisposition=null;
try{
 const admission=await pinned(input.admission);assert.equal(input.admission.sha256,'976489f9077e82fbd07ff3f893641f7cb6cd7e470d5ff371326d3109ad8dfc22');
 const manifest=await pinned(input.hostManifest);assert.equal(input.hostManifest.sha256,'330c43086dc156e4f16656026cb9ad8465c813af77c13036fda1870cabd8c2e8');
 const selected=name=>{const rows=manifest.files.filter(p=>p.path===join(author,name));assert.equal(rows.length,1);return rows[0];};
 assert.deepEqual(selected('ROOT_CONTROL_ADMISSION_R2.json'),input.admission);
 assert.deepEqual(selected('STAGED_CONTROL_PINS_R2.json'),input.stagedControls);assert.deepEqual(selected('POST_RETURN_CUSTODY_R2.json'),input.selection);
 const selection=await pinned(input.selection);assert.equal(selection.rootPostReturnReadSelection.selection,'actual_receipt_physical_result_after_source_conjunction_without_repeated_cold_reads');
 const before=await pinned(admission.sourceBefore),grant=await pinned(admission.nativeGrant),controls=await pinned(input.stagedControls),workload=await pinned(selected('workload-r2.json'));
 assert.equal(before.files.length,449);assert.equal(controls.count,17);assert.equal(controls.files.length,17);assert.equal(grant.productWritePaths.length,4);assert.equal(grant.handoffFiles.length,3);
 assert.equal(before.inheritedTrackedChangedPaths.length,54);assert.equal(before.inheritedUntrackedPaths.length,2);
 assert.deepEqual([...before.inheritedNewProductPaths].sort(),[...grant.inheritedNewProductPaths].sort());
 const expectedPaths=[...before.files.map(f=>f.relativePath),...controls.files.map(f=>f.relativePath),...grant.handoffFiles];
 assert.equal(expectedPaths.length,469);assert.equal(new Set(expectedPaths).size,469);assert.deepEqual([...workload.testing.selectedPaths].sort(),[...expectedPaths].sort());
 for(const {path,bytes,sha256} of controls.files){const matches=manifest.files.filter(p=>p.path===path);assert.equal(matches.length,1);assert.deepEqual(matches[0],{path,bytes,sha256});}
 const host=await pinned(input.hostResult),start=await pinned(input.hostStart);
 assert.equal(input.hostResult.path,join(author,'host-supervision-r2/HOST_RETURN.json'));assert.equal(input.hostStart.path,join(author,'execution-r2/STARTED.json'));
 assert.equal(host.status,'HOST_RETURNED');assert(Number.isInteger(host.exitCode)&&Date.parse(host.at)>=Date.parse(start.startedUtc));
 assert.equal(start.manifestSha256,input.hostManifest.sha256);assert(Number.isInteger(start.pid)&&start.pid>0);
 assert.equal(host.commandResultFile,join(author,'host-supervision-r2/commands/native-host.result.json'));
 try{process.kill(start.pid,0);throw Error('R2 host PID remains live');}catch(e){if(e.code!=='ESRCH')throw e;}
 const pending=await pinned(input.pending);assert.equal(input.pending.path,join(author,'execution-r2/READBACKS_PENDING.json'));
 assert.equal(input.execution.path,join(author,'execution-r2/execution.json'));assert.equal(input.resume.path,join(author,'execution-r2/after-run-resume.json'));
 assert.equal(pending.actualExecutionFile,input.execution.path);assert.equal(pending.actualResumeFile,input.resume.path);
 let execution=await pinned(input.execution);const receipt=execution.receipt;assert.equal(receipt?.kind,'definition_host_receipt');
 const closeHandoff=receipt.resources?.eventResource?.closeHandoff,run=receipt.resources?.run??null;
 assert(closeHandoff,'Actual returned close is absent');actualClose=closeHandoff;actualRun=run;
 const terminal=receipt.ownerOutput?.value?.terminalResult??null;actualDisposition=receipt.ownerOutput?.value?.disposition??null;
 const outcome={exitCode:execution.execution?.exitCode??null,timedOut:execution.execution?.timedOut??null,truncated:execution.execution?.truncated??null,
  outcomeKind:receipt.ownerOutput?.outcomeKind??null,disposition:actualDisposition};execution=null;
 let resumed=await pinned(input.resume);const runtimeBinding=await pinned(selected('RUNTIME_BINDINGS_R2.json'));
 assert.equal(resumed.installedRoot,runtimeBinding.installedRoot);assert.equal(resumed.state.resource,null);assert.equal(resumed.state.selection,null);assert.equal(resumed.state.environment,null);
 const runtime=await installedModules(resumed.installedRoot),hash=runtime.product.sha256Canonical;
 assert.equal(hash(resumed.state.closeHandoff),hash(closeHandoff));assert.equal(hash(pending.actualClose),hash(closeHandoff));assert.deepEqual(pending.run,run);resumed=null;
 let terminalIdentity=null;
 if(terminal!==null){assert(runtime.abg.isAbgTypedTerminalResult(terminal));assert.equal(hash(terminal.value),terminal.valueDigest);assert.equal(terminal.producer.runRef,run?.ref);
  terminalIdentity={result:terminal.result,contract:terminal.contract,valueKind:terminal.valueKind,valueDigest:terminal.valueDigest,
   terminalCanonicalDigest:hash(terminal),producerCanonicalDigest:hash(terminal.producer),completeValueCanonicalDigest:hash(terminal.value),
   sourceExecution:input.execution,sourcePointer:'/receipt/ownerOutput/value/terminalResult'};}
 const timing=await pinned(input.timing);assert.equal(input.timing.path,join(author,'execution-r2/TIMING_OBSERVATION_ENVELOPES.json'));
 const candidates=timing.results.filter(r=>r.runId===run?.ref&&r.graphFunctionRef==='graph-function://abiogenesis/worksite/native-work@5'&&
  (terminal!==null?r.eventId===terminal.producer.resultAdmissionEventRef:r.valueKind==='native_workspace_work_failure'));
 assert.equal(candidates.length,1,'Exact native Result is absent or ambiguous; retain partial custody and return to Root');
 const row=candidates[0],prefix=closeHandoff.prefix,log=fileURLToPath(prefix.eventLogRef);assert.equal(log,timing.eventLog);
 assert(Number.isSafeInteger(row.offset)&&row.offset>=timing.fromByte&&Number.isSafeInteger(row.rowBytes)&&row.rowBytes>0&&row.offset+row.rowBytes<=prefix.prefixLength);
 const handle=await open(log,'r');let physical;
 try{const initial=await handle.stat();assert.equal(initial.dev,prefix.storeIdentity.device);assert.equal(initial.ino,prefix.storeIdentity.inode);assert.equal(initial.size,prefix.prefixLength);
  physical=Buffer.alloc(row.rowBytes);let count=0;while(count<physical.length){const r=await handle.read(physical,count,physical.length-count,row.offset+count);assert(r.bytesRead>0);count+=r.bytesRead;}
  const final=await handle.stat();assert.equal(final.size,initial.size);assert.equal(final.mtimeMs,initial.mtimeMs);assert.equal(final.ctimeMs,initial.ctimeMs);
 }finally{await handle.close();}
 assert.equal(sha(physical),row.rowSha256);assert.equal(physical.at(-1),10);
 const stored=JSON.parse(physical.toString('utf8')),event=stored.event??stored,payload=event.payload;physical=null;
 assert.equal(event.kind,'c_call_result_admitted');assert.equal(event.eventId,row.eventId);assert.equal(event.admissionOrdinal,row.admissionOrdinal);
 assert.equal(event.runId,run.ref);assert.equal(event.graphFunctionRef,row.graphFunctionRef);assert.equal(event.aggregateId,payload.cCallRef);assert.equal(payload.resultRef,row.resultRef);
 let native,logicalPayload,bodySource;
 if(terminal!==null){assert.equal(payload.resultRef,terminal.result.ref);assert.equal(payload.resultDigest,terminal.result.digest);assert.equal(payload.cCallRef,terminal.producer.cCallRef);
  assert.equal(payload.contractRef,terminal.contract.ref);assert.equal(payload.valueKind,terminal.valueKind);assert.equal(payload.valueDigest,terminal.valueDigest);
  assert.equal(terminal.producer.graphFunction.ref,event.graphFunctionRef);native=terminal.value;
  if(Object.hasOwn(payload,'value')){assert.equal(hash(payload.value),terminal.valueDigest);logicalPayload=payload;}
  else{assert.equal(stored.codecVersion,1);assert.equal(stored.bodyReference?.bodyDigest,terminal.valueDigest);logicalPayload={...payload,value:native};}
  bodySource={kind:'original_owner_receipt_value',file:input.execution,pointer:'/receipt/ownerOutput/value/terminalResult/value'};
 }else{
  assert.equal(actualDisposition,'runtime_failed');assert.equal(payload.valueKind,'native_workspace_work_failure');
  assert(Object.hasOwn(payload,'value'),'Encoded failure has no actual terminal body; unknown relation must return to Root');native=payload.value;logicalPayload=payload;
  bodySource={kind:'exact_inline_physical_result_value',file:log,offset:row.offset,bytes:row.rowBytes,sha256:row.rowSha256,pointer:(stored.event?'/event':'')+'/payload/value'};
 }
 assert.equal(hash(native),payload.valueDigest);assert.equal(hash(logicalPayload),event.payloadDigest);
 const {resultRef,resultDigest,...resultBody}=logicalPayload;assert.equal(hash(resultBody),resultDigest);assert.equal(resultRef,'result://abiogenesis/'+resultDigest.slice(7));
 const isObservation=runtime.product.isNativeWorkspaceWorkObservation(native),isFailure=runtime.product.isNativeWorkspaceWorkFailure(native);
 assert(isObservation||isFailure,'Existing native owner rejected actual result shape');
 assert.equal(native.provenance.cCallRef,payload.cCallRef);assert.equal(payload.valueKind,native.kind);
 const resultRelation={...row,result:{ref:resultRef,digest:resultDigest},valueDigest:payload.valueDigest,payloadDigest:event.payloadDigest,
  physicalRow:{path:log,offset:row.offset,bytes:row.rowBytes,sha256:row.rowSha256},bodySource,terminalJoin:terminal!==null,
  ownerKind:native.kind,failureClass:isFailure?native.failureClass:null,diagnosticRef:isFailure?native.diagnosticRef:null,changedPaths:native.changedPaths};
 await record('NATIVE_RESULT_RELATION.json',resultRelation);
 const after=native.after;
 assert(after!==null,'Genuine native failure has no after observation; effect relation remains unknown');
 const entries=new Map(after.entries.map((entry,index)=>[entry.relativePath,{entry,index}]));
 assert.equal(entries.size,469);assert.deepEqual([...entries.keys()].sort(),[...expectedPaths].sort());
 const held=new Map(before.files.map(f=>[f.relativePath,f]));const files=[];
 for(const expected of [...before.files.map(f=>({path:join(grant.worksiteRoot,f.relativePath),relativePath:f.relativePath,bytes:f.bytes,sha256:f.sha256})),...controls.files]){
  const name=expected.relativePath;assert.equal(relative(grant.worksiteRoot,expected.path),name);
  const info=await lstat(expected.path);assert(info.isFile()&&!info.isSymbolicLink(),name);const bytes=await readFile(expected.path),digest=sha(bytes),{entry,index}=entries.get(name);
  assert.equal(entry.state,'file',name);assert.equal(entry.byteLength,bytes.length,name);assert.equal(entry.digest,'sha256:'+digest,name);
  if(!grant.productWritePaths.includes(name)){assert.equal(bytes.length,expected.bytes,name);assert.equal(digest,expected.sha256,name);}
  const prior=held.get(name);files.push({relativePath:name,livePath:expected.path,bytes:bytes.length,sha256:digest,
   changedFromSourceBefore:prior!==undefined&&prior.sha256!==digest,heldPreimage:prior?{path:prior.sourceSnapshot,bytes:prior.bytes,sha256:prior.sha256}:null,
   afterEntry:{relativePath:name,state:entry.state,digest:entry.digest,byteLength:entry.byteLength},retainedAfterBody:{source:bodySource,pointerSuffix:'/after/entries/'+index}});
 }
 const handoffs=[];
 for(const path of grant.handoffFiles){const {entry,index}=entries.get(path),livePath=join(grant.worksiteRoot,path);
  if(entry.state==='absent'){try{await lstat(livePath);throw Error('Observed absent handoff exists: '+path);}catch(e){if(e.code!=='ENOENT')throw e;}handoffs.push({path,state:'absent',observedAfter:true});}
  else{assert.equal(entry.state,'file',path);const info=await lstat(livePath);assert(info.isFile()&&!info.isSymbolicLink());const bytes=await readFile(livePath);
   assert.equal(entry.byteLength,bytes.length,path);assert.equal(entry.digest,'sha256:'+sha(bytes),path);
   handoffs.push({path,livePath,state:'file',bytes:bytes.length,sha256:sha(bytes),observedAfter:true,retainedAfterBody:{source:bodySource,pointerSuffix:'/after/entries/'+index}});}
 }
 const inventory=await record('SOURCE_CUSTODY.json',{status:'ACTUAL_AFTER_AND_LIVE_BYTES_MATCH_REFERENCE_CUSTODY',sourceBefore:admission.sourceBefore,
  currentStagedControls:input.stagedControls,workload:selected('workload-r2.json'),baselineFiles:449,stagedControls:17,readonlyBaselineFiles:445,permittedSourcePaths:grant.productWritePaths,
  inheritedTrackedChangedPaths:before.inheritedTrackedChangedPaths,inheritedNewProductPaths:before.inheritedNewProductPaths,
  afterObservationRef:after.observationRef,afterObservationDigest:after.observationDigest,files,handoffs,
  limits:['No new source tree, body, handoff or diff copies. Original owner receipt/physical row retains exact after bodies; SOURCE_BEFORE retains original snapshot/preimage references.',
   'Root must hold live source unchanged for review. This is reference custody, not an independent new filesystem snapshot or source acceptance.']});
 const cleanHost=host.exitCode===0&&host.signal===null&&!host.timedOut&&!host.truncated&&host.failure===null;
 const cleanInvocation=outcome.exitCode===0&&outcome.timedOut===false&&outcome.truncated===false;
 const status=isFailure||!cleanHost||!cleanInvocation?'ACTUAL_FAILED_RETURN_CLOSED_WITH_REFERENCE_SOURCE_CUSTODY':'ACTUAL_RETURN_CLOSED_WITH_REFERENCE_SOURCE_CUSTODY_REVIEW_PROOF_PENDING';
 const closePin=await record('CLOSE.json',{kind:'actual_r2_passive_return_custody',recordedUtc:new Date().toISOString(),status,closeHandoff,closeDigest:hash(closeHandoff),run,
  actualExecution:input.execution,actualResume:input.resume,hostResult:input.hostResult,hostStart:input.hostStart,pending:input.pending,timing:input.timing,
  admission:input.admission,hostManifest:input.hostManifest,sourceCustody:inventory,originalOutcome:outcome,hostExitCode:host.exitCode,
  terminalIdentity,physicalNativeResult:resultRelation,presentFilesMatched:files.length,presentHandoffs:handoffs.filter(h=>h.state==='file').length,absentHandoffs:handoffs.filter(h=>h.state==='absent').length,
  coldReads:[],qualified:false,sourceAccepted:false,nativeTaskSuccessInferred:false,
  limits:['Genuine actual R2 successor close only; no N/B fallback.','Full original typed terminal relation is retained when present. Null terminal stays null; inline failure is physical custody only, never a fabricated terminal.',
   'No automatic cold result/replay, source acceptance, native objective completion or qualification. Root conjoins actual review/affected proof and selects any discrepancy response.']});
 console.log(JSON.stringify({status,close:closePin,sourceCustody:inventory,presentFilesMatched:files.length,presentHandoffs:handoffs.filter(h=>h.state==='file').length,terminalPresent:terminal!==null}));
}catch(error){await record('PARTIAL_CUSTODY.json',{status:'PARTIAL_ACTUAL_RETURN_CUSTODY_REQUIRES_ROOT',at:new Date().toISOString(),name:error.name,message:String(error.message).slice(0,1000),
 closeHandoff:actualClose,run:actualRun,disposition:actualDisposition,actualExecution:input.execution,actualResume:input.resume,
 automaticRetry:false,meaning:'Genuine unknown/failure/disagreement retained. No terminal, after relation or prior close substituted; no cold read selected automatically.'});throw error;}
