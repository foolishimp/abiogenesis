//006 successor: same command owner/group, plus64MiB profile collection observation.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,lstat,readdir,statfs} from 'node:fs/promises';
import {dirname,join} from 'node:path';
const [path,sha]=process.argv.slice(2),raw=await readFile(path);assert.equal(createHash('sha256').update(raw).digest('hex'),sha);const b=JSON.parse(raw);
async function size(p){let s;try{s=await lstat(p);}catch(e){if(e.code==='ENOENT')return 0;throw e;}if(s.isSymbolicLink())return 0;if(s.isFile())return s.size;
  let n=0;for(const v of await readdir(p))try{n+=await size(join(p,v));}catch(e){if(e.code!=='ENOENT')throw e;}return n;}
assert.equal(b.bounds.profileBytes,67108864);assert.equal(b.profileRoot,join(b.outputRoot,'profiles'));
const samples=[];let maxOwnedBytes=0,maxProfileBytes=0,minFreeBytes=Infinity,stopping=false,busy=false,monitorFailure=null,childOutcome=null;
async function sample(){const s=await statfs(b.outputRoot),r={at:new Date().toISOString(),freeBytes:s.bavail*s.bsize,ownedBytes:await size(b.outputRoot)+await size(b.scratchRoot),profileBytes:await size(b.profileRoot)};
  maxProfileBytes=Math.max(maxProfileBytes,r.profileBytes);maxOwnedBytes=Math.max(maxOwnedBytes,r.ownedBytes);minFreeBytes=Math.min(minFreeBytes,r.freeBytes);samples.push(r);return r;}
async function save(status){await mkdir(dirname(b.resourceRecord),{recursive:true});await writeFile(b.resourceRecord,JSON.stringify({status,samples,maxOwnedBytes,maxProfileBytes,minFreeBytes,childOutcome,
  monitorFailure,overshootPossible:true,quotaEnforced:false,detachedDescendantAbsenceProven:false},null,2)+'\n',{flag:'wx'});}
async function stop(reason){if(stopping)return;stopping=true;monitorFailure=reason;await save('RESOURCE_OPERATIONAL_STOP');
  // commandRecorder starts this host as the group leader. Preserve its raw return; stop only this owned group.
  process.on('SIGTERM',()=>{});try{process.kill(-process.pid,'SIGTERM');}catch{}
  setTimeout(()=>{try{process.kill(-process.pid,'SIGKILL');}catch{}},2000);
}
const first=await sample();if(first.freeBytes<b.bounds.reserveBytes||first.ownedBytes>b.bounds.maxOwnedBytes||first.profileBytes>b.bounds.profileBytes){await save('RESOURCE_PREFLIGHT_REFUSAL');process.exitCode=2;}
else{
  const child=spawn(b.executable,b.args,{cwd:b.cwd,env:process.env,stdio:'inherit'});
  const closed=new Promise(resolve=>{child.on('error',e=>resolve({exitCode:1,error:String(e)}));child.on('close',(exitCode,signal)=>resolve({exitCode,signal}));});
  await writeFile(join(b.outputRoot,'FILE_CHILD_STARTED.json'),JSON.stringify({at:new Date().toISOString(),fileHostPid:process.pid,testRunnerPid:child.pid??null,executable:b.executable,args:b.args,cwd:b.cwd},null,2)+'\n',{flag:'wx'});
  const timer=setInterval(async()=>{if(busy||stopping)return;busy=true;try{const r=await sample();if(r.freeBytes<b.bounds.reserveBytes||r.ownedBytes>b.bounds.maxOwnedBytes||r.profileBytes>b.bounds.profileBytes)await stop('monitored disk/profile bound');}
    catch(e){await stop(String(e));}finally{busy=false;}},b.bounds.pollMs);
  const result=await closed;
  childOutcome=result;clearInterval(timer);while(busy)await new Promise(r=>setTimeout(r,20));
  if(!stopping){const last=await sample();const over=last.freeBytes<b.bounds.reserveBytes||last.ownedBytes>b.bounds.maxOwnedBytes||last.profileBytes>b.bounds.profileBytes;monitorFailure=result.error??(over?'disk/profile bound exceeded at child close':null);await save(over?'RESOURCE_CLOSED_OVER_BOUND':'CHILD_CLOSED');process.exitCode=over?2:result.exitCode??1;}
}
