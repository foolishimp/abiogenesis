from pathlib import Path
import base64
import hashlib
import json
import os
import shutil
import stat
import time

D = Path(__file__).resolve().parent
G = D.parent
B = G.parents[3]
C = G / 'final-candidate-construction-02'
Q = G / 'final-qualification-inputs-02'
L = G / 'f11-law-stage-repair-01'
F = D / 'source-freeze'
S = D / 'staged-repo'
T = Path('build_tenants/abiogenesis/typescript')
started = time.monotonic()

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def save(name, value):
    with (D / name).open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')

def copy(p, q, expected=None):
    assert p.is_file() and not p.is_symlink(), str(p)
    digest = sha(p)
    if expected is not None:
        assert digest == expected, str(p)
    q.parent.mkdir(parents=True, exist_ok=True)
    assert not q.exists() and not q.is_symlink(), str(q)
    shutil.copy2(p, q)
    assert sha(q) == digest and p.stat().st_ino != q.stat().st_ino, str(q)
    return {'path': str(q.relative_to(D)), 'bytes': q.stat().st_size,
            'sha256': digest, 'mode': stat.S_IMODE(q.stat().st_mode),
            'origin': str(p), 'kind': 'file'}

assert not (D / 'preparation-result.json').exists(), 'one preparation only'
assert sha(B / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/rc1-successor-preparation-controls-03/request.txt') == '38a8f92936023118d6ec1e39cdfc9791aa87530068965973a6afcb6ab0065b11'
for p, expected in [
    (C / 'freeze.json', '7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469'),
    (Q / 'freeze.json', 'a4c2b5afd94fd7402b6bbfc732e691eb345dbcf4334a0300de490f607b9aad79'),
    (L / 'freeze.json', 'a4bceff9b2b37913667998784fb3be36ddf9986950c4bb5117c891add697c872'),
]:
    assert sha(p) == expected, str(p)
donor_freeze = json.loads((C / 'freeze.json').read_text())
donor_by_path = {row['path']: row for row in donor_freeze['records']}
reused_donor_controls = [
    'source-members.json', 'source-freeze-manifest.json', 'dependency-archives.json',
    'prepare.py', 'execute-once.py', 'correspondence.py',
    'verify-installed.mjs', 'validate-installed-publications.mjs', 'budgets.json',
]
for relative in reused_donor_controls:
    row = donor_by_path[relative]
    original = C / relative
    assert row['kind'] == 'file' and original.is_file() and not original.is_symlink(), relative
    assert original.stat().st_size == row['bytes'] and sha(original) == row['sha256'], relative
assert sha(C / 'source-freeze-manifest.json') == donor_freeze['sourceFreeze']['sha256']
save('baseline-pins.json', {
    'C02FreezeSHA256': sha(C / 'freeze.json'),
    'Q02FreezeSHA256': sha(Q / 'freeze.json'),
    'acceptedLawFreezeSHA256': sha(L / 'freeze.json'),
    'C02ReusedControls': [donor_by_path[relative] for relative in reused_donor_controls],
    'meaning': 'Exact immutable donor references; C02/Q02 remain RC1 and are not relabeled as this successor',
})

authority_pending = [
    '.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md',
    'build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md',
    'build_tenants/abiogenesis/typescript/design/T287_REGISTERED_GRAPH_SELECTION_DESIGN.md',
    'specification/GOALS.md', 'specification/PRODUCT.md',
    'specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md',
    'specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md',
    'specification/requirements/abg/REQ-R-ABG3-PROJECTION.md',
    'specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md',
    'specification/requirements/gtl/REQ-L-GTL3-SELECTION-BOUNDARY.md',
    'specification/requirements/product/REQ-P-QUAL.md',
    'specification/requirements/product/REQ-P-SCENARIOS.md', 'stdo_abiogenesis.json',
]
law_pending = {
    str(T / 'scripts/generate-qualification-rule-catalog.mjs'): '0c896ab3132b2d934e9a1593cf6a54d4cc5bb58542b86d1a49ab697ce5c4a435',
    str(T / 'test_env/tests/t287-qualification-law.test.mjs'): 'ae8ee02debaed07e899d43a8c07382287b73e90c766f71aefd2c60414e438fa6',
}
omitted = set(authority_pending) | set(law_pending)
baseline = json.loads((C / 'source-members.json').read_text())
assert len(baseline) == 1103 and len({r['path'] for r in baseline}) == 1103
assert omitted <= {r['path'] for r in baseline} and len(omitted) == 15
by_path = {r['path']: r for r in baseline}
copied_sources = []
pending = []
for row in baseline:
    relative = row['path']
    assert not Path(relative).is_absolute() and '..' not in Path(relative).parts
    original = C / 'source-freeze/repo' / relative
    assert original.stat().st_size == row['bytes'] and sha(original) == row['sha256'], relative
    if relative in omitted:
        continue
    frozen = copy(original, F / 'repo' / relative, row['sha256'])
    staged = copy(original, S / relative, row['sha256'])
    copied_sources.append({
        **row, 'frozenCopy': frozen, 'stagedCopy': staged,
        'selection': 'C02 baseline unchanged at preparation; later accepted carrier delta may explicitly replace affected members',
        'semanticAuthorship': 'Inherited C02 source origin and author evidence unchanged; preparation copying does not assign semantic authorship',
        'copyAuthor': '/root/rc1_successor_preflight',
    })
assert len(copied_sources) == 1088
for relative in authority_pending:
    row = by_path[relative]
    pending.append({'path': relative, 'class': 'authorized_current_authority_tracking_method',
                    'C02PreimageSHA256': row['sha256'], 'postimageSHA256': None,
                    'status': 'pending_exact_Executive_source_cut_binding; no current bytes copied',
                    'sourceRoute': 'repo://abiogenesis/' + relative})
law = json.loads((L / 'freeze.json').read_text())
for relative, expected in law_pending.items():
    row = next(r for r in law['sourcePostimages'] if r['path'] == relative)
    assert row['sha256'] == expected
    snapshot = copy(L / row['snapshot'], D / 'pending-postimages' / relative, expected)
    pending.append({'path': relative, 'class': 'independently_accepted_law_delta',
                    'C02PreimageSHA256': by_path[relative]['sha256'], 'postimageSHA256': expected,
                    'acceptedLawFreezeSHA256': sha(L / 'freeze.json'),
                    'heldPostimage': snapshot,
                    'semanticSourceAuthor': '/root/f11_binding_plan',
                    'copyAuthor': '/root/rc1_successor_preflight',
                    'additionalCarrierDeltaPossible': True,
                    'status': 'verified_held_postimage; final source selection must conjoin any later accepted carrier postimage chain'})
pending.append({'path': str(T / 'design/T287_F11_CARRIER_RESOURCE_DESIGN.md'),
                'class': 'new_carrier_HOW',
                'postimageSHA256': '744a930be51c7130480b22126acfbc6ec42c2c4fca07fcd762b76757e66d6d9b',
                'RootReportedReviewFreezeSHA256': '8f684ef4564c2cf679d642ad7096edbe217f3c8ebd914100257e3acae6b7ccc3',
                'status': 'Executive reports independent acceptance; exact final source binding pending; not read or copied'})
pending.append({'class': 'carrier_implementation_delta', 'paths': None,
                'status': 'pending_CLOSED_independently_accepted_implementation_cut; no moving sources read or copied'})
save('source-preparation.json', {'status': 'INCOMPLETE_SOURCE_SELECTION', 'C02SourceMembers': 1103,
     'preparedUnchangedMembers': len(copied_sources), 'heldKnownPendingMembers': 15,
     'members': copied_sources, 'authorityCopies': 'Retained C02 RC1 qualification input/source copies are preimages only; later explicit RC2 staging must produce final selected authority joins',
     'generatedOutputsCopied': 0, 'completeCandidateFreeze': False})
save('pending-postimage-selection.json', {'status': 'PENDING_EXECUTIVE_BINDING', 'entries': pending,
     'ambientResnapshot': False, 'carrierFreeze': False,
     'futureRequired': 'Bind exact current authority/tracking postimages, accepted HOW and accepted carrier delta; then derive new authority and generated populations. Preserve original C02/Q02 identities.'})

tool_manifest = json.loads((C / 'source-freeze-manifest.json').read_text())
tool_records = []
for row in tool_manifest['members']:
    if not row['path'].startswith('toolchain/'):
        continue
    original = C / 'source-freeze' / row['path']
    target = F / row['path']
    if row['kind'] == 'symlink':
        assert original.is_symlink() and str(original.readlink()) == row['target']
        assert original.resolve().is_relative_to((C / 'source-freeze/toolchain').resolve())
        target.parent.mkdir(parents=True, exist_ok=True)
        assert not target.exists() and not target.is_symlink()
        target.symlink_to(row['target'])
        tool_records.append({**row, 'origin': str(original), 'path': str(target.relative_to(D))})
    else:
        assert original.stat().st_size == row['bytes'] and stat.S_IMODE(original.stat().st_mode) == row['mode']
        tool_records.append(copy(original, target, row['sha256']))
for row in tool_records:
    if row['kind'] == 'symlink':
        p = D / row['path']
        assert p.resolve().is_relative_to((F / 'toolchain').resolve()) and p.resolve().is_file()
assert len(tool_records) == 2328
assert json.loads((F / 'toolchain/npm/package.json').read_text())['version'] == '11.5.1'
save('toolchain-pins.json', {'status': 'EXACT_C02_FROZEN_TOOLS_COPIED', 'records': tool_records,
     'node': 'C02 frozen Node v24.7.0; executable bytes verified, no executable invoked',
     'npm': '11.5.1', 'newNodeModulesRealization': False,
     'hostLibraryObservationRoute': str(C / 'toolchain-host.json'), 'hostLibrariesNotReacquired': True})

locked = json.loads((C / 'source-freeze/repo' / T / 'package-lock.json').read_text())['packages']
dependency_records = []
for row in json.loads((C / 'dependency-archives.json').read_text()):
    original = C / 'source-freeze' / row['frozenPath']
    assert original.stat().st_size == row['bytes'] and sha(original) == row['sha256']
    assert locked[row['locator']]['integrity'] == row['integrity']
    algorithm, encoded = row['integrity'].split('-', 1)
    assert base64.b64encode(hashlib.new(algorithm, original.read_bytes()).digest()).decode() == encoded
    digest_hex = base64.b64decode(encoded).hex()
    archive = copy(original, F / row['frozenPath'], row['sha256'])
    cache_path = D / 'npm-cache/_cacache/content-v2' / algorithm / digest_hex[:2] / digest_hex[2:4] / digest_hex[4:]
    cache = copy(original, cache_path, row['sha256'])
    dependency_records.append({**row, 'preparedArchive': archive, 'preparedCacheContent': cache})
assert len(dependency_records) == 16
assert next(r for r in dependency_records if r['locator'] == 'node_modules/typescript')['version'] == '5.9.2'
save('dependency-pins.json', {'status': 'LOCKED_ARCHIVE_BYTES_PREPARED', 'members': dependency_records,
     'dependencyInstallation': False, 'cacheOperation': 'Direct confined copies of verified content-addressed archive bytes only; npm was not invoked'})

donor_records = []
guard_py = "from pathlib import Path as _PreparationPath\nif not (_PreparationPath(__file__).resolve().parent / 'construction-execution-grant.json').is_file():\n    raise RuntimeError('C03 preparation only; exact Executive construction extension is absent')\n"
guard_js = "import preparationFs from 'node:fs';\nimport preparationPath from 'node:path';\nif (!preparationFs.existsSync(preparationPath.join(import.meta.dirname, 'construction-execution-grant.json'))) throw new Error('C03 preparation only; exact Executive construction extension is absent');\n"
for name in ['prepare.py', 'execute-once.py', 'correspondence.py', 'verify-installed.mjs', 'validate-installed-publications.mjs', 'budgets.json']:
    donor = copy(C / name, D / 'donor-controls' / name)
    row = {'donor': donor, 'meaning': 'Closed C02 control origin; never execute in donor territory',
           'originalAuthorRoute': str(C / 'control-attribution.json'), 'newControlAuthor': '/root/rc1_successor_preflight'}
    if name in ['execute-once.py', 'correspondence.py', 'verify-installed.mjs', 'validate-installed-publications.mjs']:
        guard = guard_py if name.endswith('.py') else guard_js
        target = D / name
        with target.open('x') as stream:
            stream.write(guard + (C / name).read_text())
        row['guardedSuccessor'] = {'path': name, 'bytes': target.stat().st_size, 'sha256': sha(target),
             'state': 'prepared_only; final inputs/identity/build branch/budgets await exact construction extension'}
    donor_records.append(row)
save('donor-rebinding.json', {'status': 'GUARDED_PREPARATION_CONTROLS', 'records': donor_records,
     'guardMeaning': 'A local absence stop for this preparation, not runtime authority or an independent approval mechanism',
     'hardcodedDonorRelationsPending': ['C02 prepare.py C01/repair selection replaced by this incomplete baseline preparation',
         'execute-once.py build branch must bind explicit compile -> RC2 authority staging -> final manifest sequence',
         'operation budgets and final source/member hashes/counts await exact construction grant',
         'verify-installed Product/version and unchanged run_gaps definition checks must be conjoined with new verified metadata'],
     'scriptsExecuted': ['prepare.py preparation copies only'], 'futureConstructionScriptsExecuted': []})
save('future-execution-order.json', {'status': 'DECLARED_NOT_AUTHORIZED_OR_EXECUTED',
     'order': ['Bind exact accepted implementation/HOW/current authority postimages and complete source selection',
         'Reverify supplied immutable RC2 manifest/member set and selected source joins',
         'Realize locked dependencies offline with scripts disabled in the new confined stage',
         'Use existing clean and TypeScript compile owners',
         'Explicitly stage selected RC2 authority before final Product manifest generation; preserve frozen input and derived-output roles',
         'Generate final manifest/schema/catalog through existing owners and freeze actual derived populations and identities',
         'Pack without lifecycle scripts; physically install offline with scripts disabled',
         'Verify via installed Product owner and same-process nominal selection; validate current full publication set',
         'Freeze source/archive/stage/install correspondence and return for independent assessment'],
     'schemaSeedRoutes': [str(C / 'source-freeze/generated-preimages/contracts/schemas/product-toolchain-manifest.schema.json'),
         str(C / 'source-freeze/generated-preimages/contracts/schemas/public-contract-catalog.schema.json')],
     'schemaSeedsCopied': False,
     'Q02Recipe': 'Preserve bounded recipe meanings and rebind affected exact input/output joins later; no recipe execution here',
     'runtimeSubstrate': 'Default-library RC1 frame substrate retained; no repin selected',
     'prospectivePackageVersion': '5.0.0-rc.1; publication refs/ordinal remain a later actual owner check'})
save('preparation-result.json', {'status': 'preparation_ready', 'activation': 'T287_RC1_SUCCESSOR_PREPARATION_03',
     'elapsedMs': (time.monotonic() - started) * 1000, 'preparedUnchangedSourceMembers': 1088,
     'pendingKnownSourceMembers': 15, 'heldAcceptedLawPostimages': 2, 'toolchainRecords': 2328,
     'lockedDependencyArchives': 16, 'copiedCacheContents': 16,
     'sourceSelectionComplete': False, 'carrierSourceCutBound': False,
     'compilation': 0, 'authorityStaging': 0, 'generatedWrites': 0, 'dependencyInstallation': 0,
     'pack': 0, 'install': 0, 'nativeCalls': 0, 'providerCalls': 0, 'network': 0, 'Git': 0,
     'candidateReady': False, 'installed': False, 'qualified': False})
print(json.dumps(json.loads((D / 'preparation-result.json').read_text())))
