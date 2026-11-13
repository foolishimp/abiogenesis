from pathlib import Path
import json,hashlib,shutil,os,subprocess,shlex
R=Path('/Users/jim/src/apps/abiogenesis');P=R/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01'
OLD=P/'native-03';N=P/'native-04';F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T='build_tenants/abiogenesis/typescript'
I=F/'qualification-inputs/rc11-effect-phase2-01/native-04';S=F/'qualification-scratch/rc11-effect-phase2-01/native-04';D=OLD/'immediate-probe-discriminator-01'
NODE='/opt/homebrew/Cellar/node/24.7.0/bin/node';sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
def check(x):assert pin(x['path'])==x,x['path']
def write(p,v):
 with Path(p).open('xb') as h:h.write(v if isinstance(v,bytes) else (json.dumps(v,indent=2,ensure_ascii=False)+'\n').encode())
def cp(a,b):write(b,Path(a).read_bytes())
def remap(v):
 if isinstance(v,str):return v.replace(str(OLD),str(N)).replace('rc11-effect-phase2-01/native-03','rc11-effect-phase2-01/native-04')
 if isinstance(v,list):return [remap(x) for x in v]
 if isinstance(v,dict):return {k:remap(x) for k,x in v.items()}
 return v
g=json.loads((OLD/'PRESERVATION_GUARDS.json').read_text());env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def guard():
 for x in g['indices']+g['mainTracking']+g['candidateTracking']+[g['builderPin'],g['archive'],g['workspaceManifest']]:check(x)
 for root,head in g['heads'].items():assert subprocess.check_output(['/usr/bin/git','-C',root,'rev-parse','HEAD'],env=env,text=True).strip()==head
freeze=json.loads((OLD/'source-freeze.json').read_text());assert freeze['sourceDigest']=='9ef03c3355d41f940e91d703e044708d18d401858c95242fdf35df92abcf8eba'
def source_guard():
 for row in freeze['rows']:
  b=(F/row['path']).read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'],row['path']
guard();source_guard()
compiled=json.loads((OLD/'COMPILED_SCRATCH_INVENTORY.json').read_text())
for row in compiled['rows']:
 b=(Path(compiled['root'])/row['path']).read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'],row['path']
