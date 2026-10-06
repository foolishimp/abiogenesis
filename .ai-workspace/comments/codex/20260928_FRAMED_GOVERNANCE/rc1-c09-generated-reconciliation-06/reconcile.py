from pathlib import Path
import datetime
import hashlib
import json
import os
import stat
import time
import traceback

R = Path('/Users/jim/src/apps/abiogenesis')
G = R / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
CTL = G / 'rc1-c09-generated-census-triage-controls-06'
OUT = G / 'rc1-c09-generated-reconciliation-06'
TENANT = R / 'build_tenants/abiogenesis/typescript'
DONOR = G / 'final-candidate-construction-09/final-stage/build_tenants/abiogenesis/typescript'
started = time.monotonic()
stage = 'grant-pins'
effects = []
failure = None
summary = {}


def require(ok, predicate, detail):
    if not ok:
        raise AssertionError(json.dumps({'predicate': predicate, 'detail': detail}, sort_keys=True))


def pin(path):
    path = Path(path)
    s = path.lstat()
    require(stat.S_ISREG(s.st_mode), 'regular_file_without_symlink', str(path))
    body = path.read_bytes()
    return {'path': str(path), 'exists': True, 'bytes': len(body),
            'sha256': hashlib.sha256(body).hexdigest(), 'mode': stat.S_IMODE(s.st_mode)}


def body_tuple(row):
    return {k: row[k] for k in ('bytes', 'sha256', 'mode')}


def verify_expected(expected):
    p = Path(expected['path'])
    if expected.get('exists') is False:
        require(not os.path.lexists(p), 'selected_addition_actual_absence', str(p))
        return {'path': str(p), 'exists': False}
    actual = pin(p)
    for key in ('bytes', 'sha256', 'mode'):
        require(actual[key] == expected[key], 'exact_pinned_file',
                {'path': str(p), 'field': key, 'expected': expected[key], 'actual': actual[key]})
    return actual


def save(name, value):
    p = OUT / name
    with p.open('x') as f:
        json.dump(value, f, indent=2)
        f.write('\n')
    return pin(p)


def census(root):
    rows = []
    dirs = []
    for name in ('build', 'contracts'):
        base = root / name
        require(base.is_dir() and not base.is_symlink(), 'physical_role_root_directory', str(base))
        for directory, subdirs, files in os.walk(base, followlinks=False):
            dp = Path(directory)
            dirs.append({'relativePath': str(dp.relative_to(root)), 'mode': stat.S_IMODE(dp.lstat().st_mode)})
            for subdir in subdirs:
                q = dp / subdir
                require(stat.S_ISDIR(q.lstat().st_mode), 'no_physical_directory_symlink', str(q))
            for filename in files:
                q = dp / filename
                rows.append({'relativePath': str(q.relative_to(root)), **pin(q)})
    q = root / 'product-toolchain-manifest.json'
    rows.append({'relativePath': str(q.relative_to(root)), **pin(q)})
    rows.sort(key=lambda x: x['relativePath'])
    dirs.sort(key=lambda x: x['relativePath'])
    require(len({x['relativePath'] for x in rows}) == len(rows), 'unique_physical_members', str(root))
    return {'root': str(root), 'files': len(rows), 'bytes': sum(x['bytes'] for x in rows),
            'directories': len(dirs), 'symlinks': 0, 'rows': rows, 'directoryRows': dirs}


