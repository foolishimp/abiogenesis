from pathlib import Path
import datetime, hashlib, json, os, re, stat, sys, traceback

ROOT = Path('/Users/jim/src/apps/abiogenesis')
WORK = Path(__file__).resolve().parent
DELIVERY = WORK.parent.parent
FINAL = DELIVERY / 'realization/combined-final-02'
C0 = DELIVERY / 'realization/u1-c0-physical-currentness-successor-02'
P1 = DELIVERY / 'realization/l4-final-candidate-02/p1'
TENANT = Path('build_tenants/abiogenesis/typescript')
METHOD = Path('/Users/jim/Library/Application Support/STDO/releases/v3.0.0-rc.1')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(path):
    return json.loads(path.read_text())

def record(path):
    location = str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path)
    result = {'path': location, 'mode': oct(stat.S_IMODE(path.lstat().st_mode))}
    if path.is_symlink():
        result.update(kind='symlink', target=os.readlink(path))
    else:
        result.update(kind='file', bytes=path.stat().st_size, sha256=sha(path))
    return result

def write(name, value):
    path = WORK / name
    assert path.parent == WORK
    with path.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')

def verify(expected):
    path = Path(expected['path'])
    if not path.is_absolute():
        path = ROOT / path
    assert 'continuation-17' not in str(path)
    actual = record(path)
    for key in ['mode', 'bytes', 'sha256', 'target']:
        if key in expected:
            assert actual.get(key) == expected[key], (str(path), key, expected[key], actual.get(key))
    if 'kind' in expected:
        assert actual['kind'] == expected['kind'], str(path)
    return actual

def protected_verification():
    freezes = [
        (C0 / 'freeze.json', '0abc3970a4bff7e7bf64db227a98e0fab9cd201d9b7d593589bd9de7636b2c8a'),
        (FINAL / 'freeze.json', '245a11505b2c3f372da001fa0f3202d4554fea30d9d593e2fe3b5ede61906fe2'),
        (P1 / 'freeze.json', '8b8ddc4bdd2627704fe9c51bc2a55e9ea9474d07870796b23fcbeac1ad265cc6'),
    ]
    for path, expected in freezes:
        assert sha(path) == expected, str(path)
    final_rows = read(FINAL / 'freeze.json')['files']
    for item in final_rows:
        verify(item)
    p1_rows = read(P1 / 'freeze.json')['files']
    for item in p1_rows:
        verify(item)
    c0_freeze = read(C0 / 'freeze.json')
    assert sha(C0 / 'manifest.json') == c0_freeze['manifest_sha256']
    c0_manifest = read(C0 / 'manifest.json')
    for item in c0_manifest['records']:
        verify(item)
    for item in c0_freeze['source_files']:
        selected = dict(item, path=str((C0 / 'stage-02' / item['path']).relative_to(ROOT)))
        verify(selected)
    main = read(FINAL / 'protected-main-generated.json')['files']
    assert (len(main), len(final_rows), len(p1_rows), len(c0_manifest['records'])) == (936, 8640, 116, 35)
    for item in main:
        verify(item)
    return {'namedFreezes': [record(path) for path, _ in freezes],
        'final02BoundRecords': len(final_rows), 'P1BoundRecords': len(p1_rows),
        'C0BoundCarrierRecords': len(c0_manifest['records']), 'C0FrozenSourceRecords': len(c0_freeze['source_files']),
        'mainGeneratedRecords': len(main), 'mainCapture': record(FINAL / 'protected-main-generated.json'),
        'allCheckedSHABytesModesTargetsMatch': True,
        'otherFrozenCuts': 'No writes outside this new work carrier. This check does not repeat every historical cut interior.',
        'continuation17': 'Not opened or inventoried'}

