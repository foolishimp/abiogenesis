"""Authenticate one already-created setup file; no ignore rule or write grant.
Read-only, closed ASCII manifest/receipt verification; no Product imports.
"""
import datetime
import hashlib
import json
from pathlib import Path
import stat

HERE = Path(__file__).resolve().parent
SHA = lambda data: hashlib.sha256(data).hexdigest()


def ascii_canonical(value):
    # This exact manifest has only ASCII strings, nulls, lists and objects.
    # This is not a replacement general Product canonical-JSON algorithm.
    def closed(item):
        if item is None:
            return
        if isinstance(item, str):
            item.encode('ascii')
        elif isinstance(item, list):
            for child in item: closed(child)
        elif isinstance(item, dict):
            for key, child in item.items():
                assert isinstance(key, str)
                key.encode('ascii')
                closed(child)
        else:
            raise AssertionError('unexpected value outside exact manifest domain')
    closed(value)
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('ascii')


def verify(source, raw, head):
    source, raw = Path(source), Path(raw)
    fixed = json.loads((HERE/'SETUP_CUSTODY.json').read_text())
    assert fixed['sourceRoot'] == str(source) and fixed['rawRoot'] == str(raw) and fixed['sourceHead'] == head
    relative = '.abiogenesis/workspace-manifest.json'
    assert fixed['setupOwnedPath'] == relative
    assert fixed['bytes'] == 1868 and fixed['sha256'] == 'bfa94afc6388acf75b5e0607e4c22a7cdb5a1f34437a40e830f3dd0d616b3866'
    substrate, path = source/'.abiogenesis', source/relative
    assert stat.S_ISDIR(substrate.lstat().st_mode) and not substrate.is_symlink(), 'setup substrate changed/aliased'
    assert sorted(child.name for child in substrate.iterdir()) == ['workspace-manifest.json'], 'additional .abiogenesis entries have no setup attribution or native write grant'
    before = path.lstat()
    assert stat.S_ISREG(before.st_mode) and not path.is_symlink() and before.st_nlink == 1, 'setup manifest missing/not an exclusive regular file'
    data = path.read_bytes()
    after = path.lstat()
    assert (before.st_dev,before.st_ino,before.st_mtime_ns,before.st_size) == (after.st_dev,after.st_ino,after.st_mtime_ns,after.st_size)
    assert after.st_mtime_ns == fixed['sourceMtimeNsObserved'], 'setup manifest metadata changed since custody observation'
    assert len(data) == fixed['bytes'] and SHA(data) == fixed['sha256'], 'setup manifest bytes changed'
    evidence = {}
    for row in fixed['fixedEvidence']:
        record = raw/row['path']
        assert record.is_file() and not record.is_symlink(), row['path']
        contents = record.read_bytes()
        assert len(contents) == row['bytes'] and SHA(contents) == row['sha256'], row['path']
        evidence[row['path']] = json.loads(contents)
    preimage = evidence['SOURCE_PREIMAGE.json']
    assert preimage['head'] == head and preimage['gitStatusAtCapture'] == ''
    assert not any(row['path'] == relative for row in preimage['rows']), 'setup file must not replace an original source entry'
    launch = evidence['LAUNCH.json']
    assert launch['sourceHead'] == head and launch['dispatchAuthorized'] is True
    activation = fixed['importActivation']
    activation_file = Path(activation['path'])
    assert activation_file == source/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc14-release-gap-01/b21-native-01/ACTIVATION.json'
    assert activation_file.as_uri() == activation['ref'] and SHA(activation_file.read_bytes()) == activation['sha256']
    assert any(row['path'] == 'ACTIVATION.json' and row['sha256'] == activation['sha256'] for row in launch['controls'])
    request = evidence['runtime/calls/workspace-create.request.json']
    outcome = evidence['runtime/calls/workspace-create.outcome.json']
    receipt = outcome['receipt']
    expected_key = {'operationId':'abg.operation.workspace.create','memberKey':'imported'}
    assert outcome['kind'] == 'installed_definition_call_transport_result' and outcome['acquisitionKind'] == 'eventless'
    assert receipt['definitionKey'] == request['definitionKey'] == expected_key
    assert receipt['invocationRef'] == request['invocationRef'] and request['acquisitionKind'] == 'eventless'
    assert receipt['exitCode'] == 0 and receipt['failure'] is None and receipt['ownerOutput']['outcomeKind'] == 'result'
    owner = receipt['ownerOutput']['value']
    resources = receipt['resources']
    assert owner['createPolicy'] == 'imported' and owner['authorityMode'] == 'imported'
    assert resources['kind'] == 'workspace_resource_receipt' and resources['targetRoot'] == str(source)
    assert resources['manifest']['locator'] == str(path)
    assert resources['targetRootDigest'] == 'sha256:'+SHA(ascii_canonical({'kind':'workspace_target','targetRoot':str(source)}))
    manifest = json.loads(data)
    canonical = ascii_canonical(manifest)
    assert data == canonical+b'\n', 'source bytes are not the exact create owner canonical bytes'
    assert manifest == evidence['runtime/workspace-manifest.json'], 'contemporaneous readback differs'
    value_digest = 'sha256:'+SHA(canonical)
    assert value_digest == resources['manifest']['valueDigest'] == fixed['canonicalValueDigest']
    assert manifest['kind'] == 'workspace_manifest' and manifest['canonicalRoot'] == str(source) and manifest['authorityMode'] == 'imported'
    authority = manifest['authorityBasis']
    assert authority['source'] == 'admitted_import' and authority['importAuthorityRef'] == activation['ref']
    assert authority['importAuthorityDigest'] == 'sha256:'+activation['sha256']
    assert owner['workspace'] == {'ref':manifest['workspaceRef'],'digest':manifest['workspaceDigest']}
    assert owner['creationManifest'] == {'ref':manifest['creationManifestRef'],'digest':manifest['creationManifestDigest']}
    assert {'ref':activation['ref'],'digest':'sha256:'+activation['sha256']} in owner['provenance']
    assert {'provenanceRef':activation['ref'],'provenanceDigest':'sha256:'+activation['sha256']} in manifest['provenance']
    setup = evidence['runtime/phases/2-fresh-public-setup-held.json']
    dispatch = evidence['runtime/phases/3-one-author-dispatch.json']
    assert setup['phase'] == 'fresh-public-setup-held' and dispatch['phase'] == 'one-author-dispatch'
    stamp = lambda value: datetime.datetime.fromisoformat(value.replace('Z','+00:00'))
    assert stamp(setup['utc']) < stamp(dispatch['utc']) < stamp(fixed['actorStarted']['eventTime'])
    # Verify the stable actor-start prefix line; the later event-log tail remains
    # live and is neither pinned nor represented as closed by this observation.
    actor = None
    with (raw/'runtime/resources/events/runtime.events.jsonl').open('rb') as stream:
        for ordinal, line in enumerate(stream):
            assert ordinal < 1000, 'actor-start prefix search bound'
            event = json.loads(line)
            if event['kind'] == 'actor_process_started':
                actor = event
                assert SHA(line) == fixed['actorStarted']['rawLineSha256']
                break
    assert actor is not None and actor['eventId'] == fixed['actorStarted']['eventId']
    assert actor['eventTime'] == fixed['actorStarted']['eventTime'] and actor['payload']['processId'] == fixed['actorStarted']['processId']
    phase_ns = int(stamp(setup['utc']).timestamp()*1_000_000_000)
    chronology_paths = ['runtime/calls/workspace-create.request.json','runtime/calls/workspace-create.outcome.json','runtime/workspace-manifest.json']
    assert all(row['mtimeNs'] < phase_ns for row in fixed['fixedEvidence'] if row['path'] in chronology_paths)
    assert fixed['sourceMtimeNsObserved'] < phase_ns
    later = evidence['SETUP_OWNED_SOURCE_OBSERVATION.json']
    assert stamp(later['observedUtc']) > stamp(dispatch['utc']), 'later observation must not be presented as pre-dispatch'
    return {'path':relative,'bytes':len(data),'sha256':SHA(data),'canonicalValueDigest':value_digest,
            'attribution':'existing imported-create setup owner; no native write grant',
            'custodyRecordSha256':SHA((HERE/'SETUP_CUSTODY.json').read_bytes()),
            'createInvocationRef':receipt['invocationRef'], 'preDispatchSetupPhaseUtc':setup['utc'],
            'dispatchPhaseUtc':dispatch['utc'],'actorStartedUtc':actor['eventTime'],
            'laterObservationUtc':later['observedUtc'],'verified':True}


if __name__ == '__main__':
    fixed = json.loads((HERE/'SETUP_CUSTODY.json').read_text())
    print(json.dumps(verify(fixed['sourceRoot'],fixed['rawRoot'],fixed['sourceHead']),sort_keys=True))
