// External Node 24.7 child_process diagnostic subscriber. No Product import,
// function replacement, callback wrapping, deadline/argument/env mutation, or retry.
import {channel} from 'node:diagnostics_channel';
import {errorMonitor} from 'node:events';
import {createHash} from 'node:crypto';
import {appendFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {join, isAbsolute} from 'node:path';
import {performance} from 'node:perf_hooks';

const root=process.env.ABG_PEER_DIAGNOSTIC_ROOT;
if(typeof root!=='string'||!isAbsolute(root))throw new Error('explicit external diagnostic root required');
const directory=join(root,`process-${process.pid}`);
mkdirSync(directory,{recursive:false});
const streamLimit=20*1024*1024, processRawLimit=256*1024*1024, childLimit=4096;
let ordinal=0,rawWritten=0;const pending=new Map(),failures=[];
const sha=b=>createHash('sha256').update(b).digest('hex');
const safe=(fn)=>{try{return fn();}catch(error){if(failures.length<16)failures.push({name:error.name,message:String(error.message).slice(0,1024)});}};
const write=(name,value)=>safe(()=>writeFileSync(join(directory,name),JSON.stringify(value)+'\n',{flag:'wx'}));
const text=(value,limit=4096)=>typeof value==='string'?value.slice(0,limit):value;
const errorValue=error=>({name:error?.name,message:text(error?.message),code:error?.code??null,
 errno:error?.errno??null,syscall:error?.syscall??null,signal:error?.signal??null,killed:error?.killed??null});
write('PROCESS.json',{kind:'external_child_diagnostic',pid:process.pid,ppid:process.ppid,
 node:process.version,execPath:process.execPath,argv:process.argv,execArgv:process.execArgv,
 nodeTestContext:process.env.NODE_TEST_CONTEXT??null,startedUtc:new Date().toISOString(),
 streamLimit,processRawLimit,claim:'Observed child events and already-consumed data only; no Product truth or callback-error reconstruction.'});

channel('child_process').subscribe(({process:child})=>safe(()=>{
 const id=++ordinal;if(id>childLimit){if(id===childLimit+1)failures.push({message:'child observation bound exceeded'});return;}
 const began=performance.now(),stem=String(id).padStart(4,'0'),streams=[];
 const row={id,parentPid:process.pid,createdUtc:new Date().toISOString(),pid:null,
  launchStack:new Error('child construction observation').stack.split('\n').slice(2,20),
  spawned:false,errors:[],exit:null,close:null};pending.set(id,row);
 write(`${stem}-created.json`,row);
 // errorMonitor observes without satisfying EventEmitter's required error listener.
 child.on(errorMonitor,error=>safe(()=>{
  const observation={atMs:performance.now()-began,...errorValue(error)};
  row.errors.push(observation);write(`${stem}-error-${row.errors.length}.json`,observation);
 }));
 child.once('spawn',()=>safe(()=>{
  row.spawned=true;row.pid=child.pid;row.spawnAtMs=performance.now()-began;
  const argv=child.spawnargs??[];row.spawnfile=child.spawnfile;
  row.argv=argv.map(x=>text(x,8192));row.argvDigest=sha(JSON.stringify(argv));
  row.argvTruncated=argv.some(x=>typeof x==='string'&&x.length>8192);
  for(const name of ['stdout','stderr']){
   const stream=child[name];const capture={name,observedBytes:0,retainedBytes:0,hash:createHash('sha256'),
    status:!stream?'no_pipe':stream.readableFlowing===true?'observing_existing_consumer':'unobserved_not_already_flowing'};
   streams.push(capture);
   if(capture.status!=='observing_existing_consumer')continue;
   // Do not cause a paused/unconsumed pipe to flow. execFile's original data
   // listeners have already been attached before Node emits spawn.
   stream.on('data',chunk=>safe(()=>{
    const bytes=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk,stream.readableEncoding??'utf8');
    capture.observedBytes+=bytes.length;capture.hash.update(bytes);
    const take=Math.max(0,Math.min(bytes.length,streamLimit-capture.retainedBytes,processRawLimit-rawWritten));
    if(take){appendFileSync(join(directory,`${stem}-${name}.raw`),bytes.subarray(0,take));capture.retainedBytes+=take;rawWritten+=take;}
   }));
  }
  write(`${stem}-spawn.json`,{...row,streams:streams.map(({hash,...x})=>x)});
 }));
 child.once('exit',(code,signal)=>safe(()=>{
  row.exit={atMs:performance.now()-began,code,signal,killed:child.killed};write(`${stem}-exit.json`,row.exit);
 }));
 child.once('close',(code,signal)=>safe(()=>{
  row.close={atMs:performance.now()-began,code,signal,killed:child.killed,exitCode:child.exitCode,signalCode:child.signalCode};
  row.streams=streams.map(({hash,...x})=>({...x,observedSha256:hash.digest('hex'),rawTruncated:x.retainedBytes<x.observedBytes}));
  write(`${stem}-close.json`,row);pending.delete(id);
 }));
}));
process.once('exit',code=>write('PROCESS_END.json',{code,endedUtc:new Date().toISOString(),
 observedChildren:ordinal,rawWritten,pendingChildren:[...pending.values()],observerFailures:failures,
 limits:'No spawnSync observation; no callback-local execFile error object; string chunks are digested in their declared decoded encoding. An absent close is not termination proof.'}));
