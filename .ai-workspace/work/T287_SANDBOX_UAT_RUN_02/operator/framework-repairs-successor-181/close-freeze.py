import json,pathlib,hashlib,datetime
r=pathlib.Path('/Users/jim/src/apps/abiogenesis');t=r/'build_tenants/abiogenesis/typescript';w=r/'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';p=w/'operator/framework-repairs-successor-181';c=w/'candidate-27';h=p/'host-preparation'
def load(f):return json.loads(f.read_text())
def pin(f):
 assert f.is_file() and not f.is_symlink(),str(f)
 b=f.read_bytes();return {'path':str(f),'sha256':hashlib.sha256(b).hexdigest(),'byteCount':len(b)}
def require(q):assert pin(pathlib.Path(q['path']))=={k:q[k] for k in ('path','sha256','byteCount')},q['path']
def put(f,v):
 with f.open('x') as s:s.write(json.dumps(v,indent=2)+'\n')
inp=load(p/'inputs.json');delta=load(p/'generated-delta.json');sources=load(p/'source-preimages.json');sourceDelta=load(p/'source-delta.json')
for q in sources+inp['selectedPostimages']+inp['protectedPins']+inp['sourceAccepted']+delta['postGenerated']:require(q)
for k in ('candidate26Identity','candidate26Freeze','candidate26Archive','existingPublicationMethod','existingPublicationFreeze'):require(inp[k])
actual={str(f.relative_to(t)) for base in (t/'build',t/'contracts') for f in base.rglob('*') if f.is_file()};actual.add('product-toolchain-manifest.json')
assert actual=={q['relativePath'] for q in delta['postGenerated']} and len(actual)==934
assert {str(f) for f in (t/'code/src').rglob('*.ts')}=={q['path'] for q in sources} and len(sources)==263
assert delta['all263DeclarationsUnchanged'] and delta['normalClosurePassed'] and len(delta['changed'])==3
accepted=load(p/'accepted-emission-correspondence.json');assert accepted['exactBodyEqual'];require(accepted['authorizedSemanticsJS']);require(accepted['accepted179SemanticsJS'])
archive=load(c/'archive.json')['archive'];require(archive)
par=load(p/'essential-parity.json');meta=load(p/'metadata-parity.json');members=load(c/'member-delta.json');host=load(h/'exacthost-identity.json');match=load(h/'installed-content-match.json')
assert par['productContentDigest']==host['productContentDigest'] and par['canonicalManifestDigest']==host['manifestDigest'] and match['matches'] and host['allArchiveBytesEqual']
assert members['memberCount']==5265 and len(members['exactComposedFrozenDelta'])==3 and members['publicNonDigestFieldsEqual']
assert len(members['catalogDifferences'])==0 and meta['exactAccepted179GeneratedCounterparts'] and meta['beforeAndAfterCompleteCapabilitiesCanonicallyRecomputed']
receipts={}
for stem,base in [('build',p),('pack',c),('essential-parity',p),('metadata-parity',p),('member-comparison',p),('extract',p),('extracted-joins',p),('clean-host',p),('install-host27',h)]:
 f=base/'commands'/f'{stem}.result.json';v=load(f);assert v['exitCode']==0 and v['signal'] is None and not v['timedOut'] and not v['truncated'] and v['failure'] is None
 receipts[stem]={'receipt':pin(f),'wallMs':v['wallMs'],'exitCode':0,'signal':None,'timedOut':False,'truncated':False,'failure':None}
