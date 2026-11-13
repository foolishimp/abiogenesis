process.on('uncaughtException',error=>{console.error(JSON.stringify({status:'OPERATOR_CAPTURE_FAILED',name:error.name,message:String(error.message).slice(0,400)}));process.exitCode=1;});
// Passive custody of one actual assessment Result, using the installed decoder.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const A=dirname(fileURLToPath(import.meta.url)),X=dirname(A);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const retained=await read(join(A,'execution/resume.json'));
const minimum=(await read(join(A,'execution/PREPARED_CALL.json'))).eventPrefix.prefixLength;
const {decodeEventBody,inlineEventBody}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/event_body_encoding.js')));
const {sha256Canonical}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/shared/digests.js')));
const hash=b=>createHash('sha256').update(b).digest('hex');
const inline=new Map(),events=new Map();
const earlier={envelope:ref=>events.get(ref),event:ref=>{const e=events.get(ref);assert(e);return e;}};
let offset=0,selected=null,assessmentTask=null,nativeActorLaunched=false,lastGap=null,throughOrdinal=null;
for await(const line of createInterface({input:createReadStream(join(X,'runtime-001/resources/events/runtime.events.jsonl')),crlfDelay:Infinity})){
 let raw;try{raw=JSON.parse(line);}catch{break;}
 const decoded=decodeEventBody(raw,inline,undefined,earlier),event=decoded.event;
 events.set(event.eventId,event);
 if(decoded.physicallyInline){const b=inlineEventBody(event);if(b!==null)inline.set(b.eventRef,b);}
 const rowBytes=Buffer.byteLength(line)+1;
 throughOrdinal=event.admissionOrdinal;
 if(offset>=minimum&&event.kind==='c_call_result_admitted'&&event.payload.value?.kind==='registered_graph_choice'&&event.payload.value.disposition==='gap')lastGap={event,offset,rowBytes,rowSha256:hash(line+'\n')};
 if(offset>=minimum&&event.kind==='actor_process_started'&&event.graphFunctionRef==='graph-function://abiogenesis/worksite/native-work/assessment@5')nativeActorLaunched=true;
 if(offset>=minimum&&event.kind==='c_call_result_admitted'&&event.graphFunctionRef==='graph-function://abiogenesis/default-library/uat@5'&&event.payload.value?.kind==='native_workspace_work_task'){
  assert.equal(sha256Canonical(event.payload),event.payloadDigest);
  assessmentTask={event,offset,rowBytes,rowSha256:hash(line+'\n')};
 }
 if(offset>=minimum&&event.kind==='c_call_result_admitted'&&event.graphFunctionRef==='graph-function://abiogenesis/worksite/native-work/assessment@5'){
  assert.equal(sha256Canonical(event.payload),event.payloadDigest);
  selected={event,offset,rowBytes,rowSha256:hash(line+'\n')};break;
 }
 offset+=rowBytes;
}
if(selected===null){
 const outcomePath=join(A,'execution/outcome-summary.json');
 let outcome;try{outcome=await read(outcomePath);}catch(error){if(error.code!=='ENOENT')throw error;}
 if(!outcome){console.log(JSON.stringify({status:'ASSESSMENT_RESULT_NOT_YET_OBSERVED'}));process.exit(0);}
 assert.equal(outcome.disposition,'blocked');assert.equal(outcome.terminal,null);
 assert.equal(assessmentTask,null);assert.equal(nativeActorLaunched,false);assert(lastGap);
 assert.equal(lastGap.event.runId,outcome.run.ref);
 assert.equal(sha256Canonical(lastGap.event.payload),lastGap.event.payloadDigest);
 const g=lastGap.event,value=g.payload.value;
 const out={recordedUtc:new Date().toISOString(),status:'NATIVE_UAT_NOT_SELECTED',assessment:null,
   nativeActorLaunched:false,assessmentTaskObserved:false,
   actualOutcome:{path:outcomePath,bytes:(await readFile(outcomePath)).length,sha256:hash(await readFile(outcomePath)),disposition:outcome.disposition,run:outcome.run,terminal:outcome.terminal},
   actualGap:{eventId:g.eventId,eventOrdinal:g.admissionOrdinal,eventTime:g.eventTime,graphFunctionRef:g.graphFunctionRef,runId:g.runId,resultRef:g.payload.resultRef,resultDigest:g.payload.resultDigest,payloadDigest:g.payloadDigest,offset:lastGap.offset,rowBytes:lastGap.rowBytes,rowSha256:lastGap.rowSha256,value},
   observation:{fromByte:minimum,throughByte:offset,throughOrdinal,method:'Installed decoder over actual complete rows; no assessment task, actor start or Result in this closed invocation suffix.'},
   standing:'Actual blocked native outcome and admitted gap preserved. No native UAT assessment, semantic rejection or acceptance is inferred; fresh close remains separately captured.'};
 const path=join(A,'NATIVE_UAT_CLOSED_RESULT.json');
 await writeFile(path,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:out.status,path,sha256:hash(await readFile(path)),gapResultRef:out.actualGap.resultRef}));process.exit(0);
}
const {event,...physical}=selected,value=event.payload.value;
if(value.kind==='native_workspace_work_failure'){
 assert(assessmentTask,'Actual assessment task not observed');
 const failure=value,diagnostic=JSON.parse(decodeURIComponent(failure.diagnosticRef.split(',').slice(1).join(',')));
 let refusal=null;try{refusal=JSON.parse(diagnostic.message);}catch{}
 const taskPath=join(A,'ACTUAL_UAT_TASK.json');
 await writeFile(taskPath,JSON.stringify(assessmentTask.event.payload.value,null,2)+'\n',{flag:'wx'});
 const coordinates={kind:event.kind,admissionOrdinal:event.admissionOrdinal,eventId:event.eventId,eventTime:event.eventTime,graphFunctionRef:event.graphFunctionRef,runId:event.runId,...physical,resultRef:event.payload.resultRef,resultDigest:event.payload.resultDigest,valueKind:value.kind};
 const taskPin={path:taskPath,sha256:hash(await readFile(taskPath)),bytes:(await readFile(taskPath)).length,eventOrdinal:assessmentTask.event.admissionOrdinal,resultRef:assessmentTask.event.payload.resultRef,payloadDigest:assessmentTask.event.payloadDigest,offset:assessmentTask.offset,rowBytes:assessmentTask.rowBytes,rowSha256:assessmentTask.rowSha256};
 const out={recordedUtc:new Date().toISOString(),status:nativeActorLaunched?'NATIVE_UAT_EXECUTION_FAILED':'NATIVE_UAT_PREPARATION_REFUSED_ACTOR_NOT_LAUNCHED',coordinates,assessment:null,preparationFailure:failure,diagnostic,refusal,actualTask:taskPin,nativeActorLaunched,standing:'Actual failure; no completed native UAT assessment or semantic rejection is inferred. Original obligations remain open.'};
 const path=join(A,'NATIVE_UAT_CLOSED_RESULT.json');
 await writeFile(path,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:out.status,path,sha256:hash(await readFile(path)),resultRef:coordinates.resultRef,refusal,task:taskPin}));process.exit(0);
}
const assessments=[];
function visit(v){if(!v||typeof v!=='object')return;if(v.kind==='sandbox_uat_assessment'){assessments.push(v);return;}for(const x of Object.values(v))visit(x);}
visit(value.assessment);
if(assessments.length!==1){console.log(JSON.stringify({status:'REPORT_SHAPE_REQUIRES_INSPECTION',valueKeys:Object.keys(value),reportKeys:Object.keys(value.report??{}),assessmentCount:assessments.length}));process.exit(1);}
const coordinates={kind:event.kind,admissionOrdinal:event.admissionOrdinal,eventId:event.eventId,eventTime:event.eventTime,graphFunctionRef:event.graphFunctionRef,runId:event.runId,...physical,resultRef:event.payload.resultRef,resultDigest:event.payload.resultDigest,valueKind:value.kind};
const out={recordedUtc:new Date().toISOString(),coordinates,assessment:assessments[0],nativeProvenance:value.provenance,standing:'Actual native assessment preserved; Root may separately conjoin bounded evidence corrections. No acceptance inferred.'};
const path=join(A,'NATIVE_UAT_CLOSED_RESULT.json');
await writeFile(path,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'ACTUAL_NATIVE_ASSESSMENT_CAPTURED',path,sha256:hash(await readFile(path)),resultRef:coordinates.resultRef,eventOrdinal:coordinates.admissionOrdinal,disposition:out.assessment.disposition,unresolvedCriteria:out.assessment.unresolvedCriteria}));
