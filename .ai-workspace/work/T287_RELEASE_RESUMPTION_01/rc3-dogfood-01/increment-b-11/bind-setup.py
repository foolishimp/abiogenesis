#!/usr/bin/env python3
from pathlib import Path
import json,hashlib
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');inc=base/'increment-b-11';att=base/'attempt-013';setup=base/'setup-006'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
saved=setup/'operator-resume-material.json';r=json.loads(saved.read_text());assert r['config']['recursionBound']==4
summary=json.loads((setup/'summary.json').read_text());assert summary['status']=='fresh-store-setup-completed'
assert not list((setup/'resources/archives').glob('fp-*-stdout.log'))
prefix=r['state']['closeHandoff']['prefix'];from urllib.parse import urlparse,unquote
event=Path(unquote(urlparse(prefix['eventLogRef']).path));assert event.stat().st_size==prefix['prefixLength'] and 'sha256:'+sha(event)==prefix['prefixDigest']
custody=json.loads((inc/'SOURCE_AND_ELIGIBILITY.json').read_text());work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
for row in custody['candidateRows']:assert sha(work/row['path'])==row['current']['sha256']
w=json.loads((inc/'workload.json').read_text());assert w['workOrders']['construction']['writeRoots']==custody['ProductWriteRoots'];assert all(not o['writeRoots']for purpose,o in w['workOrders'].items()if purpose!='construction');assert len(w['testing']['commands'])==9
for path in w['testing']['selectedPaths']:assert (work/path).is_file() and not (work/path).is_symlink(),path
for row in [custody['stdo']['resolvedEntrypoint'],custody['stdo']['interpreter'],custody['stdo']['releaseManifest'],*custody['stdo']['toolchainModuleSources']]:assert sha(Path(row['path']))==row['sha256']
x={'kind':'b11_fresh_construction_testing_uat_activation','status':'ROOT_SELECTED_PREPARATION_ONLY','sourceCommit':'927b8c0b84915ea2c926115902c2ceeef6df26a3','sourceBasis':'none','productWriteRoots':custody['ProductWriteRoots'],
 'workload':pin(inc/'workload.json'),'setupResume':pin(saved),'freshSetupResume':pin(saved),'initialEventLog':{**pin(event),'coordinateDigest':prefix['coordinateDigest']},
 'executingArtifactSha256':sha(Path(r['native']['request']['artifactPath'])),'executingManifestDigest':r['native']['request']['expectedManifestDigest'],'methodManifestSha256':sha(Path(r['installedRoot'])/'contracts/default-library/stdo/manifest.json'),
 'sourceCustody':custody['sourceCustody'],'failedB07':custody['failedRunStatus'],'limits':['No Run or provider dispatched','No prior Result imported','Prior failure/history unchanged; B11 is a new3-path repair and native Return/C2/UAT remain pending']}
for row in w['sources']:
 if row['path'].startswith('rc3-operator-inputs/increment-b-11/'):assert 'sha256:'+sha(work/row['path'])==row['digest']
p=att/'ACTIVATE_B11.json'
with p.open('x') as f:json.dump(x,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'activationPath':str(p),'activationSha256':sha(p)}))
