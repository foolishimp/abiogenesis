"""Root operator/evidence Writer: prepare a continuation, never Product repairs."""
from pathlib import Path
import copy, hashlib, json, shutil, subprocess
from datetime import datetime, timezone

X = Path(__file__).resolve().parent
S = Path('/Users/jim/src/apps/abiogenesis-single-address-space')
M = Path('/Users/jim/src/apps/abiogenesis')
A = X / 'native-02'
I = S / 'consolidation-inputs/native-02'
T = 'build_tenants/abiogenesis/typescript'
now = datetime.now(timezone.utc).isoformat()
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda p: json.loads(p.read_text())
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        f.write(value if isinstance(value, str) else json.dumps(value, indent=2) + '\n')
def pin(p):
    b = p.read_bytes()
    return {'path': str(p), 'bytes': len(b), 'sha256': sha(b)}

assert not A.exists() and not I.exists(), 'No overwrite or implicit retry'
subject_path = X / 'native-01/review-subject-001/SUBJECT.json'
assert sha(subject_path.read_bytes()) == '6302095ec9826d892f620e805cd6336082265721fe8660147299ff4d8bd8ab29'
subject = read(subject_path)
assert subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD'],text=True).strip() == subject['sourceCommit']
assert not subprocess.check_output(['git','-C',str(S),'diff','--cached','--name-only'],text=True).strip()
for f in subject['files']:
    b = (S / f['path']).read_bytes()
    assert sha(b) == f['sha256'] and len(b) == f['bytes'], f['path']
assert set(subprocess.check_output(['git','-C',str(S),'diff','--name-only'],text=True).splitlines()) == set(subject['trackedChangedPaths'])

A.mkdir(); I.mkdir(parents=True)
(S / 'consolidation-scratch/native-02/tmp').mkdir(parents=True)
write(A/'ROOT_WRITER_ACTIVATION.json', {
    'recordedUtc': now, 'roleTransition': 'Executive residual selection -> operator/evidence Writer',
    'authority': str(X/'ROOT_REENTRY_SELECTION_02.md'),
    'purpose': 'Prepare exact continuation of held failed-native source under original whole-path outcome',
    'effects': ['Create native-02 control/preflight/dispatch and compact held-evidence inputs',
                'Create native-02 scratch territory and C2 recipes',
                'Update existing coordination carriers with retained preimages'],
    'exclusions': ['No Product or semantic test repair', 'No accepted/released claim',
                   'No old-run or frozen-input mutation', 'No push, merge, tag or global selector'],
    'nativeDispatch': 'Only after exact installed-owner preparation and Root manifest admission',
})

grant = read(X/'native-01/NATIVE_GRANT.json')
grant.update(status='ROOT_SELECTED_CONTINUATION_PREPARATION', taskId='T287_SINGLE_ADDRESS_SPACE_NATIVE_02')
extra = [
    'code/src/abg/traversal_cursor.ts', 'code/src/abg/construction_continuation.ts',
    'code/src/hog/graph_execute.ts', 'code/src/hog/parent_rehydration.ts',
    'code/src/implementation/contracts.ts', 'test_env/uat/harness.test.mjs',
    'test_env/tests/t287-native-work-reacquisition-normalization.test.mjs',
    'test_env/tests/t287-owned-native-proof.test.mjs',
    'test_env/tests/t287-native-owner-reuse.test.mjs',
    'test_env/tests/t288-initial-cursor-entry.test.mjs',
]
grant['productWritePaths'] = list(dict.fromkeys(grant['productWritePaths'] + [T+'/'+p for p in extra]))
grant['newFilesExpectedAfterConstruction'] = []
grant['scratchWriteRoots'] = ['consolidation-scratch/native-02/'+p for p in ['return.json','readiness.json','progress.json','tmp']]
grant['limits']['maxTurns'] = 1024
grant['sourceStanding'] = 'HEAD is only the unchanged RC5 baseline. Exact current source is held subject plus the bound 43-file before snapshot; 24 changes are unaccepted and must be preserved.'
grant['continuation'] = {
    'heldSubject': pin(subject_path), 'failureAfterObservationDigest': subject['afterObservationDigest'],
    'review': pin(X/'native-01/INDEPENDENT_SOURCE_REVIEW.json'),
    'rootSelection': pin(X/'ROOT_REENTRY_SELECTION_02.md'),
    'selectedResiduals': ['SAS-01','SAS-02','SAS-03','missing native handoff and actual C2/UAT/fresh proof'],
    'unchangedCoverage': 'Reuse the prior independent review for unchanged source; original R1-R7 and all five acceptance criteria remain operative.'
}
grant['independentReview'] = 'Reuse native-01 max review on unchanged source; any necessary independent recheck is limited to repaired findings and their complete causal relation. Root conjoins original outcome.'
write(A/'NATIVE_GRANT.json',grant); write(I/'NATIVE_GRANT.json',grant)
before = {'kind':'held_source_continuation_before_snapshot','recordedUtc':now,
          'baselineCommit':grant['sourceCommit'],'heldSubject':pin(subject_path),
          'files':[dict(pin(S/p),relativePath=p) for p in grant['productWritePaths']],
          'preservedChangedPaths':subject['changedPaths'],'accepted':False}
