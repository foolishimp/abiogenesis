from pathlib import Path
import json, hashlib, shutil, os, subprocess, datetime, shlex

R=Path('/Users/jim/src/apps/abiogenesis')
P=R/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01'
OLD=P/'native-02'; N=P/'native-03'
F=Path('/private/tmp/abg-rc11-foundation-20261110-01')
T='build_tenants/abiogenesis/typescript'
I=F/'qualification-inputs/rc11-effect-phase2-01/native-03'
S=F/'qualification-scratch/rc11-effect-phase2-01/native-03'
NODE='/opt/homebrew/Cellar/node/24.7.0/bin/node'
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
    p=Path(p); b=p.read_bytes(); return dict(path=str(p),bytes=len(b),sha256=sha(b))
def check(x): assert pin(x['path'])==x,x['path']
def write(p,v):
    p=Path(p)
    with p.open('xb') as h:h.write((json.dumps(v,indent=2,ensure_ascii=False)+'\n').encode() if not isinstance(v,bytes) else v)
def cp(src,dst):write(dst,Path(src).read_bytes())
def remap(v):
    if isinstance(v,str):return v.replace(str(OLD/'setup-02'),str(N)).replace(str(OLD),str(N)).replace('rc11-effect-phase2-01/native-02','rc11-effect-phase2-01/native-03')
    if isinstance(v,list):return [remap(x) for x in v]
    if isinstance(v,dict):return {k:remap(x) for k,x in v.items()}
    return v

g=json.loads((OLD/'PRESERVATION_GUARDS.json').read_text())
for x in g['indices']+g['mainTracking']+g['candidateTracking']+[g['builderPin'],g['archive'],g['workspaceManifest']]:check(x)
git_env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
for root,head in g['heads'].items():assert subprocess.check_output(['/usr/bin/git','-C',root,'rev-parse','HEAD'],env=git_env,text=True).strip()==head
freeze=json.loads((OLD/'source-freeze.json').read_text())
assert freeze['sourceDigest']=='cddcc3bcabf7c0ffa94f08e177584812f2c3a42f3706a7c1277608dfa974e76b'
for row in freeze['rows']:
    b=(F/row['path']).read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'],row['path']
assert not I.exists() and not S.exists() and not (N/'runtime-001').exists()
I.mkdir();S.mkdir()
for rel in ['tmp','npm-cache','evidence']:(S/rel).mkdir()

