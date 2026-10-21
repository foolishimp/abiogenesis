import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, realpath } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const json=(x)=>JSON.stringify(x,(_k,v)=>typeof v==='bigint'?v.toString():v,2)+'\n';
const write=(name,x)=>writeFile(join(root,name),json(x),{flag:'wx'});
const errorValue=(e)=>e==null?null:{name:e.name,message:e.message,stack:e.stack,code:e.code,errno:e.errno,syscall:e.syscall};
const key='test';assert.equal(process.argv[2],key);
const freeze=JSON.parse(await readFile(join(root,'preexecution-freeze.json'),'utf8'));
for(const row of freeze.files){const b=await readFile(join(root,row.path));assert.equal(b.length,row.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),row.sha256,row.path);}
const config=JSON.parse(await readFile(join(root,'configuration.json'),'utf8'));
const environment=JSON.parse(await readFile(join(root,'environment.json'),'utf8'));
const launch=JSON.parse(await readFile(join(root,'launches.json'),'utf8'))[key];
assert.equal(process.execPath,config.nodeExecutable);
assert.equal(config.effectGrant,'P5_INSTALLED_EXECUTION_GRANTED_BY_EXECUTIVE');
const physical=dirname(config.scratchParent);
const bootstrap=JSON.parse(await readFile(join(root,'reused-bootstrap.json'),'utf8'));
assert.equal(bootstrap.host,config.installHost);assert.equal(bootstrap.readOnly,true);
for(const row of bootstrap.sourcePins){const bytes=await readFile(row.path);assert.equal(bytes.length,row.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256,row.path);}
assert.equal(JSON.parse(await readFile(bootstrap.priorInstallReceipt.path,'utf8')).success,true);
await mkdir(physical);assert.equal(await realpath(physical),physical);
for(const path of [config.scratchParent,environment.npm_config_cache,environment.npm_config_logs_dir])await mkdir(path);
assert.deepEqual(await readdir(environment.npm_config_cache),[]);
await write('physical-root-acquisition.json',{physical,scratchParent:config.scratchParent,evidenceRoot:config.evidenceRoot,cache:environment.npm_config_cache,cacheInitiallyEmpty:true,evidenceInitiallyAbsent:true,retained:true,reusedBootstrapHost:config.installHost,newBootstrapInstallCount:0});

const {createOwnedProcessLifetime,createMonotonicDeadline}=await import(pathToFileURL(launch.lifetimeModule).href);
assert.equal(typeof createOwnedProcessLifetime,'function');assert.equal(typeof createMonotonicDeadline,'function');
const startedAt=new Date().toISOString(),start=performance.now();
await write(`commands/${key}.input.json`,{launch,environment,startedAt,supervisorPid:process.pid,configurationPath:join(root,'configuration.json'),detached:process.platform!=='win32'});
let child;
try{child=spawn(launch.executable,launch.args,{cwd:launch.cwd,env:environment,detached:process.platform!=='win32',stdio:['pipe','pipe','pipe']});}
catch(error){await write(`commands/${key}.spawn-failure.json`,{error:errorValue(error),startedAt});throw error;}
const stdout=[],stderr=[],events=[];let timedOut=false;const deadline=createMonotonicDeadline();
const lifetime=createOwnedProcessLifetime(child,{terminationGraceMs:launch.terminationGraceMs},{onSpawn:(pid)=>events.push({kind:'spawn',pid,atMs:performance.now()-start}),onError:(e)=>events.push({kind:'child_error',error:errorValue(e)}),onExit:(status,signal)=>{deadline.cancel();events.push({kind:'exit',status,signal,atMs:performance.now()-start});},onSignalRequested:(signal)=>events.push({kind:'signal_requested',signal,atMs:performance.now()-start}),onUnconfirmed:()=>events.push({kind:'unconfirmed',atMs:performance.now()-start})});
const onOut=(b)=>lifetime.observe(()=>stdout.push(Buffer.from(b))),onErr=(b)=>lifetime.observe(()=>stderr.push(Buffer.from(b)));
child.stdout.on('data',onOut);child.stderr.on('data',onErr);child.once('close',(status,signal)=>events.push({kind:'close',status,signal,atMs:performance.now()-start}));
let facts;
try{
  await write(`commands/${key}.process.json`,{pid:child.pid??null,groupId:process.platform==='win32'?null:child.pid??null,supervisorPid:process.pid,startedAt});
  deadline.after(launch.timeoutMs,()=>{timedOut=true;lifetime.requestTermination();});
  child.stdin.end();
}catch(error){lifetime.fail(error);}
finally{facts=await lifetime.completion;deadline.cancel();child.stdout.off('data',onOut);child.stderr.off('data',onErr);}
const out=Buffer.concat(stdout),err=Buffer.concat(stderr);
await writeFile(join(root,`commands/${key}.stdout`),out,{flag:'wx'});await writeFile(join(root,`commands/${key}.stderr`),err,{flag:'wx'});
const success=!timedOut&&facts.firstError===null&&facts.launchFailure===null&&facts.scopeAbsence==='absent'&&facts.directExit?.status===0&&facts.directExit.signal===null&&facts.closeObserved&&facts.streamsDisposed;
const result={key,startedAt,completedAt:new Date().toISOString(),wallMs:performance.now()-start,pid:child.pid??null,groupId:process.platform==='win32'?null:child.pid??null,supervisorPid:process.pid,timedOut,events,facts:{...facts,firstError:errorValue(facts.firstError),launchFailure:errorValue(facts.launchFailure)},stdout:{bytes:out.length,sha256:createHash('sha256').update(out).digest('hex')},stderr:{bytes:err.length,sha256:createHash('sha256').update(err).digest('hex')},success,physicalAbsenceIsNotAdmission:true};
await write(`commands/${key}.completion.json`,result);
console.log(json({key,success,pid:result.pid,wallMs:result.wallMs,exit:facts.directExit,scopeAbsence:facts.scopeAbsence,closeObserved:facts.closeObserved,stdout:result.stdout,stderr:result.stderr}));
if(!success)process.exitCode=1;
