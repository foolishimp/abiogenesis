// Total passive UAT custody: success, failure, other result, pending, or closed without result.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const A=dirname(fileURLToPath(import.meta.url)),read=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex'),pin=async p=>{const b=await readFile(p);return {path:p,bytes:b.length,sha256:hash(b)}};
const optional=async p=>{try{return await read(p)}catch(e){if(e.code==='ENOENT')return null;throw e}};
const scalar=x=>typeof x==='string'||typeof x==='number'||typeof x==='boolean'?x:null;
async function save(out){const path=join(A,'NATIVE_UAT_CLOSED_RESULT.json');await writeFile(path,JSON.stringify(out,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:out.status,path,sha256:(await pin(path)).sha256,resultRef:out.coordinates?.resultRef??null,disposition:out.assessmentDisposition??out.actualOutcome?.disposition??null}));}
async function main(){
 const existing=await optional(join(A,'NATIVE_UAT_CLOSED_RESULT.json'));if(existing){console.log(JSON.stringify({status:'CAPTURE_ALREADY_RETAINED',summary:await pin(join(A,'NATIVE_UAT_CLOSED_RESULT.json'))}));return;}
 const binding=await read(join(A,'RUNTIME_BINDINGS.json'));assert.equal(binding.status,'ROOT_BOUND_TO_ACTUAL_D5_RETURN_CLOSE');
 const retained=await read(join(A,'execution/resume.json')),pre=await read(join(A,'execution/PREPARED_CALL.json')),minimum=pre.eventPrefix.prefixLength;
 const {decodeEventBody,inlineEventBody}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/event_body_encoding.js')));
 const {sha256Canonical}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/shared/digests.js')));
 const inline=new Map(),events=new Map(),earlier={envelope:r=>events.get(r),event:r=>{const e=events.get(r);assert(e);return e}};
 let offset=0,selected=null,assessmentTask=null,nativeActorLaunched=false,throughOrdinal=null;
 for await(const line of createInterface({input:createReadStream(fileURLToPath(pre.eventPrefix.eventLogRef)),crlfDelay:Infinity})){
  let raw;try{raw=JSON.parse(line)}catch{break}
  const decoded=decodeEventBody(raw,inline,undefined,earlier),event=decoded.event;events.set(event.eventId,event);throughOrdinal=event.admissionOrdinal;
  if(decoded.physicallyInline){const b=inlineEventBody(event);if(b!==null)inline.set(b.eventRef,b)}
  const rowBytes=Buffer.byteLength(line)+1;
  if(offset>=minimum&&event.kind==='actor_process_started'&&event.graphFunctionRef==='graph-function://abiogenesis/worksite/native-work/assessment@5')nativeActorLaunched=true;
  if(offset>=minimum&&event.kind==='c_call_result_admitted'&&event.graphFunctionRef==='graph-function://abiogenesis/default-library/uat@5'&&event.payload.value?.kind==='native_workspace_work_task'){
   assert.equal(sha256Canonical(event.payload),event.payloadDigest);assessmentTask={eventOrdinal:event.admissionOrdinal,resultRef:event.payload.resultRef,resultDigest:event.payload.resultDigest,offset,rowBytes,rowSha256:hash(line+'\n')};
  }
  if(offset>=minimum&&event.kind==='c_call_result_admitted'&&event.graphFunctionRef==='graph-function://abiogenesis/worksite/native-work/assessment@5'){
   assert.equal(sha256Canonical(event.payload),event.payloadDigest);selected={event,offset,rowBytes,rowSha256:hash(line+'\n')};break;
  }
  offset+=rowBytes;
 }
 const base={recordedUtc:new Date().toISOString(),nativeActorLaunched,assessmentTask,sourceSubject:binding.frozenSubject,limits:['Passive metadata/public-assessment custody only. No diagnostic/private provider text or raw source-bearing event printed/copied.','No source acceptance, formal independent third-family judgment, Q23 eligibility or release qualification inferred.']};
 if(selected===null){
  const outcomePath=join(A,'execution/outcome-summary.json'),outcome=await optional(outcomePath),close=await optional(join(A,'FINAL_RUNTIME_CLOSE.json'));
  if(!outcome&&!close){console.log(JSON.stringify({status:'ASSESSMENT_RESULT_NOT_YET_OBSERVED',nativeActorLaunched,assessmentTaskObserved:assessmentTask!==null,throughOrdinal,throughByte:offset}));return;}
  await save({...base,status:'CLOSED_WITHOUT_NATIVE_UAT_RESULT',coordinates:null,assessment:null,actualOutcome:outcome?{file:await pin(outcomePath),outcomeKind:scalar(outcome.outcomeKind),disposition:scalar(outcome.disposition),runRef:scalar(outcome.run?.runRef??outcome.run?.ref??outcome.run),terminalPresent:outcome.terminal!==null&&outcome.terminal!==undefined}:null,finalClose:close?await pin(join(A,'FINAL_RUNTIME_CLOSE.json')):null,observation:{fromByte:minimum,throughByte:offset,throughOrdinal},standing:'Actual owner-return/final-close evidence without native UAT result. No blocked-disposition or causal assumption; Root triages actual cause.'});return;
 }
 const {event,...physical}=selected,value=event.payload.value;
 const coordinates={kind:event.kind,admissionOrdinal:event.admissionOrdinal,eventId:event.eventId,eventTime:event.eventTime,graphFunctionRef:event.graphFunctionRef,runId:scalar(event.runId),...physical,resultRef:event.payload.resultRef,resultDigest:event.payload.resultDigest,valueKind:scalar(value?.kind)};
 if(value?.kind==='native_workspace_work_failure'){
  await save({...base,status:'NATIVE_UAT_FAILURE_OBSERVED',coordinates,assessment:null,failureClass:scalar(value.failureClass),diagnosticRefDigest:typeof value.diagnosticRef==='string'?hash(value.diagnosticRef):null,standing:'Admitted failure metadata only; original diagnostics remain at exact original owner coordinates. No success inferred.'});return;
 }
 const assessments=[];function visit(v){if(!v||typeof v!=='object')return;if(v.kind==='sandbox_uat_assessment'){assessments.push(v);return;}for(const x of Object.values(v))visit(x)}visit(value?.assessment);
 if(assessments.length!==1){await save({...base,status:'NATIVE_UAT_RESULT_WITHOUT_UNIQUE_ASSESSMENT',coordinates,assessment:null,assessmentCount:assessments.length,standing:'Actual admitted result retained by coordinates, but no unique public UAT assessment; Root owner triage required. No raw payload/private output printed.'});return;}
 const assessment=assessments[0],dest=join(A,'actual-uat-001');await mkdir(dest);const path=join(dest,'selected-assessment.json');await writeFile(path,JSON.stringify(assessment,null,2)+'\n',{flag:'wx'});
 await save({...base,status:'ACTUAL_NATIVE_ASSESSMENT_CAPTURED',coordinates,assessment:await pin(path),assessmentCanonicalDigest:sha256Canonical(assessment),assessmentDisposition:scalar(assessment.disposition),unresolvedCriteriaCount:Array.isArray(assessment.unresolvedCriteria)?assessment.unresolvedCriteria.length:null,nativeProvenanceDigest:value.provenance?sha256Canonical(value.provenance):null,standing:'Exact selected public UAT assessment retained separately; successful capture is not a satisfied assessment or Root acceptance.'});
}
main().catch(error=>{console.error(JSON.stringify({status:'OPERATOR_CAPTURE_FAILED',name:error?.name??'Error',code:typeof error?.code==='string'?error.code:null}));process.exitCode=1;});
