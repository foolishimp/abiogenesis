"""Explicit continuation of unperformed B12 proof; no prior population rerun."""
import collections, datetime, hashlib, json, os, pathlib, re, shutil, subprocess, sys

CONTROL = pathlib.Path(__file__).resolve().parent
RAW = CONTROL.parent
def read(path): return json.loads(path.read_text())
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
binding = read(CONTROL / 'INPUT_BINDING.json')
manifest_path = CONTROL / 'CONTROL_MANIFEST.json'
assert len(sys.argv) == 2, 'Supply the post-checkpoint external LAUNCH_BINDING.json'
launch = read(pathlib.Path(sys.argv[1]))
assert launch['activation'] == binding['activation'] == 'B12_PROOF_CONTINUATION_01'
assert launch['rootAcceptedAndPushed'] is True
assert re.fullmatch(r'[0-9a-f]{40}', launch['checkpointHead'])
assert launch['controlManifestSha256'] == digest(manifest_path)
acceptance = launch['acceptance']
assert digest(pathlib.Path(acceptance['path'])) == acceptance['sha256']
for row in read(manifest_path)['files']:
    path = CONTROL / row['name']
    assert path.stat().st_size == row['bytes'] and digest(path) == row['sha256'], row['name']
old = RAW / 'proof-control-setup-custody-01'
bounded_pin = next(row for row in binding['retainedFiles'] if row['path'] == str(old / 'bounded.py'))
assert digest(old / 'bounded.py') == bounded_pin['sha256']
sys.path.insert(0, str(old))
from bounded import inventory, run, save, sha

SOURCE = pathlib.Path(binding['sourceWorktree']); SUBJECT = pathlib.Path(binding['builtSubject'])
ACT = read(old / 'ACTIVATION.json'); selection = read(RAW / 'PROOF_CASES.json')
deadline = datetime.datetime.fromisoformat(binding['originalProofDeadlineUtc'])
host_deadline = datetime.datetime.fromisoformat(binding['originalHostDeadlineUtc'])
assert deadline <= host_deadline
execution = CONTROL / 'execution'; execution.mkdir(exist_ok=False)
started = datetime.datetime.now(datetime.timezone.utc)
save(execution / 'START.json', {'startedUtc': started.isoformat(), 'deadlineUtc': deadline.isoformat(),
    'originalHostDeadlineUtc': host_deadline.isoformat(), 'launchBinding': {'path': sys.argv[1], 'sha256': digest(pathlib.Path(sys.argv[1]))},
    'retainedFailure': binding['retainedEvidence'], 'retryPriorCommands': False, 'providerCalls': 0})
results = []; attempted = []; completed = []; audits = []
post = read(RAW / 'SOURCE_POSTIMAGE.json')
subject_rows = read(pathlib.Path(binding['builtSubjectInventory']['path']))['rows']
def pinned(row):
    path = pathlib.Path(row['path'])
    assert path.stat().st_size == row['bytes'] and sha(path) == row['sha256'], str(path)
def conserve():
    assert inventory(SOURCE, exclude=(post['scratchExcluded'],)) == post['rows'], 'Original source postimage changed'
    assert len(post['rows']) == binding['sourceRows'] == 1427
    actual_head = subprocess.run(['/usr/bin/git', 'rev-parse', 'HEAD'], cwd=SOURCE, capture_output=True, text=True, timeout=30, check=True).stdout.strip()
    assert actual_head == binding['sourceHead'] == post['sourceHead']
    assert inventory(SUBJECT) == subject_rows, 'Retained source/build/dependencies changed'
    for row in binding['retainedFiles']: pinned(row)
def command(label, args, cap, extra=()):
    assert shutil.disk_usage(RAW).free > ACT['limits']['reserveBytes']
    attempted.append(label); folder = execution / label
    try:
        result = run(folder, args, SUBJECT, env, deadline, cap, ACT['limits']['outputBytesPerCommand'], extra)
        completed.append(label); return result
    finally:
        if (folder / 'result.json').exists(): results.append({'label': label, **read(folder / 'result.json')})
