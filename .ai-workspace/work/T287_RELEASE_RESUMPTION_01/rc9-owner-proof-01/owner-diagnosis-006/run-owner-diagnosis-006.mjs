//006 diagnostic successor of004; unchanged OWN test, external observation only.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat,realpath,statfs,readdir,open} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadavg,cpus,freemem,totalmem} from 'node:os';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const hex=b=>createHash('sha256').update(b).digest('hex'),exec=promisify(execFile);
async function pin(path){const b=await readFile(path);return {path,bytes:b.length,sha256:hex(b)};}
async function checked(p){assert(p&&p.path&&p.sha256,'unbound pin');assert.deepEqual(await pin(p.path),p);return readFile(p.path);}
async function absent(p){try{await lstat(p);throw Error('preserve allocation '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
// UNIT_REPORTER_PARSER_START -- same summary/end contract as close-proof.mjs.
function parseUnitReporter(bytes,maxBytes){
  let rows=[],parseFailure=null;
  try{
    assert(bytes!==null,'structured reporter missing');assert(bytes.length<=maxBytes,'structured reporter output bound exceeded');
    rows=bytes.toString('utf8').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
  }catch(error){parseFailure=String(error);}
  const summary=rows.filter(row=>row.type==='summary'&&row.file===null).at(-1)??null;
  const skips=rows.filter(row=>row.type==='case'&&(row.skip||row.todo));
  const complete=!parseFailure&&rows[0]?.type==='begin'&&summary!==null&&rows.at(-1)?.type==='end';
  if(!complete&&!parseFailure)parseFailure='structured reporter incomplete: begin/global summary/end required';
  return {rows,summary,counts:summary?.counts??null,skips,complete,parseFailure};
}
// UNIT_REPORTER_PARSER_END
const [bindingPath,bindingSha,admissionPath,admissionSha]=process.argv.slice(2);assert.equal(process.argv.length,6,'usage: node run-owner-diagnosis-006.mjs BINDING SHA ROOT_ADMISSION SHA');
const raw=await readFile(bindingPath);assert.equal(hex(raw),bindingSha);const b=JSON.parse(raw);assert.equal(b.status,'BOUND_RC9_OWNER_DIAGNOSIS');
const ar=await readFile(admissionPath);assert.equal(hex(ar),admissionSha);const admission=JSON.parse(ar);assert.equal(admission.status,'ROOT_ADMITTED_RC9_OWNER_DIAGNOSIS');assert.equal(admission.bindingSha256,bindingSha);assert.equal(admission.formerProofProcessesStopped,true);assert.deepEqual(admission.formerProofStopChecks,b.formerProofStopChecks);
assert.equal(b.bounds.timeoutMs,600000);assert.equal(b.bounds.outputBytes,16777216);assert.equal(b.bounds.reserveBytes,4294967296);assert.equal(b.bounds.maxOwnedBytes,4294967296);assert.equal(b.bounds.pollMs,10000);assert.equal(b.bounds.ancestryProbeMs,10000);assert.equal(b.expectedCases,1);assert.equal(b.bounds.cpuIntervalUs,10000);assert.equal(b.bounds.profileBytes,67108864);assert.equal(b.bounds.cpuPollMs,10000);assert.equal(b.bounds.maxCpuProbes,64);assert.equal(b.bounds.cpuRecordBytes,4194304);assert.equal(b.bounds.phaseAtMs,300000);assert.equal(b.bounds.phaseProbeMs,10000);assert.equal(b.bounds.phaseReadBytes,1048576);
assert.equal(b.outputRoot,join(dirname(resolve(bindingPath)),'execution-001'));assert.equal(b.scratchRoot,'/private/tmp/abg-r9-owner-diagnosis-006');
assert.equal(await realpath(process.execPath),b.node.path);for(const p of [b.node,b.ps,b.sourceFreeze,b.completedStage,b.buildInputs,b.dependencyInventory,b.stageManifest,b.reporter,b.fileHost,b.parserOwner,...b.commandOwnerPins,...b.materialPins,...b.formerProofStopChecks,b.formerOwnProofStop,...b.diagnosticControlPins])await checked(p);assert.deepEqual(admission.formerOwnProofStop,b.formerOwnProofStop);
const frozen=JSON.parse(await checked(b.sourceFreeze)),stage=JSON.parse(await checked(b.completedStage));assert.equal(frozen.sourceDigest,b.sourceDigest);assert.equal(stage.sourceDigest,b.sourceDigest);assert.equal(stage.status,'BUILT');assert.equal(stage.tenant,b.cwd);
assert.equal(b.innerTimeoutMs,500000);assert.equal(b.testFile,'test_env/tests/t287-held-owner-fold-reuse.test.mjs');assert((await readFile(join(b.cwd,b.testFile),'utf8')).includes('{timeout:500_000}'));for(const tool of b.fixtureToolPins){assert.equal(await realpath(tool.configuredPath),tool.realPath);await checked({path:tool.realPath,bytes:tool.bytes,sha256:tool.sha256});}assert.deepEqual(b.command.args,['--cpu-prof','--cpu-prof-dir='+join(b.outputRoot,'profiles'),'--cpu-prof-interval=10000','--experimental-vm-modules','--test','--test-concurrency=1',b.testFile]);assert.equal(b.command.executable,b.node.path);assert.equal(b.command.cwd,b.cwd);
const expectedOptions='--max-old-space-size=8192 --test-reporter=spec --test-reporter-destination=stdout --test-reporter='+b.reporter.path+' --test-reporter-destination='+join(b.outputRoot,'events.jsonl');assert.equal(b.command.environment.NODE_OPTIONS,expectedOptions);assert.equal(b.command.environment.TMPDIR,join(b.scratchRoot,'tmp'));assert(!Object.keys(b.command.environment).some(k=>/CLAUDE|ANTHROPIC|OPENAI|PROVIDER/.test(k)));
await absent(b.outputRoot);await absent(b.scratchRoot);const fs=await statfs(dirname(b.outputRoot));assert(fs.bavail*fs.bsize>=b.bounds.reserveBytes,'4GiB free reserve required');
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(b.commandOwnerPins[0].path));
await mkdir(b.outputRoot);await mkdir(join(b.outputRoot,'profiles'));await mkdir(b.scratchRoot);await mkdir(join(b.scratchRoot,'tmp'));for(const n of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(b.scratchRoot,n),'',{flag:'wx'});
const save=(n,x)=>exclusiveRecord(b.outputRoot,n,x);const hostSamples=[];
function sample(point){hostSamples.push({point,at:new Date().toISOString(),pid:process.pid,ppid:process.ppid,loadAverage:loadavg(),logicalCPUs:cpus().length,memoryFreeBytes:freemem(),memoryTotalBytes:totalmem()});}
const cpuRecords=[],cpuLast=new Map(),knownDescendants=new Set();let cpuProbeCount=0,cpuRecordBytes=0,cpuBusy=false,cpuPending=null;
const cpuSeconds=value=>{const m=value.match(/^(?:(\d+)-)?(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)$/);return m?Number(m[1]??0)*86400+Number(m[2]??0)*3600+Number(m[3])*60+Number(m[4]):null;};
async function ancestry(point){
 if(cpuProbeCount>=b.bounds.maxCpuProbes)return 'CPU probe count exhausted';cpuProbeCount++;
 const started=performance.now(),record={point,at:new Date().toISOString(),startedMonotonicMs:started,hostPid:process.pid,rows:[],failure:null};
 try{
  const {stdout}=await exec(b.ps.path,['-axo','pid=,ppid=,pgid=,lstart=,etime=,time=,stat=,comm='],{timeout:b.bounds.ancestryProbeMs,maxBuffer:1048576,env:{PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'},encoding:'utf8'});
  const rows=stdout.split('\n').filter(l=>l.trim()).map(l=>{const m=l.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(\w{3}\s+\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\d{4})\s+(\S+)\s+(\S+)\s+(\S+)\s+(.*)$/);assert(m,'unparsed ps row');return {pid:+m[1],ppid:+m[2],pgid:+m[3],start:m[4].replace(/\s+/g,' '),elapsed:m[5],cpuTime:m[6],state:m[7],command:m[8]};});
  const ancestors=new Set([process.pid]);let cursor=process.pid;for(let i=0;i<32;i++){const row=rows.find(x=>x.pid===cursor);if(!row||ancestors.has(row.ppid))break;ancestors.add(row.ppid);cursor=row.ppid;}
  const descendants=new Set([process.pid]);for(let i=0;i<32;i++){let changed=false;for(const row of rows)if(descendants.has(row.ppid)&&!descendants.has(row.pid)){descendants.add(row.pid);changed=true;}if(!changed)break;}
  const selected=rows.filter(r=>ancestors.has(r.pid)||descendants.has(r.pid)||knownDescendants.has(r.pid+'@'+r.start));assert(selected.length<=256,'owned row cap');
  record.observedMonotonicMs=performance.now();for(const row of selected){
   row.identity=row.pid+'@'+row.start;row.role=row.pid===process.pid?'external_host':descendants.has(row.pid)?'descendant':knownDescendants.has(row.identity)?'previously_observed_descendant':'ancestor';
   if(row.role==='descendant')knownDescendants.add(row.identity);row.cpuSeconds=cpuSeconds(row.cpuTime);assert(row.cpuSeconds!==null,'unparsed CPU time');
   const previous=cpuLast.get(row.identity);row.deltaCpuSeconds=previous?row.cpuSeconds-previous.cpuSeconds:null;row.deltaObservedMs=previous?record.observedMonotonicMs-previous.at:null;
   row.cpuPerElapsed=previous&&row.deltaObservedMs>0&&row.deltaCpuSeconds>=0?row.deltaCpuSeconds/(row.deltaObservedMs/1000):null;cpuLast.set(row.identity,{cpuSeconds:row.cpuSeconds,at:record.observedMonotonicMs});
  }record.rows=selected;record.standing='CPU time is accumulated user+system; elapsed is actual observer interval. Short-lived/unknown detached processes may be missed. No wait-cause or CPU-saturation inference.';
 }catch(e){record.failure=String(e);}
 record.finishedAt=new Date().toISOString();record.probeWallMs=performance.now()-started;let encoded=JSON.stringify(record);if(cpuRecordBytes+Buffer.byteLength(encoded)>b.bounds.cpuRecordBytes){record.rows=[];record.failure='CPU retained-record byte cap';encoded=JSON.stringify(record);}cpuRecordBytes+=Buffer.byteLength(encoded);cpuRecords.push(record);await save('ancestry-'+point+'.json',record);return record.failure;
}
async function phaseObservation(){
 const started=performance.now(),receipt={at:new Date().toISOString(),commandRelativeMs:started-commandStartedMonotonic,helper:b.phaseObserver,timeoutMs:b.bounds.phaseProbeMs};let child;
 const observed=await new Promise(resolve=>{child=execFile(b.node.path,[b.phaseObserver.path,join(b.scratchRoot,'tmp')],{timeout:b.bounds.phaseProbeMs,maxBuffer:1048576,env:{PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'},encoding:'utf8'},(error,stdout,stderr)=>resolve({error:error?{code:error.code,signal:error.signal,killed:error.killed,message:error.message}:null,stdout,stderr}));receipt.helperPid=child.pid??null;receipt.helperParentPid=process.pid;});
 receipt.wallMs=performance.now()-started;receipt.error=observed.error;receipt.stderr=observed.stderr;try{receipt.observation=JSON.parse(observed.stdout);}catch(e){receipt.observation={status:'UNKNOWN',failure:String(e)};}receipt.standing='One bounded physical-event observation only; missing/partial rows remain unknown. No ABG truth admission or assertion credit.';await save('PHASE_OBSERVATION.json',receipt);
}
async function collectProfiles(){
 const report={capBytes:b.bounds.profileBytes,actualTotalBytes:0,collectedBytes:0,files:[],failures:[],expectedProcessIds:{testRunner:null,testFile:null},complete:false,standing:'Profiles must correspond to observed owned processes. A missing, over-cap or invalid/truncated file is unavailable, never zero CPU.'};
 let started=null;try{started=JSON.parse(await readFile(join(b.outputRoot,'FILE_CHILD_STARTED.json'),'utf8'));assert.deepEqual(started.args,b.command.args);assert.equal(started.executable,b.node.path);assert(Number.isSafeInteger(started.testRunnerPid));report.expectedProcessIds.testRunner=started.testRunnerPid;}catch(e){report.failures.push('runner identity: '+String(e));}
 const rows=cpuRecords.flatMap(r=>r.rows),isNode=r=>r.command===b.node.path||r.command==='node';const testRows=rows.filter(r=>r.ppid===started?.testRunnerPid&&isNode(r));const testIds=[...new Set(testRows.map(r=>r.identity))];
 if(testIds.length===1)report.expectedProcessIds.testFile=testRows[0].pid;else report.failures.push('isolated test PID identity count '+testIds.length);
 let names=[];try{names=await readdir(join(b.outputRoot,'profiles'));assert(names.length<=32,'profile file count cap');}catch(e){report.failures.push(String(e));names=[];}
 for(const name of names.sort()){
  const entry={name};try{const path=join(b.outputRoot,'profiles',name),st=await lstat(path);assert(st.isFile()&&!st.isSymbolicLink(),'profile not regular');entry.bytes=st.size;report.actualTotalBytes+=st.size;const m=name.match(/^CPU\.(\d{8})\.(\d{6})\.(\d+)\.(\d+)\.(\d+)\.cpuprofile$/);assert(m,'unexpected profile name');entry.pid=+m[3];entry.threadId=+m[4];
   const identities=[...new Set(rows.filter(r=>r.pid===entry.pid&&isNode(r)&&r.role==='descendant').map(r=>r.identity))];entry.observedProcessIdentities=identities;assert.equal(identities.length,1,'profile process correspondence incomplete');
   entry.role=entry.pid===report.expectedProcessIds.testRunner?'test_runner':entry.pid===report.expectedProcessIds.testFile?'isolated_test_file':'other_observed_descendant';
   assert(report.collectedBytes+st.size<=b.bounds.profileBytes,'profile collection byte cap');const fd=await open(path,'r');let data;try{const buffer=Buffer.alloc(st.size);let offset=0;while(offset<buffer.length){const r=await fd.read(buffer,offset,buffer.length-offset,offset);if(r.bytesRead===0)break;offset+=r.bytesRead;report.collectedBytes+=r.bytesRead;}data=buffer.subarray(0,offset);assert.equal((await fd.stat()).size,st.size,'profile grew during bounded collection');assert.equal(data.length,st.size,'profile changed or truncated during collection');}finally{await fd.close();}entry.sha256=hex(data);const profile=JSON.parse(data);
   assert(Array.isArray(profile.nodes)&&Array.isArray(profile.samples)&&Array.isArray(profile.timeDeltas)&&profile.samples.length===profile.timeDeltas.length&&Number.isFinite(profile.startTime)&&Number.isFinite(profile.endTime)&&profile.endTime>=profile.startTime,'profile structural completeness');
   entry.sampleCount=profile.samples.length;entry.nodeCount=profile.nodes.length;entry.startTimeUs=profile.startTime;entry.endTimeUs=profile.endTime;entry.status='COMPLETE_PROFILE';
  }catch(e){entry.status='UNAVAILABLE';entry.failure=String(e);report.failures.push(name+': '+String(e));}report.files.push(entry);
 }
 for(const role of ['test_runner','isolated_test_file'])if(!report.files.some(f=>f.role===role&&f.status==='COMPLETE_PROFILE'&&f.sampleCount>0))report.failures.push('missing complete sampled '+role+' profile');
 if(report.actualTotalBytes>b.bounds.profileBytes)report.failures.push('actual profile bytes exceed operational cap; no files truncated or removed');report.complete=report.failures.length===0;await save('PROFILE_COLLECTION.json',report);return report;
}
sample('before');const preAncestryFailure=await ancestry('before');
await save('REQUEST.json',{binding:{path:resolve(bindingPath),sha256:bindingSha},admission:{path:resolve(admissionPath),sha256:admissionSha},command:b.command,bounds:b.bounds,nodeVersion:process.version,nodeExecutable:process.execPath,hostPid:process.pid,hostParentPid:process.ppid,formerProofStopChecks:b.formerProofStopChecks,standing:'One diagnostic OWN execution with unchanged assertions and normal disposable fixture effects; original test verdict preserved. No quiet-host assertion, source acceptance or retry.'});
assert.equal(preAncestryFailure,null,'preflight ancestry observation incomplete');
const fileBinding=join(b.outputRoot,'FILE_HOST_BINDING.json');await writeFile(fileBinding,JSON.stringify({executable:b.node.path,args:b.command.args,cwd:b.cwd,outputRoot:b.outputRoot,scratchRoot:b.scratchRoot,profileRoot:join(b.outputRoot,'profiles'),resourceRecord:join(b.outputRoot,'RESOURCES.json'),bounds:b.bounds},null,2)+'\n',{flag:'wx'});const filePin=await pin(fileBinding);
const commandStartedMonotonic=performance.now();let commandLive=true,result=null,commandFailure=null,ancestryFailure=null,phasePending=null,phaseAttempted=false;
const timer=setInterval(()=>sample('during'),1000);
const kickCpu=()=>{if(!commandLive||cpuBusy)return;cpuBusy=true;cpuPending=ancestry('during-'+String(cpuProbeCount).padStart(3,'0')).then(f=>{if(f)ancestryFailure??=f;}).finally(()=>{cpuBusy=false;});};
const earlyCpu=setTimeout(kickCpu,1000),cpuTimer=setInterval(kickCpu,b.bounds.cpuPollMs);
const phaseTimer=setTimeout(()=>{if(commandLive){phaseAttempted=true;phasePending=phaseObservation().catch(async e=>{await save('PHASE_OBSERVATION_FAILURE.json',{failure:String(e)});});}},b.bounds.phaseAtMs);
try{result=await commandRecorder(b.outputRoot,{environment:b.command.environment,timeoutMs:b.bounds.timeoutMs,maxOutputBytes:b.bounds.outputBytes})('own01',b.node.path,[b.fileHost.path,fileBinding,filePin.sha256],{cwd:b.cwd});}catch(e){commandFailure=String(e?.stack??e);}finally{
 commandLive=false;clearInterval(timer);clearInterval(cpuTimer);clearTimeout(earlyCpu);clearTimeout(phaseTimer);if(cpuPending)await cpuPending;if(phasePending)await phasePending;sample('after');
}
if(!phaseAttempted)await save('PHASE_OBSERVATION.json',{status:'NOT_ATTEMPTED_COMMAND_ALREADY_CLOSED',standing:'No phase observation and no phase inference.'});
const postAncestryFailure=await ancestry('after');await save('HOST_OBSERVATIONS.json',{samples:hostSamples,ancestryFailure,postAncestryFailure,quietHostClaim:false});
await save('PROCESS_CPU_OBSERVATIONS.json',{probeCount:cpuProbeCount,retainedBytes:cpuRecordBytes,records:cpuRecords.map(r=>({point:r.point,at:r.at,probeWallMs:r.probeWallMs,failure:r.failure,receipt:'ancestry-'+r.point+'.json'})),standing:'Use each retained per-process CPU delta with actual elapsed interval; no aggregate saturation or wait-cause inference. No detached-descendant absence claim.'});
const profileCollection=await collectProfiles();
let bytes=null,readFailure=null;try{bytes=await readFile(join(b.outputRoot,'events.jsonl'));}catch(e){readFailure=String(e);}const evidence=parseUnitReporter(bytes,b.bounds.outputBytes);let conservationFailure=null;try{for(const p of [b.sourceFreeze,b.completedStage,b.stageManifest,...b.materialPins,...b.diagnosticControlPins])await checked(p);}catch(e){conservationFailure=String(e);}
let ownerObservations=null,ownerObservationFailure=null,ownerObservationLines=[];
try{assert(typeof result?.stdout==='string','command stdout unavailable');assert.equal(b.finalObservationDiagnostic.marker,'RC9_OWN01_OBSERVATIONS ');assert.equal(b.finalObservationDiagnostic.required,true);
  ownerObservationLines=result.stdout.split(/\r?\n/u).filter(line=>line.includes(b.finalObservationDiagnostic.marker));assert.equal(ownerObservationLines.length,1,'one final OWN diagnostic required');
  const line=ownerObservationLines[0];ownerObservations=JSON.parse(line.slice(line.indexOf(b.finalObservationDiagnostic.marker)+b.finalObservationDiagnostic.marker.length));
  assert(ownerObservations&&typeof ownerObservations==='object'&&!Array.isArray(ownerObservations),'OWN diagnostic must be a JSON object');for(const key of b.finalObservationDiagnostic.requiredObjectKeys)assert(Object.hasOwn(ownerObservations,key),'missing OWN observation '+key);
}catch(e){ownerObservationFailure=String(e);}
await save('OWN01_OBSERVATIONS.json',{marker:b.finalObservationDiagnostic.marker,lines:ownerObservationLines,observations:ownerObservations,failure:ownerObservationFailure,standing:'Existing final test diagnostic; no counter reinterpretation or additional acceptance claim.'});
let resources=null;try{resources=JSON.parse(await readFile(join(b.outputRoot,'RESOURCES.json'),'utf8'));}catch{}
const cases=evidence.rows.filter(r=>r.type==='case'),counts=evidence.counts;const passed=result?.exitCode===0&&!result.signal&&!result.failure&&!result.timedOut&&!result.truncated&&!commandFailure&&evidence.complete&&evidence.summary?.success===true&&counts?.tests===b.expectedCases&&counts.passed===b.expectedCases&&counts.failed===0&&counts.cancelled===0&&counts.skipped===0&&counts.todo===0&&cases.length===b.expectedCases&&cases.every(r=>r.file===b.testFile&&!r.skip&&!r.todo)&&!ancestryFailure&&!postAncestryFailure&&!conservationFailure&&resources?.status==='CHILD_CLOSED'&&resources.monitorFailure===null&&!ownerObservationFailure;
const originalTestVerdict=!evidence.complete?'incomplete_reporter':counts?.cancelled>0?'cancelled':counts?.failed>0?'failed':evidence.summary?.success===true&&counts?.passed===1?'passed':'incomplete';
await save('RESULT.json',{diagnosis:'RC9_OWNER_DIAGNOSIS_006',originalTestVerdict,cpuDiagnosticsComplete:profileCollection.complete&&!ancestryFailure&&!postAncestryFailure,profileCollection:await pin(join(b.outputRoot,'PROFILE_COLLECTION.json')),processCpuObservations:await pin(join(b.outputRoot,'PROCESS_CPU_OBSERVATIONS.json')),fileHostChildOutcome:resources?.childOutcome??null,status:passed?'OWN_PROOF_PASSED':evidence.complete&&counts?.failed>0?'OWN_PROOF_FAILED':'OWN_PROOF_INCOMPLETE',counts,ownerObservationFailure,ownerObservations:await pin(join(b.outputRoot,'OWN01_OBSERVATIONS.json')),skips:evidence.skips,reporterComplete:evidence.complete,parseFailure:readFailure??evidence.parseFailure,command:result?{exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure,wallMs:result.wallMs}:null,commandFailure,conservationFailure,ancestryFailure,postAncestryFailure,reporter:bytes===null?null:await pin(join(b.outputRoot,'events.jsonl')),sourceDigest:b.sourceDigest,wholeFile:passed,originalUnitStanding:'FAILED/INCOMPLETE_UNCHANGED',sourceAcceptance:false,standing:'Actual original OWN verdict and diagnostic availability recorded separately. Cancellation remains incomplete proof even when profiles are usable. No automatic retry or source acceptance. Original unit remains incomplete; M5 residual and bootstrap/broad conjunction remain Root-owned.'});
if(!passed||!profileCollection.complete)process.exitCode=1;
