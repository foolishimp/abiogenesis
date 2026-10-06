from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import unquote
import hashlib
import json
import os
import stat
import time

root=Path(__file__).resolve().parent
base=root.parent
started=time.monotonic()
def read(name): return json.loads((root/name).read_text())
def sha_file(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()
def canonical(value): return 'sha256:'+hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
def write(name,value):
    with (root/name).open('x') as f: json.dump(value,f,indent=2);f.write('\n')
def inventory(directory):
    records,dirs=[],[]
    for current,children,names in os.walk(directory,followlinks=False):
        children.sort();names.sort()
        for n in list(children)+names:
            p=Path(current)/n;s=p.lstat();r={'path':str(p.relative_to(directory)),'mode':oct(stat.S_IMODE(s.st_mode))}
            if stat.S_ISLNK(s.st_mode):
                r.update(kind='symlink',target=os.readlink(p));records.append(r)
                if n in children: children.remove(n)
            elif stat.S_ISDIR(s.st_mode): r.update(kind='directory');dirs.append(r)
            elif stat.S_ISREG(s.st_mode): r.update(kind='file',bytes=s.st_size,sha256=sha_file(p));records.append(r)
            else: r.update(kind='nonregular');records.append(r)
    return sorted(records,key=lambda r:r['path']),sorted(dirs,key=lambda r:r['path'])

failure=read('first-failure.json');supervisor=read('flow-supervisor-close.json')
assert supervisor['exitCode']==1 and not supervisor['timedOut']
assert supervisor['wait4ReapedMain'] and supervisor['processGroupAfterWait']=='absent'
assert len(supervisor['knownCLIProcessGroups'])==2
assert all(x['before']==x['afterTERM']=='absent' for x in supervisor['knownCLIProcessGroups'])
parent=read('flow-parent-stdout.json')['receipt'];cold=read('flow-assess-run_result-stdout.json')['receipt']
assert parent['exitCode']==0 and parent['ownerOutput']['outcomeKind']=='result'
parent_value=parent['ownerOutput']['value']
assert parent_value['disposition']=='runtime_failed' and parent_value['terminalResult'] is None
assert cold['exitCode']==70 and cold['ownerOutput'] is None and cold['resources'] is None
assert cold['failure']['fault']['stage']=='resource_admission'
assert cold['failure']['fault']['code']=='invalid_resource_assertion'
handoff=failure['latestActualClosedHandoff'];event=Path(handoff['reopenAuthority']['eventLogPath'])
before=event.stat();body=event.read_bytes();after=event.stat()
assert (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)
old=(root/'setup05-initial-durable-prefix.bin').read_bytes()
assert len(old)==2490814 and hashlib.sha256(old).hexdigest()=='7f568a9f3136b274c77730e152097bb47bf655145041dbbc1d92b21a4b74389d'
assert body[:len(old)]==old
assert after.st_dev==16777230 and after.st_ino==464611665
assert len(body)==handoff['prefix']['prefixLength']==handoff['reopenAuthority']['durableByteLength']
assert 'sha256:'+hashlib.sha256(body).hexdigest()==handoff['prefix']['prefixDigest']==handoff['reopenAuthority']['eventLogDigest']
lock=root/'task-tmp/abiogenesis-event-store-locks-v5'/f'{after.st_dev}-{after.st_ino}.lock'
assert not lock.exists()
(root/'closed-runtime-events.jsonl').write_bytes(body)
(root/'appended-durable-records.bin').write_bytes(body[len(old):])
appended=[json.loads(line) for line in body[len(old):].splitlines()]
assert len(appended)==44
events=[x for x in appended if x.get('kind')!='abg_admitted_body_reference_record']
child_failure=next(e for e in events if e.get('kind')=='c_call_result_admitted' and e['payload'].get('resultClass')=='failure' and e['payload']['value']['failureClass']=='implementation_exception')
parent_failure=next(e for e in events if e.get('kind')=='c_call_result_admitted' and e['payload'].get('resultClass')=='failure' and e['payload']['value']['failureClass']=='child_traversal_failed')
diagnostic_ref=child_failure['payload']['value']['diagnosticRef']
assert diagnostic_ref.startswith('data:application/json;charset=utf-8,')
diagnostic=json.loads(unquote(diagnostic_ref.split(',',1)[1]))
assert diagnostic['stage']=='preparation'
assert diagnostic['message']=='qualification assessment lacks an exact current owner and admitted task'
fold=next(e for e in events if e.get('kind')=='child_foldback_admitted')
assert fold['payload']['childDisposition']=='failed'
stop=next(e for e in events if e.get('kind')=='run_stopped')
assert not any(e.get('kind') in ['run_closed','graph_call_closed'] for e in events)
judgments=[e for e in events if e.get('kind')=='c_call_judged']
successful_results=[e for e in events if e.get('kind')=='c_call_result_admitted' and e['payload'].get('resultClass')!='failure']
assert not successful_results
actor_events=[e for e in events if any(k in e.get('kind','') for k in ['actor_invocation','actor_artifact','actor_task_dispatched','actor_transport'])]
assert not actor_events
write('appended-runtime-records.json',{'kind':'read_only_exact_appended_durable_record_snapshot','records':appended,'recordCount':44,'runtimeEvents':len(events),'bodyReferenceRecords':44-len(events),'originalPrefixBytes':len(old),'appendedBytes':len(body)-len(old),'eventInterpretation':'ABG failure Result and failure judgments/foldback/run_stopped; no qualification J or RunClosed'})
write('first-violated-relations.json',{'status':'STOPPED_NO_REPAIR','earliestActualFailure':{'boundary':'actual core child qualification F_P preparation','source':'installed ./implementation/qualification.js:32 via leaf_invocation_port.js:478','diagnostic':diagnostic,'actualChildFailureEvent':child_failure,'actualFailureFoldbackEvent':fold,'actualParentFailureEvent':parent_failure,'actualRunStopEvent':stop,'failureJudgments':judgments,'semanticQualificationJudgment':None,'successfulChildResult':None,'helperOrProviderDispatch':0},'secondObservedFault':{'boundary':'first attempted fresh Public run_result after returned runtime_failed parent','definitionKey':cold['definitionKey'],'actualHostReceipt':cold,'predicate':'owner-authored resource structural contract differs; resource_admission/invalid_resource_assertion','actualExitCode':70,'newEventAppend':False},'copiedFlowBehavior':'Unchanged frozen Q06 flow classified Public result/exit0 then attempted cold read before checking Run terminal disposition; original source preserved. No further calls were made.','RootReadOnlySourceTrace':'Root reports F_D leaf invocation passes NativeLeafProofOperations argument5, F_P preparation passes4arguments although existing assessment realization requires the borrowed native preparation. This is Root candidate cause, not a Worker implementation change.','helperResponseEvidence':'controlled-raw-response.json is a prospective template; controlled-response-binding/request pin come from permitted pure owner renderer. They are not an actor exchange or admitted semantic assessment.'})

physical={'path':str(event),'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'device':after.st_dev,'inode':after.st_ino,'mode':oct(stat.S_IMODE(after.st_mode))}
handoff_digest=canonical(handoff)
write('closed-event-resource-handoff.json',{'status':'CLOSED_AUTHENTIC_FAILED_RUN','closeHandoff':handoff,'handoffDigest':handoff_digest,'physical':physical,'stableAfterSupervisorClose':True,'eventLockPresent':False,'originalPrefix':{'bytes':len(old),'sha256':hashlib.sha256(old).hexdigest(),'saved':'setup05-initial-durable-prefix.bin','byteExactPrefix':True,'sameDeviceInode':True},'authorizedEffect':{'appendedBytes':len(body)-len(old),'appendedRecords':44,'failedRuns':1,'PublicCalls':2},'latestLawfulSource':'actual returned parent invocation resource closeHandoff; failed cold host returned no new handoff, appended no events','reopen':'only Root may separately activate further execution; Worker stops writes'})

source_pins=[]
for pin in read('source-preimage-pins.json')['pins']:
    p=Path(pin['path']);actual=sha_file(p);row=dict(pin,actualBytes=p.stat().st_size,actualSha256=actual,unchanged=actual==pin['sha256'] and p.stat().st_size==pin['bytes']);source_pins.append(row)
assert all(r['unchanged'] for r in source_pins)
old_cut_pins=[]
for pin in read('conditional-worker-activation.json')['pinnedDonors']:
    p=Path(pin['path']);actual=sha_file(p);row=dict(pin,actualSha256=actual,actualBytes=p.stat().st_size,unchanged=actual==pin['sha256'] and p.stat().st_size==pin['bytes']);old_cut_pins.append(row)
assert all(r['unchanged'] for r in old_cut_pins)
write('conservation.json',{'status':'passed','sourcePreimagePins':source_pins,'closedDonorMetadataPins':old_cut_pins,'originalSetup05EventPrefix':'byte-exact saved prefix; exact same16777230/464611665 resource; only Root-granted ABG append occurred','allOtherOldStores':'no operation targeted them; remain read-only','selectedSetup05InstalledWorksiteCatalog':'no source/installation/worksite/catalog mutation operation; prior complete physical/read assurance reused','qualifiedInputAuthority':'exact Root input acceptance verified before all Product imports; Q06 donor bytes remain readonly','RuntimeRetrySourcePatchSetupHelloQualificationCommands':'none'})

calls=[]
for label in ['parent','assess-run_result']:
    stem='flow-'+label
    calls.append({'label':label,'hostReceipt':read(stem+'-host-receipt.json'),'ownerOutcome':read(stem+'-owner-outcome.json'),'publicDisposition':read(stem+'-public-disposition.json'),'timing':read(stem+'-timing.json'),'nativeProcess':read(stem+'-native-process.json'),'requestBytes':(root/(stem+'.jsonl')).stat().st_size})
external_input_pins=[]
q06=Path(read('driver-config.json')['Q06Root']);prepared=json.loads((q06/'freeze.json').read_text());members={r['path']:r for r in prepared['records']}
for name in ['f11-bound-packet.json','f11-bound-resource-manifest.json','f11-bound-prompt.txt','f11-bound-worker-request.json','f11/source-authorship-records.json','f11/member-alias-trace.json']:
    r=members[name];external_input_pins.append({'path':str(q06/name),'bytes':r['bytes'],'sha256':r['sha256'],'authority':'exact accepted Q06 frozen population; reused without new owner preparation or mutation'})
write('accounting.json',{'status':'CLOSED_FIRST_FAILURE','supervisor':supervisor,'nominal':read('nominal-preflight-completion.json'),'actualPublicCalls':2,'calls':calls,'successfulRunClosures':0,'failedRunStops':1,'successfulQualificationJ':0,'failureResultAdmissions':2,'failureJudgments':len(judgments),'failedChildFoldbacks':1,'attemptedColdReads':1,'successfulColdReads':0,'F11Runs':0,'AF22Runs':0,'nearestNegatives':'not executed after first actual failure','controlledHelperLaunches':0,'actualActorArtifacts':0,'rawResponse':'prospective template only; no native consumption occurred','realProviderCalls':0,'externalAcceptedInputPins':external_input_pins,'measuredPeakRSSBytes':supervisor['rssBytes'],'costCause':'7,771,881,472-byte peak is observed integrated cost; no OOM or timeout occurred; not inferred as cause of preparation/type faults','heap':'default; unchanged','HOME':'/Users/jim','knownProcessClosure':'main wait4 reaped; two native CLI wait4 receipts; main and both known groups absent','unknownChildren':'helper did not launch; other ambient child PIDs were not individually enumerated','bodyEncodesHashesCopies':'two actual transport JSON request byte lengths retained; original resource file acquired once in this driver and propagated through existing APIs; internal transformation counts are not fully instrumented','reportClosureElapsedMsAtAccounting':(time.monotonic()-started)*1000})

owner_resource_records=[]
setup=base/'f11-carrier-installed-setup-05'
for field in ['archives','runtime','projections']:
    d=setup/'resources'/field
    if d.exists():
        records,dirs=inventory(d);owner_resource_records.append({'root':str(d),'records':records,'directories':dirs})
    else: owner_resource_records.append({'root':str(d),'exists':False})
write('owner-resource-census.json',{'scope':'read-only physical final census of allowed Setup05 owner archive/runtime/projection roots','roots':owner_resource_records,'eventResource':physical,'initialDurablePrefixPreserved':True})
write('closure.json',{'status':'CLOSED','role':'Runtime Worker','operation':'T287_F11_C05_CARRIER_EXECUTION_06','returnRole':'Executive; no mutation authority','workResult':'NO_GO_FIRST_CORE_CHILD_PREPARATION_FAILURE_WITH_SECOND_COLD_RESOURCE_FAULT','resourceHandoff':'closed-event-resource-handoff.json','resourceHandoffDigest':handoff_digest,'firstFailure':'first-violated-relations.json','firstChildPredicate':diagnostic['message'],'secondReadPredicate':cold['failure']['fault'],'effects':{'actualPublicCalls':2,'ABGAppendedRecords':44,'ABGAppendedBytes':len(body)-len(old),'failedChildResult':child_failure['payload']['resultRef'],'failedParentResult':parent_failure['payload']['resultRef'],'run':parent_value['run'],'runDisposition':parent_value['disposition'],'helperProviderCalls':0,'sourceGitNetworkSetupQualificationCommands':0},'actualRootActor':'actor://abiogenesis/t287/f11-c05-installed-setup-05/operator','remaining':'successful wrapper-child/J/foldback/parent RunClosed; six actual agreeing cold reads; fresh F11/sole non-greenAF22; nearest negatives; all genuine semantic/context/qualification/release obligations remain unproved','afterResultBeforeJ':'unsupported authoritative selected cut not exercised; unknown','sourceConservation':'conservation.json','allWritesAfterFreeze':'STOPPED','ReviewerActivation':False})
with (root/'return.md').open('x') as f:
    f.write(f'''CLOSED — first actual core-child preparation failure; no repair/retry.

The wrapper Public invocation returned result/exit0 carrying runtime_failed, terminalResult:null. Core qualification child failed before helper/actor dispatch with TypeError: {diagnostic['message']}, stage preparation, installed qualification.js:32 / leaf_invocation_port.js:478. ABG admitted an implementation_exception failure Result, a failure judgment, ordinary failed child foldback, a child_traversal_failed parent Result/failure judgment and run_stopped. No successful qualification J, child/parent graph closure or RunClosed occurred. Root read-only source trace identifies the missing fifth borrowed NativeLeafProofOperations argument on the F_P preparation call as a candidate cause; this Worker made no source changes.

The unchanged frozen flow then attempted one fresh Public run_result read before checking the Run terminal disposition. That distinct second boundary returned exit70, ownerOutput/resources:null, typed resource_admission/invalid_resource_assertion: definition resources differ from the owner-authored structural contract. It appended no events. Full CLI request/stdout/host/owner/native/timing evidence and exact two fault relations are retained. No subsequent replay, F11, AF22 or negative calls occurred.

Actual supervision: {supervisor['elapsedMs']/1000:.3f}s, no timeout, default heap/HOME unchanged, peak main RSS {supervisor['rssBytes']} bytes. Main and two known CLI groups were wait4-observed/reaped and absent at close. No helper/provider launched; prepared response/template/request pins are not actor artifacts. Internal body-transformation counts and ambient child PID population are not fully instrumented; no OOM cause is inferred.

Original Setup05 prefix remains byte-exact: 2,490,814B / SHA7f568a9f3136b274c77730e152097bb47bf655145041dbbc1d92b21a4b74389d / dev16777230 / inode464611665. ABG appended {len(body)-len(old)}B /44records. Latest authentic closed resource is {len(body)}B / SHA{physical['sha256']} / prefix{handoff['prefix']['coordinateDigest']} / handoff{handoff_digest}; stable after process closure, same inode, no event lock. closed-event-resource-handoff.json preserves actual reopening authority; closed-runtime-events.jsonl preserves the exact current complete bytes.

All selected source preimages and old donor metadata remain unchanged. No source, setup/install/catalog/worksite, Git, network, provider,18qualification-command or old-store mutation occurred. Successful whole carrier/cold/F11/AF22 path and meaningful negatives remain required; genuine semantic qualification and release remain unknown. Worker is CLOSED, stops all writes after final-runtime-freeze.json and returns to Executive.
''')
records,dirs=inventory(root)
assert not any(r['kind']=='nonregular' for r in records)
freeze={'status':'CLOSED','role':'Runtime Worker','operation':'T287_F11_C05_CARRIER_EXECUTION_06','actor':'/root/native_applicability_design','frozenAt':datetime.now(timezone.utc).isoformat(),'returnRole':'Executive after CLOSED; no mutation authority','workResult':'NO_GO_FIRST_CORE_CHILD_PREPARATION_FAILURE_WITH_SECOND_COLD_RESOURCE_FAULT','return':'return.md','closure':'closure.json','resourceHandoff':'closed-event-resource-handoff.json','resourceHandoffDigest':handoff_digest,'recordCount':len(records),'bodyBytes':sum(r.get('bytes',0) for r in records),'directoryCount':len(dirs),'symlinks':sum(r['kind']=='symlink' for r in records),'records':records,'directories':dirs,'externalImmutableInputPins':external_input_pins,'authenticExternalEventResource':physical,'excludedSelf':'final-runtime-freeze.json only','copiedPreparationFreeze':'freeze.json is byte-exact Q06 control replica, never this Runtime cut','reportClosureElapsedMsToInventory':(time.monotonic()-started)*1000,'noFurtherWrites':True}
write('final-runtime-freeze.json',freeze)
print(json.dumps({'status':'CLOSED','freeze':str(root/'final-runtime-freeze.json'),'freezeBytes':(root/'final-runtime-freeze.json').stat().st_size,'freezeSHA256':sha_file(root/'final-runtime-freeze.json'),'records':len(records),'bodyBytes':freeze['bodyBytes'],'directories':len(dirs),'symlinks':freeze['symlinks'],'resourceHandoffDigest':handoff_digest,'event':physical,'primary':diagnostic['message'],'secondary':'resource_admission/invalid_resource_assertion','runtimeElapsedMs':supervisor['elapsedMs'],'helperProviderCalls':0}))
