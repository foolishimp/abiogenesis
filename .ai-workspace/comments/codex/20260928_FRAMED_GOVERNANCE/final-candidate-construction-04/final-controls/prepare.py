from pathlib import Path
import base64,hashlib,json,os,shutil,stat,time,datetime
D=Path(__file__).resolve().parent.parent;G=D.parent;C=G/'final-candidate-construction-03';P=D/'controls'
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
assert read(D/'activation.json')['activation']=='T287_RC1_SUCCESSOR_CONSTRUCTION_04'
assert sha(P/'request.txt')=='a4217014ca8a05ac5a66317a3a6abf1d3226ff4f6b14e2fecbabce3a8cac8342'
assert not F.exists() and not S.exists()
cut=read(P/'source-cut.json');assert cut['sourceCount']==len(cut['members'])==1106 and len(cut['replacements'])==4
assert len({r['path'] for r in cut['members']})==1106
preserved=[]
for name,filename,expected in [('C03','final-candidate-construction-03/final-freeze.json','a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'),('Source','native-declaration-applicability-realization-01/freeze.json','fe58a7afafa96fcfe091e69b479983b286efc0dece820eac495039e81d501d89'),('CallerPrep','qualification-command-preparation-01/freeze.json','e642d4c1968ae7947bb2ca5e87abf0db7ee9080d87747ab169c35f34624900c5'),('Runtime03','f11-carrier-installed-execution-03/freeze.json','4be65227944eebcf0d07d2434a943e8dd61489349f2952d31fd0e4d7c2d5f0ef')]:
 p=G/filename;assert sha(p)==expected;body=read(p);verify(p.parent,body['records'])
 preserved.append({'name':name,'path':str(p),'sha256':sha(p),'recordsVerified':len(body['records']),'bodyBytesVerified':sum(r.get('bytes',0) for r in body['records'])})
# These accepted caller subjects remain immutable reusable interfaces; no runtime is invoked.
for name in ['final-f11-current-resource-caller-02','rc1-c03-conformance-caller-repair-01']:
 p=G/name/'freeze.json';body=read(p);verify(p.parent,body['records']);preserved.append({'name':name,'path':str(p),'sha256':sha(p),'recordsVerified':len(body['records'])})
# Verify all original runtime store bodies declared in the accepted Runtime03 report by its complete freeze; do not copy stores.
rows=[];copies=[]
for row in cut['members']:
 relative=Path(row['path']);assert not relative.is_absolute() and '..' not in relative.parts and str(relative)==row['path']
 origin=Path(row['origin']);assert origin.is_file() and not origin.is_symlink() and origin.stat().st_size==row['bytes'] and sha(origin)==row['sha256'] and stat.S_IMODE(origin.stat().st_mode)==row['mode'],str(origin)
 a=copy(origin,F/relative,row['sha256']);b=copy(origin,S/relative,row['sha256']);copies += [a,b]
 prior=C/'final-source'/relative;assert prior.is_file()
 data=origin.read_bytes();rows.append({**row,'originalSource':str(origin),'originalAuthorship':row['sourceAuthor'],'copyBuildAuthor':'/root/native_applicability_design under T287_RC1_SUCCESSOR_CONSTRUCTION_04','C03InputSHA256':sha(prior),'changedFromC03':sha(prior)!=row['sha256'],'gitBlobOfSelectedBody':hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()})
assert sum(r['changedFromC03'] for r in rows)==4
manifest=read(REL/'manifest.json');assert sha(REL/'manifest.json')=='3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782'
definition=read(F/'stdo_abiogenesis.json');basis=definition['constitution']['stdo']['basis'];assert sha(F/'stdo_abiogenesis.json')=='eafbb85e640bd007b1e5b94bdc13ab4eb470c8dedaa3ae1a3b586687daf6869c'
assert manifest['kind']=='stdo.installed-release-manifest' and basis['uri']=='stdo://releases/'+manifest['release']['cut']+'/' and basis['manifest_sha256']==sha(REL/'manifest.json')
standard=manifest['standards'];assert len(standard['members'])==standard['member_count']==52
member_set=''.join(r['sha256']+'  '+standard['source_root']+'/'+r['path']+'\n' for r in sorted(standard['members'],key=lambda r:r['path'])).encode();assert hashlib.sha256(member_set).hexdigest()==standard['member_set_sha256']=='2f54671dfde54a6ad87347ac7190028af5e21021988247edf8068ab6248ef7e8'
law=[copy(REL/'manifest.json',D/'final-law/manifest.json')]
for r in standard['members']:law.append(copy(REL/'standards'/r['path'],D/'final-law/standards'/r['path'],r['sha256']))
tools=[]
for row in read(C/'toolchain-pins.json')['records']:
 p=C/row['path'];verify(C,[row]);q=D/row['path']
 if row.get('kind')=='symlink':
  assert not Path(row['target']).is_absolute() and p.resolve().is_relative_to((C/'source-freeze/toolchain').resolve());q.parent.mkdir(parents=True,exist_ok=True);q.symlink_to(row['target']);tools.append({'path':row['path'],'kind':'symlink','target':row['target'],'mode':stat.S_IMODE(q.lstat().st_mode),'origin':str(p)})
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
 seeds.append({**copy(p,S/TR/'contracts/schemas'/name),'role':'derived C03 current schema dependency seed required by accepted builder; not authored source'})
