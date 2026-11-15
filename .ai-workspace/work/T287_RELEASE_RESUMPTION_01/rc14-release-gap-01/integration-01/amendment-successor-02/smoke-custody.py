"""Read-only custody of the existing composed proof; never builds or imports Product."""
import hashlib
import importlib.util
import json
from pathlib import Path
import stat


def need(value, message):
    if not value:
        raise RuntimeError(message)


def file(path, retain=False):
    path = Path(path)
    need(path.is_absolute() and path.resolve() == path, 'Noncanonical input: ' + str(path))
    before = path.lstat()
    need(stat.S_ISREG(before.st_mode), 'Not a regular input: ' + str(path))
    need(not retain or before.st_size <= 16 * 1024 * 1024, 'Receipt exceeds read bound: ' + str(path))
    content = [] if retain else None
    hash_value, count = hashlib.sha256(), 0
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1048576), b''):
            count += len(chunk)
            need(count <= before.st_size, 'Input grew while reading: ' + str(path))
            hash_value.update(chunk)
            if retain:
                content.append(chunk)
    after = path.lstat()
    identity = lambda value: (value.st_dev, value.st_ino, value.st_size,
                              value.st_mtime_ns, value.st_ctime_ns)
    need(identity(before) == identity(after), 'Input changed while reading: ' + str(path))
    need(count == before.st_size, 'Input truncated while reading: ' + str(path))
    return {'bytes': count, 'sha256': hash_value.hexdigest()}, b''.join(content) if retain else None


