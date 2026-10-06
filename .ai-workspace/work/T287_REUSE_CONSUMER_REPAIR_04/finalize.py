import datetime
import difflib
import hashlib
import json
import os
import pathlib
import stat
import time

started = time.monotonic()
R = pathlib.Path('/Users/jim/src/apps/abiogenesis')
W = R / '.ai-workspace/work/T287_REUSE_CONSUMER_REPAIR_04'
E = R / '.ai-workspace/evidence/T287_REUSE_CONSUMER_REPAIR_04'


def digest(body):
    return hashlib.sha256(body).hexdigest()


def pin(path):
    path = pathlib.Path(path)
    info = path.lstat()
    assert stat.S_ISREG(info.st_mode), str(path)
    body = path.read_bytes()
    return {'path': str(path), 'bytes': len(body), 'sha256': digest(body),
            'mode': stat.S_IMODE(info.st_mode)}


def read(name, root=E):
    return json.loads((root / name).read_bytes())


def write(name, value):
    target = E / name
    assert not target.exists(), str(target)
    target.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
    return pin(target)


activation = read('activation.json', W)
configuration = read('execution-configuration.json', W)
cfg = read('config.json', W)
operation = activation['operation']
assert operation == configuration['operation'] == cfg['operation']
receipts = [read(phase + '.receipt.json', W) for phase in ('syntax', 'current', 'historical')]
assert all(read(phase + '.result.json', W)['status'] == 'passed'
           for phase in ('syntax', 'current', 'historical'))
for receipt in receipts:
    assert receipt['operation'] == operation
    assert receipt['exitCode'] == 0 and receipt['wait4Reaped'] and receipt['groupAbsent']
    assert not receipt['timedOut'] and receipt['defaultHeap'] and receipt['HOME'] == '/Users/jim'
    try:
        os.killpg(receipt['pgid'], 0)
    except ProcessLookupError:
        pass
    else:
        raise AssertionError('managed group still present: ' + str(receipt['pgid']))

current = read('native-calls.json')
prepared = read('preparation.json')
closure = read('selected-closure.json')
conservation = read('current-conservation.json')
outer = read('current-outer-close.json')
historical = read('fresh-original-child.json')
assert conservation['status'] == historical['status'] == 'passed'
assert conservation['before'] == conservation['after']
assert conservation['eventAppends'] == historical['eventAppends'] == 0
assert conservation['outerCloses'] == 1 and conservation['nativeCalls'] == len(current['reports']) == 2
assert historical['originalProducerReruns'] == current['producerReplays'] == 0
assert current['dispatchedTasksOrRuns'] == 0
assert prepared['standing'] == 'component_preparation_only'
assert prepared['visibility'] == current['privatePreparationVisibility'] == 'installed_private_component_only'
assert prepared['noTaskRunWorkerDispatch'] is True
assert prepared['currentViewProducer'] == current['reports'][-1]['invocation']
assert closure == cfg['expectedClosure']
assert prepared['dependencyClosure'] == closure
assert len(prepared['material']) == closure['selectedMaterialCount'] == 4
assert closure['selectedEntryCount'] == 182 and closure['retainedBodySnapshots'] == 0
assert historical['originalResult']['ref'] == cfg['expected']['resultRef']
assert historical['producer']['graphCallRef'] == cfg['expected']['graphCallRef']
assert historical['producer']['runRef'] == cfg['expected']['runRef']
assert historical['judgment']['ref'] == cfg['expected']['judgmentRef']
assert outer['closeHandoff']['prefix'] == prepared['currentSetup']['prefix']
assert current['serializedNativeCallInputs'] == current['transportedVerifierBodies'] == 0

source = []
for expected in configuration['sourcePins']:
    actual = pin(expected['path'])
    assert actual == expected, actual
    source.append(actual)
assert source[:2] == activation['sourceEntries'][:2]
preimage = R / '.ai-workspace/evidence/T287_REUSE_CONSUMER_REPAIR_03/t287-retained-installed-consumer.test.mjs'
preimage_pin = pin(preimage)
assert {k: preimage_pin[k] for k in ('bytes', 'sha256', 'mode')} == {
    k: activation['sourceEntries'][2][k] for k in ('bytes', 'sha256', 'mode')}
