// Root passive correspondence preparation. Canonical source is not changed.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,lstat} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url)),c=dirname(dir),json=async p=>JSON.parse(await readFile(p,'utf8'));
const retained=await json(join(dir,'execution/resume.json'));
const {decodeEventBody,inlineEventBody}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/event_body_encoding.js')));
const {sha256Canonical}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/shared/digests.js')));
const hash=b=>createHash('sha256').update(b).digest('hex');
const helperPath=join(c,'runtime-001/resources/archives/worksite-command-execution/e0439b858b85635651a2d1334fcbb6a4fe353616ed316097974ee5a762344bcc/6b576f20cf831449c217b9bd15ad94c77d395e5572c73735786c76943317d0c6/result.json');
const raw=await readFile(helperPath),helper=JSON.parse(raw),inline=new Map();let admitted;
for await(const line of createInterface({input:createReadStream(join(c,'runtime-001/resources/events/runtime.events.jsonl')),crlfDelay:Infinity})){
 let physical;try{physical=JSON.parse(line);}catch{break;}
 const d=decodeEventBody(physical,inline),e=d.event;
 if(d.physicallyInline){const b=inlineEventBody(e);if(b)inline.set(b.eventRef,b);}
 if(e.kind==='c_call_result_admitted'&&e.payload.resultRef==='result://abiogenesis/177a06b017ffd095b0bf01c9b5746ec9d898b9a8b3a2011d15906f3ddef41137')admitted=e;
}
assert(admitted);assert.equal(sha256Canonical(admitted.payload),admitted.payloadDigest);
const value=admitted.payload.value;
assert.equal(value.helperArtifactRef,helper.artifactRef);assert.equal(value.helperArtifactDigest,helper.artifactDigest);
for(const key of ['commandResults','predicateObservations','worksiteDelta','snapshotMembers','snapshotDigest','snapshotRef'])assert.deepEqual(value[key],helper[key]);
assert.equal(helper.commandResults.length,6);assert(helper.commandResults.every(r=>r.exitStatus===0&&r.processSignal===null&&!r.timedOut));
assert(helper.predicateObservations.every(p=>p.observedValue===0));
const subject=await json(join(c,'method-01/review-subject-001/SUBJECT.json'));
const correspondence=Buffer.from(helper.commandResults[0].stdout.payload,'base64').toString().trim().split('\n').map(JSON.parse);
for(const f of subject.files){const row=correspondence.find(r=>r.path===f.path);assert(row);assert.equal(row.sha256,f.sha256);assert.equal(row.bytes,f.bytes);}
const tenant='build_tenants/abiogenesis/typescript',canonical=retained.workspaceAuthority.canonicalRoot;
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
const archiveRow=helper.worksiteDelta.find(r=>r.relativePath===tenant+'/artifacts/abiogenesis-typescript-tenant-5.0.0-rc.4.tgz');
const archivePath=join(helper.snapshotRoot,archiveRow.relativePath),archive=await readFile(archivePath);
assert.equal('sha256:'+hash(archive),archiveRow.after.digest);
const report={status:'PREPARED_GENERATED_ADOPTION_PENDING_UAT_AND_ROOT_CONJUNCTION',sourceCommit:'90721c86680f17c1877dc26c9eb93b4243188785',
 nativeSourceResultRef:subject.nativeResultRef,c2ResultRef:admitted.payload.resultRef,c2EventOrdinal:admitted.admissionOrdinal,
 helperPath,helperSha256:hash(raw),helperArtifactRef:helper.artifactRef,helperArtifactDigest:helper.artifactDigest,
 snapshotRoot:helper.snapshotRoot,snapshotRef:helper.snapshotRef,snapshotDigest:helper.snapshotDigest,
 commands:6,exitPredicatesAllZero:true,selectedTests:{pass:18,fail:0,skipped:0},sourceCorrespondence:correspondence,
 generatedFilesChecked:checked,changes,archive:{path:archivePath,bytes:archive.length,sha256:hash(archive),
  meaning:'Provisional method candidate retains rc.4 package metadata; never installed over immutableRC4. FinalRC5 identity is subsequent work.'},
 role:'Root operator Writer, passive evidence preparation only; no canonical mutation or acceptance'};
await writeFile(join(dir,'OBSERVED_C2_RESULT_EVENT.json'),JSON.stringify(admitted)+'\n',{flag:'wx'});
await writeFile(join(dir,'GENERATED_ADOPTION.PREPARED.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
await writeFile(join(dir,'stage-and-proof.stdout.txt'),Buffer.from(helper.commandResults[4].stdout.payload,'base64'),{flag:'wx'});
console.log(JSON.stringify({status:report.status,generatedFilesChecked:checked,changedGeneratedFiles:changes.length,
 c2ResultRef:report.c2ResultRef,archiveSha256:report.archive.sha256,selectedTests:report.selectedTests}));
