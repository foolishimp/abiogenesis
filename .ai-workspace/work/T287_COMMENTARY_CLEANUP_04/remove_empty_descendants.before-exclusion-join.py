"""Exact named-root empty-descendant rmdir only. Default mode is preparation."""
from pathlib import Path
from contextlib import contextmanager
import collections, datetime, errno, gzip, hashlib, json, os, stat, sys, time
R=Path('/Users/jim/src/apps/abiogenesis')
W=R/'.ai-workspace/work/T287_COMMENTARY_CLEANUP_04'
E=R/'.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_04'
EXECUTE=sys.argv[1:]==['--execute']
assert sys.argv[1:] in ([],['--prepare'],['--execute'])
START=time.monotonic(); removed=[]; phase='preparation_source_joins'

def output(name,obj):
 p=E/name; assert not p.exists(),str(p)
 p.write_text(json.dumps(obj,sort_keys=True,separators=(',',':'))+'\n')

def emit(stage,**fields):
 print(json.dumps({'stage':stage,'elapsedSeconds':time.monotonic()-START,**fields}),flush=True)

def guard(p):
 p=Path(p);assert p.is_absolute() and (p==R or R in p.parents),str(p)
 for q in (p,*p.parents):assert not q.is_symlink(),'symlink component: '+str(q)
 return p

def ident(st):return (stat.S_IMODE(st.st_mode),st.st_dev,st.st_ino)

def meta(path,st,fd=None,name=None):
 kind='directory' if stat.S_ISDIR(st.st_mode) else 'file' if stat.S_ISREG(st.st_mode) else 'symlink' if stat.S_ISLNK(st.st_mode) else 'nonregular'
 row={'path':str(path),'kind':kind,'mode':stat.S_IMODE(st.st_mode),'device':st.st_dev,'inode':st.st_ino}
 if kind!='directory':row.update(bytes=st.st_size,mtimeNs=st.st_mtime_ns,ctimeNs=st.st_ctime_ns)
 if kind=='symlink':row['target']=os.readlink(name,dir_fd=fd)
 return row

def verify_pin(pin):
 p=guard(Path(pin['path']));b=p.read_bytes()
 assert (len(b),hashlib.sha256(b).hexdigest())==(pin['bytes'],pin['sha256']),str(p)
 return b

def load_roots():
 prep=json.loads((W/'activation.json').read_bytes())
 assert prep['operation']=='T287_COMMENTARY_CLEANUP_EMPTY_DIRS_04_PREPARE' and prep['rmdirAuthorized'] is False
 roots=[]
 for pin in prep['rootPlanPins']:
  plan=json.loads(verify_pin(pin));assert len(plan['roots'])==pin['namedRoots']
  base=guard(Path(plan['G']))
  for old in plan['roots']:
   rel=Path(old['path']);assert not rel.is_absolute() and all(x not in ('','..','.') for x in rel.parts)
   p=guard(base/rel);assert base in p.parents
   st=p.lstat();assert stat.S_ISDIR(st.st_mode)
   assert ident(st)==tuple(old[k] for k in ('mode','device','inode')),'named root changed: '+str(p)
   roots.append({'path':str(p),'mode':old['mode'],'device':old['device'],'inode':old['inode'],'planPin':pin})
 assert len(roots)==140 and len({x['path'] for x in roots})==140
 for i,a in enumerate(roots):
  for b in roots[:i]:assert not (Path(a['path']) in Path(b['path']).parents or Path(b['path']) in Path(a['path']).parents),'overlapping named roots'
 return roots,prep

@contextmanager
def root_fd(root):
 p=guard(Path(root['path']));fd=os.open(p,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:
  assert ident(os.fstat(fd))==tuple(root[k] for k in ('mode','device','inode'))
  assert ident(p.lstat())==ident(os.fstat(fd)) and stat.S_ISDIR(p.lstat().st_mode)
  yield fd
 finally:os.close(fd)

def membership(roots,destination=None):
 rows={};sink=gzip.open(destination,'xt',encoding='utf-8') if destination else None
 def add(row):
  key=row['path']
  if key in rows:assert rows[key]==row,'member moved during scan: '+key
  else:
   rows[key]=row
   if sink:sink.write(json.dumps(row,sort_keys=True,separators=(',',':'))+'\n')
 try:
  for root in roots:
   rp=Path(root['path'])
   with root_fd(root) as fd:
    for rel,ds,fs,dfd in os.fwalk('.',topdown=True,follow_symlinks=False,dir_fd=fd):
     current=rp/Path(rel);add(meta(current,os.fstat(dfd)))
     for name in sorted(ds+fs):add(meta(current/name,os.stat(name,dir_fd=dfd,follow_symlinks=False),dfd,name))
  return rows
 finally:
  if sink:sink.close()

@contextmanager
def parent_fd(root,path,before):
 p=Path(path);rp=Path(root['path']);rel=p.relative_to(rp);assert rel.parts and p!=rp
 with root_fd(root) as rfd:
  fd=os.dup(rfd)
  try:
   running=rp
   for part in rel.parts[:-1]:
    nxt=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd);os.close(fd);fd=nxt;running/=part
    expected=before[str(running)];assert expected['kind']=='directory'
    assert ident(os.fstat(fd))==tuple(expected[k] for k in ('mode','device','inode'))
   yield fd
  finally:os.close(fd)

