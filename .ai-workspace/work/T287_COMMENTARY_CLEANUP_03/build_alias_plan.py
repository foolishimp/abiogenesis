"""Root-selected explicit alias projection; reuse first-pass copy hashes, no deletion."""
from pathlib import Path
import collections, errno, hashlib, json, os, stat, time

R=Path('/Users/jim/src/apps/abiogenesis')
W=R/'.ai-workspace/work/T287_COMMENTARY_CLEANUP_03'
E=R/'.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_03'
F=E/'alias-final'
activation=json.loads((W/'alias-continuation-activation.json').read_bytes())
assert activation['operation']=='T287_COMMENTARY_CLEANUP_DOWNSTREAM_ALIAS_PLAN_03'
plan=json.loads((E/'plan.json').read_bytes())
C=Path(plan['candidateRoot']);O=Path(plan['originalRoot']);T=Path(activation['physicalOwner'])
A=activation['copyRelativePrefixA'];B=activation['repeatLeadingPrefixB'];START=time.monotonic();cost=collections.Counter()

def write(name,obj):
 p=F/name;assert not p.exists();p.write_text(json.dumps(obj,sort_keys=True,separators=(',',':'))+'\n')

def tuple_for(s):return (s.st_size,stat.S_IMODE(s.st_mode),s.st_dev,s.st_ino)
def identity(s):return (stat.S_IMODE(s.st_mode),s.st_dev,s.st_ino)

def directory_fd(rootfd,parts):
 fd=os.dup(rootfd)
 try:
  for part in parts:
   assert part not in ('','..','.');n=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd);os.close(fd);fd=n
  return fd
 except BaseException:os.close(fd);raise

