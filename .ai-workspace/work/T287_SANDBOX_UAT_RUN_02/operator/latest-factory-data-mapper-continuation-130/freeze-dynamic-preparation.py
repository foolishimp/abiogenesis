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

assert pin(phase/'prepare.mjs')['sha256']=='2144bb26387308a1bee3e064ff04ac9d8f99251d82db9d3481ce350825c17a5e'
assert pin(phase/'freeze.json')['sha256']=='d1d735680cdd4b857895ad8cfe5ca7d982436907385df0d0edebff7c38d58cd3'
setup=read(phase/'continuation-setup.json');request=read(phase/'calls/continuation-start.request.jsonl');call=request['invocation'];source=call['resources']['source']['basis']
original=read(archive/'calls/lifecycle-start.request.jsonl')['invocation'];handoff=read(archive/'final-close-handoff.json')
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
ps=subprocess.run(['ps','-p','57401,57403,85325,85327,88828,46931','-o','pid,ppid,pgid,stat,comm'],text=True,capture_output=True).stdout
assert len(ps.strip().splitlines())==1,ps
lock=Path('/var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-event-store-locks-v5')/f'{s.st_dev}-{s.st_ino}.lock';assert not lock.exists()
readiness={'status':'PREPARED_FROZEN_NOT_LAUNCHED','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'classification':'Actual canonical source applicability and same-workspace Public call construction; no native admission/provider/UAT credit',
 'inputs':{'frozen130':pin(phase/'freeze.json'),'review131':pin(phase.parent/'uat-source-result-continuation-review-131/pins.json'),'closed129':pin(closed129/'execution-freeze.json')},
 'sourceBasis':{k:v for k,v in source.items() if k!='sourceResultValue'},'preparedSetup':setup,'request':pin(phase/'calls/continuation-start.request.jsonl'),
 'conservation':{'sourceValueDeepEqualsActualParent':True,'preparedInputDeepEqualsCompleteSourceValue':True,'originalDemandDeepEqual':True,'observations':30,'terminal':False,'sameProgramViewAllowlistContract':True,'sameCatalogApplications':True,'sameEnvironmentDependenciesAndActor':True,'same48PhysicalFiles':True,'sameObservedAbsence':True,'unchangedStoreStatIdentity':True,'noEventAppend':True,'noPhysicalCopyOrReset':True,'original130FreezeAndScriptUnchanged':True},
 'command':{k:result[k] for k in ['started','wallMs','exitCode','signal','timedOut','truncated','failure']},'memory':'Samples in dynamic-process-samples.jsonl; observed RSS2916944KiB, not retained heap or a measured peak.',
 'quiescence':{'ps':ps,'selectedLockPath':str(lock),'selectedLockAbsent':True,'operatorSignals':[]},
 'limits':['One existing-owner full cold acquisition, no second acquisition/replay/log hash','Actual new Public admission and provider/native continuation are held for independent review/Root release','Original fullUAT is still UNMET;12/16 detections and4missingINV remain','No P0/global memory/qualification/release closure claim']}
write('dynamic-readiness.json',readiness)
with (phase/'dynamic-return.md').open('x') as f:
 f.write('Operator130 dynamic preparation is CLOSED/FROZEN and PASS: one exact frozen prepare.mjs --prepare invocation returned0 in132783.549333ms without timeout/truncation/signal/failure. The installed24 owner accepted exact174956 as a current closed/quiescent judged source and constructed a distinct Public start using admitted_source_result on the SAME Program/View/W. No native launch, model, event append, app copy/reset or new admission occurred.\n\nSource basis ed83216c5891b898792f36d8ac699a9b0d714153cf208177bbd504148ed7ca35 retains actual sourceResultb5e95b06c2c7cf7f99836a96b53fe871573ecc8a4bc2b4ea8e74706810445356/valueDigestd0c6b56492ae4b379e438471e9053dd3845ac8cd0b9c4d8ab6988a24554ec3a8. The prepared input is deeply identical to the COMPLETE authentic30-observation/nonterminal parent, including original, synthesis, unresolved support and all producer/evidence values. Program, View, input contract, allowlist, declarations, dependency resources and actor are unchanged. Current48 files/observed absence match frozen129; the same authenticated175991-row/1398511166B prefix and original130 preparation freeze remain unchanged.\n\nPrepared continuation-setup.json and calls/continuation-start.request.jsonl are exact launch inputs; full source basis is retained in that existing Public resource carrier. Prior12/12 plus44green remains actual source provenance, not a fabricated new Run result. Actual admission, continued full16-mutation/originalUAT and installed memoryP0 closure remain unearned. All old/prepare owned processes and selected lock are absent. Root and independent review must release the native launch separately.\n')
oldnames={'activation.json','inputs.json','prepare.mjs','launch.mjs','return.md','readiness.json','freeze.json','mechanical-inspection.json'}
ledger=[]
for p in phase.rglob('*'):
 if p.is_file() and p.name!='dynamic-freeze.json' and (p.parent!=phase or p.name not in oldnames):ledger.append(pin(p))
for p in [phase/'freeze.json',phase/'prepare.mjs',phase/'launch.mjs',phase.parent/'uat-source-result-continuation-review-131/pins.json',closed129/'execution-freeze.json',archive/'final-close-handoff.json']:ledger.append(pin(p))
freeze=write('dynamic-freeze.json',{'status':'FROZEN_NOT_LAUNCHED','at':readiness['at'],'ledger':ledger,'prefix':prefix,'sourceBasisRef':source['basisRef'],'noNativeDispatch':True,'old130FreezePreserved':True})
print(json.dumps({'return':pin(phase/'dynamic-return.md'),'readiness':pin(phase/'dynamic-readiness.json'),'freeze':freeze,'setup':pin(phase/'continuation-setup.json'),'request':pin(phase/'calls/continuation-start.request.jsonl'),'ledgerRows':len(ledger),'status':'FROZEN_NOT_LAUNCHED'}))
