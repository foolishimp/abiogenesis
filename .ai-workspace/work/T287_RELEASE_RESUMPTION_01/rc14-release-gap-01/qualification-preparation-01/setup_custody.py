"""Exact one-file custody for the actual imported-workspace setup effect.
No blanket ignore: all other source deltas remain inside native W.
"""
import datetime, hashlib, json, os, pathlib, stat, sys

RELATIVE = '.abiogenesis/workspace-manifest.json'
HERE = pathlib.Path(__file__).resolve().parent
ACT = json.loads((HERE / 'ACTIVATION.json').read_text())
SOURCE, RAW = pathlib.Path(ACT['sourceWorktree']), pathlib.Path(ACT['rawRoot'])
RECEIPTS = ['runtime/workspace-manifest.json', 'runtime/calls/workspace-create.request.json',
            'runtime/calls/workspace-create.outcome.json']
sha = lambda data: hashlib.sha256(data).hexdigest()

def read_regular(path):
    before = path.lstat()
    assert stat.S_ISREG(before.st_mode) and before.st_nlink == 1 and not path.is_symlink(), str(path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        held = os.fstat(fd); data = b''
        while True:
            block = os.read(fd, 16384)
            if not block: break
            data += block
            assert len(data) <= 131072
        after = os.fstat(fd)
    finally: os.close(fd)
    named = path.lstat()
    identity = lambda s: (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns, s.st_mode, s.st_nlink)
    assert identity(before) == identity(held) == identity(after) == identity(named), str(path)
    return data, after

def canonical(value):
    # This controlled setup record is ASCII and contains no floats; this is
    # an equality observation of its actual receipt, not a Product JSON owner.
    def checked(v):
        if isinstance(v, dict):
            for k, item in v.items(): k.encode('ascii'); checked(item)
        elif isinstance(v, list):
            for item in v: checked(item)
        elif isinstance(v, str): v.encode('ascii')
        else: assert v is None or isinstance(v, (bool, int))
    checked(value)
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()

def observation():
    pre = json.loads((RAW / 'SOURCE_PREIMAGE.json').read_text())
    assert RELATIVE not in {r['path'] for r in pre['rows']}
    assert (SOURCE / '.abiogenesis').is_dir() and not (SOURCE / '.abiogenesis').is_symlink()
    data, status = read_regular(SOURCE / RELATIVE)
    manifest = json.loads(data)
    assert data == canonical(manifest) + b'\n', 'exact canonical setup bytes'
    rows, records = [], {}
    for name in RECEIPTS:
        body, info = read_regular(RAW / name)
        rows.append({'path': name, 'bytes': len(body), 'sha256': sha(body), 'mtimeNs': info.st_mtime_ns})
        records[name] = json.loads(body)
    assert records[RECEIPTS[0]] == manifest
    request, outcome = records[RECEIPTS[1]], records[RECEIPTS[2]]
    receipt = outcome['receipt']; resources = receipt['resources']; value = receipt['ownerOutput']['value']
    assert request['definitionKey'] == receipt['definitionKey'] == {'operationId': 'abg.operation.workspace.create', 'memberKey': 'imported'}
    assert outcome['kind'] == 'installed_definition_call_transport_result' and outcome['acquisitionKind'] == 'eventless'
    assert receipt['exitCode'] == 0 and receipt['failure'] is None and receipt['ownerOutput']['outcomeKind'] == 'result'
    assert receipt['invocationRef'] == request['invocationRef']
    assert resources['kind'] == 'workspace_resource_receipt' and resources['targetRoot'] == str(SOURCE)
    assert resources['manifest']['locator'] == str(SOURCE / RELATIVE)
    assert resources['manifest']['valueDigest'] == 'sha256:' + sha(canonical(manifest))
    assert resources['targetRootDigest'] == 'sha256:' + sha(canonical({'kind': 'workspace_target', 'targetRoot': str(SOURCE)}))
    assert manifest['kind'] == 'workspace_manifest' and manifest['canonicalRoot'] == str(SOURCE)
    assert value['createPolicy'] == value['authorityMode'] == manifest['authorityMode'] == 'imported'
    assert value['workspace'] == {'ref': manifest['workspaceRef'], 'digest': manifest['workspaceDigest']}
    assert value['creationManifest'] == {'ref': manifest['creationManifestRef'], 'digest': manifest['creationManifestDigest']}
    activation = HERE / 'ACTIVATION.json'; activation_digest = 'sha256:' + sha(activation.read_bytes())
    assert manifest['authorityBasis']['source'] == 'admitted_import'
    assert manifest['authorityBasis']['importAuthorityRef'] == activation.as_uri()
    assert manifest['authorityBasis']['importAuthorityDigest'] == activation_digest
    assert {'ref': activation.as_uri(), 'digest': activation_digest} in value['provenance']
    return {'relativePath': RELATIVE, 'bytes': len(data), 'sha256': sha(data), 'mtimeNs': status.st_mtime_ns,
            'ctimeNs': status.st_ctime_ns, 'receipts': rows, 'sourcePreimageSha256': sha((RAW / 'SOURCE_PREIMAGE.json').read_bytes()),
            'classification': 'Actual imported-workspace setup effect before actor; exact one-file attribution only'}

def authenticate_setup_manifest(source, raw, original, require_dispatch=True):
    assert pathlib.Path(source) == SOURCE and pathlib.Path(raw) == RAW and RELATIVE not in original
    saved = json.loads((RAW / 'SETUP_MANIFEST_CUSTODY.json').read_text())
    current = observation()
    assert current == saved['observation'], 'setup-owned file or exact receipt changed'
    if require_dispatch:
        paths = sorted((RAW / 'runtime/phases').glob('*-one-author-dispatch.json'))
        assert len(paths) == 1
        dispatch = json.loads(paths[0].read_text()); assert dispatch['phase'] == 'one-author-dispatch'
        when = datetime.datetime.fromisoformat(dispatch['utc'].replace('Z', '+00:00'))
        captured = datetime.datetime.fromisoformat(saved['capturedUtc'])
        assert captured < when and max(current['mtimeNs'], current['ctimeNs']) < int(when.timestamp() * 1_000_000_000)
    return current

if __name__ == '__main__':
    assert sys.argv[1:] == ['capture-before-dispatch']
    result = {'capturedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'observation': observation()}
    with (RAW / 'SETUP_MANIFEST_CUSTODY.json').open('x') as out: json.dump(result, out, indent=2); out.write('\n')
    print(json.dumps({'relativePath': RELATIVE, 'sha256': result['observation']['sha256'], 'capturedBeforeDispatch': True}))
