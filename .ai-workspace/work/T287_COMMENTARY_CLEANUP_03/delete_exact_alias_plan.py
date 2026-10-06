"""Exact Batch03 unlink payload. Preparation does not authorize its execution."""
import argparse
import collections
import datetime
import gzip
import hashlib
import json
import os
from pathlib import Path
import resource
import stat
import time

R = Path('/Users/jim/src/apps/abiogenesis')
W = R / '.ai-workspace/work/T287_COMMENTARY_CLEANUP_03'
E = R / '.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_03'
F = E / 'alias-final'
D = E / 'execution'
EXPECTED_FREEZE = 'cee816b8f45826fc73d39f17522407db06008b6645cc307dc8702e448f642edc'
EXPECTED_LIST = '05052fc15161aac77dde27c577dcb27d18d5f2fb91657fcade0a37570c52cbc0'
START = time.monotonic()
COST = collections.Counter()
phase = 'explicit_release'
removed = []


def emit(stage, **fields):
    print(json.dumps(dict(stage=stage, elapsedSeconds=time.monotonic() - START, **fields)), flush=True)


def write(name, value):
    with (D / name).open('x') as out:
        out.write(json.dumps(value, sort_keys=True, separators=(',', ':')) + '\n')


def relative(value):
    assert isinstance(value, str) and value and not value.startswith('/')
    parts = value.split('/')
    assert all(p not in ('', '.', '..') for p in parts), value
    return parts


def identity(s):
    return (stat.S_IMODE(s.st_mode), s.st_dev, s.st_ino)


def tuple_for(s):
    return (s.st_size, *identity(s))


def stable(s):
    return (*tuple_for(s), s.st_mtime_ns, s.st_ctime_ns, s.st_nlink)


def parent_fd(rootfd, rel, directories=None):
    parts = relative(rel)
    fd = os.dup(rootfd)
    running = []
    try:
        for part in parts[:-1]:
            running.append(part)
            nxt = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = nxt
            if directories is not None:
                row = directories['/'.join(running)]
                assert identity(os.fstat(fd)) == tuple(row[k] for k in ('mode', 'device', 'inode'))
        return fd, parts[-1]
    except BaseException:
        os.close(fd)
        raise


