"""Finite Operator subprocess custody; no Product or provider policy."""
import datetime, hashlib, json, os, pathlib, signal, subprocess, time

def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x') as out:
        json.dump(value, out, indent=2); out.write('\n')

def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''): h.update(block)
    return h.hexdigest()

def inventory(root, exclude=()):
    rows = []
    for folder, dirs, files in os.walk(root, followlinks=False):
        here = pathlib.Path(folder)
        dirs[:] = [n for n in dirs if (here / n).relative_to(root).as_posix() not in exclude and n != '.git']
        for name in sorted(dirs + files):
            path = here / name; relative = path.relative_to(root).as_posix()
            if relative == '.git' or relative in exclude: continue
            if path.is_symlink(): rows.append({'path': relative, 'link': os.readlink(path)})
            elif path.is_file(): rows.append({'path': relative, 'bytes': path.stat().st_size, 'sha256': sha(path)})
    return sorted(rows, key=lambda row: row['path'])

def group_exists(pid):
    try: os.killpg(pid, 0); return True
    except ProcessLookupError: return False

def cleanup(pid):
    sent = []
    for sig in (signal.SIGTERM, signal.SIGKILL):
        try: os.killpg(pid, sig); sent.append(sig.name)
        except ProcessLookupError: break
        until = time.monotonic() + 5
        while group_exists(pid) and time.monotonic() < until: time.sleep(.05)
    return {'signals': sent, 'ownedProcessGroupAbsent': not group_exists(pid),
            'scope': 'Owned command process group only; native owner supplies its separate actor cleanup facts.'}

def run(folder, command, cwd, env, deadline, cap_ms, max_bytes, extra_outputs=()):
    folder.mkdir(parents=True, exist_ok=False)
    remaining = (deadline - datetime.datetime.now(datetime.timezone.utc)).total_seconds()
    if remaining <= 15: raise RuntimeError('Insufficient original deadline for command and finite cleanup')
    timeout = min(cap_ms / 1000, remaining - 15)
    save(folder / 'request.json', {'command': command, 'cwd': str(cwd), 'environmentKeys': sorted(env),
        'deadlineUtc': deadline.isoformat(), 'timeoutMs': round(timeout * 1000), 'maxOutputBytes': max_bytes})
    started = time.monotonic(); reason = None; code = None; pid = None
    closed = {'signals': [], 'ownedProcessGroupAbsent': True}
    with (folder / 'stdout.raw').open('xb') as out, (folder / 'stderr.raw').open('xb') as err:
        try:
            child = subprocess.Popen(command, cwd=cwd, env=env, stdin=subprocess.DEVNULL,
                stdout=out, stderr=err, start_new_session=True)
            pid = child.pid; save(folder / 'pid.json', {'pid': pid, 'processGroup': pid})
            while child.poll() is None:
                if time.monotonic() - started >= timeout: reason = 'command_deadline'; break
                size = out.tell() + err.tell() + sum(p.stat().st_size for p in extra_outputs if p.exists())
                if size > max_bytes: reason = 'output_limit'; break
                time.sleep(.2)
            if reason or group_exists(pid): closed = cleanup(pid)
            try: code = child.wait(timeout=5)
            except subprocess.TimeoutExpired: reason = reason or 'wait_unconfirmed'
        except Exception as error:
            reason = 'launch_or_control_failure: ' + repr(error)
            if pid is not None: closed = cleanup(pid)
    result = {'exitCode': code, 'stopReason': reason, 'wallMs': round((time.monotonic() - started) * 1000), 'cleanup': closed}
    for path in [folder / 'stdout.raw', folder / 'stderr.raw', *extra_outputs]:
        if path.exists(): result[str(path)] = {'bytes': path.stat().st_size, 'sha256': sha(path)}
    save(folder / 'result.json', result)
    print(json.dumps({'command': folder.name, 'exitCode': code, 'stopReason': reason, 'wallMs': result['wallMs']}), flush=True)
    if code != 0 or reason or not closed['ownedProcessGroupAbsent']:
        raise RuntimeError('First command failure: ' + str(folder / 'result.json'))
    return result
