"""Mechanical RC6 checkpoint from frozen native source; no source implementation."""
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess

D = Path(__file__).resolve().parent
X = D.parent
M = Path('/Users/jim/src/apps/abiogenesis')
S = Path('/Users/jim/src/apps/abiogenesis-single-address-space')
W = Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut')
T = 'build_tenants/abiogenesis/typescript'
E = '.ai-workspace/work/T287_RC6_LOCAL_EVIDENCE_01'
BASE = 'f49e7533ebedff0946383cb0c5380a6ecac7889d'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def row(p): return {'path':str(p), 'bytes':p.stat().st_size, 'sha256':sha(p)}
def save(p, v):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(v, indent=2)+'\n')
def git(*args): return subprocess.check_output(['/usr/bin/git','-C',str(W),*args],text=True).strip()

activation = json.loads((D/'WRITER_ACTIVATION.json').read_text())
subject = json.loads((X/'native-09/review-subject-001/SUBJECT.json').read_text())
assert sha(X/'native-09/review-subject-001/SUBJECT.json') == activation['source']['snapshot']['sha256']
assert sha(X/'proof-10/ROOT_CONJUNCTION.json') == activation['source']['acceptance']['sha256']
assert json.loads((X/'proof-10/ROOT_CONJUNCTION.json').read_text())['result']=='TARGETED_INTERFACE_REFACTOR_ACCEPTED'
assert subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD'],text=True).strip()==BASE
assert not W.exists()
for r in subject['files']:
    assert sha(S/r['path'])==r['sha256'],r['path']
    assert sha(Path(r['snapshot']))==r['sha256'],r['snapshot']