def source_pins():
    fixed = [
        (ROOT / 'specification/PRODUCT.md', '48050e7eb0bcd038e106da32705c621f63fddf6af053228626c94aa216e915cd'),
        (ROOT / 'specification/requirements/abg/REQ-R-ABG3-PROJECTION.md', '1f1e638cef8992532242d17aa4bf5eea9a6e4aa1d4795582bc7e41a893855c65'),
        (ROOT / TENANT / 'design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md', 'c86473dc38bd4e803408154bee947c9b52c379373ed6998502bff663d09cf67e'),
        (ROOT / TENANT / 'design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md', 'cb8dae9f7e684f9b6be730b74125294524ecd7e4d1f035fc03734d7ff1d1160b'),
        (DELIVERY / 'L2-execution-contract.md', '65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1'),
        (METHOD / 'manifest.json', '069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232'),
        (FINAL / 'source-union-manifest.json', '311ae0287daefeef3f32b160e4f86e80b27087b6641f31935d34a31c06b014a1'),
    ]
    for path, expected in fixed:
        assert sha(path) == expected, str(path)
    definition = read(ROOT / 'stdo_abiogenesis.json')
    assert definition['composition'] == []
    assert definition['constitution']['stdo']['basis'] == {
        'uri': 'stdo://releases/v3.0.0-rc.1/',
        'manifest_sha256': '069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232'}
    additional = [ROOT / 'AGENTS.md', ROOT / 'stdo_abiogenesis.json',
        METHOD / 'standards/ASSURANCE.md', METHOD / 'standards/REFERENCE_FRAME.md',
        FINAL / 'first-cause.json', FINAL / 'HOW-structure-successor-02.md',
        P1 / 'result.json', P1 / 'hold.json', P1 / 'return.md']
    names = ['abg/event_calculus.ts', 'abg/c_call_outcome.ts', 'abg/native_worksite_execution.ts',
        'abg/runtime_history.ts', 'abg/c_call.ts', 'abg/event_prefix.ts', 'abg/execution_basis.ts',
        'abg/worksite_revision.ts', 'abg/artifact_truth.ts', 'hog/ccall_lifecycle.ts',
        'implementation/worksite_file_replace.ts', 'product/environment.ts', 'product/worksite_effect.ts']
    additional += [FINAL / 'source' / TENANT / 'code/src' / name for name in names]
    additional += [FINAL / 'source' / TENANT / 'test_env/tests' / name for name in
        ['t287-c0-post-publication-failure.test.mjs', 't287-native-work-currentness-consumers.test.mjs']]
    return {'kind': 'C0-REVIEW-DISPOSITION-01_exact_source_and_evidence_pins',
        'method': definition['constitution']['stdo']['basis'], 'composition': [],
        'files': [record(path) for path, _ in fixed] + [record(path) for path in additional],
        'authority': 'Product/requirements WHAT; frame and accepted design/L2 HOW; exact frozen subjects and public assessment remain separately scoped'}

