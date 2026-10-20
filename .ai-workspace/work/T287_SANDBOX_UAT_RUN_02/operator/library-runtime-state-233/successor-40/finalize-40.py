from pathlib import Path
import json, hashlib, difflib

repo = Path('/Users/jim/src/apps/abiogenesis')
tenant = repo / 'build_tenants/abiogenesis/typescript'
phase = repo / '.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/library-runtime-state-233/successor-40'
previous = phase.parent / 'successor-39'
actual11 = repo / '.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/library-joint-proof-237/continuation-11'

def pin(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, value):
    path = phase / name
    assert not path.exists(), path
    path.write_text(json.dumps(value, indent=2) + '\n')
    return pin(path)

expected = {
    previous / 'freeze.json': '92464f35020b275d72956e64488a8092b83fc650a91be3aca4703f17cbe3959b',
    previous / 'dependency-cut-39-inputs.json': '3ae48fdeaeb686fa9cd7038fde10a0293d0836ff9d02db9dc3c5542ab84fcab5',
    previous / 'dependency-cut-39-emission.json': 'b44b29b0ed56039bd2a09f4778043c67619221abd6b52daf86c290d56f2c3e64',
    actual11 / 'freeze.json': '5a607dbd7ae727ebaeba92b3700342af11db8b95512289b865e353ff16fb1895',
    actual11 / 'return.md': '799a38ff270f0caad7a5c8ce10f9d189d2ae66e53403de20c261fd4edde6065f',
}
references = []
for path, digest in expected.items():
    item = pin(path)
    assert item['sha256'] == digest, item
    references.append(item)
references.append(pin(previous / 'dependency-conjunction.json'))

old_source = json.loads((previous / 'dependency-cut-39-inputs.json').read_text())['files']
source = json.loads((phase / 'dependency-cut-40-inputs.json').read_text())['files']
old_by_rel = {str(Path(row['path'])).split('/code/src/', 1)[1]: row for row in old_source}
changed_source = []
for row in source:
    path = Path(row['path']); rel = row['relativePath']; actual = pin(path)
    assert actual['sha256'] == row['sha256'] and actual['bytes'] == row['bytes'], path
    assert pin(tenant / 'code/src' / rel)['sha256'] == row['sha256'], rel
    if row['sha256'] != old_by_rel[rel]['sha256']:
        changed_source.append(rel)
assert len(source) == len(old_source) == 264
assert set(changed_source) == {'abg/default_library.ts', 'abg/native_work_reacquisition.ts', 'implementation/default_library.ts', 'implementation/contracts.ts', 'implementation/leaf_invocation_port.ts'}

old_emit = json.loads((previous / 'dependency-cut-39-emission.json').read_text())['files']
old_emit_by_rel = {str(Path(row['path'])).split('/code/src/', 1)[1]: row for row in old_emit}
emissions = []
changed_emit = []
for path in sorted((phase / 'build-01/code/src').rglob('*')):
    if not (path.is_file() and (path.suffix == '.js' or path.name.endswith('.d.ts'))):
        continue
    rel = str(path).split('/code/src/', 1)[1]; item = pin(path)
    emissions.append({**item, 'relativePath': rel})
    if item['sha256'] != old_emit_by_rel[rel]['sha256']:
        changed_emit.append(rel)
assert len(emissions) == len(old_emit) == 528
assert set(changed_emit) == {'abg/default_library.js', 'abg/native_work_reacquisition.js', 'implementation/default_library.js', 'implementation/leaf_invocation_port.js', 'implementation/contracts.d.ts'}
emission_pin = write('dependency-cut-40-emission.json', {'kind': 'runtime_dependency_emission_cut', 'sourceCut': 40, 'buildRoot': str(phase / 'build-01/code/src'), 'files': emissions})

preimages = json.loads((phase / 'preimages.json').read_text())['files']
posts = []
diff = []
for row in preimages:
    rel = row['relativePath']; live = Path(row['livePath']); before = Path(row['path'])
    assert pin(before)['sha256'] == row['sha256'], before
    if rel.startswith('code/src/') or rel.startswith('test_env/'):
        captured = phase / 'input-01' / rel
        assert captured.read_bytes() == live.read_bytes(), rel
    else:
        captured = phase / 'postimages' / rel
        captured.parent.mkdir(parents=True, exist_ok=True)
        assert not captured.exists(), captured
        captured.write_bytes(live.read_bytes())
    after_pin = pin(captured)
    assert after_pin['sha256'] != row['sha256'], rel
    posts.append({'relativePath': rel, 'livePath': str(live), 'preimage': row, 'postimage': after_pin})
    diff.extend(difflib.unified_diff(before.read_text().splitlines(True), captured.read_text().splitlines(True), fromfile='a/' + rel, tofile='b/' + rel))