dirty = subprocess.check_output(['git','-C',str(S),'diff','--name-only','HEAD'],text=True).splitlines()
assert set(dirty)<=set(r['path'] for r in subject['files'])
assert not subprocess.check_output(['git','-C',str(S),'diff','--cached','--name-only'],text=True).strip()
subprocess.run(['git','-C',str(M),'worktree','add','-b','codex/rc6-local-cut',str(W),BASE],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
for r in subject['files']:
    p=W/r['path'];p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(r['snapshot'],p)

# Identity only: dependencies, logical schema and workflow versions stay exact.
changes=[]
for name in ['package.json','package-lock.json']:
    p=W/T/name;before=p.read_bytes();d=json.loads(before);assert d['version']=='5.0.0-rc.5';d['version']='5.0.0-rc.6'
    if name=='package-lock.json':
        assert d['packages']['']['version']=='5.0.0-rc.5';d['packages']['']['version']='5.0.0-rc.6'
    p.write_text(json.dumps(d,indent=2)+'\n');changes.append({'path':str(p.relative_to(W)),'beforeSha256':hashlib.sha256(before).hexdigest(),'afterSha256':sha(p),'meaning':'package/root identity only'})
p=W/T/'code/src/product/contracts.ts';before=p.read_bytes();assert before.count(b'5.0.0-rc.5')==2;p.write_bytes(before.replace(b'5.0.0-rc.5',b'5.0.0-rc.6'))
changes.append({'path':str(p.relative_to(W)),'beforeSha256':hashlib.sha256(before).hexdigest(),'afterSha256':sha(p),'meaning':'two existing Product/package identity constants only'})

evidence=[
 'ROOT_TARGETED_REFACTOR_09.md','ROOT_PROOF_ONLY_DISPOSITION_10.md',
 'native-09/review-subject-001/SUBJECT.json','native-09/review-subject-001/source.diff',
 'native-09/INDEPENDENT_TARGETED_REFACTOR_REVIEW.json','native-09/ROOT_SOURCE_AND_EVIDENCE_DISPOSITION.json',
 'proof-10/HANDOFF.md','proof-10/ROOT_CONJUNCTION.json','proof-10/ACTUAL_C2_SUMMARY.json',
 'proof-10/NATIVE_C2_CLOSED_RESULT.json','proof-10/INDEPENDENT_COMPLETION_REVIEW.json',
 'proof-10/NATIVE_UAT_CLOSED_RESULT.json','proof-10/ACTUAL_FINAL_CLOSE_COORDINATES.json',
 'proof-10/SOURCE_AFTER_FINAL_CLOSE.json','proof-10/WORKFLOW_TIMING_CLOSED.json',
 'proof-10/execution/outcome-summary.json','proof-10/execution/fresh-reads.json',
 'proof-10/execution/HOST_PROCESS_EXIT.json','proof-10/actual-c2-001/CANDIDATE_PACKAGE_IDENTITY.json',
 'proof-10/actual-c2-001/single-address-space-proof.json']
index=[]
for rel in evidence:
    original=X/rel;target=W/E/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(original,target)
    index.append({'original':str(original),'path':str(target.relative_to(W)), 'bytes':target.stat().st_size,'sha256':sha(target)})
for name in ['return.json','readiness.json','progress.json']:
    original=S/'consolidation-scratch/native-09'/name;target=W/E/'original-native-09-handoffs'/name
    target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(original,target)
    index.append({'original':str(original),'path':str(target.relative_to(W)),'bytes':target.stat().st_size,'sha256':sha(target)})
shutil.copy2(D/'WRITER_ACTIVATION.json',W/E/'WRITER_ACTIVATION.json')
save(W/E/'INDEX.json',{'kind':'rc6_bounded_evidence_custody','baseCommit':BASE,'subjectSha256':sha(X/'native-09/review-subject-001/SUBJECT.json'),'records':index,'standing':'Exact retained native source/proof evidence. RC6 identity, packaging and installation are a separate mechanical successor; no native Run is relabelled. Historical failures and all raw campaign files remain in original custody.','preservedFailures':json.loads((X/'proof-10/ROOT_CONJUNCTION.json').read_text())['preservedFailures']})
bridge={'kind':'rc6_frozen_source_identity_bridge','baseCommit':BASE,'nativeSubject':row(X/'native-09/review-subject-001/SUBJECT.json'),'conservedSourceCount':len(subject['files']),'nativeIncrementPaths':subject['incrementChangedPaths'],'cumulativeSourcePaths':subject['changedPaths'],'identityChanges':changes,'conservedSource':[{'path':r['path'],'nativeSha256':r['sha256'],'candidateSha256':sha(W/r['path'])} for r in subject['files']],'evidenceIndex':row(W/E/'INDEX.json'),'generatedOutputs':'Produced by the unchanged existing tenant generators; exact generated delta recorded before checkpoint.','claimBoundary':'Bounded targeted IR01/IR02 acceptance only; wider R1-R7/C1-C5 and complete new-source workflow performance and full qualification remain open.'}
save(W/E/'SOURCE_BRIDGE.json',bridge)

claim='''# ABIogenesis 5.0.0-rc.6 local development candidate

This source selects `5.0.0-rc.6` for the owner-authorized local cut and installation
of the frozen single-address-space successor to RC5. It remains unqualified.
The separate local cut record names the exact source commit/tree, artifact,
manifest, Product content, installation and payload correspondence.

The predecessor is immutable RC5 source `f49e7533ebedff0946383cb0c5380a6ecac7889d`.
Native work and proof ran through installed RC5. The exact frozen subject is
`38933d61515b3a4b07d7b86bf5b2a731ab35f86e43cdae8bd25ddace4e4c0a13`.
The [source bridge](../../../.ai-workspace/work/T287_RC6_LOCAL_EVIDENCE_01/SOURCE_BRIDGE.json)
accounts for its cumulative source and the mechanical RC6 identity change.
The source checkpoint preserves the cumulative candidate, including earlier
consolidation, without claiming closure of the wider R1-R7/C1-C5 programme.

## Accepted bounded outcome

The selected IR01/IR02 increment routes three historical cuts and seven ordinary
call expressions through existing shared owners, removes four obsolete wrappers,
and migrates the affected HOW, support and tests. No additional functionality
is selected. The [Root conjunction](../../../.ai-workspace/work/T287_RC6_LOCAL_EVIDENCE_01/proof-10/ROOT_CONJUNCTION.json)
accepts bounded T1-T5: actual proof10 passed12 with0 failures and0 skips; all seven
commands exited0; independent source/completion review and native UAT satisfied;
the lifecycle completed and fresh result/replay agreed. These observations retain
their original RC5-labelled test artifact and native Run identities.

RC6 changes package/root-lock identity and the two existing Product constants.
Existing generators derive the manifest and contracts. Dependencies, logical
schema/workflow versions and the accepted substantive source remain unchanged.
Clean reproduction and Product-owner verification/install are separately recorded
by the RC6 local cut; packaging does not create a new native qualification result.

## Retained limits

Actual09 remains77pass/8fail/75skip: whole-path5/7/0, revision4/1/2 and
consumers59/0/73; nativeProofnull, UATnotselected and Runblocked. Current12/0/0
closes only the missing-baseline whole-path gap. N9-RETAINED-FIXTURE-01 remains
open before dependent D2/qualification claims. Several caller/cut arms have
static trace and shared-owner evidence, not direct execution. Earlier failed,
partial and accepted cuts retain their own standing in the
[evidence index](../../../.ai-workspace/work/T287_RC6_LOCAL_EVIDENCE_01/INDEX.json)
and original campaign custody.

Measured owner-reuse savings do not establish complete RC6 workflow latency.
The initial cold authentication cost remains; setup, launch and between-task
timing are distinct. The proof10 timing describes installed RC5 orchestration.
Reviews are independent actors in the same model family. Fifteen-family coverage,
installed S01/S02/S03/S06, native F11 and sole AF22, exact prospective release and
human acceptance remain open. Existing Product 5.1 exclusions stay unchanged.

## Identity and distribution

Package: `@abiogenesis/typescript-tenant` `5.0.0-rc.6`, private.
Product: `product://abiogenesis/typescript-tenant@5.0.0-rc.6`.
Method: `stdo://releases/v3.0.4/`, manifest
`102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`.
Namespace/profile/subtree: `abiogenesis` / `one_project_unqualified` / `.`.
This local cut creates no tag, publication, global selector, merge, push or stable
release claim. RC1-RC5 and their evidence remain immutable. A later qualified
release follows Product S07 prospectively; this preview cannot retroauthorize it.
'''
(W/T/'release-claim.md').write_text(claim)

# Retain preimages and supersede current coordination once; historical entries stay.
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
paragraph=f'Current selection, {now}: **RC6_LOCAL_CUT_INSTALL_SELECTED**. The owner instructed "lets move to RC6" after bounded targeted-refactor acceptance. The separate operator Writer is preparing an isolated source checkpoint, mechanical RC6 identity, reproducible package and existing-owner local installation. Frozen source38933d61515b and proof10 acceptance remain the evidence basis; historical failures and wider qualification/performance limits remain. No new native coding or qualification campaign is selected. Final source/artifact/install coordinates will be recorded in the local cut handoff.'
for rel,marker in [('specification/GOALS.md','## Current Selection\n'),('.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md','# T-287 - Deliver ABIogenesis 5.0 Native Runtime and Default Library\n')]:
    p=M/rel;before=p.read_bytes();backup=D/'coordination-preimages'/rel;backup.parent.mkdir(parents=True,exist_ok=True);backup.write_bytes(before)
    text=before.decode();assert marker in text;text=text.replace(marker,marker+'\n'+paragraph+'\n',1);p.write_text(text)
    dest=W/rel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(text)
status=X/'STATUS.json';before=status.read_bytes();(D/'coordination-preimages/STATUS.json').write_bytes(before);d=json.loads(before)
d['recordedUtc']=now;d['status']='RC6_LOCAL_CUT_INSTALL_PREPARING';d['nextSelectedWork']={'outcome':'Bounded local RC6 cut and install','ownerInstruction':'lets move to RC6','activation':row(D/'WRITER_ACTIVATION.json'),'worktree':str(W)};d['currentActivation']={'role':'bounded operator Writer','status':'preparing','path':str(D/'WRITER_ACTIVATION.json')};status.write_text(json.dumps(d,indent=2)+'\n')
save(D/'SOURCE_PREPARED.json',{'at':now,'worktree':str(W),'base':BASE,'subject':row(X/'native-09/review-subject-001/SUBJECT.json'),'bridge':row(W/E/'SOURCE_BRIDGE.json'),'evidenceIndex':row(W/E/'INDEX.json'),'sourcePaths':len(subject['files']),'sourceDiff':git('diff','--stat'),'status':'IDENTITY_PREPARED_BUILD_PENDING'})
print(json.dumps({'status':'IDENTITY_PREPARED_BUILD_PENDING','worktree':str(W),'sourceFiles':len(subject['files']),'evidenceFiles':len(index),'identityFiles':len(changes)}))