write(A/'SOURCE_BEFORE.json',before)

for name in ['CONTEXT_AND_CAUSAL_MAP.md','ROOT_TRIAGE_AND_SELECTION.md']:
    shutil.copyfile(X/name,I/name)
shutil.copyfile(X/'ROOT_REENTRY_SELECTION_02.md',I/'ROOT_REENTRY_SELECTION_02.md')
shutil.copyfile(X/'native-01/INDEPENDENT_SOURCE_REVIEW.json',I/'INDEPENDENT_SOURCE_REVIEW.json')
oldI=S/'consolidation-inputs/native-01'
for name in ['PERFORMANCE_DETAIL.md','MEASURED_BASELINE.json','EXTERNAL_READ_RESOURCES.json','rubric.json']:
    shutil.copyfile(oldI/name,I/name)
shutil.copytree(oldI/'contract-seeds',I/'contract-seeds')
held = {k:subject[k] for k in ['status','sourceRoot','sourceCommit','reviewBaseCommit','nativeResultRef','eventOrdinal','afterObservationRef','afterObservationDigest','changedPaths','handoffArtifacts','scratchProofRecord','authorFeedback','diff']}
held['subject'] = pin(subject_path)
held['files'] = [{k:f[k] for k in ['path','bytes','sha256','changed']} for f in subject['files']]
held['standing'] = 'Actual native failure; retained source and feedback only. No prior handoff, actual C2, UAT or acceptance. Full raw evidence remains at exact external paths.'
held['operatorObservations'] = [pin(X/n) for n in ['CONTEXT_ADMISSION_OBSERVATION.json','ACTOR_CONTEXT_COMPACTION_OBSERVATION.json','ACTOR_TOOL_OUTPUT_VOLUME_01.json','AUTHOR_FEEDBACK_INPUT_OBSERVATION.json','CONTEXT_CONTINUITY_CHECK_01.json']]
held['knownFeedback'] = {'affected':'47 pass/0 fail/16 skipped','installed':'2/0/0','wholePath':'4/0/0',
    'legacyHarness':'31/1/4; missing specifically named RC4 package before stale lifetime assertions',
    'caution':'Author feedback only; use current repaired source for the first actual C2.'}
write(I/'HELD_SOURCE_AND_EVIDENCE.json',held)

