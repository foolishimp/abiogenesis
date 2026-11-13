from pathlib import Path
import json,hashlib,re,subprocess,os,sys,shlex
P=Path(__file__).parent;C=P.parent;N=C/'native-03';F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T=Path('build_tenants/abiogenesis/typescript')
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def save(p,j):
 with p.open('x') as f:json.dump(j,f,indent=2);f.write('\n')
 return pin(p)
def check(p):assert pin(p['path'])=={k:p[k] for k in ['path','bytes','sha256']},p['path']
assert sys.platform=='darwin'
inv=json.loads((N/'source-freeze.json').read_text());source=Path(inv['frozenRoot']);assert inv['sourceDigest']=='c4a8c7cc4a85eb068edf1b06202ea6dc7baadb422924a39446c728770ba625ca'
for row in inv['rows']:
 for root in [source,F]:
  p=pin(root/row['path']);assert p['bytes']==row['bytes'] and p['sha256']==row['sha256'],str(root/row['path'])
review=[pin(C/'review-01/SOURCE_RECHECK_NATIVE03.md'),pin(C/'review-01/SOURCE_RECHECK_NATIVE03.json')]
assert review[0]['sha256']=='e566805c7ef120516c759d0ff242566673d73f0aca529f69d79f618160883847'
assert review[1]['sha256']=='e9622dc9b2ec24731ab56964f1a83968f774e6203d3acc572fab2111f57383ed'
c=json.loads((P/'CONTROLS.DRAFT.json').read_text());c['status']='FROZEN_SUCCESSOR_CONTROLS_READY_ROOT_EXECUTION_HELD'
assert not Path(c['proofRoot']).exists()
paths=['test_env/tests/t287-publication-observer.test.mjs','test_env/tests/t287-owned-process-lifetime.test.mjs','test_env/tests/m5-worker-transport.test.mjs']
def names(text):return [x[1] for x in re.findall(r'''(?m)^test\((['"])(.*?)\1''',text)]
pops={p:names((source/T/p).read_text()) for p in paths};assert [len(v) for v in pops.values()]==[8,18,39]
oldUnit=json.loads((P/'UNIT_POPULATION_BASELINE.json').read_text());oldM5=subprocess.check_output(['git','-C',str(F),'show',f"{inv['sourceCommit']}:{T/paths[2]}"],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'})
oldNames=names(oldM5.decode());assert len(oldNames)==32 and all(n in oldUnit['names'] for n in oldNames)
unitNames=[n for n in oldUnit['names'] if n not in oldNames]+pops[paths[2]];assert len(unitNames)==102 and len(set(unitNames))==102
skipNames=[r['name'] for r in oldUnit['skips']];assert len(skipNames)==6 and all(n in unitNames for n in skipNames)
selected=[n for p in paths for n in pops[p] if re.match(r'^(observer:|controlled |M5 actual owner, controlled clock:)',n)];assert len(selected)==29
for cmd in c['commands']:
 if cmd['id']=='deterministic':cmd.update(expectedTests=29,expectedSkipped=0,expectedNames=selected,expectedSkippedNames=[]);cmd.pop('expectedSelectedNames',None)
 elif cmd['id']=='owned-lifetime':cmd.update(expectedTests=18,expectedSkipped=0,expectedNames=pops[paths[1]],expectedSkippedNames=[])
 elif cmd['id']=='m5':cmd.update(expectedTests=39,expectedSkipped=0,expectedNames=pops[paths[2]],expectedSkippedNames=[])
 elif cmd['id']=='unit':cmd.update(expectedTests=102,expectedSkipped=6,expectedNames=unitNames,expectedSkippedNames=skipNames)
pkg=json.loads((source/T/'package.json').read_text());assert pkg['scripts']['test:unit']==c['expectedUnitScript'];assert 'pretest:unit' not in pkg['scripts'] and 'posttest:unit' not in pkg['scripts']
unit=shlex.split(c['expectedUnitScript']);assert unit.pop(0)=='node';unit.insert(3,'--test-reporter=tap');assert next(x for x in c['commands'] if x['id']=='unit')['args']==unit
seed=json.loads(Path(c['contractSeedInventory']['path']).read_text());missing=[r for r in seed['rows'] if not (source/T/'contracts'/r['path']).exists()];assert missing==[],missing
base=json.loads(Path(c['controlledBaseline']['path']).read_text());runner=(P/'proof.r02.py').read_text();ns={'__file__':str(P/'proof.r02.py')};exec(compile(runner[:runner.index('binding_path,')],str(P/'proof.r02.py'),'exec'),ns)
assert ns['controlled']((source/T/paths[1]).read_text())==base['blocks']
for k in ['node','npmCli','builderPin','archive','npmInventory','dependencyInventory','contractSeedInventory','controlledBaseline']:check(c[k])
g=json.loads((N/'PRESERVATION_GUARDS.json').read_text());preserve=g['indices']+g['mainTracking']+[c['builderPin'],c['archive'],pin(Path(json.loads((N/'BINDING.json').read_text())['bootstrapRoot'])/'product-toolchain-manifest.json')]
for p in preserve:check(p)
population=save(P/'POPULATION.json',{'status':'EXACT_FROZEN_NAMED_POPULATION','sourceInventory':pin(N/'source-freeze.json'),'files':[{'path':p,'pin':pin(source/T/p),'names':pops[p]} for p in paths],'deterministicNames':selected,'unitNames':unitNames,'unitSkipped':oldUnit['skips'],'oldUnitPopulation':pin(P/'UNIT_POPULATION_BASELINE.json'),'oldM5Source':{'gitCommit':inv['sourceCommit'],'path':str(T/paths[2]),'bytes':len(oldM5),'sha256':hashlib.sha256(oldM5).hexdigest(),'names':oldNames},'nodeNameFilter':'Pinned Node24 filteredByName uses noopTestStream/filteredRun and does not report excluded tests. Expected29 selected tests,0 skips; exclusions are not proof credit.','platform':'darwin'})
ceilings=save(P/'FROZEN_CEILINGS.json',{'source':pin(source/T/paths[2]),'m5SetupMs':5000,'m5GroupSetupMs':10005,'m5AdministrativeMs':5000,'cleanupLaw':'2*g+min(g,250)','m5ExplicitTopLevelSeconds':{'forceTerm':11,'progress':21,'falseAck':16,'lateTimeout':16,'groupedWorkerCommandHTTP':77,'postExit':18,'unchangedEPIPE':10},'explicitSumSeconds':169,'progress':{'records':111,'intervalMs':50,'workloadMs':5550,'initialLeaseMs':5000,'absoluteMs':15550},'lifetime':{'physicalHTTPSeconds':62,'physicalCaptureSeconds':51,'otherPhysicalSeconds':[5,5],'controlledBlocks':14,'controlledHandbackCombinations':12,'outerSeconds':300},'m5WholeFileOuterSeconds':600,'m5Standing':'Prospective whole-file finite experiment cap.169s sums the explicit physical case caps above; it is not a claim that all legacy4x inactivity backstops sum below600s. Original owner timers and all legacy populations remain unchanged. Any outer timeout is incomplete/failure and stops.','unitOuterSeconds':1800,'stageMaximumSeconds':600,'campaignMaximumSeconds':4200,'ownerClockChange':False})
controls=save(P/'CONTROLS.json',c)
b=save(P/'BINDING.json',{'id':'PHASE1-EXTERNAL-PROOF-01','status':'FROZEN_PHASE1_PROOF_SUBJECT','sourceInventory':pin(N/'source-freeze.json'),'sourceDigest':inv['sourceDigest'],'frozenSourceRoot':str(source),'proofRoot':c['proofRoot'],'sourceCommit':inv['sourceCommit'],'sourceRows':len(inv['rows']),'sourceCustody':pin(N/'SOURCE_CUSTODY.json'),'nativeReturn':pin(N/'RETURN.json'),'predecessorFailedNativeReturn':pin(C/'native-02/RETURN.json'),'sourceReview':review,'population':population,'ceilings':ceilings,'preservationPins':preserve,'expectedAbsentSeeds':[],'controls':controls,'driver':pin(P/'proof.r02.py'),'standing':'Ready for Root exact execution admission. No proof has launched; source review is satisfied but both original debts and qualification remain open.'})
files=[pin(P/f) for f in ['proof.r02.py','RUNNER_ACCOUNTING_DELTA.diff','CONTROLS.json','LINT_RECIPE.json','POPULATION.json','FROZEN_CEILINGS.json','PARSER_PREFLIGHT.json','UNIT_POPULATION_BASELINE.json']]
ready=save(P/'READY.json',{'status':'FROZEN_PHASE1_EXTERNAL_PROOF_READY_ROOT_EXECUTION_HELD','binding':b,'controls':files,'sourceReview':review,'sourceDigest':inv['sourceDigest'],'frozenSourceRoot':str(source),'commandIds':[x['id'] for x in c['commands']],'expectedCounts':{'deterministic':{'tests':29,'skips':0},'lifetime':{'tests':18,'skips':0},'m5':{'tests':39,'skips':0},'unit':{'tests':102,'skips':6}},'launchPrefix':['python3',str(P/'proof.r02.py'),b['path'],b['sha256']],'admissionTail':['ROOT_EXECUTION_ADMISSION_PATH','ROOT_EXECUTION_ADMISSION_SHA256'],'effects':['Create-once isolated proof source/work/temp','metadata-preserving copy of pinned dependencies,0 absent seeds','lint4files then1normalbuild','exact deterministic29,full lifetime18,full m539,original9fileunit102 sequential','local owned process/loopback fixture effects and retained per-command evidence only'],'stop':'First failure/incomplete/guard change; no retry, source repair, rebuild or continuation without Root disposition.','noEffects':['No paid provider','No main/author source or Git change','No install/pack/release/global pin'],'timing':'120/600/60/300/600/1800s commandcaps;600s staging;4200s campaign checked in each poll;5sTERM/1sKILL cleanup containment counts as failure','output':'100MiB combined command stdout/stderr, checked while running and after final close; final bytes and limiting cause retained','syntax':'Python compile passed; parser checked against retained exact18-pass lifetime bytes, no test pilot.'})
print(json.dumps({'ready':ready,'binding':b,'controls':controls,'driver':pin(P/'proof.r02.py'),'population':population,'ceilings':ceilings},indent=2))
