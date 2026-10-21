"""Verify inert carrier bytes and finite source coverage without opening original addresses."""
from pathlib import Path, PurePosixPath
import argparse, collections, gzip, hashlib, io, json, stat, tarfile

parser=argparse.ArgumentParser()
parser.add_argument('--repo-root',type=Path)
args=parser.parse_args()
E=Path(__file__).resolve().parent
D=E.parent/'successor-03'
ROOT=(args.repo_root or E.parents[5]).resolve()
assert E.is_relative_to(ROOT) and D.is_relative_to(ROOT)
PRIOR=D.parent.parent/'closed-evidence-portability-01'
POPULATION_FREEZE='ebb57ed34ccb49eebd821dab546f6fbd46144bedcd2112c80a46f76cd255d829'
PRIOR_FREEZE='cc2fa82adf85c24d8f6c09fa419053985cdf28243e62af8d9c2424c635c43977'
STOPPED_FREEZE='d06a7a2890b1abd0cb90fa19770a909ac5f7c8a764db031ba7c54a74280aa5df'
PREDECESSOR_FREEZE='c89bd914df332cc466662b94229cdb4032825bfcca7a78557a30b25b42840647'
checked={}

def safe_relative(text):
    p=PurePosixPath(text)
    assert not p.is_absolute() and '..' not in p.parts, text
    return str(p)
def repo(text):
    p=ROOT/safe_relative(text)
    assert p.resolve().is_relative_to(ROOT) and not p.is_symlink(), text
    return p
def digest(p):
    assert p.is_relative_to(ROOT) and p.resolve().is_relative_to(ROOT)
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024**2),b''): h.update(b)
    return h.hexdigest()
def exact(p,h,n=None,mode=None):
    assert p.is_relative_to(ROOT) and p.is_file() and not p.is_symlink(), str(p)
    if n is not None: assert p.stat().st_size==n, str(p)
    if mode is not None: assert stat.S_IMODE(p.stat().st_mode)==int(mode,0), str(p)
    if p not in checked: checked[p]=digest(p)
    assert checked[p]==h, str(p)
def read(p):
    assert p.is_relative_to(ROOT) and p.resolve().is_relative_to(ROOT)
    return json.loads(p.read_text())
def local(name): return read(D/safe_relative(name))
def local_pin(row,base):
    exact(base/safe_relative(row['path']),row['sha256'],row['bytes'],row.get('mode'))

# Original absolute paths below are keys/metadata only. Translate only exact declared
# portable paths; never open an original source path as a fallback.
activation=local('activation.json')
original_root=str(Path(activation['writeTerritory']).parents[5])
def original_repo_relative(text):
    p=Path(text)
    assert p.is_relative_to(original_root), text
    return str(p.relative_to(original_root))
successor=read(E/'activation.json')
assert successor['dataRoot']==str(D.relative_to(ROOT)) and successor['outputRoot']==str(E.relative_to(ROOT))
exact(E/'verification-input.json',read(E/'verification-bind.json')['inputSha256'])
for row in read(E/'verification-input.json')['records']:local_pin(row,E)
exact(D/'stopped-freeze.json',PREDECESSOR_FREEZE)
exact(D/'stopped-manifest.json',local('stopped-freeze.json')['manifest']['sha256'])
for row in local('stopped-manifest.json')['records']:local_pin(row,D)
final_frozen=(E/'freeze.json').exists()
if final_frozen:
    f=read(E/'freeze.json');exact(E/'manifest.json',f['manifestSha256'])
    for row in read(E/'manifest.json')['records']:local_pin(row,E)
exact(D/'verification-input.json',local('verification-bind.json')['inputSha256'])
for row in local('verification-input.json')['records']:local_pin(row,D)
exact(D/'population-freeze.json',POPULATION_FREEZE)
for row in local('population-freeze.json')['files']:
    exact(repo(original_repo_relative(row['path'])),row['sha256'],row['bytes'],row.get('mode'))