old = preimage.read_text()
new = pathlib.Path(source[2]['path']).read_text()
assert new == old.replace('/preimage_missing_or_crossed/', '/qualification_declaration_selection_unbound/', 1)
diff = ''.join(difflib.unified_diff(old.splitlines(keepends=True), new.splitlines(keepends=True),
                                 fromfile='Worker03-retained-test', tofile='Worker04-test'))
(E / 'source.patch').write_text(diff)
(E / 't287-retained-installed-consumer.test.mjs').write_bytes(new.encode())
write('source-subject.json', {
    'operation': operation, 'actor': activation['actor'], 'status': 'CLOSED_SOURCE',
    'entry': activation['sourceEntries'], 'postimages': source,
    'changedPaths': [source[2]['path']], 'unchangedPaths': [row['path'] for row in source[:2]],
    'preimageAtOriginalOwner': preimage_pin,
    'delta': 'One expected diagnostic changed to qualification_declaration_selection_unbound; no fixture or guard change.',
    'fixedHelperAndPreparationAuthorship': 'Original Worker01 author and bounded Worker02 correction; conserved as exact Source bodies.',
    'testAuthorship': 'Worker01/02/03 original test with this separately granted Worker04 oracle correction.',
    'retainedPostimage': pin(E / 't287-retained-installed-consumer.test.mjs'),
    'diff': pin(E / 'source.patch'), 'frameworkSourceChanges': 0})

prior = []
for number, size, sha in (
    ('01', 129263, 'ec869d41cddedb92e3d116b2e89a62558ce3c604b24b30979032cb575efd3bda'),
    ('02', 131980, 'c0731292e89cddf918faac3701ecf14a3fc32e7c2d90bb9f47eb3e4ab0cb6955'),
    ('03', 127688, '255c784914e8592c31a76a4aa79b066b512eefa0c18cdf6aba67d01d707db265')):
    row = pin(R / ('.ai-workspace/evidence/T287_REUSE_CONSUMER_REPAIR_' + number) / 'final-freeze.json')
    assert row['bytes'] == size and row['sha256'] == sha
    prior.append(row)

ingress = {
    'current': current['requiredIngressLedger'],
    'historical': historical['requiredIngressLedger']}
original_pin_rows = []
for group in (conservation['originalPins'], prepared['originalPins'], historical['originalPins']):
    for row in group:
        if row not in original_pin_rows:
            original_pin_rows.append(row)

write('readiness.json', {
    'operation': operation, 'status': 'PASSED_BOUNDED_CONSUMER_AND_COMPONENT_PREPARATION',
    'source': source, 'currentNativeReports': [pin(E / ('native-call-' + str(i) + '.json')) for i in range(2)],
    'currentNativeSelection': current['nativeSelection'], 'verification': current['verification'],
    'preparation': {k: v for k, v in prepared.items() if k != 'dependencyClosure'},
    'closure': {k: v for k, v in closure.items() if k != 'selectedEntries'},
    'originalResultRecovery': {k: v for k, v in historical.items() if k not in ('originalPins', 'requiredIngressLedger')},
    'proof': {'actualCurrentArchiveAndInstalledChecks': 'passed',
              'nominalCopiedAndCrossedVerification': 'refused',
              'eventlessCurrentNativeViewToCanonicalTaskRequestRenderer': 'passed',
              'sameBorrowedTaskViewPrepareAgain': 'passed',
              'missingResourceCrossedEntryAndUnboundDeclarationSelector': 'refused',
              'copiedCrossedAndReleasedNativeSelection': 'refused',
              'freshOriginalChildResultJAndMissingCrossedReferences': 'passed'},
    'originalPinsAtOriginalOwners': original_pin_rows,
    'residuals': {
        'currentCandidateSemanticQualification': prepared['currentCandidateSemanticQualification'],
        'originalTaskResiduals': prepared['residuals'],
        'originalJudgmentResiduals': historical['residuals'],
        'missingProofBodyWithValidDeclarationSelector': 'unproved; distinct from the exercised unbound selector',
        'advancingResourceTraversal': 'unproved; the selected native operation is eventless',
        'publicPreparationVisibilityAndMandatoryContent': 'open; preparation used pinned private canonical component owners',
        'completeGenuineF11AF22ReleaseQualification': 'open; no producer or Run replay'}})

