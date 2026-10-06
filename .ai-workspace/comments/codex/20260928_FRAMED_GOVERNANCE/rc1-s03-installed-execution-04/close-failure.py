from pathlib import Path
import datetime,hashlib,json,os,stat
D=Path(__file__).resolve().parent;G=D.parent;O=G/'rc1-s03-installed-execution-03';C=G/'final-candidate-construction-03';P=G/'rc1-s03-input-preparation-01';H=G/'rc1-c03-conformance-caller-repair-01'
read=lambda p:json.loads(p.read_text())
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return h.hexdigest()
def rec(p):return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def save(n,v):
 with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def verify(root,rs):
 for r in rs:
  p=root/r['path'];assert p.is_file() and p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
 return len(rs)
grant=G/'rc1-c03-installed-discriminator-repair-controls-02/s03-request.txt'
assert sha(grant)=='c1b45835e842986ed1bab29f6ea781747fcb5b8780b9f60e67b6584a160fc164'
assert sha(O/'freeze.json')=='ba1fcefd7259d3641f187fcefb1e545f45dfecb321fb273b2ab5d1e04e7f59bd'
assert sha(C/'final-freeze.json')=='a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'
assert sha(H/'freeze.json')=='636b261b43337cc4cb42d7faf9e0503e91e80c4ff2c6f64238d19bc4e0580262'
assert sha(D/'conformance-resources.mjs')==sha(H/'conformance-resources.mjs')=='62d160eba67201396730064290fefb1b9262ea20f7f93fa223b6e6c6867a7251'

old=read(O/'freeze.json');exception='resources/events/runtime.events.jsonl';static=[]
for r in old['records']:
 if r['path']==exception:continue
 p=O/r['path'];assert stat.S_IMODE(p.lstat().st_mode)==r['mode'],str(p)
 if r['kind']=='symlink':assert p.is_symlink() and os.readlink(p)==r['target'] and str(p.resolve())==r['targetResolved'],str(p)
 else:assert p.is_file() and p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
 static.append(r)
old_actual=set()
for root,dirs,names in os.walk(O,followlinks=False):
 for n in names:old_actual.add(str((Path(root)/n).relative_to(O)))
assert old_actual=={r['path'] for r in old['records']}|{'freeze.json'},sorted(old_actual-({r['path'] for r in old['records']}|{'freeze.json'}))
sourcecount=verify(C,read(C/'final-source-freeze-manifest.json')['members'])
cutcount=verify(C,read(C/'final-freeze.json')['records'])
identity=read(C/'final-package-identity.json');members=read(C/'final-archive-members.json')
bootstrapcount=verify(Path(identity['packageRoot']),members)
runtimecount=verify(O/'resources/installed/core/node_modules/@abiogenesis/typescript-tenant',members)
prepcount=verify(P,read(P/'freeze.json')['records']);pins=read(P/'source-pins.json')['records'];pincount=verify(Path('/'),pins)
origins=read(D/'input-correspondence.json')['originalCopiesAndCallerOrigins']
for r in origins:
 if r.get('copiedByteExact'):assert sha(D/r['path'])==r['sha256']==sha(Path(r['origin'])),r['path']
donor=read(P/'donor-selection.json');assert sha(Path(donor['archive']['path']))==donor['archive']['sha256']
save('preservation.json',{'C03Freeze':rec(C/'final-freeze.json'),'C03ConstructionRecordsVerified':cutcount,'C03SourceMembersVerified':sourcecount,
 'bootstrapPayloadMembersVerified':bootstrapcount,'existingRuntimePayloadMembersVerified':runtimecount,
 'oldFailureFreeze':rec(O/'freeze.json'),'oldStaticRecordsConserved':len(static),'oldPopulationUnchangedExceptAppend':True,
 'oldImmutableFailureSnapshot':rec(O/'failure-final-prefix.jsonl'),'S03PreparationRecordsVerified':prepcount,'externalPinsVerified':pincount,
 'fixtureArchive':rec(Path(donor['archive']['path'])),'originalCopiesConserved':[r['path'] for r in origins if r.get('copiedByteExact')],
 'candidateSourceFixtureRepairEffects':0,'priorLiveStoreByteEqualityClaim':False,'soleException':exception})

