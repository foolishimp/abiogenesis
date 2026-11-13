from pathlib import Path
import json, hashlib, os, re, subprocess, shutil, shlex
R=Path('/Users/jim/src/apps/abiogenesis'); P=R/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01'
O=P/'native-04'; N=P/'native-b01'; F=Path('/private/tmp/abg-rc11-foundation-20261110-01'); T='build_tenants/abiogenesis/typescript'
I=F/'qualification-inputs/rc11-effect-phase2-01/native-b01'; S=F/'qualification-scratch/rc11-effect-phase2-01/native-b01'
NODE='/opt/homebrew/Cellar/node/24.7.0/bin/node'; env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p); b=p.read_bytes(); return dict(path=str(p),bytes=len(b),sha256=sha(b))
def check(x):
 actual=pin(x['path']); assert all(actual[k]==x[k] for k in ['path','bytes','sha256']),x['path']
def write(p,v):
 with Path(p).open('xb') as h: h.write(v if isinstance(v,bytes) else (json.dumps(v,indent=2,ensure_ascii=False)+'\n').encode())
def cp(a,b):write(b,Path(a).read_bytes())
def remap(v):
 if isinstance(v,str):return v.replace(str(O),str(N)).replace('rc11-effect-phase2-01/native-04','rc11-effect-phase2-01/native-b01')
 if isinstance(v,list):return [remap(x) for x in v]
 if isinstance(v,dict):return {k:remap(x) for k,x in v.items()}
 return v
checkpoint=json.loads((O/'proof-01/CHECKPOINT_RETURN.json').read_text())
inventory=O/'proof-01/CHECKPOINT_SOURCE_INVENTORY.json'; freeze=json.loads(inventory.read_text())
assert pin(inventory)['sha256']=='ce1b3debd80d153e878d6b52a6ce8fa5c7d6963cf2dd2738078dddf37e0028dd'
assert freeze['sourceDigest']=='1b8bb6c426e339e22ef5c1ab07b453d6ecfe52092c07e79dd0fb1852dee077b6'
assert checkpoint['commit']=='e134103a26733dd35d94d9d1dbf73437464a87d5' and len(freeze['rows'])==1345
g=json.loads((O/'PRESERVATION_GUARDS.json').read_text())
g['indices']=[checkpoint[x] for x in ['mainIndex','deliveredC11Index','candidateIndex']]
g['heads'][str(F)]=checkpoint['commit']; g['mainTracking']=[x['after'] for x in checkpoint['tracking']]
g['sourceInventory']=pin(inventory)
def guard():
 for x in g['indices']+g['mainTracking']+g['candidateTracking']+[g['builderPin'],g['archive'],g['workspaceManifest']]:check(x)
 for root,head in g['heads'].items():assert subprocess.check_output(['/usr/bin/git','-C',root,'rev-parse','HEAD'],env=env,text=True).strip()==head
def source_guard():
 for row in freeze['rows']:
  b=(F/row['path']).read_bytes(); assert len(b)==row['bytes'] and sha(b)==row['sha256'],row['path']
guard(); source_guard()
assert not subprocess.check_output(['/usr/bin/git','-C',str(F),'status','--porcelain=v1','--untracked-files=no'],env=env)
assert not subprocess.check_output(['/usr/bin/git','-C',str(F),'diff','--cached','--name-only'],env=env)
untracked=subprocess.check_output(['/usr/bin/git','-C',str(F),'ls-files','--others','--exclude-standard','-z'],env=env)
assert untracked==(O/'proof-01/CHECKPOINT_UNTRACKED_AFTER.bin').read_bytes()
g['excludedUntrackedPreimage']=dict(count=len(untracked.split(b'\0'))-1,sha256=sha(untracked),receipt=pin(O/'proof-01/CHECKPOINT_UNTRACKED_AFTER.bin'))
paths=[f'{T}/code/src/implementation/worksite_command_helper.ts',f'{T}/code/src/shared/owned_process_scope.ts',f'{T}/test_env/tests/t287-owned-process-lifetime.test.mjs',f'{T}/test_env/tests/m5-worker-transport.test.mjs',f'{T}/test_env/tests/t287-lifecycle-failure-carrier.test.mjs',f'{T}/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md',f'{T}/design/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md']
optional=paths[1]; assert not (F/optional).exists() and not (F/optional).is_symlink()
existing=[x for x in paths if x!=optional]
reports={
 'peerDesign':P/'peer-review-intake/design/ASSESSMENT.md',
 'errorBoundary':P/'peer-review-intake/design/B_ERROR_BOUNDARY.md',
 'apiResult':P/'peer-review-intake/design/api-probe-01/RESULT_NOTE.md',
 'apiReturn':P/'peer-review-intake/design/api-probe-01/RETURN.json',
 'aAcceptance':O/'proof-01/ROOT_FINAL_ACCEPTANCE.json',
 'aConjunction':O/'source-review/FINAL_CONJUNCTION.md',
 'configuredProof':P/'proof-intake/CONFIGURED_PROOF_ROUTE.md',
 'peerDisposition':P/'peer-review-intake/ROOT_DISPOSITION.json',
 'clockDisposition':O/'proof-01/DEFERRED_ROOT_DISPOSITION.json'}
