"""Passive final-close custody and source correspondence, no runtime calls."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

A = Path(__file__).resolve().parent
X = A.parent
S = Path('/Users/jim/src/apps/abiogenesis-single-address-space')
read = lambda p: json.loads(p.read_text())
sha = lambda b: hashlib.sha256(b).hexdigest()
now = datetime.now(timezone.utc).isoformat()


def pin(p):
    b = p.read_bytes()
    return {'path': str(p), 'bytes': len(b), 'sha256': sha(b)}


def write(p, value):
    with p.open('x') as f:
        f.write(json.dumps(value, indent=2) + '\n')


resume_path = A / 'execution/after-run-resume.json'
if not resume_path.is_file():
    print('{"status":"ACTUAL_FINAL_CLOSE_PENDING"}')
    raise SystemExit(0)
resume = read(resume_path)
inherited_recovery = resume.get('readbackRecovery')
current_outcome = A / 'execution/calls/lifecycle-start.outcome.json'
recovery = inherited_recovery if inherited_recovery is not None and inherited_recovery.get('sourceOutcome', {}).get('path') == str(current_outcome) else None
if recovery is not None:
    recovery_complete = Path(recovery['root']) / 'RECOVERY_COMPLETE.json'
    assert read(recovery_complete)['status'] == 'ACTUAL_READBACK_AND_CONTINUATION_RECOVERED'
outcome = read(A / 'execution/outcome-summary.json')
fresh = read(A / 'execution/fresh-reads.json')
assert isinstance(fresh, list) and {r['memberKey'] for r in fresh} == {'run_result', 'run_replay'}
subject_path = X / 'native-09/review-subject-001/SUBJECT.json'
subject = read(subject_path)
prefix = resume['state']['closeHandoff']['prefix']
saved = datetime.fromtimestamp(resume_path.stat().st_mtime, timezone.utc).isoformat()
close = {'recordedUtc': now, 'kind': 'actual_final_close_coordinates',
         'actualResume': {**pin(resume_path), 'savedUtc': saved},
         'prefix': prefix, 'runRef': outcome['run']['ref'],
         'standing': ('Actual invocation close retained; missing fresh SDK readbacks completed in a separately selected recovery after host failure. No old close substituted or acceptance inferred.'
                      if recovery is not None else
                      'Actual dispatcher final close after fresh reads; no reconstructed authority or acceptance.')}
if recovery is not None:
    close['readbackRecovery'] = pin(recovery_complete)
elif inherited_recovery is not None:
    close['predecessorReadbackRecovery'] = inherited_recovery
rows = []
for item in subject['files']:
    b = (S / item['path']).read_bytes()
    equal = len(b) == item['bytes'] and sha(b) == item['sha256']
    rows.append({'path': item['path'], 'sha256': sha(b), 'bytes': len(b), 'equal': equal})
for name in ['return.json', 'readiness.json', 'progress.json']:
    rel = 'consolidation-scratch/native-09/' + name
    b = (S / rel).read_bytes()
    rows.append({'path': rel, 'sha256': sha(b), 'bytes': len(b),
                 'equal': b == (subject_path.parent / name).read_bytes()})
assert all(r['equal'] for r in rows), 'Source changed after native09 frozen return'
source = {'recordedUtc': now, 'kind': 'source_correspondence_after_actual_final_close',
          'subjectSha256': sha(subject_path.read_bytes()), 'count': len(rows),
          'allEqual': True, 'files': rows, 'accepted': False}
write(A / 'ACTUAL_FINAL_CLOSE_COORDINATES.json', close)
write(A / 'SOURCE_AFTER_FINAL_CLOSE.json', source)
print(json.dumps({'status': 'ACTUAL_FINAL_CLOSE_CAPTURED', 'savedUtc': saved,
                  'disposition': outcome['disposition'], 'sourceMatches': len(rows),
                  'resumeBytes': close['actualResume']['bytes'],
                  'closePrefixBytes': prefix['prefixLength'],
                  'coordinates': pin(A / 'ACTUAL_FINAL_CLOSE_COORDINATES.json'),
                  'source': pin(A / 'SOURCE_AFTER_FINAL_CLOSE.json')}))
