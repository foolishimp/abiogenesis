#!/usr/bin/env python3
"""Explicit closed-set staging; commit/push are separate selected Writer effects."""
import gzip,hashlib,json,os,re,stat,subprocess,sys
from pathlib import Path
repo=Path(sys.argv[1]).resolve();root=repo/'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-05';rel=root.relative_to(repo).as_posix()
def git(*a):return subprocess.check_output(['git',*a],cwd=repo)
def effect(*a):subprocess.run(['git',*a],cwd=repo,check=True)
def paths(*a):return {os.fsdecode(p)for p in git(*a,'-z').split(b'\0')if p}
def write(n,v):(root/n).write_text(json.dumps(v,indent=2)+'\n')
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def remote():
 a=git('ls-remote','origin','refs/heads/main').decode().splitlines();assert len(a)==1;return a[0].split()[0]
base=json.loads((root/'activation.json').read_text())['basisCommit'];assert git('rev-parse','HEAD').decode().strip()==base;assert remote()==base;assert git('symbolic-ref','--short','HEAD').decode().strip()=='main';assert not paths('diff','--cached','--name-only')
c=json.loads((root/'transport-01/catalog.json').read_text());v=json.loads((root/'transport-01/verification.json').read_text());assert v['originalsComparedAfterPacking']and v['allMemberPathsAndHashesVerified'];assert c['credentialShapeFindingCount']==0
with gzip.open(root/'transport-01/members.jsonl.gz','rt')as f:archived={r['path']:r for r in map(json.loads,f)}
classification=json.loads((root/'classification.json').read_text());exclusions=json.loads((root/'exclusions.json').read_text())
# All accepted implementation bytes are identical to the Writer-entry preimages.
tracker={'specification/GOALS.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md','.ai-workspace/tickets/active/T-043-deliver-generic-live-llm-scenario-mvp.md'}
for row in json.loads((root/'preimages.json').read_text()):
 assert sha(repo/row['path'])==row['sha256'],row['path']
ignore=repo/'.ai-workspace/comments/.gitignore';(root/'ignore-preimage.txt').write_bytes(ignore.read_bytes())
ignored={p:'exact lossless transport-backed closed original'for p in archived}
ignored.update(exclusions['prefixesAndFiles'])
assert all(p.startswith('.ai-workspace/comments/')for p in ignored)
def literal(p):return ''.join('\\'+c if c in '\\[]*?!# 'else c for c in p)
with ignore.open('a')as f:f.write('\n# WIP successor-05: exact lossless transport-backed closed originals; active resources excluded.\n'+'\n'.join('/'+literal(p.removeprefix('.ai-workspace/comments/'))for p in sorted(ignored))+'\n')
check=subprocess.check_output(['git','check-ignore','--no-index','--stdin','-z'],cwd=repo,input=b''.join(os.fsencode(p)+b'\0'for p in archived));assert {os.fsdecode(p)for p in check.split(b'\0')if p}==set(archived)
write('transport-backed-ignore-receipt.json',{'path':'.ai-workspace/comments/.gitignore','preimageSha256':sha(root/'ignore-preimage.txt'),'postimageSha256':sha(ignore),'files':ignored,'activeRootsAreNotIgnoredByThisCheckpoint':classification['pending']})
write('composition.json',{'basisCommit':base,'prior':'successor-04/composition.json plus inherited transport receipts in classification.json','newTransport':'transport-01/catalog.json','archiveMembers':c['archiveMemberCount'],'archiveMemberBytes':c['archiveMemberBytes'],'transportBytes':c['transportBytes'],'parts':sum(len(a['parts'])for a in c['assets']),'priorPayloadReadOrReupload':False,'pending':classification['pending'],'scope':'Accepted retry source and exact compiled04/installed07 recovery with independent review; prior failures conserved; no full S02/qualification/human acceptance.'})
write('publication-receipt.json',{'kind':'incremental_closed_work_checkpoint','baseCommit':base,'commitIdentity':'The commit containing this receipt; exact resulting local/remote identities in external post-push receipt.','transportBytes':c['transportBytes'],'newLogicalMembers':c['archiveMemberCount'],'restoration':'Every new member restored and compared with its original; exact selected freeze relations checked. Prior transport reused.','currentScope':'Accepted retry source, compiled04/installed07 recovery, independent review, readiness03 and four current status projections; remaining fifteen S02/full S1-S5/qualification/RC open.','ongoing':classification['pending'],'allowedGitEffects':'One ordinary commit and nonforce main push; remote readback afterward.'})
(root/'README.md').write_text("""# Closed-work checkpoint successor-05

This banks accepted retry source, compiled04 archive/correspondence, complete installed07 recovery and independent review, accepted readiness03 and concise current tracking before original GLC preparation. Original frozen source/probe/native failures and corrected exact Run selection are preserved. Remaining fifteen S02 cases, full S1-S5/oracle, qualification and actual human release acceptance remain open. Setup192.773s/root13.412s/case86.503s and observed peak2.806GB remain cost observations without attribution or performance closure.

Only exact new finite closed members enter transport-01; every member is restored and compared with its original/freeze. Prior payloads are not read or uploaded. Ignored emitted output is covered by the exact accepted archive and output inventory. Active s02-installed-continuation-08, evolving original resources/worksite and scratch are excluded; originals remain in place. No build/tests/native/provider/original-resource or release action occurs.

Restore through the established owner:

```sh
python3 .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-01/checkpoint_transport.py restore --checkpoint .ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-05/transport-01 --destination /absolute/path/to/restoration
```

The commit containing publication-receipt.json is this checkpoint. Exact local/remote identities and pending status are recorded externally after ordinary push, without a follow-up commit for self-reference. The pre-stage Writer boundary correction and original draft diff are retained; historical management text is conserved exactly in the final subject.
""")
write('final-staged-check.json',{});(root/'final-staged-whitespace-check.txt').write_text('')
selected=set(classification['directPaths'])|{'.ai-workspace/comments/.gitignore'}
for here,dirs,files in os.walk(root):
 dirs[:]=[d for d in dirs if d!='__pycache__']
 for name in files:selected.add((Path(here)/name).relative_to(repo).as_posix())
