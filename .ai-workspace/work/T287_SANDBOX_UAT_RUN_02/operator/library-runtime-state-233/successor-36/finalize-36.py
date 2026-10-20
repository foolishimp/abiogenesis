from pathlib import Path
import json, hashlib, copy, difflib

phase = Path(__file__).resolve().parent
base = phase.parent
prior = base / 'successor-35'
repo = Path('/Users/jim/src/apps/abiogenesis')
tenant = repo / 'build_tenants/abiogenesis/typescript'
source = phase / 'input-02/code/src'
emit = phase / 'build-02/code/src'
prior_source = prior / 'input-03/code/src'
prior_emit = prior / 'build-03/code/src'

def pin(path):
    path = Path(path).resolve()
    data = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def same(a, b):
    return (a['sha256'], a['bytes']) == (b['sha256'], b['bytes'])

def load(path):
    return json.loads(Path(path).read_text())

def write(name, value):
    target = phase / name
    assert not target.exists(), f'protected existing final carrier: {target}'
    target.write_text(json.dumps(value, indent=2) + '\n')
    return pin(target)

protected = {
    'freeze.json': ('fc292e5252d86be0e9460f3ac3ce29cb0a22fcc7dcfa28e906272d16ef782a0d', 15374),
    'return.md': ('aea030f7365c05ccf459e91b6c352285e359d85cb3de1fac00288a472fdf190e', 3518),
    'readiness.json': ('0f1d66eeb6748400299abdd4f1d0dd07491ae134120293866ebee1dfb3c4ae47', 11077),
    'postimages.json': ('6c03e716cf304926bc999065ba6ad1a581b3f44a271c4c93c524ddc51675479f', 74156),
    'increment-from-34.diff': ('5191e243a049726ba4a169b0ad363189002071ceb93b562551f511e61f803951', 46897),
    'dependency-conjunction.json': ('d950c12c4df3a5d60d0536f4d2224a0985f80194e8b2edbb3a5e18542222cd34', 15491),
    'dependency-cut-35-inputs.json': ('8a8265aad43b0046e96dfe95e573b2875c2ee8cad5ef1e66183edf7dd8844a21', 80618),
    'dependency-cut-35-emission.json': ('61e54d3db74dd28966e38e637c08c20486342ba30c24d78e4a3072e0b746884a', 161514),
}
protected_pins = []
for name, expected in protected.items():
    actual = pin(prior / name)
    assert (actual['sha256'], actual['bytes']) == expected, (name, actual)
    protected_pins.append(actual)

strict = load(phase / 'commands/strict-02.result.json')
declarations = load(phase / 'commands/declarations-02.result.json')
focused = load(phase / 'commands/focused-02.result.json')
assert strict['exitCode'] == 0 and strict['signal'] is None and strict['sourceFiles'] == 264
assert declarations['declarations'] == 264 and declarations['skipLibCheck'] is False and declarations['diagnostics'] == []
assert focused['exitCode'] == 0 and focused['signal'] is None
focused_text = (phase / 'commands/focused-02.stdout').read_text()
assert 'pass 6' in focused_text and 'fail 0' in focused_text and 'skipped 0' in focused_text

source_files = sorted(source.rglob('*.ts'))
emitted_files = sorted(emit.rglob('*.js')) + sorted(emit.rglob('*.d.ts'))
assert len(source_files) == 264 and len(emitted_files) == 528
source_pins = [pin(p) for p in source_files]
emission_pins = [pin(p) for p in sorted(emitted_files)]
old_sources = {str(Path(p['path']).relative_to(prior_source)): p for p in load(prior / 'dependency-cut-35-inputs.json')['files']}
old_emissions = {str(Path(p['path']).relative_to(prior_emit)): p for p in load(prior / 'dependency-cut-35-emission.json')['files']}
new_sources = {str(Path(p['path']).relative_to(source)): p for p in source_pins}
new_emissions = {str(Path(p['path']).relative_to(emit)): p for p in emission_pins}
assert old_sources.keys() == new_sources.keys() and old_emissions.keys() == new_emissions.keys()
source_delta = [r for r in sorted(new_sources) if not same(new_sources[r], old_sources[r])]
expected_source_delta = ['abg/retry.ts', 'abg/traversal_route.ts', 'hog/graph_execute.ts', 'hog/retry_lifecycle.ts', 'hog/structural_transition.ts', 'hog/workflow_lifecycle.ts']
assert source_delta == expected_source_delta, source_delta
for r, p in new_sources.items():
    assert same(p, pin(tenant / 'code/src' / r)), f'live Source changed after strict: {r}'

