import os,sys,json,time,signal,subprocess
from pathlib import Path
N=Path(__file__).resolve().parent;env=os.environ.copy();overlay=json.loads((N/'runtime-environment.json').read_text());env.update(overlay);budget=json.loads((N/'budgets.json').read_text());command=['/opt/homebrew/Cellar/node/24.7.0/bin/node',str(N/'driver.mjs')]
assert budget['driverBudgetMs']==6912000 and budget['totalCeilingMs']==7032000 and budget['purePreflightAllowanceMs']==120000
assert not (N/'driver-process.json').exists() and not (N/'driver.stdout').exists()
def save(name,d):
 with (N/name).open('x') as f:json.dump(d,f,indent=2);f.write('\n')
save('launch-command.json',{'command':command,'cwd':str(N),'environmentOverlay':overlay,'maximumIncludingPreflightAndGraceMs':7032000,'purePreflightAllowanceMs':120000,'terminationGraceMs':1000,'HOMEUnchanged':env.get('HOME')==os.environ.get('HOME')})
started=time.monotonic();timedout=False;owned=[]
with (N/'driver.stdout').open('x') as out,(N/'driver.stderr').open('x') as err:
 child=subprocess.Popen(command,cwd=N,env=env,stdout=out,stderr=err,start_new_session=True);save('driver-process-start.json',{'pid':child.pid,'processGroup':child.pid,'supervisorPid':os.getpid(),'command':command})
 try:code=child.wait(timeout=(7031000/1000))
 except subprocess.TimeoutExpired:
  timedout=True
  for p in N.glob('setup-*-process-start.json'):
   stem=p.name.removesuffix('-process-start.json')
   if not (N/(stem+'-timing.json')).exists():owned.append(json.loads(p.read_text())['processGroup'])
  owned.append(child.pid)
  for group in owned:
   try:os.killpg(group,signal.SIGTERM)
   except ProcessLookupError:pass
  try:code=child.wait(timeout=1)
  except subprocess.TimeoutExpired:code=None
  for group in owned:
   try:os.killpg(group,signal.SIGKILL)
   except ProcessLookupError:pass
  if code is None:code=child.wait()
result={'pid':child.pid,'exitCode':code if code>=0 else None,'signal':signal.Signals(-code).name if code<0 else None,'exitObserved':True,'timedOut':timedout,'elapsedMs':(time.monotonic()-started)*1000,'ownedGroupsSignalled':owned,'stdout':'driver.stdout','stderr':'driver.stderr'};save('driver-process.json',result);print(json.dumps(result));sys.exit(0 if code==0 and not timedout else 1)
