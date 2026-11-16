"""Exact imported-create setup attribution; no Product import or ignore rule.

Capture happens after successful setup and before native dispatch. Proof checks
the same frozen receipt/readback/canonical bytes at entry and end. Only the
already-created setup manifest is attributed; all other changes retain W law.
"""
import datetime
import hashlib
import json
from pathlib import Path
import stat
import sys

HERE = Path(__file__).resolve().parent
ACT = json.loads((HERE / 'ACTIVATION.json').read_text())
SHA = lambda data: hashlib.sha256(data).hexdigest()
RELATIVE = '.abiogenesis/workspace-manifest.json'
STAMP = lambda value: datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))


def ascii_canonical(value):
    # Closed manifest domain only, not a replacement general JSON owner.
    def closed(item):
        if item is None:
            return
        if isinstance(item, str):
            item.encode('ascii')
        elif isinstance(item, list):
            for child in item:
                closed(child)
        elif isinstance(item, dict):
            for key, child in item.items():
                assert isinstance(key, str)
                key.encode('ascii')
                closed(child)
        else:
            raise AssertionError('outside closed setup manifest domain')
    closed(value)
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('ascii')


def manifest_bytes(source):
    substrate, path = source / '.abiogenesis', source / RELATIVE
    assert stat.S_ISDIR(substrate.lstat().st_mode) and not substrate.is_symlink()
    assert sorted(child.name for child in substrate.iterdir()) == ['workspace-manifest.json'], 'unattributed setup entry'
    before = path.lstat()
    assert stat.S_ISREG(before.st_mode) and not path.is_symlink() and before.st_nlink == 1
    data = path.read_bytes()
    after = path.lstat()
    coordinates = lambda s: (s.st_dev, s.st_ino, s.st_mtime_ns, s.st_size, s.st_nlink)
    assert coordinates(before) == coordinates(after), 'setup manifest changed while read'
    return data, after


def check_material(fixed, source, raw, head):
    assert fixed['sourceRoot'] == str(source) == ACT['sourceWorktree']
    assert fixed['rawRoot'] == str(raw) == ACT['rawRoot'] and fixed['sourceHead'] == head
    assert fixed['setupOwnedPath'] == RELATIVE
    data, metadata = manifest_bytes(source)
    assert metadata.st_mtime_ns == fixed['sourceMtimeNsObserved']
    assert len(data) == fixed['bytes'] and SHA(data) == fixed['sha256'], 'setup manifest bytes changed'
    evidence = {}
    for row in fixed['fixedEvidence']:
        path = raw / row['path']
        assert path.is_file() and not path.is_symlink(), row['path']
        contents = path.read_bytes()
        assert len(contents) == row['bytes'] and SHA(contents) == row['sha256'], row['path']
        evidence[row['path']] = json.loads(contents)
    preimage, launch = evidence['SOURCE_PREIMAGE.json'], evidence['LAUNCH.json']
    assert preimage['head'] == head and preimage['gitStatusAtCapture'] == ''
    assert not any(row['path'] == RELATIVE for row in preimage['rows'])
    assert launch['sourceHead'] == head and launch['dispatchAuthorized'] is True
    assert launch['activationId'] == ACT['id']
    activation = fixed['importActivation']
    activation_file = HERE / 'ACTIVATION.json'
    assert activation['path'] == str(activation_file) and activation['ref'] == activation_file.as_uri()
    assert SHA(activation_file.read_bytes()) == activation['sha256']
    assert any(row['path'] == 'ACTIVATION.json' and row['sha256'] == activation['sha256'] for row in launch['controls'])
    request = evidence['runtime/calls/workspace-create.request.json']
    outcome = evidence['runtime/calls/workspace-create.outcome.json']
    receipt = outcome['receipt']
    key = {'operationId': 'abg.operation.workspace.create', 'memberKey': 'imported'}
    assert outcome['kind'] == 'installed_definition_call_transport_result' and outcome['acquisitionKind'] == 'eventless'
    assert receipt['definitionKey'] == request['definitionKey'] == key
    assert receipt['invocationRef'] == request['invocationRef'] and request['acquisitionKind'] == 'eventless'
    assert receipt['exitCode'] == 0 and receipt['failure'] is None and receipt['ownerOutput']['outcomeKind'] == 'result'
    owner, resources = receipt['ownerOutput']['value'], receipt['resources']
    assert owner['createPolicy'] == 'imported' and owner['authorityMode'] == 'imported'
    assert resources['kind'] == 'workspace_resource_receipt' and resources['targetRoot'] == str(source)
    assert resources['manifest']['locator'] == str(source / RELATIVE)
    assert resources['targetRootDigest'] == 'sha256:' + SHA(ascii_canonical({'kind': 'workspace_target', 'targetRoot': str(source)}))
    manifest = json.loads(data)
    canonical = ascii_canonical(manifest)
    assert data == canonical + b'\n', 'source is not exact owner canonical bytes'
    assert manifest == evidence['runtime/workspace-manifest.json']
    digest = 'sha256:' + SHA(canonical)
    assert digest == resources['manifest']['valueDigest'] == fixed['canonicalValueDigest']
    assert manifest['kind'] == 'workspace_manifest' and manifest['canonicalRoot'] == str(source)
    assert manifest['authorityMode'] == 'imported'
    authority = manifest['authorityBasis']
    assert authority['source'] == 'admitted_import' and authority['importAuthorityRef'] == activation['ref']
    assert authority['importAuthorityDigest'] == 'sha256:' + activation['sha256']
    assert owner['workspace'] == {'ref': manifest['workspaceRef'], 'digest': manifest['workspaceDigest']}
    assert owner['creationManifest'] == {'ref': manifest['creationManifestRef'], 'digest': manifest['creationManifestDigest']}
    assert {'ref': activation['ref'], 'digest': 'sha256:' + activation['sha256']} in owner['provenance']
    assert {'provenanceRef': activation['ref'], 'provenanceDigest': 'sha256:' + activation['sha256']} in manifest['provenance']
    setup = evidence['runtime/phases/2-fresh-public-setup-held.json']
    assert setup['phase'] == 'fresh-public-setup-held'
    assert STAMP(setup['utc']) <= STAMP(fixed['capturedUtc'])
    setup_ns = int(STAMP(setup['utc']).timestamp() * 1_000_000_000)
    paths = ['runtime/calls/workspace-create.request.json', 'runtime/calls/workspace-create.outcome.json', 'runtime/workspace-manifest.json']
    assert all(row['mtimeNs'] < setup_ns for row in fixed['fixedEvidence'] if row['path'] in paths)
    assert fixed['sourceMtimeNsObserved'] < setup_ns
    return {'path': RELATIVE, 'bytes': len(data), 'sha256': SHA(data), 'canonicalValueDigest': digest,
            'attribution': 'existing imported-create setup owner; no native write grant',
            'createInvocationRef': receipt['invocationRef'], 'preDispatchSetupPhaseUtc': setup['utc'],
            'capturedUtc': fixed['capturedUtc'], 'verified': True}


