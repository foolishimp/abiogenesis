from pathlib import Path
import datetime, hashlib, json, shutil, stat

D=Path(__file__).resolve().parent.parent; G=D.parent
R=Path('/Users/jim/src/apps/abiogenesis'); C=G/'final-candidate-construction-09'
TR='build_tenants/abiogenesis/typescript/'
OP='T287_G1_G3_C10_CONSTRUCTION_01'; ACTOR='/root/rc1_c03_install_review'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text())
def pin(p):
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)}
def save(name,obj):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(obj,f,indent=2);f.write('\n')
def copy(p,q):
 assert p.is_file() and not p.is_symlink();q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists();shutil.copy2(p,q)
 assert q.read_bytes()==p.read_bytes();return pin(q)
grant=G/'rc1-library-closure-controls-01/c10-construction-grant.txt'
assert sha(grant)=='7f254642a603b1f90e7ce2a992f11c60bf84119a845a42f10687171a07d07a86'
assert sha(C/'final-freeze.json')=='c450c19f0c6cdb1475754ba2f6ddc9b3c442e477a2c77678c181487a22f7d3bb'
g1=G/'g1-self-conformance-conservation-01/freeze.json';g3=G/'g3-parent-alias-fixture-01/freeze.json'
assert sha(g1)=='8dd2269955829b3e5d2b62f6f3540896c31bb074bf570019e80b75b6957da730'
assert sha(g3)=='153a3eced2061acbb7b32c96904ad791d667186dcd4e3121fb4a9dbc80262e2c'
g3original=G/'rc1-parent-alias-owner-repair-01/freeze.json'
assert sha(g3original)=='6d5ab742d9ebf2a730e7d776aa2911c58503d0dc40c2928f18fa72eb3a305d2e'
selected=[
 ('code/src/validator/self_conformance.ts',29339,'5183bce7a986462eb2d924fdd288cef23439dc72811f4047f3d964a286e46537','G1_FINDING_CONSERVATION',g1),
 ('code/src/abg/qualification_proof.ts',82284,'b928caefff4aa9bbd5e3e0d6fdb65f4a9617d54b3df817df287975825d36c9e5','/root/q03_input_review under T287_RC1_PARENT_ALIAS_OWNER_REPAIR_01',g3original),
 ('test_env/tests/t287-qualification-scopes.test.mjs',43068,'a1e00db17056aebcd22186acdc87d2bd7d68985889d4572d81d0eedfdc85b051','G1_FINDING_CONSERVATION',g1),
 ('test_env/tests/t287-qualification-parent-alias.test.mjs',15438,'4e6ce1f8049017be0d480d71052bf4066e5c8c0fda669f3cd2611df250c179f8','T287_G3_PARENT_ALIAS_FIXTURE_CONTINUATION_01',g3),
 ('design/T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN.md',26624,'7e8b887eaf0c73187cdfdb72ec157500ef5ca383087a69c5242cf4590efe3cd4','Root documentary Writer accepted reusable-library target',grant),
 ('design/T287_F11_CARRIER_RESOURCE_DESIGN.md',41920,'8547907d297ee2736f47c13035372c2623abac0bac3f01e695af7817b930d06b','Root documentary Writer accepted native qualification HOW',grant)]
for rel,n,h,author,auth in selected:
 p=R/(TR+rel);assert p.stat().st_size==n and sha(p)==h and stat.S_IMODE(p.stat().st_mode)==0o644,(str(p),pin(p))
prior=read(C/'final-source-members.json');by={r['path']:r for r in prior};members=[];prior_manifest_pin=pin(C/'final-source-members.json')
for r in prior:
 p=C/'final-source'/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'] and stat.S_IMODE(p.stat().st_mode)==r['mode'],r['path']
 members.append({**r,'origin':str(p),'selectedRelation':'immutable_C09_input_preimage','C09SourceProvenance':{'manifest':prior_manifest_pin,'memberPath':r['path'],'priorTuple':{k:r[k] for k in ['path','bytes','sha256','mode']}}})
member_by_path={r['path']:r for r in members};replacements=[];additions=[];input_pins=[]
for rel,n,h,author,auth in selected:
 path=TR+rel;p=R/path;old=by.get(path)
 origin=D/'controls/accepted-postimages'/path;copy(p,origin);input_pins.append(pin(p))
 row={**(member_by_path[path] if old else {}),'path':path,'origin':str(origin),'bytes':n,'sha256':h,'mode':0o644,'sourceAuthor':author,'originalSource':str(p),'originalAuthorship':author,'selectedRelation':'accepted_G1_G3_source_component' if rel.startswith(('code/','test_env/')) else 'accepted_owning_design_authority','sourceAuthorship':pin(auth),'preimage':pin(C/'final-source'/path) if old else None}
 if old:members[members.index(member_by_path[path])]=row;replacements.append(row)
 else:members.append(row);additions.append(row)
