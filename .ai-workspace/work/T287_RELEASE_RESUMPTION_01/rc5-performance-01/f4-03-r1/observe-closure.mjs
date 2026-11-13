// Passive exact-record conjunction. No runtime call, source adoption or acceptance.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url));
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const hex=b=>createHash('sha256').update(b).digest('hex');
const outcome=await json(join(dir,'execution/outcome-summary.json'));
const execution=await json(join(dir,'execution/execution.json'));
const reads=await json(join(dir,'execution/fresh-reads.json'));
const resume=await json(join(dir,'execution/after-run-resume.json'));
const proof=await json(join(dir,'GENERATED_ADOPTION.PREPARED.json'));
const source=await json(join(dir,'review-subject-001/SUBJECT.json'));
const review=await json(join(dir,'INDEPENDENT_SOURCE_REVIEW.json'));
const product=await import(pathToFileURL(join(resume.installedRoot,'build/code/src/product/index.js')));
const abg=await import(pathToFileURL(join(resume.installedRoot,'build/code/src/abg/index.js')));
const hash=product.sha256Canonical;
assert.equal(outcome.exitCode,0);assert.equal(outcome.outcomeKind,'result');assert.equal(outcome.disposition,'completed');
assert.equal(execution.receipt.ownerOutput.outcomeKind,'result');
assert.equal(execution.receipt.ownerOutput.value.disposition,'completed');
assert.deepEqual(execution.receipt.resources.run,outcome.run);
const terminal=execution.receipt.ownerOutput.value.terminalResult;
assert(abg.isAbgTypedTerminalResult(terminal));assert.deepEqual(outcome.terminal,terminal);
assert.equal(terminal.producer.runRef,outcome.run.ref);
assert.equal(terminal.value.kind,'governance_work_state');assert.equal(terminal.value.terminal,true);
assert.deepEqual(terminal.value.unresolvedSupportRefs,[]);
assert.equal(review.disposition,'satisfied');assert.deepEqual(review.findings,[]);
assert.equal(review.subjectSha256,hex(await readFile(join(dir,'review-subject-001/SUBJECT.json'))));
assert.equal(proof.frozenSubjectSha256,review.subjectSha256);
assert.equal(proof.nativeSourceResultRef,source.nativeResultRef);
const observations=terminal.value.observations;
assert(observations.some(o=>o.purpose==='construction'&&o.resultRef===source.nativeResultRef));
assert(observations.some(o=>o.purpose==='testing'&&o.resultRef===proof.c2ResultRef));
const uats=observations.filter(o=>o.purpose==='uat');assert.equal(uats.length,1);
const uat=uats[0];assert.equal(uat.value.kind,'sandbox_uat_assessment');assert.equal(uat.value.disposition,'satisfied');
assert.deepEqual(uat.value.unresolvedCriteria,[]);
assert.equal(reads.length,2);
for(const name of ['run_result','run_replay']){
 const r=reads.find(r=>r.memberKey===name);assert(r);assert.equal(r.ownerOutput.outcomeKind,'result');
 assert.deepEqual(r.source,outcome.run);assert.deepEqual(r.projection.subject,outcome.run);
 if(name==='run_replay')assert.equal(r.projection.status,'closed');
 const t=r.projection.terminalResult;assert(abg.isAbgTypedTerminalResult(t));
 for(const key of ['result','producer','value'])assert.equal(hash(t[key]),hash(terminal[key]),name+':'+key);
 assert.equal(t.valueDigest,terminal.valueDigest);
}
const prefix=resume.state.closeHandoff.prefix,log=fileURLToPath(prefix.eventLogRef),before=await stat(log);
assert.equal(before.size,prefix.prefixLength);assert.equal(before.dev,prefix.storeIdentity.device);assert.equal(before.ino,prefix.storeIdentity.inode);
const physical=createHash('sha256');for await(const b of createReadStream(log))physical.update(b);
const digest='sha256:'+physical.digest('hex'),after=await stat(log);
assert.equal(digest,prefix.prefixDigest);assert.equal(after.size,before.size);assert.equal(after.mtimeMs,before.mtimeMs);
const refs=[];
for(const name of ['execution/outcome-summary.json','execution/execution.json','execution/fresh-reads.json','GENERATED_ADOPTION.PREPARED.json','INDEPENDENT_SOURCE_REVIEW.json','review-subject-001/SUBJECT.json']){
 const p=join(dir,name),b=await readFile(p);refs.push({path:p,bytes:b.length,sha256:hex(b)});
}
const report={status:'EXACT_CLOSED_CONJUNCTION_OBSERVED_ROOT_ACCEPTANCE_PENDING',recordedUtc:new Date().toISOString(),
 role:'Root operator Writer passive exact-record conjunction; no new runtime/provider operation or Product mutation',
 run:outcome.run,terminalResult:terminal.result,terminalValueDigest:terminal.valueDigest,producer:terminal.producer,
 nativeSourceResultRef:source.nativeResultRef,c2ResultRef:proof.c2ResultRef,artifactDigest:'sha256:'+proof.archive.sha256,
 independentSourceReview:'satisfied/no findings',uatObservation:uat,resultReplayOutcomeTerminalEqual:true,replayStatus:'closed',
 sourceSubjectSha256:review.subjectSha256,eventLog:{path:log,bytes:before.size,sha256:digest.slice(7),device:before.dev,inode:before.ino},references:refs,
 limits:['Bounded selected proof only; Root owns acceptance.','Historical failed and indeterminate Runs remain unchanged.','No source adoption, clean reproduction, local cut/install, whole qualification or performance speedup inferred.']};
await writeFile(join(dir,'CLOSED_CONJUNCTION_OBSERVATION.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:report.status,run:report.run,terminalResult:report.terminalResult,uat:uat.value.disposition,unresolvedCriteria:uat.value.unresolvedCriteria,eventLogBytes:before.size}));
