"""One explicit operator completion of the preserved generation stage; no runtime work."""
from pathlib import Path
import json,hashlib
p=Path(__file__).resolve().parents[1]/'prepare-native-09.py'
s=p.read_text()
ns={'__file__':str(p)}
exec(compile(s[:s.index("selection = X / 'ROOT_REENTRY_SELECTION_09.md'")],str(p),'exec'),ns)
A,oldA,S,X,I=ns['A'],ns['oldA'],ns['S'],ns['X'],ns['I']
read=ns['read']
ns.update(conjunction=read(oldA/'ROOT_CONJUNCTION.json'),subject=read(oldA/'review-subject-001/SUBJECT.json'),subject_path=oldA/'review-subject-001/SUBJECT.json',selection=X/'ROOT_REENTRY_SELECTION_09.md',conjunction_path=oldA/'ROOT_CONJUNCTION.json',grant=read(A/'NATIVE_GRANT.json'),scope=read(A/'AFFECTED_INTERFACE_CONE.json'),scope_path=A/'AFFECTED_INTERFACE_CONE.json',task=(A/'task.md').read_text(),environment_ruling=read(A/'ENVIRONMENT_SELECTION.json'),roots=read(A/'C2_AFFECTED_TEST_ROOTS.json'),lanes=read(A/'AFFECTED_PROOF_LANES.json')['lanes'],preimage_index=read(A/'IR_PREIMAGES.json'),permitted=read(A/'NATIVE_GRANT.json')['permittedProductEffects']['paths'],custody=read(A/'NATIVE_GRANT.json')['productWritePaths'],scratch=read(A/'NATIVE_GRANT.json')['scratchWriteRoots'],future=read(A/'EXPECTED_FUTURE_FILES.json'),now=read(A/'WRITER_ACTIVATION.json')['recordedUtc'])
assert ns['sha'](ns['selection'].read_bytes())==ns['SELECTION_SHA']
assert ns['sha'](ns['conjunction_path'].read_bytes())==ns['CONJUNCTION_SHA']
for f in read(A/'SOURCE_BEFORE.json')['files']:
 b=(S/f['relativePath']).read_bytes();assert len(b)==f['bytes'] and ns['sha'](b)==f['sha256']
original_write=ns['write']
def finish_write(path,value):
 data=value if isinstance(value,str) else json.dumps(value,indent=2)+'\n'
 if path.exists():
  assert path.read_text()==data,'Existing prepared control differs: '+str(path)
  return
 original_write(path,value)
ns['write']=finish_write
exec(compile(s[s.index("w=current09(read(oldA/'workload.json'))"):],str(p),'exec'),ns)
