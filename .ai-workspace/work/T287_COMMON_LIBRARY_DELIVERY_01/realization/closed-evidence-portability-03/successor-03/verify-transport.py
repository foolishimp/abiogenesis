"""Verify the finite inert carrier using repository/archive bytes only.

Reuses portability-02/successor-04's exact, archive-object, package-member,
ordered-chunk and native-coverage checks. Original absolute addresses are keys.
"""
from pathlib import Path, PurePosixPath
import argparse, collections, gzip, hashlib, io, json, stat, tarfile

parser = argparse.ArgumentParser()
parser.add_argument('--repo-root', type=Path)
args = parser.parse_args()
E = Path(__file__).resolve().parent
D = E.parent / 'successor-02'
ROOT = (args.repo_root or E.parents[5]).resolve()
assert E.is_relative_to(ROOT) and D.is_relative_to(ROOT)
checked = {}

def safe_relative(text):
    p = PurePosixPath(text)
    assert not p.is_absolute() and '..' not in p.parts, text
    return str(p)
def repo(text):
    p = ROOT / safe_relative(text)
    assert p.resolve().is_relative_to(ROOT) and not p.is_symlink(), text
    return p
def digest(p):
    assert p.is_relative_to(ROOT) and p.resolve().is_relative_to(ROOT)
    h = hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda: f.read(1024**2), b''): h.update(b)
    return h.hexdigest()
def exact(p, h, n=None):
    assert p.is_relative_to(ROOT) and p.is_file() and not p.is_symlink(), str(p)
    if n is not None: assert p.stat().st_size == n, str(p)
    if p not in checked: checked[p] = digest(p)
    assert checked[p] == h, str(p)
def read(p):
    assert p.is_relative_to(ROOT) and p.resolve().is_relative_to(ROOT)
    return json.loads(p.read_text())
def local(name): return read(D / safe_relative(name))
def local_pin(row, base): exact(base / safe_relative(row['path']), row['sha256'], row['bytes'])

successor = read(E / 'activation.json')
assert successor['dataRoot'] == str(D.relative_to(ROOT)) and successor['outputRoot'] == str(E.relative_to(ROOT))
exact(E / 'verification-input.json', read(E / 'verification-bind.json')['inputSha256'])
for row in read(E / 'verification-input.json')['records']: local_pin(row, E)
cut = successor['preservedStoppedCut']
exact(repo(cut['path']), cut['sha256'], cut['bytes'])
for row in read(repo(cut['path']))['files']: local_pin(row, D)
authorized_repository_packages = {row['archiveSha256']: row for row in successor['authorizedRepositoryPackages']}
assert set(authorized_repository_packages) == {'25e7f390a899f3bd9c49fa11a15feba1f59cb2a1d2ba4bad1f62c1abc4224079', 'fadd07e06799be957087419527c683ce18650ecf0abfe669c0f28e034d84aef6'}
activation = local('activation.json')
original_root = activation['repoRoot']
def original_repo_relative(text):
    p = PurePosixPath(text)
    assert p.is_relative_to(original_root) and '..' not in p.parts, text
    return str(p.relative_to(original_root))
def original_pin(row):
    exact(repo(original_repo_relative(row['path'])), row['sha256'], row['bytes'])

binding = local('verification-bind.json')
exact(D / 'verification-input.json', binding['inputSha256'])
for row in local('verification-input.json')['records']: local_pin(row, D)
for row in local('population-freeze.json')['files']: original_pin(row)
for name in ['population', 'packaging']:
    closure = local(name + '-command-closure.json')
    assert closure['exitCode'] == 0
    for row in closure['files']: local_pin(row, D)
for name in ['priorCarrier', 'priorPopulation', 'priorPackages', 'earlierPopulation', 'preservedStop']:
    original_pin(activation[name])
stopped = repo(original_repo_relative(activation['preservedStop']['path']))
for row in read(stopped)['files']: local_pin(row, stopped.parent)

