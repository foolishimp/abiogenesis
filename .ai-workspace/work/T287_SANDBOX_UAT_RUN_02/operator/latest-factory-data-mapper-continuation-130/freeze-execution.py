from pathlib import Path
import collections, datetime, errno, hashlib, json, os, stat, subprocess

phase = Path(__file__).resolve().parent
campaign = phase.parent.parent
old_phase = phase.parent / 'latest-factory-data-mapper-resume-execution-129'
read = lambda p: json.loads(Path(p).read_text())
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()

def pin(path):
    path = Path(path).resolve()
    st = path.lstat()
    assert stat.S_ISREG(st.st_mode) and not path.is_symlink(), str(path)
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1048576), b''):
            digest.update(chunk)
    return {'path': str(path), 'sha256': digest.hexdigest(), 'byteCount': st.st_size}

def write(name, value):
    with (phase / name).open('x') as stream:
        stream.write(json.dumps(value, indent=2, ensure_ascii=False) + '\n')

config = read(phase / 'execution-monitor-config.json')
archive = Path(config['archive'])
store = archive / 'resources/events/runtime.events.jsonl'
handoff = read(phase / 'final-close-handoff.json')
prefix = handoff['prefix']
initial_stat = store.stat()
assert (initial_stat.st_dev, initial_stat.st_ino, initial_stat.st_size) == (
    prefix['storeIdentity']['device'], prefix['storeIdentity']['inode'], prefix['prefixLength'])
setup = read(phase / 'continuation-setup.json')
outcome = read(phase / 'calls/continuation-start.outcome.json')
owner = outcome['receipt']['ownerOutput']['value']
resources = outcome['receipt']['resources']
assert owner['disposition'] == 'runtime_failed' and owner['terminalResult'] is None
assert resources['eventResource']['entryPrefix'] == setup['prefix']
assert resources['eventResource']['closeHandoff'] == handoff

protected = {}
for name in ['freeze.json', 'dynamic-freeze.json']:
    for row in read(phase / name)['ledger']:
        protected[row['path']] = row
materials = [row for row in read(old_phase / 'execution-freeze.json')['ledger']
             if '/sandbox/worksite/' in row['path']]
assert len(materials) == 48
for row in materials:
    protected[row['path']] = row
for row in protected.values():
    actual = pin(row['path'])
    assert (actual['sha256'], actual['byteCount']) == (row['sha256'], row['byteCount']), row['path']
absent_paths = read(old_phase / 'execution-observations.json')['material']['absentPaths']
assert len(absent_paths) == 1
assert all(not Path(path).exists() for path in absent_paths)

request = read(phase / 'calls/continuation-start.request.jsonl')['invocation']
source = request['resources']['source']['basis']
with store.open('rb') as stream:
    stream.seek(1387241127)
    old_bytes = stream.read(1813642)
    assert hashlib.sha256(old_bytes).hexdigest() == '46291356d40ed3b4dcfb040913fd51576a3dda2e3888f3780e4fd19d15d81178'
    old_parent = json.loads(old_bytes)['payload']['value']
    stream.seek(config['sourcePrefixLength'])
    appended_bytes = stream.read(prefix['prefixLength'] - config['sourcePrefixLength'])
physical_rows = [json.loads(line) for line in appended_bytes.splitlines()]
# Select coordinates from the actual codec envelope; do not reconstruct its shared body.
events = [row['event'] if row.get('kind') == 'abg_admitted_body_reference_record' else row for row in physical_rows]
assert len(events) == 78 and events[-1]['admissionOrdinal'] == 176069
source_event = next(e for e in events if e['admissionOrdinal'] == 175993)
admitted_source = source_event['payload']['sourceResultBasis']
assert admitted_source == source
assert source['sourceResultValue'] == old_parent == request['invocation']['request']['input']['value']
assert len(old_parent['observations']) == 30 and old_parent['terminal'] is False
assert source_event['payload']['rawInputDigest'] == source['sourceResultValueDigest']
assert source_event['payload']['publicRequestInvocationRef'] == setup['publicInvocationRef']
assert source_event['payload']['workspaceBindingId'] == setup['workspaceBinding']['ref']
assert source_event['payload']['workspaceBindingDigest'] == setup['workspaceBinding']['digest']
assert source_event['payload']['programDigest'] == setup['program']['digest']
assert source_event['payload']['catalogViewDigest'] == setup['view']['digest']
binding = next(e for e in events if e['admissionOrdinal'] == 176041)['payload']
paths = binding['paths']
transport = read(paths['transport'])
assert transport['status'] == 1 and transport['terminationConfirmed'] is True
assert transport['exitObserved'] is True and transport['timedOut'] is False and transport['signal'] is None
raw_rows = [json.loads(line) for line in Path(paths['stdout']).read_text().splitlines()]
error = next(r for r in raw_rows if r.get('error') == 'authentication_failed')
final = next(r for r in raw_rows if r.get('type') == 'result')
assert final['is_error'] is True and final['duration_api_ms'] == 0 and final['total_cost_usd'] == 0
assert all(final['usage'][k] == 0 for k in ['input_tokens', 'output_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens'])
new_results = [e for e in events if e['kind'] == 'c_call_result_admitted']
initial_result = next(e for e in new_results if e['admissionOrdinal'] == 176008)['payload']
assert initial_result['resultClass'] == 'success' and initial_result['valueDigest'] == source['sourceResultValueDigest']
assert next(e for e in new_results if e['admissionOrdinal'] == 176063)['payload']['resultClass'] == 'failure'

