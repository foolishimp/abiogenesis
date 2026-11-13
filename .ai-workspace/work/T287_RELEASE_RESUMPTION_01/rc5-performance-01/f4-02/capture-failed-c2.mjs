// Passive correspondence only. Root acceptance and canonical adoption are separate.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,lstat,readdir} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url)),c=dirname(dir),json=async p=>JSON.parse(await readFile(p,'utf8'));
const retained=await json(join(dir,'execution/resume.json')),pre=await json(join(dir,'execution/PREPARED_CALL.json'));
const {decodeEventBody,inlineEventBody}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/event_body_encoding.js')));
const {sha256Canonical}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/shared/digests.js')));
const hash=b=>createHash('sha256').update(b).digest('hex'),inline=new Map();let admitted=null,offset=0;
for await(const line of createInterface({input:createReadStream(join(c,'runtime-001/resources/events/runtime.events.jsonl')),crlfDelay:Infinity})){
 let physical;try{physical=JSON.parse(line);}catch{break;}
 const d=decodeEventBody(physical,inline),e=d.event;
 if(d.physicallyInline){const b=inlineEventBody(e);if(b)inline.set(b.eventRef,b);}
 if(offset>=pre.eventPrefix.prefixLength&&e.kind==='c_call_result_admitted'&&e.graphFunctionRef==='graph-function://abiogenesis/worksite/command-execution@5'){
  assert.equal(admitted,null,'More than one C2 result; exact Executive selection required');admitted=e;
 }
 offset+=Buffer.byteLength(line)+1;
}
assert(admitted,'No actual new C2 Result yet');assert.equal(sha256Canonical(admitted.payload),admitted.payloadDigest);
const value=admitted.payload.value,root=join(c,'runtime-001/resources/archives/worksite-command-execution');let helper=null,helperPath=null,raw=null;
for(const a of await readdir(root,{withFileTypes:true})){if(!a.isDirectory())continue;
 for(const b of await readdir(join(root,a.name),{withFileTypes:true})){if(!b.isDirectory())continue;
  const p=join(root,a.name,b.name,'result.json');let bytes;try{bytes=await readFile(p);}catch(e){if(e.code==='ENOENT')continue;throw e;}
  const h=JSON.parse(bytes);if(h.artifactRef!==value.helperArtifactRef||h.artifactDigest!==value.helperArtifactDigest)continue;
  assert.equal(helper,null,'Ambiguous helper custody');helper=h;helperPath=p;raw=bytes;
 }}
assert(helper,'Exact admitted helper not found');
for(const key of ['commandResults','predicateObservations','worksiteDelta','snapshotMembers','snapshotDigest','snapshotRef'])assert.deepEqual(value[key],helper[key]);
const subject=await json(join(dir,'review-subject-001/SUBJECT.json'));
const correspondence=Buffer.from(helper.commandResults[0].stdout.payload,'base64').toString().trim().split('\n').map(JSON.parse);
for(const f of subject.files){const row=correspondence.find(r=>r.path===f.path);assert(row);assert.equal(row.sha256,f.sha256);assert.equal(row.bytes,f.bytes);}
const last=helper.commandResults.at(-1),stdout=Buffer.from(last.stdout.payload,'base64'),stderr=Buffer.from(last.stderr.payload,'base64');
const tenant='build_tenants/abiogenesis/typescript',relativePath=tenant+'/artifacts/abiogenesis-typescript-tenant-5.0.0-rc.5.tgz';
const archivePath=join(helper.snapshotRoot,relativePath),archiveBytes=await readFile(archivePath),delta=helper.worksiteDelta.find(r=>r.relativePath===relativePath);
assert.equal('sha256:'+hash(archiveBytes),delta.after.digest);assert.equal(archiveBytes.length,delta.after.byteLength);
const report={kind:'failed_c2_exact_observation',status:'C2_RED_INSTALLED_FIXTURE_PRE_SCENARIO',recordedUtc:new Date().toISOString(),
 nativeResultRef:subject.nativeResultRef,frozenSubjectSha256:hash(await readFile(join(dir,'review-subject-001/SUBJECT.json'))),
 c2ResultRef:admitted.payload.resultRef,c2EventOrdinal:admitted.admissionOrdinal,helperPath,helperSha256:hash(raw),
 helperArtifactRef:helper.artifactRef,helperArtifactDigest:helper.artifactDigest,snapshotRoot:helper.snapshotRoot,
 snapshotRef:helper.snapshotRef,snapshotDigest:helper.snapshotDigest,sourceCorrespondence:correspondence,
 commands:helper.commandResults.map(r=>({exitStatus:r.exitStatus,timedOut:r.timedOut,processSignal:r.processSignal})),
 predicates:helper.predicateObservations.map(p=>({id:p.predicateId,observed:p.observedValue})),
 tapSummaries:stdout.toString().match(/^# (?:tests|pass|fail|skipped|cancelled|duration_ms) .+$/gm),
 archive:{path:archivePath,bytes:archiveBytes.length,sha256:hash(archiveBytes)},
 failure:'New installed RC5 case fails before scenario: undefined programValidation.kind at root-installed-environment.mjs509. Underlying validation return and owner relation require triage.',
 observedSelectedPasses:'planning1;codec24;route10 with3 declared skips;existing installed case1. New installed1fails. No final-proof.json, acceptance or generated adoption.',
 role:'Root passive exact producer/after/source correspondence only; failed proof preserved'};
for(const [name,value]of [['OBSERVED_C2_RESULT_EVENT.json',admitted],['FAILED_C2_OBSERVATION.json',report]])await writeFile(join(dir,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
await writeFile(join(dir,'failed-c2-final-proof.stdout.txt'),stdout,{flag:'wx'});await writeFile(join(dir,'failed-c2-final-proof.stderr.txt'),stderr,{flag:'wx'});
console.log(JSON.stringify({status:report.status,c2ResultRef:report.c2ResultRef,archive:report.archive,tapSummaries:report.tapSummaries}));
