"""Runtime09 saved-evidence success/first-failure closure; no owner imports or calls."""
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter
import hashlib, json, os, stat, shutil, time, resource

root=Path(__file__).resolve().parent
began=time.monotonic()
def read(n): return json.loads((root/n).read_bytes())
def optional(n): return read(n) if (root/n).exists() else None
def write(n,v):
    with (root/n).open('x') as f: json.dump(v,f,indent=2,ensure_ascii=False);f.write('\n')
def sha_file(p):
    with Path(p).open('rb') as f: return hashlib.file_digest(f,'sha256').hexdigest()
def canonical(v): return 'sha256:'+hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
def pin(p):
    p=Path(p);s=p.stat()
    return dict(path=str(p),bytes=s.st_size,sha256=sha_file(p),mode=oct(stat.S_IMODE(s.st_mode)))
def inventory(directory):
    files,dirs=[],[]
    for current,sub,names in os.walk(directory,followlinks=False):
        sub.sort();names.sort()
        for n in list(sub)+names:
            p=Path(current)/n;s=p.lstat();r=dict(path=str(p.relative_to(directory)),mode=oct(stat.S_IMODE(s.st_mode)))
            if stat.S_ISLNK(s.st_mode):
                r.update(kind='symlink',target=os.readlink(p));files.append(r)
                if n in sub:sub.remove(n)
            elif stat.S_ISDIR(s.st_mode):r.update(kind='directory');dirs.append(r)
            elif stat.S_ISREG(s.st_mode):r.update(kind='file',bytes=s.st_size,sha256=sha_file(p));files.append(r)
            else:r.update(kind='nonregular',physicalType=stat.S_IFMT(s.st_mode));files.append(r)
    return sorted(files,key=lambda x:x['path']),sorted(dirs,key=lambda x:x['path'])
def probe(pid,group=False):
    try:(os.killpg if group else os.kill)(pid,0);return 'present'
    except ProcessLookupError:return 'absent'
    except PermissionError:return 'unobservable_permission'
def mode(v): return int(v,8) if isinstance(v,str) else v

activation=read('runtime-activation.json');operation=activation['operation']
cfg=read('driver-config.json');assert operation==cfg['operation']
accepted=read(activation['inputAcceptance']['path'])
assert accepted['releasedConditionalOperation']==operation
start=read('flow-supervisor-start.json');supervisor=read('flow-supervisor-close.json')
failure=optional('first-failure.json');outcome=optional('driver-outcome.json')
state=optional('actual-positive-flow-state.json');stop=optional('selected-flow-stop.json')
plan=read('resource-plan.json');preimages=read('preimages.json')
success=failure is None and outcome is not None and outcome.get('status')=='positive_path_completed'
calls=(state or {}).get('calls',(failure or {}).get('calls',[]))
errors=[]
def check(ok,relation,actual=None):
    if not ok:errors.append({'relation':relation,'actual':actual})
write('report-finalizer-start.json',{'operation':operation,'at':datetime.now(timezone.utc).isoformat(),
    'pid':os.getpid(),'source':pin(__file__),'RuntimeImportsCalls':0,'savedSchemaBranch':'success'if success else'first_failure'})
check(supervisor.get('wait4ReapedMain') and supervisor.get('processGroupAfterWait')=='absent','main reaped/group absent',supervisor)
check(not supervisor.get('timedOut'),'finite managed budget did not expire',supervisor.get('deadlineReason'))
check(all(g.get('afterTERM')=='absent' for g in supervisor.get('knownCLIProcessGroups',[])),'all recorded CLI groups absent')