# Read only the closed prior carrier controls needed by reused byte routes.
P01 = ROOT / '.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/closed-evidence-portability-01'
P02 = ROOT / '.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/closed-evidence-portability-02/successor-03'
prior = repo(original_repo_relative(activation['priorCarrier']['path']))
prior_manifest = prior.parent / 'manifest.json'
exact(prior_manifest, read(prior)['manifestSha256'])
for row in read(prior_manifest)['records']: local_pin(row, prior.parent)
prior_controls = {str(p.relative_to(ROOT)) for p in [P01 / 'freeze.json', P01 / 'manifest.json', P01 / 'archive-object-plan-02.json', P01 / 'archives-02.json', P02 / 'object-plan.json', P02 / 'archives.json']}
matched_controls = set()
for row in read(prior_manifest)['repositoryDependencies']:
    if row['path'] in prior_controls:
        exact(repo(row['path']), row['sha256'], row['bytes']); matched_controls.add(row['path'])
assert matched_controls == prior_controls
f01 = read(P01 / 'freeze.json')
exact(P01 / 'manifest.json', f01['manifest_sha256'])
for row in read(P01 / 'manifest.json')['records']: local_pin(row, P01)

population = local('population.json')['rows']
by_path = {row['path']: row for row in population}
assert len(by_path) == len(population)
package_specs = local('package-members.json')
needed_archives = set()
def need(t):
    if t['kind'] == 'archive_object': needed_archives.add(t['archive'])
    elif t['kind'] == 'archive_chunks':
        for chunk in t['chunks']: needed_archives.add(chunk['archive'])
for row in population: need(row['transport'])
for package in package_specs: need(package['transport'])

groups = collections.defaultdict(dict)
for row in read(P01 / 'archive-object-plan-02.json')['objects']:
    name = str((P01 / row['archive']).relative_to(ROOT))
    if name in needed_archives: groups[name][row['member']] = row
for directory in [P02, D]:
    for row in read(directory / 'object-plan.json')['objects']:
        if row['archive'] in needed_archives:
            assert row['member'] not in groups[row['archive']]
            groups[row['archive']][row['member']] = row
archive_rows = []
for row in read(P01 / 'archives-02.json')['archives']:
    name = str((P01 / row['path']).relative_to(ROOT))
    if name in needed_archives:
        archive_rows.append(dict(path=name, sha256=row['sha256'], compressedBytes=row['compressed_bytes'], uncompressedTarBytes=row['uncompressed_tar_bytes'], uncompressedTarSha256=row['uncompressed_tar_sha256']))
for directory in [P02, D]:
    archive_rows += [row for row in read(directory / 'archives.json')['archives'] if row['path'] in needed_archives]
assert {row['path'] for row in archive_rows} == needed_archives == set(groups)
assert len(archive_rows) == len(needed_archives)
objects = {}
for archive in archive_rows:
    name = safe_relative(archive['path']); p = repo(name)
    exact(p, archive['sha256'], archive['compressedBytes']); seen = set()
    with tarfile.open(p, 'r:gz') as tf:
        for member in tf:
            safe_relative(member.name)
            assert member.isfile() and member.name in groups[name] and member.name not in seen, member.name
            row = groups[name][member.name]; h = hashlib.sha256(); n = 0
            stream = tf.extractfile(member)
            for b in iter(lambda: stream.read(1024**2), b''): h.update(b); n += len(b)
            assert n == member.size == row['bytes'] and h.hexdigest() == row['sha256']
            assert member.mode == 0o644 and member.uid == member.gid == member.mtime == 0
            objects[(name, member.name)] = (h.hexdigest(), n); seen.add(member.name)
    assert seen == set(groups[name]), name
    h = hashlib.sha256(); n = 0
    with gzip.open(p, 'rb') as src:
        for b in iter(lambda: src.read(1024**2), b''): h.update(b); n += len(b)
    assert n == archive['uncompressedTarBytes'] and h.hexdigest() == archive['uncompressedTarSha256']

def object_stream(transport):
    archive = safe_relative(transport['archive']); member = safe_relative(transport['member'])
    assert (archive, member) in objects
    with tarfile.open(repo(archive), 'r:gz') as tf:
        source = tf.extractfile(member)
        for b in iter(lambda: source.read(1024**2), b''): yield b
