from pathlib import Path
import base64,hashlib,json,os,shutil,stat,time,datetime
D=Path(__file__).resolve().parent.parent;G=D.parent;C=G/'final-candidate-construction-05';B=C;P=D/'controls'
F,S=D/'final-source',D/'final-stage';TR=Path('build_tenants/abiogenesis/typescript')
REL=Path('/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.2')
started=time.monotonic();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text())
def save(name,value):
 with (D/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def verify(root,rows):
 for row in rows:
  p=root/row['path']
  if row.get('kind')=='symlink':assert p.is_symlink() and os.readlink(p)==row['target'],str(p)
  else:assert p.is_file() and not p.is_symlink() and p.stat().st_size==row['bytes'] and sha(p)==row['sha256'],str(p)
  if 'mode' in row:assert stat.S_IMODE(p.lstat().st_mode)==row['mode'],str(p)
def copy(p,q,expected=None):
 assert p.is_file() and not p.is_symlink(),str(p)
 assert expected is None or sha(p)==expected,str(p)
 q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists() and not q.is_symlink(),str(q)
 shutil.copy2(p,q);assert sha(p)==sha(q) and p.stat().st_ino!=q.stat().st_ino
 return {'path':str(q.relative_to(D)),'kind':'file','bytes':q.stat().st_size,'sha256':sha(q),'mode':stat.S_IMODE(q.stat().st_mode),'origin':str(p)}
assert read(D/'activation.json')['activation']=='T287_RC1_SUCCESSOR_CONSTRUCTION_06'
assert sha(P/'request.txt')=='3cba0f3a2535a78793ddea81d9b19a4203169b7e3cf209a284da4bba248fc1eb'
assert not F.exists() and not S.exists()
cut=read(P/'source-cut.json');assert cut['sourceCount']==len(cut['members'])==1107 and len(cut['replacements'])==2
assert len({r['path'] for r in cut['members']})==1107
preserved=[]
# Reuse accepted physical assurance; rejoin immutable metadata without a broad historical-body reproof.
for prior in read(C/'final-preserved-input-freezes.json'):
 p=Path(prior['path']);assert sha(p)==prior['sha256'];preserved.append({'name':prior['name'],'path':str(p),'sha256':sha(p),'priorAcceptedPhysicalAssurance':prior,'currentVerification':'immutable metadata pin only; prior C05 physical assurance reused'})
cut_acceptance=read(P/'acceptance.json')
extra=[('C05',C/'final-freeze.json',cut['C05FreezeSha256']),('Q06',G/'final-qualification-inputs-06/freeze.json','4b7254fb137e0dec5bd73ebb6ee6eef8d260b1fd81e15d68ad7ca0df3b12ff4c'),('Runtime06',G/'f11-carrier-installed-execution-06/final-runtime-freeze.json','fe57e75e52d32d12d81c70e0e2d48bee428b1ef30651fef36e45a55ed9f30026')]
for key in ['sourceFreeze','sourceAssurance','callerFreeze','callerAssurance','sourceAuthorship']:
 r=cut_acceptance[key];extra.append((key,Path(r['path']),r['sha256']))
for name,p,expected in extra:
 assert sha(p)==expected;preserved.append({'name':name,'path':str(p),'sha256':sha(p),'currentVerification':'immutable metadata pin; closed independent physical assurance reused'})
store_paths=set()
for row in preserved:
 body=read(Path(row['path']))
 for x in body.get('records',[]):
  if x.get('path','').endswith('.jsonl') and '/resources/' in '/'+x['path']:
   p=Path(row['path']).parent/x['path']
   if p.is_file() and not p.is_symlink():store_paths.add(p)
handoff=read(G/'f11-carrier-installed-execution-06/closed-event-resource-handoff.json')
def strings(x):
 if isinstance(x,str):yield x
 elif isinstance(x,dict):
  for v in x.values():yield from strings(v)
 elif isinstance(x,list):
  for v in x:yield from strings(v)
for s in strings(handoff):
 if s.startswith('file://') and s.endswith('.jsonl'):
  import urllib.parse
  p=Path(urllib.parse.unquote(urllib.parse.urlparse(s).path))
  if p.is_file() and not p.is_symlink():store_paths.add(p)
 elif s.startswith('/') and s.endswith('.jsonl'):
  p=Path(s)
  if p.is_file() and not p.is_symlink():store_paths.add(p)
def store_stat(p):
 s=p.stat();return {'path':str(p),'bytes':s.st_size,'device':s.st_dev,'inode':s.st_ino,'mode':stat.S_IMODE(s.st_mode),'mtimeNs':s.st_mtime_ns}
save('final-protected-store-stat-pins.json',[store_stat(p) for p in sorted(store_paths)])
rows=[];copies=[]
for row in cut['members']:
 relative=Path(row['path']);assert not relative.is_absolute() and '..' not in relative.parts and str(relative)==row['path']
 origin=Path(row['origin']);assert origin.is_file() and not origin.is_symlink() and origin.stat().st_size==row['bytes'] and sha(origin)==row['sha256'] and stat.S_IMODE(origin.stat().st_mode)==row['mode'],str(origin)
 a=copy(origin,F/relative,row['sha256']);b=copy(origin,S/relative,row['sha256']);copies += [a,b]
 prior=C/'final-source'/relative;assert prior.is_file() or row.get('preimage')=='ABSENT'
 data=origin.read_bytes();rows.append({**row,'originalSource':row.get('originalSource',str(origin)),'originalAuthorship':row.get('originalAuthorship',row['sourceAuthor']),'copyOrigin':str(origin),'copyBuildAuthor':'/root/native_applicability_design under T287_RC1_SUCCESSOR_CONSTRUCTION_06','C05InputSHA256':sha(prior) if prior.is_file() else None,'changedFromC05':prior.is_file() and sha(prior)!=row['sha256'],'addedFromC05':not prior.is_file(),'gitBlobOfSelectedBody':hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()})
assert sum(r['changedFromC05'] for r in rows)==2 and sum(r['addedFromC05'] for r in rows)==1
manifest=read(REL/'manifest.json');assert sha(REL/'manifest.json')=='3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782'
definition=read(F/'stdo_abiogenesis.json');basis=definition['constitution']['stdo']['basis'];assert sha(F/'stdo_abiogenesis.json')=='eafbb85e640bd007b1e5b94bdc13ab4eb470c8dedaa3ae1a3b586687daf6869c'
assert manifest['kind']=='stdo.installed-release-manifest' and basis['uri']=='stdo://releases/'+manifest['release']['cut']+'/' and basis['manifest_sha256']==sha(REL/'manifest.json')
standard=manifest['standards'];assert len(standard['members'])==standard['member_count']==52
member_set=''.join(r['sha256']+'  '+standard['source_root']+'/'+r['path']+'\n' for r in sorted(standard['members'],key=lambda r:r['path'])).encode();assert hashlib.sha256(member_set).hexdigest()==standard['member_set_sha256']=='2f54671dfde54a6ad87347ac7190028af5e21021988247edf8068ab6248ef7e8'
law=[copy(REL/'manifest.json',D/'final-law/manifest.json')]
for r in standard['members']:law.append(copy(REL/'standards'/r['path'],D/'final-law/standards'/r['path'],r['sha256']))
tools=[]
for row in read(B/'toolchain-pins.json')['records']:
 p=B/row['path'];verify(B,[row]);q=D/row['path']
 if row.get('kind')=='symlink':
  assert not Path(row['target']).is_absolute() and p.resolve().is_relative_to((B/'source-freeze/toolchain').resolve());q.parent.mkdir(parents=True,exist_ok=True);q.symlink_to(row['target']);tools.append({'path':row['path'],'kind':'symlink','target':row['target'],'mode':stat.S_IMODE(q.lstat().st_mode),'origin':str(p)})
 else:tools.append(copy(p,q,row['sha256']))
assert sha(D/'source-freeze/toolchain/bin/node')=='fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f'
assert read(D/'source-freeze/toolchain/npm/package.json')['version']=='11.5.1'
host=read(G/'final-candidate-construction-02/toolchain-host.json');host_checks=[]
for row in host['nodeDynamicLibraries']:
 if row['sha256'] is not None:assert sha(Path(row['path']))==row['sha256'],row['path']
 host_checks.append(row)
seeds=[]
for name in ['product-toolchain-manifest.schema.json','public-contract-catalog.schema.json']:
 p=C/'final-stage'/TR/'contracts/schemas'/name
 seeds.append({**copy(p,S/TR/'contracts/schemas'/name),'role':'derived C05 current schema dependency seed required by accepted builder; not authored source'})
deps=[];lock=read(F/TR/'package-lock.json')['packages']
for row in read(B/'dependency-pins.json')['members']:
 assert lock[row['locator']]['integrity']==row['integrity'] and lock[row['locator']]['version']==row['version']
 p=B/row['preparedArchive']['path'];assert p.stat().st_size==row['bytes'] and sha(p)==row['sha256']
 alg,encoded=row['integrity'].split('-',1);assert base64.b64encode(hashlib.new(alg,p.read_bytes()).digest()).decode()==encoded
 archive=copy(p,D/row['preparedArchive']['path'],row['sha256'])
 content=copy(p,D/'final-npm-cache'/Path(row['preparedCacheContent']['path']).relative_to('final-npm-cache'),row['sha256'])
 original_cache=B/row['preparedCacheContent']['path'];assert sha(original_cache)==row['sha256']
 deps.append({**row,'preparedArchive':archive,'preparedCacheContent':content,'C05FrozenCacheVerified':True,'originalCacheAssurance':'prior accepted C05 provenance retained; no ambient cache acquisition'})
assert len(deps)==16
for n in ['final-artifacts','final-install','final-tmp','final-npm-prefix']:(D/n).mkdir()
for n in ['final-npmrc','final-globalnpmrc']:(D/n).write_text('')
save('construction-execution-grant.json',{'activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_06','actor':'/root/native_applicability_design','role':'Worker','request':str(P/'request.txt'),'requestSHA256':sha(P/'request.txt'),'effectTerritory':str(D),'sourceRepair':False,'runtimeModelProviderNetworkGitEffects':False,'physicalCandidateQualificationPublication':False})
save('final-preserved-input-freezes.json',preserved);save('final-source-members.json',rows);save('final-source-copy-correspondence.json',copies)
save('toolchain-pins.json',{'records':tools,'node':'frozen C03 Node24.7.0','npm':'11.5.1','hostLibrariesReverified':host_checks,'platformSharedCacheLimit':host['systemSharedCacheLimit']})
save('dependency-pins.json',{'members':deps,'count':16,'scriptsDisabled':True,'network':'offline only; sixteen preverified locked archive bytes'})
save('final-law-verification.json',{'releaseRef':basis['uri'],'manifestSHA256':sha(REL/'manifest.json'),'memberSetSHA256':hashlib.sha256(member_set).hexdigest(),'memberCount':52,'members':law,'DefinitionSHA256':sha(F/'stdo_abiogenesis.json'),'defaultLibrarySubstrate':'unchanged declared RC1 runtime substrate; no repin'})
save('final-schema-seeds.json',seeds)
save('final-source-freeze-manifest.json',{'status':'FROZEN_EXACT_SOURCE_CUT','sourceCutSHA256':sha(P/'source-cut.json'),'sourceCutAuthor':cut['sourceCutAuthor'],'members':[r for r in copies if r['path'].startswith('final-source/')]+law,'authoredMemberCount':1107,'actualChangedFromC05':2,'actualAddedFromC05':1,'acceptedSourceFreezeSHA256':cut['acceptedSourceFreezeSha256'],'C05FreezeSHA256':cut['C05FreezeSha256'],'dirtyOverlayIsCommit':False,'toolchainPinsSHA256':sha(D/'toolchain-pins.json'),'lawInputRoles':'twelve historical aliases remain frozen construction inputs; current RC2 authority outputs are separately derived in final-stage'})
save('final-budgets.json',{'operationCapsMs':{'dependencies':240000,'clean':60000,'compile':600000,'authority-stage':300000,'manifest':600000,'pack':240000,'install':240000,'verify':300000,'installed-publications':240000,'wrapper-compatibility':120000},'maximumMs':3060000,'terminationGraceMs':1000,'defaultHeapUnchanged':True,'donorObservedTenCommandMs':40186,'donorPreparationMs':5171,'reason':'same accepted finite C05 builder and sixteen archives plus accepted one F_P proof-delivery postimage and exact new test; stage-specific conservative ceilings, not an arbitrary global180-second limit; no semantic/runtime workloads'})
save('final-preparation-result.json',{'status':'exact_source_selection_ready','elapsedMs':(time.monotonic()-started)*1000,'sourceMembers':1107,'changedFromC05':2,'addedFromC05':1,'frozenSourceSHA256':sha(D/'final-source-freeze-manifest.json'),'toolsReverified':len(tools),'lockedArchives':16,'schemaSeeds':2,'completeRC2MembersVerified':52,'preservedFreezesVerified':len(preserved),'HOMEUnchanged':True,'ambientEffects':False})
print(json.dumps(read(D/'final-preparation-result.json')),flush=True)
