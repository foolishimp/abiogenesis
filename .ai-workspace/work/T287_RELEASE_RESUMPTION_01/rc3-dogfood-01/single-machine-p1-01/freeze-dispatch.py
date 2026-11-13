#!/usr/bin/env python3
"""Freeze exact already-prepared P1 call and its inputs; no runtime/provider call."""
import hashlib,json,os,pathlib,subprocess
B=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');P=B/'single-machine-p1-01';A=P/'attempt-001';S=P/'runtime-001';W=pathlib.Path('/Users/jim/src/apps/abiogenesis-single-machine-p1')
def pin(p):
 if p.is_symlink() or not p.is_file():raise ValueError('not a regular file: '+str(p))
 v=p.read_bytes();return {'path':str(p),'bytes':len(v),'sha256':hashlib.sha256(v).hexdigest()}
def load(p):return json.loads(p.read_text())
assert not (A/'STARTED.json').exists() and not (A/'PREPARATION_MANIFEST.json').exists()
assert subprocess.check_output(['/usr/bin/git','-C',str(W),'rev-parse','HEAD'],text=True).strip()=='97406077c9a91e18e9425c3df55c6cd80f4c2073';subprocess.run(['/usr/bin/git','-C',str(W),'diff','--quiet'],check=True);subprocess.run(['/usr/bin/git','-C',str(W),'diff','--cached','--quiet'],check=True)
c=load(P/'snapshot-census.json');assert len(c['rows'])==968
files={W/path for path in c['rows']}; files.add(W/'.abiogenesis/workspace-manifest.json')
for name in ['PREFLIGHT_BINDING.json','ACTIVATE_P1.json','model-free-preflight.json','snapshot-census.json','workload-v2.json','PROVIDER_PROFILE_DRAFT.json','dispatch.mjs','prepare-call.mjs','preflight.mjs','preflight-guard.py','NATIVE_GRANT.json','DESIGN_AND_ACTIVATION.md','AMENDMENT_01.md','AMENDMENT_02.md','SCRATCH_TYPECHECK_RECIPE.md','SCRATCH_TYPECHECK_BASELINE_01.json','task-v2.md','HOW.md','rubric.json','COUNTEREXAMPLE.json','SOURCE_CHECKPOINT_14.json','SOURCE_GIT_CHECKPOINT.json','B11_C2_961_PREPARATION.json','B11_C2_961_MATERIALIZATION.json','C2_963_AMENDMENT.json','ASSESSMENT_INPUTS_MATERIALIZATION.json','CORRESPONDENCE_PREFLIGHT.json','CORRESPONDENCE_PREFLIGHT.stdout','WORKSPACE_AUTHORITY.md','ROOT_SETUP_SELECTION.json']:
 files.add(P/name)
files.update(A/n for n in ['run.json','input.json','prepared-call.json','PREPARED_CALL.json']);files.add(S/'operator-resume-material.json');files.add(S/'summary.json')
manifest=load(P/'PREFLIGHT_BINDING.json');files.update(pathlib.Path(r['path']) for r in manifest['files'])
stdo=load(B/'increment-b-07/B07_SOURCE_BINDINGS.json')['stdo'];files.update(pathlib.Path(x['path']) for x in [stdo['resolvedEntrypoint'],stdo['interpreter'],stdo['releaseManifest'],*stdo['toolchainModuleSources']]);files.add(B/'increment-b-07/B07_SOURCE_BINDINGS.json')
modules=[B/'operator-client'/n for n in ['public-setup.mjs','runner.mjs','consumer.mjs','scenarios.mjs']];files.update(modules)
resume=load(S/'operator-resume-material.json');counts={}
for install in resume['setup']['installations']:
 root=pathlib.Path(install['installedRoot']);count=0
 for parent,dirs,names in os.walk(root,followlinks=False):
  for name in dirs:
   assert not (pathlib.Path(parent)/name).is_symlink(),'unexpected symlink dir'
  for name in names:
   q=pathlib.Path(parent)/name;assert not q.is_symlink() and q.is_file();files.add(q);count+=1
 counts[install['packageName']]=count
assert counts=={'@abiogenesis/typescript-tenant':5321,'@abi5-tests/sandbox-uat':7},counts
for path,row in c['rows'].items():
 actual=pin(W/path);assert actual['bytes']==row['bytes'] and actual['sha256']==row['sha256'],path
pre=load(P/'model-free-preflight.json');binding=load(A/'PREPARED_CALL.json');assert binding['status']=='prepared_not_admitted' and binding['workloadSha256']==pre['workloadSha256']
e=manifest['eventPrefix'];st=pathlib.Path(e['path']).stat();assert st.st_size==e['bytes'] and st.st_dev==e['device'] and st.st_ino==e['inode'];assert pin(pathlib.Path(e['path']))['sha256']==e['sha256']
files=sorted(files,key=str);rows=[pin(q) for q in files]
result={'kind':'single_machine_p1_frozen_dispatch','status':'PREPARED_NOT_DISPATCHED','sourceBasis':'none','sourceCommit':'97406077c9a91e18e9425c3df55c6cd80f4c2073','files':rows,'sourceReadRoots':968,'c2SelectedPaths':963,'constructionWritePaths':46,'focusedOwnerTests':8,'commands':9,'installedPayloadFiles':counts,'eventPrefix':e,'offlineDependency':manifest['offlineDependency'],'executableLocalClosure':{'method':'explicit four existing operator modules; dispatch uses only node builtins and these exact dynamic module paths','modules':[str(x) for x in modules]},'limits':['No native Run/admission/provider call yet.','Retained predictive preflight is revalidated against current observed Context at dispatch; native currentness remains fresh.','No release or whole Product qualification.']}
q=A/'PREPARATION_MANIFEST.json'
with q.open('x') as f:json.dump(result,f,indent=2,sort_keys=True);f.write('\n')
r=pin(q);print(json.dumps({'manifestSha256':r['sha256'],'bytes':r['bytes'],'files':len(rows),'installed':counts,'eventPrefix':e['sha256']}))
