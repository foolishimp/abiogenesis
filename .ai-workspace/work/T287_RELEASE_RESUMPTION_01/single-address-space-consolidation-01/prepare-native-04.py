"""Operator preparation only; requires the genuine native03 close and Root conjunction."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, shutil, subprocess

X = Path(__file__).resolve().parent
S = Path('/Users/jim/src/apps/abiogenesis-single-address-space')
oldA, A = X/'native-03', X/'native-04'
oldI, I = S/'consolidation-inputs/native-03', S/'consolidation-inputs/native-04'
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda p: json.loads(p.read_text())
def pin(p):
    b = p.read_bytes()
    return {'path':str(p), 'bytes':len(b), 'sha256':sha(b)}
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        f.write(value if isinstance(value, str) else json.dumps(value, indent=2)+'\n')
def relocate(value):
    if isinstance(value, str):
        return value.replace('consolidation-inputs/native-03', 'consolidation-inputs/native-04').replace('consolidation-scratch/native-03', 'consolidation-scratch/native-04').replace('command://abiogenesis/single-address-space/native-03/', 'command://abiogenesis/single-address-space/native-04/')
    if isinstance(value, list): return [relocate(v) for v in value]
    if isinstance(value, dict): return {k:relocate(v) for k,v in value.items()}
    return value

assert not A.exists() and not I.exists() and not (S/'tmp04').exists(), 'No overwrite or implicit retry'
conjunction = read(oldA/'ROOT_CONJUNCTION.json')
assert conjunction['nextContinuationSelected'] is True
subjectPath = oldA/'review-subject-001/SUBJECT.json'
subject = read(subjectPath)
assert sha(subjectPath.read_bytes()) == conjunction['subjectSha256']
close = oldA/'execution/after-run-resume.json'
read(close)
assert (oldA/'execution/outcome-summary.json').is_file()
assert subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD'], text=True).strip() == subject['sourceCommit']
assert not subprocess.check_output(['git','-C',str(S),'diff','--cached','--name-only'], text=True).strip()
for f in subject['files']:
    b = (S/f['path']).read_bytes()
    assert sha(b) == f['sha256'] and len(b) == f['bytes'], f['path']
assert set(subprocess.check_output(['git','-C',str(S),'diff','--name-only'], text=True).splitlines()) == set(subject['trackedChangedPaths'])
for name in ['return.json','readiness.json','progress.json']:
    assert (subjectPath.parent/name).read_bytes() == (S/'consolidation-scratch/native-03'/name).read_bytes()

now = datetime.now(timezone.utc).isoformat()
A.mkdir(); I.mkdir(parents=True)
(S/'consolidation-scratch/native-04/tmp').mkdir(parents=True)
(S/'tmp04').mkdir()
write(A/'ROOT_WRITER_ACTIVATION.json', {
    'recordedUtc':now, 'roleTransition':'Executive completion selection -> operator/evidence Writer',
    'authority':str(X/'ROOT_REENTRY_SELECTION_04.md'),
    'effects':['Prepare continuation controls and exact held evidence','Prepare bounded C2 inputs and scratch guidance','Preserve/update coordination projections','Observe/freeze returned evidence'],
    'exclusions':['No Root Product/test repair','No prior input/log/release mutation','No push, merge, tag, selector, new cut or stable claim'],
    'nativeDispatch':'Only after exact installed-owner preflight and Root admission; one coding Worker'})
grant = read(oldA/'NATIVE_GRANT.json')
grant.update(status='ROOT_SELECTED_CONTINUATION_PREPARATION', taskId='T287_SINGLE_ADDRESS_SPACE_NATIVE_04')
grant['productWritePaths'] = list(dict.fromkeys(grant['productWritePaths'] + conjunction['additionalProductWritePaths']))
assert all((S/p).is_file() for p in grant['productWritePaths'])
grant['scratchWriteRoots'] = ['consolidation-scratch/native-04/'+n for n in ['return.json','readiness.json','progress.json','tmp']] + ['tmp04']
grant['sourceStanding'] = 'Installed immutable RC5 baseline plus exact held native03 successor; preserve all held work and failures. Original complete outcome remains open.'
grant['continuation'] = {'heldSubject':pin(subjectPath), 'afterObservationDigest':subject['afterObservationDigest'],
    'priorActualClose':pin(close), 'rootSelection':pin(X/'ROOT_REENTRY_SELECTION_04.md'),
    'rootConjunction':pin(oldA/'ROOT_CONJUNCTION.json'),
    'selectedResiduals':conjunction['selectedResiduals'],
    'unchangedCoverage':'Original R1-R7 and C1-C5; reuse applicable independent judgments and evidence'}
write(A/'NATIVE_GRANT.json', grant); write(I/'NATIVE_GRANT.json', grant)
write(A/'SOURCE_BEFORE.json', {'kind':'held_source_continuation_before_snapshot','recordedUtc':now,
    'baselineCommit':grant['sourceCommit'],'heldSubject':pin(subjectPath),
    'files':[dict(pin(S/p),relativePath=p) for p in grant['productWritePaths']],
    'preservedChangedPaths':subject['changedPaths'],'accepted':False})

# Historical authority/evidence keeps its original bytes and standing.
for name in ['CONTEXT_AND_CAUSAL_MAP.md','ROOT_TRIAGE_AND_SELECTION.md','ROOT_REENTRY_SELECTION_02.md','ROOT_REENTRY_SELECTION_03.md','ROOT_REENTRY_SELECTION_04.md']:
    shutil.copyfile(X/name, I/name)
for name in ['PERFORMANCE_DETAIL.md','PERFORMANCE_DETAIL.json','MEASURED_BASELINE.json','EXTERNAL_READ_RESOURCES.json','rubric.json','INDEPENDENT_SOURCE_REVIEW.json','REMAINING_OWNER_CLASSIFICATION.md','CENSUS_FOLLOWUP_CLASSIFICATION.md','ACTUAL_C2_INPUT_TRIAGE.json']:
    shutil.copyfile(oldI/name, I/name)
shutil.copyfile(oldI/'INDEPENDENT_SOURCE_RECHECK.json', I/'PRIOR_BOUNDED_SOURCE_RECHECK.json')
shutil.copyfile(oldA/'INDEPENDENT_SOURCE_RECHECK.json', I/'INDEPENDENT_SOURCE_RECHECK.json')
shutil.copyfile(oldA/'INDEPENDENT_WITNESS_TRIAGE.md', I/'INDEPENDENT_WITNESS_TRIAGE.md')
shutil.copyfile(oldA/'ACTUAL_C2_OUTPUT_TRIAGE.json', I/'ACTUAL_C2_OUTPUT_TRIAGE.json')
shutil.copyfile(oldA/'ROOT_CONJUNCTION.json', I/'PRIOR_ACTIVATION_CONJUNCTION.json')
shutil.copyfile(subjectPath.parent/'return.json', I/'PREVIOUS_NATIVE_RETURN.json')
shutil.copytree(oldI/'contract-seeds', I/'contract-seeds')
held = {k:subject[k] for k in ['status','sourceRoot','sourceCommit','reviewBaseCommit','nativeResultRef','eventOrdinal','afterObservationRef','afterObservationDigest','changedPaths','incrementChangedPaths','diff']}
held['subject'] = pin(subjectPath)
held['files'] = [{k:f[k] for k in ['path','bytes','sha256','changed']} for f in subject['files']]
held['handoffArtifacts'] = [pin(subjectPath.parent/n) for n in ['return.json','readiness.json','progress.json']]
held['actualOutcome'] = pin(oldA/'execution/outcome-summary.json')
held['standing'] = 'Exact held source, not whole consolidation acceptance. Original scope, residuals and failures remain selected.'
write(I/'HELD_SOURCE_AND_EVIDENCE.json', held)

task = '''# Complete the original selected consolidation

Read the readFirst inputs and use exact installed STDO3.0.4 stdo-work. HEAD f49
is the immutable RC5 baseline; current source contains held native01/02/03 work.
Continue that source. ROOT_REENTRY_SELECTION_04 and PRIOR_ACTIVATION_CONJUNCTION
select the remaining relation; the original map, R1-R7 and C1-C5 govern closure.
The previous partial return does not defer any selected owner or decide law.

Complete all remaining equivalent callers and retire unconsumed adapters using
the existing library. Preserve real complete-output contracts and cold/effect/
currentness/rollback checks. Follow the complete caller classifications and the
latest independent recheck, not merely a grep of complete-reader spellings.
Attribute the remaining liveness reconstruction and invocation growth with the
existing meter. Separate unrelated rows from prior-invocation work and necessary
global validity checks. Keep declared behavior and invalid-history refusals.

The witness proof triage is closed: exact read equalities forced the obsolete
full sweep. Reconcile these tests under unchanged HOW64/66; do not hardcode a
smaller observed count or remove cold/negative checks. Complete the witness
profile/successor migration and execute the semantic, copied/foreign/stale,
changed-byte, authorized-boundary and close-failure controls. The withdrawn
attempt was not independently accepted. No new owner API or HOW reprice follows.

Use C2_SELECTED_INPUTS.json for exact available selected files and retain their
repository-relative paths in scratch. Copy only necessary selected inputs and
the declared offline dependencies. Never copy historical commentary/archive
directories wholesale. Scratch writes stay in tmp04 or the declared scratch
root; use short tmp04 paths for Unix sockets. Never rebuild a scratch package
while tests are using it; preserve each failed run and its source standing.

Prior final component lanes are already recorded. Author feedback should run
the cheapest sufficient changed-claim falsifiers, then return. Actual C2 owns
the full affected recipe in a fresh sandbox. Do not repeatedly rehearse that
recipe, duplicate unchanged held lanes, or spend the coding window preparing
elaborate handoff machinery while selected source work is unfinished.

The write territory is not a narrower reasoning boundary. Return a concrete
missing owner relation or out-of-grant required repair with evidence; do not
silently retain it as someone else's work. No new store/cache/runtime authority,
Product change, provider/subagent, commit, release, selector or publication.

Record compact actual UTC milestones. At compaction reread progress, this task,
selection04, the original map and rubric. The1024-turn/90-minute limits remain;
reserve the final10 minutes for the three existing handoff files. They must
contain exact source hashes, remaining/migrated/deleted/retained callers, every
R1-R7 disposition, actual proof and residuals. Truthful partial evidence is not
readiness. Stop editing at return; Root alone conjoins acceptance.
'''
write(A/'task.md', task); write(I/'TASK.md', task)
profile = read(oldA/'PROVIDER_PROFILE.json')
profile['provider']['command'] = str(A/'claude-provider.sh')
profile['providerScratch'] = str(S/'tmp04')
profile['continuationStanding'] = 'Distinct Root-selected completion from genuine native03 close; one coding Worker; no automatic retry'
write(A/'PROVIDER_PROFILE.json', profile)
write(A/'claude-provider.sh', (oldA/'claude-provider.sh').read_text().replace('tmp03','tmp04'))
(A/'claude-provider.sh').chmod(0o755)
for name in ['dispatch.mjs','selector-size-preflight.mjs']:
    shutil.copyfile(oldA/name, A/name)
write(A/'prepare.mjs', (oldA/'prepare.mjs').read_text().replace('native-02/execution/after-run-resume.json','native-03/execution/after-run-resume.json').replace("runId:'single-address-space-native-03'", "runId:'single-address-space-native-04'"))
write(A/'freeze-source.mjs', (oldA/'freeze-source.mjs').read_text().replace('consolidation-scratch/native-03','consolidation-scratch/native-04'))
write(A/'observe-progress.py', (oldA/'observe-progress.py').read_text().replace('native-02/execution/outcome-summary.json','native-03/execution/outcome-summary.json').replace("'activation':'native-03'", "'activation':'native-04'").replace('consolidation-scratch/native-03','consolidation-scratch/native-04'))

future = ['consolidation-scratch/native-04/'+n for n in ['return.json','readiness.json','progress.json']]
inputs = relocate(read(oldI/'C2_INPUTS.json'))
inputs['sourceStanding'] = 'Held native03 plus exact native04 after-observation; HEAD is baseline only'
inputs['heldSourceSubjectSha256'] = sha(subjectPath.read_bytes())
inputs['sourceCorrespondencePaths'] = grant['productWritePaths'] + future
inputs['futureNativeFiles'] = future
write(I/'C2_INPUTS.json', inputs); write(A/'EXPECTED_FUTURE_FILES.json', future)
c2 = (oldA/'c2-proof.mjs').read_text().replace('consolidation-inputs/native-03','consolidation-inputs/native-04')
c2 = c2.replace("import {readFile,writeFile} from 'node:fs/promises';", "import {readFile,writeFile,mkdir} from 'node:fs/promises';")
c2 = c2.replace("const results=[];", "const reportRoot=join(tenant,'test_env/test_runs/single-address-space-native-04');\nconst results=[];")
c2 = c2.replace("  await writeFile(join(tenant,'artifacts',lane.id+'.stdout.log')", "  await mkdir(reportRoot,{recursive:true});\n  await writeFile(join(reportRoot,lane.id+'.stdout.log')")
c2 = c2.replace("join(tenant,'artifacts',lane.id+'.stderr.log')", "join(reportRoot,lane.id+'.stderr.log')")
c2 = c2.replace("await writeFile(join(tenant,'artifacts/single-address-space-c2.json')", "await mkdir(reportRoot,{recursive:true});\nawait writeFile(join(reportRoot,'single-address-space-c2.json')")
assert "join(tenant,'artifacts',lane.id" not in c2
assert "await mkdir(reportRoot,{recursive:true});" in c2
write(A/'c2-proof.mjs', c2); write(I/'c2-proof.mjs', c2)
w = relocate(read(oldA/'workload.json'))
w['testing']['allowedWriteTerritories'].append({'pathKind':'subtree','relativePath':'build_tenants/abiogenesis/typescript/test_env/evidence'})
w['task'] = 'Complete the original remaining owned-caller and liveness relation, retire redundant paths, reconcile witness proof under unchanged law, and prove the complete selected outcome without repeating accepted work.'
w['authorityRefs'].append((X/'ROOT_REENTRY_SELECTION_04.md').as_uri())
names = ['TASK.md','NATIVE_GRANT.json','ROOT_REENTRY_SELECTION_04.md','PRIOR_ACTIVATION_CONJUNCTION.json','INDEPENDENT_SOURCE_RECHECK.json','INDEPENDENT_WITNESS_TRIAGE.md','ACTUAL_C2_OUTPUT_TRIAGE.json','REMAINING_OWNER_CLASSIFICATION.md','CENSUS_FOLLOWUP_CLASSIFICATION.md','PREVIOUS_NATIVE_RETURN.json','HELD_SOURCE_AND_EVIDENCE.json','CONTEXT_AND_CAUSAL_MAP.md','C2_SELECTED_INPUTS.json']
readfirst = ['consolidation-inputs/native-04/'+n for n in names]
for role, order in w['workOrders'].items():
    order['readFirst'] = readfirst; order['outcome'] = w['task']
    if role == 'construction':
        order['instructions'] = [task]; order['writeRoots'] = grant['productWritePaths'] + grant['scratchWriteRoots']
    else:
        order['instructions'] = ['Consume selection04, the latest closed conjunction and original full map/rubric. Only construction writes source. Use exact evidence routes. Preserve all R1-R7 obligations and failures. Local green does not close an incomplete caller relation; actual C2 provenance, current source identity and native UAT/fresh closure remain distinct.']
newinputs = ['consolidation-inputs/native-04/'+n for n in ['ROOT_REENTRY_SELECTION_04.md','PRIOR_ACTIVATION_CONJUNCTION.json','INDEPENDENT_WITNESS_TRIAGE.md','ACTUAL_C2_OUTPUT_TRIAGE.json','PRIOR_BOUNDED_SOURCE_RECHECK.json']]
selected = set(w['testing']['selectedPaths']) | set(grant['productWritePaths']) | set(newinputs) | set(future)
write(A/'C2_LITERAL_IMPORT_SEEDS.json', sorted(selected))
check = subprocess.run(['node',str(X/'check-c2-literal-imports.mjs'),str(S),str(A/'C2_LITERAL_IMPORT_SEEDS.json')],capture_output=True,text=True)
assert check.stdout, check.stderr
closure = json.loads(check.stdout); write(A/'C2_LITERAL_IMPORT_CLOSURE.json', closure)
assert check.returncode == 0 and not closure['missing'], json.dumps(closure['missing'])
selected.update(r['path'] for r in closure['added'])
guide = 'consolidation-inputs/native-04/C2_SELECTED_INPUTS.json'
selected.add(guide)
write(I/'C2_SELECTED_INPUTS.json', {'kind':'operator_selected_file_guide','selectedPaths':sorted(selected),'futureFiles':future,'meaning':'Exact operator-selected file set, preserving repository-relative paths; not a new Product resolver or permission grant. Copy only necessary existing files for feedback, not entire parent directories.'})
w['testing']['selectedPaths'] = sorted(selected)
w['readRoots'] = sorted(set(w['readRoots']) | selected | set(readfirst))
w['testing']['commands'][0]['args'] = w['testing']['commands'][0]['args'][:2] + inputs['sourceCorrespondencePaths']
suff = relocate(read(oldI/'INPUT_SUFFICIENCY.json'))
suff['futureFiles'] = future
suff['continuation'] = 'Exact native03 held source and compact closed evidence, original scope plus current recheck and witness triage; exact selected-file guide prevents broad historical copies.'
suff['literalModuleClosure'] = {'record':pin(A/'C2_LITERAL_IMPORT_CLOSURE.json'),'addedPaths':[r['path'] for r in closure['added']],'scope':'Literal imports only; generated imports use declared producers. Dynamic fixtures retain explicit inputs and actual C2 proof.'}
write(I/'INPUT_SUFFICIENCY.json', suff)
source_paths = list(dict.fromkeys([v['path'] for v in w['sources']] + newinputs + [guide]))
w['sources'] = [{'path':p,'digest':'sha256:'+sha((S/p).read_bytes())} for p in source_paths]
w['assessment']['sources'] = [p for p in source_paths if p != w['assessment']['rubricPath']]
assert not (set(source_paths) & set(grant['productWritePaths']))
for p in selected:
    assert (S/p).is_file() if p not in future else not (S/p).exists(), p
write(A/'workload.json', w)
write(A/'PACKET_PREPARATION_COMPLETE.json', {'status':'READY_FOR_INSTALLED_PREFLIGHT','recordedUtc':datetime.now(timezone.utc).isoformat(),
    'sourcePreimage':pin(A/'SOURCE_BEFORE.json'),'selectedFiles':len(selected),'existingSelectedBytes':sum((S/p).stat().st_size for p in selected if p not in future),
    'futureFiles':future,'sourcePins':len(w['sources']),'commands':len(w['testing']['commands']),'productWritePaths':len(grant['productWritePaths']),
    'workload':pin(A/'workload.json'),'nativeDispatched':False,'providerCalls':0,'previousActualClose':pin(close)})
print(json.dumps({'status':'PREPARATION_READY','activation':str(A),'selectedFiles':len(selected),'productWritePaths':len(grant['productWritePaths']),'sourcePins':len(w['sources']),'sourceChangedByRoot':False}))