physical=read(D/'failure-final-physical.json');store=Path(physical['path']);before=store.stat();raw=store.read_bytes();after=store.stat()
assert (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)
assert (before.st_dev,before.st_ino)==(16777230,464429281)
assert len(raw)==physical['bytes']==4709556 and hashlib.sha256(raw).hexdigest()==physical['sha256']=='26339994e902ccafa5c1f6da9d8df471d77a1a3e144843f7472e5f1558f989df'
original=(O/'failure-final-prefix.jsonl').read_bytes();assert len(original)==2490961 and raw[:len(original)]==original
assert raw==(D/'failure-final-prefix.jsonl').read_bytes()
assert not Path(physical['lockPath']).exists() and not Path(read(O/'failure-final-physical.json')['lockPath']).exists()
rows=[json.loads(line) for line in raw.splitlines() if line]
run_opens=[r for r in rows if r['kind']=='run_segment_opened'];assert len(run_opens)==2
negative=read(D/'s03-no-action-start-stdout.json')['receipt'];output=negative['ownerOutput']
assert negative['failure'] is None and negative['exitCode']==3 and output['outcomeKind']=='nonterminal' and output['value']['disposition']=='gap_stop'
negative_run=output['value']['run'];negative_rows=[r for r in rows if r.get('runId')==negative_run['ref']]
assert not any(r['kind']=='run_closed' for r in negative_rows)
assert sum(r['kind']=='run_stopped' for r in negative_rows)==1
handoff=read(D/'failure-final-handoff.json');assert handoff==negative['resources']['eventResource']['closeHandoff']
assert handoff==read(D/'s03-no-action-start-handoff.json')['closeHandoff']
prefix_relation={**physical,'eventCount':len(rows),'RunCount':len(run_opens),'initialBytes':len(original),'appendedBytes':len(raw)-len(original),
 'initialPrefixSHA256':hashlib.sha256(original).hexdigest(),'initialPrefixConserved':True,'physicalIdentityConserved':True,
 'oldStaticRecordsConserved':len(static),'oldFreezeAndFailureSnapshotConserved':True,'oldPopulationConserved':True,
 'genuineFinalHandoff':handoff,'finalSnapshotByteExact':True,'bothOldAndNewTaskLocksAbsent':True,
 'priorLiveStoreByteEqualityClaim':False,'storeMutationOwner':'Only ordinary ABG admission during the two declared starts; no direct event author/copy/edit'}
save('prefix-append-and-static-preservation.json',prefix_relation)

failure=read(D/'failure.json');calls=failure['actualCalls'];assert len(calls)==7
positive=read(D/'positive/oracle-result.json');assert positive['status']=='passed'
assert len(failure['results'])==1 and failure['results'][0]['caseKey']=='positive'
assert (D/'positive/after-prefix.jsonl').read_bytes()==(D/'positive/after-reads-prefix.jsonl').read_bytes()
assert not any((D/('s03-no-action-'+key+'.jsonl')).exists() for key in ['run_result','run_replay','run_status','run_gaps'])
pos_input=read(D/'positive/start-preparation.json')['input'];neg_input=read(D/'no-action/start-preparation.json')['input']
assert {**pos_input,'correctionAvailable':False}==neg_input
save('bounded-progress.json',{'status':'partial_first_failure_stopped','correctedConformance':'passed',
 'positive':failure['results'][0],'positiveFullOriginalCausalAndColdOracle':'passed','positiveFreshReads':4,'positiveColdAppendBytes':0,
 'negative':{'run':negative_run,'nativeOwnerOutcome':output['outcomeKind'],'nativeDisposition':output['value']['disposition'],
 'nativeFailure':negative['failure'],'nativeExitCode':negative['exitCode'],'rootEvents':len(negative_rows),
 'observedRunStoppedEvents':sum(r['kind']=='run_stopped' for r in negative_rows),'observedRunClosedEvents':0,
 'fourColdReads':'unexecuted','fullOriginalNegativeOracle':'not reached before caller assertion stop','genuineHandoff':handoff},
 'pairInputsDifferOnlyByCorrectionAvailable':True,'newCLICalls':len(calls),'setupCallsRepeated':0,'ProgramStartsRepeated':0,
 'fullPairAccepted':False,'qualificationClaim':False,'acceptanceClaim':False})

