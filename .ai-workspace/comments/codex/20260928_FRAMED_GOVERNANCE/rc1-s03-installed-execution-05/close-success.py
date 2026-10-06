from pathlib import Path
import datetime,hashlib,json,os,stat
D=Path(__file__).resolve().parent;G=D.parent;O=G/'rc1-s03-installed-execution-03';F=G/'rc1-s03-installed-execution-04';C=G/'final-candidate-construction-03';P=G/'rc1-s03-input-preparation-01'
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
grant=G/'rc1-s03-cold-read-controls-05/request.txt';assert sha(grant)=='0582902ec690d3a5cb9ff873a69e33f84f0bc9d229d5446204e556780d709492'
assert sha(O/'freeze.json')=='ba1fcefd7259d3641f187fcefb1e545f45dfecb321fb273b2ab5d1e04e7f59bd'
assert sha(F/'freeze.json')=='0a6d8fc532c846bc694c68da16d097ab16182247f4993e041a2dff93ce2f2b97'
assert sha(C/'final-freeze.json')=='a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'
assert sha(F/'failure-final-handoff.json')=='b8800176a0e7b64e5156f1a6f7cf817f353f83da67d023b07144ce514419fe8d'
result=read(D/'pair-result.json');assert result['status']=='passed' and not (D/'failure.json').exists()
assert result['pair']['combinedFreshReads']==8 and result['pair']['newStarts']==0 and result['coldAppendBytes']==0
positive=read(F/'positive/oracle-result.json');negative=read(D/'no-action/oracle-result.json')
assert positive['status']==negative['status']=='passed'
assert positive['identity']['runtimeStatus']=='closed' and negative['identity']['runtimeStatus']=='gap_stopped'
assert positive['identity']['run']!=negative['identity']['run']
oldstatic=[r for r in read(O/'freeze.json')['records'] if r['path']!='resources/events/runtime.events.jsonl']
for r in oldstatic:
 p=O/r['path'];assert stat.S_IMODE(p.lstat().st_mode)==r['mode']
 if r['kind']=='symlink':assert p.is_symlink() and os.readlink(p)==r['target'] and str(p.resolve())==r['targetResolved']
 else:assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
fourcount=verify(F,read(F/'freeze.json')['records'])
for root,expected in [(O,{r['path'] for r in read(O/'freeze.json')['records']}|{'freeze.json'}),(F,{r['path'] for r in read(F/'freeze.json')['records']}|{'freeze.json'})]:
 actual=set()
 for at,dirs,names in os.walk(root,followlinks=False):
  for name in names:actual.add(str((Path(at)/name).relative_to(root)))
 assert actual==expected,str(root)
sourcecount=verify(C,read(C/'final-source-freeze-manifest.json')['members'])
cutcount=verify(C,read(C/'final-freeze.json')['records'])
identity=read(C/'final-package-identity.json');members=read(C/'final-archive-members.json')
bootstrapcount=verify(Path(identity['packageRoot']),members)
runtimecount=verify(O/'resources/installed/core/node_modules/@abiogenesis/typescript-tenant',members)
prepcount=verify(P,read(P/'freeze.json')['records']);pincount=verify(Path('/'),read(P/'source-pins.json')['records'])
origins=read(D/'input-correspondence.json')['originalCopiesAndCallerOrigins']
for r in origins:
 if r.get('copiedByteExact'):assert sha(D/r['path'])==r['sha256']==sha(Path(r['origin'])),r['path']
boundcount=verify(D,read(D/'runtime-bound-inputs.json')['records'])
donor=read(P/'donor-selection.json');assert sha(Path(donor['archive']['path']))==donor['archive']['sha256']
save('preservation.json',{'old03FailureFreeze':rec(O/'freeze.json'),'old04ExecutionFreeze':rec(F/'freeze.json'),
 'old03StaticRecordsConserved':len(oldstatic),'old04FullRecordsConserved':fourcount,'oldFilePopulationsConserved':True,
 'oldPositiveProof':rec(F/'positive/oracle-result.json'),'oldNegativeStartReceipt':rec(F/'s03-no-action-start-stdout.json'),
 'C03Freeze':rec(C/'final-freeze.json'),'C03ConstructionRecordsVerified':cutcount,'C03SourceMembersVerified':sourcecount,
 'bootstrapPayloadMembersVerified':bootstrapcount,'existingRuntimePayloadMembersVerified':runtimecount,
 'S03PreparationRecordsVerified':prepcount,'externalPinsVerified':pincount,'runtimeBoundInputRecordsVerified':boundcount,
 'originalCopiesConserved':[r['path'] for r in origins if r.get('copiedByteExact')],'fixtureArchive':rec(Path(donor['archive']['path'])),
 'sourceCoreFixturePackageRepairEffects':0,'oldHistoricalStoreAppendExceptionDuring05':False})

