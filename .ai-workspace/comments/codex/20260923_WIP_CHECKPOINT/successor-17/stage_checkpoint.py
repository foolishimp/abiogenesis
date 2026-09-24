#!/usr/bin/env python3
import hashlib,json,os,subprocess,sys
from pathlib import Path
repo=Path(sys.argv[1]).resolve();prefix=Path('.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-17');root=repo/prefix
assert subprocess.check_output(['git','branch','--show-current'],cwd=repo,text=True).strip()=='main'
assert not subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=repo)
def ident(p):
 b=p.read_bytes();return {'sha256':hashlib.sha256(b).hexdigest(),'byteLength':len(b)}
def write(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
base=json.loads((root/'direct-selection.json').read_text())['paths']
paths=sorted(set(base+[p.relative_to(repo).as_posix() for p in root.rglob('*') if p.is_file()]))
assert not any('/node_modules/' in p or '/resources/' in p or '/caller/jobs/' in p for p in paths)
expected={p:ident(repo/p)for p in paths}
write(root/'selection-final.json',{'directExpected':expected,'newArchive':str(prefix/'transport-01/catalog.json'),'excludedRuntimeScope':'see exclusions.json','previousO4Bank':'reference only; no historical bytes reprocessed'})
paths=sorted(set(paths+[str(prefix/'selection-final.json'),str(prefix/'final-stage-paths.nul')]))
(root/'final-stage-paths.nul').write_bytes(b''.join(os.fsencode(p)+b'\0' for p in paths))
subprocess.run(['git','add','-f','--pathspec-from-file='+str(root/'final-stage-paths.nul'),'--pathspec-file-nul'],cwd=repo,check=True)
staged=set(os.fsdecode(p)for p in subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=repo).split(b'\0')if p)
assert staged==set(paths),{'unexpected':sorted(staged-set(paths)),'missing':sorted(set(paths)-staged)}
for p in paths:
 b=subprocess.check_output(['git','show',':'+p],cwd=repo)
 assert hashlib.sha256(b).hexdigest()==ident(repo/p)['sha256'],p
for row in json.loads((root/'source-correspondence.json').read_text()):
 if row['repo']==repo.name:
  assert ident(repo/row['path'])['sha256']==row['acceptedPostimageSha256'],row['path']
  before=subprocess.check_output(['git','show','HEAD:'+row['path']],cwd=repo)
  assert hashlib.sha256(before).hexdigest()==row['headPreimageSha256'],row['path']
canonical=[p for p in base if not p.startswith('.ai-workspace/comments/')]
check=subprocess.run(['git','diff','--cached','--check','--',*canonical],cwd=repo,text=True,capture_output=True)
assert check.returncode==0,check.stdout+check.stderr
full=subprocess.run(['git','diff','--cached','--check'],cwd=repo,text=True,capture_output=True)
write(root/'final-staged-check.json',{'status':'exact explicit staging and byte correspondence passed','beforeReceiptMembers':len(paths),'canonicalWhitespace':'passed','fullFrozenEvidenceWhitespaceExitCode':full.returncode,'fullFrozenEvidenceWhitespaceOutput':full.stdout+full.stderr,'sourceUnchanged':True,'noTestsBuildRuntimeReads':True})
subprocess.run(['git','add','-f','--',str(prefix/'final-staged-check.json')],cwd=repo,check=True)
print(json.dumps({'repo':repo.name,'stagedMembers':len(paths)+1,'canonicalMembers':len(canonical),'fullFrozenEvidenceWhitespaceExitCode':full.returncode,'noUnselectedPathsStaged':True}))
