"""Preparation-only exact donor wiring. No Product imports or resource reopening."""
from pathlib import Path
import hashlib,json,shutil,os,stat

E=Path(__file__).resolve().parent;G=E.parent;R=G/'f11-carrier-installed-execution-09'
Q=G/'final-qualification-inputs-15';S=G/'f11-carrier-installed-setup-09'
def read(p):return json.loads(Path(p).read_bytes())
def sha(p):
    with Path(p).open('rb')as f:return hashlib.file_digest(f,'sha256').hexdigest()
def pin(p):
    p=Path(p);return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)}
def put(n,v):
    with(E/n).open('x')as f:json.dump(v,f,indent=2,ensure_ascii=False);f.write('\n')

activation=read(E/'preparation-activation.json');assert not activation['runtimeActivated']
for n in ['f11','donors','retained','controls','task-config','task-tmp','task-cache']:(E/n).mkdir()
copies=[]
def copy(source,dest):
    assert not dest.exists();shutil.copyfile(source,dest);os.chmod(dest,stat.S_IMODE(Path(source).stat().st_mode))
    a,b=pin(source),pin(dest);assert(a['bytes'],a['sha256'])==(b['bytes'],b['sha256'])
    copies.append({'source':a,'copy':b,'bodyExact':True,'originalAttributionTransferred':False})
for name in ['ordinary-caller.mjs','flow-driver.mjs','public-support.mjs','public-outcomes.mjs',
             'prepare-resources.mjs','conformance-resources.mjs','source-delta-contract.mjs']:
    copy(R/'f11'/name,E/'f11'/name)
copy(R/'f11/proof-oracles.mjs',E/'donors/proof-oracles.mjs')
code=(R/'f11/proof-oracles.mjs').read_text()
old="assert.equal(owner.kind,'prepared_product_run_invocation',JSON.stringify(owner));"
new="assert.equal(owner.kind,'prepared_product_run_invocation','actual Product preparation must return the prepared owner kind');"
assert code.count(old)==1
(E/'f11/proof-oracles.mjs').write_text(code.replace(old,new))
assert sha(E/'f11/ordinary-caller.mjs')=='af8b5625275c3fcdd11b9838505d942c62a12651f65fb6b90434289df970c676'
assert sha(E/'f11/flow-driver.mjs')=='dda353346f8c66b49d506090697e453b07f9451e7c61e16900ab26c7b5f4cf51'
for name in ['close-runtime.py','run-flow.mjs']:copy(R/name,E/'donors'/name)
for name in ['actual-assessment-proof.json','flow-parent-stdout.json','flow-assess-run_result-stdout.json',
             'flow-assess-run_replay-stdout.json','closed-event-resource-handoff.json','appended-runtime-records.json']:
    copy(R/name,E/'retained'/name)
copy(Q/'freeze.json',E/'freeze.json')
copy(Path(activation['subjectPins']['actualInputAcceptance']['path']),E/'base-input-acceptance.json')
for name in ['observe-process.py','supervise.py']:copy(R/name,E/name)
for name in ['budgets.json','caller-budget-proposal.json','selected-core.json','prospective-cases.json','parent-selection.json']:
    copy(R/name,E/name)
for name in ['worker-request.txt','triage.md','subject-pins.json','runtime-request.txt']:
    copy(G/'rc1-runtime09-proof-consumer-controls-01'/name,E/'controls'/name)
for name in ['npmrc','globalnpmrc']:(E/'task-config'/name).write_text('offline=true\nignore-scripts=true\naudit=false\nfund=false\n')
env=read(R/'runtime-environment.json')
for k,v in list(env.items()):env[k]=v.replace(str(R),str(E))
# No helper is staged or invoked in the remaining deterministic route.
env.pop('ABG_TS_CLAUDE_COMMAND',None)
put('runtime-environment.json',env)
accepted=read(E/'base-input-acceptance.json');h=read(R/'closed-event-resource-handoff.json')
positive=G/'rc1-runtime09-positive-acceptance-01/acceptance.json'
positive_pin=pin(positive)
assert(positive_pin['bytes'],positive_pin['sha256'])==(15036,'9348c2a734d959d45c006a1cadab1346322d93976226e394971d794ad4cd4498')
copy(positive,E/'controls/original-positive-acceptance.json')
event=h['physical'];current=pin(event['path']);s=Path(event['path']).stat()
assert(current['bytes'],current['sha256'],s.st_dev,s.st_ino)==(2844807,'374f6dddb7191acb4da6e9e5d093d4e247fcddb2139ece8dcd4c90159b9596a5',16777230,464941019)
put('resource-plan.json',{'eventLogPath':event['path'],'initialPrefixBytes':event['bytes'],
    'initialPrefixSha256':event['sha256'],'eventDevice':event['device'],'eventInode':event['inode'],
    'initialHandoffDigest':h['handoffDigest'],'originalSetupPrefix':accepted['setup']['authenticCloseHandoff']['prefix'],
    'allowedNewOwnerScopedResourceRoots':accepted['setup']['resourceRoots'],'RuntimeActivated':False})
