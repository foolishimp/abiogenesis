#!/usr/bin/env python3
"""Bounded, read-only Operator observation; not a Product runtime dependency.

JSON input: worksite, writePaths, protectedRoots, archiveRoot (absolute paths).
JSON stdout; exit 0 separated, 1 demonstrated overlap, 2 indeterminate.
Only Darwin arm64, complete stable mount observations and same APFS instance
can yield positive separation. No subprocess, traversal of directory contents,
mount, write, Product import, or fallback to lexical ancestry is performed.
"""
import ctypes
import errno
import fcntl
import hashlib
import json
import os
import platform
import signal
import stat
import sys
import time
import unicodedata

MAX_MOUNTS = 128
MAX_PATHS = 128
MAX_COMPONENTS = 128
MAX_INPUT_BYTES = 131072
MAX_SECONDS = 45
F_GETPATH_NOFIRMLINK = 102
MNT_NOWAIT = 2
MNT_UNION = 0x20


class Indeterminate(Exception):
    pass


class Statfs64(ctypes.Structure):
    _fields_ = [
        ('bsize', ctypes.c_uint32), ('iosize', ctypes.c_int32),
        ('blocks', ctypes.c_uint64), ('bfree', ctypes.c_uint64),
        ('bavail', ctypes.c_uint64), ('files', ctypes.c_uint64),
        ('ffree', ctypes.c_uint64), ('fsid', ctypes.c_int32 * 2),
        ('owner', ctypes.c_uint32), ('type', ctypes.c_uint32),
        ('flags', ctypes.c_uint32), ('subtype', ctypes.c_uint32),
        ('fstype', ctypes.c_char * 16), ('mountedOn', ctypes.c_char * 1024),
        ('mountedFrom', ctypes.c_char * 1024), ('flagsExt', ctypes.c_uint32),
        ('reserved', ctypes.c_uint32 * 7),
    ]


def require(value, message):
    if not value:
        raise Indeterminate(message)


def canonical_json(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=True)


def digest(value):
    return hashlib.sha256(canonical_json(value).encode()).hexdigest()


def valid_path(value):
    require(isinstance(value, str) and value.startswith('/'), 'absolute path required')
    require('\0' not in value and len(value.encode('utf-8')) < 1024, 'path encoding/length bound')
    require(value == os.path.normpath(value) and not value.startswith('//'), 'canonical lexical spelling required')
    require(len(value.split('/')) <= MAX_COMPONENTS, 'path component bound')
    return value


def below(parent, child):
    return parent == child or child.startswith(parent.rstrip('/') + '/')


def folded(value):
    # Conservative ambiguity refusal, not a claim about the APFS volume's
    # normalization or case-sensitivity settings.
    return unicodedata.normalize('NFD', value).casefold()


def identity(info):
    return {'device': str(info.st_dev), 'inode': str(info.st_ino),
            'mode': info.st_mode, 'links': info.st_nlink}


def mount_row(value):
    def string(name):
        raw = bytes(getattr(value, name))
        limit = 16 if name == 'fstype' else 1024
        require(len(raw) < limit, 'unterminated mount string')
        return raw.decode('utf-8', errors='strict')
    return {'fsid': list(value.fsid), 'type': value.type,
            'flags': value.flags, 'flagsExt': value.flagsExt,
            'subtype': value.subtype, 'filesystem': string('fstype'),
            'mountedOn': string('mountedOn'), 'mountedFrom': string('mountedFrom')}


def mount_key(value):
    return canonical_json(value)


