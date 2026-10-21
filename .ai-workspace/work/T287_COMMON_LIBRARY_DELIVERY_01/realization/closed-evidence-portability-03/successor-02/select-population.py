"""Finite successor of portability02's source-address/package/object reader.
Only explicit frozen rows select bytes. No original directory is traversed.
"""
from pathlib import Path
import collections, hashlib, json, os, stat, subprocess, tarfile, traceback

D = Path(__file__).resolve().parent
R = D.parents[5]
A = json.loads((D / 'activation.json').read_text())
CHUNK = A['limits']['objectChunkBytes']
selected, metadata, exclusions, routes = {}, [], [], []

def read(p): return json.loads(Path(p).read_text())
def digest(p):
    h = hashlib.sha256()
    with Path(p).open('rb') as f:
        for b in iter(lambda: f.read(1024**2), b''): h.update(b)
    return h.hexdigest()
def write(name, obj):
    with (D / name).open('x') as f: json.dump(obj, f, separators=(',', ':')); f.write('\n')
def pin(p):
    p = Path(p)
    return dict(path=str(p), sha256=digest(p), bytes=p.stat().st_size)
def exact(row):
    p = Path(row['path'])
    assert p.is_file() and not p.is_symlink(), str(p)
    assert p.stat().st_size == row['bytes'] and digest(p) == row['sha256'], str(p)
def add(row, base, route, declared_kind=None):
    native = dict(row); p = Path(row['path']); p = p if p.is_absolute() else Path(base) / p
    assert '..' not in p.parts and 'continuation-17' not in p.parts, str(p)
    key = str(p)
    kind = declared_kind or row.get('kind', row.get('type', 'file'))
    if kind == 'regular': kind = 'file'
    if 'node-compile-cache' in p.parts:
        exclusions.append(dict(path=key, source=native, route=route, reason='Exact frozen V8 cache row; recomputable bytes excluded, original observation retained.')); return
    if not p.is_relative_to(R) and not p.is_relative_to('/private/tmp'):
        assert key == '/opt/homebrew/Cellar/node/24.7.0/bin/node', ('Unselected external source', key)
        exclusions.append(dict(path=key, source=native, route=route, reason='Exact system Node executable identity only; no executable copied.')); return
    metadata.append(dict(path=key, source=native, route=route, kind=kind))
    if kind != 'file':
        assert kind in ('directory', 'symlink'), (key, kind)
        return
    size = row.get('bytes', row.get('byteCount', row.get('size')))
    h = row.get('sha256')
    assert isinstance(size, int) and isinstance(h, str) and len(h) == 64, (route, native)
    if key in selected:
        assert (selected[key]['sha256'], selected[key]['bytes']) == (h, size), ('Conflicting frozen address', key)
        selected[key]['routes'].append(route); return
    selected[key] = dict(path=key, sha256=h, bytes=size, routes=[route])

