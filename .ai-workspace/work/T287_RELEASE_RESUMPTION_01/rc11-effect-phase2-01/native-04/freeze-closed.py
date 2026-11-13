from pathlib import Path
import json,hashlib,datetime,shutil,subprocess,os,difflib
N=Path(__file__).parent;O=N.parent/'native-03';F=Path('/private/tmp/abg-rc11-foundation-20261110-01');R=N/'runtime-001';frozen=N/'frozen-source'
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
def write(p,v):
 with p.open('xb') as h:h.write(v if isinstance(v,bytes) else (json.dumps(v,indent=2)+'\n').encode())
assert (R/'FINAL.json').is_file() and (R/'FRESH_READBACKS.json').is_file(),'Actual owner close/fresh readbacks required'
assert not frozen.exists() and not (N/'source-freeze.json').exists()
prepared=json.loads((R/'PREPARED.json').read_text())
try:os.kill(prepared['pid'],0)
except ProcessLookupError:pass
else:raise AssertionError('Host remains live; defer freeze')
old=json.loads((O/'source-freeze.json').read_text());task=json.loads((N/'TASK.json').read_text());g=json.loads((N/'PRESERVATION_GUARDS.json').read_text());rows=[];changes=[];delta=[]
allowed=set(task['writeRoots'][:4]);frozen.mkdir()
for before in old['rows']:
 rel=before['path'];src=F/rel;b=src.read_bytes();after=dict(path=rel,bytes=len(b),sha256=sha(b));rows.append(after)
 dest=frozen/rel;dest.parent.mkdir(parents=True,exist_ok=True)
 with dest.open('xb') as h:h.write(b)
 if before!=after:
  changes.append(dict(path=rel,before=before,after=after,withinGrant=rel in allowed))
  delta.extend(difflib.unified_diff((Path(old['frozenRoot'])/rel).read_text().splitlines(keepends=True),b.decode().splitlines(keepends=True),fromfile='native03/'+rel,tofile='native04/'+rel))
for row in rows:
 b=(F/row['path']).read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'],'post-copy source drift'
sourceDigest=sha(json.dumps(rows,separators=(',',':')).encode())
freeze=dict(status='NATIVE04_R2_CLOSED_SOURCE_FROZEN_UNACCEPTED',utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),sourceRoot=str(F),frozenRoot=str(frozen),sourceCommit=old['sourceCommit'],sourceDigest=sourceDigest,rows=rows,predecessor=pin(O/'source-freeze.json'),changedPaths=[x['path'] for x in changes],newPaths=[],deletedPaths=[],nativeFinal=pin(R/'FINAL.json'),standing='Actual closed native output; source/proof acceptance remains Root-owned. No external proof executed.')
write(N/'source-freeze.json',freeze);write(N/'SOURCE_DELTA.diff',''.join(delta).encode())
index=[]
for x in g['indices']:index.append(dict(before=x,after=pin(x['path']),byteEqual=pin(x['path'])==x))
heads={root:subprocess.check_output(['/usr/bin/git','-C',root,'rev-parse','HEAD'],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True).strip() for root in g['heads']}
indexobs=dict(indices=index,heads=heads,expectedHeads=g['heads'],headsExact=heads==g['heads'],note='Read-only Git commands use GIT_OPTIONAL_LOCKS=0; byte drift, if any, is recorded rather than restored.')
write(N/'INDEX_OBSERVATION.json',indexobs)
other=[]
for x in g['mainTracking']+g['candidateTracking']+[g['builderPin'],g['archive'],g['workspaceManifest']]:other.append(dict(expected=x,actual=pin(x['path']),equal=pin(x['path'])==x))
receipt=dict(status='CLOSED_R2_FREEZE_RECORDED_UNACCEPTED',sourceFreeze=pin(N/'source-freeze.json'),sourceDigest=sourceDigest,sourceRows=len(rows),frozenRoot=str(frozen),changes=changes,unchangedRows=len(rows)-len(changes),newPaths=[],deletedPaths=[],changedPathsWithinGrant=all(x['withinGrant'] for x in changes),nativeFinal=pin(R/'FINAL.json'),nativeReturn=pin(R/'NATIVE_RETURN.json') if (R/'NATIVE_RETURN.json').exists() else None,freshReadbacks=pin(R/'FRESH_READBACKS.json'),indexObservation=pin(N/'INDEX_OBSERVATION.json'),otherProtectionPinsExact=all(x['equal'] for x in other),protectionResults=other,mainAndCandidateHeadsExact=heads==g['heads'],qualification=False)
write(N/'FREEZE_RECEIPT.json',receipt)
print(json.dumps(dict(freeze=pin(N/'source-freeze.json'),receipt=pin(N/'FREEZE_RECEIPT.json'),sourceDigest=sourceDigest,sourceRows=len(rows),changedPaths=freeze['changedPaths'],indicesExact=all(x['byteEqual'] for x in index),otherGuardsExact=receipt['otherProtectionPinsExact'])))