processes = {}
for pid in [config['recorderPID'], config['launcherPID'], config['cliPID'], 68147]:
    try:
        os.kill(pid, 0)
        processes[str(pid)] = 'present'
    except ProcessLookupError:
        processes[str(pid)] = 'ESRCH'
assert set(processes.values()) == {'ESRCH'}
groups = {}
for pgid in [config['cliPID'], 68147]:
    try:
        os.killpg(pgid, 0)
        groups[str(pgid)] = 'probe_present'
    except ProcessLookupError:
        groups[str(pgid)] = 'ESRCH'
assert set(groups.values()) == {'ESRCH'}
lock = Path(read(phase / 'execution-activation.json')['selectedLockPath'])
assert not lock.exists()
final_stat = store.stat()
assert (initial_stat.st_dev, initial_stat.st_ino, initial_stat.st_size, initial_stat.st_mtime_ns) == (
    final_stat.st_dev, final_stat.st_ino, final_stat.st_size, final_stat.st_mtime_ns)

offset = config['sourcePrefixLength']
selected = []
for line, event in zip(appended_bytes.splitlines(keepends=True), events):
    if event['admissionOrdinal'] in [175993, 175996, 176008, 176028, 176041, 176043, 176057, 176059, 176063, 176069]:
        selected.append({'path': str(store), 'ordinal': event['admissionOrdinal'], 'kind': event['kind'],
                         'eventId': event['eventId'], 'eventTime': event['eventTime'], 'offset': offset,
                         'byteCount': len(line), 'sha256': hashlib.sha256(line).hexdigest()})
    offset += len(line)
commands = {}
for name in ['continuation-outer', 'lifecycle-continuation']:
    d = read(phase / 'commands' / (name + '.result.json'))
    commands[name] = {k: d.get(k) for k in ['started', 'wallMs', 'exitCode', 'signal', 'timedOut', 'truncated', 'failure']}
