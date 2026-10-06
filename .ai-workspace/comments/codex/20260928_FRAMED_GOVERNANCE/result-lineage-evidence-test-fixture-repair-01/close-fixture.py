#!/usr/bin/env python3
"""Close the one-field fixture successor from saved test/compile evidence."""
from pathlib import Path
import json, hashlib, stat, datetime, os

S = Path(__file__).resolve().parent
A = S.parent / 'result-lineage-evidence-realization-01'
R = S.parents[4]
T = Path('build_tenants/abiogenesis/typescript')
source = R / T / 'code/src/abg/c_call_outcome.ts'
test = R / T / 'test_env/tests/t287-result-evidence-lineage-projection.test.mjs'

def pin(path):
    body = path.read_bytes()
    return {'path': str(path), 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest(),
            'mode': stat.S_IMODE(path.stat().st_mode)}

def write(name, value):
    with (S / name).open('x') as handle:
        json.dump(value, handle, indent=2)
        handle.write('\n')

activation = json.loads((S / 'activation.json').read_text())
preparation = json.loads((S / 'preparation.json').read_text())
outcome = json.loads((S / 'regression-outcome.json').read_text())
receipt = json.loads((S / 'regression-supervisor-close.json').read_text())
start = json.loads((S / 'regression-supervisor-start.json').read_text())
compile_receipt = json.loads((A / 'compile-supervisor-close.json').read_text())
assert activation['operation'] == 'T287_RESULT_LINEAGE_TEST_FIXTURE_REPAIR_01'
assert receipt['exitCode'] == 0 and not receipt['timedOut']
assert receipt['wait4ReapedMain'] and receipt['processGroupAfterWait'] == 'absent'
assert start['groupEstablishedBeforeImports'] and start['totalSeconds'] == 180
assert start['HOME'] == '/Users/jim' and receipt['knownCLIProcessGroups'] == []
try:
    os.killpg(receipt['processGroup'], 0)
except ProcessLookupError:
    pass
else:
    raise AssertionError('supervised group still present')
assert compile_receipt['exitCode'] == 0
assert pin(source) == activation['sourceReadOnly']
assert pin(test) == preparation['soleOverlay']
assert test.read_bytes() == (S / 'postimage.test.mjs').read_bytes()
original_test = (S / 'preimage.test.mjs').read_text()
assert test.read_text() == original_test.replace(
    'template: {applications: []}, declarations: {}}, cursor: {},',
    'template: {applications: []}, declarations: {}, effects: []}, cursor: {},', 1)
assert {form['form'] for form in outcome['forms']} == {'embedded', 'reference'}
assert all(form['callback'] == 'accepted' and form['exactPreimage'] == 'refused' for form in outcome['forms'])
assert all(len(form['negatives']) == 13 for form in outcome['forms'])
assert outcome['deterministicAbsenceAndTransportNull'] == 'conserved'
assert outcome['RuntimeAdmissions'] == outcome['resourcesOpened'] == outcome['helperActorProviderCalls'] == 0
stdout = (S / 'regression-supervised-stdout.log').read_text()
assert 'tests 1' in stdout and 'pass 1' in stdout and 'fail 0' in stdout and 'skipped 0' in stdout

original_freeze = json.loads((A / 'freeze.json').read_text())
copy_changes = []
copy_rows = [row for row in original_freeze['records'] if row['path'].startswith('readiness-stage/')]
for row in copy_rows:
    path = S / row['path']
    assert stat.S_IMODE(path.lstat().st_mode) == row['mode']
    if row['kind'] == 'symlink':
        assert path.is_symlink() and path.readlink().as_posix() == row['target']
    else:
        observed = pin(path)
        if any(observed[key] != row[key] for key in ['bytes', 'sha256', 'mode']):
            copy_changes.append({'path': row['path'], 'preimage': row, 'postimage': observed})
expected = 'readiness-stage/' + str(T / 'test_env/tests/t287-result-evidence-lineage-projection.test.mjs')
assert len(copy_changes) == 1 and copy_changes[0]['path'] == expected
compiled = S / 'readiness-stage' / T / 'build/code/src/abg/c_call_outcome.js'
assert pin(compiled) == preparation['compiledSourceReusedByteExact']
assert compiled.read_bytes() == (A / 'readiness-stage' / T / 'build/code/src/abg/c_call_outcome.js').read_bytes()
write('copied-population-correspondence.json', {'originalSourceFreeze': pin(A / 'freeze.json'),
    'copiedRecords': len(copy_rows), 'soleChangedCopyRecord': copy_changes[0],
    'compiledSourceReusedByteExact': pin(compiled), 'noBuildOrCompile': True,
    'interpretation': 'Every original copied physical body/mode is conserved except the exact one-field test successor.'})
