// Operator evidence custody using existing installed decoder and C2 contract owners.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,mkdir,readdir,lstat,readlink} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {join,dirname,relative,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const A=dirname(fileURLToPath(import.meta.url)),D=dirname(A),read=async p=>JSON.parse(await readFile(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex'),pin=async p=>{const b=await readFile(p);return {path:p,bytes:b.length,sha256:sha(b)}};
const retained=await read(join(A,'execution/resume.json')),pre=await read(join(A,'execution/PREPARED_CALL.json'));
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
  assert.equal(sha256Canonical(e.payload),e.payloadDigest);selected={event:e,offset,rowBytes,rowSha256:sha(line+'\n'),rawLine:line+'\n'};break;
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
const held=await read(join(A,'SOURCE_BEFORE.json')),members=new Map(helper.snapshotMembers.map(r=>[r.relativePath,r]));
assert.equal(members.size,held.files.length);
const sourceRows=[];
for(const f of held.files){const m=members.get(f.relativePath);assert(m,f.relativePath);assert.equal(m.byteLength,f.bytes,f.relativePath);assert.equal(m.digest,'sha256:'+f.sha256,f.relativePath);const actual=await pin(join(helper.snapshotRoot,f.relativePath));assert.equal(actual.sha256,f.sha256,f.relativePath);sourceRows.push({relativePath:f.relativePath,bytes:f.bytes,sha256:f.sha256,snapshotEqual:true})}
const stream=s=>{assert.equal(s.encoding,'base64');const b=Buffer.from(s.payload,'base64');assert.equal(b.length,s.byteLength);assert.equal('sha256:'+sha(b),s.digest);return b};
assert.equal(helper.commandResults.length,4);assert(helper.commandResults.every(c=>c.exitStatus===0&&c.terminationConfirmed&&!c.timedOut));
const receipt=JSON.parse(stream(helper.commandResults[3].stdout).toString('utf8').trim());assert.equal(receipt.status,'COMPONENT_COMPLETED');
const reportPath=receipt.report.path,reportBytes=await readFile(reportPath);assert.equal(reportBytes.length,receipt.report.bytes);assert.equal(sha(reportBytes),receipt.report.sha256);
const report=JSON.parse(reportBytes);assert.deepEqual([report.tests,report.pass,report.fail,report.skipped],[7,5,0,2]);assert.deepEqual(report.failures,[]);
const reportRelative=relative(helper.snapshotRoot,reportPath);assert(!reportRelative.startsWith('..'));
const observedFile=(rel,b)=>{const rows=helper.worksiteDelta.filter(r=>r.relativePath===rel);assert.equal(rows.length,1,rel);assert.equal(rows[0].after.nodeKind,'file');assert.equal(rows[0].after.byteLength,b.length);assert.equal(rows[0].after.digest,'sha256:'+sha(b))};observedFile(reportRelative,reportBytes);
const stdoutPath=join(dirname(reportPath),'component.stdout.tap'),stderrPath=join(dirname(reportPath),'component.stderr.log');
const stdout=await readFile(stdoutPath),stderr=await readFile(stderrPath);assert.equal(sha(stdout),report.stdoutSha256);assert.equal(sha(stderr),report.stderrSha256);observedFile(relative(helper.snapshotRoot,stdoutPath),stdout);observedFile(relative(helper.snapshotRoot,stderrPath),stderr);
let dependencyFileCount=0,dependencyByteCount=0,dependencySymlinkCount=0;
async function compare(a,b){const [x,y]=await Promise.all([lstat(a),lstat(b)]);assert.equal(x.isDirectory(),y.isDirectory(),b);assert.equal(x.isSymbolicLink(),y.isSymbolicLink(),b);
 if(x.isDirectory()){const [as,bs]=await Promise.all([readdir(a),readdir(b)]);assert.deepEqual(as.sort(),bs.sort(),b);for(const n of as)await compare(join(a,n),join(b,n))}
 else if(x.isSymbolicLink()){assert.equal(await readlink(a),await readlink(b),b);dependencySymlinkCount++}
 else {assert(x.isFile()&&y.isFile(),b);assert.equal(x.mode&0o777,y.mode&0o777,b);const [ab,bb]=await Promise.all([readFile(a),readFile(b)]);assert(ab.equals(bb),b);dependencyFileCount++;dependencyByteCount+=ab.length}}
for(const c of helper.commandResults.slice(0,3)){assert.deepEqual(c.args.slice(0,1),['-cR']);await compare(c.args[1],resolve(helper.snapshotRoot,c.relativeCwd,c.args[2]))}
const dest=join(A,'actual-c2-001');await mkdir(dest);
for(const [name,bytes] of [['HELPER_RESULT.json',helperBytes],['ADMITTED_C2_RESULT_PHYSICAL.json',rawLine],['component-result.json',reportBytes],['component.stdout.tap',stdout],['component.stderr.log',stderr]])await writeFile(join(dest,name),bytes,{flag:'wx'});
const record=async(name,v)=>writeFile(join(A,name),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
await record('SOURCE_CORRESPONDENCE.json',{kind:'actual_c2_source_and_dependency_correspondence',sourceSnapshot:await pin(join(A,'SOURCE_BEFORE.json')),sourceRows,dependencies:{fileCount:dependencyFileCount,byteCount:dependencyByteCount,symlinkCount:dependencySymlinkCount,allEqual:true,meaning:'Actual3cp destination trees equal their declared immutableRC6 source trees; source setup verification remains separately retained.'}});
const coordinates={kind:event.kind,admissionOrdinal:event.admissionOrdinal,eventId:event.eventId,eventTime:event.eventTime,graphFunctionRef:event.graphFunctionRef,runId:event.runId,...physical,resultRef:event.payload.resultRef,resultDigest:event.payload.resultDigest,valueKind:value.kind};
const summary={at:new Date().toISOString(),status:'ACTUAL_SELECTED_C2_PREDICATES_SATISFIED',coordinates,helper:{...await pin(helperPath),artifactRef:helper.artifactRef,artifactDigest:helper.artifactDigest},task:{taskRef:task.taskRef,taskDigest:task.taskDigest},commands:helper.commandResults.map(c=>({commandId:c.commandId,exitStatus:c.exitStatus,terminationConfirmed:c.terminationConfirmed,timedOut:c.timedOut})),tally:{tests:report.tests,pass:report.pass,fail:report.fail,skipped:report.skipped},report:await pin(join(dest,'component-result.json')),sourceCorrespondence:await pin(join(A,'SOURCE_CORRESPONDENCE.json')),protectedInputCount:helper.protectedBefore.length,protectedBeforeAfterEqual:true,productDeltaCount:0,unmatchedTerritoryCount:0,standing:'Actual admitted current Testing of frozen files; historical Construction/coding failures retain their provenance. UAT/fresh close/Root acceptance remain separate.'};
await record('ACTUAL_C2_SUMMARY.json',summary);console.log(JSON.stringify({status:summary.status,resultRef:coordinates.resultRef,tally:summary.tally,sourceMatches:sourceRows.length,dependencyFileCount}));