plan=read(D/'resource-plan.json');store=Path(plan['eventLogPath']);before=store.stat();raw=store.read_bytes();after=store.stat()
assert (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)
assert (before.st_dev,before.st_ino,len(raw))==(16777230,464429281,4709556)
assert hashlib.sha256(raw).hexdigest()=='26339994e902ccafa5c1f6da9d8df471d77a1a3e144843f7472e5f1558f989df'
assert raw==(F/'failure-final-prefix.jsonl').read_bytes()
original=(O/'failure-final-prefix.jsonl').read_bytes();assert len(original)==2490961 and raw[:len(original)]==original
initial=read(D/'initial-physical.json');final=read(D/'final-physical.json')
for field in ['bytes','sha256','device','inode','mtimeMs','prefix']:assert initial[field]==final[field],field
assert final['mtimeMs']==plan['before']['mtimeMs']
locks=[final['lockPath'],read(F/'failure-final-physical.json')['lockPath'],read(O/'failure-final-physical.json')['lockPath']]
assert all(not Path(p).exists() for p in locks)
rows=[json.loads(line) for line in raw.splitlines() if line];assert len(rows)==566
assert sum(r['kind']=='run_segment_opened' for r in rows)==2
boundary=read(D/'final-handoff.json');assert boundary==read(F/'failure-final-handoff.json')
save('physical-prefix-conservation.json',{**final,'old03InitialPrefix':rec(O/'failure-final-prefix.jsonl'),
 'old04FullPrefix':rec(F/'failure-final-prefix.jsonl'),'old03OriginalPrefixConserved':True,'old04FullPrefixConserved':True,
 'physicalIdentityAndMtimeConserved':True,'allFourColdOwnerHandoffsConserved':True,'allOldStoresStrictlyReadOnly':True,
 'nativeAppendBytes':0,'eventCount':len(rows),'RunCount':2,'lockPaths':locks,'allLocksAbsent':True,
 'newStoreCreated':False,'genuineFinalHandoff':boundary})

calls=result['currentReadCalls'];assert [r['label'] for r in calls]==['no-action-'+k for k in ['run_result','run_replay','run_status','run_gaps']]
contracts=read(D/'output-consumption-contracts.json');processes=[];selected=[]
for row in calls:
 stem='s03-'+row['label'];native=read(D/(stem+'-native-process.json'));timing=read(D/(stem+'-timing.json'))
 receipt=read(D/(stem+'-stdout.json'))['receipt'];call=read(D/(stem+'.jsonl'))['invocation']
 expected='refusal' if row['label']=='no-action-run_result' else 'result';exit_key={'result':'acceptedTerminal','refusal':'refused','nonterminal':'acceptedNonTerminal'}[expected]
 declaration=next(d for d in contracts['readDefinitions'] if d['definitionKey']==row['definitionKey']);expected_exit=declaration['adapterExitMap'][exit_key]
 assert receipt['failure'] is None and receipt['ownerOutput']['outcomeKind']==expected and receipt['exitCode']==expected_exit
 assert native['exitCode']==expected_exit and native['signal'] is None and not timing['terminal']['timedOut'] and timing['terminal']['signal'] is None and timing['processFailure'] is None
 assert receipt['resources']['eventResource']['closeHandoff']==boundary
 if expected=='refusal':assert receipt['ownerOutput']['value']['code']=='not_ready'
 assert 'c03-s03-05-no-action-' in call['invocation']['requestRef']
 processes.append({'label':row['label'],**native,'stageElapsedMs':timing['elapsedMs'],'terminal':timing['terminal'],
  'expectedSemanticOutcome':expected,'selectedAdapterSlot':exit_key,'selectedAdapterExit':expected_exit})
 selected.append({'label':row['label'],'definitionKey':row['definitionKey'],'invocationRef':row['invocationRef'],
  'requestPacket':rec(D/(stem+'.jsonl')),'ownerReceipt':rec(D/(stem+'-stdout.json')),
  'ownerOutputKind':expected,'ownerExitCode':expected_exit,'returnedSameGenuineHandoff':True})
