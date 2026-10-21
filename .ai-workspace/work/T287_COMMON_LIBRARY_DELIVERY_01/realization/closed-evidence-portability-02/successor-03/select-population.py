"""Finite closed-carrier reader. Reads selected original bytes; writes no archives."""
from pathlib import Path
import collections, datetime, hashlib, json, os, re, stat, tarfile, traceback

OUT = Path(__file__).resolve().parent
STOPPED = OUT.parent
REALIZATION = STOPPED.parent
W = REALIZATION.parent
ROOT = W.parents[2]
PRIOR = REALIZATION / 'closed-evidence-portability-01'
LIMIT = 2 * 1024**3
CHUNK = 64 * 1024**2
selected, metadata, exclusions, routes = {}, {}, [], []
physical_roots = [Path('/private/tmp/abg-stdo3-baseline-diag-aa3f6c60f8d944cb'),
                  Path('/private/tmp/abg-stdo3-final-02-08c0665f0fed9141')]

def read(p): return json.loads(Path(p).read_text())
def write(name, obj):
    with (OUT / name).open('x') as f:
        json.dump(obj, f, separators=(',', ':'))
        f.write('\n')
def digest(p):
    h = hashlib.sha256()
    with Path(p).open('rb') as f:
        for b in iter(lambda: f.read(1024*1024), b''): h.update(b)
    return h.hexdigest()
def mode(v): return int(v, 0) if isinstance(v, str) else v
def absolute(p, base=ROOT):
    p = Path(p)
    return p if p.is_absolute() else base / p
def permitted(p):
    assert not re.search(r'continuation[-_]?17', str(p), re.I), str(p)
    assert p.is_relative_to(ROOT) or any(p.is_relative_to(x) for x in physical_roots), str(p)
def snap(p):
    permitted(p)
    s = p.lstat()
    kind = 'file' if stat.S_ISREG(s.st_mode) else 'directory' if stat.S_ISDIR(s.st_mode) else 'symlink' if stat.S_ISLNK(s.st_mode) else 'other'
    assert kind != 'other', str(p)
    row = dict(path=str(p), kind=kind, mode=oct(stat.S_IMODE(s.st_mode)), size=s.st_size,
               device=s.st_dev, inode=s.st_ino, nlink=s.st_nlink,
               mtime_ns=s.st_mtime_ns, ctime_ns=s.st_ctime_ns)
    if kind == 'symlink': row['target'] = os.readlink(p)
    return row
def add(row, base, route):
    p = absolute(row['path'], base); permitted(p); key = str(p)
    # These exact paths are excluded before opening generated cache bytes.
    if 'node-compile-cache' in p.parts:
        exclusions.append(dict(source=row, route=route, reason='Recomputable V8 compile cache; original inventory retained, bytes not copied'))
        return
    prior = selected.get(key)
    if prior:
        if 'sha256' in row: assert row['sha256'] == prior.get('sha256'), key
        if route not in prior['routes']: prior['routes'].append(route)
        return
    m = snap(p)
    expected_kind = row.get('type', row.get('kind', 'file'))
    assert m['kind'] == expected_kind, (key, m['kind'], expected_kind)
    if 'mode' in row: assert mode(row['mode']) == mode(m['mode']), key
    for field in ['device', 'inode']:
        if field in row: assert m[field] == row[field], (key, field)
    if m['kind'] == 'file':
        assert p.resolve() == p, 'Noncanonical source: ' + key
        h = digest(p)
        if 'sha256' in row: assert h == row['sha256'], key
        if 'bytes' in row: assert m['size'] == row['bytes'], key
        selected[key] = dict(path=key, sha256=h, bytes=m['size'], mode=m['mode'], routes=[route])
    elif m['kind'] == 'symlink':
        assert m['target'] == row['target'], key
    metadata[key] = m
def index(pin, role):
    p = absolute(pin['path'])
    add(pin, ROOT, role)
    return read(p)