expected={'peerDesign':'02e1e491dd7d3f3892cfd9ff29efb0e002d2a89716f9de49c1851a89febd462f','errorBoundary':'4c9ef7a817b93f2830d2bb84a6cf9ba2f375c2fcbc3193759ea37818bbff7f2c','apiReturn':'0337f1fa5519b6856b881174e1342f29e8b132d8b2e9648e0bc704c71cafea68','aConjunction':'9f2704e332c600879f0f0b611a2b435a9e513ca83fc8d89751febc68c161b103'}
for key,value in expected.items():assert pin(reports[key])['sha256']==value
status=json.loads(subprocess.check_output(['/Users/jim/.local/bin/stdo','status','--definition',str(F/'stdo_abiogenesis.json'),'--verify'],env=env,text=True))
assert status['valid'] and status['installed'] and not status['failures'] and status['manifest_sha256']=='102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b'
basis={k:status[k] for k in ['definition','definition_id','basis','manifest_sha256','installed','valid','failures']}
basis['definitionPin']=pin(F/'stdo_abiogenesis.json'); basis['framePin']=pin(F/f'{T}/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md')
write(N/'BASIS.json',basis)
scope=dict(id='PHASE2-B-PREP-01',status='ROOT_SELECTED_B_PREPARATION_SETUP_PROVIDER_HELD',actor='Separately activated Writer/Operator; Root remains Executive',changeClass='realization_refactor',ownerInstruction='User continue; Root accepts A checkpoint and selects the previously planned command/main B construction. This grant prepares controls/inputs/scratch and main current prefixes only; setup/provider/source effects await exact Root admissions.',basis=basis,frame='repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#executive-writer-and-reviewer-binding',source=dict(commit=checkpoint['commit'],tree=checkpoint['tree'],inventory=pin(inventory),sourceDigest=freeze['sourceDigest'],rows=1345),conjunction={k:pin(v) for k,v in reports.items()},futureSourceWriteRoots=paths,scratch=str(S),targetTruth='One closed scoped Effect command, child/lifetime owned before fallible later resources, one idempotent finite-settlement barrier before disposal; canonical completion remains publisher. One helper program crosses unchanged runEffectProgram once at main host boundary. Command-local use/closed Exit selection preserves primary use or cleanup-only failure before narrow original-loop D15 catch; later publication/path/ack failures retain precedence and raw identity.',preserved='A lifetime/state exact; HTTP oneHttpRequest/runHttpProbe bodies, worker_transport, shared/process/effect_definition, schemas/Product/admission/replay/dependencies read-only. Preserve spawn/no-child mapping, direct-exit capture cut, bounds/heartbeat/emergency/report gating, artifact then drained ack then identical Worksite failure. No generic capture/deadline policy, duplicate supervisor, process-failure file or inspector.',optionalModule='owned_process_scope.ts only for demonstrated shared physical acquisition/settlement and deletion benefit. Absent before; no placeholder. Operator inventories a new file after close independently; the maintained native context observation is not claimed to have observed a missing initial path.',nativeEnvelope=dict(model='claude-opus-5-5',effort='xhigh',absoluteTimeoutMs=1800000,inactivityTimeoutMs=180000,maxTurns=100),selfchecks='Fresh scratch compiler <=240s/Bash300000, exact controlled selector <=60s/Bash90000. No physical/whole m5/unit/installed/pack or nested provider.',nonClosure='A is accepted only for its construction/physical contract. B and joint Phase2 not accepted. Retained-fact and reentrant-clock capsules stay deferred; prior failures, six unit skips, synthetic pending-owner and qualification limits remain. No release/install/Git/provider effects under preparation.',returnRelation='Concrete READY to Root; actual setup, held call and provider separately admitted. Native source pass returns frozen source and actual checks, not acceptance. External joint proof follows actual freeze.')
write(N/'ROOT_SCOPE.json',scope)
assert not I.exists() and not S.exists(); I.mkdir(); S.mkdir()
for rel in ['tmp','npm-cache','evidence']:(S/rel).mkdir()
cp(N/'ROOT_SCOPE.json',I/'ROOT_SCOPE.json')
for key,name in [('peerDesign','PEER_DESIGN.md'),('errorBoundary','B_ERROR_BOUNDARY.md'),('apiResult','API_RESULT.md')]:cp(reports[key],I/name)
common=F/f'{T}/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md'; body=common.read_bytes(); text=body.decode(); start=text.index('### 9.3 Process failure facts'); end=text.index('### 9.4 Held suspensions',start)
excerpt=text[start:end].encode(); write(I/'COMMON_LIBRARY_9_3.md',excerpt)
helper=(F/paths[0]).read_text()
http=[]
for name,a,z in [('oneHttpRequest','async function oneHttpRequest(', '\nfunction httpProbeObservation('),('runHttpProbe','async function runHttpProbe(', '\nasync function predicateObservation(')]:
 x=helper.index(a); y=helper.index(z,x); raw=helper[x:y].encode(); http.append(dict(name=name,startMarker=a,endMarker=z,bytes=len(raw),sha256=sha(raw)))
