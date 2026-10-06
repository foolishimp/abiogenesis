from pathlib import Path
import datetime, hashlib, json, stat, subprocess, os

D=Path(__file__).resolve().parent
G=D.parent
def read(p): return json.loads(Path(p).read_bytes())
def digest(p):
    h=hashlib.sha256()
    with Path(p).open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()
def record(p):
    p=Path(p); assert not p.is_symlink(),p
    return {'path':str(p),'bytes':p.stat().st_size,'sha256':digest(p)}
def put(n,v):
    with (D/n).open('x') as f: json.dump(v,f,indent=2);f.write('\n')

activation=read(D/'worker-activation.json');assert activation['status']=='ACTIVE'
deps=read(D/'consumed-inputs.json');verified=[]
for dep in deps['dependencies']:
    f=dep['freeze'];assert record(f['path'])==f
    root=Path(f['path']).parent;cut=read(f['path'])
    for r in cut['records']:
        actual=record(root/r['path'])
        assert actual['bytes']==r['bytes'] and actual['sha256']==r['sha256'],r['path']
    verified.append({'freeze':f,'verifiedRecords':len(cut['records']),'conserved':True})
xfreeze=read(G/'final-f11-native-assessment-execution-01/freeze.json')
external=[]
for r in xfreeze['externalNativeArtifacts']:
    assert record(r['path'])==r
    external.append(r)
handoff=read(D/'initial-handoff.json');event=Path(handoff['reopenAuthority']['eventLogPath'])
current=record(event);st=event.stat();assert current['bytes']==73530699
assert 'sha256:'+current['sha256']==handoff['prefix']['prefixDigest']
assert (st.st_dev,st.st_ino)==(16777230,464012478)
assert record(deps['currentHandoff']['path'])==deps['currentHandoff']
assert record(deps['currentSnapshot']['path'])==deps['currentSnapshot']
resource=read(D/'resource-plan.json');lock=Path(resource['lockDirectory'])/'16777230-464012478.lock'
assert not lock.exists() and not lock.is_symlink()
future=Path(read(D/'effect-plan.json')['outputRoot']);assert not future.exists() and not future.is_symlink()
core=read(D/'selected-core.json');archive=record(core['artifactPath'])
assert 'sha256:'+archive['sha256']==core['basis']['artifactDigest']
for name in ['prefix-readiness.json','owner-readiness.json','syntax-checks.json','output-readback-joins.json']:
    assert read(D/name)['status']=='PASSED',name
prefix_process=read(D/'prefix-checks-process.json');owner_process=read(D/'owner-readiness-process.json')
assert prefix_process['exitCode']==owner_process['exitCode']==0

triage={
 'failure':'The frozen old caller consumes a genuine historical 84-prefix, but the admitted assessment failure advanced the same resource to genuine 136. Replaying it unchanged would cross currentness.',
 'ProductRequirementsDesign':'F11/F15 require exact qualification subject/law and authenticated actual judgments; existing Public/runtime owners govern prefixes, admission and reads. C02/Q02 and bound input remain unchanged; no missing runtime design established.',
 'Integration':'Actual producer is final-handoff.json from the CLOSED native assessment; successor consumes that exact producer instead of a guessed prefix/header. Current projection and actual owner preparation pass. Future readbacks use the actual later returned Run/close.',
 'IdentityAuthority':'Same physical dev 16777230/inode 464012478, W/operator/authority/install/lock/productSet/catalog. Owner coordinate and raw byte digest are separate and checked. New external request/report namespace does not alter task/plan or runtime authority.',
 'LifecycleEffects':'Previous failure is conserved legal history. Offline queries append no events or obtain locks. New actual136 close is only a predecessor for one later declared occurrence; no reset, rebase, fake handoff, retry loop or imported driver.',
 'Proof':'67 caller,66 bound and80 execution records plus5 native archives are conserved. Three owner negatives reject stale-current, crossed digest and foreign binding. Static Program/full-render evidence is reused; genuine raw/J and fresh readbacks remain future evidence.',
 'Cost':'Only changed current-resource/environment and external request/output joins were recomputed. Pure prefix read5.3s/1.92GB RSS; pure start preparation19.3s/4.14GB RSS. No full render/body restaging/campaign, paid traffic or cost-based semantic pass.',
 'escapeCause':'The earlier caller was correctly frozen before its native append. It is no longer a current-resource caller; repeating frozen scripts without consuming the actual legal close would introduce caller/proof drift, not an ABG-calculus defect.',
 'smallestReentry':'external caller realization_refactor for current-prefix/output-path joints, owned by separately activated Worker; same existing Product contracts and finite five-call plan',
 'affectedCone':'new external caller/resource/environment/activation/output/readback joins and their actual proof. All accepted Hello/S01/S6, selected continuation, C02/Q02 and bound task/input/render are preserved.',
 'uncertainty':['Actual provider access remains unavailable','Actual raw semantic assessment/J/Result and native readbacks unperformed','Historical author/grant and assessor independence adequacy','Complete F11/AF22/RC1 remains open']}
