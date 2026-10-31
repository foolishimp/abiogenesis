#!/usr/bin/env python3
"""Root-only no-clobber materialization of four declared operator inputs."""
from pathlib import Path
import hashlib,json,sys
HERE=Path(__file__).resolve().parent
WORK=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
NAMES=['task.md','HOW.md','rubric.json','COUNTEREXAMPLE.json']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert len(sys.argv)==2,'Root supplies bare B11_PREPARATION_CUSTODY.json SHA256'
p=HERE/'B11_PREPARATION_CUSTODY.json';assert sha(p)==sys.argv[1]
c=json.loads(p.read_text());pins={row['path']:row for row in c['files']}
for source in [HERE/'materialize-inputs.py',*[HERE/n for n in NAMES]]:
 row=pins[str(source)];assert source.stat().st_size==row['bytes'] and sha(source)==row['sha256'],str(source)
assert WORK.resolve(strict=True)==WORK
parent=WORK/'rc3-operator-inputs';assert parent.resolve(strict=True)==parent and parent.is_dir() and not parent.is_symlink()
dest=parent/'increment-b-11';assert not dest.exists(),'no clobber: B11 operator directory already exists'
dest.mkdir(mode=0o700)
for name in NAMES:
 with (dest/name).open('xb')as f:f.write((HERE/name).read_bytes())
 assert sha(dest/name)==sha(HERE/name)
print(json.dumps({'kind':'b11_operator_inputs_materialized','destination':str(dest),'files':NAMES,'ProductSourceWrites':0,'calls':0}))