assert not I.exists() and not S.exists() and not (N/'runtime-001').exists()
I.mkdir();S.mkdir()
for rel in ['tmp','npm-cache','evidence']:(S/rel).mkdir()
reports={'design':OLD/'design-review/ASSESSMENT.md','sourceReview':OLD/'source-review/ASSESSMENT.md','executedProof':OLD/'source-review/R2_EVIDENCE.md','bothRunReturn':D/'RETURN.json','baselineObservation':D/'actual-baseline-001/OBSERVATION.json','candidateObservation':D/'actual-candidate-001/OBSERVATION.json'}
expected={'design':'51f6a3c41c30652c8f2e4be86b4c5eba94cd0b21f3ee3b3855670d635584df8f','sourceReview':'f67d5a5f9eecf69f56dd341814681b09b9d0ef6ec38bed4ef3aef0016ef024bc','executedProof':'60554752c7e31f89bf03d1dc5399fa7146265ad007c6e81dc1bcb4ddd371f871','bothRunReturn':'3bc4e31bb66280bda49c7987b62eeacf96967bef423a403d4a355e19c1a4e188'}
for k,v in expected.items():assert pin(reports[k])['sha256']==v
paths=[f'{T}/code/src/shared/owned_process_lifetime.ts',f'{T}/code/src/shared/owned_process_state.ts',f'{T}/test_env/tests/t287-owned-process-lifetime.test.mjs',f'{T}/design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md']
subject=dict(sourceInventory=pin(OLD/'source-freeze.json'),sourceDigest=freeze['sourceDigest'],sourceRows=len(freeze['rows']),sourceCommit=g['heads'][str(F)],files=[pin(F/x) for x in paths],operatorVerifiedAllFrozenRows=True,compiledPredecessor=pin(OLD/'COMPILED_SCRATCH_INVENTORY.json'),compiledRelation=pin(OLD/'SCRATCH_COMPILE_RELATION.json'),meaning='Four author targets pinned before dispatch; actor need not scan full inventory. Predecessor compiled bytes are evidence only; selfchecks require fresh native04 scratch output.')
write(N/'SOURCE_SUBJECT.json',subject);cp(N/'SOURCE_SUBJECT.json',I/'SOURCE_SUBJECT.json')
scope=dict(id='PHASE2-A-R2-PREP-01',status='ROOT_SELECTED_NARROW_R2_PREPARATION_SETUP_PROVIDER_HELD',actor='Separately activated Writer/Operator; Root remains Executive',changeClass='realization_refactor',ownerInstruction='User continue; Root conjoins closed Design, independent source and executed paired discriminator and selects narrow R2 realization repair. No Product or authority-policy change.',predecessorScope=pin(OLD/'ROOT_SCOPE.json'),basis=json.loads((OLD/'ROOT_SCOPE.json').read_text())['basis'],frame='repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#executive-writer-and-reviewer-binding',sourceSubject=pin(N/'SOURCE_SUBJECT.json'),conjunction={k:pin(v) for k,v in reports.items()},causalDisposition='R1 entry accounting/current-origin result rejection is source-satisfied. Distinct A regression R2 discards still-valid immediate intent together with an obsolete probe result. Actual pre-A requests TERM,KILL before outer return with200ms bound; native03 requests onlyTERM with300ms bound. Both actual probe counts match census; this is not R1 undercount. Historical native03 compatibility statement is false for pre-A.',targetTruth='Preserve stronger immediate cleanup intent across nested graceful exit/close reentry, decide against current physical state, discard stale absence, retain actual entry counts and never resurrect completed cleanup. No independent supervisor/counter or unconditional replay of stale continuations. Preserve coalesced KILL/deadline duty and prior R1/clock/snapshot/Error/disposal laws. Algorithm/local carrier choice belongs to the author.',writeRoots=paths+[str(S.relative_to(F))],requiredActualOwnerCases=['Exact first-probe exit-only/all-present immediate fixture: KILL before outer call returns; cleanup deadline<=200ms at grace100; independent actual probe census, no invented fixed count','Outer immediate with nested absent+exit+close completion: sealed facts and no post-completion signals/probes/disposal; retain all18 previous controlled cases'],constraints='Only lifetime/state/lifetime-test/plan plus fresh scratch. No B/HTTP/worker/shared runner/dependencies/peer F1/Git. Correct new report/plan compatibility wording, preserve old reports/red runs. Account across both modules honestly; no net-deletion claim.',nativeEnvelope=dict(model='claude-opus-5-5',effort='xhigh',absoluteTimeoutMs=900000,inactivityTimeoutMs=180000,maxTurns=100),selfchecks='Fresh scratch compiler<=240s/Bash300000; exact ^controlled (timing|lifetime): <=60s/Bash90000. No full lifetime/broad/pack/provider nesting.',effectsNow='Fresh native04 controls/immutable read inputs/scratch directories and current main GOALS/T287 prefixes only. No source/setup/provider effects until exact later Root admission.',returnRelation='READY only. After future closed freeze: preserved R1 probe, R2 immediate fixture, whole lifetime and baseline signal-notice form selected reproof cone. A and joint Phase2 acceptance open; B held.')
write(N/'ROOT_SCOPE.json',scope);cp(N/'ROOT_SCOPE.json',I/'ROOT_SCOPE.json')
for key,name in [('design','DESIGN_R2.md'),('sourceReview','SOURCE_REVIEW.md'),('executedProof','EXECUTED_PROOF.md'),('baselineObservation','BASELINE_OBSERVATION.json'),('candidateObservation','CANDIDATE_OBSERVATION.json')]:cp(reports[key],I/name)
cp(D/'immediate-probe.mjs',I/'immediate-probe.mjs')
write(I/'EXTERNAL_TOOLS.json',remap(json.loads((F/'qualification-inputs/rc11-effect-phase2-01/native-03/EXTERNAL_TOOLS.json').read_text())))
instructions='''Implement only R2 on the exact native03 R1 successor. Read ROOT_SCOPE, SOURCE_SUBJECT, EXECUTED_PROOF and the current two shared modules; SOURCE_SUBJECT pins all four author targets and the Operator has verified the full1345-row subject, so do not spend the call scanning the whole inventory. The short Design/source reviews and retained actual observations explain the repair boundary. No broad A redesign or B work. The addressed readRoots select initial context; relevant repository contracts remain read-only.

Rejecting an obsolete probe observation must not discard a still-valid immediate cleanup request. Preserve stronger immediate intent across nested graceful exit/close reentry; decide against current physical state, reject stale absence and preserve actual entry counts. Never resurrect completed cleanup or replay stale continuations unconditionally. Keep one state/decision owner with the existing synchronous bridge. The algorithm and local carrier are your choice under this contract; no independent supervisor/counter or new mechanism approval gate. Preserve the coalescing rule's finite KILL/deadline duty and R1 entry-count/current-origin guarantees, including no-child/Windows assessment semantics and pre-entry cancelled tails.

The exact paired fixture in inputs/immediate-probe.mjs uses grace100, first probe exit-only, all probes present, outer requestTermination('immediate'). Its preserved pre-A result requests TERM,KILL at clock0 with200ms deadline; native03 requests TERM only with300ms deadline and KILL at100ms. Actual independent counts match recorded counts in both. Native03 fails the first KILL-before-handback assertion; later300ms is observation, not an assertion pass. Preserve these records unchanged. Later bounded cleanup does not discharge immediate intent.

Add meaningful controlled actual-owner cases: (1) reproduce that exact first-probe exit-only/all-present immediate relation, requiring KILL before the outer request returns, cleanupDeadline no later than200ms at grace100, and independent actual entry census rather than an invented total count; (2) outer immediate with nested absent plus exit+close completion, requiring no subsequent signals/probes/disposal, aligned frozen completion/later snapshots and no timer residue. Retain all18 previous controlled timing/lifetime cases and other test bodies/oracles. No reducer action-list oracle, copied model, sleep or oracle relaxation. Preserve createMonotonicDeadline, bigint bounds, fresh-object/recomputed-elapsed snapshot behavior, separately sealed completion, original first Error references and lawful disposal/seal continuations.

Correct only the permitted plan's current A/R1/R2 status and compatibility/accounting statement. R1 is source-satisfied, R2 is an executed A regression; the prior report's claim 'as in native02 and the predecessor' is false for pre-A. State the correction in the NEW return/plan without altering old native03 records. Include combined bridge+state line/coordination counts; this is consolidation, not net deletion. Keep B, peer retained-fact proof and full Phase2 acceptance pending. Do not claim external proof from native selfchecks.

Use EXTERNAL_TOOLS for fresh native04 scratch compilation (outer240s, Bash300000ms), then exactly ^controlled (timing|lifetime): against that freshly compiled actual owner (outer60s, Bash90000ms). All outputs/temp/evidence stay in granted scratch; dependencies and source build are read-only. Retain raw first-red diagnostics. Compiler diagnostics may be repaired within this one call; a genuine semantic contradiction returns facts, no blind rerun or weakened test. No whole lifetime/physical/m5/unit/installed campaign, pack/generation/install, Git, nested provider or paid child. The absolute900s/inactivity180s/100turn envelope is fixed. Return actual four-path delta, both-module accounting, actual checks/first red and gaps, then stop edits. Root alone accepts source/proof.'''
task=dict(id='t287-effect-phase2-native-04-r2',status='READY_FOR_ADMITTED_NATIVE_SOURCE_AUTHOR',outcome='Preserve immediate cleanup intent across stale probe rejection without resurrecting completed cleanup.',readRoots=['AGENTS.md','stdo_abiogenesis.json',str(I.relative_to(F))]+paths+[f'{T}/test_env/support/t287-publication-observer.mjs',f'{T}/test_env/support/r10-private-owner-harness.mjs',f'{T}/package.json',f'{T}/tsconfig.json'],maxContextFiles=24,maxContextBytes=1048576,maxPromptBytes=1048576,readFirst=[str((I/x).relative_to(F)) for x in ['ROOT_SCOPE.json','SOURCE_SUBJECT.json','EXECUTED_PROOF.md','EXTERNAL_TOOLS.json']]+paths[:3],writeRoots=scope['writeRoots'],checks=['Fresh scratch compiler<=240s/Bash300000','Actual-owner ^controlled (timing|lifetime): <=60s/Bash90000; preserve first red','Four-path delta only; preserve R1 laws,18 prior controlled cases and current physical facts'],instructions=[instructions])
write(N/'TASK.json',task)
for name in ['host.mjs','transport-preflight.mjs','claude-provider.sh','npm-user.npmrc','npm-global.npmrc']:cp(OLD/name,N/name)
os.chmod(N/'claude-provider.sh',0o755)
prefix=('Current selection: **RC11_EFFECT_PHASE2_A_R2_PREPARING_AFTER_IMMEDIATE_INTENT_COUNTEREXAMPLE.** Root [PHASE2-A-R2-PREP-01]('+str(N/'ROOT_SCOPE.json')+') selects the narrow four-path successor on frozen native03 `9ef03c33…`. R1 is source-satisfied; separate R2 is confirmed: first-probe exit reentry preserves immediate KILL/200ms in pre-A but native03 defers KILL with300ms. Actual paired observations and all earlier failures remain immutable. Preparation only: setup/provider and A reproof await exact admission; B remains held and joint Phase2 acceptance open. RC10 stays pinned; delivered RC11 is unchanged/local/unqualified/unpublished. Phase1/oracle exact closures stand; deferred owner-fact coverage and other qualification obligations stay open. Prior bodies are preserved verbatim.\n\n').encode()
tracking=[]
for x in g['mainTracking']:
 p=Path(x['path']);before=p.read_bytes();check(x);p.write_bytes(prefix+before);assert p.read_bytes()[len(prefix):]==before
 tracking.append(dict(before=x,after=pin(p),prefixBytes=len(prefix),priorBodyPreserved=True))
