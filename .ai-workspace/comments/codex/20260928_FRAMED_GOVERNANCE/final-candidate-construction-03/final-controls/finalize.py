from pathlib import Path
import datetime, hashlib, json, stat
D=Path(__file__).resolve().parent.parent
G=D.parent; C=G/'final-candidate-construction-02'; W=G/'f11-carrier-realization-01'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text())
def save(n,v):
 with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def verify(root,rows):
 for r in rows:
  p=root/r['path']
  if r.get('kind')=='symlink': assert p.is_symlink() and str(p.readlink())==r['target'],str(p)
  else:
   assert p.is_file() and not p.is_symlink() and p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
   if 'mode' in r: assert stat.S_IMODE(p.stat().st_mode)==r['mode'],str(p)
def inventory(root):
 rows=[]
 for p in sorted(root.rglob('*')):
  if p.is_symlink(): rows.append({'path':str(p.relative_to(D)),'kind':'symlink','target':str(p.readlink())})
  elif p.is_file(): rows.append({'path':str(p.relative_to(D)),'kind':'file','bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)})
 return rows

assert read(D/'construction-execution-grant.json')['activation']=='T287_RC1_SUCCESSOR_CONSTRUCTION_03'
assert not (D/'final-freeze.json').exists()
for label in read(D/'final-budgets.json')['operationCapsMs']:
 record=read(D/('final-'+label+'.json'))
 assert record['exitCode']==0 and not record['timedOut'] and record['ownedExitObserved'],label
verify(D,read(D/'final-preserved-preparation.json'))
pending=read(D/'pending-postimage-selection.json')['entries']
for r in pending:
 if 'heldPostimage' in r: verify(D,[r['heldPostimage']])
for r in read(D/'donor-rebinding.json')['records']:
 verify(D,[r['donor']])
 if 'guardedSuccessor' in r: verify(D,[r['guardedSuccessor']])
 if 'guardedSuccessor' not in r and 'guardedSuccessor' in r: raise AssertionError(r)
# The original fifteen omissions and preparation source copies remain exactly as closed.
for r in pending:
 if r.get('class') in ['authorized_current_authority_tracking_method','independently_accepted_law_delta']:
  for root in [D/'source-freeze/repo',D/'staged-repo']:
   assert not (root/r['path']).exists(),str(root/r['path'])
assert sha(D/'preparation-freeze.json')=='dad93850afa6ffc8268d46baeebedb439583fd3221a91208b92c25b6a29ad3ed'
assert sha(C/'freeze.json')=='7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469'
assert sha(G/'final-qualification-inputs-02/freeze.json')=='a4c2b5afd94fd7402b6bbfc732e691eb345dbcf4334a0300de490f607b9aad79'
assert sha(C/'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz')=='766f748ae9806be95ae8ea124209130c2906ba8c93e172e4c919307ca437d747'
verify(D,read(D/'final-source-freeze-manifest.json')['members'])
tr='build_tenants/abiogenesis/typescript/'
for r in read(D/'final-source-members.json'):
 if not r['path'].startswith(tr+'contracts/qualification/'):
  p=D/'final-stage'/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],r['path']
for r in read(D/'final-generated-after.json'):
 p=D/'final-stage'/tr/r['path']; assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],r['path']
identity=read(D/'final-package-identity.json')
assert sha(Path(identity['artifactPath']))==identity['artifactDigest'][7:]
for r in read(D/'final-archive-members.json'):
 for root in [D/'final-stage'/tr,Path(identity['packageRoot'])]:
  p=root/r['path']; assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
stage_deps=inventory(D/'final-stage'/tr/'node_modules')
install_population=inventory(D/'final-install')
save('final-stage-dependency-population.json',stage_deps)
save('final-install-population.json',install_population)
selected=read(D/'final-selected-core.json')
generated=read(D/'final-generated-summary-corrected.json')
source=read(D/'final-source-members.json')
ops=[read(D/('final-'+label+'.json')) for label in read(D/'final-budgets.json')['operationCapsMs']]
cost={'preparationMs':read(D/'final-preparation-result.json')['elapsedMs'],
      'operationMs':sum(r['elapsedMs'] for r in ops),'operations':[{k:r[k] for k in ['command','elapsedMs','exitCode','timedOut']} for r in ops],
      'generatedCorrespondenceMs':read(D/'final-generated-summary.json')['elapsedMs'],
      'packageCorrespondenceMs':read(D/'final-package-correspondence.json')['elapsedMs'],
      'nativeModelProviderNetworkGitEffects':0,
      'basis':'actual owned command intervals plus finite mechanical preparation/correspondence; reasoning/report assembly is separate'}