cfg={'status':'PREPARATION_ONLY','runtimeOperation':'T287_F11_C09_CARRIER_EXECUTION_10',
    'preparationOperation':activation['operation'],'Q08Root':str(E),'originalQ08Root':str(Q),
    'Q08FreezeSHA256':sha(Q/'freeze.json'),'actualSetupStateFile':str(S/'setup-state.json'),
    'currentInstalledRoot':accepted['candidate']['actualInstalledRoot'],
    'originalRuntimeFreeze':pin(R/'final-runtime-freeze.json'),
    'originalPositiveAcceptance':positive_pin,
    'inputPacket':pin(Q/'f11-bound-packet.json'),'inputManifest':pin(Q/'f11-bound-resource-manifest.json'),
    'originalProof':pin(E/'retained/actual-assessment-proof.json'),
    'currentClosedHandoff':pin(E/'retained/closed-event-resource-handoff.json'),
    'sourceCopies':[r for r in copies if r['copy']['path'].endswith(('.mjs','.py'))],
    'requiredBeforePayload':['Root accepted independently assured original Runtime09 positive companion',
      'Root accepted independently GO CLOSED consumer preparation','exact new Root acceptance pin and separate release message'],
    'noParentOrActorReexecution':True,'remainingCompletedRuns':2,'remainingFreshReads':4}
put('driver-config.json',cfg)
put('runtime-activation.template.json',{'kind':'root_runtime_execution_activation','operation':cfg['runtimeOperation'],
    'actor':'/root/native_applicability_design','actorRef':accepted['setup']['currentActor'],'executionRoot':str(E),
    'preparationFreezeSHA256':cfg['Q08FreezeSHA256'],'consumerPreparationFreeze':None,
    'inputAcceptance':None,'RootSeparateMessageRelease':False,'realProviderCalls':0,'runtimeActivated':False})
put('runtime-release.template.json',{'operation':cfg['runtimeOperation'],'inputAcceptance':None,
    'RootSeparateMessageRelease':False,'RootMessage':None,'originalPositiveCompanionAccepted':False,
    'consumerPreparationAccepted':False})
census=read(R/'owner-resource-census.json')
put('setup09-initial-entry-pins.json',{'setupRoot':str(S),
    'records':[dict(r,path='resources/'+r['path'])for r in census['actualFiles']],
    'directories':[dict(r,path='resources/'+r['path'])for r in census['actualDirectories']],
    'authority':'actual frozen Runtime09 final census; future Root positive-companion acceptance required'})
pre=read(R/'preimages.json')
pre['finiteDependencyPins'].extend([pin(R/'final-runtime-freeze.json'),pin(R/'closed-event-resource-handoff.json')])
pre['finiteDependencyPins'].append(positive_pin)
pre['priorEventsReadOnly']=[r for r in pre['priorEventsReadOnly']if r['path']!=event['path']]
put('preimages.json',pre)
put('donor-correspondence.json',{'operation':activation['operation'],'copies':copies,
    'oracleBefore':pin(R/'f11/proof-oracles.mjs'),'oracleAfter':pin(E/'f11/proof-oracles.mjs'),
    'exactDelta':{'before':old,'after':new},'frameworkSourceChanges':0,'ProductImports':0,
    'strictCallerAndOriginalFlowDriverExact':True,'inputResourceBorrowed':cfg['inputManifest'],
    'originalJAndTwoColdReadsBorrowedWithOriginalAttribution':True})
put('destination-lifecycle.json',{'borrowedImmutable':['original C09/Setup09/Q15','Runtime09 J/proof/two readbacks/current close','exact ordinary caller and original flow driver'],
    'newOwnedDescriptors':['current continuation config','bounded oracle diagnostic','contract-aware finalizer','future activation/release templates'],
    'freshFutureOutputs':['runtime-activation.json','runtime-release.json','flow supervisor receipts','F11/AF22 calls and four reads','actual consumption checks','success or first-failure reports','final-runtime-freeze.json'],
    'classificationBeforeCopies':True,'exclusiveCreateProducerReplay':False,'RuntimeActivated':False})
print(json.dumps({'status':'PREPARATION_ONLY_WIRED','operation':activation['operation'],
    'oracle':pin(E/'f11/proof-oracles.mjs'),'originalJ':cfg['originalProof'],'event':event,'ProductImports':0,'RuntimeEffects':0}))
