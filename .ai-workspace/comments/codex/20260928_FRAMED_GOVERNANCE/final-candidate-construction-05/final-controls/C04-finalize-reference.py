from pathlib import Path
import datetime,hashlib,json,stat,os,shutil
D=Path(__file__).resolve().parent.parent;G=D.parent;C=G/'final-candidate-construction-03';TR=Path('build_tenants/abiogenesis/typescript')
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
assert read(D/'activation.json')['activation']=='T287_RC1_SUCCESSOR_CONSTRUCTION_04' and not (D/'final-freeze.json').exists()
ops=[]
for name in read(D/'final-budgets.json')['operationCapsMs']:
 r=read(D/('final-'+name+'.json'));assert r['exitCode']==0 and not r['timedOut'] and r['ownedExitObserved'] and r['HOMEUnchanged'] and r['defaultHeapUnchanged'],name;ops.append(r)
assert len(ops)==10
source=read(D/'final-source-members.json');assert len(source)==1106 and sum(r['changedFromC03'] for r in source)==4
verify(D,read(D/'final-source-freeze-manifest.json')['members']);verify(D,read(D/'toolchain-pins.json')['records'])
for r in source:
 p=Path(r['origin']);assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'] and stat.S_IMODE(p.stat().st_mode)==r['mode'],str(p)
 if not r['path'].startswith(str(TR)+'/contracts/qualification/'):
  p=D/'final-stage'/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'] and stat.S_IMODE(p.stat().st_mode)==r['mode'],str(p)
for r in read(D/'final-generated-after.json'):
 p=D/'final-stage'/TR/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
for r in read(D/'dependency-pins.json')['members']:
 verify(D,[r['preparedArchive'],r['preparedCacheContent']]);assert sha(Path(r['originalCachePath']))==r['sha256']
identity=read(D/'final-package-identity.json');assert 'sha256:'+sha(Path(identity['artifactPath']))==identity['artifactDigest'];assert identity['archiveMembers']==5258
for r in read(D/'final-archive-members.json'):
 for root in [D/'final-stage'/TR,Path(identity['packageRoot'])]:
  p=root/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
# Preserve every referenced CLOSED source/caller/preparation/Run body in place; no store copies.
preserved=[]
for r in read(D/'final-preserved-input-freezes.json'):
 p=Path(r['path']);assert sha(p)==r['sha256'];j=read(p);verify(p.parent,j['records']);preserved.append({**r,'reverifiedAtClose':True})