reports={
 'sourceReview':OLD/'source-review/ASSESSMENT.md',
 'design':OLD/'probe-triage-design/ASSESSMENT.md',
 'executedDesign':OLD/'probe-triage-design/EXECUTED_EVIDENCE_01.md',
 'executedProof':OLD/'source-review/PROBE_EVIDENCE.md',
 'bothRunReturn':OLD/'probe-discriminator-01/RETURN.json',
 'candidateObservation':OLD/'probe-discriminator-01/actual-candidate-001/OBSERVATION.json',
 'baselineObservation':OLD/'probe-discriminator-01/actual-baseline-001/OBSERVATION.json'
}
expected={'sourceReview':'17ec6ffc','design':'46155a87','executedDesign':'ff484993','executedProof':'2fe847eb','bothRunReturn':'567cb2ee'}
for k,v in expected.items():assert pin(reports[k])['sha256'].startswith(v)
paths=[f'{T}/code/src/shared/owned_process_lifetime.ts',f'{T}/code/src/shared/owned_process_state.ts',f'{T}/test_env/tests/t287-owned-process-lifetime.test.mjs',f'{T}/design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md']
scope={
 'id':'PHASE2-A-R1-PREP-01','status':'ROOT_SELECTED_NARROW_R1_PREPARATION_SETUP_PROVIDER_HELD',
 'actor':'Separately activated Writer/Operator; Root is Executive and sole next-step consumer',
 'changeClass':'realization_refactor','ownerInstruction':'User continue; Root selects narrow R1 repair after closed source, Design and executed Proof conjunction. Preparation only in this activation; native setup and provider need exact later Root admissions.',
 'predecessorScope':pin(OLD/'ROOT_SCOPE.json'),'sourceInventory':pin(OLD/'source-freeze.json'),'sourceDigest':freeze['sourceDigest'],'sourceRows':len(freeze['rows']),'sourceCommit':g['heads'][str(F)],
 'basis':json.loads((OLD/'ROOT_SCOPE.json').read_text())['basis'],
 'frame':'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#executive-writer-and-reviewer-binding',
 'conjunction':{k:pin(v) for k,v in reports.items()},
 'causalDisposition':'Candidate A counts probes on return: two assessments entered before nested completion, which seals count1; stale outer present then overwrites current absence. Baseline counts at entry and its first sealed count2 is valid, but stale continuation performs a third probe, TERM and duplicate disposal after sealing. These are distinct mechanisms; baseline invalid post-seal work is not compatibility law.',
 'targetTruth':'Count actual eligible probe entry before host reentry through pure state; preserve no-child/Windows fast-path assessment meaning. Apply an observation and continuation only while its origin remains current, rejecting stale/sealed before any fact write. Preserve actual counts; never count cancelled tails or decrement begun attempts. Valid disposal/seal continuations must remain.',
 'writeRoots':paths+[str(S.relative_to(F))],
 'constraints':'Four existing source paths only. Preserve original API, bigint deadline law, fresh snapshots/recomputed elapsed, sealed completion, first Error identity and all previous tests. No whole-A redesign, B/helper/main/HTTP/worker/dependency/peer-F1 change. A consolidates; report aggregate bridge+state lines and coordination honestly, not net deletion.',
 'requiredActualOwnerCases':['Completed reentry:2 actual probes/count2/absent/0 signals/3 destroys/no timer residue','Exit-only reentry drains before seal, rejecting stale present while pending','Still-active immediate strengthening:independent host-call census, no obsolete TERM and unchanged tightened bounds','Ordinary/throwing assessments and pre-entry cancelled-tail behavior retained'],
 'nativeEnvelope':dict(model='claude-opus-5-5',effort='xhigh',absoluteTimeoutMs=900000,inactivityTimeoutMs=180000,maxTurns=100),
 'selfchecks':'Fresh scratch compiler <=240s, Bash timeout300000ms; actual ^controlled (timing|lifetime): <=60s, Bash90000ms. Preserve first red. No full lifetime/physical/unit/installed or provider nesting.',
 'effectsNow':'New native03 controls, immutable read inputs, declared scratch directories and main GOALS/T287 current prefixes only. F source, Git/index, accepted releases/installs/pins and prior failures preserved.',
 'returnRelation':'Return exact READY to Root. No setup/provider/repair until admitted. After future native freeze, same external probe plus whole lifetime must pass before B; full Phase2 acceptance remains joint.'
}
write(N/'ROOT_SCOPE.json',scope);cp(N/'ROOT_SCOPE.json',I/'ROOT_SCOPE.json')
for src,name in [(reports['sourceReview'],'SOURCE_REVIEW.md'),(reports['design'],'DESIGN_R1.md'),(reports['executedDesign'],'EXECUTED_DESIGN.md'),(reports['executedProof'],'EXECUTED_PROOF.md'),(reports['candidateObservation'],'CANDIDATE_OBSERVATION.json'),(reports['baselineObservation'],'BASELINE_OBSERVATION.json')]:cp(src,I/name)
ext=remap(json.loads((F/'qualification-inputs/rc11-effect-phase2-01/native-02/EXTERNAL_TOOLS.json').read_text()))
write(I/'EXTERNAL_TOOLS.json',ext)
instructions='''Repair only R1 in the existing A implementation. The admitted source is native02 freeze b5a8316d / source cddcc3bc, not the original baseline. Read the short Root scope, executed Design/Proof evidence and the two current shared modules, then implement the narrow entry/result-boundary repair. Accepted upstream Product/Design and all previous behavior remain; no broad A redesign or B command/main work. Only the four named source files and scratch are writable. The addressed readRoots list is initial context, not a ban on relevant read-only repository contracts.

Count each actual eligible probe assessment at entry through pure immutable state, immediately before the existing fast-path evaluation or host probe can reenter. Preserve assessment counts for no-child/Windows/undefined-PID paths and throwing probes. A proposed tail cancelled by preceding signal/reconcile is not an entered assessment: do not count it early. Do not decrement an entered attempt when its result becomes stale. Bind result plus continuation to its current origin; reject stale/sealed results before any absence/fact writes or downstream actions, including when reentry has not yet sealed. Keep the existing synchronous bridge and single state owner. Do not add a parallel counter, generic scheduler, blanket tail rejection or suppress legitimate dispose/seal continuations.

The retained actual candidate fixture entered two probes before completion but sealed count1, then accepted stale present. The baseline sealed count2 correctly at that cut, then its obsolete outer continuation reopened cleanup, performed a third probe, TERM and a second disposal. Never describe these as the same accounting mechanism or preserve invalid post-seal work as compatibility. The fixed completed-reentry expectation is two actual probe calls, count2 in frozen completion and later fresh snapshots, absent throughout after nested confirmation, zero signals, exactly three stream destroys and no timer residue.

Add small controlled actual-owner tests with independent host-call counters and fixed physical expectations: completed exit+close reentry; exit-only draining before explicit close; active immediate strengthening with tightened bounds unchanged and no stale TERM; ordinary/throwing assessments and cancelled-tail-before-entry accounting. For active strengthening derive and assert the finite actual call trace independently; the Design's four-call handtrace is not executed evidence. No reducer action-list oracle, copied implementation model or sleeps. Retain the existing 13 controlled timing/lifetime cases and all other test bodies/oracles. Preserve Error references, first-error/disposal order, fresh snapshot identity/recomputed elapsed and separately sealed completion. Keep createMonotonicDeadline unchanged; no production clock or physical policy change.

Update only the permitted plan's current A/R1 status and truthful responsibility/accounting map. A consolidates state/decisions; total old/new executable coordination must include both modules and cannot be called net deletion. Preserve both original red probe records, prior native01 failure and all qualification limits. B and peer retained-fact coverage stay separate and unimplemented by this task.

Use pinned EXTERNAL_TOOLS: compile fresh changed source only into the new scratch tenant (240s outer cap, Bash300000ms). Then run exactly ^controlled (timing|lifetime): with the actual scratch-compiled owner (60s outer cap, Bash90000ms). Preserve raw output and the first failed check; compiler diagnostics may be fixed within this call, but do not relax an oracle or retry a semantic failure blindly. No stale compiled behavior credit, whole lifetime/physical/m5/unit/installed tests, pack/generation/install, Git, paid child or provider nesting. The fixed native envelope is900s absolute/180s inactivity/100turns, Opus5.5 xhigh. Return actual changes, both-file accounting, check results/first red and gaps. Stop source edits at return; source/proof acceptance belongs to Root.'''
task={
 'id':'t287-effect-phase2-native-03-r1','status':'READY_FOR_ADMITTED_NATIVE_SOURCE_AUTHOR',
 'outcome':'Repair A probe entry accounting and current-origin result/continuation eligibility, preserving synchronous lifetime contracts and all prior cases.',
 'readRoots':['AGENTS.md','stdo_abiogenesis.json',str(I.relative_to(F))]+paths+[f'{T}/test_env/support/t287-publication-observer.mjs',f'{T}/test_env/support/r10-private-owner-harness.mjs',f'{T}/package.json',f'{T}/tsconfig.json'],
 'maxContextFiles':24,'maxContextBytes':1048576,'maxPromptBytes':1048576,
 'readFirst':[str((I/x).relative_to(F)) for x in ['ROOT_SCOPE.json','EXECUTED_DESIGN.md','EXECUTED_PROOF.md','EXTERNAL_TOOLS.json']]+paths[:2]+[paths[2]],
 'writeRoots':scope['writeRoots'],
 'checks':['Fresh scratch-only compiler <=240s/Bash300000ms','Actual-owner ^controlled (timing|lifetime): <=60s/Bash90000ms; retain first red','Preserve all other source, actual entry counts/currentness and honest total bridge+state accounting'],
 'instructions':[instructions]
}
write(N/'TASK.json',task)
for name in ['host.mjs','transport-preflight.mjs']:cp(OLD/'setup-02'/name,N/name)
for name in ['claude-provider.sh','npm-user.npmrc','npm-global.npmrc']:cp(OLD/name,N/name)
os.chmod(N/'claude-provider.sh',0o755)