driver=read(D/'driver-process.json');assert driver['ownedExitObserved'] and driver['exitCode']==0 and driver['signal'] is None and not driver['timedOut']
owned={driver['pid']}|{p['pid'] for p in processes}|{p['terminal']['pid'] for p in processes}
for pid in owned:
 try:os.kill(pid,0)
 except ProcessLookupError:continue
 raise AssertionError('Owned PID still exists '+str(pid))
cost={'newNativePublicCalls':len(processes),'newStartsSetupConformanceCalls':0,'pureNominalProductPreparations':1,'newFreshReads':4,'combinedFreshReads':8,
 'driver':driver,'previous04DriverElapsedMs':read(F/'driver-process.json')['elapsedMs'],'previous03DriverElapsedMs':read(O/'driver-process.json')['elapsedMs'],
 'costInterpretation':'Native05 cold read cost is separate from retained prior setup/start costs. Existing two Runs and positive proof were reused.',
 'nativeCLIElapsedMs':sum(p['elapsedMs'] for p in processes),'maximumNativeCLIPeakRSSBytes':max(p['peakRSSBytes'] for p in processes),
 'sumPerCallPeakRSSBytes':sum(p['peakRSSBytes'] for p in processes),'RSSInterpretation':'Sum of independent peaks is not concurrent memory or model traffic.',
 'nativeUserSeconds':sum(p['userSeconds'] for p in processes),'nativeSystemSeconds':sum(p['systemSeconds'] for p in processes),
 'selectedRequestBytes':sum(r['requestPacket']['bytes'] for r in selected),'selectedReceiptBytes':sum(r['ownerReceipt']['bytes'] for r in selected),
 'rawLogBytes':len(raw),'eventGrowthBytes':0,'processes':processes,'allOwnedPIDsExited':True,'ownedPIDCount':len(owned),
 'modelProviderNetworkGitSourceBuildCoreFixtureEffects':0,'timersHeapToolsChanged':False,'timeoutSignalCount':0}
save('selected-calls.json',selected);save('cost-and-process-closure.json',cost)

frontier=negative['cold']['run_gaps']['value']['projection']['frontiers'][0]
assert frontier['basis']['value']['gapProjection']['actual']==3 and frontier['basis']['value']['gapProjection']['desired']==10
assert frontier['basis']['value']['observationSnapshot']['domain']['unaffected']==read(D/'original-oracle.json')['initialDomain']['unaffected']
pair_join={'kind':'bounded_original_s03a_pair_conjunction','status':'evidence_ready_for_independent_assurance','candidate':read(C/'final-selected-core.json')['basis'],
 'C03Freeze':rec(C/'final-freeze.json'),'originalOracle':rec(D/'original-oracle.json'),'originalConsumers':rec(D/'original-consumers.mjs'),
 'positive':{'originalFullOracleProof':rec(F/'positive/oracle-result.json'),'run':positive['identity']['run'],'executionBasis':positive['identity']['executionBasis'],
  'runtimeStatus':'closed','actual':10,'desired':10,'unaffected':frontier['basis']['value']['observationSnapshot']['domain']['unaffected'],
  'coldReads':4,'coldAppendBytes':0,'terminalProducer':positive['cold']['run_result']['value']['projection']['terminalResult']['producer']},
 'negative':{'originalFullOracleProof':rec(D/'no-action/oracle-result.json'),'causalProof':rec(D/'negative-causal-oracle.json'),
  'run':negative['identity']['run'],'executionBasis':negative['identity']['executionBasis'],'runtimeStatus':'gap_stopped','actual':3,'desired':10,
  'unaffected':frontier['basis']['value']['observationSnapshot']['domain']['unaffected'],'freshReads':4,'resultOutcome':'refusal/not_ready',
  'nativeStartOutcomePreserved':'nonterminal/gap_stop/acceptedNonTerminal3','terminalResult':negative['cold']['run_replay']['value']['projection']['terminalResult'],
  'frontierSource':'Only actual Public run_gaps owner output; event rows verify lineage and never supply missing projection data.',
  'publicHandoff':negative['rendering'],'missingAssetRefs':frontier['nextAction']['value']['missingAssetRefs'],
  'unfulfilledObligationRefs':frontier['nextAction']['value']['targetObligationRefs'],'coldAppendBytes':0},
 'pairRelations':result['pair'],'actual08FreshCLIProofCount':8,'originalPositiveProofRetained':True,
 'sameSelectionMeaning':'Same exact C03/ProductSet/lock/WorkspaceBinding/Program/start/resolution/root policy; fresh root execution bases remain distinct and source-bound because semantic inputs differ by correctionAvailable.',
 'sourceAndStoreConserved':True,'wholeS03Claim':False,'qualificationClaim':False,'acceptanceClaim':False,
 'limits':['Original bounded S03a automatic correction/truthful stop pair only','No arbitrary native software correction credit',
  'Remaining fullS03 control/disposition/consequence, wholeF11/seven seeds/qualification/AF22/release stay open','Root separately assigns independent Product-first assurance and conjoins']}
