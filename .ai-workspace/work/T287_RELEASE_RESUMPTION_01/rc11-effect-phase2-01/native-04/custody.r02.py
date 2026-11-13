from pathlib import Path
import json,hashlib,os,re,subprocess
N=Path(__file__).parent;O=N.parent/'native-03';R=N/'runtime-001';F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T='build_tenants/abiogenesis/typescript';S=F/'qualification-scratch/rc11-effect-phase2-01/native-04';tenant=S/'tenant'
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
def write(p,v):
 with p.open('xb') as f:f.write((json.dumps(v,indent=2)+'\n').encode())
freeze=json.loads((N/'source-freeze.json').read_text());rowmap={x['path']:x for x in freeze['rows']};binding=json.loads((N/'BINDING.json').read_text());final=json.loads((R/'FINAL.json').read_text());fresh=json.loads((R/'FRESH_READBACKS.json').read_text());outcome=json.loads((R/'calls/lifecycle-start.outcome.json').read_text());value=outcome['receipt']['ownerOutput']['value'];observation=value['terminalResult']['value']
transportPath=next((R/'resources/archives').glob('*transport.json'));transport=json.loads(transportPath.read_text());stdout=next((R/'resources/archives').glob('*stdout.log'));calls=[];results={}
for lineNumber,line in enumerate(stdout.read_text().splitlines(),1):
 try:d=json.loads(line)
 except:continue
 for x in d.get('message',{}).get('content',[]):
  if not isinstance(x,dict):continue
  if x.get('type')=='tool_use':calls.append(dict(line=lineNumber,id=x['id'],name=x['name'],input=x['input']))
  elif x.get('type')=='tool_result':results[x.get('tool_use_id')]=dict(line=lineNumber,isError=x.get('is_error',False),content=x.get('content'))
for c in calls:
 r=results.get(c['id']);c['result']=None if r is None else dict(line=r['line'],isError=r['isError'],canonicalBytes=len(json.dumps(r['content'],separators=(',',':')).encode()),sha256=sha(json.dumps(r['content'],separators=(',',':')).encode()))
write(N/'TOOL_HISTORY.json',dict(stdout=pin(stdout),tools=calls,standing='Public tool inputs and exact matched output locations/digests only; no internal reasoning copied.'))
checks=[]
for i,c in enumerate(calls):
 if c['name']=='Bash' and (('--outDir' in c['input'].get('command','')) or ('--test-name-pattern=^controlled' in c['input'].get('command',''))):checks.append(dict(ordinalZeroBased=i,tool=c,actualOutput=results[c['id']]['content']))
assert len(checks)==2
text=(S/'controlled-01.tap').read_text();summary={k:int(re.search(r'^# '+k+r' (\d+)$',text,re.M)[1]) for k in ['tests','pass','fail','cancelled','skipped','todo']};names=re.findall(r'^ok \d+ - (.+)$',text,re.M)
assert summary=={'tests':20,'pass':20,'fail':0,'cancelled':0,'skipped':0,'todo':0} and len(names)==20
assert (S/'compile-01.exit').read_text().startswith('exit=0 ') and (S/'controlled-01.exit').read_text().startswith('exit=0 ')
assert (S/'compile-01.log').stat().st_size==0
writes=[dict(ordinalZeroBased=i,name=c['name'],path=c['input'].get('file_path')) for i,c in enumerate(calls) if c['name'] in ['Edit','Write']]
lastCodeWrite=max(x['ordinalZeroBased'] for x in writes if x['path'].endswith(('.ts','.mjs')))
assert lastCodeWrite<checks[0]['ordinalZeroBased']<checks[1]['ordinalZeroBased']
checkRecord=dict(checks=checks,receipts=[pin(S/x) for x in ['compile-01.log','compile-01.exit','controlled-01.tap','controlled-01.exit']],population=dict(**summary,names=names,durationMs=float(re.search(r'^# duration_ms ([\d.]+)$',text,re.M)[1])),firstRed=None,compilerInputOrder=dict(lastCodeWriteOrdinal=lastCodeWrite,compileOrdinal=checks[0]['ordinalZeroBased'],controlledOrdinal=checks[1]['ordinalZeroBased'],laterWrites='Plan only; no later source TS/test edits.',writes=writes))
write(N/'NATIVE_CHECKS.json',checkRecord)
rows=[]
for p in sorted((tenant/'build').rglob('*')):
 if p.is_file():q=pin(p);rows.append(dict(path=str(p.relative_to(tenant)),bytes=q['bytes'],sha256=q['sha256']))
