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
import sys

R = Path('/Users/jim/src/apps/abiogenesis')
G = R / '.ai-workspace/comments'
EXCLUDED_GOVERNANCE = 'codex/20260928_FRAMED_GOVERNANCE'
W = R / '.ai-workspace/work/T287_COMMENTARY_CLEANUP_02'
P = R / '.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_02'
FINAL = P / 'final'
E = P / 'execution'
PREPARE_OPERATION = 'T287_COMMENTARY_CLEANUP_DELETE_02_PREPARE'
EXECUTE_OPERATION = 'T287_COMMENTARY_CLEANUP_DELETE_02'
EXECUTE = sys.argv[1:] == ['--execute']
assert sys.argv[1:] in ([], ['--prepare'], ['--execute'])
START = time.monotonic()
HASH_COST = collections.Counter()
EXPECTED_FREEZE = 'd79d700c49185400dce7a31d84fd6d766a017d04445a3bb88846ff080f4aee51'
EXPECTED_CANDIDATES = 'b7c9107ec840a3c2b3675cb846d758c55f772383e53da3e200bf923aa0b9cf33'
EXPECTED_FIELDS = {'path', 'bytes', 'sha256', 'mode', 'device', 'inode'}
FORBIDDEN_ROOTS = {EXCLUDED_GOVERNANCE}
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
    """Only named roots plus their parent anchors; never walk all comments."""
    rows = {}
    sink = gzip.open(destination, 'xt', encoding='utf-8') if destination else None
    def add(p):
        rel = str(p.relative_to(G))
        s = p.lstat()
        kind = 'file' if stat.S_ISREG(s.st_mode) else ('directory' if stat.S_ISDIR(s.st_mode)
                else ('symlink' if stat.S_ISLNK(s.st_mode) else 'nonregular'))
        row = {'path':rel,'kind':kind,'mode':stat.S_IMODE(s.st_mode),'device':s.st_dev,'inode':s.st_ino}
        if kind != 'directory':
            row.update(bytes=s.st_size,mtimeNs=s.st_mtime_ns,ctimeNs=s.st_ctime_ns,allocatedBytes=s.st_blocks*512)
        if kind == 'symlink': row['target'] = os.readlink(p)
        if rel in rows:
            assert rows[rel] == row, 'anchor changed: ' + rel
            return
        rows[rel] = row
        if sink: sink.write(json.dumps(row,sort_keys=True,separators=(',',':')) + '\n')
    try:
        for root in plan['roots']:
            p = guard(G / validate_relative(root['path']), G)
            for anchor in (p,*p.parents):
                if anchor == G: break
                assert anchor.is_dir() and not anchor.is_symlink()
                add(anchor)
            for base, dirs, files in os.walk(p, topdown=True, followlinks=False):
                dirs.sort(); files.sort()
                for name in list(dirs):
                    q = Path(base)/name
                    add(q)
                    if q.is_symlink(): dirs.remove(name)
                    else: assert stat.S_ISDIR(q.lstat().st_mode), str(q)
                for name in files: add(Path(base)/name)
        return rows
    finally:
        if sink: sink.close()


def record_bytes(row):
    p = Path(row['path'])
    if not p.is_absolute(): p = R / validate_relative(row['path'])
    guard(p, R)
    b = p.read_bytes()
    assert (len(b),hashlib.sha256(b).hexdigest(),stat.S_IMODE(p.lstat().st_mode)) == (row['bytes'],row['sha256'],row['mode']),str(p)
    return b


def verify_plan_records():
    for row in known_plan['records'] + known_plan['witnessPopulations']:
        record_bytes(row)
    prior = known_plan['priorProposalFreeze']
    p = Path(prior['path']); b = p.read_bytes()
    assert (len(b),hashlib.sha256(b).hexdigest()) == (prior['bytes'],prior['sha256'])
    old = json.loads(b)
    for row in old['records']: record_bytes(row)


def nonregular_snapshot():
    current=[]
    for old in nonregulars:
        p=G/validate_relative(old['path']); guard(p.parent,G); st=p.lstat()
        assert not stat.S_ISREG(st.st_mode) and not stat.S_ISDIR(st.st_mode),str(p)
        assert (st.st_dev,st.st_ino)==(old['device'],old['inode']),str(p)
        row={'path':old['path'],'mode':stat.S_IMODE(st.st_mode),'device':st.st_dev,'inode':st.st_ino,
             'bytes':st.st_size,'mtimeNs':st.st_mtime_ns,'ctimeNs':st.st_ctime_ns}
        if stat.S_ISLNK(st.st_mode):
            row['target']=os.readlink(p)
            if 'target' in old: assert row['target']==old['target'],str(p)
        current.append(row)
    return current


