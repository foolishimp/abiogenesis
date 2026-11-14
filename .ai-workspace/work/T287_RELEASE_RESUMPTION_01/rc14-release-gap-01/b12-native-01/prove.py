"""One candidate build and four unfiltered files, then fresh installed smoke."""
import collections, datetime, json, os, pathlib, re, shutil, subprocess, sys
from bounded import inventory, run, save, sha

CONTROL = pathlib.Path(__file__).resolve().parent
ACT = json.loads((CONTROL / 'ACTIVATION.json').read_text())
RAW = pathlib.Path(ACT['rawRoot']); SOURCE = pathlib.Path(ACT['sourceWorktree'])
TENANT_REL = 'build_tenants/abiogenesis/typescript'; TENANT = SOURCE / TENANT_REL
SCHEDULE = json.loads((CONTROL / 'PROOF_SCHEDULE.json').read_text())
assert len(sys.argv) == 2, 'Provide the Operator-audited exact postimage case manifest'
selection_path = pathlib.Path(sys.argv[1]).resolve(); selection = json.loads(selection_path.read_text())
host = json.loads((RAW / 'HOST_RETURN.json').read_text()); final = json.loads((RAW / 'runtime/FINAL.json').read_text())
assert host['exitCode'] == 0 and host['stopReason'] is None and host['cleanup']['ownedProcessGroupAbsent']
assert final['launched'] and final['actualResourceClose'] and final['failure'] is None and final['readbackFailure'] is None
native = json.loads((RAW / 'runtime/NATIVE_RETURN.json').read_text())
terminal = native['ownerOutput']['value'].get('terminalResult')
assert terminal and terminal['valueKind'] == 'native_workspace_work_observation'
assert terminal['value']['kind'] == 'native_workspace_work_observation'
pre = json.loads((RAW / 'SOURCE_PREIMAGE.json').read_text()); head = pre['sourceHead']
actual_head = subprocess.run(['/usr/bin/git', 'rev-parse', 'HEAD'], cwd=SOURCE, capture_output=True, text=True, timeout=30, check=True).stdout.strip()
assert head == actual_head == selection['sourceHead']
original = {row['path']: row for row in pre['rows']}
post_rows = inventory(SOURCE, exclude=(ACT['nativeWriteScope'][-1],))
post = {row['path']: row for row in post_rows}
changed = sorted(path for path in original.keys() | post.keys() if original.get(path) != post.get(path))
assert changed and set(changed) <= set(ACT['nativeWriteScope'][:-1]), changed
assert [row['path'] for row in selection['testFiles']] == SCHEDULE['wholeFiles']
for row in selection['testFiles']:
    assert sha(SOURCE / row['path']) == row['sha256'], row['path']
    keys = [(c['nesting'], c['name']) for c in row['cases']]
    assert keys and len(keys) == len(set(keys)), 'Exact unique expected names required before execution'
    assert all(isinstance(c['skip'], bool) and isinstance(c['todo'], bool) for c in row['cases'])

proof = RAW / 'proof'; proof.mkdir(exist_ok=False)
started = datetime.datetime.now(datetime.timezone.utc)
host_deadline = datetime.datetime.fromisoformat(json.loads((RAW / 'CONTROL_START.json').read_text())['deadlineUtc'])
deadline = min(host_deadline, started + datetime.timedelta(milliseconds=ACT['limits']['proofCampaignMs']))
save(RAW / 'PROOF_START.json', {'startedUtc': started.isoformat(), 'deadlineUtc': deadline.isoformat(),
    'originalHostDeadlineUtc': host_deadline.isoformat(), 'selection': {'path': str(selection_path), 'sha256': sha(selection_path)},
    'wholeFiles': SCHEDULE['wholeFiles'], 'nameFilters': [], 'retry': False})
save(RAW / 'SOURCE_POSTIMAGE.json', {'sourceHead': head, 'changedPaths': changed, 'rows': post_rows,
    'nativeWriteScope': ACT['nativeWriteScope'], 'scratchExcluded': ACT['nativeWriteScope'][-1]})
env = {k: v for k, v in os.environ.items() if k in ['HOME', 'PATH', 'LANG', 'LC_ALL']}
env.update({'HOME': '/Users/jim', 'PATH': '/Users/jim/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    'TMPDIR': str(proof / 'tmp'), 'TMPPREFIX': str(proof / 'tmp/zsh'), 'NODE_OPTIONS': '--max-old-space-size=8192',
    'GIT_OPTIONAL_LOCKS': '0', 'NPM_CONFIG_OFFLINE': 'true', 'NPM_CONFIG_UPDATE_NOTIFIER': 'false',
    'NPM_CONFIG_CACHE': str(RAW / 'host-scratch/npm-cache'), 'NPM_CONFIG_USERCONFIG': str(RAW / 'host-scratch/npm-user.npmrc'),
    'NPM_CONFIG_GLOBALCONFIG': str(RAW / 'host-scratch/npm-global.npmrc')})