delta_path = phase / 'delta-from-39.patch'
assert not delta_path.exists(); delta_path.write_text(''.join(diff))
postimage_pin = write('postimages.json', {'kind': 'testing_first_refusal_postimages', 'sourceCut': 40, 'files': posts})

declaration_rel = 'implementation/contracts.d.ts'
declaration_delta = phase / 'declaration-delta.patch'
declaration_delta.write_text(''.join(difflib.unified_diff(Path(old_emit_by_rel[declaration_rel]['path']).read_text().splitlines(True), (phase / 'build-01/code/src' / declaration_rel).read_text().splitlines(True), fromfile='39/' + declaration_rel, tofile='40/' + declaration_rel)))
conjunction_pin = write('dependency-conjunction.json', {
    'kind': 'accepted_source39_testing_diagnostic_successor', 'basis': references,
    'fullSource': pin(phase / 'dependency-cut-40-inputs.json'), 'fullEmission': emission_pin,
    'sourceConservation': {'total': 264, 'unchanged': 259, 'changed': sorted(changed_source)},
    'emissionConservation': {'total': 528, 'unchanged': 523, 'changed': sorted(changed_emit), 'declarations': 264, 'unchangedDeclarations': 263, 'changedDeclarations': [declaration_rel]},
    'nonPublicCallableDelta': 'One optional first-refusal callback on the existing NativeLeafProofOperations.governanceTestingReacquisition operation. Nullable exported task signatures remain byte-exact; stripped private overloads/type do not publish a diagnostic API.',
    'protected': ['All other Source39 production bytes, including accepted232/235 and Source38 runtime-failure owner', 'Every predecessor freeze/snapshot/receipt and actual continuation11', 'Canonical generated/package/install and original DataMapper/resources/worksites'],
})

commands = {}
for name in ['strict-01', 'declarations-01', 'testing-refusals-01', 'diagnostic-readback-01']:
    path = phase / 'commands' / (name + '.result.json'); value = json.loads(path.read_text())
    if name == 'declarations-01':
        assert value['declarations'] == 264 and value['diagnostics'] == [] and value['skipLibCheck'] is False
    else:
        assert value['exitCode'] == 0 and value['signal'] is None
    commands[name] = {'receipt': pin(path), 'elapsedMs': value['elapsedMs']}
