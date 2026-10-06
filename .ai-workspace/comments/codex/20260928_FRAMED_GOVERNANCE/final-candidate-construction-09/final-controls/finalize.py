from pathlib import Path
import datetime,hashlib,json,stat,os,shutil,time
D=Path(__file__).resolve().parent.parent;G=D.parent;C=None;TR=Path('build_tenants/abiogenesis/typescript')
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
operation_basis_path = D / 'controls/operation-basis.json'
assert sha(operation_basis_path) == 'adc8cb93426b08877e44ea6484acf5e532ba73f182b54365d1ab308b20a2206b'
operation_basis = read(operation_basis_path)
assert operation_basis['effectTerritory'] == str(D)
assert read(D / 'activation.json')['activation'] == operation_basis['operation']
assert read(D / 'activation.json')['actor'] == operation_basis['actor']

configuration_path=D/'builder-inputs.json'
assert sha(configuration_path)=='b93750a282875adc0f792c36d9e8ac221a966143297c4b7e156234db6b3e8f60'
configuration=read(configuration_path)
assert configuration['operationBasisSHA256']==sha(operation_basis_path)
assert configuration['sourceCutSHA256']==operation_basis['sourceCut']['sha256']
C=Path(operation_basis['acceptedBuilder']['path']).parent
assert configuration['priorCandidateRoot']==str(C)
assert read(D/'activation.json')['activation']==operation_basis['operation'] and not (D/'final-freeze.json').exists()
assert read(D / 'construction-execution-grant.json')['actor'] == operation_basis['actor']
ops=[]
for name in read(D/'final-budgets.json')['operationCapsMs']:
 r=read(D/('final-'+name+'.json'));assert r['exitCode']==0 and not r['timedOut'] and r['ownedExitObserved'] and r['HOMEUnchanged'] and r['defaultHeapUnchanged'],name;ops.append(r)
assert len(ops)==10
source=read(D/'final-source-members.json');assert len(source)==configuration['sourceCount'] and sum(r['changedFromBaseline'] for r in source)==configuration['changedCount'] and sum(r['addedFromBaseline'] for r in source)==configuration['addedCount']
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
save('final-preservation-verification.json',{'status':'verified','immutableSubjects':preserved,'sourceOriginsVerified':len(source),'sixteenBaselineFrozenArchiveCacheBodiesVerified':True,'oldStores':store_checks,'oldPopulationAssurance':'accepted independent C08/typed Source/Runtime08/source-repair population assurance reused; no repeated historical body reproof/copies/restamps','sourceOrAmbientMutation':False})
# Separate complete input, generated/staged, and physically installed populations.
for name,root in [('final-source-population.json',D/'final-source'),('final-law-population.json',D/'final-law'),('final-stage-population.json',D/'final-stage'),('final-stage-dependency-population.json',D/'final-stage'/TR/'node_modules'),('final-install-population.json',D/'final-install'),('final-toolchain-population.json',D/'source-freeze/toolchain'),('final-cache-population.json',D/'final-npm-cache')]:save(name,inventory(root))
selected=read(D/'final-selected-core.json');generated=read(D/'final-generated-summary.json');pub=read(D/'final-installed-publication-results.json');wrapper=read(D/'final-required-wrapper-rows.json')
assert pub['status']=='passed' and len(pub['rows'])==11 and wrapper['status']=='REQUIRED_WRAPPER_ROWS_COMPATIBLE' and wrapper['intrinsicWrapperRepackRequired']==False
assert generated['sourceInputsPreserved']==configuration['sourceCount']
actual_emitted_changes={r['path'] for r in read(D/'final-generated-delta.json')}
assert actual_emitted_changes<=set(configuration['sourceEmittedPaths']+configuration['permittedDerivedIdentityChanges']),actual_emitted_changes
assert set(configuration['newSourceEmittedPaths'])<=actual_emitted_changes
assert generated['generatedMembers']==len(read(D/'final-generated-after.json'))
manifest=read(Path(selected['packageRoot'])/'product-toolchain-manifest.json');verification=read(D/'final-product-verification-summary.json')
assert verification['basis']==selected['basis']
# Saved current producers define every semantic delta; no previous identity is assumed.
old_manifest=read(C/'final-install/node_modules/@abiogenesis/typescript-tenant/product-toolchain-manifest.json')
old_publications={r['moduleRef']:r for r in read(C/'final-installed-publication-results.json')['rows']}
publication_deltas=[{'moduleRef':r['moduleRef'],'baselinePublicationDigest':old_publications[r['moduleRef']]['publicationDigest'],'currentPublicationDigest':r['publicationDigest'],'changed':old_publications[r['moduleRef']]['publicationDigest']!=r['publicationDigest']} for r in pub['rows']]
current_generated={r['path']:r for r in read(D/'final-generated-after.json')}
emitted_deltas=[{'path':r['path'],'baselineActualStageSHA256':r['baselineActualStageSHA256'],'currentActualStageSHA256':current_generated[r['path']]['sha256'],'bytes':current_generated[r['path']]['bytes'],'role':r['role']} for r in read(D/'final-generated-delta.json')]
save('final-semantic-identity-delta.json',{'baseline':'actual accepted C08 packaged/staged producers','current':'actual current packaged/staged/installed owner producers','beforeProduct':old_manifest['productContentDigest'],'afterProduct':manifest['productContentDigest'],'beforeCatalogDigest':old_manifest['publicContractCatalog']['catalogDigest'],'afterCatalogDigest':manifest['publicContractCatalog']['catalogDigest'],'beforeCatalogRows':len(old_manifest['publicContractCatalog']['rows']),'afterCatalogRows':len(manifest['publicContractCatalog']['rows']),'actualCompleteCatalogEqual':old_manifest['publicContractCatalog']==manifest['publicContractCatalog'],'publicationBindings':publication_deltas,'generatedBodies':emitted_deltas,'completeNativeRows':wrapper['completeNativeRowsCompared'],'capabilityRows':wrapper['completeCapabilityGraphComparison']['completeRows'],'currentOwnerCoordinates':wrapper['completeCapabilityGraphComparison']['currentOwnerCoordinateCount'],'ownerCoordinateChanges':len(wrapper['completeCapabilityGraphComparison']['measuredOwnerCoordinateDeltas']),'generatedProducerField':'final-generated-delta.json currentGeneratedSHA256 and baselineActualStageSHA256 directly identify actual current/baseline stage bodies','qualification':'not claimed'})
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

