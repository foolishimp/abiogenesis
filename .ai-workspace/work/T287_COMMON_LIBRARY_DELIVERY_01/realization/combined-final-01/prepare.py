from pathlib import Path
import datetime, json, os, shutil, subprocess
from common import ROOT, WORK, DELIVERY, TENANT, digest, row, inventory, verify, write

PINS = {
    'pure': 'ce01cdb084f5b0c3827ac9cce481d12e63193a24a1467c9409c9be9a768acca4',
    'k11-role-source-successor-01': 'a1fe796ac076672cc2b8835f66b68c007ee1a41c374a62a6455ab75975ad446d',
    'lifetime': '5c7311ac1041a0ba766c89fc18c315cd3277ea3ebc2425a40e7ffff896764c4c',
    'lifetime-stream-repair-01': '8668dfa9ddbfb2fcfa860659e383e0527b009afb532e385e876384eba5b1b155',
    'currentness': '433107b89d8eb01cc5a67ad6c8543e18d37575d5f89ba490c3795108955e788d',
    'currentness-consumers': '31912a68550eefc19e88c64bbc45a6c8db674a86e2c90dec16ecf53b674a1371',
    'u1-physical-scope-successor-01': '1d8ec427aa2486c31763bf3d40ac1afc0f0cf9dafa3032165cd996096ed868ce',
    'p3-fixture-dependency-repair-01': '5bcbfbfa14151ad35126431bd9ee4a2930c62d797cdcece59b147a46f2e9b933',
    'p5-installed-preparation-01': 'b8859cda37f284ef928360059664b14b4304c131b23e21f453cdc4cf135e92b6',
}
definition = json.loads((ROOT / 'stdo_abiogenesis.json').read_text())
assert definition['constitution']['stdo']['basis'] == {'uri': 'stdo://releases/v3.0.0-rc.1/', 'manifest_sha256': '069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232'}
assert definition['composition'] == []
assert digest(DELIVERY / 'L2-execution-contract.md') == '65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1'
assert digest(WORK.parent / 'u1-physical-scope-successor-01/L2-supplement.md') == '4fa2d49b6148fccd60ff59cc9f76d90a93f9d992e8d8e31e5e8fd2b79a1c6a05'
baseline_manifest = DELIVERY / 'proof/baseline/source-manifest.json'
assert digest(baseline_manifest) == '4f4fa05d92e306327f921dcaa6e14f81d851a84d8727b9c3fc391a30e66f37d9'
baseline = json.loads(baseline_manifest.read_text())
baseline_root = ROOT / baseline['snapshot_root']
assert len(baseline['files']) == 1311
for item in baseline['files']:
    verify(baseline_root / item['path'], item)
assert {r['path'] for r in inventory(baseline_root)} == {r['path'] for r in baseline['files']}

def frozen_path(stream, path):
    p = Path(path)
    if p.is_absolute():
        return p
    return ROOT / p if path.startswith(('.ai-workspace/', 'build_tenants/', 'specification/')) else WORK.parent / stream / p

freezes, ledger, excluded, record_counts = {}, [], [], {}
selected = {r['path']: {'expected': r, 'origin': baseline_root / r['path'], 'owner': 'immutable-baseline'} for r in baseline['files']}
for stream, expected_digest in PINS.items():
    directory = WORK.parent / stream
    freeze_path = directory / 'freeze.json'
    assert digest(freeze_path) == expected_digest, (stream, digest(freeze_path))
    freeze = json.loads(freeze_path.read_text())
    freezes[stream] = row(freeze_path, freeze_path.relative_to(ROOT))
    records = freeze.get('records', freeze.get('record_files', freeze.get('evidenceFiles', freeze.get('files', []))))
    if isinstance(freeze.get('manifest'), dict):
        manifest_path = frozen_path(stream, freeze['manifest']['path'])
        verify(manifest_path, freeze['manifest'])
        records = json.loads(manifest_path.read_text()).get('records', records)
    for record in records:
        verify(frozen_path(stream, record['path']), record)
    for link in freeze.get('symlinks', []):
        verify(frozen_path(stream, link['path']), link)
    record_counts[stream] = len(records)
    outputs = freeze.get('owned_outputs', freeze.get('ownedOutputs', freeze.get('source_files', [])))
    assert outputs, stream
    for expected in outputs:
        rel = str(Path(expected['path']).relative_to(ROOT)) if Path(expected['path']).is_absolute() else expected['path']
        if not rel.startswith(str(TENANT) + '/'):
            excluded.append({'stream': stream, **expected})
            continue
        candidates = [ROOT / rel, directory / 'stage' / rel, directory / 'stage-01' / rel,
                      WORK.parent / 'combined-01/source' / rel, WORK.parent / 'combined-01/stage' / rel]
        matches = [p for p in candidates if p.is_file() and digest(p) == expected['sha256']]
        assert matches, ('missing closed source', stream, rel, expected['sha256'])
        origin = matches[0]
        actual = verify(origin, {**expected, 'path': rel})
        prior = selected.get(rel)
        ledger.append({'stream': stream, 'path': rel, 'selected_from': str(origin), 'output': actual,
                       'replaces': None if prior is None else {'owner': prior['owner'], 'sha256': prior['expected']['sha256']}})
        target = WORK / 'preimages' / stream / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(origin, target)
        selected[rel] = {'expected': actual, 'origin': origin, 'owner': stream}
    target = WORK / 'preimages/freezes' / (stream + '.json')
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(freeze_path, target)

