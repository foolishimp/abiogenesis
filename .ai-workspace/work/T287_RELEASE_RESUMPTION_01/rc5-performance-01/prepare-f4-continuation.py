"""Root Writer: materialize bounded continuation inputs; no dispatch or Product edits."""
import json,hashlib,shutil,subprocess,datetime
from pathlib import Path
C=Path(__file__).resolve().parent;old=C/'f4-01';D=C/'f4-02';S=Path('/Users/jim/src/apps/abiogenesis-rc5-performance')
I='rc5-operator-inputs/f4-02';P=S/I;D.mkdir();P.mkdir();scratch=S/'rc5-scratch/f4-02';scratch.mkdir();(scratch/'tmp').mkdir(mode=0o700)
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):
 with p.open('x') as f:f.write(json.dumps(v,indent=2)+'\n')
def copy(a,b):assert not b.exists();shutil.copyfile(a,b)
checkpoint=read(old/'PARTIAL_CUSTODY_CHECKPOINT.json');head=subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD'],text=True).strip();assert head==checkpoint['sourceCommit']
grant=read(old/'NATIVE_GRANT.json');grant.update(kind='rc5_f4_continuation_native_grant',taskId='T287_RC5_F4_02',sourceCommit=head,sourceTree=checkpoint['tree'],
 scratchWriteRoots=['rc5-scratch/f4-02/'+p for p in ['return.json','readiness.json','tmp']],
 derivedReentry='Same F4 increment after operator turn-cap failure: exact unfinished source plus resolved installed-fixture owner map; HOW, proof and identity completion',
 independentReview='Final independent max review covers complete F4 delta from9f3, including the prior partial code; feasibility review is not implementation acceptance')
grant['limits']['maxTurns']=256
grant['normalTools']='Read-only offline dependencies; noEmit/syntax feedback if useful. Do not repeat the ineffective full in-memory loader suite. Actual C2 alone compiles/builds/packages/runs the selected affected proof.'
write(D/'NATIVE_GRANT.json',grant);copy(D/'NATIVE_GRANT.json',P/'NATIVE_GRANT.json')
task=(old/'TASK.md').read_text().replace('9f3f22b0f733718bee88d5ca1cc306ed0446797a',head).replace('rc5-scratch/f4-01','rc5-scratch/f4-02')
intro='''# Complete the exact unfinished F4 increment

Prior native actor reached the operator-selected128-turn cap and delivered no
completed handoff. Its exact partial codec/store changes are already present at
53acfe7c6a51e0b0a1d354fbc79ef3d391cb7573, unaccepted. Do not restart discovery or
discard those changes. Read this task/grant, REENTRY_TRIAGE.md and the closed
INSTALLED_FIXTURE_FEASIBILITY.md owner map first. This continuation has256 turns.

Root selects the existing c_workflow child -> retained E/S/T input -> deterministic
consumer fixture relation described in that review, including its closure and
pre-install import premises. It fits the existing test-file grant. Use the exact
canonical contract and binding through the supplied Product owner; do not
redeclare a framework contract or add a loader/registry/authority.

Complete the owning HOW decision first, then finish/adjust the partial codec and
store only as necessary for the already selected invariants. Add the required
negative/cold/atomic/captured component cases and installed case, complete the
RC5 identity/source-claim changes, and return one frozen honest handoff. The
prior partial implementation has no acceptance credit. Its Native failure and
after-observation remain preserved; a new successful return must be genuine.

The prior noEmit/in-memory author feedback is historical. The broad in-memory
codec attempt timed out a child; no passing compiled verdict exists. Do not
repeat that loader suite. Type/syntax checks may be used; the declared C2 plan
will compile and exercise the complete selected candidate after return.

All required final proof interfaces and the original immutable seven-command
C2 recipe remain under rc5-operator-inputs/f4-01/. Those recipe, seed, sample,
retained-method and exclusion inputs are unchanged. This f4-02 task/grant is
the operative continuation contract; any f4-01 execution metadata is historical.

The complete original bounded outcome follows, with source/scratch coordinates
updated for this continuation. No new Product scope or source owner is granted.

'''
task=intro+task
(D/'TASK.md').write_text(task);copy(D/'TASK.md',P/'TASK.md')
for name in ['REENTRY_TRIAGE.md','INSTALLED_FIXTURE_FEASIBILITY.md','PARTIAL_CUSTODY_CHECKPOINT.json','NATIVE_PROVIDER_FAILURE.json','AUTHOR_FEEDBACK.json']:copy(old/name,P/name)
copy(S/'rc5-operator-inputs/f4-01/rubric.json',P/'rubric.json')
write(D/'ROOT_PREPARATION_ACTIVATION.json',{'roleTransition':'Executive actual failure triangulation and existing-owner feasibility decision -> bounded Root operator Writer',
 'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authority':'Owner approved RC5scope; f4-01/REENTRY_TRIAGE.md and partial custody',
 'scope':'Continuation task/inputs/preflight/dispatch preparation and status only; no Product source edits or actual dispatch yet','sourceCommit':head})
