"""One Root-selected owner operation; retain private streams and public timing."""
from pathlib import Path
from datetime import datetime, timezone
import json, os, subprocess, sys, time

Q = Path(__file__).resolve().parent
mode = sys.argv[1]
assert mode in ('preflight', 'dispatch')
script = 'prepare-r1.mjs' if mode == 'preflight' else 'dispatch.mjs'
stem = 'PREFLIGHT' if mode == 'preflight' else 'HOST'
assert len(sys.argv) == (2 if mode == 'preflight' else 3)
for suffix in ('_LAUNCH.json', '_RESULT.json', '.stdout', '.stderr'):
    assert not (Q / (stem + suffix)).exists(), 'No automatic retry or overwrite'
profile = json.loads((Q / 'PROVIDER_PROFILE.json').read_text())
environment = dict(os.environ)
environment['NODE_OPTIONS'] = profile['runtimeEnvironment']['NODE_OPTIONS']
argv = ['/opt/homebrew/Cellar/node/24.7.0/bin/node', str(Q / script)] + sys.argv[2:]
started = datetime.now(timezone.utc).isoformat()
timer = time.perf_counter()
os.umask(0o077)
with (Q / (stem + '.stdout')).open('x') as stdout, (Q / (stem + '.stderr')).open('x') as stderr:
    child = subprocess.Popen(argv, cwd=Q, env=environment, stdout=stdout, stderr=stderr)
    launch = {'startedUtc': started, 'pid': child.pid, 'mode': mode,
              'script': str(Q / script), 'automaticRetry': False}
    with (Q / (stem + '_LAUNCH.json')).open('x') as f:
        f.write(json.dumps(launch, indent=2) + '\n')
    print(json.dumps({'status': 'OWNER_SCRIPT_LAUNCHED', **launch}), flush=True)
    code = child.wait()
result = {'startedUtc': started, 'endedUtc': datetime.now(timezone.utc).isoformat(),
          'wallMs': (time.perf_counter() - timer) * 1000, 'exitCode': code}
with (Q / (stem + '_RESULT.json')).open('x') as f:
    f.write(json.dumps(result, indent=2) + '\n')
print(json.dumps({'status': 'OWNER_SCRIPT_RETURNED', 'mode': mode, **result}), flush=True)
sys.exit(code)
