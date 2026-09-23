#!/usr/bin/env python3
import gzip,json,os,subprocess,sys
from pathlib import Path
repo=Path(sys.argv[1]).resolve();root=repo/'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-01';archive=set()
for c in root.glob('transport-*'):
 if c.is_dir()and(c/'members.jsonl.gz').exists():
  with gzip.open(c/'members.jsonl.gz','rt')as f:archive.update(json.loads(l)['path']for l in f)
exclude=json.loads((root/'exclusions.json').read_text())['prefixesAndFiles']
raw=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=repo);selected=[];direct=[]
for p in sorted(os.fsdecode(x)for x in raw.split(b'\0')if x):
 if p in archive or p.startswith(str(root.relative_to(repo))+'/')or any(p==e or e.endswith('/')and p.startswith(e)for e in exclude):continue
 if p.startswith('.ai-workspace/comments/')or p.startswith('.genesis/'):selected.append(p)
 else:direct.append(p)
(root/'late-archive-paths.nul').write_bytes(b''.join(os.fsencode(p)+b'\0'for p in selected))
(root/'late-selection.json').write_text(json.dumps({'selected':selected,'newDirect':direct,'scope':'Closed review and qualification write boundaries; frozen predecessor transports reused.'},indent=2)+'\n')
print(json.dumps({'repository':repo.name,'lateArchivePaths':len(selected),'lateArchiveBytes':sum((repo/p).lstat().st_size for p in selected),'newDirect':direct}))
