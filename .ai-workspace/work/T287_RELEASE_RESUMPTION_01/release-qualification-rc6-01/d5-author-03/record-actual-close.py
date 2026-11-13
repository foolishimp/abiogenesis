"""Reuse predecessor passive close custody; N3 reports only its selected37-test qualification lane. No runtime mutation."""
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlparse, unquote
import hashlib, json, re, sys

A = Path(__file__).resolve().parent
C = Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut')
def read(p): return json.loads(p.read_text())
def digest(p):
    h = hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda: f.read(1048576), b''): h.update(b)
    return h.hexdigest()
def pin(p): return {'path': str(p), 'bytes': p.stat().st_size, 'sha256': digest(p)}

assert len(sys.argv) == 2 and re.fullmatch(r'd5c-[a-z0-9-]+', sys.argv[1])
label = sys.argv[1]
assert not (A / 'FINAL_RUNTIME_CLOSE.json').exists()
host = read(A / 'HOST_RESULT.json')
assert host['exitCode'] == 0
outcome = read(A / 'execution/outcome-summary.json')
fresh = {x['memberKey']: x for x in read(A / 'execution/fresh-reads.json')}
resume = read(A / 'execution/after-run-resume.json')
subject_path = A / 'review-subject-001/SUBJECT.json'
subject = read(subject_path)
assert subject['status'] == 'OBSERVED_NATIVE_SOURCE_FROZEN_C2_PENDING'
terminal = outcome['terminal']
assert isinstance(terminal, dict) and terminal['result']['ref'] == subject['nativeResultRef']
assert terminal['result']['digest'] == subject['nativeResultDigest']
result = fresh['run_result']['projection']
replay = fresh['run_replay']['projection']
assert terminal == result['terminalResult'] == replay['terminalResult']
assert replay['status'] == 'closed'
assert outcome['run'] == result['subject'] == replay['subject']
for row in fresh.values():
    assert row['ownerOutput']['value']['projection'] == row['projection']
    assert row['source'] == outcome['run']
close = resume['state']['closeHandoff']
prefix = close['prefix']
log = Path(unquote(urlparse(prefix['eventLogRef']).path))
assert resume['state']['resource'] is None and resume['state']['selection'] is None
assert log.stat().st_size == prefix['prefixLength']
assert 'sha256:' + digest(log) == prefix['prefixDigest']
assert log.stat().st_ino == prefix['storeIdentity']['inode']
assert log.stat().st_dev == prefix['storeIdentity']['device']
assert close['reopenAuthority']['eventLogDigest'] == prefix['prefixDigest']
frozen = {f['path']: f for f in subject['files']}
for name, f in frozen.items():
    assert (C / name).stat().st_size == f['bytes'] and digest(C / name) == f['sha256'], name
for name in ('return.json', 'readiness.json', 'progress.json'):
    assert digest(C / 'qualification-scratch/d5-author-03' / name) == digest(subject_path.parent / name), name
stage_path = C / 'qualification-scratch/d5-author-03/tmp' / (label + '-stage.json')
lanes_path = stage_path.parent / (label + '-lanes-qualification/summary-qualification.json')
stage, lanes = read(stage_path), read(lanes_path)
assert stage['label'] == label and stage['sourceCount'] == len(stage['sources'])
for row in stage['sources']:
    f = frozen[row['path']]
    assert row['sha256'] == f['sha256'] and row['bytes'] == f['bytes'], row['path']
assert all(stage[k]['exitCode'] == 0 for k in ('compile', 'generate', 'lifecycle'))
assert [x['id'] for x in lanes] == ['qualification']
for lane in lanes:
    assert lane['tests'] >= lane['minimumTests']
    tap = lanes_path.parent / (lane['id'] + '.stdout.tap')
    assert tap.stat().st_size == lane['stdoutBytes'] and digest(tap) == lane['stdoutSha256']
returned = read(subject_path.parent / 'return.json')
assert returned['status'] == 'WORK_COMPLETE_WITH_EXPLICIT_RESIDUALS_NOT_ACCEPTED'
assert read(subject_path.parent / 'readiness.json')['readyForRootReview'] is True
assert sum(x['fail'] for x in lanes) == 0
assert sum(x['pass'] for x in lanes) == sum(x['tests'] for x in lanes) == 37
report = returned['qualificationLane']['result']
assert len(lanes) == 1
lane = lanes[0]
for key in ('exitCode', 'signal', 'error', 'ms', 'tests', 'pass', 'fail', 'skipped', 'cancelled', 'todo', 'minimumTests'):
    assert lane[key] == report[key], key
assert lane['stdoutBytes'] == returned['qualificationLane']['tap']['bytes']
assert lane['stdoutSha256'] == returned['qualificationLane']['tap']['sha256']
assert returned['finalSourceFreeze']['sourceDigest'] == stage['sourceDigest']
assert returned['finalSourceFreeze']['sourceCount'] == stage['sourceCount']
assert all(x[k] == 0 for x in lanes for k in ('skipped', 'cancelled', 'todo'))
record = {
    'kind': 'd5_native_author_actual_close', 'at': datetime.now(timezone.utc).isoformat(),
    'status': 'COMPLETED_SOURCE_RETURN_FROZEN_REVIEW_C2_UAT_PENDING', 'source': pin(subject_path),
    'run': outcome['run'], 'result': terminal['result'], 'replay': replay['replay'],
    'terminalValueDigest': terminal['valueDigest'], 'freshTerminalEqual': True,
    'freshReplayStatus': replay['status'], 'actualResume': pin(A / 'execution/after-run-resume.json'),
    'freshReads': pin(A / 'execution/fresh-reads.json'), 'prefix': prefix,
    'physicalPrefixVerified': True, 'allFrozenLiveMembersEqual': len(frozen),
    'authorStageSourceMatches': len(stage['sources']),
    'authorChecks': {'compileExit': 0, 'generateExit': 0, 'lifecycleGuardExit': 0,
                     'tests': sum(x['tests'] for x in lanes), 'pass': sum(x['pass'] for x in lanes),
                     'fail': sum(x['fail'] for x in lanes), 'skip': 0,
                     'stage': pin(stage_path), 'lanes': pin(lanes_path)},
    'nativeReturn': pin(subject_path.parent / 'return.json'),
    'nativeReadiness': pin(subject_path.parent / 'readiness.json'),
    'remaining': returned['gaps'] + ['Independent frozen source/proof review and actual affected C2/UAT pending'],
    'host': host,
    'limits': ['Actual completed native Run and source custody agree. Author checks are not affected C2/UAT or acceptance.',
               'All intermediate failures and prior accepted evidence retain their exact subjects.',
               'No Q23 production eligibility, formal independent acceptance, QR02/QR03, qualification or release closure.']
}
target = A / 'FINAL_RUNTIME_CLOSE.json'
with target.open('x') as f: f.write(json.dumps(record, indent=2) + '\n')
print(json.dumps({'status': record['status'], 'close': pin(target), 'prefixLength': prefix['prefixLength'],
                  'sourceMembers': len(frozen), 'authorChecks': record['authorChecks']['pass'], 'freshTerminalEqual': True}))
