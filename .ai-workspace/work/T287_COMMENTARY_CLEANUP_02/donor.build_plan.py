"""Planning only. Reads G and originals; writes only the granted work/evidence roots."""
from pathlib import Path
import collections
import datetime
import hashlib
import json
import os
import re
import stat
import struct
import time

START = time.monotonic()
R = Path('/Users/jim/src/apps/abiogenesis')
G = R / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
W = R / '.ai-workspace/work/T287_COMMENTARY_CLEANUP_01'
E = R / '.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_01'
ORIGINAL = R / 'build_tenants/abiogenesis/typescript/test_env/test_runs'
assert json.loads((W / 'activation.json').read_bytes())['activation'] == 'ACTIVE_PLANNING_ONLY'
NAMES = json.loads((W / 'named-roots.json').read_bytes())
COPY = NAMES['copiedRoot']
ROOTS = [COPY] + NAMES['cacheRoots']
EXCLUDED = {'final-candidate-construction-09', 'final-candidate-construction-10',
            'g2-existing-owner-groups-01', 'g2-gtl-current-how-01'}
TOOL_ARCHIVES = 'final-candidate-construction-03/npm-cache'
TEXT_VISUAL = {'.md', '.markdown', '.mdx', '.txt', '.rst', '.adoc', '.org', '.puml',
               '.mmd', '.html', '.htm', '.pdf', '.docx', '.png', '.jpg', '.jpeg', '.svg', '.webp'}
ARCHIVES = {'.tgz', '.tar', '.gz', '.zip'}
LOGS = {'.log', '.out', '.err', '.stdout', '.stderr', '.transcript'}
refs = {}
cost = collections.Counter()


def guard(p, within=None):
    p = Path(p)
    assert p.is_absolute()
    if within is not None:
        assert p == within or within in p.parents, str(p)
    for part in (p, *p.parents):
        assert not part.is_symlink(), 'symlink path component: ' + str(part)
    return p