exact(PRIOR/'freeze.json',PRIOR_FREEZE)
exact(PRIOR/'manifest.json',read(PRIOR/'freeze.json')['manifest_sha256'])
for row in read(PRIOR/'manifest.json')['records']:local_pin(row,PRIOR)
exact(D.parent/'stopped-freeze.json',STOPPED_FREEZE)
stopped=read(D.parent/'stopped-freeze.json')
exact(D.parent/'stopped-manifest.json',stopped['manifest']['sha256'])
for row in read(D.parent/'stopped-manifest.json')['files']:
    exact(repo(original_repo_relative(row['path'])),row['sha256'],row['bytes'],row['mode'])

groups=collections.defaultdict(dict)
for row in read(PRIOR/'archive-object-plan-02.json')['objects']:
    name=str((PRIOR/row['archive']).relative_to(ROOT)); groups[name][row['member']]=row
for row in local('object-plan.json')['objects']:
    assert row['member'] not in groups[row['archive']]
    groups[row['archive']][row['member']]=row
archive_rows=[]
for row in read(PRIOR/'archives-02.json')['archives']:
    archive_rows.append(dict(path=str((PRIOR/row['path']).relative_to(ROOT)),sha256=row['sha256'],compressedBytes=row['compressed_bytes'],uncompressedTarBytes=row['uncompressed_tar_bytes'],uncompressedTarSha256=row['uncompressed_tar_sha256']))
archive_rows+=local('archives.json')['archives']
objects={}
for archive in archive_rows:
    name=safe_relative(archive['path']);p=repo(name)
    exact(p,archive['sha256'],archive['compressedBytes']);seen=set()
    with tarfile.open(p,'r:gz') as tf:
        for member in tf:
            safe_relative(member.name)
            assert member.isfile() and member.name in groups[name] and member.name not in seen, member.name
            row=groups[name][member.name];h=hashlib.sha256();n=0;stream=tf.extractfile(member)
            for b in iter(lambda:stream.read(1024**2),b''):h.update(b);n+=len(b)
            assert n==member.size==row['bytes'] and h.hexdigest()==row['sha256']
            assert member.mode==0o644 and member.uid==member.gid==member.mtime==0
            objects[(name,member.name)]=(h.hexdigest(),n);seen.add(member.name)
    assert seen==set(groups[name]), name
    h=hashlib.sha256();n=0
    with gzip.open(p,'rb') as src:
        for b in iter(lambda:src.read(1024**2),b''):h.update(b);n+=len(b)
    assert n==archive['uncompressedTarBytes'] and h.hexdigest()==archive['uncompressedTarSha256']
assert set(groups)=={r['path'] for r in archive_rows}

def object_stream(transport):
    archive=safe_relative(transport['archive']);member=safe_relative(transport['member'])
    assert (archive,member) in objects
    with tarfile.open(repo(archive),'r:gz') as tf:
        source=tf.extractfile(member)
        for b in iter(lambda:source.read(1024**2),b''):yield b
def object_data(transport): return b''.join(object_stream(transport))

packages={};package_members={}
for package in local('package-members.json'):
    t=package['transport']
    assert t['kind']=='archive_object', 'Package archive transport must be a verified inert object'
    data=object_data(t);h=hashlib.sha256(data).hexdigest()
    assert h==package['archive_sha256'];packages[h]=data
    expected={r['member']:r for r in package['verified_members']};seen=set()
    assert len(expected)==len(package['verified_members'])
    with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as tf:
        for member in tf:
            if member.isdir():continue
            safe_relative(member.name)
            assert member.isfile() and member.name in expected and member.name not in seen
            row=expected[member.name];payload=tf.extractfile(member).read();got=hashlib.sha256(payload).hexdigest()
            assert got==row['sha256'] and len(payload)==member.size==row['bytes']
            if 'mode' in row:assert member.mode==int(row['mode'],0)
            package_members[(h,member.name)]=(got,member.size);seen.add(member.name)
    assert seen==set(expected)