save('pair-conjunction.json',pair_join)
closure_frames={'Product/Owner':'Original bounded correction and truthful no_action outcomes now have both full original causal/cold proofs.',
 'Design/Integration':'The external assertion is the accepted six-key owner contract; semantic outcome/transport exit selection now consumes each actual declaration. No new runtime mechanism.',
 'Identity/Install':'One accepted immutable C03/archive/manifest/catalog and original fixture; source, payload and all retained preparation cuts conserved.',
 'Lifecycle':'Two existing actual Runs are reused. Positive closes; negative remains truthfully gap_stopped/not_ready. All owned cold processes exited and genuine handoffs agree.',
 'Effects':'Only four fresh Public read calls in05. Every old store/member is read-only, same physical prefix/hash/mtime; zero append or source effect.',
 'Proof':'Unchanged original independent oracles passed both cases. Public frontier supplies the domain handoff itself; causal rows only check producing I/B/Run/result/judgment/route joins.',
 'Reuse/Cost':'No duplicate installation, conformance or start; positive04 proof and negative04 native start retained. Actual05 cost separated from prior operations.'}
save('closure-frames.json',{'frames':closure_frames,'reentry':'realization_refactor in external caller/proof consumption completed within05 grant',
 'ownerImplementationChanges':0,'sharedMethodProductDesignChanges':0,'selfAcceptance':False})
