process.on('uncaughtException',error=>{console.error(JSON.stringify({status:'OPERATOR_CAPTURE_FAILED',name:error.name,message:String(error.message).slice(0,400)}));process.exitCode=1;});
// Passive operator custody. Installed owners validate the actual helper and Result.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {join,dirname,basename} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const A=dirname(fileURLToPath(import.meta.url)),X=dirname(A),activation=basename(A);
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const pin=async p=>{const b=await readFile(p);return {path:p,bytes:b.length,sha256:hash(b)};};
const put=async(p,b)=>{try{const old=await readFile(p);assert.equal(hash(old),hash(b),p+' already differs');}
  catch(e){if(e.code!=='ENOENT')throw e;await writeFile(p,b,{flag:'wx'});}};
const record=async(p,v)=>put(p,JSON.stringify(v,null,2)+'\n');
const retained=await json(join(A,'execution/resume.json'));
const coordinates=await json(join(A,'C2_HELPER_COORDINATES.json'));
const attempt=coordinates.attempt.root,helperPath=join(attempt,'result.json');
try{await stat(helperPath);}catch(e){if(e.code!=='ENOENT')throw e;console.log('{"status":"ACTUAL_HELPER_NOT_FINISHED"}');process.exit(0);}
const helperBytes=await readFile(helperPath),helper=JSON.parse(helperBytes);
const task=await json(join(attempt,'task.json'));
const installed=p=>import(pathToFileURL(join(retained.installedRoot,'build/code/src',p)));
const owner=await installed('product/worksite_command_execution.js');
const {sha256Canonical}=await installed('shared/digests.js');
const {canonicalEquals}=await installed('shared/value/index.js');
assert(owner.isNativeWorksiteCommandExecutionTask(task),'Actual task is not the native C2 arm');
assert(owner.isWorksiteExecutionHelperArtifact(task,helper),'Actual helper fails installed owner validation');
const protectedPreserved=owner.helperArtifactPreservesProtectedObservations(task,helper);