try:
    for name in ['priorCarrier', 'priorPopulation', 'priorPackages', 'earlierPopulation']:
        exact(A[name])
    for s in A['selectedFreezes']:
        exact(s); add(s, R, 'selected freeze'); f = read(s['path'])
        for field in s['fields']:
            assert isinstance(f[field], list), (s['path'], field)
            routes.append(dict(index=s, field=field, base=s['base'], rows=len(f[field])))
            for row in f[field]: add(row, s['base'], s['path'] + '#' + field, 'symlink' if field == 'symlinks' else None)
    for s in A['physicalIndexes']:
        exact(s); add(s, R, 'selected physical inventory'); f = read(s['path'])
        base = f[s['baseField']] if s['baseField'] else str(R)
        routes.append(dict(index=s, field=s['field'], base=base, rows=len(f[s['field']])))
        for row in f[s['field']]: add(row, base, s['path'] + '#' + s['field'])
    for s in A['additionalRecords']: exact(s); add(s, R, 'selected closing addendum')

    # Reuse exact byte relations from the closed carriers, without original-path access.
    prior = read(A['priorPopulation']['path'])['rows']
    byte_routes = {(r['sha256'], r['bytes']): r['transport'] for r in prior}
    oldroot = R / '.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/closed-evidence-portability-01'
    for row in read(A['earlierPopulation']['path'])['rows']:
        t = dict(row['transport'])
        if t['kind'] == 'archive_object': t['archive'] = str((oldroot / t['archive']).relative_to(R))
        byte_routes.setdefault((row['sha256'], row['bytes']), t)
    packages = read(A['priorPackages']['path'])
    for spec in A['newPackages']:
        exact(spec['archive']); exact(spec['inventory'])
        add(spec['archive'], R, 'exact package'); add(spec['inventory'], R, 'raw tar inventory')
        expected = {r['path']: r for r in read(spec['inventory']['path'])['files']}
        members, seen = [], set()
        with tarfile.open(spec['archive']['path'], 'r:gz') as tf:
            for member in tf:
                assert member.isfile() and member.name.startswith('package/'), member.name
                rel = member.name[len('package/'):]; assert rel not in seen; seen.add(rel)
                row = expected[rel]; data = tf.extractfile(member).read(); h = hashlib.sha256(data).hexdigest()
                assert h == row['sha256'] and len(data) == row['bytes'] and member.mode == int(row['mode'], 0), rel
                members.append(dict(member=member.name, sha256=h, bytes=len(data), mode=oct(member.mode)))
        assert seen == set(expected)
        package = dict(archive_sha256=spec['archive']['sha256'], archive_source=spec['archive']['path'], bytes=spec['archive']['bytes'], verified_members=members)
        packages.append(package)
        for row in members:
            byte_routes.setdefault((row['sha256'], row['bytes']), dict(kind='package_member', archive_sha256=package['archive_sha256'], member=row['member']))

    # A single ignore query distinguishes visible repository bytes from inert payload.
    repo_rows = [r for r in selected.values() if Path(r['path']).is_relative_to(R)]
    relative = [str(Path(r['path']).relative_to(R)) for r in repo_rows]
    result = subprocess.run(['git', 'check-ignore', '--no-index', '-z', '--stdin'], cwd=R,
                            input=('\0'.join(relative) + '\0').encode(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    assert result.returncode in (0, 1), result.stderr.decode()
    ignored = set(result.stdout.decode().split('\0')); checked_repo = {}
    for row in repo_rows:
        key = (row['sha256'], row['bytes']); rel = str(Path(row['path']).relative_to(R))
        if key in byte_routes or rel in ignored: continue
        exact(row); checked_repo[rel] = row['sha256']
        byte_routes[key] = dict(kind='repository_file', path=rel)

    objects, source_states = {}, {}
    for row in selected.values():
        key = (row['sha256'], row['bytes'])
        if key in byte_routes: continue
        p = Path(row['path']); assert p.is_file() and not p.is_symlink() and p.resolve() == p, str(p)
        s = p.stat(); parts = []; whole = hashlib.sha256(); offset = 0
        source_states[str(p)] = dict(path=str(p), kind='file', size=s.st_size, mode=oct(stat.S_IMODE(s.st_mode)), device=s.st_dev, inode=s.st_ino, nlink=s.st_nlink, mtime_ns=s.st_mtime_ns, ctime_ns=s.st_ctime_ns)
        with p.open('rb') as src:
            while True:
                data = src.read(CHUNK)
                if not data: break
                whole.update(data); h = hashlib.sha256(data).hexdigest()
                objects.setdefault(h, dict(sha256=h, bytes=len(data), source=str(p), source_offset=offset, member='objects/sha256/' + h))
                parts.append(dict(sha256=h, bytes=len(data), offset=offset)); offset += len(data)
        assert whole.hexdigest() == row['sha256'] and offset == row['bytes'], str(p)
        if not parts:
            h = row['sha256']; objects.setdefault(h, dict(sha256=h, bytes=0, source=str(p), source_offset=0, member='objects/sha256/' + h)); parts = [dict(sha256=h, bytes=0, offset=0)]
        byte_routes[key] = dict(kind='pending_objects', chunks=parts)
    number, used = 0, 0
    for h in sorted(objects):
        o = objects[h]
        if number == 0 or used + o['bytes'] > CHUNK: number += 1; used = 0
        o['archive'] = str((D / f'bytes-{number:03d}.tar.gz').relative_to(R)); used += o['bytes']
    def concrete(t):
        if t['kind'] != 'pending_objects': return t
        chunks = [dict(archive=objects[x['sha256']]['archive'], member=objects[x['sha256']]['member'], sha256=x['sha256'], bytes=x['bytes'], offset=x['offset']) for x in t['chunks']]
        return dict(kind='archive_object', archive=chunks[0]['archive'], member=chunks[0]['member']) if len(chunks) == 1 else dict(kind='archive_chunks', chunks=chunks)
    for row in selected.values(): row['transport'] = concrete(byte_routes[(row['sha256'], row['bytes'])])
    for package in packages:
        if 'transport' not in package: package['transport'] = selected[package['archive_source']]['transport']
    write('population.json', dict(kind='closed_evidence_source_address_map', rows=list(selected.values())))
    write('source-routes.json', routes)
    write('original-metadata.json', dict(semantics='Original frozen rows, not fresh lstat assertions or restored runtime authority', rows=metadata))
    write('object-source-states.json', dict(rows=list(source_states.values())))
    write('exclusions.json', dict(rows=exclusions, ambientCachesSelected=False, credentialsSelected=False, systemExecutablesCopied=False))
    write('package-members.json', packages)
    write('object-plan.json', dict(objects=list(objects.values()), chunkBytes=CHUNK, transportMode='0o644', symlinks=False, hardlinks=False))
    payload = sum(x['bytes'] for x in objects.values())
    authored = sum(p.stat().st_size for p in D.iterdir() if p.is_file())
    assert payload + authored + 16 * 1024**2 <= A['limits']['newLogicalPayloadPlusMetadata'], (payload, authored)
    result = dict(status='satisfied', selectedAddresses=len(selected), frozenMetadataRows=len(metadata), explicitExclusions=len(exclusions), newUniqueObjects=len(objects), newObjectPayloadBytes=payload, authoredBytesAtPreflight=authored, logicalCarrierUpperBoundWithoutSmallReceipts=payload + authored, logicalLimit=A['limits']['newLogicalPayloadPlusMetadata'], archiveCount=number, representations=dict(collections.Counter(r['transport']['kind'] for r in selected.values())), packages=len(packages), originalTreesScanned=0, originalObjectSourcesRead=len(source_states), repositorySourcesVerified=len(checked_repo), archivesWritten=0, ProductExecutions=0)
    write('population-preflight.json', result)
    closed_names = ['activation.json', 'HOW.md', 'adapter-inspection.json', 'script-reuse.json', 'select-population.py', 'population.command.json', 'population.json', 'source-routes.json', 'original-metadata.json', 'object-source-states.json', 'exclusions.json', 'package-members.json', 'object-plan.json', 'population-preflight.json']
    write('population-freeze.json', dict(status='frozen_before_archives', commandStreams='Bound only by the enclosing freeze after process completion.', files=[pin(D / name) for name in closed_names]))
    print(json.dumps(result))
except Exception as error:
    write('STOP-population.json', dict(status='stopped', firstCause=repr(error), traceback=traceback.format_exc(), selectedSoFar=len(selected), archivesWritten=0, stop='Return Root before repair or retry.'))
    raise