assert len(rows)==582
pkg=pin(tenant/'package.json');assert pkg['sha256']==pin(F/T/'package.json')['sha256'];assert (tenant/'node_modules').is_symlink();assert (tenant/'node_modules').resolve()==Path(binding['dependencyRoot']).resolve()
compiled=dict(status='NATIVE_R2_SCRATCH_COMPILATION_RETAINED_NOT_PRODUCT_BUILD',root=str(tenant),sourceFreeze=pin(N/'source-freeze.json'),rows=rows,inventoryDigest=sha(json.dumps(rows,separators=(',',':')).encode()),actualCompile=checks[0],package=pkg,dependencySymlink=dict(path=str(tenant/'node_modules'),target=os.readlink(tenant/'node_modules')),standing='Exact native compiler output; no external execution or acceptance.')
write(N/'COMPILED_SCRATCH_INVENTORY.json',compiled)
oldRelation=json.loads((O/'SCRATCH_COMPILE_RELATION.json').read_text());sourceInputs=[]
for before in oldRelation['sourceInputs']:
 sourceInputs.append(rowmap[before['path']])
external=json.loads((F/'qualification-inputs/rc11-effect-phase2-01/native-04/EXTERNAL_TOOLS.json').read_text())
relation=dict(status='FROZEN_R2_INPUT_OUTPUT_RELATION_OBSERVED',sourceFreeze=pin(N/'source-freeze.json'),sourceDigest=freeze['sourceDigest'],sourceInputs=sourceInputs,compiled=pin(N/'COMPILED_SCRATCH_INVENTORY.json'),nativeChecks=pin(N/'NATIVE_CHECKS.json'),toolHistory=pin(N/'TOOL_HISTORY.json'),node=external['node'],typescript=external['typescript'],dependencyInventory=binding['dependencyInventory'],scratchCompileArgv=external['scratchCompileArgv'],standing='Final TS and test edits precede the recorded fresh compiler and controlled invocation. Later native edits affect only plan. Same source input closure as pinned predecessor; no second compiler or external proof has run.')
write(N/'SCRATCH_COMPILE_RELATION.json',relation)
members=[]
for e in observation['after']['entries']:
 if e['state']=='file':
  rel=e['relativePath'];expected=rowmap.get(rel)
  if expected:assert e['byteLength']==expected['bytes'] and e['digest']=='sha256:'+expected['sha256'],rel
  members.append(dict(relativePath=rel,bytes=e['byteLength'],sha256=e['digest'].removeprefix('sha256:'),matchedFrozenSource=expected is not None))
for rel in freeze['changedPaths']:assert any(m['relativePath']==rel and m['matchedFrozenSource'] for m in members)
write(N/'NATIVE_AFTER_CORRESPONDENCE.json',dict(outcome=pin(R/'calls/lifecycle-start.outcome.json'),observationRef=observation['observationRef'],observationDigest=observation['observationDigest'],changedPaths=observation['changedPaths'],fileMembers=members,allChangedSourcePathsMatchFreeze=True,sourceFreeze=pin(N/'source-freeze.json')))
for row in freeze['rows']:
 p=pin(F/row['path']);assert p['bytes']==row['bytes'] and p['sha256']==row['sha256']
for x in binding['readOnlyInputPins']+binding['prebuiltPins']:
 assert pin(x['path'])==x,x['path']
absent={}
for pid in [64537,66200]:
 try:os.kill(pid,0);absent[str(pid)]=False
 except ProcessLookupError:absent[str(pid)]=True
try:os.killpg(66200,0);groupAbsent=False
except ProcessLookupError:groupAbsent=True
assert all(absent.values()) and groupAbsent
owned=[]
for name in ['owned_process_lifetime','owned_process_state']:owned.append(pin(tenant/f'build/code/src/shared/{name}.js'))
moduleSize=[]
for name in ['owned_process_lifetime','owned_process_state']:
 path=F/T/f'code/src/shared/{name}.ts';data=path.read_bytes();moduleSize.append(dict(path=str(path.relative_to(F)),lines=len(data.splitlines()),bytes=len(data),sha256=sha(data)))