try:
    controls = {
        'request': verify_expected({'path': str(CTL / 'worker-request.txt'), 'bytes': 4215,
                                   'sha256': '2e1f43d289f7740527e6f5367567d2dddb7f87e4232ca2492dd62d97bb67ddbe', 'mode': 420}),
        'triage': verify_expected({'path': str(CTL / 'triage.md'), 'bytes': 1537,
                                  'sha256': 'fe207943c1418e9c67dde38c53d1aff6a74b0c66a715b3667fe801e0b6bf5858', 'mode': 420}),
        'subject': verify_expected({'path': str(CTL / 'subject-pins.json'), 'bytes': 9182,
                                   'sha256': 'db610673b9a60a0c1def14e9ea63aa10a60e9c9c9401026f8c384fd09110ee6b', 'mode': 420})
    }
    subjects = json.loads((CTL / 'subject-pins.json').read_text())
    for key in ('C09ConstructionAcceptance', 'generatedRoster', 'actualC09Delta', 'priorPhysicalRoleCensus', 'Runtime11Closed'):
        controls[key] = verify_expected(subjects[key])
    save('input-pins.json', controls)
    selected = subjects['selectedCopies']
    roster = json.loads(Path(subjects['generatedRoster']['path']).read_text())
    delta = json.loads(Path(subjects['actualC09Delta']['path']).read_text())
    prior = json.loads(Path(subjects['priorPhysicalRoleCensus']['path']).read_text())
    generated = {r['path']: r for r in roster}
    selected_paths = {s['relativePath'] for s in selected}
    additions = {s['relativePath'] for s in selected if not s['canonicalPreimage']['exists']}
    old_generated = set(prior['declaredGeneratedRoster'])
    mirror_rel = str(Path(subjects['protectedMirror']['path']).relative_to(TENANT))
    require(len(selected) == len(selected_paths) == 9 and len(additions) == 2, 'selected_7_replacements_2_additions', {'selected': len(selected), 'additions': len(additions)})
    require(len(generated) == len(roster) == 928, 'complete_C09_generated_roster928', len(generated))
    require(set(generated) - additions == old_generated and len(old_generated) == 926,
            'prior926_to_current928_role_join', {'missing': sorted(old_generated - set(generated)), 'extra': sorted(set(generated) - additions - old_generated)})
    require(set(prior['physicalUnionRoster']) == old_generated | {mirror_rel}, 'prior_physical926_plus_exact_mirror', prior['physicalUnionMembers'])
    require({r['path'] for r in delta} == selected_paths and len(delta) == 9, 'selected_paths_exact_C09_delta', sorted(r['path'] for r in delta))
    require(all(generated[r['path']]['sha256'] == r['currentGeneratedSHA256'] and generated[r['path']]['bytes'] == r['currentBytes'] for r in delta), 'C09_delta_to_current_roster', delta)
    cached_donors = {}
    cached_preimages = {}
    selected_verified = []
    stage = 'selected-preimages-donors'
    for s in selected:
        relative = s['relativePath']
        require(Path(s['canonicalPreimage']['path']) == TENANT / relative and Path(s['acceptedC09Donor']['path']) == DONOR / relative,
                'selected_absolute_source_destination', s)
        before = verify_expected(s['canonicalPreimage'])
        accepted = verify_expected(s['acceptedC09Donor'])
        require(accepted['sha256'] == generated[relative]['sha256'] and accepted['bytes'] == generated[relative]['bytes'], 'selected_donor_roster_join', relative)
        cached_donors[relative] = Path(accepted['path']).read_bytes()
        if before['exists']:
            cached_preimages[relative] = Path(before['path']).read_bytes()
        selected_verified.append({'relativePath': relative, 'before': before, 'acceptedC09Donor': accepted})
    mirror_before = verify_expected(subjects['protectedMirror'])
    stage = 'complete-before-census'
    before = census(TENANT)
    accepted = census(DONOR)
    save('canonical-before.json', before)
    save('accepted-C09-census.json', accepted)
    bm = {r['relativePath']: r for r in before['rows']}
    dm = {r['relativePath']: r for r in accepted['rows']}
    require(set(bm) == old_generated | {mirror_rel}, 'exact_before_physical_union927', {'actual': len(bm), 'extra': sorted(set(bm) - old_generated - {mirror_rel}), 'missing': sorted((old_generated | {mirror_rel}) - set(bm))})
    require(set(dm) == set(generated) | {mirror_rel}, 'exact_C09_physical_union929', {'actual': len(dm), 'extra': sorted(set(dm) - set(generated) - {mirror_rel}), 'missing': sorted((set(generated) | {mirror_rel}) - set(dm))})
    require(body_tuple(dm[mirror_rel]) == body_tuple(mirror_before), 'accepted_and_canonical_protected_mirror', mirror_rel)
    for relative, r in generated.items():
        require(dm[relative]['bytes'] == r['bytes'] and dm[relative]['sha256'] == r['sha256'], 'complete_928_donor_roster_body_join', relative)
    nonselected = set(generated) - selected_paths
    require(len(nonselected) == 919, 'nonselected_generated919', len(nonselected))
    prior_map = {r['relativePath']: r['canonical'] for r in prior['rows']}
    for relative in nonselected:
        require(body_tuple(bm[relative]) == body_tuple(dm[relative]) == body_tuple(prior_map[relative]), 'nonselected_original_current_C09_body_mode_conservation', relative)
    stage = 'retain-all-preimages-before-copies'
    retained = []
    for s in selected_verified:
        relative = s['relativePath']
        if s['before']['exists']:
            target = OUT / 'preimages' / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open('xb') as f:
                f.write(cached_preimages[relative])
            target.chmod(s['before']['mode'])
            actual = pin(target)
            require(body_tuple(actual) == body_tuple(s['before']), 'retained_preimage_body_mode', relative)
            retained.append({'relativePath': relative, 'original': s['before'], 'retained': actual})
    require(len(retained) == 7, 'all_seven_preimages_retained_before_first_copy', len(retained))
    save('preimage-receipt.json', {'retainedBeforeAnyCanonicalWrite': True, 'rows': retained, 'actualAbsences': sorted(additions)})
    save('preflight.json', {'status': 'GO_COPY_ONLY', 'selected': selected_verified, 'beforePhysical': 927,
                           'currentGenerated': 928, 'C09Physical': 929, 'nonselectedConserved': 919,
                           'protectedMirror': mirror_before, 'allCanonicalPreconditionsPassed': True})
    stage = 'exact-nine-copies'
    for s in selected_verified:
        relative = s['relativePath']
        verify_expected(s['before'])
        verify_expected(s['acceptedC09Donor'])
        target = TENANT / relative
        with target.open('wb' if s['before']['exists'] else 'xb') as f:
            f.write(cached_donors[relative])
        effects.append({'relativePath': relative, 'kind': 'replacement' if s['before']['exists'] else 'addition'})
        target.chmod(s['acceptedC09Donor']['mode'])
        actual = pin(target)
        require(body_tuple(actual) == body_tuple(s['acceptedC09Donor']), 'selected_postimage_exact_donor', relative)
    stage = 'complete-after-correspondence'
    after = census(TENANT)
    save('canonical-after.json', after)
    am = {r['relativePath']: r for r in after['rows']}
    require(set(am) == set(generated) | {mirror_rel}, 'exact_after_physical_union929', {'actual': len(am), 'extra': sorted(set(am) - set(generated) - {mirror_rel}), 'missing': sorted((set(generated) | {mirror_rel}) - set(am))})
    rows = []
    for relative, r in generated.items():
        require(body_tuple(am[relative]) == body_tuple(dm[relative]) and am[relative]['bytes'] == r['bytes'] and am[relative]['sha256'] == r['sha256'], 'full_928_canonical_C09_body_mode_join', relative)
        rows.append({'relativePath': relative, 'canonical': am[relative], 'acceptedC09': dm[relative], 'selected': relative in selected_paths})
    for relative in nonselected:
        require(body_tuple(am[relative]) == body_tuple(bm[relative]), 'all_919_nonselected_body_mode_unchanged', relative)
    require(body_tuple(am[mirror_rel]) == body_tuple(mirror_before), 'protected_mirror_unchanged', mirror_rel)
    require(before['directoryRows'] == after['directoryRows'], 'physical_directories_unchanged', {'before': before['directories'], 'after': after['directories']})
    save('full928-correspondence.json', {'status': 'exact', 'generatedMembers': 928, 'physicalUnionMembers': 929,
                                       'nonselectedConserved': 919, 'protectedMirror': am[mirror_rel], 'rows': rows})
    summary = {'verdict': 'GO_CANONICAL_C09_GENERATED_CORRESPONDENCE_ONLY', 'selectedCopies': 9,
               'replacements': 7, 'additions': 2, 'retainedPreimages': 7, 'retainedPreimageBytes': sum(len(x) for x in cached_preimages.values()),
               'copiedBytes': sum(len(x) for x in cached_donors.values()), 'generatedMembers': 928,
               'physicalBefore': 927, 'physicalAfter': 929, 'nonselectedConserved': 919,
               'canonicalAfterBytes': after['bytes'], 'canonicalDirectories': after['directories'],
               'canonicalSymlinks': 0, 'protectedMirror': am[mirror_rel]}