const {decodeEventBody,inlineEventBody}=await installed('abg/event_body_encoding.js');
const minimum=(await json(join(A,'execution/PREPARED_CALL.json'))).eventPrefix.prefixLength;
const inline=new Map(),events=new Map();
const earlier={envelope:r=>events.get(r),event:r=>{const e=events.get(r);assert(e);return e;}};
const eventPath=join(X,'runtime-001/resources/events/runtime.events.jsonl');
let offset=0,selected=null;
for await(const line of createInterface({input:createReadStream(eventPath),crlfDelay:Infinity})){
  let raw;try{raw=JSON.parse(line);}catch{break;}
  const decoded=decodeEventBody(raw,inline,undefined,earlier),event=decoded.event;
  events.set(event.eventId,event);
  if(decoded.physicallyInline){const b=inlineEventBody(event);if(b!==null)inline.set(b.eventRef,b);}
  const rowBytes=Buffer.byteLength(line)+1;
  if(offset>=minimum&&event.kind==='c_call_result_admitted'&&event.graphFunctionRef==='graph-function://abiogenesis/worksite/command-execution@5'&&event.payload.value?.helperArtifactRef===helper.artifactRef){
    assert.equal(sha256Canonical(event.payload),event.payloadDigest);
    selected={event,offset,rowBytes,rowSha256:hash(line+'\n'),rawLine:line+'\n'};break;
  }
  offset+=rowBytes;
}
if(selected===null){console.log('{"status":"HELPER_FINISHED_ADMITTED_C2_RESULT_PENDING"}');process.exit(0);}
const {event,rawLine,...physical}=selected,value=event.payload.value;
assert(owner.isNativeWorksiteCommandExecutionObservation(value),'Actual admitted C2 observation fails installed owner validation');
const comparisons={};
for(const key of ['commandResults','predicateObservations','productDelta','worksiteDelta']){
  comparisons[key]=canonicalEquals(value[key],helper[key]);assert(comparisons[key],key+' differs from actual helper');
}
const frozenPath=join(A,'review-subject-001/SUBJECT.json'),frozen=await json(frozenPath);
const expected=new Map(frozen.files.map(f=>[f.path,{bytes:f.bytes,sha256:f.sha256}]));
for(const name of ['return.json','readiness.json','progress.json']){
  const b=await readFile(join(A,'review-subject-001',name));
  expected.set('consolidation-scratch/'+activation+'/'+name,{bytes:b.length,sha256:hash(b)});
}
const stream=c=>{
  assert.equal(c.encoding,'base64');const b=Buffer.from(c.payload,'base64');
  assert.equal(b.length,c.byteLength);assert.equal('sha256:'+hash(b),c.digest);return b;
};
const sourceRows=stream(helper.commandResults[0].stdout).toString('utf8').trim().split('\n').map(l=>JSON.parse(l));
assert.equal(sourceRows.length,expected.size);
assert.equal(new Set(sourceRows.map(r=>r.path)).size,expected.size);
const correspondence=sourceRows.map(row=>({path:row.path,actual:row,expected:expected.get(row.path),equal:canonicalEquals({bytes:row.bytes,sha256:row.sha256},expected.get(row.path))}));
assert(correspondence.every(r=>r.equal),'Actual C2 source differs from frozen native source/handoff');
const root=join(attempt,'sandbox/build_tenants/abiogenesis/typescript/test_env/test_runs','single-address-space-'+activation);
const report=await json(join(root,'single-address-space-c2.json'));
const actualInputs=await json(join(attempt,'sandbox/consolidation-inputs',activation,'C2_INPUTS.json'));
assert.deepEqual(report.lanes.map(l=>l.id),actualInputs.lanes.map(l=>l.id),'Final report does not contain every selected lane');
const observedOutput=(relativePath,bytes)=>{const rows=helper.worksiteDelta.filter(r=>r.relativePath===relativePath);assert.equal(rows.length,1,relativePath);const after=rows[0].after;assert.equal(after.nodeKind,'file');assert.equal(after.byteLength,bytes.length);assert.equal(after.digest,'sha256:'+hash(bytes));};
const reportRelative='build_tenants/abiogenesis/typescript/test_env/test_runs/single-address-space-'+activation+'/';
observedOutput(reportRelative+'single-address-space-c2.json',await readFile(join(root,'single-address-space-c2.json')));
const dest=join(A,'actual-c2-001');await mkdir(dest,{recursive:true});
await put(join(dest,'HELPER_RESULT.json'),helperBytes);
await put(join(dest,'ADMITTED_C2_RESULT_PHYSICAL.json'),rawLine);
await put(join(dest,'single-address-space-c2.json'),await readFile(join(root,'single-address-space-c2.json')));
for(const lane of report.lanes){
  for(const suffix of ['.json','.stdout.log','.stderr.log']){
    const bytes=await readFile(join(root,lane.id+suffix));
    observedOutput(reportRelative+lane.id+suffix,bytes);
    if(suffix==='.json')assert(canonicalEquals(JSON.parse(bytes),lane),'Lane file differs from actual report');
    else assert.equal(hash(bytes),suffix==='.stdout.log'?lane.stdoutSha256:lane.stderrSha256,'Lane stream differs from actual report');
    await put(join(dest,lane.id+suffix),bytes);
  }
}
assert(report.nativeTestProof,'Whole-path producer record absent');
const proof=await readFile(join(root,'single-address-space-proof.json'));
observedOutput(reportRelative+'single-address-space-proof.json',proof);
assert.equal(hash(proof),report.nativeTestProof.sha256);
await put(join(dest,'single-address-space-proof.json'),proof);
const sourceRecord=join(dest,'SOURCE_CORRESPONDENCE.json');
await record(sourceRecord,{kind:'actual_admitted_c2_source_correspondence',subject:await pin(frozenPath),rows:correspondence,count:correspondence.length,allEqual:true,helperArtifactRef:helper.artifactRef});
const npmBytes=stream(helper.commandResults[5].stdout);
await put(join(dest,'NPM_PACK_STDOUT.txt'),npmBytes);
const observedPackBytes=await readFile(join(root,'candidate-package-observation.json'));
observedOutput(reportRelative+'candidate-package-observation.json',observedPackBytes);
const pack=JSON.parse(observedPackBytes),archive=await readFile(join(root,'candidate-package.tgz'));
observedOutput(reportRelative+'candidate-package.tgz',archive);
assert.equal(pack.bytes,archive.length);assert.equal(pack.sha256,hash(archive));
assert.equal(pack.integrity,'sha512-'+createHash('sha512').update(archive).digest('base64'));
assert.equal(npmBytes.toString('utf8').trim(),basename(pack.sourcePath));
await put(join(dest,'candidate-package.tgz'),archive);
await put(join(dest,'candidate-package-observation.json'),observedPackBytes);
await record(join(dest,'CANDIDATE_PACKAGE_IDENTITY.json'),{
  kind:'actual_c2_retained_package_identity',helperArtifactRef:helper.artifactRef,
  commandId:helper.commandResults[5].commandId,commandExitStatus:helper.commandResults[5].exitStatus,
  stdoutDigest:helper.commandResults[5].stdout.digest,relativePath:pack.sourcePath,
  filename:basename(pack.sourcePath),bytes:pack.bytes,sha256:pack.sha256,integrity:pack.integrity,
  retainedArchive:await pin(join(dest,'candidate-package.tgz')),
  standing:'Actual command-5 filename and helper-observed archive custody agree; exact archive retained. Not a release.'});
