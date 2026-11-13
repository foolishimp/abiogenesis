// Exact N spawn-failed return custody. Adapted from the existing B binder's
// receipt, physical-row and source checks; no runtime acquisition or event admission.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat,open} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getHeapStatistics} from 'node:v8';
import {installedModules} from '../../operator-client/public-setup.mjs';
const here=dirname(fileURLToPath(import.meta.url)),author=dirname(here),out=join(here,'failed-actual-001');
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=async path=>{const b=await readFile(path);return {pin:{path,bytes:b.length,sha256:sha(b)},value:JSON.parse(b)};};
const pinned=async pin=>{const r=await read(pin.path);assert.deepEqual(r.pin,pin);return r.value;};
const record=async(path,value)=>writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
assert(getHeapStatistics().heap_size_limit>=8192*1024*1024);
await mkdir(out);
try{
 const admission=await read(join(author,'ROOT_CONTROL_ADMISSION.json'));
 assert.equal(admission.pin.sha256,'225dd021ab6b4d336ba4f7cce7b43eef969ec5dde0bd749607880ca252532ec7');
 const manifest=await read(join(author,'HOST_MANIFEST.json'));assert.equal(manifest.pin.sha256,'a31fc65ff359598137396a3af3df5e3632c6bbd764f24efa26305253f46c7726');
 const selected=name=>{const rows=manifest.value.files.filter(p=>p.path===join(author,name));assert.equal(rows.length,1);return rows[0];};
 const selection=await pinned(selected('POST_RETURN_CUSTODY.json'));
 assert.equal(selection.rootPostReturnReadSelection.selection,'actual_receipt_physical_result_after_source_conjunction_without_repeated_cold_reads');
 const host=await read(join(author,'host-supervision/HOST_RETURN.json')),start=await read(join(author,'execution/STARTED.json'));
 assert.equal(host.value.status,'HOST_RETURNED');assert.equal(start.value.manifestSha256,manifest.pin.sha256);
 assert(Number.isInteger(host.value.exitCode)&&Date.parse(host.value.at)>=Date.parse(start.value.startedUtc));
 try{process.kill(start.value.pid,0);throw Error('Actual host PID remains live');}catch(e){if(e.code!=='ESRCH')throw e;}
 const pending=await read(join(author,'execution/READBACKS_PENDING.json'));
 let execution=await read(join(author,'execution/execution.json'));
 const executionPin=execution.pin,receipt=execution.value.receipt;
 assert.equal(receipt?.kind,'definition_host_receipt');
 const closeHandoff=receipt.resources?.eventResource?.closeHandoff,run=receipt.resources?.run;
 assert(closeHandoff&&run);assert.equal(receipt.ownerOutput.value.disposition,'runtime_failed');
 assert.equal(receipt.ownerOutput.value.terminalResult??null,null,'No terminal join is selected for this failed Run');
 const invocationExitCode=execution.value.execution.exitCode;execution=null;
 let resume=await read(join(author,'execution/after-run-resume.json'));const resumePin=resume.pin;
 const runtimeBinding=await pinned(selected('RUNTIME_BINDINGS.json'));
 assert.equal(resume.value.installedRoot,runtimeBinding.installedRoot);
 assert.equal(resume.value.state.resource,null);assert.equal(resume.value.state.selection,null);assert.equal(resume.value.state.environment,null);
 const runtime=await installedModules(resume.value.installedRoot),hash=runtime.product.sha256Canonical;
 assert.equal(hash(resume.value.state.closeHandoff),hash(closeHandoff));assert.equal(hash(pending.value.actualClose),hash(closeHandoff));
 assert.deepEqual(pending.value.run,run);assert.equal(pending.value.actualExecutionFile,executionPin.path);assert.equal(pending.value.actualResumeFile,resumePin.path);resume=null;
 const timing=await read(join(author,'execution/TIMING_OBSERVATION_ENVELOPES.json'));
 const rows=timing.value.results.filter(r=>r.runId===run.ref&&r.valueKind==='native_workspace_work_failure'&&r.graphFunctionRef==='graph-function://abiogenesis/worksite/native-work@5');
 assert.equal(rows.length,1);const row=rows[0];assert.equal(row.admissionOrdinal,209522);
 assert.equal(row.offset,1359904370);assert.equal(row.rowBytes,49716782);assert.equal(row.rowSha256,'882d18fb67e4ceb66b3b517e971d34f4dc002f70170c9892902e3f8fa86c206a');
 const prefix=closeHandoff.prefix,log=fileURLToPath(prefix.eventLogRef);assert.equal(log,timing.value.eventLog);
 assert(row.offset>=timing.value.fromByte&&row.offset+row.rowBytes<=prefix.prefixLength);
 const handle=await open(log,'r');let physical;
 try{const before=await handle.stat();assert.equal(before.dev,prefix.storeIdentity.device);assert.equal(before.ino,prefix.storeIdentity.inode);assert.equal(before.size,prefix.prefixLength);
  physical=Buffer.alloc(row.rowBytes);let count=0;while(count<physical.length){const r=await handle.read(physical,count,physical.length-count,row.offset+count);assert(r.bytesRead>0);count+=r.bytesRead;}
  const after=await handle.stat();assert.equal(after.size,before.size);assert.equal(after.mtimeMs,before.mtimeMs);assert.equal(after.ctimeMs,before.ctimeMs);
 }finally{await handle.close();}
 assert.equal(sha(physical),row.rowSha256);assert.equal(physical.at(-1),10);
 const stored=JSON.parse(physical.toString('utf8')),event=stored.event??stored,payload=event.payload;physical=null;
 assert.equal(event.kind,'c_call_result_admitted');assert.equal(event.eventId,row.eventId);assert.equal(event.admissionOrdinal,row.admissionOrdinal);
 assert.equal(event.runId,run.ref);assert.equal(event.graphFunctionRef,row.graphFunctionRef);assert.equal(event.aggregateId,payload.cCallRef);
 assert.equal(payload.resultRef,row.resultRef);assert.equal(payload.valueKind,'native_workspace_work_failure');
 assert(Object.hasOwn(payload,'value'),'Encoded failed body requires actual owner body evidence; no invented terminal/body join');
 assert.equal(hash(payload.value),payload.valueDigest);assert.equal(hash(payload),event.payloadDigest);
 // Existing CCall result identity law: digest excludes only resultRef/resultDigest.
 const {resultRef,resultDigest,...resultBody}=payload;assert.equal(hash(resultBody),resultDigest);assert.equal(resultRef,'result://abiogenesis/'+resultDigest.slice(7));
 const failure=payload.value;assert(runtime.product.isNativeWorkspaceWorkFailure(failure));assert.equal(failure.failureClass,'transport_failure');
 assert(failure.after,'Unknown after effects require Root triage');assert.deepEqual(failure.changedPaths,[]);
 const beforeObservation=failure.before??failure.task?.context;assert(Array.isArray(beforeObservation?.entries),'Actual failure has no original context body');
 assert.equal(hash(beforeObservation.entries),hash(failure.after.entries),'Before/after entries differ');
 const afterEntries=new Map(failure.after.entries.map(e=>[e.relativePath,e]));
 const before=await pinned(admission.value.sourceBefore),grant=await pinned(admission.value.nativeGrant),controls=await pinned(selected('STAGED_CONTROL_PINS.json'));
 assert.equal(before.files.length,449);assert.equal(controls.files.length,17);assert.equal(grant.productWritePaths.length,4);assert.equal(grant.handoffFiles.length,3);
 const matches=[];
 for(const f of [...before.files.map(f=>({path:join(grant.worksiteRoot,f.relativePath),relativePath:f.relativePath,bytes:f.bytes,sha256:f.sha256})),...controls.files]){
  const info=await lstat(f.path);assert(info.isFile()&&!info.isSymbolicLink());const bytes=await readFile(f.path),digest=sha(bytes),entry=afterEntries.get(f.relativePath);
  assert.equal(bytes.length,f.bytes,f.relativePath);assert.equal(digest,f.sha256,f.relativePath);
  assert.equal(entry?.state,'file',f.relativePath);assert.equal(entry.byteLength,bytes.length,f.relativePath);assert.equal(entry.digest,'sha256:'+digest,f.relativePath);
  matches.push({relativePath:f.relativePath,bytes:bytes.length,sha256:digest});
 }
 const handoffs=[];for(const path of grant.handoffFiles){assert.equal(afterEntries.get(path)?.state,'absent',path);
  try{await lstat(join(grant.worksiteRoot,path));throw Error('Unexpected physical handoff: '+path);}catch(e){if(e.code!=='ENOENT')throw e;}
  handoffs.push({path,state:'absent',observedAfter:true});}
 assert.equal(afterEntries.size,469);
 const sourceRecord={status:'EXACT_BEFORE_AFTER_AND_PHYSICAL_SOURCE_EQUALITY',sourceBefore:admission.value.sourceBefore,stagedControls:selected('STAGED_CONTROL_PINS.json'),
  sourceFiles:449,stagedFiles:17,presentMatches:matches.length,changedPaths:[],handoffs,entriesCanonicalDigest:hash(failure.after.entries),physicalMatchesDigest:hash(matches),
  afterObservationRef:failure.after.observationRef,afterObservationDigest:failure.after.observationDigest,
  sourceSnapshots:'Existing449 B snapshots retained by SOURCE_BEFORE reference; no new source body copies.',matches};
 const sourcePath=join(out,'SOURCE_EQUALITY.json');await record(sourcePath,sourceRecord);const sourcePin=(await read(sourcePath)).pin;
 const recordValue={kind:'closed_failed_native_run_passive_custody',recordedUtc:new Date().toISOString(),status:'ACTUAL_RUNTIME_FAILED_NATIVE_SPAWN_FAILURE_CLOSED_SOURCE_UNCHANGED',
  closeHandoff,closeDigest:hash(closeHandoff),run,actualExecution:executionPin,actualResume:resumePin,hostResult:host.pin,hostStart:start.pin,pending:pending.pin,
  invocationExitCode,hostExitCode:host.value.exitCode,disposition:'runtime_failed',terminalResult:null,
  physicalFailureResult:{...row,result:{ref:resultRef,digest:resultDigest},valueDigest:payload.valueDigest,payloadDigest:event.payloadDigest,
   physicalRow:{path:log,offset:row.offset,bytes:row.rowBytes,sha256:row.rowSha256},failureClass:failure.failureClass,diagnosticRef:failure.diagnosticRef,
   beforeAfterEntriesEqual:true,changedPaths:[],ownerShapeValidated:true,terminalJoin:false,bodySource:'Exact inline physical Result row at actual returned closed prefix'},
  timing:timing.pin,sourceEquality:sourcePin,presentSourceAndControlsMatched:466,absentHandoffs:3,
  coldReads:[],qualified:false,sourceAccepted:false,nativeSuccess:false,
  limits:['Genuine successor close of failed N; never substitute B close.','Actual returned terminal is null. Failure value comes from exact physical Result row; no terminal or event admission manufactured.','No native author effect, source change or handoff success inferred; exact before/after/current bytes are equal.','No cold result/replay selected for this deterministic failed Run. Source snapshots and all original owner artifacts remain intact.']};
 await record(join(author,'FAILED_RUNTIME_CLOSE.json'),recordValue);
 const closePin=(await read(join(author,'FAILED_RUNTIME_CLOSE.json'))).pin;
 console.log(JSON.stringify({status:recordValue.status,failedClose:closePin,sourceEquality:sourcePin,originalResume:resumePin,sourceMatches:466,absentHandoffs:3,terminalResult:null}));
}catch(error){await record(join(out,'FAILURE.json'),{status:'PARTIAL_FAILED_RETURN_CUSTODY_REQUIRES_ROOT',at:new Date().toISOString(),name:error.name,message:error.message,automaticRetry:false});throw error;}
