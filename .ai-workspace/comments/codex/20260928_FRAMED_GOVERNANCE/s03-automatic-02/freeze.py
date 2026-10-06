import datetime
import hashlib
import json
from pathlib import Path

repo = Path('/Users/jim/src/apps/abiogenesis')
proof = repo / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s03-automatic-02'
prior = proof.parent / 's03-automatic-01'
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def save(name, value):
    with (proof / name).open('x') as out:
        out.write(json.dumps(value, indent=2) + '\n')
assert digest(prior / 'phase-b-freeze.json') == 'c938b1584d20b64a882b54bb8a60e185826312f275dd3c981a1fd4dc6c51f6a6'
assert digest(prior / 'phase-b-return.md') == '5621d8dfed985372f2d3fa2358eea7b86c4c2e0d4fb163dde8c3bbd87a3fdbcf'
assert digest(proof / 'request.txt') == '152124234da9e342c6666cd2cef88c1950fbc33257835454c66d195fb46861c4'
activation = json.loads((proof / 'activation.json').read_text())
for row in activation['preimages']:
    assert digest(repo / row['preimage']) == row['sha256']
source_records = json.loads((proof / 'source-identities.json').read_text())
for row in source_records:
    assert Path(row['path']).stat().st_size == row['bytes'] and digest(Path(row['path'])) == row['sha256']
preserved = []
for row in json.loads((prior / 'phase-a-freeze.json').read_text())['records']:
    if row['path'].endswith('/support/t287-s03-automatic.mjs'):
        assert digest(proof / 'preimages/t287-s03-automatic.mjs') == row['sha256']
        continue
    path = repo / row['path']
    assert path.stat().st_size == row['bytes'] and digest(path) == row['sha256']
    preserved.append(row['path'])
result = json.loads((proof / 'installed-result.json').read_text())
assert result['status'] == 'candidate_ready' and result['calls'] == 7
handoff = json.loads((proof / 'final-handoff.json').read_text())
assert handoff == result['handoff']
live = Path(result['final']['path'])
live_bytes = live.read_bytes()
snapshot = (proof / 'final-native-prefix.jsonl').read_bytes()
original = (prior / 'failed-native-prefix.jsonl').read_bytes()
assert live_bytes == snapshot and live_bytes.startswith(original)
assert hashlib.sha256(original).hexdigest() == 'c00b129cb95ec9d89d8f73e3f40fe85eeb646001616bfe100a7fee75f4b7d564'
assert len(live_bytes) == 4689421 and digest(live) == 'e7f7de0e3fd801436b3e3d559e7fdb1bc41a54d52ce57c2505afd3f9ae863f59'
info = live.stat()
assert info.st_dev == 16777230 and info.st_ino == 463811526
assert info.st_mtime * 1000 == result['final']['mtimeMs']
assert not Path(result['final']['lockPath']).exists()
process = json.loads((proof / 'remaining-process-result.json').read_text())
assert process['exit_code'] == 0 and process['owned_process'] == 'exited and reaped'
final_state = {'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'mutable_resource': result['final'], 'snapshot': {'path': 'final-native-prefix.jsonl', 'bytes': len(snapshot), 'sha256': hashlib.sha256(snapshot).hexdigest()}, 'original_prefix_preserved': {'path': '../s03-automatic-01/failed-native-prefix.jsonl', 'bytes': len(original), 'sha256': hashlib.sha256(original).hexdigest()}, 'original_handoff_unchanged': digest(prior / 'latest-handoff.json'), 'final_handoff_sha256': digest(proof / 'final-handoff.json'), 'quiescence': {'same_identity_bytes_and_mtime_as_closed_driver': True, 'owner_lock': 'absent', 'owned_process': process, 'host_wide_processes': 'indeterminate; retained ps denial, no additional attempt'}, 'unchanged_phase_a_records': preserved, 'deliberate_source_successor': source_records[0], 'prior_resource_exception': 'Only authorized ordinary owner reopen/read/close and one new no-action invocation; prior snapshots and metadata remain unchanged'}
save('final-resource-state.json', final_state)
records = []
for path in sorted(proof.rglob('*')):
    if path.is_file() and path.name != 'freeze.json':
        records.append({'path': str(path.relative_to(proof)), 'bytes': path.stat().st_size, 'sha256': digest(path)})
manifest = {'status': 'CLOSED', 'work_result': 'candidate_ready', 'activation': activation['activation'], 'frozen_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'return': {'path': 'return.md', 'sha256': digest(proof / 'return.md')}, 'sources': source_records, 'predecessor': {'freeze': '../s03-automatic-01/phase-b-freeze.json', 'sha256': digest(prior / 'phase-b-freeze.json'), 'scope': 'Reuse accepted immutable inventories; live event resource deliberately succeeds its initial prefix; prior source support preserved as preimage'}, 'resource': final_state, 'records': records, 'exclusions': ['freeze.json self-exclusion', 'Mutable live event resource and existing owner lock namespace: identified in resource, snapshot frozen separately', 'Unchanged prior installs/cache: reused dependency, no new inventory or cache mutation']}
save('freeze.json', manifest)
for row in records:
    path = proof / row['path']
    assert path.stat().st_size == row['bytes'] and digest(path) == row['sha256']
print(json.dumps({'status': 'CLOSED', 'work_result': 'candidate_ready', 'records_verified': len(records), 'return_sha256': digest(proof / 'return.md'), 'freeze_sha256': digest(proof / 'freeze.json'), 'final_prefix_sha256': digest(proof / 'final-native-prefix.jsonl'), 'final_handoff_sha256': digest(proof / 'final-handoff.json'), 'support_sha256': source_records[0]['sha256']}, indent=2))
