#!/usr/bin/env python3
"""File-only witness pin verification; no Product imports or execution."""
from pathlib import Path
import hashlib,json,stat
D=Path(__file__).resolve().parent
def check(r):
 p=Path(r['path']);s=p.lstat();assert stat.S_ISREG(s.st_mode),str(p)
 b=p.read_bytes();assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256'],str(p)
b=json.loads((D/'BINDING.json').read_text())
for r in b['files']:check(r)
c=json.loads((D/'CANDIDATE_CUSTODY.json').read_text())
for r in c['allArchiveMembers']:check({**r,'path':str(Path(c['installedRoot'])/r['path'])})
assert not (D/'ROOT_SELECTION-setup.json').exists(),'Initial packet verification expects no Root setup admission yet'
print(json.dumps({'status':'FILE_ONLY_PINS_VERIFIED','candidateMembers':len(c['allArchiveMembers']),'packetPins':len(b['files']),'providerCalls':0,'RunAdmissions':0,'ProductImports':0,'sourceCommit':b['sourceCommit']}))