task = '''# Finish the held whole-path consolidation

Read this TASK, NATIVE_GRANT, ROOT_REENTRY_SELECTION_02, INDEPENDENT_SOURCE_REVIEW,
HELD_SOURCE_AND_EVIDENCE and the original CONTEXT_AND_CAUSAL_MAP first. Apply the
exact installed STDO 3.0.4 stdo-work. Current source already contains the held
24-file change; HEAD f49 is its baseline, not the current source identity.
Continue this candidate. Do not restart its completed implementation or repeat
unchanged feedback merely because a new worker is active.

The owner outcome is unchanged: use the log to identify the red flags, trace
their full affected caller relation into the already implemented common library,
move equivalent internal callers to the same code, and delete superseded baggage
while retaining real information and genuine boundaries. A narrow assignment
never shrinks that outcome. The original map's initial stage is historical;
ROOT_REENTRY_SELECTION_02 and this continuation identify the current stage.

The independent max review verified the held source and found no material
semantic regression in its migrated paths. It rejected complete closure for:

* SAS-01: ordinary traversal cursor admission, automatic construction-intent
  continuation, reentry/selected-action/pending-execution continuation and parent
  return still expand complete history. Follow the actual HoG and Run callers,
  including readRuntimeEvents and validated-prefix aliases. Use existing owned
  transaction/durable-prefix selectors and scoped indexes; preserve domain,
  recovery, currentness, rollback and genuinely cold checks. Inventory equivalent
  affected callers. Return any concrete missing owner relation or necessary
  out-of-territory repair to Root; do not silently exclude it.
* SAS-02: remove the unconsumed authenticateNativeWorkReacquisition complete-body
  adapter, its export and unused proof-operation type, and migrate its semantic
  tests. Preserve the different nativeWorkReacquisition judgment operation.
  Historical tests are not a supported production consumer. Preserve actual
  complete-output contracts and report their concrete consumers and cost.
* SAS-03: reconcile maintained setup's old harness with borrowed completion,
  successor chaining and actual final close, preserving verification and
  environment assertions. Use the exact freshly packed candidate identity;
  never rename candidate bytes to impersonate historical RC4.

Extend the existing installed proof across the actual invocation: its first
meter previously began after producer/consumer execution. Cover frame admission,
traversal completion and continuation with equal outcomes/refusals and reduced
accumulated duplicate work as unrelated history grows. Use existing meter and
owner harnesses; no new runtime/cache/store/registry/authority. Canonical history,
prefix, resource, codec and instruction owners remain read-only under this grant.
The common-library HOW already selects this outcome; make its claims match the
complete repaired caller inventory. Do not call selective materializations zero
or claim fewer decodes: the retained measurement disproved those overstatements.

The previous worker hit its 256-turn operational cap before writing its handoff.
Its source, all green and red feedback, and exact failed Run remain preserved.
This activation has a 1024-turn ceiling. Write a small progress.json in declared
scratch early and after material milestones: resolved findings, next step,
actual checks and all unresolved R1-R7 rows. On context compaction reread that
progress plus this task, selection, full causal map and rubric before continuing.
Do not fill progress with tool output or the whole repository. Before final
return write return.json and readiness.json with actual changed hashes, findings,
caller/deletion/retention census, all R1-R7 dispositions, feedback and limits.
Then stop editing. A progress record is not readiness or acceptance.

Use only meaningful affected author feedback; retained valid evidence stays
valid. The first actual C2 will compile/generate/pack the exact returned subject,
run the selected lanes and emit single-address-space-proof.json plus C2 report.
Native UAT and Root then conjoin actual proof with the independent review and
fresh closure. No whole qualification, new release, stable claim or publication.

Read C2_INPUTS for exact proof inputs and lanes, EXTERNAL_READ_RESOURCES for the
read-only captured log, baseline and offline toolchain. Prior failures are
linked in HELD_SOURCE_AND_EVIDENCE. The 11 framed-governance witness fixtures are
already in selectedPaths; include them when preparing scratch feedback. Do not
broad-search .ai-workspace for hashes or copy archives/log bodies into task text.
The old source/preimage, proof and TAP bodies remain at their exact paths.

Normal feedback writes only consolidation-scratch/native-02/tmp. Copy needed
source, fixtures, exact contract seeds and offline node_modules there; build and
pack there. The native-01 scratch candidate may be read as a declared feedback
predecessor but must not be modified or mistaken for current source. No Product
build outputs in the canonical worksite, git commit, provider/subagent spawning
or change to frozen records. Return integration failures through the existing
Root re-entry boundary with exact evidence.
'''
write(A/'task.md',task); write(I/'TASK.md',task)

