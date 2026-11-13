import pathlib,json,hashlib,sys,os
B=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');Q=B/'single-machine-p1-03/budget-retest-01';W=pathlib.Path('/Users/jim/src/apps/abiogenesis-single-machine-p1')
def pin(p):
 p=pathlib.Path(p);assert p.is_file() and not p.is_symlink();b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def load(p):return json.loads(pathlib.Path(p).read_text())
assert len(sys.argv)==2 and pin(Q/'ROOT_CALL_SELECTION.json')['sha256']==sys.argv[1];s=load(Q/'ROOT_CALL_SELECTION.json');assert s['status']=='ROOT_SELECTED_FRESH_TESTING_UAT_CALL' and s['providerDispatch'] is False
for key in ['rootAuthority','sourceBaseline','priorClosure','priorConstruction','setupResume','grant','priorFrozenManifest']:assert pin(s[key]['path'])==s[key]
w=load(Q/'workload.json');assert set(w['workOrders'])=={'testing','uat'} and all(not o['writeRoots'] for o in w['workOrders'].values());assert len(w['testing']['selectedPaths'])==963
# Final physical source/census is acquired only after Root selected the closed authored checkpoint.
c=load(Q/'snapshot-census.json');rows=c['rows'];assert set(rows)==set(w['readRoots']) and len(rows)==s['readRootCount'];assert c['sourceCommit']==s['sourceCommit']
for path,row in rows.items():
 actual=pin(W/path);assert actual['bytes']==row['bytes'] and actual['sha256']==row['sha256'],path
assert pin(Q/'workload.json')['sha256']==s['workloadSha256'];assert pin(Q/'snapshot-census.json')['sha256']==s['sourceCensusSha256']
files={Q/n for n in ['ROOT_CALL_SELECTION.json','call-state.mjs','preflight.mjs','preflight-guard.py','prepare-call.mjs','dispatch.mjs','prepare-activation.py','freeze-call-inputs.py','freeze-source-inputs.py','freeze-dispatch.py','workload.json','snapshot-census.json','NATIVE_GRANT.json','PROVIDER_PROFILE.json','public-setup.mjs','consumer.mjs']};files.update(B/'operator-client'/n for n in ['public-setup.mjs','runner.mjs','consumer.mjs','scenarios.mjs']);files.update(W/path for path in rows);files.add(W/'.abiogenesis/workspace-manifest.json');files.update(pathlib.Path(s[k]['path']) for k in ['rootAuthority','sourceBaseline','priorClosure','priorConstruction','setupResume','grant','priorFrozenManifest']);files.update(pathlib.Path(r['path']) for r in s['assessmentInputs'])
# Fresh consumer contains only7 payload files. Reuse old native-body custody plus trusted old checker for new native installation.
resume=load(s['setupResume']['path']);count=0
for install in resume['setup']['installations']:
 if install['installedRoot']==resume['installedRoot']:continue
 for root,dirs,names in os.walk(install['installedRoot'],followlinks=False):
  for name in names:files.add(pathlib.Path(root)/name);count+=1
assert count==7
old=load(B/'single-machine-p1-03/PREFLIGHT_BINDING.json');dep=old['offlineDependency'];files.update(pathlib.Path(dep[k]) for k in ['python','script','inventory']);stdo=load(B/'increment-b-07/B07_SOURCE_BINDINGS.json')['stdo'];files.add(B/'increment-b-07/B07_SOURCE_BINDINGS.json');files.update(pathlib.Path(r['path']) for r in [stdo['resolvedEntrypoint'],stdo['interpreter'],stdo['releaseManifest'],*stdo['toolchainModuleSources']]);e=s['eventPrefix'];st=pathlib.Path(e['path']).stat();assert st.st_size==e['bytes'] and st.st_ino==e['inode'] and st.st_dev==e['device'] and pin(e['path'])['sha256']==e['sha256'];inherited=load(s['priorFrozenManifest']['path']);n=sum(1 for r in inherited['files'] if r['path'].startswith(s['builderRuntimeRoot']+'/sandbox/installed/'));assert n>5000
result={'kind':'single_machine_p1_preflight_binding','status':'ROOT_SELECTED_MODEL_FREE_PREFLIGHT','providerDispatch':False,'builder':old['builder'],'nodePath':old['nodePath'],'sourceCommit':s['sourceCommit'],'files':[pin(p) for p in sorted(files,key=str)],'executables':old['executables'],'offlineDependency':dep,'eventPrefix':e,'sourceCensusSha256':s['sourceCensusSha256'],'workloadSha256':s['workloadSha256'],'inheritedInstalledCustody':s['priorFrozenManifest'],'inheritedRuntimeRoot':s['builderRuntimeRoot'],'inheritedInstalledFileCount':n,'claims':'Actual observed Testing/UAT files with controlled initial selector premises; no admission/provider'}
with (Q/'PREFLIGHT_BINDING.json').open('x') as f:json.dump(result,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps(pin(Q/'PREFLIGHT_BINDING.json')))