def test_file(label, row, gate=False):
    assert sha(SUBJECT / pathlib.Path(row['path']).relative_to('build_tenants/abiogenesis/typescript')) == row['sha256']
    events = execution / label / 'events.jsonl'
    args = ['/opt/homebrew/bin/node', '--experimental-vm-modules', '--test', '--test-concurrency=1',
        '--test-reporter=tap', '--test-reporter-destination=stdout',
        '--test-reporter=' + str(old / 'events-reporter.mjs'), '--test-reporter-destination=' + str(events)]
    if gate: args += ['--test-name-pattern=^' + re.escape(binding['gateName']) + '$']
    args += ['test_env/tests/' + pathlib.Path(row['path']).name]
    command(label, args, ACT['limits']['perTestFileMs'], (events,))
    stream = [json.loads(line) for line in events.read_text().splitlines()]
    cases = [{'name': event['data']['name'], 'nesting': event['data']['nesting'],
        'skip': bool(event['data'].get('skip', False)), 'todo': bool(event['data'].get('todo', False)),
        'status': event['type'], 'skipReason': event['data'].get('skip', None)}
        for event in stream if event['type'] in ['test:pass', 'test:fail']]
    key = lambda case: (case['nesting'], case['name'], case['skip'], case['todo'])
    if gate:
        expected = [{'name': binding['gateName'], 'nesting': 0, 'skip': False, 'todo': False}]
        selected = [case for case in cases if case['name'] == binding['gateName']]
        excluded_names = [case['name'] for case in row['cases'] if case['name'] != binding['gateName']]
        excluded = [case for case in cases if case['name'] != binding['gateName']]
        exclusions_ok = all(case['name'] in excluded_names and case['nesting'] == 0 and case['skip']
            and not case['todo'] and case['status'] == 'test:pass' for case in excluded)
    else:
        expected = row['cases']; selected = cases; excluded_names = []; excluded = []; exclusions_ok = True
    exact = collections.Counter(map(key, selected)) == collections.Counter(map(key, expected))
    audit = {'sourceFile': row['path'], 'sourceSha256': row['sha256'], 'expectedCases': expected,
        'actualCases': cases, 'selectedCases': selected, 'expectedEqualsActualSelected': exact,
        'selectionExcludedNames': excluded_names, 'reportedNameFilterExclusions': excluded,
        'nameFilter': '^' + re.escape(binding['gateName']) + '$' if gate else None,
        'nameFilterExclusionsValid': exclusions_ok, 'failedCases': [case for case in cases if case['status'] == 'test:fail'],
        'declaredSkipsAmongSelected': [case for case in selected if case['skip']]}
    save(execution / label / 'POPULATION_AUDIT.json', audit); audits.append({'label': label, **audit})
    assert exact and exclusions_ok and not audit['failedCases'] and not audit['declaredSkipsAmongSelected'], label
    counts = dict(re.findall(r'^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)$', (execution / label / 'stdout.raw').read_text(), re.M))
    assert int(counts.get('pass', 0)) == len(expected) and int(counts.get('fail', 0)) == 0 and int(counts.get('cancelled', 0)) == 0

env = {key: value for key, value in os.environ.items() if key in ['HOME', 'PATH', 'LANG', 'LC_ALL']}
env.update({'HOME': '/Users/jim', 'PATH': '/Users/jim/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    'TMPDIR': str(RAW / 'proof/tmp'), 'TMPPREFIX': str(RAW / 'proof/tmp/zsh'), 'NODE_OPTIONS': '--max-old-space-size=8192',
    'GIT_OPTIONAL_LOCKS': '0', 'NPM_CONFIG_OFFLINE': 'true', 'NPM_CONFIG_UPDATE_NOTIFIER': 'false',
    'NPM_CONFIG_CACHE': str(RAW / 'host-scratch/npm-cache'), 'NPM_CONFIG_USERCONFIG': str(RAW / 'host-scratch/npm-user.npmrc'),
    'NPM_CONFIG_GLOBALCONFIG': str(RAW / 'host-scratch/npm-global.npmrc')})
