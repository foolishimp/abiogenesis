from pathlib import Path
import json, os, subprocess, time
D = Path(__file__).resolve().parent
fixtures = json.loads((D / 'staging-fixtures.json').read_text())
env = dict(os.environ, TMPDIR=str(D / 'tmp'), NODE_OPTIONS='', PYTHONDONTWRITEBYTECODE='1',
           ABG_QUALIFICATION_STAGE_FIXTURES=str(D / 'staging-fixtures.json'),
           ABG_QUALIFICATION_SOURCE_ROOT=fixtures['retainedRC1']['sourceRoot'],
           ABG_QUALIFICATION_RELEASE_ROOT=fixtures['retainedRC1']['releaseRoot'],
           ABG_QUALIFICATION_RETAIN_TEST_SCRATCH='1')
command = ['node', '--test', str(D / 'copied-tenant/test_env/tests/t287-qualification-law.test.mjs')]
start = time.monotonic()
p = subprocess.Popen(command, cwd=D / 'copied-tenant', env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
timed_out = False
try:
    out, err = p.communicate(timeout=120)
except subprocess.TimeoutExpired:
    timed_out = True
    p.terminate()
    try:
        out, err = p.communicate(timeout=1)
    except subprocess.TimeoutExpired:
        p.kill()
        out, err = p.communicate()
result = {'command': command, 'cwd': str(D / 'copied-tenant'), 'taskTMPDIR': env['TMPDIR'],
          'pid': p.pid, 'elapsedMs': (time.monotonic() - start) * 1000,
          'exitCode': p.returncode, 'timedOut': timed_out, 'nativeCalls': 0, 'providerCalls': 0,
          'scope': 'Only focused copied-tenant qualification law tests; no build or live generator writes'}
(D / 'logs/focused-tests.stdout').write_bytes(out)
(D / 'logs/focused-tests.stderr').write_bytes(err)
(D / 'logs/focused-tests.process.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
print(out.decode(errors='replace'))
print(err.decode(errors='replace'))
raise SystemExit(1 if timed_out else p.returncode)
