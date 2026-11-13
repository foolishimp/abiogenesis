// Operator custody only. Run once, after the actual author host exits.
// Adapted from d5-author-03/freeze-source.mjs; never admits or replays an event.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,mkdir,lstat,open} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {getHeapStatistics} from 'node:v8';
import {dirname,join,relative,isAbsolute,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {installedModules} from '../../operator-client/public-setup.mjs';

const here=dirname(fileURLToPath(import.meta.url)),author=dirname(here);
const sha=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(process.argv[2]);assert.equal(sha(raw),process.argv[3],'Root input pin');
const input=JSON.parse(raw);assert.equal(input.authorRoot,author);
assert(/^[a-z0-9][a-z0-9-]*$/u.test(input.outputName));
assert.equal(input.heapMiB,8192);assert(getHeapStatistics().heap_size_limit>=8192*1024*1024);
const root=join(here,input.outputName);await mkdir(root);
const record=async(name,value)=>{const path=join(root,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx'});return path;};
async function pinnedJson(pin){assert(pin&&isAbsolute(pin.path)&&Number.isSafeInteger(pin.bytes)&&/^[a-f0-9]{64}$/u.test(pin.sha256),'Unbound file input');const b=await readFile(pin.path);assert.equal(b.length,pin.bytes,pin.path);assert.equal(sha(b),pin.sha256,pin.path);return JSON.parse(b);}
async function filePin(path){const info=await lstat(path);assert(info.isFile()&&!info.isSymbolicLink(),path);const hash=createHash('sha256');for await(const part of createReadStream(path))hash.update(part);return {path,bytes:info.size,sha256:hash.digest('hex')};}
const samePin=async pin=>{assert.deepEqual(await filePin(pin.path),pin);};
const inside=(base,path)=>{const p=relative(base,path);return p!==''&&!p.startsWith('../')&&p!=='..'&&!isAbsolute(p);};
const jsonPointer=(value,pointer)=>{assert(pointer===''||pointer.startsWith('/'));return pointer===''?value:pointer.slice(1).split('/').reduce((v,k)=>v?.[k.replace(/~1/gu,'/').replace(/~0/gu,'~')],value);};
await record('STARTED.json',{at:new Date().toISOString(),pid:process.pid,inputSha256:process.argv[3],automaticRetry:false,role:'Post-host operator custody, not Product acceptance'});
try{
 const admission=await pinnedJson(input.admission);assert.equal(input.admission.sha256,'225dd021ab6b4d336ba4f7cce7b43eef969ec5dde0bd749607880ca252532ec7');
 const manifest=await pinnedJson(input.hostManifest);assert.equal(input.hostManifest.sha256,'a31fc65ff359598137396a3af3df5e3632c6bbd764f24efa26305253f46c7726');
 const selectedPin=name=>{const rows=manifest.files.filter(p=>p.path===join(author,name));assert.equal(rows.length,1,'Exact admitted control missing: '+name);return rows[0];};
 assert.deepEqual(selectedPin('ROOT_CONTROL_ADMISSION.json'),input.admission);
 assert.deepEqual(selectedPin('STAGED_CONTROL_PINS.json'),input.stagedControls);
 assert.deepEqual(selectedPin('POST_RETURN_CUSTODY.json'),input.selection);
 const selection=await pinnedJson(input.selection);assert.equal(selection.status,'ROOT_SELECTED_PASSIVE_CUSTODY_ACTUAL_RETURN_PENDING');
 assert.equal(selection.rootPostReturnReadSelection.selection,'actual_receipt_physical_result_after_source_conjunction_without_repeated_cold_reads');
 const controls=await pinnedJson(input.stagedControls);assert.equal(controls.count,17);assert.equal(controls.files.length,17);
 const staged=controls.files.map(({path,bytes,sha256})=>({path,bytes,sha256}));
 for(const pin of staged){const rows=manifest.files.filter(p=>p.path===pin.path);assert.equal(rows.length,1);assert.deepEqual(rows[0],pin);}
 assert.deepEqual(selectedPin('NATIVE_GRANT.json'),admission.nativeGrant);
 const grant=await pinnedJson(admission.nativeGrant),before=await pinnedJson(admission.sourceBefore),workload=await pinnedJson(selectedPin('workload.json'));
 const runtimeBinding=await pinnedJson(selectedPin('RUNTIME_BINDINGS.json'));
 assert.equal(before.files.length,449);assert.equal(grant.productWritePaths.length,4);assert.equal(grant.handoffFiles.length,3);assert.equal(grant.inheritedNewProductPaths.length,2);
 assert.equal(before.inheritedTrackedChangedPaths.length,54);assert.equal(before.inheritedUntrackedPaths.length,2);
 assert.deepEqual([...before.inheritedNewProductPaths].sort(),[...grant.inheritedNewProductPaths].sort());
 assert.equal(workload.testing.selectedPaths.length,469);assert.equal(grant.sourceAcquisitionPaths.length,449);
 const host=await pinnedJson(input.hostResult),launch=await pinnedJson(input.hostLaunch);
 assert.equal(input.hostResult.path,join(author,'host-supervision/HOST_RETURN.json'));assert.equal(input.hostLaunch.path,join(author,'execution/STARTED.json'));
 assert.equal(host.status,'HOST_RETURNED');assert(Number.isInteger(host.exitCode)&&Number.isFinite(Date.parse(host.at)),'Actual canonical host exit is missing');
 assert.equal(host.commandResultFile,join(author,'host-supervision/commands/native-host.result.json'));
 assert.equal(launch.manifestSha256,input.hostManifest.sha256);assert(Number.isFinite(Date.parse(launch.startedUtc))&&Date.parse(host.at)>=Date.parse(launch.startedUtc));
 assert(Number.isInteger(launch.pid)&&launch.pid>0);
 try{process.kill(launch.pid,0);throw Error('Author host PID is still live; no return acquisition');}catch(error){if(error.code!=='ESRCH')throw error;}
 const pending=await pinnedJson(input.pending);
 assert.equal(input.pending.path,join(author,'execution/READBACKS_PENDING.json'));
 assert.equal(pending.actualExecutionFile,input.execution.path);assert.equal(pending.actualResumeFile,input.resume.path);
 assert.equal(input.execution.path,join(author,'execution/execution.json'));assert.equal(input.resume.path,join(author,'execution/after-run-resume.json'));
 // One parse of the complete execution receipt. Subsequent reads consume hashes,
 // coordinates and its retained file pin, not another copy of this large value.
 let execution=await pinnedJson(input.execution);const receipt=execution.receipt;
 assert.equal(receipt?.kind,'definition_host_receipt');
 const close=receipt.resources?.eventResource?.closeHandoff;assert(close,'No genuine actual close; preserve this return and stop');
 const run=receipt.resources.run??null,terminal=receipt.ownerOutput?.value?.terminalResult??null;
 const executionState={exitCode:execution.execution?.exitCode??null,timedOut:execution.execution?.timedOut??null,truncated:execution.execution?.truncated??null,outcomeKind:receipt.ownerOutput?.outcomeKind??null};
 execution=null;
 let resumed=await pinnedJson(input.resume);
 assert.equal(resumed.state.resource,null);assert.equal(resumed.state.selection,null);assert.equal(resumed.state.environment,null);
 assert.equal(resumed.installedRoot,runtimeBinding.installedRoot,'Actual owner install changed');
 const runtime=await installedModules(resumed.installedRoot),hash=runtime.product.sha256Canonical;
 assert.equal(hash(resumed.state.closeHandoff),hash(close));assert.equal(hash(pending.actualClose),hash(close));assert.deepEqual(pending.run,run);
 const custody={sourceExecution:input.execution,sourceResume:input.resume,hostResult:input.hostResult,hostLaunch:input.hostLaunch,pending:input.pending,
  installedRoot:resumed.installedRoot,closeHandoff:close,run,sourceOutcome:executionState,expectedTerminal:null,sourceCustody:null,selection:input.selection,
  limits:['Passive actual receipt/physical Result/after/source conjunction only; no refresh, cold result/replay, lifecycle or provider invocation.',
   'One parse of each original execution/resume; complete bodies remain only at their existing owner artifacts.',
   'This metadata does not admit an event or confer Product/source acceptance. Discrepancies return to Root under the selected cold-read triggers.']};
 resumed=null;
 if(terminal!==null){
  assert(runtime.abg.isAbgTypedTerminalResult(terminal),'Actual terminal is not the installed owner type');
  assert.equal(hash(terminal.value),terminal.valueDigest);assert.equal(terminal.producer.runRef,run?.ref);
  custody.expectedTerminal={terminalDigest:hash(terminal),result:terminal.result,contract:terminal.contract,valueKind:terminal.valueKind,valueDigest:terminal.valueDigest,
   producerDigest:hash(terminal.producer),valueCanonicalDigest:hash(terminal.value),sourcePointer:'/receipt/ownerOutput/value/terminalResult'};
 }
 const native=terminal?.valueKind==='native_workspace_work_observation'&&terminal.value?.kind==='native_workspace_work_observation'?terminal.value:null;
 const authenticatedAfter=native!==null&&native.after!==null&&runtime.product.isNativeWorkspaceWorkObservation(native);
 const after=new Map((authenticatedAfter?native.after.entries:[]).map(entry=>[entry.relativePath,entry]));
 let coordinates=null;
 if(native!==null){
  assert.equal(terminal.producer.graphFunction.ref,'graph-function://abiogenesis/worksite/native-work@5');
  const timing=await pinnedJson(input.timing);assert.equal(input.timing.path,join(author,'execution/TIMING_OBSERVATION_ENVELOPES.json'));
  const rows=timing.results.filter(row=>row.eventId===terminal.producer.resultAdmissionEventRef);assert.equal(rows.length,1,'Exact native Result event is absent or ambiguous');
  const row=rows[0],prefix=close.prefix,log=fileURLToPath(prefix.eventLogRef);
  assert.equal(log,timing.eventLog);assert.equal(row.kind,'c_call_result_admitted');assert.equal(row.resultRef,terminal.result.ref);assert.equal(row.runId,run.ref);
  assert(Number.isSafeInteger(row.offset)&&row.offset>=timing.fromByte&&Number.isSafeInteger(row.rowBytes)&&row.rowBytes>0&&row.offset+row.rowBytes<=prefix.prefixLength);
  const handle=await open(log,'r');let physical;
  try{
   const stat=await handle.stat();assert.equal(stat.dev,prefix.storeIdentity.device);assert.equal(stat.ino,prefix.storeIdentity.inode);assert.equal(stat.size,prefix.prefixLength);
   physical=Buffer.alloc(row.rowBytes);let read=0;while(read<physical.length){const r=await handle.read(physical,read,physical.length-read,row.offset+read);assert(r.bytesRead>0);read+=r.bytesRead;}
   const end=await handle.stat();assert.equal(end.size,stat.size);assert.equal(end.mtimeMs,stat.mtimeMs);assert.equal(end.ctimeMs,stat.ctimeMs);
  }finally{await handle.close();}
  assert.equal(sha(physical),row.rowSha256);assert.equal(physical.at(-1),10);
  const stored=JSON.parse(physical.toString('utf8')),event=stored.event??stored,payload=event.payload;
  assert.equal(event.kind,'c_call_result_admitted');assert.equal(event.eventId,terminal.producer.resultAdmissionEventRef);assert.equal(event.admissionOrdinal,row.admissionOrdinal);
  assert.equal(event.runId,run.ref);assert.equal(event.aggregateId,terminal.producer.cCallRef);assert.equal(event.graphFunctionRef,terminal.producer.graphFunction.ref);
  assert.equal(payload.cCallRef,terminal.producer.cCallRef);assert.equal(payload.resultRef,terminal.result.ref);assert.equal(payload.resultDigest,terminal.result.digest);
  assert.equal(payload.contractRef,terminal.contract.ref);assert.equal(payload.valueKind,terminal.valueKind);assert.equal(payload.valueDigest,terminal.valueDigest);
  if(Object.hasOwn(payload,'value')){assert.equal(hash(payload.value),terminal.valueDigest);assert.equal(hash(payload),event.payloadDigest);}
  else{assert.equal(stored.codecVersion,1);assert.equal(stored.bodyReference?.bodyDigest,terminal.valueDigest);assert.equal(hash({...payload,value:terminal.value}),event.payloadDigest);}
  // Encoded body truth comes from the actual authenticated CLI terminal. This
  // digest comparison does not decode a history or create an admitted event.
  coordinates={...row,eventPath:log,physicalRow:{path:log,offset:row.offset,bytes:row.rowBytes,sha256:row.rowSha256},payloadDigest:event.payloadDigest,bodyReference:stored.bodyReference??null,
   result:terminal.result,valueDigest:terminal.valueDigest,ownerReceipt:input.execution,ownerValuePointer:'/receipt/ownerOutput/value/terminalResult/value',
   standing:'Physical selected row joined to actual owner receipt; no event admission, whole-history decoding or substitute runtime truth'};
  await record('NATIVE_RESULT_COORDINATES.json',coordinates);
 }
 assert.equal(execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),grant.sourceCommit);
 const currentDiff=execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'diff','--name-only',grant.sourceCommit],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 const cumulative=[...new Set([...(before.inheritedTrackedChangedPaths??[]),...grant.inheritedNewProductPaths,...grant.productWritePaths])];
 assert(currentDiff.every(path=>cumulative.includes(path)),'Tracked modification outside the preserved/selected cone');
 for(const pin of staged)await samePin(pin);
 const held=new Map(before.files.map(file=>[file.relativePath,file]));
 for(const file of before.files){assert(file.sourceSnapshot);await samePin({path:file.sourceSnapshot,bytes:file.bytes,sha256:file.sha256});
  if(!grant.productWritePaths.includes(file.relativePath))await samePin({path:join(grant.worksiteRoot,file.relativePath),bytes:file.bytes,sha256:file.sha256});}
 const selected=workload.testing.selectedPaths.filter(path=>!grant.handoffFiles.includes(path));
 const expectedPaths=[...held.keys(),...staged.map(pin=>relative(grant.worksiteRoot,pin.path))];
 assert.deepEqual([...new Set(selected)].sort(),[...new Set(expectedPaths)].sort());assert.equal(selected.length,466);
 const frozen=join(root,'review-subject-001');await mkdir(frozen);const files=[];
 for(const path of selected){
  assert(inside(grant.worksiteRoot,resolve(grant.worksiteRoot,path)));const source=join(grant.worksiteRoot,path),b=await readFile(source),entry=after.get(path);
  if(authenticatedAfter){assert.equal(entry?.state,'file',path);assert.equal(entry.byteLength,b.length,path);assert.equal(entry.digest,'sha256:'+sha(b),path);}
  let pre=null;try{pre=execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'show',grant.sourceCommit+':'+path],{stdio:['ignore','pipe','pipe']});}
  catch(error){assert(path.startsWith('qualification-inputs/')||grant.inheritedNewProductPaths.includes(path),'Unexpected absent Git baseline: '+path);}
  const prior=held.get(path),snapshot=join(frozen,'files',path),preimage=pre===null?null:join(frozen,'preimages',path);
  await mkdir(dirname(snapshot),{recursive:true});await writeFile(snapshot,b,{flag:'wx'});
  if(pre!==null){await mkdir(dirname(preimage),{recursive:true});await writeFile(preimage,pre,{flag:'wx'});}
  files.push({path,bytes:b.length,sha256:sha(b),snapshot,preimage,preimageSha256:pre===null?null:sha(pre),
   heldPreimage:prior?{path:prior.sourceSnapshot,bytes:prior.bytes,sha256:prior.sha256}:null,
   changed:cumulative.includes(path)&&(pre===null||sha(b)!==sha(pre)),changedFromHeld:grant.productWritePaths.includes(path)&&prior?.sha256!==sha(b),
   admittedAfterEntry:authenticatedAfter?{relativePath:entry.relativePath,state:entry.state,digest:entry.digest,byteLength:entry.byteLength}:null});
 }
 const handoffs=[],handoffValues=new Map();
 for(const path of grant.handoffFiles){
  let b;try{b=await readFile(join(grant.worksiteRoot,path));}catch(error){if(error.code==='ENOENT'&&!authenticatedAfter){handoffs.push({path,state:'absent',admitted:false});continue;}throw error;}
  const entry=after.get(path);if(authenticatedAfter){assert.equal(entry?.state,'file',path);assert.equal(entry.byteLength,b.length,path);assert.equal(entry.digest,'sha256:'+sha(b),path);}
  const name=path.slice(path.lastIndexOf('/')+1),snapshot=join(frozen,name);await writeFile(snapshot,b,{flag:'wx'});
  handoffs.push({path,snapshot,bytes:b.length,sha256:sha(b),admitted:authenticatedAfter});handoffValues.set(name,JSON.parse(b));
 }
 const feedback=[];
 for(const selection of input.selectedFeedback){
  assert(handoffValues.has(selection.handoff));const named=jsonPointer(handoffValues.get(selection.handoff),selection.pointer),namedPath=typeof named==='string'?named:named?.path;
  assert.equal(resolve(grant.worksiteRoot,namedPath),selection.file.path,'Feedback must be exactly named by its selected handoff field');
  await samePin(selection.file);if(typeof named==='object'&&named!==null){if(named.bytes!==undefined)assert.equal(named.bytes,selection.file.bytes);if(named.sha256!==undefined)assert.equal(named.sha256.replace(/^sha256:/u,''),selection.file.sha256);}
  const snapshot=join(frozen,'author-feedback',String(feedback.length).padStart(3,'0')+'-'+selection.file.path.split('/').at(-1));
  await mkdir(dirname(snapshot),{recursive:true});await writeFile(snapshot,await readFile(selection.file.path),{flag:'wx'});feedback.push({...selection,snapshot,standing:'Author feedback only; no actual C2 or acceptance'});
 }
 const parts=[execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'diff','--binary',grant.sourceCommit,'--',...cumulative])];
 for(const file of files.filter(file=>file.preimage===null&&cumulative.includes(file.path))){try{parts.push(execFileSync('/usr/bin/git',['diff','--no-index','--binary','--','/dev/null',file.snapshot],{stdio:['ignore','pipe','pipe']}));}catch(error){assert.equal(error.status,1);parts.push(error.stdout);}}
 const diffPath=join(frozen,'source.diff');await writeFile(diffPath,Buffer.concat(parts),{flag:'wx'});
 const hostReturnedClean=host.exitCode===0&&host.signal===null&&!host.timedOut&&!host.truncated&&host.failure===null;
 const invocationReturnedClean=executionState.exitCode===0&&executionState.timedOut===false&&executionState.truncated===false;
 const status=authenticatedAfter&&hostReturnedClean&&invocationReturnedClean?'OBSERVED_NATIVE_SOURCE_FROZEN_PASSIVE_CUSTODY_REVIEW_PROOF_PENDING':'PHYSICAL_PARTIAL_CUSTODY_NO_COMPLETE_CLEAN_NATIVE_AFTER';
 const subject={status,capturedUtc:new Date().toISOString(),sourceRoot:grant.worksiteRoot,sourceCommit:grant.sourceCommit,reviewBaseCommit:grant.sourceCommit,
  sourceBefore:admission.sourceBefore,sourceExecution:input.execution,sourceResume:input.resume,hostResult:input.hostResult,originalOutcome:executionState,
  nativeResult:terminal?.result??null,nativeValueDigest:terminal?.valueDigest??null,physicalResult:coordinates,
  afterObservationRef:authenticatedAfter?native.after.observationRef:null,afterObservationDigest:authenticatedAfter?native.after.observationDigest:null,
  trackedChangedPaths:currentDiff,changedPaths:files.filter(file=>file.changed).map(file=>file.path),incrementChangedPaths:files.filter(file=>file.changedFromHeld).map(file=>file.path),
  files,handoffs,authorFeedback:feedback,diff:await filePin(diffPath),rootHostManifest:input.hostManifest,stagedControlPins:input.stagedControls,postReturnSelection:input.selection,stagedControlCount:17,baselineCount:449,permittedProductPathCount:4,
  limits:['Custody only; no Product acceptance, author success, independent review, C2/UAT or qualification inferred.','Null/missing native after preserves physical partial custody without admission credit.','Held source preimages remain at their exact pinned existing snapshots; Git preimages and the two inherited untracked files are preserved.','No recursive feedback/archive inventory; only Root-selected handoff-named files are retained.']};
 const subjectPath=join(frozen,'SUBJECT.json');await writeFile(subjectPath,JSON.stringify(subject,null,2)+'\n',{flag:'wx'});
 custody.sourceCustody=await filePin(subjectPath);
 const custodyPath=await record('CUSTODY.json',custody);
 await record('SUMMARY.json',{status,sourceSubject:custody.sourceCustody,custody:await filePin(custodyPath),originalExecution:input.execution,
  fullTerminalPresent:terminal!==null,authenticatedNativeAfter:authenticatedAfter,run,originalOutcome:executionState,hostExitCode:host.exitCode,
  hostReturnedClean,invocationReturnedClean,pendingReads:[],coldReadTriggers:selection.rootPostReturnReadSelection.coldReadTriggers,
  physicalResult:coordinates===null?null:{eventId:coordinates.eventId,row:coordinates.physicalRow},
  files:files.length,handoffs:handoffs.map(({path,bytes,sha256,admitted,state})=>({path,bytes,sha256,admitted,state})),
  qualified:false,meaning:'Selected passive custody only. Root conjoins exact source/review/affected proof; a discrepancy or new owner relation returns for the selected narrow cold-read decision. This is not coding-task success.'});
 console.log(JSON.stringify({status,custody:await filePin(custodyPath),sourceSubject:custody.sourceCustody,pendingReads:[]}));
}catch(error){await record('FAILURE.json',{at:new Date().toISOString(),name:error.name,message:String(error.message).slice(0,800),status:'PARTIAL_OPERATOR_CUSTODY_REQUIRES_ROOT',automaticRetry:false});throw error;}
