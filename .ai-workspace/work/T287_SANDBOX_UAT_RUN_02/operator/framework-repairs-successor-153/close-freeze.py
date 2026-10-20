import json, pathlib, hashlib, datetime
r=pathlib.Path('/Users/jim/src/apps/abiogenesis');t=r/'build_tenants/abiogenesis/typescript';w=r/'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';p=w/'operator/framework-repairs-successor-153';c=w/'candidate-26';h=p/'host-preparation'
def load(path):return json.loads(path.read_text())
def pin(path):
 assert path.is_file() and not path.is_symlink(),str(path)
 b=path.read_bytes();return {'path':str(path),'sha256':hashlib.sha256(b).hexdigest(),'byteCount':len(b)}
def require(row):assert pin(pathlib.Path(row['path']))=={k:row[k] for k in ('path','sha256','byteCount')},row['path']
def put(path,value):
 with path.open('x') as f:f.write(json.dumps(value,indent=2)+'\n')
inp=load(p/'inputs.json');delta=load(p/'generated-delta.json');sources=load(p/'source-preimages.json')
for row in sources+inp['selectedPostimages']+inp['protectedPins']+inp['sourceAccepted']+delta['postGenerated']:require(row)
for k in ('candidate25Identity','candidate25Freeze','candidate25Archive','existingPublicationMethod','sourceConjunction','prior148Freeze','prior148FirstCause'):require(inp[k])
actualGenerated={str(f.relative_to(t)) for root in [t/'build',t/'contracts'] for f in root.rglob('*') if f.is_file()};actualGenerated.add('product-toolchain-manifest.json')
assert actualGenerated=={x['relativePath'] for x in delta['postGenerated']}
assert {str(f) for f in (t/'code/src').rglob('*.ts')}=={x['path'] for x in sources} and len(sources)==263
archive=load(c/'archive.json')['archive'];require(archive)
par=load(p/'essential-parity.json');meta=load(p/'metadata-parity.json');members=load(c/'member-delta.json');host=load(h/'exacthost-identity.json');match=load(h/'installed-content-match.json')
assert par['productContentDigest']==host['productContentDigest'];assert par['canonicalManifestDigest']==host['manifestDigest'];assert match['matches'] and host['allArchiveBytesEqual']
assert members['memberCount']==5265 and len(members['exactComposedFrozenDelta'])==len(delta['changed'])
receipts={}
for stem,root in [('build',p),('pack',c),('essential-parity',p),('metadata-parity',p),('member-comparison',p),('extract',p),('extracted-joins',p),('clean-host',p),('install-host26',h)]:
 v=load(root/'commands'/f'{stem}.result.json');assert v['exitCode']==0 and v['signal'] is None and not v['timedOut'] and not v['truncated'] and v['failure'] is None
 receipts[stem]={'receipt':pin(root/'commands'/f'{stem}.result.json'),'wallMs':v['wallMs'],'exitCode':0,'signal':None,'timedOut':False,'truncated':False,'failure':None}
