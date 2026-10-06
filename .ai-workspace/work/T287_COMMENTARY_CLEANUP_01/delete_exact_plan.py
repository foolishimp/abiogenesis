"""One Root-authorized exact-list unlink batch; no directory deletion or Product calls."""
from pathlib import Path
from contextlib import contextmanager
import collections
import datetime
import gzip
import hashlib
import json
import os
import resource
import stat
import time

R = Path('/Users/jim/src/apps/abiogenesis')
G = R / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
W = R / '.ai-workspace/work/T287_COMMENTARY_CLEANUP_01'
E = R / '.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_01'
START = time.monotonic()
HASH_COST = collections.Counter()
EXPECTED_FREEZE = '117cbe4f69d194434292ad95e1ac962cdf6adac9f61741a909f1fc354792d9f3'
EXPECTED_CANDIDATES = '0df7d51303e2c63434fa78489642fbc8571969fe895d9ddd54df92f41a409242'
EXPECTED_FIELDS = {'path', 'bytes', 'sha256', 'mode', 'device', 'inode'}
FORBIDDEN_ROOTS = {'final-candidate-construction-09', 'final-candidate-construction-10',
                   'g2-existing-owner-groups-01', 'g2-gtl-current-how-01'}
TEXT_VISUAL = {'.md', '.markdown', '.mdx', '.txt', '.rst', '.adoc', '.org', '.puml', '.mmd',
               '.html', '.htm', '.pdf', '.docx', '.png', '.jpg', '.jpeg', '.svg', '.webp'}
ARCHIVES = {'.tgz', '.tar', '.gz', '.zip'}
known_plan = None
deleted = []
phase = 'activation_and_schema'


def output(name, obj):
    p = E / name
    assert not p.exists(), 'execution output already exists: ' + str(p)
    p.write_text(json.dumps(obj, sort_keys=True, separators=(',', ':')) + '\n')


def emit(stage, **kw):
    print(json.dumps({'stage': stage, 'elapsedSeconds': time.monotonic() - START, **kw}), flush=True)


def validate_relative(rel):
    assert isinstance(rel, str) and rel and not rel.startswith('/')
    parts = rel.split('/')
    assert all(x not in ('', '.', '..') for x in parts), rel
    return Path(rel)


def guard(p, within=None):
    p = Path(p)
    assert p.is_absolute()
    if within is not None:
        assert p == within or within in p.parents, str(p)
    for q in (p, *p.parents):
        assert not q.is_symlink(), 'symlink path component: ' + str(q)
    return p


def tuple_for(s):
    return (s.st_size, stat.S_IMODE(s.st_mode), s.st_dev, s.st_ino)


def stable_for(s):
    return (*tuple_for(s), s.st_mtime_ns, s.st_ctime_ns, s.st_nlink)


