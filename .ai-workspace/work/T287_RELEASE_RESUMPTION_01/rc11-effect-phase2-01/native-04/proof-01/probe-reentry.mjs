import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const [bindingPath,bindingSha,mode]=process.argv.slice(2), hash=b=>createHash('sha256').update(b).digest('hex');
const bytes=readFileSync(bindingPath);assert.equal(hash(bytes),bindingSha);const binding=JSON.parse(bytes);
assert(mode==='candidate'||mode==='baseline');const selected=binding.subjects[mode];
for(const p of selected.modulePins){const bytes=readFileSync(p.path);assert.equal(bytes.length,p.bytes);assert.equal(hash(bytes),p.sha256);}
const {createOwnedProcessLifetime}=await import(pathToFileURL(selected.ownerModule).href);
mkdirSync(selected.outputRoot,{recursive:false});
let now=0n,nextTimer=0,hostCalls=0,disposals=0,completionFacts=null,completionSettled=false;
const timers=new Map(),trace=[],signals=[];
const clock={nowNs:()=>now,arm:(callback,delayMs)=>{const id=++nextTimer;timers.set(id,{callback,delayMs,active:true});return id;},cancel:id=>{const row=timers.get(id);if(row)row.active=false;}};
const child=new EventEmitter();child.pid=321;
for(const key of ['stdin','stdout','stderr']){const stream=new EventEmitter();stream.closed=false;stream.destroy=()=>{disposals++;stream.destroyed=true;};stream.once('close',()=>{stream.closed=true;});child[key]=stream;}
const host={clock,platform:'posix',signal:(_child,signal)=>{signals.push(signal);trace.push({kind:'signal',signal});},probeGroup:pid=>{
  const ordinal=++hostCalls;assert(hostCalls<=20,'finite fixture probe bound');trace.push({kind:'probe_enter',ordinal,pid});
  if(ordinal===1){trace.push({kind:'inject_exit'});child.emit('exit',0,null);trace.push({kind:'inject_close'});child.emit('close');trace.push({kind:'probe_return',ordinal,absence:'present'});return 'present';}
  trace.push({kind:'probe_return',ordinal,absence:'absent'});return 'absent';
}};
const lifetime=createOwnedProcessLifetime(child,{terminationGraceMs:100,host});
let callError=null;
lifetime.completion.then(facts=>{completionFacts=facts;completionSettled=true;});
try{lifetime.requestTermination();}catch(error){callError=error;}
const immediateSnapshot=lifetime.snapshot(),immediateResidue=[...timers].filter(([,v])=>v.active).map(([id,v])=>({id,delayMs:v.delayMs}));
let harnessWait;const settledWithinBound=await Promise.race([lifetime.completion.then(()=>true),new Promise(resolve=>{harnessWait=setTimeout(()=>resolve(false),250);})]);clearTimeout(harnessWait);
now=25_000_000n;const laterSnapshot=lifetime.snapshot();
const physical=facts=>facts&&Object.fromEntries(Object.entries(facts).filter(([k])=>k!=='cleanupElapsedMs'));
const record={mode,owner: selected.modulePins,hostCalls,trace,signals,disposals,callError,settledWithinBound,completionSettled,completionFrozen:completionFacts&&Object.isFrozen(completionFacts),completionFacts,immediateSnapshot,laterSnapshot,freshSnapshots:immediateSnapshot!==laterSnapshot,immediateTimerResidue:immediateResidue,laterTimerResidue:[...timers].filter(([,v])=>v.active).map(([id,v])=>({id,delayMs:v.delayMs})),standing:'Controlled child/clock and real imported owner; no OS child, signal, installed proof or source repair. now advances only for later snapshot; timers are retained, not fired or cleared by fixture.'};
const encode=(_key,value)=>typeof value==='bigint'?{kind:'bigint',value:String(value)}:value instanceof Error?{name:value.name,message:value.message,stack:value.stack}:value;
writeFileSync(selected.outputRoot+'/OBSERVATION.json',JSON.stringify(record,encode,2)+'\n',{flag:'wx'});
// All actual observations persist before this independent physical-fact oracle.
assert.equal(callError,null);assert.equal(settledWithinBound,true);assert.equal(completionSettled,true);
assert(hostCalls>=2,'one outer and at least one nested probe actually performed');
assert.equal(completionFacts.probeCount,hostCalls,'sealed facts count every performed probe');
assert.equal(immediateSnapshot.probeCount,hostCalls,'immediate snapshot counts every performed probe');
assert.equal(laterSnapshot.probeCount,hostCalls,'later snapshot counts every performed probe');
assert.deepEqual(physical(immediateSnapshot),physical(completionFacts),'physical snapshot facts equal sealed completion');
assert.deepEqual(physical(laterSnapshot),physical(completionFacts),'later physical facts remain sealed');
assert.equal(completionFacts.scopeAbsence,'absent');assert.equal(record.completionFrozen,true);assert.equal(record.freshSnapshots,true);
assert.deepEqual(record.immediateTimerResidue,[]);assert.deepEqual(record.laterTimerResidue,[]);
console.log(JSON.stringify({status:'PASS',mode,hostCalls}));
