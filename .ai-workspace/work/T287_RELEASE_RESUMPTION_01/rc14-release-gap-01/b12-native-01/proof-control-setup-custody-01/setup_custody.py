"""Authenticate one observed setup effect; never exclude an entire directory."""
import datetime, hashlib, json, os, pathlib, stat

RELATIVE = '.abiogenesis/workspace-manifest.json'
EXPECTED_BYTES = 1868
EXPECTED_SHA = 'fcf45129b08eb232355db13540abba8a72474d0c6835db186c7fd6cc6fb85e46'
PINS = {
    'runtime/workspace-manifest.json': '430a922ea54bb015da655fdb79c89dc1fd0a350b5fae70d5f28500995cec54dd',
    'runtime/calls/workspace-create.request.json': 'bcf05507ec3e8182366d7e1736486b43452ece3aa79a7122988ac44f55e7ed68',
    'runtime/calls/workspace-create.outcome.json': '4f22ae508285165da55d5c0c883425f238bbb09fda254e67ccc54ba4e087a34c',
    'runtime/phases/3-one-author-dispatch.json': 'd41bba55b359683e28003a0852e8a5d7c1efdef88e687102aa6e1c9aecac0cef',
}

def hex_bytes(value): return hashlib.sha256(value).hexdigest()

def fixed_json_digest(value):
    # These pinned ASCII-valued records have no floating-point or key-order
    # ambiguity. This observation is not a replacement Product JSON checker.
    return 'sha256:' + hex_bytes(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode())

def read_regular(path):
    before = path.lstat()
    assert stat.S_ISREG(before.st_mode) and before.st_nlink == 1, 'Absent/link/non-regular setup evidence: ' + str(path)
    descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        held = os.fstat(descriptor); data = b''
        while True:
            block = os.read(descriptor, 16384)
            if not block: break
            data += block
            assert len(data) <= 131072, 'Unexpected setup evidence size'
        after = os.fstat(descriptor); named = path.lstat()
    finally: os.close(descriptor)
    identity = lambda info: (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_ctime_ns, info.st_mode, info.st_nlink)
    assert identity(before) == identity(held) == identity(after) == identity(named), 'Changed setup evidence during read'
    return data, after

def authenticate_setup_manifest(source, raw, original):
    assert RELATIVE not in original, 'Conflicting original setup row'
    directory = source / '.abiogenesis'
    assert stat.S_ISDIR(directory.lstat().st_mode) and not directory.is_symlink(), 'Setup parent is not the observed real directory'
    path = source / RELATIVE; data, current = read_regular(path)
    assert len(data) == EXPECTED_BYTES and hex_bytes(data) == EXPECTED_SHA, 'Setup manifest bytes changed'
    manifest = json.loads(data); records = {}; custody = []
    for relative, expected in PINS.items():
        member = raw / relative; content, observed = read_regular(member)
        assert hex_bytes(content) == expected, 'Conflicting setup receipt: ' + relative
        records[relative] = json.loads(content)
        custody.append({'path': str(member), 'bytes': len(content), 'sha256': expected,
                        'observedMtimeUtc': datetime.datetime.fromtimestamp(observed.st_mtime, datetime.timezone.utc).isoformat()})
    assert records['runtime/workspace-manifest.json'] == manifest, 'Contemporaneous setup copy differs'
    request = records['runtime/calls/workspace-create.request.json']
    outcome = records['runtime/calls/workspace-create.outcome.json']; receipt = outcome['receipt']
    expected_definition = {'operationId': 'abg.operation.workspace.create', 'memberKey': 'imported'}
    assert request['definitionKey'] == receipt['definitionKey'] == expected_definition
    assert outcome['kind'] == 'installed_definition_call_transport_result' and outcome['acquisitionKind'] == 'eventless'
    assert receipt['exitCode'] == 0 and receipt['failure'] is None and receipt['ownerOutput']['outcomeKind'] == 'result'
    assert receipt['invocationRef'] == request['invocationRef']
    resources = receipt['resources']; owner = receipt['ownerOutput']['value']
    assert resources['kind'] == 'workspace_resource_receipt' and resources['targetRoot'] == str(source)
    assert resources['manifest']['locator'] == str(path)
    assert resources['manifest']['valueDigest'] == fixed_json_digest(manifest)
    assert resources['targetRootDigest'] == fixed_json_digest({'kind': 'workspace_target', 'targetRoot': str(source)})
    assert manifest['kind'] == 'workspace_manifest' and manifest['canonicalRoot'] == str(source)
    assert owner['createPolicy'] == owner['authorityMode'] == manifest['authorityMode'] == 'imported'
    assert owner['workspace'] == {'ref': manifest['workspaceRef'], 'digest': manifest['workspaceDigest']}
    assert owner['creationManifest'] == {'ref': manifest['creationManifestRef'], 'digest': manifest['creationManifestDigest']}
    activation = source / '.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc14-release-gap-01/b12-native-01/ACTIVATION.json'
    activation_bytes, _ = read_regular(activation)
    activation_digest = 'sha256:' + hex_bytes(activation_bytes)
    assert activation_digest == 'sha256:04d12f76c34a908d3753df918ffff05ed1c18c5637daf98a4e848213aca599a7'
    assert manifest['authorityBasis']['source'] == 'admitted_import'
    assert manifest['authorityBasis']['importAuthorityRef'] == activation.as_uri()
    assert manifest['authorityBasis']['importAuthorityDigest'] == activation_digest
    assert {'ref': activation.as_uri(), 'digest': activation_digest} in owner['provenance']
    dispatch = records['runtime/phases/3-one-author-dispatch.json']
    assert dispatch['phase'] == 'one-author-dispatch'
    dispatch_time = datetime.datetime.fromisoformat(dispatch['utc'].replace('Z', '+00:00')).timestamp()
    assert current.st_mtime < dispatch_time and current.st_ctime < dispatch_time, 'Manifest changed after dispatch'
    for entry in custody[:-1]:
        assert datetime.datetime.fromisoformat(entry['observedMtimeUtc']).timestamp() < dispatch_time
    return {'path': RELATIVE, 'row': {'path': RELATIVE, 'bytes': EXPECTED_BYTES, 'sha256': EXPECTED_SHA},
        'attribution': 'setup_owned_imported_workspace_manifest', 'ownerReceipt': custody[2],
        'manifestValueDigest': resources['manifest']['valueDigest'], 'setupEvidence': custody,
        'sourceFileIdentityAtCheck': {'device': current.st_dev, 'inode': current.st_ino},
        'sourceMtimeUtc': datetime.datetime.fromtimestamp(current.st_mtime, datetime.timezone.utc).isoformat(),
        'beforeDispatchUtc': dispatch['utc'], 'checkedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'chronologyLimit': 'Original receipt/runtime copy and source timestamps predate dispatch; this verification record is later evidence, not a pre-dispatch copy.',
        'scope': 'Exactly this authenticated file remains in full postimage; other .abiogenesis deltas receive ordinary native-W checks.'}

if __name__ == '__main__':
    control = pathlib.Path(__file__).resolve().parent
    activation = json.loads((control / 'ACTIVATION.json').read_text())
    raw = pathlib.Path(activation['rawRoot']); source = pathlib.Path(activation['sourceWorktree'])
    pre = json.loads((raw / 'SOURCE_PREIMAGE.json').read_text())
    print(json.dumps(authenticate_setup_manifest(source, raw, {row['path']: row for row in pre['rows']}), indent=2))
