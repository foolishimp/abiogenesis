#!/usr/bin/env python3
"""Hash the fixed offline dependency tree without installing or invoking it."""
import hashlib,json,os,sys
from pathlib import Path
root=Path('/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules').resolve(strict=True)
out=Path(__file__).resolve().parent/'toolchain-census.json'
rows=[]
for folder,dirs,files in os.walk(root,followlinks=False):
 for name in sorted(dirs+files):
  p=Path(folder)/name;rel=p.relative_to(root).as_posix()
  if p.is_symlink():
   target=os.readlink(p);resolved=p.resolve(strict=True)
   if not resolved.is_relative_to(root):raise ValueError('external dependency symlink: '+rel)
   rows.append({'path':rel,'type':'symlink','target':target})
  elif p.is_file():
   b=p.read_bytes();rows.append({'path':rel,'type':'file','bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
  elif not p.is_dir():raise ValueError('unsupported dependency entry: '+rel)
rows.sort(key=lambda x:x['path']); raw=json.dumps(rows,sort_keys=True,separators=(',',':')).encode()
record={'kind':'offline_dependency_tree_census','root':str(root),'entries':len(rows),
 'regularFiles':sum(v['type']=='file' for v in rows),'symlinks':sum(v['type']=='symlink' for v in rows),
 'bytes':sum(v.get('bytes',0) for v in rows),'canonicalInventorySha256':hashlib.sha256(raw).hexdigest(),
 'meaning':'Exact local offline test dependency preimage, not a Product or native admission'}
if sys.argv[1:]==['--record']:
 with out.open('x') as f:json.dump(record,f,indent=2);f.write('\n')
elif sys.argv[1:]==['--verify']:
 if record!=json.loads(out.read_text()):raise ValueError('offline dependency tree changed')
else:raise ValueError('expected --record or --verify')
print(json.dumps(record))