event=Path(plan['eventLogPath']);before=event.stat();body=event.read_bytes();after=event.stat()
check((before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns),'stable final event read')
prefix_file=root/'setup09-initial-durable-prefix.bin'
initial=prefix_file.read_bytes() if prefix_file.exists() else body[:plan['initialPrefixBytes']]
prefix_ok=(len(initial)==plan['initialPrefixBytes'] and hashlib.sha256(initial).hexdigest()==plan['initialPrefixSha256'] and body.startswith(initial))
check(prefix_ok,'original Setup09 prefix byte exact')
check((after.st_dev,after.st_ino)==(plan['eventDevice'],plan['eventInode']),'original event inode/device')
physical=dict(path=str(event),bytes=len(body),sha256=hashlib.sha256(body).hexdigest(),device=after.st_dev,inode=after.st_ino,mode=oct(stat.S_IMODE(after.st_mode)))
handoff=(state or {}).get('closeHandoff') or (failure or {}).get('latestActualClosedHandoff')
if handoff is None and len(body)==plan['initialPrefixBytes']:handoff=accepted['setup']['authenticCloseHandoff']
authentic=bool(handoff and handoff['prefix']['prefixDigest']=='sha256:'+physical['sha256'] and
    handoff['prefix']['prefixLength']==physical['bytes'] and handoff['prefix']['storeIdentity']['inode']==physical['inode'] and
    handoff['reopenAuthority']['eventLogDigest']=='sha256:'+physical['sha256'] and handoff['reopenAuthority']['durableByteLength']==physical['bytes'])
check(authentic,'latest owner-produced closed handoff matches actual prefix')
lock=root/'task-tmp/abiogenesis-event-store-locks-v5'/f'{physical["device"]}-{physical["inode"]}.lock'
check(not lock.exists(),'event resource lock absent',str(lock))
with(root/'closed-runtime-events.jsonl').open('xb')as f:f.write(body)
appended=body[len(initial):]
with(root/'appended-durable-records.bin').open('xb')as f:f.write(appended)
rows=[json.loads(line)for line in appended.splitlines()]
events=[r for r in rows if r.get('kind')!='abg_admitted_body_reference_record']
write('appended-runtime-records.json',{'records':rows,'recordCount':len(rows),'eventCount':len(events),
    'bodyReferenceRecordCount':len(rows)-len(events),'kindCounts':dict(Counter(r.get('kind')for r in rows))})
actors=[r for r in events if r.get('kind','').startswith('actor_')]
bindings=[r for r in events if r.get('kind')=='actor_transport_binding_admitted']
write('actual-actor-transport-evidence.json',{'events':actors,'transportBindings':bindings,'realProviderCalls':0})
artifacts=[r for r in actors if r.get('kind')=='actor_result_artifact_observed']
if artifacts and isinstance(artifacts[0].get('payload',{}).get('finalOutput'),str):
    with(root/'actor-final-output.raw.json').open('x')as f:f.write(artifacts[0]['payload']['finalOutput'])
write('available-native-verification-inputs.json',{'actualTransportBindings':bindings,
    'actualCCallEvidence':[r for r in events if r.get('kind')=='c_call_evidenced'],
    'bodyReferenceRecords':[r for r in rows if r.get('kind')=='abg_admitted_body_reference_record'],
    'exactInvocationFiles':[pin(p)for p in sorted(root.glob('flow-*.jsonl'))if p.name!='flow-progress.jsonl'],
    'exactCurrentPacket':pin(root/'f11-bound-packet.json'),'exactCurrentResourceManifest':pin(root/'f11-bound-resource-manifest.json'),
    'cachedWorkerRequestUsed':False,'policy':'retain actual available evidence; no owner call or candidate reconstruction'})

run_calls=[];read_calls=[]
for call in calls:
    label=call['label'];p=root/('flow-'+label+'-stdout.json')
    receipt=json.loads(p.read_bytes()).get('receipt')if p.exists()else None
    row={'call':call,'receiptPin':pin(p)if p.exists()else None,
         'publicExitCode':(receipt or {}).get('exitCode'),'ownerOutput':(receipt or {}).get('ownerOutput')}
    key=call.get('definitionKey',{}).get('memberKey')
    (read_calls if key in ['run_result','run_replay']else run_calls).append(row)
completed=[r for r in run_calls if (r['ownerOutput']or{}).get('outcomeKind')=='result'and
           (r['ownerOutput'].get('value')or{}).get('disposition')=='completed'and
           (r['ownerOutput'].get('value')or{}).get('terminalResult')is not None]
good_reads=[r for r in read_calls if (r['ownerOutput']or{}).get('outcomeKind')=='result'and r['publicExitCode']==0]
flow=optional('existing-program-flow-result.json');proof=optional('actual-assessment-proof.json')
consumption=optional('assessment-consumption-checks.json')
ten=['transportDigest','actorInvocationRef','actorRef','workerBindingRef','transportBindingRef',
     'transportBindingDigest','requestDigest','promptDigest','transportDisposition','transportFailureClass']