for name in ['return.json','readiness.json']:write(scratch/name,{})
w=read(old/'workload.json');w.update(taskRef='task://abiogenesis/rc5/f4-02',task=task)
selected=set(w['testing']['selectedPaths']);selected.discard('rc5-operator-inputs/f4-01/TASK.md');selected.discard('rc5-operator-inputs/f4-01/NATIVE_GRANT.json');selected.discard('rc5-operator-inputs/f4-01/rubric.json')
selected.update(str(p.relative_to(S)) for p in P.iterdir() if p.is_file());w['testing']['selectedPaths']=sorted(selected)
w['readRoots']=sorted(selected|{'rc5-scratch/f4-02/return.json','rc5-scratch/f4-02/readiness.json'})
pins=[p['path'].replace('rc5-operator-inputs/f4-01/TASK.md',I+'/TASK.md').replace('rc5-operator-inputs/f4-01/NATIVE_GRANT.json',I+'/NATIVE_GRANT.json') for p in w['sources']]
pins += [I+'/REENTRY_TRIAGE.md',I+'/INSTALLED_FIXTURE_FEASIBILITY.md',I+'/PARTIAL_CUSTODY_CHECKPOINT.json']
w['sources']=[{'path':p,'digest':'sha256:'+sha(S/p)} for p in pins]
w['assessment'].update(rubricPath=I+'/rubric.json',sources=pins)
for role,order in w['workOrders'].items():
 order.update(readFirst=[I+'/TASK.md',I+'/NATIVE_GRANT.json',I+'/REENTRY_TRIAGE.md',I+'/INSTALLED_FIXTURE_FEASIBILITY.md','build_tenants/abiogenesis/typescript/design/T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md'],
  writeRoots=grant['productWritePaths']+grant['scratchWriteRoots'] if role=='construction' else [],
  instructions=[task] if role=='construction' else ['One bounded continuation Construction, actual unchanged C2 Testing, then native UAT. Complete original F4 and method criteria apply. A new integration failure returns to Root; no autonomous retry or wider scope.'])
write(D/'workload.json',w)
profile=read(old/'PROVIDER_PROFILE.json');profile.update(kind='rc5_f4_continuation_native_profile',providerScratch=str(scratch/'tmp'));profile['provider'].update(command=str(D/'claude-provider.sh'),maxTurns=256)
write(D/'PROVIDER_PROFILE.json',profile)
wrapper=(old/'claude-provider.sh').read_text().replace('rc5-scratch/f4-01','rc5-scratch/f4-02');(D/'claude-provider.sh').write_text(wrapper);(D/'claude-provider.sh').chmod(0o700)
prepare=(old/'prepare.mjs').read_text().replace('method-01-r2/execution/after-run-resume.json','f4-01/execution/after-run-resume.json').replace('rc5-performance-f4-01','rc5-performance-f4-02')
(D/'prepare.mjs').write_text(prepare);copy(old/'dispatch.mjs',D/'dispatch.mjs')
freeze=(old/'freeze-source.mjs').read_text().replace("'rc5-scratch/f4-01'","'rc5-scratch/f4-02'")
# Independent review spans the entire F4 delta, including preserved prior code.
freeze=freeze.replace("const files=[];", "const reviewBase='9f3f22b0f733718bee88d5ca1cc306ed0446797a';\nconst files=[];")
freeze=freeze.replace("grant.sourceCommit+':'+path","reviewBase+':'+path")
freeze=freeze.replace("'diff','--binary','--',...grant.productWritePaths", "'diff','--binary',reviewBase,'--',...grant.productWritePaths")
freeze=freeze.replace("sourceCommit:grant.sourceCommit,", "sourceCommit:grant.sourceCommit,reviewBaseCommit:reviewBase,")
(D/'freeze-source.mjs').write_text(freeze);copy(old/'prepare-adoption.mjs',D/'prepare-adoption.mjs')
copy(old/'INDEPENDENT_REVIEW_INTAKE.DRAFT.md',D/'INDEPENDENT_REVIEW_INTAKE.DRAFT.md')
print(json.dumps({'status':'CONTINUATION_INPUTS_PREPARED_NOT_DISPATCHED','sourceCommit':head,'selectedFiles':len(selected),'maxTurns':256,'C2RecipeChanged':False,'reviewBaseCommit':'9f3f22b0f733718bee88d5ca1cc306ed0446797a'}))
