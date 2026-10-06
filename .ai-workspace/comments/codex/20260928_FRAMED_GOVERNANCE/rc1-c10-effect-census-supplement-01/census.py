from pathlib import Path
import datetime, hashlib, json, os, stat, time

D=Path(__file__).resolve().parent;C=D.parent/'final-candidate-construction-10'
assert os.environ.get('PYTHONDONTWRITEBYTECODE')=='1'
OP='T287_C10_EFFECT_CENSUS_SUPPLEMENT_01';ACTOR='/root/rc1_c03_install_review'
start=time.monotonic();read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(name,value):
 with (D/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def pin(p,path=None):
 s=p.lstat();r={'path':path or str(p),'mode':stat.S_IMODE(s.st_mode)}
 if stat.S_ISLNK(s.st_mode):return {**r,'kind':'symlink','target':os.readlink(p)}
 assert stat.S_ISREG(s.st_mode),str(p)
 return {**r,'kind':'file','bytes':s.st_size,'sha256':sha(p)}
def minimal(row):
 if row.get('kind')=='symlink':return {k:row[k] for k in ['path','target','mode']}|{'kind':'symlink'}
 return {k:row[k] for k in ['path','bytes','sha256','mode']}|{'kind':'file'}
def census(root):
 files=[];dirs=[]
 for parent,dnames,fnames in os.walk(root,followlinks=False):
  pp=Path(parent)
  for name in list(dnames):
   p=pp/name
   if p.is_symlink():files.append(pin(p,str(p.relative_to(root))));dnames.remove(name)
   else:dirs.append({'path':str(p.relative_to(root)),'mode':stat.S_IMODE(p.stat().st_mode)})
  for name in fnames:
   p=pp/name;files.append(pin(p,str(p.relative_to(root))))
 return sorted(files,key=lambda r:r['path']),sorted(dirs,key=lambda r:r['path'])
original=pin(C/'final-freeze.json');assert original['bytes']==386759 and original['sha256']=='24cd23e713c0adac12f0fe62b2fda751ee6648936bd180439e63e65e609a8be3'
f=read(C/'final-freeze.json');assert f['status']=='CLOSED';assert read(D/'activation.json')['operation']==OP
actual,dirs=census(C);actual_by_path={r['path']:minimal(r) for r in actual}
assert len(actual_by_path)==len(actual)
assert dirs==sorted(f['directories'],key=lambda r:r['path']) and len(dirs)==1940
assert stat.S_IMODE(C.stat().st_mode)==f['rootDirectoryMode']
coverage={};base=set();nested=set();population_summary=[]
def admit(label,rows,to_base=False,to_nested=False):
 for row in rows:
  r=minimal(row);p=Path(r['path']);assert not p.is_absolute() and '..' not in p.parts
  assert actual_by_path.get(r['path'])==r,{'population':label,'expected':r,'actual':actual_by_path.get(r['path'])}
  coverage.setdefault(r['path'],[]).append(label)
  if to_base:base.add(r['path'])
  if to_nested:nested.add(r['path'])
 population_summary.append({'population':label,'records':len(rows),'regularBytes':sum(r.get('bytes',0) for r in rows),'links':sum(r.get('kind')=='symlink' for r in rows)})
admit('original_freeze_direct_records',f['records'],to_base=True)
for label,name in f['completePopulations'].items():
 if label=='archivePayload':continue
 admit(label,read(C/name),to_base=True)
assert len(base)==15752 and sum(actual_by_path[p].get('bytes',0) for p in base)==525201333
deps=read(C/'dependency-pins.json')['members'];assert len(deps)==16
admit('nested_locked_dependency_archive_tuples',[r['preparedArchive'] for r in deps],to_nested=True)
admit('nested_locked_dependency_cache_tuples',[r['preparedCacheContent'] for r in deps],to_nested=True)
admit('nested_toolchain_records',read(C/'toolchain-pins.json')['records'])
admit('nested_source_and_law_freeze_members',read(C/'final-source-freeze-manifest.json')['members'])
admit('original_freeze_self_external_pin',[{**original,'path':'final-freeze.json'}])
scratch=[r for r in actual if r['path'].startswith('final-tmp/')]
assert len(scratch)==593 and all(r['kind']=='file' and r['mode']==0o600 for r in scratch)
assert sum(r['bytes'] for r in scratch)==2934900
scratch_rows=[{k:r[k] for k in ['path','bytes','sha256','mode']} for r in scratch]
compact=json.dumps(scratch_rows,sort_keys=True,separators=(',',':')).encode()
assert len(compact)==104356 and hashlib.sha256(compact).hexdigest()=='a21f122a8f07edf78617424a0594eb3868ef187543313d06f48888d46460eb8c'
assert all(r['path'].startswith('final-tmp/node-compile-cache/') for r in scratch)
admit('supplement_scratch_compile_cache',scratch)
prefix=[r for r in actual if r['path'].startswith('final-npm-prefix/')];assert not prefix
assert set(coverage)==set(actual_by_path),{'unexpected':sorted(set(actual_by_path)-set(coverage)),'missing':sorted(set(coverage)-set(actual_by_path))}
groups=[]
for row in read(C/'final-process-closure.json')['knownOperationGroups']:
 try:os.killpg(row['ownedProcessGroup'],0);state='present'
 except ProcessLookupError:state='absent'
 except PermissionError:state='unobservable_permission'
 groups.append({**row,'supplementReadState':state});assert state=='absent',row
source_root=C/'final-source';selected=read(C/'final-selected-core.json')
manifest=Path(selected['packageRoot'])/'product-toolchain-manifest.json'
identity_pins=[pin(C/'final-freeze.json'),pin(Path(selected['artifactPath'])),pin(manifest),pin(C/'final-source-freeze-manifest.json')]
assert identity_pins[1]['bytes']==10431333 and identity_pins[1]['sha256']=='f9a14aa627049b79a0a22b7a0a117f823758d97ecc4b7a88c23c73ce66bc2edb'
assert identity_pins[3]['sha256']=='75200ef06e648629d68e2ddb75946a04930a2132e4ce58ff9d6081841a87a351'
producer_pins=[pin(C/'final-controls/finalize.py'),pin(C/'final-controls/execute.py'),pin(C/'source-freeze/toolchain/npm/lib/cli.js'),pin(C/'final-process-closure.json')]
cli=(C/'source-freeze/toolchain/npm/lib/cli.js').read_text();supervisor=(C/'final-controls/execute.py').read_text();finalizer=(C/'final-controls/finalize.py').read_text()
assert 'enableCompileCache()' in cli and "'TMPDIR': str(D / 'final-tmp')" in supervisor
assert "'final-npm-prefix/','final-tmp/'" in finalizer
assert "for key in ['NODE_OPTIONS','NODE_PATH','V8_OPTIONS']" in supervisor
with (D/'scratch-rows.compact.json').open('xb') as out:out.write(compact)
save('actual-c10-file-link-census.json',actual)
save('actual-c10-directory-census.json',{'rootMode':f['rootDirectoryMode'],'directories':dirs})
save('final-tmp-population.json',{'root':'final-tmp','rootMode':stat.S_IMODE((C/'final-tmp').stat().st_mode),'records':scratch,'directories':[r for r in dirs if r['path'].startswith('final-tmp/')],'classification':'npm/Node compile-cache construction scratch; tool evidence, not Product payload/ABG truth'})
save('final-npm-prefix-population.json',{'root':'final-npm-prefix','rootMode':stat.S_IMODE((C/'final-npm-prefix').stat().st_mode),'records':prefix,'directories':[r for r in dirs if r['path'].startswith('final-npm-prefix/')],'empty':True})
save('coverage-reconciliation.json',{'actualPhysicalRecords':len(actual),'actualRegularCount':sum(r['kind']=='file' for r in actual),'actualLinkCount':sum(r['kind']=='symlink' for r in actual),'actualRegularBytes':sum(r.get('bytes',0) for r in actual),'originalDirectAndRecursiveUnion':{'records':len(base),'regularBytes':sum(actual_by_path[p].get('bytes',0) for p in base)},'nestedDependencyArchivesNotInBaseUnion':{'records':len(nested-base),'regularBytes':sum(actual_by_path[p].get('bytes',0) for p in nested-base)},'freezeSelfExternalAccounting':{**original,'C10Path':'final-freeze.json'},'scratch':{'records':593,'regularBytes':2934900,'compactPin':pin(D/'scratch-rows.compact.json')},'directories':1940,'populationRowsMayOverlap':True,'populationSummaries':population_summary,'eachPhysicalRecordProvenance':[{'path':p,'coveredBy':coverage[p]} for p in sorted(coverage)],'unexpectedRecords':[],'missingRecords':[],'originalFreezeUnmodified':True,'archiveVirtualMembers':f['package']['archiveMembers'],'archivePayloadEvidence':'existing complete tar/package correspondence retained; no repack or archive-member reproof'})
save('subject-and-producer-pins.json',{'subjectPins':identity_pins,'canonicalBasis':selected['basis'],'producerPins':producer_pins,'originalRecordCensusLimitation':'finalize.py excludes final-tmp and final-npm-prefix from direct records; original named complete populations did not replace those exclusions. Direct/recursive tuple agreement did not establish full membership. Sixteen dependency archives are already pinned via dependency-pins.json nested preparedArchive tuples. Original freeze itself is externally pinned.','scratchCause':'npm/lib/cli.js invokes existing node:module enableCompileCache(); execute.py supplies task-local TMPDIR under C10. The actual scratch cache is physically confined there.','unknowns':['execute.py does not record/remove inherited NODE_COMPILE_CACHE; its value at construction time is unknown','possible compile-cache timing influence is unknown; no cache-independent reproduction claim','individual npm descendants were not enumerated; owned wait/group closure evidence is retained'],'newRuntimeAuthority':False,'cacheDeleted':False})
save('process-closure.json',{'status':'CLOSED','knownC10Groups':groups,'newPayloadProcessGroups':0,'importsNodeNpmBuildTestPackInstallRuntimeNetworkGit':0})
# Repeat only this complete read census at closure: supplements never mutate C10.
end_actual,end_dirs=census(C);assert end_actual==actual and end_dirs==dirs
assert pin(C/'final-freeze.json')==original
cost={'elapsedReadAndReportMs':(time.monotonic()-start)*1000,'actualPhysicalRecordsReadPerCompleteCensus':len(actual),'completeCensuses':2,'regularBytesPerCompleteCensus':sum(r.get('bytes',0) for r in actual),'payloadCommands':0,'PYTHONDONTWRITEBYTECODE':'1','C10Writes':0,'unknownCacheTimingInfluence':True}
save('costs.json',cost)
save('closure.json',{'status':'CLOSED','operation':OP,'actor':ACTOR,'role':'Worker','onlyWriteTerritory':str(D),'C10OriginalFreezeUnchanged':True,'writesAfterFreeze':'STOPPED','reviewerActivated':False,'qualificationReleaseCredit':False,'closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()})
with (D/'return.md').open('x') as out:out.write(f"CLOSED_EFFECT_CENSUS_ONLY — {OP}. Existing C10 is unchanged. Complete actual census: {len(actual)} regular/link records, {sum(r.get('bytes',0) for r in actual)} regular bytes, 1940 directories. Original direct/recursive union15752/525201333 B, plus16 nested dependency archives, original freeze-self pin, and593 scratch cache files/2934900 B/all0600 account every member. final-npm-prefix is empty. Scratch compact104356 B/a21f122a8f07edf78617424a0594eb3868ef187543313d06f48888d46460eb8c. Two pure read censuses agree; all10 known C10 groups absent. Read/report {cost['elapsedReadAndReportMs']:.3f} ms. No payload commands or C10 writes. Inherited NODE_COMPILE_CACHE and timing influence remain unknown; no cache-independent reproduction, native qualification or release credit. Root alone accepts; Worker writes stop.\n")
records,own_dirs=census(D)
freeze={'status':'CLOSED','workResult':'COMPLETE_C10_EFFECT_CENSUS_ONLY','operation':OP,'actor':ACTOR,'role':'Worker','originalC10Freeze':original,'records':records,'recordCount':len(records),'regularBytes':sum(r.get('bytes',0) for r in records),'directories':own_dirs,'directoryCount':len(own_dirs),'rootMode':stat.S_IMODE(D.stat().st_mode),'completeC10Census':'actual-c10-file-link-census.json','completeC10Directories':'actual-c10-directory-census.json','reconciliation':'coverage-reconciliation.json','subjectAndProducerPins':'subject-and-producer-pins.json','effects':{'C10Writes':0,'payloadCommands':0,'externalSupplement':1},'costs':cost,'excludedSelf':'freeze.json only; externally hashable by Root','writesAfterFreeze':'STOPPED','semanticQualificationOrRelease':False}
save('freeze.json',freeze)
for r in records:assert pin(D/r['path'],r['path'])==r
print(json.dumps({'status':'CLOSED','freeze':pin(D/'freeze.json'),'records':len(records),'recordBytes':freeze['regularBytes'],'C10PhysicalRecords':len(actual),'C10RegularBytes':sum(r.get('bytes',0) for r in actual),'directories':1940,'scratchCompact':pin(D/'scratch-rows.compact.json'),'costs':cost},indent=2),flush=True)