try:
    assert started < deadline, 'Original proof deadline expired'
    pinned(binding['builtSubjectInventory']); conserve()
    for row in binding['tools']: pinned(row)
    assert read(RAW / 'PROOF_RETURN.json')['status'] == 'FIRST_FAILURE_STOP'
    assert read(RAW / 'PROOF_START.json')['deadlineUtc'] == binding['originalProofDeadlineUtc']
    cli = read(RAW / 'proof/01-t292-td79-cli-exit-classification.test/POPULATION_AUDIT.json')
    static = read(RAW / 'proof/02-t287-w2-05-static-binding-algebra.test/POPULATION_AUDIT.json')
    assert cli['expectedEqualsActual'] and len(cli['actualCases']) == 26 and not cli['failedCases']
    assert not static['expectedEqualsActual'] and not static['failedCases']
    assert sum(not case['skip'] for case in static['actualCases']) == 3
    assert [case['name'] for case in static['actualCases'] if case['skip']] == [binding['gateName']]
    for name in ['CANDIDATE_PACKAGE.json', 'PACK_VERIFICATION.json', 'INSTALLATION.json', 'SMOKE_RESULT.json']:
        assert not (RAW / 'proof' / name).exists(), 'Previously performed continuation command: ' + name
    command('03-candidate-package-install', ['/opt/homebrew/bin/node', str(old / 'candidate.mjs'), 'package'], ACT['limits']['perBuildMs'])
    candidate = read(RAW / 'proof/CANDIDATE_PACKAGE.json')
    assert candidate['sourcePostimageSha256'] == binding['sourcePostimage']['sha256']
    assert sha(pathlib.Path(candidate['archive']['path'])) == candidate['archive']['sha256']
    save(execution / 'CANDIDATE_BINDING.json', {'candidate': candidate,
        'candidateRecordSha256': sha(RAW / 'proof/CANDIDATE_PACKAGE.json'),
        'verificationSha256': sha(RAW / 'proof/PACK_VERIFICATION.json'), 'installationSha256': sha(RAW / 'proof/INSTALLATION.json')})
    command('04-current-candidate-resolve-fixture', ['/opt/homebrew/bin/node', str(CONTROL / 'resolve-fixture.mjs')], ACT['limits']['setupReadbackCommandMs'])
    fixture = read(execution / 'fixture/RESULT.json')
    assert fixture['status'] == 'CURRENT_CANDIDATE_RESOLVE_FIXTURE_READY'
    assert fixture['sourcePostimageSha256'] == binding['sourcePostimage']['sha256']
    assert fixture['candidateArchive'] == candidate['archive']
    pinned(fixture['fixture'])
    env['ABI5_PREPARATION_RESOLVE_CALL'] = fixture['fixture']['path']
    test_file('05-native-detachment-gate', selection['testFiles'][1], gate=True)
    del env['ABI5_PREPARATION_RESOLVE_CALL']
    env.update({'ABI5_WAVE1_FROZEN_ARTIFACT_PATH': candidate['archive']['path'],
        'ABI5_WAVE1_FROZEN_INSTALL_HOST': candidate['installHost'],
        'ABI5_WAVE1_FROZEN_ARTIFACT_SHA256': candidate['archive']['sha256'], 'ABI5_CANDIDATE_BASIS_SOURCE': 'packed_artifact'})
    test_file('06-t287-owned-call-reference', selection['testFiles'][2])
    test_file('07-t291-m6-admission-refusal-surface', selection['testFiles'][3])
    command('08-installed-owner-smoke', ['/opt/homebrew/bin/node', str(old / 'candidate.mjs'), 'smoke'], ACT['limits']['setupReadbackCommandMs'])
    assert sha(pathlib.Path(candidate['archive']['path'])) == candidate['archive']['sha256']
    pinned(fixture['fixture']); conserve()
    save(execution / 'CONTINUATION_RETURN.json', {'status': 'BOUNDED_B12_CONTINUATION_COMPLETE',
        'results': results, 'attempted': attempted, 'completed': completed, 'audits': audits,
        'retainedPassingExecutions': 29, 'retainedDeclaredSkips': 1, 'newPassingExecutions': 7,
        'uniquePassingCasesAcrossBothRuns': 36, 'sourcePostimageSha256': binding['sourcePostimage']['sha256'],
        'originalFailurePreserved': True, 'qualified': False, 'qualificationInventoriesCurrentForComposedFinal': False,
        'originalDeadlineUtc': deadline.isoformat(), 'completedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat()})
except Exception as error:
    save(execution / 'CONTINUATION_RETURN.json', {'status': 'FIRST_CONTINUATION_FAILURE_STOP', 'error': repr(error),
        'results': results, 'attempted': attempted, 'completed': completed, 'audits': audits,
        'originalFailurePreserved': True, 'retry': False, 'qualified': False,
        'originalDeadlineUtc': deadline.isoformat(), 'stoppedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat()})
    raise