class Observation:
    def __init__(self):
        require(sys.platform == 'darwin' and platform.machine() == 'arm64', 'unsupported host')
        require(ctypes.sizeof(Statfs64) == 2168, 'SDK statfs64 layout mismatch')
        self.libc = ctypes.CDLL(None, use_errno=True)
        self.libc.getfsstat64.argtypes = [ctypes.POINTER(Statfs64), ctypes.c_int, ctypes.c_int]
        self.libc.getfsstat64.restype = ctypes.c_int
        self.libc.fstatfs64.argtypes = [ctypes.c_int, ctypes.POINTER(Statfs64)]
        self.libc.fstatfs64.restype = ctypes.c_int
        self.anchors = {}
        self.fds = {}
        self.components = {}

    def snapshot(self):
        count = self.libc.getfsstat64(None, 0, MNT_NOWAIT)
        require(0 < count <= MAX_MOUNTS, 'mount count unavailable or exceeds bound')
        rows = (Statfs64 * (MAX_MOUNTS + 1))()
        got = self.libc.getfsstat64(rows, ctypes.sizeof(rows), MNT_NOWAIT)
        after_count = self.libc.getfsstat64(None, 0, MNT_NOWAIT)
        require(got == count == after_count and got <= MAX_MOUNTS, 'mount snapshot truncated or changed')
        result = sorted((mount_row(row) for row in rows[:got]), key=mount_key)
        require(len({mount_key(row) for row in result}) == got, 'duplicate complete mount rows')
        for row in result:
            valid_path(row['mountedOn'])
        return result

    def fd_path(self, fd):
        raw = fcntl.fcntl(fd, F_GETPATH_NOFIRMLINK, b'\0' * 1024)
        zero = raw.find(b'\0')
        require(zero > 0, 'descriptor backing path unavailable/truncated')
        return valid_path(raw[:zero].decode('utf-8', errors='strict'))

    def fd_mount(self, fd):
        row = Statfs64()
        require(self.libc.fstatfs64(fd, ctypes.byref(row)) == 0, 'descriptor mount unavailable')
        return mount_row(row)

    def acquire(self, path):
        path = valid_path(path)
        if path in self.anchors:
            return self.anchors[path]
        require(len(self.anchors) < MAX_PATHS, 'anchor count exceeds bound')
        parts = path.strip('/').split('/') if path != '/' else []
        current, missing = '/', []
        root_info = os.lstat('/')
        self.components['/'] = identity(root_info)
        for index, part in enumerate(parts):
            candidate = os.path.join(current, part)
            try:
                info = os.lstat(candidate)
            except FileNotFoundError:
                missing = parts[index:]
                break
            require(not stat.S_ISLNK(info.st_mode), 'symlink in observation path: ' + candidate)
            require(stat.S_ISDIR(info.st_mode) or (index == len(parts) - 1 and stat.S_ISREG(info.st_mode)), 'unsupported path kind: ' + candidate)
            self.components[candidate] = identity(info)
            current = candidate
        before = os.lstat(current)
        flags = os.O_RDONLY | os.O_NOFOLLOW | getattr(os, 'O_CLOEXEC', 0)
        if stat.S_ISDIR(before.st_mode):
            flags |= os.O_DIRECTORY
        fd = os.open(current, flags)
        self.fds[path] = fd
        held = os.fstat(fd)
        require(identity(before) == identity(held), 'anchor changed during acquisition')
        backing = self.fd_path(fd)
        require(identity(os.lstat(backing)) == identity(held), 'backing path does not identify descriptor')
        require(not missing or stat.S_ISDIR(held.st_mode), 'missing suffix below non-directory')
        if stat.S_ISREG(held.st_mode):
            require(held.st_nlink == 1, 'multiply-linked regular file')
        row = {'path': path, 'existingAnchor': current, 'missingSuffix': missing,
               'identity': identity(held), 'backingAnchor': backing,
               'backingPath': os.path.join(backing, *missing),
               'descriptorMount': self.fd_mount(fd)}
        self.anchors[path] = row
        return row

    def attachments(self, mounts):
        result = []
        for row in mounts:
            if row['mountedOn'] == '/':
                continue
            # Observe the attachment's parent, NEVER the mounted-on target or
            # its contents. Unrelated network/nullfs volumes need no entry.
            parent = self.acquire(os.path.dirname(row['mountedOn']))
            require(not parent['missingSuffix'], 'mount attachment parent is absent')
            result.append({'mount': row, 'parent': parent['path'],
                           'backingLocation': os.path.join(parent['backingPath'], os.path.basename(row['mountedOn']))})
        return result

    def recheck(self):
        for path, row in self.anchors.items():
            fd = self.fds[path]
            require(identity(os.fstat(fd)) == row['identity'], 'descriptor changed')
            require(identity(os.lstat(row['existingAnchor'])) == row['identity'], 'anchor changed')
            require(identity(os.lstat(row['backingAnchor'])) == row['identity'], 'backing anchor changed')
            require(self.fd_path(fd) == row['backingAnchor'], 'backing path changed')
            require(self.fd_mount(fd) == row['descriptorMount'], 'descriptor mount changed')
            if row['missingSuffix']:
                try:
                    os.lstat(os.path.join(row['existingAnchor'], row['missingSuffix'][0]))
                except FileNotFoundError:
                    pass
                else:
                    raise Indeterminate('previously absent suffix became present')
        for path, expected in self.components.items():
            require(identity(os.lstat(path)) == expected, 'path component changed: ' + path)

    def close(self):
        for fd in self.fds.values():
            os.close(fd)


def assess_pair(left, right, mounts, attachments):
    a, b = left['backingPath'], right['backingPath']
    if below(a, b) or below(b, a):
        return 'overlap', 'descriptor backing paths overlap'
    if not left['missingSuffix'] and not right['missingSuffix'] and left['identity']['device'] == right['identity']['device'] and left['identity']['inode'] == right['identity']['inode']:
        return 'overlap', 'descriptors identify the same filesystem object'
    if below(folded(a), folded(b)) or below(folded(b), folded(a)):
        return 'indeterminate', 'case/normalization overlap cannot be excluded'
    lm, rm = left['descriptorMount'], right['descriptorMount']
    if lm != rm or lm['filesystem'] != 'apfs' or lm['flags'] & MNT_UNION:
        return 'indeterminate', 'no single non-union APFS mount instance'
    if sum(row['fsid'] == lm['fsid'] for row in mounts) != 1 or sum(row == lm for row in mounts) != 1:
        return 'indeterminate', 'descriptor mount lacks unique complete-population membership'
    for attachment in attachments:
        target = attachment['backingLocation']
        if below(folded(a), folded(target)) or below(folded(b), folded(target)):
            return 'indeterminate', 'unhandled mount attachment beneath compared recursive scope: ' + attachment['mount']['mountedOn']
    return 'separated', 'stable backing paths on one uniquely identified APFS instance; no descendant attachment'


