from pathlib import Path
import datetime,hashlib,json,stat,os,shutil
D=Path(__file__).resolve().parent.parent;G=D.parent;C=G/'final-candidate-construction-04';TR=Path('build_tenants/abiogenesis/typescript')
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
assert read(D/'activation.json')['activation']=='T287_RC1_SUCCESSOR_CONSTRUCTION_05' and not (D/'final-freeze.json').exists()
ops=[]
for name in read(D/'final-budgets.json')['operationCapsMs']:
 r=read(D/('final-'+name+'.json'));assert r['exitCode']==0 and not r['timedOut'] and r['ownedExitObserved'] and r['HOMEUnchanged'] and r['defaultHeapUnchanged'],name;ops.append(r)
assert len(ops)==10
source=read(D/'final-source-members.json');assert len(source)==1106 and sum(r['changedFromC04'] for r in source)==2
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
assert generated['sourceInputsPreserved']==1106 and generated['generatedMembers']==926 and generated['generatedChangedFromC04']==3 and generated['derivedAuthorityInputsChanged']==12
manifest=read(Path(selected['packageRoot'])/'product-toolchain-manifest.json');verification=read(D/'final-product-verification-summary.json')
assert verification['basis']==selected['basis']
cost={'preparationMs':read(D/'final-preparation-result.json')['elapsedMs'],'operationMs':sum(r['elapsedMs'] for r in ops),'operations':[{k:r[k] for k in ['command','elapsedMs','exitCode','timedOut','childUserCPUSeconds','childSystemCPUSeconds','childMaxResidentSetSizePlatformBytes']} for r in ops],'generatedCorrespondenceMs':generated['elapsedMs'],'packageCorrespondenceMs':read(D/'final-package-correspondence.json')['elapsedMs'],'retainedComparisonAttempt':'C05 uses one distinct-path comparison; original C04 failed control attempt remains preserved, no repeat pack/install','defaultHeapUnchanged':True,'allFinalOwnedExitObserved':True,'donorC03NineIntervalMs':41271,'basis':'actual finite subprocess intervals; reasoning/report assembly and retained first-comparison timing uncertainty are separate','sourceTestsRepeated':0,'nativeModelProviderNetworkRuntimeStoreGitEffects':0}
save('final-costs.json',cost)
shutil.copy2(C/'final-source-members.json',D/'C04-source-attribution-reference.json')
cut=read(D/'controls/source-cut.json');by_path={r['path']:r for r in source}
for row in cut['members']:
 actual=by_path[row['path']]
 assert actual['originalSource']==row['originalSource'] and actual['originalAuthorship']==row['originalAuthorship']
 assert actual['sourceAuthor']==row['sourceAuthor'] and actual['C04SourceProvenance']==row['C04SourceProvenance']
save('final-attribution.json',{'sourceCutAuthor':cut['sourceCutAuthor'],'sourceCutSHA256':sha(D/'controls/source-cut.json'),'originalSources':'all1106 exact originalSource/originalAuthorship/sourceAuthor/C04SourceProvenance relations preserved, including original C03/native author chain','sourceChangesFromC04':2,'acceptedInstallerSourceAuthor':'/root/native_applicability_design under T287_INSTALL_BIN_POLICY_SOURCE_01','acceptedSourceFreezeSHA256':cut['acceptedSourceFreezeSha256'],'trackingSnapshotAuthor':'Root Writer tracking','builderReportActor':'/root/native_applicability_design under separately activated T287_RC1_SUCCESSOR_CONSTRUCTION_05','C04SourceAttributionReference':'C04-source-attribution-reference.json','sourceRepair':False,'qualificationActorIndependence':'future assessor must bind actual original source authors; builder role does not confer independence'})
groups=[]
for op in ops:
 try:os.killpg(op['pid'],0);state='present'
 except ProcessLookupError:state='absent'
 except PermissionError:state='unobservable_permission'
 groups.append({'pid':op['pid'],'ownedProcessGroup':op['pid'],'afterOwnedWait':state})
