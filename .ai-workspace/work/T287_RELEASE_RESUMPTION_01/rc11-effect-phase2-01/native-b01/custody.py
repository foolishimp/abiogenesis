from pathlib import Path
import json, hashlib, re, os, subprocess
N=Path(__file__).parent;P=N.parent;R=N/'runtime-001';F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T='build_tenants/abiogenesis/typescript';S=F/'qualification-scratch/rc11-effect-phase2-01/native-b01';tenant=S/'tenant'
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
def write(p,v):
 with p.open('xb') as h:h.write((json.dumps(v,indent=2)+'\n').encode())
freeze=json.loads((N/'source-freeze.json').read_text());rowmap={x['path']:x for x in freeze['rows']};binding=json.loads((N/'BINDING.json').read_text());final=json.loads((R/'FINAL.json').read_text());fresh=json.loads((R/'FRESH_READBACKS.json').read_text());outcome=json.loads((R/'calls/lifecycle-start.outcome.json').read_text());value=outcome['receipt']['ownerOutput']['value'];observation=value['terminalResult']['value']
transportPath=next((R/'resources/archives').glob('*transport.json'));transport=json.loads(transportPath.read_text());stdout=next((R/'resources/archives').glob('*stdout.log'));calls=[];results={}
for lineNumber,line in enumerate(stdout.open(),1):
 try:d=json.loads(line)
 except ValueError:continue
 for c in d.get('message',{}).get('content',[]):
  if not isinstance(c,dict):continue
  if c.get('type')=='tool_use':calls.append(dict(line=lineNumber,id=c['id'],name=c['name'],input=c['input']))
  elif c.get('type')=='tool_result':results[c['tool_use_id']]=dict(line=lineNumber,isError=c.get('is_error',False),content=c.get('content'))
for ordinal,c in enumerate(calls):
 c['ordinalZeroBased']=ordinal;r=results.get(c['id']);c['result']=None if r is None else dict(line=r['line'],isError=r['isError'],canonicalBytes=len(json.dumps(r['content'],separators=(',',':')).encode()),sha256=sha(json.dumps(r['content'],separators=(',',':')).encode()))
write(N/'TOOL_HISTORY.json',dict(stdout=pin(stdout),tools=calls,standing='Public tool inputs and matched result line/digest only; internal reasoning omitted.75 public records include StructuredOutput; maintained transport counts74 tools.'))
census=json.loads((N/'CONTROLLED_CENSUS.json').read_text());selected=census['existingControlledNames']+census['requiredNewTopLevelNames'];checks=[]
for p in sorted((S/'checks').glob('*.status')):
 m=re.fullmatch(r'exit=(-?\d+) start=([\d.]+) end=([\d.]+)\s*',p.read_text());assert m,p
 name=p.stem;record=dict(name=name,status=pin(p),exitCode=int(m[1]),elapsedSeconds=float(m[3])-float(m[2]))
 output=p.with_suffix('.out' if name.startswith('compile') else '.tap');record['output']=pin(output)
 tool=next(c for c in calls if c['name']=='Bash' and f'{name}.status' in c['input'].get('command',''));record['actualCommand']=tool;record['actualToolOutput']=results[tool['id']]['content']
 if name.startswith('controlled'):
  text=output.read_text();summary={k:int(re.search(r'^# '+k+r' (\d+)$',text,re.M)[1]) for k in ['tests','pass','fail','cancelled','skipped','todo']};names=re.findall(r'^(?:not )?ok \d+ - (.+)$',text,re.M)
  assert len(names)==30 and set(names)==set(selected)
  record['population']=dict(**summary,names=names,durationMs=float(re.search(r'^# duration_ms ([\d.]+)$',text,re.M)[1]));record['notOkNames']=re.findall(r'^not ok \d+ - (.+)$',text,re.M)
 checks.append(record)
