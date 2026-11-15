"""Read-only actual RC14 cut-input custody; never builds or imports Product."""
import hashlib
import importlib.util
import json
from pathlib import Path
import stat
import tarfile


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
    need(spec['executionBindingComplete'] is True and spec['tenantRelativePath'] == 'build_tenants/abiogenesis/typescript',
         'Final cut input binding unresolved')
    tenant = subject / spec['tenantRelativePath']
    selected = binding['candidate']
    result = {'sourceCommit': spec['sourceCommit'], 'sourceTree': spec['sourceTree'], 'subjectRoot': str(subject), 'receipts': {}}
    need(set(spec['receipts']) == {'cutRecord', 'archiveMembers', 'dependencyInventory', 'installRecord'}, 'Exact cut receipt roles required')
    documents = {}
    for name, row in spec['receipts'].items():
        actual, data = checked(row, retain=True)
        result['receipts'][name] = actual
        documents[name] = json.loads(data)
    cut, members = documents['cutRecord'], documents['archiveMembers']
    need(spec['receipts']['cutRecord']['path'] == selected['cutRecordPath'] and
         spec['receipts']['cutRecord']['sha256'] == selected['cutRecordSha256'] and
         spec['receipts']['archiveMembers']['path'] == selected['archiveMembersPath'] and
         spec['receipts']['archiveMembers']['sha256'] == selected['archiveMembersSha256'], 'Root cut receipt binding differs')
    need(cut['kind'] == 'local_unqualified_development_candidate_cut' and cut['mode'] == 'apply' and
         cut['status'] == 'PROSPECTIVE_CANDIDATE_PREPARED_SOURCE_FINALIZATION_REQUIRED' and
         cut['stage'] == 'prospective_candidate_preparation', 'Actual prospective cut required; no scratch or old proof transfer')
    need(cut['version'] == selected['packageVersion'] == '5.0.0-rc.14' and
         cut['source']['committedVersion'] == cut['version'] and
         cut['source']['scratchStampDelta'] is None and cut['source']['scratchClaimDelta'] is None,
         'Candidate must come from actual stamped C0, not a relabelled scratch proof')
    need(cut['source']['commit'] == selected['sourceCommit'] == spec['sourceCommit'] and
         cut['source']['tree'] == selected['sourceTree'] == spec['sourceTree'] and
         len(spec['sourceCommit']) == 40 and len(spec['sourceTree']) == 40, 'Exact C0 commit/tree differs')
    need(str(tenant) == cut['buildRoot'] and tenant.resolve() == tenant, 'Smoke must consume actual cut buildRoot')
    need(cut['archive']['path'] == selected['archivePath'] and
         'sha256:' + cut['archive']['sha256'] == selected['archiveSha256'] == cut['identity']['artifactDigest'], 'Cut/archive identity differs')
    result['archive'], _ = checked(cut['archive'])
    need(members['archiveName'] == cut['archive']['name'] and members['archiveSha256'] == cut['archive']['sha256'] and
         members['inventoryDigest'] == cut['members']['inventoryDigest'] and
         cut['members']['builtTreeByteEqual'] is True and cut['verification']['disposition'] == 'verified', 'Cut member ownership differs')
    member_rows = members['rows']
    need(member_rows and len(member_rows) == members['members'] == cut['members']['count'] and
         len({r['path'] for r in member_rows}) == len(member_rows) and
         sum(r['bytes'] for r in member_rows) == members['payloadBytes'] == cut['members']['payloadBytes'], 'Incomplete archive member population')
    need({r['path']: r['sha256'] for r in member_rows} == bootstrap, 'Actual archive/bootstrap member identity differs')

    # Mechanical installation and archive bootstrap are different input roles.
    install = documents['installRecord']
    need(spec['receipts']['installRecord']['path'] == selected['installRecordPath'] and
         spec['receipts']['installRecord']['sha256'] == selected['installRecordSha256'], 'Root install receipt binding differs')
    need(install['kind'] == 'local_unqualified_development_candidate_install' and
         install['schemaVersion'] == '1' and install['mode'] == 'apply' and
         install['status'] == 'INSTALL_COMPLETE_UNQUALIFIED', 'Actual completed mechanical installation required')
    need(all(install['cutRecord'][key] == spec['receipts']['cutRecord'][key] for key in ['path', 'bytes', 'sha256']) and
         all(install['archive'][key] == cut['archive'][key] for key in ['path', 'bytes', 'sha256']), 'Install cut/archive source differs')
    expected_install = {'packageName': cut['packageName'], 'packageVersion': cut['version'],
                        'productId': cut['productId'], **cut['identity'], 'sourceCommit': spec['sourceCommit']}
    need(all(install['expected'][key] == value for key, value in expected_install.items()) and
         install['version'] == cut['version'] and install['productId'] == cut['productId'], 'Install candidate identity differs')
    install_host, installed_root = Path(install['installHost']), Path(install['installedRoot'])
    need(str(install_host) == selected['installHost'] and str(installed_root) == selected['installedRoot'] and
         install_host.is_absolute() and installed_root.is_absolute() and
         install_host.resolve() == install_host and installed_root.resolve() == installed_root and
         stat.S_ISDIR(install_host.lstat().st_mode) and stat.S_ISDIR(installed_root.lstat().st_mode),
         'Different or noncanonical actual install coordinates')
    need(installed_root == install_host / 'node_modules' / cut['packageName'] and
         install['installedCli'] == str(installed_root / 'build/code/src/public/cli.js'), 'Actual install host/package relation differs')
    need(install['members'] == install['installedFiles'] == len(member_rows) and
         install['installedEqualsArchive'] is True and install['owners']['verification'] == 'verified' and
         install['owners']['installation'] == 'materialized' and install['owners']['installCandidateInLock'] is True and
         install['owners']['installedContentMatches'] is True, 'Mechanical install completion differs')
    need({str(install_host), str(installed_root)} <= set(binding['protectedRoots']), 'Actual install host/package must be protected')

    # The cut's authenticated git archive owns C0 source bytes. Do not invent a
    # postimage/proof receipt or confuse source.subject (commit label) with a path.
    result['sourceArchive'], _ = checked(cut['source']['sourceArchive'])
    source_rows = {}
    prefix = spec['tenantRelativePath'] + '/'
    with tarfile.open(cut['source']['sourceArchive']['path'], 'r:') as archive:
        for member in archive:
            if member.isdir():
                continue
            need(member.isfile() and member.name.startswith(prefix) and
                 '..' not in Path(member.name).parts and member.name not in source_rows, 'Unexpected C0 source archive member')
            relative = member.name[len(prefix):]
            need(relative and relative not in source_rows, 'Duplicate C0 source member')
            source_rows[relative] = {'bytes': member.size, 'sha256': hashlib.sha256(archive.extractfile(member).read()).hexdigest()}
    need(source_rows, 'Empty C0 source archive')
    generated = set(spec['generatedOutputs'])
    need(generated == {'contracts/capabilities/capability-definition-graph.json', 'product-toolchain-manifest.json'}, 'Generated output scope differs')
    basis_path = 'test_env/fixtures/abi5-root-candidate-basis.json'
    refresh = cut['source']['scratchBasisRefresh']
    need(refresh['owner'] == 'scripts/refresh-candidate-basis.mjs' and
         refresh['before']['path'] == refresh['after']['path'] == str(tenant / basis_path) and
         {k: refresh['before'][k] for k in ['bytes', 'sha256']} == source_rows[basis_path], 'Candidate-basis refresh does not begin at C0')
    result['candidateBasis'], basis_bytes = checked(cut['candidateBasis'], retain=True)
    need(cut['candidateBasis']['path'] == refresh['after']['path'] and
         result['candidateBasis'] == {k: refresh['after'][k] for k in ['bytes', 'sha256']} and
         cut['candidateBasis']['exactArchiveIdentity'] is True and cut['candidateBasis']['runtimePayload'] is False,
         'Candidate fixture must be the actual recorded refresh')
    need(json.loads(basis_bytes) == {'kind': 'abi5_root_candidate_basis', 'schemaVersion': '5.0.0',
         **cut['identity'], 'productId': cut['productId'], 'packageName': cut['packageName'], 'packageVersion': cut['version']},
         'Refreshed fixture differs from actual candidate identity')
    observed_source = []
    for relative, expected in sorted(source_rows.items()):
        if relative in generated or relative == basis_path:
            continue
        actual, _ = file(tenant / relative)
        need(actual == expected, 'Smoke source differs from C0: ' + relative)
        observed_source.append({'path': relative, **actual})
    result['tenantSource'] = {'count': len(observed_source), 'sha256': digest(observed_source)}
    result['smokeInputs'] = []
    need(len(spec['smokeInputs']) == 11 and len({r['path'] for r in spec['smokeInputs']}) == 11, 'Exact eleven-file smoke closure required')
    for row in spec['smokeInputs']:
        relative = row['path']
        expected = result['candidateBasis'] if relative == basis_path else source_rows[relative]
        need({k: row[k] for k in ['bytes', 'sha256']} == expected, 'Smoke input has no current C0/refresh owner: ' + relative)
        actual, _ = file(tenant / relative)
        need(actual == expected, 'Smoke input changed: ' + relative)
        result['smokeInputs'].append({'path': relative, **actual})

    for row in member_rows:
        actual, _ = file(tenant / row['path'])
        need(actual == {k: row[k] for k in ['bytes', 'sha256']}, 'Compiled cut payload differs: ' + row['path'])
    result['payload'] = {'count': len(bootstrap), 'sha256': digest(bootstrap)}
    result['generatedOutputs'] = []
    for key, expected in [('committed', source_rows), ('regenerated', {r['path']: r for r in member_rows})]:
        rows = cut['generated'][key]
        need({r['path'] for r in rows} == generated and len(rows) == len(generated), 'Generated population differs')
        for row in rows:
            need(all(row[k] == expected[row['path']][k] for k in ['bytes', 'sha256']), 'Generated source/archive join differs')
            result['generatedOutputs'].append({'stage': key, **row})
    need(bootstrap['product-toolchain-manifest.json'] == selected['manifestSha256'], 'Actual manifest bytes differ')

    # Reuse the retained complete inventory reader; adapt only the cut owner's
    # explicitly ordered inventory-digest fields. No new dependency ledger.
    checked(spec['dependencyReader'])
    loader = importlib.util.spec_from_file_location('retained_dependency_inventory', spec['dependencyReader']['path'])
    dependency_reader = importlib.util.module_from_spec(loader)
    loader.loader.exec_module(dependency_reader)
    installed = dependency_reader.inventory(installed_root)
    need(all(row['kind'] == 'file' for row in installed['rows']), 'Actual installed package contains a link')
    need({row['path']: {key: row[key] for key in ['bytes', 'sha256']} for row in installed['rows']} ==
         {row['path']: {key: row[key] for key in ['bytes', 'sha256']} for row in member_rows} and
         len(installed['rows']) == len(member_rows) and installed['bytes'] == members['payloadBytes'],
         'Complete actual installed package differs from archive members')
    result['installed'] = {'installHost': str(install_host), 'installedRoot': str(installed_root),
                           'installId': install['installId'], 'count': len(installed['rows']),
                           'bytes': installed['bytes'], 'sha256': installed['sha256']}
    original_inventory = documents['dependencyInventory']
    need(digest(original_inventory['rows']) == original_inventory['sha256'], 'Dependency ledger digest differs')
    current = dependency_reader.inventory(tenant / 'node_modules')
    need(current['rows'] == original_inventory['rows'] and current['sha256'] == original_inventory['sha256'] and
         current['bytes'] == original_inventory['bytes'], 'Copied cut dependency inventory differs')
    donor = dependency_reader.inventory(cut['dependencies']['donor'])
    need(donor == current and len(current['rows']) == cut['dependencies']['donorFilesAndLinks'], 'Actual cut donor/copy differs')
    cut_rows = [({'path': r['path'], 'kind': r['kind'], 'target': r['target']} if r['kind'] == 'symlink' else
                 {'path': r['path'], 'kind': r['kind'], 'bytes': r['bytes'], 'mode': r['mode'] & 0o777, 'sha256': r['sha256']}) for r in current['rows']]
    need(hashlib.sha256(json.dumps(cut_rows, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest() ==
         cut['dependencies']['donorInventoryDigest'], 'Dependency inventory is not the cut-consumed tree')
    pinned = cut['dependencies']['pinnedInventory']
    if pinned is not None:
        need(pinned['equal'] is True and pinned['rows'] == len(current['rows']) and
             all(pinned[k] == spec['receipts']['dependencyInventory'][k] for k in ['path', 'bytes', 'sha256']), 'Cut pinned dependency input differs')
    lock, _ = file(tenant / 'package-lock.json')
    need(lock == source_rows['package-lock.json'], 'C0 dependency lock differs')
    result['dependencies'] = {'sha256': current['sha256'], 'count': len(current['rows']), 'bytes': current['bytes'], 'lock': lock,
                              'donorInventoryDigest': cut['dependencies']['donorInventoryDigest']}
    built = dependency_reader.inventory(tenant / 'build')
    need(all(row['kind'] == 'file' for row in built['rows']), 'Build contains a link')
    need({'build/' + row['path']: row['sha256'] for row in built['rows']} ==
         {path: value for path, value in bootstrap.items() if path.startswith('build/')}, 'Build member set differs from candidate')
    result['build'] = {'sha256': built['sha256'], 'count': len(built['rows']), 'bytes': built['bytes']}
    result['native'] = [row for row in member_rows if row['path'].startswith('build/native/')]
    need(any(row['path'].endswith('.node') for row in result['native']), 'Packaged native owner absent')
    result['nativeBuildInputs'], _ = checked(cut['nativeBuildInputs'])
    need(cut['nativeBuildInputs']['path'] == str(tenant / 'scripts/native-build-inputs.json') and
         result['nativeBuildInputs'] == source_rows['scripts/native-build-inputs.json'], 'Native producer declaration differs from C0')
    # Historical OS git/tar remain exact byte-custody inputs, not recursive roots.
    protected = [cut['source']['sourceArchive']['path'], cut['dependencies']['donor'],
                 *[v['realPath'] for name, v in cut['toolchain'].items() if name not in {'git', 'tar'}]]
    need(set(protected) <= set(binding['protectedRoots']), 'Cut source/dependency/tool inputs must be protected in both physical roles')
    result['cutTools'] = {}
    for name, row in cut['toolchain'].items():
        actual, _ = file(row['realPath'])
        need(actual['sha256'] == row['sha256'], 'Cut tool changed: ' + name)
        result['cutTools'][name] = {'path': row['realPath'], **actual}
    need(cut['toolchain']['node']['execPath'] == binding['configuration']['nodePath'] and
         cut['toolchain']['npm']['realPath'] == binding['configuration']['toolchains']['npm']['executable'], 'Smoke and cut tools differ')

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