for name in ['final-stage-paths.nul','direct-file-identities.json','final-path-reconciliation.json']:selected.add(rel+'/'+name)
write('final-path-reconciliation.json',{'directPaths':sorted(selected),'archiveOriginalPaths':sorted(archived),'pending':classification['pending'],'reproducibleExclusions':exclusions['prefixesAndFiles'],'stableScope':'Finite explicit selection, no stage-all of any active territory.'})
listing=root/'final-stage-paths.nul';listing.write_bytes(b''.join(os.fsencode(p)+b'\0'for p in sorted(selected)))
identities=[]
for p in sorted(selected):
 if p in[rel+'/'+n for n in ['direct-file-identities.json','final-staged-check.json','final-staged-whitespace-check.txt']]:continue
 f=repo/p;st=f.lstat();identities.append({'path':p,'bytes':st.st_size,'sha256':sha(f),'mode':stat.S_IMODE(st.st_mode)})
write('direct-file-identities.json',{'files':identities,'selfReferenceExclusions':['direct-file-identities.json','final-staged-check.json','final-staged-whitespace-check.txt']})
effect('--literal-pathspecs','add','--all','--force','--pathspec-from-file='+str(listing),'--pathspec-file-nul');assert paths('diff','--cached','--name-only')==selected
entries={}
for row in git('ls-files','--stage','-z').split(b'\0'):
 if row:
  meta,p=row.split(b'\t',1);p=os.fsdecode(p)
  if p in selected:entries[p]=meta.split()[1].decode()
pattern=re.compile(rb'(?<![A-Za-z0-9_])(?:gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:proj-|ant-api03-)?[A-Za-z0-9_-]{40,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)');findings=[];largest=0
for p,oid in entries.items():
 process=subprocess.Popen(['git','cat-file','blob',oid],cwd=repo,stdout=subprocess.PIPE);h=hashlib.sha256();size=0;tail=b'';scan=Path(p).suffix not in['.gz','.tgz']and'.part'not in Path(p).name
 for b in iter(lambda:process.stdout.read(1024*1024),b''):
  h.update(b);size+=len(b)
  if scan and pattern.search(tail+b):findings.append(p);scan=False
  tail=b[-160:]
 process.stdout.close();assert process.wait()==0;largest=max(size,largest);assert size<=100*1024*1024,p;assert h.hexdigest()==sha(repo/p),p
assert not findings,('Credential-shaped paths require disposition; values not printed',findings)
check=subprocess.run(['git','diff','--cached','--check'],cwd=repo,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);(root/'final-staged-whitespace-check.txt').write_bytes(check.stdout)
write('final-staged-check.json',{'paths':len(selected),'stagedBlobComparisons':len(entries),'largestBlobBytes':largest,'credentialShapeFindings':findings,'whitespaceExitCode':check.returncode,'whitespaceDisposition':'Pass'if not check.returncode else'Historical frozen bytes preserved; diagnostics retained.','selectedAcceptedSourcePostimagesUnchanged':True,'priorPayloadsRehashedOrReuploaded':False,'activeResourcesExcluded':True})
effect('add','--',rel+'/final-staged-check.json',rel+'/final-staged-whitespace-check.txt')
assert paths('diff','--cached','--name-only')==selected
print(json.dumps({'status':'STAGED VERIFIED, commit/push not yet performed','repository':repo.name,'paths':len(selected),'newArchiveMembers':c['archiveMemberCount'],'newArchiveBytes':c['archiveMemberBytes'],'transportBytes':c['transportBytes'],'largestBlob':largest,'whitespaceExit':check.returncode,'pending':classification['pending']}),flush=True)
