import pathlib,json,hashlib,time,datetime,stat
D=pathlib.Path(__file__).resolve().parent;G=D.parent;C=G/'final-candidate-construction-02';sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text())
def save(n,v):
 with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def coord(p,relative=False):
 b=p.read_bytes();return {'path':str(p.relative_to(D) if relative else p),'bytes':len(b),'sha256':sha(b)}
begin=time.monotonic();inputs=read(D/'consumed-inputs.json')
for r in inputs:
 p=pathlib.Path(r['path']);b=p.read_bytes();assert len(b)==r['bytes'] and sha(b)==r['sha256'],str(p)
freeze=read(C/'freeze.json');assert sha((C/'freeze.json').read_bytes())=='7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469'
for r in freeze['records']:
 p=C/r['path']
 if r['kind']=='symlink':assert p.is_symlink() and str(p.readlink())==r['target']
 else:
  assert p.is_file() and not p.is_symlink();b=p.read_bytes();assert len(b)==r['bytes'] and sha(b)==r['sha256'] and stat.S_IMODE(p.stat().st_mode)==r['mode'],str(p)
assert {str(p.relative_to(C)) for p in C.rglob('*') if p.is_file() or p.is_symlink()}=={r['path'] for r in freeze['records']}|{'freeze.json'}
conservation_ms=(time.monotonic()-begin)*1000
save('final-conservation.json',{'status':'passed','candidateFreezeRecords':len(freeze['records']),'consumedFileRecords':len(inputs),'allBytesAndRecordedModesAndSymlinksConserved':True,'candidateAbsentExtra':True,'elapsedMs':conservation_ms,'nativeResources':'not acquired','effects':'read-only conservation; review evidence only'})
nominal=read(D/'nominal-execution.json');static=read(D/'full11-execution.json');inspection=read(D/'inspection-execution.json');report_start=read(D/'report-preparation-started.json')
charged=120000+nominal['elapsedMs']+static['elapsedMs'];assert charged<302000
save('cost-and-effects.json',{'status':'CLOSED','ownedMaximumMs':302000,'inspectionAllocationChargedMs':120000,'inspectionExactMeasuredCorrectedProcessMs':inspection['elapsedMs'],'initialInspectionInterval':'not separately captured; entire inspection allocation charged; no fabricated duration','finalConservationMs':conservation_ms,'nominal':nominal,'full11':static,'chargedExecutionMs':charged,'reportPreparationWallMs':(time.monotonic()-report_start['monotonic'])*1000,'separation':'Report preparation wall time separately measured; final conservation is within inspection allocation and also occurs during this preparation interval, not additional native execution','actualInstalledOwnerAttempts':{'nominal':1,'full11':1},'nativeCalls':0,'providerCalls':0,'sourceBuildPackageInstallEffects':0,'GitEffects':0,'HOME_home_CODEX_HOME':'unchanged','reviewOnlyWrites':str(D)})
critical=[G/'final-candidate-review-controls-02/request.txt',C/'freeze.json',C/'return.md',C/'source-freeze-manifest.json',G/'final-candidate-construction-01/freeze.json',G/'default-library-publication-repair-01/freeze.json',G/'default-library-publication-repair-01/source.patch',G/'default-library-publication-review-01/freeze.json',G/'default-library-publication-review-01/return.md']
records=[coord(p,True) for p in sorted(D.rglob('*')) if p.is_file() and p.name!='freeze.json']
result={'status':'CLOSED','activation':'T287_FINAL_CANDIDATE_REVIEW_02','role':'independent Reviewer; sole review-output Writer CLOSED','actor':'/root/s03_independent_review','separateSessionIdentity':'not separately available','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verdict':'no_findings_at_construction_install_static_publication_scope','return':next(r for r in records if r['path']=='return.md'),'records':records,'criticalInputs':[coord(p) for p in critical],'consumedInputManifest':next(r for r in records if r['path']=='consumed-inputs.json'),'recommendation':'Accept exact bounded construction and new installed full11 seam; Root selects next ordinary installed Public setup.','limits':['No native admission/all-Program closure/ordinary user outcome/qualification/release claim','Own previously authored F11 scope grouping/material adequacy excluded','Original cuts conserved; old native prefixes remain old subjects'],'stop':'Reviewer and output Writer CLOSED. No further effect or actor activation.'}
save('freeze.json',result)
print(json.dumps({'status':'CLOSED','return':result['return'],'freeze':coord(D/'freeze.json',True),'records':len(records),'consumedFileRecords':len(inputs),'chargedExecutionMs':charged,'finalConservationMs':conservation_ms},indent=2))