for x in g['indices']:check(x)
write(N/'TRACKING.json',dict(status='AUTHORIZED_IDLE_BOUNDARY_PREFIX_ONLY',files=tracking,indicesUnchanged=g['indices'],heads=g['heads']))
g['mainTracking']=[x['after'] for x in tracking];g['sourceInventory']=pin(OLD/'source-freeze.json');write(N/'PRESERVATION_GUARDS.json',g)
b=remap(json.loads((OLD/'BINDING.json').read_text()));b['id']=task['id'];b['activation']=pin(N/'ROOT_SCOPE.json');b['scopeInputGrant']=b['activation'];b['task']=pin(N/'TASK.json');b['sourceInventory']=pin(OLD/'source-freeze.json');b['sourceMaterialization']=pin(OLD/'FREEZE_RECEIPT.json');b['providerWrapper']=pin(N/'claude-provider.sh');b['provider']['command']=str(N/'claude-provider.sh');b['readOnlyInputPins']=[pin(x) for x in sorted(I.iterdir())];b['preservationGuards']=pin(N/'PRESERVATION_GUARDS.json');b['proofControls']=[pin(N/'transport-preflight.mjs'),pin(N/'npm-user.npmrc'),pin(N/'npm-global.npmrc'),b['prebuiltIdentity'],b['preservationGuards'],pin(N/'SOURCE_SUBJECT.json')];b['sourceSelection']='Root PHASE2-A-R2-PREP-01:four existing A source paths plus fresh scratch; all other source read-only. Setup/provider held.'
assert b['runtimeRoot']==str(N/'runtime-001') and b['scratchRoot']==str(N/'host-scratch') and b['nativeScratchRoot']==str(S)
for e in ['environment','workerEnvironment']:assert b[e]['BASH_MAX_TIMEOUT_MS']=='300000'
write(N/'BINDING.json',b)
context=[]
for rel in task['readRoots']:
 q=F/rel
 for x in sorted(q.rglob('*')) if q.is_dir() else [q]:
  if x.is_file():context.append(pin(x))
assert len(context)<=24 and sum(x['bytes'] for x in context)<=1048576
source_guard();guard()
write(N/'PREPARATION.json',dict(status='CONTROLS_READY_STATIC_PREFLIGHT_PENDING',sourceSubject=pin(N/'SOURCE_SUBJECT.json'),context=dict(files=len(context),sourceMemberBytes=sum(x['bytes'] for x in context),instructionUtf8Bytes=len(instructions.encode()),sourceContentsInlined=False,renderedBytes='Measured only by actual future installed PREPARED renderer.'),hostByteIdentical=pin(N/'host.mjs')['sha256']==pin(OLD/'host.mjs')['sha256'],compiledPredecessorRowsVerified=len(compiled['rows']),sourcePreserved=True,setupProviderHeld=True))
print(json.dumps({n:pin(N/n) for n in ['ROOT_SCOPE.json','TASK.json','BINDING.json','PREPARATION.json','TRACKING.json']}))