members.sort(key=lambda r:r['path']);assert len(members)==1113 and len(replacements)==4 and len(additions)==2
save('activation.json',{'activation':OP,'actor':ACTOR,'role':'Worker','allSevenSectionsRead':True,'effectTerritory':str(D),'grant':pin(grant),'activatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'newTerritoryInitiallyAbsent':True,'onlyInitialFile':'final-controls/initialize.py','defaultHeapAndHOMEUnchanged':True})
copy(grant,D/'controls/request.txt')
cut={'sourceCutAuthor':ACTOR+' selected copy under '+OP+'; original semantic authors retained','sourceCount':len(members),'members':members,'replacements':replacements,'additions':additions,'acceptedSourceAuthorship':pin(g1),'acceptedTestFixtureAuthorship':pin(g3),'acceptedSourceFreezeSha256':sha(g1),'acceptedSourceReviewFreezeSha256':'Root grant conjoins independently accepted G1/G3 component assurance; no new installed proof','acceptedSourceDependencies':[pin(g1),pin(g3original),pin(g3)],'unchangedAcceptedTracking':'C09 Goals/T287 remain immutable historical selected inputs; no current G2 drafts or mutations selected'}
save('controls/source-cut.json',cut)
basis={'kind':'explicit_root_selected_tool_operation_basis','operation':OP,'actor':ACTOR,'phase':'accepted_G1_G3_bounded_development_successor','effectTerritory':str(D),'sourceCut':pin(D/'controls/source-cut.json'),'acceptedBuilder':pin(C/'final-freeze.json'),'sourcePopulationRelation':{'priorCandidate':str(C/'final-source'),'authorizedAdditions':[{k:r[k] for k in ['path','bytes','sha256','mode']} for r in additions],'actualExistingMembers':len(prior),'actualChangedExistingMembers':len(replacements),'descriptivePreimageStringsAreExecutableAuthority':False}}
save('controls/operation-basis.json',basis)
accept={'status':'ROOT_ACCEPTED_G1_G3_SOURCE_COMPONENT_ONLY','sourceReview':pin(grant),'closedDependencies':[pin(g1),pin(g3original),pin(g3),pin(C/'final-freeze.json')],'sourceAcceptanceOwner':'Root Executive explicit current seven-section grant','limit':'source/component evidence with supplied lower premises; neither installed native nor genuine qualification'}
save('controls/acceptance.json',accept)
config={'operationBasisSHA256':sha(D/'controls/operation-basis.json'),'sourceCutSHA256':sha(D/'controls/source-cut.json'),'sourceAcceptanceSHA256':sha(D/'controls/acceptance.json'),'sourceReview':pin(grant),'priorCandidateRoot':str(C),'sourceCount':1113,'changedCount':4,'addedCount':2,'unchangedCount':1107,'priorMemberCount':1111,'baselineSourceFreezeSHA256':sha(C/'final-freeze.json'),'requestSHA256':sha(grant),'baselineArtifactDigest':'sha256:fb5517bd32afeca44a9236f73137e0ecdcc3eb21cf94a6ad0d5681af74d89122','sourceEmittedPaths':['build/code/src/validator/self_conformance.js','build/code/src/validator/self_conformance.d.ts','build/code/src/abg/qualification_proof.js','build/code/src/abg/qualification_proof.d.ts'],'newSourceEmittedPaths':[],'permittedDerivedIdentityChanges':['contracts/capabilities/capability-definition-graph.json','product-toolchain-manifest.json'],'typescriptEmitOptions':{'rootDir':'code/src','outDir':'build/code/src','declaration':True,'stripInternal':True,'noEmitOnError':True}}
save('builder-inputs.json',config)
decl=G/'g3-parent-alias-fixture-01/stage/build/code/src/abg/qualification_proof.d.ts';assert sha(decl)=='cf2c82a34cdab62885dce9f985fc7ff12a2089228f023f5c0dbc7d96ed22cec9'
triage={'operation':OP,'owner':'actual accepted G3 compiled declaration component; wrapper immutable dependency owns IDs/version/caps, not body digests','baseline':pin(C/'final-freeze.json'),'component':pin(g3),'allowedExistingDeclarationDeltas':[{'path':'build/code/src/abg/qualification_proof.d.ts','bytes':7924,'sha256':sha(decl),'mode':0o644,'actualAcceptedDeclaration':pin(decl)}],'allowedDeclarationAddition':None,'requiredBodyCount':309,'contractAndCapabilityIdentities':'three contract/two capability IDs unchanged; all37 current native rows and16/196 capability graph must be authenticated','historicalTypedAmendment':pin(C/'controls/native-dependency-triage.json')}
save('controls/native-dependency-triage.json',triage)
save('source-selection-preflight.json',{'status':'EXACT_SELECTED_SOURCE_BEFORE_BUILD','memberCount':1113,'actualPriorMembers':1111,'replacements':[{k:r[k] for k in ['path','bytes','sha256','mode','sourceAuthor','preimage']} for r in replacements],'additions':[{k:r[k] for k in ['path','bytes','sha256','mode','sourceAuthor']} for r in additions],'canonicalSelectedPins':input_pins,'noG2SourceOrDrafts':True,'allOriginalAttributionsRetainedOrAccessibleThroughExactC09RowReference':True,'copyBuildAuthor':ACTOR+' under '+OP,'noRuntimeQualificationCredit':True})
donors=[];changes=[]
for p in sorted((C/'final-controls').iterdir()):
 if not p.is_file() or p.is_symlink():continue
 text=p.read_text();before=text
 text=text.replace('adc8cb93426b08877e44ea6484acf5e532ba73f182b54365d1ab308b20a2206b',sha(D/'controls/operation-basis.json'))
 text=text.replace('b93750a282875adc0f792c36d9e8ac221a966143297c4b7e156234db6b3e8f60',sha(D/'builder-inputs.json'))
 text=text.replace('ec98cd863ec170ec1190340f2a16439ab3c8125a6da0dd2a80824f9d67a39169',sha(D/'controls/native-dependency-triage.json'))
 if p.name=='prepare.py':
  text=text.replace('prior accepted C08 physical assurance reused','prior accepted C09 physical assurance reused')
  text=text.replace('same accepted finite C08 builder and sixteen archives plus exact typed-source/Design/tracking and two additions','same accepted finite C09 builder and sixteen archives plus exact accepted G1/G3 Source/test/Design overlays')
 if p.name=='finalize.py':
  text=text.replace('C08','C09').replace('Setup09','Setup10')
  text=text.replace('unchanged accepted C09 bodies','unchanged accepted C09 bodies').replace('typed Source/HOW/tracking replacements','accepted G1/G3 Source/test/HOW replacements').replace('typed-module/test additions','parent-test/reusable-library target additions')
  text=text.replace('Fixed15/T287/STDO2.5.1RC2/HOW5.1.','Fixed15/T287/STDO2.5.1RC2/accepted native qualification HOW. C10 is a bounded development witness, not the final qualifying Product.')
  text=text.replace('all11 actual publication constructors/validators/manifest bindings passed.','all11 existing actual publication constructors/validators/manifest bindings passed. Required PUBLIC005 eight groups and PUBLIC006A 25 missing mandatory identities remain unimplemented in this cut; no mandatory-publication completeness credit.')
  text=text.replace('fullRequiredWrapperContractCapabilityCompatibility','fullRequiredWrapperContractCapabilityCompatibility')
 if p.name=='compare-wrapper.mjs':
  text=text.replace('Historical predecessor equality is not a dependency; exact3pinned declarations and1shared addition are the only admitted native inventory deltas.','Historical predecessor equality is not a dependency; only the exact accepted G3 qualification_proof.d.ts body delta is admitted, with no native additions.')
 q=D/'final-controls'/p.name;assert not q.exists();q.write_text(text);donors.append(pin(p));changes.append({'path':str(q.relative_to(D)),'donor':pin(p),'current':pin(q),'bindingOnlyOrReportChanges':text!=before})
save('algorithm-donors.json',{'records':donors,'currentScripts':changes,'reusedAlgorithm':'C09 exact managed immutable source/law/build/package/bootstrap/publication/wrapper constructor','rebindings':'current operation/input/triage exact hashes; baseline already dynamic; current report scope; no Product/source repairs'})
save('preflight-ready.json',{'status':'SOURCE_AND_CONSTRUCTOR_BOUND_BEFORE_FIRST_BUILD','sourceCutSHA256':sha(D/'controls/source-cut.json'),'operationBasisSHA256':sha(D/'controls/operation-basis.json'),'builderInputsSHA256':sha(D/'builder-inputs.json'),'declarationTriageSHA256':sha(D/'controls/native-dependency-triage.json'),'dependencyPreimages':{'C09':pin(C/'final-freeze.json'),'G1':pin(g1),'G3Original':pin(g3original),'G3FinalFixture':pin(g3)},'processesStarted':0,'SourceTestsSelected':0,'onlyWriteRoot':str(D)})
print(json.dumps({'status':'CURRENT_EXACT_CONSTRUCTOR_PREPARED','members':len(members),'replacements':len(replacements),'additions':len(additions),'basisSHA256':sha(D/'controls/operation-basis.json'),'inputSHA256':sha(D/'builder-inputs.json')}),flush=True)