save('final-costs.json',cost)
save('final-attribution.json',{'inputSourceOrigins':'final-source-members.json preserves complete inherited C02 row/origin, selected exact13 control origins and accepted25 postimage/preimage chain',
 'sourceCutAuthor':'/root/f11_carrier_design_worker under T287_F11_CARRIER_REALIZATION_01; actual delta17/25 retained',
 'lawDeltaAuthor':'/root/f11_binding_plan under T287_F11_LAW_STAGE_REPAIR_01, then separately attributed carrier delta over the accepted generator/test postimages',
 'HOWAuthor':'/root/f11_carrier_design_worker; accepted exact744a930be…',
 'authorityPostimageBindingAuthor':'Root Writer T287_RC1_SUCCESSOR_CONSTRUCTION_SELECTION_03; source authorship is retained, binding/copying does not replace it',
 'copyConstructionReportAuthor':'/root/rc1_successor_builder',
 'derivedOutputs':'Existing clean/TypeScript/qualification generator/Product manifest owners in this exact stage; deterministic construction is not admitted runtime',
 'sourceMutation':False,'ambientGeneratedMutation':False,'qualificationActorIndependence':'future genuine assessment must bind actual authors/assessors, not infer independence from this copying role'})
save('final-preservation-verification.json',{'status':'verified','closedPreparationRecordCopiesVerified':len(read(D/'final-preserved-preparation.json')),
 'heldLawPostimagesVerified':2,'knownPendingSourceAbsencesPreserved':15,
 'C02ArchiveAndFreezePreserved':True,'Q02FreezePreserved':True,'acceptedCarrierFreezeSHA256':sha(W/'freeze.json'),
 'ordinaryStageInputConservation':{'sourceMembers':len(source),'declaredDerivedAuthorityPreimages':generated['derivedAuthorityInputPreimages'],
 'changedDerivedAuthorityPreimages':generated['derivedAuthorityInputsChanged'],'allOtherSourceStageInputsByteExact':True},
 'scope':'Actual input/source/archive bodies and original closed preparation physical copies; old runtime stores were never opened or written by this activation'})

