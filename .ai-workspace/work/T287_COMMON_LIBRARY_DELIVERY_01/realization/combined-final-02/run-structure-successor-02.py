import datetime, json, subprocess, sys, time, traceback
from common import ROOT, WORK, digest, verify, write

label = 'structure-successor-02'
assert digest(WORK / 'first-cause.json') == 'a054de724d00abbdf8f1efe9438a6da9d342c55bde02cb8d858510e5856b08c9'
assert not (WORK / 'first-cause-structure-successor-02.json').exists()
assert not (WORK / f'commands/{label}.request.json').exists()
assert json.loads((WORK / 'commands/structure.result.json').read_text())['exitCode'] == 1
assert json.loads((WORK / 'commands/payload.result.json').read_text())['exitCode'] == 0
for expected in json.loads((WORK / 'stopped-records-structure-02.json').read_text())['files']:
    verify(ROOT / expected['path'], expected)
request = json.loads((WORK / 'commands/payload.request.json').read_text())
request.update(label=label, argv=[request['argv'][0], str(WORK / 'verify-structure-successor-02.mjs')],
    verification_script_sha256=digest(WORK / 'verify-structure-successor-02.mjs'),
    runner_sha256=digest(WORK / 'run-structure-successor-02.py'),
    grant='COMBINED-FINAL-STRUCTURE-02',
    HOW_sha256=digest(WORK / 'HOW-structure-successor-02.md'),
    reentry_sha256=digest(WORK / 'structure-reentry.json'),
    historical_first_cause_sha256=digest(WORK / 'first-cause.json'),
    startedUtc=datetime.datetime.now(datetime.timezone.utc).isoformat())
write(f'commands/{label}.request.json', request)
started = time.monotonic()
try:
    with (WORK / f'commands/{label}.stdout').open('xb') as out, (WORK / f'commands/{label}.stderr').open('xb') as err:
        result = subprocess.run(request['argv'], cwd=request['cwd'], env=request['environment'], stdout=out, stderr=err)
    receipt = {'label': label, 'exitCode': result.returncode, 'executions': 1,
        'wallMs': (time.monotonic() - started) * 1000,
        'completedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    for stream in ['stdout', 'stderr']:
        path = WORK / f'commands/{label}.{stream}'
        receipt[stream] = {'bytes': path.stat().st_size, 'sha256': digest(path)}
    write(f'commands/{label}.result.json', receipt)
    if result.returncode:
        write('first-cause-structure-successor-02.json', {
            'kind': 'first_unexpected_structural_successor_failure', 'request': request, 'receipt': receipt,
            'historicalFirstCauseUnchanged': digest(WORK / 'first-cause.json'),
            'disposition': 'Stopped without repair/retry or closure'})
        print((WORK / f'commands/{label}.stderr').read_text())
    print(json.dumps(receipt), flush=True)
except BaseException as failure:
    if not (WORK / 'first-cause-structure-successor-02.json').exists():
        write('first-cause-structure-successor-02.json', {
            'kind': 'first_unexpected_structural_successor_execution_failure', 'request': request,
            'errorType': type(failure).__name__, 'message': str(failure), 'traceback': traceback.format_exc(),
            'disposition': 'Stopped without repair/retry or closure'})
    raise
sys.exit(result.returncode)
