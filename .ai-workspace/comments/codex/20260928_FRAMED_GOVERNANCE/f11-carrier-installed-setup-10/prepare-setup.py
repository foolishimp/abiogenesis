from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import shutil
import stat
import time

root = Path(__file__).resolve().parent
base = root.parent
donor = base / 'f11-carrier-installed-setup-09'
started = time.monotonic()

def read(path):
    return json.loads(Path(path).read_text())

def pin(path):
    path = Path(path)
    body = path.read_bytes()
    return {'path':str(path), 'bytes':len(body), 'sha256':hashlib.sha256(body).hexdigest(), 'mode':stat.S_IMODE(path.stat().st_mode)}

def write(name, value):
    with (root / name).open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')

activation = read(root / 'runtime-activation.json')
acceptance = read(root / 'controls/acceptance.json')
basis = read(root / 'controls/operation-basis.json')
assert activation['operation'] == acceptance['releasedConditionalOperation']
assert activation['executionRoot'] == basis['setupTerritory'] == str(root)
candidate = acceptance['candidate']
construction = Path(basis['constructionTerritory'])
donor_freeze = read(donor / 'freeze.json')
donor_rows = {r['path']:r for r in donor_freeze['records'] if r['kind']=='file'}
pins = [activation[k] for k in ['control','operationBasis','acceptance','candidateFreeze','independentReviewRecord','sourceDonor','node']]
pins += [acceptance[k] for k in ['currentPublicationBindings','currentNativeWrapperCorrespondence','sourceFreeze']]
scripts = []

def copy_body(name, transform=None):
    original = pin(donor / name)
    row = donor_rows[name]
    assert (original['bytes'], original['sha256'], oct(original['mode'])) == (row['bytes'], row['sha256'], row['mode'])
    pins.append(original)
    body = (donor / name).read_text()
    if transform:
        body = transform(body)
    with (root / name).open('x') as stream:
        stream.write(body)
    os.chmod(root / name, original['mode'])
    scripts.append({'source':original,'prepared':pin(root / name),'adaptation':'current activation/Root accepted coordinates and confined roots; unchanged Public owner route'})

def finalizer_current(body):
    body=body.replace('independentReviewFreeze','independentReviewRecord')
    body=body.replace('CurrentInputF11TaskRunHelperProviderQualification','CurrentInputF11TaskRunHelperProviderQualification')
    body=body.replace('Q10/F11 Task','Current-input/F11 Task')
    return body

def driver_current(body):
    old="const constructors=['constructDefaultGovernanceLibraryModulePublication','constructHelloWorldModulePublication','constructConsensusModulePublication','constructWorksiteConstructionModulePublication','constructWorksiteCommandExecutionModulePublication','constructWorksiteCommandForwardModulePublication','constructRequirementHandoffModulePublication','constructSemanticStageModulePublication','constructSemanticRevisionModulePublication','constructSelfConformanceModulePublication','constructNativeWorkspaceWorkModulePublication'];"
    assert body.count(old)==1
    return body.replace(old,"const currentAcceptance=await read(join(here,'controls/acceptance.json')),currentBindings=await read(currentAcceptance.currentPublicationBindings.path); const constructors=currentBindings.constructorPopulation.map(row=>row.constructor); assert.equal(constructors.length,items[0].verified.contributionManifest.publicationBindings.length);")

for name, transform in [
    ('run-setup.mjs',None),('setup-driver.mjs',driver_current),('ordinary-caller.mjs',None),
    ('public-support.mjs',None),('construct-fixture.mjs',None),('conformance-resources.mjs',None),
    ('supervise.py',None),('observe-process.py',None),('close-setup.py',finalizer_current),
    ('fixture-publication-data.json',None),('expected-install-mode-adaptations.json',None),
]:
    copy_body(name,transform)

identity={'installedRoot':candidate['packageRoot'],'artifactPath':candidate['artifactPath'],'basis':candidate['basis']}
prospect=read(donor/'prospective-cases.json')
pins.append(pin(donor/'prospective-cases.json'))
fixture=prospect['fixture']
fixture['reuseRole']='unchanged historical C03 supplier; actual current core selected from Root accepted candidate under content-unbound required version/compatibility'
write('selected-core.json',identity)
write('prospective-cases.json',{'core':{**candidate,'installedRoot':candidate['packageRoot']},'fixture':fixture})
write('budgets.json',{'nominalPreflightMs':180000,'totalSetupBudgetMs':600000,'driverBudgetMs':600000,'stages':{'setup':180000,'conformance':180000},'heap':'unchanged'})
cache_rows=read(construction/'final-cache-population.json')
assert isinstance(cache_rows,list)
cache_records=[]
for row in cache_rows:
    components=Path(row['path']).parts
    if len(components)>1 and components[1]=='_cacache':
        source=construction/row['path']
        actual=pin(source)
        assert actual['bytes']==row['bytes'] and actual['sha256']==row['sha256'] and actual['mode']==row['mode']
        target=root/'task-cache'/Path(*components[1:])
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(source,target)
        cache_records.append({'source':actual,'copy':pin(target)})
        pins.append(actual)
