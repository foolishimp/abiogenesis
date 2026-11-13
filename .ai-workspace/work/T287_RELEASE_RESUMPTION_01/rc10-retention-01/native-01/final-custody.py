import pathlib,json,hashlib,datetime,subprocess,tarfile,os
N=pathlib.Path(__file__).parent; R=pathlib.Path('/Users/jim/src/apps/abiogenesis');W=pathlib.Path('/private/tmp/abg-rc10-retention-20261109'); RT=N/'runtime-001';B=json.loads((N/'BINDING.PREPARATION.r04.json').read_text());T=json.loads((N/'TASK.r04.json').read_text());P=W/'qualification-scratch/rc10-retention-01/proof-01/frozen-proof'
def h(b):return hashlib.sha256(b).hexdigest()
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':h(b)}
def match(root,rows):
 wrong=[]
 for row in rows:
  p=root/row['path']
  if row.get('kind')=='symlink':
   if not p.is_symlink() or os.readlink(p)!=row['target']:wrong.append(row['path'])
  elif not p.is_file() or p.stat().st_size!=row['bytes'] or h(p.read_bytes())!=row['sha256']:wrong.append(row['path'])
 return wrong
f=json.loads((P/'stage-01/source-freeze.json').read_text());baseline=json.loads(pathlib.Path(B['sourceInventory']['path']).read_text());afterout=json.loads((RT/'calls/lifecycle-start.outcome.json').read_text());nv=afterout['receipt']['ownerOutput']['value'];o=nv['terminalResult']['value'];base={r['path']:r for r in baseline['rows']};frozen={r['path']:r for r in f['rows']};changes=sorted(p for p,r in frozen.items() if p not in base or r!=base[p]);deleted=sorted(set(base)-set(frozen));entries={e['relativePath']:e for e in o['after']['entries']};mismatch=[];shared=[];physicalAfter=[]
for p,e in entries.items():
 if e['state']!='file':continue
 if p in frozen:
  shared.append(p);r=frozen[p]
  if e['byteLength']!=r['bytes'] or e['digest']!='sha256:'+r['sha256']:mismatch.append(p)
 path=W/p
 if not path.is_file() or path.stat().st_size!=e['byteLength'] or 'sha256:'+h(path.read_bytes())!=e['digest']:physicalAfter.append(p)
outside=[p for p in changes+deleted if not any(p==a or p.startswith(a+'/') for a in T['writeRoots'])]
readbacks=[]
for name in ['run_result','run_replay']:
 x=json.loads((RT/'calls'/(name+'.outcome.json')).read_text())['receipt'];v=x['ownerOutput']['value'];pr=v['projection'];term=pr.get('terminalResult');readbacks.append({'memberKey':name,'exitCode':x['exitCode'],'failure':x['failure'],'outcomeKind':x['ownerOutput']['outcomeKind'],'caseKey':v.get('caseKey'),'projectionKind':pr['kind'],'source':v['source'],'terminalMatchesNative':term==nv['terminalResult']})
deps=json.loads(pathlib.Path(B['dependencyInventory']['path']).read_text());builderMismatch=[];memberCount=0;payloadBytes=0
with tarfile.open(B['archive']['path'],'r:gz') as tar:
 for m in tar:
  if m.name=='package':continue
  rel=m.name.removeprefix('package/');p=pathlib.Path(B['bootstrapRoot'])/rel;memberCount+=1
  if m.isfile():
   z=tar.extractfile(m).read();payloadBytes+=len(z)
   if not p.is_file() or p.stat().st_size!=len(z) or h(p.read_bytes())!=h(z):builderMismatch.append(rel)
  elif m.issym():
   if not p.is_symlink() or os.readlink(p)!=m.linkname:builderMismatch.append(rel)
  elif m.isdir():
   if not p.is_dir():builderMismatch.append(rel)
  else:builderMismatch.append('unsupported:'+rel)
mainStatus=subprocess.check_output(['git','-C',str(R),'status','--porcelain=v1','--untracked-files=no'],text=True).splitlines();head=subprocess.check_output(['git','-C',str(R),'rev-parse','HEAD'],text=True).strip();whead=subprocess.check_output(['git','-C',str(W),'rev-parse','HEAD'],text=True).strip()
a={'status':'CHECKED_POST_NATIVE_CUSTODY','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceDigest':f['sourceDigest'],'sourceFreeze':pin(P/'stage-01/source-freeze.json'),'sourceRows':len(f['rows']),'sourceBytes':sum(r['bytes'] for r in f['rows']),'changedPaths':changes,'deletedPaths':deleted,'outsideGrantedSourceChanges':outside,'nativeChangedPathsMatch':changes==sorted(o['changedPaths']),'nativeAfterFrozenFileComparisons':len(shared),'nativeAfterFrozenMismatches':mismatch,'nativeAfterPhysicalMismatches':physicalAfter,'changedPathsMissingNativeFileObservation':[p for p in changes if entries.get(p,{}).get('state')!='file'],'frozenPhysicalMismatches':match(pathlib.Path(f['source']),f['rows']),'liveSourceFrozenMismatches':match(W,f['rows']),'mainBaselineMismatches':match(R,baseline['rows']),'dependencyMismatches':match(pathlib.Path(deps['root']),deps['rows']),'immutableBuilderArchiveComparison':{'archive':pin(B['archive']['path']),'members':memberCount,'payloadBytes':payloadBytes,'mismatches':builderMismatch},'mainHead':head,'worktreeHead':whead,'mainTrackedStatus':mainStatus,'native':{'outcome':pin(RT/'calls/lifecycle-start.outcome.json'),'exitCode':afterout['receipt']['exitCode'],'failure':afterout['receipt']['failure'],'disposition':nv['disposition'],'observationDigest':o['observationDigest'],'afterObservationDigest':o['after']['observationDigest']},'freshReadbacks':readbacks,'standing':'Exact observed source custody and readback correspondence only. Native report is not independent semantic acceptance. Unobserved filesystem territory is not proven unchanged.'}
p=N/'NATIVE_CUSTODY.json';p.write_text(json.dumps(a,indent=2)+'\n');(N/'NATIVE_REPORT.json').write_text(json.dumps({'sourceOutcome':pin(RT/'calls/lifecycle-start.outcome.json'),'report':o['report']},indent=2)+'\n');print(json.dumps({'receipt':pin(p),'report':pin(N/'NATIVE_REPORT.json'),'summary':{k:v for k,v in a.items() if k not in ['changedPaths','immutableBuilderArchiveComparison','native']}},indent=2))
