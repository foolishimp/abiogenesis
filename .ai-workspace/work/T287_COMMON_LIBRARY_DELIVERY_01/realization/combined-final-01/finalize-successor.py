# Separate Executive-authorized preservation classification successor. Original finalize.py remains immutable.
from pathlib import Path
import datetime, json, os, time, traceback
from common import ROOT, WORK, TENANT, digest, inventory, row, verify, write

def read(name):
    return json.loads((WORK / name).read_text())

def exact_rows(base, rows):
    for expected in rows:
        actual = verify(base / expected['path'], expected)
        if 'kind' in expected:
            assert actual['kind'] == expected['kind'], expected['path']

def exact_tree(base, rows):
    actual = inventory(base)
    wanted = [{key: value for key, value in r.items() if key in ['path', 'kind', 'mode', 'bytes', 'sha256', 'target']}
              for r in rows]
    assert actual == sorted(wanted, key=lambda r: Path(r['path'])), str(base)
    return len(actual)

def record(name):
    return row(WORK / name, (WORK / name).relative_to(ROOT))

started = time.monotonic()
assert digest(WORK / 'first-cause.json') == '8eff9b83a8060a46b8d02897864868d293478a67e483b1336189d30e177c1276'
assert not (WORK / 'first-cause-successor.json').exists()
assert not (WORK / 'freeze.json').exists()
write('commands/finalize-successor.request.json', {
    'label': 'finalize-successor', 'grant': 'COMBINED-FINAL-PRESERVATION-01',
    'argv': ['python3', '-B', str(WORK / 'finalize-successor.py')], 'cwd': str(ROOT),
    'scriptSha256': digest(WORK / 'finalize-successor.py'),
    'prebuildFreezeSha256': digest(WORK / 'prebuild-freeze.json'),
    'startedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'scope': 'Read exact frozen records, compare file bytes/modes/sets, write bounded support/preservation/report/freeze records only',
})
try:
    labels = ['tsc', 'generate', 'material', 'pack', 'payload', 'structure']
    receipts = {}
    for label in labels:
        request, receipt = read(f'commands/{label}.request.json'), read(f'commands/{label}.result.json')
        assert receipt['exitCode'] == 0, label
        assert request['prebuild_freeze_sha256'] == digest(WORK / 'prebuild-freeze.json'), label
        for stream in ['stdout', 'stderr']:
            path = WORK / f'commands/{label}.{stream}'
            assert path.stat().st_size == receipt[stream]['bytes'] and digest(path) == receipt[stream]['sha256'], label
        if 'verification_script_sha256' in request:
            assert digest(Path(request['argv'][1])) == request['verification_script_sha256'], label
        receipts[label] = {'request': record(f'commands/{label}.request.json'),
                           'result': record(f'commands/{label}.result.json'), 'exitCode': 0, 'executions': 1}
    exact_rows(ROOT, read('prebuild-freeze.json')['files'])
    exact_rows(ROOT, read('stopped-cut-records.json')['files'])
    reentry = read('preservation-reentry.json')
    for key in ['HOW', 'historicalFirstCause', 'originalFinalizer', 'originalRequest', 'originalCapture', 'stoppedRecords', 'observedDelta', 'concurrentClosedFreeze']:
        verify(ROOT / reentry[key]['path'], reentry[key])
    concurrent_root = reentry['concurrentTerritory']
    concurrent_freeze = json.loads((ROOT / reentry['concurrentClosedFreeze']['path']).read_text())
    assert concurrent_freeze['recordCount'] == len(concurrent_freeze['records']) == 29
    exact_rows(ROOT, concurrent_freeze['records'])
    concurrent_rows = [row(ROOT / r['path'], str(Path(r['path']).relative_to(concurrent_root))) for r in concurrent_freeze['records']]
    concurrent_rows.append(row(ROOT / reentry['concurrentClosedFreeze']['path'], 'freeze.json'))
    exact_tree(ROOT / concurrent_root, concurrent_rows)
    delta = read('concurrent-preparation-delta.json')
    assert (delta['historicalSnapshotCount'], delta['closedFileCount'], len(delta['changed']), len(delta['added']), len(delta['removed'])) == (16, 30, 4, 14, 0)
    concurrent = {'territory': concurrent_root, 'freeze': reentry['concurrentClosedFreeze'],
                  'boundRecordsVerified': 29, 'closedFilesVerified': 30,
                  'historicalSnapshotIsNotAnImmutablePriorCut': True,
                  'observedDelta': record('concurrent-preparation-delta.json')}

    source_rows = read('source-union-manifest.json')['files']
    source_count = exact_tree(WORK / 'source', source_rows)
    stage_count = exact_tree(WORK / 'stage', read('stage-post-generation-inventory.json')['files'])
    deps = read('dependency-inventory.json')
    dep_target = WORK / 'stage' / TENANT / 'node_modules'
    dep_count = exact_tree(dep_target, deps['files'])
    exact_tree(Path(deps['source']), deps['files'])
    for expected in deps['files']:
        target, original = dep_target / expected['path'], Path(deps['source']) / expected['path']
        assert not os.path.samefile(target, original), str(target)
        if target.is_symlink():
            assert target.resolve().is_relative_to(dep_target.resolve()), str(target)
    main_generated = read('protected-main-generated.json')['files']
    main_inputs = read('protected-main-inputs.json')['files']
    exact_rows(ROOT, main_generated)
    exact_rows(ROOT, main_inputs)
    assert len(main_generated) == 936
    print(json.dumps({'phase': 'source_stage_dependencies_main_preserved', 'source': source_count,
                      'stage': stage_count, 'dependencies': dep_count, 'mainGenerated': len(main_generated)}), flush=True)

    prior = read('protected-prior-trees.json')
    prior_roots = []
    for root in prior['roots']:
        if root == concurrent_root:
            continue
        selected = [r for r in prior['files'] if r['path'].startswith(root + '/')]
        expected = [{**r, 'path': str(Path(r['path']).relative_to(root))} for r in selected]
        count = exact_tree(ROOT / root, expected)
        prior_roots.append({'path': root, 'entries': count, 'exactFileSetBytesModesTargetsUnchanged': True})
    preserved_prior_count = sum(r['entries'] for r in prior_roots)
    assert preserved_prior_count == reentry['requiredOtherPriorEntries'] == 87344
    assert len(prior_roots) == reentry['requiredOtherPriorRoots'] == 22
    print(json.dumps({'phase': 'other_prior_cuts_preserved_and_concurrent_cut_verified', 'roots': len(prior_roots),
                      'unchangedEntries': preserved_prior_count, 'concurrentBoundRecords': 29}), flush=True)

    package = read('package-source-correspondence.json')
    archive = read('archive-members.json')
    exact_rows(ROOT, [archive['archive']])
    payload = read('archive-payload-owner-result.json')
    assert payload['status'] == 'satisfied'
    metadata = read('metadata-correspondence.json')
    structure = read('structural-correspondence.json')
    assert structure['status'] == 'satisfied'
    assert structure['archiveSha256'] == archive['archive']['sha256']
    correspondence = read('source-generated-correspondence.json')
    derived = {r['after']['path']: r['after'] for r in correspondence['derived_source_successors']}
    for expected in source_rows:
        verify(WORK / 'stage' / expected['path'], derived.get(expected['path'], expected))
    assert len(derived) == 2
    toolchain = read('toolchain.json')
    verify(Path(toolchain['node_executable']['path']), toolchain['node_executable'])
    assert digest(Path(toolchain['npm_realpath'])) == toolchain['npm_entrypoint_bytes_sha256']

    source_by_path = {r['path']: r for r in source_rows}
    members = {r['path']: r for r in archive['files']}
    support = []
    for item in inventory(WORK / 'stage' / TENANT / 'test_env'):
        tenant_path = 'test_env/' + item['path']
        source_path = str(TENANT / tenant_path)
        expected = source_by_path[source_path]
        verify(WORK / 'stage' / source_path, expected)
        assert tenant_path not in members
        support.append({**item, 'path': str((WORK / 'stage' / source_path).relative_to(ROOT)),
                        'tenantPath': tenant_path, 'sourceOwner': expected['owner']})
    write('support-manifest.json', {
        'kind': 'exact_unexecuted_staged_proof_support_for_later_L4_P1_P5',
        'stageRoot': str(WORK / 'stage' / TENANT), 'files': support,
        'selectedOwnedSupport': [r['path'] for r in support if r['sourceOwner'] != 'immutable-baseline'],
        'allSupportExcludedFromArchive': True, 'testsExecutedInThisActivation': 0,
        'limitations': 'Exact proof-support inputs only; grants, resources, installed paths and results belong to later activations',
    })
    write('preservation.json', {
        'sourceEntriesUnchanged': source_count, 'sourceUnionManifest': record('source-union-manifest.json'),
        'stageEntriesExactlyEqualPostGeneration': stage_count, 'stageInventory': record('stage-post-generation-inventory.json'),
        'independentDependencyEntriesUnchanged': dep_count, 'noSharedDependencyInodes': True,
        'dependencyRelativeLinksConfined': True, 'dependencyInventory': record('dependency-inventory.json'),
        'mainGeneratedEntriesUnchanged': len(main_generated), 'mainInputEntriesUnchanged': len(main_inputs),
        'mainGeneratedCapture': record('protected-main-generated.json'), 'mainInputCapture': record('protected-main-inputs.json'),
        'priorCutEntriesUnchanged': preserved_prior_count, 'priorRoots': prior_roots,
        'separatelyClosedConcurrentPreparation': concurrent,
        'classificationCorrection': record('preservation-reentry.json'),
        'originalFinalizationFailure': record('first-cause.json'),
        'priorCapture': record('protected-prior-trees.json'), 'prebuildInputsUnchanged': True,
        'allOtherSourceInputsUnchanged': True, 'exactAuthorizedDerivedSourcePaths': list(derived),
        'archiveUnchanged': True, 'toolchainUnchanged': True,
        'effectBoundary': 'All writes by this activation are confined to combined-final-01; prior captures verify their exact selected physical territories',
    })
    candidate = {
        'kind': 'COMBINED-FINAL-BUILD-01_closed_build_package_handoff',
        'status': 'ready_for_separately_granted_L4',
        'sourceUnion': record('source-union-manifest.json'), 'sourcePrecedence': record('precedence-ledger.json'),
        'prebuildFreeze': record('prebuild-freeze.json'), 'HOW': record('HOW.md'),
        'package': row(WORK / 'stage' / TENANT / 'package.json', (WORK / 'stage' / TENANT / 'package.json').relative_to(ROOT)),
        'packageLock': row(WORK / 'stage' / TENANT / 'package-lock.json', (WORK / 'stage' / TENANT / 'package-lock.json').relative_to(ROOT)),
        'manifest': row(WORK / 'stage' / TENANT / 'product-toolchain-manifest.json',
                        (WORK / 'stage' / TENANT / 'product-toolchain-manifest.json').relative_to(ROOT)),
        'archive': archive['archive'], 'archiveMembers': len(archive['files']), 'unpackedBytes': package['unpacked_bytes'],
        'npmIntegrity': archive['npm_integrity'], 'npmShasum': archive['npm_shasum'],
        'productContentDigest': payload['actualProductContentDigest'],
        'payloadOwnerResult': record('archive-payload-owner-result.json'),
        'generatedInventory': record('generated-inventory.json'), 'supportManifest': record('support-manifest.json'),
        'metadataCorrespondence': record('metadata-correspondence.json'),
        'structuralCorrespondence': record('structural-correspondence.json'), 'preservation': record('preservation.json'),
        'commandReceipts': receipts,
        'effects': {'compilerExecutions': 1, 'generatorExecutions': 1, 'archivePackExecutions': 1,
                   'generatorInternalPackDryRun': 'existing producer path projection only',
                   'testExecutions': 0, 'installedWorkloads': 0, 'nativeWorkloads': 0,
                   'endpointWorkloads': 0, 'GitOperations': 0, 'networkInstallations': 0,
                   'sourceSemanticChangesByThisActivation': 0},
        'originalFinalizationFailure': record('first-cause.json'),
        'preservationClassificationCorrection': record('preservation-reentry.json'),
        'concurrentPreparation': concurrent, 'newUnexpectedFailure': None,
        'limits': ['No independent acceptance or L5 claim.', 'No installed reachability or combined behavioral proof.',
                  'Earlier candidate-01 P1 evidence does not transfer to this archive.',
                  'Closed source streams are conjoined by exact identity; their prior evidence remains separately scoped.',
                  'Final L4 P1-P5 must exercise actual owners under separately frozen resource/effect grants.'],
    }
    write('candidate.json', candidate)
    changed_catalog = sum(not r['unchangedExactly'] for r in metadata['catalogRows'])
    report = f'''# COMBINED-FINAL-BUILD-01 closed Writer return with preservation successor

One exact final combined build/package candidate is frozen for a separate L4 activation. This is a bounded Writer handoff, not independent acceptance or L5. No test, installed, endpoint or native workload ran.

The immutable 1311-file baseline was composed with 33 tenant-owned final outputs through the nine pinned closed freezes and their exact precedence. The union has {source_count} files: 1213 tenant files and 107 baseline context files. Nine tenant paths are additions. Non-tenant owned GOALS/ticket/work-record overlays were excluded. `source-union-manifest.json`, `precedence-ledger.json` and `preimages/` bind every selected source and predecessor. HOW and the prebuild freeze preceded compilation. The corrected second derived-source owner is `contracts/worksite/command-execution-context.inventory.json`.

The exact compiler, generator and archive pack each ran once and exited zero. Node 24.7.0, npm 11.5.1 and TypeScript 5.9.2 used the independently copied 4576 locked dependency entries. Material, payload and structural correspondence each ran once and passed. None was rerun during the separately authorized preservation successor. The first finalization attempt exited 1 at the prior-directory preservation comparison; its script, request, historical capture and first-cause record remain exact. Executive COMBINED-FINAL-PRESERVATION-01 corrected the classification of one concurrently active sibling territory and authorized this new finalization script/receipt. No source or candidate change was selected. Read-only path discovery and evidence-script authoring are not build executions; one rejected patch hunk during evidence-script authoring changed no file and ran no candidate command.

Archive: `artifacts/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz`, {archive['archive']['bytes']:,} bytes, SHA-256 `{archive['archive']['sha256']}`. All {len(archive['files']):,} members match exact staged bytes and modes, with zero mode normalizations; unpacked size is {package['unpacked_bytes']:,} bytes. Package support is excluded. The actual Product-exported payload owner computed `{payload['actualProductContentDigest']}` over 5269 archive-derived rows. Manifest SHA-256 is `{candidate['manifest']['sha256']}`; package and lock identities are in `candidate.json`. The earlier package correspondence record's pending payload note is discharged by `archive-payload-owner-result.json` and its successful command receipt.

Generation produced 940 entries. Exactly the two predeclared derived source paths changed; every other input stayed exact. The immutable source copy retains both preimages. Baseline-to-candidate manifest static fields remain exact. Of 75 contract catalog rows, {75 - changed_catalog} remain entirely equal and {changed_catalog} change only actual native declaration inventory identities and their owner-derived contract digests. Exactly two declaration files change: `semantic_job.d.ts` and `worksite_command_execution.d.ts`, from TypeScript inference of the closed E03 Product-owned timeout/grace/drain budget rule. All remaining row fields, declaration paths and export paths are equal. All 16 capability semantic rows remain exact; both complete graphs were reconstructed by their actual owner from the corresponding exact catalog coordinates. All 47 contribution rows remain exact except their precisely derived provenance coordinate. Ten publication bindings per subject were reconstructed by actual GTL factories. No global identity stripping was used.

The C2 source-owned renderer member, span and context inventory match actual emitted bytes and the actual renderer text. `metadata-correspondence.json` records the before/after declarations, owner-derived graph/catalog/content relations and exact helper material coordinates. No source coordinate was refreshed by this activation. Four package members were added, the `.js` and `.d.ts` emissions of `shared/owned_process_lifetime` and `abg/native_work_effect`; no old locator was removed.

`structural-correspondence.json` records both sides of the seven selected pure-body retirements, the existing common owners, three lifetime consumers, two direct U1 common-join consumers plus the runtime-history dependency index and physical-root retirement relation, and the K11 role-source join before either corpus branch. Generic K11 constructor source is exactly unchanged from the original pure stream. Selected source and emitted bodies/imports/calls are bound to exact archive bytes. This is structural linkage and absence evidence, not dynamic reachability or semantic sufficiency. Residual unselected filters, key-domain distinctions, HTTP polling and emergency parent-exit behavior remain explicitly outside the retirement claim.

The successor preservation comparison found zero differences across {preserved_prior_count:,} entries in all {len(prior_roots)} other originally captured roots, including old/failed cuts and baseline material. Exactly `final-proof-preparation-01` is separately classified as an explicitly concurrent Writer territory at the original capture. Its historical sixteen-file snapshot has four changed files, fourteen additions and zero removals; it is not claimed unchanged. `concurrent-preparation-delta.json` preserves every before/after row. Its separately closed freeze `e7bf015a4cc2bf9246d2aedd9800a8b0c41aef5255b5b30fdfd78a69627b12aa` and all 29 bound rows (30 directory files including the freeze) were verified exactly. No other exception or inventory refresh occurred. All 936 main generated entries and {len(main_inputs)} captured live input files remain exact. The 1320-source copy, {stage_count}-entry stage and independently copied 4576 dependencies retain exact sets/bytes/modes/links. `support-manifest.json` freezes {len(support)} staged proof-support files for later P1-P5, without executing them.

This archive is a new candidate. Earlier candidate-01 P1 evidence does not transfer. Installed owner projection/resolution/binding/verification, exact-span semantic sufficiency, native lifetime effects, currentness consumer behavior and durable-install identity boundary remain for separately authorized combined L4 proof. No reviewer activation or independent acceptance was performed. Stop editing after this freeze.
'''
    with (WORK / 'report.md').open('x') as stream:
        stream.write(report)
    write('commands/finalize-successor.result.json', {
        'label': 'finalize-successor', 'exitCode': 0, 'wallMsBeforeFreeze': (time.monotonic() - started) * 1000,
        'completedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'sourceEntries': source_count, 'stageEntries': stage_count, 'dependencyEntries': dep_count,
        'priorPreservedEntries': preserved_prior_count, 'mainGeneratedPreservedEntries': len(main_generated),
        'separatelyClosedConcurrentRecordsVerified': 29, 'originalFailurePreserved': record('first-cause.json'),
        'supportEntries': len(support), 'newUnexpectedFailure': None,
    })
    final_rows = [{**r, 'path': str((WORK / r['path']).relative_to(ROOT))} for r in inventory(WORK)]
    write('freeze.json', {
        'kind': 'COMBINED-FINAL-BUILD-01_exact_closed_output_freeze',
        'scope': str(WORK.relative_to(ROOT)), 'status': 'ready_for_separately_granted_L4',
        'candidate': record('candidate.json'), 'report': record('report.md'), 'archive': archive['archive'],
        'files': final_rows, 'exclusion': 'freeze.json itself; no file may change after this handoff',
        'preservationSuccessorGrant': 'COMBINED-FINAL-PRESERVATION-01',
        'historicalFirstCause': record('first-cause.json'), 'classificationCorrection': record('preservation-reentry.json'),
        'independentAcceptance': False, 'L5Claim': False,
    })
    print(json.dumps({'status': 'frozen_ready_for_separate_L4', 'freeze': record('freeze.json'),
                      'report': record('report.md'), 'candidate': record('candidate.json'),
                      'supportManifest': record('support-manifest.json'),
                      'archive': archive['archive'], 'frozenEntries': len(final_rows)}), flush=True)
except BaseException as failure:
    if not (WORK / 'first-cause-successor.json').exists():
        write('first-cause-successor.json', {'kind': 'first_unexpected_preservation_successor_failure',
              'errorType': type(failure).__name__, 'message': str(failure),
              'traceback': traceback.format_exc(), 'disposition': 'Stopped; no repair or retry'})
    raise
