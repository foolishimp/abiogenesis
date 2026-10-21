"""Inert transport packaging only; consumes one already-frozen population."""
from pathlib import Path
import collections, datetime, gzip, hashlib, io, json, os, stat, tarfile, time, traceback

D = Path(__file__).resolve().parent
R = D.parents[5]
PRIOR = D.parent.parent / 'closed-evidence-portability-01'
CHUNK = 64 * 1024**2
COMPRESSED_LIMIT = 1024**3
LOGICAL_LIMIT = 2 * 1024**3
ARCHIVE_TARGET = 90 * 1024**2

def read(p): return json.loads(Path(p).read_text())
def digest(p):
    h = hashlib.sha256()
    with Path(p).open('rb') as f:
        for b in iter(lambda: f.read(1024**2), b''): h.update(b)
    return h.hexdigest()
def write(name, value):
    with (D/name).open('x') as f: json.dump(value, f, indent=2); f.write('\n')
def exact(pin):
    p = Path(pin['path'])
    assert p.is_file() and not p.is_symlink(), str(p)
    assert digest(p) == pin['sha256'], str(p)
    if 'bytes' in pin: assert p.stat().st_size == pin['bytes'], str(p)
    if 'mode' in pin: assert stat.S_IMODE(p.stat().st_mode) == int(pin['mode'],0), str(p)
def source_state(p, m):
    s = p.lstat()
    assert (s.st_dev,s.st_ino,s.st_size,stat.S_IMODE(s.st_mode),s.st_nlink,s.st_mtime_ns,s.st_ctime_ns) == (m['device'],m['inode'],m['size'],int(m['mode'],0),m['nlink'],m['mtime_ns'],m['ctime_ns']), str(p)
    if m['kind'] == 'file': assert stat.S_ISREG(s.st_mode) and p.resolve() == p, str(p)
    elif m['kind'] == 'symlink': assert stat.S_ISLNK(s.st_mode) and os.readlink(p) == m['target'], str(p)
    elif m['kind'] == 'directory': assert stat.S_ISDIR(s.st_mode), str(p)
    else: raise AssertionError('Unknown original node kind')