facts = {
    'status': 'STOPPED_FROZEN_PROVIDER_AUTH_FAILURE', 'at': now(),
    'basis': 'Fixed15 ABI5/GOAL035/T287/STDO2.5.1rc2; same accepted24/Program/View/W/source-result continuation',
    'frames': read(phase / 'execution-activation.json')['frame'],
    'nativeClock': {k: config[k] for k in ['nativeT0', 'qualityCheckpointUTC', 'qualityCheckpointAEDT', 'driverDeadlineUTC']},
    'run': resources['run'], 'publicInvocationRef': setup['publicInvocationRef'],
    'firstCause': {'source': pin(paths['stdout']), 'error': error['error'],
                   'literalDiagnostic': 'Not logged in · Please run /login',
                   'timestamp': error.get('timestamp'), 'phase': 'Provider authentication before model tokens; credential/launch-environment cause unresolved'},
    'downstream': {'actorFailureOrdinal': 176059, 'governanceFailureOrdinal': 176063,
                   'runtimeFailureOrdinal': 176069, 'runtimeDiagnostic': 'diagnostic://abiogenesis/hog/application-foldback-mismatch@5'},
    'provider': {k: final.get(k) for k in ['duration_ms', 'duration_api_ms', 'num_turns', 'total_cost_usd', 'usage', 'is_error', 'terminal_reason']},
    'transport': {k: transport.get(k) for k in ['disposition', 'status', 'signal', 'timedOut', 'exitObserved', 'terminationConfirmed', 'failureClass', 'toolCallCount']},
    'artifacts': [pin(paths[k]) for k in ['prompt', 'stdout', 'stderr', 'output', 'transport']],
    'nativeOutcome': {'disposition': owner['disposition'], 'terminalResult': owner['terminalResult'], 'result': owner['result'], 'stop': owner['stop']},
    'sourceConservation': {'admittedOrdinal': 175993, 'initialStateResultOrdinal': 176008, 'initialStateResultRef': initial_result['resultRef'],
                           'initialStateValueDigest': initial_result['valueDigest'], 'sourceBasisRef': source['basisRef'], 'sourceResultRef': source['sourceResultRef'],
                           'sourceResultValueDigest': source['sourceResultValueDigest'], 'fullValueDeepEqualOriginalParentAndPreparedInput': True,
                           'observations': 30, 'terminal': False, 'sameProgramViewWorkspace': True,
                           'priorActualDetections': 12, 'priorExactRestorations': 12, 'priorRestoredGreenTests': 44,
                           'requiredDistinctMutants': 16, 'newModelOrApplicationProofCredit': 0},
    'conservation': {'immutableSelectedPins': len(protected), 'matchedPins': len(protected), 'materialFilePins': len(materials),
                     'preservedObservedAbsencePaths': absent_paths,
                     'oldParentSliceSHA256': hashlib.sha256(old_bytes).hexdigest(), 'appendBytes': len(appended_bytes),
                     'appendSHA256': hashlib.sha256(appended_bytes).hexdigest(), 'appendEvents': len(events),
                     'lastOrdinal': events[-1]['admissionOrdinal'], 'finalCloseHandoff': pin(phase / 'final-close-handoff.json'),
                     'finalPrefix': prefix, 'storeStatStableDuringClosureCheck': True,
                     'wholeLogDigestBasis': 'Authentic normal owner closeHandoff; no redundant whole-log hash/copy/replay'},
    'processClosure': {'observedPIDs': processes, 'ownedPGIDs': groups, 'selectedLockPath': str(lock),
                       'selectedLockAbsent': True, 'operatorSignals': 0, 'scope': 'Exact observed owned PIDs/PGIDs; no global containment inference'},
    'commands': commands, 'selectedEventSlices': selected,
    'memory': {'highestObservedNativeRSSKiB': read(phase / 'execution-read-cursor.json')['highestObservedNativeRSSKiB'],
               'claim': 'RSS sample only; retained heap and peak unspecified; no allocator/OOM attribution'},
    'limits': ['No provider retry/auth repair, state edit, copy/reset, source change, invented exit or evidence credit.',
               'No new selected job or app work; four distinct INV obligations and original full UAT remain open.',
               'Fresh separate Public readbacks/original oracle not re-invoked after first provider failure; normal execution receipt only.']
}
write('execution-readiness.json', facts)
with (phase / 'execution-return.md').open('x') as stream:
    stream.write('Operator130 stopped after genuine same24/sameW admitted_source_result ingress. The original complete 30-observation state was admitted byte-for-value, preserving 12 detections, 12 exact restorations and 44-test green evidence. No fresh application or mutation work occurred.\n\n'
                 'First cause: provider authentication_failed, "Not logged in · Please run /login", before model tokens/API time/cost. Actual provider exit1 was admitted; downstream governance implementation_exception and application-foldback-mismatch remain separately recorded. Credential/launch-environment cause is unresolved. No retry or auth repair.\n\n'
                 'Normal owner receipt: runtime_failed, terminalResult:null. Native/outer exit0, no timeout/truncation/signal, walls146170.954292/146206.370625ms; CLI0 earns no UAT pass. Actual new T0 2026-10-08T22:23:07.345Z; five-hour quality checkpoint03:23:07.345Z/14:23:07.345 AEDT remains recorded, with prior clock preserved.\n\n'
                 'Exact observed recorder/launcher/CLI/provider and their selected process groups are absent; selected event lock released. Protected selected source/preparation/install pins and all48 worksite files match. Final closeHandoff binds1402366875B/176069 events; preserved old175991 prefix and3855709B appended slice are evidenced without whole-log copying/rehashing/replay.\n\n'
                 'See execution-readiness.json for literal closed artifacts, full event slice hashes, source/Run joins, commands and scope limits; execution-freeze.json pins the subject. Full16 defect/restoration requirement, full original UAT, fresh separate Public readbacks and P0/qualification remain unearned. Stop all execution effects pending Root triage.\n')
ledger = {path: {'path': path, 'sha256': row['sha256'], 'byteCount': row['byteCount']} for path, row in protected.items()}
for path in phase.rglob('*'):
    if path.is_file() and path.name != 'execution-freeze.json':
        ledger[str(path.resolve())] = pin(path)
for row in facts['artifacts']:
    ledger[row['path']] = row
ledger[str(store)] = {'path': str(store), 'sha256': prefix['prefixDigest'].removeprefix('sha256:'),
                      'byteCount': prefix['prefixLength'], 'device': initial_stat.st_dev, 'inode': initial_stat.st_ino,
                      'digestBasis': 'Exact normal owner closeHandoff at whole current prefix; stat-bound, not independently rehashed'}
write('execution-freeze.json', {'status': 'FROZEN_STOPPED', 'at': now(), 'classification': 'Runtime source ingress then provider authentication failure; no UAT or new app credit',
                               'ledger': list(ledger.values()), 'prefix': prefix, 'lastOrdinal': 176069, 'selectedEventSlices': selected})
for name in ['execution-return.md', 'execution-readiness.json', 'execution-freeze.json']:
    print(json.dumps(pin(phase / name)))
