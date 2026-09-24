#!/usr/bin/env python3
"""Finalize the closed checkpoint selection; do not inspect active execution resources."""
import hashlib,json,re,shutil,subprocess
from pathlib import Path
A=Path('/Users/jim/src/apps/abiogenesis');G=Path('/Users/jim/src/apps/odd_glc')
CP=Path('.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-11')
L=A/'.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME'
C=A/'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-13'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def write(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
def replace_once(s,old,new):
 assert s.count(old)==1,(old,s.count(old));return s.replace(old,new)
def field(s,k,v):
 s,n=re.subn(r'^- '+re.escape(k)+r': .*$',f'- {k}: {v}',s,flags=re.M);assert n==1,k;return s
core=read(C/'selected-core.json');archive=core['basis']['artifactDigest'].removeprefix('sha256:')
assert archive=='bc6e648887a635b24da58bf283e5609a72f274bf358ba09cab33a1caedad2d47'
assert sha(C/'return.md')=='cbf04e3925af5b287dac14b00d2439973ec9647c446beb6ff27c6c1ad66ac9d1'
assert sha(C/'freeze.json')=='e5805b70960b46ab9a37c5438d16cb29f4f1331cc8853f3a3c362635ba50b8d0'
pending=[
 'Active G/held-design-reentry-implementation-02, held-design-reentry-execution-01 and held-design-reentry-launch-controls-01: excluded, no read/hash/copy or launch dependency',
 'Q/successor-07: prepared/incomplete; excluded, no qualification acceptance or launch dependency',
 'Operator-stop installed readback: pending at release boundary; no launch dependency',
 'Original/S02 mutable journals, locks and worksites, installed/node_modules trees, scratch/disposable trees: excluded',
 'S1-S5/oracle, complete qualification, QUAL056/F11/sole AF22, RC1 and human acceptance: open; earlier evidence keeps its exact scope'
]
scope='Completed accepted source/generated/core13 and finite CLOSED evidence checkpoint, independent of the authorized one-launch GLC steel thread. Q07, operator-stop readback and paired checkpoint are not launch prerequisites. No execution or qualification outcome is inferred.'
for repo,ticket in [(A,'T-287-deliver-abiogenesis-5-feature-waves.md'),(G,'T-043-deliver-generic-live-llm-scenario-mvp.md')]:
 cp=repo/CP;initial=cp/'initial-bank';initial.mkdir(exist_ok=False)
 for name in ['activation.json','selection.json','classification.json','transport-reuse.json']:
  shutil.copyfile(cp/name,initial/name)
 act=read(cp/'activation.json');act.update(role='Writer',model='gpt-6-astra',effort='max',worker='/root/consumer_prior_contraction',grant=scope,peerActiveExclusions=pending,initialBankActivation='initial-bank/activation.json');write(cp/'activation.json',act)
 disposition={'status':'accepted_source_readiness_and_compiled13_package_selected_steel_thread_parallel_checkpoint','authority':'Root Writer activation after user instruction: clean up and continue on steel thread','role':'Writer gpt-6-astra/max','sourceSubject':'923b510a82d9e3eda5b0ee3680b512b6bc152ba07dfc17e6d3aee62a0e51ef01','sourceReviewSha256':'10fd2d2fd1cf361b0c88d805558a3288de29539ec4d08b56d343d514b435ebaf','compiled13ReturnSha256':sha(C/'return.md'),'core':core['basis'],'glcSourceSubjectPrefix':'8eef0699','glcAcceptedReviewPrefix':'55056496','consumer':'existing immutable dev.7; identity-only caller rebind owned by execution Worker','selectedNext':'one retained-selector Design-reentry GLC steel thread, already authorized independently','notLaunchPrerequisites':['Q07 completion','operator-stop installed readback','paired checkpoint'],'preserved':'original03 Run/history, 35 files, full job/source/requirements/rubric/oracle, five selected/four outside obligations; existing owner currentness/effect checks','pending':pending,'scope':scope}
 write(cp/'root-disposition.json',disposition)
 pre=cp/'tracking-preimages';pre.mkdir(exist_ok=False)
 for rel in [Path('.ai-workspace/tickets/active')/ticket,Path('specification/GOALS.md')]:
  p=repo/rel;s=p.read_text();(pre/p.name).write_bytes(p.read_bytes())
  target=C/'return.md';link=Path(__import__('os').path.relpath(target,p.parent)).as_posix();review=Path(__import__('os').path.relpath(L/'operator-stop-03/review-01/return.md',p.parent)).as_posix();selection=Path(__import__('os').path.relpath(cp/'root-disposition.json',p.parent)).as_posix()
  replacement=f'[Accepted compiled13]({link}) and existing dev.7 now supply the selected one-launch GLC Design-reentry steel thread; the execution Worker owns the identity-only caller rebind and native outcome. The retained selector, ordinary first-J/R10 authentication and current Design-absence check stay on that path. Operator stop was admitted once on retained S02-19. Its preserving-obligation [source repair]({review}) is accepted; fresh installed status/replay readback remains pending at the release boundary, with absent Result still expected as Public `not_found`. Q07 is prepared/incomplete and carries no qualification acceptance. Q07 completion, independent stop readback and this paired checkpoint are not launch prerequisites. Full S1–S5/oracle, qualification, QUAL056/F11/sole AF22 and RC1 remain open.'
  s,n=re.subn(r'\[Compiled12/dev\.7 Design-reentry caller readiness\]\([^\n]*?\) is CLOSED against accepted sources; checkpoint/launch selection, first-J/R10 and admitted new-Design absence remain pending\. Operator stop was admitted once on retained S02-19; fresh-read `unknown_source` is under bounded diagnosis\. Full S1–S5/oracle, qualification, QUAL056/F11/sole AF22 and RC1 remain open\.',replacement,s);assert n>=1,(str(p),n)
  s=s.replace('Current package/caller readiness is prepared for Root checkpoint and launch selection; no Design-reentry native outcome or release is claimed.',f'The one-launch GLC steel thread is selected under [current Root disposition]({selection}); its active outcome is not claimed by this checkpoint.')
  if p.name==ticket:
   for k,v in {'current_activation':'COMPILED13_DEV7_DESIGN_REENTRY_SINGLE_LAUNCH_SELECTED','current_activation_status':'launch_authorized_identity_only_rebind_active_outcome_unclaimed_checkpoint_parallel_Q07_incomplete_stop_readback_pending_release','current_activation_record':str(CP/'root-disposition.json')}.items():s=field(s,k,v)
   if repo==A:
    for k,v in {'current_candidate_record':str(C.relative_to(A)/'selected-core.json'),'current_candidate_archive_sha256':archive,'current_accepted_candidate_record':str(C.relative_to(A)/'return.md'),'current_accepted_archive_sha256':archive,'current_worker_return':str(C.relative_to(A)/'return.md'),'current_candidate_scope':'accepted_core13_source_package_and_existing_dev7_single_GLC_launch_selected_native_outcome_unclaimed','current_activation_disposition':str(CP/'root-disposition.json'),'next_bounded_task':'single_retained_selector_Design_reentry_native_path_core13_dev7','next_bounded_task_status':'launch_authorized_checkpoint_parallel_Q07_incomplete_stop_readback_pending_release','current_review_disposition':'Root_accepted_GLC8eef0699_review55056496_core923b510a_review10fd2d2f_compiled13_returncbf04e39'}.items():s=field(s,k,v)
    s=replace_once(s,'## Current Management Prerequisite Plan\n\n','## Current Management Prerequisite Plan\n\nThe [current checkpoint selection](#current-checkpoint-and-installed-continuation) owns immediate work: one authorized GLC steel thread on core13/dev.7. Q07 completion, independent operator-stop readback and paired checkpoint are parallel or release-boundary work, not launch prerequisites. The earlier management selections below retain their historical scope.\n\n')
  elif repo==A:
   old='Compiled12/dev.7 Design-reentry caller readiness CLOSED; checkpoint/launch and first-J/R10 pending. Operator stop admitted once; readback diagnosis open.'
   s=replace_once(s,old,'Accepted compiled13/dev.7 GLC steel thread selected for one launch; active outcome unclaimed. Stop03 source accepted; installed stopped-Run readback remains a release check. Q07 prepared/incomplete; paired checkpoint proceeds independently.')
  else:
   old='The current frontier is the final checkpoint and accepted generic-correction\nreadiness03 described above. Earlier rejected full-input sandbox evidence\nkeeps its historical scope. This tracking Writer grants no implementation,\nqualification, model/application execution, Git action or release. Dependent\neffects proceed only through the owning bounded activations.'
   new='The current frontier is the authorized one-launch GLC Design-reentry steel thread on accepted core13 and existing dev.7. This Writer updates tracking and checkpoints completed work in parallel; active execution belongs to its separate Worker grant. Q07 remains prepared/incomplete, and installed operator-stop readback remains pending at the release boundary. Earlier evidence keeps its exact scope; no new native outcome, qualification or release acceptance is claimed here.'
   s=replace_once(s,old,new)
  p.write_text(s)
 # Exact accepted current source map; no current source tree walk.
 if repo==A:
  tenant='build_tenants/abiogenesis/typescript/'
  expected={tenant+r['path']:r['sha256']for r in read(C/'source-freeze-before-build.json')['members']}
  for name in ['generated-after.json','governing-inputs.json']:
   for r in read(C/name):
    raw=Path(r['path']);rel=raw.relative_to(A).as_posix() if raw.is_absolute() else (r['path']if r['path'].startswith(('build_tenants/','specification/'))else tenant+r['path'])
    expected[rel]=r['sha256']
  source=read(L/'operator-stop-01/subject.json')
  extra={tenant+r['path']for r in source['files']}
  extra|={Path(r['path']).relative_to(A).as_posix()for r in read(L/'operator-stop-02/subject.json')['members']}
  extra|={r['path']for r in read(L/'operator-stop-03/subject.json')['members']}
 else:
  expected={Path(r['path']).relative_to(G).as_posix():r['sha256']for r in read(L/'glc-stage-reentry-01/implementation/subject.json')['sourceMembers']};extra=set(expected)
 dirty={x for x in subprocess.check_output(['git','diff','--name-only'],cwd=repo,text=True).splitlines()}
 direct={}
 for rel in sorted(dirty|extra):
  p=repo/rel;actual=sha(p)
  if rel in [str(Path('.ai-workspace/tickets/active')/ticket),'specification/GOALS.md']:proof='Writer current tracking projection with retained preimage'
  else:
   assert rel in expected,('Unselected dirty path',repo.name,rel)
   assert actual==expected[rel],('Accepted source moved',repo.name,rel,actual,expected[rel]);proof='compiled13 frozen construction subject'if repo==A else'accepted GLC source subject 8eef0699'
  direct[rel]={'sha256':actual,'byteLength':p.stat().st_size,'proof':proof}
 selection=read(cp/'selection.json');selection.update(directExpected=direct,pending=pending,scope=scope,initialBankSelection='initial-bank/selection.json');write(cp/'selection.json',selection)
 write(cp/'tracking-projection.json',{'role':'Writer gpt-6-astra/max','files':[{'path':str(rel),'preimageSha256':sha(pre/Path(rel).name),'postimageSha256':sha(repo/rel)}for rel in [Path('.ai-workspace/tickets/active')/ticket,Path('specification/GOALS.md')]],'sourceEdits':False,'historicalEvidenceRewritten':False,'scope':scope})
 print(json.dumps({'repo':repo.name,'directPaths':len(direct),'sourcePostimagesExact':True,'initialBankPreserved':True}))
# Only compiled13 CLOSED freeze is new tail; stop03 source/review are already banked in transport01.
cp=A/CP;tail={'closedProofSelections':[{'freeze':str(C/'freeze.json'),'sha256':sha(C/'freeze.json')}],'adjoiningClosedPosts':[],'directExpected':{},'pending':pending,'scope':'Finite CLOSED compiled13 tail only; existing successor11/transport01 payload untouched.'};write(cp/'tail-selection.json',tail)
s=(cp/'prepare_incremental.py').read_text().replace("selection.json'","tail-selection.json'")
s=s.replace("+[previous/'transport-01']","+[previous/'transport-01',root/'transport-01']")
for n in ['incremental-inventory.jsonl.gz','classification.json','freeze-expectations.json','exclusions.json','transport-reuse.json','selected-archive-paths.nul']:s=s.replace("'"+n+"'","'tail-"+n+"'")
(cp/'prepare_tail.py').write_text(s)
s=(cp/'pack_incremental.py').read_text().replace("out=root/'transport-01'","out=root/'transport-02'").replace("successor11-'+repo.name","successor11-tail-'+repo.name")
for n in ['selected-archive-paths.nul','freeze-expectations.json','frozen-member-correspondence.json']:s=s.replace("'"+n+"'","'tail-"+n+"'")
(cp/'pack_tail.py').write_text(s)