population=local('population.json')['rows'];by_path={r['path']:r for r in population}
assert len(by_path)==len(population)
counts=collections.Counter();repository_files=set();chunk_files=0
for row in population:
    t=row['transport'];want=(row['sha256'],row['bytes']);counts[t['kind']]+=1
    if t['kind']=='repository_file':
        p=repo(t['path']);exact(p,*want);repository_files.add(t['path'])
    elif t['kind']=='archive_object':assert objects[(t['archive'],t['member'])]==want
    elif t['kind']=='package_member':assert package_members[(t['archive_sha256'],t['member'])]==want
    elif t['kind']=='archive_chunks':
        h=hashlib.sha256();n=0
        for chunk in t['chunks']:
            assert chunk['offset']==n and objects[(chunk['archive'],chunk['member'])]==(chunk['sha256'],chunk['bytes'])
            for b in object_stream(chunk):h.update(b);n+=len(b)
        assert (h.hexdigest(),n)==want;chunk_files+=1
    else:raise AssertionError('Unknown transport representation')

def source_data(original_address):
    row=by_path[original_address];t=row['transport']
    if t['kind']=='repository_file':data=repo(t['path']).read_bytes()
    elif t['kind']=='archive_object':data=object_data(t)
    elif t['kind']=='package_member':
        with tarfile.open(fileobj=io.BytesIO(packages[t['archive_sha256']]),mode='r:gz') as tf:data=tf.extractfile(t['member']).read()
    else:raise AssertionError('Selected JSON control carrier must not use chunked trace transport')
    assert hashlib.sha256(data).hexdigest()==row['sha256'] and len(data)==row['bytes']
    return data
def source_json(address):return json.loads(source_data(address))
metadata={r['path']:r for r in local('original-metadata.json')['rows']}
exclusions=local('exclusions.json')['rows']
realization=str(Path(activation['writeTerritory']).parents[1])
exclusion_reason='Recomputable V8 compile cache; original inventory retained, bytes not copied'
# Explicit closed native routes; no universal schema or cache wildcard admission.
exclusion_bases={str(Path(realization)/suffix):original_root for suffix in [
    'combined-final-02/freeze.json',
    'baseline-diagnostics-01/p1/physical-resources.json',
    'baseline-diagnostics-01/p3/physical-resources.json',
    'l4-final-candidate-02/p1/physical-resources.json']}
def normalize_address(row,base):
    p=PurePosixPath(row['path']);assert '..' not in p.parts
    return str(p if p.is_absolute() else PurePosixPath(base)/p)
def exclusion_key(row,base,route,reason):
    return (normalize_address(row,base),route,json.dumps(row,sort_keys=True,separators=(',',':')),reason)
v8_excluded=set()
for record in exclusions:
    if record['reason']!=exclusion_reason:continue
    assert record['route'] in exclusion_bases
    row=record['source'];assert isinstance(row,dict) and 'path' in row
    key=exclusion_key(row,exclusion_bases[record['route']],record['route'],record['reason'])
    assert key not in v8_excluded;v8_excluded.add(key)
matched_exclusions=set()
covered=collections.Counter()
def required(row,base,route):
    address=normalize_address(row,base)
    key=exclusion_key(row,base,route,exclusion_reason)
    if key in v8_excluded:
        assert exclusion_bases[route]==base
        matched_exclusions.add(key);covered['explicit_v8_metadata_only']+=1;return
    assert 'node-compile-cache' not in PurePosixPath(address).parts, ('No exact declared exclusion relation',address,route)
    kind=row.get('type',row.get('kind','file'));m=metadata[address];assert m['kind']==kind
    if 'mode' in row:assert int(m['mode'],0)==(int(row['mode'],0) if isinstance(row['mode'],str) else row['mode'])
    for k in ['device','inode']:
        if k in row:assert row[k]==m[k]
    if kind=='file':
        actual=by_path[address]
        if 'sha256' in row:assert actual['sha256']==row['sha256']
        if 'bytes' in row:assert actual['bytes']==row['bytes']
    elif kind=='symlink':assert row['target']==m['target']
    else:assert kind=='directory'
    covered[kind]+=1

