"""Final mechanical data closure. No native or Product/helper execution."""
import ast
import datetime
import hashlib
import json
import pathlib

REPO=pathlib.Path('/Users/jim/src/apps/abiogenesis')
G=REPO/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q=G/'final-qualification-inputs-03'
C=G/'final-candidate-construction-03'
T=C/'final-stage/build_tenants/abiogenesis/typescript'
assert not (Q/'freeze.json').exists(), 'One CLOSED freeze only'
def sha(raw):return hashlib.sha256(raw).hexdigest()
def read(p):return json.loads(pathlib.Path(p).read_bytes())
def pin(p):
 p=pathlib.Path(p);raw=p.read_bytes()
 return {'path':str(p),'bytes':len(raw),'sha256':sha(raw)}
def put(n,x):(Q/n).write_text(json.dumps(x,indent=2)+'\n')

mechanical=read(Q/'mechanical-checks.json');syntax=read(Q/'syntax-checks.json')
assert mechanical['mechanicalChecks']==27 and all(c['passed']for c in mechanical['checks'])
assert len(syntax['checks'])==5 and all(c['result']['exit_code']==0 for c in syntax['checks'])
all_json=list(Q.glob('*.json'))
for p in all_json:read(p)
for p in Q.glob('*.py'):ast.parse(p.read_text(),filename=str(p))
grant=pin(Q/'request.txt')
assert grant['bytes']==5341 and grant['sha256']=='e57083e66ae0b2de8ba736d0535a4a6ef45c9a34a55a16f2051a2305447b8189'
inventory=read(Q/'qualification-inventory.json');protected=read(Q/'protected-inputs.json');population=read(Q/'population-binding.json')
assert len(inventory['members'])==4550 and protected['counts']['total']==3275 and population['allQualificationMembers']==4550
for r in read(Q/'inventory-origin-correspondence.json'):
 raw=pathlib.Path(r['origin']).read_bytes();m=next(m for m in inventory['members']if m['ref']==r['ref'])
 assert m['digest']=='sha256:'+sha(raw) and m['byteCount']==len(raw) and m['path']==r['path']
for r in protected['members']:
 raw=pathlib.Path(r['origin']).read_bytes()
 assert len(raw)==r['bytes'] and sha(raw)==r['sha256']
first=read(Q/'first-f11-responsibility.json');binding=read(Q/'qualification-binding-plan.json')
assert first['observedMaterial']['coordinate'] is None and first['semanticAssessment']['judgment'] is None
assert all(v is None for v in binding['nativeBindings'].values())
assert binding['tenantConformanceManifest']['coordinate'] is None
assert first['inputSource']['sourceInventory']['digest']==inventory['inventoryDigest']==binding['sourceInventory']['digest']
for p in first['rawMaterialSizes'].values():assert pin(p['path'])==p
for owner in read(Q/'output-consumer-binding-plan.json')['currentSourceOwners']:assert pin(owner['path'])==owner
candidate=pin(C/'final-freeze.json')
assert candidate['sha256']=='a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'
put('final-correspondence.json',{
 'status':'mechanical_final_correspondence_passed','checks':[
  {'check':'all final JSON and four Python scripts parse','passed':True,'JSONFiles':len(all_json)},
  {'check':'all4550 inventory origins and3275 protected inputs still exactly agree','passed':True},
  {'check':'first responsibility, actual source owners, raw material sizes and inventory bindings agree','passed':True},
  {'check':'all native/J/material/tenant owned-construction slots remain explicitly pending','passed':True},
  {'check':'exact grant and accepted C03 freeze unchanged','passed':True}],
 'semanticAssessmentOrQualification':False,'ownerCalls':0,'commandsExecuted':'five syntax-only Node processes; zero qualification commands'})

records=[]
for p in sorted(Q.iterdir()):
 assert p.is_file() and not p.is_symlink(), 'flat preparation files only'
 raw=p.read_bytes();records.append({'path':p.name,'bytes':len(raw),'sha256':sha(raw)})
