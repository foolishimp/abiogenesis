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
let offset=0,selected=null;
for await(const line of createInterface({input:createReadStream(join(X,'runtime-001/resources/events/runtime.events.jsonl')),crlfDelay:Infinity})){
 let raw;try{raw=JSON.parse(line);}catch{break;}
 const decoded=decodeEventBody(raw,inline,undefined,earlier),event=decoded.event;
 events.set(event.eventId,event);
 if(decoded.physicallyInline){const b=inlineEventBody(event);if(b!==null)inline.set(b.eventRef,b);}
 const rowBytes=Buffer.byteLength(line)+1;
 if(offset>=minimum&&event.kind==='c_call_result_admitted'&&event.graphFunctionRef==='graph-function://abiogenesis/worksite/native-work/assessment@5'){
  assert.equal(sha256Canonical(event.payload),event.payloadDigest);
  selected={event,offset,rowBytes,rowSha256:hash(line+'\n')};break;
 }
 offset+=rowBytes;
}
if(selected===null){console.log(JSON.stringify({status:'ASSESSMENT_RESULT_NOT_YET_OBSERVED'}));process.exit(0);}
const {event,...physical}=selected,value=event.payload.value;
const assessments=[];
function visit(v){if(!v||typeof v!=='object')return;if(v.kind==='sandbox_uat_assessment'){assessments.push(v);return;}for(const x of Object.values(v))visit(x);}
visit(value.assessment);
if(assessments.length!==1){console.log(JSON.stringify({status:'REPORT_SHAPE_REQUIRES_INSPECTION',valueKeys:Object.keys(value),reportKeys:Object.keys(value.report??{}),assessmentCount:assessments.length}));process.exit(1);}
const coordinates={kind:event.kind,admissionOrdinal:event.admissionOrdinal,eventId:event.eventId,eventTime:event.eventTime,graphFunctionRef:event.graphFunctionRef,runId:event.runId,...physical,resultRef:event.payload.resultRef,resultDigest:event.payload.resultDigest,valueKind:value.kind};
const out={recordedUtc:new Date().toISOString(),coordinates,assessment:assessments[0],nativeProvenance:value.provenance,standing:'Actual native assessment preserved; Root may separately conjoin bounded evidence corrections. No acceptance inferred.'};
const path=join(A,'NATIVE_UAT_CLOSED_RESULT.json');
await writeFile(path,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'ACTUAL_NATIVE_ASSESSMENT_CAPTURED',path,sha256:hash(await readFile(path)),resultRef:coordinates.resultRef,eventOrdinal:coordinates.admissionOrdinal,disposition:out.assessment.disposition,unresolvedCriteria:out.assessment.unresolvedCriteria}));