# Re-evaluate finite source coverage from transported native carriers themselves.
for pin in activation['selectedFreezes']:
    required(pin,original_root,'selected closed freeze');f=source_json(pin['path'])
    rows=f['records'] if '/preparation/' in pin['path'] else f['files']
    for row in rows:required(row,original_root,pin['path'])
realization=str(Path(activation['writeTerritory']).parents[1])
physical_routes=['baseline-diagnostics-01/p1/physical-resources.json','baseline-diagnostics-01/p3/physical-resources.json','l4-final-candidate-02/p1/physical-resources.json']
for suffix in physical_routes:
    inventory=source_json(str(Path(realization)/suffix));roots=[Path(p) for p in inventory['roots'].values()]
    for row in inventory['files']:
        p=Path(row['path']);assert any(p==r or p.is_relative_to(r) for r in roots)
        required(row,original_root,str(Path(realization)/suffix))
config_routes=['baseline-diagnostics-01/p1/runtime-configuration.json','baseline-diagnostics-01/p3/runtime-configuration.json','l4-final-candidate-02/p1/configuration.json']
for suffix in config_routes:
    path=str(Path(realization)/suffix);c=source_json(path);subject=c['subject']
    assert 'stdo3-native-selection' not in c['lanes'], 'This population selects no native lane'
    provider_rows=[r for r in exclusions if r['route']==path and 'applicability' in r]
    assert len(provider_rows)==1
    expected='present_unused_non_native' if 'provider' in c else 'absent_not_applicable_non_native'
    assert provider_rows[0]['applicability']==expected
    if 'provider' in c:assert provider_rows[0]['source']==c['provider']
    else:assert provider_rows[0]['source'] is None
    for key in ['archive','manifest','packageInventory','supportManifest']:required(subject[key],original_root,path)
    for row in source_json(subject['supportManifest']['path'])['files']:required(row,subject['stageTenant'],subject['supportManifest']['path'])
    for inv in subject['inventories']:
        required(inv,original_root,path)
        for row in source_json(inv['path'])['files']:required(row,inv['root'],inv['path'])
    for row in [c['externalConsumer'],*c['requiredEvidence']]:required(row,original_root,path)
assert matched_exclusions==v8_excluded, 'Orphan or unconsumed exact exclusion record'
preflight=local('population-preflight.json')
assert len(population)==preflight['selectedAddresses'] and dict(counts)==preflight['representations']
assert len(metadata)==preflight['metadataRows'] and len(package_members)==preflight['packageMembers']
assert len(packages)==preflight['packageCount']
new=local('archives.json');assert new['totalCompressedBytes']<=1024**3 and new['logicalBoundBytes']<=2*1024**3
assert all(a['compressedBytes']<90*1024**2 for a in new['archives'])
print(json.dumps(dict(verified=True,finalFreezePresent=final_frozen,originalSourceAddresses=len(population),metadataRows=len(metadata),representations=dict(counts),uniqueRepositoryFiles=len(repository_files),newArchives=len(new['archives']),reusedArchives=len(archive_rows)-len(new['archives']),archiveObjects=len(objects),originalPackages=len(packages),packageMembers=len(package_members),chunkedWholeFilesVerified=chunk_files,nativeCoverageRelations=dict(covered),providerApplicabilityVerified=True,exactExclusionRowsVerified=len(matched_exclusions),dataRoot=str(D.relative_to(ROOT)),outputRoot=str(E.relative_to(ROOT)),archivesCreatedThisSuccessor=0,originalAbsoluteSourcePathsOpened=0,ProductExecutions=0,originalOwnerAcquisitions=0,copiedBytesConferRuntimeAuthority=False),indent=2))
