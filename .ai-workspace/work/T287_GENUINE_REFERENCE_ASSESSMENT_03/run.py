from pathlib import Path
import hashlib,json,os,signal,subprocess,sys,time

root=Path(__file__).resolve().parent
repo=Path('/Users/jim/src/apps/abiogenesis')
node=repo/'.ai-workspace/work/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/toolchain/bin/node'
label=sys.argv[1]
assert label in ['main','cold']
output=root if label=='main' else root/'fresh'
output.mkdir(exist_ok=True)
if label=='cold':
 with (output/'activation.json').open('x') as f:
  json.dump({'activation':root.name,'effect':'four pure Public reads in separate process','inputOwner':str(root),'genuineSubject':True},f)
  f.write('\n')
assert not (root/(label+'.json')).exists()
env=dict(os.environ)
for key in ['NODE_OPTIONS','NODE_PATH','V8_OPTIONS']:
 env.pop(key,None)
env.update(PATH=str(node.parent)+':'+env.get('PATH',''),TMPDIR=str(repo/'.ai-workspace/work/T287_INSTALLED_CONSERVATION_SUCCESSOR_01/tmp'),
 NODE_COMPILE_CACHE=str(root/'tmp/node-compile-cache'),ABI5_GENUINE_ROOT=str(output),ABI5_GENUINE_INPUT_ROOT=str(root),ABI5_GENUINE_MODE=label,
 ABG_TS_CLAUDE_COMMAND='/Users/jim/.local/bin/claude',ABG_TS_FP_TIMEOUT_MS='120000',ABG_TS_FP_ABSOLUTE_TIMEOUT_MS='360000',ABG_TS_FP_TERMINATION_GRACE_MS='1000')
assert env['HOME']=='/Users/jim'
command=[str(node),str(root/'consumer/genuine-pilot.mjs')]
record={'activation':root.name,'phase':label,'command':command,'cwd':str(root/'consumer'),'capSeconds':600 if label=='main' else 180,
 'HOMEUnchanged':True,'defaultHeap':True,'modelOverride':False,'controlledTransport':False,'environment':{key:env[key] for key in
 ['TMPDIR','NODE_COMPILE_CACHE','ABI5_GENUINE_ROOT','ABI5_GENUINE_INPUT_ROOT','ABI5_GENUINE_MODE','ABG_TS_CLAUDE_COMMAND','ABG_TS_FP_TIMEOUT_MS','ABG_TS_FP_ABSOLUTE_TIMEOUT_MS']}}
start=time.perf_counter()
with (root/(label+'.stdout')).open('xb') as stdout,(root/(label+'.stderr')).open('xb') as stderr:
 child=subprocess.Popen(command,cwd=record['cwd'],env=env,stdout=stdout,stderr=stderr,start_new_session=True)
 record['pid']=record['pgid']=child.pid
 timed_out=False
 while True:
  pid,status,usage=os.wait4(child.pid,os.WNOHANG)
  if pid:break
  if time.perf_counter()-start>record['capSeconds']:
   timed_out=True;os.killpg(child.pid,signal.SIGKILL);pid,status,usage=os.wait4(child.pid,0);break
  time.sleep(.05)
 child.returncode=os.waitstatus_to_exitcode(status)
try:
 os.killpg(child.pid,0);group_absent=False
except ProcessLookupError:group_absent=True
record.update(exitCode=child.returncode,timedOut=timed_out,wait4Reaped=True,groupAbsent=group_absent,
 elapsedMs=(time.perf_counter()-start)*1000,maxRSSPlatformBytes=usage.ru_maxrss,
 userCPUSeconds=usage.ru_utime,systemCPUSeconds=usage.ru_stime)
for stream in ['stdout','stderr']:
 body=(root/(label+'.'+stream)).read_bytes()
 record[stream+'Bytes']=len(body);record[stream+'SHA256']=hashlib.sha256(body).hexdigest()
with (root/(label+'.json')).open('x') as f:json.dump(record,f,separators=(',',':'));f.write('\n')
print(json.dumps({key:record[key] for key in ['activation','phase','exitCode','timedOut','wait4Reaped','groupAbsent','elapsedMs','maxRSSPlatformBytes','stdoutBytes','stderrBytes']}))
sys.exit(0 if child.returncode==0 and group_absent else 1)