processes=[]
for row in calls:
 stem='s03-'+row['label'];native=read(D/(stem+'-native-process.json'));timing=read(D/(stem+'-timing.json'))
 assert native['signal'] is None and timing['terminal']['signal'] is None and not timing['terminal']['timedOut']
 assert native['exitCode']==(3 if row['label']=='no-action-start' else 0)
 processes.append({'label':row['label'],**native,'stageElapsedMs':timing['elapsedMs'],'terminal':timing['terminal'],
 'callerProcessFailure':timing['processFailure'],'nativeOwnerFailure':None,
 'callerMisclassifiedAcceptedNonTerminal':row['label']=='no-action-start'})
driver=read(D/'driver-process.json');assert driver['ownedExitObserved'] and driver['exitCode']==1 and driver['signal'] is None and not driver['timedOut']
owned={driver['pid']}|{p['pid'] for p in processes}|{p['terminal']['pid'] for p in processes}
for pid in owned:
 try:os.kill(pid,0)
 except ProcessLookupError:continue
 raise AssertionError('Owned PID still exists: '+str(pid))
cost={'actualNewNativePublicCalls':len(processes),'plannedNewCalls':11,'unexecutedNegativeReads':4,'pureNominalProductPreparations':2,
 'setupCLICallsRepeated':0,'ProgramStarts':2,'positiveFreshReads':4,'negativeFreshReads':0,'providerModelCalls':0,
 'driver':driver,'priorActivationDriverElapsedMs':read(O/'driver-process.json')['elapsedMs'],
 'reuseCostInterpretation':'The retained prior setup failure cost is separate; no setup native calls, installation, package or Hello were repeated.',
 'nativeCLIElapsedMs':sum(p['elapsedMs'] for p in processes),'maximumNativeCLIPeakRSSBytes':max(p['peakRSSBytes'] for p in processes),
 'sumPerCallPeakRSSBytes':sum(p['peakRSSBytes'] for p in processes),'RSSInterpretation':'Sum of separate peaks is not concurrent memory or model traffic.',
 'nativeUserSeconds':sum(p['userSeconds'] for p in processes),'nativeSystemSeconds':sum(p['systemSeconds'] for p in processes),
 'processes':processes,'allOwnedPIDsExited':True,'ownedPIDCount':len(owned),'timeoutsSignals':0,
 'nativeOwnerFailures':0,'callerConsumptionStops':1,'sourceBuildFixtureNetworkGitEffects':0}
save('cost-and-process-closure.json',cost)

