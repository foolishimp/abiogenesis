from pathlib import Path
import hashlib,json,os,signal,subprocess,sys,time
D=Path(__file__).resolve().parent
activation=json.loads((D/'activation.json').read_text())
node=Path(activation['pinnedNode'])
label=sys.argv[1]
spec=json.loads((D/'commands.json').read_text())[label]
assert not (D/(label+'-process.json')).exists()
env=dict(os.environ)
for k in ['NODE_OPTIONS','NODE_PATH','V8_OPTIONS']:env.pop(k,None)
for k in list(env):
 if k.lower().startswith('npm_config_'):env.pop(k)
env.update(PATH=str(node.parent)+':/usr/bin:/bin:/usr/sbin:/sbin',TMPDIR=str(D/'tmp'),NODE_COMPILE_CACHE=str(D/'tmp/node-compile-cache'),ABI5_INSTALLED_CONSERVATION_ROOT=str(D),ABI5_INSTALLED_CONSERVATION_PACKAGE_ROOT=str(D/'consumer/node_modules/@abiogenesis/typescript-tenant'),ABI5_INSTALLED_CONSERVATION_ARCHIVE=next(p['path'] for p in activation['inputs'] if p['path'].endswith('.tgz')),ABI5_INSTALLED_CONSERVATION_NODE=str(node),ABI5_INSTALLED_CONSERVATION_MODE=spec['mode'])
assert env.get('HOME')==activation['HOME']=='/Users/jim'
record={'operation':D.name,'command':spec['command'],'cwd':str(D/'consumer'),'capSeconds':180,'HOMEUnchanged':True,'defaultHeap':True,'environment':{k:env[k] for k in ['PATH','TMPDIR','NODE_COMPILE_CACHE','ABI5_INSTALLED_CONSERVATION_ROOT','ABI5_INSTALLED_CONSERVATION_PACKAGE_ROOT','ABI5_INSTALLED_CONSERVATION_ARCHIVE','ABI5_INSTALLED_CONSERVATION_NODE','ABI5_INSTALLED_CONSERVATION_MODE']}}
start=time.perf_counter()
with (D/(label+'.stdout')).open('xb') as out,(D/(label+'.stderr')).open('xb') as err:
 p=subprocess.Popen(record['command'],cwd=record['cwd'],env=env,stdout=out,stderr=err,start_new_session=True)
 record['pid']=record['pgid']=p.pid
 (D/(label+'-process-start.json')).write_text(json.dumps(record,indent=2)+'\n')
 timed=False
 while True:
  pid,status,usage=os.wait4(p.pid,os.WNOHANG)
  if pid:break
  if time.perf_counter()-start>180:
   timed=True;os.killpg(p.pid,signal.SIGKILL);pid,status,usage=os.wait4(p.pid,0);break
  time.sleep(.05)
 p.returncode=os.waitstatus_to_exitcode(status)
try:os.killpg(p.pid,0);absent=False
except ProcessLookupError:absent=True
record.update(exitCode=p.returncode,timedOut=timed,wait4Reaped=True,groupAbsent=absent,elapsedMs=(time.perf_counter()-start)*1000,maxRSSPlatformBytes=usage.ru_maxrss,userCPUSeconds=usage.ru_utime,systemCPUSeconds=usage.ru_stime)
for stream in ['stdout','stderr']:
 b=(D/(label+'.'+stream)).read_bytes();record[stream+'Bytes']=len(b);record[stream+'SHA256']=hashlib.sha256(b).hexdigest()
(D/(label+'-process.json')).write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps({k:record[k] for k in ['operation','exitCode','timedOut','wait4Reaped','groupAbsent','elapsedMs','maxRSSPlatformBytes','stdoutBytes','stderrBytes']}))
sys.exit(0 if p.returncode==0 and absent else 1)
