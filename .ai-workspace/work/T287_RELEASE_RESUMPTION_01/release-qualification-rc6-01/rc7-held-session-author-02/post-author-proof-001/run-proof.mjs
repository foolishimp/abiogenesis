// Separately admitted operator proof over the unchanged native frozen stage.
import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {commandRecorder,exclusiveRecord} from '../../rc7-fixed-proof-author-01/operator-client/runner.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const [manifestDigest,admissionDigest]=process.argv.slice(2);
assert(/^[a-f0-9]{64}$/.test(manifestDigest??'')&&/^[a-f0-9]{64}$/.test(admissionDigest??''));
const sha=b=>createHash('sha256').update(b).digest('hex');
const checked=async p=>{const b=await readFile(p.path);assert.equal(b.length,p.bytes,p.path);assert.equal(sha(b),p.sha256,p.path);return b;};
const pinned=async path=>{const b=await readFile(path);return{path,bytes:b.length,sha256:sha(b)};};
const readDigest=async(path,digest)=>{const b=await readFile(path);assert.equal(sha(b),digest,path);return JSON.parse(b);};
const manifest=await readDigest(join(root,'MANIFEST.json'),manifestDigest);
for(const pin of manifest.pins)await checked(pin);
const admission=await readDigest(join(root,'ROOT_ADMISSION.json'),admissionDigest);
assert.equal(admission.status,'ROOT_ADMITTED_CORRECTED_POST_AUTHOR_PROOF');
assert.equal(admission.manifestSha256,manifestDigest);
const selection=manifest.selection;
assert.deepEqual(selection.lanes.map(x=>x.id),['fixed-route','assessment-guards','caller']);
assert.deepEqual(selection.lanes.map(x=>x.timeoutMs),[600000,300000,300000]);
const subject=JSON.parse(await checked(selection.subject));
const stage=JSON.parse(await checked(selection.stageReport));
assert.equal(subject.files.length,451);
assert.equal(stage.sourceDigest,selection.sourceDigest);
assert.equal(sha(Buffer.from(JSON.stringify(stage.sources))),selection.sourceDigest);
const verifySource=async()=>{
 for(const row of subject.files)for(const base of [selection.stage,selection.worksite]){
  const path=join(base,row.relativePath),s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink(),path);
  await checked({path,bytes:row.bytes,sha256:row.sha256});
 }
 await checked(selection.generatedManifest);
 for(const p of selection.originalControls)await checked(p);
 return{sourceRows:451,sourceDigest:selection.sourceDigest,stagedAndLiveMatch:true,originalControlsUnchanged:true};
};
const record=(name,value)=>exclusiveRecord(root,name,value);
await record('EXECUTION_STARTED.json',{at:new Date().toISOString(),pid:process.pid,manifestSha256:manifestDigest,admissionSha256:admissionDigest,automaticRetries:0});
await record('SOURCE_BEFORE_EXECUTION.json',await verifySource());
const environment=Object.fromEntries(['HOME','PATH','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
environment.NODE_OPTIONS='--max-old-space-size=8192';
const command=commandRecorder(root,{environment,maxOutputBytes:67108864});
const results=[];
for(const lane of selection.lanes){
 await verifySource();
 const result=await command(lane.id,'/usr/bin/time',['-l',selection.node,selection.helper.path,selection.stageLabel,lane.id],{cwd:selection.worksite,timeoutMs:lane.timeoutMs+20000});
 const summaryPath=join(selection.stageParent,selection.stageLabel+'-lanes-'+lane.id,'summary-'+lane.id+'.json');
 let laneSummary=null,summaryPin=null;
 try{summaryPin=await pinned(summaryPath);laneSummary=JSON.parse(await readFile(summaryPath,'utf8'))[0];}catch(error){if(error.code!=='ENOENT')throw error;}
 const pass=result.exitCode===0&&!result.timedOut&&!result.truncated&&result.signal===null&&result.failure===null&&laneSummary?.exitCode===0&&laneSummary.fail===0&&laneSummary.cancelled===0&&laneSummary.todo===0&&laneSummary.requiredActivePass&&laneSummary.historicalSkipsDeclared&&laneSummary.tests>=laneSummary.minimumTests;
 const rss=/^\s*(\d+)\s+maximum resident set size\s*$/m.exec(result.stderr);
 const entry={id:lane.id,pass,summary:summaryPin,laneSummary,commandReceipt:await pinned(join(root,'commands',lane.id+'.result.json')),wallMs:result.wallMs,maximumResidentSetSizeBytes:rss?Number(rss[1]):null,exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure,sourceAfter:await verifySource()};
 await record(lane.id+'.summary.json',entry);results.push(entry);
 console.log(JSON.stringify({id:lane.id,pass,wallMs:result.wallMs,counts:laneSummary&&{tests:laneSummary.tests,pass:laneSummary.pass,fail:laneSummary.fail,skipped:laneSummary.skipped},failing:laneSummary?.failing??null}));
 if(!pass)break;
}
await record('SUMMARY.json',{status:results.length===3&&results.every(r=>r.pass)?'THREE_SELECTED_LANES_PASSED':'STOPPED_SELECTED_PROOF_FAILURE',subject:selection.subject,sourceDigest:selection.sourceDigest,manifestSha256:manifestDigest,admissionSha256:admissionDigest,results,sourceAfter:await verifySource(),originalNativeReturnUnchanged:true,ProductAccepted:false,qualified:false});
if(results.length!==3||results.some(r=>!r.pass))process.exitCode=1;
