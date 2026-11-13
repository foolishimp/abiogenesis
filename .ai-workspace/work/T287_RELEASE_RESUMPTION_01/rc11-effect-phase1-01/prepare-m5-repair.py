from pathlib import Path
import json, hashlib, os, subprocess, difflib, shutil
C=Path(__file__).parent; OLD=C/'native-02'; N=C/'native-03'
F=Path('/private/tmp/abg-rc11-foundation-20261110-01'); T=Path('build_tenants/abiogenesis/typescript')
R=Path('/Users/jim/src/apps/abiogenesis'); W=R/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01'
I=F/'qualification-inputs/rc11-effect-phase1-01/native-03'; S=F/'qualification-scratch/rc11-effect-phase1-01/native-03'
node='/opt/homebrew/Cellar/node/24.7.0/bin/node'
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def create(p,b):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(b)
def record(p,j):create(p,(json.dumps(j,indent=2)+'\n').encode());return pin(p)
def checked(p):assert pin(p['path'])==p,p['path']
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True).strip()
assert not I.exists() and not S.exists() and not (N/'BINDING.json').exists()
b=json.loads((OLD/'BINDING.json').read_text());source=json.loads((OLD/'source-freeze.json').read_text())
assert source['sourceDigest']=='5eb4b82b5861c25a4df23b6d42444b0ad9240d4fb76e7ac93851d5bbd9074fea' and len(source['rows'])==1344
assert git(F,'rev-parse','HEAD')==b['sourceCommit']
for row in source['rows']:
 p=pin(F/row['path']);assert p['bytes']==row['bytes'] and p['sha256']==row['sha256'],row['path']
review=[pin(C/'review-01/SOURCE_REVIEW.md'),pin(C/'review-01/SOURCE_REVIEW.json')]
assert review[0]['sha256']=='2599ce4606269a626428044284188f7ca65ed052a884859e238ab9bb96d0884b'
assert review[1]['sha256']=='7b5e75cd7ca6b17854cb98ff7e097f12896e04d123a99fcb8f62df48f7c16e2e'
assert json.loads((C/'review-01/SOURCE_REVIEW.json').read_text())['verdict']=='falsified'
manifest=pin(F/'.abiogenesis/workspace-manifest.json');m=json.loads(Path(manifest['path']).read_text())
assert m['canonicalRoot']==str(F) and m['bindingRef'] is None and m['bindingDigest'] is None
compiledPin=pin(W/'rc11-qualification-01/proof-01/reentry-01/COMPILED_BUILD_INVENTORY.json')
assert compiledPin['sha256']=='50adfb6f2ec32aa76e8ce0f378e5430b1f3119284a4d6bf7735b7c1e18eb13db'
compiled=json.loads(Path(compiledPin['path']).read_text());code=[r for r in compiled['rows'] if r['path'].startswith('build/code/src/')]
assert len(code)==580
assert sorted(p.relative_to(F/T).as_posix() for p in (F/T/'build/code/src').rglob('*') if p.is_file())==[r['path'] for r in code]
for r in code:
 p=pin(F/T/r['path']);assert p['bytes']==r['bytes'] and p['sha256']==r['sha256'],r['path']
dep=json.loads(Path(b['dependencyInventory']['path']).read_text());root=F/T/'node_modules';seen=[]
for d,dirs,files in os.walk(root,followlinks=False):
 for name in list(dirs):
  p=Path(d)/name
  if p.is_symlink():seen.append(p.relative_to(root).as_posix());dirs.remove(name)
 seen.extend((Path(d)/name).relative_to(root).as_posix() for name in files)
assert sorted(seen)==sorted(r['path'] for r in dep['rows'])
for r in dep['rows']:
 p=root/r['path']
 if r['kind']=='symlink':assert p.is_symlink() and os.readlink(p)==r['target'] and p.resolve().is_relative_to(root)
 else:
  q=pin(p);assert q['bytes']==r['bytes'] and q['sha256']==r['sha256'],str(p)