def checked(row, retain=False):
    actual, data = file(row['path'], retain)
    need(actual == {key: row[key] for key in ['bytes', 'sha256']},
         'Pinned input changed: ' + row['path'])
    return actual, data


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def inspect(spec, binding, bootstrap):
    subject = Path(binding['smokeSourceRoot'])
    need(str(subject) == spec['subjectRoot'] and subject.resolve() == subject,
         'Different or noncanonical smoke subject')
    tenant = subject / spec['tenantRelativePath']
    result = {'sourceCommit': spec['sourceCommit'], 'subjectRoot': str(subject), 'receipts': {}}
    documents = {}
    for name, row in spec['receipts'].items():
        actual, data = checked(row, retain=True)
        result['receipts'][name] = actual
        if row['path'].endswith('.json'):
            documents[name] = json.loads(data)
    freeze, post = documents['sourceFreeze'], documents['sourcePostimage']
    need(freeze['frozenCommit'] == binding['candidate']['sourceCommit'] == spec['sourceCommit'],
         'Frozen source does not own this candidate')
    need(freeze['postimage']['sha256'] == spec['receipts']['sourcePostimage']['sha256'],
         'Frozen source/postimage relation differs')
    need(documents['sourceBinding']['sourcePostimageSha256'] == freeze['postimage']['sha256'],
         'Proof source binding differs')
    need(freeze['sourceHead'] == documents['sourceBinding']['sourceHead'] ==
         documents['proofReturn']['sourceHead'] == post['head'], 'Proof source lineage differs')
    need(documents['buildReturn']['exitCode'] == 0 and documents['proofReturn']['ok'] is True,
         'Retained build/proof did not succeed')
    need(documents['buildStart']['cwd'] == str(tenant), 'Build used another subject')
    candidate = documents['candidate']
    selected = binding['candidate']
    need(candidate['archive'] == selected['archivePath'] and
         'sha256:' + candidate['archiveSha256'] == selected['archiveSha256'] and
         candidate['installed'] == selected['bootstrapPackageRoot'] and
         candidate['manifestSha256'] == selected['manifestSha256'] and
         candidate['files'] == len(bootstrap) and candidate['byteEqual'] is True,
         'Retained candidate does not match this execution')

    # Source rows retain their frozen meaning. The two generated outputs use
    # the proved archive instead; an arbitrary source exception is not allowed.
    prefix = spec['tenantRelativePath'] + '/'
    generated = set(spec['generatedOutputs'])
    need(generated == {'contracts/capabilities/capability-definition-graph.json',
                       'product-toolchain-manifest.json'}, 'Generated output scope differs')
    source_rows = []
    by_path = {row['path']: row for row in post['rows']}
    for row in post['rows']:
        if not row['path'].startswith(prefix):
            continue
        relative = row['path'][len(prefix):]
        if relative in generated:
            continue
        actual, _ = file(tenant / relative)
        need(actual == {key: row[key] for key in ['bytes', 'sha256']},
             'Smoke source no longer matches frozen postimage: ' + relative)
        source_rows.append({'path': relative, **actual})
    need(source_rows, 'Empty smoke source relation')
    result['tenantSource'] = {'count': len(source_rows), 'sha256': digest(source_rows)}
    result['smokeInputs'] = []
    need(len(spec['smokeInputs']) == 11, 'Exact eleven-file smoke closure required')
    for row in spec['smokeInputs']:
        relative = row['path']
        expected = by_path[prefix + relative]
        need(all(row[key] == expected[key] for key in ['bytes', 'sha256']),
             'Smoke input is not the frozen source: ' + relative)
        actual, _ = file(tenant / relative)
        need(actual == {key: row[key] for key in ['bytes', 'sha256']}, 'Smoke input changed: ' + relative)
        result['smokeInputs'].append({'path': relative, **actual})

    # Compare the entire consumed Product payload with the already authenticated
    # bootstrap/archive inventory, including generated outputs and native addon.
    for relative, expected in bootstrap.items():
        actual, _ = file(tenant / relative)
        need(actual['sha256'] == expected, 'Compiled proof payload differs: ' + relative)
    result['payload'] = {'count': len(bootstrap), 'sha256': digest(bootstrap)}
    result['generatedOutputs'] = [{'path': relative, 'sourceSha256': by_path[prefix + relative]['sha256'],
                                   'sha256': bootstrap[relative], 'authority': selected['archiveSha256']}
                                  for relative in sorted(generated)]

    # Reuse the exact retained dependency reader and its original compact pin;
    # do not duplicate its 4,576-row ledger or write to either dependency tree.
    checked(spec['dependencyReader'])
    loader = importlib.util.spec_from_file_location('retained_dependency_inventory', spec['dependencyReader']['path'])
    dependency_reader = importlib.util.module_from_spec(loader)
    loader.loader.exec_module(dependency_reader)
    dependency = documents['dependencyBinding']
    original_inventory = documents['dependencyInventory']
    need(original_inventory['sha256'] == dependency['inventorySha256'], 'Dependency receipt relation differs')
    need(digest(original_inventory['rows']) == dependency['inventorySha256'], 'Dependency ledger digest differs')
    current = dependency_reader.inventory(tenant / 'node_modules')
    need(current['sha256'] == dependency['inventorySha256'] and
         len(current['rows']) == dependency['filesAndLinks'] and current['bytes'] == dependency['bytes'],
         'Compiled proof dependencies changed')
    lock, _ = file(tenant / 'package-lock.json')
    need(lock['sha256'] == dependency['lockSha256'], 'Dependency lock changed')
    result['dependencies'] = {'sha256': current['sha256'], 'count': len(current['rows']),
                              'bytes': current['bytes'], 'lock': lock}
    built = dependency_reader.inventory(tenant / 'build')
    need(all(row['kind'] == 'file' for row in built['rows']), 'Build contains a link')
    need({'build/' + row['path']: row['sha256'] for row in built['rows']} ==
         {path: value for path, value in bootstrap.items() if path.startswith('build/')},
         'Build member set differs from candidate')
    result['build'] = {'sha256': built['sha256'], 'count': len(built['rows']), 'bytes': built['bytes']}
    result['native'] = []
    for row in candidate['native']:
        actual, _ = file(tenant / 'build/native' / row['path'])
        need(actual == {key: row[key] for key in ['bytes', 'sha256']}, 'Native addon differs')
        result['native'].append({'path': row['path'], **actual})

    result['tools'] = {}
    need(binding['configuration']['toolchains']['node']['executable'] == binding['configuration']['nodePath'],
         'Declared command Node differs from host Node')
    need(binding['setupEnvironment']['PATH'].split(':')[0] == str(Path(binding['configuration']['nodePath']).parent),
         'npm shebang would select another Node')
    for row in spec['tools']:
        value = binding
        for key in row['bindingField'].split('.'):
            value = value[key]
        need(value == row['path'] and str(Path(value).resolve()) == value, 'Different tool coordinate')
        result['tools'][row['bindingField']], _ = checked(row)
    need(str(Path(spec['npmTree']['path']).resolve()) == spec['npmTree']['path'], 'npm root alias differs')
    npm = dependency_reader.inventory(spec['npmTree']['path'])
    need(npm['sha256'] == spec['npmTree']['sha256'] and len(npm['rows']) == spec['npmTree']['count'],
         'npm implementation tree changed')
    result['npmTree'] = {'sha256': npm['sha256'], 'count': len(npm['rows']), 'bytes': npm['bytes']}
    result['dependencyReader'], _ = checked(spec['dependencyReader'])
    return result
