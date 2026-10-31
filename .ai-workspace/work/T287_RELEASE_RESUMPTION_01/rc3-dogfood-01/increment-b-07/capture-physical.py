#!/usr/bin/env python3
"""Bind physical roots after actual preflight; no native call or event mutation."""
from pathlib import Path
import hashlib,json,os
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');setup=base/'setup-003';inc=base/'increment-b-07'
assert (inc/'model-free-preflight.json').is_file()
work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
paths=[work,work/'.abiogenesis',work/'.abiogenesis/workspace-manifest.json',setup/'resources/events/runtime.events.jsonl',
 setup/'resources/events',setup/'resources/archives',setup/'resources/runtime',setup/'resources/projections',
 setup/'sandbox/installed/abg',setup/'sandbox/installed/test-consumer']
rows=[]
for p in paths:
 assert os.path.realpath(p)==str(p),p
 s=p.lstat();assert not p.is_symlink() and (p.is_file() or p.is_dir())
 row={'path':str(p),'kind':'file' if p.is_file() else 'directory','device':s.st_dev,'inode':s.st_ino}
 if p.name=='workspace-manifest.json':row['sha256']=hashlib.sha256(p.read_bytes()).hexdigest()
 rows.append(row)
out=(json.dumps({'kind':'rc3_b07_physical_boundary','meaning':'Physical baseline captured after actual preflight; context-digest reproduction separately binds all selected files to that observation.','rows':rows},sort_keys=True,indent=2)+'\n').encode()
with (inc/'PHYSICAL_BOUNDARY.json').open('xb') as f:f.write(out)
print(json.dumps({'sha256':hashlib.sha256(out).hexdigest(),'rows':len(rows)}))
