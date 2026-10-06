from pathlib import Path
import json,hashlib,difflib,subprocess,datetime
D=Path(__file__).resolve().parent
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_bytes())
def put(n,v):
    with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
with (D/'syntax-final-driver.stdout').open('xb') as out,(D/'syntax-final-driver.stderr').open('xb') as err:
    p=subprocess.run(['python3',str(D/'observe-process.py'),str(D/'syntax-final-driver.process.json'),'node','--check',str(D/'driver.mjs')],cwd=D,stdout=out,stderr=err,timeout=120)
    assert p.returncode==0
for r in read(D/'consumed-inputs.json'):
    b=Path(r['path']).read_bytes()
    assert len(b)==r['bytes'] and sha(b)==r['sha256'],r['path']
for n in ['ordinary-caller.mjs','public-support.mjs','owner-checks.mjs']:
    before=(D/'preimages'/n).read_text();after=(D/n).read_text()
    (D/(n+'.patch')).write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='donor/'+n,tofile='caller/'+n)))
effect=read(D/'effect-plan.json');cost=read(D/'offline-readiness.process.json')
effect['actualOfflinePreparationCost']=cost
(D/'effect-plan.json').write_text(json.dumps(effect,indent=2)+'\n')
pin=read(D/'bound-input-pin.json');budgets=read(D/'budgets.json');joins=read(D/'offline-native-owner-joins.json')
put('closure.json',{'status':'CLOSED','disposition':'candidate_ready','activation':'T287_F11_NATIVE_CALLER_PREP_01',
 'controlBasis':'stdo://releases/v2.5.1-rc.2/','candidateLaw':'Immutable C02/Q02 RC1',
 'actualInput':pin['assessmentInput'],'boundFreeze':pin['freeze'],'promptBytes':1021244,'inputCanonicalBytes':67784040,
 'actualOfflineOwnerKind':joins['kind'],'rootActorRef':joins['rootActorRef'],'policy':joins['policy']['policyRef'],
 'grant':joins['grants'][0]['grantRef'],'writeTerritory':str(D),'futureExecutionTerritory':effect['outputRoot'],
 'nativeCalls':0,'movingResourceReads':0,'providerCalls':0,'driverImported':False,'sourceWrites':False,
 'checks':'Actual strict input/render equality, ordinary installed start construction, ProductRunInvocationPort.prepare, producer operation constants and final syntax pass. Reuse crossed binding refusal from CLOSED bound-input Worker.',
 'next':'Root verifies this freeze and records exact separate native execution activation/grant; driver requires five ordinary calls/one assessment, actual handoff and two fresh reads.',
 'hardStops':['absent exact later native activation/grant','changed frozen input/caller/declarations or changed original current resource identity/prefix','ordinary setup or actual owner refusal','absent lawful process closure/returned handoff for fresh reads'],
 'unknowns':['actual provider/account/context acceptance','native admission/JSON/event growth and memory cost','actual J raw semantic/attribution findings and assessment-author independence adequacy','full F11/AF22 qualification'],
 'notPrerequisites':['green tenant-result claim','successful C2','executionSelectionRef for this rule role','shell DNS success'],
 'budgets':budgets,'observedOfflineCost':cost,'remainingPrepFields':[]})
put('construction-attribution.json',{'activation':'T287_F11_NATIVE_CALLER_PREP_01','worker':'/root/f11_validation_path_plan',
 'authorityRequest':read(D/'worker-activation.json')['grant'],'territory':str(D),'preimages':'preimages/* pinned donor files',
 'deltas':['ordinary-caller.mjs.patch','public-support.mjs.patch','owner-checks.mjs.patch'],
 'construction':'External ordinary assessment caller, frozen declaration/view/conformance resources, exact CLOSED bound-input pin, native evidence/readback checks and finite separate execution effect plan',
 'newAssetAuthor':'/root/f11_validation_path_plan under this exact prep grant',
 'originalCandidateAuthors':'Unchanged; this record does not establish historical semantic authors, acknowledgments or independent acceptance',
 'nativeEffects':False,'original84Prefix':'Conserved frozen snapshot; moving original store not opened in prep',
 'sourceOrCandidateChanges':False,'qualificationVerdict':None})
