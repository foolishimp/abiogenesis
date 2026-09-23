from pathlib import Path
import json,re,difflib,hashlib
A=Path('/Users/jim/src/apps/abiogenesis');G=Path('/Users/jim/src/apps/odd_glc');rel='.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-04'
def cut(s,start,end,new):a=s.index(start);b=s.index(end,a);return s[:a]+new.rstrip()+'\n\n'+s[b:]
def fields(s,values):
 for k,v in values.items():s,n=re.subn(r'^- '+re.escape(k)+': .*$',f'- {k}: {v}',s,count=1,flags=re.M);assert n==1
 return s
p=A/'specification/GOALS.md';s=p.read_text();s=s.replace('Compiled-02 c9 is accepted mechanical/package readiness, not qualification. Compact admission is accepted and finite installed conformance passes; retry now reaches an actor but exposes a CCall failure-evidence classification defect. Its bounded correction is active. Original correction readiness awaits review and successor binding;','Compiled-03 is accepted mechanical/package readiness, not qualification. Its CCall correction admits actual failure evidence and retry progress; finite06 then fails at HoG retry projection before actor2. Read-only handoff diagnosis is active. Original correction readiness02 is accepted and held;')
s=cut(s,'Root accepts [compiled-02]','Original [execution09]', '''Root accepts [compiled-03](../.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-03/return.md)
archive `1d44a8d1…`: three emitted CCall checks plus reused affected compiled-02
proof, with exact 5,232-member correspondence. Compact source/review and the
closed whole-path compact-selection decision remain accepted.

[Finite06](../.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-06/execution-01/return.md)
proves actual malformed failure-evidence admission, retry judgment/progress and
inner attempt2. HoG then refuses `projected-retry-projection-mismatch` before the
second actor. The CCall repair has this installed scope; recovery remains
unproved and read-only whole-handoff diagnosis is active. Prior finite05 compact
conformance and existing cost/diagnostic/fixture debt retain their scope in
[T-287](../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-management-debt).''')
s=s.replace('[Execution10 readiness](../../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness/return.md)\nis CLOSED, pending independent caller review and later archive rebinding; no','[Execution10 readiness02](../../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness-02/return.md)\nis accepted on compiled-03 under the satisfied caller review; no')
s=s.replace('Next: narrow source/caller review → one rebuild → affected installed retry proof','Next: closed handoff diagnosis/selected correction and source review → one rebuild → affected installed retry proof')
p.write_text(s)
p=A/'.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md';s=p.read_text();s=fields(s,{'current_activation':'RETRY_HANDOFF_READ_ONLY_DIAGNOSIS_WITH_ACCEPTED_GENERIC_CORRECTION_READINESS_HELD','current_candidate_record':'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-03/return.md','current_candidate_archive_sha256':'1d44a8d17cc2c5282a7d4f26a91a941c62a5ad8c7103193535006203b9435e01','current_accepted_candidate_record':'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-03/return.md','current_accepted_archive_sha256':'1d44a8d17cc2c5282a7d4f26a91a941c62a5ad8c7103193535006203b9435e01','current_worker_return':'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-06/execution-01/return.md','current_candidate_scope':'compiled03_mechanical_package_accepted_CCall_actual_failure_admission_retry_progress_proved_HoG_projection_failed_recovery_unproved','current_activation_status':'read_only_retry_handoff_diagnosis_execution10_readiness02_accepted_held_no_large_preparation','next_bounded_task':'closed_retry_handoff_diagnosis_selected_correction_review_one_rebuild_installed_retry_proof_preserved_generic_correction_qualification_checkpoint_RC1','current_continuation_debt':'compact_representation_accepted_CCall_installed_failure_progress_proved_HoG_retry_projection_failure_diagnosis_active_cost_diagnostic_fixture_residuals','current_correction_record':'../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness-02/return.md'})
s=cut(s,'[Compiled-02]','Original [execution09]', '''[Compiled-03](../../comments/codex/20260923_COMPOSITE_READINESS/compiled-03/return.md)
archive `1d44a8d1…` is accepted mechanical/package readiness: three affected
emitted CCall checks and reused compiled-02 evidence, all 5,232 members exact.
The [CCall source review `cff027c4…`](../../comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-05-evidence-repair-01/review-01/return.md),
compact source/review and closed whole-path owner decision remain accepted.

[Finite06](../../comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-06/execution-01/return.md)
(return `86f7264e…`, freeze `590cf1ec…`) admits real malformed failure evidence,
ordinary retry judgment/progress and inner attempt2. HoG then reports
`projected-retry-projection-mismatch` before actor2. The CCall correction is
installed-proved for failure admission/progress; full recovery is unproved.
Read-only whole retry-handoff diagnosis is active; no preliminary cause or new
repair is claimed here. Prior finite05 seven-call setup/compact conformance and
all earlier successful/failed cuts remain banked under their original identities.''')
s=s.replace('[Execution10 readiness](../../../../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness/return.md)\nsubject `fb9d1a13…` is CLOSED, pending independent caller review and later\ncandidate rebinding.','[Execution10 readiness02](../../../../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness-02/return.md)\nsubject `4ed64dc6…`/freeze `22ea02c5…` is accepted on compiled-03 under the\n[satisfied caller review `6cca8f94…`](../../../../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness-review/return.md).')
s=s.replace('Next: narrow source/caller review → one rebuild → affected installed retry proof','Next: closed handoff diagnosis/selected correction and source review → one rebuild → affected installed retry proof')
for key,new in {
'S02-RETRY-RUN-PREFIX-01':'| S02-RETRY-RUN-PREFIX-01 | Accepted Run-prefix correction crossed initial nested entry on finite05. The accepted CCall correction on [finite06](../../comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-06/execution-01/return.md) admits malformed failure evidence, actual retry judgment/progress and inner attempt2. | HoG then refuses projected-retry-projection-mismatch before actor2. Whole-handoff diagnosis is read-only; full recovery remains unproved. Original failure evidence, retry policy and oracle stay unchanged. The next repair requires closed diagnosis, source review/build and affected installed proof. |',
'NW-CALLER-PREPARATION-LIFETIME-01':'| NW-CALLER-PREPARATION-LIFETIME-01 | Earlier lifetime repair and execution08/09 failures stay preserved. [Readiness02](../../../../odd_glc/.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness-02/return.md) binds compiled-03 through byte-identical reviewed caller/reader/observer and its actual verification result; mechanical checks pass without original-resource effects. | Accepted mechanical rebind under caller review6cca8f94; no additional coordinate-only review. Original setup6 close/worksite/policy remain exact. Large preparation is held pending the installed retry disposition; no global memory cure or launch authority follows. |'}.items():
 s,n=re.subn(r'^\| '+re.escape(key)+r' \|.*$',lambda m:new,s,count=1,flags=re.M);assert n==1