profile=read(X/'native-01/PROVIDER_PROFILE.json')
profile['provider']['command']=str(A/'claude-provider.sh')
profile['provider']['maxTurns']=1024
profile['providerScratch']=str(S/'consolidation-scratch/native-02/tmp')
profile['continuationStanding']='Distinct authorized activation from actual failed-run close; no automatic retry'
write(A/'PROVIDER_PROFILE.json',profile)
provider=(X/'native-01/claude-provider.sh').read_text().replace('consolidation-scratch/native-01/','consolidation-scratch/native-02/')
write(A/'claude-provider.sh',provider); (A/'claude-provider.sh').chmod(0o755)
for name in ['dispatch.mjs','selector-size-preflight.mjs']:
    shutil.copyfile(X/'native-01'/name,A/name)

prepare=(X/'native-01/prepare-r2.mjs').read_text()
prepare=prepare.replace("join(campaign,'runtime-001/operator-resume-material.json')","join(campaign,'native-01/execution/after-run-resume.json')")
prepare=prepare.replace("execFileSync('/usr/bin/git',['-C',work,'diff','--quiet']);", "const held=await json(join(dir,'SOURCE_BEFORE.json'));\nfor(const file of held.files){const bytes=await readFile(join(work,file.relativePath));assert.equal(hash(bytes),file.sha256,file.relativePath);assert.equal(bytes.length,file.bytes,file.relativePath);}\n")
prepare=prepare.replace("runId:'single-address-space-native-01'","runId:'single-address-space-native-02'")
prepare=prepare.replace('SELECTOR_CAPACITY_PREFLIGHT-r2.json','SELECTOR_CAPACITY_PREFLIGHT.json')
prepare=prepare.replace("sourceCommit:grant.sourceCommit,sourceBasis:'none'","sourceCommit:grant.sourceCommit,heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),sourceBasis:'none'")
prepare=prepare.replace("const prepared={status:'PREPARED_NOT_DISPATCHED',sourceCommit:grant.sourceCommit,", "const prepared={status:'PREPARED_NOT_DISPATCHED',sourceCommit:grant.sourceCommit,heldSourceSnapshotSha256:hash(await readFile(join(dir,'SOURCE_BEFORE.json'))),")
write(A/'prepare.mjs',prepare)

inputs=read(oldI/'C2_INPUTS.json')
future=['consolidation-scratch/native-02/'+n for n in ['return.json','readiness.json','progress.json']]
inputs['sourceStanding']='f49 baseline plus exact held source continued under native-02; source-correspondence reports every granted Product file and current handoff'
inputs['heldSourceSubjectSha256']=sha(subject_path.read_bytes())
inputs['sourceCorrespondencePaths']=grant['productWritePaths']+future
inputs['futureNativeFiles']=future
inputs['lanes'][0]['files'] += ['test_env/tests/'+n for n in ['t287-owned-native-proof.test.mjs','t287-native-owner-reuse.test.mjs','t288-initial-cursor-entry.test.mjs']]
inputs['lanes'][0]['timeoutMs']=900000
inputs['lanes'][1]['timeoutMs']=300000
inputs['lanes'][2]['minimumPasses']=4
inputs['lanes'].append({'id':'maintained-setup-harness','files':['test_env/uat/harness.test.mjs'],
    'timeoutMs':300000,'minimumPasses':32,'requireNoSkips':False})
write(I/'C2_INPUTS.json',inputs); write(A/'EXPECTED_FUTURE_FILES.json',future)
c2=(X/'native-01/c2-proof.mjs').read_text().replace('consolidation-inputs/native-01','consolidation-inputs/native-02')
write(A/'c2-proof.mjs',c2); write(I/'c2-proof.mjs',c2)

old=read(X/'native-01/workload.json')
def relocate(value):
    if isinstance(value,str):
        return value.replace('consolidation-inputs/native-01','consolidation-inputs/native-02').replace('consolidation-scratch/native-01','consolidation-scratch/native-02').replace('single-address-space/native-01','single-address-space/native-02')
    if isinstance(value,list):return [relocate(v) for v in value]
    if isinstance(value,dict):return {k:relocate(v) for k,v in value.items()}
    return value
