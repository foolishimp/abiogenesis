# Evidence-only closure after COMBINED-FINAL-STRUCTURE-02. No owner workload.
from pathlib import Path
import datetime, json, os, time, traceback
from common import ROOT, WORK, TENANT, digest, inventory, row, verify, write

def read(name):
    return json.loads((WORK / name).read_text())

def record(name):
    return row(WORK / name, (WORK / name).relative_to(ROOT))

def absolute_record(path):
    return row(path, path)

def exact_rows(base, rows):
    for expected in rows:
        actual = verify(base / expected['path'], expected)
        if 'kind' in expected:
            assert actual['kind'] == expected['kind'], expected['path']

def exact_tree(base, rows):
    actual = inventory(base)
    wanted = [{k: v for k, v in item.items() if k in ['path', 'kind', 'mode', 'bytes', 'sha256', 'target']} for item in rows]
    assert actual == sorted(wanted, key=lambda item: Path(item['path'])), str(base)
    return len(actual)

def runner_rows(rows):
    return [{**{k: v for k, v in item.items() if k in ['path', 'mode', 'bytes', 'sha256', 'target']},
             'type': item.get('kind', 'file')} for item in rows]

started = time.monotonic()
label = 'finalize-structure-successor-02'
assert digest(WORK / 'first-cause.json') == 'a054de724d00abbdf8f1efe9438a6da9d342c55bde02cb8d858510e5856b08c9'
assert not (WORK / 'first-cause-structure-successor-02.json').exists()
assert not (WORK / 'first-cause-closure-02.json').exists()
assert not (WORK / 'freeze.json').exists()
write(f'commands/{label}.request.json', {
    'label': label, 'grant': 'COMBINED-FINAL-STRUCTURE-02',
    'argv': ['python3', '-B', str(WORK / 'finalize-structure-successor-02.py')], 'cwd': str(ROOT),
    'scriptSha256': digest(WORK / 'finalize-structure-successor-02.py'),
    'prebuildFreezeSha256': digest(WORK / 'prebuild-freeze.json'),
    'structuralSuccessorRequest': record('commands/structure-successor-02.request.json'),
    'structuralSuccessorResult': record('commands/structure-successor-02.result.json'),
    'startedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'scope': 'Existing receipt and exact preservation comparisons; new support/runner/candidate/report/freeze records only',
})
try:
    receipts = {}
    for command_label in ['tsc', 'generate', 'material', 'pack', 'payload', 'structure', 'structure-successor-02']:
        request, receipt = read(f'commands/{command_label}.request.json'), read(f'commands/{command_label}.result.json')
        expected_exit = 1 if command_label == 'structure' else 0
        assert receipt['exitCode'] == expected_exit, command_label
        assert request['prebuild_freeze_sha256'] == digest(WORK / 'prebuild-freeze.json'), command_label
        for stream in ['stdout', 'stderr']:
            stream_path = WORK / f'commands/{command_label}.{stream}'
            assert stream_path.stat().st_size == receipt[stream]['bytes'], command_label
            assert digest(stream_path) == receipt[stream]['sha256'], command_label
        if 'verification_script_sha256' in request:
            assert digest(Path(request['argv'][1])) == request['verification_script_sha256'], command_label
        receipts[command_label] = {'request': record(f'commands/{command_label}.request.json'),
            'result': record(f'commands/{command_label}.result.json'), 'argv': request['argv'], 'cwd': request['cwd'],
            'exitCode': expected_exit, 'executions': 1, 'wallMs': receipt['wallMs'],
            'credit': 'historical failed assertion, no successful proof credit' if expected_exit else 'one scoped successful execution'}
    for command_label, script in [('generation-correspondence', 'verify-generation.py'), ('archive-correspondence', 'verify-archive.py')]:
        request, receipt = read(f'commands/{command_label}.request.json'), read(f'commands/{command_label}.result.json')
        assert receipt['exitCode'] == 0
        assert request['scriptSha256'] == digest(WORK / script)
        receipts[command_label] = {'request': record(f'commands/{command_label}.request.json'),
            'result': record(f'commands/{command_label}.result.json'), 'script': record(script),
            'exitCode': 0, 'executions': 1, 'wallMs': receipt['wallMs'], 'reexecutedDuringSuccessor': False}
    successor_request = read('commands/structure-successor-02.request.json')
    assert successor_request['grant'] == 'COMBINED-FINAL-STRUCTURE-02'
    assert successor_request['HOW_sha256'] == digest(WORK / 'HOW-structure-successor-02.md')
    assert successor_request['reentry_sha256'] == digest(WORK / 'structure-reentry.json')
    assert successor_request['runner_sha256'] == digest(WORK / 'run-structure-successor-02.py')
    exact_rows(ROOT, read('prebuild-freeze.json')['files'])
    exact_rows(ROOT, read('stopped-records-structure-02.json')['files'])
    reentry = read('structure-reentry.json')
    for key in ['HOW', 'historicalFirstCause', 'historicalVerifier', 'historicalRunner', 'historicalRequest',
                'historicalResult', 'stoppedRecords', 'frozenC0Diff', 'c0Freeze']:
        verify(ROOT / reentry[key]['path'], reentry[key])

    source_rows = read('source-union-manifest.json')['files']
    source_count = exact_tree(WORK / 'source', source_rows)
    stage_count = exact_tree(WORK / 'stage', read('stage-post-generation-inventory.json')['files'])
    dependencies = read('dependency-inventory.json')
    dep_target = WORK / 'stage' / TENANT / 'node_modules'
    dep_count = exact_tree(dep_target, dependencies['files'])
    exact_tree(Path(dependencies['source']), dependencies['files'])
    for expected in dependencies['files']:
        target, original = dep_target / expected['path'], Path(dependencies['source']) / expected['path']
        assert not os.path.samefile(target, original), str(target)
        if target.is_symlink():
            assert target.resolve().is_relative_to(dep_target.resolve()), str(target)
    main_generated = read('protected-main-generated.json')['files']
    main_inputs = read('protected-main-inputs.json')['files']
    exact_rows(ROOT, main_generated)
    exact_rows(ROOT, main_inputs)
    assert (source_count, stage_count, dep_count, len(main_generated), len(main_inputs)) == (1319, 6641, 4576, 936, 1319)
    print(json.dumps({'phase': 'source_stage_dependencies_main_preserved', 'source': source_count,
        'stage': stage_count, 'dependencies': dep_count, 'mainGenerated': len(main_generated), 'mainInputs': len(main_inputs)}), flush=True)

    prior = read('protected-prior-trees.json')
    prior_roots = []
    for prior_root in prior['roots']:
        selected = [r for r in prior['files'] if r['path'].startswith(prior_root + '/')]
        expected = [{**r, 'path': str(Path(r['path']).relative_to(prior_root))} for r in selected]
        count = exact_tree(ROOT / prior_root, expected)
        prior_roots.append({'path': prior_root, 'entries': count, 'exactFileSetBytesModesTargetsUnchanged': True})
    prior_count = sum(r['entries'] for r in prior_roots)
    assert (len(prior_roots), prior_count) == (30, 109303)
    assert not any('/l4-final-candidate-02' in r['path'] or '/final-review-dispositions-01' in r['path'] or
                   '/e04-retained-owner-execution-01' in r['path'] or '/closed-evidence-portability-01' in r['path']
                   for r in prior_roots)
    print(json.dumps({'phase': 'all_bound_closed_roots_preserved', 'roots': len(prior_roots), 'entries': prior_count}), flush=True)

    package, archive = read('package-source-correspondence.json'), read('archive-members.json')
    verify(ROOT / archive['archive']['path'], archive['archive'])
    assert archive['archive']['sha256'] == reentry['archiveSha256'] == '151ad625652dc426d46a210559afde50f40b93acdf216b5ca9d64969e5eb8e54'
    payload, metadata = read('archive-payload-owner-result.json'), read('metadata-correspondence.json')
    structure = read('structural-correspondence-successor-02.json')
    assert payload['status'] == structure['status'] == 'satisfied'
    assert structure['archiveSha256'] == archive['archive']['sha256']
    assert len(structure['pureRetiredBodies']) == 7
    assert len(structure['c0']['exactC0Delta']) == 4
    assert structure['c0']['completeConePinnedToSameArchive'] is True
    correspondence = read('source-generated-correspondence.json')
    derived = {r['after']['path']: r['after'] for r in correspondence['derived_source_successors']}
    assert set(derived) == {str(TENANT / 'contracts/capabilities/capability-definition-graph.json'),
                            str(TENANT / 'contracts/worksite/command-execution-context.inventory.json')}
    for expected in source_rows:
        verify(WORK / 'stage' / expected['path'], derived.get(expected['path'], expected))
    toolchain = read('toolchain.json')
    verify(Path(toolchain['node_executable']['path']), toolchain['node_executable'])
    assert digest(Path(toolchain['npm_realpath'])) == toolchain['npm_entrypoint_bytes_sha256']
    verify(WORK / 'stage' / toolchain['package_lock']['path'], toolchain['package_lock'])
    emitted = read('emitted-correspondence.json')
    assert (emitted['codeEntries'], emitted['unchangedCodeEntries'], len(emitted['changedCode'])) == (532, 527, 5)
    assert emitted['closedC0EmissionPinsMatch'] and emitted['pureK11E03CommonOwnerEmissionsUnchanged']

    source_by_path = {r['path']: r for r in source_rows}
    members = {r['path']: r for r in archive['files']}
    support, support_tenant_rows = [], []
    for item in inventory(WORK / 'stage' / TENANT / 'test_env'):
        tenant_path = 'test_env/' + item['path']
        source_path = str(TENANT / tenant_path)
        expected = source_by_path[source_path]
        verify(WORK / 'stage' / source_path, expected)
        assert tenant_path not in members
        support.append({**item, 'path': str((WORK / 'stage' / source_path).relative_to(ROOT)),
            'tenantPath': tenant_path, 'sourceOwner': expected['owner']})
        support_tenant_rows.append({**item, 'path': tenant_path})
    write('support-manifest.json', {
        'kind': 'complete_exact_staged_proof_support_for_later_L4', 'stageRoot': str(WORK / 'stage' / TENANT),
        'files': support, 'selectedOwnedSupport': [r['tenantPath'] for r in support if r['sourceOwner'] != 'immutable-baseline'],
        'allSupportExcludedFromArchive': True, 'testsExecutedInThisActivation': 0,
        'limits': 'Exact staged input inventory only. Later L4 activation owns configuration, fresh resources, execution and results.',
    })

    runner_specs = [
        ('source', WORK / 'source', source_rows),
        ('emitted', WORK / 'stage', read('generated-inventory.json')['files']),
        ('dependencies', dep_target, dependencies['files']),
        ('support', WORK / 'stage' / TENANT, support_tenant_rows),
    ]
    runner_inventories = []
    for role, inventory_root, rows in runner_specs:
        filename = f'runner-{role}-inventory.json'
        projected = runner_rows(rows)
        assert len(projected) == len(rows)
        write(filename, {'kind': 'finite_installed_runner_inventory_projection', 'role': role,
            'root': str(inventory_root), 'files': projected,
            'projection': 'Exact existing rows, with kind translated to runner-owned type; no byte identity or path normalization'})
        runner_inventories.append({**absolute_record(WORK / filename), 'role': role, 'root': str(inventory_root)})
    write('runner-package-inventory.json', {'kind': 'actual_archive_member_inventory_projection',
        'archiveSha256': archive['archive']['sha256'], 'files': runner_rows(archive['files']),
        'projection': 'Existing verified archive member records; archive verification was not rerun'})
    historical_helper = 'test_env/support/native-registered-selection.mjs'
    runner_support = [r for r in runner_rows(support_tenant_rows) if r['path'] != historical_helper]
    excluded = [r for r in support_tenant_rows if r['path'] == historical_helper]
    assert len(excluded) == 1
    assert any(r['path'] == 'test_env/uat/public-setup.mjs' for r in runner_support)
    assert all('native-registered-selection.mjs' not in r['path'] for r in runner_support)
    write('runner-support-manifest.json', {'kind': 'selected_installed_runner_support_projection', 'files': runner_support,
        'completeSupportInventory': absolute_record(WORK / 'runner-support-inventory.json'),
        'excludedHistoricalCompanionHelper': excluded,
        'reason': 'Existing run-installed.mjs preflight excludes this historical companion helper; bytes remain preserved in complete stage/support inventory',
        'testsExecuted': 0})
    manifest_path = WORK / 'stage' / TENANT / 'product-toolchain-manifest.json'
    runner_subject = {'id': 'candidate', 'stageTenant': str(WORK / 'stage' / TENANT),
        'archive': absolute_record(ROOT / archive['archive']['path']), 'manifest': absolute_record(manifest_path),
        'productContentDigest': payload['actualProductContentDigest'],
        'packageInventory': absolute_record(WORK / 'runner-package-inventory.json'),
        'inventories': runner_inventories, 'supportManifest': absolute_record(WORK / 'runner-support-manifest.json')}
    write('runner-inputs.json', {'kind': 't287_installed_proof_subject_inputs', 'status': 'prepared_not_activated',
        'subject': runner_subject,
        'toolchains': {'node': {**absolute_record(Path(toolchain['node_executable']['path'])), 'version': toolchain['node']},
                      'npm': {**absolute_record(Path(toolchain['npm_realpath'])), 'version': toolchain['npm']}},
        'consumer': absolute_record(ROOT / '.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/proof/run-installed.mjs'),
        'finalFreezeBinding': 'Executive must bind the independently supplied final freeze and candidate record in the later configuration',
        'activation': None, 'resourceGrants': None,
        'limits': 'Finite read-only handoff shape for later runner configuration; this file does not authorize any runner lane.'})

    write('preservation.json', {
        'sourceEntriesUnchanged': source_count, 'sourceUnionManifest': record('source-union-manifest.json'),
        'stageEntriesExactlyEqualPostGeneration': stage_count, 'stageInventory': record('stage-post-generation-inventory.json'),
        'independentDependencyEntriesUnchanged': dep_count, 'noSharedDependencyInodes': True,
        'dependencyRelativeLinksConfined': True, 'dependencyInventory': record('dependency-inventory.json'),
        'mainGeneratedEntriesUnchanged': len(main_generated), 'mainInputEntriesUnchanged': len(main_inputs),
        'mainGeneratedCapture': record('protected-main-generated.json'), 'mainInputCapture': record('protected-main-inputs.json'),
        'priorCutEntriesUnchanged': prior_count, 'priorRoots': prior_roots, 'priorCapture': record('protected-prior-trees.json'),
        'activeTerritoryExclusions': read('precedence-ledger.json')['excludedActiveTerritories'],
        'laterConcurrentExclusion': record('concurrent-exclusion-note.json'), 'noCaptureRefresh': True,
        'finalExecutiveClassificationUpdate': record('concurrent-classification-update-02.json'),
        'continuation17': 'No-open/no-mutation territory; no content scan or recursive preservation claim',
        'prebuildInputsUnchanged': True, 'stoppedExistingEvidenceUnchanged': record('stopped-records-structure-02.json'),
        'originalStructuralFailurePreserved': record('first-cause.json'),
        'allOtherSourceInputsUnchanged': True, 'exactAuthorizedDerivedSourcePaths': list(derived),
        'archiveUnchanged': True, 'toolchainUnchanged': True,
        'effectBoundary': 'This Writer wrote only combined-final-02. Prior captured closed roots are unchanged; explicitly active sibling territories were excluded once.',
    })
    candidate = {'kind': 'COMBINED-FINAL-02_closed_build_package_handoff', 'id': 'candidate',
        'status': 'ready_for_separately_granted_L4', 'stageTenant': str(WORK / 'stage' / TENANT),
        'sourceUnion': record('source-union-manifest.json'), 'sourcePrecedence': record('precedence-ledger.json'),
        'prebuildFreeze': record('prebuild-freeze.json'), 'HOW': record('HOW.md'),
        'structuralSuccessorHOW': record('HOW-structure-successor-02.md'), 'structuralReentry': record('structure-reentry.json'),
        'package': record(str(Path('stage') / TENANT / 'package.json')),
        'packageLock': record(str(Path('stage') / TENANT / 'package-lock.json')),
        'manifest': record(str(Path('stage') / TENANT / 'product-toolchain-manifest.json')),
        'archive': archive['archive'], 'archiveMembers': len(archive['files']), 'unpackedBytes': package['unpacked_bytes'],
        'npmIntegrity': archive['npm_integrity'], 'npmShasum': archive['npm_shasum'],
        'productContentDigest': payload['actualProductContentDigest'], 'payloadOwnerResult': record('archive-payload-owner-result.json'),
        'generatedInventory': record('generated-inventory.json'), 'emittedCorrespondence': record('emitted-correspondence.json'),
        'supportManifest': record('support-manifest.json'), 'runnerInputs': record('runner-inputs.json'),
        'metadataCorrespondence': record('metadata-correspondence.json'),
        'structuralCorrespondence': record('structural-correspondence-successor-02.json'), 'preservation': record('preservation.json'),
        'commandReceipts': receipts, 'originalStructuralFailure': record('first-cause.json'),
        'effects': {'compilerExecutions': 1, 'generatorExecutions': 1, 'archivePackExecutions': 1,
            'generatorInternalPackDryRun': 'existing producer path projection only',
            'historicalFailedStructuralExecutions': 1, 'successfulStructuralSuccessorExecutions': 1,
            'testExecutions': 0, 'installedWorkloads': 0, 'nativeWorkloads': 0, 'endpointWorkloads': 0,
            'GitOperations': 0, 'networkInstallations': 0, 'sourceSemanticChangesByThisActivation': 0},
        'newUnexpectedFailure': None,
        'limits': ['No independent acceptance or L5 claim.', 'No installed reachability or combined behavioral proof.',
            'Earlier candidate P1 evidence does not transfer to this archive.',
            'Closed component behavioral evidence remains separately scoped; structural successor is not dynamic law.',
            'Final L4 proof requires separately frozen configuration and fresh resource/effect grants.']}
    write('candidate.json', candidate)
    changed_catalog = sum(not r['unchangedExactly'] for r in metadata['catalogRows'])
    report = f'''# COMBINED-FINAL-02 closed Writer return

Candidate `candidate` is frozen for separately granted L4 installed proof. This handoff establishes exact build/package identity, bounded source/emission/archive linkage and preservation. It does not claim independent acceptance, installed reachability, combined dynamic behavior or L5.

The immutable final-01 source union was composed with exactly six closed replacements: four ABG C0 source files and the existing consumer test from `u1-c0-physical-currentness-successor-02`, and `language-structural-fixture.mjs` from `hog-retained-laws-proof-preparation-01`. All other tenant source bytes remain exact. The new source union contains {source_count} entries: 1213 tenant files and 106 non-tenant context files. The explicitly active T-287 ticket is omitted only from new non-package context and live preservation captures; final-01 remains unchanged. `precedence-ledger.json`, `source-union-manifest.json`, `preimages/` and `inputs/` bind exact owners and superseded cuts. No moving-tree source acquisition or semantic source edit occurred.

The isolated compiler, generator and no-scripts offline pack each ran once and exited zero. Node 24.7.0, npm 11.5.1 and TypeScript 5.9.2 used the independently copied 4576 locked dependency entries. Generation correspondence, material/metadata, archive correspondence and Product payload-owner checks each passed once. None was rerun after the first structural failure. Exact commands, environment, statuses and timings are retained under `commands/` and indexed by `candidate.json`.

Archive `artifacts/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz` is {archive['archive']['bytes']:,} bytes, SHA-256 `{archive['archive']['sha256']}`. Its {len(archive['files']):,} members match exact staged bytes and modes, with zero mode normalizations and {package['unpacked_bytes']:,} unpacked bytes. All test/support files are outside the archive. Product's actual exported `payloadInventoryDigest` computed `{payload['actualProductContentDigest']}` over 5269 archive-derived rows using the owner's sha256-prefixed digest shape. Manifest SHA-256 is `{candidate['manifest']['sha256']}`; package and lock identities are bound in `candidate.json`. The earlier package-correspondence record's pending payload note is discharged by the retained successful payload result, without rewriting that historical record.

Generation produced 940 records. The two declared source-overlapping derived owners are `contracts/capabilities/capability-definition-graph.json` and `contracts/worksite/command-execution-context.inventory.json`; their input and output coordinates are retained. All other staged source inputs are unchanged. Compared with final-01 there are exactly seven changed generated paths: four C0 JavaScript modules, `c_call_outcome.d.ts`, the Product manifest and the capability graph. The context inventory is unchanged from final-01. Of 532 emitted code/declaration records, 527 are exactly unchanged, including all pure, K11, E03 and shared-owner emissions. All five changed code records match the closed C0 stage pins.

The one declaration change replaces an inline reference to the existing `WorksiteFileReplaceRequest` export with an imported type reference to the same module/export; every other declaration byte is equal. Across 75 catalog rows, {75 - changed_catalog} are entirely identical and {changed_catalog} change only the actual declaration inventory coordinate and corresponding owner-derived contract digest. All 16 capability semantic rows are identical and both complete graphs match actual owner reconstruction. All 47 contribution rows are identical except the precisely derived provenance coordinate. Ten GTL publication bindings per subject are reconstructed by actual factories. Public/export locators are unchanged; none is added or removed relative to final-01. No global identity stripping or replacement source coordinate was used. The unchanged C2 renderer member, exact span and context inventory match actual emitted bytes and renderer text.

The original structural verifier exited 1 because its final-01 assertion expected the physical canonical-root predicate inside the native wrapper. The accepted C0 extraction places it in the shared physical collector. First cause `{digest(WORK / 'first-cause.json')}`, original verifier, request, stdout/stderr and result remain immutable. Executive `COMBINED-FINAL-STRUCTURE-02` selected the proof HOW correction, not a source or artifact change. The separate `verify-structure-successor-02.mjs` ran exactly once, exited zero and wrote `structural-correspondence-successor-02.json`. The failed attempt receives no successful proof credit.

The successor retains the selected seven pure-body retirements, common owners, three lifetime consumers, two native unknown-effect consumers, dependency-index assertion and K11 role-source join before either corpus branch. It additionally checks the complete C0 cone: shared collector exact root/path selection without binding partition, native known/unknown scope, C0 authenticated exact path, own-after exclusion, shared full Result/evidence failure authentication and strict pre-event dependencies, EC/gate imports and calls, candidate-only history indexing, and removal/movement of the old local failure join. All four copied historical/current production files reproduce the exact frozen C0 diff, and the selected source and emitted functions/counts join unchanged archive bytes. The retained complete failure-basis owner body is identical to final-01. These are syntax/byte linkage and absence claims, not dynamic law or installed proof.

Preservation passed for all {prior_count:,} entries across all {len(prior_roots)} originally captured closed roots, including final-01 and stopped cuts. All 936 main generated entries and {len(main_inputs)} captured main input files remain exact. The {source_count}-entry source copy, {stage_count}-entry stage and {dep_count} copied dependencies retain exact sets, bytes, modes and relative links, with no shared dependency inodes. Active sibling territories remain excluded under the original classification; the later `l4-final-candidate-02` preparation was never captured as closed. No inventory was refreshed. Continuation-17 remains no-open/no-mutation territory; no new content or recursive preservation claim is made.

`support-manifest.json` contains all {len(support)} staged proof-support files. `runner-inputs.json` supplies candidate id, exact absolute stage/archive/manifest coordinates, package member inventory, source/generated/dependency/support inventories, and selected support manifest in the existing runner's finite input shape. The full support inventory retains the historical native-registered-selection helper; the runner-selected support projection excludes that one file as the existing runner requires. No support bytes were deleted or changed for this projection. No runner lane, resource grant or installed workload is activated by these inputs; Executive binds the final freeze and candidate record in the later configuration.

No tests, installed/native/endpoint workload, network installation, Git operation or reviewer activation ran. Earlier installed evidence belongs to its earlier archive and does not transfer. Actual final-candidate L4 behavior, owner reachability, material sufficiency and durable-install boundaries remain for separately granted proof. Stop editing after this exact freeze.
'''
    with (WORK / 'report.md').open('x') as stream:
        stream.write(report)
    write(f'commands/{label}.result.json', {'label': label, 'exitCode': 0,
        'wallMsBeforeFreeze': (time.monotonic() - started) * 1000,
        'completedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'sourceEntries': source_count, 'stageEntries': stage_count, 'dependencyEntries': dep_count,
        'priorPreservedEntries': prior_count, 'priorRoots': len(prior_roots),
        'mainGeneratedPreservedEntries': len(main_generated), 'mainInputPreservedEntries': len(main_inputs),
        'supportEntries': len(support), 'selectedRunnerSupportEntries': len(runner_support),
        'originalFailurePreserved': record('first-cause.json'), 'newUnexpectedFailure': None})
    final_rows = [{**r, 'path': str((WORK / r['path']).relative_to(ROOT))} for r in inventory(WORK)]
    write('freeze.json', {'kind': 'COMBINED-FINAL-02_exact_closed_output_freeze',
        'scope': str(WORK.relative_to(ROOT)), 'status': 'ready_for_separately_granted_L4', 'candidateId': 'candidate',
        'candidate': record('candidate.json'), 'report': record('report.md'), 'archive': archive['archive'],
        'supportManifest': record('support-manifest.json'), 'runnerInputs': record('runner-inputs.json'),
        'files': final_rows, 'fileCount': len(final_rows),
        'exclusion': 'freeze.json itself; no file may change after this handoff',
        'structuralSuccessorGrant': 'COMBINED-FINAL-STRUCTURE-02',
        'historicalFirstCause': record('first-cause.json'), 'structuralReentry': record('structure-reentry.json'),
        'independentAcceptance': False, 'L5Claim': False})
    print(json.dumps({'status': 'frozen_ready_for_separate_L4', 'freeze': record('freeze.json'),
        'candidate': record('candidate.json'), 'report': record('report.md'),
        'supportManifest': record('support-manifest.json'), 'runnerInputs': record('runner-inputs.json'),
        'archive': archive['archive'], 'frozenEntries': len(final_rows)}), flush=True)
except BaseException as failure:
    if not (WORK / 'first-cause-closure-02.json').exists():
        write('first-cause-closure-02.json', {'kind': 'first_unexpected_combined_final_02_closure_failure',
            'errorType': type(failure).__name__, 'message': str(failure), 'traceback': traceback.format_exc(),
            'historicalFirstCause': record('first-cause.json'), 'disposition': 'Stopped without repair or retry'})
    raise
