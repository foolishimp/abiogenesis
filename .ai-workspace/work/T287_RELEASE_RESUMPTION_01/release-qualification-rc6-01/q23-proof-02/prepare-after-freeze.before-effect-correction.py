"""One-use operator proof packet; only runs after the actual native source freeze and close."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, shutil, subprocess
Q=Path(__file__).resolve().parent
D=Q.parent
A=D/'q23-author-06'
C=Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut')
I='qualification-inputs/q23-proof-02'
T='build_tenants/abiogenesis/typescript'
now=lambda:datetime.now(timezone.utc).isoformat()
def obj(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def put(p,v):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
 p.write_text(v if isinstance(v,str) else json.dumps(v,indent=2)+'\n')
subject=A/'review-subject-001/SUBJECT.json'
held=obj(subject)
resume=A/'execution/after-run-resume.json'
assert resume.is_file() and obj(A/'HOST_RESULT.json')['exitCode']==0
actualClose=obj(A/'FINAL_RUNTIME_CLOSE.json')
assert actualClose['status']=='COMPLETED_SOURCE_RETURN_FROZEN_UNACCEPTED'
assert actualClose['source']['sha256']==pin(subject)['sha256']
assert held['status']=='OBSERVED_NATIVE_SOURCE_FROZEN_C2_PENDING'
assert subprocess.check_output(['/usr/bin/git','-C',str(C),'rev-parse','HEAD'],text=True).strip()==held['sourceCommit']
for f in held['files']:assert pin(C/f['path'])['sha256']==f['sha256'],f['path']
author=obj(A/'workload.json')
selected=author['testing']['selectedPaths']
for p in obj(A/'EXPECTED_FUTURE_FILES.json'):
 n=Path(p).name;assert pin(C/p)['sha256']==pin(A/'review-subject-001'/n)['sha256'],p
profile=obj(A/'PROVIDER_PROFILE.json')
profile['provider']['command']=str(Q/'claude-provider.sh')
profile['provider']['appendArgs']=['--effort','max']
profile['provider']['maxTurns']=128
profile['provider']['absoluteTimeoutMs']=3600000
profile['providerScratch']=str(C/'tmpq23p2')
profile['continuationStanding']='Clean proof-only context, no author conversation or coding work order.'
put(Q/'PROVIDER_PROFILE.json',profile)
put(Q/'claude-provider.sh','#!/bin/sh\nTMPDIR='+str(C/'tmpq23p2')+'\nNPM_CONFIG_CACHE='+str(C/'tmpq23p2/npm-cache')+'\nexport TMPDIR NPM_CONFIG_CACHE\nexec '+profile['realClaude']+' "$@"\n')
(Q/'claude-provider.sh').chmod(0o755)
frame=obj(A/'ROOT_SELECTION.json')['productFrame']
grant={
 'kind':'root_q23_proof_only_reentry','recordedUtc':now(),'role':'Root Executive -> bound operator Writer for existing proof controls; no Product writes',
 'productFrame':frame,'authority':pin(D/'ROOT_ACTIVATION.json'),'sourceCommit':held['sourceCommit'],'worksite':str(C),'frozenSubject':pin(subject),
 'previousConstructionResult':held['nativeResultRef'],'actualResume':pin(resume),'bindingSelection':pin(D/'native-author-binding-01/CONSUMER_BINDING_RETAINED.json'),
 'route':'Existing default-library Testing/UAT, source:none; actual current observed source, no injected predecessor state; exact original consumer binding/catalog/view with latest owned close.',
 'reuseBoundary':'Native author result and frozen source are retained evidence; no copied observations, synthesis or subjectEvidenceRef. Review runs separately alongside proof and Root conjoins later.',
 'target':'Bounded Q1-Q7 on current compiled candidate: six declared commands, six full modules, zero failures/skips/cancelled/todo, meaningful owner-path predicates; native UAT plus fresh closure.',
 'sourceWriteRoots':[],'writeTerritory':[str(Q),str(C/I),str(C/'tmpq23p2'),'/private/tmp/abg-q23f'],
 'runtimeEffects':'Existing ABG event admission and one isolated command sandbox; only selected report/build/dependency territories. No native coding Worker.',
 'provider':{'profile':pin(Q/'PROVIDER_PROFILE.json'),'maximumConcurrentCodingWorkers':0,'automaticRetry':False},
 'stops':['Source/close/binding mismatch','Missing material or owner refusal','Any attempted source edit or new coding task'],
 'exitLimits':['Native UAT is component feedback, not independent same-family acceptance.','No actual production Q23 eligibility, QR02, F11, qualification or release closure.','Preserve all failures, untracked work and immutable releases.']}
put(Q/'PROOF_ONLY_GRANT.json',grant)
task='''# Q23 current-source component proof

Product Frame: ABIogenesis5 fixed fifteen families, GOAL-035/T-287/F11-F15, exact STDO3.0.4. Prove the returned configured-identity/policy increment against the unchanged Product and selected Q1-Q7 rubric. This is bounded component evidence; actual production independent eligibility, QR02 and full F11/release remain open.

Select immediate Testing of current observed files with subjectEvidenceRef=null. Only testing and uat work orders exist. Initial observations and synthesis are empty; source:none. No construction, design, induction, specification or source writes. The prior author return is source custody, not successful C2 or injected native state. Historical failures and intermediate green results remain separately scoped.

Execute exactly six prescribed commands: current-source correspondence, clone declared offline dependencies, clone immutable contract seeds, compile current TypeScript, canonical Product generation, and the two finite test lanes covering all six selected modules. Do not use installed RC6 executable code as candidate code. Preserve all current test assertions, at least23 transport and35 qualification tests, zero skipped/failed/cancelled/todo. Actual complete population may be higher. Do not repeat a historical baseline or full qualification campaign.

The containing test_env/test_runs subtree is the declared report territory. Use /private/tmp/abg-q23f for test temporary effects. Report source hashes and exact command stdout report.path/bytes/sha256. UAT may read those exact returned reports, not guessed archive siblings or private provider logs. It must inspect the actual assertions and explicit synthetic lower-owner premises for Q1-Q7; counts alone do not establish semantic sufficiency.

Assess the unchanged Q1-Q7 rubric on the exact current source and actual C2. Unknown prior attribution and different-family routing remain unresolved production prerequisites; a component positive cannot establish them. Root independently reviews the frozen source in parallel and conjoins fresh result/replay/final close later. Those Root duties are outside native unresolvedCriteria. Any materially different failure returns to Root without coding or automatic retry. No Git, selector, publication, release or actual human-acceptance action.
'''
put(Q/'inputs/TASK.md',task)
put(Q/'inputs/PROOF_ONLY_GRANT.json',grant)
put(Q/'inputs/FROZEN_SUBJECT.json',{'kind':'frozen_q23_subject_coordinates','subject':pin(subject),'sourceCommit':held['sourceCommit'],'nativeResultRef':held['nativeResultRef'],'afterObservationDigest':held['afterObservationDigest'],'diff':held['diff'],'limits':'Physical frozen source correspondence; not C2 or release acceptance.'})
put(Q/'inputs/ROOT_PROFILE_DISPOSITION.json',obj(D/'q23-author-05/ROOT_PROFILE_DISPOSITION.json'))
rootreads=[I+'/'+n for n in ['TASK.md','PROOF_ONLY_GRANT.json','FROZEN_SUBJECT.json','ROOT_PROFILE_DISPOSITION.json']]
readfirst=rootreads+['qualification-inputs/q23-author-06/'+n for n in ['rubric.json','C2_INPUTS.json','METHOD_ACCESS.json','ROOT_POLICY_HOW_SELECTION.json']]
order={'outcome':'Prove frozen Q23 current source through exact declared C2 and bounded UAT.','instructions':['Immediate Testing of current observed files, subjectEvidenceRef=null; complete six-command plan, then Q1-Q7 UAT. No coding or repair.'],'readFirst':readfirst,'writeRoots':[],'checks':[]}
uat={**author['workOrders']['uat'],'readFirst':list(dict.fromkeys(readfirst+author['workOrders']['uat']['readFirst'])),'writeRoots':[]}
assert len(uat['readFirst'])==len(set(uat['readFirst']))
sources=[{'path':I+'/'+p.name,'digest':'sha256:'+pin(p)['sha256']} for p in sorted((Q/'inputs').iterdir())]
for p in ['qualification-inputs/q23-author-06/'+n for n in ['rubric.json','ROOT_POLICY_HOW_SELECTION.json','METHOD_ACCESS.json']]+['stdo_abiogenesis.json','specification/PRODUCT.md','specification/requirements/product/REQ-P-QUAL.md']:
 sources.append({'path':p,'digest':'sha256:'+pin(C/p)['sha256']})
w={**author,'taskRef':'task://abiogenesis/t287/release-qualification/q23-proof-02','task':task,'sources':sources,'readRoots':sorted(set(selected+rootreads)),'workOrders':{'testing':order,'uat':uat},'assessment':{**author['assessment'],'sources':sorted(set(author['assessment']['sources']+rootreads))},'authorityRefs':[p.as_uri() for p in [D/'ROOT_ACTIVATION.json',Q/'PROOF_ONLY_GRANT.json']],'requiredSupportRefs':['support://abiogenesis/t287/q23-proof-02']}
put(Q/'workload.json',w);put(Q/'EXPECTED_FUTURE_FILES.json',[])
# Only known authoritative consumer objects are restored. Its historical close is never used.
s=(D/'fixture-proof-02/prepare-r1.mjs').read_text().replace('fixture-01/execution/after-run-resume.json','q23-author-06/execution/after-run-resume.json').replace("runId:'release-qualification-fixture-proof-02'","sourceCommit:grant.sourceCommit,runId:'release-qualification-q23-proof-02'")
needle="const w=await json(join(dir,'workload.json')),grant=await json(join(dir,'PROOF_ONLY_GRANT.json')),work=retained.workspaceAuthority.canonicalRoot;"
assert needle in s
s=s.replace(needle,needle+"\nconst priorConsumer=await json(join(campaign,'native-author-binding-01/CONSUMER_BINDING_RETAINED.json'));assert.equal(retained.state.resource,null);assert.equal(retained.state.selection,null);const latestClose=retained.state.closeHandoff;Object.assign(retained.state,{binding:priorConsumer.binding,catalog:priorConsumer.catalog,catalogView:priorConsumer.catalogView,environment:null});assert.strictEqual(retained.state.closeHandoff,latestClose);")
s=s.replace('bounded_rc6_fixture_proof_only_preparation','bounded_q23_current_candidate_proof_only_preparation')
put(Q/'prepare-r1.mjs',s);put(Q/'dispatch.mjs',(D/'fixture-proof-02/dispatch.mjs').read_text())
put(Q/'EXPECTED_STAGING.json',{'files':[dict(pin(p),path=str(C/I/p.name)) for p in sorted((Q/'inputs').iterdir())]})
# Staging, SOURCE_BEFORE, Root admission and actual preflight remain explicit Root operations.
put(Q/'PREPARED_PACKET_RETURN.json',{'status':'EXACT_FROZEN_PACKET_PREPARED_ROOT_STAGING_PENDING','at':now(),'source':pin(subject),'recipe':pin(A/'C2_RECIPE.json'),'selectedSourceFiles':len(selected),'readRoots':len(w['readRoots']),'commands':len(w['testing']['commands']),'providerCalls':0,'sourceEdits':0,'limits':'No execution or acceptance. Root must stage input files, capture current source hashes, admit and preflight exact controls before one dispatch.'})
print(json.dumps({'status':'EXACT_FROZEN_PACKET_PREPARED_ROOT_STAGING_PENDING','selectedFiles':len(selected),'commands':len(w['testing']['commands'])}))
