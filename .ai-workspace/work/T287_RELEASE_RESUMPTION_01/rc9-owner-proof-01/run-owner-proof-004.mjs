// One Root-selected complete OWN-01 proof over the unchanged built003 stage; no source/test edits.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat,realpath,statfs} from 'node:fs/promises';
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
const [bindingPath,bindingSha,admissionPath,admissionSha]=process.argv.slice(2);assert.equal(process.argv.length,6,'usage: node run-owner-proof-004.mjs BINDING SHA ROOT_ADMISSION SHA');
const raw=await readFile(bindingPath);assert.equal(hex(raw),bindingSha);const b=JSON.parse(raw);assert.equal(b.status,'BOUND_RC9_OWN_PROOF');
const ar=await readFile(admissionPath);assert.equal(hex(ar),admissionSha);const admission=JSON.parse(ar);assert.equal(admission.status,'ROOT_ADMITTED_RC9_OWN_PROOF');assert.equal(admission.bindingSha256,bindingSha);assert.equal(admission.formerProofProcessesStopped,true);assert.deepEqual(admission.formerProofStopChecks,b.formerProofStopChecks);
assert.equal(b.bounds.timeoutMs,600000);assert.equal(b.bounds.outputBytes,16777216);assert.equal(b.bounds.reserveBytes,4294967296);assert.equal(b.bounds.maxOwnedBytes,4294967296);assert.equal(b.bounds.pollMs,10000);assert.equal(b.bounds.ancestryProbeMs,10000);assert.equal(b.expectedCases,1);
assert.equal(b.outputRoot,join(dirname(resolve(bindingPath)),'owner-proof-004'));assert.equal(b.scratchRoot,'/private/tmp/abg-r9-owner-external-004');
assert.equal(await realpath(process.execPath),b.node.path);for(const p of [b.node,b.ps,b.sourceFreeze,b.completedStage,b.buildInputs,b.dependencyInventory,b.stageManifest,b.reporter,b.fileHost,b.parserOwner,...b.commandOwnerPins,...b.materialPins,...b.formerProofStopChecks])await checked(p);
const frozen=JSON.parse(await checked(b.sourceFreeze)),stage=JSON.parse(await checked(b.completedStage));assert.equal(frozen.sourceDigest,b.sourceDigest);assert.equal(stage.sourceDigest,b.sourceDigest);assert.equal(stage.status,'BUILT');assert.equal(stage.tenant,b.cwd);
assert.equal(b.innerTimeoutMs,500000);assert.equal(b.testFile,'test_env/tests/t287-held-owner-fold-reuse.test.mjs');assert((await readFile(join(b.cwd,b.testFile),'utf8')).includes('{timeout:500_000}'));for(const tool of b.fixtureToolPins){assert.equal(await realpath(tool.configuredPath),tool.realPath);await checked({path:tool.realPath,bytes:tool.bytes,sha256:tool.sha256});}assert.deepEqual(b.command.args,['--experimental-vm-modules','--test','--test-concurrency=1',b.testFile]);assert.equal(b.command.executable,b.node.path);assert.equal(b.command.cwd,b.cwd);
const expectedOptions='--max-old-space-size=8192 --test-reporter=spec --test-reporter-destination=stdout --test-reporter='+b.reporter.path+' --test-reporter-destination='+join(b.outputRoot,'events.jsonl');assert.equal(b.command.environment.NODE_OPTIONS,expectedOptions);assert.equal(b.command.environment.TMPDIR,join(b.scratchRoot,'tmp'));assert(!Object.keys(b.command.environment).some(k=>/CLAUDE|ANTHROPIC|OPENAI|PROVIDER/.test(k)));
await absent(b.outputRoot);await absent(b.scratchRoot);const fs=await statfs(dirname(b.outputRoot));assert(fs.bavail*fs.bsize>=b.bounds.reserveBytes,'4GiB free reserve required');
const {commandRecorder,exclusiveRecord}=await import(pathToFileURL(b.commandOwnerPins[0].path));
await mkdir(b.outputRoot);await mkdir(b.scratchRoot);await mkdir(join(b.scratchRoot,'tmp'));for(const n of ['npm-user.npmrc','npm-global.npmrc'])await writeFile(join(b.scratchRoot,n),'',{flag:'wx'});
const save=(n,x)=>exclusiveRecord(b.outputRoot,n,x);const hostSamples=[];
function sample(point){hostSamples.push({point,at:new Date().toISOString(),pid:process.pid,ppid:process.ppid,loadAverage:loadavg(),logicalCPUs:cpus().length,memoryFreeBytes:freemem(),memoryTotalBytes:totalmem()});}
async function ancestry(point){try{const {stdout}=await exec(b.ps.path,['-axo','pid=,ppid=,pgid=,stat=,etime=,comm='],{timeout:b.bounds.ancestryProbeMs,maxBuffer:1048576,env:{PATH:'/usr/bin:/bin'},encoding:'utf8'});const rows=stdout.split('\n').flatMap(l=>{const m=l.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(.*)$/);return m?[{pid:+m[1],ppid:+m[2],pgid:+m[3],state:m[4],elapsed:m[5],command:m[6]}]:[];});const keep=new Set([process.pid]);let cursor=process.pid;for(let i=0;i<32;i++){const row=rows.find(x=>x.pid===cursor);if(!row||keep.has(row.ppid))break;keep.add(row.ppid);cursor=row.ppid;}const descendants=new Set([process.pid]);for(let i=0;i<32;i++){let changed=false;for(const row of rows)if(descendants.has(row.ppid)&&!descendants.has(row.pid)){descendants.add(row.pid);changed=true;}if(!changed)break;}await save('ancestry-'+point+'.json',{at:new Date().toISOString(),hostPid:process.pid,rows:rows.filter(r=>keep.has(r.pid)||descendants.has(r.pid)),standing:'Observed host ancestors and descendants only; detached-descendant absence is not proved.'});return null;}catch(e){const failure=String(e);await save('ancestry-'+point+'.json',{at:new Date().toISOString(),failure});return failure;}}
sample('before');const preAncestryFailure=await ancestry('before');
await save('REQUEST.json',{binding:{path:resolve(bindingPath),sha256:bindingSha},admission:{path:resolve(admissionPath),sha256:admissionSha},command:b.command,bounds:b.bounds,nodeVersion:process.version,nodeExecutable:process.execPath,hostPid:process.pid,hostParentPid:process.ppid,formerProofStopChecks:b.formerProofStopChecks,standing:'One complete OWN proof with its existing disposable fixture effects; no quiet-host assertion, native/provider dispatch, source acceptance or retry.'});
assert.equal(preAncestryFailure,null,'preflight ancestry observation incomplete');
const fileBinding=join(b.outputRoot,'FILE_HOST_BINDING.json');await writeFile(fileBinding,JSON.stringify({executable:b.node.path,args:b.command.args,cwd:b.cwd,outputRoot:b.outputRoot,scratchRoot:b.scratchRoot,resourceRecord:join(b.outputRoot,'RESOURCES.json'),bounds:b.bounds},null,2)+'\n',{flag:'wx'});const filePin=await pin(fileBinding);
const timer=setInterval(()=>sample('during'),1000);let ancestryFailure=null;const during=new Promise(resolve=>setTimeout(()=>ancestry('during').then(x=>{ancestryFailure=x;resolve();}),1000));let result=null,commandFailure=null;
try{result=await commandRecorder(b.outputRoot,{environment:b.command.environment,timeoutMs:b.bounds.timeoutMs,maxOutputBytes:b.bounds.outputBytes})('own01',b.node.path,[b.fileHost.path,fileBinding,filePin.sha256],{cwd:b.cwd});}catch(e){commandFailure=String(e?.stack??e);}finally{clearInterval(timer);await during;sample('after');}
const postAncestryFailure=await ancestry('after');await save('HOST_OBSERVATIONS.json',{samples:hostSamples,ancestryFailure,postAncestryFailure,quietHostClaim:false});
let bytes=null,readFailure=null;try{bytes=await readFile(join(b.outputRoot,'events.jsonl'));}catch(e){readFailure=String(e);}const evidence=parseUnitReporter(bytes,b.bounds.outputBytes);let conservationFailure=null;try{for(const p of [b.sourceFreeze,b.completedStage,b.stageManifest,...b.materialPins])await checked(p);}catch(e){conservationFailure=String(e);}
let ownerObservations=null,ownerObservationFailure=null,ownerObservationLines=[];
try{assert(typeof result?.stdout==='string','command stdout unavailable');assert.equal(b.finalObservationDiagnostic.marker,'RC9_OWN01_OBSERVATIONS ');assert.equal(b.finalObservationDiagnostic.required,true);
  ownerObservationLines=result.stdout.split(/\r?\n/u).filter(line=>line.includes(b.finalObservationDiagnostic.marker));assert.equal(ownerObservationLines.length,1,'one final OWN diagnostic required');
  const line=ownerObservationLines[0];ownerObservations=JSON.parse(line.slice(line.indexOf(b.finalObservationDiagnostic.marker)+b.finalObservationDiagnostic.marker.length));
  assert(ownerObservations&&typeof ownerObservations==='object'&&!Array.isArray(ownerObservations),'OWN diagnostic must be a JSON object');for(const key of b.finalObservationDiagnostic.requiredObjectKeys)assert(Object.hasOwn(ownerObservations,key),'missing OWN observation '+key);
}catch(e){ownerObservationFailure=String(e);}
await save('OWN01_OBSERVATIONS.json',{marker:b.finalObservationDiagnostic.marker,lines:ownerObservationLines,observations:ownerObservations,failure:ownerObservationFailure,standing:'Existing final test diagnostic; no counter reinterpretation or additional acceptance claim.'});
let resources=null;try{resources=JSON.parse(await readFile(join(b.outputRoot,'RESOURCES.json'),'utf8'));}catch{}
const cases=evidence.rows.filter(r=>r.type==='case'),counts=evidence.counts;const passed=result?.exitCode===0&&!result.signal&&!result.failure&&!result.timedOut&&!result.truncated&&!commandFailure&&evidence.complete&&evidence.summary?.success===true&&counts?.tests===b.expectedCases&&counts.passed===b.expectedCases&&counts.failed===0&&counts.cancelled===0&&counts.skipped===0&&counts.todo===0&&cases.length===b.expectedCases&&cases.every(r=>r.file===b.testFile&&!r.skip&&!r.todo)&&!ancestryFailure&&!postAncestryFailure&&!conservationFailure&&resources?.status==='CHILD_CLOSED'&&resources.monitorFailure===null&&!ownerObservationFailure;
await save('RESULT.json',{status:passed?'OWN_PROOF_PASSED':evidence.complete&&counts?.failed>0?'OWN_PROOF_FAILED':'OWN_PROOF_INCOMPLETE',counts,ownerObservationFailure,ownerObservations:await pin(join(b.outputRoot,'OWN01_OBSERVATIONS.json')),skips:evidence.skips,reporterComplete:evidence.complete,parseFailure:readFailure??evidence.parseFailure,command:result?{exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure,wallMs:result.wallMs}:null,commandFailure,conservationFailure,ancestryFailure,postAncestryFailure,reporter:bytes===null?null:await pin(join(b.outputRoot,'events.jsonl')),sourceDigest:b.sourceDigest,wholeFile:passed,originalUnitStanding:'FAILED/INCOMPLETE_UNCHANGED',sourceAcceptance:false,standing:'Actual complete OWN outcome and final observation status recorded before success assertion. No automatic retry or source acceptance. Original unit remains incomplete; M5 residual and bootstrap/broad conjunction remain Root-owned.'});
if(!passed)process.exitCode=1;
