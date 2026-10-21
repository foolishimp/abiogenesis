from pathlib import Path
import hashlib, json, os, sys, traceback

ROOT = Path('/Users/jim/src/apps/abiogenesis')
W = ROOT / '.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01'
D = Path(__file__).resolve().parent
B = W / 'proof/baseline-build'
R = W / 'realization/lifetime-stream-repair-01'
S = R / 'stage'
TENANT = Path('build_tenants/abiogenesis/typescript')
checks = []

def raw(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),
            'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

def checked(path, expected):
    got = raw(path)
    assert got['sha256'] == expected['sha256'], (str(path), expected, got)
    if 'bytes' in expected:
        assert got['bytes'] == expected['bytes'], (str(path), expected, got)
    return got

def inventory(base, rows):
    for row in rows:
        p = base / row['path']
        target = row.get('link', row.get('target'))
        if target is not None:
            assert p.is_symlink() and os.readlink(p) == target, str(p)
        else:
            checked(p, row)
    return len(rows)

def read(path):
    return json.loads(path.read_text())

try:
    anchors = [
        (W/'L2-execution-contract.md', '65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1'),
        (W/'proof/baseline-preparation/artifacts/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz', '192356a4291696de676128394d355e9a2d371c8828ba17d60d2daead79ac34b5'),
        (W/'proof/baseline/source-manifest.json', '4f4fa05d92e306327f921dcaa6e14f81d851a84d8727b9c3fc391a30e66f37d9'),
        (W/'proof/baseline-preparation/package-source-correspondence.json', 'd7673f821dbc3d1244a0567617bb03c1777bc19f7b680e40e5b0ee44a91258e0'),
        (W/'proof/baseline-preparation/toolchain-and-dependencies.json', '18164e4340552720de87fbaae57c7ca85a1529d717c9b07961fce173aa3d1561'),
        (R/'freeze.json', '8668dfa9ddbfb2fcfa860659e383e0527b009afb532e385e876384eba5b1b155')
    ]
    anchor_rows = [checked(p, {'sha256': h}) for p,h in anchors]
    counts = {}
    counts['successor_closed_records'] = inventory(R, read(R/'freeze.json')['files'])
    counts['successor_closed_output_copies'] = inventory(R/'subject-final', read(R/'freeze.json')['ownedOutputs'])
    counts['baseline_source'] = inventory(B, read(W/'proof/baseline/source-manifest.json')['files'])
    counts['baseline_archive_stage_correspondence'] = inventory(B/TENANT, read(W/'proof/baseline-preparation/package-source-correspondence.json')['archive_files'])
    counts['baseline_dependencies'] = inventory(B/TENANT, read(W/'proof/baseline-preparation/toolchain-and-dependencies.json')['dependency_files'])
    counts['successor_stage'] = inventory(S, read(R/'stage-post-generation-inventory.json'))
    counts['successor_dependencies'] = inventory(S/TENANT/'node_modules', read(R/'dependencies.json')['files'])
    counts['successor_emitted'] = inventory(S/TENANT/'build', read(R/'emitted-inventory.json'))
    node = checked(Path('/opt/homebrew/Cellar/node/24.7.0/bin/node'), {
        'sha256':'fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f','bytes':86104016})
    selected = [
        'code/src/product/semantic_job.ts', 'code/src/abg/instruction_assembly.ts', 'code/src/abg/c_call_outcome.ts',
        'code/src/product/worksite_command_execution.ts',
        'build/code/src/product/semantic_job.js', 'build/code/src/abg/instruction_assembly.js',
        'build/code/src/abg/c_call_outcome.js', 'build/code/src/product/worksite_command_execution.js',
        'test_env/tests/t287-native-semantic-job.test.mjs', 'test_env/tests/t287-generic-job-meaning.test.mjs',
        'test_env/support/t287-generic-job-intake.mjs', 'test_env/support/t287-generic-job-lifecycle.mjs',
        'test_env/support/installed-public-definition-call.mjs', 'package.json', 'package-lock.json'
    ]
    source_rows = []
    for name in selected:
        before, after = raw(B/TENANT/name), raw(S/TENANT/name)
        equal = before['sha256'] == after['sha256']
        source_rows.append({'member':name,'baseline':before,'successor':after,'equal':equal})
        if name.startswith(('code/src/abg/', 'build/code/src/abg/')) or name in ['code/src/product/semantic_job.ts','build/code/src/product/semantic_job.js']:
            assert equal, name
    raw_fixture = (S/TENANT/'test_env/tests/t287-native-semantic-job.test.mjs').read_text()
    start, end = raw_fixture.index('function candidate(envelope,i)'), raw_fixture.index('async function author(')
    fixture_functions = raw_fixture[start:end]
    assert fixture_functions.count('function candidate(') == 1 and fixture_functions.count('function verdict(') == 1
    baseline_fixture = (B/TENANT/'test_env/tests/t287-native-semantic-job.test.mjs').read_text()
    baseline_functions = baseline_fixture[baseline_fixture.index('function candidate(envelope,i)'):baseline_fixture.index('async function author(')]
    assert fixture_functions == baseline_functions
    (D/'native-fixture-functions.js.txt').write_text(fixture_functions)
    fixture_pin = raw(D/'native-fixture-functions.js.txt')
    source_rows.append({'extracted':fixture_pin,'owner':str(S/TENANT/'test_env/tests/t287-native-semantic-job.test.mjs'),
                        'startLine':raw_fixture[:start].count('\n')+1,'endLine':raw_fixture[:end].count('\n')})
    authority = [raw(ROOT/f) for f in [
        'AGENTS.md','stdo_abiogenesis.json','specification/GOALS.md','specification/PRODUCT.md',
        '.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md',
        'specification/requirements/product/REQ-P-CATALOG.md','specification/requirements/abg/REQ-R-ABG3-RUN.md',
        'specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md',
        'build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md']]
    prior_trace = raw(W/'realization/lifetime-review-triage-01/R1-identity-trace.md')
    result = {'activation':'E03-R1-IDENTITY-BOUNDARY-01','status':'ready_for_pure_discriminator',
              'anchors':anchor_rows,'counts':counts,'node':node,'sourceCorrespondence':source_rows,
              'authorityReadBasis':authority,'priorSourceTrace':prior_trace,
              'preExecutionInputs':[raw(D/f) for f in ['HOW.md','expected.json','preflight.py','discriminator.mjs']],
              'baselineTenant':str(B/TENANT),'successorTenant':str(S/TENANT),
              'claim':'Exact frozen stage inputs verified; no installed, actor, native, command, HTTP or historical workload executed.'}
    (D/'preflight.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'status':result['status'],'counts':counts,'fixtureFunctions':fixture_pin}))
except BaseException as error:
    failure = {'activation':'E03-R1-IDENTITY-BOUNDARY-01','status':'stopped_preflight',
               'errorType':type(error).__name__,'error':str(error),'traceback':traceback.format_exc()}
    (D/'first-failure.json').write_text(json.dumps(failure,indent=2)+'\n')
    print(json.dumps(failure))
    sys.exit(1)
