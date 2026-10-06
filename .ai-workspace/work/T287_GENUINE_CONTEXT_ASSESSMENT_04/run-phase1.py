from pathlib import Path
import os, subprocess, time, signal, json, hashlib
R=Path('/Users/jim/src/apps/abiogenesis'); W=R/'.ai-workspace/work/T287_GENUINE_CONTEXT_ASSESSMENT_04'
node=R/'.ai-workspace/work/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/toolchain/bin/node'
env=os.environ.copy()
for key in list(env):
 if key.startswith('ABG_TS_CLAUDE_') or key.startswith('ABI5_GENUINE_') or key=='NODE_OPTIONS': del env[key]
env.update({'PATH':str(node.parent)+':/usr/bin:/bin:/usr/sbin:/sbin','TMPDIR':str(R/'.ai-workspace/work/T287_CONTEXT_CONSERVATION_02/tmp'), 'NODE_COMPILE_CACHE':str(W/'tmp/node-compile-cache'),'ABI5_GENUINE_ROOT':str(W),'ABI5_GENUINE_MODE':'prepare'})
assert env['HOME']=='/Users/jim';(W/'tmp').mkdir(exist_ok=True)
command=[str(node),str(W/'consumer/genuine-pilot.mjs')]
started=time.monotonic();timed=False
with (W/'phase1.stdout').open('xb') as stdout, (W/'phase1.stderr').open('xb') as stderr:
 proc=subprocess.Popen(command,cwd=W/'consumer',env=env,stdout=stdout,stderr=stderr,start_new_session=True)
 while True:
  pid,status,usage=os.wait4(proc.pid,os.WNOHANG)
  if pid:break
  if time.monotonic()-started>120:
   timed=True;os.killpg(proc.pid,signal.SIGTERM);time.sleep(0.25)
   try:os.killpg(proc.pid,signal.SIGKILL)
   except ProcessLookupError:pass
   pid,status,usage=os.wait4(proc.pid,0);break
  time.sleep(0.05)
 proc.returncode=os.waitstatus_to_exitcode(status)
try:os.killpg(proc.pid,0);groupAbsent=False
except ProcessLookupError:groupAbsent=True
if not groupAbsent:
 os.killpg(proc.pid,signal.SIGKILL)
 try:os.killpg(proc.pid,0);groupAbsent=False
 except ProcessLookupError:groupAbsent=True
row={'activation':'T287_GENUINE_CONTEXT_ASSESSMENT_04','phase':'phase1_preparation_only','command':command,'cwd':str(W/'consumer'),'capSeconds':120,'HOMEUnchanged':True,'defaultHeap':True,'environment':{k:env[k] for k in ['PATH','TMPDIR','NODE_COMPILE_CACHE','ABI5_GENUINE_ROOT','ABI5_GENUINE_MODE']},'pid':proc.pid,'pgid':proc.pid,'exitCode':proc.returncode,'timedOut':timed,'wait4Reaped':True,'groupAbsent':groupAbsent,'elapsedMs':(time.monotonic()-started)*1000,'maxRSSPlatformBytes':usage.ru_maxrss,'userCPUSeconds':usage.ru_utime,'systemCPUSeconds':usage.ru_stime,'nativeDispatches':0,'cliInvocations':0,'providerCalls':0}
for name in ['stdout','stderr']:
 b=(W/('phase1.'+name)).read_bytes();row[name+'Bytes']=len(b);row[name+'SHA256']=hashlib.sha256(b).hexdigest()
with (W/'phase1-process.json').open('x') as out:json.dump(row,out,indent=2);out.write('\n')
print(json.dumps(row,indent=2))