effect=json.loads((root/'effect/package.json').read_text());assert effect['version']=='3.22.1'
prebuilt=record(N/'PREBUILT_IDENTITY.json',{'status':'READ_ONLY_COMPILED_OWNER_AND_DEPENDENCY_BYTES_VERIFIED','compiledInventory':compiledPin,'selectedPrefix':'build/code/src/','compiledRowsEqual':580,'sourceRoot':str(F/T),'dependencyInventory':b['dependencyInventory'],'actualDependencyRoot':str(root),'dependencyEntriesEqual':len(dep['rows']),'effectVersion':'3.22.1','effectPackage':pin(root/'effect/package.json'),'privateOwnerHarness':pin(F/T/'test_env/support/r10-private-owner-harness.mjs'),'standing':'No build/test/import executed. Existing compiled production owner closure equals retained RC11 build; all dependency file/link entries equal pinned closure. Contract/manifest authority outputs are outside this code-only comparison.'})
indices=[pin(R/'.git/index'),pin(R/'.git/worktrees/abg-rc11-qualification-20261109/index'),pin(Path(git(F,'rev-parse','--git-path','index')))]
guards=record(N/'PRESERVATION_GUARDS.json',{'indices':indices,'heads':{str(p):git(p,'rev-parse','HEAD') for p in [R,F,Path('/private/tmp/abg-rc11-qualification-20261109')]},'mainTracking':[pin(R/p) for p in ['specification/GOALS.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md']],'builderPin':b['builderPin'],'archive':b['archive'],'sourceFreeze':pin(OLD/'source-freeze.json')})
scope=record(N/'ROOT_SCOPE.json',{'id':'PHASE1-M5-REPAIR-01','status':'ROOT_ADMITTED_NARROW_SOURCE_PREPARATION_AND_GENUINE_OPEN_SETUP_PROVIDER_HELD','ownerApproval':'approved go','rootSelection':'One m5 test successor repairs PHASE1-PROOF-001 S2 completion timestamp partition dependence and PHASE1-PROOF-002 S3 controlled driver failure trace loss. This is the selected realization_refactor under approved plan1B, not a repeat of the unchanged broad author task.','review':review,'predecessorReturn':pin(OLD/'RETURN.json'),'sourceFreeze':pin(OLD/'source-freeze.json'),'sourceDigest':source['sourceDigest'],'sourceCommit':b['sourceCommit'],'basis':{'priorScope':b['activation'],'stdo':'stdo://releases/v3.0.4/','definition':pin(F/'stdo_abiogenesis.json'),'frame':pin(F/T/'design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md')},'writeRoots':[str(T/'test_env/tests/m5-worker-transport.test.mjs'),str(S.relative_to(F))],'native':{'model':'claude-opus-5-5','effort':'xhigh','absoluteTimeoutMs':600000,'inactivityTimeoutMs':180000,'maxTurns':100},'cheapChecks':'One-file syntax and one exact real-owner controlled m5 group, bounded60s on verified readonly prebuilt owners. No full physical/m5/lifetime/unit/build/provider nesting.','operatorRole':'Writer/Operator controls/setup only; native Worker alone edits the one test.','standing':'Both original debts and qualification remain open. Prior native timeout, reds, controls and accepted cuts remain immutable. No observer/production/dependency/Git changes. Ordinary compatible control/path fixes remain admitted; material new contradiction returns to Root.'})
I.mkdir(parents=True)
for name,p in {'ROOT_SCOPE.json':N/'ROOT_SCOPE.json','SOURCE_REVIEW.md':C/'review-01/SOURCE_REVIEW.md','SOURCE_REVIEW.json':C/'review-01/SOURCE_REVIEW.json','PREBUILT_IDENTITY.json':N/'PREBUILT_IDENTITY.json'}.items():create(I/name,p.read_bytes())
sourceText=(F/T/'test_env/tests/m5-worker-transport.test.mjs').read_text().splitlines(keepends=True)
record(I/'EXACT_SOURCE_ROUTES.json',{'source':pin(F/T/'test_env/tests/m5-worker-transport.test.mjs'),'excerpts':[{'lines':[a,z],'text':''.join(sourceText[a-1:z])} for a,z in [(716,724),(746,885),(1000,1023)]],'meaning':'Pointers and exact source excerpts only; review supplies the required relations. No production owner API discovery required.'})
record(I/'EXTERNAL_TOOLS.json',{'node':pin(node),'readOnlyEvaluationClosure':[str(root),str(F/T/'build/code/src')],'prebuiltIdentity':prebuilt,'allowedExecution':['Pinned Node --check test_env/tests/m5-worker-transport.test.mjs','Exactly one Node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap --test-timeout=60000 --test-name-pattern=^M5 actual owner, controlled clock: test_env/tests/m5-worker-transport.test.mjs; wrap subprocess.run with timeout60, logs under granted scratch. No GNU timeout utility is installed.'],'controlledSelfCheckMaximumSeconds':60,'scratch':str(S),'prohibition':'No build, full physical file/unit, generator, runtime/provider nesting or dependency writes. Internal controlled fake ChildProcess schedules exercise real compiled owners without launching physical fixtures.','evidenceOutput':'Create one scratch evidence directory and set ABI5_TEST_EVIDENCE_DIR to it for the cheap controlled check; retain stdout/stderr and actual return without deletion.'})
draft=json.loads((N/'TASK.DRAFT.r02.json').read_text())
instructions=draft['instructions'][0]+'''\n\nThe final independent review is closed and copied in SOURCE_REVIEW.md/json. Implement both required relations and their finite discriminators in this one call. In particular, the SAME completion-time relation used by the physical test must consume intact/coalesced completion, split completion at each relevant boundary, and incomplete/missing completion; preserve the timestamp at which the ordered complete record actually became available. Never substitute owner duration/default time. The controlled failure discriminator must observe the exact original thrown identity and available causal facts without waiting on an unresolved owner or claiming close. Inspect only relevant current sections and the small helper contract; no broad repository scan or setup API work. Native02's four source files and failed Run remain predecessor history. The other three source files are read-only.\n\nUse Node with --experimental-vm-modules for the controlled privateOwner seam. The exact selected prefix is `^M5 actual owner, controlled clock:`; put --test-name-pattern before the test path and explicit TAP. Use Python subprocess.run(timeout=60) to bound this one selfcheck, with all logs/evidence under granted scratch; no missing GNU timeout tool. Syntax is allowed before/after the selected edit. If an unrelated real owner contradiction occurs, preserve facts and return rather than weaken an assertion. Finish a concise result even when a broader obligation remains unexecuted. No Git commands or tracking edits. No new helper/module/API approval gate.'''
readRoots=['AGENTS.md','stdo_abiogenesis.json',str(I.relative_to(F)),str(T/'test_env/tests/m5-worker-transport.test.mjs'),str(T/'test_env/support/t287-publication-observer.mjs'),str(T/'test_env/support/r10-private-owner-harness.mjs'),str(T/'package.json')]
task={'id':'t287-effect-phase1-m5-repair-03','status':'READY_FOR_ADMITTED_NARROW_NATIVE_SOURCE_AUTHOR','outcome':draft['outcome'],'readRoots':readRoots,'maxContextFiles':30,'maxContextBytes':2*1024**2,'maxPromptBytes':1024**2,'readFirst':[str(I.relative_to(F)/p) for p in ['ROOT_SCOPE.json','SOURCE_REVIEW.json','EXACT_SOURCE_ROUTES.json','EXTERNAL_TOOLS.json']]+[str(T/'test_env/tests/m5-worker-transport.test.mjs'),str(T/'test_env/support/t287-publication-observer.mjs')],'writeRoots':[str(T/'test_env/tests/m5-worker-transport.test.mjs'),str(S.relative_to(F))],'checks':['One-file syntax','One real-owner controlled M5 group only,60s, explicit TAP and retained evidence','Report actual changed relation/check counts/gaps; no full file or source acceptance'],'instructions':[instructions]}
taskPin=record(N/'TASK.json',task)
host=(OLD/'host.mjs').read_text()
new=host.replace("await checkSource();\nconst setupOwner=", "await checkSource();for(const p of binding.prebuiltPins??[])await pinned(p);\nconst setupOwner=")
new=new.replace("for(const p of admission.files??[])await pinned(p);await checkSource();await validateTransport(binding);", "for(const p of admission.files??[])await pinned(p);await checkSource();for(const p of binding.prebuiltPins??[])await pinned(p);await validateTransport(binding);")
assert new!=host
create(N/'host.mjs',new.encode());create(N/'HOST_DELTA.diff',''.join(difflib.unified_diff(host.splitlines(keepends=True),new.splitlines(keepends=True),fromfile=str(OLD/'host.mjs'),tofile=str(N/'host.mjs'))).encode())
for name in ['transport-preflight.mjs','claude-provider.sh','npm-user.npmrc','npm-global.npmrc']:create(N/name,(OLD/name).read_bytes())
os.chmod(N/'claude-provider.sh',0o755)
selectedCompiled=['abg/worker_transport.js','abg/transport_contracts.js','shared/owned_process_lifetime.js','shared/effect_definition.js']
selectedEffect=['package.json','dist/esm/index.js','dist/esm/Effect.js','dist/esm/Deferred.js','dist/esm/Ref.js','dist/esm/Fiber.js']
b.update({'id':'t287-effect-phase1-m5-repair-03','activation':scope,'scopeInputGrant':scope,'task':taskPin,'sourceInventory':pin(OLD/'source-freeze.json'),'sourceMaterialization':pin(OLD/'SOURCE_CUSTODY.json'),'runtimeRoot':str(N/'runtime-001'),'scratchRoot':str(N/'host-scratch'),'nativeScratchRoot':str(S),'nativeScratchDirectories':[str(S),str(S/'tmp'),str(S/'npm-cache')],'readOnlyInputPins':[pin(p) for p in sorted(I.iterdir())],'workspaceOpenManifest':manifest,'expectedWorkspaceAuthority':{'ref':m['authorityBasis']['authorityRef'],'digest':m['authorityBasis']['authorityDigest']},'sourceSelection':'Exactly one m5 test path plus native-03 scratch; both closed review findings, no observer/production/dependency edits','setupEffectsAwaitingAdmission':['Root admitted fresh actual open.open/resource/context/native-call construction; paid dispatch held.'],'prebuiltPins':[pin(F/T/'build/code/src'/p) for p in selectedCompiled]+[pin(root/'effect'/p) for p in selectedEffect]+[pin(F/T/'test_env/support/r10-private-owner-harness.mjs')],'prebuiltIdentity':prebuilt,'preservationGuards':guards})
for target,scratch in [('environment',N/'host-scratch'),('workerEnvironment',S)]:b[target].update({'TMPDIR':str(scratch/'tmp'),'TMPPREFIX':str(scratch/'tmp/zsh'),'NPM_CONFIG_CACHE':str(scratch/'npm-cache'),'NPM_CONFIG_USERCONFIG':str(N/'npm-user.npmrc'),'NPM_CONFIG_GLOBALCONFIG':str(N/'npm-global.npmrc')})
b['provider'].update({'command':str(N/'claude-provider.sh'),'absoluteTimeoutMs':600000,'inactivityTimeoutMs':180000,'maxTurns':100});b['providerWrapper']=pin(N/'claude-provider.sh');b['transportContract'].update({'absoluteTimeoutMs':600000,'inactivityTimeoutMs':180000,'maxTurns':100})
b['proofControls']=[pin(N/p) for p in ['transport-preflight.mjs','npm-user.npmrc','npm-global.npmrc']]+[prebuilt,guards]
for p in [b['builderPin'],b['archive'],b['providerExecutable'],*b['dependencyPins'],*b['prebuiltPins']]:checked(p)
binding=record(N/'BINDING.json',b);syntax=[]
for name in ['host.mjs','transport-preflight.mjs']:
 result=subprocess.run([node,'--check',str(N/name)],capture_output=True);assert result.returncode==0,result.stderr;syntax.append({'file':pin(N/name),'exitCode':0})
