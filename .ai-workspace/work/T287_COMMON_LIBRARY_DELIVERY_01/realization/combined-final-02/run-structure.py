import datetime, json, os, subprocess, sys, time
from common import WORK, digest, write

assert not (WORK / 'first-cause.json').exists()
assert json.loads((WORK / 'commands/payload.result.json').read_text())['exitCode'] == 0
request = json.loads((WORK / 'commands/payload.request.json').read_text())
request.update(label='structure', argv=[request['argv'][0], str(WORK / 'verify-structure.mjs')],
               verification_script_sha256=digest(WORK / 'verify-structure.mjs'),
               runner_sha256=digest(WORK / 'run-structure.py'),
               startedUtc=datetime.datetime.now(datetime.timezone.utc).isoformat())
write('commands/structure.request.json', request)
started = time.monotonic()
with (WORK / 'commands/structure.stdout').open('xb') as out, (WORK / 'commands/structure.stderr').open('xb') as err:
    result = subprocess.run(request['argv'], cwd=request['cwd'], env=request['environment'], stdout=out, stderr=err)
receipt = {'label': 'structure', 'exitCode': result.returncode, 'wallMs': (time.monotonic() - started) * 1000,
           'completedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat()}
for stream in ['stdout', 'stderr']:
    path = WORK / ('commands/structure.' + stream)
    receipt[stream] = {'bytes': path.stat().st_size, 'sha256': digest(path)}
write('commands/structure.result.json', receipt)
if result.returncode:
    write('first-cause.json', {'kind': 'first_unexpected_combined_build_correspondence_failure',
                             'request': request, 'receipt': receipt, 'disposition': 'Stopped without retry or repair'})
    print((WORK / 'commands/structure.stderr').read_text())
print(json.dumps(receipt), flush=True)
sys.exit(result.returncode)
