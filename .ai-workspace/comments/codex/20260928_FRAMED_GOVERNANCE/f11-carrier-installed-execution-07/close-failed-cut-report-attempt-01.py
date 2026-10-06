from pathlib import Path
from datetime import datetime, timezone
from collections import Counter
import hashlib
import json
import os
import stat
import time

root = Path(__file__).resolve().parent
started = time.monotonic()
def read(name):
    return json.loads((root / name).read_text())
def sha_file(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()
def canonical(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()
def write(name, value):
    with (root / name).open('x') as f:
        json.dump(value, f, indent=2)
        f.write('\n')
def pin(path):
    path = Path(path)
    s = path.lstat()
    return {'path': str(path), 'bytes': s.st_size, 'sha256': sha_file(path), 'mode': stat.S_IMODE(s.st_mode)}
def inventory(directory):
    records, dirs = [], []
    for current, children, names in os.walk(directory, followlinks=False):
        children.sort()
        names.sort()
        for name in list(children) + names:
            p = Path(current) / name
            s = p.lstat()
            row = {'path': str(p.relative_to(directory)), 'mode': oct(stat.S_IMODE(s.st_mode))}
            if stat.S_ISLNK(s.st_mode):
                row.update(kind='symlink', target=os.readlink(p))
                records.append(row)
                if name in children:
                    children.remove(name)
            elif stat.S_ISDIR(s.st_mode):
                row.update(kind='directory')
                dirs.append(row)
            elif stat.S_ISREG(s.st_mode):
                row.update(kind='file', bytes=s.st_size, sha256=sha_file(p))
                records.append(row)
            else:
                row.update(kind='nonregular')
                records.append(row)
    return sorted(records, key=lambda r:r['path']), sorted(dirs, key=lambda r:r['path'])
def probe(identifier, group=False):
    try:
        (os.killpg if group else os.kill)(identifier, 0)
        return 'present'
    except ProcessLookupError:
        return 'absent'
    except PermissionError:
        return 'unobservable_permission'

activation = read('runtime-activation.json')
assert activation['operation'] == 'T287_F11_C06_CARRIER_EXECUTION_07'
failure = read('first-failure.json')
supervisor = read('flow-supervisor-close.json')
assert supervisor['exitCode'] == 1 and not supervisor['timedOut']
assert supervisor['wait4ReapedMain'] and supervisor['processGroupAfterWait'] == 'absent'
assert len(supervisor['knownCLIProcessGroups']) == 1
assert all(x['before'] == x['afterTERM'] == 'absent' for x in supervisor['knownCLIProcessGroups'])
parent = read('flow-parent-host-receipt.json')
value = parent['ownerOutput']['value']
assert parent['exitCode'] == 0 and parent['ownerOutput']['outcomeKind'] == 'result'
assert value['disposition'] == 'runtime_failed' and value['terminalResult'] is None
assert len(failure['calls']) == 1 and failure['calls'][0]['label'] == 'parent'
assert not list(root.glob('flow-*-run_result-command.json'))
assert not list(root.glob('flow-*-run_replay-command.json'))

plan = read('resource-plan.json')
handoff = failure['latestActualClosedHandoff']
event = Path(plan['eventLogPath'])
before = event.stat()
body = event.read_bytes()
after = event.stat()
assert (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns) == (after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)
original = (root / 'setup06-initial-durable-prefix.bin').read_bytes()
assert len(original) == plan['initialPrefixBytes'] == 2490814
assert hashlib.sha256(original).hexdigest() == plan['initialPrefixSha256']
assert body[:len(original)] == original
assert after.st_dev == plan['eventDevice'] == 16777230
assert after.st_ino == plan['eventInode'] == 464698960
event_sha = hashlib.sha256(body).hexdigest()
assert len(body) == handoff['prefix']['prefixLength'] == handoff['reopenAuthority']['durableByteLength']
assert 'sha256:' + event_sha == handoff['prefix']['prefixDigest'] == handoff['reopenAuthority']['eventLogDigest']
lock = root / 'task-tmp/abiogenesis-event-store-locks-v5' / f'{after.st_dev}-{after.st_ino}.lock'
assert not lock.exists()
(root / 'closed-runtime-events.jsonl').write_bytes(body)
(root / 'appended-durable-records.bin').write_bytes(body[len(original):])
rows = [json.loads(line) for line in body[len(original):].splitlines()]
events = [e for e in rows if e['kind'] != 'abg_admitted_body_reference_record']
child_failure = next(e for e in events if e['kind'] == 'c_call_result_admitted' and e['payload']['value'].get('failureClass') == 'assessment_transport_mismatch')
parent_failure = next(e for e in events if e['kind'] == 'c_call_result_admitted' and e['payload']['value'].get('failureClass') == 'child_traversal_failed')
fold = next(e for e in events if e['kind'] == 'child_foldback_admitted')
stop = next(e for e in events if e['kind'] == 'run_stopped')
native = next(e for e in events if e['kind'] == 'c_call_evidenced' and e['payload'].get('evidenceClass') == 'probabilistic_transport')
binding = next(e for e in events if e['kind'] == 'actor_transport_binding_admitted')
actor_started = next(e for e in events if e['kind'] == 'actor_invocation_started')
process_started = next(e for e in events if e['kind'] == 'actor_process_started')
process_exited = next(e for e in events if e['kind'] == 'actor_process_exited')
artifact = next(e for e in events if e['kind'] == 'actor_result_artifact_observed')
actor_failure = next(e for e in events if e['kind'] == 'actor_invocation_failed')
assert fold['payload']['childDisposition'] == 'failed' and fold['payload']['childClosureRef'] is None
assert not any(e['kind'] in ['graph_call_closed','run_closed'] for e in events)
assert all(e['payload']['resultClass'] == 'failure' for e in events if e['kind'] == 'c_call_result_admitted')
assert native['payload']['nativeResultAssessment']['disposition'] == 'rejected'
assert native['payload']['nativeResultAssessment']['verification'] is None
assert native['payload']['transportFailureClass'] == 'contract_failure'
assert process_exited['payload']['status'] == 0 and process_exited['payload']['signal'] is None
assert binding['payload']['command'] == str(root / 'controlled-helper.mjs')

transport_path = Path(binding['payload']['paths']['transport'])
transport = json.loads(transport_path.read_text())
assert transport['disposition'] == 'failure' and transport['failureClass'] == 'contract_failure'
assert transport['exitObserved'] and transport['terminationConfirmed'] and not transport['timedOut']
assert transport['toolCallCount'] == transport['apiRetryCount'] == 0
request_pin = read('assessment-owner-request-pin.json')
response_binding = read('controlled-response-binding.json')
assert actor_started['payload']['requestDigest'] == request_pin['requestDigest']
assert actor_started['payload']['promptDigest'] == request_pin['promptDigest']
assert transport['artifacts']['prompt']['byteLength'] == request_pin['promptUtf8Bytes'] == response_binding['promptUtf8Bytes'] == 349314
assert transport['artifacts']['prompt']['digest'] == 'sha256:' + response_binding['promptUtf8SHA256']
helper_pid = process_started['payload']['processId']
helper_presence = {'processId':helper_pid,'processProbeAfterExit':probe(helper_pid),'groupProbeUsingProcessId':probe(helper_pid, True),'groupIdentity':'not separately published; process-id group probe does not assert that this PID was its own PGID','ownerProcessExited':process_exited,'ownerTerminationConfirmed':transport['terminationConfirmed'],'actorWait4':'not separately instrumented; native owner exit/termination evidence retained'}
assert helper_presence['processProbeAfterExit'] == 'absent'
actor_paths = binding['payload']['paths']
actor_pins = {name:pin(path) for name,path in actor_paths.items()}
for name,row in transport['artifacts'].items():
    assert row['byteLength'] == actor_pins[name]['bytes']
    assert row['digest'] == 'sha256:' + actor_pins[name]['sha256']
parsed_output = json.loads(Path(actor_paths['output']).read_text())
controlled_raw = read('controlled-raw-response.json')
assert parsed_output == controlled_raw
assert all(c['disposition'] == 'indeterminate' and c['applicability'] == c['grouping'] == 'unknown' for c in parsed_output['criteria'])
assert all(a['disposition'] == 'insufficient' for a in parsed_output['attributions'])
write('actual-actor-transport-evidence.json', {'kind':'read_only_actual_controlled_actor_failure_evidence','request':request_pin,'controlledBinding':response_binding,'actualTransportBinding':binding,'actorStarted':actor_started,'processStarted':process_started,'processExited':process_exited,'actorArtifactObserved':artifact,'actorFailure':actor_failure,'nativeEvidence':native,'actualTransport':transport,'artifactPins':actor_pins,'helperClosure':helper_presence,'rawReplyBodyEqualToControlledUnknownInput':True,'independentSemanticAssessment':False,'realProviderCalls':0,'unresolved':'Exact native raw-result admission predicate behind rejected/null verification requires Root independent localization; this closure performs no owner imports or predicate retries'})
write('appended-runtime-records.json', {'kind':'exact_read_only_appended_durable_record_snapshot','records':rows,'recordCount':len(rows),'runtimeEvents':len(events),'bodyReferenceRecords':len(rows)-len(events),'kindCounts':dict(Counter(e['kind'] for e in rows)),'originalPrefixBytes':len(original),'appendedBytes':len(body)-len(original)})
write('first-violated-relations.json', {'status':'STOPPED_NO_REPAIR','earliestObservedOwnerRefusal':{'boundary':'native F_P worker raw-result admission after actual controlled helper exit','ownerPredicate':'native_worker_result_assessment disposition rejected / verification null; transport contract_failure','actualNativeEvidence':native,'actualActorFailure':actor_failure,'actualChildFailure':child_failure,'actualFailedFoldback':fold,'actualParentFailure':parent_failure,'actualRunStop':stop},'childDiagnostic':child_failure['payload']['value']['diagnosticRef'],'PublicBoundary':{'outcomeKind':'result','exitCode':0,'runDisposition':'runtime_failed','terminalResult':None,'run':value['run']},'flowGate':'Strict completed disposition plus typed terminal Result required; Q08 driver stopped before cold reads/F11/AF22','requestAndPrompt':'Actual child request and complete prompt match the current owner-produced preparation; helper consumed the exact prompt and emitted the controlled unknown/insufficient raw body','sourceLocalization':'not performed by this Runtime Worker','missingDownstream':['successful qualification J','child and parent graph closures','RunClosed','six fresh CLI reads','fresh F11 consuming the original J','sole truthful non-green AF22','nearest supported negatives'],'afterResultBeforeJ':'unsupported authoritative cut remains unknown'})

physical = {'path':str(event),'bytes':len(body),'sha256':event_sha,'device':after.st_dev,'inode':after.st_ino,'mode':oct(stat.S_IMODE(after.st_mode))}
handoff_digest = canonical(handoff)
write('closed-event-resource-handoff.json', {'status':'CLOSED_AUTHENTIC_FAILED_RUN','closeHandoff':handoff,'handoffDigest':handoff_digest,'physical':physical,'stableAfterSupervisorClose':True,'eventLockPresent':False,'originalPrefix':{'bytes':len(original),'sha256':hashlib.sha256(original).hexdigest(),'saved':'setup06-initial-durable-prefix.bin','byteExactPrefix':True,'sameDeviceInode':True},'authorizedEffect':{'appendedBytes':len(body)-len(original),'appendedRecords':len(rows),'failedRuns':1,'PublicCalls':1,'controlledHelperLaunches':1,'realProviderCalls':0},'latestLawfulSource':'actual returned parent invocation resource closeHandoff; strict gate made no later invocation','reopen':'requires separate Root activation; this Worker stops writes'})

preserved = []
for old in read('preimages.json')['pins']:
    actual = pin(old['path'])
    preserved.append({'expected':old,'actual':actual,'unchanged':actual['bytes'] == old['bytes'] and actual['sha256'] == old['sha256']})
assert all(p['unchanged'] for p in preserved)
initial_entries = read('setup06-initial-entry-pins.json')['records']
old_entry_results = []
old_names = set()
for row in initial_entries:
    p = Path(row['path'])
    old_names.add(str(p))
    s = p.lstat()
    actual = {'bytes':s.st_size,'mode':stat.S_IMODE(s.st_mode),'device':s.st_dev,'inode':s.st_ino,'mtimeNs':s.st_mtime_ns}
    if p == event:
        unchanged = s.st_dev == row['device'] and s.st_ino == row['inode'] and s.st_size >= row['bytes'] and actual['mode'] == row['mode']
        role = 'sole authorized ABG append; old prefix separately byte-exact'
    else:
        unchanged = all(actual[k] == row[k] for k in actual)
        role = 'accepted body identity reused with unchanged physical member coordinates'
    old_entry_results.append({'path':str(p),'unchanged':unchanged,'role':role,'actual':actual})
assert all(r['unchanged'] for r in old_entry_results)
setup = Path(read('driver-config.json')['actualSetupRoot'])
new_members, current_directories = [], []
for current, children, names in os.walk(setup, followlinks=False):
    children.sort()
    names.sort()
    for name in list(children) + names:
        p = Path(current) / name
        s = p.lstat()
        if stat.S_ISDIR(s.st_mode):
            current_directories.append({'path':str(p),'mode':oct(stat.S_IMODE(s.st_mode))})
        elif str(p) not in old_names:
            assert stat.S_ISREG(s.st_mode),str(p)
            new_members.append(pin(p))
write('owner-resource-census.json', {'kind':'complete_actual_Setup06_existing_member_conservation_and_new_owner_members','acceptedSetupFreeze':activation['Setup06Freeze'],'originalMembers':old_entry_results,'currentDirectories':current_directories,'newOwnerMembers':new_members,'eventResource':physical,'oldBodyProof':'prior accepted complete Setup06 byte assurance reused; unchanged inode/size/mode/mtime for every old member except separately proven ABG prefix append','fullOldPayloadRehashOrRecopy':False})
write('conservation.json', {'status':'passed','finitePreimagePins':preserved,'selectedSetup06Entries':len(old_entry_results),'allPriorSetup06EntriesUnchangedExceptAuthorizedABGAppend':True,'newOwnerEntries':len(new_members),'originalEventPrefixByteExact':True,'sameDeviceInode':True,'allOtherOldStores':'no operation targeted them; read-only','qualifiedInputAuthority':'exact Root acceptance verified before owner imports; Q08 source and original authorship unchanged','sourceGitNetworkProviderSetupInstallWorksiteCatalogEffects':0,'RuntimeRetryOrSourcePatch':False})
native_process = read('flow-parent-native-process.json')
timing = read('flow-parent-timing.json')
assert native_process['exitCode'] == timing['terminal']['code'] == 0
assert not timing['terminal']['timedOut']
write('accounting.json', {'status':'CLOSED_FIRST_FAILURE','supervisor':supervisor,'nominal':read('nominal-preflight-completion.json'),'actualPublicCalls':1,'calls':[{'label':'parent','hostReceipt':parent,'ownerOutcome':read('flow-parent-owner-outcome.json'),'publicDisposition':read('flow-parent-public-disposition.json'),'timing':timing,'nativeProcess':native_process,'requestBytes':(root/'flow-parent.jsonl').stat().st_size}],'successfulRunClosures':0,'failedRunStops':1,'successfulQualificationJ':0,'failureResultAdmissions':2,'failureJudgments':sum(e['kind']=='c_call_judged' for e in events),'failedChildFoldbacks':1,'attemptedColdReads':0,'successfulColdReads':0,'F11Runs':0,'AF22Runs':0,'nearestNegatives':'not executed after first actual failure','controlledHelperLaunches':1,'helperProcess':helper_presence,'actualActorArtifacts':actor_pins,'realProviderCalls':0,'inputResourceFileBytes':(root/'f11-bound-resource-manifest.json').stat().st_size,'inputPacketBytes':(root/'f11-bound-packet.json').stat().st_size,'promptUtf8Bytes':request_pin['promptUtf8Bytes'],'controlledRawResponseBytes':(root/'controlled-raw-response.json').stat().st_size,'appendedEventBytes':len(body)-len(original),'peakWait4RSSBytes':supervisor['rssBytes'],'costCause':'Observed integrated peak; no OOM or timeout; no memory cause inferred for the native contract refusal','heap':'default; unchanged','HOME':supervisor['HOME'],'knownProcessClosure':'main and native CLI wait4 receipts, recorded groups absent; helper exit/termination evidence and absent PID probe retained','unknowns':['actor wait4 and PGID not separately published','internal canonicalization/hash/body transformation counts not fully instrumented','ambient process population not enumerated','all downstream carrier and genuine semantic/release obligations remain unproved'],'reportClosureElapsedMsAtAccounting':(time.monotonic()-started)*1000,'additionalRuntimeCallsAfterFirstFailure':0})
write('closure.json', {'status':'CLOSED','role':'Runtime Worker','operation':activation['operation'],'actor':'/root/native_applicability_design','returnRole':'Executive after CLOSED; no mutation authority','workResult':'NO_GO_FIRST_NATIVE_ASSESSMENT_RAW_RESULT_CONTRACT_FAILURE','resourceHandoff':'closed-event-resource-handoff.json','resourceHandoffDigest':handoff_digest,'firstFailure':'first-violated-relations.json','firstChildPredicate':'assessment_transport_mismatch after native_worker_result_assessment rejected/null verification and transport contract_failure','effects':{'actualPublicCalls':1,'ABGAppendedRecords':len(rows),'ABGAppendedBytes':len(body)-len(original),'controlledHelperLaunches':1,'realProviderCalls':0,'failedChildResult':child_failure['payload']['resultRef'],'failedParentResult':parent_failure['payload']['resultRef'],'run':value['run'],'runDisposition':value['disposition'],'coldReads':0,'F11AF22Runs':0,'sourceSetupGitNetworkQualificationCommands':0},'actualRootActor':activation['actorRef'],'remaining':'successful wrapper child/J/foldback/parent RunClosed; six fresh agreeing cold reads; fresh F11 and sole truthful non-green AF22; nearest supported negatives; genuine assessment/qualification/scenario/release obligations','afterResultBeforeJ':'unsupported authoritative cut remains unknown','sourceConservation':'conservation.json','allWritesAfterFreeze':'STOPPED','ReviewerActivation':False})
with (root/'return.md').open('x') as f:
    f.write(f'''CLOSED — first actual native assessment raw-result contract failure; no repair or retry.

The wrapper Public invocation returned result/exit 0 carrying runtime_failed and terminalResult:null. The actual core F_P child reached controlled actor dispatch. Its current owner request {request_pin['requestDigest']} and complete {request_pin['promptUtf8Bytes']}-byte prompt matched Q08 preparation. The controlled helper (PID {helper_pid}) consumed the exact prompt, emitted the selected unknown/indeterminate criteria and insufficient attributions, and exited 0 without retries, tools or real provider calls. The native worker-result owner rejected that actual output: native_worker_result_assessment disposition rejected, verification:null, transport failureClass:contract_failure. The child admitted assessment_transport_mismatch ({child_failure['eventId']}); ordinary failed foldback retained childClosureRef:null, the parent admitted child_traversal_failed, and ABG admitted run_stopped. No successful qualification J, graph closure or RunClosed occurred. Exact underlying owner predicate localization remains Root work; this Runtime Worker imported no source and performed no predicate retry.

The strict Q08 flow gate stopped before any cold reads, fresh F11, AF22 or nearest negatives. Full actual request, Public disposition, owner outcome, host receipt, native process, actor archives, raw response, transport, Result/failure judgments, foldback and stopped Run are retained. actual-actor-transport-evidence.json and first-violated-relations.json bind the exact evidence.

Supervision completed in {supervisor['elapsedMs']/1000:.3f}s, no timeout, default heap/HOME unchanged. Peak wait4 RSS was {supervisor['rssBytes']} bytes; no OOM cause is inferred. Main and parent CLI groups are absent with wait4 receipts. The helper has an admitted exit/confirmed termination and an absent PID probe; its independent wait4/PGID and ambient process population were not separately instrumented.

Original Setup06 prefix is byte-exact: {len(original)} bytes / SHA256 {plan['initialPrefixSha256']} / device {after.st_dev} / inode {after.st_ino}. ABG appended {len(body)-len(original)} bytes / {len(rows)} physical records ({len(events)} Runtime events). Latest authentic closed event resource is {len(body)} bytes / SHA256 {event_sha}; prefix {handoff['prefix']['coordinateDigest']}; handoff {handoff_digest}. It is stable, has the original inode and no event lock. closed-event-resource-handoff.json carries actual reopen authority; closed-runtime-events.jsonl retains the complete physical event cut. Every prior Setup06 member has unchanged physical coordinates except this separately proven ABG append. Exact accepted prior body assurance and all source/authorship pins are reused. New owner artifact members are completely enumerated.

There was no setup/install/catalog/worksite/source/Git/network/real-provider/18-command campaign effect, retry or append to other old stores. Successful child/J/foldback/parent RunClosed, all six cold reads, fresh F11, sole truthful non-green AF22 and nearest supported negatives remain outstanding. Genuine assessment/context/attribution sufficiency, qualification and release remain unproved. Worker is CLOSED; all writes stop after final-runtime-freeze.json. Root alone selects re-entry.
''')
records, directories = inventory(root)
assert not any(r['kind']=='nonregular' for r in records)
freeze = {'status':'CLOSED','role':'Runtime Worker','operation':activation['operation'],'actor':'/root/native_applicability_design','frozenAt':datetime.now(timezone.utc).isoformat(),'returnRole':'Executive after CLOSED; no mutation authority','workResult':'NO_GO_FIRST_NATIVE_ASSESSMENT_RAW_RESULT_CONTRACT_FAILURE','return':'return.md','closure':'closure.json','firstFailure':'first-violated-relations.json','resourceHandoff':'closed-event-resource-handoff.json','resourceHandoffDigest':handoff_digest,'recordCount':len(records),'bodyBytes':sum(r.get('bytes',0) for r in records),'directoryCount':len(directories),'symlinks':sum(r['kind']=='symlink' for r in records),'records':records,'directories':directories,'authenticExternalEventResource':physical,'completeExternalCurrentResourceCensus':'owner-resource-census.json','externalOriginalActorArtifactPins':actor_pins,'copiedPreparationFreeze':'freeze.json is a byte-exact Q08 input-control replica, never this Runtime cut','excludedSelf':'final-runtime-freeze.json only','reportClosureElapsedMsToInventory':(time.monotonic()-started)*1000,'noFurtherWrites':True}
write('final-runtime-freeze.json', freeze)
print(json.dumps({'status':'CLOSED','freeze':pin(root/'final-runtime-freeze.json'),'recordCount':len(records),'bodyBytes':freeze['bodyBytes'],'directories':len(directories),'symlinks':freeze['symlinks'],'resourceHandoffDigest':handoff_digest,'event':physical,'prefix':handoff['prefix']['coordinateDigest'],'primary':'assessment_transport_mismatch / native raw-result rejected-null / transport contract_failure','runtimeElapsedMs':supervisor['elapsedMs'],'controlledHelperLaunches':1,'realProviderCalls':0,'coldReads':0}))