law=read(T/'contracts/qualification/law-basis.json')
coverage=read(T/'contracts/qualification/coverage.json')
freeze={
 'status':'CLOSED','work_result':'preparation_ready','activation':'T287_FINAL_QUALIFICATION_INPUTS_03',
 'actor':'/root/rc1_c03_install_review','role':'pure input Worker','separateRoleTransition':pin(Q/'activation.json'),
 'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'return':'Root only; no Reviewer activated',
 'grant':grant,'root':str(Q),'records':records,'recordCount':len(records),
 'candidateFreeze':candidate,'sourceFreeze':pin(C/'final-source-freeze-manifest.json'),
 'rootAcceptance':pin(G/'rc1-c03-acceptance-01/acceptance.json'),
 'originalQ02Freeze':pin(G/'final-qualification-inputs-02/freeze.json'),
 'inventory':{'path':str(Q/'qualification-inventory.json'),'ref':inventory['inventoryRef'],'digest':inventory['inventoryDigest'],
              'file':pin(Q/'qualification-inventory.json'),'members':len(inventory['members']),
              'canonicalCurrentCandidatePaths':1936,'immutableDonorAliases':96,'additionalControlSupplierRecords':18},
 'recipe':{'file':pin(Q/'verification-recipe.json'),'protectedFiles':3275,'protectedBytes':protected['bytes'],
           'commands':17,'predicates':18,'groups':8,'selectedTitles':46,'lintFiles':332,'expectedOutputs':927,
           'sourceInputs':len(read(Q/'verification-recipe.json')['sourceInputs']),
           'auxiliaryInputs':len(read(Q/'verification-recipe.json')['auxiliaryInputs']),
           'skipPolicy':'incomplete','declaredWorkload':read(Q/'config.json')['supervisionProposal']},
 'completeSourceInputAndOutputSeparation':{'sourcePreimages':1106,'emittedOutputs':830,'derivedAuthorityCopies':96,
     'changedDerivedBodies':12,'donorInputs':pin(Q/'donor-authority-preimages.json'),'sourceInventory':pin(Q/'source-inventory.json'),
     'expectedOutputs':pin(Q/'expected-output-inventory.json'),'completeProtectedInputs':pin(Q/'protected-inputs.json')},
 'law':{'ref':law['lawBasisRef'],'digest':law['lawBasisDigest'],'file':pin(T/'contracts/qualification/law-basis.json'),
        'catalog':pin(T/'contracts/qualification/rule-catalog.json'),'authority':pin(T/'contracts/qualification/authority-inputs.json'),
        'coverage':{'ref':coverage['catalogRef'],'digest':coverage['catalogDigest'],'file':pin(T/'contracts/qualification/coverage.json')},
        'methodRelease':'stdo://releases/v2.5.1-rc.2/','immutableMembers':53},
 'tenantManifest':{'status':'pending exact owned construction by separately authorized Runtime Worker; no packaged current manifest file',
                  'coordinate':None,'actualPublishedSourceBindings':pin(Q/'qualification-binding-plan.json')},
 'responsibility':pin(Q/'first-f11-responsibility.json'),'snapshotJoin':pin(Q/'output-consumer-binding-plan.json'),
 'rawMaterialAndCost':pin(Q/'cost-and-residuals.json'),
 'mechanicalChecks':{'byteSetSpanSelection':27,'nodeSyntaxOnly':5,'finalCorrespondence':5,
                     'records':[pin(Q/n)for n in ['mechanical-checks.json','syntax-checks.json','final-correspondence.json']]},
 'nativeBindings':'pending; none fabricated','semanticAssessment':'unknown/unexecuted','qualification':'not performed or accepted',
 'effects':{'writesOnlyNewQ03Preparation':True,'originalInputStaging':False,'installationCopies':0,
           'buildLintTestCompareHelperCommands':0,'ProductOwnerCalls':0,'nativeModelProviderNetworkCalls':0,
           'GitEffects':0,'sourceCandidateStageArchiveInstallStoreMutations':0,'olderReportMutations':0},
 'limits':{'network':'restricted; genuine qualification blocked, not waived',
           'runtimeReuse':'exact pure input reuse only; existing mechanical Tasks must not be relabeled or expanded after binding',
           'scenarioSeedReleaseResiduals':pin(Q/'cost-and-residuals.json')},
 'stop':'all input preparation writes stop at this one CLOSED exact freeze; Root owns disposition and further activations'}
put('freeze.json',freeze)
for r in records:
 raw=(Q/r['path']).read_bytes();assert len(raw)==r['bytes'] and sha(raw)==r['sha256']
print(json.dumps({'freeze':pin(Q/'freeze.json'),'status':'CLOSED','work_result':'preparation_ready','records':len(records),
                  'inventory':freeze['inventory'],'recipe':freeze['recipe']['file'],
                  'responsibility':freeze['responsibility'],'snapshotJoin':freeze['snapshotJoin'],
                  'law':freeze['law'],'tenantManifest':freeze['tenantManifest']}))
