import collections,hashlib,json,os,pathlib,re,stat,tarfile,time
D=pathlib.Path(__file__).resolve().parent;G=D.parent;C=G/'final-candidate-construction-02';P=G/'final-candidate-construction-01';F=C/'source-freeze';S=C/'staged-repo';T='build_tenants/abiogenesis/typescript';I=C/'install/node_modules/@abiogenesis/typescript-tenant';Repair=G/'default-library-publication-repair-01';Review=G/'default-library-publication-review-01'
began=time.monotonic();sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(p.read_text());consumed={}
def body(p):
 b=p.read_bytes();consumed[str(p)]={'path':str(p),'bytes':len(b),'sha256':sha(b)};return b
def named(p,digest):
 b=body(p);assert sha(b)==digest,str(p);return b
def file_record(p,r):
 if r.get('kind')=='symlink':
  assert p.is_symlink() and str(p.readlink())==r['target'],str(p);return
 assert p.is_file() and not p.is_symlink(),str(p)
 b=body(p);assert len(b)==r['bytes'] and sha(b)==r['sha256'],str(p)
 if 'mode' in r:assert stat.S_IMODE(p.stat().st_mode)==r['mode'],str(p)
def paths(root):return {str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() or p.is_symlink()}
cf=json.loads(named(C/'freeze.json','7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469'))
named(C/'return.md','2676ea192b61bafb16f40c595d05b317cc9969f7936bcf6632c428cd327d0388')
named(P/'freeze.json','f6199e3f9ce72f99ecd16307eabc9ca92cc2ecdbc320c70bdd075962eb09650f')
df=json.loads(named(Repair/'freeze.json','19f97fe0758b204829d4f4695c83f49cc641d1c4affdd7defd46022c36eaa01d'))
named(Review/'return.md','33decf307f10b2c7501f5628faa1923cb47cd4afe9222225009fc07f3d0e93c5')
named(Review/'freeze.json','a1670b454cb139baa508fdb97ad09553b65c9ebd40efba1d1d8ce196eeeac250')
for r in cf['records']:file_record(C/r['path'],r)
assert len(cf['records'])==16774
assert paths(C)=={r['path'] for r in cf['records']}|{'freeze.json'}
sf=json.loads(named(C/'source-freeze-manifest.json','98316a687a3ef45aa2e3fd1b6c94429c30c3feddd119b4f15600d3f771e11cc6'))
for r in sf['members']:file_record(F/r['path'],r)
assert paths(F)=={r['path'] for r in sf['members']}
old={r['path']:r for r in read(P/'source-members.json')};new={r['path']:r for r in read(C/'source-members.json')};assert set(old)==set(new) and len(new)==1103
changed=[]
for p,r in new.items():
 file_record(F/'repo'/p,r);file_record(S/p,r);file_record(P/'source-freeze/repo'/p,old[p])
 if r['sha256']!=old[p]['sha256']:changed.append(p)
expected={r['logicalPath']:r for r in df['sources']};assert set(changed)==set(expected)
for p,r in expected.items():assert new[p]['sha256']==r['sha256'] and new[p]['bytes']==r['bytes']
# Reconstruct the three retained original hunks in memory; no patch/worktree effect.
patch=named(Repair/'source.patch','ebf54688aaebfb86d5bbbd0d38f9334d05a24248772d7f09799776a9a7c70708').decode();parts=re.split(r'^--- a/',patch,flags=re.M)[1:]
reconstructed=[]
for part in parts:
 lines=part.splitlines(keepends=True);p=lines[0].rstrip('\n');assert lines[1].rstrip('\n')=='+++ b/'+p
 before=(P/'source-freeze/repo'/p).read_text().splitlines(keepends=True);out=[];cursor=0;at=2
 while at<len(lines):
  m=re.match(r'^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@',lines[at]);assert m
  offset=int(m[1])-1;out+=before[cursor:offset];cursor=offset;removed=added=0;at+=1
  while at<len(lines) and not lines[at].startswith('@@ '):
   l=lines[at];at+=1;assert l[0] in ' +-'
   if l[0] in ' -':assert before[cursor]==l[1:];cursor+=1;removed+=1
   if l[0] in ' +':out.append(l[1:]);added+=1
  assert removed==int(m[2] or 1) and added==int(m[4] or 1)
 out+=before[cursor:];assert ''.join(out).encode()==body(F/'repo'/p);reconstructed.append(p)