def repo_rel(p): return str(Path(p).relative_to(ROOT))
def old_transport(t):
    t = dict(t)
    if t['kind'] == 'archive_object': t['archive'] = repo_rel(PRIOR / t['archive'])
    return t
def pin(p):
    p = Path(p)
    return dict(path=str(p), sha256=digest(p), bytes=p.stat().st_size)

try:
    activation = read(OUT / 'activation.json')
    assert digest(STOPPED / 'prior-carrier-verification.receipt.json') == activation['priorVerificationReceipt']['sha256']
    assert read(STOPPED / 'prior-carrier-verification.receipt.json')['exitCode'] == 0
    stopped = index(activation['predecessorStop'], 'preserved transport stop')
    stopped_manifest = index(stopped['manifest'], 'preserved transport stop manifest')
    for row in stopped_manifest['files']: add(row, ROOT, stopped['manifest']['path'])
    prior_manifest = read(PRIOR / 'manifest.json')
    assert digest(PRIOR / 'manifest.json') == read(PRIOR / 'freeze.json')['manifest_sha256']
    for row in prior_manifest['records']:
        p = PRIOR / row['path']; assert digest(p) == row['sha256'] and p.stat().st_size == row['bytes'], str(p)
    assert digest(PRIOR / 'freeze.json') == activation['priorCarrier']['sha256']
    # Explicit native closed freeze rows: preparation uses records; others use files.
    for chosen in activation['selectedFreezes']:
        f = index(chosen, 'selected closed freeze')
        rows = f['records'] if '/preparation/' in chosen['path'] else f['files']
        routes.append(dict(index=chosen, carrier='records' if '/preparation/' in chosen['path'] else 'files', rows=len(rows)))
        for row in rows: add(row, ROOT, chosen['path'])
    # Physical rows select files and metadata; roots are bounds, never a recursive discovery request.
    physical_indexes = [REALIZATION/'baseline-diagnostics-01/p1/physical-resources.json',
                        REALIZATION/'baseline-diagnostics-01/p3/physical-resources.json',
                        REALIZATION/'l4-final-candidate-02/p1/physical-resources.json']
    for p in physical_indexes:
        assert str(p) in selected
        inv = read(p); roots = [Path(x) for x in inv['roots'].values()]
        routes.append(dict(index=pin(p), carrier='roots plus files with type/mode/device/inode', rows=len(inv['files'])))
        for row in inv['files']:
            path = Path(row['path'])
            assert any(path == r or path.is_relative_to(r) for r in roots), str(path)
            add(row, ROOT, str(p))
    # Exact source/emission/dependency/support cones are selected by the original endpoint configuration.
    configs = [REALIZATION/'baseline-diagnostics-01/p1/runtime-configuration.json',
               REALIZATION/'baseline-diagnostics-01/p3/runtime-configuration.json',
               REALIZATION/'l4-final-candidate-02/p1/configuration.json']
    package_inputs = {}
    for path in configs:
        c = read(path); subject = c['subject']; stage = Path(subject['stageTenant'])
        for key in ['archive', 'manifest', 'packageInventory', 'supportManifest']:
            add(subject[key], ROOT, str(path))
        package_inputs[subject['archive']['sha256']] = (subject['archive'], subject['packageInventory'])
        support = index(subject['supportManifest'], str(path))
        for row in support['files']: add(row, stage, subject['supportManifest']['path'])
        for inv in subject['inventories']:
            rows = index(inv, str(path))['files']
            routes.append(dict(index=inv, carrier='explicit files rooted at selected inventory root', rows=len(rows)))
            for row in rows: add(row, Path(inv['root']), inv['path'])
        for row in [c['externalConsumer'], *c['requiredEvidence']]: add(row, ROOT, str(path))
        for key, value in c['toolchains'].items():
            exclusions.append(dict(source=value, route=str(path), reason='System tool identity retained as metadata; no executable/tool installation copied', tool=key))
        native = 'stdo3-native-selection' in c['lanes']
        if native: assert 'provider' in c, 'Selected native lane requires provider metadata'
        if 'provider' in c:
            exclusions.append(dict(source=c['provider'], route=str(path), applicability='required_native' if native else 'present_unused_non_native', reason='Provider metadata only; no provider tool or credential copied'))
        else:
            exclusions.append(dict(route=str(path), source=None, applicability='absent_not_applicable_non_native', selectedLanes=list(c['lanes']), reason='Original non-native configuration has no provider obligation; no executable identity invented'))
    for lane in ['p1', 'p3']:
        path = REALIZATION / 'baseline-diagnostics-01' / lane / 'diagnostic-configuration.json'
        c = read(path)
        for item in [c[k] for k in ['preload','probes','originalRunner','originalOracle','originalConfiguration','originalGrant','referenceEndpoint']] + c['requiredPins']:
            add(item, ROOT, str(path))
    # Existing produced fixtures: exact archive pins and source-owned member carriers.
    for fixture_path in [REALIZATION/'baseline-diagnostics-01/p1-coverage-successor-02/fixture-package-inventory.json',
                         REALIZATION/'baseline-diagnostics-01/p3/coverage-instance/fixture-package-inventory.json']:
        assert str(fixture_path) in selected
        fixture = read(fixture_path)
        add(fixture['archive'], ROOT, str(fixture_path))
        for row in fixture['files']: add(row['source'], ROOT, str(fixture_path))
        package_inputs[fixture['archive']['sha256']] = (fixture['archive'], pin(fixture_path))
    physical_index = REALIZATION/'l4-final-candidate-02/p1/physical-resources.json'
    candidate_evidence = Path(read(physical_index)['roots']['evidence'])
    acquisition_path = candidate_evidence/'consumer-acquisition.json'
    command_path = candidate_evidence/'commands/4-pack-consumer.json'
    assert str(acquisition_path) in selected and str(command_path) in selected
    acquisition = read(acquisition_path); command = read(command_path)
    assert command['exitCode'] == 0 and command['label'] == 'pack-consumer'
    packed = json.loads(command['stdout']); assert len(packed) == 1
    packed = packed[0]
    archive_path = acquisition['request']['artifactPath']; archive = selected[archive_path]
    assert acquisition['request']['expectedArtifactDigest'] == 'sha256:' + archive['sha256']
    verified = acquisition['verification']['verifiedArtifact']
    assert verified['artifactDigest'] == 'sha256:' + archive['sha256'] and verified['artifactByteLength'] == archive['bytes']
    assert Path(archive_path).name == packed['filename'] and archive['bytes'] == packed['size']
    fixture_rows = []
    for row in packed['files']:
        source_path = str(Path(command['cwd']) / row['path']); source = selected[source_path]
        assert source['bytes'] == row['size'] and mode(source['mode']) == row['mode']
        fixture_rows.append(dict(path=row['path'], sha256=source['sha256'], bytes=source['bytes'], mode=source['mode'], source=pin(source_path)))
    assert len(fixture_rows) == packed['entryCount']
    write('final02-fixture-member-input.json', dict(archive=pin(archive_path), files=fixture_rows, acquisition=pin(acquisition_path), producerCommand=pin(command_path), scope='Transport derivation from genuine closed producer/member/source data; no pack or Product execution'))
    package_inputs[archive['sha256']] = (pin(archive_path), pin(OUT/'final02-fixture-member-input.json'))
    # Capture protected-main inventory and validate its 936 files without selecting them for transport.
    main = read(REALIZATION/'baseline-diagnostics-01/preflight-basis.json')['protectedMain']['inventory']
    index(main, 'protected-main inventory only')
    main_rows = read(main['path'])['files']
    for row in main_rows:
        p = absolute(row['path']); assert digest(p) == row['sha256'], str(p)
        if 'bytes' in row: assert p.stat().st_size == row['bytes'], str(p)
        if 'mode' in row: assert stat.S_IMODE(p.stat().st_mode) == mode(row['mode']), str(p)
    write('protected-main-before.json', dict(status='satisfied', inventory=main, count=len(main_rows), scope='Read-only preservation; no main bytes added to transport population'))
    # Prior byte routes are reusable only after the original repository/archive-only verifier passed.
    old = read(PRIOR/'whitelist-02.json'); old_index = {}
    for row in old['rows']:
        old_index.setdefault((row['sha256'], row['bytes']), old_transport(row['transport']))
    old_packages = read(PRIOR/'package-member-inventory-02.json')
    packages = []
    for package in old_packages:
        packages.append(dict(archive_sha256=package['sha256'], archive_source=package['path'],
            transport=old_transport(package['transport']), verified_members=package['verified_members'],
            provenance=dict(path=repo_rel(PRIOR/'package-member-inventory-02.json'), sha256=digest(PRIOR/'package-member-inventory-02.json'))))
    known_packages = {p['archive_sha256'] for p in packages}
    package_index = {}
    for p in packages:
        for m in p['verified_members']:
            package_index.setdefault((m['sha256'],m['bytes']), dict(kind='package_member',archive_sha256=p['archive_sha256'],member=m['member']))
    for h,(archive, inventory) in package_inputs.items():
        if h in known_packages: continue
        expected = {r['path']:r for r in read(inventory['path'])['files']}; seen=set(); members=[]
        with tarfile.open(archive['path'],'r:gz') as tf:
            for m in tf:
                assert m.isfile() and m.name.startswith('package/'), m.name
                rel=m.name[len('package/'):]; assert rel not in seen;seen.add(rel)
                row=expected[rel]; data=tf.extractfile(m).read(); got=hashlib.sha256(data).hexdigest()
                assert got==row['sha256'] and len(data)==row['bytes'],m.name
                if 'mode' in row: assert m.mode==mode(row['mode']),m.name
                rec=dict(member=m.name,sha256=got,bytes=len(data),mode=oct(m.mode));members.append(rec)
                package_index.setdefault((got,len(data)),dict(kind='package_member',archive_sha256=h,member=m.name))
        assert seen==set(expected)
        packages.append(dict(archive_sha256=h,archive_source=archive['path'],inventory=inventory,verified_members=members))
    # Conservative repository reuse: closed authored records only; generated/install/source trees use existing byte routes or inert objects.
    def record_reusable(p):
        if not p.is_relative_to(ROOT): return False
        rel=p.relative_to(ROOT)
        if any(x in rel.parts for x in ['build','node_modules','source','stage','tmp','npm-cache','npm-logs','installed','extracted','sandbox','source-freeze']): return False
        if p.suffix=='.tgz' or p.name in ['events.jsonl','runtime.events.jsonl','runtime-events.json'] or p.name.startswith('flow') and p.suffix=='.jsonl': return False
        return p.is_relative_to(STOPPED) or p.is_relative_to(REALIZATION/'baseline-diagnostics-01') or p.is_relative_to(REALIZATION/'combined-final-02') or p.is_relative_to(REALIZATION/'l4-final-candidate-02')
    byte_routes=dict(old_index)
    for row in selected.values():
        if record_reusable(Path(row['path'])):
            byte_routes.setdefault((row['sha256'],row['bytes']),dict(kind='repository_file',path=repo_rel(row['path'])))
    for key,value in package_index.items(): byte_routes.setdefault(key,value)
    objects={}
    for row in sorted(selected.values(),key=lambda x:x['path']):
        key=(row['sha256'],row['bytes'])
        if key not in byte_routes:
            parts=[];offset=0
            with Path(row['path']).open('rb') as f:
                while True:
                    data=f.read(CHUNK)
                    if not data: break
                    h=hashlib.sha256(data).hexdigest();part=dict(sha256=h,bytes=len(data),offset=offset)
                    objects.setdefault(h,dict(sha256=h,bytes=len(data),source=row['path'],source_offset=offset,member='objects/sha256/'+h))
                    parts.append(part);offset+=len(data)
            if not parts:
                h=row['sha256'];objects.setdefault(h,dict(sha256=h,bytes=0,source=row['path'],source_offset=0,member='objects/sha256/'+h));parts=[dict(sha256=h,bytes=0,offset=0)]
            byte_routes[key]=dict(kind='archive_chunks' if len(parts)>1 else 'archive_object',chunks=parts)
        row['transport']=dict(byte_routes[key])
    # <=64 MiB uncompressed object payload per archive keeps even incompressible output below the requested 90 MiB target.
    number=0;used=0
    for h in sorted(objects):
        o=objects[h]
        if number==0 or used+o['bytes']>CHUNK: number+=1;used=0
        o['archive']=repo_rel(OUT/f'bytes-{number:03d}.tar.gz');used+=o['bytes']
    def concrete(t):
        if 'chunks' not in t:return t
        chunks=[dict(archive=objects[p['sha256']]['archive'],member=objects[p['sha256']]['member'],sha256=p['sha256'],bytes=p['bytes'],offset=p['offset']) for p in t['chunks']]
        return dict(kind='archive_object',archive=chunks[0]['archive'],member=chunks[0]['member']) if len(chunks)==1 else dict(kind='archive_chunks',chunks=chunks)
    for row in selected.values():row['transport']=concrete(row['transport'])
    for package in packages:
        if 'transport' not in package:
            source=selected[package['archive_source']];package['transport']=source['transport'];package['bytes']=source['bytes']
    write('source-routes.json',routes)
    write('original-metadata.json',dict(semantics='Original lstat coordinates only; neutral transport members do not preserve or confer runtime authority',rows=list(metadata.values())))
    write('exclusions.json',dict(rows=exclusions,ambientCachesSelected=False,credentialsSelected=False,systemExecutablesCopied=False,scope='Original inventory records preserve excluded V8/tool provenance. No missing selected proof byte is silently excluded.'))
    write('package-members.json',packages)
    write('population.json',dict(kind='closed_evidence_source_address_map',rows=sorted(selected.values(),key=lambda x:x['path'])))
    write('object-plan.json',dict(objects=list(objects.values()),chunkBytes=CHUNK,transportMode='0o644',symlinks=False,hardlinks=False))
    authored=sum(p.stat().st_size for p in OUT.iterdir() if p.is_file())
    payload=sum(o['bytes'] for o in objects.values())
    assert payload+authored <= LIMIT, ('logical carrier exceeds 2 GiB',payload,authored)
    counts=collections.Counter(x['transport']['kind'] for x in selected.values())
    write('population-preflight.json',dict(status='satisfied',selectedAddresses=len(selected),originalLogicalBytes=sum(x['bytes'] for x in selected.values()),
          metadataRows=len(metadata),exclusions=len(exclusions),newUniqueObjects=len(objects),newObjectPayloadBytes=payload,authoredBytesAtPreflight=authored,
          logicalCarrierUpperBoundWithoutSmallReceipts=payload+authored,logicalLimit=LIMIT,compressedLimit=1024**3,archiveCount=number,
          perArchiveUncompressedPayloadLimit=CHUNK,representations=dict(counts),packageCount=len(packages),packageMembers=sum(len(x['verified_members']) for x in packages),
          originalPopulationValidatedBeforeArchives=True,archivesWritten=0,productExecutions=0))
    completed_names = ['activation.json','HOW.md','shape-contract.json','select-population.py','reader-construction.json',
                       'final02-fixture-member-input.json','protected-main-before.json','source-routes.json','original-metadata.json',
                       'exclusions.json','package-members.json','population.json','object-plan.json','population-preflight.json']
    write('population-freeze.json',dict(status='frozen_before_archives',files=[pin(OUT/n) for n in completed_names],
          excludedOpenStreams=['population.stdout','population.stderr'], commandOutputsBound='Only after the population process completes, in final carrier manifest'))
    print(json.dumps(read(OUT/'population-preflight.json')))
except Exception as error:
    write('STOP-population.json',dict(status='stopped',firstCause=repr(error),traceback=traceback.format_exc(),selectedSoFar=len(selected),archivesWritten=0,stop='Return Root; no retry, repair, truncation or redefinition'))
    raise
