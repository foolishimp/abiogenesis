from pathlib import Path
import datetime, json, os, shutil
from common import ROOT, WORK, DELIVERY, TENANT, digest, inventory, row, verify, write

PREVIOUS = WORK.parent / 'combined-final-01'
C0 = WORK.parent / 'u1-c0-physical-currentness-successor-02'
HOG = WORK.parent / 'hog-retained-laws-proof-preparation-01'
TICKET = '.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'
active = ['e04-retained-owner-execution-01', 'final-review-dispositions-01']
pins = {
    'combined-final-01': 'd30c05423aaa3b837bc19cee427b74f4031f3e6fef48db6bf21ddad5416af821',
    'u1-c0-physical-currentness-successor-02': '0abc3970a4bff7e7bf64db227a98e0fab9cd201d9b7d593589bd9de7636b2c8a',
    'u1-c0-physical-currentness-01': 'c4a9b7100861c5f89b98399076aef7bda002f191bc0e54ab95532d074146b0f5',
    'hog-retained-laws-proof-preparation-01': '8c0af8cdc2e3ae01d12e05a3baf328ce1637093444659cf0b8540859c241e49b',
    'hog-ordinary-owner-driver-preparation-01': '12239d043ac3ad63f65f844be2691601b5119ff0a90110bb273ed73a7f9c2243',
    'final-proof-preparation-01': 'e7bf015a4cc2bf9246d2aedd9800a8b0c41aef5255b5b30fdfd78a69627b12aa',
}
freezes = {}
for name, expected in pins.items():
    path = WORK.parent / name / 'freeze.json'
    assert digest(path) == expected, name
    freezes[name] = row(path, path.relative_to(ROOT))
    target = WORK / 'inputs' / (name + '.freeze.json')
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)
previous_freeze = json.loads((PREVIOUS / 'freeze.json').read_text())
for r in previous_freeze['files']:
    verify(ROOT / r['path'], r)
previous_names = {str(p.relative_to(ROOT)) for p in PREVIOUS.rglob('*') if p.is_file() or p.is_symlink()}
assert previous_names == {r['path'] for r in previous_freeze['files']} | {str((PREVIOUS / 'freeze.json').relative_to(ROOT))}
c0 = json.loads((C0 / 'freeze.json').read_text())
c0_manifest = json.loads((C0 / 'manifest.json').read_text())
assert digest(C0 / 'manifest.json') == c0['manifest_sha256']
for r in c0_manifest['records']:
    verify(ROOT / r['path'], r)
hog = json.loads((HOG / 'freeze.json').read_text())
for r in hog['records']:
    verify(ROOT / r['path'], r)

old_union = json.loads((PREVIOUS / 'source-union-manifest.json').read_text())
selected = {r['path']: {**r, 'acquiredFrom': str((PREVIOUS / 'source' / r['path']).relative_to(ROOT))}
            for r in old_union['files'] if r['path'] != TICKET}
overlays = []
for owner, records, source_root in [
    ('u1-c0-physical-currentness-successor-02', c0['source_files'], C0 / 'stage-02'),
    ('hog-retained-laws-proof-preparation-01', hog['ownedOutputs'], HOG / 'readiness-support'),
]:
    for expected in records:
        path = expected['path']
        assert path.startswith(str(TENANT) + '/') and path in selected
        physical = source_root / (str(Path(path).relative_to(TENANT)) if owner.startswith('hog-') else path)
        verify(physical, expected)
        before = selected[path]
        preimage = WORK / 'preimages' / path
        preimage.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(PREVIOUS / 'source' / path, preimage)
        after = {**row(physical, path), 'owner': owner, 'acquiredFrom': str(physical.relative_to(ROOT))}
        selected[path] = after
        overlays.append({'path': path, 'before': before, 'after': after, 'ownerFreeze': freezes[owner]})
assert len(overlays) == 6 and len(selected) == 1319
for path, expected in sorted(selected.items()):
    physical = ROOT / expected['acquiredFrom']
    verify(physical, expected)
    for kind in ['source', 'stage']:
        target = WORK / kind / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(physical, target)
        verify(target, expected)
write('source-union-manifest.json', {'predecessor': freezes['combined-final-01'], 'files': list(sorted(selected.values(), key=lambda r: r['path'])),
      'nonTenantContextCount': 106, 'excludedNonPackageContext': [{'path': TICKET, 'reason': 'Explicitly active sibling Writer territory; predecessor historical copy remains immutable'}]})
write('precedence-ledger.json', {'closedFreezes': freezes, 'overlays': overlays, 'unchangedPredecessorPaths': len(selected) - 6,
      'excludedActiveTerritories': active + [TICKET], 'noMainSourceAcquisition': True})
write('expected-c0-emissions.json', {'files': [verify(C0 / 'stage-02' / r['path'], r) for r in c0['emitted_files']]})