full_source = write('dependency-cut-36-inputs.json', {'kind': 'frozen_runtime_component_inputs', 'sourceCut': 36, 'files': source_pins})
full_emission = write('dependency-cut-36-emission.json', {'kind': 'frozen_runtime_component_emission', 'sourceCut': 36, 'files': emission_pins})

preimages = load(phase / 'preimages.json')['files']
assert len(preimages) == 7
exact_delta = []
diff_parts = []
for entry in preimages:
    rel = entry['path']
    before = pin(entry['preimagePath'])
    assert same(before, entry), rel
    after = pin(phase / 'input-02' / rel)
    assert same(after, pin(tenant / rel)), f'live changed post-proof: {rel}'
    expected_prior = old_sources[rel.removeprefix('code/src/')] if rel.startswith('code/src/') else next(x['postimage'] for x in load(prior / 'postimages.json')['changedFiles'] if x['relativePath'] == rel)
    assert same(before, expected_prior), rel
    exact_delta.append({'relativePath': rel, 'preimage': before, 'postimage': after, 'livePath': str(tenant / rel)})
    before_lines = Path(before['path']).read_text().splitlines(keepends=True)
    after_lines = Path(after['path']).read_text().splitlines(keepends=True)
    diff_parts.extend(difflib.unified_diff(before_lines, after_lines, fromfile='a35/' + rel, tofile='b36/' + rel))
diff_path = phase / 'increment-from-35.diff'
assert not diff_path.exists()
diff_path.write_text(''.join(diff_parts))
delta_pin = pin(diff_path)

post = copy.deepcopy(load(prior / 'postimages.json'))
post['sourceCut'] = 36
post['supersedes'] = pin(prior / 'postimages.json')
post.pop('deltaFrom34', None)
post['deltaFrom35'] = exact_delta
for item in post['changedFiles']:
    rel = item['relativePath']
    if rel.startswith('code/src/') or rel == 'design/T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md' or rel == 'test_env/tests/t287-route-reconstruction.test.mjs':
        item['postimage'] = pin(phase / 'input-02' / rel)
    assert same(item['postimage'], pin(item['livePath'])), f'live cumulative postimage mismatch: {rel}'
for dependency in post['accepted235Dependencies']:
    dependency['finalSource'] = new_sources[dependency['relativePath']]
    assert same(dependency['accepted235'], dependency['finalSource'])
assert len(post['changedFiles']) == 66 and len(post['accepted235Dependencies']) == 7
post['limits'] = [
    'Cumulative Source-only selected runtime cone. Successor36 changes six existing production files and one owning HOW from35; existing test unchanged.',
    'All complete Public output and canonical replayDigest meanings preserved; genuine structural/retry/native/Source41 installed execution remains237.',
    'No normal generation/package/install, original resource/worksite/lock, model/app or Git effects.',
]
post_pin = write('postimages.json', post)

conjunction = copy.deepcopy(load(prior / 'dependency-conjunction.json'))
conjunction['sourceCut'] = 36
conjunction['dependencies235'] = post['accepted235Dependencies']
conjunction['fullSourceManifest'] = full_source
conjunction['fullEmissionManifest'] = full_emission
conjunction['protectedSuccessor35'] = protected_pins
for rel in conjunction['unchanged232Paths']:
    assert same(new_sources[rel], old_sources[rel]), rel
