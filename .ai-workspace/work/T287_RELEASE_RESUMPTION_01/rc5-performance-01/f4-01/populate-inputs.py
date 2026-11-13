"""Bounded Root operator Writer: populate immutable task inputs, never Product code."""
import json, hashlib, shutil, subprocess, datetime
from pathlib import Path

D=Path(__file__).resolve().parent; C=D.parent
S=Path('/Users/jim/src/apps/abiogenesis-rc5-performance')
T='build_tenants/abiogenesis/typescript'; I='rc5-operator-inputs/f4-01'
P=S/I; P.mkdir(); scratch=S/'rc5-scratch/f4-01'; scratch.mkdir(); (scratch/'tmp').mkdir(mode=0o700)
def sha(b): return hashlib.sha256(b).hexdigest()
def read(p): return json.loads(Path(p).read_text())
def write(p,v):
    p=Path(p); p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(v,indent=2)+'\n')
def copy(a,b):
    b=Path(b); b.parent.mkdir(parents=True,exist_ok=True); assert not b.exists(); shutil.copyfile(a,b)
head=subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD'],text=True).strip()
assert head=='9f3f22b0f733718bee88d5ca1cc306ed0446797a'
write(D/'ROOT_PREPARATION_ACTIVATION.json',{
 'roleTransition':'Executive approved F4/repricing decision -> Root operator Writer',
 'authority':'Owner approved RC5 scope; ../method-01-r2/ROOT_REPRICING.json',
 'scope':'Prepare F4 task/operator inputs, exact maintained dispatch, passive source custody, status records; no Product source coding',
 'sourceCommit':head,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
product=[f'{T}/{p}' for p in [
 'code/src/abg/event_body_encoding.ts','code/src/abg/event_store.ts',
 'test_env/tests/t287-event-body-encoding.test.mjs','test_env/tests/m5-installed-graph-edge.test.mjs',
 'design/T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md','design/ABI5_STDO3_COMPUTATIONAL_BINDING.md',
 'package.json','package-lock.json','code/src/product/contracts.ts','release-claim.md']]
grant=read(C/'method-01/NATIVE_GRANT.json')
grant.update(kind='rc5_f4_native_grant',status='ROOT_SELECTED_NATIVE_PREPARATION',taskId='T287_RC5_F4_01',sourceCommit=head,
 sourceTree=subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD^{tree}'],text=True).strip(),
 changeClass='private durable representation and successor identity',
 derivedReentry='Existing retained-route HOW; preserve logical RuntimeEvent and exact admitted Result membership; no Public/WHAT change',
 productWritePaths=product,scratchWriteRoots=['rc5-scratch/f4-01/'+p for p in ['return.json','readiness.json','tmp']],
 closure='Actual F4 atomic/cold/installed and captured net-byte proof, retained method proof plus missing planning test, independent frozen review, native UAT and fresh result/replay. Local unqualified RC5 only.',
 exclusions=['Product/requirements/Public schema changes','unselected owners, cold-history rewrite and new store/service/controller',
 'GC03 host rewrite or full qualification','canonical generated/build/package/install writes','old histories/releases, push/tag/global selector'],
 independentReview='Independent max source review on frozen native return, alongside actual C2; method source review already satisfied')
write(D/'NATIVE_GRANT.json',grant);copy(D/'NATIVE_GRANT.json',P/'NATIVE_GRANT.json')
copy(D/'TASK.DRAFT.md',D/'TASK.md');copy(D/'TASK.md',P/'TASK.md')
for source,name in [(C/'ROOT_SELECTION.md','CAMPAIGN_SELECTION.md'),(C/'F4_REENTRY.md','F4_REENTRY.md'),
 (C/'F4_BASELINE_MEASUREMENT.json','F4_BASELINE_MEASUREMENT.json'),(D/'CAPTURED_ROUTE_SAMPLE.json','CAPTURED_ROUTE_SAMPLE.json'),
 (D/'c2-final-proof.mjs','c2-final-proof.mjs'),(C/'method-01-r2/ROOT_REPRICING.json','ROOT_REPRICING.json'),
 (C/'method-01/INDEPENDENT_SOURCE_REVIEW.json','INDEPENDENT_METHOD_SOURCE_REVIEW.json'),
 (C/'method-01-r2/NATIVE_UAT_RETURN.json','RETAINED_INDETERMINATE_UAT.json')]: copy(source,P/name)
prior=read(C/'method-01-r2/GENERATED_ADOPTION.PREPARED.json')
copy(prior['helperPath'],P/'retained-method-c2-result.json')
assert sha((P/'retained-method-c2-result.json').read_bytes())==prior['helperSha256']
copy(C/'method-01-r2/OBSERVED_C2_RESULT_EVENT.json',P/'retained-method-c2-event.json')
method=read(C/'method-01/NATIVE_GRANT.json')['productWritePaths']
unchanged=[{'path':p,'sha256':sha((S/p).read_bytes())} for p in method if not p.endswith('ABI5_STDO3_COMPUTATIONAL_BINDING.md')]
qualification=[{'path':str(p.relative_to(S/T)),'sha256':sha(p.read_bytes())} for p in sorted((S/T/'contracts/qualification').rglob('*')) if p.is_file()]
write(P/'METHOD_RETAINED_PROOF.json',{
 'kind':'exact_retained_method_proof','sourceCommit':prior['sourceCommit'],'custodyCommit':head,
 'c2ResultRef':prior['c2ResultRef'],'helperSha256':prior['helperSha256'],'helperArtifactDigest':prior['helperArtifactDigest'],
 'nativeSourceResultRef':prior['nativeSourceResultRef'],'selectedTests':prior['selectedTests'],
 'unchangedSourceFiles':unchanged,'qualificationFiles':qualification,
 'limits':['18 actual C2 passes; native UAT was indeterminate and remains historical.',
 'Final new C2 executes missing planning case; new native UAT must assess complete bounded candidate.',
 'No qualification or old runtime basis migration is inferred.']})
for p in ['package.json','package-lock.json','code/src/product/contracts.ts']: copy(S/T/p,P/'identity-preimages'/Path(p).name)
shutil.copytree(S/T/'contracts',P/'contract-seeds',symlinks=False)
default=(S/T/'test_env/tests/t287-default-library.test.mjs').read_text()
import re
names=re.findall(r"test\('([^']+)'",default)
selected='selector planning preserves provenance, adverse values and bounded Unicode diagnostic ranges'
write(P/'PROOF_EXCLUSIONS.json',{
 'selectedPlanningCase':selected,
 'retainedMethodCases':[n for n in names if n.startswith('RC5 STDO 3.0.4')],
 'unselectedDefaultLibraryCases':[n for n in names if n!=selected and not n.startswith('RC5 STDO 3.0.4')],
 'captureOrLiveNotSelected':['ABI5_PLANNING_PROJECTION_CAPTURE: captured18/51 complete assemblies; capacity remains unverified',
 'ABI5_NATIVE_OBSERVATION_CAPTURE: complete captured native observations',
 'ABI5_DEFAULT_LIBRARY_LIVE: unrelated full native default-library lane',
 'P0_RETAINED_NATIVE_SCRATCH: two route reconstruction retained full-outcome cases',
 'ABI5_EVIDENCE_ROOT: S01 persisted-history subcase'],
 'limits':['No skip is selected proof.','No completed RC4 qualification is repeated.',
 'No full fifteen-family, F11/AF22, GC03 host-adapter, whole-method or stable-release qualification.']})
rubric={'kind':'rc5_bounded_candidate_acceptance_rubric','criteria':[
 {'id':'F1','criterion':'Private route source carriage preserves exact earlier same-Run/cCall admitted Result membership, including Results already physically referenced; logical events, digests, lineage, currentness and refusals are unchanged.'},
 {'id':'F2','criterion':'Affected actual C2 tests execute missing/forward/tampered/uncommitted/equal-valued decoys, mixed form, rollback/fsync poison and complete/selected/descriptor cold acquisition; no new authority/store/stream or v1/v2 regression.'},
 {'id':'F3','criterion':'Captured real referenced-Result sample has actual smaller serialized route bytes including reference overhead and identical logical reconstruction; actual installed candidate exercises new representation and fresh result/replay. Sample alone is not admission or latency evidence.'},
 {'id':'M1','criterion':'Exact304 source/skills/role spans and frozen qualification inputs remain byte-equal to retained actual18-pass C2 and satisfied independent source review; final new C2 executes omitted selector-planning test. Historical native UAT indeterminate remains preserved; assess current conjunction, not retrospective success.'},
 {'id':'R1','criterion':'Only existing package/lock/Product version owners become5.0.0-rc.5; actual archive verifies and source claim is honest local unqualified. C2 corresponds to native return and every selected exit predicate passes. Capture/live exclusions and whole qualification limits explicit.'}],
 'excluded':['whole Product qualification','GC03 host rewrite','universal capacity/latency claim','push/tag/global selector/stable release','Root future local install is not preclaimed']}
write(P/'rubric.json',rubric)
for name in ['return.json','readiness.json']: write(scratch/name,{})

# Reuse established finite build/support inputs, with the complete tracked fixture tree.
w=read(C/'method-01-r2/workload.json')
selectedPaths={p for p in w['testing']['selectedPaths'] if not p.startswith('rc5-operator-inputs/') and not p.startswith('rc5-scratch/')}
for root in [S/T/'test_env/fixtures',P]:
 for p in root.rglob('*'):
  if p.is_file():
   assert not p.is_symlink(),p
   selectedPaths.add(str(p.relative_to(S)))
selectedPaths.update(product)
selectedPaths.add(T+'/test_env/tests/t287-route-reconstruction.test.mjs')
selectedPaths.add(T+'/test_env/uat/consumer.mjs')
witness=S/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness'
selectedPaths.add(str((witness/'selection.json').relative_to(S)))
for p in (witness/'seed').rglob('*'):
 if p.is_file(): selectedPaths.add(str(p.relative_to(S)))
selectedPaths=sorted(selectedPaths)
for p in selectedPaths: assert (S/p).is_file() and not (S/p).is_symlink(),p
task=(D/'TASK.md').read_text(); w['taskRef']='task://abiogenesis/rc5/f4-01';w['task']=task
w['requiredSupportRefs']=['support://abiogenesis/rc5/complete-bounded-candidate']
pins=['stdo_abiogenesis.json','AGENTS.md','specification/PRODUCT.md','specification/INTENT.md',
 T+'/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md',I+'/TASK.md',I+'/NATIVE_GRANT.json',I+'/CAMPAIGN_SELECTION.md',
 I+'/ROOT_REPRICING.json',I+'/METHOD_RETAINED_PROOF.json',I+'/c2-final-proof.mjs',I+'/PROOF_EXCLUSIONS.json',
 '.claude/skills/stdo-work/SKILL.md','.claude/references/PRODUCT_BASIS.md','.claude/references/COORDINATED_HANDOFF.md']
w['sources']=[{'path':p,'digest':'sha256:'+sha((S/p).read_bytes())} for p in pins]
w['readRoots']=sorted(set(selectedPaths+['rc5-scratch/f4-01/return.json','rc5-scratch/f4-01/readiness.json']))
w['assessment']={'candidatePath':T+'/design/T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md','rubricPath':I+'/rubric.json','sources':pins}
outcome='Bounded RC5 retained-route repair and successor identity, conjoined with retained304 method proof and its missing planning check.'
readFirst=[I+'/TASK.md',I+'/NATIVE_GRANT.json',T+'/design/T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md',T+'/code/src/abg/event_body_encoding.ts']
for role,order in w['workOrders'].items():
 order.update(outcome=outcome,readFirst=readFirst,checks=[],writeRoots=product+grant['scratchWriteRoots'] if role=='construction' else [],
  instructions=[task] if role=='construction' else ['Select one Construction, actual C2 Testing, then native UAT under the exact task. Other purpose calls create no new work. Any integration failure returns to Root; no autonomous repair/retry.'])
old=w['testing']['commands']; commands=[]
def command(name,exe,args,cwd,timeout):
 return {'commandId':'command://abiogenesis/rc5/f4-01/'+name,'executable':exe,'args':args,'relativeCwd':cwd,
 'environment':old[0]['environment'],'timeoutMs':timeout,'terminationGraceMs':5000,'expectedReports':[]}
commands.append(command('source-correspondence',old[0]['executable'],old[0]['args'][:2]+product+[x['path'] for x in unchanged],'.',300000))
commands.append(command('offline-toolchain','/bin/cp',old[1]['args'],T,60000))
commands.append(command('contract-seeds','/bin/cp',['-cR',I+'/contract-seeds',T+'/contracts'],'.',30000))
commands.append(command('compile',old[3]['executable'],old[3]['args'],T,240000))
commands.append(command('generate',old[3]['executable'],['--input-type=module','-e',"import{mkdir}from'node:fs/promises';await mkdir('artifacts',{recursive:true});await import('./scripts/generate-product-manifest.mjs');"],T,300000))
commands.append(command('pack','/opt/homebrew/bin/npm',['pack','--ignore-scripts','--json','--pack-destination','artifacts'],T,120000))
commands.append(command('final-proof',old[3]['executable'],[I+'/c2-final-proof.mjs'],'.',1800000))
w['testing'].update(selectedPaths=selectedPaths,commands=commands,outcomePredicates=[{'predicateId':c['commandId']+'/exit','predicateKind':'process_exit','declaration':{'equals':0,'validationCommandId':c['commandId']}} for c in commands])
write(D/'workload.json',w)
profile=read(C/'method-01-r2/PROVIDER_PROFILE.json');profile.update(kind='rc5_f4_native_profile',providerScratch=str(scratch/'tmp'))
profile['provider']['command']=str(D/'claude-provider.sh');write(D/'PROVIDER_PROFILE.json',profile)
wrapper=(C/'method-01-r2/claude-provider.sh').read_text().replace('rc5-scratch/method-01-r2','rc5-scratch/f4-01')
(D/'claude-provider.sh').write_text(wrapper);(D/'claude-provider.sh').chmod(0o700)
prepare=(C/'method-01-r2/prepare.mjs').read_text().replace('method-01/execution/after-run-resume.json','method-01-r2/execution/after-run-resume.json').replace('rc5-performance-method-01-r2','rc5-performance-f4-01').replace('rc5_method304_native_preparation','rc5_f4_native_preparation')
(D/'prepare.mjs').write_text(prepare)
dispatch=(C/'method-01-r2/dispatch.mjs').read_text().replace('ABG alone dispatches native coding','ABG alone dispatches selected native work')
(D/'dispatch.mjs').write_text(dispatch)
freeze=(C/'method-01/freeze-source.mjs').read_text().replace("const inline=new Map();", "const prepared=await json(join(dir,'execution/PREPARED_CALL.json'));\nconst minimumOffset=prepared.eventPrefix.prefixLength;assert(Number.isSafeInteger(minimumOffset));\nconst inline=new Map();")
freeze=freeze.replace("if(event.kind==='c_call_result_admitted'", "if(offset>=minimumOffset&&event.kind==='c_call_result_admitted'")
freeze=freeze.replace("'rc5-scratch/method-01'","'rc5-scratch/f4-01'")
(D/'freeze-source.mjs').write_text(freeze)
print(json.dumps({'status':'INPUTS_PREPARED','sourceCommit':head,'selectedFiles':len(selectedPaths),'selectedBytes':sum((S/p).stat().st_size for p in selectedPaths),'witnessFiles':len([p for p in selectedPaths if '/default-library-witness/' in p]),'commands':len(commands),'productWriteFiles':len(product)}))