put('triangulation.json',triage)
put('conservation.json',{'status':'VERIFIED','dependencies':verified,'externalNativeArtifacts':external,
 'currentResource':current,'initialHandoff':deps['currentHandoff'],'immutableArchive':archive,
 'device':st.st_dev,'inode':st.st_ino,'events':136,'lockAbsent':True,'eventBytesUnchanged':True,
 'original 84BytesConserved':True,'futureOutputRootAbsent':True,'nativeCalls':0,'modelCalls':0,
 'sourceGitInstallWorksiteEffects':False,'fullRenderRepeated':False,'boundBodiesRestaged':False})
put('readiness.json',{'status':'CLOSED','disposition':'candidate_ready_requires_native_prerequisite_and_separate_grant',
 'activation':activation['operation'],'actor':activation['actor'],'controlBasis':'stdo://releases/v2.5.1-rc.2/',
 'candidateQualificationLaw':'Immutable C02/Q02 RC1','initialHandoff':deps['currentHandoff'],
 'currentPrefix':handoff['prefix'],'checks':['actual current-prefix/read-only environment','actual pure installed start owner','three stale/crossed negatives','syntax9checks','output/readback contract joins','all dependency/artifact conservation'],
 'nativeReadyNow':False,'nativeCalls':0,'modelCalls':0,'probeCalls':0,'CLIInvocations':0,
 'fullRenderRepeated':False,'futureOutputRoot':str(future),'operationPlan':read(D/'budgets.json')['operationPlan'],
 'laterNativeActivation':read(D/'effect-plan.json')['activationFields'],
 'cost':{'prefix':prefix_process,'owner':owner_process},
 'residuals':triage['uncertainty'],
 'claim':'One exact CLOSED successor caller with genuine 136 input and concrete future five-call effect plan. Readiness is mechanical; not native execution, semantic context sufficiency, F11, AF22 or RC1 acceptance.'})
put('construction-attribution.json',{'kind':'external_worker_construction','activation':activation['operation'],
 'actor':activation['actor'],'writeTerritory':str(D),'control':activation['control'],
 'allocationAmendment':activation['allocationAmendment'],'changeClass':'realization_refactor',
 'newConstruction':'External successor caller/current-resource/readiness/effect-plan/closure only',
 'reused':{'caller':verified[0]['freeze'],'binding':verified[1]['freeze'],'execution':verified[2]['freeze']},
 'assessmentSemanticAuthorship':'Unchanged historical declarations and residuals. No historical author or independent acceptance is manufactured.',
 'nativeCalls':0,'closed':True})

