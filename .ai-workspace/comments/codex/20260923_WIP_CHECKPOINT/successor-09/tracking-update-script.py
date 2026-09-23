import json,hashlib,os,re,difflib
from pathlib import Path
A=Path('/Users/jim/src/apps/abiogenesis');G=Path('/Users/jim/src/apps/odd_glc');rel='.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-09';C=A/'.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME';E=G/'.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def link(doc,label,p):return '['+label+']('+os.path.relpath(p,doc.parent)+')'
def body(doc):
 L=lambda label,p:link(doc,label,p)
 return f'''GOAL-035/T-287 and T-043 retain the fixed fifteen-family ABG5 outcome, original
job/S1–S5/oracle, five selected/four outside residuals, source stream bytes and
protected worksite. ABG uses STDO 2.5.1 RC1; GLC remains on RC4. Earlier
core03/compiled08 and nested-compose15 acceptances keep their bounded scopes.

Root accepts core04, consumer01 and caller02 at SOURCE/READINESS after the
{L('independent source review',C/'composite-review-01/source-readiness-return.md')}
(`f596f35e…`). Core04 removes duplicate native complete-call admission and two
whole validated-prefix comparisons. Consumer01 contracts the prior carrier and
borrows authenticated historical input/publication through existing R10 and leaf
owners. Caller02 uses the resulting ordinary interfaces. All 16 named source,
test and HOW postimages are exact. No new admission relation, runtime entity,
controller or Product family is selected.

{L('Combined package readiness',C/'composite-native-01/return.md')} is CLOSED:
compiled09 archive `ddce524a0f992206a2836bbdc4c0655beff5aab5fb7bef7c59ca6b8f180528d5`
and consumer dev.5 archive
`f266d0723a48d858d8de59b1828693e784b38c1e9ee0924112b3f2776424f265`.
Its frozen correspondence records all 5,232 core and 10 consumer members exact,
713 generated core members with 11 changes, real installed Product verification
and GTL validation. Independent package review is pending at this checkpoint.
These are source/package readiness claims; the installed native correction
conjunction and ordinary original-workspace outcome remain unproved.

No suitable directly identified small assessment fixture supplies the required
native-assessment/physical-subject conjunction. Root selects the
{L('original recovered ordinary caller02',E/'held-continuation-implementation-02/return.md')}
as the NEXT integration discriminator after package readiness. Do not manufacture
a producer campaign. Its `final-binding.json` is absent; no current recovery or
Run is claimed. The caller uses `until: converged`, so this selection establishes
no model-free first-J stop. Installed first F_D/J equivalence, source/ancestor/
currentness refusals, genuine cold reconstruction and original capacity outcome
remain open to applicable evidence and Executive disposition.

The {L('original attempt',E/'held-continuation-launch-controls-01/return.md')}
remains CLOSED PROCESS-FAILED: nine setup calls passed before default-heap OOM
(481.166 s total, 147.293 s native phase, 6,843,973,632 B peak RSS); only the first
F_D task success is recorded. No ABG terminal, genuine final close/current
handoff, current Public readback, provider cost or final protected conservation
is established. The 1,235,175,110-byte journal and worksite remain preserved;
this checkpoint did not read, hash, recover or mutate them. The
{L('allocation diagnosis',C/'original-run-allocation-diagnosis-01/return.md')}
is CLOSED; the exact fatal allocator and OOM cure remain unproved.

{L('Recovery readiness',E/'held-continuation-recovery-readiness-01/return.md')}
retains its read-only acceptance. Genuine recovery requires the actual current
digest, identity-scoped lock state, quiescence, executing artifact and exact
owner approval. Old-Run terminalization is not a prerequisite for the distinct
corrected-candidate Run; preserve its nonterminal history. Native `run-stopped`
binding remains a separate open release-applicability/implementation residual.
One live owner progresses incremental state with the append journal; cold
recovery applies only when state is absent. This checkpoint grants no runtime
recovery, retry, heap increase or new native execution.

{L('Continuation16',A/'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-16/return.md')}
is CLOSED readiness (`394df327…`, subject `006b80e8…`); eight S02 cases await an
adequate final candidate. Semantic-negative applicability/evidence retains its
contrary evidence and unknown applicability; no new campaign, closure or waiver.
Full S1–S5/oracle, qualification, unpublished RC1 and human acceptance stay open.
Existing actor/command budgets, default heap and default dependency stay fixed.

The {L('successor09 checkpoint',doc.parents[1]/rel/'README.md' if doc.parent.name=='specification' else (A if doc.is_relative_to(A) else G)/rel/'README.md')}
conserves accepted source/package evidence through the existing proof bank and
records exact commit/remote identities in its publication return. Source push
publishes this bounded checkpoint; it does not qualify or release the Product.
Next: package disposition → separately authorized genuine recovery and ordinary
caller02 integration → remaining qualification and human release acceptance.
'''
files=[A/'specification/GOALS.md',A/'.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md',G/'specification/GOALS.md',G/'.ai-workspace/tickets/active/T-043-deliver-generic-live-llm-scenario-mvp.md']
records=[]
for p in files:
 repo=A if p.is_relative_to(A) else G;old=(repo/rel/'tracking-preimages'/p.relative_to(repo)).read_text();assert p.read_text()==old
 s=old
 if p==files[0]:
  s=s[:s.index('### Current checkpoint disposition — 2026-09-24')]+ '### Current checkpoint disposition — 2026-09-24\n\n'+body(p)+'\n'+s[s.index('### Historical delivery and repair dispositions'):]
  start=s.index('Active under STDO 2.5.1 RC1.');end=s.index(' |',start)
  s=s[:start]+'Active under STDO 2.5.1 RC1. Core04/consumer01/caller02 SOURCE/READINESS is accepted; compiled09/dev.5 package readiness is CLOSED with independent package review pending. Original recovery/caller02 integration, eight S02 cases, semantic-negative applicability/evidence, full S1–S5/oracle, qualification/RC1 and human acceptance remain open.'+s[end:]
 elif p==files[1]:
  start=s.index('## Current Checkpoint And Installed Continuation');end=s.index('## Current Management Prerequisite Plan',start)
  s=s[:start]+'## Current Checkpoint And Installed Continuation\n\n'+body(p)+'\n'+s[end:]
  fields={'current_activation':'CORE04_CONSUMER01_CALLER02_SOURCE_ACCEPTED_COMPILED09_DEV5_PACKAGE_READINESS_CLOSED','current_candidate_record':'.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/composite-native-01/return.md','current_candidate_archive_sha256':'ddce524a0f992206a2836bbdc4c0655beff5aab5fb7bef7c59ca6b8f180528d5','current_worker_return':'.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/composite-native-01/return.md','current_candidate_scope':'core04_consumer01_caller02_SOURCE_READINESS_accepted_compiled09_dev5_package_readiness_CLOSED_native_original_outcome_pending','current_activation_status':'source_accepted_package_readiness_closed_independent_package_review_pending_original_recovery_caller02_integration_next','current_activation_disposition':rel+'/root-disposition.json','next_bounded_task':'package_disposition_then_authorized_original_recovery_and_ordinary_caller02_integration_remaining_qualification','next_bounded_task_status':'original_recovered_ordinary_caller_selected_next_final_binding_absent_no_model_free_first_J_stop_no_Producer_campaign'}
  for k,v in fields.items():s,n=re.subn(r'^- '+k+r': .*$', '- '+k+': '+v,s,count=1,flags=re.M);assert n==1,k
  s=re.sub(r'^\| NW-CALLER-PREPARATION-LIFETIME-01 / LIFE-01 \|.*$', '| NW-CALLER-PREPARATION-LIFETIME-01 / LIFE-01 | Core04/consumer01/caller02 SOURCE/READINESS is accepted after independent review. Compiled09/dev.5 package readiness is CLOSED with exact archive/source correspondence; independent package review is pending. Earlier core03/compiled08 acceptance and original process failure remain exact. Allocation diagnosis is CLOSED; fatal allocator and OOM cure remain unproved. | Original recovered ordinary caller02 is the next integration discriminator after package readiness; final binding and genuine recovery remain pending. No suitable direct small assessment fixture, producer campaign or model-free first-J stop is claimed. Keep all installed/currentness/cold obligations, original capacity, S1–S5 and qualification open; no heap increase or new framework. |',s,count=1,flags=re.M)
 elif p==files[2]:
  start=s.index('## Selected Work');end=s.index('### Retained predecessor selection and evidence',start)
  s=s[:start]+'## Selected Work\n\n'+body(p)+'\n'+s[end:]
  s=s.replace("Core03/compiled08's\nbounded acceptance remains unchanged. Original correction and S1–S5 are unfulfilled.","Core03/compiled08's\nbounded acceptance remains unchanged. Core04/consumer01/caller02 source readiness\nis now accepted and compiled09/dev.5 package readiness is CLOSED; original\ncorrection, installed composition and S1–S5 remain unfulfilled.",1)
 else:
  start=s.index('## Current bounded selection');end=s.index('### Retained earlier selection and evidence',start)
  s=s[:start]+'## Current bounded selection\n\n'+body(p)+'\n'+s[end:]
  fields={'current_activation':'ODD_GLC_COMPACT_PRIOR_SOURCE_ACCEPTED_DEV5_PACKAGE_READINESS_CLOSED','current_re_entry':'accepted_bounded_design_reframe_and_source_then_package_disposition_authorized_genuine_recovery_and_ordinary_caller02_integration','current_activation_status':'source_accepted_package_readiness_closed_independent_package_review_pending_original_process_failure_preserved_no_current_recovery_Run','current_activation_record':'../../comments/codex/20260923_WIP_CHECKPOINT/successor-09/root-disposition.json'}
  for k,v in fields.items():s,n=re.subn(r'^- '+k+r': .*$', '- '+k+': '+v,s,count=1,flags=re.M);assert n==1,k
 p.write_text(s);patch=''.join(difflib.unified_diff(old.splitlines(True),s.splitlines(True),fromfile=str(p.relative_to(repo)),tofile=str(p.relative_to(repo))))
 q=repo/rel/('tracking-'+('goals' if p.name=='GOALS.md' else 'ticket')+'.patch');q.write_text(patch)
 records.append({'repo':repo.name,'path':str(p.relative_to(repo)),'preimageSha256':hashlib.sha256(old.encode()).hexdigest(),'postimageSha256':sha(p),'patch':str(q.relative_to(repo)),'scope':'Current sections, current metadata and affected debt row only; earlier sections preserved.'})
(A/rel/'tracking-update.json').write_text(json.dumps(records,indent=2)+'\n')
print(json.dumps(records,indent=2))
