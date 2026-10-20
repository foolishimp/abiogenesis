from pathlib import Path
import json,hashlib,stat
b=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02');c=b/'candidate-24';inv=json.loads((c/'tar-inventory.json').read_text())
for label,root in [('before',b/'candidate-23/scratch/successor/package'),('after',c/'scratch/successor/package')]:
 expected={x['path'].removeprefix('package/'):x for x in inv[label]}
 actual={str(x.relative_to(root)):x for x in root.rglob('*') if x.is_file()}
 assert set(actual)==set(expected),(label,'extracted membership')
 for rel,path in actual.items():
  assert not path.is_symlink(),(label,rel,'symlink')
  body=path.read_bytes();row=expected[rel]
  assert hashlib.sha256(body).hexdigest()==row['sha256'] and len(body)==row['byteCount'],(label,rel,'extracted bytes')
  assert stat.S_IMODE(path.stat().st_mode)==row['mode'],(label,rel,'extracted mode')
print(json.dumps({'baselineAndSuccessorExtractedBytesMatchActualArchives':True,'rowsEach':5265}))