w=relocate(old)
w['task']='Complete the held whole-path consolidation from native-01: resolve SAS-01/SAS-02/SAS-03, preserve all reviewed migrations, retire duplicate paths, retain the original R1-R7 outcome, and deliver exact source with meaningful installed accumulated-work proof and handoff. No implementation restart or local-only closure.'
w['authorityRefs'] += [(X/'ROOT_REENTRY_SELECTION_02.md').as_uri()]
read_first=['consolidation-inputs/native-02/'+n for n in ['TASK.md','NATIVE_GRANT.json','ROOT_REENTRY_SELECTION_02.md','INDEPENDENT_SOURCE_REVIEW.json','HELD_SOURCE_AND_EVIDENCE.json','CONTEXT_AND_CAUSAL_MAP.md']]
for role,order in w['workOrders'].items():
    order['readFirst']=read_first
    order['outcome']=w['task']
    if role=='construction':
        order['instructions']=[task]
        order['writeRoots']=grant['productWritePaths']+grant['scratchWriteRoots']
    else:
        order['instructions']=['Consume the original whole causal map and current continuation selection, exact review and rubric. Only construction has source writes. Use named C2/artifact/source paths; no broad historical search. Require SAS-01 actual invocation/continuation coverage, SAS-02 retirement and SAS-03 honest current-artifact harness, while retaining every original R1-R7 disposition. Author feedback is not actual C2. Report missing evidence without accepting a local substitute.']
extra_inputs=['consolidation-inputs/native-02/'+n for n in ['ROOT_REENTRY_SELECTION_02.md','INDEPENDENT_SOURCE_REVIEW.json','HELD_SOURCE_AND_EVIDENCE.json']]
selected=set(w['testing']['selectedPaths']) | set(grant['productWritePaths']) | set(extra_inputs) | set(future)
selected.add(T+'/test_env/uat/harness.test.mjs')
w['testing']['selectedPaths']=sorted(selected)
w['readRoots']=sorted(set(w['readRoots']) | selected)
cmd=w['testing']['commands'][0]
cmd['args']=cmd['args'][:2]+inputs['sourceCorrespondencePaths']
source_paths=[s['path'] for s in w['sources']]+extra_inputs
suff=relocate(read(oldI/'INPUT_SUFFICIENCY.json'))
suff['futureFiles']=future
suff['continuation']='Preserves the 24 held changes; adds exact residual review and compact custody, not expanded failed Result/source archive. Full original outcome remains.'
suff['groups']['method-and-current-control']['note']='Historical group tally retained; current total is recomputed in packet receipt.'
write(I/'INPUT_SUFFICIENCY.json',suff)
w['sources']=[{'path':p,'digest':'sha256:'+sha((S/p).read_bytes())} for p in source_paths]
w['assessment']['sources']=[p for p in source_paths if p!=w['assessment']['rubricPath']]
assert not (set(source_paths)&set(grant['productWritePaths']))
assert w['assessment']['rubricPath'] not in w['assessment']['sources']
for p in selected:
    assert (S/p).is_file() if p not in future else not (S/p).exists(), p
write(A/'workload.json',w)
write(A/'PACKET_PREPARATION_COMPLETE.json',{
    'status':'READY_FOR_INSTALLED_PREFLIGHT','recordedUtc':datetime.now(timezone.utc).isoformat(),
    'sourcePreimage':pin(A/'SOURCE_BEFORE.json'),'selectedFiles':len(selected),
    'existingSelectedBytes':sum((S/p).stat().st_size for p in selected if p not in future),
    'futureFiles':future,'sourcePins':len(w['sources']),'commands':len(w['testing']['commands']),
    'lanes':[r['id'] for r in inputs['lanes']], 'productWritePaths':len(grant['productWritePaths']),
    'workload':pin(A/'workload.json'),'nativeDispatched':False,'providerCalls':0,
    'previousActualClose':pin(X/'native-01/execution/after-run-resume.json'),
})

# Current carriers are mutable projections; preserve each preimage before update.
stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
pre=X/'coordination-preimages'/stamp; pre.mkdir(parents=True)
paths=[X/'STATUS.json',M/'specification/GOALS.md',M/'.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md']
records=[]
for p in paths:
    b=p.read_bytes(); saved=pre/p.name; saved.write_bytes(b); records.append({'path':str(p),'before':pin(saved)})