def metadata_rows(value,path='$'):
    found=[]
    if isinstance(value,dict):
        if all(k in value for k in ten):found.append({'path':path,'cCallRef':value.get('cCallRef'),
            'evidenceRef':value.get('evidenceRef'),'metadata':{k:value[k]for k in ten}})
        for k,v in value.items():found.extend(metadata_rows(v,path+'/'+k))
    elif isinstance(value,list):
        for i,v in enumerate(value):found.extend(metadata_rows(v,path+'/'+str(i)))
    return found
admitted_metadata=metadata_rows([r for r in events if r.get('kind')=='c_call_evidenced'])
judgment_metadata=metadata_rows((proof or {}).get('terminal',{}).get('value',{}))
matches=[{'admitted':a,'judgment':b}for a in admitted_metadata for b in judgment_metadata if a['metadata']==b['metadata']]
write('result-evidence-tenfield-correspondence.json',{'requiredFields':ten,'actualAdmittedMetadata':admitted_metadata,
    'actualJudgmentMetadata':judgment_metadata,'equalActualPairs':matches,
    'actualColdF11Consumption':bool(consumption and consumption.get('admittedAssessment')),
    'noSourceInference':True,'completePath':success})
if success:
    check(len(completed)==3,'three actually completed Runs',len(completed))
    check(len(good_reads)==6 and len({r['call']['label']for r in good_reads})==6,'six distinct fresh CLI readbacks',len(good_reads))
    check(bool(flow and flow.get('mechanicalPath')=='completed'),'saved flow producer completed',flow)
    check(bool(consumption and all(consumption.get(k)for k in ['admittedAssessment','warmMissingResourceRefused','crossedResultRefused'])),'actual original-J consumption and nearest two mechanical negatives',consumption)
    check(bool(matches),'all ten metadata fields conserved in actual admitted evidence and original J')
    write('whole-carrier-evidence.json',{'status':'completed'if not errors else'measured_report_refusal',
        'completedRunReceipts':run_calls,'freshCLIReadReceipts':read_calls,'originalChildJProof':proof,
        'actualF11Consumption':consumption,'soleAF22':(flow or {}).get('final'),
        'childOrdinaryClosureFoldback':(flow or {}).get('childGraphFoldback'),
        'semanticQualification':False,'mechanicalNegatives':'actual missing resource and crossed Result refused by unchanged owner oracle'})
else:
    child=[r for r in events if r.get('kind')=='c_call_result_admitted'and r.get('graphFunctionRef')=='graph-function://abiogenesis/qualification/assess@5']
    write('first-violated-relations.json',{'status':'stopped_first_actual_failure','firstFailure':failure,
        'strictCallerStop':stop,'actualRunReceipts':run_calls,'actualReadReceipts':read_calls,
        'childResultEvents':child,'childJudgments':[r for r in events if r.get('kind')=='c_call_judged'and r.get('graphFunctionRef')=='graph-function://abiogenesis/qualification/assess@5'],
        'foldback':[r for r in events if r.get('kind')=='child_foldback_admitted'],
        'parentStops':[r for r in events if r.get('kind')=='run_stopped'],
        'completedRuns':len(completed),'freshReads':len(good_reads),'sourceCause':'unknown; Root independent triangulation',
        'noRepairRetryOrRuntimeAfterFailure':True})

baseline=read('setup09-initial-entry-pins.json');setup_root=Path(baseline['setupRoot'])
files,dirs=inventory(setup_root/'resources');actual={'resources/'+r['path']:r for r in files}
old={r['path']:r for r in baseline['records']};missing=sorted(set(old)-set(actual));changed=[]
for p in sorted(set(old)&set(actual)):
    if p=='resources/events/runtime.events.jsonl':continue
    x,y=old[p],actual[p]
    if x.get('kind','file')!=y['kind']or x.get('bytes')!=y.get('bytes')or x.get('sha256')!=y.get('sha256')or mode(x['mode'])!=mode(y['mode']):changed.append({'path':p,'before':x,'after':y})
