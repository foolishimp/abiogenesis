#!/usr/bin/env python3
"""Bind Root-selected fresh setup to completed B05 and actual local bytes; no ABG calls."""
from pathlib import Path
from decimal import Decimal
import hashlib,json,os,subprocess
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');dest=base/'increment-b-06';work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood');attempt=base/'attempt-007';sha=lambda p:hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
def coordinate(p):return {'path':str(p),'sha256':'sha256:'+sha(p)}
def write(name,value):
 b=(json.dumps(value,indent=2,sort_keys=True)+'\n').encode()
 with (dest/name).open('xb') as f:f.write(b)
 return 'sha256:'+hashlib.sha256(b).hexdigest()
assert not (base/'setup-002').exists(),'fresh setup root already exists'
summary=json.loads((attempt/'outcome-summary.json').read_bytes());execution=json.loads((attempt/'execution.json').read_bytes());handoff=json.loads((attempt/'after-run-resume.json').read_bytes());started=json.loads((attempt/'STARTED.json').read_bytes());reads=json.loads((attempt/'fresh-reads.json').read_bytes())
assert summary['outcomeKind']=='result' and summary['disposition']=='blocked' and summary['terminal'] is None and execution['receipt']['ownerOutput']['outcomeKind']=='result' and execution['receipt']['ownerOutput']['value']['disposition']=='blocked'
assert [r['memberKey'] for r in reads]==['run_result','run_replay'] and reads[0]['ownerOutput']['outcomeKind']=='refusal' and reads[1]['ownerOutput']['outcomeKind']=='result'
try:os.kill(started['pid'],0)
except ProcessLookupError:pass
else:raise RuntimeError('previous Root dispatcher still exists or pid was reused')
prefix=handoff['state']['closeHandoff']['prefix']
for name in ('run_result','run_replay'):assert json.loads((attempt/'calls'/f'{name}.close.json').read_bytes())['prefix']==prefix
source=attempt/'B05_PARTIAL_CUSTODY.json';custody=json.loads(source.read_bytes());grant=json.loads((base/'increment-b-01/grant.json').read_bytes());exact=grant['existingPaths']+grant['newPaths'];assert custody['baseCommit']=='927b8c0b84915ea2c926115902c2ceeef6df26a3' and len(custody['rows'])==len(exact)==23 and sorted(r['path'] for r in custody['rows'])==sorted(exact)
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=work,text=True).strip()==custody['baseCommit'];status=subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','-z','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],cwd=work,text=True).split('\0');changes=sorted(s[3:] for s in status if s);assert len(changes)==14 and changes==sorted(r['path'] for r in custody['rows'] if r['gitStatus']!='  ')
for r in custody['rows']:
 p=work/r['path'];assert p.is_file() and not p.is_symlink() and p.resolve()==p and p.stat().st_size==r['current']['bytes'] and sha(p)==r['current']['sha256']
manifest=work/'.abiogenesis/workspace-manifest.json';wm=json.loads(manifest.read_bytes());basis=handoff['workspaceAuthority'];assert basis['workspaceId']==wm['workspaceRef'] and basis['canonicalRoot']==wm['canonicalRoot']==str(work) and basis['authorizedActorRef']=='actor://abiogenesis/operator/codex-root'
assert sha(work/'stdo_abiogenesis.json')=='6d4caf2b6c6dd4c6e6386aba751e0967749103f2d19d96dfba36eaa68f8f7d28'
activation=base/'runtime-activation-001';install=json.loads((activation/'installation.json').read_bytes());verify=json.loads((activation/'payload-correspondence.json').read_bytes());root=Path(verify['installedRoot']);assert root.resolve()==root and root==Path(install['installedRoot']) and verify['members']==len(verify['inventory'])==5315
for row in verify['inventory']:
 p=root/row['path'];assert p.is_file() and not p.is_symlink() and p.resolve()==p and p.stat().st_size==row['bytes'] and 'sha256:'+sha(p)==row['digest'],row['path']
archive=Path('/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.2/abiogenesis-typescript-tenant-5.0.0-rc.2.tgz');assert sha(archive)=='36e02dd927066db2f64d71446334982d65b9b8b4ab1c7666d83d04c530aca528'
assert sha(root/'contracts/default-library/stdo/manifest.json')=='f7f3f824ee1ac3e048d1b1ea86ce3aae84866e2e9d5010fe5eda2e38e12f4477'
usage=json.loads(subprocess.check_output(['/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12','-B',str(attempt/'monitor-budget.py')]))
assert abs(Decimal(usage['allReportedNativeTotalUsd'])-Decimal('80.3403848'))<Decimal('0.000001') and abs(Decimal(usage['effectiveConservativeTotalUsd'])-Decimal('88.3403848'))<Decimal('0.000001') and not usage['activeOrAmbiguousNewStreams'] and not usage['otherUnresolvedStreams']
probe=Path('/private/tmp/gc03-b05-diagnostic-grksxzbi')
expected={'diagnostic-result.json':'b7bf7e91b732551d28f6c3652ef20174833c5b88de4733537477882818f5366f','gc03-policy.json':'ecd9946b162bf5696c227bf55ec840de1b3ed137f31c9c6e1af8fcc742bb28dd'}
probe_bytes={}
for name,want in expected.items():
 data=(probe/name).read_bytes();assert hashlib.sha256(data).hexdigest()==want;probe_bytes[name]=data