subject=dict(sourceInventory=pin(inventory),sourceDigest=freeze['sourceDigest'],sourceCommit=checkpoint['commit'],sourceTree=checkpoint['tree'],rows=1345,operatorVerifiedAllRows=True,existingTargets=[pin(F/x) for x in existing],optionalNewPath=dict(path=optional,absentBefore=True,placeholderCreated=False,afterCustody='Native return plus Operator full source/new-file inventory; no unsupported missing-path owner-observation claim.'),readOnlyA=[pin(F/f'{T}/code/src/shared/{x}.ts') for x in ['owned_process_lifetime','owned_process_state']],readOnlyHttpBodies=http,commonLibraryExcerpt=dict(source=pin(common),startLine=text[:start].count('\n')+1,endLine=text[:end].count('\n'),excerpt=pin(I/'COMMON_LIBRARY_9_3.md')),checkpoint=pin(O/'proof-01/CHECKPOINT_RETURN.json'))
write(N/'SOURCE_SUBJECT.json',subject);cp(N/'SOURCE_SUBJECT.json',I/'SOURCE_SUBJECT.json')
newNames=[
 'controlled B command: partial setup failures settle before disposal',
 'controlled B command: interruption settles before capture disposal',
 'controlled B command: primary use and cleanup-only failures retain exact outcomes',
 'controlled B helper: raw failures survive actual lifts and host projection',
 'controlled B helper: command failure reaches artifact and drained acknowledgment',
 'controlled B helper: later publication path and acknowledgment failures retain precedence']
