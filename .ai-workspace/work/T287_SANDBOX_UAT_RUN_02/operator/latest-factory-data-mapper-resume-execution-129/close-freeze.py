from pathlib import Path
import json, hashlib, datetime, subprocess, stat

root=Path('/Users/jim/src/apps/abiogenesis')
campaign=root/'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02'
phase=Path(__file__).parent
archive=root/'build_tenants/abiogenesis/typescript/test_env/test_runs/sandbox-uat/data-mapper-full/2026-10-08T17-40-42-399Z-9331fc68-b309-49fb-a8f1-9a544450add9'
worksite=archive/'sandbox/worksite'
store=archive/'resources/events/runtime.events.jsonl'

def read(p): return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);s=p.lstat();assert stat.S_ISREG(s.st_mode) and not p.is_symlink(),str(p)
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return {'path':str(p),'sha256':h.hexdigest(),'byteCount':s.st_size}
def write(n,v):
 p=phase/n
 with p.open('x') as f:f.write(json.dumps(v,indent=2,ensure_ascii=False)+'\n')
 return pin(p)

handoff=read(archive/'final-close-handoff.json');prefix=handoff['prefix'];s=store.stat()
assert s.st_size==prefix['prefixLength'] and s.st_dev==prefix['storeIdentity']['device'] and s.st_ino==prefix['storeIdentity']['inode']
summary=read(archive/'summary.json');oracle=read(archive/'independent-oracle.json');reads=read(archive/'fresh-readback.json')
before=read(archive/'installed-content-before-run.json');after=read(archive/'installed-content-after-run.json')
assert before['observations']==after['observations'] and all(x['contentMatches'] for x in after['observations'])
assert all(x['expected']==x['observed'] for x in read(archive/'source-conservation.json'))
native=read(archive/'commands/lifecycle-start.result.json');outer=read(phase/'commands/data-mapper-full.result.json')
assert native['exitCode']==0 and not native['timedOut'] and not native['truncated'] and native['signal'] is None and native['failure'] is None
assert outer['exitCode']==1 and not outer['timedOut'] and not outer['truncated'] and outer['signal'] is None and outer['failure'] is None
sample=subprocess.run(['ps','-p','85325,85327,88828,46931','-o','pid,ppid,pgid,rss,etime,stat,comm'],capture_output=True,text=True)
assert len(sample.stdout.strip().splitlines())==1,sample.stdout
lock=Path('/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-event-store-locks-v5')/f'{s.st_dev}-{s.st_ino}.lock'
assert not lock.exists(),str(lock)

with store.open('rb') as f:
 f.seek(1309392172);material_event=json.loads(f.read(5023520))
 f.seek(1387241127);parent_raw=f.read(1813642);parent_event=json.loads(parent_raw)
 f.seek(1398509308);stop_raw=f.read(1858);stop=json.loads(stop_raw)
assert hashlib.sha256(parent_raw).hexdigest()=='46291356d40ed3b4dcfb040913fd51576a3dda2e3888f3780e4fd19d15d81178'
parent=parent_event['payload']['value'];assert len(parent['observations'])==30 and parent['terminal'] is False
materials=[];absences=[]
for entry in material_event['payload']['value']['after']['entries']:
 rel=Path(entry['relativePath']);assert not rel.is_absolute() and '..' not in rel.parts
 p=worksite/rel
 for q in [p,*p.parents]:
  if q==worksite.parent:break
  assert not q.is_symlink(),str(q)
 if entry['state']=='absent':assert not p.exists();absences.append(str(p));continue
 assert entry['state']=='file'
 row=pin(p);assert row['sha256']==entry['digest'].removeprefix('sha256:') and row['byteCount']==entry['byteLength'],str(p)
 materials.append(row)
assert len(materials)==48 and len(absences)==1

