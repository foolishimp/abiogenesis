#!/usr/bin/env python3
"""Lossless WIP checkpoint transport; never edits originals or invokes Git writes."""
import argparse
import collections
import gzip
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import tarfile
import time

CHECKPOINT = '.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT'
COMMENTS = '.ai-workspace/comments/'
PART_LIMIT = 49 * 1024 * 1024
BLOCK = 1024 * 1024
SKIP_DIRS = {'node_modules', '.git', '__pycache__', '.pytest_cache', '.mypy_cache',
             '.ruff_cache', '.npm-cache', '.cache', '.scala-build', '.metals'}
COMPRESSED = ('.gz', '.tgz', '.xz', '.zst', '.zip', '.bz2', '.7z')
TOKEN = re.compile(rb'(?:gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:proj-|ant-api03-)?[A-Za-z0-9_-]{40,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)')


def emit(**value):
    print(json.dumps(value), flush=True)


def write_json(path, value):
    with path.open('x') as f:
        json.dump(value, f, indent=2)
        f.write('\n')


def git_paths(repo, *args):
    return [os.fsdecode(p) for p in subprocess.check_output(['git', *args, '-z'], cwd=repo).split(b'\0') if p]


def digest_file(path):
    sha = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(BLOCK), b''):
            sha.update(block)
    return sha.hexdigest()


class PartsWriter:
    def __init__(self, out, prefix):
        self.out, self.prefix = out, prefix
        self.file = None
        self.parts = []
        self.sha = hashlib.sha256()
        self.size = 0

    def writable(self):
        return True

    def tell(self):
        return self.size

    def flush(self):
        if self.file:
            self.file.flush()

    def write(self, data):
        total = len(data)
        while data:
            if self.file is None:
                rel = f'payloads/{self.prefix}.part{len(self.parts):04d}'
                self.file = (self.out / rel).open('xb')
                self.part_sha = hashlib.sha256()
                self.part_size = 0
                self.parts.append({'path': rel})
            n = min(len(data), PART_LIMIT - self.part_size)
            block, data = data[:n], data[n:]
            self.file.write(block)
            self.part_sha.update(block)
            self.sha.update(block)
            self.part_size += n
            self.size += n
            if self.part_size == PART_LIMIT:
                self.close_part()
        return total

    def close_part(self):
        if self.file:
            self.file.close()
            self.parts[-1].update(byteLength=self.part_size, sha256=self.part_sha.hexdigest())
            self.file = None

    def finish(self):
        self.close_part()
        return {'byteLength': self.size, 'sha256': self.sha.hexdigest(), 'parts': self.parts}


class PartsReader(io.RawIOBase):
    def __init__(self, out, parts):
        self.out, self.parts = out, iter(parts)
        self.file = None

    def readable(self):
        return True

    def readinto(self, b):
        while True:
            if self.file is None:
                try:
                    self.file = (self.out / next(self.parts)['path']).open('rb')
                except StopIteration:
                    return 0
            n = self.file.readinto(b)
            if n:
                return n
            self.file.close()
            self.file = None


class HashReader:
    def __init__(self, f, path, findings):
        self.f, self.path, self.findings = f, path, findings
        self.sha = hashlib.sha256()
        self.tail = b''
        self.bytes = 0
        self.hit = False

    def read(self, n=-1):
        data = self.f.read(n)
        self.sha.update(data)
        self.bytes += len(data)
        if not self.hit and TOKEN.search(self.tail + data):
            self.findings.append({'path': self.path, 'finding': 'credential-shaped bytes; inspect without exposing values'})
            self.hit = True
        self.tail = data[-160:]
        return data


def exclusion(repo, relative, is_dir=False):
    parts = PurePosixPath(relative).parts
    for name in SKIP_DIRS:
        if name in parts:
            return 'reproducible dependency/cache directory: ' + name
    # Compiled package projections are reconstructible from the retained source/package.
    if is_dir and parts[-1] in {'build', 'dist'}:
        parent = (repo / relative).parent
        if (parent / 'package.json').is_file():
            return 'compiled package projection beside retained package.json'
    if relative.endswith(('.pyc', '.pyo')):
        return 'Python bytecode cache'
    if relative.endswith('.class') and 'target' in parts:
        return 'compiled JVM class; source, reports and runtime outputs retained'
    return None


