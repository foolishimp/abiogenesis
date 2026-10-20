import difflib
import hashlib
import json
from pathlib import Path

repo = Path('/Users/jim/src/apps/abiogenesis')
tenant = repo / 'build_tenants/abiogenesis/typescript'
campaign = repo / '.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator'
phase = campaign / 'library-runtime-state-233/successor-38'
previous = campaign / 'library-runtime-state-233/successor-37'
native09 = campaign / 'library-joint-proof-237/continuation-09'


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


changed_paths = [
    'code/src/implementation/leaf_invocation_port.ts',
    'design/ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md',
    'test_env/tests/t287-runtime-failure-diagnostic.test.mjs',
]
preimages = {row['relativePath']: row for row in load(phase / 'preimages.json')['files']}
posts = []
patch_parts = []
for relative in changed_paths:
    snapshot = phase / 'input-01' / relative
    before = Path(preimages[relative]['preimagePath'])
    before_pin, after_pin, live_pin = pin(before), pin(snapshot), pin(tenant / relative)
    assert before_pin['sha256'] == preimages[relative]['sha256']
    assert before_pin['bytes'] == preimages[relative]['bytes']
    assert after_pin['sha256'] == live_pin['sha256'] and after_pin['bytes'] == live_pin['bytes']
    posts.append({'relativePath': relative, 'preimage': before_pin,
                  'postimage': after_pin, 'livePostimage': live_pin})
    patch_parts.extend(difflib.unified_diff(before.read_text().splitlines(True),
        snapshot.read_text().splitlines(True), fromfile='a/' + relative, tofile='b/' + relative))

source_root = phase / 'input-01/code/src'
emit_root = phase / 'build-01/code/src'
old_source_root = previous / 'input-01/code/src'
old_emit_root = previous / 'build-01/code/src'
old_sources = {str(Path(row['path']).relative_to(old_source_root)): row
    for row in load(previous / 'dependency-cut-37-inputs.json')['files']}
old_emits = {str(Path(row['path']).relative_to(old_emit_root)): row
    for row in load(previous / 'dependency-cut-37-emission.json')['files']}
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
assert source_changes == ['implementation/leaf_invocation_port.ts']
assert emit_changes == ['implementation/leaf_invocation_port.js']
assert load(phase / 'declaration-conservation.json')['changed'] == []

sources_pin = write('dependency-cut-38-inputs.json', {
    'kind': 'runtime_dependency_source_cut', 'sourceCut': 38, 'files': sources})
emits_pin = write('dependency-cut-38-emission.json', {
    'kind': 'runtime_dependency_emission_cut', 'sourceCut': 38, 'files': emits})
post_pin = write('postimages.json', {
    'kind': 'bounded_deterministic_diagnostic_postimages', 'sourceCut': 38, 'files': posts,
    'fullSource': sources_pin, 'fullEmission': emits_pin})
diff_path = phase / 'delta-from-37.patch'
with diff_path.open('x') as stream:
    stream.write(''.join(patch_parts))

previous_refs = {name: pin(previous / name) for name in [
    'freeze.json', 'dependency-cut-37-inputs.json', 'dependency-cut-37-emission.json',
    'dependency-conjunction.json', 'review-235/review.md', 'review-235/pins.json',
    'review-235/freeze.json']}
assert previous_refs['freeze.json']['sha256'] == 'a4485d4f33ecce4c410c9b734a646cb59be87cb4b9fcc1a2be82e131eae3346e'
assert previous_refs['dependency-cut-37-inputs.json']['sha256'] == '4d2b833f195103e7b00825dc2cbd42e1dbaf8e70743fe746f888b35ae408d9dc'
assert previous_refs['dependency-cut-37-emission.json']['sha256'] == '3ff80064a64bdf842bfe5833fd688fbb889e2ae058503672dfbd4e4034fe4e4c'
native09_pin = pin(native09 / 'freeze.json')
assert native09_pin['sha256'] == '7ffcc93732fffec0c029794e2d4bb1dcc49281579087ef181c5a7be7fac6e0d1'
conjunction_pin = write('dependency-conjunction.json', {
    'kind': 'unchanged_accepted_dependency_conjunction', 'sourceCut': 38,
    'basis': previous_refs, 'fullSource': sources_pin, 'fullEmission': emits_pin,
    'sourceConservation': {'total': 264, 'unchanged': 263, 'changed': source_changes},
    'emissionConservation': {'total': 528, 'unchanged': 527, 'changed': emit_changes,
                            'publicDeclarations': 264, 'unchangedDeclarations': 264},
    'limits': ['Accepted37 dependencies and its distinct review are referenced, not requalified.',
               'No canonical generation, publication or installed38 proof.']})

