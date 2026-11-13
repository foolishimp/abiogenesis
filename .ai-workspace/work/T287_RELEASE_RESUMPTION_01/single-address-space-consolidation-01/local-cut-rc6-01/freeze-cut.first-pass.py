"""Freeze exact built source and preserve the native-artifact identity bridge."""
from pathlib import Path
import datetime,hashlib,json,subprocess,tarfile
D=Path(__file__).resolve().parent;X=D.parent;W=Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut')
T='build_tenants/abiogenesis/typescript';E='.ai-workspace/work/T287_RC6_LOCAL_EVIDENCE_01'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,v):
 with p.open('x') as f:f.write(json.dumps(v,indent=2)+'\n')
def git(*args):return subprocess.check_output(['/usr/bin/git','-C',str(W),*args],text=True).strip()
build=json.loads((D/'candidate/RESULT.json').read_text());assert build['status']=='BUILT'
native=json.loads((X/'proof-10/actual-c2-001/CANDIDATE_PACKAGE_IDENTITY.json').read_text())['retainedArchive']
assert sha(Path(native['path']))==native['sha256'];assert sha(Path(build['archive']['path']))==build['archive']['sha256']
def members(path):
 with tarfile.open(path,'r:gz') as f:
  rows=f.getmembers();assert all(r.isfile() and r.name.startswith('package/') and '..' not in Path(r.name).parts for r in rows)
  assert len(rows)==len({r.name for r in rows});return {r.name:f.extractfile(r).read() for r in rows}
old=members(native['path']);new=members(build['archive']['path']);assert set(old)==set(new),'Payload membership changed'
delta=[]
for p in sorted(old):
 if old[p]==new[p]:continue
 if p.startswith('package/build/') and p.endswith(('.js','.d.ts','.map')):
  assert p in ['package/build/code/src/product/contracts.js','package/build/code/src/product/contracts.d.ts'],p
  assert old[p].replace(b'5.0.0-rc.5',b'5.0.0-rc.6')==new[p],p
  kind='two existing Product/package identity constants'
 elif p=='package/package.json':
  a=json.loads(old[p]);b=json.loads(new[p]);a['version']='5.0.0-rc.6';assert a==b;kind='package identity only'
 else:
  assert p.startswith('package/contracts/') or p=='package/product-toolchain-manifest.json',p
  kind='existing generated identity/schema/qualification projection'
 delta.append({'path':p,'beforeSha256':hashlib.sha256(old[p]).hexdigest(),'afterSha256':hashlib.sha256(new[p]).hexdigest(),'beforeBytes':len(old[p]),'afterBytes':len(new[p]),'classification':kind})
bridge={'kind':'native_proof_artifact_to_rc6_bridge','nativeArtifact':native,'rc6Artifact':build['archive'],'sameMemberSet':True,'members':len(new),'unchangedMembers':len(new)-len(delta),'changedMembers':delta,'meaning':'All compiled implementation bytes are identical except the two existing Product/package identity constants. Generated projections are reviewed separately; native proof remains on its original artifact.'}
save(D/'ARTIFACT_IDENTITY_BRIDGE.json',bridge);save(W/E/'ARTIFACT_IDENTITY_BRIDGE.json',bridge)
subject=json.loads((X/'native-09/review-subject-001/SUBJECT.json').read_text());sourceBridge=json.loads((W/E/'SOURCE_BRIDGE.json').read_text())
identity={r['path']:r['afterSha256'] for r in sourceBridge['identityChanges']}
for r in subject['files']:assert sha(W/r['path'])==identity.get(r['path'],r['sha256']),r['path']
dirty=git('diff','--name-only','HEAD').splitlines()
allowed=set(r['path'] for r in subject['files'])|set(identity)|{T+'/release-claim.md','specification/GOALS.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'}
generated=[]
for p in dirty:
 if p in allowed:continue
 assert p.startswith(T+'/contracts/') or p==T+'/product-toolchain-manifest.json',p
 generated.append({'path':p,'bytes':(W/p).stat().st_size,'sha256':sha(W/p)})
save(W/E/'GENERATED_CUSTODY.json',{'generator':'unchanged scripts/generate-product-manifest.mjs','generatedTrackedDelta':generated,'buildRecord':build,'artifactBridgeSha256':sha(D/'ARTIFACT_IDENTITY_BRIDGE.json')})
stage=sorted(set(dirty)|{r['path'] for r in subject['files']}|{str(p.relative_to(W)) for p in (W/E).rglob('*') if p.is_file()})
assert not git('diff','--cached','--name-only')
subprocess.run(['/usr/bin/git','-C',str(W),'add','--',*stage],check=True)
subprocess.run(['/usr/bin/git','-C',str(W),'diff','--cached','--check'],check=True)
subprocess.run(['/usr/bin/git','-C',str(W),'commit','-m','Checkpoint local RC6 interface consolidation and retained proof'],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
assert not git('diff','--name-only') and not git('diff','--cached','--name-only')
r={'kind':'rc6_local_source_checkpoint','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCommit':git('rev-parse','HEAD'),'sourceTree':git('rev-parse','HEAD^{tree}'),'branch':git('branch','--show-current'),'worktree':str(W),'baseCommit':sourceBridge['baseCommit'],'archive':build['archive'],'artifactBridgeSha256':sha(D/'ARTIFACT_IDENTITY_BRIDGE.json'),'sourceSubjectSha256':sha(X/'native-09/review-subject-001/SUBJECT.json'),'evidenceIndexSha256':sha(W/E/'INDEX.json'),'generatedTrackedFiles':len(generated),'stagedPaths':len(stage),'standing':'Local unqualified checkpoint; cut/install not yet executed'}
save(D/'SOURCE_CHECKPOINT.json',r)
print(json.dumps({k:v for k,v in r.items() if k not in ['archive']}))
print(json.dumps({'members':len(new),'identityChangedMembers':len(delta),'generatedTrackedFiles':len(generated)}))
