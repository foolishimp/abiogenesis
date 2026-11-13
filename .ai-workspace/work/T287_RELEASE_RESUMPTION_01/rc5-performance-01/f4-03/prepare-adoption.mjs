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
assert.equal(helper.commandResults.length,7);assert(helper.commandResults.every(r=>r.exitStatus===0&&r.processSignal===null&&!r.timedOut));
assert(helper.predicateObservations.every(p=>p.observedValue===0));
const subject=await json(join(dir,'review-subject-001/SUBJECT.json'));
const correspondence=Buffer.from(helper.commandResults[0].stdout.payload,'base64').toString().trim().split('\n').map(JSON.parse);
for(const f of subject.files){const row=correspondence.find(r=>r.path===f.path);assert(row);assert.equal(row.sha256,f.sha256);assert.equal(row.bytes,f.bytes);}
const tenant='build_tenants/abiogenesis/typescript',canonical=retained.workspaceAuthority.canonicalRoot;
const held=await json(join(canonical,'rc5-operator-inputs/f4-03/HELD_SOURCE_INVARIANTS.json'));
for(const f of held.files){const row=correspondence.find(r=>r.path===f.path);assert(row);assert.equal(row.sha256,f.sha256);assert.equal(row.bytes,f.bytes);}

const candidates=helper.worksiteDelta.filter(r=>r.after?.nodeKind==='file'&&
 (r.relativePath.startsWith(tenant+'/contracts/')||r.relativePath===tenant+'/product-toolchain-manifest.json'));
const changes=[];let checked=0;
for(const row of candidates){
 const source=join(helper.snapshotRoot,row.relativePath),b=await readFile(source);assert.equal('sha256:'+hash(b),row.after.digest);assert.equal(b.length,row.after.byteLength);checked++;
 const target=join(canonical,row.relativePath);let before=null;try{assert((await lstat(target)).isFile());before=await readFile(target);}catch(e){if(e.code!=='ENOENT')throw e;}
 if(before!==null&&before.equals(b))continue;
 changes.push({path:row.relativePath,source,target,bytes:b.length,sha256:hash(b),before:before===null?null:{bytes:before.length,sha256:hash(before)},
  ownerAfter:row.after,matchedTerritoryRef:row.matchedTerritoryRef});
}
async function artifact(name){
 const relativePath=tenant+'/artifacts/'+name,row=helper.worksiteDelta.find(r=>r.relativePath===relativePath);assert(row?.after?.digest,relativePath);
 const path=join(helper.snapshotRoot,relativePath),bytes=await readFile(path);assert.equal('sha256:'+hash(bytes),row.after.digest);assert.equal(bytes.length,row.after.byteLength);
 return {path,bytes:bytes.length,sha256:hash(bytes)};
}
const archive=await artifact('abiogenesis-typescript-tenant-5.0.0-rc.5.tgz'),proofArtifact=await artifact('rc5-final-proof.json'),proof=await json(proofArtifact.path);
assert.equal(proof.artifactDigest,'sha256:'+archive.sha256);assert.equal(proof.packageVersion,'5.0.0-rc.5');assert.equal(proof.runs.length,4);
assert(proof.runs.every(r=>r.pass>0&&r.fail===0));
const report={status:'PREPARED_GENERATED_ADOPTION_PENDING_UAT_AND_ROOT_CONJUNCTION',sourceBaseCommit:subject.sourceCommit,
 frozenSubjectSha256:hash(await readFile(join(dir,'review-subject-001/SUBJECT.json'))),
 sourceMeaning:'Base commit is the native preimage; exact successor bytes are the admitted and independently frozen native return. A later adoption checkpoint names the complete committed candidate.',
 nativeSourceResultRef:subject.nativeResultRef,priorNativeSourceResultRef:held.nativeResultRef,heldPriorSubjectSha256:held.heldPriorSubjectSha256,c2ResultRef:admitted.payload.resultRef,c2EventOrdinal:admitted.admissionOrdinal,
 helperPath,helperSha256:hash(raw),helperArtifactRef:helper.artifactRef,helperArtifactDigest:helper.artifactDigest,
 snapshotRoot:helper.snapshotRoot,snapshotRef:helper.snapshotRef,snapshotDigest:helper.snapshotDigest,
 commands:7,exitPredicatesAllZero:true,proofArtifact,proof,sourceCorrespondence:correspondence,
 generatedFilesChecked:checked,changes,archive,
 role:'Root operator Writer passive correspondence; no canonical mutation, qualification or acceptance'};
await writeFile(join(dir,'OBSERVED_C2_RESULT_EVENT.json'),JSON.stringify(admitted)+'\n',{flag:'wx'});
await writeFile(join(dir,'GENERATED_ADOPTION.PREPARED.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
await writeFile(join(dir,'final-proof.stdout.txt'),Buffer.from(helper.commandResults[6].stdout.payload,'base64'),{flag:'wx'});
console.log(JSON.stringify({status:report.status,generatedFilesChecked:checked,changedGeneratedFiles:changes.length,
 c2ResultRef:report.c2ResultRef,archiveSha256:archive.sha256,tests:proof.runs.map(r=>({label:r.label,pass:r.pass,fail:r.fail,skipped:r.skipped})),
 capturedRouteMeasurement:proof.capturedRouteMeasurement}));