def object_data(transport): return b''.join(object_stream(transport))

packages, package_members = {}, {}
for package in package_specs:
    t = package['transport']
    if t['kind'] == 'archive_object':
        data = object_data(t)
        expected_size = objects[(t['archive'], t['member'])][1]
    elif t['kind'] == 'repository_file':
        declared = authorized_repository_packages[package['archive_sha256']]
        assert t == declared['transport'] and package['bytes'] == declared['bytes']
        expected_size = declared['bytes']
        exact(repo(t['path']), package['archive_sha256'], expected_size)
        data = repo(t['path']).read_bytes()
    else: raise AssertionError('Undeclared package transport representation')
    h = hashlib.sha256(data).hexdigest()
    assert h == package['archive_sha256'] and len(data) == expected_size
    packages[h] = data
    expected = {row['member']: row for row in package['verified_members']}; seen = set()
    assert len(expected) == len(package['verified_members'])
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as tf:
        for member in tf:
            if member.isdir(): continue
            safe_relative(member.name)
            assert member.isfile() and member.name in expected and member.name not in seen
            row = expected[member.name]; payload = tf.extractfile(member).read(); got = hashlib.sha256(payload).hexdigest()
            assert got == row['sha256'] and len(payload) == member.size == row['bytes']
            if 'mode' in row: assert member.mode == int(row['mode'], 0)
            package_members[(h, member.name)] = (got, member.size); seen.add(member.name)
    assert seen == set(expected)

counts = collections.Counter(); repository_files = set(); chunk_files = 0
for row in population:
    t = row['transport']; want = (row['sha256'], row['bytes']); counts[t['kind']] += 1
    if t['kind'] == 'repository_file':
        exact(repo(t['path']), *want); repository_files.add(t['path'])
    elif t['kind'] == 'archive_object': assert objects[(t['archive'], t['member'])] == want
    elif t['kind'] == 'package_member': assert package_members[(t['archive_sha256'], t['member'])] == want
    elif t['kind'] == 'archive_chunks':
        h = hashlib.sha256(); n = 0
        for chunk in t['chunks']:
            assert chunk['offset'] == n and objects[(chunk['archive'], chunk['member'])] == (chunk['sha256'], chunk['bytes'])
            for b in object_stream(chunk): h.update(b); n += len(b)
        assert (h.hexdigest(), n) == want; chunk_files += 1
    else: raise AssertionError('Unknown declared transport representation')

def source_data(original_address):
    row = by_path[original_address]; t = row['transport']
    if t['kind'] == 'repository_file': data = repo(t['path']).read_bytes()
    elif t['kind'] == 'archive_object': data = object_data(t)
    elif t['kind'] == 'package_member':
        with tarfile.open(fileobj=io.BytesIO(packages[t['archive_sha256']]), mode='r:gz') as tf: data = tf.extractfile(t['member']).read()
    else: raise AssertionError('Selected JSON control carrier must not be chunked trace transport')
    assert hashlib.sha256(data).hexdigest() == row['sha256'] and len(data) == row['bytes']
    return data
def source_json(address): return json.loads(source_data(address))
def stable(value): return json.dumps(value, sort_keys=True, separators=(',', ':'))
def normalized(row, base):
    p = PurePosixPath(row['path']); assert '..' not in p.parts and 'continuation-17' not in p.parts
    return str(p if p.is_absolute() else PurePosixPath(base) / p)