strict = load(phase / 'commands/strict-01.result.json')
declarations = load(phase / 'commands/declarations-01.result.json')
focused = load(phase / 'commands/focused-01.result.json')
assert strict['exitCode'] == 0 and focused['exitCode'] == 0
assert declarations['diagnostics'] == [] and declarations['skipLibCheck'] is False
stdout = (phase / 'commands/focused-01.stdout').read_text()
assert 'tests 10' in stdout and 'pass 10' in stdout and 'fail 0' in stdout and 'skipped 0' in stdout
limits = [
    'Diagnostic realization and finite Source/type readiness only; independent review remains next.',
    'Actual09 first functional Testing cause remains unknown; no installed38 diagnostic/native retry or C2 success.',
    'Finite authority/loading callbacks and controlled basis/frame/replay premises do not authenticate installed execution.',
    'F_D null receipt is preserved even after an invocation throw; it is not undispatched or no-effects evidence.',
    'No original Data Mapper, actual07/09 resource, log, lease, worksite, app or model effects.',
    'No new Product/Public shape, failure class, event profile, authority or source-use rule.',
    'No normal generation/package/install, capacity, UAT, RC or release credit.',
]
readiness_pin = write('readiness.json', {
    'kind': 'bounded_deterministic_boundary_diagnostic_readiness', 'status': 'CLOSED', 'sourceCut': 38,
    'productFrame': {'product': 'Fixed fifteen-family ABI5.0', 'goal': 'GOAL035', 'ticket': 'T287',
        'method': 'STDO2.5.1rc2',
        'methodManifest': '3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782',
        'frame': 'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration',
        'authority': 'Existing owner/lifecycle/identity/authority/effects/Proof; Product unchanged.'},
    'origin': {'actualFrozen09': native09_pin,
        'relation': 'F_D prepare-testing totalized implementation_exception erased the boundary stage and caught cause.',
        'selectedAction': 'Retain first boundary stage/reason and sanitized cause via the existing retained-JSON diagnostic subject.',
        'knownLimits': 'Authentic totalized evidence does not distinguish authority refusal/throw, loading/missing export or invocation throw.'},
    'changedFiles': posts, 'fullSource': sources_pin, 'fullEmission': emits_pin,
    'conservedDependencies': conjunction_pin,
    'diagnosticContract': {
        'stages': ['authority_verification', 'implementation_load', 'implementation_invocation'],
        'reasons': ['refused', 'thrown', 'missing_export'],
        'binding': ['original diagnosticClassRef', 'F_D computeRegime', 'implementationRef', 'inputDigest'],
        'caughtCause': 'Existing safe error class/code; native Error own data message capped at8192 characters with explicit truncation flag. No getters, proxies, stack, full Error or input/workspace/transport/history serialization.',
        'conserved': ['failureClass', 'typed candidate shape', 'receipt/effect uncertainty', 'successful behavior',
                      'all evidence fields except correctly recomputed outputDigest', 'legacy opaque diagnostic readability']},
    'proof': {'strict': pin(phase / 'commands/strict-01.result.json'),
        'strictElapsedMs': strict['elapsedMs'], 'sourceFiles': 264,
        'strippedDeclarations': pin(phase / 'commands/declarations-01.result.json'),
        'declarationsElapsedMs': declarations['elapsedMs'], 'skipLibCheck': False,
        'publicByteConservation': pin(phase / 'declaration-conservation.json'),
        'focused': pin(phase / 'commands/focused-01.result.json'),
        'focusedElapsedMs': focused['elapsedMs'], 'tests': 10, 'passed': 10, 'failed': 0, 'skipped': 0,
        'scope': ['Six existing failure/causation/route controls retained.',
                  'Authority refused/thrown, load thrown, missing export, synchronous/asynchronous invocation throw.',
                  'Getter/proxy avoidance, native-message truncation and exact evidence digests.',
                  'Actual durable failure admission plus cold/Public diagnostic projection and tamper refusal.',
                  'Successful returns, legacy opaque totalizer and malformed-return semantics conserved.'],
        'premises': 'Finite boundary callbacks and controlled lower basis/frame/replay owner premises; genuine disposable durable failure admission and diagnostic projection.',
        'readinessFailures': []},
    'limits': limits})