journal=[json.loads(x) for x in (phase/'milestones.jsonl').read_text().splitlines()]
providers=[x for x in journal if x.get('kind')=='operator_provider_completion']
starts=[x for x in journal if x.get('kind')=='actor_process_started'];exits=[x for x in journal if x.get('kind')=='actor_process_exited']
assert len(providers)==len(starts)==len(exits)==61
assert {x['facts']['actorInvocationRef'] for x in starts}=={x['facts']['actorInvocationRef'] for x in exits}
c2=[x for x in journal if x.get('valueKind')=='worksite_command_execution_observation']
assert len(c2)==14
obs={'closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'classification':'Actual installed native UAT stopped blocked; application incomplete, no framework failure or qualification claim',
 'archive':str(archive),'runRef':parent_event['runId'],'nativeT0':native['started'],'qualityCheckpoint':'2026-10-08T22:45:46.407Z','driverDeadline':'2026-10-08T22:46:46.407Z',
 'nativeCommand':{k:native[k] for k in ['started','wallMs','exitCode','signal','timedOut','truncated','failure']},'outerCommand':{k:outer[k] for k in ['started','wallMs','exitCode','signal','timedOut','truncated','failure']},
 'summary':summary,'nativeDisposition':'blocked','nativeTerminalResult':None,'frameworkFirstCause':None,'stop':{'ordinal':stop['admissionOrdinal'],'eventTime':stop['eventTime'],'eventRef':stop['eventId'],'offset':1398509308,'byteCount':1858,'sha256':hashlib.sha256(stop_raw).hexdigest()},
 'latestSuccessfulJudgedParent':{'ordinal':174956,'offset':1387241127,'byteCount':1813642,'sha256':hashlib.sha256(parent_raw).hexdigest(),'resultRef':parent_event['payload']['resultRef'],'resultDigest':parent_event['payload']['resultDigest'],'observations':30,'terminal':False},
 'earned':{'distinctCompiledDetections':12,'exactBaselineRestorations':12,'requiredDistinctMutants':16,'actualRestoredGreenTests':44,'missingDedicatedINV':['Executor','Accounting','Assurance','Engine'],'fullOriginalUAT':'unmet'},
 'originalOracle':{'disposition':oracle['disposition'],'satisfiedCount':sum(x['disposition']=='satisfied' for x in oracle['criteria']),'criteriaCount':len(oracle['criteria']),'unresolvedCriteria':oracle['unresolvedCriteria']},
 'freshReads':[{'memberKey':x['memberKey'],'outcomeKind':x['ownerOutput']['outcomeKind'],'code':x['ownerOutput'].get('value',{}).get('code'),'status':(x.get('projection') or {}).get('status'),'terminalResult':(x.get('projection') or {}).get('terminalResult')} for x in reads],
 'material':{'fileCount':48,'absentPaths':absences,'nativeAfterOrdinal':165230,'nativeAfterEventSHA256':'33216f37bef4ee3021d3bd48a5b9f55c193a4ca5499308e9fd885f52f6156f8a','allPhysicalFilesMatchNativeAfter':True,'protectedOriginalCount':4,'installedObservationsEqualBeforeAfter':True},
 'providerTotals':{'completedActors':61,'providerWallMsSum':sum(x['provider'].get('duration_ms',0) for x in providers),'turns':sum(x['provider'].get('num_turns',0) for x in providers),'costUSD':sum(x['provider'].get('total_cost_usd',0) for x in providers),'individualReceipts':str(phase/'milestones.jsonl'),'timingLimit':'Provider wall is distinct from command/SBT elapsed; canonical C2/helper artifacts do not declare elapsedMs.'},
 'capacity':{'highestSampledNativeRSSKiB':4490224,'rssIsNotRetainedHeap':True,'eventRows':175991,'eventBytes':s.st_size,'nativeWholeRunMemoryClosureClaim':False},
 'quiescence':{'ownedPIDs':[85325,85327,88828,46931],'ps':sample.stdout,'eventStoreLockPath':str(lock),'lockAbsent':True,'actorStarts':61,'actorExits':61,'operatorSignals':[]},
 'closeHandoff':handoff,'continuation':{'frozen130Unchanged':True,'sourcePreparationExecuted':False,'sourceApplicability':'Not yet dynamically proved','sameWorkspacePreserved':True,'sourceNoneFallback':False}}
