"""One self-contained saved-evidence finalizer. No Product imports or Runtime calls."""
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter
import hashlib, json, os, stat, time, shutil, resource

root = Path(__file__).resolve().parent
began = time.monotonic()

def read(name):
    return json.loads((root / name).read_text())

def write(name, value):
    with (root / name).open('x') as f:
        json.dump(value, f, indent=2, ensure_ascii=False)
        f.write('\n')

def sha_file(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
    return h.hexdigest()

def canonical(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()

def pin(path):
    p = Path(path); s = p.stat()
    return {'path':str(p),'bytes':s.st_size,'sha256':sha_file(p),'mode':oct(stat.S_IMODE(s.st_mode))}

def inventory(directory):
    files, directories = [], []
    for current, dirs, names in os.walk(directory, followlinks=False):
        dirs.sort(); names.sort()
        for name in list(dirs) + names:
            p = Path(current) / name; s = p.lstat()
            row = {'path':str(p.relative_to(directory)),'mode':oct(stat.S_IMODE(s.st_mode))}
            if stat.S_ISLNK(s.st_mode):
                row.update(kind='symlink',target=os.readlink(p)); files.append(row)
                if name in dirs: dirs.remove(name)
            elif stat.S_ISDIR(s.st_mode):
                row.update(kind='directory'); directories.append(row)
            elif stat.S_ISREG(s.st_mode):
                row.update(kind='file',bytes=s.st_size,sha256=sha_file(p)); files.append(row)
            else:
                row.update(kind='nonregular',physicalType=stat.S_IFMT(s.st_mode)); files.append(row)
    return sorted(files,key=lambda r:r['path']), sorted(directories,key=lambda r:r['path'])

def absent_pid(pid, group=False):
    try:
        (os.killpg if group else os.kill)(pid,0)
        return 'present'
    except ProcessLookupError:
        return 'absent'
    except PermissionError:
        return 'unobservable_permission'

activation = read('runtime-activation.json')
operation = activation['operation']
assert operation == 'T287_F11_C07_CARRIER_EXECUTION_08'
start = read('flow-supervisor-start.json')
supervisor = read('flow-supervisor-close.json')
failure = read('first-failure.json')
stop = read('selected-flow-stop.json')
receipt = read('flow-parent-stdout.json')['receipt']
plan = read('resource-plan.json')
preimages = read('preimages.json')
accepted = read('consumed-input-acceptance.json')['actualAcceptance']
write('report-finalizer-start.json',{'operation':operation,'at':datetime.now(timezone.utc).isoformat(),'pid':os.getpid(),'source':pin(__file__),'RuntimeImportsCalls':0,'basis':'actual saved producer bodies only; no partial-tail evaluation or transient locals'})
assert supervisor['wait4ReapedMain'] and supervisor['processGroupAfterWait'] == 'absent'
assert not supervisor['timedOut']
assert all(r['before'] == r['afterTERM'] == 'absent' for r in supervisor['knownCLIProcessGroups'])
assert len(failure['calls']) == 1 and stop['disposition'] == 'blocked'
assert receipt['exitCode'] == 0 and receipt['ownerOutput']['outcomeKind'] == 'result'
assert receipt['ownerOutput']['value']['disposition'] == 'blocked'
assert receipt['ownerOutput']['value']['terminalResult'] is None

event = Path(plan['eventLogPath']); before = event.stat(); body = event.read_bytes(); after = event.stat()
assert (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns) == (after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)
initial = (root/'setup07-initial-durable-prefix.bin').read_bytes()
assert len(initial) == plan['initialPrefixBytes']
assert hashlib.sha256(initial).hexdigest() == plan['initialPrefixSha256']
assert body.startswith(initial)
assert (after.st_dev,after.st_ino) == (plan['eventDevice'],plan['eventInode'])
physical = {'path':str(event),'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'device':after.st_dev,'inode':after.st_ino,'mode':oct(stat.S_IMODE(after.st_mode))}
handoff = failure['latestActualClosedHandoff']
assert handoff['prefix']['prefixDigest'] == 'sha256:'+physical['sha256']
assert handoff['prefix']['prefixLength'] == physical['bytes']
assert handoff['prefix']['storeIdentity']['inode'] == physical['inode']
assert handoff['reopenAuthority']['eventLogDigest'] == 'sha256:'+physical['sha256']
assert handoff['reopenAuthority']['durableByteLength'] == physical['bytes']
assert not Path(failure['physical']['lockPath']).exists()
with (root/'closed-runtime-events.jsonl').open('xb') as f: f.write(body)
appended = body[len(initial):]
with (root/'appended-durable-records.bin').open('xb') as f: f.write(appended)
rows = [json.loads(line) for line in appended.splitlines()]
events = [r for r in rows if r.get('kind') != 'abg_admitted_body_reference_record']
write('appended-runtime-records.json',{'records':rows,'recordCount':len(rows),'eventCount':len(events),'bodyReferenceRecordCount':len(rows)-len(events),'kindCounts':dict(Counter(r.get('kind') for r in rows))})
child = next(r for r in events if r.get('kind')=='c_call_result_admitted' and r.get('graphFunctionRef')=='graph-function://abiogenesis/qualification/assess@5')
judgment = next(r for r in events if r.get('kind')=='c_call_judged' and r.get('graphFunctionRef')=='graph-function://abiogenesis/qualification/assess@5')
foldback = next(r for r in events if r.get('kind')=='child_foldback_admitted')
parent_stop = next(r for r in events if r.get('kind')=='run_stopped')
actors = [r for r in events if r.get('kind','').startswith('actor_')]
bindings = [r for r in events if r.get('kind')=='actor_transport_binding_admitted']
artifact = next(r for r in actors if r['kind']=='actor_result_artifact_observed')
write('actual-actor-transport-evidence.json',{'events':actors,'transportBindings':bindings,'observation':'one controlled actor transport; success is not successful assessment Result/J admission'})
with (root/'actor-final-output.raw.json').open('x') as f: f.write(artifact['payload']['finalOutput'])
write('available-native-verification-inputs.json',{'actualTransportBindings':bindings,'actualCCallEvidence':[r for r in events if r.get('kind')=='c_call_evidenced'],'bodyReferenceRecords':[r for r in rows if r.get('kind')=='abg_admitted_body_reference_record'],'exactInvocationFile':pin(root/'flow-parent.jsonl'),'exactCurrentPacket':pin(root/'f11-bound-packet.json'),'exactCurrentResourceManifest':pin(root/'f11-bound-resource-manifest.json'),'cachedWorkerRequestUsed':False,'unknown':'pre-rejection compact candidate value is not separately reconstructed; preserve only actual available bodies and references'})
write('first-violated-relations.json',{'status':'stopped_first_actual_owner_failure','actualPublicOutcome':receipt['ownerOutput'],'publicExitCode':receipt['exitCode'],'strictCallerStop':stop,'childResultRefusal':child,'childJudgment':judgment,'foldback':foldback,'parentStop':parent_stop,'ownerPredicate':judgment['payload']['predicateRef'],'diagnostic':child['payload']['value']['diagnosticRef'],'rejectedStage':child['payload']['value']['rejectedStage'],'actualRunClosedCount':sum(r.get('kind')=='run_closed' for r in events),'successfulSemanticQualificationResultJ':'not established; admitted refusal Result/J preserved','sourceCause':'unknown; separate Root triangulation required','downstream':'no fresh CLI reads, F11, AF22 or mechanical negatives after the first failure'})

baseline = read('setup07-initial-entry-pins.json')
setup_root = Path(baseline['setupRoot'])
resource_root = setup_root/'resources'
actual_files, actual_dirs = inventory(resource_root)
actual = {'resources/'+r['path']:r for r in actual_files}
previous = {r['path']:r for r in baseline['records']}
missing = sorted(set(previous)-set(actual))
changed = []
for path in sorted(set(previous)&set(actual)):
    if path == 'resources/events/runtime.events.jsonl': continue
    old, new = previous[path], actual[path]
    if any(old.get(k)!=new.get(k) for k in ['kind','bytes','sha256','mode']): changed.append({'path':path,'before':old,'after':new})
new_entries = [dict(actual[p],path=p) for p in sorted(set(actual)-set(previous))]
actual_dir_map = {'resources/'+r['path']:r for r in actual_dirs}
directory_changes = [{'path':r['path'],'before':r,'after':actual_dir_map.get(r['path'])} for r in baseline['directories'] if r['path'] not in actual_dir_map or r['mode'] != actual_dir_map[r['path']]['mode']]
write('owner-resource-census.json',{'setupRoot':str(setup_root),'actualFiles':actual_files,'actualDirectories':actual_dirs,'regularFiles':sum(r['kind']=='file' for r in actual_files),'symlinks':sum(r['kind']=='symlink' for r in actual_files),'nonregular':sum(r['kind']=='nonregular' for r in actual_files),'initialFiles':len(previous),'initialMissing':missing,'initialChangedExceptAuthorizedEventAppend':changed,'initialDirectoryChanges':directory_changes,'newOwnerEntries':new_entries,'event':physical,'originalEventPrefixUnchanged':True,'method':'one final complete body/mode census against accepted Setup07; prior Root full assurance reused before Runtime'})
assert not missing and not changed and not directory_changes
assert not any(r['kind']!='file' for r in actual_files)
captures = []
for entry in new_entries:
    path = setup_root/entry['path']
    if entry['bytes'] <= 4*1024*1024:
        target = root/'owner-evidence'/entry['path']; target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(path,target); os.chmod(target,int(entry['mode'],8))
        captures.append({'original':str(path),'copy':pin(target),'bodyExact':True})
write('available-owner-archive-copies.json',{'copiedNewSmallOwnerFiles':captures,'allNewOwnerFilesPinned':'owner-resource-census.json','largeBodyEvidence':'retained actual owner file pins, copied full invocation and current qualification resource manifest; no reconstruction'})

conserved = []
for original in preimages['finiteDependencyPins']+[preimages['exactRelease'],preimages['grant']]:
    now = pin(original['path']); same = (now['bytes'],now['sha256'])==(original['bytes'],original['sha256'])
    conserved.append({'original':original,'actual':now,'unchanged':same})
assert all(r['unchanged'] for r in conserved)
old_events = []
for original in preimages['priorEventsReadOnly']:
    now=pin(original['path']); s=Path(original['path']).stat()
    same=(now['bytes'],now['sha256'],s.st_dev,s.st_ino,s.st_mtime_ns)==(original['bytes'],original['sha256'],original['device'],original['inode'],original['mtimeNs'])
    old_events.append({'original':original,'actual':now,'byteInodeMtimeUnchanged':same})
assert all(r['byteInodeMtimeUnchanged'] for r in old_events)
write('conservation.json',{'dependencyPins':conserved,'priorEvents':old_events,'originalSetup07Prefix':{'bytes':len(initial),'sha256':plan['initialPrefixSha256'],'inode':physical['inode'],'unchanged':True},'authorizedAppendBytes':len(appended),'initialInstalledWorksiteRuntimeArchiveProjectionBodyModesUnchanged':True,'newOwnerEntries':len(new_entries),'sourceGitNetworkProviderEffects':0})
handoff_digest = canonical(handoff)
write('closed-event-resource-handoff.json',{'status':'CLOSED_REOPENABLE_FAILED_RUNTIME_CUT','closeHandoff':handoff,'handoffDigest':handoff_digest,'physical':physical,'originalPrefix':accepted['setup']['authenticCloseHandoff']['prefix'],'originalPrefixBytesUnchanged':True,'eventLockPresent':False,'futureReopen':'separate exact Root grant required; this Worker stops writes','ownerDisposition':'blocked','completedRuns':0,'semanticQualification':False})
helper_pids = [r['payload']['processId'] for r in actors if r['kind']=='actor_process_started']
helper_probes = [{'pid':pid,'afterActorExit':absent_pid(pid)} for pid in helper_pids]
assert all(r['afterActorExit']=='absent' for r in helper_probes)
call = failure['calls'][0]
volumes = [pin(p) for p in sorted(root.iterdir()) if p.is_file() and (p.name in ['f11-bound-packet.json','f11-bound-resource-manifest.json','controlled-raw-response.json','actor-final-output.raw.json','actual-positive-flow-state.json'] or p.name.startswith('flow-parent'))]
write('accounting.json',{'status':'CLOSED','operation':operation,'supervisorStart':start,'supervisorClose':supervisor,'HOME':start['HOME'],'heap':'default unchanged','nominal':read('nominal-preflight-completion.json'),'actualPublicCalls':1,'calls':failure['calls'],'actualNativeProcess':read('flow-parent-native-process.json'),'actualTypedPublicExitCode':receipt['exitCode'],'actualOwnerDisposition':'blocked','controlledActorStarts':len(helper_pids),'controlledActorExitEvents':[r for r in actors if r['kind']=='actor_process_exited'],'helperPidAfterClose':helper_probes,'completedRuns':0,'freshCLIReads':0,'F11Runs':0,'AF22Runs':0,'mechanicalNegatives':0,'actualAppendedRecordCount':len(rows),'actualAppendedEventCount':len(events),'actualAppendBytes':len(appended),'volumes':volumes,'realProviderCalls':0,'RuntimeCallsAfterFirstFailure':0,'reportOnlyAfterFailure':True,'unknowns':{'helperPGID':'not independently recorded; PID absent and actual actor exit/closure retained','ambientProcesses':'not enumerated','preRejectionCompactCandidateBody':'not reconstructed','genuineQualification':'not executed'}})
write('closure.json',{'status':'CLOSED','operation':operation,'role':'Runtime Worker','workResult':'stopped_first_actual_owner_failure','firstBoundary':'core qualification assessment result-contract-mismatch; ordinary blocked foldback and parent Run stop','parentRun':stop['run'],'diagnostic':child['payload']['value']['diagnosticRef'],'childResultEvent':child['eventId'],'childJudgmentEvent':judgment['eventId'],'parentStopEvent':parent_stop['eventId'],'actualPublicCalls':1,'controlledHelperExchanges':len(helper_pids),'realProviderCalls':0,'completedRuns':0,'freshCLIReads':0,'downstreamF11AF22Negatives':'not attempted','resourceHandoffDigest':handoff_digest,'eventPhysical':physical,'originalPrefixUnchanged':True,'sourceRepairRetry':False,'writesAfterFreeze':'STOPPED','RootAloneAcceptsOrSelectsRepair':True})
with (root/'return.md').open('x') as f:
    f.write(f'''CLOSED — Runtime08 stopped at the first actual owner failure.\n\nThe actual unchanged wrapper parent traversed the current core assessment F_P child. One controlled actor consumed the actual owner-rendered prompt, exited 0, and produced the retained raw artifact. Core child result event {child['eventId']} admitted a self_conformance_refusal at stage result, diagnostic {child['payload']['value']['diagnosticRef']}. The assessment predicate judged it blocked. Ordinary child foldback carried that refusal to the parent; parent stop {parent_stop['eventId']} left Run {stop['run']['ref']} blocked with terminalResult:null. Public result/declared exit 0 did not establish completion, and the unchanged strict gate stopped without fallback.\n\nThere was one actual Public call, one controlled helper exchange, zero real providers, zero completed Runs and zero fresh CLI reads. Fresh F11, AF22, six-read conjunction and mechanical negatives were not attempted. Successful semantic Result/J and genuine qualification remain unproved. No retry, repair or additional Runtime call occurred. Exact actual typed receipts, actor/native evidence, full closed event copy and available owner archives remain retained; source causation is for independent Root triangulation.\n\nThe managed run took {supervisor['elapsedMs']/1000:.3f} seconds, peak RSS {supervisor['rssBytes']} bytes, default heap and HOME {start['HOME']}. Main and the known CLI group were reaped and absent; the recorded helper PID is absent. No timeout occurred. Actor PGID and ambient processes were not individually enumerated.\n\nAuthentic current closed event: {physical['bytes']} bytes / SHA256 {physical['sha256']} / device {physical['device']} / inode {physical['inode']}. Current prefix {handoff['prefix']['coordinateDigest']}; handoff {handoff_digest}. Original {len(initial)} bytes remain exact on the original inode; ABG appended {len(appended)} bytes. All initial resource body/modes except that authorized append, and both older stores, remain unchanged. Full current resource census and actual new effects are recorded. Runtime Worker CLOSED; writes stop after final-runtime-freeze.json.\n''')
write('report-finalizer-close.json',{'status':'CLOSED','operation':operation,'elapsedMs':(time.monotonic()-began)*1000,'savedProducerSchemaOnly':True,'RuntimeImportsCalls':0,'reportProcessUsage':{'maxRSS':resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,'userSeconds':resource.getrusage(resource.RUSAGE_SELF).ru_utime,'systemSeconds':resource.getrusage(resource.RUSAGE_SELF).ru_stime}})
records, directories = inventory(root)
assert not any(r['kind']!='file' for r in records)
freeze = {'status':'CLOSED','operation':operation,'role':'Runtime Worker','workResult':'stopped_first_actual_owner_failure','frozenAt':datetime.now(timezone.utc).isoformat(),'records':records,'directories':directories,'recordCount':len(records),'recordBytes':sum(r['bytes'] for r in records),'directoryCount':len(directories),'symlinks':0,'resourceHandoffDigest':handoff_digest,'externalOwnerResourceCensus':'owner-resource-census.json','actualPublicCalls':1,'controlledHelperExchanges':len(helper_pids),'realProviderCalls':0,'completedRuns':0,'freshCLIReads':0,'excludedSelf':'final-runtime-freeze.json only; freeze.json is immutable Q09 input replica','writesAfterFreeze':'STOPPED'}
write('final-runtime-freeze.json',freeze)
print(json.dumps({'status':'CLOSED','freeze':pin(root/'final-runtime-freeze.json'),'records':len(records),'recordBytes':freeze['recordBytes'],'directories':len(directories),'handoffDigest':handoff_digest,'eventPhysical':physical,'appendBytes':len(appended),'newOwnerFiles':len(new_entries),'publicCalls':1,'helperExchanges':len(helper_pids),'completedRuns':0,'freshReads':0,'elapsedMs':supervisor['elapsedMs']}))
