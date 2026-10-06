import pathlib,json,sys,os,subprocess,signal,time,hashlib
E=pathlib.Path(__file__).resolve().parent;C=E.parent/'final-candidate-construction-02';label=sys.argv[1]
groups={'01-inputs':[sys.executable,'-B',str(E/'prepare-inputs.py')],'02-bindings':[str(C/'source-freeze/toolchain/bin/node'),str(E/'prepare-subject-binding.mjs')],'03-validation':[str(C/'source-freeze/toolchain/bin/node'),str(E/'validate-inputs.mjs')],'04-correspondence':[sys.executable,'-B',str(E/'bind-inputs.py')],'05-conservation':[sys.executable,'-B',str(E/'final-check.py')]}
def save(n,v):
 with (E/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
assert label in groups and not (E/(label+'.started.json')).exists()
prior=sorted(E.glob('??-*.execution.json'));assert len(prior)==list(groups).index(label)
for p in ['tmp','cache','config']:(E/p).mkdir(exist_ok=True)
env={**os.environ,'PATH':str(C/'source-freeze/toolchain/bin')+':/usr/bin:/bin:/usr/sbin:/sbin','TMPDIR':str(E/'tmp'),'XDG_CACHE_HOME':str(E/'cache'),'XDG_CONFIG_HOME':str(E/'config'),'GIT_OPTIONAL_LOCKS':'0'};env.pop('NODE_OPTIONS',None);env.pop('NODE_COMPILE_CACHE',None)
record={'label':label,'command':groups[label],'cwd':str(E),'capMs':120000,'terminationGraceMs':1000,'maximumGroups':5,'maximumAggregateMs':605000,'environment':{k:env[k] for k in ['PATH','TMPDIR','XDG_CACHE_HOME','XDG_CONFIG_HOME','GIT_OPTIONAL_LOCKS']},'HOME_home_CODEX_HOMEUnchanged':all(env.get(k)==os.environ.get(k) for k in ['HOME','home','CODEX_HOME']),'effectTerritory':str(E)};save(label+'.started.json',record)
start=time.monotonic();timeout=False
with (E/(label+'.stdout')).open('x') as out,(E/(label+'.stderr')).open('x') as err:
 p=subprocess.Popen(groups[label],cwd=E,env=env,stdout=out,stderr=err,start_new_session=True);save(label+'.process.json',{'pid':p.pid,'ownedProcessGroup':p.pid})
 try:code=p.wait(timeout=120)
 except subprocess.TimeoutExpired:
  timeout=True;os.killpg(p.pid,signal.SIGTERM)
  try:code=p.wait(timeout=1)
  except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);code=p.wait()
record.update({'pid':p.pid,'exitCode':code if code>=0 else None,'signal':None if code>=0 else signal.Signals(-code).name,'timedOut':timeout,'ownedExitObserved':True,'elapsedMs':(time.monotonic()-start)*1000,'stdoutSHA256':hashlib.sha256((E/(label+'.stdout')).read_bytes()).hexdigest(),'stderrSHA256':hashlib.sha256((E/(label+'.stderr')).read_bytes()).hexdigest()});save(label+'.execution.json',record);print(json.dumps({k:record[k] for k in ['label','exitCode','signal','timedOut','elapsedMs']}))
if code or timeout:raise SystemExit(1)
