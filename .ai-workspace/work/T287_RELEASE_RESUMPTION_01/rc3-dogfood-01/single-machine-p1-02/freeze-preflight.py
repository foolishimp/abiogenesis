#!/usr/bin/env python3
"""Freeze Root-selected P1-02 current source/inputs and reused setup; no runtime/Public/provider call."""
import hashlib,json,pathlib,subprocess,sys
B=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');P=B/'single-machine-p1-02';W=pathlib.Path('/Users/jim/src/apps/abiogenesis-single-machine-p1')
def pin(p):
 p=pathlib.Path(p);assert p.is_file() and not p.is_symlink(),str(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def load(p):return json.loads(pathlib.Path(p).read_text())
def check(r):
 actual=pin(r['path']);assert all(actual[k]==r[k] for k in ['path','bytes','sha256']),r['path']
assert len(sys.argv)==2,'usage: freeze-preflight.py ROOT_REUSE_SELECTION_SHA256_HEX'
sr=pin(P/'ROOT_REUSE_SELECTION.json');assert sr['sha256']==sys.argv[1];s=load(sr['path']);assert s['status']=='ROOT_SELECTED_REUSE_AND_SOURCE' and s['providerDispatch'] is False and s['rootAuthority'] and s['sourceCommit']
for k in ['rootAuthority','sourceBaseline','grant','priorSetup','priorFrozenManifest','priorAfterRunResume','priorExecution','priorFreshReads']:check(s[k])
assert subprocess.check_output(['/usr/bin/git','-C',str(W),'rev-parse','HEAD'],text=True).strip()==s['sourceCommit'];subprocess.run(['/usr/bin/git','-C',str(W),'diff','--quiet'],check=True);subprocess.run(['/usr/bin/git','-C',str(W),'diff','--cached','--quiet'],check=True)
c=load(P/'snapshot-census.json');w=load(P/'workload-v2.json');assert c['sourceCommit']==s['sourceCommit'];assert pin(P/'snapshot-census.json')['sha256']==s['sourceCensusSha256'];assert pin(P/'workload-v2.json')['sha256']==s['workloadSha256'];assert len(c['rows'])==len(w['readRoots'])==s['readRootCount'];assert len(w['testing']['selectedPaths'])==963 and len(w['workOrders']['construction']['writeRoots'])==53
files={P/n for n in ['ROOT_REUSE_SELECTION.json','reuse-state.mjs','prepare-reuse.mjs','preflight-guard.py','preflight.mjs','prepare-call.mjs','dispatch.mjs','freeze-preflight.py','freeze-dispatch.py','build-workload.py','freeze-source-inputs.py','prepare-activation.py','workload-v2.json','snapshot-census.json','NATIVE_GRANT.json','PROVIDER_PROFILE_DRAFT.json']}
for k in ['rootAuthority','sourceBaseline','grant','priorSetup','priorFrozenManifest','priorAfterRunResume','priorExecution','priorFreshReads']:files.add(pathlib.Path(s[k]['path']))
for r in s['assessmentInputs']:check(r);files.add(pathlib.Path(r['path']))
for path,r in c['rows'].items():
 actual=pin(W/path);assert actual['bytes']==r['bytes'] and actual['sha256']==r['sha256'],path
 files.add(W/path)
files.add(W/'.abiogenesis/workspace-manifest.json')
files.update(B/'operator-client'/n for n in ['public-setup.mjs','runner.mjs','consumer.mjs','scenarios.mjs'])
old=load(B/'single-machine-p1-01/PREFLIGHT_BINDING.json');dep=old['offlineDependency'];files.update(pathlib.Path(dep[k]) for k in ['python','script','inventory'])
stdo=load(B/'increment-b-07/B07_SOURCE_BINDINGS.json')['stdo'];files.add(B/'increment-b-07/B07_SOURCE_BINDINGS.json');files.update(pathlib.Path(r['path']) for r in [stdo['resolvedEntrypoint'],stdo['interpreter'],stdo['releaseManifest'],*stdo['toolchainModuleSources']])
e=s['eventPrefix'];es=pathlib.Path(e['path']).stat();assert es.st_size==e['bytes'] and es.st_dev==e['device'] and es.st_ino==e['inode'];assert pin(e['path'])['sha256']==e['sha256']
inherited=load(s['priorFrozenManifest']['path']);installed=[r for r in inherited['files'] if r['path'].startswith(s['runtimeRoot']+'/sandbox/installed/')];assert len(installed)>5000
# Existing custody is referenced, not rebuilt as thousands of duplicate manifest rows.
for r in installed:check(r)
for r in old['executables']:assert pin(r['realPath'])['sha256']==r['sha256']
result={'kind':'single_machine_p1_preflight_binding','status':'ROOT_SELECTED_MODEL_FREE_PREFLIGHT','providerDispatch':False,'builder':old['builder'],'nodePath':old['nodePath'],'sourceCommit':s['sourceCommit'],'files':[pin(p) for p in sorted(files,key=str)],'executables':old['executables'],'offlineDependency':dep,'eventPrefix':e,'sourceCensusSha256':s['sourceCensusSha256'],'workloadSha256':s['workloadSha256'],'inheritedInstalledCustody':s['priorFrozenManifest'],'inheritedRuntimeRoot':s['runtimeRoot'],'inheritedInstalledFileCount':len(installed),'claims':old['claims']}
q=P/'PREFLIGHT_BINDING.json'
with q.open('x') as f:json.dump(result,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps(pin(q)))
