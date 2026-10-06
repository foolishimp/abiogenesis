from pathlib import Path
import hashlib,json,os,signal,subprocess,sys,time
root=Path(__file__).resolve().parent
repo=Path('/Users/jim/src/apps/abiogenesis')
node=repo/'.ai-workspace/work/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/toolchain/bin/node'
stage=root/'stage/build_tenants/abiogenesis/typescript'
label=sys.argv[1]
spec=json.loads((root/'commands.json').read_text())[label]
assert label in ['pack','verification','packed','capability']
assert not (root/(label+'.json')).exists()
env=dict(os.environ)
for key in ['NODE_OPTIONS','NODE_PATH','V8_OPTIONS']:env.pop(key,None)
for key in list(env):
 if key.lower().startswith('npm_config_') or key.startswith('ABI5_INSTALLED_CONSERVATION_'):env.pop(key)
env.update(PATH=str(node.parent)+':/usr/bin:/bin:/usr/sbin:/sbin',TMPDIR=str(root/'tmp'),NODE_COMPILE_CACHE=str(root/'tmp/node-compile-cache'),
 npm_config_cache=str(root/'npm-cache'),npm_config_userconfig=str(root/'npmrc'),npm_config_globalconfig=str(root/'globalnpmrc'),npm_config_prefix=str(root/'npm-prefix'),
 npm_config_offline='true',npm_config_ignore_scripts='true',npm_config_audit='false',npm_config_fund='false',npm_config_update_notifier='false',
 ABI5_PUBLIC_PREPARATION_PACKAGE_ROOT=str(root/'consumer/node_modules/@abiogenesis/typescript-tenant'),
 ABI5_PUBLIC_GROUPS_PACKAGE_ROOT=str(root/'consumer/node_modules/@abiogenesis/typescript-tenant'),ABI5_PUBLIC_GROUPS_BASELINE=str(root/'baseline.json'))
assert env.get('HOME')=='/Users/jim'
record={'activation':root.name,'label':label,'command':spec['command'],'cwd':spec.get('cwd',str(stage)),
 'capSeconds':spec.get('capSeconds',240),'HOMEUnchanged':True,'defaultHeap':True,'nativeEffects':False,'modelEffects':False,
 'environment':{key:env[key] for key in ['PATH','TMPDIR','NODE_COMPILE_CACHE','ABI5_PUBLIC_PREPARATION_PACKAGE_ROOT','ABI5_PUBLIC_GROUPS_PACKAGE_ROOT','ABI5_PUBLIC_GROUPS_BASELINE']}}
start=time.perf_counter()
with (root/(label+'.stdout')).open('xb') as stdout,(root/(label+'.stderr')).open('xb') as stderr:
 child=subprocess.Popen(record['command'],cwd=record['cwd'],env=env,stdout=stdout,stderr=stderr,start_new_session=True)
 record['pid']=record['pgid']=child.pid
 timed_out=False
 while True:
  pid,status,usage=os.wait4(child.pid,os.WNOHANG)
  if pid:break
  if time.perf_counter()-start>record['capSeconds']:
   timed_out=True;os.killpg(child.pid,signal.SIGKILL);pid,status,usage=os.wait4(child.pid,0);break
  time.sleep(.05)
 child.returncode=os.waitstatus_to_exitcode(status)
try:os.killpg(child.pid,0);group_absent=False
except ProcessLookupError:group_absent=True
record.update(exitCode=child.returncode,timedOut=timed_out,wait4Reaped=True,groupAbsent=group_absent,
 elapsedMs=(time.perf_counter()-start)*1000,maxRSSPlatformBytes=usage.ru_maxrss,userCPUSeconds=usage.ru_utime,systemCPUSeconds=usage.ru_stime)
for stream in ['stdout','stderr']:
 body=(root/(label+'.'+stream)).read_bytes();record[stream+'Bytes']=len(body);record[stream+'SHA256']=hashlib.sha256(body).hexdigest()
with (root/(label+'.json')).open('x') as f:json.dump(record,f,separators=(',',':'));f.write('\n')
print(json.dumps({key:record[key] for key in ['activation','label','exitCode','timedOut','wait4Reaped','groupAbsent','elapsedMs','maxRSSPlatformBytes','stdoutBytes','stderrBytes']}))
sys.exit(0 if child.returncode==0 and group_absent else 1)
