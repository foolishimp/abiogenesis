from pathlib import Path
import json,hashlib,difflib,subprocess,os
O=Path(__file__).parent;R=Path('/Users/jim/src/apps/abiogenesis');F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T=Path('build_tenants/abiogenesis/typescript');relative=T/'design/ABI5_REALIZATION_CONSTITUTION.md';p=F/relative
def pin(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def create(p,b):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(b)
def record(n,x):
 q=O/n;create(q,(json.dumps(x,indent=2)+'\n').encode());return pin(q)
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],env=env)
review=O.parent/'review-basis/REVIEW.md';assert pin(review)['sha256']=='4a2097c8fd093a261d9b2803bd5d88faedcb46557fa670504ceacfcbd4f8ad1d'
before=pin(p);assert before['sha256']=='db267d0b96baf5dbc6c6c4621e133e20365c5dbe1e64c9b274944d04352d3b62'
old=p.read_text();scope=json.loads((O/'AUTHORITY_COMPONENT_FREEZE.json').read_text());planReceipt=json.loads((O/'PLAN_RETURN.json').read_text());assert pin(Path(planReceipt['plan']['path']))==planReceipt['plan']
inputPath=F/T/'contracts/qualification/authority-inputs.json';inputs=json.loads(inputPath.read_text());assert not any('ABI5_REALIZATION_CONSTITUTION' in x['ref'] for x in inputs['sources'])
frozen=json.loads((O/'AMENDMENT_FREEZE.json').read_text());generated=[x for x in frozen['snapshot'] if '/contracts/' in x['path'] or x['path'].endswith('product-toolchain-manifest.json')]
for r in generated:
 q=pin(F/r['path']);assert q['bytes']==r['bytes'] and q['sha256']==r['sha256']
indices=planReceipt['indicesUnchanged']
for x in indices:assert pin(Path(x['path']))==x
record('ROOT_FOUNDATION_CLARITY_01.json',{'id':'FOUNDATION-CLARITY-01','status':'ROOT_ADMITTED_EXACT_S3_TEXT_REPAIR','review':pin(review),'predecessorFreeze':pin(O/'AUTHORITY_COMPONENT_FREEZE.json'),'preimage':before,'writeSource':str(p),'changes':['Held-resource paragraph: carrier choice does not acquire resource or confer semantic authority; preserve identity/prefix/successor/close law.','Resource comparison: negative selection/falsifier applies to exact18/56 durable resource identity/receipt role, not general core API gate.'],'otherFourAuthorityFilesHeld':True,'generation':'Only if actual generator inputs change; Design is absent from authority inputs.','implementationAndRuntimeHeld':True})
a='''installed definition binding. This is physical possession, not a session,
Run, binding mode, semantic authority or Context/Layer value. A copied selection
does not acquire its owner.'''
b='''installed definition binding. Physical possession requires that actual
acquisition; neither a session, Run, binding mode nor a Context/Layer carrier
establishes it. Carrying an owner-issued immutable selection in Context/Layer
neither acquires the physical resource nor grants semantic authority. A copied
selection does not acquire its owner.'''
assert old.count(a)==1;new=old.replace(a,b)
a='''No added package, but it adds a cache lifecycle and proof surface while the required durable/current truth remains Product/ABG-owned. It is lawful only as a disposable cache proven irrelevant to behavior; this cut needs no such cache. | **Not selected.** Falsifier for adoption: a measured repeated acquisition cost must require a non-authoritative cache and show lower total cost without changing any receipt or restart result.'''
b='''For this exact 18/56 durable resource identity/receipt role, a refreshable cache adds lifecycle and proof cost without replacing Product/ABG-owned durable/current truth; this composition needs no such cache. | **Not selected for the exact 18/56 durable resource identity/receipt composition.** Falsifier for reselecting that composition: measured repeated acquisition cost requires a non-authoritative cache with lower total cost and unchanged receipt/restart results. This is not a general core API gate under Section 9; current dependency selection is unchanged.'''
assert new.count(a)==1;new=new.replace(a,b)
p.write_text(new)
for r in scope['rows']:
 if r['path']==str(relative):continue
 q=pin(F/r['path']);assert q['bytes']==r['bytes'] and q['sha256']==r['sha256']
for r in generated:
 q=pin(F/r['path']);assert q['bytes']==r['bytes'] and q['sha256']==r['sha256']
for x in indices:assert pin(Path(x['path']))==x
assert pin(Path(planReceipt['plan']['path']))==planReceipt['plan']
diff=''.join(difflib.unified_diff(old.splitlines(keepends=True),new.splitlines(keepends=True),fromfile='constitution.predecessor-db267d0b',tofile='constitution.clarity-successor'))
create(O/'FOUNDATION_CLARITY.diff',diff.encode())
check=subprocess.run(['git','-C',str(F),'diff','--check','--',str(relative),str(T/'design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md')],env=env,capture_output=True)
assert check.returncode==0,check.stdout+check.stderr
frozenPath=O/'frozen-clarity'/relative;create(frozenPath,p.read_bytes())
f=record('CLARITY_FREEZE.json',{'status':'FROZEN_TARGETED_CLARITY_RECHECK_PENDING','predecessor':pin(O/'AUTHORITY_COMPONENT_FREEZE.json'),'changedOnlyAuthorityPath':str(relative),'postimage':pin(p),'frozenPostimage':pin(frozenPath),'diff':pin(O/'FOUNDATION_CLARITY.diff'),'otherFourAuthorityRowsUnchanged':[x for x in scope['rows'] if x['path']!=str(relative)],'plan':planReceipt['plan'],'repairPlan':pin(O/'REPAIR_PLAN.md'),'generatorInput':pin(inputPath),'constitutionIsGeneratorInput':False,'generatedEightOutputsUnchanged':True,'noRegenerationOrTestsRun':True,'diffCheckExitCode':check.returncode})
r=record('CLARITY_RETURN.json',{'status':'FOUNDATION_PLAN_AND_CLARITY_FROZEN','rootAdmission':pin(O/'ROOT_FOUNDATION_CLARITY_01.json'),'clarityFreeze':f,'planReturn':pin(O/'PLAN_RETURN.json'),'plan':planReceipt['plan'],'constitution':pin(p),'diff':pin(O/'FOUNDATION_CLARITY.diff'),'tracking':planReceipt['tracking'],'indicesUnchanged':indices,'sourceHead':git(F,'rev-parse','HEAD').decode().strip(),'mainHead':git(R,'rev-parse','HEAD').decode().strip(),'standing':'Targeted reviewer recheck and Root conjunction pending. No implementation, runtime, test, build, generation, commit, release or pin change in this activation.'})
print(json.dumps({'return':r,'constitution':pin(p),'freeze':f,'plan':planReceipt['plan'],'diff':pin(O/'FOUNDATION_CLARITY.diff')},indent=2))