sourcebase=C/'final-source/build_tenants/abiogenesis/typescript/code/src'
outcome_source=sourcebase/'product/run_invocation_operation.ts'
map_source=sourcebase/'shared/public_function_contracts.ts'
declaration_source=sourcebase/'product/run_operation_contracts.ts'
rootcause={'kind':'multi_frame_first_new_relation_triage','activation':'T287_RC1_S03_INSTALLED_PAIR_04',
 'actualNativeOwnerOutcome':output['outcomeKind'],'actualNativeDisposition':output['value']['disposition'],'nativeExitCode':negative['exitCode'],
 'nativeOwnerFailure':negative['failure'],'failingConsumer':'ordinary-caller.mjs invoke expected-exit assertion, called by negative start with default expected result',
 'firstViolatedRelation':'Public nonterminal gap_stop -> declared acceptedNonTerminal exit 3 -> external caller expectation/exit assertion',
 'callerExpectedOutcome':'result','callerExpectedExit':0,
 'actualReceipt':rec(D/'s03-no-action-start-stdout.json'),'actualCall':rec(D/'s03-no-action-start.jsonl'),
 'outcomeOwner':{**rec(outcome_source),'lines':[719,755]},'exitMapOwner':{**rec(map_source),'lines':[40,62]},
 'startDeclaration':{**rec(declaration_source),'lines':[111,118]},
 'externalCaller':{**rec(D/'ordinary-caller.mjs'),'lines':[45,51,71]},'callerStartSite':{**rec(D/'driver.mjs'),'lines':[128,129]},
 'frames':[
 {'frame':'Product/Owner','finding':'A truthful stop remains nonterminal. Existing Product maps gap_stopped to nonterminal/gap_stop and exposes the genuine Run/close handoff.'},
 {'frame':'Design/Public transport','finding':'The start declaration uses the three-way runtime exit map: terminal result 0, refusal 1, accepted nonterminal 3.'},
 {'frame':'Integration','finding':'The external helper maps only result/refusal and the negative start uses its default result expectation, so it misclassifies a valid nonterminal as a process failure.'},
 {'frame':'Identity/Install','finding':'Same exact C03 and original fixture, binding, catalog/View, Program and actor. Pure owners reacquired nominal objects; old producer body/digest joins passed.'},
 {'frame':'Lifecycle','finding':'Both actual starts already ran. Positive closed with all four cold reads/oracles; negative stopped truthfully and closed the event resource. The four negative cold reads were never dispatched.'},
 {'frame':'Effects','finding':'Two ordinary owner starts appended to the same allowed physical store; old initial prefix and every other frozen member are conserved. No correction/restart/retry followed the stop.'},
 {'frame':'Proof','finding':'Conformance repair proved input admission, but external output consumption did not cover the third declared outcome. Positive proof remains bounded and retained; full pair conjunction is incomplete.'},
 {'frame':'Reuse/Cost','finding':'Reuse worked: no setup calls or packaging repeated. The remaining proof can consume the already existing negative Run/handoff with four cold reads; no third start is needed.'},
 ],
 'supportedCause':'The Worker retained a result-only default for the negative start and a result/refusal-only adapter selection in the external caller, despite the declared nonterminal outcome.',
 'escape':'Preparation bound the corrected input assertion and expected semantic gap_stop but did not join that semantic outcome to the actual owner discriminator and adapter exit map.',
 'scope':'External caller/proof consumption; no Product/core/runtime implementation defect established.',
 'organizationalSiloingEstablished':False,'siloedCallerContractApplicationSupported':True,
 'recurringPattern':'External proof helpers reconstruct owner contracts from partial assumptions. The missing relations are different: prior exact input shape, now the complete semantic output/transport outcome sum.',
 'completeApplicabilityCone':'External generic invoke expectation/mapping and every runtime invocation caller that can legally return nonterminal, including start/continue and applicable interaction surfaces. Definitions and runtime owners already declare those outputs.',
 'smallestReentry':'realization_refactor','repairOwner':'Separate Root-selected external caller/proof Worker',
 'minimumRepair':'Select acceptedTerminal/acceptedNonTerminal/refused from the actual definition adapter map for the explicit expected semantic outcome; keep native failure checks and actual receipt discriminator checks. Negative start evidence remains immutable.',
 'minimumRemainingExecution':'Only four separate fresh run_result/run_replay/run_status/run_gaps calls on the existing negative Run and latest genuine close handoff. Result expected refusal not_ready/exit1. Original causal and cold oracles then join both existing Runs and same input/basis/Program.',
 'priorSuccessesToConserve':'Nine setup calls, corrected conformance, both actual starts, complete positive original causal/cold proof, initial physical prefix and immutable failure records.',
 'repairsRetriesAfterFailure':0,'qualificationClaim':False}
