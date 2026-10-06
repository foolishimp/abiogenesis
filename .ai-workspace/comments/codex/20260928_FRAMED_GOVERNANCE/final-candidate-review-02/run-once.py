import pathlib,json,subprocess,os,sys,time,signal,hashlib
D=pathlib.Path(__file__).resolve().parent;C=D.parent/'final-candidate-construction-02';F=C/'source-freeze';stage=sys.argv[1]
limits={'inspection':60000,'nominal':120000,'full11':60000};cap=limits[stage]
def save(n,v):
 with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
assert not (D/(stage+'-started.json')).exists()
for p in ['tmp','cache','config']:(D/p).mkdir(exist_ok=True)
command=[sys.executable,'-B',str(D/'inspect.py')] if stage=='inspection' else [str(F/'toolchain/bin/node'),str(D/'installed-check.mjs'),stage]
env={**os.environ,'PATH':str(F/'toolchain/bin')+':/usr/bin:/bin:/usr/sbin:/sbin','TMPDIR':str(D/'tmp'),'XDG_CACHE_HOME':str(D/'cache'),'XDG_CONFIG_HOME':str(D/'config'),'GIT_OPTIONAL_LOCKS':'0'};env.pop('NODE_OPTIONS',None);env.pop('NODE_COMPILE_CACHE',None)
record={'stage':stage,'command':command,'cwd':str(D),'capMs':cap,'terminationGraceMs':1000,'environment':{k:env[k] for k in ['PATH','TMPDIR','XDG_CACHE_HOME','XDG_CONFIG_HOME','GIT_OPTIONAL_LOCKS']},'HOME_home_CODEX_HOMEUnchanged':all(env.get(k)==os.environ.get(k) for k in ['HOME','home','CODEX_HOME']),'scope':'Review output only; no native/Product construction effect'}
save(stage+'-started.json',record);begin=time.monotonic();timeout=False
with (D/(stage+'.stdout')).open('x') as out,(D/(stage+'.stderr')).open('x') as err:
 p=subprocess.Popen(command,cwd=D,env=env,stdout=out,stderr=err,start_new_session=True);save(stage+'-process.json',{'pid':p.pid,'ownedProcessGroup':p.pid})
 try:code=p.wait(timeout=cap/1000)
 except subprocess.TimeoutExpired:
  timeout=True;os.killpg(p.pid,signal.SIGTERM)
  try:code=p.wait(timeout=1)
  except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);code=p.wait()
record.update({'pid':p.pid,'exitCode':code if code>=0 else None,'signal':None if code>=0 else signal.Signals(-code).name,'timedOut':timeout,'ownedExitObserved':True,'elapsedMs':(time.monotonic()-begin)*1000,'stdoutSHA256':hashlib.sha256((D/(stage+'.stdout')).read_bytes()).hexdigest(),'stderrSHA256':hashlib.sha256((D/(stage+'.stderr')).read_bytes()).hexdigest()})
save(stage+'-execution.json',record);print(json.dumps({k:record[k] for k in ['stage','exitCode','signal','timedOut','elapsedMs']}))
if code or timeout:raise SystemExit(1)
