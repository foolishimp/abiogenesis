"""Existing tar/member custody with strict tested/reproduced byte equality; no identity allowance."""
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
new_pin,old_pin=pin(new_path),pin(old_path)
assert new_pin['bytes']==old_pin['bytes'] and new_pin['sha256']==old_pin['sha256'],'tested/reproduced archive bytes differ'
new,old=members(new_path),members(old_path)
assert new==old,'tested/reproduced member bytes differ'
record={'kind':'exact_tested_rc10_artifact_correspondence','status':'BYTE_EQUAL','testedArchive':new_pin,'reproductionArchive':old_pin,'sameMemberSet':True,'members':len(new),'unchangedMembers':len(new),'changedMembers':[],'identityBridgeAllowance':False,'qualified':False}
with Path(output).open('x') as f:f.write(json.dumps(record,indent=2)+'\n')
print(json.dumps({'members':len(new),'status':'BYTE_EQUAL','identityBridgeAllowance':False}))
