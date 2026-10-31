#!/usr/bin/env python3
"""Verify exact C2-produced A snapshot and candidate against current source."""
from pathlib import Path
import hashlib,json,subprocess
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
carrier=base/'increment-b-01'
parent=base/'setup-001/resources/archives/worksite-command-execution/5ef35a3d98191cde4badd5c7ba38e856c0771c3a5fe5d96bfbd7f5c0a31c5f03/f93bc5c02013c38501b7cd8304c51cf4edec6903902d4cc3b76875bac1ec9e03'
result=parent/'result.json'; raw=result.read_bytes(); sha=lambda x:hashlib.sha256(x).hexdigest()
assert sha(raw)=='2a0963a10ab9735bbc4706085b5c06e97415455cf39403738579e98717fe259b'
data=json.loads(raw); assert data['disposition']=='success'
prefix='build_tenants/abiogenesis/typescript/'
names=['code/src/abg/default_library.ts','code/src/product/contracts.ts','code/src/product/default_library.ts',
 'design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md','package-lock.json','package.json','release-claim.md',
 'test_env/tests/t287-default-library-fulfillment.test.mjs','test_env/tests/t287-default-library.test.mjs']
paths=[prefix+x for x in names]
changes=subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','-uno'],cwd=work,text=True).splitlines()
assert sorted(line[3:] for line in changes)==sorted(paths)
members={x['relativePath']:x for x in data['snapshotMembers']}
rows=[]
for p in paths:
  current=(work/p).read_bytes(); member=members[p]
  assert member['digest']=='sha256:'+sha(current) and member['byteLength']==len(current)
  assert (parent/'sandbox'/p).read_bytes()==current
  rows.append({'path':p,'sha256':sha(current),'bytes':len(current),'snapshotMemberRef':member['sourceMemberRef'],
               'snapshotObservationRef':member['sourceObservationRef']})
artifact_rel=prefix+'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.3.tgz'
artifact=parent/'sandbox'/artifact_rel; artifact_sha=sha(artifact.read_bytes())
assert artifact_sha=='754c4d0735327d29925eb38befb8c98195c76a1dd1fdf645f795089c3503202c'
delta=[r for r in data['worksiteDelta'] if r['relativePath']==artifact_rel]
assert len(delta)==1 and delta[0]['after']['digest']=='sha256:'+artifact_sha
assert all(c['exitStatus']==0 for c in data['commandResults'])
receipt={'kind':'rc3_a02_c2_snapshot_current_source_and_artifact_correspondence','status':'historical C2 producer correspondence; native UAT indeterminate, candidate unqualified',
 'helperResult':str(result),'helperResultSha256':sha(raw),'helperArtifactRef':data['artifactRef'],'helperArtifactDigest':data['artifactDigest'],
 'snapshotRef':data['snapshotRef'],'snapshotDigest':data['snapshotDigest'],'snapshotCount':len(data['snapshotMembers']),
 'rows':rows,'artifactPath':str(artifact),'artifactSha256':artifact_sha,'artifactBytes':artifact.stat().st_size,
 'artifactC2Delta':delta[0], 'commands': [{'commandId':c['commandId'],'exitStatus':c['exitStatus']} for c in data['commandResults']],
 'limits':['This checked C2 result is not by itself a new native UAT ruling or whole-product qualification',
 'RC3 archive remains at the exact C2 producer path; no source-checkout replacement']}
out=(json.dumps(receipt,indent=2,sort_keys=True)+'\n').encode();target=carrier/'A_C2_IDENTITY.json'
with target.open('xb') as f:f.write(out)
print(json.dumps({'receiptSha256':sha(out),'files':len(rows),'artifactSha256':artifact_sha,'artifactBytes':artifact.stat().st_size,'commands':len(data['commandResults'])}))
