"""Complete only the granted Runtime07 reports from saved producer records."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import stat
import time

ROOT = Path(__file__).resolve().parent.parent
WRITER = ROOT / 'report-finalization-02'
OPERATION = 'T287_RUNTIME07_SAVED_REPORT_FINALIZATION_02'


def load(relative):
    return json.loads((ROOT / relative).read_text())


def write_json(path, value):
    with path.open('x') as handle:
        json.dump(value, handle, indent=2)
        handle.write('\n')


def body_pin(path):
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(block)
    physical = path.lstat()
    return {'path': str(path), 'bytes': physical.st_size,
            'sha256': digest.hexdigest(), 'mode': stat.S_IMODE(physical.st_mode)}


def exactly_one(records, kind, failure_class=None):
    selected = [record for record in records if record['kind'] == kind and
                (failure_class is None or record['payload'].get('value', {}).get('failureClass') == failure_class)]
    assert len(selected) == 1, (kind, failure_class, len(selected))
    return selected[0]


def inventory(known):
    files, directories = [], []
    for directory, dirnames, filenames in os.walk(ROOT, followlinks=False):
        dirnames.sort()
        filenames.sort()
        parent = Path(directory)
        for name in dirnames:
            path = parent / name
            physical = path.lstat()
            assert stat.S_ISDIR(physical.st_mode), str(path)
            directories.append({'path': str(path.relative_to(ROOT)),
                                'mode': stat.S_IMODE(physical.st_mode)})
        for name in filenames:
            path = parent / name
            if path == ROOT / 'final-runtime-freeze.json':
                continue
            physical = path.lstat()
            assert stat.S_ISREG(physical.st_mode), str(path)
            saved = known.get(str(path))
            if saved is not None:
                assert physical.st_size == saved['bytes'], str(path)
                digest, origin = saved['sha256'], 'saved producer body identity reused; no payload reproof'
            else:
                digest, origin = body_pin(path)['sha256'], 'first final report-population body census'
            files.append({'path': str(path.relative_to(ROOT)), 'kind': 'file',
                          'bytes': physical.st_size, 'sha256': digest,
                          'mode': stat.S_IMODE(physical.st_mode),
                          'device': physical.st_dev, 'inode': physical.st_ino,
                          'mtimeNs': physical.st_mtime_ns, 'bodyIdentitySource': origin})
    return sorted(files, key=lambda item: item['path']), sorted(directories, key=lambda item: item['path'])


def main():
    started = time.monotonic()
    activation = load('report-finalization-02/activation.json')
    runtime_activation = load('runtime-activation.json')
    accounting = load('accounting.json')
    failure = load('first-violated-relations.json')
    handoff = load('closed-event-resource-handoff.json')
    conservation = load('conservation.json')
    owner_census = load('owner-resource-census.json')
    actor = load('actual-actor-transport-evidence.json')
    appended = load('appended-runtime-records.json')
    available = load('available-native-verification-preimages.json')
    preparation = load('preparation.json')
    configuration = load('driver-config.json')
    plan = load('resource-plan.json')
    validation = load('report-finalization-02/local-bindings-validation.json')
    records = appended['records']
    events = [record for record in records if record['kind'] != 'abg_admitted_body_reference_record']
    child = exactly_one(events, 'c_call_result_admitted', 'assessment_transport_mismatch')
    parent = exactly_one(events, 'c_call_result_admitted', 'child_traversal_failed')
    foldback = exactly_one(events, 'child_foldback_admitted')
    stopped = exactly_one(events, 'run_stopped')
    boundary = failure['PublicBoundary']
    earliest = failure['earliestObservedOwnerRefusal']
    native = earliest['actualNativeEvidence']
    physical = handoff['physical']
    supervisor = accounting['supervisor']
    request = actor['request']
    helper = actor['helperClosure']
    report_elapsed = lambda: (time.monotonic() - started) * 1000
    assert activation['operation'] == OPERATION and validation['undefinedGlobalNames'] == []
    assert len(records) == appended['recordCount'] == 64 and len(events) == appended['runtimeEvents'] == 63
    assert accounting['actualPublicCalls'] == accounting['controlledHelperLaunches'] == 1
    assert accounting['realProviderCalls'] == accounting['successfulRunClosures'] == accounting['successfulQualificationJ'] == 0
    assert accounting['attemptedColdReads'] == accounting['F11Runs'] == accounting['AF22Runs'] == 0
    assert boundary['outcomeKind'] == 'result' and boundary['exitCode'] == 0 and boundary['runDisposition'] == 'runtime_failed' and boundary['terminalResult'] is None
    assert native['payload']['nativeResultAssessment']['disposition'] == 'rejected' and native['payload']['nativeResultAssessment']['verification'] is None
    assert foldback['payload']['childDisposition'] == 'failed' and foldback['payload']['childClosureRef'] is None
    assert stopped['runId'] == boundary['run']['ref']
    assert handoff['originalPrefix']['byteExactPrefix'] and handoff['originalPrefix']['sameDeviceInode']
    assert conservation['status'] == 'passed' and owner_census['fullOldPayloadRehashOrRecopy'] is False
    assert helper['ownerProcessExited']['payload']['status'] == 0 and helper['ownerTerminationConfirmed']
    assert physical['bytes'] - handoff['originalPrefix']['bytes'] == appended['appendedBytes'] == accounting['appendedEventBytes']

    # Reporting metadata only: never open the live ABG resource or actor payload.
    external = Path(physical['path']).lstat()
    assert external.st_size == physical['bytes'] and external.st_dev == physical['device'] and external.st_ino == physical['inode']
    assert stat.S_IMODE(external.st_mode) == int(physical['mode'], 8)
    protected = activation['protectedSavedReports']
    assert len(protected) == 10
    known = {item['path']: item for item in protected}
    for item in preparation['selectedInputCopies']:
        known[item['target']['path']] = item['target']
    for item in configuration['sourceCopies']:
        known[item['target']] = {'path': item['target'], 'bytes': item['bytes'], 'sha256': item['sha256']}
    known[str(ROOT / 'setup06-initial-durable-prefix.bin')] = handoff['originalPrefix']
    for category in ['ownerRequest', 'ownerPrompt']:
        item = available[category]['retainedReportCopy']
        known[item['path']] = item

    effects = {'actualPublicCalls': accounting['actualPublicCalls'],
               'ABGAppendedRecords': len(records), 'ABGAppendedBytes': appended['appendedBytes'],
               'controlledHelperLaunches': accounting['controlledHelperLaunches'],
               'realProviderCalls': accounting['realProviderCalls'], 'completedRuns': 0,
               'successfulQualificationJ': 0, 'failedChildResult': child['payload']['resultRef'],
               'failedParentResult': parent['payload']['resultRef'], 'failedFoldback': foldback['payload']['foldbackRef'],
               'run': boundary['run'], 'runDisposition': boundary['runDisposition'],
               'coldReads': 0, 'F11Runs': 0, 'AF22Runs': 0,
               'additionalRuntimeSourceSetupInstallGitNetworkQualificationCommands': 0}
    attribution = {'operation': OPERATION, 'role': 'Writer, report-only', 'grant': activation['grant'],
                   'selfContainedFinalizer': body_pin(Path(__file__).resolve()),
                   'savedRecordsProducer': 'appended-runtime-records.json',
                   'protectedTenSavedReports': protected,
                   'previousWriter': 'CLOSED_STOPPED_REPORT_NAMESPACE_MISS',
                   'previousWriterEvidence': 'report-finalization-02/failed-saved-tail-attempt.json',
                   'elapsedMsBeforeFinalReports': report_elapsed(),
                   'RuntimeOwnerImportsReopensReadbacksHelpersProvidersPayloadReproof': 0}
    closure = {'status': 'CLOSED', 'role': 'Runtime Worker, stopped',
               'operation': runtime_activation['operation'], 'actor': runtime_activation['actor'],
               'actualRootActor': runtime_activation['actorRef'], 'returnTo': '/root Executive',
               'workResult': 'NO_GO_FIRST_NATIVE_ASSESSMENT_RAW_RESULT_CONTRACT_FAILURE',
               'resourceHandoff': 'closed-event-resource-handoff.json', 'resourceHandoffDigest': handoff['handoffDigest'],
               'firstFailure': 'first-violated-relations.json', 'firstObservedOwnerPredicate': earliest['ownerPredicate'],
               'nativeEvidenceEvent': native['eventId'], 'firstChildDiagnostic': failure['childDiagnostic'],
               'childResultEvent': child['eventId'], 'foldbackEvent': foldback['eventId'], 'runStoppedEvent': stopped['eventId'],
               'exactUnderlyingNativePreimageRefusal': 'Unknown in this reporting cut; independent Root localization is separate',
               'effects': effects, 'processClosure': accounting['knownProcessClosure'],
               'processUnknowns': accounting['unknowns'], 'remaining': failure['missingDownstream'],
               'afterResultBeforeJ': failure['afterResultBeforeJ'], 'sourceConservation': 'conservation.json',
               'reportFinalization': attribution, 'ReporterCompletionConfersFunctionalityOrReleasePass': False,
               'ReviewerActivation': False, 'allWritesAfterFinalFreeze': 'STOPPED'}
    closed_at = datetime.now(timezone.utc).isoformat()
    write_json(WRITER / 'closure.json', {'status': 'CLOSED', 'operation': OPERATION, 'role': 'Writer, report-only',
               'actor': runtime_activation['actor'], 'closedAt': closed_at, 'grant': activation['grant'],
               'originalRuntimeOperation': runtime_activation['operation'], 'originalRuntimeStatus': 'CLOSED_FIRST_NATIVE_FAILURE',
               'previousReportWriterOperation': activation['priorReportWriterOperation'], 'previousReportWriterStatus': 'CLOSED_STOPPED_REPORT_NAMESPACE_MISS',
               'protectedSavedReportsUnchangedByOperation': protected, 'savedAccountingUnchanged': 'accounting.json',
               'originalEventResourceUntouched': physical, 'actualActorArtifactPinsUntouched': actor['artifactPins'],
               'localBindingsValidation': validation, 'closureMethod': 'Self-contained saved producers; no partial original tail executed',
               'reportOnlyElapsedMsToClosure': report_elapsed(), 'RuntimeOwnerImportsReadbacksHelpersSourcePayloadReproofEffects': 0,
               'remainingOutputs': ['closure.json', 'return.md', 'final-runtime-freeze.json'],
               'returnTo': '/root Executive', 'writesAfterFinalFreeze': 'STOPPED'})
    write_json(ROOT / 'closure.json', closure)
    text = f'''CLOSED — first native assessment raw-result contract failure; no repair or retry.

One wrapper Public invocation returned result/exit 0 carrying runtime_failed and terminalResult:null. The core F_P child reached the controlled helper (PID {helper['processId']}) with actual owner request {request['requestDigest']} and the exact {request['promptUtf8Bytes']}-byte prompt. The helper exited 0, without retries, tools or real provider calls. Native worker-result admission rejected the actual output: disposition rejected, verification:null, transport contract_failure. The child admitted {failure['childDiagnostic']} at {child['eventId']}; its failed foldback retained childClosureRef:null. Parent child_traversal_failed and run_stopped followed. Exact underlying native preimage refusal is unknown in this cut; Root independent localization is separate.

The strict completed-Run gate stopped before cold reads, fresh F11, AF22 or nearest negatives. No successful qualification J, graph closure or RunClosed occurred. Actual caller input, receipt/outcome, native process, full actor transport/finalOutput, original actor artifact pins, Result/failure judgments, foldback and stopped Run remain preserved.

Supervision took {supervisor['elapsedMs']/1000:.3f}s; peak wait4 RSS {supervisor['rssBytes']} bytes. No timeout or OOM cause is inferred. Default heap and HOME {accounting['HOME']} remained unchanged. Main and parent CLI groups were absent with wait4 receipts. Helper exit/confirmed termination and an absent PID probe are saved; independent helper wait4/PGID and ambient process enumeration remain unknown.

Setup06 original {handoff['originalPrefix']['bytes']}-byte prefix, SHA256 {handoff['originalPrefix']['sha256']}, device {physical['device']}, inode {physical['inode']} are conserved. ABG appended {appended['appendedBytes']} bytes / {len(records)} physical records / {len(events)} Runtime events. Latest closed event resource is {physical['bytes']} bytes / SHA256 {physical['sha256']}; prefix {handoff['closeHandoff']['prefix']['coordinateDigest']}; authentic handoff {handoff['handoffDigest']}. No event lock remained. Saved complete owner census reuses accepted old body assurance; reporting performed no old payload reproof or resource reopening.

There were zero further Runtime, setup/install/catalog/worksite/source/Git/network/provider/qualification-command effects or old-store appends. Successful child/J/foldback/parent RunClosed, six agreeing fresh CLI reads, fresh F11, sole truthful non-green AF22, supported negatives, genuine assessment and release obligations remain unproved.

Both report failures are preserved. Writer01 stopped on its namespace NameError after saving accounting; its premature closure claim is retained as failed control evidence. Writer02 completed closure/return/freeze with explicit saved producer bindings. Accounting and earlier evidence stayed unchanged. Report-only timing is separate in closure/freeze. Runtime Worker and report Writers are CLOSED; all writes stop after final-runtime-freeze.json. Root alone conjoins and selects re-entry.
'''
    with (ROOT / 'return.md').open('x') as handle:
        handle.write(text)
    files, directories = inventory(known)
    freeze = {'status': 'CLOSED', 'role': 'Runtime Worker, stopped; report Writer CLOSED',
              'operation': runtime_activation['operation'], 'actor': runtime_activation['actor'],
              'frozenAt': datetime.now(timezone.utc).isoformat(), 'returnTo': '/root Executive',
              'workResult': closure['workResult'], 'return': 'return.md', 'closure': 'closure.json',
              'firstFailure': 'first-violated-relations.json', 'resourceHandoff': 'closed-event-resource-handoff.json',
              'resourceHandoffDigest': handoff['handoffDigest'], 'recordCount': len(files),
              'bodyBytes': sum(item['bytes'] for item in files), 'directoryCount': len(directories),
              'symlinks': 0, 'records': files, 'directories': directories,
              'authenticExternalEventResource': physical, 'originalEventPrefix': handoff['originalPrefix'],
              'completeExternalCurrentResourceCensus': {'report': 'owner-resource-census.json',
                  'acceptedSetupFreeze': owner_census['acceptedSetupFreeze'],
                  'originalMembers': len(owner_census['originalMembers']),
                  'savedNewlyEnumeratedMembers': len(owner_census['newOwnerMembers']),
                  'currentDirectories': len(owner_census['currentDirectories']),
                  'oldBodyProof': owner_census['oldBodyProof'], 'fullOldPayloadRehashOrRecopy': False},
              'externalActualActorArtifactPins': actor['artifactPins'], 'effects': effects,
              'runtimeElapsedMs': supervisor['elapsedMs'], 'peakWait4RSSBytes': supervisor['rssBytes'],
              'heap': accounting['heap'], 'HOME': accounting['HOME'],
              'copiedPreparationFreeze': 'freeze.json remains an exact Q08 input-control replica, never this Runtime cut',
              'excludedSelf': 'final-runtime-freeze.json only', 'reportFinalization': attribution,
              'reportOnlyElapsedMsToInventory': report_elapsed(), 'noAdditionalRuntimeOrPayloadReproof': True,
              'exactUnderlyingNativePreimageRefusal': closure['exactUnderlyingNativePreimageRefusal'],
              'missingDownstream': failure['missingDownstream'], 'noFunctionalityOrReleasePass': True, 'noFurtherWrites': True}
    write_json(ROOT / 'final-runtime-freeze.json', freeze)
    print(json.dumps({'status': 'CLOSED', 'freeze': body_pin(ROOT / 'final-runtime-freeze.json'),
          'recordCount': len(files), 'bodyBytes': freeze['bodyBytes'], 'directories': len(directories),
          'symlinks': 0, 'handoffDigest': handoff['handoffDigest'], 'event': physical,
          'prefix': handoff['closeHandoff']['prefix']['coordinateDigest'], 'runtimeElapsedMs': supervisor['elapsedMs'],
          'reportFinalizerElapsedMs': report_elapsed(), 'controlledHelperLaunches': 1, 'realProviderCalls': 0, 'coldReads': 0}))


if __name__ == '__main__':
    main()