readiness_pin = write('readiness.json', {
    'kind': 'testing_first_refusal_source_readiness', 'sourceCut': 40, 'disposition': 'ready_for_independent_source_review',
    'frame': 'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration',
    'productBasis': {'families': 15, 'version': '5.0', 'goal': 'GOAL035', 'ticket': 'T287', 'method': 'STDO2.5.1rc2', 'manifestSha256': '3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782'},
    'cause': 'Actual installed39 continuation11 still totalizes a nullable Testing preparation to the opaque missing-owned marker; the first refusing relation was not retained. No next functional guard defect is proven.',
    'selectedAction': 'Call-local first-refusal reporting through existing owners and retained diagnosticRef; no functional guard/authority/currentness or failure-class change.',
    'postimages': postimage_pin, 'delta': pin(delta_path), 'declarationDelta': pin(declaration_delta), 'dependencies': conjunction_pin,
    'commands': commands, 'focusedCounts': {'testingOwnerPaths': {'pass': 3, 'fail': 0, 'skip': 0}, 'diagnosticReadback': {'pass': 11, 'fail': 0, 'skip': 0}},
    'proved': ['First specific basis/owner/context/subject/native declaration/current-use/occurrence/closed-source refusal survives enclosing null; callback absence differs from entered-refused', 'Caught native TypeError/ENOENT retains safe class/code; Proxy traps and full input/Error/stack are not retained', 'Successful task/output evidence, original input/native Source and exact guard refusal behavior conserved in the selected controlled-lower-premise specimen', 'Normal governance_failure diagnostic/evidence agreement and actual disposable durable failure admission, tamper refusal, cold/Public retained-subject readback', 'Legacy opaque diagnostics and successful deterministic totalization conserved', '264 strict Source and all 264 stripped declarations skipLibCheck:false; 259 Source and 523 emissions unchanged'],
    'limits': ['Actual continuation11 null versus caught relation remains unobserved until ordinary successor install/discriminator', 'Source/environment/cover/CCall/set/terminal and basis/frame/replay test premises are explicitly controlled; this does not prove actual GTL/native/C2 composition', 'No null diagnostic or receipt establishes no physical effects', 'No normal generation, package, installed acceptance, actual resource acquisition/retry, DataMapper/app/model effect, capacity/UAT/release credit'],
    'stop': True,
})
return_path = phase / 'return.md'
assert not return_path.exists()
return_path.write_text('''Source40 is CLOSED for independent Source review. It retains the first nullable Testing refusal through the existing diagnostic owner; no functional guard or authority repair is selected. Actual installed39 continuation11 remains the cause basis: its first-null/caught relation is still unknown until the installed discriminator.

Five production files, two owning HOWs and two existing tests changed. The exact input/implementation/occurrence and named scalar selectors bind stage/relation; an absent callback differs from an entered-refused operation, and an already caught native error retains safe class/code. First-specific refusal wins. The ordinary governance_failure class, successful tasks, currentness/effect uncertainty and old opaque diagnostics stay intact; deterministic evidence hashes the actual replaced failure value.

Strict264 PASS6.590s; all264 stripped declarations skipLibCheck:false PASS3.258s. VM-enabled owner-path cases3/3 PASS0.550s and diagnostic admission/cold/Public cases11/11 PASS1.630s, zero skips. Tests cover the former indistinguishable nulls/caught causes, genuine physical context checking, unchanged success, legacy opaque read, digest agreement and tamper refusal. Source/environment/cover/CCall/set/terminal and basis/frame/replay lower premises remain controlled; the callback-entered case proves that handoff only.

259 of264 Source and523 of528 emissions are byte-exact39. Four implementation JS files change; the sole declaration delta is an optional callback on the existing nonserialized NativeLeafProofOperations operation. All other263 declarations, including nullable task signatures, are byte-exact39; private overload/type are stripped. Full manifests, pre/postimages, delta, dependency conjunction and exact command receipts are frozen here. All39 and continuation11 artifacts are reused by reference, not rewritten.

No normal generation/package/install/native retry, original-resource/worksite/app/model/Git effects occurred. No actual functional Testing cause, C2/native join, no-effects, capacity, UAT or release claim is earned. Worker STOP; Root selects independent review and the installed discriminator.
''')

files = []
for path in sorted(phase.rglob('*')):
    if not path.is_file() or path.is_symlink():
        continue
    rel = path.relative_to(phase)
    if rel.parts[0] in {'input-01', 'build-01'}:
        continue
    files.append(pin(path))
for row in posts:
    item = row['postimage']
    if item not in files:
        files.append(item)
freeze_pin = write('freeze.json', {'kind': 'testing_first_refusal_source_freeze', 'sourceCut': 40, 'disposition': 'closed_ready_for_independent_source_review', 'files': files, 'referenceFiles': references, 'fullSource': pin(phase / 'dependency-cut-40-inputs.json'), 'fullEmission': emission_pin, 'livePostimages': [{'path': row['livePath'], 'sha256': row['postimage']['sha256'], 'bytes': row['postimage']['bytes']} for row in posts], 'excluded': ['Original/actual runtime logs/resources/leases/worksites', 'Canonical normal generated/package/install', 'Public schemas/requirements/Product/tickets', 'Installed/native/C2/capacity/UAT/release claims']})
print(json.dumps({'freeze': freeze_pin, 'return': pin(return_path), 'readiness': readiness_pin, 'postimages': postimage_pin, 'source': pin(phase / 'dependency-cut-40-inputs.json'), 'emission': emission_pin, 'delta': pin(delta_path), 'ownedPins': len(files), 'referencePins': len(references), 'livePostimages': [row['postimage'] | {'relativePath': row['relativePath']} for row in posts]}, indent=2))
