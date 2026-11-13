// Read-only custody of the existing scripted fixture log across its normal unlink.
import assert from 'node:assert/strict';
import {readFile,mkdir,readdir,open,writeFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {commandRecorder,exclusiveRecord} from '../../rc7-fixed-proof-author-01/operator-client/runner.mjs';
const root=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const [admissionDigest]=process.argv.slice(2);assert(/^[a-f0-9]{64}$/.test(admissionDigest??''));
const bytes=await readFile(join(root,'ROOT_ADMISSION.json'));assert.equal(sha(bytes),admissionDigest);
const selection=JSON.parse(bytes);assert.equal(selection.status,'ROOT_ADMITTED_ONCE_ONLY_BLOCKED_TESTING_DIAGNOSIS');
const checked=async p=>{const b=await readFile(p.path);assert.equal(b.length,p.bytes,p.path);assert.equal(sha(b),p.sha256,p.path);return b;};
for(const p of selection.pins)await checked(p);
const subject=JSON.parse(await checked(selection.subject));assert.equal(subject.files.length,451);
const verify=async()=>{for(const f of subject.files)for(const base of [selection.stage,selection.worksite])await checked({path:join(base,f.relativePath),bytes:f.bytes,sha256:f.sha256});};
await verify();await mkdir(selection.tempRoot);
await exclusiveRecord(root,'EXECUTION_STARTED.json',{at:new Date().toISOString(),pid:process.pid,admissionDigest,sourceRowsVerified:451});
const handles=new Map(),watchErrors=[];let sampling=false;
const sample=async()=>{
 if(sampling)return;sampling=true;
 try{
  for(const name of await readdir(selection.tempRoot)){
   if(!name.startsWith('abi5-rc7-fixed-'))continue;
   for(const relative of ['caller/resources/events/runtime.events.jsonl','caller/calls/fixed-testing.outcome.json']){
    const path=join(selection.tempRoot,name,relative);if(handles.has(path))continue;
    try{const f=await open(path,'r'),s=await f.stat();if(!s.isFile()){await f.close();continue;}handles.set(path,{file:f,openedUtc:new Date().toISOString(),inode:s.ino,device:s.dev});}
    catch(error){if(error.code!=='ENOENT')watchErrors.push({path,code:error.code});}
   }
  }
 }finally{sampling=false;}
};
const timer=setInterval(()=>sample().catch(error=>watchErrors.push({code:error.code,message:error.message})),20);
const environment=Object.fromEntries(['HOME','PATH','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
Object.assign(environment,{TMPDIR:selection.tempRoot,NODE_OPTIONS:'--max-old-space-size=8192',NPM_CONFIG_CACHE:join(selection.tempRoot,'npm-cache'),NPM_CONFIG_UPDATE_NOTIFIER:'false',NPM_CONFIG_OFFLINE:'true',NPM_CONFIG_USERCONFIG:selection.npmUser,NPM_CONFIG_GLOBALCONFIG:selection.npmGlobal});
const command=commandRecorder(root,{environment,maxOutputBytes:67108864});
let result;
try{result=await command('blocked-testing-once',selection.node,['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap','--test-name-pattern','^RC7 fixed admission: a Public direct Testing state Result admits direct UAT through actual invocation admission$', 'test_env/tests/t287-default-library.test.mjs'],{cwd:selection.tenant,timeoutMs:600000});}
finally{clearInterval(timer);while(sampling)await new Promise(r=>setTimeout(r,10));}
const captures=[];
for(const [source,held]of handles){
 try{
  const stat=await held.file.stat();assert(stat.size<=134217728,'Diagnostic capture exceeds its128MiB bound');
  const data=await held.file.readFile(),name=source.endsWith('runtime.events.jsonl')?'runtime.events.jsonl':'fixed-testing.outcome.json';
  await writeFile(join(root,name),data,{flag:'wx'});
  captures.push({source,path:join(root,name),bytes:data.length,sha256:sha(data),openedUtc:held.openedUtc,device:stat.dev,inode:stat.ino,unlinked:stat.nlink===0});
 }finally{await held.file.close();}
}
await verify();
await exclusiveRecord(root,'SUMMARY.json',{status:'DIAGNOSTIC_RUN_COMPLETE_NOT_QUALIFICATION',sourceDigest:selection.sourceDigest,exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure,wallMs:result.wallMs,captures,watchErrors,sourceRowsUnchanged:451,sourceEdits:false,qualificationClaim:false});
console.log(JSON.stringify({status:'DIAGNOSTIC_RUN_COMPLETE',exitCode:result.exitCode,wallMs:result.wallMs,captures:captures.map(({path,bytes,sha256})=>({path,bytes,sha256})),watchErrors}));
if(result.exitCode!==0)process.exitCode=1;
