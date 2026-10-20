from pathlib import Path
import json,hashlib,datetime,stat,os,signal
phase=Path(__file__).parent
read=lambda p:json.loads(Path(p).read_text())
inputs=read(phase/'inputs.json');archive=Path(inputs['archive']);prior=Path(inputs['currentClosedPhase'])
def pin(p):
 p=Path(p);s=p.lstat();assert stat.S_ISREG(s.st_mode) and not p.is_symlink();h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return {'path':str(p),'sha256':h.hexdigest(),'byteCount':s.st_size}
def write(name,x):
 with (phase/name).open('x') as f:f.write(json.dumps(x,indent=2,ensure_ascii=False)+'\n')
 return pin(phase/name)
for row in inputs['pins']:assert pin(row['path'])==row,row['path']
for path in inputs['absentPaths']:assert not Path(path).exists()
for pid in inputs['selectedOwnedPIDs']+inputs['selectedOwnedPGIDs']:
 try:os.kill(-pid if pid in inputs['selectedOwnedPGIDs'] else pid,0)
 except ProcessLookupError:pass
 else:raise AssertionError(('Owned process/group not absent',pid))
assert not Path(inputs['selectedLockPath']).exists()
control=read(phase/'operator-control.json');controlPin=pin(phase/'operator-control.json')
auth=read(phase/'safe-auth-readiness.json');assert auth['safeAuth']['loggedIn'] is True
args=read(phase/'args-composition-proof.json');assert args['status']=='PASS' and args['exactlyOneAppendSystemPrompt'] and args['operatorControl']==controlPin
assert read(phase/'monitor-preparation.json')['operatorControl']==controlPin
assert control['anchor']=='nativeCLIcommand.request.started' and control['durationMs']==18000000
plan=read(phase/'static-transport-plan.json');assert plan['args'].count('--append-system-prompt')==1
assert plan['args'][plan['args'].index('--append-system-prompt')+1]==control['declaration']
for name in ['execute-continuation.mjs','execute-source-preparation.mjs','preflight.mjs','complete-static-preflight.mjs']:assert 'environment:process.env' in (phase/name).read_text()
assert 'effectiveWorkerConfiguration' in (phase/'launch.mjs').read_text()
assert 'workerEnvironment(effectiveConfig)' in (phase/'launch.mjs').read_text()
assert "control['durationMs']" in (phase/'observe-execution.py').read_text()
result=read(phase/'commands/dynamic-source-preparation.result.json');assert result['exitCode']==0 and result['signal'] is None and not result['timedOut'] and not result['truncated'] and result['failure'] is None
setup=read(phase/'continuation-setup.json');request=read(phase/'calls/continuation-start.request.jsonl');call=request['invocation'];source=call['resources']['source']['basis'];handoff=read(prior/'final-close-handoff.json')
original=read(archive/'calls/lifecycle-start.request.jsonl')['invocation']
with (archive/'resources/events/runtime.events.jsonl').open('rb') as f:f.seek(1387241127);raw=f.read(1813642)
assert hashlib.sha256(raw).hexdigest()=='46291356d40ed3b4dcfb040913fd51576a3dda2e3888f3780e4fd19d15d81178'
parent=json.loads(raw);value=parent['payload']['value'];assert source['sourceResultValue']==value==call['invocation']['request']['input']['value']
assert source['sourceResultDigest']==parent['payload']['resultDigest'] and source['sourceResultValueDigest']==parent['payload']['valueDigest']
assert source['sourceResultAdmissionEventRef']==parent['eventId'] and source['sourceCCallRef']==parent['payload']['cCallRef'] and source['sourceRunId']==parent['runId']
assert len(value['observations'])==30 and value['terminal'] is False and value['original']==original['invocation']['request']['input']['value']['original']
for k in ['program','catalogView','allowlist']:assert call['invocation']['request'][k]==original['invocation']['request'][k],k
assert call['invocation']['request']['input']['contract']==original['invocation']['request']['input']['contract']
for k in ['catalog','catalogView','applications']:assert call['resources'][k]==original['resources'][k],k
assert request['acquisition']['closeHandoff']==handoff and setup['prefix']==handoff['prefix']==read(phase/'runtime-event-prefix.json')
assert setup['operatorControl']==controlPin and setup['physicalCopy'] is False
assert call['invocation']['request']['sourceBasis']['kind']=='admitted_source_result' and call['resources']['source']['kind']=='admitted_source_result'
assert setup['publicInvocationRef']!=read(prior/'continuation-setup.json')['publicInvocationRef']
oldr=original['resources']['runEnvironmentResources'];newr=call['resources']['runEnvironmentResources']
for k in ['dependencies','pythonPath','temporaryRoot']:assert oldr[k]==newr[k]
assert oldr['permission']['actorRef']==newr['permission']['actorRef']
assert setup['limits']=={'nativeMs':18060000,'nativeBytes':268435456,'outerMs':19260000,'outerBytes':536870912}
store=archive/'resources/events/runtime.events.jsonl';s=store.stat();prefix=handoff['prefix']
assert (s.st_size,s.st_dev,s.st_ino)==(prefix['prefixLength'],prefix['storeIdentity']['device'],prefix['storeIdentity']['inode'])
oldfreeze=read(phase.parent/'latest-factory-data-mapper-resume-execution-129/execution-freeze.json')
materials=[r for r in oldfreeze['ledger'] if r['path'].startswith(str(archive/'sandbox/worksite')+'/')];assert len(materials)==48
for row in materials:assert pin(row['path'])==row
for path in oldfreeze['absences']:assert not Path(path).exists()
checks={name:{k:r[k] for k in ['started','wallMs','exitCode','signal','timedOut','truncated','failure']} for name in ['safe-auth-status','args-composition-corrected','mechanical-inspection','dynamic-source-preparation'] for r in [read(phase/('commands/'+name+'.result.json'))]}
readiness={'status':'PREPARED_FROZEN_NOT_LAUNCHED','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'classification':'Caller-owned current-control handoff + canonical same24/sameW source preparation; no native dispatch','basis':'ABI5 fixed15 GOAL035/T287 STDO2.5.1rc2 manifest3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782','inputs':{'closed134':pin(prior/'execution-freeze.json'),'selectedCurrentRows':len(inputs['pins'])},'operatorControl':controlPin,'safeAuth':auth,'argumentProof':args,'syntax':read(phase/'syntax-check.json'),'sourceBasis':{k:v for k,v in source.items() if k!='sourceResultValue'},'preparedSetup':setup,'request':pin(phase/'calls/continuation-start.request.jsonl'),'checks':checks,'conservation':{'sourceValueDeepEqualsCompleteOriginal129ActualParent':True,'preparedInputDeepEqualsSource':True,'originalAndHistoryIncludingOldClockUnchanged':True,'observations':30,'terminal':False,'sameProgramViewWCatalogApplicationsOriginalContract':True,'sameEnvironmentDependenciesAndActor':True,'same48PhysicalFilesIncludingOriginal4PlusAbsence':True,'unchangedCurrentStoreStatIdentity':True,'noEventAppend':True,'noPhysicalCopyOrReset':True,'allPriorCutsAndSelectedOwnersConserved':True,'effectiveWorkerConfigurationChangesOnlyProviderAppendArgs':True,'allOuterEnvironmentsExplicitProcessEnv':True,'baseProviderFilteringUnchanged':True,'controlIsSingleSourceForLaunchAndMonitor':True},'quiescence':{'observedOwnedPIDsAndPGIDsAbsent':True,'selectedLockPath':inputs['selectedLockPath'],'selectedLockAbsent':True,'operatorSignals':[]},'earned':'Prior12detections/12exactrestores/44green remain historical/applicable source; four dedicated INV and full-original UAT remain unresolved; no new credit','limits':['One canonical full owner cold source acquisition at current134 prefix; no extra full store hash/copy/replay','Static installed transport plan uses only non-secret argument environment; not actual new actor binding or provider acceptance','Actual native current-control binding, useful contribution and full-original UAT/P0 remain held for Root review/release','Owned rendered prompt/state/history preserved, no original workorder modification or numerical historical deadline override','Initial schema argument key-order comparator premise failed before dynamic owner; preserved and corrected within phase only']}
write('readiness.json',readiness)
text='Worker/Operator136 preparation is CLOSED/FROZEN; native execution remains held. One literal Root current operational declaration in operator-control.json supplies both derived provider.appendArgs (exactly one --append-system-prompt) and actual-command-start monitor clock. It grants no tools/action/effects/verdict and changes no owned prompt, original workorder, history, schema or native binder. All outer recorders explicitly preserve process.env; inner declared filtering remains unchanged apart from the selected appendArgs.\n\n'
text+='Safe actual worker-env auth passes with safe fields/names only. Installed transport composition passes with exact original protocol/empty tools/full schema/base args, argument and plan digests binding the declaration. Static plan uses only non-secret argument policy, no credential hashing or model call. Initial literal-schema key-order comparator premise and failed receipt are retained; corrected witness deep-matches complete canonical schema and exactly reproduces authenticated archived argument.\n\n'
text+='One current134-prefix canonical --prepare succeeded in '+str(result['wallMs'])+'ms. Owner accepted original129 judged Result b5e95b06c2c7cf7f99836a96b53fe871573ecc8a4bc2b4ea8e74706810445356 at current179548/1418896561B closed prefix. New source basis '+source['basisRef']+'; distinct Public call '+setup['publicInvocationRef']+'. Complete actual30-observation/nonterminal input, original, producers and historical deadline judgments are deep-equal. Same24/Program/View/W/catalog/installs/limits; all48 physical files + absence unchanged. No new Run/model/native/app event/copy/reset.\n\n'
text+='Exact next wrapper execute-continuation.mjs and launch.mjs, continuation-setup.json and calls/continuation-start.request.jsonl are frozen. Next actual native command.request.started alone anchors the shared18000000ms quality window; no actual new T0 selected in preparation. Prior12/12/44 retained; four dedicated INV/full-original UAT/P0/qualification remain open. Stop frozen for independent review; real actor binding with this control and useful next work remain required after separate Root release.\n'
with (phase/'return.md').open('x') as f:f.write(text)
ledger={r['path']:r for r in inputs['pins']}
for p in phase.rglob('*'):
 if p.is_file() and p.name!='freeze.json':ledger[str(p)]=pin(p)
ledger[str(store)]={'path':str(store),'sha256':prefix['prefixDigest'].removeprefix('sha256:'),'byteCount':prefix['prefixLength'],'device':s.st_dev,'inode':s.st_ino,'digestBasis':'Genuine134 closeHandoff + current canonical owner authentication and unchanged stat; no extra full-log hash'}
freeze=write('freeze.json',{'status':'FROZEN_NOT_LAUNCHED','at':readiness['at'],'ledger':list(ledger.values()),'prefix':prefix,'operatorControl':controlPin,'sourceBasisRef':source['basisRef'],'noNativeDispatch':True,'oldCutsPreserved':True})
print(json.dumps({'return':pin(phase/'return.md'),'readiness':pin(phase/'readiness.json'),'freeze':freeze,'setup':pin(phase/'continuation-setup.json'),'request':pin(phase/'calls/continuation-start.request.jsonl'),'ledgerRows':len(ledger),'status':'FROZEN_NOT_LAUNCHED'}))