status=read(X/'STATUS.json')
status.update(recordedUtc=datetime.now(timezone.utc).isoformat(),status='RESIDUAL_CONTINUATION_PREPARING',execSession=None,
    next='Installed-owner preflight of native-02 from actual failed-run close; Root admits exact manifest then one native repair/finish task.',
    activePreparation='native-02',currentRootSelection='ROOT_REENTRY_SELECTION_02.md')
status['independentReview'].update(status='complete',verdict='complete migration falsified; reviewed migrations retained',record='native-01/INDEPENDENT_SOURCE_REVIEW.json',findings=['SAS-01','SAS-02','SAS-03'])
status['continuity']['resumeOrder']=['STATUS.json','ROOT_REENTRY_SELECTION_02.md','CONTEXT_AND_CAUSAL_MAP.md','native-01/INDEPENDENT_SOURCE_REVIEW.json','native-02/PACKET_PREPARATION_COMPLETE.json','native-01/execution/TIMING_OBSERVATION.json']
status['continuity']['beforeDispatch']='Match held source hashes, actual previous close, original criteria and all unresolved findings; no scope reset.'
status['acceptance']['R1']='Retained owned-prefix evidence; SAS-01 actual invocation/continuation migration and measurement open.'
status['acceptance']['R2']='Both assembly consumers migrated; SAS-02 redundant adapter retirement and actual delivery open.'
status['acceptance']['R3']='Reviewed migrated relation retained; SAS-01 missing traversal/continuation callers open.'
status['acceptance']['R7']='SDK lifetime author proof retained; SAS-03 maintained harness, cold/fresh and actual C2/UAT open.'
(X/'STATUS.json').write_text(json.dumps(status,indent=2)+'\n')
replacement='Current stage **RESIDUAL_CONTINUATION_PREPARING**: independent max review verified the held 24-file source but rejected complete migration for remaining traversal/continuation callers, one obsolete adapter and the maintained setup harness (SAS-01/02/03). Root selected their bounded completion in [native-02](../.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/native-02/PACKET_PREPARATION_COMPLETE.json), preserving all reviewed work, the original R1-R7 outcome and the 256-turn failure. Actual C2/UAT and acceptance remain open. '
p=M/'specification/GOALS.md';text=p.read_text();start=text.index('Current stage **FAILED_NATIVE_SOURCE_HELD_REVIEW_ACTIVE**');end=text.index('[Current status]',start);p.write_text(text[:start]+replacement+text[end:])
p=M/'.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md';text=p.read_text()
oldstage='FAILED_NATIVE_SOURCE_HELD_REVIEW_ACTIVE'
assert oldstage in text
text=text.replace(oldstage,'RESIDUAL_CONTINUATION_PREPARING',1)
anchor='\n\n'; first=text.index(anchor)
notice='\n\nRoot continuation, '+now+': Independent max review is complete: SAS-01/02/03 reject whole-path closure while preserving the 24-file held implementation. [Selection 02](../../work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/ROOT_REENTRY_SELECTION_02.md) selects only residual callers, obsolete-adapter retirement and harness/proof reconciliation. [Native-02 preparation](../../work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/native-02/PACKET_PREPARATION_COMPLETE.json) preserves all R1-R7 obligations and the actual failed-run close. No new native dispatch yet; actual C2/UAT are pending. Older stage statements below retain their dated scope.'
text=text[:first]+notice+text[first:];p.write_text(text)
for r,p in zip(records,paths):r['after']=pin(p)
write(X/('COORDINATION_UPDATE_'+stamp+'.json'),{'role':'operator/evidence Writer','authority':str(A/'ROOT_WRITER_ACTIVATION.json'),'updates':records})
print(json.dumps({'status':'PREPARATION_READY','activation':str(A),'selectedFiles':len(selected),'productWritePaths':len(grant['productWritePaths']),'sourcePins':len(w['sources']),'sourceChangedByRoot':False}))
