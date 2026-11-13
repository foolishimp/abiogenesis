#!/usr/bin/env python3
"""Summarize existing Worker scratch artifacts only; never run a test."""
from pathlib import Path
import hashlib,json,re
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');outdir=base/'attempt-005'
scratch=Path('/private/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abg-b03-worker-scratch.mi9eYtAr');tenant=scratch/'repo/build_tenants/abiogenesis/typescript'
work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood');sha=lambda b:hashlib.sha256(b).hexdigest()
names=['build2.txt','out2-t287-governed-context.txt','out2-t287-default-library.txt','out2-t287-native-workspace-work.txt',
 'out2-m5-worker-transport.txt','out3-m5.txt','out2-t287-stdo3-run-environment.txt','out2-installed-language-smoke.txt','out2-r1-packed-artifact.txt']
logs=[]
for name in names:
 p=scratch/name;data=p.read_bytes();text=data.decode('utf8');summary={}
 for key in ('tests','pass','fail','cancelled','skipped','todo'):
  m=re.search(r'^ℹ '+key+r' (\d+)$',text,re.M)
  if m:summary[key]=int(m.group(1))
 failures=[x for x in text.splitlines() if x.startswith('✖ ')][:12]
 logs.append({'path':str(p),'sha256':sha(data),'bytes':len(data),'summary':summary,'failureLines':failures})
custody=json.loads((outdir/'B03_PARTIAL_CUSTODY.json').read_bytes());parity=[]
for row in custody['rows']:
 if row['gitStatus']=='  ':continue
 p=row['path'];q=scratch/'repo'/p;current=(work/p).read_bytes()
 parity.append({'path':p,'currentSha256':sha(current),'scratchSha256':sha(q.read_bytes()) if q.is_file() else None,
  'byteEqual':q.is_file() and q.read_bytes()==current})
artifact=tenant/'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.3.tgz';basis=tenant/'test_env/fixtures/abi5-root-candidate-basis.json'
record={'kind':'b03_existing_worker_scratch_observations','classification':'unadmitted diagnostic scratch; not native C2 proof',
 'scratchRoot':str(scratch),'logs':logs,'sourceParity':parity,
 'build':{'commandEvidenceToolUseId':'toolu_01LC6ja6mCWYGFTRfmm5KPgV','observedBuildExit':0,
  'earlierSymlinkAttempt':{'toolUseId':'toolu_01YXnmQRCCxrcD1PEXLfhBrw','exit':1,'failure':'bundled dependency resolves outside its exact package root: @standard-schema/spec'},
  'dependencyCaveat':'Trace shows later copying node_modules from main abiogenesis checkout; equality to the selected pinned offline dependency inventory has not been established.'},
 'r1':{'observedExit':1,'failure':'artifact_digest_mismatch','artifactPath':str(artifact),'artifactSha256':sha(artifact.read_bytes()),
  'basisPath':str(basis),'basisSha256':sha(basis.read_bytes()),'basisArtifactDigest':json.loads(basis.read_bytes())['artifactDigest'],
  'basisProductId':json.loads(basis.read_bytes())['productId'],'limit':'The scratch basis declares RC2; no refreshed RC3 basis was demonstrated in this trace.'},
 'limits':['No tests were rerun during capture','Scratch results are not admitted C2 or B03 Construction Result',
 'Scratch source differs from current worksite in three design/claim documents; code/test parity is per-row only, not a complete snapshot equivalence',
 'Installed smoke log alone does not establish selected final RC3 package identity or retained native evidence',
 'M5 failures and timing differences remain unresolved observations; no cause is inferred']}
b=(json.dumps(record,sort_keys=True,indent=2)+'\n').encode()
with (outdir/'B03_SCRATCH_EVIDENCE.json').open('xb') as f:f.write(b)
print(json.dumps({'logs':len(logs),'sameSourceFiles':sum(x['byteEqual'] for x in parity),'differentSourceFiles':sum(not x['byteEqual'] for x in parity),
 'r1ScratchArtifactSha256':record['r1']['artifactSha256'],'receiptSha256':sha(b)}))