def open_root(ancestry):
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        assert ancestry[0]['path'] == '/'
        for i, row in enumerate(ancestry):
            if i:
                nxt = os.open(Path(row['path']).name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
                os.close(fd)
                fd = nxt
            assert identity(os.fstat(fd)) == tuple(row[k] for k in ('mode', 'device', 'inode'))
        return fd
    except BaseException:
        os.close(fd)
        raise


def hash_leaf(parent, leaf, expected, single_link=False):
    fd = os.open(leaf, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent)
    try:
        s = os.fstat(fd)
        assert stat.S_ISREG(s.st_mode) and (not single_link or s.st_nlink == 1), expected['path']
        assert tuple_for(s) == tuple(expected[k] for k in ('bytes', 'mode', 'device', 'inode')), expected['path']
        digest = hashlib.sha256()
        while True:
            body = os.read(fd, 1024 * 1024)
            if not body:
                break
            digest.update(body)
        assert stable(s) == stable(os.fstat(fd)) == stable(os.stat(leaf, dir_fd=parent, follow_symlinks=False))
        assert digest.hexdigest() == expected['sha256'], 'body changed: ' + expected['path']
        COST['hashReads'] += 1
        COST['hashBytes'] += s.st_size
        return s
    finally:
        os.close(fd)


def hash_rows(rows, rootfd, name, absolute_root=None, single_link_paths=()):
    parent = None
    previous = None
    try:
        for i, row in enumerate(rows, 1):
            rel = str(Path(row['path']).relative_to(absolute_root)) if absolute_root else row['path']
            parts = relative(rel)
            key = tuple(parts[:-1])
            if key != previous:
                if parent is not None:
                    os.close(parent)
                parent, _ = parent_fd(rootfd, rel)
                previous = key
            hash_leaf(parent, parts[-1], row, row['path'] in single_link_paths)
            if i % 10000 == 0:
                emit(name, completed=i, total=len(rows), hashBytes=COST['hashBytes'])
    finally:
        if parent is not None:
            os.close(parent)
    emit(name, completed=len(rows), total=len(rows), hashBytes=COST['hashBytes'])


def census(rootfd, sink=None):
    rows = {}
    def visit(fd, prefix):
        s = os.fstat(fd)
        rows[prefix or '.'] = dict(kind='directory', mode=identity(s)[0], device=s.st_dev, inode=s.st_ino)
        for entry in sorted(os.scandir(fd), key=lambda x: x.name):
            rel = prefix + '/' + entry.name if prefix else entry.name
            s = os.stat(entry.name, dir_fd=fd, follow_symlinks=False)
            if stat.S_ISDIR(s.st_mode):
                child = os.open(entry.name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
                try:
                    assert identity(os.fstat(child)) == identity(s)
                    visit(child, rel)
                finally:
                    os.close(child)
            else:
                row = dict(kind='file' if stat.S_ISREG(s.st_mode) else 'nonregular', bytes=s.st_size,
                           mode=identity(s)[0], device=s.st_dev, inode=s.st_ino, nlink=s.st_nlink,
                           mtimeNs=s.st_mtime_ns, ctimeNs=s.st_ctime_ns, allocatedBytes=s.st_blocks * 512)
                if stat.S_ISLNK(s.st_mode):
                    row.update(kind='symlink', target=os.readlink(entry.name, dir_fd=fd))
                rows[rel] = row
    visit(rootfd, '')
    if sink:
        with gzip.open(sink, 'xt', encoding='utf-8') as out:
            for path, row in sorted(rows.items()):
                out.write(json.dumps(dict(path=path, **row), sort_keys=True, separators=(',', ':')) + '\n')
    return rows


def check_alias(alias, slashfd):
    parent, leaf = parent_fd(slashfd, str(Path(alias['path']).relative_to('/')))
    try:
        s = os.stat(leaf, dir_fd=parent, follow_symlinks=False)
        assert stat.S_ISLNK(s.st_mode) and identity(s) == tuple(alias[k] for k in ('mode', 'device', 'inode'))
        assert os.readlink(leaf, dir_fd=parent) == alias['target']
    finally:
        os.close(parent)


def verify_frozen_records(freeze, first):
    for row in freeze['records'] + first['records']:
        q = R / Path(*relative(row['path']))
        body = q.read_bytes()
        assert (len(body), hashlib.sha256(body).hexdigest(), stat.S_IMODE(q.lstat().st_mode)) == (row['bytes'], row['sha256'], row['mode'])
    expected = freeze['immutableDependencies']['firstPassFreeze']
    body = (E / 'freeze.json').read_bytes()
    assert (len(body), hashlib.sha256(body).hexdigest()) == (expected['bytes'], expected['sha256'])


def main():
    global phase
    args = argparse.ArgumentParser()
    args.add_argument('--execute', action='store_true', required=True)
    args.add_argument('--release', type=Path, required=True)
    args.add_argument('--release-sha256', required=True)
    selected = args.parse_args()
    release = selected.release.read_bytes()
    assert hashlib.sha256(release).hexdigest() == selected.release_sha256, 'Root release pin mismatch'
    # Root must separately issue the effect grant; an execution flag is not that authority.
    activation = json.loads((D / 'preparation-activation.json').read_bytes())
    assert activation['operation'] == 'T287_COMMENTARY_CLEANUP_DELETE_03_PREPARE'
    frozen = (F / 'freeze.json').read_bytes()
    assert len(frozen) == 9512 and hashlib.sha256(frozen).hexdigest() == EXPECTED_FREEZE
    freeze = json.loads(frozen)
    first = json.loads((E / 'freeze.json').read_bytes())
    assert freeze['status'] == first['status'] == 'CLOSED'
    verify_frozen_records(freeze, first)
    preparation = json.loads((D / 'preparation-freeze.json').read_bytes())
    for row in preparation['records']:
        q = R / row['path']; body = q.read_bytes()
        assert (len(body), hashlib.sha256(body).hexdigest(), stat.S_IMODE(q.lstat().st_mode)) == (row['bytes'], row['sha256'], row['mode'])
    body = (F / 'candidate-files.json').read_bytes()
    assert hashlib.sha256(body).hexdigest() == EXPECTED_LIST
    candidates = json.loads(body)
    protections = json.loads((F / 'protected-files.json').read_bytes())
    unproved = json.loads((F / 'excluded-unproved-files.json').read_bytes())
    originals = json.loads((F / 'original-witnesses.json').read_bytes())
    contexts = json.loads((F / 'context-pins.json').read_bytes())
    alias = json.loads((F / 'alias-binding.json').read_bytes())
    assert (len(candidates), sum(x['bytes'] for x in candidates)) == (197399, 9634686370)
    assert (len(protections), len(unproved), len(originals), len(contexts)) == (16338, 8492, 104688, 8)
    all_copy = sorted(candidates + protections + unproved, key=lambda x: x['path'])
    copy_rows = {x['path']: x for x in all_copy}
    paths = {x['path'] for x in candidates}
    assert len(copy_rows) == len(all_copy) == 222229
    assert sum(x['bytes'] for x in all_copy) == 10196841075
    original_rows = {x['path']: x for x in originals}
    assert len(original_rows) == len(originals) == 104688
    assert {x['originalPath'] for x in candidates} == set(original_rows)
    T = Path(activation['physicalOriginalRootAncestry'][-1]['path'])
    O = T / 'test_env/downstream'
    A, B = alias['copyPrefixA'], alias['repeatedLeadingPrefixB']
    for row in candidates:
        relative(row['path'])
        original = original_rows[row['originalPath']]
        assert (row['bytes'], row['sha256']) == (original['bytes'], original['sha256'])
        if row['originKind'] == 'literal_canonical_downstream':
            assert row['originalPath'] == str(O / row['path'])
        else:
            assert row['originKind'] == 'explicit_existing_alias_to_physical_T' and row['path'].startswith(A)
            suffix = row['path'][len(A):]; levels = 1
            while suffix.startswith(B): suffix = suffix[len(B):]; levels += 1
            relative(suffix)
            assert levels == row['aliasLevels'] <= 2 and row['originalPath'] == str(T / suffix)
        relative(str(Path(row['originalPath']).relative_to(T)))
    write('execution-activation.json', dict(operation='T287_COMMENTARY_CLEANUP_DELETE_03', role='Worker',
          actor='/root/rc1_c03_install_review', activatedUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),
          releasePath=str(selected.release), releaseBytes=len(release), releaseSHA256=selected.release_sha256,
          planFreezeSHA256=EXPECTED_FREEZE, candidateManifestSHA256=EXPECTED_LIST, candidateFiles=197399))
    slashfd = os.open('/', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    cfd = open_root(activation['copyRootAncestry'])
    tfd = open_root(activation['physicalOriginalRootAncestry'])
    try:
        phase = 'complete_preflight_before_any_unlink'
        before = census(cfd, D / 'preflight-membership.jsonl.gz')
        files = {p for p, x in before.items() if x['kind'] == 'file'}
        assert files == set(copy_rows) and not any(x['kind'] not in ('file', 'directory') for x in before.values())
        directories = {p: x for p, x in before.items() if x['kind'] == 'directory'}
        old_dirs = {x['path']: x for x in json.loads((E / 'directories.json').read_bytes())}
        assert set(directories) == set(old_dirs)
        for p, row in directories.items():
            assert tuple(row[k] for k in ('mode', 'device', 'inode')) == tuple(old_dirs[p][k] for k in ('mode', 'device', 'inode'))
        hash_rows(all_copy, cfd, 'preflight_all_copies', single_link_paths=paths)
        hash_rows(originals, tfd, 'preflight_distinct_originals', absolute_root=T)
        hash_rows(contexts, slashfd, 'preflight_contexts', absolute_root=Path('/'))
        check_alias(alias['literalAlias'], slashfd)
        allocated = sum(before[p]['allocatedBytes'] for p in paths)
        write('preflight.json', dict(status='COMPLETE_BEFORE_ANY_UNLINK', files=222229, directories=len(directories),
              candidateFiles=197399, candidateLogicalBytes=9634686370, candidateAllocatedBytesFromStBlocks=allocated,
              originalWitnesses=104688, protectedFiles=16338, unprovedFiles=8492, contextPins=8,
              elapsedSeconds=time.monotonic() - START, hashCost=dict(COST)))
        phase = 'exact_list_unlink'
        ledger = os.open(D / 'unlink-ledger.jsonl', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_APPEND, 0o644)
        try:
            for i, row in enumerate(candidates, 1):
                parent, leaf = parent_fd(cfd, row['path'], directories)
                try:
                    s = hash_leaf(parent, leaf, row, single_link=True)
                    assert stable(s) == stable(os.stat(leaf, dir_fd=parent, follow_symlinks=False))
                    assert s.st_blocks * 512 == before[row['path']]['allocatedBytes']
                    os.unlink(leaf, dir_fd=parent)
                    removed.append(row['path'])
                    data = (json.dumps(dict(sequence=i, **row, allocatedBytesAtUnlink=s.st_blocks * 512,
                            effect='unlinked_exact_regular_copy'), sort_keys=True, separators=(',', ':')) + '\n').encode()
                    assert os.write(ledger, data) == len(data)
                finally:
                    os.close(parent)
                if i % 10000 == 0:
                    os.fsync(ledger); emit('unlinks', removed=i, total=197399)
            os.fsync(ledger)
        finally:
            os.close(ledger)
        phase = 'complete_post_conservation'
        after = census(cfd)
        assert set(after) == set(before) - paths
        assert all(row == before[p] for p, row in after.items()), 'unlisted file/directory identity or metadata changed'
        hash_rows(sorted(protections + unproved, key=lambda x: x['path']), cfd, 'post_all_retained_copies')
        hash_rows(originals, tfd, 'post_distinct_originals', absolute_root=T)
        hash_rows(contexts, slashfd, 'post_contexts', absolute_root=Path('/'))
        check_alias(alias['literalAlias'], slashfd)
        for ancestry in (activation['copyRootAncestry'], activation['physicalOriginalRootAncestry']):
            fd = open_root(ancestry); os.close(fd)
        verify_frozen_records(freeze, first)
        for row in preparation['records']:
            q = R / row['path']; body = q.read_bytes()
            assert (len(body), hashlib.sha256(body).hexdigest(), stat.S_IMODE(q.lstat().st_mode)) == (row['bytes'], row['sha256'], row['mode'])
        ledger_count = ledger_bytes = 0
        with (D / 'unlink-ledger.jsonl').open() as source:
            for line in source:
                row = json.loads(line)
                assert row['sequence'] == ledger_count + 1 and row['path'] == candidates[ledger_count]['path']
                ledger_count += 1; ledger_bytes += row['bytes']
        assert (ledger_count, ledger_bytes, len(removed)) == (197399, 9634686370, 197399)
        result = dict(operation='T287_COMMENTARY_CLEANUP_DELETE_03', status='CLOSED',
             workResult='GO_EXACT_DELETION_CONSERVATION', removedFiles=197399, removedLogicalBytes=9634686370,
             removedAllocatedBytesFromStBlocks=allocated, removedDirectories=0, remainingFiles=24830,
             protectedFilesUnchanged=16338, unprovedFilesUnchanged=8492, distinctOriginalsUnchanged=104688,
             contextPinsUnchanged=8, aliasAndPhysicalOwnerIdentityUnchanged=True,
             completeCopyMembershipEqualsBeforeMinusExactList=True, directoriesAndNonregularsPreserved=True,
             planAndPreparationRecordsUnchanged=True, elapsedSeconds=time.monotonic() - START, hashCost=dict(COST),
             peakRSSBytes=resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
             process=dict(pid=os.getpid(), synchronousNoChildren=True),
             effects=dict(unlinks=197399, directoryRemoval=0, commentsFileWrites=0, originalWrites=0,
                          moves=0, symlinks=0, GitCodeBuildProductRuntimeNetwork=0),
             historicalEvidence='Immutable past censuses are unchanged; only this ledgered disposable working-copy subset was intentionally removed.',
             limits=['st_blocks totals do not measure free disk gained or APFS shared extents.',
                     'No Product/native/qualification/release acceptance or other cleanup territory.'])
        write('result.json', result); emit('CLOSED', **result)
    finally:
        os.close(cfd); os.close(tfd); os.close(slashfd)


if __name__ == '__main__':
    try:
        main()
    except BaseException as error:
        # No retry/force: partial progress, if any, is recorded for Executive triage.
        if not (D / 'stop.json').exists():
            write('stop.json', dict(status='STOPPED', phase=phase, errorType=type(error).__name__,
                  error=str(error), removedFiles=len(removed), lastRemoved=removed[-1] if removed else None,
                  elapsedSeconds=time.monotonic() - START, hashCost=dict(COST), noForceRepairRetry=True))
        raise
