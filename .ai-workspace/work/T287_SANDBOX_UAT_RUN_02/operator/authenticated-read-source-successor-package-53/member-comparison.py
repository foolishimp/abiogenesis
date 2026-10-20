import hashlib, json, pathlib, tarfile

repo = pathlib.Path('/Users/jim/src/apps/abiogenesis')
tenant = repo / 'build_tenants/abiogenesis/typescript'
work = repo / '.ai-workspace/work/T287_SANDBOX_UAT_RUN_02'
candidate = work / 'candidate-18'
baseline = work / 'candidate-17/packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz'
successor = candidate / 'packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz'
delta51 = json.loads((work / 'operator/authenticated-read-source-reuse-repair-51/generated-delta.json').read_text())['changes']
allowed = {'package/' + v['relativePath']: v for v in delta51}

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
            assert after[path][key] == selected['after'][key], (path, key)
        delta.append(dict(path=path, before=before[path], after=after[path]))
    assert not path.startswith(('package/test_env/', 'package/.ai-workspace/', 'package/design/', 'package/code/')), ('External source/test leakage', path)
assert set(v['path'] for v in delta) == set(allowed) and len(delta) == 5, 'Missing frozen delta'
catalog_diff = differences(old_manifest['publicContractCatalog'], new_manifest['publicContractCatalog'])
assert len(catalog_diff)==69, ('Unexpected catalog difference population',catalog_diff)
assert all(v['path']==['catalogDigest'] or (len(v['path'])==6 and v['path'][0]=='rows' and v['path'][2:4]==['nativeTypedLocator','declarationInventory'] and v['path'][5]=='declarationDigest') or (len(v['path'])==3 and v['path'][0]=='rows' and v['path'][2]=='contractDigest') for v in catalog_diff), ('Unexpected non-identity catalog consequence', catalog_diff)
contribution_diff = differences(old_manifest['contributionManifest'],new_manifest['contributionManifest'])
counts = dict(graph=0,contentRefs=0,publicationDigests=0,provenanceRefs=0,catalog=0)
for row in contribution_diff:
    path=row['path']
    if path==['publicContractCatalogDigest']:counts['catalog']+=1
    elif path==['capabilityDefinitionGraph','graphDigest']:counts['graph']+=1
    elif path in [['contributionManifestRef'],['descriptorRef'],['productContentDigest']]:counts['contentRefs']+=1
    elif len(path)==3 and path[0]=='publicationBindings' and path[2]=='publicationDigest':counts['publicationDigests']+=1
    elif len(path)==3 and path[0]=='rows' and path[2]=='provenanceRef':counts['provenanceRefs']+=1
    else:raise AssertionError(('Unexpected non-identity contribution change',path))
assert counts==dict(graph=1,contentRefs=3,publicationDigests=10,provenanceRefs=47,catalog=1),counts
report = dict(baseline=str(baseline), successor=str(successor), memberCount=len(after), allPathsTypesModesAndDigestsCompared=True, samePathsTypesModes=True, unchangedMemberCount=len(after)-len(delta), exactFrozen51Delta=delta, metadataAndDependenciesEqual=True, externalFixturesExcluded=True, catalogDifferences=catalog_diff, exactSupportedCatalogChanges=69, exactContributionIdentityConsequences=contribution_diff,contributionIdentityCounts=counts,allOtherContributionFieldsEqual=True, manifestDifferences=differences(old_manifest,new_manifest), fixtureMembers=[p for p in after if 'fixture' in p.lower()], baselineRelation='Immutable17 before bytes; accepted51 ordinary generated postimages; exact5 deltas.')
with (candidate / 'member-delta.json').open('x') as stream: stream.write(json.dumps(report, indent=2) + '\n')
print(json.dumps(dict(memberCount=len(after), deltaPaths=[v['path'] for v in delta], catalogChanges=69, fixtureMembers=report['fixtureMembers'])))