deps = json.loads((PREVIOUS / 'dependency-inventory.json').read_text())
dep_source = PREVIOUS / 'stage' / TENANT / 'node_modules'
assert inventory(dep_source) == deps['files']
dep_target = WORK / 'stage' / TENANT / 'node_modules'
shutil.copytree(dep_source, dep_target, symlinks=True, copy_function=shutil.copy2)
assert inventory(dep_target) == deps['files']
for r in deps['files']:
    assert not os.path.samefile(dep_source / r['path'], dep_target / r['path'])
    if (dep_target / r['path']).is_symlink():
        assert (dep_target / r['path']).resolve().is_relative_to(dep_target.resolve())
write('dependency-inventory.json', {'source': str(dep_source), 'copiedIndependent': True, 'noSharedInodes': True, 'files': deps['files']})
toolchain = json.loads((PREVIOUS / 'toolchain.json').read_text())
verify(Path(toolchain['node_executable']['path']), toolchain['node_executable'])
assert digest(Path(toolchain['npm_realpath'])) == toolchain['npm_entrypoint_bytes_sha256']
assert json.loads((dep_target / 'typescript/package.json').read_text())['version'] == '5.9.2'
verify(WORK / 'stage' / toolchain['package_lock']['path'], toolchain['package_lock'])
write('toolchain.json', toolchain)
main_generated = json.loads((PREVIOUS / 'protected-main-generated.json').read_text())['files']
for r in main_generated:
    verify(ROOT / r['path'], r)
write('protected-main-generated.json', {'files': main_generated})
write('protected-main-inputs.json', {'files': [row(ROOT / r['path'], r['path']) for r in selected.values() if (ROOT / r['path']).is_file()],
      'excludedActiveTicket': TICKET})
previous_roots = set(json.loads((PREVIOUS / 'protected-prior-trees.json').read_text())['roots'])
closed_roots = []
for path in sorted(WORK.parent.iterdir()):
    if not path.is_dir() or path == WORK or path.name in active:
        continue
    assert (path / 'freeze.json').is_file() or str(path.relative_to(ROOT)) in previous_roots, 'unclassified sibling: ' + str(path)
    closed_roots.append(path)
closed_roots += [DELIVERY / 'proof' / name for name in ['baseline', 'baseline-build', 'baseline-preparation']]
prior_rows = []
for path in closed_roots:
    if path == PREVIOUS:
        prior_rows += previous_freeze['files'] + [freezes['combined-final-01']]
    else:
        prior_rows += [{**r, 'path': str((path / r['path']).relative_to(ROOT))} for r in inventory(path)]
write('protected-prior-trees.json', {'roots': [str(p.relative_to(ROOT)) for p in closed_roots], 'files': prior_rows,
      'excludedActiveRoots': [str((WORK.parent / n).relative_to(ROOT)) for n in active],
      'continuation17': 'Excluded no-open/no-mutation territory under Executive confirmation; no new contents acquisition'})
write('stage-prebuild-inventory.json', {'files': inventory(WORK / 'stage')})
assert digest(DELIVERY / 'L2-execution-contract.md') == '65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1'
assert digest(ROOT / TENANT / 'design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md') == 'cb8dae9f7e684f9b6be730b74125294524ecd7e4d1f035fc03734d7ff1d1160b'
method = Path('/Users/jim/Library/Application Support/STDO/releases/v3.0.0-rc.1/manifest.json')
assert digest(method) == '069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232'
write('activation.json', {'id': 'COMBINED-FINAL-02', 'candidateId': 'candidate', 'closedInputs': freezes,
      'writeTerritory': str(WORK), 'createdUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
      'compileLimit': 1, 'generatorLimit': 1, 'packLimit': 1, 'installedAndNativeWorkloads': False,
      'methodManifest': row(method, str(method)), 'composition': [],
      'activeExclusions': active + [TICKET], 'continuation17': 'no-open/no-mutation; no new recursive scan'})
for name in ['tmp', 'npm-cache', 'npm-logs', 'artifacts', 'commands']:
    (WORK / name).mkdir(exist_ok=True)
bound = ['HOW.md', 'common.py', 'prepare.py', 'run-command.py', 'activation.json', 'source-union-manifest.json', 'precedence-ledger.json',
         'expected-c0-emissions.json', 'dependency-inventory.json', 'toolchain.json', 'protected-main-generated.json',
         'protected-main-inputs.json', 'protected-prior-trees.json', 'stage-prebuild-inventory.json']
write('prebuild-freeze.json', {'kind': 'COMBINED-FINAL-02_exact_preflight',
      'files': [row(WORK / n, (WORK / n).relative_to(ROOT)) for n in bound]})
print(json.dumps({'status': 'preflight_frozen', 'sourceEntries': len(selected), 'dependencyEntries': len(deps['files']),
                  'closedRoots': len(closed_roots), 'protectedPriorEntries': len(prior_rows),
                  'prebuildFreezeSha256': digest(WORK / 'prebuild-freeze.json')}), flush=True)