def prepare(repo, out, held, included=None, selected=None):
    (out / 'payloads').mkdir(exist_ok=True)
    if (out / 'catalog.json').exists():
        raise RuntimeError('Refusing to overwrite an existing checkpoint')
    tracked = set(git_paths(repo, 'ls-files', '--cached'))
    known = set(git_paths(repo, 'ls-files', '--cached', '--others', '--exclude-standard'))
    if selected is not None:
        known = set(selected)
    elif included:
        known = {p for p in known if any(p == q or p.startswith(q + '/') for q in included)}
    archived, excluded, pending = set(), {}, set()
    if selected is not None:
        archived = {p for p in known if p not in tracked and (p.startswith(COMMENTS) or p.startswith('.genesis/'))}
    roots = [] if selected is not None else ([repo / q for q in included] if included else [repo / '.ai-workspace/comments'])
    if selected is None and not included and repo.name == 'odd_glc':
        roots.append(repo / '.genesis')
    for root in roots:
        if not root.exists():
            continue
        for here, dirs, files in os.walk(root, followlinks=False):
            rel_here = Path(here).relative_to(repo).as_posix()
            if rel_here == CHECKPOINT or rel_here.startswith(CHECKPOINT + '/'):
                dirs[:] = []
                continue
            if any(rel_here == p or rel_here.startswith(p + '/') for p in held):
                pending.add(rel_here)
                dirs[:] = []
                continue
            for name in list(dirs):
                relative = (Path(here) / name).relative_to(repo).as_posix()
                if (Path(here) / name).is_symlink():
                    dirs.remove(name)
                    files.append(name)
                    continue
                reason = exclusion(repo, relative, True)
                if reason:
                    excluded[relative + '/'] = reason
                    dirs.remove(name)
            for name in files:
                relative = (Path(here) / name).relative_to(repo).as_posix()
                if any(relative == p or relative.startswith(p + '/') for p in held):
                    pending.add(relative)
                    continue
                reason = exclusion(repo, relative)
                if reason:
                    excluded[relative] = reason
                elif relative not in tracked:
                    archived.add(relative)
    # Existing tracked material stays directly represented by Git, never hidden in archives.
    def excluded_path(p):
        if p in excluded:
            return True
        parts = p.split('/')
        return any('/'.join(parts[:n]) + '/' in excluded for n in range(1, len(parts)))
    direct = sorted(p for p in known if p not in archived and not p.startswith(CHECKPOINT + '/')
                    and not any(p == h or p.startswith(h + '/') for h in held)
                    and not exclusion(repo, p)
                    and not excluded_path(p))
    # All nontracked .genesis members are transported, not added as unpacked installs.
    direct = [p for p in direct if not p.startswith('.genesis/')]
    direct_set = set(direct)
    groups = collections.defaultdict(list)
    for p in sorted(archived):
        parts = p.split('/')
        family = '/'.join(parts[:4]) if p.startswith(COMMENTS) else '/'.join(parts[:3])
        groups[family].append(p)
    counts = collections.Counter()
    dispositions = {}
    for p in sorted(known | archived):
        if p.startswith(CHECKPOINT + '/'):
            continue
        if p in archived:
            d = 'archive_backed'
        elif any(p == h or p.startswith(h + '/') for h in held):
            d = 'pending_active_evidence'
        elif p in direct_set:
            d = 'direct_git'
        elif exclusion(repo, p) or excluded_path(p):
            d = 'excluded_reproducible'
        else:
            raise RuntimeError('Unreconciled path: ' + p)
        counts[d] += 1
        dispositions[p] = d
    with gzip.open(out / 'path-reconciliation.jsonl.gz', 'xt', compresslevel=6) as f:
        for p, d in dispositions.items():
            f.write(json.dumps({'path': p, 'disposition': d}) + '\n')
    write_json(out / 'exclusions.json', {'prefixesAndFiles': excluded,
        'policy': 'Only named reproducible dependency/cache/compiler artifacts are excluded. No blanket comments, test_runs, sandbox, source, report or runtime-evidence exclusion.',
        'alreadyIgnoredOutsideEvidence': 'Existing repository ignore policy retained; ignored evidence beneath comments was enumerated explicitly.'})
    (out / 'direct-paths.nul').write_bytes(b''.join(os.fsencode(p) + b'\0' for p in direct))
    write_json(out / 'pending.json', {'activeEvidenceRoots': held,
        'sourceAddition': 'All canonical changed/new/deleted source, tests, generated metadata and tracking bytes must be frozen and staged directly after final acceptance; this preparation makes no source-freeze claim.'})
    emit(stage='inventory_closed', repo=str(repo), counts=dict(counts), archiveFamilies=len(groups), excludedPrefixes=len(excluded))
    rows, catalog, findings, raw_seen = [], [], [], {}
    for number, (family, paths) in enumerate(sorted(groups.items())):
        normal = []
        for p in paths:
            source = repo / p
            st = source.lstat()
            if stat.S_ISREG(st.st_mode) and p.endswith(COMPRESSED):
                sha = digest_file(source)
                asset = raw_seen.get(sha)
                if asset is None:
                    writer = PartsWriter(out, 'raw-' + sha)
                    with source.open('rb') as f:
                        for block in iter(lambda: f.read(BLOCK), b''):
                            writer.write(block)
                    value = writer.finish()
                    assert value['sha256'] == sha and value['byteLength'] == st.st_size
                    asset = 'raw-' + sha
                    catalog.append({'id': asset, 'kind': 'exact_original_compressed_file', **value})
                    raw_seen[sha] = asset
                rows.append({'path': p, 'kind': 'file', 'mode': stat.S_IMODE(st.st_mode),
                    'byteLength': st.st_size, 'sha256': sha, 'asset': asset})
            else:
                normal.append(p)
        if normal:
            asset = f'family-{number:04d}'
            writer = PartsWriter(out, asset + '.tar.gz')
            with gzip.GzipFile(filename='', mode='wb', fileobj=writer, compresslevel=6, mtime=0) as compressed:
                with tarfile.open(fileobj=compressed, mode='w|', format=tarfile.PAX_FORMAT) as bundle:
                    for p in normal:
                        source = repo / p
                        before = source.lstat()
                        info = bundle.gettarinfo(str(source), arcname=p)
                        if info.isfile():
                            with source.open('rb') as f:
                                reader = HashReader(f, p, findings)
                                bundle.addfile(info, reader)
                            sha = reader.sha.hexdigest()
                            assert reader.bytes == before.st_size
                            row = {'path': p, 'kind': 'file', 'mode': stat.S_IMODE(before.st_mode),
                                   'byteLength': before.st_size, 'sha256': sha, 'asset': asset}
                        elif info.issym():
                            bundle.addfile(info)
                            target = os.readlink(source)
                            row = {'path': p, 'kind': 'symlink', 'mode': stat.S_IMODE(before.st_mode),
                                   'target': target, 'sha256': hashlib.sha256(os.fsencode(target)).hexdigest(), 'asset': asset}
                        else:
                            raise RuntimeError('Unsupported evidence file kind: ' + p)
                        after = source.lstat()
                        assert (before.st_size, before.st_mtime_ns, before.st_ino) == (after.st_size, after.st_mtime_ns, after.st_ino), 'Changed during snapshot: ' + p
                        rows.append(row)
            catalog.append({'id': asset, 'kind': 'tar_gzip', 'sourceFamily': family, **writer.finish()})
        emit(stage='family_packed', repo=repo.name, family=family, files=len(paths),
             familiesDone=number + 1, familyCount=len(groups), transportBytes=sum(x['byteLength'] for x in catalog))
    with gzip.open(out / 'members.jsonl.gz', 'xt', compresslevel=6) as f:
        for row in rows:
            f.write(json.dumps(row) + '\n')
    write_json(out / 'credential-shape-findings.json', {'findings': findings,
        'claim': 'Heuristic scan of uncompressed retained members only; values are never recorded here.'})
    value = {'kind': 'wip_checkpoint_transport', 'repository': str(repo),
        'headAtPreparation': subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),
        'scope': 'Incremental WIP preservation only; accepted source, installed successes/failures and proposals retain their separate proof scopes; no release or qualification claim.',
        'partLimit': PART_LIMIT, 'originalsModified': False, 'counts': dict(counts),
        'archiveMemberCount': len(rows), 'archiveMemberBytes': sum(x.get('byteLength',0) for x in rows),
        'transportBytes': sum(x['byteLength'] for x in catalog), 'assets': catalog,
        'indexSha256': digest_file(out / 'members.jsonl.gz'),
        'reconciliationSha256': digest_file(out / 'path-reconciliation.jsonl.gz'),
        'pendingActiveEvidence': held, 'credentialShapeFindingCount': len(findings)}
    write_json(out / 'catalog.json', value)
    emit(stage='transport_prepared', repo=repo.name, members=len(rows), bytes=value['transportBytes'], findings=len(findings))


