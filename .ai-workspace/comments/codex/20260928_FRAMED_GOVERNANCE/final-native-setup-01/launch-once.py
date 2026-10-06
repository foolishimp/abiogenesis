import os,sys,json,time,signal,subprocess,hashlib
from pathlib import Path
N=Path(__file__).resolve().parent;env=os.environ.copy();env.update(json.loads((N/'runtime-environment.json').read_text()));budget=json.loads((N/'budgets.json').read_text());command=['/opt/homebrew/Cellar/node/24.7.0/bin/node',str(N/'driver.mjs')]
assert not (N/'driver-process.json').exists() and not (N/'driver.stdout').exists()
def save(name,d):
 with (N/name).open('x') as f:json.dump(d,f,indent=2);f.write('\n')
save('launch-command.json',{'command':command,'cwd':str(N),'environmentOverlay':json.loads((N/'runtime-environment.json').read_text()),'nativeDriverBudgetMs':budget['driverBudgetMs'],'purePreflightAllowanceMs':600000,'outerTimeoutMs':budget['driverBudgetMs']+601000,'HOMEUnchanged':env.get('HOME')==os.environ.get('HOME')})
started=time.monotonic();timedout=False
with (N/'driver.stdout').open('x') as out,(N/'driver.stderr').open('x') as err:
 child=subprocess.Popen(command,cwd=N,env=env,stdout=out,stderr=err,start_new_session=True);save('driver-process-start.json',{'pid':child.pid,'processGroup':child.pid,'supervisorPid':os.getpid(),'command':command})
 try:code=child.wait(timeout=(budget['driverBudgetMs']+601000)/1000)
 except subprocess.TimeoutExpired:
  timedout=True
  for p in N.glob('setup-*-process-start.json'):
   stem=p.name.removesuffix('-process-start.json')
   if not (N/(stem+'-timing.json')).exists():
    try:os.killpg(json.loads(p.read_text())['processGroup'],signal.SIGTERM)
    except ProcessLookupError:pass
  os.killpg(child.pid,signal.SIGTERM)
  try:code=child.wait(timeout=1)
  except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);code=child.wait()
result={'pid':child.pid,'exitCode':code if code>=0 else None,'signal':signal.Signals(-code).name if code<0 else None,'exitObserved':True,'timedOut':timedout,'elapsedMs':(time.monotonic()-started)*1000,'stdout':'driver.stdout','stderr':'driver.stderr'};save('driver-process.json',result);print(json.dumps(result));sys.exit(0 if code==0 and not timedout else 1)
