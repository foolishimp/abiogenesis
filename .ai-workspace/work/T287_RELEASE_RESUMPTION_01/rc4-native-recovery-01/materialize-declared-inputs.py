#!/usr/bin/env python3
"""No-clobber exact historical C2 dependencies + admitted current inputs; no ABI imports."""
import hashlib,json,os,stat,subprocess,sys
from pathlib import Path,PurePosixPath
P=Path(__file__).resolve().parent
W=Path('/Users/jim/src/apps/abiogenesis-rc4-native-recovery')
B=P.parent/'rc3-dogfood-01'
C=B/'single-machine-p1-01/B11_C2_961_PREPARATION.json'
CPIN='554172089688e2ba1768856f91d7d3b8a2409a170011fc46da5667282aa3696f'
ADMISSION='d0d6aa77bcbe33deee08dcff41c2c40730c7a363d8a2f0c11ecab794e1926f69'
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def safe(name):
 p=PurePosixPath(name)
 assert not p.is_absolute() and p.parts and not any(x in ('.','..','') for x in p.parts),name
 return p.parts
def check(row,p):
 assert p.is_file() and not p.is_symlink(),str(p)
 b=p.read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'],str(p)
 return b
assert sys.argv[1:]==['--materialize'],'usage: materialize-declared-inputs.py --materialize'
assert sha((P/'ROOT_NATIVE_ADMISSION.json').read_bytes())==ADMISSION
assert subprocess.check_output(['/usr/bin/git','-C',str(W),'rev-parse','HEAD'],text=True).strip()=='bcb1faf63cfb39bd7ccf7e14b48b133d1163216b'
subprocess.run(['/usr/bin/git','-C',str(W),'diff','--quiet'],check=True)
subprocess.run(['/usr/bin/git','-C',str(W),'diff','--cached','--quiet'],check=True)
assert not (P/'INPUT_MATERIALIZATION.json').exists()
raw=C.read_bytes();assert sha(raw)==CPIN;c=json.loads(raw)
# Reuse only the recorded260 missing, authenticated historical fixture/tool inputs.
# The701 tracked Product files are the selected current Git source, never overwritten from old C2.
rows=[]
for r in c['paths']:
 if r['successorAtCensus']!='missing':continue
 parts=safe(r['path']);assert parts[0] in ('rc3-operator-inputs','.claude'),r['path']
 rows.append({'source':str(Path(c['snapshotRoot']).joinpath(*parts)),'target':r['path'],'bytes':r['bytes'],'sha256':r['sha256'],'role':'unchanged historical dependency/fixture, not current work authority'})
assert len(rows)==260
current=['ROOT_SELECTION.md','ROOT_NATIVE_ADMISSION.json','NATIVE_GRANT.json','NATIVE_GRANT.v2.DRAFT.json','DESIGN_AND_ACTIVATION.v2.md','CAUSAL_SCOPE.v2.DRAFT.json','CURRENT_T287_SELECTION.v2.md','REQUIRED_INPUTS.v2.json','task.v2.DRAFT.md','rubric.v2.DRAFT.json']
for name in current:
 r=pin(P/name);rows.append({'source':r.pop('path'),'target':'rc4-operator-inputs/native-recovery-01/'+name,**r,'role':'current admitted task/authority/HOW/rubric input'})
# All planned targets must be outside tracked Product territory.
targets=[r['target'] for r in rows];assert len(set(targets))==len(targets)
tracked=subprocess.check_output(['/usr/bin/git','-C',str(W),'ls-files','-z','--',*targets]).split(b'\0');assert not any(tracked),'refuse tracked target'
for r in rows:
 check(r,Path(r['source']));target=W.joinpath(*safe(r['target']))
 if target.exists() or target.is_symlink():raise ValueError('no-clobber target exists: '+str(target))
 for parent in target.parents:
  if parent==W:break
  if parent.exists():assert parent.is_dir() and not parent.is_symlink(),str(parent)
created=[]
try:
 for r in rows:
  source=Path(r['source']);target=W.joinpath(*safe(r['target']));cur=W
  for part in safe(r['target'])[:-1]:
   cur=cur/part
   try:cur.mkdir(mode=0o755)
   except FileExistsError:pass
   assert cur.is_dir() and not cur.is_symlink(),str(cur)
  data=check(r,source)
  fd=os.open(target,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,'O_NOFOLLOW',0),stat.S_IMODE(source.stat().st_mode))
  with os.fdopen(fd,'wb') as f:f.write(data)
  check(r,target);created.append(r)
 subprocess.run(['/usr/bin/git','-C',str(W),'diff','--quiet'],check=True)
 subprocess.run(['/usr/bin/git','-C',str(W),'diff','--cached','--quiet'],check=True)
 result={'kind':'rc4_declared_input_materialization','status':'MATERIALIZED_NOT_NATIVE_DISPATCHED','admissionSha256':ADMISSION,'sourceCommit':'bcb1faf63cfb39bd7ccf7e14b48b133d1163216b','historicalClosure':pin(C),'historicalClosureReadMethod':'Only existing recorded missing260 rows; no new961 census or tracked predecessor transplantation.','created':len(created),'historicalDependencies':260,'currentAuthorityInputs':len(current),'rows':created,'trackedProductWrites':0,'dependencyInstalls':0,'ABIImports':0,'PublicCalls':0,'providerCalls':0}
 with (P/'INPUT_MATERIALIZATION.json').open('x') as f:json.dump(result,f,indent=2);f.write('\n')
 print(json.dumps({'status':result['status'],'created':len(created),'historicalDependencies':260,'currentAuthorityInputs':len(current),'receipt':pin(P/'INPUT_MATERIALIZATION.json')}))
except Exception as e:
 with (P/'INPUT_MATERIALIZATION_FAILURE.json').open('x') as f:json.dump({'error':str(e),'created':created,'preservation':'No rollback/destruction; inspect actual created files before any retry'},f,indent=2)
 raise