assert set(reconstructed)==set(expected)
joins=read(C/'authority-joins.json');assert len(joins)==95
for row in joins:
 original=body(F/row['frozenOriginal']);assert sha(original)==row['originalSha256']==row['digest'][7:]
 assert body(S/T/row['path'])==original==body(I/row['path'])
 assert body(P/'source-freeze'/row['frozenOriginal'])==original
oldg={r['path']:r for r in read(P/'generated-after.json')};newg={r['path']:r for r in read(C/'generated-after.json')};assert set(oldg)==set(newg) and len(newg)==828
generated=[]
for p,r in newg.items():
 file_record(S/T/p,r);file_record(I/p,r);file_record(P/'staged-repo'/T/p,oldg[p])
 if r['sha256']!=oldg[p]['sha256']:generated.append(p)
assert set(generated)=={'build/code/src/gtl/default_library.js','contracts/capabilities/capability-definition-graph.json','product-toolchain-manifest.json'}
emission=next(r for r in df['records'] if r['path']=='component/build/code/src/gtl/default_library.js');file_record(Repair/emission['path'],emission);assert body(Repair/emission['path'])==body(I/'build/code/src/gtl/default_library.js')
def differences(a,b,p=''):
 assert type(a)==type(b),(p,'type drift')
 if isinstance(a,dict):
  assert a.keys()==b.keys(),(p,'shape drift')
  return sum((differences(a[k],b[k],p+'/'+k) for k in a),[])
 if isinstance(a,list):
  assert len(a)==len(b),(p,'population drift')
  return sum((differences(x,y,p+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))),[])
 return [] if a==b else [{'path':p,'before':a,'after':b}]
allowed={
 'contracts/capabilities/capability-definition-graph.json':{'/graphDigest':1,'/rows/[]/capabilityDefinitionDigest':16,'/rows/[]/capabilityDefinitionRef':16,'/rows/[]/dependentCapabilities/[]/capabilityDefinitionDigest':18,'/rows/[]/dependentCapabilities/[]/capabilityDefinitionRef':18,'/rows/[]/owningPublicContracts/[]/contractCatalog/productContentDigest':241},
 'product-toolchain-manifest.json':{'/capabilityDefinitionGraph/assetLocator/contentDigest':1,'/capabilityDefinitionGraph/graphDigest':1,'/contributionManifest/capabilityDefinitionGraph/graphDigest':1,'/contributionManifest/contributionManifestRef':1,'/contributionManifest/descriptorRef':1,'/contributionManifest/productContentDigest':1,'/contributionManifest/publicationBindings/[]/publicationDigest':11,'/contributionManifest/rows/[]/provenanceRef':67,'/contributionManifestDigest':1,'/contributionManifestRef':1,'/descriptorRef':1,'/productContentDigest':1,'/provenanceRef':1}}
deltas={}
for p,categories in allowed.items():
 rows=differences(read(P/'staged-repo'/T/p),read(I/p));counts=collections.Counter(re.sub(r'/\d+(?=/|$)','/[]',r['path']) for r in rows);assert dict(counts)==categories,(p,counts)
 assert rows==read(C/'generated-value-delta.json')[p];deltas[p]=rows
