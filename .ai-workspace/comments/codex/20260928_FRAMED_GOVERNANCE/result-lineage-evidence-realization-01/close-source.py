#!/usr/bin/env python3
"""Self-contained source/report closure from actual saved readiness records."""
from pathlib import Path
import json, hashlib, stat, datetime, os

S = Path(__file__).resolve().parent
R = S.parents[4]
D = S.parent / 'final-candidate-construction-07'
T = Path('build_tenants/abiogenesis/typescript')
source = R / T / 'code/src/abg/c_call_outcome.ts'
test = R / T / 'test_env/tests/t287-result-evidence-lineage-projection.test.mjs'

def digest(body):
    return hashlib.sha256(body).hexdigest()

def pin(path):
    body = path.read_bytes()
    return {'path': str(path), 'bytes': len(body), 'sha256': digest(body),
            'mode': stat.S_IMODE(path.stat().st_mode)}

def write(name, value):
    with (S / name).open('x') as handle:
        json.dump(value, handle, indent=2)
        handle.write('\n')

activation = json.loads((S / 'activation.json').read_text())
preparation = json.loads((S / 'preparation.json').read_text())
compile_receipt = json.loads((S / 'compile-supervisor-close.json').read_text())
regression_receipt = json.loads((S / 'regression-supervisor-close.json').read_text())
failure = json.loads((S / 'first-readiness-failure.json').read_text())
selected = json.loads((S / 'pre-readiness-source-pins.json').read_text())
postimages = [pin(source), pin(test)]
assert postimages == [selected['source'], selected['newTest']]
assert compile_receipt['exitCode'] == 0 and regression_receipt['exitCode'] == 1
assert not (S / 'regression-outcome.json').exists()
assert not compile_receipt['timedOut'] and not regression_receipt['timedOut']
for receipt in [compile_receipt, regression_receipt]:
    assert receipt['wait4ReapedMain'] and receipt['processGroupAfterWait'] == 'absent'
    assert receipt['knownCLIProcessGroups'] == []
    try:
        os.killpg(receipt['processGroup'], 0)
    except ProcessLookupError:
        pass
    else:
        raise AssertionError('owned process group remains present')

copy = S / 'readiness-stage'
baseline_rows = json.loads((D / 'final-stage-population.json').read_text())
copy_deltas = []
for row in baseline_rows:
    relative = Path(row['path']).relative_to('final-stage')
    path = copy / relative
    if row['kind'] == 'symlink':
        assert path.is_symlink() and path.readlink().as_posix() == row['target']
        assert stat.S_IMODE(path.lstat().st_mode) == row['mode']
        continue
    observed = pin(path)
    if any(observed[key] != row[key] for key in ['bytes', 'sha256', 'mode']):
        copy_deltas.append({'path': str(relative), 'preimage': row, 'postimage': observed})
expected_copy_changes = {str(T / 'code/src/abg/c_call_outcome.ts'),
                         str(T / 'build/code/src/abg/c_call_outcome.js')}
assert {row['path'] for row in copy_deltas} == expected_copy_changes
assert (copy / T / 'test_env/tests/t287-result-evidence-lineage-projection.test.mjs').read_bytes() == test.read_bytes()
write('isolated-copy-conservation.json', {'baseline': pin(D / 'final-stage-population.json'),
    'copiedRecords': len(baseline_rows), 'changedInheritedRecords': copy_deltas,
    'soleAddedSource': pin(copy / T / 'test_env/tests/t287-result-evidence-lineage-projection.test.mjs'),
    'interpretation': 'Only selected source and its emitted JavaScript changed; existing owner API declarations and other frozen C07 bodies/modes are conserved.'})
write('source-authorship.json', {'originalAuthor': activation['operation'], 'role': 'Worker',
    'sourcePreimage': pin(S / 'c_call_outcome.ts.preimage'), 'sourcePostimage': postimages[0],
    'newTest': postimages[1], 'newTestPreimage': 'ABSENT',
    'buildCopy': 'Mechanical arrangement of accepted frozen C07 plus these exact postimages; not new authorship of C07 inputs.',
    'productionChange': 'Preserve required inputDigest and nine optional admitted actor/request/prompt/transport fields only; omit absent optional own keys and preserve explicit nulls. Existing seven fields/derived coordinates and transportDigest semantics remain.'})
