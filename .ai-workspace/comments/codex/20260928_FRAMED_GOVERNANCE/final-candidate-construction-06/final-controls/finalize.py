from pathlib import Path
import datetime,hashlib,json,stat,os,shutil
D=Path(__file__).resolve().parent.parent;G=D.parent;C=G/'final-candidate-construction-05';TR=Path('build_tenants/abiogenesis/typescript')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text())
def save(name,value):
 with (D/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def pin(p,relative=None):
 if p.is_symlink():return {'path':relative or str(p),'kind':'symlink','target':os.readlink(p),'mode':stat.S_IMODE(p.lstat().st_mode)}
 return {'path':relative or str(p),'kind':'file','bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)}
def verify(root,rows):
 for r in rows:
  p=root/r['path']
  if r.get('kind')=='symlink':assert p.is_symlink() and os.readlink(p)==r['target'],str(p)
  else:assert p.is_file() and not p.is_symlink() and p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
  if 'mode' in r:assert stat.S_IMODE(p.lstat().st_mode)==r['mode'],str(p)
def inventory(root):
 return [pin(p,str(p.relative_to(D))) for p in sorted(root.rglob('*')) if p.is_file() or p.is_symlink()]
assert read(D/'activation.json')['activation']=='T287_RC1_SUCCESSOR_CONSTRUCTION_06' and not (D/'final-freeze.json').exists()
ops=[]
for name in read(D/'final-budgets.json')['operationCapsMs']:
 r=read(D/('final-'+name+'.json'));assert r['exitCode']==0 and not r['timedOut'] and r['ownedExitObserved'] and r['HOMEUnchanged'] and r['defaultHeapUnchanged'],name;ops.append(r)
assert len(ops)==10
source=read(D/'final-source-members.json');assert len(source)==1107 and sum(r['changedFromC05'] for r in source)==2 and sum(r['addedFromC05'] for r in source)==1
verify(D,read(D/'final-source-freeze-manifest.json')['members']);verify(D,read(D/'toolchain-pins.json')['records'])
for r in source:
 p=Path(r['origin']);assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'] and stat.S_IMODE(p.stat().st_mode)==r['mode'],str(p)
 if not r['path'].startswith(str(TR)+'/contracts/qualification/'):
  p=D/'final-stage'/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'] and stat.S_IMODE(p.stat().st_mode)==r['mode'],str(p)
for r in read(D/'final-generated-after.json'):
 p=D/'final-stage'/TR/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
for r in read(D/'dependency-pins.json')['members']:
 verify(D,[r['preparedArchive'],r['preparedCacheContent']]);assert sha(C/r['preparedCacheContent']['path'])==r['sha256']
identity=read(D/'final-package-identity.json');assert 'sha256:'+sha(Path(identity['artifactPath']))==identity['artifactDigest'];assert identity['archiveMembers']==len(read(D/'final-archive-members.json'))
for r in read(D/'final-archive-members.json'):
 for root in [D/'final-stage'/TR,Path(identity['packageRoot'])]:
  p=root/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
# Metadata pins and exact before/after physical store identities conserve prior accepted cuts without another history-body campaign.
preserved=[]
for r in read(D/'final-preserved-input-freezes.json'):
 p=Path(r['path']);assert sha(p)==r['sha256'];preserved.append({**r,'metadataReverifiedAtClose':True})
store_checks=[]
for prior in read(D/'final-protected-store-stat-pins.json'):
 p=Path(prior['path']);s=p.stat();now={'path':str(p),'bytes':s.st_size,'device':s.st_dev,'inode':s.st_ino,'mode':stat.S_IMODE(s.st_mode),'mtimeNs':s.st_mtime_ns};assert prior==now,(prior,now);store_checks.append({'before':prior,'after':now,'exactIdentityAndBytesCountUnchanged':True})
save('final-preservation-verification.json',{'status':'verified','immutableSubjects':preserved,'sourceOriginsVerified':len(source),'sixteenC05FrozenArchiveCacheBodiesVerified':True,'oldStores':store_checks,'oldPopulationAssurance':'accepted independent C05/source/caller/Q06/Runtime06 population assurance reused; no repeated historical body reproof/copies/restamps','sourceOrAmbientMutation':False})
# Separate complete input, generated/staged, and physically installed populations.
for name,root in [('final-source-population.json',D/'final-source'),('final-law-population.json',D/'final-law'),('final-stage-population.json',D/'final-stage'),('final-stage-dependency-population.json',D/'final-stage'/TR/'node_modules'),('final-install-population.json',D/'final-install'),('final-toolchain-population.json',D/'source-freeze/toolchain'),('final-cache-population.json',D/'final-npm-cache')]:save(name,inventory(root))
selected=read(D/'final-selected-core.json');generated=read(D/'final-generated-summary.json');pub=read(D/'final-installed-publication-results.json');wrapper=read(D/'final-required-wrapper-rows.json')
assert pub['status']=='passed' and len(pub['rows'])==11 and wrapper['status']=='REQUIRED_WRAPPER_ROWS_COMPATIBLE' and wrapper['intrinsicWrapperRepackRequired']==False
assert generated['sourceInputsPreserved']==1107
assert {r['path'] for r in read(D/'final-generated-delta.json')}=={'build/code/src/implementation/leaf_invocation_port.js','contracts/capabilities/capability-definition-graph.json','product-toolchain-manifest.json'}
manifest=read(Path(selected['packageRoot'])/'product-toolchain-manifest.json');verification=read(D/'final-product-verification-summary.json')
assert verification['basis']==selected['basis']
cost={'preparationMs':read(D/'final-preparation-result.json')['elapsedMs'],'operationMs':sum(r['elapsedMs'] for r in ops),'operations':[{k:r[k] for k in ['command','elapsedMs','exitCode','timedOut','childUserCPUSeconds','childSystemCPUSeconds','childMaxResidentSetSizePlatformBytes']} for r in ops],'generatedCorrespondenceMs':generated['elapsedMs'],'packageCorrespondenceMs':read(D/'final-package-correspondence.json')['elapsedMs'],'retainedComparisonAttempt':'C06 uses one distinct-path comparison; earlier failed control attempts remain preserved, no repeat pack/install','defaultHeapUnchanged':True,'allFinalOwnedExitObserved':True,'donorC05TenIntervalMs':40186,'donorC05PreparationMs':5171,'basis':'actual finite subprocess intervals; reasoning/report assembly and retained first-comparison timing uncertainty are separate','sourceTestsRepeated':0,'nativeModelProviderNetworkRuntimeStoreGitEffects':0}
save('final-costs.json',cost)
shutil.copy2(C/'final-source-members.json',D/'C05-source-attribution-reference.json')
cut=read(D/'controls/source-cut.json');by_path={r['path']:r for r in source}
for row in cut['members']:
 actual=by_path[row['path']]
 assert actual['originalSource']==row['originalSource'] and actual['originalAuthorship']==row['originalAuthorship']
 assert actual['sourceAuthor']==row['sourceAuthor']
 for key in ['C04SourceProvenance','C05SourceProvenance','preimage']:
  if key in row:assert actual[key]==row[key]
save('final-attribution.json',{'sourceCutAuthor':cut['sourceCutAuthor'],'sourceCutSHA256':sha(D/'controls/source-cut.json'),'originalSources':'all1107 exact originalSource/originalAuthorship/sourceAuthor and every existing C04/C05SourceProvenance relation retained; new test original ABSENT preimage retained','sourceChangesFromC05':2,'sourceAddedFromC05':1,'acceptedFPSourceAuthor':'/root/native_applicability_design under T287_F11_FP_PROOF_DELIVERY_REALIZATION_01','acceptedSourceFreezeSHA256':cut['acceptedSourceFreezeSha256'],'trackingSnapshotAuthor':'Root Writer tracking','builderReportActor':'/root/native_applicability_design under separately activated T287_RC1_SUCCESSOR_CONSTRUCTION_06','C05SourceAttributionReference':'C05-source-attribution-reference.json','sourceRepair':False,'qualificationActorIndependence':'future assessor binds actual original source authors; builder role does not confer independence'})

groups=[]
for op in ops:
 try:os.killpg(op['pid'],0);state='present'
 except ProcessLookupError:state='absent'
 except PermissionError:state='unobservable_permission'
 groups.append({'pid':op['pid'],'ownedProcessGroup':op['pid'],'afterOwnedWait':state})
assert all(r['afterOwnedWait']=='absent' for r in groups),groups
save('final-process-closure.json',{'status':'CLOSED','knownOperationGroups':groups,'actualMainOwnedExitObserved':True,'unknownChildren':'individual npm descendants not PID-enumerated; declared owner/tool awaits child completion and all known groups are absent'})
save('final-closure.json',{'status':'CLOSED','workResult':'construction_ready_for_independent_review','activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_06','actor':'/root/native_applicability_design','role':'Worker','closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'onlyWriteTerritory':str(D),'sourceRepair':False,'pack':1,'physicalOfflineInstall':1,'ordinaryProductInstall':False,'runtime':False,'qualification':False,'reviewerActivated':False,'noFurtherWrites':True})
text=f'''CLOSED C06 construction Worker T287_RC1_SUCCESSOR_CONSTRUCTION_06 returns one exact prospective pre_rc_candidate. Fixed15/GOAL035/T287/STDO2.5.1RC2; construction readiness is not qualification, publication or ABG installation.

All1107 exact selected bodies were copied:1104 unchanged C05 inputs, two replacements (accepted F_P proof-delivery source and Root tracking), and one new named regression test. Complete original author/origin/C04/C05 chains and the new test's ABSENT preimage remain in final-source-members.json/final-attribution.json. Source-cut SHA {sha(D/'controls/source-cut.json')}; source-freeze SHA {sha(D/'final-source-freeze-manifest.json')}. No moving Source or source repair. Actual owner-produced request remains distinct from cached Q06 as Root's acceptance records; no source change is inferred from that distinction.

Exact Definitioneafbb85e and immutable RC2 manifest3d860ff4/all52members aggregate2f54671d verify; existing default-library RC1 substrate remains. Actual frozen C05 Node24.7/npm11.5.1/TS5.9.2 and sixteen locked offline archives supply construction. Two current C05 schema bodies are separately classified derived seeds. Explicit RC2 generation uses exact C06 final-source plus immutable RC2; twelve historical input aliases remain frozen source while current authority outputs are regenerated.

One offline dependency arrangement, clean, compile, explicit RC2 stage, manifest, pack and physical offline bootstrap install passed. Measured {generated['generatedMembers']} generated outputs/{generated['generatedChangedFromC05']} changes from actual C05: leaf_invocation_port.js, capability-definition-graph.json and product-toolchain-manifest.json. All other emitted declaration/public/native bodies remain exact. All{generated['actualAuthorityJoins']} source/law joins/{generated['rules']} spans/{generated['coverageClaims']} claims/{generated['coverageBehaviors']} behaviors retained. No Source/Hello/history tests repeated.

Archive {identity['artifactPath']}
Archive digest {identity['artifactDigest']}; {identity['archiveBytes']}B/{identity['archiveMembers']} members.
Physical bootstrap package {identity['packageRoot']}
Product content {selected['basis']['productContentDigest']}
Canonical manifest {selected['basis']['manifestDigest']}
Public catalog {verification['catalogDigest']}
Every actual archive body joins stage and physical package exactly. Complete source/law/stage/dependency/tool/cache/archive/install inventories are retained. Actual installed ProductVerificationPort.verify and same-process nominal selectOwnedProductVerification pass; all11 actual publication constructors/static/full binding comparisons pass.

Actual PACKAGED C05 is the compatibility baseline. The unchanged regular USTAR wrapper943dd228/fixture3362ff72 preserves its historical pure C03 guard without relabeling. All3 required complete contract rows/308 packaged bodies and all37 native rows are conserved. The existing constructor reproduces the complete packaged C05 and actual C06 graphs after only owning Product-content rebinding; all16 rows/196 original owner coordinates and every definition/dependency digest are rederived. No wrapper repack, Public locks, binding/catalog, Run or setup occurred.

Ten pre-import managed command intervals total {cost['operationMs']/1000:.3f}s; preparation {cost['preparationMs']/1000:.3f}s and correspondence costs retained. Default heap/HOME unchanged, no timeout, every known group absent after owned wait. Individual npm descendants are unenumerated. Distinct comparison outcome/receipt paths used once. Immutable old cut metadata and exact old-store dev/inode/mode/mtime/byte-count identities rejoin; accepted full old population assurance is reused without repeated historical payload reproof or store copies.

All Worker writes CLOSED. Source/test/WHAT/HOW/Git/network/provider/Runtime/qualification/publication effects zero. Root independent construction review and separately granted actual C06 Public setup/Q07/whole wrapper-child/J/foldback/parent/RunClosed/six fresh reads/F11/sole non-green AF22 remain next. Q06 remains C05-only. F11/QUAL056/sole AF22/immutableRC/installed_rc/human ruling/terminal installation remain unproved.
'''
with (D/'final-return.md').open('x') as f:f.write(text)
# Freeze all evidence records. Large populations are reached through complete exact inventories,
# themselves frozen records; no generated data is confused with source inputs.
excluded=('final-source/','final-stage/','final-law/','final-install/','source-freeze/','final-npm-cache/','final-npm-prefix/','final-tmp/')
records=[]
for p in sorted(D.rglob('*')):
 rel=str(p.relative_to(D))
 if (p.is_file() or p.is_symlink()) and not rel.startswith(excluded):records.append(pin(p,rel))
freeze={'status':'CLOSED','workResult':'construction_ready_for_independent_review','activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_06','actor':'/root/native_applicability_design','role':'Worker','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'return':'final-return.md','closure':'final-closure.json','sourceFreeze':{'path':'final-source-freeze-manifest.json','sha256':sha(D/'final-source-freeze-manifest.json')},'sourceCut':{'path':'controls/source-cut.json','sha256':sha(D/'controls/source-cut.json')},'records':records,'recordCount':len(records),'recordBytes':sum(r.get('bytes',0) for r in records),'completeSourceMembers':1107,'sourceChangedFromC05':2,'sourceAddedFromC05':1,'actualGenerated':generated,'package':identity,'selected':selected,'basis':read(D/'final-law-verification.json'),'publicationCount':11,'wrapperCompatibility':'final-required-wrapper-rows.json','completePopulations':{'source':'final-source-population.json','law':'final-law-population.json','stage':'final-stage-population.json','stageDependencies':'final-stage-dependency-population.json','physicalInstall':'final-install-population.json','toolchain':'final-toolchain-population.json','cache':'final-cache-population.json','archivePayload':'final-archive-members.json'},'correspondence':'final-package-correspondence.json','preserved':'final-preservation-verification.json','readiness':{'physicalInstalledOwnerVerification':True,'sameProcessNominalSelection':True,'complete11StaticPublications':True,'fullRequiredWrapperContractCapabilityCompatibility':True,'actualSingletonMixedPublicLocks':False,'ordinaryRuntime':False,'qualification':False,'publication':False},'effects':{'sourceRepair':0,'ambientGenerated':0,'lockedDependenciesOffline':1,'compile':1,'explicitRC2AuthorityStage':1,'ProductManifest':1,'pack':1,'physicalOfflineInstall':1,'metadataComparison':1,'sourceTestsRepeated':0,'nativeProviderNetworkRuntimeStoreGit':0},'costs':'final-costs.json','attribution':'final-attribution.json','sourceOrCandidateAccepted':False,'stop':'all Worker writes CLOSED; Root independently conjoins before distinct Runtime/Q07 activations'}
save('final-freeze.json',freeze);verify(D,records)
for name in freeze['completePopulations'].values():
 if name=='final-archive-members.json':continue
 verify(D,read(D/name))
print(json.dumps({'status':'CLOSED','freeze':str(D/'final-freeze.json'),'freezeSHA256':sha(D/'final-freeze.json'),'recordCount':len(records),'recordBytes':freeze['recordBytes'],'sourceFreezeSHA256':sha(D/'final-source-freeze-manifest.json'),'archiveDigest':identity['artifactDigest'],'productContentDigest':selected['basis']['productContentDigest'],'manifestDigest':selected['basis']['manifestDigest'],'allReadbacksMatched':True},indent=2),flush=True)
