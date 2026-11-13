"""Prepare a reviewable exact local-cut manifest only after recorded acceptance."""
import json,hashlib,subprocess,datetime
from pathlib import Path
D=Path(__file__).resolve().parent;C=D.parent;F=C/'f4-03-r1';S=Path('/Users/jim/src/apps/abiogenesis-rc5-performance')
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def row(p):return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def write(p,v):
 with p.open('x') as f:f.write(json.dumps(v,indent=2)+'\n')
def text(p,v):
 with p.open('x') as f:f.write(v)
accept=read(F/'ROOT_FINAL_ACCEPTANCE.json');assert accept['status']=='BOUNDED_RC5_CANDIDATE_ACCEPTED_NOT_QUALIFIED'
adopt=read(F/'SOURCE_ADOPTION_CHECKPOINT.json');proof=read(F/'GENERATED_ADOPTION.PREPARED.json')
head=subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD'],text=True).strip()
assert head==adopt['sourceCommit']
for args in [['diff','--quiet'],['diff','--cached','--quiet']]:subprocess.run(['git','-C',str(S)]+args,check=True)
tree=subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD^{tree}'],text=True).strip()
archive=Path(proof['archive']['path']);assert row(archive)==proof['archive']
assert accept['c2ResultRef']==proof['c2ResultRef'];assert accept['artifactDigest']=='sha256:'+sha(archive)
final=proof['proof'];assert final['artifactDigest']==accept['artifactDigest'];assert final['packageVersion']=='5.0.0-rc.5'
reproduction=read(D/'SOURCE_REPRODUCTION.json')
assert reproduction['status']=='BYTE_EQUAL' and reproduction['sourceCommit']==head
assert reproduction['archiveSha256']==reproduction['expectedArchiveSha256']==sha(archive)
evidenceCustody=read(F/'EVIDENCE_CUSTODY_PREPARED.json')
evidenceIndex=Path(evidenceCustody['directory'])/'INDEX.json'
assert sha(evidenceIndex)==evidenceCustody['indexSha256']
assert subprocess.check_output(['git','-C',str(S),'show',head+':'+str(evidenceIndex.relative_to(S))])==evidenceIndex.read_bytes()
release=Path('/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.5')
install=Path('/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.5')
assert not release.exists() and not install.exists()
members=subprocess.check_output(['/usr/bin/tar','-tzf',str(archive)],text=True).rstrip('\n').split('\n')
assert len(members)==len(set(members));assert all(p.startswith('package/') and '..' not in p.split('/') and not p.endswith('/') for p in members)
claim='Local unqualified RC5 candidate: exact STDO3.0.4 default-library/qualification inputs, bounded private retained-route representation and selected affected proof, built by immutable installed RC4. No stable-release claim.'
limits=['No full fifteen-family, F11/soleAF22, GC03 host-adapter or whole-method qualification.',
 'Native method01 first C2 failure, r2 indeterminate UAT, F4-01 operator turn-cap failure, F4-02 installed-fixture failure, and F4-03 preparation and selector-bound refusals remain historical; final bounded conjunction does not rewrite them.',
 'Captured physical-row saving is not a universal workload, latency or capacity claim.',
 'Cold-history and task-launch timing observations do not establish a causal speedup.',
 'Local source branch is unmerged and unpushed; no tag, global selector or stable-release claim.',
 'Installation verifies an accepted candidate; it adds no provider/native-work qualification.']
expected={'packageName':'@abiogenesis/typescript-tenant','packageVersion':'5.0.0-rc.5','productId':'product://abiogenesis/typescript-tenant@5.0.0-rc.5',
 'artifactDigest':final['artifactDigest'],'manifestDigest':final['manifestDigest'],'productContentDigest':final['productContentDigest'],'sourceCommit':head}
