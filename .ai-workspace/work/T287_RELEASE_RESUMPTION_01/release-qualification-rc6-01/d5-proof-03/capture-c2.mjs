// Passive custody only; installed C2 owners determine observation/artifact validity.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {join,dirname,relative,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const A=dirname(fileURLToPath(import.meta.url)),D=dirname(A),json=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex'),pin=async p=>{const b=await readFile(p);return {path:p,bytes:b.length,sha256:hash(b)}};
const optional=async p=>{try{return await json(p)}catch(e){if(e.code==='ENOENT')return null;throw e}};
const finish=async summary=>{const path=join(A,'ACTUAL_C2_SUMMARY.json');await writeFile(path,JSON.stringify(summary,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:summary.status,path,sha256:(await pin(path)).sha256,resultRef:summary.coordinates?.resultRef??null,sourceMatches:summary.sourceMatches??null,lanes:summary.lanes??[]}));};
async function main(){
 const existing=await optional(join(A,'ACTUAL_C2_SUMMARY.json'));if(existing){console.log(JSON.stringify({status:'CAPTURE_ALREADY_RETAINED',summary:await pin(join(A,'ACTUAL_C2_SUMMARY.json'))}));return;}
 const retained=await json(join(A,'execution/resume.json')),pre=await json(join(A,'execution/PREPARED_CALL.json')),binding=await json(join(A,'RUNTIME_BINDINGS.json'));
 assert.equal(binding.status,'ROOT_BOUND_TO_ACTUAL_D5_RETURN_CLOSE');
 const owned=p=>import(pathToFileURL(join(retained.installedRoot,'build/code/src',p)));
 const {decodeEventBody,inlineEventBody}=await owned('abg/event_body_encoding.js'),{sha256Canonical}=await owned('shared/digests.js');
 const {canonicalEquals}=await owned('shared/value/index.js'),owner=await owned('product/worksite_command_execution.js');
 const bodies=new Map(),events=new Map(),earlier={envelope:r=>events.get(r),event:r=>{const e=events.get(r);assert(e);return e}};
 let offset=0,selected=null,throughOrdinal=null;
 for await(const line of createInterface({input:createReadStream(fileURLToPath(pre.eventPrefix.eventLogRef)),crlfDelay:Infinity})){
  let raw;try{raw=JSON.parse(line)}catch{break}
  const decoded=decodeEventBody(raw,bodies,undefined,earlier),e=decoded.event;events.set(e.eventId,e);throughOrdinal=e.admissionOrdinal;
  if(decoded.physicallyInline){const b=inlineEventBody(e);if(b!==null)bodies.set(b.eventRef,b)}
  const rowBytes=Buffer.byteLength(line)+1;
  if(offset>=pre.eventPrefix.prefixLength&&e.kind==='c_call_result_admitted'&&e.graphFunctionRef==='graph-function://abiogenesis/worksite/command-execution@5'){
   assert.equal(sha256Canonical(e.payload),e.payloadDigest);selected={event:e,offset,rowBytes,rowSha256:hash(line+'\n')};break;
  }
  offset+=rowBytes;
 }
 if(selected===null){const outcome=await optional(join(A,'execution/outcome-summary.json')),close=await optional(join(A,'FINAL_RUNTIME_CLOSE.json'));
  if(!outcome&&!close){console.log(JSON.stringify({status:'ADMITTED_C2_RESULT_PENDING',throughOrdinal,throughByte:offset}));return;}
  await finish({at:new Date().toISOString(),status:'CLOSED_WITHOUT_ADMITTED_C2_RESULT',coordinates:null,actualOutcome:outcome?{file:await pin(join(A,'execution/outcome-summary.json')),outcomeKind:outcome.outcomeKind??null,disposition:outcome.disposition??null}:null,finalClose:close?await pin(join(A,'FINAL_RUNTIME_CLOSE.json')):null,observation:{fromByte:pre.eventPrefix.prefixLength,throughByte:offset,throughOrdinal},limits:['No C2 result observed; no pass or cause inferred. Root triage only.']});return;}
 const {event,...physical}=selected,value=event.payload.value;
 const coordinates={admissionOrdinal:event.admissionOrdinal,eventId:event.eventId,eventTime:event.eventTime,runId:event.runId??null,...physical,resultRef:event.payload.resultRef,resultDigest:event.payload.resultDigest,valueKind:value?.kind??null};
 if(!owner.isObservedWorksiteCommandExecutionObservation(value)){await finish({at:new Date().toISOString(),status:'ACTUAL_C2_NON_SUCCESS_RESULT_CAPTURED',coordinates,failureClass:value?.failureClass??null,diagnosticRefDigest:typeof value?.diagnosticRef==='string'?hash(value.diagnosticRef):null,limits:['Only admitted coordinates and bounded failure metadata. No private diagnostic/body or success assumption.']});return;}
 const helperPath=value.provenance.helperArtifactPath,helperBytes=await readFile(helperPath),helper=JSON.parse(helperBytes),task=value.task;
 assert(owner.isObservedWorksiteCommandExecutionTask(task));assert(owner.isWorksiteExecutionHelperArtifact(task,helper));
 for(const k of ['commandResults','predicateObservations','worksiteDelta','productDelta'])assert(canonicalEquals(value[k],helper[k]),k);
 const w=await json(join(A,'workload.json')),held=await json(join(A,'SOURCE_BEFORE.json')),index=await json(join(A,'DECLARED_REPORT_INDEX.json'));
 assert.equal(held.status,'BOUND_ACTUAL_D5_NATIVE_SUBJECT');assert.deepEqual(held.frozenSubject,binding.frozenSubject);
 const frozen=new Map(held.files.map(f=>[f.relativePath,f])),members=new Map(helper.snapshotMembers.map(f=>[f.relativePath,f])),issues=[];
 assert.equal(w.testing.commands.length,7);assert.deepEqual(index.commands.map(c=>c.commandId),w.testing.commands.map(c=>c.commandId));
 assert.equal(new Set(helper.commandResults.map(c=>c.commandId)).size,helper.commandResults.length);
 const byId=new Map(helper.commandResults.map(c=>[c.commandId,c]));
 if(helper.commandResults.length!==w.testing.commands.length)issues.push('declared command population incomplete');
 let sourceMatches=0;
 for(const path of w.testing.selectedPaths){const f=frozen.get(path),m=members.get(path);assert(f&&m,path);assert.equal(m.byteLength,f.bytes,path);assert.equal(m.digest,'sha256:'+f.sha256,path);const actual=await pin(join(helper.snapshotRoot,path));assert.equal(actual.bytes,f.bytes,path);assert.equal(actual.sha256,f.sha256,path);sourceMatches++;}
 assert.equal(members.size,w.testing.selectedPaths.length);
 const preserved=owner.helperArtifactPreservesProtectedObservations(task,helper),unmatched=helper.worksiteDelta.filter(r=>r.matchedTerritoryRef===null).length;
 if(helper.disposition!=='success')issues.push('helper disposition is not success');if(!preserved)issues.push('protected observations not preserved');if(helper.productDelta.length)issues.push('Product delta is nonempty');if(unmatched)issues.push('unmatched output territory');
 for(const command of w.testing.commands){const c=byId.get(command.commandId);if(!c||c.exitStatus!==0||!c.terminationConfirmed||c.timedOut)issues.push('command did not complete successfully: '+command.commandId);}
 const stream=s=>{assert.equal(s.encoding,'base64');const b=Buffer.from(s.payload,'base64');assert.equal(b.length,s.byteLength);assert.equal('sha256:'+hash(b),s.digest);return b};
 const dest=join(A,'actual-c2-001');await mkdir(dest);
 const observed=(path,b)=>{const rel=relative(helper.snapshotRoot,path);assert(!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('../'));const rows=helper.worksiteDelta.filter(r=>r.relativePath===rel);assert.equal(rows.length,1,rel);assert.equal(rows[0].after.nodeKind,'file');assert.equal(rows[0].after.byteLength,b.length);assert.equal(rows[0].after.digest,'sha256:'+hash(b));};
 async function receipt(commandId,name){const c=byId.get(commandId);if(!c){issues.push('report command missing: '+commandId);return null;}let value;try{value=JSON.parse(stream(c.stdout).toString('utf8').trim())}catch{issues.push('report receipt absent or invalid: '+commandId);return null;}if(!value?.report?.path){issues.push('report path absent: '+commandId);return null;}const b=await readFile(value.report.path);assert.equal(b.length,value.report.bytes);assert.equal(hash(b),value.report.sha256);observed(value.report.path,b);await writeFile(join(dest,name),b,{flag:'wx'});return {receipt:value,report:JSON.parse(b),retained:await pin(join(dest,name))};}
 const source=await receipt(index.sourceCorrespondenceCommandId,'source-correspondence.json');
 if(source){if(source.receipt.status!=='SOURCE_CORRESPONDENCE_RECORDED')issues.push('source correspondence not recorded');assert.equal(source.report.files.length,index.helperReportInputCount);assert.deepEqual(source.report.files.map(r=>r.path).sort(),[...index.sourceCorrespondencePaths].sort(),'Exact retained helper407 declaration');for(const row of source.report.files){const f=frozen.get(row.path);assert(f,row.path);assert.equal(f.sha256,row.sha256,row.path);assert.equal(f.bytes,row.bytes,row.path);}}
 const result=await receipt(index.componentCommandId,'component-result.json'),laneSummary=[];
 if(result){if(result.receipt.status!=='COMPONENT_COMPLETED'||result.report.failures.length!==0)issues.push('component predicates not all satisfied');assert.deepEqual(result.report.lanes.map(l=>l.id),index.lanes.map(l=>l.id));for(const lane of result.report.lanes){const declared=index.lanes.find(l=>l.id===lane.id);assert.deepEqual(lane.files,declared.files);if(lane.exitCode!==0||lane.pass!==lane.tests||lane.tests<lane.sourceDeclaredMinimumTests||lane.tests<index.retainedTestPopulation[lane.id]||['fail','skipped','cancelled','todo'].some(k=>lane[k]!==0))issues.push('lane unsuccessful or skipped: '+lane.id);for(const key of ['stdout','stderr']){const p=lane[key],b=await readFile(p.path);assert.equal(b.length,p.bytes);assert.equal(hash(b),p.sha256);observed(p.path,b);await writeFile(join(dest,lane.id+'.'+key+(key==='stdout'?'.tap':'.log')),b,{flag:'wx'});}laneSummary.push(Object.fromEntries(['id','tests','pass','fail','skipped','cancelled','todo'].map(k=>[k,lane[k]])));}}
 const guard=byId.get(index.guardCommandId),guardEvidence={commandId:index.guardCommandId,exitStatus:guard?.exitStatus??null};
 if(guard)for(const key of ['stdout','stderr']){const b=stream(guard[key]),p=join(dest,'lifecycle-boundary.'+key+'.log');await writeFile(p,b,{flag:'wx'});guardEvidence[key]=await pin(p);}
 await finish({at:new Date().toISOString(),status:issues.length?'ACTUAL_C2_CAPTURED_WITH_UNSATISFIED_OR_UNKNOWN_CHECKS':'ACTUAL_SELECTED_C2_PREDICATES_SATISFIED',coordinates,helper:await pin(helperPath),sourceSubject:binding.frozenSubject,sourceBefore:await pin(join(A,'SOURCE_BEFORE.json')),sourceMatches,sourceCorrespondenceReportedInputs:source?.report.files.length??null,sourceCorrespondenceDeclaredInputs:index.helperReportInputCount,additionalProtectedInputCount:index.additionalProtectedPaths.length,declaredReportIndex:await pin(join(A,'DECLARED_REPORT_INDEX.json')),commands:w.testing.commands.map(d=>{const c=byId.get(d.commandId);return {commandId:d.commandId,observed:!!c,exitStatus:c?.exitStatus??null,terminationConfirmed:c?.terminationConfirmed??null,timedOut:c?.timedOut??null}}),lanes:laneSummary,guard:guardEvidence,protectedInputCount:helper.protectedBefore.length,protectedBeforeAfterEqual:preserved,productDeltaCount:helper.productDelta.length,unmatchedTerritoryCount:unmatched,allowedWriteTerritories:w.testing.allowedWriteTerritories,sourceCorrespondence:source?.retained??null,componentReport:result?.retained??null,issues,limits:['Exact snapshot/input correspondence and existing-owner artifact checks only. No whole raw source-bearing event/helper body copied or printed.','TAP/guard reports are selected finite evidence; semantic recovery assertions still require UAT/review.','No Q23 acceptance, formal independent assessment or release qualification inferred.']});
}
main().catch(error=>{console.error(JSON.stringify({status:'OPERATOR_CAPTURE_FAILED',name:error?.name??'Error',code:typeof error?.code==='string'?error.code:null}));process.exitCode=1;});