def counts(rows):return dict(collections.Counter(x['kind'] for x in rows.values()))

try:
 roots,prep=load_roots();root_paths={x['path'] for x in roots}
 if not EXECUTE:
  output('preparation-joins.json',{'status':'PREPARED_EMPTY_DESCENDANT_RMDIR_ONLY','namedRoots':140,'plans':prep['rootPlanPins'],'allRootIdentitiesMatched':True,'batch03Excluded':True,'directoriesRemoved':0,'fileBodyHashes':0,'requiresSeparateRootRelease':True})
  emit('PREPARED_EMPTY_DESCENDANT_RMDIR_ONLY',namedRoots=140)
 else:
  phase='exact_root_release'
  activation=json.loads((W/'rmdir-activation.json').read_bytes())
  assert activation['operation']=='T287_COMMENTARY_CLEANUP_EMPTY_DIRS_04' and activation['rmdirAuthorized'] is True and activation['approvedNamedRoots']==140
  for key in ('RootReleasePin','PreparationFreezePin','HelperPin'):verify_pin(activation[key])
  phase='selected_metadata_preflight';before=membership(roots,E/'before-membership.jsonl.gz')
  dirs=[x for x in before.values() if x['kind']=='directory' and x['path'] not in root_paths]
  dirs.sort(key=lambda x:(len(Path(x['path']).parts),x['path']),reverse=True)
  output('preflight.json',{'status':'COMPLETE_BEFORE_RMDIR','namedRoots':140,'descendantDirectories':len(dirs),'membership':counts(before),'fileBodyHashes':0,'allFilesAndNonregularsProtected':True})
  emit('preflight_complete',descendantDirectories=len(dirs),membership=counts(before))
  phase='empty_only_bottom_up_rmdir';ledger=E/'rmdir-ledger.jsonl';fd=os.open(ledger,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_APPEND,0o644);nonempty=0
  try:
   for row in dirs:
    p=Path(row['path']);root=next(x for x in roots if Path(x['path']) in p.parents)
    with parent_fd(root,p,before) as parent:
     leaf=p.name;st=os.stat(leaf,dir_fd=parent,follow_symlinks=False)
     assert stat.S_ISDIR(st.st_mode) and ident(st)==tuple(row[k] for k in ('mode','device','inode')),str(p)
     child=os.open(leaf,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
     try:
      assert ident(os.fstat(child))==ident(st)
      if os.listdir(child):nonempty+=1;continue
      latest=os.stat(leaf,dir_fd=parent,follow_symlinks=False);assert stat.S_ISDIR(latest.st_mode) and ident(latest)==ident(st)
      try:os.rmdir(leaf,dir_fd=parent)
      except OSError as error:
       if error.errno in (errno.ENOTEMPTY,errno.EEXIST):nonempty+=1;continue
       raise
      removed.append(row['path']);entry={'sequence':len(removed),**row,'effect':'rmdir_actual_empty_descendant','syscallEnforcedEmpty':True}
      b=(json.dumps(entry,sort_keys=True,separators=(',',':'))+'\n').encode();assert os.write(fd,b)==len(b)
     finally:os.close(child)
    if len(removed) and len(removed)%1000==0:emit('rmdir_progress',removed=len(removed))
   os.fsync(fd)
  finally:os.close(fd)
  phase='metadata_conservation';after=membership(roots)
  assert set(after)==set(before)-set(removed),'membership differs from only removed empty directories'
  assert all(row==before[p] for p,row in after.items()),'unlisted member metadata changed'
  assert root_paths<=set(after) and all(after[p]['kind']=='directory' for p in root_paths)
  load_roots()
  result={'operation':activation['operation'],'status':'CLOSED_GO_EMPTY_DESCENDANT_CONSERVATION','removedDirectories':len(removed),'namedRootsPreserved':140,'beforeMembership':counts(before),'afterMembership':counts(after),'allRemainingFilesNonregularsAndDirectoryMetadataUnchanged':True,'membershipEqualsBeforeMinusOnlyRmdirLedger':True,'fileBodyHashes':0,'unlinks':0,'rmtree':0,'nonemptyDirectoriesPreserved':nonempty,'elapsedSeconds':time.monotonic()-START,'workerPid':os.getpid(),'synchronousNoChildren':True,'CodeGitRuntimeNetworkBuildEffects':0}
  output('result.json',result);emit('CLOSED_GO_EMPTY_DESCENDANT_CONSERVATION',**result)
except BaseException as error:
 output('stop.json',{'phase':phase,'errorType':type(error).__name__,'error':str(error),'removedDirectories':len(removed),'removedPaths':removed,'unlinks':0,'fileBodyHashes':0,'noForceRetryRepair':True})
 raise
