from pathlib import Path
import hashlib, json, os, signal, subprocess, sys, time

D = Path(__file__).resolve().parent
configuration = json.loads((D / 'commands.json').read_text())
activation = json.loads((D / 'activation.json').read_text())
assert activation['operation'] == 'T287_G1_FINDING_CONSERVATION_REALIZATION_01'
label = sys.argv[1]
assert label in configuration['commands']
command = configuration['commands'][label]
cap = activation['budgetsSeconds'][label]
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def save(name, value):
    with (D / name).open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')

env = dict(os.environ)
for key in ['NODE_OPTIONS', 'NODE_PATH', 'V8_OPTIONS']:
    env.pop(key, None)
env['PATH'] = str(Path(configuration['node']).parent) + ':/usr/bin:/bin:/usr/sbin:/sbin'
env['TMPDIR'] = str(D / 'tmp')
record = {'operation': activation['operation'], 'command': command,
          'cwd': configuration['stage'], 'effectTerritory': str(D), 'capSeconds': cap,
          'HOMEUnchanged': env.get('HOME') == activation['HOME'], 'defaultHeap': True,
          'environment': {'PATH': env['PATH'], 'TMPDIR': env['TMPDIR']}}
assert record['HOMEUnchanged']
assert not (D / (label + '.json')).exists()
save(label + '.started.json', record)
start = time.monotonic()
timedout = False
with (D / (label + '.stdout')).open('x') as out, (D / (label + '.stderr')).open('x') as err:
    child = subprocess.Popen(command, cwd=configuration['stage'], env=env,
                             stdout=out, stderr=err, start_new_session=True)
    save(label + '.process-start.json', {'pid': child.pid, 'pgid': child.pid,
                                       'streamsOpenedBeforeSpawn': True})
    def collect(deadline):
        while True:
            pid, status, usage = os.wait4(child.pid, os.WNOHANG)
            if pid:
                return status, usage
            if time.monotonic() >= deadline:
                return None
            time.sleep(0.025)
    result = collect(start + cap)
    if result is None:
        timedout = True
        try:
            os.killpg(child.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        result = collect(time.monotonic() + activation['budgetsSeconds']['terminationGrace'])
        if result is None:
            try:
                os.killpg(child.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            _, status, usage = os.wait4(child.pid, 0)
            result = status, usage
    status, usage = result
    code = os.waitstatus_to_exitcode(status)
    child.returncode = code
try:
    os.killpg(child.pid, 0)
    group_absent = False
except ProcessLookupError:
    group_absent = True
record.update(pid=child.pid, pgid=child.pid, exitCode=code, timedOut=timedout,
              wait4Reaped=True, wait4Status=status, groupAbsent=group_absent,
              elapsedMs=(time.monotonic() - start) * 1000,
              userCPUSeconds=usage.ru_utime, systemCPUSeconds=usage.ru_stime,
              maxRSSPlatformBytes=usage.ru_maxrss,
              stdoutSHA256=sha(D / (label + '.stdout')),
              stderrSHA256=sha(D / (label + '.stderr')))
save(label + '.json', record)
print(json.dumps(record), flush=True)
if timedout or not group_absent or code != (1 if label == 'preimage' else 0):
    raise SystemExit(1)