def require_root_release():
    p=W/'deletion-activation.json'
    assert p.is_file() and not p.is_symlink(),'Root execution grant not yet recorded'
    activation=json.loads(p.read_bytes())
    assert activation['operation']==EXECUTE_OPERATION and activation['deletionAuthorized'] is True
    assert activation['approvedFiles']==22054 and activation['approvedLogicalBytes']==2340366209
    assert activation['planFreezeSHA256']==EXPECTED_FREEZE and activation['candidateManifestSHA256']==EXPECTED_CANDIDATES
    assert activation['RootIndependentGOAccepted'] is True
    for key in ('RootAcceptancePin','IndependentGOPin','ExactExecutionGrantPin','PreparationFreezePin'):
        pin=activation[key]; q=guard(Path(pin['path']));b=q.read_bytes()
        assert (len(b),hashlib.sha256(b).hexdigest())==(pin['bytes'],pin['sha256']),key
    return activation


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
    prep = json.loads((W/'deletion-preparation-activation.json').read_bytes())
    assert prep['operation'] == PREPARE_OPERATION and prep['deletionAuthorized'] is False
    if EXECUTE:
        activation = require_root_release()
    fzb = (FINAL/'freeze.json').read_bytes()
    assert len(fzb)==4379 and hashlib.sha256(fzb).hexdigest()==EXPECTED_FREEZE
    known_plan=json.loads(fzb)
    assert known_plan['status']=='CLOSED_FINAL_PLANNING_ONLY_NO_DELETION'
    verify_plan_records()
    cb=(FINAL/'candidate-files.json').read_bytes()
    assert len(cb)==7622147 and hashlib.sha256(cb).hexdigest()==EXPECTED_CANDIDATES
    candidates=json.loads(cb)
    protections=json.loads((FINAL/'protected-files.json').read_bytes())
    originals=json.loads((P/'copied-original-witnesses.json').read_bytes())
    contexts=json.loads((P/'context-pins.json').read_bytes())
    nonregulars=json.loads((P/'nonregulars.json').read_bytes())
    exclusions=json.loads((FINAL/'excluded-candidate-files.json').read_bytes())
    plan=json.loads((FINAL/'named-root-plan.json').read_bytes())
    joins=json.loads((FINAL/'plan-joins.json').read_bytes())
    assert (len(candidates),sum(x['bytes'] for x in candidates))==(22054,2340366209)
    assert (len(protections),len(originals),len(contexts),len(plan['roots']))==(38212,10752,172,81)
    assert joins['status']=='PASS_ROOT_SELECTED_SUBTRACTION_ONLY'
    assert all(set(x)==EXPECTED_FIELDS|{'root','kind'} for x in candidates)
    candidate_paths={x['path'] for x in candidates};assert len(candidate_paths)==22054
    assert candidate_paths.isdisjoint(x['path'] for x in protections)
    assert candidate_paths.isdisjoint(x['path'] for x in exclusions)
    assert candidate_paths.isdisjoint(x['path'] for x in nonregulars)
    named = []
    for root in plan['roots']:
        rel = validate_relative(root['path'])
        assert not (str(rel)==EXCLUDED_GOVERNANCE or str(rel).startswith(EXCLUDED_GOVERNANCE+'/')) and 'node_modules' not in rel.parts
        q = guard(G / rel, G)
        s = q.lstat()
        assert stat.S_ISDIR(s.st_mode)
        assert (stat.S_IMODE(s.st_mode), s.st_dev, s.st_ino) == tuple(root[k] for k in ('mode', 'device', 'inode'))
        named.append(root['path'])
    for i, row in enumerate(candidates):
        rel = validate_relative(row['path'])
        assert isinstance(row['root'], int) and not isinstance(row['root'], bool) and 0 <= row['root'] < len(named)
        root = named[row['root']]
        assert row['path'].startswith(root + '/')
        assert not (str(rel)==EXCLUDED_GOVERNANCE or str(rel).startswith(EXCLUDED_GOVERNANCE+'/')) and 'node_modules' not in rel.parts
        assert rel.suffix.lower() not in TEXT_VISUAL | ARCHIVES
        assert isinstance(row['bytes'], int) and row['bytes'] >= 0
        assert isinstance(row['mode'], int) and 0 <= row['mode'] <= 0o7777
        assert len(row['sha256']) == 64 and all(x in '0123456789abcdef' for x in row['sha256'])
    guard(G)
    gstat = G.lstat()
    g_identity = (gstat.st_dev, gstat.st_ino, stat.S_IMODE(gstat.st_mode))
    original_root = guard(Path(plan['originalCopyRoot']))
    if not EXECUTE:
        output('preparation-contract-joins.json',{'operation':PREPARE_OPERATION,'status':'PREPARED_NO_UNLINK_AUTHORITY',
               'candidateFiles':22054,'candidateBytes':2340366209,'protections':38212,'originals':10752,
               'contexts':172,'namedRoots':81,'planAndRecordWitnessesUnchanged':True,
               'candidateProtectionExcludedNonregularDisjoint':True,'RootExecutionGateRequired':True,
               'futureBeforeAndAfterScope':'all named root subtrees, ancestors, protected/original/context/nonregular and plan witnesses',
               'fullCommentsCensus':False,'commentsWrites':0,'unlinks':0})
        emit('PREPARED_NO_UNLINK_AUTHORITY',candidateFiles=22054,namedRoots=81)
        raise SystemExit(0)
    phase = 'complete_preflight_hashes' 
    verify_rows(candidates, G, 'preflight_candidates')
    verify_rows(protections, G, 'preflight_protections')
    verify_rows(originals, original_root, 'preflight_original_witnesses')
    for row in contexts:
        hashed(Path(row['path']), row)
    emit('preflight_contexts', completed=len(contexts), hashReadBytes=HASH_COST['bytes'])

    before_nonregulars = nonregular_snapshot()
    output('deletion-nonregular-preflight.json',before_nonregulars)
    phase = 'complete_G_membership_preflight'
    before = membership(E / 'deletion-preflight-membership.jsonl.gz')
    assert all(x in before and before[x]['kind'] == 'file' for x in candidate_paths)
    for row in candidates:
        physical = before[row['path']]
        assert all(physical[k] == row[k] for k in ('bytes', 'mode', 'device', 'inode'))
    assert all(x['kind'] != 'file' for p,x in before.items() if p in {r['path'] for r in nonregulars})
    allocated = sum(before[p]['allocatedBytes'] for p in candidate_paths)
    preflight = {'operation': EXECUTE_OPERATION, 'status': 'COMPLETE_BEFORE_ANY_UNLINK',
                 'planFreezeSHA256': EXPECTED_FREEZE, 'candidateManifestSHA256': EXPECTED_CANDIDATES,
                 'candidateFiles': 22054, 'candidateLogicalBytes': 2340366209,
                 'candidateAllocatedBytesFromStBlocks': allocated, 'protectedFiles': 38212,
                 'originalWitnesses': 10752, 'contextPins': 172, 'preservedNonregulars': len(nonregulars),
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
                emit('unlink_progress', removed=i, total=22054)
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
    assert nonregular_snapshot() == before_nonregulars,'protected nonregular changed'
    verify_plan_records()
    ledger_count = 0
    ledger_bytes = 0
    with ledger_path.open() as f:
        for line in f:
            item = json.loads(line)
            assert item['sequence'] == ledger_count + 1 and item['path'] == candidates[ledger_count]['path']
            ledger_count += 1
            ledger_bytes += item['bytes']
    assert (ledger_count, ledger_bytes) == (22054, 2340366209)
    result = {'operation': EXECUTE_OPERATION, 'status': 'CLOSED',
              'workResult': 'GO_EXACT_DELETION_CONSERVATION', 'removedFiles': 22054,
              'removedLogicalBytes': 2340366209, 'removedAllocatedBytesFromStBlocks': allocated,
              'removedDirectories': 0, 'namedRootDirectoriesPreserved': 81,
              'beforeMembership': counts(before), 'afterMembership': counts(after),
              'remainingMembershipMatchesSavedPreflightMinusExactList': True,
              'unlistedFileAndDirectoryIdentityModeMetadataDifferences': 0,
              'listedFilesRemaining': 0, 'protectedFilesVerifiedUnchanged': 38212,
              'originalWitnessesVerifiedUnchanged': 10752, 'contextPinsVerifiedUnchanged': 172,
              'preservedNonregularsVerifiedUnchanged': len(nonregulars),
              'originalPlanRecordsVerifiedUnchanged': True, 'elapsedSeconds': time.monotonic() - START,
              'hashCost': dict(HASH_COST), 'peakRSSBytes': resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
              'process': {'workerPid': os.getpid(), 'synchronousNoChildren': True},
              'effects': {'onlyUnlinks': 22054, 'directoryDeletion': 0, 'retainedCommentsWrites': 0,
                         'originalWrites': 0, 'moves': 0, 'symlinkEffects': 0, 'GitCommands': 0,
                         'ProductImports': 0, 'RuntimeCalls': 0, 'buildTests': 0, 'networkProvider': 0},
              'historicalEvidence': 'Original immutable freezes and receipts remain byte-identical; their past cache/copied physical populations intentionally lose only this ledgered disposable subset. They are historical censuses, not claims of currently complete physical populations.',
              'limits': ['st_blocks sums are allocation observations, not independently measured free-disk gains; APFS sharing may affect space reclaimed',
                         'no new cache-independent reproduction or semantic/Product/Runtime/qualification/release acceptance',
                         'no other dated territory or later batch included']}
    output('deletion-result.json', result)
    emit('CLOSED_GO_EXACT_DELETION_CONSERVATION', **result)
except BaseException as error:
    if isinstance(error,SystemExit) and error.code==0:
        raise
    failure = {'operation': EXECUTE_OPERATION, 'status': 'STOPPED', 'phase': phase, 'preparationOnly': not EXECUTE,
               'errorType': type(error).__name__, 'error': str(error), 'removedFiles': len(deleted),
               'removedPaths': deleted, 'elapsedSeconds': time.monotonic() - START,
               'hashCost': dict(HASH_COST), 'noForceRepairRetry': True}
    output('deletion-stop.json', failure)
    emit('STOPPED', **failure)
    raise
