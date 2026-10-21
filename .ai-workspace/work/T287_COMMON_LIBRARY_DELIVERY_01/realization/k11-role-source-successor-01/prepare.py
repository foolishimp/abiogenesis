from pathlib import Path
import datetime, hashlib, json, os, shutil, stat

root = Path('/Users/jim/src/apps/abiogenesis')
work = Path(__file__).resolve().parent
pure = work.parent / 'pure'
tenant = Path('build_tenants/abiogenesis/typescript')
allowed = [str(tenant / 'code/src/gtl/stdo_run_environment.ts'), str(tenant / 'test_env/tests/t287-stdo3-run-environment.test.mjs')]

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
        for key in ['sha256', 'bytes', 'mode', 'target']:
            if key in expected:
                assert expected[key] == observed.get(key), (str(base), expected['path'], key, expected[key], observed.get(key))

def write(name, value):
    path = work / name
    assert not path.exists(), str(path)
    path.write_text(json.dumps(value, indent=2) + '\n')

pins = {
    'build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md': 'cb8dae9f7e684f9b6be730b74125294524ecd7e4d1f035fc03734d7ff1d1160b',
    '.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/L2-execution-contract.md': '65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1',
    str((pure / 'freeze.json').relative_to(root)): 'ce01cdb084f5b0c3827ac9cce481d12e63193a24a1467c9409c9be9a768acca4',
    str((pure / 'report.md').relative_to(root)): '1f2cd5fa046cf39ea42de3ed5022c2b874f814627176664c962143e6ca784b7c',
}
for rel, digest in pins.items():
    assert hashlib.sha256((root / rel).read_bytes()).hexdigest() == digest, rel
definition = json.loads((root / 'stdo_abiogenesis.json').read_text())
assert definition['constitution']['stdo']['basis'] == {'uri': 'stdo://releases/v3.0.0-rc.1/', 'manifest_sha256': '069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232'}
assert definition['composition'] == []
freeze = json.loads((pure / 'freeze.json').read_text())
verify(root, freeze['owned_outputs'] + freeze['records'])
expected = {r['path']: r for name in ['stage-inputs-02.json', 'generated-output-inventory.json'] for r in json.loads((pure / name).read_text())['files']}
deps = json.loads((pure / 'toolchain-and-dependencies.json').read_text())['files']
for dep in deps:
    dep = dict(dep)
    dep['path'] = str(tenant / dep['path'])
    expected[dep['path']] = dep
assert len(expected) == 6632
verify(pure / 'stage', expected.values())
old_stage = inventory(pure / 'stage')
assert {r['path'] for r in old_stage} == set(expected)
verify(root, json.loads((pure / 'protected-main-generated.json').read_text())['files'])
main_generated = [row(root / r['path'], r['path']) for r in json.loads((pure / 'protected-main-generated.json').read_text())['files']]
assert len(main_generated) == 936
sources = ['AGENTS.md', 'README.md', 'specification/GOALS.md', 'specification/INTENT.md', 'specification/PRODUCT.md',
           'specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md', 'stdo_abiogenesis.json',
           'build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md',
           'build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md',
           '.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md',
           str(tenant / 'test_env/support/stdo3-run-environment.mjs'),
           str(tenant / 'test_env/support/stdo-environment-pilot.mjs'),
           str(tenant / 'test_env/support/native-registered-selection.mjs'),
           str(tenant / 'test_env/support/default-library.mjs'),
           str(tenant / 'test_env/tests/t287-management-context.test.mjs'),
           *pins.keys(), *allowed]
for rel in dict.fromkeys(sources):
    target = work / 'preimages' / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / rel, target)
write('inputs.json', {'created_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'writer': 'K11-ROLE-SOURCE-SUCCESSOR-01',
      'before_production_edits': True, 'sources': [row(root / rel, rel) for rel in dict.fromkeys(sources)],
      'how': [row(work / name, name) for name in ['L2-supplement.md', 'activation.md']], 'pins': pins,
      'pure_frozen_rows_verified': len(freeze['owned_outputs']) + len(freeze['records']), 'allowed_main_edits': allowed})
write('old-stage-inventory.json', {'files': old_stage})
write('protected-main-generated.json', {'files': main_generated})
write('protected-old-records.json', {'files': [row(root / r['path'], r['path']) for r in freeze['owned_outputs'] + freeze['records'] if r['path'] not in allowed]})
assert not (work / 'stage').exists()
shutil.copytree(pure / 'stage', work / 'stage', symlinks=True, copy_function=shutil.copy2)
copied = inventory(work / 'stage')
assert copied == old_stage
write('stage-copy.json', {'source': str(pure / 'stage'), 'destination': str(work / 'stage'), 'copy_mode': 'independent files; preserve only declared relative dependency symlinks',
      'entries': len(copied), 'dependency_entries': len(deps), 'copied_exact': True,
      'physical_root_is_distinct': (work / 'stage').resolve() != (pure / 'stage').resolve()})
print(json.dumps({'inputs': 'inputs.json', 'stage_entries': len(copied), 'dependencies': len(deps), 'protected_main_generated': len(main_generated)}))