testSource=(F/paths[2]).read_text(); oldNames=re.findall(r"^test\('([^']+)'",testSource,re.M); assert len(oldNames)==28
controlled=[x for x in oldNames if x.startswith('controlled ')]; assert len(controlled)==24
census=dict(selector='^controlled ',existingWholeFileNames=oldNames,existingWholeFileCount=28,existingControlledNames=controlled,existingControlledCount=24,requiredNewTopLevelNames=newNames,prospectiveControlledCount=30,prospectiveWholeFileCount=34,meaning='Prospective six compact table-driven additions, not executed results. Preserve all 28 old cases/oracles; no physical cases in author selector. Freeze must report actual names/counts and any discrepancy, never infer proof from this census.')
write(N/'CONTROLLED_CENSUS.json',census);cp(N/'CONTROLLED_CENSUS.json',I/'CONTROLLED_CENSUS.json')
external=remap(json.loads((F/'qualification-inputs/rc11-effect-phase2-01/native-04/EXTERNAL_TOOLS.json').read_text()))
external['controlledCheck']['argv']=[x.replace('^controlled (timing|lifetime):','^controlled ') for x in external['controlledCheck']['argv']]
external['executionBoundary']=external['executionBoundary'].replace('Whole author900s','Whole author1800s')
external['controlledCheck']['census']=pin(I/'CONTROLLED_CENSUS.json')
write(I/'EXTERNAL_TOOLS.json',external)
instructions='''Implement the admitted B command/main increment on accepted A commit e134103a. Read ROOT_SCOPE, SOURCE_SUBJECT, B_ERROR_BOUNDARY, API_RESULT, COMMON_LIBRARY_9_3 and EXTERNAL_TOOLS first. A's bridge/state and all unrelated production code are read-only. Relevant causal-cone source/API reads are allowed; the addressed list is initial context, not a blanket ban. Do not scan the full inventory or whole Effect source. The Operator verified 1345 source rows. Use exact Effect3.22.1; no dependency, Product, schema, admission, replay or shared runner changes. The setup/dispatch holds in ROOT_SCOPE govern Operator preparation; this source task runs only after actual Root native admission.

Make runCommand return one closed scoped Effect, owning child and lifetime before fallible post-spawn capture, timer or heartbeat acquisition. Setup failure still calls existing lifetime.fail and reaches the existing WorksiteHelperFailure projection. Preserve spawn/no-child mapping, copied buffers/direct-exit capture cut, bounds, heartbeat text/cadence, activeCommand emergency behavior and report gating. A lifetime completion Promise remains the canonical fact publisher. Each later-resource finalizer must cross the same idempotent settlement barrier: request existing finite cleanup if necessary, await that same completion, then dispose/detach. Avoid LIFO waiting before any cleanup request and partial-acquisition leaks. Keep process.exit emergency outside ordinary finalizer guarantees. Optional owned_process_scope.ts is warranted only by an actual shared physical acquisition/settlement responsibility and displaced mechanics; no speculative adopters or generic captured-result/deadline/stream policy. No duplicate supervisor. Algorithm and callable placement are yours within this contract, without a per-helper/API gate.

Compose one helper Effect program; execute it through unchanged runEffectProgram exactly once at main's host boundary and retain top-level await main(). Fallible sync/async lifts use identity catch overloads, preserving Error/object/string/null/false/undefined including synchronous invocation throws. Never infer absence from truthiness or nullish values; lifetime.fail's existing normalization contract remains distinct and unchanged. Read B_ERROR_BOUNDARY for exact Effect Cause/Exit constraints. At command Scope retain actual use Exit before teardown, collect closed Scope Exit, prefer failed use or otherwise closed outcome, and retain combined cleanup Cause for bounded diagnostics/tests. This is command-local selection, not a global first-failure cell; cleanup Die must not bypass the typed WorksiteHelperFailure catch. Interruption remains non-success, settlement completes before disposal, and no unbounded uninterruptible wait is assumed prompt.

Keep main's narrow WorksiteHelperFailure catch at the original loop region (current helper1496-1525). Later after-observation, inventories, artifact publication, path validation and stdout callback-drain failures escape as themselves. If these succeed, artifact publication and actual ack drain precede rethrow of the identical retained WorksiteHelperFailure. Preserve raw host projection for selected Fail/Die values, with presence independent of payload; do not use category-priority squash for mixed primary/cleanup causes or invent an Error for interruption/ambiguous Cause. Current Common Library9.3 D15 governs: update only stale C2 opening/section6 sibling-file/inspector references to this artifact/admission route; do not implement process-failure.json or an inspector.

Add six small, meaningful actual-owner/table-driven cases in the existing lifetime file using the exact names in CONTROLLED_CENSUS. Cover partial capture AND timeout acquisition failure cleanup; Scope/interruption settlement before disposal, direct-exit capture cutoff and no residue; exact primary use plus secondary release fault and cleanup-only failure; raw Error/object/string/null/false/undefined through actual helper lifts AND actual host projection with separate caught/rejected presence; actual Worksite failure reaching D15 despite secondary cleanup fault, combined Cause retained, artifact then drained ack then identical rethrow; later publication/path/ack failures superseding retained Worksite failure. The API feasibility probe is guidance, not these production-owner tests. No copied reducer/Effect model, generic harness, sleeps or weakened assertions. Preserve all28 existing lifetime cases and m5/carrier assertions. Adapt only necessary private loaders for bare Effect imports, actual Effect-command exposure through the actual host projection for Promise-facing tests, and explicit acquisition readiness instead of the existing one-microtask assumption. Do not change HTTP oneHttpRequest/runHttpProbe bodies or worker transport.

Before final freeze, make the plan's current B status/design/deletion map truthful. Account across helper and every new module, showing removed responsibilities, all new lines and coordination; moving code or net growth is not net deletion/performance proof. Preserve A acceptance, R1/R2 red history and deferred retained-fact/reentrant-clock capsules. Do not reopen A or claim full Phase2/installed qualification. The optional scope path is absent initially: create it only if justified, report it explicitly; no placeholder and no claim that initial native context observed it.

Use EXTERNAL_TOOLS: fresh scratch compile <=240s under Bash300000ms; then exact ^controlled selector in lifetime file <=60s under Bash90000ms with fresh scratch packageRoot and retained evidence. This selects24 old controlled cases plus6 required additions; four physical cases stay external. Syntax-check changed mjs files is allowed. Compiler diagnostics may be repaired within this one author pass; preserve first red and actual outputs. A new semantic contradiction returns facts, no blind rerun, changed oracle or deadline extension. No whole physical/m5/unit/carrier/installed campaign, pack/generation/install, Git, provider nesting or paid child. Absolute1800s, inactivity180s and100turns are fixed prospectively. Return actual source paths, aggregate coordination/deletion map, exact checks/counts/first red, combined-Cause evidence and gaps; stop source edits at return. Root alone accepts, with full normal-build/helper/configured-C2/lifetime/m5/unit proof external after freeze.'''
readRoots=['AGENTS.md','stdo_abiogenesis.json',str(I.relative_to(F))]+existing+[f'{T}/code/src/shared/{x}.ts' for x in ['owned_process_lifetime','owned_process_state','effect_definition']]+[f'{T}/test_env/support/t287-publication-observer.mjs',f'{T}/test_env/support/r10-private-owner-harness.mjs',f'{T}/package.json',f'{T}/tsconfig.json']
task=dict(id='t287-effect-phase2-native-b01-command',status='READY_FOR_ADMITTED_NATIVE_SOURCE_AUTHOR',outcome='Scoped Effect command and main composition preserving physical settlement, raw failure identity and D15 artifact/ack precedence.',readRoots=readRoots,maxContextFiles=32,maxContextBytes=1048576,maxPromptBytes=1048576,readFirst=[str((I/x).relative_to(F)) for x in ['ROOT_SCOPE.json','SOURCE_SUBJECT.json','B_ERROR_BOUNDARY.md','API_RESULT.md','COMMON_LIBRARY_9_3.md','EXTERNAL_TOOLS.json']]+[paths[0],paths[2]],writeRoots=paths+[str(S.relative_to(F))],checks=['Fresh scratch compiler <=240s/Bash300000','Actual-owner lifetime ^controlled selector <=60s/Bash90000; preserve first red and exact census','Source boundary, readonly A/HTTP guards, aggregate all-file responsibility accounting; no acceptance claim'],instructions=[instructions])
write(N/'TASK.json',task)
for name in ['host.mjs','transport-preflight.mjs','claude-provider.sh','npm-user.npmrc','npm-global.npmrc']:cp(O/name,N/name)
os.chmod(N/'claude-provider.sh',0o755)
prefix=('Current selection: **RC11_EFFECT_PHASE2_A_ACCEPTED_B_PREPARING.** Root [PHASE2-B-PREP-01]('+str(N/'ROOT_SCOPE.json')+') selects scoped command/main construction on accepted A `e134103a` / tree `3be03625`, source `1b8bb6c4…`. A remains accepted only for construction/physical-contract preservation: exact R1/R2 probes and28/28 lifetime cases pass; original signal-before comparison stays red. B preparation binds one prospective Opus5.5 xhigh1800s/180s/100-turn author; setup/provider/source effects await exact admission. Joint Phase2 normal-build/helper/configured-C2/lifetime/m5/unit proof remains external and unexecuted for B. Both deferred capsules (RC11-OWNER-FACT-REUSE-PROOF-001 and RC11-LIFETIME-REENTRANT-BOUND-001), historical failures and qualification limits remain open. RC10 stays pinned; delivered RC11 stays unchanged/local/unqualified/unpublished. GOAL035/T287 remain active; no release, installation or later HTTP/worker/GC03 activation. Prior bodies are preserved verbatim.\n\n').encode()
tracking=[]
for x in g['mainTracking']:
 check(x); p=Path(x['path']); before=p.read_bytes(); p.write_bytes(prefix+before); assert p.read_bytes()[len(prefix):]==before
 tracking.append(dict(before=x,after=pin(p),prefixBytes=len(prefix),priorBodyPreserved=True))
