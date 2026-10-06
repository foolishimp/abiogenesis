from pathlib import Path
import hashlib,json,os,signal,subprocess,sys,time
root=Path(__file__).resolve().parent
repo=Path('/Users/jim/src/apps/abiogenesis')
node=repo/'.ai-workspace/work/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/toolchain/bin/node'
label=sys.argv[1]
assert label in ['flow','cold']
assert not (root/(label+'.json')).exists()
activation=json.loads((root/'activation.json').read_text())
output=root if label=='flow' else root/'fresh'
if label=='cold':
 with (output/'activation.json').open('x') as f:json.dump({'activation':root.name,'effect':'six pure Public reads','inputOwner':str(root),'controlledTransport':True,'realProviderCalls':0},f);f.write('\n')
env=dict(os.environ)
for key in ['NODE_OPTIONS','NODE_PATH','V8_OPTIONS']:env.pop(key,None)
for key in list(env):
 if key.startswith('ABI5_INSTALLED_CONSERVATION_') or key.startswith('ABG_TS_CLAUDE_'):env.pop(key)
env.update(PATH=str(node.parent)+':/usr/bin:/bin:/usr/sbin:/sbin',TMPDIR=str(root/'tmp'),NODE_COMPILE_CACHE=str(root/'tmp/node-compile-cache'),
 ABI5_INSTALLED_CONSERVATION_ROOT=str(output),ABI5_INSTALLED_CONSERVATION_PACKAGE_ROOT=activation['packageRoot'],
 ABI5_INSTALLED_CONSERVATION_ARCHIVE=activation['acceptedPackage']['path'],ABI5_INSTALLED_CONSERVATION_ARCHIVE_DIGEST='sha256:'+activation['acceptedPackage']['sha256'],
 ABI5_INSTALLED_CONSERVATION_NODE=str(node),ABI5_INSTALLED_CONSERVATION_MODE=label,
 ABI5_INSTALLED_CONSERVATION_FIXTURE_ROOT=activation['fixtureOwnerRoot'],ABI5_INSTALLED_CONSERVATION_EVIDENCE_ROOT=str(repo/'.ai-workspace/evidence'/root.name))
if label=='cold':env.update(ABI5_INSTALLED_CONSERVATION_ORIGINAL_ROOT=str(root),ABI5_INSTALLED_CONSERVATION_HANDOFF=str(root/'af22-handoff.json'))
assert env.get('HOME')=='/Users/jim'
command=[str(node),'--test','--test-concurrency=1',str(root/'consumer/test_env/tests/t287-installed-qualification-conservation.test.mjs')]
record={'activation':root.name,'label':label,'command':command,'cwd':str(root/'consumer'),'capSeconds':300 if label=='flow' else 180,
 'HOMEUnchanged':True,'defaultHeap':True,'controlledTransport':True,'providerCalls':0,
 'environment':{key:env[key] for key in ['PATH','TMPDIR','NODE_COMPILE_CACHE']}}
record['environment'].update({k:v for k,v in env.items() if k.startswith('ABI5_INSTALLED_CONSERVATION_')})
start=time.perf_counter()
with (root/(label+'.stdout')).open('xb') as stdout,(root/(label+'.stderr')).open('xb') as stderr:
 child=subprocess.Popen(command,cwd=record['cwd'],env=env,stdout=stdout,stderr=stderr,start_new_session=True)
 record['pid']=record['pgid']=child.pid;timed_out=False
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
