"""Operator preparation draft. Requires native05's actual close and Root selection.

No Product/test source edits, admission, provider call, or automatic retry.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil
import subprocess

X = Path(__file__).resolve().parent
S = Path('/Users/jim/src/apps/abiogenesis-single-address-space')
oldA, A = X / 'native-05', X / 'native-06'
oldI, I = S / 'consolidation-inputs/native-05', S / 'consolidation-inputs/native-06'
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda p: json.loads(p.read_text())


def pin(p):
    b = p.read_bytes()
    return {'path': str(p), 'bytes': len(b), 'sha256': sha(b)}


def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream:
        stream.write(value if isinstance(value, str) else json.dumps(value, indent=2) + '\n')


def relocate(value):
    if isinstance(value, str):
        return value.replace('consolidation-inputs/native-05', 'consolidation-inputs/native-06').replace('consolidation-scratch/native-05', 'consolidation-scratch/native-06').replace('command://abiogenesis/single-address-space/native-05/', 'command://abiogenesis/single-address-space/native-06/')
    if isinstance(value, list):
        return [relocate(v) for v in value]
    if isinstance(value, dict):
        return {k: relocate(v) for k, v in value.items()}
    return value


assert not A.exists() and not I.exists() and not (S / 'tmp06').exists()
conjunction = read(oldA / 'ROOT_CONJUNCTION.json')
assert conjunction['nextContinuationSelected'] is True
subjectPath = oldA / 'review-subject-001/SUBJECT.json'
subject = read(subjectPath)
assert sha(subjectPath.read_bytes()) == conjunction['subjectSha256']
close = oldA / 'execution/after-run-resume.json'
read(close)
assert (oldA / 'execution/outcome-summary.json').is_file()
assert (oldA / 'execution/fresh-reads.json').is_file()
assert subprocess.check_output(['git', '-C', str(S), 'rev-parse', 'HEAD'], text=True).strip() == subject['sourceCommit']
assert not subprocess.check_output(['git', '-C', str(S), 'diff', '--cached', '--name-only'], text=True).strip()
for f in subject['files']:
    b = (S / f['path']).read_bytes()
    assert sha(b) == f['sha256'] and len(b) == f['bytes'], f['path']
assert set(subprocess.check_output(['git', '-C', str(S), 'diff', '--name-only'], text=True).splitlines()) == set(subject['trackedChangedPaths'])
for name in ['return.json', 'readiness.json', 'progress.json']:
    assert (subjectPath.parent / name).read_bytes() == (S / 'consolidation-scratch/native-05' / name).read_bytes()

selection = X / 'ROOT_REENTRY_SELECTION_06.md'
assert selection.is_file()
now = datetime.now(timezone.utc).isoformat()
A.mkdir()
I.mkdir(parents=True)
(S / 'consolidation-scratch/native-06/tmp').mkdir(parents=True)
(S / 'tmp06').mkdir()
write(A / 'ROOT_WRITER_ACTIVATION.json', {
    'recordedUtc': now, 'roleTransition': 'Executive selection -> operator/evidence Writer',
    'authority': str(selection),
    'effects': ['Prepare exact continuation controls, inputs and custody', 'Update coordination projections', 'Freeze returned evidence'],
    'exclusions': ['No Product/test repair by Root', 'No prior input/log/release mutation', 'No push/merge/tag/selector/new cut/release claim'],
    'nativeDispatch': 'Only after exact installed-owner preflight and Root admission; one coding Worker'})
grant = read(oldA / 'NATIVE_GRANT.json')
grant.update(status='ROOT_SELECTED_CONTINUATION_PREPARATION', taskId='T287_SINGLE_ADDRESS_SPACE_NATIVE_06')
grant['productWritePaths'] = list(dict.fromkeys(grant['productWritePaths'] + conjunction['additionalProductWritePaths']))
grant['conditionalOwnerEffects'] = conjunction.get('conditionalOwnerEffects', [])
assert all((S / p).is_file() for p in grant['productWritePaths'])
grant['scratchWriteRoots'] = ['consolidation-scratch/native-06/' + n for n in ['return.json', 'readiness.json', 'progress.json', 'tmp']] + ['tmp06']
grant['limits']['absoluteTimeoutMs'] = conjunction['nativeAbsoluteTimeoutMs']
grant['limits']['inactivityTimeoutMs'] = conjunction['nativeInactivityTimeoutMs']
grant['limits']['outerTimeoutMs'] = conjunction['outerTimeoutMs']
grant['limitRationale'] = conjunction['budgetRationale']
grant['sourceStanding'] = 'Immutable RC5 baseline plus exact native05 partial successor; original complete outcome remains open.'
grant['continuation'] = {
    'heldSubject': pin(subjectPath), 'afterObservationDigest': subject['afterObservationDigest'],
    'priorActualClose': pin(close), 'rootSelection': pin(selection),
    'rootConjunction': pin(oldA / 'ROOT_CONJUNCTION.json'),
    'selectedResiduals': conjunction['selectedResiduals'],
    'unchangedCoverage': 'Original R1-R7/C1-C5; retain applicable accepted evidence and failures'}
write(A / 'NATIVE_GRANT.json', grant)
write(I / 'NATIVE_GRANT.json', grant)
write(A / 'SOURCE_BEFORE.json', {
    'kind': 'held_source_continuation_before_snapshot', 'recordedUtc': now,
    'baselineCommit': grant['sourceCommit'], 'heldSubject': pin(subjectPath),
    'files': [dict(pin(S / p), relativePath=p) for p in grant['productWritePaths']],
    'preservedChangedPaths': subject['changedPaths'], 'accepted': False})

# Keep historical evidence available without repeatedly embedding it into prompts.
rewritten = {'TASK.md', 'NATIVE_GRANT.json', 'INPUT_SUFFICIENCY.json', 'C2_INPUTS.json',
             'C2_SELECTED_INPUTS.json', 'c2-proof.mjs', 'HELD_SOURCE_AND_EVIDENCE.json',
             'PRIOR_ACTIVATION_CONJUNCTION.json', 'PRIOR_ACTUAL_C2_SUMMARY.json', 'PREVIOUS_NATIVE_RETURN.json'}
for source in oldI.iterdir():
    if source.name in rewritten:
        continue
    destination = I / source.name
    if source.is_dir():
        shutil.copytree(source, destination)
    else:
        shutil.copyfile(source, destination)
shutil.copyfile(selection, I / selection.name)
latest = ['NATIVE_UAT_CLOSED_RESULT.json', 'NATIVE_C2_CLOSED_RESULT.json',
          'FINAL_SOURCE_REVIEW_CUSTODY.json', 'INDEPENDENT_INTERIM_CODE_REVIEW.md',
          'QUALIFICATION_DOMAIN_REVIEW.md', 'ROOT_N5_CODE01_DISPOSITION.json',
          'INDEPENDENT_INTERIM_PROOF_REVIEW.md', 'INDEPENDENT_F09_PROOF_DELTA_REVIEW.md',
          'INDEPENDENT_FIXTURE_ROUTE_TRIAGE.md', 'REPLAY_LANE_BUDGET_OBSERVATION_001.json']
for name in latest:
    shutil.copyfile(oldA / name, I / name)
shutil.copyfile(oldA / 'ROOT_CONJUNCTION.json', I / 'PRIOR_ACTIVATION_CONJUNCTION.json')
shutil.copyfile(oldA / 'ACTUAL_C2_SUMMARY.json', I / 'PRIOR_ACTUAL_C2_SUMMARY.json')
shutil.copyfile(subjectPath.parent / 'return.json', I / 'PREVIOUS_NATIVE_RETURN.json')
held = {k: subject[k] for k in ['status', 'sourceRoot', 'sourceCommit', 'reviewBaseCommit', 'nativeResultRef', 'eventOrdinal', 'afterObservationRef', 'afterObservationDigest', 'changedPaths', 'incrementChangedPaths', 'diff']}
held.update(subject=pin(subjectPath), files=[{k: f[k] for k in ['path', 'bytes', 'sha256', 'changed']} for f in subject['files']],
            handoffArtifacts=[pin(subjectPath.parent / n) for n in ['return.json', 'readiness.json', 'progress.json']],
            actualOutcome=pin(oldA / 'execution/outcome-summary.json'), standing='Exact partial source and closed evidence; original scope is unchanged.')
write(I / 'HELD_SOURCE_AND_EVIDENCE.json', held)

task = '''# Complete the original consolidation from the exact native05 return

Use installed STDO3.0.4 stdo-work. Read ROOT_REENTRY_SELECTION_06,
PRIOR_ACTIVATION_CONJUNCTION, the original full causal map/rubric, the complete
previous native return and the closed current source/proof/fixture reviews.
HEAD f49 is only the immutable RC5 baseline. Preserve the exact held native05
source and all accepted evidence and failures. This is not a new local goal.

Complete the selected owner relation and meaningful proof: N5-CODE-01 must
delegate qualification current truth/refusals to the existing indexed owners,
without another cache or duplicated phase law. N5-PROOF-01 requires actual
F_H/construction owner refusals, not classifier-key assertions alone. Complete
the selected liveness budget and relevant/unrelated growth discriminators.
Use the already implemented F09 current-contract producers and actual installed
setup/owned-reader library for the stale retry/install fixture premises. Preserve
nested/neighbor-Run, foreign/stale/failed-scope and many-match controls explicitly;
F09 repeated attempts do not automatically prove all of them. Do not rewrite
immutable histories, forge handles, weaken identity to deep equality, or use
another module family for owned values. Keep legitimate cold/full-output work.

The four formerly omitted F09 consumers/helpers and their literal/fixture
dependencies are selected. C2_SELECTED_INPUTS.json is the exact available-file
guide, not an instruction to read or copy whole directories. Historical controls
remain available for context, but current selection and the latest closed
conjunction govern. Keep all R1-R7 and C1-C5 in view at compaction.

Author feedback should run the cheapest sufficient changed-claim falsifiers.
The completed native05 replay batch took about34 minutes; do not repeat unchanged
whole lanes merely to rehearse C2. Actual C2 owns the complete affected execution.
Wait on actual test processes rather than fixed multi-minute polling sleeps.
Preserve failures and exact source identity; do not rebuild a package while tests
are using it. Use only tmp06 and the declared scratch roots. Never create /tmp/ignore
or another undeclared convenience path. No provider/subagent, commit, release,
selector, publication, Product-law change or new runtime/store/service.

Return the three existing handoffs with exact current UTC, source hashes,
complete migrated/deleted/retained caller dispositions, original rubric rows,
actual proof and any concrete remaining gap. Leave10 minutes for return custody.
Do not spend the construction window on elaborate handoff generators while
selected source/proof work remains. Stop editing at return. Root alone conjoins
acceptance; a partial return is not readiness and does not defer selected work.
'''
write(A / 'task.md', task)
write(I / 'TASK.md', task)
profile = read(oldA / 'PROVIDER_PROFILE.json')
profile['provider']['command'] = str(A / 'claude-provider.sh')
profile['providerScratch'] = str(S / 'tmp06')
profile['provider']['absoluteTimeoutMs'] = grant['limits']['absoluteTimeoutMs']
profile['provider']['inactivityTimeoutMs'] = grant['limits']['inactivityTimeoutMs']
for key in ['BASH_DEFAULT_TIMEOUT_MS', 'BASH_MAX_TIMEOUT_MS']:
    profile['runtimeEnvironment'][key] = str(conjunction['helperShellTimeoutMs'])
profile['outerTimeoutMs'] = grant['limits']['outerTimeoutMs']
profile['continuationStanding'] = 'Distinct selected completion from genuine native05 close; one coding Worker; no automatic retry'
write(A / 'PROVIDER_PROFILE.json', profile)
write(A / 'claude-provider.sh', (oldA / 'claude-provider.sh').read_text().replace('tmp05', 'tmp06'))
(A / 'claude-provider.sh').chmod(0o755)
write(A / 'dispatch.mjs', (oldA / 'dispatch-r1.mjs').read_text().replace('workload-r1.json', 'workload.json'))
shutil.copyfile(oldA / 'selector-size-preflight.mjs', A / 'selector-size-preflight.mjs')
prepare = (oldA / 'prepare-r1.mjs').read_text().replace('workload-r1.json', 'workload.json').replace('native-04/execution/after-run-resume.json', 'native-05/execution/after-run-resume.json').replace("runId:'single-address-space-native-05'", "runId:'single-address-space-native-06'")
write(A / 'prepare.mjs', prepare)
write(A / 'freeze-source.mjs', (oldA / 'freeze-source.mjs').read_text().replace('consolidation-scratch/native-05', 'consolidation-scratch/native-06'))
observe = (oldA / 'observe-progress.py').read_text().replace('native-04/execution/outcome-summary.json', 'native-05/execution/outcome-summary.json').replace("'activation':'native-05'", "'activation':'native-06'").replace('consolidation-scratch/native-05', 'consolidation-scratch/native-06')
write(A / 'observe-progress.py', observe)

future = ['consolidation-scratch/native-06/' + n for n in ['return.json', 'readiness.json', 'progress.json']]
inputs = relocate(read(oldI / 'C2_INPUTS.json'))
inputs.update(sourceStanding='Held native05 plus exact native06 after-observation; HEAD is baseline only',
              heldSourceSubjectSha256=sha(subjectPath.read_bytes()),
              sourceCorrespondencePaths=grant['productWritePaths'] + future,
              futureNativeFiles=future, lanes=conjunction['affectedLanes'],
              declaredHistoricalExclusions=conjunction.get('excludedHistoricalBranches', []),
              requiredCurrentUnskippedClaims=conjunction['requiredNoSkips'])
write(I / 'C2_INPUTS.json', inputs)
write(A / 'EXPECTED_FUTURE_FILES.json', future)
# The final conjunction must select the reviewed orchestration/budget, not this draft.
proof_template = X / 'native06-c2-proof-template.mjs'
assert proof_template.is_file(), 'Root must finalize the bounded C2 aggregation contract'
write(A / 'c2-proof.mjs', proof_template.read_text())
write(I / 'c2-proof.mjs', proof_template.read_text())
w = relocate(read(oldA / 'workload-r1.json'))
w['taskRef'] = 'task://abiogenesis/t287/single-address-space/native-06'
w['task'] = 'Complete the original consolidation using existing owners, exact current producer fixtures and meaningful selected refusal/performance proof; retain every original R1-R7/C1-C5 obligation.'
w['authorityRefs'].append(selection.as_uri())
for command in w['testing']['commands']:
    for key in ['ABI5_S02_RETRY_FIXTURE', 'ABI5_INSTALL_BODY_HISTORY', 'ABI5_INSTALL_BODY_HISTORY_SHA256']:
        command['environment'].pop(key, None)
w['testing']['commands'][6]['timeoutMs'] = conjunction['proofCommandTimeoutMs']
current_names = ['TASK.md', 'NATIVE_GRANT.json', 'ROOT_REENTRY_SELECTION_06.md',
                 'PRIOR_ACTIVATION_CONJUNCTION.json', 'PREVIOUS_NATIVE_RETURN.json',
                 'CONTEXT_AND_CAUSAL_MAP.md', 'ROOT_TRIAGE_AND_SELECTION.md', 'rubric.json',
                 'REMAINING_OWNER_CLASSIFICATION.md', 'CENSUS_FOLLOWUP_CLASSIFICATION.md',
                 'PRIOR_ACTUAL_C2_SUMMARY.json', 'NEXT_PROOF_EXTERNAL_INPUTS.json'] + latest
readfirst = ['consolidation-inputs/native-06/' + n for n in current_names + ['C2_SELECTED_INPUTS.json', 'HELD_SOURCE_AND_EVIDENCE.json']]
for role, order in w['workOrders'].items():
    order['readFirst'] = readfirst
    order['outcome'] = w['task']
    if role == 'construction':
        order['instructions'] = [task]
        order['writeRoots'] = grant['productWritePaths'] + grant['scratchWriteRoots']
    else:
        order['instructions'] = ['Use current selection06, exact closed conjunction and original full map/rubric. Only construction writes source. Preserve all original obligations and failures; exact source identity, actual C2, independent review and UAT/fresh closure are separate predicates.']
selected = set(w['testing']['selectedPaths']) | set(grant['productWritePaths']) | set(readfirst) | set(future)
selected.update(conjunction.get('additionalReadPaths', []))
selected.update('build_tenants/abiogenesis/typescript/' + p for lane in inputs['lanes'] for p in lane['files'])
write(A / 'C2_LITERAL_IMPORT_SEEDS.json', sorted(selected))
check = subprocess.run(['node', str(X / 'check-c2-literal-imports.mjs'), str(S), str(A / 'C2_LITERAL_IMPORT_SEEDS.json')], capture_output=True, text=True)
assert check.stdout, check.stderr
closure = json.loads(check.stdout)
write(A / 'C2_LITERAL_IMPORT_CLOSURE.json', closure)
assert check.returncode == 0 and not closure['missing'], json.dumps(closure['missing'])
selected.update(r['path'] for r in closure['added'])
guide = 'consolidation-inputs/native-06/C2_SELECTED_INPUTS.json'
selected.add(guide)
write(I / 'C2_SELECTED_INPUTS.json', {'kind': 'operator_selected_file_guide', 'selectedPaths': sorted(selected), 'futureFiles': future,
                                    'meaning': 'Exact selected files and future handoffs; preserve relative paths; no broad directory copy or new resolver.'})
w['testing']['selectedPaths'] = sorted(selected)
w['readRoots'] = sorted(set(w['readRoots']) | selected | set(readfirst))
w['testing']['commands'][0]['args'] = w['testing']['commands'][0]['args'][:2] + inputs['sourceCorrespondencePaths']
suff = relocate(read(oldI / 'INPUT_SUFFICIENCY.json'))
suff.update(futureFiles=future, continuation='Exact native05 source and closed current reviews/triages; original full scope; current fixture producer routes and finite file guide.', groups={})
for p in sorted(selected):
    if p in future or p in [guide, 'consolidation-inputs/native-06/INPUT_SUFFICIENCY.json']:
        continue
    group = ('contract-seeds' if '/contract-seeds/' in p else 'compiler-and-runtime-source' if '/code/src/' in p else 'affected-tests-and-fixtures' if '/test_env/' in p else 'method-and-current-control')
    row = suff['groups'].setdefault(group, {'files': 0, 'bytes': 0})
    row['files'] += 1
    row['bytes'] += (S / p).stat().st_size
suff['literalModuleClosure'] = {'record': pin(A / 'C2_LITERAL_IMPORT_CLOSURE.json'), 'addedPaths': [r['path'] for r in closure['added']], 'scope': 'Literal imports plus explicit current fixture/producer data and actual C2.'}
write(I / 'INPUT_SUFFICIENCY.json', suff)
framework = [v['path'] for v in w['sources'] if not v['path'].startswith('consolidation-inputs/')]
source_paths = list(dict.fromkeys(framework + ['consolidation-inputs/native-06/' + n for n in current_names + ['PERFORMANCE_DETAIL.md', 'MEASURED_BASELINE.json', 'EXTERNAL_READ_RESOURCES.json', 'C2_INPUTS.json', 'INPUT_SUFFICIENCY.json', 'c2-proof.mjs']]))
w['sources'] = [{'path': p, 'digest': 'sha256:' + sha((S / p).read_bytes())} for p in source_paths]
w['assessment']['sources'] = [p for p in source_paths if p != w['assessment']['rubricPath']]
assert not set(source_paths) & set(grant['productWritePaths'])
for p in selected:
    assert (S / p).is_file() if p not in future else not (S / p).exists(), p
write(A / 'workload.json', w)
write(A / 'PACKET_PREPARATION_COMPLETE.json', {
    'status': 'READY_FOR_INSTALLED_PREFLIGHT', 'recordedUtc': datetime.now(timezone.utc).isoformat(),
    'sourcePreimage': pin(A / 'SOURCE_BEFORE.json'), 'selectedFiles': len(selected),
    'existingSelectedBytes': sum((S / p).stat().st_size for p in selected if p not in future),
    'futureFiles': future, 'sourcePins': len(w['sources']), 'commands': len(w['testing']['commands']),
    'productWritePaths': len(grant['productWritePaths']), 'workload': pin(A / 'workload.json'),
    'nativeDispatched': False, 'providerCalls': 0, 'previousActualClose': pin(close)})
print(json.dumps({'status': 'PREPARATION_READY', 'activation': str(A), 'selectedFiles': len(selected),
                  'productWritePaths': len(grant['productWritePaths']), 'sourcePins': len(w['sources']), 'sourceChangedByRoot': False}))