prefix=('Current selection: **RC11_EFFECT_PHASE2_A_R1_PREPARING_AFTER_EXECUTED_PROBE_COUNTEREXAMPLE.** '
 'Root [PHASE2-A-R1-PREP-01]('+str(N/'ROOT_SCOPE.json')+') selects a narrow realization repair on frozen A `cddcc3bc…`. '
 'The successful bounded native A call and 13 controlled passes did not close R1: actual candidate reentry undercounts before sealing and accepts a stale result; baseline first-seal count was correct but its stale continuation performs invalid post-seal work. Both red runs and closed Design/Proof conjunction remain preserved. '
 'Four-path repair preparation is active; setup/provider, whole lifetime and B remain held for exact admissions. Full Phase2 acceptance is still joint and open. '
 '`RC11-OWNER-FACT-REUSE-PROOF-001` remains deferred coverage before complete retained-fact/currentness qualification under the [peer disposition]('+str(P/'peer-review-intake/ROOT_DISPOSITION.json')+'); it does not expand A. '
 'Phase1/oracle exact closures stand; installed RC11 stays unchanged/local/unqualified/unpublished and RC10 remains pinned. Prior bodies are preserved verbatim.\n\n').encode()
tracking=[]
for x in g['mainTracking']:
    path=Path(x['path']); before=path.read_bytes(); assert pin(path)==x
    path.write_bytes(prefix+before)
    assert path.read_bytes()[len(prefix):]==before
    tracking.append(dict(before=x,after=pin(path),prefixBytes=len(prefix),priorBodyPreserved=True))
