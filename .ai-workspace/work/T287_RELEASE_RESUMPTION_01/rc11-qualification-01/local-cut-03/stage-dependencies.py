from pathlib import Path
import os,sys,json,hashlib,shutil,stat
mode,metadata_path,metadata_sha,destination=sys.argv[1:]
def sha(b):return hashlib.sha256(b).hexdigest()
raw=Path(metadata_path).read_bytes();assert sha(raw)==metadata_sha;m=json.loads(raw)
assert mode in ['copy','verify'];dest=Path(destination);assert str(dest)==m['reproductionRoot']
invraw=Path(m['inventory']['path']).read_bytes();assert len(invraw)==m['inventory']['bytes'] and sha(invraw)==m['inventory']['sha256'];inv=json.loads(invraw)
def check(root):
 actual=[]
 for directory,dirs,files in os.walk(root,followlinks=False):
  for name in dirs+files:
   p=Path(directory)/name;rel=p.relative_to(root).as_posix()
   if p.is_symlink():actual.append({'path':rel,'kind':'symlink','target':os.readlink(p)})
   elif p.is_file():b=p.read_bytes();actual.append({'path':rel,'kind':'file','bytes':len(b),'sha256':sha(b)})
 assert sorted(actual,key=lambda x:x['path'])==sorted(inv['rows'],key=lambda x:x['path']),'dependency content/link population differs'
 for r in m['relevantRows']:
  p=root/r['path'];s=p.stat();assert not p.is_symlink();assert ('dir' if p.is_dir() else 'file')==r['kind'];assert stat.S_IMODE(s.st_mode)==r['mode'];assert str(s.st_mtime_ns)==r['mtimeNs'],'metadata drift '+str(p)
 lock=root/'.package-lock.json';raw=lock.read_bytes();assert len(raw)==m['hiddenLock']['bytes'] and sha(raw)==m['hiddenLock']['sha256'];threshold=(lock.stat().st_mtime_ns//1000000+10)*1000000
 assert str(threshold)==m['npmDateThresholdNs'];assert all(int(r['mtimeNs'])<=threshold for r in m['relevantRows'] if r['kind']=='dir')
 return {'filesAndLinks':len(actual),'relevantDirectories':m['relevantDirectories'],'metadataExact':True,'freshnessEligible':True}
check(Path(m['donorRoot']));check(Path(m['testedRoot']))
if mode=='copy':
 assert not dest.exists();shutil.copytree(m['donorRoot'],dest,symlinks=True)
result=check(dest)
print(json.dumps({'mode':mode,'destination':str(dest),'metadataSha256':metadata_sha,**result}))
