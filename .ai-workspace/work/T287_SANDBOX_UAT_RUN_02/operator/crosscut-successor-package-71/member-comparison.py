import hashlib, json, pathlib, tarfile

repo = pathlib.Path('/Users/jim/src/apps/abiogenesis')
tenant = repo / 'build_tenants/abiogenesis/typescript'
work = repo / '.ai-workspace/work/T287_SANDBOX_UAT_RUN_02'
candidate = work / 'candidate-20'
baseline = work / 'candidate-19/packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz'
successor = candidate / 'packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz'
stages = ['crosscut-joint-build-64', 'crosscut-cold-retirement-build-68', 'crosscut-command-budget-build-75']
allowed, origins = {}, {}
for stage in stages:
    d = json.loads((work / 'operator' / stage / 'generated-delta.json').read_text())
    for row in d['changed']:
        pre = row.get('before', row.get('before64'))
        post = row.get('after', row.get('after68'))
        key = 'package/' + str(pathlib.Path(post['path']).relative_to(tenant))
        origins.setdefault(key, {'before': pre, 'stages': []})
        origins[key]['stages'].append(stage)
        allowed[key] = post

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
            assert after[path][key] == selected[key], (path, key)
        delta.append(dict(path=path, before=before[path], after=after[path]))
    assert not path.startswith(('package/test_env/', 'package/.ai-workspace/', 'package/design/', 'package/code/')), ('External source/test leakage', path)
assert set(v['path'] for v in delta) == set(allowed), 'Missing composed frozen delta'
for row in delta:
    earliest = origins[row['path']]['before']
    assert row['before']['sha256'] == earliest['sha256'], ('Unmatched earliest source preimage', row['path'])
    assert row['before']['byteCount'] == earliest['byteCount'], row['path']
    row['supportedStages'] = origins[row['path']]['stages']
catalog_diff = differences(old_manifest['publicContractCatalog'], new_manifest['publicContractCatalog'])
for row in catalog_diff:
    path = row['path']
    permitted = path == ['catalogDigest'] or (len(path) == 6 and path[0] == 'rows' and path[2:4] == ['nativeTypedLocator','declarationInventory'] and path[5] == 'declarationDigest') or (len(path) == 3 and path[0] == 'rows' and path[2] == 'contractDigest' and new_manifest['publicContractCatalog']['rows'][path[1]]['contractKind'] == 'native_typed_group') or (len(path) == 4 and path[0] == 'rows' and path[2:] == ['assetLocator','contentDigest'])
    assert permitted, ('Unexpected Public non-identity field', row)
contribution_diff = differences(old_manifest['contributionManifest'], new_manifest['contributionManifest'])
counts = dict(graph=0,contentRefs=0,publicationDigests=0,provenanceRefs=0,catalog=0)
for row in contribution_diff:
    path = row['path']
    if path == ['publicContractCatalogDigest']: counts['catalog'] += 1
    elif path == ['capabilityDefinitionGraph','graphDigest']: counts['graph'] += 1
    elif path in [['contributionManifestRef'],['descriptorRef'],['productContentDigest']]: counts['contentRefs'] += 1
    elif len(path) == 3 and path[0] == 'publicationBindings' and path[2] == 'publicationDigest': counts['publicationDigests'] += 1
    elif len(path) == 3 and path[0] == 'rows' and path[2] == 'provenanceRef': counts['provenanceRefs'] += 1
    else: raise AssertionError(('Unexpected contribution field', row))
assert counts == dict(graph=1,contentRefs=3,publicationDigests=10,provenanceRefs=47,catalog=1), counts
fixtures = sorted(path for path in after if 'fixture' in path.lower())
assert fixtures == sorted(['package/node_modules/fast-uri/test/fixtures/uri-js-parse.json','package/node_modules/fast-uri/test/fixtures/uri-js-serialize.json','package/node_modules/json-schema-traverse/spec/fixtures/schema.js']), fixtures
assert new_manifest['productContentDigest'] == 'sha256:0aec3faf0c230042f2c9457a03565eb9a4d566a41da9888e873438a9e7b17c5c'
report = dict(baseline=str(baseline),successor=str(successor),memberCount=len(after),allPathsTypesModesAndDigestsCompared=True,samePathsTypesModes=True,unchangedMemberCount=len(after)-len(delta),exactComposedFrozenDelta=delta,metadataAndDependenciesEqual=True,externalFixturesExcluded=True,catalogDifferences=catalog_diff,publicNonDigestFieldsEqual=True,exactContributionIdentityConsequences=contribution_diff,contributionIdentityCounts=counts,allOtherContributionFieldsEqual=True,fixtureMembers=fixtures,baselineRelation='Immutable19; accepted64/68/75 ordinary generated postimages. Each before body matches earliest frozen preimage; each after matches final frozen generated identity.')
with (candidate / 'member-delta.json').open('x') as stream: stream.write(json.dumps(report,indent=2)+'\n')
print(json.dumps(dict(memberCount=len(after),deltaCount=len(delta),deltaPaths=[v['path'] for v in delta],catalogChanges=len(catalog_diff),contributionChanges=len(contribution_diff))))