archive=C/'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz';ab=named(archive,'766f748ae9806be95ae8ea124209130c2906ba8c93e172e4c919307ca437d747');assert len(ab)==10375084
archive_rows=[];archive_names=set();mode_deltas=[];bins={v.removeprefix('./') for v in read(I/'package.json')['bin'].values()}
with tarfile.open(archive,'r:gz') as tf:
 for m in tf.getmembers():
  assert m.isfile() and m.name.startswith('package/'),m.name
  rel=m.name[8:];assert rel and '..' not in pathlib.PurePosixPath(rel).parts and not rel.startswith('/') and rel not in archive_names
  archive_names.add(rel);b=tf.extractfile(m).read()
  for root in [S/T,I]:
   p=root/rel;assert not p.is_symlink() and p.is_file() and body(p)==b,str(p)
  installed_mode=stat.S_IMODE((I/rel).stat().st_mode)
  if installed_mode!=m.mode:
   assert rel in bins and m.mode==0o644 and installed_mode==0o755,rel
   mode_deltas.append({'path':rel,'archiveMode':m.mode,'installedMode':installed_mode})
  archive_rows.append({'path':rel,'bytes':len(b),'sha256':sha(b),'archiveMode':m.mode})
assert len(archive_names)==5256 and paths(I)==archive_names
assert {r['path'] for r in mode_deltas}==bins
assert sorted(archive_rows,key=lambda r:r['path'])==read(C/'archive-members.json')
packed=read(C/'pack.stdout');assert len(packed)==1 and {r['path'] for r in packed[0]['files']}==archive_names
olddep=read(P/'dependency-archives.json');newdep=read(C/'dependency-archives.json');assert len(olddep)==len(newdep)==16
for a,b in zip(olddep,newdep):
 assert all(a[k]==b[k] for k in ['locator','version','resolved','integrity','bytes','sha256'])
 assert body(P/'source-freeze'/a['frozenPath'])==body(F/b['frozenPath'])
deps=read(C/'realized-dependencies-before-build.json');olddeps=read(P/'realized-dependencies-before-build.json');assert len(deps)==len(olddeps)==4576
assert [{k:r[k] for k in r if k!='mode'} for r in deps]==[{k:r[k] for k in r if k!='mode'} for r in olddeps]
for row in deps:
 p=S/T/'node_modules'/row['path'];prior=P/'staged-repo'/T/'node_modules'/row['path'];file_record(p,row)
 assert stat.S_IMODE(p.lstat().st_mode)==stat.S_IMODE(prior.lstat().st_mode)
assert paths(S/T/'node_modules')=={r['path'] for r in deps}
oldtools=read(P/'toolchain-host.json');tools=read(C/'toolchain-host.json')
for k in oldtools:assert oldtools[k]==tools[k],k
for row in tools['executables']:file_record(pathlib.Path(row['path']),row)
for row in tools['nodeDynamicLibraries']:
 if not row['systemSharedCache']:assert sha(body(pathlib.Path(row['realpath'])))==row['sha256']
links=[r for r in cf['records'] if r.get('kind')=='symlink'];assert len(links)==19
for row in links:assert (C/row['path']).resolve().is_relative_to(C.resolve()),row['path']
elapsed=(time.monotonic()-began)*1000;assert elapsed<120000
result={'status':'passed','elapsedMs':elapsed,'capMs':120000,'fullFreezeRecords':len(cf['records']),'sourceFreezeRecords':len(sf['members']),'sourceMembers':len(new),'sourceDelta':changed,'patchReconstructed':reconstructed,'authorityJoins':95,'generatedMembers':828,'generatedDelta':generated,'generatedValueDeltaCategories':allowed,'archiveStageInstallMembers':5256,'installedMissingExtra':0,'npmDeclaredBinModeDeltas':mode_deltas,'sourceOnlyStageMembersNotMistakenForPayload':True,'dependencyArchives':16,'dependencyRealizationMembers':4576,'symlinks':19,'toolchainAndHostFileBackedLibrariesUnchanged':True,'acceptedSourceNegatives':'Reused exact independently accepted source review; no rerun','ProductContentDigest':'sha256:5fdaa1938626a7ed2c4afbcdd0d6bdf34a1276c76c34d3ba2559caa4689cd124','effects':'Only review evidence files; no subject mutation or runtime effect'}
for name,value in [('inspection.json',result),('generated-values.json',deltas),('consumed-inputs.json',list(consumed.values()))]:
 with (D/name).open('x') as out:json.dump(value,out,indent=2);out.write('\n')
print(json.dumps(result))