new=[dict(actual[p],path=p)for p in sorted(set(actual)-set(old))]
dm={'resources/'+r['path']:r for r in dirs}
dir_changes=[{'before':r,'after':dm.get(r['path'])}for r in baseline['directories']if r['path']not in dm or mode(r['mode'])!=mode(dm[r['path']]['mode'])]
check(not missing and not changed and not dir_changes,'all original resource bodies/modes conserved except authorized event append',{'missing':missing,'changed':changed,'dirs':dir_changes})
check(all(r['kind']=='file'for r in files),'complete physical resources regular/link-free')
write('owner-resource-census.json',{'setupRoot':str(setup_root),'actualFiles':files,'actualDirectories':dirs,
    'initialFiles':len(old),'initialMissing':missing,'initialChangedExceptAuthorizedEventAppend':changed,
    'initialDirectoryChanges':dir_changes,'newOwnerEntries':new,'event':physical,'originalEventPrefixUnchanged':prefix_ok})
captures=[]
for entry in new:
    if entry.get('kind')=='file'and entry['bytes']<=4*1024*1024:
        target=root/'owner-evidence'/entry['path'];target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(setup_root/entry['path'],target);os.chmod(target,mode(entry['mode']))
        captures.append({'original':str(setup_root/entry['path']),'copy':pin(target),'bodyExact':True})
write('available-owner-archive-copies.json',{'copiedNewSmallOwnerFiles':captures,'allNewOwnerFilesPinned':'owner-resource-census.json','largeBodies':'actual pinned owner files retained; no reconstruction'})
dependencies=[]
for original in preimages['finiteDependencyPins']+[preimages['exactRelease'],preimages['grant']]:
    now=pin(original['path']);same=(now['bytes'],now['sha256'],mode(now['mode']))==(original['bytes'],original['sha256'],mode(original['mode']))
    dependencies.append({'original':original,'actual':now,'unchanged':same});check(same,'immutable dependency conserved',original['path'])
old_events=[]
for original in preimages['priorEventsReadOnly']:
    now=pin(original['path']);s=Path(original['path']).stat()
    same=(now['bytes'],now['sha256'],s.st_dev,s.st_ino,s.st_mtime_ns)==(original['bytes'],original['sha256'],original['device'],original['inode'],original['mtimeNs'])
    old_events.append({'original':original,'actual':now,'byteInodeMtimeUnchanged':same});check(same,'old event store read-only',original['path'])
write('conservation.json',{'dependencies':dependencies,'oldEvents':old_events,'originalPrefixUnchanged':prefix_ok,
    'eventDeviceInode':{'device':physical['device'],'inode':physical['inode']},'authorizedAppendBytes':len(appended),
    'allInitialResourceEntriesConserved':not missing and not changed and not dir_changes,'newOwnerEntries':len(new)})
helper_pids=[r['payload']['processId']for r in actors if r.get('kind')=='actor_process_started']
helper_probes=[{'pid':p,'afterActorExit':probe(p)}for p in helper_pids]
check(all(r['afterActorExit']=='absent'for r in helper_probes),'all recorded helpers absent')
handoff_digest=canonical(handoff)if handoff else None
write('closed-event-resource-handoff.json',{'status':'CLOSED_REOPENABLE_RUNTIME_CUT'if authentic else'NO_AUTHENTIC_FINAL_HANDOFF',
    'closeHandoff':handoff,'handoffDigest':handoff_digest,'physical':physical,'originalPrefix':accepted['setup']['authenticCloseHandoff']['prefix'],
    'originalPrefixBytesUnchanged':prefix_ok,'eventLockPresent':lock.exists(),'completedRuns':len(completed),
    'futureReopen':'separate exact Root grant required','semanticQualification':False})
