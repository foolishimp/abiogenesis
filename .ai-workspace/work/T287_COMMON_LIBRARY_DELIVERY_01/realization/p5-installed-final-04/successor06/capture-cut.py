from pathlib import Path
import os,json,hashlib,stat,shutil,datetime,errno
N=Path(__file__).resolve().parent;D=N.parent;X=Path('/private/tmp/abg-stdo3-p5-06-7ca935e280b14df6');E=X/'evidence'
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def dump(name,x):
 with (N/name).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
outer=json.loads((N/'commands/test.completion.json').read_text());environment=json.loads((E/'environment.json').read_text()) if (E/'environment.json').exists() else None
archive=N/'archive';archive.mkdir();pairs=[]
def copy(src,dst):
 dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);a=pin(src);b=pin(dst);assert a['bytes']==b['bytes'] and a['sha256']==b['sha256'];pairs.append({'original':a,'copy':b})
for p in sorted(E.rglob('*')):
 if p.is_file() and not p.is_symlink():copy(p,archive/'test-evidence'/p.relative_to(E))
if environment is not None:
 scratch=Path(environment['scratch'])
 for base,dirs,files in os.walk(scratch):
  dirs[:]=[d for d in dirs if d not in ['consumer','node_modules']]
  for name in files:
   p=Path(base)/name
   if not p.is_symlink():copy(p,archive/'scratch-evidence'/p.relative_to(scratch))
dump('portable-evidence-correspondence.json',{'pairs':pairs,'allBytesExact':True,'copies':len(pairs),'scope':'Actual test evidence and non-package scratch evidence; original roots and installed copies retained'})
pids=[('test-host',outer['pid'],outer['groupId']),('test-supervisor',outer['supervisorPid'],None)]
if (E/'cleanup.json').exists():
 cleanup=json.loads((E/'cleanup.json').read_text())
 for row in cleanup['processes']:pids.append((row['label'],row['pid'],row['groupId']))
for ordinal in [1,2]:
 p=E/f'fresh-replay/{ordinal}/process.json'
 if p.exists():
  row=json.loads(p.read_text());pids.append((f'fresh-{ordinal}',row['pid'],row['groupId']))
presence=[]
for label,pid,group in pids:
 for g,value in [(False,pid),*([(True,group)] if group is not None else [])]:
  try:os.kill(-value if g else value,0);state='present';code=None
  except OSError as error:state='absent' if error.errno==errno.ESRCH else 'unknown';code=error.errno
  presence.append({'label':label,'pidOrGroupId':value,'groupProbe':g,'presence':state,'errno':code})
dump('independent-absence.json',{'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rows':presence,'scope':'Only actually recorded owned/fixture identities; no invented command PID and no universal descendant claim'})
rows=[];total=0
for p in [X,*sorted(X.rglob('*'))]:
 s=p.lstat();row={'path':str(p),'kind':'symlink' if p.is_symlink() else 'directory' if p.is_dir() else 'file','mode':oct(stat.S_IMODE(s.st_mode)),'device':s.st_dev,'inode':s.st_ino}
 if p.is_symlink():row['target']=os.readlink(p)
 elif p.is_file():row.update(pin(p));total+=row['bytes']
 rows.append(row)
dump('retained-physical-inventory.json',{'root':str(X),'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'nodes':rows,'regularFileBytes':total,'retained':True,'cleanup':False})
checks=[]
for row in json.loads((N/'preexecution-freeze.json').read_text())['files']:
 p=N/row['path'];q=pin(p);checks.append({'path':str(p),'exact':q['bytes']==row['bytes'] and q['sha256']==row['sha256']})
expected=json.loads((N/'owned-output.json').read_text())['successor'];actual=pin(Path(expected['path']));checks.append({'path':actual['path'],'exact':actual['bytes']==expected['bytes'] and actual['sha256']==expected['sha256']})
links=json.loads((N/'proof-copy-inventory.json').read_text())['symlinks'];linkchecks=[{'path':r['path'],'target':os.readlink(r['path']),'exact':os.readlink(r['path'])==r['target']} for r in links]
dump('local-preservation.json',{'files':checks,'symlinks':linkchecks,'allExact':all(r['exact'] for r in checks+linkchecks),'scope':'Exact own files/main selected test and declared read-only link targets; no repeat whole-stage/main acquisition'})
result={'testHostSuccess':outer['success'],'testHost':outer,'physicalNodes':len(rows),'physicalRegularBytes':total,'portableCopies':len(pairs),'allRecordedScopesAbsent':all(r['presence']=='absent' for r in presence),'allOwnedInputsExact':all(r['exact'] for r in checks+linkchecks),'actualEnvironmentAvailable':environment is not None}
dump('capture-result.json',result);print(json.dumps({k:v for k,v in result.items() if k!='testHost'}))