assert len(conjunction['unchanged232Paths']) == 195
conjunction_pin = write('dependency-conjunction.json', conjunction)

limits = [
    'Source/component readiness only. No actual native, structural/retry/recursion/foldback/Source41 installed specimen or campaign admission executed.',
    'Six unchanged finite checks use controlled lower declaration/outcome/closure premises. Actual HoG/private-next-input/failure-foldback body acquisition and full native/continuation values are237 proof obligations.',
    'Required replayDigest retains its full canonical logical extent and can stream historical bodies. This successor removes compulsory complete prefix/ReplayState materialization and historical plan-equality acquisition; it does not claim every handoff has zero historical acquisition.',
    '198 explicitly retained complete post-close snapshots,220 selected route,225 portable close and212 caller evidence remain separately bounded. No general installed/capacity/UAT/qualification/release credit.',
    'Explicit held-interaction recovery preflight in parent_rehydration remains an explicit complete read; it is outside the normal-loop finding.',
    'No original event resource/log/worksite/lock, model/provider/native/app, canonical build/generator/package/install, Git or heap/environment-limit effects.',
]
proof = {
    'strict': {'receipt': pin(phase / 'commands/strict-02.result.json'), 'sourceFiles': 264, 'exitCode': 0, 'elapsedMs': strict['elapsedMs']},
    'strippedDeclarations': {'receipt': pin(phase / 'commands/declarations-02.result.json'), 'declarations': 264, 'skipLibCheck': False, 'diagnostics': [], 'elapsedMs': declarations['elapsedMs']},
    'affectedComponents': {'receipt': pin(phase / 'commands/focused-02.result.json'), 'stdout': pin(phase / 'commands/focused-02.stdout'), 'test': pin(phase / 'input-02/test_env/tests/t287-route-reconstruction.test.mjs'), 'pass': 6, 'fail': 0, 'skip': 0, 'elapsedMs': focused['elapsedMs']},
    'finiteObservations': {
        'completeReplayBytes': 4622,
        'privateFinitePlanComparisonWork': {'bodyRows': 0, 'scopeRows': 0, 'membershipComparisons': 0, 'selectorRows': 0},
        'warmSelectedRoute': {'eventCounts': [14, 78], 'bodyReads': [1, 1], 'bodyBytes': [2389, 2389], 'membershipComparisons': [4, 5], 'scopeRows': [0, 0], 'selectorRows': [0, 0]},
        'droppedCompleteOutput': {'ownerRemainsOpen': True, 'selectedValueStillRetained': False, 'collectionBytes': 29751503, 'coldSelectedBodyReads': 104, 'coldSelectedBytes': 4362729},
        'limits': 'These measurements exercise existing finite prefix/route/plan owners, not actual structural/retry commit or native HoG dispatch.',
    },
}
readiness = {
    'kind': 'runtime_owned_loop_successor_readiness', 'status': 'CLOSED_STOPPED_SOURCE_COMPONENT_ONLY', 'sourceCut': 36,
    'authority': {'families': 15, 'abi': '5.0', 'goal': 'GOAL035', 'ticket': 'T287', 'stdo': '2.5.1rc2', 'stdoManifest': '3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782', 'frame': 'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration', 'law': 'Existing Product808-815 incremental owned handoffs; existing recovery/identity/effects/Proof; no WHAT/Public authority change.'},
    'origin': {'successor35': pin(prior / 'freeze.json'), 'independentFinding': pin(prior / 'review-235/review.md'), 'independentReviewFreeze': pin(prior / 'review-235/freeze.json'), 'cause': 'Automatic owned structural/declared-retry callees and child-cause lookup reused Public complete materializers; exported Public-shaped function was not an explicit history demand on the owned engine path.', 'fatalAllocation': 'No actual OOM or semantic/authority loss is inferred from this Source finding.'},
    'scope': {'deltaFrom35': exact_delta, 'cumulativePostimages': post_pin, 'fullSource': full_source, 'fullEmission': full_emission, 'conjunction': conjunction_pin, 'sourcePopulation': conjunction['counts'], 'sourceDifferencesFrom35': source_delta, 'emissionDifferencesFrom35': [r for r in sorted(new_emissions) if not same(new_emissions[r], old_emissions[r])]},
    'ownedConsumerRelations': [
        'executeOwnedGraphTraversalEffect -> advanceOwnedStructuralTransition -> same structural computation -> owned prefix/replay guard -> shared owned route or completed-retry commit -> actual committed owned successor -> existing owned next input.',
        'advanceOwnedRetryLifecycle -> same finite failure planner -> admitOwnedBlockedRetryTraversalTransition; resumeProjectedRetry -> projectOwnedExecutableRetryInput -> admitOwnedTraversalTransition. Genuine base/finite suffix/replay guard cuts and every finite plan field are compared without historical plan serialization.',
        'completeOwnedWorkflowLocus incomplete-child cause -> actual owned durable successor -> run-only canonical scope -> exact three indexed envelope kinds -> original Run/graphCall/frame filters -> last/max admitted ordinal. No invented scope fields.',
        'Public structural/route/retry entrypoints preserve complete Public carriers where declared through the same guards/computations. Explicit parent rehydration preflight remains unchanged.',
    ],
    'proof': proof,
    'failureRca': [{'receipt': pin(phase / 'commands/strict-01.result.json'), 'input': pin(phase / 'inputs-01.json'), 'failedInputRoot': str(phase / 'input-01'), 'diagnostics': 2, 'effects': 'Source-only strict failure; no runtime attempt.', 'cause': 'Named opened-event lookup carried nullable ref without preserving old absence semantics; child scope added unsupported graph/frame fields.', 'selectedAction': 'Explicit null -> undefined lookup; existing run-only scope plus all original graph/frame/causation envelope predicates. No scope type or guard change.', 'successor': pin(phase / 'inputs-02.json')}],
    'inheritedEvidence': {'successor35': pin(prior / 'freeze.json'), 'accepted235': post['accepted235Dependencies'], 'testUnchangedFrom35': same(pin(phase / 'input-02/test_env/tests/t287-route-reconstruction.test.mjs'), next(x['postimage'] for x in load(prior / 'postimages.json')['changedFiles'] if x['relativePath'] == 'test_env/tests/t287-route-reconstruction.test.mjs'))},
    'limits': limits,
}
assert readiness['inheritedEvidence']['testUnchangedFrom35']
readiness_pin = write('readiness.json', readiness)