mode = sys.argv[1]
try:
    if mode == 'preflight':
        assert not (WORK / 'preflight.json').exists()
        protected = protected_verification()
        pins = source_pins()
        write('source-pins.json', pins)
        write('preflight.json', {'status': 'satisfied', 'activation': 'C0-REVIEW-DISPOSITION-01',
            'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'sourcePins': record(WORK / 'source-pins.json'),
            'activationRecord': record(WORK / 'activation.md'), 'validator': record(WORK / 'validate-and-freeze.py'),
            'protected': protected, 'sourcePinCount': len(pins['files']), 'effects': 'Read pins; write new work-carrier records only'})
        print(json.dumps({'status': 'preflight_satisfied', 'sourcePinCount': len(pins['files']), 'protected': protected}))
    elif mode == 'validate':
        assert not (WORK / 'freeze.json').exists()
        before = read(WORK / 'preflight.json')
        for key in ['sourcePins', 'activationRecord', 'validator']:
            verify(before[key])
        for item in read(WORK / 'source-pins.json')['files']:
            verify(item)
        after = protected_verification()
        assert before['protected'] == after
        public = (WORK / 'public-assessment.md').read_text()
        assert public.startswith('Product Frame: fixed fifteen-family ABIogenesis 5.0, active T-287 library prerequisite, principally A5-F10.')
        assert public.endswith('Executive disposition and candidate acceptance remain outside this return.\n')
        assert 'not independent whole-candidate assurance' in public
        external = read(WORK / 'external-review-root-summary.json')
        assert external['attribution'] == 'Root-attributed public summary; not a raw or complete reviewer transcript'
        assert external['sessionId'] == 'f6db0c7a-1261-44d4-b997-fbaf3b133d16'
        assert external['uuid'] == 'b83620ef-20b7-4d61-ad39-f0a727d9349a'
        assert external['rawTranscript'] is None
        assert [f['id'] for f in external['findings']] == ['F1', 'F2', 'F3', 'F4', 'F5', 'F6']
        triage = read(WORK / 'root-triage.json')
        assert triage['decisionAuthority'] == '/root'
        assert triage['productionRepairGranted'] is False
        assert triage['owningHOW'] == 'C0-UNADMITTED-EFFECT-HOW-01'
        assert triage['heldLanes'] == ['owner-resolution', 'P2', 'P3']
        capsule = read(WORK / 'F6-capsule.json')
        for key in ['id', 'frame', 'evidence', 'noBlockRationale', 'trigger', 'reentry',
                    'closureFalsifier', 'closureEvidence', 'owner', 'status']:
            assert capsule[key], key
        assert capsule['id'] == triage['F6CapsuleId']
        assert capsule['status'] == 'registered_deferred_assurance_not_activated'
        p1 = read(P1 / 'result.json')
        assert p1['status'] == 'satisfied' and p1['nativeCalls'] == 0 and p1['retryCount'] == 0
        calls = p1['actualPublicCalls']
        expected_labels = ['workspace-create', 'product-verify-0', 'product-verify-1',
            'product-resolve', 'product-install-0', 'product-install-1', 'workspace-bind',
            'catalog-admit', 'catalog-view', 'program-conformance']
        assert isinstance(calls, list) and len(calls) == 10
        assert all(isinstance(call, dict) for call in calls)
        assert sorted(call['label'] for call in calls) == sorted(expected_labels)
        assert all(call['exitCode'] == 0 and call['outcomeKind'] == 'result' for call in calls)
        request = read(WORK / 'successor-request-02.json')
        for item in request['originalRecords'] + request['successorRecords']:
            verify(item)
        relations = read(WORK / 'frozen-source-relations-02.json')['relations']
        pin_by_path = {item['path']: item for item in read(WORK / 'source-pins.json')['files']}
        prefix = str((FINAL / 'source').relative_to(ROOT)) + '/'
        assert len(relations) == 15
        for relation in relations:
            assert relation['frozenCopy'] == prefix + relation['originalRepositoryPath']
            assert relation['originalPathReadByThisSuccessor'] is False
            for key in ['sha256', 'bytes', 'mode']:
                assert relation[key] == pin_by_path[relation['frozenCopy']][key]
        assert read(WORK / 'root-triage-array-02.json')['id'] == 'C0-DISPOSITION-ARRAY-02'
        hold = read(P1 / 'hold.json')
        assert all(hold[key] is False for key in ['ownerResolutionExecuted', 'P2Executed', 'P3Executed'])
        links = []
        for document in WORK.glob('*.md'):
            for target in re.findall(r'\]\(([^)]+)\)', document.read_text()):
                if '://' in target:
                    continue
                target = target.strip('<>')
                without_line = re.sub(r':\d+$', '', target.split('#')[0])
                path = Path(without_line)
                if not path.is_absolute():
                    path = document.parent / path
                assert 'continuation-17' not in str(path)
                assert path.is_file(), (document.name, target)
                links.append({'document': document.name, 'target': target, 'exists': True})
        write('validation.json', {'status': 'satisfied', 'scope': 'Finite source/evidence pins, record consistency and local links; no runtime or tests',
            'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'protected': after,
            'sourcePinCount': len(read(WORK / 'source-pins.json')['files']), 'links': links,
            'publicAssessment': record(WORK / 'public-assessment.md'),
            'verbatimProvenance': 'Transcribed from this actor preceding public final response; no raw transcript retrieval or transcript hash is claimed',
            'successor': 'C0-DISPOSITION-ARRAY-02', 'request': record(WORK / 'successor-request-02.json'),
            'P1': {'status': 'exact_final02_P1_satisfied', 'actualPublicCalls': len(calls), 'callLabels': expected_labels, 'everyRowExitZeroAndResult': True, 'nativeCalls': 0, 'retryCount': 0,
                'dependentLanesStarted': False}, 'allC0Closure': False, 'releaseClaim': False,
            'writeTerritory': str(WORK.relative_to(ROOT)), 'noOtherWritesByThisActivation': True})
        print(json.dumps({'status': 'successor_validation_satisfied',
            'activation': 'C0-DISPOSITION-ARRAY-02',
            'validation': record(WORK / 'validation.json'),
            'P1ArrayRows': len(calls), 'P1Labels': expected_labels,
            'nativeCalls': p1['nativeCalls'], 'retryCount': p1['retryCount']}))
    else:
        raise ValueError('unsupported mode')
except BaseException as failure:
    if not (WORK / 'first-cause-successor-02.json').exists():
        write('first-cause-successor-02.json', {'activation': 'C0-REVIEW-DISPOSITION-01', 'mode': mode,
            'errorType': type(failure).__name__, 'message': str(failure), 'traceback': traceback.format_exc(),
            'disposition': 'Stopped; no repair or retry'})
    raise