except Exception as exc:
    failure = {'stage': stage, 'exception': type(exc).__name__, 'detail': str(exc), 'traceback': traceback.format_exc()}
    save('first-failure.json', failure)
    summary = {'verdict': 'NO_GO', 'firstFailure': failure, 'completedCanonicalCopies': effects}

save('effects.json', {'onlyCanonicalEffects': effects, 'otherSourceCandidateInstalledProofRuntimeGitEffects': 0})
save('closure.json', {'status': 'CLOSED', 'role': 'Worker', 'operation': 'T287_C09_GENERATED_RECONCILIATION_06',
                     'closedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                     'elapsedSeconds': time.monotonic() - started, 'workResult': summary,
                     'noAutomaticRepairOrRetry': True, 'writes': 'STOPPED_AFTER_FREEZE',
                     'qualificationCredit': False, 'RuntimeSemanticF11ReleaseCredit': False})
report_rows = []
directory_rows = []
for directory, subdirs, files in os.walk(OUT, followlinks=False):
    dp = Path(directory)
    directory_rows.append({'relativePath': str(dp.relative_to(OUT)), 'mode': stat.S_IMODE(dp.lstat().st_mode)})
    for filename in sorted(files):
        q = dp / filename
        report_rows.append({'relativePath': str(q.relative_to(OUT)), **pin(q)})
report_rows.sort(key=lambda x: x['relativePath'])
directory_rows.sort(key=lambda x: x['relativePath'])
save('freeze.json', {'status': 'CLOSED', 'operation': 'T287_C09_GENERATED_RECONCILIATION_06',
                     'root': str(OUT), 'workResult': summary['verdict'], 'records': len(report_rows),
                     'bytes': sum(r['bytes'] for r in report_rows), 'rows': report_rows,
                     'directories': len(directory_rows), 'directoryRows': directory_rows, 'symlinks': 0,
                     'freezeExcludedFromOwnRows': True})
(OUT / 'freeze.json').chmod(0o444)
print(json.dumps({'status': 'CLOSED', 'result': summary, 'freeze': pin(OUT / 'freeze.json')}, indent=2))
if failure:
    raise SystemExit(1)
