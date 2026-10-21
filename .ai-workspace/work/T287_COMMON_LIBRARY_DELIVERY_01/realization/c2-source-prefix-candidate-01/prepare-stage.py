from pathlib import Path
import hashlib,json,os,shutil,stat,time,traceback
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'c0-potential-effect-successor-06';T=Path('build_tenants/abiogenesis/typescript')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def pin(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def row(p,root):
 st=p.lstat();x={'path':str(p.relative_to(root)),'mode':oct(stat.S_IMODE(st.st_mode)),'kind':'symlink' if p.is_symlink() else 'file'}
 if p.is_symlink():x['target']=os.readlink(p)
 else:x.update(bytes=st.st_size,sha256=sha(p))
 return x
def inventory(root):
 rows=[];dirs=[]
 for parent,children,files in os.walk(root,followlinks=False):
  p=Path(parent);st=p.stat();dirs.append({'path':str(p.relative_to(root)),'mode':oct(stat.S_IMODE(st.st_mode)),'mtime_ns':st.st_mtime_ns,'dev':st.st_dev,'inode':st.st_ino})
  for name in children+files:
   p=Path(parent)/name
   if p.is_symlink() or p.is_file():rows.append(row(p,root))
 return sorted(rows,key=lambda x:x['path']),sorted(dirs,key=lambda x:x['path'])
def verify(p,x):
 if x.get('kind',x.get('type'))=='symlink':assert p.is_symlink() and os.readlink(p)==x['target'],str(p)
 else:assert p.is_file() and sha(p)==x['sha256'] and p.stat().st_size==x['bytes'],str(p)
 if 'mode' in x:assert oct(stat.S_IMODE(p.lstat().st_mode))==x['mode'],str(p)
started=time.monotonic()
try:
 assert not (W/'stage').exists() and not (W/'STOP.json').exists()
 assert sha(O/'freeze.json')=='80c749e3ad666b8d6ae08e9b4c4f8e56a274072926f1005e6d8049b40b5671cd'
 for x in json.loads((W/'donor-pins.json').read_text())['files']:assert sha(Path(x['path']))==x['sha256'],x['path']
 old=json.loads((O/'stage-post-generation-inventory.json').read_text())['files'];donor=O/'stage';dest=W/'stage'
 assert all('continuation17' not in x['path'].lower() and 'continuation-17' not in x['path'].lower() for x in old)
 for x in old:
  p=donor/x['path'];verify(p,x)
  if p.is_symlink():assert p.resolve().is_relative_to(donor) and p.resolve().exists(),str(p)
 actual,sourceDirs=inventory(donor);assert actual==sorted(old,key=lambda x:x['path'])
 depmeta=json.loads((O/'dependency-directory-metadata.json').read_text())['copiedRows']
 for x in depmeta:
  st=(donor/T/'node_modules'/x['path']).stat();assert oct(stat.S_IMODE(st.st_mode))==x['mode'] and st.st_mtime_ns==x['mtime_ns'],x['path']
 mainManifest=O.parent/'u1-c0-physical-currentness-01/main-generated-preimage.json';main=json.loads(mainManifest.read_text());assert len(main)==936
 for x in main:verify(R/x['path'],x)
 wr('main-generated-protection.json',{'manifest':pin(mainManifest),'verifiedRows':len(main),'allExactBeforeCopy':True,'noMainGeneratedEffects':True})
 tools=json.loads((O/'prebuild-freeze.json').read_text())['tools']
 for x in tools:assert sha(Path(x['path']))==x['sha256'],x['path']
 ts=donor/T/'node_modules/typescript/package.json';npm=Path('/opt/homebrew/lib/node_modules/npm/package.json')
 wr('tool-pins.json',{'reusedPrebuildFreeze':pin(O/'prebuild-freeze.json'),'tools':tools,'nodeVersion':'24.7.0','npmVersion':json.loads(npm.read_text())['version'],'typescriptVersion':json.loads(ts.read_text())['version'],'typescriptPackage':pin(ts),'typescriptEntry':pin(donor/T/'node_modules/typescript/bin/tsc'),'noVersionOrBuildCommandsExecuted':True})
 assert sum(x.get('bytes',0) for x in old)<2*1024**3
 shutil.copytree(donor,dest,symlinks=True,copy_function=shutil.copy2)
 copied,copiedDirs=inventory(dest);assert copied==actual
 for x in copied:
  p=dest/x['path'];q=donor/x['path'];a=p.lstat();b=q.lstat();assert (a.st_dev,a.st_ino)!=(b.st_dev,b.st_ino),x['path']
  if p.is_symlink():assert p.resolve().is_relative_to(dest) and p.resolve().exists(),str(p)
  else:assert a.st_nlink==1 and a.st_mtime_ns==b.st_mtime_ns,x['path']
 for a,b in zip(sourceDirs,copiedDirs):
  assert (a['path'],a['mode'],a['mtime_ns'])==(b['path'],b['mode'],b['mtime_ns'])
  assert (a['dev'],a['inode'])!=(b['dev'],b['inode'])
 sourcePaths=[x['path'] for x in json.loads((O/'source-inputs.json').read_text())['files']];indexed={x['path']:x for x in copied}
 source=[indexed[p] for p in sourcePaths]
 wr('prepared-source-inputs.json',{'root':str(dest),'donorSourceRoute':pin(O/'source-inputs.json'),'authoritativeClosedBytes':pin(O/'stage-post-generation-inventory.json'),'files':source,'sourceCount':len(source),'sourceOverlayApplied':False,'note':'Actual closed post-generation bytes selected by prior source routes; owner-generated source-route artifacts retain their final06 values.'})
 deps=json.loads((O/'dependency-inputs.json').read_text())['files']
 for x in deps:verify(dest/T/'node_modules'/x['path'],x)
 wr('dependency-inputs.json',{'donor':pin(O/'dependency-inputs.json'),'files':deps,'allBytesModesTargetsExact':True,'sharedWritableInodes':0})
 sourceDepDirs=[x for x in sourceDirs if x['path']==str(T/'node_modules') or x['path'].startswith(str(T/'node_modules')+'/')]
 copiedDepDirs=[{**x,'path':str(Path(x['path']).relative_to(T/'node_modules'))} for x in copiedDirs if x['path']==str(T/'node_modules') or x['path'].startswith(str(T/'node_modules')+'/')]
 assert len(copiedDepDirs)==len(depmeta)==499
 hidden=dest/T/'node_modules/.package-lock.json';hiddenDonor=donor/T/'node_modules/.package-lock.json'
 assert hidden.stat().st_mtime_ns==hiddenDonor.stat().st_mtime_ns
 wr('dependency-directory-metadata.json',{'donor':pin(O/'dependency-directory-metadata.json'),'sourceRows':depmeta,'copiedRows':copiedDepDirs,'consumedFields':['mode','mtime_ns'],'allConsumedFieldsExact':True,'copy':'copytree symlinks=True copy_function=copy2; directory metadata restored after children','hiddenLock':{**pin(hidden),'mtime_ns':hidden.stat().st_mtime_ns},'nodeModulesMtimeNs':(dest/T/'node_modules').stat().st_mtime_ns,'sameHiddenLockFreshnessRelation':((donor/T/'node_modules').stat().st_mtime_ns<=hiddenDonor.stat().st_mtime_ns)==((dest/T/'node_modules').stat().st_mtime_ns<=hidden.stat().st_mtime_ns)})
 wr('stage-directory-metadata.json',{'sourceRows':sourceDirs,'copiedRows':copiedDirs,'exactModeMtimeRelation':True})
 wr('stage-prepared-inventory.json',{'donor':pin(O/'stage-post-generation-inventory.json'),'files':copied,'rows':len(copied),'allBytesModesTargetsExact':True,'sharedWritableInodes':0})
 for x in old:verify(donor/x['path'],x)
 for x in main:verify(R/x['path'],x)
 wr('copy-result.json',{'exitCode':0,'wallMs':(time.monotonic()-started)*1000,'stageRows':len(copied),'sourceRows':len(source),'dependencyRows':len(deps),'dependencyDirectories':len(copiedDepDirs),'allDirectories':len(copiedDirs),'stageLogicalBytes':sum(x.get('bytes',0) for x in copied),'donorUnchanged':True,'main936Unchanged':True,'noSourceOverlayCompileGeneratorPackOrRuntime':True})
 print(json.dumps(json.loads((W/'copy-result.json').read_text())))
except BaseException:
 if not (W/'STOP.json').exists():wr('STOP.json',{'kind':'stage preparation failure','traceback':traceback.format_exc(),'disposition':'Stopped before repair/retry'})
 raise
