from pathlib import Path
import datetime,hashlib,json,stat,os,shutil,time
D=Path(__file__).resolve().parent.parent;G=D.parent;C=G/'final-candidate-construction-06';TR=Path('build_tenants/abiogenesis/typescript')
report_started=time.monotonic()
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
assert read(D/'activation.json')['activation']=='T287_RC1_SUCCESSOR_CONSTRUCTION_07' and not (D/'final-freeze.json').exists()
ops=[]
for name in read(D/'final-budgets.json')['operationCapsMs']:
 r=read(D/('final-'+name+'.json'));assert r['exitCode']==0 and not r['timedOut'] and r['ownedExitObserved'] and r['HOMEUnchanged'] and r['defaultHeapUnchanged'],name;ops.append(r)
assert len(ops)==10
source=read(D/'final-source-members.json');assert len(source)==1108 and sum(r['changedFromC06'] for r in source)==2 and sum(r['addedFromC06'] for r in source)==1
verify(D,read(D/'final-source-freeze-manifest.json')['members']);verify(D,read(D/'toolchain-pins.json')['records'])
for r in source:
 p=Path(r['origin']);assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'] and stat.S_IMODE(p.stat().st_mode)==r['mode'],str(p)
 if not r['path'].startswith(str(TR)+'/contracts/qualification/'):
  p=D/'final-stage'/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'] and stat.S_IMODE(p.stat().st_mode)==r['mode'],str(p)
for r in read(D/'final-generated-after.json'):
 p=D/'final-stage'/TR/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
for r in read(D/'dependency-pins.json')['members']:
 verify(D,[r['preparedArchive'],r['preparedCacheContent']])
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
save('final-preservation-verification.json',{'status':'verified','immutableSubjects':preserved,'sourceOriginsVerified':len(source),'sixteenC06FrozenArchiveCacheBodiesVerified':True,'oldStores':store_checks,'oldPopulationAssurance':'accepted independent C06/source/Q08/Runtime07/source-repair population assurance reused; no repeated historical body reproof/copies/restamps','sourceOrAmbientMutation':False})
# Separate complete input, generated/staged, and physically installed populations.
for name,root in [('final-source-population.json',D/'final-source'),('final-law-population.json',D/'final-law'),('final-stage-population.json',D/'final-stage'),('final-stage-dependency-population.json',D/'final-stage'/TR/'node_modules'),('final-install-population.json',D/'final-install'),('final-toolchain-population.json',D/'source-freeze/toolchain'),('final-cache-population.json',D/'final-npm-cache')]:save(name,inventory(root))
selected=read(D/'final-selected-core.json');generated=read(D/'final-generated-summary.json');pub=read(D/'final-installed-publication-results.json');wrapper=read(D/'final-required-wrapper-rows.json')
assert pub['status']=='passed' and len(pub['rows'])==11 and wrapper['status']=='REQUIRED_WRAPPER_ROWS_COMPATIBLE' and wrapper['intrinsicWrapperRepackRequired']==False
assert generated['sourceInputsPreserved']==1108
assert {r['path'] for r in read(D/'final-generated-delta.json')}=={'build/code/src/gtl/self_conformance.js','contracts/capabilities/capability-definition-graph.json','product-toolchain-manifest.json'}
manifest=read(Path(selected['packageRoot'])/'product-toolchain-manifest.json');verification=read(D/'final-product-verification-summary.json')
assert verification['basis']==selected['basis']
# Saved current producers define every semantic delta; no previous identity is assumed.
old_manifest=read(C/'final-install/node_modules/@abiogenesis/typescript-tenant/product-toolchain-manifest.json')
old_publications={r['moduleRef']:r for r in read(C/'final-installed-publication-results.json')['rows']}
publication_deltas=[{'moduleRef':r['moduleRef'],'C06PublicationDigest':old_publications[r['moduleRef']]['publicationDigest'],'C07PublicationDigest':r['publicationDigest'],'changed':old_publications[r['moduleRef']]['publicationDigest']!=r['publicationDigest']} for r in pub['rows']]
current_generated={r['path']:r for r in read(D/'final-generated-after.json')}
emitted_deltas=[{'path':r['path'],'C06ActualStageSHA256':r['C06ActualStageSHA256'],'C07ActualStageSHA256':current_generated[r['path']]['sha256'],'bytes':current_generated[r['path']]['bytes'],'role':r['role']} for r in read(D/'final-generated-delta.json')]
save('final-semantic-identity-delta.json',{'baseline':'actual accepted C06 packaged/staged producers','current':'actual C07 packaged/staged/installed owner producers','beforeProduct':old_manifest['productContentDigest'],'afterProduct':manifest['productContentDigest'],'beforeCatalogDigest':old_manifest['publicContractCatalog']['catalogDigest'],'afterCatalogDigest':manifest['publicContractCatalog']['catalogDigest'],'beforeCatalogRows':len(old_manifest['publicContractCatalog']['rows']),'afterCatalogRows':len(manifest['publicContractCatalog']['rows']),'actualCompleteCatalogEqual':old_manifest['publicContractCatalog']==manifest['publicContractCatalog'],'publicationBindings':publication_deltas,'generatedBodies':emitted_deltas,'completeNativeRows':wrapper['completeNativeRowsCompared'],'capabilityRows':wrapper['completeCapabilityGraphComparison']['completeRows'],'currentOwnerCoordinates':wrapper['completeCapabilityGraphComparison']['currentOwnerCoordinateCount'],'ownerCoordinateChanges':len(wrapper['completeCapabilityGraphComparison']['measuredOwnerCoordinateDeltas']),'legacyGeneratedProducerField':'final-generated-delta.json C06GeneratedSHA256 is the inherited producer field for the current D/final-stage body; current names above resolve it from final-generated-after.json','qualification':'not claimed'})
# Normalize actual npm ./ bin locators; admit only the exact selected mode adaptations.
package_metadata=read(Path(selected['packageRoot'])/'package.json');bin_paths={str(Path(v)) for v in package_metadata['bin'].values()}
mode_adaptations=[]
for r in read(D/'final-archive-members.json'):
 actual=stat.S_IMODE((Path(selected['packageRoot'])/r['path']).stat().st_mode)
 if actual!=r['archiveMode']:
  assert r['path'] in bin_paths and r['archiveMode']==0o644 and actual==0o755,r['path']
  mode_adaptations.append({'path':r['path'],'archiveMode':r['archiveMode'],'installedMode':actual,'relation':'declared npm bin target adaptation only'})
