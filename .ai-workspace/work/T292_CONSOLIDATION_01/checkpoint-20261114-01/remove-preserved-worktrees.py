"""Remove only the exact obsolete worktrees after their verified main checkpoint."""
from pathlib import Path
import hashlib,json,os,shutil,subprocess,sys
ROOT=Path('/Users/jim/src/apps/abiogenesis');OUT=Path(__file__).resolve().parent
checkpoint=sys.argv[1]
def git(*args,cwd=ROOT):return subprocess.check_output(['git',*args],cwd=cwd)
def sha(data):return hashlib.sha256(data).hexdigest()
assert git('rev-parse','HEAD').decode().strip()==checkpoint
assert git('branch','--show-current').decode().strip()=='main'
rows=json.loads((OUT/'WORKTREES_BEFORE.json').read_text());selected=[r for r in rows if r['disposition']=='remove_after_verified_checkpoint']
roots=[Path(r['worktree']) for r in selected]
assert len(roots)==19 and all(str(p).startswith('/private/tmp/abg-') and not p.is_symlink() for p in roots)
assert Path('/private/tmp/abg-rc13-composed-final-04') not in roots
# Confirm the archive bytes are actually in the committed main tree.
for r in selected:
 assert subprocess.run(['git','merge-base','--is-ancestor',r['HEAD'],checkpoint],cwd=ROOT).returncode==0
 for key in ['localArchive','trackedArchive']:
  if key in r:
   a=r[key];data=git('show',checkpoint+':'+a['path']);assert len(data)==a['bytes'] and sha(data)==a['sha256']
# Preserve any checkout which acquired an open process dependency since intake.
scan=subprocess.run(['/usr/sbin/lsof','-n','-P','-Fpn'],capture_output=True,text=True,timeout=60)
assert scan.returncode in [0,1],scan.stderr[:500]
opened=[];pid=None
for line in scan.stdout.splitlines():
 if line.startswith('p'):pid=line[1:]
 if line.startswith('n'):
  name=line[1:]
  for p in roots:
   if name==str(p) or name.startswith(str(p)+'/'):opened.append({'worktree':str(p),'pid':pid,'path':name})
assert not opened,opened
baseline=Path('/private/tmp/abg-td26p5-work/codex-resume/base-tenant/node_modules');assert baseline.is_dir() and not baseline.is_symlink()
removed=[]
for r in selected:
 p=Path(r['worktree'])
 if r.get('staleRegistration'):continue
 assert git('rev-parse','HEAD',cwd=p).decode().strip()==r['HEAD']
 assert git('status','--porcelain=v1','-uno',cwd=p).decode().splitlines()==r['trackedStatus']
 for label,args in [('unstaged.patch',['diff','--binary']),('staged.patch',['diff','--cached','--binary'])]:assert sha(git(*args,cwd=p))==r[label+'Sha256']
 files=[os.fsdecode(x) for x in git('ls-files','--others','--exclude-standard','-z',cwd=p).split(b'\0') if x];assert len(files)==r['untrackedCount']
 # Recheck every preserved original byte immediately before removal.
 here=OUT/'worktrees'/p.name
 for manifest in here.glob('*.members.json'):
  for f in json.loads(manifest.read_text()):
   source=p/f['path']
   if f['kind']=='symlink':assert source.is_symlink() and os.readlink(source)==f['target']
   else:
    assert source.stat().st_size==f['bytes']
    with source.open('rb') as h:assert hashlib.file_digest(h,'sha256').hexdigest()==f['sha256']
 subprocess.run(['git','worktree','remove','--force',str(p)],cwd=ROOT,check=True)
 assert not p.exists();removed.append(str(p));print(json.dumps({'removed':str(p)}),flush=True)
# Two stale registrations contain only empty directories and four broken npm
# executable links; their exact residuals are recorded, with no source content.
for r in selected:
 if not r.get('staleRegistration'):continue
 p=Path(r['worktree']);actual=[]
 for d,ds,ns in os.walk(p):
  for n in ns:
   q=Path(d)/n;assert q.is_symlink();actual.append({'path':q.relative_to(p).as_posix(),'target':os.readlink(q)})
 expected=[{'path':x['path'],'target':x['target']} for x in r['residual']]
 assert sorted(actual,key=lambda x:x['path'])==sorted(expected,key=lambda x:x['path'])
 shutil.rmtree(p);removed.append(str(p));print(json.dumps({'removedStaleResidue':str(p)}),flush=True)
subprocess.run(['git','worktree','prune','--expire','now'],cwd=ROOT,check=True)
after=git('worktree','list','--porcelain').decode();remaining=[l[9:] for l in after.splitlines() if l.startswith('worktree ')]
assert set(remaining)=={str(ROOT),'/private/tmp/abg-rc13-composed-final-04'}
result={'checkpointCommit':checkpoint,'removedWorktrees':removed,'removedLiveWorktrees':17,'prunedStaleRegistrations':2,'remainingWorktrees':remaining,'allocatedKiBOfRemovedTreesBefore':sum(r['allocatedKiBBefore'] for r in selected),'spaceClaim':'Pre-removal du allocation, not an exact APFS space-reclamation claim','allHeadsAlreadyInMain':True,'allPreservedArchivesVerifiedInCommit':True,'openProcessDependencies':opened,'baselineDependenciesPreserved':True,'branchesDeleted':False,'pushed':False,'rc13Qualified':False}
(OUT/'RESULT.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ['removedWorktrees']}),flush=True)
