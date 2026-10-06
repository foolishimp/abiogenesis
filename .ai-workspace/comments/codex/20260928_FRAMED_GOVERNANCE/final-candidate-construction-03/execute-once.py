from pathlib import Path as _PreparationPath
if not (_PreparationPath(__file__).resolve().parent / 'construction-execution-grant.json').is_file():
    raise RuntimeError('C03 preparation only; exact Executive construction extension is absent')
from pathlib import Path
import json,os,subprocess,hashlib,time,sys,signal
D=Path(__file__).resolve().parent;T=D/'staged-repo/build_tenants/abiogenesis/typescript';F=D/'source-freeze'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(n,v):
 with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def verify_frozen():
 for r in json.loads((D/'source-freeze-manifest.json').read_text())['members']:
  p=F/r['path']
  if r['kind']=='symlink':assert p.is_symlink() and str(p.readlink())==r['target']
  else:assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
def check_inputs():
 for r in json.loads((D/'source-members.json').read_text()):
  p=D/'staged-repo'/r['path'];assert p.is_file() and sha(p)==r['sha256'],str(p)
verify_frozen();check_inputs();label=sys.argv[1];npm=str(F/'toolchain/bin/npm');node=str(F/'toolchain/bin/node');budget=json.loads((D/'budgets.json').read_text());cap=budget['operationCapsMs'][label];prior=json.loads((D/'preparation-result.json').read_text())['elapsedMs']
for name in budget['operationCapsMs']:
 p=D/(name+'.json')
 if p.exists():prior+=json.loads(p.read_text())['elapsedMs']
assert prior+cap+1000<=budget['maximumMs'],'finite total construction allowance'
if label=='dependencies':command=[npm,'ci','--offline','--ignore-scripts','--no-audit','--no-fund'];cwd=T
elif label=='build':command=[npm,'run','build'];cwd=T
elif label=='pack':command=[npm,'pack','--ignore-scripts','--json','--pack-destination',str(D/'artifacts')];cwd=T
elif label=='install':
 packed=json.loads((D/'pack.stdout').read_text());assert len(packed)==1;archive=D/'artifacts'/packed[0]['filename'];assert archive.is_file();command=[npm,'install','--offline','--ignore-scripts','--no-audit','--no-fund','--package-lock=false',str(archive)];cwd=D/'install'
elif label=='verify':command=[node,str(D/'verify-installed.mjs')];cwd=D
elif label=='installed-publications':command=[node,str(D/'validate-installed-publications.mjs')];cwd=D
else:raise ValueError(label)
assert not (D/(label+'.json')).exists() and not (D/(label+'.started.json')).exists(),'one attempt per operation'
env={**os.environ,'PATH':str(F/'toolchain/bin')+':/usr/bin:/bin:/usr/sbin:/sbin','TMPDIR':str(D/'tmp'),'npm_config_cache':str(D/'npm-cache'),'npm_config_userconfig':str(D/'npmrc'),'npm_config_globalconfig':str(D/'globalnpmrc'),'npm_config_prefix':str(D/'npm-prefix'),'npm_config_offline':'true','npm_config_audit':'false','npm_config_fund':'false','npm_config_update_notifier':'false','GIT_OPTIONAL_LOCKS':'0'};env.pop('NODE_OPTIONS',None)
for path in [D/'npmrc',D/'globalnpmrc']:
 if not path.exists():path.write_text('')
record={'command':command,'cwd':str(cwd),'effectTerritory':str(D),'environment':{k:env[k] for k in ['PATH','TMPDIR','npm_config_cache','npm_config_userconfig','npm_config_globalconfig','npm_config_prefix','npm_config_offline','GIT_OPTIONAL_LOCKS']},'HOMEUnchanged':env.get('HOME')==os.environ.get('HOME'),'capMs':cap,'terminationGraceMs':1000,'priorExecutionMs':prior,'maximumMs':786000}
save(label+'.started.json',record);start=time.monotonic();timedout=False
with (D/(label+'.stdout')).open('x') as out,(D/(label+'.stderr')).open('x') as err:
 p=subprocess.Popen(command,cwd=cwd,env=env,stdout=out,stderr=err,start_new_session=True);save(label+'.process-start.json',{'pid':p.pid,'ownedProcessGroup':p.pid,'streamsOpenedBeforeSpawn':True})
 try:code=p.wait(timeout=cap/1000)
 except subprocess.TimeoutExpired:
  timedout=True;os.killpg(p.pid,signal.SIGTERM)
  try:code=p.wait(timeout=1)
  except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);code=p.wait()
record.update(pid=p.pid,exitCode=code if code>=0 else None,signal=signal.Signals(-code).name if code<0 else None,ownedExitObserved=True,timedOut=timedout,elapsedMs=(time.monotonic()-start)*1000,stdoutSha256=sha(D/(label+'.stdout')),stderrSha256=sha(D/(label+'.stderr')));save(label+'.json',record);print(json.dumps({k:record[k] for k in ['pid','exitCode','signal','timedOut','elapsedMs']}),flush=True)
if code or timedout:raise SystemExit(1)
verify_frozen();check_inputs()
