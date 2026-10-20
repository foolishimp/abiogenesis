from pathlib import Path
import json, hashlib, os, subprocess, datetime, time
repo=Path('/Users/jim/src/apps/abiogenesis');work=repo/'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';phase=work/'operator/latest-factory-data-mapper-resume-execution-109';prep=work/'operator/crosscut-selector-successor-107';review=work/'operator/crosscut-selector-publication-review-108'
archive=repo/'build_tenants/abiogenesis/typescript/test_env/test_runs/sandbox-uat/data-mapper-full/2026-10-08T11-03-59-815Z-2bc13a8e-699b-47d7-8caf-3b5703747b4c';log=archive/'resources/events/runtime.events.jsonl'
def pin(p):
 p=Path(p);s=p.lstat();assert p.is_file()and not p.is_symlink()and p.resolve()==p;h=hashlib.sha256()
 with p.open('rb')as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return {'path':str(p),'sha256':h.hexdigest(),'byteCount':s.st_size}
def j(p):return json.loads(Path(p).read_text())
def write(name,value):
 with (phase/name).open('x')as f:f.write(json.dumps(value,indent=2)+'\n')
def row(off):
 with log.open('rb')as f:f.seek(off);d=json.loads(f.readline());return d.get('event',d)
summary=j(archive/'summary.json');native=j(archive/'commands/lifecycle-start.result.json');outer=j(phase/'commands/data-mapper-full.result.json');assert summary['uatPass']is False
before=j(archive/'installed-content-before-run.json');after=j(archive/'installed-content-after-run.json');assert before['observations']==after['observations'];assert all(x['contentMatches']for x in after['observations'])
sources=j(archive/'source-conservation.json');assert len(sources)==4 and all(x['expected']==x['observed']for x in sources)
material=j(work/'operator/latest-factory-data-mapper-resume-prep-98/material-freeze.json');conserved=[]
for expected in material['ledger']:
 actual=pin(expected['path']);assert actual==expected;conserved.append(actual)
transfer=j(archive/'supplied-work-transfer.json');assert len(transfer['originalSources'])==4 and len(transfer['transferred'])==44 and transfer['oldProducerCreditImported']is False
for x in transfer['transferred']:
 p=archive/'sandbox/worksite'/x['path'];a=pin(p);assert 'sha256:'+a['sha256']==x['digest']and a['byteCount']==x['byteCount']
for x in sources:assert 'sha256:'+pin(archive/'sandbox/worksite'/x['path'])['sha256']==x['expected']
for expected in j(prep/'freeze.json')['ledger']:assert pin(expected['path'])==expected
stat1=log.stat();logpin=pin(log);owned=[42859,42861,46391,46437,47011,48078];ps=subprocess.run(['ps','-p',','.join(map(str,owned)),'-o','pid,ppid,pgid,etime,rss,comm'],capture_output=True,text=True)
pidFacts=[]
for pid in owned:
 try:os.kill(pid,0);state='present; no containment conclusion'
 except ProcessLookupError:state='absent/ESRCH'
 except PermissionError:state='uncertain/EPERM'
 pidFacts.append({'pid':pid,'observation':state})
time.sleep(1);stat2=log.stat();assert (stat1.st_dev,stat1.st_ino,stat1.st_size,stat1.st_mtime_ns)==(stat2.st_dev,stat2.st_ino,stat2.st_size,stat2.st_mtime_ns)
write('owned-process-and-quiescence.json',{'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exactOwnedPids':pidFacts,'psExitCode':ps.returncode,'psOutput':ps.stdout,'signalsSent':[],'nativeAndProviderExitFactsFromAdmittedEvents':True,'store':logpin,'stableObservationMs':1000,'stableDevice':stat2.st_dev,'stableInode':stat2.st_ino,'stableMtimeNs':str(stat2.st_mtime_ns),'scopeLimit':'Exact owned PID observations and finite store stability only; no global census, future-writer or containment claim. C2 command terminationConfirmed is admitted owner evidence; helper PID was not independently sampled.'})
b1=row(4788141)['payload'];b2=row(9608707)['payload'];b3=row(16115637)['payload'];t3=j(b3['paths']['transport']);raw=t3['finalOutput'];assert raw.splitlines()[0]=='```json'and raw.splitlines()[-1]=='```'
try:json.loads(raw);rawJsonRefusal=None
except json.JSONDecodeError as e:rawJsonRefusal={'name':type(e).__name__,'message':str(e),'position':e.pos}
providers=[]
for n,b in [(1,b1),(2,b2),(3,b3)]:
 for line in Path(b['paths']['stdout']).read_text().splitlines():
  v=json.loads(line)
  if v.get('type')=='result':providers.append({'actorOrdinal':n,**{k:v.get(k)for k in ['duration_ms','num_turns','total_cost_usd','subtype','is_error','stop_reason']}})
