#!/usr/bin/env python3
"""Bind actual returned B08 receipts; hashes/files only, no owner/runtime call."""
from pathlib import Path
import hashlib,json,sys
from urllib.parse import urlparse,unquote
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');root=base/'attempt-011';old=base/'attempt-010';inc=base/'increment-b-08'
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for block in iter(lambda:f.read(1048576),b''):h.update(block)
 return h.hexdigest()
def pin(p):return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def save(p,x):
 with p.open('x') as f:json.dump(x,f,indent=2,sort_keys=True);f.write('\n')
assert len(sys.argv)==4,'Root supplies actual after-run-resume, execution, outcome-summary bare SHA256 values'
selection=json.loads((root/'SELECTION.json').read_text())
for k in ['priorB08Manifest','priorB08Workload','priorB08Custody','initialSetupResume','criteria','sourceAndTools','launcherRepair','additionalSource']:
 row=selection[k];assert pin(Path(row['path']))==row,k
rows=[]
for name,expected in zip(['after-run-resume.json','execution.json','outcome-summary.json'],sys.argv[1:]):
 p=old/name;assert sha(p)==expected,name;rows.append(pin(p))
after,execution,summary=[json.loads(Path(row['path']).read_text())for row in rows]
assert summary['ended'] and summary['run'] and summary['exitCode']==execution['execution']['exitCode']
assert summary['run']==execution['receipt']['resources']['run']
close=execution['receipt']['resources']['eventResource']['closeHandoff'];assert close==after['state']['closeHandoff']
retained=json.loads(Path(selection['initialSetupResume']['path']).read_text());assert retained['config']['recursionBound']==3
assert retained['installedRoot']==after['installedRoot'] and retained['workspaceAuthority']==after['workspaceAuthority']
originalPrefix=retained['state']['closeHandoff']['prefix'];prefix=close['prefix'];assert prefix['eventLogRef']==originalPrefix['eventLogRef']
event=Path(unquote(urlparse(prefix['eventLogRef']).path));assert event.stat().st_size==prefix['prefixLength'] and 'sha256:'+sha(event)==prefix['prefixDigest'],'B08 handoff is not the current physical prefix'
retained['state']=after['state'];retained['installedRoot']=after['installedRoot'];retained['workspaceAuthority']=after['workspaceAuthority']
source=json.loads(Path(selection['sourceAndTools']['path']).read_text());work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
for row in source['candidateRows']:assert sha(work/row['path'])==row['current']['sha256']
for row in [source['stdo']['resolvedEntrypoint'],source['stdo']['interpreter'],source['stdo']['releaseManifest'],*source['stdo']['toolchainModuleSources']]:assert sha(Path(row['path']))==row['sha256']
w=json.loads((root/'workload.json').read_text());previous=json.loads(Path(selection['priorB08Workload']['path']).read_text());assert w['testing']['commands']==previous['testing']['commands'] and len(w['testing']['commands'])==9
assert set(w['readRoots'])==set(previous['readRoots'])|{'stdo_abiogenesis.json'};assert set(w['testing']['selectedPaths'])==set(previous['testing']['selectedPaths'])|{'stdo_abiogenesis.json'}
assert all(not o['writeRoots'] for o in w['workOrders'].values())
for path in w['testing']['selectedPaths']:assert (work/path).is_file() and not (work/path).is_symlink(),path
saved=root/'retained-runtime.json';save(saved,retained)
x={'kind':'b09_same_setup_fresh_testing_uat_activation','status':'ROOT_SELECTED_PREPARATION_ONLY','sourceCommit':'927b8c0b84915ea2c926115902c2ceeef6df26a3','sourceBasis':'none','productWriteRoots':[],
 'workload':pin(root/'workload.json'),'setupResume':pin(saved),'freshSetupResume':selection['initialSetupResume'],'actualB08Return':rows,'initialEventLog':{**pin(event),'coordinateDigest':prefix['coordinateDigest']},
 'executingArtifactSha256':sha(Path(retained['native']['request']['artifactPath'])),'executingManifestDigest':retained['native']['request']['expectedManifestDigest'],'methodManifestSha256':sha(Path(retained['installedRoot'])/'contracts/default-library/stdo/manifest.json'),
 'sourceCustody':source['sourceCustody'],'failedB07':source['failedRunStatus'],'limits':['Fresh Run, not B08 recovery or acceptance','No prior Result or observation imported','Actual returned prefix is reused; physical history preserved']}
p=root/'ACTIVATE_B09.json';save(p,x);print(json.dumps(pin(p)))
