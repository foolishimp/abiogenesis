"""Final byte/identity closure. No test, build, helper or Product owner calls."""
import ast
import datetime
import hashlib
import json
import pathlib
import stat
import time

REPO=pathlib.Path('/Users/jim/src/apps/abiogenesis')
G=REPO/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q=G/'final-qualification-inputs-04'
C=G/'final-candidate-construction-03'
T=C/'final-stage/build_tenants/abiogenesis/typescript'
AMBIENT=REPO/'build_tenants/abiogenesis/typescript'
PREVIOUS=G/'final-qualification-inputs-03'
assert not (Q/'freeze.json').exists(), 'one new CLOSED freeze'
started=time.monotonic()

def read(p):return json.loads(pathlib.Path(p).read_bytes())
def sha(raw):return hashlib.sha256(raw).hexdigest()
def canonical(x):return json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def pin(p):
    p=pathlib.Path(p);b=p.read_bytes()
    return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def put(n,x):(Q/n).write_text(json.dumps(x,indent=2)+'\n')
def exact(row,p=None):
    p=pathlib.Path(p if p is not None else row['path']);actual=pin(p)
    assert (actual['bytes'],actual['sha256'])==(row['bytes'],row['sha256']),str(p)

checks=[]
def check(name,detail):checks.append({'check':name,'passed':True,'detail':detail})
grant=pin(Q/'request.txt')
assert (grant['bytes'],grant['sha256'])==(4493,'bc5f065d7e82e04296ba258dad8c7a51f45d8951843ce196661980da06549dcd')
assert read(Q/'activation.json')['readBeforeEffects']['allSevenGrantSections']
check('exact operation grant, independent NO_GO and explicit role transition',{'grant':grant,'receivedNO_GO':pin(G/'rc1-q04-and-native-scope-controls-01/received-q03-review.md')})

for p in Q.glob('*.json'):read(p)
for p in Q.glob('*.py'):ast.parse(p.read_text(),filename=str(p))
mechanical=read(Q/'mechanical-checks.json');syntax=read(Q/'syntax-checks.json');readiness=read(Q/'readiness-result.json')
assert mechanical['mechanicalChecks']==31 and all(c['passed']for c in mechanical['checks'])
assert len(syntax['checks'])==6 and all(c['result']['exit_code']==0 for c in syntax['checks'])
assert readiness['status']=='passed' and readiness['selectedCount']==6 and readiness['processExit']==0
assert all(c['passed']and not c['skip']and not c['todo']and c['error']is None for c in readiness['cases'])
check('all preparation JSON/Python syntax, 31 correspondences, six syntax-only checks and one existing six-case pass',{'nativeQualificationCommands':0,'actualExistingReadinessCommands':1})

inventory=read(Q/'qualification-inventory.json');origins=read(Q/'inventory-origin-correspondence.json')
body={k:v for k,v in inventory.items()if k not in ['inventoryRef','inventoryDigest']}
assert inventory['inventoryDigest']=='sha256:'+sha(canonical(body))
assert inventory['inventoryRef']=='qualification-inventory://abiogenesis/'+sha(canonical(body))
assert len(inventory['members'])==len(origins)==4554
members={m['ref']:m for m in inventory['members']}
for row in origins:
    m=members[row['ref']];p=pathlib.Path(row['origin']);raw=p.read_bytes()
    assert not p.is_symlink() and m['path']==row['path'] and m['digest']=='sha256:'+sha(raw)and m['byteCount']==len(raw)
check('all4554 inventory origins and canonical inventory identity exact',{'candidate':1936,'donorAliases':96,'additionalControlSuppliers':20})
protected=read(Q/'protected-inputs.json')
assert protected['counts']['total']==len(protected['members'])==3277
assert protected['bytes']==sum(r['bytes']for r in protected['members'])==251384737
for row in protected['members']:exact(row,row['origin'])
check('all3277 current protected origins still exact',{'bytes':protected['bytes'],'recipeFilesIncludingSelf':13})

preimages=read(Q/'preparation-preimages.json')
for row in preimages['members']:
    exact(row);assert stat.S_IMODE(pathlib.Path(row['path']).stat().st_mode)==row['mode']
assert len(preimages['members'])==3275
assert pin(PREVIOUS/'freeze.json')['sha256']=='5c7d8a66e37f1de412ba3ff1b3f6e84c6c22476ea1d77f11157cc95ba967ac14'
for row in read(PREVIOUS/'freeze.json')['records']:exact(row,PREVIOUS/row['path'])
assert pin(G/'final-qualification-inputs-02/freeze.json')['sha256']=='a4c2b5afd94fd7402b6bbfc732e691eb345dbcf4334a0300de490f607b9aad79'
for row in read(C/'final-source-members.json'):exact(row,C/'final-source'/row['path'])
check('all3275 prior protected bodies/modes, all42 Q03 records, Q02 freeze and all1106 C03 source preimages preserved',{'writesOutsideNewQ04':0})

expected=read(Q/'expected-output-inventory.json')
assert len(expected['paths'])==927
for row in expected['paths']:
    exact(row,T/row['path']);exact(row,AMBIENT/row['path'])