sections=[
 {'label':'Outcome','text':'CLOSED — successor caller ready for one later separately granted native assessment when actual provider access is usable. No native, model, probe, Public CLI, store, lock or archive effect occurred. Root receives readiness; F11/AF22/RC1 acceptance is not claimed.'},
 {'label':'Exact current resource','text':'The successor consumes the genuine 136-event 73,530,699-byte final-handoff.json (1330 B/SHA256 b0cbc1aa5fb746cb2892fd889d03077c01c7fd99dc108900cd35874a256f1a2a). Same store dev 16777230/inode 464012478, raw prefix 146ff8220cfb3e4a9edae4148a955ae936a3dc9aa4c8b1e0da4345ead771d20c, owner coordinate bf357bac4ba5677870972d63726db8e1ab50fd349b48d87ad8e4768201bb80ce. Current resource and original 84 bytes are conserved; original lock remains absent. Derived prefix/artifact projection advances; install, W, authority, productSet, lock and catalog remain identical.'},
 {'label':'Unchanged assessment','text':'Bound input/render are reused without restaging 39 whole bodies or rerendering the 1,021,244-byte prompt. Task acf5b524e60a6b391109215c4a403bfa13b4b175f9547204fbd86aad0248dd85 and plan c97523f6a25977187211cf35060642c2a57b4949a2e3705345c0ef0eb4444e98, strict task/plan input, native Program qualification/assess@5, actual assessment-raw@5, original N03 actor, policy, grant and authority are unchanged. C02/Q02 recorded RC1 qualification law and accepted evidence stay frozen; STDO 2.5.1 RC2 governs this Worker.'},
 {'label':'Readiness evidence','text':'Actual read-only owner environment/currentness checks passed. Three negatives discriminate raw/coordinate crossing, foreign WorkspaceBinding digest and old 84 used as current. Actual pure installed ProductRunInvocationPort.prepare returned prepared_product_run_invocation with unchanged policy/grants/authority/input digest. Nine syntax checks passed without driver import. Separate future output and actual-returned-Run/latest-close readback relations are retained. All 67 caller, 66 binding and 80 execution records, five native archives and exact C02 archive were reverified unchanged.'},
 {'label':'Later effect plan','text':'effect-plan.json names exactly five ordinary calls: assessment view, exact assessment Program conformance, one start, separate fresh result and replay reads. New output is final-f11-native-assessment-execution-02; its directory is not created by this Worker. Future activation T287_F11_NATIVE_ASSESSMENT_02 must cite this CLOSED freeze, unchanged bound freeze, genuine 136 handoff, usable actual native provider evidence and exact new Root grant. Runtime alone may append the original store, acquire/release its original device/inode lock, author actual-attempt transport archives and use original verification/runtime TMPDIR. These effects require the later separate grant. Existing 4096 MiB/900000 ms inactivity/1200000 ms absolute/1440000 ms CLI/2400000 ms outer envelope is unchanged. No C2 is prepared against a prefix F11 will advance.'},
 {'label':'Triangulation','text':'The first changed relation is the external caller/current-resource join after a lawful native close. Product/Design retain existing exact-subject owners; Integration consumes the real handoff; Identity preserves install/W/authority; Lifecycle conserves failed history; Proof separately checks raw bytes, owner coordinates, expected negatives and current environment. Smallest repair is external caller realization_refactor. No runtime/Product/source design miss or accepted Hello/continuation reproof is established by this change.'},
 {'label':'Cost and residuals','text':'Pure prefix check took 5,304.565 ms/1,920,778,240 B peakRSS. Pure current-owner preparation took 19,312.705 ms/4,142,678,016 B peakRSS; managed 4096 MiB Node old-space is not an RSS cap. No paid traffic or native dispatch. Provider access is unavailable; live nominal verification, actual raw/J/readbacks, semantic context adequacy, applicability and historical-author/assessor-independence remain explicit. Mechanical readiness does not discharge any of those findings. Return to Root and stop; no Reviewer activation.'}]
put('return-sections.json',sections)
ac=Path('/Users/jim/src/apps/abiogenesis/.genesis/development-products/axiom-indexer/build_tenants/core/code/ac.py')
assert digest(ac)=='5a2e0cb503cf598bbaea215270373b87a0928222be272f33d951550b0d16e6c8'
env={**os.environ,**read(D/'preparation-environment.json')}
p=subprocess.run(['python3',str(ac),'join','--input',str(D/'return-sections.json'),'--output',str(D/'return.md')],cwd=D,env=env,capture_output=True,text=True)
assert p.returncode==0,(p.stdout,p.stderr)
put('return-join.json',{'tool':record(ac),'entry':'a_c join','exitCode':p.returncode,
 'stdout':p.stdout,'stderr':p.stderr,'input':record(D/'return-sections.json'),'output':record(D/'return.md')})
activation['status']='CLOSED';activation['closedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
(D/'worker-activation.json').write_text(json.dumps(activation,indent=2)+'\n')
put('closure.json',{'status':'CLOSED','activation':activation['operation'],'actor':activation['actor'],
 'disposition':'candidate_ready_requires_native_prerequisite_and_separate_grant','remainingProcesses':[],
 'nativeCalls':0,'modelCalls':0,'probeCalls':0,'protectedEffects':False,'rootReturn':'readiness.json, effect-plan.json, return.md and this exact CLOSED freeze'})
records=[]
for p in sorted(D.rglob('*')):
    assert not p.is_symlink(),p
    if not p.is_file() or p.name=='freeze.json':continue
    r=record(p);r['path']=str(p.relative_to(D));r.update(kind='file',mode=stat.S_IMODE(p.stat().st_mode));records.append(r)
put('freeze.json',{'kind':'worker_closed_freeze','activation':activation['operation'],'actor':activation['actor'],
 'status':'CLOSED','disposition':'candidate_ready_requires_native_prerequisite_and_separate_grant',
 'timestamp':activation['closedAt'],'controlBasis':'stdo://releases/v2.5.1-rc.2/',
 'candidateQualificationLaw':'Immutable C02/Q02 RC1','records':records,'writeTerritory':str(D),
 'boundInputFreeze':read(D/'bound-input-pin.json')['freeze'],'initialHandoff':deps['currentHandoff'],
 'currentPrefix':handoff['prefix'],'executionOutputRoot':str(future),'nativeCalls':0,
 'claim':'Exact successor preparation only; native prerequisite unavailable, actual semantic assessment/qualification unproved.'})
print(json.dumps({'status':'CLOSED','freeze':record(D/'freeze.json'),'records':len(records),'nativeCalls':0,'modelCalls':0}))
