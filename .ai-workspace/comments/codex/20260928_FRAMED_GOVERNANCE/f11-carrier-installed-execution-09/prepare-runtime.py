"""Owned pure Runtime09 wiring; no Product imports or resource acquisition."""
from pathlib import Path
import datetime, hashlib, json, os, shutil, stat

E = Path(__file__).resolve().parent
G = E.parent
D = G / 'f11-carrier-installed-execution-08'
Q = G / 'final-qualification-inputs-15'
S = G / 'f11-carrier-installed-setup-09'

def read(p): return json.loads(Path(p).read_bytes())
def sha(p):
    with Path(p).open('rb') as f: return hashlib.file_digest(f, 'sha256').hexdigest()
def pin(p):
    p = Path(p)
    return dict(path=str(p), bytes=p.stat().st_size, sha256=sha(p), mode=stat.S_IMODE(p.stat().st_mode))
def put(n, v):
    with (E/n).open('x') as f: json.dump(v, f, indent=2, ensure_ascii=False); f.write('\n')

activation = read(E/'runtime-activation.json')
a = read(activation['inputAcceptance']['path'])
assert pin(activation['inputAcceptance']['path']) == activation['inputAcceptance']
assert a['runtimeGranted'] and a['releasedConditionalOperation'] == activation['operation']
assert a['preparationFreeze'] == activation['preparationFreeze']
for p in ['f11','controls','report-donors','task-tmp','task-config','task-cache']:
    (E/p).mkdir()
for n in ['npmrc','globalnpmrc']:
    (E/'task-config'/n).write_text('offline=true\nignore-scripts=true\naudit=false\nfund=false\n')

frozen = read(Q/'freeze.json'); rows = {r['path']:r for r in frozen['records']}
copies = []
def copy(source, target, mode=None, frozen_row=None):
    p = pin(source)
    if frozen_row:
        assert (p['bytes'],p['sha256']) == (frozen_row['bytes'],frozen_row['sha256'])
    assert not target.exists()
    shutil.copyfile(source,target); os.chmod(target, mode if mode is not None else p['mode'])
    t = pin(target); assert (t['bytes'],t['sha256']) == (p['bytes'],p['sha256'])
    copies.append({'source':p,'target':t,'bodyExact':True,'originalAttributionTransferred':False})
    return p

modules = ['ordinary-caller.mjs','public-support.mjs','public-outcomes.mjs','flow-driver.mjs',
           'proof-oracles.mjs','prepare-resources.mjs','conformance-resources.mjs','source-delta-contract.mjs']
for name in modules: copy(Q/'f11'/name,E/'f11'/name,frozen_row=rows['f11/'+name])
assert sha(E/'f11/ordinary-caller.mjs') == 'af8b5625275c3fcdd11b9838505d942c62a12651f65fb6b90434289df970c676'
assert sha(E/'f11/flow-driver.mjs') == 'dda353346f8c66b49d506090697e453b07f9451e7c61e16900ab26c7b5f4cf51'
copy(Q/'f11/controlled-helper.mjs',E/'controlled-helper.mjs',0o755,rows['f11/controlled-helper.mjs'])
for name in ['observe-process.py','supervise.py']:
    copy(Q/'f11'/name,E/name,frozen_row=rows['f11/'+name])
inputs = []
for name in ['f11-bound-packet.json','f11-bound-resource-manifest.json','freeze.json']:
    source = a['preparationFreeze'] if name == 'freeze.json' else rows[name]
    if name == 'freeze.json': assert pin(Q/name) == source
    copy(Q/name,E/name,0o644,source)
    inputs.append({'source':pin(Q/name),'target':pin(E/name),'bodyExact':True,'role':'exact accepted Q15 input replica'})
copy(D/'run-flow.mjs',E/'report-donors/run-flow.mjs')
copy(D/'close-runtime.py',E/'report-donors/close-runtime.py')
put('controls/runtime-request.json', {'grant':activation['grant'],'sevenSectionsRead':True})
copy(Path(activation['grant']['path']),E/'controls/runtime-request.txt')
copy(Path(activation['inputAcceptance']['path']),E/'controls/input-acceptance.json')

parent = read(Q/'f11/parent-selection.json')
activation.update(kind='root_runtime_execution_activation',actorRef=a['setup']['currentActor'],
                  executionRoot=str(E),preparationFreezeSHA256=a['preparationFreezeSHA256'],
                  parentSelection=parent,realProviderCalls=0,RootSeparateMessageRelease=True,
                  inputFreeze=a['preparationFreeze'],RootRelease=True)
# The existing activation's original declaration is conserved as a preimage.
copy(E/'runtime-activation.json',E/'controls/activation-before-binding.json')
(E/'runtime-activation.json').write_text(json.dumps(activation,indent=2)+'\n')
cfg = read(D/'driver-config.json')
cfg.update(kind='current_C09_Setup09_Q15_external_controller',operation=activation['operation'],
           Q08Root=str(E),originalQ08Root=str(Q),Q08FreezeSHA256=a['preparationFreezeSHA256'],
           actualSetupRoot=str(S),actualSetupStateFile=str(S/'setup-state.json'),
           currentInstalledRoot=a['candidate']['actualInstalledRoot'],
           RootAcceptanceControlDirectory=str(Path(activation['inputAcceptance']['path']).parent),
           inputAcceptancePin=activation['inputAcceptance'],sourceCopies=[
             {'source':r['source']['path'],'target':r['target']['path'],'bytes':r['target']['bytes'],
              'sha256':r['target']['sha256'],'bodyExact':True} for r in copies if r['target']['path'].endswith(('.mjs','.py'))
           ],selectedInputCopies=inputs)