assert [x['name'] for x in checks]==['compile-01','compile-02','controlled-01','controlled-02','controlled-03','controlled-04']
assert all(x['exitCode']==0 for x in checks if x['name']!='controlled-01')
first=next(x for x in checks if x['name']=='controlled-01');assert first['exitCode']==1 and first['population']['pass']==29 and first['population']['fail']==1
last=next(x for x in checks if x['name']=='controlled-04');assert last['population']['pass']==30 and last['population']['fail']==last['population']['cancelled']==last['population']['skipped']==0
compiler=next(x for x in checks if x['name']=='compile-02');assert compiler['output']['bytes']==0 and compiler['elapsedSeconds']<=240 and last['elapsedSeconds']<=60
adapter=next(c for c in calls if c['id']=='toolu_01Adkt6yAuWZGP4jMSRyuSFM')
newTest=(N/'frozen-source'/T/'test_env/tests/t287-owned-process-lifetime.test.mjs').read_text();actualNames=re.findall(r"^test\('([^']+)'",newTest,re.M);assert len(actualNames)==34 and set(actualNames)==set(census['existingWholeFileNames']+census['requiredNewTopLevelNames'])
sourceWrites=[c for c in calls if c['name'] in ['Write','Edit'] or c['id'] in ['toolu_01BMKZkJvmYuwQAL4TNxJ8NR','toolu_01JNn4a7rtrZKWwitSMCMnRQ','toolu_01R59XzDXiimAY9ZLNLAwwNt']]
assert max(c['ordinalZeroBased'] for c in sourceWrites)<compiler['actualCommand']['ordinalZeroBased']<last['actualCommand']['ordinalZeroBased']
syntax=[dict(tool=c,actualOutput=results[c['id']]['content']) for c in calls if c['name']=='Bash' and '--check' in c['input'].get('command','')]
setupTool=next(c for c in calls if c['id']=='toolu_01UWzvbaGJvF4Dqz1zNpSrNU');assert results[setupTool['id']]['isError']
checkRecord=dict(status='ACTUAL_NATIVE_SELFCHECKS_RETAINED_NOT_EXTERNAL_PROOF',checks=checks,syntax=syntax,firstRed=first,adapterCorrection=dict(tool=adapter,meaning='Exact before/after private-adapter edit retained; diagnosis belongs to Root/source assurance. No assertion changed in this specific edit.'),earlierControlFailure=dict(tool=setupTool,output=results[setupTool['id']]['content'],meaning='Scratch package/symlink creation succeeded; trailing command -v timeout gtimeout perl returned1 with perl present. No compiler or Product failure inferred.'),census=dict(wholeFileNames=actualNames,wholeFileCount=34,controlledNames=selected,controlledCount=30,physicalUnexecuted=[x for x in actualNames if not x.startswith('controlled ')]),finalCorrespondence=dict(lastSourceWriteOrdinal=max(c['ordinalZeroBased'] for c in sourceWrites),freshCompilerOrdinal=compiler['actualCommand']['ordinalZeroBased'],controlledOrdinal=last['actualCommand']['ordinalZeroBased'],sourceWrites=sourceWrites,laterSourceWrites=False),standing='First red remains failed; subsequent passes are separate actual inputs. No whole physical/m5/carrier/unit/installed proof ran here.')
write(N/'NATIVE_CHECKS.json',checkRecord)
rows=[]
for p in sorted((tenant/'build').rglob('*')):
 if p.is_file():q=pin(p);rows.append(dict(path=str(p.relative_to(tenant)),bytes=q['bytes'],sha256=q['sha256']))