metadata_rows = local('original-metadata.json')['rows']
metadata = collections.Counter((r['path'], r['route'], r['kind'], stable(r['source'])) for r in metadata_rows)
exclusion_rows = local('exclusions.json')['rows']
exclusions = collections.Counter((r['path'], r['route'], stable(r['source']), r['reason']) for r in exclusion_rows)
matched_metadata, matched_exclusions = collections.Counter(), collections.Counter()
covered = collections.Counter(); required_addresses = set()
v8_reason = 'Exact frozen V8 cache row; recomputable bytes excluded, original observation retained.'
node_reason = 'Exact system Node executable identity only; no executable copied.'
def required(row, base, route, declared_kind=None):
    address = normalized(row, base); p = PurePosixPath(address)
    if 'node-compile-cache' in p.parts:
        key = (address, route, stable(row), v8_reason)
        assert key in exclusions; matched_exclusions[key] += 1; covered['exact_v8_metadata_only'] += 1; return
    if not p.is_relative_to(original_root) and not p.is_relative_to('/private/tmp'):
        assert address == '/opt/homebrew/Cellar/node/24.7.0/bin/node'
        key = (address, route, stable(row), node_reason)
        assert key in exclusions; matched_exclusions[key] += 1; covered['system_node_identity_only'] += 1; return
    kind = declared_kind or row.get('kind', row.get('type', 'file'))
    if kind == 'regular': kind = 'file'
    key = (address, route, kind, stable(row)); assert key in metadata
    matched_metadata[key] += 1; covered[kind] += 1
    if kind == 'file':
        want = (row['sha256'], row.get('bytes', row.get('byteCount', row.get('size'))))
        actual = by_path[address]; assert (actual['sha256'], actual['bytes']) == want
        assert route in actual['routes']; required_addresses.add(address)
    elif kind == 'symlink': assert isinstance(row['target'], str)
    else: assert kind == 'directory'

# Native source bytes, not a newly inferred schema, determine finite coverage.
expected_routes = []
for s in activation['selectedFreezes']:
    required(s, original_root, 'selected freeze'); f = source_json(s['path'])
    for field in s['fields']:
        rows = f[field]; assert isinstance(rows, list)
        expected_routes.append(dict(index=s, field=field, base=s['base'], rows=len(rows)))
        for row in rows: required(row, s['base'], s['path'] + '#' + field, 'symlink' if field == 'symlinks' else None)
for s in activation['physicalIndexes']:
    required(s, original_root, 'selected physical inventory'); f = source_json(s['path'])
    base = f[s['baseField']] if s['baseField'] else original_root
    rows = f[s['field']]; expected_routes.append(dict(index=s, field=s['field'], base=base, rows=len(rows)))
    for row in rows: required(row, base, s['path'] + '#' + s['field'])
for row in activation['additionalRecords']: required(row, original_root, 'selected closing addendum')
for package in activation['newPackages']:
    required(package['archive'], original_root, 'exact package')
    required(package['inventory'], original_root, 'raw tar inventory')
assert expected_routes == local('source-routes.json')
assert matched_metadata == metadata and matched_exclusions == exclusions
assert required_addresses == set(by_path)
preflight = local('population-preflight.json')
assert len(population) == preflight['selectedAddresses'] and dict(counts) == preflight['representations']
assert len(metadata_rows) == preflight['frozenMetadataRows'] and len(exclusion_rows) == preflight['explicitExclusions']
assert len(packages) == preflight['packages']
new = local('archives.json')
assert new['totalCompressedBytes'] <= 1024**3 and new['logicalBoundBytes'] <= 2*1024**3
assert all(a['compressedBytes'] < 90*1024**2 for a in new['archives'])
result = dict(verified=True, originalSourceAddresses=len(population), originalFrozenMetadataRows=len(metadata_rows), representations=dict(counts), uniqueRepositoryFiles=len(repository_files), newArchives=len(new['archives']), reusedArchives=len(archive_rows)-len(new['archives']), archiveObjects=len(objects), originalPackages=len(packages), packageMembers=len(package_members), chunkedWholeFilesVerified=chunk_files, nativeCoverageRelations=dict(covered), exactExclusionRowsVerified=len(exclusion_rows), declaredFieldAdapters=len(expected_routes), originalAbsoluteSourcePathsOpened=0, originalTreesScanned=0, ProductExecutions=0, originalOwnerAcquisitions=0, copiedBytesConferRuntimeAuthority=False, oldFailedCutsRemainFailed=True)
result.update(verifierSuccessor=str(E.relative_to(ROOT)), preservedStoppedCut=successor['preservedStoppedCut'], packageRepositoryRoutesVerified=len(authorized_repository_packages), newArchivesCreated=0)
print(json.dumps(result, indent=2))
