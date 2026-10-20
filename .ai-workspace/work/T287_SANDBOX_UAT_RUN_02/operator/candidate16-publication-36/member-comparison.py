import hashlib, json, pathlib, tarfile

repo = pathlib.Path('/Users/jim/src/apps/abiogenesis')
tenant = repo / 'build_tenants/abiogenesis/typescript'
work = repo / '.ai-workspace/work/T287_SANDBOX_UAT_RUN_02'
candidate = work / 'candidate-16'
baseline = work / 'candidate-15/packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz'
successor = candidate / 'packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz'
readiness = json.loads((work / 'operator/event-memory-repair-35/readiness.json').read_text())
allowed = {'package/' + str(pathlib.Path(v['postimage']['path']).relative_to(tenant)): v for v in readiness['generatedDelta']}

def inventory(path):
    with tarfile.open(path, 'r:gz') as archive:
        members = archive.getmembers()
        assert len(members) == len(set(v.name for v in members)), 'Duplicate member'
        rows = {}
        for member in members:
            assert member.isfile() and member.name.startswith('package/') and '..' not in pathlib.PurePosixPath(member.name).parts, member.name
            body = archive.extractfile(member).read()
            rows[member.name] = dict(path=member.name, type=member.type.decode(), mode=member.mode, byteCount=len(body), sha256=hashlib.sha256(body).hexdigest())
        metadata = json.loads(archive.extractfile('package/package.json').read())
        manifest = json.loads(archive.extractfile('package/product-toolchain-manifest.json').read())
    return rows, metadata, manifest

def differences(a, b, path=()):
    assert type(a) == type(b), ('Type drift', path)
    if isinstance(a, dict):
        assert a.keys() == b.keys(), ('Key drift', path)
        return [v for key in a for v in differences(a[key], b[key], path + (key,))]
    if isinstance(a, list):
        assert len(a) == len(b), ('Array drift', path)
        return [v for index in range(len(a)) for v in differences(a[index], b[index], path + (index,))]
    return [] if a == b else [dict(path=list(path), before=a, after=b)]

before, old_metadata, old_manifest = inventory(baseline)
after, new_metadata, new_manifest = inventory(successor)
assert before.keys() == after.keys() and len(after) == 5265, 'Membership drift'
assert old_metadata == new_metadata, 'Package metadata/dependency drift'
delta = []
for path in sorted(after):
    assert (before[path]['type'], before[path]['mode']) == (after[path]['type'], after[path]['mode']), path
    if before[path] != after[path]:
        assert path in allowed, ('Unexpected byte delta', path)
        selected = allowed[path]
        for key in ['sha256', 'byteCount']:
            assert before[path][key] == selected['preimage'][key] and after[path][key] == selected['postimage'][key], (path, key)
        delta.append(dict(path=path, before=before[path], after=after[path]))
    assert not path.startswith(('package/test_env/', 'package/.ai-workspace/', 'package/design/', 'package/code/')), ('External source/test leakage', path)
assert set(v['path'] for v in delta) == set(allowed) and len(delta) == 8, 'Missing frozen delta'
catalog_diff = differences(old_manifest['publicContractCatalog'], new_manifest['publicContractCatalog'])
counts = dict(catalogDigest=0, declarationDigests=0, contractDigests=0)
for row in catalog_diff:
    path = row['path']
    if path == ['catalogDigest']: counts['catalogDigest'] += 1
    elif len(path) == 6 and path[0] == 'rows' and path[2:4] == ['nativeTypedLocator', 'declarationInventory'] and path[5] == 'declarationDigest':
        assert new_manifest['publicContractCatalog']['rows'][path[1]]['nativeTypedLocator']['declarationInventory'][path[4]]['declarationPath'] == 'build/code/src/shared/canonical_json.d.ts'
        counts['declarationDigests'] += 1
    elif len(path) == 3 and path[0] == 'rows' and path[2] == 'contractDigest': counts['contractDigests'] += 1
    else: raise AssertionError(('Unexpected Public catalog difference', path))
assert counts == dict(catalogDigest=1, declarationDigests=50, contractDigests=23), counts
report = dict(baseline=str(baseline), successor=str(successor), memberCount=len(after), allPathsTypesModesAndDigestsCompared=True, samePathsTypesModes=True, unchangedMemberCount=len(after)-len(delta), exactFrozen35Delta=delta, metadataAndDependenciesEqual=True, externalFixturesExcluded=True, catalogDifferences=catalog_diff, exactSupportedCatalogChanges=counts, fixtureMembers=[p for p in after if 'fixture' in p.lower()])
with (candidate / 'member-delta.json').open('x') as stream: stream.write(json.dumps(report, indent=2) + '\n')
print(json.dumps(dict(memberCount=len(after), deltaPaths=[v['path'] for v in delta], catalogChanges=counts, fixtureMembers=report['fixtureMembers'])))