write('source-authorship.json', {'productionSource': pin(source),
    'productionAuthor': 'T287_RESULT_LINEAGE_EVIDENCE_REALIZATION_01',
    'originalNewTestAuthor': 'T287_RESULT_LINEAGE_EVIDENCE_REALIZATION_01',
    'originalSourceAndTestFreeze': pin(A / 'freeze.json'),
    'preservedFailure': pin(A / 'first-readiness-failure.json'),
    'originalTestPreimage': activation['testPreimage'], 'correctedTest': pin(test),
    'fixtureIncrementAuthor': activation['operation'], 'fixtureIncrement': 'Only effects: [] added to the supplied graphFunction.',
    'copiedCompiledSource': pin(compiled), 'compileReceiptReused': pin(A / 'compile-supervisor-close.json'),
    'sourceCopyAndTestExecution': 'Arrangement/readiness do not transfer original source or test authorship.'})
write('readiness.json', {'status': 'TARGETED_COMPONENT_READINESS_PASSED', 'testResult': {'tests': 1,
    'passed': 1, 'failed': 0, 'cancelled': 0, 'skipped': 0, 'todo': 0},
    'outcome': pin(S / 'regression-outcome.json'), 'actualResults': outcome,
    'sourceCompile': {'reused': True, 'receipt': pin(A / 'compile-supervisor-close.json'), 'exitCode': compile_receipt['exitCode']},
    'readinessComposition': 'Original successfully compiled production source plus the one-field corrected test in one owned pure copy.',
    'crossConsumers': 'Existing native-work/Consensus coordinate subset unchanged; deterministic missing optional fields stay absent and transportDigest stays null.',
    'requirementTrace': ['REQ-P-QUAL-064A', 'REQ-P-QUAL-064B', 'REQ-P-QUAL-064C', 'REQ-P-SELF-CONFORMANCE-007A', 'T287 carrier HOW section 5'],
    'limits': ['Lower ABG/native/prefix/request operations are explicitly supplied component premises.',
      'No genuine installed successor or semantic F11 credit.', 'Corrupt evidence is a Product-guard counterexample, not a native admission claim.'],
    'Runtime08': 'Still failed/stopped; zero completed Runs, cold reads, F11 or AF22; no Runtime retry.'})
write('accounting.json', {'executedCommands': 1, 'compileCommands': 0, 'testCommands': 1,
    'preparationMs': preparation['preparationMs'], 'supervisedElapsedMs': receipt['elapsedMs'],
    'peakRSSBytes': receipt['rssBytes'], 'userSeconds': receipt['userSeconds'], 'systemSeconds': receipt['systemSeconds'],
    'budgetSeconds': start['totalSeconds'], 'HOME': start['HOME'], 'heap': 'default',
    'PID': receipt['pid'], 'PGID': receipt['processGroup'], 'groupBeforeImports': True, 'wait4Reaped': True,
    'knownGroupAbsentAfterWaitAndClosure': True, 'knownCLIProcessGroups': receipt['knownCLIProcessGroups'],
    'noProviderRuntimeResourceHelperActorGitNetworkCandidateInstallEffects': True,
    'priorCompileCostNotReexecuted': {'elapsedMs': compile_receipt['elapsedMs'], 'rssBytes': compile_receipt['rssBytes']}})
closed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
write('closure.json', {'operation': activation['operation'], 'actor': activation['actor'], 'role': 'Worker',
    'status': 'CLOSED', 'closedAt': closed_at, 'disposition': 'ONE_FIELD_FIXTURE_SUCCESSOR_COMPONENT_READINESS_PASSED',
    'productionSourceReadOnly': pin(source), 'correctedTest': pin(test), 'returnTo': 'Root Executive',
    'furtherEffects': 'STOPPED', 'residuals': ['Independent source/test conjunction assurance',
      'Root successor construction/install/current inputs/whole carrier selection', 'Genuine F11/QUAL056/full scenarios/green AF22/release remain open']})
(S / 'return.md').write_text('CLOSED one-field fixture repair; the single same-test rerun passed.\n\n'
    'Only effects: [] was added to the supplied graphFunction. Production source and its successful compiled JavaScript remain exact. '
    'Both qualification task forms passed through the real callback/producer/lineage guard; the exact C07 preimage and selected corruptions refused. '
    'Deterministic optional-field absence and transport null were conserved.\n\n'
    'The original failed test and original source/test author chains remain frozen. No compile or Runtime rerun occurred. '
    'The supervised group was established before imports, reaped and absent. Component premises do not establish installed or semantic F11 success.\n')
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
    'grant': activation['grant'], 'subject': {'sourceReadOnly': pin(source), 'correctedTest': pin(test)},
    'originalSourceAuthorshipAndFailureFreeze': pin(A / 'freeze.json'), 'readiness': 'TARGETED_COMPONENT_PASSED',
    'records': records, 'directories': directories, 'census': {
      'regularFiles': sum(row['kind'] == 'file' for row in records), 'symlinks': sum(row['kind'] == 'symlink' for row in records),
      'directories': len(directories), 'regularBytes': sum(row.get('bytes', 0) for row in records)},
    'freezeExcludedFromOwnPopulation': True, 'onlyCanonicalWrite': str(test), 'stopWritesAfterFreeze': True}
write('freeze.json', freeze)
print(json.dumps({'freeze': pin(S / 'freeze.json'), 'closure': pin(S / 'closure.json'),
    'source': pin(source), 'test': pin(test), 'census': freeze['census']}))
