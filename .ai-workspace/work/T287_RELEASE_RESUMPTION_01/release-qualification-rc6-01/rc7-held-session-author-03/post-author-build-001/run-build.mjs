// Separately admitted operator generation continuation; no compile or native Worker.
import assert from 'node:assert/strict';
import {readFile,lstat,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {commandRecorder,exclusiveRecord} from '../../rc7-fixed-proof-author-01/operator-client/runner.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const [manifestDigest,admissionDigest]=process.argv.slice(2);
assert(/^[a-f0-9]{64}$/.test(manifestDigest??'')&&/^[a-f0-9]{64}$/.test(admissionDigest??''));
const sha=b=>createHash('sha256').update(b).digest('hex');
const checked=async p=>{assert(p&&typeof p.path==='string'&&Number.isSafeInteger(p.bytes)&&/^[a-f0-9]{64}$/.test(p.sha256));const s=await lstat(p.path);assert(s.isFile()&&!s.isSymbolicLink(),p.path);const b=await readFile(p.path);assert.equal(b.length,p.bytes,p.path);assert.equal(sha(b),p.sha256,p.path);return b;};
const pinned=async path=>{const b=await readFile(path);return{path,bytes:b.length,sha256:sha(b)};};
const readDigest=async(path,digest)=>{const b=await readFile(path);assert.equal(sha(b),digest,path);return JSON.parse(b);};
const absent=async path=>{try{await lstat(path);throw Error('Preserve existing allocation: '+path);}catch(e){if(e.code!=='ENOENT')throw e;}};
const manifest=await readDigest(join(root,'MANIFEST.json'),manifestDigest);
for(const pin of manifest.pins)await checked(pin);
const admission=await readDigest(join(root,'ROOT_ADMISSION.json'),admissionDigest);
assert.equal(admission.status,'ROOT_ADMITTED_H03_POST_AUTHOR_BUILD_CONTINUATION');assert.equal(admission.manifestSha256,manifestDigest);
const selection=manifest.selection;assert.equal(admission.sourceDigest,selection.sourceDigest);assert.deepEqual(admission.rootDisposition,selection.rootDisposition);
assert.deepEqual(selection.buildCommands.map(x=>[x.id,x.timeoutMs]),[['generate',600000],['lifecycle',60000]]);
const subject=JSON.parse(await checked(selection.subject));assert.equal(subject.files.length,451);
const finalSubject=JSON.parse(await checked(selection.finalSubject));assert.equal(finalSubject.sourceDigest,selection.sourceDigest);assert.equal(finalSubject.sourceCount,451);
const close=JSON.parse(await checked(selection.finalRuntimeClose));assert.equal(close.host.exitCode,0);assert(close.closeHandoff);assert.equal(close.host.failure,null);
const original=JSON.parse(await checked(selection.originalFailedReport));assert.equal(original.sourceDigest,selection.sourceDigest);assert.equal(original.compile.exitCode,0);assert.equal(original.compile.signal,null);assert.equal(original.compile.error,null);assert.equal(original.generate.error,'spawnSync /opt/homebrew/Cellar/node/24.7.0/bin/node ETIMEDOUT');
const inventory=JSON.parse(await checked(selection.identityInventory));assert.equal(inventory.files.length,1031);assert.equal(inventory.sourceDigest,selection.sourceDigest);
const verifySource=async()=>{for(const row of inventory.files){await checked({path:row.path,bytes:row.bytes,sha256:row.sha256});if(row.kind==='source')await checked({path:join(selection.worksite,row.relativePath),bytes:row.bytes,sha256:row.sha256});}for(const p of selection.originalControls)await checked(p);await checked(selection.originalFailedReport);return{sourceRows:451,compiledJsRows:290,compiledDeclarationRows:290,sourceDigest:selection.sourceDigest,stagedAndLiveMatch:true,compiledUnchanged:true,originalFailedReportUnchanged:true};};
const preimages=JSON.parse(await checked(selection.partialPreimages));for(const r of preimages.files){await checked(r.original);await checked(r.retained);}
const out=join(root,'build');await absent(out);const setupStarted=performance.now();const before=await verifySource();await mkdir(out);
const record=(name,value)=>exclusiveRecord(out,name,value);
await record('EXECUTION_STARTED.json',{at:new Date().toISOString(),pid:process.pid,manifestSha256:manifestDigest,admissionSha256:admissionDigest,sourceBefore:before,setupVerificationMs:performance.now()-setupStarted,automaticRetries:0,originalCompileReused:true,qualified:false});
const command=commandRecorder(out,{environment:selection.environment,maxOutputBytes:67108864});
const results=[];
for(const selected of selection.buildCommands){
 await verifySource();
 const r=await command(selected.id,'/usr/bin/time',['-l',selection.node,selected.script],{cwd:selection.tenant,timeoutMs:selected.timeoutMs});
 const pass=r.exitCode===0&&r.signal===null&&!r.timedOut&&!r.truncated&&r.failure===null;
 const rss=/^\s*(\d+)\s+maximum resident set size\s*$/m.exec(r.stderr),cpu=/([\d.]+)\s+real\s+([\d.]+)\s+user\s+([\d.]+)\s+sys/.exec(r.stderr);
 const entry={id:selected.id,pass,command:[selection.node,selected.script].join(' '),exitCode:r.exitCode,signal:r.signal,error:r.failure??(r.timedOut?'TIMED_OUT':r.truncated?'OUTPUT_TRUNCATED':null),ms:r.wallMs,timeoutMs:selected.timeoutMs,timeSeconds:cpu?{real:Number(cpu[1]),user:Number(cpu[2]),sys:Number(cpu[3])}:null,maximumResidentSetSizeBytes:rss?Number(rss[1]):null,commandReceipt:await pinned(join(out,'commands',selected.id+'.result.json')),sourceAfter:await verifySource()};
 await record(selected.id+'.summary.json',entry);results.push(entry);console.log(JSON.stringify(entry));if(!pass)break;
}
let completedReport=null;
if(results.length===2&&results.every(r=>r.pass)){
 const generatedManifest=await pinned(join(selection.tenant,'product-toolchain-manifest.json')),generatedGraph=await pinned(join(selection.tenant,'contracts/capabilities/capability-definition-graph.json'));
 assert(generatedManifest.bytes>3&&generatedGraph.bytes>3);const productManifest=JSON.parse(await readFile(generatedManifest.path,'utf8'));assert.equal(productManifest.kind,'abg_product_toolchain_manifest');
 const completed={...original,kind:'operator_completed_build_reusing_native_compile',status:'COMPLETED_WITH_SEPARATE_ROOT_GENERATION_CONTINUATION',compile:original.compile,generate:results[0],lifecycle:results[1],originalFailedReport:selection.originalFailedReport,reusedCompileEvidence:{report:selection.originalFailedReport,pointer:'/compile',unchanged:true},operatorContinuation:{manifestSha256:manifestDigest,rootAdmission:await pinned(join(root,'ROOT_ADMISSION.json')),rootDisposition:selection.rootDisposition,sourceAfter:selection.sourceAfter,finalRuntimeClose:selection.finalRuntimeClose,qualified:false,accepted:false},generatedManifest,generatedGraph};
 await record('COMPLETED_STAGE_REPORT.json',completed);completedReport=await pinned(join(out,'COMPLETED_STAGE_REPORT.json'));
}
await record('SUMMARY.json',{status:completedReport?'GENERATION_AND_LIFECYCLE_COMPLETED_COMPILE_REUSED':'STOPPED_BUILD_CONTINUATION_FAILURE',subject:selection.subject,finalSubject:selection.finalSubject,sourceDigest:selection.sourceDigest,originalFailedReport:selection.originalFailedReport,results,completedReport,sourceAfter:await verifySource(),ProductAccepted:false,qualified:false});
if(!completedReport)process.exitCode=1;