cost={'preparationMs':read(D/'final-preparation-result.json')['elapsedMs'],'operationMs':sum(r['elapsedMs'] for r in ops),'operations':[{k:r[k] for k in ['command','elapsedMs','exitCode','timedOut','childUserCPUSeconds','childSystemCPUSeconds','childMaxResidentSetSizePlatformBytes']} for r in ops],'generatedCorrespondenceMs':generated['elapsedMs'],'packageCorrespondenceMs':read(D/'final-package-correspondence.json')['elapsedMs'],'retainedComparisonAttempt':'current candidate uses one distinct-path comparison; all earlier failed cuts remain preserved, no repeat pack/install','defaultHeapUnchanged':True,'allFinalOwnedExitObserved':True,'donorBaselineTenIntervalMs':read(C/'final-costs.json')['operationMs'],'donorBaselinePreparationMs':read(C/'final-preparation-result.json')['elapsedMs'],'basis':'actual finite subprocess intervals; reasoning/report assembly and retained first-comparison timing uncertainty are separate','sourceTestsRepeated':0,'nativeModelProviderNetworkRuntimeStoreGitEffects':0}
save('final-costs.json',cost)
shutil.copy2(C/'final-source-members.json',D/'baseline-source-attribution-reference.json')
cut=read(D/'controls/source-cut.json');by_path={r['path']:r for r in source}
for row in cut['members']:
 actual=by_path[row['path']]
 assert actual['originalSource']==row['originalSource'] and actual['originalAuthorship']==row['originalAuthorship']
 assert actual['sourceAuthor']==row['sourceAuthor']
 for key in [key for key in row if key.endswith('SourceProvenance') or key=='preimage']:
  if key in row:assert actual[key]==row[key]
save('final-attribution.json',{'sourceCutAuthor':cut['sourceCutAuthor'],'sourceCutSHA256':sha(D/'controls/source-cut.json'),'originalSources':'all selected originalSource/originalAuthorship/sourceAuthor and nested historical SourceProvenance/preimage/sourceAuthorship relations retained','sourceChangesFromBaseline':configuration['changedCount'],'sourceAddedFromBaseline':configuration['addedCount'],'unchangedFromBaseline':configuration['unchangedCount'],'selectedIncrementAuthors':[{'path':r['path'],'sourceAuthor':r['sourceAuthor'],'preimage':r.get('preimage'),'sourceAuthorship':r.get('sourceAuthorship'),'fixtureSuccessorAuthorship':r.get('fixtureSuccessorAuthorship')} for r in cut['replacements']+cut['additions']],'acceptedSourceAuthorship':cut['acceptedSourceAuthorship'],'acceptedTestFixtureAuthorship':cut['acceptedTestFixtureAuthorship'],'acceptedSourceFreezeSHA256':cut['acceptedSourceFreezeSha256'],'operativeSourceReview':configuration['sourceReview'],'historicalPreparedReviewField':cut['acceptedSourceReviewFreezeSha256'],'builderReportActor':operation_basis['actor']+' under separately activated '+operation_basis['operation'],'baselineSourceAttributionReference':'baseline-source-attribution-reference.json','sourceRepair':False,'qualificationActorIndependence':'builder is not source author; no new qualification independence'})

