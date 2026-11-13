"""Root operator/evidence Writer. Run only after the exact native-02 close/freeze."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, shutil, subprocess

X=Path(__file__).resolve().parent
S=Path('/Users/jim/src/apps/abiogenesis-single-address-space')
A=X/'native-03'; I=S/'consolidation-inputs/native-03'; oldA=X/'native-02'; oldI=S/'consolidation-inputs/native-02'
T='build_tenants/abiogenesis/typescript'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda p:json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:f.write(v if isinstance(v,str) else json.dumps(v,indent=2)+'\n')
def relocate(v):
 if isinstance(v,str):return v.replace('consolidation-inputs/native-02','consolidation-inputs/native-03').replace('consolidation-scratch/native-02','consolidation-scratch/native-03').replace('single-address-space/native-02','single-address-space/native-03')
 if isinstance(v,list):return [relocate(x) for x in v]
 if isinstance(v,dict):return {k:relocate(x) for k,x in v.items()}
 return v

assert not A.exists() and not I.exists() and not (S/'tmp03').exists(),'No overwrite or implicit retry'
subjectPath=oldA/'review-subject-001/SUBJECT.json'; subject=read(subjectPath)
close=oldA/'execution/after-run-resume.json'; retained=read(close)
assert (oldA/'execution/outcome-summary.json').is_file(),'Actual prior outcome must exist'
assert subject['sourceCommit']=='f49e7533ebedff0946383cb0c5380a6ecac7889d'
assert subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD'],text=True).strip()==subject['sourceCommit']
assert not subprocess.check_output(['git','-C',str(S),'diff','--cached','--name-only'],text=True).strip()
for f in subject['files']:
 b=(S/f['path']).read_bytes();assert sha(b)==f['sha256'] and len(b)==f['bytes'],f['path']
assert set(subprocess.check_output(['git','-C',str(S),'diff','--name-only'],text=True).splitlines())==set(subject['trackedChangedPaths'])
for n in ['return.json','readiness.json','progress.json']:
 assert (subjectPath.parent/n).read_bytes()==(S/'consolidation-scratch/native-02'/n).read_bytes(),n

now=datetime.now(timezone.utc).isoformat();A.mkdir();I.mkdir(parents=True)
(S/'consolidation-scratch/native-03/tmp').mkdir(parents=True)
(S/'tmp03').mkdir()
write(A/'ROOT_WRITER_ACTIVATION.json',{'recordedUtc':now,'roleTransition':'Executive remaining-caller selection -> operator/evidence Writer','authority':str(X/'ROOT_REENTRY_SELECTION_03.md'),'effects':['Prepare continuation controls and compact exact held evidence','Prepare C2 inputs/recipes and scratch territory','Preserve/update coordination projections','Observe and freeze returned evidence'],'exclusions':['No Product/test repairs by Root','No prior input/log/release mutation','No push, merge, tag, selector, new release or stable claim'],'nativeDispatch':'Only after exact installed-owner preparation and Root admission; one coding Worker'})
grant=read(oldA/'NATIVE_GRANT.json')
extra=[
 'code/src/abg/artifact_truth.ts','code/src/abg/effectful_invocation_truth.ts',
 'code/src/abg/fh_continuation_projection.ts','code/src/abg/replay.ts','code/src/abg/calculus/liveness.ts',
 'code/src/abg/invocation_admission.ts','code/src/abg/invocation_execution_truth.ts','code/src/abg/project_read_ports.ts','code/src/abg/qualification_proof.ts',
 'code/src/owner_bindings/run_invocation.ts','code/src/hog/operator_support.ts',
 'code/src/product/materialization_definition_bindings.ts','code/src/product/release_snapshot_definition_bindings.ts','code/src/product/project_read_ports.ts',
 'code/src/abg/retry.ts','code/src/abg/runtime_failure.ts','code/src/abg/deferred_application.ts',
 'code/src/abg/worksite_command_forward.ts','code/src/abg/worksite_construction_recovery.ts',
 'code/src/abg/witness_definition_bindings.ts','code/src/abg/witness_admission_operation.ts',
 'code/src/abg/requirement_handoff.ts','code/src/abg/semantic_revision.ts',
 'code/src/implementation/leaf_invocation_port.ts','code/src/implementation/worksite_file_replace.ts',
 'code/src/product/result_definition_bindings.ts','code/src/product/declaration_application.ts',
 'code/src/product/result_assessment_operation.ts','code/src/validator/self_conformance_basis.ts',
 'test_env/tests/t287-exact-prefix-projection-reuse.test.mjs','test_env/support/t287-exact-prefix-projection-reuse.mjs',
 'test_env/tests/t287-ordered-reconstruction.test.mjs','test_env/tests/t287-st2a-e-exact-prefix-workspace-environment.test.mjs',
 'test_env/tests/t287-environment-projection-conservation.test.mjs','test_env/tests/t287-qualification-producer-acquisition-reuse.test.mjs',
 'test_env/tests/t287-w2-05-release-snapshot-definition-bindings.test.mjs','test_env/tests/r5-invocation-admission.test.mjs',
 'test_env/tests/t287-reconstruction-conservation.test.mjs','test_env/tests/t287-retry-run-prefix.test.mjs',
 'test_env/tests/m5-retry-lifecycle-authority.test.mjs','test_env/tests/t287-cross-cut-public-read.test.mjs',
 'test_env/tests/t287-runtime-failure-diagnostic.test.mjs','test_env/tests/witness-reprice-definition-binding.test.mjs',
 'test_env/tests/witness-run-stopped-definition-binding.test.mjs','test_env/tests/t287-d1-requirement-handoff.test.mjs',
]
grant.update(status='ROOT_SELECTED_CONTINUATION_PREPARATION',taskId='T287_SINGLE_ADDRESS_SPACE_NATIVE_03')
grant['productWritePaths']=list(dict.fromkeys(grant['productWritePaths']+[T+'/'+p for p in extra]))
grant['scratchWriteRoots']=['consolidation-scratch/native-03/'+p for p in ['return.json','readiness.json','progress.json','tmp']]+['tmp03']
grant['sourceStanding']='Unchanged installed RC5 baseline plus exact held native-02 subject. Preserve all held changes; no successor source acceptance or implementation restart.'
grant['continuation']={'heldSubject':pin(subjectPath),'afterObservationDigest':subject['afterObservationDigest'],'priorActualClose':pin(close),'rootSelection':pin(X/'ROOT_REENTRY_SELECTION_03.md'),'remainingOwnerClassification':pin(oldA/'REMAINING_OWNER_CLASSIFICATION.md'),'selectedResiduals':['artifact/environment acquisition callers','invocation/F_H global fact selection and scoped retry','ordinary Run completion/read and obsolete adapter retirement','same-input complete-path accumulated work and actual C2/UAT/fresh proof'],'unchangedCoverage':'Original R1-R7 and C1-C5; preserve and reuse prior applicable independent review and valid feedback'}
grant['independentReview']='Read-only max review of exact frozen changed claims alongside actual C2; reuse prior review on unchanged source. Root alone conjoins original outcome.'
write(A/'NATIVE_GRANT.json',grant);write(I/'NATIVE_GRANT.json',grant)
write(A/'SOURCE_BEFORE.json',{'kind':'held_source_continuation_before_snapshot','recordedUtc':now,'baselineCommit':grant['sourceCommit'],'heldSubject':pin(subjectPath),'files':[dict(pin(S/p),relativePath=p) for p in grant['productWritePaths']],'preservedChangedPaths':subject['changedPaths'],'accepted':False})
for name in ['CONTEXT_AND_CAUSAL_MAP.md','ROOT_TRIAGE_AND_SELECTION.md','ROOT_REENTRY_SELECTION_02.md','ROOT_REENTRY_SELECTION_03.md']:
 shutil.copyfile(X/name,I/name)
for name in ['PERFORMANCE_DETAIL.md','PERFORMANCE_DETAIL.json','MEASURED_BASELINE.json','EXTERNAL_READ_RESOURCES.json','rubric.json','INDEPENDENT_SOURCE_REVIEW.json']:
 shutil.copyfile(oldI/name,I/name)
shutil.copyfile(oldA/'REMAINING_OWNER_CLASSIFICATION.md',I/'REMAINING_OWNER_CLASSIFICATION.md')
for name in ['CENSUS_FOLLOWUP_CLASSIFICATION.md','INDEPENDENT_SOURCE_RECHECK.json','ACTUAL_C2_INPUT_TRIAGE.json']:
 shutil.copyfile(oldA/name,I/name)
shutil.copyfile(subjectPath.parent/'return.json',I/'PREVIOUS_NATIVE_RETURN.json')
shutil.copytree(oldI/'contract-seeds',I/'contract-seeds')
held={k:subject[k] for k in ['status','sourceRoot','sourceCommit','reviewBaseCommit','nativeResultRef','eventOrdinal','afterObservationRef','afterObservationDigest','changedPaths','incrementChangedPaths','authorFeedback','diff']}
held['subject']=pin(subjectPath);held['files']=[{k:f[k] for k in ['path','bytes','sha256','changed']} for f in subject['files']]
held['handoffArtifacts']=[pin(subjectPath.parent/n) for n in ['return.json','readiness.json','progress.json']]
held['actualOutcome']=pin(oldA/'execution/outcome-summary.json')
held['standing']='Held source and actual returned evidence, not whole-path acceptance. The remaining23-pass observation and its counterexamples stay open under selection03. Full bodies remain at exact custody paths.'
write(I/'HELD_SOURCE_AND_EVIDENCE.json',held)

task='''# Complete the remaining ordinary owner queries

Read TASK, NATIVE_GRANT, ROOT_REENTRY_SELECTION_03, REMAINING_OWNER_CLASSIFICATION,
CENSUS_FOLLOWUP_CLASSIFICATION, INDEPENDENT_SOURCE_RECHECK, ACTUAL_C2_INPUT_TRIAGE,
PREVIOUS_NATIVE_RETURN, HELD_SOURCE_AND_EVIDENCE and the original
CONTEXT_AND_CAUSAL_MAP. Apply exact installed STDO3.0.4 stdo-work. Current source
already contains held native-01/02 changes. HEAD f49 is only the unchanged RC5
baseline. Continue the current candidate; do not restart completed migrations.

The owner's original whole-path outcome, R1-R7 and C1-C5 remain unchanged.
Native-02 repaired named traversal/continuation callers, retired a redundant
reacquisition adapter and reconciled maintained setup. Its wider meter found
roughly23 body visits per unrelated history event in remaining owners. The
dominant measured trigger is frame liveness querying related:null despite no
CCall. Preserve prefix authenticity/generation checks and the exact absent
object (including omission of resultRejectionRef), then avoid that useless
bucket-body query. Its green
accounting test does not close that cost. Preserve the counterexample and the
same-input held comparison; do not lower a predicate or relabel a residual.

Selection03 and the independent frozen diagnostic bind the full causal cone:
artifact/environment acquisition including direct materialization/release/read/
qualification-source callers; effectful invocation/F_H global facts and retry
queries; ordinary selected-Run completion/read projection and adapter retirement.
Existing library owners already supply the same derivation, authenticated owned
prefixes, scoped envelopes/indexes, exact body access and physical-prefix support.
Use them and migrate every equivalent consumer in this cone. The completed
follow-up includes ordinary authority/effect/witness/receipt paths and their
private array-carrier consumers. The grant includes that full finite census;
it is not limited to the first five-owner map. No additional owned artifact
function is needed: projectOwnedPrefixArtifactTruth already exists. Do not redeclare
owner interface shapes or create another cache/store/authority/helper framework.

Important diagnostic corrections: RuntimeEventBodyView itself is lazy, and
selectValidatedRuntimeEventPrefix recognizes its authentic owner without
expansion. The filter/map/find/slice consumers are the cost. Retry lookup already
uses basis/related indexes but materializes bucket bodies before filtering.
Preserve GLOBAL malformed-pair/duplicate checks even for a fresh requested
invocation. Keep complete selected-Run output and canonical full-history digest,
whose owner already maintains incremental checkpoints. Preserve real prepared
F_H and failure-output complete-prefix contracts, copied/raw/cold authentication,
explicit currentness, rollback, pre-effect scope checks and post-effect evidence.

The write grant includes the complete diagnosed central/direct consumer cone,
held source territory and affected tests/HOW. Canonical event_prefix,
runtime_history, event_store, codec and instruction owners remain read-only.
A concrete missing relation or out-of-territory repair returns to Root with
cause and proof; it never disappears from the original outcome. Delete adapters
and exports only after their full consumer migration. Tests alone are not a
supported production retention reason.

Extend the EXISTING installed proof through setup -> invocation -> traversal/
continuation -> terminal read. Compare declared equal inputs/cuts and equal
outcomes/refusal refs with the held baseline; separate unrelated-history growth
from previous invocation growth. Measure accumulated work/bytes and supported
remaining obligations, not only a local helper. Do not relocate cost to setup or
closing. Avoid asserting arbitrary wall-speed thresholds. Include a malformed
pair/duplicate outside the requested invocation, orphan/mixed-arm F_H/construction,
selected-Run replay and missing-versus-out-of-scope behavior. Reuse existing
cold/currentness/rollback proof and actual setup/materialization/release harnesses.
Only add missing discriminators. No whole qualification rerun.

Normal author feedback writes consolidation-scratch/native-03/tmp and the
declared short tmp03 root. Keep TMPDIR at the short worksite tmp03 path for
Unix-socket tests; the long nested feedback path previously exceeded host socket
limits. Copy
necessary exact selected inputs, fixtures, contract seeds and read-only offline
dependencies there. No canonical build/contracts/manifest/package writes;
actual C2 owns those in its sandbox. Reuse applicable prior feedback, run only
changed-claim discriminators, and let actual C2 execute the full declared affected
recipe. Do not spend the actor window repeating a complete C2 dress rehearsal
after all its component lanes have already passed. Preserve failures and
distinguish author feedback from actual C2.

This actor has1024 turns and a90-minute absolute limit. Record actual UTC progress
after milestones and reserve the final10 minutes for return/readiness. At
compaction reread progress, this task, selection03, the original map and rubric.
Write return.json/readiness.json with exact changed hashes, complete caller/
deletion/retention census, every R1-R7 disposition, actual checks and explicit
residuals before returning. Truthful partial evidence is not readiness. Stop
editing at return; Root owns the decision. No provider/subagent spawning,
git commit, historical evidence mutation, new cut, global selector or publication.
'''
write(A/'task.md',task);write(I/'TASK.md',task)
profile=read(oldA/'PROVIDER_PROFILE.json');profile['provider']['command']=str(A/'claude-provider.sh');profile['providerScratch']=str(S/'tmp03')
profile['continuationStanding']='Distinct Root-selected remaining-owner activation from actual native-02 close; one coding Worker; no automatic retry'
write(A/'PROVIDER_PROFILE.json',profile)
write(A/'claude-provider.sh',(oldA/'claude-provider.sh').read_text().replace('consolidation-scratch/native-02/tmp','tmp03'));(A/'claude-provider.sh').chmod(0o755)
for n in ['dispatch.mjs','selector-size-preflight.mjs']:shutil.copyfile(oldA/n,A/n)
prepare=(oldA/'prepare.mjs').read_text().replace("native-01/execution/after-run-resume.json","native-02/execution/after-run-resume.json").replace("runId:'single-address-space-native-02'","runId:'single-address-space-native-03'")
write(A/'prepare.mjs',prepare)
freeze=(oldA/'freeze-source-r1.mjs').read_text().replace('consolidation-scratch/native-02','consolidation-scratch/native-03')
write(A/'freeze-source.mjs',freeze)
observe=(oldA/'observe-progress.py').read_text().replace("native-01/execution/outcome-summary.json","native-02/execution/outcome-summary.json").replace("'activation':'native-02'","'activation':'native-03'").replace('consolidation-scratch/native-02','consolidation-scratch/native-03')
write(A/'observe-progress.py',observe)
future=['consolidation-scratch/native-03/'+n for n in ['return.json','readiness.json','progress.json']]
inputs=relocate(read(oldI/'C2_INPUTS.json'));inputs['sourceStanding']='Held native-02 plus exact native-03 after-observation; HEAD is baseline only'
inputs['heldSourceSubjectSha256']=sha(subjectPath.read_bytes());inputs['sourceCorrespondencePaths']=grant['productWritePaths']+future;inputs['futureNativeFiles']=future
additional_tests=['t287-exact-prefix-projection-reuse.test.mjs','t287-ordered-reconstruction.test.mjs','t287-st2a-e-exact-prefix-workspace-environment.test.mjs','t287-w2-05-release-snapshot-definition-bindings.test.mjs','r5-invocation-admission.test.mjs','m5-retry-lifecycle-authority.test.mjs','t287-cross-cut-public-read.test.mjs']
inputs['lanes'][0]['files']=list(dict.fromkeys(inputs['lanes'][0]['files']+['test_env/tests/'+n for n in additional_tests]))
inputs['lanes'][0]['files']+=['test_env/tests/'+n for n in ['t287-runtime-failure-diagnostic.test.mjs','witness-reprice-definition-binding.test.mjs','witness-run-stopped-definition-binding.test.mjs']]
inputs['lanes'][0]['timeoutMs']=1500000
inputs['lanes'][0]['minimumPasses']=48
write(I/'C2_INPUTS.json',inputs);write(A/'EXPECTED_FUTURE_FILES.json',future)
c2=(oldA/'c2-proof.mjs').read_text().replace('consolidation-inputs/native-02','consolidation-inputs/native-03')
write(A/'c2-proof.mjs',c2);write(I/'c2-proof.mjs',c2)
w=relocate(read(oldA/'workload.json'));w['task']='Complete the remaining ordinary artifact/environment, invocation/F_H and Run-read caller relation using existing owners; preserve held source and all R1-R7, retire duplicate carriage, prove complete-path accumulated work and exact behavior.'
w['authorityRefs'].append((X/'ROOT_REENTRY_SELECTION_03.md').as_uri())
readfirst=['consolidation-inputs/native-03/'+n for n in ['TASK.md','NATIVE_GRANT.json','ROOT_REENTRY_SELECTION_03.md','REMAINING_OWNER_CLASSIFICATION.md','CENSUS_FOLLOWUP_CLASSIFICATION.md','INDEPENDENT_SOURCE_RECHECK.json','ACTUAL_C2_INPUT_TRIAGE.json','PREVIOUS_NATIVE_RETURN.json','HELD_SOURCE_AND_EVIDENCE.json','CONTEXT_AND_CAUSAL_MAP.md']]
for role,order in w['workOrders'].items():
 order['readFirst']=readfirst;order['outcome']=w['task']
 if role=='construction':order['instructions']=[task];order['writeRoots']=grant['productWritePaths']+grant['scratchWriteRoots']
 else:order['instructions']=['Consume selection03, the completed remaining-owner classification, held source/return, original whole map and rubric. Only construction writes source. Use named proof and source coordinates; no broad historical search. Distinguish same-input measured complete-path improvement from local green and diagnostic accounting. Require full caller migration and supported genuine output/boundary exceptions. Preserve every R1-R7 row, all failures and actual C2 provenance; no local-only closure.']
newinputs=['consolidation-inputs/native-03/'+n for n in ['ROOT_REENTRY_SELECTION_03.md','REMAINING_OWNER_CLASSIFICATION.md','CENSUS_FOLLOWUP_CLASSIFICATION.md','INDEPENDENT_SOURCE_RECHECK.json','ACTUAL_C2_INPUT_TRIAGE.json','PREVIOUS_NATIVE_RETURN.json']]
selected=set(w['testing']['selectedPaths'])|set(grant['productWritePaths'])|set(newinputs)|set(future)
write(A/'C2_LITERAL_IMPORT_SEEDS.json',sorted(selected))
closure_run=subprocess.run(['node',str(X/'check-c2-literal-imports.mjs'),str(S),str(A/'C2_LITERAL_IMPORT_SEEDS.json')],capture_output=True,text=True)
assert closure_run.stdout,closure_run.stderr
closure=json.loads(closure_run.stdout);write(A/'C2_LITERAL_IMPORT_CLOSURE.json',closure)
assert closure_run.returncode==0 and not closure['missing'],json.dumps(closure['missing'])
selected.update(row['path'] for row in closure['added'])
w['testing']['selectedPaths']=sorted(selected);w['readRoots']=sorted(set(w['readRoots'])|selected)
w['testing']['commands'][0]['args']=w['testing']['commands'][0]['args'][:2]+inputs['sourceCorrespondencePaths']
w['testing']['commands'][0]['timeoutMs']=30000
w['testing']['commands'][4]['timeoutMs']=120000
w['testing']['commands'][-1]['timeoutMs']=3600000
suff=relocate(read(oldI/'INPUT_SUFFICIENCY.json'));suff['futureFiles']=future;suff['continuation']='Exact native-02 held source and compact after-observation/handoff plus finite remaining-owner map; no expanded prior Result or archive. Original full outcome retained.'
suff['literalModuleClosure']={'record':pin(A/'C2_LITERAL_IMPORT_CLOSURE.json'),'addedPaths':[row['path'] for row in closure['added']],'scope':'Literal module imports through the installed TypeScript parser; generated imports have declared C2 producers. Dynamic fixture sufficiency remains explicit and actual C2 must pass.'}
write(I/'INPUT_SUFFICIENCY.json',suff)
source_paths=[s['path'] for s in w['sources']]+newinputs
w['sources']=[{'path':p,'digest':'sha256:'+sha((S/p).read_bytes())} for p in source_paths]
w['assessment']['sources']=[p for p in source_paths if p!=w['assessment']['rubricPath']]
assert not (set(source_paths)&set(grant['productWritePaths']))
assert w['assessment']['rubricPath'] not in w['assessment']['sources']
for p in selected:assert (S/p).is_file() if p not in future else not (S/p).exists(),p
write(A/'workload.json',w)
write(A/'PACKET_PREPARATION_COMPLETE.json',{'status':'READY_FOR_INSTALLED_PREFLIGHT','recordedUtc':datetime.now(timezone.utc).isoformat(),'sourcePreimage':pin(A/'SOURCE_BEFORE.json'),'selectedFiles':len(selected),'existingSelectedBytes':sum((S/p).stat().st_size for p in selected if p not in future),'futureFiles':future,'sourcePins':len(w['sources']),'commands':len(w['testing']['commands']),'lanes':[r['id'] for r in inputs['lanes']],'productWritePaths':len(grant['productWritePaths']),'workload':pin(A/'workload.json'),'nativeDispatched':False,'providerCalls':0,'previousActualClose':pin(close)})
print(json.dumps({'status':'PREPARATION_READY','activation':str(A),'selectedFiles':len(selected),'productWritePaths':len(grant['productWritePaths']),'sourcePins':len(w['sources']),'sourceChangedByRoot':False}))