allowed_overrides = {
    'k11-role-source-successor-01': {'code/src/gtl/stdo_run_environment.ts', 'test_env/tests/t287-stdo3-run-environment.test.mjs'},
    'lifetime-stream-repair-01': {'code/src/shared/owned_process_lifetime.ts', 'code/src/implementation/worksite_command_helper.ts', 'test_env/tests/t287-owned-process-lifetime.test.mjs', 'test_env/tests/m5-worker-transport.test.mjs'},
    'u1-physical-scope-successor-01': {'code/src/abg/event_calculus.ts', 'test_env/tests/t287-native-work-currentness-consumers.test.mjs'},
    'p5-installed-preparation-01': {'test_env/tests/t287-worksite-command-execution.test.mjs'},
}
for change in ledger:
    previous = change['replaces']
    if previous is not None and previous['owner'] != 'immutable-baseline':
        assert str(Path(change['path']).relative_to(TENANT)) in allowed_overrides.get(change['stream'], set()), change
assert str(TENANT / 'code/src/abg/native_work_effect.ts') in selected

source_root = WORK / 'source'
source_root.mkdir()
for rel, entry in selected.items():
    target = source_root / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(entry['origin'], target)
    verify(target, entry['expected'])
    if entry['owner'] != 'immutable-baseline' and (baseline_root / rel).is_file():
        original = WORK / 'preimages/baseline' / rel
        original.parent.mkdir(parents=True, exist_ok=True)
        if not original.exists():
            shutil.copy2(baseline_root / rel, original)
source_rows = inventory(source_root)
write('source-union-manifest.json', {'baseline': row(baseline_manifest, baseline_manifest.relative_to(ROOT)),
      'files': [{**r, 'owner': selected[r['path']]['owner']} for r in source_rows], 'non_tenant_context_count': sum(not r['path'].startswith(str(TENANT) + '/') for r in source_rows)})
write('payload-source-manifest.json', {'scope': 'Only tenant sources; actual package membership is the generator/npm owner projection', 'files': [r for r in source_rows if r['path'].startswith(str(TENANT) + '/')]})
write('precedence-ledger.json', {'ordered_closed_freezes': freezes, 'records_verified': record_counts, 'overlays': ledger,
      'excluded_non_tenant_owned_outputs': excluded, 'final_owned_paths': [rel for rel,e in selected.items() if e['owner'] != 'immutable-baseline']})
shutil.copytree(source_root, WORK / 'stage', symlinks=True, copy_function=shutil.copy2)

dep_source = WORK.parent / 'k11-role-source-successor-01/stage' / TENANT / 'node_modules'
dep_rows = [r for r in json.loads((WORK.parent / 'k11-role-source-successor-01/stage-output-inventory.json').read_text())['files'] if r['path'].startswith(str(TENANT / 'node_modules') + '/')]
assert len(dep_rows) == 4576
for expected in dep_rows:
    verify(WORK.parent / 'k11-role-source-successor-01/stage' / expected['path'], expected)