observation_pin=write('execution-observations.json',obs)
text='Operator129 is CLOSED, application UNMET. Native CLI exited0 normally after a truthful blocked stop; the outer harness exited1 without timeout, truncation, signal or framework failure. The original oracle is66/67 satisfied: distinct compiled mutation/restoration remains unmet. Current earned evidence is12 detections/12 exact restorations and a later44-test full green. Four dedicated INV checks remain. Independent native assessment is UNMET; terminal/result absent and fresh replay is blocked.\n\nAll61 providers closed; actual duration sum12057482ms,535turns,$199.4624182. Actual native wall14932347.393292ms, outer15680065.245209ms. C2 provider/SBT times are separate from command elapsed, which is not declared by the canonical/helper artifacts. Highest sampled nativeRSS4490224KiB is an RSS observation, not heap or whole-path closure.\n\nBoth installed observations are equal before/after; protected4 sources and48 current files match native after, with one observed absence. All owned processes and the selected event-store lock are absent. No Operator signals or app edits. Latest successful judged parent is174956/result://abiogenesis/b5e95b06c2c7cf7f99836a96b53fe871573ecc8a4bc2b4ea8e74706810445356 (30observations/nonterminal). The authentic closed175991-row prefix is1398511166B, sha256:89c73404ba4550a5b1fa7ece8149b7e0de2f8a2d34ac02506e22239e06bc92f4. Frozen130 dynamic source preparation is a separate Root grant; this return earns no source applicability or next dispatch.\n\nThe exact observed references and timings are in execution-observations.json and the existing milestone journal. Freeze rows describe this closed cut; any future same-workspace authorized iteration must preserve this durable prefix and these frozen receipts. Full original UAT, installed memoryP0 closure and release qualification remain open.\n'
with (phase/'return.md').open('x') as f:f.write(text)
ledger=materials[:]
for name in ['summary.json','SEALED.json','final-close-handoff.json','fresh-readback.json','independent-oracle.json','source-conservation.json','installed-content-before-run.json','installed-content-after-run.json','calls/lifecycle-start.outcome.json','commands/lifecycle-start.request.json','commands/lifecycle-start.result.json','calls/run_result.outcome.json','calls/run_replay.outcome.json','commands/run_result.result.json','commands/run_replay.result.json','runtime-event-prefix.json','supplied-work-transfer.json']:
 p=archive/name
 if p.exists():ledger.append(pin(p))
for p in phase.iterdir():
 if p.is_file() and p.name!='execution-freeze.json':ledger.append(pin(p))
for p in (phase/'commands').iterdir():
 if p.is_file():ledger.append(pin(p))
for ordinal in [58,60,61]:
 x=providers[ordinal-1]
 for k in ['prompt','stdout','stderr','transport']:
  p=x['paths'].get(k)
  if p and Path(p).is_file():ledger.append(pin(p))
ledger.append({'path':str(store),'sha256':prefix['prefixDigest'].removeprefix('sha256:'),'byteCount':s.st_size,'digestBasis':'Authenticated normal owner closeHandoff at this exact full physical prefix; no redundant full-log hash','device':s.st_dev,'inode':s.st_ino})
freeze=write('execution-freeze.json',{'status':'FROZEN','closedAt':obs['closedAt'],'observations':observation_pin,'ledger':ledger,'absences':absences,'prefix':prefix,'limitations':['Application incomplete; full originalUAT/qualification/memoryP0 open','Dynamic source applicability and continuation not earned','No whole-history copy/replay or redundant log hash performed']})
print(json.dumps({'return':pin(phase/'return.md'),'observations':observation_pin,'freeze':freeze,'ledgerRows':len(ledger),'status':'FROZEN'}))
