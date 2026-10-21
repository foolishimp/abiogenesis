from pathlib import Path
import os,json,sys,subprocess,time,signal,traceback,hashlib
W=Path(__file__).resolve().parent;T=W/'stage/build_tenants/abiogenesis/typescript';NODE='/opt/homebrew/Cellar/node/24.7.0/bin/node'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,x):
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n')
label=sys.argv[1];assert not (W/'STOP.json').exists()
cfg=json.loads((W/'commands-config.json').read_text())[label];argv=cfg['argv'];cwd=cfg.get('cwd',str(T))
env={**json.loads((W/'command-environment.json').read_text()),**cfg.get('environment',{})}
assert sha(NODE)=='fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f'
record={'label':label,'argv':argv,'cwd':cwd,'effectiveEnvironment':{**json.loads((W/'command-environment.json').read_text()),**cfg.get('environment',{})},'timeoutMs':600000,'prebuildFreezeSha256':sha(W/'prebuild-freeze.json'),'runnerSha256':sha(__file__),'startedUnix':time.time()}
write(W/'commands'/f'{label}.request.json',record);started=time.monotonic();result={}
try:
 with (W/'commands'/f'{label}.stdout').open('xb') as out,(W/'commands'/f'{label}.stderr').open('xb') as err:
  child=subprocess.Popen(argv,cwd=cwd,env=env,stdout=out,stderr=err,start_new_session=True)
  result['pid']=child.pid
  try:result['exitCode']=child.wait(timeout=600)
  except subprocess.TimeoutExpired:
   result['timeout']=True;os.killpg(child.pid,signal.SIGTERM)
   try:result['exitCode']=child.wait(timeout=5)
   except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);result['exitCode']=child.wait()
 result.update(wallMs=(time.monotonic()-started)*1000,stdoutSha256=sha(W/'commands'/f'{label}.stdout'),stderrSha256=sha(W/'commands'/f'{label}.stderr'))
 write(W/'commands'/f'{label}.result.json',result)
 if result['exitCode']!=0 or result.get('timeout'):
  write(W/'STOP.json',{'kind':'first unexpected selected command failure','command':label,'request':record,'result':result,'disposition':'stopped before repair/retry/next case'})
  print(json.dumps(result));sys.exit(1)
 print(json.dumps({'label':label,**result}))
except BaseException as e:
 if isinstance(e,SystemExit):raise
 write(W/'STOP.json',{'kind':'command supervision failure','command':label,'traceback':traceback.format_exc(),'disposition':'stopped before repair/retry/next case'});raise
