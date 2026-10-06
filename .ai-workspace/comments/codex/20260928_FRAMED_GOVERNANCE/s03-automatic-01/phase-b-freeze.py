import datetime
import hashlib
import json
from pathlib import Path

repo = Path('/Users/jim/src/apps/abiogenesis')
proof = repo / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s03-automatic-01'
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
phase_a = json.loads((proof / 'phase-a-freeze.json').read_text())
assert sha(proof / 'phase-a-freeze.json') == 'f78255b3cbcfdb6f34751d2195886ffef9c0ad9f596d17bacec90fe7b5f4e2ae'
for row in phase_a['records']:
    path = repo / row['path']
    assert path.stat().st_size == row['bytes'] and sha(path) == row['sha256'], row['path']
activation = json.loads((proof / 'phase-b-activation.json').read_text())
for row in activation['readonly']:
    path = Path(row['path'])
    assert path.stat().st_size == row['bytes'] and sha(path) == row['sha256'], row['path']
resource = json.loads((proof / 'phase-b-resource-state.json').read_text())
actual = Path(resource['physical']['path'])
info = actual.stat()
assert info.st_dev == resource['physical']['device'] and info.st_ino == resource['physical']['inode']
assert info.st_size == resource['physical']['bytes'] and sha(actual) == resource['physical']['sha256']
assert not Path(resource['lock']['path']).exists()
assert not (proof / 'no-action').exists()
prior_files = {Path(row['path']).resolve() for row in activation['readonly']}
records = []
for path in sorted(proof.rglob('*')):
    relative = path.relative_to(proof)
    if relative.parts[0] == 'phase-b-npm-cache' or path.resolve() in prior_files or path.name == 'phase-b-freeze.json':
        continue
    if path.is_symlink():
        records.append({'path': str(relative), 'kind': 'symlink', 'target': str(path.readlink())})
    elif path.is_file():
        records.append({'path': str(relative), 'kind': 'file', 'bytes': path.stat().st_size, 'sha256': sha(path)})
manifest = {'status': 'CLOSED', 'work_result': 're_entry_requested', 'activation': activation['activation'], 'frozen_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'return': 'phase-b-return.md', 'return_sha256': sha(proof / 'phase-b-return.md'), 'phase_a_dependency': {'path': 'phase-a-freeze.json', 'sha256': sha(proof / 'phase-a-freeze.json'), 'records_reverified': len(phase_a['records'])}, 'request': activation['request'], 'physical_resource': resource['physical'], 'quiescence': {'owned_test_process': 'exited and reaped; PID probe absent', 'public_cli': 'returned', 'owner_lock': 'absent', 'bytes_identity': 'stable through freeze', 'host_wide_process_inventory': 'indeterminate; ps denied'}, 'excluded': [{'path': 'phase-b-npm-cache/', 'reason': 'Mutable npm cache, retained physically, not evidence'}, {'path': 'phase-b-freeze.json', 'reason': 'Self-exclusion; external SHA256 identifies this manifest'}, {'path': 'Phase A / request controls / other readonly inputs', 'reason': 'Bound by original freeze and activation dependency records, all reverified unchanged'}], 'records': records}
with (proof / 'phase-b-freeze.json').open('x') as output:
    output.write(json.dumps(manifest, indent=2) + '\n')
for row in records:
    path = proof / row['path']
    if row['kind'] == 'symlink':
        assert path.is_symlink() and str(path.readlink()) == row['target']
    else:
        assert path.stat().st_size == row['bytes'] and sha(path) == row['sha256'], row['path']
print(json.dumps({'status': 'CLOSED', 'work_result': manifest['work_result'], 'freeze': str(proof / 'phase-b-freeze.json'), 'freeze_sha256': sha(proof / 'phase-b-freeze.json'), 'return_sha256': manifest['return_sha256'], 'new_records_verified': len(records), 'phase_a_records_preserved': len(phase_a['records']), 'resource_bytes': info.st_size, 'owner_lock': 'absent'}, indent=2))
