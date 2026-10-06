from pathlib import Path
import datetime
import hashlib
import json
import os
import resource
import subprocess
import time

report = Path(__file__).resolve().parent
base = Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE')
node = base / 'final-candidate-construction-03/source-freeze/toolchain/bin/node'
node_pin = {'path': str(node), 'bytes': 86104016,
            'sha256': 'fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f', 'mode': 0o555}
assert node.is_file() and node.resolve() == node
assert node.stat().st_size == node_pin['bytes'] and (node.stat().st_mode & 0o777) == node_pin['mode']
with node.open('rb') as stream:
    assert hashlib.file_digest(stream, 'sha256').hexdigest() == node_pin['sha256']
environment = {'PATH': str(node.parent) + ':/usr/bin:/bin:/usr/sbin:/sbin',
               'HOME': str(report / 'home'), 'TMPDIR': str(report / 'tmp'), 'LANG': 'C', 'LC_ALL': 'C'}
invocations = [
    {'ordinal': 0, 'purpose': 'pinned mechanical tool identity', 'executable': str(node), 'args': ['--version'], 'timeoutMs': 30000},
    {'ordinal': 1, 'purpose': 'one complete published-owner readiness driver', 'executable': str(node),
     'args': [str(report / 'readiness-driver.mjs')], 'timeoutMs': 120000}]
with (report / 'command-invocations.json').open('x') as stream:
    json.dump({'kind': 'mechanical_command_invocations', 'tool': node_pin, 'cwd': str(report),
               'environment': environment, 'NODE_OPTIONS': None, 'heapOverride': None,
               'qualificationCommandsExecuted': 0, 'invocations': invocations}, stream, indent=2)
    stream.write('\n')
receipts = []
for command in invocations:
    before = time.monotonic()
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    stdout_path = report / ('node-version.stdout' if command['ordinal'] == 0 else 'readiness.stdout')
    stderr_path = report / ('node-version.stderr' if command['ordinal'] == 0 else 'readiness.stderr')
    timed_out = False
    with stdout_path.open('xb') as stdout, stderr_path.open('xb') as stderr:
        try:
            result = subprocess.run([command['executable'], *command['args']], cwd=report,
                                    env=environment, stdin=subprocess.DEVNULL, stdout=stdout, stderr=stderr,
                                    timeout=command['timeoutMs'] / 1000)
            status = result.returncode
        except subprocess.TimeoutExpired:
            timed_out = True
            status = None
    receipt = {**command, 'startedAt': started, 'elapsedMs': (time.monotonic() - before) * 1000,
               'exitStatus': status, 'timedOut': timed_out, 'terminationConfirmed': True,
               'stdout': {'path': stdout_path.name, 'bytes': stdout_path.stat().st_size,
                          'sha256': hashlib.sha256(stdout_path.read_bytes()).hexdigest()},
               'stderr': {'path': stderr_path.name, 'bytes': stderr_path.stat().st_size,
                          'sha256': hashlib.sha256(stderr_path.read_bytes()).hexdigest()}}
    receipts.append(receipt)
    if timed_out or status != 0:
        break
usage = resource.getrusage(resource.RUSAGE_CHILDREN)
with (report / 'command-receipts.json').open('x') as stream:
    json.dump({'kind': 'mechanical_command_receipts', 'commandsExecuted': len(receipts),
               'qualificationCommandsExecuted': 0, 'receipts': receipts,
               'childrenMaxRSSBytesMacOS': usage.ru_maxrss, 'childrenUserSeconds': usage.ru_utime,
               'childrenSystemSeconds': usage.ru_stime,
               'scope': 'version process and one Node readiness driver only'}, stream, indent=2)
    stream.write('\n')
for receipt in receipts:
    print(json.dumps({'ordinal': receipt['ordinal'], 'exitStatus': receipt['exitStatus'],
                      'timedOut': receipt['timedOut'], 'elapsedMs': receipt['elapsedMs']}))
if len(receipts) != 2 or any(row['timedOut'] or row['exitStatus'] != 0 for row in receipts):
    raise SystemExit(2)