def verify(out, original_root=None, restore_root=None):
    catalog = json.loads((out / 'catalog.json').read_text())
    assert digest_file(out / 'members.jsonl.gz') == catalog['indexSha256']
    assert digest_file(out / 'path-reconciliation.jsonl.gz') == catalog['reconciliationSha256']
    with gzip.open(out / 'members.jsonl.gz', 'rt') as f:
        rows = [json.loads(line) for line in f]
    by_asset = collections.defaultdict(dict)
    for row in rows:
        assert row['path'] not in by_asset[row['asset']]
        parts = PurePosixPath(row['path']).parts
        assert not PurePosixPath(row['path']).is_absolute() and '..' not in parts
        by_asset[row['asset']][row['path']] = row
    seen = set()
    total = 0
    def check_original(row):
        if original_root is not None:
            p = original_root / row['path']
            actual = hashlib.sha256(os.fsencode(os.readlink(p))).hexdigest() if row['kind'] == 'symlink' else digest_file(p)
            assert actual == row['sha256'], 'Original changed after archive: ' + row['path']
    def save(row, stream=None):
        sha = hashlib.sha256()
        length = 0
        target = None
        if restore_root is not None:
            target = restore_root / row['path']
            # Refuse traversal through a previously restored or ambient symlink.
            assert not any(p.is_symlink() for p in target.parents if p != restore_root.parent)
            target.parent.mkdir(parents=True, exist_ok=True)
            if row['kind'] == 'symlink':
                os.symlink(row['target'], target)
                return
        f = target.open('xb') if target else None
        try:
            for block in iter(lambda: stream.read(BLOCK), b''):
                sha.update(block)
                length += len(block)
                if f:
                    f.write(block)
        finally:
            if f:
                f.close()
        assert sha.hexdigest() == row['sha256'] and length == row['byteLength'], row['path']
        if target:
            target.chmod(row['mode'])
    for n, asset in enumerate(catalog['assets']):
        whole = hashlib.sha256()
        length = 0
        for part in asset['parts']:
            p = out / part['path']
            assert p.stat().st_size == part['byteLength'] <= catalog['partLimit']
            assert digest_file(p) == part['sha256']
            with p.open('rb') as f:
                for block in iter(lambda: f.read(BLOCK), b''):
                    whole.update(block)
                    length += len(block)
        assert whole.hexdigest() == asset['sha256'] and length == asset['byteLength']
        members = by_asset[asset['id']]
        if asset['kind'] == 'exact_original_compressed_file':
            for row in members.values():
                with io.BufferedReader(PartsReader(out, asset['parts'])) as f:
                    save(row, f)
                check_original(row)
                seen.add(row['path'])
        else:
            with io.BufferedReader(PartsReader(out, asset['parts'])) as f:
                with tarfile.open(fileobj=f, mode='r|gz') as bundle:
                    asset_seen = set()
                    for member in bundle:
                        row = members[member.name]
                        assert member.name not in asset_seen
                        asset_seen.add(member.name)
                        if member.issym():
                            assert row['kind'] == 'symlink' and member.linkname == row['target']
                            if restore_root is not None:
                                save(row)
                        else:
                            assert member.isfile() and row['kind'] == 'file'
                            save(row, bundle.extractfile(member))
                        check_original(row)
                        seen.add(row['path'])
                    assert asset_seen == set(members)
        total += asset['byteLength']
        if n % 10 == 0:
            emit(stage='verification_progress', assets=n+1, assetCount=len(catalog['assets']), members=len(seen), bytes=total)
    assert len(seen) == len(rows) == catalog['archiveMemberCount']
    result = {'kind': 'checkpoint_restoration_verification', 'allPartHashesVerified': True,
        'allReconstructedAssetHashesVerified': True, 'allMemberPathsAndHashesVerified': True,
        'memberCount': len(seen), 'transportBytes': total,
        'originalsComparedAfterPacking': original_root is not None,
        'restoredToDirectory': str(restore_root) if restore_root else None,
        'verification': 'Complete bounded-memory reconstruction/readback through the restoration path; no source/runtime execution.'}
    emit(stage='verification_closed', **result)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('operation', choices=['prepare','verify','restore'])
    parser.add_argument('--repo', type=Path)
    parser.add_argument('--checkpoint', type=Path, required=True)
    parser.add_argument('--hold', action='append', default=[])
    parser.add_argument('--include', action='append', default=[])
    parser.add_argument('--destination', type=Path)
    args = parser.parse_args()
    if args.operation == 'prepare':
        prepare(args.repo, args.checkpoint, args.hold, args.include)
    else:
        result = verify(args.checkpoint, args.repo,
                        args.destination if args.operation == 'restore' else None)
        if args.operation == 'verify' and not (args.checkpoint / 'verification.json').exists():
            write_json(args.checkpoint / 'verification.json', result)


if __name__ == '__main__':
    main()