write('closure.json', {
    'operation': operation, 'actor': activation['actor'], 'status': 'CLOSED',
    'closedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'currentAuthenticOuterReceipt': pin(E / 'current-outer-close.json'),
    'currentCloseHandoff': outer['closeHandoff'], 'currentConservation': conservation,
    'historicalPhysicalAndPrefix': {'physical': historical['physical'], 'prefix': historical['prefix'],
                                   'conservation': 'actual pre/post physical equality assertion passed in the fresh phase'},
    'processReceipts': receipts, 'knownGroupsAbsentAtClosure': [r['pgid'] for r in receipts],
    'cost': {'supervisedWallMs': sum(r['elapsedMs'] for r in receipts),
             'userCPUSeconds': sum(r['userCPUSeconds'] for r in receipts),
             'systemCPUSeconds': sum(r['systemCPUSeconds'] for r in receipts),
             'peakRSSPlatformBytes': max(r['maxRSSPlatformBytes'] for r in receipts),
             'defaultHeap': True, 'HOME': '/Users/jim', 'retries': 0},
    'zeroEffects': ['original work producer replay', 'Task or Run dispatch', 'event append',
                    'setup/install/build replay', 'provider/network/Git/release', 'framework Source changes'],
    'priorFailedCutsPreserved': prior, 'noReviewerActivation': True})


def census(root):
    rows = []
    for directory, dirs, files in os.walk(root, followlinks=False):
        parent = pathlib.Path(directory)
        info = parent.lstat()
        rows.append({'path': str(parent), 'kind': 'directory', 'mode': stat.S_IMODE(info.st_mode),
                     'device': info.st_dev, 'inode': info.st_ino})
        for name in list(dirs):
            p = parent / name
            if p.is_symlink():
                dirs.remove(name)
                info = p.lstat()
                rows.append({'path': str(p), 'kind': 'symlink', 'target': os.readlink(p),
                             'mode': stat.S_IMODE(info.st_mode), 'device': info.st_dev, 'inode': info.st_ino})
        for name in files:
            p = parent / name
            info = p.lstat()
            if stat.S_ISREG(info.st_mode):
                row = pin(p)
                row.update(kind='file', device=info.st_dev, inode=info.st_ino)
            elif stat.S_ISLNK(info.st_mode):
                row = {'path': str(p), 'kind': 'symlink', 'target': os.readlink(p),
                       'mode': stat.S_IMODE(info.st_mode), 'device': info.st_dev, 'inode': info.st_ino}
            else:
                raise AssertionError('unexpected owned nonregular: ' + str(p))
            rows.append(row)
    return sorted(rows, key=lambda row: row['path'])


def totals(rows):
    return {'files': sum(r['kind'] == 'file' for r in rows),
            'bytes': sum(r.get('bytes', 0) for r in rows if r['kind'] == 'file'),
            'directories': sum(r['kind'] == 'directory' for r in rows),
            'links': sum(r['kind'] == 'symlink' for r in rows)}