closed=datetime.datetime.now(datetime.timezone.utc).isoformat()
limits='Bounded publication and clean physical installed-owner correspondence only. Actual current-source applicability/D2/private preparation/independent ABG admission/FP-to-HoG/native Testing/C2/UAT/long-run memory/P0/release remain OPEN. No event-resource read/hash/acquisition, model, Run, application, Source/HOW/Git/package/version/dependency/lock changes.'
conjunction='Root conjoined frozen179+independent180 after actual176 current-source-use provenance-order failure. Exact accepted179 semantics increment is applied to immutable26 accepted138+143+145+151 population. Source unit/controlled owner premises remain bounded; no installed source-use acceptance. Root selected phase-only181 documentary and proof/caller corrections after RCA, preserving failures and successful build.'
conservation={'productionSourceCount':263,'allProductionSourceBytesEqualCapturedPre181':True,'sourceDeltaFrom26':{'changed':len(sourceDelta['changed']),'unchanged':sourceDelta['unchanged'],'record':pin(p/'source-delta.json')},'generatedCount':934,'exactGeneratedAndPackageDeltaCount':3,'unchangedGeneratedFrom26':931,'all263NormalDeclarationsExact26':True,'authorizedSemanticsJSEqualsAccepted179':True,'selectedSourceHowTestAndProtectedPinsConserved':True,'candidate26ArchiveIdentityFreezeConserved':True,'generatedRecord':pin(p/'generated-delta.json'),'acceptedEmissionRecord':pin(p/'accepted-emission-correspondence.json'),'actualEventLogNotReadOrHashed':True}
put(p/'conservation.json',conservation)
manifestPath=c/'scratch/successor/package/product-toolchain-manifest.json';manifest=load(manifestPath)
identity={'status':'immutable_unreleased_candidate_pending_independent_publication_review','candidate':27,'closed':closed,'archive':archive,'productId':manifest['productId'],'packageName':manifest['packageName'],'packageVersion':manifest['packageVersion'],'sourceCommit':'727f1dbcab3c198f7704735fdf91b994b7aac243','sourceCommitMeaning':'Historical campaign checkpoint; exact current accepted dirty Source is bound by source179/180 and captured263-source inventory.','acceptedSource':inp['sourceAccepted'],'sourceConjunction':conjunction,'predecessor26':{k:inp[k] for k in ('candidate26Identity','candidate26Freeze','candidate26Archive')},'productContentDigest':par['productContentDigest'],'manifestDigest':par['canonicalManifestDigest'],'rawManifest':pin(manifestPath),'catalogDigest':manifest['publicContractCatalog']['catalogDigest'],'capabilityDefinitionGraph':manifest['capabilityDefinitionGraph'],'contributionManifestDigest':manifest['contributionManifestDigest'],'members':{'count':5265,'samePathsTypesModes':True,'changed':3,'unchanged':5262,'memberDelta':pin(c/'member-delta.json'),'tarInventory':pin(c/'tar-inventory.json')},'canonicalConsequences':{'publicRows':par['publicCatalogRows'],'publicCatalogExact26':True,'catalogDifferenceCount':0,'capabilityDifferenceCount':meta['capabilityDifferenceCount'],'capabilityDifferenceKeyCounts':meta['capabilityDifferenceKeyCounts'],'contributionDifferenceCount':len(members['exactContributionIdentityConsequences']),'allValuesRecomputedThroughOwners':True,'nativeDeclarationClosures':meta['nativeClosures'],'publications':par['publications'],'contributions':par['contributions']},'installedHostSelector':pin(h/'exacthost-identity.json'),'installedContentMatch':pin(h/'installed-content-match.json'),'sourceAndGeneratedConservation':pin(p/'conservation.json'),'retainedFailureCauseAction':pin(p/'selected-cause-action.json'),'timings':{k:v['wallMs'] for k,v in receipts.items()},'actualInstalledVerifyWallMs':host['timings']['verifyWallMs'],'effects':'Only181/new27/new offline host and one normal generated build. No historical package/install/resource/application mutation.','runtimeReentry':'HOLD pending separate actual current-source preparation and Root runtime selection.','limits':limits}
put(c/'identity.json',identity)
paths=[f for f in p.iterdir() if f.is_file()]+[c/f for f in ('archive.json','identity.json','member-delta.json','tar-inventory.json')]+[manifestPath,c/'scratch/successor/package/contracts/capabilities/capability-definition-graph.json']
paths.extend(f for f in (p/'preimages').rglob('*') if f.is_file())
paths.extend(h/f for f in ('inputs.json','host-preparation.mjs','exacthost-identity.json','installed-content-match.json','installed-members.json','host27-acquisition.json','host/package.json','host/package-lock.json'))
for base in (p/'commands',c/'commands',h/'commands'):paths.extend(f for f in base.iterdir() if f.is_file())
paths.extend(pathlib.Path(q['path']) for q in inp['sourceAccepted']+inp['selectedPostimages']+inp['protectedPins'])
paths.extend(pathlib.Path(inp[k]['path']) for k in ('candidate26Identity','candidate26Freeze','candidate26Archive','existingPublicationMethod','existingPublicationFreeze'))
paths.append(pathlib.Path(archive['path']))
evidence=[pin(f) for f in sorted(set(paths))]
put(c/'freeze.json',{'kind':'immutable_candidate_publication_freeze','candidate':27,'closed':closed,'identity':pin(c/'identity.json'),'archive':archive,'subject':conjunction,'evidencePins':evidence,'limits':limits})
readiness={'role':'Publication Writer181','disposition':'READY_FOR_INDEPENDENT_PUBLICATION_REVIEW','closed':closed,'frame':'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration','basis':'Fixed15 ABI5.0 GOAL035/T287 STDO2.5.1rc2 manifest3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782','rootConjunction':conjunction,'candidateIdentity':pin(c/'identity.json'),'candidateFreeze':pin(c/'freeze.json'),'archive':archive,'contentDigest':par['productContentDigest'],'manifestDigest':par['canonicalManifestDigest'],'installedHost':pin(h/'exacthost-identity.json'),'checks':receipts,'actualVerifyWallMs':host['timings']['verifyWallMs'],'conservation':conservation,'publicCatalogRows':75,'fullCanonicalOwnerCorrespondence':True,'installedArchiveBodies':5265,'modeConsequences':host['modeDifferences'],'lockedDependencyFixtures':host['existingDependencyFixtures'],'retainedFailures':[pin(p/f) for f in ('preflight-first-failure.json','first-cause.json','first-declaration.diff','downstream-helper-failure.json')],'selectedCauseAction':pin(p/'selected-cause-action.json'),'effectsStopped':True,'runtimeReentry':'HOLD','limits':limits,'evidencePins':evidence}
put(p/'readiness.json',readiness)
text=f'''Publication181 CLOSED: one normal build, one pack, one clean offline install and actual source-blind installed owner verification passed. Candidate27 is immutable/unreleased pending independent182 publication review.

Archive {archive['sha256']} / {archive['byteCount']}B
Content {par['productContentDigest']}
Canonical manifest {par['canonicalManifestDigest']}
Identity {c/'identity.json'}
Host selector {h/'exacthost-identity.json'}

Root conjoined179+180. Exact263 Source inputs stayed unchanged throughout181: one accepted semantics.ts difference and262 conserved relative26. All263 normal declarations remain byte-exact26.934 generated outputs reconcile to931 unchanged and exactly semantics.js/capability graph/manifest; semantics.js equals accepted179 emission. All5265 archive paths/types/modes match26, with5262 unchanged bodies; all5265 installed bodies equal archive, with only the two existing declared CLI644→755 mode consequences. Package/dependencies and three pinned dependency fixtures conserved; no campaign/app/test payload leakage.

Public catalog75 rows is byte/value exact26. Complete canonical owners recomputed {meta['capabilityDifferenceCount']} capability and {len(members['exactContributionIdentityConsequences'])} contribution identity consequences,15 native declaration closures/50 native locator rows/23 typed contract digests,10 module publications/47 contributions. No semantic or digest fields omitted.

Build {receipts['build']['wallMs']/1000:.3f}s; pack {receipts['pack']['wallMs']/1000:.3f}s; install {receipts['install-host27']['wallMs']/1000:.3f}s; actual installed verification {host['timings']['verifyWallMs']/1000:.3f}s. Each selected author/check receipt exit0/no signal/timeout/truncation/error.

Preserved failures: wrong documentary180 directory; unsupported all-raw-isolated-declaration byte-equality premise (first diff only property ordering); downstream ungated uncreated helper MODULE_NOT_FOUND with zero pack/install effects. Root selected phase-only literal lookup, exact normal declaration/authorized JS/canonical closure proof, and strict awaited-result sequencing. No Source/compiler/config changes or successful build rerun.

{limits} Source controlled proofs are bounded. Current installed source-use/private preparation/native continuation remains HOLD. Historical26 and selected stopped/source/handoff controls are conserved. Effects stopped; Root selects independent182 review and any later preparation.
'''
with (p/'return.md').open('x') as f:f.write(text)
put(p/'freeze.json',{'kind':'writer_publication_freeze','role':'Publication Writer181','closed':closed,'readiness':pin(p/'readiness.json'),'return':pin(p/'return.md'),'candidateFreeze':pin(c/'freeze.json'),'candidateIdentity':pin(c/'identity.json'),'evidencePins':evidence,'limits':limits})
print(json.dumps({'return':pin(p/'return.md'),'readiness':pin(p/'readiness.json'),'freeze':pin(p/'freeze.json'),'candidateIdentity':pin(c/'identity.json'),'candidateFreeze':pin(c/'freeze.json'),'archive':archive,'host':pin(h/'exacthost-identity.json'),'content':par['productContentDigest'],'manifest':par['canonicalManifestDigest'],'evidenceCount':len(evidence),'effectsStopped':True}))