put('driver-config.json',cfg)
put('runtime-release.json',dict(operation=activation['operation'],RootSeparateMessageRelease=True,
    inputAcceptance=activation['inputAcceptance'],RootMessage='Root Executive explicit release d3007ae8 / T287_F11_C09_CARRIER_EXECUTION_09'))
env = read(D/'runtime-environment.json')
for k,v in list(env.items()): env[k]=v.replace(str(D),str(E)).replace('final-candidate-construction-07','final-candidate-construction-09')
put('runtime-environment.json',env)
put('budgets.json',read(D/'budgets.json'))
put('caller-budget-proposal.json',read(D/'caller-budget-proposal.json'))
prospect = read(S/'prospective-cases.json')
prospect['core']['installedRoot']=a['candidate']['actualInstalledRoot']
prospect['core']['packageRoot']=a['candidate']['actualInstalledRoot']
put('prospective-cases.json',prospect)
put('selected-core.json',{k:prospect['core'][k] for k in ['installedRoot','artifactPath','basis']})
put('parent-selection.json',parent)
event=a['setup']['eventPhysical']; current=pin(event['path']); physical=Path(event['path']).stat()
assert current == {k:event[k] for k in ['path','bytes','sha256','mode']}
assert (physical.st_dev,physical.st_ino)==(event['device'],event['inode'])
put('resource-plan.json',dict(eventLogPath=event['path'],initialPrefixBytes=event['bytes'],
    initialPrefixSha256=event['sha256'],eventDevice=event['device'],eventInode=event['inode'],
    initialHandoffDigest=a['setup']['closedHandoffDigest'],
    authenticInitialHandoffFile=a['setup']['closedEventResourceHandoff']['path'],
    onlyAppendOwner='ABG under current exact Runtime09 release',
    allowedNewOwnerScopedResourceRoots=a['setup']['resourceRoots']))

code=(D/'run-flow.mjs').read_text()
code=code.replace("assert.equal(activation.operation,'T287_F11_C07_CARRIER_EXECUTION_08');",'assert.equal(activation.operation,cfg.operation);')
code=code.replace("assert.equal(release.inputAcceptance.path,join(cfg.RootAcceptanceControlDirectory,'input-acceptance.json'));",'assert.deepEqual(release.inputAcceptance,cfg.inputAcceptancePin);')
code=code.replace('setup07-initial-durable-prefix.bin','setup09-initial-durable-prefix.bin')
(E/'run-flow.mjs').write_text(code)
put('controller-adaptations.json',{'operation':activation['operation'],'donor':pin(D/'run-flow.mjs'),
    'current':pin(E/'run-flow.mjs'),'changes':['operation consumed from activation/config',
    'actual acceptance pin consumed without guessed filename','current prefix report label09'],
    'strictCallerAndFlowDriverUnchanged':True,'RuntimeCalls':0})
sf=read(a['setup']['freeze']['path'])
put('setup09-initial-entry-pins.json',{'setupRoot':str(S),
    'records':[r for r in sf['records'] if r['path'].startswith('resources/')],
    'directories':[r for r in sf['directories'] if r['path'].startswith('resources/')],
    'authority':'exact accepted Setup09 full census; Root assurance reused before payload'})
prior=[]
for p in sorted(G.glob('f11-carrier-installed-setup-*/resources/events/runtime.events.jsonl')):
    if p==Path(event['path']):continue
    x=pin(p);s=p.stat();prior.append({**x,'device':s.st_dev,'inode':s.st_ino,'mtimeNs':s.st_mtime_ns})
dependencies=[a['preparationFreeze'],a['review']['freeze'],a['candidate']['constructionFreeze'],
    a['candidate']['sourceFreeze'],a['candidate']['artifact'],a['setup']['freeze'],
    a['setup']['RootAcceptance'],a['controllerDonor']['freeze']]
put('preimages.json',{'finiteDependencyPins':dependencies,'exactRelease':activation['inputAcceptance'],
    'grant':activation['grant'],'priorEventsReadOnly':prior,'sourceCopies':copies})
put('preparation-read-schema-error.json',{'status':'PRESERVED_NO_EFFECT_READ_ATTEMPT',
    'error':'SyntaxError in read-only Python schema-print comprehension; __name__ for omitted space',
    'ProductImports':0,'RuntimeEffects':0,'disposition':'pure inspection corrected before payload'})
put('preparation.json',{'status':'PURE_CONTROLS_BOUND','operation':activation['operation'],
    'inputDonor':a['preparationFreeze'],'inputReplica':pin(E/'freeze.json'),'copiedInputs':inputs,
    'sourceCopies':copies,'RuntimeCalls':0,'ProductImports':0,
    'sourceAuthorship':'exact input copies preserve original actors and attribution; no author transfer',
    'currentEventBeforePayload':event,'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()})
print(json.dumps({'status':'PURE_CONTROLS_BOUND','operation':activation['operation'],
    'strictCaller':pin(E/'f11/ordinary-caller.mjs'),'flowDriver':pin(E/'f11/flow-driver.mjs'),
    'currentEvent':event,'inputResourceBytes':a['resource']['manifest']['bytes']}))
