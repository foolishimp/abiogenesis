"""Mechanical byte/set/span/selection correspondence only; no Product imports."""
import ast
import base64
import hashlib
import json
import pathlib
import posixpath
import re

REPO=pathlib.Path('/Users/jim/src/apps/abiogenesis')
G=REPO/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q=G/'final-qualification-inputs-04'
C=G/'final-candidate-construction-03'
T=C/'final-stage/build_tenants/abiogenesis/typescript'
OLD=G/'final-qualification-inputs-02'
assert not (Q/'freeze.json').exists()
checks=[]
def sha(raw): return hashlib.sha256(raw).hexdigest()
def canonical(value): return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def digest(value): return 'sha256:'+sha(canonical(value))
def read(p): return json.loads(pathlib.Path(p).read_bytes())
def check(name,condition,detail):
    assert condition,name
    checks.append({'check':name,'passed':True,'mechanicalDetail':detail})

json_files=sorted(Q.glob('*.json'))
for p in json_files: read(p)
check('all preparation JSON parses',True,{'files':len(json_files)})
for name in ['prepare-data.py','verify-data.py']:
    ast.parse((Q/name).read_text(),filename=name)
check('data scripts Python syntax',True,{'files':2,'noBytecodeOrOwnerImport':True})

inventory=read(Q/'qualification-inventory.json')
body={k:v for k,v in inventory.items() if k not in ['inventoryRef','inventoryDigest']}
check('inventory canonical identity',inventory['inventoryDigest']==digest(body) and inventory['inventoryRef']=='qualification-inventory://abiogenesis/'+digest(body)[7:],{'members':len(inventory['members'])})
members={m['ref']:m for m in inventory['members']}
origins=read(Q/'inventory-origin-correspondence.json')
check('complete unique inventory origin population',len(members)==len(inventory['members'])==len(origins) and set(members)=={r['ref'] for r in origins} and len({m['path'] for m in inventory['members']})==len(members),{'members':len(members)})
for r in origins:
    raw=pathlib.Path(r['origin']).read_bytes();m=members[r['ref']]
    assert m['path']==r['path'] and m['digest']=='sha256:'+sha(raw) and m['byteCount']==len(raw)
check('every inventory member exact physical bytes/path/origin',True,{'members':len(members),'allBodiesReadable':True})

effective=read(Q/'source-inventory.json');donor=read(Q/'donor-authority-preimages.json')
check('current source and emitted output population',len(effective)==1936 and len({r['path'] for r in effective})==1936,{'selectedSourceInputs':1106,'emittedOutputs':830})
check('donor inputs and current authority outputs remain separate',len(donor)==96 and sum(r['changed'] for r in donor)==12,{'immutableInputs':96,'changedDerived':12})
for r in donor:
    raw=pathlib.Path(r['origin']).read_bytes();derived=pathlib.Path(r['derivedOrigin']).read_bytes()
    assert sha(raw)==r['sha256'] and len(raw)==r['bytes'] and sha(derived)==r['derivedSHA256'] and len(derived)==r['derivedBytes'] and (raw!=derived)==r['changed']
    assert members[r['memberRef']]['digest']=='sha256:'+r['sha256']
    assert members['repo://abiogenesis/'+r['path']]['digest']=='sha256:'+r['derivedSHA256']
check('all donor and derived coordinate joins',True,{'pairs':96})

protected=read(Q/'protected-inputs.json')['members'];recipe=read(Q/'verification-recipe.json')
check('complete protected byte population',len(protected)==3277 and len({r['target'] for r in protected})==3277,{'bytes':sum(r['bytes'] for r in protected)})
for r in protected:
    p=pathlib.Path(r['origin']);assert p.is_file() and not p.is_symlink()
    raw=p.read_bytes();assert len(raw)==r['bytes'] and sha(raw)==r['sha256']
    assert not pathlib.PurePosixPath(r['target']).is_absolute() and '..' not in pathlib.PurePosixPath(r['target']).parts
