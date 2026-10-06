from pathlib import Path
import hashlib,json,os,signal,subprocess,sys,time
D=Path(__file__).resolve().parent
node=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/toolchain/bin/node')
stage=D/'stage/build_tenants/abiogenesis/typescript'
config=json.loads((D/'commands.json').read_text());label=sys.argv[1];spec=config[label]
assert not (D/(label+'.json')).exists()
env=dict(os.environ)
for k in ['NODE_OPTIONS','NODE_PATH','V8_OPTIONS']:env.pop(k,None)
for k in list(env):
 if k.lower().startswith('npm_config_'):env.pop(k)
env.update(PATH=str(node.parent)+':/usr/bin:/bin:/usr/sbin:/sbin',TMPDIR=str(D/'tmp'),NODE_COMPILE_CACHE=str(D/'tmp/node-compile-cache'),npm_config_cache=str(D/'npm-cache'),npm_config_userconfig=str(D/'npmrc'),npm_config_globalconfig=str(D/'globalnpmrc'),npm_config_prefix=str(D/'npm-prefix'),npm_config_offline='true',npm_config_ignore_scripts='true',npm_config_audit='false',npm_config_fund='false',npm_config_update_notifier='false',ABI5_PUBLIC_PREPARATION_PACKAGE_ROOT=str(D/'consumer/node_modules/@abiogenesis/typescript-tenant'),ABI5_PUBLIC_GROUPS_PACKAGE_ROOT=str(D/'consumer/node_modules/@abiogenesis/typescript-tenant'),ABI5_PUBLIC_GROUPS_BASELINE=str(D/'baseline.json'))
if 'mode' in spec:
 activation=json.loads((D/'activation.json').read_text())
 for k in list(env):
  if k.startswith('ABI5_INSTALLED_CONSERVATION_'):env.pop(k)
 env.update(ABI5_INSTALLED_CONSERVATION_ROOT=str(D),ABI5_INSTALLED_CONSERVATION_PACKAGE_ROOT=activation['packageRoot'],ABI5_INSTALLED_CONSERVATION_ARCHIVE=activation['successorArchive']['path'],ABI5_INSTALLED_CONSERVATION_ARCHIVE_DIGEST='sha256:'+activation['successorArchive']['sha256'],ABI5_INSTALLED_CONSERVATION_NODE=str(node),ABI5_INSTALLED_CONSERVATION_MODE=spec['mode'],ABI5_INSTALLED_CONSERVATION_FIXTURE_ROOT=activation['fixtureOwnerRoot'],ABI5_INSTALLED_CONSERVATION_EVIDENCE_ROOT=activation['evidenceRoot'])
env.update(TMPDIR=activation['originalTMPDIR'],ABI5_INSTALLED_CONSERVATION_ORIGINAL_ROOT=activation['originalRoot'],ABI5_INSTALLED_CONSERVATION_HANDOFF=activation['currentHandoff']['path'])
assert env.get('HOME')==json.loads((D/'activation.json').read_text())['HOME']=='/Users/jim'
record={'operation':D.name,'command':spec['command'],'cwd':spec.get('cwd',str(stage)),'capSeconds':spec.get('capSeconds',180),'HOMEUnchanged':True,'defaultHeap':True,'environment':{k:env[k] for k in ['PATH','TMPDIR','NODE_COMPILE_CACHE','ABI5_PUBLIC_PREPARATION_PACKAGE_ROOT','ABI5_PUBLIC_GROUPS_PACKAGE_ROOT','ABI5_PUBLIC_GROUPS_BASELINE']}}
record['environment'].update({k:v for k,v in env.items() if k.startswith('ABI5_INSTALLED_CONSERVATION_')})
start=time.perf_counter()
with (D/(label+'.stdout')).open('wb') as out,(D/(label+'.stderr')).open('wb') as err:
 p=subprocess.Popen(record['command'],cwd=record['cwd'],env=env,stdout=out,stderr=err,start_new_session=True)
 record['pid']=record['pgid']=p.pid;timed=False
 while True:
  pid,status,usage=os.wait4(p.pid,os.WNOHANG)
  if pid:break
  if time.perf_counter()-start>record['capSeconds']:
   timed=True;os.killpg(p.pid,signal.SIGKILL);pid,status,usage=os.wait4(p.pid,0);break
  time.sleep(.05)
 p.returncode=os.waitstatus_to_exitcode(status)
try:os.killpg(p.pid,0);absent=False
except ProcessLookupError:absent=True
record.update(exitCode=p.returncode,timedOut=timed,wait4Reaped=True,groupAbsent=absent,elapsedMs=(time.perf_counter()-start)*1000,maxRSSPlatformBytes=usage.ru_maxrss,userCPUSeconds=usage.ru_utime,systemCPUSeconds=usage.ru_stime)
for stream in ['stdout','stderr']:
 b=(D/(label+'.'+stream)).read_bytes();record[stream+'Bytes']=len(b);record[stream+'SHA256']=hashlib.sha256(b).hexdigest()
(D/(label+'.json')).write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps({k:record[k] for k in ['operation','exitCode','timedOut','wait4Reaped','groupAbsent','elapsedMs','maxRSSPlatformBytes','stdoutBytes','stderrBytes']}))
sys.exit(0 if p.returncode==0 and absent else 1)
