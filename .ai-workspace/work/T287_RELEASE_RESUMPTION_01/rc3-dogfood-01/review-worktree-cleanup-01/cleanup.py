#!/usr/bin/env python3
"""Root-authorized five-worktree cleanup; moves ignored areas without clobber, then normal Git remove."""
import ctypes,errno,hashlib,json,os,pathlib,subprocess,sys,time
from pathlib import Path
REPO=Path('/Users/jim/src/apps/abiogenesis')
SUITE=Path('/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/suite')
OUT=REPO/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/review-worktree-cleanup-01'
TARGETS={'wt-7da76d7d7':'7da76d7d7d70614080f475dc39f5d0e6161ef653','wt-7e3fefa46':'7e3fefa46676cf6a5afdc29f677b9cb2c2e87fdc','wt-8db237d2a':'8db237d2a379e39be100f4fd7f0cd9f7e02525ac','wt-92498a2d2':'92498a2d29eca294d851557753cbda2fe047c357','wt-ddc1b091c':'ddc1b091cd201f803e8a9f235c1a9a7c52f831fc'}
ROOT='build_tenants/abiogenesis/typescript/'
AREAS=[ROOT+'build',ROOT+'node_modules',ROOT+'test_env/evidence',ROOT+'test_env/test_runs']
EXPECTED={f'!! {ROOT}build/',f'!! {ROOT}node_modules/',f'!! {ROOT}test_env/test_runs/'}|{f'!! {ROOT}test_env/evidence/{name}' for name in ['abi5-non-root-alias-selection.json','abi5-root-r1.json','abi5-root-r2.json','abi5-root-r3.json','abi5-root-r6.json','abi5-root-r7.json','abi5-root-r8.json','t287-w2-05-generator-package.json']}
libc=ctypes.CDLL(None,use_errno=True);rename=libc.renamex_np;rename.argtypes=[ctypes.c_char_p,ctypes.c_char_p,ctypes.c_uint];rename.restype=ctypes.c_int

def write(p,obj):
 with p.open('x',encoding='utf8')as f:json.dump(obj,f,indent=2,sort_keys=True);f.write('\n')
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()
def tree_evidence(root):
 out=[]
 for folder,dirs,files in os.walk(root,followlinks=False):
  dirs.sort();files.sort()
  for name in dirs+files:
   p=Path(folder)/name;s=p.lstat();rel=p.relative_to(root).as_posix()
   if p.is_symlink():out.append({'path':rel,'type':'symlink','target':os.readlink(p)})
   elif p.is_file():out.append({'path':rel,'type':'file','bytes':s.st_size,'sha256':digest(p)})
   elif not p.is_dir():raise ValueError('unsupported evidence node '+str(p))
 return out
def verify_evidence(root,rows):
 for r in rows:
  p=root/r['path']
  if r['type']=='symlink':
   if not p.is_symlink() or os.readlink(p)!=r['target']:raise ValueError('symlink drift '+str(p))
  elif p.is_symlink() or not p.is_file() or p.stat().st_size!=r['bytes'] or digest(p)!=r['sha256']:raise ValueError('evidence drift '+str(p))
def no_active(w):
 p=subprocess.run(['lsof','-nP','-F','pcfn'],capture_output=True,text=True,errors='replace')
 if p.returncode!=0 or p.stderr:raise ValueError('lsof incomplete: '+p.stderr[:300])
 pid=cmd=fd='';hits=[]
 for line in p.stdout.splitlines():
  tag,v=line[:1],line[1:]
  if tag=='p':pid=v;cmd='';fd=''
  elif tag=='c':cmd=v
  elif tag=='f':fd=v
  elif tag=='n' and (v==str(w) or v.startswith(str(w)+'/') or v==str(w).replace('/private/tmp/','/tmp/',1) or v.startswith(str(w).replace('/private/tmp/','/tmp/',1)+'/')):hits.append((pid,cmd,fd,v))
 if hits:raise ValueError('active open file or cwd: '+repr(hits[:5]))
 ps=subprocess.check_output(['ps','-axo','pid=,ppid=,comm=,args='],text=True,errors='replace')
 hits=[]
 for line in ps.splitlines():
  z=line.strip().split(None,3)
  if len(z)<4 or int(z[0]) in (os.getpid(),os.getppid()):continue
  if str(w) in z[3] or str(w).replace('/private/tmp/','/tmp/',1) in z[3]:hits.append((z[0],z[2]))
 if hits:raise ValueError('active process argument references worktree: '+repr(hits[:5]))