check('every protected origin regular/readable/unchanged and target safe',True,{'files':len(protected)})
from_recipe=[{'path':r['relativePath'],'digest':members[r['memberRef']]['digest'],'bytes':members[r['memberRef']]['byteCount']}for r in recipe['sourceInputs']]
from_recipe += [{'path':r['relativePath'],'digest':r['digest'],'bytes':r['byteCount']}for r in recipe['auxiliaryInputs']]
from_recipe += [{'path':'recipe/verification-recipe.json','digest':'sha256:'+sha((Q/'verification-recipe.json').read_bytes()),'bytes':len((Q/'verification-recipe.json').read_bytes())}]
from_protected=[{'path':r['target'],'digest':'sha256:'+r['sha256'],'bytes':r['bytes']}for r in protected]
check('formal recipe protected population including self once',sorted(from_recipe,key=lambda r:r['path'])==sorted(from_protected,key=lambda r:r['path']),{'sourceInputs':len(recipe['sourceInputs']),'auxiliaryInputs':len(recipe['auxiliaryInputs']),'selfInputs':1})

config=read(Q/'config.json');normalized=read(Q/'configuration-binding.json');commands=config['commands']
check('proposed normalized configuration hashes',recipe['commandConfigurationDigest']==digest(normalized['commands']) and recipe['predicateConfigurationDigest']==digest(normalized['predicates']) and recipe['writeTerritoriesDigest']==digest(normalized['allowedWriteTerritories']),{'ownerCalled':False,'futureActualOwnerComparisonRequired':True})
check('exact command and predicate recipe correspondence',len(commands)==18 and len(config['outcomePredicates'])==19 and [c['commandId']for c in commands]==[c['commandId']for c in recipe['commands']] and [c['ordinal']for c in normalized['commands']]==list(range(18)),{'commands':18,'predicates':19})
for raw,norm in zip(commands,normalized['commands']):
    assert all(norm[k]==raw[k] for k in ['commandId','executable','args','relativeCwd','timeoutMs','terminationGraceMs'])
    assert [{'name':e['name'],'value':e['value']}for e in norm['environment']]==sorted(raw['environment'],key=lambda e:e['name'].lower())
    assert len({e['name']for e in raw['environment']})==len(raw['environment'])
    assert not any('../' in value or '/opt/homebrew' in value for value in [raw['executable'],*raw['args'],*(e['value']for e in raw['environment'])])
check('commands use protected finite Node/npm paths and explicit environment',True,{'noParentOrAmbientHomebrewRoutes':True})
names=[c['commandId'].split('/')[-1]for c in commands]
current=commands[names.index('stage-current-authorities')]
check('explicit RC2 authority stage precedes ordinary generation',names.index('compile')<names.index('stage-current-authorities')<names.index('generate') and current['args']==['scripts/generate-qualification-rule-catalog.mjs','--stage-authorities','.authority-source','.law-source/currentRC2'],{'command':current['commandId']})
check('finite command and outer budget',sum(c['timeoutMs']+c['terminationGraceMs']for c in commands)==config['supervisionProposal']['commandCapsAndGracesMs']==1293000,config['supervisionProposal'])

selection=read(Q/'test-selection.json');previous=read(OLD/'test-selection.json')
check('Q02 original title/oracle meanings retained',all(selection['tests'][i]['selectedTitles']==t['selectedTitles'] and selection['tests'][i]['files']==t['files'] and selection['tests'][i]['selectionKind']==t['selectionKind'] for i,t in enumerate(previous['tests'])),{'groups':5,'titles':30})
for t in selection['tests']:
    raw=pathlib.Path(t['sourceOracle']['path']).read_bytes()
    assert sha(raw)==t['sourceOracle']['sha256']
    text=raw.decode()
    for title in t['selectedTitles']:
        if title.startswith('authority staging and ordinary reproduction bind '):
            assert 'for (const name of [\'retainedRC1\', \'selectedRC2\'])' in text and "test(`authority staging and ordinary reproduction bind ${name}'s exact Definition-selected release`" in text
        else: assert title in text
    c=next(c for c in commands if c['commandId']==t['commandId'])
    assert all(f in c['args']for f in t['files'])
    if t['selectionKind']=='exact_names':
        pattern=next(a[len('--test-name-pattern='):]for a in c['args']if a.startswith('--test-name-pattern='))
        assert pattern=='^(?:'+'|'.join(re.escape(title)for title in t['selectedTitles'])+')$'