package=pin(tenant/'package.json');assert package['sha256']==pin(F/T/'package.json')['sha256'];assert (tenant/'node_modules').is_symlink() and (tenant/'node_modules').resolve()==Path(binding['dependencyRoot']).resolve()
compiled=dict(status='NATIVE_B_SCRATCH_COMPILATION_RETAINED_NOT_NORMAL_PRODUCT_BUILD',root=str(tenant),sourceFreeze=pin(N/'source-freeze.json'),rows=rows,inventoryDigest=sha(json.dumps(rows,separators=(',',':')).encode()),actualCompile=compiler['actualCommand'],package=package,dependencySymlink=dict(path=str(tenant/'node_modules'),target=os.readlink(tenant/'node_modules')),standing='Final emitted inventory measured, not assumed from a predecessor. No external proof or candidate normal build.')
write(N/'COMPILED_SCRATCH_INVENTORY.json',compiled)
oldRelation=json.loads((P/'native-04/SCRATCH_COMPILE_RELATION.json').read_text());sourceInputs=[rowmap[x['path']] for x in oldRelation['sourceInputs']]
assert not (F/T/'code/src/shared/owned_process_scope.ts').exists()
external=json.loads((F/'qualification-inputs/rc11-effect-phase2-01/native-b01/EXTERNAL_TOOLS.json').read_text())
for arg in external['scratchCompileArgv']:assert arg in compiler['actualCommand']['input']['command'],arg
relation=dict(status='FINAL_FROZEN_B_SOURCE_TO_NATIVE_SCRATCH_OUTPUT_OBSERVED',sourceFreeze=pin(N/'source-freeze.json'),sourceDigest=freeze['sourceDigest'],sourceInputs=sourceInputs,compiled=pin(N/'COMPILED_SCRATCH_INVENTORY.json'),checks=pin(N/'NATIVE_CHECKS.json'),toolHistory=pin(N/'TOOL_HISTORY.json'),node=external['node'],typescript=external['typescript'],dependencyInventory=binding['dependencyInventory'],scratchCompileArgv=external['scratchCompileArgv'],standing='All actual source edits preceded final compile02 and controlled04. Scratch build was cleared before fresh compile02; output retained. Same293 TS/config source closure as A, optional new module absent. This is native compiler provenance, not normal build/package correspondence.')
write(N/'SCRATCH_COMPILE_RELATION.json',relation)
members=[]
for e in observation['after']['entries']:
 if e['state']=='file':
  rel=e['relativePath'];expected=rowmap.get(rel)
  if expected:assert e['byteLength']==expected['bytes'] and e['digest']=='sha256:'+expected['sha256'],rel
  members.append(dict(relativePath=rel,bytes=e['byteLength'],sha256=e['digest'].removeprefix('sha256:'),matchedFrozenSource=expected is not None))