p.write_text(s)
p=G/'specification/GOALS.md';s=p.read_text();s=cut(s,'Current delivery tracking:','Deliver one generic', '''Current delivery tracking: [execution10 readiness02](../.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness-02/return.md)
is accepted on compiled-03 under the satisfied caller review; original-resource
preparation remains held. Finite06 proves actual CCall failure admission/retry
progress, then fails at HoG retry projection before actor2. Read-only handoff
diagnosis is active. Execution09 and its close remain untouched; full S1–S5,
targeted revision, qualification and human acceptance remain open under RC4.''')
s=s.replace('owns accepted compact source/review, compiled-02 c9, finite05\'s seven setup passes\nand the diagnosed CCall omission.','owns accepted compact/caller/CCall source and compiled-03, finite05 conformance,\nand finite06\'s installed failure-admission/progress proof and later HoG failure.')
s=s.replace('Next: narrow source/caller review → one\nrebuild → affected installed retry proof','Next: closed handoff diagnosis/selected correction and source review → one\nrebuild → affected installed retry proof')
s=s.replace('The current frontier is the bounded CCall correction and held generic-correction\nreadiness described above.','The current frontier is read-only retry-handoff diagnosis and accepted, held\ngeneric-correction readiness02 described above.')
p.write_text(s)
p=G/'.ai-workspace/tickets/active/T-043-deliver-generic-live-llm-scenario-mvp.md';s=p.read_text();s=fields(s,{'current_activation':'ODD_GLC_READINESS02_ACCEPTED_HELD_FOR_RETRY_HANDOFF_DISPOSITION','current_re_entry':'dependency_wait; closed retry-handoff diagnosis and selected reviewed correction/installed proof before original preparation','current_activation_status':'readiness02_accepted_compiled03_original_execution09_close_untouched_finite06_HoG_failure_under_read_only_diagnosis','current_activation_record':'../../comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness-02/return.md'})
s=s.replace('[Execution10 readiness](../../comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness/return.md)\nsubject `fb9d1a13…` is CLOSED with pure caller checks, pending independent review\nand later archive rebinding.','[Execution10 readiness02](../../comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION/execution-10-readiness-02/return.md)\nsubject `4ed64dc6…` is accepted on compiled-03 under satisfied caller review\n`6cca8f94…`; caller/reader/observer logic and original input remain unchanged.')
a=s.index('owns the substrate:');b=s.index('\n\nThe next sequence',a)
s=s[:a]+'''owns accepted compact/caller/CCall source and compiled-03 mechanical readiness.
[Finite06](../../../../abiogenesis/.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-06/execution-01/return.md)
admits actual malformed failure evidence, retry judgment/progress and inner
attempt2, then fails at HoG retry projection before actor2. The CCall repair has
that installed scope; recovery remains unproved and read-only whole-handoff
diagnosis is active. Whole-path compact selection remains CLOSED/accepted.
Existing cost, diagnostic and fixture residuals remain in T-287's register.'''+s[b:]
s=s.replace('The next sequence is narrow source/caller review → one rebuild → affected','The next sequence is closed handoff diagnosis/selected correction and source\nreview → one rebuild → affected')
p.write_text(s)
for repo in [A,G]:
 D=repo/rel;ticket='T-287-deliver-abiogenesis-5-feature-waves.md' if repo==A else 'T-043-deliver-generic-live-llm-scenario-mvp.md';rows=[]
 for name,p in [('goals',repo/'specification/GOALS.md'),('ticket',repo/'.ai-workspace/tickets/active'/ticket)]:
  old=(D/'tracking-preimages'/f'{name}.md').read_text();new=p.read_text();delta=''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='preimage/'+name,tofile=str(p)));(D/f'tracking-{name}.patch').write_text(delta)
  rows.append({'path':str(p.relative_to(repo)),'beforeSha256':hashlib.sha256(old.encode()).hexdigest(),'afterSha256':hashlib.sha256(new.encode()).hexdigest()})
 (D/'tracking-delta.json').write_text(json.dumps(rows,indent=2)+'\n')
print('Current tracking updated only to accepted compiled03/readiness02 and closed native06; preliminary diagnosis excluded.')