return_path = phase / 'return.md'
with return_path.open('x') as stream:
    stream.write('''Successor38 is CLOSED for bounded diagnostic Source readiness; it awaits independent review.

Product Frame: fixed fifteen-family ABI5.0 / GOAL035 / T287 / STDO2.5.1rc2, manifest `3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782`; existing end-to-end interface integration, lifecycle, identity, authority, effects and Proof. Product remains unchanged.

Actual installed37 Construction passed; prepare-testing failed before C2. Frozen23709's `implementation_exception` retained no distinguishable authority/load/invocation cause. This successor repairs that cause erasure, without selecting a functional Testing repair. The owning HOW preceded the one leaf-boundary change.

F_D authority refusal/throw, loading throw/missing export and invocation throw now retain the first stage/reason, original diagnostic class, implementation/input digests and sanitized native cause through the existing retained-JSON diagnostic owner. Native Error own data messages are bounded; arbitrary getters/proxies, full Errors, stacks and input/workspace/history bodies are excluded. Existing failure class, candidate fields, receipt/effect uncertainty and successful/legacy behavior remain; evidence output digests are correctly recomputed.

Strict264 Source passed (6.572s); all264 stripped declarations passed with skipLibCheck:false (3.260s), byte-exact37. The ten focused cases passed (1.580s): six existing controls plus four bounded checks covering the boundary alternatives, safe cause retention, actual durable admission/cold/Public projection and tamper refusal, and successful/opaque legacy behavior. No readiness failure occurred. The exact population is one TS/263 conserved, one isolated JS/527 conserved; the three changed paths include its HOW and focused test.

Finite authority/loading callbacks and controlled lower basis/frame/replay premises are explicit. A null F_D receipt remains compatible with a thrown invocation and establishes no no-effects/undispatched claim. Actual Testing cause, installed38 discriminator, C2/native composition, capacity, UAT and release remain open. Original Data Mapper and existing runtime resources remain untouched. No new Product/Public schema/authority, normal generation, package or runtime retry was performed.

See readiness.json, postimages.json, delta-from-37.patch, full264 Source/full528 emission manifests and freeze.json. Accepted37 dependencies and distinct review are referenced unchanged. Worker stopped after this freeze.
''')

own_names = [
    'return.md', 'readiness.json', 'postimages.json', 'delta-from-37.patch',
    'dependency-cut-38-inputs.json', 'dependency-cut-38-emission.json',
    'dependency-conjunction.json', 'preimages.json', 'inputs-01.json',
    'declaration-conservation.json', 'fixture-support.json', 'tsconfig-01.json',
    'run-strict-01.mjs', 'check-declarations-01.mjs', 'run-focused-01.mjs',
    'finalize-38.py', 'package.json', 'input-01/package.json',
    'commands/strict-01.result.json', 'commands/strict-01.stdout', 'commands/strict-01.stderr',
    'commands/declarations-01.result.json', 'commands/focused-01.result.json',
    'commands/focused-01.stdout', 'commands/focused-01.stderr',
    'input-01/test_env/support/new-empty-append-sink.mjs',
]
own_pins = [pin(phase / name) for name in own_names]
own_pins += [row[key] for row in posts for key in ['preimage', 'postimage', 'livePostimage']]
references = list(previous_refs.values()) + [native09_pin]
freeze_pin = write('freeze.json', {
    'kind': 'bounded_deterministic_diagnostic_source_freeze', 'status': 'CLOSED', 'sourceCut': 38,
    'subject': pin(return_path), 'files': own_pins, 'references': references,
    'fullSource': sources_pin, 'fullEmission': emits_pin, 'limits': limits})
print(json.dumps({'status': 'CLOSED', 'freeze': freeze_pin, 'return': pin(return_path),
    'readiness': readiness_pin, 'postimages': post_pin, 'diff': pin(diff_path),
    'sources': sources_pin, 'emissions': emits_pin, 'canonicalPostimages': [row['livePostimage'] for row in posts],
    'literalPins': len(own_pins) + len(references), 'sourceChanges': source_changes,
    'emissionChanges': emit_changes}, indent=2))
