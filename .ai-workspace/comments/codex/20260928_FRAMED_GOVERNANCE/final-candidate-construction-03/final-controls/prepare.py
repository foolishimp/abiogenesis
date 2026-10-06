from pathlib import Path
import base64, hashlib, json, os, shutil, stat, subprocess, time

D = Path(__file__).resolve().parent.parent
G = D.parent
B = G.parents[3]
C = G / 'final-candidate-construction-02'
P = G / 'rc1-successor-construction-controls-03'
W = G / 'f11-carrier-realization-01'
L = G / 'f11-law-stage-repair-01'
REL = Path('/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.2')
TR = Path('build_tenants/abiogenesis/typescript')
F, S = D / 'final-source', D / 'final-stage'
started = time.monotonic()
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
read = lambda p: json.loads(p.read_text())

def save(name, value):
    with (D / name).open('x') as f:
        json.dump(value, f, indent=2); f.write('\n')

def verify(root, rows):
    for r in rows:
        p = root / r['path']
        if r.get('kind') == 'symlink':
            assert p.is_symlink() and str(p.readlink()) == r['target'], str(p)
        else:
            assert p.is_file() and not p.is_symlink(), str(p)
            assert p.stat().st_size == r['bytes'] and sha(p) == r['sha256'], str(p)

def copy(p, q, expected=None):
    assert p.is_file() and not p.is_symlink(), str(p)
    digest = sha(p)
    assert expected is None or digest == expected, str(p)
    q.parent.mkdir(parents=True, exist_ok=True)
    assert not q.exists() and not q.is_symlink(), str(q)
    shutil.copy2(p, q)
    assert sha(q) == digest and p.stat().st_ino != q.stat().st_ino
    return {'path': str(q.relative_to(D)), 'bytes': q.stat().st_size,
            'sha256': digest, 'mode': stat.S_IMODE(q.stat().st_mode), 'origin': str(p), 'kind': 'file'}

assert not F.exists() and not S.exists(), 'new final selection only'
assert sha(P / 'request.txt') == 'a953a72b8491c0fe9c9fd332e1d5f1f0cf093d04206b58cb70dc46c74d4e20dc'
verify(P, read(P / 'control-freeze.json')['records'])
assert sha(C / 'freeze.json') == '7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469'
assert sha(D / 'preparation-freeze.json') == 'dad93850afa6ffc8268d46baeebedb439583fd3221a91208b92c25b6a29ad3ed'
preparation = read(D / 'preparation-freeze.json')
verify(D, preparation['records'])
preserved = list(preparation['records'])
source_preparation = read(D / 'source-preparation.json')
for row in source_preparation['members']:
    for key in ['frozenCopy', 'stagedCopy']:
        verify(D, [row[key]]); preserved.append(row[key])
tools = read(D / 'toolchain-pins.json')['records']
verify(D, tools); preserved.extend(tools)
deps = read(D / 'dependency-pins.json')['members']
for row in deps:
    for key in ['preparedArchive', 'preparedCacheContent']:
        verify(D, [row[key]]); preserved.append(row[key])

assert sha(W / 'freeze.json') == '51bfa2ad75ab9d2c0858998c7e4a82a6e7a4269a4c277c842af07ae1c7f6da1c'
verify(W, read(W / 'freeze.json')['records'])
assert sha(W / 'source-postimages.json') == '99a89da21aa6e6f9f0296ca55c388ab12cac319692a4dec9a944242a723afe90'
assert sha(L / 'freeze.json') == 'a4bceff9b2b37913667998784fb3be36ddf9986950c4bb5117c891add697c872'
sources = read(C / 'source-members.json')
verify(C / 'source-freeze/repo', sources)
authority = read(P / 'authority-postimages.json')
carrier = read(W / 'source-postimages.json')
assert len(authority) == 13 and len(carrier) == 25
by = {row['path']: row for row in sources}
selected = {row['path']: (C / 'source-freeze/repo' / row['path'], 'inherited_C02', row) for row in sources}
for row in authority:
    assert by[row['path']]['sha256'] == row['C02PreimageSHA256']
    p = P / row['postimagePath']; assert sha(p) == row['sha256'] and p.stat().st_size == row['bytes']
    selected[row['path']] = (p, 'Executive_exact_authority_postimage', row)