volumes=[pin(p)for p in sorted(root.iterdir())if p.is_file()and(p.name in ['f11-bound-packet.json','f11-bound-resource-manifest.json','controlled-raw-response.json','actor-final-output.raw.json','actual-positive-flow-state.json']or p.name.startswith('flow-'))]
result='completed_mechanical_carrier'if success and not errors else'stopped_first_actual_failure'if not success else'stopped_saved_evidence_relation_refusal'
write('accounting.json',{'status':'CLOSED','operation':operation,'supervisorStart':start,'supervisorClose':supervisor,
    'HOME':start['HOME'],'heap':'default unchanged','nominal':optional('nominal-preflight-completion.json'),
    'actualPublicCalls':len(calls),'calls':calls,'completedRuns':len(completed),'freshCLIReads':len(good_reads),
    'controlledActorStarts':len(helper_pids),'helperPidAfterClose':helper_probes,
    'actorExitEvents':[r for r in actors if r.get('kind')=='actor_process_exited'],
    'actualAppendedRecords':len(rows),'actualAppendedEvents':len(events),'appendBytes':len(appended),'volumes':volumes,
    'realProviderCalls':0,'qualificationCommands':0,'sourceGitNetworkEffects':0,'RuntimeCallsAfterFirstFailure':0,
    'unknowns':{'helperPGID':'not independently recorded; actor exit and PID absence retained','ambientProcesses':'not enumerated','genuineQualification':'not executed'}})
write('closure.json',{'status':'CLOSED','operation':operation,'role':'Runtime Worker','workResult':result,
    'firstFailureFrontier':(failure or{}).get('frontier'),'actualPublicCalls':len(calls),'completedRuns':len(completed),
    'freshCLIReads':len(good_reads),'controlledHelperExchanges':len(helper_pids),'realProviderCalls':0,
    'handoffDigest':handoff_digest,'event':physical,'originalPrefixUnchanged':prefix_ok,'measuredRelationsRefused':errors,
    'sourceRepairRetry':False,'RootAloneAccepts':True,'writesAfterFreeze':'STOPPED'})
with(root/'return.md').open('x')as f:f.write(f'CLOSED Runtime09: {result}.\n\nActual Public calls {len(calls)}, completed Runs {len(completed)}, fresh CLI reads {len(good_reads)}, controlled actors {len(helper_pids)}, real providers 0. Original Setup09 prefix conserved: {prefix_ok}; original inode {physical["inode"]}; append {len(appended)}B. Latest authentic closed handoff: {handoff_digest if authentic else "not established"}.\n\nManaged wall time {supervisor["elapsedMs"]/1000:.3f}s; peak RSS {supervisor["rssBytes"]}B; default heap/HOME {start["HOME"]}. Recorded process closure, full resource census and actual evidence are retained. No retry/repair or Runtime call after failure. Semantic qualification and release remain unproved.\n\nFirst failure: {(failure or{}).get("frontier")}; measured report refusals: {len(errors)}. Worker CLOSED; all writes stop after final-runtime-freeze.json.\n')
write('report-finalizer-close.json',{'status':'CLOSED','operation':operation,'elapsedMs':(time.monotonic()-began)*1000,
    'savedProducerSchemaOnly':True,'RuntimeImportsCalls':0,'maxRSS':resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
    'userSeconds':resource.getrusage(resource.RUSAGE_SELF).ru_utime,'systemSeconds':resource.getrusage(resource.RUSAGE_SELF).ru_stime})
records,directories=inventory(root)
freeze={'status':'CLOSED','operation':operation,'role':'Runtime Worker','workResult':result,
    'frozenAt':datetime.now(timezone.utc).isoformat(),'records':records,'directories':directories,
    'recordCount':len(records),'recordBytes':sum(r.get('bytes',0)for r in records),'directoryCount':len(directories),
    'symlinks':sum(r['kind']=='symlink'for r in records),'handoffDigest':handoff_digest,'authenticHandoff':authentic,
    'originalPrefixUnchanged':prefix_ok,'actualPublicCalls':len(calls),'completedRuns':len(completed),'freshCLIReads':len(good_reads),
    'controlledHelperExchanges':len(helper_pids),'realProviderCalls':0,'measuredRelationRefusals':errors,
    'ownerResourceCensus':'owner-resource-census.json','inputReplicaFreeze':'freeze.json','excludedSelf':'final-runtime-freeze.json only','writesAfterFreeze':'STOPPED'}
write('final-runtime-freeze.json',freeze)
print(json.dumps({'status':'CLOSED','workResult':result,'freeze':pin(root/'final-runtime-freeze.json'),
    'records':len(records),'directories':len(directories),'handoffDigest':handoff_digest,'event':physical,
    'publicCalls':len(calls),'completedRuns':len(completed),'freshReads':len(good_reads),'helperExchanges':len(helper_pids),'refusals':errors}))