def info(p, rel=None, with_sha512=False):
    guard(p)
    before = p.lstat()
    assert stat.S_ISREG(before.st_mode), str(p)
    h = hashlib.sha256()
    h512 = hashlib.sha512() if with_sha512 else None
    first = b''
    fd = os.open(p, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(fd, 'rb') as f:
        opened = os.fstat(f.fileno())
        assert (opened.st_dev, opened.st_ino) == (before.st_dev, before.st_ino)
        for b in iter(lambda: f.read(1024 * 1024), b''):
            if not first:
                first = b[:16]
            h.update(b)
            if h512 is not None:
                h512.update(b)
    after = p.lstat()
    fields = lambda s: (s.st_dev, s.st_ino, s.st_size, s.st_mode, s.st_mtime_ns, s.st_ctime_ns)
    assert fields(before) == fields(after), 'changed while hashing: ' + str(p)
    cost['hashedFiles'] += 1
    cost['hashedBytes'] += before.st_size
    row = {'path': str(rel if rel is not None else p), 'bytes': before.st_size,
           'sha256': h.hexdigest(), 'mode': stat.S_IMODE(before.st_mode),
           'device': before.st_dev, 'inode': before.st_ino}
    return row, first, h512.hexdigest() if h512 is not None else None


def pin(p):
    key = str(p)
    if key not in refs:
        row, _, _ = info(p)
        refs[key] = row
    return key


def write(name, obj):
    p = E / name
    assert not p.exists()
    p.write_text(json.dumps(obj, sort_keys=True, separators=(',', ':')) + '\n')


guard(G)
for i, a in enumerate(ROOTS):
    p = guard(G / a, G)
    assert p.is_dir(), a
    assert 'node_modules' not in p.relative_to(G).parts, a
    assert p.relative_to(G).parts[0] not in EXCLUDED, a
    for b in ROOTS[:i]:
        assert not (a == b or a.startswith(b + '/') or b.startswith(a + '/')), (a, b)
guard(ORIGINAL)

# Read and checksum Git's index directly; no Git command or repository mutation.
index_path = R / '.git/index'
ib = index_path.read_bytes()
sig, version, count = struct.unpack('!4sII', ib[:12])
assert sig == b'DIRC' and version == 2
assert hashlib.sha1(ib[:-20]).digest() == ib[-20:]
tracked = set()
o = 12
for _ in range(count):
    start = o
    flags = struct.unpack('!H', ib[o + 60:o + 62])[0]
    assert flags & 0x4000 == 0
    o += 62
    end = ib.index(0, o)
    tracked.add(ib[o:end].decode('utf-8', 'surrogateescape'))
    o = start + ((end + 1 - start + 7) // 8) * 8
index_sha = hashlib.sha256(ib).hexdigest()
prefix = str(G.relative_to(R)) + '/'
tracked_g = {p[len(prefix):] for p in tracked if p.startswith(prefix)}
pin(index_path)

# Bind the exact owning/readiness records, without changing their historical census.
for rel in ['README.md', 'AGENTS.md', 'specification/GOALS.md', 'specification/INTENT.md',
            'specification/PRODUCT.md', 'stdo_abiogenesis.json',
            'build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md']:
    pin(R / rel)
fzp = G / 'f11-carrier-realization-01/freeze.json'
gp = G / 'f11-carrier-realization-01/copied-generated-pins.json'
pin(fzp)
pin(gp)
pin(G / 'f11-carrier-realization-01/readiness.json')
fz = json.loads(fzp.read_bytes())
generated = json.loads(gp.read_bytes())
assert fz['status'] == 'CLOSED' and len(fz['records']) == 117
assert len(generated['records']) == 714
for rows in (fz['records'], generated['records']):
    assert not any('copied-tenant/test_env/test_runs' in r['path'] for r in rows)

root_rows = []
for rel in ROOTS:
    p = G / rel
    st = p.stat()
    lifecycle = []
    for parent in (p, *p.parents):
        if parent == G:
            break
        for name in ('freeze.json', 'final-freeze.json', 'final-runtime-freeze.json',
                     'preparation-freeze.json', 'return.md', 'readiness.json'):
            q = parent / name
            if q.is_file() and not q.is_symlink():
                lifecycle.append(pin(q))
        if lifecycle:
            break
    root_rows.append({'path': rel, 'role': 'redundant_copied_test_work' if rel == COPY else
                      ('protected_frozen_tool_archives' if rel == TOOL_ARCHIVES else
                       ('V8_compile_cache' if p.name == 'node-compile-cache' else 'npm_cache')),
                      'mode': stat.S_IMODE(st.st_mode), 'device': st.st_dev, 'inode': st.st_ino,
                      'lifecyclePins': lifecycle, 'candidateFiles': 0, 'candidateBytes': 0,
                      'excludedFiles': 0, 'excludedBytes': 0})

candidates = []
protected = []
excluded_files = []
copy_originals = []
directories = []
nonregular = []
totals = collections.Counter()
protected_reasons = collections.Counter()
root_lookup = {x: i for i, x in enumerate(ROOTS)}


def root_index(rel):
    for a, i in root_lookup.items():
        if rel == a or rel.startswith(a + '/'):
            return i
    return None


for base, dirs, files in os.walk(G, topdown=True, followlinks=False):
    dirs.sort()
    files.sort()
    for name in list(dirs):
        p = Path(base) / name
        st = p.lstat()
        if stat.S_ISLNK(st.st_mode):
            totals['links'] += 1
            ri = root_index(str(p.relative_to(G)))
            if ri is not None:
                nonregular.append({'path': str(p.relative_to(G)), 'kind': 'symlink',
                                   'target': os.readlink(p), 'device': st.st_dev, 'inode': st.st_ino})
            dirs.remove(name)
        else:
            totals['directories'] += 1
            rel = str(p.relative_to(G))
            ri = root_index(rel)
            if ri is not None:
                directories.append({'path': rel, 'mode': stat.S_IMODE(st.st_mode),
                                    'device': st.st_dev, 'inode': st.st_ino, 'root': ri})
    for name in files:
        p = Path(base) / name
        st = p.lstat()
        rel = str(p.relative_to(G))
        ri = root_index(rel)
        if not stat.S_ISREG(st.st_mode):
            totals['links' if stat.S_ISLNK(st.st_mode) else 'otherNonregular'] += 1
            if ri is not None:
                nonregular.append({'path': rel, 'kind': 'symlink' if stat.S_ISLNK(st.st_mode) else 'other',
                                   'device': st.st_dev, 'inode': st.st_ino})
            continue
        totals['regularFiles'] += 1
        totals['regularBytes'] += st.st_size
        reasons = []
        if p.suffix.lower() in TEXT_VISUAL:
            reasons.append('text_or_visual')
        if rel in tracked_g:
            reasons.append('Git_tracked')
        if '.git' in p.relative_to(G).parts:
            reasons.append('Git_metadata')
        if ri is not None:
            if 'node_modules' in p.relative_to(G).parts:
                reasons.append('node_modules_CODE')
            if p.suffix.lower() in ARCHIVES:
                reasons.append('archive')
            if ROOTS[ri] == TOOL_ARCHIVES:
                reasons.append('actual_frozen_tool_archive')
            if st.st_nlink != 1:
                reasons.append('hardlink')
            if ROOTS[ri] != COPY and (p.suffix.lower() in LOGS or '_logs' in p.parts):
                reasons.append('human_or_readiness_log')
        if ri is None and not reasons:
            continue
        row, header, h512 = info(p, rel, with_sha512=(ri is not None and '_cacache/content-v2/sha512/' in rel))
        if reasons:
            row['reasons'] = sorted(set(reasons))
            protected.append(row)
            protected_reasons.update(set(reasons))
        elif ri is not None:
            relative = p.relative_to(G / ROOTS[ri])
            parts = relative.parts
            kind = None
            why = None
            if ROOTS[ri] == COPY:
                original = ORIGINAL / relative
                assert ORIGINAL in original.parents
                link_component = next((str(q) for q in (original, *original.parents)
                                       if q.is_symlink()), None)
                if link_component:
                    why = 'original_symlink_component'
                    row['originalLinkComponent'] = link_component
                elif not original.exists():
                    why = 'no_matching_original'
                elif not stat.S_ISREG(original.lstat().st_mode):
                    why = 'original_nonregular'
                else:
                    witness, _, _ = info(original, str(relative))
                    if witness['bytes'] == row['bytes'] and witness['sha256'] == row['sha256']:
                        kind = 'redundant_copied_test_output'
                        copy_originals.append(witness)
                    else:
                        why = 'unique_or_nonmatching_original'
            elif (G / ROOTS[ri]).name == 'node-compile-cache':
                if len(parts) == 2 and re.fullmatch(r'v24\.7\.0-arm64-[0-9a-f]{8}-501', parts[0]) \
                        and re.fullmatch(r'[0-9a-f]{8}', parts[1]) and header[:4] == bytes.fromhex('b2dbdf8a'):
                    kind = 'V8_regenerable_compile_cache'
                else:
                    why = 'not_established_V8_cache_body'
            else:
                normalized = parts[1:] if parts[0] == 'npm' else parts
                if len(normalized) == 6 and normalized[:3] == ('_cacache', 'content-v2', 'sha512') \
                        and re.fullmatch(r'[0-9a-f]{2}', normalized[3]) \
                        and re.fullmatch(r'[0-9a-f]{2}', normalized[4]) \
                        and re.fullmatch(r'[0-9a-f]{124}', normalized[5]):
                    assert h512 == ''.join(normalized[3:]), 'cacache integrity mismatch: ' + rel
                    kind = 'npm_content_addressed_regenerable_cache'
                elif len(normalized) == 5 and normalized[:2] == ('_cacache', 'index-v5') \
                        and re.fullmatch(r'[0-9a-f]{2}', normalized[2]) \
                        and re.fullmatch(r'[0-9a-f]{2}', normalized[3]) \
                        and re.fullmatch(r'[0-9a-f]{60}', normalized[4]):
                    valid = True
                    for line in p.read_bytes().splitlines():
                        if not line:
                            continue
                        try:
                            digest, body = line.split(b'\t', 1)
                            valid = valid and hashlib.sha1(body).hexdigest().encode() == digest
                            parsed = json.loads(body)
                            valid = valid and isinstance(parsed, dict) and isinstance(parsed.get('key'), str)
                        except (ValueError, TypeError):
                            valid = False
                    if valid:
                        kind = 'npm_regenerable_cache_index'
                    else:
                        why = 'not_established_cacache_index'
                else:
                    why = 'not_content_addressed_or_V8_cache'
            row['root'] = ri
            if kind:
                row['kind'] = kind
                candidates.append(row)
                root_rows[ri]['candidateFiles'] += 1
                root_rows[ri]['candidateBytes'] += row['bytes']
            else:
                row['reason'] = why
                row['classification'] = 'PROTECTED_UNPROVED_COPY' if ROOTS[ri] == COPY else 'PROTECTED_UNPROVED_CACHE'
                excluded_files.append(row)
        if ri is not None and (reasons or row.get('reason')):
            root_rows[ri]['excludedFiles'] += 1
            root_rows[ri]['excludedBytes'] += row['bytes']
    if totals['regularFiles'] and totals['regularFiles'] % 100000 == 0:
        print(json.dumps({'progressFiles': totals['regularFiles']}), flush=True)

assert hashlib.sha256(index_path.read_bytes()).hexdigest() == index_sha, 'Git index moved'
for old in list(refs.values()):
    current, _, _ = info(Path(old['path']))
    assert current == old, 'context pin changed: ' + old['path']
assert len({r['path'] for r in candidates}) == len(candidates)
assert not ({r['path'] for r in candidates} & {r['path'] for r in protected})
candidate_kinds = collections.Counter(r['kind'] for r in candidates)
candidate_bytes = sum(r['bytes'] for r in candidates)
write('candidate-files.json', candidates)
write('protected-files.json', protected)
write('excluded-candidate-files.json', excluded_files)
write('copied-original-witnesses.json', copy_originals)
write('candidate-directories.json', directories)
write('nonregulars.json', nonregular)
write('context-pins.json', list(refs.values()))
write('named-root-plan.json', {'operation': 'T287_COMMENTARY_CLEANUP_PLAN_01',
      'status': 'CLOSED_PLANNING_ONLY_NO_DELETION', 'G': str(G), 'originalCopyRoot': str(ORIGINAL),
      'roots': root_rows, 'protectedWholeRoots': sorted(EXCLUDED),
      'protection': {'textVisualExtensions': sorted(TEXT_VISUAL), 'archiveExtensions': sorted(ARCHIVES),
                     'GitIndexPath': str(index_path), 'GitIndexSHA256': index_sha,
                     'GitIndexVersion': version, 'GitIndexEntries': count,
                     'GitTrackedGPaths': len(tracked_g), 'doNotFollowSymlinks': True,
                     'nonregularsUntouched': True, 'hardlinksExcluded': True,
                     'copiedMachineOutputsRequireOriginalBodyEquality': True,
                     'entireC03FrozenToolCacheProtected': TOOL_ARCHIVES},
      'deletionNotAuthorized': True,
      'futureGuard': 'Root separate grant after nonauthor review; exact per-file tuple reacquisition, symlink-free containment and unchanged original/protection/context pins; no broad rmtree; optional empty-directory removal only bottom-up within exact approved roots',
      'historicalProof': 'Original freezes and receipts remain unchanged; later cleanup ledger must record authorized cache/copy removals rather than represent their original physical census as still complete',
      'limits': ['logical file bytes are not allocated/reclaimed disk bytes',
                 'no cache-independent reproduction or future readiness claim',
                 'no native state or Product authority change',
                 'active donor roots excluded; Setup09/10 only explicitly named caches eligible']})
summary = {'operation': 'T287_COMMENTARY_CLEANUP_PLAN_01', 'status': 'CLOSED_PLANNING_ONLY_NO_DELETION',
           'finishedUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'namedRoots': len(ROOTS), 'candidateFiles': len(candidates), 'candidateBytes': candidate_bytes,
           'candidateKinds': dict(candidate_kinds), 'protectedFiles': len(protected),
           'protectedBytes': sum(r['bytes'] for r in protected), 'protectedReasonCounts': dict(protected_reasons),
           'excludedCandidateFiles': len(excluded_files), 'excludedCandidateBytes': sum(r['bytes'] for r in excluded_files),
           'originalCopyWitnesses': len(copy_originals), 'contextPins': len(refs),
           'GSnapshot': dict(totals), 'cost': dict(cost), 'elapsedSeconds': time.monotonic() - START,
           'effects': {'commentsWrites': 0, 'deletions': 0, 'moves': 0, 'symlinksCreated': 0,
                      'GitCommands': 0, 'ProductImports': 0, 'RuntimeCalls': 0,
                      'buildsTests': 0, 'networkProviderCalls': 0, 'writesOnly': [str(W), str(E)]}}
write('summary.json', summary)
print(json.dumps(summary), flush=True)