text(D/'BOUNDED_CANDIDATE_CLAIM.md','# Local unqualified RC5 candidate\n\n'+claim+'\n\nSource commit: `'+head+'`.\n\nArtifact digest: `'+final['artifactDigest']+'`.\n\nThis is the exact locally selected development cut. Human stable-release acceptance and full qualification remain open.\n')
text(D/'RESIDUALS.md','# Retained limits and failures\n\n'+'\n'.join('- '+s for s in limits)+'\n')
text(D/'ROOT_AUTHORITY.md','# Exact local installation authority\n\nThe owner approved the bounded RC5 campaign. Root conjoined the frozen independent review, actual C2 and native UAT, and fresh result/replay in f4-03-r1/ROOT_FINAL_ACCEPTANCE.json.\n\nExecutive now activates the bounded operator Writer to copy this exact archive to fresh RC5 local release custody, verify/install it through existing Product owners, compare all installed payloads, and retain receipts. Existing destinations refuse. No source authoring, old-cut mutation, provider call, new native Run, publication, tag, push or global selector change is granted by this action.\n')
evidence=[F/'ROOT_FINAL_ACCEPTANCE.json',F/'SOURCE_ADOPTION_CHECKPOINT.json',F/'GENERATED_ADOPTION.PREPARED.json',
 F/'CLOSED_CONJUNCTION_OBSERVATION.json',F/'execution/TIMING_OBSERVATION.json',C/'WORKFLOW_PERFORMANCE.json',
 D/'SOURCE_REPRODUCTION.json',F/'EVIDENCE_CUSTODY_PREPARED.json',evidenceIndex,
 F/'INDEPENDENT_SOURCE_REVIEW.json',F/'review-subject-001/SUBJECT.json',F/'execution/fresh-reads.json',
 C/'method-01/INDEPENDENT_SOURCE_REVIEW.json',C/'method-01/FIRST_C2_FAILURE_TRIAGE.json',C/'method-01-r2/ROOT_REPRICING.json',
 C/'f4-02/FAILED_C2_OBSERVATION.json',C/'f4-02/INDEPENDENT_SOURCE_REVIEW.json',C/'f4-02/CLOSED_FAILED_CONJUNCTION.json',C/'f4-03/PREPARATION_REFUSAL_01.json',C/'f4-03/CLOSED_FAILURE_TRIAGE.json',F/'SELECTOR_CAPACITY_PREFLIGHT.json',F/'REENTRY_TRIAGE.md',C/'f4-01/REENTRY_TRIAGE.md',C/'f4-01/PARTIAL_CUSTODY_CHECKPOINT.json',C/'f4-01/NATIVE_PROVIDER_FAILURE.json',Path(proof['proofArtifact']['path'])]
mapping={'kind':'rc5_source_artifact_evidence_map','sourceCommit':head,'sourceTree':tree,'expected':expected,'nativeSourceResultRef':proof['nativeSourceResultRef'],
 'c2ResultRef':proof['c2ResultRef'],'helperArtifactDigest':proof['helperArtifactDigest'],'archive':row(archive),'archiveMembers':len(members),
 'evidence':[row(p) for p in evidence],'capturedRouteMeasurement':final['capturedRouteMeasurement'],'selectedTests':final['runs'],
 'inheritedMethodEvidence':final['inheritedMethodEvidence'],'sourceReproduction':reproduction,'committedEvidenceCustody':evidenceCustody,'limits':limits}
write(D/'SOURCE_ARTIFACT_EVIDENCE_MAP.json',mapping)
tools=[]
for name,path in [('node','/opt/homebrew/bin/node'),('npm','/opt/homebrew/bin/npm'),('tar','/usr/bin/tar')]:
 real=Path(path).resolve();r=row(real);r.pop('path');tools.append({'name':name,'configuredPath':path,'realPath':str(real),**r})
files=evidence+[D/p for p in ['install-local-rc5.mjs','BOUNDED_CANDIDATE_CLAIM.md','RESIDUALS.md','ROOT_AUTHORITY.md','SOURCE_ARTIFACT_EVIDENCE_MAP.json']]
m={'status':'ROOT_SELECTED_LOCAL_CANDIDATE_INSTALL_ONLY','selectedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'worksiteRoot':str(S),'sourceTree':tree,'expected':expected,'archive':row(archive),'archiveMembers':len(members),
 'releaseRoot':str(release),'installHost':str(install),'installPath':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','tools':tools,'files':[row(p) for p in files],
 'claim':claim,'limits':limits,'effectGrant':['fresh local release custody and actual Product-owner installation','exact all-member byte comparison and receipts'],
 'failurePolicy':'Preserve any partial allocation and failure receipts; refuse existing roots; no automatic overwrite/removal/retry.'}
write(D/'INPUT_MANIFEST.json',m)
print(json.dumps({'status':m['status'],'manifestSha256':sha(D/'INPUT_MANIFEST.json'),'sourceCommit':head,'archiveMembers':len(members),'artifactDigest':final['artifactDigest']}))
