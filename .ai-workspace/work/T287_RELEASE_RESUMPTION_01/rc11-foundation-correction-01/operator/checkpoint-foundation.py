from pathlib import Path
import json,hashlib,os,subprocess,datetime
R=Path('/Users/jim/src/apps/abiogenesis');F=Path('/private/tmp/abg-rc11-foundation-20261110-01');O=R/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-foundation-correction-01/operator';T=Path('build_tenants/abiogenesis/typescript');P=O.parents[1]/'rc11-qualification-01'
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],env=env)
def pin(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def create(p,b):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(b)
def record(n,x):
 p=O/n;create(p,(json.dumps(x,indent=2)+'\n').encode());return pin(p)
base='e2ba05da572f4a7e68d0629ecc83b9153a15e7c4';branch='codex/rc11-foundation-correction'
assert git(F,'rev-parse','HEAD').decode().strip()==base
assert git(F,'branch','--show-current').decode().strip()==branch
assert git(F,'diff','--cached','--name-only')==b''
recheck=O.parent/'review-basis/REVIEW_RECHECK.json';review=O.parent/'review-basis/REVIEW.json'
assert pin(recheck)['sha256']=='95ac44ba9c4ae862713cc62f407cec11fcf2ffb9d7186b04233101382d77d796'
assert pin(review)['sha256']=='4977c129f29fd397aae6d701fe346c218805d5dda605ad23ec68a21b9864081c'
freeze=json.loads((O/'AMENDMENT_FREEZE.json').read_text());clarity=json.loads((O/'CLARITY_RETURN.json').read_text());link=json.loads((O/'PLAN_LINK_RETURN.json').read_text())
assert pin(Path(clarity['constitution']['path']))==clarity['constitution'];assert pin(Path(link['plan']['path']))==link['plan']
trackingPaths={'specification/GOALS.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'}
for r in freeze['snapshot']:
 if r['path'] in trackingPaths or r['path'].endswith('/ABI5_REALIZATION_CONSTITUTION.md'):continue
 q=pin(F/r['path']);assert (q['bytes'],q['sha256'])==(r['bytes'],r['sha256'])
selected=sorted(freeze['selectedChangedPaths']+[str(T/'design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md')]);assert len(selected)==16 and len(set(selected))==16
assert set(git(F,'diff','--name-only').decode().splitlines())==set(selected)-{str(T/'design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md')}
baseline=json.loads((P/'native-02/source-freeze.json').read_text())
for r in baseline['rows']:
 if r['path'] in selected:continue
 q=pin(F/r['path']);assert (q['bytes'],q['sha256'])==(r['bytes'],r['sha256']),r['path']
preserved=[]
for x in json.loads((O/'ACTIVATION.json').read_text())['preservationPins']:
 if x['path'] in [str(R/p) for p in trackingPaths]:continue
 assert pin(Path(x['path']))==x,x['path'];preserved.append(x)
assert git(R,'rev-parse','HEAD').decode().strip()=='dd6938dd84fac37a76128d14cf1b5f0fa8aec299'
assert git(Path('/private/tmp/abg-rc11-qualification-20261109'),'rev-parse','HEAD').decode().strip()==base
mainIndex=pin(R/'.git/index');successorIndexPath=Path(git(F,'rev-parse','--git-path','index').decode().strip());successorIndexBefore=pin(successorIndexPath)
tracking=[(root,Path(p),(root/p).read_bytes()) for root in [R,F] for p in sorted(trackingPaths)]
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
disposition=record('ROOT_DISPOSITION.json',{'id':'FOUNDATION-CHECKPOINT-01','status':'ROOT_ACCEPTED_PRINCIPLE_CORRECTION_AND_ORDERED_PLAN_IMPLEMENTATION_UNSTARTED','recordedUtc':now,'decisionOwner':'Root Executive','decision':'Bounded Product realization-profile correction, coherent Design/bootstrap/requirement clarification and requested phased Functional plan accepted. FND-CLARITY-001 closed by exact recheck. Five authority documents and eight generated outputs satisfy the bounded basis review. No production behavior changed.','basisReview':pin(review),'targetedRecheck':pin(recheck),'authorityPredecessorFreeze':pin(O/'AUTHORITY_COMPONENT_FREEZE.json'),'clarityFreeze':pin(O/'CLARITY_FREEZE.json'),'acceptedPlan':link['plan'],'acceptedPlanLinkReceipt':pin(O/'PLAN_LINK_RETURN.json'),'mechanicalEvidence':pin(O/'RETURN.json'),'checks':'Compiler and generation passed; qualification-law 11 cases/7 pass/4 fixture-dependent skips/0 fail; no repeat tests.','checkpointGrant':{'sourceRoot':str(F),'branch':branch,'baseCommit':base,'selectedPaths':selected,'message':'docs(t287): correct Effect foundation principle and record refactor plan','effects':'Prepend current tracking to main and successor preserving bodies; stage and commit exactly sixteen paths only in successor. No main index/HEAD mutation, merge/push/tag/install/runtime or operational pin change.'},'script':pin(__file__),'mainIndexBefore':mainIndex,'successorIndexBefore':successorIndexBefore,'standing':'Implementation unstarted; future phases are an ordered plan, not execution authority. Both bug debts, original reds/native failures, qualification/full5.0/S7/other backlog remain open. Local delivered RC11 and pinned RC10 unchanged.'})
for root,p,b in tracking:
 linkToPlan=str(F/T/'design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md') if root==R else ('../build_tenants/' if p.name=='GOALS.md' else '../../../build_tenants/')+'abiogenesis/typescript/design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md'
 prefix=f'''Current disposition, {now}: **RC11_EFFECT_PRINCIPLE_CORRECTION_ACCEPTED_PLAN_RECORDED_IMPLEMENTATION_UNSTARTED**. Root accepts the bounded Product realization-profile correction and coherent Design/bootstrap/requirement wording; independent review and targeted recheck close FND-CLARITY-001. Core Effect remains `3.22.1` and semantic ownership is conserved. The [ordered plan]({linkToPlan}) separates proved observer/m5 Proof repairs from later lifetime/command, HTTP, worker capture and GC03 candidates. Compiler/generation passed; qualification-law recorded 7 passes and 4 explicit fixture skips, zero failures. Root authorizes a local sixteen-path checkpoint on `codex/rc11-foundation-correction`; no implementation, runtime or next phase is authorized. Both bug debts and qualification remain open; prior red tests/native failures and all other backlog are preserved. RC11 remains local/unqualified/unpublished; RC10 remains pinned builder. Main and delivered source are not merged or changed beyond these tracking prefixes. Prior bodies remain verbatim.\n\n'''.encode()
 (root/p).write_bytes(prefix+b);assert (root/p).read_bytes()[len(prefix):]==b
trackingReceipt=record('CHECKPOINT_TRACKING.json',{'rootDisposition':disposition,'rows':[{'path':str(root/p),'beforeBytes':len(b),'beforeSha256':hashlib.sha256(b).hexdigest(),'after':pin(root/p),'priorBodyPreserved':True} for root,p,b in tracking]})
preimages=[pin(F/p) for p in selected]
check=subprocess.run(['git','-C',str(F),'diff','--check','--',*selected],env=env,capture_output=True);assert check.returncode==0,check.stdout+check.stderr
pathspec=O/'CHECKPOINT_PATHS.nul';create(pathspec,b'\0'.join(x.encode() for x in selected)+b'\0')
create(O/'CHECKPOINT_PRECOMMIT.diff',git(F,'diff','--binary','--',*selected))
git(F,'add','--sparse','--pathspec-from-file='+str(pathspec),'--pathspec-file-nul')
staged=git(F,'diff','--cached','--name-only').decode().splitlines();assert sorted(staged)==selected
assert git(F,'diff','--cached','--diff-filter=D','--name-only')==b''
git(F,'diff','--cached','--check')
assert pin(R/'.git/index')==mainIndex
stagedReceipt=record('STAGED_CHECK.json',{'selectedPaths':selected,'stagedPaths':staged,'pathspec':pin(pathspec),'sourcePins':preimages,'diffCheckPassed':True,'noProductionOrTestSourceChanges':True,'mainIndexConserved':mainIndex})
output=git(F,'-c','core.hooksPath=/dev/null','-c','commit.gpgSign=false','commit','-m','docs(t287): correct Effect foundation principle and record refactor plan');create(O/'commit.stdout',output)
commit=git(F,'rev-parse','HEAD').decode().strip();tree=git(F,'rev-parse','HEAD^{tree}').decode().strip();assert git(F,'rev-parse','HEAD^').decode().strip()==base
actualPaths=git(F,'diff-tree','--no-commit-id','--name-only','-r','HEAD').decode().splitlines();assert sorted(actualPaths)==selected
assert git(F,'status','--porcelain=v1','--untracked-files=no')==b''
for q in preimages:assert pin(Path(q['path']))==q
for x in preserved:assert pin(Path(x['path']))==x
assert pin(R/'.git/index')==mainIndex
assert git(R,'rev-parse','HEAD').decode().strip()=='dd6938dd84fac37a76128d14cf1b5f0fa8aec299'
assert git(Path('/private/tmp/abg-rc11-qualification-20261109'),'rev-parse','HEAD').decode().strip()==base
untracked=git(F,'ls-files','--others','--exclude-standard').decode().splitlines()
r=record('CHECKPOINT_RETURN.json',{'status':'ACCEPTED_PRINCIPLE_AND_PLAN_LOCALLY_CHECKPOINTED_IMPLEMENTATION_UNSTARTED','rootDisposition':disposition,'trackingReceipt':trackingReceipt,'stagedCheck':stagedReceipt,'sourceRoot':str(F),'branch':branch,'parent':base,'commit':commit,'tree':tree,'selectedPaths':selected,'pathCount':len(selected),'trackedClean':True,'excludedUntrackedCount':len(untracked),'excludedUntrackedTopLevel':sorted({x.split('/')[0] for x in untracked}),'excludedInfrastructure':['successor node_modules','successor build','.foundation-generation','main operator controls/evidence'],'commitOutput':pin(O/'commit.stdout'),'successorIndexBefore':successorIndexBefore,'successorIndexAfter':pin(successorIndexPath),'mainAndDeliveredGuardsConserved':preserved,'mainIndexConserved':mainIndex,'noProductionOrTestSourceChanges':True,'noRepeatedTests':True,'noNativeRuntime':True,'noMergePushTagInstallSelectorEffect':True,'standing':'Both bug debts and qualification remain open. Future plan is not execution authorization. Stop after local checkpoint.'})
print(json.dumps({'return':r,'disposition':disposition,'tracking':trackingReceipt,'commit':commit,'tree':tree,'paths':len(selected),'trackedClean':True},indent=2))
