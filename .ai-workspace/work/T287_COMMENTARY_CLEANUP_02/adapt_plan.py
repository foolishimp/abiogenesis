from pathlib import Path
import ast, difflib, hashlib, json
W=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_COMMENTARY_CLEANUP_02')
s=(W/'donor.build_plan.py').read_text(); original=s

def change(a,b):
 global s
 assert s.count(a)==1,(a[:100],s.count(a))
 s=s.replace(a,b)

def block(a,b,replacement):
 global s
 start=s.index(a); end=s.index(b,start)
 s=s[:start]+replacement+s[end:]

change('Reads G and originals','Reads comments outside governance and originals')
change("G = R / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'","G = R / '.ai-workspace/comments'\nEXCLUDED_PATH = 'codex/20260928_FRAMED_GOVERNANCE'")
change("W = R / '.ai-workspace/work/T287_COMMENTARY_CLEANUP_01'","W = R / '.ai-workspace/work/T287_COMMENTARY_CLEANUP_02'")
change("E = R / '.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_01'","E = R / '.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_02'")
block("EXCLUDED = {",'TEXT_VISUAL =',"EXCLUDED = {EXCLUDED_PATH}\nOPERATION = NAMES['operation']\nSOURCE_EXTENSIONS = {'.ts','.tsx','.js','.jsx','.mjs','.cjs','.map','.c','.h','.rs','.py','.sh','.yaml','.yml','.toml','.lock'}\nNATIVE_RESOURCE_PARTS = {'node_modules','.git','event-store','event_store','eventstore','events','stores','native-resources','native_resources','resources','worksite','worksites','installed','install','installation','instance','host','product-store','artifact-store'}\nPROOF_NAMES = {'freeze.json','manifest.json','readiness.json','assertion.json','handoff.json','resource-assertion.json','current-resources.json','proof.json'}\n")
change("first = b[:16]","first = b[:512]")
change("assert p.relative_to(G).parts[0] not in EXCLUDED, a","assert not (a == EXCLUDED_PATH or a.startswith(EXCLUDED_PATH + '/')), a")
block('# Bind the exact owning/readiness records,', 'root_rows = []', '''# Bind authority, immutable planning controls, preserved Code cut, and exact original-copy origin.
for rel in ['README.md', 'AGENTS.md', 'specification/GOALS.md', 'specification/INTENT.md',
            'specification/PRODUCT.md', 'stdo_abiogenesis.json',
            'build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md']:
    pin(R / rel)
for p in (W/'activation.json',W/'grant.txt',W/'named-roots.json',W/'build_plan.py',W/'donor.build_plan.py',
          W/'discovery.json',W/'origin-observations.json',W/'closure-text-observations.json',
          R/'.ai-workspace/evidence/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/freeze.json'):
    pin(p)
copy_origin = G/'codex/20260909_D1_LIFECYCLE/native-implementation/proof-summary.json'
if copy_origin.is_file() and not copy_origin.is_symlink():
    pin(copy_origin)
for origin in NAMES['cacheOrigins'].values():
    for path in origin['lifecycleRecords']:
        pin(Path(path))

''')
block('    lifecycle = []','candidates = []', '''    origin = NAMES['cacheOrigins'].get(rel, {})
    lifecycle = [str(pin(Path(q))) for q in origin.get('lifecycleRecords', [])]
    root_rows.append({'path': rel, 'role': 'redundant_copied_test_work' if rel == COPY else origin['kind'],
                     'mode': stat.S_IMODE(st.st_mode), 'device': st.st_dev, 'inode': st.st_ino,
                     'lifecyclePins': lifecycle, 'closedOriginProven': None if rel == COPY else origin['closedOriginProven'],
                     'closureEvidence': origin.get('closureEvidence', []),
                     'candidateFiles': 0, 'candidateBytes': 0,'excludedFiles': 0,'excludedBytes': 0})

''')
change("    for name in list(dirs):\n        p = Path(base) / name\n        st = p.lstat()", "    for name in list(dirs):\n        p = Path(base) / name\n        rel = str(p.relative_to(G))\n        st = p.lstat()\n        if rel == EXCLUDED_PATH or name in ('node_modules','.git'):\n            totals['prunedWholeRoots'] += 1\n            dirs.remove(name)\n            continue")
change("            ri = root_index(str(p.relative_to(G)))\n            if ri is not None:\n                nonregular.append({'path': str(p.relative_to(G)), 'kind': 'symlink',\n                                   'target': os.readlink(p), 'device': st.st_dev, 'inode': st.st_ino})", "            nonregular.append({'path': str(p.relative_to(G)), 'kind': 'symlink',\n                               'target': os.readlink(p), 'device': st.st_dev, 'inode': st.st_ino})")
change("            if ri is not None:\n                nonregular.append({'path': rel, 'kind': 'symlink' if stat.S_ISLNK(st.st_mode) else 'other',\n                                   'device': st.st_dev, 'inode': st.st_ino})", "            nonregular.append({'path': rel, 'kind': 'symlink' if stat.S_ISLNK(st.st_mode) else 'other',\n                               'device': st.st_dev, 'inode': st.st_ino})")
change("        if ri is not None:\n            if 'node_modules'", "        if p.suffix.lower() in LOGS or '_logs' in p.parts or any(x in p.name.lower() for x in ('.stdout','.stderr','.transcript')):\n            reasons.append('human_or_readiness_log')\n        if ri is not None:\n            if 'node_modules'")
change("            if ROOTS[ri] == TOOL_ARCHIVES:\n                reasons.append('actual_frozen_tool_archive')\n", "")
change("            if ROOTS[ri] != COPY and (p.suffix.lower() in LOGS or '_logs' in p.parts):\n                reasons.append('human_or_readiness_log')", "            if ROOTS[ri] == COPY:\n                cp = p.relative_to(G / COPY)\n                if p.suffix.lower() in SOURCE_EXTENSIONS:\n                    reasons.append('copied_SOURCE_or_CODE')\n                if set(cp.parts[:-1]) & NATIVE_RESOURCE_PARTS or p.suffix.lower() in {'.jsonl','.ndjson','.sqlite','.db','.raw'}:\n                    reasons.append('native_store_install_worksite_or_transport')\n                if p.name.lower() in PROOF_NAMES or any(x in p.name.lower() for x in ('proof','assertion','handoff','evidence','receipt')):\n                    reasons.append('retained_named_proof')\n            elif not NAMES['cacheOrigins'][ROOTS[ri]]['closedOriginProven']:\n                reasons.append('cache_origin_not_proven_closed')")
change("        if reasons:\n            row['reasons']", "        if ri is not None and (header[:2] == bytes.fromhex('1f8b') or header[:4] in (b'PK\\x03\\x04', b'PK\\x05\\x06') or header[257:262] == b'ustar'):\n            reasons.append('actual_archive_body_including_extensionless')\n        if reasons:\n            row['reasons']")
change("                normalized = parts[1:] if parts[0] == 'npm' else parts", "                normalized = ('_cacache',) + parts if (G / ROOTS[ri]).name == '_cacache' else (parts[1:] if parts[0] == 'npm' else parts)")
change("with_sha512=(ri is not None and '_cacache/content-v2/sha512/' in rel)", "with_sha512=(ri is not None and '/_cacache/content-v2/sha512/' in rel)")
change("            if witness['bytes'] == row['bytes']", "            if witness['bytes'] == row['bytes']") if False else None
# Original witness coordinates remain checked at the future deletion boundary. Recheck originals now.
change("assert len({r['path'] for r in candidates}) == len(candidates)", "for old in copy_originals:\n    current, _, _ = info(ORIGINAL / old['path'], old['path'])\n    assert current == old, 'original copy witness moved: ' + old['path']\nassert len({r['path'] for r in candidates}) == len(candidates)")
s=s.replace("'T287_COMMENTARY_CLEANUP_PLAN_01'",'OPERATION')
change("'entireC03FrozenToolCacheProtected': TOOL_ARCHIVES", "'extensionlessArchiveHeadersProtected': True,\n                     'logsProtectedIncludingRawCopy': True, 'allNodeModulesPruned': True,\n                     'unprovedCacheOriginProtected': True, 'protectedPrunedRoots': NAMES['pruned']")
change("'active donor roots excluded; Setup09/10 only explicitly named caches eligible'", "'entire governance subtree excluded; unproved closed-cache origins protected; raw copies require exact surviving original witnesses'")
change("'GSnapshot': dict(totals)", "'outsideGovernanceSnapshot': dict(totals)")
change("'finishedUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),", "'finishedUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),\n           'closedCacheOrigins': sum(x['closedOriginProven'] for x in NAMES['cacheOrigins'].values()),\n           'unprovedCacheOriginsProtected': sum(not x['closedOriginProven'] for x in NAMES['cacheOrigins'].values()),")
# Preserve every ordinary noncandidate: no absence of a protection-list row grants deletion.
change("'deletionNotAuthorized': True,", "'deletionNotAuthorized': True,\n      'noncandidatePolicy': 'ALL unlisted files and pruned roots are protected; this exact positive file list is the only proposed effect',")
assert 'TOOL_ARCHIVES' not in s
ast.parse(s)
p=W/'build_plan.py'; assert not p.exists();p.write_text(s)
(W/'planner-adaptation.diff').write_text(''.join(difflib.unified_diff(original.splitlines(True),s.splitlines(True),fromfile='readonly-helper-01',tofile='global-plan-02')))
print(json.dumps({'plannerBytes':len(s.encode()),'plannerSHA256':hashlib.sha256(s.encode()).hexdigest(),'syntax':'AST_PARSE_PASS','operation':'T287_COMMENTARY_CLEANUP_GLOBAL_PLAN_02'}))