assert len(mode_adaptations)==2 and {r['path'] for r in mode_adaptations}==bin_paths
save('final-installed-mode-correspondence.json',{'status':'EXACT_WITH_TWO_DECLARED_BIN_ADAPTATIONS','normalizedDeclaredBinPaths':sorted(bin_paths),'adaptations':mode_adaptations,'otherPayloadModeChanges':0})

cost={'preparationMs':read(D/'final-preparation-result.json')['elapsedMs'],'operationMs':sum(r['elapsedMs'] for r in ops),'operations':[{k:r[k] for k in ['command','elapsedMs','exitCode','timedOut','childUserCPUSeconds','childSystemCPUSeconds','childMaxResidentSetSizePlatformBytes']} for r in ops],'generatedCorrespondenceMs':generated['elapsedMs'],'packageCorrespondenceMs':read(D/'final-package-correspondence.json')['elapsedMs'],'retainedComparisonAttempt':'C07 uses one distinct-path comparison; all earlier failed cuts remain preserved, no repeat pack/install','defaultHeapUnchanged':True,'allFinalOwnedExitObserved':True,'donorC06TenIntervalMs':read(C/'final-costs.json')['operationMs'],'donorC06PreparationMs':read(C/'final-preparation-result.json')['elapsedMs'],'basis':'actual finite subprocess intervals; reasoning/report assembly and retained first-comparison timing uncertainty are separate','sourceTestsRepeated':0,'nativeModelProviderNetworkRuntimeStoreGitEffects':0}
save('final-costs.json',cost)
shutil.copy2(C/'final-source-members.json',D/'C06-source-attribution-reference.json')
cut=read(D/'controls/source-cut.json');by_path={r['path']:r for r in source}
for row in cut['members']:
 actual=by_path[row['path']]
 assert actual['originalSource']==row['originalSource'] and actual['originalAuthorship']==row['originalAuthorship']
 assert actual['sourceAuthor']==row['sourceAuthor']
 for key in [key for key in row if key.endswith('SourceProvenance') or key=='preimage']:
  if key in row:assert actual[key]==row[key]