def hashed(p, expected=None, display=None):
    guard(p)
    before = p.lstat()
    assert stat.S_ISREG(before.st_mode), str(p)
    if expected is not None:
        assert tuple_for(before) == tuple(expected[x] for x in ('bytes', 'mode', 'device', 'inode')), str(p)
    fd = os.open(p, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(fd, 'rb') as f:
        assert stable_for(os.fstat(f.fileno())) == stable_for(before), str(p)
        h = hashlib.sha256()
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
        assert stable_for(os.fstat(f.fileno())) == stable_for(before), str(p)
    assert stable_for(p.lstat()) == stable_for(before), str(p)
    result = {'path': str(display if display is not None else p), 'bytes': before.st_size,
              'sha256': h.hexdigest(), 'mode': stat.S_IMODE(before.st_mode),
              'device': before.st_dev, 'inode': before.st_ino}
    if expected is not None:
        assert result['sha256'] == expected['sha256'], 'body mismatch: ' + str(p)
    HASH_COST['files'] += 1
    HASH_COST['bytes'] += before.st_size
    return result


def verify_rows(rows, base, stage):
    for i, row in enumerate(rows, 1):
        hashed(base / validate_relative(row['path']), row)
        if i % 10000 == 0:
            emit(stage, completed=i, total=len(rows), hashReadBytes=HASH_COST['bytes'])
    emit(stage, completed=len(rows), total=len(rows), hashReadBytes=HASH_COST['bytes'])


def membership(destination=None):
    rows = {}
    sink = gzip.open(destination, 'xt', encoding='utf-8') if destination else None
    try:
        for base, dirs, files in os.walk(G, topdown=True, followlinks=False):
            dirs.sort()
            files.sort()
            for name in list(dirs):
                p = Path(base) / name
                s = p.lstat()
                if stat.S_ISLNK(s.st_mode):
                    dirs.remove(name)
                else:
                    assert stat.S_ISDIR(s.st_mode), str(p)
            for name in sorted(dirs + files + [n for n in os.listdir(base)
                                               if (Path(base) / n).is_symlink() and n not in dirs + files]):
                p = Path(base) / name
                rel = str(p.relative_to(G))
                assert rel not in rows, rel
                s = p.lstat()
                kind = 'file' if stat.S_ISREG(s.st_mode) else ('directory' if stat.S_ISDIR(s.st_mode)
                         else ('symlink' if stat.S_ISLNK(s.st_mode) else 'nonregular'))
                row = {'path': rel, 'kind': kind, 'mode': stat.S_IMODE(s.st_mode),
                       'device': s.st_dev, 'inode': s.st_ino}
                if kind != 'directory':
                    row.update(bytes=s.st_size, mtimeNs=s.st_mtime_ns, ctimeNs=s.st_ctime_ns,
                               allocatedBytes=s.st_blocks * 512)
                if kind == 'symlink':
                    row['target'] = os.readlink(p)
                rows[rel] = row
                if sink:
                    sink.write(json.dumps(row, sort_keys=True, separators=(',', ':')) + '\n')
        return rows
    finally:
        if sink:
            sink.close()


def counts(rows):
    c = collections.Counter(x['kind'] for x in rows.values())
    c['logicalFileBytes'] = sum(x['bytes'] for x in rows.values() if x['kind'] == 'file')
    return dict(c)


@contextmanager
def parent_fd(rel, before, g_identity):
    current = os.open(G, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        s = os.fstat(current)
        assert (s.st_dev, s.st_ino, stat.S_IMODE(s.st_mode)) == g_identity, 'G identity changed'
        running = []
        for part in validate_relative(rel).parts[:-1]:
            running.append(part)
            nxt = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=current)
            os.close(current)
            current = nxt
            expected = before['/'.join(running)]
            s = os.fstat(current)
            assert expected['kind'] == 'directory'
            assert (s.st_dev, s.st_ino, stat.S_IMODE(s.st_mode)) == tuple(expected[x] for x in ('device', 'inode', 'mode'))
        yield current
    finally:
        os.close(current)


try:
    activation = json.loads((W / 'deletion-activation.json').read_bytes())
    assert activation['operation'] == 'T287_COMMENTARY_CLEANUP_DELETE_01'
    assert activation['approvedFiles'] == 34045 and activation['approvedLogicalBytes'] == 4535028820
    fzb = (E / 'freeze.json').read_bytes()
    assert len(fzb) == 6026 and hashlib.sha256(fzb).hexdigest() == EXPECTED_FREEZE
    known_plan = json.loads(fzb)
    assert known_plan['status'] == 'CLOSED' and known_plan['recordCount'] == 17
    for row in known_plan['records']:
        q = R / validate_relative(row['path'])
        b = q.read_bytes()
        assert (len(b), hashlib.sha256(b).hexdigest(), stat.S_IMODE(q.lstat().st_mode)) == (row['bytes'], row['sha256'], row['mode'])
    cb = (E / 'candidate-files.json').read_bytes()
    assert len(cb) == 11176154 and hashlib.sha256(cb).hexdigest() == EXPECTED_CANDIDATES
    candidates = json.loads(cb)
    protections = json.loads((E / 'protected-files.json').read_bytes())
    originals = json.loads((E / 'copied-original-witnesses.json').read_bytes())
    contexts = json.loads((E / 'context-pins.json').read_bytes())
    plan = json.loads((E / 'named-root-plan.json').read_bytes())
    joins = json.loads((E / 'plan-joins.json').read_bytes())
    assert (len(candidates), sum(x['bytes'] for x in candidates)) == (34045, 4535028820)
    assert (len(protections), len(originals), len(contexts), len(plan['roots'])) == (38331, 17900, 75, 59)
    assert all(set(x) == EXPECTED_FIELDS | {'root', 'kind'} for x in candidates)
    candidate_paths = {x['path'] for x in candidates}
    assert len(candidate_paths) == 34045
    assert candidate_paths.isdisjoint(x['path'] for x in protections)
    assert candidate_paths.isdisjoint(x['path'] for x in joins['trackedNonregularPathsUntouched'] if isinstance(x, dict))
    named = []
    for root in plan['roots']:
        rel = validate_relative(root['path'])
        assert rel.parts[0] not in FORBIDDEN_ROOTS and 'node_modules' not in rel.parts
        q = guard(G / rel, G)
        s = q.lstat()
        assert stat.S_ISDIR(s.st_mode)
        assert (stat.S_IMODE(s.st_mode), s.st_dev, s.st_ino) == tuple(root[k] for k in ('mode', 'device', 'inode'))
        named.append(root['path'])
    for i, row in enumerate(candidates):
        rel = validate_relative(row['path'])
        assert isinstance(row['root'], int) and not isinstance(row['root'], bool) and 0 <= row['root'] < 59
        root = named[row['root']]
        assert row['path'].startswith(root + '/') and root != 'final-candidate-construction-03/npm-cache'
        assert rel.parts[0] not in FORBIDDEN_ROOTS and 'node_modules' not in rel.parts
        assert rel.suffix.lower() not in TEXT_VISUAL | ARCHIVES
        assert isinstance(row['bytes'], int) and row['bytes'] >= 0
        assert isinstance(row['mode'], int) and 0 <= row['mode'] <= 0o7777
        assert len(row['sha256']) == 64 and all(x in '0123456789abcdef' for x in row['sha256'])
    guard(G)
    gstat = G.lstat()
    g_identity = (gstat.st_dev, gstat.st_ino, stat.S_IMODE(gstat.st_mode))
    original_root = guard(Path(plan['originalCopyRoot']))
    phase = 'complete_preflight_hashes'
    verify_rows(candidates, G, 'preflight_candidates')
    verify_rows(protections, G, 'preflight_protections')
    verify_rows(originals, original_root, 'preflight_original_witnesses')
    for row in contexts:
        hashed(Path(row['path']), row)
    emit('preflight_contexts', completed=len(contexts), hashReadBytes=HASH_COST['bytes'])

    # Bind current mutable native logs as current snapshots, not historical whole-file identities.
    native = []
    for owner in ('f11-carrier-installed-setup-09', 'f11-carrier-installed-setup-10'):
        fz = json.loads((G / owner / 'freeze.json').read_bytes())
        for row in fz['records']:
            if row['path'] in ('resources/events/runtime.events.jsonl', 'closed-event-resource-handoff.json', 'resource-plan.json'):
                q = G / owner / row['path']
                current = hashed(q, display=str(q.relative_to(G)))
                if row['path'].endswith('.jsonl'):
                    old_prefix = hashlib.sha256()
                    remaining = row['bytes']
                    with q.open('rb') as stream:
                        while remaining:
                            b = stream.read(min(1024 * 1024, remaining))
                            assert b, str(q)
                            old_prefix.update(b)
                            remaining -= len(b)
                    assert old_prefix.hexdigest() == row['sha256'], 'native original prefix changed: ' + str(q)
                    current['originalFrozenPrefix'] = {'bytes': row['bytes'], 'sha256': row['sha256']}
                else:
                    assert (current['bytes'], current['sha256']) == (row['bytes'], row['sha256'])
                native.append(current)
    assert len(native) == 6
    output('deletion-native-preflight-pins.json', native)
    phase = 'complete_G_membership_preflight'
    before = membership(E / 'deletion-preflight-membership.jsonl.gz')
    assert all(x in before and before[x]['kind'] == 'file' for x in candidate_paths)
    for row in candidates:
        physical = before[row['path']]
        assert all(physical[k] == row[k] for k in ('bytes', 'mode', 'device', 'inode'))
    for rel in joins['trackedNonregularPathsUntouched']:
        assert rel in before and before[rel]['kind'] == 'symlink'
    allocated = sum(before[p]['allocatedBytes'] for p in candidate_paths)
    preflight = {'operation': 'T287_COMMENTARY_CLEANUP_DELETE_01', 'status': 'COMPLETE_BEFORE_ANY_UNLINK',
                 'planFreezeSHA256': EXPECTED_FREEZE, 'candidateManifestSHA256': EXPECTED_CANDIDATES,
                 'candidateFiles': 34045, 'candidateLogicalBytes': 4535028820,
                 'candidateAllocatedBytesFromStBlocks': allocated, 'protectedFiles': 38331,
                 'originalWitnesses': 17900, 'contextPins': 75, 'currentNativePins': 6,
                 'GIdentity': {'device': g_identity[0], 'inode': g_identity[1], 'mode': g_identity[2]},
                 'membership': counts(before), 'elapsedSeconds': time.monotonic() - START,
                 'hashCost': dict(HASH_COST), 'knownProcessClosure': 'Root CLOSED independent exact-list GO and existing pinned owner closure receipts; no new producer/Run authorized here',
                 'directoryRemovalSelected': False}
    output('deletion-preflight.json', preflight)
    emit('preflight_complete_before_any_unlink', **{k: preflight[k] for k in ('candidateFiles', 'candidateLogicalBytes', 'candidateAllocatedBytesFromStBlocks')})
    phase = 'exact_unlink'
    ledger_path = E / 'deletion-unlink-ledger.jsonl'
    ledger_fd = os.open(ledger_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_APPEND, 0o644)
    try:
        for i, row in enumerate(candidates, 1):
            with parent_fd(row['path'], before, g_identity) as parent:
                leaf = Path(row['path']).name
                fd = os.open(leaf, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent)
                try:
                    s = os.fstat(fd)
                    assert stat.S_ISREG(s.st_mode) and s.st_nlink == 1, row['path']
                    assert tuple_for(s) == tuple(row[k] for k in ('bytes', 'mode', 'device', 'inode')), row['path']
                    h = hashlib.sha256()
                    while True:
                        b = os.read(fd, 1024 * 1024)
                        if not b:
                            break
                        h.update(b)
                    HASH_COST['files'] += 1
                    HASH_COST['bytes'] += s.st_size
                    assert h.hexdigest() == row['sha256'], 'immediate unlink body mismatch: ' + row['path']
                    assert stable_for(os.fstat(fd)) == stable_for(s), row['path']
                    immediate = os.stat(leaf, dir_fd=parent, follow_symlinks=False)
                    assert stable_for(immediate) == stable_for(s), row['path']
                    assert immediate.st_blocks * 512 == before[row['path']]['allocatedBytes'], row['path']
                    os.unlink(leaf, dir_fd=parent)
                    deleted.append(row['path'])
                    record = {'sequence': i, **row, 'allocatedBytesAtUnlink': immediate.st_blocks * 512,
                              'effect': 'unlinked_exact_regular_file'}
                    data = (json.dumps(record, sort_keys=True, separators=(',', ':')) + '\n').encode()
                    assert os.write(ledger_fd, data) == len(data), 'short ledger write'
                finally:
                    os.close(fd)
            if i % 5000 == 0:
                emit('unlink_progress', removed=i, total=34045)
        os.fsync(ledger_fd)
    finally:
        os.close(ledger_fd)

    phase = 'post_conservation'
    after = membership()
    expected_paths = set(before) - candidate_paths
    assert set(after) == expected_paths, 'remaining G membership differs from exact deletion set'
    differences = [p for p, row in after.items() if row != before[p]]
    assert not differences, 'unlisted physical metadata changed: ' + repr(differences[:5])
    assert all(not os.path.lexists(G / p) for p in candidate_paths)
    verify_rows(protections, G, 'post_protections')
    verify_rows(originals, original_root, 'post_original_witnesses')
    for row in contexts:
        hashed(Path(row['path']), row)
    verify_rows(native, G, 'post_current_native_pins')
    for row in known_plan['records']:
        q = R / row['path']
        b = q.read_bytes()
        assert (len(b), hashlib.sha256(b).hexdigest(), stat.S_IMODE(q.lstat().st_mode)) == (row['bytes'], row['sha256'], row['mode'])
    ledger_count = 0
    ledger_bytes = 0
    with ledger_path.open() as f:
        for line in f:
            item = json.loads(line)
            assert item['sequence'] == ledger_count + 1 and item['path'] == candidates[ledger_count]['path']
            ledger_count += 1
            ledger_bytes += item['bytes']
    assert (ledger_count, ledger_bytes) == (34045, 4535028820)
    result = {'operation': 'T287_COMMENTARY_CLEANUP_DELETE_01', 'status': 'CLOSED',
              'workResult': 'GO_EXACT_DELETION_CONSERVATION', 'removedFiles': 34045,
              'removedLogicalBytes': 4535028820, 'removedAllocatedBytesFromStBlocks': allocated,
              'removedDirectories': 0, 'namedRootDirectoriesPreserved': 59,
              'beforeMembership': counts(before), 'afterMembership': counts(after),
              'remainingMembershipMatchesSavedPreflightMinusExactList': True,
              'unlistedFileAndDirectoryIdentityModeMetadataDifferences': 0,
              'listedFilesRemaining': 0, 'protectedFilesVerifiedUnchanged': 38331,
              'originalWitnessesVerifiedUnchanged': 17900, 'contextPinsVerifiedUnchanged': 75,
              'currentNativePinsVerifiedUnchanged': 6, 'trackedSymlinksVerifiedUnchanged': 7,
              'originalPlanRecordsVerifiedUnchanged': 17, 'elapsedSeconds': time.monotonic() - START,
              'hashCost': dict(HASH_COST), 'peakRSSBytes': resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
              'process': {'workerPid': os.getpid(), 'synchronousNoChildren': True},
              'effects': {'onlyUnlinks': 34045, 'directoryDeletion': 0, 'retainedCommentsWrites': 0,
                         'originalWrites': 0, 'moves': 0, 'symlinkEffects': 0, 'GitCommands': 0,
                         'ProductImports': 0, 'RuntimeCalls': 0, 'buildTests': 0, 'networkProvider': 0},
              'historicalEvidence': 'Original immutable freezes and receipts remain byte-identical; their past cache/copied physical populations intentionally lose only this ledgered disposable subset. They are historical censuses, not claims of currently complete physical populations.',
              'limits': ['st_blocks sums are allocation observations, not independently measured free-disk gains; APFS sharing may affect space reclaimed',
                         'no new cache-independent reproduction or semantic/Product/Runtime/qualification/release acceptance',
                         'no other dated territory or later batch included']}
    output('deletion-result.json', result)
    emit('CLOSED_GO_EXACT_DELETION_CONSERVATION', **result)
except BaseException as error:
    failure = {'operation': 'T287_COMMENTARY_CLEANUP_DELETE_01', 'status': 'STOPPED', 'phase': phase,
               'errorType': type(error).__name__, 'error': str(error), 'removedFiles': len(deleted),
               'removedPaths': deleted, 'elapsedSeconds': time.monotonic() - START,
               'hashCost': dict(HASH_COST), 'noForceRepairRetry': True}
    output('deletion-stop.json', failure)
    emit('STOPPED', **failure)
    raise