for root in [T,AMBIENT]:
    paths=[]
    for name in ['build','contracts','product-toolchain-manifest.json']:
        p=root/name
        paths.extend(str(f.relative_to(root))for f in ([p]if p.is_file()else p.rglob('*'))if f.is_file())
    assert sorted(paths)==sorted(r['path']for r in expected['paths'])
check('complete927 current C03 and ambient output populations unchanged',{'stagedRC2CatalogSHA256':pin(T/'contracts/qualification/rule-catalog.json')['sha256']})
plan=read(Q/'component-stage-plan.json');copy=read(Q/'readiness-copy.json')
assert len(plan['members'])==835 and plan['additionalFixtureInputAssets']==0
for row in plan['members']:exact(row,Q/'readiness/copied-tenant'/row['destination'])
for row in copy['files']:
    exact(row,Q/'readiness/copied-tenant'/row['path'])
    assert stat.S_IMODE((Q/'readiness/copied-tenant'/row['path']).stat().st_mode)==row['mode']
assert copy['testImportURL']==(Q/'readiness/copied-tenant/test_env/tests/t287-qualification-carrier-resource.test.mjs').as_uri()
assert copy['ownerCatalogURL']==(Q/'readiness/copied-tenant/contracts/qualification/rule-catalog.json').as_uri()
assert pin(Q/'readiness/copied-tenant/contracts/qualification/rule-catalog.json')['sha256']==plan['historicalCatalogSHA256']
check('all835 component outputs and all5168 copied bodies/modes exact; both URL joins isolated',plan['counts'])

binding=read(Q/'qualification-binding-plan.json');first=read(Q/'first-f11-responsibility.json')
assert all(v is None for v in binding['nativeBindings'].values())
assert binding['tenantConformanceManifest']['coordinate']is None
assert first['observedMaterial']['coordinate']is None and first['semanticAssessment']['judgment']is None
assert first['inputSource']['sourceInventory']==binding['sourceInventory']=={'ref':inventory['inventoryRef'],'digest':inventory['inventoryDigest']}
for row in first['rawMaterialSizes'].values():exact(row)
for key in ['candidateBindings','completeInventoryBody','inventoryOrigins','currentLawBody','currentCatalogBody','currentCoverageBody','completeProtectedInputs','explicitTestOracles','expectedOutputs','snapshotOutputPlan']:exact(first['inputSource'][key])
first['inputSource']['isolatedHistoricalComponent']={'stagePlan':pin(Q/'component-stage-plan.json'),'stagingScript':pin(Q/'component-stage.mjs'),'componentOutputs':835,'originRoles':plan['counts'],'currentLawRemainsRC2':True,'componentReadiness':pin(Q/'readiness-result.json'),'nativeQualificationCredit':False}
first['observedMaterial']['requiredActualWitnesses'].append('complete835 isolated historical-component outputs; both test import and owned catalog resolve within that tree')
put('first-f11-responsibility.json',first)
snapshot=read(Q/'output-consumer-binding-plan.json');exact(snapshot['currentReader'])
assert snapshot['isolatedComponentOutputConservation']['outputs']==835
check('final responsibility/snapshot bindings agree; all actual native/material/J/tenant slots stay unknown',{'noQualificationCredit':True})

candidate=pin(C/'final-freeze.json')
assert candidate['sha256']=='a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'
archive=pathlib.Path(read(C/'final-freeze.json')['package']['artifactPath'])
assert pin(archive)['sha256']=='f779058d1cc3c1867f8d53c1dda9100a136d7fa460772b6084e2f67c0cd982c6'
check('exact accepted C03 freeze and archive unchanged; original qualification subjects retained',{'candidateFreeze':candidate,'archive':pin(archive),'successorSourceOrTrackingIncorporated':False})

readiness_paths=[p for p in (Q/'readiness').rglob('*')if p.is_file()]
readiness_bytes=sum(p.stat().st_size for p in readiness_paths)
cost=read(Q/'cost-and-residuals.json')
cost['actualReadinessTree']={'regularFiles':len(readiness_paths),'bytes':readiness_bytes,'includes':'exact source/dependency/fixture copies, confined configuration files and actual component outputs/stream receipts','separateFromProspectiveProtectedPopulation':True}
cost['finalMechanicalClosureSeconds']=time.monotonic()-started
put('cost-and-residuals.json',cost)
put('final-correspondence.json',{'status':'passed','checks':checks,'checksCount':len(checks),'allKnownProcessesStopped':True,
    'writesOnlyNewQ04':True,'actualReadinessCommands':1,'prospectiveObservedQualificationCommands':0,'nativeModelProviderNetworkGitCalls':0})

records=[]
for p in sorted(Q.rglob('*')):
    assert not p.is_symlink(),'no readiness aliases'
    if not p.is_file():continue
    row=pin(p);row['path']=str(p.relative_to(Q));row['mode']=stat.S_IMODE(p.stat().st_mode);records.append(row)