def hash_at(parent,name,path):
 fd=os.open(name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
 try:
  s=os.fstat(fd);assert stat.S_ISREG(s.st_mode);h=hashlib.sha256()
  while True:
   b=os.read(fd,1024*1024)
   if not b:break
   h.update(b)
  z=os.fstat(fd);cur=os.stat(name,dir_fd=parent,follow_symlinks=False)
  fields=lambda x:(*tuple_for(x),x.st_mtime_ns,x.st_ctime_ns,x.st_nlink)
  assert fields(s)==fields(z)==fields(cur),'original movement: '+path
  cost['distinctOriginalHashReads']+=1;cost['distinctOriginalHashBytes']+=s.st_size
  return {'path':path,'bytes':s.st_size,'sha256':h.hexdigest(),'mode':stat.S_IMODE(s.st_mode),'device':s.st_dev,'inode':s.st_ino}
 finally:os.close(fd)

def alias_mapping(rel):
 if not rel.startswith(A):return None,0
 suffix=rel[len(A):];levels=1
 while suffix.startswith(B):suffix=suffix[len(B):];levels+=1
 assert levels<=2,'unselected deeper alias projection: '+rel
 assert suffix and not suffix.startswith('/') and all(x not in ('','..','.') for x in suffix.split('/'))
 return str(T/suffix),levels

first=json.loads((E/'freeze.json').read_bytes())
assert first['status']=='CLOSED' and hashlib.sha256((E/'freeze.json').read_bytes()).hexdigest()==activation['firstPassFreezeSHA256']
for row in first['records']:
 p=R/row['path'];b=p.read_bytes();assert (len(b),hashlib.sha256(b).hexdigest(),stat.S_IMODE(p.lstat().st_mode))==(row['bytes'],row['sha256'],row['mode'])
candidate_old=json.loads((E/'candidate-files.json').read_bytes());old_originals=json.loads((E/'original-witnesses.json').read_bytes())
protected=json.loads((E/'protected-files.json').read_bytes());unproved=json.loads((E/'excluded-unproved-files.json').read_bytes())
ctx=json.loads((E/'context-pins.json').read_bytes())
link=activation['existingAlias'];lp=Path(link['path']);ls=lp.lstat()
assert stat.S_ISLNK(ls.st_mode) and os.readlink(lp)==link['target'] and identity(ls)==tuple(link[k] for k in ('mode','device','inode'))
assert Path(os.path.normpath(str(lp.parent/link['target'])))==T
for root in (C,O,T):
 for p in (root,*root.parents):assert not p.is_symlink(),str(p)
assert identity(T.lstat())==tuple(activation['physicalOwnerIdentity'][k] for k in ('mode','device','inode'))

# Reacquire copy identities from the measured stopped rows without another body/tree scan.
cfd=os.open(C,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW);tfd=os.open(T,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
all_rows=candidate_old+protected+unproved
last_parent=None;parent_fd=None
try:
 for row in sorted(all_rows,key=lambda x:x['path']):
  rel=Path(row['path']);parent=rel.parts[:-1]
  if parent!=last_parent:
   if parent_fd is not None:os.close(parent_fd)
   parent_fd=directory_fd(cfd,parent);last_parent=parent
  s=os.stat(rel.name,dir_fd=parent_fd,follow_symlinks=False)
  assert stat.S_ISREG(s.st_mode) and tuple_for(s)==tuple(row[k] for k in ('bytes','mode','device','inode')),'copied identity moved: '+row['path']
finally:
 if parent_fd is not None:os.close(parent_fd)
 os.close(cfd)

combined=[];origins={};remaining=[];mapped=[];level_counts=collections.Counter();groups=collections.defaultdict(list)
for row,origin in zip(candidate_old,old_originals):
 x=dict(row);x['originalPath']=str(O/origin['path']);x['originKind']='literal_canonical_downstream';combined.append(x)
 o=dict(origin);o['path']=x['originalPath'];origins[o['path']]=o
for row in unproved:
 original,level=alias_mapping(row['path'])
 if original is None:remaining.append(dict(row));continue
 level_counts[level]+=1;groups[original].append((row,level))

try:
 for i,(original,copies) in enumerate(sorted(groups.items()),1):
  rel=Path(original).relative_to(T);reason=None;parent=None
  try:
   parent=directory_fd(tfd,rel.parts[:-1])
   try:s=os.stat(rel.name,dir_fd=parent,follow_symlinks=False)
   except FileNotFoundError:s=None
   if s is None or not stat.S_ISREG(s.st_mode):reason='physical_owner_original_missing_or_nonregular'
   else:
    origin=hash_at(parent,rel.name,original);origins[original]=origin
  except OSError as error:
   if error.errno not in (errno.ENOENT,errno.ENOTDIR,errno.ELOOP):raise
   reason='physical_owner_missing_nonregular_or_other_symlink_component'
  finally:
   if parent is not None:os.close(parent)
  for row,level in copies:
   x=dict(row);x.pop('classification',None);x.pop('reason',None);x['originalPath']=original;x['aliasLevels']=level
   if reason is None and (x['bytes'],x['sha256'])==(origin['bytes'],origin['sha256']):
    x['originKind']='explicit_existing_alias_to_physical_T';combined.append(x)
   else:
    x['classification']='PROTECTED_UNPROVED_COPY';x['reason']=reason or 'different_physical_owner_original_body';remaining.append(x)
  if i%10000==0:print(json.dumps({'stage':'explicit_alias_original_compare','distinctOriginalsCompleted':i,'distinctOriginalsTotal':len(groups),'combinedCandidates':len(combined),'elapsedSeconds':time.monotonic()-START,'hashReadBytes':cost['distinctOriginalHashBytes']}),flush=True)
finally:os.close(tfd)

for p in ctx:
 q=Path(p['path']);b=q.read_bytes();s=q.lstat();assert (len(b),hashlib.sha256(b).hexdigest(),*identity(s))==(p['bytes'],p['sha256'],p['mode'],p['device'],p['inode'])
ls=lp.lstat();assert os.readlink(lp)==link['target'] and identity(ls)==tuple(link[k] for k in ('mode','device','inode'))
assert identity(T.lstat())==tuple(activation['physicalOwnerIdentity'][k] for k in ('mode','device','inode'))
combined.sort(key=lambda x:x['path']);remaining.sort(key=lambda x:x['path'])
used={x['originalPath'] for x in combined};witnesses=[origins[k] for k in sorted(used)]
assert len(combined)+len(protected)+len(remaining)==222229
assert sum(x['bytes'] for x in combined+protected+remaining)==10196841075
assert {x['path'] for x in combined}.isdisjoint(x['path'] for x in protected+remaining)
for row in combined:
 origin=origins[row['originalPath']];assert (row['bytes'],row['sha256'])==(origin['bytes'],origin['sha256'])
reasons=collections.defaultdict(lambda:{'files':0,'bytes':0})
for x in remaining:reasons[x['reason']]['files']+=1;reasons[x['reason']]['bytes']+=x['bytes']
write('candidate-files.json',combined);write('original-witnesses.json',witnesses);write('protected-files.json',protected)
write('excluded-unproved-files.json',remaining);write('original-observations.json',[origins[k] for k in sorted(origins)])
write('alias-binding.json',{'operation':activation['operation'],'literalAlias':link,'physicalOwnerIdentity':activation['physicalOwnerIdentity'],'copyPrefixA':A,'repeatedLeadingPrefixB':B,'observedAliasLevelCounts':dict(level_counts),'maximumObservedLevels':2,'noOtherSymlinkFollowed':True,'firstPassFreezeSHA256':activation['firstPassFreezeSHA256']})
write('context-pins.json',ctx)
summary={'operation':activation['operation'],'status':'CLOSED_PLAN_ONLY_NO_DELETION','copyRoot':str(C),'physicalOriginalRoot':str(T),'copiedFiles':222229,'copiedBytes':10196841075,'candidateFiles':len(combined),'candidateBytes':sum(x['bytes'] for x in combined),'distinctOriginalWitnesses':len(witnesses),'protectedFiles':len(protected),'protectedBytes':sum(x['bytes'] for x in protected),'excludedUnprovedFiles':len(remaining),'excludedUnprovedBytes':sum(x['bytes'] for x in remaining),'exclusionReasons':dict(reasons),'aliasExpandedRows':sum(level_counts.values()),'distinctMappedOriginals':len(groups),'cost':dict(cost),'elapsedSeconds':time.monotonic()-START,'effects':{'deletion':0,'commentsWrites':0,'copyOriginalWrites':0,'GitBuildProductRuntimeNetworkEffects':0},'limits':['copy hashes reused from stopped immutable first pass, physical copied identity/mode/size reacquired','only this explicitly bound alias and repeated leading B normalized; unknown links remain protected','no native/Product/qualification or space-reclaimed claim','Root exact independent review and separate deletion grant still required']}
write('summary.json',summary);print(json.dumps(summary),flush=True)