write('readiness.json', {'status': 'COMPILE_PASSED_TARGETED_REGRESSION_STOPPED',
    'compile': compile_receipt, 'targetedRegression': regression_receipt,
    'firstFailure': pin(S / 'first-readiness-failure.json'), 'actualDiagnostic': failure['actualDiagnostic'],
    'callbackRoute': 'Real emitted admitCCallResult -> stageCCallResult success callback -> actual qualification Product lineage guard/producer; real pure projectCCallOutcomeReceiptAtPrefix under lower prefix premise.',
    'qualificationForms': 'Both valid embedded/reference forms and selected preimage/corruption assertions precede the failing final deterministic call in actual control flow; final test pass/outcome absent.',
    'suppliedPremises': ['Lower ABG transaction/evidence/result/prefix facts in process memory',
       'Admitted native raw-result preimage', 'Current prepared request/nonserialized native-proof operation',
       'Finite synthetic native-construction attribution data; no genuine Runtime producer'],
    'guards': 'Actual qualification schema, producer, Product lineage guard and owner applicability logic retained. Corrupted rows intentionally bypass lower admission only to discriminate the selected Product guard.',
    'crossConsumers': 'Existing native-work/Consensus cCallRef/cCallAttempt/evidence identity/class/outputDigest/transportDigest fields retained; final deterministic absence/null conservation arrangement failed before its callback.',
    'requirementTrace': ['REQ-P-QUAL-064A', 'REQ-P-QUAL-064B', 'REQ-P-QUAL-064C', 'REQ-P-SELF-CONFORMANCE-007A', 'T287_F11_CARRIER_RESOURCE_DESIGN.md section 5'],
    'semanticF11OrInstalledSuccessorProof': False, 'Runtime08': 'Still failed; zero completed Runs/cold reads/F11/AF22; no retry.'})
write('accounting.json', {'preparationMs': preparation['elapsedMs'],
    'executedCommands': 2, 'compileCount': 1, 'targetedTestCount': 1,
    'supervisedElapsedMs': compile_receipt['elapsedMs'] + regression_receipt['elapsedMs'],
    'peakRSSBytes': max(compile_receipt['rssBytes'], regression_receipt['rssBytes']),
    'userSeconds': compile_receipt['userSeconds'] + regression_receipt['userSeconds'],
    'systemSeconds': compile_receipt['systemSeconds'] + regression_receipt['systemSeconds'],
    'budgetsSeconds': {'compile': 180, 'test': 180, 'combined': 360}, 'heap': 'default', 'HOME': '/Users/jim',
    'groups': [{'pid': receipt['pid'], 'PGID': receipt['processGroup'], 'reaped': True, 'absent': True}
               for receipt in [compile_receipt, regression_receipt]],
    'RuntimeResourceHelperActorProviderGitNetworkCandidateInstallEffects': 0,
    'processObservationLimit': 'Known supervised groups absent; no broad process enumeration or speculative child claim.'})
closed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
write('closure.json', {'operation': activation['operation'], 'actor': activation['actor'], 'role': 'Worker',
    'status': 'CLOSED', 'closedAt': closed_at, 'disposition': 'SOURCE_REPAIR_COMPILED_READINESS_FIXTURE_STOPPED',
    'firstFailurePreserved': pin(S / 'first-readiness-failure.json'), 'autonomousRepairOrRetry': False,
    'returnTo': 'Root Executive', 'furtherEffects': 'STOPPED',
    'residuals': ['Root selection for final deterministic fixture-envelope omission and targeted readiness continuation',
      'Independent source assurance', 'C08 construction/install/input acceptance and genuine whole carrier',
      'F11/QUAL056/full scenarios/green AF22/release remain open']})
(S / 'return.md').write_text('CLOSED source repair; isolated compile passed, targeted readiness stopped.\n\n'
    'The actual projection retains the admitted input/request/actor/transport lineage without changing any owner guard or schema. '
    'The targeted test reached its final deterministic arrangement after both qualification forms and their selected negative/preimage assertions, '
    'then the supplied graphFunction omitted effects and the real F_D worksite applicability read threw before that final callback. '
    'The failed attempt is preserved; no repair or retry followed.\n\n'
    'One compile and one targeted test used default heap, ordinary HOME and pre-import process-group supervision. '
    'Both groups were reaped and absent. No Runtime, resource, helper, provider, Git, candidate or installation effects occurred.\n\n'
    'Root must select any readiness continuation and independently assure the eventual source cut before successor construction/installed whole proof.\n')
records, directories = [], []
for path in sorted(S.rglob('*')):
    relative = str(path.relative_to(S))
    mode = stat.S_IMODE(path.lstat().st_mode)
    if path.is_symlink():
        records.append({'path': relative, 'kind': 'symlink', 'mode': mode, 'target': path.readlink().as_posix()})
    elif path.is_file():
        observed = pin(path)
        records.append({'path': relative, 'kind': 'file', **{key: observed[key] for key in ['bytes', 'sha256', 'mode']}})
    elif path.is_dir():
        directories.append({'path': relative, 'mode': mode})
    else:
        raise AssertionError('unsupported report population entry')
freeze = {'operation': activation['operation'], 'status': 'CLOSED', 'closedAt': closed_at,
    'grant': activation['grant'], 'subject': postimages,
    'readiness': 'SOURCE_REPAIR_COMPILED_TARGETED_FIXTURE_FAILURE_PRESERVED',
    'records': records, 'directories': directories,
    'census': {'regularFiles': sum(row['kind'] == 'file' for row in records),
      'symlinks': sum(row['kind'] == 'symlink' for row in records), 'directories': len(directories),
      'regularBytes': sum(row.get('bytes', 0) for row in records)},
    'freezeExcludedFromOwnPopulation': True,
    'onlyCanonicalWrites': [str(source), str(test)], 'stopWritesAfterFreeze': True}
write('freeze.json', freeze)
print(json.dumps({'freeze': pin(S / 'freeze.json'), 'closure': pin(S / 'closure.json'),
    'source': postimages[0], 'test': postimages[1], 'census': freeze['census']}))
