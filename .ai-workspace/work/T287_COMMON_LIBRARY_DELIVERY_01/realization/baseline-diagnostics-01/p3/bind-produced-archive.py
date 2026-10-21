"""Instantiate only the pre-output frozen P3 archive coverage rule, read-only."""
from pathlib import Path
import hashlib
import json
import stat
import tarfile

L = Path(__file__).resolve().parent
O = L / 'coverage-instance'
sha = lambda b: hashlib.sha256(b).hexdigest()
obj = lambda p: json.loads(Path(p).read_text())

def pin(p):
    p = Path(p)
    s = p.stat()
    return dict(path=str(p), sha256=sha(p.read_bytes()), bytes=s.st_size,
                mode=oct(stat.S_IMODE(s.st_mode)))

def write(p, value):
    with p.open('x') as f:
        json.dump(value, f, indent=2)
        f.write('\n')

O.mkdir()
try:
    c = obj(L / 'runtime-configuration.json')
    E = Path(c['lanes']['declared-execution']['roots']['evidence'])
    result = obj(E / 'result.json')
    assert result['status'] == 'satisfied' and result['nativeCalls'] == 0
    contract = obj(L / 'coverage-contract.json')
    rule = contract['fixtureArchiveRule']
    env = obj(E / 'installed-environment.json')
    assert len(env['additionalProducts']) == rule['count'] == 1
    assert len(env['artifactPaths']) == len(env['verifiedProducts']) == 2
    prepared = env['additionalProducts'][0]
    verified = env['verifiedProducts'][1]
    source = Path(prepared['sourceRoot'])
    archive = Path(prepared['artifactPath'])
    assert source.is_relative_to(Path(rule['ownedScratchParent']))
    assert str(source.resolve()) == str(source) and source.name == rule['sourceRootSuffix']
    assert archive == source / rule['artifactRelativePath']
    assert str(archive.resolve()) == str(archive)
    artifact = pin(archive)
    emitted = obj(E / 'artifact-1.json')
    assert all(artifact[k] == emitted[k] for k in ['path', 'sha256', 'bytes'])
    assert env['artifactPaths'] == [c['subject']['archive']['path'], str(archive)]
    assert prepared['basis']['artifactDigest'] == verified['artifactDigest'] == 'sha256:' + artifact['sha256']
    assert verified['artifactByteLength'] == artifact['bytes']
    for field in ['productId', 'packageName', 'packageVersion']:
        assert prepared['basis'][field] == verified[field] == rule[field]
    assert prepared['basis']['productContentDigest'] == verified['productContentDigest']
    assert prepared['basis']['manifestDigest'] == verified['manifestDigest']
    assert obj(source / 'product-toolchain-manifest.json') == prepared['manifest']
    package = obj(source / 'package.json')
    assert package['name'] == rule['packageName'] and package['version'] == rule['packageVersion']
    assert package['dependencies'] == rule['dependency']
    rows = []
    with tarfile.open(archive, 'r:gz') as t:
        for member in t.getmembers():
            assert member.isfile() and member.name.startswith('package/')
            relative = member.name[len('package/'):]
            assert relative in rule['sourcePackageFiles']
            data = t.extractfile(member).read()
            original = source / relative
            assert data == original.read_bytes()
            assert member.mode == stat.S_IMODE(original.stat().st_mode)
            rows.append(dict(path=relative, sha256=sha(data), bytes=len(data),
                             mode=oct(member.mode), source=pin(original)))
    assert sorted(x['path'] for x in rows) == sorted(rule['sourcePackageFiles'])
    write(O / 'fixture-package-inventory.json', dict(archive=artifact, files=rows,
          producer=rule['producer'], actualEnvironment=pin(E / 'installed-environment.json'),
          artifactReceipt=pin(E / 'artifact-1.json')))
    contract['status'] = 'actual_producer_instantiation_of_frozen_rule'
    contract['frozenRule'] = pin(L / 'coverage-contract.json')
    contract['archiveBindings'].append(dict(archive=artifact,
        inventory=pin(O / 'fixture-package-inventory.json'), members=rule['members'],
        owner='actual prepared language fixture, source/receipt/verifiedProduct bound'))
    write(O / 'coverage-contract.json', contract)
    write(O / 'binding-result.json', dict(status='satisfied', subjectId='baseline',
        lane='declared-execution', frozenRule=pin(L / 'coverage-contract.json'),
        actualContract=pin(O / 'coverage-contract.json'), fixture=artifact,
        files=len(rows), nativeCalls=0, scope='Read-only actual producer/member binding; no workload or classifier rerun'))
except Exception as error:
    write(O / 'binding-result.json', dict(status='stopped', firstCause=repr(error),
        stop='Return Root before repair/retry/coverage. Preserve all actual output.'))
    raise
print(json.dumps(obj(O / 'binding-result.json')))