for x in g['indices']:check(x)
write(N/'TRACKING.json',dict(status='AUTHORIZED_IDLE_BOUNDARY_PREFIX_ONLY',files=tracking,indicesUnchanged=g['indices'],heads=g['heads']))
g['mainTracking']=[x['after'] for x in tracking];write(N/'PRESERVATION_GUARDS.json',g)
b=remap(json.loads((O/'BINDING.json').read_text()));b['id']=task['id'];b['activation']=pin(N/'ROOT_SCOPE.json');b['scopeInputGrant']=b['activation'];b['task']=pin(N/'TASK.json');b['sourceCommit']=checkpoint['commit'];b['sourceInventory']=pin(inventory);b['sourceMaterialization']=pin(O/'proof-01/CHECKPOINT_RETURN.json');b['providerWrapper']=pin(N/'claude-provider.sh');b['provider']['command']=str(N/'claude-provider.sh');b['provider']['absoluteTimeoutMs']=1800000;b['transportContract']['absoluteTimeoutMs']=1800000;b['readOnlyInputPins']=[pin(x) for x in sorted(I.iterdir())];b['preservationGuards']=pin(N/'PRESERVATION_GUARDS.json');b['proofControls']=[pin(N/'transport-preflight.mjs'),pin(N/'npm-user.npmrc'),pin(N/'npm-global.npmrc'),b['prebuiltIdentity'],b['preservationGuards'],pin(N/'SOURCE_SUBJECT.json'),pin(N/'CONTROLLED_CENSUS.json')];b['sourceSelection']='PHASE2-B-PREP-01: six existing source paths plus one optional absent scope module and fresh scratch. A code/HTTP bodies protected. Setup/provider held.'
assert b['runtimeRoot']==str(N/'runtime-001') and b['scratchRoot']==str(N/'host-scratch') and b['nativeScratchRoot']==str(S)
for key in ['environment','workerEnvironment']:assert b[key]['BASH_MAX_TIMEOUT_MS']=='300000'
write(N/'BINDING.json',b)
context=[]
for rel in task['readRoots']:
 q=F/rel
 for x in sorted(q.rglob('*')) if q.is_dir() else [q]:
  if x.is_file():context.append(pin(x))
assert len(context)<=32 and sum(x['bytes'] for x in context)<=1048576
source_guard();guard();assert not (F/optional).exists()
write(N/'PREPARATION.json',dict(status='CONTROLS_READY_STATIC_PREFLIGHT_PENDING',sourceSubject=pin(N/'SOURCE_SUBJECT.json'),context=dict(files=len(context),sourceMemberBytes=sum(x['bytes'] for x in context),instructionUtf8Bytes=len(instructions.encode()),sourceContentsInlined=False,renderedBytes='Actual installed renderer measures at future PREPARED; no runtime allocated.'),hostByteIdentical=pin(N/'host.mjs')['sha256']==pin(O/'host.mjs')['sha256'],sourcePreserved=True,optionalModuleAbsent=True,setupProviderHeld=True))
print(json.dumps({n:pin(N/n) for n in ['ROOT_SCOPE.json','TASK.json','BINDING.json','PREPARATION.json','TRACKING.json']}))