save('root-cause.json',rootcause)
root_text=f'''# S03 continuation: accepted nonterminal misread by external caller

`T287_RC1_S03_INSTALLED_PAIR_04` is CLOSED at its first new relation failure. Corrected conformance passed. The positive start and its four separate fresh reads passed the unchanged original causal/cold oracles. The negative start returned a valid `nonterminal` / `gap_stop` with CLI exit 3 and no native failure. The caller expected `result` / exit 0 and stopped before four negative reads.

The first violation is output consumption: actual Public semantic discriminator → declared adapter exit map → caller expectation. [Product outcome owner]({outcome_source}:737) explicitly maps `gap_stopped` to nonterminal. [Shared exit map]({map_source}:55) assigns `acceptedNonTerminal: 3`, and [start declaration]({declaration_source}:118) selects that map. [The external caller]({D/'ordinary-caller.mjs'}:49) chooses only refusal/result; [the negative call site]({D/'driver.mjs'}:128) retained the result-only default. I authored that incomplete expectation in this Worker activation. The native receipt has `failure: null`; its outcome is correct.

| Frame | Supported finding |
|---|---|
| Product / Owner | Truthful gap stop is nonterminal, with an actual Run and handoff. |
| Design / Public transport | Existing three-way exit map distinguishes result 0, refusal 1 and accepted nonterminal 3. |
| Integration | The external generic helper and negative start expectation cover only two outcome kinds. |
| Identity / Install | Exact C03/fixture/Program/binding/catalog/View were conserved; same-process nominal and actual pure catalog joins passed. |
| Lifecycle / Effects | Both Runs exist. Positive closed; negative stopped with no Run completion. The same physical store advanced only through declared owner admission. |
| Proof | Input conformance is now proved. Complete output discrimination was missing from caller checks. Positive proof survives; negative fresh readback and full pair conjunction remain open. |
| Reuse / Cost | Nine setup calls were reused. Only four negative reads remain; another setup or start would duplicate completed work. |

This supports an external caller/proof realization miss. It does not establish a core/runtime defect or organizational siloing. It repeats the broader contract-reconstruction pattern at a different join: the complete Public output sum and adapter map.

Smallest re-entry is `realization_refactor`. A separate Worker can map all three declared expected outcomes through the actual definition map, then perform only the four missing fresh reads on the retained negative Run `{negative_run['ref']}`. Preserve native failure checks, the original oracles and all earlier successful evidence. No setup, conformance, packaging or third start is needed.

The final physical store contains {len(rows)} events/two Runs, {len(raw):,} bytes, dev/inode `{before.st_dev}/{before.st_ino}`, raw SHA `{physical['sha256']}`. Its first {len(original):,} bytes exactly match the immutable old failure snapshot. All {len(static)} other old records and the old freeze remain exact; no additional old files appeared. Both old/new task locks are absent and every owned process exited.

See [root-cause.json]({D/'root-cause.json'}), [bounded-progress.json]({D/'bounded-progress.json'}) and [prefix-append-and-static-preservation.json]({D/'prefix-append-and-static-preservation.json'}) for exact pins and the latest genuine continuation basis. No retry or repair followed the stop.
'''
with (D/'root-cause.md').open('x') as f:f.write(root_text)
return_text=f'''# T287 S03a C03 continuation — CLOSED partial proof

Corrected native conformance passed. The positive start reached target 10, conserved unaffected value/evidence 7, closed its parent/Run, and passed the original causal oracle plus all four separate fresh Public Result/replay/status/gaps reads. Cold reads appended zero bytes. This is bounded S03a positive evidence on exact C03, subject to Root's separate assurance.

The negative native start returned `nonterminal` / `gap_stop`, accepted exit 3, `failure: null`. The external caller expected result/exit0 and stopped at that assertion. Both actual Runs exist; four negative fresh reads and the complete original negative oracle were unexecuted. [Triangulated root cause]({D/'root-cause.md'}) selects external caller/proof `realization_refactor`; no runtime/core defect is established.

This activation reused nine completed setup calls and performed seven of eleven planned new native calls: one corrected conformance, two starts, four positive reads. Actual driver elapsed was {driver['elapsedMs']/1000:.3f}s; no timeout or signal occurred, and all {len(owned)} owned PIDs exited. Maximum native CLI peak RSS was {cost['maximumNativeCLIPeakRSSBytes']:,} bytes. The prior 172.849s setup-failure cost is retained separately. Model/provider/network/Git/source/build/fixture/core repair effects were zero; no Hello was restarted.

The physical store advanced through ordinary owners from {len(original):,} to {len(raw):,} bytes on the same device/inode. The exact original prefix, old freeze, immutable failure snapshot and all {len(static)} other old records remain conserved, with no extra old files. Final raw SHA `{physical['sha256']}`, {len(rows)} events, two Runs, lock absent. [Append relation]({D/'prefix-append-and-static-preservation.json'}) states the sole historical live-store exception explicitly.

Closure reverified {cutcount} C03 construction records, {sourcecount} frozen source members, {bootstrapcount} bootstrap and {runtimecount} existing runtime payload members, {prepcount} closed preparation records/all {pincount} external pins, original fixture/oracle copies and shared helper. The latest genuine handoff is `failure-final-handoff.json`; negative Run is `{negative_run['ref']}`.

Root separately selects an exact four-read negative successor and independent assurance. Preserve corrected conformance, both starts and the complete positive proof. No third start or setup replay is needed. This CLOSED return claims no full pair acceptance, full S03, F11, qualification, AF22 or release. No retry/repair followed the first new stop; writes end at freeze.
'''
with (D/'return.md').open('x') as f:f.write(return_text)
save('closed-state.json',{'status':'CLOSED','activation':'T287_RC1_S03_INSTALLED_PAIR_04','role':'Runtime Worker','actor':'/root/rc1_successor_builder',
 'workResult':'partial_first_failure_stopped','correctedConformance':'passed','positiveFullOriginalOracle':'passed','negativeOwner':'accepted nonterminal/gap_stop',
 'negativeFreshReads':0,'newNativeCalls':len(calls),'qualificationClaim':False,'acceptanceClaim':False,'repairRetryAfterFailure':0,
 'allOwnedPIDsExited':True,'sourceCoreFixtureReadonly':True,'soleHistoricalStoreOwnerAppendException':True,
 'oldStaticRecordsConserved':len(static),'initialPhysicalPrefixConserved':True,'writeStop':'After freeze creation, no further effects or writes by this activation.'})
