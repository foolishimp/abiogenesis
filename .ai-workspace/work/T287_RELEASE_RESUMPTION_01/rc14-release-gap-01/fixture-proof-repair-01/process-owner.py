"""Finite Operator process owner for external proof commands, not Product law."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import time


def write(path, value):
    with Path(path).open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')


def group_exists(pid):
    try:
        os.killpg(pid, 0)
        return True
    except ProcessLookupError:
        return False


def stop_group(pid):
    sent = []
    for sig in (signal.SIGTERM, signal.SIGKILL):
        try:
            os.killpg(pid, sig)
            sent.append(sig.name)
        except ProcessLookupError:
            break
        until = time.monotonic() + 5
        while group_exists(pid) and time.monotonic() < until:
            time.sleep(.05)
    return {'signals': sent, 'processGroupAbsent': not group_exists(pid)}


def run(directory, argv, cwd, environment, timeout_seconds, max_bytes, campaign_deadline):
    directory = Path(directory)
    directory.mkdir()
    started = time.monotonic()
    deadline = min(started + timeout_seconds, campaign_deadline)
    assert deadline > started, 'campaign deadline elapsed before command'
    write(directory / 'START.json', {'argv': argv, 'cwd': str(cwd), 'startedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'commandBudgetMs': round((deadline-started)*1000), 'maxOutputBytes': max_bytes, 'environmentKeys': sorted(environment)})
    reason = None
    with (directory/'stdout.raw').open('xb') as out, (directory/'stderr.raw').open('xb') as err:
        child = subprocess.Popen(argv, cwd=cwd, env=environment, stdin=subprocess.DEVNULL, stdout=out, stderr=err, start_new_session=True)
        write(directory/'PID.json', {'pid': child.pid, 'processGroup': child.pid})
        try:
            while child.poll() is None:
                if time.monotonic() >= deadline:
                    reason = 'deadline'
                    break
                if out.tell() + err.tell() > max_bytes:
                    reason = 'output_bound'
                    break
                time.sleep(.1)
        finally:
            cleanup = stop_group(child.pid) if reason or group_exists(child.pid) else {'signals': [], 'processGroupAbsent': True}
            try:
                code = child.wait(timeout=5)
            except subprocess.TimeoutExpired:
                code = None
        if out.tell() + err.tell() > max_bytes:
            reason = reason or 'output_bound'
    result = {'exitCode': code, 'stopReason': reason, 'elapsedMs': round((time.monotonic()-started)*1000), 'cleanup': cleanup,
              'scope': 'This command process group only; no global descendant-absence claim.'}
    for name in ['stdout.raw', 'stderr.raw']:
        data = (directory/name).read_bytes()
        result[name] = {'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
    write(directory/'RETURN.json', result)
    assert code == 0 and reason is None and cleanup['processGroupAbsent'], str(directory) + ': ' + json.dumps(result)
    return result