for row in carrier:
    p = W / row['postimagePath']; assert sha(p) == row['sha256'] and p.stat().st_size == row['bytes']
    assert row['path'] not in {a['path'] for a in authority}
    selected[row['path']] = (p, 'accepted_carrier_source_postimage', row)
how = 'build_tenants/abiogenesis/typescript/design/T287_F11_CARRIER_RESOURCE_DESIGN.md'
how_source = B / how
assert sha(how_source) == '744a930be51c7130480b22126acfbc6ec42c2c4fca07fcd762b76757e66d6d9b'
assert how not in by
selected[how] = (how_source, 'accepted_frozen_HOW', {'path': how, 'sha256': sha(how_source), 'bytes': how_source.stat().st_size})

# Authenticate the complete selected installed law before any stage body is written.
manifest_bytes = (REL / 'manifest.json').read_bytes()
assert hashlib.sha256(manifest_bytes).hexdigest() == '3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782'
manifest = json.loads(manifest_bytes)
definition = read(selected['stdo_abiogenesis.json'][0])
basis = definition['constitution']['stdo']['basis']
assert manifest['kind'] == 'stdo.installed-release-manifest'
assert basis['uri'] == 'stdo://releases/' + manifest['release']['cut'] + '/'
assert basis['manifest_sha256'] == hashlib.sha256(manifest_bytes).hexdigest()
standard = manifest['standards']
assert standard['member_count'] == len(standard['members']) == 52
member_set = ''.join(r['sha256'] + '  ' + standard['source_root'] + '/' + r['path'] + '\n'
                     for r in sorted(standard['members'], key=lambda r: r['path'])).encode()
assert hashlib.sha256(member_set).hexdigest() == standard['member_set_sha256'] == '2f54671dfde54a6ad87347ac7190028af5e21021988247edf8068ab6248ef7e8'
for row in standard['members']:
    assert sha(REL / 'standards' / row['path']) == row['sha256'], row['path']

host = read(C / 'toolchain-host.json')
for row in host['nodeDynamicLibraries']:
    if row['sha256'] is not None: assert sha(Path(row['path'])) == row['sha256'], row['path']
node = D / 'source-freeze/toolchain/bin/node'
assert subprocess.check_output([str(node), '--version']).decode().strip() == 'v24.7.0'
assert read(D / 'source-freeze/toolchain/npm/package.json')['version'] == '11.5.1'

save('construction-execution-grant.json', {
    'activation': 'T287_RC1_SUCCESSOR_CONSTRUCTION_03', 'actor': '/root/rc1_successor_builder', 'role': 'Worker',
    'request': str(P / 'request.txt'), 'requestSHA256': sha(P / 'request.txt'),
    'effectTerritory': 'new final-prefixed paths only plus this actual grant; closed preparation unchanged',
    'runtimeModelProviderNetworkGitEffects': False, 'physicalCandidateQualificationPublication': False})
rows, copies = [], []
for relative, (origin, selection, row) in sorted(selected.items()):
    frozen = copy(origin, F / relative, row['sha256'])
    stage = copy(origin, S / relative, row['sha256'])
    baseline = by.get(relative)
    body = origin.read_bytes()
    rows.append({'path': relative, 'bytes': len(body), 'sha256': sha(origin), 'selection': selection,
                 'originalSource': str(origin), 'C02Preimage': baseline,
                 'acceptedCarrierChain': row if selection == 'accepted_carrier_source_postimage' else None,
                 'sourceAuthor': '/root/f11_carrier_design_worker' if selection.startswith('accepted_') else ('Executive_bound_existing_authorship' if selection.startswith('Executive') else 'inherited_C02_source_origin'),
                 'copyBuildAuthor': '/root/rc1_successor_builder',
                 'gitBlobOfSelectedBody': hashlib.sha1(b'blob ' + str(len(body)).encode() + b'\0' + body).hexdigest(),
                 'changedFromC02': baseline is None or baseline['sha256'] != sha(origin)})
    copies += [frozen, stage]