return_text = f'''# Runtime state233 successor36 — CLOSED, Source/component only

Fixed15 ABI5.0 / GOAL035 / T287 / STDO2.5.1rc2, manifest `3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782`; existing interface integration, lifecycle, recovery, identity/effects and Proof frame. This is the selected realization of the frozen successor35 independent finding, with no Product rule or Public authority change.

The ordinary owned engine now selects private structural/route commit and declared-retry failure/resume entrypoints through the existing common computations. Active and committed successor receipts use actual owned prefixes/replay guards; finite failure/progress plan comparison authenticates the genuine base, suffix and replay cut plus every exact finite field. Incomplete-child workflow cause lookup uses the three original indexed envelope kinds, existing Run-only scope, all original graph/frame/causal filters and maximum admitted ordinal. Existing operator-support private helpers are reused unchanged. Explicit Public wrappers still return their complete prefixes/ReplayState/plans. The held-interaction parent-rehydration preflight remains its explicit complete read.

The delta from35 is six existing production files and one owning HOW; the existing test is byte-identical. Cumulative233 has66 changed Source/HOW/test paths. Full264 Source keeps195 unchanged232 owners,61 modified233 owners, seven byte-exact accepted235 owners and one private owner. `postimages.json` pins the cumulative exact pre/postimages; `increment-from-35.diff` is the entire selected delta. `dependency-cut-36-{{inputs,emission}}.json` pins264 Sources ({sum(x['bytes'] for x in source_pins):,}B) and528 isolated emissions ({sum(x['bytes'] for x in emission_pins):,}B). Every successor35 primary file/snapshot/failed receipt is preserved.

Strict264 passed6.445s; all264 stripped declarations with `skipLibCheck:false` passed3.210s; all six unchanged finite conservation checks passed2.449s (6PASS/0FAIL/0SKIP). Strict01 stopped with two Source/type correspondence errors: nullable opened-event lookup and invented graph/frame scope fields. Root selected explicit old null-to-undefined absence and the canonical Run-only scope with original envelope filters. Failed input/receipt remains frozen; no runtime failure or guard waiver occurred.

Existing finite complete replay/stream/digest correspondence (4,622B), three-candidate/raw-array equality and pure-base isolation, copied/foreign/crossed/tampered/truncated controls and dropped-output collection remain passing. Finite private plan comparison reads0 bodies; warm selected route14→78 rows reads one2,389B body with4→5 logarithmic membership comparisons and0 scope/selector rows. These are controlled lower declaration/outcome/closure fixtures, not an actual structural/retry/HoG dispatch. Required replayDigest creation retains its original full canonical logical extent and may stream historical bodies; this successor does not claim zero-history acquisition for every ordinary handoff.

Actual237 structural/retry/recursion/foldback/native/Source41/currentness and body-readback joins remain required. No historical142/145 or artificial Source fixture was rebuilt. Existing198 explicit post-close full snapshot,220 narrow route,225 portable close and212 caller evidence remain separately bounded. Installed capacity/fatal allocator/UAT/qualification/release remain OPEN. No normal generation/package/install, original log/worksite/lock, model/provider/native/app/Git or heap/environment changes. Worker233 is STOPPED; no Reviewer activated.
'''
return_path = phase / 'return.md'
assert not return_path.exists()
return_path.write_text(return_text)
return_pin = pin(return_path)