return_text=f'''# T287 installed C03 S03a pair — CLOSED evidence ready

The complete bounded original S03a pair now passes on the sole accepted C03. Positive04 corrects target 3→10, preserves unaffected item/value/evidence 7, refreshes the four authorities, and reaches actual parent/Run closure. Negative04/05 retains target 3, exposes missing correction capability and the unfulfilled target, produces truthful `no_action`/`gap_stop`, and admits no false completion. Both unchanged original causal/cold oracles pass. [Pair conjunction]({D/'pair-conjunction.json'}) binds both existing Runs and eight combined separate fresh CLI reads.

This05 activation performed only four Public reads of the existing negative Run. `run_result` returned the expected typed `not_ready` refusal/exit1; replay/status/gaps returned actual results. The old negative start remains its valid nonterminal/exit3 receipt. Public `run_gaps` itself supplies actual3/desired10/missing capability/handoff/unfulfilled obligation and unaffected7. The renderer uses only that Public output; events verify lineage and never fill data. Same exact C03/fixture/Program/start/resolution/root policy/WorkspaceBinding, input difference only `correctionAvailable`; each Run keeps its own producing execution basis.

The store is strictly unchanged throughout05: {len(raw):,} bytes, 566 events/two Runs, dev/inode `{before.st_dev}/{before.st_ino}`, raw SHA `{sha(store)}`, same mtime and genuine close handoff. All four reads append zero bytes. The original {len(original):,}-byte03 prefix, full04 prefix, all {len(oldstatic)} other03 static records, all {fourcount}04 records/full positive proof and both old file populations remain conserved. All task locks are absent.

Closure reverified {cutcount} C03 construction records, {sourcecount} frozen source members, {bootstrapcount} bootstrap and {runtimecount} existing runtime payload members, {prepcount} preparation records/all {pincount} external pins, original fixture/oracle copies and all {boundcount} pre-effect05 inputs. No source/core/fixture/tool/package settings changed.

Actual05 driver elapsed {driver['elapsedMs']/1000:.3f}s inside the 600s budget. All {len(owned)} owned PIDs exited without timeout/signal; maximum native CLI peak RSS {cost['maximumNativeCLIPeakRSSBytes']:,} bytes. Four selected requests total {cost['selectedRequestBytes']:,} bytes and receipts {cost['selectedReceiptBytes']:,} bytes. Prior03/04 cost remains separate. No setup/conformance/start/continue, native helper/model/provider/network/Git or broad campaign ran; Hello was retained.

This CLOSED return supplies bounded S03a evidence for Root's separate independent assurance, with no self-acceptance or qualification claim. Full S03 control/disposition/consequence and scenario qualification, whole-subject F11/seven seeds, AF22 and release closure remain open. Processes and writes stop at freeze.
'''
with (D/'return.md').open('x') as f:f.write(return_text)
save('closed-state.json',{'status':'CLOSED','workResult':'bounded_pair_evidence_ready','activation':'T287_RC1_S03_INSTALLED_COLD_READS_05',
 'role':'Runtime/read Worker','actor':'/root/rc1_successor_builder','allFourFreshReads':'passed','bothOriginalCausalColdOracles':'passed','combinedFreshReads':8,
 'newStartsSetupConformanceCalls':0,'oldStoresAllReadOnly':True,'appendBytes':0,'allOwnedPIDsExited':True,
 'qualificationClaim':False,'acceptanceClaim':False,'writeStop':'After freeze creation, no further writes or effects by this activation.'})
records=[];directories=[]
for root,dirs,names in os.walk(D,followlinks=False):
 for name in dirs:directories.append(str((Path(root)/name).relative_to(D)))
 for name in names:
  p=Path(root)/name
  if p==D/'freeze.json':continue
  s=p.lstat();assert p.is_file() and not p.is_symlink(),str(p)
  records.append({'path':str(p.relative_to(D)),'kind':'file','mode':stat.S_IMODE(s.st_mode),'bytes':s.st_size,'sha256':sha(p)})
records.sort(key=lambda r:r['path'])
freeze={'kind':'installed_s03a_complete_bounded_pair_freeze','status':'CLOSED','workResult':'bounded_pair_evidence_ready',
 'activation':'T287_RC1_S03_INSTALLED_COLD_READS_05','role':'Runtime/read Worker','actor':'/root/rc1_successor_builder',
 'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'request':rec(grant),'C03Freeze':rec(C/'final-freeze.json'),
 'old03Freeze':rec(O/'freeze.json'),'old04Freeze':rec(F/'freeze.json'),'oldCurrentStore':rec(store),
 'nativeReadCalls':4,'combinedFreshCLIReads':8,'newStarts':0,'bothOriginalCausalColdOracles':'passed',
 'physicalPrefixAppendBytes':0,'qualificationClaim':False,'acceptanceClaim':False,'return':'return.md','conjunction':'pair-conjunction.json',
 'records':records,'directories':sorted(directories),'inventory':{'files':len(records),'fileBytes':sum(r['bytes'] for r in records)},
 'stop':'All owned processes exited and writes stopped; Root separately assigns independent assurance/conjoins; no fullS03/F11/AF22/release claim.'}
save('freeze.json',freeze)
print(json.dumps({'status':'CLOSED','workResult':freeze['workResult'],'freeze':rec(D/'freeze.json'),'inventory':freeze['inventory'],
 'bothOriginalOracles':'passed','combinedFreshReads':8,'newStarts':0,'oldStoreAppendBytes':0,'old03StaticConserved':len(oldstatic),'old04RecordsConserved':fourcount}))
