from pathlib import Path
import os,json,hashlib,shutil,stat,traceback,difflib
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'c0-potential-effect-successor-03';F=W.parent/'c0-potential-effect-successor-05';T=Path('build_tenants/abiogenesis/typescript')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def row(p,rel):
 s=p.lstat();a={'path':str(rel),'mode':oct(stat.S_IMODE(s.st_mode)),'kind':'symlink' if p.is_symlink() else 'file'}
 if p.is_symlink():a['target']=os.readlink(p)
 else:a.update(bytes=s.st_size,sha256=sha(p))
 return a
def verify(p,x):
 a=row(p,x['path'])
 for k in ['mode','sha256','bytes','target']:
  if k in x:assert a[k]==x[k],(str(p),k)
try:
 assert not (W/'stage').exists() and not (W/'STOP.json').exists()
 old=json.loads((O/'stage-stopped-inventory.json').read_text())['files'];depmeta=json.loads((O/'dependency-directory-metadata.json').read_text())['copiedRows']
 for x in old:verify(O/'stage'/x['path'],x)
 donor=O/'stage'/T/'node_modules'
 for x in depmeta:
  s=(donor/x['path']).stat();assert oct(stat.S_IMODE(s.st_mode))==x['mode'] and s.st_mtime_ns==x['mtime_ns'],x['path']
 shutil.copytree(O/'stage',W/'stage',symlinks=True,copy_function=shutil.copy2)
 dest=W/'stage'/T/'node_modules';dirs=[]
 for x in depmeta:
  s=(dest/x['path']).stat();assert oct(stat.S_IMODE(s.st_mode))==x['mode'] and s.st_mtime_ns==x['mtime_ns'];assert (s.st_dev,s.st_ino)!=(x['dev'],x['inode'])
  dirs.append({**x,'dev':s.st_dev,'inode':s.st_ino})
 for x in old:
  p=W/'stage'/x['path'];verify(p,x);assert not os.path.samefile(O/'stage'/x['path'],p),x['path']
  if p.is_symlink():assert p.resolve().is_relative_to(dest),str(p)
 selected=json.loads((W/'activation.json').read_text())['source_paths'];changes=[]
 for rel in selected:
  before=row(O/'stage'/rel,rel);shutil.copy2(R/rel,W/'stage'/rel);after=row(W/'stage'/rel,rel);changes.append({'before':before,'after':after})
  pre=W/'preimages'/Path(rel).name
  with (W/(Path(rel).name+'.diff')).open('x') as f:f.writelines(difflib.unified_diff(pre.read_text().splitlines(True),(R/rel).read_text().splitlines(True),fromfile='preimage/'+rel,tofile='main/'+rel))
 extra=T/'test_env/falsifiers/runtime-retained-projections-worker.mjs';x=next(x for x in json.loads((F/'overlay-inputs.json').read_text())['supportFiles'] if x['path']=='test_env/falsifiers/runtime-retained-projections-worker.mjs')
 src=F/'overlay'/x['path'];assert sha(src)==x['sha256'];target=W/'stage'/extra;assert not target.exists();target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,target)
 sourcepaths=[x['path'] for x in json.loads((O/'source-inputs.json').read_text())['files']]+[str(extra)]
 source=[row(W/'stage'/p,p) for p in sourcepaths]
 wr('source-inputs.json',{'root':str(W/'stage'),'predecessorRoute':str(O/'source-inputs.json'),'predecessorSha256':sha(O/'source-inputs.json'),'files':source,'selectedDelta':changes,'addedUnchangedProofWorker':row(target,extra),'noOtherSourceDelta':True})
 wr('dependency-inputs.json',{'predecessorRoute':str(O/'dependency-inputs.json'),'predecessorSha256':sha(O/'dependency-inputs.json'),'files':json.loads((O/'dependency-inputs.json').read_text())['files'],'allBytesModesLinksExact':True,'sharedWritableInodes':0})
 wr('dependency-directory-metadata.json',{'predecessorRoute':str(O/'dependency-directory-metadata.json'),'predecessorSha256':sha(O/'dependency-directory-metadata.json'),'sourceRows':depmeta,'copiedRows':dirs,'consumedFields':['mode','mtime_ns'],'allConsumedFieldsExact':True,'copy':'copytree symlinks=True copy_function=copy2; directories preserved after children','hiddenLock':row(dest/'.package-lock.json','.package-lock.json')})
 actual=[row(p,p.relative_to(W/'stage')) for p in sorted((W/'stage').rglob('*')) if p.is_file() or p.is_symlink()];assert len(actual)==len(old)+1
 wr('stage-pre-build-inventory.json',{'files':actual,'predecessorRoute':str(O/'stage-stopped-inventory.json'),'predecessorSha256':sha(O/'stage-stopped-inventory.json'),'rows':len(actual)})
 physical=Path(json.loads((W/'activation.json').read_text())['physical_root']);assert not physical.exists() and not physical.is_symlink();physical.mkdir();assert physical.resolve()==physical
 for n in ['commands','tmp','npm-cache','npm-logs','artifacts']:(W/n).mkdir()
 wr('resource-preflight.json',{'physicalRoot':str(physical),'absentBeforeCreation':True,'canonical':str(physical.resolve()),'stageFileRows':len(actual),'sourceRows':len(source),'dependencyRows':4576,'dependencyDirectories':len(dirs),'sourceLogicalBytes':sum(x.get('bytes',0) for x in actual),'additionalBound':2147483648})
 print(json.dumps({'stageRows':len(actual),'sourceRows':len(source),'dependencyDirectories':len(dirs),'sourceDelta':len(changes),'supportAdded':str(extra)}))
except BaseException:
 if not (W/'STOP.json').exists():wr('STOP.json',{'kind':'stage preflight failure','traceback':traceback.format_exc(),'disposition':'Stopped before repair/retry'})
 raise
