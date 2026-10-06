from pathlib import Path
import hashlib,json,os,subprocess,time,signal,sys
D=Path(__file__).resolve().parent;C=D.parent/'final-candidate-construction-03'
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(n,v):
 with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
assert not (D/'driver-start.json').exists(),'one bounded four-read execution only'
env={**os.environ,**read(D/'runtime-environment.json')};had_options='NODE_OPTIONS' in env;env.pop('NODE_OPTIONS',None)
node=str(C/'source-freeze/toolchain/bin/node');syntax=[]
for n in ['driver.mjs','ordinary-caller.mjs','public-support.mjs','caller-draft.mjs','original-consumers.mjs','sole-output-renderer.mjs']:
 start=time.monotonic();r=subprocess.run([node,'--check',str(D/n)],env=env,cwd=D,capture_output=True,text=True,timeout=30)
 syntax.append({'path':n,'sha256':sha(D/n),'exitCode':r.returncode,'stderr':r.stderr,'elapsedMs':(time.monotonic()-start)*1000})
 if r.returncode:save('syntax-checks.json',syntax);raise SystemExit(r.returncode)
save('syntax-checks.json',syntax)
inputs=['runtime-activation.json','selected-core.json','prospective-cases.json','runtime-environment.json','resource-plan.json','budgets.json',
 'driver.mjs','ordinary-caller.mjs','public-support.mjs','caller-draft.mjs','original-consumers.mjs','sole-output-renderer.mjs','original-oracle.json',
 'pair-inputs.json','readback-contract.json','observe-process.py','input-correspondence.json','initialize.py','launch.py']
save('runtime-bound-inputs.json',{'records':[{'path':n,'bytes':(D/n).stat().st_size,'sha256':sha(D/n)} for n in inputs]})
budget=read(D/'budgets.json')['driverBudgetMs'];started=time.monotonic();timedout=False;cleanup=[]
with (D/'driver.stdout').open('x') as out,(D/'driver.stderr').open('x') as err:
 p=subprocess.Popen([node,str(D/'driver.mjs')],cwd=D,env=env,stdout=out,stderr=err,start_new_session=True)
 save('driver-start.json',{'pid':p.pid,'ownedProcessGroup':p.pid,'command':[node,str(D/'driver.mjs')],'budgetMs':budget,
  'environment':read(D/'runtime-environment.json'),'HOMEUnchanged':env.get('HOME')==os.environ.get('HOME'),'NODE_OPTIONS_removed':had_options,
  'capture':'Known managed PID/group recorded before owner read; exclusive streams opened before spawn'})
 try:code=p.wait(timeout=budget/1000)
 except subprocess.TimeoutExpired:
  timedout=True;groups=[p.pid]+[read(f)['processGroup'] for f in D.glob('*-process-start.json')]
  for pgid in groups:
   try:os.killpg(pgid,signal.SIGTERM);cleanup.append({'processGroup':pgid,'signal':'SIGTERM'})
   except ProcessLookupError:pass
  try:code=p.wait(timeout=1)
  except subprocess.TimeoutExpired:
   for pgid in groups:
    try:os.killpg(pgid,signal.SIGKILL);cleanup.append({'processGroup':pgid,'signal':'SIGKILL'})
    except ProcessLookupError:pass
   code=p.wait()
save('driver-process.json',{'pid':p.pid,'exitCode':code if code>=0 else None,'signal':signal.Signals(-code).name if code<0 else None,
 'timedOut':timedout,'ownedExitObserved':True,'elapsedMs':(time.monotonic()-started)*1000,'budgetMs':budget,'cleanup':cleanup,
 'stdoutSHA256':sha(D/'driver.stdout'),'stderrSHA256':sha(D/'driver.stderr')})
print(json.dumps(read(D/'driver-process.json')),flush=True)
sys.exit(1 if code or timedout else 0)