assert all(r['afterOwnedWait']=='absent' for r in groups),groups
save('final-process-closure.json',{'status':'CLOSED','knownOperationGroups':groups,'actualMainOwnedExitObserved':True,'unknownChildren':'individual npm descendants not PID-enumerated; declared owner/tool awaits child completion and all known groups are absent'})
save('final-closure.json',{'status':'CLOSED','workResult':'construction_ready_for_independent_review','activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_05','actor':'/root/native_applicability_design','role':'Worker','closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'onlyWriteTerritory':str(D),'sourceRepair':False,'pack':1,'physicalOfflineInstall':1,'ordinaryProductInstall':False,'runtime':False,'qualification':False,'reviewerActivated':False,'noFurtherWrites':True})
text=f'''CLOSED C05 construction Worker T287_RC1_SUCCESSOR_CONSTRUCTION_05 returns one exact prospective pre_rc_candidate. Fixed15/GOAL035/T287/STDO2.5.1RC2; end-to-end interface integration composes Product/Identity/Install/Reuse/NativeDefinition/Effects/Proof/Cost. This is construction readiness, not qualification, publication or ABG installation.

All 1,106 immutable C04 inputs were copied with exactly two replacements: independently accepted installer source postimage 2a59298e and exact Root tracking snapshot. All original source authors, origins and the full C04/C03/native provenance chain remain in final-source-members.json and final-attribution.json. Source-cut SHA256 {sha(D/'controls/source-cut.json')}; source-freeze SHA256 {sha(D/'final-source-freeze-manifest.json')}. No moving source or source repair.

Complete exact RC2 manifest3d860ff4/all52members aggregate2f54671d and Definitioneafbb85e verify; declared default-library RC1 substrate remains. Frozen C03 Node24.7/npm11.5.1/compiler5.9.2, 2,328 tool members and all16 locked offline archives remain. Current C04 derived bodies supply only the two required schema seeds. Explicit authority generation uses exact C05 final-source plus immutable RC2; historical input aliases remain source while current authority outputs are regenerated.

Offline dependencies, clean, compile, explicit RC2 stage, manifest, one pack and one physical offline install pass. Measured outputs {generated['generatedMembers']}, changed from C04 {generated['generatedChangedFromC04']}; exact cone is install_product.js, capability-definition-graph.json and product-toolchain-manifest.json. All other generated outputs, declaration/public/native bodies remain exact. All {generated['actualAuthorityJoins']} authority joins/{generated['rules']} rule spans are exact; {generated['coverageClaims']} claims/{generated['coverageBehaviors']} behaviors retained. No historical/source/Hello test campaign was repeated.

Archive: {identity['artifactPath']}
Archive digest: {identity['artifactDigest']}; {identity['archiveBytes']} bytes, {identity['archiveMembers']} members.
Physical package: {identity['packageRoot']}
Product content: {selected['basis']['productContentDigest']}
Canonical manifest: {selected['basis']['manifestDigest']}
Public catalog: {verification['catalogDigest']}
Every archive member joins stage and physical package byte-exactly with complete source/law/stage/tool/cache/install populations retained. Actual installed ProductVerificationPort.verify succeeds and same-process selectOwnedProductVerification returns the same object. All11 actual publication constructors pass raw/static validity and complete actual publication-binding equality.

Actual PACKAGED C04 supplies the compatibility baseline. The unchanged regular USTAR wrapper943dd228/fixture3362ff72 retains the historical pure C03 guard supplier without relabeling. Its content-unbound required dependency retains all3 complete contract rows/308 packaged bodies and all37 full native rows. The unchanged existing constructor reproduces the complete C04 capability graph and the complete C05 graph after only the sole new owning Product-content coordinate is rebound; all16 rows/196 original owning coordinates and every definition/dependency digest are retained/rederived. Full before/after required capability rows remain. No intrinsic wrapper repack; actual C05 Public singleton/mixed locks and ordinary owners remain subsequent Runtime work.

Ten actual managed command intervals total {cost['operationMs']/1000:.3f}s; preparation {cost['preparationMs']/1000:.3f}s and correspondences recorded separately. Default heap/HOME unchanged; no timeout; every known command is waited and every known group is absent. Individual npm descendant PIDs remain unenumerated. Distinct comparison outcome and receipt names were used once. Complete prior source/caller/prep/C04/setup04/old stores are reverified in place, not copied or restamped.

No ProductEnvironment/Public resolve/install/bind/catalog/Run/J/helper/provider/network/Git/publication effect. All Worker writes CLOSED. Root independently conjoins C05, then selects successor-bound Q06 and actual Runtime. Original C04/Q05 identities and accepted/failed evidence remain. F11/QUAL056/sole AF22/immutable publication/installed_rc/human acceptance/terminal install remain unknown.
'''
with (D/'final-return.md').open('x') as f:f.write(text)
# Freeze all evidence records. Large populations are reached through complete exact inventories,
# themselves frozen records; no generated data is confused with source inputs.
excluded=('final-source/','final-stage/','final-law/','final-install/','source-freeze/','final-npm-cache/','final-npm-prefix/','final-tmp/')
records=[]
for p in sorted(D.rglob('*')):
 rel=str(p.relative_to(D))
 if (p.is_file() or p.is_symlink()) and not rel.startswith(excluded):records.append(pin(p,rel))
freeze={'status':'CLOSED','workResult':'construction_ready_for_independent_review','activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_05','actor':'/root/native_applicability_design','role':'Worker','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'return':'final-return.md','closure':'final-closure.json','sourceFreeze':{'path':'final-source-freeze-manifest.json','sha256':sha(D/'final-source-freeze-manifest.json')},'sourceCut':{'path':'controls/source-cut.json','sha256':sha(D/'controls/source-cut.json')},'records':records,'recordCount':len(records),'recordBytes':sum(r.get('bytes',0) for r in records),'completeSourceMembers':1106,'sourceChangedFromC04':2,'actualGenerated':generated,'package':identity,'selected':selected,'basis':read(D/'final-law-verification.json'),'publicationCount':11,'wrapperCompatibility':'final-required-wrapper-rows.json','completePopulations':{'source':'final-source-population.json','law':'final-law-population.json','stage':'final-stage-population.json','stageDependencies':'final-stage-dependency-population.json','physicalInstall':'final-install-population.json','toolchain':'final-toolchain-population.json','cache':'final-cache-population.json','archivePayload':'final-archive-members.json'},'correspondence':'final-package-correspondence.json','preserved':'final-preservation-verification.json','readiness':{'physicalInstalledOwnerVerification':True,'sameProcessNominalSelection':True,'complete11StaticPublications':True,'fullRequiredWrapperContractCapabilityCompatibility':True,'actualSingletonMixedPublicLocks':False,'ordinaryRuntime':False,'qualification':False,'publication':False},'effects':{'sourceRepair':0,'ambientGenerated':0,'lockedDependenciesOffline':1,'compile':1,'explicitRC2AuthorityStage':1,'ProductManifest':1,'pack':1,'physicalOfflineInstall':1,'metadataComparison':1,'sourceTestsRepeated':0,'nativeProviderNetworkRuntimeStoreGit':0},'costs':'final-costs.json','attribution':'final-attribution.json','sourceOrCandidateAccepted':False,'stop':'all Worker writes CLOSED; Root independently conjoins before distinct Runtime/Q06 activations'}
save('final-freeze.json',freeze);verify(D,records)
for name in freeze['completePopulations'].values():
 if name=='final-archive-members.json':continue
 verify(D,read(D/name))
print(json.dumps({'status':'CLOSED','freeze':str(D/'final-freeze.json'),'freezeSHA256':sha(D/'final-freeze.json'),'recordCount':len(records),'recordBytes':freeze['recordBytes'],'sourceFreezeSHA256':sha(D/'final-source-freeze-manifest.json'),'archiveDigest':identity['artifactDigest'],'productContentDigest':selected['basis']['productContentDigest'],'manifestDigest':selected['basis']['manifestDigest'],'allReadbacksMatched':True},indent=2),flush=True)
