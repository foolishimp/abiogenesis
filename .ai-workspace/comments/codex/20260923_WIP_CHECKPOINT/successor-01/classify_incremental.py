#!/usr/bin/env python3
"""Finite incremental preservation inventory; Git reads and metadata only."""
import collections,gzip,hashlib,importlib.util,json,os,stat,subprocess,sys
from pathlib import Path
repo=Path(sys.argv[1]).resolve();out=repo/'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-01';base=out.parent
spec=importlib.util.spec_from_file_location('transport',out/'checkpoint_transport.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def paths(*args):return {os.fsdecode(x)for x in subprocess.check_output(['git',*args,'-z'],cwd=repo).split(b'\0')if x}
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip();epoch=int(subprocess.check_output(['git','show','-s','--format=%ct','HEAD'],cwd=repo,text=True))*10**9
assert head==json.loads((out/'activation.json').read_text())['basisCommit'];assert not paths('diff','--cached','--name-only')
tracked=paths('ls-files','--cached');changed=paths('diff','HEAD','--name-only');untracked=paths('ls-files','--others','--exclude-standard')
prior={};receipts=[]
for c in [base]+([base/'cursor-supplement',base/'scratch-supplement']if repo.name=='abiogenesis'else[]):
 index=c/'members.jsonl.gz';catalog=json.loads((c/'catalog.json').read_text());assert m.digest_file(index)==catalog['indexSha256']
 receipts.append({'root':str(c.relative_to(repo)),'catalogSha256':m.digest_file(c/'catalog.json'),'indexSha256':catalog['indexSha256'],'verificationSha256':m.digest_file(c/'verification.json'),'transportBytes':catalog['transportBytes']})
 with gzip.open(index,'rt')as f:
  for line in f:
   row=json.loads(line);assert row['path']not in prior;prior[row['path']]={**row,'checkpoint':str(c.relative_to(repo))}
held=['.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/historical-assessment-01']if repo.name=='odd_glc'else['.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/f11-scope-readiness-01','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md']
rows={};excluded={};counts=collections.Counter()
for p,row in prior.items():
 target=repo/p
 if not target.exists()and not target.is_symlink():rows[p]={'path':p,'disposition':'inherited_archive_original_absent','basis':row};continue
 st=target.lstat();same=(row['kind']=='file'and st.st_size==row['byteLength']or row['kind']=='symlink'and os.readlink(target)==row['target'])
 if same and st.st_mtime_ns<=epoch:
  rows[p]={'path':p,'disposition':'inherited_archive','basis':row,'stat':{'byteLength':st.st_size,'mtimeNs':st.st_mtime_ns,'device':st.st_dev,'inode':st.st_ino}}
 else:rows[p]={'path':p,'disposition':'changed_archive_original','basis':row,'stat':{'byteLength':st.st_size,'mtimeNs':st.st_mtime_ns,'device':st.st_dev,'inode':st.st_ino}}
# The previous exact-path ignore policy makes new authored names visible. Explicit
# evidence walks additionally retain ignored new outputs while pruning only
# named reproducible dependency/compiler caches. Banked payloads are not visited.
for root in [repo/'.ai-workspace/comments']+([repo/'.genesis']if repo.name=='odd_glc'else[]):
 if not root.exists():continue
 for here,dirs,files in os.walk(root,followlinks=False):
  rel=Path(here).relative_to(repo).as_posix()
  if rel==str(base.relative_to(repo))or rel.startswith(str(base.relative_to(repo))+'/'):dirs[:]=[];continue
  for name in list(dirs):
   target=Path(here)/name;p=target.relative_to(repo).as_posix()
   if target.is_symlink():dirs.remove(name);files.append(name);continue
   reason=m.exclusion(repo,p,True)
   if reason:excluded[p+'/']=reason;dirs.remove(name)
  for name in files:
   p=(Path(here)/name).relative_to(repo).as_posix()
   if p in prior or p in tracked:continue
   reason=m.exclusion(repo,p)
   if reason:excluded[p]=reason;continue
   untracked.add(p)
for p in sorted(changed|untracked):
 if p.startswith(str(out.relative_to(repo))+'/'):continue
 reason=m.exclusion(repo,p)
 if reason and p not in tracked:excluded[p]=reason;continue
 if any(p==e[:-1]or p.startswith(e)for e in excluded if e.endswith('/'))and p not in tracked:continue
 if any(p==h or p.startswith(h+'/')for h in held):d='pending_active_write'
 elif p in tracked or not p.startswith('.ai-workspace/comments/')and not p.startswith('.genesis/'):d='direct_git'
 else:d='new_archive_member'
 st=(repo/p).lstat()if(repo/p).exists()or(repo/p).is_symlink()else None
 rows[p]={'path':p,'disposition':d,'stat':None if st is None else{'byteLength':st.st_size,'mtimeNs':st.st_mtime_ns,'device':st.st_dev,'inode':st.st_ino}}
for row in rows.values():counts[row['disposition']]+=1
with gzip.open(out/'incremental-inventory.jsonl.gz','xt')as f:
 for row in sorted(rows.values(),key=lambda x:x['path']):f.write(json.dumps(row)+'\n')
summary={'kind':'incremental_WIP_classification','repository':repo.name,'baseCommit':head,'inheritedReceipts':receipts,'counts':dict(counts),'newArchiveBytes':sum(r['stat']['byteLength']for r in rows.values()if r['disposition']=='new_archive_member'),'changedArchiveOriginals':[r for r in rows.values()if r['disposition']=='changed_archive_original'],'pendingRoots':held,'directPaths':[r['path']for r in rows.values()if r['disposition']=='direct_git'],'scope':'Previous byte/restoration proofs reused; unchanged archived originals checked by size/mtime/symlink metadata only, no content rehash. New/changed evidence receives fresh transport proof.'}
m.write_json(out/'classification.json',summary);m.write_json(out/'exclusions.json',{'policy':'Only named reproducible dependencies/compiler/cache; tracked files never excluded. Source, reports, runtime evidence and frozen proof are retained.','prefixesAndFiles':excluded})
(out/'selected-archive-paths.nul').write_bytes(b''.join(os.fsencode(r['path'])+b'\0'for r in sorted(rows.values(),key=lambda r:r['path'])if r['disposition']=='new_archive_member'))
print(json.dumps({k:v for k,v in summary.items()if k not in ['directPaths','changedArchiveOriginals','inheritedReceipts']}))
print(json.dumps({'changedArchiveOriginals':summary['changedArchiveOriginals'],'directPathCount':len(summary['directPaths']),'explicitExclusions':len(excluded)}))