law=read(T/'contracts/qualification/law-basis.json')
freeze={'status':'CLOSED','work_result':'preparation_ready_for_independent_assurance','activation':'T287_FINAL_QUALIFICATION_INPUTS_04',
    'actor':'/root/rc1_c03_install_review','role':'input preparation and isolated component readiness Worker',
    'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'root':str(Q),'grant':grant,'roleTransition':pin(Q/'activation.json'),
    'records':records,'recordCount':len(records),'candidateFreeze':candidate,'sourceFreeze':pin(C/'final-source-freeze-manifest.json'),
    'originalQ02Freeze':pin(G/'final-qualification-inputs-02/freeze.json'),'originalQ03Freeze':pin(PREVIOUS/'freeze.json'),
    'receivedQ03Disposition':pin(G/'rc1-q04-and-native-scope-controls-01/received-q03-review.md'),
    'inventory':{'file':pin(Q/'qualification-inventory.json'),'ref':inventory['inventoryRef'],'digest':inventory['inventoryDigest'],'members':4554,'canonicalCurrentCandidate':1936,'conservedDonorAliases':96,'additionalControlSuppliers':20},
    'recipe':{'file':pin(Q/'verification-recipe.json'),'protectedFiles':3277,'protectedBytes':251384737,'sourceInputs':780,'auxiliaryInputs':2496,'recipeFilesIncludingSelf':13,'commands':18,'predicates':19,'groups':8,'selectedTitles':46,'lintFiles':332,'currentExpectedOutputs':927,'historicalComponentOutputs':835,'skipPolicy':'incomplete','budget':read(Q/'config.json')['supervisionProposal']},
    'sourceRoles':{'sourcePreimages':1106,'emittedOutputs':830,'derivedAuthorityCopies':96,'changedDerivedBodies':12,'donorInputs':pin(Q/'donor-authority-preimages.json'),'sourceInventory':pin(Q/'source-inventory.json'),'originalProtectedConservation':pin(Q/'preparation-preimages.json')},
    'currentQualificationLaw':{'file':pin(T/'contracts/qualification/law-basis.json'),'ref':law['lawBasisRef'],'digest':law['lawBasisDigest'],'method':'stdo://releases/v2.5.1-rc.2/','catalog':pin(T/'contracts/qualification/rule-catalog.json'),'coverage':pin(T/'contracts/qualification/coverage.json'),'immutableLawMembers':53},
    'historicalComponent':{'stagePlan':pin(Q/'component-stage-plan.json'),'outputs':835,'roles':plan['counts'],'catalogSHA256':plan['historicalCatalogSHA256'],'additionalFixtureInputBodies':0,'sourceCasesUnchanged':True,'currentQualificationTenantOverwritten':False},
    'actualReadiness':{'commandStartRecord':pin(Q/'readiness-command.json'),'commandRecordMeaning':'immutable pre-execution record; final outcome is bound by readiness-result','receipt':pin(Q/'readiness-result.json'),'commands':1,'selectedCases':6,'skip':0,'todo':0,'exit':0,'elapsedSeconds':readiness['elapsedSeconds'],'OSManagedChildrenMaxRSSBytes':readiness['directManagedChildrenMaxRSS'],'knownProcessesStopped':True,'claim':'isolated existing mechanical component readiness only; no observed QUAL056 or native qualification'},
    'mechanicalChecks':{'byteSetSpanSelection':31,'NodeSyntaxOnly':6,'finalCorrespondence':len(checks),'record':pin(Q/'final-correspondence.json')},
    'responsibility':pin(Q/'first-f11-responsibility.json'),'snapshotJoin':pin(Q/'output-consumer-binding-plan.json'),'candidateBindings':pin(Q/'qualification-binding-plan.json'),'rawMaterialAndCost':pin(Q/'cost-and-residuals.json'),'return':pin(Q/'return.md'),
    'nativeBindings':'all actual A/W/grants/Task/CCall/Result/currentness/material/scope/resource/J/tenant/F11/AF22/human slots unknown; none fabricated',
    'effects':{'writesOnlyNewQ04':True,'boundedReadinessCommands':1,'syntaxOnlyCommands':6,'observedQualificationCommands':0,'buildLintPackInstallCompareRuntimeCommands':0,'oldStoreAppendsPrivateEventWrites':0,'nativeModelProviderNetworkGitCalls':0,'sourceCandidateCurrentLawAmbientGeneratedOldCutMutations':0,'successorChanges':0},
    'residuals':'genuine observed QUAL056; complete current native F11 and independent J; seven seeded negatives; applicable scenario/conservation joins; sole AF22; publication; actual human release acceptance; restricted network remains unwaived',
    'stop':'all known processes ended; all Q04 writes stop at this exact CLOSED freeze; Root alone disposes and separately activates assurance; no Reviewer activated'}
put('freeze.json',freeze)
for row in records:exact(row,Q/row['path'])
print(json.dumps({'status':'CLOSED','freeze':pin(Q/'freeze.json'),'records':len(records),'inventory':freeze['inventory'],'recipe':freeze['recipe']['file'],'finalChecks':len(checks),'readinessFiles':len(readiness_paths),'readinessBytes':readiness_bytes}))