records=[];directories=[]
for root,dirs,names in os.walk(D,followlinks=False):
 for name in list(dirs):
  p=Path(root)/name
  if p.is_symlink():names.append(name);dirs.remove(name)
  else:directories.append(str(p.relative_to(D)))
 for name in names:
  p=Path(root)/name
  if p==D/'freeze.json':continue
  s=p.lstat();r={'path':str(p.relative_to(D)),'mode':stat.S_IMODE(s.st_mode)}
  if p.is_symlink():r.update({'kind':'symlink','target':os.readlink(p),'resolvedTarget':str(p.resolve())})
  else:assert p.is_file();r.update({'kind':'file','bytes':s.st_size,'sha256':sha(p)})
  records.append(r)
records.sort(key=lambda r:r['path'])
freeze={'kind':'installed_s03a_continuation_partial_failure_freeze','status':'CLOSED','workResult':'partial_first_failure_stopped',
 'activation':'T287_RC1_S03_INSTALLED_PAIR_04','actor':'/root/rc1_successor_builder','role':'Runtime Worker',
 'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'request':rec(grant),'C03Freeze':rec(C/'final-freeze.json'),
 'oldFailureFreeze':rec(O/'freeze.json'),'sharedPureConstructorFreeze':rec(H/'freeze.json'),
 'soleHistoricalStoreAppendRelation':'prefix-append-and-static-preservation.json','correctedConformance':'passed',
 'positiveFullOriginalCausalColdOracle':'passed','negativeNativeOutcome':'nonterminal/gap_stop','negativeColdReads':0,
 'qualificationClaim':False,'acceptanceClaim':False,'return':'return.md','triage':'root-cause.json','records':records,'directories':sorted(directories),
 'inventory':{'files':sum(r['kind']=='file' for r in records),'symlinks':sum(r['kind']=='symlink' for r in records),'fileBytes':sum(r.get('bytes',0) for r in records)},
 'stop':'All owned processes exited and writes stopped; no retry or repair; Root separately assures/conjoins/selects any successor.'}
save('freeze.json',freeze)
print(json.dumps({'status':'CLOSED','workResult':freeze['workResult'],'freeze':rec(D/'freeze.json'),'inventory':freeze['inventory'],
 'positive':'passed','negativeColdReads':0,'oldStaticRecordsConserved':len(static),'storeBytes':len(raw),'events':len(rows),'Runs':len(run_opens)}))