prep=read(G/'qualification-command-preparation-01/freeze.json');oldQ=prep['originalQ04'];p=Path(oldQ['path']);assert sha(p)==oldQ['sha256'];j=read(p);verify(p.parent,j['records']);preserved.append({'name':'OriginalQ04','path':str(p),'sha256':sha(p),'recordsVerified':len(j['records']),'reverifiedAtClose':True})
save('final-preservation-verification.json',{'status':'verified','immutableSubjects':preserved,'sourceOriginsVerified':len(source),'sixteenOriginalArchiveCacheBodiesVerified':True,'oldStores':'Referenced complete Runtime03 and original Q04 closed record bodies reverified in place; no old store copied or mutated','sourceOrAmbientMutation':False})
# Separate complete input, generated/staged, and physically installed populations.
for name,root in [('final-source-population.json',D/'final-source'),('final-law-population.json',D/'final-law'),('final-stage-population.json',D/'final-stage'),('final-stage-dependency-population.json',D/'final-stage'/TR/'node_modules'),('final-install-population.json',D/'final-install'),('final-toolchain-population.json',D/'source-freeze/toolchain'),('final-cache-population.json',D/'final-npm-cache')]:save(name,inventory(root))
selected=read(D/'final-selected-core.json');generated=read(D/'final-generated-summary.json');pub=read(D/'final-installed-publication-results.json');wrapper=read(D/'final-required-wrapper-rows.json')
assert pub['status']=='passed' and len(pub['rows'])==11 and wrapper['status']=='REQUIRED_WRAPPER_ROWS_COMPATIBLE' and wrapper['intrinsicWrapperRepackRequired']==False
assert generated['sourceInputsPreserved']==1106 and generated['generatedMembers']==926 and generated['generatedChangedFromC03']==3 and generated['derivedAuthorityInputsChanged']==12
manifest=read(Path(selected['packageRoot'])/'product-toolchain-manifest.json');verification=read(D/'final-product-verification-summary.json')
assert verification['basis']==selected['basis']
cost={'preparationMs':read(D/'final-preparation-result.json')['elapsedMs'],'operationMs':sum(r['elapsedMs'] for r in ops),'operations':[{k:r[k] for k in ['command','elapsedMs','exitCode','timedOut','childUserCPUSeconds','childSystemCPUSeconds','childMaxResidentSetSizePlatformBytes']} for r in ops],'generatedCorrespondenceMs':generated['elapsedMs'],'packageCorrespondenceMs':read(D/'final-package-correspondence.json')['elapsedMs'],'retainedComparisonAttempt':'first complete mechanical comparison passed its assertions, then receipt filename collision caused supervisor exit1; exact elapsed receipt unavailable, not invented. Final distinct-path comparison command is included above. No pack/install repeated.','defaultHeapUnchanged':True,'allFinalOwnedExitObserved':True,'donorC03NineIntervalMs':41271,'basis':'actual finite subprocess intervals; reasoning/report assembly and retained first-comparison timing uncertainty are separate','sourceTestsRepeated':0,'nativeModelProviderNetworkRuntimeStoreGitEffects':0}
save('final-costs.json',cost)
shutil.copy2(C/'final-source-members.json',D/'C03-source-attribution-reference.json')
save('final-attribution.json',{'sourceCutAuthor':read(D/'controls/source-cut.json')['sourceCutAuthor'],'sourceCutSHA256':sha(D/'controls/source-cut.json'),'originalSources':'every exact1106 source row retains sourceAuthor/origin/selectedRelation; C03 original attribution chain is separately retained','acceptedNativeSourceAuthor':'/root/native_applicability_design under separately CLOSED Source Worker T287_NATIVE_DECLARATION_APPLICABILITY_SOURCE_01','nativeSourceFreezeSHA256':'fe58a7afafa96fcfe091e69b479983b286efc0dece820eac495039e81d501d89','trackingSnapshotAuthor':'Root Writer tracking, bound exactly before construction','builderReportActor':'/root/native_applicability_design under separate Worker T287_RC1_SUCCESSOR_CONSTRUCTION_04','derivedOutputOwners':'existing clean/TypeScript/qualification assets/Product manifest builders; copy/build authorship does not replace source/code semantic authorship','sourceRepair':False,'ambientGeneratedMutation':False,'qualificationActorIndependence':'future assessment must bind actual source authors and assessors; separate builder role alone does not establish independence'})
save('final-closure.json',{'status':'CLOSED','workResult':'construction_ready_for_independent_review','activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_04','actor':'/root/native_applicability_design','role':'Worker','closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'onlyWriteTerritory':str(D),'sourceRepair':False,'pack':1,'physicalOfflineInstall':1,'ordinaryProductInstall':False,'runtime':False,'qualification':False,'reviewerActivated':False,'noFurtherWrites':True})
text=f'''# CLOSED C04 construction Worker return

Worker T287_RC1_SUCCESSOR_CONSTRUCTION_04 returns one exact prospective `pre_rc_candidate`, mechanically ready for independent conjunction. Product Frame is fixed15/GOAL035/T287/STDO2.5.1RC2, F01/F05/F13/F11/F15/F16; selected end-to-end interface integration frame composes Identity/Install/Reuse/NativeDefinition/Proof/Cost. GTL declares, HoG traverses, owners effect, ABG admits and replay projects. This build proves no qualified/published/ABG-installed result.

The exact source selection is 1,106 immutable C03 inputs with four replacements: three independently accepted Native applicability postimages and one exact Root tracking snapshot. Frozen source manifest SHA256 `{sha(D/'final-source-freeze-manifest.json')}`; source-cut SHA256 `{sha(D/'controls/source-cut.json')}`. Every original source author, origin and prior source relation is retained; construction attribution does not replace code authorship. No moving canonical source was sampled or repaired.

Operative Definition SHA256 is `eafbb85e640bd007b1e5b94bdc13ab4eb470c8dedaa3ae1a3b586687daf6869c`; complete immutable RC2 manifest is `3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782`, all52 member aggregate `2f54671dfde54a6ad87347ac7190028af5e21021988247edf8068ab6248ef7e8`. The declared default-library RC1 runtime substrate stays selected. Frozen C03 Node24.7/npm11.5.1, compiler5.9.2, all2,328 tool members, host-library observations and sixteen exact locked archives were verified. Every cache/config/prefix/temp/output is confined here and HOME is unchanged.

Offline script-disabled dependency installation, existing clean/compile, explicit authority staging from exact C04 final-source and verified immutable RC2, existing manifest generation, one pack and one offline physical install pass. Actual derived/generated outputs total926, including96 authority source/input copies; twelve historical input aliases are correctly rederived stage outputs while frozen source inputs remain. Every95 governing source/body join and all2,137 rule spans match; coverage is16 claims/66 behaviors. Actual output cone versus C03 is exactly three paths: declaration_exports.js, capability-definition-graph.json and product-toolchain-manifest.json. All other generated outputs are conserved; source changes are exactly four.

Artifact: `{identity['artifactPath']}`
Archive digest: `{identity['artifactDigest']}`; {identity['archiveBytes']:,} bytes.
Physical package: `{identity['packageRoot']}`.
Product content: `{selected['basis']['productContentDigest']}`.
Canonical manifest: `{selected['basis']['manifestDigest']}`.
Public catalog: `{verification['catalogDigest']}`.
All5,258 actual package members join byte-exactly across stage/archive/install with no missing or surplus payload. Complete source, law, stage/dependency, toolchain/cache and physical-install inventories remain distinct and frozen.

Actual installed ProductVerificationPort.verify succeeds; same-process selectOwnedProductVerification returns that same nominal artifact. Installed/staged current run_gaps definition and binding identities agree. All11 actual installed publication constructors, derived from the exact generator population, pass raw/static validation and equal the installed owner's publication bindings. Retained JSON is evidence, not new nominal authority or ABG admission.

The unchanged wrapper's actual packed declaration requires three contract IDs and two capability IDs under a content-unbound version/compatibility dependency. All three complete required contract rows and all308 required body members equal actual PACKAGED C03. All37 full native contract rows are conserved. The entire16-row capability graph reproduces the packaged C03 graph through the unchanged existing constructor and reproduces the actual C04 graph after rebinding only owning contract Product-content coordinates; every definition/dependency digest is rederived, and complete before/after required rows are retained. This establishes bounded mechanical wrapper compatibility and no intrinsic repack requirement. It does not prove new Public singleton/mixed locks or skip any Product rows.

A first comparison report attempt passed its assertions but used the same filename for child outcome and supervisor receipt. The exact attempt and report-ownership triangulation are preserved. Distinct output/receipt paths and only that bounded comparison were rechecked; the final actual receipt passes. No source/build/pack/install was repeated. Ten successful owned subprocess intervals total {cost['operationMs']/1000:.3f}s, plus {cost['preparationMs']/1000:.3f}s preparation and separately recorded correspondence. The first report attempt lacks its final elapsed receipt; no value is invented. Default heap is unchanged and all owned children are reaped.

C03/source/caller/preparation/Runtime03/originalQ04 closed freezes and bodies were freshly reverified in place. Sixteen original cache bodies remain exact; large old stores were not copied or mutated. No source/dependency/ambient/Git/network/provider/Runtime effect, source38+11 test repeat, Hello rerun or accepted evidence restamping occurs.

Root alone independently conjoins this CLOSED candidate, then activates successor-bound Q05 and actual singleton/mixed Public locks/ordinary install/bind/catalog/F11 child/physical append/J/foldback/parentRun/two cold reads/fresh F11/soleAF22. Actual semantic F11, observed QUAL056, green AF22, immutable publication, installed_rc qualification, human acceptance and terminal install remain unknown; network prerequisite is false. This Worker stops all writes and activates no Reviewer.
'''
with (D/'final-return.md').open('x') as f:f.write(text)
# Freeze all evidence records. Large populations are reached through complete exact inventories,
# themselves frozen records; no generated data is confused with source inputs.
excluded=('final-source/','final-stage/','final-law/','final-install/','source-freeze/','final-npm-cache/','final-npm-prefix/','final-tmp/')
records=[]
for p in sorted(D.rglob('*')):
 rel=str(p.relative_to(D))
 if (p.is_file() or p.is_symlink()) and not rel.startswith(excluded):records.append(pin(p,rel))
freeze={'status':'CLOSED','workResult':'construction_ready_for_independent_review','activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_04','actor':'/root/native_applicability_design','role':'Worker','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'return':'final-return.md','closure':'final-closure.json','sourceFreeze':{'path':'final-source-freeze-manifest.json','sha256':sha(D/'final-source-freeze-manifest.json')},'sourceCut':{'path':'controls/source-cut.json','sha256':sha(D/'controls/source-cut.json')},'records':records,'recordCount':len(records),'recordBytes':sum(r.get('bytes',0) for r in records),'completeSourceMembers':1106,'sourceChangedFromC03':4,'actualGenerated':generated,'package':identity,'selected':selected,'basis':read(D/'final-law-verification.json'),'publicationCount':11,'wrapperCompatibility':'final-required-wrapper-rows.json','completePopulations':{'source':'final-source-population.json','law':'final-law-population.json','stage':'final-stage-population.json','stageDependencies':'final-stage-dependency-population.json','physicalInstall':'final-install-population.json','toolchain':'final-toolchain-population.json','cache':'final-cache-population.json','archivePayload':'final-archive-members.json'},'correspondence':'final-package-correspondence.json','preserved':'final-preservation-verification.json','readiness':{'physicalInstalledOwnerVerification':True,'sameProcessNominalSelection':True,'complete11StaticPublications':True,'fullRequiredWrapperContractCapabilityCompatibility':True,'actualSingletonMixedPublicLocks':False,'ordinaryRuntime':False,'qualification':False,'publication':False},'effects':{'sourceRepair':0,'ambientGenerated':0,'lockedDependenciesOffline':1,'compile':1,'explicitRC2AuthorityStage':1,'ProductManifest':1,'pack':1,'physicalOfflineInstall':1,'metadataComparisonReproof':1,'sourceTestsRepeated':0,'nativeProviderNetworkRuntimeStoreGit':0},'costs':'final-costs.json','attribution':'final-attribution.json','sourceOrCandidateAccepted':False,'stop':'all Worker writes CLOSED; Root independently conjoins before distinct Runtime/Q05 activations'}
save('final-freeze.json',freeze);verify(D,records)
for name in freeze['completePopulations'].values():
 if name=='final-archive-members.json':continue
 verify(D,read(D/name))
print(json.dumps({'status':'CLOSED','freeze':str(D/'final-freeze.json'),'freezeSHA256':sha(D/'final-freeze.json'),'recordCount':len(records),'recordBytes':freeze['recordBytes'],'sourceFreezeSHA256':sha(D/'final-source-freeze-manifest.json'),'archiveDigest':identity['artifactDigest'],'productContentDigest':selected['basis']['productContentDigest'],'manifestDigest':selected['basis']['manifestDigest'],'allReadbacksMatched':True},indent=2),flush=True)