for x in g['indices']:check(x)
write(N/'TRACKING.json',dict(status='AUTHORIZED_IDLE_BOUNDARY_PREFIX_ONLY',files=tracking,indicesUnchanged=g['indices'],heads=g['heads']))
g['mainTracking']=[x['after'] for x in tracking];g['sourceInventory']=pin(OLD/'source-freeze.json')
write(N/'PRESERVATION_GUARDS.json',g)

b=remap(json.loads((OLD/'setup-02/BINDING.json').read_text()))
b['id']=task['id'];b['activation']=pin(N/'ROOT_SCOPE.json');b['scopeInputGrant']=b['activation'];b['task']=pin(N/'TASK.json')
b['sourceInventory']=pin(OLD/'source-freeze.json');b['sourceMaterialization']=pin(OLD/'FREEZE_RECEIPT.json')
b['providerWrapper']=pin(N/'claude-provider.sh');b['provider']['command']=str(N/'claude-provider.sh')
b['readOnlyInputPins']=[pin(x) for x in sorted(I.iterdir())]
b['preservationGuards']=pin(N/'PRESERVATION_GUARDS.json')
b['proofControls']=[pin(N/'transport-preflight.mjs'),pin(N/'npm-user.npmrc'),pin(N/'npm-global.npmrc'),b['prebuiltIdentity'],b['preservationGuards']]
b['sourceSelection']='Root PHASE2-A-R1-PREP-01:four existing A source paths plus fresh scratch; all other source readonly. No setup/provider yet.'
assert b['runtimeRoot']==str(N/'runtime-001') and b['scratchRoot']==str(N/'host-scratch')
assert b['nativeScratchRoot']==str(S)
for env in ['environment','workerEnvironment']:assert b[env]['BASH_MAX_TIMEOUT_MS']=='300000'
write(N/'BINDING.json',b)
context=[]
for rel in task['readRoots']:
    q=F/rel
    for x in sorted(q.rglob('*')) if q.is_dir() else [q]:
        if x.is_file():context.append(pin(x))
assert len(context)<=task['maxContextFiles'];assert sum(x['bytes'] for x in context)<=task['maxContextBytes']
for row in freeze['rows']:
    bts=(F/row['path']).read_bytes();assert len(bts)==row['bytes'] and sha(bts)==row['sha256']
for x in g['indices']+g['mainTracking']+g['candidateTracking']+[g['builderPin'],g['archive'],g['workspaceManifest']]:check(x)
write(N/'PREPARATION.json',dict(status='CONTROLS_READY_STATIC_PREFLIGHT_PENDING',sourceInventory=pin(OLD/'source-freeze.json'),sourceDigest=freeze['sourceDigest'],sourceRows=len(freeze['rows']),reports={k:pin(v) for k,v in reports.items()},context=dict(files=len(context),sourceMemberBytes=sum(x['bytes'] for x in context),instructionUtf8Bytes=len(instructions.encode()),sourceContentsInlined=False,renderedBytes='Only actual future PREPARED can measure installed renderer.'),hostByteIdentical=pin(N/'host.mjs')['sha256']==pin(OLD/'setup-02/host.mjs')['sha256'],sourcePreserved=True,setupProviderHeld=True))
print(json.dumps({n:pin(N/n) for n in ['ROOT_SCOPE.json','TASK.json','BINDING.json','PREPARATION.json','TRACKING.json']}))