file_paths = [phase / n for n in ['return.md', 'readiness.json', 'postimages.json', 'increment-from-35.diff', 'dependency-conjunction.json', 'dependency-cut-36-inputs.json', 'dependency-cut-36-emission.json', 'preimages.json', 'inputs-01.json', 'inputs-02.json', 'tsconfig-01.json', 'tsconfig-02.json', 'run-strict-01.mjs', 'run-strict-02.mjs', 'check-declarations-01.mjs', 'check-declarations-02.mjs', 'run-focused-02.mjs', 'package.json', 'finalize-36.py']]
file_paths += sorted((phase / 'commands').iterdir())
file_paths += [Path(e['preimagePath']) for e in preimages]
file_paths += [phase / 'input-02/design/T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md', phase / 'input-02/test_env/tests/t287-route-reconstruction.test.mjs']
file_paths += [Path(x['path']) for x in protected_pins]
file_paths += [prior / 'review-235/review.md', prior / 'review-235/freeze.json']
unique = sorted({str(x.resolve()) for x in file_paths})
freeze = {
    'kind': 'frozen_runtime_owned_loop_source_successor', 'status': 'CLOSED_STOPPED', 'sourceCut': 36,
    'supersedes': pin(prior / 'freeze.json'), 'files': [pin(x) for x in unique],
    'fullSourceManifest': full_source, 'fullEmissionManifest': full_emission, 'postimages': post_pin, 'deltaFrom35': delta_pin, 'limits': limits,
}
freeze_pin = write('freeze.json', freeze)
print(json.dumps({'freeze': freeze_pin, 'return': return_pin, 'readiness': readiness_pin, 'postimages': post_pin, 'deltaFrom35': delta_pin, 'fullSource': full_source, 'fullEmission': full_emission, 'conjunction': conjunction_pin, 'sourceFiles': len(source_pins), 'sourceBytes': sum(x['bytes'] for x in source_pins), 'emittedFiles': len(emission_pins), 'emissionBytes': sum(x['bytes'] for x in emission_pins), 'sourceDifferences': source_delta, 'emissionDifferences': readiness['scope']['emissionDifferencesFrom35'], 'frozenFiles': len(unique)}, indent=2))
