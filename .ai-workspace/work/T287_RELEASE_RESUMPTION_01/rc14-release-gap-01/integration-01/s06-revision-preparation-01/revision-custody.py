"""External byte custody only; never reads a copy as an ABG event resource."""
import datetime as dt,hashlib,json,os,pathlib
HERE=pathlib.Path(__file__).resolve().parent
def digest(path,length=None):
 h=hashlib.sha256();left=length
 with pathlib.Path(path).open('rb') as f:
  while left is None or left:
   b=f.read(1048576 if left is None else min(left,1048576))
   if not b:break
   h.update(b)
   if left is not None:left-=len(b)
 if left not in (None,0):raise RuntimeError('Closed prefix truncated')
 return h.hexdigest()
def need(v,m):
 if not v:raise RuntimeError(m)
def regular(path):
 p=pathlib.Path(path);need(p.is_file() and not p.is_symlink() and p.resolve()==p,'Absent/aliased input '+str(p));return p
def exact(row):
 p=regular(row['path']);need(p.stat().st_size==row['bytes'] and digest(p)==row['sha256'],'Changed closed input '+str(p));return p
def prior_rows():
 p=json.loads((HERE/'INPUT_PINS.json').read_text());closed=json.loads((HERE/'CLOSED_SOURCE.json').read_text());old=json.loads(exact(p['originalReturn']).read_text())
 rows=old['pins']+[p['originalReturn'],p['activation'],p['rootReview'],*p['standards']]
 unique={}
 for row in rows:
  if row['path'] in unique:need(unique[row['path']]==row,'Conflicting custody '+row['path'])
  unique[row['path']]=row
 return p,closed,list(unique.values())
def observe(deadline):
 pins,closed,rows=prior_rows();out={}
 def budget():need(dt.datetime.now(dt.timezone.utc)<deadline,'Original audit deadline exhausted')
 event=closed['eventLog'];p=regular(event['path']);st=p.stat();prefix=closed['sourcePrefix']
 need(st.st_dev==prefix['storeIdentity']['device'] and st.st_ino==prefix['storeIdentity']['inode'],'Original event-store physical identity differs')
 need(st.st_size>=event['bytes'] and digest(p,event['bytes'])==event['sha256'],'Original closed prefix changed')
 for row in rows:
  budget()
  if row['path']==event['path']:out[row['path']]=event['sha256'];continue
  exact(row);out[row['path']]=row['sha256']
 # Preserve every old raw file, not merely receipt samples. The one event file
 # is append-only; its original prefix remains an exact separately copied input.
 old_raw={}
 for root,dirs,files in os.walk(closed['rawRoot'],followlinks=False):
  for name in dirs+files:need(not (pathlib.Path(root)/name).is_symlink(),'Old raw alias')
  for name in files:
   budget();f=pathlib.Path(root)/name
   old_raw[f.relative_to(closed['rawRoot']).as_posix()]=event['sha256'] if str(f)==event['path'] else digest(f)
 return {'pins':out,'oldRaw':old_raw,'eventPrefix':{'path':str(p),'bytes':event['bytes'],'sha256':event['sha256'],'device':st.st_dev,'inode':st.st_ino}}
def entry(raw,deadline):
 pins,closed,rows=prior_rows();event=exact(closed['eventLog']);work=pathlib.Path(closed['workspaceRoot'])
 expected=json.loads((HERE/'WORKSITE_CLOSED.json').read_text())['rows'];actual=[]
 for root,dirs,files in os.walk(work,followlinks=False):
  need(dt.datetime.now(dt.timezone.utc)<deadline,'Original entry deadline exhausted')
  for name in dirs+files:need(not (pathlib.Path(root)/name).is_symlink(),'Worksite alias')
  for name in files:
   p=pathlib.Path(root)/name;actual.append({'path':p.relative_to(work).as_posix(),'bytes':p.stat().st_size,'sha256':digest(p)})
 need(sorted(actual,key=lambda r:r['path'])==sorted(expected,key=lambda r:r['path']),'Closed worksite changed before new owner effects')
 target=pathlib.Path(raw)/'closed04-prefix.snapshot'
 with event.open('rb') as source,target.open('xb') as dest:
  while b:=source.read(1048576):dest.write(b)
 need(target.stat().st_size==closed['eventLog']['bytes'] and digest(target)==closed['eventLog']['sha256'],'External exact prefix backup differs')
 # This snapshot is evidence only. Reopen always names original eventLog.path.
 return observe(deadline)
