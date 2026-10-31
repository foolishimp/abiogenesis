#!/usr/bin/env python3
"""Preserve failed-B01 source preimages and bounded scope observation only."""
from pathlib import Path
import hashlib,io,json,subprocess,tarfile
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
dest=base/'increment-b-02'; work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
grant=json.loads((base/'increment-b-01/grant.json').read_bytes()); paths=grant['existingPaths']+grant['newPaths']
expected='927b8c0b84915ea2c926115902c2ceeef6df26a3'; sha=lambda b:hashlib.sha256(b).hexdigest()
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=work,text=True).strip()==expected
raw=subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','-z','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],cwd=work)
entries=[s for s in raw.decode().split('\0') if s];changes={s[3:]:s[:2] for s in entries}
assert all(path in paths for path in changes),[p for p in changes if p not in paths]
assert len(paths)==23 and len(changes)==13
rows=[];source={}
for p in paths:
 current=work/p
 if current.exists():
  assert current.is_file() and not current.is_symlink(),p;data=current.read_bytes();now={'state':'file','sha256':sha(data),'bytes':len(data)}
 else:now={'state':'absent'}
 if p in grant['newPaths']:before={'state':'absent'}
 else:
  data0=subprocess.check_output(['/usr/bin/git','show',expected+':'+p],cwd=work);before={'state':'file','sha256':sha(data0),'bytes':len(data0)}
 rows.append({'path':p,'beforeB01':before,'current':now,'gitStatus':changes.get(p,'  ')})
 if p in changes:
  assert now['state']=='file';source[p]=data
archive=dest/'partial-source-local.tar'
with tarfile.open(archive,'x',format=tarfile.PAX_FORMAT) as out:
 for path,data in sorted(source.items()):
  item=tarfile.TarInfo(path);item.size=len(data);item.mode=0o644;item.mtime=0;item.uid=item.gid=0;item.uname=item.gname='';out.addfile(item,io.BytesIO(data))
streams=base/'setup-001/resources/archives'
logs=[]
for label in ['fp-0a6e158a20c312e0','fp-25fe5e4f91079651']:
 for suffix in ['stdout.log','stderr.log','transport.json']:
  path=streams/(label+'-'+suffix)
  if path.exists():
   b=path.read_bytes();logs.append({'path':str(path),'bytes':len(b),'sha256':sha(b)})
out={'kind':'failed_b01_partial_source_custody','status':'unaccepted partial actor effects; native Construction Result absent',
 'baseCommit':expected,'grantSha256':sha((base/'increment-b-01/grant.json').read_bytes()),'grantPaths':len(paths),
 'changedPaths':len(changes),'outsideGrantTrackedOrUntrackedPaths':[],'rows':rows,'partialArchive':{'path':str(archive),'sha256':sha(archive.read_bytes()),'bytes':archive.stat().st_size},
 'nativeStreams':logs,'budget':json.loads((base/'attempt-003/budget-latest.json').read_bytes()),
 'limits':['Git status covers the selected tenant and cannot establish absence of off-scope or transient effects','Raw actor transport remains at its native archive path','No Product fixes or acceptance are implied']}
b=(json.dumps(out,sort_keys=True,indent=2)+'\n').encode()
with (dest/'PARTIAL_CUSTODY.json').open('xb') as f:f.write(b)
print(json.dumps({'changed':len(changes),'rows':len(rows),'archiveSha256':out['partialArchive']['sha256'],'archiveBytes':out['partialArchive']['bytes'],'custodySha256':sha(b),'streamArtifacts':len(logs)}))
