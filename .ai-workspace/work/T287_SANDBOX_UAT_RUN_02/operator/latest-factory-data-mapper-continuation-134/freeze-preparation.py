from pathlib import Path
import json,hashlib,datetime,subprocess,stat

phase=Path(__file__).parent
inputs=json.loads((phase/'inputs.json').read_text());archive=Path(inputs['archive'])
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);s=p.lstat();assert stat.S_ISREG(s.st_mode) and not p.is_symlink(),str(p);h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return {'path':str(p),'sha256':h.hexdigest(),'byteCount':s.st_size}
def write(name,value):
 p=phase/name
 with p.open('x') as f:f.write(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
 return pin(p)

current130=Path(inputs['currentClosedPhase'])
for row in inputs['pins']:assert pin(row['path'])==row,row['path']
assert read(phase/'safe-auth-readiness.json')['safeAuth']['loggedIn'] is True
assert (phase/'launch.mjs').read_bytes()==(current130/'launch.mjs').read_bytes()
for name in ['execute-continuation.mjs','execute-source-preparation.mjs','preflight.mjs']:assert 'environment:process.env' in (phase/name).read_text()
setup=read(phase/'continuation-setup.json');request=read(phase/'calls/continuation-start.request.jsonl');call=request['invocation'];source=call['resources']['source']['basis']
original=read(archive/'calls/lifecycle-start.request.jsonl')['invocation'];handoff=read(current130/'final-close-handoff.json')
result=read(phase/'commands/dynamic-source-preparation.result.json')
assert result['exitCode']==0 and result['failure'] is None and result['signal'] is None and not result['timedOut'] and not result['truncated']
with (archive/'resources/events/runtime.events.jsonl').open('rb') as f:f.seek(1387241127);raw=f.read(1813642)
assert hashlib.sha256(raw).hexdigest()=='46291356d40ed3b4dcfb040913fd51576a3dda2e3888f3780e4fd19d15d81178'
parent=json.loads(raw);value=parent['payload']['value']
assert source['sourceResultValue']==value==call['invocation']['request']['input']['value']
assert source['sourceResultDigest']==parent['payload']['resultDigest'] and source['sourceResultValueDigest']==parent['payload']['valueDigest']
assert source['sourceResultAdmissionEventRef']==parent['eventId']
assert source['sourceCCallRef']==parent['payload']['cCallRef'] and source['sourceRunId']==parent['runId']
assert len(value['observations'])==30 and value['terminal'] is False
assert value['original']==original['invocation']['request']['input']['value']['original']
for k in ['program','catalogView','allowlist']:
 assert call['invocation']['request'][k]==original['invocation']['request'][k],k
assert call['invocation']['request']['input']['contract']==original['invocation']['request']['input']['contract']
assert call['invocation']['request']['sourceBasis']['kind']=='admitted_source_result'
assert call['resources']['source']['kind']=='admitted_source_result'
for k in ['catalog','catalogView','applications']:assert call['resources'][k]==original['resources'][k],k
assert request['acquisition']['closeHandoff']==handoff
assert setup['prefix']==handoff['prefix']==read(phase/'runtime-event-prefix.json')
assert setup['publicInvocationRef']!=original['invocation']['invocationRef']
oldr=original['resources']['runEnvironmentResources'];newr=call['resources']['runEnvironmentResources']
for k in ['dependencies','pythonPath','temporaryRoot']:assert oldr[k]==newr[k],k
assert oldr['permission']['actorRef']==newr['permission']['actorRef']
assert setup['limits']=={'nativeMs':18060000,'nativeBytes':268435456,'outerMs':19260000,'outerBytes':536870912}
store=archive/'resources/events/runtime.events.jsonl';s=store.stat();prefix=handoff['prefix']
assert (s.st_size,s.st_dev,s.st_ino)==(prefix['prefixLength'],prefix['storeIdentity']['device'],prefix['storeIdentity']['inode'])
closed129=phase.parent/'latest-factory-data-mapper-resume-execution-129';oldfreeze=read(closed129/'execution-freeze.json')
materials=[r for r in oldfreeze['ledger'] if r['path'].startswith(str(archive/'sandbox/worksite')+'/')]
assert len(materials)==48
for row in materials:assert pin(row['path'])==row
for path in oldfreeze['absences']:assert not Path(path).exists()
ps=subprocess.run(['ps','-p',','.join(map(str,inputs['selectedOwnedPIDs']+[79353,79355])),'-o','pid,ppid,pgid,stat,comm'],text=True,capture_output=True).stdout
assert len(ps.strip().splitlines())==1,ps
lock=Path('/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-event-store-locks-v5')/f'{s.st_dev}-{s.st_ino}.lock';assert not lock.exists()
readiness={'status':'PREPARED_FROZEN_NOT_LAUNCHED','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'classification':'External outer environment repair and one actual same24/sameW canonical source derivation; native dispatch held',
 'ownError':'My130 outer recorder omitted environment:process.env and cleared inherited HOME/PATH/auth. Each134 outer recorder now inherits process.env; inner declared workerEnvironment(config) is unchanged.',
 'inputs':{'closed130':pin(current130/'execution-freeze.json'),'closed129':pin(closed129/'execution-freeze.json'),'selectedCurrentRows':len(inputs['pins'])},
 'safeAuth':read(phase/'safe-auth-readiness.json'),'syntax':read(phase/'syntax-check.json'),
 'sourceBasis':{k:v for k,v in source.items() if k!='sourceResultValue'},'preparedSetup':setup,'request':pin(phase/'calls/continuation-start.request.jsonl'),
 'conservation':{'sourceValueDeepEqualsOriginal129ActualParent':True,'preparedInputDeepEqualsCompleteSourceValue':True,'originalDemandDeepEqual':True,'observations':30,'terminal':False,'sameProgramViewAllowlistContract':True,'sameCatalogApplications':True,'sameEnvironmentDependenciesAndActor':True,'same48PhysicalFilesIncludingProtectedOriginal4':True,'sameObservedAbsence':True,'unchangedStoreStatIdentity':True,'noEventAppend':True,'noPhysicalCopyOrReset':True,'original130And129CutsUnchanged':True,'unchangedInnerLauncherSHA':pin(phase/'launch.mjs')['sha256']},
 'command':{k:result[k] for k in ['started','wallMs','exitCode','signal','timedOut','truncated','failure']},
 'memory':'Sampled RSS in preparation-process-samples.jsonl only; no retained-heap/peak/P0 closure claim.',
 'quiescence':{'ps':ps,'selectedLockPath':str(lock),'selectedLockAbsent':True,'operatorSignals':[]},
 'limits':['Exactly one canonical full cold source acquisition at current130 prefix; no extra full hash/copy/replay','Original129 authority/sourceRun/Result selected; no state/producers fabricated or retagged','Original30obs/12detections/12restores/44green and four missing distinct INV/fullUAT preserved','No native/model/newRun/app/config/source/Git effects; credential values never printed/serialized/hashed','Actual native admission/provider work and full UAT/P0 remain held for Root independent review/release']}
write('readiness.json',readiness)
with (phase/'return.md').open('x') as f:
 f.write('Worker/Operator134 preparation is CLOSED/FROZEN. I corrected my130 outer-wrapper bug: commandRecorder default {} erased inherited HOME/PATH/auth. Every134 outer recorder explicitly uses environment:process.env; unchanged inner launch uses the original declared workerEnvironment(config). Exact auth status is loggedIn:true; only safe fields/names/presence retained, no credential values. Six syntax checks and pure constructor inspection pass.\n\n')
 f.write('One installed24 canonical --prepare succeeded in '+str(result['wallMs'])+'ms, with exit0/no timeout/truncation/signal/failure. Current genuine130 closeHandoff is used, while the original129 invocation authority/sourceRun and judged parent b5e95b06c2c7cf7f99836a96b53fe871573ecc8a4bc2b4ea8e74706810445356 remain selected. The owner returned source basis '+source['basisRef']+' and distinct Public call '+setup['publicInvocationRef']+'.\n\n')
 f.write('Prepared input/source value deeply equals COMPLETE actual174956:30 observations/nonterminal/original/synthesis/unresolved support/all producer coordinates. Same Program/View/W/catalog/install/declarations/dependencies/provider/timing/output controls; all48 material files including original4 plus observed absence match. Current176069-row1402366875B prefix is unchanged. Prior12/12/44 is preserved provenance; four distinct INV and full-original UAT remain open. No new model, Run, app effect, private event, copy/reset or SourceNone fallback.\n\nExact launch inputs: continuation-setup.json and calls/continuation-start.request.jsonl; corrected outer execute-continuation.mjs calls unchanged launch.mjs once after a separate Root release. New5h quality clock begins actual future lifecycle-continuation.request.started, not preparation. Stop frozen; actual ingress/provider/full UAT/P0/qualification unearned. One initial recording path premise failed before owner entry and is preserved.\n')
ledger={row['path']:row for row in inputs['pins']}
for p in phase.rglob('*'):
 if p.is_file() and p.name!='freeze.json':ledger[str(p)]=pin(p)
ledger[str(store)]={'path':str(store),'sha256':prefix['prefixDigest'].removeprefix('sha256:'),'byteCount':prefix['prefixLength'],'device':s.st_dev,'inode':s.st_ino,'digestBasis':'Actual current130 closeHandoff + canonical owner cold authentication and unchanged stat; no extra whole-log hash'}
freeze=write('freeze.json',{'status':'FROZEN_NOT_LAUNCHED','at':readiness['at'],'ledger':list(ledger.values()),'prefix':prefix,'sourceBasisRef':source['basisRef'],'noNativeDispatch':True,'old130And129Preserved':True})
print(json.dumps({'return':pin(phase/'return.md'),'readiness':pin(phase/'readiness.json'),'freeze':freeze,'setup':pin(phase/'continuation-setup.json'),'request':pin(phase/'calls/continuation-start.request.jsonl'),'ledgerRows':len(ledger),'status':'FROZEN_NOT_LAUNCHED'}))
