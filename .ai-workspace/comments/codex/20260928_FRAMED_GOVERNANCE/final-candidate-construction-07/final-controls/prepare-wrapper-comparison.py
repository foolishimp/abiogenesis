from pathlib import Path
import hashlib,json,tarfile,urllib.parse,stat
D=Path(__file__).resolve().parent.parent;G=D.parent;C=G/'final-candidate-construction-06';R=G/'f11-carrier-installed-execution-03'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text())
def save(name,value):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def body(tar,path):
 members=[m for m in tar.getmembers() if m.name=='package/'+path];assert len(members)==1 and members[0].isfile(),path
 return tar.extractfile(members[0]).read()
base_id=read(C/'final-package-identity.json');archive=Path(base_id['artifactPath']);assert 'sha256:'+sha(archive)==base_id['artifactDigest']=='sha256:9ac4ca5a40940cc98de8080d9c119788f75596890dde3aae4050a058fe383ced'
evidence_path=R/'nominal-fixture-verification.json';wrapper=read(evidence_path)['verifiedArtifact'];url=urllib.parse.urlparse(wrapper['artifactRef']);assert url.scheme=='file';wrapper_archive=Path(urllib.parse.unquote(url.path));assert 'sha256:'+sha(wrapper_archive)==wrapper['artifactDigest']
with tarfile.open(wrapper_archive,'r:gz') as tar:wrapper_bytes=body(tar,'product-toolchain-manifest.json')
wrapper_manifest=json.loads(wrapper_bytes);assert wrapper_manifest['declaredDependencies']==wrapper['declaredDependencies'] and wrapper_manifest['productContentDigest']==wrapper['productContentDigest']
assert len(wrapper_manifest['declaredDependencies'])==1;dependency=wrapper_manifest['declaredDependencies'][0]
assert set(dependency)=={'kind','productId','packageVersion','compatibilityRef','requiredContractRefs','requiredCapabilityRefs'},'content-unbound version/compatibility dependency only'
with tarfile.open(archive,'r:gz') as tar:
 manifest_bytes=body(tar,'product-toolchain-manifest.json');manifest=json.loads(manifest_bytes)
 graph_path=manifest['capabilityDefinitionGraph']['assetLocator']['path'];graph_bytes=body(tar,graph_path);graph=json.loads(graph_bytes)
 contracts=[];paths=set()
 for ref in dependency['requiredContractRefs']:
  matches=[r for r in manifest['publicContractCatalog']['rows'] if r['contractId']==ref];assert len(matches)==1;row=matches[0];contracts.append(row)
  if 'assetLocator' in row:paths.add(row['assetLocator']['path'])
  if 'nativeTypedLocator' in row:
   for member in row['nativeTypedLocator']['declarationInventory']:
    content=body(tar,member['declarationPath']);assert 'sha256:'+hashlib.sha256(content).hexdigest()==member['declarationDigest'];paths.add(member['declarationPath'])
 capabilities=[]
 for ref in dependency['requiredCapabilityRefs']:
  matches=[r for r in graph['rows'] if r['capabilityId']==ref];assert len(matches)==1;capabilities.append(matches[0]);assert ref in manifest['declaredCapabilityRefs']
 inventory=[]
 for path in sorted(paths):
  content=body(tar,path);p=D/'wrapper-comparison/packaged-C06-required-bodies'/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(content)
  inventory.append({'path':path,'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest(),'origin':'actual packaged C06 archive member'})
for filename,content in [('packaged-C06-manifest.json',manifest_bytes),('packaged-C06-capability-graph.json',graph_bytes),('original-wrapper-manifest.json',wrapper_bytes)]:
 p=D/'wrapper-comparison'/filename;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(content)
save('wrapper-comparison/inputs.json',{'baselineArchive':{'path':str(archive),'bytes':archive.stat().st_size,'sha256':sha(archive)},'wrapperArchive':{'path':str(wrapper_archive),'bytes':wrapper_archive.stat().st_size,'sha256':sha(wrapper_archive)},'wrapperVerificationReference':{'path':str(evidence_path),'sha256':sha(evidence_path),'credit':'immutable historical input only; not newly nominal'},'wrapperContentDigest':wrapper['productContentDigest'],'wrapperDependency':dependency,'baselineRequiredContracts':contracts,'baselineRequiredCapabilities':capabilities,'requiredBodyInventory':inventory,'originalWrapperPublicNativeRows':sum('nativeTypedLocator' in r for r in wrapper['publicContracts']),'limit':'mechanical required-row compatibility inputs only; no new Product lock, Public resolve, wrapper repack or runtime'})
print(json.dumps({'requiredContracts':len(contracts),'requiredCapabilities':len(capabilities),'requiredPackagedBodies':len(inventory),'wrapperNativeRows':sum('nativeTypedLocator' in r for r in wrapper['publicContracts'])}))