deps=[];lock=read(F/TR/'package-lock.json')['packages']
for row in read(C/'dependency-pins.json')['members']:
 assert lock[row['locator']]['integrity']==row['integrity'] and lock[row['locator']]['version']==row['version']
 p=C/row['preparedArchive']['path'];assert p.stat().st_size==row['bytes'] and sha(p)==row['sha256']
 alg,encoded=row['integrity'].split('-',1);assert base64.b64encode(hashlib.new(alg,p.read_bytes()).digest()).decode()==encoded
 archive=copy(p,D/row['preparedArchive']['path'],row['sha256'])
 content=copy(p,D/'final-npm-cache'/Path(row['preparedCacheContent']['path']).relative_to('npm-cache'),row['sha256'])
 original_cache=Path(row['originalCachePath']);assert sha(original_cache)==row['sha256']
 deps.append({**row,'preparedArchive':archive,'preparedCacheContent':content,'originalCacheVerified':True})
assert len(deps)==16
for n in ['final-artifacts','final-install','final-tmp','final-npm-prefix']:(D/n).mkdir()
for n in ['final-npmrc','final-globalnpmrc']:(D/n).write_text('')
save('construction-execution-grant.json',{'activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_04','actor':'/root/native_applicability_design','role':'Worker','request':str(P/'request.txt'),'requestSHA256':sha(P/'request.txt'),'effectTerritory':str(D),'sourceRepair':False,'runtimeModelProviderNetworkGitEffects':False,'physicalCandidateQualificationPublication':False})
save('final-preserved-input-freezes.json',preserved);save('final-source-members.json',rows);save('final-source-copy-correspondence.json',copies)
save('toolchain-pins.json',{'records':tools,'node':'frozen C03 Node24.7.0','npm':'11.5.1','hostLibrariesReverified':host_checks,'platformSharedCacheLimit':host['systemSharedCacheLimit']})
save('dependency-pins.json',{'members':deps,'count':16,'scriptsDisabled':True,'network':'offline only; sixteen preverified locked archive bytes'})
save('final-law-verification.json',{'releaseRef':basis['uri'],'manifestSHA256':sha(REL/'manifest.json'),'memberSetSHA256':hashlib.sha256(member_set).hexdigest(),'memberCount':52,'members':law,'DefinitionSHA256':sha(F/'stdo_abiogenesis.json'),'defaultLibrarySubstrate':'unchanged declared RC1 runtime substrate; no repin'})
save('final-schema-seeds.json',seeds)
save('final-source-freeze-manifest.json',{'status':'FROZEN_EXACT_SOURCE_CUT','sourceCutSHA256':sha(P/'source-cut.json'),'sourceCutAuthor':cut['sourceCutAuthor'],'members':[r for r in copies if r['path'].startswith('final-source/')]+law,'authoredMemberCount':1106,'actualChangedFromC03':4,'acceptedSourceFreezeSHA256':cut['acceptedSourceFreezeSha256'],'C03FreezeSHA256':cut['C03FreezeSha256'],'dirtyOverlayIsCommit':False,'toolchainPinsSHA256':sha(D/'toolchain-pins.json'),'lawInputRoles':'twelve historical aliases remain frozen construction inputs; current RC2 authority outputs are separately derived in final-stage'})
save('final-budgets.json',{'operationCapsMs':{'dependencies':240000,'clean':60000,'compile':600000,'authority-stage':300000,'manifest':600000,'pack':240000,'install':240000,'verify':300000,'installed-publications':240000,'wrapper-compatibility':120000},'maximumMs':3060000,'terminationGraceMs':1000,'defaultHeapUnchanged':True,'donorObservedNineCommandMs':41271,'reason':'same accepted finite C03 builder and sixteen archives plus exact three native postimages; stage-specific conservative ceilings, not an arbitrary global180-second limit; no semantic/runtime workloads'})
save('final-preparation-result.json',{'status':'exact_source_selection_ready','elapsedMs':(time.monotonic()-started)*1000,'sourceMembers':1106,'changedFromC03':4,'frozenSourceSHA256':sha(D/'final-source-freeze-manifest.json'),'toolsReverified':len(tools),'lockedArchives':16,'schemaSeeds':2,'completeRC2MembersVerified':52,'preservedFreezesVerified':len(preserved),'HOMEUnchanged':True,'ambientEffects':False})
print(json.dumps(read(D/'final-preparation-result.json')),flush=True)
