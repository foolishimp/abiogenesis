"""One pinned root, one child-count table, linear bottom-up empty-only rmdir."""
from pathlib import Path
from contextlib import contextmanager
import collections, errno, gzip, hashlib, json, os, stat, sys, time
R=Path('/Users/jim/src/apps/abiogenesis')
W=R/'.ai-workspace/work/T287_COMMENTARY_CLEANUP_05'; E=R/'.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_05'
EXECUTE=sys.argv[1:]==['--execute'];assert sys.argv[1:] in ([],['--prepare'],['--execute'])
START=time.monotonic();removed=[];phase='root_and_authority'

def output(name,obj):
 p=E/name;assert not p.exists(),str(p);p.write_text(json.dumps(obj,sort_keys=True,separators=(',',':'))+'\n')

def emit(stage,**fields):print(json.dumps({'stage':stage,'elapsedSeconds':time.monotonic()-START,**fields}),flush=True)

def ident(st):return (stat.S_IMODE(st.st_mode),st.st_dev,st.st_ino)

def relpath(base,name=None):
 p=Path(base) if name is None else Path(base)/name
 return str(p)

def is_git(rel):return '.git' in Path(rel).parts

def metadata(rel,st,fd=None,name=None):
 kind='directory' if stat.S_ISDIR(st.st_mode) else 'file' if stat.S_ISREG(st.st_mode) else 'symlink' if stat.S_ISLNK(st.st_mode) else 'nonregular'
 d={'path':rel,'kind':kind,'mode':stat.S_IMODE(st.st_mode),'device':st.st_dev,'inode':st.st_ino}
 if kind!='directory':d.update(bytes=st.st_size,mtimeNs=st.st_mtime_ns,ctimeNs=st.st_ctime_ns)
 if kind=='symlink':d['target']=os.readlink(name,dir_fd=fd)
 return d

def verify_pin(pin):
 p=Path(pin['path']);assert p.is_absolute() and (p==R or R in p.parents)
 for q in (p,*p.parents):assert not q.is_symlink(),str(q)
 b=p.read_bytes();assert (len(b),hashlib.sha256(b).hexdigest())==(pin['bytes'],pin['sha256'])