if(report.retainedEvidenceVerification!==null){
  const b=await readFile(join(root,'retained-c2-evidence-verification.json'));
  observedOutput(reportRelative+'retained-c2-evidence-verification.json',b);
  assert(canonicalEquals(JSON.parse(b),report.retainedEvidenceVerification));
  await put(join(dest,'retained-c2-evidence-verification.json'),b);
}
const summaryPath=join(A,'ACTUAL_C2_SUMMARY.json');
const summary={recordedUtc:new Date().toISOString(),status:report.failures.length?'ACTUAL_C2_COMPLETED_WITH_UNMET_PREDICATES':'ACTUAL_SELECTED_C2_PREDICATES_SATISFIED',
  standing:'Actual helper and admitted C2 Result conjoined; Root acceptance remains separate.',
  helperArtifactRef:helper.artifactRef,helperArtifactDigest:helper.artifactDigest,helperPhysicalSha256:hash(helperBytes),
  helperProducer:{attemptRoot:attempt,taskRef:task.taskRef,taskDigest:task.taskDigest,coordinates:await pin(join(A,'C2_HELPER_COORDINATES.json'))},
  commands:helper.commandResults.map(c=>({ordinal:c.ordinal,commandId:c.commandId,exitStatus:c.exitStatus,timedOut:c.timedOut,processSignal:c.processSignal,terminationConfirmed:c.terminationConfirmed,stdoutBytes:c.stdout.byteLength,stderrBytes:c.stderr.byteLength})),
  predicateObservedValues:helper.predicateObservations.map(p=>({predicateId:p.predicateId,observedValue:p.observedValue})),
  sourceCorrespondence:{count:correspondence.length,allEqualFrozenSourceAndHandoff:true,subjectSha256:hash(await readFile(frozenPath)),record:await pin(sourceRecord)},
  protectedInputCount:helper.protectedBefore.length,protectedBeforeEqualsAfter:protectedPreserved,productDelta:helper.productDelta,
  lanes:report.lanes,tally:{pass:report.lanes.reduce((n,l)=>n+(l.pass??0),0),fail:report.lanes.reduce((n,l)=>n+(l.fail??0),0),skipped:report.lanes.reduce((n,l)=>n+(l.skipped??0),0)},
  retainedEvidenceVerification:report.retainedEvidenceVerification,
  retainedPriorEvidence:actualInputs.retainedEvidence,
  retainedEvidenceStanding:'Prior rows are not included in newly executed tally and receive credit only if exact correspondence succeeded.',
  nativeProof:{...report.nativeTestProof,custody:await pin(join(dest,'single-address-space-proof.json'))},
  failure:report.failures,unrunLanes:[],priorEvidencePreserved:true};
await record(summaryPath,summary);
const closed={recordedUtc:new Date().toISOString(),status:'ACTUAL_ADMITTED_C2_RESULT_CAPTURED',
  coordinates:{kind:event.kind,admissionOrdinal:event.admissionOrdinal,eventId:event.eventId,eventTime:event.eventTime,graphFunctionRef:event.graphFunctionRef,runId:event.runId,...physical,resultRef:event.payload.resultRef,resultDigest:event.payload.resultDigest,valueKind:value.kind},
  observationRef:value.observationRef,observationDigest:value.observationDigest,helperArtifactRef:helper.artifactRef,
  exactHelperComparisons:comparisons,actualSummary:await pin(summaryPath),actualSourceCorrespondence:await pin(sourceRecord),
  standing:'Actual admitted result conjoined with actual helper and source correspondence; failures and skips remain, no Root acceptance inferred.'};
await record(join(A,'NATIVE_C2_CLOSED_RESULT.json'),closed);
console.log(JSON.stringify({status:summary.status,resultRef:closed.coordinates.resultRef,lanes:summary.lanes.length,tally:summary.tally,unmetLanes:summary.lanes.filter(l=>l.unmet.length).map(l=>l.id),sourceMatches:correspondence.length,protectedPreserved}));
