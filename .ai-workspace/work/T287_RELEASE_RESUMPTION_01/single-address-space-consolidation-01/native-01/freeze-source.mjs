// Passive custody of a native return. Candidate bytes are never edited here.
import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,mkdir,lstat,readdir} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url)),campaign=dirname(dir),json=async p=>JSON.parse(await readFile(p,'utf8'));
const grant=await json(join(dir,'NATIVE_GRANT.json')),retained=await json(join(dir,'execution/resume.json'));
const {decodeEventBody,inlineEventBody}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/abg/event_body_encoding.js')));
const {sha256Canonical}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/shared/digests.js')));
const hash=b=>createHash('sha256').update(b).digest('hex'),log=join(campaign,'runtime-001/resources/events/runtime.events.jsonl');
const prepared=await json(join(dir,'execution/PREPARED_CALL.json'));
const minimumOffset=prepared.eventPrefix.prefixLength;assert(Number.isSafeInteger(minimumOffset));
const inline=new Map();let selected=null,offset=0,observedOrdinal=0;
for await(const line of createInterface({input:createReadStream(log),crlfDelay:Infinity})){
 let raw;try{raw=JSON.parse(line);}catch{break;}
 const rowBytes=Buffer.byteLength(line)+1,decoded=decodeEventBody(raw,inline),event=decoded.event;
 if(decoded.physicallyInline){const body=inlineEventBody(event);if(body!==null)inline.set(body.eventRef,body);}
 observedOrdinal=event.admissionOrdinal;
 if(offset>=minimumOffset&&event.kind==='c_call_result_admitted'&&event.graphFunctionRef==='graph-function://abiogenesis/worksite/native-work@5'&&event.payload.value?.kind==='native_workspace_work_observation')
   selected={event,rawLine:line+'\n',offset,rowBytes};
 offset+=rowBytes;
}
if(selected===null){console.log(JSON.stringify({status:'NO_NATIVE_SOURCE_RETURN_YET',observedOrdinal}));process.exit(0);}
const event=selected.event,value=event.payload.value;
assert.equal(sha256Canonical(event.payload),event.payloadDigest,'Observed native event payload differs from stamp');
assert.equal(execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),grant.sourceCommit);
const currentDiff=execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'diff','--name-only',grant.sourceCommit],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert(currentDiff.every(p=>grant.productWritePaths.includes(p)),'Unselected tracked modification');
const after=new Map(value.after.entries.map(e=>[e.relativePath,e]));
const name=process.argv[2]??'review-subject-001';assert(/^review-subject-\d{3}$/.test(name));const root=join(dir,name);
try{await lstat(root);throw Error('Frozen subject already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
const reviewBase=grant.sourceCommit;
const files=[];
for(const path of grant.productWritePaths){
 const b=await readFile(join(grant.worksiteRoot,path)),entry=after.get(path);
 assert.equal(entry?.state,'file',path);assert.equal(entry.digest,'sha256:'+hash(b),path);assert.equal(entry.byteLength,b.length,path);
 let pre=null;
 try{pre=execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'show',reviewBase+':'+path],{stdio:['ignore','pipe','pipe']});}
 catch(error){assert(grant.newFilesExpectedAfterConstruction.includes(path),'Unexpected absent baseline: '+path);}
 files.push({path,bytes:b.length,sha256:hash(b),preimageSha256:pre===null?null:hash(pre),changed:pre===null||hash(b)!==hash(pre),admittedAfterEntry:entry,
   snapshot:join(root,'files',path),preimage:pre===null?null:join(root,'preimages',path),bytesValue:b,preimageValue:pre});
}
await mkdir(root);
for(const f of files){for(const [p,b]of [[f.snapshot,f.bytesValue],[f.preimage,f.preimageValue]]){if(p===null)continue;await mkdir(dirname(p),{recursive:true});await writeFile(p,b,{flag:'wx'});}}
await writeFile(join(root,'NATIVE_RESULT_PHYSICAL.json'),selected.rawLine,{flag:'wx'});
await writeFile(join(root,'NATIVE_RESULT_EVENT.json'),JSON.stringify(event,null,2)+'\n',{flag:'wx'});
const diffParts=[execFileSync('/usr/bin/git',['-C',grant.worksiteRoot,'diff','--binary',reviewBase,'--',...grant.productWritePaths])];
for(const f of files.filter(f=>f.preimage===null)){
 try{diffParts.push(execFileSync('/usr/bin/git',['diff','--no-index','--binary','--','/dev/null',f.snapshot],{stdio:['ignore','pipe','pipe']}));}
 catch(error){assert.equal(error.status,1);diffParts.push(error.stdout);}
}
const diff=Buffer.concat(diffParts);
await writeFile(join(root,'source.diff'),diff,{flag:'wx'});
for(const name of ['return.json','readiness.json']){
 const path=join('consolidation-scratch/native-01',name),bytes=await readFile(join(grant.worksiteRoot,path)),entry=after.get(path);
 assert.equal(entry?.state,'file',path);assert.equal(entry.digest,'sha256:'+hash(bytes),path);assert.equal(entry.byteLength,bytes.length,path);
 await writeFile(join(root,name),bytes,{flag:'wx'});
}
const authorFeedback=[];
const feedbackRoot=join(grant.worksiteRoot,'consolidation-scratch/native-01/tmp');
for(const name of (await readdir(feedbackRoot)).filter(name=>/^fb-.*\.tap$/.test(name)).sort()){
 const bytes=await readFile(join(feedbackRoot,name)),snapshot=join(root,'author-feedback',name);
 await mkdir(dirname(snapshot),{recursive:true});await writeFile(snapshot,bytes,{flag:'wx'});
 authorFeedback.push({source:join(feedbackRoot,name),snapshot,bytes:bytes.length,sha256:hash(bytes),standing:'Author feedback, not actual C2 or acceptance'});
}
const subject={status:'OBSERVED_NATIVE_SOURCE_FROZEN_C2_PENDING',authorFeedback,capturedUtc:new Date().toISOString(),sourceRoot:grant.worksiteRoot,sourceCommit:grant.sourceCommit,reviewBaseCommit:reviewBase,
 nativeResultRef:event.payload.resultRef,nativeResultDigest:event.payload.resultDigest,eventOrdinal:event.admissionOrdinal,eventTime:event.eventTime,
 eventPath:log,eventOffset:selected.offset,eventRowBytes:selected.rowBytes,eventRowSha256:hash(selected.rawLine),observedThroughOrdinal:observedOrdinal,
 afterObservationRef:value.after.observationRef,afterObservationDigest:value.after.observationDigest,trackedChangedPaths:currentDiff,changedPaths:files.filter(f=>f.changed).map(f=>f.path),
 incrementChangedPaths:files.filter(f=>f.changed).map(f=>f.path),
 files:files.map(({bytesValue,preimageValue,...f})=>f),diff:{path:join(root,'source.diff'),bytes:diff.length,sha256:hash(diff)},
 limits:['Passive observation and file custody; final owner close/fresh projections will conjoin runtime standing.','No source acceptance, C2 pass, UAT or qualification inferred.']};
await writeFile(join(root,'SUBJECT.json'),JSON.stringify(subject,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:subject.status,subject:join(root,'SUBJECT.json'),nativeResultRef:subject.nativeResultRef,eventOrdinal:subject.eventOrdinal,changedPaths:subject.changedPaths}));
