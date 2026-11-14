"""Launch only after Root supplies the exact pushed control/preflight acceptance."""
import datetime, json, os, pathlib, subprocess, sys
from bounded import inventory, run, save, sha

CONTROL = pathlib.Path(__file__).resolve().parent
ACT = json.loads((CONTROL / 'ACTIVATION.json').read_text())
SOURCE = pathlib.Path(ACT['sourceWorktree']); RAW = pathlib.Path(ACT['rawRoot'])
assert len(sys.argv) == 2, 'One explicit Root-accepted launch binding is required'
binding_path = pathlib.Path(sys.argv[1]).resolve()
binding = json.loads(binding_path.read_text())
assert binding['activation'] == ACT['id'] and binding['rootAcceptanceRef']
assert binding['topologyObserver']['rootAcceptanceRef']
assert sha(pathlib.Path(binding['topologyObserver']['path'])) == binding['topologyObserver']['sha256']
def git(*args):
    return subprocess.run(['/usr/bin/git', *args], cwd=SOURCE, capture_output=True, text=True, timeout=30, check=True).stdout.strip()
head = binding['sourceHead']; assert len(head) == 40 and git('rev-parse', 'HEAD') == head
assert git('symbolic-ref', 'HEAD') == 'refs/heads/' + ACT['sourceBranch']
assert git('status', '--porcelain=v1', '--untracked-files=all') == '', 'pushed controls must be clean before author'
tenant = 'build_tenants/abiogenesis/typescript'
assert git('rev-parse', head + ':' + tenant) == git('rev-parse', '526b698beb69e07f52b3d7ade8b8c4a49d7d2de7:' + tenant)
required = {'ACTIVATION.json', 'TASK.json', 'HOST.mjs', 'operate.py', 'bounded.py', 'prove.py', 'candidate.mjs', 'events-reporter.mjs', 'PROOF_SCHEDULE.json'}
assert required <= {pathlib.Path(row['path']).name for row in binding['controlFiles']}
for row in binding['controlFiles']: assert sha(SOURCE / row['path']) == row['sha256'], row['path']
scratch = ACT['nativeWriteScope'][-1]
rows = inventory(SOURCE, exclude=(scratch,))
save(RAW / 'SOURCE_PREIMAGE.json', {'sourceHead': head, 'source': str(SOURCE), 'rows': rows, 'excludedScratch': scratch})
start = datetime.datetime.now(datetime.timezone.utc)
deadline = start + datetime.timedelta(milliseconds=ACT['limits']['hostControlDeadlineMs'])
save(RAW / 'CONTROL_START.json', {'sourceHead': head, 'launchBinding': {'path': str(binding_path), 'sha256': sha(binding_path)},
    'startedUtc': start.isoformat(), 'deadlineUtc': deadline.isoformat(), 'providerCallsAtMost': 1, 'oldCampaignClockReused': False})
env = {k: v for k, v in os.environ.items() if k in ['HOME', 'PATH', 'LANG', 'LC_ALL', 'CLAUDE_CODE_OAUTH_TOKEN']}
env.update({'HOME': '/Users/jim', 'PATH': '/Users/jim/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    'TMPDIR': str(RAW / 'host-scratch/tmp'), 'NODE_OPTIONS': '--max-old-space-size=8192',
    'GIT_OPTIONAL_LOCKS': '0', 'ABG_B12_LAUNCH_BINDING': str(binding_path)})
try:
    result = run(RAW / 'host-control', ['/opt/homebrew/bin/node', str(CONTROL / 'HOST.mjs')], SOURCE, env,
        deadline, ACT['limits']['hostControlDeadlineMs'], ACT['limits']['outputBytesPerCommand'])
    save(RAW / 'HOST_RETURN.json', result)
except Exception as error:
    save(RAW / 'OPERATOR_FIRST_FAILURE.json', {'error': repr(error), 'providerCountAuthority': 'runtime/FINAL.json and native actor owner evidence', 'retry': False})
    raise