text=f'''T287_RC1_SUCCESSOR_CONSTRUCTION_03 is CLOSED with `construction_ready`. The sole C03 prospective archive is physically built and installed under STDO 2.5.1 RC2. This return is readiness evidence, not qualification, publication or an ABG-admitted ProductInstall.

Product frame: the fixed fifteen families remain F01–F07, F09–F11, F13–F17. F11 supplies independently judged exact-candidate assessment; F15 reduces the complete qualification through sole AF22 and keeps pre_rc_candidate distinct from installed_rc; F16 requires unchanged immutable publication, installed qualification, actual human acceptance and terminal installation. GTL declares, HoG traverses, existing owners effect, ABG alone admits, replay projects. No Product meaning, runtime authority, source implementation or dependency was changed by this construction Worker.

The input conjunction is independently accepted carrier source freeze `51bfa2ad75ab9d2c0858998c7e4a82a6e7a4269a4c277c842af07ae1c7f6da1c`, accepted HOW `744a930be51c7130480b22126acfbc6ec42c2c4fca07fcd762b76757e66d6d9b`, separately accepted law repair `a4bceff9b2b37913667998784fb3be36ddf9986950c4bb5117c891add697c872`, exact13 authority/tracking postimages, and original C02 source substrate. `final-source` and `final-stage` are new prefixes. The 1,106 frozen source inputs include 32 changes from C02 and three new paths. All 25 carrier postimages and all 13 authority postimages are retained with original origins/preimages; build/copy authorship does not replace semantic authorship. Frozen input manifest: `{sha(D/'final-source-freeze-manifest.json')}`.

Complete RC2 manifest and all 52 standards members verified before staging. Manifest `3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782`, member set `2f54671dfde54a6ad87347ac7190028af5e21021988247edf8068ab6248ef7e8`, Definition `eafbb85e640bd007b1e5b94bdc13ab4eb470c8dedaa3ae1a3b586687daf6869c`. The existing default-library RC1 runtime substrate is unchanged. Frozen Node24.7.0/npm11.5.1 and all16 locked archives were reverified; npm cache/config/prefix/TMPDIR are new confined paths and HOME is unchanged.

Dependency realization, clean, TypeScript compile, explicit RC2 authority staging, final Product manifest generation, one script-disabled pack and one offline script-disabled install passed. Actual source joins:95. Every one of the 2,137 rule spans matches its governing source. Actual coverage:16 claims/66 behaviors. Actual generated/derived population:926, including 830 generated assets and 96 authority input/source copies. The latter are intentional stage outputs over frozen input preimages; 12 changed under RC2. All other staged source inputs are conserved. Qualification preparation must distinguish these complete construction input preimages from current derived-stage authority rather than treating the old packaged RC1 preimages as governing law.

The complete current output population differs from actual C02 staged bodies at 45 paths, including two new emitted resource-module files. `final-comparison-triage.json` preserves an initial accounting-only count129 from comparing this broader population with C02's generated-only inventory. `final-generated-summary-corrected.json` and `final-generated-delta-corrected.json` supersede only that comparison. The originating relation was a mismatched comparator population; no source, generated output or runtime defect occurred and no rebuild/repack was required.

Archive: `{identity['artifactPath']}`
Archive SHA256: `{identity['artifactDigest']}`; {identity['archiveBytes']:,} bytes.
Installed package: `{identity['packageRoot']}`.
Product content: `{selected['basis']['productContentDigest']}`.
Canonical manifest: `{selected['basis']['manifestDigest']}`.
Public catalog: `{read(D/'final-product-verification-summary.json')['catalogDigest']}`.

All 5,258 package payload members are byte-exact across stage/archive/install; there are no extra or missing installed payload members. ProductVerificationPort.verify succeeded using this actual installed owner's packet and selectOwnedProductVerification returned that same nominal object in the process. Actual installed run_gaps semantic definition agrees with the staged definition. The complete 11 constructor population was derived from the exact selected generator, invoked from installed exports, raw/static validated and matched the installed verified contribution-manifest publication bindings. These checks do not admit an install or prove an ordinary Run.

Actual preparation and nine finite command intervals total {(cost['preparationMs']+cost['operationMs'])/1000:.3f}s, with generated/package correspondence {(cost['generatedCorrespondenceMs']+cost['packageCorrespondenceMs'])/1000:.3f}s separately recorded. No native/model/provider/network/Git/runtime-store effect occurred. All owned processes exited normally. Immutable preparation `dad93850…`, C02 archive/freeze and Q02 freeze were reverified; original source/build/worktree and old accepted runtime stores were not mutated.

The next dependency is Executive conjunction of this exact CLOSED candidate, then the ordinary controlled full-scope compact F11 assessment-to-admitted-J/closure/fresh-Public/cold-consumer discriminator on this installed subject. Its synthetic actor is mechanical proof, not genuine independent assessment. Remaining scenario/applicability joins, authenticated positive F11/seven defect cases, observed QUAL056, soleAF22 green, release and actual human acceptance remain open. Runtime/network work is not granted here. All construction writes stop with `final-freeze.json`.
'''
with (D/'final-return.md').open('x') as f:f.write(text)
records=[]
for p in sorted(D.rglob('*')):
 rel=str(p.relative_to(D))
 if not (p.is_file() and not p.is_symlink()):continue
 if rel=='construction-execution-grant.json' or (rel.startswith('final-') and not rel.startswith(('final-stage/','final-source/','final-law/','final-install/','final-npm-cache/','final-tmp/','final-npm-prefix/'))):
  records.append({'path':rel,'kind':'file','bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)})
frozen={'status':'CLOSED','workResult':'construction_ready','activation':'T287_RC1_SUCCESSOR_CONSTRUCTION_03',
 'actor':'/root/rc1_successor_builder','role':'Worker','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'return':'final-return.md','sourceFreeze':{'path':'final-source-freeze-manifest.json','sha256':sha(D/'final-source-freeze-manifest.json')},
 'records':records,'recordCount':len(records),'package':identity,'selected':selected,
 'completeSourceMembers':len(source),'actualGenerated':generated,'publicationCount':11,
 'sourceStagePackageInstallCorrespondence':'final-package-correspondence.json',
 'installedPayloadInventory':'final-archive-members.json','completePhysicalInstallInventory':'final-install-population.json',
 'completeStageDependencyInventory':'final-stage-dependency-population.json',
 'preservedPreparationFreezeSHA256':sha(D/'preparation-freeze.json'),
 'basis':read(D/'final-law-verification.json'),'readiness':{'physicalInstalledOwnerVerification':True,
 'sameProcessNominalSelection':True,'complete11StaticPublications':True,'manifestBindingEquality':True,
 'ordinaryRuntime':False,'qualification':False,'publication':False},
 'effects':{'sourceRepair':0,'ambientGenerated':0,'dependenciesOffline':1,'compile':1,'selectedAuthorityStage':1,
 'ProductManifestGeneration':1,'pack':1,'offlineInstall':1,'nativeModelProviderNetworkRuntimeStoreGit':0},
 'costs':'final-costs.json','attribution':'final-attribution.json','limits':'final-return.md',
 'stop':'All construction Worker writes closed. Executive independently conjoins before any new runtime activation.'}
save('final-freeze.json',frozen)
verify(D,records)
print(json.dumps({'status':'CLOSED','workResult':'construction_ready','freezeSHA256':sha(D/'final-freeze.json'),
 'freezeBytes':(D/'final-freeze.json').stat().st_size,'recordCount':len(records),'archiveDigest':identity['artifactDigest'],
 'productContentDigest':selected['basis']['productContentDigest'],'manifestDigest':selected['basis']['manifestDigest']}),flush=True)
