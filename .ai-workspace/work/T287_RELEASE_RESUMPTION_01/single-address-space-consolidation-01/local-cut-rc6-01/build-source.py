"""Compile/package once, or reproduce one exact committed RC6 source in isolation."""
from pathlib import Path
import datetime, hashlib, json, os, subprocess, sys, tempfile, time
D=Path(__file__).resolve().parent
W=Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut')
T='build_tenants/abiogenesis/typescript'
phase=sys.argv[1];assert phase in ['candidate','reproduction']
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def row(p):return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def save(p,v):
 with p.open('x') as f:f.write(json.dumps(v,indent=2)+'\n')
out=D/phase;out.mkdir()
env={**os.environ,'PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','TMPDIR':'/private/tmp/abg-rc5','NODE_OPTIONS':'--max-old-space-size=8192'}
r={'phase':phase,'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commands':[],'status':'RUNNING'}
save(out/'STARTED.json',r)
def run(label,args,cwd,timeout=600):
 t=time.monotonic();p=subprocess.run(args,cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout)
 (out/(label+'.stdout')).write_bytes(p.stdout);(out/(label+'.stderr')).write_bytes(p.stderr)
 r['commands'].append({'label':label,'argv':args,'cwd':str(cwd),'exit':p.returncode,'wallMs':round((time.monotonic()-t)*1000,3),'stdout':row(out/(label+'.stdout')),'stderr':row(out/(label+'.stderr'))})
 print(json.dumps({'phase':phase,'command':label,'exit':p.returncode,'wallMs':r['commands'][-1]['wallMs']}),flush=True)
 if p.returncode:raise RuntimeError(label+' failed; streams retained in '+str(out))
try:
 if phase=='candidate':
  assert (D/'SOURCE_PREPARED.json').exists();root=W
 else:
  checkpoint=json.loads((D/'SOURCE_CHECKPOINT.json').read_text());head=subprocess.check_output(['git','-C',str(W),'rev-parse','HEAD'],text=True).strip();assert head==checkpoint['sourceCommit'];r['sourceCommit']=head
  root=Path(tempfile.mkdtemp(prefix='rc6-reproduction-',dir='/private/tmp/abg-rc5'))
  source=out/'source.tar';run('archive',['/usr/bin/git','-C',str(W),'archive','--format=tar','--output='+str(source),head,T,'specification','stdo_abiogenesis.json','AGENTS.md','CLAUDE.md'],W)
  r['sourceArchive']=row(source);run('extract',['/usr/bin/tar','-xf',str(source),'-C',str(root)],root)
 tenant=root/T;r['root']=str(root)
 assert not (tenant/'build').exists() and not (tenant/'node_modules').exists()
 run('offline-dependencies',['/bin/cp','-cR','/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules',str(tenant/'node_modules')],root)
 run('compile',['/opt/homebrew/bin/node','node_modules/typescript/bin/tsc','-p','tsconfig.json'],tenant)
 run('generate',['/opt/homebrew/bin/node','scripts/generate-product-manifest.mjs'],tenant)
 (tenant/'artifacts').mkdir(exist_ok=False)
 run('pack',['/opt/homebrew/bin/npm','pack','--ignore-scripts','--json','--pack-destination','artifacts'],tenant)
 archive=tenant/'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.6.tgz';r['archive']=row(archive)
 r['manifest']=row(tenant/'product-toolchain-manifest.json');r['status']='BUILT'
 if phase=='reproduction':
  expected=json.loads((D/'candidate/RESULT.json').read_text())['archive'];r['expectedArchive']=expected
  assert r['archive']['sha256']==expected['sha256'] and r['archive']['bytes']==expected['bytes'],'Reproduction differs'
  r['status']='BYTE_EQUAL'
except Exception as e:
 r['status']='FAILED';r['error']=str(e);raise
finally:
 r['endedUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat();save(out/'RESULT.json',r)
 print(json.dumps({k:v for k,v in r.items() if k!='commands'}),flush=True)
