import difflib
import hashlib
import json
from pathlib import Path

repo = Path('/Users/jim/src/apps/abiogenesis')
tenant = repo / 'build_tenants/abiogenesis/typescript'
operator = repo / '.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator'
phase = operator / 'library-runtime-state-233/successor-39'
previous = operator / 'library-runtime-state-233/successor-38'


def pin(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def load(path):
    return json.loads(path.read_text())


def write(name, value):
    path = phase / name
    with path.open('x') as stream:
        stream.write(json.dumps(value, indent=2) + '\n')
    return pin(path)


changed = [
    'code/src/abg/native_work_reacquisition.ts',
    'design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md',
    'test_env/tests/t287-native-work-reacquisition.test.mjs',
]
preimages = {row['relativePath']: row for row in load(phase / 'preimages.json')['files']}
posts = []
diff = []
for relative in changed:
    snapshot = phase / ('input-02' if relative.startswith('test_env/') else 'input-01') / relative
    before = Path(preimages[relative]['preimagePath'])
    pre, post, live = pin(before), pin(snapshot), pin(tenant / relative)
    assert pre['sha256'] == preimages[relative]['sha256'] and pre['bytes'] == preimages[relative]['bytes']
    assert post['sha256'] == live['sha256'] and post['bytes'] == live['bytes']
    posts.append({'relativePath': relative, 'preimage': pre, 'postimage': post, 'livePostimage': live})
    diff.extend(difflib.unified_diff(before.read_text().splitlines(True), snapshot.read_text().splitlines(True),
        fromfile='a/' + relative, tofile='b/' + relative))

source_root = phase / 'input-01/code/src'
emit_root = phase / 'build-01/code/src'
old_source_root = previous / 'input-01/code/src'
old_emit_root = previous / 'build-01/code/src'
old_sources = {str(Path(row['path']).relative_to(old_source_root)): row
    for row in load(previous / 'dependency-cut-38-inputs.json')['files']}
old_emits = {str(Path(row['path']).relative_to(old_emit_root)): row
    for row in load(previous / 'dependency-cut-38-emission.json')['files']}
sources = [pin(path) for path in sorted(source_root.rglob('*.ts'))]
emits = [pin(path) for path in sorted(emit_root.rglob('*'))
    if path.is_file() and (path.suffix == '.js' or path.name.endswith('.d.ts'))]
assert len(sources) == 264 and len(emits) == 528
assert {str(Path(row['path']).relative_to(source_root)) for row in sources} == set(old_sources)
assert {str(Path(row['path']).relative_to(emit_root)) for row in emits} == set(old_emits)
source_changes = [str(Path(row['path']).relative_to(source_root)) for row in sources
    if row['sha256'] != old_sources[str(Path(row['path']).relative_to(source_root))]['sha256']]
emit_changes = [str(Path(row['path']).relative_to(emit_root)) for row in emits
    if row['sha256'] != old_emits[str(Path(row['path']).relative_to(emit_root))]['sha256']]
assert source_changes == ['abg/native_work_reacquisition.ts']
assert emit_changes == ['abg/native_work_reacquisition.js']
source_pin = write('dependency-cut-39-inputs.json', {'kind': 'runtime_dependency_source_cut', 'sourceCut': 39, 'files': sources})
emit_pin = write('dependency-cut-39-emission.json', {'kind': 'runtime_dependency_emission_cut', 'sourceCut': 39, 'files': emits})
post_pin = write('postimages.json', {'kind': 'canonical_native_testing_binding_postimages', 'sourceCut': 39,
    'files': posts, 'fullSource': source_pin, 'fullEmission': emit_pin})
diff_path = phase / 'delta-from-38.patch'
with diff_path.open('x') as stream:
    stream.write(''.join(diff))

basis = {name: pin(previous / name) for name in ['freeze.json', 'postimages.json',
    'dependency-cut-38-inputs.json', 'dependency-cut-38-emission.json', 'dependency-conjunction.json']}
assert basis['freeze.json']['sha256'] == '5881b4561e8221c9834ef1b486662845f98d9d1754a238e787a92a8edae28183'
origin = pin(operator / 'library-joint-proof-237/continuation-10/freeze.json')
assert origin['sha256'] == 'a0ab39335617c24183df9edc8632b667cef58794a8f8d99342e5c52ac9fbdaa3'
declaration_pin = write('declaration-conservation.json', {'kind': 'public_declaration_byte_conservation',
    'baselineEmissionManifest': basis['dependency-cut-38-emission.json'], 'declarations': 264, 'unchanged': 264, 'changed': []})
conjunction_pin = write('dependency-conjunction.json', {'kind': 'unchanged_accepted_dependency_conjunction',
    'basis': basis, 'fullSource': source_pin, 'fullEmission': emit_pin,
    'sourceConservation': {'total': 264, 'unchanged': 263, 'changed': source_changes},
    'emissionConservation': {'total': 528, 'unchanged': 527, 'changed': emit_changes,
        'publicDeclarations': 264, 'unchangedDeclarations': 264},
    'limits': ['Accepted38 and its existing dependency conjunction are referenced unchanged; no ordinary publication/install.']})

strict = load(phase / 'commands/strict-01.result.json')
declarations = load(phase / 'commands/declarations-01.result.json')
focused = load(phase / 'commands/focused-02.result.json')
old = load(phase / 'commands/preimage-discriminator-02.result.json')
assert strict['exitCode'] == 0 and focused['exitCode'] == 0
assert declarations['diagnostics'] == [] and declarations['skipLibCheck'] is False
assert old['exitCode'] == 1 and old['expectedExitCode'] == 1 and old['observedCanonicalRefusal']
stdout = (phase / 'commands/focused-02.stdout').read_text()
assert 'tests 2' in stdout and 'pass 2' in stdout and 'fail 0' in stdout and 'skipped 0' in stdout
failure = {'receipt': pin(phase / 'commands/focused-01.result.json'),
    'fixture': pin(phase / 'input-01/test_env/tests/t287-native-work-reacquisition.test.mjs'),
    'cause': 'Existing VM indexedRuntimeEvents ignored the supplied cold prefix and returned the preparation-only before vector, hiding later Result/J/evidence/parent rows.',
    'selectedAction': 'Root-selected test-only correction: retain synthetic invocation-root premise, delegate all other queries to the actual prefix owner. Production and HOW unchanged.',
    'correctedFixture': pin(phase / 'input-02/test_env/tests/t287-native-work-reacquisition.test.mjs')}
failure_pin = write('cause-action.json', {'kind': 'bounded_fixture_index_correspondence_cause_action', 'failure': failure,
    'counterexample': 'Expected old38 canonical-binding refusal preserved in both preimage-discriminator receipts; not a successor39 runtime failure.'})
limits = [
    'Bounded Source/type/controlled-owner readiness only; distinct review and actual installed continuation remain next.',
    'The binding mismatch is sufficient to reject a supported canonical occurrence, not established as the unique first-null cause of actual Result598.',
    'Prefix/native/source/environment/cover/C_Call/set lookups are controlled lower premises; real physical constructors and canonical GTL/graph/selector code are exercised.',
    'The same fixture02/lower relations are used for old38 and corrected39, with independent disposable scratch roots; no actual runtime resource is acquired.',
    'Standalone identities, phase, declaration/closed-source, current-use, covers, successful task values/digests, normal failure and receipt/effect uncertainty remain unchanged.',
    'No diagnostic callback/helper, Product/Public shape/domain/grant change, controller, schema, publication/install, native/C2/model/app/Data Mapper/Git or original fixture effects.',
    'Installed continuation, actual C2, capacity, UAT and release remain open.',
]
readiness_pin = write('readiness.json', {'kind': 'canonical_native_testing_binding_readiness', 'status': 'CLOSED', 'sourceCut': 39,
    'productFrame': {'product': 'Fixed fifteen-family ABI5.0', 'goal': 'GOAL035', 'ticket': 'T287', 'method': 'STDO2.5.1rc2',
        'methodManifest': '3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782',
        'frame': 'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration',
        'authority': 'Existing Product reuse/currentness; native Testing HOW; exact identity, lifecycle, authority, effects and Proof. No WHAT change.'},
    'origin': {'actualFrozen10': origin, 'sufficientViolation': 'Canonical GTL declares binding://.../prepare-testing@5; library occurrence consumer required implementation-binding://.../prepare-testing@5.',
        'executiveConjunction': 'Root and independent235 confirmed actual fibre592 uses the canonical binding; actual first-null/callback entry remains unproved.'},
    'realization': 'One library occurrence coordinate changed to governanceRef(binding,prepare-testing); all standalone and source/occurrence/set/phase/currentness guards retained.',
    'changedFiles': posts, 'fullSource': source_pin, 'fullEmission': emit_pin, 'conservedDependencies': conjunction_pin,
    'proof': {'strict': pin(phase / 'commands/strict-01.result.json'), 'strictElapsedMs': strict['elapsedMs'], 'sourceFiles': 264,
        'strippedDeclarations': pin(phase / 'commands/declarations-01.result.json'), 'declarationElapsedMs': declarations['elapsedMs'],
        'skipLibCheck': False, 'publicDeclarationByteConservation': declaration_pin,
        'focused': pin(phase / 'commands/focused-02.result.json'), 'focusedElapsedMs': focused['elapsedMs'],
        'tests': 2, 'passed': 2, 'failed': 0, 'skipped': 0, 'vmSupport': True,
        'preimageDiscriminator': pin(phase / 'commands/preimage-discriminator-02.result.json'),
        'oldOwnerElapsedMs': old['elapsedMs'], 'expectedOldOwnerExitCode': 1, 'observedCanonicalRefusal': True,
        'scope': ['Binding premise derived from canonical GTL leaf and matching descriptor, not mirrored consumer text.',
                  'Canonical preparation, returned complete task, governance matcher and cold Result/J/evidence consumption.',
                  'Former namespace/foreign binding, copied input/occurrence, missing declaration/source/cover/currentness and altered lineage refuse.',
                  'Standalone publication declaration unchanged; actual retained-resource tests not activated.'],
        'readinessFailureCauseAction': failure_pin}, 'limits': limits})

return_path = phase / 'return.md'
with return_path.open('x') as stream:
    stream.write('''Source39 is CLOSED for bounded canonical-binding realization readiness; Worker stopped for independent review.

Product Frame: fixed fifteen-family ABI5.0 / GOAL035 / T287 / STDO2.5.1rc2, manifest `3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782`; existing end-to-end integration, native Testing/reuse/currentness, identity, lifecycle, authority, effects and Proof. No Product WHAT change.

The actual10 conjunction establishes a sufficient constructability defect: GTL and actual fibre592 select `binding://abiogenesis/default-library/prepare-testing@5`, while the library occurrence guard required `implementation-binding://...`. Source39 corrects that one consumer coordinate. The existing governance HOW clarifies the declaration-to-occurrence join. Standalone identities, complete task values/digests, phase, historical declaration/closed-source, current-use, cover and normal failure guards remain. No diagnostic mechanism was added. Actual first-null/callback entry is not uniquely established.

The regression derives its library binding from the canonical GTL leaf and matching descriptor, tests the former namespace as a refusal, and preserves copied/foreign/stale/declaration/source/cover/lineage controls. The same final fixture02 rejects old38 at the canonical-binding positive (expected exit1) and accepts corrected39. Its library preparation/matcher/cold-source case and standalone publication case passed 2/2 with VM support, zero failures/skips (0.451s). Strict264 passed (6.599s); all264 stripped declarations passed skipLibCheck:false (3.321s), byte-exact38. Only one TS/JS changes;263 Source and527 isolated emissions remain exact38.

Focused01's cold-source failure is preserved with its immutable fixture: its old index stub hid later Result/J/evidence/parent rows. Root selected a test-only delegation to the actual prefix selector; no Production/HOW change followed that failure. Both preimage discriminator receipts and all first/successor proof receipts remain.

Real physical constructors and GTL/selector/owner computations are exercised; prefix/native/source/environment/cover/C_Call/set lookups are controlled lower premises. Old/new runs use the same fixture and lower relations with separate disposable scratch roots. No actual fixture/resource, original Data Mapper, lease/worksite/app/model/Git, normal generation/package/install or native retry effects. Independent review, actual installed continuation/C2, capacity, UAT and release remain open.

Exact subject: postimages.json, delta-from-38.patch, full264 Source/full528 emission manifests, dependency-conjunction.json, readiness.json, cause-action.json and freeze.json. Accepted38 dependencies remain referenced unchanged.
''')

names = ['return.md', 'readiness.json', 'postimages.json', 'delta-from-38.patch', 'dependency-cut-39-inputs.json',
    'dependency-cut-39-emission.json', 'dependency-conjunction.json', 'declaration-conservation.json', 'cause-action.json',
    'preimages.json', 'inputs-01.json', 'fixture-support.json', 'tsconfig-01.json', 'run-strict-01.mjs',
    'check-declarations-01.mjs', 'run-focused-01.mjs', 'run-focused-02.mjs',
    'run-preimage-discriminator-01.mjs', 'run-preimage-discriminator-02.mjs', 'finalize-39.py', 'package.json',
    'input-01/package.json', 'input-01/test_env/tests/t287-native-work-reacquisition.test.mjs',
    'input-01/test_env/support/t287-generic-job-worksite.mjs', 'commands/declarations-01.result.json']
for stem in ['strict-01', 'focused-01', 'focused-02', 'preimage-discriminator-01', 'preimage-discriminator-02']:
    names.extend('commands/' + stem + suffix for suffix in ['.result.json', '.stdout', '.stderr'])
files = [pin(phase / name) for name in names]
files += [row[key] for row in posts for key in ['preimage', 'postimage', 'livePostimage']]
freeze_pin = write('freeze.json', {'kind': 'canonical_native_testing_binding_source_freeze', 'status': 'CLOSED', 'sourceCut': 39,
    'subject': pin(return_path), 'files': files, 'references': list(basis.values()) + [origin],
    'fullSource': source_pin, 'fullEmission': emit_pin, 'limits': limits})
print(json.dumps({'status': 'CLOSED', 'freeze': freeze_pin, 'return': pin(return_path), 'readiness': readiness_pin,
    'postimages': post_pin, 'diff': pin(diff_path), 'source': source_pin, 'emissions': emit_pin,
    'canonicalPostimages': [row['livePostimage'] for row in posts], 'literalPins': len(files) + len(basis) + 1}, indent=2))
