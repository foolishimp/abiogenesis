from pathlib import Path
import datetime, hashlib, json, os, shutil, stat, subprocess

root = Path('/Users/jim/src/apps/abiogenesis')
work = Path(__file__).resolve().parent
pure = work.parent / 'pure'
stage = work / 'stage'
tenant = 'build_tenants/abiogenesis/typescript/'

def row(path, relative):
    mode = oct(stat.S_IMODE(path.lstat().st_mode))
    if path.is_symlink():
        return {'path': relative, 'kind': 'symlink', 'target': os.readlink(path), 'mode': mode}
    data = path.read_bytes()
    return {'path': relative, 'kind': 'file', 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'mode': mode}

def inventory(base):
    return [row(path, str(path.relative_to(base))) for path in sorted(base.rglob('*')) if path.is_file() or path.is_symlink()]

def verify(base, rows):
    for expected in rows:
        observed = row(base / expected['path'], expected['path'])
        assert expected == observed, (str(base), expected['path'], expected, observed)

def write(name, value):
    path = work / name
    assert not path.exists(), str(path)
    path.write_text(json.dumps(value, indent=2) + '\n')

inputs = json.loads((work / 'inputs.json').read_text())
allowed = inputs['allowed_main_edits']
old_stage = json.loads((work / 'old-stage-inventory.json').read_text())['files']
assert inventory(pure / 'stage') == old_stage
protected = json.loads((work / 'protected-old-records.json').read_text())['files']
verify(root, protected)
protected_main = json.loads((work / 'protected-main-generated.json').read_text())['files']
verify(root, protected_main)
for rel, digest in inputs['pins'].items():
    assert hashlib.sha256((root / rel).read_bytes()).hexdigest() == digest
for expected in inputs['how']:
    assert row(work / expected['path'], expected['path']) == expected
for expected in inputs['sources']:
    assert row(work / 'preimages' / expected['path'], expected['path']) == expected
    if expected['path'] not in allowed:
        assert row(root / expected['path'], expected['path']) == expected
current = inventory(stage)
old = {r['path']: r for r in old_stage}
new = {r['path']: r for r in current}
assert old.keys() == new.keys()
changes = [p for p in old if old[p] != new[p]]
expected_changes = [*allowed, tenant + 'build/code/src/gtl/stdo_run_environment.js']
assert set(changes) == set(expected_changes), changes
for rel in allowed:
    assert row(root / rel, rel) == new[rel]
deps = [r for r in current if r['path'].startswith(tenant + 'node_modules/')]
assert len(deps) == 4576
assert deps == [r for r in old_stage if r['path'].startswith(tenant + 'node_modules/')]
assert not (stage / tenant / 'node_modules').is_symlink()
assert not any(path.name.startswith('t287-stdo3-') for path in (work / 'resources').iterdir()), 'focused test mirror cleanup incomplete'
old_result = json.loads((work / 'counterexample-old-result.json').read_text())
new_result = json.loads((work / 'counterexample-new-result.json').read_text())
assert [r['valueDigest'] for r in old_result['outcomes']] == [r['valueDigest'] for r in new_result['outcomes']]
assert all(r['specialization'] == 'accepted-same-value' for r in old_result['outcomes'])
assert all(r['specialization'] == 'TypeError' for r in new_result['outcomes'])
assert all(r['genericAcceptedSameValue'] for r in old_result['outcomes'] + new_result['outcomes'])
commands = sorted((work / 'commands').glob('*.json'))
assert len(commands) == 5
for command in commands:
    record = json.loads(command.read_text())
    assert record['returncode'] == 0, command
    for stream in ['stdout', 'stderr']:
        data = command.with_suffix('.' + stream).read_bytes()
        assert record[stream] == {'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
for name, count in [('04-focused-k11-constructors', 3), ('05-management-context-generic-negative', 1)]:
    output = (work / 'commands' / (name + '.stdout')).read_text()
    assert f'pass {count}\n' in output and 'fail 0\n' in output and 'skipped 0\n' in output
write('stage-output-inventory.json', {'files': current})
write('resources-inventory.json', {'scope': 'retained local constructor inputs and generic source-unavailable test resources; no Product install', 'files': inventory(work / 'resources')})
write('source-generated-correspondence.json', {'compiler_receipt': 'commands/02-isolated-typescript.json',
      'changes': [{'before': old[path], 'after': new[path]} for path in changes],
      'unchanged_entry_count': len(current) - len(changes), 'stage_entries': len(current),
      'generated_change_count': 1, 'generator_run': False, 'package_or_install_identity_claim': False,
      'explanation': 'Only the granted source and test plus the compiler-emitted STDO JavaScript differ from the pinned pure stage. Product manifest is intentionally unchanged; this constructor stage is not a new package or installed subject.'})
node = Path(shutil.which('node')).resolve()
write('toolchain.json', {'node': subprocess.check_output([str(node), '--version'], text=True).strip(),
      'node_executable': row(node, str(node)),
      'typescript': json.loads((stage / tenant / 'node_modules/typescript/package.json').read_text())['version'],
      'package_lock': row(stage / tenant / 'package-lock.json', tenant + 'package-lock.json'),
      'dependency_entries': len(deps), 'source': 'exact independent copy of pinned pure stage; no installation or network fallback'})
write('preservation.json', {'verified_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
      'pure_freeze_and_report_pins_preserved': True, 'accepted_library_design_and_L2_preserved': True,
      'pre_edit_how_preserved': True, 'preimages_verified': len(inputs['sources']),
      'old_pure_stage_entries_unchanged': len(old_stage), 'old_records_and_unaffected_owned_rows_unchanged': len(protected),
      'authorized_main_preimages_preserved': allowed, 'main_generated_bytes_and_modes_unchanged': len(protected_main),
      'new_stage_dependency_entries_unchanged': len(deps), 'new_stage_entries': len(current),
      'new_stage_only_changes': changes, 'focused_temporary_mirror_removed': True,
      'all_execution_receipts_exit_zero': len(commands), 'unexpected_integration_failures': 0,
      'runtime_admissions': 0, 'native_dispatches': 0, 'installed_workloads': 0, 'corpus_tool_launches': 0,
      'unconfirmed_physical_effects': [], 'git_operations': 0})
print(json.dumps({'stage_entries': len(current), 'stage_changes': changes, 'protected_main': len(protected_main),
      'unchanged_dependency_entries': len(deps), 'old_stage_unchanged': True, 'unexpected_failures': 0}))
