from pathlib import Path
import json,hashlib,datetime,collections,os
X=Path(__file__).resolve().parent
D=X.parent/'final-f11-native-assessment-01'
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_bytes())
def record(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def put(n,v):
 with (X/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
activation=read(X/'native-activation.json');result=read(X/'native-result.json');handoff=read(X/'final-handoff.json')
assert result['ordinaryCalls']==5 and result['assessmentDispatches']==1 and result['freshReads']==2
assert result['actualDisposition']=='runtime_failed' and result['judgmentProduced'] is False
outer=read(X/'outer-process-result.json');driver=read(X/'driver-process.json')
assert outer['reaped'] and outer['allOwnedGroupsClosed'] and not outer['timedOut']
assert driver['exitCode']==0 and driver['signal'] is None
conserved=[]
for f in [activation['callerFreeze'],activation['boundFreeze']]:
 assert record(Path(f['path']))==f
 root=Path(f['path']).parent;freeze=read(Path(f['path']))
 for r in freeze['records']:
  actual=record(root/r['path']);assert actual['bytes']==r['bytes'] and actual['sha256']==r['sha256'],r['path']
 conserved.append({'freeze':f,'verifiedRecords':len(freeze['records']),'bytesConserved':True})
event=Path(handoff['reopenAuthority']['eventLogPath']);actual=record(event)
snap=record(X/'final-native-prefix.jsonl');assert actual['bytes']==snap['bytes'] and actual['sha256']==snap['sha256']
assert 'sha256:'+actual['sha256']==handoff['prefix']['prefixDigest'] and actual['bytes']==handoff['prefix']['prefixLength']
s=event.stat();assert s.st_dev==16777230 and s.st_ino==464012478
old=read(D/'initial-resource-snapshot.json');old_bytes=Path(old['path']).read_bytes()
with event.open('rb') as f:assert f.read(len(old_bytes))==old_bytes
lock=Path(read(D/'resource-plan.json')['lockDirectory'])/'16777230-464012478.lock';assert not lock.exists()
events=[]
with (X/'final-native-prefix.jsonl').open() as f:
 for line in f:events.append(json.loads(line))
assert len(events)==136
new=events[84:];counts=collections.Counter(e['kind'] for e in new)
assert counts['c_call_opened']==1 and counts['actor_invocation_started']==1
assert not any(e['kind'].startswith('qualification_judgment') for e in new)
transport_path=Path(read(D/'resource-plan.json')['archiveRoot'])/'fp-b68fe61de98cfd71-transport.json'
t=read(transport_path)
assert t['disposition']=='failure' and t['failureClass']=='transport_failure' and t['status']==1
assert t['terminationConfirmed'] and t['exitObserved'] and not t['timedOut'] and t['toolCallCount']==0
archives=[transport_path.with_name('fp-b68fe61de98cfd71-'+suffix) for suffix in ['prompt.txt','output.txt','stdout.log','stderr.log','transport.json']]
archive_records=[record(p) for p in archives]
pin=read(D/'bound-input-pin.json');assert archive_records[0]['sha256']==pin['prompt']['sha256'] and archive_records[0]['bytes']==1021244
streams=[json.loads(line) for line in archives[2].read_text().splitlines() if line]
native_result=next(v for v in streams if v.get('type')=='result')
assert native_result['is_error'] is True and 'ENOTFOUND' in native_result['result']
assert native_result['total_cost_usd']==0
allowed=['actorRef','workerBindingRef','rendererRef','materializationPlanRef','implementationRef','cCallRef',
 'actorInvocationRef','processRef','requestRef','requestDigest','inputDigest','promptDigest','instructionContractRef',
 'resultContractRef','transportBindingRef','transportBindingDigest','transportLane','disposition','failureClass',
 'status','signal','attempt','programLocusRef','inputByteLength','outputByteLength','dispatchOrdinal','lane','command','cwd','responseJsonSchemaDigest','transportPlanDigest','transportContractDigest']
selected=[]
for e in new:
 if e['kind'] in ['c_call_opened','actor_transport_binding_admitted','actor_invocation_started','actor_process_started','actor_result_artifact_observed','actor_invocation_failed','c_call_judged','run_stopped']:
  selected.append({'ordinal':e['admissionOrdinal'],'eventRef':e['eventId'],'kind':e['kind'],
   'payload':{k:e['payload'][k] for k in allowed if k in e['payload']}})
processes=[{'label':label,**read(X/('f11-'+label+'-native-process.json'))} for label in activation['budgets']['operationPlan']]
cold=read(X/'cold-results.json')['cold']
evidence={'status':'CLOSED_native_transport_failure','nativeCalls':5,'assessmentOccurrences':counts['c_call_opened'],
 'actorInvocations':counts['actor_invocation_started'],'assessmentDispatches':1,'externalAssessmentRetries':0,
 'actualRun':read(X/'actual-assessment-owner-value.json')['run'],'semanticQualificationJudgmentProduced':False,
 'actualNativeEvents':selected,'newEventKinds':dict(counts),'finalEventCount':136,'newEventCount':52,
 'prompt':archive_records[0],'fullPromptEqualFrozenOwnerRender':True,'inputCanonicalBytes':67784040,
 'transport':{k:t.get(k) for k in ['kind','lane','disposition','failureClass','status','signal','timedOut','timeoutClass','timeoutMs','absoluteTimeoutMs','exitObserved','terminationConfirmed','apiRetryCount','toolCallCount','nativeResultAssessment']},
 'provider':{'error':native_result['result'],'reportedUsage':native_result['usage'],'reportedCostUSD':native_result['total_cost_usd'],
  'durationMs':native_result['duration_ms'],'durationAPIMs':native_result['duration_api_ms'],
  'claim':'Actual native Claude reported ENOTFOUND. This is a native transport observation; underlying DNS/network cause, provider context capacity and semantic assessment remain unknown. Ten retries belong to the existing CLI within this single occurrence.'},
 'freshReads':{'resultOutcome':cold['actualResultOutcome']['outcomeKind'],'resultValue':cold['actualResultOutcome']['value'],
  'replayOutcome':cold['actualReplayOutcome']['outcomeKind'],'terminalEqual':cold['terminalEqual'],'replayEqual':cold['replayEqual'],'prefixUnchanged':True},
 'cost':{'driver':driver,'nativeProcesses':processes,'totalElapsedMs':outer['elapsedMs'],'eventGrowthBytes':67953322,
  'memoryLimit':'4096 MiB managed Node old-space each; no OS/Claude hard RSS limit. Driver peakRSS exceeds heap setting because RSS also includes buffers/native allocations; it is not a heap-cap violation.'},
 'externalArchives':archive_records,'currentNativeEventResource':actual,'finalHandoff':record(X/'final-handoff.json')}
put('observed-native-evidence.json',evidence)
put('conservation.json',{'status':'VERIFIED','callerAndBinding':conserved,'currentResource':actual,
 'finalPrefix':handoff['prefix'],'storeDevice':s.st_dev,'storeInode':s.st_ino,'finalEventCount':136,
 'prior84ByteConserved':True,'freshReadsAppendedEvents':False,'originalLockAbsent':True,
 'allOwnedProcessesReaped':True,'workerSourceInstallWorksiteAuthEdits':False,
 'claim':'Complete caller/binding records verified after execution; original native prefix conserved and only the one observed native assessment event history appended. No broad source freshness or user-state audit invented.'})
put('closure.json',{'status':'CLOSED','disposition':'incomplete','activation':'T287_F11_NATIVE_ASSESSMENT_01',
 'actualOutcome':'runtime_failed','firstBrokenRelation':'Claude transport could not reach provider: native result ENOTFOUND; no raw assessment-raw@5 value/J',
 'nativeOrdinaryCalls':5,'nativeAssessmentOccurrences':1,'freshReads':2,'providerReportedTokens':0,'providerReportedCostUSD':0,
 'mechanismEvidence':'Actual selected task/plan -> ordinary installed admission -> one eligible actor request/full prompt -> native transport failure -> Runtime failure closure -> matching fresh result/replay; original prefix and dependencies conserved.',
 'semanticAssessmentCompleted':False,'qualificationJProduced':False,'fullF11OrAF22Verdict':None,
 'triangulation':{'ProductDesign':'Selected rule-assessment Program/strict input law/source context passed local/current owner joins; no upstream defect established.',
  'Integration':'One complete frozen task/plan/full render traversed ordinary view/conformance/start and actual CCall/actor path.',
  'IdentityAuthority':'Original root owner/W/policy/grant admitted; actual assessor fields retained. Historical semantic author/independence attribution remains unassessed without J.',
  'LifecycleEffects':'Native process exit and transport termination confirmed; failed Run closed lawfully, exact returned handoff reopened for two fresh reads; no retry dispatch or manual repair.',
  'Proof':'No semantic raw value/qualification J/terminal Result; generic CCall failure judgment is not qualification J. Result notfound and failed replay agree; no synthetic proof.',
  'Cost':'Complete 67.8MB input admitted; unchanged 1.02MB prompt archived. Native test took 291.6s, driver peakRSS 5.25GB, assessment CLI peakRSS 3.86GB, event growth67.95MB. Provider reports zero tokens/cost; context acceptance unknown.'},
 'escapeCause':'Provider reachability is operational and was unknown before actual native dispatch; no shell-DNS inference was used as an extra gate. Failed result escaped no owner check: it is retained truthfully.',
 'smallestNextOwner':'Root selects restoration/verification of native provider access, then a separately granted future assessment if desired. No Product/source/HOW repair established, no automatic retry.',
 'unknowns':['underlying ENOTFOUND cause','provider context/model-capacity acceptance','semantic criterion/grouping/applicability findings','construction attribution/assessment-author independence adequacy','full F11/AF22 qualification'],
 'remainingProcesses':[],'sourceChanges':False,'callerOrBindingChanges':False,'governingControl':'STDO2.5.1RC2','candidateLaw':'Immutable C02/Q02 RC1'})
put('construction-attribution.json',{'activation':'T287_F11_NATIVE_ASSESSMENT_01','worker':'/root/f11_validation_path_plan',
 'grant':activation['grant'],'writeTerritory':str(X),'callerFreeze':activation['callerFreeze'],'boundFreeze':activation['boundFreeze'],
 'externalConstruction':'Execution launcher/activation/observations/closure/return/freeze only; frozen caller does actual owner construction and existing Runtime/transport own native events/archive/temp effects',
 'sourceOrCandidateAuthorship':'Unchanged; no historical semantic attribution/independent acceptance invented',
 'protectedEdits':False,'manualEventLockEdits':False,'nativeOccurrence':selected,'closed':True})
text='''CLOSED — incomplete semantic validation; actual failure closure/readback proven.

The one genuine assessment followed the existing installed Public path. CatalogView and exact assessment Program conformance passed; the original actor/W/policy/grant admitted the complete final task/plan. One actual CCall/actor invocation delivered the unchanged 1,021,244-byte prompt to Claude closed_prompt_proof with zero tools.

Claude reported `ENOTFOUND` and could not reach the API server. Existing transport recorded `transport_failure`, status1, confirmed exit/termination, no timeout or signal, ten internal API retries within this one occurrence, empty raw output, zero reported tokens and zero reported cost. No assessment-raw@5 value, qualification J or typed terminal Result was produced. The underlying network/DNS cause and provider context acceptance remain unknown; no semantic/attribution/grouping verdict is claimed.

Runtime returned a genuine `runtime_failed` Run and lawful close handoff. Both fresh ordinary reads completed before semantic checks: result returned typed notfound refusal/exit1, replay returned the matching failed Run/exit0. Reads appended no events. The original84-event5,577,377-byte prefix is byte-conserved; the same device16777230/inode464012478 now closes at136events73,530,699bytes (+67,953,322bytes), raw digest146ff8220cfb3e4a9edae4148a955ae936a3dc9aa4c8b1e0da4345ead771d20c, coordinate digestbf357bac4ba5677870972d63726db8e1ab50fd349b48d87ad8e4768201bb80ce. Original lock absent, all owned native groups closed/reaped, driver exit0 without timeout/signal. All67 caller and66 binding freeze records remain unchanged.

Total actual execution291,588.677ms; assessment CLI230,848.694ms. Driver peakRSS5,254,938,624bytes; assessment CLI3,856,596,992bytes. Managed Node old-space was4096MiB; RSS includes buffers/native allocations and has no installed OS/Claude hard cap. Complete canonical input67,784,040bytes and all39whole bodies/ten hosts were retained, with no context trimming or capacity pass.

First broken relation is native provider reachability, before a raw semantic response. No Product/requirements/design/source defect is established by this observation. Root owns provider restoration and any separately granted later assessment; no automatic second dispatch, C2/Hello restart or repair occurred. Qualification, semantic F11 and historical author/independence adequacy remain open. Control law is STDO2.5.1RC2; immutable candidate/evidence qualification law remains RC1. Exact detailed producer fields, processes, costs, readbacks and artifact routes are in observed-native-evidence.json/conservation.json/closure.json/final-handoff.json.
'''
with (X/'return.md').open('x') as f:f.write(text)
records=[]
for p in sorted(X.rglob('*')):
 if p.is_file() and p.name!='freeze.json':
  assert not p.is_symlink();b=p.read_bytes();records.append({'path':str(p.relative_to(X)),'kind':'file','mode':p.stat().st_mode&0o777,'bytes':len(b),'sha256':sha(b)})
put('freeze.json',{'kind':'external_worker_frozen_return','activation':'T287_F11_NATIVE_ASSESSMENT_01','status':'CLOSED','disposition':'incomplete',
 'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'controlBasis':'stdo://releases/v2.5.1-rc.2/',
 'candidateQualificationLaw':'Immutable C02/Q02 RC1','records':records,'callerFreeze':activation['callerFreeze'],'boundFreeze':activation['boundFreeze'],
 'externalNativeArtifacts':archive_records,'closedNativeEventResource':actual,'finalPrefix':handoff['prefix'],
 'nativeOrdinaryCalls':5,'assessmentOccurrences':1,'freshReads':2,'processesClosed':True,
 'claim':'Genuine single assessment dispatch/full native prompt/failure closure and fresh reads established; provider ENOTFOUND prevented semantic J. No F11/AF22 pass.'})
print(json.dumps({'status':'CLOSED','disposition':'incomplete','freeze':record(X/'freeze.json'),'records':len(records),
 'eventCount':136,'nativeBytes':73530699,'semanticJ':False,'cause':'Native Claude transport ENOTFOUND'}))