done = []
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
try:
    grant = read(D/'packaging-input.json')
    exact(grant['populationFreeze'])
    for pin in read(D/'population-freeze.json')['files']: exact(pin)
    assert read(D/'population.receipt.json')['exitCode'] == 0
    population = read(D/'population.json')['rows']
    selected = {r['path']:r for r in population}
    metadata = {r['path']:r for r in read(D/'original-metadata.json')['rows']}
    plan = read(D/'object-plan.json')
    groups = collections.defaultdict(list)
    for obj in plan['objects']:
        assert obj['source'] in selected and obj['bytes'] <= CHUNK
        target = R/obj['archive']
        assert target.parent == D and target.name.startswith('bytes-') and target.name.endswith('.tar.gz')
        groups[obj['archive']].append(obj)
    preflight = read(D/'population-preflight.json')
    assert preflight['status'] == 'satisfied' and preflight['logicalCarrierUpperBoundWithoutSmallReceipts'] <= LOGICAL_LIMIT
    for name, rows in sorted(groups.items()):
        t = time.monotonic(); target = R/name
        assert sum(r['bytes'] for r in rows) <= CHUNK
        with target.open('xb') as raw, gzip.GzipFile(filename='', mode='wb', fileobj=raw, mtime=0, compresslevel=6) as gz, tarfile.open(fileobj=gz, mode='w', format=tarfile.USTAR_FORMAT) as tf:
            for row in sorted(rows, key=lambda r:r['member']):
                p = Path(row['source']); source_state(p,metadata[str(p)])
                with p.open('rb') as src:
                    src.seek(row['source_offset']); data = src.read(row['bytes'])
                assert len(data) == row['bytes'] and hashlib.sha256(data).hexdigest() == row['sha256'], str(p)
                info = tarfile.TarInfo(row['member']); info.size = len(data); info.mode = 0o644
                info.uid = info.gid = info.mtime = 0; info.uname = info.gname = ''
                tf.addfile(info, io.BytesIO(data))
        assert target.stat().st_size < ARCHIVE_TARGET, str(target)
        assert sum(x['compressedBytes'] for x in done) + target.stat().st_size <= COMPRESSED_LIMIT
        seen = set(); expected = {r['member']:r for r in rows}
        with tarfile.open(target, 'r:gz') as tf:
            for member in tf:
                assert member.isfile() and member.name in expected and member.name not in seen, member.name
                row = expected[member.name]; h=hashlib.sha256(); n=0
                stream = tf.extractfile(member)
                for b in iter(lambda:stream.read(1024**2),b''): h.update(b); n+=len(b)
                assert n == member.size == row['bytes'] and h.hexdigest() == row['sha256']
                assert member.mode == 0o644 and member.uid == member.gid == member.mtime == 0
                seen.add(member.name)
        assert seen == set(expected)
        n=0; h=hashlib.sha256()
        with gzip.open(target,'rb') as src:
            for b in iter(lambda:src.read(1024**2),b''): n+=len(b); h.update(b)
        done.append(dict(path=name,sha256=digest(target),compressedBytes=target.stat().st_size,uncompressedTarBytes=n,uncompressedTarSha256=h.hexdigest(),payloadBytes=sum(r['bytes'] for r in rows),objects=len(rows),wallSeconds=time.monotonic()-t,verified=True))
    for row in population:
        p=Path(row['path']);source_state(p,metadata[str(p)]);assert digest(p)==row['sha256'],str(p)
    for p,m in metadata.items():
        if m['kind']!='file': source_state(Path(p),m)
    activation=read(D/'activation.json')
    for pin in [*activation['selectedFreezes'],activation['priorCarrier'],activation['predecessorStop'],activation['predecessorManifest']]: exact(pin)
    for row in read(D.parent/'stopped-manifest.json')['files']:exact(row)
    prior_freeze=read(PRIOR/'freeze.json')
    assert digest(PRIOR/'manifest.json')==prior_freeze['manifest_sha256']
    for row in read(PRIOR/'manifest.json')['records']:exact(dict(row,path=str(PRIOR/row['path'])))
    main=read(D/'protected-main-before.json')['inventory'];exact(main)
    main_rows=read(main['path'])['files']
    for row in main_rows:exact(dict(row,path=str(R/row['path']) if not Path(row['path']).is_absolute() else row['path']))
    authored=sum(p.stat().st_size for p in D.iterdir() if p.is_file() and not p.name.endswith('.tar.gz'))
    payload=sum(r['bytes'] for r in plan['objects'])
    assert payload+authored <= LOGICAL_LIMIT
    write('preservation-after-packaging.json',dict(status='satisfied',selectedFiles=len(population),metadataRows=len(metadata),mainGeneratedFiles=len(main_rows),selectedFreezes=len(activation['selectedFreezes']),priorCarrierUnchanged=True,stoppedCutUnchanged=True,allSelectedOriginalBytesAndCoordinatesUnchanged=True,mismatches=0))
    write('archives.json',dict(status='satisfied',populationFreeze=grant['populationFreeze'],startedUtc=started,completedUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),archives=done,totalCompressedBytes=sum(x['compressedBytes'] for x in done),newLogicalPayloadBytes=payload,authoredBytes=authored,logicalBoundBytes=payload+authored,compressedLimit=COMPRESSED_LIMIT,logicalLimit=LOGICAL_LIMIT,perArchiveTarget=ARCHIVE_TARGET,ProductExecutions=0,originalOwnerAcquisitions=0))
    print(json.dumps(dict(status='satisfied',archives=len(done),compressedBytes=sum(x['compressedBytes'] for x in done),payloadBytes=payload,preservedSources=len(population),protectedMain=len(main_rows))))
except Exception as error:
    write('STOP-packaging.json',dict(status='stopped',firstCause=repr(error),traceback=traceback.format_exc(),completedArchives=done,stop='Return Root; no retry, repair, cleanup or redefinition'))
    raise