@contextmanager
def root_fd(root):
 p=Path(root['path']);assert p.is_absolute() and R in p.parents
 for q in (p,*p.parents):assert not q.is_symlink(),str(q)
 fd=os.open(p,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:
  assert stat.S_ISDIR(os.fstat(fd).st_mode) and ident(os.fstat(fd))==tuple(root[k] for k in ('mode','device','inode'))
  assert stat.S_ISDIR(p.lstat().st_mode) and ident(p.lstat())==ident(os.fstat(fd))
  yield fd
 finally:os.close(fd)

def membership(root,destination=None):
 rows={};child_counts={};sink=gzip.open(destination,'xt',encoding='utf-8') if destination else None
 def add(row):
  key=row['path']
  if key in rows:assert rows[key]==row,'member moved during scan: '+key
  else:
   rows[key]=row
   if sink:sink.write(json.dumps(row,sort_keys=True,separators=(',',':'))+'\n')
 try:
  with root_fd(root) as fd:
   for rel,ds,fs,dfd in os.fwalk('.',topdown=True,follow_symlinks=False,dir_fd=fd):
    key=relpath(rel);add(metadata(key,os.fstat(dfd)));child_counts[key]=len(ds)+len(fs)
    for name in ds+fs:add(metadata(relpath(rel,name),os.stat(name,dir_fd=dfd,follow_symlinks=False),dfd,name))
  return rows,child_counts
 finally:
  if sink:sink.close()

def counts(rows):return dict(collections.Counter(r['kind'] for r in rows.values()))

try:
 prep=json.loads((W/'activation.json').read_bytes());assert prep['operation']=='T287_COMMENTARY_CLEANUP_EMPTY_DIRS_05_PREPARE' and prep['rmdirAuthorized'] is False
 root=prep['root']
 with root_fd(root):pass
 if not EXECUTE:
  output('preparation-joins.json',{'status':'PREPARED_SINGLE_ROOT_LINEAR_EMPTY_ONLY','root':root,'rootIdentityMatched':True,'allGitRoutesProtected':True,'noMembershipBodyScanYet':True,'rmdir':0,'fileBodyHashes':0})
  emit('PREPARED_SINGLE_ROOT_LINEAR_EMPTY_ONLY',roots=1)
 else:
  a=json.loads((W/'rmdir-activation.json').read_bytes());assert a['operation']=='T287_COMMENTARY_CLEANUP_EMPTY_DIRS_05' and a['rmdirAuthorized'] is True and a['root']==root
  for key in ('RootReleasePin','HelperPin','PreparationFreezePin'):verify_pin(a[key])
  phase='linear_metadata_preflight';before,child_counts=membership(root,E/'before-membership.jsonl.gz')
  eligible=sum(k!='.' and not is_git(k) for k in child_counts)
  output('preflight.json',{'status':'COMPLETE_BEFORE_RMDIR','root':root,'membership':counts(before),'eligibleDescendantDirectories':eligible,'allGitRoutesProtected':True,'fileBodyHashes':0})
  emit('preflight_complete',membership=counts(before),eligibleDescendantDirectories=eligible)
  phase='linear_bottom_up_empty_only';ledger=E/'rmdir-ledger.jsonl';lfd=os.open(ledger,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_APPEND,0o644);skipped=0
  try:
   with root_fd(root) as fd:
    for rel,ds,fs,dfd in os.fwalk('.',topdown=False,follow_symlinks=False,dir_fd=fd):
     current=relpath(rel);parent_row=before[current];assert parent_row['kind']=='directory' and ident(os.fstat(dfd))==tuple(parent_row[k] for k in ('mode','device','inode'))
     if is_git(current):continue
     for leaf in ds:
      key=relpath(rel,leaf);row=before[key]
      if row['kind']!='directory' or is_git(key):continue
      if child_counts[key]:skipped+=1;continue
      st=os.stat(leaf,dir_fd=dfd,follow_symlinks=False);assert stat.S_ISDIR(st.st_mode) and ident(st)==tuple(row[k] for k in ('mode','device','inode')),key
      cfd=os.open(leaf,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=dfd)
      try:
       assert ident(os.fstat(cfd))==ident(st)
       if os.listdir(cfd):skipped+=1;continue
       latest=os.stat(leaf,dir_fd=dfd,follow_symlinks=False);assert stat.S_ISDIR(latest.st_mode) and ident(latest)==ident(st)
       try:os.rmdir(leaf,dir_fd=dfd)
       except OSError as error:
        if error.errno in (errno.ENOTEMPTY,errno.EEXIST):skipped+=1;continue
        raise
       removed.append(key);child_counts[current]-=1;assert child_counts[current]>=0
       item={'sequence':len(removed),**row,'effect':'rmdir_actual_empty_descendant','syscallEnforcedEmpty':True}
       b=(json.dumps(item,sort_keys=True,separators=(',',':'))+'\n').encode();assert os.write(lfd,b)==len(b)
       if len(removed)%5000==0:emit('rmdir_progress',removed=len(removed))
      finally:os.close(cfd)
   os.fsync(lfd)
  finally:os.close(lfd)
  phase='linear_metadata_conservation';after,_=membership(root)
  assert set(after)==set(before)-set(removed),'membership differs from exact empty-dir removals'
  assert all(row==before[k] for k,row in after.items()),'remaining member metadata changed'
  assert '.' in after and after['.']['kind']=='directory' and not any(is_git(k) for k in removed)
  result={'operation':a['operation'],'status':'CLOSED_GO_SINGLE_ROOT_EMPTY_CONSERVATION','root':root,'removedDirectories':len(removed),'namedRootPreserved':True,'allFilesNonregularsAndGitPreserved':True,'beforeMembership':counts(before),'afterMembership':counts(after),'exactMembershipMinusRmdirLedger':True,'remainingMetadataDifferences':0,'unlinks':0,'fileBodyHashes':0,'rmtree':0,'nonemptyDirectoriesPreserved':skipped,'elapsedSeconds':time.monotonic()-START,'workerPid':os.getpid(),'synchronousNoChildren':True,'CodeGitRuntimeNetworkBuildCommentsByteEffects':0}
  output('result.json',result);emit('CLOSED_GO_SINGLE_ROOT_EMPTY_CONSERVATION',**result)
except BaseException as error:
 output('stop.json',{'phase':phase,'errorType':type(error).__name__,'error':str(error),'removedDirectories':len(removed),'removedPaths':removed,'unlinks':0,'fileBodyHashes':0,'noForceRetryRepair':True})
 raise
