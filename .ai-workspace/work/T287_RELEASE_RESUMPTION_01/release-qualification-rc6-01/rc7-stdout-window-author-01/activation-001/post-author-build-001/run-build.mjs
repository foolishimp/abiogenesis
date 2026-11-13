// Root-selected build observation of frozen, unaccepted source; existing owners perform the build.
import assert from 'node:assert/strict';
import {readFile,lstat,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const pin=async path=>{const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink(),path);const b=await readFile(path);return{path,bytes:b.length,sha256:sha(b)};};
const checked=async p=>{assert.deepEqual(await pin(p.path),p);return readFile(p.path);};
const input=join(root,'ROOT_BUILD_SELECTION.json'),raw=await readFile(input);assert.equal(sha(raw),process.argv[2]);
const b=JSON.parse(raw);assert.equal(b.status,'ROOT_SELECTED_S5_POST_AUTHOR_BUILD_ONLY');
for(const p of b.pins)await checked(p);
const source=JSON.parse(await checked(b.source));assert.equal(source.files.length,451);
const verifyLive=async()=>{for(const r of source.files)await checked({path:join(b.worksite,r.relativePath),bytes:r.bytes,sha256:r.sha256});};
await verifyLive();
assert.equal(b.label,'sw1-stage-02');assert.equal(b.mode,'after');assert.equal(b.timeoutMs,960000);
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(b.commandOwner.path));
const out=join(root,'build');await mkdir(out);
const save=(name,value)=>exclusiveRecord(out,name,value);
await save('EXECUTION_STARTED.json',{at:new Date().toISOString(),selection:await pin(input),source:b.source,subject:b.subject,originalClose:b.close,stageLabel:b.label,accepted:false,qualified:false});
const command=commandRecorder(out,{environment:b.environment,maxOutputBytes:67108864});
const r=await command('after-build-once',b.node.path,[b.stageOwner.path,b.label,b.mode],{cwd:b.worksite,timeoutMs:b.timeoutMs});
let stage=null,stagePin=null,sourceRowsEqual=false;
try{stagePin=await pin(b.stageReport);stage=JSON.parse(await readFile(b.stageReport,'utf8'));const expected=new Map(source.files.map(x=>[x.relativePath,x]));assert.equal(stage.sources.length,451);for(const x of stage.sources){const e=expected.get(x.path);assert(e&&e.bytes===x.bytes&&e.sha256===x.sha256,x.path);}assert.equal(stage.sourceDigest,sha(Buffer.from(JSON.stringify(stage.sources))));sourceRowsEqual=true;}catch(e){if(e.code!=='ENOENT')throw e;}
await verifyLive();
const complete=r.exitCode===0&&r.signal===null&&!r.timedOut&&!r.truncated&&r.failure===null&&sourceRowsEqual&&['compile','generate','lifecycle'].every(k=>stage[k]?.exitCode===0&&stage[k].signal===null&&stage[k].error===null);
const summary={status:complete?'BUILD_PASSED_SOURCE_REVIEW_AND_MANDATORY_TESTS_PENDING':'BUILD_NOT_PASSED',endedUtc:new Date().toISOString(),source:b.source,sourceRowsEqual,liveSourceUnchanged:true,stageReport:stagePin,commandReceipt:await pin(join(out,'commands/after-build-once.result.json')),command:{exitCode:r.exitCode,signal:r.signal,timedOut:r.timedOut,truncated:r.truncated,failure:r.failure,wallMs:r.wallMs},phases:stage?Object.fromEntries(['compile','generate','lifecycle'].map(k=>[k,stage[k]&&{exitCode:stage[k].exitCode,signal:stage[k].signal,error:stage[k].error,ms:stage[k].ms}])):null,nativeWorkerLaunched:false,baselineRepeated:false,proofLanesExecuted:0,ProductAccepted:false,qualified:false};
await save('SUMMARY.json',summary);console.log(JSON.stringify(summary));if(!complete)process.exitCode=1;
