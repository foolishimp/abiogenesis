#!/usr/bin/env python3
"""Finite closed-set successor inventory; prior payloads are never read."""
import gzip,hashlib,importlib.util,json,os,subprocess,sys
from pathlib import Path
repo=Path(sys.argv[1]).resolve();root=repo/'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-02';previous=root.parent/'successor-01'
def git(*a):return subprocess.check_output(['git',*a],cwd=repo)
def paths(*a):return {os.fsdecode(p)for p in git(*a,'-z').split(b'\0')if p}
def write(n,v):(root/n).write_text(json.dumps(v,indent=2)+'\n')
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
assert not paths('diff','--cached','--name-only')
assert git('rev-parse','HEAD').decode().strip()==json.loads((root/'activation.json').read_text())['basisCommit']
spec=importlib.util.spec_from_file_location('transport',previous/'checkpoint_transport.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
tracked=paths('ls-files','--cached');changed=paths('diff','HEAD','--name-only');prior={};receipts=[]
epoch=int(git('show','-s','--format=%ct','HEAD').decode())*10**9
roots=[root.parent]+([root.parent/'cursor-supplement',root.parent/'scratch-supplement']if repo.name=='abiogenesis'else[])+sorted(p for p in previous.glob('transport-*')if p.is_dir())
for c in roots:
 catalog=json.loads((c/'catalog.json').read_text());index=c/'members.jsonl.gz';assert sha(index)==catalog['indexSha256']
 receipts.append({'root':str(c.relative_to(repo)),'catalogSha256':sha(c/'catalog.json'),'indexSha256':catalog['indexSha256'],'verificationSha256':sha(c/'verification.json'),'memberCount':catalog['archiveMemberCount'],'transportBytes':catalog['transportBytes']})
 with gzip.open(index,'rt')as f:
  for line in f:
   row=json.loads(line);prior[row['path']]={**row,'priorTransport':str(c.relative_to(repo))}
comments='.ai-workspace/comments/codex/'
selected=set();expected={};exclusions={};reused=0;changedPrior=[]
def add(p,expect=None):
 global reused
 rel=p.relative_to(repo).as_posix()
 if rel in tracked:return
 if expect:expected[rel]=expect
 if rel in prior:
  st=p.lstat();old=prior[rel]
  if st.st_size==old.get('byteLength')and st.st_mtime_ns<=epoch:reused+=1;return
  # Only recently modified members inside the selected finite territory are compared.
  if sha(p)==old.get('sha256'):reused+=1;return
  changedPrior.append({'path':rel,'prior':old})
 selected.add(rel)
def freeze(path,prefix):
 d=json.loads(path.read_text());add(path)
 rows=d.get('members',d.get('files'))
 assert isinstance(rows,list),(str(path),list(d))
 for row in rows:
  p=prefix/row['path'];assert p.is_file(),p
  add(p,{'sha256':row['sha256'],'byteLength':row.get('bytes',row.get('byteLength'))})
def walk(p):
 for here,dirs,files in os.walk(p,followlinks=False):
  for name in list(dirs):
   q=Path(here)/name;rel=q.relative_to(repo).as_posix()
   if q.is_symlink():dirs.remove(name);files.append(name);continue
   reason=m.exclusion(repo,rel,True)
   # Installed trees are reproducible from retained exact package/install receipts.
   if name in ['installed','node_modules']:reason='Reproducible isolated installed/dependency tree; exact package and Public installation receipts retained'
   if reason:exclusions[rel+'/']=reason;dirs.remove(name)
  for name in files:
   q=Path(here)/name;rel=q.relative_to(repo).as_posix();reason=m.exclusion(repo,rel)
   if reason:exclusions[rel]=reason;continue
   add(q)
if repo.name=='abiogenesis':
 for name in ['20260923_C2_ENVIRONMENT_REPAIR','20260923_F11_SCOPE_REPRESENTATION','20260923_PUBLIC_TERMINAL_PROJECTION_REPAIR']:
  walk(repo/comments/name)
 rc=repo/comments/'20260923_RC1_QUALIFICATION_RECIPE';active=rc/'s02-installed-continuation-03'
 for p in sorted(rc.iterdir()):
  if p==active:continue
  if p.is_dir():walk(p)
  else:add(p)
 freeze(active/'first-stop/freeze.json',active);freeze(active/'second-stop/freeze.json',active)
 # The corrected caller is immutable; live outputs beside it are excluded.
 freeze(active/'continuation-caller-02/freeze.json',active)
 pending=[str(active.relative_to(repo))+'/** except exact frozen members explicitly selected']
 direct=changed|{str(p.relative_to(repo))for p in(repo/'build_tenants/abiogenesis/typescript/test_env/tests').glob('t287-*.test.mjs')if str(p.relative_to(repo))not in tracked}
else:
 g=repo/comments/'20260923_GENERIC_DATA_MAPPER_CONTINUATION'
 walk(g/'correction-integration-02');freeze(g/'execution-08/freeze.json',g)
 # return/freeze are outside each freeze's own member population.
 for name in ['return.md','freeze.json']:add(g/'execution-08'/name)
 walk(g/'correction-preparation-lifetime-01')
 pending=[str((g/q).relative_to(repo))+'/**'for q in ['execution-08-remaining-selection','execution-08-remaining']]+['original event resource/worksite; no new snapshot or log suffix selected']
 exclusions[str((g/'execution-08/resources/installed').relative_to(repo))+'/']='Reproducible exact installed input; archive/installation receipts retained'
 direct=changed
# No checkpoint carrier recursively transports itself.
assert not any(p.startswith(str(root.relative_to(repo))+'/')for p in selected)
assert not any('/node_modules/'in p or '/resources/installed/'in p for p in selected)
rows=[]
for p in sorted(selected):
 st=(repo/p).lstat();rows.append({'path':p,'byteLength':st.st_size,'mtimeNs':st.st_mtime_ns,'disposition':'new_or_changed_closed_archive_member','expectedFreeze':expected.get(p)})
with gzip.open(root/'incremental-inventory.jsonl.gz','xt')as f:
 for row in rows:f.write(json.dumps(row)+'\n')
write('classification.json',{'baseCommit':git('rev-parse','HEAD').decode().strip(),'priorTransportReceipts':receipts,'inheritedIndexedMembers':len(prior),'reusedSelectedLogicalMembers':reused,'priorPayloadReadOrReupload':False,'newArchiveMembers':len(rows),'newArchiveBytes':sum(r['byteLength']for r in rows),'directPaths':sorted(direct),'changedPriorMembers':changedPrior,'pending':pending,'selection':'Only closed named source/evidence territories; active S02 exact freeze exceptions; execution08 finite failure and closed caller component. No broad history walk.'})
write('exclusions.json',{'prefixesAndFiles':exclusions,'active':pending})
write('freeze-expectations.json',expected)
(root/'selected-archive-paths.nul').write_bytes(b''.join(os.fsencode(r['path'])+b'\0'for r in rows))
write('transport-reuse.json',{'prior':receipts,'script':str((previous/'checkpoint_transport.py').relative_to(repo)),'scriptSha256':sha(previous/'checkpoint_transport.py'),'unchangedPriorByteProof':'Accepted catalog/member/restoration proofs reused. Only indexes and selected logical member metadata read; old payloads not read or copied.'})
print(json.dumps({'repository':repo.name,'newMembers':len(rows),'newBytes':sum(r['byteLength']for r in rows),'directPaths':len(direct),'priorIndexed':len(prior),'reusedSelected':reused,'changedPriorMembers':len(changedPrior),'largest':sorted(rows,key=lambda x:x['byteLength'],reverse=True)[:8],'exclusions':len(exclusions)}))