law_copies = [copy(REL / 'manifest.json', D / 'final-law/manifest.json')]
law_copies += [copy(REL / 'standards' / r['path'], D / 'final-law/standards' / r['path'], r['sha256']) for r in standard['members']]
seed_copies = []
for path in read(D / 'future-execution-order.json')['schemaSeedRoutes']:
    p = Path(path); rel = p.relative_to(C / 'source-freeze/generated-preimages')
    expected = next(r for r in read(C / 'generated-after.json') if r['path'] == str(rel))
    seed_copies.append(copy(p, S / TR / rel, expected['sha256']))
for row in deps:
    lock = read(F / TR / 'package-lock.json')['packages'][row['locator']]
    assert lock['integrity'] == row['integrity']
    original = D / row['preparedArchive']['path']
    alg, encoded = row['integrity'].split('-', 1)
    assert base64.b64encode(hashlib.new(alg, original.read_bytes()).digest()).decode() == encoded
    rel = Path(row['preparedCacheContent']['path']).relative_to('npm-cache')
    copies.append(copy(original, D / 'final-npm-cache' / rel, row['sha256']))
for n in ['final-artifacts', 'final-install', 'final-tmp', 'final-npm-prefix']:
    (D / n).mkdir()
for n in ['final-npmrc', 'final-globalnpmrc']:
    (D / n).write_text('')
save('final-preserved-preparation.json', preserved)
save('final-source-members.json', rows)
save('final-source-copy-correspondence.json', copies)
save('final-law-verification.json', {'releaseRef': basis['uri'], 'manifestSHA256': sha(REL / 'manifest.json'),
     'memberSetSHA256': hashlib.sha256(member_set).hexdigest(), 'memberCount': len(standard['members']),
     'members': law_copies, 'DefinitionSHA256': sha(F / 'stdo_abiogenesis.json'),
     'defaultLibrarySubstrate': 'unchanged selected RC1 asset; no runtime repin'})
save('final-schema-seeds.json', seed_copies)
base_freeze = read(C / 'source-freeze-manifest.json')
save('final-source-freeze-manifest.json', {'status': 'FROZEN_EXACT_INPUT_SELECTION', 'head': base_freeze['head'],
     'committedTree': base_freeze['committedTree'], 'dirtyOverlayIsCommit': False,
     'members': [r for r in copies if r['path'].startswith('final-source/')] + law_copies,
     'authoredMemberCount': len(rows), 'actualChangedFromC02': sum(r['changedFromC02'] for r in rows),
     'C02FreezeSHA256': sha(C / 'freeze.json'), 'acceptedCarrierFreezeSHA256': sha(W / 'freeze.json'),
     'acceptedHOWSHA256': sha(F / how), 'acceptedLawFreezeSHA256': sha(L / 'freeze.json'),
     'authorityPostimagesSHA256': sha(P / 'authority-postimages.json'), 'toolchainPinsSHA256': sha(D / 'toolchain-pins.json'),
     'lawInputRoles': 'All input source selection is frozen; generated qualification authority copies are separately derived stage outputs'})
save('final-budgets.json', {'operationCapsMs': {'dependencies': 240000, 'clean': 60000, 'compile': 600000,
     'authority-stage': 300000, 'manifest': 600000, 'pack': 240000, 'install': 240000, 'verify': 300000,
     'installed-publications': 240000}, 'maximumMs': 2880000, 'terminationGraceMs': 1000,
     'reason': 'One 1106-source tenant and locked16 dependency closure; full qualification schema/catalog output. Conservative phase allowance, finite per-operation only; no native workloads.'})
save('final-preparation-result.json', {'status': 'exact_source_selection_ready', 'elapsedMs': (time.monotonic()-started)*1000,
     'sourceMembers': len(rows), 'changedFromC02': sum(r['changedFromC02'] for r in rows),
     'newSourceMembers': sum(r['C02Preimage'] is None for r in rows), 'frozenSourceSHA256': sha(D / 'final-source-freeze-manifest.json'),
     'toolsReverified': len(tools), 'lockedArchives': len(deps), 'schemaSeeds': len(seed_copies),
     'completeRC2MembersVerified': len(standard['members']), 'preparationAndOriginalCandidatesPreserved': True})
print(json.dumps(read(D / 'final-preparation-result.json')), flush=True)