pre={'kind':'b06_fresh_setup_readonly_preselection_custody','status':'actual bytes checked; no native setup or new Run','previousRun':summary['run'],'previousDisposition':summary['disposition'],'previousDispatcherPid':started['pid'],'previousDispatcherAbsent':True,'previousPrefix':prefix,'readbackCloseCoordinatesMatched':True,'sourceCustody':coordinate(source),'sourcePathsChecked':23,'changedPaths':14,'workspaceManifest':coordinate(manifest),'workspaceRef':wm['workspaceRef'],'manifestAuthority':{'ref':wm['authorityBasis']['authorityRef'],'digest':wm['authorityBasis']['authorityDigest']},'liveWorkspaceBasis':{'ref':basis['authorityBasisId'],'digest':basis['authorityBasisDigest']},'builderArchive':coordinate(archive),'builderInventoryReceipt':coordinate(activation/'payload-correspondence.json'),'builderPayloadFilesChecked':5315,'usageReportedUsd':usage['allReportedNativeTotalUsd'],'unknownB03ReserveUsd':'8','conservativeUsd':usage['effectiveConservativeTotalUsd'],'limits':['No old event-log rescan, native admission, provider call, new store or Result','B05 blocked remains historical; fresh store inherits no native Results']}
prehash=write('SETUP_PRESELECTION_CUSTODY.json',pre)
decision={'kind':'b06_fresh_store_executive_selection','status':'SELECTED','executive':'/root','ownerInstruction':'review, fix, and continue on using rc2 being used to build rc3','interpretation':'Root selected bounded local fresh RC2 store against the same canonical worksite after B05 closure; not native admission, external release or inherited Result','sourceCommit':custody['baseCommit'],'recursionBound':3,'providerDispatch':False,'preselectionCustodySha256':prehash,'budget':{'reportedNativeTotalUsd':'80.3403848','unknownB03ReserveUsd':'8','effectiveConservativeUsd':'88.3403848','perProcessUsd':'2.50','maximumPaidProcesses':3,'maximumB06Usd':'7.50','reviewCheckpointsUsd':['90','94'],'preWitnessStopUsd':'96','witnessReserveUsd':'4','userAllocationUsd':'100','otherCharges':'unknown','automaticRetry':False},'limits':['This selects local model-free Public setup only; Root operates it','Separate actual prepared native call and Root dispatch remain future','No whole-Product qualification or release']}
dechash=write('FRESH_SETUP_SELECTION.json',decision)
previous={k:coordinate(attempt/v) for k,v in {'execution':'execution.json','afterRun':'after-run-resume.json','outcome':'outcome-summary.json','freshReads':'fresh-reads.json','started':'STARTED.json'}.items()}
selection={'kind':'b06_root_selected_fresh_setup_v1','status':'ROOT_SELECTED_FOR_B06_FRESH_SETUP','operatorDecision':{'path':str(dest/'FRESH_SETUP_SELECTION.json'),'sha256':dechash},'previous':previous,'sourceCustody':coordinate(source),'workspaceManifest':coordinate(manifest),'workspaceRef':wm['workspaceRef'],'expectedManifestAuthority':pre['manifestAuthority'],'selectedWorkspaceBasis':pre['liveWorkspaceBasis'],'authority':coordinate(base/'OPERATOR.md'),'builder':{'installationSha256':'sha256:'+sha(activation/'installation.json'),'summarySha256':'sha256:'+sha(activation/'activation-summary.json'),'payloadCorrespondenceSha256':'sha256:'+sha(activation/'payload-correspondence.json')}}
selectedhash=write('fresh-setup-input.json',selection)
probe_rows=[]
for name,data in probe_bytes.items():
 target=dest/('b05-probe-'+name)
 with target.open('xb') as f:f.write(data)
 probe_rows.append({'source':str(probe/name),'copy':str(target),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
probehash=write('PROBE_CUSTODY.json',{'kind':'b05_controlled_adapter_probe_custody','classification':'controlled synthetic diagnostic only; no native authority, admission or installed witness','rows':probe_rows})
print(json.dumps({'selectionPath':str(dest/'fresh-setup-input.json'),'selectionSha256':selectedhash,'decisionSha256':dechash,'preselectionSha256':prehash,'probeCustodySha256':probehash,'sourcePaths':23,'builderPayloadFiles':5315,'previousRun':summary['run'],'conservativeUsd':usage['effectiveConservativeTotalUsd']}))