assert cache_records
for name in ['task-config','task-tmp','task-config/prefix']:
    (root/name).mkdir(parents=True,exist_ok=True)
for name in ['npmrc','globalnpmrc']:
    source=donor/'task-config'/name
    shutil.copy2(source,root/'task-config'/name)
    pins.append(pin(source))
environment={'TMPDIR':str(root/'task-tmp'),'NPM_CONFIG_USERCONFIG':str(root/'task-config/npmrc'),'NPM_CONFIG_GLOBALCONFIG':str(root/'task-config/globalnpmrc'),'NPM_CONFIG_CACHE':str(root/'task-cache'),'NPM_CONFIG_PREFIX':str(root/'task-config/prefix'),'NPM_CONFIG_OFFLINE':'true','NPM_CONFIG_IGNORE_SCRIPTS':'true','NPM_CONFIG_AUDIT':'false','NPM_CONFIG_FUND':'false','PATH':str(construction/'source-freeze/toolchain/bin')+':/Users/jim/.pyenv/versions/3.11.5/bin:/usr/bin:/bin:/usr/sbin:/sbin','npm_config_bin_links':'true'}
write('runtime-environment.json',environment)
write('resource-plan.json',{'eventLogPath':str(root/'resources/events/runtime.events.jsonl'),'rootsConfinedTo':str(root),'neverAppend':'all old Runtime/Setup resources; no old resource reopen','F11TaskRun':'STOPPED','CurrentInput':'requires separately accepted current input and Root grant'})

current_wrapper=read(acceptance['currentNativeWrapperCorrespondence']['path'])
assert current_wrapper['current']==candidate['basis']
assert current_wrapper['currentRequiredBodyCount']==acceptance['currentRequiredBodies']
wrapper=Path(fixture['artifactPath']);wrapper_pin=pin(wrapper)
assert 'sha256:'+wrapper_pin['sha256']==fixture['basis']['artifactDigest']
assert wrapper_pin['sha256']==current_wrapper['originalWrapper']['sha256']
pins += [wrapper_pin,pin(candidate['artifactPath']),pin(Path(candidate['packageRoot'])/'product-toolchain-manifest.json'),pin(base/'install-bin-policy-realization-01/freeze.json')]
old_physical=[]
for entry in read(donor/'preimages.json')['oldEventPhysical']:
    path=Path(entry['path']);s=path.stat()
    old_physical.append({'path':str(path),'bytes':s.st_size,'sha256':pin(path)['sha256'],'device':s.st_dev,'inode':s.st_ino,'mtimeNs':s.st_mtime_ns})
old_setup07=donor/'resources/events/runtime.events.jsonl'
if not any(x['path']==str(old_setup07) for x in old_physical):
    s=old_setup07.stat();old_physical.append({'path':str(old_setup07),'bytes':s.st_size,'sha256':pin(old_setup07)['sha256'],'device':s.st_dev,'inode':s.st_ino,'mtimeNs':s.st_mtime_ns})
write('preimages.json',{'capturedAt':datetime.now(timezone.utc).isoformat(),'pins':pins,'acceptedCurrentWholePopulationAssuranceReused':activation['independentReviewRecord'],'oldEventPhysical':old_physical,'HOME':activation['HOME'],'node':activation['node']['path'],'python':'/Users/jim/.pyenv/versions/3.11.5/bin/python3.11','firstDiscrepancy':activation['firstDiscrepancy']})
write('preparation.json',{'status':'prepared_exact_donor_route','preparedAt':datetime.now(timezone.utc).isoformat(),'operation':activation['operation'],'scripts':scripts,'currentCandidate':candidate,'actualPublicationCatalogIdentities':{'catalogDigest':acceptance['catalogDigest'],'publicationBindings':acceptance['currentPublicationBindings'],'nativeWrapperCorrespondence':acceptance['currentNativeWrapperCorrespondence'],'currentRequiredBodies':acceptance['currentRequiredBodies'],'nativeContractDigestValuesChanged':acceptance['nativeContractDigestValuesChanged']},'expectedModes':'expected-install-mode-adaptations.json','offlineCacheCopies':cache_records,'cacheOriginSchema':'actual final-cache-population.json array; only declared _cacache records copied; historical logs stay in original cut','preparationOnlyLookupCorrections':[],'RuntimeImportsCallsEffectsDuringPreparation':0,'sourceWrapperOldStoreEffects':0,'elapsedMs':(time.monotonic()-started)*1000,'next':'one pre-import supervised nominal+actual14Publicsetup; first discrepancy STOP; no retry'})
print(json.dumps({'status':'prepared','operation':activation['operation'],'scriptCount':len(scripts),'cacheRecordCount':len(cache_records),'pins':len(pins),'oldPhysicalResources':len(old_physical),'elapsedMs':(time.monotonic()-started)*1000,'RuntimeImportsCallsEffectsDuringPreparation':0}))
