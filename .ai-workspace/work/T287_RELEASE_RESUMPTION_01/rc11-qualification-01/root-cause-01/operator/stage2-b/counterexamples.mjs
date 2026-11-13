import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const [extractionPath,expectedSha,output]=process.argv.slice(2),hex=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(extractionPath);assert.equal(hex(raw),expectedSha);const x=JSON.parse(raw);
for(const p of x.sources){const b=await readFile(p.path);assert.equal(b.length,p.bytes);assert.equal(hex(b),p.sha256);}
for(const [k,v] of Object.entries(x.texts)){assert.equal(Buffer.byteLength(v),x.textPins[k].bytes);assert.equal(hex(v),x.textPins[k].sha256);}
const records=[...Array.from({length:7},(_,i)=>`progress-${i}\n`),'complete\n'];
const bytes=records.join(''),partitions={recordByRecord:records,oneCoalesced:[bytes],sixCoalesced:[records.slice(0,2).join(''),...records.slice(2,6),records.slice(6).join('')],splitEachByte:[...bytes]};
const originalOracle=new Function('assert','chunks',`let progressObservations=0;const observer=${x.texts.progressObserver};const acknowledgements=chunks.map(chunk=>observer(chunk));let criterionError=null;try{${x.texts.progressCriterion}}catch(e){criterionError={name:e.name,code:e.code,message:e.message};}return {progressObservations,acknowledgements,criterionError};`);
const oracle=Object.entries(partitions).map(([name,chunks])=>{assert.equal(chunks.join(''),bytes);const r=originalOracle(assert,chunks);return {name,orderedBytes:Buffer.byteLength(bytes),sha256:hex(bytes),callbackCount:chunks.length,...r};});
assert.equal(oracle[0].criterionError,null);assert(oracle[1].criterionError);assert(oracle[2].criterionError);assert.equal(oracle[3].criterionError,null);assert(oracle.every(r=>r.acknowledgements.every(v=>v===true)));
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
function context(){let clock=0,id=0;const timers=new Map();const observe=new Function('performance','setTimeout','clearTimeout',x.texts.sinceMs+'\n'+x.texts.observePublication+'\nreturn observePublication;')({now:()=>clock},(fn,delay)=>{timers.set(++id,{fn,delay});return id;},i=>timers.delete(i));return {observe,clock:v=>{clock=v;},timers};}
const microtasks=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};const races=[];
{
 const c=context(),d=deferred(),calls=[];const stop=c.observe(0,10,{first:()=>{calls.push('first');return d.promise;},next:()=>{calls.push('next');return Promise.resolve('next-value');}});const returned=stop();c.clock(1);d.resolve('first-value');const result=await returned;assert.deepEqual(calls,['first','next']);assert.equal(result.observed.first.atMs,1);assert.equal(result.observed.next.atMs,1);races.push({name:'stop-during-pending-probe',stopAtControlledMs:0,probeResolvedAtControlledMs:1,probeCalls:calls,nextProbeRanAfterStop:true,result});
}
for(const [name,at] of [['deadline-during-pending-probe',11],['exact-deadline-boundary',10]]){
 const c=context(),d=deferred();const stop=c.observe(0,10,{one:()=>d.promise});c.clock(at);d.resolve('value');await microtasks();const result=await stop();assert.equal(result.observed.one.atMs,at);races.push({name,setupMs:10,probeResolvedAtControlledMs:at,creditAtOrBeyondDeadline:true,result});
}
{
 const c=context();let settled=false;const stop=c.observe(0,10,{never:()=>new Promise(()=>{})});const returned=stop();returned.then(()=>{settled=true;},()=>{settled=true;});const started=performance.now();await new Promise(resolve=>setTimeout(resolve,25));assert.equal(settled,false);races.push({name:'never-resolving-probe-after-stop',settled:false,observationWallMs:performance.now()-started,controlledPollingTimers:c.timers.size,standing:'Bounded observation of unsettled stop return; constructed probe has no resolution path. No repaired cancellation or timeout is implemented.'});
}
const result={status:'SOURCE_EXTRACTED_COUNTEREXAMPLES_OBSERVED',extractionSha256:expectedSha,oracle,observePublication:races,runtimeProofClaim:false,historicalCauseClaim:false,sourceRepair:false,limits:['Pure callback partition proves criterion depends on stream chunking, not lost progress. It does not measure actual runtime callback distribution.','Exact source function credits after stop/deadline and runs another probe; unresolved awaited probe prevents bounded stop handback.','Controlled clock/deferred probe are diagnostic inputs, not Product runtime or a proposed repair.']};
await writeFile(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:result.status,oraclePartitions:oracle.length,interleavings:races.length}));
