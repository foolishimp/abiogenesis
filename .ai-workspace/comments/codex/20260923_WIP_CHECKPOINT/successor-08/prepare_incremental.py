#!/usr/bin/env python3
"""Select exact closed freeze members; reuse banked indexes without reading old payloads."""
import gzip,hashlib,json,os,subprocess,sys
from pathlib import Path
A=Path('/Users/jim/src/apps/abiogenesis');G=Path('/Users/jim/src/apps/odd_glc');repo=Path(sys.argv[1]).resolve();root=repo/'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-08';previous=root.parent/'successor-07'
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
def paths(*args):return {os.fsdecode(x)for x in git(*args,'-z').split(b'\0')if x}
def write(n,v):(root/n).write_text(json.dumps(v,indent=2)+'\n')
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
selection=json.loads((root/'selection.json').read_text());activation=json.loads((root/'activation.json').read_text());assert git('rev-parse','HEAD').decode().strip()==activation['basisCommit'];assert not paths('diff','--cached','--name-only')
tracked=paths('ls-files','--cached');prior={};receipts=[]
transport_roots=[repo/r['root']for r in json.loads((previous/'transport-reuse.json').read_text())['prior']]+[previous/'transport-01']
for p in transport_roots:
 c=json.loads((p/'catalog.json').read_text());assert sha(p/'members.jsonl.gz')==c['indexSha256'];receipts.append({'root':p.relative_to(repo).as_posix(),'catalogSha256':sha(p/'catalog.json'),'indexSha256':c['indexSha256'],'verificationSha256':sha(p/'verification.json'),'members':c['archiveMemberCount'],'transportBytes':c['transportBytes']})
 with gzip.open(p/'members.jsonl.gz','rt')as f:
  for line in f:
   r=json.loads(line);prior[r['path']]={**r,'priorTransport':p.relative_to(repo).as_posix()}
selected={};reused={};canonical=[];freezes=[]
epoch=int(git('show','-s','--format=%ct','HEAD').decode())*10**9
# No broad directory walk: every archive candidate below comes from an exact closed member set.
def add(p,expect=None):
 p=p.resolve()
 if not p.is_relative_to(repo):return
 rel=p.relative_to(repo).as_posix()
 if not rel.startswith('.ai-workspace/comments/codex/'):
  canonical.append(rel);return
 assert not any(s in rel for s in ['/episode-01/resources/','/resources/installed/','/node_modules/','/application-execution-02/qualification-01/resources/']),rel
 assert p.is_file(),p
 if rel in tracked:return
 st=p.stat();e=expect or {'sha256':sha(p),'byteLength':st.st_size}
 if e.get('byteLength')is not None:assert st.st_size==e['byteLength'],('Frozen length changed',rel)
 if rel in selected:assert selected[rel]['expectedFreeze']['sha256']==e['sha256'],('Conflicting frozen identity',rel);return
 if rel in reused:assert reused[rel]['sha256']==e['sha256'];return
 if rel in prior and prior[rel]['sha256']==e['sha256']:
  old=prior[rel];assert st.st_size==old['byteLength']
  # Exact immutable selected hash already banked: reuse accepted payload proof without rereading it.
  reused[rel]={'path':rel,'sha256':e['sha256'],'priorTransport':old['priorTransport']};return
 selected[rel]={'path':rel,'byteLength':st.st_size,'mtimeNs':st.st_mtime_ns,'expectedFreeze':e,'disposition':'new_closed_member'}
def freeze(f,expected=None,base_override=None):
 f=Path(f);d=json.loads(f.read_text());actual=sha(f)
 if expected:assert actual==expected,('Freeze moved',str(f))
 base=Path(base_override or d.get('memberBase',d.get('root',d.get('basePath',str(f.parent)))))
 rows=next((d[k] for k in ['members','files','entries','delta'] if isinstance(d.get(k),list)),None)
 if rows is None:rows=d.get('subject',{}).get('members',[]) if isinstance(d.get('subject'),dict) else []
 for r in rows+d.get('externalCallerMembers',[])+d.get('unchangedExternalSourceDependencies',[]):
  raw=Path(r['path'])
  if raw.is_absolute():p=raw
  elif r['path'].startswith(('.ai-workspace/','build_tenants/','specification/')):
   owner=A if f.is_relative_to(A)else G;p=owner/raw
  else:p=base/raw
  add(p,{'sha256':r['sha256'].removeprefix('sha256:'),'byteLength':r.get('bytes',r.get('byteLength',r.get('byteCount')))})
 add(f,{'sha256':actual,'byteLength':f.stat().st_size})
 freezes.append({'path':str(f),'sha256':actual,'declaredMembers':len(rows),'externalCallerMembers':len(d.get('externalCallerMembers',[]))})
for r in selection['closedProofSelections']:freeze(r['freeze'],r['sha256'],r.get('memberBase'))
for r in selection['adjoiningClosedPosts']:add(Path(r['path']),{'sha256':r['sha256'],'byteLength':Path(r['path']).stat().st_size})
# Canonical source coverage is explicit and disjoint from archived evidence copies.
for p,e in selection['directExpected'].items():assert sha(repo/p)==e['sha256'],('Selected canonical postimage moved',p)
assert not any(p in tracked for p in selected)
rows=[selected[p]for p in sorted(selected)]
with gzip.open(root/'incremental-inventory.jsonl.gz','xt')as f:
 for row in rows:f.write(json.dumps(row)+'\n')
write('classification.json',{'baseCommit':activation['basisCommit'],'directPaths':sorted(selection['directExpected']),'priorTransportReceipts':receipts,'inheritedIndexedMembers':len(prior),'reusedSelectedMembers':list(reused.values()),'newArchiveMembers':len(rows),'newArchiveBytes':sum(r['byteLength']for r in rows),'selectedFreezes':freezes,'canonicalFreezeReferencesConservedThroughPostimages':sorted(set(canonical)),'pending':selection['pending'],'scope':selection['scope'],'priorPayloadReadOrReupload':False})
write('freeze-expectations.json',{p:r['expectedFreeze']for p,r in selected.items()})
write('exclusions.json',{'prefixesAndFiles':{},'active':selection['pending'],'note':'No new blanket ignore of active or reproducible trees; only exact newly transported originals will be ignored.'})
write('transport-reuse.json',{'prior':receipts,'script':'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-01/checkpoint_transport.py','scriptSha256':sha(root.parent/'successor-01/checkpoint_transport.py'),'unchangedPriorByteProof':'Only prior indexes/catalogs/verification receipts acquired; accepted payload proofs reused. No prior transport payload scanned, repacked or uploaded.'})
(root/'selected-archive-paths.nul').write_bytes(b''.join(os.fsencode(r['path'])+b'\0'for r in rows))
print(json.dumps({'repo':repo.name,'direct':len(selection['directExpected']),'newMembers':len(rows),'newBytes':sum(r['byteLength']for r in rows),'reusedSelected':len(reused),'inheritedIndexMembers':len(prior),'largestNew':sorted([{'path':r['path'],'bytes':r['byteLength']}for r in rows],key=lambda r:r['bytes'],reverse=True)[:4]}),flush=True)