def validate(name,head):
 w=SUITE/name
 if w.resolve()!=w or not w.is_dir():raise ValueError('worktree root missing or noncanonical')
 if subprocess.check_output(['git','-C',str(w),'rev-parse','HEAD'],text=True).strip()!=head:raise ValueError('HEAD changed')
 if subprocess.run(['git','-C',str(w),'symbolic-ref','-q','HEAD'],stdout=subprocess.DEVNULL).returncode!=1:raise ValueError('HEAD not detached')
 subprocess.run(['git','-C',str(w),'merge-base','--is-ancestor',head,'refs/heads/main'],check=True)
 v=subprocess.check_output(['git','-C',str(w),'status','--porcelain=v1','-z','--untracked-files=all','--ignored=matching']);items={x.decode('utf8','surrogateescape') for x in v.split(b'\0') if x}
 if items!=EXPECTED:raise ValueError('tracked/untracked/ignored inventory changed: '+repr(sorted(items^EXPECTED)[:15]))
 raw=subprocess.check_output(['git','worktree','list','--porcelain'],cwd=REPO,text=True);block=next((q for q in raw.split('\n\n') if q.startswith('worktree '+str(w)+'\n')),None)
 if not block or 'HEAD '+head not in block or '\ndetached' not in block or '\nlocked' in block or '\nprunable' in block:raise ValueError('worktree registration changed')
 for rel in AREAS:
  q=w/rel
  if q.is_symlink() or not q.is_dir() or q.stat().st_dev!=OUT.stat().st_dev:raise ValueError('area not same-volume directory '+str(q))
  if subprocess.check_output(['git','-C',str(w),'ls-files','-z','--',rel]):raise ValueError('area has tracked files '+rel)
 no_active(w)
 return w

def main():
 if sys.argv[1:]!=['--execute']:raise ValueError('expected --execute')
 if OUT.stat().st_dev!=SUITE.stat().st_dev:raise ValueError('different devices')
 before=os.statvfs(REPO);write(OUT/'DF_BEFORE.json',{'availableBytes':before.f_bavail*before.f_frsize,'totalBytes':before.f_blocks*before.f_frsize,'source':'statvfs before cleanup'})
 plan={'authority':'Root explicit F9 selection; exactly five named detached suite worktrees, no force','targets':TARGETS,'areas':AREAS,'device':OUT.stat().st_dev,'ignoredPolicy':'all four entire ignored roots preserved with exclusive same-volume rename','lfs':'37 entries/36 OIDs per HEAD; shared LFS object paths verified present; full object-content rehash not performed','refs':'each HEAD is an ancestor of refs/heads/main at precheck','historicalPathReference':'F9 reviewer README cites the five original scratchpad/suite paths as a grouped path; this mapping preserves their new custody','partialFailure':'stop immediately; completed moves remain in preserved/ and no forced cleanup or automatic rollback'};write(OUT/'PLAN.json',plan)
 for name,head in TARGETS.items():
  w=validate(name,head);dest=OUT/'preserved'/name
  if dest.exists():raise ValueError('destination exists '+str(dest))
  source_info={rel:{'device':(w/rel).stat().st_dev,'inode':(w/rel).stat().st_ino} for rel in AREAS}
  ev={rel:tree_evidence(w/rel) for rel in AREAS[2:]};write(OUT/(name+'-evidence.json'),{'worktree':str(w),'head':head,'areas':ev})
  # Recheck after evidence hashing, immediately before mutation.
  validate(name,head)
  for rel in AREAS:
   old=w/rel;new=dest/rel;new.parent.mkdir(parents=True,exist_ok=True)
   if new.exists() or new.is_symlink():raise ValueError('destination already exists '+str(new))
   if rename(os.fsencode(old),os.fsencode(new),4)!=0:
    e=ctypes.get_errno();raise OSError(e,os.strerror(e),str(old),str(new))
   st=new.stat();assert st.st_dev==source_info[rel]['device'] and st.st_ino==source_info[rel]['inode']
   print(json.dumps({'phase':'preserved','worktree':name,'area':rel,'inode':st.st_ino}),flush=True)
  for rel in AREAS[2:]:verify_evidence(dest/rel,ev[rel])
  status=subprocess.check_output(['git','-C',str(w),'status','--porcelain=v1','-z','--untracked-files=all','--ignored=matching']);
  if status:raise ValueError('post-preservation worktree not clean: '+repr(status[:400]))
  no_active(w)
  proc=subprocess.run(['git','worktree','remove',str(w)],cwd=REPO,capture_output=True,text=True)
  if proc.returncode!=0:raise ValueError('normal git worktree remove failed: '+proc.stderr[:500])
  if w.exists():raise ValueError('worktree directory remains')
  actual=subprocess.check_output(['git','worktree','list','--porcelain'],cwd=REPO,text=True)
  if 'worktree '+str(w)+'\n' in actual:raise ValueError('worktree registration remains')
  write(OUT/(name+'-removed.json'),{'originalPath':str(w),'head':head,'reachableFrom':'refs/heads/main','preservedRoot':str(dest),'movedAreas':source_info,'evidenceManifest':name+'-evidence.json','normalGitRemoveExit':proc.returncode,'removedAtUtc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())})
  print(json.dumps({'phase':'removed','worktree':name,'head':head}),flush=True)
 after=os.statvfs(REPO);write(OUT/'DF_AFTER.json',{'availableBytes':after.f_bavail*after.f_frsize,'totalBytes':after.f_blocks*after.f_frsize,'source':'statvfs after cleanup; simultaneous activity/APFS sharing may affect delta'})
 print(json.dumps({'phase':'complete','removed':len(TARGETS),'availableBefore':before.f_bavail*before.f_frsize,'availableAfter':after.f_bavail*after.f_frsize}),flush=True)
if __name__=='__main__':
 try:main()
 except Exception as e:
  try:write(OUT/'FAILURE.json',{'errorType':type(e).__name__,'message':str(e),'classification':'stopped; no force, no automatic retry or rollback'})
  except Exception:pass
  print(json.dumps({'phase':'stopped','errorType':type(e).__name__,'message':str(e)}),file=sys.stderr,flush=True);sys.exit(1)
