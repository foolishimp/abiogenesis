#!/usr/bin/env python3
"""Existing witness file-pin check adapted to a referenced tar subject; no imports/install."""
from pathlib import Path, PurePosixPath
import hashlib,json,stat,tarfile,sys
D=Path(__file__).resolve().parent
h=lambda b:hashlib.sha256(b).hexdigest()
def check(r):
 p=Path(r['path']); assert stat.S_ISREG(p.lstat().st_mode),str(p)
 b=p.read_bytes();assert len(b)==r['bytes'] and h(b)==r['sha256'],str(p)
 return b
b=json.loads((D/'BINDING.DRAFT.json').read_text())
for r in b['files']:check(r)
c=json.loads(check(b['candidateCustody']));check(c['archive']);expected={r['path']:r for r in c['allArchiveMembers']};seen=set()
with tarfile.open(c['archive']['path']) as t:
 for m in t.getmembers():
  assert m.isfile() and m.name.startswith('package/'),m.name
  rel=m.name[len('package/'):];assert rel and '..' not in PurePosixPath(rel).parts and not rel.startswith('/') and rel not in seen,rel
  x=t.extractfile(m).read();r=expected[rel];assert len(x)==r['bytes'] and h(x)==r['sha256'],rel;seen.add(rel)
assert seen==set(expected)
root=Path(c['bootstrapPackage'])
if '--bootstrap-existing' in sys.argv:
 assert root.is_dir() and not root.is_symlink() and root.resolve()==root
 for r in expected.values():check({**r,'path':str(root/r['path'])})
else:
 assert not root.exists() and not root.is_symlink(),'Initial bootstrap destination must be absent'
 for parent in root.parents:
  if parent.exists():assert parent.is_dir() and not parent.is_symlink() and parent.resolve()==parent;break
for r in b['operatorRoots']:
 p=Path(r['path']);s=p.lstat();assert p.is_dir() and not p.is_symlink() and p.resolve()==p
 assert (s.st_dev,s.st_ino,s.st_uid)==(r['device'],r['inode'],r['uid'])
assert not list(D.glob('ROOT_SELECTION-*.json')),'No Root stage selected in initial preparation'
print(json.dumps({'status':'FILE_ONLY_C3_SETUP_PACKET_CHECKED','packetPins':len(b['files']),'archiveMembers':len(seen),'bootstrap':'existing-verified' if '--bootstrap-existing' in sys.argv else 'absent','providerCalls':0,'RunAdmissions':0,'ProductImports':0,'candidateAccepted':False}))