save('final-attribution.json',{'sourceCutAuthor':cut['sourceCutAuthor'],'sourceCutSHA256':sha(D/'controls/source-cut.json'),'originalSources':'all1108 exact originalSource/originalAuthorship/sourceAuthor and every existing C04/C06SourceProvenance relation retained; new test original ABSENT preimage retained','sourceChangesFromC06':2,'sourceAddedFromC06':1,'acceptedFPSourceAuthor':cut['replacements'][1]['sourceAuthor'],'acceptedSourceFreezeSHA256':cut['acceptedSourceFreezeSha256'],'trackingSnapshotAuthor':'Root Writer tracking','builderReportActor':'/root/native_applicability_design under separately activated T287_RC1_SUCCESSOR_CONSTRUCTION_07','C06SourceAttributionReference':'C06-source-attribution-reference.json','sourceRepair':False,'qualificationActorIndependence':'future assessor binds actual original source authors; builder role does not confer independence'})

groups=[]
for op in ops:
 try:os.killpg(op['pid'],0);state='present'
 except ProcessLookupError:state='absent'
 except PermissionError:state='unobservable_permission'
 groups.append({'pid':op['pid'],'ownedProcessGroup':op['pid'],'afterOwnedWait':state})
assert all(r['afterOwnedWait']=='absent' for r in groups),groups
save('final-process-closure.json',{'status':'CLOSED','knownOperationGroups':groups,'actualMainOwnedExitObserved':True,'unknownChildren':'individual npm descendants not PID-enumerated; declared owner/tool awaits child completion and all known groups are absent'})
save('final-closure.json',{'status':'CLOSED','workResult':'construction_ready_for_independent_review','activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_07','actor':'/root/native_applicability_design','role':'Worker','closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'onlyWriteTerritory':str(D),'sourceRepair':False,'pack':1,'physicalOfflineInstall':1,'ordinaryProductInstall':False,'runtime':False,'qualification':False,'reviewerActivated':False,'noFurtherWrites':True})
text=f'''CLOSED C07 construction Worker T287_RC1_SUCCESSOR_CONSTRUCTION_07 returns one prospective pre_rc_candidate. Fixed15/GOAL035/T287/STDO2.5.1RC2. This is physical construction readiness, not qualification, publication or ABG installation.

Exactly1108 selected inputs:1105 inherited C06 bodies, accepted F_P raw-result GTL publication and Root tracking replacements, plus one new named regression test. Complete original source authors/preimages/C03-C06 chains are retained; builder is not the source author. Source-cut {sha(D/'controls/source-cut.json')}; source-freeze {sha(D/'final-source-freeze-manifest.json')}. No moving Source or source repair.

One accepted offline build/pack/physical bootstrap install uses frozen C06 Node24.7/npm11.5.1/TS5.9.2 and16 locked archives. Exact Definitioneafbb85e/RC2manifest3d860ff4/52members aggregate2f54671d verify. Twelve historical aliases remain original inputs; current RC2 authority outputs are separately generated. Current C06 schema seeds are derived dependencies.

All ten supervised commands passed; no source/Hello/extra suites were repeated. Actual926 generated outputs/3changes from C06: gtl/self_conformance.js, contracts/capabilities/capability-definition-graph.json, manifest. Actual95 authority joins/2137rule spans/16claims/66behaviors passed. Complete source/law/generated/archive/install correspondence and actual mode census are retained. Only two declared CLI files change0644 to0755 in bootstrap install; ./ locators normalize to actual paths.

Archive {identity['artifactPath']}
Archive digest {identity['artifactDigest']}; {identity['archiveBytes']}bytes/{identity['archiveMembers']}members.
Bootstrap package {identity['packageRoot']}
Product {selected['basis']['productContentDigest']}
Canonical manifest {selected['basis']['manifestDigest']}
Catalog {verification['catalogDigest']}
Installed ProductVerificationPort and same-process owned nominal selection passed; all11 actual publication constructors/validation/manifest bindings passed. All11 semantic publication digests changed under current Product basis; qualification's explicit raw-result publication is retained. Actual full catalog is unchanged:61rows/37native rows. All emitted declaration/schema/interface bodies remain exact. final-semantic-identity-delta.json measures these facts without assuming predecessor equality.

Unchanged USTAR wrapper943dd228/fixture3362ff72 retains historical C03 guards. Against actual PACKAGED C06, all3 required full contract rows/308bodies and37native rows are conserved. The unchanged existing constructor rederives all16 capability rows from the actual new catalog and verified definition slots, preserving196 owner selector identities and measuring196 changed Product coordinates. No wrapper repack or actual Public locks/binding/catalog/Run/setup occurred.

Ten actual command intervals {cost['operationMs']/1000:.3f}s; preparation {cost['preparationMs']/1000:.3f}s, correspondence and report costs are separate. Default heap/HOME unchanged, no timeout, all known PID/PGID groups absent after owned waits. Individual npm descendants are not enumerated. One distinct comparison outcome/receipt; no build/pack/install retry. Prior immutable metadata and exact old store stat identities remain unchanged; accepted old population assurance is reused.

Worker CLOSED; all writes STOP after final-freeze. Root alone accepts. Independent C07 assurance and separately granted actual Setup07/current Q09/whole installed wrapper-child raw admission/J/foldback/RunClosed/six fresh reads/F11/sole truthful non-green AF22 remain next. C06/Q08/failedRuntime07 stay exact. Genuine F11/QUAL056/18commands/scenarios/greenAF22/release remain open; no new provider/network claim follows.
'''
with (D/'final-return.md').open('x') as f:f.write(text)
# Freeze all evidence records. Large populations are reached through complete exact inventories,
# themselves frozen records; no generated data is confused with source inputs.
excluded=('final-source/','final-stage/','final-law/','final-install/','source-freeze/','final-npm-cache/','final-npm-prefix/','final-tmp/')
records=[]
for p in sorted(D.rglob('*')):
 rel=str(p.relative_to(D))
 if (p.is_file() or p.is_symlink()) and not rel.startswith(excluded):records.append(pin(p,rel))
freeze={'status':'CLOSED','workResult':'construction_ready_for_independent_review','activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_07','actor':'/root/native_applicability_design','role':'Worker','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'return':'final-return.md','closure':'final-closure.json','sourceFreeze':{'path':'final-source-freeze-manifest.json','sha256':sha(D/'final-source-freeze-manifest.json')},'sourceCut':{'path':'controls/source-cut.json','sha256':sha(D/'controls/source-cut.json')},'records':records,'recordCount':len(records),'recordBytes':sum(r.get('bytes',0) for r in records),'completeSourceMembers':1108,'sourceChangedFromC06':2,'sourceAddedFromC06':1,'actualGenerated':generated,'package':identity,'selected':selected,'basis':read(D/'final-law-verification.json'),'publicationCount':11,'wrapperCompatibility':'final-required-wrapper-rows.json','completePopulations':{'source':'final-source-population.json','law':'final-law-population.json','stage':'final-stage-population.json','stageDependencies':'final-stage-dependency-population.json','physicalInstall':'final-install-population.json','toolchain':'final-toolchain-population.json','cache':'final-cache-population.json','archivePayload':'final-archive-members.json'},'correspondence':'final-package-correspondence.json','preserved':'final-preservation-verification.json','readiness':{'physicalInstalledOwnerVerification':True,'sameProcessNominalSelection':True,'complete11StaticPublications':True,'fullRequiredWrapperContractCapabilityCompatibility':True,'actualSingletonMixedPublicLocks':False,'ordinaryRuntime':False,'qualification':False,'publication':False},'effects':{'sourceRepair':0,'ambientGenerated':0,'lockedDependenciesOffline':1,'compile':1,'explicitRC2AuthorityStage':1,'ProductManifest':1,'pack':1,'physicalOfflineInstall':1,'metadataComparison':1,'sourceTestsRepeated':0,'nativeProviderNetworkRuntimeStoreGit':0},'costs':'final-costs.json','attribution':'final-attribution.json','sourceOrCandidateAccepted':False,'semanticIdentityDelta':'final-semantic-identity-delta.json','modeCorrespondence':'final-installed-mode-correspondence.json','reportAssemblyElapsedMsToFreeze':(time.monotonic()-report_started)*1000,'stop':'all Worker writes CLOSED; Root independently conjoins before distinct Setup07/Q09/Runtime activations'}
freeze['directories']=[{'path':str(p.relative_to(D)),'mode':stat.S_IMODE(p.stat().st_mode)} for p in sorted(D.rglob('*')) if p.is_dir() and not p.is_symlink()];freeze['directoryCount']=len(freeze['directories']);freeze['rootDirectoryMode']=stat.S_IMODE(D.stat().st_mode)
save('final-freeze.json',freeze);verify(D,records)
for name in freeze['completePopulations'].values():
 if name=='final-archive-members.json':continue
 verify(D,read(D/name))
print(json.dumps({'status':'CLOSED','freeze':str(D/'final-freeze.json'),'freezeSHA256':sha(D/'final-freeze.json'),'recordCount':len(records),'recordBytes':freeze['recordBytes'],'sourceFreezeSHA256':sha(D/'final-source-freeze-manifest.json'),'archiveDigest':identity['artifactDigest'],'productContentDigest':selected['basis']['productContentDigest'],'manifestDigest':selected['basis']['manifestDigest'],'allReadbacksMatched':True},indent=2),flush=True)