fresh=j(archive/'fresh-readback.json');readFacts=[]
for x in fresh:
 out=x['ownerOutput'];v=out['value'];p=v.get('projection',{})if isinstance(v,dict)else{}
 readFacts.append({'memberKey':x['memberKey'],'outcomeKind':out['outcomeKind'],'refusalCode':v.get('code')if isinstance(v,dict)else None,'projectionKind':p.get('kind'),'status':p.get('status'),'terminalResult':p.get('terminalResult')})
oracle=j(archive/'independent-oracle.json');last=row(14385118)['payload']['value'];assert last['original']==row(8984387)['payload']['value']['state']['original']and len(last['observations'])==1 and last['terminal']is False
observations={'role':'Operator109 CLOSED/STOPPED','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'archive':str(archive),'runRef':'run://abiogenesis/86143ef0981cc0bb0fa629547c37b0a4a8d425f62c9026dfc9905b71c973ca94','nativeT0':native['started'],'qualityCheckpoint':'2026-10-08T16:09:12.430Z','driverDeadline':'2026-10-08T16:10:12.430Z','native':{k:native[k]for k in ['exitCode','signal','wallMs','timedOut','truncated','failure']},'outer':{k:outer[k]for k in ['exitCode','signal','wallMs','timedOut','truncated','failure']},'summary':summary,'providers':providers,'providerTotals':{'wallMs':sum(x['duration_ms']for x in providers),'costUsd':sum(x['total_cost_usd']for x in providers)},'origin':{'actor':3,'bindingOrdinal':1672,'presentation':b3['instructionAssembly']['request']['responsePresentation'],'hasJsonSchemaArg':'--json-schema'in b3['args'],'promptBytes':211239,'rawFinalOutputDigest':'sha256:'+hashlib.sha256(raw.encode()).hexdigest(),'rawFinalOutputBytes':len(raw.encode()),'firstLine':raw.splitlines()[0],'lastLine':raw.splitlines()[-1],'unmodifiedRawJsonRefusal':rawJsonRefusal,'nativeResultAssessment':t3['nativeResultAssessment'],'admittedFailure':{'ordinal':3675,'offset':22829515,'byteCount':89109,'sha256':'d3119f3faf02445c3362ff0d8084ad79fbc6604191857a621d8f83edf9a66c9f','failureClass':'contract_failure'},'downstreamRuntimeFailure':{'ordinal':3685,'offset':22949794,'byteCount':2436,'sha256':'746e4622ce1c5466283e053d51fafdd49ecf5fb3c9ab8dc71f6f67bba4be2006','diagnostic':'application-foldback-mismatch'}},'acceptedBoundedEvidence':'First selector result_text with canonical schema/native admitted JSON1254/choice1267/task1294; actual C2 green1568 with physical8 XML44/0/0 and conserved parent1598. Detailed coordinates in milestones.jsonl. No full-original qualification earned.','lastLawfulParent':{'ordinal':1598,'offset':14385118,'byteCount':183778,'sha256':'ed1f062ce98032d2fa278514f32b89dd9b982426219b15a5fdd5105b5afc782e','originalConserved':True,'observations':1,'terminal':False},'freshPublicReads':readFacts,'independentOracle':{'disposition':oracle['disposition'],'criteria':len(oracle['criteria']),'unresolved':len(oracle['unresolvedCriteria'])},'installedBarrier':{'beforeAfterEqual':True,'bothContentMatch':True},'conservation':{'protectedOriginals':4,'suppliedAuthors':44,'old48LedgerRows':52,'old48FullPinsFreshMatch':True,'new48SelectedFilePinsMatch':True,'frozen107LedgerRows':52,'frozen107FreshMatch':True},'store':logpin,'mutationCredit':{'freshDetections':0,'freshRestorations':0,'requiredDistinctMutants':16,'old11Imported':False},'memorySamplesKiB':{'nativeObserved': [570032,573360,561856],'harnessObservedPeak':1996048,'scope':'Passive samples only, not peak-RSS or capacity closure'},'operatorReadPremises':'Pure diagnostic accessors initially assumed source/argv keys or dict fresh-read shape; corrected to actual sourceObservedInput/args/list owner carriers. No runtime alteration or retry; earliest tool receipts retained in session.','effectsStop':'Native run and recorder closed normally; no retry, manual app edit, Source repair, normalizer, private event or signal. Closed owned PID receipt discloses finite scope.'}
write('observations.json',observations)
text=f'''Operator109 CLOSED / first framework nonpass, no retry.

Candidate22 original Data Mapper resume reached genuine provider success, strict native admission1254, selected full Testing1267 and task1294. Actual C2 Result1568 produced eight authenticated XML reports:44tests/0fail/0error, nine conserved predicates,26source members and ProductDelta[]. Parent1598 retains the complete original with one observation/nonterminal. Fresh mutation credit remains0/16; old11producers were never imported.

Selector3 returned Markdown-fenced JSON (first line `\u0060\u0060\u0060json`, last `\u0060\u0060\u0060`),11655UTF8 bytes, SHA9e566e3b2c9bc547167382584d3ae1cc0cd9161f67c32697dc3649a416f48f7e. The unchanged raw JSON owner refused at character0; nativeResultAssessment rejected, actor3675 contract_failure. Runtime3685 application-foldback-mismatch is downstream. No normalization, repair or retry occurred.

Native CLI exit0/runtime failure after297357.339ms; outer exit1 after617685.984ms. Neither timed out nor truncated. Actual T0 remains2026-10-08T11:09:12.430Z; historical quality checkpoint16:09:12.430Z/driver16:10:12.430Z were not reached. Provider actors:51.758s/1turn/$0.696247;67.885s/3turns/$0.341182;158.298s/1turn/$1.0343214. Provider wall sum277.941s/$2.0717504. Full original oracle UNMET,67criteria/12unresolved; fresh run_result refused not_found, replay has no terminal.

All4protected originals/44supplied authored files,52old48ledger rows and52frozen107rows freshly match. Installed before/after barriers equal with both contentMatches true. Exact owned recorder/harness/CLI/providers are absent; no signals were sent. Finite store stability and PID scope are recorded without global containment claim. Pure operator accessor premise errors are disclosed in observations; no ABG input/guard was changed.

Evidence: [observations](observations.json), [milestones](milestones.jsonl), [owned process/quiescence](owned-process-and-quiescence.json); archive `{archive}`. Source request/schema, prompt, raw streams, output, transport, helper artifact, fresh reads and complete store are hash-bound by execution-freeze.json. Root owns independent triage and any next repair/retry. This return claims bounded provider/C2 progress only, never UAT/P0/qualification/release closure.
'''
with (phase/'return.md').open('x')as f:f.write(text)
paths=[phase/'launch.mjs',phase/'close.py',phase/'execution-activation.json',phase/'milestones.jsonl',phase/'observations.json',phase/'owned-process-and-quiescence.json',phase/'return.md']+list((phase/'commands').glob('*'))+[prep/'return.md',prep/'freeze.json',prep/'setup.json',prep/'resume-config.json',review/'return.md',review/'pins.json']
paths += [archive/x for x in ['SEALED.json','run.json','workload-source.json','prepared-definition-call.json','summary.json','supplied-work-transfer.json','installed-content-before-run.json','installed-content-after-run.json','fresh-readback.json','source-conservation.json','independent-oracle.json','final-close-handoff.json','runtime-event-prefix.json']]
for b in [b1,b2,b3]:paths += [Path(x)for x in b['paths'].values()if Path(x).is_file()]
paths += list((archive/'commands').glob('lifecycle-start.*'))+list((archive/'commands').glob('run_result.*'))+list((archive/'commands').glob('run_replay.*'))
o=row(10623288)['payload']['value'];paths.append(Path(o['provenance']['helperArtifactPath']))
ledger=[pin(p)for p in dict.fromkeys(paths)];ledger.append(logpin)
write('execution-freeze.json',{'status':'FROZEN/STOPPED','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'return':pin(phase/'return.md'),'observations':pin(phase/'observations.json'),'ownedStop':pin(phase/'owned-process-and-quiescence.json'),'ledger':ledger,'conservationSource':{'materialReceipt':pin(work/'operator/latest-factory-data-mapper-resume-prep-98/material-freeze.json'),'freshRows':52,'sourceAndPublicationReceipt':pin(prep/'freeze.json'),'freshRows107':52},'readOnlyScope':'No further execution/write effects after this freeze; independent Root triage next.'})
for name in ['return.md','observations.json','owned-process-and-quiescence.json','execution-freeze.json']:print(json.dumps(pin(phase/name)))