check('exact prospective changed carrier/law/context selection',len(selection['tests'])==8 and sum(t['expectedTestCount']for t in selection['tests'])==46 and recipe['skipPolicy']=='incomplete',{'groups':8,'selectedTitles':46,'prospectiveObservedTestsExecuted':0,'isolatedCarrierReadinessExecuted':6,'unselectedCasesExplicit':True})
lint=read(Q/'lint-population.json')
check('lint complete selected MJS/JSON population',len(lint)==332 and lint==recipe['lint']['files'] and len({r['path']for r in lint})==332,{'files':332,'lintExecuted':False})

manifest=read(Q/'input-manifest.json');lawbasis=read(T/'contracts/qualification/law-basis.json');catalog=read(T/'contracts/qualification/rule-catalog.json')
actual_law={r['path']:r for r in manifest['lawMembers']}
stdo_manifest=read(C/'final-law/manifest.json')
member_set=''.join(m['sha256']+'  '+stdo_manifest['standards']['source_root']+'/'+m['path']+'\n'for m in sorted(stdo_manifest['standards']['members'],key=lambda m:m['path'])).encode()
assert sha(member_set)==stdo_manifest['standards']['member_set_sha256']==lawbasis['memberSetDigest'][7:]
for m in stdo_manifest['standards']['members']:
    assert actual_law['standards/'+m['path']]['sha256']==m['sha256']
check('complete immutable selected RC2 manifest and 52 member bodies',len(actual_law)==53 and actual_law['manifest.json']['sha256']==lawbasis['installedManifestDigest'][7:],{'release':'stdo://releases/v2.5.1-rc.2/','standards':52})
material={s['ref']:(T/s['path']).read_bytes()for s in catalog['sources']}
for s in catalog['sources']:
    assert sha(material[s['ref']])==s['digest'][7:] and len(material[s['ref']])==s['byteCount']
for r in catalog['rules']:
    assert sha(material[r['sourceRef']][r['startByte']:r['endByte']])==r['spanDigest'][7:]
check('current law 95 sources and 2137 exact byte spans',len(material)==95 and len(catalog['rules'])==2137,{'semanticApplicabilityOrSufficiencyAssessed':False})
lock=read(C/'final-source/build_tenants/abiogenesis/typescript/package-lock.json')
for r in manifest['dependencies']:
    raw=pathlib.Path(r['origin']).read_bytes()
    assert r['integrity']=='sha512-'+base64.b64encode(hashlib.sha512(raw).digest()).decode()
    assert lock['packages'][r['locator']]['version']==r['version'] and lock['packages'][r['locator']]['integrity']==r['integrity']
check('all sixteen existing archive bytes match locked version and SRI',len(manifest['dependencies'])==16,{'dependencyResolutionOrInstallRun':False})
tool_paths={r['path']for r in manifest['toolFiles']}
for r in read(Q/'toolchain-links.json'):
    target=posixpath.normpath(posixpath.join(posixpath.dirname(r['path']),r['target']))
    assert target in tool_paths and not target.startswith('../')
check('frozen Node/npm files and all recorded link targets',len(tool_paths)==2313 and len(read(Q/'toolchain-links.json'))==15,{'allToolBytesPreviouslyVerifiedAbove':True,'newToolAcquisition':False})

