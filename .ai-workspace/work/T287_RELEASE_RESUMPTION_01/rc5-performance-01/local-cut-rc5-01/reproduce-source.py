"""Isolated build/pack discriminator. Never changes canonical source or releases."""
import json,hashlib,subprocess,datetime,os,time,tempfile
from pathlib import Path
D=Path(__file__).resolve().parent;C=D.parent;F=C/'f4-03-r1';S=Path('/Users/jim/src/apps/abiogenesis-rc5-performance')
T='build_tenants/abiogenesis/typescript'
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
proof=read(F/'GENERATED_ADOPTION.PREPARED.json');adoption=read(F/'SOURCE_ADOPTION_CHECKPOINT.json')
head=subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD'],text=True).strip();assert head==adoption['sourceCommit']
for args in [['diff','--quiet'],['diff','--cached','--quiet']]:subprocess.run(['git','-C',str(S)]+args,check=True)
expected=proof['archive'];assert sha(Path(expected['path']))==expected['sha256']
root=Path(tempfile.mkdtemp(prefix='rc5-reproduction-',dir='/private/tmp/abg-rc5'));receipts=[]
env={**os.environ,'PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','TMPDIR':'/private/tmp/abg-rc5','NODE_OPTIONS':'--max-old-space-size=8192'}
def run(label,args,cwd,timeout=600):
 start=time.monotonic();r=subprocess.run(args,cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout)
 (root/(label+'.stdout')).write_bytes(r.stdout);(root/(label+'.stderr')).write_bytes(r.stderr)
 receipts.append({'label':label,'args':args,'cwd':str(cwd),'wallMs':(time.monotonic()-start)*1000,'exit':r.returncode,
  'stdoutSha256':hashlib.sha256(r.stdout).hexdigest(),'stderrSha256':hashlib.sha256(r.stderr).hexdigest()})
 if r.returncode:raise RuntimeError(label+' failed; exact streams preserved at '+str(root))
archive=root/'source.tar';subprocess.run(['git','-C',str(S),'archive','--format=tar','--output='+str(archive),head,T,'specification','stdo_abiogenesis.json','AGENTS.md','CLAUDE.md'],check=True)
record={'kind':'isolated_source_reproduction','sourceCommit':head,'sourceArchiveSha256':sha(archive),'scratch':str(root),
 'role':'Root operator Writer isolated reproducibility discriminator under approved RC5 scope; no canonical mutation, provider, native Run or qualification suite',
 'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'RUNNING'}
with (D/'REPRODUCTION_STARTED.json').open('x') as f:f.write(json.dumps(record,indent=2)+'\n')
try:
 run('extract',['/usr/bin/tar','-xf',str(archive),'-C',str(root)],root)
 tenant=root/T
 assert not (tenant/'build').exists() and not (tenant/'node_modules').exists()
 run('offline-dependencies',['/bin/cp','-cR','/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules',str(tenant/'node_modules')],root)
 run('compile',['/opt/homebrew/bin/node','node_modules/typescript/bin/tsc','-p','tsconfig.json'],tenant)
 run('generate',['/opt/homebrew/bin/node','scripts/generate-product-manifest.mjs'],tenant)
 (tenant/'artifacts').mkdir()
 run('pack',['/opt/homebrew/bin/npm','pack','--ignore-scripts','--json','--pack-destination','artifacts'],tenant)
 result=tenant/'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.5.tgz'
 record.update(status='BYTE_EQUAL' if sha(result)==expected['sha256'] else 'MISMATCH',archive=str(result),archiveBytes=result.stat().st_size,archiveSha256=sha(result),expectedArchiveSha256=expected['sha256'])
 assert record['status']=='BYTE_EQUAL','Isolated source archive differs from actual C2 archive'
except Exception as e:
 record.update(status='FAILED',error=str(e));raise
finally:
 record.update(endedUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),commands=receipts)
 with (D/'SOURCE_REPRODUCTION.json').open('x') as f:f.write(json.dumps(record,indent=2)+'\n')
 print(json.dumps({k:v for k,v in record.items() if k!='commands'}))