for rel in freeze['changedPaths']:assert any(m['relativePath']==rel and m['matchedFrozenSource'] for m in members)
assert set(observation['changedPaths'])==set(freeze['changedPaths'])
write(N/'NATIVE_AFTER_CORRESPONDENCE.json',dict(outcome=pin(R/'calls/lifecycle-start.outcome.json'),observationRef=observation['observationRef'],observationDigest=observation['observationDigest'],changedPaths=observation['changedPaths'],fileMembers=members,allChangedSourcePathsMatchFreeze=True,sourceFreeze=pin(N/'source-freeze.json'),optionalNewScopeModule='Absent before and after; no new-file observation claimed.'))
sizes=[]
for rel in freeze['changedPaths']:
 before=subprocess.check_output(['/usr/bin/git','-C',str(F),'show',binding['sourceCommit']+':'+rel],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'});after=(N/'frozen-source'/rel).read_bytes()
 sizes.append(dict(path=rel,before=dict(lines=len(before.splitlines()),bytes=len(before),sha256=sha(before)),after=dict(lines=len(after.splitlines()),bytes=len(after),sha256=sha(after)),lineDelta=len(after.splitlines())-len(before.splitlines()),byteDelta=len(after)-len(before)))
receipt=json.loads((N/'FREEZE_RECEIPT.json').read_text());assert all(x['exact'] for x in receipt['guards']) and all(x['exact'] for x in receipt['readOnlyA']+receipt['readOnlyHttp'])
for row in freeze['rows']:
 a=pin(F/row['path']);assert a['bytes']==row['bytes'] and a['sha256']==row['sha256'],row['path']
for x in binding['readOnlyInputPins']+binding['prebuiltPins']:
 a=pin(x['path']);assert a['bytes']==x['bytes'] and a['sha256']==x['sha256']
absent={}
for pid in [9123,14446]:
 try:os.kill(pid,0);absent[str(pid)]=False
 except ProcessLookupError:absent[str(pid)]=True
try:os.killpg(14446,0);groupAbsent=False
except ProcessLookupError:groupAbsent=True
assert all(absent.values()) and groupAbsent
custody=dict(status='CLOSED_NATIVE_B_SOURCE_CUSTODY_RECORDED_UNACCEPTED',freezeReceipt=pin(N/'FREEZE_RECEIPT.json'),nativeAfter=pin(N/'NATIVE_AFTER_CORRESPONDENCE.json'),toolHistory=pin(N/'TOOL_HISTORY.json'),checks=pin(N/'NATIVE_CHECKS.json'),compiledRelation=pin(N/'SCRATCH_COMPILE_RELATION.json'),compiledInventory=pin(N/'COMPILED_SCRATCH_INVENTORY.json'),nativeFinal=pin(R/'FINAL.json'),nativeReturn=pin(R/'NATIVE_RETURN.json'),freshReadbacks=pin(R/'FRESH_READBACKS.json'),workerReport=pin(N/'WORKER_REPORT.json'),transport=pin(transportPath),transportSummary={k:transport[k] for k in ['status','signal','disposition','timeoutClass','failureClass','toolCallCount','apiRetryCount','processFacts']},assessmentDisposition=transport['nativeResultAssessment']['disposition'],ownerDisposition=value['disposition'],result=value['result'],sdkIntervalMs=final['phases']['sdkReturned']['elapsedMs']-final['phases']['dispatch']['elapsedMs'],actualPhysicalCloseAt=final['phases']['closed']['utc'],coldReads=[dict(memberKey=x['memberKey'],outcomeKind=x['outcomeKind'],status=x['status'],terminal=x.get('terminal',{}).get('valueDigest')) for x in fresh['observations']],processesAbsent=absent,actorGroupAbsent=groupAbsent,inputAndPrebuiltPinsExact=True,allFileDeltas=sizes,optionalNewModuleCreated=False,productionCoordinationClaim='Helper only:1589->1697 lines,68872->75347 bytes; no new module. Worker responsibility/deletion map is in WORKER_REPORT and plan; measured net growth, not net deletion/performance/reliability proof.',scopeNotes=['Material readonly source/Effect API reads retained in exact public tool history; initial addressed roots are not a blanket source-read ban. No complete read-scope conformance claim.','Six commissioned source paths changed; A modules/HTTP bodies and all other1345-row subject members exact.','Native selfchecks and typed result success do not accept B or discharge joint Phase2/installed/qualification proof.','Worker report disclosures require Root conjunction, including controlled ack seam and potential packaged Effect-copy loader issue.'],qualified=False)
write(N/'SOURCE_CUSTODY.json',custody)
ret=dict(status='NATIVE_B_SUCCEEDED_SOURCE_FROZEN_EXTERNAL_PROOF_HELD',sourceFreeze=pin(N/'source-freeze.json'),sourceDigest=freeze['sourceDigest'],sourceRows=len(freeze['rows']),changedPaths=freeze['changedPaths'],optionalScopeModuleCreated=False,freezeReceipt=pin(N/'FREEZE_RECEIPT.json'),custody=pin(N/'SOURCE_CUSTODY.json'),workerReport=pin(N/'WORKER_REPORT.json'),checks=pin(N/'NATIVE_CHECKS.json'),compiledRelation=pin(N/'SCRATCH_COMPILE_RELATION.json'),compiledInventory=pin(N/'COMPILED_SCRATCH_INVENTORY.json'),native=dict(disposition=value['disposition'],transportStatus=transport['status'],toolCalls=transport['toolCallCount'],apiRetries=transport['apiRetryCount'],sdkIntervalMs=custody['sdkIntervalMs'],physicalClose=True,freshReads=custody['coldReads']),firstRed=dict(test='controlled B helper: raw failures survive actual lifts and host projection',population='30 cases/29pass/1fail',receipt=first['output'],adapterEdit=adapter['id']),finalChecks=dict(compilerExit=0,compilerSeconds=compiler['elapsedSeconds'],controlled='30pass/0fail/0cancel/0skip',wholeFileSourceCount=34,physicalCasesUnexecuted=4),conserved=dict(A=True,HTTPBodies=True,mainAndIndices=True,RC10=True,inputs=True),remaining='Root/source/proof conjunction and joint Phase2 normal build + exact external helper/configured-C2/lifetime/one nine-file unit with full M5 subset. No external proof executed, no Git/release/install/acceptance. Prior failures and both capsules retained.',qualified=False)
write(N/'RETURN.json',ret)
print(json.dumps({n:pin(N/n) for n in ['RETURN.json','SOURCE_CUSTODY.json','NATIVE_CHECKS.json','COMPILED_SCRATCH_INVENTORY.json','SCRATCH_COMPILE_RELATION.json','WORKER_REPORT.json']}));print(json.dumps(dict(compiledRows=len(rows),sourceInputs=len(sourceInputs),codeDeltas=sizes[:1],coldReads=custody['coldReads'])))