closed=datetime.datetime.now(datetime.timezone.utc).isoformat()
conservation={'productionSourceCount':263,'allProductionSourceBytesEqualPre153':True,'sourceDeltaFrom25':{'acceptedChanged':12,'unchanged':251,'record':pin(p/'source-delta.json')},'generatedCount':934,'exactPackageDeltaCount':len(delta['changed']),'unchangedFrom25':delta['unchanged'],'partial148DeltaCount':len(delta['changedFromPartial148']),'all263JavaScriptAndOther261DeclarationsEqualPartial148':True,'selected19SourceHowTestPostsAndProtectedPinsConserved':True,'candidate25ArchiveIdentityFreezeAnd148FailureConserved':True,'record':pin(p/'generated-delta.json')}
put(p/'conservation.json',conservation)
limits='Publication/physical installed payload proof only. Actual current Source-use/D2/private preparation/FP-to-HoG/native Testing/currentness/C2/UAT/P0/release remain OPEN; no model, Run, event resource acquisition, app, Source, Git, version or lock effects.'
conjunction='Root accepted exact138 + independent143/147 + cumulative142/145/146 +151/152 after actual148 TS2305 closure refusal. Controlled138/143 units and145 controlled F_D realizer/genuine lower owners remain bounded, not installed FP completion. 148 is immutable;151 supersedes only the two private-property declaration posts and pending HOW.'
manifestPath=c/'scratch/successor/package/product-toolchain-manifest.json';manifest=load(manifestPath)
identity={'status':'immutable_unreleased_candidate_pending_independent_publication_review','candidate':26,'closed':closed,'archive':archive,'productId':manifest['productId'],'packageName':manifest['packageName'],'packageVersion':manifest['packageVersion'],'sourceCommit':'727f1dbcab3c198f7704735fdf91b994b7aac243','sourceCommitMeaning':'Historical campaign checkpoint only; exact accepted dirty Source is bound by frozen input and source inventories.','acceptedSource':inp['sourceAccepted'],'sourceConjunction':conjunction,'predecessor25':{k:inp[k] for k in ('candidate25Identity','candidate25Freeze','candidate25Archive')},'productContentDigest':par['productContentDigest'],'manifestDigest':par['canonicalManifestDigest'],'rawManifest':pin(manifestPath),'catalogDigest':manifest['publicContractCatalog']['catalogDigest'],'capabilityDefinitionGraph':manifest['capabilityDefinitionGraph'],'contributionManifestDigest':manifest['contributionManifestDigest'],'members':{'count':5265,'samePathsTypesModes':True,'changed':len(delta['changed']),'unchanged':5265-len(delta['changed']),'memberDelta':pin(c/'member-delta.json'),'tarInventory':pin(c/'tar-inventory.json')},'canonicalConsequences':{'publicRows':par['publicCatalogRows'],'publicNonDigestMeaningConserved':True,'catalogDifferenceCount':len(members['catalogDifferences']),'capabilityDifferenceCount':meta['capabilityDifferenceCount'],'capabilityDifferenceKeyCounts':meta['capabilityDifferenceKeyCounts'],'contributionDifferenceCount':len(members['exactContributionIdentityConsequences']),'allValuesRecomputedThroughOwners':True,'nativeDeclarationClosures':meta['nativeClosures'],'publications':par['publications'],'contributions':par['contributions']},'installedHostSelector':pin(h/'exacthost-identity.json'),'installedContentMatch':pin(h/'installed-content-match.json'),'sourceAndGeneratedConservation':pin(p/'conservation.json'),'timings':{k:v['wallMs'] for k,v in receipts.items()},'actualInstalledVerifyWallMs':host['timings']['verifyWallMs'],'effects':'Only153/candidate26/new offline host plus normal generated outputs; no Source/old archive/worksite/event/Git effects.','runtimeReentry':'HOLD pending separate installed Source-applicability/D2/current-use proof and explicit Root grant.','limits':limits}
put(c/'identity.json',identity)
paths=[p/'activation.json',p/'inputs.json',p/'source-preimages.json',p/'source-delta.json',p/'generated-preimages.json',p/'generated-delta.json',p/'conservation.json',p/'preimages/product-toolchain-manifest.json',p/'preimages/contracts/capabilities/capability-definition-graph.json',p/'run-command.mjs',p/'publication.mjs',p/'member-comparison.py',p/'essential-parity.mjs',p/'metadata-parity.mjs',p/'extracted-joins.py',p/'close-freeze.py',p/'essential-parity.json',p/'metadata-parity.json',p/'public-catalog-diff.json',p/'contribution-diff.json',p/'capability-diff.json',c/'archive.json',c/'identity.json',c/'member-delta.json',c/'tar-inventory.json',manifestPath,c/'scratch/successor/package/contracts/capabilities/capability-definition-graph.json',h/'inputs.json',h/'host-preparation.mjs',h/'exacthost-identity.json',h/'installed-content-match.json',h/'installed-members.json',h/'host26-acquisition.json',h/'host/package.json',h/'host/package-lock.json']
for root in [p/'commands',c/'commands',h/'commands']:paths.extend(sorted(f for f in root.iterdir() if f.is_file()))
paths.extend(pathlib.Path(row['path']) for row in inp['sourceAccepted']+inp['selectedPostimages']+inp['protectedPins'])
paths.extend(pathlib.Path(inp[k]['path']) for k in ('candidate25Identity','candidate25Freeze','candidate25Archive','existingPublicationMethod','prior148Freeze','prior148FirstCause'))
paths.append(pathlib.Path(archive['path']))
evidence=[pin(path) for path in sorted(set(paths))]
put(c/'freeze.json',{'kind':'immutable_candidate_publication_freeze','candidate':26,'closed':closed,'identity':pin(c/'identity.json'),'archive':archive,'subject':conjunction,'evidencePins':evidence,'limits':limits})
readiness={'role':'Publication Writer153','disposition':'READY_FOR_INDEPENDENT_PUBLICATION_REVIEW','closed':closed,'frame':'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration','basis':'Fixed15 ABI5.0 GOAL035/T287 STDO2.5.1rc2 manifest3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782','rootConjunction':conjunction,'candidateIdentity':pin(c/'identity.json'),'candidateFreeze':pin(c/'freeze.json'),'archive':archive,'contentDigest':par['productContentDigest'],'manifestDigest':par['canonicalManifestDigest'],'installedHost':pin(h/'exacthost-identity.json'),'checks':receipts,'actualVerifyWallMs':host['timings']['verifyWallMs'],'conservation':conservation,'publicCatalogRows':75,'fullCanonicalOwnerCorrespondence':True,'installedArchiveBytes':5265,'modeConsequences':host['modeDifferences'],'lockedDependencyFixtures':host['existingDependencyFixtures'],'effectsStopped':True,'runtimeReentry':'HOLD','limits':limits,'evidencePins':evidence}
put(p/'readiness.json',readiness)
returnText=f'''Publication153 is CLOSED: one normal build, one pack and one clean offline install/source-blind owner verify passed. Candidate26 is immutable and unreleased, pending independent publication review.

Root conjoined accepted138+143/147+cumulative142/145/146+151/152. The actual148 TS2305 failure and partial generation remain immutable.151 repaired only the private declaration boundary; original closure checks passed unchanged. Controlled Source unit premises remain explicitly bounded.

Archive {archive['sha256']} / {archive['byteCount']}B
Content {par['productContentDigest']}
Canonical manifest {par['canonicalManifestDigest']}
Identity {c/'identity.json'}
Clean host selector {h/'exacthost-identity.json'}

Exact263 Source preserved (12 accepted changes/251 unchanged relative25).934 generated outputs reconciled:19 package deltas,915 unchanged;148→153 differs only at2 private declarations and canonical capability/manifest outputs. All5265 tar paths/types/modes agree with25;5246 bodies unchanged. All5265 installed bodies match; only2 declared CLI bin644→755 consequences. Package/dependencies/assets/3 allowed fixture identities conserved; campaign/app/test payloads excluded.

All75 Public non-digest meanings conserved;210 catalog,551 capability and62 contribution identity differences are fully recomputed through canonical owners.15 declaration closures/50 locator rows/23 typed contract digests;10 publications/47 contributions. No digest fields omitted.

Build {receipts['build']['wallMs']/1000:.3f}s; pack {receipts['pack']['wallMs']/1000:.3f}s; install {receipts['install-host26']['wallMs']/1000:.3f}s; actual source-blind verification {host['timings']['verifyWallMs']/1000:.3f}s. Every receipt exit0/no signal/timeout/truncation/error.

{limits} Candidate24/25, stopped136 and all selected historical/source/package/lock bytes conserved. Runtime re-entry is HOLD; no current-source compatibility or old producer migration claimed. Effects stopped; Root selects independent review and any subsequent source-applicability proof.
'''
with (p/'return.md').open('x') as f:f.write(returnText)
put(p/'freeze.json',{'kind':'writer_publication_freeze','role':'Publication Writer153','closed':closed,'readiness':pin(p/'readiness.json'),'return':pin(p/'return.md'),'candidateFreeze':pin(c/'freeze.json'),'candidateIdentity':pin(c/'identity.json'),'evidencePins':evidence,'limits':limits})
print(json.dumps({'return':pin(p/'return.md'),'readiness':pin(p/'readiness.json'),'freeze':pin(p/'freeze.json'),'candidateIdentity':pin(c/'identity.json'),'candidateFreeze':pin(c/'freeze.json'),'archive':archive,'host':pin(h/'exacthost-identity.json'),'evidenceCount':len(evidence),'effectsStopped':True}))
