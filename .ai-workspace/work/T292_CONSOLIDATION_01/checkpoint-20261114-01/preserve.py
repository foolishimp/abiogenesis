"""T292 explicit checkpoint Writer: preserve before any worktree removal."""
from pathlib import Path
import collections,hashlib,json,os,shutil,stat,subprocess,tarfile
ROOT=Path('/Users/jim/src/apps/abiogenesis');OUT=Path(__file__).resolve().parent
KEEP=Path('/private/tmp/abg-rc13-composed-final-04')
CACHES={'node_modules','build','node-compile-cache','npm-cache','.npm','_cacache','__pycache__'}
def git(*args,cwd=ROOT):return subprocess.check_output(['git',*args],cwd=cwd)
def save(p,v):
 with p.open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def digest(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def entry(p,rel):
 s=p.lstat();r={'path':rel,'mode':stat.S_IMODE(s.st_mode)}
 if p.is_symlink():r.update(kind='symlink',target=os.readlink(p))
 else:
  assert stat.S_ISREG(s.st_mode),str(p);r.update(kind='file',bytes=s.st_size,sha256=digest(p))
 return r
def names(p,ignored=False):
 args=['ls-files','--others','--exclude-standard','-z']
 if ignored:args.insert(2,'--ignored')
 return [os.fsdecode(v) for v in git(*args,cwd=p).split(b'\0') if v]
def pack(p,selected,target):
 rows=[entry(p/n,n) for n in sorted(set(selected))]
 with tarfile.open(target,'w:gz',compresslevel=6,dereference=False) as tf:
  for r in rows:tf.add(p/r['path'],arcname=r['path'],recursive=False)
 with tarfile.open(target,'r:gz') as tf:
  members=tf.getmembers();assert [m.name for m in members]==[r['path'] for r in rows]
  for m,r in zip(members,rows):
   if r['kind']=='symlink':assert m.issym() and m.linkname==r['target']
   else:
    with tf.extractfile(m) as f:assert hashlib.file_digest(f,'sha256').hexdigest()==r['sha256']
    assert m.size==r['bytes']
 save(target.with_suffix(target.suffix+'.members.json'),rows)
 return {'path':str(target.relative_to(ROOT)),'bytes':target.stat().st_size,'sha256':digest(target),'members':len(rows),'sourceBytes':sum(r.get('bytes',0) for r in rows),'verified':True}
main_names=[n for n in names(ROOT) if not n.startswith(OUT.relative_to(ROOT).as_posix()+'/')]
save(OUT/'MAIN_OUTSTANDING.json',{'startingMain':git('rev-parse','HEAD').decode().strip(),'count':len(main_names),'files':[{'path':n,'bytes':(ROOT/n).lstat().st_size,'symlink':(ROOT/n).is_symlink()} for n in main_names]})
rows=[]
for block in git('worktree','list','--porcelain').decode().strip().split('\n\n'):
 d=dict((l.split(' ',1)+[''])[:2] for l in block.splitlines());p=Path(d['worktree']);r={**d,'disposition':'keep' if p in [ROOT,KEEP] else 'remove_after_verified_checkpoint'}
 assert subprocess.run(['git','merge-base','--is-ancestor',d['HEAD'],'main'],cwd=ROOT).returncode==0,d
 if r['disposition']=='keep':rows.append(r);continue
 r['allocatedKiBBefore']=int(subprocess.check_output(['du','-sk',str(p)]).split()[0])
 if not (p/'.git').is_file():
  residual=[entry(Path(a)/n,(Path(a)/n).relative_to(p).as_posix()) for a,ds,ns in os.walk(p) for n in ns]
  assert all(x['kind']=='symlink' and '/node_modules/.bin/' in '/'+x['path'] for x in residual),residual
  r['staleRegistration']=True;r['residual']=residual;rows.append(r);continue
 tracked=git('status','--porcelain=v1','-uno',cwd=p).decode().splitlines();r['trackedStatus']=tracked
 untracked=names(p);ignored=names(p,True);retain=[n for n in ignored if not CACHES.intersection(Path(n).parts)]
 r['untrackedCount']=len(untracked);r['ignoredEvidenceCount']=len(retain);r['discardedIgnoredReproducibleCount']=len(ignored)-len(retain)
 here=OUT/'worktrees'/p.name;here.mkdir(parents=True)
 for label,args in [('unstaged.patch',['diff','--binary']),('staged.patch',['diff','--cached','--binary'])]:
  data=git(*args,cwd=p);r[label+'Sha256']=hashlib.sha256(data).hexdigest()
  if data:(here/label).write_bytes(data)
 changed=[os.fsdecode(x) for x in git('diff','HEAD','--name-only','-z',cwd=p).split(b'\0') if x]
 r['dirtyTrackedFiles']=[entry(p/n,n) for n in changed if (p/n).exists() or (p/n).is_symlink()]
 if changed:r['trackedArchive']=pack(p,[x['path'] for x in r['dirtyTrackedFiles']],here/'tracked-postimages.tar.gz')
 if untracked or retain:r['localArchive']=pack(p,untracked+retain,here/'local-files.tar.gz')
 rows.append(r);print(json.dumps({'preserved':str(p),'dirty':len(changed),'localFiles':len(untracked)+len(retain)}),flush=True)
save(OUT/'WORKTREES_BEFORE.json',rows)
# The retained historical baseline must not depend on a removed worktree.
link=Path('/private/tmp/abg-td26p5-work/codex-resume/base-tenant/node_modules')
assert link.is_symlink();target=link.resolve();assert target==Path('/private/tmp/abg-td26p5/build_tenants/abiogenesis/typescript/node_modules')
copy=link.with_name('node_modules.checkpoint-copy');assert not copy.exists()
subprocess.run(['cp','-cR',str(target),str(copy)],check=True)
def tree(root):
 result=[]
 for a,ds,ns in os.walk(root,followlinks=False):
  for n in list(ds):
   p=Path(a)/n
   if p.is_symlink():result.append(entry(p,p.relative_to(root).as_posix()));ds.remove(n)
  for n in ns:
   p=Path(a)/n;result.append(entry(p,p.relative_to(root).as_posix()))
 return sorted(result,key=lambda r:r['path'])
before=tree(target);after=tree(copy);assert before==after
link.unlink();copy.rename(link);assert tree(link)==before
save(OUT/'BASELINE_DEPENDENCY_CONTINUITY.json',{'path':str(link),'oldLinkTarget':str(target),'operation':'replaced symlink with byte-identical physical clone','members':len(before),'manifestSha256':hashlib.sha256(json.dumps(before,sort_keys=True).encode()).hexdigest(),'allMembersEqual':True,'baselineBuildAndManifestUnchanged':True})
# Preserve the complete stopped campaign receipts; test temporary stores stay
# outside this cleanup and the current proof worktree remains.
proof=Path('/private/tmp/abg-rc13-composed-proof-20261113/broad-04');dest=OUT/'broad-04';assert not dest.exists();shutil.copytree(proof,dest,symlinks=True)
for p in proof.rglob('*'):
 if p.is_file():assert digest(p)==digest(dest/p.relative_to(proof))
for n in ['broad-driver.stdout','broad-driver.stderr']:
 p=proof.parent/'reentry-04'/n;shutil.copy2(p,OUT/n)
h=json.loads((proof/'HALT.json').read_text());cases=[r for r in h['completedResults'] if 'file' in r]
save(OUT/'CAMPAIGN_STATUS.json',{'status':'halted','source':'a2626fa540d39cc9894b8a90895a3739b49b75fb','completedFiles':len(cases),'pass':sum(r['counts']['pass'] for r in cases),'skipped':sum(r['counts']['skipped'] for r in cases),'failedFile':'069-t287-f04a-probabilistic-result-candidate.test','failedTests':2,'failureAt':h['at'],'triage':'not performed by checkpoint task','clock':'original campaign expired, not reset','history':'unperformed','installation':'unperformed'})
print(json.dumps({'status':'PRESERVED_NOT_YET_REMOVED','worktrees':len(rows),'mainOutstanding':len(main_names),'baselineDependencyMembers':len(before)}),flush=True)