(proof / 'tmp').mkdir(); results = []; performed = []
def command(label, args, cap, extra=()):
    assert shutil.disk_usage(RAW).free > ACT['limits']['reserveBytes'], 'free-space reserve'
    result = run(proof / label, args, proof / 'subject', env, deadline, cap, ACT['limits']['outputBytesPerCommand'], extra)
    results.append({'label': label, **result}); performed.append(label); return result
def test_file(index, row):
    label = f'{index:02d}-' + pathlib.Path(row['path']).stem
    events = proof / label / 'events.jsonl'
    args = ['/opt/homebrew/bin/node', '--experimental-vm-modules', '--test', '--test-concurrency=1',
        '--test-reporter=tap', '--test-reporter-destination=stdout',
        '--test-reporter=' + str(CONTROL / 'events-reporter.mjs'), '--test-reporter-destination=' + str(events),
        'test_env/tests/' + pathlib.Path(row['path']).name]
    command(label, args, ACT['limits']['perTestFileMs'], (events,))
    stream = [json.loads(line) for line in events.read_text().splitlines()]
    cases = [{'name': e['data']['name'], 'nesting': e['data']['nesting'],
              'skip': bool(e['data'].get('skip', False)), 'todo': bool(e['data'].get('todo', False)), 'status': e['type']}
             for e in stream if e['type'] in ['test:pass', 'test:fail']]
    key = lambda c: (c['nesting'], c['name'], c['skip'], c['todo'])
    actual = collections.Counter(map(key, cases)); expected = collections.Counter(map(key, row['cases']))
    audit = {'sourceFile': row, 'actualCases': cases, 'expectedEqualsActual': actual == expected,
        'nameFilters': [], 'failedCases': [c for c in cases if c['status'] == 'test:fail']}
    save(proof / label / 'POPULATION_AUDIT.json', audit)
    assert actual == expected and not audit['failedCases'], 'Selected name-set or test result mismatch: ' + label
    counts = dict(re.findall(r'^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)$', (proof / label / 'stdout.raw').read_text(), re.M))
    assert int(counts.get('pass', 0)) > 0 and int(counts.get('fail', 0)) == 0 and int(counts.get('cancelled', 0)) == 0

try:
    assert shutil.disk_usage(RAW).free > ACT['limits']['reserveBytes']
    mirror = proof / 'subject'
    def omit(folder, names):
        relative = pathlib.Path(folder).relative_to(TENANT).as_posix()
        excluded = {'node_modules', 'build', 'artifacts', 'qualification-scratch'} if relative == '.' else {'test_runs'} if relative == 'test_env' else set()
        return set(names) & excluded
    shutil.copytree(TENANT, mirror, symlinks=True, ignore=omit)
    dependency = json.loads((RAW / 'DEPENDENCY_INPUTS.json').read_text())
    donor = pathlib.Path(dependency['copy']); assert inventory(donor) == dependency['rows']
    shutil.copytree(donor, mirror / 'node_modules', symlinks=True)
    assert inventory(mirror / 'node_modules') == dependency['rows']
    command('00-candidate-build', ['/opt/homebrew/bin/npm', 'run', 'build'], ACT['limits']['perBuildMs'])
    test_file(1, selection['testFiles'][0])
    test_file(2, selection['testFiles'][1])
    # The installed reference population needs this new candidate. Packing here
    # avoids accidentally borrowing the pinned author's unchanged build.
    command('03-candidate-package-install', ['/opt/homebrew/bin/node', str(CONTROL / 'candidate.mjs'), 'package'], ACT['limits']['perBuildMs'])
    candidate = json.loads((proof / 'CANDIDATE_PACKAGE.json').read_text())
    env.update({'ABI5_WAVE1_FROZEN_ARTIFACT_PATH': candidate['archive']['path'],
        'ABI5_WAVE1_FROZEN_INSTALL_HOST': candidate['installHost'],
        'ABI5_WAVE1_FROZEN_ARTIFACT_SHA256': candidate['archive']['sha256'], 'ABI5_CANDIDATE_BASIS_SOURCE': 'packed_artifact'})
    test_file(4, selection['testFiles'][2]); test_file(5, selection['testFiles'][3])
    command('06-installed-owner-smoke', ['/opt/homebrew/bin/node', str(CONTROL / 'candidate.mjs'), 'smoke'], ACT['limits']['setupReadbackCommandMs'])
    assert inventory(SOURCE, exclude=(ACT['nativeWriteScope'][-1],)) == post_rows, 'Source changed during proof'
    save(RAW / 'PROOF_RETURN.json', {'status': 'BOUNDED_B12_PROOF_COMPLETE', 'results': results, 'performed': performed,
        'candidate': candidate, 'sourcePostimageSha256': sha(RAW / 'SOURCE_POSTIMAGE.json'),
        'qualified': False, 'qualificationInventoriesCurrentForComposedFinal': False})
except Exception as error:
    save(RAW / 'PROOF_RETURN.json', {'status': 'FIRST_FAILURE_STOP', 'error': repr(error), 'results': results,
        'performed': performed, 'retry': False, 'qualified': False})
    raise
