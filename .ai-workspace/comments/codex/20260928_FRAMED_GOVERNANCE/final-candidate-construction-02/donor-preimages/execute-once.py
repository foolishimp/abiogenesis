from pathlib import Path
import json,os,subprocess,hashlib,time,sys
D=Path(__file__).resolve().parent;T=D/'staged-repo/build_tenants/abiogenesis/typescript';F=D/'source-freeze'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def verify_frozen():
 for r in json.loads((D/'source-freeze-manifest.json').read_text())['members']:
  p=F/r['path']
  if r['kind']=='symlink':assert p.is_symlink() and str(p.readlink())==r['target']
  else:assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
def check_inputs():
 for r in json.loads((D/'source-members.json').read_text()):
  p=D/'staged-repo'/r['path'];assert p.is_file() and sha(p)==r['sha256'],str(p)
verify_frozen();check_inputs()
label=sys.argv[1];npm=str(F/'toolchain/bin/npm')
if label=='dependencies':command=[npm,'ci','--offline','--ignore-scripts','--no-audit','--no-fund'];cwd=T
elif label=='build':command=[npm,'run','build'];cwd=T
elif label=='pack':command=[npm,'pack','--ignore-scripts','--json','--pack-destination',str(D/'artifacts')];cwd=T
elif label=='install':
 packed=json.loads((D/'pack.stdout').read_text());assert len(packed)==1;archive=D/'artifacts'/packed[0]['filename'];assert archive.is_file()
 command=[npm,'install','--offline','--ignore-scripts','--no-audit','--no-fund','--package-lock=false',str(archive)];cwd=D/'install'
else:raise ValueError(label)
assert not (D/(label+'.json')).exists() and not (D/(label+'.started.json')).exists(),'one attempt per operation'
env={**os.environ,'PATH':str(F/'toolchain/bin')+':/usr/bin:/bin:/usr/sbin:/sbin','TMPDIR':str(D/'tmp'),'npm_config_cache':str(D/'npm-cache'),'npm_config_userconfig':str(D/'npmrc'),'npm_config_globalconfig':str(D/'globalnpmrc'),'npm_config_prefix':str(D/'npm-prefix'),'npm_config_offline':'true','npm_config_audit':'false','npm_config_fund':'false','npm_config_update_notifier':'false','GIT_OPTIONAL_LOCKS':'0'}
env.pop('NODE_OPTIONS',None)
for p in [D/'npmrc',D/'globalnpmrc']:
 if not p.exists():p.write_text('')
record={'command':command,'cwd':str(cwd),'effectTerritory':str(D),'environment':{k:env[k] for k in ['PATH','TMPDIR','npm_config_cache','npm_config_userconfig','npm_config_globalconfig','npm_config_prefix','npm_config_offline']}}
(D/(label+'.started.json')).write_text(json.dumps(record,indent=2)+'\n');start=time.monotonic()
with (D/(label+'.stdout')).open('w') as out,(D/(label+'.stderr')).open('w') as err:p=subprocess.run(command,cwd=cwd,env=env,stdout=out,stderr=err)
record.update(exitCode=p.returncode,elapsedSeconds=time.monotonic()-start,stdoutSha256=sha(D/(label+'.stdout')),stderrSha256=sha(D/(label+'.stderr')));(D/(label+'.json')).write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record),flush=True)
if p.returncode:raise SystemExit(p.returncode)
verify_frozen();check_inputs()