dep_target = WORK / 'stage' / TENANT / 'node_modules'
shutil.copytree(dep_source, dep_target, symlinks=True, copy_function=shutil.copy2)
assert inventory(dep_source) == inventory(dep_target)
write('dependency-inventory.json', {'source': str(dep_source), 'copied_independent': True, 'files': inventory(dep_target)})
assert digest(WORK / 'stage' / TENANT / 'package-lock.json') == 'df8d50ad51f46c58d9a38bcc3dd864de0e43337dc8990886b93ad46ab298ef12'

main_paths = json.loads((WORK.parent / 'pure/protected-main-generated.json').read_text())['files']
main_generated = [verify(ROOT / r['path'], r) for r in main_paths]
assert len(main_generated) == 936
write('protected-main-generated.json', {'files': main_generated})
old_roots = [p for p in sorted(WORK.parent.iterdir()) if p.is_dir() and p != WORK]
old_roots += [DELIVERY / 'proof' / n for n in ['baseline', 'baseline-build', 'baseline-preparation']]
old_rows = []
for old_root in old_roots:
    old_rows += [{**r, 'path': str((old_root / r['path']).relative_to(ROOT))} for r in inventory(old_root)]
write('protected-prior-trees.json', {'roots': [str(p.relative_to(ROOT)) for p in old_roots], 'files': old_rows})
write('protected-main-inputs.json', {'files': [row(ROOT / r['path'], r['path']) for r in source_rows if (ROOT / r['path']).is_file()]})

node = Path('/opt/homebrew/Cellar/node/24.7.0/bin/node')
npm = Path('/opt/homebrew/bin/npm')
assert digest(node) == 'fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f'
assert digest(npm) == '8e5f6f3429f8cdbe693cdc29904e9d5a7b127a494bd15c804bd54c7403bfcbe7'
node_version = subprocess.check_output([str(node), '--version'], text=True).strip()
npm_version = json.loads((npm.resolve().parent.parent / 'package.json').read_text())['version']
ts_version = json.loads((dep_target / 'typescript/package.json').read_text())['version']
assert (node_version, npm_version, ts_version) == ('v24.7.0', '11.5.1', '5.9.2')
write('toolchain.json', {'node': node_version, 'npm': npm_version, 'typescript': ts_version,
      'node_executable': row(node, str(node)), 'npm_entrypoint_bytes_sha256': digest(npm), 'npm_realpath': str(npm.resolve()),
      'package_lock': row(WORK / 'stage' / TENANT / 'package-lock.json', TENANT / 'package-lock.json')})
for name in ['commands', 'artifacts', 'tmp', 'npm-logs', 'npm-cache']:
    (WORK / name).mkdir()
write('stage-prebuild-inventory.json', {'files': inventory(WORK / 'stage')})
write('activation.json', {'id': 'COMBINED-FINAL-BUILD-01', 'writer': '/root/stdo3_k11_successor_writer', 'return_to': '/root',
      'frozen_before_build_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'method': definition['constitution']['stdo']['basis'],
      'composition': [], 'closed_freezes': freezes, 'HOW': row(WORK / 'HOW.md', (WORK / 'HOW.md').relative_to(ROOT)),
      'write_territory': str(WORK), 'compile_limit': 1, 'generator_limit': 1, 'archive_pack_limit': 1,
      'corrected_derived_source_paths': ['contracts/capabilities/capability-definition-graph.json', 'contracts/worksite/command-execution-context.inventory.json'],
      'test_workloads': False, 'installed_or_native_workloads': False, 'source_mutation': False, 'git': False})
bound = ['HOW.md', 'activation.json', 'source-union-manifest.json', 'payload-source-manifest.json', 'precedence-ledger.json',
         'dependency-inventory.json', 'toolchain.json', 'stage-prebuild-inventory.json', 'protected-main-generated.json', 'protected-prior-trees.json', 'protected-main-inputs.json', 'prepare.py', 'common.py']
write('prebuild-freeze.json', {'kind': 'exact_combined_build_intake', 'files': [row(WORK / n, (WORK / n).relative_to(ROOT)) for n in bound]})
print(json.dumps({'source_entries': len(source_rows), 'tenant_source_entries': sum(r['path'].startswith(str(TENANT) + '/') for r in source_rows),
      'final_owned_paths': sum(e['owner'] != 'immutable-baseline' for e in selected.values()), 'dependency_entries': len(dep_rows),
      'protected_prior_entries': len(old_rows), 'prebuild_freeze_sha256': digest(WORK / 'prebuild-freeze.json')}), flush=True)