def observe(layout):
    require(isinstance(layout, dict) and set(layout) == {'worksite', 'writePaths', 'protectedRoots', 'archiveRoot'}, 'layout fields differ')
    require(isinstance(layout['writePaths'], list) and isinstance(layout['protectedRoots'], list), 'layout roots must be lists')
    require(layout['writePaths'] and layout['protectedRoots'], 'nonempty finite write/protected scopes required')
    require(len(layout['writePaths']) + len(layout['protectedRoots']) + 2 <= MAX_PATHS // 2, 'layout exceeds bound')
    paths = list(dict.fromkeys([layout['worksite'], layout['archiveRoot'], *layout['writePaths'], *layout['protectedRoots']]))
    for path in paths:
        valid_path(path)
    require(all(below(layout['worksite'], p) and p != layout['worksite'] for p in layout['writePaths']), 'write paths must be strictly inside worksite')
    pairs = []
    for effect in [layout['worksite'], *layout['writePaths']]:
        for protected in dict.fromkeys(layout['protectedRoots']):
            pairs.append((effect, protected))
    pairs.append((layout['archiveRoot'], layout['worksite']))
    for protected in dict.fromkeys(layout['protectedRoots']):
        if protected != layout['archiveRoot']:
            pairs.append((layout['archiveRoot'], protected))
    pairs = list(dict.fromkeys(pairs))
    obs = Observation()
    result = {'layout': layout, 'bounds': {'mounts': MAX_MOUNTS, 'paths': MAX_PATHS, 'seconds': MAX_SECONDS},
              'kind': 'operator_controlled_layout_observation', 'platform': platform.platform(),
              'qualified': False, 'atomicMountLockClaim': False}
    try:
        before = obs.snapshot()
        for path in paths:
            obs.acquire(path)
        # Actual overlap is decisive before the stronger separation obligation.
        overlap = []
        for left, right in pairs:
            disposition, reason = assess_pair(obs.anchors[left], obs.anchors[right], before, [])
            if disposition == 'overlap':
                overlap.append({'left': left, 'right': right, 'disposition': disposition, 'reason': reason})
        attachments = [] if overlap else obs.attachments(before)
        relations = overlap or [{'left': left, 'right': right,
                                'disposition': assess_pair(obs.anchors[left], obs.anchors[right], before, attachments)[0],
                                'reason': assess_pair(obs.anchors[left], obs.anchors[right], before, attachments)[1]}
                               for left, right in pairs]
        obs.recheck()
        after = obs.snapshot()
        require(before == after, 'complete mount population changed during observation')
        status = 'overlap' if overlap else ('indeterminate' if any(r['disposition'] != 'separated' for r in relations) else 'separated')
        result.update({'ok': status == 'separated', 'disposition': status,
                       'reason': next((r['reason'] for r in relations if r['disposition'] != 'separated'), 'every requested relation positively separated'),
                       'mountCount': len(before), 'mountSnapshotBeforeSha256': digest(before),
                       'mountSnapshotAfterSha256': digest(after), 'mounts': before,
                       'anchors': list(obs.anchors.values()), 'attachments': attachments, 'relations': relations})
        return result
    finally:
        obs.close()


def main():
    started = time.monotonic()
    signal.signal(signal.SIGALRM, lambda _sig, _frame: (_ for _ in ()).throw(Indeterminate('observation time bound')))
    signal.alarm(MAX_SECONDS)
    try:
        require(len(sys.argv) == 2, 'one layout file argument or - required')
        if sys.argv[1] == '-':
            raw = sys.stdin.buffer.read(MAX_INPUT_BYTES + 1)
        else:
            with open(sys.argv[1], 'rb') as stream:
                raw = stream.read(MAX_INPUT_BYTES + 1)
        require(len(raw) <= MAX_INPUT_BYTES, 'layout byte bound')
        result = observe(json.loads(raw))
    except Exception as error:
        result = {'ok': False, 'disposition': 'indeterminate', 'reason': str(error), 'errorType': type(error).__name__, 'qualified': False}
    finally:
        signal.alarm(0)
    result['elapsedMs'] = round((time.monotonic() - started) * 1000, 3)
    print(json.dumps(result, sort_keys=True, ensure_ascii=True))
    return {'separated': 0, 'overlap': 1, 'indeterminate': 2}[result['disposition']]


if __name__ == '__main__':
    sys.exit(main())