text=f'''CLOSED — candidate_ready for separately granted native execution.

The prepared caller uses existing installed `constructInstalledPublicDefinitionCall`, package-declared `abg.cli --jsonl`, actual execution-resolution/policy/grant/input owners and `ProductRunInvocationPort.prepare`. The focused offline preparation returned `prepared_product_run_invocation`; its exact full call is retained in `offline-start-call.json`, with policy/authority/grant joins in `offline-native-owner-joins.json`. Strict input is exactly `qualification_assessment_input{{task,plan}}`; Program is `program://abiogenesis/qualification/assess@5`, GraphFunction is the actual `QUALIFICATION_IDS.assessGraph`, and the final raw contract is `assessment-raw@5`. The original N03 operator owns the plan. There is one F_P leaf, zero interaction leaves and no run-environment declaration/resource.

Only CLOSED bound input is selected: freeze `{pin['freeze']['sha256']}`, task `{joins['task']['digest']}`, plan `{joins['plan']['digest']}`. The unchanged actual owner prompt is 1,021,244 UTF-8 bytes, all 39 whole bodies/all ten hosts. Complete native admission input is 67,784,040 canonical bytes (82,175,295 retained file bytes); full scope/declarations/provenance are conserved. Source-grounded falsified, indeterminate and insufficient attribution are retained. The narrow crossed Product-content/installed-Product binding refusal is already CLOSED in the bound-input return.

The exact future sequence is CatalogView allowlist, assessment Program gtl_program conformance, one ordinary run.invoke/start, and two separate run_result/run_replay reads. Start must return a genuine legal close handoff and actual Run; both reads precede semantic proof assertions even on a closed failed/no-J outcome. No retry/second assessment occurs. An actual J yields a subordinate `qualification_proof_resource` authenticated with public `projectQualificationJudgment`; no replacement consumer CCall or final F11/AF22 authority is manufactured.

Execute with an explicit new output root: `{effect['outputRoot']}`. Caller and binding directories are frozen read-only. `effect-plan.json` gives exact argv, Root activation fields and every declared territory: new caller reports, Runtime-only append to the original store, original device/inode lock namespace, existing actor transport archive files and original verification/runtime TMPDIR. No worksite/source/Git effects, Hello restart or C2 dispatch. Actual transport is the existing Claude closed_prompt_proof path, model claude-opus-5-5/xhigh, no tools. Original HOME/auth context is inherited; no redirected user-state guarantee is invented.

Root-selectable finite envelope: Node old-space 4096 MiB; actor inactivity 900,000 ms/absolute 1,200,000 ms/grace 1,000 ms; setup and read each 180,000 ms; assessment CLI 1,440,000 ms; preflight 180,000 ms; outer total 2,400,000 ms plus 1,000 ms termination grace. There is no installed OS/Claude RSS hard cap or provider context-capacity pass. The pure full owner preparation actually took {cost['elapsedMs']} ms and peaked at {cost['peakRSSBytes']} RSS bytes. Native process timings/peakRSS, event-byte growth, exact actual request/transport/raw response/J/Result/handoff and cold reads will be retained by the actual execution.

No remaining preparation field blocks Root's follow-on exact grant. Provider availability, native serialization/admission cost, actual semantic/author-independence findings and full F11 remain truthful unknowns. Shell DNS success, a green tenant result and successful C2 are not extra gates. This return is readiness evidence, not native execution or qualification acceptance. Governing control is STDO 2.5.1 RC2; immutable candidate/evidence law remains RC1.
'''
with (D/'return.md').open('x') as f:f.write(text)
records=[]
for p in sorted(D.rglob('*')):
    if p.is_file() and p.name!='freeze.json':
        assert not p.is_symlink()
        b=p.read_bytes();records.append({'path':str(p.relative_to(D)),'kind':'file','mode':p.stat().st_mode&0o777,'bytes':len(b),'sha256':sha(b)})
put('freeze.json',{'kind':'external_worker_frozen_return','activation':'T287_F11_NATIVE_CALLER_PREP_01','status':'CLOSED','disposition':'candidate_ready',
 'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'controlBasis':'stdo://releases/v2.5.1-rc.2/',
 'candidateQualificationLaw':'Immutable C02/Q02 RC1','records':records,'boundInputFreeze':pin['freeze'],
 'writeTerritory':str(D),'executionOutputRoot':effect['outputRoot'],'nativeCalls':0,
 'claim':'Actual offline owner joins pass; requires separate Root native activation. No qualification/J verdict.',
 'conservation':'Prior cut/source/candidate/native store/lock/tmp bytes not written. Only this exact external prep territory changed.'})
b=(D/'freeze.json').read_bytes()
print(json.dumps({'status':'CLOSED','disposition':'candidate_ready','freeze':{'path':str(D/'freeze.json'),'bytes':len(b),'sha256':sha(b)},'records':len(records),'bytes':sum(r['bytes'] for r in records),'executionOutputRoot':effect['outputRoot']}))