expected=read(Q/'expected-output-inventory.json')
actual=[]
for base in ['build','contracts','product-toolchain-manifest.json']:
    p=T/base
    for f in ([p]if p.is_file()else sorted(p.rglob('*'))):
        if f.is_file():
            raw=f.read_bytes();actual.append({'path':str(f.relative_to(T)),'bytes':len(raw),'sha256':sha(raw)})
check('complete 927 actual stage expected outputs',sorted(actual,key=lambda r:r['path'])==expected['paths'] and len(actual)==927 and expected['basisInventorySha256']==sha((Q/'source-inventory.json').read_bytes()),{'expectedCurrentStageOutputs':927,'comparisonCommandExecuted':False})
check('Q02 comparison and environment command bodies conserved',all((Q/n).read_bytes()==(OLD/n).read_bytes()for n in ['compare-generated.mjs','test-environment.mjs']),{'unchangedCommandBodies':2})
consumer=(Q/'output-checks.mjs').read_text()
for clause in ['isObservedWorksiteCommandExecutionObservation','isWorksiteCommandExecutionHelperPlan','isWorksiteExecutionHelperArtifact','helper.snapshotRoot,plan.sandboxRoot','task.workspaceAuthorityBasis.canonicalRoot','readOutput(r.relativePath)',"readOutput('verification/reports/generated-comparison.json')","readOutput(join('verification',r.path))",'expectedProtected','rp.projection.terminalResult','re.projection.terminalResult']:
    assert clause in consumer
check('snapshot output consumer retains all owner and three output joins',True,{'outputCategories':['command reports','comparison JSON','every generated output'],'actualOriginalProtectedInputsSeparatelyRequired':True,'consumerCalled':False})
check('original immutable construction and donor freeze pins',sha((C/'final-freeze.json').read_bytes())=='a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a' and sha((OLD/'freeze.json').read_bytes())=='a4c2b5afd94fd7402b6bbfc732e691eb345dbcf4334a0300de490f607b9aad79',{'mutationsOutsideQ04':0})
plan=read(Q/'component-stage-plan.json');readiness=read(Q/'readiness-result.json')
check('isolated component has complete declared current implementation and historical source bindings',len(plan['members'])==835 and plan['counts']=={'current_C03_compiled_implementation':735,'historical_RC1_contract_not_current_qualification_law':4,'historical_RC1_source_projection':95,'unchanged_existing_source_case':1},plan['counts'])
check('one actual existing six-case readiness passed without omission or changed oracles',readiness['status']=='passed' and readiness['processExit']==0 and readiness['selectedCount']==6 and all(c['passed']and not c['skip']and not c['todo']for c in readiness['cases']),{'commandInvocations':1,'actualNativeQualification':False})
stage=next(c for c in commands if c['commandId'].endswith('/stage-historical-component'))
case=next(t for t in selection['tests']if t['commandId'].endswith('/t287-qualification-carrier-resource'))
check('prospective import and owned catalog both resolve within staged historical tenant',names.index('generate')<names.index('stage-historical-component')<names.index('t287-qualification-carrier-resource') and case['files']==['.components/retained-carrier/test_env/tests/t287-qualification-carrier-resource.test.mjs'] and stage['args']==['.recipe/component-stage.mjs'],{'currentRC2TenantUnchanged':True})
check('snapshot consumer includes all isolated component outputs without original-root fallback',"readOutput('recipe/component-stage-plan.json')"in consumer and "readOutput('verification/reports/component-staging.json')"in consumer and 'componentPlan.destinationRoot,r.destination' in consumer,{'stagedComponentOutputs':len(plan['members']),'currentCandidateOutputs':927})
(Q/'mechanical-checks.json').write_text(json.dumps({'status':'mechanical_correspondence_passed','checks':checks,
 'mechanicalChecks':len(checks),'qualificationCommandsExecuted':0,'ownerOrHelperCalls':0,'nativeOrProviderCalls':0,
 'semanticAssessment':'not performed','network':'restricted; not waived'},indent=2)+'\n')
print(json.dumps({'mechanicalChecks':len(checks),'passed':True,'qualificationCommandsExecuted':0}))