groups=[]
for op in ops:
 try:os.killpg(op['pid'],0);state='present'
 except ProcessLookupError:state='absent'
 except PermissionError:state='unobservable_permission'
 groups.append({'pid':op['pid'],'ownedProcessGroup':op['pid'],'afterOwnedWait':state})
assert all(r['afterOwnedWait']=='absent' for r in groups),groups
save('final-process-closure.json',{'status':'CLOSED','knownOperationGroups':groups,'actualMainOwnedExitObserved':True,'unknownChildren':'individual npm descendants not PID-enumerated; declared owner/tool awaits child completion and all known groups are absent'})
save('final-closure.json',{'status':'CLOSED','workResult':'construction_ready_for_independent_review','activation':operation_basis['operation'],'actor':operation_basis['actor'],'role':'Worker','closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'onlyWriteTerritory':str(D),'sourceRepair':False,'pack':1,'physicalOfflineInstall':1,'ordinaryProductInstall':False,'runtime':False,'qualification':False,'reviewerActivated':False,'noFurtherWrites':True})
text=f'''CLOSED {operation_basis['operation']} phase {operation_basis['phase']}. One prospective pre_rc_candidate; physical construction readiness only. Fixed15/T287/STDO2.5.1RC2/HOW5.1.

Exactly {configuration['sourceCount']} selected source inputs: {configuration['unchangedCount']} unchanged accepted C08 bodies, {configuration['changedCount']} typed Source/HOW/tracking replacements and {configuration['addedCount']} typed-module/test additions. Original C08/C07 source authors/preimages and all nested earlier provenance are conserved; builder is {operation_basis['actor']}. Actual independent Source review {configuration['sourceReview']['sha256']} is operative through Root acceptance; frozen prepared PENDING is historical data. Source-cut {sha(D/'controls/source-cut.json')}; source-freeze {sha(D/'final-source-freeze-manifest.json')}.

One accepted offline ten-command build/pack/bootstrap sequence uses frozen C08 Node24.7/npm11.5.1/TS5.9.2 and16 locked archives, default heap and ordinary HOME. Current Definition/RC2 authority generation and all {generated['actualAuthorityJoins']} joins/{generated['rules']} rule spans/{generated['coverageClaims']} claims/{generated['coverageBehaviors']} behaviors passed. Generated population is actually {generated['generatedMembers']}; {len(emitted_deltas)} body changes from C08 measured in final-semantic-identity-delta.json. No previous generated count is assumed. All source/law/generated/archive/install bodies and modes have complete frozen inventories/correspondence. Only two declared CLI0644-to0755 adaptations occur in bootstrap install.

Archive {identity['artifactPath']}
Archive digest {identity['artifactDigest']}; {identity['archiveBytes']}bytes/{identity['archiveMembers']}members.
Bootstrap package {identity['packageRoot']}
Product {selected['basis']['productContentDigest']}
Canonical manifest {selected['basis']['manifestDigest']}
Catalog {verification['catalogDigest']}
Installed ProductVerificationPort and same-process owned nominal selection passed; all11 actual publication constructors/validators/manifest bindings passed. {sum(r['changed'] for r in publication_deltas)} of {len(publication_deltas)} publication digests changed, measured under the actual Product basis. Complete catalog equality with C08 is {old_manifest['publicContractCatalog']==manifest['publicContractCatalog']}, with {len(manifest['publicContractCatalog']['rows'])} rows.

Unchanged USTAR wrapper retains its historical author/dependency/archive identity. Actual immutable dependency3contractRefs/2capabilityRefs/version/major5 is unchanged. {len(wrapper['requiredContracts'])} current full required rows/{wrapper['currentRequiredBodyCount']} current bodies authenticated; {wrapper['historicalRequiredBodyCount']} historical bodies retained as history. {len(wrapper['requiredBodyDeltas'])} exact allowed required-body changes/additions and {len(wrapper['changedNativeRows'])} of37native rows changed, with all stable fields and fresh complete inventories verified. All16 capability rows rederived through the unchanged actual constructor from actual new verified definition slots/catalog;196 selectors retained, {len(wrapper['completeCapabilityGraphComparison']['measuredOwnerCoordinateDeltas'])} Product-coordinate changes measured. No wrapper repack, nominal wrapper selection, Public environment locks, ABG install or Runtime occurred.

Ten commands {cost['operationMs']/1000:.3f}s; preparation {cost['preparationMs']/1000:.3f}s. Correspondence/report assembly costs separate. All owned waits/defaultheap/HOME passed, no timeout, all known groups absent. One pack, one offline bootstrap install, no payload retry. Old cuts/source/library/stores read-only; old resource bodies were not recopied or re-proved. No Source tests, Hello, actor/helper/provider/network/Git or qualification effects.

Worker CLOSED; writes stop. Root alone independently conjoins actual construction before separate Setup09/input/installed whole Result/J/parent foldback/F11/sole truthful non-green AF22 and six fresh reads. No semantic or release credit follows from this construction.
'''
with (D/'final-return.md').open('x') as f:f.write(text)
# Freeze all evidence records. Large populations are reached through complete exact inventories,
# themselves frozen records; no generated data is confused with source inputs.
excluded=('final-source/','final-stage/','final-law/','final-install/','source-freeze/','final-npm-cache/','final-npm-prefix/','final-tmp/')
records=[]
for p in sorted(D.rglob('*')):
 rel=str(p.relative_to(D))
 if (p.is_file() or p.is_symlink()) and not rel.startswith(excluded):records.append(pin(p,rel))
freeze={'status':'CLOSED','workResult':'construction_ready_for_independent_review','activation':operation_basis['operation'],'actor':operation_basis['actor'],'role':'Worker','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'return':'final-return.md','closure':'final-closure.json','sourceFreeze':{'path':'final-source-freeze-manifest.json','sha256':sha(D/'final-source-freeze-manifest.json')},'sourceCut':{'path':'controls/source-cut.json','sha256':sha(D/'controls/source-cut.json')},'records':records,'recordCount':len(records),'recordBytes':sum(r.get('bytes',0) for r in records),'completeSourceMembers':configuration['sourceCount'],'sourceChangedFromBaseline':configuration['changedCount'],'sourceAddedFromBaseline':configuration['addedCount'],'actualGenerated':generated,'package':identity,'selected':selected,'basis':read(D/'final-law-verification.json'),'publicationCount':11,'wrapperCompatibility':'final-required-wrapper-rows.json','completePopulations':{'source':'final-source-population.json','law':'final-law-population.json','stage':'final-stage-population.json','stageDependencies':'final-stage-dependency-population.json','physicalInstall':'final-install-population.json','toolchain':'final-toolchain-population.json','cache':'final-cache-population.json','archivePayload':'final-archive-members.json'},'correspondence':'final-package-correspondence.json','preserved':'final-preservation-verification.json','readiness':{'physicalInstalledOwnerVerification':True,'sameProcessNominalSelection':True,'complete11StaticPublications':True,'fullRequiredWrapperContractCapabilityCompatibility':True,'actualSingletonMixedPublicLocks':False,'ordinaryRuntime':False,'qualification':False,'publication':False},'effects':{'sourceRepair':0,'ambientGenerated':0,'lockedDependenciesOffline':1,'compile':1,'explicitRC2AuthorityStage':1,'ProductManifest':1,'pack':1,'physicalOfflineInstall':1,'metadataComparison':1,'sourceTestsRepeated':0,'nativeProviderNetworkRuntimeStoreGit':0},'costs':'final-costs.json','attribution':'final-attribution.json','sourceOrCandidateAccepted':False,'semanticIdentityDelta':'final-semantic-identity-delta.json','modeCorrespondence':'final-installed-mode-correspondence.json','reportAssemblyElapsedMsToFreeze':(time.monotonic()-report_started)*1000,'stop':'all Worker writes CLOSED; Root independently conjoins before distinct Setup09/current-input/Runtime activations'}
freeze['directories']=[{'path':str(p.relative_to(D)),'mode':stat.S_IMODE(p.stat().st_mode)} for p in sorted(D.rglob('*')) if p.is_dir() and not p.is_symlink()];freeze['directoryCount']=len(freeze['directories']);freeze['rootDirectoryMode']=stat.S_IMODE(D.stat().st_mode)
save('final-freeze.json',freeze);verify(D,records)
for name in freeze['completePopulations'].values():
 if name=='final-archive-members.json':continue
 verify(D,read(D/name))
print(json.dumps({'status':'CLOSED','freeze':str(D/'final-freeze.json'),'freezeSHA256':sha(D/'final-freeze.json'),'recordCount':len(records),'recordBytes':freeze['recordBytes'],'sourceFreezeSHA256':sha(D/'final-source-freeze-manifest.json'),'archiveDigest':identity['artifactDigest'],'productContentDigest':selected['basis']['productContentDigest'],'manifestDigest':selected['basis']['manifestDigest'],'allReadbacksMatched':True},indent=2),flush=True)