js="import{readFileSync}from'node:fs';import{validateTransport}from'"+(N/'transport-preflight.mjs').as_uri()+"';console.log(JSON.stringify(await validateTransport(JSON.parse(readFileSync(process.argv[1]))),null,2))"
result=subprocess.run([node,'--input-type=module','-e',js,str(N/'BINDING.json')],capture_output=True);assert result.returncode==0,result.stderr;create(N/'TRANSPORT_PREFLIGHT.json',result.stdout)
members=[]
for rel in readRoots:
 p=F/rel
 members.extend([p] if p.is_file() else [x for x in p.rglob('*') if x.is_file()])
members=set(members);assert len(members)<30
ready=record(N/'READY.json',{'status':'NARROW_M5_GENUINE_OPEN_SETUP_READY_PROVIDER_HELD','scope':scope,'review':review,'task':taskPin,'binding':binding,'host':pin(N/'host.mjs'),'hostDelta':pin(N/'HOST_DELTA.diff'),'transportPreflight':pin(N/'TRANSPORT_PREFLIGHT.json'),'prebuiltIdentity':prebuilt,'preservationGuards':guards,'syntax':syntax,'context':{'fileMembers':len(members),'sourceMemberBytes':sum(p.stat().st_size for p in members),'instructionUtf8Bytes':len(instructions.encode()),'sourceContentsInlined':False,'renderedBytes':'Actual installed renderer measured at PREPARED'},'sourceInventory':pin(OLD/'source-freeze.json'),'sourceDigest':source['sourceDigest'],'workspaceManifest':manifest,'runtimeRoot':b['runtimeRoot'],'setupBudgetMs':900000,'setupPerCommandMs':300000,'nativeCeilingMs':600000,'nativeInactivityMs':180000,'maxTurns':100,'reserveBytes':4*1024**3,'freeBytes':shutil.disk_usage(F).free,'providerExecutable':b['providerExecutable'],'outputControls':'Existing canonical RC10 transport and native stream artifacts; native600s, cheapcheck60s, no changed transport limits. Actual transport declaration is recorded by the genuine call.'})
admission=record(N/'ROOT_SETUP_ADMISSION.json',{'id':'PHASE1-M5-REPAIR-SETUP-03','status':'ROOT_ADMITTED_PHASE1_SETUP','basis':'Root PHASE1-M5-REPAIR-01 expressly admits preparation and genuine RC10 Public open/context/native-call construction; final closed two-finding review pins consumed. Paid provider remains held.','bindingSha256':binding['sha256'],'scopeSha256':scope['sha256'],'grantsFreshPublicSetup':True,'providerDispatch':False,'ready':ready,'files':[pin(N/'host.mjs'),pin(N/'transport-preflight.mjs'),pin(N/'TRANSPORT_PREFLIGHT.json'),pin(node),*review,manifest,prebuilt,guards,*b['prebuiltPins']],'setupBudgetMs':900000,'setupPerCommandMs':300000,'reserveBytes':4*1024**3})
argv=[node,str(N/'host.mjs'),binding['path'],binding['sha256'],admission['path'],admission['sha256']]
record(N/'LAUNCH.json',{'argv':argv,'tty':True,'cwd':str(F),'ready':ready,'setupAdmission':admission})
for p in indices:checked(p)
print(json.dumps({'ready':ready,'binding':binding,'task':taskPin,'host':pin(N/'host.mjs'),'argv':argv},indent=2))
