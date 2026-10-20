from pathlib import Path
import hashlib, json, difflib

repo = Path('/Users/jim/src/apps/abiogenesis')
tenant = repo / 'build_tenants/abiogenesis/typescript'
phase = repo / '.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/library-runtime-state-233/successor-41'
prior = phase.parent / 'successor-40'
actual = repo / '.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/library-joint-proof-237/continuation-12'

def pin(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def save(name, value):
    path = phase / name
    with path.open('x') as handle:
        handle.write(json.dumps(value, indent=2) + '\n')
    return pin(path)

changed = [
    'code/src/product/worksite_command_execution.ts',
    'design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md',
    'test_env/tests/t287-worksite-command-execution.test.mjs',
    'test_env/tests/t287-observed-worksite-command.test.mjs',
    'test_env/tests/forward-command-contracts.test.mjs',
]
post = []
diff = []
for relative in changed:
    live = tenant / relative
    data = live.read_bytes()
    frozen = phase / 'postimages' / relative
    frozen.parent.mkdir(parents=True, exist_ok=True)
    with frozen.open('xb') as handle:
        handle.write(data)
    row = pin(frozen)
    row.update(relativePath=relative, livePath=str(live))
    post.append(row)
    before = (phase / 'preimages' / relative).read_text()
    diff.extend(difflib.unified_diff(before.splitlines(keepends=True), data.decode().splitlines(keepends=True),
        fromfile='source40/' + relative, tofile='source41/' + relative))
assert post[0]['sha256'] == 'afaff3804c0644583e92de1527746342a60f9f3f2b8ad0c8832dbb634631d2d2'
assert post[1]['sha256'] == 'b0b537f0ce8fcaa43f51518c6678a95a16d62be6cdc79e0ae1c32ea431b05276'
assert post[3]['sha256'] == '36fb9ec27213d8facc7aac98c5e9a41b8f06e2ab059496dcf7dbe410b2f2df68'
assert hashlib.sha256((tenant/'test_env/tests/forward-command-owners.test.mjs').read_bytes()).hexdigest() == '7e7bf90bfb563654189e3bf284d24c13a4d63a08c1262e74f43460f74d0d3939'
with (phase / 'delta-from-40.patch').open('x') as handle:
    handle.writelines(diff)
posts = save('postimages.json', {'kind': 'c2_zero_command_write_postimages', 'sourceCut': 41, 'files': post})
source = pin(phase / 'dependency-cut-41-inputs.json')
emission = pin(phase / 'dependency-cut-41-emission.json')
sources = json.loads((phase / 'dependency-cut-41-inputs.json').read_text())['files']
emits = json.loads((phase / 'dependency-cut-41-emission.json').read_text())['files']
assert len(sources) == 264 and len(emits) == 528
assert next(row for row in sources if row['relativePath'] == 'product/worksite_command_execution.ts')['sha256'] == post[0]['sha256']

references = [pin(prior / name) for name in ['freeze.json', 'return.md', 'dependency-cut-40-inputs.json', 'dependency-cut-40-emission.json']]
references += [pin(actual / name) for name in ['freeze.json', 'return.md', 'selected-constructor-discriminator.json']]
conjunction = save('dependency-conjunction.json', {
    'kind': 'c2_source41_dependency_conjunction', 'sourceCut': 41, 'references': references,
    'conservation': {'source40Population': 264, 'unchangedSource': 263, 'changedSource': ['product/worksite_command_execution.ts'],
        'emissions': 528, 'unchangedEmission': 527, 'changedEmission': ['product/worksite_command_execution.js'],
        'declarationsByteExact40': 264, 'canonicalGeneratedTree': 'untouched', 'forwardCommandOwners': 'byte-exact preimage'},
    'authority': {'frame': 'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration',
        'families': 15, 'version': '5.0', 'goal': 'GOAL035', 'ticket': 'T287', 'method': 'STDO2.5.1rc2',
        'manifestSha256': '3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782'},
    'limits': ['Source40 accepted runtime/native/diagnostic/library owners reused unchanged; no new installed or actual continuation credit.',
        'Continuation12 proves a sufficient downstream configuration blocker, not its unique first throw or unretained fresh-context conjunct.']})

command_names = ['strict-01', 'declarations-01', 'selected-configuration-01', 'configuration-01', 'observed-helper-01', 'observed-helper-02', 'observed-helper-03', 'forward-contracts-01']
commands = {name: pin(phase / 'commands' / (name + '.result.json')) for name in command_names}
receipts = {name: json.loads(Path(row['path']).read_text()) for name, row in commands.items()}
for name in ['strict-01', 'selected-configuration-01', 'configuration-01', 'observed-helper-03', 'forward-contracts-01']:
    assert receipts[name]['exitCode'] == 0 and receipts[name]['signal'] is None, name
assert receipts['declarations-01']['diagnostics'] == []
assert receipts['observed-helper-01']['exitCode'] == 1 and receipts['observed-helper-02']['exitCode'] == 1
limits = [
    'Cold A/W/grant and C1/forward Source/cover coordinates are supplied test premises, not native admission or currentness proof.',
    'Real Source-under-test helper modules are staged into a disposable fixture, not installed Product authority; command effects are confined to that fixture mirror and its existing owner evidence mechanics.',
    'Actual12 fresh transient context/unique first throw, complete native Testing/C2/repair/restart, original DataMapper, campaign capacity/UAT/release remain unproved.',
    'No ordinary canonical build/generation/pack/install, actual runtime resource/log/lease/worksite, app/model, Git, heap or Product/requirement effects.']
readiness = save('readiness.json', {
    'kind': 'c2_explicit_zero_write_source_readiness', 'sourceCut': 41, 'disposition': 'ready_for_independent_source_review',
    'cause': 'Existing C2 shared configuration and C1 task wrapper reject an explicit empty territory array despite its lawful zero command-write meaning.',
    'selectedAction': 'Remove only the two nonempty checks; retain explicit arrays and every conditional write, confinement, Source/currentness, identity and effect guard.',
    'postimages': posts, 'delta': pin(phase/'delta-from-40.patch'), 'source': source, 'emission': emission, 'dependencies': conjunction,
    'commands': commands, 'passingCases': {'configuration': 2, 'unchangedObservedControlsFrom01': 4, 'correctedObservedHelper': 1, 'forwardContracts': 8, 'skip': 0},
    'proof': ['Exact frozen12 tuple refuses under40 and constructs/round-trips under41; nonempty control complete values/digest conserved.',
        'Absent/nonarray territories still refuse; report and HTTP port paths require explicit matching permission.',
        'Real readonly helper: success, zero snapshot delta, zero Product delta, original sources exact.',
        'Real unpermitted mirror file creation: existing territory_mismatch, one created path with null matchedTerritoryRef, zero Product delta and no original file creation.',
        'C1/forward empty-territory round-trip conserves source/commands/predicates; existing crossed source/contract/actor/task and honest-red-result controls pass.',
        'Strict264 PASS6.428s; all stripped264 skipLibCheck:false PASS3.190s; 264 declarations byte-exact40.'],
    'failedPremises': [{'receipt': commands['observed-helper-01'], 'cause': 'New test omitted the existing concrete archiveRoot launch premise before command effects.',
        'action': 'Executive selected one test-only archiveRoot mkdir.'},
        {'receipt': commands['observed-helper-02'], 'cause': 'After real readonly helper execution the test called the C1-specific artifact validator for an observed task.',
        'action': 'Executive selected the shared isWorksiteExecutionHelperArtifact validator; every artifact/digest/delta assertion retained.'}],
    'limits': limits, 'stop': True})

text = '''Source41 is ready for independent Source review only. Fixed15 ABI5.0 / GOAL035 / T287 / STDO2.5.1rc2 and the selected integration/effects/currentness/lifecycle/Proof frame remain unchanged.

The existing C2 HOW now states explicit [] grants no command snapshot mutation. The only Production delta removes the two nonempty territory checks in product/worksite_command_execution.ts. Explicit arrays, exact A/W/grant/Source/currentness, confinement, report/HTTP-port matching and mutation restrictions remain.

Pinned continuation12 configuration: old40 refuses;41 constructs and round-trips the same input. Nonempty control values/digest are identical. Strict264 passed6.428s; stripped264 skipLibCheck:false passed3.190s, no diagnostics. All264 declarations are byte-exact40;263Source and527 emissions remain exact, with only C2 JS changed. Canonical generation is untouched.

Affected checks: configuration2PASS, four unchanged observed controls PASS, corrected real helper1PASS1.299s, forward8PASS0.506s, zero skips. Readonly helper has zero mirror/Product delta; an actual undeclared mirror file receives territory_mismatch with one null-authority delta. Original fixture sources remain exact. C1/forward round-trip and existing source/contract/actor/task/red-result guards pass.

Failed01 omitted the concrete archive directory before dispatch; Executive selected test-only mkdir. Failed02 called the C1-specific artifact validator after readonly execution; Executive selected the shared validator. Both receipts and exact initial/successor test inputs are retained. Passing Source/declaration/configuration checks were not repeated.

Complete cut selectors: dependency-cut-41-inputs.json (264), dependency-cut-41-emission.json (528), postimages.json (five changed files), delta-from-40.patch, dependency-conjunction.json, readiness.json and freeze.json. Prior40/12 archive homes are references, not copied historical bodies.

Cold A/W/grant, C1 Source and cover facts are controlled lower premises; real helper staging is not Product installation. Actual12 unique first throw/fresh-context conjunct remains unresolved. Installed native Testing/C2/repair/restart, original DataMapper, capacity/UAT/release remain open. No original resources/worksites/leases, canonical build/package/install, app/model, Product/requirements or Git changed. STOP for Executive-selected independent review.
'''
with (phase/'return.md').open('x') as handle:
    handle.write(text)

# Freeze compact owned records; complete Source and emission bodies are bound by
# their existing manifests rather than listed again here.
owned = []
for path in sorted(phase.rglob('*')):
    if path.is_symlink() or not path.is_file():
        continue
    relative = path.relative_to(phase)
    if relative.parts[0] in ('build-01', 'test-scratch'):
        continue
    if str(relative).startswith('input-01/code/'):
        continue
    owned.append(pin(path))
freeze = save('freeze.json', {'kind': 'c2_zero_command_write_source_freeze', 'sourceCut': 41,
    'disposition': 'closed_ready_for_independent_source_review_only', 'files': owned, 'referenceFiles': references,
    'fullSource': source, 'fullEmission': emission, 'livePostimages': post, 'limits': limits, 'stop': True})
print(json.dumps({'freeze': freeze, 'return': pin(phase/'return.md'), 'readiness': readiness,
    'source': source, 'emission': emission, 'postimages': posts, 'delta': pin(phase/'delta-from-40.patch'),
    'ownPins': len(owned), 'referencePins': len(references)}, indent=2))
