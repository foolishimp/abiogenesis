#!/usr/bin/env python3
"""Verify frozen inputs; this does not call ABG, a provider, or the network."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent
assert hashlib.sha256((root/'INPUT_CUSTODY.json').read_bytes()).hexdigest()=='5c7fd222052ee0a24c83ed579c34746395728bf6cc81cc4b3d2b39fa2eac2075'
assert hashlib.sha256((root/'config.json').read_bytes()).hexdigest()=='c3a3731ded920673d47112112cda1d495205141507f11eedd0fafb0cfddaa327'
record=json.loads((root/'INPUT_CUSTODY.json').read_bytes())
def check(path,expected,size):
 p=Path(path)
 assert p.is_file() and not p.is_symlink(),p
 with p.open('rb') as f:h=hashlib.file_digest(f,'sha256').hexdigest()
 assert h==expected and p.stat().st_size==size,p
for row in record['fixtures']:check(row['copy'],row['sha256'],row['bytes'])
for row in record['runnerFiles']:check(row['path'],row['sha256'],row['bytes'])
a=record['productArtifact'];check(a['path'],a['sha256'],a['bytes'])
c=json.loads((root/'config.json').read_bytes())
assert c['package']['archivePath']==a['path'] and c['package']['sha256']=='sha256:'+a['sha256']
assert c['fixtureRoot']==str(root/'fixtures') and c['recursionBound']==12
assert c['provider']['agent']=='claude' and c['provider']['enabled'] and c['provider']['model']=='claude-opus-5-5'
assert c['provider']['appendArgs']==['--effort','xhigh'] and 'maxBudgetUsd' not in c['provider']
print(json.dumps({'status':'verified','artifactSha256':a['sha256'],'fixtureFiles':len(record['fixtures']),
 'runnerFiles':len(record['runnerFiles']),'configSha256':hashlib.sha256((root/'config.json').read_bytes()).hexdigest(),
 'limits':['No Public call, provider dispatch or qualification']}))