def capture(source, raw, head):
    source, raw = Path(source), Path(raw)
    assert not (raw / 'runtime/phases/3-one-author-dispatch.json').exists(), 'capture must precede dispatch'
    assert not (raw / 'SETUP_CUSTODY.json').exists(), 'one setup capture only'
    data, metadata = manifest_bytes(source)
    activation = HERE / 'ACTIVATION.json'
    paths = ['SOURCE_PREIMAGE.json', 'LAUNCH.json', 'runtime/calls/workspace-create.request.json',
             'runtime/calls/workspace-create.outcome.json', 'runtime/workspace-manifest.json',
             'runtime/phases/2-fresh-public-setup-held.json']
    rows = []
    for relative in paths:
        path = raw / relative
        assert path.is_file() and not path.is_symlink()
        value = path.read_bytes()
        rows.append({'path': relative, 'bytes': len(value), 'sha256': SHA(value), 'mtimeNs': path.stat().st_mtime_ns})
    fixed = {'id': ACT['id'] + '-SETUP-CUSTODY', 'sourceRoot': str(source), 'rawRoot': str(raw), 'sourceHead': head,
             'setupOwnedPath': RELATIVE, 'bytes': len(data), 'sha256': SHA(data),
             'canonicalValueDigest': 'sha256:' + SHA(ascii_canonical(json.loads(data))),
             'sourceMtimeNsObserved': metadata.st_mtime_ns,
             'importActivation': {'path': str(activation), 'ref': activation.as_uri(), 'sha256': SHA(activation.read_bytes())},
             'fixedEvidence': rows, 'capturedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
             'chronologyLimit': 'Actual successful setup receipt/readback and canonical source bytes captured before dispatch; no continuous watch or atomic filesystem claim.'}
    result = check_material(fixed, source, raw, head)
    with (raw / 'SETUP_CUSTODY.json').open('x') as stream:
        json.dump(fixed, stream, indent=2)
        stream.write('\n')
    return {**result, 'custodyRecordSha256': SHA((raw / 'SETUP_CUSTODY.json').read_bytes())}


def preflight(source, raw, head):
    source, raw = Path(source), Path(raw)
    fixed_path = raw / 'SETUP_CUSTODY.json'
    assert fixed_path.is_file() and not fixed_path.is_symlink()
    result = check_material(json.loads(fixed_path.read_text()), source, raw, head)
    return {**result, 'custodyRecordSha256': SHA(fixed_path.read_bytes())}


def verify(source, raw, head):
    raw = Path(raw)
    result = preflight(source, raw, head)
    dispatch = json.loads((raw / 'runtime/phases/3-one-author-dispatch.json').read_text())
    assert dispatch['phase'] == 'one-author-dispatch'
    assert STAMP(result['capturedUtc']) < STAMP(dispatch['utc'])
    actor, line_sha = None, None
    with (raw / 'runtime/resources/events/runtime.events.jsonl').open('rb') as stream:
        for ordinal, line in enumerate(stream):
            assert ordinal < 1000, 'actor-start prefix search bound'
            event = json.loads(line)
            if event['kind'] == 'actor_process_started':
                actor, line_sha = event, SHA(line)
                break
    assert actor is not None
    assert STAMP(dispatch['utc']) < STAMP(actor['eventTime'])
    return {**result, 'dispatchPhaseUtc': dispatch['utc'], 'actorStartedUtc': actor['eventTime'],
            'actorStartedEventId': actor['eventId'], 'actorStartedRawLineSha256': line_sha}


if __name__ == '__main__':
    assert len(sys.argv) == 5 and sys.argv[1] in ('capture', 'preflight', 'verify')
    result = globals()[sys.argv[1]](sys.argv[2], sys.argv[3], sys.argv[4])
    print(json.dumps(result, sort_keys=True))
