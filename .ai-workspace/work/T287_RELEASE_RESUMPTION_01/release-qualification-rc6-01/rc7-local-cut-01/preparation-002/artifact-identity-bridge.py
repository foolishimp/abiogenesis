"""RC6 freeze-cut tar/member bridge with the actual RC7 population, not old six-member counts."""
from pathlib import Path
import hashlib,json,sys,tarfile
new_path,old_path,output=sys.argv[1:]
def pin(path):
 p=Path(path);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def members(path):
 with tarfile.open(path,'r:gz') as f:
  rows=f.getmembers()
  assert all(r.isfile() and r.name.startswith('package/') and '..' not in Path(r.name).parts for r in rows)
  assert len(rows)==len({r.name for r in rows})
  return {r.name:f.extractfile(r).read() for r in rows}
new=members(new_path);old=None if old_path=='NONE' else members(old_path);delta=[]
if old is not None:
 assert set(old)==set(new),'Payload membership changed; return to Root'
 for p in sorted(new):
  if old[p]==new[p]:continue
  if p.startswith('package/build/') and p.endswith(('.js','.d.ts','.map')):
   assert old[p].replace(b'5.0.0-rc.6',b'5.0.0-rc.7')==new[p],p
   kind='existing identity constants or their derived declaration only'
  elif p=='package/package.json':
   a=json.loads(old[p]);b=json.loads(new[p]);assert a['version']=='5.0.0-rc.6';a['version']='5.0.0-rc.7';assert a==b
   kind='package identity only'
  elif p.startswith('package/contracts/') or p=='package/product-toolchain-manifest.json':
   kind='existing generated projection; exact changed bytes require packaging review'
  else:raise AssertionError('unexpected changed payload: '+p)
  delta.append({'path':p,'beforeBytes':len(old[p]),'afterBytes':len(new[p]),'beforeSha256':hashlib.sha256(old[p]).hexdigest(),'afterSha256':hashlib.sha256(new[p]).hexdigest(),'classification':kind})
record={'kind':'native_proof_artifact_to_rc7_bridge','nativeArtifact':None if old is None else pin(old_path),'rc7Artifact':pin(new_path),'sameMemberSet':None if old is None else True,'members':len(new),'unchangedMembers':None if old is None else len(new)-len(delta),'changedMembers':delta,'nativeArtifactRelation': 'NOT_OBSERVED_ROOT_LIMIT_REQUIRED' if old is None else 'IDENTITY_ONLY_OR_REVIEWED_GENERATED_DELTA','qualified':False}
with Path(output).open('x') as f:f.write(json.dumps(record,indent=2)+'\n')
print(json.dumps({'members':len(new),'changedMembers':None if old is None else len(delta),'nativeArtifactRelation':record['nativeArtifactRelation']}))
