
import tarfile,json,hashlib,pathlib
repo=pathlib.Path("/Users/jim/src/apps/abiogenesis")
tenant=pathlib.Path("/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript")
root=pathlib.Path("/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-15")
old=pathlib.Path("/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-14")/'packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz'
new=root/'packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz'
freeze=json.loads((pathlib.Path("/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/planning-projection-repair-31")/'freeze.json').read_text())
allowed={'package/'+str(pathlib.Path(row['after']['path']).relative_to(tenant)):row['after'] for row in freeze['generatedDelta']}
def inventory(archive):
    with tarfile.open(archive,'r:gz') as tar:
        members=tar.getmembers()
        if len(set(x.name for x in members))!=len(members): raise RuntimeError('Duplicate package path')
        rows={}
        for m in members:
            if not m.isfile() or not m.name.startswith('package/') or '..' in pathlib.PurePosixPath(m.name).parts:
                raise RuntimeError('Nonregular or unsafe package member '+m.name)
            body=tar.extractfile(m).read()
            rows[m.name]={'path':m.name,'type':m.type.decode(),'mode':m.mode,'byteCount':len(body),'sha256':hashlib.sha256(body).hexdigest()}
        package=json.loads(tar.extractfile('package/package.json').read())
        manifest=json.loads(tar.extractfile('package/product-toolchain-manifest.json').read())
    return rows,package,manifest
before,metadata0,manifest0=inventory(old);after,metadata1,manifest1=inventory(new)
if before.keys()!=after.keys(): raise RuntimeError('Package membership drift')
delta=[]
for p in sorted(before):
    if before[p]['type']!=after[p]['type'] or before[p]['mode']!=after[p]['mode']:raise RuntimeError('Package type/mode drift '+p)
    if before[p]!=after[p]:
        if p not in allowed: raise RuntimeError('Unexpected package byte delta '+p)
        if after[p]['sha256']!=allowed[p]['sha256'] or after[p]['byteCount']!=allowed[p]['byteCount']: raise RuntimeError('Frozen generated mismatch '+p)
        delta.append({'path':p,'before':before[p],'after':after[p]})
if set(x['path'] for x in delta)!=set(allowed): raise RuntimeError('Expected frozen member delta missing')
if metadata0!=metadata1:raise RuntimeError('Package metadata/dependency drift')
for p in after:
    if p.startswith(('package/test_env/','package/.ai-workspace/','package/design/','package/code/')):
        raise RuntimeError('External Source/test/campaign leakage '+p)
if manifest0['publicContractCatalog']!=manifest1['publicContractCatalog']:raise RuntimeError('Public catalog/group drift')
oldroot=pathlib.Path("/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-14")/'scratch/successor/package'
report={'baseline':str(old),'successor':str(new),'fileCount':len(after),'allMembersTypesModesAndDigestsCompared':True,'allPathsAndModesEqual':True,'exactFrozenGeneratedChangesOnly':True,'delta':delta,'packageMetadataAndDependenciesEqual':True,'publicCatalogEqual':True,'externalFixturesExcluded':True}
(root/'member-delta.json').write_text(json.dumps(report,indent=2)+'\n')
extract=root/'scratch/successor';extract.mkdir()
with tarfile.open(new,'r:gz') as tar:tar.extractall(extract,filter='data')
print(json.dumps({'fileCount':len(after),'deltaPaths':[x['path'] for x in delta],'publicCatalogEqual':True,'extractedRoot':str(extract/'package')}))