before_ledger = {'work': totals(census(W)), 'evidence': totals(census(E))}
preflight = json.loads(pathlib.Path(cfg['closurePreflightDonor']['path']).read_bytes())
assert pin(cfg['closurePreflightDonor']['path']) == cfg['closurePreflightDonor']
write('byte-ledger.json', {
    'operation': operation, 'measurement': 'actual retained artifacts and explicit authenticated supplier reads; no original-body restaging',
    'requiredColdInputReads': ingress,
    'requiredColdInputBytes': {phase: sum(row['bytes'] for row in rows) for phase, rows in ingress.items()},
    'currentOriginalManifestColdBytes': cfg['originalManifest']['bytes'],
    'currentOriginalManifestColdReadCount': sum(row['path'] == cfg['originalManifest']['path'] for row in ingress['current']),
    'selectedCanonicalAcquisition': {**{k: v for k, v in closure.items() if k != 'selectedEntries'},
                                     'entryJsonBytesFromReusedPreflight': preflight['selectedEntrySerializedBytes'],
                                     'preflightAtOriginalOwner': cfg['closurePreflightDonor'],
                                     'preflightTopLevelKeys': sorted(preflight)},
    'nativeTransfer': {'fullVerifierBodiesSerialized': current['transportedVerifierBodies'],
                       'serializedCliCallInputs': current['serializedNativeCallInputs'],
                       'compactTwoReportJsonBytes': current['retainedBodyBytes'],
                       'actualTwoReportFileBytes': sum((E / ('native-call-' + str(i) + '.json')).stat().st_size for i in range(2))},
    'currentPhysicalConservationChecks': {'eachPassBytes': conservation['before']['bytes'], 'passes': 2},
    'historicalPhysicalConservationChecks': {'eachPassBytes': historical['physical']['bytes'], 'passes': 2},
    'publicationArchiveLogicalBytes': pathlib.Path(cfg['core']['artifactPath']).stat().st_size,
    'beforeRemainingReportOverhead': before_ledger,
    'unmeasured': ['owner internal physical/archive/module-loader read totals',
                   'all intermediate in-memory representations and native argument byte traffic'],
    'limits': ['182-entry acquisition reduction does not reduce the necessary full stored manifest cold read in this storage shape',
               'no claim of reduced whole cold I/O or RSS', 'no matched historical 14-call savings claim',
               'final-freeze census supplies final owned byte totals; final-freeze excludes its own body']})

return_text = '''Worker04 CLOSED. Syntax, actual current C10 native consumer/component preparation, and separate fresh historical original child Result/J recovery passed once. Two eventless native View results feed the real canonical successor Task/request/renderer; one outer close retains the original Setup10 prefix/inode. Original Setup09 child Result81110a32/J921cd358 is recovered by its published cold owner with missing/crossed reference refusals and no producer/Run replay. Both event populations remain byte/inode-identical.

Only the granted test oracle changed; helper/preparation Source and all prior cuts remain exact. Acquisition uses 182 original dependency entries, four Task materials (85,591 decoded bytes), complete inventory/scope/provenance records and current C10 declaration through canonical owners. Full original manifest cold authentication still reads 504,760,365 bytes. No whole cold I/O/RSS or matched 14-call savings claim follows.

Preparation is a pinned installed-private component proof over the original C09 semantic subject, not C10 qualification. Original failures/citations/provenance and open residuals remain referenced. Advancing-resource traversal, valid-selector missing proof-body refusal, mandatory Public preparation content and genuine complete F11/AF22 qualification remain open. No reviewer activated; Root alone accepts. All managed groups are reaped/absent. No further writes or payloads after this freeze.
'''
(E / 'return.md').write_text(return_text)
work_rows = census(W)
evidence_rows = census(E)
assert not any(row['kind'] == 'symlink' for row in work_rows + evidence_rows)
freeze = {
    'operation': operation, 'actor': activation['actor'], 'role': 'Worker', 'status': 'CLOSED',
    'standing': 'PASSED_BOUNDED_NATIVE_CONSUMER_COMPONENT_PREPARATION_AND_HISTORICAL_RECOVERY',
    'grant': activation['grant'], 'grantSection': activation['section'],
    'subject': source, 'sourceWriteCount': 1, 'priorFailedCutsPreserved': prior,
    'readiness': pin(E / 'readiness.json'), 'closure': pin(E / 'closure.json'),
    'byteLedger': pin(E / 'byte-ledger.json'), 'sourceSubject': pin(E / 'source-subject.json'),
    'authenticHandoff': pin(E / 'current-outer-close.json'),
    'freshOriginalResultProof': pin(E / 'fresh-original-child.json'),
    'workPopulation': {'root': str(W), 'totals': totals(work_rows), 'records': work_rows},
    'evidencePopulation': {'root': str(E), 'totals': totals(evidence_rows), 'records': evidence_rows},
    'selfExcluded': str(E / 'final-freeze.json'),
    'reportFinalizationWallMs': (time.monotonic() - started) * 1000,
    'finalizedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'writesStoppedAfterFinalFreeze': True, 'RootAcceptanceAndIndependentAssurance': 'not performed by Worker'}
row = write('final-freeze.json', freeze)
print(json.dumps({'freeze': row, 'work': freeze['workPopulation']['totals'],
                  'evidenceExcludingFreeze': freeze['evidencePopulation']['totals'],
                  'cost': read('closure.json')['cost']}))
