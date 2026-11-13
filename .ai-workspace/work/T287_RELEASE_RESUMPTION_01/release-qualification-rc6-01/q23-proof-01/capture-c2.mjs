// Root evidence custody. Existing installed C2 owners decide artifact validity.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {join,dirname,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const A=dirname(fileURLToPath(import.meta.url)),D=dirname(A),json=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const pin=async p=>{const b=await readFile(p);return {path:p,bytes:b.length,sha256:hash(b)}};
const retained=await json(join(A,'execution/resume.json')),pre=await json(join(A,'execution/PREPARED_CALL.json'));
const owned=p=>import(pathToFileURL(join(retained.installedRoot,'build/code/src',p)));
const {decodeEventBody,inlineEventBody}=await owned('abg/event_body_encoding.js'),{sha256Canonical}=await owned('shared/digests.js');
const {canonicalEquals}=await owned('shared/value/index.js'),owner=await owned('product/worksite_command_execution.js');
const bodies=new Map(),events=new Map(),earlier={envelope:r=>events.get(r),event:r=>{const e=events.get(r);assert(e);return e}};
let offset=0,selected=null;
for await(const line of createInterface({input:createReadStream(join(D,'runtime-001/resources/events/runtime.events.jsonl')),crlfDelay:Infinity})){
 let raw;try{raw=JSON.parse(line)}catch{break}
 const decoded=decodeEventBody(raw,bodies,undefined,earlier),e=decoded.event;events.set(e.eventId,e);
 if(decoded.physicallyInline){const b=inlineEventBody(e);if(b!==null)bodies.set(b.eventRef,b)}
 const rowBytes=Buffer.byteLength(line)+1;
 if(offset>=pre.eventPrefix.prefixLength&&e.kind==='c_call_result_admitted'&&e.graphFunctionRef==='graph-function://abiogenesis/worksite/command-execution@5'){
  assert.equal(sha256Canonical(e.payload),e.payloadDigest);selected={event:e,offset,rowBytes,rowSha256:hash(line+'\n'),rawLine:line+'\n'};break;
 }
 offset+=rowBytes;
}
if(selected===null){console.log('{"status":"ADMITTED_C2_RESULT_PENDING"}');process.exit(0)}
const {event,rawLine,...physical}=selected,value=event.payload.value;
if(!owner.isObservedWorksiteCommandExecutionObservation(value)){
 console.log(JSON.stringify({status:'ACTUAL_C2_NOT_SUCCESS_OBSERVATION',resultRef:event.payload.resultRef,valueKind:value?.kind,failure:value?.failureClass,diagnosticRef:value?.diagnosticRef}));process.exit(1);
}
const helperPath=value.provenance.helperArtifactPath,helperBytes=await readFile(helperPath),helper=JSON.parse(helperBytes),task=value.task;
assert(owner.isObservedWorksiteCommandExecutionTask(task));assert(owner.isWorksiteExecutionHelperArtifact(task,helper));
assert.equal(helper.disposition,'success');assert(owner.helperArtifactPreservesProtectedObservations(task,helper));
for(const k of ['commandResults','predicateObservations','worksiteDelta','productDelta'])assert(canonicalEquals(value[k],helper[k]),k);
assert.equal(helper.productDelta.length,0);assert(helper.worksiteDelta.every(r=>r.matchedTerritoryRef!==null));
const subject=await json(join(D,'q23-author-05/review-subject-001/SUBJECT.json')),w=await json(join(A,'workload.json'));
const frozen=new Map(subject.files.map(f=>[f.path,{bytes:f.bytes,sha256:f.sha256}]));
for(const name of ['return.json','readiness.json','progress.json'])frozen.set('qualification-scratch/q23-author-05/'+name,await pin(join(D,'q23-author-05/review-subject-001',name)));
const members=new Map(helper.snapshotMembers.map(r=>[r.relativePath,r]));assert.equal(members.size,w.testing.selectedPaths.length);
const sourceRows=[];
for(const path of w.testing.selectedPaths){const f=frozen.get(path),m=members.get(path);assert(f&&m,path);assert.equal(m.byteLength,f.bytes,path);assert.equal(m.digest,'sha256:'+f.sha256,path);const actual=await pin(join(helper.snapshotRoot,path));assert.equal(actual.sha256,f.sha256,path);sourceRows.push({path,bytes:f.bytes,sha256:f.sha256,snapshotEqual:true})}
const stream=s=>{assert.equal(s.encoding,'base64');const b=Buffer.from(s.payload,'base64');assert.equal(b.length,s.byteLength);assert.equal('sha256:'+hash(b),s.digest);return b};
assert.equal(helper.commandResults.length,6);assert(helper.commandResults.every(c=>c.exitStatus===0&&c.terminationConfirmed&&!c.timedOut));
const dest=join(A,'actual-c2-001');await mkdir(dest);
const observed=(path,b)=>{const rel=relative(helper.snapshotRoot,path);assert(!rel.startsWith('..'));const rows=helper.worksiteDelta.filter(r=>r.relativePath===rel);assert.equal(rows.length,1,rel);assert.equal(rows[0].after.nodeKind,'file');assert.equal(rows[0].after.byteLength,b.length);assert.equal(rows[0].after.digest,'sha256:'+hash(b))};
async function retainReceipt(index,name){const receipt=JSON.parse(stream(helper.commandResults[index].stdout).toString('utf8').trim());const b=await readFile(receipt.report.path);assert.equal(b.length,receipt.report.bytes);assert.equal(hash(b),receipt.report.sha256);observed(receipt.report.path,b);await writeFile(join(dest,name),b,{flag:'wx'});return {receipt,report:JSON.parse(b)}}
const source=await retainReceipt(0,'source-correspondence.json');assert.equal(source.receipt.status,'SOURCE_CORRESPONDENCE_RECORDED');assert.equal(source.report.files.length,sourceRows.length);
for(const row of source.report.files){const f=frozen.get(row.path);assert(f,row.path);assert.equal(f.sha256,row.sha256,row.path);assert.equal(f.bytes,row.bytes,row.path)}
const result=await retainReceipt(5,'component-result.json');assert.equal(result.receipt.status,'COMPONENT_COMPLETED');assert.deepEqual(result.report.failures,[]);
for(const lane of result.report.lanes){assert.equal(lane.exitCode,0);assert.equal(lane.pass,lane.tests);assert(lane.tests>=lane.sourceDeclaredMinimumTests);for(const key of ['fail','skipped','cancelled','todo'])assert.equal(lane[key],0);for(const key of ['stdout','stderr']){const p=lane[key],b=await readFile(p.path);assert.equal(b.length,p.bytes);assert.equal(hash(b),p.sha256);observed(p.path,b);await writeFile(join(dest,lane.id+'.'+key+(key==='stdout'?'.tap':'.log')),b,{flag:'wx'})}}
await writeFile(join(dest,'HELPER_RESULT.json'),helperBytes,{flag:'wx'});await writeFile(join(dest,'ADMITTED_C2_RESULT_PHYSICAL.json'),rawLine,{flag:'wx'});
const coordinates={admissionOrdinal:event.admissionOrdinal,eventId:event.eventId,eventTime:event.eventTime,runId:event.runId,...physical,resultRef:event.payload.resultRef,resultDigest:event.payload.resultDigest,valueKind:value.kind};
const summary={at:new Date().toISOString(),status:'ACTUAL_SELECTED_C2_PREDICATES_SATISFIED',coordinates,helper:await pin(helperPath),sourceSubject:await pin(join(D,'q23-author-05/review-subject-001/SUBJECT.json')),sourceMatches:sourceRows.length,commands:helper.commandResults.map(c=>({commandId:c.commandId,exitStatus:c.exitStatus,terminationConfirmed:c.terminationConfirmed,timedOut:c.timedOut})),lanes:result.report.lanes.map(({id,tests,pass,fail,skipped,cancelled,todo})=>({id,tests,pass,fail,skipped,cancelled,todo})),protectedInputCount:helper.protectedBefore.length,protectedBeforeAfterEqual:true,productDeltaCount:0,unmatchedTerritoryCount:0,sourceCorrespondence:await pin(join(dest,'source-correspondence.json')),componentReport:await pin(join(dest,'component-result.json')),limits:['Dependency entry pins only; no new whole dependency inventory assertion.','Component evidence only; independent source review, native UAT and fresh close remain separate.','Actual production eligibility, QR02 and F11 qualification are not established.']};
await writeFile(join(A,'ACTUAL_C2_SUMMARY.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:summary.status,resultRef:coordinates.resultRef,sourceMatches:summary.sourceMatches,lanes:summary.lanes}));
