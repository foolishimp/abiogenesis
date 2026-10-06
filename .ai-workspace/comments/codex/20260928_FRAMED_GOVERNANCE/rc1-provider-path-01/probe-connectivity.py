import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

output = Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/rc1-provider-path-01')
host = 'api.anthropic.com'
dns_source = "import socket,json; print(json.dumps({'host':'api.anthropic.com','addresses':sorted({a[4][0] for a in socket.getaddrinfo('api.anthropic.com',443,type=socket.SOCK_STREAM)})}))"
probes = [
    ('dns', [sys.executable, '-c', dns_source]),
    ('https-head', ['/usr/bin/curl', '--head', '--silent', '--show-error', '--connect-timeout', '5',
                    '--max-time', '10', '--write-out', '\nhttp_code=%{http_code}\nremote_ip=%{remote_ip}\ntime_total=%{time_total}\n',
                    'https://api.anthropic.com/']),
]
total_start = time.monotonic()
records = []
for label, command in probes:
    start = time.monotonic()
    record = {'label': label, 'host': host, 'command': command, 'cwd': str(Path.cwd()),
              'observedAt': datetime.now(timezone.utc).isoformat(), 'timeoutSeconds': 10,
              'authenticated': False, 'modelDispatch': False}
    try:
        completed = subprocess.run(command, cwd=Path.cwd(), capture_output=True, text=True, timeout=10)
        record.update({'exitCode': completed.returncode, 'stdout': completed.stdout, 'stderr': completed.stderr})
    except subprocess.TimeoutExpired as error:
        record.update({'timedOut': True, 'stdout': (error.stdout or b'').decode(errors='replace') if isinstance(error.stdout, bytes) else error.stdout,
                       'stderr': (error.stderr or b'').decode(errors='replace') if isinstance(error.stderr, bytes) else error.stderr})
    record['elapsedMs'] = round((time.monotonic() - start) * 1000, 3)
    records.append(record)
    (output / (label + '-probe.json')).write_text(json.dumps(record, indent=2) + '\n')
    print(json.dumps(record, indent=2), flush=True)
summary = {'probeCount': len(records), 'externalProbeElapsedMs': round((time.monotonic() - total_start) * 1000, 3),
           'aggregateExternalBudgetSeconds': 60, 'individualBudgetSeconds': 10,
           'modelDispatches': 0, 'authChanges': 0, 'networkSettingChanges': 0, 'alternateRoutes': 0}
(output / 'probe-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