size=dict(modules=moduleSize,totalLines=sum(x['lines'] for x in moduleSize),totalBytes=sum(x['bytes'] for x in moduleSize),preR1Native03=dict(lines=502,bytes=25148),preA=dict(lines=298,bytes=12633),meaning='Consolidation, not net deletion; includes both bridge and state.')
custody=dict(status='CLOSED_R2_SOURCE_CUSTODY_RECORDED_UNACCEPTED',freezeReceipt=pin(N/'FREEZE_RECEIPT.json'),nativeAfter=pin(N/'NATIVE_AFTER_CORRESPONDENCE.json'),toolHistory=pin(N/'TOOL_HISTORY.json'),checks=pin(N/'NATIVE_CHECKS.json'),compiledRelation=pin(N/'SCRATCH_COMPILE_RELATION.json'),compiledInventory=pin(N/'COMPILED_SCRATCH_INVENTORY.json'),compiledOwners=owned,nativeFinal=pin(R/'FINAL.json'),nativeReturn=pin(R/'NATIVE_RETURN.json'),freshReadbacks=pin(R/'FRESH_READBACKS.json'),workerReport=pin(N/'WORKER_REPORT.json'),transport=pin(transportPath),transportSummary={k:transport[k] for k in ['status','signal','disposition','timeoutClass','failureClass','toolCallCount','apiRetryCount','processFacts']},assessmentDisposition=transport['nativeResultAssessment']['disposition'],ownerDisposition=value['disposition'],result=value['result'],sdkIntervalMs=final['phases']['sdkReturned']['elapsedMs']-final['phases']['dispatch']['elapsedMs'],actualPhysicalCloseAt=final['phases']['closed']['utc'],coldReads=[dict(memberKey=x['memberKey'],outcomeKind=x['outcomeKind'],status=x['status'],terminal=x.get('terminal',{}).get('valueDigest')) for x in fresh['observations']],processesAbsent=absent,actorGroupAbsent=groupAbsent,indexObservation=pin(N/'INDEX_OBSERVATION.json'),inputAndPrebuiltPinsExact=True,aggregatePhysicalSize=size,scopeNotes=['Native listed metadata for earlier scratch directories and hashed shared source via glob; retained exact commands/output pins, not a complete read-scope conformance claim. No additional source contents were used to expand write authority.','Actual source changes state/test/plan only; bridge unchanged; all1345 frozen rows conserved otherwise.','Compiler and20/20 controlled pass are bounded native selfchecks, not external fixture/whole-file/installed or Phase2 acceptance.','Author disclosed unexecuted advanced-clock nested terminate bound-reset concern; referred to Root without repair or causal claim.'])
write(N/'SOURCE_CUSTODY.json',custody)
ret=dict(status='NATIVE_R2_SUCCEEDED_SOURCE_FROZEN_EXTERNAL_PROOF_HELD',sourceFreeze=pin(N/'source-freeze.json'),sourceDigest=freeze['sourceDigest'],sourceRows=len(freeze['rows']),changedPaths=freeze['changedPaths'],freezeReceipt=pin(N/'FREEZE_RECEIPT.json'),custody=pin(N/'SOURCE_CUSTODY.json'),workerReport=pin(N/'WORKER_REPORT.json'),checks=pin(N/'NATIVE_CHECKS.json'),compiledRelation=pin(N/'SCRATCH_COMPILE_RELATION.json'),compiledOwners=owned,native=dict(disposition='success',status=0,toolCalls=transport['toolCallCount'],apiRetries=transport['apiRetryCount'],sdkIntervalMs=custody['sdkIntervalMs'],physicalClose=True,freshReplayClosed=True),indexBytesPreserved=True,remaining='Root and independent source/proof conjunction; selected external R1/R2 probes, baseline signal and whole lifetime. B held. Author advanced-clock concern is unexecuted and returned for disposition.',qualified=False)
write(N/'RETURN.json',ret)
print(json.dumps({n:pin(N/n) for n in ['RETURN.json','SOURCE_CUSTODY.json','NATIVE_CHECKS.json','COMPILED_SCRATCH_INVENTORY.json','SCRATCH_COMPILE_RELATION.json','WORKER_REPORT.json']}))
