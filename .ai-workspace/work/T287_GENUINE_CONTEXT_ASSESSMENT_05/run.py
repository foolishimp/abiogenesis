from pathlib import Path
import os,subprocess,time,signal,json,hashlib,sys
R=Path('/Users/jim/src/apps/abiogenesis');W=R/'.ai-workspace/work/T287_GENUINE_CONTEXT_ASSESSMENT_05';P=W/'flow';node=R/'.ai-workspace/work/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/toolchain/bin/node'
label=sys.argv[1];assert label in ['flow','cold']
output=P if label=='flow' else W/'fresh';output.mkdir(exist_ok=True)
inputRoot=R/'.ai-workspace/work/T287_GENUINE_CONTEXT_ASSESSMENT_04' if label=='flow' else P
cap=600 if label=='flow' else 180
env=os.environ.copy()
for key in list(env):
 if key.startswith('ABG_TS_CLAUDE_') or key.startswith('ABI5_GENUINE_') or key=='NODE_OPTIONS':del env[key]
env.update({'PATH':str(node.parent)+':/usr/bin:/bin:/usr/sbin:/sbin','TMPDIR':str(R/'.ai-workspace/work/T287_CONTEXT_CONSERVATION_02/tmp'),'NODE_COMPILE_CACHE':str(P/'tmp/node-compile-cache'),'ABI5_GENUINE_ROOT':str(output),'ABI5_GENUINE_INPUT_ROOT':str(inputRoot),'ABI5_GENUINE_MODE':label,'ABG_TS_CLAUDE_COMMAND':'/Users/jim/.local/bin/claude','ABG_TS_CLAUDE_APPEND_ARGS':'["--system-prompt","."]','ABG_TS_FP_TIMEOUT_MS':'120000','ABG_TS_FP_ABSOLUTE_TIMEOUT_MS':'360000','ABG_TS_FP_TERMINATION_GRACE_MS':'1000'})
assert env['HOME']=='/Users/jim';(P/'tmp').mkdir(exist_ok=True)
command=[str(node),str(W/'consumer/genuine-pilot.mjs')];start=time.perf_counter();timed=False
with (P/(label+'.stdout')).open('xb') as out,(P/(label+'.stderr')).open('xb') as err:
 proc=subprocess.Popen(command,cwd=W/'consumer',env=env,stdout=out,stderr=err,start_new_session=True)
 while True:
  pid,status,usage=os.wait4(proc.pid,os.WNOHANG)
  if pid:break
  if time.perf_counter()-start>cap:
   timed=True;os.killpg(proc.pid,signal.SIGTERM);time.sleep(1)
   try:os.killpg(proc.pid,signal.SIGKILL)
   except ProcessLookupError:pass
   pid,status,usage=os.wait4(proc.pid,0);break
  time.sleep(.1)
 proc.returncode=os.waitstatus_to_exitcode(status)
try:os.killpg(proc.pid,0);groupAbsent=False
except ProcessLookupError:groupAbsent=True
if not groupAbsent:
 os.killpg(proc.pid,signal.SIGKILL);time.sleep(.2)
 try:os.killpg(proc.pid,0);groupAbsent=False
 except ProcessLookupError:groupAbsent=True
row={'activation':'T287_GENUINE_CONTEXT_ASSESSMENT_05','phase':'phase2_'+label,'command':command,'cwd':str(W/'consumer'),'capSeconds':cap,'HOMEUnchanged':True,'defaultHeap':True,'environment':{k:env[k] for k in ['PATH','TMPDIR','NODE_COMPILE_CACHE','ABI5_GENUINE_ROOT','ABI5_GENUINE_INPUT_ROOT','ABI5_GENUINE_MODE','ABG_TS_CLAUDE_COMMAND','ABG_TS_CLAUDE_APPEND_ARGS','ABG_TS_FP_TIMEOUT_MS','ABG_TS_FP_ABSOLUTE_TIMEOUT_MS','ABG_TS_FP_TERMINATION_GRACE_MS']},'pid':proc.pid,'pgid':proc.pid,'exitCode':proc.returncode,'timedOut':timed,'wait4Reaped':True,'groupAbsent':groupAbsent,'elapsedMs':(time.perf_counter()-start)*1000,'maxRSSPlatformBytes':usage.ru_maxrss,'userCPUSeconds':usage.ru_utime,'systemCPUSeconds':usage.ru_stime,'controlledTransport':False,'realHttpRequestCount':'unknown unless observed in actual CLI transport','frozenPhase1InputRoot':str(R/'.ai-workspace/work/T287_GENUINE_CONTEXT_ASSESSMENT_04')}
for name in ['stdout','stderr']:
 b=(P/(label+'.'+name)).read_bytes();row[name+'Bytes']=len(b);row[name+'SHA256']=hashlib.sha256(b).hexdigest()
with (P/(label+'-process.json')).open('x') as f:json.dump(row,f,indent=2);f.write('\n')
print(json.dumps(row,indent=2))
